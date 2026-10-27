import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { fixture } from './fixture';
import { parseCommand } from '../src/lib/learning/model';
import { executeCommand, loadWorkspace } from '../src/lib/learning/service';

test('parent workspace works on desktop and mobile with real SQL persistence', async () => {
  const { db, sql, ids } = await fixture();
  const bundle = await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import Workspace from './src/app/dashboard/learning-workspace'; createRoot(document.getElementById('app')).render(<Workspace learners={[{id:'${ids[0]}',display_name:'Fixture learner',stage:'UKG'}]} canEdit={!location.search.includes('viewer')} initialDate="2026-10-27"/>);`,
      resolveDir: process.cwd(),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'test-router',
        setup(b) {
          b.onResolve({ filter: /^next\/navigation$/ }, () => ({
            path: 'router',
            namespace: 'test',
          }));
          b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
            contents: 'export const useRouter=()=>({refresh(){}});',
          }));
        },
      },
    ],
  });
  const css = (await readFile('src/app/globals.css', 'utf8')).replace(
    "@import 'tailwindcss';",
    '',
  );
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url!, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        let body: unknown;
        if (request.method === 'GET')
          body = await loadWorkspace(
            sql,
            'owner-a',
            ids[0],
            url.searchParams.get('date')!,
          );
        else {
          let raw = '';
          for await (const chunk of request) raw += chunk;
          body = await executeCommand(
            sql,
            'owner-a',
            ids[0],
            parseCommand(JSON.parse(raw)),
          );
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(body));
      } else if (url.pathname === '/bundle.js') {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(bundle.outputFiles[0].text);
      } else {
        response.setHeader('Content-Type', 'text/html');
        response.end(
          `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><main class="family-dashboard"><div id="app"></div></main><script src="/bundle.js"></script></body></html>`,
        );
      }
    } catch {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'Test operation failed' }));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1000 },
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${address.port}`);
    await page.getByRole('button', { name: 'Plan a balanced hour' }).waitFor();
    await page.getByRole('button', { name: 'Subjects', exact: true }).click();
    await page
      .getByRole('button', { name: 'Add Mathematics', exact: true })
      .click();
    await page.getByText('Saved.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Goals', exact: true }).click();
    await page
      .getByLabel('Observable goal', { exact: true })
      .fill('Compare objects to ten');
    await page.getByRole('button', { name: 'Add goal', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Compare objects to ten', exact: true })
      .waitFor();
    await page.getByText('Update goal & progress', { exact: true }).click();
    await page.getByLabel('Progress (0–100%)').fill('25');
    await page
      .getByLabel('What did you observe? (optional)')
      .fill('Synthetic browser-test observation');
    await page.getByRole('button', { name: 'Save progress' }).click();
    await page.getByText('25%', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await page.getByRole('button', { name: 'Plan a balanced hour' }).click();
    await page.getByText('5 activities', { exact: true }).waitFor();
    assert.equal(await page.getByRole('checkbox').count(), 5);
    await page.getByRole('checkbox').first().click();
    await page.getByText('Completed together', { exact: true }).waitFor();
    const workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    assert.equal(workspace.goals[0].progress, 25);
    assert.equal(workspace.activities.filter((a) => a.completed).length, 1);
    await page.reload();
    await page.getByText('5 activities', { exact: true }).waitFor();
    assert.equal(await page.getByRole('checkbox').first().isChecked(), true);
    await page.setViewportSize({ width: 375, height: 812 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await page.screenshot({
      path: '/tmp/homeschool-workspace-mobile.png',
      fullPage: true,
    });
    const activityForm = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', {
          name: 'Add an activity',
          exact: true,
        }),
      });
    await activityForm
      .getByLabel('Activity', { exact: true })
      .fill('Linked practice');
    await activityForm
      .getByLabel('Subject (optional)')
      .selectOption(workspace.subjects[0].id);
    await activityForm
      .getByLabel('Learning goal (optional)')
      .selectOption(workspace.goals[0].id);
    await activityForm.getByRole('button', { name: 'Add to day' }).click();
    const practice = page
      .locator('article.activity-card')
      .filter({
        has: page.getByRole('heading', {
          name: 'Linked practice',
          exact: true,
        }),
      });
    await practice
      .getByText('Edit activity & reflection', { exact: true })
      .click();
    await practice
      .getByLabel('Learning date', { exact: true })
      .fill('2026-10-28');
    await practice.getByRole('button', { name: 'Save activity' }).click();
    await practice.waitFor({ state: 'detached' });
    const nextDay = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-28');
    assert.equal(nextDay.activities[0].goal_id, workspace.goals[0].id);
    assert.equal(nextDay.activities[0].completed, false);
    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    await page
      .getByLabel('Display name', { exact: true })
      .fill('Edited fixture');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await page.getByText('Saved.', { exact: true }).waitFor();
    assert.equal(
      (
        await db.query<{ display_name: string }>(
          'SELECT display_name FROM learners WHERE id=$1',
          [ids[0]],
        )
      ).rows[0].display_name,
      'Edited fixture',
    );
    await page.getByRole('button', { name: 'Subjects', exact: true }).click();
    await page.getByText('Edit subject', { exact: true }).click();
    await page.getByLabel('Archive subject (history stays)').check();
    await page
      .getByRole('button', { name: 'Save subject', exact: true })
      .click();
    await page.getByText('Archived', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Goals', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Compare objects to ten', exact: true })
      .waitFor();
    await page.goto(`http://127.0.0.1:${address.port}/?viewer`);
    await page.getByText('You have view access.', { exact: false }).waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Add to day' }).count(),
      0,
    );
    assert.equal(await page.getByRole('checkbox').first().isDisabled(), true);
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
    await db.close();
  }
});
