/**
 * Gamification System Types
 *
 * Types for achievements, challenges, personal records, and streaks.
 * Matches Prisma schema from Phase 16-01.
 */

// ============================================
// ACHIEVEMENTS
// ============================================

/** Achievement categories */
export type AchievementCategory = 'Erg' | 'Attendance' | 'Racing';

/** Achievement milestone types */
export type AchievementType = 'first-time' | 'volume' | 'performance' | 'consistency';

/** Achievement rarity tiers (from Common to Legendary) */
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

/** Achievement criteria for unlock logic */
export interface AchievementCriteria {
  type: 'volume' | 'count' | 'streak' | 'performance' | 'time-based';
  target: number;
  metric?: string;  // "meters", "workouts", "days", etc.
  testType?: string;  // For erg-specific achievements
  conditions?: Record<string, unknown>;  // Additional conditions
}

/** Achievement definition */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  rarity: AchievementRarity;
  criteria: AchievementCriteria;
  icon?: string;
  createdAt: string;
}

/** Athlete's progress on an achievement */
export interface AthleteAchievement {
  athleteId: string;
  achievementId: string;
  progress: number;
  unlockedAt: string | null;  // NULL = not unlocked
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;

  // Joined data
  achievement?: Achievement;
}

/** Achievement with computed progress info */
export interface AchievementWithProgress extends Achievement {
  progress: number;
  target: number;
  percentComplete: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  isPinned: boolean;
}

/** Create/update achievement input */
export interface CreateAchievementInput {
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  rarity: AchievementRarity;
  criteria: AchievementCriteria;
  icon?: string;
}

// ============================================
// CHALLENGES
// ============================================

/** Challenge types */
export type ChallengeType = 'individual' | 'collective';

/** Challenge status */
export type ChallengeStatus = 'active' | 'completed' | 'cancelled';

/** Scoring metrics */
export type ChallengeMetric = 'meters' | 'workouts' | 'attendance' | 'composite';

/** Challenge formula configuration */
export interface ChallengeFormula {
  type: 'sum' | 'average' | 'max' | 'weighted';
  weights?: Record<string, number>;  // For composite scoring
  customExpression?: string;  // For advanced formulas
}

/** Handicap configuration */
export interface ChallengeHandicap {
  enabled: boolean;
  type: 'weight-class' | 'age' | 'custom';
  adjustments: Record<string, number>;  // e.g., { "lightweight": 1.05, "heavyweight": 1.0 }
}

/** Challenge definition */
export interface Challenge {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  type: ChallengeType;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  metric: ChallengeMetric;
  formula?: ChallengeFormula;
  handicap?: ChallengeHandicap;
  templateId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;

  // Joined data
  participants?: ChallengeParticipant[];
  participantCount?: number;
}

/** Challenge participant with score */
export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  athleteId: string;
  score: number;
  rank?: number;
  contribution?: Record<string, number>;  // For collective challenges
  createdAt: string;
  updatedAt: string;

  // Joined data
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

/** Leaderboard entry for display */
export interface LeaderboardEntry {
  rank: number;
  athleteId: string;
  athleteName: string;
  avatar?: string;
  score: number;
  delta?: number;  // Change since last update
  contribution?: Record<string, number>;
}

/** Create challenge input */
export interface CreateChallengeInput {
  name: string;
  description?: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  metric: ChallengeMetric;
  formula?: ChallengeFormula;
  handicap?: ChallengeHandicap;
  templateId?: string;
  athleteIds?: string[];  // Initial participants
}

/** Challenge template for quick creation */
export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  metric: ChallengeMetric;
  defaultDurationDays: number;
  formula?: ChallengeFormula;
}

// ============================================
// PERSONAL RECORDS
// ============================================

/** PR scope types */
export type PRScope = 'all-time' | 'season' | 'training-block';

/** PR context for detection */
export interface PRContext {
  scope: PRScope;
  isPR: boolean;
  previousBest?: number;
  improvement?: number;  // Delta in seconds (positive = faster)
  rank?: number;  // Team rank for this test type
}

/** Personal record from database */
export interface PersonalRecord {
  id: string;
  athleteId: string;
  teamId: string;
  testType: string;
  scope: PRScope;
  scopeContext?: string;  // Season name or block ID
  ergTestId: string;
  result: number;  // Time in seconds
  previousBest?: number;
  improvement?: number;
  achievedAt: string;
}

/** Team record entry */
export interface TeamRecord {
  testType: string;
  athleteId: string;
  athleteName: string;
  result: number;
  achievedAt: string;
}

/** PR celebration data for UI */
export interface PRCelebrationData {
  testId: string;
  athleteId: string;
  athleteName: string;
  testType: string;
  result: number;
  contexts: PRContext[];  // Multiple scopes (all-time, season, etc.)
  trendData: number[];  // Last 5 attempts for sparkline
}

// ============================================
// STREAKS
// ============================================

/** Streak categories */
export type StreakCategory = 'attendance' | 'workout' | 'pr' | 'challenge';

/** Streak data */
export interface Streak {
  category: StreakCategory;
  currentLength: number;
  longestLength: number;
  streakStart: string;  // ISO date
  lastActivity: string;  // ISO date
  gracePeriodUsed: number;  // Days used this period
  gracePeriodMax: number;  // Max allowed per week
  isActive: boolean;  // Within grace period
}

/** Streak display info */
export interface StreakDisplay {
  category: StreakCategory;
  icon: string;
  label: string;
  current: number;
  longest: number;
  status: 'active' | 'at-risk' | 'broken';
  graceInfo?: string;  // "1 miss used this week"
}

// ============================================
// SEASON JOURNEY
// ============================================

/** Season journey milestone */
export interface JourneyMilestone {
  date: string;
  type: 'pr' | 'achievement' | 'challenge-win' | 'streak' | 'race';
  title: string;
  description: string;
  icon: string;
  data?: Record<string, unknown>;
}

/** Season journey summary */
export interface SeasonJourney {
  seasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;

  // Stats
  totalMeters: number;
  totalWorkouts: number;
  prsAchieved: number;
  achievementsEarned: number;
  challengesWon: number;

  // Highlights
  milestones: JourneyMilestone[];
  narrative?: string;  // Generated story text
}

// ============================================
// SHAREABLE CARDS
// ============================================

/** Data for generating shareable workout card */
export interface ShareableCardData {
  athleteId: string;
  athleteName: string;
  avatar?: string;

  // Workout info
  workoutType: 'erg-test' | 'workout' | 'race';
  testType?: string;
  result: number;  // Time in seconds
  date: string;

  // PR info (optional)
  isPR?: boolean;
  prContext?: PRContext;
  improvement?: number;

  // Ranking (optional)
  teamRank?: number;
  totalAthletes?: number;

  // Branding
  teamName?: string;
}

// ============================================
// API RESPONSES
// ============================================

/** Standard API response wrapper */
export interface GamificationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/** Achievement list response */
export interface AchievementsResponse {
  achievements: AchievementWithProgress[];
  unlockedCount: number;
  totalCount: number;
}

/** Challenge leaderboard response */
export interface LeaderboardResponse {
  challenge: Challenge;
  leaderboard: LeaderboardEntry[];
  lastUpdated: string;
}

/** PR detection response */
export interface PRDetectionResponse {
  testId: string;
  contexts: PRContext[];
  isPR: boolean;  // True if PR in any context
}

/** Streak summary response */
export interface StreakSummaryResponse {
  streaks: Streak[];
  activeStreakCount: number;
}
