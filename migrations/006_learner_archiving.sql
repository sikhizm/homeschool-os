-- Additive, reversible learner archive support.
BEGIN;
SELECT pg_advisory_xact_lock(704186031);
ALTER TABLE public.learners ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;
CREATE INDEX IF NOT EXISTS learners_active_family ON public.learners (family_id, created_at, id) WHERE archived_at IS NULL;
COMMIT;
