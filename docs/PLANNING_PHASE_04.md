# Phase 04 — Annual, weekly and daily learning planning

## Purpose
One private parent workspace for planning an Indian academic year (1 April–31 March), setting a focus for each Monday–Sunday week, viewing existing daily learning activities, and opening any day directly in the pre-existing daily planner.

## Implemented
- Authenticated `/planning` route linked from the private `/dashboard`.
- Learner selector, date navigation, academic year overview, weekly focus, seven-day activity/completion summaries.
- Two editable planning periods with title, priorities and notes. Saving the same learner/period updates the same record rather than creating duplicates.
- Daily links to `/dashboard?date=YYYY-MM-DD` use server-validated dates, preserving existing individual daily activity storage.
- Family membership authorizes reads; owner-only writes are guarded inside the database mutation. Input validation, same-origin requirements, request size limits, parameterized queries, private/no-store responses and sanitized errors.
- April–March school year, leap-day, week boundary and invalid-input unit tests.
- Additive migration `002_learning_planning.sql` with RLS enabled and no grants for untrusted users.
- Existing goals/activities and completion logic remain unchanged. Neither a yearly nor a weekly planning note is evidence of mastery.

## Data flow
`learning_planning_periods` has one record per learner/kind/start date, with kind `year` or `week`. Weekly activity summaries are aggregated from the existing `learning_activities` table. The annual overview intentionally stores high-level priorities, not 365 fabricated activities.

## Privacy and safety
Do not create child data or artificial progress in production for testing. This is a parent-run private planner. As with the existing workspace, preview connected to production Neon can write real records. Only test with intended records or a properly isolated preview database. Keep secrets in Vercel only.

## Deployment and verification
1. Check `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui` and `npm run build`. GitHub CI runs these with synthetic fixtures.
2. **Before enabling planning in the live app**, inspect the intended Neon branch, take the usual restore point and run `npm run db:migrate:planning` with securely provided `DATABASE_URL`. The migration is additive and repeatable. It does not edit pre-existing learner rows.
3. Verify the new table is owned by the trusted server DB role, RLS enabled, and no public policies/grants exist.
4. With an intended parent session, visit `/planning` and confirm a year and weekly focus can be saved and edited, visible in future sessions, and inaccessible to another family; inspect the weekly totals against the daily planner.
5. Check an unauthenticated request returns 401, non-owner POST is denied, cross-origin POST is denied, and invalid dates/text are rejected.
6. Review mobile layout and Vercel preview; merge the one Phase 04 PR only after CI and actual planning access checks.

## Scope limits
- This is structured **year/week planning**, not a full academic syllabus, automatic lesson generator, attendance system or yearly calendar heatmap. Subjects and curriculum competency goals remain managed by the existing private workspace.
- Days can be edited in the existing daily planner, which already supports activity duration, completion, reflection, rescheduling and a 60-minute starter.
- No automatic weekly plan copying, goal progress changes, or AI-generated attainment.
- The year is April–March, not January–December. The calendar is a planning convention, not an assertion about an individual school's published term dates.
