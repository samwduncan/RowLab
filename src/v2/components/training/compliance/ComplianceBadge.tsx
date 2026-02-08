// src/v2/components/training/compliance/ComplianceBadge.tsx

import { Shield } from 'lucide-react';

type ComplianceStatus = 'ok' | 'warning' | 'violation';
type BadgeSize = 'sm' | 'md' | 'lg';

interface ComplianceBadgeProps {
  weeklyHours: number;
  limit?: number;
  size?: BadgeSize;
  showHours?: boolean;
  className?: string;
}

function getStatus(hours: number, limit: number): ComplianceStatus {
  if (hours >= limit) return 'violation';
  if (hours >= limit * 0.9) return 'warning';
  return 'ok';
}

const STATUS_STYLES: Record<ComplianceStatus, string> = {
  ok: 'bg-[var(--data-excellent)]/10 text-[var(--data-excellent)] border-[var(--data-excellent)]/30',
  warning: 'bg-[var(--data-warning)]/10 text-[var(--data-warning)] border-[var(--data-warning)]/30',
  violation: 'bg-[var(--data-poor)]/10 text-[var(--data-poor)] border-[var(--data-poor)]/30',
};

const SIZE_STYLES: Record<BadgeSize, { container: string; icon: number; text: string }> = {
  sm: { container: 'px-2 py-0.5 gap-1', icon: 12, text: 'text-xs' },
  md: { container: 'px-3 py-1 gap-1.5', icon: 14, text: 'text-sm' },
  lg: { container: 'px-4 py-1.5 gap-2', icon: 16, text: 'text-base' },
};

/**
 * NCAA compliance status badge.
 * Shows green (safe), yellow (approaching limit), or red (over limit)
 * with current weekly hours and remaining hours when in warning range.
 */
export function ComplianceBadge({
  weeklyHours,
  limit = 20,
  size = 'md',
  showHours = true,
  className = '',
}: ComplianceBadgeProps) {
  const status = getStatus(weeklyHours, limit);
  const sizeConfig = SIZE_STYLES[size];
  const remaining = Math.max(0, limit - weeklyHours);
  const displayHours = Math.round(weeklyHours * 10) / 10;

  return (
    <div
      className={`inline-flex items-center rounded-full border font-medium
        ${STATUS_STYLES[status]} ${sizeConfig.container} ${sizeConfig.text} ${className}`}
      title={`NCAA Weekly Hours: ${displayHours}h / ${limit}h`}
    >
      <Shield size={sizeConfig.icon} className="flex-shrink-0" />
      {showHours && (
        <span className="font-mono whitespace-nowrap">
          {displayHours}h / {limit}h
          {status === 'warning' && <span className="opacity-70 ml-1">({remaining}h left)</span>}
        </span>
      )}
    </div>
  );
}

export default ComplianceBadge;
