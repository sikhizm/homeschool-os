import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { class5MappingProposals } from '../src/lib/curriculum/class5-mapping';
import { frameworkEvidence } from '../src/lib/global-curriculum/framework-evidence';

test('curriculum pages keep book filters, owner review and framework cards usable at seven widths', async t => {
  const bundle = await build({
    stdin: {
      contents: `
        import {renderToStaticMarkup} from 'react-dom/server';
        import Global from './src/app/global-curriculum/page';
        import Books from './src/app/ncert-books/page';
        import Library from './src/app/library/page';
        import {setReview} from '@/lib/db';
        export async function render(path, query) {
          setReview(query.fixture);
          const props = {searchParams: Promise.resolve(query)};
          const page = path === '/library' ? await Library()
            : path === '/ncert-books' ? await Books(props) : await Global(props);
          return renderToStaticMarkup(<div className="app-shell"><div className="app-shell-body">
            <div className="app-shell-content">{page}</div>
          </div></div>);
        }`,
      resolveDir: process.cwd(), loader: 'tsx',
    },
    bundle: true, write: false, platform: 'node', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' },
    plugins: [{
      name: 'isolated-curriculum-fixture',
      setup(api) {
        api.onResolve({ filter: /^@\/lib\/(auth\/server|db)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
          contents: path.endsWith('/db') ? `
            let scenario;
            export function setReview(value) { scenario = value; }
            export function getSql() {
              const state = scenario;
              return async strings => {
                if (strings.join('').includes('curriculum_mapping_reviews')) {
                  if (state === 'unavailable') throw new Error('Fixture storage unavailable');
                  return state === 'approved' ? [{
                    mapping_id: ${JSON.stringify(class5MappingProposals[0].id)},
                    review_status: 'approved', outcome_id: null, relationship_type: null,
                    revision: 1, reviewer_user_id: null, supersedes_id: null,
                  }] : [];
                }
                return state === 'member' ? [] : [{ id: 'fixture-family' }];
              };
            }
          ` : "export const auth = { getSession: async () => ({data:{user:{id:'fixture-owner'}}}) };",
        }));
      },
    }],
  });
  const fixture = { exports: {} as { render(path: string, query: Record<string, string>): Promise<string> } };
  runInNewContext(bundle.outputFiles[0].text, { module: fixture, exports: fixture.exports, require: createRequire(import.meta.url) });
  const css = (await Promise.all([
    'src/app/globals.css', 'src/app/global-curriculum/framework-cards.css', 'src/app/ncert-books/catalogue.css',
  ].map(path => readFile(path, 'utf8')))).join('\n').replace("@import 'tailwindcss';", '');
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    try {
      const markup = await fixture.exports.render(url.pathname, Object.fromEntries(url.searchParams));
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}' + css + '</style>' + markup);
    } catch (error) {
      response.statusCode = 500;
      response.end(String(error));
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
    const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

    for (const [width, minColumns, maxColumns] of [[320,1,1],[375,1,1],[768,2,2],[1024,2,2],[1280,3,4],[1440,3,4],[1920,3,4]]) {
      await t.test(width + 'px', async () => {
        await page.setViewportSize({ width, height: 900 });
        assert.equal((await page.goto(root + '/global-curriculum'))?.status(), 200);
        assert.ok(await noOverflow(), 'Global Curriculum page fits the viewport');
        const cards = page.locator('.framework-evidence-card');
        assert.equal(await cards.count(), frameworkEvidence.length);
        const layout = await cards.evaluateAll(nodes => {
          const firstTop = nodes[0].getBoundingClientRect().top;
          return {
            columns: nodes.filter(node => Math.abs(node.getBoundingClientRect().top - firstTop) < 1).length,
            contained: nodes.every(node => {
              const rect = node.getBoundingClientRect();
              return [...node.querySelectorAll('header, .verify-badge, dl, footer, a')].every(child => {
                const box = child.getBoundingClientRect();
                return box.left >= rect.left && box.right <= rect.right && box.bottom <= rect.bottom
                  && child.clientWidth >= child.scrollWidth;
              });
            }),
            gap: getComputedStyle(nodes[0].parentElement!).columnGap,
          };
        });
        assert.ok(layout.columns >= minColumns && layout.columns <= maxColumns, 'column count: ' + layout.columns);
        assert.ok(layout.contained, 'card contents and badges stay within card bounds');
        assert.equal(layout.gap, '16px');
        assert.equal(await cards.locator('h3').first().evaluate(node => getComputedStyle(node).fontSize), '18px');
        assert.deepEqual(await cards.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')).sort()),
          frameworkEvidence.flatMap(record => record.sourceUrls).sort());

        assert.equal((await page.goto(root + '/ncert-books?grade=1'))?.status(), 200);
        assert.ok(await noOverflow(), 'NCERT catalogue page fits the viewport');
        const select = page.locator('select[name="grade"]');
        await select.selectOption('3');
        assert.equal(await select.locator('option:checked').textContent(), 'Class 3 · 7 book titles reviewed');
        assert.equal(await select.locator('option').count(), 10);
        assert.ok(await select.evaluate(node => {
          const field = node as HTMLSelectElement;
          const context = document.createElement('canvas').getContext('2d')!;
          const style = getComputedStyle(field);
          context.font = [style.fontWeight, style.fontSize, style.fontFamily].join(' ');
          return context.measureText(field.selectedOptions[0].text).width + 24 <= field.clientWidth;
        }), 'selected grade text has room');
      });
    }

    assert.equal((await page.goto(root + '/ncert-books?grade=3'))?.status(), 200);
    await page.locator('select[name="subject"]').selectOption('Mathematics');
    await page.getByRole('button', { name: 'Show books' }).click();
    await page.waitForURL('**/ncert-books?grade=3&subject=Mathematics');
    assert.equal(await page.getByRole('heading', { name: 'Maths Mela' }).count(), 1);
    assert.ok(await page.locator('.ncert-chapter-title-link').count());
    assert.ok(await page.getByText('Classes 11 and 12 have no indexed books here.', { exact: false }).count());

    await page.goto(root + '/library?fixture=approved');
    const admin = page.getByRole('region', { name: 'Curriculum Administration & Quality' });
    assert.equal(await admin.getByRole('link', { name: /Curriculum Mapping Review/ }).getAttribute('href'), '/curriculum-mapping');
    assert.ok(await admin.getByText((class5MappingProposals.length - 1) + ' proposals awaiting review').count());
    assert.equal(await page.getByRole('region', { name: 'Collections & studios' }).getByText('Curriculum Mapping Review').count(), 0);
    await page.goto(root + '/library?fixture=unavailable');
    assert.ok(await admin.getByText('Review count unavailable').count());
    await page.goto(root + '/library?fixture=member');
    assert.equal(await admin.count(), 0);
  } finally {
    await browser?.close();
    server.close();
  }
});
