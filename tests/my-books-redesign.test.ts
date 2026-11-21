import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('My Books stays a separate personal collection under Curriculum Library', () => {
  const page = read('src/app/library/my-books/page.tsx');
  const library = read('src/app/library/page.tsx');
  const legacy = read('src/app/ncert-books/my-books/page.tsx');
  assert.ok(page.includes('href="/library"'));
  assert.ok(page.includes('<MyBooks />'));
  assert.ok(page.includes("import './my-books.css'"));
  assert.ok(library.includes('href="/library/my-books"'));
  assert.ok(legacy.includes("redirect('/library/my-books')"));
});

test('Compact mobile layout preserves book and learner workflow actions', () => {
  const component = read('src/components/my-books.tsx');
  const css = read('src/app/library/my-books/my-books.css');

  for (const action of ["action: 'create'", "action: 'assign'", "value=\"plan\"", "value=\"log\""]) {
    assert.ok(component.includes(action), 'Missing action: ' + action);
  }
  assert.ok(component.includes('bookPageProgress(book.page_count, entries)'));
  assert.ok(component.includes('aria-label={learner.display_name +'));
  assert.ok(component.includes('Next unfinished page:'));
  assert.ok(component.includes('Reading history ('));
  assert.ok(component.includes('defaultOpen={data.books.length === 0}'));
  assert.ok(component.includes('name="firstPage"'));
  assert.ok(component.includes('name="lastPage"'));
  assert.ok(component.includes('End page must be the same as or later'));
  assert.ok(component.includes("if (daily)"), 'Do not alter Daily Rhythm integration');

  assert.ok(css.includes('.my-books-hero'));
  assert.ok(css.includes('.my-books-card'));
  assert.ok(css.includes('.my-books-page-fields'));
  assert.ok(css.includes('@media (max-width: 650px)'));
  assert.ok(css.includes('@media (max-width: 350px)'));
  assert.ok(css.includes('grid-template-columns: minmax(0, 1fr)'));
});
