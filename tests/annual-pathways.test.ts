import assert from 'node:assert/strict';
import {test} from 'node:test';
import {modulesForGrade,pathwayAudit,pathwayModules} from '../src/lib/auto-learning/pathways';
import {queueCatalogue,nextQueueTasks} from '../src/lib/auto-learning/catalogue';

test('grade-specific pathways have unique stable IDs and complete parent instructions',()=>{
 assert.equal(pathwayModules.length,48);
 assert.equal(new Set(pathwayModules.map(x=>x.id)).size,pathwayModules.length);
 for(const task of pathwayModules){
  assert.ok(task.steps.length===3&&task.steps.every(s=>s.length>=10));
  assert.ok(task.check.length>10&&task.objective.length>10&&task.materials.length>1);
  assert.ok(task.minutes>0);
 }
});
test('each supported grade has 4 streams of four ordered activities',()=>{
 for(const grade of ['Nursery','UKG','Class 4']){
  const entries=modulesForGrade(grade);
  assert.equal(entries.length,16);
  assert.equal(new Set(entries.map(x=>x.subject)).size,4);
  assert.deepEqual([...new Set(entries.map(x=>x.week))].sort(),[1,2,3,4]);
  assert.ok(queueCatalogue(grade).some(x=>x.id.startsWith('pathway:')));
 }
 assert.equal(modulesForGrade('Class 5').length,0);
 assert.ok(pathwayAudit().every(x=>x.status==='original-enrichment-pilot'));
});
test('completed pathway tasks stay excluded from queue and NCERT ids remain stable',()=>{
 const all=queueCatalogue('Class 4');
 assert.ok(all.some(x=>x.id.startsWith('ncert:')));
 assert.equal(new Set(all.map(x=>x.id)).size,all.length);
 const chosen=all.find(x=>x.id.startsWith('pathway:'))!;
 assert.ok(nextQueueTasks(all,new Set([chosen.id]),all.length).every(x=>x.id!==chosen.id));
});
