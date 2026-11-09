import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {
 assessmentPlan,assessmentSummary,assessmentId,masteryId,recallEvidenceId,participationBadges,masteryBadges,
 understoodTasks,masteredTasks,isInternalProgressId,type SavedRecord
} from '../src/lib/auto-learning/assessment';

const task='annual:class4:w01:core';
const review='review:1:'+task;
const record=(task_id:string,status:string):SavedRecord=>({task_id,status,updated_at:'2026-11-03T09:00:00Z'});

test('a completion click records participation but never understanding or mastery',()=>{
 const plan=assessmentPlan(task,'completed',undefined,[]);
 assert.deepEqual(plan.upserts,[{taskId:task,status:'completed'}]);
 assert.equal(plan.mastery,false);
 const records=plan.upserts.map(w=>record(w.taskId,w.status));
 const summary=assessmentSummary(records);
 assert.deepEqual(summary,{completed:1,understood:0,mastered:0,independentRecall:0,recallWithHint:0});
 assert.equal(participationBadges(summary.completed).length,1);
 assert.equal(masteryBadges(summary.understood,summary.mastered).length,0);
});

test('an understanding check records assessment evidence without awarding mastery',()=>{
 const plan=assessmentPlan(task,'completed','understood',[]);
 assert.ok(plan.upserts.some(w=>w.taskId===assessmentId(task)));
 assert.equal(plan.mastery,false);
 const records=plan.upserts.map(w=>record(w.taskId,w.status));
 assert.equal(understoodTasks(records).has(task),true);
 assert.equal(masteredTasks(records).size,0);
 const summary=assessmentSummary(records);
 assert.equal(summary.understood,1);
 assert.equal(masteryBadges(summary.understood,summary.mastered)[0].id,'explains-ideas');
});

test('mastery needs both understanding and a later successful spaced recall',()=>{
 const understood=assessmentPlan(task,'completed','understood',[]).upserts.map(w=>record(w.taskId,w.status));
 const recall=assessmentPlan(review,'completed',undefined,understood,'independent');
 assert.equal(recall.mastery,true);
 assert.ok(recall.upserts.some(w=>w.taskId===masteryId(task)));
 const combined=[...understood,...recall.upserts.map(w=>record(w.taskId,w.status))];
 assert.equal(masteredTasks(combined).has(task),true);
 const summary=assessmentSummary(combined);
 assert.equal(summary.mastered,1);
 assert.ok(masteryBadges(summary.understood,summary.mastered).every(b=>b.kind==='mastery'));
});

test('a recall check without prior understanding does not manufacture mastery',()=>{
 const plan=assessmentPlan(review,'completed',undefined,[record(task,'completed')]);
 assert.equal(plan.mastery,false);
 assert.ok(plan.upserts.every(w=>w.taskId!==masteryId(task)));
 assert.equal(masteredTasks(plan.upserts.map(w=>record(w.taskId,w.status))).size,0);
});

test('needs revision removes the understanding claim and undoing rolls back derived evidence',()=>{
 const before=[record(task,'completed'),record(assessmentId(task),'completed'),record(masteryId(task),'completed')];
 const revised=assessmentPlan(task,'needs_revision','not-yet',before);
 assert.deepEqual(revised.upserts.find(w=>w.taskId===assessmentId(task)),{taskId:assessmentId(task),status:'needs_revision'});
 const after=[...before.filter(r=>r.task_id!==assessmentId(task)),record(assessmentId(task),'needs_revision')];
 assert.equal(understoodTasks(after).has(task),false);
 const undo=assessmentPlan(review,'pending',undefined,before);
 assert.ok(undo.deletes.includes(review));
 assert.ok(undo.deletes.includes(assessmentId(task)));
 assert.ok(undo.deletes.includes(masteryId(task)));
 assert.equal(undo.deletes.includes(task),false,'undoing a recall check must not delete the original activity completion');
 assert.equal(undo.upserts.length,0);
});

test('namespaced evidence ids are never counted as completed activities',()=>{
 const records=[record(task,'completed'),record(assessmentId(task),'completed'),record(masteryId(task),'completed')];
 assert.equal(assessmentSummary(records).completed,1);
 assert.equal(isInternalProgressId(assessmentId(task)),true);
 assert.equal(isInternalProgressId(task),false);
 assert.equal(assessmentSummary(records,new Set([task])).completed,1);
 assert.equal(assessmentSummary(records,new Set(['another-task'])).completed,0);
});

test('assessment evidence fits the existing migration 005 schema and preserves real progress',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`CREATE TABLE families (id text PRIMARY KEY);
   CREATE TABLE family_members (family_id text REFERENCES families(id),auth_user_id text,role text,created_at timestamptz DEFAULT now());
   CREATE TABLE learners (id uuid PRIMARY KEY,family_id text REFERENCES families(id),display_name text,stage text,created_at timestamptz DEFAULT now());
   INSERT INTO families VALUES ('family-a');
   INSERT INTO family_members (family_id,auth_user_id,role) VALUES ('family-a','owner-a','owner');`);
  const learnerId=await db.query<{id:string}>("INSERT INTO learners (id,family_id,display_name,stage) VALUES ('11111111-1111-4111-8111-111111111111','family-a','Fixture learner','Class 4') RETURNING id::text AS id");
  const id=learnerId.rows[0].id;
  const migration=await readFile(new URL('../migrations/005_auto_learning_queue.sql',import.meta.url),'utf8');
  await db.exec(migration);
  const rls=await db.query<{relrowsecurity:boolean}>("SELECT relrowsecurity FROM pg_class WHERE oid='public.auto_learning_progress'::regclass");
  assert.equal(rls.rows[0].relrowsecurity,true);
  // Pre-existing family progress must survive this phase untouched.
  await db.query('INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES ($1,$2,$3)',[id,'ncert:old-chapter','completed']);
  const records:SavedRecord[]=[];
  const apply=async(plan:ReturnType<typeof assessmentPlan>)=>{
   for(const write of plan.upserts){
    await db.query(`INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES ($1,$2,$3)
     ON CONFLICT(learner_id,task_id) DO UPDATE SET status=EXCLUDED.status,updated_at=now()`,[id,write.taskId,write.status]);
   }
   records.push(...plan.upserts.map(w=>record(w.taskId,w.status)));
  };
  await apply(assessmentPlan(task,'completed','understood',records));
  await apply(assessmentPlan(review,'completed',undefined,records,'independent'));
  const rows=await db.query<{task_id:string;status:string}>('SELECT task_id,status FROM auto_learning_progress ORDER BY task_id');
  assert.equal(rows.rows.length,6); // one original row + task, assess, review, recall evidence, mastery
  assert.ok(rows.rows.some(r=>r.task_id==='ncert:old-chapter'&&r.status==='completed'));
  assert.ok(rows.rows.some(r=>r.task_id===masteryId(task)&&r.status==='completed'));
  assert.ok(rows.rows.some(r=>r.task_id===recallEvidenceId(review,'independent')&&r.status==='completed'));
  const undo=assessmentPlan(review,'pending',undefined,records);
  for(const remove of undo.deletes)await db.query('DELETE FROM auto_learning_progress WHERE learner_id::text=$1 AND task_id=$2',[id,remove]);
  const remaining=await db.query<{task_id:string}>('SELECT task_id FROM auto_learning_progress');
  assert.deepEqual(remaining.rows.map(r=>r.task_id).sort(),['annual:class4:w01:core','ncert:old-chapter'].sort(),'undo removes only derived rows of this activity');
  // The existing CHECK constraints must reject unsupported statuses and oversized ids.
  await assert.rejects(db.query('INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES ($1,$2,$3)',[id,'x','mastered']));
  await assert.rejects(db.query('INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES ($1,$2,$3)',[id,'x'.repeat(141),'completed']));
 }finally{await db.close()}
});

test('a hinted recall shortens the interval but never awards mastery',()=>{
 const understood=assessmentPlan(task,'completed','understood',[]).upserts.map(w=>record(w.taskId,w.status));
 const plan=assessmentPlan(review,'completed',undefined,understood,'with_hint');
 assert.equal(plan.mastery,false);
 assert.ok(plan.upserts.some(w=>w.taskId===recallEvidenceId(review,'with_hint')));
 assert.ok(plan.upserts.every(w=>w.taskId!==masteryId(task)));
});
test('first independent recall can establish understanding but a later recall is still required',()=>{
 const first=assessmentPlan(review,'completed',undefined,[record(task,'completed')],'independent');
 assert.equal(first.mastery,false);
 assert.ok(first.upserts.some(w=>w.taskId===assessmentId(task)&&w.status==='completed'));
 const records=[record(task,'completed'),...first.upserts.map(w=>record(w.taskId,w.status))];
 const second=assessmentPlan('review:2:'+task,'completed',undefined,records,'independent');
 assert.equal(second.mastery,true);
 assert.ok(second.upserts.some(w=>w.taskId===masteryId(task)));
});
test('adaptive recall evidence is internal and never counted as an activity',()=>{
 const evidence=record(recallEvidenceId(review,'independent'),'completed');
 assert.equal(isInternalProgressId(evidence.task_id),true);
 assert.equal(assessmentSummary([record(task,'completed'),evidence]).completed,1);
 assert.equal(assessmentSummary([record(task,'completed'),evidence]).independentRecall,1);
});

test('undoing a later recall preserves an understanding check recorded earlier',()=>{
 const earlier:SavedRecord[]=[
  {task_id:task,status:'completed',updated_at:'2026-10-01T10:00:00Z'},
  {task_id:assessmentId(task),status:'completed',updated_at:'2026-10-01T10:05:00Z'},
  {task_id:review,status:'completed',updated_at:'2026-10-04T10:00:00Z'},
  {task_id:recallEvidenceId(review,'independent'),status:'completed',updated_at:'2026-10-04T10:00:00Z'},
  {task_id:'review:2:'+task,status:'completed',updated_at:'2026-10-14T10:00:00Z'},
  {task_id:recallEvidenceId('review:2:'+task,'with_hint'),status:'completed',updated_at:'2026-10-14T10:00:00Z'}
 ];
 const undo=assessmentPlan('review:2:'+task,'pending',undefined,earlier);
 assert.equal(undo.deletes.includes(assessmentId(task)),false);
 assert.equal(undo.deletes.includes(masteryId(task)),true);
 assert.equal(undo.deletes.includes('review:3:'+task),true);
 assert.equal(undo.deletes.includes(recallEvidenceId('review:2:'+task,'with_hint')),true);
});
