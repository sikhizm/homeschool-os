import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { fixture } from './fixture';
import {
  loadWorkflow,
  changeWorkflow,
} from '../src/lib/family-workflow/service';

test('family resource assignment, review, day budget and subject level persist on mobile and desktop', async () => {
  const f = await fixture();
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  await f.db.exec('ALTER TABLE learners ADD COLUMN archived_at timestamptz');
  await f.db.exec(
    await readFile('migrations/011_family_learning_workflow.sql', 'utf8'),
  );
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';import Workflow from './src/components/family-workflow';createRoot(document.getElementById('root')).render(<Workflow resourceKey="olympiad:sof-maths-4"/>);`,
      resolveDir: process.cwd(),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const css =
    (await readFile('src/app/globals.css', 'utf8')).replace(
      "@import 'tailwindcss';",
      '',
    ) + (await readFile('src/app/family-workflow.css', 'utf8'));
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/app.js') {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(bundle.outputFiles[0].text);
        return;
      }
      if (url.pathname === '/api/family-workflow') {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          await changeWorkflow(f.sql, 'owner-a', JSON.parse(raw));
          res.end(JSON.stringify({ saved: true }));
        } else
          res.end(
            JSON.stringify(
              await loadWorkflow(
                f.sql,
                'owner-a',
                url.searchParams.get('date')!,
                url.searchParams.get('resource') ?? '',
              ),
            ),
          );
        return;
      }
      res.setHeader('Content-Type', 'text/html');
      res.end(
        '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}' +
          css +
          '</style><main class="family-dashboard" id="root"></main><script src="/app.js"></script>',
      );
    } catch (e) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }),
      );
    }
  });
  try {
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const root = 'http://127.0.0.1:' + address.port;
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(root);
    await page.getByRole('button', { name: 'Confirm selection' }).click();
    await page.getByRole('status').filter({ hasText: 'Saved.' }).waitFor();
    await page.getByRole('button', { name: 'Confirm selection' }).click();
    await page
      .getByRole('status')
      .filter({ hasText: /duplicate key/ })
      .waitFor();
    const session = page.locator('article.workflow-session').first();
    await session.getByText('Record understanding', { exact: true }).click();
    await session.getByLabel('How did it go?').selectOption('help');
    await session.getByLabel('Actual minutes (optional)').fill('12');
    await session.getByRole('button', { name: 'Save review' }).click();
    await page.getByRole('status').filter({ hasText: 'Saved.' }).waitFor();
    await page.getByLabel('Day mode', { exact: true }).selectOption('minimum');
    await page.getByLabel('Time budget (minutes)').fill('15');
    await page.getByRole('button', { name: 'Save day mode' }).click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'exceeds your budget' })
      .waitFor();
    await page
      .getByRole('button', { name: 'Subject levels', exact: true })
      .click();
    await page
      .getByText('Fixture 1 · Overall class: UKG', { exact: true })
      .click();
    const level = page
      .locator('form')
      .filter({ has: page.getByLabel('Mathematics', { exact: true }) });
    await level.getByLabel('Mathematics', { exact: true }).selectOption('2');
    await level.getByRole('button', { name: 'Save level' }).click();
    await page.getByRole('status').filter({ hasText: 'Saved.' }).waitFor();
    await page.reload();
    await page.getByLabel('Day mode', { exact: true }).waitFor();
    assert.equal(
      await page.getByLabel('Time budget (minutes)').inputValue(),
      '15',
    );
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page
        .getByRole('button', { name: 'Weekly review', exact: true })
        .click();
      await page.getByText(/12 minutes recorded across 1 sessions/).waitFor();
      await page.screenshot({
        path: '/tmp/family-workflow-' + width + '.png',
        fullPage: true,
      });
    }
    const data = await loadWorkflow(
      f.sql,
      'owner-a',
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(
        new Date(),
      ),
    );
    assert.equal(data.activities.length, 1);
    assert.equal(data.activities[0].understanding, 'help');
    assert.equal(data.levels[0].level, 2);
  } finally {
    await browser?.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await f.db.close();
  }
});
