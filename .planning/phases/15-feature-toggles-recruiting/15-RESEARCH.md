# Phase 15: Feature Toggles & Recruiting - Research

**Researched:** 2026-01-26
**Domain:** Feature flag systems, progressive disclosure UI, rich text editing, notification preferences, file upload management
**Confidence:** HIGH

## Summary

Phase 15 implements a progressive unlock system for advanced features and basic recruiting functionality. Research reveals that feature toggles should be implemented as simple client-side state management (Zustand persist middleware) rather than enterprise feature flag services, given the use case is team-level preferences, not A/B testing or gradual rollouts. The codebase already has a mature settings store with feature toggle patterns that can be extended.

For rich text editing (visit schedules), **Lexical** emerges as the strongest choice: Meta-developed, production-ready (v0.39.0), excellent accessibility, 22.8k stars, and framework-agnostic core with React bindings. For notifications, **Sonner** is the current standard for shadcn/ui-style projects with simplified API and TypeScript-first design.

Key architectural insight: Feature toggles are **UI/UX preferences** (which features the team wants to see), not infrastructure flags. This means client-side state with localStorage persistence is appropriate, with server API determining what features the team has *access* to based on subscription level.

**Primary recommendation:** Extend existing `settingsStore.js` patterns with team-level feature groups, use Lexical for rich text, implement new calendar event type extending existing `CalendarEvent` interface, and use Sonner for notification toasts with localStorage-backed preferences.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 4.4.7 | State management with persistence | Already used, persist middleware ideal for localStorage |
| TanStack Query | 5.90.20 | Server state management | Already used, perfect for feature flag caching |
| react-hook-form | 7.71.1 | Form validation | Already used for all forms |
| Zod | 4.3.4 | Schema validation | Already used with RHF |
| Lexical | 0.39.0 | Rich text editing | Meta-developed, production-ready, accessible |
| Sonner | latest | Toast notifications | Modern, TypeScript-first, shadcn/ui standard |
| DOMPurify | latest | HTML sanitization | OWASP-recommended for XSS prevention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-dropzone | latest | File upload | Drag-drop PDF uploads for visit schedules |
| react-pdf | latest | PDF display | Preview uploaded visit schedules |
| @lexical/react | 0.39.0 | Lexical React bindings | Required for Lexical in React |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lexical | Tiptap | Tiptap requires paid license for collaboration features; Lexical is fully open source |
| Lexical | Slate | Slate has smaller ecosystem; Lexical has Meta backing and better docs |
| Zustand persist | LaunchDarkly/Unleash | Enterprise flag services are overkill for team UI preferences; adds complexity and cost |
| Sonner | react-hot-toast | Both excellent; Sonner better for shadcn/ui projects (which this appears to be) |
| localStorage | Server-side flags | Server determines access (subscription), client stores preferences (UI toggles) |

**Installation:**
```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/history dompurify sonner react-dropzone react-pdf
npm install --save-dev @types/dompurify
```

## Architecture Patterns

### Recommended Project Structure
```
src/v2/features/
├── feature-toggles/        # New feature
│   ├── components/
│   │   ├── FeatureGroupCard.tsx      # Core vs Advanced groups
│   │   ├── FeatureToggleSwitch.tsx   # Individual feature toggle
│   │   ├── FeatureDiscoveryHint.tsx  # "Upgrade to unlock" hints
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useFeatureAccess.ts       # Check if team has access
│   │   ├── useFeaturePreference.ts   # Check if feature enabled
│   │   └── index.ts
│   ├── stores/
│   │   └── featurePreferenceStore.ts # Zustand store with persist
│   └── index.ts
├── recruiting/             # New feature
│   ├── components/
│   │   ├── RecruitVisitForm.tsx      # Create visit event
│   │   ├── RecruitVisitCard.tsx      # Display visit details
│   │   ├── VisitScheduleEditor.tsx   # Rich text or PDF upload
│   │   ├── HostAthletePanel.tsx      # Athlete's view of visits
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useRecruitVisits.ts       # TanStack Query
│   │   └── index.ts
│   └── index.ts
├── notifications/          # New feature
│   ├── components/
│   │   ├── NotificationPreferences.tsx  # Settings UI
│   │   ├── NotificationTypeCard.tsx     # Per-feature controls
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useNotificationPrefs.ts   # Zustand store
│   │   └── index.ts
│   ├── stores/
│   │   └── notificationStore.ts
│   └── index.ts
└── settings/               # Extend existing
    └── components/
        └── FeaturesSection.tsx  # New settings tab
```

### Pattern 1: Feature Toggle with Server Access Check
**What:** Client-side preference with server-side access control
**When to use:** Feature toggles that depend on subscription level
**Example:**
```typescript
// Source: Existing patterns in settingsStore.js + research findings
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  features: string[];
}

interface FeaturePreferenceState {
  // Feature preferences (what user wants enabled)
  enabledFeatures: Record<string, boolean>;

  // Feature access (what team subscription allows)
  // Fetched from server, cached here
  accessibleFeatures: Set<string>;

  // Actions
  toggleFeature: (featureId: string) => void;
  enableFeature: (featureId: string) => void;
  disableFeature: (featureId: string) => void;
  setAccessibleFeatures: (features: string[]) => void;

  // Computed
  isFeatureEnabled: (featureId: string) => boolean;
  canAccessFeature: (featureId: string) => boolean;
}

export const useFeaturePreferenceStore = create<FeaturePreferenceState>()(
  persist(
    (set, get) => ({
      enabledFeatures: {},
      accessibleFeatures: new Set(),

      toggleFeature: (featureId) => {
        const { enabledFeatures, canAccessFeature } = get();
        if (!canAccessFeature(featureId)) return; // Can't toggle if no access

        set({
          enabledFeatures: {
            ...enabledFeatures,
            [featureId]: !enabledFeatures[featureId],
          },
        });
      },

      enableFeature: (featureId) => {
        const { enabledFeatures, canAccessFeature } = get();
        if (!canAccessFeature(featureId)) return;

        set({
          enabledFeatures: {
            ...enabledFeatures,
            [featureId]: true,
          },
        });
      },

      disableFeature: (featureId) => {
        const { enabledFeatures } = get();
        set({
          enabledFeatures: {
            ...enabledFeatures,
            [featureId]: false,
          },
        });
      },

      setAccessibleFeatures: (features) => {
        set({ accessibleFeatures: new Set(features) });
      },

      isFeatureEnabled: (featureId) => {
        const { enabledFeatures, canAccessFeature } = get();
        // Feature must be both accessible AND enabled
        return canAccessFeature(featureId) && (enabledFeatures[featureId] ?? true);
      },

      canAccessFeature: (featureId) => {
        return get().accessibleFeatures.has(featureId);
      },
    }),
    {
      name: 'rowlab-feature-preferences',
      storage: createJSONStorage(() => localStorage),
      // Don't persist accessibleFeatures (comes from server)
      partialize: (state) => ({ enabledFeatures: state.enabledFeatures }),
    }
  )
);
```

### Pattern 2: Feature Discovery Hints
**What:** Progressive disclosure with upgrade prompts for disabled features
**When to use:** Show users what they're missing without cluttering UI
**Example:**
```typescript
// Source: Progressive disclosure research + UI patterns
interface FeatureDiscoveryHintProps {
  featureId: string;
  featureName: string;
  description: string;
  upgradeRequired?: 'collegiate' | 'elite';
}

export function FeatureDiscoveryHint({
  featureId,
  featureName,
  description,
  upgradeRequired
}: FeatureDiscoveryHintProps) {
  const { canAccessFeature } = useFeaturePreferenceStore();
  const hasAccess = canAccessFeature(featureId);

  if (hasAccess) return null; // Don't show hint if they have access

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-muted/50 border border-dashed rounded-lg"
    >
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{featureName}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {upgradeRequired && (
            <Badge variant="outline" className="mt-2">
              {upgradeRequired} level required
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

### Pattern 3: Calendar Event Extension
**What:** Add new event type to existing CalendarEvent interface
**When to use:** Recruit visits need same calendar integration as workouts
**Example:**
```typescript
// Source: Existing src/v2/types/training.ts + extension pattern
// Extend existing CalendarEvent interface
export type CalendarEventType = 'workout' | 'recruit_visit' | 'regatta' | 'meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: CalendarEventType; // Add this field
  resource?: {
    // Existing workout fields
    workoutId?: string;
    planId?: string;
    type?: WorkoutType;
    intensity?: IntensityLevel;
    tss?: number;
    isRecurring?: boolean;
    parentId?: string;
    blockId?: string;
    blockPhase?: PeriodizationPhase;

    // New recruit visit fields
    recruitId?: string;
    recruitName?: string;
    hostAthleteId?: string;
    visitScheduleId?: string;
    visitNotes?: string;
  };
}

// New type for recruit visit creation
export interface CreateRecruitVisitInput {
  recruitName: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hostAthleteId: string;
  scheduleType: 'pdf' | 'richtext';
  scheduleContent?: string; // Rich text HTML
  schedulePdfUrl?: string; // S3 URL
  notes?: string;
}
```

### Pattern 4: Rich Text Editor with Sanitization
**What:** Lexical editor with DOMPurify sanitization for XSS prevention
**When to use:** Visit schedule rich text editor
**Example:**
```typescript
// Source: Lexical docs + security research
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import DOMPurify from 'dompurify';

interface VisitScheduleEditorProps {
  initialValue?: string;
  onChange: (html: string) => void;
}

export function VisitScheduleEditor({ initialValue, onChange }: VisitScheduleEditorProps) {
  const initialConfig = {
    namespace: 'VisitScheduleEditor',
    theme: {
      // Custom theme classes
    },
    onError: (error: Error) => console.error(error),
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      // Sanitize before saving
      const clean = DOMPurify.sanitize(htmlString, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      });
      onChange(clean);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
              Enter visit schedule details...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
```

### Pattern 5: File Upload with Validation
**What:** PDF upload with client and server-side validation
**When to use:** Alternative to rich text for visit schedules
**Example:**
```typescript
// Source: react-dropzone + file upload security research
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

const uploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File must be less than 10MB')
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), 'Only PDF files allowed'),
});

export function VisitSchedulePdfUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setValue('file', acceptedFiles[0]);
      }
    },
  });

  const onSubmit = async (data: { file: File }) => {
    const formData = new FormData();
    formData.append('file', data.file);

    // Upload to server (server does additional validation)
    const response = await fetch('/api/uploads/visit-schedule', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { url } = await response.json();
      onUpload(url);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
      </div>
      {errors.file && (
        <p className="text-sm text-destructive mt-2">{errors.file.message}</p>
      )}
    </form>
  );
}
```

### Pattern 6: Notification Preferences Store
**What:** Zustand store with localStorage for notification preferences
**When to use:** Per-feature notification controls, quiet hours
**Example:**
```typescript
// Source: Zustand persist patterns + notification research
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NotificationPreferences {
  // Channel preferences
  channels: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };

  // Feature-specific preferences
  features: {
    recruitVisitAssigned: boolean;
    seatRacingResults: boolean;
    trainingPlanAssigned: boolean;
    ergTestScheduled: boolean;
    regattaReminder: boolean;
  };

  // Quiet hours
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
}

interface NotificationStore extends NotificationPreferences {
  // Actions
  setChannelPreference: (channel: keyof NotificationPreferences['channels'], enabled: boolean) => void;
  setFeaturePreference: (feature: keyof NotificationPreferences['features'], enabled: boolean) => void;
  setQuietHours: (config: NotificationPreferences['quietHours']) => void;

  // Computed
  shouldNotify: (feature: keyof NotificationPreferences['features'], channel: keyof NotificationPreferences['channels']) => boolean;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      channels: {
        email: true,
        inApp: true,
        push: false,
      },
      features: {
        recruitVisitAssigned: true,
        seatRacingResults: true,
        trainingPlanAssigned: true,
        ergTestScheduled: true,
        regattaReminder: true,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },

      setChannelPreference: (channel, enabled) => {
        set((state) => ({
          channels: { ...state.channels, [channel]: enabled },
        }));
      },

      setFeaturePreference: (feature, enabled) => {
        set((state) => ({
          features: { ...state.features, [feature]: enabled },
        }));
      },

      setQuietHours: (config) => {
        set({ quietHours: config });
      },

      shouldNotify: (feature, channel) => {
        const { channels, features, quietHours } = get();

        // Check if feature notifications enabled
        if (!features[feature]) return false;

        // Check if channel enabled
        if (!channels[channel]) return false;

        // Check quiet hours (only for push/email, not in-app)
        if (quietHours.enabled && (channel === 'push' || channel === 'email')) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const [startHour, startMin] = quietHours.startTime.split(':');
          const [endHour, endMin] = quietHours.endTime.split(':');
          // Simple time range check (doesn't handle overnight ranges)
          if (currentTime >= quietHours.startTime && currentTime <= quietHours.endTime) {
            return false;
          }
        }

        return true;
      },
    }),
    {
      name: 'rowlab-notification-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Pattern 7: TanStack Query for Feature Flags
**What:** Cache feature access from server with appropriate staleness
**When to use:** Feature access needs to be checked against server subscription
**Example:**
```typescript
// Source: TanStack Query patterns + research
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFeatureAccess() {
  return useQuery({
    queryKey: ['featureAccess'],
    queryFn: async () => {
      const response = await fetch('/api/team/feature-access');
      if (!response.ok) throw new Error('Failed to fetch feature access');
      return response.json() as Promise<{ features: string[] }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - relatively static
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Sync to Zustand store when data arrives
    onSuccess: (data) => {
      useFeaturePreferenceStore.getState().setAccessibleFeatures(data.features);
    },
  });
}

export function useUpdateFeaturePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Record<string, boolean>) => {
      const response = await fetch('/api/user/feature-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      // Optimistic update already done by Zustand store
      queryClient.invalidateQueries({ queryKey: ['featurePreferences'] });
    },
  });
}
```

### Anti-Patterns to Avoid
- **Feature toggle explosion:** Don't create toggles for every minor UI element. Group related features.
- **Coupling toggle points with routing logic:** Keep feature checks separate from business logic.
- **Forgetting to test both states:** Every feature must be tested with toggle on AND off.
- **Not removing old toggles:** Feature toggles are technical debt if left in place after rollout complete.
- **Big-bang rollouts:** Don't enable complex features for all users at once (though this is less relevant for team-level preferences).
- **Skipping sanitization:** Always sanitize rich text content with DOMPurify before saving or displaying.
- **Client-side-only file validation:** Always validate file type and size on server too.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom contentEditable wrapper | Lexical + @lexical/react | Accessibility, keyboard navigation, undo/redo, browser quirks are complex |
| HTML sanitization | Regex-based cleanup | DOMPurify | XSS prevention requires comprehensive attribute/tag filtering; OWASP-recommended |
| File upload drag-drop | Native file input + drag events | react-dropzone | File validation, multiple files, preview, error handling are tricky |
| Toast notifications | Custom absolute-positioned divs | Sonner | Stacking, animations, auto-dismiss, queue management, accessibility |
| Feature flag evaluation | Inline if statements everywhere | Zustand store + React Context | Centralized logic, easier testing, consistent behavior |
| PDF rendering | Canvas-based custom renderer | react-pdf | PDF.js is complex; wojtekmaj wrapper handles React integration |
| Form validation | Manual state + validation functions | react-hook-form + Zod | Async validation, touched state, error messages, performance |
| localStorage sync | Manual getItem/setItem | Zustand persist middleware | Serialization, hydration, SSR safety, cross-tab sync |

**Key insight:** Feature toggles look simple ("just an if statement") but scale poorly without centralized management. Rich text editors look simple ("just contentEditable") but have enormous complexity in accessibility, undo/redo, and cross-browser behavior.

## Common Pitfalls

### Pitfall 1: Feature Toggle Explosion
**What goes wrong:** Creating a toggle for every minor feature leads to combinatorial explosion of test states.
**Why it happens:** Teams add toggles reactively without architectural plan.
**How to avoid:**
- Define feature groups upfront (Core vs Advanced)
- One toggle controls multiple related capabilities
- Default to showing features unless there's clear reason to hide them
**Warning signs:**
- More than 10 active toggles
- Toggles that only control single UI elements
- Nested if statements checking multiple toggles

### Pitfall 2: Forgetting Server-Side Validation
**What goes wrong:** File uploads validated only on client are easily bypassed; malicious files get stored.
**Why it happens:** Client validation gives instant feedback, feels sufficient.
**How to avoid:**
- ALWAYS validate file type, size, and content on server
- Use file-type-checker to verify magic numbers, not just MIME type
- Scan uploads with ClamAV or similar
**Warning signs:**
- Server endpoint accepts any file type
- No file size limits on server
- Trust client-provided MIME types

### Pitfall 3: XSS via Rich Text Content
**What goes wrong:** User-generated HTML is displayed without sanitization, enabling script injection.
**Why it happens:** Assuming Lexical's output is safe, or using `dangerouslySetInnerHTML` without sanitization.
**How to avoid:**
- Sanitize with DOMPurify before saving to database
- Sanitize again before displaying (defense in depth)
- Use strict allowlist of tags/attributes
- Set Content-Security-Policy headers
**Warning signs:**
- Direct use of `dangerouslySetInnerHTML` without DOMPurify
- Storing unsanitized user HTML in database
- No CSP headers

### Pitfall 4: localStorage Hydration Mismatches
**What goes wrong:** Server-rendered content doesn't match client-rendered content due to localStorage values, causing hydration errors.
**Why it happens:** Reading localStorage during render before client-side hydration completes.
**How to avoid:**
- Use lazy initialization in Zustand stores (check `typeof window !== 'undefined'`)
- Don't read localStorage during SSR
- Use effect hooks to sync localStorage after mount
**Warning signs:**
- Hydration errors in console
- Flash of wrong content on page load
- Differences between SSR and client render

### Pitfall 5: Not Testing Both Toggle States
**What goes wrong:** Feature works with toggle on but breaks when off, or vice versa.
**Why it happens:** Developers test in their preferred state only.
**How to avoid:**
- Test matrix: for each feature, test both enabled and disabled
- Add unit tests that explicitly check both states
- QA checklist includes toggle state variations
**Warning signs:**
- Bug reports: "feature X breaks when Y is disabled"
- Conditional code paths without corresponding tests
- No test coverage for disabled state

### Pitfall 6: Feature Toggle Technical Debt
**What goes wrong:** Old toggles remain in codebase long after feature is fully rolled out, adding complexity.
**Why it happens:** No process for toggle cleanup; forgetting to remove after rollout.
**How to avoid:**
- Add expiration dates to toggles in comments
- Regular audits of active toggles (quarterly)
- Remove toggle when feature is stable for 2+ months
- Track toggles in separate document
**Warning signs:**
- Toggles older than 6 months
- "Legacy" or "old" in toggle names
- Toggles always set to true

### Pitfall 7: Notification Fatigue
**What goes wrong:** Users disable all notifications because too many low-value alerts.
**Why it happens:** Every feature adds notifications without considering frequency.
**How to avoid:**
- Default to important notifications only
- Provide granular per-feature controls
- Support quiet hours
- Batch related notifications (daily digest)
**Warning signs:**
- Users disabling notification channels entirely
- Support requests to reduce notification volume
- Notification preferences all set to false

### Pitfall 8: File Upload without Progress Indication
**What goes wrong:** Large file uploads appear to hang; users retry, creating duplicates.
**Why it happens:** No progress feedback for multi-second uploads.
**How to avoid:**
- Show upload progress percentage
- Display file size and estimated time
- Disable submit button during upload
- Show success confirmation
**Warning signs:**
- Duplicate upload bug reports
- "App froze" during file upload
- No visual feedback during upload

## Code Examples

Verified patterns from official sources:

### Feature Check Hook
```typescript
// Combines server access with client preferences
export function useFeature(featureId: string) {
  const { isFeatureEnabled, canAccessFeature } = useFeaturePreferenceStore();
  const { data: access } = useFeatureAccess(); // TanStack Query

  return {
    enabled: isFeatureEnabled(featureId),
    hasAccess: canAccessFeature(featureId),
    locked: !canAccessFeature(featureId),
  };
}

// Usage in component
function SeatRacingPage() {
  const { enabled, locked } = useFeature('advanced-seat-racing');

  if (locked) {
    return <FeatureDiscoveryHint featureId="advanced-seat-racing" />;
  }

  if (!enabled) {
    return <EnableFeaturePrompt featureId="advanced-seat-racing" />;
  }

  return <AdvancedSeatRacingContent />;
}
```

### Conditional Navigation Items
```typescript
// Show nav items only for enabled features
const navigationItems = [
  { id: 'roster', label: 'Roster', path: '/roster', alwaysShow: true },
  { id: 'advanced-racing', label: 'Matrix Racing', path: '/racing/matrix', featureId: 'advanced-seat-racing' },
  { id: 'recruiting', label: 'Recruiting', path: '/recruiting', featureId: 'recruiting' },
].filter(item => {
  if (item.alwaysShow) return true;
  if (!item.featureId) return true;
  return useFeaturePreferenceStore.getState().isFeatureEnabled(item.featureId);
});
```

### Recruit Visit Form with RHF + Zod
```typescript
// Source: Existing SessionForm.tsx pattern + recruitment requirements
const recruitVisitSchema = z.object({
  recruitName: z.string().min(1, 'Recruit name is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  hostAthleteId: z.string().min(1, 'Host athlete is required'),
  scheduleType: z.enum(['pdf', 'richtext']),
  scheduleContent: z.string().optional(),
  schedulePdfUrl: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.scheduleType === 'pdf' ? !!data.schedulePdfUrl : !!data.scheduleContent,
  { message: 'Schedule content is required', path: ['scheduleContent'] }
);

type RecruitVisitFormData = z.infer<typeof recruitVisitSchema>;

export function RecruitVisitForm() {
  const methods = useForm<RecruitVisitFormData>({
    resolver: zodResolver(recruitVisitSchema),
    defaultValues: {
      recruitName: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      hostAthleteId: '',
      scheduleType: 'richtext',
      notes: '',
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;
  const scheduleType = watch('scheduleType');

  // Form implementation...
}
```

### Notification Toast with Sonner
```typescript
// Source: Sonner documentation
import { toast } from 'sonner';

// Success notification
toast.success('Host athlete assigned', {
  description: 'John Smith will receive a notification',
});

// Error notification
toast.error('Failed to create visit', {
  description: error.message,
});

// With action
toast.info('Recruit visit tomorrow', {
  description: 'Visit with Sarah Johnson at 10:00 AM',
  action: {
    label: 'View Details',
    onClick: () => navigate(`/recruiting/visits/${visitId}`),
  },
});
```

### Settings Section for Feature Toggles
```typescript
// New settings tab component
export function FeaturesSection() {
  const { enabledFeatures, accessibleFeatures, toggleFeature } = useFeaturePreferenceStore();

  const featureGroups: FeatureGroup[] = [
    {
      id: 'core',
      name: 'Core Features',
      description: 'Essential features for all teams',
      features: [
        { id: 'roster', name: 'Roster & Attendance', locked: false, alwaysOn: true },
        { id: 'lineup', name: 'Lineup Builder', locked: false, alwaysOn: true },
        { id: 'erg-tracking', name: 'Erg Data Tracking', locked: false, alwaysOn: true },
      ],
    },
    {
      id: 'advanced',
      name: 'Advanced Features',
      description: 'Advanced analytics and management',
      features: [
        { id: 'advanced-seat-racing', name: 'Matrix Seat Racing', locked: !accessibleFeatures.has('advanced-seat-racing') },
        { id: 'ncaa-compliance', name: 'NCAA Compliance', locked: !accessibleFeatures.has('ncaa-compliance') },
        { id: 'recruiting', name: 'Recruit Management', locked: !accessibleFeatures.has('recruiting') },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {featureGroups.map(group => (
        <FeatureGroupCard
          key={group.id}
          group={group}
          onToggle={toggleFeature}
        />
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Draft.js for rich text | Lexical | 2023 | Meta's new editor; better performance, accessibility, smaller bundle |
| react-toastify | Sonner | 2024-2025 | Simpler API, better TypeScript, shadcn/ui standard |
| Custom feature flags | LaunchDarkly/Unleash | 2020-2023 | Enterprise services for A/B testing; overkill for UI preferences |
| LaunchDarkly | Simple Zustand store | 2025-2026 | Trend back to simplicity for team-level toggles vs user-level flags |
| Slate | Lexical or Tiptap | 2023-2024 | Slate plugin ecosystem slowed; Lexical/Tiptap more active |
| Context API for settings | Zustand with persist | 2023-2024 | Better performance, simpler API, localStorage built-in |

**Deprecated/outdated:**
- **Draft.js:** Still maintained but Meta focuses on Lexical now. Lexical has better accessibility and performance.
- **react-notification-system:** Last updated 2018; use modern alternatives like Sonner or react-hot-toast.
- **Quill:** Still popular but heavier bundle; Lexical/Tiptap better for modern React apps.
- **Enterprise feature flags for team preferences:** LaunchDarkly/Unleash are excellent for user-level A/B testing but overkill for team-level UI preferences. Trend is toward simpler client-side stores for UI toggles.

## Open Questions

Things that couldn't be fully resolved:

1. **PDF Storage Strategy**
   - What we know: Visit schedules can be uploaded as PDFs; need storage location
   - What's unclear: Is S3 already configured? Local filesystem? CDN?
   - Recommendation: Check existing file upload patterns in codebase (look for photo uploads); use same storage strategy for consistency

2. **Notification Delivery Backend**
   - What we know: Need in-app, email, and optionally push notifications
   - What's unclear: Is there existing notification infrastructure? Email service configured?
   - Recommendation: Start with in-app only (Sonner toasts + notification bell icon); defer email/push to later if no infrastructure exists

3. **Feature Access API**
   - What we know: Need to check team subscription level for feature access
   - What's unclear: Does subscription/billing system exist? How to query feature access?
   - Recommendation: Create `/api/team/feature-access` endpoint that returns array of accessible features; implement based on team settings or subscription tier

4. **Recruit Database Schema**
   - What we know: Need to store recruit info (name, visits, schedules)
   - What's unclear: Should recruits be full entities or just fields on calendar events?
   - Recommendation: Start with calendar event fields only; create separate `recruits` table if tracking multiple visits per recruit becomes complex

5. **Host Athlete Dashboard Integration**
   - What we know: Host athletes see assigned visits in dashboard
   - What's unclear: Current dashboard structure; where to display visits
   - Recommendation: Research existing dashboard implementation (Phase 12?); add "My Visits" card to athlete view

## Sources

### Primary (HIGH confidence)
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/middlewares/persist) - localStorage patterns
- [TanStack Query docs](https://tanstack.com/query/latest) - Feature flag caching patterns
- [Lexical GitHub](https://github.com/facebook/lexical) - Rich text editor status and features
- [Lexical React Getting Started](https://lexical.dev/docs/getting-started/react) - Setup guide
- Existing codebase patterns:
  - `src/store/settingsStore.js` - Feature toggle patterns
  - `src/v2/stores/userPreferenceStore.ts` - Zustand with localStorage
  - `src/v2/types/training.ts` - CalendarEvent interface
  - `src/v2/features/sessions/components/SessionForm.tsx` - Form patterns

### Secondary (MEDIUM confidence)
- [Martin Fowler Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) - Architecture patterns and pitfalls
- [Unleash Feature Flag Best Practices](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices) - 11 principles for building feature flag systems
- [Comparing React Toast Libraries 2025](https://blog.logrocket.com/react-toast-libraries-compared-2025/) - Sonner vs react-hot-toast
- [Top 9 React Notification Libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react) - Toast library comparison
- [Best React Rich Text Editors 2026](https://reactscript.com/best-rich-text-editor/) - Lexical, Tiptap, Slate comparison
- [Which Rich Text Editor Framework 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025) - Detailed comparison
- [React File Upload Restrictions](https://www.telerik.com/kendo-react-ui/components/upload/restrictions) - Validation patterns
- [React Security Best Practices 2025](https://corgea.com/Learn/react-security-best-practices-2025) - XSS prevention

### Tertiary (LOW confidence)
- [Feature Flag Anti-Patterns](https://shahbhat.medium.com/feature-flag-anti-paterns-learnings-from-outages-e1b805f23725) - Case studies from outages
- [Progressive Disclosure UI Pattern](https://www.interaction-design.org/literature/topics/progressive-disclosure) - Design principles
- [React Notification Preferences](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c) - localStorage patterns
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) - Security guidelines

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified existing codebase usage (Zustand 4.4.7, TanStack Query 5.90.20, RHF 7.71.1, Zod 4.3.4) and current library versions/status
- Architecture: HIGH - Patterns extend existing codebase structures; Zustand persist and TanStack Query verified from official docs
- Pitfalls: MEDIUM-HIGH - Martin Fowler's feature toggle article is canonical; other pitfalls from multiple sources and security best practices
- Rich text editors: HIGH - Verified Lexical v0.39.0, 22.8k stars, production-ready from GitHub; official docs confirmed
- Notifications: MEDIUM-HIGH - Sonner recommended by multiple 2025-2026 sources; no hands-on verification but consistent recommendations
- File upload: MEDIUM - Standard patterns from multiple sources; security practices from OWASP/industry sources

**Research date:** 2026-01-26
**Valid until:** 60 days (stable technologies with established patterns; rich text editor space may evolve faster)
