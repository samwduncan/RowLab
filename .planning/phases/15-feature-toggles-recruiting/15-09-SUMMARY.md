---
phase: 15-feature-toggles-recruiting
plan: 09
subsystem: ui
tags: [sonner, zustand, notifications, toast, react, typescript, settings]

# Dependency graph
requires:
  - phase: 12-settings-photos-polish
    provides: Settings page infrastructure with tabbed UI and persistent preferences pattern
provides:
  - Sonner toast library integration with V2 styling
  - Notification preference store with localStorage persistence
  - Channel-level notification controls (inApp, email, push)
  - Feature-level notification toggles (8 notification types)
  - Quiet hours configuration with time window support
  - NotificationsSection in settings UI
affects: [16-gamification-engagement, recruit-visit-notifications, training-plan-notifications, regatta-reminders]

# Tech tracking
tech-stack:
  added: [sonner@2.0.7]
  patterns:
    - Zustand persist middleware for notification preferences
    - shouldNotify() computed function for notification gating
    - Channel-level + feature-level notification control hierarchy
    - Quiet hours with overnight time window support
    - ToastProvider at app root for global toast access

key-files:
  created:
    - src/v2/types/notifications.ts
    - src/v2/stores/notificationStore.ts
    - src/v2/components/common/ToastProvider.tsx
    - src/v2/features/settings/components/NotificationsSection.tsx
  modified:
    - src/v2/components/common/index.ts
    - src/v2/layouts/V2Layout.tsx
    - src/v2/types/settings.ts
    - src/v2/features/settings/components/SettingsTabs.tsx
    - src/v2/features/settings/pages/SettingsPage.tsx
    - src/v2/features/settings/components/index.ts

key-decisions:
  - "Sonner for toast notifications over custom implementation - battle-tested, accessible, rich features"
  - "Zustand persist to localStorage for notification preferences - consistent with feature preference pattern"
  - "Three-tier notification control: channels (master switches) → features (per-type) → quiet hours (time-based)"
  - "Quiet hours exclude in-app toasts by default - urgent notifications still visible"
  - "shouldNotify() computed function gates all notifications - checks channel, feature, and quiet hours"
  - "8 notification features defined: recruit visits, seat racing, training plans, erg tests, regattas, sessions, achievements"
  - "ToastProvider at V2Layout root with bottom-right positioning and V2 design tokens"

patterns-established:
  - "NotificationPreferences interface: channels + features + quietHours structure for all notification config"
  - "NOTIFICATION_FEATURES constant array: defines available features, channels, and defaults"
  - "DEFAULT_NOTIFICATION_PREFERENCES: sensible defaults (inApp/email on, push off, no quiet hours)"
  - "isInQuietHours() handles overnight windows: 22:00-08:00 logic for startTime > endTime"

# Metrics
duration: 5min
completed: 2026-01-26
---

# Phase 15 Plan 09: Notification Preferences Foundation Summary

**Sonner toast library with V2 styling, notification preference store with channel/feature/quiet hours controls, and settings UI for user configuration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-26T18:52:39Z
- **Completed:** 2026-01-26T18:57:32Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Sonner toast library integrated with V2 design tokens (--color-surface-elevated, --color-bdr)
- Notification preference store with localStorage persistence via Zustand middleware
- Three-tier notification control: channel master switches → feature toggles → quiet hours
- Comprehensive NotificationsSection in settings with 8 notification types
- shouldNotify() computed function respects channels, features, and quiet hours
- Overnight quiet hours support (e.g., 22:00-08:00)
- ToastProvider at app root enables global toast access throughout V2

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Sonner and create notification types** - `0f414f3` (feat)
2. **Task 2: Create notification preference store and ToastProvider** - `c2f5acb` (feat)
3. **Task 3: Create NotificationsSection for settings** - `0cad529` (feat)

## Files Created/Modified

**Created:**
- `src/v2/types/notifications.ts` - Comprehensive notification types: channels, features, quiet hours, store state
- `src/v2/stores/notificationStore.ts` - Zustand store with persist middleware, shouldNotify/isInQuietHours computed functions
- `src/v2/components/common/ToastProvider.tsx` - Sonner Toaster wrapper with V2 styling and design tokens
- `src/v2/features/settings/components/NotificationsSection.tsx` - Settings UI with channel toggles, quiet hours, feature preferences

**Modified:**
- `src/v2/components/common/index.ts` - Export ToastProvider and toast function
- `src/v2/layouts/V2Layout.tsx` - Add ToastProvider to app root
- `src/v2/types/settings.ts` - Add 'notifications' to SettingsTab type
- `src/v2/features/settings/components/SettingsTabs.tsx` - Add Notifications tab with Bell icon
- `src/v2/features/settings/pages/SettingsPage.tsx` - Render NotificationsSection for notifications tab
- `src/v2/features/settings/components/index.ts` - Export NotificationsSection

## Decisions Made

**1. Sonner over custom toast implementation**
- Battle-tested library with accessibility built-in
- Rich features (richColors, closeButton, positioning)
- Clean API: single `toast()` function call

**2. Three-tier notification control hierarchy**
- **Channel level:** Master switches for inApp/email/push (broadest control)
- **Feature level:** Individual toggles for each notification type (granular control)
- **Quiet hours:** Time-based suppression (contextual control)
- User can disable all email notifications OR just specific features

**3. Quiet hours exclude in-app toasts by default**
- Email/push suppressed during quiet hours for sleep/focus
- In-app toasts still shown (urgent notifications visible when actively using app)
- Users can toggle excludeInApp if they want full suppression

**4. shouldNotify() as central gating function**
- Single source of truth for notification permission
- Checks channel enabled → feature enabled → quiet hours
- Future notification code calls shouldNotify() before showing toast

**5. 8 notification features defined**
- Recruit visits: assigned + reminders
- Seat racing: results available
- Training plans: assignment
- Erg tests: scheduled
- Regattas: reminders
- Sessions: starting soon
- Achievements: earned (future)

**6. localStorage persistence via Zustand middleware**
- Key: 'rowlab-notification-preferences'
- Consistent with existing feature preference pattern from Plan 15-01
- Survives page refresh, syncs across tabs

**7. ToastProvider at V2Layout root**
- Single provider for entire V2 app
- Bottom-right positioning (standard for non-blocking notifications)
- Uses V2 design tokens: var(--color-surface-elevated), var(--color-bdr)
- 4-second duration (readable without being persistent)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following existing patterns.

## User Setup Required

None - no external service configuration required. Notification preferences are client-side localStorage only.

## Next Phase Readiness

**Ready for notification features:**
- Foundation complete for any feature to show notifications
- Call `toast.success('Message')` anywhere in V2 (toast function exported from common)
- Check `shouldNotify('featureName', 'inApp')` before showing notifications
- Add new notification features by extending NotificationFeature type

**Integration points for future plans:**
- **Recruit visit reminders:** Check shouldNotify('recruitVisitReminder', 'inApp') before toast
- **Seat racing results:** Check shouldNotify('seatRacingResults', 'inApp') after processing
- **Training plan assignments:** Check shouldNotify('trainingPlanAssigned', 'inApp') on assignment
- **Email/push notifications:** Implement backend handlers that check notification preferences from user settings

**Blockers/concerns:**
- Email and push notification channels are UI-only (backend implementation required in future)
- Push notifications require browser permission request (implement when push backend ready)

---
*Phase: 15-feature-toggles-recruiting*
*Completed: 2026-01-26*
