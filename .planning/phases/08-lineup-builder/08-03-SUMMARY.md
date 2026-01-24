---
phase: 08
plan: 03
subsystem: lineup-builder
tags: [typescript, react, framer-motion, validation, animations, dnd-kit]

requires:
  - phase: 08
    plan: 01
    provides: "BoatView and lineup UI foundation"
  - phase: 08
    plan: 02
    provides: "SeatSlot and DraggableAthleteCard with drag-drop (executed in parallel)"

provides:
  - "SeatWarningBadge component for validation warnings"
  - "Port/starboard validation with soft warnings"
  - "Coxswain seat validation (non-cox in cox seat)"
  - "Spring-physics animations on all drag-drop interactions"
  - "Non-blocking validation: warnings informational only, coach can override"

affects:
  - phase: 08
    plan: 04-11
    impact: "All future lineup features inherit validation and animation patterns"

tech-stack:
  added:
    - "Framer Motion spring animations for drag-drop feedback"
    - "validateSeatAssignment utility integration"
  patterns:
    - "Soft validation pattern: warnings visible but never blocking"
    - "Spring config constants (stiffness: 300, damping: 28) for consistent animation feel"
    - "AnimatePresence for athlete card entry/exit animations"

key-files:
  created:
    - "src/v2/components/lineup/SeatWarningBadge.tsx"
  modified:
    - "src/v2/components/lineup/SeatSlot.tsx"
    - "src/v2/components/lineup/DraggableAthleteCard.tsx"
    - "src/v2/components/lineup/BoatView.tsx"

decisions:
  - id: "LINE-VAL-01"
    decision: "Validation warnings never block assignment"
    rationale: "Trust the coach - warnings are informational only, coach knows best for experimental lineups"
    chosen: "Soft warnings with visible badges"

  - id: "LINE-VAL-02"
    decision: "Warning badge always visible (not hover-only)"
    rationale: "Per CONTEXT.md: constant awareness required, no hover interaction needed"
    chosen: "Badge rendered on seat at all times when warnings present"

  - id: "DESIGN-ANIM-01"
    decision: "Spring physics for all drag-drop animations"
    rationale: "Per RESEARCH.md: spring physics feel more natural, velocity-aware, don't require precise timing curves"
    chosen: "Framer Motion with shared spring config"

metrics:
  duration: "5 minutes"
  completed: "2026-01-24"

status: complete
---

# Phase 08 Plan 03: Validation Warnings & Spring Animations Summary

**Soft validation warnings with spring-physics drag-drop animations - non-blocking warnings inform coach of port/starboard and coxswain mismatches**

## Performance

- **Duration:** 5 minutes 20 seconds
- **Started:** 2026-01-24T20:01:22Z
- **Completed:** 2026-01-24T20:06:42Z
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **LINE-05 complete:** System validates seat assignments with soft warnings (port/starboard, coxswain)
- **DESIGN-05 complete:** Spring-physics animations on all drag-drop interactions
- Warnings always visible as badges, never block assignment - "trust the coach" philosophy
- Smooth, natural drag-drop feel with velocity-aware spring transitions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SeatWarningBadge component** - `94211d8` (feat)
2. **Task 2: Integrate validation into SeatSlot** - `4fe23e5` (feat)
3. **Task 3: Add Framer Motion spring animations** - `668712a` (feat)

All commits follow conventional commit format with `(08-03)` scope.

## Files Created/Modified

### Created
- **src/v2/components/lineup/SeatWarningBadge.tsx** (53 lines)
  - Warning badge component with amber background, AlertTriangle icon
  - Shows warning count if multiple warnings (e.g., "2")
  - Tooltip on hover with full warning messages
  - Positioned absolutely in top-right corner of seat slot
  - Non-blocking: visual indicator only, no interaction required

### Modified
- **src/v2/components/lineup/SeatSlot.tsx** (+43 lines)
  - Added `validateSeatAssignment()` check for port/starboard mismatches
  - Added coxswain seat validation (non-cox in cox seat check)
  - Integrated SeatWarningBadge display when warnings present
  - Updated drag-over colors: green for valid match, yellow/amber for warnings
  - Added Framer Motion spring animations (scale on hover/drag-over, layout animation)
  - Spring config: `{ type: 'spring', stiffness: 300, damping: 28, restDelta: 0.00001 }`

- **src/v2/components/lineup/DraggableAthleteCard.tsx** (+15 lines)
  - Wrapped in `motion.div` for spring animations
  - Entry/exit animations: `initial={{ opacity: 0, scale: 0.8 }}`
  - WhileDrag scale increase: `whileDrag={{ scale: 1.05 }}`
  - Spring transitions replace CSS transitions for natural feel
  - Layout animation for smooth repositioning

- **src/v2/components/lineup/BoatView.tsx** (+2 lines)
  - Added `AnimatePresence` wrapper for athlete cards entering/exiting seats
  - Mode: `popLayout` for smooth layout shifts during presence changes
  - Enables exit animations when athletes are removed from seats

## Validation Implementation Details

### Port/Starboard Validation

Uses `validateSeatAssignment(athlete, seat)` from `src/utils/boatConfig.js`:

```typescript
const sideValidation = validateSeatAssignment(athlete, seat);
if (sideValidation.warning) {
  warnings.push({ type: 'side', message: sideValidation.warning });
}
```

**Warning messages:**
- "Athlete typically rows Starboard, assigned to Port seat"
- "Athlete typically rows Port, assigned to Starboard seat"

**Behavior:**
- Assignment ALWAYS allowed (no blocking)
- Warning badge appears in top-right of seat
- Drag-over highlight changes from green to amber/yellow
- Coach can save lineup regardless of warnings

### Coxswain Seat Validation

Checks if non-coxswain athlete is in coxswain seat:

```typescript
if (isCoxswain && athlete && !athlete.isCoxswain) {
  warnings.push({
    type: 'cox',
    message: 'Non-coxswain assigned to coxswain seat',
  });
}
```

**Behavior:**
- Assignment ALWAYS allowed (flexibility for unusual situations)
- Warning badge shows count if both port/starboard AND coxswain warnings
- Per CONTEXT.md: "Coxswain seat validation: soft warning - non-cox in cox seat shows warning"

## Animation Implementation Details

### Spring Physics Configuration

Shared constant across all animated components:

```typescript
const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 28,
  restDelta: 0.00001,
};
```

**Why these values:**
- `stiffness: 300` - Responsive but not jarring (higher = faster)
- `damping: 28` - Smooth settle without oscillation (higher = less bounce)
- `restDelta: 0.00001` - Precise final positioning (lower = more precise)

Per RESEARCH.md: "Spring physics feel more natural, velocity-aware, don't require precise timing curves"

### SeatSlot Animations

```typescript
<motion.div
  layout
  transition={springConfig}
  animate={{ scale: isOver ? 1.02 : 1 }}
  whileHover={{ scale: isEmpty ? 1 : 1.01 }}
>
```

- **Layout animation:** Smooth repositioning when seats reorder
- **Drag-over scale:** Subtle 2% increase when dragging over seat
- **Hover scale:** 1% increase on hover (occupied seats only)
- **Transition:** Spring physics for all state changes

### DraggableAthleteCard Animations

```typescript
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  whileDrag={{ scale: 1.05 }}
  transition={springConfig}
>
```

- **Entry:** Fade in from 80% scale (appears when athlete assigned)
- **Exit:** Fade out to 80% scale (disappears when removed)
- **Drag feedback:** 5% scale increase during drag
- **Opacity:** 50% during drag (original card fades while dragging)

### BoatView Animations

```typescript
<AnimatePresence mode="popLayout">
  {seatsTopToBottom.map((seat) => (
    <SeatSlot key={...} ... />
  ))}
</AnimatePresence>
```

- **AnimatePresence:** Enables exit animations for removed athletes
- **Mode: popLayout:** Smooth layout shifts when presence changes
- **Layout prop on children:** Inherited from SeatSlot motion.div

## Decisions Made

### Decision 1: Warning Badge Always Visible
**Rationale:** Per CONTEXT.md: "Warnings always visible on seats as badges - constant awareness, no hover required"

**Alternative considered:** Hover-only tooltips (like GitHub PR checks)

**Chosen:** Always-visible badge with count, tooltip on hover for details

**Impact:** Coach gets immediate visual feedback without interaction, can quickly scan lineup for issues

### Decision 2: Validation Never Blocks
**Rationale:** Per CONTEXT.md: "Save always allowed regardless of warnings - warnings are informational only"

**Alternative considered:** Confirmation modal when saving with warnings

**Chosen:** Silent save, warnings are purely informational

**Impact:** Coaches can experiment freely, warnings don't interrupt workflow

### Decision 3: Spring Physics Over CSS Transitions
**Rationale:** Per RESEARCH.md: "Spring physics feel more natural, velocity-aware, don't require precise timing curves"

**Alternative considered:** CSS transitions with cubic-bezier easing

**Chosen:** Framer Motion spring config across all components

**Impact:** Consistent, natural feel throughout drag-drop interactions

## Deviations from Plan

**1. [Rule 3 - Blocking] Worked with existing SeatSlot and DraggableAthleteCard**
- **Found during:** Task 2 start
- **Issue:** Plan expected to modify files from Plan 08-02, but those files already existed (08-02 executed in parallel)
- **Fix:** Enhanced existing components instead of creating new ones
- **Files modified:** Same as planned, but modified existing implementation instead of creating from scratch
- **Verification:** Build succeeded, validation and animations integrate cleanly with existing drag-drop
- **Committed in:** 4fe23e5 and 668712a

---

**Total deviations:** 1 (blocking - dependency resolution)
**Impact on plan:** No scope change, just worked with existing files instead of creating new ones. All requirements met.

## Issues Encountered

None - plan executed smoothly with existing components.

## Next Phase Readiness

**Ready for Plan 08-04 (Undo/Redo UI):**
- ✅ Validation warnings established and non-blocking
- ✅ Spring animations pattern established for future UI controls
- ✅ SeatSlot and DraggableAthleteCard enhanced with full validation and animation support
- ⚠️ Future plans should use shared `springConfig` constant for animation consistency

**Ready for Plan 08-05 (Save/Load Lineups):**
- ✅ Warnings don't block save (coach can save lineup regardless of validation state)
- ✅ Warning state is visual only, doesn't need to be persisted

**Blockers:** None

**Concerns:** None

## Verification Results

✅ Warning badge appears when athlete is in wrong-side seat
✅ Warning badge appears when non-coxswain is in coxswain seat
✅ Warnings do not prevent assignment (coach can always override)
✅ Tooltip shows full warning text on hover
✅ Seats scale smoothly on drag-over with spring physics
✅ Athlete cards animate in/out with spring physics
✅ No jarring or abrupt transitions during drag-drop
✅ TypeScript compiles without errors (`npm run build`)
✅ All 3 task commits atomic and properly scoped

## Git History

```
668712a feat(08-03): add Framer Motion spring animations to drag-drop
4fe23e5 feat(08-03): integrate validation warnings into SeatSlot
94211d8 feat(08-03): create SeatWarningBadge component for validation warnings
```

**Commits:** 3 task commits (one per task)
**Files changed:** 4 (1 created, 3 modified)
**Lines added:** ~160 (validation + animation code)

---

*Phase 08, Plan 03 complete - Validation warnings and spring animations ready*
