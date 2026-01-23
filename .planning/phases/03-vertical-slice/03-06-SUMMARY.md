---
phase: 03-vertical-slice
plan: 06
subsystem: ui
tags: [react, typescript, framer-motion, tanstack-query, dashboard, activity-feed]

# Dependency graph
requires:
  - phase: 03-04
    provides: useActivityFeed and useDashboardPrefs hooks
provides:
  - ActivityCard component with expand/collapse and source badges
  - UnifiedActivityFeed widget with loading/error/empty states
affects: [dashboard, ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "V2 design token usage via tailwind.v2.config.js classes"
    - "Loading skeleton matching component layout"
    - "Empty state pattern for no-data scenarios"

key-files:
  created:
    - src/v2/components/dashboard/ActivityCard.tsx
    - src/v2/components/dashboard/UnifiedActivityFeed.tsx
  modified: []

key-decisions:
  - "Fixed existing ActivityCard to use correct V2 design tokens (bg-card-bg, text-text-primary, border-card-border)"
  - "Loading skeleton shows 3 cards to match typical viewport"
  - "Error state includes retry button for manual refetch"

patterns-established:
  - "ActivityCard uses Framer Motion AnimatePresence for expand/collapse"
  - "Source badges use distinct colors: C2 blue, Strava orange, Manual gray"
  - "Duplicate indicator shows linked sources when present"

# Metrics
duration: 25min
completed: 2026-01-23
---

# Phase 03 Plan 06: Unified Activity Feed Widget Summary

**Activity feed widget with expandable cards, source badges, and deduplication indicators**

## Performance

- **Duration:** 25 min
- **Started:** 2026-01-23T16:53:27Z
- **Completed:** 2026-01-23T17:17:53Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fixed ActivityCard to use correct V2 design tokens from tailwind.v2.config.js
- Created UnifiedActivityFeed with loading, error, and empty states
- Integrated useDashboardPrefs to respect hidden sources
- Implemented expandable metrics view with Framer Motion animations

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix ActivityCard component** - `08cac76` (fix)
2. **Task 2: Create UnifiedActivityFeed component** - `acbd21a` (feat)

## Files Created/Modified

### Created
- `src/v2/components/dashboard/ActivityCard.tsx` - Individual activity card with expand/collapse, source badge (C2 blue, Strava orange), core metrics, and duplicate indicator
- `src/v2/components/dashboard/UnifiedActivityFeed.tsx` - Activity feed widget with ActivitySkeleton, EmptyState, error handling with retry, and activity list rendering

### Modified
None (ActivityCard existed but was corrected for V2 design tokens)

## Decisions Made

1. **Fixed V2 design token class names:** ActivityCard was using non-existent classes (bg-surface-tertiary, text-text-tertiary) that aren't in tailwind.v2.config.js. Corrected to bg-card-bg, text-text-primary, border-card-border.

2. **Loading skeleton count:** Shows 3 skeleton cards during loading to match typical viewport height without overwhelming initial render.

3. **Error state retry button:** Includes refetch button for manual recovery without page refresh.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected V2 design token class names in ActivityCard**
- **Found during:** Task 1 (Create ActivityCard component)
- **Issue:** Existing ActivityCard.tsx used non-existent Tailwind classes (bg-surface-tertiary, text-text-tertiary, border-border-secondary) that aren't defined in tailwind.v2.config.js
- **Fix:**
  - Changed bg-surface-tertiary → bg-card-bg with border-card-border
  - Changed text-text-tertiary → text-text-secondary for labels
  - Changed border-border-secondary → border-border-default
  - Changed hover:bg-surface-tertiary/80 → hover:bg-card-hover
- **Files modified:** src/v2/components/dashboard/ActivityCard.tsx
- **Verification:** npm run build passes without errors
- **Committed in:** 08cac76 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix was necessary for correct styling. ActivityCard file existed but needed correction to match V2 design system. No scope creep.

## Issues Encountered

None - both components compiled and built successfully on first verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for dashboard integration.** Activity feed components complete with:
- ActivityCard showing source badges, core metrics, expandable details
- UnifiedActivityFeed handling loading, error, empty, and populated states
- Correct V2 design tokens throughout
- Integration with useActivityFeed and useDashboardPrefs hooks

Next steps:
- Add UnifiedActivityFeed to personal dashboard page
- Wire up widget configuration controls
- Test with real C2 and Strava data

---
*Phase: 03-vertical-slice*
*Completed: 2026-01-23*
