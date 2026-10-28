import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL securely before migration.');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const metadata=await client.query("SELECT to_regclass('public.learners') IS NOT NULL AS learners_present,to_regclass('public.learning_activities') IS NOT NULL AS activities_present");
 if(!metadata.rows[0]?.learners_present||!metadata.rows[0]?.activities_present)throw new Error('Learning schema must be available first.');
 const sql=await readFile(new URL('../migrations/003_learning_portfolios.sql',import.meta.url),'utf8');
 // This creates an independent table and adds no learner rows or portfolio records.
 await client.query(sql);
 const status=await client.query("SELECT c.relrowsecurity AS rls,(SELECT count(*) FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name='learning_portfolio_entries' AND grantee='PUBLIC')::int AS public_grants FROM pg_class c WHERE c.oid='public.learning_portfolio_entries'::regclass");
 if(!status.rows[0]?.rls||Number(status.rows[0]?.public_grants)!==0)throw new Error('Portfolio table security verification failed.');
 console.log('Portfolio table present with row-level security and no PUBLIC privileges. No records created.');
}catch(e){
 console.error('Portfolio migration failed. Review database access/schema privately.',e&&typeof e==='object'&&'code'in e?String(e.code):'');
 process.exitCode=1;
}finally{await client.end();}
