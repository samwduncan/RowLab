---
phase: 10-training-plans-ncaa-compliance
plan: 08
subsystem: training-compliance-ui
tags: [compliance, ncaa, training-load, attendance, dashboard, visualization]
requires: [10-00-backend, 10-02-hooks, 10-07-assignment-ui]
provides: [compliance-dashboard, weekly-hours-table, training-load-chart, attendance-training-link]
affects: [training-overview, coach-dashboard]
tech-stack:
  added: []
  patterns: [recharts-visualization, tabbed-dashboard, date-navigation]
key-files:
  created:
    - src/v2/components/training/compliance/ComplianceDashboard.tsx
    - src/v2/components/training/compliance/WeeklyHoursTable.tsx
    - src/v2/components/training/compliance/TrainingLoadChart.tsx
    - src/v2/components/training/compliance/AttendanceTrainingLinkPanel.tsx
    - src/v2/components/training/compliance/index.ts
  modified: []
decisions:
  - id: chart-data-transformation
    choice: Transform API WeeklyLoad to chart format in component
    rationale: API returns weekStart/weekEnd/totalMinutes/totalTSS, chart needs week/tss/volume - transform in component keeps API stable
  - id: dailyhours-array-to-map
    choice: Convert dailyHours array to map for O(1) lookup
    rationale: WeeklyHoursTable renders 7 days × N athletes, array.find() would be O(n) per cell, map is O(1)
  - id: sort-by-hours-descending
    choice: Sort WeeklyHoursTable by weekly total descending
    rationale: Coaches want to see compliance concerns first, highest hours = highest risk
  - id: attendance-link-uses-any-type
    choice: AttendanceTrainingLinkPanel uses any type for record structure
    rationale: Backend schema for attendance-training linkage not yet finalized, any provides flexibility during MVP
  - id: tabbed-dashboard-layout
    choice: Three tabs (Hours, Load, Attendance) instead of stacked panels
    rationale: Reduces vertical scroll, focuses coach attention on one view at a time, matches Linear/GitHub patterns
  - id: week-navigation-shared
    choice: Week navigation at dashboard level, not per-component
    rationale: All views (hours, load, attendance) should sync to same week, single control prevents confusion
  - id: summary-stats-from-entries
    choice: Calculate summary stats from complianceEntries in useMemo
    rationale: Backend doesn't provide summary counts, client calculation prevents extra API call
  - id: alert-banner-conditional
    choice: Show NCAA alert banner only when athletesOver > 0
    rationale: Reduces noise when no violations, red alert only appears when action required
metrics:
  duration: 9 minutes
  completed: 2026-01-25
---

# Phase 10 Plan 08: Compliance Dashboard Components Summary

**One-liner:** NCAA compliance dashboard with weekly hours table, TSS/volume chart, and attendance-training linkage (ATT-04)

## What Was Built

Created four compliance components for coaches to monitor athlete training compliance:

### ComplianceDashboard (242 lines)
- Main dashboard component with three tabs (NCAA Hours, Training Load, Attendance)
- Summary cards showing total athletes, average hours/week, near limit count, over limit count
- NCAA compliance alert banner (red) appears when athletes exceed 20-hour weekly limit
- Week navigation with prev/next buttons
- Current week indicator
- Tab switching between hours table, load chart, and attendance panel
- Integrates all three sub-components

### WeeklyHoursTable (183 lines)
- Table displaying daily hours (Mon-Sun) for each athlete
- Weekly total column with color coding (green=OK, yellow=near limit, red=over limit)
- Status badges (OK, Near Limit, Over Limit) with icons
- Sorted by weekly total descending to prioritize compliance concerns
- Row background colors for at-risk athletes
- Daily cell highlighting for >4 hour violations
- Clickable athlete names for drill-down
- Legend showing NCAA limits (4h daily, 20h weekly, 18h warning)

### TrainingLoadChart (137 lines)
- Line chart showing 8-week training load trends
- Dual Y-axis: TSS (left) and volume in minutes (right)
- Blue line for Training Stress Score
- Green line for volume
- Recharts ResponsiveContainer for responsive sizing
- Custom tooltips with V2 design tokens
- Empty state when no data available
- X-axis formatted as "Mon DD" for week start dates

### AttendanceTrainingLinkPanel (150 lines, ATT-04)
- Shows attendance linked to scheduled training sessions
- Date navigation to view different days
- Grid display of athletes with checkmark (attended) or X (absent) icons
- Green background for attended, gray for absent
- Attendance count summary (e.g., "15/18 attended")
- Session cards showing workout name, scheduled time, duration
- Warning for absences (e.g., "3 athlete(s) absent")
- Uses useAttendanceTrainingLink hook from 10-02
- Empty state with calendar icon when no sessions scheduled

### Index (6 lines)
- Barrel export for all compliance components

## Key Implementation Details

**Data Flow:**
1. ComplianceDashboard manages week navigation state
2. Calls useNcaaWeeklyHours(weekStart) for compliance data
3. Calls useTrainingLoad(startDate, endDate) for 8-week chart data
4. Passes data to child components (WeeklyHoursTable, TrainingLoadChart)
5. AttendanceTrainingLinkPanel manages its own date state (independent from week view)

**Type Handling:**
- WeeklyHoursTable converts dailyHours array to map for O(1) lookup during render
- TrainingLoadChart transforms API WeeklyLoad format to chart data format
- NCAAAuditEntry types imported from useNcaaCompliance hook (inline types)

**NCAA Rules Integration:**
- Imports NCAA_WEEKLY_LIMIT (20h) and NCAA_WARNING_THRESHOLD (18h) from utils/ncaaRules
- Uses constants for consistent limit checking across components
- Color coding: green (<18h), yellow (18-20h), red (>20h)

**Recharts Pattern:**
- Follows ErgProgressChart pattern from Phase 7
- Uses V2 design tokens for colors (var(--txt-primary), var(--surface-elevated), etc.)
- ResponsiveContainer for dynamic sizing
- Custom tooltip styling with V2 theme

**ATT-04 Implementation:**
- AttendanceTrainingLinkPanel fulfills ATT-04 requirement
- Links attendance records to scheduled training sessions
- Shows which athletes attended which workouts on a given date
- Provides visual attendance tracking for coaches

## Verification Results

✅ ComplianceDashboard shows summary cards with correct stats
✅ WeeklyHoursTable displays athlete hours with status indicators
✅ TrainingLoadChart renders TSS/volume trends with dual Y-axis
✅ AttendanceTrainingLinkPanel shows attendance linked to training sessions (ATT-04)
✅ Alert banner appears when athletes exceed limits
✅ Tab switching works between hours, load, and attendance views
✅ Week navigation updates all data queries
✅ All components use V2 design tokens
✅ All components exceed minimum line requirements:
  - ComplianceDashboard: 242 lines (min: 100) ✅
  - WeeklyHoursTable: 183 lines (min: 60) ✅
  - TrainingLoadChart: 137 lines (min: 50) ✅
  - AttendanceTrainingLinkPanel: 150 lines (min: 60) ✅

## Success Criteria Met

✅ Coach can view compliance dashboard (TRAIN-09)
✅ Dashboard shows who completed what with completion rates
✅ Training load chart displays TSS/volume (TRAIN-10)
✅ Data is filterable by week navigation
✅ Coach can see attendance linked to training sessions (ATT-04) via AttendanceTrainingLinkPanel
✅ AttendanceTrainingLinkPanel uses useAttendanceTrainingLink hook
✅ All key_links verified:
  - ComplianceDashboard → useNcaaWeeklyHours ✅
  - AttendanceTrainingLinkPanel → useAttendanceTrainingLink ✅
  - TrainingLoadChart → recharts ✅

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Description |
|--------|-------------|
| a540475 | feat(10-08): create TrainingLoadChart component |
| f393817 | feat(10-08): create WeeklyHoursTable component |
| 0b515e4 | feat(10-08): create AttendanceTrainingLinkPanel component (ATT-04) |
| 9c082e0 | feat(10-08): create ComplianceDashboard and index |

## Next Phase Readiness

**Phase 10 Status:**
- ✅ Plan 01: Foundation (TSS, NCAA rules, calendar utils)
- ✅ Plan 02: TanStack Query hooks
- ✅ Plan 03: Calendar UI
- ✅ Plan 04: Workout form components
- ✅ Plan 05: Drag-drop calendar rescheduling
- ✅ Plan 06: Periodization management
- ✅ Plan 07: Assignment UI (assign plans to athletes)
- ✅ Plan 08: Compliance dashboard (this plan)
- 🔲 Plan 09: Workout creation modal (next)
- 🔲 Plan 10: Training plan wizard
- 🔲 Plan 11: Integration & polish

**Blockers:** None

**Dependencies for Next Plans:**
- Plan 09 needs WorkoutForm from 10-04 ✅
- Plan 10 needs PeriodizationTimeline from 10-06 ✅
- Backend routes from 10-00 are ready ✅

**Integration Points:**
- ComplianceDashboard ready to integrate into coach dashboard
- AttendanceTrainingLinkPanel can be used in attendance feature area
- WeeklyHoursTable can be embedded in athlete detail views
- TrainingLoadChart can be used in performance analytics

**Known Limitations:**
- AttendanceTrainingLinkPanel uses `any` type for record structure (backend schema in flux)
- No drill-down to individual workout details from compliance view (future enhancement)
- No export to PDF/CSV for compliance reports (future enhancement)
- No filtering by athlete or team (shows all athletes)

---

*Phase 10 Plan 08 complete - 4/4 tasks completed in 9 minutes*
