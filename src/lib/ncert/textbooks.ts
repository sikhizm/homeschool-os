/**
 * NCERT textbook metadata sourced from NCERT textbook catalog and SCERT Haryana Class 4.
 * No embedded copyrighted textbook contents. Chapter slot labels are NOT confirmed chapter titles.
 * Source snapshots need ongoing revalidation against the current NCERT edition.
 */
export type ReviewStatus='catalogued'|'chapter-title-pending'|'human-reviewed';
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
];
export const ncertChapterSlots:ChapterSlot[]=ncertTextbooks.flatMap(book=>
 Array.from({length:book.chapterCount},(_,index)=>({
  id:`${book.id}-ch-${String(index+1).padStart(2,'0')}`,
  bookId:book.id,chapterNumber:index+1,label:`Chapter ${index+1}`,verifiedTitle:null,
  status:'chapter-title-pending' as const,
  sourceUrl:book.sourceUrl,skillIds:[],mappingStatus:'unmapped' as const
 }))
);
export const textbookGrades=Array.from({length:12},(_,index)=>index+1);
export function selectTextbooks(grade:number,subject=''){return ncertTextbooks.filter(b=>b.grade===grade&&(!subject||b.subject===subject));}
export function chaptersFor(bookId:string){return ncertChapterSlots.filter(c=>c.bookId===bookId);}
export function textbookById(id:string){return ncertTextbooks.find(b=>b.id===id);}
export function textbookAudit(){
 const mapped=ncertChapterSlots.filter(c=>c.mappingStatus==='human-reviewed').length;
 const titles=ncertChapterSlots.filter(c=>c.verifiedTitle&&c.status==='human-reviewed').length;
 return {books:ncertTextbooks.length,chapterSlots:ncertChapterSlots.length,verifiedChapterTitles:titles,approvedSkillMappings:mapped,unreviewedChapterSlots:ncertChapterSlots.length-titles,gradesCovered:[...new Set(ncertTextbooks.map(b=>b.grade))]};
}
export function validateNcertCatalogue(){
 const issues:string[]=[];
 const ids=new Set<string>();const chapters=new Set<string>();
 for(const book of ncertTextbooks){
  if(ids.has(book.id))issues.push('duplicate textbook '+book.id);ids.add(book.id);
  if(book.chapterCount<1||book.chapterCount>60)issues.push('invalid chapter count '+book.id);
  if(!book.sourceUrl.startsWith('https://ncert.nic.in/'))issues.push('non official source '+book.id);
  if(chaptersFor(book.id).length!==book.chapterCount)issues.push('slot count '+book.id);
 }
 for(const c of ncertChapterSlots){
  if(chapters.has(c.id))issues.push('duplicate slot '+c.id);chapters.add(c.id);
  if(!ids.has(c.bookId))issues.push('orphan chapter '+c.id);
  if(c.status==='human-reviewed'&&!c.verifiedTitle)issues.push('missing verified title '+c.id);
  if(c.mappingStatus==='human-reviewed'&&!c.skillIds.length)issues.push('empty reviewed mapping '+c.id);
  if(c.mappingStatus==='unmapped'&&c.skillIds.length)issues.push('unreviewed mapping attached '+c.id);
 }
 return issues;
}
