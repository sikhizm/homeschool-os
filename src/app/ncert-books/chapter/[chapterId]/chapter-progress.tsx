'use client';

import styles from './chapter-status.module.css';
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
    <section className={`workspace-panel ${styles.panel}`} id="chapter-status" aria-labelledby="chapter-status-heading">
      <h2 id="chapter-status-heading">Chapter status</h2>
      {learners.length > 0 && <>
        <div className={styles.selectors}>
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
          <label className="workspace-field">
            <span>Status</span>
            <select value={status} disabled={busy || !canEdit || learner?.finished}
              onChange={event => void save(normalizeChapterStatus(event.target.value))}>
              {chapterStatuses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              {learner?.finished && <option value={finishedChapterStatus.id}>{finishedChapterStatus.label}</option>}
            </select>
          </label>
        </div>
        <p className={styles.hint}>{learner?.finished && (
          <span className="chapter-status-badge" data-status="finished">{finishedChapterStatus.label}</span>
        )} Finished is awarded for a chapter test score of 60% or higher.</p>
        <div className={styles.note}>
          <label className="workspace-field">
            <span>Parent note</span>
            <textarea rows={2} value={note} maxLength={1000} disabled={busy || !canEdit} onChange={event => setNote(event.target.value)} />
          </label>
          {canEdit && <button className="btn-secondary" type="button" disabled={busy || note === (learner?.parent_note ?? '')}
            onClick={() => void save(manualStatus, true)}>Save note</button>}
        </div>
      </>}
      <div role="status" className={styles.feedback}>{message}</div>
    </section>
  </>;
}
