import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildFamilySchedule,buildFamilyPlan,carryForwardTasks,isValidRequiredSequence} from '../src/lib/auto-learning/family-schedule';

const learners=[
 {id:'a',name:'A',grade:'Class 4',tasks:[{id:'a1',minutes:20},{id:'a2',minutes:20}]},
 {id:'b',name:'B',grade:'UKG',tasks:[{id:'b1',minutes:15},{id:'b2',minutes:10}]},
 {id:'c',name:'C',grade:'Nursery',tasks:[{id:'c1',minutes:10}]},
];
test('family schedule uses a single 60 minute budget',()=>{
 const slots=buildFamilySchedule(learners,60);
 assert.deepEqual(slots.map(x=>x.task.id),['a1','b1','c1','b2']);
 assert.equal(slots.reduce((n,x)=>n+x.minutes,0),55);
 assert.deepEqual(slots.map(x=>x.startMinute),[0,20,35,45]);
});
test('does not split a teaching task or exceed time budget',()=>{
 const slots=buildFamilySchedule(learners,20);
 assert.deepEqual(slots.map(x=>x.task.id),['a1']);
 assert.ok(slots.every(x=>x.minutes===x.task.minutes));
 assert.equal(buildFamilySchedule(learners,0).length,0);
});
test('works with empty task queues and no learners',()=>{
 assert.equal(buildFamilySchedule([],60).length,0);
 assert.equal(buildFamilySchedule([{id:'baby',name:'Baby',grade:'Early Years',tasks:[]}],60).length,0);
});

test('infants are never assigned formal teaching slots',()=>{
 const plan=buildFamilyPlan([{id:'baby',name:'Baby',grade:'Infant',tasks:[{id:'x',minutes:10}]},...learners],60);
 assert.ok(plan.slots.every(s=>s.learnerId!=='baby'));
 assert.ok(plan.notes.some(n=>n.includes('Infant')));
 assert.ok(plan.allocated<=60);
});
test('revision takes precedence and total time stays within budget',()=>{
 const plan=buildFamilyPlan([{id:'x',name:'X',grade:'Class 4',tasks:[
  {id:'regular',minutes:20,subject:'Math',status:'pending'},
  {id:'review',minutes:10,subject:'English',status:'needs_revision'}
 ]}],20,2);
 assert.equal(plan.slots[0].task.id,'review');
 assert.ok(plan.slots.reduce((a,s)=>a+s.minutes,0)<=20);
});
test('different weekdays may rotate available subject suggestions without losing tasks',()=>{
 const single=[{id:'x',name:'X',grade:'Class 4',tasks:[
  {id:'1',minutes:10,subject:'English'},{id:'2',minutes:10,subject:'Mathematics'},
  {id:'3',minutes:10,subject:'Science'},{id:'4',minutes:10,subject:'Punjabi'}
 ]}];
 const a=buildFamilyPlan(single,10,0).slots[0].task.id;
 const b=buildFamilyPlan(single,10,3).slots[0].task.id;
 assert.ok(['1','2','3','4'].includes(a));
 assert.ok(['1','2','3','4'].includes(b));
});


test('unlimited guided time includes every eligible activity without inventing a numeric budget',()=>{
 const plan=buildFamilyPlan([{id:'x',name:'X',grade:'Class 4',tasks:[
  {id:'a',minutes:25},{id:'b',minutes:35},{id:'c',minutes:20,mode:'independent'}
 ]}],null);
 assert.equal(plan.budget,null);
 assert.deepEqual(plan.slots.map(s=>s.task.id),['a','b']);
 assert.equal(plan.allocated,60);
 assert.equal(plan.unallocated,0);
});

test('carry-forward keeps unfinished prior assignments first and removes duplicates/completed work',()=>{
 const queue=[{id:'a',minutes:10},{id:'b',minutes:10},{id:'c',minutes:10}];
 const previous=[{id:'b',minutes:10},{id:'a',minutes:10},{id:'b',minutes:10}];
 assert.deepEqual(carryForwardTasks(queue,previous,new Set(['a'])).map(x=>x.id),['b','c']);
});

test('required assignments cannot skip or reorder the learner queue',()=>{
 const queue=[{id:'read',minutes:10},{id:'practice',minutes:15},{id:'check',minutes:5}];
 assert.equal(isValidRequiredSequence(queue,['read','practice']),true);
 assert.equal(isValidRequiredSequence(queue,['practice']),false);
 assert.equal(isValidRequiredSequence(queue,['read','check']),false);
 assert.equal(isValidRequiredSequence(queue,['read','practice','check','extra']),false);
});

test('sequence-preserving family plan does not rotate or skip required steps',()=>{
 const learners=[{id:'x',name:'X',grade:'Class 4',tasks:[
  {id:'read',minutes:10,subject:'English'},{id:'practice',minutes:10,subject:'Mathematics'},
  {id:'check',minutes:10,subject:'Science'}
 ]}];
 const plan=buildFamilyPlan(learners,30,4,true);
 assert.deepEqual(plan.slots.map(s=>s.task.id),['read','practice','check']);
});
