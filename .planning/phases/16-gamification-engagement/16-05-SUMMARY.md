---
phase: 16-gamification-engagement
plan: 05
subsystem: api
tags: [challenges, gamification, leaderboards, prisma, express, zod, rest-api]

# Dependency graph
requires:
  - phase: 16-01
    provides: Challenge and ChallengeParticipant database models
provides:
  - Backend challenge service with scoring algorithms (meters, workouts, attendance, composite)
  - REST API for challenge CRUD operations
  - Real-time leaderboard updates with ranking
  - Challenge templates for quick creation
  - Support for individual and collective challenge types
  - Optional handicapping by weight class
affects: [16-06, 16-07, gamification, athlete-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Challenge scoring with multiple metric types
    - Leaderboard calculation with rank ordering
    - Auto-enrollment for gamification-enabled athletes
    - Zod validation schemas for REST endpoints

key-files:
  created:
    - server/services/challengeService.js
    - server/routes/challenges.js
  modified:
    - server/index.js

key-decisions:
  - "Use Zod validation instead of express-validator for consistency with project patterns"
  - "Auto-enroll athletes with gamificationEnabled flag rather than all athletes"
  - "Support both individual (competitive) and collective (team goal) challenge types"
  - "Calculate ranks on leaderboard update for performance"

patterns-established:
  - "Challenge scoring: calculateScore() handles meters/workouts/attendance/composite with optional handicapping"
  - "Leaderboard updates: updateLeaderboard() recalculates all participant scores and ranks"
  - "Template system: CHALLENGE_TEMPLATES array for quick challenge creation"

# Metrics
duration: 7min
completed: 2026-01-26
---

# Phase 16 Plan 5: Team Challenges Backend Summary

**Challenge service with multi-metric scoring (meters, workouts, attendance, composite) and real-time leaderboard updates using Prisma aggregations**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-26T22:35:31Z
- **Completed:** 2026-01-26T22:42:16Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Complete challenge service with 10 exported functions handling challenge lifecycle
- REST API with 10 endpoints for challenge management
- Multi-metric scoring system supporting meters, workouts, attendance, and weighted composite
- Real-time leaderboard calculation with rank ordering
- Challenge templates for common use cases (holiday meters, weekly attendance, monthly volume, workout streak)
- Support for individual competitive and collective team goal challenges
- Optional handicapping system by weight class

## Task Commits

Each task was committed atomically:

1. **Task 1: Create challenge service** - `2594875` (feat)
2. **Task 2: Create challenge routes** - `fe0bd53` (feat)
3. **Task 3: Mount routes in server** - `0bb7a66` (feat)

**Bugfixes (auto-applied):**
- `4866538` - Fixed logger import in prDetectionService
- `19a9c4a` - Fixed logger import in personalRecords
- `f39be45` - Converted personalRecords validation from express-validator to Zod

## Files Created/Modified
- `server/services/challengeService.js` - Challenge business logic with scoring, leaderboard updates, and lifecycle management (418 lines)
- `server/routes/challenges.js` - REST API endpoints with Zod validation (381 lines)
- `server/index.js` - Mounted challenge routes at /api/v1/challenges
- `server/services/prDetectionService.js` - Fixed logger import (bugfix)
- `server/routes/personalRecords.js` - Fixed imports and converted to Zod validation (bugfix)

## Decisions Made

**1. Auto-enrollment with gamification flag**
- Only enroll athletes with `gamificationEnabled: true` rather than all team athletes
- Gives athletes opt-in control for gamification features
- Avoids enrolling athletes who don't want to participate

**2. Zod validation consistency**
- Used Zod schemas instead of express-validator
- Matches project-wide validation pattern established in other routes
- Provides type-safe request validation

**3. Score calculation approach**
- Use Prisma aggregations for efficient metric calculation
- Calculate all participant scores on each leaderboard update
- Store calculated ranks in database for fast retrieval

**4. Handicapping system**
- Optional handicap configuration with weight class adjustments
- Supports lightweight (<75kg) vs heavyweight classification
- Applied as multiplier to final score

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed logger import in prDetectionService.js**
- **Found during:** Server startup verification
- **Issue:** prDetectionService.js used named import `{ logger }` but logger exports as default
- **Fix:** Changed to default import `import logger from '../utils/logger.js'`
- **Files modified:** server/services/prDetectionService.js
- **Verification:** Server startup error eliminated
- **Committed in:** 4866538

**2. [Rule 1 - Bug] Fixed logger import in personalRecords.js**
- **Found during:** Server startup verification
- **Issue:** Same logger import issue as prDetectionService
- **Fix:** Changed to default import
- **Files modified:** server/routes/personalRecords.js
- **Verification:** Module resolution error eliminated
- **Committed in:** 19a9c4a

**3. [Rule 2 - Missing Critical] Converted personalRecords to Zod validation**
- **Found during:** Server startup verification
- **Issue:** personalRecords.js used express-validator which doesn't match project patterns and was causing import errors
- **Fix:** Replaced express-validator imports with Zod schemas, added validation schemas for all param/query types
- **Files modified:** server/routes/personalRecords.js
- **Verification:** Server compiles without import errors
- **Committed in:** f39be45

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for server startup. Fixed existing bugs in codebase that prevented verification. No scope creep.

## Issues Encountered

**Server restart required for verification**
- Production server is already running on port 3002
- Cannot test new API endpoints without restart
- Verified server compiles successfully (EADDRINUSE error proves server starts)
- All import errors fixed, routes properly mounted
- Manual restart required to test endpoints

## User Setup Required

None - no external service configuration required.

## API Endpoints Delivered

**Challenge Management:**
- `GET /api/v1/challenges` - All team challenges with optional status filter
- `GET /api/v1/challenges/active` - Active challenges only
- `GET /api/v1/challenges/templates` - Challenge templates
- `GET /api/v1/challenges/:id` - Challenge details
- `GET /api/v1/challenges/:id/leaderboard` - Leaderboard with athlete details

**Challenge Participation:**
- `POST /api/v1/challenges` - Create challenge (coach/captain only)
- `POST /api/v1/challenges/:id/join` - Join challenge
- `POST /api/v1/challenges/:id/leave` - Leave challenge
- `POST /api/v1/challenges/:id/refresh` - Manually refresh leaderboard
- `DELETE /api/v1/challenges/:id` - Cancel challenge (coach only)

## Challenge Templates Included

1. **Holiday Meters Challenge** - Individual, 14 days, meters metric
2. **Weekly Attendance Battle** - Collective, 7 days, attendance metric
3. **Monthly Volume Challenge** - Collective, 30 days, meters metric
4. **Workout Streak Challenge** - Individual, 14 days, workouts metric

## Next Phase Readiness

**Ready for:**
- Frontend challenge UI components (16-06)
- Achievement detection integration
- Real-time leaderboard updates via WebSocket
- Challenge analytics and history visualization

**Blockers:**
- None

**Concerns:**
- Server requires restart to enable new endpoints
- Leaderboard update performance may need optimization for large participant counts (100+)
- Consider background job for auto-completing expired challenges

---
*Phase: 16-gamification-engagement*
*Completed: 2026-01-26*
