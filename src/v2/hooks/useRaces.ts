import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type {
  Event,
  EventFormData,
  Race,
  RaceFormData,
  RaceResult,
  RaceResultFormData,
} from '../types/regatta';
import { queryKeys } from '../lib/queryKeys';

const API_URL = import.meta.env.VITE_API_URL || '';

// Query keys

// ============================================
// Event API Functions
// ============================================

async function createEvent(token: string, regattaId: string, event: EventFormData): Promise<Event> {
  const res = await fetch(`${API_URL}/api/v1/regattas/${regattaId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create event');
  }
  const data = await res.json();
  return data.data.event;
}

async function updateEvent(
  token: string,
  eventId: string,
  updates: Partial<EventFormData>
): Promise<Event> {
  const res = await fetch(`${API_URL}/api/v1/regattas/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error('Failed to update event');
  const data = await res.json();
  return data.data.event;
}

async function deleteEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/regattas/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete event');
}

// ============================================
// Race API Functions
// ============================================

async function createRace(token: string, eventId: string, race: RaceFormData): Promise<Race> {
  const res = await fetch(`${API_URL}/api/v1/regattas/events/${eventId}/races`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(race),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create race');
  }
  const data = await res.json();
  return data.data.race;
}

async function updateRace(
  token: string,
  raceId: string,
  updates: Partial<RaceFormData>
): Promise<Race> {
  const res = await fetch(`${API_URL}/api/v1/regattas/races/${raceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error('Failed to update race');
  const data = await res.json();
  return data.data.race;
}

async function deleteRace(token: string, raceId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/regattas/races/${raceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete race');
}

// ============================================
// Result API Functions
// ============================================

async function addResult(
  token: string,
  raceId: string,
  result: RaceResultFormData
): Promise<RaceResult> {
  const res = await fetch(`${API_URL}/api/v1/regattas/races/${raceId}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(result),
  });

  if (!res.ok) throw new Error('Failed to add result');
  const data = await res.json();
  return data.data.result;
}

async function batchAddResults(
  token: string,
  raceId: string,
  results: RaceResultFormData[]
): Promise<RaceResult[]> {
  const res = await fetch(`${API_URL}/api/v1/regattas/races/${raceId}/results/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ results }),
  });

  if (!res.ok) throw new Error('Failed to add results');
  const data = await res.json();
  return data.data.results;
}

async function updateResult(
  token: string,
  resultId: string,
  updates: Partial<RaceResultFormData>
): Promise<RaceResult> {
  const res = await fetch(`${API_URL}/api/v1/regattas/results/${resultId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error('Failed to update result');
  const data = await res.json();
  return data.data.result;
}

// ============================================
// Event Hooks
// ============================================

export function useCreateEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ regattaId, event }: { regattaId: string; event: EventFormData }) => {
      if (!accessToken) throw new Error('Authentication required');
      return createEvent(accessToken, regattaId, event);
    },
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ regattaId, event }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.detail(regattaId) });
      const previous = queryClient.getQueryData(queryKeys.regattas.detail(regattaId));

      queryClient.setQueryData(queryKeys.regattas.detail(regattaId), (old: any) => {
        if (!old) return old;
        const tempEvent = { ...event, id: `temp-${Date.now()}`, races: [] };
        return { ...old, events: [...(old.events || []), tempEvent] };
      });

      return { previous, regattaId };
    },
    onError: (err, { regattaId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.regattas.detail(regattaId), context.previous);
      }
    },
    onSettled: (_, __, { regattaId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.detail(regattaId) });
    },
  });
}

export function useUpdateEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<EventFormData> }) =>
      updateEvent(accessToken!, eventId, updates),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ eventId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Update all regatta caches that contain this event
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) => (e.id === eventId ? { ...e, ...updates } : e)),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

export function useDeleteEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(accessToken!, eventId),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Remove event from all regatta caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.filter((e: any) => e.id !== eventId),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

// ============================================
// Race Hooks
// ============================================

export function useCreateRace() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, race }: { eventId: string; race: RaceFormData }) =>
      createRace(accessToken!, eventId, race),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ eventId, race }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Add temp race to event
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) =>
            e.id === eventId
              ? {
                  ...e,
                  races: [...(e.races || []), { ...race, id: `temp-${Date.now()}`, results: [] }],
                }
              : e
          ),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

export function useUpdateRace() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ raceId, updates }: { raceId: string; updates: Partial<RaceFormData> }) =>
      updateRace(accessToken!, raceId, updates),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ raceId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Update race in all caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) => ({
            ...e,
            races: e.races?.map((r: any) => (r.id === raceId ? { ...r, ...updates } : r)),
          })),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

export function useDeleteRace() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (raceId: string) => deleteRace(accessToken!, raceId),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async (raceId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Remove race from all caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) => ({
            ...e,
            races: e.races?.filter((r: any) => r.id !== raceId),
          })),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

// ============================================
// Result Hooks
// ============================================

export function useAddResult() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ raceId, result }: { raceId: string; result: RaceResultFormData }) =>
      addResult(accessToken!, raceId, result),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ raceId, result }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Add result to race in all caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) => ({
            ...e,
            races: e.races?.map((r: any) =>
              r.id === raceId
                ? { ...r, results: [...(r.results || []), { ...result, id: `temp-${Date.now()}` }] }
                : r
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

export function useBatchAddResults() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ raceId, results }: { raceId: string; results: RaceResultFormData[] }) =>
      batchAddResults(accessToken!, raceId, results),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ raceId, results }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Add multiple results to race in all caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        const tempResults = results.map((r, i) => ({ ...r, id: `temp-${Date.now()}-${i}` }));
        return {
          ...old,
          events: old.events.map((e: any) => ({
            ...e,
            races: e.races?.map((r: any) =>
              r.id === raceId ? { ...r, results: [...(r.results || []), ...tempResults] } : r
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

export function useUpdateResult() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      updates,
    }: {
      resultId: string;
      updates: Partial<RaceResultFormData>;
    }) => updateResult(accessToken!, resultId, updates),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ resultId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.regattas.all });

      // Update result in all caches
      queryClient.setQueriesData({ queryKey: queryKeys.regattas.all }, (old: any) => {
        if (!old?.events) return old;
        return {
          ...old,
          events: old.events.map((e: any) => ({
            ...e,
            races: e.races?.map((r: any) => ({
              ...r,
              results: r.results?.map((res: any) =>
                res.id === resultId ? { ...res, ...updates } : res
              ),
            })),
          })),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}
