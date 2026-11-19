'use server';
import {redirect} from 'next/navigation';
import {validPlanningDate} from '@/lib/planning/periods';
import {challengeScope, challengeToday} from './scope';

const field = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const bounded = (value: string, max: number) => value.length > 0 && value.length <= max;
const integer = (value: string) => /^\d{1,4}$/.test(value) ? Number(value) : NaN;
const finish = (learner: string, notice: string, view = 'active'): never =>
  redirect('/challenges?' + new URLSearchParams({learner, view, notice}));

export async function assignChallenge(form: FormData) {
  const {sql, familyId, canEdit} = await challengeScope();
  const learner = field(form, 'learner');
  const recipients = [...new Set(form.getAll('recipient').map(value => String(value)))];
  if (!canEdit) finish('', 'owner');
  const title = field(form, 'title'), criteria = field(form, 'criteria');
  const assigned = field(form, 'assigned'), deadline = field(form, 'deadline');
  const reward = field(form, 'reward'), lateReward = field(form, 'lateReward');
  const points = integer(field(form, 'points')), bonus = integer(field(form, 'bonus')), latePoints = integer(field(form, 'latePoints'));
  if (!recipients.length || recipients.length > 50 || recipients.some(id => !bounded(id, 100)) || !bounded(title, 180) || !bounded(criteria, 1000) || !bounded(reward, 300) ||
      lateReward.length > 300 || !validPlanningDate(assigned) || assigned > challengeToday() ||
      !validPlanningDate(deadline) || deadline < assigned ||
      ![points, bonus, latePoints].every(value => value >= 0 && value <= 1000) || latePoints > points) finish(learner, 'invalid');
  let saved = false;
  try {
    const rows = await sql`WITH recipients AS (
      SELECT id FROM learners WHERE family_id::text = ${familyId} AND archived_at IS NULL AND id::text = ANY(${recipients}::text[])
    ) INSERT INTO learning_challenges (learner_id, title, criteria, assigned_on, original_deadline,
      deadline, promised_reward, late_reward, on_time_points, early_bonus, late_points)
      SELECT id, ${title}, ${criteria}, ${assigned}::date, ${deadline}::date, ${deadline}::date,
        ${reward}, ${lateReward || null}, ${points}, ${bonus}, ${latePoints}
      FROM recipients WHERE (SELECT count(*) FROM recipients) = ${recipients.length} RETURNING id`;
    saved = rows.length > 0;
  } catch { finish(learner, 'failed'); }
  finish(recipients.includes(learner) ? learner : recipients[0], saved ? 'assigned' : 'invalid');
}

export async function updateChallenge(form: FormData) {
  const {sql, familyId, canEdit} = await challengeScope();
  const learner = field(form, 'learner'), id = field(form, 'challenge'), action = field(form, 'action');
  const date = field(form, 'date'), note = field(form, 'note'), today = challengeToday();
  if (!canEdit) finish('', 'owner');
  if (!bounded(learner, 100) || !/^[0-9a-f-]{36}$/i.test(id) ||
      !['extend', 'passed', 'retry', 'given'].includes(action) ||
      (action !== 'given' && !validPlanningDate(date)) || note.length > 1000 ||
      (['passed', 'retry'].includes(action) && date > today)) finish(learner, 'invalid');
  let changed = false;
  try {
    if (action === 'extend') {
      const rows = await sql`UPDATE learning_challenges c SET deadline = ${date}::date
        FROM learners l WHERE c.learner_id = l.id AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
          AND l.id::text = ${learner} AND c.id::text = ${id} AND c.completed_on IS NULL AND c.deadline < ${date}::date RETURNING c.id`;
      changed = rows.length > 0;
    } else if (action === 'given') {
      const rows = await sql`UPDATE learning_challenges c SET reward_given_at = now()
        FROM learners l WHERE c.learner_id = l.id AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
          AND l.id::text = ${learner} AND c.id::text = ${id} AND c.verified_at IS NOT NULL
          AND c.reward_earned IS NOT NULL AND c.reward_given_at IS NULL RETURNING c.id`;
      changed = rows.length > 0;
    } else {
      const passed = action === 'passed';
      const rows = await sql`
        WITH recorded AS (
          UPDATE learning_challenges c SET
            completed_on = CASE WHEN ${passed} THEN ${date}::date ELSE NULL END,
            verified_at = CASE WHEN ${passed} THEN now() ELSE NULL END,
            points_earned = CASE WHEN NOT ${passed} THEN NULL WHEN ${date}::date < c.deadline THEN c.on_time_points + c.early_bonus
              WHEN ${date}::date = c.deadline THEN c.on_time_points ELSE c.late_points END,
            reward_earned = CASE WHEN NOT ${passed} THEN NULL WHEN ${date}::date <= c.deadline THEN c.promised_reward ELSE c.late_reward END
          FROM learners l WHERE c.learner_id = l.id AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
            AND l.id::text = ${learner} AND c.id::text = ${id} AND c.completed_on IS NULL AND ${date}::date >= c.assigned_on
            AND (${passed} = false OR c.deadline = NULLIF(${field(form, 'reviewDeadline')}, '')::date)
          RETURNING c.id
        )
        INSERT INTO learning_challenge_attempts (challenge_id, attempted_on, passed, note)
        SELECT id, ${date}::date, ${passed}, ${note} FROM recorded RETURNING id`;
      changed = rows.length > 0;
    }
  } catch { finish(learner, 'failed'); }
  finish(learner, changed ? action : 'unchanged', action === 'passed' || action === 'given' ? 'completed' :
    action === 'retry' && field(form, 'reviewDeadline') < today ? 'overdue' : 'active');
}
