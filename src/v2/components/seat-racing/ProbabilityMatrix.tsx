import { useMemo } from 'react';
import { useProbabilityMatrix } from '../../hooks/useAdvancedRankings';

interface ProbabilityMatrixProps {
  onCellClick?: (athlete1Id: string, athlete2Id: string, probability: number) => void;
  maxSize?: number; // Limit matrix size for readability
}

export function ProbabilityMatrix({
  onCellClick,
  maxSize = 15
}: ProbabilityMatrixProps) {
  const { matrix, athletes, isLoading, error } = useProbabilityMatrix();

  // Limit to maxSize athletes (top ranked)
  const displayData = useMemo(() => {
    const displayAthletes = athletes.slice(0, maxSize);
    const displayMatrix = matrix.slice(0, maxSize).map(row => row.slice(0, maxSize));
    return { athletes: displayAthletes, matrix: displayMatrix };
  }, [matrix, athletes, maxSize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-secondary rounded-lg">
        <div className="text-txt-secondary">Loading probability matrix...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-secondary rounded-lg">
        <div className="text-red-500">Failed to load probability matrix</div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-secondary rounded-lg">
        <div className="text-txt-secondary">No comparison data available</div>
      </div>
    );
  }

  const { athletes: displayAthletes, matrix: displayMatrix } = displayData;

  return (
    <div className="space-y-4">
      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-txt-secondary bg-surface-secondary sticky left-0 z-10">
                P(row beats col)
              </th>
              {displayAthletes.map((athlete) => (
                <th
                  key={athlete.id}
                  className="p-1 text-center text-xs font-medium text-txt-secondary bg-surface-secondary"
                  style={{ minWidth: '60px' }}
                >
                  <div className="truncate" title={`${athlete.firstName} ${athlete.lastName}`}>
                    {athlete.firstName?.[0]}{athlete.lastName?.[0] || ''}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayAthletes.map((rowAthlete, rowIdx) => (
              <tr key={rowAthlete.id}>
                <td className="p-2 text-xs font-medium text-txt-primary bg-surface-secondary sticky left-0 z-10 whitespace-nowrap">
                  {rowAthlete.firstName} {rowAthlete.lastName?.[0]}.
                </td>
                {displayMatrix[rowIdx]?.map((probability, colIdx) => (
                  <td
                    key={colIdx}
                    className="p-1 text-center cursor-pointer hover:ring-2 hover:ring-accent-primary transition-all"
                    style={{
                      backgroundColor: getCellColor(probability, rowIdx === colIdx)
                    }}
                    onClick={() => {
                      if (rowIdx !== colIdx && onCellClick) {
                        onCellClick(
                          displayAthletes[rowIdx].id,
                          displayAthletes[colIdx].id,
                          probability
                        );
                      }
                    }}
                    title={rowIdx === colIdx
                      ? 'Self'
                      : `P(${rowAthlete.firstName} beats ${displayAthletes[colIdx].firstName}) = ${(probability * 100).toFixed(0)}%`
                    }
                  >
                    <span className={`text-xs font-mono ${getTextColor(probability)}`}>
                      {rowIdx === colIdx ? '—' : `${(probability * 100).toFixed(0)}`}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-txt-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCellColor(0.2, false) }} />
          <span>20% (unlikely to win)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCellColor(0.5, false) }} />
          <span>50% (toss-up)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCellColor(0.8, false) }} />
          <span>80% (likely to win)</span>
        </div>
      </div>

      {/* Truncation notice */}
      {athletes.length > maxSize && (
        <p className="text-center text-xs text-txt-secondary">
          Showing top {maxSize} athletes. Full roster has {athletes.length} athletes.
        </p>
      )}
    </div>
  );
}

/**
 * Get cell background color based on probability
 * Uses blue-white-orange diverging scale
 * 0.5 = white (toss-up), <0.5 = blue (likely to lose), >0.5 = orange (likely to win)
 */
function getCellColor(probability: number, isDiagonal: boolean): string {
  if (isDiagonal) return '#f3f4f6'; // gray for diagonal

  // Diverging color scale
  if (probability < 0.5) {
    // Blue scale (losing probability)
    const intensity = (0.5 - probability) * 2; // 0 at 0.5, 1 at 0
    return `rgba(59, 130, 246, ${0.1 + intensity * 0.5})`;
  } else {
    // Orange scale (winning probability)
    const intensity = (probability - 0.5) * 2; // 0 at 0.5, 1 at 1.0
    return `rgba(249, 115, 22, ${0.1 + intensity * 0.5})`;
  }
}

/**
 * Get text color for contrast
 */
function getTextColor(probability: number): string {
  if (probability < 0.3 || probability > 0.7) {
    return 'text-white';
  }
  return 'text-gray-700';
}

export default ProbabilityMatrix;
