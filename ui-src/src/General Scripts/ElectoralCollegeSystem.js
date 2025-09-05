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
    this.reportingSimulation = new Map(); // Track progressive reporting
    this.calculatedStates = new Map(); // Track which states have been calculated
  }

  /**
   * Reset the system for a new election
   */
  reset() {
    this.reportingSimulation.clear();
    this.calculatedStates.clear();
    this.stateResultsCache.clear();
    this.lastCalculationTime.clear();
  }

  /**
   * Initialize progressive reporting simulation for states
   * States report at different times to simulate real election night
   */
  initializeProgressiveReporting(states, simulationSpeed = 5000) {
    this.reset(); // Reset everything for new election

    // Map simulation speeds to much more reasonable electoral college reporting times
    // Real election nights can take 6-12+ hours, so we need bigger multipliers
    let speedMultiplier;
    switch (simulationSpeed) {
      case 1500: // fast - should still take a few minutes
        speedMultiplier = 1.0; // 4 minutes total (fast but reasonable)
        break;
      case 5000: // normal - should take longer
        speedMultiplier = 4.0; // 16 minutes total
        break;
      case 10000: // slow
        speedMultiplier = 8.0; // 32 minutes total
        break;
      case 20000: // superSlow
        speedMultiplier = 15.0; // 60 minutes total (1 hour)
        break;
      case 300000: // realistic - should be very slow like real life
        speedMultiplier = 45.0; // 180 minutes total (3 hours)
        break;
      default:
        // For custom speeds, use a more aggressive formula
        speedMultiplier = Math.min(45.0, Math.max(0.5, simulationSpeed / 1250));
    }

    console.log(
      `[DEBUG] Simulation speed: ${simulationSpeed}, multiplier: ${speedMultiplier}x`
    );
    const reportingOrder = [...states];

    // Sort states by various factors for realistic reporting order
    // Small states and East Coast states typically report first
    reportingOrder.sort((a, b) => {
      const aVotes = ELECTORAL_VOTES_BY_STATE[a.id] || 0;
      const bVotes = ELECTORAL_VOTES_BY_STATE[b.id] || 0;

      // East coast states (earlier time zones) report first
      const eastCoastStates = new Set([
        "USA_ME",
        "USA_NH",
        "USA_VT",
        "USA_MA",
        "USA_CT",
        "USA_RI",
        "USA_NY",
        "USA_NJ",
        "USA_PA",
        "USA_DE",
        "USA_MD",
        "USA_VA",
        "USA_NC",
        "USA_SC",
        "USA_GA",
        "USA_FL",
      ]);

      if (eastCoastStates.has(a.id) && !eastCoastStates.has(b.id)) return -1;
      if (!eastCoastStates.has(a.id) && eastCoastStates.has(b.id)) return 1;

      // Then by size (smaller states report faster)
      return aVotes - bVotes;
    });

    // Assign reporting times - scaled by simulation speed
    const baseTime = Date.now();
    const baseReportingWindow = 240000; // Base: 4 minutes total
    const totalReportingWindow = baseReportingWindow * speedMultiplier;

    reportingOrder.forEach((state, index) => {
      // Stagger state start times over the first half of the window
      const baseStartWindow = 120000; // Base: 2 minutes for starts
      const startWindow = baseStartWindow * speedMultiplier;
      const startDelay = (index / reportingOrder.length) * startWindow;
      const reportingStartTime = baseTime + startDelay;

      // States take longer to finish reporting based on size and complexity
      const electoralVotes = ELECTORAL_VOTES_BY_STATE[state.id] || 0;
      const baseReportingDuration = 60000; // Base: 1 minute to report
      const sizeMultiplier = Math.max(1, electoralVotes / 15); // Larger states take much longer
      const randomVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of base time
      const reportingDuration =
        baseReportingDuration *
        sizeMultiplier *
        randomVariation *
        speedMultiplier;

      this.reportingSimulation.set(state.id, {
        reportingStartTime,
        reportingDuration,
        hasReported: false,
        reportingPercent: 0,
        finalResults: null,
      });

      // Debug logging for timing (remove in production)
      const startMinutes = Math.floor(startDelay / 60000);
      const startSeconds = Math.floor((startDelay % 60000) / 1000);
      const durationMinutes = Math.floor(reportingDuration / 60000);
      const durationSeconds = Math.floor((reportingDuration % 60000) / 1000);
      console.log(
        `[DEBUG] ${state.name}: starts at ${startMinutes}:${startSeconds
          .toString()
          .padStart(2, "0")}, reports for ${durationMinutes}:${durationSeconds
          .toString()
          .padStart(2, "0")} (${electoralVotes} EV)`
      );
    });
  }

  /**
   * Check if all states have finished reporting
   */
  isReportingComplete() {
    if (this.reportingSimulation.size === 0) return false;

    const currentTime = Date.now();
    for (const [stateId, data] of this.reportingSimulation) {
      if (currentTime < data.reportingStartTime + data.reportingDuration) {
        return false; // At least one state still reporting
      }
    }
    return true; // All states done
  }

  /**
   * Get current reporting status for all states
   */
  getReportingStatus() {
    const currentTime = Date.now();
    const reportingStatus = new Map();

    this.reportingSimulation.forEach((data, stateId) => {
      if (currentTime >= data.reportingStartTime) {
        // State has started reporting - calculate percentage based on duration
        const timeSinceStart = currentTime - data.reportingStartTime;
        const percent = Math.min(
          100,
          (timeSinceStart / data.reportingDuration) * 100
        );

        reportingStatus.set(stateId, {
          hasStarted: true,
          reportingPercent: Math.floor(percent),
          isComplete: percent >= 100,
        });
      } else {
        // State hasn't started reporting yet
        reportingStatus.set(stateId, {
          hasStarted: false,
          reportingPercent: 0,
          isComplete: false,
        });
      }
    });

    return reportingStatus;
  }

  /**
   * Calculate electoral college results for a presidential election
   * Uses coalition system for accurate state-level modeling
   */
  calculateElectoralCollege(
    candidates,
    activeCampaign,
    countryData,
    useProgressiveReporting = false,
    simulationSpeed = 5000
  ) {
    console.log(
      "[DEBUG] ElectoralCollegeSystem.calculateElectoralCollege called with:",
      {
        candidatesCount: candidates?.length || 0,
        candidates: candidates?.map((c) => ({
          id: c.id,
          name: c.name,
          votes: c.votes,
        })),
        activeCampaign: activeCampaign
          ? {
              countryId: activeCampaign.countryId,
              coalitionSystems: activeCampaign.coalitionSystems
                ? Object.keys(activeCampaign.coalitionSystems)
                : null,
            }
          : null,
        countryData: countryData
          ? {
              id: countryData.id,
              name: countryData.name,
              regionsCount: countryData.regions?.length || 0,
            }
          : null,
      }
    );

    // If we're using progressive reporting, don't fall back even without coalition systems
    if (!useProgressiveReporting && !activeCampaign?.coalitionSystems) {
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

    // Initialize progressive reporting if requested and not already initialized
    if (useProgressiveReporting && this.reportingSimulation.size === 0) {
      console.log(
        "[DEBUG] Initializing progressive reporting for",
        states.length,
        "states with speed",
        simulationSpeed
      );
      this.initializeProgressiveReporting(states, simulationSpeed);
    }

    // Get current reporting status
    const reportingStatus = useProgressiveReporting
      ? this.getReportingStatus()
      : null;

    states.forEach((state) => {
      if (useProgressiveReporting && reportingStatus) {
        const status = reportingStatus.get(state.id);
        const reportingInfo = {
          reportingPercent: status?.reportingPercent || 0,
          hasStartedReporting: status?.hasStarted || false,
          reportingComplete: status?.isComplete || false,
        };

        if (
          reportingInfo.hasStartedReporting &&
          !this.calculatedStates.has(state.id)
        ) {
          // State just started reporting - calculate its results now
          console.log(
            `[DEBUG] State ${state.name} started reporting - calculating results`
          );

          let stateResult;
          if (activeCampaign?.coalitionSystems) {
            stateResult = this.calculateStateElectoralVotes(
              state,
              candidates,
              activeCampaign.coalitionSystems,
              activeCampaign
            );
          } else {
            // Use fallback calculation for individual state in simulation mode
            stateResult = this.fallbackStateCalculation(state, candidates);
          }

          if (stateResult) {
            // Add state name and reporting info
            stateResult.stateName = state.name;
            stateResult.reportingPercent = reportingInfo.reportingPercent;
            stateResult.hasStartedReporting = true;
            stateResult.reportingComplete = reportingInfo.reportingComplete;

            // Only show results and declare winner if we have sufficient reporting
            // Different thresholds based on margin and electoral importance
            const MINIMUM_REPORTING_THRESHOLD =
              this.getMinimumReportingThreshold(stateResult, state);
            stateResult.showResults =
              reportingInfo.reportingPercent >= MINIMUM_REPORTING_THRESHOLD ||
              reportingInfo.reportingComplete;

            // Cache the calculated result
            this.calculatedStates.set(state.id, stateResult);
          }
        }

        // Get the state result (either cached or create placeholder)
        let stateResult = this.calculatedStates.get(state.id);

        if (!stateResult) {
          // Create placeholder for states not yet reporting
          stateResult = {
            stateName: state.name,
            stateId: state.id,
            electoralVotes: ELECTORAL_VOTES_BY_STATE[state.id] || 0,
            winner: null,
            candidatePolling: new Map(),
            margin: 0,
            reportingPercent: reportingInfo.reportingPercent,
            hasStartedReporting: reportingInfo.hasStartedReporting,
            reportingComplete: reportingInfo.reportingComplete,
            showResults: false,
          };
        } else {
          // Update reporting progress for calculated states
          stateResult.reportingPercent = reportingInfo.reportingPercent;
          stateResult.reportingComplete = reportingInfo.reportingComplete;

          // Re-evaluate if we should show results based on updated reporting percentage
          const MINIMUM_REPORTING_THRESHOLD = this.getMinimumReportingThreshold(
            stateResult,
            state
          );
          stateResult.showResults =
            reportingInfo.reportingPercent >= MINIMUM_REPORTING_THRESHOLD ||
            reportingInfo.reportingComplete;
        }

        results.stateResults.set(state.id, stateResult);

        // Add electoral votes only if state has results
        if (stateResult.winner && stateResult.showResults) {
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

          results.totalElectoralVotes += stateResult.electoralVotes;
        }
      } else {
        // Non-progressive mode - calculate all results immediately
        let stateResult;
        if (activeCampaign?.coalitionSystems) {
          stateResult = this.calculateStateElectoralVotes(
            state,
            candidates,
            activeCampaign.coalitionSystems,
            activeCampaign
          );
        } else {
          stateResult = this.fallbackStateCalculation(state, candidates);
        }

        if (stateResult) {
          stateResult.stateName = state.name;
          stateResult.reportingPercent = 100;
          stateResult.hasStartedReporting = true;
          stateResult.reportingComplete = true;
          stateResult.showResults = true;

          results.stateResults.set(state.id, stateResult);

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
   * Get minimum reporting threshold before declaring a winner
   * Based on margin size and state importance
   */
  getMinimumReportingThreshold(stateResult, state) {
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[state.id] || 0;
    const margin = stateResult.margin || 0;

    // Base threshold starts at 50% for most states
    let threshold = 50;

    // Adjust based on margin - closer races need more reporting
    if (margin < 2) {
      threshold = 85; // Very close race - need 85% reporting
    } else if (margin < 5) {
      threshold = 75; // Close race - need 75% reporting
    } else if (margin < 10) {
      threshold = 65; // Moderate margin - need 65% reporting
    } else if (margin >= 20) {
      threshold = 30; // Blowout - can call early at 30%
    }

    // Adjust based on electoral importance
    if (electoralVotes >= 20) {
      // Major states (CA, TX, FL, NY, PA) - be more cautious
      threshold += 10;
    } else if (electoralVotes <= 4) {
      // Small states - can call a bit earlier
      threshold -= 5;
    }

    // Ensure reasonable bounds
    threshold = Math.max(25, Math.min(90, threshold));

    console.log(
      `[DEBUG] ${state.name}: margin=${margin.toFixed(
        1
      )}%, EVs=${electoralVotes}, threshold=${threshold}%`
    );
    return threshold;
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
    console.log("[DEBUG] Fallback calculation with:", {
      candidatesCount: candidates?.length || 0,
      statesCount: countryData?.regions?.length || 0,
      countryId: countryData?.id,
    });

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
        // Set reporting information for fallback calculation (always complete when not using progressive)
        stateResult.stateName = state.name;
        stateResult.reportingPercent = 100;
        stateResult.hasStartedReporting = true;
        stateResult.reportingComplete = true;
        stateResult.showResults = true;

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
  countryData,
  useProgressiveReporting = false,
  simulationSpeed = 5000
) {
  return electoralCollegeSystem.calculateElectoralCollege(
    candidates,
    activeCampaign,
    countryData,
    useProgressiveReporting,
    simulationSpeed
  );
}

/**
 * Check if progressive reporting is complete
 */
export function isProgressiveReportingComplete() {
  return electoralCollegeSystem.isReportingComplete();
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
