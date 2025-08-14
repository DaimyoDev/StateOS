// src/elections/electionSimulator.js
// This file is responsible for taking a list of candidates in an election
// and simulating the final vote counts based on their polling and other factors.

/**
 * Distributes a total number of votes among a list of candidates based on their polling percentages.
 * This function simulates the final vote tally for an election.
 * @param {Map<any, object>|Array<object>|object} candidatesInput - A Map of candidate objects (preferred), or an array or plain object. Each candidate object should have a 'polling' property.
 * @param {number} totalVotesToDistribute - The total number of votes cast in the election.
 * @param {string} [electionIdForLog="election"] - An optional ID for logging purposes.
 * @returns {Map<any, object>} A Map of candidates with an added 'votes' property.
 */
export function distributeVotesToCandidates(
  candidatesInput,
  totalVotesToDistribute,
  electionIdForLog = "election"
) {
  let candidateMap;

  if (candidatesInput instanceof Map) {
    candidateMap = new Map(candidatesInput); // Copy to avoid mutating original
  } else if (Array.isArray(candidatesInput)) {
    candidateMap = new Map(candidatesInput.map((c) => [c.id, c]));
  } else if (candidatesInput && typeof candidatesInput === "object") {
    candidateMap = new Map(
      Object.entries(candidatesInput).map(([k, v]) => [k, v])
    );
  } else {
    console.warn(
      `distributeVotesToCandidates: Invalid candidatesInput for ${electionIdForLog}. Returning empty Map.`,
      candidatesInput
    );
    return new Map();
  }

  if (candidateMap.size === 0) {
    console.warn(
      `distributeVotesToCandidates: No candidates found for ${electionIdForLog}. Returning empty Map.`
    );
    return new Map();
  }

  // Step 1: Build temp candidates with votes initialized
  const tempCandidates = Array.from(candidateMap.entries()).map(([key, c]) => ({
    key,
    candidate: {
      ...c,
      polling: c.polling || 0,
      votes: 0,
    },
  }));

  // Step 2: Total polling
  const totalPollingSum = tempCandidates.reduce(
    (sum, { candidate }) => sum + candidate.polling,
    0
  );

  // Step 3: Equal distribution fallback
  if (totalPollingSum === 0) {
    const equalShare = Math.floor(
      totalVotesToDistribute / tempCandidates.length
    );
    let remainder = totalVotesToDistribute % tempCandidates.length;
    console.log(
      `distributeVotesToCandidates: All candidates have 0 polling for ${electionIdForLog}. Distributing votes equally.`
    );
    const resultMap = new Map();
    tempCandidates.forEach(({ key, candidate }) => {
      candidate.votes = equalShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      resultMap.set(key, candidate);
    });
    return resultMap;
  }

  // Step 4: Proportional distribution
  let assignedVotesCount = 0;
  tempCandidates.forEach(({ candidate }) => {
    const proportion = candidate.polling / totalPollingSum;
    candidate.votes = Math.floor(proportion * totalVotesToDistribute);
    assignedVotesCount += candidate.votes;
  });

  // Step 5: Distribute remaining votes
  let remainingVotes = totalVotesToDistribute - assignedVotesCount;
  if (remainingVotes > 0) {
    tempCandidates.sort((a, b) => b.candidate.polling - a.candidate.polling);
    for (let i = 0; i < remainingVotes; i++) {
      tempCandidates[i % tempCandidates.length].candidate.votes++;
    }
  }

  // Step 6: Final adjustment if needed
  const finalVoteSum = tempCandidates.reduce(
    (sum, { candidate }) => sum + candidate.votes,
    0
  );
  if (finalVoteSum !== totalVotesToDistribute && tempCandidates.length > 0) {
    const diff = totalVotesToDistribute - finalVoteSum;
    tempCandidates[0].candidate.votes += diff;
    console.warn(
      `distributeVotesToCandidates: Adjusted votes by ${diff} for candidate ${
        tempCandidates[0].candidate.id ||
        tempCandidates[0].candidate.name ||
        "unknown"
      } to match totalVotesToDistribute for ${electionIdForLog}.`
    );
  }

  // Step 7: Return Map
  const resultMap = new Map();
  tempCandidates.forEach(({ key, candidate }) => {
    resultMap.set(key, candidate);
  });

  return resultMap;
}
