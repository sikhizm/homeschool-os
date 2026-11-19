'use client';
import {useCallback,useEffect,useState} from 'react';
import WeeklyLearnerLessons from './weekly-learner-lessons';
import type {AnnualCoverage} from '@/lib/curriculum/annual';

type RecallTask={id:string;title:string;check?:string};
type History={id:string;title:string;subject:string;updatedAt:string};
type Badge={id:string;name:string;description:string;symbol:string;kind:'participation'|'mastery'};
type Learner={id:string;name:string;grade:string;canEdit:boolean;completed:number;total:number;tasks:RecallTask[];
 upcoming:{id:string;title:string;subject:string;minutes:number}[];history:History[];earnedBadges:Badge[];
 annual:AnnualCoverage|null;assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};understood:string[];mastered:string[]};
type View='today'|'roadmap'|'history';
const palette=['#F6E5D1','#DCEFE5','#EAE4F8','#DCEAF7','#F7E3E9'];
const percent=(done:number,total:number)=>total?Math.round(done/total*100):0;
export default function AutomaticLearning(){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [selected,setSelected]=useState('');
 const [view,setView]=useState<View>('today');
 const [notice,setNotice]=useState('Loading learner progress…');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [recall,setRecall]=useState('');
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
 useEffect(()=>{const handle=setTimeout(()=>{void load()},0);return ()=>clearTimeout(handle)},[load]);
 const current=learners.find(x=>x.id===selected);
 async function mark(learnerId:string,taskId:string,status:'completed'|'needs_revision'|'pending',assessment?:'understood'|'not-yet',recallQuality?:'independent'|'with_hint'|'not_yet'){
  setBusy(taskId);setNotice('Saving progress…');
  try{
   const res=await fetch('/api/auto-learning',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({learnerId,taskId,status,...(assessment?{assessment}:{}),...(recallQuality?{recallQuality}:{})})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to save progress');
   await load();
   setNotice(data.message??(status==='completed'?'Great work! The next activity is now ready.':status==='pending'?'Activity restored to your queue.':'Revision noted. This activity stays in the queue.'));
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to save');setError(true)}
  finally{setBusy('')}
 }
 return <section className="coach-shell" aria-labelledby="coach-title">
  <div className="coach-top">
   <div><span className="coach-kicker">✦ YOUR FAMILY LEARNING COACH</span><h2 id="coach-title">Ready for a little learning?</h2>
    <p>See each learner’s weekly chapters and progress.</p></div>
   <div className="coach-stat"><strong>{learners.length}</strong><span>Learners</span></div>
  </div>
  {learners.length>0&&<div className="coach-learner-tabs" role="group" aria-label="Choose learner">
   {learners.map((learner,index)=><button type="button" key={learner.id} onClick={()=>{setSelected(learner.id);setView('today');setRecall('')}} aria-pressed={learner.id===selected} className={'coach-learner-tab '+(learner.id===selected?'is-selected':'')}>
    <span className="coach-avatar" style={{background:palette[index%palette.length]}}>{learner.name.slice(0,1).toUpperCase()}</span>
    <span><strong>{learner.name}</strong><small>{learner.grade}</small></span>
   </button>)}
  </div>}
  {current&&<>
   <div className="coach-overview">
    <div><span className="coach-kicker">YOUR LEARNING JOURNEY</span><h3>{current.name}&apos;s learning path</h3>
     <p>{current.annual?`Week ${current.annual.currentWeek??'—'} of ${current.annual.weeks} in the annual pathway · ${current.annual.completedSteps} of ${current.annual.totalSteps} steps recorded`:`${current.completed} of ${current.total} curated activities recorded`}</p></div>
    <div className="coach-progress-ring" style={{background:`conic-gradient(#408C74 ${current.annual?.percent??percent(current.completed,current.total)}%, #E8EAE6 0)`}} aria-label={(current.annual?.percent??percent(current.completed,current.total))+' percent of annual pathway steps recorded'}><span>{current.annual?.percent??percent(current.completed,current.total)}%</span></div>
   </div>
   <div className="coach-view-tabs" role="group" aria-label="Learning views">
    {([['today','☀ Learner lessons'],['roadmap','▦ Annual coverage'],['history','★ Achievements']] as const).map(([key,label])=><button type="button" key={key} className={view===key?'active':''} aria-pressed={view===key} onClick={()=>setView(key)}>{label}</button>)}
   </div>
   {view==='today'&&<WeeklyLearnerLessons key={current.id} learnerId={current.id} canEdit={current.canEdit}/>}
   {view==='roadmap'&&<div className="coach-content">
    <div className="coach-day-head"><div><span className="coach-kicker">THE WHOLE YEAR, HONESTLY TRACKED</span><h3>Annual pathway coverage</h3>
     <p>36 teaching weeks in 3 terms. Progress is recorded steps, not a claim of exam readiness.</p></div></div>
    {current.annual?<>
     <div className="coach-subject-grid">{current.annual.terms.map(term=><div key={term.term} className="coach-subject-card">
      <span className="coach-subject-symbol" style={{background:palette[term.term-1]}}>{term.earned?'✦':'○'}</span>
      <strong>{['','Term 1 · Weeks 1–12','Term 2 · Weeks 13–24','Term 3 · Weeks 25–36'][term.term]}</strong>
      <p>{term.completed} / {term.steps} steps · {term.percent}%</p><div className="coach-bar"><span style={{width:term.percent+'%'}}/></div>
      <p className="coach-milestone">Milestone: {term.milestone}</p>
     </div>)}</div>
     <h4 className="coach-upcoming-heading">Subjects across the year</h4>
     <div className="coach-subject-grid">{current.annual.subjects.map((subject,i)=><div key={subject.subject} className="coach-subject-card">
      <span className="coach-subject-symbol" style={{background:palette[i%palette.length]}}>✦</span>
      <strong>{subject.subject}</strong><p>{subject.completed} / {subject.steps} steps</p>
      <div className="coach-bar"><span style={{width:subject.percent+'%'}}/></div>
     </div>)}</div>
     <p className="coach-next-note">✦ {current.annual.milestonesEarned} of 3 term milestones reached · {current.annual.guidedMinutes + current.annual.independentMinutes} minutes of planned activities across the year ({current.annual.guidedMinutes} parent-led, {current.annual.independentMinutes} play or independent).</p>
    </>:<div className="coach-empty">This learning stage does not yet have a full annual pathway. It uses the original activity library.</div>}
    <h4 className="coach-upcoming-heading">Coming up next</h4>
    {current.upcoming.length?<ol className="coach-upcoming">{current.upcoming.map(t=><li key={t.id}><strong>{t.title}</strong><small>{t.subject} · {t.minutes} min</small></li>)}</ol>:<p>Nothing else is indexed beyond the current queue yet.</p>}
   </div>}
   {view==='history'&&<div className="coach-content">
    <div className="coach-day-head"><div><span className="coach-kicker">CELEBRATE PROGRESS</span><h3>Achievements & learning history</h3>
     <p>Joining in, showing understanding and demonstrating lasting mastery are three different things.</p></div></div>
    <div className="coach-subject-grid">
     <div className="coach-subject-card"><strong>{current.assessment.completed}</strong><p>Activities participated in</p></div>
     <div className="coach-subject-card"><strong>{current.assessment.understood}</strong><p>Understanding checks passed</p></div>
     <div className="coach-subject-card"><strong>{current.assessment.mastered}</strong><p>Mastery shown after delayed recall</p></div>
     <div className="coach-subject-card"><strong>{current.assessment.independentRecall}</strong><p>Independent recalls</p></div>
     <div className="coach-subject-card"><strong>{current.assessment.recallWithHint}</strong><p>Recalls with a hint</p></div>
    </div>
    <h4 className="coach-upcoming-heading">Mastery badges</h4>
    <p className="coach-next-note">A mastery badge needs an understanding check plus a successful later independent recall. It is never awarded for a completion click. Review spacing adapts: independent recall usually waits 10 days, recall with a hint returns in 4 days, and a not-yet-secure idea stays in the revision queue.</p>
    <div className="coach-badges">{current.earnedBadges.filter(b=>b.kind==='mastery').length
     ?current.earnedBadges.filter(b=>b.kind==='mastery').map(b=><div key={b.id} className="coach-badge is-mastery"><span>{b.symbol}</span><strong>{b.name}</strong><small>{b.description}</small></div>)
     :<div className="coach-empty">No mastery badges yet. Check understanding when teaching, then complete a later recall session.</div>}</div>
    {current.canEdit && current.tasks.filter(task=>/^review:[1-5]:/.test(task.id)).map(task=>
     <div className="lesson-check" key={task.id}>
      <h4>{task.title}</h4>
      {recall===task.id?<><p>{task.check}</p><div className="coach-actions">
       {([['Remembered independently','independent','completed'],['Remembered with a hint','with_hint','completed'],['Not yet — revisit gently','not_yet','needs_revision']] as const).map(([label,quality,status])=>
        <button type="button" className="btn-secondary" key={quality} disabled={!!busy} onClick={()=>{setRecall('');void mark(current.id,task.id,status,undefined,quality)}}>{label}</button>)}
      </div><button type="button" className="btn-secondary" onClick={()=>setRecall('')}>Close</button></>
      :<button type="button" className="coach-revise" disabled={!!busy} onClick={()=>setRecall(task.id)}>Record recall result</button>}
     </div>)}
    <h4 className="coach-upcoming-heading">Participation badges</h4>
    <div className="coach-badges">{current.earnedBadges.filter(b=>b.kind==='participation').length
     ?current.earnedBadges.filter(b=>b.kind==='participation').map(b=><div key={b.id} className="coach-badge"><span>{b.symbol}</span><strong>{b.name}</strong><small>{b.description}</small></div>)
     :<div className="coach-empty">Your first participation badge unlocks after one completed activity.</div>}</div>
    <h4 className="coach-upcoming-heading">Recently completed</h4>
    {current.history.length?<ul className="coach-history">{current.history.map(h=><li key={h.id}><span>✓</span><div><strong>{h.title}</strong><small>{h.subject}</small></div>{current.canEdit&&<button type="button" disabled={!!busy} onClick={()=>void mark(current.id,h.id,'pending')}>Undo</button>}</li>)}</ul>:<p>No completed activities recorded yet.</p>}
   </div>}
  </>}
  {!loading&&!learners.length&&!error&&<div className="coach-empty">Add a learner below to generate their learning path.</div>}
  {loading&&<p className="coach-empty">Preparing your learner activities…</p>}
  <p className={'coach-feedback '+(error?'is-error':'')} role="status" aria-live="polite">{notice}</p>
 </section>;
}
