import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('Curriculum Library welcome places its illustration beside the text on mobile',()=>{
  const page=readFileSync(resolve(process.cwd(),'src/app/library/page.tsx'),'utf8');
  const css=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  assert.ok(page.includes('className="dashboard-welcome library-welcome library-hero"'));
  assert.ok(page.includes('className="tag library-hero-kicker"'));
  assert.ok(page.includes('className="library-hero-copy"'));
  assert.ok(page.includes('<SectionArtwork theme="explore" />'));
  assert.ok(page.indexOf('library-hero-copy') < page.indexOf('<SectionArtwork theme="explore" />'));
  assert.match(css,/\.library-page \.dashboard-welcome\.library-hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 180px;/s);
  assert.match(css,/@media \(max-width: 780px\)\s*\{\s*\.library-page \.dashboard-welcome\.library-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(90px, 30%\);/s);
  assert.match(css,/\.library-page \.library-hero > \.section-art\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2;/s);
  assert.ok(css.includes('.library-page .library-hero-copy h1'));
  assert.ok(css.includes('.library-page .library-hero-copy p'));
  assert.match(css,/\.library-page \.dashboard-welcome\.library-hero\s*\{[^}]*min-height:\s*0;/s);
});
