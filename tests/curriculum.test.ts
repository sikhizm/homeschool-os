import { test } from 'node:test';
import assert from 'node:assert/strict';
import { competencies, curriculumStages, curriculumForStage, validateCurriculum } from '../src/lib/curriculum/library';

test('curated curriculum references and prerequisite graph are valid',()=>{
 assert.deepEqual(validateCurriculum(),[]);
 assert.ok(competencies.length>=35);
 assert.equal(new Set(competencies.map(c=>c.id)).size,competencies.length);
});
test('every stage has examples and a progression',()=>{
 for(const stage of curriculumStages){assert.ok(curriculumForStage(stage.id).length>=3);}
 assert.ok(competencies.some(c=>c.prerequisites.length>0));
});
test('missing or cyclic prerequisite is detected',()=>{
 const copy=competencies.map(c=>({...c,prerequisites:[...c.prerequisites]}));
 copy[0].prerequisites=['does-not-exist'];
 assert.ok(validateCurriculum(copy).some(message=>message.includes('Unknown prerequisite')));
 copy[0].prerequisites=[copy[1].id];copy[1].prerequisites=[copy[0].id];
 assert.ok(validateCurriculum(copy).some(message=>message.includes('Cycle')));
});
test('suggestions have reviewable evidence and a source',()=>{
 for(const c of competencies){assert.ok(c.outcome.length>15);assert.ok(c.activity.length>12);assert.ok(c.sourceId);}
});
