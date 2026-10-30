import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {pathwayAudit,modulesForGrade} from '@/lib/auto-learning/pathways';
import {queueCatalogue} from '@/lib/auto-learning/catalogue';
export const dynamic='force-dynamic';
export default async function AnnualPathways(){
 const {data:session}=await auth.getSession();if(!session?.user)redirect('/auth/sign-in');
 const coverage=pathwayAudit();
 return <>
 <main className="family-dashboard">
  <div className="dashboard-welcome"><div><span className="tag">CURRICULUM · COVERAGE TRACKER</span><h1>Learning paths, not homework for parents</h1><p className="muted">The activities below are prewritten original parent-led modules, automatically queued by grade. They supplement — but do not replace — a complete reviewed school-year syllabus.</p></div></div>
  <section className="workspace-panel"><h2>Available grade pathways</h2>
  <div className="coach-subject-grid">{coverage.map(x=><article className="coach-subject-card" key={x.grade}><strong>{x.grade}</strong><p>{x.modules} original activities · {x.subjects} learning streams · {x.plannedWeeks} sequence steps per stream</p><p>Coverage status: curated pilot, not complete academic-year accreditation</p></article>)}</div>
  <p className="muted">Other classes continue to use the existing original activity catalogue. Class 4 also has publisher-identified NCERT chapter sessions. No unsupported grade is claimed as fully mapped.</p></section>
  {coverage.map(x=><section className="workspace-panel" key={x.grade}><span className="eyebrow">{x.grade.toUpperCase()} · ORIGINAL ENRICHMENT</span><h2>Ready-to-teach sequence</h2>
  {modulesForGrade(x.grade).map(m=><details key={m.id} style={{padding:'12px 0',borderBottom:'1px solid #e6e9e5'}}>
   <summary style={{cursor:'pointer',fontWeight:700}}>Step {m.week} · {m.subject} · {m.title} <span style={{fontWeight:400,fontSize:13}}>({m.minutes} min)</span></summary>
   <p><strong>Goal:</strong> {m.objective}</p><p><strong>Materials:</strong> {m.materials}</p>
   <ol style={{paddingLeft:24}}>{m.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
   <p><strong>Check understanding:</strong> {m.check}</p>
  </details>)}</section>)}
  <section className="workspace-panel"><h2>How this connects to your dashboard</h2><p>Each activity has a stable identifier. The Automatic Learning Engine skips completed items, retains unfinished items, and offers the next activities. Open <Link href="/dashboard">Today's Learning</Link> to teach and record completion for each learner.</p></section>
 </main></>;
}