/**
 * NCERT Class 7 catalogue — NCF Middle Stage series (12 core books: one per
 * subject, plus both Ganita Prakash parts and both Exploring Society parts,
 * mirroring the Grade 8 maths-parts precedent). Hindi twin editions deferred
 * like Grades 5 and 6.
 *
 * Provenance (verified 10 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (gepr1ps, ghml1ps, gegp1ps, gegp2ps, gecu1ps, gees1ps, gees2ps, gsde1ps,
 *   guky1ps, gekr1ps, geky1ps, gekb1ps) — each names the book, publication
 *   number, ISBN where printed, first-edition date and reprint history.
 * - Chapter titles: official Contents pages inside those prelims PDFs, with
 *   chapter PDFs title-matched for every book where extraction allowed it
 *   (ghml101, gegp201, gecu101, gees101, gees201, gepr101, gsde101, gekr101,
 *   geky101, gekb101, guky101 + guky114). Portal chapter ranges re-checked
 *   (?gepr1=0-15 renders Chapter 1–15).
 *
 * Notes:
 * - Scope: 12 books — Ganita Prakash is two volumes (Part-1 + Part-II) and
 *   Exploring Society: India and Beyond is two volumes (Part 1 + Part 2, a
 *   Grade-7 difference from the single-volume Grade 6 book).
 * - Poorvi: 15 literary pieces across 5 units (unit headings are not chapter
 *   slots).
 * - Malhar: 10 numbered lessons; parenthetical "(पढ़ने के लिए)" reading pieces
 *   and genre tags are not separate slots (plain titles, per Grade 6/8).
 * - Exploring Society: Part 1 = 12 numbered chapters (Themes A–E), Part 2 =
 *   8 numbered chapters; combined Grade 7 total is 20.
 * - Deepakam: 12 numbered chapters; the unnumbered वर्णमात्रा supplementary
 *   study and परिशिष्ट 1–2 appendices are not chapter slots.
 * - Khayal: 14 lessons (CIET audio index also lists 14; chapter PDF guky114
 *   exists and guky115+ return ERROR). The prelims Contents extract is RTL
 *   mangled, so titles were taken from official chapter PDFs (guky101 =
 *   ترانۂ وحدت, guky114 = ڈیجیٹل ٹیکنالوجی) and cross-checked against the
 *   official lesson index.
 * - Kriti: 20 numbered chapters across Theatre, Music, Dance and Visual Arts.
 * - Khel Yatra: 6 units are the six official chapters (portal range
 *   ?geky1=0-6; About-the-Book enumerates six). The unnumbered Warm-up and
 *   Cool-down opens the book before Unit 1 and is not a slot; Unit 6 (Yoga)
 *   internally numbers its own Chapter 1–4 session chapters.
 * - Kaushal Bodh: 6 projects across 3 Parts per the official Table of
 *   Contents (Planning for Kaushal Mela and the four Annexures are unnumbered).
 * - Ganita Prakash Parts 1 and 2: Learning Material Sheets are unnumbered
 *   backmatter in both volumes.
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {Textbook} from '../types';

export const grade7Textbooks:Textbook[]=[
 {
  "id":"ncert-7-poorvi","grade":7,"subject":"English","title":"Poorvi","language":"English","publisher":"NCERT","textbookCode":"gepr1","chapterCount":15,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gepr1=0-15","referenceUrl":"https://ciet.ncert.gov.in/audio-book/151",
  "editionLabel":"NCERT 2026–27 reprint (0773, ISBN 978-93-5729-759-2; first edition March 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-malhar","grade":7,"subject":"Hindi","title":"Malhar","language":"Hindi","publisher":"NCERT","textbookCode":"ghml1","chapterCount":10,
  "sourceUrl":"https://ncert.nic.in/textbook.php?ghml1=0-10","referenceUrl":"https://ciet.ncert.gov.in/audio-book/156",
  "editionLabel":"NCERT 2026–27 reprint (0771; first edition April 2025, reprinted January 2026 — no ISBN shown in the extracted prelims text); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-ganita-prakash","grade":7,"subject":"Mathematics","title":"Ganita Prakash","language":"English","publisher":"NCERT","textbookCode":"gegp1","chapterCount":8,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gegp1=0-8","referenceUrl":"https://ciet.ncert.gov.in/audio-book/155",
  "editionLabel":"NCERT 2026–27 reprint (0774, ISBN 978-93-5729-983-1; first edition April 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-ganita-prakash-2","grade":7,"subject":"Mathematics","title":"Ganita Prakash (Part-II)","language":"English","publisher":"NCERT","textbookCode":"gegp2","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gegp2=0-7","referenceUrl":"https://ciet.ncert.gov.in/audio-book/137",
  "editionLabel":"NCERT first edition October 2025 (0789, ISBN 978-93-5729-156-9; no reprint shown); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-curiosity","grade":7,"subject":"Science","title":"Curiosity","language":"English","publisher":"NCERT","textbookCode":"gecu1","chapterCount":12,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gecu1=0-12","referenceUrl":"https://ciet.ncert.gov.in/audio-book/152",
  "editionLabel":"NCERT 2026–27 reprint (0777, ISBN 978-93-5729-039-5; first edition April 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-exploring-society","grade":7,"subject":"Social Science","title":"Exploring Society: India and Beyond","language":"English","publisher":"NCERT","textbookCode":"gees1","chapterCount":12,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gees1=0-12","referenceUrl":"https://ciet.ncert.gov.in/audio-book/150",
  "editionLabel":"NCERT 2026–27 reprint (ISBN 978-93-5729-287-0; first edition April 2025, reprinted February 2026); Part 1 of the two-part Grade 7 Social Science textbook; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-exploring-society-2","grade":7,"subject":"Social Science","title":"Exploring Society: India and Beyond (Part-II)","language":"English","publisher":"NCERT","textbookCode":"gees2","chapterCount":8,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gees2=0-8","referenceUrl":"https://ncert.nic.in/textbook.php?gees2=",
  "editionLabel":"NCERT first edition November 2025 (0782, ISBN 978-93-5729-141-5); Part 2 of the two-part Grade 7 Social Science textbook (no separate CIET audio entry — portal page used as reference); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-deepakam","grade":7,"subject":"Sanskrit","title":"Deepakam","language":"Sanskrit","publisher":"NCERT","textbookCode":"gsde1","chapterCount":12,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gsde1=0-12","referenceUrl":"https://ciet.ncert.gov.in/audio-book/154",
  "editionLabel":"NCERT 2026–27 reprint (0772, ISBN 978-93-5729-686-1; first edition April 2025, reprinted February 2026); 12 numbered chapters (unnumbered वर्णमात्रा study and two परिशिष्ट appendices are backmatter); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-khayal","grade":7,"subject":"Urdu","title":"Khayal","language":"Urdu","publisher":"NCERT","textbookCode":"guky1","chapterCount":14,
  "sourceUrl":"https://ncert.nic.in/textbook.php?guky1=0-14","referenceUrl":"https://ciet.ncert.gov.in/audio-book/153",
  "editionLabel":"NCERT first edition 2025 (publication number 4771; no ISBN shown in the extracted prelims text); 14 lessons confirmed by chapter PDF guky114 (guky115+ ERROR) and CIET Chapter 1–14; edition and chapter titles checked against official textbook prelims PDF and chapter PDFs",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-kriti","grade":7,"subject":"Arts","title":"Kriti","language":"English","publisher":"NCERT","textbookCode":"gekr1","chapterCount":20,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gekr1=0-20","referenceUrl":"https://ciet.ncert.gov.in/audio-book/149",
  "editionLabel":"NCERT 2026–27 reprint (ISBN 978-93-5729-978-7; first edition April 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-khel-yatra","grade":7,"subject":"Physical Education","title":"Khel Yatra","language":"English","publisher":"NCERT","textbookCode":"geky1","chapterCount":6,
  "sourceUrl":"https://ncert.nic.in/textbook.php?geky1=0-6","referenceUrl":"https://ncert.nic.in/textbook.php?geky1=",
  "editionLabel":"NCERT 2026–27 reprint (0787, ISBN 978-93-5729-760-8; first edition March 2025); structured as 6 units which are the six official chapters (About-the-Book enumerates six; portal range ?geky1=0-6); unnumbered Warm-up and Cool-down opens the book before Unit 1; no CIET audio entry — portal page used as reference; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-7-kaushal-bodh","grade":7,"subject":"Vocational Education","title":"Kaushal Bodh","language":"English","publisher":"NCERT","textbookCode":"gekb1","chapterCount":6,
  "sourceUrl":"https://ncert.nic.in/textbook.php?gekb1=0-6","referenceUrl":"https://ciet.ncert.gov.in/audio-book/135",
  "editionLabel":"NCERT 2026–27 reprint (0785, ISBN 978-93-5729-151-4; first edition March 2025, reprinted February 2026); 6 projects across 3 Parts per the official Table of Contents; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 }
];

/** Chapter titles read from the official prelims Contents pages (verified 10 Nov 2026). */
export const grade7ChapterTitles:Record<string,readonly string[]>={
 "ncert-7-poorvi":[
  "The Day the River Spoke",
  "Try Again",
  "Three Days to See",
  "Animals, Birds, and Dr. Dolittle",
  "A Funny Man",
  "Say the Right Thing",
  "My Brother's Great Invention",
  "Paper Boats",
  "North, South, East, West",
  "The Tunnel",
  "Travel",
  "Conquering the Summit",
  "A Homage to Our Brave Soldiers",
  "My Dear Soldiers",
  "Rani Abbakka"
 ],
 "ncert-7-malhar":[
  "माँ, कह एक कहानी",
  "तीन बुद्धिमान",
  "फूल और काँटा",
  "पानी रे पानी",
  "नहीं होना बीमार",
  "गिरिधर कविराय की कुंडलिया",
  "वर्षा-बहार",
  "बिरजू महाराज से साक्षात्कार",
  "चिड़िया",
  "मीरा के पद"
 ],
 "ncert-7-ganita-prakash":[
  "Large Numbers Around Us",
  "Arithmetic Expressions",
  "A Peek Beyond the Point",
  "Expressions using Letter-Numbers",
  "Parallel and Intersecting Lines",
  "Number Play",
  "A Tale of Three Intersecting Lines",
  "Working with Fractions"
 ],
 "ncert-7-ganita-prakash-2":[
  "Geometric Twins",
  "Operations with Integers",
  "Finding Common Ground",
  "Another Peek Beyond the Point",
  "Connecting the Dots...",
  "Constructions and Tilings",
  "Finding the Unknown"
 ],
 "ncert-7-curiosity":[
  "The Ever-Evolving World of Science",
  "Exploring Substances: Acidic, Basic, and Neutral",
  "Electricity: Circuits and their Components",
  "The World of Metals and Non-metals",
  "Changes Around Us: Physical and Chemical",
  "Adolescence: A Stage of Growth and Change",
  "Heat Transfer in Nature",
  "Measurement of Time and Motion",
  "Life Processes in Animals",
  "Life Processes in Plants",
  "Light: Shadows and Reflections",
  "Earth, Moon, and the Sun"
 ],
 "ncert-7-exploring-society":[
  "Geographical Diversity of India",
  "Understanding the Weather",
  "Climates of India",
  "New Beginnings: Cities and States",
  "The Rise of Empires",
  "The Age of Reorganisation",
  "The Gupta Era: An Age of Tireless Creativity",
  "How the Land Becomes Sacred",
  "From the Rulers to the Ruled: Types of Governments",
  "The Constitution of India — An Introduction",
  "From Barter to Money",
  "Understanding Markets"
 ],
 "ncert-7-exploring-society-2":[
  "The Story of Indian Farming",
  "India and Her Neighbours",
  "Empires and Kingdoms: 6th to 10th Centuries",
  "Turning Tides: 11th and 12th Centuries",
  "India, a Home to Many",
  "The State, the Government, and You",
  "Infrastructure: Engine of India's Development",
  "Banks and the Magic of Finance"
 ],
 "ncert-7-deepakam":[
  "वन्दे भारतमातरम्",
  "नित्यं पिबामः सुभाषितरसम्",
  "मित्राय नमः",
  "नलभ्यते चेत्आम्लं द्राक्षाफलम्",
  "सेवा हि परमो धर्मः",
  "क्रीडाम वयं श्लोकान्त्याक्षरीम्",
  "ईशावास्यम् इदं सर्वम्",
  "हितं मनोहारि च दुर्लभं वचः",
  "अन्नाद् भवन्ति भूतानि",
  "दशमः कः ?",
  "द्वीपेषु रम्यः द्वीपोऽण्डमानः",
  "वीराङ्गना पन्नाधाया"
 ],
 "ncert-7-khayal":[
  "ترانۂ وحدت",
  "ایک پرانی کہانی",
  "پہلی اُڑان",
  "پانی",
  "جگنو",
  "بوڑھی اماں کی بات",
  "برگیڈیر محمد عثمان",
  "قدمبڑھاؤ دوستو!",
  "ڈاکٹر سروپلی رادھا کرشنن",
  "چیونٹیوں کی قطار",
  "دو بیلوں کی کہانی",
  "ہمارے کھیل",
  "جھلکاری بائی",
  "ڈیجیٹل ٹیکنالوجی"
 ],
 "ncert-7-kriti":[
  "Understanding Emotions",
  "Say More without Speech—Mime",
  "Let's Design—Stage Technicals",
  "Story of India's Storytelling Tradition",
  "Making Music",
  "Music, Emotions and Creativity",
  "Ragas and Talas/Taal",
  "The Music of the People",
  "Performance",
  "Dance and Sculpture",
  "Dance Vocabulary and Techniques",
  "Dance, You and Creativity",
  "Personalities",
  "Natya",
  "Objects in Icons and Symbols",
  "Nature's Palette",
  "How You Feel",
  "Textiles and Traditions",
  "The Art of Calligraphy",
  "Integration of All Art Forms — Sculptures Come Alive!"
 ],
 "ncert-7-khel-yatra":[
  "Foundational Basis of Physical Education and Well-being",
  "Physical and Motor Fitness",
  "Fundamental Skills of Sports — Badminton",
  "Fundamental Skills of Sports — Football",
  "Fundamental Skills of Sports — Kabaddi",
  "Yoga"
 ],
 "ncert-7-kaushal-bodh":[
  "Plant Nursery",
  "School Habitat Garden",
  "Tie and Dye",
  "AI Assistant",
  "Storytime with Puppets",
  "Family Health Handbook"
 ]
};

/** Official prelims Contents PDF per book (bookId → URL), for chapter-slot provenance. */
export const grade7ContentSources:Record<string,string>={
 "ncert-7-poorvi":"https://ncert.nic.in/textbook/pdf/gepr1ps.pdf",
 "ncert-7-malhar":"https://ncert.nic.in/textbook/pdf/ghml1ps.pdf",
 "ncert-7-ganita-prakash":"https://ncert.nic.in/textbook/pdf/gegp1ps.pdf",
 "ncert-7-ganita-prakash-2":"https://ncert.nic.in/textbook/pdf/gegp2ps.pdf",
 "ncert-7-curiosity":"https://ncert.nic.in/textbook/pdf/gecu1ps.pdf",
 "ncert-7-exploring-society":"https://ncert.nic.in/textbook/pdf/gees1ps.pdf",
 "ncert-7-exploring-society-2":"https://ncert.nic.in/textbook/pdf/gees2ps.pdf",
 "ncert-7-deepakam":"https://ncert.nic.in/textbook/pdf/gsde1ps.pdf",
 "ncert-7-khayal":"https://ncert.nic.in/textbook/pdf/guky1ps.pdf",
 "ncert-7-kriti":"https://ncert.nic.in/textbook/pdf/gekr1ps.pdf",
 "ncert-7-khel-yatra":"https://ncert.nic.in/textbook/pdf/geky1ps.pdf",
 "ncert-7-kaushal-bodh":"https://ncert.nic.in/textbook/pdf/gekb1ps.pdf"
};
