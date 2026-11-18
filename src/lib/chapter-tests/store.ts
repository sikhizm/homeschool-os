import 'server-only';
import { getSql } from '@/lib/db';
import type { Attempt } from './model';

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
