import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {isDefaultChapterSessionEligible, ncertChapterSlots, textbookById} from '@/lib/ncert/textbooks';
import {activityLabels, type ChapterPlanItem} from '@/lib/planning/chapter-activities';
import {mondayOf} from '@/lib/planning/periods';

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

export async function GET() {
  try {
    const member = await scope();
    if (!member) return json({error: 'Family sign-in required.'}, 401);
    const {sql, familyId, canEdit} = member;
    const day = today(), week = mondayOf(day);
    const [schema] = await sql`SELECT to_regclass('public.chapter_plan_activities') IS NOT NULL AS ready,
      to_regclass('public.ncert_chapter_progress') IS NOT NULL AS progress,
      to_regclass('public.ncert_test_assessments') IS NOT NULL AND to_regclass('public.ncert_test_attempts') IS NOT NULL AS tests`;
    const learners = await sql`SELECT id::text AS id, display_name AS name FROM learners
      WHERE family_id::text = ${familyId} AND archived_at IS NULL ORDER BY created_at, id`;
    const ids = learners.map(row => String(row.id));
    if (!schema.ready || !ids.length) return json({ready: Boolean(schema.ready), learners, canEdit, items: []});
    const [planned, progress, tests] = await Promise.all([
      sql`SELECT learner_id::text, chapter_id, activity, period, starts_on::text FROM chapter_plan_activities
        WHERE learner_id::text = ANY(${ids}::text[]) AND
          ((period = 'day' AND starts_on = ${day}::date) OR (period = 'week' AND starts_on = ${week}::date))
        ORDER BY learner_id, chapter_id, CASE activity WHEN 'reading' THEN 0 WHEN 'revision' THEN 1 ELSE 2 END`,
      schema.progress ? sql`SELECT learner_id::text, chapter_id, status,
        (completed_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_on,
        (updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS updated_on
        FROM ncert_chapter_progress WHERE learner_id::text = ANY(${ids}::text[])` : [],
      schema.tests ? sql`SELECT a.learner_id::text, a.chapter_id, MAX(t.test_date)::text AS tested_on
        FROM ncert_test_assessments a JOIN ncert_test_attempts t ON a.id = t.assessment_id
        WHERE a.learner_id::text = ANY(${ids}::text[]) AND t.test_date BETWEEN ${week}::date AND ${day}::date
        GROUP BY a.learner_id, a.chapter_id` : [],
    ]);
    const key = (row: {learner_id: unknown; chapter_id: unknown}) => `${row.learner_id}:${row.chapter_id}`;
    const progressByChapter = new Map(progress.map(row => [key(row), row]));
    const testByChapter = new Map(tests.map(row => [key(row), row.tested_on]));
    const inToday = new Set(planned.filter(row => row.period === 'day').map(row => `${key(row)}:${row.activity}`));
    const items: ChapterPlanItem[] = planned.flatMap(row => {
      const chapter = catalogue.get(String(row.chapter_id));
      const learner = learners.find(item => item.id === row.learner_id);
      if (!chapter || !learner) return [];
      const activity = row.activity as ChapterPlanItem['activity'];
      const saved = progressByChapter.get(key(row));
      const completedOn = activity === 'test' ? testByChapter.get(key(row)) : activity === 'revision'
        ? saved?.status === 'revised' ? saved.updated_on : null
        : saved?.status === 'completed' ? saved.updated_on : saved?.read_on;
      return [{
        chapterId: chapter.id, learnerId: String(learner.id), learnerName: String(learner.name),
        title: chapter.verifiedTitle ?? chapter.label, activity, period: row.period as ChapterPlanItem['period'],
        done: typeof completedOn === 'string' && completedOn >= row.starts_on && completedOn <= day,
        inToday: inToday.has(`${key(row)}:${activity}`),
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
    const {learnerId, chapterId, period, activity} = input ?? {};
    if (typeof learnerId !== 'string' || learnerId.length > 100 || typeof chapterId !== 'string' || !catalogue.has(chapterId) ||
      (period !== 'day' && period !== 'week') || (activity !== 'all' && !activities.includes(activity))) {
      return json({error: 'Choose a learner, chapter, plan and activity.'}, 400);
    }
    const {sql, familyId} = member;
    const day = today();
    const startsOn = period === 'day' ? day : mondayOf(day);
    const selected = activity === 'all' ? activities : [activity];
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
  } catch {
    return json({error: 'Unable to save. Check that the chapter activities migration has been applied.'}, 503);
  }
}
