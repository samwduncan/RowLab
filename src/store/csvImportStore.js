import { create } from 'zustand';
import useAuthStore from './authStore';

export const useCSVImportStore = create((set, get) => ({
  // State
  file: null,
  headers: [],
  mapping: {},
  preview: null,
  importing: false,
  error: null,
  result: null,

  // Actions
  setFile: (file) => set({ file, preview: null, result: null, error: null }),

  // Detect column mapping
  detectMapping: async (file) => {
    set({ importing: true, error: null });
    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch('/api/v1/import/csv/detect-mapping', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        set({
          file,
          headers: data.data.headers,
          mapping: data.data.mapping,
          importing: false,
        });
        return data.data;
      } else {
        throw new Error(data.error?.message || 'Failed to detect mapping');
      }
    } catch (error) {
      set({ error: error.message, importing: false });
      throw error;
    }
  },

  // Update mapping
  updateMapping: (field, header) => set((state) => ({
    mapping: { ...state.mapping, [field]: header },
  })),

  // Preview import
  previewImport: async () => {
    const { file, mapping } = get();
    if (!file) throw new Error('No file selected');

    set({ importing: true, error: null });
    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));

      const response = await authenticatedFetch('/api/v1/import/csv/preview', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        set({ preview: data.data, importing: false });
        return data.data;
      } else {
        throw new Error(data.error?.message || 'Failed to preview import');
      }
    } catch (error) {
      set({ error: error.message, importing: false });
      throw error;
    }
  },

  // Execute import
  executeImport: async () => {
    const { preview } = get();
    if (!preview || preview.valid.length === 0) {
      throw new Error('No valid rows to import');
    }

    set({ importing: true, error: null });
    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const response = await authenticatedFetch('/api/v1/import/csv/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validRows: preview.valid }),
      });
      const data = await response.json();

      if (data.success) {
        set({ result: data.data, importing: false });
        return data.data;
      } else {
        throw new Error(data.error?.message || 'Failed to execute import');
      }
    } catch (error) {
      set({ error: error.message, importing: false });
      throw error;
    }
  },

  // Reset state
  reset: () => set({
    file: null,
    headers: [],
    mapping: {},
    preview: null,
    importing: false,
    error: null,
    result: null,
  }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useCSVImportStore;
