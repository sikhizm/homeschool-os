BEGIN;
DO $$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO STRICT learner_type FROM pg_attribute
    WHERE attrelid = 'public.learners'::regclass AND attname = 'id' AND NOT attisdropped;
  EXECUTE format($schema$
    CREATE TABLE IF NOT EXISTS public.chapter_plan_activities (
      learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
      chapter_id text NOT NULL CHECK (length(chapter_id) BETWEEN 1 AND 120),
      activity text NOT NULL CHECK (activity IN ('reading', 'revision', 'test')),
      period text NOT NULL CHECK (period IN ('day', 'week')),
      starts_on date NOT NULL,
      PRIMARY KEY (learner_id, chapter_id, activity, period, starts_on)
    )
  $schema$, learner_type);
END $$;
ALTER TABLE public.chapter_plan_activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chapter_plan_activities FROM PUBLIC;
COMMIT;
