---
phase: 04-migration-loop
plan: 09
subsystem: coach-features
tags: [react, typescript, css-grid, biometrics, ui-components]
requires: [04-06]
provides: [availability-ui-components]
affects: [04-10]
tech-stack:
  added: []
  patterns: [css-grid-sticky-columns, biometrics-badges]
key-files:
  created:
    - src/v2/components/availability/AvailabilityGrid.tsx
    - src/v2/components/availability/AvailabilityEditor.tsx
    - src/v2/components/availability/index.ts
  modified: []
decisions:
  - id: biometrics-badges
    decision: Display athlete biometrics as compact badges (P/S/B/C for side, Sc/Cx for capabilities)
    rationale: Coaches need at-a-glance biometrics in grid view for roster planning
  - id: sticky-column-width
    decision: 200px sticky column width to accommodate name + badges
    rationale: Enough space for athlete name plus 3 badges without truncation
metrics:
  duration: 12min
  completed: 2026-01-23
---

# Phase 04 Plan 09: Availability UI Components Summary

**One-liner:** CSS Grid-based availability matrix with biometrics badges (side, scull, cox) for team scheduling

## What Was Built

Created three availability UI components for team-wide scheduling:

1. **AvailabilityCell** - Color-coded AM/PM slot display
   - Green (AVAILABLE), Red (UNAVAILABLE), Yellow (MAYBE), Gray (NOT_SET)
   - Shows symbols: ✓ ✗ ? —
   - Hover interaction with ring highlight

2. **AvailabilityGrid** - Team-wide availability matrix
   - CSS Grid layout with dynamic columns based on date range
   - Sticky first column (200px) for athlete names
   - **Biometrics display:**
     - SideBadge: P (Port), S (Starboard), B (Both), C (Cox)
     - Sc badge for canScull
     - Cx badge for canCox
   - Maps athlete dates to cells, shows NOT_SET if no data
   - Click handler for cell interaction

3. **AvailabilityEditor** - Individual athlete editing interface
   - Visual slot selector buttons (✓ ? ✗ —)
   - Real-time preview via AvailabilityCell
   - Scrollable for long date ranges
   - Save/Cancel actions

## Technical Implementation

### CSS Grid Sticky Columns

```tsx
gridTemplateColumns: `200px repeat(${dates.length}, minmax(100px, 1fr))`
```

First column sticky via `position: sticky; left: 0; z-index: 10`

### Biometrics Badges

Three badge components for compact display:

1. **SideBadge** - Colored by side (info/success/warning/primary)
2. **BiometricBadge** - Small gray badges for capabilities
3. Layout: `<name> <SideBadge> <Sc?> <Cx?>`

### Color-Coded Slots

- AVAILABLE: `bg-status-success/20 text-status-success`
- UNAVAILABLE: `bg-status-error/20 text-status-error`
- MAYBE: `bg-status-warning/20 text-status-warning`
- NOT_SET: `bg-bg-surface text-text-muted`

All colors from V2 design token system.

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| AvailabilityGrid.tsx | Team matrix view with biometrics | 122 |
| AvailabilityEditor.tsx | Individual editing interface | 154 |
| index.ts | Barrel export | 3 |

**Note:** AvailabilityCell.tsx (52 lines) was created in commit da7e200 from plan 04-08.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| da7e200 | feat | AvailabilityCell component (from 04-08) |
| 92a361c | feat | AvailabilityGrid component |
| 92e64ef | feat | AvailabilityEditor and barrel export |

## Deviations from Plan

### Pre-existing File (AvailabilityCell)

**Found during:** Task 1
**Issue:** AvailabilityCell.tsx already existed from commit da7e200 (labeled as plan 04-08)
**Action:** Verified existing implementation matches plan requirements, proceeded with remaining tasks
**Files:** AvailabilityCell.tsx
**Commit:** da7e200 (from previous partial execution)

This was from a previous incomplete execution of the phase. The existing file matched the plan specification, so no changes were needed.

## Decisions Made

### Biometrics Badge Design

**Context:** Plan 04-12 added side, canScull, canCox to AthleteAvailability type
**Decision:** Display as compact badges next to athlete name
**Options considered:**
- Tooltip on hover (hidden by default)
- Separate column in grid (too wide)
- Badges in sticky column (chosen)
**Rationale:** Coaches need immediate visual access to biometrics for roster decisions. Badges are always visible without interaction.

### Sticky Column Width

**Decision:** 200px for first column
**Rationale:** Accommodates name (up to ~120px) + 3 badges (60px) + padding without truncation

### Slot Selector UI

**Decision:** Button group with symbols (✓ ? ✗ —) instead of dropdown
**Rationale:** Faster interaction - single click vs. click + select. Visual preview of all options.

## Integration Points

### Consumed

- `AthleteAvailability`, `AvailabilityDay`, `AvailabilitySlot` types from `types/coach.ts`
- V2 design tokens (status colors, bg, text, border)
- CSS Grid layout patterns

### Provides

- `AvailabilityGrid` - for coach views (COACH-05, COACH-06)
- `AvailabilityEditor` - for athlete self-service (COACH-07)
- `AvailabilityCell` - reusable slot display

## Testing & Verification

### Build Verification

✅ `npm run build` passed (13.37s)
- All TypeScript types resolved
- No ESLint errors
- Production bundle created successfully

### Component Features Verified

- ✅ AvailabilityGrid renders with dynamic date columns
- ✅ Biometrics badges (P/S/B/C, Sc, Cx) display correctly
- ✅ AvailabilityCell shows color-coded slots
- ✅ AvailabilityEditor provides editing interface
- ✅ Sticky column works (visual layout confirmed)

## Known Limitations

None - all success criteria met.

## Next Phase Readiness

**Blocks:** None
**Concerns:** None
**Recommendations:**
- Plan 04-10: Integrate AvailabilityGrid into coach roster view
- Plan 04-11: Add AvailabilityEditor to athlete self-service page
- Consider bulk edit capabilities for coaches (set entire week at once)

---

**Completed:** 2026-01-23
**Duration:** 12 minutes
**Tasks:** 3/3 (100%)
