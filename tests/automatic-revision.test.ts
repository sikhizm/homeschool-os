import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {assessmentId,masteryId} from '../src/lib/auto-learning/assessment';
import {recallEvidenceId,revisionTasks,prioritizedQueue,knownReviewTask} from '../src/lib/auto-learning/revision';
const all=queueCatalogue('UKG');
const first=all[0];
const now=new Date('2026-11-09T10:00:00.000Z');
const previous=(days:number)=>new Date(now.getTime()-days*86400000).toISOString();
const record=(task_id:string,status:string,daysAgo=0)=>({task_id,status,updated_at:previous(daysAgo)});
test('parent-requested revision remains ahead of new lessons',()=>{
 const records=[record(first.id,'needs_revision',1)];
 assert.equal(prioritizedQueue(all,records,now,3)[0].id,first.id);
});
test('an unassessed activity receives an early recall check after two days',()=>{
 const records=[record(first.id,'completed',1)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[0].updated_at=previous(2);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:1:'+first.id);
});
test('a parent-confirmed understanding check waits three days before recall',()=>{
 const records=[record(first.id,'completed',2),record(assessmentId(first.id),'completed',2)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[0].updated_at=previous(3);records[1].updated_at=previous(3);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:1:'+first.id);
});
test('independent recall earns a longer ten-day interval',()=>{
 const review='review:1:'+first.id;
 const records=[record(first.id,'completed',15),record(assessmentId(first.id),'completed',15),record(review,'completed',9),record(recallEvidenceId(review,'independent'),'completed',9)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[2].updated_at=previous(10);records[3].updated_at=previous(10);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:2:'+first.id);
});
test('recall with a hint shortens the next interval to four days',()=>{
 const review='review:1:'+first.id;
 const records=[record(first.id,'completed',8),record(assessmentId(first.id),'completed',8),record(review,'completed',3),record(recallEvidenceId(review,'with_hint'),'completed',3)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[2].updated_at=previous(4);records[3].updated_at=previous(4);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:2:'+first.id);
});
test('a not-yet-secure recall is offered again immediately',()=>{
 const review='review:1:'+first.id;
 const records=[record(first.id,'completed',2),record(review,'needs_revision',0),record(recallEvidenceId(review,'not_yet'),'needs_revision',0)];
 assert.equal(revisionTasks(all,records,now)[0].id,review);
});
test('an independent second recall earns mastery and ends the review sequence',()=>{
 const r1='review:1:'+first.id,r2='review:2:'+first.id;
 const records=[record(first.id,'completed',30),record(assessmentId(first.id),'completed',30),record(r1,'completed',20),record(recallEvidenceId(r1,'independent'),'completed',20),record(r2,'completed',10),record(recallEvidenceId(r2,'independent'),'completed',10),record(masteryId(first.id),'completed',10)];
 assert.equal(revisionTasks(all,records,now).length,0);
});
test('if understanding is first established during recall, a later independent check is still required',()=>{
 const r1='review:1:'+first.id,r2='review:2:'+first.id;
 const records=[record(first.id,'completed',30),record(r1,'completed',20),record(recallEvidenceId(r1,'independent'),'completed',20),record(assessmentId(first.id),'completed',20),record(r2,'completed',10),record(recallEvidenceId(r2,'with_hint'),'completed',10)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[5].updated_at=previous(4);records[4].updated_at=previous(4);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:3:'+first.id);
});
test('legacy fixed-review records remain readable and get a conservative seven-day interval',()=>{
 const r1='review:1:'+first.id;
 const records=[record(first.id,'completed',20),record(r1,'completed',6)];
 assert.equal(revisionTasks(all,records,now).length,0);
 records[1].updated_at=previous(7);
 assert.equal(revisionTasks(all,records,now)[0].id,'review:2:'+first.id);
});
test('unknown review identifiers are rejected and third review is supported',()=>{
 assert.equal(knownReviewTask('review:1:'+first.id,all),true);
 assert.equal(knownReviewTask('review:3:'+first.id,all),true);
 assert.equal(knownReviewTask('review:4:'+first.id,all),false);
 assert.equal(knownReviewTask('review:1:unrecognized',all),false);
});
