import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {
 class5ReviewQueueMetrics,class5Books,filterClass5ReviewQueue,mappingReviewStatuses,
 type MappingReviewStatus,
} from '@/lib/curriculum/class5-mapping';
import {outcomesForGrade} from '@/lib/curriculum/outcome-registry';
import {
 appendMappingReview,readClass5ReviewQueue,type MappingReviewMutation,type MappingSql,
} from '@/lib/curriculum/mapping-review-service';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});

async function userId(){
 const {data:session}=await auth.getSession();
 return session?.user?.id??null;
}
function statusParam(value:string|null):MappingReviewStatus|undefined{
 if(!value)return undefined;
 return (mappingReviewStatuses as readonly string[]).includes(value)?value as MappingReviewStatus:undefined;
}
function isKnownStatus(value:string|null){return !value||statusParam(value)!==undefined;}

/** Owner-scoped Class 5 mapping queue. No family ID is accepted from the client. */
export async function GET(request:Request){
 const user=await userId();
 if(!user)return respond({error:'Sign in required'},401);
 try{
  const queue=await readClass5ReviewQueue(getSql() as unknown as MappingSql,user);
  if(!queue.authorized)return respond({error:'Only a family owner can inspect curriculum mapping reviews.'},403);
  const url=new URL(request.url);
  const bookId=url.searchParams.get('book')??'';
  const chapterId=url.searchParams.get('chapter')??'';
  const subject=url.searchParams.get('subject')??'';
  const rawStatus=url.searchParams.get('status');
  const validBook=!bookId||class5Books.some(book=>book.id===bookId);
  const validChapter=!chapterId||queue.items.some(item=>item.chapter.chapterId===chapterId);
  const validSubject=!subject||class5Books.some(book=>book.subject===subject);
  if(!validBook||!validChapter||!validSubject||!isKnownStatus(rawStatus))return respond({error:'Invalid Class 5 mapping filter.'},400);
  const items=filterClass5ReviewQueue(queue.items,{grade:5,bookId:bookId||undefined,chapterId:chapterId||undefined,subject:subject||undefined,status:statusParam(rawStatus)});
  return respond({
   items,
   summary:class5ReviewQueueMetrics(queue.items),
   outcomes:outcomesForGrade(5),
   books:class5Books.map(book=>({id:book.id,title:book.title,subject:book.subject,editionLabel:book.editionLabel,sourceUrl:book.sourceUrl})),
  });
 }catch{
  return respond({error:'Curriculum mapping storage is not ready. Apply migration 008 before using the review queue.'},503);
 }
}

/** Append a family-owned review revision. Seed proposals can never self-approve. */
export async function POST(request:Request){
 const actual=new URL(request.url);
 const origin=request.headers.get('origin');
 const host=request.headers.get('host');
 // Reverse proxies may rewrite the internal request scheme while preserving the
 // public Host/X-Forwarded-Proto seen by the browser. The browser-controlled
 // Origin must still exactly match that public origin.
 const forwardedProtocol=request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
 const protocol=forwardedProtocol==='https'||forwardedProtocol==='http'?forwardedProtocol:actual.protocol.replace(':','');
 if(!origin||!host||origin!==`${protocol}://${host}`)return respond({error:'Same-origin request required.'},403);
 const user=await userId();
 if(!user)return respond({error:'Sign in required'},401);
 if(Number(request.headers.get('content-length'))>12000)return respond({error:'Review request is too large.'},413);
 const raw=await request.text();
 if(raw.length>12000)return respond({error:'Review request is too large.'},413);
 let body:unknown;
 try{body=JSON.parse(raw);}catch{return respond({error:'Invalid JSON.'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return respond({error:'Invalid review request.'},400);
 try{
  const result=await appendMappingReview(getSql() as unknown as MappingSql,user,body as MappingReviewMutation);
  if(!result.ok)return respond({error:result.message},result.code==='forbidden'?403:400);
  return respond({saved:true,revision:result.revision},201);
 }catch{
  return respond({error:'Unable to save this mapping review. Confirm migration 008 is applied and try again.'},503);
 }
}
