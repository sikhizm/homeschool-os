/**
 * NCERT Class 8 catalogue — 2025 first editions / 2026–27 reprints of the
 * NCF Middle Stage series (six books, including both Ganita Prakash parts).
 *
 * Provenance (verified 10 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (hecu1ps, hepr1ps, hegp1ps, hegp2ps, hhml1ps, hsde1ps) — each names the
 *   book, publication number, ISBN, first-edition date and (except Ganita
 *   Prakash Part-II) reprint January 2026 with cover line "Reprint 2026-27".
 * - Chapter titles: official Contents pages inside those prelims PDFs.
 * - Chapter PDF link pattern: chapter 01 downloaded and matched for all six
 *   books (hecu101, hepr101, hegp101, hegp201, hhml101, hsde101).
 * - Phase 5 audit (13 Nov 2026, scripts/curriculum-audit.ts): every chapter
 *   PDF confirmed 200 except Poorvi hepr106–hepr115 (404 — NCERT hosts only
 *   chapters 01–05 so far). Poorvi is therefore capped via verifiedPdfChapters.
 *
 * Notes:
 * - Curiosity has 13 numbered chapters (earlier portal range said 12).
 * - Poorvi lists 15 untitled-numbered lessons across 5 units.
 * - Deepakam has 13 numbered chapters plus 3 unnumbered grammar appendices
 *   (appendices are not chapter slots).
 * - Ganita Prakash Grade 8 is two volumes: Part-1 (hegp1, first edition
 *   July 2025, reprinted January 2026) and Part-II (hegp2, first edition
 *   December 2025, no reprint yet), seven chapters each.
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {Textbook} from '../types';

export const grade8Textbooks:Textbook[]=[
 {
  "id":"ncert-8-poorvi","grade":8,"subject":"English","title":"Poorvi","language":"English","publisher":"NCERT","textbookCode":"hepr1","chapterCount":15,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hepr1=0-15","referenceUrl":"https://ciet.ncert.gov.in/audio-book/129",
  "editionLabel":"NCERT 2026–27 reprint (0873, ISBN 978-93-5729-940-4; first edition May 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles",
  // Phase 5 audit (13 Nov 2026): NCERT hosts hepr101–hepr105.pdf only;
  // hepr106–hepr115.pdf returned 404, so chapter PDFs stop at 5 until NCERT uploads the rest.
  "verifiedPdfChapters":5
 },
 {
  "id":"ncert-8-ganita-prakash","grade":8,"subject":"Mathematics","title":"Ganita Prakash","language":"English","publisher":"NCERT","textbookCode":"hegp1","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hegp1=0-7","referenceUrl":"https://ciet.ncert.gov.in/audio-book/130",
  "editionLabel":"NCERT 2026–27 reprint (0874, ISBN 978-93-5729-642-7; first edition July 2025, reprinted January 2026), Part-1; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-ganita-prakash-2","grade":8,"subject":"Mathematics","title":"Ganita Prakash (Part-II)","language":"English","publisher":"NCERT","textbookCode":"hegp2","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hegp2=0-7","referenceUrl":"https://ncert.nic.in/textbook.php?hegp2=",
  "editionLabel":"NCERT first edition December 2025 (0889, ISBN 978-93-5729-106-4), Part-II, no reprint yet; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-malhar","grade":8,"subject":"Hindi","title":"Malhar","language":"Hindi","publisher":"NCERT","textbookCode":"hhml1","chapterCount":10,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hhml1=0-10","referenceUrl":"https://ciet.ncert.gov.in/audio-book/131",
  "editionLabel":"NCERT 2026–27 reprint (0871, ISBN 978-93-5729-360-0; first edition June 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-deepakam","grade":8,"subject":"Sanskrit","title":"Deepakam","language":"Sanskrit","publisher":"NCERT","textbookCode":"hsde1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hsde1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/143",
  "editionLabel":"NCERT 2026–27 reprint (0872, ISBN 978-93-5729-294-8; first edition July 2025, reprinted January 2026); 13 numbered chapters plus unnumbered grammar appendices; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-curiosity","grade":8,"subject":"Science","title":"Curiosity","language":"English","publisher":"NCERT","textbookCode":"hecu1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hecu1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/128",
  "editionLabel":"NCERT 2026–27 reprint (0877, ISBN 978-93-5729-772-1; first edition June 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 }
];

/** Chapter titles read from the official prelims Contents pages (verified 10 Nov 2026). */
export const grade8ChapterTitles:Record<string,readonly string[]>={
 "ncert-8-poorvi":[
  "The Wit that Won Hearts",
  "A Concrete Example",
  "Wisdom Paves the Way",
  "A Tale of Valour: Major Somnath Sharma and the Battle of Badgam",
  "Somebody's Mother",
  "Verghese Kurien—I Too Had A Dream",
  "The Case of the Fifth Word",
  "The Magic Brush of Dreams",
  "Spectacular Wonders",
  "The Cherry Tree",
  "Harvest Hymn",
  "Waiting for the Rain",
  "Feathered Friend",
  "Magnifying Glass",
  "Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science"
 ],
 "ncert-8-ganita-prakash":[
  "A Square and A Cube",
  "Power Play",
  "A Story of Numbers",
  "Quadrilaterals",
  "Number Play",
  "We Distribute, Yet Things Multiply",
  "Proportional Reasoning-1"
 ],
 "ncert-8-ganita-prakash-2":[
  "Fractions in Disguise",
  "The Baudhayana-Pythagoras Theorem",
  "Proportional Reasoning-2",
  "Exploring Some Geometric Themes",
  "Tales by Dots and Lines",
  "Algebra Play",
  "Area"
 ],
 "ncert-8-malhar":[
  "स्वदेश",
  "दो गौरैया",
  "एक आशीर्वाद",
  "हरिद्वार",
  "कबीर के दोहे",
  "एक टोकरी भर मिट्टी",
  "मत बाँधो",
  "नए महमान",
  "आदमी का अनपत",
  "तरुण के स्वप्न"
 ],
 "ncert-8-deepakam":[
  "संगच्छध्वं संवदध्वम्",
  "अल्पानामपि वस्तूनां संहतिः कार्यसाधिका",
  "सुभाषितरसंपीत्वा जीवनं सफलं कुरु",
  "प्रणम्यो देशभक्तोऽयं गोपबन्धुर्महामनाः",
  "गीता सुगीता कर्तव्या",
  "डिजिभारतम् - युगपरिवर्तनम्",
  "मञ्जुलमञ्जूषासुन्दरसुरभाषा",
  "पश्यत कोणमैशान्यं भारतस्य मनोहरम्",
  "कोऽरुक् ? कोऽरुक् ? कोऽरुक् ?",
  "सन्निमित्ते वरं त्यागः (क-भागः)",
  "सन्निमित्ते वरं त्यागः (ख-भागः)",
  "सम्यग्वर्णप्रयोगेण ब्रह्मलोके महीयते",
  "वर्णोच्चारण-शिक्षा १"
 ],
 "ncert-8-curiosity":[
  "Exploring the Investigative World of Science",
  "The Invisible Living World: Beyond Our Naked Eye",
  "Health: The Ultimate Treasure",
  "Electricity: Magnetic and Heating Effects",
  "Exploring Forces",
  "Pressure, Winds, Storms, and Cyclones",
  "Particulate Nature of Matter",
  "Nature of Matter: Elements, Compounds, and Mixtures",
  "The Amazing World of Solutes, Solvents, and Solutions",
  "Light: Mirrors and Lenses",
  "Keeping Time with the Skies",
  "How Nature Works in Harmony",
  "Our Home: Earth, a Unique Life Sustaining Planet"
 ]
};

/** Official prelims PDFs whose Contents pages supplied the titles above. */
export const grade8ContentSources:Record<string,string>={
 "ncert-8-poorvi":"https://ncert.nic.in/textbook/pdf/hepr1ps.pdf",
 "ncert-8-ganita-prakash":"https://ncert.nic.in/textbook/pdf/hegp1ps.pdf",
 "ncert-8-ganita-prakash-2":"https://ncert.nic.in/textbook/pdf/hegp2ps.pdf",
 "ncert-8-malhar":"https://ncert.nic.in/textbook/pdf/hhml1ps.pdf",
 "ncert-8-deepakam":"https://ncert.nic.in/textbook/pdf/hsde1ps.pdf",
 "ncert-8-curiosity":"https://ncert.nic.in/textbook/pdf/hecu1ps.pdf"
};
