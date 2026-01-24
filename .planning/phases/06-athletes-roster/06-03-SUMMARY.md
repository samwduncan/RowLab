---
phase: 06-athletes-roster
plan: 03
subsystem: api
tags: [typescript, tanstack-query, react, athletes, attendance, types, hooks]

# Dependency graph
requires:
  - phase: 06-athletes-roster
    provides: Attendance Prisma model and backend service
provides:
  - TypeScript types for Athlete and Attendance domains
  - TanStack Query hooks for athletes CRUD operations
  - TanStack Query hooks for attendance tracking
  - Client-side athlete filtering (search, side, capabilities)
  - CSV import types for bulk athlete operations
affects: [06-athletes-roster, roster-components, athlete-management-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TanStack Query hooks with optimistic updates and rollback"
    - "Client-side filtering for athletes (search, side, capabilities)"
    - "Attendance map conversion for O(1) athlete lookup"

key-files:
  created:
    - src/v2/types/athletes.ts
    - src/v2/hooks/useAthletes.ts
    - src/v2/hooks/useAttendance.ts
  modified: []

key-decisions:
  - "Use client-side filtering for athletes to reduce API calls"
  - "Convert attendance array to map for efficient athlete lookup"
  - "Separate hooks for date-based vs athlete-based attendance queries"

patterns-established:
  - "Client-side filtering pattern for reducing server requests"
  - "AttendanceMap pattern for O(1) lookup by athleteId"
  - "Separate query hooks by access pattern (date vs athlete vs summary)"

# Metrics
duration: 6min
completed: 2026-01-24
---

# Phase 06 Plan 03: Data Layer for Athletes & Attendance Summary

**TypeScript types and TanStack Query hooks with optimistic updates, client-side filtering, and attendance map pattern for efficient lookups**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-24T15:38:56Z
- **Completed:** 2026-01-24T15:45:38Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Created comprehensive TypeScript types matching Prisma schema for Athlete and Attendance domains
- Implemented useAthletes hook with full CRUD operations, client-side filtering, and bulk CSV import
- Implemented three attendance hooks (date-based, athlete-based, summary) with optimistic updates

## Task Commits

Each task was committed atomically:

1. **Task 1: Create athletes and attendance types** - `bacc65a` (feat)
2. **Task 2: Create useAthletes hook** - (already committed in 0cf8a41)
3. **Task 3: Create useAttendance hooks** - `1f20b8d` (feat)

## Files Created/Modified
- `src/v2/types/athletes.ts` - Athlete, Attendance, filters, CSV import types matching Prisma schema
- `src/v2/hooks/useAthletes.ts` - CRUD hooks with client-side filtering and bulk import
- `src/v2/hooks/useAttendance.ts` - Date-based, athlete-based, and summary hooks with attendance map

## Decisions Made

**1. Client-side filtering for athletes**
- Rationale: Reduces API calls, improves UX responsiveness, roster data typically small (<200 athletes)
- Implementation: Filter function applies search, side, canScull, canCox filters on cached data
- Benefit: Zero latency for filter changes, works offline with stale data

**2. Attendance map conversion**
- Rationale: Components need O(1) lookup by athleteId when rendering roster with attendance status
- Implementation: Convert attendance array to `Record<string, Attendance>` keyed by athleteId
- Benefit: Eliminates O(n) find() calls in render loops for 100+ athletes

**3. Separate hooks by access pattern**
- Rationale: Different components need different query patterns (coach view vs athlete profile)
- Implementation: useAttendance (by date), useAthleteAttendance (by athlete), useAttendanceSummary (stats)
- Benefit: Each hook optimized for its use case with appropriate staleTime and cache keys

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] useAthletes.ts already existed**
- **Found during:** Task 2
- **Issue:** File was created in earlier commit (0cf8a41) as part of attendance schema application
- **Fix:** Verified content matched plan specification exactly, no additional work needed
- **Files modified:** None
- **Verification:** git diff showed no changes
- **Committed in:** N/A (already committed)

---

**Total deviations:** 1 auto-fixed (1 blocking - file already existed)
**Impact on plan:** No impact. The existing file matched the plan specification exactly, indicating proper coordination across plan execution.

## Issues Encountered

**TypeScript compilation warnings**
- Issue: authStore.js has no type declarations, causing TS7016 errors
- Resolution: Consistent with all other hooks in codebase (useShells, useAvailability, etc.). Not a blocker - file compiles correctly in actual build system.
- Impact: None - follows established pattern

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for component development:**
- All data layer types and hooks created
- Optimistic updates handle UI responsiveness
- Client-side filtering ready for roster table
- Attendance map pattern optimized for rendering

**Next steps:**
- Build VirtualTable component for roster visualization
- Create CSV import wizard using CSV types
- Implement athlete detail slide-out panel
- Add attendance tracking UI components

---
*Phase: 06-athletes-roster*
*Completed: 2026-01-24*
