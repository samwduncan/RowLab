import { describe, it, expect } from 'vitest';
import {
  generateSwapSchedule,
  calculateScheduleQuality,
  validateSchedule,
  BOAT_SIZES
} from '../matrixPlannerService.js';

describe('matrixPlannerService', () => {
  describe('generateSwapSchedule', () => {
    it('generates schedule for 4 athletes in pairs (2-)', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd'],
        boatClass: '2-'
      });

      expect(result.boatCount).toBe(2);
      expect(result.pieces.length).toBeGreaterThan(0);
      expect(result.statistics.coverage).toBeGreaterThan(0);
    });

    it('generates schedule for 8 athletes in quads (4-)', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        boatClass: '4-'
      });

      expect(result.boatCount).toBe(2);
      expect(result.pieces.length).toBeGreaterThanOrEqual(3);
    });

    it('achieves high coverage with enough pieces', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd', 'e', 'f'],
        boatClass: '2-',
        pieceCount: 5
      });

      expect(result.statistics.coverage).toBeGreaterThan(0.8);
    });

    it('throws error for insufficient athletes', () => {
      expect(() => generateSwapSchedule({
        athleteIds: ['a'],
        boatClass: '2-'
      })).toThrow();
    });

    it('throws error for unknown boat class', () => {
      expect(() => generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd'],
        boatClass: 'unknown'
      })).toThrow('Unknown boat class');
    });

    it('respects specified piece count', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd'],
        boatClass: '2-',
        pieceCount: 5
      });

      expect(result.pieceCount).toBe(5);
      expect(result.pieces.length).toBe(5);
    });

    it('assigns all athletes in each piece (no duplicates)', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd'],
        boatClass: '2-',
        pieceCount: 3
      });

      for (const piece of result.pieces) {
        const allAthletes = piece.boats.flatMap(b => b.athleteIds);
        const unique = new Set(allAthletes);
        expect(unique.size).toBe(allAthletes.length);
      }
    });

    it('generates swap descriptions', () => {
      const result = generateSwapSchedule({
        athleteIds: ['a', 'b', 'c', 'd'],
        boatClass: '2-',
        pieceCount: 3
      });

      expect(result.pieces[0].swapDescription).toBe('Initial lineup');
      // Subsequent pieces should have descriptions
    });
  });

  describe('calculateScheduleQuality', () => {
    it('calculates coverage correctly', () => {
      const comparisonCount = new Map([
        ['a-b', 1],
        ['a-c', 1],
        ['b-c', 1]
      ]);
      const athleteIds = ['a', 'b', 'c'];
      const pieces = [];

      const stats = calculateScheduleQuality(comparisonCount, athleteIds, pieces);

      expect(stats.comparisonsCovered).toBe(3);
      expect(stats.totalPossibleComparisons).toBe(3);
      expect(stats.coverage).toBe(1.0);
    });

    it('calculates partial coverage', () => {
      const comparisonCount = new Map([
        ['a-b', 1],
        ['a-c', 1]
        // Missing b-c
      ]);
      const athleteIds = ['a', 'b', 'c'];
      const pieces = [];

      const stats = calculateScheduleQuality(comparisonCount, athleteIds, pieces);

      expect(stats.coverage).toBeCloseTo(2/3, 2);
    });

    it('calculates balance for even comparisons', () => {
      const comparisonCount = new Map([
        ['a-b', 2],
        ['a-c', 2],
        ['b-c', 2]
      ]);
      const athleteIds = ['a', 'b', 'c'];
      const pieces = [];

      const stats = calculateScheduleQuality(comparisonCount, athleteIds, pieces);

      expect(stats.balance).toBeGreaterThan(0.9);
      expect(stats.varianceInComparisons).toBeLessThan(0.1);
    });
  });

  describe('validateSchedule', () => {
    it('validates correct schedule', () => {
      const schedule = {
        athletes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        pieces: [{
          pieceNumber: 1,
          boats: [
            { boatName: 'A', athleteIds: ['a', 'b'] },
            { boatName: 'B', athleteIds: ['c', 'd'] }
          ]
        }]
      };

      const result = validateSchedule(schedule);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('detects duplicate assignments', () => {
      const schedule = {
        athletes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        pieces: [{
          pieceNumber: 1,
          boats: [
            { boatName: 'A', athleteIds: ['a', 'b'] },
            { boatName: 'B', athleteIds: ['b', 'c'] } // 'b' is duplicated
          ]
        }]
      };

      const result = validateSchedule(schedule);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('BOAT_SIZES', () => {
    it('has correct sizes for standard boats', () => {
      expect(BOAT_SIZES['8+']).toBe(9);
      expect(BOAT_SIZES['4+']).toBe(5);
      expect(BOAT_SIZES['4-']).toBe(4);
      expect(BOAT_SIZES['2-']).toBe(2);
      expect(BOAT_SIZES['1x']).toBe(1);
    });
  });
});
