'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { evidenceKinds, observationLevels, portfolioSummary, type PortfolioEntry, type EvidenceKind, type ObservationLevel } from '@/lib/portfolio/model';
type Learner={id:string;name:string;stage:string};
type Props={learners:Learner[];canEdit:boolean;today:string};
const labels:Record<EvidenceKind,string>={baseline:'Baseline snapshot',observation:'Learning observation',work_sample:'Work sample description',reflection:'Family reflection'};
const levels:Record<ObservationLevel,string>={not_tried:'Not yet tried',with_support:'With support',independent:'Independently observed',not_applicable:'Not applicable'};
type Draft={kind:EvidenceKind;level:ObservationLevel;observedOn:string;area:string;title:string;details:string;nextStep:string};
const initial=(today:string):Draft=>({kind:'observation',level:'not_tried',observedOn:today,area:'',title:'',details:'',nextStep:''});
export default function PortfolioWorkspace({learners,canEdit,today}:Props){
 const [learnerId,setLearnerId]=useState(learners[0]?.id??'');
 const [entries,setEntries]=useState<PortfolioEntry[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [draft,setDraft]=useState<Draft>(()=>initial(today));
 const [editing,setEditing]=useState<string|null>(null);
 const [filter,setFilter]=useState('all');
 const learner=learners.find(l=>l.id===learnerId);
 const endpoint=`/api/learners/${encodeURIComponent(learnerId)}/portfolio`;
 const refresh=useCallback(async(signal?:AbortSignal)=>{
  if(!learnerId)return;
  const response=await fetch(`/api/learners/${encodeURIComponent(learnerId)}/portfolio`,{cache:'no-store',signal});
  const body=await response.json();
  if(!response.ok)throw new Error(body.error||'Portfolio unavailable.');
  return body.entries as PortfolioEntry[];
 },[learnerId]);
 useEffect(()=>{
  if(!learnerId)return;
  const controller=new AbortController();
  refresh(controller.signal).then(data=>{if(!controller.signal.aborted)setEntries(data??[]);})
  .catch(e=>{if(!controller.signal.aborted){setEntries([]);setError(e instanceof Error?e.message:'Portfolio unavailable.');}})
  .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[learnerId,refresh]);
 function update<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(d=>({...d,[key]:value}));}
 function reset(){setEditing(null);setDraft(initial(today));}
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!canEdit||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editing?'update':'create',...(editing?{id:editing}:{}),...draft})});
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||'Unable to save observation.');
   const data=await refresh();setEntries(data??[]);
   reset();setNotice('Observation saved privately.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to save.');}
  finally{setBusy(false);}
 }
 async function remove(id:string){
  if(!canEdit||busy||!window.confirm('Delete this portfolio entry permanently?'))return;
  setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
   const body=await response.json();if(!response.ok)throw new Error(body.error||'Unable to delete.');
   const data=await refresh();setEntries(data??[]);if(editing===id)reset();setNotice('Entry deleted.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to delete.');}
  finally{setBusy(false);}
 }
 function edit(entry:PortfolioEntry){setEditing(entry.id);setDraft({kind:entry.kind,level:entry.level,observedOn:entry.observed_on,area:entry.area,title:entry.title,details:entry.details,nextStep:entry.next_step});setError('');setNotice('Editing a saved observation.');}
 if(!learners.length)return <section className="workspace-panel"><h2>Add a learner to begin</h2><p>No personal learning data is required in the lesson library. Add a private learner profile when you are ready to maintain a portfolio.</p><Link href="/dashboard">Open Dashboard →</Link></section>;
 const summary=portfolioSummary(entries);
 const visible=entries.filter(x=>filter==='all'||x.kind===filter);
 return <div className="portfolio-workspace">
  <section className="workspace-panel portfolio-controls">
   <h2>Choose a learner</h2>
   <label className="workspace-field"><span>Private learner portfolio</span><select value={learnerId} onChange={e=>{setLearnerId(e.target.value);setEntries([]);setLoading(true);setError('');setNotice('');reset();}}>{learners.map(l=><option key={l.id} value={l.id}>{l.name} · {l.stage}</option>)}</select></label>
   <p className="muted">Only your family can view these entries. A family owner can add, edit or delete them. Portfolio notes do not change the Goals tab percentage or mark any lesson complete.</p>
  </section>
  {error&&<p className="error-banner" role="alert">{error}</p>}
  <p role="status" aria-live="polite">{loading?'Loading private observations…':busy?'Saving…':notice}</p>
  {!loading&&<div className="metric-grid portfolio-metrics"><div><strong>{summary.count}</strong><span>Records</span></div><div><strong>{summary.withSupport}</strong><span>Observed with support</span></div><div><strong>{summary.independent}</strong><span>Observed independently</span></div></div>}
  <div className="portfolio-layout">
   {canEdit&&<section className="workspace-panel portfolio-editor"><h2>{editing?'Edit observation':'Record an observation'}</h2>
    <p className="muted">Describe what you actually saw. If a task has not been tried, select “Not yet tried” rather than assuming ability.</p>
    <form onSubmit={e=>void save(e)} className="form-grid">
     <fieldset disabled={busy} className="portfolio-fieldset">
      <label className="workspace-field"><span>Observation date</span><input type="date" required min="2000-01-01" max="2100-12-31" value={draft.observedOn} onChange={e=>update('observedOn',e.target.value)}/></label>
      <label className="workspace-field"><span>Evidence type</span><select value={draft.kind} onChange={e=>update('kind',e.target.value as EvidenceKind)}>{evidenceKinds.map(kind=><option key={kind} value={kind}>{labels[kind]}</option>)}</select></label>
      <label className="workspace-field"><span>Area or subject</span><input required maxLength={90} value={draft.area} onChange={e=>update('area',e.target.value)} placeholder="e.g. Fractions, oral storytelling"/></label>
      <label className="workspace-field"><span>Entry title</span><input required maxLength={180} value={draft.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. Compared one-half and two-quarters"/></label>
      <label className="workspace-field"><span>What actually happened?</span><textarea required rows={5} maxLength={2000} value={draft.details} onChange={e=>update('details',e.target.value)} placeholder="Describe the task and what the learner did. Avoid grades, labels and assumptions."/></label>
      <label className="workspace-field"><span>Support observed</span><select value={draft.level} onChange={e=>update('level',e.target.value as ObservationLevel)}>{observationLevels.map(level=><option key={level} value={level}>{levels[level]}</option>)}</select></label>
      <label className="workspace-field"><span>Next gentle step (optional)</span><textarea rows={3} maxLength={750} value={draft.nextStep} onChange={e=>update('nextStep',e.target.value)} placeholder="A small activity to repeat, extend or adapt"/></label>
      <button type="submit">{editing?'Save edits':'Save observation'}</button>
      {editing&&<button type="button" onClick={reset}>Cancel editing</button>}
     </fieldset>
    </form>
   </section>}
   <section className="workspace-panel portfolio-history">
    <div className="panel-heading"><h2>Portfolio timeline</h2><span className="pill">{visible.length} shown</span></div>
    <label className="workspace-field"><span>Filter by evidence type</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All entries</option>{evidenceKinds.map(kind=><option key={kind} value={kind}>{labels[kind]}</option>)}</select></label>
    {loading?<p>Opening portfolio…</p>:visible.length===0?<div className="workspace-empty"><h3>No entries in this view</h3><p>Begin with a real, short observation after a learner completes an activity. A blank portfolio is normal.</p></div>:<ol className="portfolio-timeline">{visible.map(entry=><li key={entry.id} className="portfolio-record">
     <div className="portfolio-record-header"><span className="tag">{labels[entry.kind]} · {entry.observed_on}</span><span className="muted">{levels[entry.level]}</span></div>
     <h3>{entry.title}</h3><p className="muted">{entry.area}</p><p style={{whiteSpace:'pre-wrap'}}>{entry.details}</p>{entry.next_step&&<p><strong>Next step:</strong> {entry.next_step}</p>}
     {canEdit&&<div className="portfolio-entry-actions"><button type="button" disabled={busy} onClick={()=>edit(entry)}>Edit</button><button type="button" disabled={busy} onClick={()=>void remove(entry.id)}>Delete</button></div>}
    </li>)}</ol>}
    {entries.length>=300&&<p className="info-banner">Showing the 300 most recent entries. Older records are retained, but are not visible in this version.</p>}
   </section>
  </div>
  <section className="workspace-panel"><h2>Baseline → observation → reflection</h2><p>Start with a small baseline activity, describe actual work and assistance, then write a reflection or next-step plan. There are no automatic grades or mastery inferences. An “independent” observation documents only that particular activity, not permanent mastery of the subject.</p><p><Link href="/november-pilot">November pilot assessment prompts →</Link> · <Link href="/lessons">Lesson and worksheet library →</Link></p></section>
 </div>;
}
