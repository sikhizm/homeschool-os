import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { chromium } from 'playwright';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EnrichmentView from '../src/app/library/enrichment/enrichment-view';
import { enrichmentActivities, enrichmentStages, supplementaryResources } from '../src/lib/curriculum/enrichment';

test('enrichment filters, activity answers and verification labels work in the browser', async () => {
  // Exercise the production view with GET requests in an isolated fixture.
  // The production auth boundary is covered by scripts/smoke.mjs.
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const query = {
      stage: url.searchParams.get('stage') ?? undefined,
      topic: url.searchParams.get('topic') ?? undefined,
    };
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end('<!doctype html>' + renderToStaticMarkup(createElement(EnrichmentView, { query })));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:' + address.port + '/library/enrichment');
    assert.equal(await page.getByRole('link', { name: 'NCERT textbooks' }).getAttribute('href'), '/ncert-books');
    assert.equal(await page.getByRole('link', { name: 'Open the 36-week pathway' }).count(), 2);

    for (const resource of supplementaryResources) {
      const card = page.locator('#source-' + resource.id);
      assert.equal(await card.locator('time').count(), resource.verification.status === 'verified' ? 1 : 0);
      assert.equal(await card.getByRole('link').getAttribute('href'), resource.url);
    }
    assert.equal(await page.locator('#source-sgpc-langar .verify-badge').textContent(), 'Pending verification');
    assert.equal(await page.locator('#source-ncert-hindi .verify-badge').textContent(), 'Temporarily inaccessible');

    const apply = async () => {
      const previousUrl = page.url();
      await Promise.all([
        page.waitForURL(url => url.href !== previousUrl),
        page.getByRole('button', { name: 'Apply filters' }).click(),
      ]);
    };
    await page.locator('select[name="topic"]').selectOption('reasoning');
    await apply();
    assert.equal(await page.locator('#nursery-sort, #ukg-pattern').count(), 2);
    assert.equal(await page.getByRole('heading', { name: 'Class 4 · Reasoning activities' }).count(), 1);
    assert.equal(await page.locator('#source-sof-class4').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'Browse Olympiad resources' }).getAttribute('href'), '/library/olympiad?grade=all');

    for (const activity of enrichmentActivities.filter(item => item.stage === 'class4' && item.topic === 'reasoning')) {
      const card = page.locator('#' + activity.id);
      const answer = card.getByText(activity.discussion, { exact: true });
      assert.equal(await answer.isVisible(), false);
      await card.locator('summary').click();
      assert.equal(await answer.isVisible(), true);
      await card.locator('summary').click();
      assert.equal(await answer.isVisible(), false);
    }

    await page.locator('select[name="stage"]').selectOption('class4');
    await apply();
    await page.locator('select[name="stage"]').selectOption('all');
    await apply();
    for (const activity of enrichmentActivities.filter(item => item.topic === 'reasoning')) {
      const card = page.locator('#' + activity.id);
      assert.equal(await card.locator('strong').first().textContent(), enrichmentStages[activity.stage]);
    }
    assert.equal(await page.getByRole('heading', { name: /Reasoning through play/ }).count(), 2);

    for (const [stage, id] of [['nursery', 'nursery-sort'], ['ukg', 'ukg-pattern']]) {
      await page.locator('select[name="stage"]').selectOption(stage);
      await apply();
      assert.equal(await page.locator('#' + id).count(), 1);
      assert.equal(await page.locator('#source-sof-class4').count(), 0);
    }
  } finally {
    await browser?.close();
    server.close();
  }
});
