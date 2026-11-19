'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import ChapterPlanMenu from '@/components/chapter-plan-menu';
import {ncertChapterSlots, textbookById, isDefaultChapterSessionEligible} from '@/lib/ncert/textbooks';
import {activityLabels, chapterActivityHref, type ChapterPlanItem} from '@/lib/planning/chapter-activities';

type Scheduled = ChapterPlanItem & {startsOn: string};
type Plan = {ready: boolean; canEdit: boolean; items: Scheduled[]};
const catalogue = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));

export default function WeeklyChapterActivities({learnerId, date, weekIds, today}: {
  learnerId: string; date: string; weekIds: string[]; today: string;
}) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let controller: AbortController | undefined;
    async function load() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const params = new URLSearchParams({learnerId, date});
        const response = await fetch('/api/chapter-plan?' + params, {cache: 'no-store', signal: request.signal});
        if (!response.ok) throw new Error();
        const data: Plan = await response.json();
        if (!request.signal.aborted) setPlan(data);
      } catch {
        if (!request.signal.aborted) setNotice('Could not load planned chapter activities.');
      }
    }
    void load();
    window.addEventListener('daily-plan-updated', load);
    return () => {controller?.abort(); window.removeEventListener('daily-plan-updated', load);};
  }, [learnerId, date]);

  async function change(item: Scheduled, action: 'move' | 'remove' | 'today', target?: string) {
    setBusy(true);
    setNotice('');
    try {
      const payload = {learnerId, chapterId: item.chapterId, activity: item.activity,
        period: action === 'today' ? 'day' : item.period,
        date: action === 'today' ? today : target ?? item.startsOn,
        ...(action === 'today' ? {} : {action, fromDate: item.startsOn}),
      };
      const response = await fetch('/api/chapter-plan', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNotice(action === 'today' ? 'Added to today’s plan.' : action === 'move' ? 'Activity moved.' : 'Activity removed.');
      window.dispatchEvent(new Event('daily-plan-updated'));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update the activity.');
    } finally {
      setBusy(false);
    }
  }

  const items = plan?.items ?? [];
  const unassigned = weekIds.filter(id => !items.some(item => item.chapterId === id)).flatMap(id => {
    const chapter = catalogue.get(id);
    return chapter ? [chapter] : [];
  });

  return <section className="workspace-panel" id="weekly-chapter-activities">
    <h2>Chapter activities for this week</h2>
    {notice && <p role="status">{notice}</p>}
    {!plan && !notice && <p className="muted">Loading chapter activities…</p>}
    {plan && !plan.ready && <p className="muted">Chapter activity storage is unavailable.</p>}
    {plan && !items.length && !unassigned.length && <p className="muted">No chapters or activities for this learner and week. <Link href="/learn/path">Open Learning Path</Link></p>}
    <ul className="weekly-chapter-activity-list">
      {unassigned.map(chapter => {
        const grade = textbookById(chapter.bookId)?.grade ?? 0;
        const title = chapter.verifiedTitle ?? chapter.label;
        return <li key={chapter.id}>
          <Link href={chapterActivityHref(chapter.id, learnerId, 'reading')}>{title}</Link>
          <span className="muted">Activity not chosen</span>
          {plan?.canEdit && <ChapterPlanMenu inline chapterId={chapter.id} title={title} learnerId={learnerId} initialDate={date}
            canRevise={Boolean(chapter.verifiedTitle) && isDefaultChapterSessionEligible(chapter) && grade >= 1 && grade <= 10} />}
        </li>;
      })}
      {items.map(item => <li key={`${item.chapterId}:${item.activity}:${item.period}:${item.startsOn}`}>
        <Link href={chapterActivityHref(item.chapterId, item.learnerId, item.activity)}>{item.title} · {activityLabels[item.activity]}</Link>
        <span className="muted">{item.period === 'week' ? 'Weekly plan' : item.startsOn}</span>
        <span>{item.done ? 'Done' : 'Pending'}</span>
        {plan?.canEdit && <>
          {item.period === 'week' ? <button className="btn-secondary" type="button" disabled={busy || item.inToday}
            onClick={() => void change(item, 'today')}>{item.inToday ? 'In today’s plan' : 'Add to Today'}</button> :
            <form className="chapter-plan-buttons" onSubmit={event => {
              event.preventDefault();
              void change(item, 'move', String(new FormData(event.currentTarget).get('date')));
            }}>
              <input type="date" name="date" defaultValue={item.startsOn} required aria-label={`New date for ${item.title} · ${activityLabels[item.activity]}`} />
              <button className="btn-secondary" disabled={busy}>Move</button>
            </form>}
          <button className="btn-secondary" type="button" disabled={busy}
            aria-label={`Remove ${item.title} · ${activityLabels[item.activity]} from ${item.period === 'week' ? 'weekly plan' : item.startsOn}`}
            onClick={() => void change(item, 'remove')}>Remove</button>
        </>}
      </li>)}
    </ul>
  </section>;
}
