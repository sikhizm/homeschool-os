# Homeschool OS — Global Curriculum 1.0 Integrated Release

## Delivery
One coherent parent-facing curriculum studio at `/curriculum-studio`: class/stage selection, optional family learner context, original NCERT-first global skill catalogue, lesson suggestions, 60-minute shared guided plan, observation prompts, official framework links and a live coverage audit.

- Reuses existing authenticated family/membership guard, original competencies, independent original lessons, planning/dashboard and observation reports. The learner dropdown is read-only context; no goals, marks or progress are created by selecting it.
- Parent-reviewed goal handoff goes through the original existing dashboard. The studio does NOT automatically record completion.
- NCERT textbook index currently has 16 book records across Classes 4, 5 and 8. Class 4 has 49 publisher-verified numbered chapter titles; Class 5 has 86 publisher-verified numbered chapter titles from the official contents pages; six books are 2026–27 reprints and Sitaar is the first edition (June 2025). Five Class 8 book records still await contents review.
- All 135 indexed chapter titles remain unmapped to skills; no official chapter-to-competency equivalence is claimed.
- Provides source-aware stage, subject, goals and coverage navigation across `/curriculum-studio`, `/global-curriculum`, `/ncert-books`, `/lessons`, `/reports`, `/planning`.
- Pure `engine.ts` with deterministic suggestions for parent review, validations, and an honest gap audit.
- Original resource links reference official frameworks; copyrighted textbook pages are never copied/rehosted.

## Source registry
NCERT textbook access and terms: https://ncert.nic.in/textbook.php
CBSE 2025 Class 5 and Class 8 textbooks: https://www.cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf
Cambridge primary subject portfolio: https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/
International Baccalaureate PYP pedagogy: https://www.ibo.org/programmes/primary-years-programme/
Singapore mathematics curriculum: https://www.moe.gov.sg/education/syllabuses
US Common Core: https://corestandards.org/

## Honest release scope / outstanding editorial work
Global Curriculum 1.0 is an integrated foundation, not full textbook or board coverage. The current index contains 16 identified NCERT books across Classes 4, 5 and 8, with 135 numbered chapter titles verified across Classes 4 and 5. Five Class 8 book records have no verified chapter contents yet. Classes 1–3 and 6–12 remain incomplete as a grade-wise catalogue. No chapter-to-skill mapping is human-approved, and no international board is certified as fully mapped. The 29 global skills are original illustrative activities, not a complete syllabus.

Next content work remains substantial: Class 3 official book/TOC review, systematic NCERT Classes 1–12 cataloguing, Class 8 TOC review, licensed-source review for Cambridge and Singapore, original enrichment lesson production, human-reviewed chapter-to-objective claims, subject/age specialist checks, and an optional editorial persistence workflow with source/review timestamp. Any later auto-personalization must be based on parent-entered evidence and explicit consent, never inferred mastery.

## Non-goals / security
No new production migration, bulk student import, scraped NCERT chapters, proprietary book PDFs, automatic claims of attainment, AI assessments or outbound sharing of child data. Preview may share the existing family database, so do not insert test learner records.

## Verification
`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`, `npm run test:smoke`.
