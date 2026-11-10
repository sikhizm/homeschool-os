/**
 * NCERT textbook metadata sourced from official NCERT publication, textbook and CIET catalogues.
 * No embedded copyrighted textbook contents. Unverified chapter slots remain clearly labelled.
 * Source snapshots need ongoing revalidation against the current NCERT edition.
 */
import type{ChapterSlot,ReviewStatus,Textbook} from './types';
import{grade2ChapterTitles,grade2ContentSources,grade2Textbooks} from './data/grade2';
import{grade3ChapterTitles,grade3ContentSources,grade3Textbooks} from './data/grade3';
import{grade8ChapterTitles,grade8ContentSources,grade8Textbooks} from './data/grade8';
import{grade6ChapterTitles,grade6ContentSources,grade6Textbooks} from './data/grade6';
export type{ChapterSlot,ReviewStatus,Textbook};
export const ncertTextbooks:Textbook[]=[
  {
    "id":"ncert-1-mridang","grade":1,"subject":"English","title":"Mridang","language":"English","publisher":"NCERT","textbookCode":"aemr1","chapterCount":9,
    "sourceUrl":"https://ncert.nic.in/textbook.php?aemr1=0-9","referenceUrl":"https://ciet.ncert.gov.in/audio-book/115",
    "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
  },
  {
    "id":"ncert-1-sarangi","grade":1,"subject":"Hindi","title":"Sarangi","language":"Hindi","publisher":"NCERT","textbookCode":"ahsr1","chapterCount":19,
    "sourceUrl":"https://ncert.nic.in/textbook.php?ahsr1=0-19","referenceUrl":"https://ciet.ncert.gov.in/audio-book/117",
    "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
  },
  {
    "id":"ncert-1-joyful-mathematics","grade":1,"subject":"Mathematics","title":"Joyful Mathematics","language":"English","publisher":"NCERT","textbookCode":"aejm1","chapterCount":13,
    "sourceUrl":"https://ncert.nic.in/textbook.php?aejm1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/118",
    "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
  },
  {
    "id":"ncert-1-anandmay-ganit","grade":1,"subject":"Mathematics","title":"Anandmay Ganit","language":"Hindi","publisher":"NCERT","textbookCode":"ahjm1","chapterCount":13,
    "sourceUrl":"https://ncert.nic.in/textbook.php?ahjm1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/119",
    "editionLabel":"NCERT 2026–27 reprint; edition checked against official textbook prelims; chapter titles checked against the CIET NCERT audio-book index","status":"source-verified-chapter-titles"
  },
  {
    "id":"ncert-1-shehnai","grade":1,"subject":"Urdu","title":"Shehnai","language":"Urdu","publisher":"NCERT","textbookCode":"4108","chapterCount":18,
    "sourceUrl":"https://ncert.nic.in/textbook.php?aush1=0-18","referenceUrl":"https://ciet.ncert.gov.in/audio-book/123",
    "editionLabel":"NCERT/CIET Class 1 Urdu title and 18 lessons verified; current 2026–27 print reprint not independently confirmed; direct chapter-PDF pattern not verified","status":"source-verified-chapter-titles"
  },
  {
    "id":"ncert-1-dilchasp-riyazi","grade":1,"subject":"Mathematics","title":"Dilchasp Riyazi","language":"Urdu","publisher":"NCERT","textbookCode":"4109","chapterCount":0,
    "sourceUrl":"https://ncert.nic.in/textbook.php","referenceUrl":"https://ncert.nic.in/division/pd/pdf/list_of_publication.pdf",
    "editionLabel":"Listed in NCERT Urdu textbook catalogue for Class I (publication code 4109); digital chapter contents and current edition not verified","status":"book-confirmed-contents-pending"
  },
  ...grade2Textbooks,
  ...grade3Textbooks,
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
    "id":"ncert-5-maths-mela","grade":5,"subject":"Mathematics","title":"Maths Mela","language":"English","publisher":"NCERT","textbookCode":"eemm1","chapterCount":15,"sourceUrl":"https://ncert.nic.in/textbook.php?eemm1=0-15","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"
  },{
    "id":"ncert-5-santoor","grade":5,"subject":"English","title":"Santoor","language":"English","publisher":"NCERT","textbookCode":"eesa1","chapterCount":10,"sourceUrl":"https://ncert.nic.in/textbook.php?eesa1=0-10","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"
  },{
    "id":"ncert-5-veena","grade":5,"subject":"Hindi","title":"Veena","language":"Hindi","publisher":"NCERT","textbookCode":"ehve1","chapterCount":12,"sourceUrl":"https://ncert.nic.in/textbook.php?ehve1=0-12","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"
  },{
    "id":"ncert-5-our-wondrous-world","grade":5,"subject":"Environmental Studies","title":"Our Wondrous World","language":"English","publisher":"NCERT","textbookCode":"eeev1","chapterCount":10,"sourceUrl":"https://ncert.nic.in/textbook.php?eeev1=0-10","referenceUrl":"https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"
  },
{"id":"ncert-5-bansuri","grade":5,"subject":"Arts","title":"Bansuri","language":"English","textbookCode":"eebu1","sourceUrl":"https://ncert.nic.in/textbook.php?eebu1=0-19","publisher":"NCERT","chapterCount":19,"referenceUrl":"https://www.cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"},
{"id":"ncert-5-khel-yoga","grade":5,"subject":"Physical Education","title":"Khel Yoga","language":"English","textbookCode":"eeky1","sourceUrl":"https://ncert.nic.in/textbook.php?eeky1=0-3","publisher":"NCERT","chapterCount":7,"referenceUrl":"https://www.cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT 2026–27 reprint; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"},
{"id":"ncert-5-sitaan","grade":5,"subject":"Urdu","title":"Sitaar","language":"Urdu","textbookCode":"eust1","sourceUrl":"https://ncert.nic.in/textbook.php?eust1=0-14","publisher":"NCERT","chapterCount":13,"referenceUrl":"https://www.cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf","editionLabel":"NCERT first edition, June 2025; chapter titles checked against official publisher contents","status":"source-verified-chapter-titles"},
...grade6Textbooks,
...grade8Textbooks
];
/** Checked against NCERT Grade 4 2026–27 reprint contents; titles only, not textbook text. */
export const verifiedChapterTitles:Record<string,readonly string[]>={
 ...grade2ChapterTitles,
 ...grade3ChapterTitles,
 ...grade6ChapterTitles,
 ...grade8ChapterTitles,
 'ncert-1-mridang':[
  'Two Little Hands','Greetings','Picture Time','The Cap Seller and the Monkeys','A Farm',
  'Fun with Pictures','The Food We Eat','The Four Seasons',"Anandi's Rainbow"
 ],
 'ncert-1-sarangi':[
  'Meena Ka Parivar','Dada-Dadi','Reena Ka Din','Rani Bhi','Mithai','Teen Saathi',
  'Waah Mere Ghode','Khatre Mein Saanp','Aaloo Ki Sadak','Jhulam Jhuli','Bhutte',
  'Phooli Roti','Mela','Barkha Aur Megha','Holi','Janamdiwas Par Ped Lagao',
  'Hawa','Kitni Pyari Hai Ye Duniya','Chaand Ka Baccha'
 ],
 'ncert-1-joyful-mathematics':[
  'Finding the Furry Cat!','What is Long?','Mango Treat','Making 10','How Many?',
  'Vegetable Farm',"Lina's Family",'Fun with Numbers','Utsav','How do I Spend my Day?',
  'How Many Times?','How Much Can We Spend?','So Many Toys'
 ],
 'ncert-1-anandmay-ganit':[
  'Meri Pyari Billi Dhundho','Kya hai lamba? kya hai gol?','Swadisht aam','10 bnayein',
  'Kitne?','Sabziyon ki kheti','Lina ka parivar','Fun with Numbers','Utsav',
  'Meri Din Charya','Kitni baar?','Hum kitna kharcha kar sakte hain?',
  'Khiloune hi khiloune aur Paheliyan'
 ],
 'ncert-1-shehnai':[
  'Barish aur Paraathe','Chand mein Pariyan rehti hain','Do Dost','Aao Padhein Hum',
  'Chalo School Chalein','Baag ki Sair','Shehzada Sohan','Sardi ki Dopahar',
  'Chand ka Baccha','Meri Billi','Huruf-e-Tahaji','Jada Aya','Sher aur Macchar',
  'Aam','Ginati ka Geet','Phooli Roti','Pyari Titali','Achhi Chidiya'
 ],
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
 ],
 'ncert-5-santoor':[
  'Papa’s Spectacles','Gone with the Scooter','The Rainbow','The Wise Parrot',
  'The Frog','What a Tank!','Gilli Danda','The Decision of the Panchayat',
  'Vocation','Glass Bangles'
 ],
 'ncert-5-maths-mela':[
  'We the Travellers—I','Fractions','Angles as Turns','We the Travellers—II',
  'Far and Near','The Dairy Farm','Shapes and Patterns','Weight and Capacity',
  'Coconut Farm','Symmetrical Designs','Grandmother’s Quilt','Racing Seconds',
  'Animal Jumps','Maps and Locations','Data Through Pictures'
 ],
 'ncert-5-veena':[
  'किरन','न्याय की कुर्सी','चाँद का कुरता','साङकेन','सुंदरिया','चतुर चित्रकार',
  'मेरा बचपन','काजीरंगा राष्ट्रीय उद्यान की यात्रा','न्याय','तीन मछलियाँ',
  'हमारे ये कलामंदिर','गंगा की कहानी'
 ],
 'ncert-5-our-wondrous-world':[
  'Water—The Essence of Life','Journey of a River','The Mystery of Food',
  'Our School—A Happy Place','Our Vibrant Country','Some Unique Places',
  'Energy—How Things Work','Clothes—How Things are Made','Rhythms of Nature',
  'Earth—Our Shared Home'
 ],
 'ncert-5-bansuri':[
  'Objects on the Move','Peeping Out of the Window','Picturing Stories','Imaginary Beings',
  'Spreading the Message','Create a Scene','Stitch it for a Story','Time, Team, Technique',
  'View and Review','Sing and Play','Music Around Me','Sounds and Instruments',
  'Building Blocks','Ideas and Inspiration','My Everyday Activities in Modes of Dance',
  'Dancing with Rhythm and Tempos','Dances of My Nation',
  'My Dance Expresses Emotions and Narrates Stories','My Dance and Your Dance'
 ],
 'ncert-5-khel-yoga':[
  'Throwing and Catching','Kicking and Receiving','Strike the Object','Little Steps',
  'Local and Traditional Games','Yoga for Daily Life','Yoga Sadhana'
 ],
 'ncert-5-sitaan':[
  'خدا کی قدرت','تالاب کا بھوت','گرو نانک','راہ نما بن جاؤں','چچا چھکن کی عینک',
  'ڈبکی','شہد کی مکھی','چار دوست','ڈیجیٹل دادی','گنگا','ٹیولپ گارڈن',
  'چار سکے','چلیے سنبھل سنبھل کر'
 ]
};
export const verifiedContentsSources:Record<string,string>={
 ...grade2ContentSources,
 ...grade3ContentSources,
 ...grade6ContentSources,
 ...grade8ContentSources,
 'ncert-4-maths-mela':'https://ncert.nic.in/textbook/pdf/demm1ps.pdf',
 'ncert-4-santoor':'https://ncert.nic.in/textbook/pdf/desa1ps.pdf',
 'ncert-4-veena':'https://ncert.nic.in/textbook/pdf/dhve1ps.pdf',
 'ncert-4-our-wondrous-world':'https://ncert.nic.in/textbook/pdf/deev1ps.pdf',
 'ncert-5-maths-mela':'https://ncert.nic.in/textbook/pdf/eemm1ps.pdf',
 'ncert-5-santoor':'https://ncert.nic.in/textbook/pdf/eesa1ps.pdf',
 'ncert-5-veena':'https://ncert.nic.in/textbook/pdf/ehve1ps.pdf',
 'ncert-5-our-wondrous-world':'https://ncert.nic.in/textbook/pdf/eeev1ps.pdf',
 'ncert-5-bansuri':'https://ncert.nic.in/textbook/pdf/eebu1ps.pdf',
 'ncert-5-khel-yoga':'https://ncert.nic.in/textbook/pdf/eeky1ps.pdf',
 'ncert-5-sitaan':'https://ncert.nic.in/textbook/pdf/eust1ps.pdf',
 'ncert-1-mridang':'https://ciet.ncert.gov.in/audio-book/115',
 'ncert-1-sarangi':'https://ciet.ncert.gov.in/audio-book/117',
 'ncert-1-joyful-mathematics':'https://ciet.ncert.gov.in/audio-book/118',
 'ncert-1-anandmay-ganit':'https://ciet.ncert.gov.in/audio-book/119',
 'ncert-1-shehnai':'https://ciet.ncert.gov.in/audio-book/123'
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
export function gradeCoverage(){
 return textbookGrades.map(grade=>({
   grade,
   cataloguedBooks:ncertTextbooks.filter(book=>book.grade===grade).length,
   contentsAudited:ncertTextbooks.filter(book=>book.grade===grade&&book.chapterCount>0).length,
   status:(ncertTextbooks.some(book=>book.grade===grade) ? 'partial' : 'not-catalogued') as 'partial'|'not-catalogued'
 }));
}
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

/**
 * Official NCERT chapter PDF URL for source-checked chapter records only.
 * NCERT's publisher uses {textbookCode}{two-digit chapter}.pdf for these series.
 * Do not invent chapter links for books whose contents have not been verified.
 */
export function officialChapterPdf(chapter:ChapterSlot):string|null {
 const book=textbookById(chapter.bookId);
 if(!book||book.chapterCount<1||!chapter.verifiedTitle||chapter.status==='chapter-title-pending')return null;
 if(!/^[a-z]{4}[1-9]$/.test(book.textbookCode))return null;
 if(!Number.isInteger(chapter.chapterNumber)||chapter.chapterNumber<1||chapter.chapterNumber>book.chapterCount)return null;
 return `https://ncert.nic.in/textbook/pdf/${book.textbookCode}${String(chapter.chapterNumber).padStart(2,'0')}.pdf`;
}
