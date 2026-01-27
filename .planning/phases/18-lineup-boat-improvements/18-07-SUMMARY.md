---
phase: 18-lineup-boat-improvements
plan: 07
subsystem: api
tags: [tanstack-query, react-hooks, cache-management, typescript]

# Dependency graph
requires:
  - phase: 18-02
    provides: Rigging types and API routes
  - phase: 18-03
    provides: Lineup template types and API
  - phase: 18-04
    provides: Equipment assignment types and API
  - phase: 18-05
    provides: Equipment conflict detection API
  - phase: 18-06
    provides: Lineup search types and API
provides:
  - TanStack Query hooks for rigging profiles (CRUD operations)
  - TanStack Query hooks for lineup templates (CRUD + apply)
  - TanStack Query hooks for equipment (availability, assignments, conflicts)
  - TanStack Query hook for historical lineup search with URL helpers
  - Query key factories for granular cache invalidation
affects: [phase-18-08, phase-18-09, phase-18-10, phase-18-11, ui-components, lineup-builder]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Query key factories for hierarchical cache management
    - Mutation invalidation patterns for related queries
    - keepPreviousData for smooth search UX

key-files:
  created:
    - src/v2/hooks/useRiggingProfiles.ts
    - src/v2/hooks/useLineupTemplates.ts
    - src/v2/hooks/useEquipment.ts
    - src/v2/hooks/useLineupSearch.ts
  modified: []

key-decisions:
  - "Used query key factories for all hooks to enable targeted cache invalidation"
  - "Equipment queries have 30s staleTime (frequently changing), rigging has 5min (relatively stable)"
  - "Lineup search uses keepPreviousData for smooth pagination/filtering transitions"
  - "Equipment mutations invalidate multiple query keys (availability, assignments, lineup-specific)"

patterns-established:
  - "Query key factories: hierarchical structure enabling partial invalidation (riggingKeys.all, riggingKeys.profile(id))"
  - "Mutation onSuccess: invalidate related queries to maintain cache consistency"
  - "URL param helpers for deep linking: parseSearchFiltersFromUrl/buildSearchParamsFromFilters"

# Metrics
duration: 2m 39s
completed: 2026-01-27
---

# Phase 18 Plan 07: TanStack Query Hooks Summary

**Four TanStack Query hook modules providing type-safe, cached access to rigging, templates, equipment, and lineup search APIs with granular cache management**

## Performance

- **Duration:** 2m 39s
- **Started:** 2026-01-27T13:15:01Z
- **Completed:** 2026-01-27T13:17:40Z
- **Tasks:** 3
- **Files created:** 4

## Accomplishments
- Created rigging profile hooks with CRUD operations and defaults query
- Created lineup template hooks with CRUD, from-lineup creation, and apply functionality
- Created equipment hooks with availability checking, assignment management, and conflict detection
- Created lineup search hook with URL param helpers for deep linking and bookmarking

## Task Commits

Each task was committed atomically:

1. **Task 1: Create rigging hooks** - `f49ff40` (feat)
2. **Task 2: Create template and equipment hooks** - `b1fdcb8` (feat)
3. **Task 3: Create lineup search hook** - `6574143` (feat)

## Files Created/Modified

### Created
- `src/v2/hooks/useRiggingProfiles.ts` - Rigging profile CRUD hooks with query key factory (riggingKeys)
  - useDefaultRigging: Query default rigging values (staleTime: Infinity)
  - useTeamRiggingProfiles: Query all team profiles
  - useRiggingProfile: Query shell-specific profile
  - useSaveRiggingProfile: Mutation for create/update with invalidation
  - useDeleteRiggingProfile: Mutation to revert to defaults with invalidation

- `src/v2/hooks/useLineupTemplates.ts` - Lineup template CRUD hooks with query key factory (templateKeys)
  - useLineupTemplates: Query templates with optional boat class filter
  - useLineupTemplate: Query single template by ID
  - useCreateTemplate: Mutation to create new template
  - useCreateTemplateFromLineup: Mutation to convert existing lineup to template
  - useUpdateTemplate: Mutation for template updates with invalidation
  - useDeleteTemplate: Mutation to delete template with invalidation
  - useApplyTemplate: Mutation to apply template and get assignments

- `src/v2/hooks/useEquipment.ts` - Equipment hooks with query key factory (equipmentKeys)
  - useEquipmentAvailability: Query availability for date (30s staleTime)
  - useEquipmentAssignments: Query assignments by date
  - useLineupEquipmentAssignments: Query assignments by lineup ID
  - useCreateEquipmentAssignment: Mutation with multi-key invalidation
  - useDeleteEquipmentAssignment: Mutation with full equipment cache invalidation
  - useCheckConflicts: Mutation to detect double-booking conflicts

- `src/v2/hooks/useLineupSearch.ts` - Historical lineup search hook (lineupSearchKeys)
  - useLineupSearch: Query with multi-criteria filtering and keepPreviousData
  - parseSearchFiltersFromUrl: Helper to parse URLSearchParams into filters
  - buildSearchParamsFromFilters: Helper to build URLSearchParams for sharing

## Decisions Made

1. **Query key factories**: Each hook module exports a query key factory object following the pattern from TanStack Query best practices. This enables:
   - Targeted invalidation (e.g., invalidate one profile vs all profiles)
   - Hierarchical cache structure (equipmentKeys.all → equipmentKeys.availability)
   - Type safety for query keys

2. **Stale time strategy**:
   - Equipment: 30s (status changes frequently - boats getting assigned/returned)
   - Rigging: 5min (profiles change infrequently)
   - Defaults: Infinity (never stale - boat class standards don't change)
   - Search: 2min (balance between freshness and cache hits)

3. **Mutation invalidation patterns**:
   - Single-entity mutations: Invalidate both specific and list queries
   - Equipment mutations: Invalidate availability + assignments + lineup-specific
   - Delete operations: Broader invalidation (equipment deletes invalidate all equipment queries)

4. **keepPreviousData for search**: Lineup search uses keepPreviousData (TanStack Query v5) to keep previous results visible during filter changes, preventing flash of loading state

5. **URL param helpers**: Provided bidirectional conversion functions for lineup search to enable:
   - Deep linking to specific searches
   - Bookmarking search configurations
   - Sharing searches via URL

6. **Import paths**: Used relative imports (`../../store/authStore`, `../types/rigging`) following existing project patterns from useAthletes.ts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All hooks compiled without TypeScript errors and follow existing project patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for UI integration:**
- All Phase 18 APIs now have corresponding TanStack Query hooks
- Query key factories enable efficient cache management
- Mutations handle cache invalidation automatically
- Search hook supports deep linking for shareable URLs

**Integration points:**
- Rigging editor can use useRiggingProfile + useSaveRiggingProfile
- Template manager can use useLineupTemplates + CRUD mutations
- Equipment picker can use useEquipmentAvailability + useCheckConflicts
- Lineup search UI can use useLineupSearch + URL helpers

**No blockers** - all hooks are type-safe and ready for component consumption.

---
*Phase: 18-lineup-boat-improvements*
*Completed: 2026-01-27*
