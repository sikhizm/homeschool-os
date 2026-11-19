import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

test('challenge migration preserves learners and allows retries but only one passing attempt', async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE TABLE learners (id text PRIMARY KEY); INSERT INTO learners VALUES ('learner');");
    const migration = await readFile(new URL('../migrations/018_learning_challenges.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const result = await db.query<{id: string}>(`INSERT INTO learning_challenges
      (learner_id, title, criteria, assigned_on, original_deadline, deadline, promised_reward, on_time_points, early_bonus, late_points)
      VALUES ('learner', 'Recall the 17 times table', 'Ten correct answers', '2026-11-19', '2026-11-23', '2026-11-23',
        'Choose a game', 10, 5, 0) RETURNING id`);
    const {id} = result.rows[0];
    await db.query("INSERT INTO learning_challenge_attempts (challenge_id, attempted_on, passed) VALUES ($1, '2026-11-20', false), ($1, '2026-11-21', false), ($1, '2026-11-22', true)", [id]);
    await assert.rejects(db.query("INSERT INTO learning_challenge_attempts (challenge_id, attempted_on, passed) VALUES ($1, '2026-11-22', true)", [id]));
    await assert.rejects(db.query('UPDATE learning_challenges SET reward_given_at = now() WHERE id = $1', [id]));
    await assert.rejects(db.query("UPDATE learning_challenges SET deadline = '2026-11-22' WHERE id = $1", [id]));
  } finally {
    await db.close();
  }
});
