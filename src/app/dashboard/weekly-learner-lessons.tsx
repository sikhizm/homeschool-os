'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const labels = {
  understood: 'Understanding recorded',
  practice: 'Need More Practice',
  done: 'Chapter Read',
};
type Outcome = keyof typeof labels;
type Chapter = { id: string; title: string; subject: string; outcome: Outcome | null; assessed: boolean; addedToday: boolean };
type WeeklyPlan = { chapters: Chapter[]; canRecord: boolean; canAdd: boolean };

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

  async function save(chapterId: string, outcome?: Outcome) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/weekly-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcome ? { learnerId, chapterId, outcome } : { learnerId, chapterId, action: 'add-today' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPlan((previous) => previous && {
        ...previous,
        chapters: previous.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, ...(outcome ? { outcome } : { addedToday: true }) } : chapter),
      });
      if (outcome) setOpen('');
      window.dispatchEvent(new Event('daily-plan-updated'));
      setMessage(outcome ? 'Outcome recorded.' : 'Chapter added to today’s plan.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save the chapter update.');
    } finally {
      setBusy(false);
    }
  }

  const chaptersBySubject = new Map<string, Chapter[]>();
  for (const chapter of plan?.chapters ?? []) {
    const chapters = chaptersBySubject.get(chapter.subject);
    if (chapters) chapters.push(chapter);
    else chaptersBySubject.set(chapter.subject, [chapter]);
  }

  return <div className="coach-content weekly-chapters">
    <h3>This Week’s Chapters</h3>
    {!plan && !message && <p>Loading weekly chapters…</p>}
    {message && <p role="status">{message}</p>}
    {plan && !plan.chapters.length && <p>No chapters selected for this week. <Link href="/planning">Open Learning Plan</Link></p>}
    {plan?.chapters.length && canEdit && !plan.canRecord ? <p>Apply the weekly chapter outcomes migration to record Chapter Read or Need More Practice.</p> : null}
    {plan?.chapters.length && canEdit && !plan.canAdd ? <p>Apply the daily plans migration to add chapters to today’s plan.</p> : null}
    {chaptersBySubject.size > 0 && <div className="weekly-subjects">
      {Array.from(chaptersBySubject, ([subject, chapters]) => <section className="weekly-subject" key={subject}>
        <h4>{subject}</h4>
        <ul>
          {chapters.map((chapter) => {
              const href = '/ncert-books/chapter/' + encodeURIComponent(chapter.id);
              const testHref = href + '?' + new URLSearchParams({ testLearner: learnerId }) + '#chapter-tests';
              return <li key={chapter.id} className="weekly-chapter-row">
                <div className="weekly-chapter-heading">
                  <div className="weekly-chapter-title">
                    <Link href={href}>{chapter.title}</Link>
                    {(chapter.outcome || chapter.assessed) && <div className="coach-task-tags">
                      {chapter.outcome && <span>{labels[chapter.outcome]}</span>}
                      {chapter.assessed && <span>Test Attempted</span>}
                    </div>}
                  </div>
                  {canEdit && <div className="coach-actions weekly-chapter-actions">
                    <button type="button" className="btn-secondary weekly-chapter-add"
                      aria-label={chapter.addedToday ? `${chapter.title} is in today’s plan` : `Add ${chapter.title} to today’s plan`}
                      disabled={busy || chapter.addedToday || !plan?.canAdd} onClick={() => void save(chapter.id)}>
                      <span aria-hidden="true">{chapter.addedToday ? '✓' : '+'}</span>
                    </button>
                    <button type="button" className="coach-revise" aria-label={`Check & record for ${chapter.title}`} aria-expanded={open === chapter.id}
                      disabled={busy} onClick={() => setOpen(open === chapter.id ? '' : chapter.id)}>Check &amp; record</button>
                  </div>}
                </div>
                {open === chapter.id && <div className="lesson-check">
                  <div className="coach-actions">
                    <button type="button" className="btn-secondary" disabled={busy || !plan?.canRecord}
                      onClick={() => void save(chapter.id, 'done')}>Chapter Read</button>
                    <Link className="btn-secondary" href={testHref}>Test Attempted</Link>
                    <button type="button" className="btn-secondary" disabled={busy || !plan?.canRecord}
                      onClick={() => void save(chapter.id, 'practice')}>Need More Practice</button>
                  <button type="button" className="btn-secondary" disabled={busy} onClick={() => setOpen('')}>Close</button>
                  </div>
                </div>}
              </li>;
          })}
        </ul>
      </section>)}
    </div>}
  </div>;
}
