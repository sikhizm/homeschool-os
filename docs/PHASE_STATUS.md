# Homeschool OS phase status

## Phase 01
- [x] Initial Next.js TypeScript scaffold
- [x] Responsive landing dashboard and roadmap
- [x] Privacy-safe placeholder content
- [x] Dependency install, lint, typecheck and isolated production build verification
- [x] Vercel deployment verification (commit `d124d7f`: Vercel status `success`, CI `verify` `success`)

No personal learner data is committed.

## Learning management milestone
- [x] Learner editing with owner-only writes
- [x] Per-learner subjects and non-destructive archival
- [x] Individual goals and explicit parent-recorded progress
- [x] Daily 60-minute starter, linked activities, completion, reflection and rescheduling
- [x] Responsive parent workspace and isolated SQL/browser tests
- [x] Family learning workspace active in production (five-destination navigation, saved daily plans, weekly overview, portfolio and insights)

## Complete Annual Curriculum & Ready-to-Teach Pathways (this phase)
- [x] Full 36-week, 3-term sequenced pathways for Infant, Nursery, UKG and Class 4
- [x] Spiral subject distribution, explicit prerequisites and three term milestones
- [x] Fully worked ready-to-teach lessons (objective, preparation, example, steps, questions, exercise, expected answers, variations, completion criteria, revision guidance)
- [x] Developmentally appropriate, screen-free infant interaction pathway; new infant/toddler stage options
- [x] Genuine single shared family time budget as the primary dashboard view; independent practice and infant interaction separated
- [x] Annual coverage, subject coverage, current-week and milestone tracking on the dashboard and `/learning-pathways`
- [x] Participation, assessed understanding and demonstrated mastery separated; mastery requires understanding + delayed recall
- [x] Teachable parent scripts for all 49 publisher-verified Class 4 NCERT chapter sessions (original scripts, official text external)
- [x] Existing completion/revision/history/undo behaviour preserved; no completed activity silently reappears
- [x] No production database migration required: evidence stored additively in existing migration 005 table, validated with isolated PGlite
- [x] `npm ci` lock-file repair, new unit/browser/smoke tests, lint, typecheck and production build gates
- [x] Merged to `main`; exact Vercel production deployment for commit `d048527` is READY

See [ANNUAL_CURRICULUM_PHASE.md](ANNUAL_CURRICULUM_PHASE.md) for scope, provenance, safety and verification details.

## NCERT Grade 5 Publisher Contents Audit (this phase)
- [x] Verify all seven Grade 5 NCERT books against official publisher contents and their printed edition details.
- [x] Add 86 numbered Grade 5 chapter/lesson titles and chapter counts.
- [x] Bring the combined Class 4–5 catalogue to 135 verified titles across 11 books.
- [x] Make each verified chapter open its own learning page and official publisher material.
- [x] Keep all chapter-to-skill mappings unapproved pending human review.
- [x] No production migration or learner-data writes required.

## NCERT Grade 1 Publisher Contents Audit (this phase)
- [x] Identify all six Class 1 book records present in NCERT publication/CIET catalogues.
- [x] Verify all 72 numbered chapter/lesson titles across the five CIET-indexed Class 1 books.
- [x] Link verified chapter records to their own authenticated learning pages and only verified NCERT chapter PDFs.
- [x] Keep the Urdu catalogue-only Dilchasp Riyazi record visibly contents-pending; do not invent chapters or PDF links.
- [x] Preserve the separate source/edition and chapter-to-skill review states; no automatic competency mappings.
- [x] No production migration or learner-data writes required.

See [NCERT_CLASS1_INDEX.md](NCERT_CLASS1_INDEX.md) for exact sources, edition notes, scope and remaining gaps.

## Phase 04 — Adaptive revision & retention (this phase)
- [x] Replace fixed 3/10-day-only recall with parent-recorded independent / hinted / not-yet recall outcomes
- [x] Adapt intervals: independent recall 10 days, recall with a hint 4 days, not-yet recall returns immediately for gentle revision
- [x] Continue up to five spaced checks when independent retention has not yet been demonstrated
- [x] Award mastery only after an understanding record and a later independent recall; a hinted recall never awards mastery
- [x] Keep evidence in the existing migration 005 progress table; no new migration or production data rewrite
- [x] Preserve legacy review:1 and review:2 records and support undo without erasing earlier understanding evidence
- [x] Add tests for interval adaptation, later recall, legacy compatibility and evidence rollback

See [ADAPTIVE_RETENTION_PHASE.md](ADAPTIVE_RETENTION_PHASE.md) for the exact rules and safeguards.

## Still outstanding (next phases)
- Human-reviewed Class 5 chapter-to-skill mapping with source edition, chapter evidence, rationale, reviewer and revision history; no automatic approval.
- Official Class 2 and Class 3 book/contents audits, then systematic NCERT Classes 1–12 coverage; Class 8 contents and Class 1 Dilchasp Riyazi contents remain pending (see `NCERT_CLASS1_INDEX.md` and `NCERT_CLASS4_COMPLETION_CLASS5_INDEX.md`).
- Parent-reviewed international framework mapping with editor evidence (see `GLOBAL_CURRICULUM_ENGINE.md`).
- Optional richer portfolios, longitudinal charts and parent-entered assessment archives.
