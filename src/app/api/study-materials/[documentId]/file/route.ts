import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{documentId:string}>}){
 const {data}=await auth.getSession();const user=data?.user?.id;
 if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});
 const {documentId}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(documentId))return NextResponse.json({error:'Invalid document.'},{status:400});
 try{
  const sql=getSql();
  const rows=await sql`SELECT p.file_name,p.file_size_bytes,encode(p.file_data,'base64') file_base64 FROM study_material_pdf_files p JOIN study_material_documents d ON d.id=p.document_id JOIN learners l ON l.id=d.learner_id JOIN family_members fm ON fm.family_id=l.family_id WHERE d.id::text=${documentId} AND l.archived_at IS NULL AND fm.auth_user_id=${user} LIMIT 1`;
  if(!rows.length)return NextResponse.json({error:'PDF not found.'},{status:404});
  const bytes=Buffer.from(String(rows[0].file_base64),'base64');
  const name=String(rows[0].file_name).replace(/[\\r\\n"]/g,'-');
  return new NextResponse(bytes,{status:200,headers:{'Content-Type':'application/pdf','Content-Length':String(bytes.length),'Content-Disposition':`inline; filename="${name}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'self'"}});
 }catch{return NextResponse.json({error:'Unable to retrieve this PDF.'},{status:503});}
}
