import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {prioritizedQueue} from '../src/lib/auto-learning/revision';

test('grade-specific pathway activities expose meaningful understanding prompts',()=>{
 const tasks=queueCatalogue('UKG').filter(x=>x.id.startsWith('pathway:'));
 assert.ok(tasks.length>0);
 assert.ok(tasks.every(x=>typeof x.check==='string'&&x.check.length>10));
});
test('original curated lessons expose a parent check prompt',()=>{
 const tasks=queueCatalogue('Nursery').filter(x=>x.id.startsWith('original:'));
 assert.ok(tasks.length>0);
 assert.ok(tasks.every(x=>typeof x.check==='string'&&x.check.length>0));
});
test('needs revision does not mark an activity completed or skip ahead of it',()=>{
 const tasks=queueCatalogue('Class 4');
 const target=tasks[0];
 const selection=prioritizedQueue(tasks,[{task_id:target.id,status:'needs_revision',updated_at:'2026-10-30T08:00:00Z'}],new Date('2026-10-30T10:00:00Z'));
 assert.equal(selection[0].id,target.id);
});
