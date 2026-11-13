/**
 * Phase 7 catalogue audit.
 *
 * This is intentionally structural and provenance-focused. It does not probe
 * or manufacture direct PDFs; `officialChapterPdf()` must be explicit for any
 * Phase 7 direct URL, and a portal fallback is valid when none is recorded.
 */
import {
 chaptersFor,ncertTextbooks,officialChapterPdf,textbookAudit,validateNcertCatalogue,
} from '../src/lib/ncert/textbooks';

const phase7Grades=new Set([8,9,10]);
const issues:string[]=[];
const out:string[]=[];
const fail=(message:string)=>issues.push(message);

for(const issue of validateNcertCatalogue())fail(issue);
for(const book of ncertTextbooks){
 if(!phase7Grades.has(book.grade))continue;
 const phase7Record=Boolean(book.directPdfAuditComplete||book.verifiedPdfReferences);
 if(phase7Record){
  if(!book.category)fail(`${book.id}: missing transparent category`);
  if(!book.provenanceUrl?.startsWith('https://ncert.nic.in/'))fail(`${book.id}: missing official provenance URL`);
  if(!book.referenceUrl.startsWith('https://ncert.nic.in/'))fail(`${book.id}: reference is not an official NCERT source`);
  if(book.verifiedPdfChapters!==undefined)fail(`${book.id}: Phase 7 book must not use contiguous PDF derivation`);
 }
 const chapters=chaptersFor(book.id);
 if(book.chapterCount>0&&chapters.some(chapter=>!chapter.verifiedTitle||chapter.status!=='source-verified'))fail(`${book.id}: every indexed slot needs a verified Contents title`);
 for(const chapter of chapters){
  const direct=officialChapterPdf(chapter);
  if(phase7Record&&direct) {
   if(!chapter.officialPdf)fail(`${chapter.id}: direct PDF is not an explicit individual reference`);
   if(!chapter.officialPdf?.url.startsWith('https://ncert.nic.in/textbook/pdf/'))fail(`${chapter.id}: non-official direct PDF`);
  }
  if(chapter.selection==='choose-one'&&(!chapter.selectionGroupId||!chapter.selectionNote))fail(`${chapter.id}: selected alternative lacks a documented source boundary`);
  if(chapter.selection!=='choose-one'&&chapter.selectionGroupId)fail(`${chapter.id}: non-alternative slot has a selection group`);
  if(chapter.selection!=='choose-one'&&chapter.selectionNote&&!['required',undefined].includes(chapter.selection))fail(`${chapter.id}: unexpected selection metadata`);
  if(chapter.officialPdf&&!direct)fail(`${chapter.id}: explicit direct PDF was discarded`);
 }
}

const audit=textbookAudit();
out.push('# NCERT catalogue audit');
out.push(`Generated ${new Date().toISOString()}`);
out.push('');
out.push('## Inventory');
out.push(`- Books: ${audit.books}`);
out.push(`- Numbered chapter slots: ${audit.chapterSlots}`);
out.push(`- Source-verified titles: ${audit.verifiedChapterTitles}`);
out.push(`- Contents-pending books: ${audit.booksPendingContents}`);
out.push(`- Grades covered: ${audit.gradesCovered.join(', ')}`);
out.push('');
out.push('## Phase 7 audit matrix');
out.push('| Grade | Books | Verified Contents items | Default-path items | Select-one alternatives | Direct PDF links (legacy / explicit) | Portal fallback items |');
out.push('|---:|---:|---:|---:|---:|---:|---:|');
for(const grade of [8,9,10]){
 const books=ncertTextbooks.filter(book=>book.grade===grade);
 const slots=books.flatMap(book=>chaptersFor(book.id));
 const direct=slots.filter(slot=>Boolean(officialChapterPdf(slot)));
 const explicit=direct.filter(slot=>Boolean(slot.officialPdf)).length;
 const selected=slots.filter(slot=>slot.selection==='choose-one').length;
 out.push(`| ${grade} | ${books.length} | ${slots.filter(slot=>Boolean(slot.verifiedTitle)).length} | ${slots.length-selected} | ${selected} | ${direct.length-explicit} / ${explicit} | ${slots.length-direct.length} |`);
}
out.push('');
out.push('## Safeguards');
out.push('- A portal fallback means no direct item PDF was individually verified; it is not a broken or inferred link.');
out.push('- Official select-one projects/vocations remain represented as labelled Contents items, not a compulsory linear path.');
out.push('- Literary associated readings, appendices and QR-only extended learning are not silently promoted to chapter slots.');
out.push('- No Class 8–10 Contents item has an automatic mapping, outcome claim or learner-data write.');
out.push('');
out.push('## Result');
if(issues.length){
 out.push(`FAIL (${issues.length} issue${issues.length===1?'':'s'})`);
 for(const issue of issues)out.push(`- ${issue}`);
}else out.push('PASS — structural/provenance safeguards hold.');
console.log(out.join('\n'));
if(issues.length)process.exitCode=1;
