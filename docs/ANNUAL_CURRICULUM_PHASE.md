# Complete Annual Curriculum & Ready-to-Teach Learning Pathways

## Why this phase
Before this phase the automatic learning engine explicitly described itself as a
*pilot*: three grades had only four sequence weeks of short prompts, the infant
learner received **zero** activities (`stageFor('Infant')` returned an empty
queue), lessons were three-line suggestions with no worked examples or expected
answers, and the dashboard's "shared budget" selector actually applied a
per-learner budget. Coverage and badges were described as "currently curated
activities", not an academic year. The audits in `GLOBAL_CURRICULUM_ENGINE.md`
and `NCERT_CLASS4_COMPLETION_CLASS5_INDEX.md` had already identified full
grade-wise content as the outstanding work.

## Delivered
- **Four complete 36-week pathways** (3 terms of 12 weeks): Infant, Nursery, UKG
  and Class 4 — matching the four learners in the family. 9 authored units × 4
  concrete weekly focuses per grade. 36 core teaching weeks per stage plus a
  play/independent consolidation step for each academic week (72 steps per
  academic grade; 36 responsive interactions for the infant).
- **Spiral subject distribution.** Each nine-week round visits every subject
  once, four times a year, so no subject disappears for a whole term.
  Class 4 covers English (reading and writing), Mathematics (operations,
  fractions/measurement/data), Science & EVS, Social studies & GK, Reasoning,
  Hindi/Punjabi/Sikh heritage, and Creative communication. Nursery and UKG
  cover language, early number, discovery, home languages and values, creativity
  and practical life. Each step has explicit prerequisites forming an acyclic
  progression.
- **Genuinely ready-to-teach lessons.** Every step carries objective, materials,
  parent preparation, a worked example with concrete content, 4–5 step-by-step
  teaching instructions, questions, the child's exercise, expected answers and
  assessment guidance, easier and harder variations, completion criteria and
  revision guidance. A reusable `LessonCard` renders all of it; a new browser
  test checks it on desktop and a 375px viewport.
- **Infant pathway is developmentally appropriate.** 36 short, screen-free,
  responsive parent–child interactions across language exposure, Punjabi and
  Sikh family warmth, sensory play, movement, music and connection. No formal
  lessons, worksheets, targets, testing or child assessment. Corpus validation
  rejects formal academic wording in any infant step. Two new learner stages
  (`Infant (0–18 months)`, `Toddler (18–36 months)`) are now selectable.
- **One real family-wide budget.** `/api/auto-learning` computes a single
  shared 60-minute (20/40/60/90 selectable) day plan across all children with
  `buildFamilyPlan`. The "Family day" dashboard view is now the primary view and
  shows the whole plan with full teaching scripts. Infant interaction and
  independent practice are listed **separately** and do not consume parent-led
  teaching minutes. The saved daily calendar and seven-day overview remain
  available, collapsed for calmness. `sharedBudgetTasks` is also used by the
  persistent `/api/family-calendar` planner so saved plans match the preview.
- **Annual coverage tracking.** Three terms, per-term progress bars, subject
  coverage, current teaching week and three honest milestones computed only
  from explicitly recorded completions. The full sequence is browsable at
  `/learning-pathways` (now linked in Explore navigation), with deep links from
  each lesson card.
- **Participation ≠ understanding ≠ mastery.** A completion click records
  participation only. "Yes, understood" records assessed understanding. Mastery
  additionally requires a successful *later* spaced-recall session on the same
  activity. Badges are split into participation and mastery groups with an
  explicit explanation. "Done, not assessed" is offered honestly.
- **Class 4 NCERT sessions are now teachable.** The 49 publisher-verified
  chapter headings still produce read/practice/understanding-check sessions,
  but each now has a full original parent script with worked examples, expected
  answers and links to the official chapter PDF. No textbook text is copied and
  no chapter-to-skill alignment is claimed.
- **Release-gate fix:** `package-lock.json` was out of sync with `package.json`,
  so `npm ci` failed on Node 22. The lock file is now repaired (additive
  transitive entries only).

## Database safety — no production migration
Assessment evidence uses **namespaced task ids** (`assess:<taskId>`,
`mastery:<taskId>`) in the existing `auto_learning_progress` table from
migration 005. Statuses stay within the existing CHECK constraint and ids stay
within the existing 140-character limit. No table, column, grant, RLS policy or
existing learner progress row is changed. An isolated PGlite integration test
applies migration 005, verifies RLS, inserts a pre-existing progress row,
simulates the full understanding→recall→mastery→undo sequence and proves the
original row survives while CHECK constraints still reject invalid statuses and
oversized ids. Row-level security and family-ownership SQL guards are unchanged:
every read joins `family_members`, every write re-checks `role='owner'` inside
the statement, POST remains same-origin, size-limited and input-validated.

Because no schema change is required, **no Neon migration is applied for this
phase** — the safest possible production data outcome. The app continues to use
the existing Neon PostgreSQL connection; no credentials or env vars are exposed.

## Honest limits
- These are **original HomeSchool OS parent-guided lessons**, not official
  NCERT/CBSE textbook lessons, not verbatim learning outcomes, and not
  accredited Cambridge/IB/Singapore/Common Core coverage. Framework references
  are pedagogical inspiration only.
- 36 teaching weeks is a sequence, not a claim about any school's published
  term dates; holidays, illness, festivals and revision are intentionally
  unscheduled.
- Official NCERT book identities and 49 Class 4 chapter titles remain
  separately indexed metadata. NCERT content is accessed externally through
  official links. No ISBN/edition review or chapter-to-skill mapping was added.
- Completion and coverage percentages describe **recorded steps**, not
  attainment, attendance or exam readiness. A learner with no entries is not
  labelled behind.
- The infant's play interactions are suggestions for responsive care, not a
  clinical developmental checklist or medical advice.

## Verification gates
`npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`
(Chromium fixture on desktop and 375px mobile), `npm run build`,
`npm run test:smoke` and the isolated PGlite migration test. New unit tests:
`tests/annual-curriculum.test.ts`, `tests/assessment-mastery.test.ts`.
Unauthenticated and cross-origin checks for `/learning-pathways` and
`/api/auto-learning` are in the smoke script. All prior tests remain unchanged
and passing.

## Release
One integrated PR from `arena/239d134a-homeschool-os` to `main`, merged only
after GitHub Actions (`Verify learning workspace`) passes. Production
verification uses the Vercel commit status reported on the exact merged commit.
