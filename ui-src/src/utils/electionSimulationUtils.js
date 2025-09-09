import { calculateCoalitionBasedPolling } from "../elections/candidateManager.js";

const SIMULATION_SPEEDS = {
  realistic: 300000,
  superSlow: 20000,
  slow: 10000,
  normal: 5000,
  fast: 1500,
};

const distributeVoteChunkProportionally = (candidates, voteChunk, coalitionSoA = null, totalPopulation = null) => {
  let processedCandidates;
  
  // Use coalition-based polling if available
  if (coalitionSoA && coalitionSoA.base && coalitionSoA.base.size > 0 && totalPopulation) {
    // Calculate coalition-based polling for realistic vote distribution
    const candidatesWithCoalitionPolling = calculateCoalitionBasedPolling(
      candidates.map(c => ({ ...c, currentVotes: c.currentVotes || 0 })), 
      coalitionSoA, 
      totalPopulation
    );
    processedCandidates = candidatesWithCoalitionPolling.map(c => ({
      ...c,
      basePolling: c.polling || c.baseScore || 1,
    }));
  } else {
    // Fallback to original polling
    processedCandidates = candidates.map((c) => ({
      ...c,
      currentVotes: c.currentVotes || 0,
      basePolling: c.polling || c.baseScore || 1,
    }));
  }

  if (voteChunk <= 0 || processedCandidates.length === 0) {
    return candidates.map((c) => ({ ...c, currentVotes: c.currentVotes || 0 }));
  }

  const candidatesWithChunkWeight = processedCandidates.map((candidate) => {
    const randomPerformanceFactor = 0.7 + Math.random() * 0.6; // Small random swing
    return {
      ...candidate,
      // Ensure basePolling is a positive number for weight calculation
      chunkWeight:
        Math.max(0.1, candidate.basePolling) * randomPerformanceFactor,
    };
  });

  const totalChunkWeight = candidatesWithChunkWeight.reduce(
    (sum, c) => sum + c.chunkWeight,
    0
  );

  let distributedInChunk = 0;

  if (totalChunkWeight > 0) {
    for (let i = 0; i < candidatesWithChunkWeight.length; i++) {
      const candidate = candidatesWithChunkWeight[i];
      const proportionOfChunk = candidate.chunkWeight / totalChunkWeight;
      const votesForCandidateThisChunk = Math.floor(
        proportionOfChunk * voteChunk
      );
      const originalCandidate = processedCandidates.find(
        (pc) => pc.id === candidate.id
      );
      if (originalCandidate) {
        originalCandidate.currentVotes += votesForCandidateThisChunk;
        distributedInChunk += votesForCandidateThisChunk;
      }
    }
  } else if (processedCandidates.length > 0) {
    const equalShare = Math.floor(voteChunk / processedCandidates.length);
    processedCandidates.forEach((candidate) => {
      candidate.currentVotes += equalShare;
      distributedInChunk += equalShare;
    });
  }

  let remainder = voteChunk - distributedInChunk;
  if (remainder > 0 && processedCandidates.length > 0) {
    const sortedForRemainder = candidatesWithChunkWeight.sort(
      (a, b) => b.chunkWeight - a.chunkWeight
    );

    for (let i = 0; i < remainder; i++) {
      const candidateToReceiveRemainder = processedCandidates.find(
        (pc) => pc.id === sortedForRemainder[i % sortedForRemainder.length].id
      );
      if (candidateToReceiveRemainder) {
        candidateToReceiveRemainder.currentVotes++;
      }
    }
  }
  return processedCandidates.map(({ ...rest }) => rest);
};

const createAnnouncementData = (election, entitiesForAnnouncement) => {
  if (!election || !entitiesForAnnouncement || entitiesForAnnouncement.length === 0) {
    return null;
  }

  const seatsToFill = election.numberOfSeatsToFill || 1;
  const winners = entitiesForAnnouncement.slice(0, seatsToFill);
  
  if (winners.length === 0) return null;

  const totalVotes = entitiesForAnnouncement.reduce(
    (sum, entity) => sum + (entity.currentVotes || 0),
    0
  );

  const marginOfVictory = 
    winners.length > 1 || entitiesForAnnouncement.length < 2
      ? 0
      : totalVotes > 0
        ? (((winners[0]?.currentVotes || 0) - (entitiesForAnnouncement[1]?.currentVotes || 0)) / totalVotes) * 100
        : 0;

  return {
    electionId: election.id,
    officeName: election.officeName,
    winners: winners.map(winner => ({
      id: winner.id,
      name: winner.name,
      partyName: winner.partyName,
      partyColor: winner.partyColor,
      currentVotes: winner.currentVotes || 0,
    })),
    electoralSystem: election.electoralSystem,
    margin: marginOfVictory,
    reportingPercent: election.percentReported || 100,
    totalVotes,
  };
};

const isProgressiveReportingComplete = () => {
  // This would need to be imported from wherever the electoral college system is defined
  // For now, we'll use a simple time-based check
  return false;
};

export {
  SIMULATION_SPEEDS,
  distributeVoteChunkProportionally,
  createAnnouncementData,
  isProgressiveReportingComplete,
};