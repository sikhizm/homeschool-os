import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCommand,
  planSuggestions,
  validDate,
  InputError,
} from '../src/lib/learning/model';
import {
  AccessError,
  ConflictError,
  loadWorkspace,
} from '../src/lib/learning/service';

import { fixture } from './fixture';

test('input validation rejects invalid dates, progress, duration and IDs', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate('1999-12-31'), false);
  for (const input of [
    null,
    {},
    { action: 'learner.update', displayName: 'Test', stage: 'Unknown' },
    { action: 'subject.create', name: ' ', approach: '' },
    { action: 'goal.update', id: 'bad' },
    {
      action: 'activity.create',
      date: '2026-10-27',
      title: 'Story',
      minutes: -1,
    },
  ])
    assert.throws(() => parseCommand(input), InputError);
  const id = '11111111-1111-4111-8111-111111111111';
  assert.throws(
    () =>
      parseCommand({
        action: 'goal.update',
        id,
        title: 'Count',
        progress: 101,
        evidence: '',
      }),
    InputError,
  );
  assert.throws(
    () =>
      parseCommand({
        action: 'activity.update',
        id,
        title: 'Count',
        minutes: 3.5,
        completed: true,
        reflection: '',
      }),
    InputError,
  );
});

test('age-aware starter plans total 60 minutes and contain no recorded progress', () => {
  for (const stage of ['UKG', 'Class 5', 'Class 12']) {
    const plan = planSuggestions(stage);
    assert.equal(
      plan.reduce((sum, a) => sum + a.minutes, 0),
      60,
    );
    assert.equal(plan.length, 5);
    assert.ok(plan.some((a) => a.title.includes('seva')));
    assert.ok(plan.every((a) => !('completed' in a) && !('progress' in a)));
  }
  assert.notEqual(
    planSuggestions('UKG')[0].title,
    planSuggestions('Class 5')[0].title,
  );
});

test('additive migration is repeatable and preserves existing learner rows (UUID and bigint)', async () => {
  for (const pk of ['uuid', 'bigint']) {
    const { db, migration } = await fixture(pk);
    try {
      const before = await db.query('SELECT * FROM learners ORDER BY id');
      await db.exec(migration);
      assert.deepEqual(
        (await db.query('SELECT * FROM learners ORDER BY id')).rows,
        before.rows,
      );
      assert.deepEqual(
        (await db.query('SELECT count(*)::int n FROM learner_objectives')).rows,
        [{ n: 0 }],
      );
    } finally {
      await db.close();
    }
  }
});

test('owner workflow: edit learner, manage subject, record goal, plan and reflect without automatic progress', async () => {
  const { db, sql, ids, command } = await fixture();
  try {
    await command({
      action: 'learner.update',
      displayName: 'Changed fixture',
      stage: 'Class 2',
    });
    assert.equal(
      (
        await db.query<{ display_name: string }>(
          'SELECT display_name FROM learners WHERE id=$1',
          [ids[0]],
        )
      ).rows[0].display_name,
      'Changed fixture',
    );
    await command({
      action: 'subject.create',
      name: 'Mathematics',
      approach: 'Objects first',
    });
    let workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    const subjectId = workspace.subjects[0].id;
    await command({
      action: 'goal.create',
      subjectId,
      title: 'Compare tens',
      targetDate: '2026-11-01',
    });
    workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    const goalId = workspace.goals[0].id;
    assert.equal(workspace.goals[0].progress, 0);
    await command({
      action: 'activity.create',
      subjectId,
      goalId,
      title: 'Compare bundles',
      minutes: 15,
      date: '2026-10-27',
    });
    workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    const activity = workspace.activities[0];
    assert.equal(activity.completed, false);
    await command({
      action: 'activity.update',
      id: activity.id,
      title: activity.title,
      minutes: 20,
      completed: true,
      reflection: 'Synthetic test observation',
    });
    workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    assert.equal(workspace.activities[0].completed, true);
    assert.equal(workspace.activities[0].minutes, 20);
    assert.equal(workspace.goals[0].progress, 0);
    await command({
      action: 'goal.update',
      id: goalId,
      title: 'Compare tens',
      progress: 40,
      evidence: 'Synthetic test evidence',
      targetDate: null,
    });
    await command({
      action: 'subject.update',
      id: subjectId,
      name: 'Maths',
      approach: 'Explore',
      archived: true,
    });
    workspace = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27');
    assert.equal(workspace.subjects[0].archived, true);
    assert.equal(workspace.goals[0].progress, 40);
    assert.equal(workspace.activities.length, 1);
    await assert.rejects(
      command({ action: 'goal.create', subjectId, title: 'New' }),
      AccessError,
    );
    await command({
      action: 'subject.update',
      id: subjectId,
      name: 'Mathematics',
      approach: 'Explore',
      archived: false,
    });
    await command({ action: 'plan.starter', date: '2026-10-28' });
    const starter = await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-28');
    assert.equal(
      starter.activities.reduce((sum, a) => sum + a.minutes, 0),
      60,
    );
    assert.ok(starter.activities.every((a) => !a.completed));
    assert.ok(starter.activities.some((a) => a.subject_id === subjectId));
    await assert.rejects(
      command({ action: 'plan.starter', date: '2026-10-28' }),
      ConflictError,
    );
    await assert.rejects(
      command({ action: 'plan.starter', date: '2026-10-27' }),
      ConflictError,
    );
    assert.equal(
      (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-28')).activities
        .length,
      5,
    );
  } finally {
    await db.close();
  }
});

test('cross-family IDs, viewer writes and mismatched goal links are rejected', async () => {
  const { db, sql, ids, command } = await fixture();
  try {
    await assert.rejects(
      loadWorkspace(sql, 'owner-b', ids[0], '2026-10-27'),
      AccessError,
    );
    await assert.rejects(
      command(
        { action: 'learner.update', displayName: 'Denied', stage: 'UKG' },
        'owner-b',
      ),
      AccessError,
    );
    await assert.rejects(
      command(
        { action: 'subject.create', name: 'Denied', approach: '' },
        'viewer-a',
      ),
      AccessError,
    );
    await command({
      action: 'subject.create',
      name: 'Private subject',
      approach: '',
    });
    const subjectId = (
      await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')
    ).subjects[0].id;
    assert.equal(
      (await loadWorkspace(sql, 'viewer-a', ids[0], '2026-10-27')).subjects
        .length,
      1,
    );
    await assert.rejects(
      command(
        {
          action: 'subject.update',
          id: subjectId,
          name: 'Denied',
          approach: '',
          archived: true,
        },
        'owner-b',
        ids[1],
      ),
      AccessError,
    );
    await assert.rejects(
      command(
        { action: 'goal.create', subjectId, title: 'Denied' },
        'owner-b',
        ids[1],
      ),
      AccessError,
    );
    await command({ action: 'goal.create', subjectId, title: 'Original' });
    const goalId = (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27'))
      .goals[0].id;
    await assert.rejects(
      command(
        {
          action: 'goal.update',
          id: goalId,
          title: 'Denied',
          progress: 100,
          evidence: '',
        },
        'owner-b',
        ids[1],
      ),
      AccessError,
    );
    await command({
      action: 'subject.create',
      name: 'Different subject',
      approach: '',
    });
    const other = (
      await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')
    ).subjects.find((s) => s.id !== subjectId)!.id;
    await assert.rejects(
      command({
        action: 'activity.create',
        date: '2026-10-27',
        subjectId: other,
        goalId,
        title: 'Wrong goal',
        minutes: 10,
      }),
      AccessError,
    );
    await assert.rejects(
      db.query(
        'INSERT INTO learning_activities (learner_id,subject_id,goal_id,learning_date,title,minutes) VALUES ($1,$2,$3,$4,$5,$6)',
        [ids[1], subjectId, goalId, '2026-10-27', 'Invalid link', 10],
      ),
    );
    await command({
      action: 'activity.create',
      date: '2026-10-27',
      subjectId,
      goalId,
      title: 'Private',
      minutes: 10,
    });
    const activityId = (
      await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')
    ).activities[0].id;
    await assert.rejects(
      command(
        {
          action: 'activity.update',
          id: activityId,
          title: 'Denied',
          minutes: 10,
          completed: true,
          reflection: '',
        },
        'owner-b',
        ids[1],
      ),
      AccessError,
    );
    assert.equal(
      (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')).goals[0]
        .progress,
      0,
    );
    assert.equal(
      (await loadWorkspace(sql, 'owner-b', ids[1], '2026-10-27')).subjects
        .length,
      0,
    );
  } finally {
    await db.close();
  }
});

test('duplicate subject names are rejected and starter creation is idempotent under concurrency', async () => {
  const { db, sql, ids, command } = await fixture();
  try {
    await command({ action: 'subject.create', name: 'English', approach: '' });
    await assert.rejects(
      command({ action: 'subject.create', name: 'english', approach: '' }),
    );
    const results = await Promise.allSettled([
      command({ action: 'plan.starter', date: '2026-10-27' }),
      command({ action: 'plan.starter', date: '2026-10-27' }),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(
      (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')).activities
        .length,
      5,
    );
  } finally {
    await db.close();
  }
});

test('rescheduling preserves completion, reflection and goal linkage', async () => {
  const { db, sql, ids, command } = await fixture();
  try {
    await command({
      action: 'activity.create',
      title: 'Story',
      minutes: 10,
      date: '2026-10-27',
    });
    const activity = (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27'))
      .activities[0];
    await command({
      action: 'activity.update',
      id: activity.id,
      title: 'Story',
      minutes: 10,
      completed: false,
      reflection: '',
      scheduledDate: '2026-10-28',
      position: 2,
    });
    assert.equal(
      (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-27')).activities
        .length,
      0,
    );
    const moved = (await loadWorkspace(sql, 'owner-a', ids[0], '2026-10-28'))
      .activities[0];
    assert.equal(moved.id, activity.id);
    assert.equal(moved.position, 2);
    assert.equal(moved.completed, false);
  } finally {
    await db.close();
  }
});

test('new tables deny direct access for an untrusted database role even with SELECT grants', async () => {
  const { db, command } = await fixture();
  try {
    await command({ action: 'subject.create', name: 'Private', approach: '' });
    await db.exec(
      'CREATE ROLE fixture_untrusted; GRANT USAGE ON SCHEMA public TO fixture_untrusted; GRANT SELECT ON learning_subjects TO fixture_untrusted; SET ROLE fixture_untrusted;',
    );
    assert.deepEqual(
      (await db.query('SELECT * FROM learning_subjects')).rows,
      [],
    );
    await assert.rejects(
      db.query(
        "INSERT INTO learning_subjects (learner_id,name) VALUES ('11111111-1111-4111-8111-111111111111','Denied')",
      ),
    );
    await db.exec('RESET ROLE');
  } finally {
    await db.close();
  }
});
