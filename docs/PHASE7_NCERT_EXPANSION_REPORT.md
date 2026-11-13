# Phase 7 — Complete the audited Class 8 index and expand Classes 9–10

**Audit date:** 2026-11-13  
**Branch base:** `main@225bc93acc286006c7cb61a567e109d0841ea67f` (merged PR #61)  
**Scope:** provenance-first NCERT catalogue and existing chapter-learning-engine
expansion. This is **not** a board-completeness claim, an NCERT outcome
crosswalk, a learner-data migration, or a product redesign.

## 1. Delivered catalogue result

`npm run curriculum:inventory` reports:

| Metric | Before Phase 7 | Current Phase 7 result |
|---|---:|---:|
| NCERT book records | 56 | **77** |
| Numbered Contents-item slots | 689 | **892** |
| Source-verified titles | 689 | **892** |
| Contents-pending books | 1 | **1** (Class 1 Dilchasp Riyazi) |
| Grades with audited records | 1–8 | **1–10** |
| Class 8 records / verified items | 6 / 65 | **11 / 111** |
| Class 9 records / verified items | 0 / 0 | **9 / 97** |
| Class 10 records / verified items | 0 / 0 | **7 / 60** |

The relevant source indexes are:

- [Class 8 index](NCERT_CLASS8_INDEX.md)
- [Class 9 index](NCERT_CLASS9_INDEX.md)
- [Class 10 index](NCERT_CLASS10_INDEX.md)

The index stays partial. Class 8 Urdu Khayal, Class 10 Contemporary India-II,
Class 10 Health and Physical Education, and Classes 11–12 are not silently
invented or bulk-imported because the requisite current official Contents evidence
was not captured to this standard.

## 2. Official evidence policy

The audit uses the following evidence order:

1. NCERT textbook portal for official book navigation;
2. NCERT prelims/Contents PDFs for book identity, edition, titles and counts;
3. CIET only where it was the official index source for an older record; and
4. no third-party URL as final title/count/direct-PDF proof.

The application stores factual metadata and titles only. It does not copy or host
NCERT prose, activities, exercises, illustrations, answers or outcome wording.

### Important count/structure corrections

- Class 8 **Exploring Society** is 7 Part I chapters plus 8 Part II chapters,
  based on their official Contents—not a portal range.
- Class 8 **Kaushal Bodh** is six illustrative projects across three forms of
  work, not six compulsory sequential chapters.
- Class 8 **Khel Yatra** is six official units. Its official About the Book
  section supplies the exact labels and leaves planning/equal distribution to
  physical-education teachers; generic portal component navigation is not used
  as a 20-chapter count.
- Class 8 **Kriti** has 19 numbered Contents chapters.
- Class 9 **Kaveri** has 8 Contents chapters, not a generic nine-slot
  interpretation; **Ganita Manjari** has Parts I (8) and II (6).
- Class 9 **Understanding Society** has Part I (9) and Part II (6) Contents
  chapters; **Khel Praveen** has 23 Contents chapters, not 30 generic entries.
- Class 10 **Mathematics** has 14 chapters; appendices and answers are back
  matter. **India and the Contemporary World-II** has five core chapters; its
  QR-only extended-learning material is not silently promoted to slots.

## 3. Direct-PDF policy and source fallback

Phase 7 adds support for **explicit, individually audited direct PDF references**.
It preserves historical Classes 1–8 audited behavior but rejects code-pattern
inference for Phase 7 records.

| Grade | Books | Verified items | Default-path items | Select-one alternatives | Direct links (legacy / explicit Phase 7) | Official portal fallbacks |
|---:|---:|---:|---:|---:|---:|---:|
| 8 | 11 | 111 | 105 | 6 | 55 / 0 | 56 |
| 9 | 9 | 97 | 88 | 9 | 0 / 0 | 97 |
| 10 | 7 | 60 | 60 | 0 | 0 / 0 | 60 |

A portal fallback means no direct Contents-item PDF was individually verified; it
is not a broken link or a generated URL. Phase 7 additions use the official book
portal until a direct URL is checked and entered explicitly for that individual
item.

## 4. Non-linear content is represented honestly

### Class 8 Kaushal Bodh

The official Grade 8 activity book says its projects are not mandatory and that
schools may choose one from each form of work or design another appropriate
project. The six projects are represented as three explicit select-one groups.
They are discoverable, but are not auto-assigned as a linear six-project
learning path. Parent-recorded learner progress remains available after actual
use of an official project, but that evidence is not a persisted parent/school
selection and does not create an alternative session flow.

### Class 9 Kaushal Vikas

The official Contents uses three foundation-plus-vocation structures:
Chapters 1/5/9 are default foundations; Chapters 2–4, 6–8 and 10–12 are three
select-one vocation groups. The nine alternatives do not generate default
`ncert:` session tasks. Their book/chapter pages make the reason visible, rather
than silently pretending all twelve are mandatory. Parent-recorded learner
progress for a used alternative is separate from selection and does not create an
alternative session trio or persist a family/school selection.

This is a conservative scheduling decision. It does not claim what a specific
school must select, and it does not erase the verified titles from the catalogue.

## 5. Learning engine and UI integration

- `/ncert-books` and Curriculum Library expose Classes 9–10 and the expanded
  Class 8 set without a redesigned workflow.
- Book rows show grade, subject, language, category, volume/edition where
  available, Contents count and direct-PDF/fallback state.
- Official Projects and Units retain their labels in the discovery and chapter
  page UI rather than being called Chapters indiscriminately.
- Every default-path verified item uses existing stable task IDs:

  ```text
  ncert:<chapterId>:read
  ncert:<chapterId>:practice
  ncert:<chapterId>:review
  ```

- The existing original read/explore, practice and understanding-check scripts,
  completion, revision, evidence and adaptive retention behavior are reused.
  No legacy task ID is rewritten, no learner data is migrated, and opening an
  official resource does not mark progress complete.
- Select-one alternatives remain outside the automatic queue and cannot be
  progress-written through a fabricated lesson URL. A parent may record learner
  progress for an alternative from its own page; that panel now states the
  record is learner-progress evidence only and is not a stored family or school
  selection, so it neither excludes other alternatives nor creates sessions.
- No new chapter-to-skill mapping, official outcome claim or learner data write
  was introduced by catalogue browsing.

## 6. Mapping and migration boundary

Phase 7 adds **no migration** and does not run migration 008. It does not modify
the Phase 6 Class 5 mapping pilot: 86 Class 5 slots remain accounted as 60 draft
original-outcome proposals, 26 explicitly unmapped and 0 approved.

Migration 008 remains a separate parent-review-storage setup requirement. The
mapping UI/API wording now says so rather than implying that a Phase 7 learner
must apply that migration to browse books, start supported sessions or retain
progress.

## 7. Class 11–12 backlog

Classes 11–12 intentionally remain at zero book records/slots. A later audit must
be performed one book at a time against current official NCERT identity, language,
stream/subject, part/volume, edition, formal Contents and individual direct-PDF
evidence. The I–XII selector alone is not a licence to bulk import senior
secondary catalogues.

## 8. Validation performed in this branch

| Gate | Result |
|---|---|
| `npm ci` | Completed earlier in this implementation; existing dependency notices only |
| `npm run lint` | Passed with 0 errors and 2 pre-existing React-hook warnings outside this phase |
| `npm run typecheck` | Passed |
| `npm test` | **163/163 passed** |
| `npm run curriculum:inventory` | Passed: 77 books / 892 slots / 892 verified titles / grades 1–10 |
| `npm run curriculum:catalogue-audit` | Passed: source/direct-PDF/selection safeguards hold |
| `NEON_AUTH_BASE_URL=… NEON_AUTH_COOKIE_SECRET=… npm run build` | Passed with a non-production local placeholder secret; the unconfigured build correctly rejects a missing required auth cookie secret |
| `npm run test:smoke` | Passed against the local built server; database health correctly returned 503 because no database URL is configured |
| `npm run test:ui` | Attempted but **not executable in this sandbox**: Playwright Chromium and `/usr/bin/chromium` are absent. All five cases stopped before assertions; this is not represented as a pass. |

The remaining release gates are browser execution in CI/with a provisioned browser,
GitHub Actions and a deployment preview. Require those to pass before merge; no
result above implies deployment or production-database readiness.

## 9. Follow-up work

1. Individually validate each direct PDF before adding it to a Class 8–10 record.
2. Re-audit current printing metadata when NCERT publishes a newer edition.
3. Audit Class 8 Khayal only after title, code, edition and formal Contents are
   reconciled from official evidence.
4. Add the excluded Class 10 Geography/Health and PE books only after formal
   Contents capture; do not use generic portal ranges.
5. Continue Classes 11–12 as separately sourced, bounded audits.
6. Keep source/catalogue work separate from outcome mapping and human approval.
