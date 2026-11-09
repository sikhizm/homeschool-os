import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ncertTextbooks,ncertChapterSlots,textbookById,chaptersFor,textbookAudit,selectTextbooks,validateNcertCatalogue,officialChapterPdf,textbookGrades,gradeCoverage} from '../src/lib/ncert/textbooks';

test('Class 4 and Class 5 publisher catalogues form a valid bounded index',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.equal(ncertTextbooks.length,22);
 assert.equal(ncertChapterSlots.length,207);
 assert.deepEqual(ncertTextbooks.map(x=>x.chapterCount),[9,19,13,13,18,0,14,12,13,10,15,10,12,10,19,7,13,...Array(5).fill(0)]);
 assert.equal(textbookGrades.length,12);
});
test('chapter slots distinguish verified titles from books still awaiting contents',()=>{
 for(const book of ncertTextbooks){
  assert.equal(chaptersFor(book.id).length,book.chapterCount);
  if(book.chapterCount>0){assert.equal(chaptersFor(book.id)[0].chapterNumber,1);assert.equal(chaptersFor(book.id).at(-1)?.chapterNumber,book.chapterCount);}
  else assert.deepEqual(chaptersFor(book.id),[]);
 }
 for(const slot of ncertChapterSlots){
  assert.equal(slot.status,'source-verified');assert.ok(slot.verifiedTitle);
  assert.equal(slot.mappingStatus,'unmapped');assert.deepEqual(slot.skillIds,[]);
 }
});
test('audit metrics count only verified numbered titles and never manufacture mappings',()=>{
 assert.deepEqual(textbookAudit(),{books:22,chapterSlots:207,verifiedChapterTitles:207,approvedSkillMappings:0,unreviewedChapterSlots:0,booksPendingContents:6,gradesCovered:[1,4,5,8]});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===1),{grade:1,cataloguedBooks:6,contentsAudited:5,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===5),{grade:5,cataloguedBooks:7,contentsAudited:7,status:'partial'});
});
test('Class 1 indexes five current NCERT/CIET books and preserves the Urdu catalogue-only title',()=>{
 const grade1=selectTextbooks(1);assert.equal(grade1.length,6);
 assert.deepEqual(grade1.map(book=>book.chapterCount),[9,19,13,13,18,0]);
 assert.equal(grade1.reduce((sum,book)=>sum+book.chapterCount,0),72);
 for(const book of grade1.filter(x=>x.chapterCount>0)){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'),book.id);
  assert.ok(chapters.every(ch=>ch.mappingStatus==='unmapped'&&ch.skillIds.length===0),book.id);
 }
 assert.equal(textbookById('ncert-1-dilchasp-riyazi')?.status,'book-confirmed-contents-pending');
 assert.deepEqual(chaptersFor('ncert-1-dilchasp-riyazi'),[]);
 assert.equal(chaptersFor('ncert-1-mridang')[0].verifiedTitle,'Two Little Hands');
 assert.equal(chaptersFor('ncert-1-sarangi').at(-1)?.verifiedTitle,'Chaand Ka Baccha');
 assert.equal(chaptersFor('ncert-1-joyful-mathematics').at(-1)?.verifiedTitle,'So Many Toys');
 assert.equal(chaptersFor('ncert-1-anandmay-ganit')[0].verifiedTitle,'Meri Pyari Billi Dhundho');
 assert.equal(chaptersFor('ncert-1-shehnai').at(-1)?.verifiedTitle,'Achhi Chidiya');
});
test('Grade 5 contains seven source-identified NCERT books with verified numbered chapter lists',()=>{
 const grade5=selectTextbooks(5);assert.equal(grade5.length,7);
 assert.deepEqual(grade5.map(book=>book.chapterCount),[15,10,12,10,19,7,13]);
 assert.equal(grade5.reduce((sum,book)=>sum+book.chapterCount,0),86);
 for(const book of grade5){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'),book.id);
  if(book.id==='ncert-5-sitaan') assert.ok(book.editionLabel.includes('June 2025'),book.id);
  else assert.ok(book.editionLabel.includes('2026–27'),book.id);
 }
 assert.equal(chaptersFor('ncert-5-veena')[0].verifiedTitle,'किरन');
 assert.equal(textbookById('ncert-5-sitaan')?.title,'Sitaar');
 assert.equal(chaptersFor('ncert-5-sitaan')[0].verifiedTitle,'خدا کی قدرت');
 assert.equal(chaptersFor('ncert-5-bansuri').at(-1)?.verifiedTitle,'My Dance and Your Dance');
});
test('textbook selection remains exact and unknown classes are not fabricated',()=>{
 assert.equal(selectTextbooks(1).length,6);assert.equal(selectTextbooks(4,'English')[0].title,'Santoor');assert.equal(selectTextbooks(5).length,7);
 assert.equal(selectTextbooks(8).length,5);assert.equal(selectTextbooks(5,'Hindi')[0].textbookCode,'ehve1');
 assert.equal(chaptersFor('ncert-5-veena').length,12);assert.deepEqual(ncertChapterSlots.filter(c=>c.mappingStatus==='human-reviewed'),[]);
 assert.equal(selectTextbooks(6).length,0);assert.equal(textbookById('not-real'),undefined);assert.equal(chaptersFor('../secrets').length,0);
});
test('verified Grade 4 and Grade 5 chapters generate official NCERT chapter PDF links',()=>{
 const veena4=chaptersFor('ncert-4-veena');
 assert.equal(officialChapterPdf(veena4[0]),'https://ncert.nic.in/textbook/pdf/dhve101.pdf');
 assert.equal(officialChapterPdf(veena4[12]),'https://ncert.nic.in/textbook/pdf/dhve113.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-4-santoor')[0]),'https://ncert.nic.in/textbook/pdf/desa101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-4-maths-mela')[0]),'https://ncert.nic.in/textbook/pdf/demm101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-santoor')[0]),'https://ncert.nic.in/textbook/pdf/eesa101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-maths-mela').at(-1)!), 'https://ncert.nic.in/textbook/pdf/eemm115.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-veena').at(-1)!), 'https://ncert.nic.in/textbook/pdf/ehve112.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-our-wondrous-world').at(-1)!), 'https://ncert.nic.in/textbook/pdf/eeev110.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-bansuri').at(-1)!), 'https://ncert.nic.in/textbook/pdf/eebu119.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-khel-yoga').at(-1)!), 'https://ncert.nic.in/textbook/pdf/eeky107.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-5-sitaan').at(-1)!), 'https://ncert.nic.in/textbook/pdf/eust113.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-1-mridang')[0]),'https://ncert.nic.in/textbook/pdf/aemr101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-1-sarangi')[0]),'https://ncert.nic.in/textbook/pdf/ahsr101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-1-joyful-mathematics')[0]),'https://ncert.nic.in/textbook/pdf/aejm101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-1-anandmay-ganit')[0]),'https://ncert.nic.in/textbook/pdf/ahjm101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-1-shehnai')[0]),null,'Do not guess a direct Urdu chapter PDF path');
 assert.ok(ncertChapterSlots.filter(ch=>ch.bookId!=='ncert-1-shehnai').every(ch=>officialChapterPdf(ch)?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 assert.equal(officialChapterPdf({...veena4[0],verifiedTitle:null}),null);
 assert.equal(officialChapterPdf({...veena4[0],chapterNumber:99}),null);
 assert.equal(officialChapterPdf({...veena4[0],bookId:'unknown'}),null);
});
