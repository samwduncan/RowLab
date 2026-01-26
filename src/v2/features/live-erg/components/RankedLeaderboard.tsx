// src/v2/features/live-erg/components/RankedLeaderboard.tsx
// Ranked table view of athletes sorted by performance metrics

import { motion } from 'framer-motion';
import type { LiveErgData } from '../../../types/live-erg';
import { formatPace, formatDistance, STATUS_COLORS } from '../../../types/live-erg';

export type SortMetric = 'pace' | 'distance' | 'watts';

interface RankedLeaderboardProps {
  athletes: LiveErgData[];
  sortBy?: SortMetric;
}

export function RankedLeaderboard({
  athletes,
  sortBy = 'pace',
}: RankedLeaderboardProps) {
  // Sort athletes (active first, then by metric)
  const sorted = [...athletes].sort((a, b) => {
    // Pending/resting at bottom
    if (a.status === 'pending' && b.status !== 'pending') return 1;
    if (a.status !== 'pending' && b.status === 'pending') return -1;

    // Sort by selected metric
    switch (sortBy) {
      case 'distance':
        return b.distance - a.distance; // Higher distance is better
      case 'watts':
        return b.watts - a.watts; // Higher watts is better
      case 'pace':
      default:
        return a.pace - b.pace; // Lower pace is better
    }
  });

  // Calculate rank (only for non-pending athletes)
  let currentRank = 0;

  if (sorted.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-bdr-default p-8 text-center">
        <p className="text-txt-muted">No athletes in session yet</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-lg border border-bdr-default overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bdr-default bg-surface-default">
            <th className="px-4 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-txt-muted uppercase tracking-wider">
              Athlete
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-txt-muted uppercase tracking-wider">
              Pace
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-txt-muted uppercase tracking-wider">
              Watts
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-txt-muted uppercase tracking-wider">
              Distance
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-txt-muted uppercase tracking-wider">
              Rate
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-txt-muted uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((athlete) => {
            const isPending = athlete.status === 'pending';
            if (!isPending) currentRank++;

            return (
              <motion.tr
                key={athlete.athleteId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-bdr-default last:border-0 hover:bg-surface-hover transition-colors"
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  {!isPending && (
                    <span
                      className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-sm
                      ${
                        currentRank <= 3
                          ? 'bg-accent-primary/20 text-accent-primary font-bold'
                          : 'text-txt-secondary'
                      }`}
                    >
                      {currentRank}
                    </span>
                  )}
                  {isPending && (
                    <span className="text-txt-muted">-</span>
                  )}
                </td>

                {/* Athlete Name */}
                <td className="px-4 py-3 font-medium text-txt-primary">
                  {athlete.athleteName}
                </td>

                {/* Pace */}
                <td className="px-4 py-3 text-right font-mono text-txt-primary">
                  {!isPending ? formatPace(athlete.pace) : '-'}
                </td>

                {/* Watts */}
                <td className="px-4 py-3 text-right font-mono text-txt-primary">
                  {!isPending ? athlete.watts : '-'}
                </td>

                {/* Distance */}
                <td className="px-4 py-3 text-right font-mono text-txt-primary">
                  {!isPending ? formatDistance(athlete.distance) : '-'}
                </td>

                {/* Stroke Rate */}
                <td className="px-4 py-3 text-right font-mono text-txt-primary">
                  {!isPending ? `${athlete.strokeRate}` : '-'}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm capitalize ${STATUS_COLORS[athlete.status]}`}>
                    {athlete.status}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
