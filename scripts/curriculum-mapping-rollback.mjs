import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';

const confirmation='DROP_PHASE6_CURRICULUM_MAPPING_REVIEWS';
if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL securely before running a curriculum mapping rollback.');
if(process.env.CURRICULUM_MAPPING_ROLLBACK_CONFIRM!==confirmation)throw new Error(`This destructive rollback requires CURRICULUM_MAPPING_ROLLBACK_CONFIRM=${confirmation}. Export the review history first.`);
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
const protectedTables=['learners','auto_learning_progress','ncert_chapter_progress','learning_activities','learning_portfolio_entries'];

async function protectedCounts(){
 const counts={};
 for(const table of protectedTables){
  const exists=await client.query(`SELECT to_regclass('public.${table}') IS NOT NULL AS present`);
  if(exists.rows[0]?.present)counts[table]=(await client.query(`SELECT count(*)::text AS count FROM public.${table}`)).rows[0]?.count;
 }
 return counts;
}

try{
 await client.connect();
 const exists=await client.query("SELECT to_regclass('public.curriculum_mapping_reviews') IS NOT NULL AS present");
 if(!exists.rows[0]?.present)throw new Error('The curriculum mapping review table is not present; refusing a no-op destructive command.');
 const reviewCount=(await client.query('SELECT count(*)::text AS count FROM public.curriculum_mapping_reviews')).rows[0]?.count;
 const before=await protectedCounts();
 console.warn(`Destructive rollback acknowledged: ${reviewCount} curriculum mapping audit revision(s) will be deleted from this approved target.`);
 await client.query(await readFile(new URL('../migrations/008_curriculum_outcome_mapping.down.sql',import.meta.url),'utf8'));
 const after=await protectedCounts();
 const remaining=await client.query("SELECT to_regclass('public.curriculum_mapping_reviews') IS NOT NULL AS present");
 if(remaining.rows[0]?.present||JSON.stringify(before)!==JSON.stringify(after))throw new Error('Rollback verification failed. Stop and inspect the approved database privately.');
 console.log('Curriculum mapping review table removed. Protected learner and history table counts are unchanged.');
}catch(error){
 console.error('Curriculum mapping rollback failed. Verify the approved database target and exported audit history privately.',error&&typeof error==='object'&&'code' in error?String(error.code):'');
 process.exitCode=1;
}finally{await client.end();}
