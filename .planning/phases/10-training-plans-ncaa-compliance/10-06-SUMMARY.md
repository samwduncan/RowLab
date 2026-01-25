---
phase: 10-training-plans-ncaa-compliance
plan: 06
subsystem: training-ui
status: complete
tags: [training, periodization, forms, react, typescript]

requires:
  - 10-01 (PeriodizationBlock, PeriodizationPhase types, getPeriodizationColor)

provides:
  - PeriodizationTimeline visual component
  - BlockForm for creating/editing periodization blocks
  - TemplateApplicator for applying workout templates

affects:
  - Future periodization UI integration
  - Training plan wizard (will use BlockForm and TemplateApplicator)
  - Calendar view (may display periodization blocks)

tech-stack:
  added: []
  patterns:
    - react-hook-form + Zod validation for complex forms
    - Visual phase selection with color-coded radio buttons
    - Conflict detection for template application
    - Duration validation with guideline warnings

key-files:
  created:
    - src/v2/components/training/periodization/PeriodizationTimeline.tsx
    - src/v2/components/training/periodization/BlockForm.tsx
    - src/v2/components/training/periodization/TemplateApplicator.tsx
    - src/v2/components/training/periodization/index.ts
  modified: []

decisions:
  - decision: Visual radio button grid for phase selection
    rationale: Color-coded phase selection (blue base, amber build, red peak, green taper) provides immediate visual feedback matching timeline colors
    context: BlockForm phase selection UI

  - decision: Duration guidelines as warnings, not blockers
    rationale: Coaches may have valid reasons for non-standard block durations, yellow warning informs without preventing creation
    context: BlockForm validation strategy

  - decision: Conflict detection shows first 5 workouts with expand/collapse
    rationale: Large date ranges could have dozens of conflicts, preview prevents UI clutter while showing enough info for decision
    context: TemplateApplicator conflict display

  - decision: Replace existing as opt-in checkbox
    rationale: Default behavior preserves existing workouts (safer), coach explicitly chooses to replace when needed
    context: TemplateApplicator conflict resolution

  - decision: Focus areas as multi-select toggle buttons
    rationale: More engaging than checkboxes, shows selected state clearly, easier to tap on mobile than small checkboxes
    context: BlockForm UX pattern

metrics:
  duration: "4m 32s"
  completed: 2026-01-25
---

# Phase 10 Plan 06: Periodization Management Components Summary

**One-liner:** Visual timeline, block creation form, and template applicator for macro training cycle management with phase-based validation

## Overview

Created three core periodization components for training phase planning: a visual timeline displaying periodization blocks with date ranges, a comprehensive form for creating/editing blocks with phase-specific validation, and a template applicator with conflict detection for applying workout templates to date ranges.

## What Was Built

### PeriodizationTimeline Component (190 lines)

Visual timeline component showing periodization blocks:

- **Position calculation**: Converts ISO date ranges to percentage-based CSS positioning
- **Phase visualization**: Color-coded blocks (base=blue, build=amber, peak=red, taper=green)
- **Today indicator**: Red vertical line with dot showing current date position
- **Current phase display**: Text label below timeline showing active phase name
- **Week duration badges**: Shows "Xw" label for blocks 2+ weeks
- **Background grid**: Visual week markers for scale reference
- **Interactive blocks**: Hover effects, click handlers for editing
- **Phase legend**: Color key at bottom for all four phases

Features:
- Uses date-fns for all date calculations (differenceInDays, differenceInWeeks, isWithinInterval)
- Phase icons via SVG paths (building, trending, star, down arrow)
- Responsive hover states with ring and scale effects
- Calculated positioning via useMemo for performance

### BlockForm Component (295 lines)

Comprehensive form for creating/editing periodization blocks:

- **Block name input**: Text field with 50 char max
- **Phase selection grid**: Visual radio buttons with color-coded circles (2x2 mobile, 4x1 desktop)
- **Date range inputs**: Start/end date with validation (end must be after start)
- **Duration display**: Live week calculation with guideline warnings
- **TSS target input**: Optional weekly Training Stress Score (0-2000 range)
- **Focus areas**: Multi-select toggle buttons (8 predefined areas)
- **Phase guidelines**: Dynamic text showing recommended duration for selected phase

Validation:
- Zod schema: name required, dates required, end > start
- Phase-specific duration guidelines (base: 6-12w, build: 4-8w, peak: 2-4w, taper: 1-2w)
- Warning indicator (yellow) when duration outside guidelines, but doesn't block submission
- react-hook-form integration with Controller for focus areas

### TemplateApplicator Component (240 lines)

Template application UI with conflict handling:

- **Template selection**: Dropdown showing all available training plan templates
- **Template preview**: Shows name, description, workout count when selected
- **Date range**: Apply From/To inputs with end > start validation
- **Conflict detection**: Automatically finds existing workouts in date range
- **Conflict display**: Shows count, first 5 workouts, expand/collapse for details
- **Replace checkbox**: Opt-in control for replacing existing workouts
- **Warning styling**: Yellow background for conflict alert

Features:
- useMemo for conflict calculation (re-runs when dates change)
- eachDayOfInterval to build date set for O(1) conflict lookup
- Shows workout name + formatted date (MMM d) for each conflict
- Disables submit button until template selected

## Verification Results

All must_have criteria met:

- **Visual timeline**: PeriodizationTimeline displays blocks with phase colors, date ranges, today indicator
- **Block creation**: BlockForm allows setting name, phase, dates, TSS target, focus areas
- **Phase selection**: Grid radio buttons for base/build/peak/taper with color coding
- **Template application**: TemplateApplicator handles template selection, date range, conflict detection

Key link verification:
- BlockForm uses `useForm` with `zodResolver(blockSchema)` (line 79-80)
- PeriodizationTimeline imports `PeriodizationBlock` type (line 6)

Line count verification:
- PeriodizationTimeline: 190 lines (min 80) ✓
- BlockForm: 295 lines (min 100) ✓
- TemplateApplicator: 240 lines (min 60) ✓

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for integration.**

Components are self-contained and ready for:
- **Training plan wizard** (10-07): Will use BlockForm in wizard steps for periodization
- **Calendar integration**: PeriodizationTimeline can overlay on calendar view
- **Template management**: TemplateApplicator ready for template library UI

These components handle UI only - they require parent components to provide:
- API integration for CRUD operations
- State management for blocks array
- Modal/dialog wrappers for forms

## Session Notes

Execution was fully autonomous, no deviations or blockers.

All three components follow established V2 patterns:
- Design tokens (--surface-*, --txt-*, --bdr-*, --accent-*)
- react-hook-form + Zod validation
- Responsive layouts with Tailwind breakpoints
- Hover/focus states with Framer Motion principles

Form validation strategy prioritizes coach flexibility:
- Date validation is strict (end > start)
- Duration guidelines are informative (warnings, not blockers)
- Focus areas are optional
- TSS targets are optional

Timeline visualization uses percentage-based positioning for scalability - works for any date range from weeks to years.
