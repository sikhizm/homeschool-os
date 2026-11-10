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
- [x] Verification gates per step: `npm run lint`, `npm run typecheck`, `npm test` (106/106), CI-style `npm run build`, `npm run test:smoke` against the built server (all green). Browser `test:ui` runs in CI only (Playwright chromium cannot download in this sandbox)

## Still outstanding (next phases)
- Human-reviewed Class 5 chapter-to-skill mapping with source edition, chapter evidence, rationale, reviewer and revision history; no automatic approval.
- Official Class 2 and Class 3 book/contents audits, then systematic NCERT Classes 1–12 coverage; Class 8 contents and Class 1 Dilchasp Riyazi contents remain pending (see `NCERT_CLASS1_INDEX.md` and `NCERT_CLASS4_COMPLETION_CLASS5_INDEX.md`).
- Parent-reviewed international framework mapping with editor evidence (see `GLOBAL_CURRICULUM_ENGINE.md`).
- Optional richer portfolios, longitudinal charts and parent-entered assessment archives.
