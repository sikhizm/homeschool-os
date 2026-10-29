# Homeschool OS — Global Curriculum 1.0 Integrated Release Candidate

## Delivery
One coherent parent-facing curriculum studio at `/curriculum-studio`: class/stage selection, optional family learner context, original NCERT-first global skill catalogue, lesson suggestions, 60-minute shared guided plan, observation prompts, official framework links and a **live coverage audit**.

- Reuses existing authenticated family/membership guard, original competencies, independent original lessons, planning/dashboard and observation reports. The learner dropdown is read-only context; no goals, marks or progress are created by selecting it.
- Parent-reviewed goal handoff goes through the original existing dashboard. The studio does NOT automatically record completion.
- NCERT textbook index expanded from 8 to **16 source-referenced book records** across Classes 4, 5 and 8 using CBSE Circular Acad-48/2025. Four Class 4 books have 49 source-checked chapter headings. Twelve other books have **zero generated chapter entries** until direct publisher contents checking.
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
**Global Curriculum 1.0 is the integrated foundation, not full textbooks/board content.** 16 *identified* NCERT books, 49 verified Class 4 chapter titles, 29 original global skills and the existing original lessons are explicitly incomplete. Classes 1–3, 6–7, 9–12 have zero identified books; Classes 5 and 8 chapter contents are pending. No chapter-to-skill map is currently human-approved and no international board is certified as fully mapped. The UI must display zeros rather than invent coverage.

Next content work remains substantial: edition-by-edition Class 1–12 official NCERT book/TOC review; licensed-source review for Cambridge, international standards editions and Singapore; original enrichment lesson production; human-reviewed chapter-to-objective claims; subject/age specialist checks; and an optional editorial persistence workflow with source/review timestamp. Any later auto-personalization must be based on parent-entered evidence and explicit consent, never inferred mastery. 

## Non-goals / security
No new production migration, bulk student import, scraped NCERT chapters, proprietary book PDFs, automatic claims of attainment, AI assessments or outbound sharing of child data. Preview may share the existing family database, so do not insert test learner records.

## Verification
`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`, `npm run test:smoke`.
