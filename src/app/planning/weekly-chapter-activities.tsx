'use client';

import Link from 'next/link';
import {useEffect, useId, useRef, useState} from 'react';
import styles from './chapter-planner.module.css';
import ChapterPlanMenu from '@/components/chapter-plan-menu';
import {ncertChapterSlots, textbookById, isDefaultChapterSessionEligible} from '@/lib/ncert/textbooks';
import {activityLabels, chapterActivityHref, type ChapterPlanItem} from '@/lib/planning/chapter-activities';

type Scheduled = ChapterPlanItem & {startsOn: string};
export type WeeklyChapterPlan = {ready: boolean; canEdit: boolean; items: Scheduled[]};
const catalogue = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));

export default function WeeklyChapterActivities({learnerId, date, weekIds, today, plan, loadError, readChapterIds}: {
  learnerId: string; date: string; weekIds: string[]; today: string;
  readChapterIds: string[];
  plan: WeeklyChapterPlan | null; loadError: boolean;
}) {
  const menuName = useId();
  const moveDialog = useRef<HTMLDialogElement>(null);
  const [moving, setMoving] = useState<Scheduled | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (moving) moveDialog.current?.showModal();
  }, [moving]);

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
      if (action === 'move') moveDialog.current?.close();
      setNotice(action === 'today' ? 'Added to today’s plan.' : action === 'move' ? 'Activity moved.' : 'Activity removed.');
      window.dispatchEvent(new Event('daily-plan-updated'));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update the activity.');
    } finally {
      setBusy(false);
    }
  }

  const items = plan?.items ?? [];
  const scheduled = items.filter(item => !item.optionalTest);
  const optional = items.filter(item => item.optionalTest);
  const rows = [...new Set([...weekIds, ...scheduled.map(item => item.chapterId)])].flatMap(chapterId => {
    const chapter = catalogue.get(chapterId);
    if (!chapter) return [];
    return [{chapter, activities: scheduled.filter(item => item.chapterId === chapterId)}];
  });
  const read = new Set([...readChapterIds, ...scheduled.filter(item => item.activity === 'reading' && item.done).map(item => item.chapterId)]);
  const readCount = [...new Set(weekIds)].filter(id => read.has(id)).length;
  const formatDate = (value: string) => new Date(value + 'T12:00:00Z').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  });

  return <div id="weekly-chapter-activities" className={styles.weekActivities}>
    {weekIds.length > 0 && <p className={styles.weekReadingSummary}>{readCount} of {new Set(weekIds).size} weekly chapters read</p>}
    {notice && <p role="status">{notice}</p>}
    {loadError && <p role="status">Could not load planned chapter activities.</p>}
    {!plan && !notice && !loadError && <p className="muted">Loading chapter activities…</p>}
    {plan && !plan.ready && <p className="muted">Chapter activity storage is unavailable.</p>}
    {plan && !rows.length && !optional.length && <p className="muted">No chapters or activities for this learner and week. <Link href="/learn/path">Open Learning Path</Link></p>}
    {rows.length > 0 && <div className={styles.weekTable} role="table" aria-label="Weekly chapters">
      <div className={styles.weekColumns} role="row">
        <span role="columnheader">Subject</span><span role="columnheader">Chapter</span>
        <span role="columnheader">Activity</span><span role="columnheader">Schedule</span><span role="columnheader" aria-label="Actions" />
      </div>
      {rows.flatMap(({chapter, activities}, index) => {
        const book = textbookById(chapter.bookId);
        const subject = book?.subject ?? 'Other';
        const title = chapter.verifiedTitle ?? chapter.label;
        const grade = book?.grade ?? 0;
        if (!activities.length) return <div className={styles.weekRow} role="row" key={chapter.id}>
          <span className={styles.weekSubject} role="cell">{subject}</span>
          <span className={styles.weekTitle} role="cell"><Link href={chapterActivityHref(chapter.id, learnerId, 'reading')}>{title}</Link></span>
          <span className={styles.weekActivity} role="cell">{read.has(chapter.id) ? 'Reading' : '—'}</span>
          <span className={styles.weekSchedule} role="cell">{read.has(chapter.id)
            ? <span className={styles.weekDone}>Read</span> : <span className="muted">{plan?.ready ? 'Unscheduled' : '—'}</span>}</span>
          <div className={styles.weekAction} role="cell">{plan?.ready && plan.canEdit && <ChapterPlanMenu inline inlineLabel="+ Schedule"
            chapterId={chapter.id} title={title} learnerId={learnerId} initialDate={date}
            canRevise={Boolean(chapter.verifiedTitle) && isDefaultChapterSessionEligible(chapter) && grade >= 1 && grade <= 10} />}</div>
        </div>;
        return activities.map((item, activityIndex) => {
          const menuId = `${menuName}-${index}-${activityIndex}`;
          const carried = !item.done && item.carriedOver && item.activity === 'reading';
          return <div className={styles.weekRow} role="row" key={`${item.chapterId}:${item.activity}:${item.period}:${item.startsOn}`}>
            <span className={styles.weekSubject} role="cell">{subject}</span>
            <span className={styles.weekTitle} role="cell"><Link href={chapterActivityHref(item.chapterId, item.learnerId, item.activity)}>{title}</Link></span>
            <span className={styles.weekActivity} role="cell">{activityLabels[item.activity]}</span>
            <span className={styles.weekSchedule} role="cell">
              <span className="muted">{item.period === 'week' ? 'Weekly plan' : formatDate(item.startsOn)}</span>
              <span className={item.done ? styles.weekDone : carried ? styles.weekCarry : styles.weekPending}>
                {item.done ? (item.activity === 'reading' ? 'Read' : item.activity === 'revision' ? 'Revised' : 'Done') : carried ? 'Carried over' : 'Pending'}
              </span>
            </span>
            <div className={styles.weekAction} role="cell">{plan?.canEdit && <details className={styles.weekMenu} name={menuName}
              onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;}}
              onKeyDown={event => {if (event.key === 'Escape') {event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus();}}}>
              <summary aria-label={`Manage ${title} · ${activityLabels[item.activity]}`} aria-controls={menuId}>⋯</summary>
              <div id={menuId} className={styles.weekMenuItems}>
                {item.period === 'week' ? <button type="button" disabled={busy || item.inToday}
                  onClick={event => {event.currentTarget.closest('details')?.removeAttribute('open'); void change(item, 'today');}}>
                  {item.inToday ? 'In today’s plan' : 'Add to today'}
                </button> : !item.done && <button type="button" disabled={busy}
                  onClick={event => {
                    const details = event.currentTarget.closest('details');
                    details?.querySelector('summary')?.focus();
                    details?.removeAttribute('open');
                    setNotice('');
                    setMoving(item);
                  }}>Move to another day</button>}
                <button type="button" disabled={busy}
                  onClick={event => {event.currentTarget.closest('details')?.removeAttribute('open'); void change(item, 'remove');}}>
                  Remove activity
                </button>
              </div>
            </details>}</div>
          </div>;
        });
      })}
    </div>}
    <dialog ref={moveDialog} onClose={() => setMoving(null)} className="chapter-plan-dialog" aria-label="Move chapter activity">
      {moving && <form key={`${moving.chapterId}:${moving.activity}:${moving.startsOn}`} className="studio-stack" onSubmit={event => {
        event.preventDefault();
        void change(moving, 'move', String(new FormData(event.currentTarget).get('date')));
      }}>
        <h2>Move activity</h2>
        <p>{moving.title} · {activityLabels[moving.activity]}</p>
        <label className="workspace-field"><span>New date</span>
          <input type="date" name="date" defaultValue={moving.startsOn} required />
        </label>
        {notice && <p role="status">{notice}</p>}
        <div className="chapter-plan-buttons">
          <button className="btn-primary" disabled={busy}>Move</button>
          <button type="button" className="btn-secondary" onClick={() => moveDialog.current?.close()}>Cancel</button>
        </div>
      </form>}
    </dialog>
    {optional.length > 0 && <section className={styles.weekGroup}>
      <h3>Optional Sunday tests</h3>
      <ul className={styles.chapterRows}>{optional.map(item => <li key={item.chapterId}>
        <Link href={chapterActivityHref(item.chapterId, learnerId, 'test')}>{item.title}</Link>
        <span className="pill">{item.done ? 'Done' : 'Scheduled'}</span>
      </li>)}</ul>
    </section>}
  </div>;
}
