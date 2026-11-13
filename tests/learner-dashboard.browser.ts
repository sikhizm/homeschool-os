import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { queueCatalogue } from '../src/lib/auto-learning/catalogue';
import { deriveChapterProgress } from '../src/lib/auto-learning/chapter-progress';
import {
  findActiveChapter,
  findContinueSession,
  chapterStats,
  revisionChapters,
  booksForLearner,
} from '../src/lib/auto-learning/learner-dashboard';

/**
 * Browser workflow for the Phase 4 learner dashboard: the Continue Learning
 * hero, learner switching without data leakage, empty-learner friendliness,
 * revision surfacing and mobile layout — all against the real catalogue and
 * the real derivation modules, served from an in-process API.
 */
test('learner dashboard works on desktop and mobile with chapter-first data', async () => {
  const catalogueA = queueCatalogue('Class 4');
  const chapterA = catalogueA.find((t) => t.id.startsWith('ncert:') && t.id.endsWith(':read'))!;
  const chapterIdA = chapterA.id.slice('ncert:'.length, -':read'.length);
  const recordsA = [
    { task_id: `ncert:${chapterIdA}:read`, status: 'completed', updated_at: '2026-11-11T09:00:00.000Z' },
    { task_id: 'ncert:ncert-4-our-wondrous-world-ch-01:read', status: 'needs_revision', updated_at: '2026-11-10T09:00:00.000Z' },
    { task_id: 'ncert:ncert-4-veena-ch-01:read', status: 'completed', updated_at: '2026-11-09T09:00:00.000Z' },
  ];
  const chaptersA = deriveChapterProgress(catalogueA, recordsA);
  const learnerA = {
    id: 'learner-a', name: 'Simran', grade: 'Class 4', canEdit: true,
    tasks: [{ id: 'ncert:ncert-4-our-wondrous-world-ch-01:read', title: 'Living Together · Read & explore', subject: 'Environmental Studies', minutes: 15, mode: 'guided', href: '/ncert-books/chapter/ncert-4-our-wondrous-world-ch-01', status: 'needs_revision' }],
    assignedTasks: [
      { id: `ncert:${chapterIdA}:practice`, title: 'Shapes Around Us · Practice', subject: 'Mathematics', minutes: 20, mode: 'guided', href: `/ncert-books/chapter/${chapterIdA}` },
      { id: 'ncert:ncert-4-veena-ch-01:read', title: 'चिड़िया का गीत · Read & explore', subject: 'Hindi', minutes: 15, mode: 'guided', href: '/ncert-books/chapter/ncert-4-veena-ch-01' },
    ],
    upcoming: [],
    history: [
      { id: 'ncert:ncert-4-veena-ch-01:read', title: 'चिड़िया का गीत · Read & explore', subject: 'Hindi', updatedAt: '2026-11-09T09:00:00.000Z' },
      { id: `ncert:${chapterIdA}:read`, title: 'Shapes Around Us · Read & explore', subject: 'Mathematics', updatedAt: '2026-11-11T09:00:00.000Z' },
    ],
    subjects: [{ subject: 'Mathematics', completed: 1, total: 42 }],
    completed: 2, total: catalogueA.length,
    assessment: { completed: 2, understood: 1, mastered: 0, independentRecall: 0, recallWithHint: 0 },
    earnedBadges: [],
    chapterProgress: chaptersA,
    activeChapter: findActiveChapter(chaptersA),
    continueSession: findContinueSession(catalogueA, chaptersA),
    chapterStats: chapterStats(chaptersA),
    revisionChapters: revisionChapters(chaptersA),
    books: booksForLearner('Class 4', chaptersA),
  };
  const catalogueB = queueCatalogue('UKG');
  const chaptersB = deriveChapterProgress(catalogueB, []);
  const learnerB = {
    id: 'learner-b', name: 'Fateh', grade: 'UKG', canEdit: true,
    tasks: catalogueB.slice(0, 4).map((t) => ({ id: t.id, title: t.title, subject: t.subject, minutes: t.minutes, mode: t.mode ?? 'play', href: t.href, status: 'pending' })),
    assignedTasks: [],
    upcoming: [], history: [],
    subjects: [], completed: 0, total: catalogueB.length,
    assessment: { completed: 0, understood: 0, mastered: 0, independentRecall: 0, recallWithHint: 0 },
    earnedBadges: [],
    chapterProgress: chaptersB,
    activeChapter: findActiveChapter(chaptersB),
    continueSession: findContinueSession(catalogueB, chaptersB),
    chapterStats: chapterStats(chaptersB),
    revisionChapters: [], books: booksForLearner('UKG', chaptersB),
  };
  assert.ok(learnerA.continueSession, 'fixture learner A has a continue session');

  const bundle = await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {LearnHome} from './src/app/learn/learn-home'; createRoot(document.getElementById('app')).render(<LearnHome/>);`,
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
        name: 'test-link',
        setup(b) {
          b.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'test' }));
          b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
            contents: `import React from 'react';export default function Link({href,children,...rest}){return React.createElement('a',{href,...rest},children);}`,
            resolveDir: process.cwd(),
            loader: 'jsx',
          }));
        },
      },
    ],
  });
  const css = (await readFile('src/app/globals.css', 'utf8')).replace("@import 'tailwindcss';", '');
  const server = createServer(async (request, response) => {
    const url = new URL(request.url!, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ learners: [learnerA, learnerB], familyPlan: { slots: [], separate: [], budget: 60, allocated: 0, notes: [] } }));
    } else if (url.pathname === '/bundle.js') {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(bundle.outputFiles[0].text);
    } else {
      response.setHeader('Content-Type', 'text/html');
      response.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`);
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${address.port}`);

    // Continue Learning hero is the first prominent action for the returning learner.
    const hero = page.locator('.continue-hero');
    await hero.waitFor();
    const heroText = await hero.innerText();
    assert.match(heroText, /CONTINUE LEARNING/);
    assert.match(heroText, /Shapes Around Us/);
    assert.match(heroText, /Practice/);
    const startLink = hero.getByRole('link', { name: /Continue this lesson/ });
    assert.match(await startLink.getAttribute('href') ?? '', /\/learn\/lesson\?learner=learner-a&task=/);

    // Active chapter card reflects the evidence-derived status.
    const activeSection = page.locator('section').filter({ has: page.getByText('ACTIVE CHAPTER', { exact: true }) });
    await activeSection.getByRole('heading', { name: 'Shapes Around Us', exact: true }).waitFor();
    await activeSection.getByText('Ready for practice', { exact: true }).waitFor();

    // Today's assigned learning integrates the daily assignment workflow with completion state.
    await page.getByRole('heading', { name: 'Your daily workload' }).waitFor();
    const workload = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Your daily workload' }) });
    await workload.getByText('Completed', { exact: true }).waitFor();
    await workload.getByRole('link', { name: /Start/ }).first().waitFor();

    // Revision needed surfaces the chapter marked needs_revision.
    await page.getByRole('heading', { name: 'Let’s revisit these' }).waitFor();
    await page.getByText('Living Together').first().waitFor();

    // My Books shows the grade shelf with honest counts.
    await page.getByRole('heading', { name: 'Choose a book' }).waitFor();
    assert.equal(await page.locator('.book-card').count(), 4);

    // Recent learning evidence and progress overview render.
    await page.getByRole('heading', { name: 'What you did recently' }).waitFor();
    await page.getByRole('heading', { name: 'How your learning is going' }).waitFor();
    await page.getByText(/A finished session is not the same as mastery/).waitFor();

    // Keyboard navigation reaches the continue action with a visible focus ring.
    await startLink.focus();
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return Boolean(el && el.closest('.continue-hero') && getComputedStyle(el).outlineWidth !== '0px');
    });
    assert.equal(focused, true, 'continue action is keyboard reachable with a visible focus outline');

    await page.screenshot({ path: '/tmp/homeschool-learner-dashboard-desktop.png', fullPage: true });

    // Switching learners shows that learner's own data — no leakage.
    await page.getByRole('button', { name: 'Fateh' }).click();
    await page.waitForFunction(() => {
      const hero = document.querySelector('.continue-hero');
      return hero !== null && !hero.textContent!.includes('Shapes Around Us');
    });
    const heroB = await hero.innerText();
    assert.doesNotMatch(heroB, /Shapes Around Us/, 'learner A chapter must not leak into learner B');
    assert.doesNotMatch(heroB, /Living Together/);
    await page.getByText(/Story books arrive here when you start Class 1/).waitFor();

    // Mobile layout: no horizontal overflow and the hero action stays usable.
    await page.getByRole('button', { name: 'Simran' }).click();
    await page.waitForFunction(() => document.querySelector('.continue-hero')?.textContent?.includes('Shapes Around Us'));
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'no horizontal overflow at 390px');
    assert.equal(await startLink.isVisible(), true);
    await page.screenshot({ path: '/tmp/homeschool-learner-dashboard-mobile.png', fullPage: true });

    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally {
    await browser?.close();
    server.close();
  }
});
