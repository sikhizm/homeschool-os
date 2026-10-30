import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 await client.query(await readFile(new URL('../migrations/005_auto_learning_queue.sql',import.meta.url),'utf8'));
 const check=await client.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.auto_learning_progress'::regclass");
 if(!check.rows[0]?.relrowsecurity)throw new Error('Row security verification failed');
 console.log('Automatic learning progress migration applied.');
}catch(error){console.error('Migration failed. Check database configuration privately.');process.exitCode=1;}
finally{await client.end();}
