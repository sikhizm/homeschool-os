# Navigation and wayfinding refresh

## What changed
- Reduced the primary navigation to five clear destinations: Home, Planner, Explore, Activities and Progress.
- Grouped Portfolio and Insights under Progress, with accessible contextual tabs for switching between them.
- Added compact, labelled contextual tabs for planning, curriculum exploration and activities.
- Replaced the low-contrast text breadcrumbs on Explore pages with the consistent contextual navigation.
- Kept the contextual tabs horizontally scrollable on narrow screens and added visible keyboard-focus states.
- Added route-model tests for nested NCERT pages, planner destinations, progress grouping and the dashboard's uncluttered state.

## Safety and data
- Navigation-only UI and route metadata; no learner records, progress, plans or permissions are changed.
- No database migration or new API is required.

## Release gates
- Run lint, typecheck, unit tests and production build.
- Verify desktop and mobile navigation, including nested NCERT chapter routes and current-page announcements for assistive technology.
