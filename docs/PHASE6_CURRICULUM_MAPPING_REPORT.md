# Phase 6 — Evidence-backed Curriculum Mapping and Class 5 Outcome Review

**Date:** 13 November 2026
**Pilot scope:** NCERT Class 5 bibliographic catalogue only
**Base verified:** `main@906d774e1fb2941a3ea153c78aaea67157c442ef` (PRs #59 and #60 merged)
**Delivery boundary:** private, authenticated family-owner review workflow; no learner data was seeded or changed.

## Preflight release observations

- PR #60 is merged at the required base commit; its GitHub `verify` check passed.
- GitHub records a successful Vercel deployment status for `main@906d774`.
- A signed-in production smoke of `/learn` and `/dashboard` could not be run
  from this sandbox because no production credentials/database connection or
  direct production-network access is available here. Issues #44 and #45
  therefore remain open; they were not closed on an assumption of acceptance.

---

## 1. What this phase establishes

Phase 6 adds a reusable, provenance-first foundation for connecting a verified
chapter record to a curriculum outcome **without** confusing a title, a mapping,
a completed activity or an assessment with learner mastery.

The system has three deliberately separate kinds of registry entry:

| Kind | Meaning in this system | Class 5 pilot use |
|---|---|---|
| **Official outcome** | A statement that has an identifiable official source, exact source location, edition and source verification. | **0 seeded.** The repository identifies an NCERT elementary learning-outcomes source, but does not yet contain a section-level transcription suitable for an official Class 5 row. No official identifier was invented. |
| **Original Homeschool OS outcome** | An age-appropriate, measurable objective authored by the project. It remains original even when a chapter source is linked. | **25** Class 5 outcomes used by the pilot. |
| **International framework reference** | Editorial/pedagogical context, not equivalence or accreditation. | No pilot mappings. The existing seven framework lenses remain source context only. |

The outcome registry is versioned application data in
`src/lib/curriculum/outcome-registry.ts`. Every entry supports grade/stage,
subject/domain, title, measurable outcome, prerequisites, suggested activity,
suggested observation, source authority/URL/edition, verification status and
last verification date. Source records that are intentionally awaiting external
verification retain a registry-review date and a null verification date rather
than pretending that a remote source was freshly checked. Its validator rejects
broken prerequisites, duplicate IDs and any outcome that claims to be official
without an official-source-verification status.

The older 37 broad competencies and 29 illustrative global skills were **not**
relabelled as official grade-specific outcomes. They remain separate teaching
suggestions in their existing modules.

---

## 2. Class 5 catalogue and mapping-accounting results

The pilot reads the existing verified source catalogue rather than duplicating
chapter metadata:

- **7** NCERT Class 5 book records
- **86** source-verified numbered chapter/lesson titles
- **60** editorial candidate mappings, all seeded as **Draft**
- **0** approved mappings in the repository seed
- **26** chapters honestly left unmapped

| Book | Subject | Verified chapters | Draft candidates | Unmapped | Why any gap remains |
|---|---|---:|---:|---:|---|
| Maths Mela | Mathematics | 15 | 15 | 0 | Drafts reference original route, fraction, turn, measurement, pattern, data or contextual-operation outcomes. |
| Santoor | English | 10 | 9 | 1 | One title lacks enough distinct topic/source evidence to select an original outcome. |
| Veena | Hindi | 12 | 0 | 12 | A verified contents title alone is insufficient for a defensible Hindi outcome; language-specialist and section-level source review are required. |
| Our Wondrous World | Environmental Studies | 10 | 10 | 0 | Drafts use original water, food, community, place, systems and environmental-observation outcomes. |
| Bansuri | Arts | 19 | 19 | 0 | Drafts remain original visual-art, making, music, movement and collaboration suggestions. |
| Khel Yoga | Physical Education | 7 | 7 | 0 | Drafts address safe movement, fair play and mindful movement only. |
| Sitaar | Urdu | 13 | 0 | 13 | The same language-specialist / section-level evidence gap is recorded rather than guessed. |
| **Total** |  | **86** | **60** | **26** | Every verified chapter has a draft account or an explicit unmapped reason. |

Each candidate has a stable mapping ID, grade, book and chapter IDs, original
outcome ID, relationship type (`introduces`, `develops`, `reinforces` or
`assesses`), official chapter-source URL, edition string, evidence reference,
short factual chapter evidence, rationale, draft status, version and a
superseded-reference field. No copyrighted chapter text is stored; the record
uses only the already-permitted chapter title plus concise metadata.

### Why drafts can exist from a verified title

A draft says only that a title may warrant a parent’s source inspection against
an **original** objective. The draft’s own evidence text explicitly says that a
contents title is a preliminary topic signal, not proof of chapter coverage,
official alignment or learner attainment. A parent must inspect the official
chapter and source context before approval. This is intentionally more cautious
than a claimed automated crosswalk.

---

## 3. Parent/editor review workflow

The parent-only review workspace is available at `/curriculum-mapping` and is
linked from Curriculum Studio, the authenticated curriculum navigation and the
Class 5 NCERT index/chapter records.

It provides:

- grade, subject, book, chapter and review-status filtering;
- structured source, edition, evidence and rationale cards rather than a raw
  administration table;
- editable draft fields and outcome/relationship selection;
- explicit Draft, In review, Approved, Rejected, Superseded and Unmapped
  states;
- a required human-review confirmation **and source-review decision note** before an Approval action;
- a required reason before Reject or Leave unmapped;
- revision history with version, timestamp and owner-reviewer record;
- clear empty, loading, error and mobile layout states.

Only a user whose `family_members.role` is `owner` can read or write this queue.
The route and API derive the family from the authenticated server session; the
browser never submits a family ID. Non-owner accounts receive `403`, and the
server query always scopes history to the owner’s family. Learner mode has no
review controls.

Approval is an explicit append-only event. It does **not**:

- change `auto_learning_progress` or `ncert_chapter_progress`;
- mark a chapter, session, objective or learner as complete;
- award understanding, retention or mastery;
- alter revision recommendations; or
- change an original outcome into an official NCERT outcome.

`FutureOutcomeEvidenceConnection` and its seven reserved evidence kinds define
how a later assessment layer can connect an outcome to an NCERT chapter,
read/explore session, practice session, understanding check, parent observation,
independent recall or revision recommendation. The type deliberately permits
only `recorded`/`reviewed` evidence states — never a mastery label — and Phase 6
creates no such learner links.

---

## 4. Database change and production migration

`migrations/008_curriculum_outcome_mapping.sql` is additive and reversible at
the table level. It adds only `public.curriculum_mapping_reviews`; it does not
alter existing learner, family, activity, assessment, progress, textbook or
planning rows. The separate, confirmation-gated
`migrations/008_curriculum_outcome_mapping.down.sql` drops only that new table
if an approved rollback is necessary; it is deliberately destructive to mapping
audit history and is never part of the normal migration path.

The table holds immutable review revisions with:

- family ownership, stable mapping ID, revision number and self-reference to the
  superseded revision;
- grade, book, chapter, outcome and relationship fields;
- source URL/edition, evidence reference, chapter evidence and rationale;
- status, review reason, actor/reviewer identity and review timestamp; and
- uniqueness/indexes for per-family mapping and chapter history.

It enables RLS and revokes all `PUBLIC` privileges. The trusted server API adds
a second family-owner check to every read and write path.

### Required deployment action

Run this command with the same trusted server-role `DATABASE_URL` used by the
production app, before enabling the review queue in production:

```bash
npm run db:migrate:curriculum-mapping
```

The runner verifies that the family/learner schema exists, protected learner and
history-table counts are unchanged, the expected review-table columns and
integrity constraints and indexes exist, RLS is enabled, the invoking trusted
server role owns or bypasses RLS for the table, and there are no direct policies
or `PUBLIC` grants. It seeds **no** review or personal data.

If an approved target must be rolled back **after its mapping audit history has
been exported and explicitly accepted for deletion**, use the separate guarded
command:

```bash
CURRICULUM_MAPPING_ROLLBACK_CONFIRM=DROP_PHASE6_CURRICULUM_MAPPING_REVIEWS npm run db:rollback:curriculum-mapping
```

It refuses to run without that exact acknowledgement and verifies that protected
learner/history table counts remain unchanged.

**Actual live migration state (updated 13 November 2026):** migration 008 has now been applied to the production Neon branch after an isolated production-derived branch test. The live verification query confirmed `curriculum_mapping_reviews` exists with 21 columns, RLS enabled, zero policies, and owner `neondb_owner`. Before/after protected-row counts were unchanged: 4 learners, 1 family and 2 `auto_learning_progress` rows. No review rows or learner/progress rows were inserted. The isolated branch also confirmed the schema and RLS structure. The app's signed-in owner workflow still needs a real production acceptance check.

---

## 5. International-framework safeguards

The seven existing lenses remain unchanged in
`src/lib/global-curriculum/catalogue.ts`:

1. NCERT / Indian foundation
2. Official ePathshala resources
3. Cambridge Primary
4. IB Primary Years Programme
5. Singapore MOE Mathematics
6. US Common Core
7. Original Homeschool OS enrichment

They are carried as source-context records for future review, not Class 5
mappings. This pilot makes no Cambridge equivalence, IB accreditation, Singapore
syllabus equivalence, Common Core alignment or automatic standard-satisfaction
claim.

---

## 6. Validation performed

| Gate / check | Actual result |
|---|---|
| Required base ancestry | `906d774` is the current branch ancestor at implementation start. |
| Dependency install | `npm ci` completed successfully (the lockfile’s existing peer-dependency/deprecation notices were reported; no dependency was changed for Phase 6). |
| Class 5 catalogue audit | **Historical Phase 6 delivery result:** `npm run curriculum:inventory` passed with 56 catalogue books / 689 verified titles overall; Class 5 remains 7 books / 86 verified titles. Phase 7 later expanded the live catalogue to 77 books / 892 titles without changing this Class 5 mapping set; see `PHASE7_NCERT_EXPANSION_REPORT.md`. |
| Registry + mapping audit | `npm run curriculum:mapping-audit` passed: 25 original outcomes, 60 drafts, 0 approved, 26 unmapped; all 86 chapters accounted for. |
| Isolated migration + workflow test | `tests/curriculum-mapping.test.ts`: **4/4 pass**. Exercises the real forward/rollback migration schema, owner-only approval/rejection/unmapped decisions, append-only revisions, family separation, supersession integrity, no auto-approval and no learner-progress write. |
| Unit suite | `npm test`: **161/161 pass** (157 previous + 4 Phase 6 tests). |
| Typecheck | `npm run typecheck` passed. |
| Lint | `npm run lint` passed with 0 errors and the 2 pre-existing warnings in `family-calendar.tsx` and `learning-path.tsx`. |
| Production build | `npm run build` passed with non-production placeholder auth configuration only. An unconfigured build correctly stopped on the missing required auth cookie secret; no production secret was used. |
| Local smoke | `npm run test:smoke` passed against the built server with placeholder auth configuration. It verifies `/curriculum-mapping` redirect plus unauthenticated and cross-origin API rejection. Database health was expected `503` because no database URL is configured. |
| Browser test source | New `tests/curriculum-mapping.browser.ts` compiles its real client review component, fixture API and desktop/mobile assertions. |
| Local browser execution | The final `npm run test:ui` attempt reached all **5** browser cases, but each failed before an assertion because neither Playwright Chromium nor `/usr/bin/chromium` exists. A previous `npx playwright install chromium` attempt was blocked by sandbox connection resets to `cdn.playwright.dev`. This is an environment limitation, not a passing result. |
| CI browser execution | PR #61 GitHub Actions `verify` run `43397366690` passed after installing Playwright Chromium; its isolated browser workflow and production build both completed successfully. |

No screenshot is represented as captured from this sandbox because the browser
could not launch. The CI browser workflow passed, but its fixture screenshots are
not published as PR artifacts; capture authenticated preview screenshots during
production acceptance.

---

## 7. Remaining work

1. Apply and verify migration 008 in the live database before production use.
2. Have a qualified reviewer transcribe section-level official NCERT Class 5
   outcomes with page/section evidence before adding any `official` registry
   entry.
3. Conduct Hindi and Urdu language-specialist review for the 25 intentionally
   unmapped Veena and Sitaar chapters.
4. Have a real family owner review the 60 drafts. Seed approved count must stay
   zero until that happens.
5. Add carefully sourced outcome records and review queues for other grades;
   do not bulk-infer mappings from title keywords.
6. Add any international-framework mapping only through this same provenance and
   human-review workflow, with framework-specific evidence.
7. Capture authenticated desktop/mobile review screenshots during preview or
   production acceptance; the isolated CI browser workflow passed, but does not
   publish its fixture screenshots as artifacts.
