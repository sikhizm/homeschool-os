'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

import WeeklyOverview from './weekly-overview';
import { ChapterPlanner, type ChapterRecord } from './chapter-planner';
import { academicYear, addDays, daysInWeek, mondayOf, yearDates } from '@/lib/planning/periods';

type Learner = { id: string; name: string; stage: string };
type Period = {
  id: string;
  kind: 'year' | 'week';
  start_date: string;
  end_date: string;
  title: string;
  focus: string;
  notes: string;
  competency_ids: string[];
  chapter_ids: string[];
  olympiad_topics: Record<string,string>;
};
type PlanningData = {
  year: { startDate: string; endDate: string };
  week: string[];
  periods: Period[];
  passedChapterIds?: string[];
  chapterRecords?: ChapterRecord[];
};
type Props = { learners: Learner[]; canEdit: boolean; initialDate: string };

const display = (date: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T12:00:00Z'),
  );

export default function PlanningWorkspace({ learners, canEdit, initialDate }: Props) {
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? '');
  const [plannerTab, setPlannerTab] = useState<'week' | 'year'>('week');
  const [date, setDate] = useState(initialDate);
  const [data, setData] = useState<PlanningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [revision, setRevision] = useState(0);

  const selected = learners.find((l) => l.id === learnerId);
  const y = academicYear(date);
  const weekStart = mondayOf(date);
  const yearRange = yearDates(y);
  const weekRange = daysInWeek(date);
  const yearPlan = data?.periods.find((p) => p.kind === 'year' && p.start_date === yearRange.startDate);
  const weekPlan = data?.periods.find((p) => p.kind === 'week' && p.start_date === weekStart);
  const endpoint = '/api/planning';
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!learnerId) return null;
      const params = new URLSearchParams({ learnerId, date });
      const response = await fetch(endpoint + '?' + params.toString(), { cache: 'no-store', signal });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Unable to open planning records.');
      return json as PlanningData;
    },
    [learnerId, date],
  );

  useEffect(() => {
    if (!learnerId) return;
    const controller = new AbortController();
    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setData(null);
          setError(e instanceof Error ? e.message : 'Unable to load plans.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [load, learnerId, refreshVersion]);

  async function save(event: FormEvent<HTMLFormElement>, kind: 'year' | 'week') {
    event.preventDefault();
    if (!canEdit || busy || !learnerId) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          kind,
          anchor: date,
          title: String(fields.get('title') ?? ''),
          focus: String(fields.get('focus') ?? ''),
          notes: String(fields.get('notes') ?? ''),
          competencyIds: (kind === 'year' ? yearPlan : weekPlan)?.competency_ids ?? [],
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to save plan.');
      setData(await load());
      setRevision((v) => v + 1);
      setNotice(kind === 'year' ? 'Academic-year plan saved.' : 'Weekly focus saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
    }
  }

  if (!learners.length)
    return (
      <section className="workspace-panel">
        <span className="eyebrow">GETTING STARTED</span>
        <h2>No learner yet</h2>
        <p className="muted">Add a learner in Home or Learners to begin planning your family rhythm.</p>
        <div className="hero-actions">
          <Link className="hero-action-primary" href="/learners">Open Learners →</Link>
        </div>
      </section>
    );


  return (
    <div className="learning-workspace">
      <section className="workspace-panel studio-control-bar">
        <div className="panel-heading" style={{ marginBottom: 14 }}>
          <div>
            <span className="eyebrow">ACTIVE LEARNER &amp; WEEK</span>
            <h2 style={{ margin: '4px 0 0' }}>Choose learner and week</h2>
          </div>
          <span className="pill">{display(weekRange[0])} – {display(weekRange[6])}</span>
        </div>

        {learners.length > 1 && (
          <div className="learner-switcher" role="group" aria-label="Choose learner" style={{ marginBottom: 16 }}>
            {learners.map((l) => (
              <button
                key={l.id}
                type="button"
                className={l.id === learnerId ? 'learner-pill is-active' : 'learner-pill'}
                aria-pressed={l.id === learnerId}
                onClick={() => {
                  if (learnerId === l.id) return;
                  setLearnerId(l.id);
                  setNotice('');
                  setError('');
                  setLoading(true);
                }}
              >
                <span className="learner-avatar" aria-hidden="true">
                  {l.name.slice(0, 1).toUpperCase()}
                </span>
                <span>{l.name} · <small style={{ fontWeight: 600, opacity: 0.8 }}>{l.stage}</small></span>
              </button>
            ))}
          </div>
        )}

        <div className="planning-bar-row">
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Learner</span>
            <select
              value={learnerId}
              onChange={(event) => {
                setLearnerId(event.target.value);
                setNotice('');
                setError('');
                setLoading(true);
              }}
            >
              {learners.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.stage}
                </option>
              ))}
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Planning date</span>
            <input
              type="date"
              min="2020-01-01"
              max="2099-12-31"
              value={date}
              onChange={(event) => {
                if (event.target.value) {
                  setDate(event.target.value);
                  setLoading(true);
                  setError('');
                }
              }}
            />
          </label>
          <div className="planning-week-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDate(addDays(date, -7));
                setLoading(true);
                setError('');
              }}
              disabled={date < '2020-01-08'}
            >
              ← Previous week
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDate(initialDate);
                setLoading(date !== initialDate);
                setError('');
              }}
            >
              Current week
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDate(addDays(date, 7));
                setLoading(true);
                setError('');
              }}
              disabled={date > '2099-12-24'}
            >
              Next week →
            </button>
          </div>
        </div>
        {selected && (
          <p className="muted" style={{ margin: '14px 0 0', fontSize: 13 }}>
            Planning for <strong>{selected.name}</strong> ({selected.stage}). All planning records stay private to your family.
          </p>
        )}
      </section>

      {(loading || notice) && (
        <div role="status" aria-live="polite" className={notice ? 'recorded-note' : 'muted'}>
          {loading ? 'Loading planning records…' : notice}
        </div>
      )}
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      {!canEdit && (
        <p className="info-banner">Family members can view planning; only the family owner can edit.</p>
      )}

      {data && !loading && (
        <>
          <ChapterPlanner key={learnerId+date} learnerId={learnerId} stage={selected?.stage??''} date={date}
            today={initialDate} tab={plannerTab} onTabChange={setPlannerTab}
            weekIds={weekPlan?.chapter_ids??[]} chapterRecords={data.chapterRecords??[]}
            passedChapterIds={data.passedChapterIds??[]} olympiad={yearPlan?.olympiad_topics??{}}
            ids={yearPlan?.chapter_ids??[]} canEdit={canEdit} refresh={()=>setRefreshVersion(v=>v+1)} />
          <WeeklyOverview key={learnerId + ':' + date} learnerId={learnerId} date={date} today={initialDate} />

          <details><summary>Optional planning notes</summary>
          <div className="subject-grid">
            <section className="workspace-panel">
              <span className="eyebrow">ANNUAL DIRECTION</span>
              <h2>Academic year {y}–{y + 1}</h2>
              <p className="muted">
                {display(yearRange.startDate)} {y} to {display(yearRange.endDate)} {y + 1}. A flexible outline, not an automatic syllabus.
              </p>
              {canEdit ? (
                <form key={'year:' + learnerId + ':' + y + ':' + revision} onSubmit={(event) => void save(event, 'year')}>
                  <fieldset disabled={busy}>
                    <label className="workspace-field">
                      <span>Year theme</span>
                      <input
                        name="title"
                        defaultValue={yearPlan?.title ?? 'Learning, curiosity and confidence'}
                        maxLength={120}
                        required
                      />
                    </label>
                    <label className="workspace-field">
                      <span>Learning priorities</span>
                      <textarea
                        name="focus"
                        rows={4}
                        maxLength={1500}
                        defaultValue={yearPlan?.focus ?? ''}
                        placeholder="Add any personal notes or priorities…"
                      />
                    </label>
                    <label className="workspace-field">
                      <span>Resources and adjustments</span>
                      <textarea name="notes" rows={3} maxLength={1500} defaultValue={yearPlan?.notes ?? ''} />
                    </label>
                    <button type="submit" className="btn-primary">
                      {yearPlan ? 'Update year plan' : 'Save year plan'}
                    </button>
                  </fieldset>
                </form>
              ) : yearPlan ? (
                <>
                  <h3>{yearPlan.title}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{yearPlan.focus}</p>
                  <p>{yearPlan.notes}</p>
                </>
              ) : (
                <p className="muted">No year plan recorded.</p>
              )}
            </section>

            <section className="workspace-panel">
              <span className="eyebrow">THIS WEEK’S PRIORITIES</span>
              <h2>
                {display(weekRange[0])} – {display(weekRange[6])}
              </h2>
              <p className="muted">
                Keep weekly intentions achievable and use the daily planner for individual activities.
              </p>
              {canEdit ? (
                <form
                  key={'week:' + learnerId + ':' + weekStart + ':' + revision}
                  onSubmit={(event) => void save(event, 'week')}
                >
                  <fieldset disabled={busy}>
                    <label className="workspace-field">
                      <span>Weekly theme</span>
                      <input
                        name="title"
                        maxLength={120}
                        required
                        defaultValue={weekPlan?.title ?? 'Our learning focus'}
                      />
                    </label>
                    <label className="workspace-field">
                      <span>Weekly notes (optional)</span>
                      <textarea
                        name="focus"
                        rows={4}
                        maxLength={1500}
                        defaultValue={weekPlan?.focus ?? ''}
                        placeholder="Add a custom focus or reminder…"
                      />
                    </label>
                    <label className="workspace-field">
                      <span>Adaptations and supplies</span>
                      <textarea name="notes" rows={3} maxLength={1500} defaultValue={weekPlan?.notes ?? ''} />
                    </label>
                    <button type="submit" className="btn-primary">
                      {weekPlan ? 'Update weekly plan' : 'Save weekly plan'}
                    </button>
                  </fieldset>
                </form>
              ) : weekPlan ? (
                <>
                  <h3>{weekPlan.title}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{weekPlan.focus}</p>
                  <p>{weekPlan.notes}</p>
                </>
              ) : (
                <p className="muted">No weekly focus recorded.</p>
              )}
            </section>
          </div>

          </details>
        </>
      )}
    </div>
  );
}
