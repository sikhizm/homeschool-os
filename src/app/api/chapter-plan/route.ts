import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {isDefaultChapterSessionEligible, ncertChapterSlots, textbookById} from '@/lib/ncert/textbooks';
import {activityLabels, type ChapterPlanItem} from '@/lib/planning/chapter-activities';
import {passingChapters} from '@/lib/ncert/passing-chapters';
import {normalizeChapterStatus} from '@/lib/ncert/chapter-status';
import {isTeachingDay, readingTiming} from '@/lib/planning/reading-rhythm';
import {addDays, mondayOf, periodDates, validPlanningDate} from '@/lib/planning/periods';

const catalogue = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));
const activities = Object.keys(activityLabels);
const today = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(new Date());
const json = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control': 'private, no-store'}});
async function scope() {
  const {data: session} = await auth.getSession();
  if (!session?.user) return null;
  const sql = getSql();
  const [family] = await sql`SELECT family_id, role FROM family_members WHERE auth_user_id = ${session.user.id}
    ORDER BY created_at, family_id LIMIT 1`;
  return family ? {sql, familyId: String(family.family_id), canEdit: family.role === 'owner'} : null;
}

export async function GET(request: Request) {
  try {
    const member = await scope();
    if (!member) return json({error: 'Family sign-in required.'}, 401);
    const {sql, familyId, canEdit} = member;
    const params = new URL(request.url).searchParams;
    const day = today(), anchor = params.get('date') ?? day;
    const rhythm = params.get('rhythm') === '1' && anchor === day;
    const requestedLearner = params.get('learnerId');
    if (!validPlanningDate(anchor)) return json({error: 'Choose a valid date.'}, 400);
    const week = mondayOf(anchor);
    const includeCarryover = Boolean(requestedLearner) && week === mondayOf(day);
    const [schema] = await sql`SELECT to_regclass('public.chapter_plan_activities') IS NOT NULL AS ready,
      to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS outcomes,
      to_regclass('public.ncert_chapter_progress') IS NOT NULL AS progress,
      to_regclass('public.ncert_test_assessments') IS NOT NULL AND to_regclass('public.ncert_test_attempts') IS NOT NULL AS tests`;
    const learners = await sql`SELECT id::text AS id, display_name AS name FROM learners
      WHERE family_id::text = ${familyId} AND archived_at IS NULL ORDER BY created_at, id`;
    const ids = learners.map(row => String(row.id)).filter(id => !requestedLearner || id === requestedLearner);
    if (requestedLearner && !ids.length) return json({error: 'Learner unavailable.'}, 404);
    if (!schema.ready || !ids.length) return json({ready: Boolean(schema.ready), learners, canEdit, items: []});
    const [planned, progress, tests, weeklyReads, yearPlans, passedChapters] = await Promise.all([
      sql`SELECT p.learner_id::text, p.chapter_id, p.activity, p.period, p.starts_on::text,
        to_jsonb(p)->>'completed_on' AS completed_on,
        (to_jsonb(p)->>'optional_test')::boolean AS optional_test FROM chapter_plan_activities p
        WHERE learner_id::text = ANY(${ids}::text[]) AND
          (( (${rhythm} OR ${includeCarryover}) AND activity = 'reading' AND starts_on <= ${day}::date) OR (period = 'day' AND starts_on BETWEEN ${requestedLearner ? week : day}::date AND ${requestedLearner ? addDays(week, 6) : day}::date) OR (period = 'week' AND starts_on = ${week}::date))
        ORDER BY learner_id, chapter_id, CASE activity WHEN 'reading' THEN 0 WHEN 'revision' THEN 1 ELSE 2 END`,
      schema.progress ? sql`SELECT learner_id::text, chapter_id, status,
        (completed_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_on,
        (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS updated_on
        FROM ncert_chapter_progress WHERE learner_id::text = ANY(${ids}::text[])` : [],
      schema.tests ? sql`SELECT a.learner_id::text, a.chapter_id, t.test_date::text AS tested_on, t.obtained_marks * 5 >= t.total_marks * 3 AS passed
        FROM ncert_test_assessments a JOIN ncert_test_attempts t ON a.id = t.assessment_id
        WHERE a.learner_id::text = ANY(${ids}::text[]) AND t.test_date BETWEEN ${rhythm ? periodDates('year', day).startDate : week}::date AND ${requestedLearner ? addDays(week, 6) : day}::date
        ORDER BY t.test_date DESC, t.created_at DESC, t.id DESC
        ` : [],
      schema.outcomes ? sql`SELECT learner_id::text, chapter_id, (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_on
        FROM ncert_weekly_chapter_outcomes WHERE learner_id::text = ANY(${ids}::text[]) AND (${rhythm} OR ${includeCarryover} OR week_start = ${week}::date)
          AND outcome IN ('done', 'understood')` : [],
      rhythm ? sql`SELECT learner_id::text, chapter_ids FROM learning_planning_periods
        WHERE learner_id::text = ANY(${ids}::text[]) AND kind = 'year'
          AND start_date = ${periodDates('year', day).startDate}::date`.catch(error => {
          if ((error as {code?: string}).code === '42P01') return [];
          throw error;
        }) : [],
      rhythm && schema.tests ? passingChapters(sql, ids) : [],
    ]);
    const key = (learnerId: unknown, chapterId: unknown) => `${learnerId}:${chapterId}`;
    const progressByChapter = new Map(progress.map(row => [key(row.learner_id, row.chapter_id), row]));
    const testByChapter = new Map<string, string[]>();
    const latestTest = new Map<string, (typeof tests)[number]>();
    for (const row of tests) {
      const id = key(row.learner_id, row.chapter_id);
      const dates = testByChapter.get(id) ?? [];
      dates.push(String(row.tested_on));
      if (!latestTest.has(id)) latestTest.set(id, row);
      testByChapter.set(id, dates);
    }
    const weeklyReadByChapter = new Map<string, unknown[]>();
    for (const row of weeklyReads) {
      const id = key(row.learner_id, row.chapter_id);
      const dates = weeklyReadByChapter.get(id) ?? [];
      dates.push(row.read_on);
      weeklyReadByChapter.set(id, dates);
    }
    const inToday = new Set(planned.filter(row => row.period === 'day' && row.starts_on === day).map(row => `${key(row.learner_id, row.chapter_id)}:${row.activity}`));
    const items: ChapterPlanItem[] = planned.flatMap(row => {
      const chapter = catalogue.get(String(row.chapter_id));
      const learner = learners.find(item => item.id === row.learner_id);
      if (!chapter || !learner) return [];
      const activity = row.activity as ChapterPlanItem['activity'];
      const saved = progressByChapter.get(key(row.learner_id, row.chapter_id));
      const id = key(row.learner_id, row.chapter_id);
      const completedOn = activity === 'test' ? testByChapter.get(id) ?? [] : activity === 'revision'
        ? [saved?.status === 'revised' ? saved.updated_on : null]
        : [row.completed_on, saved?.status !== 'pending' ? saved?.read_on : null, ...(weeklyReadByChapter.get(id) ?? [])];
      const startsOn = String(row.starts_on);
      const dueOn = row.period === 'day' ? startsOn : addDays(startsOn, 6);
      const timing = readingTiming(startsOn, dueOn, day, completedOn);
      return [{
        chapterId: chapter.id, learnerId: String(learner.id), learnerName: String(learner.name),
        title: chapter.verifiedTitle ?? chapter.label, activity, period: row.period as ChapterPlanItem['period'],
        startsOn, ...timing, optionalTest: row.optional_test === true,
        done: activity === 'reading' ? timing.completedOn !== null : timing.onTime,
        inToday: inToday.has(`${key(row.learner_id, row.chapter_id)}:${activity}`),
      }];
    });
    if (!rhythm) return json({ready: true, learners, canEdit, items: items.filter(item =>
      !includeCarryover || item.startsOn >= week || !item.done || (item.completedOn ?? '') >= week)});
    const reading = items.filter(item => item.activity === 'reading' && item.period === 'day');
    const currentWeek = reading.filter(item => item.startsOn >= week);
    const readingWeek = learners.map(learner => {
      const mine = currentWeek.filter(item => item.learnerId === learner.id);
      return {id: String(learner.id), name: String(learner.name), planned: mine.length, onTime: mine.filter(item => item.onTime).length,
        late: mine.filter(item => item.done && !item.onTime).length};
    }).filter(item => item.planned > 0);
    const visible = items.filter(item => item.period === 'day' && item.startsOn === day ||
      item.activity === 'reading' && item.startsOn < day &&
      (item.completedOn === day || (isTeachingDay(day) && !item.done &&
        (item.period === 'day' || item.startsOn < week))));
    const deduped = new Map<string, ChapterPlanItem>();
    for (const item of visible) {
      const id = `${key(item.learnerId, item.chapterId)}:${item.activity}`;
      const previous = deduped.get(id);
      if (!previous || (item.done && !previous.done) || (item.done === previous.done && item.startsOn < previous.startsOn)) {
        deduped.set(id, item);
      }
    }
    const weekendSuggestions = isTeachingDay(day) ? [] : learners.flatMap(learner =>
      progress.filter(row => row.learner_id === learner.id && typeof row.read_on === 'string' && row.read_on <= day)
        .flatMap(row => {
          const id = key(learner.id, row.chapter_id);
          const test = latestTest.get(id);
          const activity = row.status === 'needs_practice' || row.status === 'revision_due' ||
            (test?.passed === false && !(row.status === 'revised' && row.updated_on > test.tested_on)) ? 'revision' : null;
          const chapter = catalogue.get(String(row.chapter_id));
          return chapter && activity && !deduped.has(`${id}:${activity}`) ? [{
            chapterId: chapter.id, learnerId: String(learner.id), learnerName: String(learner.name),
            title: chapter.verifiedTitle ?? chapter.label, activity,
          }] : [];
        }).sort((a, b) => a.activity.localeCompare(b.activity) || a.title.localeCompare(b.title)).slice(0, 2));
    const passed = new Set(passedChapters.map(row => key(row.learner_id, row.chapter_id)));
    const chapterCoverage = schema.progress ? yearPlans.map(row => {
      const learnerId = String(row.learner_id);
      const chapters = [...new Set(Array.isArray(row.chapter_ids) ? row.chapter_ids.map(String) : [])];
      const records = chapters.map(chapterId => progressByChapter.get(key(learnerId, chapterId)));
      return {
        learnerId,
        total: chapters.length,
        read: records.filter(record => Boolean(record?.read_on) || normalizeChapterStatus(record?.status) === 'read').length,
        revised: records.filter(record => normalizeChapterStatus(record?.status) === 'revised').length,
        finished: chapters.filter(chapterId => passed.has(key(learnerId, chapterId))).length,
      };
    }) : null;
    return json({ready: true, learners, canEdit, items: [...deduped.values()], readingWeek, weekendSuggestions, chapterCoverage});
  } catch {
    return json({error: 'Unable to load planned chapter activities.'}, 503);
  }
}

async function scheduleReading(sql: ReturnType<typeof getSql>, familyId: string, day: string) {
  if (!isTeachingDay(day)) return;
  const week = mondayOf(day);
  const year = periodDates('year', day).startDate;
  await sql`
    WITH family_learners AS (
      SELECT id FROM learners WHERE family_id::text = ${familyId} AND archived_at IS NULL
    ), read_dates AS (
      SELECT p.learner_id, p.chapter_id, (p.completed_at AT TIME ZONE 'Asia/Kolkata')::date AS read_on
      FROM ncert_chapter_progress p JOIN family_learners l ON l.id = p.learner_id
      WHERE p.status <> 'pending' AND p.completed_at IS NOT NULL
      UNION ALL
      SELECT p.learner_id, p.chapter_id, (p.updated_at AT TIME ZONE 'Asia/Kolkata')::date
      FROM ncert_weekly_chapter_outcomes p JOIN family_learners l ON l.id = p.learner_id
      WHERE p.outcome IN ('done', 'understood')
    ), eligible AS (
      SELECT a.learner_id, a.chapter_id, 0 AS priority, 0 AS position
      FROM chapter_plan_activities a JOIN family_learners l ON l.id = a.learner_id
      WHERE a.activity = 'reading' AND a.period = 'week' AND a.starts_on = ${week}::date
        AND to_jsonb(a)->>'completed_on' IS NULL
      UNION ALL
      SELECT p.learner_id, selected.chapter_id, CASE WHEN p.kind = 'week' THEN 1 ELSE 2 END, selected.position
      FROM learning_planning_periods p JOIN family_learners l ON l.id = p.learner_id
      CROSS JOIN LATERAL unnest(p.chapter_ids) WITH ORDINALITY AS selected(chapter_id, position)
      WHERE ((p.kind = 'week' AND p.start_date = ${week}::date) OR
        (p.kind = 'year' AND p.start_date = ${year}::date))
    ), candidate AS (
      SELECT DISTINCT ON (p.learner_id) p.learner_id, p.chapter_id
      FROM eligible p
      WHERE NOT EXISTS (SELECT 1 FROM read_dates r WHERE r.learner_id = p.learner_id
          AND r.chapter_id = p.chapter_id AND r.read_on <= ${day}::date
          AND (p.priority > 0 OR r.read_on >= ${week}::date))
        AND NOT EXISTS (
          SELECT 1 FROM chapter_plan_activities a
          WHERE a.learner_id = p.learner_id AND a.activity = 'reading' AND a.starts_on <= ${day}::date
            AND ((a.period = 'day' AND a.starts_on = ${day}::date) OR
              ((a.period = 'day' OR a.starts_on < ${week}::date) AND (
                to_jsonb(a)->>'completed_on' = ${day} OR
                (to_jsonb(a)->>'completed_on' IS NULL AND NOT EXISTS (
                  SELECT 1 FROM read_dates r WHERE r.learner_id = a.learner_id AND r.chapter_id = a.chapter_id
                    AND r.read_on BETWEEN a.starts_on AND (${day}::date - 1)
                ))
              ))
            )
        )
      ORDER BY p.learner_id, p.priority, p.position, p.chapter_id
    )
    INSERT INTO chapter_plan_activities (learner_id, chapter_id, activity, period, starts_on)
    SELECT learner_id, chapter_id, 'reading', 'day', ${day}::date FROM candidate
    ON CONFLICT DO NOTHING
  `;
}

async function scheduleSundayTests(sql: ReturnType<typeof getSql>, familyId: string, day: string) {
  const monday = mondayOf(day);
  if (day !== addDays(monday, 6)) return;
  const friday = addDays(monday, 4);
  const [schema] = await sql`
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'chapter_plan_activities' AND column_name = 'optional_test') AS ready
  `;
  if (!schema?.ready) return;
  await sql`
    INSERT INTO chapter_plan_activities (learner_id, chapter_id, activity, period, starts_on, optional_test)
    SELECT p.learner_id, p.chapter_id, 'test', 'day', ${day}::date, true
    FROM ncert_chapter_progress p JOIN learners l ON l.id = p.learner_id
    WHERE l.family_id::text = ${familyId} AND l.archived_at IS NULL AND p.status = 'revised'
      AND (p.completed_at AT TIME ZONE 'Asia/Kolkata')::date BETWEEN ${monday}::date AND p.revised_on
      AND p.revised_on <= ${friday}::date
      AND NOT EXISTS (
        SELECT 1 FROM chapter_plan_activities scheduled
        WHERE scheduled.learner_id = p.learner_id AND scheduled.chapter_id = p.chapter_id
          AND scheduled.activity = 'test' AND scheduled.starts_on BETWEEN ${monday}::date AND ${day}::date
      )
      AND NOT EXISTS (
        SELECT 1 FROM ncert_test_assessments a JOIN ncert_test_attempts t ON t.assessment_id = a.id
        WHERE a.learner_id = p.learner_id AND a.chapter_id = p.chapter_id
          AND t.test_date BETWEEN (p.completed_at AT TIME ZONE 'Asia/Kolkata')::date AND ${day}::date
      )
    ON CONFLICT DO NOTHING
  `;
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error: 'Same-origin request required.'}, 403);
  try {
    const member = await scope();
    if (!member?.canEdit) return json({error: 'Family owner access required.'}, 403);
    const input = await request.json();
    if (input?.action === 'schedule-reading') {
      const day = today();
      if (isTeachingDay(day)) await scheduleReading(member.sql, member.familyId, day);
      else await scheduleSundayTests(member.sql, member.familyId, day);
      return json({saved: true});
    }
    const {learnerId, chapterId, period, activity, date, action, fromDate} = input ?? {};
    if (typeof learnerId !== 'string' || learnerId.length > 100 || typeof chapterId !== 'string' || !catalogue.has(chapterId) ||
      (period !== 'day' && period !== 'week') || (!['all', 'reading-revision'].includes(activity) && !activities.includes(activity))) {
      return json({error: 'Choose a learner, chapter, plan and activity.'}, 400);
    }
    const {sql, familyId} = member;
    const day = today();
    const anchor = date ?? day;
    if (!validPlanningDate(anchor)) return json({error: 'Choose a valid date.'}, 400);
    const startsOn = period === 'day' ? anchor : mondayOf(anchor);
    if (action === 'remove' || action === 'move') {
      if (!activities.includes(activity) || !validPlanningDate(fromDate) || (action === 'move' && period !== 'day'))
        return json({error: 'Choose a valid activity and date.'}, 400);
      const source = period === 'day' ? fromDate : mondayOf(fromDate);
      const rows = action === 'remove' ? await sql`
        DELETE FROM chapter_plan_activities p USING learners l
        WHERE p.learner_id = l.id AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
          AND l.id::text = ${learnerId} AND p.chapter_id = ${chapterId} AND p.activity = ${activity}
          AND p.period = ${period} AND p.starts_on = ${source}::date RETURNING p.chapter_id
      ` : await sql`
        UPDATE chapter_plan_activities p SET starts_on = ${startsOn}::date FROM learners l
        WHERE p.learner_id = l.id AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
          AND l.id::text = ${learnerId} AND p.chapter_id = ${chapterId} AND p.activity = ${activity}
          AND p.period = 'day' AND p.starts_on = ${source}::date
          AND to_jsonb(p)->>'completed_on' IS NULL RETURNING p.chapter_id
      `;
      return rows.length ? json({saved: true}) : json({error: 'This activity is no longer in that plan.'}, 404);
    }
    if (action !== undefined) return json({error: 'Unknown plan action.'}, 400);
    const selected = activity === 'all' ? activities : activity === 'reading-revision' ? ['reading', 'revision'] : [activity];
    const chapter = catalogue.get(chapterId)!;
    const grade = textbookById(chapter.bookId)?.grade ?? 0;
    if (selected.includes('revision') && (!chapter.verifiedTitle || !isDefaultChapterSessionEligible(chapter) || grade < 1 || grade > 10)) {
      return json({error: 'Revision materials are unavailable for this chapter. Choose Reading or Test.'}, 400);
    }
    const rows = await sql`
      WITH learner AS (
        SELECT id FROM learners WHERE family_id::text = ${familyId} AND id::text = ${learnerId} AND archived_at IS NULL
      ), added AS (
        INSERT INTO chapter_plan_activities (learner_id, chapter_id, activity, period, starts_on)
        SELECT learner.id, ${chapterId}, activity, ${period}, ${startsOn}::date
        FROM learner CROSS JOIN unnest(${selected}::text[]) AS chosen(activity)
        WHERE true ON CONFLICT DO NOTHING RETURNING learner_id
      )
      SELECT id FROM learner`;
    return rows.length ? json({saved: true}) : json({error: 'Learner unavailable.'}, 404);
  } catch (error) {
    const code = (error as {code?: string})?.code;
    if (code === '23505') return json({error: 'That activity is already scheduled on the destination date.'}, 409);
    return json({error: code === '42P01' ? 'Chapter plan storage is unavailable.' : 'Unable to save the activity. Try again.'}, 503);
  }
}
