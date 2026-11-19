BEGIN;
CREATE TABLE IF NOT EXISTS olympiad_rhythm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  topic text NOT NULL CHECK (char_length(topic) BETWEEN 1 AND 200),
  practice_date date NOT NULL,
  completed_at timestamptz,
  UNIQUE (learner_id, practice_date, topic)
);
ALTER TABLE olympiad_rhythm_activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON olympiad_rhythm_activities FROM PUBLIC;
COMMIT;
