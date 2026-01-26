/**
 * Advanced Seat Racing Analytics Types
 * Phase 14: Bradley-Terry model, composite rankings, side-specific ELO
 */

import { z } from 'zod';
import type { Side, AthleteRating, RatingWithAthlete } from './seatRacing';

// ============================================
// BRADLEY-TERRY MODEL TYPES
// ============================================

/**
 * Bradley-Terry strength estimate for an athlete
 */
export interface BradleyTerryStrength {
  athleteId: string;
  strength: number;           // exp(β) from model
  logStrength: number;        // β parameter
  stdError: number;           // Standard error of estimate
  confidenceInterval: [number, number]; // 95% CI
  comparisonsCount: number;   // Number of pairwise comparisons
}

/**
 * Bradley-Terry model fit result
 */
export interface BradleyTerryModel {
  teamId: string;
  fittedAt: string;           // ISO timestamp
  athletes: BradleyTerryStrength[];
  convergence: {
    iterations: number;
    converged: boolean;
    logLikelihood: number;
  };
  modelStats: {
    totalComparisons: number;
    athleteCount: number;
    graphConnectivity: number; // 0-1, proportion of pairs compared
  };
}

/**
 * Probability matrix entry
 */
export interface ProbabilityPair {
  athlete1Id: string;
  athlete2Id: string;
  probability: number;        // P(athlete1 beats athlete2)
  stdError: number;
  significantlyDifferent: boolean; // true if CIs don't overlap
}

// ============================================
// COMPARISON GRAPH TYPES
// ============================================

/**
 * Node in comparison graph (athlete)
 */
export interface ComparisonNode {
  id: string;
  athleteId: string;
  label: string;              // "First Last"
  strength: number;           // For sizing
  confidenceLevel: 'UNRATED' | 'PROVISIONAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  comparisonCount: number;
  side: Side | null;
}

/**
 * Edge in comparison graph (head-to-head results)
 */
export interface ComparisonEdge {
  from: string;               // athleteId
  to: string;                 // athleteId
  comparisons: number;        // Total races between them
  winner1Count: number;       // Times athlete1 won
  winner2Count: number;       // Times athlete2 won
  avgMarginSeconds: number;   // Average time difference
  color?: string;             // For visualization
}

/**
 * Comparison gap - pair that hasn't raced
 */
export interface ComparisonGap {
  athlete1: {
    id: string;
    firstName: string;
    lastName: string;
  };
  athlete2: {
    id: string;
    firstName: string;
    lastName: string;
  };
  priority: 'high' | 'medium' | 'low'; // Based on ranking proximity
  estimatedValue: number;     // How much ranking info this comparison would provide
}

/**
 * Full comparison graph for visualization
 */
export interface ComparisonGraph {
  nodes: ComparisonNode[];
  edges: ComparisonEdge[];
  gaps: ComparisonGap[];
  statistics: {
    totalNodes: number;
    totalEdges: number;
    totalGaps: number;
    connectivity: number;     // 0-1, proportion of possible edges that exist
    isConnected: boolean;     // All athletes reachable from any other
  };
}

// ============================================
// MATRIX SESSION PLANNER TYPES
// ============================================

/**
 * Swap assignment for a single boat in a piece
 */
export interface SwapBoatAssignment {
  boatName: string;           // 'A', 'B', etc.
  athleteIds: string[];       // Athletes assigned to this boat
  seatAssignments: Array<{
    seatNumber: number;
    athleteId: string;
    side: Side;
  }>;
}

/**
 * Single piece in swap schedule
 */
export interface SwapPiece {
  pieceNumber: number;
  boats: SwapBoatAssignment[];
  swapDescription: string;    // "Athletes X and Y swap between boats A and B"
}

/**
 * Generated swap schedule
 */
export interface SwapSchedule {
  athletes: Array<{
    id: string;
    firstName: string;
    lastName: string;
    side: Side | null;
  }>;
  boatClass: string;          // '4+', '4-', '2-'
  boatCount: number;
  pieceCount: number;
  pieces: SwapPiece[];
  statistics: {
    comparisonsCovered: number;
    totalPossibleComparisons: number;
    coverage: number;         // 0-1
    balance: number;          // 0-1, how evenly distributed comparisons are
    isOptimal: boolean;       // True if follows Latin Square/BIBD
  };
  warnings: string[];         // e.g., "Incomplete comparison coverage"
}

/**
 * Matrix planner input
 */
export interface MatrixPlannerInput {
  athleteIds: string[];
  boatClass: string;
  pieceCount?: number;        // Optional, will calculate optimal if not provided
  prioritizeAthletes?: string[]; // Athletes to prioritize in comparisons
}

// ============================================
// COMPOSITE RANKING TYPES
// ============================================

/**
 * Weight profile for composite ranking
 */
export interface RankingWeightProfile {
  id: string;
  name: string;               // 'Performance-First', 'Balanced', 'Reliability', 'Custom'
  weights: {
    onWater: number;          // 0-1, Primary: BT or ELO from seat racing + practice
    erg: number;              // 0-1, Secondary: Erg test performance
    attendance: number;       // 0-1, Secondary: Practice attendance rate
  };
  isDefault: boolean;
  isCustom: boolean;
}

/**
 * Component score in composite ranking
 */
export interface RankingComponent {
  source: 'onWater' | 'erg' | 'attendance';
  rawScore: number;           // Original value
  normalizedScore: number;    // 0-1 normalized
  weight: number;             // From profile
  contribution: number;       // normalizedScore * weight
  dataPoints: number;         // How many data points contributed
  confidence: number;         // 0-1, based on data points
}

/**
 * Full composite ranking for an athlete
 */
export interface CompositeRanking {
  athleteId: string;
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    side: Side | null;
  };
  rank: number;
  compositeScore: number;
  breakdown: RankingComponent[];
  overallConfidence: number;  // Min of component confidences
  lastUpdated: string;        // ISO timestamp
}

/**
 * Team composite rankings response
 */
export interface CompositeRankingsResponse {
  teamId: string;
  profile: RankingWeightProfile;
  rankings: CompositeRanking[];
  calculatedAt: string;
}

// ============================================
// SIDE-SPECIFIC RATING TYPES
// ============================================

/**
 * Side-specific rating for dual-side athletes
 */
export interface SideSpecificRating {
  athleteId: string;
  primarySide: Side;
  ratings: {
    port?: AthleteRating;
    starboard?: AthleteRating;
    cox?: AthleteRating;
  };
  primaryRating: AthleteRating;
}

/**
 * Athlete with all side ratings
 */
export interface AthleteWithSideRatings {
  id: string;
  firstName: string;
  lastName: string;
  side: Side | null;          // Primary side preference
  canRowBothSides: boolean;
  sideRatings: SideSpecificRating;
}

// ============================================
// PASSIVE TRACKING TYPES
// ============================================

/**
 * Practice observation for passive ELO
 */
export interface PracticeObservation {
  sessionId: string;          // From Phase 13 Session model
  pieceId?: string;
  boat1Athletes: string[];
  boat2Athletes: string[];
  splitDifferenceSeconds: number; // Positive = boat1 faster
  weight: number;             // 0.5 for practice, 1.0 for formal
  recordedAt: string;
}

/**
 * Passive tracking configuration
 */
export interface PassiveTrackingConfig {
  enabled: boolean;
  practiceWeight: number;     // Default 0.5
  minSplitDifference: number; // Ignore differences smaller than this
  autoDetectSwaps: boolean;   // Automatically find swaps from lineup changes
}

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const matrixPlannerInputSchema = z.object({
  athleteIds: z.array(z.string().uuid()).min(2, 'At least 2 athletes required'),
  boatClass: z.string().min(1, 'Boat class required'),
  pieceCount: z.number().int().positive().optional(),
  prioritizeAthletes: z.array(z.string().uuid()).optional(),
});

export type MatrixPlannerInputValidated = z.infer<typeof matrixPlannerInputSchema>;

export const rankingWeightProfileSchema = z.object({
  name: z.string().min(1),
  weights: z.object({
    onWater: z.number().min(0).max(1),
    erg: z.number().min(0).max(1),
    attendance: z.number().min(0).max(1),
  }).refine(
    (w) => Math.abs(w.onWater + w.erg + w.attendance - 1) < 0.001,
    'Weights must sum to 1.0'
  ),
});

export type RankingWeightProfileInput = z.infer<typeof rankingWeightProfileSchema>;

export const practiceObservationSchema = z.object({
  sessionId: z.string().uuid(),
  pieceId: z.string().uuid().optional(),
  boat1Athletes: z.array(z.string().uuid()).min(1),
  boat2Athletes: z.array(z.string().uuid()).min(1),
  splitDifferenceSeconds: z.number(),
  weight: z.number().min(0).max(1).default(0.5),
});

export type PracticeObservationInput = z.infer<typeof practiceObservationSchema>;

// ============================================
// DEFAULT WEIGHT PROFILES
// ============================================

export const DEFAULT_WEIGHT_PROFILES: RankingWeightProfile[] = [
  {
    id: 'performance-first',
    name: 'Performance-First',
    weights: { onWater: 0.85, erg: 0.10, attendance: 0.05 },
    isDefault: false,
    isCustom: false,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    weights: { onWater: 0.75, erg: 0.15, attendance: 0.10 },
    isDefault: true,
    isCustom: false,
  },
  {
    id: 'reliability',
    name: 'Reliability-Focus',
    weights: { onWater: 0.65, erg: 0.15, attendance: 0.20 },
    isDefault: false,
    isCustom: false,
  },
];
