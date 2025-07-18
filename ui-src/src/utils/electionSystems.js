// ui-src/src/utils/electionSystems.js
import { BASE_IDEOLOGIES } from "../data/ideologiesData.js"; //
import { generateId, getRandomElement, getRandomInt } from "./generalUtils.js"; //
import {
  generateAICandidateNameForElection,
  generateFullAIPolitician,
  calculateBaseCandidateScore,
  normalizePolling,
} from "./electionUtils.js";

/**
 * Handles participant generation and initial setup for First-Past-The-Post (FPTP) elections,
 * including Two-Round System and Electoral College.
 * @param {object} params.electionType - The election type object.
 * @param {Array<object>} params.partiesInScope - List of available parties.
 * @param {object|Array<object>|null} params.incumbentInfo - Incumbent details.
 * @param {string} params.countryId - The ID of the country.
 * @param {object} params.activeCampaign - The active campaign state for score calculation context.
 * @param {object} params.electionPropertiesForScoring - Context for base score calculation.
 * @param {number} params.entityPopulation - Population of the entity for polling normalization.
 * @returns {object} { type: "individual_candidates", data: Array<object> } with baseScores and polling.
 */
export function handleFPTPParticipants({
  partiesInScope,
  incumbentInfo,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
  entityPopulation,
}) {
  let candidates = [];
  const runningIncumbents = [];

  if (incumbentInfo) {
    const incumbentsArray = Array.isArray(incumbentInfo)
      ? incumbentInfo
      : [incumbentInfo];
    incumbentsArray.forEach((inc) => {
      if (inc && inc.isActuallyRunning) {
        runningIncumbents.push({
          ...inc,
          isIncumbent: true,
          name: inc.name || generateAICandidateNameForElection(countryId),
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  let minTotal =
    runningIncumbents.length > 0
      ? 2
      : partiesInScope.length > 0
      ? Math.min(2, partiesInScope.length)
      : 2;
  minTotal = Math.max(1, minTotal);
  let maxTotal =
    runningIncumbents.length > 0
      ? Math.max(
          minTotal,
          Math.min(5, partiesInScope.length + runningIncumbents.length)
        )
      : Math.max(minTotal, Math.min(6, partiesInScope.length + 2));
  let targetTotalCandidates = getRandomInt(minTotal, maxTotal);

  const numberOfChallengersToGenerate = Math.max(
    0,
    targetTotalCandidates - candidates.length
  );
  let availablePartiesForChallengers = [...(partiesInScope || [])];

  for (let i = 0; i < numberOfChallengersToGenerate; i++) {
    let assignedPartyForChallenger = null;
    let partyIndexToTry = getRandomInt(
      0,
      availablePartiesForChallengers.length - 1
    );
    let potentialParty = availablePartiesForChallengers[partyIndexToTry];

    if (
      runningIncumbents.length > 0 &&
      potentialParty.id === runningIncumbents[0].partyId &&
      availablePartiesForChallengers.length > 1
    ) {
      const nonIncumbentParties = availablePartiesForChallengers.filter(
        (p) => p.id !== runningIncumbents[0].partyId
      );
      if (nonIncumbentParties.length > 0) {
        assignedPartyForChallenger = getRandomElement(nonIncumbentParties);
        if (
          numberOfChallengersToGenerate > 1 &&
          availablePartiesForChallengers.length > 1
        ) {
          availablePartiesForChallengers =
            availablePartiesForChallengers.filter(
              (p) => p.id !== assignedPartyForChallenger.id
            );
        }
      } else {
        assignedPartyForChallenger = potentialParty;
      }
    } else {
      assignedPartyForChallenger = potentialParty;
      if (
        numberOfChallengersToGenerate > 1 &&
        availablePartiesForChallengers.length > 1
      ) {
        availablePartiesForChallengers = availablePartiesForChallengers.filter(
          (p) => p.id !== assignedPartyForChallenger.id
        );
      }
    }

    if (!assignedPartyForChallenger) {
      if (
        partiesInScope.length > 0 &&
        Math.random() < 0.2 &&
        numberOfChallengersToGenerate > partiesInScope.length
      ) {
        assignedPartyForChallenger = getRandomElement(partiesInScope);
      } else {
        assignedPartyForChallenger = {
          id: `independent_ai_challenger_${generateId()}`,
          name: "Independent",
          ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
          color: "#888888",
        };
      }
    }

    const newChallenger = generateFullAIPolitician(
      assignedPartyForChallenger,
      false,
      countryId
    );
    if (!candidates.find((c) => c.id === newChallenger.id)) {
      candidates.push(newChallenger);
    } else {
      i--;
    }
  }

  candidates = candidates.map((cand) => ({
    ...cand,
    name: cand.name || generateAICandidateNameForElection(countryId),
  }));

  const candidatesWithScores = candidates.map((cand) => ({
    ...cand,
    baseScore: calculateBaseCandidateScore(
      cand,
      electionPropertiesForScoring,
      activeCampaign
    ),
  }));

  const eligibleVotersForPollingNorm = Math.floor(
    entityPopulation * (0.65 + Math.random() * 0.1)
  );

  const finalCandidates = normalizePolling(
    candidatesWithScores,
    eligibleVotersForPollingNorm
  );

  return { type: "individual_candidates", data: finalCandidates };
}

/**
 * Handles participant generation and initial setup for Party-List Proportional Representation (PartyListPR) elections.
 * @param {object} params.electionType - The election type object.
 * @param {Array<object>} params.partiesInScope - List of available parties.
 * @param {number} params.numberOfSeatsToFill - Total seats to fill in this instance.
 * @param {string} params.countryId - The ID of the country.
 * @param {object} params.activeCampaign - The active campaign state for score calculation context.
 * @param {object} params.electionPropertiesForScoring - Context for base score calculation.
 * @returns {object} { type: "party_lists", data: object } where data is partyId -> Array<candidateObject>.
 */
export function handlePartyListPRParticipants({
  electionType,
  partiesInScope,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
}) {
  const partyListsOutput = {};
  partiesInScope.forEach((party) => {
    const blocSeats = electionType.minCouncilSeats || numberOfSeatsToFill;
    const listSize = Math.max(
      Math.floor(blocSeats * 0.5) + 1,
      Math.min(
        blocSeats + 10,
        getRandomInt(Math.max(3, blocSeats - 5), blocSeats + 15)
      )
    );
    partyListsOutput[party.id] = [];
    for (let i = 0; i < listSize; i++) {
      const newCand = generateFullAIPolitician(party, false, countryId);
      partyListsOutput[party.id].push({
        ...newCand,
        name: `${newCand.name} (${party.shortName || party.name} List #${
          i + 1
        })`,
        listPosition: i + 1,
        partyAffiliationReadOnly: {
          partyId: party.id,
          partyName: party.name,
          partyColor: party.color,
        },
        baseScore: calculateBaseCandidateScore(
          newCand,
          electionPropertiesForScoring,
          activeCampaign
        ),
        polling: 0, // Individual polling not primary for list candidates
      });
    }
  });
  return { type: "party_lists", data: partyListsOutput };
}

/**
 * Handles participant generation and initial setup for Mixed-Member Proportional (MMP) elections.
 * @param {object} params.electionType - The election type object.
 * @param {Array<object>} params.partiesInScope - List of available parties.
 * @param {object|Array<object>|null} params.incumbentInfo - Incumbent details (for constituency part).
 * @param {number} params.numberOfSeatsToFill - Total seats to fill for the overall body.
 * @param {string} params.countryId - The ID of the country.
 * @param {object} params.activeCampaign - The active campaign state for score calculation context.
 * @param {object} params.electionPropertiesForScoring - Context for base score calculation.
 * @returns {object} { type: "mmp_participants", data: object } with partyLists and constituencyCandidatesByParty.
 */
export function handleMMPParticipants({
  electionType,
  partiesInScope,
  incumbentInfo,
  numberOfSeatsToFill,
  countryId,
  activeCampaign,
  electionPropertiesForScoring,
}) {
  const partyListsOutput = {};
  const partiesSubmittingLists = partiesInScope.filter((p) => !p.isIndependent);

  // 1. Generate Party Lists for MMP
  partiesSubmittingLists.forEach((party) => {
    const listSeatTarget = Math.ceil(
      numberOfSeatsToFill * (electionType.mmpListSeatsRatio || 0.5)
    );
    const listSize = Math.max(
      Math.floor(listSeatTarget * (electionType.listSizeFactor || 0.6)) + 1,
      getRandomInt(
        Math.max(3, listSeatTarget - (electionType.listSizeVarianceLow || 5)),
        listSeatTarget + (electionType.listSizeVarianceHigh || 10)
      )
    );

    partyListsOutput[party.id] = [];
    for (let i = 0; i < listSize; i++) {
      const newCand = generateFullAIPolitician(party, false, countryId);
      partyListsOutput[party.id].push({
        ...newCand,
        name: `${newCand.name} (${party.shortName || party.name} List #${
          i + 1
        })`,
        listPosition: i + 1,
        partyAffiliationReadOnly: {
          partyId: party.id,
          partyName: party.name,
          partyColor: party.color,
        },
        baseScore: calculateBaseCandidateScore(
          newCand,
          electionPropertiesForScoring,
          activeCampaign
        ),
        polling: 0,
      });
    }
  });

  // 2. Generate Constituency Candidates for MMP
  const constituencyCandidatesByParty = {};
  const approxConstituencySeats = Math.floor(
    numberOfSeatsToFill * (electionType.mmpConstituencySeatsRatio || 0.5)
  );

  partiesSubmittingLists.forEach((party) => {
    constituencyCandidatesByParty[party.id] = [];
    const numConstituencyCandsForParty = Math.max(
      1,
      Math.min(
        approxConstituencySeats,
        getRandomInt(
          Math.floor(approxConstituencySeats * 0.7),
          approxConstituencySeats + 5
        )
      )
    );

    for (let i = 0; i < numConstituencyCandsForParty; i++) {
      let newConstituencyCand;
      let attempts = 0;
      do {
        newConstituencyCand = generateFullAIPolitician(party, false, countryId);
        attempts++;
      } while (
        partyListsOutput[party.id]?.some(
          (listCand) => listCand.id === newConstituencyCand.id
        ) &&
        attempts < 10
      );

      constituencyCandidatesByParty[party.id].push({
        ...newConstituencyCand,
        isIncumbent:
          incumbentInfo?.partyId === party.id &&
          incumbentInfo?.isConstituencyWinner,
        baseScore: calculateBaseCandidateScore(
          newConstituencyCand,
          electionPropertiesForScoring,
          activeCampaign
        ),
      });
    }
  });

  let independentConstituencyCandidates = [];
  const numIndependentConstituencyCands = getRandomInt(
    0,
    Math.floor(approxConstituencySeats * 0.05)
  );
  for (let i = 0; i < numIndependentConstituencyCands; i++) {
    const indParty = {
      id: `independent_ai_const_mmp_${generateId()}`,
      name: "Independent",
      ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
      color: "#888888",
    };
    independentConstituencyCandidates.push(
      generateFullAIPolitician(indParty, false, countryId)
    );
  }

  return {
    type: "mmp_participants",
    data: {
      partyLists: partyListsOutput,
      constituencyCandidatesByParty: constituencyCandidatesByParty,
      independentConstituencyCandidates: independentConstituencyCandidates.map(
        (cand) => ({
          ...cand,
          baseScore: calculateBaseCandidateScore(
            cand,
            electionPropertiesForScoring,
            activeCampaign
          ),
        })
      ),
    },
  };
}

/**
 * Handles participant generation and initial setup for Multi-Member District (MMD) elections
 * like Single Non-Transferable Vote (SNTV) or Block Vote.
 * @param {object} params.electionType - The election type object.
 * @param {Array<object>} params.partiesInScope - List of available parties.
 * @param {object|Array<object>|null} params.incumbentInfo - Incumbent details.
 * @param {number} params.numberOfSeatsToFill - Total seats to fill in this instance.
 * @param {string} params.countryId - The ID of the country.
 * @param {object} params.activeCampaign - The active campaign state for score calculation context.
 * @param {object} params.electionPropertiesForScoring - Context for base score calculation.
 * @param {number} params.entityPopulation - Population of the entity for polling normalization.
 * @returns {object} { type: "individual_candidates", data: Array<object> } with baseScores and polling.
 */
export function handleMMDParticipants({
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

  if (incumbentInfo) {
    const incumbentsArray = Array.isArray(incumbentInfo)
      ? incumbentInfo
      : [incumbentInfo];
    incumbentsArray.forEach((inc) => {
      if (inc && inc.isActuallyRunning) {
        runningIncumbents.push({
          ...inc,
          isIncumbent: true,
          name: inc.name || generateAICandidateNameForElection(countryId),
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  let minFactor = 1.8;
  let maxFactor = 3.0;
  if (partiesInScope.length < 3) maxFactor = 2.5;
  if (numberOfSeatsToFill < 5) {
    minFactor = 2.0;
    maxFactor = 3.5;
  }

  let minCandidates = Math.max(
    numberOfSeatsToFill + 1,
    Math.floor(numberOfSeatsToFill * minFactor),
    runningIncumbents.length + 1
  );
  if (partiesInScope.length > 0) {
    minCandidates = Math.max(
      minCandidates,
      runningIncumbents.length + partiesInScope.length
    );
  }

  let maxCandidates = Math.max(
    minCandidates + Math.floor(numberOfSeatsToFill * 0.5),
    Math.floor(numberOfSeatsToFill * maxFactor)
  );
  maxCandidates = Math.min(maxCandidates, numberOfSeatsToFill + 30, 70);
  minCandidates = Math.min(minCandidates, maxCandidates);

  let targetTotalCandidates = getRandomInt(minCandidates, maxCandidates);
  targetTotalCandidates = Math.max(
    targetTotalCandidates,
    numberOfSeatsToFill + 1,
    runningIncumbents.length + (partiesInScope.length > 0 ? 1 : 0)
  );
  targetTotalCandidates = Math.max(1, targetTotalCandidates);

  const numberOfChallengersToGenerate = Math.max(
    0,
    targetTotalCandidates - candidates.length
  );
  let availablePartiesForChallengers = [...(partiesInScope || [])];
  let partyCycleIndex = 0;

  for (let i = 0; i < numberOfChallengersToGenerate; i++) {
    let assignedPartyForChallenger = null;
    if (availablePartiesForChallengers.length > 0) {
      assignedPartyForChallenger = {
        ...availablePartiesForChallengers[
          partyCycleIndex % availablePartiesForChallengers.length
        ],
      };
      partyCycleIndex++;
    }

    if (!assignedPartyForChallenger) {
      if (
        partiesInScope.length > 0 &&
        Math.random() < 0.2 &&
        numberOfChallengersToGenerate > partiesInScope.length
      ) {
        assignedPartyForChallenger = getRandomElement(partiesInScope);
      } else {
        assignedPartyForChallenger = {
          id: `independent_ai_challenger_${generateId()}`,
          name: "Independent",
          ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
          color: "#888888",
        };
      }
    }

    const newChallenger = generateFullAIPolitician(
      assignedPartyForChallenger,
      false,
      countryId
    );
    if (!candidates.find((c) => c.id === newChallenger.id)) {
      candidates.push(newChallenger);
    } else {
      i--;
    }
  }

  candidates = candidates.map((cand) => ({
    ...cand,
    name: cand.name || generateAICandidateNameForElection(countryId),
  }));

  const candidatesWithScores = candidates.map((cand) => ({
    ...cand,
    baseScore: calculateBaseCandidateScore(
      cand,
      electionPropertiesForScoring,
      activeCampaign
    ),
  }));

  const eligibleVotersForPollingNorm = Math.floor(
    entityPopulation * (0.65 + Math.random() * 0.1)
  );

  const finalCandidates = normalizePolling(
    candidatesWithScores,
    eligibleVotersForPollingNorm
  );

  return { type: "individual_candidates", data: finalCandidates };
}
