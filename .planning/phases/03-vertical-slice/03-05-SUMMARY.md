---
phase: 03-vertical-slice
plan: 05
subsystem: dashboard-ui
tags: [react-hooks, dashboard, adaptive-ui, heuristics, widgets]

# Dependency graph
requires:
  - phase: 03-04
    provides: useActivityFeed hook with activity data and formatting helpers

provides:
  - useAdaptiveHeadline hook with heuristic-based headline selection
  - HeadlineWidget component with adaptive messaging
  - Priority-based candidate generation system
  - Streak calculation and rest day detection

affects: [personal-dashboard, dashboard-layout, dashboard-widgets]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Heuristic-based content personalization with priority system"
    - "Time-of-day greeting as fallback default"
    - "useMemo for expensive calculations on activity data changes"
    - "Icon mapping via switch statement for headline types"

key-files:
  created:
    - src/v2/hooks/useAdaptiveHeadline.ts
    - src/v2/components/dashboard/HeadlineWidget.tsx
  modified: []

key-decisions:
  - "Priority-based headline selection (highest priority wins)"
  - "Time-of-day greeting as lowest-priority fallback"
  - "Streak requires today or yesterday activity (grace period)"
  - "Rest reminder at 3+ days, welcome back at 7+ days"
  - "V2 design tokens (bg-card-bg, text-text-primary) for styling"

patterns-established:
  - "Pattern: Heuristic candidates with priority - Generate all applicable headlines, sort by priority, return highest"
  - "Pattern: Type-specific icon mapping - getHeadlineIcon maps HeadlineType to emoji"
  - "Pattern: Loading/error/success states in widgets - Skeleton loading, graceful error fallback, full content"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 03 Plan 05: Adaptive Headline Widget

**Heuristic-based adaptive headline system with streak detection, rest day reminders, and time-of-day greetings for personalized dashboard experience**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T17:20:37Z
- **Completed:** 2026-01-23T17:22:48Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Adaptive headline hook with 6 headline types (PB, streak, workout due, goal progress, rest reminder, welcome back)
- Priority-based candidate selection (100 for PB down to 10 for default greeting)
- Streak calculation with consecutive day tracking
- HeadlineWidget component with loading skeleton, error handling, and optional CTA button

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useAdaptiveHeadline hook with heuristics** - `428cc8d` (feat)
2. **Task 2: Create HeadlineWidget component** - `657ceda` (feat)

## Files Created/Modified
- `src/v2/hooks/useAdaptiveHeadline.ts` - Hook with heuristic-based headline generation, streak calculation, rest day detection, and time-of-day greetings
- `src/v2/components/dashboard/HeadlineWidget.tsx` - Widget component displaying adaptive headline with icon, title, subtitle, and optional CTA

## Decisions Made

**Priority-based headline selection**
- Highest priority candidate wins (PB achievement = 100, default greeting = 10)
- Ensures most important message surfaces first
- Simple rule-based system (not ML) for V1

**Streak requires today or yesterday activity**
- Grace period allows overnight workouts or morning-after viewing
- Streak broken if last activity was 2+ days ago
- Pattern: Check if sortedDates[0] === today OR yesterday

**Rest reminder at 3+ days, welcome back at 7+ days**
- 3-6 days: Gentle rest reminder (priority 40)
- 7+ days: Welcome back with CTA (priority 50)
- Encourages return without being pushy during recovery

**Time-of-day greeting as fallback**
- Always added as lowest-priority candidate (priority 10)
- Ensures headline always has something to display
- Pattern: Good morning (< 12h), Good afternoon (< 17h), Good evening (else)

**V2 design tokens for styling**
- bg-card-bg for widget background
- text-text-primary for title, text-text-secondary for subtitle
- bg-action-primary for CTA button
- Consistent with V2 design system established in Phase 1

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - Hook compiled correctly with TypeScript, HeadlineWidget rendered properly with V2 design tokens, build passed without errors.

## Next Phase Readiness

Adaptive headline system complete. Ready for dashboard layout integration:
- useAdaptiveHeadline provides personalized headline based on activity data
- HeadlineWidget renders adaptive content with loading/error states
- CTA routing works with React Router
- Heuristics can be tuned based on user feedback

Next: Plan 03-06 will integrate headline widget into dashboard layout or continue building dashboard widgets (activity feed, quick stats, etc.).

---
*Phase: 03-vertical-slice*
*Completed: 2026-01-23*
