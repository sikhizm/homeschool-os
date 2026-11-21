'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import styles from './reading-activity.module.css';

type ReadingEntry = { id: string; date: string; title: string; subject?: string };
type Props = {
  entries: ReadingEntry[];
  learnerId: string;
  unavailable: boolean;
  timing: { onTime: number; planned: number; late: number } | null;
};

const dateLabel = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export default function ReadingActivity({ entries, learnerId, unavailable, timing }: Props) {
  const [showOlder, setShowOlder] = useState(false);
  const headingId = useId();
  const timelineId = useId();
  const byDate = new Map<string, ReadingEntry[]>();
  for (const entry of entries) {
    const group = byDate.get(entry.date);
    if (group) group.push(entry);
    else byDate.set(entry.date, [entry]);
  }

  return <section className={`workspace-panel report-card-section ${styles.panel}`} aria-labelledby={headingId}>
    <h2 id={headingId}>Reading activity</h2>
    <p className="muted">
      {entries.length} recorded
      {timing && ` · ${timing.onTime} of ${timing.planned} scheduled readings on time`}
      {timing && timing.late > 0 && ` · ${timing.late} read after the due date`}
    </p>
    {unavailable ? <p className="muted" role="status">Chapter reading records are unavailable.</p>
      : entries.length ? <>
        <div id={timelineId} className={styles.feed} role="region" tabIndex={0} aria-labelledby={headingId}>
          <ol className={styles.timeline} data-expanded={showOlder}>
            {Array.from(byDate, ([date, group], index) => <li key={date} className={index >= 3 ? styles.older : undefined}>
              <time dateTime={date}>{dateLabel.format(new Date(date + 'T00:00:00Z'))}</time>
              <ul className={styles.events}>
                {group.map(entry => <li key={entry.id}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2 3-2 6-2.5 10-2V4c-4-.5-7 0-10 2v15" />
                  </svg>
                  <div>
                    <Link href={`/ncert-books/chapter/${encodeURIComponent(entry.id)}?learner=${encodeURIComponent(learnerId)}#chapter-reading`}>{entry.title}</Link>
                    {entry.subject && <span className={styles.subject}>{entry.subject}</span>}
                  </div>
                </li>)}
              </ul>
            </li>)}
          </ol>
        </div>
        {byDate.size > 3 && <button type="button" className={`btn-secondary ${styles.olderButton}`}
          aria-expanded={showOlder} aria-controls={timelineId} onClick={() => setShowOlder(!showOlder)}>
          {showOlder ? 'Show recent activity' : 'Show older activity'}
        </button>}
      </> : <p className="muted">No chapters marked read in this reporting window.</p>}
  </section>;
}
