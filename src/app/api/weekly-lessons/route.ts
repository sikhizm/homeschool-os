import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { ncertChapterSlots, textbookById } from '@/lib/ncert/textbooks';
import { mondayOf, periodDates } from '@/lib/planning/periods';

const chapters = new Map(ncertChapterSlots.map((chapter) => [chapter.id, chapter]));
const outcomes = ['understood', 'practice', 'done'];
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });

async function weeklyScope(learnerId: unknown) {
  const { data } = await auth.getSession();
  if (!data?.user?.id) return json({ error: 'Sign in required.' }, 401);
  if (typeof learnerId !== 'string' || !learnerId || learnerId.length > 100)
    return json({ error: 'Choose a learner.' }, 400);
  const sql = getSql();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const week = mondayOf(today);
  const year = periodDates('year', today).startDate;
  const [scope] = await sql`
    SELECT m.role, ARRAY(
      SELECT chapter_id FROM unnest(w.chapter_ids) AS chapter_id
      WHERE chapter_id = ANY(y.chapter_ids)
    ) AS chapter_ids
    FROM learners l JOIN family_members m ON m.family_id = l.family_id
    LEFT JOIN learning_planning_periods w ON w.learner_id = l.id AND w.kind = 'week' AND w.start_date = ${week}::date
    LEFT JOIN learning_planning_periods y ON y.learner_id = l.id AND y.kind = 'year' AND y.start_date = ${year}::date
    WHERE l.id::text = ${learnerId} AND l.archived_at IS NULL AND m.auth_user_id = ${data.user.id}
      AND l.family_id = (SELECT family_id FROM family_members WHERE auth_user_id = ${data.user.id} ORDER BY created_at, family_id LIMIT 1)
  `;
  if (!scope) return json({ error: 'Learner unavailable.' }, 404);
  return { sql, learnerId, userId: data.user.id, week, year, role: scope.role, ids: scope.chapter_ids as string[] };
}

export async function GET(request: Request) {
  try {
    const scope = await weeklyScope(new URL(request.url).searchParams.get('learner'));
    if (scope instanceof Response) return scope;
    const { sql, learnerId, ids, week } = scope;
    const [availability] = await sql`SELECT
      to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS outcomes,
      to_regclass('public.ncert_test_attempts') IS NOT NULL AND to_regclass('public.ncert_test_assessments') IS NOT NULL AS tests`;
    const [saved, tested] = await Promise.all([
      availability.outcomes ? sql`SELECT chapter_id, outcome FROM ncert_weekly_chapter_outcomes
        WHERE learner_id::text = ${learnerId} AND week_start = ${week}::date` : [],
      availability.tests ? sql`SELECT DISTINCT a.chapter_id FROM ncert_test_assessments a
        JOIN ncert_test_attempts t ON t.assessment_id = a.id WHERE a.learner_id::text = ${learnerId}` : [],
    ]);
    return json({ canRecord: availability.outcomes === true, chapters: ids.flatMap((id) => {
      const chapter = chapters.get(id);
      const book = chapter && textbookById(chapter.bookId);
      if (!chapter || !book) return [];
      return [{ id, title: chapter.verifiedTitle ?? chapter.label, subject: book.subject,
        outcome: saved.find((row) => row.chapter_id === id)?.outcome ?? null,
        assessed: tested.some((row) => row.chapter_id === id) }];
    }) });
  } catch {
    return json({ error: 'Unable to load this week’s chapters.' }, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return json({ error: 'Same-origin request required.' }, 403);
  try {
    const input = await request.json().catch(() => null);
    if (typeof input?.chapterId !== 'string' || typeof input?.outcome !== 'string' || !outcomes.includes(input.outcome))
      return json({ error: 'Choose a chapter and an outcome.' }, 400);
    const scope = await weeklyScope(input.learnerId);
    if (scope instanceof Response) return scope;
    if (scope.role !== 'owner') return json({ error: 'Only the family owner can record outcomes.' }, 403);
    if (!scope.ids.includes(input.chapterId) || !chapters.has(input.chapterId))
      return json({ error: 'This chapter is no longer in the weekly plan.' }, 409);
    const { sql, learnerId, userId, week, year } = scope;
    const rows = await sql`
      INSERT INTO ncert_weekly_chapter_outcomes (learner_id, week_start, chapter_id, outcome)
      SELECT l.id, ${week}::date, ${input.chapterId}, ${input.outcome}
      FROM learners l JOIN family_members m ON m.family_id = l.family_id
      JOIN learning_planning_periods w ON w.learner_id = l.id AND w.kind = 'week' AND w.start_date = ${week}::date
      JOIN learning_planning_periods y ON y.learner_id = l.id AND y.kind = 'year' AND y.start_date = ${year}::date
      WHERE l.id::text = ${learnerId} AND l.archived_at IS NULL AND m.auth_user_id = ${userId} AND m.role = 'owner'
        AND ${input.chapterId} = ANY(w.chapter_ids) AND ${input.chapterId} = ANY(y.chapter_ids)
      ON CONFLICT (learner_id, week_start, chapter_id)
      DO UPDATE SET outcome = EXCLUDED.outcome, updated_at = now()
      RETURNING chapter_id
    `;
    return rows.length ? json({ saved: true }) : json({ error: 'The weekly chapter is no longer available.' }, 409);
  } catch {
    return json({ error: 'Unable to record the outcome.' }, 503);
  }
}
