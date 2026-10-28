import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { academicYear, daysInWeek, parsePlanningInput, PlanInputError, validPlanningDate, yearDates } from '@/lib/planning/periods';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(payload:unknown,status=200)=>NextResponse.json(payload,{status,headers:{'Cache-Control':'private, no-store'}});
const validLearner=(id:unknown)=>typeof id==='string' && /^[0-9a-f-]{1,70}$/i.test(id);
async function sessionUser(){
 const {data:session}=await auth.getSession();
 return session?.user?.id;
}
function errorResult(error:unknown){
 if(error instanceof PlanInputError)return respond({error:error.message},400);
 // No database error or private learner information is returned to the client.
 return respond({error:'Unable to load or save plans. Confirm the Phase 04 database migration was applied.'},500);
}
export async function GET(request:Request){
 const user=await sessionUser();
 if(!user)return respond({error:'Sign in required.'},401);
 const url=new URL(request.url);
 const learnerId=url.searchParams.get('learnerId');
 const anchor=url.searchParams.get('date');
 if(!validLearner(learnerId)||!validPlanningDate(anchor))return respond({error:'Choose a valid learner and date.'},400);
 try{
  const sql=getSql();
  const membership=await sql`SELECT l.id FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE l.id::text=${learnerId} AND fm.auth_user_id=${user}
   AND l.family_id=(SELECT family_id FROM family_members WHERE auth_user_id=${user} ORDER BY created_at,family_id LIMIT 1)
   LIMIT 1`;
  if(!membership.length)return respond({error:'Learner unavailable or permission denied.'},403);
  const year=yearDates(academicYear(anchor));
  const week=daysInWeek(anchor);
  const [periods,days]=await Promise.all([
   sql`SELECT p.id::text,p.kind,p.start_date::text,p.end_date::text,p.title,p.focus,p.notes
     FROM learning_planning_periods p JOIN learners l ON l.id=p.learner_id
     WHERE l.id::text=${learnerId} AND p.start_date<=${year.endDate}::date AND p.end_date>=${year.startDate}::date
     AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${user})
     ORDER BY p.start_date,p.kind`,
   sql`SELECT a.learning_date::text AS date,COUNT(*)::int AS activities,
     COALESCE(SUM(a.minutes),0)::int AS minutes,
     COALESCE(SUM(CASE WHEN a.completed THEN a.minutes ELSE 0 END),0)::int AS completed_minutes
     FROM learning_activities a JOIN learners l ON l.id=a.learner_id
     WHERE l.id::text=${learnerId} AND a.learning_date BETWEEN ${week[0]}::date AND ${week[6]}::date
     AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${user})
     GROUP BY a.learning_date ORDER BY a.learning_date`
  ]);
  return respond({year,week,periods,days});
 }catch(e){return errorResult(e);}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 const actual=new URL(request.url);
 if(!origin||origin!==`${actual.protocol}//${request.headers.get('host')}`)return respond({error:'Same-origin request required.'},403);
 const user=await sessionUser();
 if(!user)return respond({error:'Sign in required.'},401);
 if(Number(request.headers.get('content-length'))>12000)return respond({error:'Request too large.'},413);
 try{
  const raw=await request.text();
  if(raw.length>12000)return respond({error:'Request too large.'},413);
  let data:unknown;
  try{data=JSON.parse(raw);}catch{return respond({error:'Invalid JSON.'},400);}
  if(!data||typeof data!=='object')return respond({error:'Invalid request.'},400);
  const obj=data as Record<string,unknown>;
  if(!validLearner(obj.learnerId))return respond({error:'Choose a valid learner.'},400);
  const plan=parsePlanningInput(obj);
  const sql=getSql();
  const rows=await sql`INSERT INTO learning_planning_periods(learner_id,kind,start_date,end_date,title,focus,notes)
    SELECT l.id,${plan.kind},${plan.startDate}::date,${plan.endDate}::date,${plan.title},${plan.focus},${plan.notes}
    FROM learners l WHERE l.id::text=${obj.learnerId}
    AND l.family_id=(SELECT family_id FROM family_members WHERE auth_user_id=${user} ORDER BY created_at,family_id LIMIT 1)
    AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${user} AND fm.role='owner')
    ON CONFLICT(learner_id,kind,start_date)
    DO UPDATE SET title=EXCLUDED.title,focus=EXCLUDED.focus,notes=EXCLUDED.notes,updated_at=now()
    RETURNING id::text`;
  if(!rows.length)return respond({error:'Only a family owner can save plans for this learner.'},403);
  return respond({saved:true},200);
 }catch(e){return errorResult(e);}
}
