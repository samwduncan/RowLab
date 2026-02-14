/**
 * Workout utility functions: auto-calculation, day grouping, calendar grid, sport mapping.
 */

import {
  isToday,
  isYesterday,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';

import type { SportType } from './constants';
import type { Workout } from './types';
import type { WorkoutGroup } from './types';

/**
 * Auto-calculate the third value from any two of distance, time, pace.
 * Pace is in tenths of seconds per 500m.
 * Duration is in seconds.
 * Distance is in meters.
 *
 * Returns only the calculated field(s). If fewer than 2 inputs are provided
 * or all 3 are provided, returns an empty object.
 */
export function autoCalculate(
  distanceM: number | undefined,
  durationSeconds: number | undefined,
  paceTenths: number | undefined
): { distanceM?: number; durationSeconds?: number; avgPace?: number } {
  const result: { distanceM?: number; durationSeconds?: number; avgPace?: number } = {};

  if (distanceM && durationSeconds && !paceTenths) {
    // Calculate pace from distance + time
    // pace (tenths/500m) = (time / (distance / 500)) * 10
    result.avgPace = Math.round((durationSeconds / (distanceM / 500)) * 10);
  } else if (distanceM && paceTenths && !durationSeconds) {
    // Calculate time from distance + pace
    // time (seconds) = (pace_tenths / 10) * (distance / 500)
    result.durationSeconds = Math.round((paceTenths / 10) * (distanceM / 500));
  } else if (durationSeconds && paceTenths && !distanceM) {
    // Calculate distance from time + pace
    // distance (meters) = (time / (pace_tenths / 10)) * 500
    result.distanceM = Math.round((durationSeconds / (paceTenths / 10)) * 500);
  }

  return result;
}

/**
 * Group workouts by calendar day, producing date-labeled sections.
 * Returns groups ordered by the input order (typically date desc).
 * Labels: "Today", "Yesterday", "Feb 12", "Jan 5, 2025" (for different years).
 */
export function groupWorkoutsByDay(workouts: Workout[]): WorkoutGroup[] {
  const groups = new Map<string, Workout[]>();

  for (const workout of workouts) {
    const dateKey = workout.date.split('T')[0] ?? workout.date; // "2026-02-14"
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(workout);
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => {
    const date = new Date(dateKey + 'T00:00:00');
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else if (date.getFullYear() === new Date().getFullYear()) label = format(date, 'MMM d');
    else label = format(date, 'MMM d, yyyy');

    return { dateKey, label, workouts: items };
  });
}

/**
 * Get all visible calendar days for a month view.
 * Returns dates from the start of the first visible week (Sunday)
 * through the end of the last visible week, producing a complete 5-6 week grid.
 */
export function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

/**
 * Reverse-map a workout's DB type/machineType to a user-friendly SportType key.
 * Falls back to 'Other' for unknown combinations.
 */
export function getSportFromWorkout(workout: {
  type: string | null;
  machineType: string | null;
}): SportType {
  if (workout.type === 'erg') {
    if (workout.machineType === 'rower') return 'RowErg';
    if (workout.machineType === 'skierg') return 'SkiErg';
    if (workout.machineType === 'bikerg') return 'BikeErg';
    return 'RowErg'; // Default erg to RowErg
  }
  if (workout.type === 'cardio') {
    // Without machineType, best guess based on most common cardio
    return 'Running';
  }
  if (workout.type === 'strength') return 'Strength';
  if (workout.type === 'other') return 'Other';

  return 'Other';
}

/**
 * Aggregate volume metrics across an array of workouts.
 * Null-safe: skips null/undefined values in sums.
 */
export function getWorkoutVolume(workouts: Workout[]): {
  totalMeters: number;
  totalSeconds: number;
  count: number;
} {
  let totalMeters = 0;
  let totalSeconds = 0;

  for (const w of workouts) {
    if (w.distanceM != null) totalMeters += w.distanceM;
    if (w.durationSeconds != null) totalSeconds += w.durationSeconds;
  }

  return { totalMeters, totalSeconds, count: workouts.length };
}
