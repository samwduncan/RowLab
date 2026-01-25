---
phase: 12
plan: 01
subsystem: design-system
tags: [dependencies, animations, loading-states, toasts, accessibility]
dependency-graph:
  requires: []
  provides: [phase-12-deps, spring-config, common-ui-components, toast-system]
  affects: [all-v2-features, settings-migration, photo-uploads, design-polish]
tech-stack:
  added: ["@stripe/react-stripe-js@5.4.1", "@stripe/stripe-js@8.6.4", "react-easy-crop@5.5.6", "face-api.js@0.22.2", "react-loading-skeleton@3.5.0"]
  patterns: [centralized-animation-config, skeleton-loaders, toast-context]
key-files:
  created:
    - src/v2/utils/animations.ts
    - src/v2/components/common/LoadingSkeleton.tsx
    - src/v2/components/common/EmptyState.tsx
    - src/v2/components/common/ErrorState.tsx
    - src/v2/components/common/Toast.tsx
    - src/v2/contexts/ToastContext.tsx
  modified:
    - package.json
    - package-lock.json
    - src/v2/components/common/index.ts
decisions:
  - id: 12-01-1
    decision: SPRING_CONFIG with stiffness 300, damping 28 as centralized constant
    rationale: Matches STATE.md decision from 08-03, ensures consistent animation feel across all V2 components
  - id: 12-01-2
    decision: react-loading-skeleton for skeleton loaders instead of custom
    rationale: Auto-sizing, built-in shimmer, theme support - avoids reinventing wheel
  - id: 12-01-3
    decision: Toast context with useToast hook pattern
    rationale: Global notification system accessible from any component without prop drilling
  - id: 12-01-4
    decision: usePrefersReducedMotion hook for WCAG accessibility
    rationale: POLISH-11 requires reduced motion support for users with vestibular disorders
metrics:
  duration: 3m 31s
  completed: 2026-01-25
---

# Phase 12 Plan 01: Common UI Foundation Summary

**One-liner:** Phase 12 dependencies (Stripe, face detection, cropping, skeletons) with centralized SPRING_CONFIG and common UI state components (loading, empty, error, toast)

## What Was Built

### Task 1: Install Phase 12 Dependencies

Installed all Phase 12 npm packages:
- `@stripe/react-stripe-js` + `@stripe/stripe-js`: Stripe billing integration for SET-03
- `react-easy-crop`: Image cropping UI for PHOTO-01, PHOTO-02
- `face-api.js`: Browser-based face detection for PHOTO-02
- `react-loading-skeleton`: Loading state skeletons for POLISH-04

### Task 2: Create Centralized Animation Constants

Created `/src/v2/utils/animations.ts` with:
- `SPRING_CONFIG`: Base spring physics (stiffness: 300, damping: 28) per STATE.md decision 08-03
- `SPRING_FAST`: Faster spring for micro-interactions (stiffness: 400, damping: 30)
- `SPRING_SLOW`: Slower spring for page transitions (stiffness: 200, damping: 25)
- `TRANSITION_DURATION`: Standard durations (fast: 0.15, normal: 0.2, slow: 0.3)
- `usePrefersReducedMotion`: Hook for WCAG reduced motion accessibility
- `getAnimationConfig`: Helper that respects reduced motion preference

### Task 3: Create Common UI State Components

Created four reusable components for consistent UI states:

**LoadingSkeleton.tsx:**
- `LoadingSkeleton`: Theme wrapper using V2 design tokens
- `SkeletonLine`: Rectangular skeleton for text/content
- `SkeletonCircle`: Circular skeleton for avatars
- `SkeletonCard`: Card skeleton with optional avatar
- `SkeletonTable`: Table rows skeleton

**EmptyState.tsx:**
- Customizable icon (defaults to Upload)
- Title, description, and optional CTA button
- Uses V2 design tokens with focus-visible accessibility

**ErrorState.tsx:**
- AlertTriangle icon in error color
- Retry button with RefreshCw icon
- WCAG-compliant focus indicators

**ToastContext.tsx + Toast.tsx:**
- `ToastProvider`: Context provider for global notification state
- `useToast`: Hook returning `{ showToast: (type, message) => void }`
- Four toast types: success, error, warning, info
- AnimatePresence for entrance/exit animations using SPRING_CONFIG
- Auto-dismiss after 5 seconds
- Fixed top-right positioning
- Accessible aria-live regions

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation config location | `src/v2/utils/animations.ts` | Central import for all V2 components, matches STATE.md pattern from 08-03 |
| Skeleton library | react-loading-skeleton | Auto-sizing, built-in shimmer, theme support via CSS custom properties |
| Toast state management | React Context + useState | Lightweight, no external dependency, matches existing pattern |
| Toast animation | Framer Motion SPRING_CONFIG | Consistent with all other V2 animations |
| Reduced motion | Custom hook + media query | WCAG 2.1 AA compliance for vestibular disorders |

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Added 5 Phase 12 dependencies |
| `src/v2/utils/animations.ts` | Created - centralized animation config |
| `src/v2/components/common/LoadingSkeleton.tsx` | Created - skeleton components |
| `src/v2/components/common/EmptyState.tsx` | Created - empty state component |
| `src/v2/components/common/ErrorState.tsx` | Created - error state component |
| `src/v2/components/common/Toast.tsx` | Created - toast notification component |
| `src/v2/contexts/ToastContext.tsx` | Created - toast context provider |
| `src/v2/components/common/index.ts` | Updated - export new components |

## Commits

| Hash | Message |
|------|---------|
| `5d4071a` | chore(12-01): install Phase 12 dependencies |
| `eec1ada` | feat(12-01): create centralized animation constants |
| `dbfec9b` | feat(12-01): create common UI state components |

## Deviations from Plan

None - plan executed exactly as written.

## How to Use

### Animation Config
```typescript
import { SPRING_CONFIG, usePrefersReducedMotion, getAnimationConfig } from '@/v2/utils/animations';

// In Framer Motion
<motion.div transition={SPRING_CONFIG} />

// With reduced motion support
const prefersReducedMotion = usePrefersReducedMotion();
<motion.div transition={getAnimationConfig(prefersReducedMotion)} />
```

### Loading Skeletons
```typescript
import { LoadingSkeleton, SkeletonLine, SkeletonCircle } from '@/v2/components/common';

<LoadingSkeleton>
  <SkeletonCircle size={40} />
  <SkeletonLine width="60%" height={20} />
</LoadingSkeleton>
```

### Empty/Error States
```typescript
import { EmptyState, ErrorState } from '@/v2/components/common';

<EmptyState
  title="No athletes yet"
  description="Add athletes to build your roster"
  action={{ label: "Add Athlete", onClick: () => {} }}
/>

<ErrorState
  message="Failed to load data"
  onRetry={() => refetch()}
/>
```

### Toast Notifications
```typescript
// In App.tsx - wrap with provider
import { ToastProvider } from '@/v2/contexts/ToastContext';
<ToastProvider><App /></ToastProvider>

// In any component
import { useToast } from '@/v2/contexts/ToastContext';
const { showToast } = useToast();
showToast('success', 'Settings saved');
showToast('error', 'Failed to save');
```

## Next Phase Readiness

Ready for 12-02 (Settings API hooks) - all common UI foundation components available.

**Blockers:** None
**Concerns:** None
