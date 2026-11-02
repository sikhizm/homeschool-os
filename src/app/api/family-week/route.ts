import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const send=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const todayIST=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export async function GET(){
 const {data:session}=await auth.getSession();
 if(!session?.user?.id)return send({error:'Sign in required'},401);
 try{
  const sql=getSql();
  const member=await sql`SELECT f.id::text AS id FROM families f JOIN family_members fm ON fm.family_id=f.id WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
  if(!member.length)return send({error:'Family membership required'},403);
  const today=todayIST();
  const plans=await sql`SELECT learning_date::text AS date,budget_minutes,slots FROM family_daily_plans WHERE family_id::text=${String(member[0].id)} AND learning_date BETWEEN ${today}::date-6 AND ${today}::date ORDER BY learning_date`;
  const progress=await sql`SELECT p.learner_id::text AS learner_id,p.task_id,p.status FROM auto_learning_progress p JOIN learners l ON l.id=p.learner_id WHERE l.family_id::text=${String(member[0].id)}`;
  const done=new Set(progress.filter(p=>p.status==='completed').map(p=>String(p.learner_id)+'::'+String(p.task_id)));
  const revising=new Set(progress.filter(p=>p.status==='needs_revision').map(p=>String(p.learner_id)+'::'+String(p.task_id)));
  const entries=plans.map(p=>{
   const slots=Array.isArray(p.slots)?p.slots:[];
   const items=slots.filter((slot:unknown)=>Boolean(slot)&&typeof slot==='object'&&'learnerId' in slot&&'task' in slot).map((slot:{learnerId:string;name:string;minutes:number;task:{id:string;title:string;subject:string}})=>{
    const key=String(slot.learnerId)+'::'+String(slot.task.id);
    return {learnerId:String(slot.learnerId),name:String(slot.name),title:String(slot.task.title),subject:String(slot.task.subject),minutes:Number(slot.minutes)||0,status:done.has(key)?'completed':revising.has(key)?'revision':'unfinished'};
   });
   return {date:String(p.date),budget:Number(p.budget_minutes),items};
  });
  return send({today,days:entries,meaning:'Statuses reflect current progress, not a historical completion timestamp; unsaved days are not missed attendance.'});
 }catch{return send({error:'Weekly overview unavailable; check calendar database.'},503)}
}
