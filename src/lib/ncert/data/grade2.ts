/**
 * NCERT Class 2 catalogue — 2026–27 reprints of the NCF Foundational Stage series.
 *
 * Provenance (verified 10 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (bemr1ps.pdf, bhsr1ps.pdf, bejm1ps.pdf, bhjm1ps.pdf) — each names the book,
 *   "Textbook for Class II", first edition May 2023 and Reprint 2026-27.
 * - Chapter titles: official CIET NCERT audio-book index
 *   (ciet.ncert.gov.in/audio-book/116, 120, 121, 122).
 * - Chapter PDF link pattern: chapter 01 downloaded and matched for all four
 *   books (bemr101, bhsr101, bejm101, bhjm101); bemr103 re-checked to confirm
 *   book-wide sequential numbering under Mridang's unit structure.
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {Textbook} from '../types';

export const grade2Textbooks:Textbook[]=[
 {
  "id":"ncert-2-mridang","grade":2,"subject":"English","title":"Mridang","language":"English","publisher":"NCERT","textbookCode":"bemr1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?bemr1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/116",
  "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-2-sarangi","grade":2,"subject":"Hindi","title":"Sarangi","language":"Hindi","publisher":"NCERT","textbookCode":"bhsr1","chapterCount":26,
  "sourceUrl":"https://ncert.nic.in/textbook.php?bhsr1=0-26","referenceUrl":"https://ciet.ncert.gov.in/audio-book/120",
  "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-2-joyful-mathematics","grade":2,"subject":"Mathematics","title":"Joyful Mathematics","language":"English","publisher":"NCERT","textbookCode":"bejm1","chapterCount":11,
  "sourceUrl":"https://ncert.nic.in/textbook.php?bejm1=0-11","referenceUrl":"https://ciet.ncert.gov.in/audio-book/121",
  "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-2-anandmay-ganit","grade":2,"subject":"Mathematics","title":"Anandmay Ganit","language":"Hindi","publisher":"NCERT","textbookCode":"bhjm1","chapterCount":11,
  "sourceUrl":"https://ncert.nic.in/textbook.php?bhjm1=0-11","referenceUrl":"https://ciet.ncert.gov.in/audio-book/122",
  "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
 },
];

/** Chapter titles checked against the CIET index; Mridang's unit-scoped chapter numbers are recorded in book-wide order. */
export const grade2ChapterTitles:Record<string,readonly string[]>={
 'ncert-2-mridang':[
  'My Bicycle','Picture Reading','It is Fun','Seeing without Seeing','Come Back Soon',
  'Between Home and School','This is My Town','A Show of Clouds','My Name','The Crow',
  'The Smart Monkey','Little Drops of Water','We are all Indians'
 ],
 'ncert-2-sarangi':[
  'नीमा की दादी','घर','माला की चाँदी की पायल','माँ','थाथू और मैं','चींटा','टिल्लू जी',
  'तीन दोस्त','दुनिया रंग-बिरंगी','कौन','बैंगनी जोजो','तोसिया का सपना','तालाब','बीज',
  'किसान','मूली','बरसात और मेंढक','शेर और चूहे की दोस्ती','आउट','छुपन-छुपाई',
  'हाथी साईकिल चला रहा है','चार दिशाएँ','चंदा मामा','गिरे ताल में चंदा मामा',
  'सबसे बड़ा छाता','बादल'
 ],
 'ncert-2-joyful-mathematics':[
  'A Day at the Beach','Shapes Around Us','Fun with Numbers','Shadow Story (Togalu)','Playing with Lines',
  'Decoration for Festival','Rani’s Gift','Grouping and Sharing','Which Season is it?','Fun at the Fair',
  'Data Handling'
 ],
 'ncert-2-anandmay-ganit':[
  'समुद्र किनारे एक दिन','आस-पास की आकृतियाँ','संख्याओं का आनंद','कहानी परछाइयों से','रेखाओं से खेल',
  'त्यौहार पर सजावट','रानी का उपहार','समूह एवं बँटवारा','मौसम का आनंद','मेले का आनंद',
  'आँकड़ों के साथ कार्य'
 ],
};

/** Where each Class 2 title list was read (official CIET index pages). */
export const grade2ContentSources:Record<string,string>={
 'ncert-2-mridang':'https://ciet.ncert.gov.in/audio-book/116',
 'ncert-2-sarangi':'https://ciet.ncert.gov.in/audio-book/120',
 'ncert-2-joyful-mathematics':'https://ciet.ncert.gov.in/audio-book/121',
 'ncert-2-anandmay-ganit':'https://ciet.ncert.gov.in/audio-book/122',
};
