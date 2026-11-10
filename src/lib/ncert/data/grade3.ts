/**
 * NCERT Class 3 catalogue — 2026–27 reprints of the NCF Preparatory Stage series.
 *
 * Provenance (verified 10 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (chve1ps, cesa1ps, cemm1ps, cebu1ps, chbu1ps, ceky1ps, chky1ps) — each names
 *   the book, "Textbook for Class 3", first edition 2024 and Reprint 2026-27.
 * - Chapter titles: the official Contents pages inside those prelims PDFs.
 * - Chapter PDF link pattern: chapter 01 downloaded for chve1 (सीखो) and cesa1;
 *   chapter 17 downloaded for chbu1 (0338CH17) to confirm book-wide numbering.
 * - CIET audio-book directory (ciet.ncert.gov.in/audio-books?class=3) confirms the
 *   seven-book Class 3 list and chapter counts (Bansuri/बांसुरी 20, Khel Yoga/खेल योग 7).
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {Textbook} from '../types';

export const grade3Textbooks:Textbook[]=[
 {
  "id":"ncert-3-veena","grade":3,"subject":"Hindi","title":"Veena","language":"Hindi","publisher":"NCERT","textbookCode":"chve1","chapterCount":18,
  "sourceUrl":"https://ncert.nic.in/textbook.php?chve1=0-18","referenceUrl":"https://ciet.ncert.gov.in/audio-book/124",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-santoor","grade":3,"subject":"English","title":"Santoor","language":"English","publisher":"NCERT","textbookCode":"cesa1","chapterCount":12,
  "sourceUrl":"https://ncert.nic.in/textbook.php?cesa1=0-12","referenceUrl":"https://ciet.ncert.gov.in/audio-book/125",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-maths-mela","grade":3,"subject":"Mathematics","title":"Maths Mela","language":"English","publisher":"NCERT","textbookCode":"cemm1","chapterCount":14,
  "sourceUrl":"https://ncert.nic.in/textbook.php?cemm1=0-14","referenceUrl":"https://ciet.ncert.gov.in/audio-book/126",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-bansuri","grade":3,"subject":"Arts","title":"Bansuri","language":"English","publisher":"NCERT","textbookCode":"cebu1","chapterCount":20,
  "sourceUrl":"https://ncert.nic.in/textbook.php?cebu1=0-20","referenceUrl":"https://ciet.ncert.gov.in/audio-book/162",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-bansuri-hindi","grade":3,"subject":"Arts","title":"बांसुरी","language":"Hindi","publisher":"NCERT","textbookCode":"chbu1","chapterCount":20,
  "sourceUrl":"https://ncert.nic.in/textbook.php?chbu1=0-20","referenceUrl":"https://ciet.ncert.gov.in/audio-book/178",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-khel-yoga","grade":3,"subject":"Physical Education","title":"Khel Yoga","language":"English","publisher":"NCERT","textbookCode":"ceky1","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?ceky1=0-7","referenceUrl":"https://ciet.ncert.gov.in/audio-book/164",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-3-khel-yoga-hindi","grade":3,"subject":"Physical Education","title":"खेल योग","language":"Hindi","publisher":"NCERT","textbookCode":"chky1","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?chky1=0-7","referenceUrl":"https://ciet.ncert.gov.in/audio-book/163",
  "editionLabel":"NCERT 2026–27 reprint; edition and chapter contents checked against official textbook prelims PDF","status":"source-verified-chapter-titles"
 },
];

/** Chapter titles read from the official NCERT prelims Contents pages (numbered lessons only). */
export const grade3ChapterTitles:Record<string,readonly string[]>={
 'ncert-3-veena':[
  'सीखो','चींटी','कितने पैर?','बया हमारी चिड़िया रानी!','आम का पेड़',
  'बीरबल की खिचड़ी','मित्र को पत्र','चतुर गीदड़','प्रकृति पर्व — फूलदेई',
  'रस्साकशी','एक जादुई पिटारा',
  'अपना-अपना काम','पेड़ों की अम्मा ‘तिमक्का’','किसान की होशियारी',
  'भारत','चंद्रयान (संवाद)','बोलने वाली माँद','हम अनेक किंतु एक'
 ],
 'ncert-3-santoor':[
  'Colours','Badal and Moti','Best Friends','Out in the Garden','Talking Toys','Paper Boats',
  'The Big Laddoo','Thank God','Madhu’s Wish','Night','Chanda Mama Counts the Stars','Chandrayaan'
 ],
 'ncert-3-maths-mela':[
  'What’s in a Name?','Toy Joy','Double Century','Vacation with My Nani Maa','Fun with Shapes',
  'House of Hundreds – I','Raksha Bandhan','Fair Share','House of Hundreds – II','Fun at Class Party!',
  'Filling and Lifting','Give and Take','Time Goes On','The Surajkund Fair'
 ],
 'ncert-3-bansuri':[
  'Objects in Art','Plants in Art','Animals in Art','People Around Us','Festivals, Occasions, and Celebrations',
  'Our National Anthem','Feel the Rhythm ta ka ta ki Ta','Travel Around','Musical Instruments','Celebratory Notes',
  'Let us Dance','Dance for Joy','I Play and Dance','Dance with Nature',
  'Explore','Imagine','Let’s Create','Look Around','Activities','Integrating All Art Forms'
 ],
 'ncert-3-bansuri-hindi':[
  'कला एवं वस्तुएँ','कला एवं पेड़-पौधे','कला एवं जीव-जंतु','हमारे आस-पास के लोग','त्यौहार, उत्सव और समारोह',
  'हमारा राष्ट्रगान','लय का अनुभव करें–त क त कि ट','विभिन्न गीत गाएँ','वाद्ययंत्र','उत्सव मनाएँ',
  'आइए, नृत्य करें','आनंद के लिए नृत्य','आइए, नृत्य करते हुए खेलें','प्रकृति के साथ नृत्य',
  'आइए, पता लगाएँ','कल्पना करें','आइए, सृजन करें','आस-पास देखें','गतिविधियाँ','कला-विधाओं का एकीकरण'
 ],
 'ncert-3-khel-yoga':[
  'Throwing and Catching','Kicking and Receiving','Strike the Ball','Little Steps',
  'Local and Traditional Games','Yoga for Daily Life','Yogic Practices (Yoga Sadhana)'
 ],
 'ncert-3-khel-yoga-hindi':[
  'फेंकना व लपकना','किकिंग और रिसीविंग','हिटिंग (गेंद पर प्रहार)','नन्हे कदम',
  'स्थानीय और परंपरागत खेल','दैनिक जीवन के लिए योग','योग का अभ्यास (योग साधना)'
 ],
};

/** Where each Class 3 title list was read (official prelims Contents pages). */
export const grade3ContentSources:Record<string,string>={
 'ncert-3-veena':'https://ncert.nic.in/textbook/pdf/chve1ps.pdf',
 'ncert-3-santoor':'https://ncert.nic.in/textbook/pdf/cesa1ps.pdf',
 'ncert-3-maths-mela':'https://ncert.nic.in/textbook/pdf/cemm1ps.pdf',
 'ncert-3-bansuri':'https://ncert.nic.in/textbook/pdf/cebu1ps.pdf',
 'ncert-3-bansuri-hindi':'https://ncert.nic.in/textbook/pdf/chbu1ps.pdf',
 'ncert-3-khel-yoga':'https://ncert.nic.in/textbook/pdf/ceky1ps.pdf',
 'ncert-3-khel-yoga-hindi':'https://ncert.nic.in/textbook/pdf/chky1ps.pdf',
};
