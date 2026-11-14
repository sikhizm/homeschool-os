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
