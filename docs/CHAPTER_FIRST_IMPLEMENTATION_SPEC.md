# Chapter-First Learning: Implementation Specification

**Status:** Implementation complete through Phase 5 (see `PHASE4_5_COMPLETION_REPORT.md` and `PHASE_STATUS.md`)  
**Primary learning unit:** NCERT chapter  
**Target curriculum baseline:** 56 books / 689 chapter titles across Classes 1–8 (inventory metadata; title verification remains authoritative)  
**Repository:** `sikhizm/homeschool-os`  
**Branch:** `docs/chapter-first-learning-spec`

## 1. Product decision

HomeSchool OS will be a **chapter-first learning application**. A learner chooses a class, subject, textbook, and chapter; the app then guides the learner and parent through learning, practice, an understanding check, and revision.

The app may recommend the next chapter or next session, but it must not make annual plans, weekly plans, competency maps, or daily schedules the primary interaction.

### Product hierarchy

1. **Learner**
2. **Class / grade**
3. **Subject**
4. **Textbook**
5. **Chapter**
6. **Learning session** (read/explore, practice, understanding check, revision as appropriate)
7. **Evidence and progress** (attempts, parent/learner assessment, mastery/retention)

Planning is supporting functionality only. Existing annual pathways and family plans may remain accessible, but they must not block, gate, or dominate direct chapter learning.

## 2. Audit baseline and current constraints

The implementation must be grounded in the existing architecture:

- `src/lib/ncert/textbooks.ts` supplies textbook/chapter metadata, chapter slots, official resource links, and title verification. It deliberately does not reproduce copyrighted textbook contents.
- `src/lib/auto-learning/catalogue.ts` currently builds a mixed queue from annual steps, original lessons, structured modules, and NCERT chapter sessions. Its chapter-session integration is currently limited to **Class 2 and Class 4**.
- Existing chapter sessions use stable identifiers in the form `ncert:<chapterId>:<read|practice|review>`.
- `src/app/api/auto-learning/route.ts` is the existing authenticated queue/progress API. It calculates completion, revision, and prioritization from stored progress.
- `src/app/learn/lesson/lesson-player.tsx` is the existing six-stage player (Discover, Understand, Explore, Practice, Reflect, Complete), with autosave and speech read-aloud.
- `src/app/ncert-books/page.tsx` and `src/app/ncert-books/chapter/` are the existing textbook/chapter discovery surfaces.
- `src/app/dashboard/family-home.tsx` currently gives significant prominence to daily family planning.
- `src/app/dashboard/lesson-card.tsx` already contains reusable parent-facing teaching guidance.
- Existing migrations include chapter progress (`004_ncert_chapter_progress.sql`), auto-learning queue (`005_auto_learning_queue.sql`), family daily plans (`006_family_daily_plans.sql`), learner archiving (`006_learner_archiving.sql`), and planning competencies (`007_planning_competencies.sql`).

The inventory count is not a promise that every title is verified or every chapter has authored teaching content. Runtime chapter availability must respect the existing verified-title and official-resource metadata.

## 3. Goals and non-goals

### Goals

- Make every eligible, verified chapter in the existing Class 1–8 inventory discoverable and directly learnable.
- Provide one consistent chapter-learning experience across grades, with age-appropriate adaptations.
- Preserve all existing user accounts, authentication/session behaviour, learner relationships, progress, assessment, and portfolio records.
- Let learners resume an unfinished chapter session.
- Show chapter-level status and revision needs clearly.
- Reuse the existing lesson player, progress API, parent lesson-card patterns, and official NCERT links wherever possible.
- Make it possible to add higher grades and additional curriculum sources without another grade-specific queue rewrite.

### Non-goals for this initiative

- Rebuilding authentication or changing the auth provider.
- Replacing the database or migrating user identities.
- Rewriting all annual curriculum content.
- Reproducing NCERT textbook pages, questions, answer keys, or other copyrighted material in the app.
- Treating a completed chapter as proof that every related competency is mastered.
- Making an AI-generated annual timetable the default experience.
- Requiring a parent to create a plan before a learner can open a chapter.

## 4. Target user experience

### 4.1 Learner entry

The primary learner landing experience should answer, in this order:

1. **Continue learning** — resume the last active chapter/session.
2. **My books** — choose class/grade, subject, and textbook.
3. **Choose a chapter** — open any available chapter without first creating a plan.
4. **Needs another look** — chapters/sessions requiring revision.
5. **My progress** — chapter completion and learning history.

A lightweight recommendation such as “Suggested next: …” is useful, but must remain secondary to direct choice.

### 4.2 Chapter browser

Navigation hierarchy:

`Learner → Class → Subject → Textbook → Chapter`

Each textbook view should show:
- textbook title, class, subject, and edition/source metadata where available;
- chapter title and sequence;
- chapter availability (available, title unverified, official resource unavailable);
- learner-specific status (not started, in progress, practice due, check due, needs revision, retained);
- a clear **Start / Continue / Review** action.

Do not present unverified chapter titles as verified. Do not create a dead-end chapter page when the official resource is missing; show a clear status and allow any original, independently authored learning content that is actually available.

### 4.3 Chapter Learning Studio

A chapter page is the canonical home for all learning activity for that chapter.

Recommended sections:
- Chapter overview (metadata only; no invented summary presented as official content).
- Official textbook/resource link.
- Learning sessions.
- Parent guide / lesson script.
- Practice evidence and understanding check.
- Progress history and revision state.

Session sequence is configurable by subject/grade, not hard-coded as exactly three sessions for every chapter. The initial default for chapters with no richer authored structure is:
1. **Read & explore**
2. **Practice**
3. **Understanding check**
4. **Revision** (created or recommended only when evidence indicates it is needed)

Class 2’s existing scaffolded guidance should be retained and generalized carefully. Higher-grade guidance must be original, accurate, and grounded in the actual chapter metadata/resource; never infer chapter content from its title alone.

### 4.4 Session player

Reuse `lesson-player.tsx` and its existing phases. Add chapter context and session type rather than building a second player.

The player must:
- identify the textbook and chapter;
- show the current session objective and parent/learner instructions;
- link to the official source;
- save progress as the learner moves through phases;
- retain existing speech/read-aloud and stop behaviour;
- support an understanding outcome such as understood, partly understood, or needs another look;
- resume at the last saved phase when safe and applicable;
- remain usable on mobile.

A session completion event is not equivalent to chapter mastery.

## 5. Functional requirements

### FR-1: Universal chapter integration

- Build chapter sessions from the existing chapter catalogue for every supported grade, rather than a hard-coded Class 2/Class 4 allow-list.
- Include only chapter slots that meet the existing verification/availability rules.
- Preserve stable chapter IDs from the existing catalogue.
- Keep chapter order within a textbook stable.
- Do not silently drop existing annual/original activities; move them to optional/enrichment surfaces or recommendations rather than interleaving them into the core chapter sequence by default.

### FR-2: Chapter-first queue and recommendations

- A learner’s primary queue is based on selected/active chapters and their session state.
- Default recommendation order: resume active session → finish active chapter → revise due chapter → continue to next chapter.
- A parent/learner can override the recommendation by selecting another chapter.
- Recommendations must never prevent direct chapter access.
- Annual pathway tasks and structured enrichment must be separately labelled and secondary.
- Keep the current queue API contract compatible during rollout; add fields rather than abruptly removing fields consumed by existing UI.

### FR-3: Chapter and session status

Expose a derived status model:
- `not_started`
- `in_progress`
- `practice_due`
- `understanding_check_due`
- `needs_revision`
- `completed`
- `retained`

Status must be derived from session/progress evidence, not from a manually assigned planning checkbox alone. Store source evidence and timestamps so a status can be recomputed.

### FR-4: Parent guidance

Reuse `lesson-card.tsx` for:
- objective;
- preparation/materials;
- worked example;
- teaching steps;
- questions/prompts;
- practice/activity;
- expected response guidance;
- easier/harder differentiation;
- completion criteria;
- revision guidance.

Keep the parent guide concise and actionable. Clearly distinguish original HomeSchool OS guidance from official textbook content.

### FR-5: Assessment and retention

- Preserve existing assessment records and assessment summary calculations.
- Chapter completion is a learning workflow milestone, not an assessment score.
- A parent-observed understanding check should record its outcome and optional notes using the existing assessment/progress pathways wherever possible.
- Mastery and retention remain evidence-based and distinct from session completion.
- Revision scheduling should use existing progress history and current retention logic; avoid creating duplicate progress rows for the same legacy event.

### FR-6: Dashboard

Reorder the learner dashboard around:
1. Continue learning
2. Active chapter
3. Chapters needing revision
4. Choose a book/chapter
5. Progress and achievements

The parent dashboard should show:
- each learner’s active chapter and next session;
- resume action;
- chapters needing attention;
- recent assessment/progress evidence;
- book/chapter browser entry.

Daily family plans may remain available as an optional view, but should not be the hero or prerequisite.

### FR-7: Planning de-emphasis

- Keep existing planning data and screens available during the transition.
- Do not delete planning tables, records, API routes, or migration history as part of this work.
- Move annual/weekly planning behind a secondary navigation entry or optional parent tools area.
- Do not add more planning/competency features until chapter learning is complete and validated.
- Existing competencies may inform future learning recommendations, but chapter completion must not automatically mark competencies mastered.

## 6. Data compatibility and preservation requirements

**This is a hard release gate. No existing user or learning history may be discarded.**

### Protected data

Preserve without destructive transformation:
- authentication users, credentials, sessions, and account relationships;
- family/household and learner records;
- learner stage/grade and archive state;
- all existing `auto_learning_progress` records;
- all existing NCERT chapter progress records;
- assessment attempts, outcomes, notes, and summaries;
- portfolio/evidence records;
- existing family-plan and planning records.

### Stable identifiers

- Keep existing chapter IDs unchanged.
- Keep existing session IDs such as `ncert:<chapterId>:read`, `:practice`, and `:review` unchanged.
- Keep existing annual pathway IDs unchanged.
- Do not repurpose an existing ID to mean a different chapter/session.
- If session naming needs to evolve, implement explicit aliases/mapping and dual-read compatibility before any write migration.

### Migration strategy

1. Inspect the live schema and all migration scripts before proposing SQL.
2. Prefer **no schema migration** for the first chapter-first queue/UI release if existing tables can represent the required state.
3. If additive fields/tables are required, make migrations additive, idempotent, and reversible where practical.
4. Never drop, truncate, rename, or overwrite existing progress/assessment tables or columns.
5. Backfill only with deterministic mappings; record row counts and unmapped rows.
6. Read old and new formats during the compatibility window.
7. Do not write duplicate progress for an event already represented by a legacy row.
8. Keep migration 007 planning-competency data intact; this initiative de-emphasizes its UI role, not its stored data.
9. Verify the migration against a database backup/staging copy before production.
10. Document rollback steps and prove that the previous application version can still read existing records.

### Compatibility acceptance tests

- Existing learner can log in without password reset or account recreation.
- Existing family/learner relationships remain unchanged.
- Existing completed and in-progress tasks remain visible and correctly interpreted.
- Existing chapter progress remains visible.
- Existing assessment summaries return the same historical results before and after rollout.
- A legacy completed chapter event is not counted twice after introducing session-level statuses.
- A learner with no history can start a chapter normally.

## 7. Technical implementation direction

### Catalogue and domain layer

Refactor `src/lib/auto-learning/catalogue.ts` so chapter-session generation is a reusable function driven by grade/book/chapter metadata.

Suggested conceptual types (adapt to existing types rather than introducing parallel models unnecessarily):

```ts
type ChapterSessionKind =
  | 'read'
  | 'practice'
  | 'understanding-check'
  | 'revision';

type ChapterAvailability =
  | 'available'
  | 'title-unverified'
  | 'resource-unavailable';

type ChapterProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'practice_due'
  | 'understanding_check_due'
  | 'needs_revision'
  | 'completed'
  | 'retained';
```

The catalogue should return chapter context, stable session IDs, source/official URL, session kind, lesson guidance, grade, subject, and availability. Keep UI labels separate from stable identifiers.

### API

Extend `src/app/api/auto-learning/route.ts` to provide chapter-first data while preserving existing authentication and response compatibility.

Potential response additions:
- activeChapter;
- continueSession;
- chaptersNeedingRevision;
- chapterProgress;
- availableBooks/chapters or a separate read-only catalogue endpoint if that keeps the route focused.

Do not trust learner IDs supplied by the client without the existing ownership/authorization checks. Every read/write must remain scoped to the authenticated family/learner.

### UI and routes

Reuse existing `/ncert-books` and `/ncert-books/chapter/` routes. Inspect the actual dynamic chapter route and its components before changing route structure.

Use the existing lesson player at `/learn/lesson` and preserve its save/resume semantics. Prefer incremental component extraction over route replacement.

### Testing

Use the existing scripts:
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:ui` where UI changes warrant it
- `npm run build`
- `npm run test:smoke`
- `npm run curriculum:inventory`

Add focused tests for catalogue coverage, stable IDs, queue ordering, progress compatibility, access control, and status derivation. Do not claim checks passed unless CI or a local run provides evidence.

## 8. Phased GitHub development plan

Deliver each phase as a small pull request from a fresh branch based on current `main`. Merge only after acceptance criteria and required checks pass. Avoid one large UI/database rewrite.

### Phase 0 — Baseline and safety contract

**Goal:** Freeze the existing behaviour and prove the compatibility surface before implementation.

Tasks:
- Document current progress/assessment tables, primary keys, ownership constraints, and migration state.
- Capture baseline counts for learners, progress rows, chapter progress, assessment records, and portfolio evidence in staging/backup.
- Map all current progress IDs to chapter/session IDs and identify legacy completion rules.
- Add regression tests around authentication, learner ownership, progress reads/writes, assessment summaries, and legacy chapter completion.
- Confirm whether migration 007 is present in the target database; do not assume repository presence means it has run.

Acceptance:
- Baseline inventory and restore/rollback procedure documented.
- Existing test suite baseline recorded.
- No production data changes.

### Phase 1 — Universal chapter engine

**Goal:** Make all eligible verified chapters available through one catalogue path.

Likely files:
- `src/lib/auto-learning/catalogue.ts`
- `src/lib/ncert/textbooks.ts` (only if metadata gaps are demonstrated)
- `src/app/api/auto-learning/route.ts`
- relevant tests under `tests/`

Tasks:
- Remove the Class 2/Class 4-only chapter gate.
- Generate chapter sessions for all supported grades from verified chapter slots.
- Preserve existing stable IDs for Class 2/Class 4 sessions.
- Add a generic, grade-aware session template with subject-specific hooks; retain Class 2’s existing age-appropriate script.
- Keep annual/structured/original activities available but out of the default chapter sequence.
- Add catalogue coverage and duplicate-ID tests.

Acceptance:
- Every eligible verified chapter across supported grades appears once in the browser/catalogue.
- Existing Class 2/Class 4 session IDs and links are unchanged.
- No unverified title is shown as verified.
- Existing progress records resolve to the same learner/session.
- No chapter task is silently mixed with annual planning tasks.

### Phase 2 — Chapter Learning Studio

**Goal:** Make a chapter a complete learning destination.

Likely files:
- `src/app/ncert-books/page.tsx`
- actual files under `src/app/ncert-books/chapter/`
- `src/app/learn/lesson/lesson-player.tsx`
- `src/app/dashboard/lesson-card.tsx`

Tasks:
- Improve book → subject → chapter navigation and status display.
- Add chapter overview, official resource link, session list, parent guide, and progress.
- Reuse the current lesson player and its six phases.
- Add resume behaviour for a partially completed session.
- Keep copyright boundaries explicit.

Acceptance:
- A learner can select any eligible chapter and start without creating a plan.
- Parent/learner can move through the session and return later.
- Session progress autosaves and resumes.
- Official NCERT resource is clearly distinguished from original app guidance.
- Mobile chapter browsing and player are usable.

### Phase 3 — Progress, assessment, and revision

**Goal:** Make chapter progress trustworthy and useful.

Likely files:
- `src/app/api/auto-learning/route.ts`
- existing progress/assessment libraries and migrations only if needed
- tests for progress and assessment

Tasks:
- Derive chapter status from existing session/progress evidence.
- Surface understanding-check outcomes and revision needs.
- Reuse existing assessment records and summaries.
- Implement idempotent legacy-to-new progress interpretation.
- Add revision recommendations without duplicating records.

Acceptance:
- Existing assessment history and summaries are unchanged.
- A session completion does not imply mastery.
- A chapter marked needs revision appears in the revision list.
- Legacy and new progress are not double-counted.
- Ownership checks remain enforced.

### Phase 4 — Chapter-first dashboard and navigation

**Goal:** Change the app’s centre of gravity from planning to doing.

Likely files:
- `src/app/dashboard/family-home.tsx`
- `src/app/dashboard/lesson-card.tsx`
- `src/app/learn/learn-home.tsx`
- navigation components identified from the actual route tree

Tasks:
- Make Continue Learning and active chapter the primary dashboard actions.
- Add My Books / Choose a Chapter.
- Show chapters needing revision and recent learning evidence.
- Move daily/weekly/annual planning to secondary parent tools.
- Preserve access to all existing planning records and routes.

Acceptance:
- A new learner can reach a chapter in no more than the essential grade/book/chapter choices.
- A returning learner can resume in one clear action.
- Planning is optional and never blocks chapter access.
- Parent dashboard clearly distinguishes learning progress from planning completion.

### Phase 5 — Content quality, scale, and release

**Goal:** Validate quality and prepare the chapter-first experience for wider use.

Tasks:
- Review representative chapters across early, middle, and upper primary grades and multiple subjects.
- Improve age-appropriate scripts without asserting content not present in the source.
- Add missing official resource links and correct metadata where verified.
- Test accessibility, responsive layouts, loading/empty/error states, and slow connections.
- Run inventory, tests, lint, typecheck, build, and smoke checks.
- Roll out behind a reversible feature flag or staged release if the current deployment supports it.
- Compare baseline and post-release progress counts.

Acceptance:
- No data loss or auth regression.
- Chapter catalogue and official links pass inventory validation.
- All required CI checks pass.
- Parent/learner pilot can complete and resume a chapter on desktop and mobile.
- Rollback to the previous release preserves all new and old progress records.

## 9. Proposed GitHub issue breakdown

Create and track one issue per phase:

1. **Phase 0 — Audit and lock progress/authentication compatibility**
2. **Phase 1 — Generate chapter sessions for every verified supported grade**
3. **Phase 2 — Build the chapter-first Learning Studio using the existing player**
4. **Phase 3 — Derive chapter progress, assessment outcomes, and revision safely**
5. **Phase 4 — Re-centre learner and parent dashboards on chapters**
6. **Phase 5 — Validate curriculum quality and ship the chapter-first experience**

Each issue should be independently reviewable and linked to this specification. Phase 0 must be completed before any database migration or progress-model change. Phases 1 and 2 should establish direct chapter learning before dashboard polish.

## 10. Release gates and definition of done

The initiative is done only when all of the following are true:

- Chapters are the primary navigation and learning unit.
- All eligible verified chapters in the supported inventory are discoverable.
- A learner can open, learn, practise, check understanding, and revise a chapter without annual/weekly planning.
- Existing authentication and authorization are unchanged.
- Existing progress and assessment history is preserved and correctly interpreted.
- No duplicate progress is created by legacy compatibility logic.
- Annual planning and family plans remain available but secondary.
- No copyrighted textbook content has been copied into original app lesson scripts.
- Tests, lint, typecheck, build, and smoke checks pass with recorded evidence.
- Rollback has been considered and does not require deleting or rewriting learning history.

## 11. Explicit implementation guardrails

- Do not start by redesigning the database.
- Do not rename or regenerate stable chapter/session IDs.
- Do not remove the existing lesson player.
- Do not weaken authentication or learner ownership checks to make tests pass.
- Do not make planning a prerequisite for learning.
- Do not equate completion with understanding, mastery, or retention.
- Do not use chapter titles as the sole basis for inventing lesson content.
- Do not mark a textbook/chapter verified unless the source has actually been checked.
- Do not merge a phase without tests for its compatibility promises.
