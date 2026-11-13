-- Phase 6 rollback — intentionally destructive for curriculum-mapping audit history only.
-- Export/review curriculum_mapping_reviews before use. This script never touches
-- families, learners, progress, assessment, textbook or planning tables.
BEGIN;
SELECT pg_advisory_xact_lock(704186033);
DROP TABLE IF EXISTS public.curriculum_mapping_reviews;
COMMIT;
