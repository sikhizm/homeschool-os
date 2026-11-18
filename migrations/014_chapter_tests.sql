BEGIN;
SELECT pg_advisory_xact_lock(704186040);
DO $migration$
DECLARE learner_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO STRICT learner_type
  FROM pg_attribute WHERE attrelid = 'public.learners'::regclass
    AND attname = 'id' AND NOT attisdropped;
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.ncert_test_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    chapter_id text NOT NULL CHECK (length(chapter_id) BETWEEN 1 AND 120),
    created_at timestamptz NOT NULL DEFAULT now()
  )', learner_type);
END $migration$;
CREATE INDEX IF NOT EXISTS ncert_test_assessments_scope_idx
  ON public.ncert_test_assessments (learner_id, chapter_id);
CREATE TABLE IF NOT EXISTS public.ncert_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.ncert_test_assessments(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  test_date date NOT NULL CHECK (test_date BETWEEN DATE '2000-01-01' AND DATE '2100-12-31'),
  total_marks numeric(10, 2) NOT NULL CHECK (total_marks > 0),
  obtained_marks numeric(10, 2) NOT NULL CHECK (obtained_marks BETWEEN 0 AND total_marks),
  remarks text NOT NULL DEFAULT '' CHECK (length(remarks) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ncert_test_attempts_order_idx
  ON public.ncert_test_attempts (assessment_id, test_date, created_at, id);
ALTER TABLE public.ncert_test_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncert_test_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ncert_test_assessments, public.ncert_test_attempts FROM PUBLIC;

-- Use the caller's privileges. The app authenticates the user ID before calling.
CREATE OR REPLACE FUNCTION public.mutate_ncert_test(
  actor text, learner_key text, chapter_key text, operation text,
  target uuid, test_title text, taken_on date, total numeric, obtained numeric, note text
) RETURNS text LANGUAGE plpgsql SET search_path = pg_catalog, public AS $function$
DECLARE
  group_id uuid;
  locked_learner public.learners.id%TYPE;
BEGIN
  -- Serialize mutations for this learner, including first assessment and final-attempt deletion.
  SELECT l.id INTO locked_learner FROM public.learners l
  WHERE l.id::text = learner_key AND l.archived_at IS NULL AND EXISTS (
    SELECT 1 FROM public.family_members m WHERE m.family_id = l.family_id
      AND m.auth_user_id = actor AND m.role = 'owner'
  ) FOR UPDATE;
  IF NOT FOUND THEN RETURN 'forbidden'; END IF;

  IF operation IN ('first', 'new') THEN
    IF (operation = 'new') <> EXISTS (
      SELECT 1 FROM public.ncert_test_assessments WHERE learner_id = locked_learner AND chapter_id = chapter_key
    ) THEN RETURN 'assessment_type'; END IF;
    INSERT INTO public.ncert_test_assessments(learner_id, chapter_id)
    VALUES (locked_learner, chapter_key) RETURNING id INTO group_id;
  ELSIF operation = 'retest' THEN
    SELECT id INTO group_id FROM public.ncert_test_assessments
    WHERE id = target AND learner_id = locked_learner AND chapter_id = chapter_key;
  ELSIF operation IN ('edit', 'delete', 'delete_group') THEN
    SELECT a.id INTO group_id FROM public.ncert_test_assessments a
    JOIN public.ncert_test_attempts t ON t.assessment_id = a.id
    WHERE t.id = target AND a.learner_id = locked_learner AND a.chapter_id = chapter_key;
  END IF;
  IF group_id IS NULL THEN RETURN 'missing'; END IF;

  IF operation IN ('delete', 'delete_group') THEN
    IF (operation = 'delete_group') <> (
      (SELECT count(*) FROM public.ncert_test_attempts WHERE assessment_id = group_id) = 1
    ) THEN RETURN 'history_changed'; END IF;
    IF operation = 'delete_group' THEN
      DELETE FROM public.ncert_test_assessments WHERE id = group_id;
    ELSE
      DELETE FROM public.ncert_test_attempts WHERE id = target;
    END IF;
  ELSIF operation = 'edit' THEN
    UPDATE public.ncert_test_attempts SET title = test_title, test_date = taken_on,
      total_marks = total, obtained_marks = obtained, remarks = note, updated_at = now()
    WHERE id = target;
  ELSE
    INSERT INTO public.ncert_test_attempts(assessment_id, title, test_date, total_marks, obtained_marks, remarks)
    VALUES (group_id, test_title, taken_on, total, obtained, note);
  END IF;
  RETURN 'saved';
END $function$;
REVOKE ALL ON FUNCTION public.mutate_ncert_test(text,text,text,text,uuid,text,date,numeric,numeric,text) FROM PUBLIC;
COMMIT;
