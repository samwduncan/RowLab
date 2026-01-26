import { useState } from 'react';
import { useSideRankings, useAthleteSideRatings } from '../../hooks/useCompositeRankings';
import type { Side } from '../../types/advancedRanking';
import { ConfidenceBadge } from './ConfidenceBadge';
import { getConfidenceLevel } from '../../types/seatRacing';

interface SideRankingsProps {
  onAthleteClick?: (athleteId: string) => void;
}

export function SideRankings({ onAthleteClick }: SideRankingsProps) {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const { rankings, isLoading, error } = useSideRankings(selectedSide);

  const sideOptions: Array<{ value: Side | null; label: string; color: string }> = [
    { value: null, label: 'Combined', color: 'bg-gray-500' },
    { value: 'Port', label: 'Port', color: 'bg-red-500' },
    { value: 'Starboard', label: 'Starboard', color: 'bg-green-500' },
    { value: 'Cox', label: 'Cox', color: 'bg-blue-500' },
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load side rankings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Side filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-txt-secondary">Filter by side:</span>
        <div className="flex gap-1">
          {sideOptions.map(option => (
            <button
              key={option.label}
              onClick={() => setSelectedSide(option.value)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedSide === option.value
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-secondary text-txt-secondary hover:bg-surface-hover'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${option.color}`} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-12 text-txt-secondary">
          No {selectedSide?.toLowerCase() || ''} rankings available.
          {selectedSide && ' Athletes may not have raced on this side yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-bdr-primary">
                <th className="px-4 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-txt-secondary uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-txt-secondary uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-txt-secondary uppercase tracking-wider">
                  Races
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bdr-secondary">
              {rankings.map((ranking, idx) => (
                <tr
                  key={ranking.athleteId}
                  className="hover:bg-surface-hover cursor-pointer transition-colors"
                  onClick={() => onAthleteClick?.(ranking.athleteId)}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-surface-secondary text-txt-secondary'
                    }`}>
                      {ranking.rank || idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ranking.athlete?.side && (
                        <span className={`w-2 h-2 rounded-full ${
                          ranking.athlete.side === 'Port' ? 'bg-red-500' :
                          ranking.athlete.side === 'Starboard' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                      )}
                      <span className="font-medium text-txt-primary">
                        {ranking.athlete?.firstName} {ranking.athlete?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-txt-primary">
                      {ranking.ratingValue?.toFixed(0) || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ConfidenceBadge
                      confidence={ranking.confidenceScore}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-txt-secondary">
                    {ranking.racesCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Side explanation */}
      {selectedSide && (
        <div className="p-3 bg-surface-secondary rounded-lg text-sm text-txt-secondary">
          <strong>{selectedSide} rankings</strong> show ELO ratings calculated only from races
          where athletes rowed on the {selectedSide.toLowerCase()} side. Athletes who row both sides
          have separate ratings for each.
        </div>
      )}
    </div>
  );
}

export default SideRankings;
