/**
 * Learner-first dashboard derivations (Phase 4).
 *
 * Everything here is derived from the existing catalogue and stored progress
 * evidence — no new tables, no manual status flags. The API route stays thin
 * and every rule is unit-tested.
 */
import type {QueueTask} from './catalogue';
import type {ChapterProgress, ChapterProgressStatus} from './chapter-progress';
import {selectTextbooks, textbookById} from '@/lib/ncert/textbooks';

export type SessionKind='read'|'practice'|'review';

export type ContinueSession={
 taskId:string;kind:SessionKind;chapterId:string;chapterTitle:string;
 bookTitle:string;subject:string;minutes:number;href:string;
 /** Why this session is next — shown to the learner in age-appropriate words. */
 reason:'resume'|'finish'|'check'|'revise'|'start';
 label:string;
};

export type ActiveChapter={
 chapterId:string;title:string;subject:string;bookTitle:string;grade:number|null;
 href:string;status:ChapterProgressStatus;completedSessions:number;totalSessions:number;
 nextSessionKind:SessionKind|null;
};

export type ChapterStats={
 total:number;notStarted:number;inProgress:number;practiceDue:number;
 understandingCheckDue:number;needsRevision:number;completed:number;retained:number;touched:number;
};

export type LearnerBook={
 id:string;title:string;subject:string;language:string;chapterCount:number;
 chaptersStarted:number;chaptersCompleted:number;href:string;
};

const SESSION_ORDER:SessionKind[]=['read','practice','review'];

/** Parse `ncert:<chapterId>:<kind>` session identifiers used across the catalogue. */
export function parseChapterSessionId(taskId:string):{chapterId:string;kind:SessionKind}|null{
 const match=/^ncert:(.+):(read|practice|review)$/.exec(taskId);
 return match?{chapterId:match[1],kind:match[2] as SessionKind}:null;
}

/** Stable book id embedded in a chapter slot id (`ncert-4-santoor-ch-03` → `ncert-4-santoor`). */
export function bookIdOfChapter(chapterId:string):string{
 const match=/^(ncert-\d+-[a-z0-9-]+?)-ch-\d+$/.exec(chapterId);
 return match?match[1]:chapterId;
}

function chapterGrade(chapterId:string):number|null{
 const match=/^ncert-(\d+)-/.exec(chapterId);
 return match?Number(match[1]):null;
}

function bookTitleOf(chapterId:string):string{
 return textbookById(bookIdOfChapter(chapterId))?.title??'NCERT textbook';
}

/** Next unfinished session kind inside one chapter, respecting read → practice → review order. */
function nextKindFor(chapter:ChapterProgress):SessionKind|null{
 if(chapter.status==='completed'||chapter.status==='retained')return null;
 if(chapter.needsRevision.length){
  const kind=parseChapterSessionId(chapter.needsRevision[0])?.kind;
  if(kind)return kind;
 }
 // Per-session evidence beats a count, so an out-of-order completion never replays a done session.
 if(chapter.sessions.length){
  for(const kind of SESSION_ORDER){
   const session=chapter.sessions.find(s=>s.kind===kind);
   if(session&&!session.completed)return kind;
  }
  return null;
 }
 const kinds=SESSION_ORDER.slice(0,Math.max(1,chapter.totalSessions));
 return kinds[chapter.completedSessions]??kinds[0]??null;
}

/**
 * The learner's active chapter: the most recently touched chapter that still
 * has work left. Never a chapter that is already completed or retained.
 */
export function findActiveChapter(chapters:ChapterProgress[]):ActiveChapter|null{
 const open=chapters.filter(c=>
  c.status!=='completed'&&c.status!=='retained'&&c.status!=='not_started'&&c.updatedAt!==null);
 if(!open.length)return null;
 const latest=[...open].sort((a,b)=>
  new Date(b.updatedAt!).getTime()-new Date(a.updatedAt!).getTime())[0];
 return {
  chapterId:latest.chapterId,title:latest.title,subject:latest.subject,
  bookTitle:bookTitleOf(latest.chapterId),grade:chapterGrade(latest.chapterId),
  href:latest.href||`/ncert-books/chapter/${latest.chapterId}`,
  status:latest.status,completedSessions:latest.completedSessions,totalSessions:latest.totalSessions,
  nextSessionKind:nextKindFor(latest),
 };
}

const REASON_LABEL:Record<ContinueSession['reason'],string>={
 resume:'Pick up where you left off',
 finish:'Finish this chapter',
 check:'Quick understanding check',
 revise:'Let\u2019s look at this again',
 start:'Start a new chapter',
};

function sessionTask(catalogue:QueueTask[],chapterId:string,kind:SessionKind):QueueTask|undefined{
 return catalogue.find(t=>t.id==='ncert:'+chapterId+':'+kind);
}

function toContinueSession(task:QueueTask,reason:ContinueSession['reason'],chapterId:string):ContinueSession|null{
 const parsed=parseChapterSessionId(task.id);
 if(!parsed)return null;
 const title=task.title.replace(/ · (Read & explore|Practice|Understanding check)$/,'');
 return {
  taskId:task.id,kind:parsed.kind,chapterId,chapterTitle:title,
  bookTitle:bookTitleOf(chapterId),subject:task.subject,minutes:task.minutes,
  href:task.href,reason,label:REASON_LABEL[reason],
 };
}

/**
 * The single most obvious next learning action, following the approved
 * recommendation order: resume the active chapter → finish it → revisit a
 * chapter needing revision → begin the next recommended chapter session.
 * Completed sessions are never offered again.
 */
export function findContinueSession(catalogue:QueueTask[],chapters:ChapterProgress[]):ContinueSession|null{
 const active=findActiveChapter(chapters);
 if(active&&active.nextSessionKind){
  const task=sessionTask(catalogue,active.chapterId,active.nextSessionKind);
  if(task){
   const reason:ContinueSession['reason']=active.status==='needs_revision'?'revise'
    :active.nextSessionKind==='review'?'check'
    :active.completedSessions>0?'finish':'resume';
   return toContinueSession(task,reason,active.chapterId);
  }
 }
 // A chapter awaiting revision but not recently touched still deserves attention.
 const revision=chapters.find(c=>c.status==='needs_revision');
 if(revision){
  const kind=nextKindFor(revision);
  const task=kind?sessionTask(catalogue,revision.chapterId,kind):undefined;
  if(task)return toContinueSession(task,'revise',revision.chapterId);
 }
 // Otherwise start the earliest untouched chapter session in catalogue order.
 const firstFresh=chapters.find(c=>c.status==='not_started');
 if(firstFresh){
  const task=sessionTask(catalogue,firstFresh.chapterId,'read');
  if(task)return toContinueSession(task,'start',firstFresh.chapterId);
 }
 return null;
}

/** Honest progress counts — session/chapter tallies only, never a mastery percentage. */
export function chapterStats(chapters:ChapterProgress[]):ChapterStats{
 const stats:ChapterStats={total:chapters.length,notStarted:0,inProgress:0,practiceDue:0,
  understandingCheckDue:0,needsRevision:0,completed:0,retained:0,touched:0};
 for(const c of chapters){
  if(c.status==='not_started')stats.notStarted+=1;
  else if(c.status==='in_progress')stats.inProgress+=1;
  else if(c.status==='practice_due')stats.practiceDue+=1;
  else if(c.status==='understanding_check_due')stats.understandingCheckDue+=1;
  else if(c.status==='needs_revision')stats.needsRevision+=1;
  else if(c.status==='completed')stats.completed+=1;
  else if(c.status==='retained')stats.retained+=1;
  if(c.status!=='not_started')stats.touched+=1;
 }
 return stats;
}

/**
 * Grade-appropriate books with per-book chapter progress, so "My Books" is a
 * real shelf rather than a flat catalogue link. Only books with verified
 * chapter titles are listed; contents-pending records stay out of learner view.
 */
export function booksForLearner(stage:string,chapters:ChapterProgress[]):LearnerBook[]{
 const match=/^class\s*(\d+)$/i.exec(stage.trim());
 if(!match)return [];
 const grade=Number(match[1]);
 return selectTextbooks(grade)
  .filter(book=>book.chapterCount>0)
  .map(book=>{
   const bookChapters=chapters.filter(c=>bookIdOfChapter(c.chapterId)===book.id);
   return {
    id:book.id,title:book.title,subject:book.subject,language:book.language,
    chapterCount:book.chapterCount,
    chaptersStarted:bookChapters.filter(c=>c.status!=='not_started').length,
    chaptersCompleted:bookChapters.filter(c=>c.status==='completed'||c.status==='retained').length,
    href:`/ncert-books?grade=${grade}&subject=${encodeURIComponent(book.subject)}&book=${encodeURIComponent(book.id)}`,
   };
  });
}

/** Chapters needing revision, most recently touched first. */
export function revisionChapters(chapters:ChapterProgress[],limit=4):ChapterProgress[]{
 return chapters.filter(c=>c.status==='needs_revision')
  .sort((a,b)=>new Date(b.updatedAt??0).getTime()-new Date(a.updatedAt??0).getTime())
  .slice(0,limit);
}

/** Recently completed sessions as learning evidence, newest first, no repeats. */
export function recentLearning(history:{id:string;title:string;subject:string;updatedAt:string}[],limit=6){
 const seen=new Set<string>();
 const rows:typeof history=[];
 for(const item of history){
  if(seen.has(item.id))continue;
  seen.add(item.id);rows.push(item);
  if(rows.length>=limit)break;
 }
 return rows;
}
