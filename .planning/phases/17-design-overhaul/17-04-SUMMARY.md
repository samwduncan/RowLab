---
phase: 17
plan: 04
subsystem: design-system
tags: [animations, framer-motion, css, accessibility, springs, micro-interactions]

dependency_graph:
  requires: ["17-01"]
  provides: ["animation-constants", "css-keyframes", "reduced-motion-support"]
  affects: ["17-05", "17-06", "17-07", "17-08"]

tech_stack:
  added: []
  patterns:
    - "spring-physics-constants"
    - "css-keyframe-animations"
    - "reduced-motion-preference"
    - "animation-presets"

key_files:
  created:
    - src/v2/styles/animations.css
  modified:
    - src/v2/utils/animations.ts
    - src/v2/styles/v2.css

decisions:
  - id: "17-04-01"
    decision: "SPRING_CONFIG stiffness 400 damping 17 per CONTEXT.md"
    rationale: "Standard spring for drag-drop, modals, general interactions"
  - id: "17-04-02"
    decision: "SPRING_FAST stiffness 500 damping 25 for micro-interactions"
    rationale: "Snappier response for button hover/tap, focus states"
  - id: "17-04-03"
    decision: "SPRING_GENTLE stiffness 300 damping 20 for subtle animations"
    rationale: "Softer motion for fade reveals, list transitions"
  - id: "17-04-04"
    decision: "Animation presets for common patterns"
    rationale: "BUTTON_PRESS, CARD_HOVER, DRAG_LIFT, MODAL_VARIANTS standardize interaction feel"
  - id: "17-04-05"
    decision: "CSS keyframes for non-spring effects"
    rationale: "Success pulse, gold wash, shimmer don't need JS spring physics"
  - id: "17-04-06"
    decision: "Reduced motion via media query AND hook"
    rationale: "CSS handles keyframes, JS hook handles Framer Motion springs"

metrics:
  duration: "5 minutes"
  completed: "2026-01-27"
---

# Phase 17 Plan 04: Animation System Summary

**One-liner:** Spring physics constants per CONTEXT.md spec plus CSS keyframes for high-impact moments with full reduced motion support.

## Objective Achieved

Established the standardized animation system per CONTEXT.md specifications. Spring physics create the "tactile" feel of the Rowing Instrument aesthetic. CSS keyframes handle effects that don't need JavaScript.

## What Was Built

### 1. Spring Physics Constants (animations.ts)

Updated to match CONTEXT.md exactly:

```typescript
export const SPRING_CONFIG = { type: 'spring', stiffness: 400, damping: 17 }  // Standard
export const SPRING_FAST = { type: 'spring', stiffness: 500, damping: 25 }    // Micro-interactions
export const SPRING_GENTLE = { type: 'spring', stiffness: 300, damping: 20 }  // Subtle
```

### 2. Animation Presets

Ready-to-use presets for common patterns:

| Preset | Use Case | Effect |
|--------|----------|--------|
| `BUTTON_PRESS` | Tactile button feedback | scale: 0.96 on tap |
| `CARD_HOVER` | Card lift on hover | scale: 1.01, y: -2 |
| `DRAG_LIFT` | Drag-drop physical feel | scale: 1.02, deep shadow |
| `MODAL_VARIANTS` | Modal enter/exit | scale + opacity + y |
| `SLIDE_PANEL_VARIANTS` | Side panel slides | x: 100% to 0 |
| `FADE_IN_VARIANTS` | List item reveals | opacity + y: 8 |
| `STAGGER_CONTAINER` | Staggered children | 0.05s delay per child |

### 3. CSS Keyframe Animations (animations.css)

**Success Animations:**
- `animate-success-pulse` - Green glow for confirmations
- `animate-gold-wash` - Gold background wash for PRs/achievements
- `animate-error-pulse` - Red glow for errors

**Loading Animations:**
- `animate-shimmer` - Skeleton loading with theme variants

**Live Data Animations:**
- `animate-number-flash` - Gold flash for any data change
- `animate-improvement` - Starboard green for positive changes
- `animate-decline` - Port red for negative changes
- `animate-digit-up` / `animate-digit-down` - Rolling digit counters

**Attention Animations:**
- `animate-badge-pop` - Achievement badge reveal with overshoot
- `animate-number-pop` - PR number emphasis
- `animate-attention-bounce` - Subtle bounce for focus
- `animate-ring-pulse` - Notification indicator pulse

**Drag-Drop Animations:**
- `animate-drag-lift` - Physical lift on drag start
- `animate-drop-settle` - Settling bounce on drop

### 4. Reduced Motion Support

**JavaScript (Framer Motion):**
```typescript
const prefersReducedMotion = usePrefersReducedMotion();
const transition = getSpringConfig(prefersReducedMotion, 'standard');
```

**CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  .v2 .animate-* { animation: none !important; }
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/v2/utils/animations.ts` | Updated springs, added presets, enhanced hooks |
| `src/v2/styles/animations.css` | **Created** - CSS keyframe animations |
| `src/v2/styles/v2.css` | Added animations.css import |

## Technical Decisions

1. **Removed restDelta/restSpeed** - Not needed with proper stiffness/damping values
2. **SPRING_SLOW deprecated** - Renamed to SPRING_GENTLE for clarity
3. **CSS keyframes for non-spring** - Success pulse, shimmer don't need JS physics
4. **Theme-aware shimmer** - Different gradient for light/dark/field themes
5. **Transition utilities** - Fast CSS transitions for simple state changes

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria passed:

- [x] SPRING_CONFIG: stiffness 400, damping 17
- [x] SPRING_FAST: stiffness 500, damping 25
- [x] SPRING_GENTLE: stiffness 300, damping 20
- [x] animations.css with keyframes for success-pulse, gold-wash, shimmer
- [x] Reduced motion support in JS (hook) and CSS (@media query)
- [x] animations.css imported in v2.css

## Usage Examples

**Button with tactile press:**
```tsx
<motion.button {...BUTTON_PRESS}>Save</motion.button>
```

**Card with hover lift:**
```tsx
<motion.div {...CARD_HOVER}>Card content</motion.div>
```

**Modal with enter/exit:**
```tsx
<motion.div
  variants={MODAL_VARIANTS}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={SPRING_CONFIG}
/>
```

**Live data flash:**
```tsx
<span className={hasChanged ? 'animate-number-flash' : ''}>
  {value}
</span>
```

**PR celebration:**
```tsx
<div className="animate-gold-wash animate-badge-pop">
  New PR!
</div>
```

## Next Phase Readiness

Animation system is ready for:
- **17-05:** Button component can use BUTTON_PRESS preset
- **17-06:** Cards can use CARD_HOVER preset
- **17-07:** Charts can use animate-number-flash for live data
- **17-08:** Modals can use MODAL_VARIANTS + SPRING_CONFIG
