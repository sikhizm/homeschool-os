import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ncertTextbooks,ncertChapterSlots,textbookById,chaptersFor,textbookAudit,selectTextbooks,validateNcertCatalogue,textbookGrades} from '../src/lib/ncert/textbooks';

test('Class 4 textbook metadata and chapter slots form a valid bounded catalogue',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.equal(ncertTextbooks.length,4);
 assert.equal(ncertChapterSlots.length,49);
 assert.deepEqual(ncertTextbooks.map(x=>x.chapterCount),[14,12,13,10]);
 assert.equal(textbookGrades.length,12);
});
test('chapter slots keep separate placeholders and reviewed titles',()=>{
 for(const book of ncertTextbooks){
  assert.equal(chaptersFor(book.id).length,book.chapterCount);
  assert.equal(chaptersFor(book.id)[0].chapterNumber,1);
  assert.equal(chaptersFor(book.id).at(-1)?.chapterNumber,book.chapterCount);
 }
 for(const slot of ncertChapterSlots){
  assert.equal(slot.verifiedTitle,null);
  assert.equal(slot.status,'chapter-title-pending');
  assert.equal(slot.mappingStatus,'unmapped');
  assert.deepEqual(slot.skillIds,[]);
 }
});
test('audit metrics do not manufacture completed chapter review or mappings',()=>{
 assert.deepEqual(textbookAudit(),{books:4,chapterSlots:49,verifiedChapterTitles:0,approvedSkillMappings:0,unreviewedChapterSlots:49,gradesCovered:[4]});
});
test('textbook selection is exact and unknown classes are not fabricated',()=>{
 assert.equal(selectTextbooks(4,'English')[0].title,'Santoor');
 assert.equal(selectTextbooks(5).length,0);
 assert.equal(textbookById('not-real'),undefined);
 assert.equal(chaptersFor('../secrets').length,0);
});
