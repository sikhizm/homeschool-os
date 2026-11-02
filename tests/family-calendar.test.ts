import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildFamilyPlan} from '../src/lib/auto-learning/family-schedule';

test('a saved daily plan can be replayed without recalculating from a changed queue',()=>{
 const learners=[{id:'learner-1',name:'Learner',grade:'Class 4',tasks:[{id:'step-1',minutes:15,subject:'Mathematics'},{id:'step-2',minutes:15,subject:'English'}]}];
 const first=buildFamilyPlan(learners,20,1);
 const snapshot=JSON.parse(JSON.stringify(first.slots));
 learners[0].tasks.shift();
 assert.deepEqual(snapshot.map((x:{task:{id:string}})=>x.task.id),['step-1']);
 assert.deepEqual(JSON.parse(JSON.stringify(snapshot)),snapshot);
 assert.equal(buildFamilyPlan(learners,20,1).slots[0].task.id,'step-2');
});
test('family snapshot never exceeds budget and never schedules an infant',()=>{
 const plan=buildFamilyPlan([
 {id:'a',name:'Toddler',grade:'Nursery',tasks:[{id:'play',minutes:10}]},
 {id:'b',name:'Baby',grade:'Infant',tasks:[{id:'baby',minutes:20}]}
 ],20,1);
 assert.equal(plan.allocated,10);
 assert.equal(plan.slots.length,1);
 assert.equal(plan.slots[0].learnerId,'a');
});
