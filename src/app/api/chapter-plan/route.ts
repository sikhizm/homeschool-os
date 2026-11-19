import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {isDefaultChapterSessionEligible, ncertChapterSlots, textbookById} from '@/lib/ncert/textbooks';
import {activityLabels, type ChapterPlanItem} from '@/lib/planning/chapter-activities';
import {addDays, mondayOf, validPlanningDate} from '@/lib/planning/periods';

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
    const requestedLearner = params.get('learnerId');
    if (!validPlanningDate(anchor)) return json({error: 'Choose a valid date.'}, 400);
    const week = mondayOf(anchor);
    const [schema] = await sql`SELECT to_regclass('public.chapter_plan_activities') IS NOT NULL AS ready,
      to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS outcomes,
      to_regclass('public.ncert_chapter_progress') IS NOT NULL AS progress,
      to_regclass('public.ncert_test_assessments') IS NOT NULL AND to_regclass('public.ncert_test_attempts') IS NOT NULL AS tests`;
    const learners = await sql`SELECT id::text AS id, display_name AS name FROM learners
      WHERE family_id::text = ${familyId} AND archived_at IS NULL ORDER BY created_at, id`;
    const ids = learners.map(row => String(row.id)).filter(id => !requestedLearner || id === requestedLearner);
    if (requestedLearner && !ids.length) return json({error: 'Learner unavailable.'}, 404);
    if (!schema.ready || !ids.length) return json({ready: Boolean(schema.ready), learners, canEdit, items: []});
    const [planned, progress, tests, weeklyReads] = await Promise.all([
      sql`SELECT learner_id::text, chapter_id, activity, period, starts_on::text FROM chapter_plan_activities
        WHERE learner_id::text = ANY(${ids}::text[]) AND
          ((period = 'day' AND starts_on BETWEEN ${requestedLearner ? week : day}::date AND ${requestedLearner ? addDays(week, 6) : day}::date) OR (period = 'week' AND starts_on = ${week}::date))
        ORDER BY learner_id, chapter_id, CASE activity WHEN 'reading' THEN 0 WHEN 'revision' THEN 1 ELSE 2 END`,
      schema.progress ? sql`SELECT learner_id::text, chapter_id, status,
        (completed_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_on,
        (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS updated_on
        FROM ncert_chapter_progress WHERE learner_id::text = ANY(${ids}::text[])` : [],
      schema.tests ? sql`SELECT a.learner_id::text, a.chapter_id, t.test_date::text AS tested_on
        FROM ncert_test_assessments a JOIN ncert_test_attempts t ON a.id = t.assessment_id
        WHERE a.learner_id::text = ANY(${ids}::text[]) AND t.test_date BETWEEN ${week}::date AND ${requestedLearner ? addDays(week, 6) : day}::date
        ` : [],
      schema.outcomes ? sql`SELECT learner_id::text, chapter_id, (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_on
        FROM ncert_weekly_chapter_outcomes WHERE learner_id::text = ANY(${ids}::text[]) AND week_start = ${week}::date
          AND outcome IN ('done', 'understood')` : [],
    ]);
    const key = (learnerId: unknown, chapterId: unknown) => `${learnerId}:${chapterId}`;
    const progressByChapter = new Map(progress.map(row => [key(row.learner_id, row.chapter_id), row]));
    const testByChapter = new Map<string, string[]>();
    for (const row of tests) {
      const id = key(row.learner_id, row.chapter_id);
      const dates = testByChapter.get(id) ?? [];
      dates.push(String(row.tested_on));
      testByChapter.set(id, dates);
    }
    const weeklyReadByChapter = new Map(weeklyReads.map(row => [key(row.learner_id, row.chapter_id), row.read_on]));
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
        : [saved?.status === 'completed' ? saved.updated_on : saved?.read_on, weeklyReadByChapter.get(id)];
      return [{
        chapterId: chapter.id, learnerId: String(learner.id), learnerName: String(learner.name),
        title: chapter.verifiedTitle ?? chapter.label, activity, period: row.period as ChapterPlanItem['period'],
        startsOn: String(row.starts_on),
        done: completedOn.some(value => typeof value === 'string' && value >= row.starts_on && value <= day &&
          value <= (row.period === 'day' ? row.starts_on : addDays(String(row.starts_on), 6))),
        inToday: inToday.has(`${key(row.learner_id, row.chapter_id)}:${activity}`),
      }];
    });
    return json({ready: true, learners, canEdit, items});
  } catch {
    return json({error: 'Unable to load planned chapter activities.'}, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error: 'Same-origin request required.'}, 403);
  try {
    const member = await scope();
    if (!member?.canEdit) return json({error: 'Family owner access required.'}, 403);
    const input = await request.json();
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
          AND p.period = 'day' AND p.starts_on = ${source}::date RETURNING p.chapter_id
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
