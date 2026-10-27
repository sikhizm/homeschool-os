import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { competencies, curriculumStages, curriculumSources, curriculumForStage, type SubjectKey } from '@/lib/curriculum/library';

export const dynamic = 'force-dynamic';
type Params = {stage?:string;subject?:string};
const subjects: SubjectKey[]=['English','Mathematics','Our world','Punjabi & Sikh heritage'];

export default async function CurriculumPage({searchParams}:{searchParams:Promise<Params>}) {
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const query=await searchParams;
 const stage=curriculumStages.find(s=>s.id===query.stage)?.id??'early';
 const subject=subjects.find(s=>s===query.subject)??'';
 const available=curriculumForStage(stage);
 const visible=subject?available.filter(c=>c.subject===subject):available;
 const byId=new Map(competencies.map(c=>[c.id,c]));
 const references=new Map<string, {title:string;url:string}>(curriculumSources.map(source=>[source.id,source]));
 return <><header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>CURRICULUM PATHWAYS</span></header>
 <main className="family-dashboard">
  <div className="dashboard-welcome"><div><span className="tag">PHASE 03 · CURRICULUM</span><h1>Competency pathways</h1><p className="muted">Browse developmental suggestions, see prerequisite foundations and turn one into a parent-reviewed learning goal.</p></div></div>
  <section className="workspace-panel"><h2>How to use this library</h2><p>These {competencies.length} outcomes are original teaching suggestions informed by NCERT frameworks, <strong>not verbatim official learning outcomes</strong>, official grade equivalences, or proof of attainment. Use the learner&apos;s actual ability, current textbooks and individual interests. The parent decides whether and when a goal is achieved.</p><p>With multiple learners, share the family&apos;s approximate 60 minutes of adult-guided time. For infants and toddlers, use responsive care, movement, conversation and supervised sensory play—not formal lessons or screens.</p><p><Link href="/dashboard">Back to private learning workspace →</Link></p></section>
  <section className="workspace-panel"><h2>Choose a stage and subject</h2><form action="/curriculum" method="get" className="form-grid"><label className="workspace-field"><span>Learning stage</span><select name="stage" defaultValue={stage}>{curriculumStages.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label className="workspace-field"><span>Subject</span><select name="subject" defaultValue={subject}><option value="">All subjects</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}</select></label><button type="submit">Show competencies</button></form><p className="muted">{visible.length} of {available.length} outcomes shown for {curriculumStages.find(s=>s.id===stage)?.label}. The stage filter does not restrict what a learner is allowed to explore.</p></section>
  <div className="subject-grid">{visible.map(c=>{
   const reference=references.get(c.sourceId);
   return <article className="workspace-panel" key={c.id} id={c.id}>
     <span className="eyebrow">{c.subject}</span><h2>{c.title}</h2>
     <p><strong>Suggested outcome:</strong> {c.outcome}</p>
     <p><strong>Try together:</strong> {c.activity}</p>
     {c.prerequisites.length?<div><strong>Foundations to explore first:</strong><ul>{c.prerequisites.map(pr=>{const prior=byId.get(pr);return <li key={pr}>{prior?<Link href={`/curriculum?stage=${encodeURIComponent(prior.stage)}&subject=${encodeURIComponent(prior.subject)}#${prior.id}`}>{prior.title} ({curriculumStages.find(s=>s.id===prior.stage)?.label})</Link>:pr}</li>})}</ul></div>:<p className="muted">No prerequisite recorded in this curated subset.</p>}
     <p className="muted">Background guidance: {reference?.url?<a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>:'Parent-developed enrichment'}. This is an editorial alignment reference, not an exact official outcome mapping.</p>
     <p><Link href={`/dashboard?competency=${encodeURIComponent(c.id)}`}>Use as a parent-reviewed goal →</Link></p>
   </article>
  })}</div>
  {visible.length===0&&<section className="workspace-panel"><p>No examples in this filter yet. Try another subject.</p></section>}
  <section className="workspace-panel"><h2>Reference framework</h2><ul>{curriculumSources.filter(s=>s.id!=='original').map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul><p>Review the current NCERT textbooks and your relevant CBSE requirements for exact year, class, unit and learning outcomes. These examples cannot replace syllabus verification.</p></section>
 </main></>;
}
