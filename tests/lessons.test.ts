import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterLessons, lessonById, lessons, lessonStages, validateLessons } from '../src/lib/lessons/library';

test('lesson library has stable unique IDs and complete printable content',()=>{
 assert.deepEqual(validateLessons(),[]);
 assert.equal(lessons.length,20);
 assert.equal(new Set(lessons.map(item=>item.id)).size,lessons.length);
 for(const lesson of lessons){
  assert.ok(lesson.steps.length>=3);
  assert.ok(lesson.objective.length>10);
  assert.ok(lesson.minutes<=60);
  assert.equal(lessonById(lesson.id)?.id,lesson.id);
 }
});
test('all declared stages have age-appropriate original learning activities',()=>{
 for(const stage of lessonStages){
  assert.ok(filterLessons(stage.id).length>=2,stage.id);
 }
 assert.ok(filterLessons('early').some(lesson=>lesson.subject==='Punjabi & Sikh heritage'));
});
test('search and filter preserve subject and stage constraints',()=>{
 const matches=filterLessons('class3-5','Mathematics','fraction');
 assert.equal(matches.length,1);
 assert.equal(matches[0].id,'fraction-fold');
 assert.equal(filterLessons('early','Mathematics','fraction').length,0);
 assert.equal(filterLessons(undefined,undefined,'nonsense-word-xyz').length,0);
});
test('unrecognised lesson IDs cannot resolve to another lesson',()=>{
 assert.equal(lessonById('unknown'),undefined);
 assert.equal(lessonById('../secrets'),undefined);
});
