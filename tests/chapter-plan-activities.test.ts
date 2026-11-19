import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

test('a chapter activity can exist once in each plan period per learner', async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE TABLE learners (id text PRIMARY KEY); INSERT INTO learners VALUES ('learner');");
    const migration = await readFile(new URL('../migrations/019_chapter_plan_activities.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const {rows} = await db.query(`INSERT INTO chapter_plan_activities VALUES
      ('learner', 'chapter', 'reading', 'week', '2026-11-16'),
      ('learner', 'chapter', 'reading', 'day', '2026-11-19'),
      ('learner', 'chapter', 'revision', 'day', '2026-11-19'),
      ('learner', 'chapter', 'test', 'day', '2026-11-19'),
      ('learner', 'chapter', 'reading', 'day', '2026-11-19')
      ON CONFLICT DO NOTHING RETURNING activity`);
    assert.equal(rows.length, 4);
  } finally {
    await db.close();
  }
});
