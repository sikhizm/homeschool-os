# Phase 0 — Live database compatibility audit

**Audit date:** 2026-11-11  
**Repository baseline:** `main` at the Phase 2 merge commit `f0a0944283554213723a09dec3a96213e574ed33`  
**Database:** Neon production branch `br-square-hat-b3nqxmxd` (project `empty-bread-41545600`)  
**Method:** Read-only schema inspection, table inventory, aggregate counts, and limited progress-ID inspection. No SQL writes, migrations, or production data changes were performed.

## Executive result

The live database is **not at the complete migration state implied by the repository**.

- Migration 004's `public.ncert_chapter_progress` table is absent, although the application route reads and writes it.
- Migration 007's `competency_ids` column is absent from `learning_planning_periods`.
- The two separate migration files prefixed `006` represent different changes; the daily-plans table and learner archive column are present.
- Migration 005's `auto_learning_progress` table is present and its observed schema matches the task-progress design.
- The two existing progress rows form one annual activity completion and its associated understanding record. They are distinct evidence types, not duplicate activity completions.
- No migration ledger table was found in the inspected public tables or the searched information-schema table names. Migration execution must therefore be verified by schema evidence, not inferred from filenames or repository history.

**Phase 0 remains open.** This audit establishes live schema and row-count evidence, but does not establish a verified backup/restore rehearsal. Do not start a migration or progress-model rewrite until backup/restore evidence and an operator-approved migration plan exist.

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
| `ncert_chapter_progress` | **Table absent** |

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
| `004_ncert_chapter_progress.sql` | `ncert_chapter_progress` | `to_regclass('public.ncert_chapter_progress')` returned false | **Not applied / table absent** |
| `005_auto_learning_queue.sql` | `auto_learning_progress` | Table exists with learner/task composite key and `completed` / `needs_revision` status constraint | Present; 2 rows |
| `006_family_daily_plans.sql` | `family_daily_plans` | Table exists | Present; no rows |
| `006_learner_archiving.sql` | `learners.archived_at` and active-family index | `archived_at` column exists | Column present |
| `007_planning_competencies.sql` | `learning_planning_periods.competency_ids` | Column absent from `information_schema.columns` | **Not applied / column absent** |

There is no single unique numeric sequence for the two `006` files. Any future migration tracking should identify migrations by filename or immutable identifier, not by the numeric prefix alone.

## Application compatibility risks

### 1. NCERT chapter-progress API is not ready against this database

`src/app/api/ncert-chapters/[chapterId]/progress/route.ts` queries `ncert_chapter_progress` in GET and inserts/upserts it in POST. Its error responses explicitly tell operators to check migration 004.

Because the table is absent, these endpoints will return their handled 503 error on this database when their SQL executes. This is a confirmed schema/API mismatch, not a reason to silently apply a migration. Migration 004 remains unapplied pending backup/restore verification and explicit approval.

### 2. Planning competency migration is also outstanding

The repository contains `migrations/007_planning_competencies.sql`, but production `learning_planning_periods` has no `competency_ids` column. Current observed planning-period row count is zero. Keep the migration unapplied until the same release-safety process is satisfied; do not infer that a committed script ran.

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
| NCERT chapter progress | Table absent | Treat API as unavailable until migration 004 is explicitly approved and applied |
| Portfolio evidence | Table exists, 0 rows | Preserve table and future evidence |
| Family daily plans | Table exists, 0 rows | Preserve table and routes |
| Planning periods / competencies | Period table exists, 0 rows; `competency_ids` absent | Do not assume migration 007 ran |
| Backup / restore | No restore rehearsal evidence available in this audit | Phase 0 release gate remains open |

## Outstanding release gates

1. Record the production backup/snapshot identifier and timestamp using the database provider's supported process.
2. Restore that backup to an isolated staging branch/database and verify that the restored application can read the protected tables.
3. Capture the full protected-table counts and key-relationship checks on the restored staging copy.
4. Confirm the intended production branch/environment and document the migration ledger strategy. There is no visible migration ledger in the inspected schema.
5. Review migration 004 and 007 against staging; only then request explicit approval before applying either to production.
6. Run the existing auth/progress/assessment regression suite and record actual CI results.
7. Verify the NCERT progress API after an approved migration, including family ownership and owner-only write behaviour.

## Safety statement

This audit was read-only. No production schema, records, credentials, auth configuration, or migration state was changed. Migration 004 and migration 007 were **not** applied. Phase 0 is not complete until the backup is restore-tested and the remaining release gates are evidenced.
