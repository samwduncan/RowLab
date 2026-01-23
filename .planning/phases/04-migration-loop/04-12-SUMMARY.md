---
phase: 04-migration-loop
plan: 12
subsystem: coach-features
tags: [schema, biometrics, availability, athlete-management]
dependency_graph:
  requires: ["04-04"]
  provides: ["athlete-biometrics-schema", "athlete-biometrics-api", "athlete-biometrics-types"]
  affects: ["04-09"]
tech_stack:
  added: []
  patterns: ["biometric-fields"]
key_files:
  created: []
  modified: ["prisma/schema.prisma", "server/services/availabilityService.js", "server/services/athleteService.js", "src/v2/types/coach.ts"]
decisions:
  - id: "biometrics-defaults"
    choice: "Default false for canScull and canCox"
    rationale: "Safe default - coaches explicitly enable capabilities"
    alternatives: ["default true", "required fields"]
  - id: "ui-deferral"
    choice: "Defer AvailabilityGrid UI to plan 04-09"
    rationale: "Component doesn't exist yet - types updated for future use"
    alternatives: ["create placeholder component", "skip types update"]
metrics:
  duration: 418
  completed: 2026-01-23
---

# Phase 04 Plan 12: COACH-05 Athlete Biometrics Display Summary

**One-liner:** Add canScull, canCox, and side biometric fields to Athlete schema and availability API for coach lineup planning.

## Objective Achieved

Added athlete biometric fields (side preference, can scull, can cox) to the database schema, availability service API, athlete service, and TypeScript types. This addresses COACH-05 requirement by enabling coaches to see athlete capabilities when viewing availability.

## Tasks Completed

### Task 1: Add biometric fields to Athlete model ✓
**Commit:** 2f732b5

Added `canScull` and `canCox` boolean fields to the Prisma Athlete model with default values of false. Applied schema migration using `prisma db push` and regenerated the Prisma client.

**Changes:**
- Added `canScull Boolean @default(false)` to Athlete model
- Added `canCox Boolean @default(false)` to Athlete model
- Positioned after `side` field for logical grouping of biometric data

**Verification:**
- ✓ Schema migration applied successfully
- ✓ Prisma client regenerated
- ✓ Database schema in sync

### Task 2: Update availability service to include biometrics ✓
**Commit:** 45a0a3d

Updated `availabilityService.js` to include athlete biometrics (side, canScull, canCox) in team availability API response. Updated `athleteService.js` to allow creating and updating these fields.

**Changes to availabilityService.js:**
- Added `side`, `canScull`, `canCox` to athlete query select
- Added biometric fields to return structure in getTeamAvailability

**Changes to athleteService.js:**
- Added `canScull`, `canCox` to createAthlete function (optional fields, defaults to false)
- Added `canScull`, `canCox` to allowedFields in updateAthlete
- Added `canScull`, `canCox` to formatAthlete output (with ?? false fallback)

**Verification:**
- ✓ Availability API now returns biometrics per athlete
- ✓ Athletes can be created/updated with biometric data
- ✓ API response structure matches expected format

### Task 3: Update types and AvailabilityGrid to display biometrics ✓
**Commit:** 182a610

Updated TypeScript types to include biometric fields in `AthleteAvailability` interface. UI display deferred to plan 04-09 when AvailabilityGrid component will be created.

**Changes:**
- Added `side: string | null` to AthleteAvailability
- Added `canScull: boolean` to AthleteAvailability
- Added `canCox: boolean` to AthleteAvailability

**Verification:**
- ✓ TypeScript build passes without errors
- ✓ Types match API response structure
- ✓ Ready for UI component implementation in 04-09

## Verification Results

All success criteria met:

- ✓ Athlete model has canScull (boolean) and canCox (boolean) fields
- ✓ GET /api/v1/availability/team includes side, canScull, canCox per athlete
- ✓ TypeScript types include biometrics fields
- ✓ Build passes without errors
- ✓ Schema migration applied successfully

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added canScull/canCox to athlete service formatting**

- **Found during:** Task 2
- **Issue:** formatAthlete function didn't include new biometric fields
- **Fix:** Added `canScull` and `canCox` to formatAthlete base object with `?? false` fallback
- **Files modified:** server/services/athleteService.js
- **Commit:** 45a0a3d
- **Rationale:** Required for API consistency - all athlete endpoints need to return biometric fields

**2. [Rule 3 - Blocking] Deferred UI implementation**

- **Found during:** Task 3
- **Issue:** AvailabilityGrid.tsx doesn't exist yet (created in plan 04-09)
- **Fix:** Updated types only, documented UI deferral
- **Files modified:** src/v2/types/coach.ts
- **Commit:** 182a610
- **Rationale:** Types are prerequisites for component creation, UI will be implemented when component exists

## Technical Decisions

### Biometric Field Defaults
**Decision:** Set default values to `false` for both `canScull` and `canCox`

**Rationale:**
- Conservative default - capabilities must be explicitly enabled by coaches
- Prevents incorrect assumptions about athlete abilities
- Coaches control athlete capabilities rather than athletes self-reporting
- Follows pattern of opt-in rather than opt-out for safety-critical data

**Alternatives Considered:**
1. Default `true` - Rejected: Unsafe assumption about athlete capabilities
2. Required fields (no default) - Rejected: Would break existing athlete records
3. Nullable fields - Rejected: Boolean is clearer than three-state (true/false/null)

### UI Implementation Deferral
**Decision:** Update types in this plan, defer AvailabilityGrid UI to plan 04-09

**Rationale:**
- AvailabilityGrid component doesn't exist yet (Wave 3 work)
- Types are prerequisites for component creation
- Splitting concerns: data layer (this plan) vs. UI layer (04-09)
- Enables parallel development - another developer could work on UI with types ready

**Alternatives Considered:**
1. Create placeholder AvailabilityGrid - Rejected: Creates merge conflicts with 04-09
2. Skip type updates - Rejected: Would require revisiting types in 04-09
3. Block until 04-09 complete - Rejected: Unnecessary serialization of independent work

## Dependencies

### Requires (Built Upon)
- **04-04 (Availability API):** Used `availabilityService.js` as base for biometrics enhancement

### Provides (Deliverables)
- **athlete-biometrics-schema:** Database schema with canScull, canCox, side fields
- **athlete-biometrics-api:** REST API returning athlete biometrics in availability and athlete endpoints
- **athlete-biometrics-types:** TypeScript interfaces with biometric fields

### Affects (Future Impact)
- **04-09 (AvailabilityGrid UI):** Will consume AthleteAvailability type with biometrics
- **Future lineup planning:** Biometric data enables smarter lineup suggestions
- **Athlete profile management:** Coaches can now track sculling and coxing capabilities

## Key Files Modified

### Schema
- `prisma/schema.prisma` - Added canScull and canCox to Athlete model

### Backend Services
- `server/services/availabilityService.js` - Include biometrics in team availability query
- `server/services/athleteService.js` - Support creating/updating/formatting biometric fields

### Frontend Types
- `src/v2/types/coach.ts` - Added biometrics to AthleteAvailability interface

## Testing Evidence

**Schema Migration:**
```
✓ Database schema in sync (prisma db push)
✓ Prisma client generated with new fields
```

**TypeScript Build:**
```
✓ Built in 12.56s
✓ No type errors
✓ All modules compiled successfully
```

## Next Phase Readiness

**Status:** Ready for Wave 3 UI work

**Enablers for 04-09:**
- ✓ Athlete biometrics available in API
- ✓ TypeScript types defined
- ✓ Backend services updated

**No Blockers:** All data layer work complete, UI can consume biometrics when AvailabilityGrid is created.

**Integration Notes:**
- AvailabilityGrid can display side badges (P/S/B/C) using `athlete.side`
- Sculling capability indicated with `athlete.canScull`
- Coxing capability indicated with `athlete.canCox`
- Suggested UI: Compact badges in athlete name column (200px width)

## Lessons Learned

### What Went Well
- Clean separation of data layer (this plan) and UI layer (04-09)
- Schema changes applied without data loss
- Consistent API response structure across availability and athlete endpoints
- TypeScript types enforce biometrics contract

### Process Improvements
- Dependency planning worked well - blocked correctly on 04-04
- Task splitting enabled clear atomic commits
- Deferral decision documented prevents confusion in 04-09

### Technical Insights
- Prisma `db push` effective for development schema changes
- Boolean defaults (`@default(false)`) cleaner than nullable fields for capabilities
- Service layer formatting function (`formatAthlete`) is single source of truth for API shape
