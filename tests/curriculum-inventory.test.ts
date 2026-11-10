import {test} from 'node:test';
import assert from 'node:assert/strict';
import{ncertTextbooks,textbookAudit,gradeCoverage,validateNcertCatalogue,selectTextbooks} from '../src/lib/ncert/textbooks';
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
 assert.equal(a.books,44);
 assert.equal(a.chapterSlots,559);
 assert.equal(a.verifiedChapterTitles,559);
 assert.deepEqual(a.gradesCovered,[1,2,3,4,5,6,8]);
 assert.equal(annualGrades.length,4);
 for(const g of annualGrades) assert.ok(annualSteps(g.key).length>0,g.key);
 // Grow-only floors: raise deliberately as content lands, never lower.
 assert.ok(lessons.length>=20);
});
test('known gaps are explicit so closing them requires updating this contract',()=>{
 // Grades with zero NCERT book records today (Phases 2 must flip these one by one).
 for(const grade of [7,9,10,11,12]) assert.equal(selectTextbooks(grade).length,0,`grade ${grade}`);
 assert.equal(gradeCoverage().find(g=>g.grade===6)?.contentsAudited,10);
 assert.equal(gradeCoverage().find(g=>g.grade===8)?.contentsAudited,6);
 assert.equal(ncertTextbooks.filter(b=>b.chapterCount===0).length,1); // Dilchasp Riyazi (Urdu) awaits a contents audit
 // Class 4 remains the only fully-integrated auto-learning queue today.
 assert.ok(queueCatalogue('Class 4').length>200);
 assert.ok(queueCatalogue('Class 4').length>queueCatalogue('Class 5').length);
});
