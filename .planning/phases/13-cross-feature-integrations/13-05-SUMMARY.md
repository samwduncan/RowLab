---
phase: 13-cross-feature-integrations
plan: 05
subsystem: ui
tags: [live-erg, tanstack-query, polling, framer-motion, phosphor-icons]

# Dependency graph
requires:
  - phase: 13-02
    provides: Session types and hooks foundation
provides:
  - Live Erg monitoring dashboard with real-time polling
  - LiveErgDashboard, AthleteErgCard, RankedLeaderboard components
  - useLiveErgPolling hook with TanStack Query refetchInterval
  - Polling controls (pause/resume/toggle)
  - LiveErgData and LiveSessionData TypeScript types
affects: [live-erg-page, session-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Query polling with refetchInterval and refetchIntervalInBackground
    - Polling controls hook pattern (pause/resume/toggle/setInterval)
    - Framer Motion layout animations for ranked lists
    - Component separation (card vs leaderboard vs dashboard)

key-files:
  created:
    - src/v2/types/live-erg.ts
    - src/v2/features/live-erg/hooks/useLiveErgPolling.ts
    - src/v2/features/live-erg/components/AthleteErgCard.tsx
    - src/v2/features/live-erg/components/RankedLeaderboard.tsx
    - src/v2/features/live-erg/components/LiveErgDashboard.tsx
  modified: []

key-decisions:
  - "5-second default polling interval with 2.5s staleTime"
  - "Used Lightning icon instead of Activity (not available in phosphor)"
  - "Separated active vs pending athletes in UI display"
  - "Added sort metric selector for leaderboard (pace/distance/watts)"

patterns-established:
  - "Live data polling with usePollingControls for state management"
  - "View mode toggle pattern (leaderboard vs grid)"
  - "Target comparison with color-coded feedback"

# Metrics
duration: 12min
completed: 2026-01-26
---

# Phase 13 Plan 05: Live Erg Dashboard Summary

**Live Erg monitoring dashboard with TanStack Query polling, leaderboard/grid views, and real-time athlete metrics display**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-26T01:27:15Z
- **Completed:** 2026-01-26T01:39:46Z
- **Tasks:** 3
- **Files created:** 5

## Accomplishments

- Created TypeScript types for live erg data (LiveErgData, LiveSessionData, AthleteErgStatus)
- Implemented TanStack Query polling hook with configurable interval (default 5s)
- Built LiveErgDashboard with leaderboard and grid view modes
- Added polling controls (pause/resume) and target pace comparison
- Separated active athletes (ranked) from pending athletes (waiting section)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Live Erg TypeScript types** - `9343e86` (feat)
2. **Task 2: Create Live Erg polling hook** - `a334d6f` (feat)
3. **Task 3: Create Live Erg components** - `331d7d6` (feat)

## Files Created/Modified

- `src/v2/types/live-erg.ts` - LiveErgData, LiveSessionData, AthleteErgStatus, helper functions, STATUS_COLORS
- `src/v2/features/live-erg/hooks/useLiveErgPolling.ts` - useLiveErgPolling and usePollingControls hooks
- `src/v2/features/live-erg/components/AthleteErgCard.tsx` - Individual athlete card with metrics
- `src/v2/features/live-erg/components/RankedLeaderboard.tsx` - Table view with ranking
- `src/v2/features/live-erg/components/LiveErgDashboard.tsx` - Main dashboard component

## Decisions Made

1. **5-second polling interval** - Balances responsiveness with API load per RESEARCH.md recommendation
2. **Lightning icon for active status** - Phosphor doesn't export "Activity" icon, Lightning provides similar visual
3. **Explicit type annotations for authStore** - Added `any` type annotations to work around missing JS type definitions
4. **Sort metric selector** - Added dropdown to sort leaderboard by pace/distance/watts for flexibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed missing Activity icon from phosphor**
- **Found during:** Task 3 (AthleteErgCard component)
- **Issue:** `Activity` icon doesn't exist in @phosphor-icons/react
- **Fix:** Replaced with `Lightning` icon which provides similar "active" visual
- **Files modified:** src/v2/features/live-erg/components/AthleteErgCard.tsx
- **Verification:** TypeScript compiles without phosphor errors
- **Committed in:** 331d7d6 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed implicit any type for authStore selectors**
- **Found during:** Task 2 (useLiveErgPolling hook)
- **Issue:** authStore is JS file without type definitions, causing TS7006
- **Fix:** Added explicit `any` type annotation with eslint-disable comment
- **Files modified:** src/v2/features/live-erg/hooks/useLiveErgPolling.ts
- **Verification:** Follows same pattern as other v2 hooks
- **Committed in:** 331d7d6 (included in Task 3 for cleaner history)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered

None - plan executed with minor adjustments for existing codebase patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Live Erg dashboard ready for integration with sessions page
- Backend API endpoint `/api/v1/sessions/:id/live-data` needs implementation (13-03)
- C2 Logbook integration for actual erg data fetching (future phase)

---
*Phase: 13-cross-feature-integrations*
*Completed: 2026-01-26*
