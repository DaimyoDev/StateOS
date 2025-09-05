import { generateFullAIPolitician } from "../entities/personnel";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";
import { calculateCoalitionPolling, aggregateCoalitionPolling } from "../General Scripts/CoalitionSystem.js";

/**
 * Generates AI candidates for a specific race
 */
export const generateCandidatesForRace = (parties, selectedCountryId, totalPopulation, coalitionSoA = null) => {
  if (parties.length === 0) {
    return { success: false, message: "No parties configured." };
  }

  const newCandidates = parties
    .map((party) => {
      const pol = generateFullAIPolitician(
        selectedCountryId,
        parties,
        { forcePartyId: party.id }
      );
      return pol
        ? {
            ...pol,
            name: `${pol.firstName} ${pol.lastName}`,
            baseScore: pol.polling,
          }
        : null;
    })
    .filter(Boolean);

  // Use coalition-based polling if coalitions are available
  let finalCandidates;
  if (coalitionSoA && coalitionSoA.base && coalitionSoA.base.size > 0) {
    finalCandidates = calculateCoalitionBasedPolling(newCandidates, coalitionSoA, totalPopulation);
  } else {
    // Fallback to original normalized polling
    const normalizedCandidatesMap = normalizePollingOptimized(
      newCandidates,
      totalPopulation
    );
    finalCandidates = Array.from(normalizedCandidatesMap.values());
  }

  return { success: true, candidates: finalCandidates };
};

/**
 * Adds politicians from saved collection to a race
 */
export const addSavedPoliticiansToRace = (politiciansToAdd, currentRaceCandidates, parties, totalPopulation) => {
  const newCandidatesForRace = [...currentRaceCandidates];
  
  politiciansToAdd.forEach((p) => {
    if (!newCandidatesForRace.some((c) => c.id === p.id)) {
      const party = parties.find((party) => party.id === p.partyId);
      newCandidatesForRace.push({
        ...p,
        name: `${p.firstName} ${p.lastName}`,
        partyName: party?.name || "Independent",
        partyColor: party?.color || "#888888",
        baseScore: 5,
      });
    }
  });

  const normalized = normalizePollingOptimized(
    newCandidatesForRace,
    totalPopulation
  );
  
  return Array.from(normalized.values());
};

/**
 * Removes candidate from race
 */
export const removeCandidateFromRace = (candidateId, currentRaceCandidates) => {
  return currentRaceCandidates.filter(c => c.id !== candidateId);
};

/**
 * Updates candidate information
 */
export const updateCandidateInRace = (updatedCandidate, currentRaceCandidates) => {
  return currentRaceCandidates.map((c) =>
    c.id === updatedCandidate.id ? updatedCandidate : c
  );
};

/**
 * Processes saved politicians from SoA structure for display
 */
export const processSavedPoliticians = (savedPoliticians, currentCandidates) => {
  const currentCandidateIds = new Set(
    (currentCandidates || []).map((c) => c.id)
  );
  
  // Convert SoA structure to array of politician objects
  const politiciansArray = [];
  if (savedPoliticians && savedPoliticians.base) {
    for (const [id, baseData] of savedPoliticians.base) {
      const politician = {
        ...baseData,
        attributes: savedPoliticians.attributes?.get(id) || {},
        policyStances: savedPoliticians.policyStances?.get(id) || {},
        ideologyScores: savedPoliticians.ideologyScores?.get(id) || {},
        finances: savedPoliticians.finances?.get(id) || {},
        background: savedPoliticians.background?.get(id) || {},
        state: savedPoliticians.state?.get(id) || {},
        campaign: savedPoliticians.campaign?.get(id) || {},
      };
      politiciansArray.push(politician);
    }
  }
  
  return politiciansArray.filter((p) => !currentCandidateIds.has(p.id));
};

/**
 * Simple aggregation of coalition polling scores
 */
const aggregatePollingScores = (coalitionScores, coalitionSoA) => {
  if (!coalitionScores || coalitionScores.size === 0) return 0;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Weight each coalition's score by its size
  for (const [coalitionId, score] of coalitionScores) {
    const coalitionBase = coalitionSoA.base.get(coalitionId);
    if (coalitionBase) {
      const coalitionSize = coalitionBase.size || 1;
      weightedSum += score * coalitionSize;
      totalWeight += coalitionSize;
    }
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Calculate coalition-based polling for candidates
 */
export const calculateCoalitionBasedPolling = (candidates, coalitionSoA, totalPopulation) => {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  const candidatesWithCoalitionScores = candidates.map(candidate => {
    // Calculate how this candidate polls with each coalition
    const coalitionScores = calculateCoalitionPolling(candidate.id, candidate, coalitionSoA);
    
    // Aggregate the coalition polling to get overall polling percentage
    const overallPolling = aggregatePollingScores(coalitionScores, coalitionSoA);
    
    return {
      ...candidate,
      polling: Math.max(1, Math.min(99, overallPolling)), // Clamp between 1-99%
      coalitionScores: coalitionScores // Store for debugging/analysis
    };
  });

  // Normalize to 100%
  const totalPolling = candidatesWithCoalitionScores.reduce((sum, c) => sum + c.polling, 0);
  
  if (totalPolling === 0) {
    // If all candidates have 0 polling, distribute evenly
    const equalShare = 100 / candidates.length;
    return candidatesWithCoalitionScores.map(candidate => ({
      ...candidate,
      polling: equalShare
    }));
  }

  return candidatesWithCoalitionScores.map(candidate => ({
    ...candidate,
    polling: (candidate.polling / totalPolling) * 100
  }));
};

/**
 * Repoll candidates using coalition-based calculations
 */
export const repollCandidatesWithCoalitions = (candidates, coalitionSoA, totalPopulation) => {
  if (!coalitionSoA || !coalitionSoA.base || coalitionSoA.base.size === 0) {
    // Fallback to simple normalization if no coalitions
    const normalizedCandidatesMap = normalizePollingOptimized(candidates, totalPopulation);
    return Array.from(normalizedCandidatesMap.values());
  }

  return calculateCoalitionBasedPolling(candidates, coalitionSoA, totalPopulation);
};