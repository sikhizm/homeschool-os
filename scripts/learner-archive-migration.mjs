import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL before migration.');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const exists=await client.query("SELECT to_regclass('public.learners') IS NOT NULL AS present");
 if(!exists.rows[0]?.present)throw new Error('Required learner table missing.');
 await client.query(await readFile(new URL('../migrations/006_learner_archiving.sql',import.meta.url),'utf8'));
 const check=await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='learners' AND column_name='archived_at'");
 if(!check.rows.length)throw new Error('Archive column verification failed.');
 console.log('Learner archive migration applied. Existing learner records and learning history are preserved.');
}catch{
 console.error('Learner archive migration failed. Verify database configuration privately.');
 process.exitCode=1;
}finally{await client.end();}
