'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';

type Task={id:string;title:string;subject:string;minutes:number;source:string;href:string;instructions:string[];status:string};
type Overview={subject:string;total:number;completed:number};
type History={id:string;title:string;subject:string;updatedAt:string};
type Badge={id:string;name:string;description:string;symbol:string};
type Learner={id:string;name:string;grade:string;canEdit:boolean;completed:number;total:number;tasks:Task[];upcoming:{id:string;title:string;subject:string;minutes:number}[];history:History[];subjects:Overview[];earnedBadges:Badge[]};
type View='today'|'roadmap'|'history';
const palette=['#F6E5D1','#DCEFE5','#EAE4F8','#DCEAF7','#F7E3E9'];
const percent=(done:number,total:number)=>total?Math.round(done/total*100):0;

export default function AutomaticLearning(){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [selected,setSelected]=useState('');
 const [view,setView]=useState<View>('today');
 const [notice,setNotice]=useState('Preparing your learning day…');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [dailyBudget,setDailyBudget]=useState(60);
 const [error,setError]=useState(false);
 const load=useCallback(async()=>{
  try{
   const res=await fetch('/api/auto-learning',{cache:'no-store'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to load learning plan');
   setLearners(data.learners);
   setSelected(old=>data.learners.some((x:Learner)=>x.id===old)?old:(data.learners[0]?.id??''));
   setNotice(data.notice);setError(false);
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to load');setError(true)}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 const current=learners.find(x=>x.id===selected);
 const suggested=useMemo(()=>{
  if(!current)return [];
  const queue:Task[]=[];
  let total=0;
  for(const task of current.tasks){
   if(queue.length&&total+task.minutes>dailyBudget)break;
   queue.push(task);total+=task.minutes;
  }
  return queue;
 },[current,dailyBudget]);
 const suggestedMinutes=suggested.reduce((n,t)=>n+t.minutes,0);
 async function mark(learnerId:string,taskId:string,status:'completed'|'needs_revision'|'pending'){
  setBusy(taskId);setNotice('Saving progress…');
  try{
   const res=await fetch('/api/auto-learning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learnerId,taskId,status})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to save progress');
   await load();setNotice(status==='completed'?'Great work! The next activity is now ready.':status==='pending'?'Activity restored to your queue.':'Revision noted. This activity stays in the queue.');
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to save');setError(true)}
  finally{setBusy('')}
 }
 return <section className="coach-shell" aria-labelledby="coach-title">
  <div className="coach-top">
   <div><span className="coach-kicker">✦ YOUR FAMILY LEARNING COACH</span><h2 id="coach-title">Ready for a little learning?</h2>
    <p>Today&apos;s activities are already chosen. Teach, tick, and continue tomorrow.</p></div>
   <div className="coach-stat"><strong>{learners.length}</strong><span>Learners</span></div>
  </div>
  {learners.length>0&&<div className="coach-learner-tabs" role="group" aria-label="Choose learner">
   {learners.map((learner,index)=><button type="button" key={learner.id} onClick={()=>{setSelected(learner.id);setView('today')}} aria-pressed={learner.id===selected} className={'coach-learner-tab '+(learner.id===selected?'is-selected':'')}>
    <span className="coach-avatar" style={{background:palette[index%palette.length]}}>{learner.name.slice(0,1).toUpperCase()}</span>
    <span><strong>{learner.name}</strong><small>{learner.grade}</small></span>
   </button>)}
  </div>}
  {current&&<>
   <div className="coach-overview">
    <div><span className="coach-kicker">YOUR LEARNING JOURNEY</span><h3>{current.name}&apos;s learning path</h3><p>{current.completed} of {current.total} currently curated activities completed</p></div>
    <div className="coach-progress-ring" style={{background:`conic-gradient(#408C74 ${percent(current.completed,current.total)}%, #E8EAE6 0)`}} aria-label={percent(current.completed,current.total)+' percent of currently curated activities complete'}><span>{percent(current.completed,current.total)}%</span></div>
   </div>
   <div className="coach-view-tabs" role="group" aria-label="Learning views">
    {([['today','☀ Today'],['roadmap','▦ Learning roadmap'],['history','★ Achievements']] as const).map(([key,label])=><button type="button" key={key} className={view===key?'active':''} aria-pressed={view===key} onClick={()=>setView(key)}>{label}</button>)}
   </div>
   {view==='today'&&<div className="coach-content">
    <div className="coach-day-head">
     <div><span className="coach-kicker">YOUR NEXT STEPS</span><h3>Today's ready-to-teach activities</h3><p>{suggested.length} activities · approximately {suggestedMinutes} minutes</p></div>
     <label className="coach-time-select">Time available<select value={dailyBudget} onChange={e=>setDailyBudget(Number(e.target.value))}><option value={20}>20 min</option><option value={40}>40 min</option><option value={60}>60 min</option><option value={90}>90 min</option></select></label>
    </div>
    <div className="coach-task-list">
     {suggested.map((task,index)=><article key={task.id} className="coach-task">
      <span className="coach-task-index">{String(index+1).padStart(2,'0')}</span>
      <div className="coach-task-main">
       <div className="coach-task-tags"><span>{task.subject}</span><span>◷ {task.minutes} min</span>{task.status==='needs_revision'&&<span className="coach-revision">↻ Revision</span>}</div>
       <h4>{task.title}</h4><small>{task.source}</small>
       <details className="coach-instructions"><summary>Show me how to teach this</summary><ol>{task.instructions.map((step,i)=><li key={i}>{step}</li>)}</ol><Link href={task.href}>Open activity or source ↗</Link></details>
       {current.canEdit&&<div className="coach-actions"><button type="button" className="coach-complete" disabled={!!busy} onClick={()=>void mark(current.id,task.id,'completed')}>✓ Mark complete</button><button type="button" className="coach-revise" disabled={!!busy} onClick={()=>void mark(current.id,task.id,'needs_revision')}>↻ Needs revision</button></div>}
      </div>
     </article>)}
     {!suggested.length&&<div className="coach-empty"><strong>All available activities are complete!</strong><p>This is the end of the curated pilot queue for this learning stage, not proof of full annual curriculum completion.</p></div>}
    </div>
    {current.tasks.length>suggested.length&&<p className="coach-next-note">✦ {current.tasks.length-suggested.length} more queued activities are available beyond today&apos;s time budget.</p>}
   </div>}
   {view==='roadmap'&&<div className="coach-content">
    <div className="coach-day-head"><div><span className="coach-kicker">WHAT'S DONE & WHAT'S NEXT</span><h3>Curriculum coverage</h3><p>Progress across currently curated activities, not the full annual syllabus.</p></div></div>
    <div className="coach-subject-grid">{current.subjects.map((s,i)=><div key={s.subject} className="coach-subject-card"><span className="coach-subject-symbol" style={{background:palette[i%palette.length]}}>✦</span><strong>{s.subject}</strong><p>{s.completed} / {s.total} activities</p><div className="coach-bar"><span style={{width:percent(s.completed,s.total)+'%'}}/></div></div>)}</div>
    <h4 className="coach-upcoming-heading">Coming up next</h4>
    {current.upcoming.length?<ol className="coach-upcoming">{current.upcoming.map(t=><li key={t.id}><strong>{t.title}</strong><small>{t.subject} · {t.minutes} min</small></li>)}</ol>:<p>Nothing else is indexed beyond the current queue yet.</p>}
   </div>}
   {view==='history'&&<div className="coach-content">
    <div className="coach-day-head"><div><span className="coach-kicker">CELEBRATE PROGRESS</span><h3>Achievements & learning history</h3><p>Badges are based on completed curated activities. Keep going at your own pace.</p></div></div>
    <div className="coach-badges">{current.earnedBadges.length?current.earnedBadges.map(b=><div key={b.id} className="coach-badge"><span>{b.symbol}</span><strong>{b.name}</strong><small>{b.description}</small></div>):<div className="coach-empty">Your first badge unlocks after one completed activity.</div>}</div>
    <h4 className="coach-upcoming-heading">Recently completed</h4>
    {current.history.length?<ul className="coach-history">{current.history.map(h=><li key={h.id}><span>✓</span><div><strong>{h.title}</strong><small>{h.subject}</small></div>{current.canEdit&&<button type="button" disabled={!!busy} onClick={()=>void mark(current.id,h.id,'pending')}>Undo</button>}</li>)}</ul>:<p>No completed activities recorded yet.</p>}
   </div>}
  </>}
  {!loading&&!learners.length&&!error&&<div className="coach-empty">Add a learner below to generate their learning path.</div>}
  {loading&&<p className="coach-empty">Preparing your learner activities…</p>}
  <p className={'coach-feedback '+(error?'is-error':'')} role="status" aria-live="polite">{notice}</p>
 </section>;
}
