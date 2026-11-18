# Family learning workflow

## Deployment

Apply earlier schema migrations through 010, then run `npm run db:migrate:family-workflow` with the trusted server `DATABASE_URL` before deploying this branch. Migration 011 is additive and repeatable. It preserves existing activities, learners, overall classes, goals and completion records. It supports UUID and bigint learner IDs. No production migration was run during implementation.

The new workflow API reports migration unavailability without hiding the existing planner. Rolling the application back does not require deleting columns or records; retain the additive schema. Do not drop these fields after families have recorded reviews.

## User flow

- NCERT chapter, Olympiad paper and saved-material cards offer Use today, Add to plan and Save for later. The planner asks for learner(s), date, time, support mode and an optional existing goal. A server-resolved resource identity and link are saved in the existing `learning_activities` table. All existing weekly totals and reports read these same records.
- Saved resources are separate bookmarks, not overdue assignments. Assignment is unique per learner/resource/date. Repeating a resource on another date is allowed. Shared multi-child assignment is atomic.
- Today on Home and Planning offers minimum (30), normal (60) and flexible (90) minute defaults. Parents can edit the budget. Budgets flag excess work; they do not silently reschedule or delete anything. Parent-led and shared time overlaps are flagged where start times are provided. Matching shared sessions count once in the family time budget.
- Session editing supports shorter duration, different support, skipping and moving. These changes are explicit. Existing manually created activities also appear and can be reviewed.
- Review stores four understanding outcomes independently of completion, optional actual minutes, notes, an external evidence URL, and the parent's selected next action. It never updates mastery or an overall class. Apply this decision is a separate, explicit step that creates a new session or moves unfinished work. New sessions start without completion or assessment evidence.
- Weekly review on Reports and the workflow panel shows completion, unfinished work, planned learner-minutes, recorded actual minutes and repeated requests for help. Missing time is not inferred. The parent can continue with the same resource, repeat, describe a different approach, move, or reduce and move. Dates default to the next Monday but are editable; nothing rolls over automatically.
- Subject levels on Learners and the workflow panel cover Mathematics, English, Science, Social Science, Hindi and Reasoning, Classes 1–10. An empty override uses the existing overall class. Resource links appear only when the catalogue contains a matching subject/grade. Maths Olympiad prompts use the parent's Mathematics level when selecting a learner; saved settings and manual target selection remain explicit overrides. International prompts retain their labelled Year/Grade 4 scope.
- A parent can deliberately choose a chapter from another class in the study material studio. Prompts identify learner class and target material level separately; saved documents record the chapter's actual class. Family ownership remains required. Generated materials must have current parent approval before assignment or a repeat session. Their existing import/approval/version history remains in use.

## Permissions and storage

Reads require membership in the current (first selected) family. Writes require its owner role. Archived learners are excluded. Generated documents are scoped to their original learner. Optional goal links must belong to the selected learner. Client-supplied URLs/titles are never accepted as resource identities. Writes require same-origin authenticated requests; errors omit database details. New tables have RLS enabled and no public grants, following the repository's trusted-server pattern.

The automatic learning coach remains available for original curriculum suggestions. Its assessment model is not replaced by a parent activity review. The new family plan manages explicitly assigned resources and existing daily activities.

## Verification

Regression tests use an isolated PostgreSQL-compatible database, including both learner ID types, repeated migration application, cross-family and viewer denial, archived learners, approval gating, duplicate protection, shared assignment, review persistence, explicit follow-ups, level persistence and unchanged overall classes. Pure tests exercise overlaps and honest weekly totals. Browser and production migration status must be reported separately from these checks.
