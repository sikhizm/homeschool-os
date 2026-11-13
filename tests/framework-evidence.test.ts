import {test} from 'node:test';
import assert from 'node:assert/strict';
import {globalFrameworks,globalSkills} from '../src/lib/global-curriculum/catalogue';
import {frameworkEvidence,frameworkEvidenceFor,frameworkEvidenceSummary,validateFrameworkEvidence} from '../src/lib/global-curriculum/framework-evidence';

test('every visible curriculum lens has one complete, source-aware evidence record',()=>{
 assert.deepEqual(validateFrameworkEvidence(),[]);
 assert.equal(frameworkEvidence.length,globalFrameworks.length);
 assert.equal(new Set(frameworkEvidence.map(record=>record.id)).size,frameworkEvidence.length);
 for(const framework of globalFrameworks)assert.ok(frameworkEvidenceFor(framework.id));
});

test('framework source records state scope and limitations without inventing equivalencies',()=>{
 const summary=frameworkEvidenceSummary();
 assert.equal(summary.sourceRecords,7);
 assert.equal(summary.frameworkLenses,5);
 assert.equal(summary.outcomeLevelCrosswalks,0);
 assert.equal(summary.approvedEquivalencies,0);
 for(const record of frameworkEvidence){
  assert.ok(record.scope.length>20);
  assert.ok(record.limits.length>0);
  if(record.mappingGate==='blocked-until-exact-outcome-evidence-and-human-review'){
   assert.equal(record.outcomeEvidenceStatus,'not-transcribed');
   assert.ok(record.sourceUrls.every(url=>url.startsWith('https://')));
  }
 }
});

test('Singapore MOE reference uses the official October 2025 Primary 1–6 mathematics syllabus',()=>{
 const record=frameworkEvidenceFor('singapore');
 assert.ok(record?.sourceUrls[0].includes('updated-october-2025'));
 assert.match(record?.scope??'',/Primary 1–6/);
 assert.match(record?.stageScope??'',/mathematics/);
});

test('Cambridge and IB are not forced into NCERT grade equivalencies',()=>{
 const cambridge=frameworkEvidenceFor('cambridge');
 const ib=frameworkEvidenceFor('ib');
 assert.match(cambridge?.stageScope??'',/Stages 1–6/);
 assert.match(ib?.stageScope??'',/school-developed/);
 assert.equal(cambridge?.mappingGate,'blocked-until-exact-outcome-evidence-and-human-review');
 assert.equal(ib?.mappingGate,'blocked-until-exact-outcome-evidence-and-human-review');
});

test('all current skill-framework relationships remain explicitly context-only',()=>{
 assert.ok(globalSkills.length>0);
 assert.ok(globalSkills.every(skill=>skill.editorialStatus==='illustrative'&&skill.sourceMapping==='framework-context-only'));
 assert.ok(globalSkills.every(skill=>skill.frameworks.every(id=>frameworkEvidence.some(record=>record.id===id))));
});

test('ePathshala and original enrichment are not treated as external standards',()=>{
 assert.equal(frameworkEvidenceFor('epathshala')?.mappingGate,'not-applicable');
 assert.equal(frameworkEvidenceFor('original')?.sourceUrls.length,0);
 assert.equal(frameworkEvidenceFor('original')?.mappingGate,'not-applicable');
});
