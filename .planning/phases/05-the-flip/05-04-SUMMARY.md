---
phase: 05-the-flip
plan: 04
subsystem: analytics
tags: [analytics, tracking, localStorage, react-hooks]
requires: []
provides:
  - Route analytics tracking hook
  - Version usage statistics API
  - localStorage-based analytics storage
affects: []
tech-stack:
  added: []
  patterns:
    - "Custom React hook for analytics tracking"
    - "localStorage for client-side analytics"
key-files:
  created:
    - src/v2/hooks/useRouteAnalytics.ts
  modified:
    - src/v2/layouts/V2Layout.tsx
    - src/layouts/AppLayout.jsx
decisions:
  - decision: "Track at layout level, not route level"
    rationale: "Layout component receives all route changes via useLocation, simpler than per-route tracking"
  - decision: "100 event cap in localStorage"
    rationale: "Prevents localStorage bloat while maintaining sufficient sample size for V1/V2 usage stats"
  - decision: "Timestamp in ISO format"
    rationale: "Enables future time-based analysis (hourly/daily patterns)"
metrics:
  duration: "2 minutes"
  completed: "2026-01-23"
---

# Phase 5 Plan 04: Route Analytics Tracking Summary

**One-liner:** localStorage-based analytics hook tracks V1 vs V2 route views for FLIP decision-making

## What Was Built

Implemented client-side analytics tracking system to measure V1 vs V2 usage during the flip transition.

### Core Components

1. **useRouteAnalytics hook** (`src/v2/hooks/useRouteAnalytics.ts`)
   - Tracks route views with version tag (v1 or v2)
   - Stores events in localStorage with 100 event cap
   - Provides `getVersionUsageStats()` for v1/v2 usage metrics
   - Provides `clearAnalytics()` for cleanup

2. **V2Layout integration** (`src/v2/layouts/V2Layout.tsx`)
   - Calls `useRouteAnalytics('v2')` to track all V2 route views
   - Automatic tracking on every route change

3. **V1 AppLayout integration** (`src/layouts/AppLayout.jsx`)
   - Calls `useRouteAnalytics('v1')` to track all V1 route views
   - Parallel tracking to V2 implementation

### Analytics Event Schema

```typescript
interface AnalyticsEvent {
  type: 'route_view';
  version: 'v1' | 'v2';
  path: string;
  timestamp: string; // ISO 8601
}
```

### Usage Stats API

```typescript
interface UsageStats {
  v1Count: number;
  v2Count: number;
  total: number;
  v2Percentage: number;
}

// Retrieve stats programmatically:
import { getVersionUsageStats } from '@v2/hooks/useRouteAnalytics';
const stats = getVersionUsageStats();
```

## Task Breakdown

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Create useRouteAnalytics hook | c9631d5 |
| 2 | Add analytics to V2Layout | 71f6e41 |
| 3 | Add analytics to V1 AppLayout | e391733 |

## Technical Details

### Implementation Patterns

**Layout-level tracking:** Both layouts call the hook once, receiving automatic route change notifications via `useLocation()`. This is simpler than adding tracking to individual route components.

**localStorage capping:** The 100-event limit prevents unbounded growth while maintaining enough samples for statistically significant usage metrics. Oldest events are dropped (FIFO queue).

**Timestamp precision:** ISO 8601 format enables future enhancements like time-of-day analysis, daily/weekly trends, or user session reconstruction.

### Key Behaviors

- **Automatic tracking:** No manual calls required - hook responds to React Router location changes
- **Version tagging:** Each event tagged with 'v1' or 'v2' for segmentation
- **Circular buffer:** Oldest events dropped when exceeding 100-event cap
- **Client-side only:** No server requests - pure localStorage implementation

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Track at layout level, not route level | Layout component receives all route changes via useLocation, simpler than per-route tracking |
| 100 event cap in localStorage | Prevents localStorage bloat while maintaining sufficient sample size for V1/V2 usage stats |
| Timestamp in ISO format | Enables future time-based analysis (hourly/daily patterns) |
| localStorage over backend API | Faster implementation, no backend changes needed, sufficient for FLIP decision metrics |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Status:** Ready ✓

This plan provides the analytics foundation needed for:
- **05-02 (Flip mechanics):** Usage stats inform rollback decisions
- **05-03 (V1 integration):** Legacy banner can display V2 adoption percentage
- **Post-FLIP monitoring:** Admin dashboard can visualize V1 vs V2 usage trends

**Blockers:** None

**Dependencies satisfied:**
- Depends on 05-02 for route structure - but only touches analytics hook and layout integration, no route conflicts

## Testing Notes

### Manual Verification

1. Navigate between V2 routes (`/beta/*`)
2. Navigate between V1 routes (`/app/*`)
3. Check localStorage: `localStorage.getItem('rowlab_analytics')`
4. Verify events array contains mix of v1 and v2 entries
5. Call `getVersionUsageStats()` in browser console
6. Verify stats match event counts

### Edge Cases Handled

- **Empty localStorage:** Returns empty stats (0/0/0/0)
- **Rapid navigation:** All route changes tracked, capped at 100 events
- **Version switching:** Seamless tracking across V1 ↔ V2 transitions

## Impact

**Positive:**
- ✓ Enables data-driven FLIP decisions
- ✓ Zero backend work required
- ✓ Lightweight (<1KB localStorage usage)

**Neutral:**
- Stored client-side only (can't aggregate across users)
- 100-event history (enough for individual user patterns)

**Risks:**
- Users clearing localStorage lose history (acceptable - analytics reset)
- Browser privacy mode prevents localStorage (degrades gracefully)

---

**Commits:** 3 task commits
**Files created:** 1
**Files modified:** 2
**Duration:** 2 minutes
