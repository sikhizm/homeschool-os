'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';

type Learner={learner_id:string;display_name:string;stage:string};
type SessionKind='read'|'practice'|'review';
type SavedPhase={phaseIndex:number};

const sessions:{kind:SessionKind;title:string;minutes:number;description:string}[]=[
 {kind:'read',title:'Read & explore',minutes:15,description:'Read a short section together and retell its main idea.'},
 {kind:'practice',title:'Practice',minutes:20,description:'Try selected activities from the official chapter.'},
 {kind:'review',title:'Understanding check',minutes:10,description:'Recall key ideas without looking back.'},
];

export default function ChapterSessions({chapterId,grade,eligible}:{chapterId:string;grade:number;eligible:boolean}){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [resume,setResume]=useState<Record<string,boolean>>({});
 const [message,setMessage]=useState('Loading learners…');

 useEffect(()=>{
  let active=true;
  fetch(`/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`,{cache:'no-store'})
   .then(async response=>{
    const body=await response.json();
    if(!response.ok)throw new Error(body.error??'Unable to load learners.');
    return body as {learners:Learner[]};
   })
   .then(data=>{
    if(!active)return;
    const matching=(data.learners??[]).filter(learner=>Number(String(learner.stage).replace(/^Class\s*/i,''))===grade);
    setLearners(matching);
    setMessage(matching.length?'':data.learners?.length?`No learner is enrolled in Class ${grade} in this family yet.`:'Add a learner from the parent dashboard to start a chapter session.');
    const states:Record<string,boolean>={};
    for(const learner of matching){
     for(const session of sessions){
      const taskId=`ncert:${chapterId}:${session.kind}`;
      try{
       const saved=localStorage.getItem('homeschool-os-lesson-'+taskId);
       if(saved){
        const parsed=JSON.parse(saved) as SavedPhase;
        states[learner.learner_id+':'+session.kind]=Number(parsed.phaseIndex)>=0&&Number(parsed.phaseIndex)<5;
       }
      }catch{}
     }
    }
    setResume(states);
   })
   .catch(error=>{if(active)setMessage(error instanceof Error?error.message:'Unable to load learners.');});
  return()=>{active=false;};
 },[chapterId,grade]);

 if(!eligible)return <section className="workspace-panel"><span className="eyebrow">CHAPTER SESSIONS</span><h2>Learning sessions not published yet</h2><p className="muted">This chapter does not have a verified title in the current session catalogue. We will not generate a lesson from an unverified chapter label.</p></section>;

 return <section className="workspace-panel" aria-labelledby="chapter-sessions-title">
  <span className="eyebrow">CHAPTER LEARNING STUDIO</span>
  <h2 id="chapter-sessions-title">Choose a session</h2>
  <p className="muted">These are original HomeSchool OS study prompts that guide you through the official chapter. They are not copied NCERT lessons, exercises or answer keys. Your place in each session is saved in this browser.</p>
  {learners.map(learner=><div key={learner.learner_id} style={{marginTop:22}}>
   <h3 style={{fontSize:18,marginBottom:12}}>{learner.display_name} <span className="muted" style={{fontSize:13,fontWeight:400}}>· {learner.stage}</span></h3>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:12}}>
    {sessions.map(session=>{
     const taskId=`ncert:${chapterId}:${session.kind}`;
     const href=`/learn/lesson?learner=${encodeURIComponent(learner.learner_id)}&task=${encodeURIComponent(taskId)}`;
     const continuing=resume[learner.learner_id+':'+session.kind];
     return <article key={session.kind} style={{border:'1px solid #dce8e0',borderRadius:14,padding:16,background:'#fbfdf9',display:'flex',flexDirection:'column',gap:8,minWidth:0}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
       <strong>{session.title}</strong><small className="muted">{session.minutes} min</small>
      </div>
      <p className="muted" style={{fontSize:14,lineHeight:1.5,margin:0,flex:1}}>{session.description}</p>
      <Link className="learner-continue" href={href}>{continuing?'Resume session':'Start session'} <span aria-hidden="true">→</span></Link>
     </article>;
    })}
   </div>
  </div>)}
  {!learners.length&&<p className="muted" role="status">{message}</p>}
 </section>;
}
