'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
type Task={id:string;title:string;subject:string;href:string;instructions:string[];check?:string};
type Slot={learnerId:string;name:string;grade:string;task:Task;minutes:number;startMinute:number;mode:string};
type Plan={date:string;budget_minutes:number;slots:Slot[];created_at:string};
type Learner={id:string;history:{id:string}[]};
const localToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function recentDates(){
 const today=new Date(localToday()+'T00:00:00Z');
 return Array.from({length:7},(_,i)=>new Date(today.getTime()-(6-i)*86400000).toISOString().slice(0,10));
}
export default function FamilyCalendar({learners}:{learners:Learner[]}){
 const [date,setDate]=useState(localToday);
 const [plan,setPlan]=useState<Plan|null>(null);
 const [budget,setBudget]=useState(60);
 const [status,setStatus]=useState('Loading saved learning plan…');
 const [working,setWorking]=useState(false);
 const dates=useMemo(()=>recentDates(),[]);
 useEffect(()=>{
  let active=true;
  async function load(){
   setWorking(true);setStatus('Checking the family calendar…');
   try{
    const response=await fetch('/api/family-calendar?date='+encodeURIComponent(date),{cache:'no-store'});
    const result=await response.json();
    if(!response.ok)throw Error(result.error??'Calendar unavailable');
    if(!active)return;
    setPlan(result.plan?{...result.plan,budget_minutes:Number(result.plan.budget_minutes)}:null);
    setStatus(result.plan?'Saved family plan. Completed lessons remain in the timeline.':'No plan recorded for this day.');
    if(result.plan)setBudget(Number(result.plan.budget_minutes));
   }catch(e){if(active){setPlan(null);setStatus(e instanceof Error?e.message:'Unable to load calendar')}}
   finally{if(active)setWorking(false)}
  }
  void load();return ()=>{active=false};
 },[date]);
 async function save(){
  if(date!==localToday())return;
  setWorking(true);setStatus('Saving today’s family plan…');
  try{
   const response=await fetch('/api/family-calendar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,budget})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error??'Could not save plan');
   setPlan({...data.plan,budget_minutes:Number(data.plan.budget_minutes)});
   setStatus('Today’s plan saved. It will remain the same when you reopen the app.');
  }catch(e){setStatus(e instanceof Error?e.message:'Unable to save plan')}
  finally{setWorking(false)}
 }
 const completed=(slot:Slot)=>learners.some(l=>l.id===slot.learnerId&&l.history.some(h=>h.id===slot.task.id));
 const used=plan?.slots.reduce((n,s)=>n+s.minutes,0)??0;
 return <section className="coach-content" aria-label="Saved family learning calendar">
  <div className="coach-day-head"><div><span className="coach-kicker">YOUR SAVED FAMILY CALENDAR</span><h3>One plan, one day at a time</h3><p>Save today’s lessons once. Yesterday’s plans remain available for reference.</p></div></div>
  <div className="coach-learner-tabs" role="group" aria-label="Last seven calendar days" style={{padding:'8px 0 16px'}}>
   {dates.map(d=><button key={d} type="button" className={'coach-learner-tab '+(date===d?'is-selected':'')} aria-pressed={date===d} onClick={()=>setDate(d)} style={{minWidth:88,justifyContent:'center'}}><span><strong>{new Date(d+'T00:00:00Z').toLocaleDateString('en-IN',{timeZone:'UTC',weekday:'short'})}</strong><small>{d.slice(8)}</small></span></button>)}
  </div>
  {plan?<div>
   <p><strong>{plan.slots.length} activities</strong> · {used} of {plan.budget_minutes} minutes planned {date===localToday()?'for today':'on this day'}</p>
   <div className="coach-task-list">{plan.slots.map((slot,i)=><article className="coach-task" key={slot.learnerId+':'+slot.task.id+':'+i}>
    <span className="coach-task-index">{String(i+1).padStart(2,'0')}</span>
    <div className="coach-task-main"><div className="coach-task-tags"><span>{slot.name}</span><span>{slot.minutes} min</span><span>{slot.mode==='play'?'Play & explore':slot.task.subject}</span>{completed(slot)&&<span>✓ Complete</span>}</div>
     <h4>{slot.task.title}</h4><small>Minute {slot.startMinute}–{slot.startMinute+slot.minutes}</small>
     <details className="coach-instructions"><summary>View lesson instructions</summary><ol>{slot.task.instructions.map((step,k)=><li key={k}>{step}</li>)}</ol>{slot.task.check&&<p><strong>Understanding check:</strong> {slot.task.check}</p>}<Link href={slot.task.href}>Open resource →</Link></details>
    </div></article>)}</div>
   <p className="coach-next-note">Plans are snapshots of what was proposed, not attendance records. Unfinished tasks remain eligible in the automatic learning queue.</p>
  </div>:<div className="coach-empty">
   {date===localToday()?<><strong>Ready to prepare today’s plan?</strong><p>The scheduler uses unfinished tasks and your shared family budget.</p><label className="coach-time-select">Family time<select value={budget} onChange={e=>setBudget(Number(e.target.value))}><option value={20}>20 minutes</option><option value={40}>40 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select></label><button type="button" className="coach-complete" style={{marginTop:12,padding:'10px 16px',borderRadius:12}} disabled={working} onClick={()=>void save()}>Save today&apos;s family plan</button></>:<p>No family plan was saved for this date.</p>}
  </div>}
  <p role="status" aria-live="polite" className="coach-feedback" style={{padding:'12px 0'}}>{status}</p>
 </section>;
}
