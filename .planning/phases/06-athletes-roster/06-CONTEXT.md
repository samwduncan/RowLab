# Phase 6: Athletes & Roster Management - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Coach roster management — viewing, filtering, importing, and tracking attendance for athletes. Includes grid/list views, search, filters, CSV bulk import, athlete profiles with biometrics, and daily attendance recording. Also addresses light/field theme CSS fixes and table virtualization.

</domain>

<decisions>
## Implementation Decisions

### Roster display
- Toggle between table/list and card grid views — coach picks
- Default to table view (minimal: name, side, status columns)
- Card grid shows photo + name + side preference only
- View preference persists between sessions (saved to user prefs)
- Optional photo upload with initials fallback for avatars

### CSV import flow
- Modal wizard: upload → map columns → preview → confirm
- Smart auto-map column headers with manual override
- Validation shows summary + error list (not inline on every row)

### Claude's Discretion
- Athlete editing UX (slide-out panel vs modal vs dedicated page)
- Empty state design
- Which columns are sortable in table view
- Partial import handling (import valid only vs all-or-nothing)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the "Precision Instrument" design language (Raycast/Linear/Vercel inspired).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-athletes-roster*
*Context gathered: 2026-01-24*
