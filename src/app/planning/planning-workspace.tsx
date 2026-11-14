'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { competencies, type Competency } from '@/lib/curriculum/library';
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
};
type Day = { date: string; activities: number; minutes: number; completed_minutes: number };
type PlanningData = {
  year: { startDate: string; endDate: string };
  week: string[];
  periods: Period[];
  days: Day[];
};
type Props = { learners: Learner[]; canEdit: boolean; initialDate: string };

const stageKey = (stage: string) => {
  const match = stage.toLowerCase().match(/^class\s+(\d+)$/);
  if (!match) return 'early';
  const grade = Number(match[1]);
  if (grade <= 2) return 'class1-2';
  if (grade <= 5) return 'class3-5';
  if (grade <= 8) return 'class6-8';
  if (grade <= 10) return 'class9-10';
  return 'class11-12';
};

function CompetencyPicker({
  items,
  selected,
  onChange,
  label,
}: {
  items: Competency[];
  selected: string[];
  onChange: (ids: string[]) => void;
  label: string;
}) {
  const subjects = [...new Set(items.map((item) => item.subject))];
  return (
    <section className="plan-curriculum-picker">
      <div className="plan-picker-heading">
        <strong>{label}</strong>
        <span>{selected.length} selected</span>
      </div>
      <div className="plan-picker-scroll">
        {subjects.map((subject) => (
          <div className="plan-picker-subject" key={subject}>
            <h4>{subject}</h4>
            <div className="plan-picker-options">
              {items
                .filter((item) => item.subject === subject)
                .map((item) => {
                  const checked = selected.includes(item.id);
                  return (
                    <label
                      className={checked ? 'plan-competency-option is-checked' : 'plan-competency-option'}
                      key={item.id}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          onChange(
                            event.target.checked
                              ? [...selected, item.id]
                              : selected.filter((id) => id !== item.id),
                          )
                        }
                      />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.outcome}</small>
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const display = (date: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T12:00:00Z'),
  );

export default function PlanningWorkspace({ learners, canEdit, initialDate }: Props) {
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? '');
  const [date, setDate] = useState(initialDate);
  const [data, setData] = useState<PlanningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [competencySelections, setCompetencySelections] = useState<Record<string, string[]>>({});

  const selected = learners.find((l) => l.id === learnerId);
  const y = academicYear(date);
  const weekStart = mondayOf(date);
  const yearRange = yearDates(y);
  const weekRange = daysInWeek(date);
  const yearPlan = data?.periods.find((p) => p.kind === 'year' && p.start_date === yearRange.startDate);
  const weekPlan = data?.periods.find((p) => p.kind === 'week' && p.start_date === weekStart);
  const endpoint = '/api/planning';
  const availableCompetencies = competencies.filter((item) => item.stage === stageKey(selected?.stage ?? ''));
  const yearSelectionKey = 'year:' + learnerId + ':' + yearRange.startDate;
  const weekSelectionKey = 'week:' + learnerId + ':' + weekStart;
  const yearCompetencyIds = competencySelections[yearSelectionKey] ?? yearPlan?.competency_ids ?? [];
  const weekCompetencyIds = competencySelections[weekSelectionKey] ?? weekPlan?.competency_ids ?? [];
  const setYearCompetencyIds = (ids: string[]) =>
    setCompetencySelections((current) => ({ ...current, [yearSelectionKey]: ids }));
  const setWeekCompetencyIds = (ids: string[]) =>
    setCompetencySelections((current) => ({ ...current, [weekSelectionKey]: ids }));

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
  }, [load, learnerId]);

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
          competencyIds: kind === 'year' ? yearCompetencyIds : weekCompetencyIds,
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

  const daily = new Map(data?.days.map((day) => [day.date, day]) ?? []);
  const weekMinutes = weekRange.reduce((n, day) => n + (daily.get(day)?.minutes ?? 0), 0);
  const completedMinutes = weekRange.reduce((n, day) => n + (daily.get(day)?.completed_minutes ?? 0), 0);
  const weekPercent = weekMinutes > 0 ? Math.min(100, Math.round((completedMinutes / weekMinutes) * 100)) : 0;

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
                setLoading(true);
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
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">SEVEN-DAY OVERVIEW</span>
                <h2 style={{ margin: '4px 0 0' }}>From intentions to daily learning</h2>
              </div>
              <span className="pill">{completedMinutes} / {weekMinutes} min completed · {weekPercent}%</span>
            </div>
            <p className="muted" style={{ marginTop: 0 }}>
              Recorded activities across the week — not inferred achievements. One shared 60-minute family rhythm can span multiple children.
            </p>
            <div className="week-strip-grid">
              {weekRange.map((day) => {
                const summary = daily.get(day);
                const dayName = new Intl.DateTimeFormat('en-IN', {
                  weekday: 'short',
                  timeZone: 'UTC',
                }).format(new Date(day + 'T12:00:00Z'));
                const planned = summary?.minutes ?? 0;
                const done = summary?.completed_minutes ?? 0;
                const dayPct = planned > 0 ? Math.min(100, Math.round((done / planned) * 100)) : 0;
                const isToday = day === initialDate;
                return (
                  <article
                    className={isToday ? 'week-day-card is-today' : 'week-day-card'}
                    key={day}
                  >
                    <div className="week-day-top">
                      <span className="eyebrow">{dayName}</span>
                      {isToday && <span className="today-dot">Today</span>}
                    </div>
                    <strong className="week-day-date">{display(day)}</strong>
                    <p className="week-day-count">{summary?.activities ?? 0} {(summary?.activities ?? 0) === 1 ? 'activity' : 'activities'}</p>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${dayPct}%` }} />
                    </div>
                    <small className="week-day-mins">{done}/{planned} min</small>
                    <Link className="week-day-link" href={'/dashboard?date=' + encodeURIComponent(day)}>
                      Open day →
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

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
                    <CompetencyPicker
                      items={availableCompetencies}
                      selected={yearCompetencyIds}
                      onChange={setYearCompetencyIds}
                      label="Choose from this learner’s curriculum"
                    />
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
                    <CompetencyPicker
                      items={availableCompetencies}
                      selected={weekCompetencyIds}
                      onChange={(ids) => {
                        if (ids.length <= 2) setWeekCompetencyIds(ids);
                      }}
                      label="Choose this week’s priorities (up to two)"
                    />
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

          <section className="workspace-panel studio-connect-strip">
            <div>
              <span className="eyebrow">CURRICULUM CONNECTION</span>
              <h2 style={{ margin: '4px 0 6px' }}>Connect this plan to your curriculum</h2>
              <p className="muted" style={{ margin: 0 }}>
                Annual and weekly notes organise intentions without marking any goal mastered automatically. Explore the catalogue whenever you want new ideas.
              </p>
            </div>
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <Link className="hero-action-secondary" href="/curriculum">Competency catalogue →</Link>
              <Link className="hero-action-secondary" href="/learning-pathways">36-week pathways →</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
