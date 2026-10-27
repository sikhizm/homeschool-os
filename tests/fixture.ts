import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { parseCommand } from '../src/lib/learning/model';
import { executeCommand, type Sql } from '../src/lib/learning/service';

// Synthetic fixtures live only in this in-memory database. Never use production credentials.
export async function fixture(pk = 'uuid') {
  const db = new PGlite();
  const ids =
    pk === 'uuid'
      ? [
          '11111111-1111-4111-8111-111111111111',
          '22222222-2222-4222-8222-222222222222',
        ]
      : ['1', '2'];
  await db.exec(`CREATE TABLE families (id text PRIMARY KEY); CREATE TABLE family_members (family_id text REFERENCES families(id), auth_user_id text, role text, created_at timestamptz DEFAULT now());
    CREATE TABLE learners (id ${pk} PRIMARY KEY, family_id text REFERENCES families(id), display_name text, stage text, created_at timestamptz DEFAULT now());
    INSERT INTO families VALUES ('family-a'), ('family-b');
    INSERT INTO family_members (family_id,auth_user_id,role) VALUES ('family-a','owner-a','owner'),('family-a','viewer-a','member'),('family-b','owner-b','owner');`);
  for (const [i, id] of ids.entries())
    await db.query(
      'INSERT INTO learners (id,family_id,display_name,stage) VALUES ($1,$2,$3,$4)',
      [id, i ? 'family-b' : 'family-a', `Fixture ${i + 1}`, 'UKG'],
    );
  const migration = await readFile(
    new URL('../migrations/001_learning_management.sql', import.meta.url),
    'utf8',
  );
  await db.exec(migration);
  const sql: Sql = async (strings, ...values) => {
    const query = strings.reduce(
      (text, part, i) => text + (i ? `$${i}` : '') + part,
      '',
    );
    return (await db.query(query, values)).rows as Record<string, unknown>[];
  };
  const command = (body: unknown, user = 'owner-a', learner = ids[0]) =>
    executeCommand(sql, user, learner, parseCommand(body));
  return { db, sql, ids, command, migration };
}
