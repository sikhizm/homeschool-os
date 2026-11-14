import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('adaptive learning history cards contain real line breaks, not visible escape text',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/app/dashboard/automatic-learning.tsx'),'utf8');
  assert.doesNotMatch(source,/\\n/);
});

test('global stylesheet scopes bare header rules so card headers are not boxed',()=>{
  const css=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  assert.doesNotMatch(css,/^\s*header\s*\{/m);
  assert.match(css,/\.studio-page-head\s*\{/);
  assert.match(css,/\.btn-primary/);
  assert.match(css,/\.btn-secondary/);
});

test('family home avoids duplicate family suffix when family name already ends in family',()=>{
  const home=readFileSync(resolve(process.cwd(),'src/app/dashboard/family-home.tsx'),'utf8');
  assert.match(home,/formatFamilyGreetingName/);
  assert.match(home,/\\bfamily\$\/i/);
});

test('reports, lessons and pilot pages use styled reflection lines instead of raw underscores',()=>{
  for(const rel of [
    'src/app/reports/page.tsx',
    'src/app/lessons/lesson-studio.tsx',
    'src/app/november-pilot/page.tsx',
  ]){
    const source=readFileSync(resolve(process.cwd(),rel),'utf8');
    assert.doesNotMatch(source,/_{6,}/,`${rel} should not render raw underscore lines`);
  }
});


test('mobile PWA keeps install action in header flow and respects bottom safe area',()=>{
  const css=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  const mobile=css.slice(css.lastIndexOf('/* Mobile PWA layout hardening'));
  assert.match(mobile,/@media \(max-width: 1023px\)/);
  assert.match(mobile,/\.app-topbar \.app-nav-actions\s*\{[^}]*position:\s*static/s);
  assert.match(mobile,/padding-bottom:\s*calc\(88px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(mobile,/\.app-bottom-nav\s*\{[^}]*env\(safe-area-inset-bottom\)/s);
});

test('desktop studio grids collapse cleanly for mobile widths',()=>{
  const css=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  const mobile=css.slice(css.lastIndexOf('/* Mobile PWA layout hardening'));
  for(const selector of [
    '.family-learner-grid',
    '.settings-bento-grid',
    '.learner-add-studio',
    '.reflection-prompt-grid',
    '.planning-bar-row',
  ]) assert.ok(mobile.includes(selector),selector);
  assert.match(mobile,/grid-template-columns:\s*minmax\(0, 1fr\)/);
});
