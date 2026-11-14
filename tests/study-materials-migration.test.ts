import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('study-material migration is additive, private, indexed and versions link to the same learner document',async()=>{
 const db=new PGlite();try{
  await db.exec(`CREATE TABLE families(id text PRIMARY KEY);CREATE TABLE learners(id uuid PRIMARY KEY,family_id text REFERENCES families(id),display_name text,stage text);INSERT INTO families VALUES('family-a');INSERT INTO learners VALUES('11111111-1111-4111-8111-111111111111','family-a','Test learner','Class 5');CREATE TABLE ncert_chapter_progress(learner_id uuid,chapter_id text,status text);INSERT INTO ncert_chapter_progress VALUES('11111111-1111-4111-8111-111111111111','existing-chapter','completed');`);
  await db.exec(await readFile(new URL('../migrations/009_study_material_studio.sql',import.meta.url),'utf8'));
  const security=await db.query<{relrowsecurity:boolean}>(`SELECT relrowsecurity FROM pg_class WHERE oid IN ('public.study_material_documents'::regclass,'public.study_material_versions'::regclass) ORDER BY oid`);assert.equal(security.rows.length,2);assert.ok(security.rows.every(x=>x.relrowsecurity));
  const doc=await db.query<{id:string}>(`INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference) VALUES('11111111-1111-4111-8111-111111111111','Class 5','Mathematics','ncert-5-maths-mela','ch1','Chapter notes','Notes','<p>Safe content</p>','https://ncert.nic.in/textbook.php') RETURNING id::text`);
  await db.query(`INSERT INTO study_material_versions(document_id,learner_id,version,title,document_type,safe_html) VALUES($1,'11111111-1111-4111-8111-111111111111',1,'Old version','Notes','<p>old</p>')`,[doc.rows[0].id]);
  const saved=await db.query<{version:number;count:number}>(`UPDATE study_material_documents SET version=version+1 WHERE id=$1 RETURNING version,(SELECT count(*)::int FROM study_material_versions WHERE document_id=$1) count`,[doc.rows[0].id]);assert.equal(saved.rows[0].version,2);assert.equal(saved.rows[0].count,1);
  await db.exec(`INSERT INTO families VALUES('family-b');INSERT INTO learners(id,family_id,display_name,stage) VALUES('22222222-2222-4222-8222-222222222222','family-b','Other learner','Class 5');`);
  await assert.rejects(db.query(`INSERT INTO study_material_versions(document_id,learner_id,version,title,document_type,safe_html) VALUES($1,'22222222-2222-4222-8222-222222222222',1,'Wrong owner','Notes','<p>wrong</p>')`,[doc.rows[0].id]));
  const progress=await db.query<{status:string}>(`SELECT status FROM ncert_chapter_progress WHERE chapter_id='existing-chapter'`);assert.equal(progress.rows[0].status,'completed');
  await assert.rejects(db.query(`INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference) VALUES('11111111-1111-4111-8111-111111111111','Class 5','Math','b','c','Bad','Notes','','https://example.org')`));
 }finally{await db.close();}
});
