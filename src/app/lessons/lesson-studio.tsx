'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { filterLessons, lessonStages, lessons, type Lesson } from '@/lib/lessons/library';
import { validDate } from '@/lib/learning/model';

type Learner = { id: string; name: string; stage: string };
type Props = { learners: Learner[]; canEdit: boolean; initialDate: string };

const subjects = ['English', 'Mathematics', 'Our world', 'Punjabi & Sikh heritage'] as const;

const stageFor = (stage: string) => {
  if (['Early Years', 'Nursery', 'LKG', 'UKG'].includes(stage)) return 'early';
  const n = Number(stage.replace('Class ', ''));
  if (n >= 1 && n <= 2) return 'class1-2';
  if (n >= 3 && n <= 5) return 'class3-5';
  if (n >= 6 && n <= 8) return 'class6-8';
  if (n >= 9 && n <= 10) return 'class9-10';
  if (n >= 11 && n <= 12) return 'class11-12';
  return 'early';
};

export default function LessonStudio({ learners, canEdit, initialDate }: Props) {
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? '');
  const [stage, setStage] = useState('');
  const [subject, setSubject] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(lessons[0]?.id ?? '');
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState(lessons[0]?.title ?? '');
  const [minutes, setMinutes] = useState(lessons[0]?.minutes ?? 15);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selected = lessons.find((lesson) => lesson.id === selectedId);
  const learner = learners.find((l) => l.id === learnerId);
  const listed = useMemo(() => filterLessons(stage, subject, search), [stage, subject, search]);

  function choose(lesson: Lesson) {
    setSelectedId(lesson.id);
    setTitle(lesson.title);
    setMinutes(lesson.minutes);
    setNote('');
    setError('');
    setNotice('');
  }

  async function addToDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!canEdit || !learnerId || !selected) return;
    if (
      !validDate(date) ||
      title.trim().length < 1 ||
      title.trim().length > 200 ||
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 120
    ) {
      setError('Choose a valid date, a title under 200 characters and a duration between 1 and 120 minutes.');
      return;
    }
    setBusy(true);
    try {
      // Reuse the existing authenticated, owner-checked learner endpoint.
      const response = await fetch(`/api/learners/${encodeURIComponent(learnerId)}/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activity.create',
          date,
          title: title.trim(),
          minutes,
          subjectId: null,
          goalId: null,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to add activity.');
      setNotice('Added to the selected learning day. You can link it to a subject or goal in the daily planner.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add activity.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lesson-studio studio-stack" style={{ marginTop: 0 }}>
      <section className="workspace-panel no-print studio-control-bar">
        <div className="panel-heading" style={{ marginBottom: 12 }}>
          <div>
            <span className="eyebrow">CURATED ACTIVITIES</span>
            <h2 style={{ margin: '4px 0 0' }}>Explore the library</h2>
          </div>
          <span className="pill">{listed.length} {listed.length === 1 ? 'activity' : 'activities'}</span>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          20 original parent-guided lesson starters. Stage bands are suggestions, not age limits or official syllabus lessons.
        </p>
        <div className="lesson-filters">
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Learning stage</span>
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">All stages</option>
              {lessonStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Search lessons</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Story, fraction, nature…"
              maxLength={80}
            />
          </label>
        </div>
      </section>

      <div className="lesson-layout" style={{ margin: 0 }}>
        <aside className="workspace-panel no-print lesson-selector">
          <div className="panel-heading" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 19 }}>Lessons</h2>
            <span className="pill">{listed.length}</span>
          </div>
          {listed.length === 0 && <p className="muted">No matching lessons. Try another filter.</p>}
          <div className="lesson-list">
            {listed.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                className={lesson.id === selectedId ? 'lesson-choice lesson-choice-active' : 'lesson-choice'}
                aria-pressed={lesson.id === selectedId}
                onClick={() => choose(lesson)}
              >
                <strong>{lesson.title}</strong>
                <small>
                  {lesson.subject} · {lessonStages.find((s) => s.id === lesson.stage)?.label} · {lesson.minutes} min
                </small>
              </button>
            ))}
          </div>
        </aside>

        <div className="lesson-main studio-stack">
          {selected ? (
            <article className="workspace-panel lesson-print-sheet" aria-label="Printable lesson sheet">
              <div className="lesson-print-heading">
                <span className="eyebrow">HOMESCHOOL OS · LEARNING SHEET</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="pill">
                    {lessonStages.find((s) => s.id === selected.stage)?.label} · {selected.subject}
                  </span>
                  <button type="button" className="btn-secondary no-print" onClick={() => window.print()}>
                    ⎙ Print sheet
                  </button>
                </div>
              </div>
              <h2>{selected.title}</h2>
              <p className="muted" style={{ marginTop: 0 }}>{selected.overview}</p>
              <div className="lesson-metadata">
                <span>
                  <strong>Time:</strong> {selected.minutes} min
                </span>
                <span>
                  <strong>Materials:</strong> {selected.materials}
                </span>
              </div>
              <h3>Learning intention</h3>
              <p>{selected.objective}</p>
              <h3>Do together</h3>
              <ol>
                {selected.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <h3>Discuss</h3>
              <ul>
                {selected.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
              <h3>Printable activity</h3>
              <p>{selected.worksheet}</p>
              <div aria-hidden="true" className="lesson-writing-lines">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} />
                ))}
              </div>
              <h3>Adaptation and safety</h3>
              <p>{selected.adaptation}</p>
              <div className="lesson-signoff-row">
                <div>
                  <strong>Parent observation</strong>
                  <div className="reflection-line" aria-hidden="true" />
                </div>
                <div>
                  <strong>Date</strong>
                  <div className="reflection-line" aria-hidden="true" />
                </div>
              </div>
              <p className="muted lesson-print-footer">
                Original educational activity, not a verbatim NCERT worksheet. Parent review required.
              </p>
            </article>
          ) : (
            <section className="workspace-panel workspace-empty">
              <h3>Choose a lesson to begin</h3>
            </section>
          )}

          {selected && (
            <section className="workspace-panel no-print">
              <div className="panel-heading" style={{ marginBottom: 10 }}>
                <div>
                  <span className="eyebrow">SCHEDULE ACTIVITY</span>
                  <h2 style={{ margin: '4px 0 0' }}>Add to a learning day</h2>
                </div>
                <button type="button" className="btn-secondary" onClick={() => window.print()}>
                  ⎙ Print / Save PDF
                </button>
              </div>
              {!learners.length ? (
                <p className="muted">
                  Add a learner first from <Link href="/learners">Learners</Link>.
                </p>
              ) : !canEdit ? (
                <p className="info-banner">Only the family owner may add learning activities.</p>
              ) : (
                <form onSubmit={(event) => void addToDay(event)} className="lesson-add-form">
                  <div className="portfolio-form-pair">
                    <label className="workspace-field" style={{ marginBottom: 0 }}>
                      <span>Learner</span>
                      <select value={learnerId} onChange={(e) => setLearnerId(e.target.value)}>
                        {learners.map((l) => (
                          <option value={l.id} key={l.id}>
                            {l.name} · {l.stage}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="workspace-field" style={{ marginBottom: 0 }}>
                      <span>Date</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min="2000-01-01"
                        max="2100-12-31"
                        required
                      />
                    </label>
                  </div>
                  <div className="portfolio-form-pair">
                    <label className="workspace-field" style={{ marginBottom: 0 }}>
                      <span>Activity title (editable)</span>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        required
                      />
                    </label>
                    <label className="workspace-field" style={{ marginBottom: 0 }}>
                      <span>Minutes</span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        step={1}
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        required
                      />
                    </label>
                  </div>
                  {learner && stageFor(learner.stage) !== selected.stage && (
                    <p className="info-banner">
                      This lesson is listed for a different stage. Adapt it to the learner before using it.
                    </p>
                  )}
                  <label className="workspace-field" style={{ marginBottom: 0 }}>
                    <span>Parent notes for this session (optional, not saved)</span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      maxLength={500}
                      placeholder="Make a private note for yourself before planning."
                    />
                  </label>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    Only the title, date and duration are saved as a planned activity. No completion or assessment records are generated automatically.
                  </p>
                  <div className="portfolio-form-actions">
                    <button type="submit" className="btn-primary" disabled={busy}>
                      {busy ? 'Adding…' : 'Add to daily planner'}
                    </button>
                    <Link className="btn-secondary" href={`/dashboard?date=${encodeURIComponent(date)}`}>
                      Open this day in Home →
                    </Link>
                  </div>
                </form>
              )}
              {notice && (
                <div role="status" aria-live="polite" className="recorded-note" style={{ marginTop: 14 }}>
                  {notice}
                </div>
              )}
              {error && (
                <p role="alert" className="error-banner" style={{ marginTop: 14 }}>
                  {error}
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <section className="workspace-panel no-print">
        <span className="eyebrow">RESPONSIBLE PRACTICE</span>
        <h2 style={{ margin: '4px 0 8px' }}>Using lessons responsibly</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Adult-led exploration should stay flexible and joyful. Early-years activities use hands-on objects and stories; infants and toddlers need responsive care and supervised play, not formal worksheets or independent screen time. For Sikh history and Gurbani, check primary text and reputable sources before sharing a quotation.
        </p>
      </section>
    </div>
  );
}
