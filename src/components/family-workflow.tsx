'use client';
import Link from 'next/link';
import LearnerIcon, { type LearnerIconName } from '@/components/learner-ui-icon';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  dayModes,
  outcomes,
  subjects,
  familyMinutes,
  scheduleConflicts,
  weeklySummary,
  type Activity,
} from '@/lib/family-workflow/model';
import type { Resource } from '@/lib/family-workflow/service';
type Learner = { id: string; display_name: string; stage: string };
type Data = {
  recommendations: {
    learner_id: string;
    subject: string;
    grade: number;
    href: string | null;
  }[];
  canEdit: boolean;
  learners: Learner[];
  activities: Activity[];
  saved: {
    learner_id: string;
    resource_key: string;
    title: string;
    href: string;
    subject: string;
    display_name: string;
  }[];
  levels: { learner_id: string; subject: string; level: number }[];
  preferences: { mode: string; budget: number };
  goals: { id: string; learner_id: string; title: string }[];
  resource: Resource | null;
  week: string[];
  nextWeek: string;
};
type View = 'today' | 'week' | 'saved' | 'levels';
const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(
    new Date(),
  );
const timeValue = (minute: number | null) =>
  minute === null
    ? ''
    : `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const timeNumber = (value: FormDataEntryValue | null) =>
  value
    ? String(value)
        .split(':')
        .reduce((n, v) => n * 60 + Number(v), 0)
    : null;
const fields = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return new FormData(event.currentTarget);
};
type Save = (input: Record<string, unknown>) => Promise<void>;
export default function FamilyWorkflow({
  initialView = 'today',
  resourceKey = '',
  intent = 'plan',
}: {
  initialView?: View;
  resourceKey?: string;
  intent?: string;
}) {
  const [anchor, setAnchor] = useState(today),
    [view, setView] = useState<View>(initialView),
    [data, setData] = useState<Data | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [version, setVersion] = useState(0);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const r = await fetch(
        '/api/family-workflow?date=' +
          anchor +
          '&resource=' +
          encodeURIComponent(resourceKey),
        { cache: 'no-store', signal },
      );
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      return b as Data;
    },
    [anchor, resourceKey],
  );
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setMessage(e.message);
      });
    return () => controller.abort();
  }, [refresh]);
  const save: Save = async (input) => {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/family-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      setData(await refresh());
      setVersion((n) => n + 1);
      setMessage(
        'Saved. Your existing planner and reports use these activity records.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
    }
  };
  const items =
    data?.activities.filter((a) => a.learning_date === anchor) ?? [];
  const conflicts = scheduleConflicts(items),
    summary = weeklySummary(data?.activities ?? []);
  return (
    <section
      id="family-workflow"
      className={`workspace-panel family-workflow no-print${view === 'levels' ? ' subject-level-workspace' : ''}`}
      aria-label="Family learning workflow"
    >
      {view === 'levels' ? (
        <header className="subject-workspace-heading">
          <span className="subject-workspace-heading-icon"><LearnerIcon name="layers"/></span>
          <div>
            <span className="eyebrow">LEARNER PERSONALIZATION</span>
            <h2>Subject levels</h2>
            <p>Choose a class level per subject without changing a learner’s overall class.</p>
          </div>
        </header>
      ) : (
        <>
          <h2>Your family learning rhythm</h2>
          <p>Choose a resource, make a manageable plan, then record what helped. Nothing moves to another day without your decision.</p>
        </>
      )}
      <div className={`workflow-controls${view === 'levels' ? ' subject-level-toolbar' : ''}`}>
        <label>
          Day / review week
          <input
            type="date"
            disabled={busy}
            value={anchor}
            onChange={(e) => {
              if (e.target.value) {
                setData(null);
                setMessage('');
                setAnchor(e.target.value);
              }
            }}
          />
        </label>
        <div className="resource-plan-actions" aria-label="Workflow view">
          {(['today', 'week', 'saved', 'levels'] as View[]).map((v) => (
            <button
              className="btn-secondary"
              key={v}
              aria-pressed={v === view}
              onClick={() => setView(v)}
            >
              {
                {
                  today: 'Today',
                  week: 'Weekly review',
                  saved: 'Saved for later',
                  levels: 'Subject levels',
                }[v]
              }
            </button>
          ))}
        </div>
      </div>
      {(message || !data) && <p className="workflow-message" role="status" aria-live="polite">
        {message || 'Loading your family plan…'}
      </p>}
      {data && (
        <fieldset disabled={busy} className="workflow-fieldset">
          <legend className="sr-only">Family plan controls</legend>
          {!data.canEdit && (
            <p>
              View-only access. A family owner can change plans and record
              reviews.
            </p>
          )}
          {data.resource && (
            <Assignment
              key={resourceKey + version}
              data={data}
              anchor={intent === 'today' ? today() : anchor}
              intent={intent}
              save={save}
            />
          )}
          {view === 'today' && (
            <>
              <DayPreferences
                key={anchor + version}
                preferences={data.preferences}
                anchor={anchor}
                save={save}
                canEdit={data.canEdit}
              />
              <p>
                <strong>
                  {familyMinutes(items)} / {data.preferences.budget} minutes
                  planned
                </strong>{' '}
                · Shared sessions count once when kept together.
              </p>
              {familyMinutes(items) > data.preferences.budget && (
                <p role="alert">
                  This day exceeds your budget. Shorten, skip or move a session
                  below; changing the budget does not silently remove work.
                </p>
              )}
              {conflicts.length > 0 && (
                <div role="alert">
                  <strong>Parent time overlaps</strong>
                  <ul>
                    {conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {items.some(
                (a) =>
                  !a.skipped &&
                  a.support_mode !== 'independent' &&
                  a.start_minute === null,
              ) && (
                <p>
                  Set a start time on parent-led sessions to check overlaps.
                </p>
              )}
              {!items.length && (
                <p>
                  No assigned activities for this date.{' '}
                  <Link href="/library">Choose a resource</Link> or add a custom
                  activity in the daily goals workspace.
                </p>
              )}
              {items.map((a) => (
                <Session
                  key={a.id + version}
                  activity={a}
                  canEdit={data.canEdit}
                  save={save}
                  nextWeek={data.nextWeek}
                />
              ))}
            </>
          )}
          {view === 'week' && (
            <>
              <h3>Week of {data.week[0]}</h3>
              <p>
                {summary.completed} completed · {summary.unfinished} unfinished
                · {summary.planned} learner-minutes planned.
              </p>
              <p>
                {summary.recorded
                  ? `${summary.actual} minutes recorded across ${summary.recorded} sessions. Sessions without recorded time are excluded.`
                  : 'No actual time recorded yet. Completion alone is not a measure of understanding.'}
              </p>
              {summary.repeatedHelp.length > 0 && (
                <div>
                  <h4>Consider another approach</h4>
                  {summary.repeatedHelp.map(([key, n]) => (
                    <p key={key}>
                      {key}: help or a different approach recorded {n} times.
                      Consider objects, a worked example or a simpler
                      prerequisite; choose a next step below.
                    </p>
                  ))}
                </div>
              )}
              <p>
                Review each session and explicitly apply your decision.
                “Continue” schedules another session with the same resource; use
                the Library to choose a different chapter.
              </p>
              {data.activities.length === 0 && (
                <p>No planned activities in this week.</p>
              )}
              {data.activities.map((a) => (
                <Session
                  key={a.id + version}
                  activity={a}
                  canEdit={data.canEdit}
                  save={save}
                  nextWeek={data.nextWeek}
                />
              ))}
            </>
          )}
          {view === 'saved' && (
            <>
              <h3>Saved for later</h3>
              {!data.saved.length && (
                <p>
                  Use “Save for later” on a chapter, Olympiad paper or study
                  material.
                </p>
              )}
              {data.saved.map((s) => (
                <article
                  className="workflow-session"
                  key={s.learner_id + s.resource_key}
                >
                  <strong>{s.title}</strong>
                  <p>
                    {s.display_name} · {s.subject}
                  </p>
                  <div className="resource-plan-actions">
                    <Link className="btn-secondary" href={s.href}>
                      Open resource
                    </Link>
                    <Link
                      className="btn-secondary"
                      href={
                        '/planning?resource=' +
                        encodeURIComponent(s.resource_key) +
                        '#family-workflow'
                      }
                    >
                      Plan a session
                    </Link>
                    {data.canEdit && (
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          save({
                            action: 'unsave',
                            learnerId: s.learner_id,
                            resourceKey: s.resource_key,
                          })
                        }
                      >
                        Remove saved item
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </>
          )}
          {view === 'levels' && (
            <div className="subject-levels-content">
              <p className="subject-levels-guidance">
                Parent-selected levels guide resource links and Maths Olympiad prompts.
                They do not infer attainment. You can browse any other class in the catalogue.
              </p>
              {data.learners.map((l, index) => (
                <LevelEditor
                  key={l.id}
                  learner={l}
                  data={data}
                  save={save}
                  version={version}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          )}
        </fieldset>
      )}
    </section>
  );
}
function DayPreferences({
  preferences,
  anchor,
  save,
  canEdit,
}: {
  preferences: Data['preferences'];
  anchor: string;
  save: Save;
  canEdit: boolean;
}) {
  const [mode, setMode] = useState(preferences.mode),
    [budget, setBudget] = useState(preferences.budget);
  return (
    <form
      className="workflow-controls"
      onSubmit={(e) => {
        e.preventDefault();
        void save({ action: 'day', date: anchor, mode, budget });
      }}
    >
      <label>
        Day mode
        <select
          disabled={!canEdit}
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setBudget(dayModes[e.target.value as keyof typeof dayModes]);
          }}
        >
          {Object.keys(dayModes).map((m) => (
            <option key={m} value={m}>
              {m[0].toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Time budget (minutes)
        <input
          disabled={!canEdit}
          type="number"
          min={10}
          max={480}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </label>
      {canEdit && <button>Save day mode</button>}
    </form>
  );
}
function Assignment({
  data,
  anchor,
  intent,
  save,
}: {
  data: Data;
  anchor: string;
  intent: string;
  save: Save;
}) {
  const r = data.resource!;
  const [ids, setIds] = useState<string[]>(
    r.learnerId ? [r.learnerId] : data.learners[0] ? [data.learners[0].id] : [],
  );
  return (
    <form
      className="workflow-session"
      onSubmit={(e) => {
        const f = fields(e);
        void save({
          action: String(f.get('action')),
          resourceKey: r.key,
          learnerIds: ids,
          date: String(f.get('date')),
          minutes: Number(f.get('minutes')),
          start: timeNumber(f.get('start')),
          mode: String(f.get('mode')),
          goalId: String(f.get('goal') ?? ''),
        });
      }}
    >
      <h3>
        {intent === 'save' ? 'Save for later' : 'Plan a resource'}: {r.title}
      </h3>
      <Link href={r.href}>Open and review resource</Link>
      {r.approved === false && (
        <p>
          Generated material needs parent approval in the study library before
          assignment. You can save it for later now.
        </p>
      )}
      <fieldset disabled={!data.canEdit}>
        <legend>Choose learner(s)</legend>
        {data.learners
          .filter((l) => !r.learnerId || l.id === r.learnerId)
          .map((l) => (
            <label className="workflow-check" key={l.id}>
              <input
                type="checkbox"
                checked={ids.includes(l.id)}
                onChange={(e) =>
                  setIds((old) =>
                    e.target.checked
                      ? [...old, l.id]
                      : old.filter((id) => id !== l.id),
                  )
                }
              />
              {l.display_name} · {l.stage}
            </label>
          ))}
      </fieldset>
      <div className="workflow-controls">
        <label>
          Action
          <select
            name="action"
            defaultValue={intent === 'save' ? 'save' : 'assign'}
          >
            <option value="assign">Assign session</option>
            <option value="save">Save for later</option>
          </select>
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={anchor} required />
        </label>
        <label>
          Minutes
          <input
            name="minutes"
            type="number"
            min={1}
            max={120}
            defaultValue={20}
            required
          />
        </label>
        <label>
          Support
          <select name="mode">
            <option value="parent">Parent-led</option>
            <option value="independent">Independent</option>
            <option value="shared">Shared family session</option>
          </select>
        </label>
        <label>
          Start time (optional)
          <input type="time" name="start" />
        </label>
        <label>
          Learning goal (optional)
          <select key={ids.join(',')} name="goal">
            <option value="">No goal linked</option>
            {ids.length === 1 &&
              data.goals
                .filter((g) => g.learner_id === ids[0])
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
          </select>
        </label>
      </div>
      <button disabled={!data.canEdit || !ids.length}>Confirm selection</button>
    </form>
  );
}
function Session({
  activity: a,
  canEdit,
  save,
  nextWeek,
}: {
  activity: Activity;
  canEdit: boolean;
  save: Save;
  nextWeek: string;
}) {
  return (
    <article className="workflow-session">
      <h3>{a.title}</h3>
      <p>
        {a.display_name} · {a.learning_date} · {a.minutes} min ·{' '}
        {a.support_mode}
        {a.skipped
          ? ' · Skipped'
          : a.completed
            ? ' · Completed'
            : ' · Not completed'}
      </p>
      {canEdit && (a.timer_started_at || (!a.completed && !a.skipped)) && <button type="button" onClick={()=>void save({action:a.timer_started_at?'stopTimer':'startTimer',id:a.id})}>{a.timer_started_at?'Stop timer and save minutes':'Start study timer'}</button>}
      {a.timer_started_at && <p role="status">Timer running since {new Date(a.timer_started_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>}
      {a.actual_minutes!=null && <p>{a.actual_minutes} minutes recorded</p>}
      {a.resource_href && <Link href={a.resource_href}>Open resource</Link>}
      {a.next_notes && <p>Plan: {a.next_notes}</p>}
      {a.understanding && (
        <p>
          {outcomes[a.understanding]} · Next: {a.next_action}
        </p>
      )}
      {a.reflection && <p>{a.reflection}</p>}
      {a.evidence_url && (
        <a href={a.evidence_url} target="_blank" rel="noopener noreferrer">
          View evidence
        </a>
      )}
      {canEdit && (
        <>
          <details>
            <summary>Edit session or move it</summary>
            <form
              onSubmit={(e) => {
                const f = fields(e);
                void save({
                  action: 'edit',
                  id: a.id,
                  date: f.get('date'),
                  minutes: Number(f.get('minutes')),
                  mode: f.get('mode'),
                  start: timeNumber(f.get('start')),
                  skipped: f.get('skipped') === 'on',
                });
              }}
            >
              <div className="workflow-controls">
                <label>
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={a.learning_date}
                    required
                  />
                </label>
                <label>
                  Minutes
                  <input
                    name="minutes"
                    type="number"
                    min={1}
                    max={120}
                    defaultValue={a.minutes}
                    required
                  />
                </label>
                <label>
                  Support
                  <select name="mode" defaultValue={a.support_mode}>
                    <option value="parent">Parent-led</option>
                    <option value="independent">Independent</option>
                    <option value="shared">Shared</option>
                  </select>
                </label>
                <label>
                  Start
                  <input
                    name="start"
                    type="time"
                    defaultValue={timeValue(a.start_minute)}
                  />
                </label>
                <label className="workflow-check">
                  <input
                    name="skipped"
                    type="checkbox"
                    defaultChecked={a.skipped}
                  />
                  Skip this session
                </label>
              </div>
              <p>
                Editing one child’s shared session changes only that child’s
                record. Check overlaps again if shared times differ.
              </p>
              <button>Save session</button>
            </form>
          </details>
          <details>
            <summary>Record understanding</summary>
            <form
              onSubmit={(e) => {
                const f = fields(e);
                void save({
                  action: 'review',
                  id: a.id,
                  outcome: f.get('outcome'),
                  completed: f.get('completed') === 'on',
                  actual:
                    f.get('actual') === '' ? null : Number(f.get('actual')),
                  note: f.get('note'),
                  evidence: f.get('evidence'),
                  next: f.get('next'),
                });
              }}
            >
              <div className="workflow-controls">
                <label>
                  How did it go?
                  <select
                    name="outcome"
                    defaultValue={a.understanding ?? 'help'}
                  >
                    {Object.entries(outcomes).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="workflow-check">
                  <input
                    type="checkbox"
                    name="completed"
                    defaultChecked={a.completed}
                  />
                  Activity completed
                </label>
                <label>
                  Actual minutes (optional)
                  <input
                    key={a.actual_minutes}
                    name="actual"
                    type="number"
                    min={0}
                    max={480}
                    defaultValue={a.actual_minutes ?? ''}
                  />
                </label>
                <label>
                  Next action
                  <select
                    name="next"
                    defaultValue={a.next_action || 'continue'}
                  >
                    <option value="continue">Continue</option>
                    <option value="repeat">Repeat</option>
                    <option value="change">Change approach</option>
                  </select>
                </label>
              </div>
              <label>
                Optional observation
                <textarea
                  name="note"
                  maxLength={1000}
                  defaultValue={a.reflection}
                />
              </label>
              <label>
                Optional evidence link
                <input
                  name="evidence"
                  type="url"
                  maxLength={1000}
                  defaultValue={a.evidence_url}
                />
              </label>
              <p>
                Saving this review does not mark mastery or change another day’s
                plan.
              </p>
              <button>Save review</button>
            </form>
          </details>
          <details>
            <summary>Choose and apply a next session</summary>
            <form
              onSubmit={(e) => {
                const f = fields(e);
                void save({
                  action: 'followup',
                  id: a.id,
                  decision: f.get('decision'),
                  date: f.get('date'),
                  minutes: Number(f.get('minutes')),
                  notes: f.get('notes'),
                });
              }}
            >
              <div className="workflow-controls">
                <label>
                  Decision
                  <select
                    name="decision"
                    defaultValue={a.next_action || 'continue'}
                  >
                    <option value="continue">
                      Continue with this resource
                    </option>
                    <option value="repeat">Repeat</option>
                    <option value="change">Change approach</option>
                    {!a.completed && (
                      <>
                        <option value="move">Move unfinished work</option>
                        <option value="reduce">Move with less time</option>
                      </>
                    )}
                  </select>
                </label>
                <label>
                  Target date
                  <input
                    name="date"
                    type="date"
                    defaultValue={nextWeek}
                    required
                  />
                </label>
                <label>
                  Minutes
                  <input
                    name="minutes"
                    type="number"
                    min={1}
                    max={120}
                    defaultValue={a.minutes}
                    required
                  />
                </label>
              </div>
              <label>
                Teaching approach / preparation
                <textarea
                  name="notes"
                  maxLength={1000}
                  placeholder="For example: use counters, demonstrate one example, then try independently."
                />
              </label>
              <button>Apply this decision</button>
            </form>
          </details>
        </>
      )}
    </article>
  );
}
const SUBJECT_LEVEL_ICONS: Record<(typeof subjects)[number], LearnerIconName> = {
  Mathematics: 'calculator',
  English: 'book',
  Science: 'flask',
  'Social Science': 'globe',
  Hindi: 'hindi',
  Reasoning: 'reasoning',
};

function LevelEditor({
  learner: l,
  data,
  save,
  version,
  defaultOpen,
}: {
  learner: Learner;
  data: Data;
  save: Save;
  version: number;
  defaultOpen: boolean;
}) {
  return (
    <details className="workflow-session subject-level-learner" defaultOpen={defaultOpen}>
      <summary>
        <span className="subject-level-learner-avatar" aria-hidden="true">{l.display_name.slice(0, 1).toUpperCase()}</span>
        <strong>{l.display_name}</strong>
        <span className="subject-level-learner-stage">Overall class: {l.stage}</span>
        <LearnerIcon name="chevron" className="subject-level-chevron"/>
      </summary>
      <div className="subject-level-rows">
        {subjects.map((subject) => {
          const level = data.levels.find(
            (entry) => entry.learner_id === l.id && entry.subject === subject,
          )?.level;
          const recommendation = data.recommendations.find(
            (entry) => entry.learner_id === l.id && entry.subject === subject,
          );
          return (
            <form
              key={subject + version}
              className="subject-level-row"
              onSubmit={(e) => {
                const f = fields(e);
                void save({
                  action: 'level',
                  learnerId: l.id,
                  subject,
                  level: f.get('level') ? Number(f.get('level')) : null,
                });
              }}
            >
              <div className="subject-level-name">
                <span className={`subject-level-icon subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}>
                  <LearnerIcon name={SUBJECT_LEVEL_ICONS[subject]}/>
                </span>
                <strong>{subject}</strong>
              </div>
              <label className="subject-level-picker">
                <span className="sr-only">{subject} level for {l.display_name}</span>
                <select name="level" defaultValue={level ?? ''} disabled={!data.canEdit}>
                  <option value="">Use overall class</option>
                  {Array.from({length: 10}, (_, i) => (
                    <option key={i} value={i + 1}>Class {i + 1}</option>
                  ))}
                </select>
              </label>
              {data.canEdit ? (
                <button className="subject-level-save" type="submit">
                  <LearnerIcon name="check"/>Save level
                </button>
              ) : <span className="subject-level-readonly">View only</span>}
              <div className="subject-level-destination">
                {recommendation?.href ? (
                  <Link href={recommendation.href}>Browse at Class {recommendation.grade} <span aria-hidden="true">→</span></Link>
                ) : (
                  <span>No matching textbook at this level. <Link href="/library">Explore resources</Link></span>
                )}
                <small className={level !== undefined ? 'is-custom' : ''}>
                  {level !== undefined ? 'Custom level saved' : 'Using overall class'}
                </small>
              </div>
            </form>
          );
        })}
      </div>
    </details>
  );
}
