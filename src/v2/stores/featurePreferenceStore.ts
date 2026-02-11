/**
 * Feature Preference Store (stub)
 * All features are enabled by default until a proper feature toggle system is built.
 */

import { create } from 'zustand';
import type { FeatureId } from '@v2/types/feature-toggles';

interface FeaturePreferenceState {
  isFeatureEnabled: (featureId: FeatureId) => boolean;
}

export const useFeaturePreferenceStore = create<FeaturePreferenceState>()(() => ({
  isFeatureEnabled: () => true,
}));
