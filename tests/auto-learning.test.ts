import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue,nextQueueTasks,stageFor} from '../src/lib/auto-learning/catalogue';

test('class 4 builds an ordered queue from verified NCERT chapters and original activities',()=>{
 const items=queueCatalogue('Class 4');
 assert.ok(items.some(x=>x.id.startsWith('ncert:')));
 assert.ok(items.every(x=>x.instructions.length>0&&x.href.startsWith('/')));
 assert.equal(new Set(items.map(x=>x.id)).size,items.length);
});
test('completed activities never appear in the next queue',()=>{
 const items=queueCatalogue('UKG');
 assert.ok(items.length>0);
 const completed=new Set([items[0].id]);
 assert.ok(nextQueueTasks(items,completed).every(x=>x.id!==items[0].id));
 assert.equal(nextQueueTasks(items,new Set(items.map(x=>x.id))).length,0);
});
test('not-catalogued grades are not falsely represented as complete NCERT coverage',()=>{
 assert.equal(stageFor('Class 13'),null);
 assert.ok(queueCatalogue('Class 5').every(x=>!x.id.startsWith('ncert:')));
});
