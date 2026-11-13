/**
 * NCERT Class 10 catalogue added in Phase 7 (audited 13 Nov 2026).
 *
 * All titles/counts are from official Contents pages or, for books whose
 * Contents were not fully extracted earlier, a successfully retrieved official
 * prelims Contents page. Direct chapter PDFs are intentionally not inferred
 * from the textbook codes: use the official portal fallback until individual
 * chapter URLs are checked and entered as explicit references.
 */
import type {Textbook} from '../types';

export const grade10Textbooks:Textbook[]=[
 {
  id:'ncert-10-science',grade:10,subject:'Science',title:'Science',language:'English',publisher:'NCERT',textbookCode:'jesc1',chapterCount:13,
  sourceUrl:'https://ncert.nic.in/textbook.php?jesc1=0-13',referenceUrl:'https://ncert.nic.in/textbook/pdf/jesc1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jesc1ps.pdf',
  editionLabel:'NCERT revised edition October 2022; reprint January 2026 (1064, ISBN 81-7450-636-5); 13 numbered Contents chapters.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 },
 {
  id:'ncert-10-mathematics',grade:10,subject:'Mathematics',title:'Mathematics',language:'English',publisher:'NCERT',textbookCode:'jemh1',chapterCount:14,
  sourceUrl:'https://ncert.nic.in/textbook.php?jemh1=0-14',referenceUrl:'https://ncert.nic.in/textbook/pdf/jemh1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jemh1ps.pdf',
  editionLabel:'NCERT revised edition October 2022; reprint December 2025 (1062, ISBN 81-7450-634-9); 14 numbered chapters. Two mathematical appendices and answers are back matter, not chapter slots.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 },
 {
  id:'ncert-10-first-flight',grade:10,subject:'English',title:'First Flight',language:'English',publisher:'NCERT',textbookCode:'jeff1',chapterCount:9,
  sourceUrl:'https://ncert.nic.in/textbook.php?jeff1=0-9',referenceUrl:'https://ncert.nic.in/textbook/pdf/jeff1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jeff1ps.pdf',
  editionLabel:'NCERT Class X English main reader; nine numbered Contents headings. Poems and component readings remain associated reading, not duplicated chapter slots. Current edition metadata was not independently captured in Phase 7.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'language'
 },
 {
  id:'ncert-10-footprints-without-feet',grade:10,subject:'English',title:'Footprints without Feet',language:'English',publisher:'NCERT',textbookCode:'jefp1',chapterCount:9,
  sourceUrl:'https://ncert.nic.in/textbook.php?jefp1=0-9',referenceUrl:'https://ncert.nic.in/textbook/pdf/jefp1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jefp1ps.pdf',
  editionLabel:'NCERT revised edition December 2022; reprint October 2025; the official Contents lists nine numbered pieces.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'supplementary'
 },
 {
  id:'ncert-10-understanding-economic-development',grade:10,subject:'Social Science',title:'Understanding Economic Development',language:'English',publisher:'NCERT',textbookCode:'jess2',chapterCount:5,
  sourceUrl:'https://ncert.nic.in/textbook.php?jess2=0-5',referenceUrl:'https://ncert.nic.in/textbook/pdf/jess2ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jess2ps.pdf',
  editionLabel:'NCERT first edition December 2006; reprint January 2026 (1070, ISBN 81-7450-655-1); official Contents has five numbered chapters.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 },
 {
  id:'ncert-10-india-contemporary-world-2',grade:10,subject:'Social Science',title:'India and the Contemporary World-II',language:'English',publisher:'NCERT',textbookCode:'jess3',chapterCount:5,
  sourceUrl:'https://ncert.nic.in/textbook.php?jess3=0-5',referenceUrl:'https://ncert.nic.in/textbook/pdf/jess3ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jess3ps.pdf',
  editionLabel:'NCERT first edition March 2007; reprint January 2026 (1066, ISBN 81-7450-707-8); five core numbered chapters. Three QR-only extended-learning chapters are explicitly not ordinary chapter slots.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 },
 {
  id:'ncert-10-democratic-politics-2',grade:10,subject:'Social Science',title:'Democratic Politics-II',language:'English',publisher:'NCERT',textbookCode:'jess4',chapterCount:5,
  sourceUrl:'https://ncert.nic.in/textbook.php?jess4=0-5',referenceUrl:'https://ncert.nic.in/textbook/pdf/jess4ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/jess4ps.pdf',
  editionLabel:'NCERT revised edition May/December 2022; reprint December 2025 (1072); five numbered Contents chapters.',status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 }
];

export const grade10ChapterTitles:Record<string,readonly string[]>={
 'ncert-10-science':[
  'Chemical Reactions and Equations','Acids, Bases and Salts','Metals and Non-metals','Carbon and its Compounds','Life Processes','Control and Coordination','How do Organisms Reproduce?','Heredity','Light – Reflection and Refraction','The Human Eye and the Colourful World','Electricity','Magnetic Effects of Electric Current','Our Environment'
 ],
 'ncert-10-mathematics':[
  'Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability'
 ],
 'ncert-10-first-flight':[
  'A Letter to God','Nelson Mandela: Long Walk to Freedom','Two Stories about Flying','From the Diary of Anne Frank','Glimpses of India','Mijbil the Otter','Madam Rides the Bus','The Sermon at Benares','The Proposal'
 ],
 'ncert-10-footprints-without-feet':[
  'A Triumph of Surgery','The Thief’s Story','The Midnight Visitor','A Question of Trust','Footprints without Feet','The Making of a Scientist','The Necklace','Bholi','The Book That Saved the Earth'
 ],
 'ncert-10-understanding-economic-development':[
  'Development','Sectors of the Indian Economy','Money and Credit','Globalisation and the Indian Economy','Consumer Rights'
 ],
 'ncert-10-india-contemporary-world-2':[
  'The Rise of Nationalism in Europe','Nationalism in India','The Making of a Global World','The Age of Industrialisation','Print Culture and the Modern World'
 ],
 'ncert-10-democratic-politics-2':[
  'Power-sharing','Federalism','Gender, Religion and Caste','Political Parties','Outcomes of Democracy'
 ]
};

export const grade10ContentSources:Record<string,string>={
 'ncert-10-science':'https://ncert.nic.in/textbook/pdf/jesc1ps.pdf',
 'ncert-10-mathematics':'https://ncert.nic.in/textbook/pdf/jemh1ps.pdf',
 'ncert-10-first-flight':'https://ncert.nic.in/textbook/pdf/jeff1ps.pdf',
 'ncert-10-footprints-without-feet':'https://ncert.nic.in/textbook/pdf/jefp1ps.pdf',
 'ncert-10-understanding-economic-development':'https://ncert.nic.in/textbook/pdf/jess2ps.pdf',
 'ncert-10-india-contemporary-world-2':'https://ncert.nic.in/textbook/pdf/jess3ps.pdf',
 'ncert-10-democratic-politics-2':'https://ncert.nic.in/textbook/pdf/jess4ps.pdf'
};
