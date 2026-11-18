BEGIN;
ALTER TABLE learning_planning_periods ADD COLUMN IF NOT EXISTS olympiad_topics jsonb NOT NULL DEFAULT '{}';
ALTER TABLE learning_planning_periods ADD COLUMN IF NOT EXISTS finished_chapters text[] NOT NULL DEFAULT '{}';
ALTER TABLE learning_activities ADD COLUMN IF NOT EXISTS timer_started_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS learning_one_timer_per_learner
  ON learning_activities(learner_id) WHERE timer_started_at IS NOT NULL;
COMMIT;
