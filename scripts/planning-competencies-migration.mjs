import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL before migration.');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const exists=await client.query("SELECT to_regclass('public.learning_planning_periods') IS NOT NULL AS present");
 if(!exists.rows[0]?.present)throw new Error('Required planning table missing.');
 await client.query(await readFile(new URL('../migrations/007_planning_competencies.sql',import.meta.url),'utf8'));
 const check=await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='learning_planning_periods' AND column_name='competency_ids'");
 if(!check.rows.length)throw new Error('Competency column verification failed.');
 console.log('Planning competency migration applied. Existing plans are preserved.');
}catch{console.error('Planning competency migration failed. Verify database configuration privately.');process.exitCode=1;}
finally{await client.end();}
