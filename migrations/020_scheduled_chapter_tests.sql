BEGIN;
SELECT pg_advisory_xact_lock(704186040);
ALTER TABLE public.ncert_test_assessments
  ADD COLUMN IF NOT EXISTS scheduled_for date CHECK (scheduled_for BETWEEN DATE '2000-01-01' AND DATE '2100-12-31'),
  ADD COLUMN IF NOT EXISTS scheduled_title text CHECK (length(btrim(scheduled_title)) BETWEEN 1 AND 160),
  ADD COLUMN IF NOT EXISTS scheduled_total numeric(10, 2) CHECK (scheduled_total > 0);
CREATE INDEX IF NOT EXISTS ncert_test_schedule_date_idx ON public.ncert_test_assessments (scheduled_for)
  WHERE scheduled_for IS NOT NULL;

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
      SELECT 1 FROM public.ncert_test_assessments a WHERE learner_id = locked_learner AND chapter_id = chapter_key
        AND EXISTS (SELECT 1 FROM public.ncert_test_attempts t WHERE t.assessment_id = a.id)
    ) THEN RETURN 'assessment_type'; END IF;
    INSERT INTO public.ncert_test_assessments(learner_id, chapter_id)
    VALUES (locked_learner, chapter_key) RETURNING id INTO group_id;
  ELSIF operation = 'schedule' THEN
    INSERT INTO public.ncert_test_assessments(learner_id, chapter_id, scheduled_for, scheduled_title, scheduled_total)
    VALUES (locked_learner, chapter_key, taken_on, test_title, total);
    RETURN 'saved';
  ELSIF operation IN ('reschedule', 'complete_schedule', 'cancel_schedule') THEN
    SELECT a.id INTO group_id FROM public.ncert_test_assessments a
    WHERE a.id = target AND a.learner_id = locked_learner AND a.chapter_id = chapter_key
      AND a.scheduled_for IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.ncert_test_attempts t WHERE t.assessment_id = a.id);
  ELSIF operation = 'retest' THEN
    SELECT id INTO group_id FROM public.ncert_test_assessments
    WHERE id = target AND learner_id = locked_learner AND chapter_id = chapter_key
      AND EXISTS (SELECT 1 FROM public.ncert_test_attempts t WHERE t.assessment_id = target);
  ELSIF operation IN ('edit', 'delete', 'delete_group') THEN
    SELECT a.id INTO group_id FROM public.ncert_test_assessments a
    JOIN public.ncert_test_attempts t ON t.assessment_id = a.id
    WHERE t.id = target AND a.learner_id = locked_learner AND a.chapter_id = chapter_key;
  END IF;
  IF group_id IS NULL THEN RETURN 'missing'; END IF;

  IF operation = 'reschedule' THEN
    UPDATE public.ncert_test_assessments SET scheduled_for = taken_on, scheduled_title = test_title,
      scheduled_total = total WHERE id = group_id;
  ELSIF operation = 'cancel_schedule' THEN
    DELETE FROM public.ncert_test_assessments WHERE id = group_id;
  ELSIF operation IN ('delete', 'delete_group') THEN
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
