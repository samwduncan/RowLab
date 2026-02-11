---
phase: 37-concept2-workout-sync
plan: 04
subsystem: frontend
tags: [concept2, ui, filters, badges, sync-button, user-sync, react, typescript]

# Dependency graph
requires:
  - phase: 37-concept2-workout-sync
    plan: 01
    provides: Backend schema with source, machineType, c2LogbookId fields
provides:
  - Source filtering (All/Manual/Concept2) in erg tests table
  - C2 badge visual indicator for synced workouts
  - Machine type badges (BikeErg/SkiErg) in erg table
  - User-level C2 sync button in erg page header
  - useMyC2Status and useMyC2Sync hooks for user-level sync
affects: [37-05-workout-detail, 38-share-cards, 39-strava-posting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mode-based component pattern (athlete vs user sync)"
    - "Conditional rendering based on connection status"
    - "Toast feedback on sync success/failure"
    - "Client-side filtering with updated filter state"

key-files:
  created: []
  modified:
    - src/v2/types/ergTests.ts
    - src/v2/components/erg/ErgTestsTable.tsx
    - src/v2/components/erg/ErgTestFilters.tsx
    - src/v2/hooks/useConcept2.ts
    - src/v2/components/erg/C2SyncButton.tsx
    - src/v2/pages/canvas/CanvasErgTestsPage.tsx

key-decisions:
  - "C2 badge uses brand blue (#00b4d8) as design system exception per DS-01"
  - "RowErg machine type not shown (default, showing would be noisy)"
  - "BikeErg uses data-warning color, SkiErg uses data-good color"
  - "Sync button only visible if user has C2 connected (useMyC2Status check)"
  - "Toast shows workout count on sync success per locked decision (37-CONTEXT.md)"

patterns-established:
  - "Pattern 1: Badge components - Small inline components for visual indicators (C2Badge, MachineTypeBadge)"
  - "Pattern 2: Mode prop pattern - Single component supports multiple modes (athlete vs user sync)"
  - "Pattern 3: Conditional header actions - Only show sync button when feature available (C2 connected)"

# Metrics
duration: 5min 45sec
completed: 2026-02-11
---

# Phase 37 Plan 04: Erg Table Enhancements for C2 Sync

**Enhanced erg tests table with source filtering, C2 badges, machine type indicators, and user-level sync button**

## Performance

- **Duration:** 5 min 45 sec
- **Started:** 2026-02-11T15:57:30Z
- **Completed:** 2026-02-11T16:03:12Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Erg table displays C2 badge on synced workouts (small blue badge next to test type)
- Machine type badges show for BikeErg and SkiErg workouts (color-coded)
- Source filter added (All Sources / Manual / Concept2) to filter controls
- Machine type filter added (All Ergs / RowErg / BikeErg / SkiErg)
- User-level sync button in erg page header (only shows if C2 connected)
- Sync triggers toast feedback with workout count
- Enhanced tooltips show username and last sync time in user mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Add source filter, C2 badge, and machine type badge to erg table** - `ae34097` (feat)
   - Added source, machineType, c2LogbookId fields to ErgTest type
   - Added source and machineType to ErgTestFilters type
   - Created C2Badge component (Concept2 logo badge)
   - Created MachineTypeBadge component (BikeErg/SkiErg color-coded badges)
   - Added MACHINE_TYPE_LABELS constant
   - Updated ErgTestsTable columns to show badges
   - Updated mobile card view with badges
   - Added source and machine type filter dropdowns to ErgTestFilters

2. **Task 2: Enhance C2SyncButton for user-level sync and add to erg page header** - `b8ad199` (feat)
   - Added useMyC2Status hook (user-level C2 connection status)
   - Added useMyC2Sync hook with toast feedback
   - Updated C2SyncButton with mode prop (athlete | user)
   - Enhanced tooltip to show username and last sync time
   - Added C2SyncButton to CanvasErgTestsPage header
   - Button conditionally rendered based on isC2Connected

## Files Created/Modified

- **src/v2/types/ergTests.ts** - Added source, machineType, c2LogbookId to ErgTest; added filters; MACHINE_TYPE_LABELS
- **src/v2/components/erg/ErgTestsTable.tsx** - Added C2Badge, MachineTypeBadge components; updated columns and mobile card view
- **src/v2/components/erg/ErgTestFilters.tsx** - Added source and machine type filter controls
- **src/v2/hooks/useConcept2.ts** - Added useMyC2Status and useMyC2Sync hooks with toast feedback
- **src/v2/components/erg/C2SyncButton.tsx** - Added mode prop support (athlete vs user); enhanced tooltips
- **src/v2/pages/canvas/CanvasErgTestsPage.tsx** - Added C2SyncButton to header with conditional rendering

## Decisions Made

**1. Visual design:**
- C2 badge uses Concept2 brand blue (#00b4d8) as design system exception per DS-01
- Glass card aesthetic for badges (semi-transparent bg with border)
- RowErg not shown as badge (it's the default, showing would be noisy)
- BikeErg uses data-warning color, SkiErg uses data-good color

**2. Filter placement:**
- Source filter added as third dropdown in filter row
- Machine type filter added as fourth dropdown
- All filters use same styling pattern for consistency

**3. Sync button behavior:**
- Only renders if user has C2 connected (useMyC2Status check)
- Shows toast on success: "Synced N workout(s)" per locked decision
- Toast on error: "Sync failed: [error message]"
- Tooltip shows username and last sync time in user mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation was straightforward.

## User Setup Required

None - features work automatically when C2 is connected (Phase 12 infrastructure).

## Next Phase Readiness

**Ready for Phase 37-05 (Workout Detail View):**
- WorkoutSplit model exists from 37-01
- machineType field available for display
- source field can show "Synced from Concept2" badge in detail view

**Ready for Phase 38 (Share Cards):**
- Machine type field available for workout share cards
- C2 badge can be shown on shared workout images

**Ready for Phase 39 (Strava Posting):**
- source field tracks workout origin for duplicate prevention
- Machine type available for Strava activity type mapping

**No blockers or concerns.**

---

## Self-Check: PASSED

All modified files exist:
- ✓ src/v2/types/ergTests.ts
- ✓ src/v2/components/erg/ErgTestsTable.tsx
- ✓ src/v2/components/erg/ErgTestFilters.tsx
- ✓ src/v2/hooks/useConcept2.ts
- ✓ src/v2/components/erg/C2SyncButton.tsx
- ✓ src/v2/pages/canvas/CanvasErgTestsPage.tsx

All commits exist:
- ✓ ae34097 (Task 1)
- ✓ b8ad199 (Task 2)

---
*Phase: 37-concept2-workout-sync*
*Completed: 2026-02-11*
