'use client';

import {useRouter} from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { NEEDS_PRACTICE_PERCENT, percentage, percentLabel, summarizeTests, type Attempt, type ScheduledTest } from '@/lib/chapter-tests/model';

type Learner = { id: string; name: string; role: string };
type Data = { learners: Learner[]; attempts: Array<Attempt & { learnerId: string }>; scheduled: ScheduledTest[] | null; today: string };
type Draft = { operation: string; target?: string; title?: string; date?: string; total?: number; obtained?: number; remarks?: string };

async function readTests(endpoint: string, signal?: AbortSignal): Promise<Data> {
  const response = await fetch(endpoint, { cache: 'no-store', signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error);
  return body;
}

export default function ChapterTests({ chapterId, initialLearnerId = '' }: { chapterId: string; initialLearnerId?: string }) {
  const router = useRouter();
  const endpoint = `/api/ncert-chapters/${encodeURIComponent(chapterId)}/tests`;
  const [data, setData] = useState<Data | null>(null);
  const [learnerId, setLearnerId] = useState(initialLearnerId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const learner = data?.learners.find(({ id }) => id === learnerId) ?? data?.learners[0];
  const scheduled = data?.scheduled?.filter(test => test.learnerId === learner?.id) ?? [];
  const summary = summarizeTests(data?.attempts.filter((attempt) => attempt.learnerId === learner?.id) ?? []);

  useEffect(() => {
    const controller = new AbortController();
    readTests(endpoint, controller.signal).then(setData).catch((error) => {
      if (!controller.signal.aborted) setMessage(error.message);
    });
    return () => controller.abort();
  }, [endpoint]);

  useEffect(() => {
    if (!data) return;
    const target = window.location.hash.slice(1);
    if (target.startsWith('scheduled-test-')) document.getElementById(target)?.scrollIntoView({ block: 'start' });
  }, [data]);

  async function mutate(values: Draft) {
    if (!learner || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId: learner.id, ...values }),
      });
      const body = await response.json();
      if (response.status === 409 || response.status === 404) setData(await readTests(endpoint));
      if (!response.ok) throw new Error(body.error);
      window.dispatchEvent(new Event('chapter-tests-updated'));
      window.dispatchEvent(new Event('daily-plan-updated'));
      router.refresh();
      setDraft(null);
      setData(await readTests(endpoint));
      setMessage(values.operation === 'schedule' || values.operation === 'reschedule' ? 'Test scheduled.' : values.operation === 'cancel_schedule' ? 'Scheduled test cancelled.' : 'Test history updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update test history.');
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const form = new FormData(event.currentTarget);
    void mutate({ ...draft, title: String(form.get('title')), date: String(form.get('date')),
      total: form.get('total') ? Number(form.get('total')) : undefined,
      obtained: form.has('obtained') && form.get('obtained') !== '' ? Number(form.get('obtained')) : undefined,
      remarks: String(form.get('remarks') ?? '') });
  }

  return (
    <section className="workspace-panel">
      <h2>Chapter Tests</h2>
      <p className="muted">Schedule a paper test or record marks after it’s taken.</p>
      {!data && !message && <p role="status">Loading chapter tests…</p>}
      {message && <p role="status">{message}</p>}
      {data && !learner && <p>No learner profiles are available.</p>}
      {learner && <>
        <label className="workspace-field">
          <span>Learner</span>
          <select value={learner.id} disabled={busy} onChange={(event) => {
            setLearnerId(event.target.value); setDraft(null); setMessage('');
          }}>
            {data?.learners.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        {summary.history.length ? <div className="metric-grid report-metrics">
          {[
            [summary.assessments.length, 'Assessments'], [summary.history.length, 'Attempts'],
            [percentLabel(summary.latest), 'Latest attempt'], [percentLabel(summary.best), 'Best score'],
            [percentLabel(summary.primaryAverage), 'Latest-attempt average'],
            [percentLabel(summary.allAttemptsAverage), 'All-attempt average'],
          ].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div> : <p className="muted">No tests recorded for this learner and chapter.</p>}
        {data?.scheduled === null && learner.role === 'owner' && <p className="muted">Test scheduling is unavailable until the database migration is applied.</p>}
        {learner.role === 'owner' && !draft && <div className="hero-actions">
          {data?.scheduled && <button type="button" className="btn-primary" disabled={busy}
            onClick={() => setDraft({ operation: 'schedule', title: 'Chapter test', date: data.today })}>Schedule test</button>}
          <button type="button" className="btn-secondary" disabled={busy}
            onClick={() => setDraft({ operation: summary.assessments.length ? 'new' : 'first' })}>Record a completed test</button>
        </div>}
        {scheduled.map(test => <article key={test.id} id={`scheduled-test-${test.id}`} className="portfolio-record" style={{ marginTop: 12 }}>
          <h3>{test.title}</h3>
          <p className="muted">{test.date < (data?.today ?? '') ? 'Overdue' : 'Scheduled'} · {test.date}
            {test.total !== null && ` · ${test.total} marks`}</p>
          {learner.role === 'owner' && <div className="hero-actions">
            <button type="button" className="btn-primary" disabled={busy || !!draft}
              onClick={() => setDraft({ operation: 'complete_schedule', target: test.id, title: test.title, date: data?.today, total: test.total ?? undefined })}>Enter marks</button>
            <button type="button" className="btn-secondary" disabled={busy || !!draft}
              onClick={() => setDraft({ operation: 'reschedule', target: test.id, title: test.title, date: test.date, total: test.total ?? undefined })}>Reschedule</button>
            <button type="button" className="btn-secondary" disabled={busy || !!draft}
              onClick={() => { if (window.confirm('Cancel this scheduled test?')) void mutate({ operation: 'cancel_schedule', target: test.id }); }}>Cancel test</button>
          </div>}
        </article>)}
        {draft && <form key={`${draft.operation}:${draft.target ?? ''}`} onSubmit={save}>
          <TestFields draft={draft} today={data?.today} busy={busy} cancel={() => setDraft(null)} />
        </form>}
        {summary.assessments.map(({ first, latest, attempts, improvement }) => (
          <article key={first.assessmentId} className="portfolio-record" style={{ marginTop: 12, overflowWrap: 'anywhere' }}>
            <h3>{first.title}</h3>
            {percentage(latest) < NEEDS_PRACTICE_PERCENT && <span className="pill">Latest attempt below {NEEDS_PRACTICE_PERCENT}%</span>}
            <p className="muted">First-to-latest change {improvement === null ? '—' : `${improvement > 0 ? '+' : ''}${Number(improvement.toFixed(2))} percentage points`}</p>
            {learner.role === 'owner' && <button type="button" className="btn-secondary" disabled={busy}
              onClick={() => setDraft({ operation: 'retest', target: first.assessmentId, title: first.title, total: latest.total })}>Add retest</button>}
            <ol>
              {attempts.map((attempt) => <li key={attempt.id}>
                <strong>Attempt {attempt.number} · {attempt.date} · {attempt.obtained}/{attempt.total} ({percentLabel(percentage(attempt))})</strong>
                {attempt.title !== first.title && <p>{attempt.title}</p>}
                {attempt.remarks && <p>{attempt.remarks}</p>}
                {learner.role === 'owner' && <div className="hero-actions" style={{ marginTop: 4 }}>
                  <button type="button" className="btn-secondary" disabled={busy}
                    onClick={() => setDraft({ ...attempt, operation: 'edit', target: attempt.id })}>Edit</button>
                  <button type="button" className="btn-secondary" disabled={busy || !!draft} onClick={() => {
                    const final = attempts.length === 1;
                    if (window.confirm(final ? 'Delete this attempt and its assessment?' : 'Delete this attempt?'))
                      void mutate({ operation: final ? 'delete_group' : 'delete', target: attempt.id });
                  }}>Delete</button>
                </div>}
              </li>)}
            </ol>
          </article>
        ))}
      </>}
    </section>
  );
}

function TestFields({ draft, today, busy, cancel }: { draft: Draft; today?: string; busy: boolean; cancel: () => void }) {
  const [total, setTotal] = useState(draft.total?.toString() ?? '');
  const [obtained, setObtained] = useState(draft.obtained?.toString() ?? '');
  const validScore = Number(total) > 0 && obtained !== '' && Number(obtained) >= 0 && Number(obtained) <= Number(total);
  const scheduling = draft.operation === 'schedule' || draft.operation === 'reschedule';
  const kind = ({ schedule: 'Schedule test', reschedule: 'Reschedule test', complete_schedule: 'Enter marks', first: 'First Test', new: 'New Assessment', retest: 'Retest', edit: 'Edit attempt' } as Record<string, string>)[draft.operation];
  return <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: '12px 0' }}>
    <legend>{kind}</legend>
    <label className="workspace-field"><span>Test title</span><input autoFocus name="title" defaultValue={draft.title} required maxLength={160} /></label>
    <label className="workspace-field"><span>Test date</span><input name="date" type="date" required min="2000-01-01" max="2100-12-31"
      defaultValue={draft.date ?? today} /></label>
    <div className="portfolio-form-pair">
      <label className="workspace-field"><span>{scheduling ? 'Total marks (optional)' : 'Total marks'}</span><input name="total" type="number" required={!scheduling} min="0.01" max="99999999.99" step="0.01"
        value={total} onChange={(event) => setTotal(event.target.value)} /></label>
      {!scheduling && <label className="workspace-field"><span>Obtained marks</span><input name="obtained" type="number" required min="0" max={total || undefined} step="0.01"
        value={obtained} onChange={(event) => setObtained(event.target.value)} /></label>}
    </div>
    {!scheduling && <><p aria-live="polite">Percentage {percentLabel(validScore ? percentage({ total: Number(total), obtained: Number(obtained) }) : null)}</p>
    <label className="workspace-field"><span>Parent remarks (optional)</span><textarea name="remarks" maxLength={2000} defaultValue={draft.remarks} /></label></>}
    <div className="hero-actions"><button className="btn-primary" type="submit">{scheduling ? 'Save schedule' : 'Save test'}</button>
      <button className="btn-secondary" type="button" onClick={cancel}>Cancel</button></div>
  </fieldset>;
}
