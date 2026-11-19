import Link from 'next/link';
import {assignChallenge, updateChallenge} from './actions';
import AttemptForm from './attempt-form';
import {challengeScope, challengeToday} from './scope';

export const dynamic = 'force-dynamic';

const notices: Record<string, string> = {
  assigned: 'Challenge assigned.', passed: 'Completion verified and points recorded.', retry: 'Attempt recorded.',
  given: 'Reward marked as given.', extend: 'Deadline extended.',
  invalid: 'Check the dates, required fields and points. Late points cannot exceed on-time points.',
  unchanged: 'No change saved. Reload to check the current status or deadline.',
  owner: 'Only a family owner can make changes.', failed: 'The change could not be saved.',
};

export default async function ChallengesPage({searchParams}: {searchParams: Promise<{learner?: string; view?: string; notice?: string}>}) {
  const params = await searchParams;
  const {sql, familyId, canEdit} = await challengeScope();
  const [schema] = await sql`SELECT to_regclass('public.learning_challenges') IS NOT NULL
    AND to_regclass('public.learning_challenge_attempts') IS NOT NULL AS ready`;
  const learners = await sql`SELECT id::text AS id, display_name FROM learners
    WHERE family_id::text = ${familyId} AND archived_at IS NULL ORDER BY created_at, id`;
  const learner = String((learners.find(item => item.id === params.learner) ?? learners[0])?.id ?? '');
  const today = challengeToday();
  const view = params.view === 'overdue' || params.view === 'completed' ? params.view : 'active';
  const challenges = schema.ready && learner ? await sql`
    SELECT c.*, c.assigned_on::text AS assigned_date, c.deadline::text AS due_date,
      c.original_deadline::text AS original_date, c.completed_on::text AS completion_date,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', a.id, 'date', a.attempted_on, 'passed', a.passed, 'note', a.note)
        ORDER BY a.attempted_on DESC, a.recorded_at DESC) FROM learning_challenge_attempts a WHERE a.challenge_id = c.id), '[]'::jsonb) AS attempts
    FROM learning_challenges c JOIN learners l ON l.id = c.learner_id
    WHERE l.family_id::text = ${familyId} AND l.archived_at IS NULL AND l.id::text = ${learner}
    ORDER BY c.deadline, c.id
  ` : [];
  const points = challenges.reduce((sum, item) => sum + Number(item.points_earned ?? 0), 0);
  const visible = challenges.filter(item => view === 'completed' ? item.completed_on : !item.completed_on &&
    (view === 'overdue' ? item.due_date < today : item.due_date >= today));

  return <main className="family-dashboard studio-stack">
    <header className="studio-page-head">
      <div><h1>Challenges &amp; Rewards</h1><p className="muted">Assign challenges, verify attempts and track earned rewards.</p></div>
    </header>
    {!schema.ready ? <p className="workspace-panel">Apply the learning challenges migration to start recording challenges.</p> : !learner ?
      <p className="workspace-panel">Add a learner to assign a challenge.</p> : <>
      <section className="workspace-panel studio-stack">
        <nav className="learner-switcher" aria-label="Choose learner">
          {learners.map(item => <Link className={item.id === learner ? 'learner-pill is-active' : 'learner-pill'}
            key={String(item.id)} href={'/challenges?' + new URLSearchParams({learner: String(item.id), view})}>
            {String(item.display_name)}</Link>)}
        </nav>
        <strong>{points} points earned</strong>
        {params.notice && notices[params.notice] && <p role="status">{notices[params.notice]}</p>}
        {canEdit && <details className="challenge-details">
          <summary>Assign a challenge</summary>
          <form className="challenge-form" action={assignChallenge}>
            <input type="hidden" name="learner" value={learner} />
            <fieldset className="challenge-recipients"><legend>Assign to</legend>
              {learners.map(item => <label key={String(item.id)}><input type="checkbox" name="recipient" value={String(item.id)} defaultChecked={item.id === learner} /> {String(item.display_name)}</label>)}
            </fieldset>
            <label className="workspace-field"><span>Challenge</span><input name="title" required maxLength={180} /></label>
            <label className="workspace-field"><span>How will you verify it?</span><textarea name="criteria" required maxLength={1000} /></label>
            <label className="workspace-field"><span>Assigned date</span><input name="assigned" type="date" defaultValue={today} max={today} required /></label>
            <label className="workspace-field"><span>Deadline</span><input name="deadline" type="date" required /></label>
            <label className="workspace-field"><span>Promised reward</span><input name="reward" required maxLength={300} /></label>
            <label className="workspace-field"><span>Late reward (optional)</span><input name="lateReward" maxLength={300} /></label>
            <label className="workspace-field"><span>On-time points</span><input name="points" type="number" min={0} max={1000} defaultValue={10} required /></label>
            <label className="workspace-field"><span>Early bonus points</span><input name="bonus" type="number" min={0} max={1000} defaultValue={0} required /></label>
            <label className="workspace-field"><span>Late points</span><input name="latePoints" type="number" min={0} max={1000} defaultValue={0} required /></label>
            <div><button className="btn-primary">Assign challenge</button></div>
          </form>
        </details>}
      </section>
      <nav className="challenge-actions" aria-label="Challenge status">
        {(['active','overdue','completed'] as const).map(status => <Link key={status} className={status === view ? 'btn-primary' : 'btn-secondary'}
          aria-current={status === view ? 'page' : undefined} href={'/challenges?' + new URLSearchParams({learner, view: status})}>
          {{active:'Active', overdue:'Overdue', completed:'Completed'}[status]}</Link>)}
      </nav>
      {!visible.length && <p className="muted">No {view} challenges.</p>}
      {visible.map(item => {
        const id = String(item.id);
        const completed = Boolean(item.completed_on);
        return <article key={id} className="workspace-panel challenge-card">
          <h2>{String(item.title)}</h2>
          <p>{String(item.criteria)}</p>
          <p className="muted">Assigned {String(item.assigned_date)} · Due {String(item.due_date)}
            {item.original_date !== item.due_date && <> · Originally due {String(item.original_date)}</>}</p>
          {completed ? <>
            <p>Completed {String(item.completion_date)} · {String(item.points_earned)} points</p>
            <p>{item.reward_earned ? <>{String(item.reward_earned)} · {item.reward_given_at ? 'Reward given' : 'Reward to give'}</> : 'No reward earned'}</p>
            {canEdit && item.reward_earned && !item.reward_given_at && <form action={updateChallenge}>
              <input type="hidden" name="learner" value={learner} /><input type="hidden" name="challenge" value={id} />
              <button className="btn-secondary" name="action" value="given">Mark reward given</button>
            </form>}
          </> : <>
            <p>Promised reward: {String(item.promised_reward)} · {String(item.on_time_points)} points
              {Number(item.early_bonus) > 0 && <> · +{String(item.early_bonus)} early</>}</p>
            <p className="muted">Late: {String(item.late_points)} points · {String(item.late_reward ?? 'No reward agreed')}</p>
            {canEdit && <>
              <details className="challenge-details"><summary>Record an attempt</summary>
                <AttemptForm id={id} learner={learner} assigned={String(item.assigned_date)} deadline={String(item.due_date)} today={today}
                  points={Number(item.on_time_points)} bonus={Number(item.early_bonus)} latePoints={Number(item.late_points)}
                  reward={String(item.promised_reward)} lateReward={item.late_reward ? String(item.late_reward) : null} />
              </details>
              <details className="challenge-details"><summary>Extend deadline</summary>
                <form action={updateChallenge} className="challenge-form">
                  <input type="hidden" name="learner" value={learner} /><input type="hidden" name="challenge" value={id} />
                  <label className="workspace-field"><span>New deadline</span><input name="date" type="date" min={String(item.due_date)} required /></label>
                  <div><button className="btn-secondary" name="action" value="extend">Save new deadline</button></div>
                </form>
              </details>
            </>}
          </>}
          {Array.isArray(item.attempts) && item.attempts.length > 0 && <details className="challenge-details">
            <summary>Attempts ({item.attempts.length})</summary>
            <ul>{(item.attempts as {id: string; date: string; passed: boolean; note: string}[]).map(attempt =>
              <li key={attempt.id}>{attempt.date} · {attempt.passed ? 'Completed' : 'Try again'}{attempt.note && <> · {attempt.note}</>}</li>)}</ul>
          </details>}
        </article>;
      })}
    </>}
  </main>;
}
