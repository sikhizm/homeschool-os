# Phase 04 — Adaptive Revision & Retention

## Purpose
Replace a fixed spaced-revision timer with a calm, parent-observed recall loop. The system should respond to what a learner can remember, not infer ability from completion or dates alone.

## Parent workflow
1. Complete an original lesson. The parent may record understanding, record participation only, or request revision.
2. The first short recall is offered after 3 days when understanding was recorded, or after 2 days when the lesson was marked done but not assessed.
3. At a recall session the parent chooses one of three observations:
   - **Remembered independently:** the learner explained, demonstrated or applied the idea without a hint.
   - **Remembered with a hint:** the learner succeeded after a small prompt or cue.
   - **Not yet:** the learner could not yet recall it; the same idea stays in the queue for a gentle revisit.
4. The next interval adapts to that observation:
   - Independent recall: 10 days.
   - Recall with a hint: 4 days.
   - Not yet: immediate gentle revision, not a delayed reminder.
   - Legacy review records with no quality evidence use a conservative 7-day interval.
5. The sequence can continue for up to five checks when mastery has not yet been demonstrated. A successful independent recall after an understanding record ends the automatic review sequence and records mastery.

## Evidence rules
- A completion click records participation only.
- An initial parent understanding check records understanding, not mastery.
- A hinted recall never awards mastery.
- An independent recall can establish understanding if the parent had not assessed the original lesson, but it cannot establish mastery on that same attempt. A later independent recall is required.
- A not-yet result keeps the task in the queue; it does not label a child as behind or incapable.
- Infant interactions remain responsive, screen-free parent–child care, not academic tasks or assessment targets.
- The dashboard's shared parent-guided budget remains one family-wide 60-minute default. Short revision sessions use that same shared budget; independent work and infant play remain separate.

## Technical implementation
- Reuses `auto_learning_progress` migration 005 and its existing `completed` / `needs_revision` status values. No schema change, migration or production database write is needed.
- Stores outcome evidence in bounded namespaced IDs: `recall:independent:<review-task-id>`, `recall:with_hint:<review-task-id>`, `recall:not_yet:<review-task-id>`.
- Extends known review identifiers through round 5; legacy `review:1` and `review:2` rows remain valid.
- Assessment evidence is not counted as activity completion. Undoing a later recall preserves an earlier understanding check; dependent later recall rows are removed.
- API writes remain owner-only, same-origin, family-scoped, parameterized and private/no-store. Request limits and existing RLS remain unchanged.
- Review tasks continue to use the original lesson script and are included in the existing family-wide queue and saved planner.

## Explicit limits
This is a transparent rules-based learning aid, not AI grading or a validated cognitive-science diagnostic. The parent chooses the observed recall outcome. Intervals are simple defaults, not clinical recommendations or proof of long-term retention. A mastery indicator means only that the recorded parent understanding check and a later independent recall both occurred.

## Verification
- Unit tests cover early and assessed first recall, 10-day independent interval, 4-day hinted interval, immediate not-yet revision, multi-round progression, mastery stop condition and legacy records.
- Assessment tests cover evidence storage, no mastery from completion or hints, independent recall gating, and undo behaviour.
- No new production migration; no learner records are seeded or rewritten.
