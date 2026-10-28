import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePortfolioInput,PortfolioInputError,portfolioSummary,evidenceKinds,observationLevels} from '../src/lib/portfolio/model';
const fixture={action:'create',observedOn:'2026-11-02',kind:'baseline',area:'Mathematics',title:'Comparing fractions',details:'Learner arranged two equal paper strips and described the halves.',nextStep:'Repeat with quarters.',level:'with_support'};
test('parent observations validate and keep explicit help level',()=>{
 const entry=parsePortfolioInput(fixture);
 assert.equal(entry.action,'create');assert.equal(entry.level,'with_support');
 assert.equal(entry.observedOn,'2026-11-02');assert.equal(evidenceKinds.length,4);assert.equal(observationLevels.length,4);
});
test('editing and deleting require existing record IDs',()=>{
 const id='11111111-1111-4111-8111-111111111111';
 assert.deepEqual(parsePortfolioInput({action:'delete',id}),{action:'delete',id});
 assert.equal(parsePortfolioInput({...fixture,action:'update',id}).action,'update');
 assert.throws(()=>parsePortfolioInput({...fixture,action:'update',id:'not-a-uuid'}),PortfolioInputError);
});
test('rejects invalid dates, fake levels, missing description or oversized notes',()=>{
 const variants=[{observedOn:'2026-02-30'},{level:'mastered'},{kind:'medical'},{details:''},{title:'x'.repeat(181)},{details:'x'.repeat(2001)},{nextStep:'x'.repeat(751)}];
 for(const v of variants)assert.throws(()=>parsePortfolioInput({...fixture,...v}),PortfolioInputError);
 assert.throws(()=>parsePortfolioInput({action:'delete',id:'other-family'}),PortfolioInputError);
});
test('counts describe individual observations, never inferred mastery',()=>{
 const summary=portfolioSummary([
 {id:'1',kind:'baseline',level:'with_support',observed_on:'2026-11-02',area:'',title:'',details:'',next_step:'',created_at:'',updated_at:''},
 {id:'2',kind:'observation',level:'independent',observed_on:'2026-11-03',area:'',title:'',details:'',next_step:'',created_at:'',updated_at:''}
 ]);
 assert.equal(summary.count,2);assert.equal(summary.withSupport,1);assert.equal(summary.independent,1);assert.equal(summary.kinds.work_sample,0);
});
