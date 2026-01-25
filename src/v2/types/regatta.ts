// ============================================
// Regatta Types
// ============================================

export type CourseType = '2000m' | '1500m' | 'head' | 'custom';
export type BoatClass = '8+' | '4+' | '4-' | '4x' | '2+' | '2-' | '2x' | '1x' | 'custom';

export type Regatta = {
  id: string;
  teamId: string;
  name: string;
  location: string | null;
  date: string; // ISO date
  endDate: string | null; // For multi-day
  host: string | null;
  venueType: string | null;
  courseType: CourseType | null;
  conditions: {
    wind?: string;
    temperature?: number;
    current?: string;
  } | null;
  description: string | null;
  externalUrl: string | null;
  teamGoals: string | null;
  createdAt: string;
  updatedAt: string;
  events?: Event[];
  races?: Race[]; // Backward compatibility
  _count?: { races: number };
};

export type RegattaFormData = Omit<Regatta, 'id' | 'teamId' | 'createdAt' | 'updatedAt' | 'events' | 'races' | '_count'>;

// ============================================
// Event Types (Regatta -> Event -> Race)
// ============================================

export type Event = {
  id: string;
  regattaId: string;
  name: string; // "Varsity 8+", "2V8+", etc.
  category: string | null;
  scheduledDay: number | null; // Day 1, 2, 3 for multi-day
  sortOrder: number;
  createdAt: string;
  races?: Race[];
};

export type EventFormData = Omit<Event, 'id' | 'regattaId' | 'createdAt' | 'races'>;

// ============================================
// Race Types
// ============================================

export type Race = {
  id: string;
  eventId: string | null;
  regattaId: string; // Denormalized for queries
  eventName: string;
  boatClass: BoatClass | string;
  distanceMeters: number;
  isHeadRace: boolean;
  scheduledTime: string | null;
  results?: RaceResult[];
  checklist?: RaceChecklist | null;
};

export type RaceFormData = Omit<Race, 'id' | 'eventId' | 'regattaId' | 'results' | 'checklist'>;

// ============================================
// Race Result Types
// ============================================

export type RaceResult = {
  id: string;
  raceId: string;
  teamName: string;
  isOwnTeam: boolean;
  lineupId: string | null;
  finishTimeSeconds: number | null;
  place: number | null;
  marginBackSeconds: number | null;
  rawSpeed: number | null; // m/s
  adjustedSpeed: number | null;
  lineup?: { id: string; name: string } | null;
};

export type RaceResultFormData = Omit<RaceResult, 'id' | 'raceId' | 'lineup'>;

// ============================================
// Checklist Types
// ============================================

export type ChecklistRole = 'coach' | 'coxswain' | 'anyone';

export type ChecklistTemplateItem = {
  id: string;
  templateId: string;
  text: string;
  role: ChecklistRole;
  sortOrder: number;
};

export type ChecklistTemplate = {
  id: string;
  teamId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  items?: ChecklistTemplateItem[];
};

export type ChecklistTemplateFormData = {
  name: string;
  isDefault?: boolean;
  items: Omit<ChecklistTemplateItem, 'id' | 'templateId'>[];
};

export type RaceChecklistItem = {
  id: string;
  checklistId: string;
  text: string;
  role: ChecklistRole;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  sortOrder: number;
};

export type RaceChecklist = {
  id: string;
  raceId: string;
  templateId: string | null;
  createdAt: string;
  items: RaceChecklistItem[];
};

// ============================================
// External Ranking Types
// ============================================

export type RankingSource = 'row2k' | 'usrowing' | 'regattacentral' | 'manual';

export type ExternalRanking = {
  id: string;
  teamId: string;
  externalTeamId: string;
  externalTeamName?: string; // Joined from ExternalTeam
  boatClass: BoatClass | string;
  source: RankingSource;
  ranking: number;
  season: string | null;
  updatedDate: string;
  notes: string | null;
  createdAt: string;
  externalTeam?: ExternalTeam;
};

export type ExternalRankingFormData = Omit<ExternalRanking, 'id' | 'teamId' | 'createdAt' | 'externalTeamName' | 'externalTeam'>;

export type ExternalTeam = {
  id: string;
  name: string;
  conference: string | null;
  division: string | null; // D1, D2, D3, Club
};

// ============================================
// Team Speed & Rankings Types
// ============================================

export type TeamSpeedEstimate = {
  id: string;
  teamId: string;
  boatClass: BoatClass | string;
  season: string | null;
  rawSpeed: number | null;
  adjustedSpeed: number | null;
  confidenceScore: number | null;
  sampleCount: number;
  lastCalculatedAt: string;
};

export type HeadToHeadComparison = {
  ownTeam: string;
  opponent: string;
  boatClass: string;
  wins: number;
  losses: number;
  races: Array<{
    regattaName: string;
    date: string;
    ownPlace: number;
    opponentPlace: number;
    margin: number | null;
  }>;
};

// ============================================
// Race Day Command Center Types
// ============================================

export type RaceDayEventType = 'race' | 'warmup' | 'checkin' | 'equipment-prep';

export type RaceDayEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: RaceDayEventType;
  raceId?: string;
  eventId?: string;
  boatClass?: string;
};

export type WarmupScheduleItem = {
  raceId: string;
  raceName: string;
  raceTime: Date;
  warmupStartTime: Date;
  launchTime: Date;
  durationMinutes: number;
  warning?: string;
  isOverride?: boolean;
};

// ============================================
// Margin Display Types
// ============================================

export type MarginDisplayMode = 'terminology' | 'exact';

export type MarginInfo = {
  seconds: number;
  boatLengths: number;
  terminology: string;
};

// ============================================
// Checklist Progress Types
// ============================================

export type ChecklistProgress = {
  total: number;
  completed: number;
  percentage: number;
};
