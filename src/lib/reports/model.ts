import { validDate } from '@/lib/learning/model';

/** Fixed date-only windows. No dependence on server timezone or local clock. */
export type ReportPeriod = 7 | 30 | 90;
export type ReportWindow = { startDate:string;endDate:string;days:ReportPeriod };
export function parseReportPeriod(value:unknown):ReportPeriod {
 if(value==='7'||value===7)return 7;
 if(value==='90'||value===90)return 90;
 return 30;
}
export function reportWindow(end:string,days:ReportPeriod):ReportWindow {
 if(!validDate(end))throw new Error('Invalid report date');
 const d=new Date(end+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()-(days-1));
 return {startDate:d.toISOString().slice(0,10),endDate:end,days};
}
export type ActivityDay={date:string;activities:number;completed:number;plannedMinutes:number;completedMinutes:number};
export type ActivitySummary={daysWithActivity:number;activityCount:number;completedCount:number;plannedMinutes:number;completedMinutes:number};
export function activitySummary(days:readonly ActivityDay[]):ActivitySummary {
 return days.reduce((sum,day)=>({
  daysWithActivity:sum.daysWithActivity+(day.activities>0?1:0),
  activityCount:sum.activityCount+day.activities,
  completedCount:sum.completedCount+day.completed,
  plannedMinutes:sum.plannedMinutes+day.plannedMinutes,
  completedMinutes:sum.completedMinutes+day.completedMinutes
 }),{daysWithActivity:0,activityCount:0,completedCount:0,plannedMinutes:0,completedMinutes:0});
}
export type GoalSnapshot={id:string;title:string;subject:string;progress:number};
export function goalSummary(goals:readonly GoalSnapshot[]) {
 const active=goals.filter(g=>g.progress<100).length;
 return {total:goals.length,active,markedComplete:goals.length-active};
}
export type EvidenceSnapshot={id:string;observedOn:string;kind:string;area:string;title:string;details:string;nextStep:string;level:string};
export function evidenceSummary(entries:readonly EvidenceSnapshot[]){
 return {total:entries.length,withSupport:entries.filter(e=>e.level==='with_support').length,independent:entries.filter(e=>e.level==='independent').length};
}
