import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{await client.connect();const sql=await readFile(new URL('../migrations/009_study_material_studio.sql',import.meta.url),'utf8');await client.query(sql);for(const name of ['study_material_documents','study_material_versions']){const check=await client.query('SELECT relrowsecurity FROM pg_class WHERE oid=$1::regclass',[`public.${name}`]);if(check.rows[0]?.relrowsecurity!==true)throw new Error(`Row security verification failed for ${name}`);}console.log('Study Material Studio migration applied; both private tables have row security enabled.');}catch(error){console.error('Study Material Studio migration failed. Check the database role and schema.',error&&typeof error==='object'&&'code' in error?String(error.code):'');process.exitCode=1;}finally{await client.end();}
