-- Additive, family-owned NCERT chapter assignment and progress. Run before deployment.
BEGIN;
SELECT pg_advisory_xact_lock(704186027);
DO $$
DECLARE learner_type text;
BEGIN
 SELECT format_type(atttypid, atttypmod) INTO learner_type
 FROM pg_attribute WHERE attrelid='public.learners'::regclass AND attname='id' AND NOT attisdropped;
 IF learner_type IS NULL THEN RAISE EXCEPTION 'learners.id missing'; END IF;
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.ncert_chapter_progress (
  learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  chapter_id text NOT NULL CHECK(length(chapter_id) BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT ''assigned'' CHECK(status IN (''assigned'', ''in_progress'', ''completed'')),
  parent_note text NOT NULL DEFAULT '''' CHECK(length(parent_note)<=1000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY(learner_id, chapter_id)
 )',learner_type);
END $$;
ALTER TABLE public.ncert_chapter_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ncert_chapter_progress FROM PUBLIC;
-- API uses server-side family ownership checks and a trusted database connection.
COMMIT;
