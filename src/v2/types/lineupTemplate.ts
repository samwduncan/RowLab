/**
 * Lineup template types for Phase 18 - LINEUP-03
 */

import type { RiggingDefaults } from './rigging';

/**
 * Template assignment - seat configuration
 */
export interface TemplateAssignment {
  seatNumber: number;
  side: 'Port' | 'Starboard';
  /** Optional preferred athlete - templates can be generic or athlete-specific */
  preferredAthleteId?: string | null;
  /** Optional athlete name for display when ID not resolved */
  preferredAthleteName?: string | null;
}

/**
 * Lineup template - reusable lineup configuration
 */
export interface LineupTemplate {
  id: string;
  teamId: string;
  name: string;
  description?: string | null;
  boatClass: string;
  assignments: TemplateAssignment[];
  /** Optional rigging snapshot */
  rigging?: RiggingDefaults | null;
  /** Mark as default for this boat class */
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating lineup template
 */
export interface LineupTemplateInput {
  name: string;
  description?: string | null;
  boatClass: string;
  assignments: TemplateAssignment[];
  rigging?: RiggingDefaults | null;
  isDefault?: boolean;
}

/**
 * Input for updating lineup template
 */
export interface LineupTemplateUpdateInput {
  name?: string;
  description?: string | null;
  assignments?: TemplateAssignment[];
  rigging?: RiggingDefaults | null;
  isDefault?: boolean;
}

/**
 * Template applied result - what happens when applying a template
 */
export interface AppliedTemplate {
  templateId: string;
  templateName: string;
  boatClass: string;
  /** Athletes actually assigned (resolved from preferredAthleteId) */
  assignedAthletes: Array<{
    seatNumber: number;
    athleteId: string;
    athleteName: string;
    side: 'Port' | 'Starboard';
    /** Whether this athlete was the preferred one or a substitute */
    isPreferred: boolean;
  }>;
  /** Seats that couldn't be filled (athlete unavailable/missing) */
  unfilledSeats: number[];
}
