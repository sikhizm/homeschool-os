# Learning management milestone

## Parent workflow

Open the private dashboard, choose a learner and use the four workspace tabs:

- **Profile:** edit a display name and learning stage. No learner-delete operation exists.
- **Subjects:** add or edit subjects and approaches; archive/restore without removing goals or plans. Suggested foundations cover English, mathematics, environmental exploration, Punjabi and Sikh heritage.
- **Goals:** write individual observable outcomes, optional target dates, parent-recorded progress (0–100%) and observation notes. New goals begin at zero. This version stores the latest progress and observation, not a progress-event timeline.
- **Today:** choose a date, create a balanced 60-minute draft, or add activities individually and optionally link a subject and goal. Edit durations, reschedule dates, adjust order and record reflections. Mark complete only after learning. Completion never changes goal progress automatically.

The starter is a suggestion, not a syllabus or achievement record. Early-years activities favour play, objects, stories and movement. Older learners use discussion, investigation and practice, with CBSE/NCERT as the foundation. Choose actual grade-appropriate NCERT materials with the parent. Split the hour into smaller sessions when appropriate. With several learners, share read-alouds and exploration rather than adding an hour per child.

## Access and privacy

Existing Neon Auth and family membership remain authoritative. The earliest family membership is selected consistently. Family members may read; only owners may write, including when requests contain IDs belonging to another family. Every mutation rechecks ownership in SQL. Linked subjects and goals must belong to the same learner. SQL values are parameterized. Mutating workspace requests require same-origin headers. Responses use `private, no-store`; application error responses do not expose SQL or learner records.

Four additive tables use foreign keys to the existing learner primary key. Their ID type is detected during migration (UUID and bigint are covered by tests). New tables have row-level security enabled, with no public policies or grants; direct untrusted database access is denied. The trusted server connection must own the tables or have BYPASSRLS. Do not use a public/browser database credential. Archiving a subject prevents new goal/activity links while preserving prior records.

## Local setup

Use Node.js 22+ (validated here on Node 24) and `npm ci`. Copy `.env.example` to an ignored `.env.local` only when needed, then securely supply the real bindings. Never commit values. Node database scripts read environment variables; Next.js automatically reads `.env.local` for application commands. For scripts with local files use `node --env-file=.env.local scripts/database.mjs inspect`.

- `npm run db:inspect`: inspect schema metadata without printing private row data.
- `npm run db:migrate`: apply `migrations/001_learning_management.sql`. It is transactional, additive and repeatable. It does not seed or alter existing learner/auth records and verifies learner fingerprints before and after.
- `npm run dev`: start development.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`: verification.
- `npm start`: production server; validate public landing/roadmap/sign-in routes and private dashboard after signing in.

`npm test` uses isolated PostgreSQL (PGlite) with synthetic fixtures, never DATABASE_URL. Browser tests render the real workspace component against the same SQL service in an isolated fixture server. They test persistence, goals, completion, archival and mobile layout; they do not replace a real Neon Auth session test. `npm run test:ui` expects Chromium at `/usr/bin/chromium`; override with `CHROMIUM_PATH` or install a browser using Playwright and provide its executable path.

## Production rollout

1. Obtain secure Neon/Vercel access; inspect the live schema and existing table policies with the approved project credentials. Confirm columns, constraints and trusted server role before applying anything. Take a Neon restore point/branch through the project’s normal process.
2. Run all local checks. Inspect `npm run db:inspect` output against the migration. Apply only this additive migration, then repeat it to confirm idempotence. Verify existing learner records remain unchanged without copying them to public logs.
3. Verify with a real parent session: existing learners still load; create a subject, a genuine goal and an intended plan; edit only with the parent’s permission. Never create synthetic production progress or learner records for smoke testing. Check owner/member isolation using authorized test accounts.
4. Deploy once to the existing Vercel project after verification, using its linked GitHub workflow or authorized CLI. Avoid preview churn. The production URL is https://homeschool-os-gamma.vercel.app.
5. Check public pages, authentication, the private dashboard and database health in production. Existing client/server auth secrets must match the current Vercel environment.

If deployment must be rolled back, restore the preceding Vercel deployment; retain the additive tables and all learning data. Do not run destructive down-migrations.

## Current verification limits

The onboarding machine initially had working GitHub Git access but no Neon/Vercel credentials or connected tools. Production domain access was denied by network policy. Isolated tests cannot establish the live schema, existing four learner records, real parent sign-in, or production rollout. These remain required rollout checks until access is supplied.

## Verification in this cloud instance (27 October 2026)

- Frozen `npm ci`, lint, route type generation and TypeScript checks passed.
- Eight isolated database/domain tests passed, including repeatable migrations over UUID/bigint learner IDs, unchanged learner fixtures, cross-family denial, member write denial, direct-role RLS denial, goal progress and planner persistence.
- One browser scenario passed at desktop and 375px mobile sizes: subjects, goals, explicit progress, a balanced starter, completion without goal changes, linked activities, rescheduling, profile edits, archive/history and read-only UI. No browser exceptions or horizontal overflow were observed.
- The production build passed with ephemeral **local-only** auth configuration and no production credentials.
- The local production server returned expected public pages, redirected unauthenticated dashboard access, rejected unauthenticated workspace GET/POST (401), and rejected cross-origin POST (403).
- Database health returned 503 as expected without DATABASE_URL; real Neon connectivity and parent authentication remain unverified. No live database migration or Production deployment was performed.
