import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {ncertChapterSlots,textbookById,isDefaultChapterSessionEligible} from '@/lib/ncert/textbooks';
import {sanitizeStudyHtml,markdownToSafeHtml} from '@/lib/study-materials/sanitize';
export const runtime='nodejs';export const dynamic='force-dynamic';
const send=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const source=(chapterId:string)=>{const c=ncertChapterSlots.find(x=>x.id===chapterId);if(!c?.verifiedTitle||!isDefaultChapterSessionEligible(c))return null;const b=textbookById(c.bookId);return b?{chapter:c,book:b}:null;};
async function identity(){const {data}=await auth.getSession();return data?.user?.id??null;}
async function learnerAccess(sql:ReturnType<typeof getSql>,user:string,learnerId:string,owner=false){
 return sql`SELECT l.id::text id,l.display_name,l.stage,fm.role FROM learners l JOIN family_members fm ON fm.family_id=l.family_id WHERE l.id::text=${learnerId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} AND (${!owner} OR fm.role='owner') LIMIT 1`;
}
export async function GET(request:Request){
 const user=await identity();if(!user)return send({error:'Sign in required.'},401);
 const url=new URL(request.url),documentId=url.searchParams.get('documentId'),learnerId=url.searchParams.get('learnerId');
 try{const sql=getSql();
 if(documentId){const rows=await sql`SELECT d.id::text,d.learner_id::text,d.grade,d.subject,d.book_id,d.chapter_id,d.title,d.document_type,d.safe_html,d.source_reference,d.source_version,d.version,d.approval_status,d.archived_at,d.created_at,d.updated_at,l.display_name FROM study_material_documents d JOIN learners l ON l.id=d.learner_id JOIN family_members fm ON fm.family_id=l.family_id WHERE d.id::text=${documentId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} LIMIT 1`;if(!rows.length)return send({error:'Document not found.'},404);const metadata=source(String(rows[0].chapter_id));return send({document:{...rows[0],book_title:metadata?.book.title??String(rows[0].book_id),chapter_title:metadata?.chapter.verifiedTitle??String(rows[0].chapter_id)}});}
 if(!learnerId||learnerId.length>100)return send({error:'Choose a learner.'},400);
 const learners=await learnerAccess(sql,user,learnerId);if(!learners.length)return send({error:'Learner not found in your family.'},404);
 const rows=await sql`SELECT id::text,learner_id::text,grade,subject,book_id,chapter_id,title,document_type,source_reference,source_version,version,approval_status,archived_at,created_at,updated_at FROM study_material_documents WHERE learner_id::text=${learnerId} ORDER BY archived_at NULLS FIRST,updated_at DESC`;
 return send({learner:learners[0],documents:rows});}catch{return send({error:'Study library is not ready. Apply migration 009.'},503);}
}
export async function POST(request:Request){
 const url=new URL(request.url);if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required.'},403);
 const user=await identity();if(!user)return send({error:'Sign in required.'},401);
 let input:Record<string,unknown>;try{const raw=await request.text();if(raw.length>520_000)return send({error:'Request too large.'},413);input=JSON.parse(raw);}catch{return send({error:'Invalid JSON.'},400);}
 const learnerId=typeof input.learnerId==='string'?input.learnerId:'';const chapterId=typeof input.chapterId==='string'?input.chapterId:'';const meta=source(chapterId);
 if(!learnerId||!meta)return send({error:'A verified eligible chapter and learner are required.'},400);
 const title=typeof input.title==='string'?input.title.trim().slice(0,180):'';const type=typeof input.documentType==='string'?input.documentType.trim().slice(0,80):'';
 if(!title||!type)return send({error:'Enter a title and document type.'},400);
 let content='';try{content=typeof input.content==='string'?(input.format==='markdown'?markdownToSafeHtml(input.content):sanitizeStudyHtml(input.content)):'';}catch(e){return send({error:e instanceof Error?e.message:'Invalid document content.'},400);}if(!content)return send({error:'Document content is required.'},400);
 try{const sql=getSql();const learners=await learnerAccess(sql,user,learnerId,true);if(!learners.length)return send({error:'Only a family owner can save study materials for their learner.'},403);
 const learner=learners[0];if(String(learner.stage)!==`Class ${meta.book.grade}`)return send({error:'This learner is enrolled in a different class.'},403);
 if(typeof input.duplicateOf==='string'){
  const originals=await sql`SELECT title,document_type,safe_html,source_reference,source_version FROM study_material_documents WHERE id::text=${input.duplicateOf} AND learner_id::text=${learnerId} AND chapter_id=${chapterId} AND archived_at IS NULL LIMIT 1`;
  if(!originals.length)return send({error:'Document to duplicate was not found.'},404);
  const o=originals[0];const rows=await sql`INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference,source_version) VALUES ((SELECT id FROM learners WHERE id::text=${learnerId}),${learner.stage},${meta.book.subject},${meta.book.id},${chapterId},${`${String(o.title)} (copy)`.slice(0,180)},${String(o.document_type)},${String(o.safe_html)},${String(o.source_reference)},${String(o.source_version)}) RETURNING id::text,version`;
  return send({saved:true,document:rows[0]},201);
 }
 const rows=await sql`INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference,source_version) VALUES ((SELECT id FROM learners WHERE id::text=${learnerId}),${learner.stage},${meta.book.subject},${meta.book.id},${chapterId},${title},${type},${content},${meta.chapter.sourceUrl},${meta.book.editionLabel}) RETURNING id::text,version`;
 return send({saved:true,document:rows[0]},201);
 }catch{return send({error:'Unable to save this document. Check that migration 009 has been applied.'},503);}
}
export async function PATCH(request:Request){
 const url=new URL(request.url);if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required.'},403);
 const user=await identity();if(!user)return send({error:'Sign in required.'},401);
 let b:Record<string,unknown>;try{const raw=await request.text();if(raw.length>520_000)return send({error:'Request too large.'},413);b=JSON.parse(raw);}catch{return send({error:'Invalid JSON.'},400);}
 if(typeof b.documentId!=='string'||b.documentId.length>50)return send({error:'Invalid document.'},400);
 try{const sql=getSql();const found=await sql`SELECT d.id::text,d.learner_id::text,d.title,d.document_type,d.safe_html,d.version,l.stage,l.display_name,fm.role FROM study_material_documents d JOIN learners l ON l.id=d.learner_id JOIN family_members fm ON fm.family_id=l.family_id WHERE d.id::text=${b.documentId} AND fm.auth_user_id=${user} AND l.archived_at IS NULL LIMIT 1`;
 if(!found.length)return send({error:'Document not found.'},404);const d=found[0];if(d.role!=='owner')return send({error:'Only a family owner can edit study materials.'},403);
 if(b.action==='archive'||b.action==='restore'){await sql`UPDATE study_material_documents SET archived_at=${b.action==='archive'?new Date().toISOString():null},updated_at=now() WHERE id::text=${b.documentId} AND learner_id::text=${String(d.learner_id)}`;return send({saved:true});}
 if(b.action==='delete'){await sql`DELETE FROM study_material_documents WHERE id::text=${b.documentId} AND learner_id::text=${String(d.learner_id)}`;return send({deleted:true});}
 if(b.action==='approve'){await sql`UPDATE study_material_documents SET approval_status='approved',updated_at=now() WHERE id::text=${b.documentId} AND learner_id::text=${String(d.learner_id)}`;return send({saved:true});}
 if(b.action!=='edit')return send({error:'Unsupported action.'},400);
 const title=typeof b.title==='string'?b.title.trim().slice(0,180):'';const type=typeof b.documentType==='string'?b.documentType.trim().slice(0,80):'';if(!title||!type)return send({error:'Enter a title and type.'},400);
 const content=typeof b.content==='string'?(b.format==='markdown'?markdownToSafeHtml(b.content):sanitizeStudyHtml(b.content)):'';if(!content)return send({error:'Document content is required.'},400);
 await sql`INSERT INTO study_material_versions(document_id,learner_id,version,title,document_type,safe_html) VALUES ((SELECT id FROM study_material_documents WHERE id::text=${b.documentId}), (SELECT id FROM learners WHERE id::text=${String(d.learner_id)}),${Number(d.version)},${String(d.title)},${String(d.document_type)},${String(d.safe_html)})`;
 const next=await sql`UPDATE study_material_documents SET title=${title},document_type=${type},safe_html=${content},version=version+1,updated_at=now(),approval_status='pending' WHERE id::text=${b.documentId} AND learner_id::text=${String(d.learner_id)} RETURNING version`;
 return send({saved:true,version:next[0].version});
 }catch{return send({error:'Unable to update the study document. Check migration 009.'},503);}
}
