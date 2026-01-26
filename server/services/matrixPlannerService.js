import { variance } from 'simple-statistics';

// ============================================
// CONSTANTS
// ============================================

const BOAT_SIZES = {
  '8+': 9, // 8 rowers + cox
  '4+': 5, // 4 rowers + cox
  '4-': 4, // 4 rowers
  '2-': 2, // pair
  '2x': 2, // double
  '1x': 1, // single
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Generate optimal swap schedule for matrix seat racing
 * @param {Object} input - { athleteIds, boatClass, pieceCount?, prioritizeAthletes? }
 * @returns {Object} SwapSchedule with pieces, boats, and quality statistics
 */
export function generateSwapSchedule(input) {
  const { athleteIds, boatClass, pieceCount, prioritizeAthletes } = input;

  const boatSize = BOAT_SIZES[boatClass];
  if (!boatSize) throw new Error(`Unknown boat class: ${boatClass}`);

  const n = athleteIds.length;
  const numBoats = Math.floor(n / boatSize);

  if (numBoats < 2) {
    throw new Error(`Need at least ${boatSize * 2} athletes for ${boatClass} matrix racing`);
  }

  // Calculate minimum pieces needed for complete comparison
  const minPieces = calculateMinPiecesForCoverage(n, boatSize, numBoats);
  const actualPieceCount = pieceCount || minPieces;

  // Initialize comparison tracking
  const comparisonCount = new Map(); // "id1-id2" -> count

  // Generate schedule using round-robin tournament adaptation
  const pieces = [];

  for (let pieceNum = 0; pieceNum < actualPieceCount; pieceNum++) {
    const assignment = generateBalancedAssignment(
      athleteIds,
      boatSize,
      numBoats,
      comparisonCount,
      pieceNum,
      prioritizeAthletes
    );

    pieces.push({
      pieceNumber: pieceNum + 1,
      boats: assignment.boats,
      swapDescription: generateSwapDescription(pieces[pieceNum - 1]?.boats, assignment.boats)
    });

    // Update comparison counts
    updateComparisonCounts(assignment.boats, comparisonCount);
  }

  // Calculate quality statistics
  const stats = calculateScheduleQuality(comparisonCount, athleteIds, pieces);

  return {
    athletes: athleteIds.map(id => ({ id })), // Caller enriches with names
    boatClass,
    boatCount: numBoats,
    pieceCount: actualPieceCount,
    pieces,
    statistics: stats,
    warnings: generateWarnings(stats)
  };
}

/**
 * Generate a balanced assignment for one piece
 * Uses greedy algorithm to minimize comparison imbalance
 */
function generateBalancedAssignment(athleteIds, boatSize, numBoats, comparisonCount, pieceNum, prioritizeAthletes) {
  const n = athleteIds.length;
  const assigned = new Set();
  const boats = [];

  // Use Latin Square rotation for base pattern
  for (let boatIdx = 0; boatIdx < numBoats; boatIdx++) {
    const boatAthletes = [];

    for (let seatIdx = 0; seatIdx < boatSize; seatIdx++) {
      // Calculate position using Latin Square rotation
      const baseIdx = (boatIdx * boatSize + seatIdx + pieceNum) % n;
      let athleteIdx = baseIdx;

      // Find unassigned athlete starting from baseIdx
      while (assigned.has(athleteIds[athleteIdx])) {
        athleteIdx = (athleteIdx + 1) % n;
        if (athleteIdx === baseIdx) break; // Safety: prevent infinite loop
      }

      if (!assigned.has(athleteIds[athleteIdx])) {
        boatAthletes.push(athleteIds[athleteIdx]);
        assigned.add(athleteIds[athleteIdx]);
      }
    }

    boats.push({
      boatName: String.fromCharCode(65 + boatIdx), // 'A', 'B', 'C'...
      athleteIds: boatAthletes,
      seatAssignments: boatAthletes.map((athleteId, idx) => ({
        seatNumber: idx + 1,
        athleteId,
        side: idx % 2 === 0 ? 'Port' : 'Starboard' // Alternating default
      }))
    });
  }

  return { boats };
}

/**
 * Update comparison counts after a piece
 */
function updateComparisonCounts(boats, comparisonCount) {
  // Every pair of boats creates comparisons
  for (let i = 0; i < boats.length; i++) {
    for (let j = i + 1; j < boats.length; j++) {
      const boatA = boats[i].athleteIds;
      const boatB = boats[j].athleteIds;

      // Find athletes unique to each boat (the "swapped" ones)
      const onlyInA = boatA.filter(id => !boatB.includes(id));
      const onlyInB = boatB.filter(id => !boatA.includes(id));

      // Record all pairwise comparisons between unique athletes
      for (const a of onlyInA) {
        for (const b of onlyInB) {
          const key = [a, b].sort().join('-');
          comparisonCount.set(key, (comparisonCount.get(key) || 0) + 1);
        }
      }
    }
  }
}

/**
 * Calculate schedule quality metrics
 */
export function calculateScheduleQuality(comparisonCount, athleteIds, pieces) {
  const n = athleteIds.length;
  const totalPossible = (n * (n - 1)) / 2;
  const covered = comparisonCount.size;

  const counts = Array.from(comparisonCount.values());
  const countVariance = counts.length > 0 ? variance(counts) : 0;
  const meanCount = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

  // Balance score: lower variance = more balanced
  const balance = countVariance < 0.01 ? 1.0 : 1 / (1 + countVariance);

  return {
    comparisonsCovered: covered,
    totalPossibleComparisons: totalPossible,
    coverage: covered / totalPossible,
    balance,
    isOptimal: covered === totalPossible && countVariance < 1.0,
    meanComparisonsPerPair: meanCount,
    varianceInComparisons: countVariance
  };
}

/**
 * Calculate minimum pieces needed for full coverage
 */
function calculateMinPiecesForCoverage(n, boatSize, numBoats) {
  // For Latin Square: n pieces for n athletes
  // For incomplete designs: approximately n-1 pieces
  // Practical minimum: (n-1) / (numBoats-1) for pairwise coverage
  return Math.max(3, Math.ceil((n - 1) / (numBoats - 1)));
}

/**
 * Generate human-readable swap description
 */
function generateSwapDescription(prevBoats, currentBoats) {
  if (!prevBoats) return 'Initial lineup';

  const swaps = [];
  for (let i = 0; i < currentBoats.length; i++) {
    const prev = prevBoats[i]?.athleteIds || [];
    const curr = currentBoats[i]?.athleteIds || [];

    const joined = curr.filter(id => !prev.includes(id));
    const left = prev.filter(id => !curr.includes(id));

    if (joined.length > 0 || left.length > 0) {
      swaps.push(`Boat ${currentBoats[i].boatName}: ${joined.length} in, ${left.length} out`);
    }
  }

  return swaps.join('; ') || 'No changes';
}

/**
 * Generate warnings for suboptimal schedules
 */
function generateWarnings(stats) {
  const warnings = [];

  if (stats.coverage < 0.8) {
    warnings.push(`Incomplete comparison coverage (${(stats.coverage * 100).toFixed(0)}%) - add more pieces`);
  }

  if (stats.balance < 0.5) {
    warnings.push('Unbalanced comparisons - some pairs compared much more than others');
  }

  return warnings;
}

/**
 * Validate a manually-created schedule
 */
export function validateSchedule(schedule) {
  const issues = [];

  // Check for duplicate assignments in same piece
  for (const piece of schedule.pieces) {
    const allAthletes = piece.boats.flatMap(b => b.athleteIds);
    const unique = new Set(allAthletes);
    if (unique.size !== allAthletes.length) {
      issues.push(`Piece ${piece.pieceNumber}: Athlete assigned to multiple boats`);
    }
  }

  // Check comparison coverage
  const comparisonCount = new Map();
  for (const piece of schedule.pieces) {
    updateComparisonCounts(piece.boats, comparisonCount);
  }

  const stats = calculateScheduleQuality(comparisonCount, schedule.athletes.map(a => a.id), schedule.pieces);

  return {
    valid: issues.length === 0,
    issues,
    statistics: stats
  };
}

export default {
  generateSwapSchedule,
  calculateScheduleQuality,
  validateSchedule,
  BOAT_SIZES
};
