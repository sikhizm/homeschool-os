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

  assert.match(source,/requestFullscreen\(\)/);
  assert.match(source,/addEventListener\('fullscreenchange'/);
  assert.match(source,/pdfjs-fullscreen-toggle/);
  assert.match(source,/layoutRevision\]\)/);
  assert.match(source,/rangeChunkSize:262144/);
  assert.match(css,/\.pdfjs-reader:fullscreen\s*\{[^}]*height:\s*100vh/s);
  assert.match(css,/\.pdfjs-reader:fullscreen\s+\.pdfjs-stage\s*\{[^}]*max-height:\s*none/s);
  assert.match(css,/@media \(max-width: 640px\)/);
  assert.match(css,/\.pdfjs-fullscreen-toggle\s*\{\s*display:\s*none/);
});
