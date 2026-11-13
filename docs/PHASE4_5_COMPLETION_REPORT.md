# Phase 4 + Phase 5 Completion Report

> **Historical delivery evidence:** the Class 1–8 inventory numbers and checks in
> this report are accurate for Phase 4–5 delivery, not the current catalogue.
> Phase 7 now records 77 books / 892 verified Contents titles across Classes
> 1–10; see `PHASE7_NCERT_EXPANSION_REPORT.md`.

**Issues:** [#44 — Phase 4 Learner Dashboard](https://github.com/sikhizm/homeschool-os/issues/44) · [#45 — Phase 5 Curriculum Quality Validation and Pilot](https://github.com/sikhizm/homeschool-os/issues/45)
**Base:** `main@13a3734` (includes PR #59, Daily Assignment Workflow — integrated, not duplicated)
**Date:** 13 November 2026
**Environment:** private family beta; production `https://homeschool-os-gamma.vercel.app/`

---

## 1. What was implemented

### Phase 4 — learner-first dashboard (issue #44)

New module `src/lib/auto-learning/learner-dashboard.ts` builds one learner's whole home
screen from existing data — no new tables, no new dependencies, no competing engine:

| Section | Source of truth | Notes |
| --- | --- | --- |
| **Continue Learning** (hero) | `deriveChapterProgress` over saved progress | Picks the resume target: an unfinished started chapter first, then the next untouched chapter of the active book. Skips completed stages, so finished work is never re-offered. |
| **Today's Learning** | `learners/<id>/workspace` daily assignments (PR #59) | Shows point number, title, completed/next state, `Start` deep-link into the chapter session. |
| **Active Chapter** | `deriveChapterProgress` | Book, subject, chapter, `n of 3 sessions done`, next session label, progress bar. |
| **My Books** | `booksForLearner(grade)` | Grade-appropriate shelf only, chapter counts, per-book started state, direct chapter picker. |
| **Revision Needed** | `revisionChapters()` (existing adaptive rules) | Chapters flagged `needs_revision` / `practice_due` / `understanding_check_due`, with `Review →`. |
| **Recent Learning** | saved progress rows, newest first | Real evidence only — read/practice/check completions with relative times. |
| **Progress Overview** | `chapterStats()` | Counts of chapters finished / in progress / to revisit plus a plain-language caveat: *"A finished session is not the same as mastery — that needs a later independent recall."* No invented percentages. |

Behaviour delivered:
- **Per learner, no leakage** — every fetch is keyed by `learnerId`; learner switching refetches and re-renders (asserted in unit + browser tests).
- **New learners** get a guided start card ("Start your first chapter") plus the full bookshelf, never an empty dashboard.
- **Resume, don't repeat** — unfinished sessions resume; completed sessions are excluded from Continue Learning.
- **Statuses are evidence-derived** — the seven existing statuses are consumed as-is; no status is recomputed or upgraded in the UI. `retained` still requires a later independent recall; the dashboard shows `0 lastings masteries` until that evidence exists.
- **Parent tools stay reachable but secondary** — `Parent mode →` link in the header; the parent family home now shows each learner's active chapter and next session, with planning/curriculum admin unchanged.
- **Design preserved** — same tokens, card-led layout, one new section pattern in `globals.css`; no redesign.

### Phase 5 — quality validation (issue #45)

- **NEW `scripts/curriculum-audit.ts`** — repeatable representative audit (`npx tsx scripts/curriculum-audit.ts`, `--offline` to skip network). Samples 3 books per grade for Classes 1–8, validates catalogue structure, checks the per-grade chapter-session guidance guardrails, and probes every official link twice (strict TLS, then lenient) recording both results verbatim.
- **Real defect found and fixed:** NCERT hosts only `hepr101`–`hepr105.pdf`; `hepr106`–`hepr115` return 404. Poorvi (Class 8 English) was therefore exposing guessed links for chapters 6–15. Added optional `verifiedPdfChapters` to `src/lib/ncert/types.ts`, set it to `5` on `ncert-8-poorvi` with a provenance note, and made `officialChapterPdf()` return `null` beyond the cap. Chapters 6–15 keep verified titles, learning sessions and the book-portal link.
- **NEW `tests/learning-journey.test.ts`** — end-to-end chapter journey on PGlite against the real `migrations/005_auto_learning_queue.sql`, writing through the exact `assessmentPlan` → delete/upsert path the API route uses: start → evidence → resume → practice → understanding check → derived status → revision recommendation → dashboard reflection → learner isolation, plus an undo test proving rollback leaves no orphaned mastery row.
- **NEW `tests/learner-dashboard.test.ts`** (16 tests) and **`tests/learner-dashboard.browser.ts`** (Playwright, in-process `/api/auto-learning` fixture, desktop + mobile screenshots).

---

## 2. What was tested — actual results

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | **clean, 0 errors** |
| Lint | `npm run lint` | **0 errors**, 2 warnings — both pre-existing (`src/app/dashboard/family-calendar.tsx:40`, `src/app/learn/path/learning-path.tsx:49`, missing `useEffect` deps). Deliberately not silenced. |
| Unit tests | `npm test` | **157/157 pass** (baseline before this branch: 137/137; +20 new) |
| Browser tests | `npm run test:ui` | **4/4 pass** (both suites) |
| Production build | `npm run build` | **success**, all routes emitted |
| Smoke | `npm run test:smoke` against `next start` | **exit 0**, all assertions verified |

Browser coverage of the journey: dashboard renders Continue Learning → open chapter → start
session → record evidence → return to dashboard shows the completion → switch learner and
confirm no carry-over. Screenshots: `.pr-assets/homeschool-learner-dashboard-desktop.png`,
`.pr-assets/homeschool-learner-dashboard-mobile.png`.

Statuses exercised in tests: `not_started`, `in_progress`, `practice_due`,
`understanding_check_due`, `needs_revision`, `completed`, `retained` (retention only awarded
in the journey test after a later independent recall; completion alone asserted to yield
`retained: 0`).

Data integrity verified: idempotent re-completion adds no rows; out-of-order completion never
claims a later stage is due; undo leaves no orphaned `masteryId`; a second learner has zero
rows; missing records return empty states rather than throwing; no migration was required for
this PR (schema unchanged since `005_auto_learning_queue.sql`, so existing family data is
untouched and forward/backward compatible).

---

## 3. Grades and subjects sampled

24 books, 3 per grade, Classes 1–8:
Mathematics / English / Hindi for Classes 1–5; Sanskrit / Vocational / Mathematics for
Classes 6–7; Sanskrit / Mathematics / English for Class 8. Chapter types sampled span
read-and-explore, practice, and understanding check, at all three age bands.

## 4. Curriculum validation results

```
books=56  chapterSlots=689  verifiedTitles=689  pendingContents=1  grades=1–8
structural failures: 0
slots claiming source-verified without a title: 0
unverified slots given a guessed PDF: 0
guidance guardrails: pass for Classes 1–8
  (Class 1 216 · Class 2 183 · Class 3 294 · Class 6 384 · Class 7 390 · Class 8 195 sessions)
links probed: 65 · confirmed 2xx: 64 · unresolved: 1
```

Each sampled session was checked to reference the official chapter, carry the
"original learning support" label, invent no answers, and fit the grade's time budget
(≤15 / 20 / 10 minutes). Sampled lesson guidance was read by hand and links out to the
official NCERT PDF rather than reproducing textbook text.

**Unresolved / recorded failures**

1. `https://ncert.nic.in/textbook/pdf/hepr108.pdf` → **404** (and 106–115 likewise). Mitigated by `verifiedPdfChapters: 5`; publisher-side gap, re-audit when NCERT uploads.
2. **TLS chain:** 47 `ncert.nic.in` links return 200 only when an incomplete certificate chain is tolerated (the host omits its Let's Encrypt intermediate). Recorded as a publisher/network condition, not a dead link; the audit reports strict and lenient results separately. All `ciet.ncert.gov.in/audio-book/*` links verify strictly.
3. `ncert-1-dilchasp-riyazi` still has pending contents (1 record).

**Do not claim complete NCERT coverage.** 56 book records / 689 verified titles is a partial
Classes 1–8 catalogue: Classes 9–12 are not catalogued, and several subjects/editions are absent.

---

## 5. Known limitations

- **Private family beta only.** Access control is the existing single-family session model; multi-family isolation, per-family RLS validation and onboarding were **not** tested. Do not describe this as public multi-family production ready.
- Class 9–12 have no catalogued NCERT books (2 generic tasks per stage).
- Poorvi chapters 6–15 have verified titles and sessions but no official chapter PDF until NCERT publishes them.
- Curriculum audit coverage is representative sampling (3 books/grade, 65 links), not an exhaustive fetch of all 689 slots.
- Read-aloud interruption is covered by the existing lesson-player behaviour and was exercised manually in the player; there is no automated test for mid-utterance interruption.
- Slow-network behaviour relies on the existing loading/offline states and service worker; no throttled-network automated test was added.
- The two pre-existing lint warnings remain (unrelated to this PR).

## 6. Remaining work before a wider family pilot

1. Multi-family access-control validation (session scoping, per-family data isolation, invite/onboarding) — required before any public claim.
2. Catalogued NCERT coverage for Classes 9–12 and the missing subjects/editions.
3. Exhaustive (not sampled) link re-audit once NCERT resolves the Poorvi uploads and its TLS chain.
4. Automated slow-network and read-aloud-interruption tests in the browser suite.
5. Real classroom/family usability sessions with a child (no parent prompting) to confirm the Continue Learning target is unambiguous in practice.
