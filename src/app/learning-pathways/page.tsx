import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import LessonCard from '@/app/dashboard/lesson-card';
import {annualGrades,annualSteps,annualSummary,termLabel} from '@/lib/curriculum/annual';
import {navigationForPath} from '@/lib/navigation';
export const dynamic='force-dynamic';

const modeText=(mode:string)=>mode==='independent'?'Independent practice':mode==='play'?'Play together · parent nearby':'Parent-led teaching';

export default async function AnnualPathways({searchParams}:{searchParams:Promise<{grade?:string;week?:string}>}){
 const {data:session}=await auth.getSession();if(!session?.user)redirect('/auth/sign-in');
 const params=await searchParams;
 const definitions=annualGrades;
 const chosen=definitions.find(item=>item.key===params.grade)??definitions[3];
 const week=Number(params.week);
 const focusedWeek=Number.isInteger(week)&&week>=1&&week<=36?week:null;
 const steps=annualSteps(chosen.key);
 const weeks=Array.from({length:36},(_,index)=>index+1);
 const summary=annualSummary();
 const context=navigationForPath('/learning-pathways');
 return <>
 <main className="family-dashboard annual-page">
  <div className="dashboard-welcome">
   <div><span className="tag">EXPLORE · ANNUAL LEARNING PATHWAYS</span><h1>A whole year, prepared for you</h1>
    <p className="muted">Thirty-six teaching weeks for each learner, with the lesson written out before you begin. Weeks are a sequence, not a deadline.</p></div>
   <span className="daily-badge">✧ 36 weeks · 3 terms · 4 learners</span>
  </div>
  <section className="annual-intro workspace-panel">
   <h2>What is actually here</h2>
   <p>Each of the four stages has an original, fully written 36-week pathway. Every core session includes the objective, materials, parent preparation, a worked example, step-by-step teaching, questions, your child&apos;s activity, expected answers, easier and harder variations, completion criteria and revision guidance. A shorter practice or play session follows each teaching week where appropriate.</p>
   <p className="annual-honesty"><strong>Honest scope:</strong> this is original HomeSchool OS parent-guided content. Official NCERT Class 4 book and chapter titles are indexed separately at <Link href="/ncert-books">NCERT books</Link>; no chapter text is copied and no chapter-to-lesson alignment is claimed. International frameworks are used only as general pedagogical inspiration, not as accreditation or grade equivalence.</p>
  </section>
  <section className="workspace-panel">
   <h2>Choose a learning stage</h2>
   <div className="annual-grade-grid">{definitions.map(item=>{
    const info=summary.find(s=>s.key===item.key)!;
    return <Link key={item.key} href={'/learning-pathways?grade='+item.key} className={'annual-grade '+(item.key===chosen.key?'is-active':'')} aria-current={item.key===chosen.key?'page':undefined}>
     <strong>{item.label}</strong><span>{info.units} units · {info.steps} sessions · {info.subjects.length} subjects</span>
     <small>{item.description}</small>
    </Link>;
   })}</div>
  </section>
  <section className="workspace-panel annual-provenance"><span className="eyebrow">SOURCE & SCOPE</span><h2>{chosen.grade} provenance</h2><p>{chosen.provenance}</p>
   <div className="coach-subject-grid">{chosen.milestones.map((milestone,index)=><div key={milestone} className="coach-subject-card"><strong>{termLabel((index+1) as 1|2|3)}</strong><p>{milestone}</p></div>)}</div>
  </section>
  <section className="workspace-panel">
   <div className="annual-section-head"><div><span className="eyebrow">{chosen.grade.toUpperCase()} · 36 TEACHING WEEKS</span><h2>Ready-to-teach sequence</h2></div>
    <p>Open any lesson below. Nothing needs to be researched before you teach it.</p></div>
   {([1,2,3] as const).map(term=>{
    const termWeeks=weeks.filter(w=>Math.ceil(w/12)===term);
    return <div key={term} className="annual-term">
     <h3 className="annual-term-heading">{termLabel(term)}</h3>
     <p className="annual-term-milestone">✦ Milestone: {chosen.milestones[term-1]}</p>
     {termWeeks.map(w=>{
      const weekSteps=steps.filter(step=>step.week===w);
      const core=weekSteps.find(step=>step.kind==='core');
      if(!core)return null;
      const practice=weekSteps.find(step=>step.kind==='consolidation');
      return <article key={w} className={'annual-week '+(w===focusedWeek?'is-focused':'')} id={'week-'+w}>
       <header className="annual-week-head"><span className="annual-week-badge">Week {w}</span>
        <div><h4>{core.title}</h4><small>{core.subject} · {core.strand}</small></div>
        <span className="annual-week-mode">{modeText(core.mode)} · {core.minutes} min</span>
       </header>
       <LessonCard lesson={core.lesson} href={core.href} defaultOpen={w===focusedWeek} label="Full teaching script"/>
       {practice&&<div className="annual-practice"><LessonCard lesson={practice.lesson} href={practice.href} label={'Follow-up: '+modeText(practice.mode)}/></div>}
       {core.milestone&&<p className="annual-milestone-note">✦ Term milestone week: {core.milestone}</p>}
      </article>;
     })}
    </div>;
   })}
  </section>
  <section className="workspace-panel">
   <h2>How this reaches your morning</h2>
   <p>The <Link href="/dashboard">Family day</Link> view selects the next unfinished step for each learner and fits them into one shared 60-minute family budget. Infant interaction and independent practice are shown separately. Record an understanding check, and a later successful recall session demonstrates mastery — a completion click alone never does.</p>
   <div className="annual-footer-links">
    <Link href="/dashboard">Today&apos;s family plan →</Link>
    <Link href="/ncert-books">Verified NCERT chapter index →</Link>
    <Link href="/curriculum-studio">Curriculum coverage audit →</Link>
    {context.context&&<Link href="/global-curriculum">Global framework lenses →</Link>}
   </div>
  </section>
 </main></>;
}
