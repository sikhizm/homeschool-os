# NCERT Curriculum Expansion — Class 4 Complete Title Audit + Class 5 Book Index

## Scope delivered
- Existing NCERT Class 4 shelf remains intact with the same 4 book IDs and 49 chapter-slot IDs.
- Verified the **remaining 25 chapter headings** directly from official NCERT 2026–27 Santoor and Veena reprint contents; total is **49/49 Class 4 headings source-checked**.
- Source-specific NCERT PDF contents URLs retained for all four Class 4 books. Hindi titles preserve Devanagari.
- Added **four Class 5 official publisher book records**: Maths Mela, Santoor, Veena and Our Wondrous World. Exact chapter contents/counts **not yet audited**: `chapterCount:0` means *no trusted chapter list* (not an empty book).
- Expanded student-facing Class 5 filters, mobile UI, source/audit status and clear editorial disclaimers. All 49 competency mappings still remain `unmapped`; no automatic claims of educational attainment.
- No schema migration, child record changes, book-content downloads/rehosting or automatic child assessments.

## Official publisher evidence
**Class 4:**
- NCERT English Santoor 2026–27 contents, PDF page 15 (zero-based 14): https://ncert.nic.in/textbook/pdf/desa1ps.pdf (12 numbered entries; additional self-assessment sections excluded)
- NCERT Hindi Veena 2026–27 contents, PDF pages 17–19 (zero-based 16–18): https://ncert.nic.in/textbook/pdf/dhve1ps.pdf (13 numbered entries; unnumbered readings excluded)
- NCERT Maths Mela publisher contents: https://ncert.nic.in/textbook/pdf/demm1ps.pdf
- NCERT Our Wondrous World publisher contents: https://ncert.nic.in/textbook/pdf/deev1ps.pdf

**Class 5 book identity references:**
- CBSE Circular 48/2025, including official NCERT viewer links for Class 5 Santoor `eesa1`, Math Mela `eemm1`, Veena `ehve1` and Our Wondrous World `eeev1`: https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf
- Publisher textbook portal: https://ncert.nic.in/textbook.php

## Editorial review boundary
- Chapter headings are verified as *contents entries in the linked NCERT publisher PDFs*, not checked for every possible state or later printing.
- Class 5 viewer URL ranges do **not** establish confirmed counts; until publisher tables of contents are checked, no chapter objects are generated.
- Source-verified chapter titles are not approved chapter-to-skill alignments. Before linking any global competency to a chapter, an editor must check chapter substance, edition and source evidence and record rationale.
- The existing 29 global skills are independent, illustrative activities. No textbook or syllabus completeness claims.
- Hindi is the published book language; learners may use home-language support as appropriate.
- The publisher retains copyrights in books and activities: the application stores only brief bibliographic metadata and headings, not copies of textbook pages.

## Next sequential phase
1. Review Class 5 official publisher TOCs and add headings+chapter count per book.
2. Expand to full 2026–27 Class 3 and Class 5 subject catalogues, then systematically Classes 1–12, checking annual CBSE/NCERT revisions.
3. Design a family-safe *parent-only mapping review* with draft/approved states, required source/edition, rationale, editor identity and revision tracking. Map skills only after source evidence review. Consider whether this should live in DB or curated code rather than silently auto-assign.
4. Optional official textbook links remain external; no licensed book ingestion without explicit permission.

## Release checks
GitHub lint, typecheck, unit suite, isolated browser fixtures, production build and smoke. Check that Grade 4 shows actual verified titles, Grade 5 displays books without fake chapter counts, and unknown classes remain empty with clear guidance.
