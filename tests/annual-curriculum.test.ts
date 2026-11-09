import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
 annualGrades,annualSteps,annualSummary,validateAnnualCurriculum,annualGradeFor,
 annualCoverageForStage,TEACHING_WEEKS
} from '../src/lib/curriculum/annual';
import {queueCatalogue,nextQueueTasks} from '../src/lib/auto-learning/catalogue';
import {buildFamilyPlan,sharedBudgetTasks,separateTasks,isInfant} from '../src/lib/auto-learning/family-schedule';

test('the full-year curriculum corpus is complete, valid and placeholder-free',()=>{
 assert.deepEqual(validateAnnualCurriculum(),[]);
 assert.equal(annualGrades.length,4);
 for(const definition of annualGrades){
  const steps=annualSteps(definition.key);
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);
  assert.equal(new Set(steps.filter(s=>s.kind==='core').map(s=>s.week)).size,TEACHING_WEEKS);
  assert.equal(steps.filter(s=>s.milestone).length,3);
  for(const step of steps){
   assert.ok(step.id.length<100,'progress ids must fit the existing column');
   assert.ok(step.lesson.objective&&step.lesson.materials&&step.lesson.prep&&step.lesson.example);
   assert.ok(step.lesson.steps.length>=4&&step.lesson.questions.length>=2);
   assert.ok(step.lesson.expectedAnswer.length>30&&step.lesson.exercise.length>20);
   assert.ok(step.lesson.easier&&step.lesson.harder&&step.lesson.completionCriteria&&step.lesson.revisionGuidance);
   assert.ok(!/\{(topic|example|question|answer|exercise|expected)\}/.test(JSON.stringify(step.lesson)));
  }
 }
});

test('prerequisites form an acyclic sequence and every week is present',()=>{
 for(const definition of annualGrades){
  const steps=annualSteps(definition.key);
  const byId=new Map(steps.map(s=>[s.id,s]));
  for(const step of steps){
   for(const prereq of step.prerequisites){
    const earlier=byId.get(prereq);
    assert.ok(earlier,'unknown prerequisite '+prereq);
    assert.ok(earlier!.week<step.week||(earlier!.week===step.week&&earlier!.kind==='core'),'prerequisite must come earlier');
   }
  }
  assert.equal(steps.filter(s=>s.prerequisites.length===0).length<=2,true);
 }
});

test('academic years distribute subjects across terms; infants get play only',()=>{
 for(const definition of annualGrades){
  const steps=annualSteps(definition.key);
  const subjects=new Set(steps.map(s=>s.subject));
  if(definition.key==='infant'){
   assert.equal(steps.length,36);
   assert.ok(steps.every(s=>s.mode==='play'&&s.minutes<=10));
   assert.ok(steps.every(s=>s.kind==='core'));
   assert.ok(!/worksheet|\btest\b|\bscore\b|homework/i.test(JSON.stringify(steps.map(s=>s.lesson))));
  }else{
   assert.equal(steps.length,72);
   assert.ok(subjects.size>=6,'broad subject distribution for '+definition.key);
   for(const term of [1,2,3] as const){
    const inTerm=steps.filter(s=>s.term===term);
    assert.equal(inTerm.length,24);
    assert.ok(new Set(inTerm.map(s=>s.subject)).size>=4,'subjects must spiral within a term');
   }
  }
 }
 const summary=annualSummary();
 assert.equal(summary.find(s=>s.key==='class4')!.steps,72);
 assert.equal(summary.find(s=>s.key==='infant')!.steps,36);
});

test('real stored learner stages resolve to the right annual pathway',()=>{
 assert.equal(annualGradeFor('Infant (0–18 months)'),'infant');
 assert.equal(annualGradeFor('Infant'),'infant');
 assert.equal(annualGradeFor('Toddler (18–36 months)'),'nursery');
 assert.equal(annualGradeFor('Early Years'),'nursery');
 assert.equal(annualGradeFor('Nursery'),'nursery');
 assert.equal(annualGradeFor('LKG'),'ukg');
 assert.equal(annualGradeFor('UKG'),'ukg');
 assert.equal(annualGradeFor('Class 4'),'class4');
 assert.equal(annualGradeFor('Class 5'),null);
 assert.ok(queueCatalogue('Class 5').every(t=>!t.id.startsWith('annual:')&&!t.id.startsWith('ncert:')),'unsupported grades keep only the original activity library');
});

test('all four learners now receive annual steps; the infant gets no academic queue',()=>{
 for(const stage of ['Infant (0–18 months)','Nursery','UKG','Class 4']){
  const tasks=queueCatalogue(stage);
  assert.ok(tasks.length>0,stage);
  assert.equal(tasks[0].id.startsWith('annual:'),true,stage+' should begin with the annual pathway');
  assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
  assert.ok(tasks.filter(t=>t.lesson).length>=36,stage+' lessons must be ready to teach');
  assert.ok(tasks.filter(t=>t.id.startsWith('annual:')).every(t=>t.lesson&&t.week&&t.term));
 }
 const infant=queueCatalogue('Infant (0–18 months)');
 assert.ok(infant.every(t=>!t.id.startsWith('ncert:')&&!t.id.startsWith('original:')&&!t.id.startsWith('pathway:')));
 assert.ok(infant.every(t=>t.mode==='play'));
 assert.equal(isInfant('Infant (0–18 months)'),true);
});

test('annual steps preserve prior completion behaviour and the NCERT session order',()=>{
 const all=queueCatalogue('Class 4');
 const ids=all.filter(t=>t.id.startsWith('ncert:'));
 assert.equal(ids.length,49*3);
 assert.ok(ids.every(t=>t.href.includes('/ncert-books/chapter/ncert-4-')),'Class 4 queue must not include Class 5 chapters');
 const first=ids[0].id.replace(/:(read|practice|review)$/,'');
 assert.deepEqual(ids.filter(t=>t.id.startsWith(first+':')).map(t=>t.id),[first+':read',first+':practice',first+':review']);
 assert.ok(ids.every(t=>t.lesson&&t.lesson.steps.length>=4&&t.lesson.expectedAnswer.length>30));
 const chosen=all.find(t=>t.id.startsWith('annual:'))!;
 assert.ok(nextQueueTasks(all,new Set([chosen.id]),all.length).every(t=>t.id!==chosen.id));
 assert.equal(nextQueueTasks(all,new Set(all.map(t=>t.id))).length,0);
});

test('one shared family budget covers all children and excludes independent practice',()=>{
 const family=[
  {id:'a',name:'Ishwin',grade:'Class 4',tasks:queueCatalogue('Class 4').slice(0,5).map(t=>({...t,status:'pending'}))},
  {id:'b',name:'Agamjeet',grade:'UKG',tasks:queueCatalogue('UKG').slice(0,5).map(t=>({...t,status:'pending'}))},
  {id:'c',name:'Prabhkirat',grade:'Nursery',tasks:queueCatalogue('Nursery').slice(0,5).map(t=>({...t,status:'pending'}))},
  {id:'d',name:'Gurfateh',grade:'Infant (0–18 months)',tasks:queueCatalogue('Infant (0–18 months)').slice(0,2).map(t=>({...t,status:'pending'}))},
 ];
 const plan=buildFamilyPlan(sharedBudgetTasks(family),60,3);
 assert.ok(plan.allocated<=60);
 assert.ok(plan.slots.every(s=>s.learnerId!=='d'),'infants are never formal teaching slots');
 assert.ok(plan.slots.every(s=>s.task.mode!=='independent'));
 assert.ok(plan.slots.every(s=>s.minutes===s.task.minutes),'never truncate a lesson to fill time');
 assert.ok(plan.slots.length>=3,'the shared plan should reach more than one child');
 assert.deepEqual([...new Set(plan.slots.map(s=>s.learnerId))].sort(),['a','b','c']);
 const separate=separateTasks(family);
 assert.ok(separate.some(s=>s.learnerId==='d'),'infant interaction is still offered separately');
 assert.ok(separate.every(s=>isInfant(s.grade)||s.task.mode==='independent'));
});

test('annual coverage reports recorded steps, terms and milestones without inventing mastery',()=>{
 const stage='UKG';
 const empty=annualCoverageForStage(stage,new Set());
 assert.ok(empty);
 assert.equal(empty!.completedSteps,0);
 assert.equal(empty!.percent,0);
 assert.equal(empty!.milestonesEarned,0);
 assert.equal(empty!.currentWeek,1);
 const steps=annualSteps('ukg');
 const termOne=new Set(steps.filter(s=>s.term===1).map(s=>s.id));
 const partial=annualCoverageForStage(stage,termOne)!;
 assert.equal(partial.terms[0].earned,true);
 assert.equal(partial.milestonesEarned,1);
 assert.equal(partial.currentWeek,13);
 assert.ok(partial.subjects.every(s=>s.completed>0));
 const all=new Set(steps.map(s=>s.id));
 const complete=annualCoverageForStage(stage,all)!;
 assert.equal(complete.percent,100);
 assert.equal(complete.milestonesEarned,3);
 assert.equal(complete.currentWeek,null);
 assert.equal(annualCoverageForStage('Class 5',new Set()),null);
});
