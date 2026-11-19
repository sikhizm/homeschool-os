import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { ncertChapterSlots, textbookById } from '@/lib/ncert/textbooks';
import { mondayOf, periodDates } from '@/lib/planning/periods';

import {normalizeChapterStatus} from '@/lib/ncert/chapter-status';
import {passingChapters} from '@/lib/ncert/passing-chapters';

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
    SELECT m.role, l.family_id, l.display_name, l.stage, ARRAY(
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
  return { sql, learnerId, userId: data.user.id, today, week, year, role: scope.role, familyId: String(scope.family_id), name: String(scope.display_name), grade: String(scope.stage ?? ''), ids: scope.chapter_ids as string[] };
}

export async function GET(request: Request) {
  try {
    const scope = await weeklyScope(new URL(request.url).searchParams.get('learner'));
    if (scope instanceof Response) return scope;
    const { sql, learnerId, ids } = scope;
    const [availability] = await sql`SELECT
      to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS outcomes,
      to_regclass('public.ncert_chapter_progress') IS NOT NULL AS progress,
      to_regclass('public.ncert_test_attempts') IS NOT NULL AND to_regclass('public.ncert_test_assessments') IS NOT NULL AS tests,
      to_regclass('public.family_daily_plans') IS NOT NULL AS daily`;
    const [saved, tested, daily, passed] = await Promise.all([
      availability.progress ? sql`SELECT chapter_id, status FROM ncert_chapter_progress
        WHERE learner_id::text = ${learnerId}` : [],
      availability.tests ? sql`SELECT DISTINCT a.chapter_id FROM ncert_test_assessments a
        JOIN ncert_test_attempts t ON t.assessment_id = a.id WHERE a.learner_id::text = ${learnerId}` : [],
      availability.daily ? sql`SELECT slots FROM family_daily_plans WHERE family_id::text = ${scope.familyId} AND learning_date = ${scope.today}::date` : [],
      availability.tests ? passingChapters(sql, [learnerId]) : [],
    ]);
    const slots = Array.isArray(daily[0]?.slots) ? daily[0].slots : [];
    return json({ canRecord: availability.outcomes === true && availability.progress === true, canAdd: availability.daily === true, chapters: ids.flatMap((id) => {
      const chapter = chapters.get(id);
      const book = chapter && textbookById(chapter.bookId);
      if (!chapter || !book) return [];
      return [{ id, title: chapter.verifiedTitle ?? chapter.label, subject: book.subject,
        status: passed.some(row => row.chapter_id === id) ? 'finished' : normalizeChapterStatus(saved.find(row => row.chapter_id === id)?.status),
        assessed: tested.some((row) => row.chapter_id === id),
        addedToday: slots.some((slot: { learnerId: string; task?: { id: string } }) =>
          slot.learnerId === learnerId && slot.task?.id === `weekly-chapter:${id}`) }];
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
    const addToday = input?.action === 'add-today';
    if (typeof input?.chapterId !== 'string' || (!addToday && !outcomes.includes(input.outcome)))
      return json({ error: 'Choose a chapter and an outcome.' }, 400);
    const scope = await weeklyScope(input.learnerId);
    if (scope instanceof Response) return scope;
    if (scope.role !== 'owner') return json({ error: 'Only the family owner can record outcomes.' }, 403);
    if (!scope.ids.includes(input.chapterId) || !chapters.has(input.chapterId))
      return json({ error: 'This chapter is no longer in the weekly plan.' }, 409);
    const { sql, learnerId, userId, week, year } = scope;
    if (addToday) {
      const chapter = chapters.get(input.chapterId)!;
      const book = textbookById(chapter.bookId);
      if (!book) return json({ error: 'Chapter unavailable.' }, 409);
      const task = {
        id: `weekly-chapter:${chapter.id}`, title: chapter.verifiedTitle ?? chapter.label,
        subject: book.subject, minutes: 15, href: `/ncert-books/chapter/${encodeURIComponent(chapter.id)}`,
        mode: 'independent', source: 'Weekly chapters', instructions: [],
      };
      const slot = { learnerId, name: scope.name, grade: scope.grade, task, minutes: task.minutes, startMinute: 0, mode: task.mode };
      const saved = await sql`
        INSERT INTO family_daily_plans (family_id, learning_date, budget_minutes, slots)
        SELECT l.family_id, ${scope.today}::date, 60, ${JSON.stringify([slot])}::jsonb
        FROM learners l JOIN family_members m ON m.family_id = l.family_id
        JOIN learning_planning_periods w ON w.learner_id = l.id AND w.kind = 'week' AND w.start_date = ${week}::date
        JOIN learning_planning_periods y ON y.learner_id = l.id AND y.kind = 'year' AND y.start_date = ${year}::date
        WHERE l.id::text = ${learnerId} AND l.archived_at IS NULL AND m.auth_user_id = ${userId} AND m.role = 'owner'
          AND l.family_id::text = ${scope.familyId} AND ${chapter.id} = ANY(w.chapter_ids) AND ${chapter.id} = ANY(y.chapter_ids)
        ON CONFLICT (family_id, learning_date) DO UPDATE SET slots =
          CASE WHEN family_daily_plans.slots @> ${JSON.stringify([{ learnerId, task: { id: task.id } }])}::jsonb
               THEN family_daily_plans.slots ELSE family_daily_plans.slots || EXCLUDED.slots END
        RETURNING family_id
      `;
      return saved.length ? json({ saved: true }) : json({ error: 'The weekly chapter is no longer available.' }, 409);
    }
    const status = input.outcome === 'practice' ? 'needs_practice' : 'read';
    const rows = await sql`
      WITH weekly_record AS (
      INSERT INTO ncert_weekly_chapter_outcomes (learner_id, week_start, chapter_id, outcome)
      SELECT l.id, ${week}::date, ${input.chapterId}, ${input.outcome}
      FROM learners l JOIN family_members m ON m.family_id = l.family_id
      JOIN learning_planning_periods w ON w.learner_id = l.id AND w.kind = 'week' AND w.start_date = ${week}::date
      JOIN learning_planning_periods y ON y.learner_id = l.id AND y.kind = 'year' AND y.start_date = ${year}::date
      WHERE l.id::text = ${learnerId} AND l.archived_at IS NULL AND m.auth_user_id = ${userId} AND m.role = 'owner'
        AND ${input.chapterId} = ANY(w.chapter_ids) AND ${input.chapterId} = ANY(y.chapter_ids)
      ON CONFLICT (learner_id, week_start, chapter_id)
      DO UPDATE SET outcome = EXCLUDED.outcome, updated_at = now()
      RETURNING learner_id, chapter_id
      )
      INSERT INTO ncert_chapter_progress (learner_id, chapter_id, status, parent_note, completed_at)
      SELECT w.learner_id, w.chapter_id, ${status}, '',
        CASE WHEN ${status} = 'read' THEN now() ELSE (
          SELECT max(o.updated_at) FROM ncert_weekly_chapter_outcomes o
          WHERE o.learner_id = w.learner_id AND o.chapter_id = w.chapter_id
            AND o.outcome IN ('done', 'understood')
        ) END
      FROM weekly_record w
      ON CONFLICT (learner_id, chapter_id) DO UPDATE
        SET status = EXCLUDED.status, updated_at = now(),
          completed_at = CASE WHEN EXCLUDED.status = 'read' THEN EXCLUDED.completed_at
            ELSE COALESCE(ncert_chapter_progress.completed_at, EXCLUDED.completed_at) END
      RETURNING status
    `;
    return rows.length ? json({ saved: true, status: rows[0].status }) : json({ error: 'The weekly chapter is no longer available.' }, 409);
  } catch {
    return json({ error: 'Unable to save the chapter update.' }, 503);
  }
}
