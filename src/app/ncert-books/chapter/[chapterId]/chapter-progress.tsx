'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {chapterStatuses, normalizeChapterStatus, type ChapterStatus} from '@/lib/ncert/chapter-status';

type Learner = {learner_id: string; display_name: string; stage: string; status: string | null; parent_note: string | null; role: string};

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
  const status = normalizeChapterStatus(learner?.status);
  const canEdit = learner?.role === 'owner';

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/ncert-chapters/${encodeURIComponent(chapterId)}/progress`, {cache: 'no-store', signal: controller.signal})
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
    return () => controller.abort();
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
        {learner.display_name} · {chapterStatuses.find(item => item.id === status)?.label}
      </a>
    </div>}
    {children}
    <section className="workspace-panel chapter-status-panel" id="chapter-status" aria-labelledby="chapter-status-heading">
      <h2 id="chapter-status-heading">Chapter status</h2>
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
            disabled={busy || !canEdit} aria-pressed={status === item.id} onClick={() => void save(item.id)}>
            <strong>{status === item.id && <span aria-hidden="true">✓ </span>}{item.label}</strong>
            <small>{item.detail}</small>
          </button>)}
        </div>
        <label className="workspace-field">
          <span>Parent note</span>
          <textarea value={note} maxLength={1000} disabled={busy || !canEdit} onChange={event => setNote(event.target.value)} />
        </label>
        {canEdit && <button className="btn-secondary" type="button" disabled={busy || note === (learner?.parent_note ?? '')}
          onClick={() => void save(status, true)}>Save note</button>}
      </>}
      <p role="status" className="muted">{message}</p>
    </section>
  </>;
}
