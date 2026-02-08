import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../contexts/AuthContext';
import type { Regatta, RegattaFormData } from '../types/regatta';

const API_URL = import.meta.env.VITE_API_URL || '';

// Query keys

// Fetch regattas list
async function fetchRegattas(
  token: string,
  options?: { season?: string; limit?: number; offset?: number }
): Promise<Regatta[]> {
  const params = new URLSearchParams();
  if (options?.season) params.append('season', options.season);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const url = `${API_URL}/api/v1/regattas${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch regattas');
  const data = await res.json();
  return data.data.regattas;
}

// Fetch single regatta with events and races
async function fetchRegatta(token: string, id: string): Promise<Regatta> {
  const res = await fetch(`${API_URL}/api/v1/regattas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Regatta not found');
    throw new Error('Failed to fetch regatta');
  }
  const data = await res.json();
  return data.data.regatta;
}

// Create regatta
async function createRegatta(token: string, regatta: RegattaFormData): Promise<Regatta> {
  const res = await fetch(`${API_URL}/api/v1/regattas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(regatta),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create regatta');
  }
  const data = await res.json();
  return data.data.regatta;
}

// Update regatta
async function updateRegatta(
  token: string,
  id: string,
  updates: Partial<RegattaFormData>
): Promise<Regatta> {
  const res = await fetch(`${API_URL}/api/v1/regattas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update regatta');
  }
  const data = await res.json();
  return data.data.regatta;
}

// Delete regatta
async function deleteRegatta(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/regattas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete regatta');
}

// ============================================
// Hooks
// ============================================

/**
 * Fetch list of regattas
 */
export function useRegattas(options?: { season?: string; limit?: number }) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.regattas.list(options || {}),
    queryFn: () => fetchRegattas(accessToken!, options),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single regatta with full hierarchy
 */
export function useRegatta(id: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.regattas.detail(id!),
    queryFn: () => fetchRegatta(accessToken!, id!),
    enabled: !!accessToken && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new regatta
 */
export function useCreateRegatta() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regatta: RegattaFormData) => createRegatta(accessToken!, regatta),
    networkMode: 'offlineFirst', // Queue while offline (RT-04)
    retry: 3,
    onMutate: async (newRegatta) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.lists() });

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.regattas.lists());

      // Optimistically update cache with temp ID
      queryClient.setQueryData(queryKeys.regattas.lists(), (old: Regatta[] | undefined) => {
        const tempRegatta: Regatta = {
          ...newRegatta,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          events: [],
        } as Regatta;
        return old ? [...old, tempRegatta] : [tempRegatta];
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.regattas.lists(), context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

/**
 * Update an existing regatta
 */
export function useUpdateRegatta() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RegattaFormData> }) =>
      updateRegatta(accessToken!, id, updates),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.detail(id) });

      // Snapshot previous values
      const previousList = queryClient.getQueryData(queryKeys.regattas.lists());
      const previousDetail = queryClient.getQueryData(queryKeys.regattas.detail(id));

      // Optimistically update list cache
      queryClient.setQueryData(queryKeys.regattas.lists(), (old: Regatta[] | undefined) => {
        if (!old) return old;
        return old.map((r) => (r.id === id ? { ...r, ...updates } : r));
      });

      // Optimistically update detail cache
      queryClient.setQueryData(queryKeys.regattas.detail(id), (old: Regatta | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return { previousList, previousDetail, id };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        if (context.previousList) {
          queryClient.setQueryData(queryKeys.regattas.lists(), context.previousList);
        }
        if (context.previousDetail) {
          queryClient.setQueryData(queryKeys.regattas.detail(context.id), context.previousDetail);
        }
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
    },
  });
}

/**
 * Delete a regatta
 */
export function useDeleteRegatta() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRegatta(accessToken!, id),
    networkMode: 'offlineFirst',
    retry: 3,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.regattas.lists() });

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.regattas.lists());

      // Optimistically remove from cache
      queryClient.setQueryData(queryKeys.regattas.lists(), (old: Regatta[] | undefined) => {
        if (!old) return old;
        return old.filter((r) => r.id !== id);
      });

      return { previous, id };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.regattas.lists(), context.previous);
      }
    },
    onSettled: (_, __, id) => {
      // Always refetch and remove detail cache
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.all });
      queryClient.removeQueries({ queryKey: queryKeys.regattas.detail(id) });
    },
  });
}

/**
 * Duplicate a regatta (copy metadata, clear results)
 */
export function useDuplicateRegatta() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceId, newName }: { sourceId: string; newName: string }) => {
      // Fetch source regatta
      const source = await fetchRegatta(accessToken!, sourceId);

      // Create new regatta with copied metadata
      const newRegatta: RegattaFormData = {
        name: newName,
        location: source.location,
        date: new Date().toISOString(), // Default to today
        endDate: null,
        host: source.host,
        venueType: source.venueType,
        courseType: source.courseType,
        conditions: null, // Clear conditions
        description: source.description,
        externalUrl: null,
        teamGoals: null,
      };

      return createRegatta(accessToken!, newRegatta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regattas.lists() });
    },
  });
}
