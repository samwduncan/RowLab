---
phase: 03-vertical-slice
plan: 01
subsystem: ui
tags: [tanstack-query, react-query, data-fetching, api-cache]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: V2Layout shell component with context providers
provides:
  - TanStack Query v5 installed and configured
  - QueryClient singleton with external API defaults
  - QueryClientProvider wrapping all V2 components
  - React Query Devtools available in development
affects: [03-02, 03-03, 03-04, all-future-v2-data-fetching]

# Tech tracking
tech-stack:
  added: [@tanstack/react-query@5.90.20, @tanstack/react-query-devtools@5.91.2]
  patterns: [QueryClient singleton pattern, Provider composition in V2Layout]

key-files:
  created: [src/v2/queryClient.ts]
  modified: [src/v2/layouts/V2Layout.tsx, package.json]

key-decisions:
  - "QueryClient singleton exported from dedicated module to prevent recreation on render"
  - "staleTime 5min and gcTime 10min for external APIs that change infrequently"
  - "refetchOnWindowFocus disabled to prevent API rate limit issues"
  - "retry: 1 for queries (network resilience) but 0 for mutations (avoid duplicate operations)"
  - "QueryClientProvider as outermost provider in V2Layout hierarchy"

patterns-established:
  - "QueryClient configuration: singleton pattern with external API-optimized defaults"
  - "Provider nesting: QueryClient > Auth > Settings > .v2 container"
  - "React Query Devtools: bottom-right, closed by default, dev-only"

# Metrics
duration: 5min
completed: 2026-01-23
---

# Phase 03 Plan 01: TanStack Query Setup Summary

**TanStack Query v5 integrated with external API-optimized defaults (5min stale time, no window refetch) and devtools**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-23T16:36:40Z
- **Completed:** 2026-01-23T16:41:34Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- TanStack Query v5 (5.90.20) and devtools (5.91.2) installed
- QueryClient singleton with external API defaults configured
- QueryClientProvider integrated as outermost provider in V2Layout
- React Query Devtools available in development mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Install TanStack Query v5** - `7b07211` (chore)
2. **Task 2: Create QueryClient singleton with default options** - `ba9a173` (feat)
3. **Task 3: Integrate QueryClientProvider into V2Layout** - `5afb4ad` (feat)

## Files Created/Modified
- `src/v2/queryClient.ts` - QueryClient singleton with external API defaults (staleTime 5min, gcTime 10min, no refetchOnWindowFocus)
- `src/v2/layouts/V2Layout.tsx` - Added QueryClientProvider wrapper and React Query Devtools
- `package.json` - Added @tanstack/react-query and @tanstack/react-query-devtools dependencies

## Decisions Made

**QueryClient configuration optimized for external APIs:**
- **staleTime 5min:** External APIs (C2, Strava) don't change frequently, reduce unnecessary refetches
- **gcTime 10min:** Keep cached data for background tabs returning to foreground
- **refetchOnWindowFocus: false:** Prevent API hammering when switching tabs (critical for rate-limited APIs)
- **retry 1 for queries, 0 for mutations:** Network resilience without retry loops on external API errors

**Provider nesting order:**
- QueryClientProvider outermost to provide React Query context to all V2 components
- AuthStoreContext and SettingsStoreContext nested inside (existing V1 store access pattern)
- React Query Devtools positioned bottom-right to avoid sidebar overlap

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- TanStack Query ready for use in all V2 components
- useQuery and useMutation hooks available for C2 and Strava API integrations
- React Query Devtools available for debugging query state during development
- Ready for 03-02 (Dashboard Preferences API) which will be first consumer

**Blockers:** None

**Concerns:** None

---
*Phase: 03-vertical-slice*
*Completed: 2026-01-23*
