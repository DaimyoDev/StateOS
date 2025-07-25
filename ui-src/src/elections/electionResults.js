// src/elections/electionResults.js

// NOTE: Import paths will need to be updated once the refactoring is complete.
import { distributeVotesToCandidates } from "./electionSimulator.js";
import { getRandomInt } from "../utils/core.js";

// --- Seat Allocation & Winner Determination ---

/**
 * Allocates seats proportionally using specified methods (D'Hondt or Sainte-Laguë).
 * @param {Array<Object>} partyVotesSummary - An array of party objects with `id` and `votes`.
 * @param {number} totalSeatsToAllocate - The total number of seats to be allocated.
 * @param {number} thresholdPercent - The minimum percentage of votes a party needs for seats.
 * @param {string} allocationMethod - The allocation method ("dHondt" or "SainteLague").
 * @returns {Object} An object mapping party IDs to the number of seats allocated.
 */
export const allocateSeatsProportionally = (
  partyVotesSummary,
  totalSeatsToAllocate,
  thresholdPercent = 0,
  allocationMethod = "dHondt"
) => {
  const seats = {};
  partyVotesSummary.forEach((p) => (seats[p.id] = 0));

  const totalAllVotes = partyVotesSummary.reduce(
    (s, pv) => s + (pv.votes || 0),
    0
  );
  if (totalAllVotes === 0) return seats;

  const eligibleParties = partyVotesSummary.filter(
    (p) => (p.votes / totalAllVotes) * 100 >= thresholdPercent
  );

  if (eligibleParties.length === 0 || totalSeatsToAllocate <= 0) return seats;

  switch (allocationMethod) {
    case "dHondt": {
      const quotients = [];
      eligibleParties.forEach((party) => {
        for (let i = 1; i <= totalSeatsToAllocate; i++) {
          quotients.push({
            partyId: party.id,
            quotient: party.votes / i,
            originalVotes: party.votes,
          });
        }
      });
      quotients.sort(
        (a, b) => b.quotient - a.quotient || b.originalVotes - a.originalVotes
      );
      for (let i = 0; i < totalSeatsToAllocate; i++) {
        if (quotients[i]) seats[quotients[i].partyId]++;
      }
      break;
    }
    case "SainteLague": {
      const quotients = [];
      eligibleParties.forEach((party) => {
        // Generate enough quotients for all potential seats
        for (let i = 0; i < totalSeatsToAllocate; i++) {
          const divisor = 2 * i + 1; // 1, 3, 5, ...
          quotients.push({
            partyId: party.id,
            quotient: party.votes / divisor,
            originalVotes: party.votes,
          });
        }
      });
      quotients.sort(
        (a, b) => b.quotient - a.quotient || b.originalVotes - a.originalVotes
      );
      for (let i = 0; i < totalSeatsToAllocate; i++) {
        if (quotients[i]) seats[quotients[i].partyId]++;
      }
      break;
    }
    default:
      console.warn(`Unknown allocation method '${allocationMethod}'.`);
      break;
  }
  return seats;
};

/**
 * Processes a First-Past-The-Post election and returns results.
 * @param {Object} params
 * @param {Array<object>} allPartiesInGame - List of all parties with id, name, color, etc.
 * @param {Map<any, object>} candidatesWithFinalVotes - Map of candidateId -> candidateObject with 'votes' and 'partyId'
 * @param {number} seatsToFill - Number of top candidates to select
 * @returns {object} Election summary results
 */
export const processFPTPResults = ({
  allPartiesInGame,
  candidatesWithFinalVotes,
  seatsToFill,
}) => {
  const candidateArray = Array.from(candidatesWithFinalVotes.values());

  // Sort candidates by votes descending and pick top N
  const determinedWinnersArray = candidateArray
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, seatsToFill);

  // Aggregate total votes per party
  const partyTotals = new Map();
  candidateArray.forEach((cand) => {
    if (cand?.partyId) {
      partyTotals.set(
        cand.partyId,
        (partyTotals.get(cand.partyId) || 0) + (cand.votes || 0)
      );
    }
  });

  const totalPartySystemVotes = Array.from(partyTotals.values()).reduce(
    (sum, votes) => sum + votes,
    0
  );

  const partyVoteSummary = Array.from(partyTotals.entries())
    .map(([partyId, votes]) => {
      const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
        name: partyId,
        color: "#888",
      };
      return {
        id: partyId,
        name: partyData.name,
        color: partyData.color,
        votes,
        percentage:
          totalPartySystemVotes > 0 ? (votes / totalPartySystemVotes) * 100 : 0,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  // Count seats won by each party
  const partySeatSummary = {};
  determinedWinnersArray.forEach((winner) => {
    if (winner.partyId) {
      partySeatSummary[winner.partyId] =
        (partySeatSummary[winner.partyId] || 0) + 1;
    }
  });

  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    allRelevantIndividuals: candidatesWithFinalVotes,
  };
};

/**
 * Processes results for Party-List Proportional Representation (PartyListPR) systems.
 * @param {object} params - The parameters for processing.
 * @returns {object} The results object.
 */
export const processPartyListPRResults = ({
  electionToEnd,
  allPartiesInGame,
  seatsToFill,
  totalVotesActuallyCast,
  candidatesWithFinalVotes,
}) => {
  const partyVoteTotals = {};

  // Determine party votes. If pre-simulated party entities are passed, use their votes.
  // Otherwise, calculate votes based on the political landscape.
  if (candidatesWithFinalVotes && candidatesWithFinalVotes[0]?.isPartyEntity) {
    candidatesWithFinalVotes.forEach((partyEntity) => {
      if (partyEntity?.id && typeof partyEntity.votes === "number") {
        partyVoteTotals[partyEntity.id] =
          (partyVoteTotals[partyEntity.id] || 0) + partyEntity.votes;
      }
    });
  } else {
    const politicalLandscape = electionToEnd.politicalLandscape || [];
    const partiesInvolved = Object.keys(electionToEnd.partyLists);
    let totalBaseStrength = politicalLandscape.reduce(
      (sum, p) => sum + (partiesInvolved.includes(p.id) ? p.popularity : 0),
      0
    );

    if (totalBaseStrength > 0) {
      politicalLandscape.forEach((p) => {
        if (partiesInvolved.includes(p.id)) {
          partyVoteTotals[p.id] = Math.round(
            (p.popularity / totalBaseStrength) * totalVotesActuallyCast
          );
        }
      });
    } else if (partiesInvolved.length > 0) {
      const equalShare = Math.floor(
        totalVotesActuallyCast / partiesInvolved.length
      );
      partiesInvolved.forEach((pId) => (partyVoteTotals[pId] = equalShare));
    }
  }

  const totalVotes = Object.values(partyVoteTotals).reduce((s, v) => s + v, 0);
  const partyVoteSummary = Object.keys(partyVoteTotals)
    .map((partyId) => {
      const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
        name: partyId,
        color: "#888",
      };
      return {
        id: partyId,
        name: partyData.name,
        color: partyData.color,
        votes: partyVoteTotals[partyId] || 0,
        percentage:
          totalVotes > 0 ? (partyVoteTotals[partyId] / totalVotes) * 100 : 0,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  const partySeatSummary = allocateSeatsProportionally(
    partyVoteSummary,
    seatsToFill,
    electionToEnd.prThresholdPercent,
    electionToEnd.prAllocationMethod
  );

  let determinedWinnersArray = [];
  Object.keys(partySeatSummary).forEach((partyId) => {
    const numSeats = partySeatSummary[partyId] || 0;
    if (numSeats > 0) {
      const listCands = electionToEnd.partyLists?.[partyId] || [];
      const partyWinners = listCands.slice(0, numSeats).map((cand) => ({
        ...cand,
        partyId,
        partyName: allPartiesInGame.find((p) => p.id === partyId)?.name,
      }));
      determinedWinnersArray.push(...partyWinners);
    }
  });

  const allRelevantIndividuals = Object.values(
    electionToEnd.partyLists || {}
  ).flat();
  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    allRelevantIndividuals,
  };
};

/**
 * Processes results for Mixed-Member Proportional (MMP) systems with leveling seats.
 * @param {object} params - The parameters for processing.
 * @returns {object} The results object, including the final adjusted number of seats.
 */
export const processMMPResults = ({
  electionToEnd,
  allPartiesInGame,
  candidatesWithFinalVotes, // This is a Map of constituency candidates and their votes
  seatsToFill,
}) => {
  console.log("DEBUG MMP DATA:", {
    partyLists: electionToEnd.partyLists,
    mmpData: electionToEnd.mmpData,
  });
  // --- Step 1: Determine Constituency Winners (Correct) ---
  const numConstituencySeats =
    electionToEnd.mmpData?.numConstituencySeats || Math.floor(seatsToFill / 2);
  const constituencyWinners = [...candidatesWithFinalVotes.values()] // Correctly get array from Map
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, numConstituencySeats);

  // --- Step 2: Tally Party List Votes (Second Vote) ---
  // THIS IS THE CRITICAL FIX: Simulate the separate party vote.
  const mmpPartyVoteTotals = {};

  // We will simulate the "second vote" for the parties.
  // We can assume the total number of party votes is similar to the total constituency votes.
  const totalPartyVotesCast = [...candidatesWithFinalVotes.values()].reduce(
    (sum, cand) => sum + (cand.votes || 0),
    0
  );

  // Create a flat array of all candidates from all party lists to simulate the party vote.
  const allPartyListCandidates = Object.values(
    electionToEnd.partyLists || {}
  ).flat();

  if (allPartyListCandidates.length > 0) {
    // This function will distribute the total party votes among the parties.
    const partyVotesMap = distributeVotesToCandidates(
      allPartyListCandidates,
      totalPartyVotesCast,
      `${electionToEnd.id}_party_vote` // Unique ID for this simulation
    );

    // Now, correctly sum the votes for each party from the simulation.
    partyVotesMap.forEach((candidate) => {
      if (candidate.partyId && !candidate.partyId.startsWith("independent")) {
        mmpPartyVoteTotals[candidate.partyId] =
          (mmpPartyVoteTotals[candidate.partyId] || 0) + (candidate.votes || 0);
      }
    });
  }

  const totalPartyVotes = Object.values(mmpPartyVoteTotals).reduce(
    (s, v) => s + v,
    0
  );

  // This summary will now be correctly populated.
  const partyVoteSummary = Object.keys(mmpPartyVoteTotals)
    .map((partyId) => {
      const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
        name: partyId,
        color: "#888",
      };
      return {
        id: partyId,
        name: partyData.name,
        color: partyData.color,
        votes: mmpPartyVoteTotals[partyId] || 0,
        percentage:
          totalPartyVotes > 0
            ? (mmpPartyVoteTotals[partyId] / totalPartyVotes) * 100
            : 0,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  // --- Step 3: Iteratively Calculate Overhang and Leveling Seats ---
  let currentTotalSeats = seatsToFill;
  let finalCalculatedPartySeats = {};
  let iterations = 0;
  const MAX_ITERATIONS = 50;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const proportionalEntitlement = allocateSeatsProportionally(
      partyVoteSummary,
      currentTotalSeats,
      electionToEnd.prThresholdPercent,
      electionToEnd.prAllocationMethod
    );

    let hasOverhang = false;
    let nextTotalSeatsCandidate = currentTotalSeats;

    partyVoteSummary.forEach((partyData) => {
      const partyId = partyData.id;
      const directWins = constituencyWinners.filter(
        (w) => w.partyId === partyId
      ).length;
      const entitledSeats = proportionalEntitlement[partyId] || 0;

      if (directWins > entitledSeats) {
        hasOverhang = true;
        // This party needs more total seats to make their direct wins proportional
        const requiredTotalForParty = Math.ceil(
          (directWins * 100) / (partyData.percentage || 0.01)
        );
        nextTotalSeatsCandidate = Math.max(
          nextTotalSeatsCandidate,
          requiredTotalForParty
        );
      }
    });

    if (!hasOverhang || nextTotalSeatsCandidate === currentTotalSeats) {
      // Parliament size has stabilized, this is our final allocation
      finalCalculatedPartySeats = allocateSeatsProportionally(
        partyVoteSummary,
        currentTotalSeats,
        electionToEnd.prThresholdPercent,
        electionToEnd.prAllocationMethod
      );
      // Ensure no party gets fewer seats than their direct wins (overhang seats)
      Object.keys(finalCalculatedPartySeats).forEach((partyId) => {
        const directWins = constituencyWinners.filter(
          (w) => w.partyId === partyId
        ).length;
        finalCalculatedPartySeats[partyId] = Math.max(
          finalCalculatedPartySeats[partyId],
          directWins
        );
      });
      break; // Exit loop
    }
    currentTotalSeats = nextTotalSeatsCandidate; // Increase parliament size and recalculate
  }

  const finalParliamentSize = Object.values(finalCalculatedPartySeats).reduce(
    (sum, s) => sum + s,
    0
  );

  // --- Step 4: Assemble Final List of Winners ---
  let determinedWinnersArray = [...constituencyWinners];
  const constituencyWinnerIds = new Set(constituencyWinners.map((w) => w.id));

  Object.keys(finalCalculatedPartySeats).forEach((partyId) => {
    const totalSeatsForParty = finalCalculatedPartySeats[partyId] || 0;
    const constituencySeatsForParty = constituencyWinners.filter(
      (w) => w.partyId === partyId
    ).length;
    const listSeatsToAward = Math.max(
      0,
      totalSeatsForParty - constituencySeatsForParty
    );

    if (listSeatsToAward > 0) {
      const partyList = electionToEnd.partyLists?.[partyId] || [];
      const listWinners = partyList
        .filter((cand) => !constituencyWinnerIds.has(cand.id)) // Ensure no duplicates
        .slice(0, listSeatsToAward)
        .map((cand) => ({
          ...cand,
          partyId,
          partyName: allPartiesInGame.find((p) => p.id === partyId)?.name,
        }));
      determinedWinnersArray.push(...listWinners);
    }
  });

  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary: finalCalculatedPartySeats,
    allRelevantIndividuals: candidatesWithFinalVotes,
    seatsToFill: finalParliamentSize,
  };
};

// --- Main Outcome Calculator ---

/**
 * Calculates the final election outcome based on the electoral system. This is the main dispatcher function.
 * @param {object} electionToEnd - The election object being processed.
 * @param {Array} allPartiesInGame - List of all parties in the game.
 * @param {object} simulatedElectionData - Optional, pre-simulated election data.
 * @returns {object} A complete election outcome object.
 */
export const calculateElectionOutcome = (
  electionToEnd,
  allPartiesInGame,
  simulatedElectionData = null
) => {
  let candidatesWithFinalVotes = new Map();
  let totalVotesActuallyCast = 0;
  let voterTurnoutPercentageActual = 0;
  const seatsToFill = electionToEnd.numberOfSeatsToFill || 1;

  // Step 1: Simulate or retrieve vote counts
  if (simulatedElectionData) {
    totalVotesActuallyCast = simulatedElectionData.totalExpectedVotes || 0;
    voterTurnoutPercentageActual = simulatedElectionData.voterTurnoutPercentage;

    // Convert simulated array to a Map
    candidatesWithFinalVotes = new Map(
      (simulatedElectionData.candidates || []).map((c) => [
        c.id || c.name || crypto.randomUUID(), // use stable key if available
        { ...c, votes: c.currentVotes || 0 },
      ])
    );
  } else {
    voterTurnoutPercentageActual = getRandomInt(40, 75);
    totalVotesActuallyCast = Math.round(
      (electionToEnd.totalEligibleVoters || 0) *
        (voterTurnoutPercentageActual / 100)
    );

    let baseCandidatesForSim =
      electionToEnd.electoralSystem === "PartyListPR"
        ? []
        : electionToEnd.candidates || [];

    if (electionToEnd.electoralSystem === "MMP" && electionToEnd.mmpData) {
      baseCandidatesForSim = Object.values(
        electionToEnd.mmpData.constituencyCandidatesByParty || {}
      ).flat();
      baseCandidatesForSim.push(
        ...(electionToEnd.mmpData.independentConstituencyCandidates || [])
      );
    }

    if (baseCandidatesForSim) {
      // distributeVotesToCandidates now returns a Map
      candidatesWithFinalVotes = distributeVotesToCandidates(
        baseCandidatesForSim,
        totalVotesActuallyCast,
        electionToEnd.id
      );
    }
  }

  // Step 2: Process results based on the electoral system
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
    case "PluralityMMD":
      result = processFPTPResults(processorParams);
      break;
    default:
      console.warn(
        `calculateElectionOutcome: Unknown electoral system '${electionToEnd.electoralSystem}'. Falling back to FPTP.`
      );
      result = processFPTPResults(processorParams);
      break;
  }

  // Step 3: Assign winners
  if (result.determinedWinnersArray) {
    const isMultiMemberBody = seatsToFill > 1;
    result.winnerAssignment = {
      type: isMultiMemberBody ? "MEMBERS_ARRAY" : "SINGLE_HOLDER",
      winners: result.determinedWinnersArray,
    };
  }

  // Step 4: Final outcome object
  const finalOutcome = {
    ...result,
    totalVotesActuallyCast,
    voterTurnoutPercentageActual,
    seatsToFill: result.seatsToFill || seatsToFill,
    cityId: electionToEnd.entityDataSnapshot.id,
  };

  return finalOutcome;
};
