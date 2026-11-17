import assert from 'node:assert/strict';
import test from 'node:test';
import {
  olympiadClasses, olympiadFilters, olympiadProviders, olympiadResources,
  selectOlympiadResources,
} from '../src/lib/olympiad/catalogue';
import { activeShellDestination, bottomDestinations, isPrivateRoute, navigationForPath } from '../src/lib/navigation';

test('all ten classes have class-specific PDFs and all three providers', () => {
  for (const grade of olympiadClasses) {
    const resources = selectOlympiadResources({ grade: String(grade) });
    assert.deepEqual(new Set(resources.map(item => item.provider)), new Set(olympiadProviders));
    for (const subject of ['Maths', 'Science', 'English', 'Reasoning']) {
      assert.ok(resources.some(item => item.subject === subject && item.pdfUrl), 'PDF coverage for class ' + grade + ' ' + subject);
    }
    assert.ok(resources.every(item => item.grades.includes(grade)));
  }
});
test('direct PDFs have recorded evidence and official source fallbacks', () => {
  assert.equal(new Set(olympiadResources.map(item => item.id)).size, olympiadResources.length);
  const hosts = ['www.crestolympiads.com', 'sofworld.org', 'www.silverzone.org', 'mathkangaroo.org'];
  for (const resource of olympiadResources) {
    assert.ok(hosts.includes(new URL(resource.sourceUrl).hostname));
    assert.match(resource.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(resource.evidence.length > 20);
    if (resource.pdfUrl) {
      assert.ok(hosts.includes(new URL(resource.pdfUrl).hostname));
      assert.ok(resource.pages && resource.pages > 0);
      assert.match(resource.evidence, /PDF/);
    }
  }
});
test('filters combine class, subject, provider and search, including empty results', () => {
  const rows = selectOlympiadResources({ grade: '10', provider: 'CREST', subject: 'Science', q: 'sample' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 'crest-science-10');
  assert.equal(selectOlympiadResources({ grade: '1', provider: 'SilverZone', subject: 'English' }).length, 0);
  assert.equal(selectOlympiadResources({ grade: 'all' }).length, olympiadResources.length);
  assert.equal(olympiadFilters({ grade: '11', provider: 'unknown' }).grade, '4');
  assert.equal(olympiadFilters({ grade: '11', provider: 'unknown' }).provider, '');
});
test('Olympiad resources stay in the authenticated library navigation on mobile', () => {
  assert.equal(isPrivateRoute('/library/olympiad'), true);
  assert.equal(activeShellDestination('/library/olympiad', bottomDestinations)?.id, 'library');
  assert.ok(navigationForPath('/library').context?.links.some(link => link.href === '/library/olympiad'));
});
