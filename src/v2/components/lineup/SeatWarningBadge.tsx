import { AlertTriangle } from 'lucide-react';
import type { SeatWarning } from '@v2/types/lineup';

/**
 * SeatWarningBadge - Validation warning indicator for seat assignments
 *
 * Displays a small warning badge with tooltip for seat validation issues.
 * Per CONTEXT.md: "Warnings always visible on seats as badges - constant awareness, no hover required"
 *
 * Validation types:
 * - 'side': Port/starboard mismatch (athlete prefers other side)
 * - 'cox': Non-coxswain in coxswain seat
 * - 'other': General validation warnings
 *
 * Design: Non-blocking warnings - coach can always override. "Trust the coach" philosophy.
 */
export interface SeatWarningBadgeProps {
  warnings: SeatWarning[];
  className?: string;
}

export function SeatWarningBadge({ warnings, className = '' }: SeatWarningBadgeProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const warningCount = warnings.length;
  const warningMessages = warnings.map((w) => w.message).join('\n');

  return (
    <div
      className={`
        absolute -top-1.5 -right-1.5 z-10
        flex items-center justify-center
        w-5 h-5 rounded-full
        bg-amber-500 text-amber-900
        text-xs font-semibold
        shadow-sm
        cursor-help
        ${className}
      `}
      title={warningMessages}
    >
      {warningCount === 1 ? (
        <AlertTriangle size={12} strokeWidth={2.5} />
      ) : (
        <span>{warningCount}</span>
      )}
    </div>
  );
}

export default SeatWarningBadge;
