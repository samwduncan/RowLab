---
phase: 17-design-overhaul
plan: 01
subsystem: ui
tags: [tailwind, css-variables, design-tokens, color-palette, rowing-semantic]

# Dependency graph
requires:
  - phase: 12-settings-polish
    provides: Existing design token system in tokens.css and tailwind.config.js
provides:
  - Warm stone color palette (#0F0F0F base)
  - Rowing semantic colors (water, starboard, port, gold, premium)
  - Backwards-compatible neutral aliases
  - Tailwind utility classes for rowing colors
affects: [17-02, 17-03, all-v2-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS variable-backed Tailwind colors
    - Semantic rowing color naming convention

key-files:
  created: []
  modified:
    - src/v2/styles/tokens.css
    - tailwind.config.js

key-decisions:
  - "Stone palette replaces zinc for warm 'Rowing Instrument' aesthetic"
  - "Rowing semantic colors match maritime conventions (port=red, starboard=green)"
  - "Backwards-compatible neutral aliases prevent breaking existing components"

patterns-established:
  - "Semantic rowing colors: water (blue), starboard (green), port (red), gold, premium"
  - "Warm stone scale: 50-950 with #0F0F0F as darkest"

# Metrics
duration: 8min
completed: 2026-01-27
---

# Phase 17 Plan 01: Warm Color Palette Foundation Summary

**Warm stone palette (#0F0F0F base) and rowing semantic colors (water/starboard/port/gold/premium) for "Rowing Instrument" aesthetic**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-27T16:15:00Z
- **Completed:** 2026-01-27T16:23:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Replaced cool zinc-based neutrals with warm stone-based neutrals (#0F0F0F dark base)
- Added rowing semantic accent colors with meaningful associations (water=blue, starboard=green, port=red, gold=achievements, premium=purple)
- Maintained backwards compatibility via neutral aliases that reference stone values
- Updated void scale in Tailwind to match warm stone palette
- Added `warm` and `rowing` color scales to Tailwind for utility class access

## Task Commits

Each task was committed atomically:

1. **Task 1-3: Update tokens.css and tailwind.config.js** - `14bd730` (feat)

Note: tokens.css changes were previously committed in an earlier session as part of the execution sequence. This commit completed the tailwind.config.js updates.

## Files Created/Modified

- `src/v2/styles/tokens.css` - Added warm stone palette (stone-50 through stone-950), rowing semantic accents, backwards-compatible neutral aliases, updated all semantic tokens to use stone palette
- `tailwind.config.js` - Added `rowing` color scale with CSS variable references, added `warm` color scale, updated `void` scale to warm values, updated port/starboard to use CSS variables

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Stone palette replaces zinc for warm aesthetic | CONTEXT.md specifies warm near-black (#0F0F0F) instead of cool (#0a0a0a) for premium feel |
| Rowing semantic colors match maritime conventions | port=red, starboard=green are standard maritime/rowing conventions, intuitive for coaches |
| CSS variable-backed Tailwind colors | Enables theme switching without Tailwind rebuild, consistent with existing token system |
| Backwards-compatible neutral aliases | Prevents breaking ~100+ existing component references to palette-neutral-* variables |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- tokens.css changes were already committed in a previous session (discovered during execution)
- Confirmed all required changes were present and completed the remaining tailwind.config.js updates

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Warm color foundation complete for all theme updates
- Ready for 17-02 (Typography tokens) - tokens.css already has font token structure
- Ready for 17-03 (Theme files) - dark.css, light.css, field.css can now reference stone palette

---
*Phase: 17-design-overhaul*
*Completed: 2026-01-27*
