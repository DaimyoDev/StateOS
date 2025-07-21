// src/elections/electionSimulator.js
// This file is responsible for taking a list of candidates in an election
// and simulating the final vote counts based on their polling and other factors.

/**
 * Distributes a total number of votes among a list of candidates based on their polling percentages.
 * This function simulates the final vote tally for an election.
 * @param {Array<object>} candidatesList - A list of candidate objects, each with a 'polling' property.
 * @param {number} totalVotesToDistribute - The total number of votes cast in the election.
 * @param {string} [electionIdForLog="election"] - An optional ID for logging purposes.
 * @returns {Array<object>} The list of candidates with an added 'votes' property.
 */
export function distributeVotesToCandidates(
  candidatesList,
  totalVotesToDistribute
) {
  if (!candidatesList || candidatesList.length === 0) {
    return [];
  }

  // Use polling as a basis for vote share.
  let tempCandidates = candidatesList.map((c) => ({
    ...c,
    polling: c.polling || 0, // Ensure polling exists
    votes: 0, // Initialize votes
  }));

  const totalPollingSum = tempCandidates.reduce((sum, c) => sum + c.polling, 0);

  if (totalPollingSum === 0 && tempCandidates.length > 0) {
    // If all polling is 0 (fallback), distribute equally.
    const equalShare = Math.floor(
      totalVotesToDistribute / tempCandidates.length
    );
    let remainder = totalVotesToDistribute % tempCandidates.length;
    return tempCandidates.map((c) => {
      c.votes = equalShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      return c;
    });
  }

  // Calculate votes based on polling share
  let assignedVotesCount = 0;
  tempCandidates.forEach((candidate) => {
    const proportion =
      totalPollingSum > 0
        ? candidate.polling / totalPollingSum
        : 1 / tempCandidates.length;
    candidate.votes = Math.floor(proportion * totalVotesToDistribute);
    assignedVotesCount += candidate.votes;
  });

  // Distribute any remaining votes due to flooring, one by one, prioritizing higher polling candidates.
  let remainingVotes = totalVotesToDistribute - assignedVotesCount;
  if (remainingVotes > 0) {
    tempCandidates.sort((a, b) => b.polling - a.polling);
    for (let i = 0; i < remainingVotes; i++) {
      tempCandidates[i % tempCandidates.length].votes++;
    }
  }

  // Final safety check to ensure total votes match
  let finalVoteSum = tempCandidates.reduce((sum, c) => sum + c.votes, 0);
  if (finalVoteSum !== totalVotesToDistribute && tempCandidates.length > 0) {
    let diff = totalVotesToDistribute - finalVoteSum;
    tempCandidates[0].votes += diff; // Add/remove from the highest polling candidate
  }

  return tempCandidates;
}
