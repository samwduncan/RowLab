/**
 * RowLab Core Type Definitions
 *
 * This file contains all shared TypeScript types for the RowLab application.
 * Types are organized by domain: Athletes, Boats, Lineups, Users, and AI.
 */

// =============================================================================
// ATHLETE TYPES
// =============================================================================

export type Side = 'P' | 'S' | 'B' | 'Cox';

export interface Athlete {
  id: number;
  lastName: string;
  firstName: string;
  country: string;
  side: Side;
  port: boolean;
  starboard: boolean;
  sculling: boolean;
  isCoxswain: boolean;
  ergScore?: number;
  headshotUrl?: string;
}

export interface AthleteWithStats extends Athlete {
  ergTests: ErgTest[];
  rank?: number;
  recentImprovement?: number;
}

// =============================================================================
// ERG DATA TYPES
// =============================================================================

export type ErgTestType = '2k' | '6k' | '30min' | '500m' | '1k' | '5k';

export interface ErgTest {
  id: number;
  athleteId: number;
  testDate: string | Date;
  testType: ErgTestType;
  result: string; // mm:ss.t format
  split?: string; // per 500m split
  strokeRate?: number;
  watts?: number;
  notes?: string;
}

export interface ErgTestInput {
  athleteId: number;
  testDate: string;
  testType: ErgTestType;
  result: string;
  split?: string;
  strokeRate?: number;
  watts?: number;
  notes?: string;
}

// =============================================================================
// BOAT TYPES
// =============================================================================

export type BoatClass = '8+' | '4+' | '4-' | '4x' | '2-' | '2x' | '1x';

export interface BoatConfig {
  id: number;
  name: string; // e.g., "Varsity 8+", "JV 4-"
  numSeats: number;
  hasCoxswain: boolean;
  boatClass?: BoatClass;
}

export interface Shell {
  id: number;
  name: string;
  boatClass: string;
  notes?: string;
}

export interface Seat {
  seatNumber: number;
  side: 'Port' | 'Starboard' | 'N/A';
  athlete: Athlete | null;
  isCoxswain: boolean;
}

export interface ActiveBoat {
  id: string;
  boatConfig: BoatConfig;
  shell?: Shell;
  shellName?: string;
  seats: Seat[];
  createdAt?: Date;
}

// =============================================================================
// LINEUP TYPES
// =============================================================================

export interface LineupAssignment {
  id: number;
  lineupId: number;
  athleteId: number;
  boatClass: string;
  shellName?: string;
  seatNumber: number;
  side: string;
  isCoxswain: boolean;
}

export interface Lineup {
  id: number;
  name: string;
  userId: number;
  notes?: string;
  assignments: LineupAssignment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SavedLineup {
  id: string;
  name: string;
  boats: ActiveBoat[];
  savedAt: string;
  userId?: number;
}

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export type UserRole = 'admin' | 'coach';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  username: string;
  email?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  requestMessage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  name: string;
  requestMessage?: string;
}

// =============================================================================
// AI TYPES
// =============================================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AIContext {
  athletes: Athlete[];
  activeBoats: ActiveBoat[];
}

export interface AIStatus {
  available: boolean;
  endpoint: string;
  models: AIModel[];
  defaultModel: string;
  error?: string;
}

export interface AIModel {
  name: string;
  size: number;
  modified: string;
}

export interface LineupSuggestion {
  boatClass: BoatClass;
  seats: {
    seatNumber: number;
    athleteId: number;
    confidence: number;
    reasoning: string;
  }[];
  overallScore: number;
  balanceScore: number;
  powerScore: number;
}

// =============================================================================
// COLLABORATION TYPES
// =============================================================================

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  activeBoatId?: string;
  lastSeen: Date;
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'cursor' | 'selection' | 'edit';
  userId: string;
  payload: unknown;
  timestamp: Date;
}

export interface RealtimeState {
  connected: boolean;
  users: PresenceUser[];
  pendingChanges: number;
}

// =============================================================================
// STORE TYPES
// =============================================================================

export interface LineupStoreState {
  athletes: Athlete[];
  boatConfigs: BoatConfig[];
  shells: Shell[];
  activeBoats: ActiveBoat[];
  ergData: ErgTest[];
  selectedAthlete: Athlete | null;
  selectedSeats: { boatId: string; seatNumber: number }[];
  headshotMap: Map<string, string>;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState {
  aiEnabled: boolean;
  aiModel: string;
  aiEndpoint: string;
  theme: 'light' | 'dark' | 'system';
  features: {
    aiAssistant: boolean;
    boatView: boolean;
    ergData: boolean;
    analytics: boolean;
    collaboration: boolean;
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export type GlassVariant = 'subtle' | 'base' | 'elevated' | 'strong';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type Size = 'sm' | 'md' | 'lg';

export interface GlassCardProps {
  variant?: GlassVariant;
  className?: string;
  interactive?: boolean;
  blur?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export interface GlassButtonProps {
  variant?: ButtonVariant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
