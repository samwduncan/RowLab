/**
 * V2 Athletes Components — Barrel Export
 *
 * MIGRATION NOTE (Phase 28):
 * Components marked @deprecated have been replaced by src/v2/features/athletes/.
 * Active components (AthleteAvatar, AthleteCard, AthletesEmptyState, Attendance*)
 * are still in use across features. Deprecated components will be removed in Phase 36.
 */

// --- Active components (still used across features) ---
export { AthleteAvatar } from './AthleteAvatar';
export { AthleteCard } from './AthleteCard';
export { AthletesEmptyState, AthletesNoResultsState } from './AthletesEmptyState';
export { AttendanceTracker } from './AttendanceTracker';
export { AttendanceHistory } from './AttendanceHistory';
export { AttendanceSummary } from './AttendanceSummary';

// --- @deprecated — replaced by src/v2/features/athletes/ (Phase 28) ---
/** @deprecated Use src/v2/features/athletes/components/edit/AthleteEditForm instead */
export { AthleteEditPanel } from './AthleteEditPanel';
/** @deprecated Use src/v2/features/athletes/components/roster/ filter components instead */
export { AthleteFilters } from './AthleteFilters';
/** @deprecated Use src/v2/features/athletes/components/roster/ table components instead */
export { AthletesTable } from './AthletesTable';
/** @deprecated Use src/v2/features/athletes/components/roster/ view toggle instead */
export { ViewToggle } from './ViewToggle';
/** @deprecated Use src/v2/features/athletes/components/import/ components instead */
export { CSVImportModal } from './CSVImportModal';
/** @deprecated Use src/v2/features/athletes/components/import/ components instead */
export { ColumnMapper } from './ColumnMapper';
/** @deprecated Use src/v2/features/athletes/components/import/ components instead */
export { ImportPreview } from './ImportPreview';

// --- Type exports ---
export type { AthleteAvatarProps } from './AthleteAvatar';
export type { AthleteCardProps } from './AthleteCard';
export type { AthletesEmptyStateProps, AthletesNoResultsStateProps } from './AthletesEmptyState';

/** @deprecated */
export type { AthleteEditPanelProps } from './AthleteEditPanel';
/** @deprecated */
export type { AthleteFiltersProps } from './AthleteFilters';
/** @deprecated */
export type { AthletesTableProps } from './AthletesTable';
/** @deprecated */
export type { ViewMode, ViewToggleProps } from './ViewToggle';
