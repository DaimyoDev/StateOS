// ui-src/src/utils/electionResultsUtils.js
import { getRandomInt } from "./generalUtils.js";
import { distributeVotesToCandidates } from "./electionUtils.js"; // Re-use existing utilities

/**
 * Placeholder for Proportional Representation (PR) Seat Allocation (e.g., Sainte-Laguë or D'Hondt).
 * This function needs a proper implementation.
 * @param {Array<Object>} partyVotesSummary - An array of party objects with `id` and `votes`.
 * @param {number} totalSeatsToAllocate - The total number of seats to be allocated.
 * @param {number} thresholdPercent - The minimum percentage of votes a party needs to be eligible for seats.
 * @param {string} allocationMethod - The allocation method (e.g., "dHondt").
 * @returns {Object} An object mapping party IDs to the number of seats allocated.
 */
const allocateSeatsProportionally = (
  partyVotesSummary, // Renamed from partyVotesMap to reflect input structure
  totalSeatsToAllocate,
  thresholdPercent = 0,
  allocationMethod = "dHondt"
) => {
  console.warn(
    `Using placeholder PR seat allocation: ${allocationMethod}. Implement a real algorithm.`
  );
  const seats = {};
  let allocatedCount = 0;

  const totalAllVotes = partyVotesSummary.reduce(
    (s, pv) => s + (pv.votes || 0),
    0
  );

  const eligibleParties = partyVotesSummary.filter(
    (p) => (p.votes / totalAllVotes) * 100 >= thresholdPercent
  );

  if (eligibleParties.length === 0 || totalSeatsToAllocate === 0) return seats;

  const totalEligibleVotes = eligibleParties.reduce(
    (sum, p) => sum + p.votes,
    0
  );

  if (totalEligibleVotes === 0) {
    if (eligibleParties.length > 0) {
      const seatsPerParty = Math.floor(
        totalSeatsToAllocate / eligibleParties.length
      );
      eligibleParties.forEach((p) => (seats[p.id] = seatsPerParty));
      allocatedCount = Object.values(seats).reduce((s, c) => s + c, 0);
    }
  } else {
    eligibleParties.forEach((p) => {
      seats[p.id] = Math.floor(
        (p.votes / totalEligibleVotes) * totalSeatsToAllocate
      );
      allocatedCount += seats[p.id];
    });
  }

  let remainderSeats = totalSeatsToAllocate - allocatedCount;
  if (remainderSeats > 0) {
    eligibleParties.sort(
      (a, b) =>
        (((b.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) -
          (((a.votes / totalEligibleVotes) * totalSeatsToAllocate) % 1) ||
        b.votes - a.votes
    );
    for (let i = 0; i < remainderSeats; i++) {
      if (eligibleParties.length > 0) {
        seats[eligibleParties[i % eligibleParties.length].id] =
          (seats[eligibleParties[i % eligibleParties.length].id] || 0) + 1;
      }
    }
  }
  return seats;
};

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

  let determinedWinnersArray = [];
  let partyVoteSummary = [];
  let partySeatSummary = {};
  let allRelevantIndividuals = [];

  // --- Step 1: Determine Vote Counts & Initial Candidate List ---
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

  // --- Step 2: Process based on Electoral System ---

  if (electionToEnd.electoralSystem === "PartyListPR") {
    let currentPartyVoteTotals = {};
    const firstSimEntity = candidatesWithFinalVotes?.[0];

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
    allRelevantIndividuals = Object.values(electionToEnd.partyLists || {})
      .flat()
      .filter((c) => c && c.id);
  } else if (electionToEnd.electoralSystem === "MMP") {
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

    const totalEffectiveMMPPartyVotes = Object.values(
      mmpPartyVoteTotals
    ).reduce((s, v) => s + (v || 0), 0);
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
            ? ((mmpPartyVoteTotals[partyId] || 0) /
                totalEffectiveMMPPartyVotes) *
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
    );
  } else {
    // FPTP, SNTV, BlockVote, etc.
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

    allRelevantIndividuals = candidatesWithFinalVotes;
  }

  // Finalize allRelevantIndividuals for reporting
  if (
    candidatesWithFinalVotes.length > 0 &&
    !candidatesWithFinalVotes[0]?.isPartyEntity
  ) {
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
  } else {
    allRelevantIndividuals = allRelevantIndividuals.map((indiv) => {
      const partyDetails = allPartiesInGame.find((p) => p.id === indiv.partyId);
      return {
        ...indiv,
        votes: null,
        partyName: partyDetails?.name || indiv.partyName,
        partyColor: partyDetails?.color || indiv.partyColor,
      };
    });
  }

  return {
    determinedWinnersArray,
    partyVoteSummary,
    partySeatSummary,
    totalVotesActuallyCast,
    voterTurnoutPercentageActual,
    allRelevantIndividuals,
  };
};
