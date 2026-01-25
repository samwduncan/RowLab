# Plan 11-08 Summary: Team Rankings Components

## Status: COMPLETE

## What Was Built

### RankingsView.tsx
- Boat class selector with toggle buttons
- Rankings table with:
  - Rank badges (trophy/medal/award for top 3)
  - Team name with "Your Team" highlight
  - Speed estimate in m/s
  - Confidence indicator (green/amber/red dots)
  - Sample count and last updated age
- Confidence legend explaining dot colors
- SourceBadge component for ranking sources
- AgeIndicator component for staleness display

### RankingImportForm.tsx
- Source selector (Row2k, USRowing, RegattaCentral, Manual)
- Team dropdown populated from external teams
- Boat class and ranking number inputs
- Season selector with recent options
- As-of date picker
- Notes field for source URLs/context
- Zod validation for all fields

### HeadToHeadTable.tsx
- Record summary with win/loss count
- Trending icon (up/down/neutral)
- Race history list with:
  - Win/loss/tie indicator icon
  - Regatta name and date
  - Place comparison (1st vs 3rd)
  - Time margin (+/- seconds)
- HeadToHeadSummary compact variant

## Commits
- `00cf92b` - feat(11-08): add team rankings components

## Key Decisions
- Rankings keyed by teamId + boatClass for uniqueness
- Confidence based on sample count thresholds (5/10 races)
- Head-to-head margin shows positive for wins
- Source badges use brand-appropriate colors
- Season options hardcoded (could be dynamic)

## Dependencies Satisfied
- Integrates with useTeamRankings hooks from 11-02
- Rankings page can display all boat classes
- Head-to-head useful for regatta preparation
