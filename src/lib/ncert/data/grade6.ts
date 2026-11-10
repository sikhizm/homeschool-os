/**
 * NCERT Class 6 catalogue — NCF Middle Stage series (10 core books, one per
 * subject; Hindi twin editions deferred like Grade 5).
 *
 * Provenance (verified 10 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (fepr1ps, fhml1ps, fegp1ps, fecu1ps, fees1ps, fsde1ps, fuky1ps, fekr1ps,
 *   feky1ps, fekb1ps) — each names the book, publication number, ISBN where
 *   printed, first-edition date and reprint history.
 * - Chapter titles: official Contents pages inside those prelims PDFs, with
 *   every book's first chapter PDF downloaded and title-matched
 *   (fepr101, fhml101, fegp101, fecu101, fees101, fsde110–fsde116, fuky101–fuky114,
 *   fekr101, feky105, fekb101).
 *
 * Notes:
 * - Poorvi: 16 lessons across 5 units (unit headings are not chapter slots).
 * - Malhar: 13 numbered lessons; parenthetical "(पढ़ने के लिए)" reading pieces
 *   sit inside their numbered lessons and are not separate slots.
 * - Exploring Society: 14 numbered chapters; the unnumbered Introduction is
 *   bundled inside chapter PDF fees101 (fees102 = chapter 2).
 * - Deepakam: 16 numbered chapters (CIET audio index lists only 15 — it omits
 *   chapter 16; the official chapter PDF fsde116 exists).
 * - Khayal: 14 lessons; publication number 4671, ISBN printed on chapter PDFs
 *   (fuky110 shows "4671CH10", fuky114 shows "4671CH14").
 * - Kriti: 22 numbered items across Visual Arts, Music, Dance and Theatre.
 * - Khel Yatra: 5 units are the five official chapters (CIET and portal both
 *   list Chapter 1–5; chapter PDFs feky101–feky105 are the units). Unit 5
 *   (Yoga) internally numbers its own Chapter 1–6 session chapters.
 * - Kaushal Bodh: 6 projects across 3 Parts (official Table of Contents).
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {Textbook} from '../types';

export const grade6Textbooks:Textbook[]=[
 {
  "id":"ncert-6-poorvi","grade":6,"subject":"English","title":"Poorvi","language":"English","publisher":"NCERT","textbookCode":"fepr1","chapterCount":16,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fepr1=0-16","referenceUrl":"https://ncert.nic.in/textbook.php?fepr1=",
  "editionLabel":"NCERT 2026–27 reprint (0673, ISBN 978-93-5292-982-5; first edition June 2024, reprinted March 2025 and January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-malhar","grade":6,"subject":"Hindi","title":"Malhar","language":"Hindi","publisher":"NCERT","textbookCode":"fhml1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fhml1=0-13","referenceUrl":"https://ncert.nic.in/textbook.php?fhml1=",
  "editionLabel":"NCERT 2026–27 reprint (0671; first edition June 2024, reprinted March 2025 and January 2026 — no ISBN shown in the extracted prelims text); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-ganita-prakash","grade":6,"subject":"Mathematics","title":"Ganita Prakash","language":"English","publisher":"NCERT","textbookCode":"fegp1","chapterCount":10,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fegp1=0-10","referenceUrl":"https://ncert.nic.in/textbook.php?fegp1=",
  "editionLabel":"NCERT reprint (0674, ISBN 978-93-5292-717-3; first edition August 2024, reprinted December 2024 and January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-curiosity","grade":6,"subject":"Science","title":"Curiosity","language":"English","publisher":"NCERT","textbookCode":"fecu1","chapterCount":12,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fecu1=0-12","referenceUrl":"https://ciet.ncert.gov.in/audio-book/166",
  "editionLabel":"NCERT 2026–27 reprint (0677, ISBN 978-93-5292-972-6; first edition July 2024, reprinted December 2024 and January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-exploring-society","grade":6,"subject":"Social Science","title":"Exploring Society: India and Beyond","language":"English","publisher":"NCERT","textbookCode":"fees1","chapterCount":14,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fees1=0-14","referenceUrl":"https://ciet.ncert.gov.in/audio-book/168",
  "editionLabel":"NCERT reprint (0681, ISBN 978-93-5292-693-0; first edition June 2024, reprinted February 2025 and February 2026); 14 numbered chapters, unnumbered Introduction bundled in chapter PDF 1; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-deepakam","grade":6,"subject":"Sanskrit","title":"Deepakam","language":"Sanskrit","publisher":"NCERT","textbookCode":"fsde1","chapterCount":16,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fsde1=0-16","referenceUrl":"https://ciet.ncert.gov.in/audio-book/167",
  "editionLabel":"NCERT 2026–27 reprint (0672, ISBN 978-93-5292-923-8; first edition June 2024, reprinted April 2025 and January 2026); 16 numbered chapters (CIET audio index lists 15 — chapter 16 PDF exists); edition and chapter titles checked against official textbook prelims PDF and chapter PDFs",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-khayal","grade":6,"subject":"Urdu","title":"Khayal","language":"Urdu","publisher":"NCERT","textbookCode":"fuky1","chapterCount":14,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fuky1=0-14","referenceUrl":"https://ncert.nic.in/textbook.php?fuky1=",
  "editionLabel":"NCERT first edition 2024 (publication number 4671, ISBN 978-93-5292-988-7 printed on chapter PDFs); edition and chapter titles checked against official textbook prelims PDF and chapter PDFs",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-kriti","grade":6,"subject":"Arts","title":"Kriti","language":"English","publisher":"NCERT","textbookCode":"fekr1","chapterCount":22,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fekr1=0-22","referenceUrl":"https://ciet.ncert.gov.in/audio-book/174",
  "editionLabel":"NCERT reprint (ISBN 978-93-5292-951-1; first edition July 2024, reprinted March 2025 and March 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-khel-yatra","grade":6,"subject":"Physical Education","title":"Khel Yatra","language":"English","publisher":"NCERT","textbookCode":"feky1","chapterCount":5,
  "sourceUrl":"https://ncert.nic.in/textbook.php?feky1=0-5","referenceUrl":"https://ciet.ncert.gov.in/audio-book/173",
  "editionLabel":"NCERT 2026–27 reprint (0687, ISBN 978-93-5292-915-3; first edition July 2024, reprinted July 2025 and January 2026); structured as 5 units which are the five official chapters (portal and CIET Chapter 1–5); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-6-kaushal-bodh","grade":6,"subject":"Vocational Education","title":"Kaushal Bodh","language":"English","publisher":"NCERT","textbookCode":"fekb1","chapterCount":6,
  "sourceUrl":"https://ncert.nic.in/textbook.php?fekb1=0-6","referenceUrl":"https://ciet.ncert.gov.in/audio-book/169",
  "editionLabel":"NCERT 2026–27 reprint (0685, ISBN 978-93-5292-632-9; first edition July 2024, reprinted March 2025 and February 2026); 6 projects across 3 Parts per the official Table of Contents; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 }
];

/** Chapter titles read from the official prelims Contents pages (verified 10 Nov 2026). */
export const grade6ChapterTitles:Record<string,readonly string[]>={
 "ncert-6-poorvi":[
  "A Bottle of Dew",
  "The Raven and the Fox",
  "Rama to the Rescue",
  "The Unlikely Best Friends",
  "A Friend's Prayer",
  "The Chair",
  "Neem Baba",
  "What a Bird Thought",
  "Spices that Heal Us",
  "Change of Heart",
  "The Winner",
  "Yoga—A Way of Life",
  "Hamara Bharat—Incredible India!",
  "The Kites",
  "Ila Sachani: Embroidering Dreams with her Feet",
  "National War Memorial"
 ],
 "ncert-6-malhar":[
  "मातृभूमि",
  "गोल",
  "पहली बूँद",
  "हार की जीत",
  "रहीम के दोहे",
  "मेरी माँ",
  "जलाते चलो",
  "सत्रिया और बिहू नृत्य",
  "मैया मैं नहिं माखन खायो",
  "परीक्षा",
  "चेतक की वीरता",
  "हिंद महासागर में छोटा-सा हिंदुस्तान",
  "पेड़ की बात"
 ],
 "ncert-6-ganita-prakash":[
  "Patterns in Mathematics",
  "Lines and Angles",
  "Number Play",
  "Data Handling and Presentation",
  "Prime Time",
  "Perimeter and Area",
  "Fractions",
  "Playing with Constructions",
  "Symmetry",
  "The Other Side of Zero"
 ],
 "ncert-6-curiosity":[
  "The Wonderful World of Science",
  "Diversity in the Living World",
  "Mindful Eating: A Path to a Healthy Body",
  "Exploring Magnets",
  "Measurement of Length and Motion",
  "Materials Around Us",
  "Temperature and its Measurement",
  "A Journey through States of Water",
  "Methods of Separation in Everyday Life",
  "Living Creatures: Exploring their Characteristics",
  "Nature's Treasures",
  "Beyond Earth"
 ],
 "ncert-6-exploring-society":[
  "Locating Places on the Earth",
  "Oceans and Continents",
  "Landforms and Life",
  "Timeline and Sources of History",
  "India, That Is Bharat",
  "The Beginnings of Indian Civilisation",
  "India's Cultural Roots",
  "Unity in Diversity, or 'Many in the One'",
  "Family and Community",
  "Grassroots Democracy — Part 1: Governance",
  "Grassroots Democracy — Part 2: Local Government in Rural Areas",
  "Grassroots Democracy — Part 3: Local Government in Urban Areas",
  "The Value of Work",
  "Economic Activities Around Us"
 ],
 "ncert-6-deepakam":[
  "वयं वर्णमालां पठामः",
  "संयुक्त-व्यञ्जनानि",
  "एषः कः? एषा का? एतत् किम्?",
  "अहं च त्वं च",
  "संख्यागणना ननु सरला",
  "अहं प्रातः उत्तिष्ठामि",
  "शूराः वयं धीराः वयम्",
  "सः एव महान् चित्रकारः",
  "अतिथिदेवो भव",
  "बुद्धिः सर्वार्थसाधिका",
  "यः जानाति सः पण्डितः",
  "त्वम् आपणं गच्छ",
  "पृथिव्यां त्रीणि रत्नानि",
  "आलस्यं हि मनुष्याणां शरीरस्थः महान् रिपुः",
  "माधवस्य प्रियम् अङ्गम्",
  "वृक्षाः सत्पुरुषाः इव"
 ],
 "ncert-6-khayal":[
  "دعا",
  "چڑیا کا گھونسلا",
  "فصلوں کے تہوار",
  "آبِ رواں",
  "ویر عبدالحمید",
  "احسان کا بدلہ احسان",
  "محنت کی عظمت",
  "میری کوم",
  "ایک پودا اور گھاس",
  "پنسل کی کہانی",
  "سیر کو سوا سیر",
  "پیامِ عمل",
  "میزائل مین",
  "صحت اور صفائی"
 ],
 "ncert-6-kriti":[
  "Objects and Still Life",
  "Changing the Typical Picture",
  "Portraying People",
  "Paper Crafts",
  "Seals to Prints",
  "Music and your Emotions",
  "Musical Instruments",
  "Taal or Talam and Raga or Ragam in Indian Music",
  "Melodies of Diversity",
  "Songwriting",
  "Music and Society",
  "My Body in Motion",
  "Breaking Barriers with Dance",
  "Harmony in Motion",
  "Dances of Our Land",
  "Emotions Unveiled!",
  "Let's Design",
  "In the Company of Theatre",
  "Stories of Shadows and Strings — Puppetry",
  "The Grand Finale",
  "Integration of All Art Forms",
  "Assessment"
 ],
 "ncert-6-khel-yatra":[
  "Importance of Physical Education and Well-being",
  "Motor Fitness",
  "Fundamental Skills of Kho-Kho",
  "Fundamental Skills of Handball",
  "Yoga"
 ],
 "ncert-6-kaushal-bodh":[
  "School Kitchen Garden",
  "Biodiversity Register",
  "Maker Skills",
  "Animation and Games",
  "School Museum",
  "Cooking without Fire"
 ]
};

/** Official prelims Contents PDF per book (bookId → URL), for chapter-slot provenance. */
export const grade6ContentSources:Record<string,string>={
 "ncert-6-poorvi":"https://ncert.nic.in/textbook/pdf/fepr1ps.pdf",
 "ncert-6-malhar":"https://ncert.nic.in/textbook/pdf/fhml1ps.pdf",
 "ncert-6-ganita-prakash":"https://ncert.nic.in/textbook/pdf/fegp1ps.pdf",
 "ncert-6-curiosity":"https://ncert.nic.in/textbook/pdf/fecu1ps.pdf",
 "ncert-6-exploring-society":"https://ncert.nic.in/textbook/pdf/fees1ps.pdf",
 "ncert-6-deepakam":"https://ncert.nic.in/textbook/pdf/fsde1ps.pdf",
 "ncert-6-khayal":"https://ncert.nic.in/textbook/pdf/fuky1ps.pdf",
 "ncert-6-kriti":"https://ncert.nic.in/textbook/pdf/fekr1ps.pdf",
 "ncert-6-khel-yatra":"https://ncert.nic.in/textbook/pdf/feky1ps.pdf",
 "ncert-6-kaushal-bodh":"https://ncert.nic.in/textbook/pdf/fekb1ps.pdf"
};
