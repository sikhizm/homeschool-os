'use client';
import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
type Task={id:string;title:string;subject:string;minutes:number;source:string;href:string;instructions:string[];status:string};
type Learner={id:string;name:string;grade:string;canEdit:boolean;completed:number;total:number;tasks:Task[];history:{id:string;title:string;subject:string;updatedAt:string}[]};
export default function AutomaticLearning(){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [notice,setNotice]=useState('Loading your next learning activities…');
 const [busy,setBusy]=useState('');
 const load=useCallback(async()=>{
  try{
   const res=await fetch('/api/auto-learning',{cache:'no-store'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to load');
   setLearners(data.learners);setNotice(data.notice);
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to load learning plan');}
 },[]);
 useEffect(()=>{void load()},[load]);
 async function mark(learnerId:string,taskId:string,status:string){
  setBusy(learnerId+taskId);
  try{
   const res=await fetch('/api/auto-learning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learnerId,taskId,status})});
   const data=await res.json();if(!res.ok)throw new Error(data.error??'Save failed');
   await load();
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to save');}finally{setBusy('');}
 }
 return <section className="workspace-panel" aria-labelledby="auto-learning-title">
  <span className="eyebrow">AUTOMATIC LEARNING · EARLY PILOT</span>
  <h2 id="auto-learning-title">Your next lessons are ready</h2>
  <p className="muted">No daily research required for the currently available activities. Completing a task removes it from the queue and reveals the next one. Review means it stays available.</p>
  <div style={{display:'grid',gap:16,marginTop:18}}>
   {learners.map(learner=><article key={learner.id} style={{border:'1px solid var(--border, #ddd)',borderRadius:16,padding:16}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
     <div><h3 style={{margin:0}}>{learner.name}</h3><small>{learner.grade} · {learner.completed} of {learner.total} curated items completed</small></div>
     <span aria-label="Learning progress">{learner.total?Math.round(100*learner.completed/learner.total):0}%</span>
    </div>
    <progress style={{width:'100%',margin:'12px 0'}} value={learner.completed} max={learner.total||1}/>
    {learner.tasks.length?learner.tasks.map(task=><div key={task.id} style={{padding:'12px 0',borderTop:'1px solid #ddd'}}>
     <strong>{task.title}</strong> <small>· {task.subject} · {task.minutes} min</small>
     <p className="muted" style={{margin:'4px 0'}}>{task.source}</p>
     <details><summary>How to teach this</summary><ol>{task.instructions.map((step,i)=><li key={i}>{step}</li>)}</ol><Link href={task.href}>Open learning resource →</Link></details>
     {learner.canEdit&&<div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:9}}>
      <button type="button" disabled={busy!==''} onClick={()=>mark(learner.id,task.id,'completed')}>✓ Completed</button>
      <button type="button" disabled={busy!==''} onClick={()=>mark(learner.id,task.id,'needs_revision')}>Needs revision</button>
     </div>}
     {task.status==='needs_revision'&&<small>Revision requested — stays in your queue</small>}
    </div>):<p>No unfinished items are available in this curated pilot. More grade-appropriate content needs editorial review.</p>}
    <details style={{marginTop:16}}><summary>Completed learning history ({learner.history.length} recent items)</summary>
     {learner.history.length?<ul>{learner.history.map(item=><li key={item.id}>{item.title} · {item.subject}
       {learner.canEdit&&<button type="button" disabled={busy!==''} style={{marginLeft:8}} onClick={()=>mark(learner.id,item.id,'pending')}>Undo completion</button>}
      </li>)}</ul>:<p>No completed sessions yet.</p>}
    </details>
   </article>)}
   {!learners.length&&<p>No learner profiles found. Add learners below to begin.</p>}
  </div>
  <p className="muted" role="status" style={{marginTop:12}}>{notice}</p>
 </section>;
}
