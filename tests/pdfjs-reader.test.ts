import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('continuous PDF reader stacks pages vertically and tracks nearby pages while scrolling',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
  const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');

  assert.match(source,/pdfjs-stage\$\{mode==='continuous'\?' is-continuous':''\}/);
  assert.match(source,/stage\.addEventListener\('scroll',updatePage/);
  assert.match(source,/page\+2\).*page-2/);
  assert.match(source,/getViewport\(\{scale\}\)/);
  assert.match(css,/\.pdfjs-stage\.is-continuous\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(css,/\.pdfjs-stage\s*\{[^}]*overflow:\s*auto/s);
  assert.match(css,/\.pdfjs-stage\.is-continuous\s+\.pdfjs-page\s*\{[^}]*1\.414/s);
});


test('desktop PDF reader can enter fullscreen and resize its page canvas',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
  const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');

  assert.ok(source.includes('requestFullscreen()'));
  assert.ok(source.includes("addEventListener('fullscreenchange'"));
  assert.ok(source.includes('pdfjs-fullscreen-toggle'));
  assert.ok(source.includes('layoutRevision]'));
  assert.ok(source.includes('rangeChunkSize:262144'));
  assert.ok(css.includes('.pdfjs-reader:fullscreen'));
  assert.ok(css.includes('max-height: none'));
  assert.ok(css.includes('@media (max-width: 640px)'));
  assert.ok(css.includes('.pdfjs-fullscreen-toggle { white-space: nowrap; }'));
});


test('mobile PDF reader has compact actions, toolbar and visible fullscreen control',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
  const page=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/page.tsx'),'utf8');
  const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');
  assert.ok(source.includes('aria-label={isFullscreen?'));
  assert.ok(source.includes('pdfjs-previous'));
  assert.ok(source.includes('pdfjs-fit-width'));
  assert.ok(page.includes('ncert-reader-actions'));
  assert.ok(page.includes('ncert-reader-panel'));
  assert.match(css,/\.pdfjs-controls\s*\{\s*display:\s*grid/);
  assert.match(css,/\.pdfjs-fullscreen-toggle\s*\{\s*grid-column:\s*5/);
  assert.ok(css.includes('.pdfjs-reader:fullscreen .pdfjs-stage'));
  assert.ok(!css.includes('.pdfjs-fullscreen-toggle { display: none; }'));
});
