'use client';

import Link from 'next/link';
import styles from './weekly-overview.module.css';
import {useEffect, useState} from 'react';
import {activityLabels, chapterActivityHref, type ChapterPlanItem} from '@/lib/planning/chapter-activities';
import {daysInWeek} from '@/lib/planning/periods';

type Extra = {id: string; date: string; title: string; completed: boolean; period?: 'day' | 'week';
  first_page?: number; last_page?: number};

const label = new Intl.DateTimeFormat('en-IN', {weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'});
const display = (day: string) => label.format(new Date(day + 'T12:00:00Z'));

export default function WeeklyOverview({learnerId, date, today}: {learnerId: string; date: string; today: string}) {
  const [selectedDay, setSelectedDay] = useState(date);
  const [items, setItems] = useState<ChapterPlanItem[] | null>(null);
  const [extras, setExtras] = useState<Extra[] | null>(null);
  const [chapterError, setChapterError] = useState(false);
  const [extraError, setExtraError] = useState(false);
  const days = daysInWeek(date);

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      const requests = [
        fetch('/api/chapter-plan?' + new URLSearchParams({learnerId, date}), {signal: controller.signal, cache: 'no-store'})
          .then(async response => {
            if (!response.ok) throw new Error();
            const result = await response.json();
            if (!result.ready) throw new Error();
            if (!controller.signal.aborted) {setItems(result.items);setChapterError(false);}
          }).catch(() => {if (!controller.signal.aborted) setChapterError(true);}),
        fetch('/api/my-books?' + new URLSearchParams({overviewLearner: learnerId, date}), {signal: controller.signal, cache: 'no-store'})
          .then(async response => {
            if (!response.ok) throw new Error();
            const result = await response.json();
            if (!controller.signal.aborted) {setExtras([...result.books, ...result.olympiad]);setExtraError(false);}
          }).catch(() => {if (!controller.signal.aborted) setExtraError(true);}),
      ];
      await Promise.all(requests);
    }
    void refresh();
    window.addEventListener('daily-plan-updated', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('daily-plan-updated', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [learnerId, date]);

  const dayChapters = (day: string) => (items ?? []).filter(item => {
    if (item.period === 'week' && item.startsOn >= days[0]) return false;
    if (item.startsOn >= days[0]) return item.startsOn === day;
    return (item.completedOn ?? today) === day;
  });
  const dayExtras = (day: string) => (extras ?? []).filter(item => item.period !== 'week' && item.date === day);
  const weeklyChapters = (items ?? []).filter(item => item.period === 'week' && item.startsOn === days[0]);
  const weeklyExtras = (extras ?? []).filter(item => item.period === 'week');
  const chapters = dayChapters(selectedDay);
  const optional = dayExtras(selectedDay);

  return <section className="workspace-panel" aria-labelledby="weekly-overview-title">
    <h2 id="weekly-overview-title">Seven-day overview</h2>
    <p className="muted">Shows confirmed activities for this learner. Automatic readings are added when Today’s rhythm opens.</p>
    {chapterError && <p role="status">Chapter schedule unavailable.</p>}
    {extraError && <p role="status">Extra activities unavailable.</p>}
    <div className="week-strip-grid" aria-label="Choose day">
      {days.map(day => {
        const scheduled = dayChapters(day);
        const extraCount = dayExtras(day).length;
        return <button type="button" className={day === today ? 'week-day-card is-today' : 'week-day-card'}
          key={day} aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>
          <strong>{display(day)}{day === today ? ' · Today' : ''}</strong>
          <span>{items && !chapterError ? `${scheduled.filter(item => item.done).length}/${scheduled.length} chapter activities done` : '—'}</span>
          {extraCount > 0 && <small>{extraCount} {extraCount === 1 ? 'extra activity' : 'extra activities'}</small>}
        </button>;
      })}
    </div>
    <div className={styles.details}>
      <section className={styles.group} aria-label={display(selectedDay)}>
        <h3>{display(selectedDay)}</h3>
        {chapters.length > 0 && <ul>{chapters.map(item => <li key={`${item.chapterId}:${item.activity}:${item.period}:${item.startsOn}`}>
          <Link href={chapterActivityHref(item.chapterId, learnerId, item.activity)}>{item.title}</Link>
          <small>{activityLabels[item.activity]}{item.optionalTest ? ' · Optional' : ''}</small>
          <span className={`family-agenda-status${item.done ? ' is-done' : ''}`}>{item.done ? 'Done' : item.carriedOver ? 'Carried over' : 'Scheduled'}</span>
        </li>)}</ul>}
        {optional.length > 0 && <>
          <h4>Extra activities</h4>
          <ul>{optional.map(item => <li key={item.id}>
            <strong>{item.title}</strong>
            <small>{item.first_page === undefined ? 'Olympiad' : item.first_page === item.last_page
              ? `Page ${item.first_page}` : `Pages ${item.first_page}–${item.last_page}`}</small>
            <span className={`family-agenda-status${item.completed ? ' is-done' : ''}`}>{item.completed ? 'Done' : 'Scheduled'}</span>
          </li>)}</ul>
        </>}
        {!chapters.length && !optional.length && !(chapterError || extraError) &&
          <p className="muted">{items && extras ? 'Nothing scheduled for this day.' : 'Loading schedule…'}</p>}
      </section>
      {(weeklyChapters.length > 0 || weeklyExtras.length > 0) && <section className={styles.group} aria-label="Scheduled for the week">
        <h3>Scheduled for the week</h3>
        <ul>
          {weeklyChapters.map(item => <li key={`${item.chapterId}:${item.activity}`}>
            <Link href={chapterActivityHref(item.chapterId, learnerId, item.activity)}>{item.title}</Link>
            <small>{activityLabels[item.activity]}</small>
            <span className={`family-agenda-status${item.done ? ' is-done' : ''}`}>{item.done ? 'Done' : 'Scheduled'}</span>
          </li>)}
          {weeklyExtras.map(item => <li key={item.id}>
            <strong>{item.title}</strong><small>Olympiad</small>
            <span className={`family-agenda-status${item.completed ? ' is-done' : ''}`}>{item.completed ? 'Done' : 'Optional'}</span>
          </li>)}
        </ul>
      </section>}
    </div>
  </section>;
}
