import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('planner learner/week redesign preserves both learner controls and date navigation', () => {
  const page = readFileSync(resolve(process.cwd(), 'src/app/planning/planning-workspace.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/app/planning/planning-controls.module.css'), 'utf8');
  assert.match(page, /styles\.controlCard/);
  assert.match(page, /aria-pressed=\{learner\.id === learnerId\}/);
  assert.match(page, /value=\{learnerId\}/);
  assert.match(page, /value=\{date\}/);
  assert.match(page, /setDate\(addDays\(date, -7\)\)/);
  assert.match(page, /setDate\(initialDate\)/);
  assert.match(page, /setDate\(addDays\(date, 7\)\)/);
  assert.match(page, /aria-label="Navigate planning weeks"/);
  assert.match(css, /\.learnerGrid\s*\{/);
  assert.match(css, /\.fieldGrid\s*\{/);
  assert.match(css, /\.weekNav\s*\{/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /grid-template-columns:\s*1fr 1\.1fr 1fr/);
});
