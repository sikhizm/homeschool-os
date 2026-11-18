import { randomUUID } from 'node:crypto';
import { type Sql, AccessError } from '../learning/service';
import {
  ncertChapterSlots,
  ncertTextbooks,
  textbookById,
} from '../ncert/textbooks';
import { olympiadResources } from '../olympiad/catalogue';
import { addDays, daysInWeek } from '../planning/periods';
import {
  choice,
  date,
  integer,
  text,
  evidence,
  subjects,
  dayModes,
  outcomes,
  WorkflowInputError,
} from './model';
export type Resource = {
  key: string;
  title: string;
  href: string;
  subject: string;
  learnerId?: string;
  approved?: boolean;
};
async function family(sql: Sql, user: string, write = false) {
  const rows =
    await sql`SELECT family_id::text AS id,role FROM family_members WHERE auth_user_id=${user} ORDER BY created_at,family_id LIMIT 1`;
  if (!rows.length || (write && rows[0].role !== 'owner'))
    throw new AccessError('Only a family owner can change learning plans.');
  return rows[0];
}
export async function resolveResource(
  sql: Sql,
  familyId: string,
  key: string,
): Promise<Resource> {
  const [kind, ...parts] = key.split(':');
  const id = parts.join(':');
  if (kind === 'ncert') {
    const chapter = ncertChapterSlots.find((c) => c.id === id);
    const book = chapter && textbookById(chapter.bookId);
    if (chapter && book)
      return {
        key,
        title: chapter.verifiedTitle ?? chapter.label,
        subject: book.subject,
        href: '/ncert-books/chapter/' + id,
      };
  }
  if (kind === 'olympiad') {
    const r = olympiadResources.find((r) => r.id === id);
    if (r)
      return {
        key,
        title: `Class ${r.grades.join('/')} · ${r.provider} · ${r.title}`.slice(
          0,
          200,
        ),
        subject: r.subject === 'Maths' ? 'Mathematics' : r.subject,
        href: '/library/olympiad/read/' + id,
      };
  }
  if (kind === 'material') {
    const rows =
      await sql`SELECT d.id::text,d.title,d.subject,d.learner_id::text,d.approval_status,EXISTS(SELECT 1 FROM study_material_pdf_files p WHERE p.document_id=d.id) AS is_pdf FROM study_material_documents d JOIN learners l ON l.id=d.learner_id WHERE d.id::text=${id} AND l.family_id::text=${familyId} AND l.archived_at IS NULL AND d.archived_at IS NULL`;
    if (rows.length) {
      const d = rows[0];
      return {
        key,
        title: String(d.title),
        subject: String(d.subject),
        learnerId: String(d.learner_id),
        approved: d.approval_status === 'approved',
        href: d.is_pdf
          ? '/api/study-materials/' + d.id + '/file'
          : '/learners/' + d.learner_id + '/study-library?document=' + d.id,
      };
    }
  }
  throw new WorkflowInputError('This resource is unavailable.');
}
export async function loadWorkflow(
  sql: Sql,
  user: string,
  anchor: string,
  resourceKey = '',
) {
  date(anchor);
  const f = await family(sql, user);
  const week = daysInWeek(anchor);
  const [learners, activities, saved, levels, preferences, goals] =
    await Promise.all([
      sql`SELECT id::text,display_name,stage FROM learners WHERE family_id::text=${f.id} AND archived_at IS NULL ORDER BY created_at,id`,
      sql`SELECT a.*,a.id::text,a.learner_id::text,a.learning_date::text,l.display_name FROM learning_activities a JOIN learners l ON l.id=a.learner_id WHERE l.family_id::text=${f.id} AND l.archived_at IS NULL AND a.learning_date BETWEEN ${week[0]}::date AND ${week[6]}::date ORDER BY a.learning_date,a.start_minute NULLS LAST,a.position,a.created_at`,
      sql`SELECT s.*,s.learner_id::text,l.display_name FROM learning_saved_resources s JOIN learners l ON l.id=s.learner_id WHERE l.family_id::text=${f.id} AND l.archived_at IS NULL`,
      sql`SELECT s.*,s.learner_id::text FROM learner_subject_levels s JOIN learners l ON l.id=s.learner_id WHERE l.family_id::text=${f.id} AND l.archived_at IS NULL`,
      sql`SELECT mode,budget FROM learning_day_preferences WHERE family_id::text=${f.id} AND learning_date=${anchor}::date`,
      sql`SELECT g.id::text,g.learner_id::text,g.title FROM learner_objectives g JOIN learners l ON l.id=g.learner_id WHERE l.family_id::text=${f.id} AND l.archived_at IS NULL`,
    ]);
  const recommendations = learners.flatMap((l) =>
    subjects.map((subject) => {
      const level = levels.find(
        (s) => String(s.learner_id) === String(l.id) && s.subject === subject,
      )?.level;
      const grade = Number(level ?? String(l.stage).replace('Class ', ''));
      const available =
        grade >= 1 &&
        grade <= 10 &&
        (subject === 'Reasoning' ||
          ncertTextbooks.some(
            (b) => b.grade === grade && b.subject === subject,
          ));
      return {
        learner_id: String(l.id),
        subject,
        grade,
        href: available
          ? subject === 'Reasoning'
            ? '/library/olympiad?subject=Reasoning&grade=' + grade
            : '/ncert-books?grade=' +
              grade +
              '&subject=' +
              encodeURIComponent(subject)
          : null,
      };
    }),
  );
  return {
    recommendations,
    canEdit: f.role === 'owner',
    learners,
    activities,
    saved,
    levels,
    goals,
    preferences: preferences[0] ?? { mode: 'normal', budget: 60 },
    resource: resourceKey
      ? await resolveResource(sql, String(f.id), resourceKey)
      : null,
    week,
    nextWeek: addDays(week[0], 7),
  };
}
export async function changeWorkflow(
  sql: Sql,
  user: string,
  input: Record<string, unknown>,
) {
  const f = await family(sql, user, true);
  const action = text(input.action, 30);
  if (action === 'day') {
    const anchor = date(input.date);
    const mode = choice(input.mode, Object.keys(dayModes));
    const budget = integer(input.budget, 10, 480);
    await sql`INSERT INTO learning_day_preferences(family_id,learning_date,mode,budget) SELECT id,${anchor}::date,${mode},${budget} FROM families WHERE id::text=${f.id} ON CONFLICT(family_id,learning_date) DO UPDATE SET mode=EXCLUDED.mode,budget=EXCLUDED.budget`;
    return;
  }
  if (action === 'level' || action === 'unsave') {
    const learner = text(input.learnerId, 100);
    const rows =
      await sql`SELECT id FROM learners WHERE id::text=${learner} AND family_id::text=${f.id} AND archived_at IS NULL`;
    if (!rows.length) throw new AccessError('Learner unavailable.');
    if (action === 'level') {
      const subject = choice(input.subject, subjects);
      if (input.level === null) {
        await sql`DELETE FROM learner_subject_levels WHERE learner_id::text=${learner} AND subject=${subject}`;
      } else {
        const level = integer(input.level, 1, 10);
        await sql`INSERT INTO learner_subject_levels(learner_id,subject,level) SELECT id,${subject},${level} FROM learners WHERE id::text=${learner} ON CONFLICT(learner_id,subject) DO UPDATE SET level=EXCLUDED.level`;
      }
    } else
      await sql`DELETE FROM learning_saved_resources WHERE learner_id::text=${learner} AND resource_key=${text(input.resourceKey, 250)}`;
    return;
  }
  if (action === 'assign' || action === 'save') {
    const resource = await resolveResource(
      sql,
      String(f.id),
      text(input.resourceKey, 250),
    );
    if (
      !Array.isArray(input.learnerIds) ||
      !input.learnerIds.length ||
      input.learnerIds.length > 20
    )
      throw new WorkflowInputError('Choose learners.');
    const ids = [...new Set(input.learnerIds.map((id) => text(id, 100)))];
    const learners =
      await sql`SELECT id::text FROM learners WHERE id::text=ANY(${ids}::text[]) AND family_id::text=${f.id} AND archived_at IS NULL`;
    if (
      learners.length !== ids.length ||
      (resource.learnerId && ids.some((id) => id !== resource.learnerId))
    )
      throw new AccessError('Resource or learner unavailable in this family.');
    if (action === 'save') {
      await sql`INSERT INTO learning_saved_resources(learner_id,resource_key,title,href,subject) SELECT id,${resource.key},${resource.title},${resource.href},${resource.subject} FROM learners WHERE id::text=ANY(${ids}::text[]) ON CONFLICT(learner_id,resource_key) DO NOTHING`;
      return;
    }
    if (resource.approved === false)
      throw new WorkflowInputError(
        'Review and approve this generated material in the study library before assigning it.',
      );
    const anchor = date(input.date),
      minutes = integer(input.minutes, 1, 120),
      mode = choice(input.mode, ['parent', 'independent', 'shared']);
    const start = input.start === null ? null : integer(input.start, 0, 1439);
    if (start !== null && start + minutes > 1440)
      throw new WorkflowInputError('The session must end on the same day.');
    const group = mode === 'shared' ? randomUUID() : null;
    const goal = text(input.goalId ?? '', 100);
    if (goal) {
      const goals =
        await sql`SELECT id FROM learner_objectives WHERE id::text=${goal} AND learner_id::text=${ids[0]}`;
      if (ids.length !== 1 || !goals.length)
        throw new WorkflowInputError(
          'Choose a goal belonging to this learner.',
        );
    }
    // One statement makes multi-child assignment atomic, including duplicate detection.
    await sql`INSERT INTO learning_activities(learner_id,learning_date,title,minutes,resource_key,resource_href,subject_label,support_mode,start_minute,shared_group,goal_id,subject_id)
   SELECT l.id,${anchor}::date,${resource.title},${minutes},${resource.key},${resource.href},${resource.subject},${mode},${start},${group}::uuid,g.id,g.subject_id FROM learners l LEFT JOIN learner_objectives g ON g.id::text=${goal} AND g.learner_id=l.id WHERE l.id::text=ANY(${ids}::text[])`;
    return;
  }
  const id = text(input.id, 100);
  const rows =
    await sql`SELECT a.*,a.id::text,a.learner_id::text FROM learning_activities a JOIN learners l ON l.id=a.learner_id WHERE a.id::text=${id} AND l.family_id::text=${f.id} AND l.archived_at IS NULL`;
  if (!rows.length) throw new AccessError('Activity unavailable.');
  const a = rows[0];
  if (action === 'startTimer') {
    try {
      await sql`UPDATE learning_activities SET timer_started_at=now() WHERE id::text=${id} AND timer_started_at IS NULL AND NOT skipped AND NOT completed`;
    } catch(error) {
      if(error && typeof error==='object' && 'code' in error && error.code==='23505')
        throw new WorkflowInputError("Stop this learner’s running timer first.");
      throw error;
    }
    return;
  }
  if (action === 'stopTimer') {
    await sql`UPDATE learning_activities SET actual_minutes=least(480,coalesce(actual_minutes,0)+greatest(1,round(extract(epoch from (now()-timer_started_at))/60)))::integer,timer_started_at=NULL WHERE id::text=${id} AND timer_started_at IS NOT NULL`;
    return;
  }
  if (action === 'edit') {
    const anchor = date(input.date),
      minutes = integer(input.minutes, 1, 120),
      mode = choice(input.mode, ['parent', 'independent', 'shared']);
    const start = input.start === null ? null : integer(input.start, 0, 1439);
    if (start !== null && start + minutes > 1440)
      throw new WorkflowInputError('The session must end on the same day.');
    if (typeof input.skipped !== 'boolean')
      throw new WorkflowInputError('Choose a valid skip state.');
    await sql`UPDATE learning_activities SET learning_date=${anchor}::date,minutes=${minutes},support_mode=${mode},start_minute=${start},skipped=${input.skipped},shared_group=CASE WHEN ${mode}='shared' THEN shared_group ELSE NULL END WHERE id::text=${id}`;
    return;
  }
  if (action === 'review') {
    const outcome = choice(input.outcome, Object.keys(outcomes));
    const completed = input.completed;
    if (typeof completed !== 'boolean')
      throw new WorkflowInputError('Choose a completion state.');
    if (outcome === 'unfinished' && completed)
      throw new WorkflowInputError(
        'An unfinished activity cannot also be completed.',
      );
    const actual = input.actual === null ? null : integer(input.actual, 0, 480),
      note = text(input.note ?? ''),
      url = evidence(input.evidence),
      next = choice(input.next, ['continue', 'repeat', 'change']);
    await sql`UPDATE learning_activities SET understanding=${outcome},completed=${completed},actual_minutes=${actual},reflection=${note},evidence_url=${url},next_action=${next} WHERE id::text=${id}`;
    return;
  }
  if (action === 'followup') {
    const anchor = date(input.date),
      minutes = integer(input.minutes, 1, 120),
      decision = choice(input.decision, [
        'repeat',
        'change',
        'continue',
        'move',
        'reduce',
      ]);
    const notes = text(input.notes ?? '');
    if (decision === 'change' && !notes)
      throw new WorkflowInputError(
        'Describe the different approach before adding it.',
      );
    if (decision === 'move' || decision === 'reduce') {
      if (a.completed)
        throw new WorkflowInputError(
          'Keep the completed record; create a new session instead.',
        );
      await sql`UPDATE learning_activities SET learning_date=${anchor}::date,minutes=${minutes},skipped=false,start_minute=NULL,shared_group=NULL,next_notes=${notes} WHERE id::text=${id}`;
      return;
    }
    if (a.resource_key && String(a.resource_key).startsWith('material:')) {
      const resource = await resolveResource(
        sql,
        String(f.id),
        String(a.resource_key),
      );
      if (!resource.approved)
        throw new WorkflowInputError(
          'Approve the current material before scheduling another session.',
        );
    }
    await sql`INSERT INTO learning_activities(learner_id,learning_date,title,minutes,resource_key,resource_href,subject_label,support_mode,goal_id,subject_id,next_notes)
   SELECT learner_id,${anchor}::date,title,${minutes},COALESCE(resource_key,'activity:'||id::text),resource_href,subject_label,support_mode,goal_id,subject_id,${notes} FROM learning_activities WHERE id::text=${id}`;
    return;
  }
  throw new WorkflowInputError('Unknown action.');
}
