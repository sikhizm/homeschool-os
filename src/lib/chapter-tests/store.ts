import 'server-only';
import { getSql } from '@/lib/db';
import type { Attempt, ScheduledTest } from './model';

export async function readChapterTests(userId: string, learnerId = '', chapterId = '', start = '2000-01-01', end = '2100-12-31') {
  const sql = getSql();
  const rows = await sql`
    WITH history AS (
      SELECT t.id::text, a.id::text AS assessment_id, a.chapter_id, l.id::text AS learner_id,
        t.title, t.test_date, t.total_marks, t.obtained_marks, t.remarks,
        to_char(t.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US') AS created_at,
        row_number() OVER (PARTITION BY a.id ORDER BY t.test_date, t.created_at, t.id)::int AS attempt_number
      FROM ncert_test_assessments a JOIN ncert_test_attempts t ON t.assessment_id = a.id
      JOIN learners l ON l.id = a.learner_id
      WHERE l.archived_at IS NULL
        AND (${learnerId} = '' OR l.id::text = ${learnerId})
        AND (${chapterId} = '' OR a.chapter_id = ${chapterId})
        AND EXISTS (SELECT 1 FROM family_members m
          WHERE m.family_id = l.family_id AND m.auth_user_id = ${userId})
    )
    SELECT *, test_date::text AS date FROM history
    WHERE test_date BETWEEN ${start}::date AND ${end}::date
    ORDER BY test_date DESC, created_at DESC, id DESC
  `;
  return rows.map((row): Attempt & { learnerId: string; attemptNumber: number } => ({
    id: String(row.id), assessmentId: String(row.assessment_id), chapterId: String(row.chapter_id),
    learnerId: String(row.learner_id), title: String(row.title), date: String(row.date),
    total: Number(row.total_marks), obtained: Number(row.obtained_marks), remarks: String(row.remarks),
    createdAt: String(row.created_at), attemptNumber: Number(row.attempt_number),
  }));
}

export function chapterTestDate(offset = 0, now = new Date()) {
  const date = new Date(new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(now) + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function readScheduledTests(userId: string, chapterId = '', familyId = '', through = '2100-12-31'): Promise<ScheduledTest[] | null> {
  const sql = getSql();
  const [schema] = await sql`SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ncert_test_assessments' AND column_name = 'scheduled_for'
  ) AS available`;
  if (!schema?.available) return null;
  const rows = await sql`
    SELECT a.id::text, a.chapter_id, l.id::text AS learner_id, l.display_name,
      a.scheduled_title, a.scheduled_for::text, a.scheduled_total
    FROM ncert_test_assessments a JOIN learners l ON l.id = a.learner_id
    WHERE l.archived_at IS NULL AND a.scheduled_for <= ${through}::date
      AND (${chapterId} = '' OR a.chapter_id = ${chapterId})
      AND (${familyId} = '' OR l.family_id::text = ${familyId})
      AND EXISTS (SELECT 1 FROM family_members m WHERE m.family_id = l.family_id AND m.auth_user_id = ${userId})
      AND NOT EXISTS (SELECT 1 FROM ncert_test_attempts t WHERE t.assessment_id = a.id)
    ORDER BY a.scheduled_for, a.id
  `;
  return rows.map(row => ({
    id: String(row.id), chapterId: String(row.chapter_id), learnerId: String(row.learner_id),
    learnerName: String(row.display_name), title: String(row.scheduled_title), date: String(row.scheduled_for),
    total: row.scheduled_total == null ? null : Number(row.scheduled_total),
  }));
}
