'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {activityLabels, chapterActivityHref, type ChapterPlanItem} from '@/lib/planning/chapter-activities';

type Plan = {ready: boolean; canEdit: boolean; items: ChapterPlanItem[]};

export default function WeeklyChapterActivities() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/chapter-plan', {cache: 'no-store', signal: controller.signal});
        if (!response.ok) throw new Error();
        setPlan(await response.json());
      } catch {
        if (!controller.signal.aborted) setMessage('Could not load planned chapter activities.');
      }
    }
    void load();
    window.addEventListener('daily-plan-updated', load);
    return () => {controller.abort(); window.removeEventListener('daily-plan-updated', load);};
  }, []);

  async function addToday({learnerId, chapterId, activity}: ChapterPlanItem) {
    setBusy(true);
    try {
      const response = await fetch('/api/chapter-plan', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learnerId, chapterId, activity, period: 'day'})});
      if (!response.ok) throw new Error();
      setMessage('Added to today’s plan.');
      window.dispatchEvent(new Event('daily-plan-updated'));
    } catch {
      setMessage('Could not add the activity to today.');
    } finally {
      setBusy(false);
    }
  }

  const items = plan?.items.filter(item => item.period === 'week') ?? [];
  return <section className="workspace-panel" id="weekly-chapter-activities">
    <h2>This week’s chapter activities</h2>
    {message && <p role="status">{message}</p>}
    {!plan && !message && <p className="muted">Loading weekly activities…</p>}
    {plan && !plan.ready && <p className="muted">Apply the chapter activities migration to save weekly activities.</p>}
    {plan?.ready && !items.length && <p className="muted">No chapter activities planned for this week. <Link href="/learn/path">Open Learning Path</Link></p>}
    <ul className="weekly-chapter-activity-list">
      {items.map(item => <li key={`${item.learnerId}:${item.chapterId}:${item.activity}`}>
        <Link href={chapterActivityHref(item.chapterId, item.learnerId, item.activity)}>{item.title} · {activityLabels[item.activity]}</Link>
        <span className="muted">{item.learnerName}</span>
        <span>{item.done ? 'Done' : 'Pending'}</span>
        {plan?.canEdit && <button className="btn-secondary" type="button" disabled={busy || item.inToday}
          onClick={() => void addToday(item)}>{item.inToday ? 'In today’s plan' : 'Add to Today'}</button>}
      </li>)}
    </ul>
  </section>;
}
