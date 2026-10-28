-- Phase 04: additive, private annual / weekly parent planning.
-- No learner, existing activity, assessment or auth rows are modified.
BEGIN;
SELECT pg_advisory_xact_lock(704186024);
DO $$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid,atttypmod) INTO learner_type
  FROM pg_attribute
  WHERE attrelid='public.learners'::regclass AND attname='id' AND NOT attisdropped;
  IF learner_type IS NULL THEN RAISE EXCEPTION 'Existing learners.id is required'; END IF;
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.learning_planning_periods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id %s NOT NULL REFERENCES public.learners(id),
    kind text NOT NULL CHECK (kind IN (''year'',''week'')),
    start_date date NOT NULL,
    end_date date NOT NULL,
    title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
    focus text NOT NULL DEFAULT '''' CHECK (length(focus) <= 1500),
    notes text NOT NULL DEFAULT '''' CHECK (length(notes) <= 1500),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK(end_date>=start_date),
    UNIQUE(learner_id,kind,start_date)
  )',learner_type);
END $$;
CREATE INDEX IF NOT EXISTS planning_period_learner_dates ON public.learning_planning_periods(learner_id,start_date,end_date);
ALTER TABLE public.learning_planning_periods ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_planning_periods FROM PUBLIC;
-- No direct client grants; authenticated family membership is checked by server SQL.
COMMIT;
