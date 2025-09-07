// ui-src/src/General Scripts/OptimizedPollingFunctions.js
// Optimized SoA-based polling functions for better performance

import { getRandomInt } from "../utils/core.js";
import { 
  generateCoalitions, 
  calculateCoalitionPolling, 
  aggregateCoalitionPolling,
  updateCoalitionStates 
} from "./CoalitionSystem.js";
import { 
  calculateElectoralCollegeResults,
  electoralCollegeSystem 
} from "./ElectoralCollegeSystem.js";

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
    // Try direct match first
    if (activeCampaign.coalitionSystems[electionId]) {
      return activeCampaign.coalitionSystems[electionId];
    }
    
    // For congressional elections, map to state coalition profile
    if (electionId.includes('house_') || electionId.includes('senate_') || electionId.includes('congressional_')) {
      const stateId = activeCampaign.regionId; // Use current state/region
      const stateCoalitionKey = `state_${stateId}`;
      
      if (activeCampaign.coalitionSystems[stateCoalitionKey]) {
        console.log(`[COALITION MAPPING] Congressional election ${electionId} using state coalitions: ${stateCoalitionKey}`);
        return activeCampaign.coalitionSystems[stateCoalitionKey];
      }
    }
    
    // Try to find coalition system by city/region ID from election
    const cityId = electionId.split('_')[0]; // Extract city ID from election ID
    
    if (activeCampaign.coalitionSystems[cityId]) {
      return activeCampaign.coalitionSystems[cityId];
    }
    
    // Try city-specific key
    const cityCoalitionKey = `city_${activeCampaign.startingCity?.id}`;
    if (activeCampaign.coalitionSystems[cityCoalitionKey]) {
      return activeCampaign.coalitionSystems[cityCoalitionKey];
    }
    
    // Fallback: use any available pre-generated coalition system
    const availableCoalitions = Object.values(activeCampaign.coalitionSystems);
    if (availableCoalitions.length > 0) {
      console.log(`[COALITION FALLBACK] Using available coalition system for election: ${electionId}`);
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
    // This function should only handle non-player elections
    if (candidate.isPlayer) {
      console.warn(`[COALITION POLLING] Player candidate ${candidate.name} found in calculateCoalitionBasedPolling - this should use calculatePlayerElectionPolling instead`);
      // Set a default score as fallback
      rawScoresSoA.set(candidate.id, 15);
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
 * Player-specific election polling that combines coalition analysis with player metrics
 * This function is specifically for elections where the player is a candidate
 * @param {object} election - The election object
 * @param {object} campaignData - Campaign data including player info
 * @param {object} politicians - Politicians SoA structure
 * @returns {Map} Enhanced polling results with player-specific metrics
 */
export function calculatePlayerElectionPolling(election, campaignData, politicians) {
  const { activeCampaign } = campaignData;
  
  if (!activeCampaign?.coalitionSystems) {
    console.warn("No coalition systems available for player election calculation");
    return calculateStandardElectionPolling(election, campaignData, politicians);
  }
  
  // Get coalition system for this election (will map congressional to state)
  const electorateProfile = activeCampaign.startingCity?.stats?.electoratePolicyProfile || {};
  const demographics = activeCampaign.startingCity?.demographics || {};
  const availableParties = activeCampaign.startingCity?.politicalLandscape || [];
  
  const coalitionSoA = getCoalitionSystem(
    election.id,
    electorateProfile,
    demographics,
    availableParties,
    activeCampaign
  );
  
  if (!coalitionSoA) {
    console.warn("Could not obtain coalition system for player election");
    return calculateStandardElectionPolling(election, campaignData, politicians);
  }
  
  const candidates = Array.isArray(election.candidates) ? 
    election.candidates : Array.from(election.candidates.values());
    
  const results = new Map();
  const rawScoresSoA = new Map();
  const candidateDataSoA = new Map();
  
  // Process each candidate with enhanced player metrics
  for (const candidate of candidates) {
    const candidateData = {
      id: candidate.id,
      name: politicians.base.get(candidate.id)?.name || candidate.name,
      calculatedIdeology: politicians.base.get(candidate.id)?.calculatedIdeology,
      policyStances: politicians.policyStances.get(candidate.id),
      policyStancesByQuestion: politicians.policyStancesByQuestion,
      partyId: politicians.base.get(candidate.id)?.partyId,
      attributes: politicians.attributes.get(candidate.id),
      // Enhanced player-specific metrics
      nameRecognition: politicians.state.get(candidate.id)?.nameRecognition || candidate.nameRecognition || 0,
      approvalRating: politicians.state.get(candidate.id)?.approvalRating || candidate.approvalRating || 50,
      mediaBuzz: politicians.state.get(candidate.id)?.mediaBuzz || candidate.mediaBuzz || 0,
      campaignFunds: politicians.finances.get(candidate.id)?.campaignFunds || candidate.campaignFunds || 0,
      isPlayer: candidate.isPlayer || false
    };
    
    candidateDataSoA.set(candidate.id, candidateData);
    
    // Calculate base coalition polling
    const coalitionResults = calculateCoalitionPolling(candidate.id, candidateData, coalitionSoA);
    coalitionSoA.polling.set(candidate.id, coalitionResults);
    
    // Get coalition-based score
    let coalitionScore = aggregateCoalitionPolling(coalitionSoA, candidate.id);
    coalitionScore = isNaN(coalitionScore) ? 50 : coalitionScore;
    
    // Apply player-specific enhancements
    let finalScore = coalitionScore;
    
    if (candidateData.isPlayer || candidateData.nameRecognition > 0 || candidateData.campaignFunds > 0) {
      // Name recognition boost (0-100 → 0-15% bonus)
      const nameRecognitionBonus = (candidateData.nameRecognition / 100) * 15;
      
      // Approval rating modifier (-50 to +50 → -10% to +10%)
      const approvalModifier = ((candidateData.approvalRating - 50) / 50) * 10;
      
      // Media buzz bonus (0-100 → 0-8% bonus)  
      const mediaBuzzBonus = (candidateData.mediaBuzz / 100) * 8;
      
      // Campaign funding effect (logarithmic scaling to prevent dominance)
      const fundingBonus = candidateData.campaignFunds > 0 ? 
        Math.min(12, Math.log10(candidateData.campaignFunds / 1000) * 3) : 0;
      
      // Apply bonuses/penalties
      finalScore += nameRecognitionBonus + approvalModifier + mediaBuzzBonus + fundingBonus;
      
      // Player candidates get slight incumbency/effort bonus
      if (candidateData.isPlayer) {
        finalScore += 5; // 5% player effort bonus
      }
      
      console.log(`[PLAYER POLLING] ${candidateData.name}: Base=${coalitionScore.toFixed(1)}, NameRec=+${nameRecognitionBonus.toFixed(1)}, Approval=${approvalModifier >= 0 ? '+' : ''}${approvalModifier.toFixed(1)}, MediaBuzz=+${mediaBuzzBonus.toFixed(1)}, Funding=+${fundingBonus.toFixed(1)}, Final=${finalScore.toFixed(1)}`);
    }
    
    // Clamp final score to reasonable bounds
    finalScore = Math.max(5, Math.min(95, finalScore));
    rawScoresSoA.set(candidate.id, finalScore);
  }
  
  // Calculate proportional normalization
  let totalScore = 0;
  for (const score of rawScoresSoA.values()) {
    totalScore += score;
  }
  
  const avgScore = totalScore / rawScoresSoA.size;
  const normalizationFactor = avgScore > 0 ? 50 / avgScore : 1;
  
  // Build final results with enhanced candidate data
  for (const candidate of candidates) {
    const candidateId = candidate.id;
    const rawScore = rawScoresSoA.get(candidateId) || 0;
    const normalizedPolling = Math.round(rawScore * normalizationFactor);
    const candidateData = candidateDataSoA.get(candidateId);
    
    const baseData = politicians.base.get(candidateId);
    const stateData = politicians.state.get(candidateId);
    const attributesData = politicians.attributes.get(candidateId);
    const financesData = politicians.finances.get(candidateId);
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
      // Enhanced player metrics
      nameRecognition: candidateData?.nameRecognition || 0,
      approvalRating: candidateData?.approvalRating || 50,
      mediaBuzz: candidateData?.mediaBuzz || 0,
      campaignFunds: financesData?.campaignFunds || candidateData?.campaignFunds || 0,
      attributes: attributesData || candidate.attributes || {},
      ideologyScores: ideologyScores || candidate.ideologyScores || {},
      calculatedIdeology: baseData?.calculatedIdeology || candidate.calculatedIdeology,
      isPlayer: candidate.isPlayer || false,
      // Coalition breakdown for detailed analysis
      coalitionBreakdown: coalitionSoA.polling.get(candidateId) || new Map()
    });
  }
  
  return results;
}

/**
 * Electoral College polling calculation that uses state-level coalitions
 * This function orchestrates the entire electoral college process
 */
export function calculateElectoralCollegePolling(election, campaignData, politicians) {
  const { activeCampaign } = campaignData;
  
  if (!activeCampaign?.coalitionSystems) {
    console.warn("No coalition systems available for electoral college calculation");
    return calculateStandardElectionPolling(election, campaignData, politicians);
  }

  const candidates = Array.isArray(election.candidates) ? 
    election.candidates : Array.from(election.candidates.values());
    
  // Get country data for states
  const countryData = activeCampaign.country || activeCampaign.availableCountries?.find(c => c.id === activeCampaign.countryId);
  
  if (!countryData) {
    console.warn("No country data available for electoral college");
    return calculateStandardElectionPolling(election, campaignData, politicians);
  }

  // Calculate electoral college results using our coalition system
  const electoralResults = calculateElectoralCollegeResults(candidates, activeCampaign, countryData);
  
  // Convert electoral college results back to polling format for UI compatibility
  const results = new Map();
  
  candidates.forEach(candidate => {
    const electoralVotes = electoralResults.candidateElectoralVotes.get(candidate.id) || 0;
    const statesWon = electoralResults.summary.statesWon.get(candidate.id) || [];
    
    // Calculate "polling" based on electoral votes for UI display
    const electoralPercentage = Math.round((electoralVotes / 538) * 100);
    
    // Get candidate data from SoA for UI display
    const baseData = politicians.base.get(candidate.id);
    const stateData = politicians.state.get(candidate.id);
    const attributesData = politicians.attributes.get(candidate.id);
    const ideologyScores = politicians.ideologyScores.get(candidate.id);
    
    results.set(candidate.id, {
      id: candidate.id,
      name: baseData?.name || candidate.name || 'Unknown Candidate',
      party: baseData?.partyName || candidate.party || 'Independent',
      partyName: baseData?.partyName || candidate.partyName || 'Independent',
      partyColor: baseData?.partyColor || candidate.partyColor || '#888888',
      age: baseData?.age || candidate.age,
      
      // Electoral college specific data
      electoralVotes: electoralVotes,
      polling: electoralPercentage, // Use electoral percentage as "polling" for UI
      statesWon: statesWon.length,
      stateDetails: statesWon,
      
      // Standard polling data
      nameRecognition: stateData?.nameRecognition || candidate.nameRecognition || 0,
      approvalRating: stateData?.approvalRating || candidate.approvalRating || 50,
      mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz || 0,
      attributes: attributesData || candidate.attributes || {},
      ideologyScores: ideologyScores || candidate.ideologyScores || {},
      calculatedIdeology: baseData?.calculatedIdeology || candidate.calculatedIdeology,
      isPlayer: candidate.isPlayer || false,
      
      // Electoral metadata
      isElectoralCollegeCandidate: true,
      electoralResults: electoralResults
    });
  });
  
  return results;
}

/**
 * Fallback to standard election polling when electoral college isn't applicable
 */
function calculateStandardElectionPolling(election, campaignData, politicians) {
  return calculateCoalitionBasedPolling(election, campaignData, politicians);
}

/**
 * Drop-in replacement for the original normalizePolling function
 */
export function normalizePollingOptimized(candidates, totalPopulationContext = 0, isSimulationMode = false) {
  // For player elections, bypass cache to ensure fresh calculations
  return pollingOptimizer.normalizePollingFast(candidates, totalPopulationContext, isSimulationMode, null);
}
