import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(
    await readFile(
      new URL(
        '../migrations/011_family_learning_workflow.sql',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const result = await client.query(
    "SELECT relrowsecurity FROM pg_class WHERE oid IN ('learner_subject_levels'::regclass,'learning_saved_resources'::regclass,'learning_day_preferences'::regclass)",
  );
  if (result.rows.length !== 3 || result.rows.some((r) => !r.relrowsecurity))
    throw Error('Row security verification failed');
  console.log('Family workflow migration applied; row security verified.');
} catch {
  console.error(
    'Family workflow migration failed. Check the server database connection and required earlier migrations.',
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
