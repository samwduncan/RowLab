---
phase: 12
plan: 11
subsystem: ui-polish
tags: [empty-states, ux, components, cta]

dependency-graph:
  requires: [12-01]
  provides:
    - empty-state-components
    - feature-empty-states
  affects: [pages-using-empty-states]

tech-stack:
  added: []
  patterns:
    - empty-state-with-cta
    - secondary-action-pattern
    - filtered-vs-no-data-state

key-files:
  created:
    - src/v2/components/athletes/AthletesEmptyState.tsx
    - src/v2/components/erg/ErgEmptyState.tsx
    - src/v2/components/lineup/LineupEmptyState.tsx
    - src/v2/components/seat-racing/SeatRacingEmptyState.tsx
    - src/v2/components/training/CalendarEmptyState.tsx
    - src/v2/components/regatta/RegattaEmptyState.tsx
  modified:
    - src/v2/components/common/EmptyState.tsx
    - src/v2/components/athletes/index.ts
    - src/v2/components/erg/index.ts
    - src/v2/components/lineup/index.ts
    - src/v2/components/seat-racing/index.ts
    - src/v2/components/training/index.ts
    - src/v2/components/regatta/index.ts

decisions:
  - id: empty-state-secondary-action
    description: Enhanced EmptyState with secondaryAction support for dual CTAs
    rationale: Many empty states need both primary (Add) and secondary (Import) actions
  - id: no-data-vs-no-results
    description: Separate components for "no data" vs "no results from filters"
    rationale: Different messaging helps users understand context and take appropriate action
  - id: success-empty-state
    description: AthletesBankEmptyState shows success state when all assigned
    rationale: Positive feedback when all athletes are in boats improves UX

metrics:
  duration: 5 minutes
  completed: 2026-01-25
---

# Phase 12 Plan 11: Empty States for List/Table Views Summary

**One-liner:** 13 empty state components across 6 features with actionable CTAs and dual-action support

## Changes Made

### Task 1: Athletes and Erg Empty States
- **AthletesEmptyState**: "No athletes yet" with Add Athlete + Import CSV dual CTAs
- **AthletesNoResultsState**: "No athletes found" for filtered view with Clear Filters CTA
- **ErgEmptyState**: "No erg tests yet" with Add Test + Import CSV dual CTAs
- **ErgNoResultsState**: "No tests match filters" with Clear Filters CTA
- Enhanced common EmptyState component to support `secondaryAction` prop

### Task 2: Lineup and Seat Racing Empty States
- **LineupEmptyState**: "No lineups yet" with Create Lineup CTA
- **AthletesBankEmptyState**: Success state "All athletes assigned" with count
- **SeatRacingEmptyState**: "No seat racing sessions" with Start Seat Race CTA
- **RankingsEmptyState**: "No rankings yet" guides user to run seat races

### Task 3: Training and Regatta Empty States
- **CalendarEmptyState**: "No workouts scheduled" with Add Workout + Apply Template CTAs
- **TrainingPlansEmptyState**: "No training plans" with Create Plan CTA
- **RegattaEmptyState**: "No regattas yet" with Add Regatta CTA
- **RacesEmptyState**: "No races added" with Add Race CTA
- **RaceDayEmptyState**: "No active race day" with Select Regatta CTA

## Empty State Pattern

All components follow a consistent pattern using the common EmptyState component:
- Icon (from lucide-react) representing the feature
- Title describing the empty state
- Description providing context and guidance
- Primary action CTA (styled as primary button)
- Optional secondary action (styled as outline button)

## Feature Coverage

| Feature | No Data State | No Results State | Success State |
|---------|--------------|------------------|---------------|
| Athletes | AthletesEmptyState | AthletesNoResultsState | - |
| Erg | ErgEmptyState | ErgNoResultsState | - |
| Lineup | LineupEmptyState | - | AthletesBankEmptyState |
| Seat Racing | SeatRacingEmptyState | - | - |
| Training | CalendarEmptyState, TrainingPlansEmptyState | - | - |
| Regatta | RegattaEmptyState, RacesEmptyState, RaceDayEmptyState | - | - |

## Commits

| Hash | Description |
|------|-------------|
| 4f51839 | feat(12-11): add Athletes and Erg empty state components |
| 4a2c89b | feat(12-11): add Lineup and Seat Racing empty state components |
| b59040b | feat(12-11): add Training and Regatta empty state components |

## Decisions Made

1. **Enhanced EmptyState with secondaryAction**: Added `secondaryAction` prop to common EmptyState component to support dual CTAs (e.g., Add + Import CSV)

2. **Separate no-data vs no-results components**: Different messaging for "you have no data" vs "your filters returned nothing" helps users take appropriate action

3. **Success empty state for athlete bank**: When all athletes are assigned, show positive feedback instead of empty state

## Verification Results

- [x] POLISH-05: Empty states with illustrations and CTAs for all list views
- [x] All features have empty states: Athletes, Erg, Lineup, Seat Racing, Training, Regatta
- [x] CTAs are actionable and guide users to first action
- [x] Differentiate between "no data" and "no results" states
- [x] All components exported via feature index files

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Empty states are available as components. To integrate:
1. Import from feature index (e.g., `import { AthletesEmptyState } from '@v2/components/athletes'`)
2. Render when data array is empty, passing appropriate callbacks
3. Distinguish between filtered vs unfiltered empty states

Example integration:
```typescript
{athletes.length === 0 ? (
  hasActiveFilters ? (
    <AthletesNoResultsState onClearFilters={clearFilters} />
  ) : (
    <AthletesEmptyState onAddAthlete={openAddModal} onImportCsv={openImportModal} />
  )
) : (
  <AthletesTable athletes={athletes} />
)}
```
