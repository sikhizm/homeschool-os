'use client';
import {useCallback,useEffect,useState} from 'react';
import WeeklyLearnerLessons from './weekly-learner-lessons';

type Learner={id:string;name:string;grade:string;canEdit:boolean};
const palette=['#F6E5D1','#DCEFE5','#EAE4F8','#DCEAF7','#F7E3E9'];
export default function AutomaticLearning(){
 const [learners,setLearners]=useState<Learner[]>([]);
 const [selected,setSelected]=useState('');
 const [notice,setNotice]=useState('Loading learner progress…');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 const load=useCallback(async()=>{
  try{
   const res=await fetch('/api/auto-learning',{cache:'no-store'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error??'Unable to load learning plan');
   setLearners(data.learners);
   setSelected(old=>data.learners.some((x:Learner)=>x.id===old)?old:(data.learners[0]?.id??''));
   setNotice(data.notice);setError(false);
  }catch(e){setNotice(e instanceof Error?e.message:'Unable to load');setError(true)}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{const handle=setTimeout(()=>{void load()},0);return ()=>clearTimeout(handle)},[load]);
 const current=learners.find(x=>x.id===selected);
 return <section className="coach-shell" aria-labelledby="coach-title">
  <div className="coach-top">
   <div><span className="coach-kicker">✦ YOUR FAMILY LEARNING COACH</span><h2 id="coach-title">Learner Lessons</h2>
    <p>See weekly chapters and add reading to today’s plan.</p></div>
   <div className="coach-stat"><strong>{learners.length}</strong><span>Learners</span></div>
  </div>
  {learners.length>0&&<div className="coach-learner-tabs" role="group" aria-label="Choose learner">
   {learners.map((learner,index)=><button type="button" key={learner.id} onClick={()=>setSelected(learner.id)} aria-pressed={learner.id===selected} className={'coach-learner-tab '+(learner.id===selected?'is-selected':'')}>
    <span className="coach-avatar" style={{background:palette[index%palette.length]}}>{learner.name.slice(0,1).toUpperCase()}</span>
    <span><strong>{learner.name}</strong><small>{learner.grade}</small></span>
   </button>)}
  </div>}
  {current&&<WeeklyLearnerLessons key={current.id} learnerId={current.id} canEdit={current.canEdit}/>}
  {!loading&&!learners.length&&!error&&<div className="coach-empty">Add a learner below to generate their learning path.</div>}
  {loading&&<p className="coach-empty">Preparing your learner activities…</p>}
  <p className={'coach-feedback '+(error?'is-error':'')} role="status" aria-live="polite">{notice}</p>
 </section>;
}
