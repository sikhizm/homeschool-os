import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const migration = await readFile(new URL('../migrations/018_learning_challenges.sql', import.meta.url), 'utf8');
  await client.query(migration);
  console.log('Learning challenges migration applied.');
} catch (error) {
  console.error('Learning challenges migration failed.', error?.code ?? '');
  process.exitCode = 1;
} finally {
  await client.end();
}
