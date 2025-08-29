// src/General Scripts/OptimizedElectionGeneration.js

import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData.js";
import { getRandomElement, getRandomInt } from "../utils/core.js";
import { calculateIdeologyDistance, calculateIdeologyFromStances, generateFullAIPolitician } from "../entities/personnel.js";
import useGameStore from "../store.js";
import {POLICY_QUESTIONS} from "../data/policyData.js";
/**
 * Optimized politician generation with caching and batch processing
 */
class OptimizedPoliticianGenerator {
  constructor() {
    this.ideologyCache = new Map();
    this.partyFitCache = new Map();
    this.policyStanceCache = new Map();
    this.nameCache = new Map();
    this.lastCacheClean = Date.now();
    this.CACHE_LIFETIME = 300000; // 5 minutes
  }

  /**
   * Clean expired cache entries
   */
  cleanCache() {
    const now = Date.now();
    if (now - this.lastCacheClean < this.CACHE_LIFETIME) return;

    this.ideologyCache.clear();
    this.partyFitCache.clear();
    this.policyStanceCache.clear();
    this.nameCache.clear();
    this.lastCacheClean = now;
  }

  /**
   * Generate policy stances aligned with party ideology
   */
  generatePolicyStancesForParty(party, isIndependent = false) {
    if (isIndependent) {
      // Truly random stances for independents
      return this.generateRandomPolicyStances();
    }

    const cacheKey = `party_${party.id}`;
    if (this.policyStanceCache.has(cacheKey)) {
      const cached = this.policyStanceCache.get(cacheKey);
      // Add minor variation to cached party stances
      return this.addMinorStanceVariation(cached);
    }

    const partyIdeology = party.ideologyScores;
    const policyStances = {};

    // Generate stances that align with party ideology
    POLICY_QUESTIONS.forEach(question => {
      if (!question.options || question.options.length === 0) {
        policyStances[question.id] = 50;
        return;
      }

      // Find option that best matches party ideology
      let bestOption = null;
      let bestScore = -Infinity;

      question.options.forEach(option => {
        const effects = option.ideologyEffect;
        if (!effects) return;

        // Calculate alignment score with party ideology
        let alignmentScore = 0;
        let dimensionsCompared = 0;

        Object.keys(partyIdeology).forEach(dimension => {
          if (effects[dimension] !== undefined) {
            // Positive alignment when effects match party's ideological direction
            alignmentScore += effects[dimension] * partyIdeology[dimension];
            dimensionsCompared++;
          }
        });

        if (dimensionsCompared > 0) {
          alignmentScore /= dimensionsCompared;
          if (alignmentScore > bestScore) {
            bestScore = alignmentScore;
            bestOption = option;
          }
        }
      });

      // 15% chance to pick a different option for variety
      if (Math.random() < 0.15 && question.options.length > 1) {
        const alternatives = question.options.filter(opt => opt !== bestOption);
        bestOption = alternatives[Math.floor(Math.random() * alternatives.length)];
      }

      // Convert to numeric stance
      if (bestOption && bestOption.ideologyEffect) {
        const effects = bestOption.ideologyEffect;
        let stanceScore = 50;
        
        if (effects.economic !== undefined) stanceScore += effects.economic * 5;
        if (effects.personal_liberty !== undefined) stanceScore += effects.personal_liberty * 3;
        if (effects.state_intervention_scope !== undefined) stanceScore += effects.state_intervention_scope * 4;
        if (effects.societal_focus !== undefined) stanceScore += effects.societal_focus * 2;
        
        policyStances[question.id] = Math.max(0, Math.min(100, stanceScore));
      } else {
        policyStances[question.id] = 50;
      }
    });

    this.policyStanceCache.set(cacheKey, policyStances);
    return policyStances;
  }

  /**
   * Generate numeric policy stances based on ideology scores
   */
  generateNumericPolicyStances(ideologyScores) {
    const policyStances = {};
    
    POLICY_QUESTIONS.forEach(question => {
      if (!question.options || question.options.length === 0) {
        policyStances[question.id] = 50;
        return;
      }

      // Find the option that best matches the ideology scores
      let bestOption = null;
      let bestScore = -Infinity;
      
      question.options.forEach(option => {
        if (option.ideologyEffect) {
          const effects = option.ideologyEffect;
          let alignmentScore = 0;
          
          // Calculate alignment with ideology scores
          if (effects.economic !== undefined && ideologyScores.economic !== undefined) {
            alignmentScore += effects.economic * ideologyScores.economic;
          }
          if (effects.personal_liberty !== undefined && ideologyScores.personal_liberty !== undefined) {
            alignmentScore += effects.personal_liberty * ideologyScores.personal_liberty;
          }
          if (effects.state_intervention_scope !== undefined && ideologyScores.state_intervention_scope !== undefined) {
            alignmentScore += effects.state_intervention_scope * ideologyScores.state_intervention_scope;
          }
          if (effects.societal_focus !== undefined && ideologyScores.societal_focus !== undefined) {
            alignmentScore += effects.societal_focus * ideologyScores.societal_focus;
          }
          
          if (alignmentScore > bestScore) {
            bestScore = alignmentScore;
            bestOption = option;
          }
        }
      });
      
      // Convert best option to numeric stance
      if (bestOption && bestOption.ideologyEffect) {
        const effects = bestOption.ideologyEffect;
        let stanceScore = 50;
        
        if (effects.economic !== undefined) stanceScore += effects.economic * 5;
        if (effects.personal_liberty !== undefined) stanceScore += effects.personal_liberty * 3;
        if (effects.state_intervention_scope !== undefined) stanceScore += effects.state_intervention_scope * 4;
        if (effects.societal_focus !== undefined) stanceScore += effects.societal_focus * 2;
        
        policyStances[question.id] = Math.max(0, Math.min(100, stanceScore));
      } else {
        policyStances[question.id] = 50;
      }
    });

    return policyStances;
  }

  /**
   * Generate completely random policy stances for independents
   */
  generateRandomPolicyStances() {
    const policyStances = {};
    
    POLICY_QUESTIONS.forEach(question => {
      // Random stance between 0-100
      policyStances[question.id] = Math.random() * 100;
    });
    
    return policyStances;
  }

  /**
   * Add minor variation to party-aligned stances (smaller changes)
   */
  addMinorStanceVariation(basedStances) {
    const varied = { ...basedStances };
    // Only vary 5% of stances for party candidates
    const stanceKeys = Object.keys(varied);
    const numToVary = Math.floor(stanceKeys.length * 0.05);
    
    for (let i = 0; i < numToVary; i++) {
      const randomKey = getRandomElement(stanceKeys);
      const currentValue = varied[randomKey];
      
      // Small random adjustment (+/- 10 points)
      const adjustment = (Math.random() - 0.5) * 20;
      varied[randomKey] = Math.max(0, Math.min(100, currentValue + adjustment));
    }
    
    return varied;
  }


  /**
   * Batch generate multiple politicians efficiently using generateFullAIPolitician
   */
  batchGeneratePoliticians(count, countryId, allPartiesInScope, options = {}) {
    this.cleanCache();
    
    const usedIds = new Set();
    const politicians = [];

    // Sort parties by popularity (highest first)
    const sortedParties = [...allPartiesInScope].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    let candidatesGenerated = 0;
    let partyIndex = 0;

    while (candidatesGenerated < count) {
      let chosenParty = null;
      let forcePartyId = null;

      // 10% chance for independent candidate
      if (Math.random() < 0.1) {
        // Leave forcePartyId as null for independent
      } else if (sortedParties.length > 0) {
        // Assign to next party in priority order
        chosenParty = sortedParties[partyIndex % sortedParties.length];
        forcePartyId = chosenParty.id;
        partyIndex++;
      }

      // Use generateFullAIPolitician to create complete politician with background data
      const politician = generateFullAIPolitician(
        countryId,
        allPartiesInScope,
        {
          forcePartyId,
          cityId: options.cityId || null,
          regionId: options.regionId || null,
        }
      );

      // Ensure unique ID
      let attempts = 0;
      while (usedIds.has(politician.id) && attempts < 10) {
        // Regenerate if duplicate ID
        const newPolitician = generateFullAIPolitician(
          countryId,
          allPartiesInScope,
          {
            forcePartyId,
            cityId: options.cityId || null,
            regionId: options.regionId || null,
          }
        );
        politician.id = newPolitician.id;
        attempts++;
      }
      
      if (usedIds.has(politician.id)) {
        // Last resort: modify the ID directly
        politician.id = `${politician.id}_${Date.now()}_${candidatesGenerated}`;
      }
      
      usedIds.add(politician.id);

      // Add election-specific properties
      politician.baseScore = getRandomInt(15, 35);
      politician.nameRecognition = getRandomInt(5, 25);
      politician.campaignFunds = getRandomInt(10000, 100000);
      politician.endorsements = [];
      
      // Campaign data
      politician.isInCampaign = false;
      politician.workingHours = getRandomInt(6, 12);
      politician.maxWorkingHours = 16;
      politician.campaignHoursPerDay = getRandomInt(6, 10);
      politician.campaignHoursRemainingToday = 8;
      politician.volunteerCount = getRandomInt(0, 15);
      politician.currentAdStrategy = { focus: "none", targetId: null, intensity: 0 };

      politicians.push(politician);
      candidatesGenerated++;
    }

    return politicians;
  }

  /**
   * Generate name with caching
   */
  generateCachedName(countryId, usedNames = new Set()) {
    let attempts = 0;
    let name;
    
    // Generate unique names, avoid caching to prevent duplicates
    do {
      name = useGameStore.getState().actions.generateDynamicName({ countryId });
      attempts++;
    } while (usedNames.has(name) && attempts < 20);
    
    usedNames.add(name);
    return name;
  }

  /**
   * Static method for external compatibility - uses generateFullAIPolitician
   */
  static batchGeneratePoliticians(count, countryId, allPartiesInScope, options = {}) {
    const generator = new OptimizedPoliticianGenerator();
    return generator.batchGeneratePoliticians(count, countryId, allPartiesInScope, options);
  }

  /**
   * Remove duplicate candidates from same party, convert some to independents
   */
  static removeDuplicatePartyCandidates(candidates) {
    const partyCount = new Map();
    const processedCandidates = [];
    
    // Count candidates per party
    candidates.forEach(candidate => {
      const partyId = candidate.partyId;
      if (partyId && !partyId.includes('independent')) {
        partyCount.set(partyId, (partyCount.get(partyId) || 0) + 1);
      }
    });
    
    // Process candidates, handling duplicates
    const partyProcessed = new Map();
    
    candidates.forEach(candidate => {
      const partyId = candidate.partyId;
      
      // Independent candidates always pass through
      if (!partyId || partyId.includes('independent')) {
        processedCandidates.push(candidate);
        return;
      }
      
      const processedCount = partyProcessed.get(partyId) || 0;
      
      // Allow first candidate from each party
      if (processedCount === 0) {
        processedCandidates.push(candidate);
        partyProcessed.set(partyId, 1);
      } else {
        // 10% chance to convert duplicate to independent, otherwise remove
        if (Math.random() < 0.1) {
          const independentCandidate = {
            ...candidate,
            partyId: `independent_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            partyName: "Independent",
            partyColor: "#888888"
          };
          processedCandidates.push(independentCandidate);
        }
        // Otherwise, candidate is removed (not added to processedCandidates)
      }
    });
    
    return processedCandidates;
  }
}

// Create singleton instance
const optimizedGenerator = new OptimizedPoliticianGenerator();

/**
 * Optimized batch politician generation
 */
export function generatePoliticiansBatch(count, countryId, allPartiesInScope, options = {}) {
  return optimizedGenerator.batchGeneratePoliticians(count, countryId, allPartiesInScope, options);
}

/**
 * Remove duplicate candidates from same party, convert some to independents
 */
export function removeDuplicatePartyCandidates(candidates) {
  const partyCount = new Map();
  const processedCandidates = [];
  
  // Count candidates per party
  candidates.forEach(candidate => {
    const partyId = candidate.partyId;
    if (partyId && !partyId.includes('independent')) {
      partyCount.set(partyId, (partyCount.get(partyId) || 0) + 1);
    }
  });
  
  // Process candidates, handling duplicates
  const partyProcessed = new Map();
  
  candidates.forEach(candidate => {
    const partyId = candidate.partyId;
    
    // Independent candidates always pass through
    if (!partyId || partyId.includes('independent')) {
      processedCandidates.push(candidate);
      return;
    }
    
    const processedCount = partyProcessed.get(partyId) || 0;
    
    // Allow first candidate from each party
    if (processedCount === 0) {
      processedCandidates.push(candidate);
      partyProcessed.set(partyId, 1);
    } else {
      // 10% chance to convert duplicate to independent, otherwise remove
      if (Math.random() < 0.1) {
        const independentCandidate = {
          ...candidate,
          partyId: `independent_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          partyName: "Independent",
          partyColor: "#888888"
        };
        processedCandidates.push(independentCandidate);
      }
      // Otherwise, candidate is removed (not added to processedCandidates)
    }
  });
  
  return processedCandidates;
}

/**
 * Optimized election participant generation with reduced redundancy
 */
export function generateOptimizedElectionParticipants({
  electionType,
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) {
  // Early validation
  if (!electionType || !partiesInScope || partiesInScope.length === 0) {
    return null;
  }

  const system = electionType.electoralSystem;

  switch (system) {
    case "FPTP":
    case "TwoRoundSystem":
      return handleOptimizedFPTPParticipants({
        partiesInScope,
        incumbentInfo,
        countryId,
        activeCampaign,
        electionPropertiesForScoring,
        entityPopulation,
      });

    case "ElectoralCollege":
      return handleOptimizedElectoralCollegeParticipants({
        partiesInScope,
        incumbentInfo,
        countryId,
        activeCampaign,
        electionPropertiesForScoring,
        entityPopulation,
      });

    case "PartyListPR":
      return handleOptimizedPartyListPRParticipants({
        partiesInScope,
        numberOfSeatsToFill,
        countryId,
        activeCampaign,
        electionPropertiesForScoring,
        electionType,
      });

    case "MMP":
      return handleOptimizedMMPParticipants({
        partiesInScope,
        incumbentInfo,
        numberOfSeatsToFill,
        countryId,
        activeCampaign,
        electionPropertiesForScoring,
        electionType,
        entityPopulation,
      });

    case "SNTV_MMD":
    case "BlockVote":
    case "PluralityMMD":
      return handleOptimizedMMDParticipants({
        partiesInScope,
        incumbentInfo,
        numberOfSeatsToFill,
        countryId,
        activeCampaign,
        electionPropertiesForScoring,
        entityPopulation,
      });

    default:
      // Fall back to original implementation for other systems
      return null;
  }
}

/**
 * Optimized Electoral College participant generation
 * Similar to FPTP but with electoral college metadata
 */
function handleOptimizedElectoralCollegeParticipants({
  partiesInScope,
  incumbentInfo,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) {
  let candidates = [];
  const runningIncumbents = [];

  // Handle incumbents (current president if running for re-election)
  if (incumbentInfo) {
    const incumbentsArray = Array.isArray(incumbentInfo) ? incumbentInfo : [incumbentInfo];
    incumbentsArray.forEach(inc => {
      if (inc && inc.isActuallyRunning) {
        runningIncumbents.push({
          ...inc,
          isIncumbent: true,
          isPresidentialCandidate: true,
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  // For presidential elections, we want major party nominees + some independents
  // Usually 2 major party candidates + 1-3 independents/third parties
  const minTotal = Math.max(2, runningIncumbents.length);
  const maxTotal = Math.min(5, partiesInScope.length + 2);
  
  const targetTotalCandidates = getRandomInt(minTotal, maxTotal);
  const numberOfChallengersToGenerate = Math.max(0, targetTotalCandidates - candidates.length);

  // Batch generate challengers - prioritize major parties
  if (numberOfChallengersToGenerate > 0) {
    const newChallengers = generatePoliticiansBatch(
      numberOfChallengersToGenerate,
      countryId,
      partiesInScope
    );

    // Remove duplicates from same party (presidential nominees are unique per party)
    const processedChallengers = removeDuplicatePartyCandidates(newChallengers);

    // Add presidential candidate metadata
    processedChallengers.forEach(challenger => {
      challenger.isPresidentialCandidate = true;
      challenger.nationalCampaign = true;
      challenger.campaignFunds = challenger.campaignFunds * 100; // Presidential campaigns have much larger budgets
    });

    candidates.push(...processedChallengers);
  }

  // Convert to Map format expected by the system
  const candidatesMap = new Map();
  candidates.forEach((candidate) => {
    candidatesMap.set(candidate.id, {
      ...candidate,
      polling: Math.max(5, Math.random() * 40),
      isElectoralCollegeCandidate: true,
      electoralStrategy: {
        targetStates: [], // Could be populated with target swing states
        strongholdStates: [], // Could be populated with safe states
      }
    });
  });

  return { 
    type: "electoral_college_candidates", 
    data: candidatesMap,
    metadata: {
      electionType: "presidential",
      totalElectoralVotes: 538,
      neededToWin: 270
    }
  };
}

/**
 * Optimized FPTP participant generation
 */
function handleOptimizedFPTPParticipants({
  partiesInScope,
  incumbentInfo,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) {
  let candidates = [];
  const runningIncumbents = [];

  // Handle incumbents
  if (incumbentInfo) {
    const incumbentsArray = Array.isArray(incumbentInfo) ? incumbentInfo : [incumbentInfo];
    incumbentsArray.forEach(inc => {
      if (inc && inc.isActuallyRunning) {
        runningIncumbents.push({
          ...inc,
          isIncumbent: true,
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  // Calculate number of challengers needed
  const minTotal = runningIncumbents.length > 0 ? 2 : Math.min(2, partiesInScope.length);
  const maxTotal = runningIncumbents.length > 0 
    ? Math.max(minTotal, Math.min(5, partiesInScope.length + runningIncumbents.length))
    : Math.max(minTotal, Math.min(6, partiesInScope.length + 2));
  
  const targetTotalCandidates = getRandomInt(Math.max(1, minTotal), maxTotal);
  const numberOfChallengersToGenerate = Math.max(0, targetTotalCandidates - candidates.length);

  // Batch generate challengers using new party-priority system
  if (numberOfChallengersToGenerate > 0) {
    const newChallengers = generatePoliticiansBatch(
      numberOfChallengersToGenerate,
      countryId,
      partiesInScope
    );

    // Apply duplicate removal system to prevent multiple candidates from same party
    const processedChallengers = removeDuplicatePartyCandidates(newChallengers);

    candidates.push(...processedChallengers);
  }

  // Convert to Map format expected by the system
  const candidatesMap = new Map();
  candidates.forEach((candidate, index) => {
    candidatesMap.set(candidate.id, {
      ...candidate,
      polling: Math.max(5, Math.random() * 40), // Simple polling assignment
    });
  });

  return { type: "individual_candidates", data: candidatesMap };
}

/**
 * Optimized Party List PR participant generation
 */
function handleOptimizedPartyListPRParticipants({
  partiesInScope,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  electionType,
}) {
  const partyListsOutput = {};
  
  partiesInScope.forEach(party => {
    const blocSeats = electionType.minCouncilSeats || numberOfSeatsToFill;
    const listSize = Math.max(
      Math.floor(blocSeats * 0.5) + 1,
      Math.min(blocSeats + 10, getRandomInt(Math.max(3, blocSeats - 5), blocSeats + 15))
    );

    // Batch generate candidates for this party
    const partyCandidates = generatePoliticiansBatch(
      listSize,
      countryId,
      partiesInScope,
      { forcePartyId: party.id }
    );

    // Format candidates for party list
    partyListsOutput[party.id] = partyCandidates.map((candidate, index) => ({
      ...candidate,
      name: `${candidate.name} (${party.shortName || party.name} List #${index + 1})`,
      listPosition: index + 1,
      partyAffiliationReadOnly: {
        partyId: party.id,
        partyName: party.name,
        partyColor: party.color,
      },
    }));
  });

  return { type: "party_lists", data: partyListsOutput };
}

/**
 * Optimized Mixed Member Proportional (MMP) participant generation
 */
function handleOptimizedMMPParticipants({
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  electionType,
  entityPopulation,
}) {
  const mmpData = {
    partyLists: {},
    constituencyCandidatesByParty: {},
    independentConstituencyCandidates: [],
  };

  // Track used candidate IDs to prevent duplicates
  const usedCandidateIds = new Set();

  // Calculate constituency and list seats
  const constituencySeats = Math.floor(numberOfSeatsToFill * 0.5); // 50% constituency seats
  const listSeats = numberOfSeatsToFill - constituencySeats; // Remaining as list seats

  // Generate party lists for proportional representation
  partiesInScope.forEach(party => {
    const listSize = Math.max(3, Math.min(listSeats + 5, Math.floor(listSeats * 0.8)));
    
    // Generate list candidates using new party-priority system
    const listCandidates = generatePoliticiansBatch(
      listSize,
      countryId,
      [party] // Only this party for forced party generation
    );

    // Filter out any duplicate IDs and track used ones
    const uniqueListCandidates = listCandidates.filter(candidate => {
      if (usedCandidateIds.has(candidate.id)) {
        return false;
      }
      usedCandidateIds.add(candidate.id);
      return true;
    });

    mmpData.partyLists[party.id] = uniqueListCandidates.map((candidate, index) => ({
      ...candidate,
      displayName: `${candidate.name} (${party.shortName || party.name} List #${index + 1})`,
      listPosition: index + 1,
      partyAffiliationReadOnly: {
        partyId: party.id,
        partyName: party.name,
        partyColor: party.color,
      },
    }));

    // Generate constituency candidates
    const constituencyCandidateCount = Math.min(constituencySeats, Math.max(1, Math.floor(constituencySeats * 0.6)));
    const constituencyCandidates = generatePoliticiansBatch(
      constituencyCandidateCount,
      countryId,
      [party] // Only this party for forced party generation
    );

    // Filter out any duplicate IDs and track used ones
    const uniqueConstituencyCandidates = constituencyCandidates.filter(candidate => {
      if (usedCandidateIds.has(candidate.id)) {
        return false;
      }
      usedCandidateIds.add(candidate.id);
      return true;
    });

    mmpData.constituencyCandidatesByParty[party.id] = uniqueConstituencyCandidates.map(candidate => ({
      ...candidate,
      displayName: `${candidate.name} (${party.shortName || party.name} Constituency)`,
      isConstituencyCandidate: true,
    }));
  });

  // Generate independent constituency candidates
  const independentCount = Math.max(1, Math.floor(constituencySeats * 0.2));
  const independentCandidates = generatePoliticiansBatch(
    independentCount,
    countryId,
    partiesInScope
  );

  // Filter out any duplicate IDs and track used ones
  const uniqueIndependentCandidates = independentCandidates.filter(candidate => {
    if (usedCandidateIds.has(candidate.id)) {
      return false;
    }
    usedCandidateIds.add(candidate.id);
    return true;
  });

  mmpData.independentConstituencyCandidates = uniqueIndependentCandidates.map(candidate => ({
    ...candidate,
    partyId: `independent_ai_${candidate.id}`,
    partyName: "Independent",
    partyColor: "#888888",
    isConstituencyCandidate: true,
  }));

  return { type: "mmp_participants", data: mmpData };
}

/**
 * Optimized Multi-Member District (MMD) participant generation
 */
function handleOptimizedMMDParticipants({
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) {
  let candidates = [];
  const runningIncumbents = [];

  // Handle incumbents
  if (incumbentInfo) {
    const incumbentsArray = Array.isArray(incumbentInfo) ? incumbentInfo : [incumbentInfo];
    incumbentsArray.forEach(inc => {
      if (inc && inc.isActuallyRunning) {
        runningIncumbents.push({
          ...inc,
          isIncumbent: true,
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  // Calculate total candidates needed (more than seats for competitive election)
  const minCandidates = Math.max(numberOfSeatsToFill + 2, 6);
  const maxCandidates = Math.min(numberOfSeatsToFill * 3, 20);
  const targetTotalCandidates = getRandomInt(minCandidates, maxCandidates);
  const numberOfChallengersToGenerate = Math.max(0, targetTotalCandidates - candidates.length);

  // Batch generate challengers
  if (numberOfChallengersToGenerate > 0) {
    const newChallengers = generatePoliticiansBatch(
      numberOfChallengersToGenerate,
      countryId,
      partiesInScope,
      {}
    );

    // Handle party representation - allow multiple candidates per party in MMD
    const processedChallengers = [];
    const partyCandidateCounts = new Map();

    newChallengers.forEach(challenger => {
      const partyCount = partyCandidateCounts.get(challenger.partyId) || 0;
      const maxPerParty = Math.max(1, Math.floor(numberOfSeatsToFill / partiesInScope.length) + 1);

      if (challenger.partyId !== "independent" && partyCount >= maxPerParty) {
        // Convert excess candidates to independents
        challenger.partyId = `independent_ai_${challenger.id}`;
        challenger.partyName = "Independent";
        challenger.partyColor = "#888888";
      } else {
        partyCandidateCounts.set(challenger.partyId, partyCount + 1);
      }

      processedChallengers.push(challenger);
    });

    candidates.push(...processedChallengers);
  }

  // Convert to Map format expected by the system
  const candidatesMap = new Map();
  candidates.forEach(candidate => {
    candidatesMap.set(candidate.id, {
      ...candidate,
      polling: Math.max(5, Math.random() * 40),
      isMMDCandidate: true,
    });
  });

  return { type: "individual_candidates", data: candidatesMap };
}

export default optimizedGenerator;
