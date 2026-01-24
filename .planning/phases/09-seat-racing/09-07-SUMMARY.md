---
phase: 09-seat-racing
plan: 07
subsystem: ui
tags: [react, typescript, headless-ui, seat-racing, elo, rankings, sessions]

# Dependency graph
requires:
  - phase: 09-01
    provides: RankingsTable, RankingsChart components
  - phase: 09-02
    provides: SessionList, ConfidenceBadge components
  - phase: 09-03
    provides: SessionWizard and step components
  - phase: 09-04
    provides: PieceManagerStep, BoatTimeEntry
  - phase: 09-05
    provides: AthleteAssignmentStep
provides:
  - SeatRacingPage with Rankings and Sessions tabs
  - SessionDetail component for full session view
  - Route at /app/coach/seat-racing
  - Sidebar navigation link with Trophy icon
affects: [09-08, Phase-10-training-plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Headless UI Tab.Group for tabbed navigation
    - Dialog with slide-out transition for session detail panel
    - Modal pattern for wizard with backdrop blur

key-files:
  created:
    - src/v2/pages/SeatRacingPage.tsx
    - src/v2/components/seat-racing/SessionDetail.tsx
  modified:
    - src/v2/components/seat-racing/index.ts
    - src/App.jsx (route already added in 09-06)
    - src/v2/stores/contextStore.ts (nav already added in 09-06)
    - src/v2/components/shell/WorkspaceSidebar.tsx (icon already added in 09-06)

key-decisions:
  - "Headless UI Tab.Group for Rankings/Sessions tabs"
  - "Side filter buttons (All/Port/Starboard) inline in Rankings tab"
  - "SessionWizard opens in modal, SessionDetail in slide-out panel"
  - "Rankings tab combines chart and table in vertical layout"

patterns-established:
  - "Tab navigation using Headless UI Tab.Group with bottom border indicator"
  - "Slide-out panel using Dialog with translate-x transition from right"
  - "Side filter buttons use Port=red, Starboard=green color coding"

# Metrics
duration: 12min
completed: 2026-01-24
---

# Phase 09 Plan 07: Seat Racing Page & Navigation Summary

**Main Seat Racing page with Rankings (ELO chart + table) and Sessions (list + detail panel) tabs, integrated into V2 routing with sidebar navigation**

## Performance

- **Duration:** 12 minutes
- **Started:** 2026-01-24T22:41:02Z
- **Completed:** 2026-01-24T22:53:26Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- SessionDetail component shows full session with pieces, boats, times, and athlete assignments
- SeatRacingPage with Rankings tab (chart, table, side filter) and Sessions tab (list)
- Integrated into V2 routing at /app/coach/seat-racing with sidebar navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SessionDetail component** - `44ea386` (feat)
2. **Task 2: Create SeatRacingPage** - `a2d7f30` (feat)
3. **Task 3: Add route to V2 routing** - _Already committed in 09-06_ (`f22eaf0`)

**Note:** Route and navigation setup was completed in Plan 09-06 when the ReviewStep component was creating the full integration. The routing, sidebar link, and icon were already in place.

## Files Created/Modified
- `src/v2/components/seat-racing/SessionDetail.tsx` - Full session detail view with pieces, boats sorted by finish time, rank highlighting, athlete assignments with seat/side indicators, and action buttons (Recalculate Ratings, Delete Session)
- `src/v2/pages/SeatRacingPage.tsx` - Main page with Headless UI tabs (Rankings with side filter and Sessions), wizard modal, and detail slide-out panel
- `src/v2/components/seat-racing/index.ts` - Added SessionDetail export
- `src/App.jsx` - V2 route at /app/coach/seat-racing (added in 09-06)
- `src/v2/stores/contextStore.ts` - Sidebar nav link with trophy icon (added in 09-06)
- `src/v2/components/shell/WorkspaceSidebar.tsx` - Trophy icon mapping (added in 09-06)

## Decisions Made

**1. Headless UI Tab.Group for Rankings/Sessions navigation**
- Rationale: Consistent with V2 patterns, accessible, keyboard navigable

**2. Side filter buttons inline in Rankings tab header**
- Rationale: Keeps filters visible and accessible, All/Port/Starboard with Port=red and Starboard=green color coding for visual consistency with AthletesTable

**3. SessionWizard in modal, SessionDetail in slide-out panel**
- Rationale: Wizard requires focus (modal appropriate), detail allows viewing while browsing (panel appropriate), matches Linear/GitHub patterns

**4. Rankings tab combines chart and table vertically**
- Rationale: Chart provides visual distribution context, table provides sortable detailed view, vertical stacking works better on mobile than side-by-side

**5. SessionDetail shows rank highlighting with 1st place in amber**
- Rationale: Visual emphasis on winning boat, amber/gold color communicates achievement

## Deviations from Plan

None - plan executed exactly as written.

**Note:** Plan expected to add route and navigation in Task 3, but these were already completed in Plan 09-06 when the full wizard integration was done. This is not a deviation, just a recognition that earlier work covered these requirements.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

✅ **Ready for Phase 09 completion:**
- Main Seat Racing page functional with all tabs
- Rankings display ELO ratings with chart and table
- Sessions list and detail views complete
- Navigation integrated into V2 sidebar
- Wizard flow functional (metadata → pieces → boats → assignments → review → submit)

🔜 **Plan 09-08 can proceed:**
- Ratings API endpoints needed for actual data fetching
- Parameters panel for ELO K-factor configuration
- useAthleteRatings hook will work once /api/v1/ratings endpoint exists

⚠️ **Known limitation:**
- Rankings tab will show "No data" until Plan 09-08 creates /api/v1/ratings endpoint
- This is expected behavior - frontend is ready, backend API pending

---
*Phase: 09-seat-racing*
*Completed: 2026-01-24*
