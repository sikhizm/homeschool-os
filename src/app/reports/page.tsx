import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { validDate } from '@/lib/learning/model';
import {parseReportPeriod, reportWindow} from '@/lib/reports/model';
import {ncertChapterSlots, textbookById} from '@/lib/ncert/textbooks';
import {readingTiming} from '@/lib/planning/reading-rhythm';
import PrintReport from './print-report';
import LearnerReportCard from './learner-report-card';
import TestPerformance from './test-performance';
import ReadingActivity from './reading-activity';

export const dynamic = 'force-dynamic';
type Params = { learner?: string; days?: string; end?: string; testSubject?: string; testChapter?: string };

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
  let reading: {id: string; date: string; title: string; subject?: string}[] = [];
  let scheduledReading: {planned: number; onTime: number; late: number} | null = null;
  let readingUnavailable = false;
  if (learner) {
    try {
      const [schema] = await sql`SELECT to_regclass('public.ncert_chapter_progress') IS NOT NULL AS chapters,
        to_regclass('public.ncert_weekly_chapter_outcomes') IS NOT NULL AS weekly,
        to_regclass('public.chapter_plan_activities') IS NOT NULL AS planned`;
      const [chapterReads, weeklyReads, plannedReads] = await Promise.all([
        schema?.chapters ? sql`
          SELECT p.chapter_id, (p.completed_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_date
          FROM ncert_chapter_progress p JOIN learners l ON l.id = p.learner_id
          WHERE l.id::text = ${learnerId} AND l.family_id = ${family.id} AND l.archived_at IS NULL
            AND (p.completed_at AT TIME ZONE 'Asia/Kolkata')::date BETWEEN ${window.startDate}::date AND ${window.endDate}::date
        ` : [],
        schema?.weekly ? sql`
          SELECT p.chapter_id, (p.updated_at AT TIME ZONE 'Asia/Kolkata')::date::text AS read_date
          FROM ncert_weekly_chapter_outcomes p JOIN learners l ON l.id = p.learner_id
          WHERE l.id::text = ${learnerId} AND l.family_id = ${family.id} AND l.archived_at IS NULL
            AND p.outcome IN ('done', 'understood')
            AND (p.updated_at AT TIME ZONE 'Asia/Kolkata')::date BETWEEN ${window.startDate}::date AND ${window.endDate}::date
        ` : [],
        schema?.planned ? sql`
          SELECT p.chapter_id, p.starts_on::text, to_jsonb(p)->>'completed_on' AS completed_on
          FROM chapter_plan_activities p JOIN learners l ON l.id = p.learner_id
          WHERE l.id::text = ${learnerId} AND l.family_id = ${family.id} AND l.archived_at IS NULL
            AND p.activity = 'reading' AND p.period = 'day'
            AND p.starts_on BETWEEN ${window.startDate}::date AND ${window.endDate}::date
        ` : [],
      ]);
      const allReads = [...chapterReads, ...weeklyReads, ...plannedReads.flatMap(row =>
        row.completed_on ? [{chapter_id: row.chapter_id, read_date: row.completed_on}] : [])];
      if (plannedReads.length) {
        const timing = plannedReads.map(row => readingTiming(String(row.starts_on), String(row.starts_on), window.endDate,
          allReads.filter(read => read.chapter_id === row.chapter_id).map(read => read.read_date)));
        scheduledReading = {planned: timing.length, onTime: timing.filter(item => item.onTime).length,
          late: timing.filter(item => item.completedOn && !item.onTime).length};
      }
      const chapters = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));
      const records = new Map<string, typeof reading[number]>();
      for (const row of allReads) {
        const id = String(row.chapter_id), date = String(row.read_date);
        if (date < window.startDate || date > window.endDate) continue;
        const chapter = chapters.get(id);
        records.set(`${date}:${id}`, {
          id, date, title: chapter?.verifiedTitle ?? chapter?.label ?? id,
          subject: chapter ? textbookById(chapter.bookId)?.subject : undefined,
        });
      }
      reading = [...records.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      readingUnavailable = !schema?.chapters && !schema?.weekly;
    } catch {
      readingUnavailable = true;
    }
  }

  return <main className="family-dashboard report-page studio-stack report-card-page">
    <section className="workspace-panel report-print-head report-toolbar">
      <header className="report-toolbar-heading">
        <div>
          <p className="eyebrow">Progress</p>
          <h1>{learner ? `${String(learner.display_name)}’s report card` : 'Learner report cards'}</h1>
          {learner && <p className="muted">{String(learner.stage)} · {formatDate(window.startDate)} – {formatDate(window.endDate)}</p>}
        </div>
        {learner && <div className="report-no-print"><PrintReport /></div>}
      </header>
      {learner && <form method="get" action="/reports" className="report-filters report-no-print">
        <label className="workspace-field"><span>Learner</span>
          <select name="learner" defaultValue={learnerId}>
            {learners.map(item => <option key={String(item.id)} value={String(item.id)}>{String(item.display_name)} · {String(item.stage)}</option>)}
          </select>
        </label>
        <label className="workspace-field"><span>Window</span>
          <select name="days" defaultValue={String(period)}>
            <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
          </select>
        </label>
        <label className="workspace-field"><span>Ending on</span>
          <input name="end" type="date" min="2000-01-01" max={today} defaultValue={end} required />
        </label>
        <button type="submit" className="btn-primary">Update report</button>
      </form>}
    </section>

    {!learner ? <section className="workspace-panel workspace-empty">
      <h2>No learners yet</h2>
      <Link className="btn-primary" href="/learners">Open Learners →</Link>
    </section> : <>
      <LearnerReportCard learnerId={learnerId} familyId={String(family.id)} today={today}
        readingActivity={<ReadingActivity entries={reading} learnerId={learnerId}
          unavailable={readingUnavailable} timing={scheduledReading} />} />
      <TestPerformance userId={session.user.id} learnerId={learnerId}
        learnerName={String(learner.display_name)} start={window.startDate} end={window.endDate}
        period={period} subject={params.testSubject} chapter={params.testChapter} />
    </>}
  </main>;
}
