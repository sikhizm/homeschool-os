import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {queueCatalogue} from '@/lib/auto-learning/catalogue';
import {prioritizedQueue,knownReviewTask} from '@/lib/auto-learning/revision';
import {deriveChapterProgress} from '@/lib/auto-learning/chapter-progress';
import {
 findActiveChapter,findContinueSession,chapterStats,revisionChapters,booksForLearner,
} from '@/lib/auto-learning/learner-dashboard';
import {buildFamilyPlan,sharedBudgetTasks,separateTasks} from '@/lib/auto-learning/family-schedule';
import {annualCoverageForStage} from '@/lib/curriculum/annual';
import {
 assessmentPlan,assessmentSummary,participationBadges,masteryBadges,
 isInternalProgressId,activityCompletions,understoodTasks,masteredTasks,type SavedRecord
} from '@/lib/auto-learning/assessment';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const send=(x:unknown,status=200)=>NextResponse.json(x,{status,headers:{'Cache-Control':'private, no-store'}});
const todayIST=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
async function access(){
 const {data:session}=await auth.getSession();
 return session?.user?.id??null;
}
const budgets=[20,40,60,90] as const;
type PathState='completed'|'ready'|'revision'|'needs-practice'|'upcoming';
export async function GET(request:Request){
 const user=await access();if(!user)return send({error:'Sign in required'},401);
 const url=new URL(request.url);
 const requested=url.searchParams.get('budget');
 const budget=budgets.includes(Number(requested) as typeof budgets[number])?Number(requested):60;
 const wantPath=url.searchParams.get('path')==='1';
 const wantTask=url.searchParams.get('task');
 const wantLearner=url.searchParams.get('learner');
  const requestedLearner=url.searchParams.get('learner');
 try{
  const sql=getSql();
  const rows=await sql`
   SELECT l.id::text AS id,l.display_name,l.stage,fm.role
   FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE fm.auth_user_id=${user} AND l.archived_at IS NULL
     AND (${requestedLearner}::text IS NULL OR l.id::text=${requestedLearner})
   ORDER BY l.created_at,l.id
  `;
  const progress=await sql`
   SELECT p.learner_id::text AS learner_id,p.task_id,p.status,p.updated_at
   FROM auto_learning_progress p JOIN learners l ON l.id=p.learner_id
   JOIN family_members fm ON fm.family_id=l.family_id
   WHERE fm.auth_user_id=${user} AND l.archived_at IS NULL
     AND (${requestedLearner}::text IS NULL OR l.id::text=${requestedLearner})
  `;
  let assignedSlots:{learnerId:string;task:Record<string,unknown>}[]=[];
  try{
   const dailyRows=await sql`
    SELECT p.slots FROM family_daily_plans p
    WHERE p.learning_date=${todayIST()}::date
     AND p.family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.auth_user_id=${user})
    LIMIT 1
   `;
   assignedSlots=Array.isArray(dailyRows[0]?.slots)?dailyRows[0].slots as {learnerId:string;task:Record<string,unknown>}[]:[];
  }catch{/* Older deployments without migration 006 retain the ordinary learner queue. */}
  const family: {id:string;name:string;grade:string;tasks:ReturnType<typeof prioritizedQueue>}[]=[];
  const learners=rows.map(l=>{
   const learnerId=String(l.id);
   const all=queueCatalogue(String(l.stage));
   const catalogueIds=new Set(all.map(task=>task.id));
   const myProgress:SavedRecord[]=progress.filter(p=>String(p.learner_id)===learnerId)
    .map(p=>({task_id:String(p.task_id),status:String(p.status),updated_at:String(p.updated_at)}));
   const recordedDone=activityCompletions(myProgress);
   const done=new Set([...recordedDone].filter(id=>catalogueIds.has(id)));
   const revise=new Set(myProgress.filter(p=>p.status==='needs_revision'&&!isInternalProgressId(p.task_id)).map(p=>p.task_id));
   // A previously completed single-chapter milestone counts as all three newer sessions.
   // Check the raw records, since legacy ids are intentionally not in the current catalogue.
   for(const item of all){
    if(item.id.startsWith('ncert:')&&recordedDone.has(item.id.replace(/:(read|practice|review)$/,'')))done.add(item.id);
   }
   const history=all.filter(t=>done.has(t.id)).slice(-30).reverse().map(t=>({
    id:t.id,title:t.title,subject:t.subject,
    updatedAt:String(myProgress.find(p=>p.task_id===t.id)?.updated_at??'')
   }));
   const recommended=prioritizedQueue(all,myProgress.map(p=>({...p,updated_at:p.updated_at??''})),new Date(),5);
   const upcoming=all.filter(t=>!done.has(t.id)&&!recommended.some(r=>r.id===t.id)).slice(0,6)
    .map(t=>({id:t.id,title:t.title,subject:t.subject,minutes:t.minutes}));
   const subjects=[...new Set(all.map(t=>t.subject))].map(subject=>({
    subject,total:all.filter(t=>t.subject===subject).length,
    completed:all.filter(t=>t.subject===subject&&done.has(t.id)).length
   }));
   const summary=assessmentSummary(myProgress,catalogueIds);
   const understood=understoodTasks(myProgress);
   const mastered=masteredTasks(myProgress);
   const annual=annualCoverageForStage(String(l.stage),done);
   const tasks=recommended.map(t=>({...t,status:revise.has(t.id)?'needs_revision':'pending'}));
   family.push({id:learnerId,name:String(l.display_name),grade:String(l.stage),tasks});
   // Learning-path view: every catalogue node with its real state. No locks —
   // upcoming lessons stay open; revision sits inline in the path.
   let path:unknown=undefined;
   if(wantPath){
    const readyIds=new Set(recommended.filter(t=>!t.id.startsWith('review:')).map(t=>t.id));
    const reviewBases=new Set(recommended.filter(t=>t.id.startsWith('review:')).map(t=>t.id.replace(/^review:[1-5]:/,'')));
    path=all.map(t=>{
     const state:PathState=done.has(t.id)?'completed'
      :revise.has(t.id)?'needs-practice'
      :reviewBases.has(t.id)?'revision'
      :readyIds.has(t.id)?'ready'
      :'upcoming';
     return {id:t.id,title:t.title,subject:t.subject,minutes:t.minutes,href:t.href,
      week:t.week??null,term:t.term??null,mode:t.mode??null,source:t.source,state};
    });
   }
   let taskDetail:unknown=undefined;
   if(wantTask&&wantLearner===learnerId){
    const baseId=String(wantTask).replace(/^review:[1-5]:/,'');
    const found=all.find(t=>t.id===baseId)||all.find(t=>t.id===wantTask);
    if(found)taskDetail={...found,status:revise.has(found.id)?'needs_revision':'pending',
     isReview:String(wantTask).startsWith('review:'),reviewId:String(wantTask)};
   }
   const chapterProgress=deriveChapterProgress(all,myProgress.map(p=>({...p,updated_at:p.updated_at??''})));
   return {id:learnerId,name:String(l.display_name),grade:String(l.stage),canEdit:l.role==='owner',
    completed:summary.completed,total:all.length,history,upcoming,subjects,annual,
    assessment:summary,understood:[...understood],mastered:[...mastered],
    chapterProgress,
    activeChapter:findActiveChapter(chapterProgress),
    continueSession:findContinueSession(all,chapterProgress),
    chapterStats:chapterStats(chapterProgress),
    revisionChapters:revisionChapters(chapterProgress).map(c=>({
     chapterId:c.chapterId,title:c.title,subject:c.subject,href:c.href,
     completedSessions:c.completedSessions,totalSessions:c.totalSessions,updatedAt:c.updatedAt})),
    books:booksForLearner(String(l.stage),chapterProgress),
    earnedBadges:[...participationBadges(summary.completed),...masteryBadges(summary.understood,summary.mastered)],
    tasks,assignedTasks:assignedSlots.filter(slot=>slot.learnerId===learnerId).map(slot=>slot.task),...(path?{path}:{}),...(taskDetail?{taskDetail}:{})};
  });
  const dayOfWeek=new Date(todayIST()+'T12:00:00Z').getUTCDay();
  const planned=buildFamilyPlan(sharedBudgetTasks(family),budget,dayOfWeek);
  const separate=separateTasks(family).map(entry=>({
   learnerId:entry.learnerId,name:entry.name,grade:entry.grade,
   task:{id:entry.task.id,title:entry.task.title,subject:entry.task.subject,minutes:entry.task.minutes,
    mode:entry.task.mode??'play',href:entry.task.href,source:entry.task.source,
    instructions:entry.task.instructions,check:entry.task.check,lesson:entry.task.lesson??null}
  }));
  const familyPlan={budget:planned.budget,allocated:planned.allocated,unallocated:planned.unallocated,
   notes:planned.notes,slots:planned.slots,separate};
  return send({learners,familyPlan,
   notice:'Ready-to-teach 36-week pathways for all four learning stages, sequenced with prerequisites. One shared family time budget is applied across every child; independent practice and infant interaction are shown separately. Original HomeSchool OS content — not official NCERT lessons or accredited board coverage.'});
 }catch{return send({error:'Automatic learning database is not ready. Apply migration 005.'},503);}
}
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required'},403);
 const user=await access();if(!user)return send({error:'Sign in required'},401);
 const raw=await request.text();if(raw.length>3000)return send({error:'Request too large'},413);
 let body:unknown;try{body=JSON.parse(raw);}catch{return send({error:'Invalid JSON'},400);}
 if(!body||typeof body!=='object')return send({error:'Invalid input'},400);
 const {learnerId,taskId,status,assessment,recallQuality}=body as Record<string,unknown>;
 const validStatus=['completed','needs_revision','pending'].includes(String(status));
 if(typeof learnerId!=='string'||learnerId.length>100||typeof taskId!=='string'||taskId.length>140||!validStatus)return send({error:'Invalid input'},400);
 if(isInternalProgressId(taskId))return send({error:'Invalid task identifier'},400);
 if(assessment!==undefined&&!['understood','not-yet'].includes(String(assessment)))return send({error:'Invalid assessment'},400);
 if(recallQuality!==undefined&&!['independent','with_hint','not_yet'].includes(String(recallQuality)))return send({error:'Invalid recall result'},400);
 const verdict=assessment===undefined?undefined:assessment as 'understood'|'not-yet';
 // "understood" evidence belongs only to a completed session; "not-yet" may accompany a revision.
 if(verdict==='understood'&&status!=='completed')return send({error:'An understanding check belongs to a completed session'},400);
 if(recallQuality!==undefined&&!/^review:[1-5]:/.test(taskId))return send({error:'Recall results belong to a scheduled recall session'},400);
 if(recallQuality==='not_yet'&&status!=='needs_revision')return send({error:'A recall that is not yet secure must remain in revision'},400);
 if((recallQuality==='independent'||recallQuality==='with_hint')&&status!=='completed')return send({error:'A successful recall must be completed'},400);
 const action=status as 'completed'|'needs_revision'|'pending';
 try{
  const sql=getSql();
  const learners=await sql`
   SELECT l.stage FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE l.id::text=${learnerId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} AND fm.role='owner' LIMIT 1
  `;
  if(!learners.length)return send({error:'Only a family owner can change progress'},403);
  const catalogue=queueCatalogue(String(learners[0].stage));
  if(!catalogue.some(x=>x.id===taskId)&&!knownReviewTask(taskId,catalogue))return send({error:'Task does not belong to this grade'},400);
  const records=await sql`
   SELECT p.task_id,p.status,p.updated_at FROM auto_learning_progress p
   WHERE p.learner_id::text=${learnerId}
   AND EXISTS(SELECT 1 FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
    WHERE l.id::text=${learnerId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} AND fm.role='owner')
  `;
  const plan=assessmentPlan(taskId,action,verdict,records.map(r=>({task_id:String(r.task_id),status:String(r.status),updated_at:String(r.updated_at)})),recallQuality as 'independent'|'with_hint'|'not_yet'|undefined);
  for(const id of plan.deletes){
   await sql`DELETE FROM auto_learning_progress WHERE learner_id::text=${learnerId} AND task_id=${id}
    AND EXISTS(SELECT 1 FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
     WHERE l.id::text=${learnerId} AND fm.auth_user_id=${user} AND fm.role='owner')`;
  }
  for(const write of plan.upserts){
   await sql`INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES (
    (SELECT l.id FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
     WHERE l.id::text=${learnerId} AND fm.auth_user_id=${user} AND fm.role='owner' LIMIT 1),
    ${write.taskId},${write.status})
    ON CONFLICT(learner_id,task_id) DO UPDATE SET status=EXCLUDED.status,updated_at=now()`;
  }
  return send({saved:true,masteryEarned:plan.mastery,
   message:plan.mastery?'Independent recall after an earlier understanding check — lasting mastery recorded.':recallQuality==='independent'?'Independent recall recorded. A later spaced check will confirm lasting retention.':recallQuality==='with_hint'?'Recall with a hint recorded. The next check will come sooner.':recallQuality==='not_yet'?'That is useful information. This activity stays in the revision queue for a gentler revisit.':verdict==='understood'?'Understanding recorded; a later recall check can demonstrate mastery.':undefined});
 }catch{return send({error:'Unable to save task progress'},503);}
}
