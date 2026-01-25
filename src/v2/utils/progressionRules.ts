import type { RaceResult } from '../types/regatta';

export type ProgressionRound = 'heat' | 'repechage' | 'semifinal' | 'final-a' | 'final-b' | 'final-c';

export type ProgressionRule = {
  id: string;
  name: string;
  fromRound: ProgressionRound;
  toRound: ProgressionRound;
  qualifyCount: number; // Top N advance
  condition?: string; // Human-readable condition
};

export type ProgressionResult = {
  qualifiers: string[]; // Team names advancing
  nonQualifiers: string[]; // Team names eliminated or to repechage
  suggestion: string; // Human-readable suggestion
};

// Standard progression patterns from World Rowing
export const STANDARD_PROGRESSIONS: Record<string, ProgressionRule[]> = {
  'direct-final': [
    {
      id: 'heat-to-final',
      name: 'Direct to Final',
      fromRound: 'heat',
      toRound: 'final-a',
      qualifyCount: 6,
      condition: 'All finishers advance to Final',
    },
  ],
  'heat-repechage': [
    {
      id: 'heat-to-final-top3',
      name: 'Top 3 to Final A',
      fromRound: 'heat',
      toRound: 'final-a',
      qualifyCount: 3,
    },
    {
      id: 'heat-to-rep',
      name: '4th+ to Repechage',
      fromRound: 'heat',
      toRound: 'repechage',
      qualifyCount: 99, // All remaining
    },
    {
      id: 'rep-to-final',
      name: 'Top 3 from Rep to Final A',
      fromRound: 'repechage',
      toRound: 'final-a',
      qualifyCount: 3,
    },
  ],
  'heat-semifinal': [
    {
      id: 'heat-to-semi',
      name: 'Top 3 to Semifinals',
      fromRound: 'heat',
      toRound: 'semifinal',
      qualifyCount: 3,
    },
    {
      id: 'semi-to-final-a',
      name: 'Top 3 to Final A',
      fromRound: 'semifinal',
      toRound: 'final-a',
      qualifyCount: 3,
    },
    {
      id: 'semi-to-final-b',
      name: '4-6 to Final B',
      fromRound: 'semifinal',
      toRound: 'final-b',
      qualifyCount: 3,
      condition: 'Places 4-6',
    },
  ],
  'ab-final': [
    {
      id: 'heat-to-final-a',
      name: 'Top 3 to Final A',
      fromRound: 'heat',
      toRound: 'final-a',
      qualifyCount: 3,
    },
    {
      id: 'heat-to-final-b',
      name: '4-6 to Final B',
      fromRound: 'heat',
      toRound: 'final-b',
      qualifyCount: 3,
      condition: 'Places 4-6',
    },
  ],
};

/**
 * Calculate which crews advance based on results and rules
 */
export function calculateProgression(
  results: Array<Pick<RaceResult, 'teamName' | 'place'>>,
  rule: ProgressionRule
): ProgressionResult {
  // Sort by place
  const sorted = [...results]
    .filter(r => r.place !== null)
    .sort((a, b) => (a.place || 0) - (b.place || 0));

  const qualifiers = sorted.slice(0, rule.qualifyCount).map(r => r.teamName);
  const nonQualifiers = sorted.slice(rule.qualifyCount).map(r => r.teamName);

  const suggestion =
    qualifiers.length > 0
      ? `Top ${qualifiers.length} advance to ${formatRoundName(rule.toRound)}`
      : 'No qualifiers based on results';

  return {
    qualifiers,
    nonQualifiers,
    suggestion,
  };
}

/**
 * Format round name for display
 */
export function formatRoundName(round: ProgressionRound): string {
  const names: Record<ProgressionRound, string> = {
    heat: 'Heat',
    repechage: 'Repechage',
    semifinal: 'Semifinal',
    'final-a': 'Final A',
    'final-b': 'Final B',
    'final-c': 'Final C',
  };
  return names[round] || round;
}

/**
 * Get standard progression options for UI
 */
export function getProgressionOptions(): Array<{ value: string; label: string; description: string }> {
  return [
    {
      value: 'direct-final',
      label: 'Direct to Final',
      description: 'All heats advance directly to final',
    },
    {
      value: 'heat-repechage',
      label: 'Heats + Repechage',
      description: 'Top 3 from heats + top from repechage to final',
    },
    {
      value: 'heat-semifinal',
      label: 'Heats + Semifinals',
      description: 'Top 3 from heats to semis, top from semis to finals',
    },
    {
      value: 'ab-final',
      label: 'A/B Finals',
      description: 'Top 3 to Final A, 4-6 to Final B',
    },
  ];
}

/**
 * Get progression rules by pattern name
 */
export function getProgressionRules(patternName: string): ProgressionRule[] {
  return STANDARD_PROGRESSIONS[patternName] || [];
}

/**
 * Determine next round for a team based on their place and progression pattern
 */
export function getNextRound(
  place: number,
  currentRound: ProgressionRound,
  patternName: string
): ProgressionRound | null {
  const rules = STANDARD_PROGRESSIONS[patternName];
  if (!rules) return null;

  for (const rule of rules) {
    if (rule.fromRound === currentRound) {
      if (place <= rule.qualifyCount) {
        return rule.toRound;
      }
      // Check for "rest to repechage" rule
      if (rule.qualifyCount === 99) {
        return rule.toRound;
      }
    }
  }

  return null;
}

/**
 * Get display color for a round
 */
export function getRoundColor(round: ProgressionRound): string {
  const colors: Record<ProgressionRound, string> = {
    heat: 'blue',
    repechage: 'amber',
    semifinal: 'purple',
    'final-a': 'green',
    'final-b': 'orange',
    'final-c': 'gray',
  };
  return colors[round] || 'gray';
}

/**
 * Validate if results match expected progression entry counts
 */
export function validateProgressionEntries(
  heatResults: number,
  expectedFinalSlots: number,
  patternName: string
): { valid: boolean; message: string } {
  const rules = STANDARD_PROGRESSIONS[patternName];
  if (!rules) {
    return { valid: false, message: 'Unknown progression pattern' };
  }

  // Direct final - needs exact match
  if (patternName === 'direct-final') {
    if (heatResults > expectedFinalSlots) {
      return { valid: false, message: `Too many entries (${heatResults}) for direct final (${expectedFinalSlots} slots)` };
    }
    return { valid: true, message: 'Direct final progression valid' };
  }

  // Other patterns - check if we have enough heats
  const minEntries = 7; // At least 7 entries for heat + repechage format
  if (heatResults >= minEntries) {
    return { valid: true, message: `${heatResults} entries - standard progression` };
  }

  return { valid: true, message: `${heatResults} entries - may use simplified progression` };
}
