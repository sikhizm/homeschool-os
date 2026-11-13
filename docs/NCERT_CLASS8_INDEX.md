# NCERT Class 8 catalogue index

**Phase 7 audit date:** 2026-11-13
**Current index:** **11 official-source book records, 111 verified Contents-item titles**
**Scope:** a provenance-first directory of the audited NCERT Class 8 records.
It is a chapter/resource library, not a prescribed-board list, a complete Class 8
syllabus claim, or an outcome map.

## Evidence and link rules

1. Book identity, edition and Contents titles come from official NCERT portal or
   prelims/Contents sources. The CIET audio-book index remains evidence only for
   the older records where it was the original verified source.
2. A generic NCERT portal range is navigation, not proof of a Contents count.
3. A direct PDF appears only when that individual direct resource was previously
   audited. A **portal fallback** is intentional; it is not a guessed or broken
   direct URL.
4. The application stores bibliographic metadata and titles only. It does not
   copy NCERT prose, exercises, illustrations, answer keys or outcomes.
5. No Class 8 record has an automatic chapter-to-outcome mapping or an NCERT
   mastery assertion.

## Catalogue matrix

| Book | Subject / category | Contents structure indexed | Edition / source evidence | Direct PDF policy |
|---|---|---:|---|---|
| Poorvi | English / language | 15 chapters | 2026–27 reprint (0873); official prelims + CIET index | Legacy audit: chapters 1–5 direct; 6–15 portal fallback |
| Ganita Prakash, Part I | Mathematics / core | 7 chapters | 2026–27 reprint (0874); official prelims | Legacy audited direct links |
| Ganita Prakash, Part II | Mathematics / core | 7 chapters | first edition December 2025 (0889); official prelims | Legacy audited direct links |
| Malhar | Hindi / language | 10 chapters | 2026–27 reprint (0871); official prelims | Legacy audited direct links |
| Deepakam | Sanskrit / language | 13 chapters; unnumbered grammar appendices excluded | 2026–27 reprint (0872); official prelims | Legacy audited direct links |
| Curiosity | Science / core | 13 chapters | 2026–27 reprint (0877); official prelims | Legacy audited direct links |
| Exploring Society: India and Beyond, Part I | Social Science / core | 7 chapters | 2026–27 reprint (0881, ISBN 978-93-5729-293-1); official Contents | All 7 use the official book portal fallback |
| Exploring Society: India and Beyond, Part II | Social Science / core | 8 chapters | official Part II Contents; source notes the revised textbook and 2026 judiciary rewrite | All 8 use the official book portal fallback |
| Kaushal Bodh | Vocational Education / vocational | 6 **projects** in 3 forms of work | 2026–27 reprint; official Contents and guidance | All 6 use the official book portal fallback |
| Khel Yatra | Physical Education and Well-being / physical education | 6 **units** | first edition July 2025; January 2026 reprint (0887, ISBN 978-93-5729-520-8); official prelims | All 6 use the official book portal fallback |
| Kriti | Arts Education / arts | 19 chapters across Theatre, Music, Dance and Movement, and Visual Arts | 2026–27 reprint; official Contents | All 19 use the official book portal fallback |

**Totals:** 11 books · 111 source-verified titles · 55 legacy direct-PDF
links · 56 portal-fallback items. The forty-six Phase 7 Class 8 additions expose
**zero** direct PDFs until each is independently checked.

## Official sources

- [NCERT textbook portal](https://ncert.nic.in/textbook.php)
- [Exploring Society Part I prelims](https://ncert.nic.in/textbook/pdf/hees1ps.pdf)
- [Exploring Society Part II prelims](https://ncert.nic.in/textbook/pdf/hees2ps.pdf)
- [Kaushal Bodh prelims](https://ncert.nic.in/textbook/pdf/hekb1ps.pdf)
- [Khel Yatra prelims](https://ncert.nic.in/textbook/pdf/heky1ps.pdf)
- [Kriti prelims](https://ncert.nic.in/textbook/pdf/hekr1ps.pdf)

The legacy-source links are retained in `src/lib/ncert/data/grade8.ts`; each
book row in the application links to its official portal and source.

## Structure and learning-path safeguards

### Kaushal Bodh is project-selective

The official guidance says the six projects are **not mandatory**: a school may
choose one project from each form of work, or design another appropriate project.
The catalogue therefore records the projects in three explicit select-one groups:

| Form of work | Official alternatives |
|---|---|
| Work with Life Forms | Hydroponics: Growing Plants without Soil; Feeding and Caring for Farm Animals |
| Work with Machines and Materials | Working with Wood and Bamboo; Home Automation |
| Work in Human Services | Water Audit for Water Management; Creating Advertisements |

These six verified project records remain discoverable. They are deliberately
excluded from the default automatic chapter-session queue; Homeschool OS does
not turn a publisher selection into a compulsory six-project sequence. A parent
may use the existing progress control after a learner works with a project, but
that is learner-progress evidence only: it neither persists a parent/school
alternative selection nor creates the project’s session trio.

### Khel Yatra is unit-structured

The official **About the Book** section identifies six units: Foundations of
Physical Education and Well-being; Physical and Motor Fitness; Fundamental
Skills of Athletics; Fundamental Skills of Table Tennis; Fundamental Skills of
Volleyball; and Yoga. The interface labels them **Unit**, not Chapter. NCERT’s
portal has further component navigation entries, which are not silently recounted
as a 20-chapter course. The same official section leaves class planning and equal
distribution to principals and physical-education teachers, so the app does not
pretend the six units prescribe a fixed session calendar.

### Social Science and arts boundaries

Exploring Society Parts I–II use their official seven-plus-eight Contents titles.
Kriti uses its nineteen numbered Contents chapters. Associated material,
front/back matter, portal navigation and unnumbered material are not promoted to
extra slots.

## Intentionally excluded or pending

- Class 8 Urdu **Khayal** remains out of the catalogue. Its available official
  portal/CIET evidence has not yet been reconciled to an official prelims edition
  and Contents record to this audit standard.
- No individual direct URL is inferred from an NCERT book code. Re-audit direct
  PDFs one item at a time before adding an explicit reference.

## Learning engine boundary

Every **default-path** verified Class 8 item has stable original session IDs:

```text
ncert:<chapterId>:read
ncert:<chapterId>:practice
ncert:<chapterId>:review
```

This currently covers 105 items (315 sessions): the 65 existing chapter records,
all 40 non-selective Phase 7 chapters/units, and not the six optional Kaushal
Bodh project alternatives. The sessions are original parent-led prompts that
open official material externally. They do not create mappings, claim official
outcomes, reproduce NCERT material, or automatically write learner data.

## Revalidation checklist

1. Recheck edition and Contents sources when NCERT publishes a new printing.
2. Individually verify a direct PDF before adding it as an explicit reference.
3. Preserve a project, unit, alternative or QR-only structure instead of forcing
   it into a linear chapter sequence.
4. Run `npm run curriculum:catalogue-audit`, `npm run curriculum:inventory`,
   typecheck and the test suite after catalogue changes.
