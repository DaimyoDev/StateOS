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

    case "sainteLague":
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

    default: // Fallback to simple proportional allocation (similar to old placeholder but without the console.warn)
    {
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
 * @param {object} params.electionToEnd - The election object.
 * @param {Array} params.allPartiesInGame - List of all parties.
 * @param {Array} params.candidatesWithFinalVotes - Candidates with their final vote counts (constituency candidates or party entities for simulation).
 * @param {number} params.seatsToFill - Total seats to fill.
 * @param {number} params.totalVotesActuallyCast - Total votes cast in the election.
 * @returns {{determinedWinnersArray: Array, partyVoteSummary: Array, partySeatSummary: object, allRelevantIndividuals: Array}}
 */
export const processMMPResults = ({
  electionToEnd,
  allPartiesInGame,
  candidatesWithFinalVotes, // Primarily constituency candidates, or simulated party vote entities
  seatsToFill,
  totalVotesActuallyCast,
}) => {
  let determinedWinnersArray = [];
  let partyVoteSummary = [];
  let partySeatSummary = {};
  let allRelevantIndividuals = []; // Will be combined at the end

  const numConstituencySeats =
    electionToEnd.mmpData?.numConstituencySeats ||
    (electionToEnd.voteTarget === "dual_candidate_and_party"
      ? Math.floor(seatsToFill / 2)
      : seatsToFill);
  const numListSeats = seatsToFill - numConstituencySeats;

  // 1. Determine constituency winners
  if (candidatesWithFinalVotes.length > 0) {
    const constituencyWinnersFound = [...candidatesWithFinalVotes]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, numConstituencySeats);
    determinedWinnersArray.push(...constituencyWinnersFound);
    constituencyWinnersFound.forEach((winner) => {
      if (winner.partyId)
        partySeatSummary[winner.partyId] =
          (partySeatSummary[winner.partyId] || 0) + 1;
    });
  }

  // 2. Determine Party Votes for List Seats
  let mmpPartyVoteTotals = {};
  const firstMmpSimEntity = candidatesWithFinalVotes?.[0];
  if (
    firstMmpSimEntity &&
    firstMmpSimEntity.isPartyEntity === true &&
    firstMmpSimEntity.mmpPartyVote === true
  ) {
    // If candidatesWithFinalVotes itself contains party entities with votes for list part
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
    // If candidatesWithFinalVotes are constituency candidates, sum their votes by party for list vote
    candidatesWithFinalVotes.forEach((cand) => {
      if (cand.partyId && typeof cand.votes === "number") {
        mmpPartyVoteTotals[cand.partyId] =
          (mmpPartyVoteTotals[cand.partyId] || 0) + cand.votes;
      }
    });
  } else if (
    electionToEnd.partyLists &&
    Object.keys(electionToEnd.partyLists).length > 0 &&
    totalVotesActuallyCast > 0
  ) {
    // Fallback: If no direct simulated party votes, derive from party strengths based on totalVotesActuallyCast
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

  // 3. Allocate List Seats for MMP
  if (
    numListSeats > 0 &&
    partyVoteSummary.length > 0 &&
    electionToEnd.partyLists
  ) {
    const allocatedListSeatsByIndexMMP = allocateSeatsProportionally(
      partyVoteSummary,
      numListSeats,
      electionToEnd.prThresholdPercent || 0,
      electionToEnd.prAllocationMethod || "dHondt"
    );
    if (
      typeof allocatedListSeatsByIndexMMP === "object" &&
      allocatedListSeatsByIndexMMP !== null
    ) {
      Object.keys(allocatedListSeatsByIndexMMP).forEach((partyId) => {
        const numPartyListSeats = allocatedListSeatsByIndexMMP[partyId] || 0;
        partySeatSummary[partyId] =
          (partySeatSummary[partyId] || 0) + numPartyListSeats;

        const listCands = electionToEnd.partyLists?.[partyId] || [];
        const listWinners = listCands
          .filter(
            (lc) =>
              lc &&
              lc.id &&
              !determinedWinnersArray.some((cw) => cw.id === lc.id)
          )
          .slice(0, numPartyListSeats);
        listWinners.forEach((indivCand) => {
          if (indivCand.name) {
            const partyData = allPartiesInGame.find((p) => p.id === partyId);
            determinedWinnersArray.push({
              ...indivCand,
              partyId: partyId,
              partyName: partyData?.name || indivCand.partyName,
              partyColor: partyData?.color || indivCand.partyColor,
            });
          }
        });
      });
    }
  }

  // Combine all relevant individuals from constituency and lists for final reporting
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

  // Finalize allRelevantIndividuals for reporting - add votes and party info if missing
  allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
    const votedData = candidatesWithFinalVotes.find(
      (votedCand) => votedCand.id === indiv.id
    ); // Find their vote data from constituency results
    const partyDetails = allPartiesInGame.find((p) => p.id === indiv.partyId);
    return {
      ...indiv,
      votes: votedData?.votes ?? null, // Use constituency votes if available
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
