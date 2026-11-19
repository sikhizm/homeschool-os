import assert from 'node:assert/strict';
import test from 'node:test';
import {chapterProgress} from '../src/lib/planning/chapters';

test('a passing chapter test counts once in year progress even when a scheduled task is pending', () => {
  const result = chapterProgress(['pass', 'manual', 'pending'],
    [{id: 'task', chapter: 'pass', date: '2026-11-19', title: 'Reading', completed: false}],
    ['pass', 'manual'], new Set(['pass']));
  assert.equal(result.done, 2);
  assert.equal(result.remaining, 1);
  assert.equal(result.chapters[0].status, 'Completed');
  assert.equal(result.chapters[0].done, 0);
});
