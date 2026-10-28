# November 2026 Pilot Readiness — Review Package

## Implemented in the app
- Private, parent-authenticated `/november-pilot` page with print/save-as-PDF layout.
- Seven-day schedule for 2–8 November 2026, 60 minutes **total** of shared adult-guided time daily: 15 shared, 20 Class 4, 15 UKG, 10 preschool. Infant caregiving is responsive, not a formal time block.
- 12 Class 4 baseline prompts across numeracy, reading, writing, observation and learning habits, with observable criteria and repair suggestions.
- 8 UKG play-led literacy, numeracy, shapes, communication and movement prompts.
- 8 preschool Montessori-inspired practical-life experiences, including materials and safety notes.
- Screen-free infant caregiver guidance and an end-of-week observation review.
- Links to existing date-specific daily planner; **does not** insert synthetic lessons or fake progress.

## Verification / release
Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, and `npm run build`. Review page from an authenticated parent session, print on A4, and inspect on mobile.

## Explicitly incomplete
The actual November pilot **has not occurred**. Class 4 and UKG skill prompts are not verified student results; a parent must run the real activities and fill paper notes. No official CBSE/NCERT outcome-code mapping or formal diagnostic validation is claimed. Family-data schemas and migration/restore drills remain separate FocusDesk tasks; this package alone must not mark the entire Family Profiles milestone completed.

## Privacy
The pilot content is generic. No names, child scores, clinical inferences, photographs or observations are committed. Printed notes stay with the family; browser printing is local. No database migration or client-side permanent storage is added.
