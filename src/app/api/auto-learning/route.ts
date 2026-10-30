import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {queueCatalogue,nextQueueTasks} from '@/lib/auto-learning/catalogue';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const send=(x:unknown,status=200)=>NextResponse.json(x,{status,headers:{'Cache-Control':'private, no-store'}});
async function access(){
 const {data:session}=await auth.getSession();
 return session?.user?.id??null;
}
export async function GET(){
 const user=await access();if(!user)return send({error:'Sign in required'},401);
 try{
  const sql=getSql();
  const rows=await sql`
   SELECT l.id::text AS id,l.display_name,l.stage,fm.role
   FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE fm.auth_user_id=${user} ORDER BY l.created_at,l.id
  `;
  const progress=await sql`
   SELECT p.learner_id::text AS learner_id,p.task_id,p.status,p.updated_at
   FROM auto_learning_progress p JOIN learners l ON l.id=p.learner_id
   JOIN family_members fm ON fm.family_id=l.family_id
   WHERE fm.auth_user_id=${user}
  `;
  const learners=rows.map(l=>{
   const all=queueCatalogue(String(l.stage));
   const done=new Set(progress.filter(p=>String(p.learner_id)===String(l.id)&&p.status==='completed').map(p=>String(p.task_id)));
   const revise=new Set(progress.filter(p=>String(p.learner_id)===String(l.id)&&p.status==='needs_revision').map(p=>String(p.task_id)));
   // A previously completed single-chapter milestone counts as all three new sessions.
   for(const item of all){
    if(item.id.startsWith('ncert:') && done.has(item.id.replace(/:(read|practice|review)$/,'')))done.add(item.id);
   }
   const history=all.filter(t=>done.has(t.id)).slice(-30).reverse().map(t=>({
    id:t.id,title:t.title,subject:t.subject,
    updatedAt:String(progress.find(p=>String(p.learner_id)===String(l.id)&&p.task_id===t.id)?.updated_at??'')
   }));
   const recommended=nextQueueTasks(all,done,5);
   const upcoming=all.filter(t=>!done.has(t.id)).slice(5,11).map(t=>({id:t.id,title:t.title,subject:t.subject,minutes:t.minutes}));
   const subjects=[...new Set(all.map(t=>t.subject))].map(subject=>({
    subject,total:all.filter(t=>t.subject===subject).length,
    completed:all.filter(t=>t.subject===subject&&done.has(t.id)).length
   }));
   const earnedBadges=[
    ...(all.filter(t=>done.has(t.id)).length>=1?[{id:'first-step',name:'First Step',description:'Completed the first activity',symbol:'⭐'}]:[]),
    ...(all.filter(t=>done.has(t.id)).length>=5?[{id:'five-steps',name:'Learning Explorer',description:'Completed five activities',symbol:'🧭'}]:[]),
    ...(all.filter(t=>done.has(t.id)).length>=15?[{id:'fifteen-steps',name:'Learning Champion',description:'Completed fifteen activities',symbol:'🏆'}]:[])
   ];
   return {id:String(l.id),name:String(l.display_name),grade:String(l.stage),canEdit:l.role==='owner',
    completed:all.filter(t=>done.has(t.id)).length,total:all.length,history,upcoming,subjects,earnedBadges,
    tasks:recommended.map(t=>({...t,status:revise.has(t.id)?'needs_revision':'pending'}))};
  });
  return send({learners,notice:'Pilot sequence: Class 4 chapters have three guided parent-led sessions, plus original activity suggestions. Other grades use only the currently curated original activity library. Not a complete annual curriculum.'});
 }catch{return send({error:'Automatic learning database is not ready. Apply migration 005.'},503);}
}
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required'},403);
 const user=await access();if(!user)return send({error:'Sign in required'},401);
 const raw=await request.text();if(raw.length>3000)return send({error:'Request too large'},413);
 let body:unknown;try{body=JSON.parse(raw);}catch{return send({error:'Invalid JSON'},400);}
 if(!body||typeof body!=='object')return send({error:'Invalid input'},400);
 const {learnerId,taskId,status}=body as Record<string,unknown>;
 if(typeof learnerId!=='string'||learnerId.length>100||typeof taskId!=='string'||taskId.length>140||!['completed','needs_revision','pending'].includes(String(status)))return send({error:'Invalid input'},400);
 try{
  const sql=getSql();
  const learners=await sql`
   SELECT l.stage FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE l.id::text=${learnerId} AND fm.auth_user_id=${user} AND fm.role='owner' LIMIT 1
  `;
  if(!learners.length)return send({error:'Only a family owner can change progress'},403);
  if(!queueCatalogue(String(learners[0].stage)).some(x=>x.id===taskId))return send({error:'Task does not belong to this grade'},400);
  if(status==='pending'){
   await sql`DELETE FROM auto_learning_progress WHERE learner_id::text=${learnerId} AND task_id=${taskId}`;
  }else{
   await sql`INSERT INTO auto_learning_progress (learner_id,task_id,status) VALUES (
    (SELECT l.id FROM learners l JOIN family_members fm ON fm.family_id=l.family_id WHERE l.id::text=${learnerId} AND fm.auth_user_id=${user} AND fm.role='owner' LIMIT 1),
    ${taskId},${status as string})
    ON CONFLICT(learner_id,task_id) DO UPDATE SET status=EXCLUDED.status,updated_at=now()`;
  }
  return send({saved:true});
 }catch{return send({error:'Unable to save task progress'},503);}
}
