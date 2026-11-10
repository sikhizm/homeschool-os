'use client';

import {useState} from 'react';

function tomorrowKey():string{
 const ist=new Date(Date.now()+330*60*1000+86400000);
 return ist.toISOString().slice(0,10);
}

/**
 * One-button automated planner: prepares tomorrow's family plan from the
 * same queue the daily coach uses. Idempotent — saving twice returns the
 * existing plan rather than replacing it.
 */
export function PrepareNextDay({canEdit,budget=60}:{canEdit:boolean;budget?:20|40|60|90}){
 const [state,setState]=useState<'idle'|'busy'|'saved'|'error'>('idle');
 const [message,setMessage]=useState('');
 if(!canEdit)return null;
 async function prepare(){
  setState('busy');setMessage('');
  try{
   const date=tomorrowKey();
   const response=await fetch('/api/family-calendar',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({date,budget}),
   });
   const json=await response.json() as {plan?:unknown;saved?:boolean;error?:string};
   if(!response.ok){setState('error');setMessage(json.error??'Could not prepare the plan.');return;}
   setState('saved');
   setMessage(json.saved?'Tomorrow’s plan is prepared and saved.':'Tomorrow’s plan was already prepared — nothing was overwritten.');
  }catch{
   setState('error');setMessage('Could not reach the planner. Try again.');
  }
 }
 return <section className="card prepare-next" aria-labelledby="prepare-next-title">
  <div>
   <p className="tag">Automated planner</p>
   <h2 id="prepare-next-title">Prepare tomorrow in one tap</h2>
   <p className="muted">The queue balances subjects, hides finished activities and respects the shared guided-time limit. Completed lessons never reappear.</p>
  </div>
  <div className="prepare-next-actions">
   <button type="button" className="learner-continue" onClick={()=>void prepare()} disabled={state==='busy'}>
    {state==='busy'?'Preparing…':state==='saved'?'✓ Prepared':'Prepare next day'}
   </button>
   {message&&<p className={state==='error'?'prepare-next-error':'recorded-note'} role="status">{message}</p>}
  </div>
 </section>;
}
