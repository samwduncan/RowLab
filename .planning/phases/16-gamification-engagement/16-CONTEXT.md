# Phase 16: Gamification & Engagement - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Achievement system, personal records tracking, team challenges, and season journey visualization. Motivates athletes through recognition and friendly competition while respecting that high-level teams may prefer data-only experience.

</domain>

<decisions>
## Implementation Decisions

### Opt-Out Architecture
- Per-athlete opt-out: Athletes can disable gamification individually even if team has it enabled
- Gamification is an advanced feature that can be toggled off entirely at team level (via Phase 15 feature toggles)
- Athletes who opt-out see data without celebration/badge overlays

### Achievement System
- Mixed hierarchy: Categories (Erg, Attendance, Racing) containing milestone types (first-time, volume, performance, consistency)
- 4 rarity tiers: Common (easy), Rare (effort), Epic (dedication), Legendary (exceptional)
- Progress bars always visible showing "23/50 workouts" with fill
- Pinned badges: Athletes choose 3-5 achievements to display on their profile

### PR Celebrations
- Contextual PRs tracked: best for test type, best for season, best for training block
- Inline highlight style: Gold badge/border on result, visible but not disruptive
- Both views: Personal PR history on athlete profile + team records as separate view
- Comparison: Show delta (-1.6s improvement) plus sparkline trend of last 5 attempts
- Shareable cards: Full context (time, delta, rank, athlete name, test type, date, RowLab branding)
- Strava auto-upload: Configurable per athlete (all workouts, PRs only, manual toggle per workout)
- Share cards available for ANY workout, not just PRs

### Team Challenges
- Creation: Coaches and athletes with captain role can create challenges
- Both types supported: Individual competition AND collective team goals
- Real-time leaderboard with live updates as workouts logged
- Achievement badge only for winners (no custom rewards)
- Templates available: Common templates ("Holiday Meters", "Weekly Attendance Battle") plus fully customizable
- Squads: Coach creates arbitrary groups for sub-team competitions
- Notifications: Configurable per athlete (push + in-app, in-app only, off)
- Collective challenges: Show all individual contributions to team total
- Custom formulas: Coach can create weighted combinations (meters × attendance %)
- Optional handicapping per challenge (weight class adjustments)
- Multiple active challenges allowed simultaneously, same workout counts for all

### Season Journey & Streaks
- Story format: Narrative-style "your season in review" with highlights
- Both timing options: Monthly mini-recaps plus comprehensive end-of-season summary
- Multi-category streaks: Attendance, workout, PR streaks, challenge participation
- Configurable grace periods: Team sets allowed misses per week (not strict counting)

### Claude's Discretion
- "Serious Mode" aesthetic handling when athletes opt-out (minimal presentation vs hide entirely)
- Near-PR feedback (encouragement messages vs silent)
- Specific streak categories beyond attendance/workout/PR
- Story format generation algorithm

</decisions>

<specifics>
## Specific Ideas

- "High level teams who just want the serious data analytics" — gamification must not feel childish or get in the way
- Shareable cards should work for ANY workout export to social media, not just PRs
- Strava integration should leverage existing OAuth connection from Phase 12

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-gamification-engagement*
*Context gathered: 2026-01-26*
