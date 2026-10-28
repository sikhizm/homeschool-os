'use client';
import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { filterLessons, lessonStages, lessons, type Lesson } from '@/lib/lessons/library';
import { validDate } from '@/lib/learning/model';

type Learner={id:string;name:string;stage:string};
type Props={learners:Learner[];canEdit:boolean;initialDate:string};
const subjects=['English','Mathematics','Our world','Punjabi & Sikh heritage'] as const;
const stageFor=(stage:string)=>{
 if(['Early Years','Nursery','LKG','UKG'].includes(stage))return 'early';
 const n=Number(stage.replace('Class ',''));
 if(n>=1&&n<=2)return 'class1-2';
 if(n>=3&&n<=5)return 'class3-5';
 if(n>=6&&n<=8)return 'class6-8';
 if(n>=9&&n<=10)return 'class9-10';
 if(n>=11&&n<=12)return 'class11-12';
 return 'early';
};
export default function LessonStudio({learners,canEdit,initialDate}:Props){
 const [learnerId,setLearnerId]=useState(learners[0]?.id??'');
 const [stage,setStage]=useState('');
 const [subject,setSubject]=useState('');
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState(lessons[0]?.id??'');
 const [date,setDate]=useState(initialDate);
 const [title,setTitle]=useState(lessons[0]?.title??'');
 const [minutes,setMinutes]=useState(lessons[0]?.minutes??15);
 const [note,setNote]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const selected=lessons.find(lesson=>lesson.id===selectedId);
 const learner=learners.find(l=>l.id===learnerId);
 const listed=useMemo(()=>filterLessons(stage,subject,search),[stage,subject,search]);
 function choose(lesson:Lesson){
  setSelectedId(lesson.id);setTitle(lesson.title);setMinutes(lesson.minutes);setNote('');setError('');setNotice('');
 }
 async function addToDay(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError('');setNotice('');
  if(!canEdit||!learnerId||!selected)return;
  if(!validDate(date)||title.trim().length<1||title.trim().length>200||!Number.isInteger(minutes)||minutes<1||minutes>120){
    setError('Choose a valid date, a title under 200 characters and a duration between 1 and 120 minutes.');return;
  }
  setBusy(true);
  try{
   // Reuse the existing authenticated, owner-checked learner endpoint.
   const response=await fetch(`/api/learners/${encodeURIComponent(learnerId)}/workspace`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'activity.create',date,title:title.trim(),minutes,subjectId:null,goalId:null}),
   });
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||'Unable to add activity.');
   setNotice('Added to the selected learning day. You can link it to a subject or goal in the daily planner.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to add activity.');}
  finally{setBusy(false);}
 }
 return <div className="lesson-studio">
  <section className="workspace-panel no-print">
   <h2>Explore the library</h2>
   <p className="muted">20 original parent-guided lesson starters. Stage bands are suggestions, not age limits or official syllabus lessons. Nothing is automatically marked complete.</p>
   <div className="lesson-filters">
    <label className="workspace-field"><span>Learning stage</span><select value={stage} onChange={e=>setStage(e.target.value)}><option value="">All stages</option>{lessonStages.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    <label className="workspace-field"><span>Subject</span><select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">All subjects</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
    <label className="workspace-field"><span>Search lessons</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Story, fraction, nature…" maxLength={80}/></label>
   </div>
  </section>
  <div className="lesson-layout">
   <aside className="workspace-panel no-print lesson-selector">
    <h2>Lessons <span className="pill">{listed.length}</span></h2>
    {listed.length===0&&<p>No matching lessons. Try another filter.</p>}
    <div className="lesson-list">{listed.map(lesson=><button key={lesson.id} type="button" className={lesson.id===selectedId?'lesson-choice lesson-choice-active':'lesson-choice'} aria-pressed={lesson.id===selectedId} onClick={()=>choose(lesson)}>
      <strong>{lesson.title}</strong>
      <small>{lesson.subject} · {lessonStages.find(s=>s.id===lesson.stage)?.label} · {lesson.minutes} min</small>
    </button>)}</div>
   </aside>
   <div className="lesson-main">
    {selected?<article className="workspace-panel lesson-print-sheet" aria-label="Printable lesson sheet">
      <div className="lesson-print-heading"><span className="tag">HOMESCHOOL OS · LEARNING SHEET</span><span className="muted">{lessonStages.find(s=>s.id===selected.stage)?.label} · {selected.subject}</span></div>
      <h2>{selected.title}</h2>
      <p className="muted">{selected.overview}</p>
      <div className="lesson-metadata"><span><strong>Time:</strong> {selected.minutes} min</span><span><strong>Materials:</strong> {selected.materials}</span></div>
      <h3>Learning intention</h3><p>{selected.objective}</p>
      <h3>Do together</h3><ol>{selected.steps.map(step=><li key={step}>{step}</li>)}</ol>
      <h3>Discuss</h3><ul>{selected.questions.map(question=><li key={question}>{question}</li>)}</ul>
      <h3>Printable activity</h3><p>{selected.worksheet}</p>
      <div aria-hidden="true" className="lesson-writing-lines">{Array.from({length:5},(_,i)=><div key={i}/>)}</div>
      <h3>Adaptation and safety</h3><p>{selected.adaptation}</p>
      <p className="muted lesson-print-footer">Parent observation: ____________________ &nbsp; Date: _______________</p>
      <p className="muted lesson-print-footer">Original educational activity, not a verbatim NCERT worksheet. Parent review required.</p>
     </article>:<p>Choose a lesson to begin.</p>}
     {selected&&<section className="workspace-panel no-print">
      <div className="lesson-actions"><button type="button" onClick={()=>window.print()}>Print activity sheet</button><span className="muted">Your browser print dialog can also save this sheet as PDF.</span></div>
      <h2>Add to a learning day</h2>
      {!learners.length?<p>Add a learner first from the <Link href="/dashboard">Dashboard</Link>.</p>:!canEdit?<p>Only the family owner may add learning activities.</p>:<form onSubmit={event=>void addToDay(event)} className="lesson-add-form">
       <label className="workspace-field"><span>Learner</span><select value={learnerId} onChange={e=>setLearnerId(e.target.value)}>{learners.map(l=><option value={l.id} key={l.id}>{l.name} · {l.stage}</option>)}</select></label>
       <label className="workspace-field"><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} min="2000-01-01" max="2100-12-31" required /></label>
       <label className="workspace-field"><span>Activity title (editable)</span><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200} required/></label>
       <label className="workspace-field"><span>Minutes</span><input type="number" min={1} max={120} step={1} value={minutes} onChange={e=>setMinutes(Number(e.target.value))} required/></label>
       {learner&&stageFor(learner.stage)!==selected.stage&&<p className="info-banner">This lesson is listed for a different stage. Adapt it to the learner before using it.</p>}
       <label className="workspace-field"><span>Parent notes for this session (optional, not saved)</span><textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={500} placeholder="Make a private note for yourself before planning." /></label>
       <p className="muted">Only the title, date and duration are saved as a planned activity. Notes here stay in this form; no completion, achievement, observations or assessment records are generated.</p>
       <button type="submit" disabled={busy}>{busy?'Adding…':'Add to daily planner'}</button>
      </form>}
      <div role="status" aria-live="polite">{notice}</div>{error&&<p role="alert" className="error-banner">{error}</p>}
      <p><Link href={`/dashboard?date=${encodeURIComponent(date)}`}>Open this day in Dashboard →</Link></p>
     </section>}
   </div>
  </div>
  <section className="workspace-panel no-print"><h2>Using lessons responsibly</h2><p>Adult-led exploration should be flexible and enjoyable. Early-years activities use hands-on objects and stories; infants and toddlers need responsive care and supervised play, not formal worksheets or independent screen time. For Sikh history and Gurbani, check primary text and reputable sources before sharing a quotation.</p></section>
 </div>;
}
