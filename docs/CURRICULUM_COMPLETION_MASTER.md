# Homeschool OS — Curriculum Completion Master

> Single source of truth for curriculum completeness. **Every number here is regenerated from the repo**, never estimated: run `npm run curriculum:inventory` after any catalogue change and update this file in the same commit.
>
> Last audit: **2026-11-13** · Base `main@13a3734` + Phase 4/5 branch (chapter-first engine, universal across Classes 1–8) · Gates before this change: lint 0 errors · typecheck 0 · **tests 157/157** · browser tests 4/4 · build 0 errors · smoke pass · `scripts/curriculum-audit.ts` 0 structural failures.

## Completion rule

A phase may be marked **COMPLETE** only when books + chapters + objectives + lessons for its scope are finished and every record carries provenance (source URL, edition, verified date, verification status: `Officially verified` / `Independently cross-verified` / `Partial` / `Awaiting` / `Superseded` / `Unavailable`). Nothing is ever marked complete by assertion; the test suite locks the counts.

## Phase 1 — Audit (COMPLETE)

Real figures recalculated from the repo on 2026-11-10 (superseding all historical "22 books / 207 chapters / 6 pending" notes):

| Metric | Value | Source of truth |
|---|---:|---|
| NCERT book records | **56** | `ncertTextbooks` (`src/lib/ncert/textbooks.ts` + `data/grade2.ts` + `data/grade3.ts` + `data/grade6.ts` + `data/grade7.ts` + `data/grade8.ts`) |
| Numbered chapter slots | **689** | `ncertChapterSlots` |
| Slots with source-verified titles | **689** (100%) | `textbookAudit()` |
| Books with contents pending | **1** | `chapterCount===0`: `ncert-1-dilchasp-riyazi` |
| Grades with ≥1 book | **1, 2, 3, 4, 5, 6, 7, 8** | `gradeCoverage()` |
| Curriculum competencies | **37** | `src/lib/curriculum/library.ts` |
| Global framework skills | **29** (7 frameworks) | `src/lib/global-curriculum/catalogue.ts` |
| Original lessons | **20** | `src/lib/lessons/library.ts` |
| Annual pathways (weekly steps) | infant 36 · nursery 72 · ukg 72 · class4 72 | `annualGrades` |
| DB migrations | 001–006 (learning_subjects, learner_objectives, learning_plan_starters, learning_activities, learning_planning_periods, learning_portfolio_entries, ncert_chapter_progress, auto_learning_progress, family_daily_plans) | `migrations/` |

Auto-learning queue catalogue (tasks per stage — gap indicator, not a completion metric; regenerated 2026-11-13):
Infant 36 · Toddler 72 · Early Years 78 · Nursery 94 · LKG 78 · UKG 94 · Class 1: 219 (216 NCERT chapter sessions + existing activities) · Class 2: 186 (183 NCERT chapter sessions + 3 existing activities) · Class 3: 298 · Class 4: 239 (147 chapter sessions + pathway steps) · Class 5: 262 · Class 6: 387 · Class 7: 393 · Class 8: 198 · Class 9–12: 2 each (no NCERT books catalogued above Class 8).

The Class 2-only learner pathway note below is historical: since the universal chapter engine (Phase 1, PR #49), every verified chapter in Classes 1–8 has the same three original parent-led sessions.

## NCERT library matrix (Classes 1–12)

| Grade | Books catalogued | Chapter slots | Titles verified | Status | Evidence |
|---|---:|---:|---:|---|---|
| 1 | 6 (5 indexed + 1 catalogue-only) | 72 | 72 | Catalogued; Dilchasp Riyazi contents pending | `docs/NCERT_CLASS1_INDEX.md` |
| 2 | 4 | 61 | 61 | **Catalogued + 183 chapter-level learner sessions integrated 2026-11-10** | `docs/NCERT_CLASS2_INDEX.md` |
| 3 | 7 | 98 | 98 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS3_INDEX.md` |
| 4 | 4 | 49 | 49 | Catalogued | `docs/NCERT_CLASS4_INDEX.md` |
| 5 | 7 | 86 | 86 | Catalogued | `docs/NCERT_CLASS5_INDEX.md` |
| 6 | 10 | 128 | 128 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS6_INDEX.md` |
| 7 | 12 | 130 | 130 | **Catalogued 2026-11-10** (incl. both Ganita Prakash and both Exploring Society parts) | `docs/NCERT_CLASS7_INDEX.md` |
| 8 | 6 | 65 | 65 | **Catalogued 2026-11-10** (incl. Ganita Prakash Part-II); Exploring Society etc. not yet added | `docs/NCERT_CLASS8_INDEX.md` |
| 9–10 | 0 | 0 | 0 | Not catalogued — pending | — |
| 11–12 | 0 | 0 | 0 | Not catalogued — pending | — |
| **Total** | **56** | **689** | **689** | 1 contents-pending book | `validateNcertCatalogue() === []` |

Class 2 learner pathway: 61 indexed chapters × 3 original parent-guided sessions = **183 sessions** (read/explore, practice, understanding check). Scripts are age-appropriate and subject-aware; they refer learners to the official chapter and do not reproduce textbook content. This is a usable chapter sequence, not a formally approved chapter-to-outcome map or completed mastery assessment.

Crosswalk frameworks in `global-curriculum/catalogue.ts`: 29 skills across 7 lenses (each skill carries an equivalence status — never auto-approved).

## Phase roadmap (honest statuses)

| Phase | Scope | Status |
|---|---|---|
| 1 | Full repo audit; this document; inventory script | **COMPLETE** (2026-11-10) |
| 2 | NCERT library complete for all graded books (1–12), every book contents-verified | **IN PROGRESS** — grades 1, 2, 3, 4, 5, 6, 7, 8 catalogued (56 books / 689 chapters, only Dilchasp Riyazi contents-pending); grades 9–12 outstanding |
| 3 | Objectives/competencies mapped per grade (beyond today's 37) | NOT STARTED |
| 4 | Ready-to-teach original lessons across all stages (beyond today's 20) | **PARTIAL** — every verified chapter in Classes 1–8 has three original parent-led sessions (read/practice/understanding check) via the universal chapter engine; the 20-lesson curated library and Class 4 pathway scripts remain; full authored depth per chapter still pending |
| 5 | Assessments with mastery evidence (never completion-only) | NOT STARTED |
| 6 | Adaptive revision (3-state `revisionState()` exists; behaviour layer pending) | NOT STARTED |
| 7 | Daily planner honouring the 60-min shared parent-guided budget | NOT STARTED |
| 8 | International crosswalks documented with equivalence statuses | PARTIAL — 7 lenses in catalogue; per-grade mapping pending |
| 9 | Sikh heritage / Punjabi / Gurmukhi strand (accurate Gurbani only, labelled interpretation) | PARTIAL — Punjabi lessons exist in the 20-lesson library |
| 10 | Enrichment: reasoning, coding, life skills | PARTIAL — strands inside existing skills/lessons |
| 11 | Safe DB migrations for new data | PARTIAL — migrations 001–006 exist; new phases extend via further migrations only |
| 12 | Gates after every phase (lint, typecheck, tests, build, smoke) | Ongoing — last run green |
| 13 | Documentation upkeep + deployment verification | Ongoing — this file + phase docs |

## Open discrepancies (documented, never silently resolved)

1. **Legacy vs current Class 2 series**: third-party sources still list Marigold/Raindrops/Maths Magic for Class 2; NCERT's official CIET index (2026–27) lists Mridang/Sarangi/Joyful Mathematics/Anandmay Ganit. The official index governs.
2. **CIET Sarangi index display**: page shows "अध्याय 26" in the header while repeating a "22" count; the enumerated chapter list has 26 entries — 26 used (enumeration wins, typo noted).
3. **Mridang Class 2 chapter count**: CIET enumerates 13 titles; an earlier working note claimed 14. 13 recorded (enumeration wins). Re-check on next CIET visit.
4. **Poorvi (Class 8 English, hepr1) chapter PDFs are partially hosted** (found by `scripts/curriculum-audit.ts`, 13 Nov 2026): NCERT serves `hepr101.pdf`–`hepr105.pdf` (200) but `hepr106.pdf`–`hepr115.pdf` return 404, even though the book has 15 verified chapter titles and its portal page and CIET audio-book (129) are live. `verifiedPdfChapters: 5` now caps PDF links at chapter 5; chapters 6–15 keep their verified titles, learning sessions and book-portal link. Re-audit when NCERT uploads the remaining chapter PDFs.
5. **ncert.nic.in TLS chain**: as observed from the audit host (13 Nov 2026), `ncert.nic.in` does not send its Let's Encrypt intermediate certificate, so strict TLS clients fail verification while the content itself returns 200. This is a publisher-side/network condition, not a bad-URL condition; the audit records both strict and lenient results. CIET (`ciet.ncert.gov.in`) verifies cleanly.

## Provenance rules (standing)

- Never invent textbooks, chapters, URLs, standards, or equivalences. Book-identity-verified ≠ contents-verified.
- Chapter titles come from official NCERT/CIET indexes; edition labels from official prelims PDFs; chapter links only where the `code+NN` PDF pattern was actually downloaded and matched.
- No copyrighted textbook text in the repo — titles and metadata only. Original lessons only.
- Gurbani quotations and translations must be accurate; interpretation is labelled separately from established history.
