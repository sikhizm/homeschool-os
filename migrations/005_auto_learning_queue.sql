BEGIN;
SELECT pg_advisory_xact_lock(704186028);
DO $$
DECLARE learner_type text;
BEGIN
 SELECT format_type(atttypid,atttypmod) INTO learner_type FROM pg_attribute
 WHERE attrelid='public.learners'::regclass AND attname='id' AND NOT attisdropped;
 IF learner_type IS NULL THEN RAISE EXCEPTION 'learners.id missing'; END IF;
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.auto_learning_progress(
  learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  task_id text NOT NULL CHECK(length(task_id) BETWEEN 1 AND 140),
  status text NOT NULL CHECK(status IN (''completed'',''needs_revision'')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id,task_id)
 )',learner_type);
END $$;
ALTER TABLE public.auto_learning_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auto_learning_progress FROM PUBLIC;
COMMIT;
