/** Family scheduling stays a pure function: no database writes or invented completion. */
export type FamilyTask={id:string;minutes:number;subject?:string;status?:string;mode?:'guided'|'play'|'independent'};
export type FamilyLearner<T extends FamilyTask>={id:string;name:string;grade:string;tasks:T[]};
export type FamilySlot<T>={learnerId:string;name:string;grade:string;task:T;minutes:number;startMinute:number;mode:'guided'|'play'|'independent'};
export type FamilyPlan<T>={slots:FamilySlot<T>[];budget:number;allocated:number;unallocated:number;notes:string[]};
const subjectHash=(value:string)=>[...value].reduce((sum,c)=>sum+c.charCodeAt(0),0);
export function isInfant(stage:string){return /infant|baby|under\s*(1|2)\s*year|0\s*[-–]\s*(12|18|24)\s*month/i.test(stage.trim());}
export function activityMode(stage:string):'guided'|'play'{return isInfant(stage)||/^(early years|nursery|lkg|toddler|preschool)/i.test(stage.trim())?'play':'guided';}
/** Infant interactions and independent practice never consume shared guided teaching minutes. */
export function sharedBudgetTasks<T extends FamilyTask>(learners:FamilyLearner<T>[]):FamilyLearner<T>[]{
 return learners.map(learner=>isInfant(learner.grade)?{...learner,tasks:[]}:{...learner,tasks:learner.tasks.filter(task=>task.mode!=='independent')});
}
export function separateTasks<T extends FamilyTask>(learners:FamilyLearner<T>[]):{learnerId:string;name:string;grade:string;task:T}[]{
 return learners.flatMap(learner=>learner.tasks
  .filter(task=>isInfant(learner.grade)||task.mode==='independent')
  .slice(0,isInfant(learner.grade)?1:2)
  .map(task=>({learnerId:learner.id,name:learner.name,grade:learner.grade,task})));
}
function rotatedTasks<T extends FamilyTask>(tasks:T[],day:number){
 // Reorder only the next available shortlist; the progress queue continues to own sequence.
 // Revisions always remain in the first position.
 const urgent=tasks.filter(t=>t.status==='needs_revision');
 const other=tasks.filter(t=>t.status!=='needs_revision');
 const pool=other.slice(0,Math.min(5,other.length));
 const tail=other.slice(pool.length);
 const preferred=day%5;
 pool.sort((a,b)=>{
  const av=(subjectHash(a.subject||'')+preferred)%5;
  const bv=(subjectHash(b.subject||'')+preferred)%5;
  return av-bv;
 });
 return [...urgent,...pool,...tail];
}
export function buildFamilyPlan<T extends FamilyTask>(learners:FamilyLearner<T>[],budget=60,dayOfWeek=0):FamilyPlan<T>{
 const limit=Number.isFinite(budget)?Math.max(0,Math.floor(budget)):0;
 const eligible=learners.filter(l=>l.tasks.length&&!isInfant(l.grade));
 const notes:string[]=[];
 if(learners.some(l=>isInfant(l.grade)))notes.push('Infant care, conversation and responsive play are not scheduled as formal teaching tasks.');
 if(learners.some(l=>l.tasks.some(t=>t.mode==='independent')))notes.push('Independent practice is offered separately and does not use shared guided teaching minutes.');
 const candidates=eligible.map(l=>({...l,tasks:rotatedTasks(l.tasks,dayOfWeek)}));
 const slots:FamilySlot<T>[]=[];
 let remaining=limit;
 const cursors=new Map(candidates.map(l=>[l.id,0]));
 while(remaining>0){
  let added=false;
  for(const learner of candidates){
   let at=cursors.get(learner.id)??0;
   // Find a complete activity that fits; never truncate a lesson just to fill time.
   const choice=learner.tasks.slice(at).findIndex(t=>Number.isFinite(t.minutes)&&t.minutes>=1&&Math.ceil(t.minutes)<=remaining);
   if(choice===-1)continue;
   at+=choice;
   const task=learner.tasks[at];
   const minutes=Math.ceil(task.minutes);
   slots.push({learnerId:learner.id,name:learner.name,grade:learner.grade,task,minutes,startMinute:limit-remaining,
    mode:task.mode??activityMode(learner.grade)});
   remaining-=minutes;cursors.set(learner.id,at+1);added=true;
   if(!remaining)break;
  }
  if(!added)break;
 }
 if(remaining)notes.push(remaining+' minutes unallocated for breaks, transitions or responsive family time.');
 return {slots,budget:limit,allocated:limit-remaining,unallocated:remaining,notes};
}
/** Backwards-compatible API for existing consumers. */
export function buildFamilySchedule<T extends FamilyTask>(learners:FamilyLearner<T>[],budget=60):FamilySlot<T>[]{
 return buildFamilyPlan(learners,budget).slots;
}
