import { Client, neonConfig } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL securely before applying Phase 04.');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
try{
 await client.connect();
 const metadata=await client.query("SELECT to_regclass('public.learners') IS NOT NULL AS learners_present,to_regclass('public.learning_activities') IS NOT NULL AS activities_present");
 if(!metadata.rows[0]?.learners_present||!metadata.rows[0]?.activities_present)throw new Error('Phase 02 learning schema is missing.');
 const before=(await client.query('SELECT count(*)::text AS count FROM public.learners')).rows[0].count;
 const sql=await readFile(new URL('../migrations/002_learning_planning.sql',import.meta.url),'utf8');
 await client.query(sql);
 const after=(await client.query('SELECT count(*)::text AS count FROM public.learners')).rows[0].count;
 const rls=(await client.query("SELECT relrowsecurity AS enabled FROM pg_class WHERE oid='public.learning_planning_periods'::regclass")).rows[0]?.enabled;
 if(before!==after||!rls)throw new Error('Planning migration verification failed. Review the database before proceeding.');
 console.log('Phase 04 planning table verified; row-level security enabled; learner count unchanged.');
}catch(error){
 console.error('Planning migration failed. Inspect the secure database connection and schema.',error&&typeof error==='object'&&'code'in error?String(error.code):'');
 process.exitCode=1;
}finally{await client.end();}
