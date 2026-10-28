'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  FOUNDATIONS,
  STAGES,
  type Workspace,
  type Activity,
} from '@/lib/learning/model';

type Learner = { id: string; display_name: string; stage: string };
type Props = { learners: Learner[]; canEdit: boolean; initialDate: string; suggestedGoal?: string; suggestedSubject?: string };
const empty: Workspace = { subjects: [], goals: [], activities: [] };
const value = (data: FormData, key: string) => String(data.get(key) ?? '');
const shiftDay = (date: string, offset: number) => {
  const day = new Date(date + 'T12:00:00Z');
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
};
const friendlyDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
const workspaceTabs = [
  { name: 'Today', symbol: '☀', detail: 'Your day' },
  { name: 'Goals', symbol: '◎', detail: 'Small steps' },
  { name: 'Subjects', symbol: '▤', detail: 'Learning areas' },
  { name: 'Profile', symbol: '♧', detail: 'Learner details' },
] as const;
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="workspace-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export default function LearningWorkspace({
  learners,
  canEdit,
  initialDate,
  suggestedGoal = '',
  suggestedSubject = '',
}: Props) {
  const [selected, setSelected] = useState(learners[0]?.id ?? '');
  const [date, setDate] = useState(initialDate);
  const [tab, setTab] = useState(suggestedGoal ? 'Goals' : 'Today');
  const learner = learners.find((l) => l.id === selected) ?? learners[0];
  return (
    <>
      <div className="learner-picker" aria-label="Choose learner">
        {learners.map((l) => (
          <button
            key={l.id}
            aria-pressed={learner?.id === l.id}
            onClick={() => setSelected(l.id)}
          >
            <span className="mini-avatar" aria-hidden="true">
              {l.display_name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              {l.display_name}
              <small>{l.stage}</small>
            </span>
          </button>
        ))}
      </div>
      {learner ? (
        <>
          <nav className="workspace-tabs" aria-label="Learning workspace">
            {workspaceTabs.map((item) => (
              <button
                key={item.name}
                aria-label={item.name}
                aria-current={tab === item.name ? 'page' : undefined}
                onClick={() => setTab(item.name)}
                type="button"
              >
                <span className="workspace-tab-icon" aria-hidden="true">{item.symbol}</span>
                <span className="workspace-tab-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
              </button>
            ))}
          </nav>
          <LearnerWorkspace
            key={`${learner.id}:${date}`}
            learner={learner}
            canEdit={canEdit}
            date={date}
            setDate={setDate}
            tab={tab}
            suggestedGoal={suggestedGoal}
            suggestedSubject={suggestedSubject}
          />
        </>
      ) : (
        <div className="workspace-empty">
          <h2>A learning journey starts with a learner</h2>
          <p>
            Add a profile below to plan subjects, goals and your first learning
            day.
          </p>
        </div>
      )}
    </>
  );
}
function LearnerWorkspace({
  learner,
  canEdit,
  date,
  setDate,
  tab,
  suggestedGoal,
  suggestedSubject,
}: {
  learner: Learner;
  canEdit: boolean;
  date: string;
  setDate: (date: string) => void;
  tab: string;
  suggestedGoal: string;
  suggestedSubject: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<Workspace>(empty);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const endpoint = `/api/learners/${encodeURIComponent(learner.id)}/workspace`;
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(`${endpoint}?date=${date}`, {
        cache: 'no-store',
        signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || 'Unable to load learning workspace.');
      return body as Workspace;
    },
    [endpoint, date],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((body) => {
        if (!controller.signal.aborted) setData(body);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [load]);
  async function save(
    command: Record<string, unknown>,
    form?: HTMLFormElement,
  ) {
    if (busy || !canEdit) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save.');
      form?.reset();
      setNotice('Saved.');
      try {
        setData(await load());
        setRevision((r) => r + 1);
      } catch {
        setLoadError(
          'Your change was saved, but the view could not refresh. Reload the page before making another change.',
        );
      }
      if (command.action === 'learner.update') router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Network error. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  function submit(
    action: string,
    build: (d: FormData) => Record<string, unknown>,
    reset = false,
  ) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      void save(
        { action, ...build(new FormData(form)) },
        reset ? form : undefined,
      );
    };
  }
  const subjects = data.subjects.filter((s) => !s.archived);
  const minutes = data.activities.reduce((n, a) => n + a.minutes, 0);
  const completedMinutes = data.activities
    .filter((a) => a.completed)
    .reduce((n, a) => n + a.minutes, 0);
  const mastered = data.goals.filter((g) => g.progress === 100).length;
  const completedCount = data.activities.filter((a) => a.completed).length;
  const completionRatio = data.activities.length ? Math.round((completedCount / data.activities.length) * 100) : 0;
  const subjectName = (id: string | null) =>
    data.subjects.find((s) => s.id === id)?.name ?? 'Together time';
  if (loading)
    return (
      <p className="workspace-empty" role="status">
        Opening {learner.display_name}’s learning workspace…
      </p>
    );
  if (loadError)
    return (
      <div className="workspace-empty" role="alert">
        <h2>Workspace unavailable</h2>
        <p>{loadError}</p>
        <p>
          Existing learner profiles are safe. The learning-management migration
          and database configuration must be available.
        </p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  return (
    <div className="learning-workspace">
      {!canEdit && (
        <p className="info-banner">
          You have view access. A family owner can edit profiles and learning
          plans.
        </p>
      )}
      <div role="status" aria-live="polite" className="save-status">
        {busy ? 'Saving…' : notice}
      </div>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      {tab === 'Today' && (
        <>
          <div className="section-heading">
            <div>
              <span className="eyebrow">A LITTLE EVERY DAY</span>
              <h2>{learner.display_name}’s learning day</h2>
              <p className="muted">
                About an hour together. Make room for curiosity, movement and
                rest.
              </p>
            </div>
            <div className="day-picker">
              <span className="day-picker-caption">LEARNING DAY</span>
              <div className="day-picker-row">
                <button type="button" aria-label="Previous day" className="day-shift" disabled={busy || date <= '2000-01-01'} onClick={() => setDate(shiftDay(date, -1))}>‹</button>
                <label className="day-picker-date">
                  <span className="day-picker-human">{friendlyDate(date)}</span>
                  <input
                    type="date"
                    aria-label="Learning date"
                    min="2000-01-01"
                    max="2100-12-31"
                    value={date}
                    onChange={(e) => { if (e.target.value) setDate(e.target.value); }}
                    disabled={busy}
                  />
                </label>
                <button type="button" aria-label="Next day" className="day-shift" disabled={busy || date >= '2100-12-31'} onClick={() => setDate(shiftDay(date, 1))}>›</button>
              </div>
            </div>
          </div>
          <section className="day-progress" aria-label="Today's activity progress">
            <div className="day-progress-badge" aria-hidden="true">
              <svg viewBox="0 0 100 100" role="presentation">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#DEEDE2" strokeWidth="9"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#367D60" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${completionRatio * 2.513} 251.3`} transform="rotate(-90 50 50)"/>
              </svg>
              <span>{completionRatio}%</span>
            </div>
            <div className="day-progress-copy">
              <span className="eyebrow">TODAY&apos;S LITTLE WINS</span>
              <h3>{!data.activities.length ? 'A fresh page for new discoveries' : completedCount === data.activities.length ? 'You explored everything planned!' : 'Every small step counts'}</h3>
              <p>{!data.activities.length ? 'Begin with one activity, then follow your learner’s curiosity.' : `${completedCount} of ${data.activities.length} planned activities marked complete. Take your time—learning isn't a race.`}</p>
            </div>
            <span className="day-progress-decoration" aria-hidden="true">✳</span>
          </section>
          <div className="metric-grid">
            <div>
              <strong>
                {minutes}
                <small> / 60 min</small>
              </strong>
              <span>Planned together</span>
            </div>
            <div>
              <strong>
                {completedMinutes}
                <small> min</small>
              </strong>
              <span>Marked complete</span>
            </div>
            <div>
              <strong>{data.goals.length - mastered}</strong>
              <span>Goals in progress</span>
            </div>
          </div>
          {minutes > 60 && (
            <p className="info-banner">
              This day is {minutes - 60} minutes over the suggested hour.
              Consider shorter sessions or spreading activities across days.
            </p>
          )}
          <div className="planner-layout">
            <section className="workspace-panel">
              <div className="panel-heading">
                <h3><span className="rhythm-heading-mark" aria-hidden="true">✿</span> Your daily rhythm</h3>
                <span className="pill">
                  {data.activities.length} activities
                </span>
              </div>
              {!data.activities.length ? (
                <div className="workspace-empty">
                  <span className="empty-mark" aria-hidden="true">
                    ✧
                  </span>
                  <h3>Start with a gentle rhythm</h3>
                  <p>
                    A 60-minute suggestion with literacy, maths, exploration,
                    Sikh heritage and reflection. Adapt it to your child;
                    nothing is marked complete automatically.
                  </p>
                  {canEdit && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void save({ action: 'plan.starter', date })
                      }
                    >
                      Plan a balanced hour
                    </button>
                  )}
                </div>
              ) : (
                <ol className="activity-list">
                  {data.activities.map((a, i) => (
                    <li key={a.id}>
                      <ActivityCard
                        key={`${a.id}:${revision}`}
                        activity={a}
                        index={i}
                        label={subjectName(a.subject_id)}
                        goal={data.goals.find((g) => g.id === a.goal_id)?.title}
                        disabled={busy || !canEdit}
                        save={save}
                        submit={submit}
                        canEdit={canEdit}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <aside>
              <div className="workspace-panel guidance">
                <span className="eyebrow">PARENT’S COMPASS</span>
                <h3>Connection before completion</h3>
                <p>
                  Use NCERT learning outcomes as a foundation, rather than
                  rushing through chapters.
                </p>
                <ul>
                  <li>
                    Early years: stories, sensory play and everyday objects;
                    split the hour into short sessions.
                  </li>
                  <li>
                    School years: explore one concept, practise, then explain it
                    back.
                  </li>
                  <li>
                    Weave Punjabi, seva, equality and Sikh stories into
                    conversation and real life.
                  </li>
                </ul>
                <p className="muted">
                  Share stories and exploration across learners to keep the
                  family’s guided time manageable. Progress is recorded by you,
                  based on what you observe.
                </p>
              </div>
            </aside>
          </div>
          {canEdit && (
            <section className="workspace-panel">
              <h3><span className="rhythm-heading-mark" aria-hidden="true">＋</span> Add an activity</h3>
              <ActivityForm
                key={revision}
                subjects={subjects}
                goals={data.goals}
                disabled={busy}
                onSubmit={submit(
                  'activity.create',
                  (d) => ({
                    date,
                    title: value(d, 'title'),
                    minutes: Number(d.get('minutes')),
                    subjectId: value(d, 'subjectId') || null,
                    goalId: value(d, 'goalId') || null,
                  }),
                  true,
                )}
              />
            </section>
          )}
        </>
      )}
      {tab === 'Subjects' && (
        <>
          <div className="section-heading">
            <div>
              <span className="eyebrow">BUILD THE FOUNDATIONS</span>
              <h2>Subjects & approaches</h2>
              <p className="muted">
                A personal curriculum for {learner.display_name}. Archive a
                subject to keep its history without planning new work.
              </p>
            </div>
          </div>
          {!data.subjects.length && (
            <p className="workspace-empty">
              No subjects yet. Choose a foundation below or add your own.
            </p>
          )}
          <div className="subject-grid">
            {data.subjects.map((s) => (
              <article
                className={`workspace-panel ${s.archived ? 'archived' : ''}`}
                key={s.id}
              >
                <div className="panel-heading">
                  <h3>{s.name}</h3>
                  {s.archived && <span className="pill">Archived</span>}
                </div>
                <p className="muted">
                  {s.approach || 'Add an approach that works for your learner.'}
                </p>
                <small>
                  {data.goals.filter((g) => g.subject_id === s.id).length}{' '}
                  learning goals
                </small>
                {canEdit && (
                  <details>
                    <summary>Edit subject</summary>
                    <form
                      key={revision}
                      onSubmit={submit('subject.update', (d) => ({
                        id: s.id,
                        name: value(d, 'name'),
                        approach: value(d, 'approach'),
                        archived: d.has('archived'),
                      }))}
                    >
                      <fieldset disabled={busy}>
                        <Field label="Subject name">
                          <input
                            name="name"
                            defaultValue={s.name}
                            maxLength={80}
                            required
                          />
                        </Field>
                        <Field label="Learning approach">
                          <textarea
                            name="approach"
                            defaultValue={s.approach}
                            maxLength={600}
                            rows={3}
                          />
                        </Field>
                        <label className="check-label">
                          <input
                            name="archived"
                            type="checkbox"
                            defaultChecked={s.archived}
                          />{' '}
                          Archive subject (history stays)
                        </label>
                        <button>Save subject</button>
                      </fieldset>
                    </form>
                  </details>
                )}
              </article>
            ))}
          </div>
          {canEdit && (
            <>
              <section className="workspace-panel">
                <h3>Add a subject</h3>
                <form
                  onSubmit={submit(
                    'subject.create',
                    (d) => ({
                      name: value(d, 'name'),
                      approach: value(d, 'approach'),
                    }),
                    true,
                  )}
                >
                  <fieldset disabled={busy} className="form-grid">
                    <Field label="Subject name">
                      <input
                        name="name"
                        maxLength={80}
                        required
                        placeholder="e.g. Mathematics"
                      />
                    </Field>
                    <Field label="Learning approach">
                      <input
                        name="approach"
                        maxLength={600}
                        placeholder="What helps your learner understand?"
                      />
                    </Field>
                    <button>Add subject</button>
                  </fieldset>
                </form>
              </section>
              <section>
                <h3>Suggested foundations</h3>
                <p className="muted">
                  Starting points inspired by CBSE/NCERT. Tailor the level and
                  materials to the learner; these are not a complete syllabus.
                </p>
                <div className="subject-grid">
                  {FOUNDATIONS.filter(
                    (f) =>
                      !data.subjects.some(
                        (s) => s.name.toLowerCase() === f.name.toLowerCase(),
                      ),
                  ).map((f) => (
                    <article className="foundation-card" key={f.name}>
                      <h4>{f.name}</h4>
                      <p>{f.approach}</p>
                      <button
                        disabled={busy}
                        onClick={() =>
                          void save({ action: 'subject.create', ...f })
                        }
                      >
                        Add {f.name}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
      {tab === 'Goals' && (
        <>
          <div className="section-heading">
            <div>
              <span className="eyebrow">NOTICE THE SMALL STEPS</span>
              <h2>Individual learning goals</h2>
              <p className="muted">
                Set an observable goal, then record progress from real learning.{' '}
                {mastered} of {data.goals.length} goals reached.
              </p>
            </div>
          </div>
          {!data.goals.length && (
            <p className="workspace-empty">
              No goals recorded. Start with one small, observable outcome:
              “Retell a short story in my own words.”
            </p>
          )}
          <div className="subject-grid">
            {data.goals.map((g) => (
              <article className="workspace-panel goal-card" key={g.id}>
                <span className="eyebrow">{subjectName(g.subject_id)}</span>
                <h3>{g.title}</h3>
                <div className="progress-caption">
                  <span>
                    {g.progress === 100
                      ? 'Goal reached'
                      : 'Parent-recorded progress'}
                  </span>
                  <strong>{g.progress}%</strong>
                </div>
                <progress
                  max="100"
                  value={g.progress}
                  aria-label={`${g.title} progress`}
                />
                {g.target_date && (
                  <p className="muted">Aim for {g.target_date}</p>
                )}
                {g.evidence && <p className="evidence">{g.evidence}</p>}
                {canEdit && (
                  <details>
                    <summary>Update goal & progress</summary>
                    <form
                      key={revision}
                      onSubmit={submit('goal.update', (d) => ({
                        id: g.id,
                        title: value(d, 'title'),
                        progress: Number(d.get('progress')),
                        evidence: value(d, 'evidence'),
                        targetDate: value(d, 'targetDate') || null,
                      }))}
                    >
                      <fieldset disabled={busy}>
                        <Field label="Observable goal">
                          <input
                            name="title"
                            defaultValue={g.title}
                            maxLength={200}
                            required
                          />
                        </Field>
                        <Field label="Progress (0–100%)">
                          <input
                            name="progress"
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            defaultValue={g.progress}
                            required
                          />
                        </Field>
                        <Field label="Target date (optional)">
                          <input
                            name="targetDate"
                            type="date"
                            min="2000-01-01"
                            max="2100-12-31"
                            defaultValue={g.target_date ?? ''}
                          />
                        </Field>
                        <Field label="What did you observe? (optional)">
                          <textarea
                            name="evidence"
                            maxLength={1000}
                            defaultValue={g.evidence}
                            rows={3}
                          />
                        </Field>
                        <p className="muted">
                          Only record what you observed. Completing an activity
                          does not automatically change this goal.
                        </p>
                        <button>Save progress</button>
                      </fieldset>
                    </form>
                  </details>
                )}
              </article>
            ))}
          </div>
          {canEdit && (
            <section className="workspace-panel">
              <h3>Set a learning goal</h3>
              {suggestedGoal && <p className="info-banner">Suggested from the curriculum map. Review and adapt the wording and subject before saving. No progress is recorded automatically.</p>}
              {!subjects.length ? (
                <p>Add an active subject in the Subjects tab first.</p>
              ) : (
                <form
                  onSubmit={submit(
                    'goal.create',
                    (d) => ({
                      subjectId: value(d, 'subjectId'),
                      title: value(d, 'title'),
                      targetDate: value(d, 'targetDate') || null,
                    }),
                    true,
                  )}
                >
                  <fieldset disabled={busy} className="form-grid">
                    <Field label="Subject">
                      <select name="subjectId" required defaultValue={subjects.find((s) => s.name.toLowerCase() === suggestedSubject.toLowerCase())?.id ?? subjects[0]?.id}>
                        {subjects.map((s) => (
                          <option value={s.id} key={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Observable goal">
                      <input
                        name="title"
                        maxLength={200}
                        required
                        placeholder="e.g. Compare two-digit numbers using objects"
                        defaultValue={suggestedGoal}
                      />
                    </Field>
                    <Field label="Target date (optional)">
                      <input
                        name="targetDate"
                        type="date"
                        min="2000-01-01"
                        max="2100-12-31"
                      />
                    </Field>
                    <button>Add goal</button>
                  </fieldset>
                </form>
              )}
            </section>
          )}
        </>
      )}
      {tab === 'Profile' && (
        <section className="workspace-panel profile-panel">
          <span className="eyebrow">GROW AT YOUR OWN PACE</span>
          <h2>{learner.display_name}’s profile</h2>
          <p className="muted">
            Use a nickname if you prefer. A learning stage guides suggestions,
            rather than limiting your child.
          </p>
          <form
            onSubmit={submit('learner.update', (d) => ({
              displayName: value(d, 'displayName'),
              stage: value(d, 'stage'),
            }))}
          >
            <fieldset disabled={busy || !canEdit}>
              <Field label="Display name">
                <input
                  name="displayName"
                  defaultValue={learner.display_name}
                  maxLength={70}
                  required
                  autoComplete="off"
                />
              </Field>
              <Field label="Learning stage">
                <select name="stage" defaultValue={learner.stage}>
                  {STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              {canEdit && <button>Save profile</button>}
            </fieldset>
          </form>
          <p className="muted">
            Updating this profile preserves its subjects, goals and daily plans.
          </p>
        </section>
      )}
    </div>
  );
}
function ActivityCard({
  activity: a,
  index,
  label,
  goal,
  disabled,
  canEdit,
  save,
  submit,
}: {
  activity: Activity;
  index: number;
  label: string;
  goal?: string;
  disabled: boolean;
  canEdit: boolean;
  save: (command: Record<string, unknown>) => Promise<void>;
  submit: (
    action: string,
    build: (d: FormData) => Record<string, unknown>,
  ) => (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className={`activity-card ${a.completed ? 'is-complete' : ''}`}>
      <div className="activity-top">
        <span className="activity-number" aria-hidden="true">{a.completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
        <div className="activity-copy">
          <span className="eyebrow">{label}</span>
          <h4>{a.title}</h4>
          {goal && <small>Goal: {goal}</small>}
        </div>
        <span className="duration">
          {a.minutes}
          <small>min</small>
        </span>
      </div>
      <label className="check-label">
        <input
          type="checkbox"
          checked={a.completed}
          disabled={disabled}
          onChange={(e) =>
            void save({
              action: 'activity.update',
              id: a.id,
              title: a.title,
              minutes: a.minutes,
              reflection: a.reflection,
              completed: e.target.checked,
            })
          }
        />
        {a.completed ? 'Completed together' : 'Mark complete after learning'}
      </label>
      {a.reflection && <p className="evidence">{a.reflection}</p>}
      {canEdit && (
        <details>
          <summary>Edit activity & reflection</summary>
          <form
            onSubmit={submit('activity.update', (d) => ({
              id: a.id,
              title: value(d, 'title'),
              minutes: Number(d.get('minutes')),
              reflection: value(d, 'reflection'),
              completed: a.completed,
              scheduledDate: value(d, 'scheduledDate'),
              position: Number(d.get('position')),
            }))}
          >
            <fieldset disabled={disabled}>
              <Field label="Activity">
                <input
                  name="title"
                  defaultValue={a.title}
                  maxLength={200}
                  required
                />
              </Field>
              <Field label="Minutes">
                <input
                  name="minutes"
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  defaultValue={a.minutes}
                  required
                />
              </Field>
              <Field label="Learning date">
                <input
                  name="scheduledDate"
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  defaultValue={a.learning_date}
                  required
                />
              </Field>
              <Field label="Order in day (lower first)">
                <input
                  name="position"
                  type="number"
                  min="0"
                  max="1000"
                  defaultValue={a.position}
                  required
                />
              </Field>
              <Field label="Reflection (optional)">
                <textarea
                  name="reflection"
                  defaultValue={a.reflection}
                  maxLength={1000}
                  rows={2}
                />
              </Field>
              <button>Save activity</button>
            </fieldset>
          </form>
        </details>
      )}
    </article>
  );
}
function ActivityForm({
  subjects,
  goals,
  disabled,
  onSubmit,
}: {
  subjects: Workspace['subjects'];
  goals: Workspace['goals'];
  disabled: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const [subject, setSubject] = useState('');
  return (
    <form onSubmit={onSubmit}>
      <fieldset className="form-grid" disabled={disabled}>
        <Field label="Activity">
          <input
            name="title"
            maxLength={200}
            required
            placeholder="What will you explore together?"
          />
        </Field>
        <Field label="Minutes">
          <input
            name="minutes"
            type="number"
            min="1"
            max="120"
            step="1"
            defaultValue={10}
            required
          />
        </Field>
        <Field label="Subject (optional)">
          <select
            name="subjectId"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Together time</option>
            {subjects.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Learning goal (optional)">
          <select name="goalId" key={subject} defaultValue="">
            <option value="">No linked goal</option>
            {goals
              .filter((g) => g.subject_id === subject)
              .map((g) => (
                <option value={g.id} key={g.id}>
                  {g.title}
                </option>
              ))}
          </select>
        </Field>
        <button>Add to day</button>
      </fieldset>
    </form>
  );
}
