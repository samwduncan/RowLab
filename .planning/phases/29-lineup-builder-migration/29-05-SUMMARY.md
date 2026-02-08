---
phase: 29-lineup-builder-migration
plan: 05
subsystem: lineup-builder
tags: [verification, design-compliance, bug-fixes, v1-v2-bridge]
requires: [29-01, 29-02, 29-03, 29-04]
provides:
  - V3 design token compliance across all lineup components
  - Null-safe lineup data normalization at API layer
  - Correct V1 store assignment tracking in AthleteBank
  - Proper loading states (isFetched guard for disabled queries)
affects: []
tech-stack:
  added: []
  patterns:
    - API-layer data normalization (assignments || [])
    - isFetched guard for TanStack Query disabled queries
    - Design token compliance (data-poor, data-excellent, data-warning, status-error)
key-files:
  created: []
  modified:
    - src/v2/components/lineup/AthleteBank.tsx
    - src/v2/components/lineup/MobileSeatSlot.tsx
    - src/v2/components/lineup/SeatSlot.tsx
    - src/v2/components/lineup/VersionHistory.tsx
    - src/v2/components/lineup/LineupWorkspace.tsx
    - src/v2/features/search/services/searchService.ts
    - src/v2/hooks/useAthletes.ts
    - src/v2/hooks/useLineups.ts
decisions:
  - id: api-normalize-assignments
    title: Normalize lineup.assignments to [] at fetch layer
    rationale: API may return null for assignments field; normalizing at fetchLineups/fetchLineup protects all downstream consumers
  - id: v1-store-assignment-tracking
    title: AthleteBank reads V1 lineupStore for assignment tracking
    rationale: Drag-drop assignments go to V1 Zustand store, not V2 TanStack Query cache; AthleteBank must read activeBoats to correctly filter available athletes
  - id: isFetched-loading-guard
    title: Use isFetched alongside isLoading for disabled queries
    rationale: TanStack Query v5 isLoading is false for disabled queries (auth not ready), but data is undefined; isFetched correctly indicates data availability
  - id: deferred-pdf-export
    title: PDF export deferred as GitHub #2
    rationale: PrintableLineup expects V2 BoatInstance[] but receives V1 ActiveBoat[] — data shape mismatch requires mapping adapter, not blocking for phase completion
---

## Summary

Plan 29-05 performed the final V3 design compliance audit and human verification of the lineup builder migration. This plan uncovered and fixed several critical V1/V2 data disconnect bugs that only manifested during real-user testing.

## Bugs Fixed

### 1. AthleteBank duplicate assignments (commit 18841e3)
AthleteBank was filtering athletes via `draft.assignments` from V2 TanStack Query hook, but drag-drop assignments go to V1 Zustand `lineupStore.activeBoats`. Athletes could be assigned to multiple seats. Fix: read `activeBoats` from V1 store to extract assigned IDs.

### 2. False "All athletes assigned" message (commits 10d4fd6, 282606b)
Two causes: (a) skeleton loading not shown when TanStack Query is disabled (auth not ready), and (b) no distinction between "no athletes exist" vs "all assigned". Fix: added `isFetched` to useAthletes return, show skeleton until data actually arrives, separate empty state messages.

### 3. Save crash — lineup.assignments undefined (commits 790ca37, 282606b)
`VersionHistory.getBoatCount()` and `searchService.lineupsToSearchResults()` crashed on `lineup.assignments.length` when assignments was null from API. Additionally, save passed empty assignments because `draft?.assignments` was always empty for new lineups. Fix: normalize assignments to `[]` at API fetch layer, derive `currentAssignments` from V1 store in LineupWorkspace.

### 4. Missing props between workspace and children (commit 50ac918)
Phase 29 sub-agents migrated child components to be prop-driven but didn't update LineupWorkspace to pass required props (boats, assignments, onLoadLineup, boatConfigs, onAddBoat). Fix: wired all props with proper defaults.

## Design Compliance

- Replaced `bg-red-500/10 text-red-600` with `bg-data-poor/10 text-data-poor` (Port side)
- Replaced `bg-green-500/10 text-green-600` with `bg-data-excellent/10 text-data-excellent` (Starboard side)
- Replaced `border-green-500 bg-green-500/5` with `border-data-excellent bg-data-excellent/5` (valid drop zone)
- Replaced `border-amber-500 bg-amber-500/5` with `border-data-warning bg-data-warning/5` (warning drop zone)
- Replaced `bg-red-500 hover:bg-red-600` with `bg-status-error hover:bg-status-error/90` (delete button)
- No hardcoded spring values found — all use imported constants
- Spinners only used for button loading states (acceptable per design standard)
- Build succeeds, no new TypeScript errors

## Deferred

- PDF export (GitHub #2): `PrintableLineup` expects V2 `BoatInstance[]` but receives V1 `ActiveBoat[]`

## Commits

| Commit | Description |
|--------|-------------|
| 50ac918 | Wire missing props between workspace and children |
| 18841e3 | AthleteBank tracks V1 store assignments |
| 10d4fd6 | Skeleton loading state for athlete bank |
| 790ca37 | Fix save crash, derive assignments from V1 store |
| 282606b | Design compliance audit and null-safe lineup data |
| 5aa009d | Doc updates (CLAUDE.md rule, STATE.md progress) |
