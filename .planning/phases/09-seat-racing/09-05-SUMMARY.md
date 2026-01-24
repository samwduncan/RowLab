---
phase: 09-seat-racing
plan: 05
subsystem: ui
tags: [react, react-hook-form, headless-ui, seat-racing, wizard, athlete-assignment]

# Dependency graph
requires:
  - phase: 09-01
    provides: Seat racing types and Zod schemas
  - phase: 06-01
    provides: useAthletes hook for athlete data
provides:
  - AthleteAssignmentStep component for wizard Step 3
  - SeatSlotSelector dropdown for athlete seat assignment
  - Automatic switch detection between pieces
  - Seat slot generation based on boat class
affects: [09-06, 09-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic seat generation based on boat class configuration"
    - "Global athlete assignment tracking to prevent double-assignment"
    - "Automatic switch detection by comparing consecutive pieces"

key-files:
  created:
    - src/v2/components/seat-racing/wizard/SeatSlotSelector.tsx
    - src/v2/components/seat-racing/wizard/AthleteAssignmentStep.tsx
  modified:
    - src/v2/components/seat-racing/wizard/index.ts
    - src/v2/components/seat-racing/wizard/SessionWizard.tsx

key-decisions:
  - "Athletes sorted by side preference match for each seat"
  - "Switches auto-detected rather than manual entry"
  - "Partial lineups allowed - seats can remain empty"
  - "Side badges use same colors as AthletesTable for consistency"

patterns-established:
  - "Seat slot generation: generateSeatSlots(config) creates slots with alternating port/starboard"
  - "Assignment tracking: Set<athleteId> prevents double-assignment across all boats"
  - "Switch detection: detectSwitches() compares athlete positions between consecutive pieces"

# Metrics
duration: 7min 47s
completed: 2026-01-24
---

# Phase 09 Plan 05: Athlete Assignment Summary

**Wizard Step 3 with seat-by-seat athlete assignment, side preference highlighting, and automatic switch detection between pieces**

## Performance

- **Duration:** 7 min 47 sec
- **Started:** 2026-01-24T22:26:10Z
- **Completed:** 2026-01-24T22:33:57Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- SeatSlotSelector dropdown with side preference matching and athlete filtering
- AthleteAssignmentStep shows all pieces/boats with seat assignment interface
- Global tracking prevents athletes from being assigned to multiple seats
- Automatic switch detection identifies athletes who moved between pieces
- Seat configuration adapts to boat class (8+, 4+, 4-, etc)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SeatSlotSelector component** - `a38990b` (feat)
2. **Task 2: Create AthleteAssignmentStep (Step 3)** - `882aece` (feat)
3. **Task 3: Update wizard exports and SessionWizard** - `eba0702` (feat)

## Files Created/Modified

### Created
- `src/v2/components/seat-racing/wizard/SeatSlotSelector.tsx` - Dropdown for athlete selection with side preference highlighting, disabled state for assigned athletes, clear button, and alphabetical sorting
- `src/v2/components/seat-racing/wizard/AthleteAssignmentStep.tsx` - Step 3 component displaying pieces/boats with seat slots, assignment tracking, switch detection, and assignment progress

### Modified
- `src/v2/components/seat-racing/wizard/index.ts` - Added exports for AthleteAssignmentStep and SeatSlotSelector
- `src/v2/components/seat-racing/wizard/SessionWizard.tsx` - Integrated AthleteAssignmentStep into step components array, replaced placeholder

## Decisions Made

**1. Athletes sorted by side preference match for each seat**
- Rationale: Places matching athletes at top of dropdown for quick selection, reduces scrolling

**2. Switches auto-detected rather than manual entry**
- Rationale: Reduces data entry burden - coaches just assign athletes and system figures out who swapped

**3. Partial lineups allowed - seats can remain empty**
- Rationale: Seat races often test partial lineups, strict validation would block valid use cases

**4. Side badges use same colors as AthletesTable for consistency**
- Rationale: Port=red, Starboard=green, Both=blue, Cox=purple matches established V2 pattern from Phase 6

**5. Global athlete assignment tracking across all boats**
- Rationale: Prevents double-assignment errors, provides real-time feedback in dropdowns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated smoothly with existing wizard infrastructure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 09-06:** Review step can now display complete session data including athlete assignments and detected switches.

**Blockers:** None

**Notes:**
- Wizard Steps 1-3 are now complete and functional
- Form state includes session metadata, pieces with boats, and athlete assignments
- Switch detection provides immediate feedback to coaches during assignment

---
*Phase: 09-seat-racing*
*Completed: 2026-01-24*
