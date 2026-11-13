# Phase 8 — International framework evidence register and review safeguards

**Audit date:** 2026-11-13  
**Scope:** source identity, official overview scope, review boundaries and a safe foundation for later human-reviewed crosswalks. This is not an outcome-level alignment or accreditation claim.

## Delivered

- Seven evidence records distinguish five curriculum-framework lenses, one NCERT ePathshala resource portal and original HomeSchool OS enrichment.
- The authenticated Global Curriculum explorer displays each source's scope, evidence state, review boundary, external source links and the number of original learning themes that carry its context tag.
- The original enrichment record no longer points to the NCERT NCF site as if it were an external source.
- Singapore MOE's Primary Mathematics reference now points to the official 2021 syllabus PDF updated October 2025. Its scope is Primary 1–6 Mathematics only.
- The curriculum:framework-audit command validates source records, secure URLs, source-register completeness and context-only labels.

## Source-by-source scope

| Lens | Official source scope captured | Important boundary |
|---|---|---|
| NCERT NCF-SE 2023 | Indian school education across Foundational, Preparatory, Middle and Secondary stages; seven curricular areas | Framework overview is not an exact section-level outcome transcription or an app-grade equivalence |
| Cambridge Primary | Typically ages 5–11; six stages; flexible subject-specific frameworks | Subject/stage objectives must be individually checked; Cambridge stages are not NCERT class numbers |
| IB PYP | Ages 3–12; inquiry-based and transdisciplinary; six broad themes | Each school develops its programme of inquiry; not a fixed chapter-by-grade syllabus |
| Singapore MOE Primary Mathematics | Mathematics only, Primary 1–6; 2021 syllabus PDF updated October 2025 | Not a general curriculum; exact level-specific outcomes and page references still need transcription |
| US Common Core | K–12 English Language Arts/literacy and Mathematics | Not a complete national curriculum; no state adoption or NCERT equivalence inferred |
| NCERT ePathshala | Official textbook and learning-resource access | Resource portal only; not a standards framework |
| Original HomeSchool OS enrichment | Locally authored activities and suggestions | Internal content; no external framework attribution |

## Audit result and safeguards

- Source records: **7**
- Curriculum framework lenses: **5**
- Resource-only records: **1**
- Original-content records: **1**
- Outcome-level international crosswalks: **0**
- Approved equivalencies: **0**
- Existing skill-framework tags remain framework-context-only; the displayed tag counts are not mapping counts.
- No international outcome wording or identifiers were added, no NCERT chapter was cross-mapped, and no mapping was approved automatically.
- No database migration, learner-data write, assessment update or curriculum progress change was performed.

## Remaining work

1. Capture exact, editioned source documents for each relevant subject and stage.
2. Transcribe standards/outcomes only with stable source URL, edition/version, section or page location, exact identifier and verification date.
3. Create candidate relationships separately from the source records; include rationale, evidence and limitations.
4. Require an authorised human reviewer before any relationship can be approved. Do not infer equivalence from shared topic words.
5. Keep framework mapping separate from learner completion, understanding, independent recall and mastery.

## Validation

The repository adds the curriculum:framework-audit command, tests/framework-evidence.test.ts and tests/library-filters.test.ts. GitHub Actions and deployment status for the commit are the release evidence; this report does not claim local test execution where the development sandbox could not clone GitHub.
