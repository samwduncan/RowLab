/**
 * Query key factory for TanStack Query.
 * Provides structured keys for cache invalidation and prefetching.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },
  invites: {
    all: ['invites'] as const,
    validate: (code: string) => [...queryKeys.invites.all, 'validate', code] as const,
  },
  athletes: {
    all: ['athletes'] as const,
    search: (query: string) => [...queryKeys.athletes.all, 'search', query] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: (range?: string) => [...queryKeys.dashboard.all, 'stats', range] as const,
    workouts: (limit?: number) => [...queryKeys.dashboard.all, 'workouts', limit] as const,
    prs: () => [...queryKeys.dashboard.all, 'prs'] as const,
  },
} as const;
