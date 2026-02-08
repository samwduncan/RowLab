import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { useActiveSession } from '@v2/hooks/useSessions';
import { useAthletes } from '@v2/hooks/useAthletes';
import { useLiveAttendance } from '@v2/hooks/useAttendance';
import { SPRING_GENTLE } from '@v2/utils/animations';

// ============================================
// Types
// ============================================

interface LiveAttendancePanelProps {
  /** Override date (defaults to today) */
  date?: string;
}

// ============================================
// Helpers
// ============================================

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0] || '';
}

// ============================================
// Component
// ============================================

/**
 * Real-time attendance panel for active practice sessions.
 *
 * - Polls every 5 seconds during active sessions (refetchInterval: 5000)
 * - Shows live count (X/Y) with animated progress bar
 * - Pulsing green dot indicates live status
 * - Status breakdown: Present (green), Late (blue), Excused (amber), Unexcused (red)
 * - "Last updated Xs ago" timestamp
 * - Polling stops when session transitions to COMPLETED/CANCELLED
 * - Returns null when no active session detected
 */
export function LiveAttendancePanel({ date }: LiveAttendancePanelProps = {}) {
  const effectiveDate = date || getTodayISO();
  const { session: activeSession, isLoading: sessionLoading } = useActiveSession();

  // Determine if session is active for polling
  const isActive = activeSession?.status === 'ACTIVE';

  const { athletes } = useAthletes();
  const { counts, totalMarked, dataUpdatedAt } = useLiveAttendance(effectiveDate, isActive);

  const totalAthletes = athletes.length;
  const presentCount = counts.present + counts.late; // Late arrivals count as present
  const progressPercent = totalAthletes > 0 ? (presentCount / totalAthletes) * 100 : 0;

  // Relative time since last update
  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return '';
    return getRelativeTime(dataUpdatedAt);
  }, [dataUpdatedAt]);

  // Don't render if no active session
  if (sessionLoading || !isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={SPRING_GENTLE}
      className="glass-card rounded-lg p-4 border border-data-excellent/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-data-excellent" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-data-excellent animate-pulse" />
            <span className="text-sm font-medium text-data-excellent">Live Attendance</span>
          </div>
        </div>
        {lastUpdated && <span className="text-xs text-txt-tertiary">Updated {lastUpdated}</span>}
      </div>

      {/* Count Display */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-mono font-semibold text-txt-primary">{presentCount}</span>
        <span className="text-lg font-mono text-txt-tertiary">/ {totalAthletes}</span>
        <span className="text-sm text-txt-secondary ml-1">present</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-bg-surface-elevated rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-data-excellent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={SPRING_GENTLE}
        />
      </div>

      {/* Status Breakdown */}
      <div className="flex items-center gap-4">
        <StatusCount label="Present" count={counts.present} colorClass="text-data-excellent" />
        <StatusCount label="Late" count={counts.late} colorClass="text-data-good" />
        <StatusCount label="Excused" count={counts.excused} colorClass="text-data-warning" />
        <StatusCount label="Unexcused" count={counts.unexcused} colorClass="text-data-poor" />
        {totalAthletes - totalMarked > 0 && (
          <StatusCount
            label="Unmarked"
            count={totalAthletes - totalMarked}
            colorClass="text-txt-tertiary"
          />
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// Sub-component
// ============================================

function StatusCount({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-sm font-mono font-medium ${colorClass}`}>{count}</span>
      <span className="text-xs text-txt-tertiary">{label}</span>
    </div>
  );
}

export default LiveAttendancePanel;
