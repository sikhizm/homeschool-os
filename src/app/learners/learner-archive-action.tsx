'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function LearnerArchiveAction({id,name,archived=false}:{id:string;name:string;archived?:boolean}){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function run(){
  const message=archived
   ?`Restore ${name}? Their previous learning history will become active again.`
   :`Archive ${name}? Their profile will disappear from active learning spaces, but all lessons, progress and portfolio records will be preserved. You can restore the profile later.`;
  if(!window.confirm(message)||busy)return;
  setBusy(true);setError('');
  try{
   const response=await fetch(`/api/learners/${encodeURIComponent(id)}`,{method:archived?'PATCH':'DELETE'});
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||'Unable to update learner.');
   router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Unable to update learner.');}
  finally{setBusy(false);}
 }
 return <div className="learner-archive-action">
  <button type="button" className="hero-action-secondary" onClick={()=>void run()} disabled={busy}>
   {busy?(archived?'Restoring…':'Archiving…'):archived?'Restore learner':'Archive learner'}
  </button>
  {error&&<p className="learner-error" role="alert">{error}</p>}
 </div>;
}
