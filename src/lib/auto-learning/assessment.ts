/**
 * Participation, assessed understanding and demonstrated mastery are three
 * different things. Completion alone never earns a mastery badge.
 *
 * Storage is deliberately additive: assessment evidence is kept in the
 * EXISTING auto_learning_progress table using namespaced task ids, so this
 * phase needs NO production migration and cannot alter any existing family
 * or learner progress row. Statuses remain the two already allowed values.
 */
export type SavedRecord={task_id:string;status:string;updated_at?:string|Date};
export type ProgressWrite={taskId:string;status:'completed'|'needs_revision'};
export type AssessmentPlan={upserts:ProgressWrite[];deletes:string[];mastery:boolean};
export type AssessmentSummary={completed:number;understood:number;mastered:number};
export type Badge={id:string;name:string;description:string;symbol:string;kind:'participation'|'mastery'};

export const ASSESS_PREFIX='assess:';
export const MASTERY_PREFIX='mastery:';
export const assessmentId=(taskId:string)=>ASSESS_PREFIX+taskId;
export const masteryId=(taskId:string)=>MASTERY_PREFIX+taskId;
export function isInternalProgressId(taskId:string){return taskId.startsWith(ASSESS_PREFIX)||taskId.startsWith(MASTERY_PREFIX);}

/** Extract the original activity from a spaced-recall task id. */
export function reviewBaseId(taskId:string):string|null{
 const match=/^review:[12]:(.+)$/.exec(taskId);
 return match?match[1]:null;
}
export function underlyingTaskId(taskId:string){return reviewBaseId(taskId)??taskId;}

export function understoodTasks(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&r.task_id.startsWith(ASSESS_PREFIX)).map(r=>r.task_id.slice(ASSESS_PREFIX.length)));
}
export function masteredTasks(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&r.task_id.startsWith(MASTERY_PREFIX)).map(r=>r.task_id.slice(MASTERY_PREFIX.length)));
}
/** Namespaced evidence rows are never counted as real completed activities. */
export function activityCompletions(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&!isInternalProgressId(r.task_id)).map(r=>r.task_id));
}
export function assessmentSummary(records:SavedRecord[],validIds?:ReadonlySet<string>):AssessmentSummary{
 const completed=[...activityCompletions(records)].filter(id=>!validIds||validIds.has(id));
 return {completed:completed.length,understood:understoodTasks(records).size,mastered:masteredTasks(records).size};
}

/**
 * Derive the exact progress writes for one parent action.
 * Mastery requires BOTH an understanding check passed earlier AND a later
 * successful spaced-recall session on the same underlying activity.
 */
export function assessmentPlan(taskId:string,status:'completed'|'needs_revision'|'pending',assessment:'understood'|'not-yet'|undefined,records:SavedRecord[]):AssessmentPlan{
 const base=underlyingTaskId(taskId);
 const understood=understoodTasks(records);
 if(status==='pending'){
  return {upserts:[],deletes:[...new Set([taskId,assessmentId(base),masteryId(base),assessmentId(taskId),masteryId(taskId)])],mastery:false};
 }
 if(status==='needs_revision'){
  return {upserts:[{taskId,status:'needs_revision'},{taskId:assessmentId(base),status:'needs_revision'}],deletes:[],mastery:false};
 }
 const upserts:ProgressWrite[]=[{taskId,status:'completed'}];
 if(assessment==='understood'&&!reviewBaseId(taskId))upserts.push({taskId:assessmentId(base),status:'completed'});
 const canMaster=Boolean(reviewBaseId(taskId))&&understood.has(base);
 if(canMaster)upserts.push({taskId:masteryId(base),status:'completed'});
 return {upserts,deletes:[],mastery:canMaster};
}

export function participationBadges(completed:number):Badge[]{
 return [
  ...(completed>=1?[{id:'first-step',name:'First Step',description:'Joined the first activity',symbol:'⭐',kind:'participation' as const}]:[]),
  ...(completed>=5?[{id:'five-steps',name:'Learning Explorer',description:'Joined five activities',symbol:'🧭',kind:'participation' as const}]:[]),
  ...(completed>=15?[{id:'fifteen-steps',name:'Learning Champion',description:'Joined fifteen activities',symbol:'🏅',kind:'participation' as const}]:[]),
 ];
}
export function masteryBadges(understood:number,mastered:number):Badge[]{
 return [
  ...(understood>=1?[{id:'explains-ideas',name:'Can Explain It',description:'Showed understanding in a parent check',symbol:'💡',kind:'mastery' as const}]:[]),
  ...(mastered>=3?[{id:'recall-three',name:'Strong Recall',description:'Recalled three ideas after a delay',symbol:'🌱',kind:'mastery' as const}]:[]),
  ...(mastered>=8?[{id:'lasting-mastery',name:'Lasting Mastery',description:'Demonstrated mastery across eight activities',symbol:'🏆',kind:'mastery' as const}]:[]),
 ];
}
