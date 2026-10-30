import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildFamilySchedule} from '../src/lib/auto-learning/family-schedule';

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
