import { create } from 'zustand';

/**
 * STUB - V1 lineupStore deleted in Phase 36.1-02
 *
 * V1 lineupStore and its tests were deleted because the store had zero production imports.
 * However, 7 V2 files still import this (AthleteBank, BoatView, LineupWorkspace, etc.).
 *
 * This stub provides minimal state to prevent build errors.
 * V2 components should migrate away from this stub.
 *
 * TODO(phase-37): Migrate V2 lineup components to use only V2 stores/hooks:
 * - Server state: useLineupDraft hook
 * - UI state: useLineupBuilderStore
 * - Delete this stub file
 */

const useLineupStore = create((set, get) => ({
  // Minimal state for V2 components that still import this
  athletes: [],
  boatConfigs: [],
  shells: [],
  activeBoats: [],
  ergData: [],
  lineupName: '',
  selectedAthlete: null,
  selectedSeats: [],
  headshotMap: new Map(),

  // Stub methods - all no-ops
  setAthletes: (athletes) => set({ athletes }),
  setBoatConfigs: (boatConfigs) => set({ boatConfigs }),
  setShells: (shells) => set({ shells }),
  setActiveBoats: (activeBoats) => set({ activeBoats }),
  setErgData: (ergData) => set({ ergData }),
  setLineupName: (lineupName) => set({ lineupName }),
  assignAthlete: () => {},
  removeAthlete: () => {},
  swapSeats: () => {},
  addBoat: () => {},
  removeBoat: () => {},
  reset: () => {
    set({
      athletes: [],
      boatConfigs: [],
      shells: [],
      activeBoats: [],
      ergData: [],
      lineupName: '',
      selectedAthlete: null,
      selectedSeats: [],
      headshotMap: new Map(),
    });
  },
}));

export default useLineupStore;
