import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {queueCatalogue} from '@/lib/auto-learning/catalogue';
import {prioritizedQueue} from '@/lib/auto-learning/revision';
import {buildFamilyPlan,sharedBudgetTasks,carryForwardTasks,isValidRequiredSequence} from '@/lib/auto-learning/family-schedule';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const isoToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function permittedDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const parsed=new Date(value+'T00:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value)return false;
 const today=new Date(isoToday()+'T00:00:00Z').getTime();
 // Today, tomorrow (prepare the next day), or the past week (review).
 return parsed.getTime()<=today+86400000&&parsed.getTime()>=today-6*86400000;
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
 if(!permittedDate(date))return reply({error:'Choose a date from the past seven days up to tomorrow'},400);
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
 const {date,budget,budgetEnabled,taskIds}=body as Record<string,unknown>;
 if(typeof date!=='string'||!permittedDate(date)||date<isoToday()||
  (budgetEnabled!==undefined&&typeof budgetEnabled!=='boolean')||
  (budgetEnabled!==false&&(typeof budget!=='number'||!Number.isInteger(budget)||![20,40,60,90].includes(budget)))||
  (taskIds!==undefined&&(!taskIds||typeof taskIds!=='object'||Array.isArray(taskIds))))return reply({error:'Choose a valid date, assignment sequence and time preference'},400);
 const useBudget=budgetEnabled!==false;
 const selectedBudget=useBudget?Number(budget):null;
 const storedBudget=useBudget?selectedBudget!:180;
 try{
  const member=await membership();if(!member)return reply({error:'Sign in required'},401);
  if(member.role!=='owner')return reply({error:'Family owner required'},403);
  const sql=getSql();
  const existing=await sql`SELECT learning_date::text AS date,budget_minutes,slots,created_at FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date=${date}::date LIMIT 1`;
  if(existing.length)return reply({date,plan:existing[0],saved:false,budgetEnabled:Number(existing[0].budget_minutes)!==180});
  const learners=await sql`SELECT l.id::text AS id,l.display_name,l.stage FROM learners l WHERE l.family_id::text=${member.id} AND l.archived_at IS NULL ORDER BY l.created_at,l.id`;
  const progress=await sql`SELECT p.learner_id::text AS learner_id,p.task_id,p.status,p.updated_at FROM auto_learning_progress p JOIN learners l ON l.id=p.learner_id WHERE l.family_id::text=${member.id}`;
  const previous=await sql`SELECT slots FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date<${date}::date AND learning_date>=${date}::date-6 ORDER BY learning_date ASC`;
  const priorSlots=previous.flatMap(row=>Array.isArray(row.slots)?row.slots:[]);
  const requested=taskIds as Record<string,unknown>|undefined;
  const family=learners.map(l=>{
   const learnerId=String(l.id),grade=String(l.stage);
   const entries=progress.filter(p=>String(p.learner_id)===learnerId).map(p=>({task_id:String(p.task_id),status:String(p.status),updated_at:String(p.updated_at)}));
   const completed=new Set(entries.filter(p=>p.status==='completed').map(p=>p.task_id));
   const queue=prioritizedQueue(queueCatalogue(grade),entries,new Date(),50);
   const carried=priorSlots.filter((slot:Record<string,unknown>)=>slot.learnerId===learnerId)
    .map((slot:Record<string,unknown>)=>slot.task as {id:string;minutes:number;subject?:string;status?:string;mode?:'guided'|'play'|'independent'})
    .filter(task=>task&&typeof task.id==='string'&&!completed.has(task.id));
   const tasks=carryForwardTasks(queue,carried,completed);
   const chosen=requested?.[learnerId];
   if(chosen!==undefined&&(!Array.isArray(chosen)||!chosen.every(x=>typeof x==='string')||!isValidRequiredSequence(tasks,chosen as string[])))throw Error('Required activities must be assigned in their current learning order.');
   return {id:learnerId,name:String(l.display_name),grade,tasks:chosen===undefined?tasks:tasks.filter((task,index)=>(chosen as string[]).includes(task.id)&&index<(chosen as string[]).length)};
  });
  if(requested&&Object.keys(requested).some(key=>!learners.some(l=>String(l.id)===key)))return reply({error:'An assignment references an unknown learner'},400);
  const planned=buildFamilyPlan(sharedBudgetTasks(family),selectedBudget,new Date(date+'T12:00:00Z').getUTCDay(),true);
  const slots=planned.slots.map(slot=>({learnerId:slot.learnerId,name:slot.name,grade:slot.grade,task:slot.task,minutes:slot.minutes,startMinute:slot.startMinute,mode:slot.mode,budgetEnabled:useBudget}));
  // The unique key makes concurrent first-open requests idempotent; no silent replacement.
  const saved=await sql`INSERT INTO family_daily_plans(family_id,learning_date,budget_minutes,slots)
   SELECT f.id,${date}::date,${storedBudget},${JSON.stringify(slots)}::jsonb FROM families f WHERE f.id::text=${member.id}
   ON CONFLICT(family_id,learning_date) DO NOTHING
   RETURNING learning_date::text AS date,budget_minutes,slots,created_at`;
  if(saved.length)return reply({date,plan:saved[0],saved:true,budgetEnabled:useBudget});
  const concurrent=await sql`SELECT learning_date::text AS date,budget_minutes,slots,created_at FROM family_daily_plans WHERE family_id::text=${member.id} AND learning_date=${date}::date LIMIT 1`;
  return reply({date,plan:concurrent[0],saved:false,budgetEnabled:Number(concurrent[0]?.budget_minutes)!==180});
 }catch{return reply({error:'Unable to save daily plan. Verify migration 006.'},503);}
}
