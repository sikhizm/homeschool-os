import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { fixture } from './fixture';
import {
  changeWorkflow,
  loadWorkflow,
  resolveResource,
} from '../src/lib/family-workflow/service';
import {
  familyMinutes,
  scheduleConflicts,
  weeklySummary,
  type Activity,
  evidence,
  date,
} from '../src/lib/family-workflow/model';
const key = 'olympiad:sof-maths-4';
const assignment = (id: string, extra: Record<string, unknown> = {}) => ({
  action: 'assign',
  resourceKey: key,
  learnerIds: [id],
  date: '2026-11-17',
  minutes: 20,
  mode: 'parent',
  start: 600,
  goalId: '',
  ...extra,
});
async function setup(pk = 'uuid') {
  const f = await fixture(pk);
  await f.db.exec('ALTER TABLE learners ADD COLUMN archived_at timestamptz;');
  for (const file of [
    '009_study_material_studio.sql',
    '010_study_material_pdf_files.sql',
    '011_family_learning_workflow.sql',
  ])
    await f.db.exec(
      await readFile(new URL('../migrations/' + file, import.meta.url), 'utf8'),
    );
  return f;
}
for (const pk of ['uuid', 'bigint'])
  test(`workflow preserves existing records and scopes owner writes (${pk})`, async () => {
    const f = await setup(pk);
    try {
      await f.command({
        action: 'activity.create',
        date: '2026-11-17',
        title: 'Existing activity',
        minutes: 15,
        subjectId: null,
        goalId: null,
      });
      await f.db.exec(
        await readFile(
          new URL(
            '../migrations/011_family_learning_workflow.sql',
            import.meta.url,
          ),
          'utf8',
        ),
      );
      assert.equal(
        (await loadWorkflow(f.sql, 'owner-a', '2026-11-17')).activities.length,
        1,
      );
      await assert.rejects(
        changeWorkflow(f.sql, 'viewer-a', assignment(f.ids[0])),
        /owner/,
      );
      await assert.rejects(
        changeWorkflow(f.sql, 'owner-b', assignment(f.ids[0])),
        /unavailable/,
      );
      await assert.rejects(
        changeWorkflow(
          f.sql,
          'owner-a',
          assignment(f.ids[0], { learnerIds: [f.ids[0], f.ids[1]] }),
        ),
        /unavailable/,
      );
      await changeWorkflow(f.sql, 'owner-a', assignment(f.ids[0]));
      await assert.rejects(
        changeWorkflow(f.sql, 'owner-a', assignment(f.ids[0])),
      );
      assert.equal(
        (await loadWorkflow(f.sql, 'owner-b', '2026-11-17')).activities.length,
        0,
      );
      const data = await loadWorkflow(f.sql, 'owner-a', '2026-11-17');
      const a = data.activities.find((a) => a.resource_key === key)!;
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'review',
        id: a.id,
        outcome: 'help',
        completed: true,
        actual: 12,
        note: 'Used counters',
        evidence: 'https://example.org/work',
        next: 'repeat',
      });
      assert.equal(
        (await loadWorkflow(f.sql, 'owner-a', '2026-11-24')).activities.length,
        0,
      );
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'followup',
        id: a.id,
        date: '2026-11-24',
        decision: 'repeat',
        minutes: 15,
        notes: 'Use counters again',
      });
      const next = (await loadWorkflow(f.sql, 'owner-a', '2026-11-24'))
        .activities[0];
      assert.equal(next.completed, false);
      assert.equal(next.understanding, null);
      assert.equal(next.resource_href, a.resource_href);
      await assert.rejects(
        changeWorkflow(f.sql, 'owner-a', {
          action: 'followup',
          id: a.id,
          date: '2026-11-24',
          decision: 'repeat',
          minutes: 15,
          notes: '',
        }),
      );
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'edit',
        id: next.id,
        date: '2026-11-25',
        minutes: 10,
        mode: 'independent',
        start: null,
        skipped: true,
      });
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'save',
        resourceKey: key,
        learnerIds: [f.ids[0]],
      });
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'save',
        resourceKey: key,
        learnerIds: [f.ids[0]],
      });
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'level',
        learnerId: f.ids[0],
        subject: 'Mathematics',
        level: 2,
      });
      await changeWorkflow(f.sql, 'owner-a', {
        action: 'day',
        date: '2026-11-17',
        mode: 'minimum',
        budget: 25,
      });
      const saved = await loadWorkflow(f.sql, 'owner-a', '2026-11-17');
      assert.equal(saved.saved.length, 1);
      assert.equal(saved.levels[0].level, 2);
      assert.equal(saved.learners[0].stage, 'UKG');
      assert.equal(saved.preferences.budget, 25);
      assert.ok(
        saved.recommendations.some(
          (r) => r.subject === 'Mathematics' && r.href?.includes('grade=2'),
        ),
      );
      const security = await f.db.query<{ relrowsecurity: boolean }>(
        "SELECT relrowsecurity FROM pg_class WHERE oid IN ('learner_subject_levels'::regclass,'learning_saved_resources'::regclass,'learning_day_preferences'::regclass)",
      );
      assert.ok(security.rows.every((r) => r.relrowsecurity));
      await f.db.query(
        'UPDATE learners SET archived_at=now() WHERE id::text=$1',
        [f.ids[0]],
      );
      assert.equal(
        (await loadWorkflow(f.sql, 'owner-a', '2026-11-17')).learners.length,
        0,
      );
      await assert.rejects(
        changeWorkflow(f.sql, 'owner-a', assignment(f.ids[0])),
        /unavailable/,
      );
    } finally {
      await f.db.close();
    }
  });
test('generated materials require approval, ownership and current availability for assignment and repeats', async () => {
  const f = await setup();
  try {
    const d = await f.db.query<{ id: string }>(
      "INSERT INTO study_material_documents(learner_id,grade,subject,book_id,chapter_id,title,document_type,safe_html,source_reference) VALUES($1,'Class 4','Mathematics','book','chapter','Notes','Notes','<p>Original notes</p>','https://ncert.nic.in') RETURNING id::text",
      [f.ids[0]],
    );
    const id = d.rows[0].id,
      resourceKey = 'material:' + id;
    await assert.rejects(
      resolveResource(f.sql, 'family-b', resourceKey),
      /unavailable/,
    );
    await changeWorkflow(
      f.sql,
      'owner-a',
      assignment(f.ids[0], { action: 'save', resourceKey }),
    );
    await assert.rejects(
      changeWorkflow(f.sql, 'owner-a', assignment(f.ids[0], { resourceKey })),
      /approve/,
    );
    await f.db.query(
      "UPDATE study_material_documents SET approval_status='approved' WHERE id=$1",
      [id],
    );
    await changeWorkflow(
      f.sql,
      'owner-a',
      assignment(f.ids[0], { resourceKey }),
    );
    const a = (await loadWorkflow(f.sql, 'owner-a', '2026-11-17'))
      .activities[0];
    await f.db.query(
      "UPDATE study_material_documents SET approval_status='pending' WHERE id=$1",
      [id],
    );
    await assert.rejects(
      changeWorkflow(f.sql, 'owner-a', {
        action: 'followup',
        id: a.id,
        decision: 'repeat',
        date: '2026-11-24',
        minutes: 20,
        notes: '',
      }),
      /Approve/,
    );
  } finally {
    await f.db.close();
  }
});
test('shared assignments are atomic and goal links cannot cross learners', async () => {
  const f = await setup();
  try {
    const second = '33333333-3333-4333-8333-333333333333';
    await f.db.query(
      "INSERT INTO learners(id,family_id,display_name,stage) VALUES($1,'family-a','Sibling','Class 4')",
      [second],
    );
    await changeWorkflow(
      f.sql,
      'owner-a',
      assignment(f.ids[0], { learnerIds: [f.ids[0], second], mode: 'shared' }),
    );
    const items = (await loadWorkflow(f.sql, 'owner-a', '2026-11-17'))
      .activities as unknown as Activity[];
    assert.equal(items.length, 2);
    assert.equal(items[0].shared_group, items[1].shared_group);
    assert.equal(familyMinutes(items), 20);
    assert.equal(scheduleConflicts(items).length, 0);
    await assert.rejects(
      changeWorkflow(
        f.sql,
        'owner-a',
        assignment(f.ids[0], { learnerIds: [f.ids[0], second], goalId: 'bad' }),
      ),
      /goal/,
    );
    await assert.rejects(
      changeWorkflow(
        f.sql,
        'owner-a',
        assignment(f.ids[0], { learnerIds: [f.ids[0], second] }),
      ),
    );
    assert.equal(
      (await loadWorkflow(f.sql, 'owner-a', '2026-11-17')).activities.length,
      2,
    );
    await assert.rejects(
      changeWorkflow(f.sql, 'owner-a', {
        action: 'review',
        id: items[0].id,
        outcome: 'unfinished',
        completed: true,
        actual: null,
        note: '',
        evidence: '',
        next: 'repeat',
      }),
      /unfinished/,
    );
  } finally {
    await f.db.close();
  }
});
test('overlap detection and weekly summaries distinguish parent time, shared sessions and actual evidence', () => {
  const a = {
    id: 'a',
    learner_id: 'a',
    display_name: 'A',
    learning_date: '2026-11-17',
    title: 'Maths',
    minutes: 20,
    completed: false,
    skipped: false,
    resource_key: key,
    resource_href: '/library',
    subject_label: 'Mathematics',
    support_mode: 'parent',
    start_minute: 600,
    shared_group: null,
    understanding: 'help',
    actual_minutes: 12,
    reflection: '',
    evidence_url: '',
    next_action: 'repeat',
    next_notes: '',
    goal_id: null,
  } as Activity;
  assert.equal(
    scheduleConflicts([a, { ...a, id: 'b', start_minute: 610 }]).length,
    1,
  );
  assert.equal(
    scheduleConflicts([a, { ...a, id: 'b', start_minute: 620 }]).length,
    0,
  );
  assert.equal(
    scheduleConflicts([a, { ...a, id: 'b', support_mode: 'independent' }])
      .length,
    0,
  );
  const summary = weeklySummary([a, { ...a, id: 'b', actual_minutes: null }]);
  assert.equal(summary.actual, 12);
  assert.equal(summary.recorded, 1);
  assert.equal(summary.repeatedHelp.length, 1);
  assert.equal(summary.completed, 0);
  assert.throws(() => evidence('javascript:alert(1)'));
  assert.throws(() => date('2026-02-30'));
});
