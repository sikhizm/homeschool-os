# NCERT Class 1 — Publisher-verified textbook index

> **Historical Class 1 audit scope:** the combined figures below describe this
> document's original delivery snapshot. The live Phase 7 catalogue is now 77
> books / 892 verified Contents titles across Classes 1–10; see
> `CURRICULUM_COMPLETION_MASTER.md` and `PHASE7_NCERT_EXPANSION_REPORT.md`.

## Delivery summary

- Six Class 1 NCERT book records are catalogued.
- Five books appear in NCERT/CIET's current Class 1 audio-book index and have **72 numbered chapter/lesson titles** checked against CIET's official index.
- NCERT's Urdu publication catalogue also lists **Dilchasp Riyazi** (publication code 4109). It is retained as an identified book, but its digital contents and chapter sequence are not verified; no chapter slots or links are invented for it.
- The five indexed books expose their own authenticated Homeschool OS learning pages. Official NCERT chapter PDFs are linked only where the direct PDF pattern was verified. Shehnai retains its NCERT book-portal and CIET links; a direct chapter-PDF URL is not guessed.
- All 207 chapter records across Classes 1, 4 and 5 remain unmapped. No textbook-to-skill mapping is automatically approved.
- No database migration, learner-data write, textbook download/rehosting or copyrighted textbook text is added.

## Class 1 catalogue

| Textbook | Subject / language | Numbered chapters | Status |
|---|---|---:|---|
| Mridang | English | 9 | Titles verified |
| Sarangi | Hindi | 19 | Titles verified |
| Joyful Mathematics | Mathematics · English | 13 | Titles verified |
| Anandmay Ganit | Mathematics · Hindi | 13 | Titles verified |
| Shehnai | Urdu | 18 | Titles verified; direct chapter PDF pattern not verified |
| Dilchasp Riyazi | Mathematics · Urdu | — | NCERT catalogue identity verified; contents pending |
| **Total** | **Five CIET-indexed books** | **72** | **Five title lists verified** |

## Official NCERT textbook portals and edition evidence

- Mridang: https://ncert.nic.in/textbook.php?aemr1=0-9
  - Official prelims / edition page: https://ncert.nic.in/textbook/pdf/aemr1ps.pdf
- Sarangi: https://ncert.nic.in/textbook.php?ahsr1=0-19
  - Official prelims / edition page: https://ncert.nic.in/textbook/pdf/ahsr1ps.pdf
- Joyful Mathematics: https://ncert.nic.in/textbook.php?aejm1=0-13
  - Official prelims / edition page: https://ncert.nic.in/textbook/pdf/aejm1ps.pdf
- Anandmay Ganit: https://ncert.nic.in/textbook.php?ahjm1=0-13
  - Official prelims / edition page: https://ncert.nic.in/textbook/pdf/ahjm1ps.pdf
- Shehnai: https://ncert.nic.in/textbook.php?aush1=0-18
- Dilchasp Riyazi: https://ncert.nic.in/textbook.php

The four English/Hindi title-page PDFs above identify the 2026–27 reprints. The Shehnai chapter titles are indexed by CIET, but its 2026–27 print reprint and direct chapter-PDF pattern have not been independently confirmed. Dilchasp Riyazi is listed in NCERT's Urdu textbook publication catalogue, code 4109; its current digital contents remain pending.

## CIET / NCERT chapter-title evidence

- Mridang, Class 1: https://ciet.ncert.gov.in/audio-book/115
- Sarangi, Class 1: https://ciet.ncert.gov.in/audio-book/117
- Joyful Mathematics, Class 1: https://ciet.ncert.gov.in/audio-book/118
- Anandmay Ganit, Class 1: https://ciet.ncert.gov.in/audio-book/119
- Shehnai, Class 1: https://ciet.ncert.gov.in/audio-book/123
- NCERT/CIET Class 1 audio-book directory: https://ciet.ncert.gov.in/audio-books?class=1
- NCERT publication catalogue (including the separate Urdu list): https://ncert.nic.in/division/pd/pdf/list_of_publication.pdf

## Chapter-title scope

Only numbered chapters/lessons shown in the CIET Class 1 audio-book index are counted. The unnumbered “Puzzles” item shown after Joyful Mathematics Chapter 13 is not counted as a chapter. The Urdu catalogue-only book remains at zero chapter slots until its own digital contents source is checked.

## Editorial and copyright boundaries

- A verified title and position do not mean the chapter has been read, assessed, mapped to a competency or approved as a curriculum equivalence.
- The app stores bibliographic metadata, chapter titles and original parent-guided prompts only. It opens NCERT/CIET resources externally and does not mirror textbook pages, exercises or PDFs.
- All chapter-to-skill mappings remain unapproved pending actual chapter review and a recorded human decision.
- The Class 1 index does not alter any learner's saved plan, completion history, annual pathway or progress.

## Combined catalogue after this phase

- Class 1: 6 book records; 72 verified numbered titles across five books; one Urdu mathematics catalogue record pending contents.
- Class 4: 4 books; 49 verified titles.
- Class 5: 7 books; 86 verified titles.
- Class 8: 5 book identities; contents pending.
- **Combined: 22 book records; 207 verified chapter titles; six books still awaiting chapter contents.**
- Approved chapter-to-skill mappings: **0**.

## Release checks

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build` and `npm run test:smoke`. Confirm Class 1 displays all five CIET-indexed chapter lists, Shehnai has no guessed direct PDF link, Dilchasp Riyazi displays an honest pending state, and Classes 4, 5 and 8 remain unchanged. No production database migration is required.
