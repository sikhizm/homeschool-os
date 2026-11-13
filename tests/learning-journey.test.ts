import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {assessmentPlan,masteryId} from '../src/lib/auto-learning/assessment';
import {deriveChapterProgress} from '../src/lib/auto-learning/chapter-progress';
import {revisionTasks} from '../src/lib/auto-learning/revision';
import {findContinueSession,findActiveChapter,chapterStats,booksForLearner,revisionChapters} from '../src/lib/auto-learning/learner-dashboard';
import type {SavedRecord} from '../src/lib/auto-learning/assessment';
import type {SavedProgress} from '../src/lib/auto-learning/revision';

/**
 * Phase 5 learning-workflow and data-integrity validation.
 *
 * Runs the complete chapter journey — start, evidence, resume, practice,
 * understanding check, completion, revision, retention — against the real
 * migration 005 schema in PGlite, using exactly the write path the API route
 * delegates to (assessmentPlan + delete/upsert). Also proves learner
 * separation and that repeated completions never duplicate records.
 */
async function db(){
 const instance=new PGlite();
 await instance.exec(`CREATE TABLE learners(id text PRIMARY KEY,display_name text,stage text);
  INSERT INTO learners VALUES ('learner-a','Fixture A','Class 4'),('learner-b','Fixture B','Class 4');`);
 const migration=await readFile(new URL('../migrations/005_auto_learning_queue.sql',import.meta.url),'utf8');
 await instance.exec(migration);
 return instance;
}

/** Mirrors src/app/api/auto-learning/route.ts POST: plan → deletes → upserts. */
async function recordProgress(instance:PGlite,learnerId:string,taskId:string,
 status:'completed'|'needs_revision'|'pending',assessment?:'understood'|'not-yet',
 recallQuality?:'independent'|'with_hint'|'not_yet'){
 const rows=await instance.query<{task_id:string;status:string;updated_at:string}>(
  'SELECT task_id,status,updated_at::text FROM auto_learning_progress WHERE learner_id=$1',[learnerId]);
 const records:SavedRecord[]=rows.rows.map(r=>({task_id:r.task_id,status:r.status,updated_at:r.updated_at}));
 const plan=assessmentPlan(taskId,status,assessment,records,recallQuality);
 for(const id of plan.deletes){
  await instance.query('DELETE FROM auto_learning_progress WHERE learner_id=$1 AND task_id=$2',[learnerId,id]);
 }
 for(const write of plan.upserts){
  await instance.query(
   `INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES ($1,$2,$3)
    ON CONFLICT(learner_id,task_id) DO UPDATE SET status=EXCLUDED.status,updated_at=now()`,
   [learnerId,write.taskId,write.status]);
 }
 return plan;
}

async function progressFor(instance:PGlite,learnerId:string):Promise<SavedProgress[]>{
 const rows=await instance.query<{task_id:string;status:string;updated_at:string}>(
  'SELECT task_id,status,updated_at::text FROM auto_learning_progress WHERE learner_id=$1',[learnerId]);
 return rows.rows.map(r=>({task_id:r.task_id,status:r.status,updated_at:r.updated_at}));
}

test('complete chapter journey: start → evidence → resume → practice → check → status → revision → retention',async()=>{
 const instance=await db();
 const catalogue=queueCatalogue('Class 4');
 const first=catalogue.find(t=>t.id.startsWith('ncert:')&&t.id.endsWith(':read'))!;
 const chapterId=first.id.slice('ncert:'.length,-':read'.length);
 const read='ncert:'+chapterId+':read',practice='ncert:'+chapterId+':practice',review='ncert:'+chapterId+':review';
 const derive=async(learnerId='learner-a')=>deriveChapterProgress(catalogue,await progressFor(instance,learnerId));
 const chapterOf=async(learnerId='learner-a')=>(await derive(learnerId)).find(c=>c.chapterId===chapterId)!;

 // 1–2. Fresh learner: not started, continue offers the read session.
 let chapter=await chapterOf();
 assert.equal(chapter.status,'not_started');
 assert.equal(findContinueSession(catalogue,await derive())!.taskId,read);

 // 3–5. Start and complete the read session with learning evidence.
 await recordProgress(instance,'learner-a',read,'completed');
 chapter=await chapterOf();
 assert.equal(chapter.status,'practice_due');
 assert.equal(findContinueSession(catalogue,await derive())!.taskId,practice,'resume continues at practice');

 // 6. An unfinished session state persists across "refreshes" (fresh reads of the table).
 assert.equal((await chapterOf()).status,'practice_due');

 // 7. Complete practice, then the understanding check with an understood verdict.
 await recordProgress(instance,'learner-a',practice,'completed');
 assert.equal((await chapterOf()).status,'understanding_check_due');
 assert.equal(findContinueSession(catalogue,await derive())!.taskId,review);
 await recordProgress(instance,'learner-a',review,'completed','understood');
 chapter=await chapterOf();
 assert.equal(chapter.status,'completed','chapter completes only after all three sessions');
 assert.equal(chapter.completedSessions,3);

 // 11. Completed work is reflected in the dashboard and never offered again.
 const afterCompletion=await derive();
 assert.equal(findActiveChapter(afterCompletion),null);
 const next=findContinueSession(catalogue,afterCompletion)!;
 assert.notEqual(next.chapterId,chapterId,'a completed chapter is not presented as new work');
 const stats=chapterStats(afterCompletion);
 assert.equal(stats.completed,1);
 assert.equal(stats.retained,0,'completion alone never claims retention');
 const books=booksForLearner('Class 4',afterCompletion);
 const bookId=chapterId.replace(/-ch-\d+$/,'');
 assert.equal(books.find(b=>b.id===bookId)!.chaptersCompleted,1);

 // Re-recording the same completion must not duplicate records (idempotent upsert).
 const before=await progressFor(instance,'learner-a');
 await recordProgress(instance,'learner-a',review,'completed','understood');
 const after=await progressFor(instance,'learner-a');
 assert.equal(after.length,before.length,'repeated completion does not add rows');

 // 10. Revision flow: a failed understanding attempt on another chapter.
 const second=catalogue.find(t=>t.id.startsWith('ncert:')&&t.id.endsWith(':read')&&!t.id.startsWith('ncert:'+chapterId))!;
 const secondChapterId=second.id.slice('ncert:'.length,-':read'.length);
 await recordProgress(instance,'learner-a','ncert:'+secondChapterId+':read','needs_revision');
 const withRevision=await derive();
 const secondChapter=withRevision.find(c=>c.chapterId===secondChapterId)!;
 assert.equal(secondChapter.status,'needs_revision');
 const due=revisionTasks(catalogue,await progressFor(instance,'learner-a'));
 assert.ok(due.some(t=>t.id==='ncert:'+secondChapterId+':read'),'adaptive revision queues the flagged session');
 assert.deepEqual(revisionChapters(withRevision).map(c=>c.chapterId),[secondChapterId]);
 assert.equal(findContinueSession(catalogue,withRevision)!.reason,'revise');

 // Retention: an independent spaced recall after the understanding check awards retained.
 const masteryPlan=await recordProgress(instance,'learner-a','review:1:'+review,'completed',undefined,'independent');
 assert.equal(masteryPlan.mastery,true,'independent recall after understanding records mastery');
 const retained=await chapterOf();
 assert.equal(retained.status,'retained');
 assert.equal(chapterStats(await derive()).retained,1);
 // Mastery evidence lives beside the session, keyed by mastery:<review task>.
 const records=await progressFor(instance,'learner-a');
 assert.ok(records.some(r=>r.task_id===masteryId(review)&&r.status==='completed'));

 // 12. Learner separation: learner B sees none of learner A's journey.
 const learnerBProgress=await progressFor(instance,'learner-b');
 assert.equal(learnerBProgress.length,0);
 const chaptersB=deriveChapterProgress(catalogue,learnerBProgress);
 assert.equal(chaptersB.find(c=>c.chapterId===chapterId)!.status,'not_started');
 assert.equal(findContinueSession(catalogue,chaptersB)!.taskId,read,'learner B starts from the beginning');
 assert.equal((await instance.query<{n:number}>('SELECT count(*)::int AS n FROM auto_learning_progress WHERE learner_id=$1',['learner-b'])).rows[0].n,0);

 await instance.close();
});

test('undoing evidence rolls back derived status without orphaned mastery claims',async()=>{
 const instance=await db();
 const catalogue=queueCatalogue('Class 4');
 const first=catalogue.find(t=>t.id.startsWith('ncert:')&&t.id.endsWith(':read'))!;
 const chapterId=first.id.slice('ncert:'.length,-':read'.length);
 const review='ncert:'+chapterId+':review';
 await recordProgress(instance,'learner-a','ncert:'+chapterId+':read','completed');
 await recordProgress(instance,'learner-a','ncert:'+chapterId+':practice','completed');
 await recordProgress(instance,'learner-a',review,'completed','understood');
 // Undo the understanding check back to pending.
 await recordProgress(instance,'learner-a',review,'pending');
 const records=await progressFor(instance,'learner-a');
 assert.ok(!records.some(r=>r.task_id===review),'pending removes the session record');
 const chapter=deriveChapterProgress(catalogue,records).find(c=>c.chapterId===chapterId)!;
 assert.equal(chapter.status,'understanding_check_due');
 assert.ok(!records.some(r=>r.task_id===masteryId(review)),'undo never leaves mastery evidence behind');
 await instance.close();
});
