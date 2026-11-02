import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {queueCatalogue} from '@/lib/auto-learning/catalogue';
import {prioritizedQueue} from '@/lib/auto-learning/revision';
import {buildFamilyPlan} from '@/lib/auto-learning/family-schedule';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const isoToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function permittedDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const parsed=new Date(value+'T00:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value)return false;
 const today=new Date(isoToday()+'T00:00:00Z').getTime();
 return parsed.getTime()<=today&&parsed.getTime()>=today-6*86400000;
}
async function membership(){
 const {data:session}=await auth.getSession();
 if(!session?.user?.id)return null;
 const sql=getSql();
 const rows=await sql`SELECT f.id::text AS id,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 return rows.length?{id:String(rows[0].id),role:String(rows[0].role),userId:session.user.id}:null;
}
export async function GET(request:Request){
 try{
  const member=await membership();if(!member)return reply({error:'Family sign-in required'},401);
  const date=new URL(request.url).searchParams.get('date')??isoToday();
  if(!permittedDate(date))return reply({error:'Choose a date within the past seven days'},400);
  const sql=getSql();
  const rows=await sql`SELECT learning_date::text AS date,budget_minutes,slots,created_at FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date=${date}::date LIMIT 1`;
  return reply({date,plan:rows[0]??null,canEdit:member.role==='owner'});
 }catch{return reply({error:'Family calendar is unavailable. Verify migration 006.'},503);}
}
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return reply({error:'Same-origin request required'},403);
 if(Number(request.headers.get('content-length'))>1024)return reply({error:'Request too large'},413);
 let raw:string;try{raw=await request.text();if(raw.length>1024)throw Error('large')}catch{return reply({error:'Invalid request'},400)}
 let body:unknown;try{body=JSON.parse(raw)}catch{return reply({error:'Invalid JSON'},400)}
 if(!body||typeof body!=='object')return reply({error:'Invalid input'},400);
 const {date,budget}=body as Record<string,unknown>;
 if(typeof date!=='string'||date!==isoToday()||!permittedDate(date)||typeof budget!=='number'||!Number.isInteger(budget)||![20,40,60,90].includes(budget))return reply({error:'Only today can be planned, using an available time budget'},400);
 try{
  const member=await membership();if(!member)return reply({error:'Sign in required'},401);
  if(member.role!=='owner')return reply({error:'Family owner required'},403);
  const sql=getSql();
  const existing=await sql`SELECT learning_date::text AS date,budget_minutes,slots,created_at FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date=${date}::date LIMIT 1`;
  if(existing.length)return reply({date,plan:existing[0],saved:false});
  const learners=await sql`SELECT l.id::text AS id,l.display_name,l.stage FROM learners l WHERE l.family_id::text=${member.id} ORDER BY l.created_at,l.id`;
  const progress=await sql`SELECT p.learner_id::text AS learner_id,p.task_id,p.status,p.updated_at FROM auto_learning_progress p JOIN learners l ON l.id=p.learner_id WHERE l.family_id::text=${member.id}`;
  const family=learners.map(l=>{
   const id=String(l.id),grade=String(l.stage);
   const entries=progress.filter(p=>String(p.learner_id)===id).map(p=>({task_id:String(p.task_id),status:String(p.status),updated_at:String(p.updated_at)}));
   const tasks=prioritizedQueue(queueCatalogue(grade),entries,new Date(),5);
   return {id,name:String(l.display_name),grade,tasks};
  });
  const planned=buildFamilyPlan(family,budget,new Date(date+'T12:00:00Z').getUTCDay());
  const slots=planned.slots.map(slot=>({learnerId:slot.learnerId,name:slot.name,grade:slot.grade,task:slot.task,minutes:slot.minutes,startMinute:slot.startMinute,mode:slot.mode}));
  // The unique key makes concurrent first-open requests idempotent; no silent replacement.
  const saved=await sql`INSERT INTO family_daily_plans(family_id,learning_date,budget_minutes,slots)
   SELECT f.id,${date}::date,${budget},${JSON.stringify(slots)}::jsonb FROM families f WHERE f.id::text=${member.id}
   ON CONFLICT(family_id,learning_date) DO NOTHING
   RETURNING learning_date::text AS date,budget_minutes,slots,created_at`;
  if(saved.length)return reply({date,plan:saved[0],saved:true});
  const concurrent=await sql`SELECT learning_date::text AS date,budget_minutes,slots,created_at FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date=${date}::date LIMIT 1`;
  return reply({date,plan:concurrent[0],saved:false});
 }catch{return reply({error:'Unable to save daily plan. Verify migration 006.'},503);}
}
