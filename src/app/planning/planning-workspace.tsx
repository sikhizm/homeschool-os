'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { academicYear, addDays, daysInWeek, mondayOf, yearDates } from '@/lib/planning/periods';
type Learner={id:string;name:string;stage:string};
type Period={id:string;kind:'year'|'week';start_date:string;end_date:string;title:string;focus:string;notes:string};
type Day={date:string;activities:number;minutes:number;completed_minutes:number};
type PlanningData={year:{startDate:string;endDate:string};week:string[];periods:Period[];days:Day[]};
type Props={learners:Learner[];canEdit:boolean;initialDate:string};
const display=(date:string)=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
export default function PlanningWorkspace({learners,canEdit,initialDate}:Props){
 const [learnerId,setLearnerId]=useState(learners[0]?.id??'');
 const [date,setDate]=useState(initialDate);
 const [data,setData]=useState<PlanningData|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [revision,setRevision]=useState(0);
 const selected=learners.find(l=>l.id===learnerId);
 const y=academicYear(date);
 const weekStart=mondayOf(date);
 const yearRange=yearDates(y);
 const weekRange=daysInWeek(date);
 const yearPlan=data?.periods.find(p=>p.kind==='year'&&p.start_date===yearRange.startDate);
 const weekPlan=data?.periods.find(p=>p.kind==='week'&&p.start_date===weekStart);
 const endpoint='/api/planning';
 const load=useCallback(async(signal?:AbortSignal)=>{
  if(!learnerId)return null;
  const params=new URLSearchParams({learnerId,date});
  const response=await fetch(endpoint+'?'+params.toString(),{cache:'no-store',signal});
  const json=await response.json();
  if(!response.ok)throw new Error(json.error||'Unable to open planning records.');
  return json as PlanningData;
 },[learnerId,date]);
 useEffect(()=>{
  if(!learnerId)return;
  const controller=new AbortController();
  setLoading(true);setError('');
  load(controller.signal).then(result=>{if(!controller.signal.aborted)setData(result);})
  .catch(e=>{if(!controller.signal.aborted){setData(null);setError(e instanceof Error?e.message:'Unable to load plans.');}})
  .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[load]);
 async function save(event:FormEvent<HTMLFormElement>,kind:'year'|'week'){
  event.preventDefault();
  if(!canEdit||busy||!learnerId)return;
  const form=event.currentTarget;const fields=new FormData(form);
  setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    learnerId,kind,anchor:date,title:String(fields.get('title')??''),focus:String(fields.get('focus')??''),notes:String(fields.get('notes')??'')
   })});
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||'Unable to save plan.');
   setData(await load());
   setRevision(v=>v+1);
   setNotice(kind==='year'?'Academic-year plan saved.':'Weekly focus saved.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to save.');}
  finally{setBusy(false);}
 }
 if(!learners.length)return <section className="workspace-panel"><h2>No learner yet</h2><p>Add a learner in the private Dashboard to begin planning.</p><Link href="/dashboard">Open Dashboard →</Link></section>;
 const daily=new Map(data?.days.map(day=>[day.date,day])??[]);
 const weekMinutes=weekRange.reduce((n,day)=>n+(daily.get(day)?.minutes??0),0);
 const completedMinutes=weekRange.reduce((n,day)=>n+(daily.get(day)?.completed_minutes??0),0);
 return <div className="learning-workspace">
  <section className="workspace-panel">
   <h2>Choose learner and week</h2>
   <div className="form-grid">
    <label className="workspace-field"><span>Learner</span><select value={learnerId} onChange={event=>{setLearnerId(event.target.value);setNotice('');}}>{learners.map(l=><option key={l.id} value={l.id}>{l.name} · {l.stage}</option>)}</select></label>
    <label className="workspace-field"><span>Planning date</span><input type="date" min="2020-01-01" max="2099-12-31" value={date} onChange={event=>{if(event.target.value)setDate(event.target.value);}} /></label>
   </div>
   <div className="row" style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:16}}>
    <button type="button" onClick={()=>setDate(addDays(date,-7))} disabled={date<'2020-01-08'}>← Previous week</button>
    <button type="button" onClick={()=>setDate(initialDate)}>Current week</button>
    <button type="button" onClick={()=>setDate(addDays(date,7))} disabled={date>'2099-12-24'}>Next week →</button>
   </div>
   {selected&&<p className="muted">Planning for {selected.name}. Calendar dates use your chosen date, and all records are private to your family.</p>}
  </section>
  <div role="status" aria-live="polite">{loading?'Loading planning records…':notice}</div>
  {error&&<p role="alert" className="error-banner">{error}</p>}
  {!canEdit&&<p className="info-banner">Family members can view planning; only the family owner can edit.</p>}
  {data&&!loading&&<>
   <div className="subject-grid">
    <section className="workspace-panel">
     <span className="eyebrow">ANNUAL DIRECTION</span>
     <h2>Academic year {y}–{y+1}</h2>
     <p className="muted">{display(yearRange.startDate)} {y} to {display(yearRange.endDate)} {y+1}. A flexible outline, not an automatic syllabus.</p>
     {canEdit?<form key={'year:'+learnerId+':'+y+':'+revision} onSubmit={event=>void save(event,'year')}>
      <fieldset disabled={busy}>
       <label className="workspace-field"><span>Year theme</span><input name="title" defaultValue={yearPlan?.title??'Learning, curiosity and confidence'} maxLength={120} required/></label>
       <label className="workspace-field"><span>Learning priorities</span><textarea name="focus" rows={5} maxLength={1500} defaultValue={yearPlan?.focus??''} placeholder="Literacy foundations, practical maths, exploration, language and Sikh heritage…"/></label>
       <label className="workspace-field"><span>Resources and adjustments</span><textarea name="notes" rows={3} maxLength={1500} defaultValue={yearPlan?.notes??''}/></label>
       <button type="submit">{yearPlan?'Update year plan':'Save year plan'}</button>
      </fieldset>
     </form>:yearPlan?<><h3>{yearPlan.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{yearPlan.focus}</p><p>{yearPlan.notes}</p></>:<p>No year plan recorded.</p>}
    </section>
    <section className="workspace-panel">
     <span className="eyebrow">THIS WEEK’S PRIORITIES</span>
     <h2>{display(weekRange[0])} – {display(weekRange[6])}</h2>
     <p className="muted">Keep weekly intentions achievable and use the daily planner for individual activities.</p>
     {canEdit?<form key={'week:'+learnerId+':'+weekStart+':'+revision} onSubmit={event=>void save(event,'week')}>
      <fieldset disabled={busy}>
       <label className="workspace-field"><span>Weekly theme</span><input name="title" maxLength={120} required defaultValue={weekPlan?.title??'Our learning focus'}/></label>
       <label className="workspace-field"><span>Weekly priorities</span><textarea name="focus" rows={5} maxLength={1500} defaultValue={weekPlan?.focus??''} placeholder="Choose one or two competencies to practise this week…"/></label>
       <label className="workspace-field"><span>Adaptations and supplies</span><textarea name="notes" rows={3} maxLength={1500} defaultValue={weekPlan?.notes??''}/></label>
       <button type="submit">{weekPlan?'Update weekly plan':'Save weekly plan'}</button>
      </fieldset>
     </form>:weekPlan?<><h3>{weekPlan.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{weekPlan.focus}</p><p>{weekPlan.notes}</p></>:<p>No weekly focus recorded.</p>}
    </section>
   </div>
   <section className="workspace-panel">
    <div className="panel-heading"><div><span className="eyebrow">SEVEN-DAY OVERVIEW</span><h2>From intentions to daily learning</h2></div><span className="pill">{completedMinutes} / {weekMinutes} min completed</span></div>
    <p className="muted">The daily totals below are recorded activities, not inferred achievements. The family’s approximate 60-minute adult-guided rhythm can include shared time across learners.</p>
    <div className="subject-grid">
     {weekRange.map(day=>{
      const summary=daily.get(day);
      const dayName=new Intl.DateTimeFormat('en-IN',{weekday:'short',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));
      return <article className="card" key={day}>
       <span className="eyebrow">{dayName} · {display(day)}</span>
       <h3>{summary?.activities??0} activities</h3>
       <p>{summary?.minutes??0} minutes planned</p>
       <p>{summary?.completed_minutes??0} minutes completed</p>
       <Link href={'/dashboard?date='+encodeURIComponent(day)}>Open daily planner →</Link>
      </article>;
     })}
    </div>
   </section>
   <section className="workspace-panel"><h2>Connect this plan to your curriculum</h2><p>The annual and weekly notes help organise intentions. The <Link href="/curriculum">curriculum catalogue</Link> suggests competencies you can review and add as learner goals. Select a date above to create or adjust daily activities; these plans never mark a goal mastered automatically.</p></section>
  </>}
 </div>;
}
