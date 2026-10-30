import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import SectionArtwork from '@/components/section-artwork';
import {globalStages,globalFrameworks} from '@/lib/global-curriculum/catalogue';
import {coreAreas,validStage,createParentReviewPlan,curriculumCoverage} from '@/lib/global-curriculum/engine';

export const dynamic='force-dynamic';
type Search={stage?:string;focus?:string;learner?:string};
export default async function CurriculumStudio({searchParams}:{searchParams:Promise<Search>}){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`SELECT f.id,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id
 WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 if(!families.length)return <main className="family-dashboard"><h1>Family membership required</h1><p>Your account needs an approved family membership to access curriculum planning.</p><Link href="/dashboard">Back to dashboard</Link></main>;
 const learners=await sql`SELECT l.id::text,l.display_name,l.stage FROM learners l WHERE l.family_id=${families[0].id} ORDER BY l.created_at,l.id`;
 const params=await searchParams;
 const learner=learners.find(l=>String(l.id)===params.learner)??learners[0]??null;
 const stage=validStage(params.stage||'');
 const focus=coreAreas.find(area=>area===params.focus)??'';
 const plan=createParentReviewPlan(stage,focus);
 const coverage=curriculumCoverage();
 const total=plan.reduce((sum,x)=>sum+x.minutes,0);
 return <>
 <main className="family-dashboard">
  <div className="dashboard-welcome"><div><span className="tag">GLOBAL CURRICULUM 1.0 · INTEGRATED PREVIEW</span><h1>One thoughtful learning journey</h1><p className="muted">Bring Indian academic foundations and original international-inspired learning approaches together in one manageable family plan.</p></div><SectionArtwork theme="explore"/></div>
  <nav className="global-crumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><span aria-hidden="true">/</span><Link href="/global-curriculum">Explore</Link><span aria-hidden="true">/</span><strong>Curriculum studio</strong></nav>
  <section className="gcv1-intro" aria-label="Curriculum overview">
   <div><span className="eyebrow">YOUR FAMILY LEARNING SYSTEM</span><h2>Clarity over curriculum overload.</h2><p>This is a parent-reviewed learning proposal, not an AI-generated diagnosis or a certification that a textbook or board has been completed. Every activity and skill can be adjusted.</p></div>
   <div className="gcv1-intro-symbol" aria-hidden="true">✳</div>
  </section>
  <section className="gcv1-metrics" aria-label="Actual curriculum coverage">
   <div><strong>{coverage.originalSkills}</strong><span>Original skills</span></div>
   <div><strong>{coverage.originalLessons}</strong><span>Original lessons</span></div>
   <div><strong>{coverage.textbookRecords}</strong><span>NCERT books identified</span></div>
   <div><strong>{coverage.sourceCheckedTitles}</strong><span>Chapter titles checked</span></div>
  </section>
  <section className="workspace-panel">
   <div className="gcv1-section-top"><div><span className="eyebrow">ONE FAMILY PLAN</span><h2>Build a gentle learning rhythm</h2><p className="muted">Suggestions are based on the selected developmental stage—not an automatic assessment of a child.</p></div><span className="gcv1-state">Parent review required</span></div>
   <form className="gcv1-filters" action="/curriculum-studio" method="get">
    <label className="workspace-field"><span>Learner (context only)</span><select name="learner" defaultValue={learner?String(learner.id):''}>{learners.length?learners.map(l=><option value={String(l.id)} key={String(l.id)}>{String(l.display_name)}</option>):<option value="">No learner selected</option>}</select></label>
    <label className="workspace-field"><span>Learning stage</span><select name="stage" defaultValue={stage}>{globalStages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label className="workspace-field"><span>Priority area</span><select name="focus" defaultValue={focus}><option value="">Balanced learning</option>{coreAreas.map(area=><option key={area} value={area}>{area}</option>)}</select></label>
    <button type="submit">Review learning plan →</button>
   </form>
   <div className="gcv1-plan-banner"><div><span className="eyebrow">SHARED GUIDED TIME</span><strong>{total} minutes</strong><p>Suggested adult-guided total across these activities. For a multi-child family, adapt and share activities rather than allocating a separate hour per child.</p></div><span aria-hidden="true">◷</span></div>
   <div className="gcv1-activity-list">{plan.map((item,index)=><article className="gcv1-activity-card" key={item.skill.id}>
     <span className="gcv1-step" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
     <div><span className="eyebrow">{item.skill.subject} · {item.minutes} min</span><h3>{item.skill.title}</h3><p>{item.skill.activity}</p><details><summary>How to check learning</summary><p>{item.observationPrompt}</p><p className="muted">Suggested original learning activity. Do not infer proficiency or assessment scores from this plan.</p></details>
     <div className="gcv1-actions"><Link href={`/dashboard?globalSkill=${encodeURIComponent(item.skill.id)}`}>Review as goal →</Link><Link href={`/lessons`}>Browse original lessons →</Link></div></div>
   </article>)}</div>
   <p className="muted">Learner selection changes only the context shown here. It does not fetch diagnoses, overwrite plans, assign skills, create activities or save grades.</p>
  </section>
  <section className="workspace-panel">
   <div className="gcv1-section-top"><div><span className="eyebrow">COVERAGE TRANSPARENCY</span><h2>Know what is and is not verified</h2><p>Catalogue coverage is counted from the application data, not from marketing estimates.</p></div></div>
   <div className="gcv1-trust-grid"><div><strong>{coverage.gradesWithPartialCatalogue} / 12</strong><span>NCERT grades partially indexed</span></div><div><strong>{coverage.gradesWithoutBooks}</strong><span>Grades not yet catalogued</span></div><div><strong>{coverage.approvedChapterMappings}</strong><span>Approved chapter-skill mappings</span></div><div><strong>{coverage.completeBoards}</strong><span>Boards with full verified coverage</span></div></div>
   <div className="gcv1-coverage-grid">{coverage.gradeRows.map(g=><div key={g.grade} className={g.cataloguedBooks?'gcv1-grade has-books':'gcv1-grade'}><strong>Class {g.grade}</strong><span>{g.cataloguedBooks?g.cataloguedBooks+' books catalogued':'Not yet catalogued'}</span><small>{g.contentsAudited?g.contentsAudited+' books with audited contents':'Contents review pending'}</small></div>)}</div>
   <p className="muted">The four Class 4 books have checked contents; additional identified books await chapter verification. A listed book is not a complete syllabus and an illustrative skill is not a certified NCERT/Cambridge/IB equivalence.</p>
  </section>
  <section className="workspace-panel">
   <span className="eyebrow">AUTHORITATIVE SOURCES & PEDAGOGY</span><h2>International perspectives, one grounded pathway</h2>
   <div className="gcv1-sources">{globalFrameworks.filter(f=>f.id!=='original'&&f.id!=='epathshala').map(f=><article key={f.id}><h3>{f.label}</h3><p>{f.description}</p><a href={f.url} target="_blank" rel="noopener noreferrer">Official reference ↗</a></article>)}</div>
   <p className="muted">External curriculum sites are provided for source review; nothing here asserts accreditation, licence rights or verified equivalence to their official standards.</p>
  </section>
  <div className="gcv1-footer-links"><Link href="/ncert-books">Explore NCERT book index →</Link><Link href="/global-curriculum">Browse original skills →</Link><Link href="/reports">Review parent-recorded evidence →</Link><Link href="/planning">Open weekly planner →</Link></div>
 </main></>;
}