# Plan 11-02 Summary: TanStack Query Hooks

## Status: COMPLETE

## What Was Built

### useRegattas.ts
- `regattaKeys` - Query key factory for cache management
- `useRegattas(options?)` - Fetch list with season/limit filters
- `useRegatta(id)` - Fetch single regatta with full hierarchy
- `useCreateRegatta()` - Create mutation with list invalidation
- `useUpdateRegatta()` - Update mutation with detail cache update
- `useDeleteRegatta()` - Delete mutation with cache cleanup
- `useDuplicateRegatta()` - Duplicate regatta metadata

### useRaces.ts
- `raceKeys` - Query keys for events and races
- `useCreateEvent()` - Create event within regatta
- `useUpdateEvent()` - Update event
- `useDeleteEvent()` - Delete event with cascade
- `useCreateRace()` - Create race within event
- `useUpdateRace()` - Update race
- `useDeleteRace()` - Delete race
- `useAddResult()` - Add single result
- `useBatchAddResults()` - Batch add results (CSV import)
- `useUpdateResult()` - Update result

### useChecklists.ts
- `checklistKeys` - Query keys for templates and race checklists
- `useChecklistTemplates()` - Fetch all templates (10min stale)
- `useCreateChecklistTemplate()` - Create template
- `useUpdateChecklistTemplate()` - Update template
- `useDeleteChecklistTemplate()` - Delete template
- `useRaceChecklist(raceId)` - Fetch race checklist (30s stale)
- `useChecklistProgress(raceId)` - Fetch completion stats
- `useCreateRaceChecklist()` - Create from template
- `useToggleChecklistItem()` - Toggle item completion

### useTeamRankings.ts
- `rankingKeys` - Query keys for rankings
- `useBoatClasses(season?)` - Fetch available boat classes
- `useBoatClassRankings(boatClass, season?)` - Fetch rankings
- `useHeadToHead(opponent, boatClass, season?)` - Fetch H2H comparison
- `useExternalTeams()` - Fetch external team list
- `useExternalRankings(filters?)` - Fetch external rankings
- `useAddExternalRanking()` - Add external ranking
- `useDeleteExternalRanking()` - Delete external ranking
- `useCalculateTeamSpeed()` - Trigger speed recalculation

## Commits
- `37b18dd` - feat(11-02): add TanStack Query hooks for regattas

## Key Decisions
- 5 minute staleTime for regatta data (standard)
- 30 second staleTime for checklists (race day updates)
- 10 minute staleTime for templates (rarely change)
- 30 minute staleTime for external teams (very stable)
- All mutations invalidate appropriate query keys
- Regatta detail cache updated optimistically on update

## Dependencies Satisfied
- Plans 11-03 through 11-09 can now use these hooks
- All API endpoints from 11-00 are covered
