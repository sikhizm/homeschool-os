# Phase 07 — Progress Reviews, Reports & Parent Insights

## Full-phase scope
- Private `/reports` route, linked from Dashboard and Portfolio, with learner selection and rolling 7-, 30-, or 90-day date windows.
- Aggregated daily logged activity counts, explicit completion counts, planned vs marked-complete minutes and days with recorded activities.
- Parent-entered current goals, including a clear distinction between current percentage and reporting-window performance.
- Optional portfolio evidence timeline when the existing Phase 06 table is present, including observation kind and support level. If the table is not yet activated, the report remains useful using activity and goal records and states that evidence is unavailable.
- Print/save-as-PDF via browser print, responsive layout, and a blank paper-only weekly reflection prompt.
- Pure date/aggregate tests and unauthenticated access smoke tests.
- No new database schema, no migrations, no learner writes, no public sharing or external data providers.

## Critical interpretation safeguards
The report describes **saved records**, not verified educational attainment. A learner with zero entries is not classified as behind. Counting an activity as completed does not prove mastery. Parent-entered goal percentages are not recalculated or compared as scores. “Independent” means only that specific observation, not permanent competency mastery. Minutes are activity estimates, not verified adult-guided teaching time; do not add across learners to infer family time.

Only the authenticated family can request learner reports. The server first resolves the family and learner; all underlying aggregate queries independently join family membership. The portfolio query is conditional on `to_regclass` and limited to 100 entries, and goal lists are limited to 100. The app does not fabricate missing observations.

## Verification gates
1. Run lint, TypeScript, unit and browser fixture tests, isolated production build and smoke check.
2. Test `/reports` unauthenticated redirect, family switching isolation, and valid date windows on a real preview session with intentional family data.
3. Validate 7-, 30-, and 90-day totals against individual days; verify the empty-state and missing Phase 06 portfolio-table state.
4. Check A4 print preview on desktop and phone layouts. **Printing includes learner display name and private observations**; printed sheets or saved PDFs must be kept private.
5. Review PR and merge only after preview + CI pass. This phase needs no additional Neon migration.

## Deliberate limits
No year-over-year scores, attendance certification, standardised assessments, goals inference, benchmarking, AI judgement, new persistent report archive, automated emailing, data export or external storage. All future automated insights need explicit review and privacy safeguards.
