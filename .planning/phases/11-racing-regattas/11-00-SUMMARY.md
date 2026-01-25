# Plan 11-00 Summary: Backend Schema Extensions

## Status: COMPLETE

## What Was Built

### Schema Extensions (prisma/schema.prisma)
- **Event model**: Three-tier hierarchy (Regatta -> Event -> Race) with name, category, scheduledDay, sortOrder
- **ChecklistTemplate model**: Reusable checklist templates per team with isDefault flag
- **ChecklistTemplateItem model**: Individual checklist items with text, role (coach/coxswain/anyone), sortOrder
- **RaceChecklist model**: Race-specific checklist instances created from templates
- **RaceChecklistItem model**: Checklist items with completion tracking (completedBy, completedAt)
- **ExternalRanking model**: Track external team rankings by source (row2k, usrowing, regattacentral, manual)
- **Extended Regatta model**: Added endDate, host, venueType, externalUrl, teamGoals fields

### API Endpoints (server/routes/regattas.js)

**Event Routes:**
- `POST /api/v1/regattas/:regattaId/events` - Create event
- `PATCH /api/v1/regattas/events/:eventId` - Update event
- `DELETE /api/v1/regattas/events/:eventId` - Delete event
- `POST /api/v1/regattas/events/:eventId/races` - Add race to event

**Checklist Template Routes:**
- `GET /api/v1/regattas/checklists/templates` - List templates
- `POST /api/v1/regattas/checklists/templates` - Create template
- `PATCH /api/v1/regattas/checklists/templates/:id` - Update template
- `DELETE /api/v1/regattas/checklists/templates/:id` - Delete template

**Race Checklist Routes:**
- `GET /api/v1/regattas/races/:raceId/checklist` - Get race checklist
- `GET /api/v1/regattas/races/:raceId/checklist/progress` - Get progress
- `POST /api/v1/regattas/races/:raceId/checklist` - Create from template
- `PATCH /api/v1/regattas/checklists/items/:itemId` - Toggle item

**External Ranking Routes:**
- `GET /api/v1/regattas/rankings/external` - List rankings
- `POST /api/v1/regattas/rankings/external` - Add ranking
- `DELETE /api/v1/regattas/rankings/external/:id` - Delete ranking

### Service Functions (server/services/regattaService.js)
- Event: createEvent, updateEvent, deleteEvent, addRaceToEvent
- Checklist: getChecklistTemplates, createChecklistTemplate, updateChecklistTemplate, deleteChecklistTemplate
- Race Checklist: getRaceChecklist, createRaceChecklist, updateChecklistItem, getRaceChecklistProgress
- External Rankings: getExternalRankings, addExternalRanking, deleteExternalRanking

## Commits
- `4c3fcb8` - feat(11-00): extend backend for racing & regattas phase

## Verification
- `npx prisma db push` completed successfully
- `npx prisma generate` regenerated client
- All new models and relations properly indexed
- Backward compatibility maintained (Race still references Regatta directly)

## Key Decisions
- Event.eventId is optional on Race for migration compatibility
- ChecklistTemplate supports isDefault flag with auto-unset on new default
- RaceChecklist uses upsert pattern for external rankings
- Role-based items support coach/coxswain/anyone visibility

## Dependencies Satisfied
- Plan 11-02 (hooks) can now use these endpoints
- Plan 11-03 (UI) has backend ready for Event management
- Plan 11-07 (checklists) has full backend support
- Plan 11-08 (rankings) has external ranking endpoints
