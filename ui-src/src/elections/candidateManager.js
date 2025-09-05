import { generateFullAIPolitician } from "../entities/personnel";
import { normalizePollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";

/**
 * Generates AI candidates for a specific race
 */
export const generateCandidatesForRace = (parties, selectedCountryId, totalPopulation) => {
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

  const normalizedCandidatesMap = normalizePollingOptimized(
    newCandidates,
    totalPopulation
  );
  const finalCandidates = Array.from(normalizedCandidatesMap.values());

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