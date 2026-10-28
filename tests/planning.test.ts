import { test } from 'node:test';
import assert from 'node:assert/strict';
import { academicYear, addDays, daysInWeek, mondayOf, parsePlanningInput, periodDates, validPlanningDate, yearDates } from '../src/lib/planning/periods';

test('academic years run from April through March including leap day',()=>{
 assert.equal(academicYear('2026-03-31'),2025);
 assert.equal(academicYear('2026-04-01'),2026);
 assert.deepEqual(yearDates(2026),{startDate:'2026-04-01',endDate:'2027-03-31'});
 assert.equal(validPlanningDate('2028-02-29'),true);
 assert.equal(validPlanningDate('2027-02-29'),false);
 assert.equal(validPlanningDate('2026-13-02'),false);
});
test('Monday anchored weeks remain stable across month and year boundaries',()=>{
 assert.equal(mondayOf('2026-11-01'),'2026-10-26');
 assert.deepEqual(periodDates('week','2026-12-31'),{startDate:'2026-12-28',endDate:'2027-01-03'});
 assert.deepEqual(daysInWeek('2026-11-01'),['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01']);
 assert.equal(addDays('2028-02-28',1),'2028-02-29');
});
test('planning input normalizes periods and trims parent text',()=>{
 const y=parsePlanningInput({kind:'year',anchor:'2026-12-10',title:'  Focus  ',focus:'  Maths  ',notes:''});
 assert.deepEqual(y,{kind:'year',startDate:'2026-04-01',endDate:'2027-03-31',title:'Focus',focus:'Maths',notes:''});
 const w=parsePlanningInput({kind:'week',anchor:'2026-11-01',title:' Practice ',focus:'',notes:'  '});
 assert.equal(w.startDate,'2026-10-26');
 assert.equal(w.endDate,'2026-11-01');
});
test('rejects invalid or overlong planning input',()=>{
 const good={kind:'week',anchor:'2026-10-28',title:'Reading',focus:'',notes:''};
 for(const invalid of [{...good,kind:'day'},{...good,anchor:'2026-02-30'},{...good,title:' '},{...good,focus:'x'.repeat(1501)},{...good,notes:42}])
  assert.throws(()=>parsePlanningInput(invalid));
 assert.throws(()=>yearDates(2100));
});
