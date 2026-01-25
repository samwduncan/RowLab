---
phase: 10-training-plans-ncaa-compliance
plan: 05
subsystem: ui
tags: [react-big-calendar, drag-drop, training, calendar, optimistic-updates]

# Dependency graph
requires:
  - phase: 10-03
    provides: TrainingCalendar with month/week views, CalendarToolbar, WorkoutEventCard
provides:
  - DragDropCalendar component with drag-to-reschedule functionality
  - Optimistic updates for calendar event repositioning
  - Visual feedback for drag operations (preview, drop zones, loading states)
affects: [10-06, training-calendar-integration]

# Tech tracking
tech-stack:
  added: [react-big-calendar/lib/addons/dragAndDrop]
  patterns: [drag-drop HOC pattern, optimistic mutation with rollback]

key-files:
  created: [src/v2/components/training/calendar/DragDropCalendar.tsx]
  modified: [src/v2/components/training/calendar/index.ts]

key-decisions:
  - "Applied withDragAndDrop HOC to extend Calendar with drag-drop functionality"
  - "Extract planId from event.resource to pass to rescheduleWorkout mutation"
  - "Prevent dragging of recurring event instances (must edit parent workout)"
  - "Use optimistic updates from useRescheduleWorkout hook for immediate feedback"

patterns-established:
  - "Drag-drop calendar events pattern: HOC wraps Calendar, event.resource carries planId/workoutId"
  - "Dragging indicator pattern: fixed bottom toast shows current operation"
  - "Loading overlay pattern: absolute overlay with spinner during async operations"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 10 Plan 05: Drag-Drop Calendar Summary

**Calendar with drag-to-reschedule using react-big-calendar withDragAndDrop HOC, extracting planId from event.resource for optimistic updates**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T03:14:12Z
- **Completed:** 2026-01-25T03:17:15Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- DragDropCalendar component supports drag-to-reschedule for non-recurring workouts
- Optimistic updates provide immediate visual feedback before API confirmation
- Error handling rolls back event position if reschedule fails
- Custom styling for drag preview (semi-transparent), drop zones (highlighted), and dragging indicator

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DragDropCalendar component** - `742bd3f` (feat)
2. **Task 2: Update calendar index exports** - `ae00e8f` (feat)

## Files Created/Modified
- `src/v2/components/training/calendar/DragDropCalendar.tsx` - Calendar with drag-drop rescheduling via withDragAndDrop HOC
- `src/v2/components/training/calendar/index.ts` - Export DragDropCalendar alongside TrainingCalendar

## Decisions Made

**1. Apply withDragAndDrop HOC to Calendar component**
- **Rationale:** react-big-calendar provides official drag-drop addon, no need for custom drag implementation

**2. Extract planId from event.resource.planId**
- **Rationale:** rescheduleWorkout API requires planId parameter, event.resource already carries workout metadata

**3. Prevent dragging of recurring event instances**
- **Rationale:** Dragging an instance of a recurring workout would create ambiguity - should it edit the series or create an exception? For MVP, require editing the parent workout

**4. Use optimistic updates from useRescheduleWorkout hook**
- **Rationale:** Hook already implements optimistic update pattern with rollback, DragDropCalendar just needs to call mutation

**5. Show dragging indicator as fixed bottom toast**
- **Rationale:** Provides awareness of current operation without obstructing calendar view

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - react-big-calendar drag-drop addon worked as documented.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DragDropCalendar ready for integration into training calendar views
- Event rescheduling works for single workouts
- Future enhancement needed for recurring workouts (edit series vs. create exception)
- Ready for Plan 10-06 (Workout creation modal with recurring patterns)

---
*Phase: 10-training-plans-ncaa-compliance*
*Completed: 2026-01-25*
