---
phase: 16
plan: 01
subsystem: gamification-foundation
tags: [prisma, database, schema, dependencies, gamification]
requires: [phase-15]
provides: [gamification-schema, achievement-models, challenge-models, pr-models]
affects: [16-02, 16-03, 16-04]
tech-stack:
  added: [html-to-image, file-saver]
  patterns: [explicit-many-to-many, contextual-scoping]
key-files:
  created: []
  modified: [prisma/schema.prisma, package.json]
decisions:
  - id: gamification-opt-out
    choice: Per-athlete gamificationEnabled field
    rationale: Athletes can disable gamification individually even if team enables it
  - id: achievement-join-table
    choice: Explicit many-to-many AthleteAchievement model
    rationale: Stores progress metadata (progress count, unlockedAt timestamp) not possible with implicit m-n
  - id: challenge-types
    choice: individual and collective challenge types
    rationale: Supports both competitive individual leaderboards and collaborative team goals
  - id: pr-contextual-scopes
    choice: scope + scopeContext fields for PRs
    rationale: Enables all-time, season, training-block PRs with clear context filtering
  - id: html-to-image-library
    choice: html-to-image over html2canvas
    rationale: 3x faster per RESEARCH.md, better for shareable achievement card generation
duration: 2 minutes
completed: 2026-01-26
---

# Phase 16 Plan 01: Gamification Schema & Dependencies Summary

**One-liner:** Established gamification database foundation with Achievement/Challenge/PR models, per-athlete opt-out, and card generation dependencies

## What Was Built

### Dependencies Installed
- **html-to-image** (1.11.13): Client-side DOM-to-image conversion for shareable cards (3x faster than html2canvas)
- **file-saver** (2.0.5): Cross-browser file download support
- **@types/file-saver**: TypeScript type definitions

### Database Schema Changes

**Athlete Model Extension:**
- Added `gamificationEnabled` Boolean field (default: true) for per-athlete opt-out
- Added relations: achievements, challengeParticipations, personalRecords

**Achievement System:**
- `Achievement` model: name, description, category (Erg/Attendance/Racing), type (first-time/volume/performance/consistency), rarity (Common/Rare/Epic/Legendary), criteria (JSON), icon
- `AthleteAchievement` explicit join table: athleteId, achievementId, progress (Int), unlockedAt (DateTime?), isPinned (Boolean)
- Supports 4 rarity tiers per CONTEXT.md: Common (easy), Rare (effort), Epic (dedication), Legendary (exceptional)

**Team Challenges:**
- `Challenge` model: teamId, name, description, type (individual/collective), status (active/completed/cancelled), startDate, endDate, metric (meters/workouts/attendance/composite), formula (JSON), handicap (JSON), templateId
- `ChallengeParticipant` model: challengeId, athleteId, score (Decimal), rank (Int?), contribution (JSON)
- Added challenges relation to Team model

**Personal Records:**
- `PersonalRecord` model: athleteId, teamId, testType (2k/6k/500m), scope (all-time/season/training-block), scopeContext (season name or training block ID), ergTestId, result, previousBest, improvement, achievedAt
- Unique constraint on athleteId + testType + scope + scopeContext

## Technical Decisions

### 1. Explicit Many-to-Many for Achievements
**Decision:** Used explicit AthleteAchievement join table instead of Prisma implicit m-n
**Rationale:** Required to store progress metadata (progress count, unlockedAt timestamp, isPinned) that implicit relations cannot support
**Impact:** Enables progress tracking for incomplete achievements (e.g., "23 out of 50 workouts")

### 2. Per-Athlete Gamification Opt-Out
**Decision:** Added gamificationEnabled field at Athlete level (default: true)
**Rationale:** Per CONTEXT.md: athletes can disable gamification individually even if team has it enabled
**Impact:** Respects athlete preference while maintaining team-level feature toggle from Phase 15

### 3. html-to-image Over html2canvas
**Decision:** Installed html-to-image library instead of html2canvas
**Rationale:** Per RESEARCH.md: html-to-image is 3x faster for DOM-to-image conversion
**Impact:** Better performance for shareable achievement card generation

### 4. Challenge Type Flexibility
**Decision:** Challenge.type as string "individual" or "collective"
**Rationale:** Supports both competitive individual leaderboards and collaborative team goals
**Impact:** Enables diverse challenge mechanics (compete vs. cooperate)

### 5. Contextual PR Scopes
**Decision:** PersonalRecord uses scope + scopeContext pattern
**Rationale:** Enables filtering by all-time, season, or training-block with clear context
**Impact:** Athletes can view PRs across multiple contexts without separate tables

## Deviations from Plan

None - plan executed exactly as written.

## Schema Verification

All models created successfully:
- ✓ Achievement model with 4 rarity tiers
- ✓ AthleteAchievement explicit join table with progress tracking
- ✓ Challenge and ChallengeParticipant models
- ✓ PersonalRecord model with contextual scoping
- ✓ Athlete.gamificationEnabled field
- ✓ Team.challenges relation

Database sync completed via `prisma db push` (125 seconds total)
Prisma client regenerated successfully

## Next Phase Readiness

**Phase 16 Plan 02 (TanStack Query Hooks)** can proceed immediately:
- Achievement, Challenge, PersonalRecord models available in Prisma client
- Type definitions needed for TypeScript
- Query hooks can reference these models

**Blockers:** None

**Concerns:** None - standard Prisma schema extension

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| package.json | Added html-to-image, file-saver, @types/file-saver | +3 deps |
| prisma/schema.prisma | Added 5 models, 1 field, 1 relation | +130 lines |

## Commits

| Hash | Message | Files |
|------|---------|-------|
| 3a18be1 | feat(16-01): install html-to-image and file-saver dependencies | package.json, package-lock.json |
| e8deed6 | feat(16-01): add gamificationEnabled field to Athlete model | prisma/schema.prisma |
| 525b8ec | feat(16-01): add Achievement and AthleteAchievement models | prisma/schema.prisma |
| 6aabaec | feat(16-01): add Challenge and ChallengeParticipant models | prisma/schema.prisma |
| c89c1f2 | feat(16-01): add PersonalRecord model | prisma/schema.prisma |

## Testing Notes

**Manual Verification:**
- `npm ls html-to-image file-saver` shows both installed
- `grep -c "model Achievement" prisma/schema.prisma` returns 1
- `grep -c "model Challenge" prisma/schema.prisma` returns 2 (Challenge + ChallengeParticipant)
- `grep -c "gamificationEnabled" prisma/schema.prisma` returns 1
- `npx prisma db push` completed without errors

**Database Verification:**
Tables created: achievements, athlete_achievements, challenges, challenge_participants, personal_records
Athlete table updated with gamificationEnabled column and new relations

## Architecture Notes

**Key Patterns Established:**
1. **Explicit many-to-many**: AthleteAchievement stores progress metadata
2. **Contextual scoping**: PersonalRecord scope + scopeContext pattern
3. **Per-athlete opt-out**: gamificationEnabled at Athlete level
4. **Challenge flexibility**: individual vs. collective types via string field

**Consistent with Phase 6 Decision:**
- Used `db push` instead of migrate (database has drift from migration history)
- Status fields as strings (not Prisma enums) for flexibility

**Integration Points:**
- Achievement criteria JSON enables flexible achievement conditions
- Challenge formula/handicap JSON enables custom scoring algorithms
- PersonalRecord ergTestId links to existing ErgTest model

## Performance Considerations

**Indexing Strategy:**
- AthleteAchievement: indexed on athleteId, unlockedAt for quick queries
- Challenge: indexed on teamId, status, endDate for active challenge lookups
- ChallengeParticipant: indexed on challengeId, score for leaderboard queries
- PersonalRecord: indexed on athleteId, teamId, testType for PR lookups

**JSON Fields:**
- Achievement.criteria: flexible achievement conditions without schema changes
- Challenge.formula: custom scoring formulas (e.g., weighted composite metrics)
- Challenge.handicap: optional handicapping (e.g., weight-class adjustments)
- ChallengeParticipant.contribution: collective challenge breakdown

## Known Limitations

None identified during execution.

## Success Criteria

- [x] html-to-image and file-saver installed
- [x] Athlete model has gamificationEnabled field
- [x] Achievement/AthleteAchievement models exist with explicit m-n
- [x] Challenge/ChallengeParticipant models exist with individual/collective types
- [x] PersonalRecord model exists with contextual scopes
- [x] Database schema synced successfully

All success criteria met.
