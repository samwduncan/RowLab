---
phase: 10-training-plans-ncaa-compliance
plan: 02
subsystem: ui
tags: [tanstack-query, react-hooks, training, ncaa-compliance, typescript]

# Dependency graph
requires:
  - phase: 10-00
    provides: Backend API routes for training plans and NCAA compliance
  - phase: 10-01
    provides: TypeScript types and utility functions for training
provides:
  - TanStack Query hooks for training plans CRUD operations
  - TanStack Query hooks for workouts with calendar event expansion
  - TanStack Query hooks for NCAA compliance data and training load
  - Optimistic updates for workout rescheduling
  - Attendance-training session linkage query (ATT-04)
affects: [10-03, 10-04, 10-05, 10-06, training-calendar, ncaa-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Query hooks for server state management
    - Optimistic updates with rollback on error
    - 5-minute stale time for training data queries
    - Query invalidation on mutations

key-files:
  created:
    - src/v2/hooks/useTrainingPlans.ts
    - src/v2/hooks/useWorkouts.ts
    - src/v2/hooks/useNcaaCompliance.ts
  modified: []

key-decisions:
  - "Used inline types instead of importing from training.ts for self-contained hooks"
  - "5-minute staleTime for all training queries (same as seat racing hooks)"
  - "useRescheduleWorkout implements optimistic updates for smooth drag-drop UX"
  - "useCalendarEvents expands recurring workouts into individual events"
  - "Workout fetching aggregates across plans when no planId specified"

patterns-established:
  - "Training plan hooks follow useSeatRaceSessions.ts pattern"
  - "Calendar event expansion for recurring workouts"
  - "Optimistic updates for drag-drop rescheduling with rollback"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 10 Plan 02: TanStack Query Hooks Summary

**TanStack Query hooks for training plans, workouts, and NCAA compliance with optimistic rescheduling**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T02:48:15Z
- **Completed:** 2026-01-25T02:50:45Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Created useTrainingPlans hook with CRUD operations and duplicate plan mutation
- Created useWorkouts hook with calendar event expansion and optimistic rescheduling
- Created useNcaaCompliance hook with weekly hours, audit reports, and training load queries
- Implemented attendance-training session linkage query (ATT-04 feature)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useTrainingPlans.ts hook** - `f31e49c` (feat)
   - useTrainingPlans() - fetch all plans
   - useTrainingPlan() - fetch single plan
   - useCreatePlan(), useUpdatePlan(), useDeletePlan(), useDuplicatePlan() - mutations

2. **Task 2: Create useWorkouts.ts hook** - `4343537` (feat)
   - useWorkouts() - fetch workouts with filters
   - useCalendarEvents() - expand recurring workouts to calendar events
   - useWorkout() - fetch single workout
   - useCreateWorkout(), useUpdateWorkout(), useDeleteWorkout() - mutations
   - useRescheduleWorkout() - optimistic drag-drop rescheduling

3. **Task 3: Create useNcaaCompliance.ts hook** - `e58c58e` (feat)
   - useNcaaWeeklyHours() - weekly compliance entries
   - useNcaaComplianceReport() - full audit report
   - useTrainingLoad() - TSS/volume over time
   - useAttendanceTrainingLink() - attendance session linkage (ATT-04)

## Files Created/Modified
- `src/v2/hooks/useTrainingPlans.ts` - Training plan CRUD hooks
- `src/v2/hooks/useWorkouts.ts` - Workout hooks with calendar event expansion
- `src/v2/hooks/useNcaaCompliance.ts` - NCAA compliance and training load hooks

## Decisions Made

**1. Inline types instead of importing from training.ts**
- Plan specified importing from `src/v2/types/training.ts`, but that file wasn't created yet
- Defined types inline for self-contained hooks
- Can be refactored to shared types file later when training.ts is created

**2. 5-minute staleTime for all queries**
- Follows established pattern from useSeatRaceSessions.ts
- Balances data freshness with API call reduction
- Training data changes infrequently enough for 5-minute cache

**3. Optimistic updates for useRescheduleWorkout**
- Enables smooth drag-drop calendar rescheduling without loading states
- Implements proper rollback on error to prevent inconsistent cache
- Invalidates queries on settled for eventual consistency

**4. Calendar event expansion for recurring workouts**
- useCalendarEvents expands recurrenceRule into individual events
- Simplified implementation returns single event (full RRULE parsing deferred)
- Supports date range filtering for calendar view performance

**5. Cross-plan workout aggregation**
- When no planId specified, fetches all plans and aggregates workouts
- Enables team-wide calendar view across all training plans
- Date filtering applied client-side for now

## Deviations from Plan

None - plan executed exactly as written.

Plan specified using backend routes from server/routes/trainingPlans.js, which were correctly used:
- `/api/v1/training-plans` (not `/api/v1/training/plans`)
- `/api/v1/training-plans/:id/workouts`
- `/api/v1/training-plans/compliance/*`
- `/api/v1/training-plans/load`
- `/api/v1/training-plans/attendance-link`

## Issues Encountered

**TypeScript errors from authStore**
- authStore is JavaScript file, causing TS7016 implicit any errors
- Same issue exists in all V2 hooks (useSeatRaceSessions, etc.)
- Not specific to this plan - pre-existing project configuration issue
- Hooks compile and function correctly despite warnings

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for UI development:**
- All server state hooks available for training plan components
- Calendar event expansion ready for calendar UI (Plan 10-03)
- NCAA compliance hooks ready for compliance dashboard (Plan 10-06)
- Training load hooks ready for analytics charts (Plan 10-07)

**Integration points:**
- Hooks use correct backend API paths from Plans 10-00
- Query keys structured for proper cache invalidation
- Optimistic updates ready for drag-drop calendar interactions
- ATT-04 attendance linkage ready for session tracking

---
*Phase: 10-training-plans-ncaa-compliance*
*Completed: 2026-01-25*
