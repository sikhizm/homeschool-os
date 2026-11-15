import assert from 'node:assert/strict';
import test from 'node:test';
import {
  enrichmentActivities, enrichmentStages, filterEnrichment, sourceVerifiedOn, supplementaryResources,
} from '../src/lib/curriculum/enrichment';

test('each source has traceable metadata and a unique HTTPS address', () => {
  assert.match(sourceVerifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Set(supplementaryResources.map(source => source.id)).size, supplementaryResources.length);
  assert.equal(new Set(supplementaryResources.map(source => source.url)).size, supplementaryResources.length);
  for (const source of supplementaryResources) {
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(source.publisher && source.sourceLocation && source.stages.length && source.parentUse);
  }
});

test('each stage and topic filter preserves every visible activity reference', () => {
  assert.equal(new Set(enrichmentActivities.map(activity => activity.id)).size, enrichmentActivities.length);
  for (const activity of enrichmentActivities) {
    const { activities, resources } = filterEnrichment(activity.stage, activity.topic);
    assert.ok(activities.includes(activity));
    assert.ok(resources.some(source => source.id === activity.referenceId && source.stages.includes(activity.stage)));
    assert.ok(activities.every(item => item.stage === activity.stage && item.topic === activity.topic));
    assert.ok(activity.minutes > 0 && activity.minutes <= 15);
  }
});

test('early-years reasoning does not surface competition material', () => {
  for (const stage of ['nursery', 'ukg'] as const) {
    const { activities, resources } = filterEnrichment(stage, 'reasoning');
    assert.ok(activities.length);
    assert.ok(!resources.some(source => source.id === 'sof-class4'));
  }
  assert.ok(filterEnrichment('class4', 'reasoning').resources.some(source => source.id === 'sof-class4'));
  assert.equal(filterEnrichment('class4', 'early-years').activities.length, 0);
});

test('all authored stages offer home-language and heritage activities', () => {
  for (const stage of Object.keys(enrichmentStages) as (keyof typeof enrichmentStages)[]) {
    const { activities } = filterEnrichment(stage, 'home-languages');
    assert.equal(activities.length, 2);
    assert.ok(filterEnrichment(stage, 'sikh-heritage').activities.length);
  }
});
