import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const sql=await readFile(new URL('../migrations/004_ncert_chapter_progress.sql',import.meta.url),'utf8');
 await client.query(sql);
 const check=await client.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.ncert_chapter_progress'::regclass");
 if(check.rows[0]?.relrowsecurity!==true)throw new Error('Row security verification failed');
 console.log('NCERT chapter progress migration applied and row security verified.');
}catch(error){
 console.error('NCERT progress migration failed. Verify database role and schema privately.',error&&typeof error==='object'&&'code' in error?String(error.code):'');
 process.exitCode=1;
}finally{await client.end();}
