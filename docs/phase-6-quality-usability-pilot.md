# Phase 6 — quality, usability and personal pilot release

This checklist separates automated evidence from human acceptance. A passing CI run is necessary, but it is not proof that a learner and parent have completed a real pilot.

## Automated release gates

Run locally before requesting release review:

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run phase6:quality`
- [ ] `npm run curriculum:framework-audit`
- [ ] `npm run test:ui` with Playwright Chromium installed
- [ ] `npm run build`
- [ ] `npm run test:smoke` against the built production server

The GitHub Actions verification workflow runs the automated checks above (including the production build and smoke test). Browser tests use isolated fixtures; do not point them at production learner data.

## Manual device acceptance

Record actual device, OS, browser and date. Test at minimum:

| Viewport/device | Required checks | Result / notes |
|---|---|---|
| Desktop, 1280px or wider | Navigation, Manage Mode, Learn Mode, forms, dialogs, tables, keyboard-only navigation | |
| Tablet, around 768px | Navigation transition, grid wrapping, no clipped controls or horizontal page scroll | |
| Mobile, 375px | Bottom navigation, touch targets, forms, chapter reading, safe-area spacing, PWA install state | |
| Narrow mobile, 320px | No horizontal page overflow; all primary actions remain reachable | |
| Actual iOS or Android device | Install/open PWA, resume session, rotate screen, browser back, offline/poor-network behaviour | |

For each screen, verify:
- Text remains readable at browser zoom 200%.
- Focus is visible and follows a logical order.
- Every form control has a visible, understandable label.
- Buttons and links have distinct, meaningful names.
- Errors are announced in context and do not erase entered data.
- No content is hidden behind the top bar or bottom navigation.
- Learner switching never exposes another learner's information.

## Accessibility review

- [ ] Complete a keyboard-only pass through sign-in, learner selection, Learn Mode and Manage Mode.
- [ ] Check heading hierarchy and page landmarks.
- [ ] Check accessible names for icon-only controls and form labels.
- [ ] Check colour contrast for normal text, muted text, status chips and focus indicators.
- [ ] Check screen-reader announcements for validation errors, saved states and loading states.
- [ ] Run an accessibility scanner on the key authenticated workflows and manually review every reported issue.

Automated structural checks do not replace a WCAG audit or assistive-technology testing. Record scanner name/version and the pages tested.

## Performance review

- [ ] Run Lighthouse on the production build for Home, Learn, NCERT book/chapter and a representative Manage Mode screen.
- [ ] Record mobile and desktop Performance, Accessibility, Best Practices and SEO scores.
- [ ] Record LCP, INP, CLS, total transfer size and JavaScript transferred for each page.
- [ ] Investigate console errors, failed requests, layout shifts and oversized images.
- [ ] Compare against the previous release and document regressions before accepting them.

Suggested Core Web Vitals targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at the 75th percentile. Lighthouse lab values are diagnostic and must not be represented as field data.

## Content-quality review

- [ ] Confirm curriculum and lesson catalogue validators pass.
- [ ] Sample at least one learning journey per active grade and multiple subjects.
- [ ] Check that age/grade language, instructions, objectives and expected learner effort are appropriate.
- [ ] Check every sampled official textbook reference against the current official source.
- [ ] Confirm generated learning guidance is original and does not reproduce textbook pages or claim unverified competency alignment.
- [ ] Confirm missing source evidence is labelled honestly rather than presented as verified.

## Personal learning-workspace pilot

Complete this section only after a real family-guided pilot. Use synthetic/test accounts for any additional test data.

- Pilot date:
- Device(s) and browser(s):
- Parent/guardian participant:
- Learner grade(s):
- Sessions completed:
- Workflows exercised: sign-in, learner switch, Learn Mode, reading, practice, progress save, Manage Mode, reports
- Issues observed:
- Data/privacy concerns:
- Parent/guardian feedback:
- Learner feedback:
- Fixes required before release:
- Retest evidence:
- Pilot accepted by:
- Release decision: Go / No-go

## Release decision

A release is eligible for approval only when automated gates pass, device and accessibility findings are reviewed, content issues are resolved or explicitly accepted, and the family pilot has a recorded Go decision. Do not mark the pilot task complete merely because the checklist or CI workflow exists.
