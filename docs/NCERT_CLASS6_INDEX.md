# NCERT Class 6 — Publisher-verified textbook index

## Delivery summary

- Ten Class 6 NCERT books (NCF 2023 Middle Stage series; first editions 2024, reprinted through 2026) are catalogued with **128 numbered chapter titles**.
- Book identity, edition and chapter titles verified from official NCERT prelims PDFs (Contents pages); the book list cross-checked against NCERT/CIET's official audio-book directory; chapter-PDF links spot-verified by downloading chapter/unit PDFs of all ten books (the rest generate from the verified `<code><NN>.pdf` pattern).
- Every title is metadata only — no textbook text is reproduced.
- No database migration, learner-data write, or textbook download/rehosting is added by this index.

## Class 6 catalogue

| Textbook | Subject / language | Chapters | Textbook code | Status |
|---|---|---:|---|---|
| Poorvi | English | 16 | fepr1 | Titles verified |
| Malhar | Hindi | 13 | fhml1 | Titles verified |
| Ganita Prakash | Mathematics · English | 10 | fegp1 | Titles verified |
| Curiosity | Science · English | 12 | fecu1 | Titles verified |
| Exploring Society: India and Beyond | Social Science · English | 14 | fees1 | Titles verified |
| Deepakam | Sanskrit | 16 | fsde1 | Titles verified |
| Khayal | Urdu | 14 | fuky1 | Titles verified |
| Kriti | Arts · English | 22 | fekr1 | Titles verified |
| Khel Yatra | Physical Education · English | 5 | feky1 | Titles verified |
| Kaushal Bodh | Vocational Education · English | 6 | fekb1 | Titles verified |
| **Total** | **Ten books** | **128** | | **All titles verified** |

## Edition evidence (official NCERT prelims PDFs, verified 2026-11-10)

- Poorvi: https://ncert.nic.in/textbook/pdf/fepr1ps.pdf — publication 0673, ISBN 978-93-5292-982-5, First Edition June 2024, reprinted March 2025 and January 2026, cover line "Reprint 2026-27".
- Malhar: https://ncert.nic.in/textbook/pdf/fhml1ps.pdf — publication 0671, First Edition June 2024, reprinted March 2025 and January 2026, cover line "Reprint 2026-27" (no ISBN line present in the extracted prelims text).
- Ganita Prakash: https://ncert.nic.in/textbook/pdf/fegp1ps.pdf — publication 0674, ISBN 978-93-5292-717-3, First Edition August 2024, reprinted December 2024 and January 2026.
- Curiosity: https://ncert.nic.in/textbook/pdf/fecu1ps.pdf — publication 0677, ISBN 978-93-5292-972-6, First Edition July 2024, reprinted December 2024 and January 2026, cover line "Reprint 2026-27".
- Exploring Society: India and Beyond: https://ncert.nic.in/textbook/pdf/fees1ps.pdf — publication 0681, ISBN 978-93-5292-693-0, First Edition June 2024, reprinted February 2025 and February 2026.
- Deepakam: https://ncert.nic.in/textbook/pdf/fsde1ps.pdf — publication 0672, ISBN 978-93-5292-923-8, First Edition June 2024, reprinted April 2025 and January 2026, cover line "Reprint 2026-27".
- Khayal: https://ncert.nic.in/textbook/pdf/fuky1ps.pdf — publication 4671, ISBN 978-93-5292-988-7 (ISBN printed on the chapter PDFs, e.g. fuky110 "4671CH10"), © 2024.
- Kriti: https://ncert.nic.in/textbook/pdf/fekr1ps.pdf — ISBN 978-93-5292-951-1, First Edition July 2024, reprinted March 2025 and March 2026.
- Khel Yatra: https://ncert.nic.in/textbook/pdf/feky1ps.pdf — publication 0687, ISBN 978-93-5292-915-3, First Edition July 2024, reprinted July 2025 and January 2026, cover line "Reprint 2026-27".
- Kaushal Bodh: https://ncert.nic.in/textbook/pdf/fekb1ps.pdf — publication 0685, ISBN 978-93-5292-632-9, First Edition July 2024, reprinted March 2025 and February 2026, cover line "Reprint 2026-27" (the © line reads 2022 — a printer's oddity noted for completeness).

## Chapter-title evidence

Titles were read from each book's official Contents page inside the prelims PDFs listed above, then cross-checked against official chapter/unit PDFs. CIET directory mapping (https://ciet.ncert.gov.in/audio-books?class=6): Curiosity /audio-book/166 · दीपकम् /167 · Exploring Society /168 · Kaushal Bodh EN /169 (also /170 Hindi) · गणितप्रकाश /171 · खेलयात्रा /172 · Khel Yatra /173 · Kriti /174 · कृति /175 · समाजका अध्ययन /176 · जिज्ञासा /177. The CIET directory omits the Urdu (Khayal) and other language-medium titles.

## Chapter-PDF link verification

The direct chapter-PDF pattern (`https://ncert.nic.in/textbook/pdf/<code><NN>.pdf`) was confirmed by downloading and title-matching PDFs across all ten books (several pairs were content-checked after the fetch service crossed labels):

- fepr101 → "A Bottle of Dew" (Poorvi Unit 1) · fhml101 → "मातृभूमि" · fegp101 → "Patterns in Mathematics" · fecu101 → "The Wonderful World of Science"
- fees101 → Introduction + "Locating Places on the Earth"; fees102 → "Oceans and Continents"
- fsde101 → "वयं वर्णमालांपठामः"; fsde110–fsde116 → chapters 7–16 titles
- fuky101 → "دعا"; fuky102–fuky114 → chapters 2–14 titles (footer/heading markers CH10, CH14 confirm the numbering)
- fekr101 → "Objects and Still Life" · feky105 → Unit 5 (Yoga) · fekb101 → Project 1 "School Kitchen Garden"

## Documented discrepancies and notes

1. Deepakam's CIET audio page (https://ciet.ncert.gov.in/audio-book/167) lists Chapter 1–15; the official Contents and chapter PDFs show **16** numbered chapters (fsde116 exists). The record uses 16 (`fsde1=0-16`).
2. Khel Yatra is structured as **5 units**, and those units are the five official chapters (portal `feky1=0-5` lists exactly Chapter 1–5; CIET /173 agrees; chapter PDFs feky101–feky105 are the units). Unit 5 (Yoga) internally numbers its own Chapter 1–6 session chapters — those are not catalogue slots.
3. Exploring Society has 14 **numbered** chapters; the unnumbered Introduction is bundled inside chapter PDF fees101 (fees102 = chapter 2). The record uses 14 (`fees1=0-14`).
4. Poorvi: 16 numbered lessons across 5 units (unit headings are not slots). Malhar: 13 numbered lessons; parenthetical "(पढ़ने के लिए)" reading pieces sit inside their lessons and are not slots. Kriti: 22 numbered items across Visual Arts, Music, Dance and Theatre. Kaushal Bodh: 6 projects across 3 Parts (Annexures unnumbered).
5. Khayal's publication number is 4671 (not a 0xxx portal number); titles were taken from the chapter PDFs because the official Contents extraction renders Urdu RTL-mangled.
6. Hindi-medium twins and other Class 6 titles in the CIET directory are **not yet catalogued** (deferred, no records, no invented titles): गणितप्रकाश (Hindi twin of Ganita Prakash, /171), खेलयात्रा (/172), Kaushal Bodh Hindi (/170), कृति (/175), समाजका अध्ययन (/176), जिज्ञासा (/177). Old rationalised-series codes (`fes1`, `fukh1`, `fesc1`) are retired and not used.
