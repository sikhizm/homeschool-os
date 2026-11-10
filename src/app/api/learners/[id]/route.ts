import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const send=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
type Context={params:Promise<{id:string}>};
async function changeArchive(request:Request,context:Context,restore:boolean){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required.'},403);
 const {data:session}=await auth.getSession();
 if(!session?.user?.id)return send({error:'Sign in required.'},401);
 const {id}=await context.params;
 if(!id||id.length>100)return send({error:'Invalid learner.'},400);
 try{
  const sql=getSql();
  const rows=restore
   ?await sql`UPDATE learners SET archived_at=NULL
      WHERE id::text=${id} AND archived_at IS NOT NULL
      AND family_id IN (SELECT family_id FROM family_members WHERE auth_user_id=${session.user.id} AND role='owner')
      RETURNING id::text AS id`
   :await sql`UPDATE learners SET archived_at=now()
      WHERE id::text=${id} AND archived_at IS NULL
      AND family_id IN (SELECT family_id FROM family_members WHERE auth_user_id=${session.user.id} AND role='owner')
      RETURNING id::text AS id`;
  if(!rows.length)return send({error:'Learner not found, already changed, or you do not have permission.'},404);
  return send({saved:true,archived:!restore});
 }catch{
  return send({error:'Learner archiving is not ready. Apply migration 006, then try again.'},503);
 }
}
export async function DELETE(request:Request,context:Context){return changeArchive(request,context,false);}
export async function PATCH(request:Request,context:Context){return changeArchive(request,context,true);}
