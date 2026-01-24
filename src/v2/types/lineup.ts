/**
 * Lineup Builder types
 *
 * Type definitions for the V2 Lineup Builder workspace, including drag-drop
 * functionality, boat views, and athlete bank components.
 */

import type { Athlete } from './athletes';

// Re-export Athlete type for convenience
export type { Athlete };

/**
 * Boat configuration from API/store
 */
export interface BoatConfig {
  name: string;           // e.g., "Varsity 8+", "JV 4+", "2x"
  numSeats: number;       // Number of rowing seats
  hasCoxswain: boolean;   // Whether boat has coxswain position
}

/**
 * Seat data for individual seat slot
 */
export interface SeatSlotData {
  seatNumber: number;
  side: 'Port' | 'Starboard';
  athlete: Athlete | null;
}

/**
 * Warning information for validation issues
 */
export interface SeatWarning {
  type: 'side' | 'cox' | 'other';
  message: string;
}

/**
 * Data passed during drag operations
 */
export interface DragData {
  athlete: Athlete;
  sourceBoatId?: string;  // undefined if from athlete bank
  sourceSeatNumber?: number;
  sourceIsCoxswain?: boolean;
}

/**
 * Data for drop targets (seats)
 */
export interface DropData {
  boatId: string;
  seatNumber?: number;  // undefined for coxswain position
  isCoxswain: boolean;
  currentAthlete?: Athlete | null;
}

/**
 * Boat instance with seats and assignments
 */
export interface BoatInstance {
  id: string;             // Unique instance ID (e.g., "boat-1234567890")
  name: string;           // Boat class name (e.g., "Varsity 8+")
  shellName: string | null;  // Actual shell name (e.g., "Seaweed")
  numSeats: number;
  hasCoxswain: boolean;
  seats: SeatSlotData[];
  coxswain: Athlete | null;
  isExpanded: boolean;
}

/**
 * Shell name option from store
 */
export interface Shell {
  id: string;
  name: string;
  boatClass?: string;  // Optional boat class association
}

// ============================================
// Component Props
// ============================================

/**
 * Props for LineupWorkspace container
 */
export interface LineupWorkspaceProps {
  className?: string;
}

/**
 * Props for AthleteBank sidebar
 */
export interface AthleteBankProps {
  className?: string;
}

/**
 * Props for BoatView display
 */
export interface BoatViewProps {
  boat: BoatInstance;
  className?: string;
}

/**
 * Props for AddBoatButton component
 */
export interface AddBoatButtonProps {
  className?: string;
}

/**
 * Props for individual seat slot component
 */
export interface SeatSlotProps {
  boatId: string;
  seat: SeatSlotData;
  isCoxswain?: boolean;
  warnings?: SeatWarning[];
  className?: string;
}
