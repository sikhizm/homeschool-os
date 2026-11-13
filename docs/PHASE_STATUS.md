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

## Phase 6 — Evidence-backed Class 5 curriculum mapping (this phase)
- [x] Reusable outcome registry separates official outcomes, original Homeschool OS outcomes and framework-context references; a source ID cannot turn an original outcome into an official one.
- [x] Account for all 86 verified Class 5 chapter slots across seven books: 60 editorial original-outcome proposals remain **Draft**, 26 chapters are explicitly unmapped with a reason, and seed approvals remain **0**.
- [x] Add parent-owner-only `/curriculum-mapping` review workspace with grade/subject/book/status filters, source/evidence/rationale cards, editable drafts, explicit approve/reject/unmapped decisions and revision history.
- [x] Add append-only migration `008_curriculum_outcome_mapping.sql`, guarded table-only rollback, RLS/no-PUBLIC-grant checks and `npm run db:migrate:curriculum-mapping`; no learner, progress, assessment or textbook rows are rewritten or seeded.
- [x] Keep mapping approval separate from learning evidence, completion, retention and mastery. Learner mode exposes no review controls.
- [x] Add registry, isolated migration/workflow and browser-fixture tests plus `npm run curriculum:mapping-audit`.
- [x] Applied migration 008 to the production Neon branch after successfully exercising the additive schema on an isolated production-derived branch. Verified the live table has 21 columns, RLS enabled, zero policies, and is owned by `neondb_owner`; learner/family/progress counts remained 4 / 1 / 2. No learner or progress rows were written.
- [ ] Obtain section-level official NCERT outcome evidence and language-specialist review before creating official or Hindi/Urdu Class 5 mappings.

See [PHASE6_CURRICULUM_MAPPING_REPORT.md](PHASE6_CURRICULUM_MAPPING_REPORT.md) for the 60/0/26 breakdown, source boundaries, migration procedure and actual validation evidence.

## Phase 04 — Adaptive revision & retention (delivered)
- [x] Replace fixed 3/10-day-only recall with parent-recorded independent / hinted / not-yet recall outcomes
- [x] Adapt intervals: independent recall 10 days, recall with a hint 4 days, not-yet recall returns immediately for gentle revision
- [x] Continue up to five spaced checks when independent retention has not yet been demonstrated
- [x] Award mastery only after an understanding record and a later independent recall; a hinted recall never awards mastery
- [x] Keep evidence in the existing migration 005 progress table; no new migration or production data rewrite
- [x] Preserve legacy review:1 and review:2 records and support undo without erasing earlier understanding evidence
- [x] Add tests for interval adaptation, later recall, legacy compatibility and evidence rollback

See [ADAPTIVE_RETENTION_PHASE.md](ADAPTIVE_RETENTION_PHASE.md) for the exact rules and safeguards.

## Family Learning Studio — complete UI/UX redesign (this phase)
- [x] Warm editorial visual identity: ivory `#F7F8F3`, forest `#185B47`, charcoal `#202C28`, subject tints (math/language/science/creativity/saffron), Nunito + Noto Sans Gurmukhi fonts, 16–21px card radii, 46–52px controls, focus outlines, reduced-motion rules
- [x] App shell: collapsible desktop sidebar (Home, Learning Plan, Learners, Curriculum Library, Progress, Family Portfolio, Settings) + fixed mobile bottom nav (Home, Learn, Library, Progress, Profile) + parent/learner mode switch
- [x] Parent Home (`FamilyHome`): greeting/date/avatar, "Today's Family Learning Plan" hero with progress and one big START TODAY'S LEARNING, per-learner cards (avatar, level, progress, next activity, streak, Continue, 3-state revision chip), day timeline (warm-up/guided/independent/revision), urgent-only Parent attention
- [x] Age-adapted learner homes at `/learn`: toddler (parent-led screen-free), preschool (play tiles, one next action), early primary (subject cards, ask-a-parent), independent (paths, achievements, reading/reasoning)
- [x] Learning path at `/learn/path`: subject-grouped nodes with completed/ready/revision/needs-practice/upcoming states, no locks, revision inline
- [x] Lesson player at `/learn/lesson`: Discover → Understand → Explore → Practice → Reflect → Complete, progress bar, speech read-aloud, one question at a time, Ask-a-parent help, localStorage autosave, records completion/revision via existing `POST /api/auto-learning`
- [x] Curriculum library at `/library`: grade/subject/type filters, Continue-reading strip, six discovery collections, verification-state legend; NCERT book detail keeps cover/publisher/edition/source/chapters with verified/pending badges
- [x] Automated planner: one-tap "Prepare next day" (idempotent family-calendar POST now accepts today or tomorrow); completed lessons hidden, subjects balanced, shared guided budget respected
- [x] Three-state adaptive revision (`revision-state.ts`): Confident / Practising / Needs support with recommendation copy
- [x] `/settings` (account, family, PWA install, learning prefs, sign-out) and `/learners` (roster with instant switching)
- [x] PWA: manifest/offline/brand colors retuned; middleware matcher covers `/learn`, `/library`, `/settings`, `/learners`
- [x] Verification gates: `npm run lint`, `npm run typecheck`, `npm test` (**157/157** as of Phase 5), CI-style `npm run build`, `npm run test:smoke` against the built server, and `npm run test:ui` (4/4 browser tests; runs in CI, and locally with a `CHROMIUM_PATH` pointing at a downloaded Playwright browser)

## Chapter-first learning (Phases 0–7, issues #40–#45 plus Phase 7 catalogue work)
- [x] Phase 0 — Progress/authentication compatibility audit, live-database audit, regression contracts, isolated smoke reliability (PRs #51–#55; `docs/PHASE_0_LIVE_DATABASE_AUDIT.md`)
- [x] Phase 1 — Universal chapter engine: every then-catalogued verified Class 1–8 chapter generated read/practice/understanding-check sessions from one catalogue path; stable `ncert:<chapterId>:<kind>` IDs preserved (PR #49). Phase 7 extends that same engine through Class 10 for default-path items.
- [x] Phase 2 — Chapter Learning Studio: chapter pages launch sessions in the existing six-stage lesson player, scoped to learners of the chapter's class (PR #50)
- [x] Phase 3 — Evidence-derived chapter statuses (`not_started → in_progress/practice_due/understanding_check_due → completed → retained`, plus `needs_revision`), legacy completion interpreted at read time, no duplicate rows (PRs #57, #58)
- [x] Daily Assignment Workflow: parent-assigned dated workload exposed to learner mode with carry-forward and sequence guarantees (PR #59)
- [x] Phase 4 — Learner-first dashboard: Continue Learning hero, Today's Learning (daily assignments), Active Chapter, My Books shelf, Revision Needed, Recent Learning, honest progress counts; learner switching refetches per-learner data; parent learner cards show active chapter and next session (merged PR #60, issue #44 acceptance evidence in `PHASE4_5_COMPLETION_REPORT.md`)
- [x] Phase 5 — Quality validation: representative curriculum audit across Classes 1–8 (24 books, 65 official links probed; 0 structural failures), Poorvi PDF gap found and capped, full-journey + data-integrity + browser tests, all gates green at delivery (merged PR #60, issue #45 evidence in `PHASE4_5_COMPLETION_REPORT.md`)
- [ ] Issues #44 and #45 remain open pending a real production owner acceptance check. Their merged implementation and historical gate evidence are not a substitute for that live confirmation, so neither issue has been closed from this branch.

See [PHASE4_5_COMPLETION_REPORT.md](PHASE4_5_COMPLETION_REPORT.md) for the historical Phase 4–5 validation evidence, known limitations and remaining pilot work.

## Phase 7 — NCERT Class 8 index completion and Class 9–10 expansion
- [x] Add five official-source Class 8 records: Exploring Society Parts I–II, Kaushal Bodh, Khel Yatra and Kriti; preserve 7/8 chapters, 6 projects, 6 units and 19 chapters respectively rather than fabricating one uniform structure.
- [x] Expand the audited catalogue to **77 books / 892 source-verified Contents titles** across Classes 1–10; retain the single Class 1 Dilchasp Riyazi contents-pending record.
- [x] Add 9 Class 9 records / 97 titles and 7 Class 10 records / 60 titles only where formal official Contents were captured.
- [x] Add explicit `choose-one` structures for six Kaushal Bodh projects and nine Kaushal Vikas vocation alternatives. They remain visible but are not auto-assigned as compulsory `ncert:` session tasks.
- [x] Extend default-path sessions through Class 10 with stable IDs; preserve all existing IDs, progress, evidence and adaptive-retention behavior.
- [x] Add explicit direct-PDF provenance support and suppress code-pattern inference for Phase 7 records. New Class 8 additions and all Class 9–10 items use official book-portal fallback until individually validated.
- [x] Update the Class 8/9/10 indexes, completion master and Phase 7 evidence report; add `npm run curriculum:catalogue-audit`.
- [x] Run `npm run typecheck`, `npm test` (**163/163**), `npm run curriculum:inventory` and `npm run curriculum:catalogue-audit` in this branch.
- [x] Complete lint, placeholder-auth production build and local smoke validation.
- [x] Run the browser cases in GitHub Actions on PR #62: the `verify` job passed lint, typecheck, `npm test`, `npm run test:ui` against isolated PostgreSQL fixtures, the credential-free production build and `npm run test:smoke`. The sandbox itself lacks Playwright Chromium and `/usr/bin/chromium`, so its local `npm run test:ui` attempt stopped before assertions and is not a pass.
- [x] Human review and merge approval completed; PR #62 is merged to `main` at `d20acfa3b750d3f08f5b10c0290b572798c277a6`. CI evidence and merge status are recorded in the PR. Production deployment and signed-in owner acceptance remain separate checks.
- [x] No database migration, production operation, learner-data migration, outcome mapping or bulk senior-secondary import was performed.

See [PHASE7_NCERT_EXPANSION_REPORT.md](PHASE7_NCERT_EXPANSION_REPORT.md) for evidence, direct-PDF policy, selection boundaries and excluded records.

## Phase 8 — International framework evidence and crosswalk safeguards (foundation delivered)
- [x] Add a source-evidence record for each of the seven existing lenses, distinguishing five curriculum frameworks, the ePathshala access resource and original HomeSchool OS content.
- [x] Verify official overview scope and limitations for NCERT NCF-SE, Cambridge Primary, IB PYP, Singapore MOE Primary Mathematics and US Common Core; refresh the Singapore syllabus source to the official October 2025 update.
- [x] Correct the original enrichment record so it no longer points to the NCERT framework as if it were an external source.
- [x] Show source scope, evidence state, review boundary and context-tag counts in the authenticated Global Curriculum explorer.
- [x] Add npm run curriculum:framework-audit and regression tests. Framework tags remain context-only.
- [ ] Transcribe exact, editioned framework outcomes and complete source-specific, human-reviewed crosswalks. This foundation intentionally creates **0 outcome-level crosswalks and 0 approved equivalencies**.
- [x] No database migration, learner-data write, automatic mapping approval or curriculum progress change.

See [PHASE8_FRAMEWORK_EVIDENCE_REPORT.md](PHASE8_FRAMEWORK_EVIDENCE_REPORT.md) for source scope, review gates and limitations.

## Still outstanding (next phases)
- Have an actual family owner review the 60 Class 5 drafts. Approved count must remain zero until that explicit action; Hindi/Urdu mappings need specialist and section-level evidence.
- Section-level official NCERT outcome transcription and provenance review before any registry outcome can be classified official.
- Systematic source-by-source NCERT Class 11–12 coverage. Class 8 Urdu Khayal, Class 10 Contemporary India-II and Class 10 Health and Physical Education also remain excluded pending formal Contents capture; Class 1 Dilchasp Riyazi and Poorvi (Class 8) direct PDFs 6–15 remain publisher-side follow-up (see `PHASE7_NCERT_EXPANSION_REPORT.md`).
- Parent-reviewed international framework mapping with framework-specific editor evidence; no equivalence is inferred from this pilot (see `GLOBAL_CURRICULUM_ENGINE.md`).
- Optional richer portfolios, longitudinal charts and parent-entered assessment archives.
