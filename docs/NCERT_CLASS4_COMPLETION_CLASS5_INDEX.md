# NCERT Class 1, 4–5 Publisher Contents Audit (2026–27)

## Current delivery
- Parent-authenticated `/ncert-books` directory with class, subject and book filters, official publisher links, chapter positions, source status and separate learning pages.
- **Class 4:** four NCERT books and 49 numbered chapter titles checked against the 2026–27 publisher contents.
- **Class 5:** seven NCERT books and 86 numbered chapter titles checked against the 2026–27 publisher contents.
- **Class 1:** six book records; five CIET-indexed books with 72 source-verified numbered titles; the separate Urdu catalogue title Dilchasp Riyazi remains contents-pending.
- **This source-audit document’s scope:** Class 1, 4 and 5 records listed here retain their publisher-contents provenance. The wider live catalogue has since grown to 77 books / 892 verified Contents titles across Classes 1–10; see `CURRICULUM_COMPLETION_MASTER.md` and `PHASE7_NCERT_EXPANSION_REPORT.md` for current totals and boundaries.
- Every verified chapter title opens its own authenticated parent-guided learning page. The chapter page links to official NCERT material rather than copying or hosting textbook content.
- Phase 6 now accounts for all 86 Class 5 records: 60 original-outcome candidates are `draft`, 26 are explicitly unmapped with reasons, and **0** are seed-approved. This is not an NCERT equivalence claim; see `PHASE6_CURRICULUM_MAPPING_REPORT.md`.
- Migration 008 stores only family-owned review revisions. It does not seed learner data, download/rehost textbook material, or change learning evidence.

## Class 1 verified contents
| Book | Subject | Numbered chapter titles |
|---|---|---:|
| Mridang | English | 9 |
| Sarangi | Hindi | 19 |
| Joyful Mathematics | Mathematics · English | 13 |
| Anandmay Ganit | Mathematics · Hindi | 13 |
| Shehnai | Urdu | 18 |
| **Total** | **Five CIET-indexed books** | **72** |

Dilchasp Riyazi (Urdu mathematics, NCERT publication code 4109) is catalogued by identity only; its digital chapter contents remain pending.

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
- This historical Class 1/4/5 source-audit document does not describe later Class 6–10 indexing. Refer to `CURRICULUM_COMPLETION_MASTER.md`, `NCERT_CLASS8_INDEX.md`, `NCERT_CLASS9_INDEX.md` and `NCERT_CLASS10_INDEX.md` for the current 77-book catalogue. Class 1's catalogue-only Dilchasp Riyazi record remains at zero until its digital contents are verified.
- Do not infer the existence or contents of books for classes not yet catalogued.

## Copyright and source use
NCERT retains copyright in its textbooks. The application stores bibliographic metadata, numbered chapter titles and original parent-guided study prompts only. It opens official NCERT resources externally and does not mirror textbook pages or PDFs. Confirm current publisher terms before any future redistribution or ingestion.

## Mapping follow-up
1. Phase 6 has added the parent-owner-only review queue for all 86 Class 5 chapters. Apply migration 008 in the target database before enabling it in production.
2. Keep every seed proposal unapproved until an authorised parent reviews the official chapter, source edition, evidence and rationale. No proposal may be auto-approved or inferred from a title alone.
3. Obtain language-specialist/source-section review for the 25 intentionally unmapped Hindi and Urdu chapters, then extend the same workflow to other verified grades one at a time.

## Release checks
Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`, `npm run test:smoke`, `npm run curriculum:inventory` and `npm run curriculum:mapping-audit`. Confirm Class 4/5 source titles remain verified, Class 5 drafts remain visibly unapproved, chapter links open their learning pages and review controls are owner-only. Migration 008 must be applied and verified before production review records can be used.
