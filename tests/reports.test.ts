import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reportWindow,parseReportPeriod,activitySummary,goalSummary,evidenceSummary} from '../src/lib/reports/model';

test('time windows are inclusive and leap-safe',()=>{
 assert.deepEqual(reportWindow('2026-11-08',7),{startDate:'2026-11-02',endDate:'2026-11-08',days:7});
 assert.equal(reportWindow('2028-03-01',7).startDate,'2028-02-24');
 assert.equal(reportWindow('2026-01-02',30).startDate,'2025-12-04');
 assert.throws(()=>reportWindow('2026-02-30',30));
});
test('only explicitly supported report windows are accepted',()=>{
 assert.equal(parseReportPeriod('7'),7);
 assert.equal(parseReportPeriod('90'),90);
 assert.equal(parseReportPeriod('500'),30);
 assert.equal(parseReportPeriod(undefined),30);
});
test('activity totals reflect saved data, not inferred learning',()=>{
 const report=activitySummary([
  {date:'2026-11-02',activities:3,completed:2,plannedMinutes:45,completedMinutes:30},
  {date:'2026-11-03',activities:1,completed:0,plannedMinutes:15,completedMinutes:0}
 ]);
 assert.deepEqual(report,{daysWithActivity:2,activityCount:4,completedCount:2,plannedMinutes:60,completedMinutes:30});
 assert.equal(activitySummary([]).plannedMinutes,0);
});
test('goal counts and evidence levels do not confer new mastery',()=>{
 assert.deepEqual(goalSummary([{id:'1',title:'A',subject:'English',progress:25},{id:'2',title:'B',subject:'Math',progress:100}]),{total:2,active:1,markedComplete:1});
 const proof=evidenceSummary([{id:'1',observedOn:'2026-11-02',kind:'observation',area:'A',title:'A',details:'A',nextStep:'',level:'independent'}]);
 assert.deepEqual(proof,{total:1,withSupport:0,independent:1});
});
