-- Phase 6: append-only, family-owned curriculum mapping review history.
-- This migration only creates a new table. It does not modify learners,
-- learning evidence, progress records, textbook metadata, or existing plans.
BEGIN;
SELECT pg_advisory_xact_lock(704186033);
DO $$
DECLARE family_type text;
BEGIN
  SELECT format_type(atttypid,atttypmod) INTO family_type
  FROM pg_attribute
  WHERE attrelid='public.families'::regclass AND attname='id' AND NOT attisdropped;
  IF family_type IS NULL THEN RAISE EXCEPTION 'families.id is required'; END IF;
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.curriculum_mapping_reviews (
    id uuid CONSTRAINT curriculum_mapping_reviews_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id %s NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    mapping_id text NOT NULL CHECK(length(trim(mapping_id)) BETWEEN 1 AND 180),
    revision integer NOT NULL CHECK(revision >= 1),
    grade integer NOT NULL CHECK(grade BETWEEN 1 AND 12),
    book_id text NOT NULL CHECK(length(trim(book_id)) BETWEEN 1 AND 140),
    chapter_id text NOT NULL CHECK(length(trim(chapter_id)) BETWEEN 1 AND 160),
    outcome_id text NULL CHECK(outcome_id IS NULL OR length(trim(outcome_id)) BETWEEN 1 AND 180),
    relationship_type text NULL CHECK(relationship_type IS NULL OR relationship_type IN (''introduces'',''develops'',''reinforces'',''assesses'')),
    review_status text NOT NULL CHECK(review_status IN (''draft'',''in_review'',''approved'',''rejected'',''superseded'',''unmapped'')),
    source_url text NOT NULL CHECK(length(trim(source_url)) BETWEEN 8 AND 1000),
    source_edition text NOT NULL CHECK(length(trim(source_edition)) BETWEEN 1 AND 800),
    evidence_reference text NOT NULL DEFAULT '''' CHECK(length(evidence_reference) <= 1500),
    chapter_evidence text NOT NULL DEFAULT '''' CHECK(length(chapter_evidence) <= 2000),
    rationale text NOT NULL DEFAULT '''' CHECK(length(rationale) <= 2500),
    review_reason text NOT NULL DEFAULT '''' CHECK(length(review_reason) <= 1500),
    actor_user_id text NOT NULL CHECK(length(trim(actor_user_id)) BETWEEN 1 AND 200),
    reviewer_user_id text NULL CHECK(reviewer_user_id IS NULL OR length(trim(reviewer_user_id)) BETWEEN 1 AND 200),
    reviewed_at timestamptz NULL,
    supersedes_id uuid NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT curriculum_mapping_reviews_family_mapping_revision_key UNIQUE(family_id,mapping_id,revision),
    -- This compound target keeps a revision chain within its owning family and mapping.
    CONSTRAINT curriculum_mapping_reviews_family_mapping_id_key UNIQUE(family_id,mapping_id,id),
    CONSTRAINT curriculum_mapping_reviews_supersedes_same_mapping_fkey
      FOREIGN KEY(family_id,mapping_id,supersedes_id)
      REFERENCES public.curriculum_mapping_reviews(family_id,mapping_id,id),
    CONSTRAINT curriculum_mapping_reviews_review_fields_check
      CHECK((review_status IN (''approved'',''rejected'',''superseded'',''unmapped'') AND reviewer_user_id IS NOT NULL AND reviewed_at IS NOT NULL)
        OR (review_status IN (''draft'',''in_review'') AND reviewer_user_id IS NULL AND reviewed_at IS NULL)),
    CONSTRAINT curriculum_mapping_reviews_reviewer_timestamp_check
      CHECK((reviewed_at IS NULL) = (reviewer_user_id IS NULL)),
    CONSTRAINT curriculum_mapping_reviews_revision_chain_check
      CHECK((supersedes_id IS NULL) <> (revision > 1)),
    CONSTRAINT curriculum_mapping_reviews_superseded_chain_check
      CHECK((review_status <> ''superseded'') OR supersedes_id IS NOT NULL),
    CONSTRAINT curriculum_mapping_reviews_rejection_reason_check
      CHECK((review_status <> ''rejected'') OR length(trim(review_reason)) > 0),
    CONSTRAINT curriculum_mapping_reviews_approval_evidence_check
      CHECK((review_status <> ''approved'') OR (
        outcome_id IS NOT NULL AND relationship_type IS NOT NULL AND source_url LIKE ''https://%%''
        AND length(trim(evidence_reference)) > 0 AND length(trim(chapter_evidence)) > 0 AND length(trim(rationale)) > 0
        AND length(trim(review_reason)) > 0
      )),
    CONSTRAINT curriculum_mapping_reviews_unmapped_outcome_check
      CHECK((review_status <> ''unmapped'') OR (outcome_id IS NULL AND length(trim(review_reason)) > 0)),
    CONSTRAINT curriculum_mapping_reviews_mapping_target_check
      CHECK((review_status = ''unmapped'') OR (outcome_id IS NOT NULL AND relationship_type IS NOT NULL)),
    CONSTRAINT curriculum_mapping_reviews_outcome_relationship_check
      CHECK((outcome_id IS NULL) = (relationship_type IS NULL))
  )',family_type);
END $$;
CREATE INDEX IF NOT EXISTS curriculum_mapping_reviews_family_lookup
  ON public.curriculum_mapping_reviews(family_id,grade,book_id,review_status,mapping_id,revision DESC);
CREATE INDEX IF NOT EXISTS curriculum_mapping_reviews_family_chapter
  ON public.curriculum_mapping_reviews(family_id,chapter_id,created_at DESC);
ALTER TABLE public.curriculum_mapping_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.curriculum_mapping_reviews FROM PUBLIC;
-- No browser-facing grants or policies are added. The trusted server route
-- checks authenticated family ownership before every read and append.
COMMIT;
