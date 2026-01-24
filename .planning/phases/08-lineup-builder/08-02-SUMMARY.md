---
phase: 08
plan: 02
subsystem: lineup-builder
tags: [typescript, react, dnd-kit, drag-drop, auto-swap]

requires:
  - phase: 08
    plan: 01
    reason: "Built on foundation components (AthleteBank, BoatView, AddBoatButton)"

provides:
  - "Full drag-and-drop functionality with @dnd-kit"
  - "DraggableAthleteCard component with source tracking"
  - "SeatSlot droppable component with visual feedback"
  - "LineupWorkspace container with DndContext"
  - "Auto-swap behavior when dropping on occupied seats"
  - "DragOverlay showing full athlete card during drag"

affects:
  - phase: 08
    plan: 03
    impact: "Seat validation warnings will enhance SeatSlot drop feedback (red border for invalid)"
  - phase: 08
    plan: 04-11
    impact: "All future lineup features use drag-drop interaction"

tech-stack:
  added:
    - "@dnd-kit/core - useDraggable, useDroppable, DndContext, DragOverlay"
    - "@dnd-kit/utilities - CSS transform utilities"
  patterns:
    - "Source tracking for auto-swap logic"
    - "DragOverlay for visual feedback at cursor"
    - "Sensor configuration (mouse, touch, keyboard)"
    - "Drop zone highlighting with green border"

key-files:
  created:
    - "src/v2/components/lineup/DraggableAthleteCard.tsx"
    - "src/v2/components/lineup/SeatSlot.tsx"
    - "src/v2/components/lineup/LineupWorkspace.tsx"
  modified:
    - "src/v2/components/lineup/AthleteBank.tsx"
    - "src/v2/components/lineup/BoatView.tsx"
    - "src/v2/components/lineup/index.ts"

decisions:
  - id: "LINE-DD-01"
    decision: "Track source position (bank/seat/coxswain) in drag data"
    rationale: "Auto-swap requires knowing where athlete came from to properly exchange positions"
    alternatives: "Track globally in LineupWorkspace state"
    chosen: "Pass source in drag data - cleaner, no global state pollution"

  - id: "LINE-DD-02"
    decision: "Use DragOverlay for cursor preview instead of transform-only"
    rationale: "DragOverlay allows full athlete card to follow cursor, improving visibility during drag"
    alternatives: "Style original element during drag"
    chosen: "DragOverlay - better UX, matches Linear/Notion patterns"

  - id: "LINE-DD-03"
    decision: "Green border for all drop zones, defer red for validation (08-03)"
    rationale: "Plan scope is core drag-drop. Validation warnings come in next plan."
    alternatives: "Implement validation now"
    chosen: "Defer validation - keep plan focused"

  - id: "LINE-DD-04"
    decision: "10px activation distance for mouse, 250ms delay for touch"
    rationale: "Prevents accidental drags on click/tap, standard @dnd-kit values"
    alternatives: "Lower thresholds for faster response"
    chosen: "Standard thresholds - balances responsiveness with intentionality"

metrics:
  duration: "4 minutes"
  completed: "2026-01-24"

status: complete
---

# Phase 08 Plan 02: Drag-Drop Seat Assignment Summary

**One-liner:** Full drag-drop functionality with @dnd-kit, auto-swap on occupied seats, and DragOverlay cursor preview

## What Was Built

Implemented complete drag-and-drop interaction for the lineup builder:

1. **DraggableAthleteCard Component** (`src/v2/components/lineup/DraggableAthleteCard.tsx`)
   - Uses `useDraggable` hook from @dnd-kit/core
   - Tracks source position (bank, seat, coxswain) for auto-swap logic
   - Shows athlete avatar, name, side preference badge
   - Opacity 0.5 during drag (original card fades)
   - Cursor changes: `grab` (idle) → `grabbing` (active)
   - Data payload: `{ athlete, source: { type, boatId?, seatNumber? } }`

2. **SeatSlot Component** (`src/v2/components/lineup/SeatSlot.tsx`)
   - Uses `useDroppable` hook from @dnd-kit/core
   - Visual feedback on drag-over: green border with ring effect
   - Empty seats: dashed border, "Empty" text placeholder
   - Occupied seats: wraps DraggableAthleteCard (athletes in seats are draggable)
   - Displays seat number (left), side indicator badge (right)
   - Remove button on hover for occupied seats
   - Coxswain position support with purple styling

3. **LineupWorkspace Container** (`src/v2/components/lineup/LineupWorkspace.tsx`)
   - DndContext with configured sensors:
     - MouseSensor: 10px activation distance
     - TouchSensor: 250ms hold delay, 5px tolerance
     - KeyboardSensor: arrow keys for accessibility
   - DragOverlay: Shows full athlete card at cursor during drag
   - Auto-swap logic in `handleDragEnd`:
     ```typescript
     if (occupiedAthlete) {
       // Remove dragged athlete from source
       // Place occupied athlete in source position (if seat, not bank)
       // Place dragged athlete in target position
     } else {
       // Simple assignment: remove from source, assign to target
     }
     ```
   - Handles all operations:
     - Bank → Empty seat (assign)
     - Bank → Occupied seat (assign, displaced goes to bank)
     - Seat → Seat (swap positions)
     - Seat → Bank (remove from lineup)

4. **Component Updates**
   - **AthleteBank**: Replaced static athlete cards with `DraggableAthleteCard` (source='bank')
   - **BoatView**: Replaced inline seat rendering with `SeatSlot` component
   - **index.ts**: Exported new components (LineupWorkspace, DraggableAthleteCard, SeatSlot)

## Key Implementation Details

### Source Tracking (Decision LINE-DD-01)

The `AthleteSource` interface is critical for auto-swap:

```typescript
export interface AthleteSource {
  type: 'bank' | 'seat' | 'coxswain';
  boatId?: string;
  seatNumber?: number;
}
```

When dropping on an occupied seat, we need to know where the dragged athlete came from:
- **From bank**: Occupied athlete goes to bank (implicit removal)
- **From seat**: Occupied athlete goes to source seat (true swap)

### Auto-Swap Logic

Per CONTEXT.md: "Dropping on occupied seat triggers auto-swap - athletes exchange places automatically"

Implementation steps:
1. Capture source position BEFORE any state changes
2. If target occupied: remove from source → place occupant at source → place dragged at target
3. If target empty: remove from source → place dragged at target

State changes tracked by undo middleware (Decision 08-01: LINE-UI-01).

### Drag Sensors Configuration

```typescript
const sensors = useSensors(
  useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  useSensor(KeyboardSensor)
);
```

- **Mouse**: 10px drag before activating (prevents click conflicts)
- **Touch**: 250ms hold before activating (prevents scroll conflicts)
- **Keyboard**: Arrow keys for accessibility

### DragOverlay (Decision LINE-DD-02)

Shows full athlete card following cursor during drag:
- Better visibility than transform-only approach
- Matches modern drag-drop patterns (Linear, Notion)
- Card styled with shadow and border for depth

## Component Stats

| Component | Lines | Key Features |
|-----------|-------|--------------|
| DraggableAthleteCard.tsx | 117 | useDraggable, source tracking, cursor states |
| SeatSlot.tsx | 130 | useDroppable, green highlight, wraps draggable when occupied |
| LineupWorkspace.tsx | 179 | DndContext, sensors, auto-swap logic, DragOverlay |
| AthleteBank.tsx (modified) | -34 | Replaced static cards with DraggableAthleteCard |
| BoatView.tsx (modified) | -143 | Replaced inline seats with SeatSlot component |

**Total new code:** 426 lines
**Code removed (consolidated):** 177 lines
**Net change:** +249 lines

## What's NOT In This Plan

Intentionally deferred to future plans:

- **Seat validation warnings** (Plan 08-03) - Port/starboard mismatch, cox validation
- **Red border for invalid drops** (Plan 08-03) - Currently all drops show green
- **Undo/redo UI controls** (Plan 08-04) - Store has undo middleware, UI not built yet
- **Touch tap-to-select mode** (Future) - CONTEXT.md mentions alternative for mobile
- **Keyboard drag-drop** (Future) - KeyboardSensor configured but not fully implemented

## Verification Results

✅ TypeScript compiles without errors (`npm run build`)
✅ DraggableAthleteCard created with source tracking
✅ SeatSlot created with drop feedback and occupied seat dragging
✅ LineupWorkspace wires DndContext with sensors
✅ AthleteBank athletes are draggable from bank
✅ BoatView seats are droppable with green highlight
✅ DragOverlay shows full athlete card at cursor
✅ Auto-swap logic handles all operation types
✅ Component index exports new components

## Deviations from Plan

### Auto-fixed Issues

**[Rule 2 - Missing Critical] Coxswain position in SeatSlot**
- **Found during:** Task 2 (SeatSlot creation)
- **Issue:** Plan specified seat slots but didn't explicitly handle coxswain drop zone
- **Fix:** Added `isCoxswain` prop to SeatSlot, conditional rendering for cox label/styling
- **Files modified:** SeatSlot.tsx, BoatView.tsx
- **Commit:** 95eead6

**[Rule 1 - Bug] Import path for CSS utilities**
- **Found during:** Task 1 (DraggableAthleteCard creation)
- **Issue:** @dnd-kit/utilities provides CSS helpers but wasn't imported
- **Fix:** Import `CSS` from '@dnd-kit/utilities' for transform helpers
- **Files modified:** DraggableAthleteCard.tsx
- **Commit:** 591d197

## Next Phase Readiness

**Ready for Plan 08-03 (Seat Validation Warnings):**
- ✅ SeatSlot component ready for warning badges
- ✅ Drop data includes seat info for validation
- ✅ isOver state available for conditional border colors
- ✅ Auto-swap logic preserves validation checks

**Ready for Plan 08-04 (Undo/Redo UI):**
- ✅ lineupStore tracks activeBoats changes via undo middleware
- ✅ Each drag operation creates undoable state change
- ✅ undo() and redo() methods available from store

**Blockers:** None

**Concerns:** None

## Authentication Gates

None - all functionality client-side using existing store.

## Git History

```
f0762b6 feat(08-02): wire drag-drop with DragOverlay and auto-swap
95eead6 feat(08-02): create SeatSlot droppable component
591d197 feat(08-02): create DraggableAthleteCard component
```

**Commits:** 3 task commits
**Files changed:** 6 (3 created, 3 modified)
**Lines added:** 426 new code, 249 net

---

*Phase 08, Plan 02 complete - Drag-drop with auto-swap ready for validation enhancement*
