/**
 * Simple Nelder-Mead optimization algorithm implementation
 * @param {Function} func - Function to minimize
 * @param {Array<number>} x0 - Initial point
 * @param {Object} options - Optimization options
 * @returns {Object} { x: solution, fx: function value, iterations, converged }
 */
function nelderMead(func, x0, options = {}) {
  const {
    maxIterations = 1000,
    tolerance = 1e-6,
    alpha = 1.0,  // Reflection
    gamma = 2.0,  // Expansion
    rho = 0.5,    // Contraction
    sigma = 0.5   // Shrink
  } = options;

  const n = x0.length;

  // Initialize simplex
  const simplex = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const vertex = x0.slice();
    vertex[i] += (vertex[i] === 0 ? 0.00025 : vertex[i] * 0.05);
    simplex.push(vertex);
  }

  // Evaluate function at each vertex
  const fValues = simplex.map(func);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Sort simplex by function values
    const indices = fValues.map((_, i) => i).sort((a, b) => fValues[a] - fValues[b]);

    // Check convergence
    const best = fValues[indices[0]];
    const worst = fValues[indices[n]];
    if (Math.abs(worst - best) < tolerance) {
      return {
        x: simplex[indices[0]],
        fx: best,
        iterations: iter,
        converged: true
      };
    }

    // Calculate centroid of best n points
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        centroid[j] += simplex[indices[i]][j] / n;
      }
    }

    // Reflection
    const worstIdx = indices[n];
    const reflected = centroid.map((c, i) => c + alpha * (c - simplex[worstIdx][i]));
    const fReflected = func(reflected);

    if (fValues[indices[0]] <= fReflected && fReflected < fValues[indices[n - 1]]) {
      // Accept reflected point
      simplex[worstIdx] = reflected;
      fValues[worstIdx] = fReflected;
      continue;
    }

    // Expansion
    if (fReflected < fValues[indices[0]]) {
      const expanded = centroid.map((c, i) => c + gamma * (reflected[i] - c));
      const fExpanded = func(expanded);

      if (fExpanded < fReflected) {
        simplex[worstIdx] = expanded;
        fValues[worstIdx] = fExpanded;
      } else {
        simplex[worstIdx] = reflected;
        fValues[worstIdx] = fReflected;
      }
      continue;
    }

    // Contraction
    const contracted = centroid.map((c, i) => c + rho * (simplex[worstIdx][i] - c));
    const fContracted = func(contracted);

    if (fContracted < fValues[worstIdx]) {
      simplex[worstIdx] = contracted;
      fValues[worstIdx] = fContracted;
      continue;
    }

    // Shrink
    for (let i = 1; i <= n; i++) {
      const idx = indices[i];
      simplex[idx] = simplex[idx].map((val, j) =>
        simplex[indices[0]][j] + sigma * (val - simplex[indices[0]][j])
      );
      fValues[idx] = func(simplex[idx]);
    }
  }

  // Return best point even if not converged
  const indices = fValues.map((_, i) => i).sort((a, b) => fValues[a] - fValues[b]);
  return {
    x: simplex[indices[0]],
    fx: fValues[indices[0]],
    iterations: maxIterations,
    converged: false
  };
}

/**
 * Fit Bradley-Terry model to pairwise comparison data
 * Uses Maximum Likelihood Estimation via Nelder-Mead optimization
 *
 * @param {Array} comparisons - Array of comparison objects
 *   Each object: { athlete1Id, athlete2Id, athlete1Win, shellId1?, shellId2? }
 * @param {Object} options - Fitting options
 *   { includeBoatSpeed: boolean, normalizeShells: boolean }
 * @returns {Object} { athletes: [...], shells: [...], convergence: {...} }
 */
export function fitBradleyTerryModel(comparisons, options = {}) {
  const { includeBoatSpeed = true, normalizeShells = true } = options;

  // Validate input
  if (!comparisons || comparisons.length === 0) {
    throw new Error('Cannot fit model with empty comparisons');
  }

  // Extract unique athletes
  const athleteIds = new Set();
  comparisons.forEach(comp => {
    athleteIds.add(comp.athlete1Id);
    athleteIds.add(comp.athlete2Id);
  });
  const athleteList = Array.from(athleteIds);

  // Edge case: single athlete
  if (athleteList.length === 1) {
    return {
      athletes: [{
        athleteId: athleteList[0],
        strength: 1.0,
        stdError: 0,
        ci: [1.0, 1.0],
      }],
      shells: [],
      convergence: { converged: true, iterations: 0 },
    };
  }

  // Extract unique shells if includeBoatSpeed
  let shellIds = [];
  let hasShellData = false;
  if (includeBoatSpeed) {
    const shellSet = new Set();
    comparisons.forEach(comp => {
      if (comp.shellId1) {
        shellSet.add(comp.shellId1);
        hasShellData = true;
      }
      if (comp.shellId2) {
        shellSet.add(comp.shellId2);
        hasShellData = true;
      }
    });
    shellIds = Array.from(shellSet);
  }

  // Build athlete index map
  const athleteIndexMap = {};
  athleteList.forEach((id, idx) => {
    athleteIndexMap[id] = idx;
  });

  // Build shell index map
  const shellIndexMap = {};
  shellIds.forEach((id, idx) => {
    shellIndexMap[id] = idx;
  });

  const numAthletes = athleteList.length;
  const numShells = shellIds.length;

  // Define negative log-likelihood function
  const negLogLikelihood = (params) => {
    // params = [log(strength_1), ..., log(strength_n), log(gamma_1), ..., log(gamma_m)]
    // We use log-scale to ensure positivity
    const logStrengths = params.slice(0, numAthletes);
    const logShellParams = hasShellData && includeBoatSpeed
      ? params.slice(numAthletes, numAthletes + numShells)
      : [];

    let nll = 0;

    comparisons.forEach(comp => {
      const i = athleteIndexMap[comp.athlete1Id];
      const j = athleteIndexMap[comp.athlete2Id];

      // Get athlete log-strengths
      let logStrength_i = logStrengths[i];
      let logStrength_j = logStrengths[j];

      // Add shell effect if available
      if (hasShellData && includeBoatSpeed && comp.shellId1 && comp.shellId2) {
        const shellIdx1 = shellIndexMap[comp.shellId1];
        const shellIdx2 = shellIndexMap[comp.shellId2];
        logStrength_i += logShellParams[shellIdx1];
        logStrength_j += logShellParams[shellIdx2];
      }

      // Bradley-Terry probability: P(i beats j) = exp(logStrength_i) / (exp(logStrength_i) + exp(logStrength_j))
      // Using log-sum-exp trick for numerical stability
      const maxLog = Math.max(logStrength_i, logStrength_j);
      const logSumExp = maxLog + Math.log(
        Math.exp(logStrength_i - maxLog) + Math.exp(logStrength_j - maxLog)
      );

      // Log-likelihood contribution
      if (comp.athlete1Win) {
        nll -= (logStrength_i - logSumExp);
      } else {
        nll -= (logStrength_j - logSumExp);
      }
    });

    return nll;
  };

  // Initial guess: all log-strengths = 0 (strength = 1), all log-shell-params = 0 (gamma = 1)
  const numParams = numAthletes + (hasShellData && includeBoatSpeed ? numShells : 0);
  const initialParams = new Array(numParams).fill(0);

  // Run optimization using Nelder-Mead
  const solution = nelderMead(negLogLikelihood, initialParams);

  // Extract athlete strengths
  const logStrengths = solution.x.slice(0, numAthletes);

  // Apply identifiability constraint: shift so sum of log-strengths = 0
  const meanLogStrength = logStrengths.reduce((sum, val) => sum + val, 0) / numAthletes;
  const normalizedLogStrengths = logStrengths.map(val => val - meanLogStrength);

  // Convert to strengths
  const strengths = normalizedLogStrengths.map(Math.exp);

  // Compute Hessian (Fisher Information) for standard errors
  const hessian = computeNumericalHessian(negLogLikelihood, solution.x);
  const stdErrors = computeStandardErrors(hessian, solution.x);

  // Build athlete results
  const athletes = athleteList.map((athleteId, idx) => {
    const strength = strengths[idx];
    const stdError = stdErrors[idx];
    const ci = [
      Math.max(0, strength - 1.96 * stdError),
      strength + 1.96 * stdError,
    ];

    return {
      athleteId,
      strength,
      stdError,
      ci,
    };
  });

  // Build shell results
  let shells = [];
  if (hasShellData && includeBoatSpeed) {
    const logShellParams = solution.x.slice(numAthletes, numAthletes + numShells);

    // Apply identifiability constraint: normalize so product of gammas = 1 (geometric mean = 1)
    const meanLogShellParam = normalizeShells
      ? logShellParams.reduce((sum, val) => sum + val, 0) / numShells
      : 0;
    const normalizedLogShellParams = logShellParams.map(val => val - meanLogShellParam);

    // Convert to shell speed parameters
    const shellParams = normalizedLogShellParams.map(Math.exp);

    // Count comparisons per shell
    const shellComparisons = {};
    shellIds.forEach(id => { shellComparisons[id] = 0; });

    comparisons.forEach(comp => {
      if (comp.shellId1) shellComparisons[comp.shellId1]++;
      if (comp.shellId2) shellComparisons[comp.shellId2]++;
    });

    shells = shellIds.map((shellId, idx) => ({
      shellId,
      speedParameter: shellParams[idx],
      comparisonsInShell: shellComparisons[shellId] || 0,
    }));
  }

  return {
    athletes,
    shells,
    convergence: {
      converged: solution.converged || (solution.fx < 1e6), // Reasonable convergence check
      iterations: solution.iterations || 0,
    },
  };
}

/**
 * Compute probability matrix P(i beats j) for all pairs
 * @param {Array} athletes - Array of athlete objects with strength property
 * @returns {Array<Array<number>>} P[i][j] = probability that athlete i beats athlete j
 */
export function computeProbabilityMatrix(athletes) {
  const n = athletes.length;
  const pMatrix = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        pMatrix[i][j] = 0.5; // Athlete vs self
      } else {
        const strength_i = athletes[i].strength;
        const strength_j = athletes[j].strength;
        pMatrix[i][j] = strength_i / (strength_i + strength_j);
      }
    }
  }

  return pMatrix;
}

/**
 * Compute standard errors from Hessian matrix (Fisher information)
 * @param {Array<Array<number>>} hessian - Hessian matrix (second derivatives)
 * @param {Array<number>} solution - Parameter values at solution
 * @returns {Array<number>} Standard errors for each parameter
 */
export function computeStandardErrors(hessian, solution) {
  const n = solution.length;

  // Standard errors are sqrt of diagonal elements of inverse Hessian
  // For simplicity, use numerical approximation
  const inverseHessian = invertMatrix(hessian);

  const stdErrors = [];
  for (let i = 0; i < n; i++) {
    const variance = inverseHessian[i][i];
    stdErrors.push(Math.sqrt(Math.abs(variance)));
  }

  return stdErrors;
}

/**
 * Compute numerical Hessian using finite differences
 * @param {Function} func - Function to compute Hessian for
 * @param {Array<number>} x - Point at which to compute Hessian
 * @returns {Array<Array<number>>} Hessian matrix
 */
function computeNumericalHessian(func, x) {
  const n = x.length;
  const h = 1e-5; // Step size
  const hessian = Array(n).fill(null).map(() => Array(n).fill(0));

  const f0 = func(x);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      // Compute second derivative using central differences
      const xPlusI = [...x];
      xPlusI[i] += h;

      const xPlusJ = [...x];
      xPlusJ[j] += h;

      const xPlusIJ = [...x];
      xPlusIJ[i] += h;
      xPlusIJ[j] += h;

      const xMinusI = [...x];
      xMinusI[i] -= h;

      const xMinusJ = [...x];
      xMinusJ[j] -= h;

      const xMinusIJ = [...x];
      xMinusIJ[i] -= h;
      xMinusIJ[j] -= h;

      const fPlusIJ = func(xPlusIJ);
      const fPlusI = func(xPlusI);
      const fPlusJ = func(xPlusJ);
      const fMinusI = func(xMinusI);
      const fMinusJ = func(xMinusJ);
      const fMinusIJ = func(xMinusIJ);

      const secondDerivative = (fPlusIJ - fPlusI - fPlusJ + 2 * f0 - fMinusI - fMinusJ + fMinusIJ) / (2 * h * h);

      hessian[i][j] = secondDerivative;
      hessian[j][i] = secondDerivative; // Symmetric
    }
  }

  return hessian;
}

/**
 * Invert a matrix using Gaussian elimination
 * @param {Array<Array<number>>} matrix - Matrix to invert
 * @returns {Array<Array<number>>} Inverted matrix
 */
function invertMatrix(matrix) {
  const n = matrix.length;

  // Create augmented matrix [A | I]
  const augmented = matrix.map((row, i) =>
    row.concat(Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)))
  );

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Make diagonal 1
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) {
      // Matrix is singular or nearly singular, use small value
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] = (j === i || j === i + n) ? 1 : 0;
      }
    } else {
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  // Extract inverse from right half of augmented matrix
  return augmented.map(row => row.slice(n));
}

export default {
  fitBradleyTerryModel,
  computeProbabilityMatrix,
  computeStandardErrors,
};
