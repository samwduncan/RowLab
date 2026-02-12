/**
 * Workout Inference Service
 *
 * Detects training patterns from split data to enrich workout metadata.
 * Designed to run non-blocking after C2 sync completes.
 *
 * Pattern detection:
 * - Rate pyramids (ascending→descending strokeRate)
 * - Rate ladders (monotonic strokeRate progression)
 * - Pacing patterns (negative/positive/even splits)
 * - JustRow intervals (gap detection for unofficial intervals)
 * - Warmup/cooldown detection
 */

// ============================================
// STATISTICAL HELPERS
// ============================================

/**
 * Calculate linear regression for pace trend analysis
 * @param {number[]} xs - Independent variable (e.g., split indices)
 * @param {number[]} ys - Dependent variable (e.g., pace values)
 * @returns {{ slope: number, intercept: number, r_squared: number }}
 */
function linearRegression(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) {
    return null;
  }

  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = ys.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = ys.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = ys.reduce((sum, y, i) => {
    const predicted = slope * xs[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const r_squared = 1 - ssResidual / ssTotal;

  return { slope, intercept, r_squared };
}

/**
 * Calculate coefficient of variation (CV)
 * @param {number[]} values
 * @returns {number} CV as fraction (e.g., 0.05 for 5% variation)
 */
function coefficientOfVariation(values) {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return stdDev / mean;
}

/**
 * Calculate mean of array
 * @param {number[]} values
 * @returns {number}
 */
function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate median of array
 * @param {number[]} values
 * @returns {number}
 */
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// ============================================
// PATTERN DETECTORS
// ============================================

/**
 * Detect rate pyramid pattern (strokeRate ascends then descends, or vice versa)
 * @param {Array<{strokeRate: number}>} splits
 * @returns {{ type: string, confidence: string, details: object } | null}
 */
function detectRatePyramid(splits) {
  if (splits.length < 5) return null;

  const rates = splits.map((s) => s.strokeRate).filter((r) => r != null && r > 0);
  if (rates.length < 5) return null;

  // Find peak/valley index
  let peakIdx = 0;
  let peakValue = rates[0];

  for (let i = 1; i < rates.length; i++) {
    if (rates[i] > peakValue) {
      peakValue = rates[i];
      peakIdx = i;
    }
  }

  // Check if peak is in middle portion (not first or last)
  if (peakIdx === 0 || peakIdx === rates.length - 1) return null;

  // Check ascending phase
  const ascendingPhase = rates.slice(0, peakIdx + 1);
  const isAscending = ascendingPhase.every((rate, i) => i === 0 || rate >= ascendingPhase[i - 1]);

  // Check descending phase
  const descendingPhase = rates.slice(peakIdx);
  const isDescending = descendingPhase.every(
    (rate, i) => i === 0 || rate <= descendingPhase[i - 1]
  );

  if (!isAscending || !isDescending) return null;

  // Check symmetry for confidence level
  const baseRate = (rates[0] + rates[rates.length - 1]) / 2;
  const symmetryTolerance = 2; // SPM
  const isSymmetric = Math.abs(rates[0] - rates[rates.length - 1]) <= symmetryTolerance;

  return {
    type: 'rate_pyramid',
    confidence: isSymmetric ? 'high' : 'medium',
    details: {
      peak: peakValue,
      base: Math.round(baseRate),
      steps: peakIdx,
    },
  };
}

/**
 * Detect rate ladder pattern (monotonic strokeRate progression)
 * @param {Array<{strokeRate: number}>} splits
 * @returns {{ type: string, confidence: string, details: object } | null}
 */
function detectRateLadder(splits) {
  if (splits.length < 4) return null;

  const rates = splits.map((s) => s.strokeRate).filter((r) => r != null && r > 0);
  if (rates.length < 4) return null;

  // Check if monotonically increasing
  const isIncreasing = rates.every((rate, i) => i === 0 || rate >= rates[i - 1]);

  // Check if monotonically decreasing
  const isDecreasing = rates.every((rate, i) => i === 0 || rate <= rates[i - 1]);

  if (!isIncreasing && !isDecreasing) return null;

  // Calculate step consistency for confidence
  const deltas = [];
  for (let i = 1; i < rates.length; i++) {
    deltas.push(Math.abs(rates[i] - rates[i - 1]));
  }

  const avgDelta = mean(deltas);
  const deltaCV = coefficientOfVariation(deltas);

  // High confidence if steps are consistent (low CV)
  const confidence = deltaCV < 0.3 ? 'high' : 'medium';

  return {
    type: isIncreasing ? 'rate_ladder_up' : 'rate_ladder_down',
    confidence,
    details: {
      startRate: rates[0],
      endRate: rates[rates.length - 1],
      avgStep: Math.round(avgDelta),
      steps: rates.length - 1,
    },
  };
}

/**
 * Detect pacing patterns (negative/positive/even splits)
 * @param {Array<{pace: Decimal}>} splits
 * @returns {{ type: string, confidence: string, details: object } | null}
 */
function detectPacingPattern(splits) {
  const paces = splits
    .map((s) => s.pace)
    .filter((p) => p != null && Number(p) > 0)
    .map((p) => Number(p));
  if (paces.length < 3) return null;

  // Check for even splits first (CV < 2%)
  const cv = coefficientOfVariation(paces);
  if (cv < 0.02) {
    return {
      type: 'even_split',
      confidence: 'high',
      details: {
        avgPace: Math.round(mean(paces)),
        variation: (cv * 100).toFixed(2) + '%',
      },
    };
  }

  // Linear regression for trend detection
  const indices = paces.map((_, i) => i);
  const regression = linearRegression(indices, paces);

  if (!regression || Math.abs(regression.r_squared) < 0.6) {
    return null; // No clear trend
  }

  // Negative split: pace decreasing (getting faster, lower pace values)
  // Positive split: pace increasing (getting slower, higher pace values)
  const isNegativeSplit = regression.slope < 0;
  const confidence = regression.r_squared > 0.8 ? 'high' : 'medium';

  return {
    type: isNegativeSplit ? 'negative_split' : 'positive_split',
    confidence,
    details: {
      r_squared: regression.r_squared.toFixed(2),
      startPace: Math.round(paces[0]),
      endPace: Math.round(paces[paces.length - 1]),
      trend: isNegativeSplit ? 'faster' : 'slower',
    },
  };
}

/**
 * Detect JustRow intervals by finding gap splits (low strokeRate or watts)
 * @param {Array<{strokeRate: number, watts: number, timeSeconds: Decimal}>} splits
 * @param {object} workout - Workout metadata for context
 * @returns {{ type: string, confidence: string, details: object } | null}
 */
function detectJustRowIntervals(splits, workout) {
  if (splits.length < 4) return null;

  // Calculate average strokeRate and watts for non-gap threshold
  const avgStrokeRate = mean(splits.map((s) => s.strokeRate).filter((r) => r != null && r > 0));
  const avgWatts = mean(splits.map((s) => s.watts).filter((w) => w != null && w > 0));

  if (avgStrokeRate === 0 && avgWatts === 0) return null;

  // Identify gap splits (rest periods)
  const gapThresholdRate = Math.max(10, avgStrokeRate * 0.5);
  const gapThresholdWatts = avgWatts * 0.3;

  const splitTypes = splits.map((split) => {
    const isGap =
      (split.strokeRate != null && split.strokeRate < gapThresholdRate) ||
      (split.watts != null && split.watts < gapThresholdWatts);
    return {
      ...split,
      isGap,
    };
  });

  // Group into intervals
  const intervals = [];
  let currentInterval = null;

  for (const split of splitTypes) {
    if (!split.isGap) {
      if (!currentInterval) {
        currentInterval = {
          splits: [],
          totalTime: 0,
        };
      }
      currentInterval.splits.push(split);
      currentInterval.totalTime += Number(split.timeSeconds) || 0;
    } else {
      if (currentInterval && currentInterval.splits.length > 0) {
        intervals.push(currentInterval);
        currentInterval = null;
      }
    }
  }

  // Add final interval if exists
  if (currentInterval && currentInterval.splits.length > 0) {
    intervals.push(currentInterval);
  }

  // Need at least 2 intervals to infer structure
  if (intervals.length < 2) return null;

  // Calculate interval consistency for confidence
  const intervalTimes = intervals.map((i) => i.totalTime);
  const timeCV = coefficientOfVariation(intervalTimes);

  const confidence = timeCV < 0.1 ? 'high' : 'medium';

  // Build inferred title (e.g., "4x20'")
  const count = intervals.length;
  const avgTime = Math.round(mean(intervalTimes));
  const avgMinutes = Math.round(avgTime / 60);
  const inferredTitle = `${count}x${avgMinutes}' (inferred)`;

  return {
    type: 'justrow_intervals',
    confidence,
    details: {
      intervalCount: count,
      avgIntervalTime: avgTime,
      gaps: splitTypes.filter((s) => s.isGap).length,
    },
    inferredTitle,
    inferredIntervals: intervals.map((i) => ({
      splitCount: i.splits.length,
      totalTime: Math.round(i.totalTime),
    })),
  };
}

/**
 * Detect warmup/cooldown periods
 * @param {Array<{pace: Decimal, strokeRate: number}>} splits
 * @returns {{ type: string, confidence: string, details: object } | null}
 */
function detectWarmupCooldown(splits) {
  if (splits.length < 3) return null;

  const paces = splits
    .map((s) => s.pace)
    .filter((p) => p != null && Number(p) > 0)
    .map((p) => Number(p));
  const rates = splits.map((s) => s.strokeRate).filter((r) => r != null && r > 0);

  if (paces.length < 3 && rates.length < 3) return null;

  // Calculate middle section stats (exclude first and last)
  const middlePaces = paces.length >= 3 ? paces.slice(1, -1) : paces;
  const middleRates = rates.length >= 3 ? rates.slice(1, -1) : rates;

  const avgMiddlePace = mean(middlePaces);
  const avgMiddleRate = mean(middleRates);

  let hasWarmup = false;
  let hasCooldown = false;

  // Check first split for warmup (slower pace or lower rate)
  if (paces.length >= 3) {
    const firstPace = paces[0];
    if (firstPace > avgMiddlePace * 1.15) hasWarmup = true;
  }
  if (!hasWarmup && rates.length >= 3) {
    const firstRate = rates[0];
    if (firstRate < avgMiddleRate * 0.8) hasWarmup = true;
  }

  // Check last split for cooldown
  if (paces.length >= 3) {
    const lastPace = paces[paces.length - 1];
    if (lastPace > avgMiddlePace * 1.15) hasCooldown = true;
  }
  if (!hasCooldown && rates.length >= 3) {
    const lastRate = rates[rates.length - 1];
    if (lastRate < avgMiddleRate * 0.8) hasCooldown = true;
  }

  if (!hasWarmup && !hasCooldown) return null;

  return {
    type: hasWarmup && hasCooldown ? 'warmup_and_cooldown' : hasWarmup ? 'warmup' : 'cooldown',
    confidence: 'medium',
    details: {
      hasWarmup,
      hasCooldown,
    },
  };
}

// ============================================
// MAIN INFERENCE ENGINE
// ============================================

/**
 * Infer workout pattern from splits
 * @param {object} workout - Workout record with metadata
 * @param {Array} splits - WorkoutSplit records
 * @returns {{ patterns: Array, inferredTitle?: string, inferredIntervals?: Array, analyzedAt: string } | null}
 */
function inferWorkoutPattern(workout, splits) {
  if (!splits || splits.length === 0) return null;

  const patterns = [];

  // Run all applicable detectors
  const pyramid = detectRatePyramid(splits);
  if (pyramid) patterns.push(pyramid);

  const ladder = detectRateLadder(splits);
  if (ladder) patterns.push(ladder);

  const pacing = detectPacingPattern(splits);
  if (pacing) patterns.push(pacing);

  const warmupCooldown = detectWarmupCooldown(splits);
  if (warmupCooldown) patterns.push(warmupCooldown);

  // JustRow interval detection (only for JustRow workouts)
  let intervals = null;
  let inferredTitle = null;
  let inferredIntervals = null;

  if (workout.type === 'JustRow' || (workout.rawData && workout.rawData.workout_type === 0)) {
    intervals = detectJustRowIntervals(splits, workout);
    if (intervals) {
      patterns.push(intervals);
      if (intervals.confidence === 'high' || intervals.confidence === 'medium') {
        inferredTitle = intervals.inferredTitle;
        inferredIntervals = intervals.inferredIntervals;
      }
    }
  }

  // Return null if no patterns detected
  if (patterns.length === 0) return null;

  const result = {
    patterns,
    analyzedAt: new Date().toISOString(),
  };

  if (inferredTitle) result.inferredTitle = inferredTitle;
  if (inferredIntervals) result.inferredIntervals = inferredIntervals;

  return result;
}

export {
  inferWorkoutPattern,
  // Export detectors for testing
  detectRatePyramid,
  detectRateLadder,
  detectPacingPattern,
  detectJustRowIntervals,
  detectWarmupCooldown,
  // Export helpers for testing
  linearRegression,
  coefficientOfVariation,
  mean,
  median,
};
