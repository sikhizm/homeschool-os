BEGIN;
ALTER TABLE olympiad_rhythm_activities
  ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'day' CHECK (period IN ('day', 'week')),
  DROP CONSTRAINT IF EXISTS olympiad_rhythm_activities_learner_id_practice_date_topic_key;
CREATE UNIQUE INDEX IF NOT EXISTS olympiad_rhythm_period_unique
  ON olympiad_rhythm_activities (learner_id, practice_date, topic, period);
COMMIT;
