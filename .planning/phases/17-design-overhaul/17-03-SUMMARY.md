---
phase: 17
plan: 03
subsystem: design-system
tags: [css, theming, warm-palette, stone-colors, dark-mode, light-mode, field-mode]
dependency-graph:
  requires:
    - 17-01 (warm stone palette in tokens.css)
  provides:
    - Warm stone theme implementations for dark, light, and field themes
    - Complete component token coverage in all themes
  affects:
    - All V2 components using CSS custom properties
    - User interface color warmth across all themes
tech-stack:
  patterns:
    - CSS custom properties inheritance
    - Theme-specific selector scoping (.v2[data-theme="X"])
    - Consistent component token naming
key-files:
  modified:
    - src/v2/styles/themes/dark.css
    - src/v2/styles/themes/light.css
    - src/v2/styles/themes/field.css
decisions:
  - id: THEME-01
    choice: Explicit stone palette variable references
    rationale: Clear documentation of warm colors vs implicit neutral aliases
  - id: THEME-02
    choice: Warm rgba shadows in dark theme using rgba(15, 15, 15)
    rationale: Matches warm near-black base color (#0F0F0F) for cohesive appearance
  - id: THEME-03
    choice: Field theme keeps hardcoded hex values for stone colors
    rationale: Consistency with existing amber hex values, clearer outdoor-specific documentation
  - id: THEME-04
    choice: Added rowing semantic accents for field theme
    rationale: High-contrast versions of port/starboard/water/gold for outdoor visibility
metrics:
  duration: 2 minutes
  completed: 2026-01-27
---

# Phase 17 Plan 03: Theme Warm Stone Updates Summary

**One-liner:** Updated dark, light, and field themes with warm stone palette for cohesive "Rowing Instrument" aesthetic

## What Was Done

### Task 1: Update dark.css with Warm Stone Palette
- Changed background tokens to use `--palette-stone-950` (#0F0F0F) for base
- Updated text tokens to use `--palette-stone-100` (#F5F5F4) for warm off-white
- Changed shadow tokens to use `rgba(15, 15, 15)` for warm black
- Updated all component tokens (card, button, input) to reference stone palette
- Added "Rowing Instrument" aesthetic documentation

**Commit:** `099a7e2`

### Task 2: Update light.css with Warm Stone Palette
- Changed background tokens to use `--palette-stone-50` (#FAFAF9) for warm white
- Updated text tokens to use `--palette-stone-950` (#0F0F0F) for warm near-black
- Updated overlay to use `rgba(250, 250, 249, 0.9)` for warm tint
- Updated all component tokens to reference stone palette
- Added "Rowing Instrument" aesthetic documentation

**Commit:** `6164d07`

### Task 3: Polish field.css with Rowing Semantic Accents
- Maintained amber backgrounds for high-contrast outdoor visibility
- Ensured stone text colors for maximum contrast (stone-900 for primary)
- Added rowing semantic accent colors for field use:
  - `--palette-rowing-water-field`: blue-700
  - `--palette-rowing-starboard-field`: green-700
  - `--palette-rowing-port-field`: red-700
  - `--palette-rowing-gold-field`: amber-700
- Ensured complete component token coverage
- Added "Rowing Instrument" outdoor mode documentation

**Commit:** `11e5bf9`

## Verification Results

All verification criteria passed:
1. dark.css uses `--palette-stone-950` for bg-base
2. dark.css uses `--palette-stone-100` for text-primary
3. light.css uses `--palette-stone-50` for bg-base
4. light.css uses `--palette-stone-950` for text-primary
5. field.css maintains amber backgrounds with stone text
6. All themes have complete component token coverage
7. No `palette-neutral` references remain in theme files

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

| File | Changes |
|------|---------|
| `src/v2/styles/themes/dark.css` | Updated to warm stone palette, warm shadows |
| `src/v2/styles/themes/light.css` | Updated to warm stone palette, warm overlay |
| `src/v2/styles/themes/field.css` | Added rowing semantic accents, polished documentation |

## Next Phase Readiness

**Ready for:** Plan 17-04 (Component Library Updates)

All themes now use the warm stone palette, providing the foundation for consistent component styling.
