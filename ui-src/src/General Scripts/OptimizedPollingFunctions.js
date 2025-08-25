// ui-src/src/General Scripts/OptimizedPollingFunctions.js
// Optimized SoA-based polling functions for better performance

/**
 * Optimized polling normalization using Structure of Arrays (SoA) approach
 * Processes candidate data in batches and caches intermediate results
 */
export class PollingOptimizer {
  constructor() {
    this.cache = new Map();
    this.lastCacheClean = Date.now();
  }

  /**
   * Fast polling normalization with caching and optimized calculations
   */
  normalizePollingFast(candidates, totalPopulationContext = 0, isSimulationMode = false, cacheKey = null) {
    // Clean cache periodically to prevent memory leaks
    const now = Date.now();
    if (now - this.lastCacheClean > 60000) { // Clean every minute
      this.cache.clear();
      this.lastCacheClean = now;
    }

    // Check cache if key provided
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached.timestamp > now - 5000) { // Cache for 5 seconds
        return cached.result;
      }
    }

    const candidatesList = Array.isArray(candidates) ? candidates : Array.from(candidates.values());
    
    if (!candidatesList || candidatesList.length === 0) {
      return new Map();
    }

    const result = this._processPollingBatch(candidatesList, totalPopulationContext, isSimulationMode);
    
    // Cache result if key provided
    if (cacheKey) {
      this.cache.set(cacheKey, {
        result,
        timestamp: now
      });
    }

    return result;
  }

  /**
   * Process polling in optimized batches using SoA approach
   */
  _processPollingBatch(candidatesList, totalPopulationContext, isSimulationMode) {
    const safeAdultPopulation = Math.max(1, totalPopulationContext);
    const numCandidates = candidatesList.length;

    // SoA: Extract arrays for vectorized operations
    const ids = new Array(numCandidates);
    const baseScores = new Array(numCandidates);
    const nameRecognitions = new Array(numCandidates);
    const effectiveWeights = new Array(numCandidates);

    // Single pass to extract and calculate effective weights
    for (let i = 0; i < numCandidates; i++) {
      const candidate = candidatesList[i];
      ids[i] = candidate.id;
      baseScores[i] = Number(candidate.baseScore) >= 0 ? Number(candidate.baseScore) : 1;
      nameRecognitions[i] = candidate.nameRecognition || 0;

      if (isSimulationMode) {
        effectiveWeights[i] = baseScores[i];
      } else {
        const recognizedCount = Math.min(nameRecognitions[i], safeAdultPopulation);
        const recognitionFraction = safeAdultPopulation > 0 ? recognizedCount / safeAdultPopulation : 0;
        effectiveWeights[i] = baseScores[i] * Math.max(0.01, recognitionFraction) + 0.001;
      }
    }

    // Calculate total weight
    let totalEffectiveWeight = 0;
    for (let i = 0; i < numCandidates; i++) {
      totalEffectiveWeight += effectiveWeights[i];
    }

    // Calculate polling percentages
    const pollingValues = new Array(numCandidates);
    
    if (totalEffectiveWeight === 0) {
      // Equal distribution
      const equalShare = Math.floor(100 / numCandidates);
      const remainder = 100 % numCandidates;
      
      for (let i = 0; i < numCandidates; i++) {
        pollingValues[i] = equalShare + (i < remainder ? 1 : 0);
      }
    } else {
      // Proportional distribution with optimized remainder handling
      const rawPolling = new Array(numCandidates);
      const remainders = new Array(numCandidates);
      let totalFloored = 0;

      // Calculate raw polling and floor values
      for (let i = 0; i < numCandidates; i++) {
        rawPolling[i] = (effectiveWeights[i] / totalEffectiveWeight) * 100;
        pollingValues[i] = Math.floor(rawPolling[i]);
        remainders[i] = rawPolling[i] - pollingValues[i];
        totalFloored += pollingValues[i];
      }

      // Distribute remainder points efficiently
      const deficit = 100 - totalFloored;
      if (deficit > 0) {
        // Create sorted indices by remainder (descending)
        const sortedIndices = Array.from({ length: numCandidates }, (_, i) => i)
          .sort((a, b) => {
            if (remainders[b] !== remainders[a]) return remainders[b] - remainders[a];
            if (effectiveWeights[b] !== effectiveWeights[a]) return effectiveWeights[b] - effectiveWeights[a];
            return baseScores[b] - baseScores[a];
          });

        // Distribute deficit points
        for (let i = 0; i < deficit && i < numCandidates; i++) {
          pollingValues[sortedIndices[i]]++;
        }
      }
    }

    // Build result map efficiently
    const resultMap = new Map();
    for (let i = 0; i < numCandidates; i++) {
      resultMap.set(ids[i], {
        ...candidatesList[i],
        processedBaseScore: baseScores[i],
        effectiveWeight: effectiveWeights[i],
        polling: pollingValues[i]
      });
    }

    return resultMap;
  }

  /**
   * Batch update polling for multiple elections efficiently
   */
  batchUpdateElectionPolling(elections, adultPopulation) {
    const results = new Map();
    
    for (const election of elections) {
      // Include candidate scores in cache key to ensure updates are reflected
      const candidateScoreHash = Array.from(election.candidates.values())
        .map(c => `${c.id}:${c.baseScore || 0}:${c.nameRecognition || 0}:${c.mediaBuzz || 0}`)
        .join('|');
      const cacheKey = `election_${election.id}_${election.candidates.size}_${adultPopulation}_${candidateScoreHash}`;
      
      const normalizedCandidates = this.normalizePollingFast(
        election.candidates,
        adultPopulation,
        false,
        cacheKey
      );
      results.set(election.id, normalizedCandidates);
    }
    
    return results;
  }
}

// Global instance for reuse
export const pollingOptimizer = new PollingOptimizer();

/**
 * Optimized initial polling calculation for new politicians
 */
export function calculateInitialPollingOptimized(
  candidate,
  countryId,
  allPartiesInGame,
  policyQuestionsData,
  ideologyData,
  electorateIdeologyCenter,
  electorateIdeologySpread,
  electorateIssueStances
) {
  let totalScore = 40; // Base starting score

  // 1. Party Popularity Factor
  if (candidate.partyId && allPartiesInGame && allPartiesInGame.length > 0) {
    const candidateParty = allPartiesInGame.find(p => p.id === candidate.partyId);
    if (candidateParty && candidateParty.popularity !== undefined) {
      totalScore += (candidateParty.popularity / 100 - 0.5) * 15;
    }
  }

  // 2. Candidate Attributes Factor
  if (candidate.attributes) {
    const charisma = candidate.attributes.charisma || candidate.charisma || 50;
    const integrity = candidate.attributes.integrity || candidate.integrity || 50;
    totalScore += (charisma / 100 - 0.5) * 12;
    totalScore += (integrity / 100 - 0.5) * 8;
  }

  // 3. Experience Factor
  const experience = candidate.experience || 5;
  totalScore += Math.min(experience * 0.5, 10);

  // 4. Name Recognition Factor
  const nameRecognition = candidate.nameRecognition || 0;
  totalScore += nameRecognition * 0.3;

  // Ensure reasonable bounds
  totalScore = Math.max(5, Math.min(95, totalScore));

  return { totalScore };
}

/**
 * Drop-in replacement for the original normalizePolling function
 */
export function normalizePollingOptimized(candidates, totalPopulationContext = 0, isSimulationMode = false) {
  return pollingOptimizer.normalizePollingFast(candidates, totalPopulationContext, isSimulationMode);
}
