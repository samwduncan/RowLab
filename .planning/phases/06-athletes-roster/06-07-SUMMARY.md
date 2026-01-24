---
phase: 06-athletes-roster
plan: 07
subsystem: ui
tags: [css, theming, design-tokens, theme-switcher]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: V2 design token system with theme support
provides:
  - Fixed CSS theme cascade for light and field themes
  - All three themes (dark, light, field) render correctly
  - High-contrast field theme for outdoor visibility
affects: [athletes-roster, all v2 features using theme system]

# Tech tracking
tech-stack:
  added: []
  patterns: [Always apply data-theme attribute for CSS cascade to work]

key-files:
  created: []
  modified:
    - src/v2/layouts/V2Layout.tsx
    - src/v2/styles/tokens.css

key-decisions:
  - "Always apply data-theme attribute for all themes (including dark)"
  - "Use explicit CSS selectors for each theme: .v2[data-theme=\"X\"]"
  - "Field theme uses high-contrast amber/yellow colors for outdoor visibility"

patterns-established:
  - "CSS cascade pattern: .v2[data-theme=\"X\"] selectors for all themes"
  - "Theme attribute must always be present, never undefined"

# Metrics
duration: 7min
completed: 2026-01-24
---

# Phase 06 Plan 07: Theme System CSS Cascade Fix Summary

**Fixed CSS theme cascade by applying data-theme attribute to all themes and adding explicit CSS selectors for dark, light, and field themes**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-24T15:38:57Z
- **Completed:** 2026-01-24T15:45:51Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- V2Layout now applies data-theme attribute for all themes (removed conditional)
- Added explicit CSS selector for dark theme (.v2[data-theme="dark"])
- Updated light theme with improved token values
- Replaced field theme with high-contrast amber/yellow outdoor design

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix V2Layout data-theme attribute** - `4038e25` (fix)
2. **Task 2: Add theme-specific CSS selectors** - `0cf8a41` (feat - included in attendance schema commit)

## Files Created/Modified
- `src/v2/layouts/V2Layout.tsx` - Removed conditional data-theme logic, now always applies theme attribute
- `src/v2/styles/tokens.css` - Added dark theme selector, updated light theme, replaced field theme with high-contrast outdoor design

## Decisions Made

**1. Always apply data-theme attribute**
- Previously: `data-theme={theme === 'dark' ? undefined : theme}` set undefined for dark theme
- Now: `data-theme={theme}` applies attribute for all themes
- Rationale: CSS selectors like `.v2[data-theme="dark"]` require the attribute to match

**2. Explicit CSS selectors for all themes**
- Added `.v2[data-theme="dark"]` selector matching `:root` defaults
- Ensures all themes have explicit CSS rules for proper cascade
- Rationale: Theme system needs predictable cascade behavior

**3. High-contrast field theme design**
- Changed from dark high-contrast to amber/yellow outdoor theme
- Background: #fef3c7 (amber-100), #fffbeb (amber-50)
- Text: #1c1917 (stone-900) for maximum contrast
- Rationale: Outdoor rowing needs high visibility in bright sunlight

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**CSS changes accidentally included in later commit**
- Task 2 CSS changes were committed as part of 0cf8a41 (attendance schema commit)
- This occurred because another agent executed plans 06-01 through 06-03 before this plan
- Impact: No functional issue, just commit organization. Changes are correctly committed.
- Resolution: Documented in summary, both commits tracked

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for athlete roster implementation:**
- Theme system fully functional with all three themes working
- Light theme provides clean indoor interface
- Field theme provides high-contrast outdoor visibility
- Dark theme remains default for low-light environments

**Verification notes:**
- Theme toggle in V2 header cycles through all three themes
- Theme preference persists in localStorage
- All theme tokens properly cascade through CSS selectors

---
*Phase: 06-athletes-roster*
*Completed: 2026-01-24*
