-- Private, additive AI Study Material Studio storage. Existing family and learner data is untouched.
BEGIN;
SELECT pg_advisory_xact_lock(704186034);
DO $$
DECLARE learner_type text;
BEGIN
 SELECT format_type(atttypid,atttypmod) INTO learner_type FROM pg_attribute
 WHERE attrelid='public.learners'::regclass AND attname='id' AND NOT attisdropped;
 IF learner_type IS NULL THEN RAISE EXCEPTION 'learners.id is required'; END IF;
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.study_material_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  grade text NOT NULL CHECK(length(trim(grade)) BETWEEN 1 AND 40),
  subject text NOT NULL CHECK(length(trim(subject)) BETWEEN 1 AND 100),
  book_id text NOT NULL CHECK(length(trim(book_id)) BETWEEN 1 AND 140),
  chapter_id text NOT NULL CHECK(length(trim(chapter_id)) BETWEEN 1 AND 140),
  title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 180),
  document_type text NOT NULL CHECK(length(trim(document_type)) BETWEEN 1 AND 80),
  safe_html text NOT NULL CHECK(length(safe_html) BETWEEN 1 AND 500000),
  source_reference text NOT NULL CHECK(length(source_reference) BETWEEN 1 AND 1200),
  source_version text NOT NULL DEFAULT '''' CHECK(length(source_version)<=300),
  version integer NOT NULL DEFAULT 1 CHECK(version>=1),
  approval_status text NOT NULL DEFAULT ''pending'' CHECK(approval_status IN (''pending'',''approved'')),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id,learner_id)
 )',learner_type);
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.study_material_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  learner_id %s NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK(version>=1),
  title text NOT NULL,
  document_type text NOT NULL,
  safe_html text NOT NULL CHECK(length(safe_html) BETWEEN 1 AND 500000),
  edited_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id,version),
  FOREIGN KEY(document_id,learner_id) REFERENCES public.study_material_documents(id,learner_id) ON DELETE CASCADE
 )',learner_type);
END $$;
CREATE INDEX IF NOT EXISTS study_materials_learner_library ON public.study_material_documents(learner_id,archived_at,grade,subject,book_id,chapter_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS study_material_versions_document ON public.study_material_versions(document_id,version DESC);
ALTER TABLE public.study_material_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_material_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_material_documents,public.study_material_versions FROM PUBLIC;
-- No browser grants. Server API checks family membership and owner role for writes.
COMMIT;
