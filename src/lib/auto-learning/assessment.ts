/**
 * Participation, understanding and demonstrated mastery are separate records.
 * Adaptive recall evidence uses the existing auto_learning_progress table and
 * its existing status values; no schema change or migration is needed.
 */
export type SavedRecord={task_id:string;status:string;updated_at?:string|Date};
export type ProgressWrite={taskId:string;status:'completed'|'needs_revision'};
export type RecallQuality='independent'|'with_hint'|'not_yet';
export type AssessmentPlan={upserts:ProgressWrite[];deletes:string[];mastery:boolean};
export type AssessmentSummary={completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};
export type Badge={id:string;name:string;description:string;symbol:string;kind:'participation'|'mastery'};
export const ASSESS_PREFIX='assess:';
export const MASTERY_PREFIX='mastery:';
export const assessmentId=(taskId:string)=>ASSESS_PREFIX+taskId;
export const masteryId=(taskId:string)=>MASTERY_PREFIX+taskId;
export const recallEvidenceId=(reviewTaskId:string,quality:RecallQuality)=>'recall:'+quality+':'+reviewTaskId;
export const recallEvidenceIds=(reviewTaskId:string)=>(
 ['independent','with_hint','not_yet'] as const
).map(quality=>recallEvidenceId(reviewTaskId,quality));
export function isInternalProgressId(taskId:string){
 return taskId.startsWith(ASSESS_PREFIX)||taskId.startsWith(MASTERY_PREFIX)||taskId.startsWith('recall:');
}
export function reviewBaseId(taskId:string):string|null{
 const match=/^review:[1-5]:(.+)$/.exec(taskId);
 return match?match[1]:null;
}
export function underlyingTaskId(taskId:string){return reviewBaseId(taskId)??taskId;}
export function understoodTasks(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&r.task_id.startsWith(ASSESS_PREFIX)).map(r=>r.task_id.slice(ASSESS_PREFIX.length)));
}
export function masteredTasks(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&r.task_id.startsWith(MASTERY_PREFIX)).map(r=>r.task_id.slice(MASTERY_PREFIX.length)));
}
export function activityCompletions(records:SavedRecord[]):Set<string>{
 return new Set(records.filter(r=>r.status==='completed'&&!isInternalProgressId(r.task_id)).map(r=>r.task_id));
}
export function assessmentSummary(records:SavedRecord[],validIds?:ReadonlySet<string>):AssessmentSummary{
 const completed=[...activityCompletions(records)].filter(id=>!validIds||validIds.has(id));
 const independentRecall=records.filter(r=>r.status==='completed'&&r.task_id.startsWith('recall:independent:')).length;
 const recallWithHint=records.filter(r=>r.status==='completed'&&r.task_id.startsWith('recall:with_hint:')).length;
 return {completed:completed.length,understood:understoodTasks(records).size,mastered:masteredTasks(records).size,independentRecall,recallWithHint};
}
/** Derive safe, idempotent writes for one parent-recorded action. */
export function assessmentPlan(
 taskId:string,status:'completed'|'needs_revision'|'pending',
 assessment:'understood'|'not-yet'|undefined,records:SavedRecord[],recallQuality?:RecallQuality
):AssessmentPlan{
 const base=underlyingTaskId(taskId);
 const review=Boolean(reviewBaseId(taskId));
 const understood=understoodTasks(records);
 if(status==='pending'){
  const deletes=new Set([taskId,assessmentId(taskId),masteryId(taskId),...recallEvidenceIds(taskId)]);
  if(!review){
   deletes.add(assessmentId(base));deletes.add(masteryId(base));
   for(const round of [1,2,3,4,5]){const id='review:'+round+':'+base;deletes.add(id);for(const evidence of recallEvidenceIds(id))deletes.add(evidence);}
  }else{
   const round=Number(/^review:([1-5]):/.exec(taskId)?.[1]??1);
   const reviewAt=new Date(records.find(r=>r.task_id===taskId)?.updated_at??'').getTime();
   const assessedAt=new Date(records.find(r=>r.task_id===assessmentId(base))?.updated_at??'').getTime();
   const masteredAt=new Date(records.find(r=>r.task_id===masteryId(base))?.updated_at??'').getTime();
   // Undo only evidence derived on or after this recall. Earlier parent evidence
   // remains valid when a later review is undone.
   if(!Number.isFinite(reviewAt)||!Number.isFinite(assessedAt)||assessedAt>=reviewAt)deletes.add(assessmentId(base));
   if(!Number.isFinite(reviewAt)||!Number.isFinite(masteredAt)||masteredAt>=reviewAt)deletes.add(masteryId(base));
   for(let next=round+1;next<=5;next++){const id='review:'+next+':'+base;deletes.add(id);for(const evidence of recallEvidenceIds(id))deletes.add(evidence);}
  }
  return {upserts:[],deletes:[...deletes],mastery:false};
 }
 if(status==='needs_revision'){
  const upserts:ProgressWrite[]=[{taskId,status},{taskId:assessmentId(base),status:'needs_revision'}];
  if(review&&recallQuality==='not_yet')upserts.push({taskId:recallEvidenceId(taskId,'not_yet'),status:'needs_revision'});
  return {upserts,deletes:review?recallEvidenceIds(taskId).filter(id=>id!==recallEvidenceId(taskId,'not_yet')):[],mastery:false};
 }
 const upserts:ProgressWrite[]=[{taskId,status}];
 if(!review){
  if(assessment==='understood')upserts.push({taskId:assessmentId(base),status:'completed'});
  else if(assessment==='not-yet')upserts.push({taskId:assessmentId(base),status:'needs_revision'});
  return {upserts,deletes:[],mastery:false};
 }
 const quality=recallQuality??(assessment==='understood'?'independent':undefined);
 if(!quality)return {upserts,deletes:[],mastery:false};
 const evidenceId=recallEvidenceId(taskId,quality);
 const deletes=recallEvidenceIds(taskId).filter(id=>id!==evidenceId);
 upserts.push({taskId:evidenceId,status:'completed'});
 // An independent recall can establish understanding, but cannot establish
 // mastery on the same attempt. Mastery needs a later independent recall.
 if(quality==='independent'&&!understood.has(base))upserts.push({taskId:assessmentId(base),status:'completed'});
 const canMaster=quality==='independent'&&understood.has(base);
 if(canMaster)upserts.push({taskId:masteryId(base),status:'completed'});
 return {upserts,deletes,mastery:canMaster};
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
