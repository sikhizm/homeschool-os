import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const sql=await readFile(new URL('../migrations/010_study_material_pdf_files.sql',import.meta.url),'utf8');
 await client.query(sql);
 const check=await client.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.study_material_pdf_files'::regclass");
 if(check.rows[0]?.relrowsecurity!==true)throw new Error('Row security verification failed for study_material_pdf_files');
 console.log('Study Material PDF storage migration applied; row security is enabled.');
}catch(error){console.error('Study Material PDF migration failed. Check the database role and schema.',error&&typeof error==='object'&&'code' in error?String(error.code):'');process.exitCode=1;}
finally{await client.end();}
