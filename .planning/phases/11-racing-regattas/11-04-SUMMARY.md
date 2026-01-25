# Plan 11-04 Summary: Event/Race/Results Components

## Status: COMPLETE

## What Was Built

### EventForm.tsx
- Category quick-select buttons for common events (Varsity 8+, 2V8+, etc.)
- Custom event name input when "Custom" selected
- Scheduled day selector for multi-day regattas
- Zod validation with react-hook-form

### RaceForm.tsx
- Race name input (Heat 1, Final A, etc.)
- Boat class selector using getBoatClasses()
- Distance selector with common options (2000m, 1500m, head race distances)
- Head race toggle with explanation
- Scheduled time with datetime-local input

### MarginDisplay.tsx
- Toggle between terminology ("1/2 length") and exact ("2.34s")
- Uses getMarginInfo from marginCalculations
- MarginBadge compact variant for tables
- Graceful handling of missing winner time

### ResultsForm.tsx
- Multi-entry form with dynamic field array
- Place indicators with trophy/medal icons
- Team name, place, and time inputs per row
- "Us" checkbox highlights own team entries
- Lineup selector when own team checked
- Add/remove entry buttons

### RegattaDetail.tsx
- Full regatta header with metadata and team goals
- Expandable event cards with race count
- Race rows showing results, own team result badge
- Modal forms for adding events/races/results
- Delete actions for events and races

### timeFormatters.ts
- Re-exports parseTimeToSeconds and formatSecondsToTime from marginCalculations
- Cleaner import path for components

## Commits
- `6a4e22a` - feat(11-04): add event/race/results components and RegattaDetail

## Key Decisions
- Used quick-select buttons for common events (faster than dropdown)
- MarginDisplay toggles in-place rather than requiring preference setting
- ResultsForm starts with one "own team" entry pre-checked
- RegattaDetail uses modals for forms to keep hierarchy visible
- Expanded barrel exports for all new components

## Dependencies Satisfied
- Plans 11-06 through 11-09 can now use these components
- RegattaDetail is ready for page integration
- Margin display patterns can be reused elsewhere
