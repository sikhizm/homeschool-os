'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const labels = {
  understood: 'Yes, understood',
  practice: 'Needs more practice',
  done: 'Done, not assessed',
};
type Outcome = keyof typeof labels;
type Chapter = { id: string; title: string; subject: string; outcome: Outcome | null; assessed: boolean };
type WeeklyPlan = { chapters: Chapter[]; canRecord: boolean };

export default function WeeklyLearnerLessons({ learnerId, canEdit }: { learnerId: string; canEdit: boolean }) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [open, setOpen] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/weekly-lessons?' + new URLSearchParams({ learner: learnerId }), { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setPlan(body);
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [learnerId]);

  async function record(chapterId: string, outcome: Outcome) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/weekly-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId, chapterId, outcome }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPlan((previous) => previous && {
        ...previous,
        chapters: previous.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, outcome } : chapter),
      });
      setOpen('');
      setMessage('Outcome recorded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to record the outcome.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="coach-content">
    <h3>This Week’s Chapters</h3>
    {!plan && !message && <p>Loading weekly chapters…</p>}
    {message && <p role="status">{message}</p>}
    {plan && !plan.chapters.length && <p>No chapters selected for this week. <Link href="/planning">Open Learning Plan</Link></p>}
    {plan?.chapters.length && canEdit && !plan.canRecord ? <p>Apply the weekly chapter outcomes migration to record understanding.</p> : null}
    <div className="coach-task-list">
      {plan?.chapters.map((chapter) => {
        const href = '/ncert-books/chapter/' + encodeURIComponent(chapter.id);
        const testHref = href + '?' + new URLSearchParams({ testLearner: learnerId }) + '#chapter-tests';
        return <article key={chapter.id} className="coach-task">
          <div className="coach-task-main">
            <div className="coach-task-tags"><span>{chapter.subject}</span>
              {chapter.outcome && (!chapter.assessed || chapter.outcome !== 'done') && <span>{labels[chapter.outcome]}</span>}
              {chapter.assessed && <span>Assessed</span>}
            </div>
            <h4>{chapter.title}</h4>
            <div className="coach-actions">
              <Link className="btn-secondary" href={href}>Open chapter</Link>
              {canEdit && <button type="button" className="coach-revise" aria-expanded={open === chapter.id}
                disabled={busy} onClick={() => setOpen(open === chapter.id ? '' : chapter.id)}>Check understanding &amp; record</button>}
            </div>
            {open === chapter.id && <div className="lesson-check">
              <div className="coach-actions">
                {(Object.keys(labels) as Outcome[]).map((outcome) =>
                  <button type="button" key={outcome} className="btn-secondary" disabled={busy || !plan?.canRecord}
                    onClick={() => void record(chapter.id, outcome)}>{labels[outcome]}</button>)}
                <Link className="btn-secondary" href={testHref}>Assessed</Link>
              </div>
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => setOpen('')}>Close</button>
            </div>}
          </div>
        </article>;
      })}
    </div>
  </div>;
}
