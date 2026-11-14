import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { validDate } from '@/lib/learning/model';
import {
  activitySummary,
  evidenceSummary,
  goalSummary,
  parseReportPeriod,
  reportWindow,
  type ActivityDay,
  type EvidenceSnapshot,
  type GoalSnapshot,
} from '@/lib/reports/model';
import PrintReport from './print-report';

export const dynamic = 'force-dynamic';
type Params = { learner?: string; days?: string; end?: string };
const AVATAR_TINTS = ['#DDEBFF', '#D9F1EA', '#EAE5FF', '#FCE9DD'] as const;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const params = await searchParams;
  const sql = getSql();
  const membership = await sql`
    SELECT f.id, f.name FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id} ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!membership.length)
    return (
      <main className="family-dashboard studio-stack">
        <section className="workspace-panel">
          <span className="eyebrow">PROGRESS &amp; INSIGHTS</span>
          <h1>Learning reports</h1>
          <p className="muted">Your account needs an approved family membership.</p>
          <div className="hero-actions">
            <Link className="hero-action-primary" href="/dashboard">Return to Home →</Link>
          </div>
        </section>
      </main>
    );

  const family = membership[0];
  const learners = await sql`
    SELECT l.id::text AS id, l.display_name, l.stage
    FROM learners l
    WHERE l.family_id = ${family.id} AND l.archived_at IS NULL
    ORDER BY l.created_at, l.id
  `;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const end = validDate(params.end) && params.end <= today ? params.end : today;
  const period = parseReportPeriod(params.days);
  const window = reportWindow(end, period);
  const learner = learners.find((l) => String(l.id) === params.learner) ?? learners[0];
  const learnerId = learner ? String(learner.id) : '';
  let days: ActivityDay[] = [];
  let goals: GoalSnapshot[] = [];
  let evidence: EvidenceSnapshot[] = [];
  let portfolioAvailable = false;
  let reportError = '';

  if (learner) {
    try {
      // The learner ID is from a server-side family-scoped query. Every data query
      // independently rechecks membership; no client-provided family ID is trusted.
      const results = await Promise.all([
        sql`SELECT a.learning_date::text AS date, COUNT(*)::int AS activities,
          COUNT(*) FILTER (WHERE a.completed)::int AS completed,
          COALESCE(SUM(a.minutes), 0)::int AS planned_minutes,
          COALESCE(SUM(a.minutes) FILTER (WHERE a.completed), 0)::int AS completed_minutes
          FROM learning_activities a JOIN learners l ON l.id = a.learner_id
          WHERE l.id::text = ${learnerId} AND a.learning_date BETWEEN ${window.startDate}::date AND ${window.endDate}::date
          AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = l.family_id AND fm.auth_user_id = ${session.user.id})
          GROUP BY a.learning_date ORDER BY a.learning_date DESC`,
        sql`SELECT g.id::text, g.title, s.name AS subject, g.progress FROM learner_objectives g
          JOIN learners l ON l.id = g.learner_id JOIN learning_subjects s ON s.id = g.subject_id AND s.learner_id = l.id
          WHERE l.id::text = ${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = l.family_id AND fm.auth_user_id = ${session.user.id})
          ORDER BY g.created_at DESC, g.id DESC LIMIT 100`,
        sql`SELECT to_regclass('public.learning_portfolio_entries') IS NOT NULL AS available`,
      ]);
      days = results[0].map((d) => ({
        date: String(d.date),
        activities: Number(d.activities),
        completed: Number(d.completed),
        plannedMinutes: Number(d.planned_minutes),
        completedMinutes: Number(d.completed_minutes),
      }));
      goals = results[1].map((g) => ({
        id: String(g.id),
        title: String(g.title),
        subject: String(g.subject),
        progress: Number(g.progress),
      }));
      portfolioAvailable = results[2][0]?.available === true;
      if (portfolioAvailable) {
        const rows = await sql`
          SELECT e.id::text, e.observed_on::text, e.kind, e.area, e.title, e.details, e.next_step, e.level
          FROM learning_portfolio_entries e JOIN learners l ON l.id = e.learner_id
          WHERE l.id::text = ${learnerId} AND e.observed_on BETWEEN ${window.startDate}::date AND ${window.endDate}::date
          AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = l.family_id AND fm.auth_user_id = ${session.user.id})
          ORDER BY e.observed_on DESC, e.created_at DESC, e.id DESC LIMIT 100
        `;
        evidence = rows.map((e) => ({
          id: String(e.id),
          observedOn: String(e.observed_on),
          kind: String(e.kind),
          area: String(e.area),
          title: String(e.title),
          details: String(e.details),
          nextStep: String(e.next_step),
          level: String(e.level),
        }));
      }
    } catch {
      reportError = 'Report data is unavailable. Check the existing learning tables and database configuration.';
    }
  }

  const activity = activitySummary(days);
  const objective = goalSummary(goals);
  const observations = evidenceSummary(evidence);

  return (
    <main className="family-dashboard report-page studio-stack">
      <div className="dashboard-welcome report-no-print">
        <div>
          <span className="tag">FAMILY LEARNING INSIGHTS</span>
          <h1>Learning review</h1>
          <p className="muted">
            A calm, private summary of recorded activities and parent observations — never an automated grade, diagnosis or judgement.
          </p>
        </div>
        <SectionArtwork theme="insights" />
      </div>

      <section className="workspace-panel report-no-print studio-control-bar">
        <div className="panel-heading" style={{ marginBottom: 14 }}>
          <div>
            <span className="eyebrow">REPORT WINDOW &amp; LEARNER</span>
            <h2 style={{ margin: '4px 0 0' }}>Choose a reporting window</h2>
          </div>
          <PrintReport />
        </div>

        {learners.length > 1 && (
          <nav className="learner-switcher" aria-label="Switch learner report" style={{ marginBottom: 16 }}>
            {learners.map((l, idx) => {
              const id = String(l.id);
              const active = id === learnerId;
              return (
                <Link
                  key={id}
                  href={`/reports?learner=${encodeURIComponent(id)}&days=${period}&end=${encodeURIComponent(end)}`}
                  className={active ? 'learner-pill is-active' : 'learner-pill'}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className="learner-avatar"
                    style={{ background: AVATAR_TINTS[idx % AVATAR_TINTS.length] }}
                    aria-hidden="true"
                  >
                    {String(l.display_name).slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    {String(l.display_name)} · <small style={{ fontWeight: 600, opacity: 0.8 }}>{String(l.stage)}</small>
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        <form method="get" action="/reports" className="report-filters">
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Learner</span>
            <select name="learner" defaultValue={learnerId}>
              {learners.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {String(l.display_name)} · {String(l.stage)}
                </option>
              ))}
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Window</span>
            <select name="days" defaultValue={String(period)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Ending on</span>
            <input name="end" type="date" min="2000-01-01" max={today} defaultValue={end} required />
          </label>
          <button type="submit" className="btn-primary" disabled={!learner}>
            Update review
          </button>
        </form>
        <p className="muted" style={{ margin: '14px 0 0', fontSize: 13 }}>
          Reports use only records already saved by your family. A quiet week or missing observation is never treated as a learning difficulty.
        </p>
      </section>

      {!learner ? (
        <section className="workspace-panel workspace-empty">
          <h3>No learner records yet</h3>
          <p>Add a private learner profile first to generate a family learning review.</p>
          <Link className="btn-primary" href="/learners">
            Open Learners →
          </Link>
        </section>
      ) : reportError ? (
        <p role="alert" className="error-banner">
          {reportError}
        </p>
      ) : (
        <>
          <section className="workspace-panel report-print-head report-summary-hero">
            <div>
              <span className="eyebrow">PRIVATE FAMILY LEARNING REPORT</span>
              <h2 style={{ margin: '6px 0 4px' }}>
                {String(learner.display_name)} <span className="muted" style={{ fontWeight: 500 }}>· {String(learner.stage)}</span>
              </h2>
              <p style={{ margin: 0, fontWeight: 700, color: '#285A46' }}>
                {formatDate(window.startDate)} – {formatDate(window.endDate)} · {period}-day window
              </p>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
                Prepared from your family’s saved records. Keep printed copies private.
              </p>
            </div>
            <div className="report-period-pills report-no-print" aria-label="Quick period switch">
              {[7, 30, 90].map((d) => (
                <Link
                  key={d}
                  href={`/reports?learner=${encodeURIComponent(learnerId)}&days=${d}&end=${encodeURIComponent(end)}`}
                  className={period === d ? 'library-chip is-selected' : 'library-chip'}
                >
                  {d} days
                </Link>
              ))}
            </div>
          </section>

          <div className="metric-grid report-metrics">
            <div>
              <strong>{activity.daysWithActivity}</strong>
              <span>Days with logged activities</span>
            </div>
            <div>
              <strong>
                {activity.completedCount}
                <small> / {activity.activityCount}</small>
              </strong>
              <span>Activities marked complete / planned</span>
            </div>
            <div>
              <strong>
                {activity.completedMinutes}
                <small> / {activity.plannedMinutes} min</small>
              </strong>
              <span>Minutes marked complete / planned</span>
            </div>
          </div>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">ACTIVITY LOG</span>
                <h2 style={{ margin: '4px 0 0' }}>Daily activity rhythm</h2>
              </div>
              <span className="pill">{days.length} active {days.length === 1 ? 'day' : 'days'}</span>
            </div>
            {days.length === 0 ? (
              <div className="workspace-empty" style={{ padding: '26px 18px' }}>
                <h3 style={{ margin: '0 0 6px' }}>No logged activities in this window</h3>
                <p style={{ margin: 0 }}>
                  No activities were recorded between {formatDate(window.startDate)} and {formatDate(window.endDate)}. Off-screen learning, reading and play happen every day without needing a log.
                </p>
              </div>
            ) : (
              <div className="report-day-grid">
                {days.map((d) => {
                  const pct = d.activities > 0 ? Math.round((d.completed / d.activities) * 100) : 0;
                  return (
                    <div className="report-day" key={d.date}>
                      <strong>{formatDate(d.date)}</strong>
                      <span>
                        {d.completed} of {d.activities} activities completed
                      </span>
                      <div className="progress-track" aria-hidden="true">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <small className="muted">
                        {d.completedMinutes} / {d.plannedMinutes} min
                      </small>
                      <Link className="report-no-print week-day-link" href={`/dashboard?date=${d.date}`}>
                        View day →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="muted" style={{ marginBottom: 0, marginTop: 16, fontSize: 13 }}>
              Time totals count saved activity durations, not independently verified teaching time. The suggested family hour is shared across learners and should not be summed per child.
            </p>
          </section>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">LEARNER OBJECTIVES</span>
                <h2 style={{ margin: '4px 0 0' }}>Current goals</h2>
              </div>
              <span className="pill">
                {objective.total} shown · {objective.active} active · {objective.markedComplete} at 100%
              </span>
            </div>
            <p className="muted" style={{ marginTop: 0 }}>
              Goal progress reflects the parent-entered value, not an automated score calculated from this reporting window.
            </p>
            {goals.length === 0 ? (
              <p className="muted" style={{ marginBottom: 0 }}>
                No custom goals are saved for this learner yet. You can add observable goals from <Link href="/curriculum">Competencies</Link> or Home.
              </p>
            ) : (
              <ul className="report-goals">
                {goals.map((g) => (
                  <li key={g.id} className="report-goal-card">
                    <div className="report-goal-top">
                      <div>
                        <strong>{g.title}</strong>
                        <span className="pill" style={{ marginLeft: 8 }}>{g.subject}</span>
                      </div>
                      <span className="report-goal-pct">{g.progress}%</span>
                    </div>
                    <div className="progress-track" aria-label={`Parent-entered progress: ${g.progress}%`}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, g.progress))}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PORTFOLIO SNAPSHOT</span>
                <h2 style={{ margin: '4px 0 0' }}>Observed learning evidence</h2>
              </div>
              {portfolioAvailable && (
                <span className="pill">
                  {observations.total} observations · {observations.independent} independent · {observations.withSupport} supported
                </span>
              )}
            </div>
            {!portfolioAvailable ? (
              <p className="muted" style={{ marginBottom: 0 }}>
                The portfolio table has not yet been activated in this database. Activity and goal summaries remain available.
              </p>
            ) : (
              <>
                {evidence.length === 0 ? (
                  <p className="muted" style={{ marginBottom: 0 }}>
                    No observations were recorded during this window. No mastery conclusion is drawn.{' '}
                    <Link className="report-no-print" href="/portfolio">
                      Record an observation in Family Portfolio →
                    </Link>
                  </p>
                ) : (
                  <ol className="report-evidence-cards">
                    {evidence.map((e) => (
                      <li key={e.id} className="portfolio-record">
                        <div className="portfolio-record-header">
                          <span className="eyebrow">
                            {formatDate(e.observedOn)} · {e.area} · {e.kind.replaceAll('_', ' ')}
                          </span>
                          <span className="verify-badge verified">{e.level.replaceAll('_', ' ')}</span>
                        </div>
                        <h3>{e.title}</h3>
                        <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{e.details}</p>
                        {e.nextStep && (
                          <p className="portfolio-next-callout">
                            <strong>Parent’s next step:</strong> {e.nextStep}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
                {evidence.length === 100 && (
                  <p className="info-banner" style={{ marginTop: 14 }}>
                    Showing the latest 100 observations in this window; older entries remain safely stored.
                  </p>
                )}
              </>
            )}
          </section>

          <section className="workspace-panel report-reflection">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">CONVERSATION &amp; NEXT STEPS</span>
                <h2 style={{ margin: '4px 0 0' }}>Parent review and gentle adjustments</h2>
              </div>
              <Link className="btn-secondary report-no-print" href="/portfolio">
                Save reflection in Portfolio →
              </Link>
            </div>
            <p className="muted" style={{ marginTop: 0 }}>
              Discuss what the learner enjoyed, what support helped and which single small adjustment to try next. Printing leaves clean space for handwritten notes.
            </p>
            <div className="reflection-prompt-grid">
              <div className="reflection-prompt-box">
                <strong>Something that worked well</strong>
                <span>Which story, example or hands-on moment sparked curiosity?</span>
                <div className="reflection-line" aria-hidden="true" />
              </div>
              <div className="reflection-prompt-box">
                <strong>A gentle next step</strong>
                <span>One small skill or habit to carry into next week’s plan.</span>
                <div className="reflection-line" aria-hidden="true" />
              </div>
              <div className="reflection-prompt-box">
                <strong>What to revisit calmly</strong>
                <span>Any tricky concept to try again with concrete objects or a shorter session.</span>
                <div className="reflection-line" aria-hidden="true" />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
