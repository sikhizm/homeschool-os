import type { getSql } from '@/lib/db';
import type { QueueTask } from './catalogue';
import { periodDates } from '@/lib/planning/periods';

export async function weeklyPracticeChapters(sql: ReturnType<typeof getSql>, learnerIds: string[], date: string) {
  if (!learnerIds.length) return [];
  const [available] = await sql`SELECT to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS outcomes`;
  if (!available?.outcomes) return [];
  const year = periodDates('year', date).startDate;
  return sql`
    SELECT latest.learner_id, latest.chapter_id
    FROM (
      SELECT DISTINCT ON (o.learner_id, o.chapter_id)
        o.learner_id::text AS learner_id, o.chapter_id, o.outcome, o.updated_at
      FROM ncert_weekly_chapter_outcomes o
      JOIN learning_planning_periods y ON y.learner_id = o.learner_id
        AND y.kind = 'year' AND y.start_date = ${year}::date AND o.chapter_id = ANY(y.chapter_ids)
      WHERE o.learner_id::text = ANY(${learnerIds}::text[]) AND o.week_start >= ${year}::date - 6
      ORDER BY o.learner_id, o.chapter_id, o.week_start DESC
    ) latest
    WHERE latest.outcome = 'practice' AND (latest.updated_at AT TIME ZONE 'Asia/Kolkata')::date < ${date}::date
    ORDER BY latest.updated_at, latest.chapter_id
  `;
}

export function weeklyPracticeTasks(catalogue: QueueTask[], chapterIds: string[]) {
  return chapterIds.flatMap(chapterId => {
    const task = catalogue.find(item => item.id === `ncert:${chapterId}:practice`);
    return task ? [{ ...task, status: 'needs_revision' }] : [];
  });
}
