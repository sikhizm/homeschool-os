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


test('immersive mobile reader uses icon fullscreen and minimal overlay controls',()=>{
 const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
 const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');
 assert.ok(source.includes('pdfjs-mobile-label'));
 assert.ok(source.includes("isFullscreen?'✕':'⛶'"));
 assert.ok(source.includes('aria-label="Next page"'));
 assert.ok(css.includes('.pdfjs-reader:fullscreen .pdfjs-controls'));
 assert.ok(css.includes('.pdfjs-reader:fullscreen .pdfjs-mode-switch'));
 assert.ok(css.includes('.pdfjs-reader:fullscreen .pdfjs-stage'));
 assert.ok(css.includes('env(safe-area-inset-bottom)'));
});


test('PDF.js canvas rendering is serialized across fullscreen and zoom changes',()=>{
 const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
 assert.ok(source.includes('WeakMap<HTMLCanvasElement,Promise<void>>'));
 assert.ok(source.includes('if(previous)await previous.catch(()=>{})'));
 assert.ok(source.includes('canvasJobs.current.set(canvas,job)'));
 assert.ok(source.includes('revision!==renderRevision.current'));
 assert.ok(source.includes('if(tasks.current.get(number)===task)tasks.current.delete(number)'));
 assert.ok(source.includes("e.name==='RenderingCancelledException'"));
 assert.ok(source.includes("e.message.includes('same canvas during multiple render')"));
});


test('NCERT mobile chapter actions fit one row with accessible icon labels',()=>{
 const page=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/page.tsx'),'utf8');
 const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');
 assert.ok(page.includes('aria-label="Chapter resources and actions"'));
 for(const name of ['official','release','details','status']){
  assert.ok(page.includes('<ReaderActionIcon name="'+name+'"/>'));
 }
 assert.ok(page.includes('aria-label="Download GitHub release PDF"'));
 assert.ok(page.includes('aria-label="Record chapter status"'));
 assert.match(css,/\.ncert-reader-page \.ncert-reader-actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
 assert.match(css,/@media \(max-width: 359px\)/);
 assert.ok(css.includes('.ncert-reader-action-short { display: none; }'));
});


test('mobile fullscreen has zoom in, zoom out, independent exit and horizontal panning',()=>{
 const source=readFileSync(resolve(process.cwd(),'src/app/ncert-books/read/[chapterId]/pdfjs-reader.tsx'),'utf8');
 const css=readFileSync(resolve(process.cwd(),'src/app/pdfjs-reader.css'),'utf8');
 assert.ok(source.includes('className="pdfjs-zoom-out"'));
 assert.ok(source.includes('className="pdfjs-zoom-in"'));
 assert.ok(source.includes('className="pdfjs-fullscreen-exit"'));
 assert.ok(source.includes('aria-label="Exit fullscreen PDF reader"'));
 assert.ok(source.includes('fitScale*zoom'));
 assert.ok(source.includes("!fit?' is-zoomed':''"));
 assert.match(css,/\.pdfjs-reader:fullscreen \.pdfjs-controls\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(4,/s);
 assert.match(css,/\.pdfjs-reader:fullscreen \.pdfjs-controls \.pdfjs-zoom-in\s*\{\s*display:\s*inline-flex/s);
 assert.match(css,/\.pdfjs-reader:fullscreen \.pdfjs-controls \.pdfjs-fullscreen-toggle\s*\{\s*display:\s*none;/s);
 assert.match(css,/\.pdfjs-reader:fullscreen \.pdfjs-fullscreen-exit\s*\{\s*display:\s*inline-grid/s);
 assert.ok(css.includes('.pdfjs-reader:fullscreen.is-zoomed .pdfjs-stage canvas'));
 assert.ok(css.includes('max-width: none;'));
});
