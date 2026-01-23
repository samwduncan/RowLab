# Phase 5: The Flip - Research

**Researched:** 2026-01-23
**Domain:** React Router route migration, strangler fig pattern, feature parity testing
**Confidence:** HIGH

## Summary

Phase 5 implements the "flip" from V2 as beta (`/beta`) to V2 as default (`/`), moving V1 to `/legacy`. This is a route reorganization and progressive rollout challenge, not a rewrite. The research focused on three critical areas:

1. **React Router route migration patterns** - Understanding how to reorganize routes without breaking existing functionality
2. **Strangler fig pattern** - Progressive rollout strategies with rollback capability
3. **Feature parity verification** - Testing methodologies to ensure V2 matches V1 capabilities

The codebase is already well-positioned for this flip: V2 exists at `/beta` with its own layout wrapper (V2Layout), V1 exists at `/app` with AppLayout, and both systems share Zustand stores via Context providers. This architecture follows the **In-Place Strangler pattern** mentioned in prior decisions.

**Primary recommendation:** Use a phased rollout with feature flags controlling route defaults, localStorage-based user preferences for legacy fallback, and comprehensive feature parity testing before the flip.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router | v6.x | Declarative routing with nested routes | Industry standard for React SPAs, already in use |
| localStorage | Browser API | User preference persistence | Native, zero-dependency, synchronous storage |
| React Testing Library | Latest | Component and integration testing | De facto standard for React testing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | Already installed | Server state management | Already used in V2Layout for data fetching |
| Zustand | Already installed | Client state management | Already used for shared stores between V1/V2 |
| Playwright/Cypress | Either | E2E feature parity testing | For automated user flow verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | sessionStorage | sessionStorage loses preference on tab close - bad UX |
| localStorage | Backend user preference API | Adds unnecessary latency and complexity for a simple boolean |
| React Router | TanStack Router | Migration cost too high, React Router already in use |

**Installation:**
No new packages required - all libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── App.jsx                     # Root router - modify routes here
├── pages/                      # V1 pages (will be under /legacy)
├── v2/
│   ├── layouts/
│   │   ├── V2Layout.tsx       # V2 wrapper (already exists)
│   │   └── ShellLayout.tsx    # V2 shell (already exists)
│   ├── pages/                 # V2 pages (will be at / after flip)
│   └── stores/
│       └── userPreferenceStore.ts  # New: track legacy preference
└── hooks/
    └── useVersionRedirect.ts   # New: handle redirects based on preference
```

### Pattern 1: Strangler Fig Route Migration

**What:** Progressive route migration where new routes gradually replace old routes, with both systems running in parallel during transition.

**When to use:** When migrating between two versions of an application where immediate cutover is risky.

**Example:**
```typescript
// Source: https://reactrouter.com/start/declarative/routing
// Strangler fig pattern applied to React Router

// BEFORE FLIP (current state):
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/app/*" element={<AppLayout />}>
    {/* V1 routes */}
  </Route>
  <Route path="/beta/*" element={<V2Layout />}>
    {/* V2 routes */}
  </Route>
</Routes>

// AFTER FLIP (Phase 5 complete):
<Routes>
  <Route path="/" element={<V2Layout />}>
    <Route element={<ShellLayout />}>
      <Route index element={<MeDashboard />} />
      {/* All V2 routes at root */}
    </Route>
  </Route>
  <Route path="/legacy/*" element={<AppLayout />}>
    {/* V1 routes preserved */}
  </Route>
</Routes>
```

**Key insight from strangler fig pattern:**
- Keep the source (V1) live for a predefined rollback window
- Use feature flags to control which version users see
- Leverage user feedback as rollback criteria
- Perform canary deployments to subsets of users first

Sources:
- [Strangler Fig Pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)
- [AWS Strangler Fig Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

### Pattern 2: User Preference with localStorage

**What:** Store user preference for legacy mode in localStorage, check on app mount, redirect accordingly.

**When to use:** When providing users an opt-out mechanism for new features.

**Example:**
```typescript
// Source: Custom pattern based on https://medium.com/@alperkilickaya/understanding-local-storage-and-tracking-its-usage-in-react-with-a-custom-hook-a84267b45f3e

// Zustand store for preference management
export const useUserPreferenceStore = create<PreferenceStore>((set) => ({
  useLegacyMode: localStorage.getItem('rowlab_use_legacy') === 'true',

  setLegacyMode: (useLegacy: boolean) => {
    localStorage.setItem('rowlab_use_legacy', String(useLegacy));
    set({ useLegacyMode: useLegacy });
  },

  clearPreference: () => {
    localStorage.removeItem('rowlab_use_legacy');
    set({ useLegacyMode: false });
  },
}));

// Hook to redirect based on preference
export function useVersionRedirect() {
  const { useLegacyMode } = useUserPreferenceStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isOnLegacy = location.pathname.startsWith('/legacy');
    const isOnRoot = location.pathname === '/' || location.pathname.startsWith('/me');

    // User wants legacy but is on V2
    if (useLegacyMode && isOnRoot) {
      navigate('/legacy', { replace: true });
    }

    // User doesn't want legacy but is on legacy
    if (!useLegacyMode && isOnLegacy) {
      navigate('/', { replace: true });
    }
  }, [useLegacyMode, location, navigate]);
}
```

### Pattern 3: Feature Parity Testing with Checklists

**What:** Systematic verification that V2 implements all V1 features before declaring parity.

**When to use:** Before any major version migration or feature flip.

**Example:**
```typescript
// Feature parity test structure
// Source: https://martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html

describe('V2 Feature Parity', () => {
  describe('Coach Features', () => {
    it('should display team whiteboard', () => {
      // Navigate to V2 whiteboard
      // Verify all elements present in V1 whiteboard are in V2
    });

    it('should allow editing whiteboard content', () => {
      // Verify CRUD operations work identically
    });

    it('should display fleet management', () => {
      // Verify shells and oars tables match V1
    });
  });

  describe('Me/Dashboard Features', () => {
    it('should show activity feed', () => {
      // Verify Concept2 and Strava data display
    });

    it('should show adaptive headline', () => {
      // Verify headline widget behavior
    });
  });

  describe('Navigation', () => {
    it('should provide access to all V1 routes', () => {
      // Verify every V1 route has a V2 equivalent or legacy link
    });
  });
});
```

**Checklist approach:**
Create a manual checklist in REQUIREMENTS.md for each feature, verify manually, then automate critical flows. This is the "parity mode testing" approach from Harness.io - run both versions in parallel and compare results.

Sources:
- [Parity Testing With Feature Flags - Harness IO](https://www.harness.io/blog/parity-testing-with-feature-flags)
- [Feature Parity - Martin Fowler](https://martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html)

### Pattern 4: Analytics Tracking for V1 vs V2 Usage

**What:** Track which version users are using to inform rollback decisions and measure adoption.

**When to use:** During any progressive rollout to gather user behavior data.

**Example:**
```typescript
// Source: https://github.com/nytimes/react-tracking
// Simplified approach using React Router's useLocation hook

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function useRouteTracking() {
  const location = useLocation();

  useEffect(() => {
    const version = location.pathname.startsWith('/legacy') ? 'v1' : 'v2';
    const event = {
      type: 'route_view',
      version,
      path: location.pathname,
      timestamp: new Date().toISOString(),
    };

    // Store locally for now, can send to backend later
    const existing = JSON.parse(localStorage.getItem('rowlab_analytics') || '[]');
    existing.push(event);
    // Keep only last 100 events
    if (existing.length > 100) existing.shift();
    localStorage.setItem('rowlab_analytics', JSON.stringify(existing));
  }, [location]);
}

// Helper to retrieve analytics summary
export function getVersionUsageStats() {
  const events = JSON.parse(localStorage.getItem('rowlab_analytics') || '[]');
  const v1Count = events.filter(e => e.version === 'v1').length;
  const v2Count = events.filter(e => e.version === 'v2').length;
  return { v1Count, v2Count, total: events.length };
}
```

**Note:** This is a minimal viable tracking approach. If the app already has analytics (Google Analytics, Mixpanel, etc.), integrate there instead. The package.json shows no existing analytics dependencies, so localStorage-based tracking is appropriate for MVP.

Sources:
- [React Tracking - NYTimes](https://github.com/nytimes/react-tracking)
- [Analytics Hooks for React](https://getanalytics.io/utils/react-hooks/)

### Anti-Patterns to Avoid

- **Don't duplicate route configuration**: V1 and V2 should share the same route config structure where possible, just with different base paths
- **Don't remove V1 routes immediately**: Keep `/legacy` indefinitely as a fallback escape hatch
- **Don't force users onto V2**: Always provide a way back to V1 if they encounter issues
- **Don't skip feature parity testing**: Assuming "it probably works" leads to user-facing bugs
- **Don't use complex feature flag services**: This is a one-time flip with a simple boolean preference - localStorage is sufficient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type-safe routing | Custom path builder with string templates | React Router v7 built-in types OR react-router-typesafe-routes | React Router v7+ generates `.react-router/types/` automatically; third-party lib handles all param validation |
| Feature flags | Custom boolean flags in localStorage | Built-in localStorage + Zustand store | Zustand already in use; over-engineering a feature flag service for one boolean is wasteful |
| E2E parity testing | Custom test framework | Playwright or Cypress (already may be installed) | Mature, maintained, handles all edge cases |
| Analytics tracking | Custom event logger | Existing analytics service OR simple localStorage approach | If no analytics exists, localStorage is fine for basic tracking; don't build a whole analytics platform |

**Key insight:** This phase is about **route reorganization**, not feature development. Avoid the temptation to add new infrastructure - use what's already in place.

## Common Pitfalls

### Pitfall 1: Breaking V1 Routes During Migration

**What goes wrong:** Modifying `App.jsx` routes for V2 accidentally breaks V1 navigation, especially nested routes.

**Why it happens:** React Router route matching is order-dependent and path overlaps can cause conflicts.

**How to avoid:**
- Test all V1 routes after modifying `App.jsx`
- Use explicit paths (`/legacy/*`) rather than catch-all patterns at root
- Add route tests that verify both V1 and V2 routes resolve correctly

**Warning signs:**
- V1 routes redirecting to 404
- V1 nested routes rendering V2 components
- Route params not being passed correctly to V1 components

### Pitfall 2: Forgetting to Update Links and Navigations

**What goes wrong:** V1 components have hardcoded links to `/app/...` routes, which break when V1 moves to `/legacy/...`.

**Why it happens:** String-based navigation paths scattered throughout V1 codebase.

**How to avoid:**
- Use a search tool (grep) to find all hardcoded `/app` paths
- Create a helper function for V1 route generation: `getLegacyRoute(path)`
- Test navigation flows in V1 after the flip

**Warning signs:**
- Links in V1 navigating to V2 pages unexpectedly
- 404 errors when clicking navigation items in `/legacy`
- Breadcrumbs or history breaking in V1

### Pitfall 3: localStorage Synchronization Issues

**What goes wrong:** User toggles legacy mode, but the app doesn't immediately reflect the change without a full page reload.

**Why it happens:** React components don't re-render when localStorage changes unless you explicitly listen for changes.

**How to avoid:**
- Use Zustand store for preference (wraps localStorage)
- Zustand triggers re-renders automatically on state changes
- Use `useVersionRedirect` hook that watches Zustand state, not localStorage directly

**Warning signs:**
- Toggling preference requires page refresh
- Multiple tabs showing different versions for same user
- Preference not persisting across sessions

### Pitfall 4: Incomplete Feature Parity

**What goes wrong:** V2 declared "ready" but missing critical V1 features, forcing users back to legacy mode.

**Why it happens:** Feature parity checklist incomplete or untested against real user workflows.

**How to avoid:**
- Create comprehensive feature parity checklist from REQUIREMENTS.md
- Test each checklist item manually before automation
- Include real user testing (UAT) with coaches and athletes
- Compare every V1 page against V2 equivalent

**Warning signs:**
- High percentage of users opting for legacy mode
- User bug reports about "missing features"
- Support tickets asking "where did X go?"

### Pitfall 5: No Rollback Plan

**What goes wrong:** V2 rollout causes critical issues, but no quick way to revert all users to V1.

**Why it happens:** Assuming the flip will be smooth and one-way.

**How to avoid:**
- Keep environment variable or backend config to control default version
- Implement "force legacy mode" override that bypasses user preference
- Document rollback procedure: change default route, clear localStorage, restart server
- Test rollback procedure before flip

**Warning signs:**
- No documented rollback steps
- No way to force all users back to V1 without code deploy
- Panic when critical bug found in V2

### Pitfall 6: Losing URL State During Redirects

**What goes wrong:** User at `/legacy/athletes/123` clicks "Try V2" and lands at `/`, losing context.

**Why it happens:** Redirect logic doesn't preserve route params and query strings.

**How to avoid:**
- Map V1 routes to V2 equivalents (e.g., `/legacy/athletes/:id` → `/me` or appropriate V2 route)
- If exact mapping doesn't exist, redirect to V2 home with a toast notification
- Preserve query params when possible: `?tab=settings` should carry over

**Warning signs:**
- Users complaining about "losing their place"
- Deep links breaking after switching versions
- Query params disappearing on version toggle

## Code Examples

Verified patterns from official sources:

### Nested Route Configuration (React Router v6)
```typescript
// Source: https://reactrouter.com/start/declarative/routing
// This is the core pattern for Phase 5

<Routes>
  {/* V2 at root after flip */}
  <Route path="/" element={<V2Layout />}>
    <Route element={<ShellLayout />}>
      <Route index element={<MeDashboard />} />
      <Route path="me" element={<MeDashboard />} />
      <Route path="coach/whiteboard" element={<CoachWhiteboard />} />
      <Route path="coach/fleet" element={<CoachFleet />} />
      <Route path="coach/availability" element={<CoachAvailability />} />
    </Route>
  </Route>

  {/* V1 preserved at /legacy */}
  <Route path="/legacy" element={<AppLayout />}>
    <Route index element={<DashboardRouter />} />
    <Route path="athlete-dashboard" element={<AthleteDashboard />} />
    <Route path="lineup" element={<LineupBuilder />} />
    <Route path="athletes" element={<AthletesPage />} />
    {/* ... all other V1 routes */}
  </Route>

  {/* Auth routes stay at root level */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Routes>
```

### User Preference Toggle Component
```typescript
// Component to toggle between V1 and V2
export function VersionToggle() {
  const { useLegacyMode, setLegacyMode } = useUserPreferenceStore();
  const navigate = useNavigate();

  const toggleVersion = () => {
    const newMode = !useLegacyMode;
    setLegacyMode(newMode);

    // Redirect immediately
    if (newMode) {
      navigate('/legacy', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <button onClick={toggleVersion} className="...">
      {useLegacyMode ? 'Try New Version' : 'Back to Legacy'}
    </button>
  );
}
```

### V1 Route Path Migration Script
```bash
# Find all hardcoded /app paths in V1 code
grep -r "to=\"/app" src/pages src/components/Dashboard src/components/Auth

# Replace with /legacy (after confirming each)
find src/pages src/components -type f -exec sed -i 's|to="/app|to="/legacy|g' {} +

# Verify changes
git diff
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Big-bang route migration | Strangler fig pattern with parallel versions | 2020s | Reduces risk, allows gradual rollout |
| Custom route generators | React Router built-in type generation | React Router v7 (2024) | No need for third-party type safety libs |
| Backend feature flags | Client-side localStorage preferences | Modern SPA era | Simpler, faster, no backend dependency for UI toggle |
| Manual feature parity testing | Parity mode testing with automated comparisons | 2023+ | Run both systems, compare outputs programmatically |

**Deprecated/outdated:**
- **React Router v5 `<Switch>`**: Replaced by `<Routes>` in v6 (RowLab already on v6)
- **Class-based route guards**: Replaced by hooks like `useNavigate` and `useLocation`
- **Custom localStorage hooks**: Zustand with `persist` middleware is now standard

## Open Questions

Things that couldn't be fully resolved:

1. **What V1 routes should have NO V2 equivalent?**
   - What we know: Some V1 features may not migrate (e.g., 3D boat view, seat racing, advanced analytics)
   - What's unclear: Should these be accessible from V2 via "legacy feature" links, or removed from navigation entirely?
   - Recommendation: Create a "Legacy Features" section in V2 sidebar that links to specific `/legacy/...` routes for features not yet in V2

2. **How long should /legacy remain available?**
   - What we know: Industry best practice is indefinite fallback for critical applications
   - What's unclear: RowLab's deprecation policy
   - Recommendation: Keep `/legacy` indefinitely (no removal plan). Add a banner "You're using legacy mode. Switch to new version?" but allow permanent opt-out

3. **Should analytics be stored locally or sent to backend?**
   - What we know: No analytics service currently installed (checked package.json)
   - What's unclear: Future plans for analytics infrastructure
   - Recommendation: Start with localStorage-based tracking (FLIP-05 requirement), add backend persistence later if needed

## Sources

### Primary (HIGH confidence)
- [React Router Official Docs - Nested Routes](https://reactrouter.com/start/declarative/routing) - Route configuration patterns
- [React Router Official Docs - Type Safety](https://reactrouter.com/explanation/type-safety) - Built-in type generation
- [Strangler Fig Pattern - Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig) - Progressive migration strategy
- [Strangler Fig Pattern - AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html) - Cloud migration patterns

### Secondary (MEDIUM confidence)
- [Parity Testing With Feature Flags - Harness IO](https://www.harness.io/blog/parity-testing-with-feature-flags) - Testing strategy
- [Feature Parity - Martin Fowler](https://martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html) - Legacy displacement patterns
- [React Tracking - NYTimes](https://github.com/nytimes/react-tracking) - Analytics tracking patterns
- [Understanding localStorage in React - Medium](https://medium.com/@alperkilickaya/understanding-local-storage-and-tracking-its-usage-in-react-with-a-custom-hook-a84267b45f3e) - localStorage patterns
- [Migration Checklist 2026 - Rivery](https://rivery.io/data-learning-center/complete-data-migration-checklist/) - General migration best practices

### Tertiary (LOW confidence)
- [react-router-typesafe-routes](https://www.npmjs.com/package/react-router-typesafe-routes) - Third-party type safety (may not be needed with RR v7)
- [10 Best Analytics Tools for React](https://buttercms.com/blog/web-analytics-tools-react-websites/) - If backend analytics needed later

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Router already in use, patterns well-documented
- Architecture: HIGH - Strangler fig pattern is industry-proven, React Router nested routes are standard
- Pitfalls: MEDIUM - Based on general migration experience and web search results, not RowLab-specific historical issues

**Research date:** 2026-01-23
**Valid until:** 60 days (stable domain, patterns unlikely to change)

**Key takeaway:** Phase 5 is a routing reorganization, not a feature build. Leverage existing infrastructure (React Router, Zustand, localStorage), follow strangler fig pattern, verify feature parity rigorously, and provide user escape hatch to legacy mode.
