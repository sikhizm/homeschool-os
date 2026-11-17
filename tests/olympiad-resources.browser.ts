import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('Olympiad library filters and official links work on mobile and desktop', async () => {
  const bundle = await build({
    stdin: {
      contents: `
        import {renderToStaticMarkup} from 'react-dom/server';
        import View from './src/app/library/olympiad/olympiad-view';
        export function render(query) {
          return renderToStaticMarkup(<View query={query}/>);
        }`,
      resolveDir: process.cwd(), loader: 'tsx',
    },
    bundle: true, write: false, platform: 'node', packages: 'external', jsx: 'automatic',
  });
  const fixture = { exports: {} as { render(query: Record<string, string>): string } };
  runInNewContext(bundle.outputFiles[0].text, { module: fixture, exports: fixture.exports, require: createRequire(import.meta.url) });
  const css = (await Promise.all(['src/app/globals.css', 'src/app/library/olympiad/olympiad.css'].map(path => readFile(path, 'utf8')))).join('\n').replace("@import 'tailwindcss';", '');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.route('https://olympiad.test/**', route => {
      const url = new URL(route.request().url());
      const html = fixture.exports.render(Object.fromEntries(url.searchParams));
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + css + '</style></head><body>' + html + '</body></html>' });
    });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('https://olympiad.test/library/olympiad');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'fits ' + width);
      assert.equal(await page.locator('select[name="grade"] option').count(), 11);
      await page.getByLabel('Class', { exact: true }).selectOption('10');
      await page.getByLabel('Subject', { exact: true }).selectOption('Science');
      await page.getByLabel('Organiser', { exact: true }).selectOption('CREST');
      await page.getByRole('button', { name: 'Show resources' }).click();
      await page.waitForURL('**grade=10**');
      assert.equal(await page.locator('.olympiad-card').count(), 1);
      assert.match(await page.getByRole('link', { name: 'Open PDF' }).getAttribute('href') ?? '', /Class-10\.pdf$/);
      assert.equal(await page.getByRole('link', { name: 'Open PDF' }).getAttribute('target'), '_blank');
      await page.getByLabel('Organiser', { exact: true }).selectOption('Math Kangaroo');
      await page.getByRole('button', { name: 'Show resources' }).click();
      await page.waitForURL('**provider=Math+Kangaroo**');
      assert.equal(await page.getByRole('heading', { name: 'No matching resources' }).count(), 1);
      await page.getByRole('link', { name: 'Show all resources' }).click();
      await page.waitForURL('**grade=all');
      assert.ok(await page.locator('.olympiad-card').count() >= 80);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://olympiad.test/library/olympiad?grade=4');
    await page.screenshot({ path: '/tmp/olympiad-mobile.png', fullPage: true });
  } finally { await browser.close(); }
});
