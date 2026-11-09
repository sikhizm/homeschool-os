import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('adaptive learning history cards contain real line breaks, not visible escape text',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/app/dashboard/automatic-learning.tsx'),'utf8');
  assert.doesNotMatch(source,/\\n/);
});
