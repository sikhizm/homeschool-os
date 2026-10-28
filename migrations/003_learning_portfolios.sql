-- Phase 06: text-only portfolio records; no child data is seeded or modified.
BEGIN;
SELECT pg_advisory_xact_lock(704186026);
DO $$
DECLARE learner_type text;
BEGIN
 SELECT format_type(atttypid,atttypmod) INTO learner_type FROM pg_attribute
 WHERE attrelid='public.learners'::regclass AND attname='id' AND NOT attisdropped;
 IF learner_type IS NULL THEN RAISE EXCEPTION 'Missing learners.id';END IF;
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.learning_portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id %s NOT NULL REFERENCES public.learners(id),
  observed_on date NOT NULL,
  kind text NOT NULL CHECK(kind IN (''baseline'',''observation'',''work_sample'',''reflection'')),
  area text NOT NULL CHECK(length(trim(area)) BETWEEN 1 AND 90),
  title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 180),
  details text NOT NULL CHECK(length(trim(details)) BETWEEN 1 AND 2000),
  next_step text NOT NULL DEFAULT '''' CHECK(length(next_step)<=750),
  level text NOT NULL CHECK(level IN (''not_tried'',''with_support'',''independent'',''not_applicable'')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
 )',learner_type);
END $$;
CREATE INDEX IF NOT EXISTS portfolio_learner_date ON public.learning_portfolio_entries(learner_id,observed_on DESC,id);
ALTER TABLE public.learning_portfolio_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_portfolio_entries FROM PUBLIC;
-- App's trusted server connection enforces family membership and owner-only writes.
-- No browser grants, storage bucket, file upload endpoint or public sharing.
COMMIT;
