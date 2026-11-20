'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {chapterDisplayStatuses, chapterStatuses, finishedChapterStatus, normalizeChapterStatus, type ChapterStatus} from '@/lib/ncert/chapter-status';

type Learner = {learner_id: string; display_name: string; stage: string; status: string | null; parent_note: string | null; role: string; finished?: boolean};

export default function ChapterProgress({chapterId, initialLearnerId, children}: {
  chapterId: string;
  initialLearnerId?: string;
  children: ReactNode;
}) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const learner = learners.find(item => item.learner_id === selected);
  const manualStatus = normalizeChapterStatus(learner?.status);
  const status = learner?.finished ? finishedChapterStatus.id : manualStatus;
  const canEdit = learner?.role === 'owner';

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = `/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`;
    fetch(endpoint, {cache: 'no-store', signal: controller.signal})
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        const options = body.learners as Learner[];
        const current = options.find(item => item.learner_id === initialLearnerId) ?? options[0];
        setLearners(options);
        setSelected(current?.learner_id ?? '');
        setNote(current?.parent_note ?? '');
        if (!current) setMessage('Add a learner to record chapter status.');
      })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    async function refreshFinished() {
      try {
        const response = await fetch(endpoint, {cache: 'no-store', signal: controller.signal});
        if (!response.ok) throw new Error('Unable to refresh chapter status.');
        const body = await response.json() as {learners: Learner[]};
        const passed = new Set(body.learners.filter(item => item.finished).map(item => item.learner_id));
        setLearners(items => items.map(item => ({...item, finished: passed.has(item.learner_id)})));
      } catch {
        if (!controller.signal.aborted) setMessage('Reload the page to see updated chapter status.');
      }
    }
    window.addEventListener('chapter-tests-updated', refreshFinished);
    return () => {
      controller.abort();
      window.removeEventListener('chapter-tests-updated', refreshFinished);
    };
  }, [chapterId, initialLearnerId]);

  async function save(next: ChapterStatus, noteOnly = false) {
    if (!canEdit || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learnerId: selected, status: next, note, noteOnly}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setLearners(items => items.map(item => item.learner_id === selected ? {...item, status: result.status, parent_note: note} : item));
      setMessage('Chapter status saved.');
      window.dispatchEvent(new Event('daily-plan-updated'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save chapter status.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    {learner && <div className="chapter-status-sticky">
      <a className="chapter-status-badge" data-status={status} href="#chapter-status">
        {learner.display_name} · {chapterDisplayStatuses.find(item => item.id === status)?.label}
      </a>
    </div>}
    {children}
    <section className="workspace-panel chapter-status-panel" id="chapter-status" aria-labelledby="chapter-status-heading">
      <div className="chapter-status-heading">
        <span className="chapter-status-heading-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M8 10l1.3 1.3 2-2M13 10h3M8 16l1.3 1.3 2-2M13 16h3"/></svg>
        </span>
        <div>
          <h2 id="chapter-status-heading">Chapter status</h2>
          <p className="muted">Track reading and learning progress for this chapter.</p>
        </div>
      </div>
      {learners.length > 0 && <>
        <label className="workspace-field">
          <span>Learner</span>
          <select value={selected} disabled={busy} onChange={event => {
            const next = learners.find(item => item.learner_id === event.target.value);
            setSelected(event.target.value);
            setNote(next?.parent_note ?? '');
            setMessage('');
          }}>
            {learners.map(item => <option key={item.learner_id} value={item.learner_id}>{item.display_name} · {item.stage}</option>)}
          </select>
        </label>
        <div className="chapter-status-options" role="group" aria-label="Choose one chapter status">
          {chapterStatuses.map(item => <button key={item.id} type="button" data-status={item.id}
            disabled={busy || !canEdit || learner?.finished} aria-pressed={status === item.id} onClick={() => void save(item.id)}>
            <strong><span className="chapter-status-option-icon" aria-hidden="true">{item.id==='read'?'✓':item.id==='revised'?'↻':item.id==='needs_practice'?'◎':'○'}</span>{status === item.id && <span aria-hidden="true">✓ </span>}{item.label}</strong>
            <small>{item.detail}</small>
          </button>)}
          <div className="chapter-status-auto" data-status="finished" aria-current={learner?.finished ? 'true' : undefined}>
            <strong><span className="chapter-status-option-icon" aria-hidden="true">★</span>{learner?.finished && <span aria-hidden="true">✓ </span>}{finishedChapterStatus.label}</strong>
            <small>{finishedChapterStatus.detail}</small>
          </div>
        </div>
        <label className="workspace-field">
          <span>Parent note</span>
          <textarea value={note} maxLength={1000} disabled={busy || !canEdit} onChange={event => setNote(event.target.value)} />
        </label>
        {canEdit && <button className="btn-secondary" type="button" disabled={busy || note === (learner?.parent_note ?? '')}
          onClick={() => void save(manualStatus, true)}>Save note</button>}
      </>}
      <p role="status" className="muted">{message}</p>
    </section>
  </>;
}
