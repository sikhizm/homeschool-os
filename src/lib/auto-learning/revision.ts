import type {QueueTask} from './catalogue';
export type SavedProgress={task_id:string;status:string;updated_at:string|Date;learner_id?:string};
const days=(n:number)=>n*86400000;
export function revisionTasks(catalogue:QueueTask[],records:SavedProgress[],now=new Date()):QueueTask[]{
 const byId=new Map(records.map(p=>[p.task_id,p]));
 const due:QueueTask[]=[];
 for(const task of catalogue){
  const initial=byId.get(task.id);
  if(!initial)continue;
  if(initial.status==='needs_revision'){
   due.push({...task,source:'Revision requested · revisit before moving ahead',instructions:['Repeat the original learning steps at a gentler pace.',...task.instructions.slice(0,2),'Ask the learner to explain or demonstrate the idea again.'],minutes:Math.min(task.minutes,20)});
   continue;
  }
  if(initial.status!=='completed')continue;
  const completedAt=new Date(initial.updated_at).getTime();
  if(!Number.isFinite(completedAt))continue;
  for(const [round,delay] of [[1,3],[2,10]]){
   const reviewId='review:'+round+':'+task.id;
   const stored=byId.get(reviewId);
   if(stored?.status==='completed')continue;
   if(stored?.status==='needs_revision'||now.getTime()>=completedAt+days(delay)){
    due.push({...task,id:reviewId,title:'Recall practice · '+task.title,minutes:Math.min(task.minutes,10),source:'Suggested spaced review · '+delay+' days after original activity',instructions:['Without looking at the answer, ask the learner what they remember.','Invite a brief demonstration or explanation.', 'Reopen the learning resource only if they need support.','Mark complete after a successful recall; otherwise choose Needs revision.']});
   }
   break;
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
 const match=/^review:([12]):(.+)$/.exec(id);
 return Boolean(match&&catalogue.some(t=>t.id===match[2]));
}
