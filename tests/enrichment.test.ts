import assert from 'node:assert/strict';
import test from 'node:test';
import {
  earlyYearsScope, enrichmentActivities, enrichmentStages, enrichmentTopics, filterEnrichment,
  resolveEnrichmentFilters, resourceVerificationLabels, supplementaryResources,
} from '../src/lib/curriculum/enrichment';

test('each source has traceable metadata and a unique HTTPS address', () => {
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

test('verification is recorded independently and only successful opens have a verification date', () => {
  const expected = {
    'ncf-foundational': 'temporarily-inaccessible',
    'jaadui-pitara': 'verified',
    'sof-class4': 'verified',
    'punjab-educare': 'verified',
    'ncert-hindi': 'temporarily-inaccessible',
    'sgpc-langar': 'pending',
  };
  assert.deepEqual(Object.fromEntries(supplementaryResources.map(source => [
    source.id, source.verification.status,
  ])), expected);
  assert.equal(new Set(supplementaryResources.map(source => source.verification.evidence)).size, 6);
  for (const { verification } of supplementaryResources) {
    if (verification.status === 'verified') {
      assert.match(verification.lastVerifiedOn, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(verification.evidence, /^Opened /);
    } else {
      assert.equal(verification.lastVerifiedOn, undefined);
    }
  }
  assert.notEqual(resourceVerificationLabels.pending, resourceVerificationLabels.verified);
  assert.notEqual(resourceVerificationLabels['temporarily-inaccessible'], resourceVerificationLabels.broken);
});

test('original publisher URLs are preserved', () => {
  assert.deepEqual(Object.fromEntries(supplementaryResources.map(({ id, url }) => [id, url])), {
    "ncf-foundational": "https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf",
    "jaadui-pitara": "https://ejaaduipitara.ncert.gov.in/",
    "sof-class4": "https://sofworld.org/imo/class-4/sample-model-test-papers/imo-sample-papers-class-4",
    "punjab-educare": "https://www.punjabeducare.org/1st-punjabi",
    "ncert-hindi": "https://www.ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf",
    "sgpc-langar": "https://publication.sgpc.net/assets/publication_pdf/other_publication_pdf/Sikh_Rehat_Maryada_English.pdf"
  });
});

test('reasoning defaults to Class 4 and explicit stages override it', () => {
  for (const submittedStage of [undefined, '']) {
    const { stage, topic } = resolveEnrichmentFilters({ stage: submittedStage, topic: 'reasoning' });
    assert.equal(stage, 'class4');
    assert.equal(filterEnrichment(stage, topic).activities.length, 3);
  }
  const { stage, topic } = resolveEnrichmentFilters({ stage: 'all', topic: 'reasoning' });
  assert.equal(stage, undefined);
  assert.equal(filterEnrichment(stage, topic).activities.length, 5);

  for (const choice of ['nursery', 'ukg', 'class4'] as const) {
    const result = resolveEnrichmentFilters({ stage: choice, topic: 'reasoning' });
    assert.equal(result.stage, choice);
    const { activities, resources } = filterEnrichment(result.stage, result.topic);
    assert.ok(activities.every(activity => activity.stage === choice));
    assert.equal(resources.some(source => source.id === 'sof-class4'), choice === 'class4');
  }
});

test('all form combinations retain the intended activities and their references', () => {
  for (const stage of ['', 'all', ...Object.keys(enrichmentStages)]) {
    for (const topic of ['', ...Object.keys(enrichmentTopics)]) {
      const resolved = resolveEnrichmentFilters({ stage, topic });
      const expectedStage = stage === 'all' ? undefined : stage || (topic === 'reasoning' ? 'class4' : undefined);
      assert.equal(resolved.stage, expectedStage);
      const result = filterEnrichment(resolved.stage, resolved.topic);
      assert.deepEqual(result.activities, enrichmentActivities.filter(activity =>
        (!expectedStage || activity.stage === expectedStage) && (!topic || activity.topic === topic),
      ));
      assert.ok(result.activities.every(activity => result.resources.some(source => source.id === activity.referenceId)));
    }
  }
  assert.equal(resolveEnrichmentFilters({ stage: ['nursery', 'all'], topic: 'reasoning' }).stage, 'class4');
});

test('early-years scope stays distinct and each stage retains its play activity', () => {
  assert.match(earlyYearsScope.nursery.focus, /story and movement/);
  assert.match(earlyYearsScope.ukg.focus, /early|letter awareness/);
  assert.deepEqual(filterEnrichment('nursery', 'early-years').activities.map(({ id }) => id), ['nursery-story']);
  assert.deepEqual(filterEnrichment('ukg', 'early-years').activities.map(({ id }) => id), ['ukg-sequence']);
});
