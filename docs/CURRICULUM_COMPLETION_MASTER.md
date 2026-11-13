# Homeschool OS — Curriculum Completion Master

> Single source of truth for curriculum completeness. **Every number here is regenerated from the repo**, never estimated: run `npm run curriculum:inventory` after any catalogue change and update this file in the same commit.
>
> Last audit: **2026-11-13** · Phase 7 baseline `main@225bc93acc286006c7cb61a567e109d0841ea67f` (merged PR #61) · Phase 6 Class 5 mapping pilot is documented separately in `PHASE6_CURRICULUM_MAPPING_REPORT.md`; Phase 7 expansion evidence is in `PHASE7_NCERT_EXPANSION_REPORT.md`. Historical Phase 4/5 gate counts remain historical; each phase records its own actual gate results rather than inheriting a green claim.

## Completion rule

A phase may be marked **COMPLETE** only when books + chapters + objectives + lessons for its scope are finished and every record carries provenance (source URL, edition, verified date, verification status: `Officially verified` / `Independently cross-verified` / `Partial` / `Awaiting` / `Superseded` / `Unavailable`). Nothing is ever marked complete by assertion; the test suite locks the counts.

## Phase 1 — Audit (COMPLETE)

Real figures recalculated from the repo on 2026-11-13 (superseding all historical "22 books / 207 chapters / 6 pending" notes):

| Metric | Value | Source of truth |
|---|---:|---|
| NCERT book records | **77** | `ncertTextbooks` and per-grade data modules through `grade10.ts` |
| Numbered chapter slots | **892** | `ncertChapterSlots` |
| Slots with source-verified titles | **892** (100%) | `textbookAudit()` |
| Books with contents pending | **1** | `chapterCount===0`: `ncert-1-dilchasp-riyazi` |
| Grades with ≥1 book | **1–10** | `gradeCoverage()` |
| Curriculum competencies | **37** | `src/lib/curriculum/library.ts` |
| Global framework skills | **29** (7 frameworks) | `src/lib/global-curriculum/catalogue.ts` — illustrative framework context, not official grade equivalencies |
| Phase 6 Class 5 outcome registry | **25 original outcomes; 0 official seeded; 0 framework equivalencies** | `src/lib/curriculum/outcome-registry.ts` |
| Phase 6 Class 5 mapping pilot | **86 chapters accounted: 60 drafts, 0 approved, 26 unmapped with reasons** | `src/lib/curriculum/class5-mapping.ts`; `npm run curriculum:mapping-audit` |
| Original lessons | **20** | `src/lib/lessons/library.ts` |
| Annual pathways (weekly steps) | infant 36 · nursery 72 · ukg 72 · class4 72 | `annualGrades` |
| DB migration files | 001–008 (including planning competencies, learner archive support and append-only curriculum mapping review history) | `migrations/` — file presence is not proof of live application; Phase 6 requires `npm run db:migrate:curriculum-mapping` |

Auto-learning queue catalogue (tasks per stage — gap indicator, not a completion metric; regenerated 2026-11-13):
Infant 36 · Toddler 72 · Early Years 78 · Nursery 94 · LKG 78 · UKG 94 · Class 1: 219 (216 NCERT chapter sessions + existing activities) · Class 2: 186 (183 NCERT chapter sessions + 3 existing activities) · Class 3: 298 · Class 4: 239 (147 chapter sessions + pathway steps) · Class 5: 262 · Class 6: 387 · Class 7: 393 · Class 8: 318 (315 default-path NCERT sessions + existing activities) · Class 9: 266 (264 default-path NCERT sessions + existing activities; nine Kaushal Vikas alternatives remain selected, not auto-assigned) · Class 10: 182 (180 NCERT sessions + existing activities) · Class 11–12: 2 each (no NCERT book records).

The Class 2-only learner pathway note below is historical: since the universal chapter engine (Phase 1, PR #49), every verified **default-path** item in Classes 1–10 has the same three original parent-led sessions. Official select-one vocational alternatives remain browseable but are not falsely auto-assigned.

## NCERT library matrix (Classes 1–12)

| Grade | Books catalogued | Chapter slots | Titles verified | Status | Evidence |
|---|---:|---:|---:|---|---|
| 1 | 6 (5 indexed + 1 catalogue-only) | 72 | 72 | Catalogued; Dilchasp Riyazi contents pending | `docs/NCERT_CLASS1_INDEX.md` |
| 2 | 4 | 61 | 61 | **Catalogued + 183 chapter-level learner sessions integrated 2026-11-10** | `docs/NCERT_CLASS2_INDEX.md` |
| 3 | 7 | 98 | 98 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS3_INDEX.md` |
| 4 | 4 | 49 | 49 | Catalogued | `docs/NCERT_CLASS4_INDEX.md` |
| 5 | 7 | 86 | 86 | Catalogued; Phase 6 review queue accounts for all chapters (60 draft original-outcome proposals; 26 intentionally unmapped; 0 approved) | `docs/NCERT_CLASS4_COMPLETION_CLASS5_INDEX.md`; `docs/PHASE6_CURRICULUM_MAPPING_REPORT.md` |
| 6 | 10 | 128 | 128 | **Catalogued 2026-11-10** | `docs/NCERT_CLASS6_INDEX.md` |
| 7 | 12 | 130 | 130 | **Catalogued 2026-11-10** (incl. both Ganita Prakash and both Exploring Society parts) | `docs/NCERT_CLASS7_INDEX.md` |
| 8 | 11 | 111 | 111 | **Phase 7 expanded the audit set**: 105 default-path items + 6 Kaushal Bodh project alternatives awaiting any future persisted selection; Chapters, Projects and Units remain visibly distinct | `docs/NCERT_CLASS8_INDEX.md`; `docs/PHASE7_NCERT_EXPANSION_REPORT.md` |
| 9 | 9 | 97 | 97 | **Catalogued + 264 default-path sessions integrated 2026-11-13**; Chapters 2–4, 6–8 and 10–12 of Kaushal Vikas are explicit select-one alternatives, not auto-assigned | `docs/NCERT_CLASS9_INDEX.md` |
| 10 | 7 | 60 | 60 | **Catalogued + 180 chapter sessions integrated 2026-11-13**; all direct PDF links intentionally portal-fallback pending individual validation | `docs/NCERT_CLASS10_INDEX.md` |
| 11–12 | 0 | 0 | 0 | Source-backed audit backlog only; not bulk imported | `docs/PHASE7_NCERT_EXPANSION_REPORT.md` |
| **Total** | **77** | **892** | **892** | 1 contents-pending book | `validateNcertCatalogue() === []` |

Class 2 learner pathway: 61 indexed chapters × 3 original parent-guided sessions = **183 sessions** (read/explore, practice, understanding check). Scripts are age-appropriate and subject-aware; they refer learners to the official chapter and do not reproduce textbook content. This is a usable chapter sequence, not a formally approved chapter-to-outcome map or completed mastery assessment.

Crosswalk frameworks in `global-curriculum/catalogue.ts`: 29 original illustrative skills across 7 lenses. Framework tags are context-only editorial references, never equivalence statuses or auto-approved standards mappings.

## Phase roadmap (honest statuses)

| Phase | Scope | Status |
|---|---|---|
| 1 | Full repo audit; this document; inventory script | **COMPLETE** (2026-11-10) |
| 2 | NCERT library complete for all graded books (1–12), every book contents-verified | **IN PROGRESS** — grades 1–10 have audited records (77 books / 892 verified titles; only Dilchasp Riyazi contents-pending); Classes 11–12 remain a separately sourced backlog |
| 3 | Provenance-aware objectives/outcomes mapped per grade | **PILOT IN REVIEW** — reusable registry + Class 5 queue exist (25 original outcomes; 60 draft mappings; 26 documented gaps; 0 seed approvals). Official Class 5 outcomes still require source-section transcription and human review. |
| 4 | Ready-to-teach original lessons across all stages (beyond today's 20) | **PARTIAL** — every verified default-path Contents item in Classes 1–10 has three original parent-led sessions (read/practice/understanding check) via the universal chapter engine; select-one vocational alternatives stay visible but are not auto-assigned; the 20-lesson curated library and Class 4 pathway scripts remain; full authored depth per item still pending |
| 5 | Assessments with mastery evidence (never completion-only) | **PARTIAL** — chapter understanding and later independent recall produce evidence-derived `completed`/`retained` status; broader curriculum-outcome assessment remains deliberately separate from mapping approval. |
| 6 | Adaptive revision and retention | **COMPLETE for the current chapter-first engine** — adaptive independent/hinted/not-yet recall, five spaced checks, undo and evidence-derived mastery are implemented; see `ADAPTIVE_RETENTION_PHASE.md`. |
| 7 | Daily planner honouring the shared parent-guided budget | **COMPLETE for the current daily-assignment workflow** — dated family plans, carry-forward and sequence guarantees were merged in PR #59; wider long-term planning remains iterative. |
| 8 | International crosswalk context and review safeguards | **PARTIAL** — 7 lenses are documented as framework context only; Phase 6 creates no equivalence and requires provenance/human review for any future mapping. |
| 9 | Sikh heritage / Punjabi / Gurmukhi strand (accurate Gurbani only, labelled interpretation) | PARTIAL — Punjabi lessons exist in the 20-lesson library; Phase 6 intentionally leaves 25 Hindi/Urdu Class 5 chapters unmapped pending specialist review. |
| 10 | Enrichment: reasoning, coding, life skills | PARTIAL — strands inside existing skills/lessons |
| 11 | Safe DB migrations for new data | PARTIAL — additive files through 008 exist; migration application must be verified per environment. Phase 6 adds an RLS-protected append-only review table and runner. |
| 12 | Gates after every phase (lint, typecheck, tests, build, smoke) | Ongoing — report actual command results per phase; browser execution depends on a provisioned Playwright browser. |
| 13 | Documentation upkeep + deployment verification | Ongoing — this file, phase reports and environment-specific deployment evidence |

## Open discrepancies (documented, never silently resolved)

1. **Legacy vs current Class 2 series**: third-party sources still list Marigold/Raindrops/Maths Magic for Class 2; NCERT's official CIET index (2026–27) lists Mridang/Sarangi/Joyful Mathematics/Anandmay Ganit. The official index governs.
2. **CIET Sarangi index display**: page shows "अध्याय 26" in the header while repeating a "22" count; the enumerated chapter list has 26 entries — 26 used (enumeration wins, typo noted).
3. **Mridang Class 2 chapter count**: CIET enumerates 13 titles; an earlier working note claimed 14. 13 recorded (enumeration wins). Re-check on next CIET visit.
4. **Poorvi (Class 8 English, hepr1) chapter PDFs are partially hosted** (found by `scripts/curriculum-audit.ts`, 13 Nov 2026): NCERT serves `hepr101.pdf`–`hepr105.pdf` (200) but `hepr106.pdf`–`hepr115.pdf` return 404, even though the book has 15 verified chapter titles and its portal page and CIET audio-book (129) are live. `verifiedPdfChapters: 5` now caps PDF links at chapter 5; chapters 6–15 keep their verified titles, learning sessions and book-portal link. Re-audit when NCERT uploads the remaining chapter PDFs.
5. **Phase 7 Class 8–10 direct PDFs**: the 46 added Class 8 items and every Class 9–10 item expose no individually validated direct PDF from this audit environment. Their verified metadata stays live, but each uses its official NCERT book portal fallback; no URL was inferred from a code.
6. **Select-one vocational structures**: Class 8 Kaushal Bodh and Class 9 Kaushal Vikas use explicit official choice groups. Alternatives remain source-verified and discoverable, but are not auto-assigned as a fabricated linear course.
7. **ncert.nic.in TLS chain**: as observed from the audit host (13 Nov 2026), `ncert.nic.in` does not send its Let's Encrypt intermediate certificate, so strict TLS clients fail verification while the content itself returns 200. This is a publisher-side/network condition, not a bad-URL condition; the audit records both strict and lenient results. CIET (`ciet.ncert.gov.in`) verifies cleanly.

## Provenance rules (standing)

- Never invent textbooks, chapters, URLs, standards, or equivalences. Book-identity-verified ≠ contents-verified.
- Chapter titles come from official NCERT/CIET indexes; edition labels from official prelims PDFs; direct chapter links only where individually audited; legacy code-pattern links are documented historical records and Phase 7 additions use explicit references or the official book portal.
- No copyrighted textbook text in the repo — titles and metadata only. Original lessons only.
- Gurbani quotations and translations must be accurate; interpretation is labelled separately from established history.
