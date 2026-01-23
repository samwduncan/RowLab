# Project State: RowLab UX Redesign

## Current Status

**Milestone:** v1.0 — Full UX Redesign
**Phase:** 2 (Foundation) — IN PROGRESS
**Status:** Plan 02-03 complete
**Last activity:** 2026-01-23 — Completed 02-03-PLAN.md (WorkspaceSidebar Component)

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Context-aware dashboard experience that adapts to athlete/coach role
**Current focus:** Ready for Phase 2 - Foundation (Shell & Context)

## Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Clean Room Setup | ● Complete | 4/4 |
| 2 | Foundation | ◐ In progress | 3/? |
| 3 | Vertical Slice | ○ Pending | — |
| 4 | Migration Loop | ○ Pending | — |
| 5 | The Flip | ○ Pending | — |

Progress: ███░░░░░░░ ~28%

## Quick Context

**Architecture:** In-Place Strangler pattern
- V2 at `/beta` route with `src/v2/` directory
- Shares existing Zustand stores with V1
- V1 remains untouched until V2 feature parity

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS 3.4, Framer Motion

**Codebase Map:** .planning/codebase/ (7 documents, 1,978 lines)

## Phase 1 Deliverables

| Plan | Description | Status |
|------|-------------|--------|
| 01-01 | Frontend foundation (tokens, Tailwind) | ● Complete |
| 01-02 | Backend schema (8 Prisma models) | ● Complete |
| 01-03 | V2 entry point (V2Layout + /beta) | ● Complete |
| 01-04 | Verification checkpoint | ● Approved |

**Commits:** 12 commits across 4 plans

## Phase 2 Deliverables

| Plan | Description | Status |
|------|-------------|--------|
| 02-01 | Context store, theme hook, shared stores | ● Complete |
| 02-02 | ContextRail component | ● Complete |
| 02-03 | WorkspaceSidebar component | ● Complete |

**Commits:** 5 task commits

## Accumulated Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| 01-01 | Use selector strategy (important: '.v2') for CSS isolation | Complete isolation without separate builds |
| 01-01 | Three-level token system (palette → semantic → component) | Maintainable design system with theme support |
| 01-01 | Support dark/light/field themes | Field theme for high-contrast outdoor visibility |
| 01-02 | Equipment enums for type safety | Prevents invalid values, provides autocomplete, database validation |
| 01-02 | JSON storage for default schedules | Flexible weekly patterns without separate table per day |
| 01-02 | Activity deduplication at database level | Unique constraint on (source, sourceId) prevents sync duplicates |
| 01-02 | Morning/evening availability granularity | Matches rowing practice scheduling (AM and PM sessions) |
| 01-03 | Theme defaults to dark (no data-theme attribute) | Cleaner markup; only light/field themes set data-theme |
| 01-03 | V2Layout wraps all /beta routes | Provides .v2 class for CSS isolation |
| 01-03 | Use @v2 path alias for V2 lazy imports | Consistent import pattern, works with Vite alias config |
| 02-01 | Default context: 'me' (athlete view) | Athlete view is primary use case, coaches/admins are power users |
| 02-01 | System preference as default theme | Respects OS dark mode unless user explicitly overrides |
| 02-01 | Share Zustand store instances via Context, not values | Avoids re-render loop pitfall (Pattern from 02-RESEARCH.md) |
| 02-01 | Three-theme support (dark/light/field) | Matches Phase 1 token system design |
| 02-03 | Use Lucide React icons with string-to-component mapping | contextStore uses string icon names for flexibility, ICON_MAP bridges to components |
| 02-03 | Navigation items from contextStore CONTEXT_CONFIGS | Consume existing navigation config rather than duplicating |
| 02-03 | V2 design tokens for all sidebar styling | Active state uses bg-action-primary, inactive uses text-text-secondary with hover states |
| 02-02 | Use inline SVG icons (Lucide-style) for rail | Avoids icon library dependency, keeps bundle small |
| 02-02 | 64px rail width (w-16) | Comfortable click targets meeting WCAG requirements |
| 02-02 | layoutId="activeContext" for indicator animation | Framer Motion shared element transition pattern |
| 02-03 | Use Lucide React icons with string-to-component mapping | contextStore uses string icon names for flexibility, ICON_MAP bridges to components |
| 02-03 | Navigation items from contextStore CONTEXT_CONFIGS | Consume existing navigation config rather than duplicating |
| 02-03 | V2 design tokens for all sidebar styling | Active state uses bg-action-primary, inactive uses text-text-secondary with hover states |

## Session Continuity

**Last session:** 2026-01-23 14:02 UTC
**Stopped at:** Completed 02-03-PLAN.md (WorkspaceSidebar Component)
**Resume file:** None

## Next Action

Continue Phase 2 with next plan (shell layout components)

---
*Last updated: 2026-01-23 — Phase 2 Plan 03 complete*
