import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningPrompt, defaultSettings, validSettings, curricula } from '../src/lib/learning-prompts';

test('all curriculum prompts include their source, level and source gate', () => {
  for (const curriculum of Object.keys(curricula) as (keyof typeof curricula)[]) {
    const prompt = buildLearningPrompt({ ...defaultSettings, track: 'World Curricula', curriculum }, { name: 'Test learner', stage: 'Class 4' });
    assert.ok(prompt.includes(curricula[curriculum].url));
    assert.ok(prompt.includes(curricula[curriculum].label));
    assert.match(prompt, /ask the parent to upload/);
    assert.match(prompt, /Do not assume/);
  }
});
test('interactive mock tests wait and withhold answers until completion', () => {
  const prompt = buildLearningPrompt({ ...defaultSettings, material: 'Mock test', format: 'Interactive tutoring' }, { name: '', stage: '' });
  assert.match(prompt, /sample-paper format/);
  assert.match(prompt, /abbreviated practice test/);
  assert.match(prompt, /wait for the learner/);
  assert.match(prompt, /until the test ends/);
});
test('saved settings reject malformed or obsolete values', () => {
  assert.equal(validSettings(defaultSettings), true);
  for (const value of [null, [], {}, { ...defaultSettings, curriculum: 'usa' }, { ...defaultSettings, minutes: 30 }]) {
    assert.equal(validSettings(value), false);
  }
});
