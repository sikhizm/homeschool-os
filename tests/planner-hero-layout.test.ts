import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('planner illustration stays beside copy in compact mobile hero',()=>{
  const page=readFileSync(resolve(process.cwd(),'src/app/planning/page.tsx'),'utf8');
  const css=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  assert.ok(page.includes('className="dashboard-welcome planner-hero"'));
  assert.ok(page.includes('className="tag planner-hero-kicker"'));
  assert.ok(page.includes('className="planner-hero-copy"'));
  assert.ok(page.includes('<SectionArtwork theme="plan" />'));
  assert.match(css,/@media \(max-width: 780px\)\s*\{\s*\.dashboard-welcome\.planner-hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,1fr\) minmax\(96px,32%\);/s);
  assert.match(css,/\.dashboard-welcome\.planner-hero > \.section-art\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2;/s);
  assert.ok(css.includes('.dashboard-welcome.planner-hero .planner-hero-copy h1'));
  assert.match(css,/\.dashboard-welcome\.planner-hero\s*\{[^}]*min-height:\s*0;/s);
});
