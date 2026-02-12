/**
 * Tests for Workout Inference Service
 */

import { describe, it, expect } from 'vitest';
import {
  inferWorkoutPattern,
  detectRatePyramid,
  detectRateLadder,
  detectPacingPattern,
  detectJustRowIntervals,
  detectWarmupCooldown,
  linearRegression,
  coefficientOfVariation,
  mean,
  median,
} from '../workoutInferenceService.js';

// ============================================
// STATISTICAL HELPERS TESTS
// ============================================

describe('Statistical Helpers', () => {
  it('linearRegression - perfect positive correlation', () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [0, 2, 4, 6, 8]; // y = 2x
    const result = linearRegression(xs, ys);

    expect(result.slope).toBeCloseTo(2, 1);
    expect(result.r_squared).toBeCloseTo(1.0, 2);
  });

  it('linearRegression - perfect negative correlation', () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [100, 90, 80, 70, 60]; // y = -10x + 100
    const result = linearRegression(xs, ys);

    expect(result.slope).toBeCloseTo(-10, 1);
    expect(result.r_squared).toBeCloseTo(1.0, 2);
  });

  it('linearRegression - no correlation', () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [5, 5, 5, 5, 5]; // flat line
    const result = linearRegression(xs, ys);

    expect(result.slope).toBeCloseTo(0, 1);
  });

  it('coefficientOfVariation - low variation', () => {
    const values = [100, 101, 100, 99, 100]; // ~1% CV
    const cv = coefficientOfVariation(values);

    expect(cv).toBeLessThan(0.02);
  });

  it('coefficientOfVariation - high variation', () => {
    const values = [50, 100, 150, 200]; // Large spread
    const cv = coefficientOfVariation(values);

    expect(cv).toBeGreaterThan(0.3);
  });

  it('mean - calculates average', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([10, 20, 30])).toBe(20);
  });

  it('median - odd count', () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
  });

  it('median - even count', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

// ============================================
// RATE PYRAMID TESTS
// ============================================

describe('detectRatePyramid', () => {
  it('detects classic 7-split pyramid with high confidence', () => {
    const splits = [
      { strokeRate: 20 },
      { strokeRate: 22 },
      { strokeRate: 24 },
      { strokeRate: 26 },
      { strokeRate: 24 },
      { strokeRate: 22 },
      { strokeRate: 20 },
    ];

    const result = detectRatePyramid(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('rate_pyramid');
    expect(result.confidence).toBe('high');
    expect(result.details.peak).toBe(26);
    expect(result.details.base).toBe(20);
  });

  it('detects asymmetric pyramid with medium confidence', () => {
    const splits = [
      { strokeRate: 18 },
      { strokeRate: 20 },
      { strokeRate: 24 },
      { strokeRate: 22 },
      { strokeRate: 22 },
    ];

    const result = detectRatePyramid(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('rate_pyramid');
    expect(result.confidence).toBe('medium'); // Not symmetric (18 vs 22 > 2 SPM tolerance)
  });

  it('returns null for non-pyramid (random rates)', () => {
    const splits = [
      { strokeRate: 20 },
      { strokeRate: 24 },
      { strokeRate: 18 },
      { strokeRate: 26 },
      { strokeRate: 22 },
    ];

    const result = detectRatePyramid(splits);
    expect(result).toBeNull();
  });

  it('returns null for too few splits', () => {
    const splits = [{ strokeRate: 20 }, { strokeRate: 22 }, { strokeRate: 20 }];

    const result = detectRatePyramid(splits);
    expect(result).toBeNull();
  });

  it('returns null when peak is at start or end', () => {
    const splits = [
      { strokeRate: 26 },
      { strokeRate: 24 },
      { strokeRate: 22 },
      { strokeRate: 20 },
      { strokeRate: 18 },
    ];

    const result = detectRatePyramid(splits);
    expect(result).toBeNull();
  });
});

// ============================================
// RATE LADDER TESTS
// ============================================

describe('detectRateLadder', () => {
  it('detects 5-split ascending ladder with high confidence', () => {
    const splits = [
      { strokeRate: 20 },
      { strokeRate: 22 },
      { strokeRate: 24 },
      { strokeRate: 26 },
      { strokeRate: 28 },
    ];

    const result = detectRateLadder(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('rate_ladder_up');
    expect(result.confidence).toBe('high'); // Consistent 2 SPM steps
    expect(result.details.startRate).toBe(20);
    expect(result.details.endRate).toBe(28);
  });

  it('detects descending ladder', () => {
    const splits = [{ strokeRate: 28 }, { strokeRate: 26 }, { strokeRate: 24 }, { strokeRate: 22 }];

    const result = detectRateLadder(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('rate_ladder_down');
  });

  it('detects ladder with inconsistent steps (medium confidence)', () => {
    const splits = [{ strokeRate: 20 }, { strokeRate: 21 }, { strokeRate: 24 }, { strokeRate: 25 }];

    const result = detectRateLadder(splits);

    expect(result).not.toBeNull();
    expect(result.confidence).toBe('medium'); // Inconsistent deltas
  });

  it('returns null for non-monotonic progression', () => {
    const splits = [{ strokeRate: 20 }, { strokeRate: 24 }, { strokeRate: 22 }, { strokeRate: 26 }];

    const result = detectRateLadder(splits);
    expect(result).toBeNull();
  });

  it('returns null for too few splits', () => {
    const splits = [{ strokeRate: 20 }, { strokeRate: 22 }];

    const result = detectRateLadder(splits);
    expect(result).toBeNull();
  });
});

// ============================================
// PACING PATTERN TESTS
// ============================================

describe('detectPacingPattern', () => {
  it('detects perfect negative split (each split faster)', () => {
    const splits = [
      { pace: 1300 }, // Slower
      { pace: 1250 },
      { pace: 1200 },
      { pace: 1150 }, // Faster
    ];

    const result = detectPacingPattern(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('negative_split');
    expect(result.confidence).toBe('high'); // R^2 should be very high
  });

  it('detects moderate negative split with medium confidence', () => {
    const splits = [{ pace: 1300 }, { pace: 1280 }, { pace: 1240 }, { pace: 1220 }, { pace: 1180 }];

    const result = detectPacingPattern(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('negative_split');
    expect(Number(result.details.r_squared)).toBeGreaterThan(0.6);
  });

  it('detects positive split (getting slower)', () => {
    const splits = [
      { pace: 1150 }, // Faster
      { pace: 1200 },
      { pace: 1250 },
      { pace: 1300 }, // Slower
    ];

    const result = detectPacingPattern(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('positive_split');
  });

  it('detects even splits (all within 1%)', () => {
    const splits = [{ pace: 1200 }, { pace: 1201 }, { pace: 1199 }, { pace: 1200 }];

    const result = detectPacingPattern(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('even_split');
    expect(result.confidence).toBe('high');
  });

  it('returns null for random pacing (no trend)', () => {
    const splits = [{ pace: 1200 }, { pace: 1300 }, { pace: 1100 }, { pace: 1250 }];

    const result = detectPacingPattern(splits);
    expect(result).toBeNull();
  });

  it('returns null for too few splits', () => {
    const splits = [{ pace: 1200 }, { pace: 1250 }];

    const result = detectPacingPattern(splits);
    expect(result).toBeNull();
  });
});

// ============================================
// JUSTROW INTERVALS TESTS
// ============================================

describe('detectJustRowIntervals', () => {
  it("infers 4x20' from 80-min JustRow with visible gaps", () => {
    const workout = { type: 'JustRow' };
    const splits = [
      // Interval 1 (20 min)
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      // Gap
      { timeSeconds: 60, strokeRate: 5, watts: 20 },
      // Interval 2
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      // Gap
      { timeSeconds: 60, strokeRate: 5, watts: 20 },
      // Interval 3
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      // Gap
      { timeSeconds: 60, strokeRate: 5, watts: 20 },
      // Interval 4
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
    ];

    const result = detectJustRowIntervals(splits, workout);

    expect(result).not.toBeNull();
    expect(result.type).toBe('justrow_intervals');
    expect(result.details.intervalCount).toBe(4);
    expect(result.details.gaps).toBe(3);
    expect(result.inferredTitle).toMatch(/4x20'/);
  });

  it('returns null for JustRow with no gaps (pure steady state)', () => {
    const workout = { type: 'JustRow' };
    const splits = [
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
    ];

    const result = detectJustRowIntervals(splits, workout);
    expect(result).toBeNull();
  });

  it('returns null for short JustRow (10 min, no gaps)', () => {
    const workout = { type: 'JustRow' };
    const splits = [
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
    ];

    const result = detectJustRowIntervals(splits, workout);
    expect(result).toBeNull();
  });

  it('returns null for too few splits', () => {
    const workout = { type: 'JustRow' };
    const splits = [
      { timeSeconds: 300, strokeRate: 20, watts: 200 },
      { timeSeconds: 60, strokeRate: 5, watts: 20 },
    ];

    const result = detectJustRowIntervals(splits, workout);
    expect(result).toBeNull();
  });
});

// ============================================
// WARMUP/COOLDOWN TESTS
// ============================================

describe('detectWarmupCooldown', () => {
  it('detects warmup (first split 20% slower)', () => {
    const splits = [
      { pace: 1500, strokeRate: 16 }, // Warmup
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
    ];

    const result = detectWarmupCooldown(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('warmup');
    expect(result.details.hasWarmup).toBe(true);
    expect(result.details.hasCooldown).toBe(false);
  });

  it('detects cooldown (last split significantly slower)', () => {
    const splits = [
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1500, strokeRate: 16 }, // Cooldown
    ];

    const result = detectWarmupCooldown(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('cooldown');
    expect(result.details.hasCooldown).toBe(true);
    expect(result.details.hasWarmup).toBe(false);
  });

  it('detects both warmup and cooldown', () => {
    const splits = [
      { pace: 1500, strokeRate: 16 }, // Warmup
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1500, strokeRate: 16 }, // Cooldown
    ];

    const result = detectWarmupCooldown(splits);

    expect(result).not.toBeNull();
    expect(result.type).toBe('warmup_and_cooldown');
    expect(result.details.hasWarmup).toBe(true);
    expect(result.details.hasCooldown).toBe(true);
  });

  it('returns null when all splits are similar', () => {
    const splits = [
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
      { pace: 1200, strokeRate: 20 },
    ];

    const result = detectWarmupCooldown(splits);
    expect(result).toBeNull();
  });

  it('returns null for too few splits', () => {
    const splits = [
      { pace: 1200, strokeRate: 20 },
      { pace: 1500, strokeRate: 16 },
    ];

    const result = detectWarmupCooldown(splits);
    expect(result).toBeNull();
  });
});

// ============================================
// MAIN INFERENCE ENGINE TESTS
// ============================================

describe('inferWorkoutPattern', () => {
  it('returns null for empty splits array', () => {
    const workout = { type: 'FixedTimeInterval' };
    const result = inferWorkoutPattern(workout, []);

    expect(result).toBeNull();
  });

  it('returns null for single split', () => {
    const workout = { type: 'FixedTimeInterval' };
    const splits = [{ strokeRate: 20, pace: 1200 }];

    const result = inferWorkoutPattern(workout, splits);
    expect(result).toBeNull();
  });

  it('detects multiple patterns in one workout', () => {
    const workout = { type: 'FixedTimeInterval' };
    const splits = [
      { strokeRate: 20, pace: 1300 }, // Warmup
      { strokeRate: 22, pace: 1200 },
      { strokeRate: 24, pace: 1180 }, // Rate ladder + negative split
      { strokeRate: 26, pace: 1160 },
      { strokeRate: 28, pace: 1150 },
    ];

    const result = inferWorkoutPattern(workout, splits);

    expect(result).not.toBeNull();
    expect(result.patterns.length).toBeGreaterThan(1);
    expect(result.analyzedAt).toBeDefined();

    // Should detect both ladder and pacing
    const types = result.patterns.map((p) => p.type);
    expect(types).toContain('rate_ladder_up');
    expect(types).toContain('negative_split');
  });

  it('runs JustRow interval detection only for JustRow workouts', () => {
    const workout = { type: 'JustRow' };
    const splits = [
      { timeSeconds: 600, strokeRate: 20, watts: 200, pace: 1200 },
      { timeSeconds: 60, strokeRate: 5, watts: 20, pace: 2000 }, // Gap
      { timeSeconds: 600, strokeRate: 20, watts: 200, pace: 1200 },
      { timeSeconds: 60, strokeRate: 5, watts: 20, pace: 2000 }, // Gap
      { timeSeconds: 600, strokeRate: 20, watts: 200, pace: 1200 },
    ];

    const result = inferWorkoutPattern(workout, splits);

    expect(result).not.toBeNull();
    expect(result.inferredTitle).toBeDefined();
    expect(result.inferredIntervals).toBeDefined();
  });

  it('skips JustRow detection for typed workouts', () => {
    const workout = { type: 'FixedTimeInterval' };
    const splits = [
      { timeSeconds: 600, strokeRate: 20, watts: 200, pace: 1200 },
      { timeSeconds: 60, strokeRate: 5, watts: 20, pace: 2000 }, // Gap
      { timeSeconds: 600, strokeRate: 20, watts: 200, pace: 1200 },
    ];

    const result = inferWorkoutPattern(workout, splits);

    // Should not have inferredTitle (that's JustRow-specific)
    if (result) {
      expect(result.inferredTitle).toBeUndefined();
    }
  });

  it('handles all-zero strokeRate gracefully', () => {
    const workout = { type: 'JustRow' };
    const splits = [
      { strokeRate: 0, watts: 0, pace: 0 },
      { strokeRate: 0, watts: 0, pace: 0 },
    ];

    const result = inferWorkoutPattern(workout, splits);
    expect(result).toBeNull();
  });
});
