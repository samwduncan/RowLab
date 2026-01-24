---
phase: 07-erg-data-performance
plan: 01
subsystem: api
tags: [tanstack-query, typescript, erg-tests, concept2, react-hooks]

# Dependency graph
requires:
  - phase: 06-athletes-roster
    provides: useAthletes pattern and athlete types
provides:
  - TypeScript types for erg tests and Concept2 integration
  - TanStack Query hooks for erg test CRUD operations
  - Hooks for C2 sync status and manual sync triggering
  - Leaderboard and athlete history query hooks
affects: [07-02-erg-table, 07-03-erg-detail, 07-04-leaderboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Query hooks for erg data following useAthletes pattern
    - Optimistic updates for all CRUD mutations
    - Query key design with filters for proper cache isolation
    - Separate hooks by access pattern (list, detail, leaderboard)

key-files:
  created:
    - src/v2/types/ergTests.ts
    - src/v2/hooks/useErgTests.ts
    - src/v2/hooks/useConcept2.ts
  modified: []

key-decisions:
  - "Query keys include filters to enable proper cache isolation"
  - "Optimistic updates for all mutations following established pattern"
  - "Separate hooks by access pattern for clarity (useErgTests, useAthleteErgHistory, useErgLeaderboard)"
  - "C2 status has 5-minute staleTime (changes infrequently)"
  - "useTeamC2Statuses provided but UI should use individual queries to avoid N+1"

patterns-established:
  - "ErgTest type matches backend formatErgTest() exactly"
  - "PersonalBests as Partial<Record<TestType, PersonalBest>> for type safety"
  - "C2 hooks support both athlete-specific and current user queries"

# Metrics
duration: 4min
completed: 2026-01-24
---

# Phase 07 Plan 01: Erg Data Foundation Summary

**TypeScript types and TanStack Query hooks for erg tests, athlete history, leaderboards, and Concept2 sync**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-24T18:09:33Z
- **Completed:** 2026-01-24T18:13:10Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Complete type system for erg tests matching backend API contracts
- CRUD hooks with optimistic updates for erg test management
- Athlete history and leaderboard query hooks
- Concept2 connection status and sync operation hooks
- Bulk import support for CSV data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create erg test types** - `9229c1b` (feat)
2. **Task 2: Create useErgTests hooks** - `cbeee7c` (feat)
3. **Task 3: Create useConcept2 hooks** - `0223beb` (feat)

## Files Created/Modified
- `src/v2/types/ergTests.ts` - Complete type definitions for erg tests and C2 integration
- `src/v2/hooks/useErgTests.ts` - Four hooks for erg test operations (list, history, leaderboard, bulk import)
- `src/v2/hooks/useConcept2.ts` - Three hooks for C2 status and sync operations

## Decisions Made

**Query key design with filters**
- Included filters in query key: `['ergTests', filters]`
- Enables proper cache isolation when filtering by athlete/testType/date
- Prevents stale data when switching between filtered views

**Separate hooks by access pattern**
- `useErgTests` - Main list with CRUD mutations
- `useAthleteErgHistory` - Athlete profile with personal bests
- `useErgLeaderboard` - Rankings by test type
- `useBulkImportErgTests` - CSV import
- Pattern provides clarity and prevents over-fetching

**C2 status staleTime**
- Set to 5 minutes (vs 2 minutes for erg tests)
- C2 connection status changes infrequently
- Reduces unnecessary API calls for status checks

**Team C2 statuses pattern**
- `useTeamC2Statuses` provided for bulk queries
- Recommended: individual components query as needed
- Avoids N+1 problem at initial load time

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - backend API contracts were clear, types mapped directly to `formatErgTest()` and `getC2Status()` responses.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Data layer complete. Ready for UI implementation:
- 07-02: Erg test table with virtualization
- 07-03: Erg test detail/edit forms
- 07-04: Leaderboard and athlete history views

All hooks follow established patterns from Phase 6 (useAthletes, useAttendance).

---
*Phase: 07-erg-data-performance*
*Completed: 2026-01-24*
