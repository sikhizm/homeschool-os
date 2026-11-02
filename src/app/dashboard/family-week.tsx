'use client';
import {useEffect,useState} from 'react';
type Item={learnerId:string;name:string;title:string;subject:string;minutes:number;status:'completed'|'revision'|'unfinished'};
type Day={date:string;budget:number;items:Item[]};
type Result={today:string;days:Day[];meaning:string};
const dates=(today:string)=>{const base=new Date(today+'T00:00:00Z').getTime();return Array.from({length:7},(_,i)=>new Date(base-(6-i)*86400000).toISOString().slice(0,10))};
export default function FamilyWeek(){
 const [data,setData]=useState<Result|null>(null);
 const [error,setError]=useState('');
 const [selected,setSelected]=useState('');
 const [busy,setBusy]=useState(false);
 async function reload(){
  setBusy(true);
  try{
   const r=await fetch('/api/family-week',{cache:'no-store'});
   const body=await r.json();
   if(!r.ok)throw Error(body.error||'Weekly overview unavailable');
   setData(body);setSelected(old=>old||body.today);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Unable to load weekly overview')}
  finally{setBusy(false)}
 }
 useEffect(()=>{void reload()},[]);
 const days=data?dates(data.today):[];
 const current=data?.days.find(x=>x.date===selected);
 const all=data?.days.flatMap(x=>x.items)||[];
 const total=all.length;
 const completed=all.filter(x=>x.status==='completed').length;
 const revisit=all.filter(x=>x.status==='revision').length;
 const learners=[...new Set(all.map(x=>x.name))];
 return <section className="workspace-panel" aria-label="Seven-day family learning overview">
  <div className="coach-day-head"><div><span className="coach-kicker">FAMILY LEARNING · LAST 7 DAYS</span><h3>Your week at a glance</h3><p>See what was saved, what is complete and what needs another look.</p></div><button type="button" className="coach-revise" onClick={()=>void reload()} disabled={busy}>{busy?'Refreshing…':'Refresh progress'}</button></div>
  {error&&<p role="alert" className="error-banner">{error}</p>}
  {data&&<>
   <div className="coach-subject-grid">
    <div className="coach-subject-card"><strong>{completed} / {total}</strong><p>Saved activities currently complete</p></div>
    <div className="coach-subject-card"><strong>{revisit}</strong><p>Marked for revision</p></div>
    <div className="coach-subject-card"><strong>{data.days.length} / 7</strong><p>Days with a saved plan</p></div>
   </div>
   <div className="coach-learner-tabs" role="group" aria-label="Choose a day of this week" style={{padding:'14px 0'}}>
    {days.map(date=>{
     const item=data.days.find(x=>x.date===date);
     const day=new Date(date+'T00:00:00Z');
     return <button key={date} type="button" aria-pressed={date===selected} className={'coach-learner-tab '+(date===selected?'is-selected':'')} onClick={()=>setSelected(date)} style={{minWidth:75,justifyContent:'center'}}>
      <span><strong>{day.toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'})}</strong><small>{day.getUTCDate()} · {item?item.items.length+' planned':'Not saved'}</small></span>
     </button>;
    })}
   </div>
   {current?<div>
    <p><strong>{current.items.length} activities</strong> · {current.items.reduce((n,x)=>n+x.minutes,0)} of {current.budget} planned minutes</p>
    <div className="coach-task-list">{current.items.map((x,i)=><article key={x.learnerId+':'+i} className="coach-task">
     <span className="coach-task-index">{String(i+1).padStart(2,'0')}</span><div className="coach-task-main">
     <div className="coach-task-tags"><span>{x.name}</span><span>{x.subject}</span><span>{x.minutes} min</span><span>{x.status==='completed'?'✓ Completed':x.status==='revision'?'↻ Revision':'○ Unfinished'}</span></div>
     <h4>{x.title}</h4></div></article>)}</div>
   </div>:<div className="coach-empty"><p>No plan was saved on this day. This does not mean that no learning took place.</p></div>}
   {learners.length>0&&<p className="coach-next-note">Learners represented in saved plans: {learners.join(', ')}.</p>}
   <p className="coach-next-note">{data.meaning}</p>
  </>}
 </section>;
}
