# NCERT Textbook & Chapter Mapping — Foundation/Edition Audit

## What was actually shipped
- Parent-authenticated `/ncert-books` index with class/subject/book filters, source links, responsive book shelf, chapter positions and audit status.
- Four NCERT Class 4 books (Maths Mela, Santoor, Veena, Our Wondrous World), chapter-position counts 14, 12, 13 and 10, **49 numbered slots**.
- Distinct fields for `verifiedTitle`, `status`, `mappingStatus`, `skillIds`, `sourceUrl` so no placeholder is mistaken for a validated chapter title or official subject mapping.
- Links into `/global-curriculum` and the parent-reviewed goal workflow, with stage/subject suggestions clearly **not** assigned to textbook chapters.
- Validation tests that reject fabricated full coverage and enforce the 0-verified/0-mapped audit baseline.
- No new migrations, no learner data writes, no scraping/rehosting copyright NCERT chapters, no unlicensed content imports.

## Research evidence and provenance (reviewed 29 Oct 2026)
- NCERT official textbook portal: https://ncert.nic.in/textbook.php
- NCERT Class 4 Maths Mela: https://ncert.nic.in/textbook.php?demm1=0-14
- NCERT Class 4 Santoor: https://ncert.nic.in/textbook.php?desa1=0-12
- NCERT Class 4 Veena: https://ncert.nic.in/textbook.php?dhve1=0-13
- NCERT Class 4 Our Wondrous World: https://ncert.nic.in/textbook.php?deev1=0-10
- SCERT Haryana Class 4 English-medium book catalogue: https://scertharyana.gov.in/document-category/textbooks-class-4/
- Class 4 2026–27 third-party index (chapter counts as cross-check only): https://schools.aglasem.com/ncert-books-class-4/

The official textbook catalogue and SCERT Haryana confirm book identities. Maths Mela and Our Wondrous World chapter titles were checked against their 2026–27 publisher tables of contents, while the other 25 remain pending. ISBN/edition details and all chapter-to-skill links have **not been comprehensively reviewed**, so they are pending for Santoor and Veena; Maths Mela (14) and Our Wondrous World (10) have source-verified titles. Counts are provisional until reconfirmed chapter-by-chapter on the current NCERT edition. Do not publish full textbook coverage claims from this version.

## Editorial chapter mapping checklist
For each book, retain grade, language, subject, publisher, textbook code, and checked source URL. Confirm the edition/reprint from its imprint and chapter title and position from the publisher's own table of contents. Review each proposed competency against the chapter's actual subject matter and record reviewer/date/evidence. **No mapping becomes `human-reviewed` without a human checking it**. Note any changed chapters when new NCERT editions arrive.

## Copyright and licensed access
NCERT states textbooks are copyrighted and prohibits redistribution, hosting textbooks or packaging them in software without permission. This app stores only metadata, generic chapter numbers and original teaching suggestions, and opens the official external publisher portal. Before adding direct chapter links to a distributable service, confirm NCERT permission and current usage terms.

## Remaining work (not completed by this phase)
- Santoor and Veena chapter-title audit, edition/ISBN cross-check and individual chapter-skill evidence.
- Class 1–3, 5–12 actual book and chapter indexing.
- Structured standard-code review and approval workflow with editorial persistence (admin-only).
- Authorized international textbook/standards mapping.
- Real authenticated parent walkthrough using preview; don't create dummy learner goals against production database.

## Release checks
`npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build` and `npm run test:smoke`. The zero-data safe catalogue needs no database migration.

## Additional publisher TOC title verification
- Maths Mela 2026–27 reprint official contents (14): https://ncert.nic.in/textbook/pdf/demm1ps.pdf
- Our Wondrous World 2026–27 reprint official contents (10): https://ncert.nic.in/textbook/pdf/deev1ps.pdf
- Their 24 names are marked `source-verified`; 25 other titles still await direct publisher-content confirmation. All 49 **skill alignments remain unapproved**. Source verification does not imply pedagogical skill mapping approval.
