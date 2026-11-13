import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue,type QueueTask} from '../src/lib/auto-learning/catalogue';
import {deriveChapterProgress,type ChapterProgress} from '../src/lib/auto-learning/chapter-progress';
import {masteryId} from '../src/lib/auto-learning/assessment';
import {
 parseChapterSessionId,bookIdOfChapter,findActiveChapter,findContinueSession,
 chapterStats,booksForLearner,revisionChapters,recentLearning,
} from '../src/lib/auto-learning/learner-dashboard';

const catalogue=queueCatalogue('Class 4');
const firstChapterId=(()=>{
 const first=catalogue.find(t=>t.id.startsWith('ncert:')&&t.id.endsWith(':read'))!;
 return first.id.slice('ncert:'.length,-':read'.length);
})();
const sid=(chapterId:string,kind:'read'|'practice'|'review')=>'ncert:'+chapterId+':'+kind;
const row=(task_id:string,status:string,updated_at='2026-11-05T10:00:00.000Z')=>({task_id,status,updated_at});
const derive=(records:{task_id:string;status:string;updated_at:string}[])=>deriveChapterProgress(catalogue,records);

test('session identifiers parse back to chapter and kind',()=>{
 assert.deepEqual(parseChapterSessionId(sid(firstChapterId,'practice')),{chapterId:firstChapterId,kind:'practice'});
 assert.equal(parseChapterSessionId('review:1:'+sid(firstChapterId,'read')),null);
 assert.equal(parseChapterSessionId('annual-ukg-1'),null);
 assert.equal(bookIdOfChapter('ncert-4-santoor-ch-03'),'ncert-4-santoor');
});

test('a brand new learner gets the first chapter read session as the continue action',()=>{
 const chapters=derive([]);
 const next=findContinueSession(catalogue,chapters);
 assert.ok(next);
 assert.equal(next.reason,'start');
 assert.equal(next.taskId,sid(firstChapterId,'read'));
 assert.equal(next.chapterId,firstChapterId);
 assert.ok(next.bookTitle.length>0);
 assert.equal(findActiveChapter(chapters),null,'nothing is active until something is touched');
});

test('continue learning resumes the active chapter at its next unfinished session',()=>{
 const records=[row(sid(firstChapterId,'read'),'completed')];
 const chapters=derive(records);
 const active=findActiveChapter(chapters)!;
 assert.ok(active);
 assert.equal(active.chapterId,firstChapterId);
 assert.equal(active.status,'practice_due');
 assert.equal(active.nextSessionKind,'practice');
 const next=findContinueSession(catalogue,chapters)!;
 assert.equal(next.taskId,sid(firstChapterId,'practice'));
 assert.equal(next.reason,'finish');

 const afterPractice=derive([...records,row(sid(firstChapterId,'practice'),'completed')]);
 const check=findContinueSession(catalogue,afterPractice)!;
 assert.equal(check.taskId,sid(firstChapterId,'review'));
 assert.equal(check.reason,'check');
});

test('the most recently touched open chapter is the active one',()=>{
 const other=catalogue.find(t=>t.id.startsWith('ncert:')&&t.id.endsWith(':read')&&!t.id.includes(firstChapterId))!;
 const otherChapterId=other.id.slice('ncert:'.length,-':read'.length);
 const records=[
  row(sid(firstChapterId,'read'),'completed','2026-11-01T09:00:00.000Z'),
  row(sid(otherChapterId,'read'),'completed','2026-11-09T09:00:00.000Z'),
 ];
 const active=findActiveChapter(derive(records))!;
 assert.equal(active.chapterId,otherChapterId);
 assert.equal(findContinueSession(catalogue,derive(records))!.chapterId,otherChapterId);
});

test('completed and retained chapters are never presented as active or next work',()=>{
 const records=[
  row(sid(firstChapterId,'read'),'completed'),
  row(sid(firstChapterId,'practice'),'completed'),
  row(sid(firstChapterId,'review'),'completed'),
 ];
 const chapters=derive(records);
 assert.equal(findActiveChapter(chapters),null);
 const next=findContinueSession(catalogue,chapters)!;
 assert.notEqual(next.chapterId,firstChapterId,'a finished chapter must not be offered again');

 const retained=derive([...records,row(masteryId(sid(firstChapterId,'review')),'completed')]);
 const retainedChapter=retained.find(c=>c.chapterId===firstChapterId)!;
 assert.equal(retainedChapter.status,'retained');
 assert.equal(findActiveChapter(retained)?.chapterId===firstChapterId,false);
 // No completed session id is ever returned by the continue recommendation.
 for(const record of records)assert.notEqual(next.taskId,record.task_id);
});

test('a chapter needing revision becomes the continue action with a revise prompt',()=>{
 const records=[row(sid(firstChapterId,'read'),'completed'),row(sid(firstChapterId,'practice'),'needs_revision')];
 const chapters=derive(records);
 assert.equal(chapters.find(c=>c.chapterId===firstChapterId)!.status,'needs_revision');
 const next=findContinueSession(catalogue,chapters)!;
 assert.equal(next.reason,'revise');
 assert.equal(next.taskId,sid(firstChapterId,'practice'));
 assert.deepEqual(revisionChapters(chapters).map(c=>c.chapterId),[firstChapterId]);
});

test('out-of-order completion never replays a session that is already done',()=>{
 // A learner completes practice directly from the chapter page before the read session.
 const records=[row(sid(firstChapterId,'practice'),'completed')];
 const chapters=derive(records);
 const next=findContinueSession(catalogue,chapters)!;
 assert.equal(next.taskId,sid(firstChapterId,'read'));
 const chapter=chapters.find(c=>c.chapterId===firstChapterId)!;
 assert.equal(chapter.status,'in_progress','an out-of-order completion never claims a later stage is due');
 assert.equal(chapter.sessions.find(s=>s.kind==='practice')!.completed,true);
 assert.equal(chapter.sessions.find(s=>s.kind==='read')!.completed,false);
});

test('when every chapter session is finished there is nothing left to continue',()=>{
 const miniCatalogue:QueueTask[]=([['read',15],['practice',20],['review',10]] as const).map(([kind,minutes])=>({
  id:'ncert:ncert-4-santoor-ch-01:'+kind,title:'Together We Can · '+kind,subject:'English',minutes,
  source:'test',href:'/ncert-books/chapter/ncert-4-santoor-ch-01',instructions:[],grade:'Class 4',
 }));
 const records=[row('ncert:ncert-4-santoor-ch-01:read','completed'),
  row('ncert:ncert-4-santoor-ch-01:practice','completed'),
  row('ncert:ncert-4-santoor-ch-01:review','completed')];
 const chapters=deriveChapterProgress(miniCatalogue,records);
 assert.equal(chapters[0].status,'completed');
 assert.equal(findContinueSession(miniCatalogue,chapters),null);
 assert.equal(findActiveChapter(chapters),null);
});

test('chapter stats are honest tallies and never invent mastery percentages',()=>{
 const records=[
  row(sid(firstChapterId,'read'),'completed'),
  row(sid(firstChapterId,'practice'),'completed'),
  row(sid(firstChapterId,'review'),'completed'),
 ];
 const stats=chapterStats(derive(records));
 assert.equal(stats.total,derive([]).length);
 assert.equal(stats.completed,1);
 assert.equal(stats.touched,1);
 assert.equal(stats.retained,0,'retained requires mastery evidence, not just completion');
 assert.equal(stats.notStarted,stats.total-1);
});

test('books are grade-appropriate and carry real chapter counts',()=>{
 const books=booksForLearner('Class 4',derive([]));
 assert.equal(books.length,4);
 assert.ok(books.every(b=>b.chapterCount>0),'contents-pending books stay out of the learner shelf');
 const santoor=books.find(b=>b.id==='ncert-4-santoor')!;
 assert.equal(santoor.chapterCount,12);
 assert.ok(santoor.href.includes('grade=4')&&santoor.href.includes('ncert-4-santoor'));
 assert.deepEqual(booksForLearner('UKG',[]),[],'pre-class stages have no NCERT shelf');
 assert.deepEqual(booksForLearner('Class 12',[]),[]);
});

test('per-book progress counts only that book\u2019s chapters',()=>{
 const records=[row(sid(firstChapterId,'read'),'completed')];
 const books=booksForLearner('Class 4',derive(records));
 const bookId=bookIdOfChapter(firstChapterId);
 const touched=books.find(b=>b.id===bookId)!;
 assert.equal(touched.chaptersStarted,1);
 assert.equal(touched.chaptersCompleted,0);
 for(const book of books)if(book.id!==bookId)assert.equal(book.chaptersStarted,0);
});

test('recent learning evidence keeps order and drops repeats',()=>{
 const history=[
  {id:'a',title:'Read',subject:'English',updatedAt:'2026-11-10T10:00:00.000Z'},
  {id:'b',title:'Practice',subject:'Mathematics',updatedAt:'2026-11-09T10:00:00.000Z'},
  {id:'a',title:'Read',subject:'English',updatedAt:'2026-11-10T10:00:00.000Z'},
 ];
 const recent=recentLearning(history);
 assert.deepEqual(recent.map(r=>r.id),['a','b']);
});

test('learner data stays scoped: deriving for one learner\u2019s records never touches another',()=>{
 const learnerA=[row(sid(firstChapterId,'read'),'completed')];
 const learnerB:{task_id:string;status:string;updated_at:string}[]=[];
 const chaptersA=derive(learnerA),chaptersB=derive(learnerB);
 assert.equal(findActiveChapter(chaptersA)?.chapterId,firstChapterId);
 assert.equal(findActiveChapter(chaptersB),null);
 assert.notEqual(findContinueSession(catalogue,chaptersA)!.taskId,findContinueSession(catalogue,chaptersB)!.taskId);
});

test('empty or malformed progress records do not break the dashboard derivations',()=>{
 const chapters=deriveChapterProgress(catalogue,[
  {task_id:'ncert:not-a-real-chapter:read',status:'completed',updated_at:''},
  {task_id:'garbage',status:'weird',updated_at:'not-a-date'},
 ]);
 assert.ok(Array.isArray(chapters));
 const stats=chapterStats(chapters);
 assert.equal(stats.touched,0);
 assert.equal(findActiveChapter(chapters),null);
 const next=findContinueSession(catalogue,chapters)!;
 assert.equal(next.reason,'start');
});

test('every grade 1–8 learner catalogue exposes a workable continue session and shelf',()=>{
 for(const grade of [1,2,3,4,5,6,7,8]){
  const stage='Class '+grade;
  const cat=queueCatalogue(stage);
  const chapters=deriveChapterProgress(cat,[]);
  assert.ok(chapters.length>0,stage+' has chapters');
  const next=findContinueSession(cat,chapters)!;
  assert.equal(next.reason,'start');
  assert.ok(cat.some(t=>t.id===next.taskId),stage+' continue session exists in the catalogue');
  const books=booksForLearner(stage,chapters);
  assert.ok(books.length>0,stage+' has a shelf');
  const totals=books.reduce((sum,b)=>sum+b.chapterCount,0);
  assert.ok(totals>0,stage+' shelf has chapters');
 }
});

test('derived chapter progress keeps its stable statuses for every evidence step',()=>{
 const chapter:ChapterProgress|undefined=derive([row(sid(firstChapterId,'read'),'completed')])
  .find(c=>c.chapterId===firstChapterId);
 assert.ok(chapter);
 assert.equal(chapter.status,'practice_due');
 assert.deepEqual(chapter.sessions.map(s=>s.completed),[true,false,false]);
});
