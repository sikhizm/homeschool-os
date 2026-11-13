import {Client,neonConfig} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';

if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL securely before applying the curriculum mapping migration.');
neonConfig.webSocketConstructor=WebSocket;
const client=new Client({connectionString:process.env.DATABASE_URL});
const protectedTables=['learners','auto_learning_progress','ncert_chapter_progress','learning_activities','learning_portfolio_entries'];
const requiredColumns=[
 'id','family_id','mapping_id','revision','grade','book_id','chapter_id','outcome_id','relationship_type','review_status',
 'source_url','source_edition','evidence_reference','chapter_evidence','rationale','review_reason','actor_user_id',
 'reviewer_user_id','reviewed_at','supersedes_id','created_at',
];
const requiredIndexes=['curriculum_mapping_reviews_family_lookup','curriculum_mapping_reviews_family_chapter'];
const requiredConstraints=[
 'curriculum_mapping_reviews_pkey',
 'curriculum_mapping_reviews_family_mapping_revision_key',
 'curriculum_mapping_reviews_family_mapping_id_key',
 'curriculum_mapping_reviews_supersedes_same_mapping_fkey',
 'curriculum_mapping_reviews_review_fields_check',
 'curriculum_mapping_reviews_reviewer_timestamp_check',
 'curriculum_mapping_reviews_revision_chain_check',
 'curriculum_mapping_reviews_superseded_chain_check',
 'curriculum_mapping_reviews_rejection_reason_check',
 'curriculum_mapping_reviews_approval_evidence_check',
 'curriculum_mapping_reviews_unmapped_outcome_check',
 'curriculum_mapping_reviews_mapping_target_check',
 'curriculum_mapping_reviews_outcome_relationship_check',
];

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
 const prerequisites=await client.query("SELECT to_regclass('public.families') IS NOT NULL AS families_present,to_regclass('public.family_members') IS NOT NULL AS members_present,to_regclass('public.learners') IS NOT NULL AS learners_present");
 if(!prerequisites.rows[0]?.families_present||!prerequisites.rows[0]?.members_present||!prerequisites.rows[0]?.learners_present)throw new Error('Family ownership and learner schema are required before this additive migration.');
 const before=await protectedCounts();
 await client.query(await readFile(new URL('../migrations/008_curriculum_outcome_mapping.sql',import.meta.url),'utf8'));
 const after=await protectedCounts();
 const columns=await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='curriculum_mapping_reviews'");
 const constraints=await client.query("SELECT conname FROM pg_constraint WHERE conrelid='public.curriculum_mapping_reviews'::regclass");
 const indexes=await client.query("SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='curriculum_mapping_reviews'");
 const checks=await client.query("SELECT c.relrowsecurity AS rls,c.relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) AS owns_table,(SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user) AS bypass_rls,(SELECT count(*)::int FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name='curriculum_mapping_reviews' AND grantee='PUBLIC') AS public_grants,(SELECT count(*)::int FROM pg_policies WHERE schemaname='public' AND tablename='curriculum_mapping_reviews') AS policies FROM pg_class c WHERE c.oid='public.curriculum_mapping_reviews'::regclass");
 const columnNames=new Set(columns.rows.map(row=>String(row.column_name)));
 const constraintNames=new Set(constraints.rows.map(row=>String(row.conname)));
 const indexNames=new Set(indexes.rows.map(row=>String(row.indexname)));
 if(JSON.stringify(before)!==JSON.stringify(after)
   ||requiredColumns.some(column=>!columnNames.has(column))
   ||requiredConstraints.some(constraint=>!constraintNames.has(constraint))
   ||requiredIndexes.some(index=>!indexNames.has(index))
   ||checks.rows[0]?.rls!==true
   ||(checks.rows[0]?.owns_table!==true&&checks.rows[0]?.bypass_rls!==true)
   ||Number(checks.rows[0]?.public_grants)!==0
   ||Number(checks.rows[0]?.policies)!==0)throw new Error('Schema, security, or learner-history preservation verification failed.');
 console.log('Curriculum mapping review history table schema is present with RLS, no direct policies or PUBLIC grants. Protected learner/history table counts are unchanged; no mapping records were seeded.');
}catch(error){
 console.error('Curriculum mapping migration failed. Verify database configuration and migration state privately.',error&&typeof error==='object'&&'code' in error?String(error.code):'');
 process.exitCode=1;
}finally{await client.end();}
