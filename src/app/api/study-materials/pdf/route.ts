import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {ncertChapterSlots,textbookById,isDefaultChapterSessionEligible} from '@/lib/ncert/textbooks';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const MAX_PDF_BYTES=3*1024*1024;
const send=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function identity(){const {data}=await auth.getSession();return data?.user?.id??null;}
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return send({error:'Same-origin request required.'},403);
 const user=await identity();if(!user)return send({error:'Sign in required.'},401);
 let input:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>4_300_000)return send({error:'Upload request is too large. PDF limit is 3 MB.'},413);input=JSON.parse(raw);}catch{return send({error:'Invalid upload request.'},400);}
 const learnerId=typeof input.learnerId==='string'?input.learnerId:'';
 const chapterId=typeof input.chapterId==='string'?input.chapterId:'';
 const chapter=ncertChapterSlots.find(c=>c.id===chapterId);
 if(!chapter?.verifiedTitle||!isDefaultChapterSessionEligible(chapter))return send({error:'A verified eligible chapter is required.'},400);
 const book=textbookById(chapter.bookId);if(!book)return send({error:'Textbook not found.'},404);
 const title=typeof input.title==='string'?input.title.trim().slice(0,180):'';
 const documentType=typeof input.documentType==='string'?input.documentType.trim().slice(0,80):'';
 const fileName=typeof input.fileName==='string'?input.fileName.replace(/[\\/\\r\\n"]/g,'-').slice(0,220):'';
 const encoded=typeof input.fileBase64==='string'?input.fileBase64:'';
 if(!title||!documentType||!fileName||!encoded)return send({error:'Document details and a PDF file are required.'},400);
 const bytes=Buffer.from(encoded,'base64');
 if(!bytes.length||bytes.length>MAX_PDF_BYTES)return send({error:'PDF files must be between 1 byte and 3 MB.'},413);
 if(bytes.subarray(0,5).toString('ascii')!=='%PDF-')return send({error:'The selected file is not a valid PDF.'},415);
 try{
  const sql=getSql();
  const learners=await sql`SELECT l.id::text id,l.display_name,l.stage FROM learners l JOIN family_members fm ON fm.family_id=l.family_id WHERE l.id::text=${learnerId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} AND fm.role='owner' LIMIT 1`;
  if(!learners.length)return send({error:'Only a family owner can import material for this learner.'},403);


  const inserted=await sql`WITH new_document AS (
    INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference,source_version)
    VALUES ((SELECT id FROM learners WHERE id::text=${learnerId}),${'Class '+book.grade},${book.subject},${book.id},${chapterId},${title},${documentType},'<p>PDF attachment stored in the Study Library.</p>',${chapter.sourceUrl},${book.editionLabel})
    RETURNING id,version
   )
   INSERT INTO study_material_pdf_files(document_id,file_name,mime_type,file_size_bytes,file_data)
   SELECT id,${fileName},'application/pdf',${bytes.length},decode(${bytes.toString('base64')},'base64') FROM new_document
   RETURNING document_id::text id,file_name`;
  return send({saved:true,document:{id:inserted[0].id,fileName:inserted[0].file_name}},201);
 }catch{return send({error:'Unable to store this PDF. Confirm database migration 010 has been applied.'},503);}
}
