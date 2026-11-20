import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('chapter and study studio use original local SVG illustrations',()=>{
 const chapter=read('src/app/ncert-books/chapter/[chapterId]/page.tsx');
 const studio=read('src/app/ncert-books/chapter/[chapterId]/study-material-studio.tsx');
 const book=read('public/illustrations/chapter-open-book.svg');
 const pdf=read('public/illustrations/study-materials-books.svg');
 assert.ok(chapter.includes('src="/illustrations/chapter-open-book.svg"'));
 assert.ok(studio.includes('src="/illustrations/study-materials-books.svg"'));
 for(const svg of [book,pdf]){
  assert.match(svg,/<svg\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.ok(svg.trimEnd().endsWith('</svg>'));
  assert.ok(!svg.includes('<image '),'illustrations should be vector-only');
 }
});

test('chapter overview keeps source evidence, reading and fallback actions',()=>{
 const page=read('src/app/ncert-books/chapter/[chapterId]/page.tsx');
 const styles=read('src/app/globals.css');
 assert.ok(page.includes('className="chapter-reading-illustration"'));
 assert.ok(page.includes('className="chapter-reading-evidence"'));
 assert.ok(page.includes('mappingLabels[mappingStatus]'));
 assert.ok(page.includes('pdfLabels[pdf.status]'));
 assert.ok(page.includes('href={pdf.href}'));
 assert.ok(page.includes('href={releaseUrl}'));
 assert.ok(page.includes('href={bookHref}'));
 assert.ok(page.includes('readerHref && releaseUrl'));
 assert.match(styles,/\.chapter-reading-actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,minmax\(0,1fr\)\)/s);
});

test('study controls still copy real prompts and retain editable library workflow',()=>{
 const studio=read('src/app/ncert-books/chapter/[chapterId]/study-material-studio.tsx');
 const css=read('src/app/study-material-studio.css');
 assert.ok(studio.includes('buildStudyPrompt('));
 assert.ok(studio.includes('onClick={copy}'));
 assert.ok(studio.includes('navigator.clipboard.writeText(prompt)'));
 assert.ok(studio.includes('onChange={e=>setDifficulty('));
 assert.ok(studio.includes('onChange={e=>setLanguage('));
 assert.ok(studio.includes('setImportOpen(true)'));
 assert.ok(studio.includes('loadLibrary'));
 assert.ok(css.includes('.study-studio-illustration'));
 assert.ok(css.includes('.study-studio-quick-action'));
});

test('progress selectors preserve saving and finished stays automatic',()=>{
 const progress=read('src/app/ncert-books/chapter/[chapterId]/chapter-progress.tsx');
 const css=read('src/app/globals.css');
 assert.ok(progress.includes('chapter-status-heading-icon'));
 assert.ok(progress.includes('aria-pressed={status === item.id}'));
 assert.ok(progress.includes('onClick={() => void save(item.id)}'));
 assert.ok(progress.includes('className="chapter-status-auto"'));
 assert.ok(progress.includes('finishedChapterStatus.detail'));
 assert.ok(progress.includes('onClick={() => void save(manualStatus, true)}'));
 assert.match(css,/\.chapter-status-auto\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
 assert.ok(css.includes('.chapter-status-sticky { position: static;'));
});
