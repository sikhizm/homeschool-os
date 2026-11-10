-- Store selected curriculum competencies alongside year/week plans.
BEGIN;
SELECT pg_advisory_xact_lock(704186032);
ALTER TABLE public.learning_planning_periods
  ADD COLUMN IF NOT EXISTS competency_ids text[] NOT NULL DEFAULT '{}';
COMMIT;
