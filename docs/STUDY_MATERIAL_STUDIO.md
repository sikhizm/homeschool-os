# AI Study Material Studio — rollout and current scope

The chapter detail route (`/ncert-books/chapter/[chapterId]`) now mounts the Studio only for verified chapters in the default learning path. It uses the authenticated chapter-progress learner query, filters choices to an exact `Class N` match, and selects the first eligible learner by default. The prompt builder is pure code and uses the locally audited NCERT catalogue; the AI provider is the parent's choice and no model/API secret is required.

## Rollout

1. Apply the additive Neon migrations before enabling save/library workflows:
   `npm run db:migrate:study-materials`
   `npm run db:migrate:study-material-pdf`
2. Deploy the app with the existing Neon Auth and database environment variables.
3. Confirm signed-in owners can save and reopen a test resource; confirm a different-class learner cannot be saved against a chapter.

Migration 009 creates `study_material_documents` and `study_material_versions`; migration 010 adds private PDF binary storage. These additive migrations do not change learner, curriculum, or chapter-progress rows. All study-material tables enable RLS and revoke public access. App routes use server-side Neon Auth family membership checks; writes require the family owner and exact learner-class match.

## Implemented in this phase

- Verified chapter-aware prompt with a format choice (PDF by default, downloadable self-contained HTML, or both), learner matching, individual/bulk material selection, three difficulty levels, language selection, large-print option, copy and selectable prompt fallback.
- Strong source-access gate: the external model must inspect the actual source or stop and request chapter pages/text. Catalogue titles are not treated as chapter content.
- Original PDF file upload and private storage (up to 3 MB per PDF), authenticated in-browser viewing, and HTML/Markdown paste or upload for editable library copies. PDF bytes are stored separately from sanitized editable content.
- Server-side HTML allow-list sanitization, bounded input size, isolated `sandbox` preview, restrictive iframe CSP, and safe tables, sub/superscripts and constrained inline SVG.
- A4 monochrome preview, zoom, page scrolling, print / browser Save as PDF, learner profile Study Library, family-private saved documents, parent approval, duplicate, archive/restore, delete with confirmation and version snapshots on edit.
- Local script fonts for Gurmukhi and Devanagari on the app; print templates include local/system script-font fallbacks and no remote resources.

## Deliberate limitations / next phase

This rollout does **not** complete the full assessment and mastery-engine brief. The app does not generate PDF files; the selected external AI assistant creates the downloadable PDF/HTML deliverables. PDF uploads are stored as original binary files. Editable HTML/Markdown continues to use A4 preview and browser Print / Save as PDF. It also does not generate educational answers itself, restore an older saved version through the UI, print arbitrary selected document sections, or implement assessment question/response records, mistake notebooks or a new evidence-based chapter mastery dashboard. Existing chapter progress and spaced-recall evidence remain unchanged; generating or saving a document never marks learning complete. Continue with chapter assessment/parent-mark entry and mistake evidence, then link reviewed evidence to transparent mastery recommendations without changing existing progress silently.

No live database migration or production deployment is claimed from the local test environment. Configure the production Neon environment, apply migrations 009 and 010, and verify deployed authentication, learner/class authorization and print behavior before announcing rollout.
