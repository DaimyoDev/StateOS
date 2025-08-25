import { pollingOptimizer, normalizePollingOptimized} from "../General Scripts/OptimizedPollingFunctions.js";

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

        // 2. Sync candidate data with latest SoA store data before generating poll
        const { politicians } = activeCampaign;
        const updatedCandidates = new Map();
        
        for (const [candidateId, candidate] of election.candidates) {
          const stateData = politicians.state.get(candidateId);
          const attributesData = politicians.attributes.get(candidateId);
          
          if (stateData || attributesData) {
            updatedCandidates.set(candidateId, {
              ...candidate,
              baseScore: stateData?.baseScore || candidate.baseScore,
              nameRecognition: stateData?.nameRecognition || candidate.nameRecognition,
              approvalRating: stateData?.approvalRating || candidate.approvalRating,
              mediaBuzz: stateData?.mediaBuzz || candidate.mediaBuzz,
              ...(attributesData && { attributes: { ...candidate.attributes, ...attributesData } })
            });
          } else {
            updatedCandidates.set(candidateId, candidate);
          }
        }

        // 3. Get the "Ground Truth" polling using updated candidate data
        const groundTruthPollingMap = normalizePollingOptimized(
          updatedCandidates,
          election.entityDataSnapshot.population
        );

        // 4. Apply the pollster's bias to the ground truth
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

        // 5. Re-normalize the biased results so they sum to 100%
        const normalizedBiasedPolls = normalizePollingOptimized(finalPollResults);

        // 6. Store the new poll
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

    /**
     * Batch generates polls for multiple elections efficiently to reduce overhead
     */
    batchGenerateNewPolls: (electionIds) => {
      if (!electionIds || electionIds.length === 0) return;

      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign) return {};

        const allPollsters = activeCampaign.pollingFirms || [];
        if (allPollsters.length === 0) return {};

        const newRecentPollsMap = new Map(state.recentPollsByElection);
        const { politicians } = activeCampaign;

        // Pre-cache politician data to avoid repeated lookups
        const politicianCache = new Map();
        for (const [id, stateData] of politicians.state) {
          const attributesData = politicians.attributes.get(id);
          politicianCache.set(id, { stateData, attributesData });
        }

        for (const electionId of electionIds) {
          const election = activeCampaign.elections.find(e => e.id === electionId);
          if (!election) continue;

          // Select a random pollster
          const pollster = allPollsters[Math.floor(Math.random() * allPollsters.length)];

          // Sync candidate data efficiently using cache
          const updatedCandidates = new Map();
          for (const [candidateId, candidate] of election.candidates) {
            const cachedData = politicianCache.get(candidateId);
            
            if (cachedData?.stateData || cachedData?.attributesData) {
              updatedCandidates.set(candidateId, {
                ...candidate,
                baseScore: cachedData.stateData?.baseScore || candidate.baseScore,
                nameRecognition: cachedData.stateData?.nameRecognition || candidate.nameRecognition,
                approvalRating: cachedData.stateData?.approvalRating || candidate.approvalRating,
                mediaBuzz: cachedData.stateData?.mediaBuzz || candidate.mediaBuzz,
                ...(cachedData.attributesData && { 
                  attributes: { ...candidate.attributes, ...cachedData.attributesData } 
                })
              });
            } else {
              updatedCandidates.set(candidateId, candidate);
            }
          }

          // Generate ground truth polling
          const groundTruthPollingMap = normalizePollingOptimized(
            updatedCandidates,
            election.entityDataSnapshot.population
          );

          // Apply pollster bias efficiently
          const finalPollResults = new Map();
          for (const [candidateId, candidateData] of groundTruthPollingMap.entries()) {
            let finalPolling = candidateData.polling;

            // Apply biases
            const ideologicalDifference = 
              (candidateData.ideologyScores?.economic || 0) - (pollster.biases.ideologicalSkew || 0);
            const biasEffect = (10 - Math.abs(ideologicalDifference)) * 0.2;
            finalPolling += biasEffect;

            // Methodology bias
            if (pollster.biases.methodologyBias === "youth" && candidateData.age < 45) {
              finalPolling += 1.5;
            } else if (pollster.biases.methodologyBias === "seniors" && candidateData.age > 60) {
              finalPolling += 1.5;
            }

            finalPollResults.set(candidateId, {
              ...candidateData,
              polling: Math.max(0, finalPolling),
            });
          }

          // Normalize and store
          const normalizedBiasedPolls = normalizePollingOptimized(finalPollResults);
          const newPoll = {
            pollsterId: pollster.id,
            pollsterName: pollster.name,
            date: activeCampaign.currentDate,
            results: normalizedBiasedPolls,
          };

          const recentPolls = newRecentPollsMap.get(electionId) || [];
          const updatedRecentPolls = [newPoll, ...recentPolls].slice(0, 5);
          newRecentPollsMap.set(electionId, updatedRecentPolls);
        }

        return { recentPollsByElection: newRecentPollsMap };
      });
    },
  },
});
