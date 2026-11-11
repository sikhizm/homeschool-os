# Issue #40 — Authentication, learner ownership, and progress compatibility baseline

**Audit branch:** `audit/issue-40-auth-progress-baseline`  
**Baseline commit:** `47bb39914ad7237a63e873629a9b8298ed208e88` (merged chapter-first specification, 2026-11-11)  
**Scope:** Read-only source/schema audit plus regression tests. No production database was queried or changed.

## Executive findings

1. **Authentication is one Neon Auth user session.** Server routes resolve the signed-in user with `auth.getSession()`; protected pages use Neon Auth middleware. The repository does not currently implement independent child credentials or a child sign-in flow.
2. **Learners are family-owned profiles, not auth users.** API access joins `learners.family_id` to `family_members` using the authenticated user ID. Learner IDs supplied by a browser are not sufficient authorization.
3. **Current write authority is owner-only in the learning APIs audited.** `auto-learning`, NCERT chapter progress, learner creation/archive, and the workspace mutation service require `family_members.role = 'owner'`. A child-facing UI cannot safely write progress under a distinct child identity until an explicit child-profile/session authorization model is designed. Do not loosen these checks as a shortcut.
4. **Progress is stored in two separate systems.** `auto_learning_progress` stores stable task IDs and assessment evidence; `ncert_chapter_progress` stores chapter-level assignment/status and parent notes. The auto-learning route interprets a legacy chapter-level completion ID as completion of the newer `:read`, `:practice`, and `:review` sessions for the same chapter.
5. **Assessment is evidence-based.** Activity completion, parent-observed understanding, and later recall/mastery are separate namespaced records in the existing auto-learning table. A completion click alone does not mean understanding or mastery.
6. **Migration execution state and production row counts are not observable from this repository.** Migration files prove what is committed, not what ran in the target database. No live DB credentials or read-only DB connector were available for this audit. Staging/backup row counts and migration ledger must be captured by the operator before any schema or data change.

## Authentication and ownership map

| Surface | Identity / authorization observed | Compatibility rule |
|---|---|---|
| Protected pages | `src/middleware.ts` delegates to Neon Auth middleware; matcher covers dashboard, learn, library, settings, learners | Preserve provider, session/cookie configuration, login route and matcher behaviour |
| Server auth | `src/lib/auth/server.ts` creates Neon Auth from `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` | Do not rotate or replace auth configuration as part of chapter work |
| Browser auth | `src/lib/auth/client.ts` creates Neon Auth client | Preserve existing sign-in/recovery flow |
| Learner creation | `POST /api/learners`: authenticated user must have an owner family membership; family ID is derived server-side | Never accept family ID or role from browser payload |
| Learner reads | `GET /api/auto-learning`: learner is visible only through a family membership belonging to session user | Keep every query scoped to session user and family |
| Progress writes | `POST /api/auto-learning`: requires owner role and checks learner stage/catalogue before writing | Owner remains the only writer until a designed child-profile authorization mechanism exists |
| NCERT progress | `GET /api/ncert-chapters/[chapterId]/progress` reads family learner rows; POST writes only for owner membership | Keep parent notes and owner writes protected |
| Workspace mutations | `learnerAccess(..., write=true)` and each mutation require owner role | Do not make child access equivalent to parent administration |

### Product direction recorded from the owner (not implemented in Phase 0)

- One family owner login; parent controls all learner profiles.
- Child profiles are distinct learner experiences, **not separate auth accounts** by default.
- A selected child experience is scoped to that learner's grade/class and assigned activities.
- Parent assigns curated chapter/activity work to a date; child completes that day's required work. Incomplete items roll forward; the child cannot skip the required sequence by changing the calendar date.
- This requires a future explicit, secure learner-profile selection/session model. A client-side learner ID selector alone is not an authorization boundary. Parent-only APIs must remain parent-only; child progress submission should use a narrowly scoped learner capability or server-side active-profile context, with tests for cross-learner isolation.
- Daily assignments/locks/rollover are not currently proven by the existing schema. Do not assume `family_daily_plans` or `ncert_chapter_progress` alone implements that workflow.

## Progress and assessment compatibility matrix

| Data | Current source | Key / semantics | Required preservation |
|---|---|---|---|
| Family ownership | `families`, `family_members` (referenced by APIs/migrations) | `family_members.auth_user_id`, `family_id`, `role` | Never reassign family ownership or infer parent/child identity from display name |
| Learner profiles | `learners` | `id`, `family_id`, `stage`, `archived_at` | Keep learner IDs, family relation, stage and archive state |
| Auto-learning progress | Migration `005_auto_learning_queue.sql` | PK `(learner_id, task_id)`; statuses `completed` / `needs_revision` | Keep every row and task ID; upserts are keyed by same stable ID |
| NCERT chapter progress | Migration `004_ncert_chapter_progress.sql` | PK `(learner_id, chapter_id)`; status `assigned` / `in_progress` / `completed`; parent note and timestamps | Keep chapter ID, notes, status and timestamps |
| Assessment evidence | Same `auto_learning_progress` table | `assess:<taskId>`, `mastery:<taskId>`, `recall:<quality>:<reviewTaskId>` | Never count internal evidence as activity completion; preserve all namespaced rows |
| Portfolio | Migration `003_learning_portfolios.sql` | `learning_portfolio_entries`, learner/date/kind/evidence | Preserve evidence and history |
| Family daily plan | Migration `006_family_daily_plans.sql` | `(family_id, learning_date)`, budget and JSON slots | Preserve plans; no proof of automatic rollover/locked daily sequence |
| Planning periods | Migration `002_learning_planning.sql` | `learning_planning_periods` with year/week dates | Preserve rows even if planning UI becomes secondary |
| Competencies | Migration `007_planning_competencies.sql` | `competency_ids text[]` on planning periods | Preserve values; repository presence does not establish DB application |

### Stable identifiers and legacy completion

- Chapter session IDs currently include `ncert:<chapterId>:read`, `:practice`, and `:review`.
- Annual pathway IDs originate from `annualStepsForStage`; do not regenerate or repurpose them.
- Assessment IDs are derived from the underlying task ID and must remain namespaced as currently implemented.
- In `GET /api/auto-learning`, a completed legacy chapter ID without a session suffix is treated as completion of all three newer session IDs for that chapter. This is compatibility interpretation, not a data migration. Keep it until an explicit, tested migration strategy replaces it.
- The catalogue currently has a Class 2 / Class 4 chapter-session allow-list. That is a known product limitation, not evidence that other grades have no curriculum.

## Migration inventory — repository evidence only

| File | Purpose | DB execution verified? |
|---|---|---|
| `001_learning_management.sql` | Subjects, objectives, activities, plan starter | No |
| `002_learning_planning.sql` | Year/week planning periods | No |
| `003_learning_portfolios.sql` | Portfolio evidence | No |
| `004_ncert_chapter_progress.sql` | NCERT chapter progress | No |
| `005_auto_learning_queue.sql` | Auto-learning progress | No |
| `006_family_daily_plans.sql` | Family/date plans | No |
| `006_learner_archiving.sql` | `learners.archived_at` and active-family index | No |
| `007_planning_competencies.sql` | Planning-period competency IDs | No |

There are two distinct files with a `006` prefix. Do not assume a numeric filename alone is a unique migration ledger key.

## Baseline evidence and outstanding operator checks

| Measure | Result |
|---|---|
| Source baseline | `47bb39914ad7237a63e873629a9b8298ed208e88` |
| Repository migration files | 8 files listed above |
| Production/staging learner count | **Not captured — requires read-only DB access** |
| `auto_learning_progress` row count | **Not captured — requires read-only DB access** |
| `ncert_chapter_progress` row count | **Not captured — requires read-only DB access** |
| Assessment evidence row count | **Not captured — requires read-only DB access** |
| Portfolio row count | **Not captured — requires read-only DB access** |
| Family plan / planning row counts | **Not captured — requires read-only DB access** |
| Applied migration ledger (including 007) | **Not verified — inspect target DB migration ledger** |
| Backup/restore rehearsal | **Not performed — staging/backup required** |

Do not run `db:migrate` or any migration script as part of this audit. Before a future migration, take a verified backup, record counts for every protected table, record the actual migration ledger, and rehearse restore against a staging copy. After any approved migration, compare counts and key relationships before enabling the new application behaviour.

## Backup and rollback procedure for future phases

1. Pause writes or use the provider's consistent backup/snapshot facility.
2. Record timestamp, database/environment identity, current deployed commit, migration ledger, and counts for all protected tables.
3. Verify the backup can be restored to an isolated staging database. A backup that has not been restore-tested is not a rollback plan.
4. Run additive migrations against staging first; compare counts, keys, ownership joins and assessment summaries before/after.
5. Deploy application code only after staging regression checks pass.
6. Roll back application code first if needed. Do not roll back by deleting new/old learner history. Any additive schema rollback must be explicitly reviewed and must not discard records.
7. If a migration has written data, prefer forward-compatible repair or restore to a separately reviewed recovery point; do not automatically execute destructive down SQL.

## Phase 0 conclusion

**Source-level audit complete; live database baseline remains blocked pending read-only DB/staging access.** No production data or schema was changed. The next phase must not introduce schema changes or progress rewrites until the outstanding counts, migration ledger, and restore rehearsal are recorded. Child-profile authorization and daily locked assignment/rollover are product requirements for later design, not reasons to weaken the existing owner-only security model.
