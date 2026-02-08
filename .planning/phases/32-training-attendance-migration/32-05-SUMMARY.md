---
phase: 32-training-attendance-migration
plan: 05
subsystem: ui
tags: [keyboard-shortcuts, optimistic-ui, skeleton-loaders, react-loading-skeleton, tanstack-query, framer-motion]

# Dependency graph
requires:
  - phase: 32-03
    provides: "Calendar UX improvements, session wizard, ComplianceBadge"
  - phase: 32-04
    provides: "Attendance improvements, one-tap P/L/E/U, streak badges"
  - phase: 28-03
    provides: "shouldIgnoreEvent guard pattern for keyboard shortcuts"
  - phase: 30-02
    provides: "useErgKeyboard hook pattern"
provides:
  - "useTrainingKeyboard hook with N/R/?/Escape/T shortcuts"
  - "TrainingShortcutsHelp glass-card overlay component"
  - "Optimistic UI on all workout and training plan mutations"
  - "AttendanceSkeleton, SessionsListSkeleton, SessionDetailSkeleton, ComplianceSkeleton loaders"
  - "Zero spinners or Loading text on any training/attendance page"
affects: [32-06, phase-33]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useTrainingKeyboard hook pattern for page-level keyboard shortcuts"
    - "Skeleton loader per-feature component with react-loading-skeleton + CSS variable theming"
    - "TanStack Query optimistic UI with cancel/snapshot/update/rollback/invalidate pattern"

key-files:
  created:
    - src/v2/hooks/useTrainingKeyboard.ts
    - src/v2/features/training/components/TrainingShortcutsHelp.tsx
    - src/v2/features/attendance/components/AttendanceSkeleton.tsx
    - src/v2/features/sessions/components/SessionSkeleton.tsx
    - src/v2/features/training/components/ComplianceSkeleton.tsx
  modified:
    - src/v2/hooks/useWorkouts.ts
    - src/v2/hooks/useTrainingPlans.ts
    - src/v2/pages/CoachTrainingPage.tsx
    - src/v2/pages/AttendancePage.tsx
    - src/v2/pages/training/SessionsPage.tsx
    - src/v2/pages/training/SessionDetailPage.tsx
    - src/v2/pages/training/LiveSessionPage.tsx
    - src/v2/features/training/components/index.ts
    - src/v2/features/attendance/components/index.ts

key-decisions:
  - "Separate TrainingShortcutsHelp component (not inline in hook) for reuse across pages"
  - "ComplianceSkeleton as standalone file despite ComplianceDashboardSkeleton existing in CalendarSkeleton.tsx - more refined layout"
  - "AttendancePage uses R/Escape/? but not N shortcut (no create action on attendance page)"
  - "SessionsPage includes T shortcut for list/calendar view toggle"

patterns-established:
  - "useTrainingKeyboard: page-level keyboard shortcut hook following useErgKeyboard pattern"
  - "Feature-specific skeleton components exported from feature index.ts"
  - "Optimistic UI pattern: onMutate(cancel->snapshot->update) -> onError(rollback+toast) -> onSettled(invalidate)"

# Metrics
duration: ~25min
completed: 2026-02-08
---

# Phase 32 Plan 05: Keyboard Shortcuts, Optimistic UI, Skeleton Loaders Summary

**useTrainingKeyboard hook with N/R/?/Escape/T shortcuts, optimistic UI on all workout/plan mutations, and 4 skeleton loaders replacing all spinners across training/attendance pages**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-02-08T15:05:00Z
- **Completed:** 2026-02-08T15:30:22Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Created useTrainingKeyboard hook with shouldIgnoreEvent guard, integrated into all 5 training/attendance pages
- Added full optimistic UI with rollback and toast notifications to 7 mutation hooks (3 workout + 3 plan + 1 reschedule error toast)
- Created 4 skeleton loaders (AttendanceSkeleton, SessionsListSkeleton, SessionDetailSkeleton, ComplianceSkeleton) matching final data layouts
- Eliminated all spinners and "Loading..." text from training/attendance pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Keyboard shortcuts + optimistic UI audit** - `2811275` (feat)
2. **Task 2: Skeleton loaders for all training/attendance data views** - `b276124` (feat)

## Files Created/Modified
- `src/v2/hooks/useTrainingKeyboard.ts` - Keyboard shortcut handler with N/R/?/Escape/T and getTrainingShortcuts helper
- `src/v2/features/training/components/TrainingShortcutsHelp.tsx` - Glass-card help overlay with KeyBadge elements and click-outside dismiss
- `src/v2/features/attendance/components/AttendanceSkeleton.tsx` - Skeleton matching attendance roster (avatar, name, streak, P/L/E/U buttons)
- `src/v2/features/sessions/components/SessionSkeleton.tsx` - SessionsListSkeleton and SessionDetailSkeleton matching session layouts
- `src/v2/features/training/components/ComplianceSkeleton.tsx` - Skeleton with NCAA alert, stat cards, weekly hours table
- `src/v2/hooks/useWorkouts.ts` - Added optimistic UI to useCreateWorkout, useUpdateWorkout, useDeleteWorkout; toast error on useRescheduleWorkout
- `src/v2/hooks/useTrainingPlans.ts` - Added optimistic UI to useCreatePlan, useUpdatePlan, useDeletePlan
- `src/v2/pages/CoachTrainingPage.tsx` - Keyboard shortcuts, help overlay, pulse skeleton for plans loading
- `src/v2/pages/AttendancePage.tsx` - Keyboard shortcuts, help overlay, AttendanceSkeleton for loading
- `src/v2/pages/training/SessionsPage.tsx` - Keyboard shortcuts (N/R/T/?/Escape), SessionsListSkeleton
- `src/v2/pages/training/SessionDetailPage.tsx` - Keyboard shortcuts (R/?/Escape), SessionDetailSkeleton
- `src/v2/pages/training/LiveSessionPage.tsx` - Keyboard shortcuts (R/?/Escape), SessionDetailSkeleton replacing spinner
- `src/v2/features/training/components/index.ts` - Added ComplianceSkeleton and TrainingShortcutsHelp exports
- `src/v2/features/attendance/components/index.ts` - Added AttendanceSkeleton export

## Decisions Made
- Separate TrainingShortcutsHelp component rather than inline JSX in hook - enables reuse across all 5 pages
- ComplianceSkeleton created as standalone file with more detailed layout (athlete avatars, 9-column grid) vs simpler ComplianceDashboardSkeleton in CalendarSkeleton.tsx
- AttendancePage excludes N shortcut since it has no "create" action - only R/Escape/?
- SessionsPage includes T shortcut for toggling between list and calendar view modes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused parameters in useRescheduleWorkout onError**
- **Found during:** Task 1 (optimistic UI audit)
- **Issue:** `err` and `variables` params in useRescheduleWorkout onError handler were not prefixed with underscore, causing TS6133 errors
- **Fix:** Renamed to `_err` and `_variables`
- **Files modified:** src/v2/hooks/useWorkouts.ts
- **Verification:** TypeScript check passes for this file
- **Committed in:** 2811275 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor cleanup, no scope creep.

## Issues Encountered
- CalendarSkeleton and ComplianceSkeleton imports were initially added to CoachTrainingPage but the page's calendar/compliance tabs handle their own loading states internally via child components. Removed unused imports to prevent TS6133 warnings.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All cross-cutting requirements (CW-01 optimistic UI, CW-02 keyboard shortcuts, CW-03 skeleton loaders) complete for training/attendance
- Plan 32-06 (final migration plan) can proceed - all prerequisites met
- Phase 33+ can follow same patterns for other feature modules

## Self-Check: PASSED

---
*Phase: 32-training-attendance-migration*
*Completed: 2026-02-08*
