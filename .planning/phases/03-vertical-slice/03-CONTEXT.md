# Phase 3: Vertical Slice (Personal Dashboard) - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete "Me" context with adaptive dashboard showing personalized headline, Concept2 logbook widget, Strava activity feed widget, and unified activity stream with deduplication. User can customize which widgets appear. Dashboard preferences stored server-side.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Bento grid layout with widgets of varying sizes
- Hero section at top: headline + quick stats, then bento grid below
- Grid auto-fills — no empty placeholders, collapse empty slots
- Widget sizes: Claude's discretion based on content type
- Responsive behavior: Claude's discretion
- Max width behavior: Claude's discretion
- Widget visual consistency: Claude's discretion

### Headline Widget Behavior
- Adaptive heuristics determine headline message (not fixed to time-of-day or goal-only)
- Heuristics consider: activity data + schedule (recent workouts, streaks, PBs, goal progress, upcoming sessions)
- Does NOT consider external data (weather, etc.) for V1
- CTA presence: Claude's discretion
- Refresh strategy: Claude's discretion

### Activity Feed Presentation
- Core metrics visible by default: distance, time, date
- Expand card to see pace, splits, HR, other details
- Card visual treatment per source: Claude's discretion
- Deduplication UX: Primary source shown + indicator that other sources have same activity
- Primary source logic: **C2 always primary for rowing** (C2 is canonical for erg data, Strava supplementary)

### Widget Customization
- Smart defaults: Show widgets based on connected integrations (C2 widget if C2 connected, Strava if Strava connected)
- Preferences sync: Server-synced (same layout on all devices)
- Drag-and-drop reorder: Claude's discretion
- Show/hide UX: Claude's discretion

### Claude's Discretion
- Widget sizes (S/M/L or other system)
- Responsive breakpoint behavior
- Grid max width
- Widget card styling consistency
- Quick stats in hero section
- Headline CTA presence and behavior
- Headline refresh frequency
- Activity card visual treatment by source
- Widget reorder capability
- Widget visibility control UX

</decisions>

<specifics>
## Specific Ideas

- Hero section pattern: Large area with headline + quick stats at top, then bento grid below — similar to modern dashboard apps
- Activity deduplication should be transparent — user sees primary source but knows other sources are linked
- C2 is canonical for rowing data — this is the source of truth for erg metrics

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-vertical-slice*
*Context gathered: 2026-01-23*
