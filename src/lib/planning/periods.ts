/** Date-only school planning rules, independent of browser locale or timezone. */
export type PeriodKind = 'year' | 'week';
export type PlanningPeriod = {
  kind: PeriodKind;
  startDate: string;
  endDate: string;
  title: string;
  focus: string;
  notes: string;
};
const DATE=/^\d{4}-\d{2}-\d{2}$/;
export function validPlanningDate(value: unknown): value is string {
  if(typeof value!=='string'||!DATE.test(value)) return false;
  const d=new Date(value+'T12:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value && value>='2020-01-01'&&value<='2100-12-31';
}
export function addDays(value:string,n:number):string{
  if(!validPlanningDate(value)) throw new Error('Invalid date');
  const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
}
export function mondayOf(value:string):string{
  if(!validPlanningDate(value))throw new Error('Invalid date');
  const weekday=new Date(value+'T12:00:00Z').getUTCDay();
  return addDays(value,-((weekday+6)%7));
}
export function academicYear(value:string):number{
  if(!validPlanningDate(value))throw new Error('Invalid date');
  const year=Number(value.slice(0,4));
  return Number(value.slice(5,7))>=4?year:year-1;
}
export function yearDates(year:number):{startDate:string;endDate:string}{
  if(!Number.isInteger(year)||year<2020||year>2099)throw new Error('Invalid academic year');
  return {startDate:`${year}-04-01`,endDate:`${year+1}-03-31`};
}
export function periodDates(kind:PeriodKind,anchor:string):{startDate:string;endDate:string}{
  if(!validPlanningDate(anchor))throw new Error('Invalid date');
  if(kind==='year')return yearDates(academicYear(anchor));
  if(kind==='week'){const startDate=mondayOf(anchor);return {startDate,endDate:addDays(startDate,6)};}
  throw new Error('Invalid planning period');
}
export class PlanInputError extends Error {}
function planText(value:unknown,max:number,required=false):string{
  if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))
    throw new PlanInputError('Check the planning text and its length.');
  return value.trim();
}
export function parsePlanningInput(value:unknown):PlanningPeriod{
  if(!value||typeof value!=='object')throw new PlanInputError('Invalid request.');
  const body=value as Record<string,unknown>;
  if(body.kind!=='week'&&body.kind!=='year')throw new PlanInputError('Choose a planning period.');
  if(!validPlanningDate(body.anchor))throw new PlanInputError('Choose a valid planning date.');
  const dates=periodDates(body.kind,body.anchor);
  return {...dates,kind:body.kind,title:planText(body.title,120,true),focus:planText(body.focus,1500),notes:planText(body.notes,1500)};
}
export function daysInWeek(anchor:string):string[]{
  const monday=mondayOf(anchor);
  return Array.from({length:7},(_,index)=>addDays(monday,index));
}
