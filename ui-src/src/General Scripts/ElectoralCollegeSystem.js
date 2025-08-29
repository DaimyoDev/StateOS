// Electoral College System for Presidential Elections
// Uses existing coalition system for state-level polling calculations

import {
  calculateCoalitionPolling,
  aggregateCoalitionPolling,
} from "./CoalitionSystem.js";

/**
 * Electoral vote allocations by state (USA)
 * Based on 2020 census data - total of 538 electoral votes
 */
export const ELECTORAL_VOTES_BY_STATE = {
  USA_AL: 9, // Alabama
  USA_AK: 3, // Alaska
  USA_AZ: 11, // Arizona
  USA_AR: 6, // Arkansas
  USA_CA: 54, // California
  USA_CO: 10, // Colorado
  USA_CT: 7, // Connecticut
  USA_DE: 3, // Delaware
  USA_FL: 30, // Florida
  USA_GA: 16, // Georgia
  USA_HI: 4, // Hawaii
  USA_ID: 4, // Idaho
  USA_IL: 19, // Illinois
  USA_IN: 11, // Indiana
  USA_IA: 6, // Iowa
  USA_KS: 6, // Kansas
  USA_KY: 8, // Kentucky
  USA_LA: 8, // Louisiana
  USA_ME: 4, // Maine (can split)
  USA_MD: 10, // Maryland
  USA_MA: 11, // Massachusetts
  USA_MI: 15, // Michigan
  USA_MN: 10, // Minnesota
  USA_MS: 6, // Mississippi
  USA_MO: 10, // Missouri
  USA_MT: 4, // Montana
  USA_NE: 5, // Nebraska (can split)
  USA_NV: 6, // Nevada
  USA_NH: 4, // New Hampshire
  USA_NJ: 14, // New Jersey
  USA_NM: 5, // New Mexico
  USA_NY: 28, // New York
  USA_NC: 16, // North Carolina
  USA_ND: 3, // North Dakota
  USA_OH: 17, // Ohio
  USA_OK: 7, // Oklahoma
  USA_OR: 8, // Oregon
  USA_PA: 19, // Pennsylvania
  USA_RI: 4, // Rhode Island
  USA_SC: 9, // South Carolina
  USA_SD: 3, // South Dakota
  USA_TN: 11, // Tennessee
  USA_TX: 40, // Texas
  USA_UT: 6, // Utah
  USA_VT: 3, // Vermont
  USA_VA: 13, // Virginia
  USA_WA: 12, // Washington
  USA_WV: 4, // West Virginia
  USA_WI: 10, // Wisconsin
  USA_WY: 3, // Wyoming
  // DC gets 3 electoral votes
  USA_DC: 3,
};

/**
 * States that can split electoral votes (Maine and Nebraska use congressional district method)
 */
export const SPLIT_ELECTORAL_STATES = new Set(["USA_ME", "USA_NE"]);

/**
 * Electoral College System class
 */
export class ElectoralCollegeSystem {
  constructor() {
    this.stateResultsCache = new Map();
    this.lastCalculationTime = new Map();
    this.CACHE_DURATION = 10000; // 10 seconds
  }

  /**
   * Calculate electoral college results for a presidential election
   * Uses coalition system for accurate state-level modeling
   */
  calculateElectoralCollege(candidates, activeCampaign, countryData) {
    if (!activeCampaign?.coalitionSystems) {
      console.warn(
        "No coalition systems available for electoral college calculation"
      );
      return this.fallbackElectoralCalculation(candidates, countryData);
    }

    const results = {
      candidateElectoralVotes: new Map(),
      stateResults: new Map(),
      totalElectoralVotes: 0,
      winner: null,
      isTie: false,
      summary: {
        totalStates: 0,
        statesWon: new Map(),
      },
    };

    // Initialize candidate electoral vote counts
    candidates.forEach((candidate) => {
      results.candidateElectoralVotes.set(candidate.id, 0);
      results.summary.statesWon.set(candidate.id, []);
    });

    // Process each state
    const states = countryData?.regions || [];
    results.summary.totalStates = states.length;

    states.forEach((state) => {
      const stateResult = this.calculateStateElectoralVotes(
        state,
        candidates,
        activeCampaign.coalitionSystems,
        activeCampaign
      );

      if (stateResult) {
        results.stateResults.set(state.id, stateResult);

        // Add electoral votes to winner(s)
        if (stateResult.winner) {
          const currentVotes =
            results.candidateElectoralVotes.get(stateResult.winner.id) || 0;
          results.candidateElectoralVotes.set(
            stateResult.winner.id,
            currentVotes + stateResult.electoralVotes
          );
          results.summary.statesWon.get(stateResult.winner.id).push({
            stateName: state.name,
            stateId: state.id,
            electoralVotes: stateResult.electoralVotes,
          });
        }

        results.totalElectoralVotes += stateResult.electoralVotes;
      }
    });

    // Determine overall winner (need 270+ electoral votes)
    this.determineElectoralWinner(results);

    console.log(
      `Electoral College Results: ${results.winner?.name || "No winner"} - ${
        results.candidateElectoralVotes.get(results.winner?.id) || 0
      } electoral votes`
    );

    return results;
  }

  /**
   * Calculate electoral votes for a single state using coalition system
   */
  calculateStateElectoralVotes(
    state,
    candidates,
    coalitionSystems,
    activeCampaign
  ) {
    const stateId = state.id;
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

    if (electoralVotes === 0) {
      console.warn(`No electoral votes defined for state: ${stateId}`);
      return null;
    }

    // Check cache
    const cacheKey = `${stateId}_${candidates.map((c) => c.id).join("_")}`;
    const lastCalc = this.lastCalculationTime.get(cacheKey);
    if (lastCalc && Date.now() - lastCalc < this.CACHE_DURATION) {
      return this.stateResultsCache.get(cacheKey);
    }

    // Get coalition system for this state
    const coalitionKey = `state_${stateId}`;
    const coalitionSoA = coalitionSystems[coalitionKey];

    if (!coalitionSoA) {
      console.warn(
        `No coalition system found for state: ${stateId}, using fallback`
      );
      return this.fallbackStateCalculation(state, candidates);
    }

    // Calculate polling for each candidate using coalitions
    const candidatePolling = new Map();
    const activeCampaignPoliticians = activeCampaign?.politicians;

    candidates.forEach((candidate) => {
      if (candidate.isPlayer) {
        // For player, use simplified calculation
        candidatePolling.set(
          candidate.id,
          this.calculatePlayerStatePolling(candidate, state)
        );
      } else {
        // For AI candidates, use coalition system
        const candidateData = {
          calculatedIdeology: activeCampaignPoliticians?.base.get(candidate.id)
            ?.calculatedIdeology,
          policyStances: activeCampaignPoliticians?.policyStances.get(
            candidate.id
          ),
          partyId: candidate.partyId,
          attributes:
            candidate.attributes ||
            activeCampaignPoliticians?.attributes.get(candidate.id),
        };

        const coalitionResults = calculateCoalitionPolling(
          candidate.id,
          candidateData,
          coalitionSoA
        );
        coalitionSoA.polling.set(candidate.id, coalitionResults);

        const overallScore = aggregateCoalitionPolling(
          coalitionSoA,
          candidate.id
        );
        candidatePolling.set(
          candidate.id,
          isNaN(overallScore) ? 25 : overallScore
        );
      }
    });

    // Normalize polling to ensure it sums to 100%
    const normalizedPolling = this.normalizeStatePolling(candidatePolling);

    // Determine winner (simple plurality for most states)
    let winner = null;
    let highestPolling = 0;

    normalizedPolling.forEach((polling, candidateId) => {
      if (polling > highestPolling) {
        highestPolling = polling;
        winner = candidates.find((c) => c.id === candidateId);
      }
    });

    const result = {
      stateId: stateId,
      stateName: state.name,
      electoralVotes: electoralVotes,
      winner: winner,
      candidatePolling: normalizedPolling,
      margin: this.calculateMargin(normalizedPolling),
      isSplitState: SPLIT_ELECTORAL_STATES.has(stateId),
    };

    // Handle split states (Maine and Nebraska) - simplified for now
    if (SPLIT_ELECTORAL_STATES.has(stateId)) {
      result.splitResults = this.handleSplitElectoralState(
        state,
        candidates,
        normalizedPolling
      );
    }

    // Cache result
    this.stateResultsCache.set(cacheKey, result);
    this.lastCalculationTime.set(cacheKey, Date.now());

    return result;
  }

  /**
   * Calculate simplified polling for player candidate in a state
   */
  calculatePlayerStatePolling(player, state) {
    let baseScore = 35; // Base polling

    // Party popularity in state
    if (player.partyId && state.politicalLandscape) {
      const party = state.politicalLandscape.find(
        (p) => p.id === player.partyId
      );
      if (party) {
        baseScore += (party.popularity / 100 - 0.5) * 20;
      }
    }

    // Player attributes
    if (player.attributes) {
      baseScore += ((player.attributes.charisma || 50) / 100 - 0.5) * 15;
      baseScore += ((player.attributes.integrity || 50) / 100 - 0.5) * 10;
    }

    // Name recognition
    if (player.nameRecognition) {
      baseScore += (player.nameRecognition / 100) * 10;
    }

    // Random variation for realism
    baseScore += (Math.random() - 0.5) * 10;

    return Math.max(5, Math.min(95, baseScore));
  }

  /**
   * Normalize state polling to sum to 100%
   */
  normalizeStatePolling(candidatePolling) {
    const total = Array.from(candidatePolling.values()).reduce(
      (sum, poll) => sum + poll,
      0
    );
    const normalized = new Map();

    if (total > 0) {
      candidatePolling.forEach((polling, candidateId) => {
        normalized.set(candidateId, Math.round((polling / total) * 100));
      });
    } else {
      // Equal distribution if no polling data
      const equalShare = Math.floor(100 / candidatePolling.size);
      candidatePolling.forEach((_, candidateId) => {
        normalized.set(candidateId, equalShare);
      });
    }

    return normalized;
  }

  /**
   * Calculate victory margin for a state
   */
  calculateMargin(normalizedPolling) {
    const sortedPolling = Array.from(normalizedPolling.values()).sort(
      (a, b) => b - a
    );
    if (sortedPolling.length < 2) return 100;
    return sortedPolling[0] - sortedPolling[1];
  }

  /**
   * Handle split electoral states (Maine and Nebraska)
   * Simplified implementation - could be enhanced with district-level coalitions
   */
  handleSplitElectoralState(state, candidates, normalizedPolling) {
    // For now, just return the overall result
    // In a more detailed implementation, this would calculate results for each congressional district
    return {
      statewide: normalizedPolling,
      districts: [], // Could be populated with district-level results
    };
  }

  /**
   * Determine the overall electoral college winner
   */
  determineElectoralWinner(results) {
    const ELECTORAL_VOTES_TO_WIN = 270;
    let winner = null;
    let highestVotes = 0;
    let tieCount = 0;

    results.candidateElectoralVotes.forEach((votes, candidateId) => {
      if (votes > highestVotes) {
        highestVotes = votes;
        winner = candidateId;
        tieCount = 1;
      } else if (votes === highestVotes && votes > 0) {
        tieCount++;
      }
    });

    if (highestVotes >= ELECTORAL_VOTES_TO_WIN && tieCount === 1) {
      results.winner = { id: winner, electoralVotes: highestVotes };
    } else if (tieCount > 1) {
      results.isTie = true;
    }
  }

  /**
   * Fallback calculation when coalition system isn't available
   */
  fallbackElectoralCalculation(candidates, countryData) {
    console.warn("Using fallback electoral college calculation");

    const results = {
      candidateElectoralVotes: new Map(),
      stateResults: new Map(),
      totalElectoralVotes: 0,
      winner: null,
      isTie: false,
      summary: { totalStates: 0, statesWon: new Map() },
    };

    candidates.forEach((candidate) => {
      results.candidateElectoralVotes.set(candidate.id, 0);
      results.summary.statesWon.set(candidate.id, []);
    });

    const states = countryData?.regions || [];
    states.forEach((state) => {
      const stateResult = this.fallbackStateCalculation(state, candidates);
      if (stateResult) {
        results.stateResults.set(state.id, stateResult);
        if (stateResult.winner) {
          const currentVotes =
            results.candidateElectoralVotes.get(stateResult.winner.id) || 0;
          results.candidateElectoralVotes.set(
            stateResult.winner.id,
            currentVotes + stateResult.electoralVotes
          );
        }
        results.totalElectoralVotes += stateResult.electoralVotes;
      }
    });

    this.determineElectoralWinner(results);
    return results;
  }

  /**
   * Fallback state calculation using simple party popularity
   */
  fallbackStateCalculation(state, candidates) {
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[state.id] || 0;
    if (electoralVotes === 0) return null;

    const candidateScores = new Map();

    candidates.forEach((candidate) => {
      let score = 25; // Base score

      // Party popularity in state
      if (candidate.partyId && state.politicalLandscape) {
        const party = state.politicalLandscape.find(
          (p) => p.id === candidate.partyId
        );
        if (party) {
          score += party.popularity;
        }
      }

      // Random variation
      score += (Math.random() - 0.5) * 20;
      candidateScores.set(candidate.id, Math.max(5, score));
    });

    // Normalize and find winner
    const normalizedScores = this.normalizeStatePolling(candidateScores);
    let winner = null;
    let highestScore = 0;

    normalizedScores.forEach((score, candidateId) => {
      if (score > highestScore) {
        highestScore = score;
        winner = candidates.find((c) => c.id === candidateId);
      }
    });

    return {
      stateId: state.id,
      stateName: state.name,
      electoralVotes: electoralVotes,
      winner: winner,
      candidatePolling: normalizedScores,
      margin: this.calculateMargin(normalizedScores),
      isSplitState: SPLIT_ELECTORAL_STATES.has(state.id),
    };
  }

  /**
   * Get electoral college summary for UI display
   */
  getElectoralSummary(results) {
    const summary = {
      totalElectoralVotes: results.totalElectoralVotes,
      neededToWin: 270,
      candidates: [],
      battlegroundStates: [],
      safeStates: { democratic: [], republican: [], other: [] },
    };

    // Build candidate summary
    results.candidateElectoralVotes.forEach((votes, candidateId) => {
      summary.candidates.push({
        candidateId,
        electoralVotes: votes,
        statesWon: results.summary.statesWon.get(candidateId)?.length || 0,
        percentage: ((votes / results.totalElectoralVotes) * 100).toFixed(1),
      });
    });

    // Identify battleground states (margin < 10%)
    results.stateResults.forEach((stateResult, stateId) => {
      if (stateResult.margin < 10) {
        summary.battlegroundStates.push({
          stateId: stateId,
          stateName: stateResult.stateName,
          electoralVotes: stateResult.electoralVotes,
          margin: stateResult.margin,
          leader: stateResult.winner?.name,
        });
      }
    });

    return summary;
  }
}

// Create singleton instance
export const electoralCollegeSystem = new ElectoralCollegeSystem();

/**
 * Main function to calculate electoral college results
 */
export function calculateElectoralCollegeResults(
  candidates,
  activeCampaign,
  countryData
) {
  return electoralCollegeSystem.calculateElectoralCollege(
    candidates,
    activeCampaign,
    countryData
  );
}

/**
 * Get electoral vote count for a state
 */
export function getElectoralVotes(stateId) {
  return ELECTORAL_VOTES_BY_STATE[stateId] || 0;
}

/**
 * Check if a state can split electoral votes
 */
export function canSplitElectoralVotes(stateId) {
  return SPLIT_ELECTORAL_STATES.has(stateId);
}
