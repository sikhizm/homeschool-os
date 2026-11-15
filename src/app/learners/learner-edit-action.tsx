'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const stages = [
  'Infant (0–18 months)',
  'Toddler (18–36 months)',
  'Early Years',
  'Nursery',
  'LKG',
  'UKG',
  ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`),
];

export default function LearnerEditAction({
  id,
  name,
  stage,
}: {
  id: string;
  name: string;
  stage: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [learningStage, setLearningStage] = useState(stages.includes(stage) ? stage : 'Early Years');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch(`/api/learners/${encodeURIComponent(id)}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, stage: learningStage }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to update learner.');
      setOpen(false);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update learner.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="learner-edit-action">
      <button
        type="button"
        className="learner-edit-trigger"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value); setError(''); }}
      >
        {open ? 'Cancel editing' : 'Edit learner'}
      </button>
      {saved && !open && <span className="learner-edit-saved" role="status">Saved</span>}
      {open && (
        <form className="learner-edit-form" onSubmit={save}>
          <div className="learner-field">
            <label htmlFor={`learner-name-${id}`}>Learner name</label>
            <input
              id={`learner-name-${id}`}
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              maxLength={70}
              required
            />
          </div>
          <div className="learner-field">
            <label htmlFor={`learner-stage-${id}`}>Class / learning stage</label>
            <select
              id={`learner-stage-${id}`}
              value={learningStage}
              onChange={event => setLearningStage(event.target.value)}
            >
              {stages.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {error && <p className="learner-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy || !displayName.trim()}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </div>
  );
}
