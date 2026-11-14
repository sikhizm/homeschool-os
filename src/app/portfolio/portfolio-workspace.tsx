'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  evidenceKinds,
  observationLevels,
  portfolioSummary,
  type PortfolioEntry,
  type EvidenceKind,
  type ObservationLevel,
} from '@/lib/portfolio/model';

type Learner = { id: string; name: string; stage: string };
type Props = { learners: Learner[]; canEdit: boolean; today: string };

const AVATAR_TINTS = ['#DDEBFF', '#D9F1EA', '#EAE5FF', '#FCE9DD'] as const;

const labels: Record<EvidenceKind, string> = {
  baseline: 'Baseline snapshot',
  observation: 'Learning observation',
  work_sample: 'Work sample description',
  reflection: 'Family reflection',
};
const shortLabels: Record<EvidenceKind, string> = {
  baseline: 'Baseline',
  observation: 'Observation',
  work_sample: 'Work sample',
  reflection: 'Reflection',
};
const levels: Record<ObservationLevel, string> = {
  not_tried: 'Not yet tried',
  with_support: 'With support',
  independent: 'Independently observed',
  not_applicable: 'Not applicable',
};
const levelBadgeClass: Record<ObservationLevel, string> = {
  not_tried: 'verify-badge pending',
  with_support: 'verify-badge approved',
  independent: 'verify-badge verified',
  not_applicable: 'verify-badge mapping-pending',
};

type Draft = {
  kind: EvidenceKind;
  level: ObservationLevel;
  observedOn: string;
  area: string;
  title: string;
  details: string;
  nextStep: string;
};

const initial = (today: string): Draft => ({
  kind: 'observation',
  level: 'not_tried',
  observedOn: today,
  area: '',
  title: '',
  details: '',
  nextStep: '',
});

export default function PortfolioWorkspace({ learners, canEdit, today }: Props) {
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? '');
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => initial(today));
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const endpoint = `/api/learners/${encodeURIComponent(learnerId)}/portfolio`;

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!learnerId) return;
      const response = await fetch(`/api/learners/${encodeURIComponent(learnerId)}/portfolio`, {
        cache: 'no-store',
        signal,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Portfolio unavailable.');
      return body.entries as PortfolioEntry[];
    },
    [learnerId],
  );

  useEffect(() => {
    if (!learnerId) return;
    const controller = new AbortController();
    refresh(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setEntries(data ?? []);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setEntries([]);
          setError(e instanceof Error ? e.message : 'Portfolio unavailable.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [learnerId, refresh]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function reset() {
    setEditing(null);
    setDraft(initial(today));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editing ? 'update' : 'create',
          ...(editing ? { id: editing } : {}),
          ...draft,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to save observation.');
      const data = await refresh();
      setEntries(data ?? []);
      reset();
      setNotice('Observation saved privately.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!canEdit || busy || !window.confirm('Delete this portfolio entry permanently?')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to delete.');
      const data = await refresh();
      setEntries(data ?? []);
      if (editing === id) reset();
      setNotice('Entry deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete.');
    } finally {
      setBusy(false);
    }
  }

  function edit(entry: PortfolioEntry) {
    setEditing(entry.id);
    setDraft({
      kind: entry.kind,
      level: entry.level,
      observedOn: entry.observed_on,
      area: entry.area,
      title: entry.title,
      details: entry.details,
      nextStep: entry.next_step,
    });
    setError('');
    setNotice('Editing a saved observation.');
  }

  if (!learners.length)
    return (
      <section className="workspace-panel workspace-empty">
        <h3>Add a learner to begin</h3>
        <p>
          No personal learning data is required in the lesson library. Add a private learner profile when you are ready to maintain a portfolio.
        </p>
        <Link className="btn-primary" href="/learners">
          Open Learners →
        </Link>
      </section>
    );

  const summary = portfolioSummary(entries);
  const visible = entries.filter((x) => filter === 'all' || x.kind === filter);
  const activeLearner = learners.find((l) => l.id === learnerId);

  return (
    <div className="portfolio-workspace studio-stack">
      <section className="workspace-panel portfolio-controls studio-control-bar">
        <div className="panel-heading" style={{ marginBottom: 14 }}>
          <div>
            <span className="eyebrow">PRIVATE FAMILY RECORDS</span>
            <h2 style={{ margin: '4px 0 0' }}>
              {activeLearner ? `${activeLearner.name}’s portfolio` : 'Choose a learner'}
            </h2>
          </div>
          {activeLearner && <span className="pill">{activeLearner.stage}</span>}
        </div>

        {learners.length > 1 && (
          <div className="learner-switcher" role="group" aria-label="Choose learner portfolio" style={{ marginBottom: 14 }}>
            {learners.map((l, idx) => (
              <button
                key={l.id}
                type="button"
                className={l.id === learnerId ? 'learner-pill is-active' : 'learner-pill'}
                aria-pressed={l.id === learnerId}
                onClick={() => {
                  setLearnerId(l.id);
                  setEntries([]);
                  setLoading(true);
                  setError('');
                  setNotice('');
                  reset();
                }}
              >
                <span
                  className="learner-avatar"
                  style={{ background: AVATAR_TINTS[idx % AVATAR_TINTS.length] }}
                  aria-hidden="true"
                >
                  {l.name.slice(0, 1).toUpperCase()}
                </span>
                <span>
                  {l.name} · <small style={{ fontWeight: 600, opacity: 0.8 }}>{l.stage}</small>
                </span>
              </button>
            ))}
          </div>
        )}

        <label className="workspace-field" style={{ maxWidth: 420, marginBottom: 0 }}>
          <span>Private learner portfolio</span>
          <select
            value={learnerId}
            onChange={(e) => {
              setLearnerId(e.target.value);
              setEntries([]);
              setLoading(true);
              setError('');
              setNotice('');
              reset();
            }}
          >
            {learners.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · {l.stage}
              </option>
            ))}
          </select>
        </label>
        <p className="muted" style={{ margin: '12px 0 0', fontSize: 13 }}>
          Only your family can view these entries. Portfolio notes never alter Goal percentages or mark lessons complete automatically.
        </p>
      </section>

      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {(loading || busy || notice) && (
        <p role="status" aria-live="polite" className={notice ? 'recorded-note' : 'muted'} style={{ margin: 0 }}>
          {loading ? 'Loading private observations…' : busy ? 'Saving…' : notice}
        </p>
      )}

      {!loading && (
        <div className="metric-grid portfolio-metrics">
          <div>
            <strong>{summary.count}</strong>
            <span>Saved observations</span>
          </div>
          <div>
            <strong>{summary.withSupport}</strong>
            <span>Observed with support</span>
          </div>
          <div>
            <strong>{summary.independent}</strong>
            <span>Observed independently</span>
          </div>
        </div>
      )}

      <div className="portfolio-layout">
        {canEdit && (
          <section className="workspace-panel portfolio-editor">
            <span className="eyebrow">{editing ? 'EDITING RECORD' : 'NEW OBSERVATION'}</span>
            <h2 style={{ margin: '4px 0 8px' }}>{editing ? 'Edit observation' : 'Record an observation'}</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Describe what you actually saw. If a task has not been tried yet, select “Not yet tried” rather than assuming ability.
            </p>
            <form onSubmit={(e) => void save(e)} className="portfolio-form">
              <fieldset disabled={busy} className="portfolio-fieldset">
                <div className="portfolio-form-pair">
                  <label className="workspace-field">
                    <span>Observation date</span>
                    <input
                      type="date"
                      required
                      min="2000-01-01"
                      max="2100-12-31"
                      value={draft.observedOn}
                      onChange={(e) => update('observedOn', e.target.value)}
                    />
                  </label>
                  <label className="workspace-field">
                    <span>Evidence type</span>
                    <select value={draft.kind} onChange={(e) => update('kind', e.target.value as EvidenceKind)}>
                      {evidenceKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {labels[kind]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="portfolio-form-pair">
                  <label className="workspace-field">
                    <span>Area or subject</span>
                    <input
                      required
                      maxLength={90}
                      value={draft.area}
                      onChange={(e) => update('area', e.target.value)}
                      placeholder="e.g. Fractions, oral storytelling"
                    />
                  </label>
                  <label className="workspace-field">
                    <span>Support observed</span>
                    <select value={draft.level} onChange={(e) => update('level', e.target.value as ObservationLevel)}>
                      {observationLevels.map((level) => (
                        <option key={level} value={level}>
                          {levels[level]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="workspace-field">
                  <span>Entry title</span>
                  <input
                    required
                    maxLength={180}
                    value={draft.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Compared one-half and two-quarters"
                  />
                </label>
                <label className="workspace-field">
                  <span>What actually happened?</span>
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={draft.details}
                    onChange={(e) => update('details', e.target.value)}
                    placeholder="Describe the task and what the learner did. Avoid grades, labels and assumptions."
                  />
                </label>
                <label className="workspace-field">
                  <span>Next gentle step (optional)</span>
                  <textarea
                    rows={2}
                    maxLength={750}
                    value={draft.nextStep}
                    onChange={(e) => update('nextStep', e.target.value)}
                    placeholder="A small activity to repeat, extend or adapt"
                  />
                </label>
                <div className="portfolio-form-actions">
                  <button type="submit" className="btn-primary">
                    {editing ? 'Save edits' : 'Save observation'}
                  </button>
                  {editing && (
                    <button type="button" className="btn-secondary" onClick={reset}>
                      Cancel editing
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
          </section>
        )}

        <section className="workspace-panel portfolio-history">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CHRONOLOGICAL RECORD</span>
              <h2 style={{ margin: '4px 0 0' }}>Portfolio timeline</h2>
            </div>
            <span className="pill">{visible.length} shown</span>
          </div>

          <div className="portfolio-filter-chips" role="group" aria-label="Filter by evidence type">
            <button
              type="button"
              className={filter === 'all' ? 'library-chip is-selected' : 'library-chip'}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All entries
            </button>
            {evidenceKinds.map((kind) => (
              <button
                key={kind}
                type="button"
                className={filter === kind ? 'library-chip is-selected' : 'library-chip'}
                aria-pressed={filter === kind}
                onClick={() => setFilter(kind)}
              >
                {shortLabels[kind]}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="muted">Opening portfolio…</p>
          ) : visible.length === 0 ? (
            <div className="workspace-empty">
              <h3>No entries in this view</h3>
              <p>Begin with a real, short observation after a learner completes an activity. A blank portfolio is completely normal.</p>
            </div>
          ) : (
            <ol className="portfolio-timeline">
              {visible.map((entry) => (
                <li key={entry.id} className="portfolio-record">
                  <div className="portfolio-record-header">
                    <span className="eyebrow">
                      {labels[entry.kind]} · {entry.observed_on}
                    </span>
                    <span className={levelBadgeClass[entry.level]}>{levels[entry.level]}</span>
                  </div>
                  <h3>{entry.title}</h3>
                  <p className="portfolio-area-pill">
                    <span>{entry.area}</span>
                  </p>
                  <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{entry.details}</p>
                  {entry.next_step && (
                    <p className="portfolio-next-callout">
                      <strong>Next step:</strong> {entry.next_step}
                    </p>
                  )}
                  {canEdit && (
                    <div className="portfolio-entry-actions">
                      <button type="button" className="btn-secondary" disabled={busy} onClick={() => edit(entry)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger-soft"
                        disabled={busy}
                        onClick={() => void remove(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
          {entries.length >= 300 && (
            <p className="info-banner" style={{ marginTop: 14 }}>
              Showing the 300 most recent entries. Older records are retained safely.
            </p>
          )}
        </section>
      </div>

      <section className="workspace-panel studio-connect-strip">
        <div>
          <span className="eyebrow">HOW PORTFOLIOS WORK</span>
          <h2 style={{ margin: '4px 0 6px' }}>Baseline → observation → reflection</h2>
          <p className="muted" style={{ margin: 0 }}>
            Start with a small baseline activity, describe actual work and support, then jot down a reflection. An “independent” observation documents that specific moment, not permanent mastery.
          </p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          <Link className="hero-action-secondary" href="/november-pilot">
            Baseline prompts →
          </Link>
          <Link className="hero-action-secondary" href="/lessons">
            Activities &amp; printables →
          </Link>
        </div>
      </section>
    </div>
  );
}
