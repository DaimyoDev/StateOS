// src/elections/electionParticipants.js
import {
  BASE_IDEOLOGIES,
  IDEOLOGY_DEFINITIONS,
} from "../data/ideologiesData.js";
import { getRandomElement, getRandomInt } from "../utils/core.js";
import { generateFullAIPolitician } from "../entities/personnel.js";
import { calculateBaseCandidateScore } from "../utils/electionUtils.js";
import { normalizePolling } from "../General Scripts/PollingFunctions.js";
import useGameStore from "../store.js";

/**
 * Handles participant generation for First-Past-The-Post (FPTP) style elections.
 * @param {object} params - The parameters for participant generation.
 * @returns {object} { type: "individual_candidates", data: Array<object> }
 */
export function handleFPTPParticipants({
  partiesInScope,
  incumbentInfo,
  countryId,
  ...generationContext
}) {
  const {
    activeCampaign,
    electionPropertiesForScoring,
    entityPopulation,
    electorateDemographics,
  } = generationContext;

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
          name:
            inc.name ||
            useGameStore.getState().actions.generateDynamicName({
              countryId,
              demographics: electorateDemographics,
            }),
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

  for (let i = 0; i < numberOfChallengersToGenerate; i++) {
    const newChallenger = generateFullAIPolitician(
      countryId,
      partiesInScope,
      generationContext
    );

    const isPartyAlreadyRepresented = candidates.some(
      (existingCandidate) => existingCandidate.partyId === newChallenger.partyId
    );

    if (newChallenger.partyId !== "independent" && isPartyAlreadyRepresented) {
      newChallenger.partyId = `independent_ai_challenger_${i}`;
      newChallenger.partyName = "Independent";
      newChallenger.partyColor = "#888888";
    }

    if (!candidates.find((c) => c.id === newChallenger.id)) {
      candidates.push(newChallenger);
    } else {
      i--;
    }
  }

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
  const finalCandidatesMap = normalizePolling(
    candidatesWithScores,
    eligibleVotersForPollingNorm
  );

  return { type: "individual_candidates", data: finalCandidatesMap };
}

/**
 * Handles participant generation for Party-List Proportional Representation (PartyListPR) elections.
 * @param {object} params - The parameters for participant generation.
 * @returns {object} { type: "party_lists", data: object }
 */
export function handlePartyListPRParticipants({
  partiesInScope,
  countryId,
  ...generationContext
}) {
  const {
    activeCampaign,
    electionPropertiesForScoring,
    numberOfSeatsToFill,
    electionType,
  } = generationContext;

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
      const newCand = generateFullAIPolitician(countryId, partiesInScope, {
        ...generationContext,
        forcePartyId: party.id,
      });
      partyListsOutput[party.id].push({
        ...newCand,
        name: `${newCand.name} (${party.shortName || party.name} List #${
          i + 1
        })`,
        listPosition: i + 1,
        partyAffiliationReadOnly: {
          /* ... */
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
  return { type: "party_lists", data: partyListsOutput };
}

/**
 * Handles participant generation for Mixed-Member Proportional (MMP) elections.
 * @param {object} params - The parameters for participant generation.
 * @returns {object} { type: "mmp_participants", data: object }
 */
export function handleMMPParticipants({
  partiesInScope,
  countryId,
  ...generationContext
}) {
  const {
    activeCampaign,
    electionPropertiesForScoring,
    numberOfSeatsToFill,
    electionType,
    incumbentInfo,
  } = generationContext;
  const partyListsOutput = {};
  const partiesSubmittingLists = partiesInScope.filter((p) => !p.isIndependent);

  // 1. Generate Party Lists
  partiesSubmittingLists.forEach((party) => {
    const listSeatTarget = Math.ceil(
      numberOfSeatsToFill * (electionType.mmpListSeatsRatio || 0.5)
    );
    const listSize = Math.max(
      Math.floor(listSeatTarget * 0.6) + 1,
      getRandomInt(Math.max(3, listSeatTarget - 5), listSeatTarget + 10)
    );
    partyListsOutput[party.id] = [];
    for (let i = 0; i < listSize; i++) {
      const newCand = generateFullAIPolitician(countryId, partiesInScope, {
        ...generationContext,
        forcePartyId: party.id,
      });
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

  // 2. Generate Constituency Candidates
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
        newConstituencyCand = generateFullAIPolitician(
          countryId,
          partiesInScope,
          { ...generationContext, forcePartyId: party.id }
        );
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

  // 3. Generate Independent Constituency Candidates
  let independentConstituencyCandidates = [];
  const numIndependentConstituencyCands = getRandomInt(
    0,
    Math.floor(approxConstituencySeats * 0.05)
  );
  for (let i = 0; i < numIndependentConstituencyCands; i++) {
    const indParty = {
      id: `independent_ai_const_mmp_${i}`,
      name: "Independent",
      ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
      color: "#888888",
    };
    independentConstituencyCandidates.push(
      generateFullAIPolitician(countryId, [], {
        ...generationContext,
        forcePartyId: indParty.id,
      })
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
 * Handles participant generation for Multi-Member District (MMD) elections (SNTV, Block Vote).
 * @param {object} params - The parameters for participant generation.
 * @returns {object} { type: "individual_candidates", data: Array<object> }
 */
export function handleMMDParticipants({
  partiesInScope,
  countryId,
  ...generationContext
}) {
  const {
    activeCampaign,
    electionPropertiesForScoring,
    numberOfSeatsToFill,
    entityPopulation,
    incumbentInfo,
  } = generationContext;
  // This logic is very similar to FPTP but generates more candidates relative to seats.
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
          name:
            inc.name ||
            useGameStore
              .getState()
              .actions.generateDynamicName({ countryId, ...generationContext }),
        });
      }
    });
    candidates.push(...runningIncumbents);
  }

  const minCandidates = Math.max(
    numberOfSeatsToFill + 1,
    Math.floor(numberOfSeatsToFill * 1.8)
  );
  const maxCandidates = Math.min(70, Math.floor(numberOfSeatsToFill * 3.0));
  let targetTotalCandidates = getRandomInt(minCandidates, maxCandidates);

  const numberOfChallengersToGenerate = Math.max(
    0,
    targetTotalCandidates - candidates.length
  );

  for (let i = 0; i < numberOfChallengersToGenerate; i++) {
    const newChallenger = generateFullAIPolitician(
      countryId,
      partiesInScope,
      generationContext
    );

    const isPartyAlreadyRepresented = candidates.some(
      (existingCandidate) => existingCandidate.partyId === newChallenger.partyId
    );

    // 3. If the party is taken AND it's not "independent", make this challenger an Independent.
    if (newChallenger.partyId !== "independent" && isPartyAlreadyRepresented) {
      newChallenger.partyId = `independent_ai_challenger_${i}`;
      newChallenger.partyName = "Independent";
      newChallenger.partyColor = "#888888"; // Standard independent color
    }

    if (!candidates.find((c) => c.id === newChallenger.id)) {
      candidates.push(newChallenger);
    } else {
      i--;
    }
  }

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
  const finalCandidatesMap = normalizePolling(
    candidatesWithScores,
    eligibleVotersForPollingNorm
  );

  return { type: "individual_candidates", data: finalCandidatesMap };
}
