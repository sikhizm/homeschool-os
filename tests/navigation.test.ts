import assert from 'node:assert/strict';
import {test} from 'node:test';
import {navigationForPath,navigationLinkIsActive} from '../src/lib/navigation';

test('curriculum descendants stay inside the Explore navigation group',()=>{
 const result=navigationForPath('/ncert-books/chapter/english-01');
 assert.equal(result.activePrimary,'explore');
 assert.equal(result.context?.label,'Explore learning');
 assert.ok(result.context?.links.some(x=>x.href==='/ncert-books'&&navigationLinkIsActive('/ncert-books/chapter/english-01',x.href)));
});

test('planning offers direct access to the daily coach and curriculum',()=>{
 const result=navigationForPath('/planning');
 assert.equal(result.activePrimary,'planner');
 assert.deepEqual(result.context?.links.map(x=>x.label),['Daily coach','Weekly planner','Curriculum']);
 assert.ok(navigationLinkIsActive('/planning', '/planning'));
});

test('portfolio and reports are grouped as one progress destination',()=>{
 assert.equal(navigationForPath('/portfolio').activePrimary,'progress');
 assert.equal(navigationForPath('/reports').activePrimary,'progress');
 assert.equal(navigationForPath('/reports').context?.links.length,2);
});

test('the dashboard has no redundant secondary navigation',()=>{
 assert.equal(navigationForPath('/dashboard').context,null);
});
