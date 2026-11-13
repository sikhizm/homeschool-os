# Global Curriculum Engine — Foundation and Mapping Safeguards

## Goal

Build one parent-guided learning path rooted in India’s NCERT/CBSE context while
using selected international lenses as optional pedagogical context. It must not
become six concurrent boards, imply accreditation, or claim textbook/standards
coverage without evidence and a human review.

## Delivered foundation

- Authenticated `/global-curriculum` explorer with **29 original illustrative
  skills** across six stage bands, subject/domain, activity, observational check
  and prerequisite references.
- Seven clearly classified source lenses: NCERT/Indian foundation, official
  ePathshala access, Cambridge Primary, IB PYP, Singapore MOE Mathematics, US
  Common Core and original Homeschool OS enrichment.
- Framework references are labelled **framework-context-only**. They do not mean
  official outcome IDs, accreditation, grade equivalence or automatic standards
  alignment.
- Parent-reviewed goal handoff keeps suggested goal text editable and records no
  automatic learner progress or mastery.
- Authenticated NCERT book catalogue and chapter-first learning engine for
  audited Classes 1–10 default-path records. Official select-one vocational
  alternatives remain discoverable but are not converted into compulsory tasks.

## Phase 6 Class 5 mapping pilot

Phase 6 adds a separate, reusable outcome-and-mapping layer rather than
recasting the existing 29 global skills or 37 broad competencies as official
Class 5 outcomes.

- `src/lib/curriculum/outcome-registry.ts` defines source-aware outcome types:
  **official**, **original**, and **framework-reference**. An original outcome
  remains original even when it references an NCERT chapter source.
- The seed registry contains **25 original Class 5 outcomes**, **0 official
  outcome rows** and **0 international-equivalence rows**. An NCERT elementary
  outcome source is recorded but awaits an exact section-level transcription;
  no official identifier or wording is invented.
- `src/lib/curriculum/class5-mapping.ts` accounts for all **86** verified Class
  5 chapter slots: **60 Draft** original-outcome candidates, **0 Approved** seed
  mappings and **26** explicit unmapped records. The Hindi/Urdu gap is retained
  for specialist review rather than forced into a broad language competency.
- Parent owners use `/curriculum-mapping` to inspect evidence, edition, rationale
  and mapping history; they can edit, submit, approve, reject or leave a draft
  unmapped. AI-derived or title-led drafts never approve themselves.
- `migrations/008_curriculum_outcome_mapping.sql` adds an append-only,
  family-owned review history table with RLS and no `PUBLIC` grant. It does not
  modify learning records. Apply it with `npm run db:migrate:curriculum-mapping`
  and verify the live state before enabling the queue in production. The separate
  confirmation-gated rollback drops only this new table after its audit history
  has been exported; it never rolls back learner or progress records.

See [PHASE6_CURRICULUM_MAPPING_REPORT.md](PHASE6_CURRICULUM_MAPPING_REPORT.md)
for source boundaries, counts, migration details and actual validation results.

## Sources and their limits

- National Curriculum Framework for School Education, NCERT:
  https://ncf.ncert.gov.in/
- NCERT ePathshala: https://epathshala.nic.in/
- Cambridge Primary framework:
  https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/
- IB Primary Years Programme: https://www.ibo.org/programmes/primary-years-programme/
- Singapore MOE primary mathematics syllabus:
  https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf
- US Common Core: https://corestandards.org/

Cambridge framework objectives may require authorised access. The PYP is
inquiry-centred rather than a chapter-by-chapter textbook. Singapore mathematics
is a mathematics reference, not a general board. Common Core is a reference for
English/mathematics, not a whole-school national curriculum. None of these
sources validates a one-to-one relationship to an NCERT chapter without its own
reviewable evidence.

## Coverage roadmap — still incomplete

1. **Official NCERT outcomes:** transcribe only exact, section-level, editioned
   official outcomes after source review; retain source URL, edition, location
   and last verification date.
2. **Human Class 5 review:** apply migration 008 and let a real authorised owner
   make the first approval/rejection decisions. No seed row is approved.
3. **Language-specialist review:** review the 25 intentionally unmapped Hindi and
   Urdu Class 5 records rather than guessing from a publisher contents title.
4. **Other grades:** extend the registry and review queue one verified catalogue
   at a time, not by automatic keyword crosswalk.
5. **International review:** allow a future framework mapping only when evidence
   is source-specific, provenance-aware and human-approved; never infer
   equivalence from an NCERT chapter.
6. **Learning evidence:** keep curriculum mapping separate from the existing
   completion, understanding, independent-recall and retention rules. Any future
   outcome assessment must need its own parent-recorded evidence.

## Privacy and safety

No third-party personal account or child data is sent to curriculum-source sites;
opening an external source is a user action. No teacher assessment is fabricated.
The mapping queue is family-owner-only, and the API derives family scope from the
authenticated session instead of trusting a browser-provided family ID. No
textbook pages or PDF content are copied into the registry; only metadata,
chapter titles, links and short factual evidence descriptions are stored.

## Release gates

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`,
`npm run build`, `npm run test:smoke`, `npm run curriculum:inventory` and
`npm run curriculum:mapping-audit`. Review the authenticated parent queue on
desktop/mobile after migration 008 is applied. Do not represent a browser or
production verification as complete when its environment was unavailable.
