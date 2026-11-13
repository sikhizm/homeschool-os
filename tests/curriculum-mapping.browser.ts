import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {
 class5Books,class5MappingProposalById,class5ReviewQueue,class5ReviewQueueMetrics,
 filterClass5ReviewQueue,type MappingRevision,type MappingReviewStatus,
} from '../src/lib/curriculum/class5-mapping';
import {outcomesForGrade} from '../src/lib/curriculum/outcome-registry';

/** Browser coverage for the parent-only Class 5 review experience. The server
 * is an isolated in-process fixture; no production family or learner data is used. */
test('Class 5 mapping review renders evidence, records an explicit approval, and remains responsive',async()=>{
 const bundle=await build({
  stdin:{
   contents:`import React from 'react';import{createRoot}from'react-dom/client';import Review from './src/app/curriculum-mapping/curriculum-mapping-review';createRoot(document.getElementById('app')).render(<Review/>);`,
   resolveDir:process.cwd(),loader:'tsx',
  },bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{name:'test-link',setup(buildApi){
   buildApi.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'test'}));
   buildApi.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`import React from 'react';export default function Link({href,children,...rest}){return React.createElement('a',{href,...rest},children);}`,resolveDir:process.cwd(),loader:'jsx'}));
  }}],
 });
 const css=(await readFile('src/app/globals.css','utf8')).replace("@import 'tailwindcss';",'');
 const revisions:MappingRevision[]=[];
 const statusFor=(action:string):MappingReviewStatus=>action==='approve'?'approved':action==='reject'?'rejected':action==='mark_unmapped'?'unmapped':action==='submit_for_review'?'in_review':'draft';
 const body=()=>({
  items:class5ReviewQueue(revisions),summary:class5ReviewQueueMetrics(class5ReviewQueue(revisions)),
  outcomes:outcomesForGrade(5),books:class5Books.map(book=>({id:book.id,title:book.title,subject:book.subject,editionLabel:book.editionLabel,sourceUrl:book.sourceUrl})),
 });
 const server=createServer(async(request,response)=>{
  const url=new URL(request.url??'/','http://localhost');
  if(url.pathname==='/api/curriculum-mappings'&&request.method==='GET'){
   const queue=class5ReviewQueue(revisions);
   const status=url.searchParams.get('status') as MappingReviewStatus|null;
   const filtered=filterClass5ReviewQueue(queue,{grade:5,subject:url.searchParams.get('subject')??undefined,bookId:url.searchParams.get('book')??undefined,chapterId:url.searchParams.get('chapter')??undefined,status:status??undefined});
   response.setHeader('Content-Type','application/json');
   response.end(JSON.stringify({...body(),items:filtered}));
   return;
  }
  if(url.pathname==='/api/curriculum-mappings'&&request.method==='POST'){
   const chunks:Buffer[]=[];
   for await(const chunk of request)chunks.push(Buffer.from(chunk));
   const input=JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string,unknown>;
   const proposal=class5MappingProposalById(String(input.mappingId));
   if(!proposal){response.statusCode=400;response.end(JSON.stringify({error:'Unknown mapping'}));return;}
   if(input.action==='approve'&&input.confirmedHumanReview!==true){response.statusCode=400;response.end(JSON.stringify({error:'Human review confirmation required'}));return;}
   const previous=revisions.filter(revision=>revision.mappingId===proposal.id).sort((a,b)=>b.revision-a.revision)[0];
   const currentStatus=statusFor(String(input.action));
   revisions.push({
    id:`browser-${proposal.id}-${(previous?.revision??0)+1}`,mappingId:proposal.id,revision:(previous?.revision??0)+1,
    grade:5,bookId:proposal.bookId,chapterId:proposal.chapterId,
    outcomeId:currentStatus==='unmapped'?null:String(input.outcomeId??previous?.outcomeId??proposal.outcomeId),
    relationshipType:currentStatus==='unmapped'?null:String(input.relationshipType??previous?.relationshipType??proposal.relationshipType) as MappingRevision['relationshipType'],
    reviewStatus:currentStatus,sourceUrl:String(input.sourceUrl??previous?.sourceUrl??proposal.sourceUrl),sourceEdition:String(input.sourceEdition??previous?.sourceEdition??proposal.sourceEdition),
    evidenceReference:String(input.evidenceReference??previous?.evidenceReference??proposal.evidenceReference),chapterEvidence:String(input.chapterEvidence??previous?.chapterEvidence??proposal.chapterEvidence),
    rationale:String(input.rationale??previous?.rationale??proposal.rationale),reviewReason:String(input.reviewReason??''),actorUserId:'fixture-owner',
    reviewerUserId:['approved','rejected','unmapped'].includes(currentStatus)?'fixture-owner':null,
    reviewedAt:['approved','rejected','unmapped'].includes(currentStatus)?new Date().toISOString():null,
    supersedesId:previous?.id??null,createdAt:new Date().toISOString(),
   });
   response.statusCode=201;response.setHeader('Content-Type','application/json');response.end(JSON.stringify({saved:true}));return;
  }
  if(url.pathname==='/bundle.js'){response.setHeader('Content-Type','text/javascript');response.end(bundle.outputFiles[0].text);return;}
  response.setHeader('Content-Type','text/html');
  response.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`);
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();assert.ok(address&&typeof address==='object');
 let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:980}});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.getByRole('heading',{name:'Class 5 outcome mapping'}).waitFor();
  await page.getByText('Verified Class 5 chapters accounted for').waitFor();
  await page.getByText('Draft mapping proposals').waitFor();
  assert.equal(await page.locator('.mapping-review-card').count(),86,'all Class 5 chapter accounts render');
  await page.getByRole('button',{name:'Inspect / edit draft'}).first().click();
  await page.getByRole('heading',{name:'Edit before deciding'}).waitFor();
  await page.getByRole('button',{name:'Approve after review'}).click();
  await page.getByText('Confirm that you inspected the source and rationale before approving.').waitFor();
  await page.getByRole('checkbox',{name:/I inspected the source/i}).check();
  await page.getByLabel(/Review decision note/).fill('I reviewed the official source, edition, chapter evidence and original-outcome rationale.');
  await page.getByRole('button',{name:'Approve after review'}).click();
  await page.getByText('Approval recorded in this family’s audit history.').waitFor();
  await page.locator('.status-approved').first().waitFor();
  await page.screenshot({path:'/tmp/homeschool-curriculum-mapping-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mapping cards do not overflow a mobile viewport');
  await page.screenshot({path:'/tmp/homeschool-curriculum-mapping-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'no client-side errors');
 }finally{await browser?.close();server.close();}
});
