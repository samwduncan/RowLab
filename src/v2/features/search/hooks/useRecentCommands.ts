import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentCommand {
  id: string;
  label: string;
  timestamp: number;
}

interface RecentCommandsStore {
  recentCommands: RecentCommand[];
  addCommand: (command: Omit<RecentCommand, 'timestamp'>) => void;
  clearCommands: () => void;
}

const MAX_RECENT_COMMANDS = 5;

/**
 * Zustand store for recent command palette actions
 * Persists to localStorage with max 5 recent items
 */
export const useRecentCommands = create<RecentCommandsStore>()(
  persist(
    (set) => ({
      recentCommands: [],

      addCommand: (command) =>
        set((state) => {
          // Remove existing entry if present
          const filtered = state.recentCommands.filter((c) => c.id !== command.id);

          // Add to front with current timestamp
          const newCommand: RecentCommand = {
            ...command,
            timestamp: Date.now(),
          };

          // Keep only MAX_RECENT_COMMANDS items
          const updated = [newCommand, ...filtered].slice(0, MAX_RECENT_COMMANDS);

          return { recentCommands: updated };
        }),

      clearCommands: () => set({ recentCommands: [] }),
    }),
    {
      name: 'rowlab-recent-commands',
    }
  )
);
