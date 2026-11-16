import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { ncertChapterSlots, textbookById } from '../src/lib/ncert/textbooks';
import { buildStudyPrompt, MATERIALS, type MaterialId } from '../src/lib/study-materials/prompt';

const component = 'src/app/ncert-books/chapter/[chapterId]/study-material-studio.tsx';
const stylesheet = 'src/app/study-material-studio.css';
const baseline = process.env.STUDY_PACK_BASELINE;

test('study pack tiles preserve all material and document actions', async () => {
  const chapter = ncertChapterSlots.find(item => item.id === 'ncert-4-maths-mela-ch-01');
  assert.ok(chapter);
  const book = textbookById(chapter.bookId);
  assert.ok(book);
  const resourceUrl = book.sourceUrl;
  const name = 'Example Learner';
  const entry = `
    import {createRoot} from 'react-dom/client';
    import Studio from './${component}';
    createRoot(document.getElementById('root')).render(<Studio chapter={${JSON.stringify(chapter)}} book={${JSON.stringify(book)}} grade={4} resourceUrl={${JSON.stringify(resourceUrl)}} />);`;
  async function bundle(ref?: string) {
    return (await build({
      stdin: { contents: entry, resolveDir: process.cwd(), loader: 'tsx' },
      bundle: true, write: false, format: 'iife', jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: ref ? [{
        name: 'baseline-study-builder',
        setup(api) {
          api.onLoad({ filter: /study-material-studio\.tsx$/ }, () => ({
            contents: execFileSync('git', ['show', ref + ':' + component], { encoding: 'utf8' }),
            resolveDir: resolve('src/app/ncert-books/chapter/[chapterId]'), loader: 'tsx',
          }));
        },
      }] : [],
    })).outputFiles[0].text;
  }
  const [current, previous, globalCss, currentCss] = await Promise.all([
    bundle(), baseline ? bundle(baseline) : undefined,
    readFile('src/app/globals.css', 'utf8'), readFile(stylesheet, 'utf8'),
  ]);
  const baselineCss = baseline ? execFileSync('git', ['show', baseline + ':' + stylesheet], { encoding: 'utf8' }) : '';
  const server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (path.endsWith('.js')) {
      response.setHeader('Content-Type', 'application/javascript');
      response.end(path === '/before.js' ? previous : current);
    } else if (path.startsWith('/api/')) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(path === '/api/study-materials'
        ? { documents: [], learner: { role: 'owner' } }
        : { learners: [{ learner_id: 'fixture', display_name: name, stage: 'Class 4', role: 'owner' }] }));
    } else {
      const before = path === '/before';
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}' +
        globalCss.replace("@import 'tailwindcss';", '') + (before ? baselineCss : currentCss) +
        '</style><div class="app-shell"><div class="app-shell-body"><main class="family-dashboard" id="root"></main></div></div>' +
        '<script src="' + (before ? '/before.js' : '/after.js') + '"></script>');
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const root = 'http://127.0.0.1:' + address.port;
    for (const [width, columns, label] of [[375, 2, 'mobile'], [768, 3, 'tablet'], [1440, 5, 'desktop']] as const) {
      await page.setViewportSize({ width, height: 900 });
      if (baseline && label !== 'tablet') {
        await page.goto(root + '/before');
        await page.getByRole('button', { name: 'Preview prompt' }).waitFor();
        await page.locator('.study-studio').screenshot({ path: '/tmp/study-pack-before-' + label + '.png' });
      }
      await page.goto(root + '/after');
      await page.getByRole('button', { name: 'Preview prompt' }).waitFor();
      const grid = page.locator('.study-group-grid');
      assert.equal(await grid.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length), columns);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (process.env.CI && label !== 'tablet') {
        await page.locator('.study-studio').screenshot({ path: '/tmp/study-pack-after-' + label + '.png' });
      }
    }

    const panel = page.getByRole('region', { name: 'Choose study materials' });
    const tiles = panel.locator('.study-category-tile');
    assert.equal(await tiles.count(), 5);
    const groups = [
      ['Learn & understand', 6], ['Revise & remember', 5], ['Practice & apply', 10],
      ['Test & assess', 5], ['Parent & child activities', 1],
    ] as const;
    for (const [index, [title, count]] of groups.entries()) {
      const tile = tiles.nth(index);
      assert.match(await tile.innerText(), new RegExp(count + (count === 1 ? ' option' : ' options')));
      if (index) {
        await tile.focus();
        await page.keyboard.press('Enter');
      }
      const options = panel.getByRole('group', { name: title }).getByRole('checkbox');
      assert.equal(await options.count(), count);
      await options.last().check();
      assert.equal(await panel.locator('.study-category-tile[aria-expanded="true"]').count(), 1);
      assert.match(await tile.innerText(), /selected/);
    }
    await tiles.first().click();
    assert.ok(await panel.getByRole('group', { name: 'Learn & understand' }).getByRole('checkbox').last().isChecked());
    await tiles.first().click();
    assert.equal(await panel.locator('[aria-expanded="true"]').count(), 0);
    assert.equal(await panel.getByRole('status').innerText(), '6 selected');

    const expectedPrompt = (materials: MaterialId[], largePrint = false) => buildStudyPrompt({
      student: name, stage: 'Class 4', book, chapter, resourceUrl, materials,
      difficulty: 'standard', language: 'English', largePrint,
    });
    await panel.getByRole('button', { name: 'Clear selection' }).click();
    assert.ok(await panel.getByRole('button', { name: 'Preview prompt' }).isDisabled());
    await panel.getByRole('button', { name: 'Select all' }).click();
    assert.equal(await panel.getByRole('status').innerText(), '27 selected');
    await panel.getByRole('button', { name: 'Preview prompt' }).click();
    const preview = page.getByRole('textbox', { name: /Complete prompt/ });
    assert.equal(await preview.inputValue(), expectedPrompt(MATERIALS.slice(1).map(([id]) => id)));
    await panel.getByRole('button', { name: 'Balanced study pack' }).click();
    assert.equal(await panel.getByRole('status').innerText(), '5 selected');
    await panel.getByRole('checkbox', { name: 'Large print' }).check();
    assert.equal(await preview.inputValue(), expectedPrompt(['full-notes','quick-sheet','worksheets','chapter-test','answer-key'], true));

    await page.getByRole('button', { name: 'Use complete pack' }).click();
    assert.equal(await preview.inputValue(), expectedPrompt(['complete-pack'], true));
    await page.evaluate(`Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: async text => sessionStorage.setItem('copied-study-prompt', text)
    })`);
    await page.getByRole('button', { name: 'Copy PDF prompt' }).click();
    await page.getByText('Prompt copied.', { exact: false }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('copied-study-prompt')), expectedPrompt(['complete-pack'], true));
    await tiles.last().click();
    await panel.getByRole('group', { name: 'Parent & child activities' }).getByRole('checkbox').check();
    assert.equal(await preview.inputValue(), expectedPrompt(['oral-cards'], true));

    await page.getByRole('button', { name: 'Import generated document' }).click();
    await page.getByRole('textbox', { name: 'Or paste editable HTML / Markdown' }).fill('<p>Printable example</p>');
    await page.getByRole('button', { name: 'Preview A4' }).click();
    assert.match(await page.locator('iframe[title="Isolated A4 document preview"]').getAttribute('srcdoc') ?? '', /font-size:16pt/);
    await page.getByRole('button', { name: 'Open Study Library' }).click();
    await page.getByText('No saved materials yet.', { exact: false }).waitFor();
  } finally {
    await browser?.close();
    server.close();
  }
});
