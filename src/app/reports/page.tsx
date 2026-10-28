import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { validDate } from '@/lib/learning/model';
import { activitySummary, evidenceSummary, goalSummary, parseReportPeriod, reportWindow, type ActivityDay, type EvidenceSnapshot, type GoalSnapshot } from '@/lib/reports/model';
import PrintReport from './print-report';

export const dynamic='force-dynamic';
type Params={learner?:string;days?:string;end?:string};
const formatDate=(date:string)=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
export default async function ReportsPage({searchParams}:{searchParams:Promise<Params>}){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const params=await searchParams;
 const sql=getSql();
 const membership=await sql`SELECT f.id,f.name FROM families f JOIN family_members fm ON fm.family_id=f.id
   WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 if(!membership.length)return <main className="family-dashboard"><h1>Learning reports</h1><p>Your account needs an approved family membership.</p><Link href="/dashboard">Return to Dashboard</Link></main>;
 const family=membership[0];
 const learners=await sql`SELECT l.id::text AS id,l.display_name,l.stage FROM learners l WHERE l.family_id=${family.id} ORDER BY l.created_at,l.id`;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
 const end=validDate(params.end)&&params.end<=today?params.end:today;
 const period=parseReportPeriod(params.days);
 const window=reportWindow(end,period);
 const learner=learners.find(l=>String(l.id)===params.learner)??learners[0];
 const learnerId=learner?String(learner.id):'';
 let days:ActivityDay[]=[];
 let goals:GoalSnapshot[]=[];
 let evidence:EvidenceSnapshot[]=[];
 let portfolioAvailable=false;
 let reportError='';
 if(learner){
  try{
   // The learner ID is from a server-side family-scoped query. Every data query
   // independently rechecks membership; no client-provided family ID is trusted.
   const results=await Promise.all([
    sql`SELECT a.learning_date::text AS date,COUNT(*)::int AS activities,
      COUNT(*) FILTER (WHERE a.completed)::int AS completed,
      COALESCE(SUM(a.minutes),0)::int AS planned_minutes,
      COALESCE(SUM(a.minutes) FILTER (WHERE a.completed),0)::int AS completed_minutes
      FROM learning_activities a JOIN learners l ON l.id=a.learner_id
      WHERE l.id::text=${learnerId} AND a.learning_date BETWEEN ${window.startDate}::date AND ${window.endDate}::date
      AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${session.user.id})
      GROUP BY a.learning_date ORDER BY a.learning_date DESC`,
    sql`SELECT g.id::text,g.title,s.name AS subject,g.progress FROM learner_objectives g
      JOIN learners l ON l.id=g.learner_id JOIN learning_subjects s ON s.id=g.subject_id AND s.learner_id=l.id
      WHERE l.id::text=${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${session.user.id})
      ORDER BY g.created_at DESC,g.id DESC LIMIT 100`,
    sql`SELECT to_regclass('public.learning_portfolio_entries') IS NOT NULL AS available`
   ]);
   days=results[0].map(d=>({date:String(d.date),activities:Number(d.activities),completed:Number(d.completed),plannedMinutes:Number(d.planned_minutes),completedMinutes:Number(d.completed_minutes)}));
   goals=results[1].map(g=>({id:String(g.id),title:String(g.title),subject:String(g.subject),progress:Number(g.progress)}));
   portfolioAvailable=results[2][0]?.available===true;
   if(portfolioAvailable){
    const rows=await sql`SELECT e.id::text,e.observed_on::text,e.kind,e.area,e.title,e.details,e.next_step,e.level
     FROM learning_portfolio_entries e JOIN learners l ON l.id=e.learner_id
     WHERE l.id::text=${learnerId} AND e.observed_on BETWEEN ${window.startDate}::date AND ${window.endDate}::date
     AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${session.user.id})
     ORDER BY e.observed_on DESC,e.created_at DESC,e.id DESC LIMIT 100`;
    evidence=rows.map(e=>({id:String(e.id),observedOn:String(e.observed_on),kind:String(e.kind),area:String(e.area),title:String(e.title),details:String(e.details),nextStep:String(e.next_step),level:String(e.level)}));
   }
  }catch{
   reportError='Report data is unavailable. Check the existing learning tables and database configuration.';
  }
 }
 const activity=activitySummary(days),objective=goalSummary(goals),observations=evidenceSummary(evidence);
 return <><header className="workspace-header report-no-print"><Link href="/dashboard">✦ Homeschool OS</Link><span>FAMILY LEARNING REVIEW</span></header>
 <main className="family-dashboard report-page">
  <nav className="report-no-print"><Link href="/dashboard">Dashboard</Link> · <Link href="/planning">Planning</Link> · <Link href="/portfolio">Portfolio</Link> · <Link href="/curriculum">Curriculum</Link></nav>
  <div className="dashboard-welcome"><div><span className="tag">PHASE 07 · FAMILY INSIGHTS</span><h1>Learning review</h1><p className="muted">A private summary of recorded activities and observations—not a grade, diagnosis or automated judgement.</p></div></div>
  <section className="workspace-panel report-no-print"><h2>Choose a reporting window</h2>
   <form method="get" action="/reports" className="report-filters">
    <label className="workspace-field"><span>Learner</span><select name="learner" defaultValue={learnerId}>{learners.map(l=><option key={String(l.id)} value={String(l.id)}>{String(l.display_name)} · {String(l.stage)}</option>)}</select></label>
    <label className="workspace-field"><span>Window</span><select name="days" defaultValue={String(period)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label>
    <label className="workspace-field"><span>Ending on</span><input name="end" type="date" min="2000-01-01" max={today} defaultValue={end} required/></label>
    <button type="submit" disabled={!learner}>Generate report</button>
   </form><p className="muted">Reports use only records already saved by your family. A missing observation is not evidence of a learning difficulty.</p>
   <PrintReport/>
  </section>
  {!learner?<section className="workspace-panel"><h2>No learner records yet</h2><p>Begin in the <Link href="/dashboard">Dashboard</Link> by adding a private learner profile.</p></section>:reportError?<p role="alert" className="error-banner">{reportError}</p>:<>
   <section className="workspace-panel report-print-head"><span className="tag">PRIVATE FAMILY LEARNING REPORT</span><h2>{String(learner.display_name)} — {String(learner.stage)}</h2><p>{formatDate(window.startDate)} – {formatDate(window.endDate)} · {period}-day review</p><p className="muted">Prepared from the family’s own saved records. Keep printed copies private.</p></section>
   <div className="metric-grid report-metrics">
    <div><strong>{activity.daysWithActivity}</strong><span>Days with logged activities</span></div>
    <div><strong>{activity.completedCount}<small> / {activity.activityCount}</small></strong><span>Activities marked complete / planned</span></div>
    <div><strong>{activity.completedMinutes}<small> / {activity.plannedMinutes} min</small></strong><span>Minutes marked complete / planned</span></div>
   </div>
   <section className="workspace-panel">
    <h2>Daily activity rhythm</h2>
    {days.length===0?<p>No activities were recorded in this period. This does not mean no learning occurred.</p>:
    <div className="report-day-grid">{days.map(d=><div className="report-day" key={d.date}>
      <strong>{formatDate(d.date)}</strong><span>{d.completed} of {d.activities} activities completed</span><span>{d.completedMinutes} / {d.plannedMinutes} min</span>
      <Link className="report-no-print" href={`/dashboard?date=${d.date}`}>View day →</Link>
    </div>)}</div>}
    <p className="muted">Time totals count saved activity durations, not independently verified teaching time. The suggested family hour is shared across learners; these totals must not be summed as actual adult teaching time.</p>
   </section>
   <section className="workspace-panel"><h2>Current goals</h2><p className="muted">Goal progress is the parent-entered current value, not a score calculated from this reporting window. Up to 100 recent goals are shown.</p>
    <p><strong>{objective.total}</strong> goals shown · <strong>{objective.active}</strong> in progress · <strong>{objective.markedComplete}</strong> marked 100% by parent</p>
    {goals.length===0?<p>No goals are saved for this learner.</p>:<ul className="report-goals">{goals.map(g=><li key={g.id}><span><strong>{g.title}</strong> <span className="muted">({g.subject})</span></span><span>Parent-entered progress: {g.progress}%</span></li>)}</ul>}
   </section>
   <section className="workspace-panel"><h2>Observed learning evidence</h2>
    {!portfolioAvailable?<p>The portfolio table has not yet been activated in this database. Activity and goal summaries are available, but recorded observations cannot be included until Phase 06’s migration is applied.</p>:<>
    <p><strong>{observations.total}</strong> recent observations shown · {observations.withSupport} marked with support · {observations.independent} observed independently on a specific task.</p>
    {evidence.length===0?<p>No observations were recorded during this window. No mastery conclusion is drawn.</p>:<ol className="report-evidence">{evidence.map(e=><li key={e.id}><strong>{e.title}</strong><div className="muted">{formatDate(e.observedOn)} · {e.area} · {e.kind.replaceAll('_',' ')} · {e.level.replaceAll('_',' ')}</div><p style={{whiteSpace:'pre-wrap'}}>{e.details}</p>{e.nextStep&&<p><strong>Parent’s next step:</strong> {e.nextStep}</p>}</li>)}</ol>}
    {evidence.length===100&&<p className="info-banner">Showing the latest 100 observations in this window; older entries may not appear.</p>}
    </>}
   </section>
   <section className="workspace-panel report-reflection"><h2>Parent review and next steps</h2><p>Discuss what the learner enjoyed, what support helped and which single small adjustment to try next. This report does not change goals or save a new observation.</p>
    <p><strong>Something that worked:</strong> __________________________________________</p>
    <p><strong>A gentle next step:</strong> _____________________________________________</p>
    <p><strong>What to revisit:</strong> __________________________________________________</p>
    <p className="muted">Reports are generated on demand. To retain a reflection, add it intentionally to the <Link className="report-no-print" href="/portfolio">private Portfolio</Link>.</p>
   </section>
  </>}
 </main></>;
}
