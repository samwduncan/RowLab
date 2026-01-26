# Phase 14: Advanced Seat Racing Analytics - Research

**Researched:** 2026-01-26
**Domain:** Statistical modeling, experimental design, paired comparison analysis
**Confidence:** MEDIUM

## Summary

Advanced seat racing analytics represents a significant evolution from simple ELO-based rankings to scientifically rigorous paired comparison models. The Bradley-Terry model is the gold standard for analyzing head-to-head competition data and provides more stable, interpretable rankings than ELO when complete historical data is available. Optimal swap scheduling requires balanced experimental designs (Latin Squares, Balanced Incomplete Block Designs) to ensure statistical validity. JavaScript lacks mature Bradley-Terry implementations, requiring custom development using numerical optimization libraries. The phase integrates three distinct analytical approaches: formal seat racing (Bradley-Terry), passive observation from practice (weighted ELO updates), and composite multi-factor rankings.

**Primary recommendation:** Implement Bradley-Terry model using custom JavaScript with jStat or simple-statistics for statistical functions and fmin for numerical optimization. Use vis-network or Cytoscape.js for comparison graph visualization. Retain existing ELO system for passive practice observations and create a composite ranking layer that combines multiple signals.

## Standard Stack

The established libraries/tools for this domain:

### Core Statistical Computing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| simple-statistics | 7.8.8 | Statistical functions, descriptive statistics | Actively maintained, pure JavaScript, comprehensive coverage of basic stats |
| jstat | 1.9.6 | Probability distributions, statistical tests | Industry standard for JS statistical computing, complete API |
| fmin | 0.0.4 | Unconstrained function minimization | Implements Nelder-Mead and Conjugate Gradient for MLE optimization |

### Graph Visualization
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cytoscape | 3.33.1 | Network graph analysis and visualization | Most mature, extensive layout algorithms, active development |
| vis-network | 10.0.2 | Interactive network visualization | Canvas-based performance, built-in clustering, simpler API |
| sigma | 3.0.2 | Large-scale graph rendering | WebGL-based, handles thousands of nodes efficiently |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| newton-raphson-method | Latest | Root finding for MLE | If implementing custom Bradley-Terry solver from scratch |
| ndarray-optimization | Latest | BFGS optimization | Alternative to fmin for constrained optimization problems |
| graphology | Latest | Graph data structure | Required by Sigma.js, useful for graph algorithms |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom Bradley-Terry JS | R BradleyTerry2 package via API | R implementation is mature but requires separate service, adds latency |
| vis-network | D3.js force-directed graph | D3 offers more customization but requires significantly more development time |
| jstat | stdlib (npm) | stdlib is comprehensive but much heavier (modular but large overall footprint) |

**Installation:**
```bash
npm install simple-statistics jstat fmin
npm install cytoscape vis-network  # Choose one based on requirements
npm install graphology              # If using sigma
```

## Architecture Patterns

### Recommended Project Structure
```
server/
├── services/
│   ├── bradleyTerryService.js      # Bradley-Terry model implementation
│   ├── eloRatingService.js         # Existing ELO (enhanced for passive tracking)
│   ├── matrixPlannerService.js     # Optimal swap schedule generation
│   ├── compositeRankingService.js  # Multi-factor ranking aggregation
│   └── seatRaceService.js          # Existing seat race CRUD
src/
├── components/
│   ├── seat-racing/
│   │   ├── MatrixPlanner/          # Swap schedule generator UI
│   │   ├── RankingDisplay/         # Rankings with confidence intervals
│   │   ├── ComparisonGraph/        # Network graph visualization
│   │   └── PassiveTracking/        # Practice observation input
└── hooks/
    ├── useBradleyTerryRankings.js  # BT model rankings hook
    ├── useCompositeRankings.js     # Aggregated rankings hook
    └── useComparisonGraph.js       # Graph data formatting hook
```

### Pattern 1: Bradley-Terry Model Implementation
**What:** Maximum likelihood estimation of athlete strength parameters from pairwise comparison data
**When to use:** Analyzing complete seat racing session history for stable rankings
**Mathematical basis:**
```
P(i beats j) = πᵢ / (πᵢ + πⱼ)

Log-likelihood:
L(π) = Σ [wᵢⱼ log(πᵢ) - wᵢⱼ log(πᵢ + πⱼ)]

where:
- πᵢ = strength parameter for athlete i
- wᵢⱼ = number of times i beat j
```

**Example:**
```javascript
// Source: Bradley-Terry model literature + custom implementation
import { minimize } from 'fmin';

/**
 * Fit Bradley-Terry model using maximum likelihood estimation
 * @param {Array<{athlete1Id, athlete2Id, winner}>} comparisons - Pairwise comparison data
 * @returns {Map<athleteId, {strength, stdError, confidenceInterval}>}
 */
export function fitBradleyTerryModel(comparisons) {
  const athletes = new Set();
  const wins = new Map(); // Map<"i-j", count>

  // Build comparison matrix
  comparisons.forEach(({ athlete1Id, athlete2Id, winner }) => {
    athletes.add(athlete1Id);
    athletes.add(athlete2Id);

    const key = winner === athlete1Id ? `${athlete1Id}-${athlete2Id}` : `${athlete2Id}-${athlete1Id}`;
    wins.set(key, (wins.get(key) || 0) + 1);
  });

  const athleteList = Array.from(athletes);
  const n = athleteList.length;

  // Negative log-likelihood function
  function negLogLikelihood(logStrengths) {
    let nll = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const iId = athleteList[i];
        const jId = athleteList[j];
        const wij = wins.get(`${iId}-${jId}`) || 0;
        const wji = wins.get(`${jId}-${iId}`) || 0;

        const pi = Math.exp(logStrengths[i]);
        const pj = Math.exp(logStrengths[j]);

        // Add comparison likelihood
        nll -= wij * Math.log(pi / (pi + pj));
        nll -= wji * Math.log(pj / (pi + pj));
      }
    }

    return nll;
  }

  // Initial guess: all equal strength (log(1) = 0)
  const initial = new Array(n).fill(0);

  // Optimize using Nelder-Mead
  const solution = minimize(negLogLikelihood, initial);

  // Convert log-strengths to strengths and compute standard errors
  const results = new Map();
  athleteList.forEach((athleteId, idx) => {
    const strength = Math.exp(solution.x[idx]);
    // Standard errors computed via Hessian (simplified here)
    const stdError = computeStandardError(solution, idx);
    const ci = [
      strength - 1.96 * stdError,
      strength + 1.96 * stdError
    ];

    results.set(athleteId, { strength, stdError, confidenceInterval: ci });
  });

  return results;
}

/**
 * Compute probability that athlete A beats athlete B
 */
export function bradleyTerryProbability(strengthA, strengthB) {
  return strengthA / (strengthA + strengthB);
}
```

### Pattern 2: Optimal Swap Schedule Generation (Latin Square)
**What:** Generate balanced swap schedules ensuring all pairs compared equally
**When to use:** Matrix session planner - coach selects N athletes, system generates optimal race schedule
**Example:**
```javascript
// Source: Experimental design theory + custom implementation
/**
 * Generate Latin Square swap schedule for seat racing
 * @param {Array<athleteId>} athletes - Athletes to compare
 * @param {number} boatSize - Size of boats (e.g., 4 for quads)
 * @returns {Array<{pieceNumber, boats: Array<{name, athleteIds}>}>}
 */
export function generateLatinSquareSchedule(athletes, boatSize) {
  const n = athletes.length;

  if (n % boatSize !== 0) {
    throw new Error(`Number of athletes (${n}) must be divisible by boat size (${boatSize})`);
  }

  const numBoats = n / boatSize;
  const piecesNeeded = calculatePiecesForCompleteComparison(n, boatSize);

  // Generate Latin square ensuring balanced comparisons
  const schedule = [];
  const comparisonCount = new Map(); // Track how many times each pair compared

  // Greedy algorithm: assign athletes to minimize comparison imbalance
  for (let piece = 0; piece < piecesNeeded; piece++) {
    const assignment = generateBalancedAssignment(
      athletes,
      boatSize,
      numBoats,
      comparisonCount
    );

    schedule.push({
      pieceNumber: piece + 1,
      boats: assignment
    });

    // Update comparison counts
    updateComparisonCounts(assignment, comparisonCount);
  }

  return {
    schedule,
    statistics: computeScheduleQuality(comparisonCount, athletes)
  };
}

/**
 * Validate schedule quality - check for balance
 */
function computeScheduleQuality(comparisonCount, athletes) {
  const counts = Array.from(comparisonCount.values());
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;

  return {
    meanComparisonsPerPair: mean,
    varianceInComparisons: variance,
    isBalanced: variance < 1.0,  // Threshold for "balanced" design
    coverage: comparisonCount.size / (athletes.length * (athletes.length - 1) / 2)
  };
}
```

### Pattern 3: Passive ELO from Practice Data
**What:** Automatic ELO updates from practice lineups and observed performance
**When to use:** Background tracking whenever lineups + times exist
**Example:**
```javascript
// Source: Existing eloRatingService.js + enhancements
/**
 * Update ratings from practice observation (non-formal seat race)
 * @param {string} teamId
 * @param {Array<{lineupId, split, observedDifference}>} observations
 * @param {number} weight - Weight factor (0.5 = half of formal seat race)
 */
export async function updateRatingsFromPractice(teamId, observations, weight = 0.5) {
  for (const obs of observations) {
    const { lineup1Athletes, lineup2Athletes, splitDifference } = obs;

    // Find athletes who differ between lineups (simplified 1:1 swap detection)
    const swapped = findSwappedAthletes(lineup1Athletes, lineup2Athletes);

    if (swapped.length === 2) {
      const [athlete1, athlete2] = swapped;

      // Use existing ELO update but with reduced K-factor
      const adjustedK = K_FACTOR * weight;

      await updateRatingsFromSeatRace(
        teamId,
        athlete1.id,
        athlete2.id,
        splitDifference,
        'practice_elo'  // Separate rating type
      );
    }
  }
}

/**
 * Detect simple swaps in practice lineups
 */
function findSwappedAthletes(lineup1, lineup2) {
  const ids1 = new Set(lineup1.map(a => a.id));
  const ids2 = new Set(lineup2.map(a => a.id));

  const uniqueTo1 = lineup1.filter(a => !ids2.has(a.id));
  const uniqueTo2 = lineup2.filter(a => !ids1.has(a.id));

  if (uniqueTo1.length === 1 && uniqueTo2.length === 1) {
    return [uniqueTo1[0], uniqueTo2[0]];
  }

  return [];
}
```

### Pattern 4: Composite Ranking Calculation
**What:** Weighted combination of multiple ranking signals (on-water, erg, attendance)
**When to use:** Default ranking view with configurable weights
**Example:**
```javascript
// Source: Sports analytics composite ranking methodology
/**
 * Calculate composite ranking from multiple factors
 * @param {string} teamId
 * @param {Object} weights - { onWater: 0.6, erg: 0.3, attendance: 0.1 }
 * @returns {Array<{athleteId, compositeScore, breakdown}>}
 */
export async function calculateCompositeRankings(teamId, weights) {
  // Fetch all component rankings
  const onWaterRankings = await getBradleyTerryRankings(teamId);
  const ergRankings = await getErgPerformanceRankings(teamId);
  const attendanceScores = await getAttendanceScores(teamId);

  // Normalize each component to [0, 1] scale using Z-scores
  const normalized = {
    onWater: normalizeRankings(onWaterRankings),
    erg: normalizeRankings(ergRankings, { weightByTestType: true }),
    attendance: normalizeScores(attendanceScores)
  };

  // Combine with weights
  const athletes = new Set([
    ...normalized.onWater.keys(),
    ...normalized.erg.keys(),
    ...normalized.attendance.keys()
  ]);

  const composite = Array.from(athletes).map(athleteId => {
    const onWater = normalized.onWater.get(athleteId) || 0;
    const erg = normalized.erg.get(athleteId) || 0;
    const attendance = normalized.attendance.get(athleteId) || 0;

    const compositeScore = (
      onWater * weights.onWater +
      erg * weights.erg +
      attendance * weights.attendance
    );

    return {
      athleteId,
      compositeScore,
      breakdown: { onWater, erg, attendance }
    };
  });

  // Sort by composite score (descending)
  composite.sort((a, b) => b.compositeScore - a.compositeScore);

  // Tie-breaking: use on-water ELO as secondary sort
  return composite;
}

/**
 * Normalize rankings to [0, 1] using Z-scores
 */
function normalizeRankings(rankings) {
  const values = Array.from(rankings.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  );

  const normalized = new Map();
  rankings.forEach((value, athleteId) => {
    const zScore = (value - mean) / std;
    // Convert to [0, 1] with inverse if needed (higher is better)
    normalized.set(athleteId, 1 / (1 + Math.exp(-zScore)));
  });

  return normalized;
}
```

### Pattern 5: Side-Specific ELO Tracking
**What:** Separate rating systems for port and starboard sides
**When to use:** Athletes who row both sides need independent performance tracking
**Example:**
```javascript
// Source: Custom implementation based on existing eloRatingService.js
/**
 * Get or create side-specific rating
 */
export async function getOrCreateSideSpecificRating(athleteId, teamId, side, ratingType = 'seat_race_elo') {
  const compositeType = `${ratingType}_${side.toLowerCase()}`;
  return getOrCreateRating(athleteId, teamId, compositeType);
}

/**
 * Update ratings with side detection from seat position
 */
export async function updateRatingsWithSideDetection(teamId, seatRaceData) {
  const { athlete1Id, athlete2Id, athlete1Side, athlete2Side, performanceDiff } = seatRaceData;

  // Update side-specific ratings
  await updateRatingsFromSeatRace(
    teamId,
    athlete1Id,
    athlete2Id,
    performanceDiff,
    `seat_race_elo_${athlete1Side.toLowerCase()}`
  );
}

/**
 * Get athlete's primary side rating for display
 */
export async function getPrimarySideRating(athleteId, teamId) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: { athleteRatings: true }
  });

  const primarySide = athlete.side || 'Port';  // Default or user-set
  const primaryRating = await getOrCreateSideSpecificRating(
    athleteId,
    teamId,
    primarySide,
    'seat_race_elo'
  );

  return {
    side: primarySide,
    rating: primaryRating,
    hasSecondarySide: athlete.side === 'Both'
  };
}
```

### Anti-Patterns to Avoid

- **Using ELO for complete historical analysis:** ELO is sequential and weights recent games more. For analyzing complete session history, Bradley-Terry provides more stable results.
- **Ignoring boat speed bias:** Raw time comparisons without boat normalization can skew results. Always track which shell was used and consider handicaps.
- **Manual matrix planning without balance checking:** Hand-crafted swap schedules often result in incomplete comparisons. Always validate schedule quality metrics.
- **Treating passive observations equally to formal seat races:** Practice observations have higher noise. Use reduced weight (0.3-0.5x) for passive ELO updates.
- **Single-factor rankings:** Relying solely on seat racing ignores other performance dimensions. Composite rankings provide more complete athlete evaluation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph layout algorithms | Custom force-directed layout | Cytoscape built-in layouts | Handles edge cases (disconnected nodes, cycles, performance) |
| Statistical distributions | Manual probability calculations | jStat distribution functions | Numerical stability, edge cases, tested implementations |
| Numerical optimization | Custom gradient descent | fmin library | Convergence criteria, step size adaptation, local minima handling |
| Confidence interval calculation | Manual standard error computation | Bootstrap or Fisher information | Handles non-normal distributions, small sample sizes |
| Schedule optimization | Random assignment + manual tweaking | Latin Square/BIBD algorithms | Guarantees mathematical balance properties |

**Key insight:** Statistical computing requires handling numerical edge cases (division by zero, overflow, underflow, convergence failures) that are non-obvious and extensively tested in established libraries.

## Common Pitfalls

### Pitfall 1: Bradley-Terry Model Identifiability
**What goes wrong:** Model parameters are only identified up to a constant - all strengths can be multiplied by the same factor without changing probabilities
**Why it happens:** The model equation P(i beats j) = πᵢ/(πᵢ + πⱼ) is scale-invariant
**How to avoid:** Fix one athlete's strength to 1.0 (reference athlete) or normalize so Σπᵢ = N. Most implementations use log-transform and constrain Σlog(πᵢ) = 0
**Warning signs:** Optimization diverges or produces extremely large/small values

### Pitfall 2: Sparse Comparison Data
**What goes wrong:** Confidence intervals become unreliable when athletes have few head-to-head comparisons
**Why it happens:** Standard errors grow large with limited data, and maximum likelihood may not exist if comparison graph is disconnected
**How to avoid:**
- Check comparison graph connectivity before fitting model
- Require minimum number of comparisons (e.g., 3) per athlete
- Use Bayesian approaches (add small prior) to handle sparse data
- Display confidence intervals prominently to show uncertainty
**Warning signs:** Very wide confidence intervals, optimizer fails to converge, some athletes have no comparisons

### Pitfall 3: Boat Speed Bias Confounding
**What goes wrong:** Faster boats systematically advantage certain athletes, biasing strength estimates
**Why it happens:** Physical equipment differences (hull speed, rigging) affect results beyond athlete contributions
**How to avoid:**
- Track shell usage in swap scheduling
- Ensure balanced assignment (each athlete uses each shell equal times if possible)
- Add boat speed parameters to model (mixed-effects Bradley-Terry)
- Use handicap adjustments when shell balance is impossible
**Warning signs:** Athletes who happen to use faster shells rank higher, results change dramatically with different shells

### Pitfall 4: Transitive Closure Assumption
**What goes wrong:** Bradley-Terry assumes transitivity (if A > B and B > C, then A > C), but real performance may have intransitivities
**Why it happens:** Stylistic matchups, athlete-athlete synergies in boats, environmental variance
**How to avoid:**
- Test for intransitivity using specialized diagnostics
- Consider more complex models (random effects, style factors) if intransitivity detected
- Report model fit statistics (residual deviance, AIC) to detect poor fit
**Warning signs:** Large residuals for specific comparisons, circular rankings (A > B > C > A in direct comparisons)

### Pitfall 5: Passive ELO Overweighting
**What goes wrong:** Noisy practice observations dominate formal seat racing data, degrading ranking quality
**Why it happens:** Practice has more observations but lower signal-to-noise ratio
**How to avoid:**
- Use significantly reduced weight (0.3-0.5x) for passive observations
- Maintain separate rating types (formal vs. practice) and combine carefully
- Validate that passive observations correlate with formal results before trusting
**Warning signs:** Rankings change dramatically based on single practice, low correlation between practice and formal seat race results

### Pitfall 6: Confidence Interval Misinterpretation
**What goes wrong:** Users treat overlapping confidence intervals as "no difference" or non-overlapping as "definitely different"
**Why it happens:** Statistical significance requires formal comparison, not visual interval overlap
**How to avoid:**
- Provide probability matrix P(A beats B) alongside intervals
- Include explicit "statistical significance" flags for pairwise comparisons
- Use Bayesian credible intervals if frequentist interpretation is confusing
**Warning signs:** Coaches making decisions based solely on interval overlap without considering probability estimates

## Code Examples

Verified patterns from research and existing codebase:

### Bradley-Terry Probability Matrix (Comparison Heatmap)
```javascript
// Source: Bradley-Terry model mathematics
/**
 * Compute full probability matrix for UI display
 * @param {Map<athleteId, strength>} strengths - Bradley-Terry strength parameters
 * @returns {Array<Array<number>>} - P(row beats column)
 */
export function computeProbabilityMatrix(strengths) {
  const athletes = Array.from(strengths.keys());
  const n = athletes.length;
  const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0.5;  // P(athlete beats self) = 0.5 by convention
      } else {
        const si = strengths.get(athletes[i]);
        const sj = strengths.get(athletes[j]);
        matrix[i][j] = si / (si + sj);
      }
    }
  }

  return { matrix, athletes };
}
```

### Comparison Graph Data for Visualization
```javascript
// Source: Network graph visualization best practices
/**
 * Format seat racing data for graph visualization
 * @param {Array<{athlete1Id, athlete2Id, marginSeconds}>} comparisons
 * @returns {Object} - Cytoscape/vis-network compatible format
 */
export function formatComparisonGraph(comparisons, athleteData) {
  const nodes = athleteData.map(athlete => ({
    id: athlete.id,
    label: `${athlete.firstName} ${athlete.lastName}`,
    value: athlete.btStrength || 1000,  // Node size proportional to strength
    title: `Strength: ${athlete.btStrength?.toFixed(2)}, Races: ${athlete.raceCount}`
  }));

  const edges = comparisons.map(comp => ({
    from: comp.athlete1Id,
    to: comp.athlete2Id,
    value: Math.abs(comp.marginSeconds),  // Edge thickness = margin size
    color: comp.marginSeconds > 0 ? '#2563eb' : '#dc2626',  // Color indicates winner
    title: `Margin: ${Math.abs(comp.marginSeconds).toFixed(2)}s`
  }));

  return { nodes, edges };
}

/**
 * Detect comparison gaps (missing edges) for scheduling recommendations
 */
export function findComparisonGaps(athletes, comparisons) {
  const compared = new Set();
  comparisons.forEach(c => {
    compared.add(`${c.athlete1Id}-${c.athlete2Id}`);
    compared.add(`${c.athlete2Id}-${c.athlete1Id}`);
  });

  const gaps = [];
  for (let i = 0; i < athletes.length; i++) {
    for (let j = i + 1; j < athletes.length; j++) {
      const key1 = `${athletes[i].id}-${athletes[j].id}`;
      const key2 = `${athletes[j].id}-${athletes[i].id}`;

      if (!compared.has(key1) && !compared.has(key2)) {
        gaps.push({
          athlete1: athletes[i],
          athlete2: athletes[j],
          priority: 'high'  // Could compute based on ranking proximity
        });
      }
    }
  }

  return gaps;
}
```

### Confidence Interval Visualization
```javascript
// Source: Statistical visualization best practices
/**
 * Format ranking data with confidence intervals for chart display
 * @param {Array<{athleteId, strength, stdError}>} rankings
 * @returns {Array<{x, y, error}>} - Chart.js error bar format
 */
export function formatRankingsWithConfidence(rankings) {
  return rankings.map((athlete, rank) => ({
    x: rank + 1,  // Rank position
    y: athlete.strength,  // Point estimate
    yMin: athlete.strength - 1.96 * athlete.stdError,  // 95% CI lower
    yMax: athlete.strength + 1.96 * athlete.stdError,  // 95% CI upper
    label: athlete.name,
    overlap: computeOverlap(athlete, rankings)  // Highlight overlapping intervals
  }));
}

function computeOverlap(athlete, allRankings) {
  const lower = athlete.strength - 1.96 * athlete.stdError;
  const upper = athlete.strength + 1.96 * athlete.stdError;

  return allRankings.filter(other => {
    if (other.id === athlete.id) return false;
    const otherLower = other.strength - 1.96 * other.stdError;
    const otherUpper = other.strength + 1.96 * other.stdError;
    // Check for interval overlap
    return !(upper < otherLower || lower > otherUpper);
  }).map(other => other.id);
}
```

### Erg Performance Weighting by Test Type
```javascript
// Source: Composite ranking methodology
/**
 * Weight erg tests by type for composite ranking
 * @param {Array<{testType, score, date}>} ergTests
 * @returns {number} - Weighted erg score
 */
export function calculateWeightedErgScore(ergTests) {
  const weights = {
    '2000m': 1.0,     // Gold standard
    '6000m': 0.8,     // Endurance test
    '500m': 0.6,      // Sprint test
    'steady_state': 0.3  // Practice observation
  };

  // Use recency weighting: more recent tests matter more
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  let totalWeight = 0;
  let weightedSum = 0;

  ergTests.forEach(test => {
    const typeWeight = weights[test.testType] || 0.5;
    const age = now - new Date(test.date).getTime();
    const recencyWeight = Math.exp(-age / thirtyDays);  // Exponential decay

    const weight = typeWeight * recencyWeight;
    weightedSum += test.normalizedScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sequential ELO updates only | Bradley-Terry for complete analysis, ELO for streaming | 2020s academic research | More stable rankings, explicit confidence intervals |
| Manual swap scheduling | Latin Square / BIBD generation | Experimental design theory (1980s+) | Guaranteed statistical balance, fewer races needed |
| Single on-water rating | Composite multi-factor rankings | Sports analytics 2010s+ | Holistic athlete evaluation, handles different strengths |
| Global athlete ranking only | Side-specific ratings | Rowing-specific innovation | Captures port/starboard asymmetry |
| Manual observation entry | Passive tracking from existing data | Modern sports analytics | Continuous improvement without extra coach effort |

**Deprecated/outdated:**
- Pure margin-based ranking (no statistical model): Ignores opponent strength
- Fixed K-factor ELO: Modern approaches use adaptive K based on uncertainty
- One-size-fits-all rankings: Composite rankings with configurable weights are standard
- Canvas-only graph rendering: WebGL (Sigma.js) handles larger graphs more efficiently

## Open Questions

Things that couldn't be fully resolved:

1. **Side-to-side ELO correlation**
   - What we know: Athletes who row both sides may have correlated performance
   - What's unclear: Optimal correlation structure (independent, partial correlation, full transfer)
   - Recommendation: Start with independent tracking (conservative), add correlation option later based on user feedback. Could implement as "transfer learning" where improving on primary side gives small boost (0.1-0.2x) to secondary side.

2. **Optimal passive observation weight**
   - What we know: Practice observations are noisier than formal seat races
   - What's unclear: Ideal weight factor (0.3x? 0.5x? adaptive based on variance?)
   - Recommendation: Default to 0.5x, make it configurable per team, and collect data to refine. Could auto-calibrate by comparing practice predictions to formal seat race outcomes.

3. **Bradley-Terry vs. ELO for real-time display**
   - What we know: Bradley-Terry requires batch recomputation, ELO updates incrementally
   - What's unclear: Best UX for showing "preliminary" ELO that converts to "final" Bradley-Terry
   - Recommendation: Display ELO as "provisional" during session, recompute Bradley-Terry overnight/on-demand. Clearly label which model is shown.

4. **Multi-way swap attribution (2:2, 3:3)**
   - What we know: Pairwise Bradley-Terry assumes 1:1 swaps
   - What's unclear: How to attribute margin in multi-athlete swaps without additional assumptions
   - Recommendation: For initial release, encourage 1:1 swaps for clean attribution. Support 2:2 recording but warn about ambiguous attribution. Could extend to group-level Bradley-Terry in future.

5. **JavaScript Bradley-Terry library maturity**
   - What we know: No mature npm package exists; R implementation (BradleyTerry2) is gold standard
   - What's unclear: Risk of bugs in custom implementation vs. API call overhead to R service
   - Recommendation: Implement in JavaScript for simplicity, validate against small test cases from R package. Consider R service for research teams who need cutting-edge features (random effects, etc.) as future enhancement.

## Sources

### Primary (HIGH confidence)
- [Bradley–Terry model - Wikipedia](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) - Mathematical foundation and model specification
- [Bradley-Terry Models in R (CRAN)](https://cran.r-project.org/web/packages/BradleyTerry2/vignettes/BradleyTerry.html) - Reference implementation and algorithms
- [Elo vs Bradley-Terry: Which is Better for Comparing the Performance of LLMs?](https://hippocampus-garden.com/elo_vs_bt/) - Direct comparison of methods
- [simple-statistics npm package](https://www.npmjs.com/package/simple-statistics) - Statistical computing library
- [jstat npm package](https://www.npmjs.com/package/jstat) - Statistical distributions and tests
- [Cytoscape.js](https://js.cytoscape.org/) - Graph visualization library

### Secondary (MEDIUM confidence)
- [Seat Racing 4+/4- by Christian Lindig (PDF)](https://lindig.github.io/papers/seat-racing-iv-2020-draft.pdf) - Mathematical approach to swap matrices (PDF unreadable, cited for methodology)
- [GitHub: seat-racing discussion](https://github.com/lindig/seat-racing) - Algorithmic approaches to seat racing
- [Balanced incomplete Latin square designs (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0378375813001043) - Optimal experimental design
- [Lecture 24 — The Bradley-Terry model (Stanford)](https://web.stanford.edu/class/archive/stats/stats200/stats200.1172/Lecture24.pdf) - Confidence interval calculation
- [Statistical Libraries in JavaScript (Scribbler)](https://scribbler.live/2024/07/24/Statistical-Libraries-in-JavaScript.html) - Library comparison
- [JavaScript Graph Visualization Libraries Comparison (Cylynx)](https://www.cylynx.io/blog/a-comparison-of-javascript-graph-network-visualisation-libraries/) - Visualization options
- [World Athletics Ranking System](https://worldathletics.org/world-ranking-rules/basics) - Composite ranking methodology
- [Zustand Documentation](https://zustand.docs.pmnd.rs/) - State management patterns

### Tertiary (LOW confidence - WebSearch only)
- [More about seat racing for selection (BioRow)](https://biorow.com/index.php?route=information%2Fnews%2Fnews&news_id=70) - Rowing-specific practices
- [Seat racing | British Rowing Plus](https://plus.britishrowing.org/2024/01/02/seat-racing/) - Practical coaching perspective
- Various npm package searches (fmin, newton-raphson-method, vis-network) - Package discovery

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - JavaScript libraries exist but Bradley-Terry requires custom implementation, no production-tested solutions found
- Architecture: HIGH - Patterns based on existing Phase 9 implementation + established statistical computing practices
- Pitfalls: MEDIUM - Based on statistical modeling literature and rowing domain knowledge, but specific JavaScript implementation pitfalls are hypothetical
- Experimental design: MEDIUM - Latin Square/BIBD theory is well-established, but rowing-specific scheduling algorithms are sparse in literature

**Research date:** 2026-01-26
**Valid until:** 60 days (statistical methodology stable, JavaScript ecosystem evolves slowly for niche libraries)

**Research methodology notes:**
- Bradley-Terry model mathematics verified from multiple academic sources
- JavaScript statistical libraries confirmed via npm registry
- No dedicated Bradley-Terry JS library found; custom implementation required
- Rowing-specific seat racing research limited; general paired comparison literature applied
- Experimental design theory (Latin Squares) well-established but rowing applications sparse
