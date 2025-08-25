// src/General Scripts/OptimizedElectionGeneration.js

import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData.js";
import { getRandomElement, getRandomInt } from "../utils/core.js";
import { calculateIdeologyDistance, calculateIdeologyFromStances } from "../entities/personnel.js";
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
   * Generate policy stances with caching
   */
  generatePolicyStances(targetIdeology) {
    const cacheKey = targetIdeology.name;
    if (this.policyStanceCache.has(cacheKey)) {
      const cached = this.policyStanceCache.get(cacheKey);
      // Add some randomization to cached stances
      return this.addStanceVariation(cached);
    }

    const targetIdealPoint = targetIdeology.idealPoint;
    const policyStances = {};

    // Pre-calculate distances for all policy options
    const questionDistances = POLICY_QUESTIONS.map(question => {
      if (!question.options || question.options.length === 0) {
        return { question, sortedOptions: [] };
      }

      const sortedOptions = question.options
        .map(option => {
          const effects = option.axis_effects || option.ideologyEffect;
          if (!effects) return { option, distance: Infinity };
          const distance = calculateIdeologyDistance(targetIdealPoint, effects);
          return { option, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      return { question, sortedOptions };
    });

    // Generate stances based on pre-calculated distances
    questionDistances.forEach(({ question, sortedOptions }) => {
      if (sortedOptions.length === 0) return;

      const bestOption = sortedOptions[0]?.option;
      const secondBestOption = sortedOptions[1]?.option;
      const thirdBestOption = sortedOptions[2]?.option;

      const roll = Math.random();
      if (bestOption && roll < 0.9) {
        policyStances[question.id] = bestOption.value;
      } else if (secondBestOption && roll < 0.98) {
        policyStances[question.id] = secondBestOption.value;
      } else if (thirdBestOption) {
        policyStances[question.id] = thirdBestOption.value;
      } else {
        policyStances[question.id] = bestOption
          ? bestOption.value
          : getRandomElement(question.options).value;
      }
    });

    this.policyStanceCache.set(cacheKey, policyStances);
    return policyStances;
  }

  /**
   * Add variation to cached policy stances
   */
  addStanceVariation(basedStances) {
    const varied = { ...basedStances };
    // Randomly vary 10% of stances
    const stanceKeys = Object.keys(varied);
    const numToVary = Math.floor(stanceKeys.length * 0.1);
    
    for (let i = 0; i < numToVary; i++) {
      const randomKey = getRandomElement(stanceKeys);
      const question = POLICY_QUESTIONS.find(q => q.id === randomKey);
      if (question?.options) {
        varied[randomKey] = getRandomElement(question.options).value;
      }
    }
    
    return varied;
  }

  /**
   * Find best party fit with caching
   */
  findBestPartyFit(ideologyScores, allPartiesInScope, forcePartyId = null) {
    if (forcePartyId) {
      return allPartiesInScope.find(p => p.id === forcePartyId);
    }

    const cacheKey = JSON.stringify(ideologyScores);
    if (this.partyFitCache.has(cacheKey)) {
      const cachedPartyId = this.partyFitCache.get(cacheKey);
      return allPartiesInScope.find(p => p.id === cachedPartyId);
    }

    let bestPartyFitDistance = Infinity;
    let chosenParty = null;
    const INDEPENDENT_THRESHOLD = 25.0;

    allPartiesInScope.forEach(party => {
      if (party.ideologyScores) {
        const distance = calculateIdeologyDistance(ideologyScores, party.ideologyScores);
        if (distance < bestPartyFitDistance) {
          bestPartyFitDistance = distance;
          chosenParty = party;
        }
      }
    });

    if (bestPartyFitDistance > INDEPENDENT_THRESHOLD) {
      chosenParty = null;
    }

    if (chosenParty) {
      this.partyFitCache.set(cacheKey, chosenParty.id);
    }

    return chosenParty;
  }

  /**
   * Batch generate multiple politicians efficiently
   */
  batchGeneratePoliticians(count, countryId, allPartiesInScope, options = {}) {
    this.cleanCache();
    
    // Early exit for zero count
    if (count <= 0) return [];
    
    const politicians = [];
    const { forcePartyId = null } = options;
    const usedIds = new Set(); // Track used IDs to prevent duplicates
    const usedNames = new Set(); // Track used names to prevent duplicates
    const batchId = Date.now(); // Single timestamp for the batch

    // Pre-determine target ideologies for batch
    const targetIdeologies = [];
    for (let i = 0; i < count; i++) {
      let targetIdeology;
      if (forcePartyId) {
        const forcedParty = allPartiesInScope.find(p => p.id === forcePartyId);
        targetIdeology = IDEOLOGY_DEFINITIONS[forcedParty?.ideologyId] || 
                        getRandomElement(Object.values(IDEOLOGY_DEFINITIONS));
      } else {
        const ideologyWeights = allPartiesInScope
          .map(p => p.ideologyId)
          .filter(Boolean);
        const randomIdeologyId = getRandomElement(
          ideologyWeights.length > 0 ? ideologyWeights : Object.keys(IDEOLOGY_DEFINITIONS)
        );
        targetIdeology = IDEOLOGY_DEFINITIONS[randomIdeologyId];
      }
      targetIdeologies.push(targetIdeology);
    }

    // Generate politicians in batch
    for (let i = 0; i < count; i++) {
      const targetIdeology = targetIdeologies[i];
      
      // Generate policy stances (with caching)
      const policyStances = this.generatePolicyStances(targetIdeology);
      
      // Calculate ideology from stances
      const { ideologyName: calculatedIdeology, scores: ideologyScores } =
        calculateIdeologyFromStances(policyStances, POLICY_QUESTIONS, IDEOLOGY_DEFINITIONS);

      // Find best party fit (with caching)
      const chosenParty = this.findBestPartyFit(ideologyScores, allPartiesInScope, forcePartyId);

      // Generate unique name
      const name = this.generateCachedName(countryId, usedNames);

      // Generate proper structured politician object compatible with SoA storage
      const firstName = name.split(' ')[0] || 'Unknown';
      const lastName = name.split(' ').slice(1).join(' ') || 'Candidate';
      const age = getRandomInt(25, 75);
      const sex = Math.random() > 0.5 ? 'M' : 'F';
      
      // Generate unique ID for this politician
      let uniqueId;
      let attempts = 0;
      do {
        uniqueId = `ai_politician_${batchId}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        attempts++;
      } while (usedIds.has(uniqueId) && attempts < 10);
      
      usedIds.add(uniqueId);
      
      const politician = {
        id: uniqueId,
        firstName,
        lastName,
        name,
        age,
        sex,
        partyId: chosenParty?.id || `independent_ai_${Date.now()}_${i}`,
        partyName: chosenParty?.name || "Independent",
        partyColor: chosenParty?.color || "#888888",
        calculatedIdeology: calculatedIdeology,
        ideologyScores,
        policyStances,
        isAI: true,
        isPlayer: false,
        
        // Attributes object
        attributes: {
          charisma: getRandomInt(30, 90),
          intelligence: getRandomInt(40, 95),
          integrity: getRandomInt(20, 90),
          stamina: getRandomInt(50, 100),
        },
        
        // Background object
        background: {
          experience: getRandomInt(1, 20),
          education: getRandomElement(['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Law Degree']),
          profession: getRandomElement(['Lawyer', 'Business Owner', 'Teacher', 'Doctor', 'Engineer', 'Activist']),
        },
        
        // Financial data
        treasury: getRandomInt(5000, 50000),
        campaignFunds: getRandomInt(10000, 100000),
        
        // State data
        politicalCapital: getRandomInt(10, 50),
        nameRecognition: Math.random() * 20,
        approvalRating: 50 + Math.random() * 30 - 15, // 35-65 range
        mediaBuzz: Math.random() * 10,
        partySupport: 50 + Math.random() * 40 - 20, // 30-70 range
        polling: 50 + Math.random() * 30, // Base score with variation
        baseScore: 50 + Math.random() * 30,
        
        // Campaign data
        isInCampaign: false,
        workingHours: getRandomInt(6, 12),
        maxWorkingHours: 16,
        campaignHoursPerDay: getRandomInt(6, 10),
        campaignHoursRemainingToday: 8,
        volunteerCount: getRandomInt(0, 15),
        currentAdStrategy: { focus: "none", targetId: null, intensity: 0 },
        
        // Office data
        currentOffice: null,
        factionId: null,
      };

      politicians.push(politician);
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
    case "ElectoralCollege":
      return handleOptimizedFPTPParticipants({
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

  // Batch generate challengers
  if (numberOfChallengersToGenerate > 0) {
    const newChallengers = generatePoliticiansBatch(
      numberOfChallengersToGenerate,
      countryId,
      partiesInScope,
      {}
    );

    // Handle party representation conflicts
    const processedChallengers = [];
    const representedParties = new Set(candidates.map(c => c.partyId));

    newChallengers.forEach(challenger => {
      if (challenger.partyId !== "independent" && representedParties.has(challenger.partyId)) {
        challenger.partyId = `independent_ai_${challenger.id}`;
        challenger.partyName = "Independent";
        challenger.partyColor = "#888888";
      }
      representedParties.add(challenger.partyId);
      processedChallengers.push(challenger);
    });

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
    
    // Generate list candidates
    const listCandidates = generatePoliticiansBatch(
      listSize,
      countryId,
      partiesInScope,
      { forcePartyId: party.id }
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
      partiesInScope,
      { forcePartyId: party.id }
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
    partiesInScope,
    {}
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
