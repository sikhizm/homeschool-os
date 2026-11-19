import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import test from 'node:test';
import {build} from 'esbuild';
import {chromium} from 'playwright';

test('the chapter picker works at desktop and mobile widths without writing learner data', async () => {
  const bundle = await build({stdin: {
    contents: `import {createRoot} from 'react-dom/client';
      import ChapterPlanMenu from './src/components/chapter-plan-menu';
      createRoot(document.getElementById('app')).render(<ChapterPlanMenu inline chapterId="sample" title="Sample chapter" learnerId="learner" initialDate="2026-11-19" />);`,
    loader: 'tsx', resolveDir: process.cwd(),
  }, bundle: true, write: false, jsx: 'automatic', alias: {'@': './src'}});
  const server = createServer((request, response) => {
    if (request.url === '/bundle.js') {
      response.setHeader('Content-Type', 'application/javascript');
      response.end(bundle.outputFiles[0].text);
    } else {
      response.setHeader('Content-Type', 'text/html');
      response.end('<div id="app"></div><script src="/bundle.js"></script>');
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
    try {
      for (const width of [1280, 390]) {
        const page = await browser.newPage({viewport: {width, height: 820}});
        const saved: unknown[] = [];
        let ready = false;
        await page.route('**/api/chapter-plan', async route => {
          if (route.request().method() === 'POST') {
            saved.push(route.request().postDataJSON());
            await route.fulfill({json: {saved: true}});
          } else await route.fulfill({json: {ready, canEdit: true, learners: [{id: 'learner', name: 'Test learner'}]}});
        });
        await page.goto(`http://127.0.0.1:${address.port}`);
        await page.getByRole('button', {name: 'Plan Sample chapter'}).click();
        await page.getByLabel('Activity').selectOption('reading-revision');
        assert.equal(await page.getByRole('button', {name: 'Add activity'}).isEnabled(), false);
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({state: 'hidden'});
        ready = true;
        await page.getByRole('button', {name: 'Plan Sample chapter'}).click();
        await page.getByLabel('Activity').selectOption('reading-revision');
        await page.getByRole('button', {name: 'Add activity'}).click();
        await page.getByText('Saved to the daily plan.').waitFor();
        assert.deepEqual(saved, [{chapterId: 'sample', learnerId: 'learner', activity: 'reading-revision', period: 'day', date: '2026-11-19'}]);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
