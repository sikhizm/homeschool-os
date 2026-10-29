import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validStage,skillsForStage,createParentReviewPlan,suggestedLesson,curriculumCoverage,validatePlan} from '../src/lib/global-curriculum/engine';
import {globalStages} from '../src/lib/global-curriculum/catalogue';
import {ncertTextbooks,gradeCoverage,validateNcertCatalogue,chaptersFor} from '../src/lib/ncert/textbooks';
test('integrated curriculum preserves source identity and no fabricated textbook chapters',()=>{
 assert.deepEqual(validateNcertCatalogue(),[]);
 assert.equal(ncertTextbooks.length,16);
 assert.equal(ncertTextbooks.filter(x=>x.chapterCount===0).length,12);
 for(const book of ncertTextbooks.filter(x=>x.chapterCount===0))assert.equal(chaptersFor(book.id).length,0);
 assert.deepEqual(gradeCoverage().filter(x=>x.cataloguedBooks>0).map(x=>x.grade),[4,5,8]);
});
test('coverage honestly describes the partial programme',()=>{
 const c=curriculumCoverage();
 assert.equal(c.textbookRecords,16);
 assert.equal(c.chaptersIndexed,49);
 assert.equal(c.sourceCheckedTitles,49);
 assert.equal(c.approvedChapterMappings,0);
 assert.equal(c.completeBoards,0);
 assert.equal(c.gradesWithPartialCatalogue,3);
 assert.equal(c.gradesWithoutBooks,9);
 assert.ok(c.originalSkills>0&&c.originalLessons>0);
});
test('parent review plan is deterministic, bounded and does not claim assessments',()=>{
 assert.deepEqual(validatePlan(),[]);
 for(const stage of globalStages){
  const p=createParentReviewPlan(stage.id);
  assert.equal(p.reduce((n,x)=>n+x.minutes,0),60);
  assert.ok(p.every(x=>x.skill.stage===stage.id&&x.observationPrompt===x.skill.check));
  assert.ok(p.every(x=>x.mode==='guided'));
  assert.deepEqual(createParentReviewPlan(stage.id),p);
 }
 assert.equal(validStage('unknown'),'class3-5');
 assert.ok(skillsForStage('class3-5').length>0);
});
test('only same-stage and same-subject original lessons are suggested',()=>{
 for(const stage of globalStages){
  for(const item of createParentReviewPlan(stage.id)){
   const lesson=suggestedLesson(item.skill);
   if(lesson){assert.equal(lesson.stage,item.skill.stage);assert.equal(lesson.subject,item.skill.subject);}
  }
 }
});
