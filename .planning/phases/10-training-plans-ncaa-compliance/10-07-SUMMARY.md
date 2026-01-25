---
phase: 10-training-plans-ncaa-compliance
plan: 07
subsystem: training
tags: [assignments, training-plans, athlete-view, react, typescript, tanstack-query]

requires:
  - 10-00-foundation-types
  - 10-02-tanstack-query-hooks
  - 10-04-workout-form-components

provides:
  - AssignmentManager (coach assigns plans to athletes)
  - AthleteWorkoutView (athlete views weekly workouts)
  - useAssignments (TanStack Query hooks for assignments)

affects:
  - Training plan pages (will use AssignmentManager)
  - Athlete dashboard (will use AthleteWorkoutView)

tech-stack:
  added: []
  patterns:
    - Multi-select with "Select All" toggle
    - Week navigation with offset state
    - Workout grouping by day
    - Status-based styling (completed/past-due/upcoming)

key-files:
  created:
    - src/v2/hooks/useAssignments.ts
    - src/v2/components/training/assignments/AssignmentManager.tsx
    - src/v2/components/training/assignments/AthleteWorkoutView.tsx
    - src/v2/components/training/assignments/index.ts
  modified: []

decisions:
  - id: aggregated-assignments-fetch
    choice: Fetch all plans and aggregate assignments when no planId specified
    rationale: Backend doesn't have dedicated assignments list endpoint, aggregation enables cross-plan queries for coaches
    alternatives: ["Add dedicated /api/v1/assignments endpoint"]

  - id: athlete-load-endpoint
    choice: Use /api/v1/training-plans/athlete/:athleteId/load for athlete workouts
    rationale: Backend endpoint returns assignments, workouts, and completions in single response, reduces network calls
    alternatives: ["Separate calls for assignments and workouts"]

  - id: select-all-with-disabled-filter
    choice: Select All only selects available (non-assigned) athletes
    rationale: Prevents confusion - already-assigned athletes can't be re-assigned, so selecting them would fail
    alternatives: ["Select All selects all and shows error on submit"]

  - id: week-navigation-with-offset
    choice: Week navigation uses offset state (0 = current week)
    rationale: Simple state management, easy to reset to current week, aligns with calendar patterns
    alternatives: ["Track absolute week start date"]

  - id: workout-status-calculation
    choice: Calculate isPastDue, isCompleted, isUpcoming in useMemo
    rationale: Prevents recalculation on every render, date comparisons are expensive
    alternatives: ["Calculate inline in render"]

  - id: default-compliance-score
    choice: Mark complete with compliance=1.0 (100%)
    rationale: Athlete self-reporting assumes full compliance, coaches can adjust later if needed
    alternatives: ["Require athlete to rate compliance", "Default to 0.8"]

metrics:
  duration: 8 minutes
  tasks: 3
  commits: 3
  files-created: 4
  lines-added: 837

completed: 2026-01-25
---

# Phase 10 Plan 07: Assignment Management Summary

**One-liner:** Coach assigns plans to athletes with multi-select, athletes view weekly workouts with completion tracking

## What Was Built

Created assignment management system enabling coaches to assign training plans to multiple athletes and athletes to view/complete their assigned workouts.

### Components Created

**1. useAssignments Hook (272 lines)**
- `useAssignments`: Fetch assignments for coaches (supports planId/athleteId filtering)
- `useAthleteAssignments`: Fetch athlete's workouts with completions
- `useCreateAssignment`: Create assignments via POST /api/v1/training-plans/:id/assign
- `useDeleteAssignment`: Remove assignments
- `useMarkWorkoutComplete`: Mark workouts complete

**2. AssignmentManager Component (287 lines)**
- Plan selection dropdown (or pre-selected plan prop)
- Multi-athlete checkbox list with Select All toggle
- Date range inputs (start required, end optional)
- Disabled state for already-assigned athletes
- Side badges (Port/Starboard) with color coding
- Form validation using Zod schema

**3. AthleteWorkoutView Component (274 lines)**
- Week navigation (prev/next/this week buttons)
- Workouts grouped by day with relative dates
- Status-based styling (green=completed, red=past-due, default=upcoming)
- Workout type color dots (erg=red, row=blue, etc.)
- Mark complete button with optimistic updates
- Week summary progress bar

## Technical Decisions

### Assignment Fetching Strategy
When no planId specified, hook fetches all plans and aggregates assignments. This enables coaches to view all assignments across plans without backend changes.

### Athlete Load Endpoint
Used `/api/v1/training-plans/athlete/:athleteId/load` which returns assignments, workouts, and completions in single response. Reduces network calls for athlete view.

### Select All Behavior
Select All only selects available (non-assigned) athletes. Already-assigned athletes are disabled to prevent confusion and validation errors.

### Week Navigation Pattern
Uses offset state (0 = current week, -1 = last week, +1 = next week). Simple to reset to current week, consistent with calendar patterns.

### Workout Status Calculation
Calculated in useMemo to prevent recalculation on every render:
- `isCompleted`: Has completion record
- `isPastDue`: Past date without completion (excludes today)
- `isUpcoming`: Today or future date

### Default Compliance Score
Mark complete defaults to compliance=1.0 (100%). Athlete self-reporting assumes full compliance, coaches can adjust in future enhancement if needed.

## Integration Points

### Backend Routes Used
- `POST /api/v1/training-plans/:id/assign` - Create assignments
- `DELETE /api/v1/training-plans/:id/assignments/:assignmentId` - Remove assignments
- `POST /api/v1/training-plans/:id/workouts/:workoutId/complete` - Mark complete
- `GET /api/v1/training-plans/athlete/:athleteId/load` - Fetch athlete workouts

### Dependencies
- `useAthletes` - Fetch athletes for assignment selection
- `useTrainingPlans` - Fetch plans for plan selection dropdown
- `getWorkoutTypeColor` from calendarHelpers - Consistent workout type colors
- date-fns - Date manipulation for week navigation

## Usage Examples

### Coach Assigns Plan to Athletes
```tsx
import { AssignmentManager } from '@/v2/components/training/assignments';

<AssignmentManager
  plan={selectedPlan} // Optional: pre-select plan
  onSuccess={() => {
    toast.success('Athletes assigned');
    closeModal();
  }}
  onCancel={closeModal}
/>
```

### Athlete Views Weekly Workouts
```tsx
import { AthleteWorkoutView } from '@/v2/components/training/assignments';

<AthleteWorkoutView
  athleteId={currentUser.athleteId}
  athleteName={currentUser.name}
/>
```

### Coach Views All Assignments
```tsx
import { useAssignments } from '@/v2/hooks/useAssignments';

const { assignments, isLoading } = useAssignments();
// Returns all assignments across all plans

const { assignments: planAssignments } = useAssignments({ planId: '123' });
// Returns assignments for specific plan
```

## Verification

### Must-Haves Met
- ✓ Coach can assign training plan to athletes (AssignmentManager)
- ✓ Coach can assign training plan to groups (multi-select with Select All)
- ✓ Athlete can view their assigned training plan (AthleteWorkoutView)
- ✓ Assignment shows plan details and date range (plan info card + date inputs)

### Artifacts Verified
- ✓ AssignmentManager.tsx: 287 lines (min 100) - Plan assignment interface
- ✓ AthleteWorkoutView.tsx: 274 lines (min 80) - Athlete workout view
- ✓ useAssignments.ts: 272 lines - Exports useAssignments, useAthleteAssignments, useCreateAssignment

### Key Links Verified
- ✓ AssignmentManager → useAssignments.ts via useCreateAssignment hook
- ✓ AthleteWorkoutView → useAssignments.ts via useAthleteAssignments hook
- ✓ useAssignments.ts → /api/v1/training-plans/:id/assign via API fetch

## Next Steps

### Immediate (Phase 10 Continuation)
- Plan 08: NCAA Compliance Dashboard (weekly reports, CARA hour tracking)
- Plan 09: Training Calendar with drag-drop (TrainingCalendar component)

### Future Enhancements
- Assignment notifications (email/push when plan assigned)
- Bulk assignment operations (assign to group/roster)
- Compliance score editing for coaches
- Workout notes/feedback from athletes
- Assignment history and audit log

## Deviations from Plan

None - plan executed exactly as written.

---

**Execution time:** 8 minutes
**Commits:** 3 (49f5ae1, 9f9cbec, d929aae)
**Files created:** 4
**Lines added:** 837
