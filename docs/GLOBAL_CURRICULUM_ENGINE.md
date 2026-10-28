# Global Curriculum Engine — Foundation Phase

## Goal
Develop one parent-guided learning path with India's NCERT/CBSE foundation and selected international pedagogical lenses. **Do not** turn it into six concurrent boards or claim full coverage before textbook and unit audits.

## Delivered
- Authenticated `/global-curriculum` explorer, available through the primary navigation and curriculum/dashboard pages.
- 29 **original** outcomes across six stage bands, with subject/domain, intended outcome, teaching activity, observational check and prerequisite references.
- Filter by stage, subject, curriculum framework lens and search term.
- Seven provenance sources, including one external NCERT textbook access portal (ePathshala).
- Clearly labelled **framework-context-only** editorial references rather than official learning-outcome identifiers.
- Parent-reviewed goal handoff: lookup a known skill ID on the server, then prefill editable goal text and subject. Saving stays in the existing private Goals workspace; no automatic mastery.
- Unit validation for source IDs, prerequisite graph, stage coverage, search filters and safe goal lookups.
- No migration, API keys, ingestion of copyrighted files, learner-data seeding, autonomous recommendations or automatic progress changes.

## Sources and their limits
- National Curriculum Framework for School Education, NCERT: https://ncf.ncert.gov.in/
- NCERT ePathshala: https://epathshala.nic.in/
- Cambridge Primary framework: https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/
- IB Primary Years Programme: https://www.ibo.org/programmes/primary-years-programme/
- Singapore MOE primary mathematics syllabus: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf
- US Common Core maths and English: https://corestandards.org/

The app must not display unverified `official alignment`, `grade equivalence`, `textbook coverage`, or accreditation claims. Cambridge framework learning objectives may require authorized access. The PYP is inquiry-centered and is not a chapter-by-chapter textbook. Singapore mathematics is a mathematics-focused reference, not a general school board. US Common Core is a reference for mathematics/English, not a whole-school nationwide US curriculum.

## Coverage roadmap — NOT YET DONE
1. **NCERT/CBSE foundation:** Catalog official currently applicable grade-wise textbooks, edition/year, subject, chapter/section IDs, download/access links and revision date. Maintain licenses and link out to legal sources.
2. **Skill registry:** Add rigorous unit-level original skills and prerequisite graph with explicit human-reviewed evidence for each proposed textbook/standards association. Never infer equivalence automatically.
3. **International review:** Collect accessible authorized Cambridge frameworks and Singapore MOE Maths progression; use IB PYP as inquiry pedagogical lens. Apply optional US ELA/maths strands selectively.
4. **Parent plan:** Show the single weekly plan for each learner, not parallel boards. Suggest optional stretch/reinforcement based on *parent-entered* observations only, with confirmation before changes.
5. **Audit and quality:** Chapter coverage completeness, source revision tracking, accessibility, subject specialist review, assessments and periodic parent feedback.

## Privacy and safety
No third-party personal account or child data sent to curriculum source sites by the application; opening external links is a user action. No teacher assessment is fabricated. Infant screens and formal worksheets are not part of the engine. Punjabi/Hindi, Sikh heritage and ethics remain supported as original family enrichment content; verify religious quotations and historical sources.

## Release gates
Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`, `npm run test:smoke`. Review authenticated desktop/mobile navigation and curriculum goal handoff in preview without writing synthetic real learner records.

## Why this is a foundation phase
29 curated examples are educational scaffolding, **not all NCERT books, full Cambridge or IB accreditation**. This phase implements a trustworthy structure before larger content coverage. It should not be marked as complete coverage in FocusDesk.
