import type {QueueTask} from './catalogue';
import {masteryId} from './assessment';
import type {SavedProgress} from './revision';

export type ChapterProgressStatus='not_started'|'in_progress'|'practice_due'|'understanding_check_due'|'needs_revision'|'completed'|'retained';
export type ChapterSessionState={kind:'read'|'practice'|'review';completed:boolean};
export type ChapterProgress={chapterId:string;title:string;subject:string;href:string;status:ChapterProgressStatus;completedSessions:number;totalSessions:number;needsRevision:string[];updatedAt:string|null;sessions:ChapterSessionState[]};

/** Derive chapter state from stable session IDs and existing records. Legacy chapter completion is interpreted at read time; no legacy rows are rewritten. */
export function deriveChapterProgress(catalogue:QueueTask[],records:SavedProgress[]):ChapterProgress[]{
 const byId=new Map(records.map(record=>[record.task_id,record]));
 const chapters=new Map<string,QueueTask[]>();
 for(const task of catalogue){const match=/^ncert:(.+):(read|practice|review)$/.exec(task.id);if(!match)continue;const id=match[1];chapters.set(id,[...(chapters.get(id)??[]),task]);}
 return [...chapters.entries()].map(([chapterId,tasks])=>{
  const ordered=(['read','practice','review'] as const).map(kind=>tasks.find(t=>t.id==='ncert:'+chapterId+':'+kind)).filter((t):t is QueueTask=>Boolean(t));
  const legacy=byId.get('ncert:'+chapterId)?.status==='completed';
  const completed=(task:QueueTask)=>legacy||byId.get(task.id)?.status==='completed';
  const done=ordered.filter(completed).length;
  const needsRevision=ordered.filter(t=>byId.get(t.id)?.status==='needs_revision'||records.some(record=>record.status==='needs_revision'&&/^review:[1-5]:/.test(record.task_id)&&record.task_id.endsWith(':'+t.id))).map(t=>t.id);
  const review=ordered.find(t=>t.id.endsWith(':review'));
  const retained=Boolean(review&&byId.get(masteryId(review.id))?.status==='completed');
  const read=ordered.find(t=>t.id.endsWith(':read'));
  const practice=ordered.find(t=>t.id.endsWith(':practice'));
  // Out-of-order completions fall back to in_progress rather than claiming a later stage is due.
  const status:ChapterProgressStatus=needsRevision.length?'needs_revision':retained?'retained':ordered.length>0&&done===ordered.length?'completed':read&&completed(read)&&practice&&!completed(practice)?'practice_due':read&&completed(read)&&practice&&completed(practice)&&review&&!completed(review)?'understanding_check_due':done>0?'in_progress':'not_started';
  const times=ordered.map(t=>byId.get(t.id)?.updated_at).filter(Boolean).map(v=>new Date(v as string|Date).getTime()).filter(Number.isFinite).sort((a,b)=>b-a);
  const sessions:ChapterSessionState[]=ordered.map(t=>({kind:/:(read|practice|review)$/.exec(t.id)?.[1] as ChapterSessionState['kind'],completed:completed(t)}));
  return {chapterId,title:ordered[0]?.title.replace(/ · Read & explore$/,'')??chapterId,subject:ordered[0]?.subject??'',href:ordered[0]?.href??'',status,completedSessions:done,totalSessions:ordered.length,needsRevision,updatedAt:times.length?new Date(times[0]).toISOString():null,sessions};
 });
}
