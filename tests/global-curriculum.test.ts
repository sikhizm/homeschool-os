import {test} from 'node:test';
import assert from 'node:assert/strict';
import {globalSkills,globalStages,globalFrameworks,validateGlobalSkills,selectGlobalSkills,globalSkillById} from '../src/lib/global-curriculum/catalogue';

test('global curriculum catalogue contains original, internally valid learning pathways',()=>{
 assert.deepEqual(validateGlobalSkills(),[]);
 assert.equal(globalSkills.length,29);
 assert.equal(new Set(globalSkills.map(x=>x.id)).size,globalSkills.length);
 assert.ok(globalFrameworks.some(x=>x.id==='ncert'));
 assert.ok(globalFrameworks.some(x=>x.id==='cambridge'));
 assert.ok(globalFrameworks.some(x=>x.id==='ib'));
 assert.ok(globalFrameworks.some(x=>x.id==='singapore'));
});
test('all learning stages have examples, not misleading full coverage claims',()=>{
 for(const stage of globalStages)assert.ok(selectGlobalSkills({stage:stage.id}).length>=3);
 for(const skill of globalSkills){assert.equal(skill.editorialStatus,'illustrative');assert.equal(skill.sourceMapping,'framework-context-only');assert.ok(skill.check.length>15);}
});
test('framework filter means editorial context, not a certified equivalence',()=>{
 const matches=selectGlobalSkills({stage:'class3-5',subject:'Mathematics',framework:'singapore'});
 assert.ok(matches.length>=2);
 assert.ok(matches.every(x=>x.stage==='class3-5'&&x.subject==='Mathematics'&&x.frameworks.includes('singapore')));
 assert.equal(selectGlobalSkills({stage:'class3-5',framework:'not-a-framework'}).length,0);
});
test('parents can look up only known objective IDs for goal prefill',()=>{
 const item=globalSkillById('prep-fractions');
 assert.equal(item?.subject,'Mathematics');
 assert.equal(globalSkillById('unknown'),undefined);
 assert.equal(globalSkillById('../secrets'),undefined);
});
test('text search is bounded by the caller and stage filters',()=>{
 const found=selectGlobalSkills({stage:'class3-5',query:'fractions'});
 assert.ok(found.some(x=>x.id==='prep-fractions'));
 assert.ok(found.every(x=>x.stage==='class3-5'));
});
