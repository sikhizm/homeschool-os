'use client';
import {useState} from 'react';
import {updateChallenge} from './actions';

export default function AttemptForm({id, learner, assigned, deadline, today, points, bonus, latePoints, reward, lateReward}: {
  id: string; learner: string; assigned: string; deadline: string; today: string;
  points: number; bonus: number; latePoints: number; reward: string; lateReward: string | null;
}) {
  const [date, setDate] = useState(today);
  const earned = date < deadline ? points + bonus : date === deadline ? points : latePoints;
  return <form action={updateChallenge} className="challenge-form">
    <input type="hidden" name="learner" value={learner} />
    <input type="hidden" name="challenge" value={id} />
    <input type="hidden" name="reviewDeadline" value={deadline} />
    <label className="workspace-field"><span>Attempt date</span><input name="date" type="date" required min={assigned} max={today} value={date} onChange={event => setDate(event.target.value)} /></label>
    <label className="workspace-field"><span>Attempt note (optional)</span><input name="note" maxLength={1000} /></label>
    {date && <p className="muted">If verified: {earned} points · {(date <= deadline ? reward : lateReward) ?? 'No late reward agreed'}</p>}
    <div className="challenge-actions">
      <button className="btn-primary" name="action" value="passed">Verify completion</button>
      <button className="btn-secondary" name="action" value="retry">Record try again</button>
    </div>
  </form>;
}
