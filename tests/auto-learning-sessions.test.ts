import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue,nextQueueTasks} from '../src/lib/auto-learning/catalogue';

test('indexed Class 4 chapters have staged, unique, sequential tasks',()=>{
 const tasks=queueCatalogue('Class 4');
 const ids=tasks.filter(t=>t.id.startsWith('ncert:'));
 assert.ok(ids.length>=3);
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 const first=ids[0].id.replace(/:(read|practice|review)$/,'');
 assert.deepEqual(ids.filter(t=>t.id.startsWith(first+':')).map(t=>t.id),[first+':read',first+':practice',first+':review']);
 assert.ok(ids.every(t=>t.href.startsWith('/ncert-books/chapter/')));
});
test('completed sessions advance without repeating them',()=>{
 const tasks=queueCatalogue('Class 4');
 const completed=new Set([tasks[0].id]);
 const next=nextQueueTasks(tasks,completed,3);
 assert.ok(next.every(x=>!completed.has(x.id)));
 assert.equal(next.length,3);
});
test('early years retains existing curated original activities',()=>{
 const tasks=queueCatalogue('UKG');
 assert.ok(tasks.length>0);
 assert.ok(tasks.every(x=>x.id.startsWith('original:')));
});
