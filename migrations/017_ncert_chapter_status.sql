BEGIN;
ALTER TABLE public.ncert_chapter_progress
  DROP CONSTRAINT IF EXISTS ncert_chapter_progress_status_check;
ALTER TABLE public.ncert_chapter_progress
  ADD CONSTRAINT ncert_chapter_progress_status_check CHECK (
    status IN ('assigned', 'in_progress', 'completed', 'pending', 'read', 'revision_due', 'revised', 'needs_practice')
  );
COMMIT;
