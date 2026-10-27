import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';

// Only schema metadata and aggregate verification status are printed. Never row data.
const mode = process.argv[2];
if (!['inspect', 'migrate'].includes(mode))
  throw new Error('Use database.mjs inspect or migrate');
if (!process.env.DATABASE_URL)
  throw new Error(
    'Configure DATABASE_URL securely before running database commands.',
  );
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const schema =
    await client.query(`SELECT table_name, column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns WHERE table_schema='public'
    AND table_name IN ('families','family_members','learners','learning_subjects','learner_objectives','learning_activities','learning_plan_starters')
    ORDER BY table_name, ordinal_position`);
  console.table(schema.rows);
  if (mode === 'migrate') {
    for (const table of ['families', 'family_members', 'learners']) {
      if (!schema.rows.some((row) => row.table_name === table))
        throw new Error(
          'Required existing schema missing; stop and inspect before migration.',
        );
    }
    const fingerprintSql = `SELECT count(*)::text AS count, md5(coalesce(string_agg(md5(row_to_json(l)::text), '' ORDER BY id),'')) AS fingerprint FROM public.learners l`;
    const before = (await client.query(fingerprintSql)).rows[0];
    await client.query(
      await readFile(
        new URL('../migrations/001_learning_management.sql', import.meta.url),
        'utf8',
      ),
    );
    const after = (await client.query(fingerprintSql)).rows[0];
    if (
      before.count !== after.count ||
      before.fingerprint !== after.fingerprint
    )
      throw new Error(
        'Learner verification differs; investigate concurrent edits before proceeding. No learner writes were issued by this migration.',
      );
    const policies =
      await client.query(`SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('learning_subjects','learner_objectives','learning_activities','learning_plan_starters')`);
    if (
      policies.rows.length !== 4 ||
      policies.rows.some((row) => !row.relrowsecurity)
    )
      throw new Error('Expected row security was not verified.');
    console.log(
      'Additive migration applied; existing learner rows unchanged; row security enabled on all four new tables.',
    );
  }
} catch (error) {
  // Driver errors can include credentials or private data. Keep output generic.
  console.error(
    `Database ${mode} failed. Verify access, connection role and schema privately.`,
    error && typeof error === 'object' && 'code' in error
      ? `Code: ${error.code}`
      : '',
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
