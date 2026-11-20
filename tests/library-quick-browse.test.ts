import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {libraryGradeOptions,librarySubjectOptions,libraryLearningOptions} from '../src/lib/library/grade-options';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('Quick Browse renders original artwork and preserves every catalogue-driven link',()=>{
 const page=read('src/app/library/page.tsx');
 const browse=read('src/app/library/quick-browse.tsx');
 const art=read('public/illustrations/library-quick-browse.svg');
 assert.ok(page.includes('<LibraryQuickBrowse />'));
 assert.ok(browse.includes('src="/illustrations/library-quick-browse.svg"'));
 assert.match(art,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
 assert.ok(art.includes('<title'));
 assert.ok(!art.includes('<image '),'Use vector art rather than a remote raster resource');
 assert.ok(browse.includes('libraryGradeOptions.filter'));
 assert.ok(browse.includes('librarySubjectOptions.map'));
 assert.ok(browse.includes('libraryLearningOptions.map'));
 assert.equal((browse.match(/href=\{option\.href\}/g)??[]).length,4);
 assert.deepEqual(
  libraryGradeOptions.filter(x=>x.label.startsWith('Class ')).map(x=>x.label),
  Array.from({length:10},(_,index)=>`Class ${index+1}`),
 );
 assert.equal(libraryGradeOptions.filter(x=>!x.label.startsWith('Class ')).length,3);
 assert.ok(librarySubjectOptions.length>=6);
 assert.ok(libraryLearningOptions.length>=4);
 assert.ok(browse.includes('href="/ncert-books"'),'All Grades should link to the existing catalogue');
});

test('Quick Browse provides readable grouped, icon-labelled and responsive shortcuts',()=>{
 const browse=read('src/app/library/quick-browse.tsx');
 const css=read('src/app/globals.css');
 for(const section of ['Select Grade','Select Subject','Select Learning Type']){
  assert.ok(browse.includes(section));
 }
 for(const landmark of ['library-browse-banner','library-browse-foundations','library-browse-classes','library-browse-subjects','library-browse-types']){
  assert.ok(browse.includes(landmark));
 }
 assert.ok(browse.includes('aria-labelledby="library-browse-title"'));
 assert.ok(browse.includes('aria-hidden="true" focusable="false"'));
 assert.match(css,/\.library-browse-foundations\s*\{\s*grid-template-columns:\s*repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media \(max-width: 780px\)/);
 assert.match(css,/\.library-browse-classes\s*\{\s*grid-template-columns:\s*repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/\.library-browse-subjects,\s*\.library-browse-types\s*\{\s*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media \(max-width: 365px\)/);
 assert.ok(css.includes('.library-browse-tile:focus-visible'));
 assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
});
