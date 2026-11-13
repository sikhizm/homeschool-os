/**
 * Phase 5 representative curriculum audit (issue #45).
 *
 * Run: npx tsx scripts/curriculum-audit.ts [--offline]
 *
 * Samples books and Contents items across Classes 1–10 and multiple subjects, then:
 *  1. validates catalogue structure (no fabricated verified flags, stable ids);
 *  2. checks every sampled chapter's metadata and derived session guidance;
 *  3. asserts original-guidance guardrails (no invented answers, official text
 *     stays external, age-appropriate session lengths);
 *  4. probes official NCERT/CIET links and records the exact network result,
 *     including TLS-chain problems, without silently treating them as pass.
 *
 * Structural failures exit non-zero. Network results are recorded, not gated,
 * because NCERT's TLS behaviour varies by network and must be reported honestly.
 */
import https from 'node:https';
import {ncertTextbooks,ncertChapterSlots,chaptersFor,officialChapterPdf,validateNcertCatalogue,textbookAudit} from '../src/lib/ncert/textbooks';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';

const offline=process.argv.includes('--offline');
const SUBJECT_PRIORITY=['Mathematics','English','Hindi','Science','Environmental Studies','Social Science','Urdu','Arts','Physical Education'];

type BookCheck={bookId:string;grade:number;subject:string;title:string;chaptersSampled:number;issues:string[]};
type LinkResult={url:string;strict:string;lenient:string;final:string};

function sampleBooks(){
 const picked:BookCheck[]=[];
 for(let grade=1;grade<=10;grade++){
  const books=ncertTextbooks.filter(b=>b.grade===grade&&b.chapterCount>0);
  const bySubject=new Map<string,typeof books>();
  for(const b of books){const list=bySubject.get(b.subject)??[];list.push(b);bySubject.set(b.subject,list);}
  const subjects=[...bySubject.keys()].sort((a,b)=>SUBJECT_PRIORITY.indexOf(a)-SUBJECT_PRIORITY.indexOf(b));
  const chosen=subjects.slice(0,3).map(s=>bySubject.get(s)![0]);
  for(const book of chosen)picked.push({bookId:book.id,grade:book.grade,subject:book.subject,title:book.title,chaptersSampled:0,issues:[]});
 }
 return picked;
}

function sampleChapters(bookId:string){
 const chapters=chaptersFor(bookId);
 if(!chapters.length)return [];
 const idx=new Set([0,Math.floor((chapters.length-1)/2),chapters.length-1]);
 return [...idx].sort((a,b)=>a-b).map(i=>chapters[i]);
}

function probe(url:string,rejectUnauthorized:boolean):Promise<string>{
 return new Promise(resolve=>{
  const request=https.get(url,{rejectUnauthorized,timeout:20000,headers:{'User-Agent':'Mozilla/5.0 (compatible; HomeschoolOS-CurriculumAudit/1.0)'}},response=>{
   response.resume();
   resolve(String(response.statusCode));
  });
  request.on('timeout',()=>{request.destroy();resolve('timeout');});
  request.on('error',error=>resolve('error: '+((error as NodeJS.ErrnoException).code??error.message)));
 });
}

async function probeLink(url:string):Promise<LinkResult>{
 if(offline)return {url,strict:'skipped(offline)',lenient:'skipped(offline)',final:'skipped'};
 const strict=await probe(url,true);
 const lenient=strict.startsWith('2')||strict.startsWith('3')?strict:await probe(url,false);
 return {url,strict,lenient,final:lenient};
}

async function main(){
 const out:string[]=[];
 const fail=(message:string)=>{out.push('  ✗ '+message);structuralFailures+=1;};
 let structuralFailures=0;

 out.push('# Curriculum audit — representative sample across Classes 1–10');
 out.push(`Run at ${new Date().toISOString()} · offline=${offline}`);

 // 1. Structural integrity
 out.push('\n## 1. Catalogue structure');
 const issues=validateNcertCatalogue();
 if(issues.length)issues.forEach(fail);else out.push('  ✓ validateNcertCatalogue() returned no issues');
 const audit=textbookAudit();
 out.push(`  books=${audit.books} chapterSlots=${audit.chapterSlots} verifiedTitles=${audit.verifiedChapterTitles} pendingContents=${audit.booksPendingContents} grades=${audit.gradesCovered.join(',')}`);
 const fabricated=ncertChapterSlots.filter(c=>(c.status==='source-verified')&&!c.verifiedTitle);
 if(fabricated.length)fail(`${fabricated.length} slots claim verification without a title`);else out.push('  ✓ no slot claims source-verified without a title');
 const unverifiedPdf=ncertChapterSlots.filter(c=>c.status!=='source-verified'&&officialChapterPdf(c));
 if(unverifiedPdf.length)fail(`${unverifiedPdf.length} unverified slots expose a guessed PDF link`);else out.push('  ✓ unverified slots never receive a guessed PDF link');
 const dupIds=new Set<string>();
 for(const c of ncertChapterSlots){if(dupIds.has(c.id))fail('duplicate chapter id '+c.id);dupIds.add(c.id);}

 // 2 + 3. Sampled chapters and lesson-guidance guardrails
 out.push('\n## 2. Representative chapter sample (grades 1–10, multiple subjects)');
 const samples=sampleBooks();
 const linkTargets:string[]=[];
 for(const sample of samples){
  const chapters=sampleChapters(sample.bookId);
  sample.chaptersSampled=chapters.length;
  for(const chapter of chapters){
   if(!chapter.verifiedTitle)fail(`${chapter.id}: sampled chapter has no verified title`);
   if(chapter.mappingStatus==='human-reviewed'&&!chapter.skillIds.length)fail(`${chapter.id}: reviewed mapping without skills`);
  }
  const book=ncertTextbooks.find(b=>b.id===sample.bookId)!;
  linkTargets.push(book.sourceUrl);
  const middle=chapters[Math.floor(chapters.length/2)];
  const pdf=middle?officialChapterPdf(middle):null;
  if(pdf)linkTargets.push(pdf);
  if(book.referenceUrl.startsWith('https://ciet.ncert.gov.in/'))linkTargets.push(book.referenceUrl);
 }
 for(const s of samples)out.push(`  Class ${s.grade} · ${s.subject.padEnd(24)} · ${s.title} (${s.chaptersSampled} chapters sampled)`);

 out.push('\n## 3. Lesson-guidance guardrails (original guidance, no invented content)');
 for(const grade of [1,2,3,4,5,6,7,8,9,10]){
  const stage='Class '+grade;
  const catalogue=queueCatalogue(stage);
  const chapterTasks=catalogue.filter(t=>t.id.startsWith('ncert:'));
  if(!chapterTasks.length){fail(stage+': no chapter sessions generated');continue;}
  let problems=0;
  for(const task of chapterTasks){
   const lesson=task.lesson;
   if(!lesson){problems++;continue;}
   const text=[lesson.prep,lesson.steps.join(' '),lesson.expectedAnswer].join(' ');
   if(!task.source.includes('official text accessed externally'))problems++;
   if(!task.source.includes('original parent-led'))problems++;
   if(!/official (ncert )?(chapter|textbook|ncert chapter pdf|project|unit|resource)/i.test(text))problems++;
   if(/the answer is|correct answer:|answer key/i.test(lesson.expectedAnswer))problems++;
   const minutes=task.id.endsWith(':read')?15:task.id.endsWith(':practice')?20:10;
   if(task.minutes>minutes)problems++;
  }
  if(problems)fail(`${stage}: ${problems} chapter sessions failed guidance guardrails`);
  else out.push(`  ✓ ${stage}: ${chapterTasks.length} chapter sessions reference the official chapter, carry original-guidance labels, invent no answers, and keep age-appropriate lengths (≤15/20/10 min)`);
 }

 // 4. Official link probe
 out.push('\n## 4. Official resource links (network probe, recorded verbatim)');
 const unique=[...new Set(linkTargets)];
 const results:LinkResult[]=[];
 for(let i=0;i<unique.length;i+=4){
  const batch=await Promise.all(unique.slice(i,i+4).map(probeLink));
  results.push(...batch);
 }
 for(const r of results){
  const mark=r.final.startsWith('2')?'✓':'⚠';
  out.push(`  ${mark} ${r.final} (strict=${r.strict}) ${r.url}`);
 }
 const blocked=results.filter(r=>!r.final.startsWith('2')&&!r.final.startsWith('3'));
 if(blocked.length)out.push(`  note: ${blocked.length} link(s) could not be confirmed from this network — recorded, not marked verified.`);
 const tlsOnly=results.filter(r=>!r.strict.startsWith('2')&&!r.strict.startsWith('3')&&r.lenient.startsWith('2'));
 if(tlsOnly.length)out.push(`  note: ${tlsOnly.length} ncert.nic.in link(s) returned 200 only when the server's incomplete TLS chain (missing intermediate) was tolerated.`);

 out.push('\n## Summary');
 out.push(`  structural failures: ${structuralFailures}`);
 out.push(`  sampled books: ${samples.length} across grades 1–10`);
 out.push(`  links probed: ${results.length} (${results.filter(r=>r.final.startsWith('2')).length} confirmed 2xx, ${blocked.length} unresolved)`);
 out.push('  This sample does not claim complete NCERT coverage: the catalogue is a partial Classes 1–10 inventory.');
 console.log(out.join('\n'));
 if(structuralFailures)process.exitCode=1;
}

main().catch(error=>{console.error(error);process.exitCode=1;});
