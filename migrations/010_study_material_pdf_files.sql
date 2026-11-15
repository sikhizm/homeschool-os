-- PDF-first Study Library support. Existing editable HTML/Markdown documents remain unchanged.
BEGIN;
SELECT pg_advisory_xact_lock(704186035);
CREATE TABLE IF NOT EXISTS public.study_material_pdf_files (
  document_id uuid PRIMARY KEY REFERENCES public.study_material_documents(id) ON DELETE CASCADE,
  file_name text NOT NULL CHECK(length(trim(file_name)) BETWEEN 1 AND 220),
  mime_type text NOT NULL DEFAULT 'application/pdf' CHECK(mime_type='application/pdf'),
  file_size_bytes integer NOT NULL CHECK(file_size_bytes BETWEEN 1 AND 3145728),
  file_data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.study_material_pdf_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_material_pdf_files FROM PUBLIC;
COMMIT;
