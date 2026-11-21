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
 assert.deepEqual(result.context?.links.map(x=>x.label),['Daily coach','Weekly planner']);
 assert.ok(navigationLinkIsActive('/planning', '/planning'));
});

test('reports remain separate from challenges and the retired portfolio',()=>{
 assert.equal(navigationForPath('/portfolio').activePrimary,null);
 assert.equal(navigationForPath('/reports').activePrimary,'progress');
 assert.equal(navigationForPath('/reports').context,null);
 assert.equal(navigationForPath('/challenges').activePrimary,null);
});

test('the dashboard has no redundant secondary navigation',()=>{
 assert.equal(navigationForPath('/dashboard').context,null);
});


test('personal books have their own Library tab, not NCERT navigation',()=>{
 const current=navigationForPath('/library/my-books');
 assert.equal(current.context?.label,'Learning library');
 assert.ok(current.context.links.some(link=>link.href==='/library/my-books'&&link.label==='My Books'));
 assert.equal(navigationLinkIsActive('/library/my-books','/library/my-books'),true);
 assert.equal(navigationLinkIsActive('/library/my-books','/library'),false);
 assert.equal(navigationLinkIsActive('/library','/library'),true);
 const ncert=navigationForPath('/ncert-books');
 assert.equal(ncert.context?.label,'Explore learning');
 assert.ok(!ncert.context?.links.some(link=>link.href==='/library/my-books'));
});
