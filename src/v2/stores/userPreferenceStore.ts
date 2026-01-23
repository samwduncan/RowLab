import { create } from 'zustand';

interface PreferenceState {
  useLegacyMode: boolean;
  setLegacyMode: (useLegacy: boolean) => void;
  clearPreference: () => void;
}

const STORAGE_KEY = 'rowlab_use_legacy';

export const useUserPreferenceStore = create<PreferenceState>((set) => ({
  // Initialize from localStorage, default to false (V2 mode)
  useLegacyMode: typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY) === 'true'
    : false,

  setLegacyMode: (useLegacy: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(useLegacy));
    }
    set({ useLegacyMode: useLegacy });
  },

  clearPreference: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ useLegacyMode: false });
  },
}));
