# Phase 05 — Lessons, activities and printable resources

## Release scope
- Authenticated parent-only resource studio at `/lessons`, linked from Dashboard and Planning.
- 20 original, age-banded activity starters covering early years through Class 12, literacy, maths, environmental inquiry, Punjabi and Sikh heritage. Each includes intent, safe materials, steps, discussion prompts, a printable activity and adaptations.
- Filter by stage and subject, free-text search, a printable A4 worksheet using the browser's Print/Save as PDF function.
- For family owners, a learner/date picker and editable activity title and duration. Saving uses the **existing** authenticated, origin-checked `activity.create` endpoint and its SQL family-ownership validation. Saved records begin incomplete and have no automatic goal progress, evidence, grades or achievement.
- Clear empty, error, saving and success feedback; mobile responsive layout, keyboard-accessible standard controls and print stylesheet.
- Source library consistency tests and existing repository CI. No database schema changes or third-party content/API requests.

## Intentional privacy constraints
- The lesson catalogue is static, original teaching content. It contains no child data or family-specific details; no public file uploads, no personalized PDF exports, no user-generated rich HTML and no hidden analytics.
- Learners' display names are only shown on authenticated pages, never embedded in printable sheets or their URLs.
- Lesson notes are a transient local form field **not persisted**. The daily planner remains the source of truth for saved activities. Only title, duration and selected date are sent to it; the saved activity is unlinked to a subject/goal until the parent edits the activity there.
- The same preview/production Neon database may be used: testing an activity save can create real records. Use only intentional edits or a properly isolated preview database.
- Older learners require the appropriate actual NCERT/CBSE material selected by a parent. Activities are original teaching examples, not official worksheets, complete syllabus coverage or validated progress assessments.
- No independent screen use or worksheets for infants. Safety and accessibility adaptations always require parent judgement. Do not invent Gurbani quotations or unverified historical claims.

## Verification checklist
1. Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:ui`, `npm run build`, `npm run test:smoke`. The existing CI workflow executes these with synthetic fixtures and no real production credentials.
2. Sign in to the preview with an approved family account and verify `/lessons` library, filters, lesson details, printable A4 sheet and a 375px mobile viewport.
3. Verify `/lessons` redirects unauthenticated users, and a non-owner gets a read-only experience; it cannot save an activity.
4. If intentionally testing a save, select a learner and day, customize title/minutes, save once, and verify a new **incomplete** activity appears on that date's Dashboard. Do not create fictitious learner records or mastery data.
5. Confirm existing learner subjects, goal progress, plan records and daily completion remain unchanged by merely viewing or printing a lesson.

## Follow-on work
Personalized worksheet builders, PDF file export beyond browser printing, teacher-created library persistence, versioned external content sources, subject/goal association at import, and lesson analytics are explicitly outside Phase 05's reviewed static-library scope.
