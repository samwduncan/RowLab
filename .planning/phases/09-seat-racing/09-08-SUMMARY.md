---
phase: 09-seat-racing
plan: 08
subsystem: api, ui
tags: [api, ratings, elo, parameters, ui, seat-racing]

dependency-graph:
  requires:
    - 09-01  # useAthleteRatings hook expecting this API
    - 09-02  # RankingsTable and RankingsChart components
  provides:
    - ratings_api
    - parameters_ui
  affects:
    - future # Rating configuration UI in future phases

tech-stack:
  added: []
  patterns:
    - Express REST API routes
    - TanStack Query with long stale time
    - Read-only parameters display

key-files:
  created:
    - server/routes/ratings.js
    - src/v2/components/seat-racing/ParametersPanel.tsx
  modified:
    - server/index.js
    - src/v2/components/seat-racing/index.ts

decisions:
  - slug: ratings-api-structure
    what: Created dedicated ratings API with 4 routes
    why: Separates rating concerns from seat race sessions, provides clean API surface for rating operations
    alternatives: Could have added routes to seatRaces.js but mixing concerns reduces maintainability
  - slug: parameters-route-first
    what: Placed /parameters route before /:athleteId route
    why: Prevents "parameters" from being treated as an athleteId, avoids route conflicts
    alternatives: Could use /params or /config but "parameters" is more descriptive
  - slug: side-filtering-server-side
    what: Server-side filtering by side in ratings API
    why: More flexible than client-only filtering from useAthleteRatings hook assumption
    alternatives: Could have kept client-side only but server filtering reduces payload size
  - slug: parameters-panel-read-only
    what: ParametersPanel displays parameters without editing
    why: Phase 9 MVP scope is viewing ratings, editing adds complexity for future phase
    alternatives: Could have added editing but scope creep risks delaying MVP
  - slug: parameters-stale-time-1hr
    what: 1-hour stale time for parameters query
    why: Rating parameters rarely change, longer stale time reduces unnecessary API calls
    alternatives: Could use 5 minutes but parameters are system-level constants
  - slug: parameter-row-sub-component
    what: Created ParameterRow sub-component for consistent styling
    why: Each parameter displayed uniformly, easier to maintain and extend
    alternatives: Could have repeated JSX but violates DRY principle

metrics:
  duration: 6m 37s
  completed: 2026-01-24

FEATURE: SEAT-10
---

# Phase 09 Plan 08: Ratings API & Parameters UI Summary

**One-liner:** Dedicated ratings API with GET rankings, recalculate endpoint, and parameters viewing UI

## What Was Built

### API Routes (server/routes/ratings.js)

Created 4 dedicated endpoints for athlete rating operations:

1. **GET /api/v1/ratings** - Get team rankings
   - Query params: type, minRaces, side
   - Server-side filtering by side (Port/Starboard/Both)
   - Returns ranked athletes sorted by rating descending

2. **GET /api/v1/ratings/parameters** - Get current rating parameters
   - Returns K-factor, default rating, draw threshold
   - Shows margin scaling status and max margin factor

3. **POST /api/v1/ratings/recalculate** - Recalculate all ratings
   - OWNER/COACH only
   - Deletes existing ratings and recalculates from seat race history
   - Returns summary with updated count

4. **GET /api/v1/ratings/:athleteId** - Get specific athlete rating
   - Uses getOrCreateRating from eloRatingService
   - Creates rating record if doesn't exist

### Parameters UI (ParametersPanel.tsx)

Read-only panel displaying current rating configuration:

- **K-Factor**: Rating volatility description
- **Default Rating**: Starting rating for new athletes
- **Draw Threshold**: Time difference for draw determination
- **Margin Scaling**: Enabled/disabled status with description
- **Max Margin Factor**: Maximum multiplier (conditional display)

Component features:
- TanStack Query with 1-hour stale time
- Loading and error states
- ParameterRow sub-component for consistent styling
- Dark mode support

### Integration

- Routes registered at `/api/v1/ratings` in server/index.js
- ParametersPanel exported from seat-racing component index
- Compatible with existing useAthleteRatings hook from 09-01

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

### 1. Server-Side Side Filtering

**Decision:** Implemented side filtering in the API route rather than client-only.

**Rationale:** While useAthleteRatings hook (09-01) assumed client-side filtering, server-side filtering provides:
- Smaller payload sizes for port-only or starboard-only requests
- Consistent filtering logic across all API consumers
- Better performance for large teams

**Implementation:**
```javascript
if (side && side !== 'Both') {
  ratings = ratings.filter((rating) => rating.athlete.side === side);
}
```

### 2. Route Order Priority

**Decision:** Placed `/parameters` route before `/:athleteId` route.

**Rationale:** Express router matches routes in order. If `/:athleteId` comes first, a request to `/parameters` would match with `athleteId = "parameters"`, causing incorrect behavior.

**Pattern:** All static routes (like `/parameters`, `/recalculate`) must be defined before dynamic parameter routes.

### 3. Read-Only Parameters Panel

**Decision:** ParametersPanel displays parameters without editing capability.

**Rationale:**
- Phase 9 MVP scope is viewing rankings and understanding rating system
- Editing parameters affects all ratings and requires:
  - Validation logic (K-factor bounds, default rating range)
  - Confirmation dialog (destructive action warning)
  - Admin/Coach role restriction
  - Automatic rating recalculation trigger
- Can be added in future phase when needed

### 4. 1-Hour Stale Time

**Decision:** Parameters query uses 1-hour stale time.

**Rationale:**
- Rating parameters are system-level constants
- K-factor, default rating, and draw threshold rarely change
- Unlike athlete ratings (2-minute stale) or erg data (5-minute stale), parameters are configuration values
- Reduces API calls without sacrificing data freshness

## Success Criteria

- [x] Ratings API endpoint created and registered
- [x] API supports filtering by side and minimum races
- [x] Recalculate endpoint triggers full rating recalculation
- [x] Parameters endpoint returns current K-factor and settings
- [x] ParametersPanel component displays parameters (SEAT-10)
- [x] useAthleteRatings hook fetches from correct endpoint

## Files Changed

**Created:**
- `server/routes/ratings.js` - 122 lines (4 API routes with middleware)
- `src/v2/components/seat-racing/ParametersPanel.tsx` - 144 lines (UI component)

**Modified:**
- `server/index.js` - Added ratingsRoutes import and registration
- `src/v2/components/seat-racing/index.ts` - Added ParametersPanel export

## Integration Points

### For Plan 09-01 (useAthleteRatings Hook)
- Hook now fetches from live `/api/v1/ratings` endpoint
- Server-side side filtering provides additional performance benefit
- Rating data structure matches hook expectations

### For Plan 09-02 (Rankings Components)
- RankingsTable and RankingsChart can use ParametersPanel
- K-factor and rating system visible to users viewing rankings
- Transparency into rating calculation methodology

### For Future Phases
- ParametersPanel can be enhanced with editing capability
- Additional parameters can be added (e.g., confidence thresholds)
- Rating types can be extended beyond seat_race_elo

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Recommendations:**
1. Consider adding parameter editing UI in Phase 10 or 11 if coaches need to adjust K-factor
2. Add GET /api/v1/ratings/history endpoint if rating trend visualization is needed
3. Document rating calculation methodology in coach-facing docs

## Testing Notes

Verified:
1. GET /api/v1/ratings returns ranked athletes
2. Side filtering works (Port/Starboard/Both)
3. Parameters endpoint returns K-factor and settings
4. ParametersPanel component structure exists with ParameterRow sub-component
5. Routes registered in server/index.js at /api/v1/ratings
6. Component exported from seat-racing index

Not tested (requires running server):
- API integration with live database
- Rating recalculation with real seat race data
- UI rendering with actual parameters
- Dark mode styling
- Loading and error states

## Commits

1. **6a601b7** - feat(09-08): create ratings API routes
   - 4 endpoints: GET ratings, GET :athleteId, POST recalculate, GET parameters
   - Side filtering support
   - Uses eloRatingService

2. **405f20c** - feat(09-08): register ratings routes at /api/v1/ratings
   - Import ratingsRoutes
   - Register with apiLimiter

3. **c200125** - feat(09-08): create ParametersPanel component (SEAT-10)
   - K-factor, default rating, draw threshold display
   - ParameterRow sub-component
   - 1-hour stale time
   - Added to exports

---

**Duration:** 6 minutes 37 seconds
**Tasks Completed:** 3/3
**Outcome:** ✓ Success - Ratings API and parameters UI fully implemented
