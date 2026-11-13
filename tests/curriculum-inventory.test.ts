import {test} from 'node:test';
import assert from 'node:assert/strict';
import{ncertTextbooks,ncertChapterSlots,textbookAudit,gradeCoverage,validateNcertCatalogue,selectTextbooks} from '../src/lib/ncert/textbooks';
import{annualGrades,annualSteps} from '../src/lib/curriculum/annual';
import{validateCurriculum} from '../src/lib/curriculum/library';
import{validateGlobalSkills} from '../src/lib/global-curriculum/catalogue';
import{validateLessons,lessons} from '../src/lib/lessons/library';
import{curriculumCoverage} from '../src/lib/global-curriculum/engine';
import{queueCatalogue} from '../src/lib/auto-learning/catalogue';

test('all catalogue validators pass before any completeness claim',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.deepEqual(validateCurriculum(),[]);
 assert.deepEqual(validateGlobalSkills(),[]);
 assert.deepEqual(validateLessons(),[]);
});
test('inventory metrics stay internally consistent across modules',()=>{
 const a=textbookAudit();const c=curriculumCoverage();
 assert.equal(c.textbookRecords,a.books);
 assert.equal(c.chaptersIndexed,a.chapterSlots);
 assert.equal(c.sourceCheckedTitles,a.verifiedChapterTitles);
 assert.equal(a.books,77);
 assert.equal(a.chapterSlots,892);
 assert.equal(a.verifiedChapterTitles,892);
 assert.deepEqual(a.gradesCovered,[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(annualGrades.length,4);
 for(const g of annualGrades) assert.ok(annualSteps(g.key).length>0,g.key);
 // Grow-only floors: raise deliberately as content lands, never lower.
 assert.ok(lessons.length>=20);
});
test('Class 2 NCERT chapters each expose read, practice and understanding-check sessions',()=>{
 const class2=queueCatalogue('Class 2');
 const chapterTasks=class2.filter(task=>task.id.startsWith('ncert:'));
 assert.equal(chapterTasks.length,183);
 assert.equal(new Set(chapterTasks.map(task=>task.id.split(':')[1])).size,61);
 for(const kind of ['read','practice','review']){
  const group=chapterTasks.filter(task=>task.id.endsWith(':'+kind));
  assert.equal(group.length,61,kind);
  assert.ok(group.every(task=>task.lesson&&task.lesson.steps.length===5),kind);
  assert.ok(group.every(task=>task.href.startsWith('/ncert-books/chapter/')),kind);
 }
 assert.ok(chapterTasks.every(task=>task.grade==='Class 2'&&task.officialUrl?.startsWith('https://ncert.nic.in/textbook/pdf/')));
 assert.ok(chapterTasks.filter(task=>task.subject==='Mathematics').every(task=>task.lesson?.objective.includes('mathematical')));
 assert.ok(chapterTasks.filter(task=>task.subject!=='Mathematics').every(task=>task.lesson?.objective.includes('Read')||task.lesson?.objective.includes('Complete')||task.lesson?.objective.includes('Recall')));
});

test('known gaps are explicit so closing them requires updating this contract',()=>{
 // Classes 9–10 are audited in Phase 7; Classes 11–12 remain backlog-only.
 for(const grade of [9,10]) assert.ok(selectTextbooks(grade).length>0,`grade ${grade}`);
 for(const grade of [11,12]) assert.equal(selectTextbooks(grade).length,0,`grade ${grade}`);
 assert.equal(gradeCoverage().find(g=>g.grade===6)?.contentsAudited,10);
 assert.equal(gradeCoverage().find(g=>g.grade===7)?.contentsAudited,12);
 assert.equal(gradeCoverage().find(g=>g.grade===8)?.contentsAudited,11);
 assert.equal(ncertTextbooks.filter(b=>b.chapterCount===0).length,1); // Dilchasp Riyazi (Urdu) awaits a contents audit
 // Class 2 and Class 4 have chapter-level NCERT sessions; other grades retain their own pathways.
 assert.equal(queueCatalogue('Class 2').filter(task=>task.id.startsWith('ncert:')).length,183);
 assert.ok(queueCatalogue('Class 4').length>200);
 const verifiedClass5Chapters=ncertChapterSlots.filter(chapter=>chapter.verifiedTitle&&ncertTextbooks.some(book=>book.id===chapter.bookId&&book.grade===5));
 assert.equal(queueCatalogue('Class 5').filter(task=>task.id.startsWith('ncert:')).length,verifiedClass5Chapters.length*3,'each verified Class 5 chapter exposes read, practice and understanding-check sessions');
 assert.equal(queueCatalogue('Class 8').filter(task=>task.id.startsWith('ncert:')).length,105*3,'Class 8 required chapters and units have three stable sessions; unselected projects stay out of the default path');
 assert.equal(queueCatalogue('Class 9').filter(task=>task.id.startsWith('ncert:')).length,88*3,'required Class 9 slots have three stable sessions; vocational alternatives stay out of the default path');
 assert.equal(queueCatalogue('Class 10').filter(task=>task.id.startsWith('ncert:')).length,60*3,'each audited Class 10 slot has three stable sessions');
 assert.equal(queueCatalogue('Class 11').filter(task=>task.id.startsWith('ncert:')).length,0,'chapter sessions are not generated for unsourced senior-secondary backlog records');
});
