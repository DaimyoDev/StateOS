// ui-src/src/General Scripts/OptimizedPollingFunctions.js
// Optimized SoA-based polling functions for better performance

import { calculateBaseCandidateScore } from "../utils/electionUtils.js";
import { getRandomInt } from "../utils/core.js";
import { 
  generateCoalitions, 
  calculateCoalitionPolling, 
  aggregateCoalitionPolling,
  updateCoalitionStates 
} from "./CoalitionSystem.js";

/**
 * Optimized polling normalization using Structure of Arrays (SoA) approach
 * Processes candidate data in batches and caches intermediate results
 */
export class PollingOptimizer {
  constructor() {
    this.cache = new Map();
    this.lastCacheClean = Date.now();
    this.stableElections = new Set(); // Track elections with minimal changes
    this.lastUpdateTimestamp = new Map(); // Track when elections were last updated
    this.coalitionCache = new Map(); // Cache coalition systems by election/region
    this.coalitionUpdateTimestamp = new Map(); // Track coalition updates
    this.changeThreshold = 0.5; // Minimum change to trigger recalculation
    
    // Pre-computed lookup tables for common scenarios
    this.precomputedDistributions = new Map();
    this._initializePrecomputedTables();
  }

  // Method to clear coalition cache when major events occur
  invalidateCoalitionCache(electionId = null) {
    if (electionId) {
      const cacheKey = `${electionId}_coalitions`;
      this.coalitionCache.delete(cacheKey);
      this.coalitionUpdateTimestamp.delete(cacheKey);
    } else {
      // Clear all coalition caches
      this.coalitionCache.clear();
      this.coalitionUpdateTimestamp.clear();
    }
  }
  
  /**
   * Initialize pre-computed polling distributions for common candidate counts
   */
  _initializePrecomputedTables() {
    // Pre-compute equal distributions for 2-10 candidates
    for (let numCandidates = 2; numCandidates <= 10; numCandidates++) {
      const equalShare = Math.floor(100 / numCandidates);
      const remainder = 100 % numCandidates;
      const distribution = new Array(numCandidates);
      
      for (let i = 0; i < numCandidates; i++) {
        distribution[i] = equalShare + (i < remainder ? 1 : 0);
      }
      
      this.precomputedDistributions.set(`equal_${numCandidates}`, distribution);
    }
  }

  /**
   * Fast polling normalization with caching and optimized calculations
   */
  normalizePollingFast(candidates, totalPopulationContext = 0, isSimulationMode = false, cacheKey = null) {
    // Clean cache periodically to prevent memory leaks
    const now = Date.now();
    if (now - this.lastCacheClean > 300000) { // Clean every 5 minutes
      this.cache.clear();
      this.coalitionCache.clear();
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
   * Process polling in optimized batches using aggressive SoA approach
   */
  _processPollingBatch(candidatesList, totalPopulationContext, isSimulationMode) {
    const numCandidates = candidatesList.length;
    
    // Early exit for small datasets
    if (numCandidates === 0) return new Map();
    if (numCandidates === 1) {
      const candidate = candidatesList[0];
      return new Map([[candidate.id, { ...candidate, polling: 100 }]]);
    }

    const safeAdultPopulation = Math.max(1, totalPopulationContext);
    const invSafeAdultPop = 1 / safeAdultPopulation; // Pre-compute division

    // Pre-allocate all arrays at once for better memory locality
    const ids = new Array(numCandidates);
    const baseScores = new Array(numCandidates);
    const effectiveWeights = new Array(numCandidates);
    const pollingValues = new Array(numCandidates);

    // Single vectorized pass: extract data and compute weights
    let totalEffectiveWeight = 0;
    
    if (isSimulationMode) {
      // Simulation mode: simplified calculation
      for (let i = 0; i < numCandidates; i++) {
        const candidate = candidatesList[i];
        ids[i] = candidate.id;
        const score = Number(candidate.baseScore) >= 0 ? Number(candidate.baseScore) : 1;
        baseScores[i] = score;
        effectiveWeights[i] = score;
        totalEffectiveWeight += score;
      }
    } else {
      // Full calculation with name recognition
      for (let i = 0; i < numCandidates; i++) {
        const candidate = candidatesList[i];
        ids[i] = candidate.id;
        const score = Number(candidate.baseScore) >= 0 ? Number(candidate.baseScore) : 1;
        baseScores[i] = score;
        
        const nameRec = candidate.nameRecognition || 0;
        const recognizedCount = Math.min(nameRec, safeAdultPopulation);
        const recognitionFraction = recognizedCount * invSafeAdultPop;
        const weight = score * Math.max(0.01, recognitionFraction) + 0.001;
        
        effectiveWeights[i] = weight;
        totalEffectiveWeight += weight;
      }
    }
    
    if (totalEffectiveWeight === 0) {
      // Use pre-computed equal distribution if available
      const precomputed = this.precomputedDistributions.get(`equal_${numCandidates}`);
      if (precomputed) {
        for (let i = 0; i < numCandidates; i++) {
          pollingValues[i] = precomputed[i];
        }
      } else {
        // Fallback for larger candidate counts
        const equalShare = Math.floor(100 / numCandidates);
        const remainder = 100 % numCandidates;
        
        for (let i = 0; i < numCandidates; i++) {
          pollingValues[i] = equalShare + (i < remainder ? 1 : 0);
        }
      }
    } else {
      // Ultra-fast proportional distribution with minimal allocations
      const invTotalWeight = 100 / totalEffectiveWeight; // Pre-compute division
      let totalFloored = 0;
      
      // Single pass: calculate polling and track remainders inline
      const remainderData = new Array(numCandidates); // [remainder, index] pairs
      
      for (let i = 0; i < numCandidates; i++) {
        const rawPolling = effectiveWeights[i] * invTotalWeight;
        const floored = Math.floor(rawPolling);
        pollingValues[i] = floored;
        totalFloored += floored;
        remainderData[i] = [rawPolling - floored, i];
      }

      // Distribute remainder points with minimal sorting
      const deficit = 100 - totalFloored;
      if (deficit > 0) {
        // Sort only remainder data, not full objects
        remainderData.sort((a, b) => {
          if (b[0] !== a[0]) return b[0] - a[0]; // Sort by remainder desc
          return effectiveWeights[b[1]] - effectiveWeights[a[1]]; // Tiebreaker by weight
        });

        // Distribute deficit points
        for (let i = 0; i < deficit; i++) {
          pollingValues[remainderData[i][1]]++;
        }
      }
    }

    // Build result map with minimal object creation
    const resultMap = new Map();
    for (let i = 0; i < numCandidates; i++) {
      const candidate = candidatesList[i];
      // Preserve all original candidate data and only update polling-related fields
      const result = {
        ...candidate, // Preserve all original data
        baseScore: baseScores[i],
        processedBaseScore: baseScores[i],
        effectiveWeight: effectiveWeights[i],
        polling: pollingValues[i]
      };
      
      resultMap.set(ids[i], result);
    }

    return resultMap;
  }

  /**
   * Ultra-fast batch update polling with intelligent skipping
   */
  batchUpdateElectionPolling(elections, adultPopulation) {
    const results = new Map();
    const electionsArray = Array.isArray(elections) ? elections : Array.from(elections);
    const now = Date.now();
    
    // Pre-compute common values
    const safeAdultPop = Math.max(1, adultPopulation);
    
    for (let i = 0; i < electionsArray.length; i++) {
      const election = electionsArray[i];
      const candidates = Array.isArray(election.candidates) ? election.candidates : Array.from(election.candidates.values());
      
      if (candidates.length === 0) {
        results.set(election.id, new Map());
        continue;
      }
      
      // Check if election needs updating based on change detection
      const lastUpdate = this.lastUpdateTimestamp.get(election.id) || 0;
      const timeSinceUpdate = now - lastUpdate;
      
      // Skip update if election is stable and recently updated
      if (this.stableElections.has(election.id) && timeSinceUpdate < 1000) {
        // Return cached result if available
        const cachedKey = `stable_${election.id}`;
        if (this.cache.has(cachedKey)) {
          results.set(election.id, this.cache.get(cachedKey).result);
          continue;
        }
      }
      
      // Calculate change magnitude to determine if update is needed
      const scoreSum = candidates.reduce((sum, c) => sum + (c.baseScore || 0), 0);
      const lastScoreKey = `score_${election.id}`;
      const lastScore = this.cache.get(lastScoreKey) || 0;
      const scoreChange = Math.abs(scoreSum - lastScore);
      
      // Skip if change is below threshold and election was recently updated
      if (scoreChange < this.changeThreshold && timeSinceUpdate < 500) {
        const cachedKey = `stable_${election.id}`;
        if (this.cache.has(cachedKey)) {
          results.set(election.id, this.cache.get(cachedKey).result);
          continue;
        }
      }
      
      // Generate cache key only for larger elections
      let cacheKey = null;
      if (candidates.length > 3) {
        cacheKey = `e_${election.id}_${candidates.length}_${adultPopulation}_${scoreSum}`;
      }
      
      const normalizedCandidates = this.normalizePollingFast(
        candidates,
        safeAdultPop,
        false,
        cacheKey
      );
      
      results.set(election.id, normalizedCandidates);
      
      // Update tracking data
      this.lastUpdateTimestamp.set(election.id, now);
      this.cache.set(lastScoreKey, scoreSum);
      this.cache.set(`stable_${election.id}`, { result: normalizedCandidates, timestamp: now });
      
      // Mark as stable if change was small
      if (scoreChange < this.changeThreshold) {
        this.stableElections.add(election.id);
      } else {
        this.stableElections.delete(election.id);
      }
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
 * Get or create coalition system for an election/region
 */
function getCoalitionSystem(electionId, electorateProfile, demographics, availableParties, activeCampaign) {
  // PRIORITY 1: Use pre-generated coalitions from campaign setup
  if (activeCampaign?.coalitionSystems) {
    // Try to find coalition system by city/region ID from election
    const cityId = electionId.split('_')[0]; // Extract city ID from election ID
    
    if (activeCampaign.coalitionSystems[cityId]) {
      return activeCampaign.coalitionSystems[cityId];
    }
    
    // Fallback: use any available pre-generated coalition system
    const availableCoalitions = Object.values(activeCampaign.coalitionSystems);
    if (availableCoalitions.length > 0) {
      return availableCoalitions[0];
    }
  }
  
  // FALLBACK: Use cache if available
  const cacheKey = `${electionId}_coalitions`;
  if (pollingOptimizer.coalitionCache.has(cacheKey)) {
    return pollingOptimizer.coalitionCache.get(cacheKey);
  }
  
  // LAST RESORT: Generate new coalition system (should rarely happen)
  console.warn('Generating coalitions at runtime - this should be avoided for performance');
  const coalitionSoA = generateCoalitions(electorateProfile, demographics, availableParties);
  pollingOptimizer.coalitionCache.set(cacheKey, coalitionSoA);
  pollingOptimizer.coalitionUpdateTimestamp.set(cacheKey, Date.now());
  
  return coalitionSoA;
}

/**
 * Coalition-based polling calculation for non-player politicians
 * Provides massive performance improvement over individual calculations
 */
export function calculateCoalitionBasedPolling(election, campaignData, politicians) {
  const { startingCity, activeCampaign } = campaignData;
  const electorateProfile = startingCity.stats.electoratePolicyProfile || {};
  const demographics = startingCity.demographics || {};
  const availableParties = startingCity.politicalLandscape || [];
  
  // Get coalition system for this election
  const coalitionSoA = getCoalitionSystem(
    election.id, 
    electorateProfile, 
    demographics, 
    availableParties,
    activeCampaign
  );
  
  const results = new Map();
  const candidates = Array.isArray(election.candidates) ? 
    election.candidates : Array.from(election.candidates.values());
  
  // SoA Maps for batch processing - maintain consistency with existing architecture
  const rawScoresSoA = new Map();
  const candidateDataSoA = new Map();
  
  // Single loop for all calculations using SoA pattern
  for (const candidate of candidates) {
    // Skip coalition calculation for player politicians - use traditional method
    if (candidate.isPlayer) {
      const traditionalScore = calculateBaseCandidateScore(candidate, election, campaignData);
      rawScoresSoA.set(candidate.id, traditionalScore);
      continue;
    }
    
    // Get candidate data from SoA with cached lookups
    const baseData = politicians.base.get(candidate.id);
    const candidateData = {
      calculatedIdeology: baseData?.calculatedIdeology,
      policyStances: politicians.policyStances.get(candidate.id),
      policyStancesByQuestion: politicians.policyStancesByQuestion, // Pass SoA structure
      partyId: baseData?.partyId,
      attributes: politicians.attributes.get(candidate.id)
    };
    
    // Store in SoA for potential reuse
    candidateDataSoA.set(candidate.id, candidateData);
    
    // Calculate coalition polling
    const coalitionResults = calculateCoalitionPolling(candidate.id, candidateData, coalitionSoA);
    
    // Cache coalition results
    coalitionSoA.polling.set(candidate.id, coalitionResults);
    
    // Aggregate to overall polling score
    const overallScore = aggregateCoalitionPolling(coalitionSoA, candidate.id);
    // Handle NaN scores by defaulting to neutral score
    const finalScore = isNaN(overallScore) ? 50 : overallScore;
    rawScoresSoA.set(candidate.id, finalScore);
  }
  
  // Calculate total score using SoA Map
  let totalScore = 0;
  for (const score of rawScoresSoA.values()) {
    totalScore += score;
  }
  
  // Use proportional normalization instead of forcing 100% sum
  // This preserves relative differences between candidates
  const avgScore = totalScore / rawScoresSoA.size;
  const normalizationFactor = avgScore > 0 ? 50 / avgScore : 1;
  
  // Build UI-compatible candidate objects using SoA pattern
  for (const candidate of candidates) {
    const candidateId = candidate.id;
    const rawScore = rawScoresSoA.get(candidateId) || 0;
    const normalizedPolling = Math.round(rawScore * normalizationFactor);
    
    
    // Get candidate data from SoA for UI display
    const baseData = politicians.base.get(candidateId);
    const stateData = politicians.state.get(candidateId);
    const attributesData = politicians.attributes.get(candidateId);
    const ideologyScores = politicians.ideologyScores.get(candidateId);
    
    results.set(candidateId, {
      id: candidateId,
      name: baseData?.name || candidate.name || 'Unknown Candidate',
      party: baseData?.partyName || candidate.party || 'Independent',
      partyName: baseData?.partyName || candidate.partyName || 'Independent',
      partyColor: baseData?.partyColor || candidate.partyColor || '#888888',
      age: baseData?.age || candidate.age,
      baseScore: rawScore,
      polling: normalizedPolling,
      nameRecognition: stateData?.nameRecognition || candidate.nameRecognition || 0,
      approvalRating: stateData?.approvalRating || candidate.approvalRating || 50,
      mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz || 0,
      attributes: attributesData || candidate.attributes || {},
      ideologyScores: ideologyScores || candidate.ideologyScores || {},
      calculatedIdeology: baseData?.calculatedIdeology || candidate.calculatedIdeology,
      isPlayer: candidate.isPlayer || false
    });
  }
  
  return results;
}

/**
 * Drop-in replacement for the original normalizePolling function
 */
export function normalizePollingOptimized(candidates, totalPopulationContext = 0, isSimulationMode = false) {
  // For player elections, bypass cache to ensure fresh calculations
  return pollingOptimizer.normalizePollingFast(candidates, totalPopulationContext, isSimulationMode, null);
}
