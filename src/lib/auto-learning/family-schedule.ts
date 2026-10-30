export type FamilyLearner<T extends {id:string;minutes:number}>={id:string;name:string;grade:string;tasks:T[]};
export type FamilySlot<T>={learnerId:string;name:string;grade:string;task:T;minutes:number;startMinute:number};
export function buildFamilySchedule<T extends {id:string;minutes:number}>(learners:FamilyLearner<T>[],budget=60):FamilySlot<T>[]{
 if(!Number.isFinite(budget)||budget<1)return [];
 const eligible=learners.filter(l=>l.tasks.length);
 if(!eligible.length)return [];
 const slots:FamilySlot<T>[]=[];
 let remaining=Math.floor(budget);
 const cursors=new Map(eligible.map(l=>[l.id,0]));
 // Fair, round-robin selection; each selected task has an explicit parent time slot.
 while(remaining>0){
  let added=false;
  for(const learner of eligible){
   const at=cursors.get(learner.id)??0;
   const task=learner.tasks[at];
   if(!task)continue;
   const available=Math.max(1,Math.floor(task.minutes));
   const mins=Math.min(available,remaining);
   // Allow a short supervised introduction when the entire task will not fit;
   // never claim that this partial segment completed the task.
   if(mins<5&&available>mins)continue;
   slots.push({learnerId:learner.id,name:learner.name,grade:learner.grade,task,minutes:mins,startMinute:budget-remaining});
   remaining-=mins;cursors.set(learner.id,at+1);added=true;
   if(remaining===0)break;
  }
  if(!added)break;
 }
 return slots;
}
