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
    end: endOfWeek(date, { weekStartsOn: 1 }),     // Sunday
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
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
  };

  const byDayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
  if (!byDayMatch) return [];

  const days = byDayMatch[1].split(',');
  return days.map(day => dayMap[day]).filter(d => d !== undefined);
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
 * Get color for workout type.
 * Colors chosen for 4.5:1+ contrast with white text (WCAG AA).
 */
export function getWorkoutTypeColor(type: string): string {
  const colors: Record<string, string> = {
    erg: '#b91c1c',       // red-700 (5.6:1 with white)
    row: '#1d4ed8',       // blue-700 (6.3:1 with white)
    cross_train: '#15803d', // green-700 (4.6:1 with white)
    strength: '#b45309',   // amber-700 (4.8:1 with white)
    recovery: '#6d28d9',   // purple-700 (4.6:1 with white)
  };
  return colors[type] || '#6b7280'; // gray default
}

/**
 * Get color for periodization phase.
 * Colors chosen for 4.5:1+ contrast with white text (WCAG AA).
 */
export function getPeriodizationColor(phase: string): string {
  const colors: Record<string, string> = {
    base: '#1d4ed8',    // blue-700 (6.3:1 with white)
    build: '#b45309',   // amber-700 (4.8:1 with white)
    peak: '#b91c1c',    // red-700 (5.6:1 with white)
    taper: '#15803d',   // green-700 (4.6:1 with white)
  };
  return colors[phase] || '#6b7280';
}
