BEGIN;

ALTER TABLE public.chapter_plan_activities ADD COLUMN IF NOT EXISTS completed_on date;

-- Keep the first completion for each scheduled reading when the chapter is read again.
CREATE OR REPLACE FUNCTION public.record_planned_chapter_reading()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE read_on date;
BEGIN
  IF TG_TABLE_NAME = 'ncert_chapter_progress' THEN
    IF NEW.completed_at IS NULL THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' THEN
      IF NEW.completed_at IS NOT DISTINCT FROM OLD.completed_at THEN RETURN NEW; END IF;
    END IF;
    read_on := (NEW.completed_at AT TIME ZONE 'Asia/Kolkata')::date;
  ELSE
    IF NEW.outcome NOT IN ('done', 'understood') THEN RETURN NEW; END IF;
    read_on := (NEW.updated_at AT TIME ZONE 'Asia/Kolkata')::date;
  END IF;

  UPDATE public.chapter_plan_activities
  SET completed_on = read_on
  WHERE learner_id = NEW.learner_id AND chapter_id = NEW.chapter_id
    AND activity = 'reading' AND starts_on <= read_on AND completed_on IS NULL;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS capture_planned_reading ON public.ncert_chapter_progress;
CREATE TRIGGER capture_planned_reading AFTER INSERT OR UPDATE OF completed_at
ON public.ncert_chapter_progress FOR EACH ROW EXECUTE FUNCTION public.record_planned_chapter_reading();

DROP TRIGGER IF EXISTS capture_planned_reading ON public.ncert_weekly_chapter_outcomes;
CREATE TRIGGER capture_planned_reading AFTER INSERT OR UPDATE OF outcome, updated_at
ON public.ncert_weekly_chapter_outcomes FOR EACH ROW EXECUTE FUNCTION public.record_planned_chapter_reading();

WITH reads AS (
  SELECT learner_id, chapter_id, (completed_at AT TIME ZONE 'Asia/Kolkata')::date AS read_on
  FROM public.ncert_chapter_progress WHERE completed_at IS NOT NULL AND status <> 'pending'
  UNION ALL
  SELECT learner_id, chapter_id, (updated_at AT TIME ZONE 'Asia/Kolkata')::date
  FROM public.ncert_weekly_chapter_outcomes WHERE outcome IN ('done', 'understood')
)
UPDATE public.chapter_plan_activities plan
SET completed_on = (
  SELECT min(read_on) FROM reads
  WHERE learner_id = plan.learner_id AND chapter_id = plan.chapter_id AND read_on >= plan.starts_on
)
WHERE activity = 'reading' AND completed_on IS NULL;

COMMIT;
