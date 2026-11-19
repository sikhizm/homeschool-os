import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {ncertChapterSlots} from '@/lib/ncert/textbooks';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
import {passingChapters} from '@/lib/ncert/passing-chapters';
import {chapterStatuses} from '@/lib/ncert/chapter-status';
const allowed=new Set<string>(['assigned','in_progress','completed',...chapterStatuses.map(status=>status.id)]);
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
   SELECT l.id::text AS learner_id,l.display_name,l.stage,fm.role,
     p.status,p.parent_note,p.updated_at,p.completed_at
   FROM learners l
   JOIN family_members fm ON fm.family_id=l.family_id
   LEFT JOIN ncert_chapter_progress p ON p.learner_id=l.id AND p.chapter_id=${chapterId}
   WHERE fm.auth_user_id=${who.userId} AND l.archived_at IS NULL
   ORDER BY l.created_at,l.id
  `;
  const passes = await passingChapters(sql, rows.map(row => String(row.learner_id)), chapterId);
  const passed = new Set(passes.map(row => String(row.learner_id)));
  return respond({learners:rows.map(row => ({...row, finished: passed.has(String(row.learner_id))}))});
 }catch{return respond({error:'Unable to load progress. Check that the NCERT chapter status migrations have been applied.'},503);}
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
 const {learnerId,status,note,noteOnly=false}=payload as Record<string,unknown>;
 if(typeof learnerId!=='string'||learnerId.length>100||!allowed.has(String(status))||typeof noteOnly!=='boolean'||typeof note!=='string'||note.length>1000)return respond({error:'Invalid learner, status or note.'},400);
 try{
  const sql=getSql();
  const rows=await sql`
   INSERT INTO ncert_chapter_progress(learner_id,chapter_id,status,parent_note,completed_at)
   SELECT l.id,${chapterId},${status as string},${note},
     CASE WHEN ${status as string} IN ('completed','read') THEN now() ELSE NULL END
   FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
   WHERE l.id::text=${learnerId} AND fm.auth_user_id=${who.userId} AND fm.role='owner' AND l.archived_at IS NULL
   ON CONFLICT(learner_id,chapter_id) DO UPDATE SET
    status=CASE WHEN ${noteOnly} THEN ncert_chapter_progress.status ELSE EXCLUDED.status END,
    parent_note=EXCLUDED.parent_note,
    updated_at=CASE WHEN ${noteOnly} THEN ncert_chapter_progress.updated_at ELSE now() END,
    completed_at=CASE
     WHEN ${noteOnly} THEN ncert_chapter_progress.completed_at
     WHEN EXCLUDED.status IN ('completed','read') THEN now()
     WHEN EXCLUDED.status IN ('revision_due','revised','needs_practice') THEN ncert_chapter_progress.completed_at
     ELSE NULL END
   RETURNING status,updated_at
  `;
  if(!rows.length)return respond({error:'Only a family owner may update their learner.'},403);
  return respond({saved:true,status:rows[0].status});
 }catch(error){
  const code = (error as {code?: string})?.code;
  if(code==='42P01'||(code==='23514'&&(error as {constraint?: string}).constraint==='ncert_chapter_progress_status_check'))
   return respond({error:'Chapter status storage is unavailable or needs its database migration.'},503);
  console.error('[chapter-progress] Save failed', code??'unknown');
  return respond({error:'Unable to save chapter progress. Try again.'},503);
 }
}
