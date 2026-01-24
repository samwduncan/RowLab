---
phase: 07-erg-data-performance
plan: 04
subsystem: erg-data
tags: [csv, papaparse, bulk-import, validation, fuzzy-matching]

# Dependency graph
requires:
  - phase: 07-01
    provides: useBulkImportErgTests hook and bulk-import API endpoint
  - phase: 06-05
    provides: CSV import pattern with PapaParse and column mapping
provides:
  - CSV bulk import wizard for erg tests with 5-step flow
  - Time parsing utilities handling multiple formats (MM:SS.s, HH:MM:SS, seconds)
  - Test type normalization (2k, 6k, 30min, 500m variants)
  - Athlete name fuzzy matching for CSV import
affects: [07-05, future-csv-imports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSV parsing with PapaParse worker threads for files >500KB
    - Fuzzy column matching with normalize() function
    - Multi-format time parsing (MM:SS.s, HH:MM:SS, numeric)
    - Athlete lookup by name with fuzzy matching

key-files:
  created:
    - src/v2/utils/ergCsvParser.ts
    - src/v2/components/erg/ErgCSVImportModal.tsx
    - src/v2/components/erg/ErgImportPreview.tsx
    - src/v2/components/erg/ErgColumnMapper.tsx
  modified:
    - src/v2/components/erg/index.ts
    - src/v2/pages/ErgTestsPage.tsx

key-decisions:
  - "Time format parser supports MM:SS.s, MM:SS, HH:MM:SS, and numeric seconds"
  - "Test type normalization handles common variations (2k/2K/2000m/2000)"
  - "Athlete matching uses fuzzy search on first/last name combinations"
  - "Worker threads at 500KB threshold for CSV parsing performance"

patterns-established:
  - "Time parsing: parseTimeToSeconds() handles multiple common spreadsheet formats"
  - "Test type normalization: parseTestType() maps variations to canonical types"
  - "CSV column auto-mapping: fuzzy matching with normalize() for common variations"

# Metrics
duration: 16min
completed: 2026-01-24
---

# Phase 7 Plan 04: CSV Bulk Import Wizard Summary

**Complete CSV bulk import wizard with fuzzy column mapping, time/type parsing, and athlete name matching for erg test data**

## Performance

- **Duration:** 16 min
- **Started:** 2026-01-24T18:27:47Z
- **Completed:** 2026-01-24T18:43:41Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- CSV parser with automatic column mapping and fuzzy matching
- Time format parser supporting MM:SS.s, HH:MM:SS, and numeric seconds
- Test type normalization handling 2k/6k/30min/500m variants
- 5-step import wizard (Upload, Map, Preview, Importing, Complete)
- Validation preview showing valid/invalid counts with error details
- Athlete name matching with fuzzy search

## Task Commits

Each task was committed atomically:

1. **Task 1: Create erg CSV parsing utilities** - `7a12c1c` (feat)
2. **Task 2: Create ErgImportPreview and ErgCSVImportModal components** - `8c64be4` (feat)
3. **Task 3: Integrate import wizard into ErgTestsPage** - `bf1b8ee` (feat)
4. **Bug fix: Correct test type normalization regex** - `2508f7b` (fix)

## Files Created/Modified
- `src/v2/utils/ergCsvParser.ts` - CSV parsing, validation, and normalization utilities
- `src/v2/components/erg/ErgCSVImportModal.tsx` - 5-step import wizard modal
- `src/v2/components/erg/ErgImportPreview.tsx` - Preview table with valid/invalid counts
- `src/v2/components/erg/ErgColumnMapper.tsx` - Column mapping component
- `src/v2/components/erg/index.ts` - Export new components
- `src/v2/pages/ErgTestsPage.tsx` - Add "Import CSV" button and modal integration

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| parseTimeToSeconds() supports MM:SS.s, MM:SS, HH:MM:SS, numeric | Handles common spreadsheet time formats without requiring users to convert |
| parseTestType() normalizes variations (2000m → 2k) | Accepts common user inputs (2K, 2000, 2000m) and maps to canonical types |
| Athlete matching uses fuzzy search | Handles "First Last" or "Last, First" formats with partial matching |
| Worker threads at 500KB CSV threshold | Same as Phase 6 pattern - prevents UI blocking for ~5,000 rows |
| Required columns: athleteName, testType, testDate, timeSeconds | Minimum viable data for erg test creation |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test type normalization regex**
- **Found during:** Verification testing after Task 1
- **Issue:** Regex `/meters?$/i` didn't match single 'm' suffix, so "2000m" wasn't normalized to "2k"
- **Fix:** Changed regex to `/m(eters?)?$/` to properly match 'm', 'meter', or 'meters' suffixes
- **Files modified:** src/v2/utils/ergCsvParser.ts
- **Verification:** Manual testing confirmed "2000m" → "2k", "6000m" → "6k", "500m" → "500m"
- **Committed in:** `2508f7b` (separate fix commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix necessary for correct test type normalization. No scope creep.

## Issues Encountered
None - all tasks executed as planned.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSV bulk import fully functional for erg tests
- Pattern established for future CSV imports in other features
- Ready for erg history visualization (07-03) and C2 sync UI (07-05)

---
*Phase: 07-erg-data-performance*
*Completed: 2026-01-24*
