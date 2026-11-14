'use client';

import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {learnerTier,tierLabel,type LearnerTier} from '@/lib/learner-tier';
import {subjectTint} from '@/lib/subject-tint';

type Task={id:string;title:string;subject:string;minutes:number;mode?:string;href:string|null;status?:string};
type SessionKind='read'|'practice'|'review';
type ContinueSession={
 taskId:string;kind:SessionKind;chapterId:string;chapterTitle:string;bookTitle:string;
 subject:string;minutes:number;href:string;reason:'resume'|'finish'|'check'|'revise'|'start';label:string;
};
type ActiveChapter={
 chapterId:string;title:string;subject:string;bookTitle:string;grade:number|null;href:string;
 status:string;completedSessions:number;totalSessions:number;nextSessionKind:SessionKind|null;
};
type RevisionChapter={chapterId:string;title:string;subject:string;href:string;completedSessions:number;totalSessions:number;updatedAt:string|null};
type LearnerBook={id:string;title:string;subject:string;language:string;chapterCount:number;chaptersStarted:number;chaptersCompleted:number;href:string};
type ChapterStats={total:number;notStarted:number;inProgress:number;practiceDue:number;understandingCheckDue:number;needsRevision:number;completed:number;retained:number;touched:number};
type HistoryItem={id:string;title:string;subject:string;updatedAt:string};
type ApiLearner={
 id:string;name:string;grade:string;canEdit:boolean;tasks:Task[];assignedTasks?:Task[];upcoming:Task[];
 history:HistoryItem[];
 subjects:{subject:string;completed:number;total:number}[];
 completed:number;total:number;
 assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};
 earnedBadges:{id:string;kind:string;symbol:string;name:string;description:string}[];
 activeChapter?:ActiveChapter|null;continueSession?:ContinueSession|null;
 chapterStats?:ChapterStats;revisionChapters?:RevisionChapter[];books?:LearnerBook[];
};

const TIER_INTRO:Record<LearnerTier,string>={
 toddler:'Grown-up time, not screen time. Pick a short activity to do together away from the device.',
 preschool:'Big buttons, bright pictures, one thing at a time. Tap when you are ready.',
 'early-primary':'One clear next step, then a little practice. You can always ask a grown-up.',
 independent:'Your paths, your pace. Check the plan, work through a lesson, and notice your progress.',
};

/** Learner-facing words for chapter states — never "mastery" language without evidence. */
const STATUS_WORDS:Record<string,string>={
 not_started:'Not started yet',in_progress:'Started',practice_due:'Ready for practice',
 understanding_check_due:'Ready for a quick check',needs_revision:'Needs another look',
 completed:'Finished',retained:'Remembered — well done',
};
const SESSION_WORDS:Record<SessionKind,string>={read:'Read & explore',practice:'Practice',review:'Understanding check'};

function nextTask(learner:ApiLearner):Task|null{
 return learner.assignedTasks!==undefined?(learner.assignedTasks[0]??null):(learner.tasks?.[0]??null);
}

function lessonHref(learnerId:string,taskId:string){
 return `/learn/lesson?learner=${encodeURIComponent(learnerId)}&task=${encodeURIComponent(taskId)}`;
}

function dayWords(updatedAt:string):string{
 const time=new Date(updatedAt).getTime();
 if(!Number.isFinite(time))return '';
 const days=Math.floor((Date.now()-time)/86400000);
 if(days<=0)return 'today';
 if(days===1)return 'yesterday';
 return `${days} days ago`;
}

/**
 * Learner mode home: instant learner switching and an age-adapted layout
 * (toddler / preschool / early primary / independent). Chapter-first: the
 * Continue Learning hero, today's assigned learning, the active chapter,
 * the learner's books, revision and honest progress sit above the fold.
 */
export function LearnHome({initialLearnerId}:{initialLearnerId?:string}){
 const [data,setData]=useState<null|{learners:ApiLearner[]}>(null);
 const [selected,setSelected]=useState<string>(initialLearnerId??'');
 const [error,setError]=useState('');
 const load=useCallback(()=>{
  let alive=true;
  fetch('/api/auto-learning',{cache:'no-store'})
   .then(async r=>{
    const json=await r.json() as {learners?:ApiLearner[];error?:string};
    if(!alive)return;
    if(!r.ok)throw new Error(json.error??'Dashboard unavailable');
    setData({learners:json.learners??[]});
    setSelected(current=>{
     if(current&&(json.learners??[]).some(l=>l.id===current))return current;
     return (json.learners??[]).some(l=>l.id===(initialLearnerId??''))?(initialLearnerId as string):(json.learners?.[0]?.id??'');
    });
    setError('');
   })
   .catch(()=>{if(alive)setError('We could not load the learner space. Check your connection and try again.');});
  return()=>{alive=false;};
 },[initialLearnerId]);
 useEffect(()=>load(),[load]);

 const learner=useMemo(()=>data?.learners.find(l=>l.id===selected)??data?.learners[0]??null,[data,selected]);
 const tier=learner?learnerTier(learner.grade):'independent';

 if(error)return <main className="family-dashboard">
  <div className="dashboard-welcome"><span className="tag">LEARNER MODE</span><h1>Something went wrong</h1></div>
  <p className="muted" role="alert">{error}</p>
  <div className="hero-actions"><button type="button" className="learner-continue" onClick={load}>Try again</button></div>
 </main>;
 if(!data)return <main className="family-dashboard"><p className="muted" role="status">Loading learner space…</p></main>;
 if(!data.learners.length||!learner)return <main className="family-dashboard">
  <div className="dashboard-welcome"><span className="tag">LEARNER MODE</span><h1>No learners yet</h1><p className="muted">A parent can add the first learner from the dashboard.</p></div>
  <Link className="learner-continue" href="/dashboard">Go to parent home</Link>
 </main>;

 return <main className="learn-home" data-tier={tier}>
  <header className="learn-head studio-page-head">
   <div>
    <p className="eyebrow">Learner mode · {tierLabel(tier)}</p>
    <h1>{learner.name}&rsquo;s space</h1>
    <p className="muted">{TIER_INTRO[tier]}</p>
   </div>
   <Link className="mode-switch" href="/dashboard">Parent mode <span aria-hidden="true">→</span></Link>
  </header>

  {data.learners.length>1&&<nav className="learner-switcher" aria-label="Choose learner">
   {data.learners.map(l=><button key={l.id} type="button"
    className={l.id===learner.id?'learner-pill is-active':'learner-pill'}
    aria-pressed={l.id===learner.id} onClick={()=>setSelected(l.id)}>
    <span className="learner-avatar" style={{background:subjectTint(l.tasks?.[0]?.subject??'')}} aria-hidden="true">{l.name.slice(0,1).toUpperCase()}</span>
    <span>{l.name}</span>
   </button>)}
  </nav>}

  <ContinueLearningHero learner={learner} next={nextTask(learner)}/>
  <TodaysLearning learner={learner}/>
  <ActiveChapterCard learner={learner}/>
  <MyBooks learner={learner} tier={tier}/>
  <RevisionNeeded learner={learner}/>
  <RecentLearning learner={learner}/>
  <ProgressOverview learner={learner}/>

  {tier==='toddler'&&<ToddlerHome learner={learner} canEdit={learner.canEdit}/>}
  {tier==='preschool'&&<PreschoolHome learner={learner} next={nextTask(learner)}/>}
  {tier==='early-primary'&&<EarlyPrimaryHome learner={learner}/>}
  {tier==='independent'&&<IndependentHome learner={learner}/>}
 </main>;
}

/** The single most obvious next action: resume the active chapter session, or start one. */
function ContinueLearningHero({learner,next}:{learner:ApiLearner;next:Task|null}){
 const session=learner.continueSession??null;
 if(session){
  const start=session.reason==='start'?'Start this lesson':'Continue this lesson';
  return <section className="continue-hero card" aria-labelledby="continue-hero-title">
   <p className="tag" id="continue-hero-title">CONTINUE LEARNING · {session.label.toUpperCase()}</p>
   <h2>{session.chapterTitle}</h2>
   <p className="continue-meta">
    <span>{session.bookTitle}</span><span>{session.subject}</span>
    <span>{SESSION_WORDS[session.kind]}</span><span>about {session.minutes} minutes</span>
   </p>
   <div className="hero-actions">
    <Link className="hero-action-primary start-today" href={lessonHref(learner.id,session.taskId)}>{start} <span aria-hidden="true">→</span></Link>
    <Link className="hero-action-secondary" href={`/ncert-books/chapter/${session.chapterId}`}>Open the chapter</Link>
   </div>
  </section>;
 }
 if(next){
  // Pre-class learners have no chapter sessions yet — fall back to the ordinary queue.
  return <section className="continue-hero card" aria-labelledby="continue-hero-title">
   <p className="tag" id="continue-hero-title">DO THIS NEXT</p>
   <h2>{next.title}</h2>
   <p className="continue-meta"><span>{next.subject}</span><span>about {next.minutes} minutes</span></p>
   <div className="hero-actions">
    {next.href?<Link className="hero-action-primary start-today" href={next.href}>Start lesson <span aria-hidden="true">→</span></Link>:null}
    <Link className="hero-action-secondary" href={`/learn/path?learner=${learner.id}`}>See my path</Link>
   </div>
  </section>;
 }
 return <section className="continue-hero card" aria-labelledby="continue-hero-title">
  <p className="tag" id="continue-hero-title">ALL CAUGHT UP</p>
  <h2>Everything planned is finished</h2>
  <p className="muted">Lovely work! Choose a book below to learn something new, or take a break.</p>
  <div className="hero-actions"><Link className="hero-action-secondary" href="#my-books">Browse my books <span aria-hidden="true">→</span></Link></div>
 </section>;
}

/** Today's assigned activities from the Daily Assignment Workflow, with completion state. */
function TodaysLearning({learner}:{learner:ApiLearner}){
 if(learner.assignedTasks===undefined)return null;
 const done=new Set(learner.history.map(item=>item.id));
 return <section className="card" aria-labelledby="daily-workload-title">
  <p className="tag">TODAY&rsquo;S LEARNING</p>
  <h2 id="daily-workload-title">Your daily workload</h2>
  {learner.assignedTasks.length?<ol className="idea-list">
   {learner.assignedTasks.map((task,index)=>{
    const completed=done.has(task.id);
    return <li key={task.id} className={completed?'is-done':''}>
     <div className="idea-row">
      <strong>{index+1}. {task.title}</strong>
      {completed?<span className="status-chip is-done">Completed</span>
       :<Link className="idea-start" href={lessonHref(learner.id,task.id)}>Start <span aria-hidden="true">→</span></Link>}
     </div>
     <span>{task.subject} · {task.minutes} min</span>
    </li>;
   })}
  </ol>:<p className="muted">No activities have been assigned for today yet. You can still continue a chapter above or pick a book below.</p>}
 </section>;
}

/** The chapter currently being learned: book, subject, progress and next session. */
function ActiveChapterCard({learner}:{learner:ApiLearner}){
 const chapter=learner.activeChapter;
 if(!chapter)return null;
 return <section className="card" aria-labelledby="active-chapter-title">
  <p className="tag">ACTIVE CHAPTER</p>
  <h2 id="active-chapter-title">{chapter.title}</h2>
  <p className="continue-meta">
   <span>{chapter.bookTitle}</span><span>{chapter.subject}</span>
   <span className="status-chip">{STATUS_WORDS[chapter.status]??chapter.status}</span>
  </p>
  <div className="progress-track" role="img" aria-label={`${chapter.completedSessions} of ${chapter.totalSessions} sessions done`}>
   <div className="progress-fill" style={{width:`${chapter.totalSessions?Math.round(chapter.completedSessions/chapter.totalSessions*100):0}%`}}/>
  </div>
  <p className="muted">{chapter.completedSessions} of {chapter.totalSessions} sessions done{chapter.nextSessionKind?` · next: ${SESSION_WORDS[chapter.nextSessionKind]}`:''}</p>
  <div className="hero-actions">
   <Link className="hero-action-secondary" href={`/ncert-books/chapter/${chapter.chapterId}`}>Open chapter <span aria-hidden="true">→</span></Link>
  </div>
 </section>;
}

/** My Books: the learner's grade-appropriate shelf with real chapter counts. */
function MyBooks({learner,tier}:{learner:ApiLearner;tier:LearnerTier}){
 const books=learner.books??[];
 if(tier==='toddler')return null;
 return <section className="card" id="my-books" aria-labelledby="my-books-title">
  <p className="tag">MY BOOKS</p>
  <h2 id="my-books-title">Choose a book</h2>
  {books.length?<div className="book-shelf">
   {books.map(book=><Link key={book.id} className="book-card" href={book.href} style={{borderTopColor:subjectTint(book.subject)}}>
    <span className="book-card-glyph" aria-hidden="true">{book.subject==='Mathematics'?'∑':book.subject==='English'?'Aa':book.subject==='Hindi'?'अ':book.subject==='Urdu'?'ا':book.subject==='Science'?'⚗':book.subject==='Social Science'?'🌏':'✿'}</span>
    <strong>{book.title}</strong>
    <small>{book.subject} · {book.chapterCount} chapters</small>
    <small className="book-progress">{book.chaptersCompleted>0?`${book.chaptersCompleted} finished`:book.chaptersStarted>0?`${book.chaptersStarted} started`:'New book'}</small>
   </Link>)}
  </div>
  :<p className="muted">{tier==='preschool'||tier==='early-primary'
   ?'Story books arrive here when you start Class 1. Until then, pick a picture above!'
   :'No textbooks are catalogued for this learning stage yet. Ask a parent to check the curriculum library.'}</p>}
 </section>;
}

/** Chapters that need practice or another look, from the adaptive revision rules. */
function RevisionNeeded({learner}:{learner:ApiLearner}){
 const chapters=learner.revisionChapters??[];
 if(!chapters.length)return null;
 return <section className="card" aria-labelledby="revision-title">
  <p className="tag">NEEDS ANOTHER LOOK</p>
  <h2 id="revision-title">Let&rsquo;s revisit these</h2>
  <p className="muted">A little practice keeps ideas in your memory. These chapters are ready for a gentle review.</p>
  <ul className="revision-list">
   {chapters.map(chapter=><li key={chapter.chapterId}>
    <div>
     <strong>{chapter.title}</strong>
     <span>{chapter.subject} · {chapter.completedSessions} of {chapter.totalSessions} sessions done{chapter.updatedAt?` · touched ${dayWords(chapter.updatedAt)}`:''}</span>
    </div>
    <Link className="idea-start" href={`/ncert-books/chapter/${chapter.chapterId}`}>Review <span aria-hidden="true">→</span></Link>
   </li>)}
  </ul>
 </section>;
}

/** Recently finished sessions — real learning evidence, newest first. */
function RecentLearning({learner}:{learner:ApiLearner}){
 const history=(learner.history??[]).slice(0,6);
 if(!history.length)return null;
 return <section className="card" aria-labelledby="recent-title">
  <p className="tag">RECENT LEARNING</p>
  <h2 id="recent-title">What you did recently</h2>
  <ul className="recent-list">
   {history.map(item=><li key={item.id}>
    <span className="recent-dot" style={{background:subjectTint(item.subject)}} aria-hidden="true"/>
    <div><strong>{item.title}</strong><span>{item.subject}{item.updatedAt?` · ${dayWords(item.updatedAt)}`:''}</span></div>
   </li>)}
  </ul>
 </section>;
}

/** Honest progress: counts of chapters and sessions — never a fake mastery percentage. */
function ProgressOverview({learner}:{learner:ApiLearner}){
 const stats=learner.chapterStats;
 const assessment=learner.assessment;
 if(!stats||!stats.total)return null;
 const rows=[
  {label:'Chapters finished',value:stats.completed+stats.retained,hint:stats.retained?`${stats.retained} remembered later`:'sessions all done'},
  {label:'Chapters in progress',value:stats.inProgress+stats.practiceDue+stats.understandingCheckDue,hint:'pick up where you left off'},
  {label:'Chapters to revisit',value:stats.needsRevision,hint:'a little more practice'},
 ];
 return <section className="card" aria-labelledby="progress-title">
  <p className="tag">MY PROGRESS</p>
  <h2 id="progress-title">How your learning is going</h2>
  <div className="progress-overview">
   {rows.map(row=><div key={row.label}>
    <strong>{row.value}</strong><span>{row.label}</span><small>{row.hint}</small>
   </div>)}
  </div>
  <p className="muted">{assessment.completed} sessions finished · {assessment.understood} understanding checks · {assessment.mastered} lasting masteries. A finished session is not the same as mastery — that needs a later independent recall.</p>
 </section>;
}

function ToddlerHome({learner,canEdit}:{learner:ApiLearner;canEdit:boolean}){
 const ideas=(learner.tasks??[]).slice(0,3);
 return <div className="tier-grid">
  <section className="card toddler-lead">
   <p className="tag">Together, away from screens</p>
   <h2>Three short ideas for today</h2>
   <p className="muted">No quizzes, no timers — just a few minutes of play with you.</p>
   <ul className="idea-list">
    {(ideas.length?ideas:[{id:'1',title:'Name five things you can see in this room',subject:'Language',minutes:5,mode:'play',difficulty:'',stage:'',lessonId:null,status:'',href:null}]).map(idea=><li key={idea.id}>
     <strong>{idea.title}</strong><span>{idea.subject} · ~{idea.minutes} min</span>
    </li>)}
   </ul>
   {canEdit&&<Link className="hero-action-secondary" href="/portfolio">Record a family moment <span aria-hidden="true">→</span></Link>}
  </section>
  <section className="card">
   <p className="tag">Grown-up note</p>
   <h2>Screen-free by design</h2>
   <p className="muted">This space only suggests ideas. Nothing is timed, scored or ranked — progress is what you notice together.</p>
  </section>
 </div>;
}

function PreschoolHome({learner,next}:{learner:ApiLearner;next:Task|null}){
 const tiles=(learner.tasks??[]).slice(0,4);
 return <div className="tier-grid">
  <section className="card" aria-labelledby="play-tiles-title">
   <p className="tag" id="play-tiles-title">Pick a picture</p>
   <div className="play-tiles">
    {tiles.length?tiles.map(task=><a key={task.id} className="play-tile" href={task.href??lessonHref(learner.id,task.id)} style={{background:subjectTint(task.subject)}}>
     <span className="play-tile-glyph" aria-hidden="true">{task.subject==='Mathematics'?'🔢':task.subject==='English'?'🔤':task.subject.includes('heritage')||task.subject==='Punjabi'?'🪁':task.subject==='Science'?'🔬':'🎨'}</span>
     <strong>{task.title}</strong>
     <small>{task.minutes} min</small>
    </a>):<p className="muted">New pictures arrive when the plan is prepared.</p>}
   </div>
   {next===null&&<p className="muted">Everything ready for today is finished. Lovely work — take a break!</p>}
  </section>
  <section className="card">
   <p className="tag">Stories &amp; sounds</p>
   <h2>Listen, repeat, giggle</h2>
   <p className="muted">Short phonics, counting games and picture quizzes live inside each lesson — one tap from &ldquo;Start lesson&rdquo;.</p>
  </section>
 </div>;
}

function EarlyPrimaryHome({learner}:{learner:ApiLearner}){
 const subjects=(learner.subjects??[]).slice(0,4);
 return <div className="tier-grid">
  <section className="card" aria-labelledby="subject-cards-title">
   <p className="tag" id="subject-cards-title">Your subjects</p>
   <div className="subject-cards">
    {subjects.map(s=><div className="subject-card" key={s.subject} style={{background:subjectTint(s.subject)}}>
     <strong>{s.subject}</strong>
     <span>{s.completed} of {s.total} done</span>
     <div className="progress-track" role="img" aria-label={`${s.subject}: ${s.completed} of ${s.total} activities done`}><div className="progress-fill" style={{width:`${s.total?Math.round(s.completed/s.total*100):0}%`}}/></div>
    </div>)}
    {!subjects.length&&<p className="muted">Subjects appear after the first activities are recorded.</p>}
   </div>
  </section>
  <section className="card">
   <p className="tag">Stuck? Ask a grown-up</p>
   <p className="muted">Every lesson has a &ldquo;Ask a parent&rdquo; button — that is what it is for.</p>
   <Link className="hero-action-secondary" href={`/learn/path?learner=${learner.id}`}>See my learning path</Link>
  </section>
 </div>;
}

function IndependentHome({learner}:{learner:ApiLearner}){
 const assessment=learner.assessment;
 return <div className="tier-grid">
  <section className="card" aria-labelledby="path-summary-title">
   <p className="tag" id="path-summary-title">Your paths</p>
   <div className="path-summary">
    {(learner.subjects??[]).map(s=><div key={s.subject}>
     <div className="path-summary-row"><strong>{s.subject}</strong><span>{s.completed}/{s.total}</span></div>
     <div className="progress-track" role="img" aria-label={`${s.subject}: ${s.completed} of ${s.total}`}><div className="progress-fill" style={{width:`${s.total?Math.round(s.completed/s.total*100):0}%`}}/></div>
    </div>)}
   </div>
   <Link className="learner-continue" href={`/learn/path?learner=${learner.id}`}>Open learning path <span aria-hidden="true">→</span></Link>
  </section>
  <section className="card" aria-labelledby="achievements-title">
   <p className="tag" id="achievements-title">Achievements</p>
   <ul className="badge-row">
    {(learner.earnedBadges??[]).map(b=><li key={b.id}>{b.symbol} {b.name}</li>)}
    {!learner.earnedBadges?.length&&<li className="muted">Badges appear as you finish activities and recalls.</li>}
   </ul>
   <p className="muted">{assessment.understood} understanding checks · {assessment.mastered} lasting masteries · {assessment.completed} sessions finished.</p>
  </section>
  <section className="card">
   <p className="tag">Reading &amp; reasoning</p>
   <div className="hero-actions">
    <Link className="hero-action-secondary" href="/lessons">Lesson library</Link>
    <Link className="hero-action-secondary" href="/curriculum-studio">Reasoning studio</Link>
   </div>
  </section>
 </div>;
}
