'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {subjectTint} from '@/lib/subject-tint';

type Task={id:string;title:string;subject:string;minutes:number;href:string|null;status?:string};

/**
 * "Continue reading" strip: the next recommended activity per learner,
 * straight from the automatic planner queue.
 */
export function ContinueReading(){
 const [tasks,setTasks]=useState<null|{learners:{id:string;name:string;tasks:Task[]}[]}>(null);
 useEffect(()=>{
  let alive=true;
  fetch('/api/auto-learning',{cache:'no-store'})
   .then(r=>r.json())
   .then((json:{learners?:{id:string;name:string;tasks:Task[]}[]})=>{
    if(alive)setTasks({learners:(json.learners??[]).filter(l=>l.tasks?.length)});
   })
   .catch(()=>{if(alive)setTasks({learners:[]});});
  return()=>{alive=false;};
 },[]);
 if(!tasks)return <section className="library-continue" aria-label="Continue reading"><p className="muted">Finding where each learner left off…</p></section>;
 if(!tasks.learners.length)return null;
 return <section className="library-continue" aria-labelledby="continue-title">
  <header className="section-heading">
   <div>
    <p className="tag">Continue</p>
    <h2 id="continue-title">Pick up where you left off</h2>
   </div>
   <Link className="mode-switch" href="/learn">All learner spaces</Link>
  </header>
  <div className="library-continue-grid">
   {tasks.learners.map(learner=>{
    const task=learner.tasks[0];
    return <article className="card library-continue-card" key={learner.id}>
     <span className="learner-avatar" style={{background:subjectTint(task.subject)}} aria-hidden="true">{learner.name.slice(0,1).toUpperCase()}</span>
     <div>
      <p className="library-continue-learner">{learner.name}</p>
      <strong>{task.title}</strong>
      <small>{task.subject} · {task.minutes} min{task.status==='needs_revision'?' · revision due':''}</small>
     </div>
     {task.href
      ?<a className="learner-continue" href={task.href}>Open <span aria-hidden="true">→</span></a>
      :<Link className="learner-continue" href={`/learn?learner=${learner.id}`}>Open <span aria-hidden="true">→</span></Link>}
    </article>;
   })}
  </div>
 </section>;
}
