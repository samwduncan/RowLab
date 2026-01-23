---
phase: 04-migration-loop
plan: 05
subsystem: api
tags: [tanstack-query, react-hooks, typescript, coach-features]

# Dependency graph
requires:
  - phase: 04-02
    provides: Whiteboard API endpoints
  - phase: 04-03
    provides: OarSet API endpoints
  - phase: 04-04
    provides: Availability API endpoints
  - phase: 03-04
    provides: TanStack Query hook patterns
provides:
  - TanStack Query hooks for coach features (whiteboard, shells, oar sets)
  - TypeScript types for coach domain models
  - Optimistic update patterns for equipment CRUD
affects: [coach-ui, equipment-management, whiteboard-widget]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optimistic CRUD mutations with rollback on error"
    - "Equipment hooks with full create/update/delete lifecycle"

key-files:
  created:
    - src/v2/types/coach.ts
    - src/v2/hooks/useWhiteboard.ts
    - src/v2/hooks/useShells.ts
    - src/v2/hooks/useOarSets.ts
  modified: []

key-decisions:
  - "useWhiteboard returns null for missing whiteboard (404 expected for new teams)"
  - "Optimistic updates for shells/oarSets use temporary IDs for create operations"
  - "5min staleTime for all coach hooks - equipment/whiteboards don't change frequently"

patterns-established:
  - "CRUD hooks pattern: query + create/update/delete mutations with optimistic updates"
  - "Equipment hooks use onMutate/onError/onSettled for optimistic UI with rollback"

# Metrics
duration: 8min
completed: 2026-01-23
---

# Phase 4 Plan 5: Coach Data Hooks Summary

**TanStack Query hooks for whiteboard, shells, and oar sets with optimistic CRUD mutations and TypeScript types matching Prisma schema**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-23T19:24:24Z
- **Completed:** 2026-01-23T19:32:11Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- TypeScript types for coach features (Whiteboard, Shell, OarSet, Availability) matching Prisma schema exactly
- useWhiteboard hook with fetch, save (upsert), and delete mutations
- useShells and useOarSets hooks with full CRUD and optimistic updates
- All hooks follow established TanStack Query patterns from Phase 3

## Task Commits

Each task was committed atomically:

1. **Task 1: Create coach TypeScript types** - `58c2eba` (feat)
2. **Task 2: Create useWhiteboard hook** - `d4f48d8` (feat)
3. **Task 3: Create useShells and useOarSets hooks** - `694ba66` (feat)

## Files Created/Modified

- `src/v2/types/coach.ts` - TypeScript interfaces for Whiteboard, Shell, OarSet, and Availability domain models
- `src/v2/hooks/useWhiteboard.ts` - TanStack Query hook for whiteboard fetch/save/delete with cache updates
- `src/v2/hooks/useShells.ts` - CRUD hook for shells with optimistic updates and rollback on error
- `src/v2/hooks/useOarSets.ts` - CRUD hook for oar sets with optimistic updates and rollback on error

## Decisions Made

**1. Null handling for missing whiteboard**
- Rationale: New teams won't have whiteboards yet, 404 is expected behavior. Hook returns null instead of throwing error.

**2. Optimistic updates for equipment CRUD**
- Rationale: Immediate UI feedback for create/update/delete operations. Temporary IDs used for create, rollback on error.

**3. 5-minute staleTime for all coach hooks**
- Rationale: Equipment and whiteboards don't change frequently. Balances fresh data with reduced API calls.

**4. TypeScript enums match Prisma exactly**
- Rationale: ShellType uses EIGHT/FOUR/QUAD/etc (not "8+", "4+"), WeightClass uses OPENWEIGHT (not OPEN) per schema

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following established Phase 3 patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for coach UI development:**
- Data layer complete for whiteboard, shells, and oar sets
- Hooks provide loading/saving/deleting states for UI feedback
- Optimistic updates ensure responsive equipment management UX
- TypeScript types provide autocomplete and type safety

**Future integrations:**
- Availability hooks can be added following same pattern when needed
- Whiteboard could support markdown preview/editor widgets
- Equipment hooks ready for inventory management UI

---
*Phase: 04-migration-loop*
*Completed: 2026-01-23*
