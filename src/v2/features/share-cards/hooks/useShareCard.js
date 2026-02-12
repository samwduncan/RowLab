/**
 * Share Card Hooks - TanStack Query mutations for share card generation
 * Phase 38-04
 *
 * Provides:
 * - useGenerateShareCard: TQ mutation for card generation
 * - useShareCard: TQ query for fetching existing card
 * - useShareCardFlow: Convenience hook managing full share experience state
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

/**
 * Generate a share card via POST /api/v1/share-cards/generate
 *
 * Returns: { shareId, url, publicUrl }
 */
export function useGenerateShareCard() {
  return useMutation({
    mutationFn: async ({ workoutId, cardType, format, options }) => {
      const { data } = await api.post('/api/v1/share-cards/generate', {
        workoutId,
        cardType,
        format,
        options,
      });
      return data.data; // { shareId, url, publicUrl }
    },
  });
}

/**
 * Fetch an existing share card by ID
 *
 * Used for public share pages (no auth required)
 */
export function useShareCard(shareId) {
  return useQuery({
    queryKey: ['shareCard', shareId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/share-cards/${shareId}`);
      return data.data;
    },
    enabled: !!shareId,
    retry: false, // Don't retry on 404/410
  });
}

/**
 * Convenience hook for the full share card flow
 *
 * Manages:
 * - Option state (showName, brandingType, teamId, qrCode, printUrl, format)
 * - Card generation via mutation
 * - Automatic regeneration when options change
 *
 * Usage:
 * const { card, setOption, setFormat, generate, isGenerating, error } = useShareCardFlow(workoutId, 'erg_summary');
 */
export function useShareCardFlow(workoutId, cardType) {
  const [options, setOptions] = useState({
    showName: true,
    brandingType: 'personal', // 'personal' | 'team'
    teamId: null,
    qrCode: false,
    printUrl: false,
    format: '1:1', // '1:1' | '9:16'
  });

  const [card, setCard] = useState(null); // { shareId, url, publicUrl }

  const generateMutation = useGenerateShareCard();

  /**
   * Generate card with current options
   */
  const generate = useCallback(() => {
    if (!workoutId || !cardType) {
      console.warn('useShareCardFlow: workoutId and cardType required for generation');
      return;
    }

    generateMutation.mutate(
      {
        workoutId,
        cardType,
        format: options.format,
        options: {
          showName: options.showName,
          brandingType: options.brandingType,
          teamId: options.teamId,
          qrCode: options.qrCode,
          printUrl: options.printUrl,
        },
      },
      {
        onSuccess: (data) => {
          setCard(data);
        },
      }
    );
  }, [workoutId, cardType, options, generateMutation]);

  /**
   * Update a single option and trigger regeneration
   */
  const setOption = useCallback((key, value) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: value };

      // If switching to personal branding, clear teamId
      if (key === 'brandingType' && value === 'personal') {
        next.teamId = null;
      }

      return next;
    });
  }, []);

  /**
   * Update format (1:1 or 9:16) and trigger regeneration
   */
  const setFormat = useCallback((format) => {
    setOptions((prev) => ({ ...prev, format }));
  }, []);

  /**
   * Auto-generate when options change (debounced)
   */
  useEffect(() => {
    if (!card) {
      // Initial generation (don't auto-trigger on mount)
      return;
    }

    // Debounce regeneration to avoid hammering the API
    const timeout = setTimeout(() => {
      generate();
    }, 300);

    return () => clearTimeout(timeout);
  }, [options]); // Intentionally omit generate to avoid infinite loop

  // Initial generation on mount
  useEffect(() => {
    if (workoutId && cardType && !card && !generateMutation.isPending) {
      generate();
    }
  }, [workoutId, cardType]); // Only run once on mount

  return {
    card,
    options,
    setOption,
    setFormat,
    generate,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
  };
}
