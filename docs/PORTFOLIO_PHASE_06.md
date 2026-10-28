# Phase 06 — Baseline Observations & Learning Portfolios

## Full-phase deliverable
- A private `/portfolio` page for learner-specific observations, with family membership checks and owner-only editing.
- Parent-entered baseline snapshots, learning observations, textual work sample descriptions, and reflections.
- Explicit *not tried*, *with support*, *independently observed*, and *not applicable* markers, strictly for the particular recorded activity.
- Date-ordered portfolio timeline, evidence-type filters, entry creation, editing, deletion with a confirmation dialog, count summaries and sensible empty/error/loading feedback.
- Additive `003_learning_portfolios.sql` migration with no learner-record changes, RLS enabled, no PUBLIC grants.
- Existing goals, academic planner, lesson resources and November pilot remain unchanged.

## Privacy & interpretation
Entries are **text only**, with no photo, file upload, external sharing, public student profile or generated diagnostic labels. A parent may refer to an existing paper work sample but files are not stored in this phase. No grades, permanent mastery flags, clinical diagnoses or progress percentages are inferred or modified. Only observed activity-specific independence is counted. No synthetic evidence is seeded.

Data access is always restricted by authenticated family membership and the same primary-family convention as the existing dashboard. Mutations check owner role in the SQL statement, not only in the UI. Same-origin, size and input validation are applied to writes. Only the 300 most recent records are returned in this iteration, with a visible disclosure when truncated.

## Deployment gates
1. Verify GitHub lint, TypeScript, unit tests, browser fixture regression and isolated production build/smoke.
2. Inspect the correct Neon database and create a restore point before running `npm run db:migrate:portfolio` with a secure DATABASE_URL. Migration is additive and repeatable; **not executed against production during feature development**.
3. Verify RLS and no PUBLIC grants. Verify the server role is authorised to access the new table.
4. For an actual parent account, verify one intended observation can be saved, edited, filtered and deleted; verify an unrelated family cannot access or mutate it, and non-owner editing is denied.
5. Check mobile layout, empty state, and note that preview may share the production database. Do not create dummy child observations.

## Known follow-on boundaries
This phase does not include file/photo storage, encrypted file attachments, formal standardised assessments, longitudinal charts across the entire learner history, automated achievement scores, audit-history versioning, backup restore drills or a PDF student report. These require distinct review and privacy decisions.
