## Complete Phase 4 Learner Dashboard and Phase 5 Quality Validation

Closes **#44** · Closes **#45** (after merge + production verification)

Base: `main@13a3734` (includes PR #59 — Daily Assignment Workflow is **integrated**, not duplicated).
No new dependencies, no paid services, no competing engine, no schema change.

---

### Phase 4 — Learner-first dashboard (#44)

`src/lib/auto-learning/learner-dashboard.ts` composes one learner's home screen entirely from existing data:

| Section | Behaviour |
| --- | --- |
| **Continue Learning** (hero) | Single obvious action → the exact next available session (resumes an unfinished chapter first, otherwise next untouched chapter of the active book). Completed sessions are never re-offered. |
| **Today's Learning** | PR #59 daily assignments with point number, state and a `Start` deep-link. |
| **Active Chapter** | Book · subject · chapter · `n of 3 sessions done` · next session · progress bar. |
| **My Books** | Grade-appropriate shelf only, chapter counts and per-book started state; pick a chapter directly. |
| **Revision Needed** | Driven by the existing adaptive `revisionTasks` / `revisionChapters` rules. |
| **Recent Learning** | Real evidence only (read / practice / check completions, relative time). |
| **Progress Overview** | Chapters finished / in progress / to revisit + explicit note that a finished session is not mastery. No invented percentages. |

Also: `Parent mode →` keeps planning, learner management and curriculum admin reachable without cluttering the learner view; the parent family home now surfaces each learner's active chapter and next session.

Behaviour covered by tests: per-learner data with no leakage on learner switch; helpful guided start for new learners; resume not repeat; evidence-derived statuses consumed unchanged (`retained` only with later independent recall); existing card-led design preserved (no redesign).

### Phase 5 — Quality validation (#45)

- **`scripts/curriculum-audit.ts`** (new): samples 3 books per grade across Classes 1–8, validates catalogue structure + guidance guardrails, and probes every official link twice (strict TLS, then lenient), recording both results. Run: `npx tsx scripts/curriculum-audit.ts [--offline]`.
- **Real defect fixed:** NCERT serves only `hepr101`–`hepr105.pdf`; `hepr106`–`hepr115` are 404, so Poorvi (Class 8 English) was exposing guessed PDF links. Added `verifiedPdfChapters` and capped `ncert-8-poorvi` at 5 with a provenance note; chapters 6–15 keep verified titles, sessions and the book-portal link.
- **`tests/learning-journey.test.ts`** (new): full journey on PGlite against real migration `005`, writing through the same `assessmentPlan` → delete/upsert path as the API route, plus an undo test for rollback safety.
- **`tests/learner-dashboard.test.ts`** (new, 16 tests) and **`tests/learner-dashboard.browser.ts`** (Playwright, in-process fixture).

### Validation results

```
books=56  chapterSlots=689  verifiedTitles=689  pendingContents=1  grades=1–8
structural failures 0 · no unverified slot gets a guessed PDF
guidance guardrails pass for Classes 1–8 (Class 1 216 · 2 183 · 3 294 · 6 384 · 7 390 · 8 195 sessions)
links probed 65 · confirmed 2xx 64 · unresolved 1 (hepr108.pdf = 404)
```

Sampled 24 books (3 per grade): Mathematics/English/Hindi for 1–5, Sanskrit/Vocational/Mathematics for 6–7, Sanskrit/Mathematics/English for 8. Every sampled session references the official chapter, is labelled as original learning support, invents no answers and fits the grade time budget.

**Known limitations** (full detail in `docs/PHASE4_5_COMPLETION_REPORT.md`):
- Private family beta — **no** multi-family access-control validation, so no public production-readiness claim.
- 56 books / 689 titles is a **partial** catalogue; Classes 9–12 are not catalogued.
- Poorvi 6–15 PDFs unavailable publisher-side; 47 `ncert.nic.in` links pass only with lenient TLS (host omits its Let's Encrypt intermediate) — recorded, not hidden.
- Audit is representative sampling, not exhaustive.

### Test results (actual)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 errors, 2 pre-existing warnings (not silenced) |
| `npm test` | **157/157** (baseline 137) |
| `npm run test:ui` | **4/4** |
| `npm run build` | success, all routes |
| `npm run test:smoke` | exit 0, assertions verified |

### Migrations

None. Schema is unchanged since `005_auto_learning_queue.sql` — existing family data is untouched and remains compatible in both directions.

### Docs

`docs/PHASE_STATUS.md`, `docs/CHAPTER_FIRST_IMPLEMENTATION_SPEC.md`, `docs/CURRICULUM_COMPLETION_MASTER.md` reconciled with the code (including the previously stale 106/106 and 114/114 test counts), plus new `docs/PHASE4_5_COMPLETION_REPORT.md`.

### Screenshots

`.pr-assets/homeschool-learner-dashboard-desktop.png` · `.pr-assets/homeschool-learner-dashboard-mobile.png`
