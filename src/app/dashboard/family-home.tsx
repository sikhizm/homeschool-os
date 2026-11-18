'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Icon from './design-icon';
import { revisionState } from '@/lib/revision-state';

type Task = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  mode?: string;
  href: string | null;
  status?: string;
};
type Slot = {
  learnerId: string;
  name: string;
  grade: string;
  task: Task;
  minutes: number;
  startMinute: number;
  mode: 'guided' | 'play' | 'independent';
};
type Separate = { learnerId: string; name: string; grade: string; task: Task };
type Attention = {
  id: string;
  tone: 'revision' | 'check' | 'plan';
  text: string;
  href: string;
};
type LearnerCard = {
  id: string;
  name: string;
  grade: string;
  canEdit: boolean;
  completed: number;
  total: number;
  tasks: Task[];
  history: { id: string; updatedAt: string }[];
  assessment: {
    completed: number;
    understood: number;
    mastered: number;
    independentRecall: number;
    recallWithHint: number;
  };
  activeChapter?: {
    chapterId: string;
    title: string;
    subject: string;
    bookTitle: string;
    status: string;
    completedSessions: number;
    totalSessions: number;
    nextSessionKind: 'read' | 'practice' | 'review' | null;
  } | null;
  continueSession?: {
    taskId: string;
    chapterId: string;
    chapterTitle: string;
    bookTitle: string;
    kind: 'read' | 'practice' | 'review';
    label: string;
  } | null;
};
type HomeData = {
  learners: LearnerCard[];
  familyPlan: {
    slots: Slot[];
    separate: Separate[];
    budget: number;
    allocated: number;
    notes: string[];
  };
};

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function istDateKey(date: Date): string {
  const ist = new Date(date.getTime() + 330 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}
function clock(minute: number): string {
  const h = Math.floor(minute / 60),
    m = minute % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}
function greeting(date: Date): string {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function formatFamilyGreetingName(familyName: string | null): string {
  const trimmed = (familyName ?? '').trim();
  if (!trimmed) return 'family';
  return /\bfamily$/i.test(trimmed) ? trimmed : `${trimmed} family`;
}
function streakDays(history: { updatedAt: string }[]): number {
  const days = new Set(history.map((h) => istDateKey(new Date(h.updatedAt))));
  if (!days.size) return 0;
  const today = new Date();
  let cursor = istDateKey(today);
  if (!days.has(cursor)) {
    cursor = istDateKey(new Date(today.getTime() - 86400000));
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  let probe = new Date(`${cursor}T12:00:00Z`);
  while (days.has(istDateKey(probe))) {
    streak += 1;
    probe = new Date(probe.getTime() - 86400000);
  }
  return streak;
}

/**
 * Parent Home: greeting, today's family plan hero, per-learner cards,
 * the day's timeline and an "only urgent" attention list.
 */
export function FamilyHome({
  familyName,
  canEdit,
}: {
  familyName: string | null;
  canEdit: boolean;
}) {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    fetch('/api/auto-learning', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw Error('Plan unavailable');
        return r.json();
      })
      .then(
        (json: {
          learners?: LearnerCard[];
          familyPlan?: HomeData['familyPlan'];
        }) => {
          if (alive)
            setData({
              learners: json.learners ?? [],
              familyPlan: json.familyPlan ?? {
                slots: [],
                separate: [],
                budget: 60,
                allocated: 0,
                notes: [],
              },
            });
        },
      )
      .catch(() => {
        if (alive) setError('We could not load today’s plan. Try refreshing.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const now = new Date();
  const derived = useMemo(() => {
    if (!data) return null;
    const todayKey = istDateKey(new Date());
    const learners = data.learners;
    const todayDone = new Set<string>();
    for (const learner of learners) {
      for (const h of learner.history ?? []) {
        if (istDateKey(new Date(h.updatedAt)) === todayKey)
          todayDone.add(`${learner.id}:${h.id}`);
      }
    }
    const outstanding = learners.reduce(
      (sum, l) => sum + (l.tasks?.length ?? 0),
      0,
    );
    const planned = data.familyPlan.slots.length;
    const attention: Attention[] = [];
    for (const learner of learners) {
      const revision = (learner.tasks ?? []).filter(
        (t) => t.status === 'needs_revision' || t.id.startsWith('review:'),
      );
      if (revision[0])
        attention.push({
          id: `rev-${learner.id}`,
          tone: 'revision',
          text: `${learner.name} is ready to revisit: ${revision[0].title}`,
          href: revision[0].href ?? '#today-plan',
        });
      const unchecked =
        learner.assessment.completed - learner.assessment.understood;
      if (unchecked > 0)
        attention.push({
          id: `check-${learner.id}`,
          tone: 'check',
          text: `${unchecked} finished ${unchecked === 1 ? 'activity' : 'activities'} from ${learner.name} still ${unchecked === 1 ? 'needs' : 'need'} a quick understanding check`,
          href: '#today-plan',
        });
    }
    if (planned === 0 && outstanding > 0)
      attention.push({
        id: 'plan',
        tone: 'plan',
        text: 'Today’s family plan has not been prepared yet — one tap prepares it',
        href: '#today-plan',
      });
    return {
      todayDone: todayDone.size,
      progress: Math.min(
        100,
        Math.round(
          (todayDone.size / Math.max(1, todayDone.size + outstanding)) * 100,
        ),
      ),
      attention: attention.slice(0, 4),
      streaks: Object.fromEntries(
        learners.map((l) => [l.id, streakDays(l.history ?? [])]),
      ) as Record<string, number>,
      nextActivity: Object.fromEntries(
        learners.map((l) => [l.id, l.tasks?.[0] ?? null]),
      ) as Record<string, Task | null>,
    };
  }, [data]);

  const timeline = useMemo(() => {
    if (!data) return [];
    const rows: {
      key: string;
      range: string;
      phase: string;
      tone: string;
      title: string;
      learner: string;
      href: string | null;
    }[] = [];
    for (const slot of data.familyPlan.slots) {
      const phase =
        slot.mode === 'play'
          ? 'Shared family warm-up'
          : 'Parent-guided learning';
      rows.push({
        key: slot.task.id,
        range: `${clock(slot.startMinute)} – ${clock(slot.startMinute + slot.minutes)}`,
        phase,
        tone: slot.mode === 'play' ? 'saffron' : 'mint',
        title: slot.task.title,
        learner: slot.name,
        href: slot.task.href,
      });
    }
    for (const entry of data.familyPlan.separate) {
      rows.push({
        key: entry.task.id,
        range: 'Any time',
        phase:
          entry.task.mode === 'independent'
            ? 'Independent learning'
            : 'Family play',
        tone: entry.task.mode === 'independent' ? 'math' : 'creativity',
        title: entry.task.title,
        learner: entry.name,
        href: entry.task.href,
      });
    }
    const seen = new Set(rows.map((r) => r.key));
    for (const learner of data.learners) {
      for (const task of learner.tasks ?? []) {
        if (
          (task.status === 'needs_revision' || task.id.startsWith('review:')) &&
          !seen.has(task.id)
        ) {
          seen.add(task.id);
          rows.push({
            key: task.id,
            range: 'Later today',
            phase: 'Revision',
            tone: 'language',
            title: task.title,
            learner: learner.name,
            href: task.href,
          });
        }
      }
    }
    return rows;
  }, [data]);

  const plan = data?.familyPlan;
  const guided =
    plan?.slots
      .filter((s) => s.mode === 'guided')
      .reduce((n, s) => n + s.minutes, 0) ?? 0;
  const together =
    plan?.slots
      .filter((s) => s.mode === 'play')
      .reduce((n, s) => n + s.minutes, 0) ?? 0;
  const ratio = plan?.budget ? Math.min(1, plan.allocated / plan.budget) : 0;
  return (
    <section className="figma-today" aria-labelledby="family-home-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {DAY_NAMES[now.getDay()]}, {now.getDate()}{' '}
            {MONTH_NAMES[now.getMonth()]}
          </p>
          <h1 id="family-home-title">
            {greeting(now)}, {formatFamilyGreetingName(familyName)}.
          </h1>
          <p>
            {canEdit
              ? 'Your family’s plan and next activities for today.'
              : 'Viewing your family’s learning plan.'}
          </p>
        </div>
        <Link className="date-button" href="/planning">
          <Icon name="calendar" />
          This week
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <section className="hero-card">
        <div className="hero-main">
          <div className="hero-label">
            <Icon name="sun" size={17} />
            Today’s family plan
          </div>
          <h2>
            {plan
              ? plan.allocated
                ? plan.allocated + ' minutes, planned for you.'
                : 'Build today’s learning plan.'
              : 'Loading today’s plan…'}
          </h2>
          <p>
            {plan
              ? plan.notes[0] ||
                `${plan.slots.length} guided or shared activities. ${plan.separate.length} activities available separately.`
              : error || 'Finding the next activities for your learners.'}
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#today-plan">
              <Icon name="play" />
              Start family learning
              <Icon name="arrow" />
            </a>
            <Link className="text-button" href="/planning">
              {canEdit ? 'Adjust plan' : 'View plan'}
            </Link>
          </div>
        </div>
        <div className="hero-summary">
          <div className="time-ring">
            <svg aria-hidden="true" viewBox="0 0 120 120">
              <circle className="ring-bg" cx="60" cy="60" r="51" />
              <circle
                className="ring-value"
                cx="60"
                cy="60"
                r="51"
                style={{ strokeDashoffset: 320 * (1 - ratio) }}
              />
            </svg>
            <div>
              <strong>{plan?.allocated ?? '—'}</strong>
              <span>minutes</span>
            </div>
          </div>
          <div className="summary-legend">
            <p>
              <span className="dot forest" />
              <strong>{plan ? guided : '—'} min</strong> guided
            </p>
            <p>
              <span className="dot saffron" />
              <strong>{plan ? together : '—'} min</strong> together
            </p>
          </div>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Today’s rhythm</p>
              <h2>One step at a time</h2>
            </div>
            <Link className="quiet-button" href="/planning">
              View full plan <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="timeline">
            {timeline.map((r, i) => {
              const tone = ['saffron', 'blue', 'lilac', 'mint'][i % 4];
              const [start, end] = r.range.split(' – ');
              return (
                <article className="timeline-row" key={r.learner + r.key + i}>
                  <div className="timeline-time">
                    <strong>{start}</strong>
                    <span>{end}</span>
                  </div>
                  <div className="timeline-line">
                    <span className={'timeline-node ' + tone} />
                    {i < timeline.length - 1 && <i />}
                  </div>
                  <div className={'activity-icon ' + tone}>
                    <Icon name={r.tone === 'saffron' ? 'sun' : 'book'} />
                  </div>
                  <div className="activity-copy">
                    <strong>
                      <a href={r.href || '#today-plan'}>{r.title}</a>
                    </strong>
                    <span>
                      {r.learner} · {r.phase}
                    </span>
                  </div>
                </article>
              );
            })}
            {!timeline.length && (
              <p>
                {data
                  ? 'No activities scheduled yet.'
                  : error || 'Loading activities…'}
              </p>
            )}
          </div>
        </section>
        <aside className="panel attention-panel" id="parent-attention">
          <div className="section-head">
            <div>
              <p className="eyebrow">For you</p>
              <h2>Needs attention</h2>
            </div>
            <span className="count-badge">
              {derived?.attention.length ?? '—'}
            </span>
          </div>
          {derived?.attention.map((a) => (
            <div className="attention-item" key={a.id}>
              <div className="attention-icon">
                <Icon name={a.tone === 'check' ? 'check' : 'book'} />
              </div>
              <div>
                <strong>{a.text}</strong>
                <a href={a.href}>Open activity →</a>
              </div>
            </div>
          ))}
          {!derived?.attention.length && (
            <p className="all-clear">
              {data ? 'All clear for today.' : error || 'Checking your plan…'}
            </p>
          )}
        </aside>
      </div>
      <section className="learners-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your learners</p>
            <h2>Ready when they are</h2>
          </div>
          <Link className="quiet-button" href="/learners">
            All learners <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="learner-grid">
          {data?.learners.map((l, i) => {
            const next = l.tasks[0];
            const space = '/learn?learner=' + encodeURIComponent(l.id);
            const session = l.continueSession;
            const href = session
              ? '/learn/lesson?learner=' +
                encodeURIComponent(l.id) +
                '&task=' +
                encodeURIComponent(session.taskId)
              : next?.href || space;
            const view = revisionState({
              ...l.assessment,
              hasRevisionQueue: l.tasks.some(
                (t) =>
                  t.status === 'needs_revision' || t.id.startsWith('review:'),
              ),
            });
            return (
              <article key={l.id} className="learner-card">
                <div className="learner-top">
                  <span className={'avatar ' + (i % 2 ? 'fateh' : 'simran')}>
                    {l.name.slice(0, 1)}
                  </span>
                  <div>
                    <h3>{l.name}</h3>
                    <p>
                      {l.grade}
                      {derived?.streaks[l.id]
                        ? ' · ' + derived.streaks[l.id] + ' day streak'
                        : ''}
                    </p>
                  </div>
                  <span className="status" title={view.recommendation}>
                    <i />
                    {view.label}
                  </span>
                </div>
                <div
                  className={
                    'next-lesson ' + (i % 2 ? 'lilac-wash' : 'blue-wash')
                  }
                >
                  <div>
                    <span>{session ? 'Continue chapter' : 'Up next'}</span>
                    <strong>
                      {session?.chapterTitle ||
                        next?.title ||
                        'Explore learner space'}
                    </strong>
                    <small>
                      {session?.label ||
                        (next
                          ? next.subject + ' · ' + next.minutes + ' min'
                          : 'Choose an activity')}
                    </small>
                  </div>
                  <a
                    className="lesson-play"
                    href={href}
                    aria-label={'Open next activity for ' + l.name}
                  >
                    <Icon name="play" />
                  </a>
                </div>
                {l.activeChapter && (
                  <p>
                    <Link
                      href={'/ncert-books/chapter/' + l.activeChapter.chapterId}
                    >
                      {l.activeChapter.bookTitle} · {l.activeChapter.title}
                    </Link>{' '}
                    · {l.activeChapter.completedSessions}/
                    {l.activeChapter.totalSessions} sessions
                  </p>
                )}
                <div className="progress-row">
                  <span>Learning journey</span>
                  <strong>
                    {l.completed} of {l.total} activities
                  </strong>
                </div>
                <div className="progress-track">
                  <span
                    style={{
                      width:
                        (l.total
                          ? Math.min(100, (100 * l.completed) / l.total)
                          : 0) + '%',
                    }}
                  />
                </div>
                <Link className="learner-link" href={space}>
                  Open {l.name}’s space <Icon name="arrow" size={16} />
                </Link>
              </article>
            );
          })}
          {data && !data.learners.length && (
            <Link href="/learners">Add your first learner</Link>
          )}
        </div>
      </section>
    </section>
  );
}
