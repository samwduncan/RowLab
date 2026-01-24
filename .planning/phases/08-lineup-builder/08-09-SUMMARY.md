---
phase: 08
plan: 09
subsystem: lineup-builder
tags: [typescript, react, framer-motion, mobile-ui, responsive-design, tap-to-select]

requires:
  - phase: 08
    plan: 01
    provides: "BoatView and lineup UI foundation"
  - phase: 08
    plan: 02
    provides: "Drag-drop interaction with DraggableAthleteCard"
  - phase: 08
    plan: 03
    provides: "Validation warnings and spring animations"

provides:
  - "MobileAthleteSelector bottom sheet for tap-based athlete selection"
  - "MobileSeatSlot with larger touch targets and tap-to-select interaction"
  - "MobileLineupBuilder full-screen layout optimized for mobile"
  - "Responsive breakpoint switch (768px) between desktop/mobile layouts"
  - "Shared lineupStore state across desktop and mobile experiences"

affects:
  - phase: 08
    plan: 10-11
    impact: "Future mobile enhancements should follow tap-to-select pattern established here"

tech-stack:
  added:
    - "AthleteAvatar component reuse for mobile UI consistency"
    - "useEffect resize listener for responsive mobile detection"
  patterns:
    - "768px breakpoint for mobile/desktop switch"
    - "Tap-to-select workflow: tap seat → open selector → select athlete → close"
    - "Bottom sheet UI pattern with swipe-to-close gesture"
    - "Mobile-first component isolation (separate components, not CSS-only responsive)"

key-files:
  created:
    - "src/v2/components/lineup/MobileAthleteSelector.tsx"
    - "src/v2/components/lineup/MobileSeatSlot.tsx"
    - "src/v2/components/lineup/MobileLineupBuilder.tsx"
  modified:
    - "src/v2/components/lineup/LineupWorkspace.tsx"

decisions:
  - id: "LINE-MOBILE-01"
    decision: "768px breakpoint for mobile detection"
    rationale: "Standard tablet/mobile breakpoint, matches Tailwind's md: breakpoint, allows iPad portrait to use mobile UI"
    chosen: "window.innerWidth < 768 triggers mobile layout"

  - id: "LINE-MOBILE-02"
    decision: "Separate mobile components instead of CSS-only responsive"
    rationale: "Per CONTEXT.md: 'Full redesign for mobile - different UI entirely', tap-to-select requires fundamentally different interaction model than drag-drop"
    chosen: "MobileLineupBuilder, MobileSeatSlot, MobileAthleteSelector as distinct components"

  - id: "LINE-MOBILE-03"
    decision: "Bottom sheet slides to 80% viewport height"
    rationale: "Leaves space for user to see boat context while selecting, full-screen would hide what they're building"
    chosen: "h-[80vh] on bottom sheet container"

  - id: "LINE-MOBILE-04"
    decision: "No DndContext on mobile layout"
    rationale: "Drag-drop conflicts with scroll on touch devices, tap-to-select is cleaner mobile UX"
    chosen: "Mobile renders MobileLineupBuilder without DndContext wrapper"

metrics:
  duration: "8 minutes"
  completed: "2026-01-24"

status: complete
---

# Phase 08 Plan 09: Mobile Lineup Builder Summary

**Tap-to-select lineup builder for mobile with bottom sheet athlete selector, 768px responsive breakpoint, and shared state across desktop/mobile layouts**

## Performance

- **Duration:** 8 minutes 35 seconds
- **Started:** 2026-01-24T20:28:22Z
- **Completed:** 2026-01-24T20:36:57Z
- **Tasks:** 3
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- **LINE-09 complete:** Mobile users can build lineups with tap-to-select workflow
- Mobile UI is distinct from desktop (separate components, not just CSS responsive)
- Scrolling works correctly on mobile (no drag-drop conflicts)
- Shared lineupStore ensures state consistency across desktop/mobile

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MobileAthleteSelector component** - `5af4be0` (feat)
2. **Task 2: Create MobileSeatSlot and MobileLineupBuilder** - `83c5708` (feat)
3. **Task 3: Integrate responsive switch in LineupWorkspace** - `2307e11` (feat)

All commits follow conventional commit format with `(08-09)` scope.

## Files Created/Modified

### Created

- **src/v2/components/lineup/MobileAthleteSelector.tsx** (189 lines)
  - Bottom sheet athlete selector sliding up from bottom
  - Takes ~80% of screen height for athlete list
  - Search filter at top for quick athlete finding
  - Tap athlete to select and close
  - Swipe down or tap outside to close
  - Shows avatar (via AthleteAvatar), name, side preference badge
  - Disables already-assigned athletes with opacity
  - Framer Motion animations: slide-up enter, slide-down exit
  - Drag gesture for swipe-to-close (offset.y > 100px triggers close)

- **src/v2/components/lineup/MobileSeatSlot.tsx** (135 lines)
  - Larger touch target (min 48px height) per accessibility guidelines
  - Visual selected state (blue border + ring when tapped)
  - Shows assigned athlete or "Tap to assign" placeholder
  - Remove button (X) for assigned seats (stops propagation to avoid re-opening selector)
  - Warning badges for validation issues (port/starboard, coxswain)
  - Active scale animation on tap (scale-[0.98] for tactile feedback)
  - Uses validateSeatAssignment() for consistency with desktop

- **src/v2/components/lineup/MobileLineupBuilder.tsx** (271 lines)
  - Full-screen layout optimized for mobile (no sidebar)
  - Full-width boat view with vertical seat stack (bow-at-top)
  - Bottom action bar with:
    - Undo/Redo buttons (uses lineupStore.undo/redo)
    - Available athletes count display
  - Tap-to-select workflow:
    1. User taps seat → selectedSeat state set, selectorOpen = true
    2. MobileAthleteSelector opens with bottom sheet animation
    3. User taps athlete → assignToSeat/assignToCoxswain called
    4. Selector closes, selectedSeat cleared
  - Remove button on seats returns athlete to available pool
  - Uses same lineupStore actions as desktop (assignToSeat, removeFromSeat)

### Modified

- **src/v2/components/lineup/LineupWorkspace.tsx** (+33 lines)
  - Added `useEffect` resize listener for mobile detection
  - 768px breakpoint: `window.innerWidth < 768` → mobile layout
  - Conditional rendering:
    - Mobile (isMobile = true): renders `<MobileLineupBuilder />` (no DndContext)
    - Desktop (isMobile = false): renders existing drag-drop layout with DndContext
  - Shared lineupStore: both layouts use same state, changes sync automatically
  - Undo/redo works across both layouts
  - Import MobileLineupBuilder component

## Implementation Details

### Mobile Detection Pattern

```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

**Why this approach:**
- Simple, no external dependencies (could use media query hook later)
- Detects on mount + resize events
- 768px matches Tailwind's `md:` breakpoint convention
- Cleanup prevents memory leaks

**Alternative considered:** CSS-only with Tailwind responsive classes
**Chosen:** JavaScript detection because mobile needs fundamentally different component tree (no DndContext)

### Tap-to-Select Workflow

**State tracking:**
```typescript
interface SelectedSeat {
  boatId: string;
  seatNumber?: number;
  isCoxswain: boolean;
}

const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
const [selectorOpen, setSelectorOpen] = useState(false);
```

**Sequence:**
1. User taps MobileSeatSlot → `onTap()` called
2. `setSelectedSeat({ boatId, seatNumber, isCoxswain })`
3. `setSelectorOpen(true)` → MobileAthleteSelector animates in
4. User taps athlete → `handleAthleteSelect(athlete)` called
5. `assignToSeat(boatId, seatNumber, athlete)` updates lineupStore
6. `setSelectorOpen(false)` → bottom sheet animates out
7. `setSelectedSeat(null)` → clears selection

**Visual feedback:**
- Selected seat shows blue border + ring (`isSelected` prop)
- Bottom sheet slides up with spring physics
- Sheet closes on athlete tap, swipe down, or outside tap

### Bottom Sheet Gestures

**Framer Motion drag:**
```typescript
drag="y"
dragConstraints={{ top: 0, bottom: 0 }}
dragElastic={{ top: 0, bottom: 0.5 }}
onDragEnd={(_, info) => {
  if (info.offset.y > 100) {
    onClose();
  }
}}
```

**Behavior:**
- Drag constrained to vertical axis only
- No elasticity at top (can't drag up beyond initial position)
- 0.5 elasticity at bottom (slight resistance, then bounces back)
- 100px threshold: swipe down > 100px triggers close
- Less than 100px: bounces back to open position

**Why 100px threshold:**
- Prevents accidental closes from minor finger movement
- Large enough to feel intentional
- Small enough to be quick gesture

## Decisions Made

### Decision 1: 768px Breakpoint for Mobile Detection

**Rationale:** Standard tablet/mobile breakpoint, matches Tailwind's `md:` breakpoint, allows iPad portrait (768px wide) to use mobile UI which is better for touch interaction.

**Alternative considered:** 640px (Tailwind sm:) or 1024px (Tailwind lg:)

**Chosen:** 768px

**Impact:** iPad portrait uses mobile tap-to-select (better for touch), iPad landscape uses desktop drag-drop

### Decision 2: Separate Mobile Components (Not CSS-Only Responsive)

**Rationale:** Per CONTEXT.md: "Full redesign for mobile - different UI entirely for small screens, not just responsive adjustments". Tap-to-select requires fundamentally different interaction model than drag-drop.

**Alternative considered:** CSS-only responsive with `@media` queries hiding/showing elements

**Chosen:** Separate MobileLineupBuilder, MobileSeatSlot, MobileAthleteSelector components

**Impact:**
- Cleaner code separation
- Mobile doesn't load DndContext (lighter bundle)
- Easier to maintain distinct UX for each platform
- Can optimize mobile layout independently

### Decision 3: Bottom Sheet 80% Viewport Height

**Rationale:** Leaves space for user to see boat context while selecting athletes. Full-screen would hide what they're building.

**Alternative considered:** 100% height (modal overlay) or 60% height (more context visible)

**Chosen:** 80% height

**Impact:** User can see boat header + maybe one seat while selecting, provides context without taking over entire screen

### Decision 4: No DndContext on Mobile Layout

**Rationale:** Drag-drop conflicts with scroll on touch devices (accidental drags trigger when trying to scroll). Tap-to-select is cleaner mobile UX, established mobile pattern.

**Alternative considered:** Keep DndContext with `TouchSensor` delay, add scroll containers

**Chosen:** Mobile renders MobileLineupBuilder without DndContext wrapper

**Impact:**
- No drag-drop code loaded on mobile (lighter bundle)
- Scroll works perfectly (no conflicts)
- Simpler mental model for mobile users
- Desktop and mobile can evolve independently

## Deviations from Plan

None - plan executed exactly as written.

All three tasks completed as specified:
- Task 1: MobileAthleteSelector with bottom sheet UI ✓
- Task 2: MobileSeatSlot and MobileLineupBuilder with tap-to-select ✓
- Task 3: Responsive switch in LineupWorkspace at 768px ✓

## Issues Encountered

None - implementation was straightforward.

**Smooth execution because:**
- AthleteAvatar component already existed for avatar display
- validateSeatAssignment() reused from desktop SeatSlot
- lineupStore actions (assignToSeat, removeFromSeat) work identically for mobile
- Framer Motion already in use for desktop animations

## Next Phase Readiness

**Ready for Phase 8 completion:**
- ✅ Mobile users can build lineups without drag-drop conflicts
- ✅ Tap-to-select workflow is intuitive and fast
- ✅ Mobile UI is distinct, not just "shrunk desktop"
- ✅ Same lineup store used, state consistent across devices
- ✅ Scrolling works normally on mobile
- ✅ Desktop drag-drop still works on larger screens

**Future enhancements (out of scope for this plan):**
- Multi-boat tabs on mobile (currently shows all boats in scroll)
- Swipe gestures for undo/redo
- Haptic feedback on seat selection (requires Web Vibration API)

**Blockers:** None

**Concerns:** None - mobile UI complete and functional

## Verification Results

✅ Mobile UI shows on screens < 768px (tested with browser resize)
✅ Tap-to-select workflow: tap seat, select athlete, athlete assigned
✅ Scrolling works normally (not blocked by drag handlers)
✅ Bottom sheet opens/closes smoothly with spring animation
✅ Assigned athletes can be removed via X button
✅ Undo/redo works on mobile via bottom action bar
✅ Layout adapts on screen rotation (resize listener updates isMobile)
✅ Desktop drag-drop still works on larger screens (>= 768px)
✅ TypeScript compiles without errors (`npm run build` passes)
✅ All 3 task commits atomic and properly scoped

## Git History

```
2307e11 feat(08-09): add responsive breakpoint switch in LineupWorkspace
83c5708 feat(08-09): create MobileSeatSlot and MobileLineupBuilder components
5af4be0 feat(08-09): create MobileAthleteSelector bottom sheet component
```

**Commits:** 3 task commits (one per task)
**Files changed:** 4 (3 created, 1 modified)
**Lines added:** ~595 (mobile UI components + responsive switch)

---

*Phase 08, Plan 09 complete - Mobile lineup builder with tap-to-select workflow ready*
