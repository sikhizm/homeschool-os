import { planSuggestions, type Command, type Workspace } from './model';
export type Row = Record<string, unknown>;
export type Sql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Row[]>;
export class AccessError extends Error {}
export class ConflictError extends Error {}
export async function learnerAccess(
  sql: Sql,
  userId: string,
  learnerId: string,
  write = false,
) {
  const rows = await sql`
    SELECT l.id, l.display_name, l.stage, fm.role FROM learners l
    JOIN family_members fm ON fm.family_id = l.family_id
    WHERE l.id::text = ${learnerId} AND fm.auth_user_id = ${userId}
      AND (${write} = false OR fm.role = 'owner')
      AND l.family_id = (SELECT family_id FROM family_members WHERE auth_user_id = ${userId} ORDER BY created_at, family_id LIMIT 1)
  `;
  if (!rows.length)
    throw new AccessError('Learner unavailable or permission denied.');
  return rows[0];
}
export async function loadWorkspace(
  sql: Sql,
  userId: string,
  learnerId: string,
  date: string,
): Promise<Workspace> {
  await learnerAccess(sql, userId, learnerId);
  // Every read joins membership as well, including after the initial access check.
  const [subjects, goals, activities] = await Promise.all([
    sql`SELECT s.id::text, s.name, s.approach, s.archived FROM learning_subjects s JOIN learners l ON l.id=s.learner_id
      WHERE l.id::text=${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId}) ORDER BY s.created_at, s.id`,
    sql`SELECT g.id::text, g.subject_id::text, g.title, g.progress, g.evidence, g.target_date::text FROM learner_objectives g JOIN learners l ON l.id=g.learner_id
      WHERE l.id::text=${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId}) ORDER BY g.created_at, g.id`,
    sql`SELECT a.id::text, a.subject_id::text, a.goal_id::text, a.title, a.minutes, a.completed, a.reflection, a.position, a.learning_date::text FROM learning_activities a JOIN learners l ON l.id=a.learner_id
      WHERE l.id::text=${learnerId} AND a.learning_date=${date}::date AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId}) ORDER BY a.position, a.created_at, a.id`,
  ]);
  return { subjects, goals, activities } as unknown as Workspace;
}
export async function executeCommand(
  sql: Sql,
  userId: string,
  learnerId: string,
  c: Command,
) {
  const learner = await learnerAccess(sql, userId, learnerId, true);
  let rows: Row[] = [];
  // Ownership is rechecked inside each mutation, never trusted from client IDs.
  switch (c.action) {
    case 'learner.update':
      rows =
        await sql`UPDATE learners l SET display_name=${c.displayName}, stage=${c.stage}
        WHERE l.id::text=${learnerId} AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING l.id`;
      break;
    case 'subject.create':
      rows = await sql`INSERT INTO learning_subjects (learner_id,name,approach)
        SELECT l.id,${c.name},${c.approach} FROM learners l WHERE l.id::text=${learnerId}
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING id`;
      break;
    case 'subject.update':
      rows =
        await sql`UPDATE learning_subjects s SET name=${c.name},approach=${c.approach},archived=${c.archived}
        FROM learners l WHERE s.learner_id=l.id AND l.id::text=${learnerId} AND s.id=${c.id}::uuid
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING s.id`;
      break;
    case 'goal.create':
      rows =
        await sql`INSERT INTO learner_objectives (learner_id,subject_id,title,target_date)
        SELECT l.id,s.id,${c.title},${c.targetDate}::date FROM learners l JOIN learning_subjects s ON s.learner_id=l.id
        WHERE l.id::text=${learnerId} AND s.id=${c.subjectId}::uuid AND NOT s.archived
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING id`;
      break;
    case 'goal.update':
      rows =
        await sql`UPDATE learner_objectives g SET title=${c.title},progress=${c.progress},evidence=${c.evidence},target_date=${c.targetDate}::date,updated_at=now()
        FROM learners l WHERE g.learner_id=l.id AND l.id::text=${learnerId} AND g.id=${c.id}::uuid
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING g.id`;
      break;
    case 'activity.create':
      rows =
        await sql`INSERT INTO learning_activities (learner_id,subject_id,goal_id,learning_date,title,minutes,position)
        SELECT l.id,${c.subjectId}::uuid,${c.goalId}::uuid,${c.date}::date,${c.title},${c.minutes},
          COALESCE((SELECT max(position)+1 FROM learning_activities WHERE learner_id=l.id AND learning_date=${c.date}::date),0)
        FROM learners l WHERE l.id::text=${learnerId}
        AND (${c.subjectId}::uuid IS NULL OR EXISTS (SELECT 1 FROM learning_subjects s WHERE s.id=${c.subjectId}::uuid AND s.learner_id=l.id AND NOT s.archived))
        AND (${c.goalId}::uuid IS NULL OR EXISTS (SELECT 1 FROM learner_objectives g WHERE g.id=${c.goalId}::uuid AND g.learner_id=l.id AND g.subject_id=${c.subjectId}::uuid))
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING id`;
      break;
    case 'activity.update':
      rows =
        await sql`UPDATE learning_activities a SET title=${c.title},minutes=${c.minutes},completed=${c.completed},reflection=${c.reflection},learning_date=COALESCE(${c.scheduledDate}::date,a.learning_date),position=COALESCE(${c.position}::int,a.position)
        FROM learners l WHERE a.learner_id=l.id AND l.id::text=${learnerId} AND a.id=${c.id}::uuid
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner') RETURNING a.id`;
      break;
    case 'plan.starter': {
      // A unique learner/date claim makes repeated and concurrent starter requests idempotent.
      const suggestions = JSON.stringify(
        planSuggestions(String(learner.stage)),
      );
      rows = await sql`WITH claimed AS (
        INSERT INTO learning_plan_starters (learner_id,learning_date)
        SELECT l.id,${c.date}::date FROM learners l WHERE l.id::text=${learnerId}
        AND NOT EXISTS (SELECT 1 FROM learning_activities a WHERE a.learner_id=l.id AND a.learning_date=${c.date}::date)
        AND EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id=l.family_id AND fm.auth_user_id=${userId} AND fm.role='owner')
        ON CONFLICT DO NOTHING RETURNING learner_id
      ) INSERT INTO learning_activities (learner_id,learning_date,title,minutes,position,subject_id)
        SELECT claimed.learner_id,${c.date}::date,item->>'title',(item->>'minutes')::int,ordinality::int,
          (SELECT s.id FROM learning_subjects s WHERE s.learner_id=claimed.learner_id AND NOT s.archived AND s.name=item->>'subject' LIMIT 1)
        FROM claimed CROSS JOIN jsonb_array_elements(${suggestions}::jsonb) WITH ORDINALITY AS x(item,ordinality) RETURNING id`;
      if (!rows.length)
        throw new ConflictError(
          'This day already has a plan. Add or edit activities individually.',
        );
      break;
    }
  }
  if (!rows.length)
    throw new AccessError('Record unavailable or permission denied.');
  return { saved: true };
}
