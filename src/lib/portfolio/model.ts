import { validDate } from '@/lib/learning/model';
export type EvidenceKind='baseline'|'observation'|'work_sample'|'reflection';
export type ObservationLevel='not_tried'|'with_support'|'independent'|'not_applicable';
export type PortfolioEntry={id:string;observed_on:string;kind:EvidenceKind;area:string;title:string;details:string;next_step:string;level:ObservationLevel;created_at:string;updated_at:string};
export const evidenceKinds:EvidenceKind[]=['baseline','observation','work_sample','reflection'];
export const observationLevels:ObservationLevel[]=['not_tried','with_support','independent','not_applicable'];
export class PortfolioInputError extends Error {}
export function parsePortfolioInput(data:unknown){
 if(!data||typeof data!=='object')throw new PortfolioInputError('Invalid entry.');
 const b=data as Record<string,unknown>;
 if(b.action!=='create'&&b.action!=='update'&&b.action!=='delete')throw new PortfolioInputError('Invalid action.');
 const isUuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
 if(b.action==='delete'){
  if(!isUuid(b.id))throw new PortfolioInputError('Choose a valid entry.');
  return {action:'delete' as const,id:b.id as string};
 }
 if(b.action==='update'&&!isUuid(b.id))throw new PortfolioInputError('Choose a valid entry.');
 if(!validDate(b.observedOn))throw new PortfolioInputError('Choose a valid observation date.');
 if(!evidenceKinds.includes(b.kind as EvidenceKind))throw new PortfolioInputError('Choose an evidence type.');
 if(!observationLevels.includes(b.level as ObservationLevel))throw new PortfolioInputError('Choose a valid observation level.');
 function value(k:string,max:number,required=false){
  const v=b[k];if(typeof v!=='string'||v.trim().length>max||(required&&!v.trim()))throw new PortfolioInputError('Check the description fields and their lengths.');
  return v.trim();
 }
 const fields={observedOn:b.observedOn as string,kind:b.kind as EvidenceKind,level:b.level as ObservationLevel,area:value('area',90,true),title:value('title',180,true),details:value('details',2000,true),nextStep:value('nextStep',750)};
 return b.action==='update'?{action:'update' as const,id:b.id as string,...fields}:{action:'create' as const,...fields};
}
export function portfolioSummary(entries:readonly PortfolioEntry[]){
 const kinds=Object.fromEntries(evidenceKinds.map(kind=>[kind,entries.filter(x=>x.kind===kind).length])) as Record<EvidenceKind,number>;
 return {count:entries.length,kinds,independent:entries.filter(x=>x.level==='independent').length,withSupport:entries.filter(x=>x.level==='with_support').length};
}
