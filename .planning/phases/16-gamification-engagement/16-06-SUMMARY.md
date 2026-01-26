---
phase: 16-gamification-engagement
plan: 06
subsystem: frontend-hooks
tags: [tanstack-query, hooks, gamification, real-time, polling]

# Dependency graph
requires:
  - phase: 16-02
    provides: TypeScript types for gamification entities
  - phase: 16-03
    provides: Achievement API endpoints
  - phase: 16-04
    provides: Personal Records API endpoints
  - phase: 16-05
    provides: Challenge API endpoints
provides:
  - TanStack Query hooks for all gamification features
  - Real-time leaderboard polling with 5s refresh
  - Query key factories for cache invalidation
  - Gamification preference checking before data fetching
affects: [16-08, 16-09, 16-10, frontend-gamification-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Real-time polling with refetchInterval: 5000 and staleTime: 0"
    - "Query key factories for structured cache management"
    - "Feature-gated queries using useShowGamification hook"
    - "Conditional polling based on challenge active status"

key-files:
  created:
    - src/v2/hooks/useGamificationPreference.ts
    - src/v2/hooks/useAchievements.ts
    - src/v2/hooks/usePersonalRecords.ts
    - src/v2/hooks/useChallenges.ts

key-decisions:
  - "Leaderboard uses 5s polling with staleTime: 0 per RESEARCH.md recommendations"
  - "All hooks check gamification preference before enabling queries"
  - "Query key factories follow established V2 pattern from useErgTests"

patterns-established:
  - "Two-level preference check: team-level toggle + athlete-level opt-out"
  - "Immutable staleTime for PR detection (Infinity) vs real-time for leaderboards (0)"
  - "Conditional refetchInterval based on challenge active status"

# Metrics
duration: 3min
completed: 2026-01-26
---

# Phase 16 Plan 06: Gamification TanStack Query Hooks Summary

**TanStack Query hooks for achievements, PRs, and challenges with real-time 5s leaderboard polling and gamification preference checking**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-01-26T22:50:07Z
- **Completed:** 2026-01-26T22:53:00Z
- **Tasks:** 4
- **Files created:** 4

## Accomplishments
- Created gamification preference hook with two-level checking (team toggle + athlete opt-out)
- Implemented achievement hooks with progress tracking, pinning, and manual progress checks
- Added personal records hooks with trend data, team records, and PR celebration detection
- Built challenge hooks with real-time 5s polling for active leaderboards
- All hooks follow established V2 patterns from useErgTests and useFeaturePreference
- Query key factories enable proper cache invalidation across all features

## Task Commits

Each task was committed atomically:

1. **Task 1: Create gamification preference hook** - `9fb87bc` (feat)
2. **Task 2: Create achievement hooks** - `1f513bb` (feat)
3. **Task 3: Create personal records hooks** - `88bb5c7` (feat)
4. **Task 4: Create challenge hooks with polling** - `a40ab81` (feat)

**Plan metadata:** Will be committed with SUMMARY.md

## Files Created/Modified
- `src/v2/hooks/useGamificationPreference.ts` - Two-level gamification enablement check
- `src/v2/hooks/useAchievements.ts` - Achievement CRUD with progress tracking (159 lines)
- `src/v2/hooks/usePersonalRecords.ts` - PR tracking with trends and celebration (143 lines)
- `src/v2/hooks/useChallenges.ts` - Challenge management with real-time leaderboard (261 lines)

## Decisions Made

**Real-time leaderboard polling:** Following RESEARCH.md recommendations, implemented `refetchInterval: 5000` with `staleTime: 0` for leaderboard queries. This provides real-time updates without the complexity of WebSockets. Polling is conditional - stops when challenge is inactive to conserve resources.

**Gamification preference checking:** All hooks check `useShowGamification()` before enabling queries. This respects both team-level feature toggles and per-athlete opt-out preferences, ensuring gamification data is never fetched for athletes who have disabled it.

**Query key factories:** Each hook file exports a query key factory (achievementKeys, prKeys, challengeKeys) following the pattern from useErgTests. This enables proper cache invalidation and structured cache management.

**StaleTime strategy:** Different features use different staleTime values based on data mutability:
- Leaderboards: `staleTime: 0` (always fresh for real-time updates)
- PR detection: `staleTime: Infinity` (immutable once detected)
- Templates: `staleTime: Infinity` (static data)
- Regular data: `staleTime: 2 * 60 * 1000` (2 minutes, standard for dynamic data)
- Team records: `staleTime: 5 * 60 * 1000` (5 minutes, changes rarely)

## Deviations from Plan

None - plan executed exactly as written. All hooks created with specified exports, polling configuration matches RESEARCH.md recommendations, and all hooks properly check gamification preferences before enabling.

## Issues Encountered

None - implementation was straightforward following established patterns from useErgTests.ts and useFeaturePreference.ts.

## User Setup Required

None - hooks are ready for component integration. The API endpoints they connect to were created in plans 16-03, 16-04, and 16-05.

## Verification Results

All success criteria met:

✅ useGamificationPreference.ts exports 2 functions (useGamificationEnabled, useShowGamification)
✅ useAchievements.ts exports 5+ functions with query key factory
✅ usePersonalRecords.ts exports 5+ functions with query key factory
✅ useChallenges.ts exports 10+ functions with query key factory
✅ Leaderboard hook uses `refetchInterval: 5000` for active challenges
✅ Leaderboard hook uses `staleTime: 0` per RESEARCH.md
✅ All hooks check gamification preference before enabling (15 occurrences)
✅ Query key factories enable proper cache invalidation
✅ No TypeScript compilation errors

## Hook Patterns Established

### Two-Level Preference Check
```typescript
const teamEnabled = useFeature('gamification');  // Team-level toggle
const athleteOptedIn = /* query athlete preferences */;  // Per-athlete
const enabled = teamEnabled && athleteOptedIn;  // Both must be true
```

### Real-Time Polling
```typescript
useQuery({
  queryKey: challengeKeys.leaderboard(challengeId),
  queryFn: fetchLeaderboard,
  refetchInterval: isActive ? 5000 : false,  // Conditional polling
  staleTime: 0,  // Always consider stale
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});
```

### Query Key Factories
```typescript
export const achievementKeys = {
  all: ['achievements'] as const,
  list: () => [...achievementKeys.all, 'list'] as const,
  athlete: (id: string) => [...achievementKeys.all, 'athlete', id] as const,
};
```

## Next Phase Readiness

Ready for UI component development. The hooks provide:
- Complete data fetching layer for all gamification features
- Real-time updates for leaderboards
- Automatic cache management with query key factories
- Feature-gated data loading respecting user preferences

Next steps:
- Build achievement badge and progress components (16-08)
- Create PR celebration and sparkline displays (16-09)
- Implement challenge leaderboard with real-time updates (16-10)
- Add shareable card generation with html-to-image (16-11)

---
*Phase: 16-gamification-engagement*
*Completed: 2026-01-26*
