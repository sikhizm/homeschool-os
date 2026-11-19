'use client';

import Link from 'next/link';
import ChapterPlanMenu from '@/components/chapter-plan-menu';
import { useEffect, useState } from 'react';
import {chapterDisplayStatuses, type ChapterDisplayStatus} from '@/lib/ncert/chapter-status';

type Chapter = { id: string; title: string; subject: string; status: ChapterDisplayStatus; assessed: boolean };
type WeeklyPlan = { chapters: Chapter[] };

export default function WeeklyLearnerLessons({ learnerId, canEdit }: { learnerId: string; canEdit: boolean }) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
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
    {chaptersBySubject.size > 0 && <div className="weekly-subjects">
      {Array.from(chaptersBySubject, ([subject, chapters]) => <section className="weekly-subject" key={subject}>
        <h4>{subject}</h4>
        <ul>
          {chapters.map((chapter) => {
              const href = '/ncert-books/chapter/' + encodeURIComponent(chapter.id);
              const statusHref = href + '?' + new URLSearchParams({ learner: learnerId }) + '#chapter-status';
              return <li key={chapter.id} className="weekly-chapter-row">
                <div className="weekly-chapter-heading">
                  <div className="weekly-chapter-title">
                    <Link href={href}>{chapter.title}</Link>
                    {(chapter.status !== 'pending' || chapter.assessed) && <div className="coach-task-tags">
                      {chapter.status !== 'pending' && <span>{chapterDisplayStatuses.find(item => item.id === chapter.status)?.label}</span>}
                      {chapter.assessed && <span>Test Attempted</span>}
                    </div>}
                  </div>
                  {canEdit && <div className="coach-actions weekly-chapter-actions">
                    <ChapterPlanMenu inline chapterId={chapter.id} title={chapter.title} learnerId={learnerId} />
                    <Link className="btn-secondary" href={statusHref} aria-label={`Update status for ${chapter.title}`}>Update status</Link>
                  </div>}
                </div>
              </li>;
          })}
        </ul>
      </section>)}
    </div>}
  </div>;
}
