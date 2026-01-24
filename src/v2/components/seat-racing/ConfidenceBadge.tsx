import { getConfidenceLevel, type ConfidenceLevel } from '@v2/types/seatRacing';

export interface ConfidenceBadgeProps {
  confidence: number | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

/**
 * Visual badge component that displays confidence level for ELO ratings.
 *
 * Confidence tiers:
 * - UNRATED (0 or null): gray
 * - PROVISIONAL (0-0.2): red
 * - LOW (0.2-0.4): orange
 * - MEDIUM (0.4-0.7): yellow
 * - HIGH (0.7+): green
 */
export function ConfidenceBadge({
  confidence,
  size = 'sm',
  showLabel = true,
}: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence);

  const styles: Record<ConfidenceLevel, { bg: string; text: string; dot: string }> = {
    UNRATED: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-600 dark:text-gray-400',
      dot: 'bg-gray-500',
    },
    PROVISIONAL: {
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      dot: 'bg-red-500',
    },
    LOW: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      dot: 'bg-orange-500',
    },
    MEDIUM: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
      dot: 'bg-yellow-500',
    },
    HIGH: {
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      dot: 'bg-green-500',
    },
  };

  const style = styles[level];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (!showLabel) {
    // Show only colored dot indicator
    return (
      <div
        className={`${style.dot} ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`}
        title={level}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} ${style.bg} ${style.text} rounded-full font-medium`}
    >
      <span className={`${style.dot} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full`} />
      {level}
    </span>
  );
}
