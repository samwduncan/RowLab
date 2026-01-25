# Phase 11: Racing & Regattas - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Coach can manage regattas, entries, results, and track team rankings against competitors. This includes regatta CRUD, race creation within regattas, race entries linked to lineups, result entry with margins, Race Day Command Center, heat sheet with progression rules, warm-up launch schedule, external rankings import, and team ranking comparisons.

</domain>

<decisions>
## Implementation Decisions

### Regatta Structure
- Hierarchy: Regatta → Events → Races (Event = "Varsity 8+", Race = Heat 1, Final, etc.)
- Race entries can link existing lineup OR create entry-specific lineup (both options)
- Progression between heats/finals: System suggests advancement based on results, coach confirms
- Comprehensive metadata: name, location, dates, host, venue type, course distance, weather, external links (RegattaCentral, row2k), notes, team goals
- Event categories from predefined list (V8+, 2V8+, JV4+, etc.) with ability to add custom
- Multi-day support with full day × time schedule grid view
- Regatta list: combined view with list as default and calendar toggle

### External Rankings
- Multiple sources supported: Row2k, USRowing, RegattaCentral, plus manual entry
- Import method: Manual entry as primary/default, scraping as optional convenience
- Display: Unified ranking view with source badges (not separate tabs)
- Confidence: Show age simply ("Updated 3 days ago"), confidence score on hover/tap

### Results & Margins
- Entry format: Place + time (flexible for partial data)
- Margin display: Both rowing terminology ("1 length", "open water") and exact seconds with toggle
- Import: Manual entry by default, CSV import available for large regattas
- Historical comparison: Both same-event history ("Last year we were 3rd") AND head-to-head tracking ("2-1 against Cornell")

### Race Day Command Center
- Primary view: Full day horizontal timeline with current time marker
- Alerts: Full logistics (race, warmup, athlete check-in, equipment prep reminders)
- Warm-up scheduling: Auto-calculated based on race time + configurable duration, coach can override
- Pre-race checklists:
  - Team templates (home regatta, away regatta, etc.) assigned per regatta
  - Role-based items: some coxswain-only, some coach-only, some anyone
  - Coxswains check items, coach sees real-time progress
  - Checklists always visible for race entry (no trigger needed)

### Claude's Discretion
- Regatta template/duplicate feature (duplicate existing as starting point vs fresh each time)
- Offline capability for Command Center (online-only vs offline-capable with sync)
- Alert timing intervals (30/15/5 min or other)
- CSV import format for results

</decisions>

<specifics>
## Specific Ideas

- Pre-race checklist examples from user: "oars taken down to dock" type logistics items
- Checklists should feel collaborative between coach (sets up, monitors) and coxswains (execute, check off)
- Timeline-centric view for race day rather than countdown-centric
- Rowing terminology for margins is important for traditional feel (coaches expect "open water" not just "5.2 seconds")

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-racing-regattas*
*Context gathered: 2026-01-25*
