---
phase: 14-advanced-seat-racing-analytics
plan: 06
subsystem: ui-hooks
tags: [tanstack-query, react-hooks, frontend-data, advanced-ranking, bradley-terry, composite-ranking]

# Dependency graph
requires:
  - phase: 14-01
    provides: Type system for advanced ranking models
  - phase: 14-05
    provides: Backend API routes for advanced rankings
provides:
  - TanStack Query v5 hooks for Bradley-Terry model rankings
  - TanStack Query hooks for matrix session planner
  - TanStack Query hooks for composite rankings
  - Proper cache management with query keys
  - Authentication-aware data fetching
affects: [14-07-visualization-components, 14-08-ux-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Query key factory pattern for cache management"
    - "Auth-aware hook pattern with useAuthStore"
    - "Separate query and mutation hooks for clarity"
    - "Combined hooks for related operations (useMatrixPlanner)"

key-files:
  created:
    - src/v2/hooks/useAdvancedRankings.ts
    - src/v2/hooks/useMatrixPlanner.ts
    - src/v2/hooks/useCompositeRankings.ts
  modified: []

key-decisions:
  - "Used query key factory pattern for cache invalidation across related queries"
  - "Split matrix planner into separate generate/validate hooks with combined convenience hook"
  - "Set 5-minute stale time for rankings (stable data that updates infrequently)"
  - "Set 60-minute stale time for weight profiles (rarely changes)"

patterns-established:
  - "Query keys: namespaced with entity type and parameters"
  - "Fetch functions: async, throw on !success, return typed data"
  - "Hook returns: destructure query.data into meaningful properties"
  - "Cache invalidation: use query key factories for related data"

# Metrics
duration: 2min
completed: 2026-01-26
---

# Phase 14 Plan 06: Frontend Data Hooks Summary

**TanStack Query v5 hooks for Bradley-Terry rankings, matrix planner, and composite rankings with proper cache management and auth integration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-26T17:47:33Z
- **Completed:** 2026-01-26T17:49:46Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created hooks for all advanced ranking API endpoints
- Implemented query key factories for cache management
- Auth-aware data fetching with useAuthStore integration
- Proper loading, error, and stale time configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Bradley-Terry and comparison graph hooks** - `55c4ed7` (feat)
2. **Task 2: Matrix planner hooks** - `1a3fac8` (feat)
3. **Task 3: Composite rankings hooks** - `08eaa24` (feat)

## Files Created/Modified

- `src/v2/hooks/useAdvancedRankings.ts` - Hooks for Bradley-Terry model, probability matrix, and comparison graph visualization
- `src/v2/hooks/useMatrixPlanner.ts` - Mutation hooks for schedule generation and validation
- `src/v2/hooks/useCompositeRankings.ts` - Hooks for composite rankings, weight profiles, and side-specific ratings

## Decisions Made

**Query Key Factories:** Created namespaced query key factories (`advancedRankingKeys`, `compositeRankingKeys`) to enable efficient cache invalidation. When matrix planner generates new schedule, all advanced ranking queries are invalidated.

**Stale Time Configuration:**
- 5 minutes for rankings (stable data that changes only after seat race processing)
- 60 minutes for weight profiles (configuration data that rarely changes)
- Prevents excessive refetches while ensuring data freshness

**Hook Granularity:** Split matrix planner into `useGenerateSchedule` and `useValidateSchedule` for clear separation, then provided `useMatrixPlanner` combined hook for components needing both operations.

**Auth Integration:** All hooks check `isAuthenticated`, `isInitialized`, and `activeTeamId` before enabling queries, preventing unnecessary API calls during auth initialization.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Import Error:** Initial import of `ApiResponse` from `advancedRanking.ts` failed because type wasn't exported. Fixed by importing from `dashboard.ts` (established pattern in codebase).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 14-07 (Visualization Components):**
- All data fetching hooks available
- Loading and error states handled
- Cache invalidation configured
- Type-safe API integration

**Ready for Phase 14-08 (UX Integration):**
- Hooks follow established patterns from Phase 9 seat racing
- Auth-aware with proper enabled flags
- Destructured return values for clean component usage

---
*Phase: 14-advanced-seat-racing-analytics*
*Completed: 2026-01-26*
