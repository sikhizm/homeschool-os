import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

test('scheduled chapter action menu opts out of global details divider and spacing',()=>{
  const globalCss=readFileSync(resolve(process.cwd(),'src/app/globals.css'),'utf8');
  const menuCss=readFileSync(resolve(process.cwd(),'src/app/planning/chapter-planner.module.css'),'utf8');
  const source=readFileSync(resolve(process.cwd(),'src/app/planning/weekly-chapter-activities.tsx'),'utf8');
  // The page-level details style still applies to normal expandable panels.
  assert.match(globalCss,/\.learning-workspace details\s*\{[^}]*border-top:/s);
  // A more specific scoped rule must protect only action menus, including when open.
  assert.match(menuCss,/\.weekAction > \.weekMenu\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;[^}]*border:\s*0;/s);
  assert.match(menuCss,/\.weekAction > \.weekMenu\[open\] > summary\s*\{[^}]*margin-bottom:\s*0;/s);
  assert.ok(source.includes('className={styles.weekMenu}'));
  assert.ok(source.includes('className={styles.weekAction}'));
  assert.ok(source.includes('inlineLabel="+ Schedule"'));
  assert.ok(source.includes('onKeyDown={event =>'));
});
