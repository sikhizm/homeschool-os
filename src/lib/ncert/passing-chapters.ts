import 'server-only';
import {NEEDS_PRACTICE_PERCENT} from '@/lib/chapter-tests/model';
import type {getSql} from '@/lib/db';

/** Call with already authorized, active learner IDs. */
export async function passingChapters(sql: ReturnType<typeof getSql>, learnerIds: string[], chapterId?: string) {
  if (!learnerIds.length) return [];
  const [schema] = await sql`SELECT to_regclass('public.ncert_test_assessments') IS NOT NULL
    AND to_regclass('public.ncert_test_attempts') IS NOT NULL AS ready`;
  if (!schema?.ready) return [];
  return sql`
    SELECT DISTINCT a.learner_id::text AS learner_id, a.chapter_id
    FROM ncert_test_assessments a JOIN ncert_test_attempts t ON t.assessment_id = a.id
    WHERE a.learner_id::text = ANY(${learnerIds}::text[])
      AND (${chapterId ?? null}::text IS NULL OR a.chapter_id = ${chapterId ?? null}::text)
      AND t.obtained_marks * 100 >= t.total_marks * ${NEEDS_PRACTICE_PERCENT}::numeric
  `;
}
