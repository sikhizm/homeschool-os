import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { indexCounts, searchCatalogue } from '../src/lib/search';
import { enrichmentActivities, supplementaryResources, resourceVerificationLabels } from '../src/lib/curriculum/enrichment';
import { ncertChapterSlots, ncertTextbooks } from '../src/lib/ncert/textbooks';
import { lessons } from '../src/lib/lessons/library';

test('feature links correspond to implemented routes and owner tools stay owner-only', () => {
  const features = searchCatalogue('', 'features', { includeOwner: true, limit: 100 }).results;
  for (const feature of features) {
    const pathname = new URL(feature.href, 'http://fixture').pathname;
    const route = pathname.startsWith('/ncert-books/chapter/') ? '/ncert-books/chapter/[chapterId]' : pathname;
    assert.ok(existsSync('src/app' + route + '/page.tsx'), feature.href);
  }
  assert.equal(searchCatalogue('progress').results[0].href, '/reports');
  assert.ok(searchCatalogue('annual').results.every(result => !result.href.startsWith('/learning-pathways')));
  assert.match(searchCatalogue('study material studio').results[0].href, /#study-material-studio$/);
  assert.ok(!searchCatalogue('mapping review').results.some(result => result.href === '/curriculum-mapping'));
  assert.equal(searchCatalogue('mapping review', 'features', { includeOwner: true }).results[0].href, '/curriculum-mapping');
});

test('book and chapter results rank correctly and preserve real deep links', () => {
  const book = searchCatalogue('Class 4 maths mela', 'books', { limit: 100 }).results.find(hit => hit.id === 'book:ncert-4-maths-mela');
  assert.ok(book);
  const location = new URL(book.href, 'http://fixture');
  assert.deepEqual(Object.fromEntries(location.searchParams), { grade: '4', subject: 'Mathematics', book: 'ncert-4-maths-mela' });
  assert.equal(searchCatalogue('Maths Mela', 'books').results[0].title, 'Maths Mela');
  const classOneHindi = searchCatalogue('Class 1 Hindi', 'books', { limit: 100 }).results;
  assert.ok(classOneHindi.some(result => result.id === 'book:ncert-1-sarangi'));
  assert.ok(classOneHindi.some(result => result.id === 'book:ncert-1-anandmay-ganit'));
  assert.ok(classOneHindi.every(result => result.metadata?.startsWith('Class 1 ·') && result.metadata.split(' · ').includes('Hindi')));
  assert.equal(searchCatalogue('shapes around us', 'books').results[0].title, 'Shapes Around Us');
  assert.ok(searchCatalogue('shape', 'books').results.some(hit => /^Shapes/.test(hit.title)));
  assert.ok(searchCatalogue('class 4 mathematics chapter 01', 'books').results.some(hit =>
    hit.href === '/ncert-books/chapter/ncert-4-maths-mela-ch-01'));
  assert.ok(searchCatalogue('mridnag', 'books').results.some(hit => hit.title === 'Mridang'));
  assert.equal(indexCounts().books, ncertTextbooks.length);
  assert.equal(indexCounts().chapters, ncertChapterSlots.filter(chapter => chapter.verifiedTitle).length);
});

test('activities, publisher resources and framework sources remain distinguishable', () => {
  assert.ok(searchCatalogue('reasoning', 'activities').results.some(hit => hit.href.startsWith('/library/enrichment?stage=class4')));
  assert.ok(searchCatalogue('punjabi', 'activities').results.some(hit => hit.href.includes('home-languages') || hit.href.startsWith('/lessons?activity=')));
  assert.match(searchCatalogue(lessons[0].title, 'activities').results[0].href, /activity=.*#activity-detail$/);
  assert.equal(indexCounts().activities, lessons.length + enrichmentActivities.length);
  assert.equal(searchCatalogue('sgpc', 'resources').results[0].href, '/library/enrichment?stage=all&topic=sikh-heritage#source-sgpc-langar');
  const resources = searchCatalogue('', 'resources').results;
  for (const source of supplementaryResources) {
    const resource = resources.find(hit => hit.id === 'resource:' + source.id);
    assert.ok(resource?.metadata?.includes(resourceVerificationLabels[source.verification.status]));
  }
  assert.equal(searchCatalogue('Cambridge Primary', 'curriculum').results[0].href, '/global-curriculum#framework-cambridge');
  assert.match(searchCatalogue('original homeschool', 'curriculum').results[0].metadata ?? '', /Original content/);
});

test('pagination, deduplication, and isolation from family data', () => {
  const first = searchCatalogue('ncert', 'books');
  const second = searchCatalogue('ncert', 'books', { offset: first.results.length });
  const hits = [...first.results, ...second.results];
  assert.equal(new Set(hits.map(hit => hit.id)).size, hits.length);
  assert.equal(second.total, first.total);
  assert.deepEqual(searchCatalogue('fictional-learner-private-guid-92z'), { total: 0, results: [] });
  assert.ok(hits.every(hit => !hit.href.includes('learner=') && hit.href.startsWith('/')));
  console.log('Global search index:', JSON.stringify(indexCounts()));
});

test('Olympiad search leads to the dedicated resources and prompts', () => {
  const hits = searchCatalogue('olympiad').results;
  assert.ok(hits.some(hit => hit.href === '/library/olympiad'));
  assert.ok(hits.some(hit => hit.href === '/library/prompts'));
  assert.ok(!hits.some(hit => hit.href.startsWith('/library/enrichment')));
});
