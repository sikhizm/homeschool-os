import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const migration = await readFile(new URL('../migrations/016_weekly_chapter_outcomes.sql', import.meta.url), 'utf8');
  await client.query(migration);
  console.log('Weekly chapter outcomes migration applied.');
} catch (error) {
  console.error('Weekly chapter outcomes migration failed.', error?.code ?? '');
  process.exitCode = 1;
} finally {
  await client.end();
}
