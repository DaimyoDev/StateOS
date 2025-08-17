import { normalizePolling } from "../General Scripts/PollingFunctions";

export const createPollingSlice = (set) => ({
  // --- State ---
  // We can store recent polls here to show trends over time
  recentPollsByElection: new Map(),

  // --- Actions ---
  actions: {
    /**
     * Generates and stores a new poll for a single, specific election.
     * This would be called by the weekly update tick.
     */
    generateNewPollForElection: (electionId) => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign) return {};

        const election = activeCampaign.elections.find(
          (e) => e.id === electionId
        );
        const allPollsters = activeCampaign.pollingFirms || [];
        if (!election || allPollsters.length === 0) return {};

        // 1. Select a random pollster to conduct the poll
        const pollster =
          allPollsters[Math.floor(Math.random() * allPollsters.length)];

        // 2. Get the "Ground Truth" polling by running the existing normalization function
        //    This function calculates the real support based on name rec, base score, etc.
        const groundTruthPollingMap = normalizePolling(
          election.candidates,
          election.entityDataSnapshot.population
        );

        // 3. Apply the pollster's bias to the ground truth
        const finalPollResults = new Map();
        for (const [
          candidateId,
          candidateData,
        ] of groundTruthPollingMap.entries()) {
          let finalPolling = candidateData.polling;

          // Apply Ideological Skew
          // We compare the candidate's ideology score on the main economic axis
          // to the pollster's bias.
          const ideologicalDifference =
            (candidateData.ideologyScores?.economic || 0) -
            (pollster.biases.ideologicalSkew || 0);

          // A small adjustment. A perfect match (diff=0) gives a boost, a mismatch gives a penalty.
          const biasEffect = (10 - Math.abs(ideologicalDifference)) * 0.2; // Max +/- 2 points
          finalPolling += biasEffect;

          // Apply Methodological Bias (a simple example)
          if (
            pollster.biases.methodologyBias === "youth" &&
            candidateData.age < 45
          ) {
            finalPolling += 1.5;
          } else if (
            pollster.biases.methodologyBias === "seniors" &&
            candidateData.age > 60
          ) {
            finalPolling += 1.5;
          }

          finalPollResults.set(candidateId, {
            ...candidateData,
            polling: Math.max(0, finalPolling),
          });
        }

        // 4. Re-normalize the biased results so they sum to 100%
        const normalizedBiasedPolls = normalizePolling(finalPollResults);

        // 5. Store the new poll
        const newPoll = {
          pollsterId: pollster.id,
          pollsterName: pollster.name,
          date: activeCampaign.currentDate,
          results: normalizedBiasedPolls,
        };

        const recentPolls = state.recentPollsByElection.get(electionId) || [];
        const updatedRecentPolls = [newPoll, ...recentPolls].slice(0, 5); // Keep the last 5 polls

        const newRecentPollsMap = new Map(state.recentPollsByElection);
        newRecentPollsMap.set(electionId, updatedRecentPolls);

        return { recentPollsByElection: newRecentPollsMap };
      });
    },
  },
});
