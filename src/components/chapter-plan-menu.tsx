'use client';

import {useRef, useState, type FormEvent} from 'react';
import {activityLabels} from '@/lib/planning/chapter-activities';

type Learner = {id: string; name: string};

export default function ChapterPlanMenu({chapterId, title, learnerId, inline = false, canRevise = true, initialDate}: {
  chapterId: string; title: string; learnerId?: string; inline?: boolean; canRevise?: boolean; initialDate?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [period, setPeriod] = useState<'day' | 'week'>('day');
  const [date, setDate] = useState(initialDate ?? '');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selected, setSelected] = useState('');
  const [canSave, setCanSave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function open(next: 'day' | 'week') {
    setPeriod(next);
    setDate(initialDate ?? new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(new Date()));
    setMessage('Loading learners…');
    setCanSave(false);
    setLearners([]);
    dialog.current?.showModal();
    try {
      const response = await fetch('/api/chapter-plan', {cache: 'no-store'});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const options = data.learners as Learner[];
      setLearners(options);
      setSelected(options.find(item => item.id === learnerId)?.id ?? options[0]?.id ?? '');
      setCanSave(data.ready && data.canEdit && options.length > 0);
      setMessage(!data.ready ? 'Apply the chapter activities migration to use this planner.' :
        !data.canEdit ? 'Only a family owner can update plans.' : !options.length ? 'Add a learner first.' : '');
    } catch {
      setMessage('Could not load the planner. Close and try again.');
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canSave) return;
    setBusy(true);
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/chapter-plan', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chapterId, learnerId: selected, activity: fields.get('activity'), period, date})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(period === 'day' ? 'Saved to the daily plan.' : 'Saved to the weekly plan.');
      window.dispatchEvent(new Event('daily-plan-updated'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save this activity.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    {inline ? <button type="button" className="btn-secondary chapter-plan-plus" aria-label={`Plan ${title}`} onClick={() => void open('day')}>+</button> : <>
      <button type="button" className="btn-secondary" onClick={() => void open('day')}>Use today</button>
      <button type="button" className="btn-secondary" onClick={() => void open('week')}>Add to plan</button>
    </>}
    <dialog ref={dialog} className="chapter-plan-dialog" aria-label={`Plan ${title}`}>
      <h2>Plan chapter activity</h2>
      <p>{title}</p>
      <form onSubmit={save} className="studio-stack">
        <fieldset disabled={!learners.length || busy}>
          <label className="workspace-field"><span>Learner</span>
            <select value={selected} onChange={event => setSelected(event.target.value)} required>
              {learners.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="workspace-field"><span>When</span>
            <select value={period} onChange={event => setPeriod(event.target.value === 'week' ? 'week' : 'day')}>
              <option value="day">Daily plan</option><option value="week">Weekly plan</option>
            </select>
          </label>
          <label className="workspace-field"><span>{period === 'week' ? 'Week containing' : 'Scheduled date'}</span>
            <input type="date" value={date} onChange={event => setDate(event.target.value)} required />
          </label>
          <label className="workspace-field"><span>Activity</span>
            <select name="activity" defaultValue="reading">
              {Object.entries(activityLabels).filter(([key]) => canRevise || key !== 'revision').map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              {canRevise && <option value="reading-revision">Reading + Revision</option>}
              {canRevise && <option value="all">All three</option>}
            </select>
          </label>
        </fieldset>
        <div className="chapter-plan-buttons">
          <button className="btn-primary" disabled={!canSave || busy}>Add activity</button>
          <button type="button" className="btn-secondary" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {message && <p role="status" className="muted">{message}</p>}
      </form>
    </dialog>
  </>;
}
