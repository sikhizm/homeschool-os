import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { parsePortfolioInput, PortfolioInputError } from '@/lib/portfolio/model';
import { learnerAccess, AccessError } from '@/lib/learning/service';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{learnerId:string}>};
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function user(){const {data:session}=await auth.getSession();return session?.user?.id;}
function failure(e:unknown){
 if(e instanceof PortfolioInputError)return json({error:e.message},400);
 if(e instanceof AccessError)return json({error:'Learner unavailable or permission denied.'},403);
 return json({error:'Portfolio unavailable. Check the Phase 06 migration and try again.'},500);
}
const approvedId=(s:string)=>/^[0-9a-f-]{1,70}$/i.test(s);
export async function GET(request:Request,context:Context){
 const uid=await user();if(!uid)return json({error:'Sign in required.'},401);
 const {learnerId}=await context.params;if(!approvedId(learnerId))return json({error:'Invalid learner.'},400);
 try{
  const sql=getSql();await learnerAccess(sql,uid,learnerId);
  const rows=await sql`SELECT p.id::text,p.observed_on::text,p.kind,p.area,p.title,p.details,p.next_step,p.level,p.created_at::text,p.updated_at::text
  FROM learning_portfolio_entries p JOIN learners l ON l.id=p.learner_id
  WHERE l.id::text=${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${uid})
  ORDER BY p.observed_on DESC,p.created_at DESC,p.id DESC LIMIT 300`;
  return json({entries:rows});
 }catch(e){return failure(e);}
}
export async function POST(request:Request,context:Context){
 const origin=request.headers.get('origin');const url=new URL(request.url);
 if(!origin||origin!==`${url.protocol}//${request.headers.get('host')}`)return json({error:'Same-origin request required.'},403);
 const uid=await user();if(!uid)return json({error:'Sign in required.'},401);
 const {learnerId}=await context.params;if(!approvedId(learnerId))return json({error:'Invalid learner.'},400);
 if(Number(request.headers.get('content-length'))>12000)return json({error:'Request too large.'},413);
 try{
  const raw=await request.text();if(raw.length>12000)return json({error:'Request too large.'},413);
  let value:unknown;try{value=JSON.parse(raw)}catch{return json({error:'Invalid JSON.'},400);}
  const command=parsePortfolioInput(value);
  const sql=getSql();await learnerAccess(sql,uid,learnerId,true);
  let rows:Record<string,unknown>[]=[];
  if(command.action==='create'){
   rows=await sql`INSERT INTO learning_portfolio_entries(learner_id,observed_on,kind,area,title,details,next_step,level)
   SELECT l.id,${command.observedOn}::date,${command.kind},${command.area},${command.title},${command.details},${command.nextStep},${command.level}
   FROM learners l WHERE l.id::text=${learnerId}
   AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${uid} AND fm.role='owner')
   RETURNING id::text`;
  }else if(command.action==='update'){
   rows=await sql`UPDATE learning_portfolio_entries p SET observed_on=${command.observedOn}::date,kind=${command.kind},area=${command.area},
    title=${command.title},details=${command.details},next_step=${command.nextStep},level=${command.level},updated_at=now()
    FROM learners l WHERE p.learner_id=l.id AND l.id::text=${learnerId} AND p.id=${command.id}::uuid
    AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${uid} AND fm.role='owner') RETURNING p.id::text`;
  }else{
   rows=await sql`DELETE FROM learning_portfolio_entries p USING learners l WHERE p.learner_id=l.id AND l.id::text=${learnerId} AND p.id=${command.id}::uuid
    AND EXISTS(SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${uid} AND fm.role='owner') RETURNING p.id::text`;
  }
  if(!rows.length)return json({error:'Entry unavailable or permission denied.'},403);
  return json({saved:true});
 }catch(e){return failure(e);}
}
