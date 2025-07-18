// ui-src/src/utils/electionResultsUtils.js
import { getRandomInt } from "./generalUtils.js";
import { distributeVotesToCandidates } from "./electionUtils.js"; // Re-use existing utilities
import {
  processFPTPResults,
  processPartyListPRResults,
  processMMPResults,
} from "./electionOutcomeProcessors.js";

/**
 * Calculates the election outcome based on the electoral system.
 * @param {object} electionToEnd - The election object being processed.
 * @param {Array} allPartiesInGame - List of all parties in the game.
 * @param {object} simulatedElectionData - Optional, pre-simulated election data.
 * @returns {{determinedWinnersArray: Array, partyVoteSummary: Array, partySeatSummary: object, totalVotesActuallyCast: number, voterTurnoutPercentageActual: number, allRelevantIndividuals: Array}}
 */
export const calculateElectionOutcome = (
  electionToEnd,
  allPartiesInGame,
  simulatedElectionData = null
) => {
  let candidatesWithFinalVotes = [];
  let totalVotesActuallyCast = 0;
  let voterTurnoutPercentageActual = 0;
  const seatsToFill = electionToEnd.numberOfSeatsToFill || 1;

  // --- Step 1: Determine Vote Counts & Initial Candidate List (KEEP THIS PART) ---
  if (simulatedElectionData) {
    totalVotesActuallyCast = simulatedElectionData.totalExpectedVotes || 0;
    voterTurnoutPercentageActual = simulatedElectionData.voterTurnoutPercentage;
    candidatesWithFinalVotes = (simulatedElectionData.candidates || []).map(
      (c) => ({ ...c, votes: c.currentVotes || 0 })
    );
  } else {
    let turnoutPerc = electionToEnd.voterTurnoutPercentage;
    if (turnoutPerc == null || turnoutPerc < 5 || turnoutPerc > 95) {
      turnoutPerc = getRandomInt(40, 75);
    }
    voterTurnoutPercentageActual = turnoutPerc;
    totalVotesActuallyCast = Math.round(
      (electionToEnd.totalEligibleVoters || 0) * (turnoutPerc / 100)
    );

    let baseCandidatesForSim = [];
    if (electionToEnd.electoralSystem === "MMP") {
      if (electionToEnd.mmpData) {
        baseCandidatesForSim.push(
          ...Object.values(
            electionToEnd.mmpData.constituencyCandidatesByParty || {}
          ).flat()
        );
        baseCandidatesForSim.push(
          ...(electionToEnd.mmpData.independentConstituencyCandidates || [])
        );
      }
      if (
        baseCandidatesForSim.length === 0 &&
        electionToEnd.candidates?.length > 0
      ) {
        baseCandidatesForSim = [...electionToEnd.candidates];
      }
    } else if (electionToEnd.electoralSystem !== "PartyListPR") {
      baseCandidatesForSim = electionToEnd.candidates || [];
    }

    if (
      baseCandidatesForSim.length > 0 &&
      totalVotesActuallyCast > 0 &&
      electionToEnd.electoralSystem !== "PartyListPR"
    ) {
      candidatesWithFinalVotes = distributeVotesToCandidates(
        baseCandidatesForSim,
        totalVotesActuallyCast,
        electionToEnd.id
      );
    } else if (baseCandidatesForSim.length > 0) {
      candidatesWithFinalVotes = baseCandidatesForSim.map((c) => ({
        ...c,
        votes: 0,
        partyId: c.partyId || null,
      }));
    }
  }

  // --- Step 2: Process based on Electoral System (MODIFIED PART) ---

  const processorParams = {
    electionToEnd,
    allPartiesInGame,
    candidatesWithFinalVotes,
    totalVotesActuallyCast,
    seatsToFill,
  };

  let result;
  switch (electionToEnd.electoralSystem) {
    case "PartyListPR":
      result = processPartyListPRResults(processorParams);
      break;
    case "MMP":
      result = processMMPResults(processorParams);
      break;
    case "FPTP":
    case "TwoRoundSystem":
    case "ElectoralCollege":
    case "SNTV_MMD":
    case "BlockVote":
    case "PluralityMMD": // Assuming PluralityMMD uses similar individual results processing as FPTP/SNTV
      result = processFPTPResults(processorParams);
      break;
    default:
      console.warn(
        `calculateElectionOutcome: Unknown electoral system '${electionToEnd.electoralSystem}'. Falling back to FPTP results processing.`
      );
      result = processFPTPResults(processorParams); // Fallback
      break;
  }

  return {
    ...result, // Spread the results from the processor function
    totalVotesActuallyCast, // Re-include these common values
    voterTurnoutPercentageActual,
    seatsToFill,
  };
};
