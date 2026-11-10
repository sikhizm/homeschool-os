'use client';

import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {subjectTint} from '@/lib/subject-tint';

type TeachingLesson={
 objective:string;materials:string;minutes:number;prep:string;example:string;
 steps:string[];questions:string[];exercise:string;expectedAnswer:string;
 easier:string;harder:string;completionCriteria:string;revision:string|null;
};
type TaskDetail={
 id:string;title:string;subject:string;minutes:number;source:string;href:string;
 instructions:string[];check?:string;lesson?:TeachingLesson;week?:number|null;
 isReview:boolean;reviewId:string;status:string;
};

const PHASES=['Discover','Understand','Explore','Practice','Reflect','Complete'] as const;
type Phase=(typeof PHASES)[number];
const SAVE_PREFIX='homeschool-os-lesson-';

type SavedPhase={phaseIndex:number;ratings:Record<string,'got'|'hint'|'not'>;reflection:string};

function loadSaved(taskId:string):SavedPhase{
 try{
  const raw=localStorage.getItem(SAVE_PREFIX+taskId);
  if(raw){const parsed=JSON.parse(raw) as SavedPhase;return{phaseIndex:parsed.phaseIndex??0,ratings:parsed.ratings??{},reflection:parsed.reflection??''};}
 }catch{}
 return{phaseIndex:0,ratings:{},reflection:''};
}
function persist(taskId:string,state:SavedPhase){
 try{localStorage.setItem(SAVE_PREFIX+taskId,JSON.stringify(state));}catch{}
}

/**
 * Lesson Player: one concept at a time through
 * Discover → Understand → Explore → Practice → Reflect → Complete,
 * with progress, audio read-aloud, parent help and autosave.
 */
export function LessonPlayer({learnerId,taskId,learnerName}:{learnerId:string;taskId:string;learnerName:string}){
 const [task,setTask]=useState<TaskDetail|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [saved,setSaved]=useState(false);
 const [savedState,setSavedState]=useState<SavedPhase>({phaseIndex:0,ratings:{},reflection:''});
 const [showParentHelp,setShowParentHelp]=useState(false);
 const [isSpeaking,setIsSpeaking]=useState(false);
 const speechRun=useRef(0);

 const speak=useCallback((text:string)=>{
  if(typeof window==='undefined'||!('speechSynthesis' in window))return;
  const run=++speechRun.current;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.rate=0.95;
  utterance.onstart=()=>{if(run===speechRun.current)setIsSpeaking(true);};
  utterance.onend=()=>{if(run===speechRun.current)setIsSpeaking(false);};
  utterance.onerror=()=>{if(run===speechRun.current)setIsSpeaking(false);};
  setIsSpeaking(true);
  window.speechSynthesis.speak(utterance);
 },[]);

 const stopSpeaking=useCallback(()=>{
  speechRun.current+=1;
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
  setIsSpeaking(false);
 },[]);

 useEffect(()=>()=>{
  speechRun.current+=1;
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
 },[]);

 useEffect(()=>{
  let alive=true;
  fetch(`/api/auto-learning?path=0&task=${encodeURIComponent(taskId)}&learner=${encodeURIComponent(learnerId)}`,{cache:'no-store'})
   .then(r=>r.json())
   .then((json:{learners?:{id:string;taskDetail?:TaskDetail}[]})=>{
    if(!alive)return;
    const found=json.learners?.find(l=>l.id===learnerId)?.taskDetail;
    if(found){
     setTask(found);
     setSavedState(loadSaved(found.id));
    }else setError('That lesson could not be found for this learner.');
   })
   .catch(()=>{if(alive)setError('We could not load the lesson. Try refreshing.');});
  return()=>{alive=false;};
 },[learnerId,taskId]);

 const update=useCallback((patch:Partial<SavedPhase>)=>{
  setSavedState(current=>{
   const next={...current,...patch};
   if(task)persist(task.id,next);
   return next;
  });
 },[task]);

 const phaseIndex=Math.min(savedState.phaseIndex,PHASES.length-1);
 const phase=PHASES[phaseIndex] as Phase;
 const goNext=()=>update({phaseIndex:Math.min(phaseIndex+1,PHASES.length-1)});
 const goBack=()=>update({phaseIndex:Math.max(phaseIndex-1,0)});

 const content=useMemo(()=>{
  if(!task)return null;
  const lesson=task.lesson;
  const steps=lesson?.steps??task.instructions??[];
  const questions=lesson?.questions??(task.check?[task.check]:[]);
  return{lesson,steps,questions};
 },[task]);

 async function record(status:'completed'|'needs_revision',assessment?:'understood'|'not-yet'){
  if(!task)return;
  setBusy(true);setSaved(false);
  try{
   // Recall results belong to the scheduled review round, not the base lesson.
   const payload=task.isReview
    ?{learnerId,taskId:task.reviewId,status,
      recallQuality:status==='completed'?(assessment==='understood'?'independent':'with_hint'):'not_yet'}
    :{learnerId,taskId:task.id,status,assessment};
   const response=await fetch('/api/auto-learning',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload),
   });
   if(response.ok){setSaved(true);if(status==='completed')goNext();}
  }finally{setBusy(false);}
 }

 if(error)return <main className="lesson-player-page"><p className="muted" role="alert">{error}</p><Link className="mode-switch" href={`/learn?learner=${learnerId}`}>Back to learner home</Link></main>;
 if(!task||!content)return <main className="lesson-player-page"><p className="muted">Opening the lesson…</p></main>;

 const lesson=content.lesson;
 const tint=subjectTint(task.subject);

 return <main className="lesson-player-page" data-phase={phase.toLowerCase()}>
  <header className="player-topbar">
   <Link className="mode-switch" href={`/learn/path?learner=${learnerId}`} aria-label="Back to learning path">← Path</Link>
   <div className="player-progress" role="progressbar" aria-valuemin={1} aria-valuemax={PHASES.length} aria-valuenow={phaseIndex+1} aria-label={`Step ${phaseIndex+1} of ${PHASES.length}: ${phase}`}>
    <div className="player-progress-track"><div className="player-progress-fill" style={{width:`${((phaseIndex+1)/PHASES.length)*100}%`}}/></div>
    <span>{phaseIndex+1}/{PHASES.length} · {phase}</span>
   </div>
   {isSpeaking&&<button type="button" className="audio-btn audio-stop-btn" onClick={stopSpeaking} aria-label="Stop reading aloud">■ Stop reading</button>}
   <span className="mode-chip" style={{background:tint}}>{task.subject}</span>
  </header>

  <nav className="player-steps" aria-label="Lesson phases">
   {PHASES.map((name,index)=><button key={name} type="button"
    className={index===phaseIndex?'player-step is-active':index<phaseIndex?'player-step is-done':'player-step'}
    aria-current={index===phaseIndex?'step':undefined}
    onClick={()=>update({phaseIndex:index})}>
    <span aria-hidden="true">{index<phaseIndex?'✓':index+1}</span> {name}
   </button>)}
  </nav>

  <article className="player-card card">
   <p className="eyebrow">{task.isReview?'Revision session':task.week?`Week ${task.week}`:'Lesson'} · about {task.minutes} minutes</p>
   <h1>{task.title}</h1>

   {phase==='Discover'&&<div className="player-phase">
    <p className="player-lead">{lesson?.objective??task.title}</p>
    {lesson&&<div className="player-hook" style={{background:tint}}>
     <p>{lesson.example}</p>
     <button type="button" className="audio-btn" onClick={()=>speak(`${lesson.objective}. ${lesson.example}`)}>🔊 Listen</button>
    </div>}
    {!lesson&&content.steps[0]&&<div className="player-hook" style={{background:tint}}>
     <p>{content.steps[0]}</p>
     <button type="button" className="audio-btn" onClick={()=>speak(content.steps[0])}>🔊 Listen</button>
    </div>}
   </div>}

   {phase==='Understand'&&<div className="player-phase">
    <p className="player-lead">{lesson?.prep??'Here is the idea, one step at a time.'}</p>
    {lesson&&<ul className="player-facts">
     <li><strong>Materials</strong><span>{lesson.materials}</span></li>
     <li><strong>Grown-up prep</strong><span>{lesson.prep}</span></li>
    </ul>}
    <div className="player-hook" style={{background:tint}}>
     <p>{lesson?.example??content.steps[0]??'Talk through the example together.'}</p>
     <button type="button" className="audio-btn" onClick={()=>speak(lesson?.example??content.steps[0]??'')}>🔊 Listen</button>
    </div>
   </div>}

   {phase==='Explore'&&<div className="player-phase">
    <p className="player-lead">Try it together — one step, then the next.</p>
    <ol className="player-steps-list">
     {content.steps.map((step,index)=><li key={index}>
      <span className="step-index" aria-hidden="true">{index+1}</span>
      <span>{step}</span>
      <button type="button" className="audio-btn" aria-label={`Read step ${index+1} aloud`} onClick={()=>speak(step)}>🔊</button>
     </li>)}
    </ol>
   </div>}

   {phase==='Practice'&&<div className="player-phase">
    <p className="player-lead">One question at a time. Say it out loud, then check.</p>
    <ol className="player-questions">
     {content.questions.map((question,index)=><li key={index}>
      <strong>Question {index+1}</strong>
      <p>{question}</p>
      {lesson&&<p className="player-answer-hint">Expected: {lesson.expectedAnswer}</p>}
      <div className="rating-row" role="group" aria-label={`How did ${learnerName} do on question ${index+1}?`}>
       {(['got','hint','not'] as const).map(rating=><button key={rating} type="button"
        className={savedState.ratings[`${index}`]===rating?'rating-btn is-active':'rating-btn'}
        aria-pressed={savedState.ratings[`${index}`]===rating}
        onClick={()=>update({ratings:{...savedState.ratings,[String(index)]:rating}})}>
        {rating==='got'?'😄 Got it':rating==='hint'?'🙂 Needed a hint':'🤔 Not yet'}
       </button>)}
      </div>
     </li>)}
     {!content.questions.length&&<li><p>No written questions for this one — just talk about what you noticed.</p></li>}
    </ol>
   </div>}

   {phase==='Reflect'&&<div className="player-phase">
    <p className="player-lead">{lesson?.exercise??'What is one thing you learned or noticed?'}</p>
    {lesson&&<div className="player-hook" style={{background:tint}}><p>Expected: {lesson.expectedAnswer}</p></div>}
    <label className="player-reflection">
     <span>{learnerName}&rsquo;s reflection (optional)</span>
     <textarea rows={3} value={savedState.reflection} onChange={e=>update({reflection:e.target.value})}
      placeholder="Draw it, say it, or type a sentence…"/>
    </label>
   </div>}

   {phase==='Complete'&&<div className="player-phase">
    <div className="completion-box" style={{background:tint}}>
     <span className="completion-glyph" aria-hidden="true">✦</span>
     <p>{lesson?.completionCriteria??task.check??'You finished this lesson. Nice work.'}</p>
    </div>
    {lesson&&<p className="muted"><strong>Revision note:</strong> {lesson.revision??'Come back to this in a few days.'}</p>}
    <div className="completion-actions">
     <button type="button" className="learner-continue" disabled={busy}
      onClick={()=>void record('completed','understood')}>
      {busy?'Saving…':'✓ Mark complete — understood'}
     </button>
     <button type="button" className="hero-action-secondary" disabled={busy}
      onClick={()=>void record('completed')}>
      Mark complete
     </button>
     <button type="button" className="hero-action-secondary" disabled={busy}
      onClick={()=>void record('needs_revision','not-yet')}>
      Needs another look
     </button>
    </div>
    {saved&&<p className="recorded-note" role="status">Saved to {learnerName}&rsquo;s record.</p>}
    <div className="hero-actions">
     <Link className="mode-switch" href={`/learn/path?learner=${learnerId}`}>Back to the path</Link>
     <Link className="mode-switch" href={`/learn?learner=${learnerId}`}>Learner home</Link>
    </div>
   </div>}

   <footer className="player-footer">
    <button type="button" className="hero-action-secondary" onClick={goBack} disabled={phaseIndex===0}>← Back</button>
    <button type="button" className="parent-help-btn" onClick={()=>setShowParentHelp(v=>!v)} aria-expanded={showParentHelp}>
      ❓ Ask a parent
    </button>
    {phaseIndex<PHASES.length-1
     ?<button type="button" className="hero-action-primary" onClick={goNext}>Continue →</button>
     :<span/>}
   </footer>
   {showParentHelp&&<aside className="parent-help" role="note">
    <strong>For the grown-up:</strong>
    <p>{lesson?.completionCriteria??task.check??'Guide one step at a time; let the learner answer before hinting.'}</p>
    {lesson&&<p><strong>Easier:</strong> {lesson.easier} · <strong>Harder:</strong> {lesson.harder}</p>}
    <p className="muted">Source: {task.source}</p>
   </aside>}
  </article>
 </main>;
}
