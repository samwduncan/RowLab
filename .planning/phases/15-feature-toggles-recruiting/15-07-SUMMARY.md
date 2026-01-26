---
phase: 15-feature-toggles-recruiting
plan: 07
subsystem: recruiting
tags: [forms, file-upload, validation, ui-components]
dependencies:
  requires:
    - 15-04-PLAN.md  # useRecruitVisits hooks
    - 15-06-PLAN.md  # RecruitVisit types
  provides:
    - RecruitVisitForm with full validation
    - PDF upload infrastructure
    - VisitScheduleEditor component
  affects:
    - 15-08-PLAN.md  # Recruit visit list/calendar view will use form
    - Future features that need file uploads
tech_stack:
  added:
    - multer: PDF file upload handling
    - react-dropzone: Drag-drop file upload UI
  patterns:
    - Form validation with react-hook-form + zod
    - Multi-mode editor (PDF vs rich text)
    - File upload with progress tracking
key_files:
  created:
    - server/routes/uploads.js
    - src/v2/components/recruiting/PdfUpload.tsx
    - src/v2/components/recruiting/VisitScheduleEditor.tsx
    - src/v2/components/recruiting/RecruitVisitForm.tsx
  modified:
    - server/index.js
    - src/v2/components/recruiting/index.ts
decisions:
  - decision: Use multer for file uploads
    rationale: Already installed, mature library with good security practices
    alternatives: [formidable, busboy]
  - decision: Store PDFs in uploads/visit-schedules/ with UUID filenames
    rationale: Prevents filename collisions, organizes files by feature
    impact: Easy to clean up or migrate later
  - decision: Tab-based switcher for PDF vs rich text
    rationale: Clear visual separation, preserves both content types
    impact: Users can switch between modes without losing data
metrics:
  duration: "9 minutes"
  completed: "2026-01-26"
---

# Phase 15 Plan 07: Recruit Visit Form Summary

**One-liner:** Complete recruit visit creation form with PDF upload or rich text schedule editor, full validation, and host athlete assignment.

## What Was Built

Created a comprehensive recruit visit form system with three main components:

1. **PDF Upload Infrastructure**
   - Server endpoint at `/api/v1/uploads/visit-schedule`
   - Multer-based file handling with 10MB limit
   - UUID-based filenames to prevent collisions
   - Static file serving for uploaded PDFs
   - Authentication required for uploads

2. **VisitScheduleEditor Component**
   - Tab switcher between PDF upload and rich text modes
   - Integrates both PdfUpload and RichTextEditor
   - Preserves content when switching between modes
   - Clear visual indication of active mode

3. **RecruitVisitForm Component**
   - Complete form with react-hook-form + zod validation
   - Recruit info: name*, email, phone, school, grad year
   - Visit details: date*, start time*, end time*, host athlete
   - Schedule content via VisitScheduleEditor
   - Internal notes for coaching staff
   - Supports both create and edit modes

## Technical Implementation

### File Upload Flow
```
User drops PDF → PdfUpload component
  ↓
FormData created with file
  ↓
POST /api/v1/uploads/visit-schedule (authenticated)
  ↓
Multer processes: validate mime type, check size
  ↓
Store to uploads/visit-schedules/{uuid}.pdf
  ↓
Return URL: /uploads/visit-schedules/{uuid}.pdf
  ↓
PdfUpload displays with view/remove options
```

### Form Validation Rules
- **Required fields:** recruitName, date, startTime, endTime
- **Email validation:** Must be valid email format or empty
- **Time validation:** HH:MM format (enforced by browser input)
- **Grad year:** 2020-2035 range if provided
- **Schedule:** Either PDF URL or rich text content (both preserved)

### Component Architecture
```
RecruitVisitForm (parent form with validation)
  ├── Recruit Info Section (5 inputs)
  ├── Visit Details Section (date, times, host)
  ├── VisitScheduleEditor (schedule mode switcher)
  │   ├── Tab Switcher (PDF / Rich Text)
  │   ├── RichTextEditor (when mode = richtext)
  │   └── PdfUpload (when mode = pdf)
  └── Notes Section (internal coaching notes)
```

## Files Created

### Backend
- **server/routes/uploads.js** (99 lines)
  - Multer configuration for PDF uploads
  - POST endpoint with authentication
  - Error handling for file size, mime type
  - Automatic directory creation

### Frontend Components
- **src/v2/components/recruiting/PdfUpload.tsx** (115 lines)
  - Drag-drop file upload with react-dropzone
  - Upload progress indication
  - Display uploaded file with view link
  - Remove button to clear upload
  - Error handling and user feedback

- **src/v2/components/recruiting/VisitScheduleEditor.tsx** (84 lines)
  - Tab-based mode switcher (PDF / Rich Text)
  - Integrates RichTextEditor and PdfUpload
  - Preserves content for both modes
  - Helpful hint text for each mode

- **src/v2/components/recruiting/RecruitVisitForm.tsx** (297 lines)
  - Complete form with 11 fields
  - Zod schema validation
  - Host athlete dropdown from useAthletes
  - Create and edit mode support
  - Integration with useCreateRecruitVisit and useUpdateRecruitVisit

### Configuration
- **server/index.js** (modified)
  - Added upload routes registration
  - Added static file serving for /uploads directory

- **src/v2/components/recruiting/index.ts** (updated exports)

## Verification Results

✅ PDF upload endpoint works with authentication
✅ PdfUpload shows progress and handles errors
✅ VisitScheduleEditor preserves content when switching modes
✅ RecruitVisitForm validates: name, date, times required
✅ Form submission creates visit in database via API
✅ Edit mode pre-fills form with existing visit data

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

**Upstream Dependencies:**
- `useRecruitVisits` hooks (15-04) - Form uses create/update mutations
- `RecruitVisit` types (15-06) - Type safety throughout form
- `useAthletes` hook - Populates host athlete dropdown
- `RichTextEditor` component - Used for rich text schedule mode

**Downstream Usage:**
- Next plan (15-08) will use RecruitVisitForm in:
  - Modal dialog for creating new visits
  - Edit dialog for updating existing visits
  - Possibly in a dedicated "Create Visit" page

## Next Steps

1. **Plan 15-08:** Build recruit visit list/calendar view
   - Display visits in calendar format
   - Use RecruitVisitForm in modal for create/edit
   - Show PDF preview or rich text schedule

2. **Future enhancements:**
   - Add drag-drop for multiple file types (images for schedule)
   - Preview PDF inline before upload
   - Auto-populate recruit info from previous visits
   - Email schedule to recruit/parents

## Commits

| Hash    | Message                                          |
|---------|--------------------------------------------------|
| de3e8fa | feat(15-07): add complete RecruitVisitForm       |
| a2252f9 | feat(15-07): add VisitScheduleEditor component   |
| 630b972 | feat(15-07): add PDF upload endpoint and component |

**Total LOC Added:** ~600 lines
**Files Created:** 4
**Files Modified:** 2
