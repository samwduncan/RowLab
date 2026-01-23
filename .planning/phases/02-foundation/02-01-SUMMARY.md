---
phase: 02-foundation
plan: 01
subsystem: state-management
tags: [zustand, react, hooks, context, theme, typescript]

# Dependency graph
requires:
  - phase: 01-clean-room-setup
    provides: V2 directory structure, path aliases, CSS isolation strategy
provides:
  - Context store for persona switching (me/coach/admin)
  - Theme hook with system preference detection and localStorage persistence
  - Shared store integration layer for V1/V2 bridging
affects: [02-02-shell-layout, 02-03-context-rail, 02-04-workspace-sidebar]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand persist middleware for context state"
    - "System preference detection with window.matchMedia"
    - "Store instance sharing via React Context (avoids re-render loops)"

key-files:
  created:
    - src/v2/types/context.ts
    - src/v2/stores/contextStore.ts
    - src/v2/hooks/useTheme.ts
    - src/v2/hooks/useSharedStores.ts
  modified: []

key-decisions:
  - "Default context: 'me' (athlete view)"
  - "localStorage key: 'v2-context' for context state persistence"
  - "localStorage key: 'v2-theme' for theme preference persistence"
  - "Share Zustand store instances via Context, not values (Pattern from 02-RESEARCH.md)"
  - "Theme defaults to system preference when no localStorage override exists"

patterns-established:
  - "Pattern 1: Context-aware navigation - each persona (me/coach/admin) has distinct nav items"
  - "Pattern 2: System preference + manual override - theme respects OS settings but allows user choice"
  - "Pattern 3: Store instance sharing - createContext(useAuthStore) not createContext(useAuthStore())"

# Metrics
duration: 3min
completed: 2026-01-23
---

# Phase 02 Plan 01: Context Store, Theme Hook, Shared Stores Summary

**Zustand context store with persona switching, theme management with system preference detection, and V1/V2 store bridging via React Context**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T13:52:41Z
- **Completed:** 2026-01-23T13:55:49Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Context store manages three personas (me/coach/admin) with navigation config for each
- Theme hook detects system preference (prefers-color-scheme) and respects manual overrides
- Shared stores hook enables V2 components to access V1 auth and settings stores without re-render loops

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Context Types and Store** - `1dbe236` (feat)
2. **Task 2: Create Theme Hook with System Preference** - `8f857ad` (feat)
3. **Task 3: Create Shared Stores Hook for V1/V2 Integration** - `e9d9fc5` (feat)

## Files Created/Modified

- `src/v2/types/context.ts` - TypeScript types for Context system (Context, NavItem, ContextConfig)
- `src/v2/stores/contextStore.ts` - Zustand store for active persona with navigation configs and persist middleware
- `src/v2/hooks/useTheme.ts` - Theme management hook with system preference detection and localStorage
- `src/v2/hooks/useSharedStores.ts` - React Context integration for V1 store access from V2 components

## Decisions Made

1. **Default to 'me' context** - Athlete view is the primary use case, coaches/admins are power users
2. **System preference as default** - Respects OS dark mode unless user explicitly overrides
3. **Store instance sharing pattern** - Share `useAuthStore` function via Context, not `useAuthStore()` values (avoids Zustand re-render loop pitfall documented in 02-RESEARCH.md Pattern 1)
4. **Three-theme support** - dark/light/field matches Phase 1 token system design

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**1. TypeScript path alias resolution**
- **Issue:** `@/store/authStore` import failed in TypeScript compilation
- **Cause:** `.js` file extensions not recognized by tsc with path aliases
- **Solution:** Used relative imports `../../store/authStore` instead
- **Impact:** Minor - imports work correctly, pattern consistent with file system structure

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02:**
- Context store provides `useContextStore` hook for ContextRail component
- Theme hook provides `useTheme` for ShellLayout theme application
- Shared stores provide `useV2Auth` and `useV2Settings` for all V2 components
- Navigation configs (CONTEXT_CONFIGS) ready for WorkspaceSidebar component

**No blockers.**

**Pattern note:** ShellLayout will need to wrap with `AuthStoreContext.Provider` and `SettingsStoreContext.Provider` using the exported context objects from useSharedStores.ts.

---
*Phase: 02-foundation*
*Completed: 2026-01-23*
