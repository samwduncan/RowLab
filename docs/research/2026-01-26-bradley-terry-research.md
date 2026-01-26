# Bradley-Terry Model Research

**Date:** 2026-01-26
**Source:** Gemini CLI Research

---

## 1. Bradley-Terry vs ELO for Rowing

| Feature | Bradley-Terry | ELO |
|---------|---------------|-----|
| **Data Processing** | Analyzes entire set of races at once (batch) | Updates incrementally after each race |
| **Stability** | Single, consistent rating for the session | Ratings fluctuate; race order affects score |
| **Interpretability** | Outputs "Strength" parameters (probability-based) | Abstract points; probability derived from difference |
| **Best For** | **Selection Events:** Dedicated seat racing sessions | **Long-term:** Season-long performance tracking |

**Key insight:** BT is superior for seat racing because it processes batch data and gives consistent results regardless of race order.

---

## 2. Confidence Intervals

**Method:**
1. Estimate parameters using Maximum Likelihood Estimation (MLE)
2. Compute observed Fisher Information Matrix (negative Hessian of log-likelihood)
3. Invert matrix to get Variance-Covariance matrix
4. Standard Error = sqrt(diagonal elements)
5. 95% CI = Rating ± 1.96 × SE

**Why it matters:** Small sample sizes in seat racing mean point estimates can be misleading. CI shows if athletes are statistically distinguishable.

---

## 3. Latin Square Design

**Purpose:** Isolate athlete speed from boat speed and seat position.

**Requirements:**
- Every athlete races in every boat equal times
- Every athlete races with every other athlete equal times

**Example (4 athletes, 2 boats):**
```
Race 1: A in Boat 1, B in Boat 2
Race 2: B in Boat 1, A in Boat 2
(Repeat)
```

**Statistical model:** Add "Boat Parameter" alongside "Athlete Parameters" to filter equipment advantage.

---

## 4. Implementation

**No production-ready npm libraries exist.** Build custom using MM Algorithm.

### Data Structure
```typescript
interface MatchResult {
  winner: string; // Athlete ID
  loser: string;  // Athlete ID
}
```

### MM Algorithm (Iterative Update)
Initialize all scores pi = 1.0. Repeat until convergence:

```
pi_new = Wi / Σ(Nij / (pi + pj))
```

Where:
- Wi = Total wins for athlete i
- Nij = Total matches between i and j
- pj = Current score of opponent j

### Dependencies
- `mathjs` for matrix inversion (Fisher Information / confidence intervals)

### Architecture
```typescript
class BradleyTerryModel {
  constructor(matches: MatchResult[])

  // Run MM algorithm to convergence
  fit(): void

  // Get athlete rankings
  getRankings(): AthleteRating[]

  // Compute confidence intervals via Hessian
  getConfidenceIntervals(): Map<string, [number, number]>

  // Probability athlete A beats athlete B
  winProbability(a: string, b: string): number
}
```

---

## Implementation Notes

1. **Convergence:** Check when max change in any parameter < 1e-6
2. **Normalization:** Fix one athlete's score to 1.0 (reference point)
3. **Missing comparisons:** Graph connectivity matters - flag if comparison graph is disconnected
4. **Boat bias:** Extend model with boat parameters for Latin Square analysis

---

*Research completed: 2026-01-26*
