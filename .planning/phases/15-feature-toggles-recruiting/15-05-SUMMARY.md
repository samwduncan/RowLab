---
phase: 15-feature-toggles-recruiting
plan: 05
subsystem: recruiting
tags: [tanstack-query, framer-motion, react, calendar, recruiting]

# Dependency graph
requires:
  - phase: 15-04
    provides: "Recruit Visit Prisma models and API endpoints"
  - phase: 13-02
    provides: "TanStack Query patterns from useSessions.ts"
provides:
  - "TanStack Query hooks for recruit visits CRUD operations"
  - "RecruitVisitCard component for calendar display"
  - "CalendarEvent type extensions for recruit visit integration"
  - "recruitVisitToCalendarEvent helper function"
affects: [15-06, calendar-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Query keys factory for recruit visits", "Violet/purple theme for recruiting features"]

key-files:
  created:
    - src/v2/hooks/useRecruitVisits.ts
    - src/v2/components/recruiting/RecruitVisitCard.tsx
    - src/v2/components/recruiting/index.ts
  modified:
    - src/v2/types/training.ts

key-decisions:
  - "Violet/purple theme (bg-violet-500/10, border-violet-500) distinguishes recruit visits from workouts on calendar"
  - "Compact/full display modes for RecruitVisitCard support calendar cell and expanded views"
  - "recruitVisitToCalendarEvent helper converts time strings to Date objects for calendar integration"
  - "5-minute stale time matches existing training query patterns"

patterns-established:
  - "Recruit visit query keys: all, lists, list(filters), details, detail(id), upcoming, byHost(athleteId)"
  - "Status indicator dots: blue=scheduled, green=completed, red=cancelled"

# Metrics
duration: 2min
completed: 2026-01-26
---

# Phase 15 Plan 05: TanStack Query Hooks for Recruit Visits

**TanStack Query hooks with violet-themed calendar card for recruit visit display and CRUD operations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-26T20:24:50Z
- **Completed:** 2026-01-26T20:26:58Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- TanStack Query hooks for recruit visits following useSessions.ts patterns
- RecruitVisitCard component with distinct violet/purple styling
- CalendarEvent type extended to support recruit visit events
- Helper function for converting recruit visits to calendar events

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TanStack Query hooks for recruit visits** - `bc62ba3` (feat)
2. **Task 2: Create RecruitVisitCard calendar component** - `0b55a88` (feat)
3. **Task 3: Extend CalendarEvent type for recruit visits** - `229c539` (feat)

## Files Created/Modified

### Created
- `src/v2/hooks/useRecruitVisits.ts` - TanStack Query hooks for recruit visits CRUD operations, 321 lines
  - Query keys factory: all, lists, list(filters), details, detail(id), upcoming, byHost(athleteId)
  - Query hooks: useRecruitVisits, useRecruitVisit, useUpcomingRecruitVisits, useHostAthleteVisits
  - Mutation hooks: useCreateRecruitVisit, useUpdateRecruitVisit, useDeleteRecruitVisit
  - useGenerateShareToken for public visit sharing
  - 5-minute stale time, auth-aware query enabling

- `src/v2/components/recruiting/RecruitVisitCard.tsx` - Calendar event card component, 95 lines
  - Compact mode: icon + recruit name for calendar cells
  - Full mode: all details including time, host badge, school, grad year
  - Violet/purple theme: bg-violet-500/10, border-l-4 border-violet-500
  - Status indicator dots: blue=scheduled, green=completed, red=cancelled
  - Framer Motion hover animations with spring physics (stiffness: 300, damping: 28)
  - Users icon from lucide-react

- `src/v2/components/recruiting/index.ts` - Barrel export for recruiting components

### Modified
- `src/v2/types/training.ts` - Extended CalendarEvent for recruit visits
  - Added CalendarEventType: 'workout' | 'recruit_visit' | 'session'
  - Extended CalendarEvent.resource with visitId, recruitName, hostAthleteId, hostAthleteName, visitStatus
  - Made resource.type optional (was required)
  - Added recruitVisitToCalendarEvent helper function to convert RecruitVisit to CalendarEvent format

## Decisions Made

**Violet/purple theme for recruiting**
- bg-violet-500/10 background, border-violet-500 accent provides clear visual distinction from workout events
- Consistent with calendar color-coding patterns (workouts use type-based colors, recruits use violet)

**Compact/full display modes**
- Compact mode shows icon + name for calendar cell display (space-constrained)
- Full mode shows all details for expanded view/detail panel
- Matches WorkoutEventCard pattern

**5-minute stale time**
- Consistent with existing training query patterns (useSessions, useWorkouts)
- Balances data freshness with API efficiency

**Query keys factory pattern**
- Hierarchical query keys enable efficient cache invalidation
- upcoming() and byHost(athleteId) support dashboard widgets

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - hooks, component, and type extensions implemented smoothly following existing patterns.

## Next Phase Readiness

- Recruit visit hooks ready for calendar integration
- RecruitVisitCard ready for use in calendar view
- CalendarEvent type extended to support recruit_visit events
- recruitVisitToCalendarEvent helper available for data transformation

No blockers. Ready for Phase 15-06 (Rich Text Editor with Lexical) or calendar integration work.

---
*Phase: 15-feature-toggles-recruiting*
*Completed: 2026-01-26*
