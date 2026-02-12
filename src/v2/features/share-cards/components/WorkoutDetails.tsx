/**
 * WorkoutDetails - Detailed workout data for share page
 * Phase 38-07
 *
 * Features:
 * - Summary metrics row
 * - Splits table
 * - Handles missing data gracefully
 * - Canvas design tokens
 */

import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

interface WorkoutDetailsProps {
  workoutId: string;
}

interface Workout {
  id: string;
  c2Id: string;
  athleteId: string;
  date: string;
  type: string;
  distance: number;
  timeSeconds: number;
  avgPace: number;
  avgWatts: number;
  avgHeartRate: number | null;
  avgStrokeRate: number | null;
  splits?: Array<{
    distance: number;
    timeSeconds: number;
    pace: number;
    watts: number;
    heartRate: number | null;
    strokeRate: number | null;
  }>;
}

/**
 * Format time in seconds to MM:SS.T
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Format pace (tenths of seconds per 500m) to M:SS.T/500m
 */
function formatPace(tenthsPerSecond: number): string {
  const totalSeconds = tenthsPerSecond / 10;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * WorkoutDetails - Main component
 */
export function WorkoutDetails({ workoutId }: WorkoutDetailsProps) {
  const {
    data: workout,
    isLoading,
    error,
  } = useQuery<Workout>({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/workouts/${workoutId}`);
      return data.data;
    },
    enabled: !!workoutId,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="space-y-4">
          <div className="h-24 bg-bg-surface-elevated/30 rounded-lg animate-pulse" />
          <div className="h-64 bg-bg-surface-elevated/30 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return null;
  }

  const hasHeartRate = workout.avgHeartRate != null;
  const hasStrokeRate = workout.avgStrokeRate != null;
  const hasSplits = workout.splits && workout.splits.length > 0;

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Summary Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Workout Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Time */}
          <div className="text-center">
            <div className="text-sm text-txt-secondary mb-1">Time</div>
            <div className="text-xl font-mono font-semibold text-txt-primary">
              {formatTime(workout.timeSeconds)}
            </div>
          </div>

          {/* Pace */}
          <div className="text-center">
            <div className="text-sm text-txt-secondary mb-1">Avg Pace</div>
            <div className="text-xl font-mono font-semibold text-txt-primary">
              {formatPace(workout.avgPace)}
            </div>
          </div>

          {/* Watts */}
          <div className="text-center">
            <div className="text-sm text-txt-secondary mb-1">Avg Watts</div>
            <div className="text-xl font-mono font-semibold text-txt-primary">
              {workout.avgWatts.toFixed(0)}W
            </div>
          </div>

          {/* Distance */}
          <div className="text-center">
            <div className="text-sm text-txt-secondary mb-1">Distance</div>
            <div className="text-xl font-mono font-semibold text-txt-primary">
              {workout.distance.toLocaleString()}m
            </div>
          </div>

          {/* Heart Rate */}
          {hasHeartRate && (
            <div className="text-center">
              <div className="text-sm text-txt-secondary mb-1">Avg HR</div>
              <div className="text-xl font-mono font-semibold text-txt-primary">
                {workout.avgHeartRate}bpm
              </div>
            </div>
          )}

          {/* Stroke Rate */}
          {hasStrokeRate && (
            <div className="text-center">
              <div className="text-sm text-txt-secondary mb-1">Avg S/M</div>
              <div className="text-xl font-mono font-semibold text-txt-primary">
                {workout.avgStrokeRate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Splits Table */}
      {hasSplits && (
        <div>
          <h3 className="text-base font-semibold text-txt-primary mb-3">Splits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bdr-subtle">
                  <th className="text-left py-2 px-3 text-txt-secondary font-medium">Split</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">Distance</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">Time</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">Pace</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">Watts</th>
                  {hasHeartRate && (
                    <th className="text-right py-2 px-3 text-txt-secondary font-medium">HR</th>
                  )}
                  {hasStrokeRate && (
                    <th className="text-right py-2 px-3 text-txt-secondary font-medium">S/M</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {workout.splits.map((split, index) => (
                  <tr key={index} className="border-b border-bdr-subtle/50">
                    <td className="py-2 px-3 text-txt-primary font-medium">{index + 1}</td>
                    <td className="py-2 px-3 text-right font-mono text-txt-primary">
                      {split.distance}m
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-txt-primary">
                      {formatTime(split.timeSeconds)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-txt-primary">
                      {formatPace(split.pace)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-txt-primary">
                      {split.watts.toFixed(0)}W
                    </td>
                    {hasHeartRate && (
                      <td className="py-2 px-3 text-right font-mono text-txt-primary">
                        {split.heartRate ?? '-'}
                      </td>
                    )}
                    {hasStrokeRate && (
                      <td className="py-2 px-3 text-right font-mono text-txt-primary">
                        {split.strokeRate ?? '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
