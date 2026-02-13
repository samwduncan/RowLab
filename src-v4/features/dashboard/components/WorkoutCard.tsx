/**
 * Individual workout summary card with source icon, metrics, and relative date.
 * Displays workout type/machine, distance, duration, and pace in compact layout.
 * Ref: DASH-02 (recent workouts).
 */

import { useNavigate } from '@tanstack/react-router';
import { PenLine, Dumbbell, Bike, Watch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDistance, formatDuration, formatPace, formatRelativeDate } from '@/lib/format';
import type { Workout } from '../types';

// TODO(phase-47): Create workout detail route /workouts/$workoutId

interface WorkoutCardProps {
  workout: Workout;
  className?: string;
}

const sourceConfig: Record<Workout['source'], { icon: LucideIcon; colorClass: string }> = {
  manual: { icon: PenLine, colorClass: 'text-ink-secondary' },
  concept2: { icon: Dumbbell, colorClass: 'text-accent-copper' },
  strava: { icon: Bike, colorClass: 'text-data-warning' },
  garmin: { icon: Watch, colorClass: 'text-data-good' },
};

const machineDisplayMap: Record<string, string> = {
  rower: 'Row',
  bikerg: 'Bike',
  skierg: 'Ski',
};

function getWorkoutLabel(workout: Workout): string {
  if (workout.machineType) {
    return machineDisplayMap[workout.machineType] ?? workout.machineType;
  }
  if (workout.type) {
    return workout.type;
  }
  return 'Workout';
}

function MetricChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-ink-well px-2 py-0.5 rounded-md text-ink-secondary">
      {children}
    </span>
  );
}

export function WorkoutCard({ workout, className = '' }: WorkoutCardProps) {
  const navigate = useNavigate();
  const { icon: SourceIcon, colorClass } = sourceConfig[workout.source];
  const label = getWorkoutLabel(workout);

  const formattedDistance =
    workout.distanceM != null ? formatDistance(workout.distanceM, false) : null;
  const formattedDuration =
    workout.durationSeconds != null ? formatDuration(workout.durationSeconds) : null;
  const formattedPace = workout.avgPace != null ? `${formatPace(workout.avgPace)}/500m` : null;

  const handleClick = () => {
    navigate({ to: `/workouts/${workout.id}` as '/' });
  };

  return (
    <GlassCard padding="sm" hover className={`cursor-pointer ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 w-full text-left"
        aria-label={`${label} workout on ${formatRelativeDate(workout.date)}`}
      >
        {/* Source icon */}
        <div
          className="w-8 h-8 rounded-full bg-ink-well flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <SourceIcon size={16} className={colorClass} />
        </div>

        {/* Center info */}
        <div className="flex-1 min-w-0">
          {/* Top line: workout type + date */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink-primary truncate">{label}</span>
            <span className="text-xs text-ink-tertiary shrink-0">
              {formatRelativeDate(workout.date)}
            </span>
          </div>

          {/* Bottom line: metric chips */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {formattedDistance && <MetricChip>{formattedDistance}</MetricChip>}
            {formattedDuration && <MetricChip>{formattedDuration}</MetricChip>}
            {formattedPace && <MetricChip>{formattedPace}</MetricChip>}
          </div>
        </div>
      </button>
    </GlassCard>
  );
}
