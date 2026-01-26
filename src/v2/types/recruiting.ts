// src/v2/types/recruiting.ts
// TypeScript types for Recruit Visit Management

// ============================================
// ENUMS / LITERAL TYPES
// ============================================

/**
 * Schedule content format type
 * - pdf: Visit schedule stored as PDF file URL
 * - richtext: Visit schedule as sanitized HTML
 */
export type ScheduleType = 'pdf' | 'richtext';

/**
 * Visit status lifecycle
 * - scheduled: Visit is planned but not yet occurred
 * - completed: Visit has taken place
 * - cancelled: Visit was cancelled
 */
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled';

// ============================================
// RECRUIT VISIT
// ============================================

/**
 * Recruit visit record
 * Represents a prospective student-athlete visit to the team
 */
export interface RecruitVisit {
  id: string;
  teamId: string;

  // Recruit info
  recruitName: string;
  recruitEmail?: string;
  recruitPhone?: string;
  recruitSchool?: string;  // Current high school or transfer school
  recruitGradYear?: number; // Expected graduation year

  // Visit scheduling
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format

  // Host assignment
  hostAthleteId?: string;
  hostAthlete?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  // Schedule content
  scheduleType: ScheduleType;
  scheduleContent?: string; // Sanitized HTML for rich text schedule
  schedulePdfUrl?: string; // URL to uploaded PDF schedule

  // Additional info
  notes?: string; // Internal coaching notes
  status: VisitStatus;

  // Sharing
  shareToken?: string; // Unique token for public share link
  shareEnabled: boolean; // Whether public sharing is enabled

  // Timestamps
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FORM / INPUT TYPES
// ============================================

/**
 * Input for creating a new recruit visit
 */
export interface CreateRecruitVisitInput {
  recruitName: string;
  recruitEmail?: string;
  recruitPhone?: string;
  recruitSchool?: string;
  recruitGradYear?: number;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  hostAthleteId?: string;
  scheduleType: ScheduleType;
  scheduleContent?: string; // HTML content (will be sanitized server-side)
  schedulePdfUrl?: string;
  notes?: string;
}

/**
 * Input for updating an existing recruit visit
 * All fields are optional for partial updates
 */
export interface UpdateRecruitVisitInput extends Partial<CreateRecruitVisitInput> {
  status?: VisitStatus;
  shareEnabled?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Response for list of recruit visits
 */
export interface RecruitVisitsResponse {
  visits: RecruitVisit[];
  total: number;
}

/**
 * Response for single recruit visit
 */
export interface RecruitVisitResponse {
  visit: RecruitVisit;
}

/**
 * Filters for querying recruit visits
 */
export interface RecruitVisitFilters {
  status?: VisitStatus;
  hostAthleteId?: string;
  startDate?: string; // ISO date - filter visits >= this date
  endDate?: string; // ISO date - filter visits <= this date
}

// ============================================
// CALENDAR EVENT EXTENSION
// ============================================

/**
 * Calendar event representation of a recruit visit
 * For integration with team calendar view
 */
export interface RecruitVisitCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: false;
  resource: {
    type: 'recruit_visit';
    visitId: string;
    recruitName: string;
    hostAthleteId?: string;
    hostAthleteName?: string;
    status: VisitStatus;
  };
}
