import { QueryClient } from '@tanstack/react-query';

// Create client outside component to avoid recreation on render
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (v5 renamed cacheTime)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on tab focus
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});
