---
phase: 12-settings-photos-polish
plan: 02
subsystem: ui
tags: [tanstack-query, typescript, settings, integrations, concept2, strava]

# Dependency graph
requires:
  - phase: 06-athletes-roster
    provides: TanStack Query patterns (useAthletes)
  - phase: 07-erg-data-performance
    provides: useConcept2 integration pattern
provides:
  - TypeScript settings types for user profile, preferences, team visibility
  - useSettings and useUpdateSettings hooks for user settings
  - useTeamSettings and useUpdateTeamVisibility hooks for owner-only settings
  - useIntegrations hooks (C2, Strava) for connection status and sync
  - useC2SyncConfig for Concept2-to-Strava sync configuration
affects: [12-03, 12-04, 12-05, 12-06, settings-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [settings-query-keys, integration-query-keys, optimistic-updates-pattern]

key-files:
  created:
    - src/v2/types/settings.ts
    - src/v2/hooks/useSettings.ts
    - src/v2/hooks/useTeamSettings.ts
    - src/v2/hooks/useIntegrations.ts
  modified: []

key-decisions:
  - "Hooks placed in src/v2/hooks/ following existing codebase pattern rather than feature-specific directory"
  - "5-minute staleTime for all settings queries consistent with Phase 7 C2 status pattern"
  - "useAuthStore for authentication state instead of accessToken parameter"

patterns-established:
  - "settingsKeys query key factory for cache invalidation"
  - "teamSettingsKeys for owner-only settings cache"
  - "integrationKeys nested structure (c2.status, strava.status, c2.syncConfig)"

# Metrics
duration: 8min
completed: 2026-01-25
---

# Phase 12 Plan 02: Settings Types and Hooks Summary

**TanStack Query hooks for settings data layer with TypeScript types, user settings, team visibility, and C2/Strava integrations**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-25T17:18:40Z
- **Completed:** 2026-01-25T17:26:45Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- TypeScript interfaces for user profile, preferences, team visibility, and integration status
- useSettings/useUpdateSettings hooks with optimistic updates for user settings
- useTeamSettings/useUpdateTeamVisibility for owner-only team visibility settings
- Complete Concept2 integration hooks (status, connect, disconnect, sync)
- Complete Strava integration hooks (status, connect, disconnect, sync)
- C2-to-Strava sync configuration hooks (useC2SyncConfig, useUpdateC2SyncConfig, useSyncC2ToStrava)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create settings TypeScript types** - `b65de92` (feat)
2. **Task 2: Create useSettings hook** - `05fa895` (feat)
3. **Task 3: Create useTeamSettings and useIntegrations hooks** - `8570758` (feat)

## Files Created/Modified
- `src/v2/types/settings.ts` - TypeScript interfaces for all settings data (UserProfile, UserPreferences, TeamVisibility, IntegrationStatus, C2SyncConfig)
- `src/v2/hooks/useSettings.ts` - useSettings/useUpdateSettings with optimistic updates
- `src/v2/hooks/useTeamSettings.ts` - useTeamSettings/useUpdateTeamVisibility for OWNER role
- `src/v2/hooks/useIntegrations.ts` - Complete C2 and Strava integration hooks including sync

## Decisions Made
- **Hooks in src/v2/hooks/**: Plan specified feature-specific directory but followed existing codebase pattern where all V2 hooks are in shared hooks directory
- **useAuthStore instead of accessToken param**: Plan suggested passing accessToken, but existing hooks (useAthletes, useConcept2) use useAuthStore directly which is cleaner
- **5-minute staleTime for all queries**: Consistent with Phase 7 C2 status pattern, matches existing integration hooks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adjusted hook location pattern**
- **Found during:** Task 1 (settings types)
- **Issue:** Plan specified `src/v2/features/settings/types/` but codebase uses `src/v2/types/`
- **Fix:** Created files in existing pattern locations
- **Files modified:** src/v2/types/settings.ts, src/v2/hooks/*.ts
- **Verification:** Files created successfully, consistent with codebase
- **Committed in:** b65de92 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added TeamSettings interface**
- **Found during:** Task 1 (settings types)
- **Issue:** Team settings API returns `{ visibility: TeamVisibility }` not just TeamVisibility
- **Fix:** Added TeamSettings interface wrapping visibility
- **Files modified:** src/v2/types/settings.ts
- **Verification:** Types match V1 SettingsPage API response structure
- **Committed in:** b65de92 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None - pre-existing TypeScript errors in codebase (node_modules, V1 code) don't affect new V2 types/hooks.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Settings data layer complete, ready for UI components
- useSettings provides user profile and preferences data
- useTeamSettings provides owner-only team visibility controls
- useIntegrations provides all C2/Strava connection management
- All hooks follow established TanStack Query patterns from Phase 6-11

---
*Phase: 12-settings-photos-polish*
*Completed: 2026-01-25*
