'use client';
import {useEffect,useState} from 'react';
type Learner={learner_id:string;display_name:string;stage:string;status:string|null;parent_note:string|null;updated_at:string|null};
const statuses=[{value:'assigned',label:'Assigned'},{value:'in_progress',label:'In progress'},{value:'completed',label:'Completed'}];
export default function ChapterProgress({chapterId}:{chapterId:string}){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [selected,setSelected]=useState('');
 const [status,setStatus]=useState('assigned');
 const [note,setNote]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('Loading learner progress…');
 const current=learners.find(l=>l.learner_id===selected);
 useEffect(()=>{
  let active=true;
  fetch(`/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`,{cache:'no-store'})
   .then(async r=>{const body=await r.json();if(!r.ok)throw new Error(body.error??'Unable to load progress');return body;})
   .then(data=>{if(active){setLearners(data.learners);setSelected(data.learners[0]?.learner_id??'');setMessage(data.learners.length?'':'No learners in this family yet. Add a learner from the dashboard.');}})
   .catch(err=>{if(active)setMessage(String(err.message));});
  return ()=>{active=false};
 },[chapterId]);
 useEffect(()=>{setStatus(current?.status??'assigned');setNote(current?.parent_note??'');},[current?.learner_id,current?.status,current?.parent_note]);
 async function save(){
  if(!selected)return;
  setBusy(true);setMessage('');
  try{
   const response=await fetch(`/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learnerId:selected,status,note})});
   const body=await response.json();
   if(!response.ok)throw new Error(body.error??'Unable to save');
   setLearners(old=>old.map(l=>l.learner_id===selected?{...l,status,parent_note:note,updated_at:new Date().toISOString()}:l));
   setMessage('Progress saved for this learner.');
  }catch(err){setMessage(err instanceof Error?err.message:'Unable to save progress.');}
  finally{setBusy(false);}
 }
 return <section className="workspace-panel" aria-label="Learner chapter progress">
  <span className="eyebrow">PARENT-RECORDED PROGRESS</span><h2>Track this chapter</h2>
  <p className="muted">Assign the chapter to a learner, then record progress after studying. Opening the PDF does not automatically mark it complete.</p>
  {learners.length>0&&<div style={{display:'grid',gap:14,maxWidth:540}}>
   <label className="workspace-field"><span>Learner</span><select value={selected} onChange={e=>setSelected(e.target.value)}>{learners.map(l=><option key={l.learner_id} value={l.learner_id}>{l.display_name} · {l.stage}</option>)}</select></label>
   <label className="workspace-field"><span>Chapter status</span><select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
   <label className="workspace-field"><span>Parent notes (optional)</span><textarea style={{width:'100%',minHeight:90,padding:12,borderRadius:10}} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="What did the learner understand? What needs another look?"/></label>
   <button type="button" onClick={save} disabled={busy}>{busy?'Saving…':'Save chapter progress'}</button>
   {current?.updated_at&&<small className="muted">Last recorded: {new Date(current.updated_at).toLocaleString()}</small>}
  </div>}
  <p role="status" aria-live="polite">{message}</p>
 </section>;
}
