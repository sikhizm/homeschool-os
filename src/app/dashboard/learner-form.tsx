'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const stages = ['Early Years', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)];
export default function LearnerForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [stage, setStage] = useState('Early Years');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/learners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, stage }),
      });
      if (!response.ok) {
        const result: { error?: string } = await response.json();
        setError(result.error || 'Unable to save learner.');
        return;
      }
      setDisplayName('');
      setStage('Early Years');
      router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally { setPending(false); }
  }
  return <form className="learner-form" onSubmit={submit}>
    <div className="learner-field">
      <label htmlFor="learner-name">Display name</label>
      <input id="learner-name" type="text" autoComplete="off" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={70} required placeholder="Name or nickname" />
    </div>
    <div className="learner-field">
      <label htmlFor="learner-stage">Learning stage</label>
      <select id="learner-stage" value={stage} onChange={event => setStage(event.target.value)}>{stages.map(item => <option key={item} value={item}>{item}</option>)}</select>
    </div>
    <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Add learner'}</button>
    {error && <p role="alert" className="learner-error">{error}</p>}
  </form>;
}
