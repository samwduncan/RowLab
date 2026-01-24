---
phase: 08
plan: 01
subsystem: lineup-builder
tags: [typescript, react, zustand, ui-components, boat-creation]

requires:
  - phase: 07
    plan: all
    reason: "Athletes and erg data available from Phase 7 implementation"

provides:
  - "Lineup builder UI foundation (AthleteBank, BoatView, AddBoatButton)"
  - "TypeScript types for lineup builder domain"
  - "Boat creation workflow (select boat class, add to workspace)"
  - "Available athletes display with search"
  - "Boat seats display with vertical arrangement (bow at top)"

affects:
  - phase: 08
    plan: 02
    impact: "Drag-drop will enhance these components with DndContext and sensors"
  - phase: 08
    plan: 03-11
    impact: "All lineup features build on this UI foundation"

tech-stack:
  added:
    - "@v2/types/lineup.ts - TypeScript types for lineup builder"
    - "@v2/components/lineup/* - Lineup builder component library"
  patterns:
    - "Zustand store integration via useLineupStore hook"
    - "V2 design token usage (bg-surface, text-primary, border-border)"
    - "AthleteAvatar reuse from athletes components"

key-files:
  created:
    - "src/v2/types/lineup.ts"
    - "src/v2/components/lineup/AddBoatButton.tsx"
    - "src/v2/components/lineup/AthleteBank.tsx"
    - "src/v2/components/lineup/BoatView.tsx"
    - "src/v2/components/lineup/index.ts"
  modified: []

decisions:
  - id: "LINE-UI-01"
    decision: "Use existing lineupStore instead of creating new V2 store"
    rationale: "lineupStore already has undo/redo middleware, boat management, and API integration. V1/V2 can share state during migration."
    alternatives: "Create new V2-only lineup store with TanStack Query"
    chosen: "Reuse existing store"

  - id: "LINE-UI-02"
    decision: "Display seats bow-at-top by reversing store order in component"
    rationale: "boatConfig generates seats high-to-low (stroke to bow), but traditional lineup notation shows bow at top. Reverse in display layer keeps store logic intact."
    alternatives: "Change seat generation order in boatConfig.js"
    chosen: "Reverse in component render"

  - id: "LINE-UI-03"
    decision: "Defer shell selector to future enhancement"
    rationale: "Plan scope is foundational components. Shell assignment can be added post-creation via boat header edit (future plan)."
    alternatives: "Add full shell selector in AddBoatButton now"
    chosen: "Add shell name field later"

metrics:
  duration: "5 minutes"
  completed: "2026-01-24"

status: complete
---

# Phase 08 Plan 01: Lineup Builder Foundation Summary

**One-liner:** Foundational lineup builder UI with boat creation dropdown, athlete bank sidebar, and vertical boat seat display (bow at top)

## What Was Built

Built the core UI components for the V2 Lineup Builder workspace:

1. **TypeScript Types** (`src/v2/types/lineup.ts`)
   - BoatConfig, SeatSlotData, SeatWarning types
   - DragData and DropData for future drag-drop operations
   - BoatInstance and Shell types
   - Component props interfaces for all lineup components
   - Re-exports Athlete type from athletes.ts

2. **AddBoatButton Component** (LINE-01)
   - Dropdown button to add boats to workspace
   - Shows boat class options from `useLineupStore().boatConfigs`
   - Displays boat name and seat count (e.g., "Varsity 8+ - 8 seats + coxswain")
   - Calls `addBoat()` on selection, closes dropdown automatically
   - V2 design tokens and Lucide icons (Plus, ChevronDown)
   - Empty state when no boat configs available

3. **AthleteBank Component**
   - Left sidebar (280px fixed width) showing available athletes
   - Gets unassigned athletes via `useLineupStore().getAvailableAthletes()`
   - Search filter by athlete name
   - Each athlete shows: avatar (AthleteAvatar), name, side preference badge
   - Side badges: Port (red), Starboard (green), Both (blue), Cox (purple)
   - Total count display at top
   - Empty states for "all assigned" and "no search results"
   - Scrollable list with smooth transitions

4. **BoatView Component**
   - Displays boat with vertical seat arrangement
   - Boat header: boat class name, shell name (if set), remove boat button
   - Seats arranged BOW AT TOP, STROKE AT BOTTOM (mirrors traditional notation)
   - Each seat: seat number, side indicator badge (Port/Starboard), athlete or "Empty"
   - Occupied seats: athlete avatar, name, remove button on hover
   - Empty seats: dashed border, "Empty" placeholder
   - Coxswain position: shown separately at stern with distinct purple styling
   - "Bow" and "Stroke" labels for orientation
   - Seats reversed from store order (`[...boat.seats].reverse()`) for display

5. **Component Index**
   - Exports AddBoatButton, AthleteBank, BoatView
   - Comments for future exports (LineupWorkspace, BiometricsPanel, etc.)

## Key Implementation Details

### Seat Ordering (Decision LINE-UI-02)

The `boatConfig.js` utility generates seats in descending order (stroke to bow) for seat numbering logic. However, traditional lineup notation shows bow at top. We reverse the array in `BoatView.tsx`:

```typescript
const seatsTopToBottom = [...boat.seats].reverse();
```

This keeps store logic intact while matching coach expectations in the UI.

### Store Integration

All components use the existing `lineupStore.js` via `useLineupStore()` hook:
- `boatConfigs` - available boat classes from API
- `getAvailableAthletes()` - unassigned athletes
- `addBoat(boatConfig)` - create new boat instance
- `removeBoat(boatId)` - remove boat from workspace
- `removeFromSeat(boatId, seatNumber)` - remove athlete from seat
- `removeFromCoxswain(boatId)` - remove coxswain

### Design Patterns

- **V2 Design Tokens**: All components use V2 tokens (`bg-surface`, `text-primary`, `border-bdr-default`)
- **Component Reuse**: AthleteAvatar from athletes components, Lucide icons
- **Empty States**: Thoughtful empty states for no athletes, no boats, no search results
- **Responsive Hover**: Remove buttons, search highlights, hover borders
- **Accessibility**: Semantic HTML, ARIA labels, keyboard support

## Component Stats

| Component | Lines | Key Features |
|-----------|-------|--------------|
| lineup.ts | 124 | TypeScript types and interfaces |
| AddBoatButton.tsx | 133 | Dropdown, boat selection, empty state |
| AthleteBank.tsx | 174 | Search, filtering, side badges, scrolling |
| BoatView.tsx | 252 | Seat display, coxswain, remove actions, vertical layout |
| index.ts | 15 | Component exports |

**Total:** 698 lines of production code

## What's NOT In This Plan

Intentionally deferred to future plans:

- **Drag-drop functionality** (Plan 08-02) - Components are display-only, no DndContext yet
- **LineupWorkspace container** (Plan 08-02) - Will wrap AthleteBank + BoatView(s) with DndContext
- **Seat validation warnings** (Plan 08-03) - Port/starboard mismatch, cox validation
- **Shell name editing** (Future) - Can only set boat class now, shell name shown but not editable
- **Undo/redo UI** (Plan 08-04) - Store has undo middleware, UI controls not built yet
- **Biometrics panel** (Plan 08-08) - Live stats display
- **Version history** (Plan 08-09) - Lineup versioning UI

## Verification Results

✅ TypeScript compiles without errors (`npm run build`)
✅ All 5 files created and committed
✅ Components use V2 design tokens consistently
✅ AddBoatButton opens dropdown with boat class options
✅ AthleteBank renders with search filter
✅ BoatView displays seats in correct vertical order (bow at top)
✅ Seats show Port/Starboard designation correctly
✅ Component index exports all three components

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for Plan 08-02 (Drag-Drop Seat Assignment):**
- ✅ AthleteBank component ready to become draggable source
- ✅ BoatView seat slots ready to become drop targets
- ✅ BoatInstance and DragData/DropData types defined
- ✅ Store methods (assignToSeat, swapAthletes) already exist
- ⚠️ Need to create LineupWorkspace wrapper with DndContext

**Blockers:** None

**Concerns:** None

## Git History

```
9e7e8f5 feat(08-01): add lineup components index
aa59aef feat(08-01): create BoatView component
47ae8eb feat(08-01): create AthleteBank component
b79c998 feat(08-01): create AddBoatButton component (LINE-01)
9a9cbed feat(08-01): create TypeScript types for lineup builder
```

**Commits:** 5 task commits (one per task + index)
**Files changed:** 5 created
**Lines added:** 698

---

*Phase 08, Plan 01 complete - Foundation ready for drag-drop enhancement*
