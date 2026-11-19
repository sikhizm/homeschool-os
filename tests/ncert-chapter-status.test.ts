import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {chapterStatuses, normalizeChapterStatus} from '../src/lib/ncert/chapter-status';

test('chapter statuses preserve legacy completed and pending records', () => {
  assert.equal(normalizeChapterStatus('completed'), 'read');
  assert.equal(normalizeChapterStatus('assigned'), 'pending');
  assert.equal(normalizeChapterStatus('in_progress'), 'pending');
  assert.equal(normalizeChapterStatus(null), 'pending');
  for (const {id} of chapterStatuses) assert.equal(normalizeChapterStatus(id), id);
});

test('status migration retains legacy records and accepts all five statuses', async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE ncert_chapter_progress (
      chapter_id text PRIMARY KEY,
      status text NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed'))
    );
    INSERT INTO ncert_chapter_progress VALUES ('legacy', 'completed');`);
    const migration = await readFile(new URL('../migrations/017_ncert_chapter_status.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const {rows} = await db.query<{status: string}>("SELECT status FROM ncert_chapter_progress WHERE chapter_id = 'legacy'");
    assert.equal(rows[0].status, 'completed');
    for (const {id} of chapterStatuses) {
      await db.query('INSERT INTO ncert_chapter_progress VALUES ($1, $2)', [id, id]);
    }
    await assert.rejects(db.query("INSERT INTO ncert_chapter_progress VALUES ('invalid', 'unknown')"));
  } finally {
    await db.close();
  }
});
