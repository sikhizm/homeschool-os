import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
 ncertTextbooks,familyLibraryTextbooks,selectFamilyLibraryTextbooks,
 familyLibraryGradeCoverage,familyLibraryAudit,chaptersFor,
} from '../src/lib/ncert/textbooks';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('Urdu books do not appear in family-facing catalogue while source records remain intact',()=>{
 const urdu=ncertTextbooks.filter(book=>book.language.toLowerCase()==='urdu');
 assert.ok(urdu.length>0,'Retain existing official source records');
 assert.ok(familyLibraryTextbooks.length<ncertTextbooks.length);
 assert.ok(familyLibraryTextbooks.every(book=>book.language.toLowerCase()!=='urdu'));
 for(let grade=1;grade<=10;grade++){
  const selected=selectFamilyLibraryTextbooks(grade);
  assert.ok(selected.every(book=>book.language.toLowerCase()!=='urdu'),`Class ${grade}`);
  assert.equal(familyLibraryGradeCoverage().find(row=>row.grade===grade)?.cataloguedBooks,selected.length);
 }
 const visible=new Set(familyLibraryTextbooks.map(book=>book.id));
 const relevant=ncertTextbooks.flatMap(book=>visible.has(book.id)?chaptersFor(book.id):[]);
 assert.equal(familyLibraryAudit().books,familyLibraryTextbooks.length);
 assert.equal(familyLibraryAudit().chapterSlots,relevant.length);
 for(const book of urdu)assert.ok(!visible.has(book.id));
});

test('NCERT UI uses family-only counts and never offers Urdu editions in its dropdown',()=>{
 const page=read('src/app/ncert-books/page.tsx');
 const quick=read('src/lib/library/grade-options.ts');
 assert.ok(page.includes('selectFamilyLibraryTextbooks(selectedGrade,subject)'));
 assert.ok(page.includes('const stats=familyLibraryAudit()'));
 assert.ok(quick.includes('familyLibraryTextbooks'));
 assert.ok(quick.includes('familyLibraryGradeCoverage()'));
 assert.ok(!page.includes('The separate NCERT Urdu publication catalogue'));
});

test('Olympiad redesign preserves filters, PDF paths and three planning intents',()=>{
 const page=read('src/app/library/olympiad/olympiad-view.tsx');
 const css=read('src/app/library/olympiad/olympiad.css');
 for(const filter of ['name="grade"','name="subject"','name="provider"','name="q"'])assert.ok(page.includes(filter));
 assert.ok(page.includes('olympiadPdfHref(resource, false)'));
 assert.ok(page.includes('olympiadPdfHref(resource)'));
 assert.ok(page.includes('ResourcePlanActions'));
 assert.ok(page.includes('className="olympiad-hero"'));
 assert.ok(page.includes('className="olympiad-grid"'));
 assert.ok(page.includes('className="olympiad-filter-card"'));
 assert.ok(page.includes('<details className="olympiad-verification">'));
 assert.ok(css.includes('@media (max-width: 650px)'));
 assert.ok(css.includes('grid-template-columns: minmax(0,1fr);'));
});

test('Supplementary Resources keeps direct book links with responsive class groups',()=>{
 const page=read('src/app/library/enrichment/enrichment-view.tsx');
 const route=read('src/app/library/enrichment/page.tsx');
 const css=read('src/app/library/enrichment/enrichment.css');
 assert.ok(page.includes('const punjabiBooks = ['));
 assert.ok(page.includes('bookGroups.map'));
 assert.ok(page.includes('group.books.map'));
 assert.ok(page.includes('href={book.url} target="_blank" rel="noopener noreferrer"'));
 assert.ok(page.includes('Class {book.grade} · Punjabi'));
 assert.ok(page.includes('id={\'enrichment-\'+group.id}'));
 assert.ok(route.includes("import './enrichment.css'"));
 assert.ok(css.includes('.enrichment-hero'));
 assert.ok(css.includes('.enrichment-book-card'));
 assert.ok(css.includes('@media (max-width: 650px)'));
});
