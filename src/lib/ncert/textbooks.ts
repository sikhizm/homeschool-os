/**
 * NCERT textbook metadata sourced from NCERT textbook catalog and SCERT Haryana Class 4.
 * No embedded copyrighted textbook contents. Unverified chapter slots remain clearly labelled.
 * Source snapshots need ongoing revalidation against the current NCERT edition.
 */
export type ReviewStatus='catalogued'|'chapter-title-pending'|'source-verified'|'human-reviewed';
export type Textbook={id:string;grade:number;subject:string;title:string;language:string;publisher:'NCERT';textbookCode:string;chapterCount:number;sourceUrl:string;referenceUrl:string;editionLabel:string;status:string};
export type ChapterSlot={id:string;bookId:string;chapterNumber:number;label:string;verifiedTitle:string|null;status:ReviewStatus;sourceUrl:string;skillIds:string[];mappingStatus:'unmapped'|'proposed'|'human-reviewed'};
export const ncertTextbooks:Textbook[]=[
  {
    "id": "ncert-4-maths-mela",
    "grade": 4,
    "subject": "Mathematics",
    "title": "Maths Mela",
    "language": "English",
    "publisher": "NCERT",
    "textbookCode": "demm1",
    "chapterCount": 14,
    "sourceUrl": "https://ncert.nic.in/textbook.php?demm1=0-14",
    "referenceUrl": "https://scertharyana.gov.in/document-category/textbooks-class-4/",
    "editionLabel": "2025 first edition; current reprint to verify",
    "status": "book-confirmed-chapter-titles-pending"
  },
  {
    "id": "ncert-4-santoor",
    "grade": 4,
    "subject": "English",
    "title": "Santoor",
    "language": "English",
    "publisher": "NCERT",
    "textbookCode": "desa1",
    "chapterCount": 12,
    "sourceUrl": "https://ncert.nic.in/textbook.php?desa1=0-12",
    "referenceUrl": "https://scertharyana.gov.in/document-category/textbooks-class-4/",
    "editionLabel": "2025 new series; current edition to verify",
    "status": "book-confirmed-chapter-titles-pending"
  },
  {
    "id": "ncert-4-veena",
    "grade": 4,
    "subject": "Hindi",
    "title": "Veena",
    "language": "Hindi",
    "publisher": "NCERT",
    "textbookCode": "dhve1",
    "chapterCount": 13,
    "sourceUrl": "https://ncert.nic.in/textbook.php?dhve1=0-13",
    "referenceUrl": "https://scertharyana.gov.in/document-category/textbooks-class-4/",
    "editionLabel": "2025 new series; current edition to verify",
    "status": "book-confirmed-chapter-titles-pending"
  },
  {
    "id": "ncert-4-our-wondrous-world",
    "grade": 4,
    "subject": "Environmental Studies",
    "title": "Our Wondrous World",
    "language": "English",
    "publisher": "NCERT",
    "textbookCode": "deev1",
    "chapterCount": 10,
    "sourceUrl": "https://ncert.nic.in/textbook.php?deev1=0-10",
    "referenceUrl": "https://scertharyana.gov.in/document-category/textbooks-class-4/",
    "editionLabel": "2025 new series; current edition to verify",
    "status": "book-confirmed-chapter-titles-pending"
  }
  ,{
    "id":"ncert-5-maths-mela","grade":5,"subject":"Mathematics","title":"Maths Mela","language":"English","publisher":"NCERT","textbookCode":"eemm1","chapterCount":0,"sourceUrl":"https://ncert.nic.in/textbook.php?eemm1=0-15","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"CBSE-listed 2025 primary textbook; edition and contents pending review","status":"book-confirmed-contents-pending"
  },{
    "id":"ncert-5-santoor","grade":5,"subject":"English","title":"Santoor","language":"English","publisher":"NCERT","textbookCode":"eesa1","chapterCount":0,"sourceUrl":"https://ncert.nic.in/textbook.php?eesa1=0-10","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"CBSE-listed 2025 primary textbook; edition and contents pending review","status":"book-confirmed-contents-pending"
  },{
    "id":"ncert-5-veena","grade":5,"subject":"Hindi","title":"Veena","language":"Hindi","publisher":"NCERT","textbookCode":"ehve1","chapterCount":0,"sourceUrl":"https://ncert.nic.in/textbook.php?ehve1=0-12","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"CBSE-listed 2025 primary textbook; edition and contents pending review","status":"book-confirmed-contents-pending"
  },{
    "id":"ncert-5-our-wondrous-world","grade":5,"subject":"Environmental Studies","title":"Our Wondrous World","language":"English","publisher":"NCERT","textbookCode":"eeev1","chapterCount":0,"sourceUrl":"https://ncert.nic.in/textbook.php?eeev1=0-10","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"CBSE-listed 2025 primary textbook; edition and contents pending review","status":"book-confirmed-contents-pending"
  }
];
/** Checked against NCERT Grade 4 2026–27 reprint contents; titles only, not textbook text. */
export const verifiedChapterTitles:Record<string,readonly string[]>={
 'ncert-4-santoor':[
  'Together We Can','The Tinkling Bells','Be Smart, Be Safe',
  'One Thing at a Time','The Old Stag','Braille',
  'Fit Body, Fit Mind, Fit Nation','The Lagori Champions','Hekko',
  'The Swing','A Journey to the Magical Mountains','Maheshwar'
 ],
 'ncert-4-veena':[
  'चिड़िया का गीत','बगीचे का घोंघा','नीम','हमारा आहार','आसमान गिरा',
  'जयपुर से पत्र','नकली हीरे','ओणम के रंग','मिठाइयों का सम्मेलन',
  'कैमरा','कविता का कमाल','शतरंज में मात','हमारा आदित्य'
 ],

 'ncert-4-maths-mela':[
 'Shapes Around Us','Hide and Seek','Pattern Around Us','Thousands Around Us',
 'Sharing and Measuring','Measuring Length','The Cleanest Village','Weigh it, Pour it',
 'Equal Groups','Elephants, Tigers, and Leopards','Fun with Symmetry',
 'Ticking Clocks and Turning Calendar','The Transport Museum','Data Handling'
 ],
 'ncert-4-our-wondrous-world':[
 'Living Together','Exploring Our Neighbourhood','Nature Trail','Growing up with Nature',
 'Food for Health','Happy and Healthy Living','How Things Work','How Things are Made',
 'Different Lands, Different Lives','Our Sky'
 ]
};
export const verifiedContentsSources:Record<string,string>={
 'ncert-4-maths-mela':'https://ncert.nic.in/textbook/pdf/demm1ps.pdf',
 'ncert-4-santoor':'https://ncert.nic.in/textbook/pdf/desa1ps.pdf',
 'ncert-4-veena':'https://ncert.nic.in/textbook/pdf/dhve1ps.pdf',
 'ncert-4-our-wondrous-world':'https://ncert.nic.in/textbook/pdf/deev1ps.pdf'
};

export const ncertChapterSlots:ChapterSlot[]=ncertTextbooks.flatMap(book=>
 Array.from({length:book.chapterCount},(_,index)=>({
  id:`${book.id}-ch-${String(index+1).padStart(2,'0')}`,
  bookId:book.id,chapterNumber:index+1,label:`Chapter ${index+1}`,verifiedTitle:verifiedChapterTitles[book.id]?.[index]??null,
  status:verifiedChapterTitles[book.id]?.[index]?'source-verified' as const:'chapter-title-pending' as const,
  sourceUrl:verifiedContentsSources[book.id]??book.sourceUrl,skillIds:[],mappingStatus:'unmapped' as const
 }))
);
export const textbookGrades=Array.from({length:12},(_,index)=>index+1);
export function selectTextbooks(grade:number,subject=''){return ncertTextbooks.filter(b=>b.grade===grade&&(!subject||b.subject===subject));}
export function chaptersFor(bookId:string){return ncertChapterSlots.filter(c=>c.bookId===bookId);}
export function textbookById(id:string){return ncertTextbooks.find(b=>b.id===id);}
export function textbookAudit(){
 const mapped=ncertChapterSlots.filter(c=>c.mappingStatus==='human-reviewed').length;
 const titles=ncertChapterSlots.filter(c=>c.verifiedTitle&&(c.status==='source-verified'||c.status==='human-reviewed')).length;
 return {books:ncertTextbooks.length,chapterSlots:ncertChapterSlots.length,verifiedChapterTitles:titles,approvedSkillMappings:mapped,unreviewedChapterSlots:ncertChapterSlots.length-titles,booksPendingContents:ncertTextbooks.filter(b=>b.chapterCount===0).length,gradesCovered:[...new Set(ncertTextbooks.map(b=>b.grade))]};
}
export function validateNcertCatalogue(){
 const issues:string[]=[];
 const ids=new Set<string>();const chapters=new Set<string>();
 for(const book of ncertTextbooks){
  if(ids.has(book.id))issues.push('duplicate textbook '+book.id);ids.add(book.id);
  if(book.chapterCount<0||book.chapterCount>60||(book.grade===4&&book.chapterCount===0))issues.push('invalid chapter count '+book.id);
  if(book.chapterCount===0&&book.status!=='book-confirmed-contents-pending')issues.push('unexplained missing contents '+book.id);
  if(!book.sourceUrl.startsWith('https://ncert.nic.in/'))issues.push('non official source '+book.id);
  if(verifiedChapterTitles[book.id]&&verifiedChapterTitles[book.id].length!==book.chapterCount)issues.push('contents count '+book.id);
  if(chaptersFor(book.id).length!==book.chapterCount)issues.push('slot count '+book.id);
 }
 for(const c of ncertChapterSlots){
  if(chapters.has(c.id))issues.push('duplicate slot '+c.id);chapters.add(c.id);
  if(!ids.has(c.bookId))issues.push('orphan chapter '+c.id);
  if((c.status==='human-reviewed'||c.status==='source-verified')&&!c.verifiedTitle)issues.push('missing verified title '+c.id);
  if(c.mappingStatus==='human-reviewed'&&!c.skillIds.length)issues.push('empty reviewed mapping '+c.id);
  if(c.mappingStatus==='unmapped'&&c.skillIds.length)issues.push('unreviewed mapping attached '+c.id);
 }
 return issues;
}
