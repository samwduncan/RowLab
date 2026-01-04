/**
 * LineupStore Tests
 *
 * Tests for the core lineup store functionality including:
 * - Adding/removing boats
 * - Assigning athletes to seats
 * - Swapping athletes between seats
 * - Undo/redo functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useLineupStore from './lineupStore';

// Mock boat config
const mockBoatConfig = {
  id: 1,
  name: 'Varsity 8+',
  numSeats: 8,
  hasCoxswain: true,
};

// Mock athletes
const mockAthletes = [
  { id: 1, lastName: 'Smith', firstName: 'John', country: 'USA', side: 'P' as const },
  { id: 2, lastName: 'Johnson', firstName: 'Mike', country: 'USA', side: 'S' as const },
  { id: 3, lastName: 'Williams', firstName: 'Bob', country: 'CAN', side: 'B' as const },
];

describe('LineupStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useLineupStore.getState();
    store.clearLineup();
    store.clearHistory?.();
    store.setAthletes(mockAthletes);
    store.setBoatConfigs([mockBoatConfig]);
  });

  describe('Boat Management', () => {
    it('should add a boat to activeBoats', () => {
      const store = useLineupStore.getState();
      expect(store.activeBoats).toHaveLength(0);

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const updatedStore = useLineupStore.getState();
      expect(updatedStore.activeBoats).toHaveLength(1);
      expect(updatedStore.activeBoats[0].name).toBe('Varsity 8+');
      expect(updatedStore.activeBoats[0].seats).toHaveLength(8);
    });

    it('should remove a boat from activeBoats', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;

      act(() => {
        useLineupStore.getState().removeBoat(boatId);
      });

      expect(useLineupStore.getState().activeBoats).toHaveLength(0);
    });
  });

  describe('Athlete Assignment', () => {
    it('should assign an athlete to a seat', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;
      const athlete = mockAthletes[0];

      act(() => {
        useLineupStore.getState().assignToSeat(boatId, 1, athlete);
      });

      const updatedStore = useLineupStore.getState();
      const seat = updatedStore.activeBoats[0].seats.find((s) => s.seatNumber === 1);
      expect(seat?.athlete).toEqual(athlete);
    });

    it('should remove an athlete from a seat', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;

      act(() => {
        useLineupStore.getState().assignToSeat(boatId, 1, mockAthletes[0]);
        useLineupStore.getState().removeFromSeat(boatId, 1);
      });

      const updatedStore = useLineupStore.getState();
      const seat = updatedStore.activeBoats[0].seats.find((s) => s.seatNumber === 1);
      expect(seat?.athlete).toBeNull();
    });

    it('should get available athletes correctly', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;

      act(() => {
        useLineupStore.getState().assignToSeat(boatId, 1, mockAthletes[0]);
      });

      const available = useLineupStore.getState().getAvailableAthletes();
      expect(available).toHaveLength(2);
      expect(available.find((a) => a.id === 1)).toBeUndefined();
    });
  });

  describe('Athlete Swapping', () => {
    it('should swap athletes between two seats', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;

      act(() => {
        const s = useLineupStore.getState();
        s.assignToSeat(boatId, 1, mockAthletes[0]);
        s.assignToSeat(boatId, 2, mockAthletes[1]);
        s.toggleSeatSelection(boatId, 1);
        s.toggleSeatSelection(boatId, 2);
        s.swapAthletes();
      });

      const updatedStore = useLineupStore.getState();
      const boat = updatedStore.activeBoats[0];
      const seat1 = boat.seats.find((s) => s.seatNumber === 1);
      const seat2 = boat.seats.find((s) => s.seatNumber === 2);

      expect(seat1?.athlete?.id).toBe(2);
      expect(seat2?.athlete?.id).toBe(1);
    });
  });

  describe('Undo/Redo', () => {
    it('should undo the last change', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      expect(useLineupStore.getState().activeBoats).toHaveLength(1);

      act(() => {
        useLineupStore.getState().undo();
      });

      expect(useLineupStore.getState().activeBoats).toHaveLength(0);
    });

    it('should redo an undone change', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      act(() => {
        useLineupStore.getState().undo();
      });

      expect(useLineupStore.getState().activeBoats).toHaveLength(0);

      act(() => {
        useLineupStore.getState().redo();
      });

      expect(useLineupStore.getState().activeBoats).toHaveLength(1);
    });

    it('should track canUndo and canRedo correctly', () => {
      const store = useLineupStore.getState();

      expect(store._history.canUndo).toBe(false);
      expect(store._history.canRedo).toBe(false);

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      expect(useLineupStore.getState()._history.canUndo).toBe(true);
      expect(useLineupStore.getState()._history.canRedo).toBe(false);

      act(() => {
        useLineupStore.getState().undo();
      });

      expect(useLineupStore.getState()._history.canUndo).toBe(false);
      expect(useLineupStore.getState()._history.canRedo).toBe(true);
    });

    it('should clear redo stack on new change', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
        useLineupStore.getState().undo();
      });

      expect(useLineupStore.getState()._history.canRedo).toBe(true);

      act(() => {
        useLineupStore.getState().addBoat(mockBoatConfig);
      });

      expect(useLineupStore.getState()._history.canRedo).toBe(false);
    });
  });

  describe('Export/Import', () => {
    it('should export lineup correctly', () => {
      const store = useLineupStore.getState();

      act(() => {
        store.addBoat(mockBoatConfig);
      });

      const boatId = useLineupStore.getState().activeBoats[0].id;

      act(() => {
        useLineupStore.getState().assignToSeat(boatId, 1, mockAthletes[0]);
      });

      const exported = useLineupStore.getState().exportLineup();

      expect(exported.boats).toHaveLength(1);
      expect(exported.boats[0].name).toBe('Varsity 8+');
      expect(exported.timestamp).toBeDefined();
    });
  });
});
