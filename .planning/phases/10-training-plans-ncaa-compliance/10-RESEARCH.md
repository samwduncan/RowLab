# Phase 10: Training Plans & NCAA Compliance - Research

**Researched:** 2026-01-24
**Domain:** Training calendar scheduling, workout management, compliance tracking
**Confidence:** HIGH

## Summary

This phase implements a comprehensive training plan and NCAA compliance tracking system. The standard approach uses react-big-calendar (v1.19.4) with its drag-and-drop addon for calendar scheduling, combined with existing project patterns (TanStack Query for server state, react-hook-form + Zod for forms, recharts for visualization). Training load calculation follows the Training Stress Score (TSS) methodology from TrainingPeaks, adapted for rowing. NCAA 20-hour rule tracking requires daily/weekly cumulative calculations with automated warnings.

The architecture follows established patterns in the codebase: feature-based organization, form wizards for complex workflows, and TanStack Query for all server state. Calendar events should be stored once with recurrence rules (RRULE standard) rather than as separate instances.

**Primary recommendation:** Use react-big-calendar with drag-drop addon for scheduling UI, implement TSS calculation adapted for rowing with power/HR fallbacks, track NCAA hours with cumulative daily totals stored per athlete-session.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-big-calendar | v1.19.4 | Calendar UI with month/week views | Most popular React calendar (521K weekly downloads), MIT license, proven drag-drop support |
| date-fns | Current | Date manipulation/formatting | Tree-shakeable, functional API, already compatible with react-big-calendar |
| @dnd-kit/core | ^6.1.0 (installed) | Drag-drop foundation | Already used for lineup builder, consistent with existing patterns |
| recharts | ^2.10.3 (installed) | Training load visualization | Already proven in erg data phase, time series capable |
| react-hook-form | ^7.71.1 (installed) | Workout form management | Established pattern in codebase |
| Zod | ^4.3.4 (installed) | Form/data validation | Established pattern in codebase |
| TanStack Query | ^5.90.20 (installed) | Server state (events, workouts, compliance data) | Established pattern for all server state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-big-calendar/lib/addons/dragAndDrop | v1.19.4 | Calendar drag-drop HOC | Enables event rescheduling via drag |
| react-big-calendar/lib/addons/dragAndDrop/styles.css | v1.19.4 | Drag-drop styling | Required with drag-drop addon |
| zustand | ^4.4.7 (installed) | Calendar UI state (view mode, filters) | Only for complex client-side state that doesn't belong in TanStack Query |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-big-calendar | FullCalendar (@fullcalendar/react) | FullCalendar has premium features ($$), more complex setup, not React-first. RBC is free, simpler, React-native. |
| date-fns | Day.js | Day.js has smaller bundle (2KB vs 18KB tree-shaken), but date-fns has better tree-shaking, functional API, and RBC compatibility. |
| date-fns | Moment.js | Moment is deprecated, large bundle, mutable API. Never use for new projects. |
| Custom TSS | TrainingPeaks API | TP API requires paid integration. Custom calculation gives control for rowing-specific adaptations. |

**Installation:**
```bash
npm install react-big-calendar date-fns
# All other dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/v2/features/training/
├── components/
│   ├── calendar/
│   │   ├── TrainingCalendar.tsx      # Main calendar component with RBC
│   │   ├── WorkoutEventCard.tsx       # Event display in calendar
│   │   ├── CalendarToolbar.tsx        # View switcher, filters
│   │   └── DragDropHandlers.ts        # onEventDrop, onEventResize logic
│   ├── workouts/
│   │   ├── WorkoutForm.tsx            # Create/edit workout
│   │   ├── ExerciseFieldArray.tsx     # Dynamic exercise list (useFieldArray)
│   │   └── WorkoutTemplateSelector.tsx # Apply templates
│   ├── periodization/
│   │   ├── PeriodizationTimeline.tsx  # Visual block editor
│   │   ├── BlockForm.tsx              # Create base/build/peak/taper blocks
│   │   └── TemplateApplicator.tsx     # Apply template to date range
│   ├── assignments/
│   │   ├── AssignmentManager.tsx      # Assign workouts to athletes/groups
│   │   └── AthleteWorkoutView.tsx     # Athlete's assigned plan view
│   └── compliance/
│       ├── ComplianceDashboard.tsx    # Coach overview
│       ├── WeeklyHoursTable.tsx       # Per-athlete weekly totals
│       ├── TrainingLoadChart.tsx      # TSS/volume recharts
│       └── NCAA20HourWarning.tsx      # Alert component
├── hooks/
│   ├── useCalendarEvents.ts           # TanStack Query: calendar data
│   ├── useWorkouts.ts                 # TanStack Query: CRUD workouts
│   ├── usePeriodization.ts            # TanStack Query: blocks
│   ├── useAssignments.ts              # TanStack Query: athlete assignments
│   ├── useComplianceData.ts           # TanStack Query: NCAA tracking
│   └── useTSSCalculation.ts           # Client-side TSS calculation
├── utils/
│   ├── tssCalculator.ts               # TSS formulas
│   ├── ncaaRules.ts                   # 20-hour rule logic, warnings
│   ├── rruleParser.ts                 # Parse/generate RRULE strings
│   └── calendarHelpers.ts             # Date range, event mapping
└── types/
    ├── workouts.ts                    # Workout, Exercise types
    ├── periodization.ts               # Block, Template types
    └── compliance.ts                  # NCAAAudit, TrainingLoad types
```

### Pattern 1: Calendar Event Management with TanStack Query
**What:** Store calendar events server-side, fetch with TanStack Query, manage optimistic updates for drag-drop operations.
**When to use:** All calendar operations (fetch events, reschedule, create/delete).
**Example:**
```typescript
// Source: TanStack Query docs + react-big-calendar patterns
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const DnDCalendar = withDragAndDrop(Calendar);

export function TrainingCalendar() {
  const queryClient = useQueryClient();

  // Fetch calendar events
  const { data: events = [] } = useQuery({
    queryKey: ['calendar', 'events', startDate, endDate],
    queryFn: () => fetchEvents(startDate, endDate),
  });

  // Reschedule mutation with optimistic update
  const rescheduleMutation = useMutation({
    mutationFn: ({ eventId, start, end }) =>
      api.patch(`/workouts/${eventId}`, { scheduledDate: start }),
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['calendar', 'events'] });
      const previous = queryClient.getQueryData(['calendar', 'events']);

      queryClient.setQueryData(['calendar', 'events'], (old: Event[]) =>
        old.map(e => e.id === variables.eventId
          ? { ...e, start: variables.start, end: variables.end }
          : e
        )
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['calendar', 'events'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });

  return (
    <DnDCalendar
      events={events}
      onEventDrop={({ event, start, end }) =>
        rescheduleMutation.mutate({ eventId: event.id, start, end })
      }
      onEventResize={({ event, start, end }) =>
        rescheduleMutation.mutate({ eventId: event.id, start, end })
      }
      draggableAccessor={() => true}
      resizable
    />
  );
}
```

### Pattern 2: Dynamic Workout Form with useFieldArray
**What:** Build workout forms with dynamic exercise lists using react-hook-form's useFieldArray.
**When to use:** Creating workouts with variable number of exercises, sets, or intervals.
**Example:**
```typescript
// Source: react-hook-form docs - useFieldArray
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name required'),
  sets: z.coerce.number().min(1).max(10),
  reps: z.coerce.number().min(1).max(100),
  intensity: z.string().optional(), // e.g., "70% FTP", "Rate 22"
  duration: z.coerce.number().optional(), // seconds
});

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name required'),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise required'),
  estimatedTSS: z.coerce.number().optional(),
});

export function WorkoutForm({ onSubmit }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      exercises: [{ name: '', sets: 1, reps: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Workout name" />

      {fields.map((field, index) => (
        <div key={field.id}> {/* field.id is auto-generated unique key */}
          <input
            {...register(`exercises.${index}.name`)}
            placeholder="Exercise name"
          />
          <input
            {...register(`exercises.${index}.sets`)}
            type="number"
            placeholder="Sets"
          />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '', sets: 1, reps: 1 })}>
        Add Exercise
      </button>
      <button type="submit">Save Workout</button>
    </form>
  );
}
```

### Pattern 3: Recurring Events with RRULE
**What:** Store recurring workouts once with recurrence rule, expand in client for display.
**When to use:** Weekly training schedules, repeating workouts.
**Example:**
```typescript
// Source: RFC-5545 iCalendar RRULE standard
// Store in database:
{
  id: 'workout-123',
  name: 'Morning Practice',
  rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR', // Every Mon/Wed/Fri
  dtstart: '2026-01-06T06:00:00Z',
  dtend: '2026-03-15T06:00:00Z', // Optional end date
  duration: 120, // minutes
}

// Expand for calendar display (use library like rrule.js or parse manually)
function expandRecurringEvent(event, startDate, endDate) {
  // Parse RRULE and generate instances between startDate and endDate
  // Return array of individual event instances for calendar
  const instances = parseRRule(event.rrule, event.dtstart, endDate);
  return instances.map(date => ({
    ...event,
    start: date,
    end: addMinutes(date, event.duration),
    isRecurring: true,
    parentId: event.id,
  }));
}
```

### Pattern 4: TSS Calculation for Rowing
**What:** Calculate Training Stress Score adapted for rowing with power meter or HR fallback.
**When to use:** Every completed workout to track training load.
**Example:**
```typescript
// Source: TrainingPeaks TSS formula + rowing adaptations
interface WorkoutData {
  durationSeconds: number;
  avgWatts?: number;
  avgHeartRate?: number;
  ftp?: number; // Functional Threshold Power (from athlete profile)
  fthr?: number; // Functional Threshold Heart Rate
}

export function calculateTSS(data: WorkoutData): number {
  const { durationSeconds, avgWatts, avgHeartRate, ftp, fthr } = data;

  // Power-based TSS (most accurate)
  if (avgWatts && ftp) {
    const intensityFactor = avgWatts / ftp;
    const tss = (durationSeconds * avgWatts * intensityFactor) / (ftp * 3600) * 100;
    return Math.round(tss);
  }

  // HR-based TSS fallback (hrTSS)
  if (avgHeartRate && fthr) {
    const intensityFactor = avgHeartRate / fthr;
    const hrTSS = (durationSeconds / 3600) * intensityFactor * intensityFactor * 100;
    return Math.round(hrTSS);
  }

  // Fallback: duration-based estimate (least accurate)
  // Assume moderate intensity (IF ~0.75)
  const estimatedTSS = (durationSeconds / 3600) * 0.75 * 0.75 * 100;
  return Math.round(estimatedTSS);
}

// Weekly training load calculation
export function calculateWeeklyLoad(workouts: WorkoutData[]): {
  totalTSS: number;
  avgTSSPerDay: number;
  peakTSS: number;
} {
  const totalTSS = workouts.reduce((sum, w) => sum + calculateTSS(w), 0);
  return {
    totalTSS,
    avgTSSPerDay: totalTSS / 7,
    peakTSS: Math.max(...workouts.map(calculateTSS)),
  };
}
```

### Pattern 5: NCAA 20-Hour Rule Tracking
**What:** Track cumulative daily/weekly practice hours per athlete, warn when approaching 20-hour limit.
**When to use:** All practice/training sessions, compliance reporting.
**Example:**
```typescript
// Source: NCAA Bylaw 17.1.5.3.4 + compliance tracking patterns
interface PracticeSession {
  athleteId: string;
  date: string; // ISO date
  durationMinutes: number;
  isCompetition: boolean; // Competitions count as 3 hours regardless of actual duration
  activityType: 'practice' | 'strength' | 'film' | 'competition';
}

export function calculateWeeklyHours(
  athleteId: string,
  weekStartDate: Date,
  sessions: PracticeSession[]
): { totalHours: number; isNearLimit: boolean; isOverLimit: boolean } {
  const weekEnd = addDays(weekStartDate, 7);

  const weekSessions = sessions.filter(s =>
    s.athleteId === athleteId &&
    isWithinInterval(parseISO(s.date), { start: weekStartDate, end: weekEnd })
  );

  const totalMinutes = weekSessions.reduce((sum, session) => {
    // Competition = 3 hours per NCAA rules
    if (session.isCompetition) return sum + 180;
    return sum + session.durationMinutes;
  }, 0);

  const totalHours = totalMinutes / 60;

  return {
    totalHours,
    isNearLimit: totalHours >= 18, // Warning at 18 hours
    isOverLimit: totalHours > 20,  // Alert at 20+ hours
  };
}

// Daily 4-hour limit check
export function validateDailyHours(
  athleteId: string,
  date: string,
  sessions: PracticeSession[]
): { dailyHours: number; isOverDailyLimit: boolean } {
  const daySessions = sessions.filter(s =>
    s.athleteId === athleteId && s.date === date
  );

  const dailyMinutes = daySessions.reduce((sum, s) =>
    s.isCompetition ? sum + 180 : sum + s.durationMinutes, 0
  );

  const dailyHours = dailyMinutes / 60;

  return {
    dailyHours,
    isOverDailyLimit: dailyHours > 4, // NCAA daily limit
  };
}
```

### Pattern 6: Periodization Block Management
**What:** Define training phases (base/build/peak/taper) with date ranges and apply workout templates.
**When to use:** Season planning, macro-cycle design.
**Example:**
```typescript
// Source: Training periodization best practices 2026
type PeriodizationPhase = 'base' | 'build' | 'peak' | 'taper';

interface PeriodizationBlock {
  id: string;
  phase: PeriodizationPhase;
  startDate: string; // ISO date
  endDate: string;
  weeklyTSSTarget: number; // Target training load
  focusAreas: string[]; // e.g., ['aerobic endurance', 'technique']
  templateId?: string; // Optional workout template to apply
}

// Typical phase durations and TSS progression
const PHASE_GUIDELINES: Record<PeriodizationPhase, {
  minWeeks: number;
  maxWeeks: number;
  tssProgression: 'gradual' | 'maintain' | 'intense' | 'reduce';
}> = {
  base: { minWeeks: 6, maxWeeks: 12, tssProgression: 'gradual' }, // 3-8 TSS increase/week
  build: { minWeeks: 4, maxWeeks: 8, tssProgression: 'maintain' }, // Maintain CTL
  peak: { minWeeks: 2, maxWeeks: 4, tssProgression: 'intense' }, // Race-specific
  taper: { minWeeks: 1, maxWeeks: 2, tssProgression: 'reduce' }, // 20-50% volume reduction
};

export function validateBlock(block: PeriodizationBlock): string[] {
  const errors: string[] = [];
  const weeks = differenceInWeeks(parseISO(block.endDate), parseISO(block.startDate));
  const guidelines = PHASE_GUIDELINES[block.phase];

  if (weeks < guidelines.minWeeks) {
    errors.push(`${block.phase} phase should be at least ${guidelines.minWeeks} weeks`);
  }
  if (weeks > guidelines.maxWeeks) {
    errors.push(`${block.phase} phase should not exceed ${guidelines.maxWeeks} weeks`);
  }

  return errors;
}
```

### Anti-Patterns to Avoid
- **Storing recurring events as separate DB rows:** Clogs database, makes updates impossible. Use RRULE and expand at runtime.
- **Calculating TSS on every render:** TSS calculation should happen server-side on workout completion, cached in DB.
- **Manual date arithmetic:** Use date-fns for all date operations to avoid timezone/DST bugs.
- **Mutable calendar state in props:** Calendar events should be immutable; use TanStack Query for state management.
- **Ignoring NCAA competition time rule:** Competitions count as 3 hours regardless of actual duration per NCAA rules.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar UI with drag-drop | Custom calendar grid component | react-big-calendar + dragAndDrop addon | Event positioning, time zones, view switching, accessibility all handled. |
| Recurring event logic | Custom "repeat weekly" checkbox | RRULE standard (RFC-5545) | Handles complex patterns (every 2nd Tuesday, last Friday, etc.), industry standard, parseable. |
| Date/time manipulation | Manual date arithmetic | date-fns library | Handles time zones, DST, leap years, localization correctly. |
| Training load calculation | Custom "points" system | TSS methodology (adapted for rowing) | Validated by TrainingPeaks, accounts for duration AND intensity, industry standard. |
| Form state for dynamic fields | Manual array manipulation | react-hook-form useFieldArray | Handles validation, unique keys, re-ordering, performance optimization. |
| Time series visualization | Custom SVG charts | recharts (already installed) | Responsive, animated, customizable, proven in erg data phase. |

**Key insight:** Calendar and scheduling problems have deep complexity (time zones, DST, recurring patterns, drag-drop UX). Using proven libraries saves weeks of edge case debugging. TSS calculation is a validated methodology—don't invent a new metric.

## Common Pitfalls

### Pitfall 1: Calendar Event Time Zone Issues
**What goes wrong:** Events display at wrong times, or shift when user changes time zone.
**Why it happens:** Mixing local dates and UTC timestamps, not storing time zone with events.
**How to avoid:**
- Store all event times as ISO 8601 strings with UTC offset: `2026-01-24T06:00:00-05:00`
- Use date-fns `parseISO()` and `formatISO()` for all conversions
- Display times in user's local time zone via date-fns `format()` with time zone support
**Warning signs:** Events shift by hours when refreshing page, or show wrong times for users in different locations.

### Pitfall 2: Optimistic Updates Without Rollback
**What goes wrong:** Drag-drop reschedules an event, API fails, event stays in new position incorrectly.
**Why it happens:** Optimistic UI update without error handling or rollback logic.
**How to avoid:**
- Use TanStack Query's `onMutate` for optimistic update
- Return previous state from `onMutate`
- Implement `onError` to rollback using returned context
- Always call `invalidateQueries` in `onSettled`
**Warning signs:** Events "jump back" after API calls, or stay in wrong position after errors.

### Pitfall 3: NCAA Hour Calculation Errors
**What goes wrong:** Weekly totals are incorrect, missing the competition 3-hour rule, or counting non-CARA activities.
**Why it happens:** Misunderstanding NCAA rules about what counts and how competitions are measured.
**How to avoid:**
- Competition = exactly 3 hours regardless of actual duration (NCAA rule)
- Track activities by type; only count CARA (Countable Athletically Related Activities)
- Strength training, conditioning, film sessions may or may not count (check NCAA bylaws)
- Week runs Monday-Sunday per NCAA tracking requirements
- Store both actual duration and NCAA-countable duration separately
**Warning signs:** Compliance reports don't match manual calculations, coaches report incorrect hour totals.

### Pitfall 4: TSS Calculation Without Athlete Context
**What goes wrong:** Same workout gives same TSS for all athletes regardless of fitness level.
**Why it happens:** Forgetting TSS is relative to athlete's FTP/FTHR.
**How to avoid:**
- TSS requires athlete-specific FTP (Functional Threshold Power) or FTHR (Heart Rate)
- Store FTP/FTHR in athlete profile, update periodically (every 6-8 weeks)
- TSS = f(duration, intensity, **athlete's FTP**)—not absolute
- If no FTP available, estimate based on test results or use hrTSS with HR data
**Warning signs:** TSS values identical for beginners and varsity athletes, coaches question accuracy.

### Pitfall 5: Workout Template Application Overwrites Custom Changes
**What goes wrong:** Coach applies template to date range, erases existing custom workouts.
**Why it happens:** Template application doesn't check for existing events or ask for confirmation.
**How to avoid:**
- Before applying template, check date range for existing workouts
- Show confirmation dialog listing conflicts: "5 existing workouts will be replaced"
- Offer options: "Replace all", "Skip conflicting dates", "Merge with existing"
- Implement "undo" functionality for template applications
**Warning signs:** Coaches complain about losing work, frequent re-creation of deleted workouts.

### Pitfall 6: react-big-calendar CSS Import Missing
**What goes wrong:** Calendar renders as unstyled list of events, no grid visible.
**Why it happens:** Forgot to import required CSS files for react-big-calendar and drag-drop addon.
**How to avoid:**
```typescript
// REQUIRED in component using calendar:
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // If using DnD
```
**Warning signs:** Calendar appears as plain list, no styling, drag-drop doesn't work visually.

### Pitfall 7: Calendar Container Height Not Set
**What goes wrong:** Calendar doesn't render or appears collapsed to 0px height.
**Why it happens:** react-big-calendar requires explicit height on container element.
**How to avoid:**
```css
/* Container must have explicit height */
.calendar-container {
  height: 600px; /* Or use 100vh, calc(), etc. */
}
```
**Warning signs:** Calendar doesn't appear, console warnings about height, events not visible.

### Pitfall 8: Forgetting useFieldArray Unique Keys
**What goes wrong:** React warnings, form state corruption, exercises disappear when editing.
**Why it happens:** Using array index as key instead of `field.id` from useFieldArray.
**How to avoid:**
```typescript
// WRONG:
{fields.map((field, index) => <div key={index}>...</div>)}

// CORRECT:
{fields.map((field, index) => <div key={field.id}>...</div>)}
// useFieldArray auto-generates unique `id` for each field
```
**Warning signs:** React key warnings in console, form behaves strangely when reordering.

## Code Examples

Verified patterns from official sources:

### Basic Calendar Setup
```typescript
// Source: react-big-calendar v1.19.4 GitHub README
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function BasicCalendar() {
  const [events, setEvents] = useState([
    {
      title: 'Morning Practice',
      start: new Date(2026, 0, 24, 6, 0, 0),
      end: new Date(2026, 0, 24, 8, 0, 0),
    },
  ]);

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
}
```

### Drag and Drop Implementation
```typescript
// Source: react-big-calendar drag-drop addon API
import { Calendar } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const DnDCalendar = withDragAndDrop(Calendar);

export function DraggableCalendar() {
  const moveEvent = ({ event, start, end, isAllDay }) => {
    // Update event in state/server
    console.log(`Moved ${event.title} to ${start}`);
  };

  const resizeEvent = ({ event, start, end }) => {
    // Update event duration
    console.log(`Resized ${event.title}: ${start} to ${end}`);
  };

  return (
    <DnDCalendar
      localizer={localizer}
      events={events}
      onEventDrop={moveEvent}
      onEventResize={resizeEvent}
      draggableAccessor={() => true} // All events draggable
      resizable
    />
  );
}
```

### TanStack Query Integration
```typescript
// Source: TanStack Query v5 docs + calendar patterns
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCalendarEvents(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['calendar', 'events', formatISO(startDate), formatISO(endDate)],
    queryFn: async () => {
      const response = await fetch(
        `/api/workouts?start=${formatISO(startDate)}&end=${formatISO(endDate)}`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRescheduleWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, newDate }: { workoutId: string; newDate: Date }) =>
      fetch(`/api/workouts/${workoutId}`, {
        method: 'PATCH',
        body: JSON.stringify({ scheduledDate: formatISO(newDate) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}
```

### Weekly Training Load Chart (recharts)
```typescript
// Source: recharts time series patterns
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface WeeklyLoad {
  week: string; // 'Week 1', 'Week 2', etc.
  tss: number;
  volume: number; // minutes
}

export function TrainingLoadChart({ data }: { data: WeeklyLoad[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="week" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="tss"
        stroke="#8884d8"
        name="Training Stress Score"
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="volume"
        stroke="#82ca9d"
        name="Volume (min)"
      />
    </LineChart>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Moment.js for dates | date-fns or Day.js | ~2020 | Moment deprecated, smaller bundles, tree-shaking support |
| Store recurring events as separate rows | RRULE standard (RFC-5545) | Industry standard | Efficient storage, easier updates, handles complex patterns |
| Custom form state management | react-hook-form v7 + Zod | 2021+ | Better performance, built-in validation, TypeScript support |
| Redux for all state | TanStack Query for server state, minimal client state | 2020+ | Less boilerplate, automatic caching, optimistic updates |
| Manual drag-drop implementation | @dnd-kit or react-beautiful-dnd | 2021+ | Accessibility, touch support, better UX out-of-box |
| Custom training load metrics | TSS (Training Stress Score) standard | Established 2006 | Industry validation, comparable across athletes, supported by major platforms |

**Deprecated/outdated:**
- **Moment.js:** Official maintenance mode since 2020. Use date-fns (tree-shakeable, functional) or Day.js (smaller).
- **FullCalendar free version:** Basic features only; premium required for resource scheduling. react-big-calendar offers more features free.
- **Manual RRULE parsing:** Use `rrule.js` library instead of writing custom parsers.
- **Redux for calendar state:** Overkill for this use case. TanStack Query handles server state, Zustand for minimal UI state.

## Open Questions

Things that couldn't be fully resolved:

1. **RRULE Library Choice**
   - What we know: RRULE standard (RFC-5545) is the way to go
   - What's unclear: Best TypeScript-friendly library for parsing RRULE in React (rrule.js vs rrule-rust vs custom parser)
   - Recommendation: Start with `rrule.js` (most popular, 3.5K stars), but verify TypeScript support. If complex patterns not needed, simple parser may suffice for "FREQ=WEEKLY;BYDAY=MO,WE,FR" patterns.

2. **Rowing-Specific TSS Formula**
   - What we know: TSS = (duration × NP × IF) / (FTP × 3600) × 100 for power-based
   - What's unclear: Best way to adapt for rowing workouts without power meter (erg data has watts, but water workouts don't)
   - Recommendation: Use power-based TSS for erg workouts (data available from erg tests), hrTSS for water workouts based on heart rate, duration-based estimate as fallback. Consider consulting rowing-specific training load research (Ludum blog mentions rowing-specific models).

3. **NCAA Countable Activities Definition**
   - What we know: CARA (Countable Athletically Related Activities) limited to 20 hours/week, competitions = 3 hours
   - What's unclear: Exact categorization of strength training, film sessions, voluntary workouts per NCAA rules
   - Recommendation: Provide activity type dropdown (practice/competition/strength/film/voluntary) with coach ability to mark as "countable" or "non-countable" to allow flexibility for NCAA interpretation. Include compliance disclaimer. Consider adding NCAA rulebook references.

4. **Calendar View Persistence**
   - What we know: react-big-calendar supports month, week, day, agenda views
   - What's unclear: Should view preference persist per user in DB or just localStorage?
   - Recommendation: Start with localStorage for MVP (simpler), move to user preferences table if coaches request cross-device persistence.

5. **Workout Completion Verification**
   - What we know: Athletes need to mark workouts as completed (ATH-08)
   - What's unclear: Should completion require data entry (time, distance, HR) or just checkbox? How to verify attendance vs completion?
   - Recommendation: Two-tier system: "Attended" (links to attendance tracking from ATT-04) and "Completed with data" (optional workout result entry). This connects to existing attendance system while allowing performance data entry for serious athletes.

## Sources

### Primary (HIGH confidence)
- react-big-calendar v1.19.4 GitHub: https://github.com/jquense/react-big-calendar (Version, features, API)
- react-big-calendar drag-drop addon: https://github.com/jquense/react-big-calendar/tree/master/src/addons/dragAndDrop (Callbacks, props, implementation)
- react-hook-form useFieldArray API: https://react-hook-form.com/docs/usefieldarray (Official docs, examples)
- TanStack Query v5 docs: https://tanstack.com/query/latest (State management patterns)
- TrainingPeaks TSS formula: https://help.trainingpeaks.com/hc/en-us/articles/204071944-Training-Stress-Scores-TSS-Explained (TSS calculation methodology)
- RFC-5545 RRULE spec: https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html (Recurring event standard)
- date-fns documentation: Verified via npm package metadata and existing codebase usage

### Secondary (MEDIUM confidence)
- npm-compare: react-big-calendar vs FullCalendar: https://npm-compare.com/fullcalendar,react-big-calendar (Download stats, version info)
- date-fns vs Day.js comparison: https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries (Bundle size, features)
- Training periodization guide 2026: https://www.ptpioneer.com/personal-training/certifications/study/periodization/ (Base/build/peak/taper phases)
- COROS periodization: https://coros.com/stories/coros-coaches/c/periodization-how-coros-uses-phases-to-build-training-plans (Phase definitions, TSS targets)
- NCAA 20-hour rule: https://ncaaorg.s3.amazonaws.com/compliance/d1/D1Comp_TimeDemandsInfo.pdf (CARA/VARA tracking rules)
- Recurring events implementation: https://www.apriorit.com/dev-blog/web-recurring-events-feature-calendar-app-development (Architecture patterns)

### Tertiary (LOW confidence - WebSearch only, flagged for validation)
- TSS for rowing erg: https://www.c2forum.com/viewtopic.php?t=186590 (Community discussion, not official)
- Ludum rowing training load: https://ludum.com/blog/data-performance-analytics/determining-a-relevant-training-load-score-in-rowing/ (Alternative rowing-specific approach, validate with coach)
- AthleteMonitoring templates: https://support.en.athletemonitoring.com/support/solutions/articles/13000053150-creating-workout-templates (Competitor pattern reference)
- recharts time series: https://github.com/recharts/recharts/issues/956 (GitHub issue discussion, not official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-big-calendar verified via GitHub, npm stats confirm popularity, existing codebase has compatible dependencies
- Architecture: HIGH - Patterns match existing codebase (TanStack Query, react-hook-form, feature structure), verified via existing implementations
- Pitfalls: MEDIUM - Common issues documented in GitHub issues and community sources, NCAA rules verified via official PDF, calendar issues from RBC docs
- TSS calculation: MEDIUM - TrainingPeaks formula verified, rowing adaptation requires domain validation with coaches
- NCAA compliance: MEDIUM - Official NCAA PDF confirms 20-hour rule, but exact CARA categorization may need legal/compliance review

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable ecosystem, libraries mature)

**Notes:**
- All core dependencies already installed in package.json
- Existing patterns (TanStack Query, react-hook-form, Zod, recharts, @dnd-kit) proven in Phases 6-9
- Only new dependency: react-big-calendar + date-fns
- Consider adding rrule.js if complex recurring patterns needed beyond basic weekly repeats
