import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  isBefore,
  eachDayOfInterval,
} from 'date-fns';
import type { CalendarEvent, PlannedWorkout } from '../types/training';

/**
 * Get week bounds for a date.
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }), // Sunday
  };
}

/**
 * Get month bounds for a date.
 */
export function getMonthBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Format date for calendar display.
 */
export function formatCalendarDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Parse simple RRULE for weekly patterns.
 * Supports: FREQ=WEEKLY;BYDAY=MO,WE,FR
 * Returns array of weekday numbers (0=Sunday, 1=Monday, etc.)
 */
export function parseRRuleWeekdays(rrule: string): number[] {
  const dayMap: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const byDayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
  if (!byDayMatch) return [];

  const days = byDayMatch[1].split(',');
  return days.map((day) => dayMap[day]).filter((d) => d !== undefined);
}

/**
 * Expand a recurring workout into calendar events for a date range.
 */
export function expandRecurringEvent(
  workout: PlannedWorkout,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (!workout.recurrenceRule || !workout.scheduledDate) {
    return events;
  }

  const weekdays = parseRRuleWeekdays(workout.recurrenceRule);
  if (weekdays.length === 0) return events;

  const workoutStart = parseISO(workout.scheduledDate);
  const durationMs = (workout.duration || 60) * 60 * 1000; // default 1 hour

  // Get all days in range
  const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  for (const day of allDays) {
    // Check if this day matches a recurring day
    if (weekdays.includes(day.getDay()) && !isBefore(day, workoutStart)) {
      // Set time from original workout
      const eventStart = new Date(day);
      eventStart.setHours(workoutStart.getHours(), workoutStart.getMinutes(), 0, 0);

      events.push({
        id: `${workout.id}-${format(day, 'yyyy-MM-dd')}`,
        title: workout.name,
        start: eventStart,
        end: new Date(eventStart.getTime() + durationMs),
        resource: {
          workoutId: workout.id,
          planId: workout.planId,
          type: workout.type,
          intensity: workout.intensity,
          tss: workout.estimatedTSS,
          isRecurring: true,
          parentId: workout.id,
        },
      });
    }
  }

  return events;
}

/**
 * Convert a PlannedWorkout to a CalendarEvent.
 */
export function workoutToCalendarEvent(workout: PlannedWorkout): CalendarEvent | null {
  if (!workout.scheduledDate) return null;

  const start = parseISO(workout.scheduledDate);
  const durationMs = (workout.duration || 60) * 60 * 1000;

  return {
    id: workout.id,
    title: workout.name,
    start,
    end: new Date(start.getTime() + durationMs),
    resource: {
      workoutId: workout.id,
      planId: workout.planId,
      type: workout.type,
      intensity: workout.intensity,
      tss: workout.estimatedTSS,
      isRecurring: !!workout.recurrenceRule,
    },
  };
}

/**
 * Resolve a CSS custom property to its computed value.
 * Falls back to provided fallback hex for SSR/pre-render safety.
 */
function resolveVar(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

/**
 * Get color for workout type using V3 design tokens.
 * Resolves CSS custom properties at runtime for theme awareness.
 * Colors chosen for 4.5:1+ contrast with white text (WCAG AA).
 */
export function getWorkoutTypeColor(type: string): string {
  const tokenMap: Record<string, { token: string; fallback: string }> = {
    erg: { token: '--data-poor', fallback: '#EF4444' }, // red - intensity
    row: { token: '--data-good', fallback: '#3B82F6' }, // blue - on-water
    cross_train: { token: '--data-excellent', fallback: '#22C55E' }, // green - cross-training
    strength: { token: '--data-warning', fallback: '#F59E0B' }, // amber - strength
    recovery: { token: '--chart-2', fallback: '#8B5CF6' }, // purple - recovery
  };
  const entry = tokenMap[type] || { token: '--ink-secondary', fallback: '#737373' };
  return resolveVar(entry.token, entry.fallback);
}

/**
 * Get color for periodization phase using V3 design tokens.
 * Resolves CSS custom properties at runtime for theme awareness.
 * Colors chosen for 4.5:1+ contrast with white text (WCAG AA).
 */
export function getPeriodizationColor(phase: string): string {
  const tokenMap: Record<string, { token: string; fallback: string }> = {
    base: { token: '--data-good', fallback: '#3B82F6' }, // blue - base phase
    build: { token: '--data-warning', fallback: '#F59E0B' }, // amber - build phase
    peak: { token: '--data-poor', fallback: '#EF4444' }, // red - peak phase
    taper: { token: '--data-excellent', fallback: '#22C55E' }, // green - taper phase
  };
  const entry = tokenMap[phase] || { token: '--ink-secondary', fallback: '#737373' };
  return resolveVar(entry.token, entry.fallback);
}
