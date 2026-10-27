-- Additive migration. No learner/auth rows are changed or seeded.
-- Resolve the existing learner PK type rather than assuming UUID vs bigint.
BEGIN;
SELECT pg_advisory_xact_lock(704186023);
DO $$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO learner_type
    FROM pg_attribute WHERE attrelid = 'public.learners'::regclass AND attname = 'id' AND NOT attisdropped;
  IF learner_type IS NULL THEN RAISE EXCEPTION 'Existing learners.id is required'; END IF;
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.learning_subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id %s NOT NULL REFERENCES public.learners(id),
    name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
    approach text NOT NULL DEFAULT '''' CHECK (length(approach) <= 600),
    archived boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, learner_id)
  )', learner_type);
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.learner_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id %s NOT NULL REFERENCES public.learners(id),
    subject_id uuid NOT NULL,
    title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
    progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    evidence text NOT NULL DEFAULT '''' CHECK (length(evidence) <= 1000),
    target_date date,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (subject_id, learner_id) REFERENCES public.learning_subjects(id, learner_id),
    UNIQUE (id, learner_id, subject_id)
  )', learner_type);
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.learning_plan_starters (
    learner_id %s NOT NULL REFERENCES public.learners(id),
    learning_date date NOT NULL,
    PRIMARY KEY (learner_id, learning_date)
  )', learner_type);
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.learning_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id %s NOT NULL REFERENCES public.learners(id),
    subject_id uuid,
    goal_id uuid,
    learning_date date NOT NULL,
    title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
    minutes integer NOT NULL CHECK (minutes BETWEEN 1 AND 120),
    completed boolean NOT NULL DEFAULT false,
    reflection text NOT NULL DEFAULT '''' CHECK (length(reflection) <= 1000),
    position integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (goal_id IS NULL OR subject_id IS NOT NULL),
    FOREIGN KEY (subject_id, learner_id) REFERENCES public.learning_subjects(id, learner_id),
    FOREIGN KEY (goal_id, learner_id, subject_id) REFERENCES public.learner_objectives(id, learner_id, subject_id)
  )', learner_type);
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS learning_subject_name ON public.learning_subjects (learner_id, lower(name));
CREATE INDEX IF NOT EXISTS learning_goal_learner ON public.learner_objectives (learner_id);
CREATE INDEX IF NOT EXISTS learning_day ON public.learning_activities (learner_id, learning_date, position);
ALTER TABLE public.learning_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plan_starters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_subjects, public.learner_objectives, public.learning_activities, public.learning_plan_starters FROM PUBLIC;
-- No browser-facing grants or RLS policies: untrusted roles have no direct access.
-- The trusted server connection must own these tables or have BYPASSRLS.
-- No browser-facing grants. App queries require authenticated family membership;
-- only owners may write. Do not expose the server DATABASE_URL to the browser.
COMMIT;
