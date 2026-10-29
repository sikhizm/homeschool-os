import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ncertTextbooks,ncertChapterSlots,textbookById,chaptersFor,textbookAudit,selectTextbooks,validateNcertCatalogue,officialChapterPdf,textbookGrades} from '../src/lib/ncert/textbooks';

test('Class 4 textbook metadata and chapter slots form a valid bounded catalogue',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.equal(ncertTextbooks.length,16);
 assert.equal(ncertChapterSlots.length,49);
 assert.deepEqual(ncertTextbooks.map(x=>x.chapterCount),[14,12,13,10,...Array(12).fill(0)]);
 assert.equal(textbookGrades.length,12);
});
test('chapter slots distinguish publisher-verified titles and unreviewed placeholders',()=>{
 for(const book of ncertTextbooks){
  assert.equal(chaptersFor(book.id).length,book.chapterCount);
  if(book.chapterCount>0){
   assert.equal(chaptersFor(book.id)[0].chapterNumber,1);
   assert.equal(chaptersFor(book.id).at(-1)?.chapterNumber,book.chapterCount);
  }else assert.deepEqual(chaptersFor(book.id),[]);
 }
 for(const slot of ncertChapterSlots){
  assert.equal(slot.status,slot.verifiedTitle?'source-verified':'chapter-title-pending');
  assert.equal(slot.mappingStatus,'unmapped');
  assert.deepEqual(slot.skillIds,[]);
 }
});
test('audit metrics do not manufacture completed chapter review or mappings',()=>{
 assert.deepEqual(textbookAudit(),{books:16,chapterSlots:49,verifiedChapterTitles:49,approvedSkillMappings:0,unreviewedChapterSlots:0,booksPendingContents:12,gradesCovered:[4,5,8]});
});
test('textbook selection is exact and unknown classes are not fabricated',()=>{
 assert.equal(selectTextbooks(4,'English')[0].title,'Santoor');
 assert.equal(selectTextbooks(5).length,7);
 assert.equal(selectTextbooks(8).length,5);
 assert.equal(selectTextbooks(5,'Hindi')[0].textbookCode,'ehve1');
 assert.equal(chaptersFor('ncert-5-veena').length,0);
 assert.ok(ncertChapterSlots.every(c=>c.verifiedTitle&&c.status==='source-verified'));
 assert.deepEqual(ncertChapterSlots.filter(c=>c.mappingStatus==='human-reviewed'),[]);
 assert.equal(selectTextbooks(6).length,0);
 assert.equal(textbookById('not-real'),undefined);
 assert.equal(chaptersFor('../secrets').length,0);
});

test('verified NCERT chapters link to official publisher PDFs',()=>{
 const veena=chaptersFor('ncert-4-veena');
 assert.equal(officialChapterPdf(veena[0]),'https://ncert.nic.in/textbook/pdf/dhve101.pdf');
 assert.equal(officialChapterPdf(veena[12]),'https://ncert.nic.in/textbook/pdf/dhve113.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-4-santoor')[0]),'https://ncert.nic.in/textbook/pdf/desa101.pdf');
 assert.equal(officialChapterPdf(chaptersFor('ncert-4-maths-mela')[0]),'https://ncert.nic.in/textbook/pdf/demm101.pdf');
 assert.ok(ncertChapterSlots.every(ch=>officialChapterPdf(ch)?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 assert.equal(chaptersFor('ncert-5-veena').length,0);
 assert.equal(officialChapterPdf({...veena[0],verifiedTitle:null}),null);
 assert.equal(officialChapterPdf({...veena[0],chapterNumber:99}),null);
 assert.equal(officialChapterPdf({...veena[0],bookId:'unknown'}),null);
});
