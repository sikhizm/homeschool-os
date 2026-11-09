'use client';
import Link from 'next/link';
import FamilyCalendar from './family-calendar';
import FamilyWeek from './family-week';
import LessonCard from './lesson-card';
import {useCallback,useEffect,useMemo,useState} from 'react';
import type {TeachingLesson,AnnualCoverage} from '@/lib/curriculum/annual';

type Task={id:string;title:string;subject:string;minutes:number;source:string;href:string;instructions:string[];status:string;check?:string;
 lesson?:TeachingLesson;week?:number;term?:1|2|3;mode?:'guided'|'play'|'independent';officialUrl?:string|null;milestone?:string|null};
type Overview={subject:string;total:number;completed:number};
type History={id:string;title:string;subject:string;updatedAt:string};
type Badge={id:string;name:string;description:string;symbol:string;kind:'participation'|'mastery'};
type Learner={id:string;name:string;grade:string;canEdit:boolean;completed:number;total:number;tasks:Task[];
 upcoming:{id:string;title:string;subject:string;minutes:number}[];history:History[];subjects:Overview[];earnedBadges:Badge[];
 annual:AnnualCoverage|null;assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};understood:string[];mastered:string[]};
type Slot={learnerId:string;name:string;grade:string;task:Task;minutes:number;startMinute:number;mode:'guided'|'play'|'independent'};
type Separate={learnerId:string;name:string;grade:string;task:Task};
type FamilyPlan={budget:number;allocated:number;unallocated:number;notes:string[];slots:Slot[];separate:Separate[]};
type View='family'|'today'|'roadmap'|'history';
const palette=['#F6E5D1','#DCEFE5','#EAE4F8','#DCEAF7','#F7E3E9'];
const percent=(done:number,total:number)=>total?Math.round(done/total*100):0;
const modeLabel=(mode?:string)=>mode==='independent'?'Independent practice':mode==='play'?'Play together · parent nearby':'Parent-led';

function TaskActions({task,learnerId,canEdit,checking,setChecking,onMark,busy}:{
 task:Task;learnerId:string;canEdit:boolean;checking:string;setChecking:(value:string)=>void;
 onMark:(learnerId:string,taskId:string,status:'completed'|'needs_revision'|'pending',assessment?:'understood'|'not-yet',recallQuality?:'independent'|'with_hint'|'not_yet')=>void;busy:string;
}){
 if(!canEdit)return null;
 const prompt=task.check??task.lesson?.completionCriteria??'Ask the child to explain or demonstrate what they learned without looking at the answer.';
 const isRecall=/^review:[1-5]:/.test(task.id);
 if(checking===task.id)return <div className="lesson-check">
  {isRecall?<><strong>How did recall go?</strong>
   <p>Ask without showing the lesson first. Record what you actually observed; the next review date will adapt to this answer.</p>
   <p>{prompt}</p>
   <div className="coach-actions">
    <button type="button" className="coach-complete" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'completed',undefined,'independent')}}>Remembered independently ✓</button>
    <button type="button" className="coach-revise" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'completed',undefined,'with_hint')}}>Remembered with a hint</button>
    <button type="button" className="coach-revise" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'needs_revision',undefined,'not_yet')}}>Not yet — revisit gently ↻</button>
    <button type="button" disabled={!!busy} onClick={()=>setChecking('')}>Cancel</button>
   </div>
  </>:<>
   <strong>Parent understanding check</strong>
   <p>{prompt}</p>
   {task.lesson?.expectedAnswer&&<p className="lesson-check-answer"><em>Expected answer guidance:</em> {task.lesson.expectedAnswer}</p>}
   <p>Was your child able to show understanding without help? Only a “yes” records assessed understanding.</p>
   <div className="coach-actions">
    <button type="button" className="coach-complete" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'completed','understood')}}>Yes, understood ✓</button>
    <button type="button" className="coach-revise" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'needs_revision','not-yet')}}>Needs more practice ↻</button>
    <button type="button" disabled={!!busy} onClick={()=>{setChecking('');onMark(learnerId,task.id,'completed')}}>Done, not assessed</button>
    <button type="button" disabled={!!busy} onClick={()=>setChecking('')}>Cancel</button>
   </div>
  </>}
 </div>;
 return <div className="coach-actions">
  <button type="button" className="coach-revise" disabled={!!busy} onClick={()=>setChecking(task.id)}>{isRecall?'↻ Record recall result':'✓ Check understanding & record'}</button>
 </div>;
}
export default function AutomaticLearning(){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [selected,setSelected]=useState('');
 const [view,setView]=useState<View>('family');
 const [notice,setNotice]=useState('Preparing your family learning day…');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [checking,setChecking]=useState('');
 const [dailyBudget,setDailyBudget]=useState(60);
 const [familyPlan,setFamilyPlan]=useState<FamilyPlan|null>(null);
 const [error,setError]=useState(false);
 const load=useCallback(async(budget:number)=>{
  try{
   const res=await fetch('/api/auto-learning?budget='+budget,{cache:'no-store'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to load learning plan');
   setLearners(data.learners);
   setFamilyPlan(data.familyPlan??null);
   setSelected(old=>data.learners.some((x:Learner)=>x.id===old)?old:(data.learners[0]?.id??''));
   setNotice(data.notice);setError(false);
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to load');setError(true)}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{const handle=setTimeout(()=>{void load(dailyBudget)},0);return ()=>clearTimeout(handle)},[load,dailyBudget]);
 const current=learners.find(x=>x.id===selected);
 const mySlots=useMemo(()=>familyPlan?.slots.filter(slot=>slot.learnerId===selected)??[],[familyPlan,selected]);
 const mySeparate=useMemo(()=>familyPlan?.separate.filter(entry=>entry.learnerId===selected)??[],[familyPlan,selected]);
 async function mark(learnerId:string,taskId:string,status:'completed'|'needs_revision'|'pending',assessment?:'understood'|'not-yet',recallQuality?:'independent'|'with_hint'|'not_yet'){
  setBusy(taskId);setNotice('Saving progress…');
  try{
   const res=await fetch('/api/auto-learning',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({learnerId,taskId,status,...(assessment?{assessment}:{}),...(recallQuality?{recallQuality}:{})})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to save progress');
   await load(dailyBudget);
   setNotice(data.message??(status==='completed'?'Great work! The next activity is now ready.':status==='pending'?'Activity restored to your queue.':'Revision noted. This activity stays in the queue.'));
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to save');setError(true)}
  finally{setBusy('')}
 }
 function renderTask(task:Task,learnerId:string,canEdit:boolean,index:number,extra?:string){
  const mastered=learners.find(l=>l.id===learnerId)?.mastered.includes(task.id);
  const understood=learners.find(l=>l.id===learnerId)?.understood.includes(task.id);
  return <article key={task.id+index} className="coach-task">
   <span className="coach-task-index">{String(index+1).padStart(2,'0')}</span>
   <div className="coach-task-main">
    <div className="coach-task-tags"><span>{task.subject}</span><span>◷ {task.minutes} min</span>
     <span>{modeLabel(task.mode)}</span>
     {task.week&&<span>Week {task.week} · Term {task.term}</span>}
     {task.status==='needs_revision'&&<span className="coach-revision">↻ Revision</span>}
     {mastered&&<span className="coach-mastery">✦ Mastery shown</span>}
     {!mastered&&understood&&<span className="coach-understood">✦ Understanding shown</span>}
    </div>
    <h4>{task.title}</h4><small>{task.source}</small>
    {extra&&<small>{extra}</small>}
    {task.lesson?<LessonCard lesson={task.lesson} href={task.href} officialUrl={task.officialUrl}/>
     :<details className="coach-instructions"><summary>Show me how to teach this</summary><ol>{(task.instructions??[]).map((step,i)=><li key={i}>{step}</li>)}</ol><Link href={task.href}>Open activity or source ↗</Link></details>}
    <TaskActions task={task} learnerId={learnerId} canEdit={canEdit} checking={checking} setChecking={setChecking} onMark={mark} busy={busy}/>
   </div>
  </article>;
 }
 return <section className="coach-shell" aria-labelledby="coach-title">
  <div className="coach-top">
   <div><span className="coach-kicker">✦ YOUR FAMILY LEARNING COACH</span><h2 id="coach-title">Ready for a little learning?</h2>
    <p>Today&apos;s lessons are chosen, written out and fitted into one shared family budget.</p></div>
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
    <div><span className="coach-kicker">YOUR LEARNING JOURNEY</span><h3>{current.name}&apos;s learning path</h3>
     <p>{current.annual?`Week ${current.annual.currentWeek??'—'} of ${current.annual.weeks} in the annual pathway · ${current.annual.completedSteps} of ${current.annual.totalSteps} steps recorded`:`${current.completed} of ${current.total} curated activities recorded`}</p></div>
    <div className="coach-progress-ring" style={{background:`conic-gradient(#408C74 ${current.annual?.percent??percent(current.completed,current.total)}%, #E8EAE6 0)`}} aria-label={(current.annual?.percent??percent(current.completed,current.total))+' percent of annual pathway steps recorded'}><span>{current.annual?.percent??percent(current.completed,current.total)}%</span></div>
   </div>
   <div className="coach-view-tabs" role="group" aria-label="Learning views">
    {([['family','⌂ Family day'],['today','☀ Learner lessons'],['roadmap','▦ Annual coverage'],['history','★ Achievements']] as const).map(([key,label])=><button type="button" key={key} className={view===key?'active':''} aria-pressed={view===key} onClick={()=>setView(key)}>{label}</button>)}
   </div>
   {view==='family'&&<div className="coach-content">
    <div className="coach-day-head">
     <div><span className="coach-kicker">ONE PLAN · ONE SHARED BUDGET</span><h3>Today, already prepared</h3>
      <p>{familyPlan?`${familyPlan.slots.length} shared activities · ${familyPlan.allocated} of ${familyPlan.budget} minutes across the whole family`:'Preparing your day…'}</p></div>
     <label className="coach-time-select">Family teaching time<select value={dailyBudget} onChange={e=>setDailyBudget(Number(e.target.value))}>
      <option value={20}>20 min</option><option value={40}>40 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
     </select></label>
    </div>
    {familyPlan&&<p className="coach-budget-note">This is one budget for all children, not 60 minutes each. Open a lesson below for the full teaching script.</p>}
    <div className="coach-task-list">
     {familyPlan?.slots.map((slot,index)=>renderTask(slot.task,slot.learnerId,learners.find(l=>l.id===slot.learnerId)?.canEdit??false,index,`${slot.name} · minute ${slot.startMinute}–${slot.startMinute+slot.minutes}`))}
     {!loading&&familyPlan&&!familyPlan.slots.length&&<div className="coach-empty"><strong>No shared activities fit today&apos;s budget.</strong><p>Try a larger family budget, or use the independent suggestions below.</p></div>}
    </div>
    {familyPlan&&familyPlan.separate.length>0&&<div className="coach-separate">
     <h4 className="coach-upcoming-heading">Separate from the teaching budget</h4>
     <p className="coach-next-note">Responsive infant interaction and independent practice do not use shared parent-led teaching minutes.</p>
     <div className="coach-task-list">{familyPlan.separate.map((entry,index)=>renderTask(entry.task,entry.learnerId,learners.find(l=>l.id===entry.learnerId)?.canEdit??false,index,`${entry.name} · ${modeLabel(entry.task.mode)}`))}</div>
    </div>}
    {familyPlan?.notes.map((note,index)=><p className="coach-next-note" key={index}>✦ {note}</p>)}
    <details className="coach-archive"><summary>Saved daily plan & seven-day overview</summary>
     <FamilyCalendar learners={learners.map(l=>({id:l.id,history:l.history}))}/>
     <FamilyWeek/>
    </details>
   </div>}
   {view==='today'&&<div className="coach-content">
    <div className="coach-day-head"><div><span className="coach-kicker">YOUR NEXT STEPS</span><h3>{current.name}&apos;s part of today&apos;s plan</h3>
     <p>{mySlots.length} shared activities · {mySlots.reduce((n,s)=>n+s.minutes,0)} minutes from the family budget</p></div></div>
    <div className="coach-task-list">
     {mySlots.map((slot,index)=>renderTask(slot.task,slot.learnerId,current.canEdit,index,`minute ${slot.startMinute}–${slot.startMinute+slot.minutes}`))}
     {mySeparate.map((entry,index)=>renderTask(entry.task,entry.learnerId,current.canEdit,mySlots.length+index,`Separate · ${modeLabel(entry.task.mode)}`))}
     {!mySlots.length&&!mySeparate.length&&<div className="coach-empty"><strong>Nothing assigned in today&apos;s shared budget.</strong><p>Other learners are using the available time. Increase the family budget or open the Family day view to see the whole plan.</p></div>}
    </div>
    {current.tasks.length>mySlots.length&&<p className="coach-next-note">✦ {current.tasks.length-mySlots.length} more activities are queued beyond today&apos;s shared time budget.</p>}
   </div>}
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
