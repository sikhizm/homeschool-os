import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {
 class5ChapterAccounts,class5MappingProposals,class5MappingSummary,class5ReviewQueue,class5ReviewQueueMetrics,
 validateClass5MappingPilot,
} from '../src/lib/curriculum/class5-mapping';
import {curriculumOutcomes,outcomeEvidenceKinds,outcomeRegistrySummary,validateOutcomeRegistry} from '../src/lib/curriculum/outcome-registry';
import {
 appendMappingReview,readClass5ReviewQueue,type MappingSql,
} from '../src/lib/curriculum/mapping-review-service';

function taggedSql(db:PGlite):MappingSql{
 return async<T extends Record<string,unknown>=Record<string,unknown>>(strings:TemplateStringsArray,...values:unknown[]):Promise<T[]>=>{
  const query=strings.reduce((text:string,part:string,index:number)=>text+(index?`$${index}`:'')+part,'');
  return (await db.query(query,values)).rows as T[];
 };
}

async function reviewFixture(){
 const db=new PGlite();
 await db.exec(`
  CREATE TABLE families(id text PRIMARY KEY);
  CREATE TABLE family_members(family_id text REFERENCES families(id),auth_user_id text,role text,created_at timestamptz DEFAULT now());
  CREATE TABLE learners(id text PRIMARY KEY,family_id text REFERENCES families(id),display_name text,stage text);
  INSERT INTO families VALUES ('family-a'),('family-b');
  INSERT INTO family_members(family_id,auth_user_id,role) VALUES
   ('family-a','owner-a','owner'),('family-a','viewer-a','member'),('family-b','owner-b','owner');
  INSERT INTO learners VALUES ('learner-a','family-a','Asha','Class 5'),('learner-b','family-b','Bilal','Class 5');
 `);
 await db.exec(await readFile(new URL('../migrations/005_auto_learning_queue.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../migrations/008_curriculum_outcome_mapping.sql',import.meta.url),'utf8'));
 await db.query("INSERT INTO auto_learning_progress(learner_id,task_id,status) VALUES ('learner-a','ncert:ncert-5-maths-mela-ch-01:read','completed')");
 return {db,sql:taggedSql(db)};
}

test('Class 5 outcome registry keeps official, original and framework claims distinct',()=>{
 assert.deepEqual(validateOutcomeRegistry(),[]);
 assert.deepEqual(validateClass5MappingPilot(),[]);
 assert.equal(outcomeRegistrySummary().official,0,'no official outcome is invented without a verified source section');
 assert.equal(outcomeRegistrySummary().original,25);
 assert.ok(curriculumOutcomes.every(outcome=>outcome.kind==='original'));
 assert.ok(curriculumOutcomes.every(outcome=>outcome.verificationStatus==='original-project-authored'));
 const sourceMismatch={...curriculumOutcomes[0],sourceId:'ncert-elementary-learning-outcomes'};
 assert.ok(validateOutcomeRegistry([sourceMismatch]).some(issue=>issue.includes('Original outcome has a non-project source record')),'an NCERT source ID cannot recast a project-authored outcome as official');
 assert.deepEqual(outcomeEvidenceKinds,['ncert_chapter','read_explore_session','practice_session','understanding_check','parent_observation','independent_recall','revision_recommendation']);
 const summary=class5MappingSummary();
 assert.deepEqual(summary,{books:7,chapters:86,draftMappings:60,draftMappedChapters:60,approvedMappings:0,unmappedChapters:26});
 assert.equal(class5ChapterAccounts.length,86);
 assert.equal(new Set(class5ChapterAccounts.map(account=>account.chapterId)).size,86);
 assert.equal(new Set(class5MappingProposals.map(mapping=>mapping.id)).size,60);
 assert.ok(class5MappingProposals.every(mapping=>mapping.reviewStatus==='draft'));
 assert.ok(class5MappingProposals.every(mapping=>mapping.outcomeId.startsWith('c5-original-')));
 const initial=class5ReviewQueue();
 assert.equal(initial.length,86,'every verified Class 5 chapter appears once in the review queue');
 assert.equal(initial.filter(item=>item.kind==='mapping'&&item.status==='draft').length,60);
 assert.equal(initial.filter(item=>item.kind==='unmapped'&&item.status==='unmapped').length,26);
 assert.ok(initial.filter(item=>item.kind==='unmapped').every(item=>Boolean(item.chapter.unmappedReason)));
});

test('only family owners can append review decisions and revisions stay family-scoped',async()=>{
 const {db,sql}=await reviewFixture();
 const mapping=class5MappingProposals[0];
 const progressBefore=(await db.query<{n:number}>('SELECT count(*)::int AS n FROM auto_learning_progress WHERE learner_id=$1',['learner-a'])).rows[0].n;

 const viewerQueue=await readClass5ReviewQueue(sql,'viewer-a');
 assert.equal(viewerQueue.authorized,false,'a non-owner cannot inspect the private review queue');
 const viewerAttempt=await appendMappingReview(sql,'viewer-a',{mappingId:mapping.id,action:'approve',confirmedHumanReview:true});
 assert.deepEqual(viewerAttempt,{ok:false,code:'forbidden',message:'Only a family owner can review curriculum mappings.'});

 const withoutConfirmation=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'approve'});
 assert.equal(withoutConfirmation.ok,false,'an approval action must include an explicit human-review confirmation');
 if(!withoutConfirmation.ok)assert.equal(withoutConfirmation.code,'invalid');
 const withoutReviewNote=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'approve',confirmedHumanReview:true});
 assert.equal(withoutReviewNote.ok,false,'a checked box alone cannot approve a title-led draft');
 if(!withoutReviewNote.ok)assert.match(withoutReviewNote.message,/source-review note/);

 const approved=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'approve',confirmedHumanReview:true,reviewReason:'I checked the official chapter source, edition, evidence and original-outcome rationale.'});
 assert.equal(approved.ok,true);
 if(approved.ok){
  assert.equal(approved.revision.reviewStatus,'approved');
  assert.equal(approved.revision.reviewerUserId,'owner-a');
  assert.ok(approved.revision.reviewedAt);
 }
 const ownerA=await readClass5ReviewQueue(sql,'owner-a');
 assert.equal(ownerA.authorized,true);
 if(ownerA.authorized){
  const item=ownerA.items.find(candidate=>candidate.kind==='mapping'&&candidate.id===mapping.id);
  assert.equal(item?.kind,'mapping');
  if(item?.kind==='mapping'){
   assert.equal(item.status,'approved');
   assert.equal(item.history.length,1);
   assert.equal(item.effective.revision,1);
  }
 }
 const ownerB=await readClass5ReviewQueue(sql,'owner-b');
 assert.equal(ownerB.authorized,true);
 if(ownerB.authorized){
  const otherFamilyItem=ownerB.items.find(candidate=>candidate.kind==='mapping'&&candidate.id===mapping.id);
  assert.equal(otherFamilyItem?.kind,'mapping');
  if(otherFamilyItem?.kind==='mapping'){
   assert.equal(otherFamilyItem.status,'draft','family B never sees family A approval');
   assert.equal(otherFamilyItem.history.length,0);
  }
 }

 const revisedMapping=class5MappingProposals[1];
 const draft=await appendMappingReview(sql,'owner-a',{mappingId:revisedMapping.id,action:'save_draft',rationale:'Owner refined this draft after checking the official contents page.'});
 assert.equal(draft.ok,true);
 const reapproved=await appendMappingReview(sql,'owner-a',{mappingId:revisedMapping.id,action:'approve',confirmedHumanReview:true,reviewReason:'I rechecked the revised source evidence and accept this family-scoped curriculum relationship.'});
 assert.equal(reapproved.ok,true);
 if(reapproved.ok)assert.ok(reapproved.revision.supersedesId,'approval revision references the previous revision');
 const rejected=await appendMappingReview(sql,'owner-a',{mappingId:class5MappingProposals[2].id,action:'reject',reviewReason:'The reviewed chapter source does not support this proposed relationship.'});
 assert.equal(rejected.ok,true);
 if(rejected.ok){
  assert.equal(rejected.revision.reviewStatus,'rejected');
  assert.equal(rejected.revision.reviewerUserId,'owner-a');
 }
 const rejectionWithoutReason=await appendMappingReview(sql,'owner-a',{mappingId:class5MappingProposals[3].id,action:'reject'});
 assert.equal(rejectionWithoutReason.ok,false);

 const progressAfter=(await db.query<{n:number}>('SELECT count(*)::int AS n FROM auto_learning_progress WHERE learner_id=$1',['learner-a'])).rows[0].n;
 assert.equal(progressAfter,progressBefore,'mapping review never writes learner progress or mastery evidence');
 const historyRows=(await db.query<{n:number}>('SELECT count(*)::int AS n FROM curriculum_mapping_reviews WHERE family_id=$1',['family-a'])).rows[0].n;
 assert.equal(historyRows,4,'append-only history retains draft, approval and rejection events');
 await db.close();
});

test('unsupported or unmapped decisions cannot manufacture an approved outcome',async()=>{
 const {db,sql}=await reviewFixture();
 const unknown=await appendMappingReview(sql,'owner-a',{mappingId:'invented-mapping',action:'approve',confirmedHumanReview:true});
 assert.equal(unknown.ok,false);
 const mapping=class5MappingProposals[4];
 const nonOfficialApproval=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'approve',confirmedHumanReview:true,sourceUrl:'https://example.invalid/not-an-ncert-source',reviewReason:'The source was checked, but this test URL is not an official NCERT source.'});
 assert.equal(nonOfficialApproval.ok,false,'approval cannot swap in an unrelated source URL');
 if(!nonOfficialApproval.ok)assert.match(nonOfficialApproval.message,/official NCERT chapter source URL/);
 const unmapped=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'mark_unmapped',reviewReason:'The checked source title is not enough to defend this candidate.'});
 assert.equal(unmapped.ok,true);
 if(unmapped.ok){
  assert.equal(unmapped.revision.reviewStatus,'unmapped');
  assert.equal(unmapped.revision.outcomeId,null);
  assert.equal(unmapped.revision.relationshipType,null);
  assert.equal(unmapped.revision.reviewerUserId,'owner-a');
  assert.ok(unmapped.revision.reviewedAt,'the deliberate unmapped decision retains reviewer/date provenance');
 }
 const queue=await readClass5ReviewQueue(sql,'owner-a');
 if(queue.authorized){
  const item=queue.items.find(candidate=>candidate.kind==='mapping'&&candidate.id===mapping.id);
  assert.equal(item?.kind,'mapping');
  if(item?.kind==='mapping'){
   assert.equal(item.status,'unmapped');
   assert.equal(item.outcome,null);
   assert.equal(class5ReviewQueueMetrics(queue.items).unmappedChapters,27);
   // The model is many-to-many: one explicitly unmapped candidate must not
   // mark the chapter unmapped if a future second candidate remains active.
   const secondCandidate={...item,id:`${item.id}-second-candidate`,status:'draft' as const};
   assert.equal(class5ReviewQueueMetrics([...queue.items,secondCandidate]).unmappedChapters,26);
  }
 }
 await db.close();
});

test('migration keeps revision chains family-local and rollback leaves protected history alone',async()=>{
 const {db,sql}=await reviewFixture();
 const mapping=class5MappingProposals[5];
 const familyAFirst=await appendMappingReview(sql,'owner-a',{mappingId:mapping.id,action:'save_draft'});
 const familyBFirst=await appendMappingReview(sql,'owner-b',{mappingId:mapping.id,action:'save_draft'});
 assert.equal(familyAFirst.ok,true);
 assert.equal(familyBFirst.ok,true);
 if(!familyAFirst.ok||!familyBFirst.ok)throw new Error('Fixture mapping revisions were not created.');
 await assert.rejects(
  db.query(`INSERT INTO curriculum_mapping_reviews(
   family_id,mapping_id,revision,grade,book_id,chapter_id,outcome_id,relationship_type,review_status,
   source_url,source_edition,evidence_reference,chapter_evidence,rationale,review_reason,
   actor_user_id,reviewer_user_id,reviewed_at,supersedes_id
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,[
   'family-b',mapping.id,2,mapping.grade,mapping.bookId,mapping.chapterId,mapping.outcomeId,mapping.relationshipType,'draft',
   mapping.sourceUrl,mapping.sourceEdition,mapping.evidenceReference,mapping.chapterEvidence,mapping.rationale,'',
   'owner-b',null,null,familyAFirst.revision.id,
  ]),
  /curriculum_mapping_reviews_supersedes_same_mapping_fkey/,
  'a revision may only supersede a record from the same family and mapping',
 );
 const progressBefore=(await db.query<{n:number}>('SELECT count(*)::int AS n FROM auto_learning_progress')).rows[0].n;
 await db.exec(await readFile(new URL('../migrations/008_curriculum_outcome_mapping.down.sql',import.meta.url),'utf8'));
 const remaining=(await db.query<{table:string|null}>("SELECT to_regclass('public.curriculum_mapping_reviews')::text AS table")).rows[0].table;
 const progressAfter=(await db.query<{n:number}>('SELECT count(*)::int AS n FROM auto_learning_progress')).rows[0].n;
 assert.equal(remaining,null,'the isolated rollback removes only the new review table');
 assert.equal(progressAfter,progressBefore,'the rollback leaves learner progress untouched');
 await db.close();
});
