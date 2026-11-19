'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {subjectTint} from '@/lib/subject-tint';
import {revisionState} from '@/lib/revision-state';

type Task={id:string;title:string;subject:string;minutes:number;mode?:string;href:string|null;status?:string};
type Slot={learnerId:string;name:string;grade:string;task:Task;minutes:number;startMinute:number;mode:'guided'|'play'|'independent'};
type Separate={learnerId:string;name:string;grade:string;task:Task};
type Attention={id:string;tone:'revision'|'check'|'plan';text:string;href:string};
type LearnerCard={
 id:string;name:string;grade:string;canEdit:boolean;completed:number;total:number;
 tasks:Task[];completedToday?:string[];history:{id:string;updatedAt:string}[];
 assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};
 activeChapter?:{chapterId:string;title:string;subject:string;bookTitle:string;status:string;completedSessions:number;totalSessions:number;nextSessionKind:'read'|'practice'|'review'|null}|null;
 continueSession?:{taskId:string;chapterId:string;chapterTitle:string;bookTitle:string;kind:'read'|'practice'|'review';label:string}|null;
};
type HomeData={
 learners:LearnerCard[];
 familyPlan:{slots:Slot[];separate:Separate[];budget:number;allocated:number;notes:string[]};
};

const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];

function istDateKey(date:Date):string{
 const ist=new Date(date.getTime()+330*60*1000);
 return ist.toISOString().slice(0,10);
}
function greeting(date:Date):string{
 const h=date.getHours();
 return h<12?'Good morning':h<17?'Good afternoon':'Good evening';
}
function formatFamilyGreetingName(familyName:string|null):string{
 const trimmed=(familyName??'').trim();
 if(!trimmed)return 'family';
 return /\bfamily$/i.test(trimmed)?trimmed:`${trimmed} family`;
}
function streakDays(history:{updatedAt:string}[]):number{
 const days=new Set(history.map(h=>istDateKey(new Date(h.updatedAt))));
 if(!days.size)return 0;
 const today=new Date();
 let cursor=istDateKey(today);
 if(!days.has(cursor)){
  cursor=istDateKey(new Date(today.getTime()-86400000));
  if(!days.has(cursor))return 0;
 }
 let streak=0;
 let probe=new Date(`${cursor}T12:00:00Z`);
 while(days.has(istDateKey(probe))){
  streak+=1;
  probe=new Date(probe.getTime()-86400000);
 }
 return streak;
}

/**
 * Parent Home: greeting, today's family plan hero, per-learner cards,
 * the day's timeline and an "only urgent" attention list.
 */
export function FamilyHome({familyName,canEdit}:{familyName:string|null;canEdit:boolean}){
 const [data,setData]=useState<HomeData|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  const load=()=>fetch('/api/auto-learning?agenda=1',{cache:'no-store'})
   .then(r=>{if(!r.ok)throw new Error('Unable to load plan');return r.json()})
   .then((json:{learners?:LearnerCard[];familyPlan?:HomeData['familyPlan']})=>{
    if(alive)setData({learners:json.learners??[],familyPlan:json.familyPlan??{slots:[],separate:[],budget:60,allocated:0,notes:[]}});
   })
   .catch(()=>{if(alive)setError('We could not load today’s plan. Try refreshing.');});
  void load();
  window.addEventListener('daily-plan-updated',load);
  const restore=(event:PageTransitionEvent)=>{if(event.persisted)void load();};
  window.addEventListener('pageshow',restore);
  return()=>{alive=false;window.removeEventListener('daily-plan-updated',load);window.removeEventListener('pageshow',restore);};
 },[]);

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
   streaks:Object.fromEntries(learners.map(l=>[l.id,streakDays(l.history??[])])) as Record<string,number>,
   nextActivity:Object.fromEntries(learners.map(l=>[l.id,l.tasks?.[0]??null])) as Record<string,Task|null>,
  };
 },[data]);

 const timeline=useMemo(()=>{
  if(!data)return [];
  const rows:{key:string;phase:string;tone:string;title:string;learner:string;href:string|null}[]=[];
  for(const slot of data.familyPlan.slots){
   const phase=slot.mode==='play'?'Shared family warm-up':'Parent-guided learning';
   rows.push({
    key:`${slot.learnerId}:${slot.task.id}`,
    phase,tone:slot.mode==='play'?'saffron':'mint',title:slot.task.title,learner:slot.name,
    href:slot.task.href,
   });
  }
  for(const entry of data.familyPlan.separate){
   rows.push({
    key:`${entry.learnerId}:${entry.task.id}`,phase:entry.task.id.startsWith('weekly-chapter:')?'Chapter reading':entry.task.mode==='independent'?'Independent learning':'Family play',
    tone:entry.task.mode==='independent'?'math':'creativity',title:entry.task.title,learner:entry.name,
    href:entry.task.href,
   });
  }
  const seen=new Set(rows.map(r=>r.key));
  for(const learner of data.learners){
   for(const task of learner.tasks??[]){
    const key=`${learner.id}:${task.id}`;
    if((task.status==='needs_revision'||task.id.startsWith('review:'))&&!seen.has(key)){
     seen.add(key);
     rows.push({key,phase:'Revision',tone:'language',title:task.title,learner:learner.name,href:task.href});
    }
   }
  }
  const completed=new Set(data.learners.flatMap(learner=>(learner.completedToday??[]).map(id=>`${learner.id}:${id}`)));
  return rows.map(row=>({...row,done:completed.has(row.key)}));
 },[data]);

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
     <Link className="hero-action-secondary" href="/learn">Open learner mode</Link>
    </div>
    <span className="family-avatar" aria-hidden="true">{(familyName??'F').trim().slice(0,1).toUpperCase()||'F'}</span>
   </header>

   {(Boolean(derived?.attention.length)||!canEdit)&&<div className="family-agenda-notices">
    {derived&&derived.attention.length>0&&<a className="attention-pill" href="#parent-attention">
     <span aria-hidden="true">●</span> {derived.attention.length} {derived.attention.length===1?'item needs':'items need'} you
    </a>}
    {!canEdit&&<span className="mode-chip">Read-only view</span>}
   </div>}
   {error?<p className="muted family-agenda-message" role="status">{error}</p>
    :timeline.length>0?<ol className="family-agenda-list" aria-label="Today’s activities">
     {timeline.map(row=><li className="family-agenda-row" key={`${row.key}-${row.phase}`}>
      <p className="timeline-title">
       <span className={`timeline-dot tone-${row.tone}`} aria-hidden="true"/>
       {row.href?<a href={row.href}>{row.title}</a>:<span>{row.title}</span>}
      </p>
      <span className="family-agenda-learner">{row.learner}</span>
      <span className="family-agenda-phase">{row.phase}</span>
      <span className={`family-agenda-status${row.done?' is-done':''}`}>{row.done?'✓ Done':'Pending'}</span>
     </li>)}
    </ol>:<p className="muted family-agenda-message">{data?'Nothing scheduled yet.':'Loading today’s activities.'}</p>}
  </div>

  <div className="family-learner-grid" aria-label="Learners">
   {data?.learners.map(learner=>{
    const next=derived?.nextActivity[learner.id]??null;
    const streak=derived?.streaks[learner.id]??0;
    const percent=learner.total>0?Math.round((learner.completed/learner.total)*100):0;
    const view=revisionState({
    completed:learner.assessment.completed,understood:learner.assessment.understood,
    mastered:learner.assessment.mastered,independentRecall:learner.assessment.independentRecall,
    hasRevisionQueue:(learner.tasks??[]).some(t=>t.status==='needs_revision'||t.id.startsWith('review:')),
   });
   return <article className="family-learner-card card" key={learner.id}>
     <header>
      <span className="learner-avatar" style={{background:subjectTint(next?.subject??'')}} aria-hidden="true">{learner.name.slice(0,1).toUpperCase()}</span>
      <div>
       <h3>{learner.name}</h3>
       <p>{learner.grade}</p>
      </div>
      {streak>0&&<span className="streak-chip" title="Consecutive days with at least one finished activity">🔥 {streak}</span>}
     </header>
     <p className={`revision-state state-${view.state}`}>
      <span aria-hidden="true">{view.state==='confident'?'●':view.state==='needs-support'?'▲':'◐'}</span>
      <strong>{view.label}</strong>
      <span className="revision-hint">{view.recommendation}</span>
     </p>
     <div className="learner-progress-row">
      <div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div>
      <span>{learner.completed}/{learner.total} activities</span>
     </div>
     {learner.activeChapter&&<p className="learner-chapter-row">
      <span className="learner-next-label">Chapter</span>
      <a href={`/ncert-books/chapter/${learner.activeChapter.chapterId}`}>
       {learner.activeChapter.bookTitle} · {learner.activeChapter.title}
      </a>
      <small>{learner.activeChapter.completedSessions}/{learner.activeChapter.totalSessions} sessions{learner.activeChapter.nextSessionKind?` · next: ${learner.activeChapter.nextSessionKind==='read'?'Read & explore':learner.activeChapter.nextSessionKind==='practice'?'Practice':'Understanding check'}`:''}</small>
     </p>}
     <p className="learner-next">
      <span className="learner-next-label">Up next</span>
      {next?`${next.title} · ${next.minutes} min`:'All recommended activities are finished — lovely work.'}
     </p>
     <footer>
     {learner.continueSession?<a className="learner-continue" href={`/learn/lesson?learner=${learner.id}&task=${encodeURIComponent(learner.continueSession.taskId)}`}>Continue chapter <span aria-hidden="true">→</span></a>
      :next&&next.href?<a className="learner-continue" href={next.href}>Continue <span aria-hidden="true">→</span></a>
      :next?<a className="learner-continue" href="#today-plan">Continue <span aria-hidden="true">→</span></a>
      :<Link className="learner-continue" href={`/learn?learner=${learner.id}`}>Open learner mode <span aria-hidden="true">→</span></Link>}
     </footer>
    </article>;
   })}
   {data&&data.learners.length===0&&<p className="muted">No learners yet — add your first learner below to prepare a plan.</p>}
   {!data&&!error&&<p className="muted">Loading learners…</p>}
  </div>

  <section className="family-attention card" id="parent-attention" aria-labelledby="attention-title">
   <header className="section-heading">
    <div>
     <p className="tag">Parent attention</p>
     <h2 id="attention-title">Only what actually needs you</h2>
    </div>
   </header>
   {derived&&derived.attention.length>0?<ul className="attention-list">
    {derived.attention.map(item=><li key={item.id} className={`attention-item tone-${item.tone}`}>
     <span className="attention-icon" aria-hidden="true">{item.tone==='revision'?'↻':item.tone==='check'?'✓':'✎'}</span>
     <span>{item.text}</span>
     <a href={item.href}>Open <span aria-hidden="true">→</span></a>
    </li>)}
   </ul>:data?<p className="attention-clear" role="status">All clear — nothing needs your attention right now.</p>:<p className="muted">Checking for anything that needs you…</p>}
  </section>
 </section>;
}
