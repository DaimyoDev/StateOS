// ui-src/src/utils/electionOutcomeProcessors.js

/**
 * Allocates seats proportionally using specified methods (D'Hondt or Sainte-Laguë).
 * @param {Array<Object>} partyVotesSummary - An array of party objects with `id` and `votes`.
 * @param {number} totalSeatsToAllocate - The total number of seats to be allocated.
 * @param {number} thresholdPercent - The minimum percentage of votes a party needs to be eligible for seats.
 * @param {string} allocationMethod - The allocation method ("dHondt" or "sainteLague").
 * @returns {Object} An object mapping party IDs to the number of seats allocated.
 */
export const allocateSeatsProportionally = (
  partyVotesSummary,
  totalSeatsToAllocate,
  thresholdPercent = 0,
  allocationMethod = "dHondt" // Default to dHondt
) => {
  const seats = {}; // Result object: partyId -> numberOfSeats

  // Initialize seats for all parties to 0
  partyVotesSummary.forEach((p) => (seats[p.id] = 0));

  const totalAllVotes = partyVotesSummary.reduce(
    (s, pv) => s + (pv.votes || 0),
    0
  );

  const eligibleParties = partyVotesSummary.filter(
    (p) => (p.votes / totalAllVotes) * 100 >= thresholdPercent
  );

  if (eligibleParties.length === 0 || totalSeatsToAllocate <= 0) return seats;

  // Handle edge case where no eligible votes, but parties exist and seats are available
  const totalEligibleVotes = eligibleParties.reduce(
    (sum, p) => sum + p.votes,
    0
  );
  if (totalEligibleVotes === 0) {
    // Distribute seats equally among eligible parties if no votes
    const seatsPerParty = Math.floor(
      totalSeatsToAllocate / eligibleParties.length
    );
    let remainderSeats = totalSeatsToAllocate % eligibleParties.length;
    eligibleParties.forEach((p) => {
      seats[p.id] = seatsPerParty;
      if (remainderSeats > 0) {
        seats[p.id]++;
        remainderSeats--;
      }
    });
    return seats;
  }

  // --- Implement chosen allocation method ---
  switch (allocationMethod) {
    case "dHondt": {
      const dHondtQuotients = [];
      eligibleParties.forEach((party) => {
        for (let i = 1; i <= totalSeatsToAllocate; i++) {
          // Generate enough quotients for all seats
          dHondtQuotients.push({
            partyId: party.id,
            quotient: party.votes / i,
            originalVotes: party.votes, // For tie-breaking
          });
        }
      });

      dHondtQuotients.sort((a, b) => {
        if (b.quotient !== a.quotient) {
          return b.quotient - a.quotient;
        }
        // Tie-breaking: higher original votes get priority
        return b.originalVotes - a.originalVotes;
      });

      for (let i = 0; i < totalSeatsToAllocate; i++) {
        if (dHondtQuotients[i]) {
          seats[dHondtQuotients[i].partyId]++;
        }
      }
      break;
    }

    case "SainteLague":
      {
        const sainteLagueQuotients = [];
        eligibleParties.forEach((party) => {
          for (let i = 0; i < totalSeatsToAllocate * 2; i++) {
            // Generate enough odd divisors
            const divisor = 2 * i + 1; // 1, 3, 5, ...
            sainteLagueQuotients.push({
              partyId: party.id,
              quotient: party.votes / divisor,
              originalVotes: party.votes, // For tie-breaking
            });
          }
        });

        sainteLagueQuotients.sort((a, b) => {
          if (b.quotient !== a.quotient) {
            return b.quotient - a.quotient;
          }
          // Tie-breaking: higher original votes get priority
          return b.originalVotes - a.originalVotes;
        });

        for (let i = 0; i < totalSeatsToAllocate; i++) {
          if (sainteLagueQuotients[i]) {
            seats[sainteLagueQuotients[i].partyId]++;
          }
        }
      }
      break;

    default: {
      // Fallback to simple proportional allocation (similar to old placeholder but without the console.warn)
      let allocatedCountDefault = 0;
      eligibleParties.forEach((p) => {
        seats[p.id] = Math.floor(
          (p.votes / totalEligibleVotes) * totalSeatsToAllocate
        );
        allocatedCountDefault += seats[p.id];
      });

      let remainderSeatsDefault = totalSeatsToAllocate - allocatedCountDefault;
      if (remainderSeatsDefault > 0) {
        eligibleParties.sort(
          (a, b) =>
            (((b.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) -
              (((a.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) ||
            b.votes - a.votes
        );
        for (let i = 0; i < remainderSeatsDefault; i++) {
          if (eligibleParties.length > 0) {
            seats[eligibleParties[i % eligibleParties.length].id] =
              (seats[eligibleParties[i % eligibleParties.length].id] || 0) + 1;
          }
        }
      }
      console.warn(
        `Unknown allocation method '${allocationMethod}'. Falling back to simple largest remainder method.`
      );
      break;
    }
  }

  return seats;
};

/**
 * Processes election results for systems like FPTP, SNTV, BlockVote (individual winners based on votes).
 * @param {object} params.electionToEnd - The election object.
 * @param {Array} params.allPartiesInGame - List of all parties.
 * @param {Array} params.candidatesWithFinalVotes - Candidates with their final vote counts.
 * @param {number} params.seatsToFill - Total seats to fill.
 * @returns {{determinedWinnersArray: Array, partyVoteSummary: Array, partySeatSummary: object, allRelevantIndividuals: Array}}
 */
export const processFPTPResults = ({
  allPartiesInGame,
  candidatesWithFinalVotes,
  seatsToFill,
}) => {
  let determinedWinnersArray = [];
  let partyVoteSummary = [];
  let partySeatSummary = {};
  let allRelevantIndividuals = candidatesWithFinalVotes; // Start with all candidates

  if (candidatesWithFinalVotes && candidatesWithFinalVotes.length > 0) {
    determinedWinnersArray = [...candidatesWithFinalVotes]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, seatsToFill);
  }

  const partyTotals = {};
  (candidatesWithFinalVotes || []).forEach((cand) => {
    if (cand?.partyId)
      partyTotals[cand.partyId] =
        (partyTotals[cand.partyId] || 0) + (cand.votes || 0);
  });
  const totalPartySystemVotes = Object.values(partyTotals).reduce(
    (s, v) => s + (v || 0),
    0
  );
  Object.keys(partyTotals).forEach((partyId) => {
    const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
      name: partyId,
      color: "#888",
    };
    partyVoteSummary.push({
      id: partyId,
      name: partyData.name,
      color: partyData.color,
      votes: partyTotals[partyId] || 0,
      percentage:
        totalPartySystemVotes > 0
          ? ((partyTotals[partyId] || 0) / totalPartySystemVotes) * 100
          : 0,
    });
  });
  partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  determinedWinnersArray.forEach((winner) => {
    if (winner.partyId)
      partySeatSummary[winner.partyId] =
        (partySeatSummary[winner.partyId] || 0) + 1;
  });

  // Finalize allRelevantIndividuals for reporting
  allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
    const votedData = candidatesWithFinalVotes.find(
      (votedCand) => votedCand.id === indiv.id
    );
    const partyDetails = allPartiesInGame.find((p) => p.id === indiv.partyId);
    return {
      ...indiv,
      votes: votedData?.votes ?? null,
      partyName: partyDetails?.name || indiv.partyName,
      partyColor: partyDetails?.color || indiv.partyColor,
    };
  });

  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    allRelevantIndividuals,
  };
};

/**
 * Processes election results for Party-List Proportional Representation (PartyListPR) systems.
 * @param {object} params.electionToEnd - The election object.
 * @param {Array} params.allPartiesInGame - List of all parties.
 * @param {Array} params.candidatesWithFinalVotes - Candidates with their final vote counts (might be party entities for simulation).
 * @param {number} params.seatsToFill - Total seats to fill.
 * @param {number} params.totalVotesActuallyCast - Total votes cast in the election.
 * @returns {{determinedWinnersArray: Array, partyVoteSummary: Array, partySeatSummary: object, allRelevantIndividuals: Array}}
 */
export const processPartyListPRResults = ({
  electionToEnd,
  allPartiesInGame,
  candidatesWithFinalVotes, // Can be actual candidates with votes, or pre-simulated party entities
  seatsToFill,
  totalVotesActuallyCast,
}) => {
  let determinedWinnersArray = [];
  let partyVoteSummary = [];
  let partySeatSummary = {};
  let allRelevantIndividuals = Object.values(electionToEnd.partyLists || {})
    .flat()
    .filter((c) => c && c.id);

  let currentPartyVoteTotals = {};
  const firstSimEntity = candidatesWithFinalVotes?.[0];

  // Logic to determine party vote totals based on whether candidatesWithFinalVotes contains party entities
  if (firstSimEntity && firstSimEntity.isPartyEntity === true) {
    candidatesWithFinalVotes.forEach((partyEntity) => {
      if (partyEntity?.id && typeof partyEntity.votes === "number") {
        currentPartyVoteTotals[partyEntity.id] =
          (currentPartyVoteTotals[partyEntity.id] || 0) + partyEntity.votes;
      }
    });
  } else if (
    electionToEnd.partyLists &&
    Object.keys(electionToEnd.partyLists).length > 0 &&
    totalVotesActuallyCast > 0
  ) {
    const partiesInvolved = Object.keys(electionToEnd.partyLists);
    let totalBaseStrength = 0;
    const partyStrengths = partiesInvolved.map((pId) => {
      const pData = allPartiesInGame.find((p) => p.id === pId);
      const strength =
        pData?.popularity ||
        (partiesInvolved.length > 0 ? 100 / partiesInvolved.length : 1);
      totalBaseStrength += strength;
      return { partyId: pId, strength };
    });

    if (totalBaseStrength > 0) {
      partyStrengths.forEach(
        (ps) =>
          (currentPartyVoteTotals[ps.partyId] = Math.round(
            (ps.strength / totalBaseStrength) * totalVotesActuallyCast
          ))
      );
    } else if (partiesInvolved.length > 0) {
      const equalShare = Math.floor(
        totalVotesActuallyCast / partiesInvolved.length
      );
      partiesInvolved.forEach(
        (pId) => (currentPartyVoteTotals[pId] = equalShare)
      );
    }
    let currentSum = Object.values(currentPartyVoteTotals).reduce(
      (s, v) => s + (v || 0),
      0
    );
    let remainder = totalVotesActuallyCast - currentSum;
    if (remainder !== 0 && partiesInvolved.length > 0) {
      const sortedP = partiesInvolved.sort(
        (a, b) =>
          (currentPartyVoteTotals[b] || 0) - (currentPartyVoteTotals[a] || 0)
      );
      for (let k = 0; k < Math.abs(remainder); ++k)
        currentPartyVoteTotals[sortedP[k % sortedP.length]] +=
          Math.sign(remainder);
    }
  }

  const totalEffectivePartyListVotes = Object.values(
    currentPartyVoteTotals
  ).reduce((sum, v) => sum + (v || 0), 0);
  Object.keys(currentPartyVoteTotals).forEach((partyId) => {
    const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
      name: partyId,
      color: "#888",
    };
    partyVoteSummary.push({
      id: partyId,
      name: partyData.name,
      color: partyData.color,
      votes: currentPartyVoteTotals[partyId] || 0,
      percentage:
        totalEffectivePartyListVotes > 0
          ? ((currentPartyVoteTotals[partyId] || 0) /
              totalEffectivePartyListVotes) *
            100
          : 0,
    });
  });
  partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const allocatedSeatsByIndex = allocateSeatsProportionally(
    partyVoteSummary,
    seatsToFill,
    electionToEnd.prThresholdPercent || 0,
    electionToEnd.prAllocationMethod || "dHondt"
  );
  if (
    typeof allocatedSeatsByIndex === "object" &&
    allocatedSeatsByIndex !== null
  ) {
    Object.keys(allocatedSeatsByIndex).forEach((partyId) => {
      const numSeats = allocatedSeatsByIndex[partyId] || 0;
      partySeatSummary[partyId] = numSeats;
      if (numSeats > 0) {
        const listCands = electionToEnd.partyLists?.[partyId] || [];
        const partyWinners = listCands.slice(0, numSeats);
        partyWinners.forEach((indivCand) => {
          if (indivCand?.id && indivCand.name) {
            const partyData = allPartiesInGame.find((p) => p.id === partyId);
            determinedWinnersArray.push({
              ...indivCand,
              partyId: partyId,
              partyName: partyData?.name || indivCand.partyName,
              partyColor: partyData?.color || indivCand.partyColor,
            });
          }
        });
      }
    });
  }

  // No specific finalization for allRelevantIndividuals here as it's already set from partyLists
  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    allRelevantIndividuals,
  };
};

/**
 * Processes election results for Mixed-Member Proportional (MMP) systems.
 * Implements German-style overhang and leveling seats for realistic proportionality.
 * @param {object} params.electionToEnd - The election object.
 * @param {Array} params.allPartiesInGame - List of all parties.
 * @param {Array} params.candidatesWithFinalVotes - Candidates with their final vote counts (constituency candidates or party entities for simulation).
 * @param {number} params.seatsToFill - Initial total seats for the body. This will be updated to reflect leveling.
 * @param {number} params.totalVotesActuallyCast - Total votes cast in the election.
 * @returns {{determinedWinnersArray: Array, partyVoteSummary: Array, partySeatSummary: object, allRelevantIndividuals: Array, seatsToFill: number}}
 */
export const processMMPResults = ({
  electionToEnd,
  allPartiesInGame,
  candidatesWithFinalVotes,
  seatsToFill, // Now representing initial total seats, will be updated to final size
  totalVotesActuallyCast,
}) => {
  let determinedWinnersArray = []; // Final list of winners
  let partyVoteSummary = []; // Summary of party votes and percentages (overall vote)
  let partySeatSummary = {}; // Final seat count per party
  let allRelevantIndividuals = []; // All individuals involved in the election

  // Determine constituency winners first (This part remains the same)
  // constituencyWinnersFound will be used to track direct mandates
  const numConstituencySeatsInElection =
    electionToEnd.mmpData?.numConstituencySeats ||
    (electionToEnd.voteTarget === "dual_candidate_and_party"
      ? Math.floor(seatsToFill / 2)
      : seatsToFill);

  const constituencyWinnersFound = [...candidatesWithFinalVotes]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, numConstituencySeatsInElection);

  determinedWinnersArray = []; // Reset to ensure only final winners are added
  partySeatSummary = {}; // Ensure this is clean for party seats only

  // Add all constituency winners to determinedWinnersArray.
  // For partySeatSummary, only count seats for actual parties, not independents.
  constituencyWinnersFound.forEach((winner) => {
    determinedWinnersArray.push(winner); // Independent winners will be here with 1 seat
    // Assume partyIds starting with "independent_" or "ai_pol_" are independents
    if (
      winner.partyId &&
      !winner.partyId.startsWith("independent_") &&
      !winner.partyId.startsWith("ai_pol_")
    ) {
      partySeatSummary[winner.partyId] =
        (partySeatSummary[winner.partyId] || 0) + 1;
    }
  });

  // Determine Party Votes for List Seats (Overall Party Vote - Second Vote)
  // This section calculates mmpPartyVoteTotals and populates partyVoteSummary.
  // This logic is largely as before, ensuring overall party vote percentages are accurate.
  let mmpPartyVoteTotals = {};
  const firstMmpSimEntity = candidatesWithFinalVotes?.[0];
  if (
    firstMmpSimEntity &&
    firstMmpSimEntity.isPartyEntity === true &&
    firstMmpSimEntity.mmpPartyVote === true
  ) {
    candidatesWithFinalVotes.forEach((partyEntity) => {
      if (partyEntity?.id && typeof partyEntity.votes === "number") {
        mmpPartyVoteTotals[partyEntity.id] =
          (mmpPartyVoteTotals[partyEntity.id] || 0) + partyEntity.votes;
      }
    });
  } else if (
    candidatesWithFinalVotes.length > 0 &&
    !firstMmpSimEntity?.isPartyEntity
  ) {
    // MODIFICATION START: Filter out independents when summing votes for mmpPartyVoteTotals
    candidatesWithFinalVotes.forEach((cand) => {
      // Only count votes if the candidate belongs to an actual party (not an independent)
      if (
        cand.partyId &&
        !cand.partyId.startsWith("independent_") && // Explicitly exclude independent IDs
        !cand.partyId.startsWith("ai_pol_") && // Explicitly exclude general AI politician IDs used for independents
        typeof cand.votes === "number"
      ) {
        mmpPartyVoteTotals[cand.partyId] =
          (mmpPartyVoteTotals[cand.partyId] || 0) + cand.votes;
      }
    });
  } else if (
    electionToEnd.partyLists &&
    Object.keys(electionToEnd.partyLists).length > 0 &&
    totalVotesActuallyCast > 0
  ) {
    const partyVotePortion = totalVotesActuallyCast;
    const partiesInvolved = Object.keys(electionToEnd.partyLists);
    let totalBaseStrength = 0;
    const partyStrengths = partiesInvolved.map((pId) => {
      const pData = allPartiesInGame.find((p) => p.id === pId);
      const strength =
        pData?.popularity ||
        (partiesInvolved.length > 0 ? 100 / partiesInvolved.length : 1);
      totalBaseStrength += strength;
      return { partyId: pId, strength };
    });
    if (totalBaseStrength > 0)
      partyStrengths.forEach(
        (ps) =>
          (mmpPartyVoteTotals[ps.partyId] = Math.round(
            (ps.strength / totalBaseStrength) * partyVotePortion
          ))
      );
    else if (partiesInvolved.length > 0)
      partiesInvolved.forEach(
        (pId) =>
          (mmpPartyVoteTotals[pId] = Math.floor(
            partyVotePortion / partiesInvolved.length
          ))
      );
  }

  const totalEffectiveMMPPartyVotes = Object.values(mmpPartyVoteTotals).reduce(
    (s, v) => s + (v || 0),
    0
  );
  Object.keys(mmpPartyVoteTotals).forEach((partyId) => {
    const partyData = allPartiesInGame.find((p) => p.id === partyId) || {
      name: partyId,
      color: "#888",
    };
    partyVoteSummary.push({
      id: partyId,
      name: partyData.name,
      color: partyData.color,
      votes: mmpPartyVoteTotals[partyId] || 0,
      percentage:
        totalEffectiveMMPPartyVotes > 0
          ? ((mmpPartyVoteTotals[partyId] || 0) / totalEffectiveMMPPartyVotes) *
            100
          : 0,
    });
  });
  partyVoteSummary.sort((a, b) => (b.votes || 0) - (a.votes || 0));

  // --- NEW: Implement German-style MMP Allocation (Overhang and Leveling Seats) ---

  let currentTotalSeats = seatsToFill; // Start with the nominal size (e.g., 598 for Bundestag)
  let finalCalculatedPartySeats = {}; // To store the final seat count for each party
  let seatsCalculatedSuccessfully = false;
  let iterationLimit = 0;
  const MAX_ITERATIONS_FOR_LEVELING = 50; // Cap to prevent infinite loops
  const MAX_POSSIBLE_SEATS_MULTIPLIER = 1.5; // E.g., 1.5x nominal size (598 * 1.5 = ~897)

  // Loop to find the correct, potentially expanded, parliament size that accommodates all direct mandates proportionally
  while (
    !seatsCalculatedSuccessfully &&
    iterationLimit < MAX_ITERATIONS_FOR_LEVELING
  ) {
    iterationLimit++;

    // Calculate proportional entitlement based on the current `currentTotalSeats` candidate
    const currentProportionalEntitlement = allocateSeatsProportionally(
      partyVoteSummary, // This is based on overall party votes (second vote)
      currentTotalSeats,
      electionToEnd.prThresholdPercent || 0,
      electionToEnd.prAllocationMethod || "dHondt"
    );

    let nextTotalSeatsCandidate = currentTotalSeats;
    let overhangsFoundInIteration = false;

    // Check if all direct mandates are covered by proportional entitlement at currentTotalSeats
    partyVoteSummary.forEach((partyData) => {
      const partyId = partyData.id;
      const directWins = constituencyWinnersFound.filter(
        (w) => w.partyId === partyId
      ).length;
      const entitledSeats = currentProportionalEntitlement[partyId] || 0;

      if (directWins > entitledSeats) {
        const partyVotePercentage = partyData.percentage || 0.001;
        const requiredTotalForThisParty = Math.ceil(
          (directWins * 100) / partyVotePercentage
        );
        nextTotalSeatsCandidate = Math.max(
          nextTotalSeatsCandidate,
          requiredTotalForThisParty
        );
        overhangsFoundInIteration = true;
      }
    });

    if (
      overhangsFoundInIteration &&
      nextTotalSeatsCandidate > currentTotalSeats
    ) {
      currentTotalSeats = Math.min(
        nextTotalSeatsCandidate,
        seatsToFill * MAX_POSSIBLE_SEATS_MULTIPLIER
      );
      // If we hit the max multiplier, force break to prevent infinite loops, though it might impact proportionality
      if (currentTotalSeats === seatsToFill * MAX_POSSIBLE_SEATS_MULTIPLIER) {
        seatsCalculatedSuccessfully = true;
        console.warn(
          `[MMP Leveling] Parliament size reached max multiplier (${MAX_POSSIBLE_SEATS_MULTIPLIER}x nominal). Leveling might be slightly imperfect.`
        );
      }
    } else {
      // Parliament size has stabilized or no new overhangs, so this is the final allocation.
      seatsCalculatedSuccessfully = true;
      // Recalculate one last time with the *final* determined parliament size for precise entitlement.
      const finalProportionalEntitlement = allocateSeatsProportionally(
        partyVoteSummary,
        currentTotalSeats,
        electionToEnd.prThresholdPercent || 0,
        electionToEnd.prAllocationMethod || "dHondt"
      );
      finalCalculatedPartySeats = finalProportionalEntitlement;

      while (
        !seatsCalculatedSuccessfully &&
        iterationLimit < MAX_ITERATIONS_FOR_LEVELING
      ) {
        iterationLimit++;

        const currentProportionalEntitlement = allocateSeatsProportionally(
          partyVoteSummary,
          currentTotalSeats,
          electionToEnd.prThresholdPercent || 0,
          electionToEnd.prAllocationMethod || "dHondt"
        );

        let nextTotalSeatsCandidate = currentTotalSeats;

        partyVoteSummary.forEach((partyData) => {
          const partyId = partyData.id;
          const directWins = constituencyWinnersFound.filter(
            (w) =>
              w.partyId === partyId &&
              !w.partyId.startsWith("independent_") &&
              !w.partyId.startsWith("ai_pol_")
          ).length;

          const entitledSeats = currentProportionalEntitlement[partyId] || 0;

          if (directWins > entitledSeats) {
            const partyVotePercentage = partyData.percentage || 0.001;
            const requiredTotalForThisParty = Math.ceil(
              (directWins * 100) / partyVotePercentage
            );
            nextTotalSeatsCandidate = Math.max(
              nextTotalSeatsCandidate,
              requiredTotalForThisParty
            );
            overhangsFoundInIteration = true;
          }
        });
      }

      // Ensure no party has fewer seats than their direct wins, even after final proportional calculation
      partyVoteSummary.forEach((partyData) => {
        const partyId = partyData.id;
        // MODIFICATION 2: Ensure directWins here also only count for actual party members.
        const directWins = constituencyWinnersFound.filter(
          (w) =>
            w.partyId === partyId &&
            !w.partyId.startsWith("independent_") &&
            !w.partyId.startsWith("ai_pol_")
        ).length;
        finalCalculatedPartySeats[partyId] = Math.max(
          finalCalculatedPartySeats[partyId] || 0,
          directWins
        );
      });
    }
  }

  // Ensure total seats match currentTotalSeats after iterations (due to rounding/etc.)
  let actualTotalAllocatedSeats = Object.values(
    finalCalculatedPartySeats
  ).reduce((sum, s) => sum + s, 0);
  let difference = currentTotalSeats - actualTotalAllocatedSeats;

  // Distribute any remaining difference to fill the parliament to its final size
  if (difference !== 0) {
    const sortedPartiesByVote = [...partyVoteSummary].sort(
      (a, b) => b.votes - a.votes
    );
    for (let i = 0; i < Math.abs(difference); i++) {
      const partyToAdjustId =
        sortedPartiesByVote[i % sortedPartiesByVote.length]?.id;
      if (partyToAdjustId) {
        if (difference > 0) {
          // Add seats if under-allocated
          finalCalculatedPartySeats[partyToAdjustId] =
            (finalCalculatedPartySeats[partyToAdjustId] || 0) + 1;
        } else {
          // Remove seats if over-allocated (and greater than 0)
          finalCalculatedPartySeats[partyToAdjustId] = Math.max(
            0,
            (finalCalculatedPartySeats[partyToAdjustId] || 0) - 1
          );
        }
      }
    }
  }

  // Update partySeatSummary with the final, leveled seat counts
  partySeatSummary = { ...finalCalculatedPartySeats };

  // Rebuild determinedWinnersArray with final constituency winners + list winners (leveling)
  determinedWinnersArray = []; // Reset winners list
  // Add constituency winners first
  constituencyWinnersFound.forEach((winner) => {
    determinedWinnersArray.push(winner);
  });

  // Add list winners (leveling seats)
  Object.keys(partySeatSummary).forEach((partyId) => {
    const totalSeatsForParty = partySeatSummary[partyId] || 0;
    const constituencySeatsForParty = determinedWinnersArray.filter(
      (w) =>
        w.partyId === partyId &&
        !w.partyId.startsWith("independent_") &&
        !w.partyId.startsWith("ai_pol_")
    ).length;
    const listSeatsToAward = Math.max(
      0,
      totalSeatsForParty - constituencySeatsForParty
    );

    if (listSeatsToAward > 0) {
      const listCands = electionToEnd.partyLists?.[partyId] || [];
      const listWinners = listCands
        .filter(
          (lc) =>
            lc && lc.id && !determinedWinnersArray.some((cw) => cw.id === lc.id) // Avoid duplicates
        )
        .slice(0, listSeatsToAward); // Take the top candidates from the list

      listWinners.forEach((indivCand) => {
        const partyData = allPartiesInGame.find((p) => p.id === partyId);
        determinedWinnersArray.push({
          ...indivCand,
          partyId: partyId,
          partyName: partyData?.name || indivCand.partyName,
          partyColor: partyData?.color || indivCand.partyColor,
        });
      });
    }
  });

  // Finalize allRelevantIndividuals (existing logic)
  const individualsFromLists = Object.values(electionToEnd.partyLists || {})
    .flat()
    .filter((c) => c && c.id);
  const individualsFromMMPConst = electionToEnd.mmpData
    ? [
        ...Object.values(
          electionToEnd.mmpData.constituencyCandidatesByParty || {}
        )
          .flat()
          .filter((c) => c && c.id),
        ...(
          electionToEnd.mmpData.independentConstituencyCandidates || []
        ).filter((c) => c && c.id),
      ]
    : [];
  const baseIndividualPool =
    electionToEnd.candidates && !electionToEnd.candidates[0]?.isPartyEntity
      ? electionToEnd.candidates.filter((c) => c && c.id)
      : [];

  const combinedIndividuals = [
    ...individualsFromLists,
    ...individualsFromMMPConst,
    ...baseIndividualPool,
  ];
  allRelevantIndividuals = Array.from(
    new Map(combinedIndividuals.map((c) => [c.id, c])).values()
  ); // Deduplicate

  allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
    const votedData = candidatesWithFinalVotes.find(
      (votedCand) => votedCand.id === indiv.id
    );
    const partyDetails = allPartiesInGame.find((p) => p.id === indiv.partyId);
    return {
      ...indiv,
      votes: votedData?.votes ?? null,
      partyName: partyDetails?.name || indiv.partyName,
      partyColor: partyDetails?.color || indiv.partyColor,
    };
  });

  // Return final calculated data, including the dynamically determined final total seats
  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    allRelevantIndividuals,
    seatsToFill: currentTotalSeats,
  };
};
