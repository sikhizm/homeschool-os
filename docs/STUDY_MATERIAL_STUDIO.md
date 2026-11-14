# AI Study Material Studio — rollout and current scope

The chapter detail route (`/ncert-books/chapter/[chapterId]`) now mounts the Studio only for verified chapters in the default learning path. It uses the authenticated chapter-progress learner query, filters choices to an exact `Class N` match, and selects the first eligible learner by default. The prompt builder is pure code and uses the locally audited NCERT catalogue; the AI provider is the parent's choice and no model/API secret is required.

## Rollout

1. Apply the additive Neon migration before enabling save/library workflows:
   `npm run db:migrate:study-materials`
2. Deploy the app with the existing Neon Auth and database environment variables.
3. Confirm signed-in owners can save and reopen a test resource; confirm a different-class learner cannot be saved against a chapter.

Migration 009 creates `study_material_documents` and `study_material_versions`; it does not change learner, curriculum, or chapter-progress rows. Both tables enable RLS and revoke public access. App routes use server-side Neon Auth family membership checks; writes require the family owner and exact learner-class match.

## Implemented in this phase

- Verified chapter-aware, PDF-first prompt that instructs the external AI assistant to create and attach a real downloadable A4 PDF (not HTML), learner matching, individual/bulk material selection, three difficulty levels, language selection, large-print option, copy and selectable prompt fallback.
- Strong source-access gate: the external model must inspect the actual source or stop and request chapter pages/text. Catalogue titles are not treated as chapter content.
- HTML/Markdown paste and upload for editable library copies; PDF upload is reference-only and is not extracted or stored. A PDF created by the external AI assistant can be downloaded and printed directly.
- Server-side HTML allow-list sanitization, bounded input size, isolated `sandbox` preview, restrictive iframe CSP, and safe tables, sub/superscripts and constrained inline SVG.
- A4 monochrome preview, zoom, page scrolling, print / browser Save as PDF, learner profile Study Library, family-private saved documents, parent approval, duplicate, archive/restore, delete with confirmation and version snapshots on edit.
- Local script fonts for Gurmukhi and Devanagari on the app; print templates include local/system script-font fallbacks and no remote resources.

## Deliberate limitations / next phase

This rollout does **not** complete the full assessment and mastery-engine brief. The app itself does not generate, parse, or store PDF binaries; the new prompt asks the external AI assistant to create the downloadable PDF. The app's own editable-document path still uses A4 preview and browser Print / Save as PDF. It also does not generate educational answers itself, restore an older saved version through the UI, print arbitrary selected document sections, or implement assessment question/response records, mistake notebooks or a new evidence-based chapter mastery dashboard. Existing chapter progress and spaced-recall evidence remain unchanged; generating or saving a document never marks learning complete. Continue with chapter assessment/parent-mark entry and mistake evidence, then link reviewed evidence to transparent mastery recommendations without changing existing progress silently.

No live database migration or production deployment is claimed from the local test environment. Configure the production Neon environment, apply migration 009, and verify deployed authentication, learner/class authorization and print behavior before announcing rollout.
