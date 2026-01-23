---
phase: 01-clean-room-setup
plan: 01
subsystem: ui
tags: [tailwind, css, design-tokens, clean-room, v2-foundation]

# Dependency graph
requires: []
provides:
  - V2 directory structure (src/v2/pages, components, layouts, styles)
  - Three-level design token system with dark/light/field themes
  - Tailwind V2 config with .v2 selector isolation
  - @v2 path alias in Vite config
  - BetaHome placeholder page
affects: [01-clean-room-setup, routing, ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Three-level CSS token system (palette → semantic → component)"
    - "Selector-based CSS isolation (important: '.v2')"
    - "Clean room V2 development alongside V1"

key-files:
  created:
    - src/v2/styles/tokens.css
    - src/v2/styles/v2.css
    - src/v2/pages/BetaHome.tsx
    - tailwind.v2.config.js
  modified:
    - vite.config.ts

key-decisions:
  - "Use selector strategy (important: '.v2') for CSS isolation instead of separate build"
  - "Establish three-level token system: base palette → semantic → component"
  - "Support three themes: dark (default), light, field (high-contrast outdoor)"
  - "Preserve V1 tailwind.config.js unchanged"

patterns-established:
  - "V2 styles scoped under .v2 class via Tailwind important selector"
  - "Design tokens as CSS custom properties with theme data attributes"
  - "@v2 path alias for clean imports"

# Metrics
duration: 7min
completed: 2026-01-23
---

# Phase 01 Plan 01: V2 Foundation Setup Summary

**V2 clean room established with CSS-isolated Tailwind config, three-level design tokens (dark/light/field themes), and BetaHome placeholder**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-23T01:40:49Z
- **Completed:** 2026-01-23T01:48:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Created src/v2/ directory structure with organized subdirectories
- Established three-level design token system (47 palette references)
- Configured Tailwind V2 with complete CSS isolation via .v2 selector
- Added @v2 path alias to Vite for clean imports
- Created BetaHome placeholder page for route testing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create V2 Directory Structure** - `a2de33c` (feat)
2. **Task 2: Create Design Tokens CSS** - `78df4ca` (feat)
3. **Task 3: Create V2 Tailwind Config** - `fe0728f` (feat)

## Files Created/Modified

### Created
- `src/v2/pages/BetaHome.tsx` - Placeholder V2 home page with sample content
- `src/v2/components/.gitkeep` - Track empty components directory
- `src/v2/layouts/.gitkeep` - Track empty layouts directory
- `src/v2/styles/tokens.css` - Three-level design token system with theme support
- `src/v2/styles/v2.css` - V2 styles entry point importing tokens and Tailwind
- `tailwind.v2.config.js` - V2 Tailwind config with .v2 selector isolation

### Modified
- `vite.config.ts` - Added @v2 path alias

## Decisions Made

1. **Selector strategy for CSS isolation:** Used `important: '.v2'` in Tailwind config to scope all utilities under .v2 class. This ensures complete isolation between V1 and V2 without separate builds.

2. **Three-level token system:** Established base palette → semantic tokens → component tokens pattern for maintainable design system.

3. **Three theme support:** Implemented dark (default), light, and field (high-contrast outdoor) themes via data-theme attribute selectors.

4. **Preserve V1 unchanged:** V1 tailwind.config.js remains untouched - V2 uses separate config file.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 1 Plan 2:** V2 routing and layout implementation.

V2 foundation complete with:
- Directory structure in place
- Design tokens defined
- Tailwind config isolated
- Path aliases configured
- Placeholder page ready for route testing

Next steps:
- Add V2 route to React Router
- Create V2Layout wrapper with .v2 class
- Verify CSS isolation works in browser

---
*Phase: 01-clean-room-setup*
*Completed: 2026-01-23*
