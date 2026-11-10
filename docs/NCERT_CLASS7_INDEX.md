# NCERT Class 7 — Publisher-verified textbook index

## Delivery summary

- Twelve Class 7 NCERT books (NCF 2023 Middle Stage series; first editions 2025, reprinted through 2026) are catalogued with **130 numbered chapter titles**.
- Class 7 is the first grade with **two two-volume books**: Ganita Prakash (Part-1 + Part-II, mirroring the Grade 8 maths precedent) and Exploring Society: India and Beyond (Part 1 + Part 2 — a Grade 7 difference from the single-volume Grade 6 book).
- Book identity, edition and chapter titles verified from official NCERT prelims PDFs (Contents pages); the book list cross-checked against NCERT/CIET's official audio-book directory; chapter-PDF links spot-verified by downloading chapter/unit PDFs of eleven of the twelve books (the rest generate from the verified `<code><NN>.pdf` pattern).
- Every title is metadata only — no textbook text is reproduced.
- No database migration, learner-data write, or textbook download/rehosting is added by this index.

## Class 7 catalogue

| Textbook | Subject / language | Chapters | Textbook code | Status |
|---|---|---:|---|---|
| Poorvi | English | 15 | gepr1 | Titles verified |
| Malhar | Hindi | 10 | ghml1 | Titles verified |
| Ganita Prakash | Mathematics · English | 8 | gegp1 | Titles verified |
| Ganita Prakash (Part-II) | Mathematics · English | 7 | gegp2 | Titles verified |
| Curiosity | Science · English | 12 | gecu1 | Titles verified |
| Exploring Society: India and Beyond | Social Science · English | 12 | gees1 | Titles verified |
| Exploring Society: India and Beyond (Part-II) | Social Science · English | 8 | gees2 | Titles verified |
| Deepakam | Sanskrit | 12 | gsde1 | Titles verified |
| Khayal | Urdu | 14 | guky1 | Titles verified |
| Kriti | Arts · English | 20 | gekr1 | Titles verified |
| Khel Yatra | Physical Education · English | 6 | geky1 | Titles verified |
| Kaushal Bodh | Vocational Education · English | 6 | gekb1 | Titles verified |
| **Total** | **Twelve books** | **130** | | **All titles verified** |

## Edition evidence (official NCERT prelims PDFs, verified 2026-11-10)

- Poorvi: https://ncert.nic.in/textbook/pdf/gepr1ps.pdf — publication 0773, ISBN 978-93-5729-759-2, First Edition March 2025, reprinted January 2026, cover line "Reprint 2026-27".
- Malhar: https://ncert.nic.in/textbook/pdf/ghml1ps.pdf — publication 0771, First Edition April 2025, reprinted January 2026, cover line "Reprint 2026-27" (no ISBN line present in the extracted prelims text; PDF internal name "Prelims_Malhaar.indd").
- Ganita Prakash Part-1: https://ncert.nic.in/textbook/pdf/gegp1ps.pdf — publication 0774, ISBN 978-93-5729-983-1, First Edition April 2025, reprinted January 2026, cover line "Reprint 2026-27".
- Ganita Prakash Part-II: https://ncert.nic.in/textbook/pdf/gegp2ps.pdf — publication 0789, ISBN 978-93-5729-156-9, First Edition October 2025 (no reprint shown).
- Curiosity: https://ncert.nic.in/textbook/pdf/gecu1ps.pdf — publication 0777, ISBN 978-93-5729-039-5, First Edition April 2025, reprinted January 2026, cover line "Reprint 2026-27".
- Exploring Society Part 1: https://ncert.nic.in/textbook/pdf/gees1ps.pdf — ISBN 978-93-5729-287-0, First Edition April 2025, reprinted February 2026, cover line "Reprint 2026-27" (no publication number line captured in the extracted prelims text).
- Exploring Society Part 2: https://ncert.nic.in/textbook/pdf/gees2ps.pdf — publication 0782, ISBN 978-93-5729-141-5, First Edition November 2025, cover line "Reprint 2026-27" (no reprint date line).
- Deepakam: https://ncert.nic.in/textbook/pdf/gsde1ps.pdf — publication 0772, ISBN 978-93-5729-686-1, First Edition April 2025, reprinted February 2026, cover line "Reprint 2026-27".
- Khayal: https://ncert.nic.in/textbook/pdf/guky1ps.pdf — publication 4771 (no ISBN line present in the extracted prelims text).
- Kriti: https://ncert.nic.in/textbook/pdf/gekr1ps.pdf — ISBN 978-93-5729-978-7, First Edition April 2025, reprinted January 2026, cover line "Reprint 2026-27".
- Khel Yatra: https://ncert.nic.in/textbook/pdf/geky1ps.pdf — publication 0787, ISBN 978-93-5729-760-8, First Edition March 2025, cover line "Reprint 2026-27".
- Kaushal Bodh: https://ncert.nic.in/textbook/pdf/gekb1ps.pdf — publication 0785, ISBN 978-93-5729-151-4, First Edition March 2025, reprinted February 2026, cover line "Reprint 2026-27".

## Chapter-title evidence

Titles were read from each book's official Contents page inside the prelims PDFs listed above, then cross-checked against official chapter/unit PDFs. CIET directory mapping (https://ciet.ncert.gov.in/audio-books?class=7): Kaushal Bodh /audio-book/135 · Ganita Prakash-II /137 · Kriti /149 · Exploring Society /150 · Poorvi /151 · Curiosity /152 · Khayal /153 · दीपकम् /154 · Ganita Prakash /155 · मल्हार /156. Khel Yatra has **no CIET audio entry** (confirmed via the NCERT rate list, publication 0787, and the portal page) and is referenced to the portal. The CIET directory also lists Hindi-medium twins (जिज्ञासा /139, कृति /179, कौशल बोध /182, गणित प्रकाश /185) which are deferred with no records.

## Chapter-PDF link verification

The direct chapter-PDF pattern (`https://ncert.nic.in/textbook/pdf/<code><NN>.pdf`) was confirmed by downloading and title-matching PDFs across eleven books (several pairs were content-checked after the fetch service crossed labels):

- gepr101 → "The Day the River Spoke" (Poorvi Unit 1) · ghml101 → "माँ, कह एक कहानी" (footer marker 0771CH01)
- gegp201 → "Geometric Twins" (Ganita Part-II chapter 1); gegp101 fetch failed repeatedly with HTTP 500 — chapter 1 ("Large Numbers Around Us") comes from the official gegp1ps Contents page
- gecu101 → "The Ever-Evolving World of Science" · gees101 → "Geographical Diversity of India" · gees201 → "The Story of Indian Farming"
- gsde101 → "प्रथमः पाठः / वन्दे भारतमातरम्" · gekr101 → "Understanding Emotions" · geky101 → "Unit 1 — Foundational Basis of Physical Education and Well-being" (running head "Khel Yatra") · gekb101 → "Project 1: Plant Nursery" (running head "Kaushal Bodh— Grade 7")
- guky101 → first lesson opens with the تلوک چند محروم nazm (= "ترانۂ وحدت"); guky114 → "ڈیجیٹل ٹیکنالوجی" (chapter 14; guky115–guky117 return ERROR)
- Portal range re-checked: `?gepr1=0-15` renders exactly Chapter 1–15.

## Documented discrepancies and notes

1. **Exploring Society is two volumes in Grade 7.** Part 1 (gees1, 12 numbered chapters) + Part 2 (gees2, 8 numbered chapters) = 20 chapters combined, matching third-party "20 chapter" totals. A third-party list showing 13 Part-1 chapters (extra "From Pilgrimage to Trades, Beyond India") is wrong — the official Contents has 12. The old rationalised-series code `ges1`/`ges1ps` returns "ERROR" and is retired; the current codes are `gees1`/`gees2`.
2. Khayal has **14 numbered lessons** (CIET /153 lists Chapter 1–14; chapter PDF guky114 exists and guky115+ return ERROR). The prelims Contents extract renders Urdu RTL-mangled, so titles were taken from official chapter PDFs (guky101, guky114) and cross-checked against the official lesson index. Reading-only pieces (گلزار وطن, ہماری تہذیب, دوہے, ایک لڑکی کا گیت) are unnumbered and not slots. Publication number 4771 (not a 0xxx portal number).
3. Khel Yatra: the About-the-Book text says "five units" but then enumerates six; the official Contents and portal range `?geky1=0-6` show **6 units = 6 official chapters** (Yoga is Unit 6). The unnumbered "Warm-up and Cool-down" opens the book before Unit 1 and is not a slot. Unit 6 internally numbers its own Chapter 1–4 session chapters — those are not catalogue slots.
4. Deepakam: 12 numbered chapters; the unnumbered वर्णमात्रा supplementary study and परिशिष्ट 1–2 appendices are backmatter, not slots.
5. Poorvi: 15 literary pieces across 5 units (unit headings are not slots). Malhar: 10 numbered lessons; parenthetical "(पढ़ने के लिए)" reading pieces sit inside their lessons and are not slots; genre tags dropped from titles per the Grade 6/8 convention. Kriti: 20 numbered chapters across Theatre, Music, Dance and Visual Arts. Kaushal Bodh: 6 projects across 3 Parts (Planning for Kaushal Mela and Annexures 1–4 unnumbered). Ganita Prakash Parts 1 and 2: Learning Material Sheets are unnumbered backmatter in both volumes.
6. Hindi-medium twins and other Class 7 titles in the CIET directory are **not yet catalogued** (deferred, no records, no invented titles): जिज्ञासा (Hindi Curiosity, /139), कृति (Hindi Kriti, /179), कौशल बोध (Hindi Kaushal Bodh, /182), गणित प्रकाश (Hindi Ganita Prakash, /185).
7. The foreword of gekr1ps (Kriti) refers to "Grade 6" — a printer's carry-over oddity noted for completeness; the book body, ISBN and CIET entry all say Grade 7.
