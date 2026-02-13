/**
 * Dashboard query options with mock data fallback.
 *
 * Each queryFn attempts the real /me/* endpoint first.
 * On 404 or network error, realistic mock data is returned.
 *
 * TODO(phase-45): Remove mock fallbacks when /me/* endpoints ship.
 */
import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { StatsData, WorkoutsData, PRsData } from './types';

// ---------------------------------------------------------------------------
// Mock data -- realistic rowing values
// TODO(phase-45): Remove all mock data when /me/* endpoints ship
// ---------------------------------------------------------------------------

const MOCK_STATS: StatsData = {
  allTime: {
    totalMeters: 245_000,
    workoutCount: 42,
    activeDays: 28,
    firstWorkoutDate: '2025-09-14T08:00:00Z',
  },
  range: {
    meters: 38_500,
    workouts: 7,
    activeDays: 5,
    period: '7d',
  },
  streak: {
    current: 5,
    longest: 12,
    lastActivityDate: '2026-02-13T07:30:00Z',
  },
};

const MOCK_WORKOUTS: WorkoutsData = {
  items: [
    {
      id: 'mock-w1',
      date: '2026-02-13T07:30:00Z',
      source: 'concept2',
      type: 'RowErg',
      machineType: 'rower',
      distanceM: 6000,
      durationSeconds: 1422,
      avgPace: 1185, // 1:58.5/500m
      avgWatts: 198,
      strokeRate: 24,
      teamId: null,
      notes: null,
    },
    {
      id: 'mock-w2',
      date: '2026-02-12T06:45:00Z',
      source: 'concept2',
      type: 'RowErg',
      machineType: 'rower',
      distanceM: 10_000,
      durationSeconds: 2388,
      avgPace: 1194, // 1:59.4/500m
      avgWatts: 195,
      strokeRate: 22,
      teamId: null,
      notes: 'Steady state',
    },
    {
      id: 'mock-w3',
      date: '2026-02-11T16:00:00Z',
      source: 'manual',
      type: null,
      machineType: 'rower',
      distanceM: 2000,
      durationSeconds: 402,
      avgPace: 1005, // 1:40.5/500m
      avgWatts: 284,
      strokeRate: 32,
      teamId: null,
      notes: '2k test piece',
    },
    {
      id: 'mock-w4',
      date: '2026-02-10T07:00:00Z',
      source: 'concept2',
      type: 'SkiErg',
      machineType: 'skierg',
      distanceM: 5000,
      durationSeconds: 1215,
      avgPace: 1215, // 2:01.5/500m
      avgWatts: 186,
      strokeRate: null,
      teamId: null,
      notes: null,
    },
    {
      id: 'mock-w5',
      date: '2026-02-08T08:15:00Z',
      source: 'concept2',
      type: 'RowErg',
      machineType: 'rower',
      distanceM: 8000,
      durationSeconds: 1920,
      avgPace: 1200, // 2:00.0/500m
      avgWatts: 192,
      strokeRate: 23,
      teamId: null,
      notes: null,
    },
  ],
  totalCount: 42,
  totalMeters: 245_000,
  cursor: null,
};

const MOCK_PRS: PRsData = {
  records: [
    {
      testType: '2k',
      machineType: 'rower',
      bestTime: 3906, // 6:30.6 in tenths
      bestDate: '2026-02-11T16:00:00Z',
      previousBest: 3960, // 6:36.0 in tenths
      improvement: -54, // 5.4 seconds faster
      recentAttempts: [
        { time: 3906, date: '2026-02-11T16:00:00Z' },
        { time: 3960, date: '2026-01-20T07:00:00Z' },
        { time: 4020, date: '2025-12-10T07:30:00Z' },
      ],
    },
    {
      testType: '500m',
      machineType: 'rower',
      bestTime: 878, // 1:27.8 in tenths
      bestDate: '2026-01-28T07:00:00Z',
      previousBest: 892,
      improvement: -14,
      recentAttempts: [
        { time: 878, date: '2026-01-28T07:00:00Z' },
        { time: 892, date: '2025-11-15T08:00:00Z' },
      ],
    },
    {
      testType: '5k',
      machineType: 'rower',
      bestTime: 11_460, // 19:06.0 in tenths
      bestDate: '2026-02-05T07:00:00Z',
      previousBest: null,
      improvement: null,
      recentAttempts: [{ time: 11_460, date: '2026-02-05T07:00:00Z' }],
    },
    {
      testType: '6k',
      machineType: 'rower',
      bestTime: 14_040, // 23:24.0 in tenths
      bestDate: '2026-01-12T08:00:00Z',
      previousBest: 14_220,
      improvement: -180,
      recentAttempts: [
        { time: 14_040, date: '2026-01-12T08:00:00Z' },
        { time: 14_220, date: '2025-10-20T07:00:00Z' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Query option factories
// ---------------------------------------------------------------------------

function isFallbackError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status === 404 || status === 501;
  }
  // Network errors, ECONNREFUSED, etc.
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return true;
  }
  return false;
}

export function statsQueryOptions(range?: string) {
  return queryOptions<StatsData>({
    queryKey: queryKeys.dashboard.stats(range),
    staleTime: 120_000,
    queryFn: async () => {
      // TODO(phase-45): Remove mock fallback when /me/stats endpoint ships
      try {
        const params = range ? { range } : undefined;
        const res = await api.get<{ data: StatsData }>('/api/v1/me/stats', {
          params,
        });
        return res.data.data;
      } catch (error) {
        if (isFallbackError(error)) {
          return MOCK_STATS;
        }
        throw error;
      }
    },
  });
}

export function recentWorkoutsQueryOptions(limit = 5) {
  return queryOptions<WorkoutsData>({
    queryKey: queryKeys.dashboard.workouts(limit),
    staleTime: 60_000,
    queryFn: async () => {
      // TODO(phase-45): Remove mock fallback when /me/workouts endpoint ships
      try {
        const res = await api.get<{ data: WorkoutsData }>('/api/v1/me/workouts', {
          params: { limit },
        });
        return res.data.data;
      } catch (error) {
        if (isFallbackError(error)) {
          return MOCK_WORKOUTS;
        }
        throw error;
      }
    },
  });
}

export function prsQueryOptions() {
  return queryOptions<PRsData>({
    queryKey: queryKeys.dashboard.prs(),
    staleTime: 300_000,
    queryFn: async () => {
      // TODO(phase-45): Remove mock fallback when /me/prs endpoint ships
      try {
        const res = await api.get<{ data: PRsData }>('/api/v1/me/prs');
        return res.data.data;
      } catch (error) {
        if (isFallbackError(error)) {
          return MOCK_PRS;
        }
        throw error;
      }
    },
  });
}
