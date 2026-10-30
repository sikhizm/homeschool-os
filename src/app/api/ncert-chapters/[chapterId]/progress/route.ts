import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {ncertChapterSlots} from '@/lib/ncert/textbooks';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const allowed=new Set(['assigned','in_progress','completed']);
type Context={params:Promise<{chapterId:string}>};
async function identity(chapterId:string){
 const {data:session}=await auth.getSession();
 if(!session?.user?.id)return null;
 if(!ncertChapterSlots.some(c=>c.id===chapterId))return {userId:session.user.id,invalid:true};
 return {userId:session.user.id,invalid:false};
}
export async function GET(_request:Request,context:Context){
 const {chapterId}=await context.params;
 const who=await identity(chapterId);
 if(!who)return respond({error:'Sign in required.'},401);
 if(who.invalid)return respond({error:'Unknown chapter.'},404);
 try{
  const sql=getSql();
  const rows=await sql`
   SELECT l.id::text AS learner_id,l.display_name,l.stage,
     p.status,p.parent_note,p.updated_at,p.completed_at
   FROM learners l
   JOIN family_members fm ON fm.family_id=l.family_id
   LEFT JOIN ncert_chapter_progress p ON p.learner_id=l.id AND p.chapter_id=${chapterId}
   WHERE fm.auth_user_id=${who.userId}
   ORDER BY l.created_at,l.id
  `;
  return respond({learners:rows});
 }catch{return respond({error:'Unable to load progress. Check that migration 004 has been applied.'},503);}
}
export async function POST(request:Request,context:Context){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return respond({error:'Same-origin request required.'},403);
 const {chapterId}=await context.params;
 const who=await identity(chapterId);
 if(!who)return respond({error:'Sign in required.'},401);
 if(who.invalid)return respond({error:'Unknown chapter.'},404);
 if(Number(request.headers.get('content-length'))>4000)return respond({error:'Request too large.'},413);
 let payload:unknown;
 try{const raw=await request.text();if(raw.length>4000)return respond({error:'Request too large.'},413);payload=JSON.parse(raw);}catch{return respond({error:'Invalid JSON.'},400);}
 if(!payload||typeof payload!=='object')return respond({error:'Invalid request.'},400);
 const {learnerId,status,note}=payload as Record<string,unknown>;
 if(typeof learnerId!=='string'||learnerId.length>100||!allowed.has(String(status))||typeof note!=='string'||note.length>1000)return respond({error:'Invalid learner, status or note.'},400);
 try{
  const sql=getSql();
  const rows=await sql`
   INSERT INTO ncert_chapter_progress(learner_id,chapter_id,status,parent_note,completed_at)
   SELECT l.id,${chapterId},${status as string},${note},
     CASE WHEN ${status as string}='completed' THEN now() ELSE NULL END
   FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE l.id::text=${learnerId} AND fm.auth_user_id=${who.userId} AND fm.role='owner'
   ON CONFLICT(learner_id,chapter_id) DO UPDATE SET
    status=EXCLUDED.status,parent_note=EXCLUDED.parent_note,updated_at=now(),
    completed_at=CASE WHEN EXCLUDED.status='completed' THEN COALESCE(ncert_chapter_progress.completed_at,now()) ELSE NULL END
   RETURNING status,updated_at
  `;
  if(!rows.length)return respond({error:'Only a family owner may update their learner.'},403);
  return respond({saved:true,status:rows[0].status});
 }catch{return respond({error:'Unable to save progress. Check that migration 004 has been applied.'},503);}
}
