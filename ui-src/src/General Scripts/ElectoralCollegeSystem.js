// Electoral College System for Presidential Elections
// Uses existing coalition system for state-level polling calculations

import {
  calculateCoalitionPolling,
  aggregateCoalitionPolling,
} from "./CoalitionSystem.js";
import { distributeValueProportionally } from "../utils/core.js";
import { usaStates } from "../data/states/usaStates.js";

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
    this.CACHE_DURATION = 2000; // Reduced to 2 seconds for more dynamic updates
    this.reportingSimulation = new Map(); // Track progressive reporting
    this.calculatedStates = new Map(); // Track which states have been calculated
    this.highestReportingPercent = new Map(); // Track highest reporting percentage per state to prevent regression
  }

  /**
   * Reset the system for a new election
   */
  reset() {
    this.reportingSimulation.clear();
    this.calculatedStates.clear();
    this.stateResultsCache.clear();
    this.lastCalculationTime.clear();
    this.highestReportingPercent.clear();
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

    });
  }

  /**
   * Check if all states have finished reporting (reached their realistic maximum)
   */
  isReportingComplete() {
    if (this.reportingSimulation.size === 0) return false;

    const reportingStatus = this.getReportingStatus();
    for (const [stateId, status] of reportingStatus) {
      if (!status.isComplete) {
        return false; // At least one state still reporting
      }
    }
    return true; // All states done (at their realistic maximum)
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
        let rawPercent = (timeSinceStart / data.reportingDuration) * 100;
        
        // All states progress to 100% reporting
        let reportingPercent = Math.min(100, rawPercent);
        
        // Apply consistent state-specific reporting speed variation (no time-based fluctuations)
        if (reportingPercent < 100) {
          // Create consistent seed for this state based on state ID only (not time)
          const stateHash = stateId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          
          const seededRandom = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };
          
          // Each state has a consistent reporting speed characteristic
          const baseSpeedVariation = 0.85 + seededRandom(stateHash) * 0.3; // 85% to 115% consistent speed
          
          // Apply the consistent speed variation
          reportingPercent = Math.min(100, rawPercent * baseSpeedVariation);
        }

        // Ensure reporting percentage never decreases
        const previousHighest = this.highestReportingPercent.get(stateId) || 0;
        reportingPercent = Math.max(previousHighest, reportingPercent);
        this.highestReportingPercent.set(stateId, reportingPercent);

        reportingStatus.set(stateId, {
          hasStarted: true,
          reportingPercent: Math.floor(reportingPercent),
          isComplete: reportingPercent >= 100, // Complete only when reaching exactly 100% reporting
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
   * Get realistic maximum reporting percentage for a state
   * Most states don't reach 100% due to provisional ballots, overseas votes, etc.
   */

  /**
   * Calculate electoral college results for a presidential election
   * Uses coalition system for accurate state-level modeling
   */
  calculateElectoralCollege(
    candidates,
    activeCampaign,
    countryData,
    useProgressiveReporting = false,
    simulationSpeed = 5000,
    statePollingOverrides = null
  ) {

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

        // Check if we need to calculate/recalculate the state results
        const existingResult = this.calculatedStates.get(state.id);
        const shouldRecalculate = reportingInfo.hasStartedReporting && !reportingInfo.isComplete; // Only recalculate while reporting is in progress, stop at completion

        if (shouldRecalculate) {
          // State needs calculation or recalculation due to reporting progress
          const isFirstCalculation = !existingResult;
          const prevReporting = existingResult?.reportingPercent || 0;

          let stateResult;
          if (activeCampaign?.coalitionSystems) {
            stateResult = this.calculateStateElectoralVotes(
              state,
              candidates,
              activeCampaign.coalitionSystems,
              activeCampaign,
              reportingInfo.reportingPercent,
              statePollingOverrides
            );
          } else {
            // Use fallback calculation for individual state in simulation mode
            stateResult = this.fallbackStateCalculation(state, candidates, reportingInfo.reportingPercent);
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


            // Cache/update the calculated result
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
            activeCampaign,
            100, // Non-progressive mode uses final results (100%)
            statePollingOverrides
          );
        } else {
          stateResult = this.fallbackStateCalculation(state, candidates, 100); // Non-progressive mode uses final results
        }

        if (stateResult) {
          // In non-progressive mode, show final results at 100%
          stateResult.stateName = state.name;
          stateResult.reportingPercent = 100;
          stateResult.hasStartedReporting = true;
          stateResult.reportingComplete = true; // Consider complete at max realistic level
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

    return results;
  }

  /**
   * Calculate electoral votes for a single state using coalition system
   */
  calculateStateElectoralVotes(
    state,
    candidates,
    coalitionSystems,
    activeCampaign,
    reportingPercent = null,
    statePollingOverrides = null
  ) {
    const stateId = state.id;
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

    if (electoralVotes === 0) {
      console.warn(`No electoral votes defined for state: ${stateId}`);
      return null;
    }

    // Check cache - include reporting percentage in cache key for progressive results
    const reportingKey = reportingPercent !== null ? `_${Math.floor(reportingPercent / 5) * 5}` : ''; // Cache in 5% increments
    const cacheKey = `${stateId}_${candidates.map((c) => c.id).join("_")}${reportingKey}`;
    const lastCalc = this.lastCalculationTime.get(cacheKey);
    if (lastCalc && Date.now() - lastCalc < this.CACHE_DURATION) {
      return this.stateResultsCache.get(cacheKey);
    }

    // Get coalition system for this state - try state-specific first, then simulation_default
    const coalitionKey = `state_${stateId}`;
    let coalitionSoA = coalitionSystems[coalitionKey];
    
    // If no state-specific coalition, try to use simulation_default for all states
    if (!coalitionSoA && coalitionSystems['simulation_default']) {
      coalitionSoA = coalitionSystems['simulation_default'];
    }

    if (!coalitionSoA) {
      console.warn(
        `No coalition system found for state: ${stateId}, using fallback`
      );
      return this.fallbackStateCalculation(state, candidates, reportingPercent);
    }

    // Calculate polling for each candidate using coalitions with state-specific variations
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

        let overallScore = aggregateCoalitionPolling(
          coalitionSoA,
          candidate.id
        );
        
        // Apply state-specific variation to avoid identical results across all states
        overallScore = this.applyStateSpecificVariation(overallScore, candidate, state, stateId);
        
        candidatePolling.set(
          candidate.id,
          isNaN(overallScore) ? 25 : overallScore
        );
      }
    });

    // Apply county-based polling overrides if provided
    if (statePollingOverrides && statePollingOverrides.has(stateId)) {
      const overridePolling = statePollingOverrides.get(stateId);
      
      // Replace candidatePolling with the county-aggregated data
      candidatePolling.clear();
      overridePolling.forEach((polling, candidateId) => {
        candidatePolling.set(candidateId, polling);
      });
    }

    // Normalize polling to ensure it sums to 100%
    let finalPolling = this.normalizeStatePolling(candidatePolling);
    
    // If we have reporting percentage, simulate progressive vote counting
    let displayPolling = finalPolling;
    if (reportingPercent !== null && reportingPercent > 0 && reportingPercent < 98) {
      displayPolling = this.simulateProgressiveVoteCounting(
        finalPolling, 
        reportingPercent, 
        stateId, 
        candidates
      );
    }

    // Determine winner (simple plurality for most states) - use display polling for current leader
    let winner = null;
    let highestPolling = 0;

    displayPolling.forEach((polling, candidateId) => {
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
      candidatePolling: displayPolling, // Use progressive results for display
      margin: this.calculateMargin(displayPolling),
      isSplitState: SPLIT_ELECTORAL_STATES.has(stateId),
    };

    // Handle split states (Maine and Nebraska) - simplified for now
    if (SPLIT_ELECTORAL_STATES.has(stateId)) {
      result.splitResults = this.handleSplitElectoralState(
        state,
        candidates,
        displayPolling
      );
    }

    // Cache result
    this.stateResultsCache.set(cacheKey, result);
    this.lastCalculationTime.set(cacheKey, Date.now());

    return result;
  }

  /**
   * Apply state-specific variation to candidate polling to avoid identical results across states
   */
  applyStateSpecificVariation(baseScore, candidate, state, stateId) {
    // Create a consistent seed based on state and candidate for reproducible variation
    const stateHash = stateId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const candidateHash = candidate.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = (stateHash + candidateHash) % 1000;
    
    // Seeded random function for consistent results
    const seededRandom = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    
    // Apply demographic-based variations
    let variation = 0;
    
    // Urban/Rural variation based on state characteristics
    const statePopulation = state.population || 1000000;
    const isLargeState = statePopulation > 5000000;
    const urbanizationFactor = Math.min(1, statePopulation / 10000000); // 0 to 1
    
    // Different candidates perform better in different state types
    if (candidate.partyName) {
      // Simplified party-based state preferences
      const partyName = candidate.partyName.toLowerCase();
      
      if (partyName.includes('democrat') || partyName.includes('liberal') || partyName.includes('progressive')) {
        // Democrats/Liberals tend to do better in more urban states
        variation += urbanizationFactor * 8 - 4; // -4 to +4 based on urbanization
      } else if (partyName.includes('republican') || partyName.includes('conservative')) {
        // Republicans/Conservatives tend to do better in more rural states  
        variation += (1 - urbanizationFactor) * 8 - 4; // -4 to +4 based on rural nature
      }
    }
    
    // Add controlled random variation per state (-5% to +5%)
    const randomVariation = (seededRandom(seed) - 0.5) * 10;
    variation += randomVariation;
    
    // Regional effects based on state ID patterns
    if (stateId.includes('_CA') || stateId.includes('_NY') || stateId.includes('_MA')) {
      // Liberal-leaning states
      if (candidate.partyName && candidate.partyName.toLowerCase().includes('democrat')) {
        variation += 3;
      }
    } else if (stateId.includes('_TX') || stateId.includes('_FL') || stateId.includes('_GA')) {
      // Conservative-leaning states  
      if (candidate.partyName && candidate.partyName.toLowerCase().includes('republican')) {
        variation += 3;
      }
    }
    
    // Apply variation and ensure reasonable bounds
    const modifiedScore = baseScore + variation;
    return Math.max(5, Math.min(95, modifiedScore));
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
   * Simulate progressive vote counting based on different precinct types reporting over time
   * This creates realistic shifts in results as urban/rural/suburban precincts report
   */
  simulateProgressiveVoteCounting(finalPolling, reportingPercent, stateId, candidates) {
    if (reportingPercent >= 98) {
      // Near complete reporting - show final results
      return finalPolling;
    }

    // Create consistent seeded random for this state
    const stateHash = stateId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const reportingProgress = reportingPercent / 100;
    
    // Simulate different precinct types reporting at different rates
    // Early: Rural and small towns (0-40% of reporting)
    // Middle: Suburban areas (40-75% of reporting) 
    // Late: Urban core areas (75-100% of reporting)
    
    const ruralWeight = Math.max(0, Math.min(1, (0.4 - reportingProgress) / 0.4 + 0.3));
    const suburbanWeight = reportingProgress < 0.4 ? 0.3 : 
                          reportingProgress < 0.75 ? 0.7 : 
                          Math.max(0.2, 1 - (reportingProgress - 0.75) / 0.25);
    const urbanWeight = reportingProgress < 0.6 ? 0 :
                       Math.min(1, (reportingProgress - 0.6) / 0.4);

    const totalWeight = ruralWeight + suburbanWeight + urbanWeight;
    const normalizedRural = ruralWeight / totalWeight;
    const normalizedSuburban = suburbanWeight / totalWeight;
    const normalizedUrban = urbanWeight / totalWeight;

    const progressivePolling = new Map();

    candidates.forEach((candidate) => {
      const candidateHash = candidate.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseSeed = stateHash + candidateHash;
      
      // Get final percentage for this candidate
      const finalPercent = finalPolling.get(candidate.id) || 0;
      
      // Create different performance in different precinct types
      let ruralPerformance = finalPercent;
      let suburbanPerformance = finalPercent;
      let urbanPerformance = finalPercent;
      
      // Simulate realistic party/candidate performance by precinct type
      if (candidate.partyName) {
        const partyName = candidate.partyName.toLowerCase();
        
        if (partyName.includes('democrat') || partyName.includes('liberal') || partyName.includes('progressive')) {
          // Democratic candidates typically perform worse in rural, better in urban
          ruralPerformance = finalPercent * (0.6 + seededRandom(baseSeed + 1) * 0.3); // 60-90% of final
          suburbanPerformance = finalPercent * (0.85 + seededRandom(baseSeed + 2) * 0.3); // 85-115% of final  
          urbanPerformance = finalPercent * (1.1 + seededRandom(baseSeed + 3) * 0.3); // 110-140% of final
        } else if (partyName.includes('republican') || partyName.includes('conservative')) {
          // Republican candidates typically perform better in rural, worse in urban
          ruralPerformance = finalPercent * (1.2 + seededRandom(baseSeed + 1) * 0.3); // 120-150% of final
          suburbanPerformance = finalPercent * (0.95 + seededRandom(baseSeed + 2) * 0.3); // 95-125% of final
          urbanPerformance = finalPercent * (0.7 + seededRandom(baseSeed + 3) * 0.3); // 70-100% of final
        } else {
          // Other parties/independents - more random variation
          ruralPerformance = finalPercent * (0.8 + seededRandom(baseSeed + 1) * 0.4); // 80-120% of final
          suburbanPerformance = finalPercent * (0.8 + seededRandom(baseSeed + 2) * 0.4); // 80-120% of final
          urbanPerformance = finalPercent * (0.8 + seededRandom(baseSeed + 3) * 0.4); // 80-120% of final
        }
      }
      
      // Calculate weighted average based on which precincts have reported
      const currentPerformance = 
        (ruralPerformance * normalizedRural) + 
        (suburbanPerformance * normalizedSuburban) + 
        (urbanPerformance * normalizedUrban);
      
      // Add some additional realistic volatility for early returns
      const volatilityFactor = Math.max(0, (0.6 - reportingProgress) / 0.6); // More volatility early on
      const volatility = (seededRandom(baseSeed + 100) - 0.5) * volatilityFactor * 8; // ±4% max volatility
      
      const adjustedPerformance = Math.max(0.5, currentPerformance + volatility);
      progressivePolling.set(candidate.id, adjustedPerformance);
    });

    // Re-normalize to ensure it sums to 100%
    return this.normalizeStatePolling(progressivePolling);
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
   * Distribute total population to states based on population weights
   * @param {number} totalPopulation - Total population to distribute
   * @param {Array} states - Array of state objects
   * @returns {Map} Map of stateId -> population
   */
  distributePopulationToStates(totalPopulation, states) {
    // Get population weights from usaStates data
    const stateWeights = states.map(state => {
      const usaStateData = usaStates.find(s => s.id === state.id);
      return {
        ...state,
        populationWeight: usaStateData?.populationWeight || 1
      };
    });
    
    // Use the same distribution function as campaign mode
    const distributedPopulations = distributeValueProportionally(
      totalPopulation,
      stateWeights
    );
    
    // Create map of stateId -> population
    const populationMap = new Map();
    states.forEach((state, index) => {
      populationMap.set(state.id, distributedPopulations[index] || 10000);
    });
    
    return populationMap;
  }

  /**
   * Fallback calculation when coalition system isn't available
   */
  fallbackElectoralCalculation(candidates, countryData) {
    console.warn("Using fallback electoral college calculation with population distribution");

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
    
    // Distribute population realistically if available
    let statePopulations = new Map();
    if (countryData?.population) {
      statePopulations = this.distributePopulationToStates(countryData.population, states);
    }
    
    states.forEach((state) => {
      // Pass distributed population to state calculation
      const stateWithPopulation = {
        ...state,
        population: statePopulations.get(state.id) || state.population || 100000
      };
      const stateResult = this.fallbackStateCalculation(stateWithPopulation, candidates, 100); // Fallback mode shows final results
      if (stateResult) {
        // Set reporting information for fallback calculation at 100%
        stateResult.stateName = state.name;
        stateResult.reportingPercent = 100;
        stateResult.hasStartedReporting = true;
        stateResult.reportingComplete = true; // Consider complete at realistic maximum
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
   * Fallback state calculation using population-weighted scoring
   */
  fallbackStateCalculation(state, candidates, reportingPercent = null) {
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[state.id] || 0;
    if (electoralVotes === 0) return null;

    const candidateScores = new Map();
    
    // Use population to influence voting patterns
    const statePopulation = state.population || 100000;
    const urbanizationFactor = Math.min(1, statePopulation / 5000000); // More urban states lean differently

    candidates.forEach((candidate) => {
      let score = 30; // Base score

      // Party popularity in state (if available)
      if (candidate.partyId && state.politicalLandscape) {
        const party = state.politicalLandscape.find(
          (p) => p.id === candidate.partyId
        );
        if (party) {
          score += party.popularity * 0.8; // Weight party popularity
        }
      }
      
      // Use candidate attributes if available
      if (candidate.attributes) {
        score += ((candidate.attributes.charisma || 50) - 50) * 0.2;
        score += ((candidate.attributes.integrity || 50) - 50) * 0.15;
      }
      
      // Apply urbanization influence (simplified model)
      if (candidate.ideology) {
        if (candidate.ideology.includes("Progressive") || candidate.ideology.includes("Liberal")) {
          score += urbanizationFactor * 10;
        } else if (candidate.ideology.includes("Conservative")) {
          score += (1 - urbanizationFactor) * 10;
        }
      }
      
      // Add realistic state-level variation (smaller than before)
      const stateVariation = (Math.random() - 0.5) * 15;
      score += stateVariation;
      
      // Use polling if available as a strong indicator
      if (candidate.polling) {
        score = score * 0.3 + candidate.polling * 0.7; // Blend calculated score with polling
      }

      candidateScores.set(candidate.id, Math.max(5, Math.min(95, score)));
    });

    // Normalize and find winner
    let finalScores = this.normalizeStatePolling(candidateScores);
    
    // Apply progressive vote counting if reporting percentage is provided
    let displayScores = finalScores;
    if (reportingPercent !== null && reportingPercent > 0 && reportingPercent < 98) {
      displayScores = this.simulateProgressiveVoteCounting(
        finalScores,
        reportingPercent,
        state.id,
        candidates
      );
    }
    
    let winner = null;
    let highestScore = 0;

    displayScores.forEach((score, candidateId) => {
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
      candidatePolling: displayScores,
      margin: this.calculateMargin(displayScores),
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
  simulationSpeed = 5000,
  statePollingOverrides = null
) {
  return electoralCollegeSystem.calculateElectoralCollege(
    candidates,
    activeCampaign,
    countryData,
    useProgressiveReporting,
    simulationSpeed,
    statePollingOverrides
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
