import type {QueueTask} from './catalogue';
import {assessmentId,masteryId} from './assessment';
export type SavedProgress={task_id:string;status:string;updated_at:string|Date;learner_id?:string};
export type RecallQuality='independent'|'with_hint'|'not_yet';
const DAY=86400000;
const delays={independent:10,with_hint:4,not_yet:1,unassessed:7} as const;
const qualityKeys:RecallQuality[]=['independent','with_hint','not_yet'];
export function recallEvidenceId(reviewTaskId:string,quality:RecallQuality){return 'recall:'+quality+':'+reviewTaskId;}
export function recallQualityFor(reviewTaskId:string,records:SavedProgress[]):RecallQuality|null{
 for(const quality of qualityKeys){
  const record=records.find(r=>r.task_id===recallEvidenceId(reviewTaskId,quality));
  if(record?.status==='completed'||(quality==='not_yet'&&record?.status==='needs_revision'))return quality;
 }
 return null;
}
function timestamp(record:SavedProgress|undefined){const value=new Date(record?.updated_at??'').getTime();return Number.isFinite(value)?value:null;}
type ReviewRound=1|2|3|4|5;
function reviewTask(task:QueueTask,round:ReviewRound,delay:number,quality:RecallQuality|null,immediate=false):QueueTask{
 const reason=quality==='independent'?'recalled independently':quality==='with_hint'?'needed a hint':quality==='not_yet'?'could not yet recall':'has not had a recorded recall rating';
 const title=round===1?'First recall':round===2?'Spaced recall': 'Retention check';
 return {...task,id:'review:'+round+':'+task.id,title:title+' · '+task.title,minutes:Math.min(task.minutes,10),
  source:immediate?'Adaptive revision · revisit now':`Adaptive recall · ${delay} days after the learner ${reason}`,
  instructions:quality==='independent'?[
   'Ask the learner to recall the idea without opening the lesson or textbook.',
   'Invite a new example, explanation or demonstration rather than repeating the same answer.',
   'If they remember independently, choose Remembered independently. If they need a hint, record that honestly.',
   'Reopen the original lesson only after the attempt, to correct or extend it.'
  ]:quality==='with_hint'?[
   'Begin with a gentle clue about the original idea, but do not give the answer.',
   'Ask the learner to explain or demonstrate the idea again in their own words.',
   'If one small hint was enough, choose Remembered with a hint. If not, choose Not yet.',
   'Revisit the original lesson together if more support is needed.'
  ]:[
   'Start with a calm, short reminder of the original activity; this is practice, not a test.',
   'Model one example, then invite the learner to try a similar one.',
   'Break the idea into a smaller step and allow thinking time.',
   'Choose Remembered with a hint or Not yet based on what actually happened.'
  ]};
}
export function revisionTasks(catalogue:QueueTask[],records:SavedProgress[],now=new Date()):QueueTask[]{
 const byId=new Map(records.map(p=>[p.task_id,p]));
 const due:QueueTask[]=[];
 for(const task of catalogue){
  const initial=byId.get(task.id);
  if(initial?.status==='needs_revision'){
   due.push({...task,source:'Parent requested revision · revisit before moving ahead',
    instructions:['Repeat the original learning steps at a gentler pace.',...task.instructions.slice(0,2),'Ask the learner to explain or demonstrate the idea again.'],minutes:Math.min(task.minutes,20)});
   continue;
  }
  if(initial?.status!=='completed')continue;
  let previousAt=timestamp(initial);
  if(previousAt===null)continue;
  let previousQuality:RecallQuality|null=null;
  for(let number=1;number<=5;number++){
   const round=number as ReviewRound;
   const id='review:'+round+':'+task.id;
   const stored=byId.get(id);
   if(!stored){
    const interval=round===1?(byId.get(assessmentId(task.id))?.status==='completed'?3:2):delays[previousQuality??'unassessed'];
    if(now.getTime()>=previousAt+interval*DAY)due.push(reviewTask(task,round,interval,previousQuality));
    break;
   }
   if(stored.status==='needs_revision'){
    due.push(reviewTask(task,round,0,'not_yet',true));break;
   }
   if(stored.status!=='completed')break;
   // A successful independent recall after understanding ends the sequence.
   if(byId.get(masteryId(task.id))?.status==='completed')break;
   previousAt=timestamp(stored)??previousAt;
   previousQuality=recallQualityFor(id,records);
  }
 }
 return due;
}
export function prioritizedQueue(catalogue:QueueTask[],records:SavedProgress[],now=new Date(),limit=5){
 const done=new Set(records.filter(p=>p.status==='completed').map(p=>p.task_id));
 const reviews=revisionTasks(catalogue,records,now);
 const fresh=catalogue.filter(t=>!done.has(t.id)&&!reviews.some(r=>r.id===t.id));
 return [...reviews,...fresh].slice(0,limit);
}
export function knownReviewTask(id:string,catalogue:QueueTask[]){
 const match=/^review:([1-5]):(.+)$/.exec(id);
 return Boolean(match&&catalogue.some(t=>t.id===match[2]));
}
