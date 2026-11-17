import { promptClasses, promptClassForStage, olympiadSourcesFor } from '../src/lib/olympiad/prompt-classes';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningPrompt, defaultSettings, validSettings, curricula, readPromptSettings, updatePromptSettings, topicsForSettings } from '../src/lib/learning-prompts';

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

test('all ten Olympiad classes use the matching class and official source links', () => {
  for (const targetClass of promptClasses) {
    const settings = updatePromptSettings(defaultSettings, { targetClass });
    const prompt = buildLearningPrompt(settings, { name: 'Learner', stage: 'Class ' + targetClass });
    assert.ok(prompt.includes('Olympiad, Class ' + targetClass + ', Level 1.'));
    for (const source of olympiadSourcesFor(targetClass)) assert.ok(prompt.includes(source));
    assert.ok(topicsForSettings(settings).includes(settings.topic));
    assert.ok(validSettings(settings));
    assert.ok(topicsForSettings(settings).length >= 6);
  }
});
test('class changes reset an incompatible topic and international tracks retain their own topics', () => {
  const secondary = updatePromptSettings(defaultSettings, { targetClass: '10', topic: 'Trigonometry and applications' });
  assert.equal(secondary.topic, 'Trigonometry and applications');
  assert.equal(updatePromptSettings(secondary, { targetClass: '1' }).topic, 'Mixed practice');
  assert.equal(updatePromptSettings(secondary, { track: 'World Curricula' }).topic, 'Mixed practice');
  assert.equal(validSettings({ ...secondary, targetClass: '1' }), false);
  assert.equal(validSettings({ ...secondary, targetClass: '11' }), false);
});
test('old favourites retain their original Class 4 target and new targets survive restoration', () => {
  const { targetClass: removed, ...legacy } = defaultSettings;
  assert.equal(removed, '4');
  assert.deepEqual(readPromptSettings(legacy), defaultSettings);
  const secondary = updatePromptSettings(defaultSettings, { targetClass: '9' });
  assert.deepEqual(readPromptSettings(JSON.parse(JSON.stringify(secondary))), secondary);
  assert.equal(readPromptSettings({ ...legacy, targetClass: '12' }), null);
  assert.equal(readPromptSettings(null), null);
});
test('learner stages map precisely to Classes 1–10', () => {
  for (const grade of promptClasses) {
    assert.equal(promptClassForStage('Class ' + grade), grade);
    assert.equal(promptClassForStage('class' + grade), grade);
  }
  for (const stage of ['Nursery', 'UKG', 'Class 11', 'Class 12', 'Class 1–2', '']) {
    assert.equal(promptClassForStage(stage), null);
  }
});
