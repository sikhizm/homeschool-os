# Phase 0 — Live database compatibility audit

**Audit date:** 2026-11-11  
**Repository baseline:** `main` at the Phase 2 merge commit `f0a0944283554213723a09dec3a96213e574ed33`  
**Database:** Neon production branch `br-square-hat-b3nqxmxd` (project `empty-bread-41545600`)  
**Method:** Read-only schema inspection, table inventory, aggregate counts, backup/restore rehearsal, isolated migration tests, and verified production application of migrations 004 and 007. No existing progress or learner records were rewritten.

## Executive result

The production database now has the additive schema required by migrations 004 and 007. The fresh backup was restored to an isolated branch and protected-table counts and key relationships matched. Existing learner and progress records were preserved. Phase 0's database compatibility and backup/restore gates are complete; application-level authenticated API and full regression-suite verification remain outstanding.

- Migration 004's `public.ncert_chapter_progress` table was applied to production on 2026-11-11 after isolated schema and insert/delete smoke tests.
- Migration 007's `competency_ids` column was applied to production on 2026-11-11 after isolated verification.
- The two separate migration files prefixed `006` represent different changes; the daily-plans table and learner archive column are present.
- Migration 005's `auto_learning_progress` table is present and its observed schema matches the task-progress design.
- The two existing progress rows form one annual activity completion and its associated understanding record. They are distinct evidence types, not duplicate activity completions.
- No migration ledger table was found in the inspected public tables or the searched information-schema table names. Migration execution must therefore be verified by schema evidence, not inferred from filenames or repository history.

**Phase 0 database work is complete.** Do not treat this as proof of end-to-end authenticated API behaviour; the final application regression checks below must still be recorded before starting Phase 3.

## Live production inventory

Counts captured from the production branch on 2026-11-11:

| Measure | Rows / state |
|---|---:|
| Learners | 4 |
| Active learners | 2 |
| Family memberships | 1 |
| `auto_learning_progress` | 2 |
| `learning_activities` | 25 |
| `learning_portfolio_entries` | 0 |
| `learning_sessions` | 0 |
| `family_daily_plans` | 0 |
| `learning_planning_periods` | 0 |
| `learner_objectives` | 0 |
| `ncert_chapter_progress` | 0 (table created after initial baseline) |

The two progress records, grouped without learner identifiers:

| Task ID | Status | Rows |
|---|---|---:|
| `annual:ukg:w01:core` | `completed` | 1 |
| `assess:annual:ukg:w01:core` | `completed` | 1 |

The application assessment model treats the ordinary task record as participation/completion and the `assess:` record as understanding evidence. Its summary excludes internal evidence IDs from activity-completion totals. Preserve both rows and their IDs.

## Migration state — verified by live schema

| Migration file | Expected change | Live evidence | Result |
|---|---|---|---|
| `001_learning_management.sql` | Learning management tables | `learners`, `learning_activities`, `learner_objectives`, `learning_subjects`, `subjects` exist | Core tables present; exact execution record unavailable |
| `002_learning_planning.sql` | Planning periods | `learning_planning_periods` exists | Table present; no rows |
| `003_learning_portfolios.sql` | Portfolio evidence table | `learning_portfolio_entries` exists | Table present; no rows |
| `004_ncert_chapter_progress.sql` | `ncert_chapter_progress` | Production table exists; UUID learner FK, composite primary key, status/note checks, RLS enabled, public privileges revoked | **Applied 2026-11-11; verified** |
| `005_auto_learning_queue.sql` | `auto_learning_progress` | Table exists with learner/task composite key and `completed` / `needs_revision` status constraint | Present; 2 rows |
| `006_family_daily_plans.sql` | `family_daily_plans` | Table exists | Present; no rows |
| `006_learner_archiving.sql` | `learners.archived_at` and active-family index | `archived_at` column exists | Column present |
| `007_planning_competencies.sql` | `learning_planning_periods.competency_ids` | Production column exists as `text[] NOT NULL DEFAULT '{}'`; no existing planning rows were changed | **Applied 2026-11-11; verified** |

There is no single unique numeric sequence for the two `006` files. Any future migration tracking should identify migrations by filename or immutable identifier, not by the numeric prefix alone.

## Application compatibility risks

### 1. NCERT chapter-progress API is not ready against this database

`src/app/api/ncert-chapters/[chapterId]/progress/route.ts` queries `ncert_chapter_progress` in GET and inserts/upserts it in POST. Its error responses explicitly tell operators to check migration 004.

The production table now exists with the expected columns, constraints, learner foreign key, RLS enabled, and public privileges revoked. An isolated smoke insert and cleanup succeeded. Authenticated GET/POST and owner/family-isolation behaviour still require application-level verification.

### 2. Planning competency migration is also outstanding

The repository migration was applied to production after an isolated migration test. The resulting column is `text[] NOT NULL DEFAULT '{}'`. The table currently has zero rows, so no planning records required backfill.

### 3. Auto-learning progress and assessment evidence are already live

`auto_learning_progress` exists and the route uses the authenticated user's family membership to scope learner reads. Progress writes require owner membership and validate the task against the learner's grade catalogue. Keep those ownership checks.

The live records are:
- `annual:ukg:w01:core` — completed activity.
- `assess:annual:ukg:w01:core` — completed understanding evidence.

The code's assessment summary filters internal IDs from activity completion counts. Session completion is not mastery; mastery uses a separate `mastery:` record and recall evidence uses `recall:` IDs. No legacy conversion or rewrite is justified by the two observed rows.

### 4. Existing legacy chapter completion compatibility remains important

The auto-learning GET route interprets a completed legacy chapter ID as completion of the newer `ncert:<chapterId>:read`, `:practice`, and `:review` session IDs. This is a read-time compatibility rule. Do not remove it or create corresponding duplicate rows as part of Phase 3 without dedicated regression coverage.

## Compatibility matrix

| Surface | Production evidence | Safe next action |
|---|---|---|
| Authentication / family ownership | One family membership; existing learner/family tables; app routes scope through authenticated membership | Preserve current auth and owner-only write rules |
| Learner profiles | 4 rows; 2 active; `archived_at` exists | Preserve IDs, family links, stage, archive state |
| Auto-learning progress | 2 rows in existing table | Preserve exact task IDs and statuses |
| Understanding / mastery | One `assess:` row; no observed `mastery:` or recall rows | Preserve namespaces and distinct semantics |
| NCERT chapter progress | Table present; 0 rows; constraints and RLS verified | Complete authenticated API GET/POST and owner-only write checks |
| Portfolio evidence | Table exists, 0 rows | Preserve table and future evidence |
| Family daily plans | Table exists, 0 rows | Preserve table and routes |
| Planning periods / competencies | Period table exists, 0 rows; `competency_ids` text[] column present | Verify planning workspace reads/writes against the new column |
| Backup / restore | Fresh production snapshot restored to isolated branch; protected counts and relationship checks match | Backup/restore rehearsal passed |

## Backup and restore evidence

- Snapshot ID: `snap-green-water-b31843hn`
- Snapshot name: `homeschool-os-phase-0-current-prod-2026-11-11`
- Created: `2026-11-11T09:11:37Z`
- Source: production branch `br-square-hat-b3nqxmxd`
- Restored branch: `br-rough-frog-b3q75x0i` (`phase-0-current-prod-restore-2026-11-11`)
- Restore status: `restored`
- Compared protected table counts on production and restored branch: learners 4, family_members 1, auto_learning_progress 2, learning_activities 25, learning_portfolio_entries 0, learning_sessions 0, family_daily_plans 0, learning_planning_periods 0, learner_objectives 0. All matched.
- Relationship checks: 0 orphaned auto-learning progress rows, activities, family memberships, or NCERT progress rows.
- The two existing auto-learning records and their statuses remained unchanged.
- The restored branch was used for the NCERT progress table smoke insert/delete; the temporary row was removed.
- Migration 007 was prepared and tested on a temporary Neon branch; the temporary test branch was discarded before applying the additive change to production.

## Remaining application verification

1. Run the repository's lint, typecheck, unit, UI/browser, and smoke suites against the merged application baseline and record actual results. Previous CI evidence is incomplete: the smoke test previously failed to connect to its local server, and PR #51 had no GitHub Actions workflow run.
2. Exercise NCERT progress GET as an authenticated family member and confirm only that member's family learners are returned.
3. Exercise NCERT progress POST as a family owner; verify the row is saved and idempotently upserted.
4. Exercise POST as a non-owner family member and as a user outside the learner's family; verify no write is possible.
5. Verify the planning workspace can read and write `competency_ids` after migration 007.
6. Confirm no changes to legacy assessment summaries, ownership checks, or historical progress interpretation.

The two migrations were applied only after fresh backup/restore evidence and isolated schema tests. No progress rows were migrated, duplicated, or rewritten.

## Safety statement

Production changes were limited to the two approved additive schema migrations: creation of `ncert_chapter_progress` with its constraints/RLS and addition of `learning_planning_periods.competency_ids`. Existing production records, credentials, auth configuration, and learner ownership rules were not changed. Backup/restore and database compatibility gates are complete; authenticated API and full regression verification remain open.
