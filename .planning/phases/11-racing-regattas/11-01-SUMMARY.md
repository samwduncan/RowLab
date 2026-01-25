# Plan 11-01 Summary: Types and Utility Functions

## Status: COMPLETE

## What Was Built

### Type Definitions (src/v2/types/regatta.ts)

**Core Types:**
- `Regatta` - Full regatta with extended metadata (endDate, host, venueType, externalUrl, teamGoals)
- `Event` - Event tier between Regatta and Race
- `Race` - Race with eventId, checklist reference
- `RaceResult` - Result with margin and speed calculations
- `RegattaFormData`, `EventFormData`, `RaceFormData`, `RaceResultFormData`

**Checklist Types:**
- `ChecklistRole` - 'coach' | 'coxswain' | 'anyone'
- `ChecklistTemplate`, `ChecklistTemplateItem`
- `RaceChecklist`, `RaceChecklistItem`
- `ChecklistTemplateFormData`
- `ChecklistProgress`

**Rankings Types:**
- `RankingSource` - 'row2k' | 'usrowing' | 'regattacentral' | 'manual'
- `ExternalRanking`, `ExternalRankingFormData`
- `ExternalTeam`
- `TeamSpeedEstimate`
- `HeadToHeadComparison`

**Race Day Types:**
- `RaceDayEventType` - 'race' | 'warmup' | 'checkin' | 'equipment-prep'
- `RaceDayEvent`
- `WarmupScheduleItem`
- `MarginDisplayMode`, `MarginInfo`

### Margin Calculations (src/v2/utils/marginCalculations.ts)

**Extended Functions:**
- `calculateMarginSeconds()` - Calculate time gap
- `calculateSpeed()` - Estimate speed from distance/time
- `secondsToBoatLengths()` - Convert time margin to boat lengths
- `boatLengthsToSeconds()` - Reverse conversion
- `formatMarginTerminology()` - Rowing-specific terms (Canvas, 1/4 length, Open water)
- `formatMarginExact()` - Exact seconds display
- `getMarginInfo()` - Combined margin information
- `calculateRaceMargins()` - Calculate margins for entire race
- `getBoatClasses()` - List of boat classes for UI
- `getBoatLengthMeters()` - Boat length lookup
- `parseTimeToSeconds()` - Parse MM:SS.s or HH:MM:SS.s
- `formatSecondsToTime()` - Format to MM:SS.s

### Warmup Calculator (src/v2/utils/warmupCalculator.ts)

- `calculateWarmupSchedule()` - Generate warmup schedule for races
- `updateLaunchTime()` - Manual override with warnings
- `detectWarmupConflicts()` - Find schedule conflicts
- `formatLaunchTime()` - HH:mm format
- `getTimeUntilLaunch()` - "45m", "2h 15m" format
- `getWarmupUrgency()` - critical/warning/normal/upcoming
- `groupWarmupsByTimeBlock()` - Group for timeline view
- `calculateRecoveryTime()` - Recovery between races
- `getDefaultWarmupConfig()` - Default 45min warmup, 15min travel

### Progression Rules (src/v2/utils/progressionRules.ts)

**Standard Patterns:**
- `direct-final` - All advance to final
- `heat-repechage` - Top 3 + repechage
- `heat-semifinal` - Heats to semis to finals
- `ab-final` - A/B final split

**Functions:**
- `calculateProgression()` - Determine qualifiers from results
- `formatRoundName()` - Display names for rounds
- `getProgressionOptions()` - UI options
- `getProgressionRules()` - Get rules by pattern
- `getNextRound()` - Next round for placement
- `getRoundColor()` - Color coding for rounds
- `validateProgressionEntries()` - Validate entry counts

## Commits
- `d201ec2` - feat(11-01): add regatta types and utility functions

## Verification
- All files pass `npx tsc --noEmit`
- Types match Prisma schema from 11-00
- Margin terminology matches rowing standards

## Key Decisions
- Store margins in seconds, display as terminology or exact
- Default warmup config: 45 minutes warmup + 15 minutes travel
- Boat lengths use World Rowing specs in feet, convert to meters
- Progression rules are configurable, not hardcoded

## Dependencies Satisfied
- Plan 11-02 (hooks) can import types and utilities
- Plan 11-04 (forms) can use margin display functions
- Plan 11-06 (command center) can use warmup calculator
