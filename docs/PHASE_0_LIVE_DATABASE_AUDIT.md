# Phase 0 — Live database compatibility audit

**Audit date:** 2026-11-11  
**Repository baseline:** `main`, including merged Phase 1/2 work and CI fixes through commit `2e7c7b17803d37e4ab227cac7b0d84dd94e786fc`  
**Database:** Neon production branch `br-square-hat-b3nqxmxd` (project `empty-bread-41545600`)  
**Method:** Read-only schema inspection, table inventory, aggregate counts, backup/restore rehearsal, isolated migration tests, verified production application of migrations 004 and 007, source-level ownership regression checks, and full green CI on main.

## Executive result

<badge>Phase 0 complete — private family deployment scope</badge>

Phase 0 is accepted for this private, family-operated application. The production database has the additive schema required by migrations 004 and 007. A fresh production snapshot was restored to an isolated branch; protected-table counts and key relationships matched. Existing learner and progress records were preserved.

The merged main CI run **#193** passed all configured checks: dependency installation, lint, TypeScript, unit tests, Chromium installation, browser workflow with isolated PostgreSQL fixtures, production build, production server startup, and smoke tests. [View run #193](https://github.com/sikhizm/homeschool-os/actions/runs/43041756749).

The project retains server-side authentication, family-membership scoping, owner-only writes, same-origin checks, parameterized SQL, and private/no-store responses. Source-level regression tests cover these contracts. The NCERT and planning API routes were reviewed against the live schema and their ownership predicates.

**Scope decision:** exhaustive authenticated API integration matrices, every role permutation, and adversarial cross-family scenarios are deferred. They are not release blockers for the current small, trusted family deployment. This is a conscious reduction in test scope, not a claim that those scenarios were all executed. If the app becomes multi-family/public, or gains external users, add isolated authenticated integration tests before broad release.

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

## Application compatibility and safety review

- NCERT chapter progress GET scopes learner rows through the signed-in user's family membership. POST validates the chapter and payload, then permits upsert only when the signed-in user is an owner of the learner's family.
- Planning GET checks family membership before returning periods and activity aggregates. Planning POST validates competency IDs and writes only for an owner in the user's primary family.
- Both APIs use parameterized SQL and private/no-store responses. Writes enforce same-origin checks and bounded request sizes.
- The auto-learning API preserves separate activity, understanding, mastery and recall evidence. Session completion alone is not mastery.
- Legacy completed chapter IDs continue to be interpreted at read time as the newer NCERT read/practice/review sessions. No duplicate historical rows were created.
- Source-level tests cover session use, family membership, owner checks, planning competency reads/writes and legacy progress compatibility.
- Browser tests use isolated PostgreSQL fixtures and synthetic data; they do not connect to production learner records.

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

## CI evidence

GitHub Actions run #193 on main completed successfully on 2026-11-11:
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx playwright install chromium`
- Browser workflow with isolated PostgreSQL fixtures
- Isolated production build with no production credentials
- Next.js production server readiness check
- `npm run test:smoke`

The earlier CI failures were resolved: the Next.js dynamic route slug conflict was fixed by standardizing the learner route segment, the stale `id` reference was corrected, and Playwright installation no longer invokes flaky Ubuntu APT mirror dependency installation.

## Deferred checks and future trigger

The following are intentionally not required to close Phase 0 for the current private family deployment:
- A full authenticated API matrix for every family role.
- Exhaustive cross-family adversarial access tests.
- Repeated manual testing of every endpoint and role permutation.

Reopen this verification work before inviting unrelated families, enabling public registration, or treating the app as a multi-tenant service. At that point, add isolated authenticated integration tests for NCERT progress GET/POST, owner/non-owner and cross-family rejection, idempotent upsert, and planning competency persistence.

## Safety statement

Production changes were limited to the two approved additive schema migrations: creation of `ncert_chapter_progress` with its constraints/RLS and addition of `learning_planning_periods.competency_ids`. Existing production records, credentials, auth configuration, and learner ownership rules were not changed. Backup/restore, schema compatibility, source-level access-control review, and the full configured CI suite are complete for the current private family scope.
