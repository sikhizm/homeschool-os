# NCERT Textbook & Chapter Mapping — Verified Catalogue Phase

## Delivered
- Parent-authenticated `/ncert-books` directory with class/subject/book filters, official source links, responsive book shelf, chapter positions and audit status.
- Class 4: four publisher-identified NCERT books and 49 numbered chapter titles checked against the 2026–27 publisher contents.
- Class 5: seven publisher-identified NCERT books and 86 numbered chapter titles checked against the 2026–27 publisher contents.
- Combined catalogue: 16 book records across Classes 4, 5 and 8; 135 verified chapter-title slots; five Class 8 books still await their contents audit.
- Verified chapters open an authenticated learning page with previous/next navigation and an external official NCERT chapter link.
- Distinct fields for `verifiedTitle`, `status`, `mappingStatus`, `skillIds`, `sourceUrl` and edition notes keep publisher facts separate from proposed learning alignments.
- All 135 chapter-to-skill mappings remain unapproved. No mapping is inferred from subject or title.
- No migration, learner-data writes, scraping/rehosting copyrighted textbook chapters, or unlicensed content imports.

## Publisher evidence and provenance (reviewed 9 Nov 2026)
**NCERT official textbook portal:** https://ncert.nic.in/textbook.php

**Class 4 contents PDFs**
- Maths Mela: https://ncert.nic.in/textbook/pdf/demm1ps.pdf
- Santoor: https://ncert.nic.in/textbook/pdf/desa1ps.pdf
- Veena: https://ncert.nic.in/textbook/pdf/dhve1ps.pdf
- Our Wondrous World: https://ncert.nic.in/textbook/pdf/deev1ps.pdf

**Class 5 contents PDFs — current publisher editions (six 2026–27 reprints; Sitaar first edition June 2025)**
- Maths Mela: https://ncert.nic.in/textbook/pdf/eemm1ps.pdf
- Santoor: https://ncert.nic.in/textbook/pdf/eesa1ps.pdf
- Veena: https://ncert.nic.in/textbook/pdf/ehve1ps.pdf
- Our Wondrous World: https://ncert.nic.in/textbook/pdf/eeev1ps.pdf
- Bansuri: https://ncert.nic.in/textbook/pdf/eebu1ps.pdf
- Khel Yoga: https://ncert.nic.in/textbook/pdf/eeky1ps.pdf
- Sitaar: https://ncert.nic.in/textbook/pdf/eust1ps.pdf

Only numbered chapter/lesson entries are included in counts. Supplementary reading pieces and unnumbered sections are not turned into chapter records. The NCERT contents and imprint pages provide each book's edition and chapter-order evidence; Sitaar is the first edition dated June 2025, while the other six Grade 5 contents PDFs are marked 2026–27 reprints.

## Audit totals
- Class 4: 49 / 49 numbered chapter titles verified.
- Class 5: 86 / 86 numbered chapter titles verified.
- Combined: 135 verified titles across 11 books.
- Class 8: five book identities indexed, contents still pending.
- Human-approved chapter-to-skill mappings: 0.

## Editorial chapter mapping checklist
For each book, retain grade, language, subject, publisher, textbook code, edition/reprint, and checked source URL. Confirm each numbered title and position from the publisher's own table of contents. Review each proposed competency against the actual chapter content and record rationale, source edition, reviewer and date. **No mapping becomes `human-reviewed` without a human checking it.** Record differences when a later NCERT reprint changes chapter order or titles.

## Copyright and licensed access
NCERT states textbooks are copyrighted and restricts reproduction. This app stores metadata, numbered chapter titles and original parent-guided prompts, and opens the official external publisher portal/PDF. It does not host textbook pages or reproduce exercises. Confirm current publisher terms before adding any textbook ingestion or redistribution.

## Remaining work
- Human-reviewed Class 5 chapter-to-skill mapping: inspect official chapter content, propose only evidence-backed alignments, and retain an explicit no-fit state where appropriate. All 135 mappings remain unapproved until a human review is recorded.
- Official Class 3 textbook and chapter contents audit, then systematic Class 1–12 coverage (Classes 1–3 and 6–12 remain incomplete; Class 8 chapter contents are still pending).
- Authorized international textbook/standards mapping and specialist review.
- Optional editorial persistence for reviewer identity, source edition, review timestamp and revision history.
- Authenticated parent walkthrough on desktop/mobile; do not create synthetic learner goals or progress against production data.

## Release checks
`npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build` and `npm run test:smoke`. The catalogue phase requires no database migration.
