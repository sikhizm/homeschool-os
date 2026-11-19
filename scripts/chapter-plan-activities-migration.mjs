import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const migration = await readFile(new URL('../migrations/019_chapter_plan_activities.sql', import.meta.url), 'utf8');
  await client.query(migration);
  console.log('Chapter plan activities migration applied.');
} catch (error) {
  console.error('Chapter plan activities migration failed.', error?.code ?? '');
  process.exitCode = 1;
} finally {
  await client.end();
}
