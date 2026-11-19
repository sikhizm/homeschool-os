BEGIN;
SELECT pg_advisory_xact_lock(704186038);
DO $$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO STRICT learner_type
  FROM pg_attribute WHERE attrelid = 'public.learners'::regclass AND attname = 'id' AND NOT attisdropped;
  EXECUTE format($schema$
    CREATE TABLE IF NOT EXISTS public.learning_challenges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      learner_id %s NOT NULL REFERENCES public.learners(id),
      title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
      criteria text NOT NULL CHECK (length(trim(criteria)) BETWEEN 1 AND 1000),
      assigned_on date NOT NULL,
      original_deadline date NOT NULL CHECK (original_deadline >= assigned_on),
      deadline date NOT NULL CHECK (deadline >= original_deadline),
      promised_reward text NOT NULL CHECK (length(trim(promised_reward)) BETWEEN 1 AND 300),
      late_reward text CHECK (length(trim(late_reward)) BETWEEN 1 AND 300),
      on_time_points integer NOT NULL CHECK (on_time_points BETWEEN 0 AND 1000),
      early_bonus integer NOT NULL CHECK (early_bonus BETWEEN 0 AND 1000),
      late_points integer NOT NULL CHECK (late_points BETWEEN 0 AND on_time_points),
      completed_on date CHECK (completed_on >= assigned_on),
      verified_at timestamptz,
      points_earned integer CHECK (points_earned BETWEEN 0 AND 2000),
      reward_earned text,
      reward_given_at timestamptz CHECK (reward_given_at IS NULL OR (reward_earned IS NOT NULL AND verified_at IS NOT NULL)),
      CHECK ((completed_on IS NULL AND verified_at IS NULL AND points_earned IS NULL)
          OR (completed_on IS NOT NULL AND verified_at IS NOT NULL AND points_earned IS NOT NULL))
    )
  $schema$, learner_type);
END $$;
CREATE TABLE IF NOT EXISTS public.learning_challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.learning_challenges(id),
  attempted_on date NOT NULL,
  passed boolean NOT NULL,
  note text NOT NULL DEFAULT '' CHECK (length(note) <= 1000),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS challenges_by_learner ON public.learning_challenges(learner_id, deadline);
CREATE INDEX IF NOT EXISTS challenge_attempts_by_challenge ON public.learning_challenge_attempts(challenge_id, attempted_on);
CREATE UNIQUE INDEX IF NOT EXISTS challenge_single_pass ON public.learning_challenge_attempts(challenge_id) WHERE passed;
ALTER TABLE public.learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_challenge_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_challenges, public.learning_challenge_attempts FROM PUBLIC;
COMMIT;
