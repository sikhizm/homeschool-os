import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { searchCatalogue } from '../src/lib/search';
import type { SearchFilter } from '../src/lib/search/types';

test('global search works in the desktop and mobile shell', async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';
        import AppNavigation from './src/components/app-navigation';
        createRoot(document.getElementById('root')).render(<AppNavigation><main><h1>Family dashboard</h1></main></AppNavigation>);`,
      resolveDir: process.cwd(), loader: 'tsx',
    },
    bundle: true, write: false, format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{
      name: 'isolated-search-shell',
      setup(api) {
        api.onResolve({ filter: /^next\/(link|navigation)$|^@\/components\/pwa-tools$/ }, ({path}) => ({ path, namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
          contents: path === 'next/link'
            ? 'export default function Link({href,children,prefetch,...props}){return <a href={href} {...props}>{children}</a>}'
            : path === 'next/navigation'
              ? "export const usePathname=()=>window.location.pathname;"
              : 'export const PwaInstallButton=()=>null;',
          loader: 'jsx', resolveDir: process.cwd(),
        }));
      },
    }],
  });
  const css = (await readFile('src/app/globals.css', 'utf8')).replace("@import 'tailwindcss';", '') +
    await readFile('src/app/global-search.css', 'utf8');
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname === '/api/search') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(searchCatalogue(url.searchParams.get('q') ?? '',
        (url.searchParams.get('category') ?? 'all') as SearchFilter,
        { offset: Number(url.searchParams.get('offset')), includeOwner: true })));
    } else if (url.pathname === '/bundle.js') {
      response.setHeader('Content-Type', 'application/javascript');
      response.end(bundle.outputFiles[0].text);
    } else {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}' +
        css + '</style><div id="root"></div><script src="/bundle.js"></script>');
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const root = 'http://127.0.0.1:' + address.port;
    await page.goto(root + '/dashboard');
    const trigger = page.getByRole('button', { name: 'Search HomeSchool OS' });
    await trigger.waitFor();
    const dialog = page.getByRole('dialog', { name: 'Search HomeSchool OS' });
    const input = dialog.getByRole('searchbox');
    const bookFilter = dialog.getByRole('button', { name: 'Books & Chapters' });
    await trigger.focus();
    await page.keyboard.press('Control+k');
    await input.waitFor();
    assert.ok(await input.evaluate(node => node === document.activeElement));
    await input.fill('shapes around us');
    await bookFilter.click();
    await dialog.getByRole('link', { name: /Shapes Around Us/ }).first().waitFor();
    assert.equal(await bookFilter.getAttribute('aria-pressed'), 'true');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    assert.ok(await page.locator(':focus').getAttribute('data-search-result') !== null);
    if (process.env.CI) await page.screenshot({ path: '/tmp/homeschool-global-search-desktop.png' });
    const destination = await page.locator(':focus').getAttribute('href');
    await page.keyboard.press('Enter');
    await page.waitForURL(root + destination);
    assert.equal(await dialog.count(), 0);

    await trigger.waitFor();
    await page.keyboard.press('Meta+k');
    await input.waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await trigger.click();
    await dialog.waitFor();
    await page.mouse.click(10, 10);
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await trigger.evaluate(node => node === document.activeElement));
    await page.getByRole('button', { name: 'Collapse navigation' }).click();
    assert.ok(await page.getByRole('button', { name: 'Expand navigation' }).isVisible());
    assert.ok(await trigger.isVisible());

    for (const width of [320, 375, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(root + '/dashboard');
      await trigger.click();
      await input.fill('reasoning');
      await dialog.getByRole('button', { name: 'Activities' }).click();
      await dialog.getByRole('link', { name: /Pack the fruit/ }).waitFor();
      assert.ok(await dialog.evaluate(node => {
        const box = node.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth && box.bottom <= innerHeight && node.scrollWidth <= node.clientWidth;
      }));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (process.env.CI && width === 375) await page.screenshot({ path: '/tmp/homeschool-global-search-mobile.png' });
      await dialog.getByRole('button', { name: 'Clear' }).click();
      assert.equal(await input.inputValue(), '');
      await dialog.getByRole('button', { name: 'Close search' }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(await page.locator('.app-bottom-nav').isVisible());
    }

    await trigger.click();
    await input.fill('ncert');
    await bookFilter.click();
    const more = dialog.getByRole('button', { name: 'Show more results' });
    await more.click();
    await dialog.locator('[data-search-result]').nth(8).waitFor();
  } finally {
    await browser?.close();
    server.close();
  }
});
