# NCERT Class 4–5 Publisher Contents Audit (2026–27)

## Current delivery
- Parent-authenticated `/ncert-books` directory with class, subject and book filters, official publisher links, chapter positions, source status and separate learning pages.
- **Class 4:** four NCERT books and 49 numbered chapter titles checked against the 2026–27 publisher contents.
- **Class 5:** seven NCERT books and 86 numbered chapter titles checked against the 2026–27 publisher contents.
- **Combined:** 16 catalogued book records across Classes 4, 5 and 8; 135 source-verified chapter titles; five Class 8 book records still have no generated chapter entries.
- Every verified chapter title opens its own authenticated parent-guided learning page. The chapter page links to official NCERT material rather than copying or hosting textbook content.
- All 135 chapter records remain `unmapped`; no chapter-to-skill equivalence has been approved.
- No database migration, learner-data write, textbook download/rehosting or copyrighted textbook text is added.

## Class 4 verified contents
| Book | Numbered chapter titles |
|---|---:|
| Maths Mela | 14 |
| Santoor | 12 |
| Veena | 13 |
| Our Wondrous World | 10 |
| **Total** | **49** |

## Class 5 verified contents
| Book | Subject | Numbered chapter titles |
|---|---|---:|
| Maths Mela | Mathematics | 15 |
| Santoor | English | 10 |
| Veena | Hindi | 12 |
| Our Wondrous World | The World Around Us | 10 |
| Bansuri | Arts | 19 |
| Khel Yoga | Physical Education and Well-being | 7 |
| Sitaar | Urdu | 13 |
| **Total** |  | **86** |

Only numbered chapters/lessons are counted. Unnumbered poems, supplementary readings, warm-up material, self-assessment pages and teacher guidance are not incorrectly added as chapter slots. The contents source and book imprint identify each edition; six Class 5 contents PDFs are marked 2026–27 reprints, while Sitaar is the first edition (June 2025).

## Official publisher contents sources
**Class 4**
- Maths Mela: https://ncert.nic.in/textbook/pdf/demm1ps.pdf
- Santoor: https://ncert.nic.in/textbook/pdf/desa1ps.pdf
- Veena: https://ncert.nic.in/textbook/pdf/dhve1ps.pdf
- Our Wondrous World: https://ncert.nic.in/textbook/pdf/deev1ps.pdf

**Class 5 contents PDFs (six 2026–27 reprints; Sitaar first edition June 2025)**
- Maths Mela: https://ncert.nic.in/textbook/pdf/eemm1ps.pdf
- Santoor: https://ncert.nic.in/textbook/pdf/eesa1ps.pdf
- Veena: https://ncert.nic.in/textbook/pdf/ehve1ps.pdf
- Our Wondrous World: https://ncert.nic.in/textbook/pdf/eeev1ps.pdf
- Bansuri: https://ncert.nic.in/textbook/pdf/eebu1ps.pdf
- Khel Yoga: https://ncert.nic.in/textbook/pdf/eeky1ps.pdf
- Sitaar: https://ncert.nic.in/textbook/pdf/eust1ps.pdf

Official NCERT textbook portal: https://ncert.nic.in/textbook.php

## Editorial boundary
- The title and position of each numbered chapter/lesson are verified against the publisher's own 2026–27 reprint contents.
- A verified chapter title does **not** mean the chapter has been read, assessed, mapped to an outcome, or approved as a curriculum equivalence.
- Original global skills remain illustrative parent-guided learning suggestions, not official NCERT learning outcomes.
- The five Class 8 book records remain identity-only with `chapterCount: 0`; zero means no verified chapter list, not an empty book.
- Do not infer the existence or contents of books for classes not yet catalogued.

## Copyright and source use
NCERT retains copyright in its textbooks. The application stores bibliographic metadata, numbered chapter titles and original parent-guided study prompts only. It opens official NCERT resources externally and does not mirror textbook pages or PDFs. Confirm current publisher terms before any future redistribution or ingestion.

## Next sequential phase
1. Build a parent/editor-only review queue for the 86 Class 5 chapters. Read the official chapter content and propose a mapping to an existing original learning skill only where the chapter evidence supports it; explicitly record “no suitable match” where it does not.
2. Keep every proposal unapproved until a parent/editor reviews the chapter, rationale, source edition, reviewer and revision history. No mapping may be auto-approved or inferred from a title alone.
3. Continue the official Class 3 book index and contents audit, then the systematic Class 1–12 edition-by-edition catalogue while keeping unknown classes visibly pending.

## Release checks
Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build` and `npm run test:smoke`. Confirm Class 4 and 5 show the verified titles, Class 8 still shows honest pending states, and chapter links open their learning pages. No production database migration is required.
