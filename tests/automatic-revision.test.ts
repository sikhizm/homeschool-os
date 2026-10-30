import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {revisionTasks,prioritizedQueue,knownReviewTask} from '../src/lib/auto-learning/revision';
const all=queueCatalogue('UKG');
const first=all[0];
const now=new Date('2026-10-30T10:00:00.000Z');
const previous=(days:number)=>new Date(now.getTime()-days*86400000).toISOString();

test('revision flags take priority over new activities',()=>{
 const records=[{task_id:first.id,status:'needs_revision',updated_at:previous(1)}];
 assert.equal(prioritizedQueue(all,records,now,3)[0].id,first.id);
});
test('a 3-day recall review appears only after its due time',()=>{
 const record=[{task_id:first.id,status:'completed',updated_at:previous(2)}];
 assert.equal(revisionTasks(all,record,now).length,0);
 record[0].updated_at=previous(3);
 assert.equal(revisionTasks(all,record,now)[0].id,'review:1:'+first.id);
});
test('a completed first review advances to a 10-day second check',()=>{
 const records=[
  {task_id:first.id,status:'completed',updated_at:previous(11)},
  {task_id:'review:1:'+first.id,status:'completed',updated_at:previous(7)}
 ];
 assert.equal(revisionTasks(all,records,now)[0].id,'review:2:'+first.id);
 records.push({task_id:'review:2:'+first.id,status:'completed',updated_at:previous(0)});
 assert.equal(revisionTasks(all,records,now).length,0);
});
test('unknown review identifiers are rejected',()=>{
 assert.equal(knownReviewTask('review:1:'+first.id,all),true);
 assert.equal(knownReviewTask('review:3:'+first.id,all),false);
 assert.equal(knownReviewTask('review:1:unrecognized',all),false);
});
