# Phase 03 — Curriculum library and goal handoff

## Scope delivered
- A private curriculum catalogue with six stages (early years through Class 12), subject filtering and 37 curated competency examples.
- Stage and subject classification, suggested parent-child activities, explicit prerequisite relationships and clickable prerequisite navigation.
- Links to applicable NCERT frameworks/learning-outcome collections. All descriptions are original teaching suggestions, **not verbatim NCERT learning outcomes** and not guaranteed alignments to a specific edition/chapter or examination board syllabus.
- Authenticated parent handoff from a catalogue competency ID to the existing Goals tab. The server looks up IDs from the static library; it does not accept untrusted free-form suggested goal text. The parent selects or creates a suitable subject, edits the text, and manually saves a goal. Completion and progress are never inferred.
- Corpus validation tests for unique IDs, broken references, cycles, stage coverage and usable content.

## Source materials
- [NCERT NCF Foundational Stage 2022](https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf)
- [NCERT learning outcomes](https://ncert.ncert.org.in/learning-outcome.php)
- [NCF School Education 2023](https://ncf.ncert.gov.in/)

## Deliberate limits
- A parent must verify the specific class textbook/syllabus before relying on an outcome for formal exam preparation.
- Catalogue content is static and versioned in Git; it does not create or seed private child records.
- No database migration, no changes to auth, access-control policies or stored learner progress.
- No scoring or automatic mastery. Prerequisites help suggest an instructional order; they do not lock content.
- Birth–3 is outside this formal competency library. Infants should have responsive care and play, not formal lesson plans or screen time.
- The goal handoff stores the existing goal title/subject; the competency ID itself is not stored as durable provenance. A future, separately reviewed migration may support it.
- The catalogue has broad stage-band exemplars, not every class/chapter or formal full syllabus.

## Verification
Run `npm ci && npm run lint && npm run typecheck && npm test && npm run build`.
For production deployment, verify a real parent session can open `/curriculum`, follow a prerequisite, choose a suggested competency, select the intended learner and subject, edit and save. Verify an anonymous visitor is redirected, child data does not appear in page markup or URLs, and the existing subject/goal management works without regressions.

## Release gate
Only merge the feature branch after the Vercel preview and GitHub CI pass and the parent explicitly reviews the stage coverage and outcome scope.
