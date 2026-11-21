import Link from 'next/link';
import {assignChallenge, updateChallenge} from './actions';
import AttemptForm from './attempt-form';
import {ChallengeControls, ChallengeNotice} from './challenge-controls';
import {challengeScope, challengeToday} from './scope';
import styles from './challenges.module.css';

export const dynamic = 'force-dynamic';

const notices: Record<string, string> = {
  assigned: 'Challenge assigned.', passed: 'Completion verified and points recorded.', retry: 'Attempt recorded.',
  given: 'Reward marked as given.', extend: 'Deadline extended.',
  invalid: 'Check the dates, required fields and points. Late points cannot exceed on-time points.',
  unchanged: 'No change saved. Reload to check the current status or deadline.',
  owner: 'Only a family owner can make changes.', failed: 'The change could not be saved.',
};

const statusLabels = {active: 'Active', overdue: 'Overdue', completed: 'Completed'} as const;
const statusViews = ['active', 'overdue', 'completed'] as const;
const shortDate = new Intl.DateTimeFormat('en-IN', {day: 'numeric', month: 'short', timeZone: 'UTC'});
const fullDate = new Intl.DateTimeFormat('en-IN', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});

function ChallengeDate({date, today}: {date: string; today: string}) {
  const formatter = date.slice(0, 4) === today.slice(0, 4) ? shortDate : fullDate;
  return <time dateTime={date}>{formatter.format(new Date(date))}</time>;
}

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
  const byStatus: Record<typeof view, (typeof challenges)[number][]> = {active: [], overdue: [], completed: []};
  for (const challenge of challenges) {
    const status = challenge.completed_on ? 'completed' : challenge.due_date < today ? 'overdue' : 'active';
    byStatus[status].push(challenge);
  }
  const visible = byStatus[view];
  const notice = params.notice && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;

  return <main className={`family-dashboard ${styles.page}`}>
    <header>
      <ChallengeControls
        key={learner}
        heading={<h1>Challenges &amp; Rewards</h1>}
        primary={schema.ready && learner && canEdit ? {
          label: 'Assign challenge',
          icon: '+',
          content: (
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
          ),
        } : undefined}
      />
    </header>
    {!schema.ready ? <p className="workspace-panel">Apply the learning challenges migration to start recording challenges.</p> : !learner ?
      <p className="workspace-panel">Add a learner to assign a challenge.</p> : <>
      <div className={styles.toolbar}>
        <nav className={styles.learners} aria-label="Choose learner">
          {learners.map(item => <Link aria-current={item.id === learner ? 'true' : undefined}
            key={String(item.id)} href={'/challenges?' + new URLSearchParams({learner: String(item.id), view})}>
            {String(item.display_name)}</Link>)}
        </nav>
        <strong className={styles.points}><span aria-hidden="true">★</span> {points} {points === 1 ? 'point' : 'points'} earned</strong>
      </div>
      {notice && <ChallengeNotice key={params.notice} message={notice} temporary={params.notice === 'assigned'} />}
      <nav className={styles.tabs} aria-label="Challenge status">
        {statusViews.map(status => <Link key={status}
          aria-current={status === view ? 'page' : undefined} href={'/challenges?' + new URLSearchParams({learner, view: status})}>
          {statusLabels[status]} <span>{byStatus[status].length}</span></Link>)}
      </nav>
      {!visible.length && <p className={styles.empty}>No {view} challenges.</p>}
      {visible.map(item => {
        const id = String(item.id);
        const completed = Boolean(item.completed_on);
        return <article key={id} className={styles.card}>
          <div className={styles.challenge}>
            <h2>{String(item.title)}</h2>
            <p className={styles.criteria}>{String(item.criteria)}</p>
            <div className={styles.dates}>
              <span>Assigned <ChallengeDate date={String(item.assigned_date)} today={today} /></span>
              <span className={styles.deadline} data-overdue={view === 'overdue' ? 'true' : undefined}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
                Due <ChallengeDate date={String(item.due_date)} today={today} />
              </span>
              {item.original_date !== item.due_date &&
                <span>Originally due <ChallengeDate date={String(item.original_date)} today={today} /></span>}
            </div>
            {!completed && canEdit && <ChallengeControls
              primary={{
                label: 'Record attempt',
                content: <AttemptForm id={id} learner={learner} assigned={String(item.assigned_date)} deadline={String(item.due_date)} today={today}
                  points={Number(item.on_time_points)} bonus={Number(item.early_bonus)} latePoints={Number(item.late_points)}
                  reward={String(item.promised_reward)} lateReward={item.late_reward ? String(item.late_reward) : null} />,
              }}
              secondary={{
                label: 'Extend deadline',
                content: <form action={updateChallenge} className="challenge-form">
                  <input type="hidden" name="learner" value={learner} />
                  <input type="hidden" name="challenge" value={id} />
                  <label className="workspace-field"><span>New deadline</span><input name="date" type="date" min={String(item.due_date)} required /></label>
                  <div><button className="btn-secondary" name="action" value="extend">Save new deadline</button></div>
                </form>,
              }}
            />}
            {Array.isArray(item.attempts) && item.attempts.length > 0 && <details className="challenge-details">
              <summary>Attempts ({item.attempts.length})</summary>
              <ul>{(item.attempts as {id: string; date: string; passed: boolean; note: string}[]).map(attempt =>
                <li key={attempt.id}><ChallengeDate date={attempt.date} today={today} /> · {attempt.passed ? 'Completed' : 'Try again'}{attempt.note && <> · {attempt.note}</>}</li>)}</ul>
            </details>}
          </div>
          <section className={styles.rewards} aria-labelledby={`rewards-${id}`}>
            <h3 id={`rewards-${id}`}>{completed ? 'Earned rewards' : 'Rewards'}</h3>
            {completed ? <>
              <dl>
                <div><dt>Completed</dt><dd><ChallengeDate date={String(item.completion_date)} today={today} /></dd></div>
                <div><dt>Points earned</dt><dd>{String(item.points_earned)}</dd></div>
                {item.reward_earned ?
                  <div><dt>{item.reward_given_at ? 'Reward given' : 'Reward to give'}</dt><dd>{String(item.reward_earned)}</dd></div> :
                  <div><dt>Reward</dt><dd>No reward earned</dd></div>}
              </dl>
              {canEdit && item.reward_earned && !item.reward_given_at && <form action={updateChallenge}>
                <input type="hidden" name="learner" value={learner} />
                <input type="hidden" name="challenge" value={id} />
                <button className="btn-secondary" name="action" value="given">Mark reward given</button>
              </form>}
            </> : <dl>
              <div><dt>On time</dt><dd>{String(item.promised_reward)} + {String(item.on_time_points)} points</dd></div>
              {Number(item.early_bonus) > 0 &&
                <div><dt>Early bonus</dt><dd>+{String(item.early_bonus)} points</dd></div>}
              <div><dt>Late</dt><dd>{item.late_reward ? `${String(item.late_reward)} + ` : 'No reward agreed · '}{String(item.late_points)} points</dd></div>
            </dl>}
          </section>
        </article>;
      })}
    </>}
  </main>;
}
