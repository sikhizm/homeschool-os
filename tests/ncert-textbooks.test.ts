import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ncertTextbooks,ncertChapterSlots,textbookById,chaptersFor,textbookAudit,selectTextbooks,validateNcertCatalogue,officialChapterPdf,textbookGrades,gradeCoverage} from '../src/lib/ncert/textbooks';

test('NCERT catalogue forms a valid bounded index through the audited Class 10 expansion',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.equal(ncertTextbooks.length,77);
 assert.equal(ncertChapterSlots.length,892);
 assert.deepEqual(ncertTextbooks.map(x=>x.chapterCount),[9,19,13,13,18,0,13,26,11,11,18,12,14,20,20,7,7,14,12,13,10,15,10,12,10,19,7,13,16,13,10,12,14,16,14,22,5,6,15,10,8,7,12,12,8,12,14,20,6,6,15,7,7,10,13,13,7,8,6,6,19,8,8,6,13,9,6,12,12,23,13,14,9,9,5,5,5]);
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
 assert.deepEqual(textbookAudit(),{books:77,chapterSlots:892,verifiedChapterTitles:892,approvedSkillMappings:0,unreviewedChapterSlots:0,booksPendingContents:1,gradesCovered:[1,2,3,4,5,6,7,8,9,10]});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===1),{grade:1,cataloguedBooks:6,contentsAudited:5,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===2),{grade:2,cataloguedBooks:4,contentsAudited:4,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===3),{grade:3,cataloguedBooks:7,contentsAudited:7,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===5),{grade:5,cataloguedBooks:7,contentsAudited:7,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===6),{grade:6,cataloguedBooks:10,contentsAudited:10,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===7),{grade:7,cataloguedBooks:12,contentsAudited:12,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===8),{grade:8,cataloguedBooks:11,contentsAudited:11,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===9),{grade:9,cataloguedBooks:9,contentsAudited:9,status:'partial'});
 assert.deepEqual(gradeCoverage().find(x=>x.grade===10),{grade:10,cataloguedBooks:7,contentsAudited:7,status:'partial'});
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
test('Class 2 indexes four current NCERT/CIET books with verified titles and official chapter PDFs',()=>{
 const grade2=selectTextbooks(2);assert.equal(grade2.length,4);
 assert.deepEqual(grade2.map(book=>book.chapterCount),[13,26,11,11]);
 assert.equal(grade2.reduce((sum,book)=>sum+book.chapterCount,0),61);
 for(const book of grade2){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'),book.id);
  assert.ok(chapters.every(ch=>ch.mappingStatus==='unmapped'&&ch.skillIds.length===0),book.id);
  assert.ok(book.editionLabel.includes('2026–27'),book.id);
 }
 assert.equal(chaptersFor('ncert-2-mridang')[0].verifiedTitle,'My Bicycle');
 assert.equal(chaptersFor('ncert-2-mridang').at(-1)?.verifiedTitle,'We are all Indians');
 assert.equal(chaptersFor('ncert-2-sarangi')[0].verifiedTitle,'नीमा की दादी');
 assert.equal(chaptersFor('ncert-2-sarangi').at(-1)?.verifiedTitle,'बादल');
 assert.equal(chaptersFor('ncert-2-joyful-mathematics')[0].verifiedTitle,'A Day at the Beach');
 assert.equal(chaptersFor('ncert-2-anandmay-ganit')[0].verifiedTitle,'समुद्र किनारे एक दिन');
 assert.equal(officialChapterPdf(chaptersFor('ncert-2-mridang')[0]),'https://ncert.nic.in/textbook/pdf/bemr101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-2-sarangi')[0]),'https://ncert.nic.in/textbook/pdf/bhsr101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-2-joyful-mathematics')[0]),'https://ncert.nic.in/textbook/pdf/bejm101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-2-anandmay-ganit')[0]),'https://ncert.nic.in/textbook/pdf/bhjm101.pdf');
});
test('Class 3 indexes seven current NCERT books with prelims-verified titles and chapter PDFs',()=>{
 const grade3=selectTextbooks(3);assert.equal(grade3.length,7);
 assert.deepEqual(grade3.map(book=>book.chapterCount),[18,12,14,20,20,7,7]);
 assert.equal(grade3.reduce((sum,book)=>sum+book.chapterCount,0),98);
 for(const book of grade3){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'),book.id);
  assert.ok(chapters.every(ch=>ch.mappingStatus==='unmapped'&&ch.skillIds.length===0),book.id);
  assert.ok(book.editionLabel.includes('2026–27'),book.id);
 }
 assert.equal(chaptersFor('ncert-3-veena')[0].verifiedTitle,'सीखो');
 assert.equal(chaptersFor('ncert-3-veena').at(-1)?.verifiedTitle,'हम अनेक किंतु एक');
 assert.equal(chaptersFor('ncert-3-santoor')[0].verifiedTitle,'Colours');
 assert.equal(chaptersFor('ncert-3-santoor').at(-1)?.verifiedTitle,'Chandrayaan');
 assert.equal(chaptersFor('ncert-3-maths-mela')[13].verifiedTitle,'The Surajkund Fair');
 assert.equal(chaptersFor('ncert-3-bansuri')[0].verifiedTitle,'Objects in Art');
 assert.equal(chaptersFor('ncert-3-bansuri-hindi')[16].verifiedTitle,'आइए, सृजन करें');
 assert.equal(chaptersFor('ncert-3-khel-yoga').at(-1)?.verifiedTitle,'Yogic Practices (Yoga Sadhana)');
 assert.equal(chaptersFor('ncert-3-khel-yoga-hindi')[5].verifiedTitle,'दैनिक जीवन के लिए योग');
 assert.equal(officialChapterPdf(chaptersFor('ncert-3-veena')[0]),'https://ncert.nic.in/textbook/pdf/chve101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-3-santoor')[0]),'https://ncert.nic.in/textbook/pdf/cesa101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-3-bansuri-hindi')[16]),'https://ncert.nic.in/textbook/pdf/chbu117.pdf');
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
test('Grade 6 indexes ten prelims-verified NCERT books with verified numbered chapter lists',()=>{
 const grade6=selectTextbooks(6);assert.equal(grade6.length,10);
 assert.deepEqual(grade6.map(b=>b.chapterCount),[16,13,10,12,14,16,14,22,5,6]);
 assert.equal(grade6.reduce((sum,book)=>sum+book.chapterCount,0),128);
 for(const book of grade6){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'));
  assert.ok(chapters.every(ch=>officialChapterPdf(ch)?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 }
 assert.equal(chaptersFor('ncert-6-poorvi')[0].verifiedTitle,'A Bottle of Dew');
 assert.equal(chaptersFor('ncert-6-poorvi').at(-1)?.verifiedTitle,'National War Memorial');
 assert.equal(chaptersFor('ncert-6-malhar')[0].verifiedTitle,'मातृभूमि');
 assert.equal(chaptersFor('ncert-6-ganita-prakash')[0].verifiedTitle,'Patterns in Mathematics');
 assert.equal(chaptersFor('ncert-6-curiosity').at(-1)?.verifiedTitle,'Beyond Earth');
 assert.equal(chaptersFor('ncert-6-exploring-society')[0].verifiedTitle,'Locating Places on the Earth');
 assert.equal(chaptersFor('ncert-6-deepakam').at(-1)?.verifiedTitle,'वृक्षाः सत्पुरुषाः इव');
 assert.equal(chaptersFor('ncert-6-khayal').at(-1)?.verifiedTitle,'صحت اور صفائی');
 assert.equal(chaptersFor('ncert-6-kriti').length,22);
 assert.equal(chaptersFor('ncert-6-khel-yatra').at(-1)?.verifiedTitle,'Yoga');
 assert.equal(chaptersFor('ncert-6-kaushal-bodh')[0].verifiedTitle,'School Kitchen Garden');
 assert.equal(officialChapterPdf(chaptersFor('ncert-6-ganita-prakash')[0]),'https://ncert.nic.in/textbook/pdf/fegp101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-6-exploring-society')[1]),'https://ncert.nic.in/textbook/pdf/fees102.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-6-khayal').at(-1)!),'https://ncert.nic.in/textbook/pdf/fuky114.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-6-khel-yatra').at(-1)!),'https://ncert.nic.in/textbook/pdf/feky105.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-6-kaushal-bodh').at(-1)!),'https://ncert.nic.in/textbook/pdf/fekb106.pdf');
});
test('Grade 7 indexes twelve prelims-verified NCERT books with verified numbered chapter lists',()=>{
 const grade7=selectTextbooks(7);assert.equal(grade7.length,12);
 assert.deepEqual(grade7.map(b=>b.chapterCount),[15,10,8,7,12,12,8,12,14,20,6,6]);
 assert.equal(grade7.reduce((sum,book)=>sum+book.chapterCount,0),130);
 for(const book of grade7){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'));
  assert.ok(chapters.every(ch=>officialChapterPdf(ch)?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 }
 assert.equal(chaptersFor('ncert-7-poorvi')[0].verifiedTitle,'The Day the River Spoke');
 assert.equal(chaptersFor('ncert-7-poorvi').at(-1)?.verifiedTitle,'Rani Abbakka');
 assert.equal(chaptersFor('ncert-7-malhar')[0].verifiedTitle,'माँ, कह एक कहानी');
 assert.equal(chaptersFor('ncert-7-ganita-prakash')[0].verifiedTitle,'Large Numbers Around Us');
 assert.equal(chaptersFor('ncert-7-ganita-prakash-2').at(-1)?.verifiedTitle,'Finding the Unknown');
 assert.equal(chaptersFor('ncert-7-curiosity').at(-1)?.verifiedTitle,'Earth, Moon, and the Sun');
 assert.equal(chaptersFor('ncert-7-exploring-society')[0].verifiedTitle,'Geographical Diversity of India');
 assert.equal(chaptersFor('ncert-7-exploring-society-2').at(-1)?.verifiedTitle,'Banks and the Magic of Finance');
 assert.equal(chaptersFor('ncert-7-deepakam')[0].verifiedTitle,'वन्दे भारतमातरम्');
 assert.equal(chaptersFor('ncert-7-khayal')[0].verifiedTitle,'ترانۂ وحدت');
 assert.equal(chaptersFor('ncert-7-khayal').at(-1)?.verifiedTitle,'ڈیجیٹل ٹیکنالوجی');
 assert.equal(chaptersFor('ncert-7-kriti').length,20);
 assert.equal(chaptersFor('ncert-7-khel-yatra').at(-1)?.verifiedTitle,'Yoga');
 assert.equal(chaptersFor('ncert-7-kaushal-bodh')[0].verifiedTitle,'Plant Nursery');
 assert.equal(officialChapterPdf(chaptersFor('ncert-7-ganita-prakash')[0]),'https://ncert.nic.in/textbook/pdf/gegp101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-7-khayal').at(-1)!),'https://ncert.nic.in/textbook/pdf/guky114.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-7-khel-yatra')[0]),'https://ncert.nic.in/textbook/pdf/geky101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-7-kaushal-bodh').at(-1)!),'https://ncert.nic.in/textbook/pdf/gekb106.pdf');
});
test('Class 8 indexes eleven audited NCERT records and preserves each official Contents structure',()=>{
 const grade8=selectTextbooks(8);assert.equal(grade8.length,11);
 assert.deepEqual(grade8.map(b=>b.chapterCount),[15,7,7,10,13,13,7,8,6,6,19]);
 assert.equal(grade8.reduce((sum,book)=>sum+book.chapterCount,0),111);
 for(const book of grade8){
  const chapters=chaptersFor(book.id);assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(ch=>ch.verifiedTitle&&ch.status==='source-verified'));
 }
 const legacy=grade8.filter(book=>!book.directPdfAuditComplete);
 for(const book of legacy){
  const chapters=chaptersFor(book.id);
  // Poorvi chapters 6–15 are the documented exception: NCERT hosts hepr101–105 only.
  assert.ok(chapters.every(ch=>book.id==='ncert-8-poorvi'&&ch.chapterNumber>5
   ?officialChapterPdf(ch)===null
   :officialChapterPdf(ch)?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 }
 const phase7=grade8.filter(book=>book.directPdfAuditComplete);
 assert.deepEqual(phase7.map(book=>book.id),['ncert-8-exploring-society-1','ncert-8-exploring-society-2','ncert-8-kaushal-bodh','ncert-8-khel-yatra','ncert-8-kriti']);
 assert.ok(phase7.every(book=>chaptersFor(book.id).every(ch=>officialChapterPdf(ch)===null)));
 assert.equal(chaptersFor('ncert-8-exploring-society-1')[0].verifiedTitle,'Natural Resources and Their Use');
 assert.equal(chaptersFor('ncert-8-exploring-society-2').at(-1)?.verifiedTitle,'Cultural Currents: 13th to 17th Centuries');
 assert.equal(chaptersFor('ncert-8-kaushal-bodh')[0].label,'Project 1');
 assert.equal(chaptersFor('ncert-8-khel-yatra')[0].label,'Unit 1');
 assert.deepEqual(chaptersFor('ncert-8-khel-yatra').map(chapter=>chapter.verifiedTitle),[
  'Foundations of Physical Education and Well-being','Physical and Motor Fitness','Fundamental Skills of Athletics','Fundamental Skills of Table Tennis','Fundamental Skills of Volleyball','Yoga'
 ]);
 assert.equal(chaptersFor('ncert-8-kriti').at(-1)?.verifiedTitle,'Campaign for Art Awareness');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-curiosity')[0]),'https://ncert.nic.in/textbook/pdf/hecu101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-ganita-prakash-2')[0]),'https://ncert.nic.in/textbook/pdf/hegp201.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-deepakam')[0]),'https://ncert.nic.in/textbook/pdf/hsde101.pdf');
});
test('Classes 9–10 add only the audited official-source records with portal fallback',()=>{
 const grade9=selectTextbooks(9); const grade10=selectTextbooks(10);
 assert.equal(grade9.length,9); assert.equal(grade10.length,7);
 assert.equal(grade9.reduce((total,book)=>total+book.chapterCount,0),97);
 assert.equal(grade10.reduce((total,book)=>total+book.chapterCount,0),60);
 for(const book of [...grade9,...grade10]){
  assert.ok(book.category,book.id); assert.ok(book.provenanceUrl?.startsWith('https://ncert.nic.in/'),book.id);
  assert.equal(book.directPdfAuditComplete,true,book.id);
  const chapters=chaptersFor(book.id);
  assert.equal(chapters.length,book.chapterCount,book.id);
  assert.ok(chapters.every(chapter=>chapter.verifiedTitle&&chapter.status==='source-verified'),book.id);
  assert.ok(chapters.every(chapter=>officialChapterPdf(chapter)===null),`${book.id} must use official portal fallback without individually verified direct PDFs`);
 }
 assert.equal(textbookById('ncert-9-khel-praveen')?.title,'Khel Praveen');
 assert.equal(chaptersFor('ncert-9-understanding-society-1').length,9);
 assert.equal(chaptersFor('ncert-9-understanding-society-2').length,6);
 assert.equal(chaptersFor('ncert-9-kaushal-vikas').length,12);
 assert.deepEqual(chaptersFor('ncert-9-kaushal-vikas').filter(chapter=>chapter.selection==='required').map(chapter=>chapter.chapterNumber),[1,5,9]);
 assert.equal(chaptersFor('ncert-9-kaushal-vikas').filter(chapter=>chapter.selection==='choose-one').length,9);
 assert.equal(chaptersFor('ncert-10-footprints-without-feet').length,9);
 assert.equal(chaptersFor('ncert-10-mathematics').length,14);
 assert.equal(chaptersFor('ncert-10-india-contemporary-world-2').length,5);
});
test('textbook selection remains exact and unknown classes are not fabricated',()=>{
 assert.equal(selectTextbooks(1).length,6);assert.equal(selectTextbooks(2).length,4);assert.equal(selectTextbooks(3).length,7);assert.equal(selectTextbooks(4,'English')[0].title,'Santoor');assert.equal(selectTextbooks(5).length,7);
 assert.equal(selectTextbooks(8).length,11);assert.equal(selectTextbooks(5,'Hindi')[0].textbookCode,'ehve1');
 assert.equal(chaptersFor('ncert-5-veena').length,12);assert.deepEqual(ncertChapterSlots.filter(c=>c.mappingStatus==='human-reviewed'),[]);
 assert.equal(selectTextbooks(6).length,10);assert.equal(selectTextbooks(7).length,12);assert.equal(textbookById('not-real'),undefined);assert.equal(chaptersFor('../secrets').length,0);
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
 assert.equal(officialChapterPdf({...veena4[0],verifiedTitle:null}),null);
 assert.equal(officialChapterPdf({...veena4[0],chapterNumber:99}),null);
 assert.equal(officialChapterPdf({...veena4[0],bookId:'unknown'}),null);
});
test('official PDF links exist only where verified; audited Classes 9–10 use portal fallback',()=>{
 // Pre-Phase-7 records retain their historical verified-link contracts.
 // All Phase 7 records deliberately expose no inferred direct PDFs.
 const without=ncertChapterSlots.filter(ch=>officialChapterPdf(ch)===null);
 assert.ok(without.every(ch=>ch.bookId==='ncert-1-shehnai'
  ||(ch.bookId==='ncert-8-poorvi'&&ch.chapterNumber>5)
  ||Boolean(textbookById(ch.bookId)?.directPdfAuditComplete)),
  'unexpected chapters without an official PDF link: '+without.filter(ch=>!(ch.bookId==='ncert-1-shehnai'||(ch.bookId==='ncert-8-poorvi'&&ch.chapterNumber>5)||Boolean(textbookById(ch.bookId)?.directPdfAuditComplete))).map(ch=>ch.id).join(','));
 assert.ok(ncertChapterSlots.filter(ch=>officialChapterPdf(ch)!==null).every(ch=>officialChapterPdf(ch)!.startsWith('https://ncert.nic.in/textbook/pdf/')));
});
test('Poorvi exposes official PDFs only for chapters confirmed on the NCERT server',()=>{
 const poorvi=chaptersFor('ncert-8-poorvi');
 assert.equal(poorvi.length,15);
 assert.equal(officialChapterPdf(poorvi[0]),'https://ncert.nic.in/textbook/pdf/hepr101.pdf');
 assert.equal(officialChapterPdf(poorvi[4]),'https://ncert.nic.in/textbook/pdf/hepr105.pdf');
 for(let index=5;index<15;index++)assert.equal(officialChapterPdf(poorvi[index]),null,`hepr1 chapter ${index+1} PDF is not hosted yet`);
 // The remaining legacy Class 8 books keep their historical chapter-PDF coverage.
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-deepakam').at(-1)!),'https://ncert.nic.in/textbook/pdf/hsde113.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-curiosity').at(-1)!),'https://ncert.nic.in/textbook/pdf/hecu113.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-ganita-prakash').at(-1)!),'https://ncert.nic.in/textbook/pdf/hegp107.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-ganita-prakash-2').at(-1)!),'https://ncert.nic.in/textbook/pdf/hegp207.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-8-malhar').at(-1)!),'https://ncert.nic.in/textbook/pdf/hhml110.pdf');
});
