import { readFile } from 'node:fs/promises';
import { Client, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL before migration.');
neonConfig.webSocketConstructor = WebSocket;
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(await readFile(new URL('../migrations/013_year_plan_tracking.sql', import.meta.url), 'utf8'));
  console.log('Year plan tracking migration applied.');
} finally {
  await client.end();
}
