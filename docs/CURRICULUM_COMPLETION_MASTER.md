# Homeschool OS — Curriculum Completion Master

> Single source of truth for curriculum completeness. **Every number here is regenerated from the repo**, never estimated: run `npm run curriculum:inventory` after any catalogue change and update this file in the same commit.
>
> Last audit: **2026-11-10** · Branch `arena/0ee0d2fc-homeschool-os` · Gates at last update: lint 0 · typecheck 0 · **tests 113/113** · build 0 errors · smoke pass.

## Completion rule

A phase may be marked **COMPLETE** only when books + chapters + objectives + lessons for its scope are finished and every record carries provenance (source URL, edition, verified date, verification status: `Officially verified` / `Independently cross-verified` / `Partial` / `Awaiting` / `Superseded` / `Unavailable`). Nothing is ever marked complete by assertion; the test suite locks the counts.

## Phase 1 — Audit (COMPLETE)

Real figures recalculated from the repo on 2026-11-10 (superseding all historical "22 books / 207 chapters / 6 pending" notes):

| Metric | Value | Source of truth |
|---|---:|---|
| NCERT book records | **44** | `ncertTextbooks` (`src/lib/ncert/textbooks.ts` + `data/grade2.ts` + `data/grade3.ts` + `data/grade6.ts` + `data/grade8.ts`) |
| Numbered chapter slots | **559** | `ncertChapterSlots` |
| Slots with source-verified titles | **559** (100%) | `textbookAudit()` |
| Books with contents pending | **1** | `chapterCount===0`: `ncert-1-dilchasp-riyazi` |
| Grades with ≥1 book | **1, 2, 3, 4, 5, 6, 8** | `gradeCoverage()` |
| Curriculum competencies | **37** | `src/lib/curriculum/library.ts` |
| Global framework skills | **29** (7 frameworks) | `src/lib/global-curriculum/catalogue.ts` |
| Original lessons | **20** | `src/lib/lessons/library.ts` |
| Annual pathways (weekly steps) | infant 36 · nursery 72 · ukg 72 · class4 72 | `annualGrades` |
| DB migrations | 001–006 (learning_subjects, learner_objectives, learning_plan_starters, learning_activities, learning_planning_periods, learning_portfolio_entries, ncert_chapter_progress, auto_learning_progress, family_daily_plans) | `migrations/` |

Auto-learning queue catalogue (tasks per stage — gap indicator, not a completion metric):
Infant 36 · Toddler 72 · Early Years 78 · Nursery 94 · LKG 78 · UKG 94 · Class 1: 3 · Class 2: 3 · Class 3: 4 · Class 4: 239 · Class 5: 4 · Class 6–8: 3 each · Class 9–12: 2 each.

## NCERT library matrix (Classes 1–12)

| Grade | Books catalogued | Chapter slots | Titles verified | Status | Evidence |
|---|---:|---:|---:|---|---|
| 1 | 6 (5 indexed + 1 catalogue-only) | 72 | 72 | Catalogued; Dilchasp Riyazi contents pending | `docs/NCERT_CLASS1_INDEX.md` |
| 2 | 4 | 61 | 61 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS2_INDEX.md` |
| 3 | 7 | 98 | 98 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS3_INDEX.md` |
| 4 | 4 | 49 | 49 | Catalogued | `docs/NCERT_CLASS4_INDEX.md` |
| 5 | 7 | 86 | 86 | Catalogued | `docs/NCERT_CLASS5_INDEX.md` |
| 6 | 10 | 128 | 128 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS6_INDEX.md` |
| 7 | 0 | 0 | 0 | Not catalogued — pending | — |
| 8 | 6 | 65 | 65 | **Catalogued 2026-11-10** (incl. Ganita Prakash Part-II); Exploring Society etc. not yet added | `docs/NCERT_CLASS8_INDEX.md` |
| 9–10 | 0 | 0 | 0 | Not catalogued — pending | — |
| 11–12 | 0 | 0 | 0 | Not catalogued — pending | — |
| **Total** | **44** | **559** | **559** | 1 contents-pending book | `validateNcertCatalogue() === []` |

Crosswalk frameworks in `global-curriculum/catalogue.ts`: 29 skills across 7 lenses (each skill carries an equivalence status — never auto-approved).

## Phase roadmap (honest statuses)

| Phase | Scope | Status |
|---|---|---|
| 1 | Full repo audit; this document; inventory script | **COMPLETE** (2026-11-10) |
| 2 | NCERT library complete for all graded books (1–12), every book contents-verified | **IN PROGRESS** — grades 1, 2, 3, 4, 5, 6, 8 catalogued (44 books / 559 chapters, only Dilchasp Riyazi contents-pending); grades 7, 9–12 outstanding |
| 3 | Objectives/competencies mapped per grade (beyond today's 37) | NOT STARTED |
| 4 | Ready-to-teach original lessons across all stages (beyond today's 20) | NOT STARTED |
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

## Provenance rules (standing)

- Never invent textbooks, chapters, URLs, standards, or equivalences. Book-identity-verified ≠ contents-verified.
- Chapter titles come from official NCERT/CIET indexes; edition labels from official prelims PDFs; chapter links only where the `code+NN` PDF pattern was actually downloaded and matched.
- No copyrighted textbook text in the repo — titles and metadata only. Original lessons only.
- Gurbani quotations and translations must be accurate; interpretation is labelled separately from established history.
