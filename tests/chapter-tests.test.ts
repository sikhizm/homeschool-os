import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { parseTestMutation, summarizeTests, type Attempt } from '../src/lib/chapter-tests/model';

const attempt = (id: string, group: string, date: string, obtained: number, total = 20): Attempt => ({
  id, assessmentId: group, chapterId: 'chapter', date, obtained, total,
  title: 'Paper test', createdAt: '2026-11-15T08:00:00.000000', remarks: '',
});

test('weights assessments equally, keeps retests, and uses only attempts in the reporting window', () => {
  const attempts = [attempt('3', 'a', '2026-11-10', 17), attempt('1', 'a', '2026-10-01', 12),
    attempt('2', 'b', '2026-10-05', 8, 10)];
  const report = summarizeTests(attempts);
  assert.equal(report.assessments.length, 2);
  assert.equal(report.primaryAverage, 82.5);
  assert.equal(report.allAttemptsAverage, 75);
  assert.equal(report.best, 85);
  assert.equal(report.chapters, 1);
  assert.equal(report.assessments[0].improvement, 25);
  assert.deepEqual(report.assessments[0].attempts.map(({ number }) => number), [1, 2]);
  const october = summarizeTests(attempts.filter(({ date }) => date < '2026-11-01'));
  assert.equal(october.primaryAverage, 70);
  assert.equal(october.allAttemptsAverage, 70);
  assert.equal(october.assessments[0].improvement, null);
});

test('orders same-date attempts deterministically and renumbers after an edit or deletion', () => {
  const first = attempt('1', 'a', '2026-11-10', 12);
  const second = attempt('2', 'a', '2026-11-10', 17);
  assert.deepEqual(summarizeTests([second, first]).history.map(({ id }) => id), ['1', '2']);
  assert.equal(summarizeTests([second, { ...first, date: '2026-11-11' }]).latest, 60);
  assert.equal(summarizeTests([second]).history[0].number, 1);
  assert.equal(summarizeTests([]).primaryAverage, null);
});

test('allows zero obtained marks and omitted remarks; rejects invalid dates and scores', () => {
  const input = { learnerId: 'learner', operation: 'first', title: 'Maths', date: '2026-11-15', total: 20, obtained: 0 };
  assert.equal(parseTestMutation(input).remarks, '');
  assert.equal(parseTestMutation(input).obtained, 0);
  for (const bad of [{ total: 0 }, { obtained: 21 }, { obtained: '0' }, { obtained: -1 }, { date: '2026-02-30' }])
    assert.throws(() => parseTestMutation({ ...input, ...bad }));
});

test('migration enforces family ownership and preserves grouped attempts during edit and delete', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TABLE learners (id uuid PRIMARY KEY, family_id int NOT NULL, archived_at timestamptz);
      CREATE TABLE family_members (family_id int, auth_user_id text, role text);
      INSERT INTO learners VALUES ('00000000-0000-0000-0000-000000000001', 1, NULL),
        ('00000000-0000-0000-0000-000000000002', 1, NULL);
      INSERT INTO family_members VALUES (1, 'parent', 'owner'), (1, 'viewer', 'member'), (2, 'other', 'owner');
    `);
    const migration = await readFile('migrations/014_chapter_tests.sql', 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const learner = '00000000-0000-0000-0000-000000000001';
    const sibling = '00000000-0000-0000-0000-000000000002';
    async function mutate(operation: string, target: string | null = null, actor = 'parent', learnerId = learner) {
      const { rows } = await db.query<{ status: string }>(
        "SELECT mutate_ncert_test($1, $2, 'chapter', $3, $4, 'Paper test', '2026-11-15', 20, 12, '') AS status",
        [actor, learnerId, operation, target],
      );
      return rows[0].status;
    }
    assert.equal(await mutate('first', null, 'other'), 'forbidden');
    assert.equal(await mutate('first', null, 'viewer'), 'forbidden');
    assert.equal(await mutate('new'), 'assessment_type');
    assert.equal(await mutate('first'), 'saved');
    assert.equal(await mutate('first'), 'assessment_type');
    const { rows: [group] } = await db.query<{ id: string }>('SELECT id FROM ncert_test_assessments');
    const { rows: [original] } = await db.query<{ id: string }>('SELECT id FROM ncert_test_attempts');
    assert.equal(await mutate('retest', group.id, 'parent', sibling), 'missing');
    assert.equal(await mutate('retest', group.id), 'saved');
    assert.equal(await mutate('edit', original.id), 'saved');
    assert.equal(await mutate('delete_group', original.id), 'history_changed');
    assert.equal(await mutate('delete', original.id), 'saved');
    const { rows: [remaining] } = await db.query<{ id: string }>('SELECT id FROM ncert_test_attempts');
    assert.equal(await mutate('delete', remaining.id), 'history_changed');
    assert.equal(await mutate('delete_group', remaining.id), 'saved');
    assert.equal((await db.query('SELECT id FROM ncert_test_assessments')).rows.length, 0);
  } finally {
    await db.close();
  }
});
