---
phase: 06-athletes-roster
plan: 04
subsystem: ui
tags: [react, tanstack-table, tanstack-virtual, react-hook-form, zod, typescript]

# Dependency graph
requires:
  - phase: 06-02
    provides: VirtualTable component with TanStack Virtual
  - phase: 06-03
    provides: useAthletes hook with filtering
provides:
  - Athletes page with grid/list views
  - Search and filtering UI components
  - Slide-out athlete editing panel
  - AthleteAvatar with deterministic colors
  - View preference persistence
affects: [06-05-bulk-import, roster-display, athlete-profiles]

# Tech tracking
tech-stack:
  added: [react-hook-form, @hookform/resolvers/zod]
  patterns:
    - "Deterministic HSL color generation from strings for avatars"
    - "LocalStorage view preference persistence"
    - "Slide-out panel pattern for editing"
    - "Grid/list view toggle pattern"

key-files:
  created:
    - src/v2/components/athletes/AthleteAvatar.tsx
    - src/v2/components/athletes/ViewToggle.tsx
    - src/v2/components/athletes/AthleteFilters.tsx
    - src/v2/components/athletes/AthletesTable.tsx
    - src/v2/components/athletes/AthleteCard.tsx
    - src/v2/components/athletes/AthleteEditPanel.tsx
    - src/v2/components/athletes/index.ts
    - src/v2/pages/AthletesPage.tsx
  modified: []

key-decisions:
  - "Deterministic avatar colors via HSL hash function for consistent visual identity"
  - "LocalStorage for view preference persistence between sessions"
  - "Slide-out panel pattern instead of modal for editing (better spatial context)"
  - "Grid responsive layout (1-4 columns) based on screen size"

patterns-established:
  - "Avatar pattern: deterministic color generation from name for visual consistency"
  - "View toggle pattern: grid/list with localStorage persistence"
  - "Filter pattern: client-side filtering with clear filters button"
  - "Edit panel pattern: slide-out from right with unsaved changes confirmation"

# Metrics
duration: 16min
completed: 2026-01-24
---

# Phase 06 Plan 04: Athletes Page UI Summary

**Athletes roster page with grid/list views, search/filter capabilities, deterministic avatar colors, and slide-out editing panel with react-hook-form + Zod validation**

## Performance

- **Duration:** 16 min
- **Started:** 2026-01-24T15:53:47Z
- **Completed:** 2026-01-24T16:09:52Z
- **Tasks:** 5
- **Files modified:** 8

## Accomplishments
- Complete Athletes page with grid and list views
- Client-side search and filtering by side/scull/cox capabilities
- Virtualized table for 60 FPS performance with 100+ athletes
- Deterministic avatar colors (HSL hash) for consistent visual identity
- Slide-out editing panel with full form validation
- View preference persisted to localStorage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AthleteAvatar** - `cd51da5` (feat)
   - Avatar with photo support and initials fallback
   - Deterministic HSL color generation from athlete name
   - Multiple size options

2. **Task 2: Create ViewToggle and AthleteFilters** - `ae0470b` (feat)
   - ViewToggle for grid/list switching with ARIA labels
   - AthleteFilters with search, side, scull, and cox filtering
   - Clear filters button when active

3. **Task 3: Create AthletesTable and AthleteCard** - `fe6daff` (feat)
   - AthletesTable using VirtualTable from 06-02
   - Sortable columns for name, side, weight, height
   - AthleteCard for grid view with color-coded side badges

4. **Task 4: Create AthleteEditPanel** - `ecf584c` (feat)
   - Slide-out panel with react-hook-form + Zod validation
   - Edit biometrics, side preference, and capabilities
   - Unsaved changes confirmation

5. **Task 5: Create barrel exports and AthletesPage** - `7016624` (feat)
   - Component barrel exports with TypeScript types
   - Main AthletesPage combining all components
   - View preference persisted to localStorage
   - Click-to-edit functionality

## Files Created/Modified

- `src/v2/components/athletes/AthleteAvatar.tsx` - Avatar with deterministic HSL colors
- `src/v2/components/athletes/ViewToggle.tsx` - Grid/list view toggle
- `src/v2/components/athletes/AthleteFilters.tsx` - Search and filter controls
- `src/v2/components/athletes/AthletesTable.tsx` - Virtualized table view with VirtualTable
- `src/v2/components/athletes/AthleteCard.tsx` - Grid view card layout
- `src/v2/components/athletes/AthleteEditPanel.tsx` - Slide-out editing panel with validation
- `src/v2/components/athletes/index.ts` - Barrel exports
- `src/v2/pages/AthletesPage.tsx` - Main Athletes page with state management

## Decisions Made

**1. Deterministic HSL color generation for avatars**
- Rationale: Provides consistent visual identity for athletes without requiring photo uploads. HSL provides better color distribution than RGB hash.

**2. LocalStorage for view preference persistence**
- Rationale: Maintains user preference between sessions without requiring server state.

**3. Slide-out panel instead of modal for editing**
- Rationale: Better spatial context - user can still see the roster while editing. Follows Linear/Vercel patterns.

**4. Responsive grid layout (1-4 columns)**
- Rationale: Optimizes space usage across all screen sizes while maintaining readability.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Plan 06-05 (CSV bulk import) - can integrate with AthletesPage
- Athlete attendance tracking - can add to AthleteCard and AthletesTable
- Erg data integration - components designed for extensibility

**Completed features:**
- ATH-01: Coach can view roster in grid or list view ✓
- ATH-02: Coach can search athletes by name ✓
- ATH-03: Coach can filter by side preference and capabilities ✓
- ATH-04: Coach can edit athlete biometrics in slide-out panel ✓
- ATH-05: View preference persists between sessions ✓

**Blockers:** None

**Notes:**
- VirtualTable performs smoothly with test data (verified in 06-02)
- All filtering is client-side (acceptable for <200 athletes, per 06-03 decision)
- Form validation ready for extended biometrics (e.g., wingspan, 2k PR)

---
*Phase: 06-athletes-roster*
*Completed: 2026-01-24*
