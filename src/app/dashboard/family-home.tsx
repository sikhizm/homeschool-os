'use client';

import Link from 'next/link';
import MyBooks from '@/components/my-books';
import {useEffect,useMemo,useState} from 'react';
import {activityLabels, chapterActivityHref, type ChapterPlanItem} from '@/lib/planning/chapter-activities';
import {clearPrivateMemoryCache,invalidatePrivateMemoryCache,readPrivateMemoryCache,writePrivateMemoryCache} from '@/lib/private-memory-cache';

type ReadingProgress = {learnerId:string;name:string;total:number;read:number;
 remaining:{chapterId:string;title:string;current:boolean;inRhythm:boolean}[]};
type Task={id:string;title:string;subject:string;minutes:number;mode?:string;href:string|null;status?:string};
type Slot={learnerId:string;name:string;grade:string;task:Task;minutes:number;startMinute:number;mode:'guided'|'play'|'independent'};
type Separate={learnerId:string;name:string;grade:string;task:Task};
export type Attention={id:string;tone:'revision'|'check'|'plan'|'test';text:string;href:string};
type LearnerCard={
 id:string;name:string;grade:string;canEdit:boolean;
 tasks:Task[];completedToday?:string[];
 assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};
};
type HomeData={
 learners:LearnerCard[];
 familyPlan:{slots:Slot[];separate:Separate[];budget:number;allocated:number;notes:string[]};
};

const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];

function greeting(date:Date):string{
 const h=date.getHours();
 return h<12?'Good morning':h<17?'Good afternoon':'Good evening';
}
function formatFamilyGreetingName(familyName:string|null):string{
 const trimmed=(familyName??'').trim();
 if(!trimmed)return 'family';
 return /\bfamily$/i.test(trimmed)?trimmed:`${trimmed} family`;
}
/**
 * Parent Home: greeting, today's family plan hero, per-learner cards,
 * the day's timeline and an "only urgent" attention list.
 */
export function FamilyHome({familyName,canEdit,cacheScope,testReminders=[]}:{familyName:string|null;canEdit:boolean;cacheScope:string;testReminders?:Attention[]}){
 const [data,setData]=useState<HomeData|null>(null);
 const [chapterPlan,setChapterPlan]=useState<ChapterPlanItem[]>([]);
 const [chapterCoverage,setChapterCoverage]=useState<{learnerId:string;total:number;read:number;revised:number;finished:number}[] | null>(null);
 const [readingWeek,setReadingWeek]=useState<{id:string;name:string;planned:number;onTime:number;late:number}[]>([]);
 const [readingProgress,setReadingProgress]=useState<ReadingProgress[]>([]);
 const [addingReading,setAddingReading]=useState(false);
 const [readingMessage,setReadingMessage]=useState('');
 const [weekendSuggestions,setWeekendSuggestions]=useState<(Pick<ChapterPlanItem,'chapterId'|'learnerId'|'learnerName'|'title'> & {activity:'test'|'revision'})[]>([]);
 const [rhythmReady,setRhythmReady]=useState(false);
 const [chapterPlanError,setChapterPlanError]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const agendaKey=`dashboard:agenda:${day}`;
  const rhythmKey=`dashboard:rhythm:${day}`;
  type RhythmSnapshot={ready:boolean;items:ChapterPlanItem[];chapterCoverage?:typeof chapterCoverage;
    readingWeek?:typeof readingWeek;readingProgress?:ReadingProgress[];weekendSuggestions?:typeof weekendSuggestions};
  const cachedAgenda=readPrivateMemoryCache<HomeData>(cacheScope,agendaKey);
  const cachedRhythm=readPrivateMemoryCache<RhythmSnapshot>(cacheScope,rhythmKey);
  // Hydrate after the effect starts, rather than synchronously chaining React renders.
  queueMicrotask(()=>{
    if(!alive)return;
    if(cachedAgenda)setData(cachedAgenda);
    if(cachedRhythm){
      setChapterCoverage(cachedRhythm.chapterCoverage??null);
      setReadingProgress(cachedRhythm.readingProgress??[]);
      setChapterPlan(cachedRhythm.items);
      setReadingWeek(cachedRhythm.readingWeek??[]);
      setWeekendSuggestions(cachedRhythm.weekendSuggestions??[]);
      setRhythmReady(cachedRhythm.ready);
    }
  });
  const loadAgenda=()=>fetch('/api/auto-learning?agenda=1',{cache:'no-store'})
   .then(r=>{
    if(r.status===401||r.status===403){clearPrivateMemoryCache();setData(null);throw new Error('Sign in required');}
    if(!r.ok)throw new Error('Unable to load plan');
    return r.json();
   })
   .then((json:{learners?:LearnerCard[];familyPlan?:HomeData['familyPlan']})=>{
    const result:HomeData={learners:json.learners??[],familyPlan:json.familyPlan??{slots:[],separate:[],budget:60,allocated:0,notes:[]}};
    if(alive){writePrivateMemoryCache(cacheScope,agendaKey,result);setData(result);setError('');}
   })
   .catch(()=>{if(alive)setError('We could not refresh today’s plan. Try again.');});
  const loadChapterPlan=async()=>{
   try{
    if(canEdit) {
     const scheduled=await fetch('/api/chapter-plan',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'schedule-reading'}),
     });
     if(!scheduled.ok && scheduled.status!==503)throw new Error();
    }
    const response=await fetch('/api/chapter-plan?rhythm=1',{cache:'no-store'});
    if(response.status===401||response.status===403){clearPrivateMemoryCache();setData(null);throw new Error('Sign in required');}
    if(!response.ok)throw new Error();
    const result=await response.json() as RhythmSnapshot;
    if(alive){
     writePrivateMemoryCache(cacheScope,rhythmKey,result);
     setChapterCoverage(result.chapterCoverage??null);
     setReadingProgress(result.readingProgress??[]);
     setChapterPlan(result.items);setReadingWeek(result.readingWeek??[]);setWeekendSuggestions(result.weekendSuggestions??[]);
     setRhythmReady(result.ready);setChapterPlanError(false);
    }
   }catch{if(alive)setChapterPlanError(true);}
  };
  const load=()=>{void loadAgenda();void loadChapterPlan();};
  const changed=()=>{
   invalidatePrivateMemoryCache(cacheScope,'dashboard:');
   invalidatePrivateMemoryCache(cacheScope,'planning:');
   invalidatePrivateMemoryCache(cacheScope,'chapter-plan:');
   // A mutation means the prior snapshot is no longer a safe progress display.
   setData(null);
   setChapterPlan([]);
   setChapterCoverage(null);
   setReadingProgress([]);
   setReadingWeek([]);
   setWeekendSuggestions([]);
   setRhythmReady(false);
   void load();
  };
  load();
  window.addEventListener('daily-plan-updated',changed);
  window.addEventListener('chapter-tests-updated',changed);
  window.addEventListener('chapter-status-updated',changed);
  const restore=(event:PageTransitionEvent)=>{if(event.persisted)void load();};
  window.addEventListener('pageshow',restore);
  return()=>{
   alive=false;
   window.removeEventListener('daily-plan-updated',changed);
   window.removeEventListener('chapter-tests-updated',changed);
   window.removeEventListener('chapter-status-updated',changed);
   window.removeEventListener('pageshow',restore);
  };
 },[canEdit,cacheScope]);

 async function addReading(learnerId:string, chapterId:string) {
  setAddingReading(true);
  setReadingMessage('');
  try {
   const response=await fetch('/api/chapter-plan',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({learnerId,chapterId,period:'day',activity:'reading'}),
   });
   if(!response.ok)throw new Error();
   window.dispatchEvent(new Event('daily-plan-updated'));
   setReadingMessage('Reading added to Today’s rhythm.');
  }catch{
   setReadingMessage('Could not add reading. Try again.');
  }finally{
   setAddingReading(false);
  }
 }

 const now=new Date();
 const derived=useMemo(()=>{
  if(!data)return null;
  const learners=data.learners;
  const outstanding=learners.reduce((sum,l)=>sum+(l.tasks?.length??0),0);
  const planned=data.familyPlan.slots.length;
  const attention:Attention[]=[];
  for(const learner of learners){
   const revision=(learner.tasks??[]).filter(t=>t.status==='needs_revision'||t.id.startsWith('review:'));
   if(revision[0])attention.push({id:`rev-${learner.id}`,tone:'revision',text:`${learner.name} is ready to revisit: ${revision[0].title}`,href:revision[0].href??'#today-plan'});
   const unchecked=learner.assessment.completed-learner.assessment.understood;
   if(unchecked>0)attention.push({id:`check-${learner.id}`,tone:'check',text:`${unchecked} finished ${unchecked===1?'activity':'activities'} from ${learner.name} still ${unchecked===1?'needs':'need'} a quick understanding check`,href:'#today-plan'});
  }
  if(planned===0&&outstanding>0)attention.push({id:'plan',tone:'plan',text:'Today’s family plan has not been prepared yet — one tap prepares it',href:'#today-plan'});
  return{
   attention:attention.slice(0,4),
  };
 },[data]);
 const attention = [...testReminders, ...(derived?.attention ?? [])];

 const timeline=useMemo(()=>{
  if(!data)return [];
  const rows:{key:string;phase:string;tone:string;title:string;learnerId:string;learner:string;href:string|null}[]=[];
  for(const slot of data.familyPlan.slots){
   const phase=slot.mode==='play'?'Shared family warm-up':'Parent-guided learning';
   rows.push({
    key:`${slot.learnerId}:${slot.task.id}`,
    phase,tone:slot.mode==='play'?'saffron':'mint',title:slot.task.title,learnerId:slot.learnerId,learner:slot.name,
    href:slot.task.href,
   });
  }
  for(const entry of data.familyPlan.separate){
   rows.push({
    key:`${entry.learnerId}:${entry.task.id}`,phase:entry.task.id.startsWith('weekly-chapter:')?'Chapter reading':entry.task.mode==='independent'?'Independent learning':'Family play',
    tone:entry.task.mode==='independent'?'math':'creativity',title:entry.task.title,learnerId:entry.learnerId,learner:entry.name,
    href:entry.task.href,
   });
  }
  const seen=new Set(rows.map(r=>r.key));
  for(const learner of data.learners){
   for(const task of learner.tasks??[]){
    const key=`${learner.id}:${task.id}`;
    if((task.status==='needs_revision'||task.id.startsWith('review:'))&&!seen.has(key)){
     seen.add(key);
     rows.push({key,phase:'Revision',tone:'language',title:task.title,learnerId:learner.id,learner:learner.name,href:task.href});
    }
   }
  }
  const completed=new Set(data.learners.flatMap(learner=>(learner.completedToday??[]).map(id=>`${learner.id}:${id}`)));
  const explicit = new Set(chapterPlan.flatMap(item => {
   const prefix=`${item.learnerId}:`;
   const session={reading:'read',revision:'practice',test:'review'}[item.activity];
   return [`${prefix}ncert:${item.chapterId}:${session}`,
    ...(item.activity==='reading'?[`${prefix}weekly-chapter:${item.chapterId}`]:[])];
  }));
  return [
   ...chapterPlan.filter(item=>!item.optionalTest).map(item=>({
    key:`${item.learnerId}:${item.chapterId}:${item.activity}`,phase:activityLabels[item.activity],
    tone:item.activity==='reading'?'math':item.activity==='revision'?'language':'saffron',
    title:item.title,learnerId:item.learnerId,learner:item.learnerName,href:chapterActivityHref(item.chapterId,item.learnerId,item.activity),done:item.done,
    status:item.activity==='reading' ? (item.done ? (item.onTime?'✓ Read on time':'✓ Read after due date') : (item.carriedOver?'Carried over':'Pending')) : (item.done?'✓ Done':'Pending'),
   })),
   ...rows.filter(row=>!explicit.has(row.key) && (!rhythmReady || !/:ncert:[^:]+:(read|practice|review)$/.test(row.key)))
    .map(row=>({...row,done:completed.has(row.key),status:completed.has(row.key)?'✓ Done':'Pending'})),
  ];
 },[data,chapterPlan,rhythmReady]);

 const sundayTests=chapterPlan.filter(item=>item.optionalTest);
 const todayDone=timeline.filter(row=>row.done).length;
 const heroPercent=timeline.length?Math.round(todayDone/timeline.length*100):0;
 return <section aria-labelledby="family-home-title" className="family-home">
  <div className="family-agenda card">
   <header className="family-agenda-header">
    <div className="family-agenda-heading">
     <p className="eyebrow">{greeting(now)}, {formatFamilyGreetingName(familyName)} — {DAY_NAMES[now.getDay()]}, {now.getDate()} {MONTH_NAMES[now.getMonth()]}</p>
     <h1 id="family-home-title">Today’s rhythm</h1>
    </div>
    <div className="family-hero-progress" role="img" aria-label={`Today’s progress: ${todayDone} activities finished, ${heroPercent}% of today’s activities`}>
     <div className="progress-track"><div className="progress-fill" style={{width:`${heroPercent}%`}}/></div>
     <span>{todayDone} done today · {heroPercent}%</span>
    </div>
    <div className="hero-actions">
     <a className="hero-action-primary start-today" href="#today-plan">Start today’s learning <span aria-hidden="true">→</span></a>
     <Link className="hero-action-secondary" href="/learn/path">Open Learning Path</Link>
    </div>
    <span className="family-avatar" aria-hidden="true">{(familyName??'F').trim().slice(0,1).toUpperCase()||'F'}</span>
   </header>

   {(attention.length > 0||!canEdit)&&<div className="family-agenda-notices">
    {attention.length > 0 && <a className="attention-pill" href="#parent-attention">
     <span aria-hidden="true">●</span> {attention.length} {attention.length===1?'item needs':'items need'} you
    </a>}
    {!canEdit&&<span className="mode-chip">Read-only view</span>}
   </div>}
   {chapterPlanError && <p className="muted family-agenda-message" role="status">Planned chapter activities could not be loaded.</p>}
   {error?<p className="muted family-agenda-message" role="status">{error}</p>
    :timeline.length>0?<ol className="family-agenda-list" aria-label="Today’s activities">
     {timeline.map(row=><li className="family-agenda-row" key={`${row.key}-${row.phase}`}>
      <p className="timeline-title">
       <span className={`timeline-dot tone-${row.tone}`} aria-hidden="true"/>
       {row.href?<a href={row.href}>{row.title}</a>:<span>{row.title}</span>}
      </p>
      <span className="family-agenda-learner">{row.learner}</span>
      <span className="family-agenda-phase">{row.phase}</span>
      <span className={`family-agenda-status${row.done?' is-done':''}`}>{row.status}</span>
     </li>)}
    </ol>:<p className="muted family-agenda-message">{data?'Nothing scheduled yet.':'Loading today’s activities.'}</p>}
    {readingProgress.map(item=>{
     const next=item.remaining.find(chapter=>!chapter.inRhythm);
     const scheduled=item.remaining.filter(chapter=>chapter.inRhythm).length;
     const history=readingWeek.find(entry=>entry.id===item.learnerId);
     return <section className="weekly-reading-strip" key={item.learnerId} aria-label={`Weekly reading for ${item.name}`}>
      <div className="weekly-reading-summary">
       <strong>Weekly reading · {item.name}</strong>
       <span>{item.total>0?`${item.read} of ${item.total} read`:'Reading carried forward'}{scheduled>0&&` · ${scheduled} in today’s rhythm`}</span>
      </div>
      {item.total>0&&<progress className="weekly-reading-progress" value={item.read} max={item.total}
       aria-label={`Weekly chapters read by ${item.name}`}/>}
      {next&&<div className="weekly-reading-next">
       <span>{next.current?'Next to schedule':'From an earlier week'}</span>
       <Link href={chapterActivityHref(next.chapterId,item.learnerId,'reading')}>{next.title}</Link>
      </div>}
      <div className="weekly-reading-actions">
       {canEdit&&next&&<button type="button" className="hero-action-secondary" disabled={addingReading}
        aria-label={`Add ${next.title} to today for ${item.name}`}
        onClick={()=>void addReading(item.learnerId,next.chapterId)}>＋ Add to today</button>}
       <Link href={`/planning?learner=${encodeURIComponent(item.learnerId)}#weekly-chapter-activities`}>View week →</Link>
      </div>
      {history&&<details className="weekly-reading-history">
       <summary>Reading schedule history</summary>
       <p>{history.onTime} of {history.planned} daily readings on time this week{history.late>0?` · ${history.late} read after the due date`:''}</p>
      </details>}
     </section>;
    })}
    {readingWeek.filter(entry=>!readingProgress.some(item=>item.learnerId===entry.id)).map(entry=><details key={entry.id} className="weekly-reading-history">
     <summary>Reading schedule history · {entry.name}</summary>
     <p>{entry.onTime} of {entry.planned} daily readings on time this week{entry.late>0?` · ${entry.late} read after the due date`:''}</p>
    </details>)}
    <div className="weekly-reading-notice" role="status">{readingMessage}</div>
    {sundayTests.length>0&&<div className="family-agenda-message">
     <strong>Optional Sunday tests</strong>
     <ul>{sundayTests.map(item=><li key={`${item.learnerId}:${item.chapterId}`}>
      <Link href={chapterActivityHref(item.chapterId,item.learnerId,'test')}>{item.title}</Link> · {item.learnerName} · {item.done?'Done':'Scheduled'}
     </li>)}</ul>
    </div>}
    <MyBooks daily />
    {weekendSuggestions.length>0&&<div className="family-agenda-message">
     <strong>Optional weekend review</strong>
     <ul>{weekendSuggestions.map(item=><li key={`${item.learnerId}:${item.chapterId}`}>
      <Link href={chapterActivityHref(item.chapterId,item.learnerId,item.activity)}>{activityLabels[item.activity]} · {item.title}</Link> · {item.learnerName}
     </li>)}</ul>
    </div>}
  </div>

  <div className="family-learner-grid" aria-label="Learners">
   {data?.learners.map(learner=>{
    const coverage=chapterCoverage?.find(item=>item.learnerId===learner.id);
    const next=timeline.find(row=>row.learnerId===learner.id&&!row.done);
    const optionalTest=sundayTests.find(item=>item.learnerId===learner.id&&!item.done);
    const nextHref=next ? next.href ?? '#today-plan' : optionalTest
     ? chapterActivityHref(optionalTest.chapterId, learner.id, 'test') : null;
    return <article className="family-learner-card card" key={learner.id}>
     <header>
      <span className="learner-avatar" aria-hidden="true">{learner.name.slice(0,1).toUpperCase()}</span>
      <div><h3>{learner.name}</h3><p>{learner.grade}</p></div>
     </header>
     <div className="family-learner-progress">
      <div className="family-learner-progress-heading">
       <strong>NCERT chapter progress</strong>
       {coverage?.total ? <span>{coverage.read} of {coverage.total} read</span> : null}
      </div>
      {coverage?.total ? <>
       <div className="progress-track" role="progressbar" aria-label={`Chapters read by ${learner.name}`}
        aria-valuenow={coverage.read} aria-valuemin={0} aria-valuemax={coverage.total}>
        <div className="progress-fill" style={{width:`${coverage.read / coverage.total * 100}%`}}/>
       </div>
       <p className="muted">{coverage.revised} revised · {coverage.finished} passed a test</p>
      </> : <p className="muted">{chapterPlanError?'Chapter progress unavailable.'
       : chapterCoverage?'No chapters in the yearly plan.':rhythmReady?'Chapter progress unavailable.':'Loading chapter progress…'}</p>}
     </div>
     <footer className="family-learner-activity" aria-label="Up next in Today’s rhythm">
      {next||optionalTest ? <div className="family-learner-activity-description">
       <span className={`timeline-dot tone-${next?.tone ?? 'saffron'}`} aria-hidden="true"/>
       <div><strong>{next?.title ?? optionalTest?.title}</strong><span>{next?.phase ?? 'Optional Sunday test'}</span></div>
      </div> : <p className="muted">{chapterPlanError?'Could not load the chapter plan.':'Nothing left for today'}</p>}
      {nextHref?<Link className="learner-continue" href={nextHref}>
        {next?.phase==='Reading'?'Read chapter':next?.phase==='Revision'?'Open revision':next?.phase==='Test'||optionalTest&&!next?'Open test records':'Open activity'} <span aria-hidden="true">→</span>
      </Link>:<Link className="hero-action-secondary" href={`/learn/path?learner=${encodeURIComponent(learner.id)}`}>Open Learning Path <span aria-hidden="true">→</span></Link>}
     </footer>
    </article>;
   })}
   {data&&data.learners.length===0&&<p className="muted">No learners yet — add your first learner below to prepare a plan.</p>}
   {!data&&!error&&<p className="muted">Loading learners…</p>}
  </div>

  {attention.length > 0 && <section className="family-attention card" id="parent-attention" aria-labelledby="attention-title">
   <header className="section-heading">
    <div>
     <h2 id="attention-title">Parent attention</h2>
    </div>
   </header>
   <ul className="attention-list">
    {attention.map(item=><li key={item.id} className={`attention-item tone-${item.tone}`}>
     <span className="attention-icon" aria-hidden="true">{item.tone==='revision'?'↻':item.tone==='check'?'✓':item.tone==='test'?'▦':'✎'}</span>
     <span>{item.text}</span>
     <Link href={item.href}>{item.tone === 'test' ? 'Open test' : 'Open'} <span aria-hidden="true">→</span></Link>
    </li>)}
   </ul>
  </section>}
 </section>;
}
