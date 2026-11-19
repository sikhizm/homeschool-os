BEGIN;
SELECT pg_advisory_xact_lock(704186041);
DO $migration$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO STRICT learner_type
  FROM pg_attribute WHERE attrelid = 'public.learners'::regclass AND attname = 'id' AND NOT attisdropped;
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.ncert_weekly_chapter_outcomes (
    learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    week_start date NOT NULL,
    chapter_id text NOT NULL CHECK (length(chapter_id) BETWEEN 1 AND 120),
    outcome text NOT NULL CHECK (outcome IN (''understood'', ''practice'', ''done'')),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (learner_id, week_start, chapter_id)
  )', learner_type);
END $migration$;
ALTER TABLE public.ncert_weekly_chapter_outcomes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ncert_weekly_chapter_outcomes FROM PUBLIC;
COMMIT;
