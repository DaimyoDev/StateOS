// src/stores/timeOrchestrator.js

import { MonthlyOrchestrator } from "../simulation/monthlyOrchestrator.js";

/**
 * Time Management Orchestrator - Coordinates time-based state updates
 * 
 * This class serves as the command center for all time-related operations,
 * managing the execution of monthly updates and state synchronization.
 * It implements the orchestrator pattern requested by the user.
 */
export class TimeOrchestrator {
  constructor() {
    this.monthlyOrchestrator = new MonthlyOrchestrator();
  }

  /**
   * Execute monthly tick and coordinate all state updates
   * @param {Object} currentState - Current store state
   * @param {Function} getFromStore - Store accessor function
   * @param {Function} updateState - State update function
   * @returns {Object} - Update results and execution summary
   */
  executeMonthlyTick(currentState, getFromStore, updateState) {
    const executionLog = {
      startTime: Date.now(),
      phase: 'initialization',
      errors: [],
      updates: []
    };

    try {
      // Phase 1: Validate current state
      executionLog.phase = 'validation';
      const validationResult = this._validateCurrentState(currentState);
      if (!validationResult.isValid) {
        throw new Error(`State validation failed: ${validationResult.reason}`);
      }

      // Phase 2: Execute monthly simulation updates
      executionLog.phase = 'simulation';
      const monthlyResults = this.monthlyOrchestrator.executeMonthlyUpdates(
        currentState.activeCampaign,
        getFromStore
      );

      // Phase 3: Apply state updates
      executionLog.phase = 'state_updates';
      const stateUpdates = this._prepareStateUpdates(monthlyResults, currentState);
      
      // Apply updates using the provided update function
      updateState(stateUpdates);
      
      executionLog.updates = Object.keys(stateUpdates);

      // Phase 4: Post-update validation
      executionLog.phase = 'post_validation';
      this._validateUpdatedState(stateUpdates);

      // Phase 5: Generate execution summary
      executionLog.phase = 'summary';
      const summary = this._generateExecutionSummary(monthlyResults, executionLog);

      return {
        success: true,
        monthlyResults,
        stateUpdates,
        executionLog,
        summary
      };

    } catch (error) {
      console.error(`[TimeOrchestrator] Error in ${executionLog.phase}:`, error);
      executionLog.errors.push({
        phase: executionLog.phase,
        error: error.message,
        timestamp: Date.now()
      });

      return {
        success: false,
        error: error.message,
        executionLog,
        monthlyResults: null,
        stateUpdates: {}
      };
    } finally {
      executionLog.endTime = Date.now();
      executionLog.duration = executionLog.endTime - executionLog.startTime;
    }
  }

  /**
   * Validate the current state before processing
   */
  _validateCurrentState(state) {
    if (!state.activeCampaign) {
      return { isValid: false, reason: 'No campaign data' };
    }

    if (!state.activeCampaign.startingCity) {
      return { isValid: false, reason: 'No starting city data' };
    }

    if (!state.activeCampaign.currentDate) {
      return { isValid: false, reason: 'No current date' };
    }

    return { isValid: true, reason: null };
  }

  /**
   * Prepare state updates from monthly results
   */
  _prepareStateUpdates(monthlyResults, currentState) {
    const updates = {};

    // Update campaign state
    if (monthlyResults.statUpdates) {
      updates['activeCampaign.startingCity.stats'] = {
        ...currentState.activeCampaign.startingCity.stats,
        ...monthlyResults.statUpdates
      };
    }

    // Update budget data
    if (monthlyResults.budgetUpdates) {
      updates['activeCampaign.startingCity.stats.budget'] = {
        ...currentState.activeCampaign.startingCity.stats.budget,
        ...monthlyResults.budgetUpdates
      };
    }

    // Update regional data
    if (Object.keys(monthlyResults.updatedRegions).length > 0) {
      updates['activeCampaign.regions'] = this._updateRegionsArray(
        currentState.activeCampaign.regions,
        monthlyResults.updatedRegions
      );
    }

    // Update country data
    if (monthlyResults.updatedCountry) {
      updates['activeCampaign.country'] = monthlyResults.updatedCountry;
    }

    // Update political data
    if (monthlyResults.politicalUpdates.approvalRating !== null) {
      updates.playerApprovalUpdate = monthlyResults.politicalUpdates.approvalRating;
    }

    if (monthlyResults.politicalUpdates.politicalCapital !== null) {
      updates.playerPoliticalCapitalUpdate = monthlyResults.politicalUpdates.politicalCapital;
    }

    if (monthlyResults.politicalUpdates.partyPopularity.cityPoliticalLandscape) {
      updates['activeCampaign.startingCity.politicalLandscape'] = 
        monthlyResults.politicalUpdates.partyPopularity.cityPoliticalLandscape;
    }

    if (monthlyResults.politicalUpdates.partyPopularity.statePoliticalLandscape) {
      updates['activeCampaign.parentState.politicalLandscape'] = 
        monthlyResults.politicalUpdates.partyPopularity.statePoliticalLandscape;
    }

    // Update legislative data
    if (monthlyResults.newBills.length > 0) {
      updates.newBills = monthlyResults.newBills;
    }

    if (monthlyResults.billUpdates.length > 0) {
      updates.billStatusUpdates = monthlyResults.billUpdates;
    }

    // Update events and coalitions
    if (monthlyResults.events.length > 0) {
      updates.monthlyEvents = monthlyResults.events;
    }

    if (monthlyResults.coalitionUpdates) {
      updates['activeCampaign.startingCity.coalitions'] = monthlyResults.coalitionUpdates;
    }

    if (monthlyResults.campaignUpdates) {
      updates.campaignEventUpdates = monthlyResults.campaignUpdates;
    }

    // Update news
    if (monthlyResults.newsItems.length > 0) {
      updates.monthlyNews = monthlyResults.newsItems;
    }

    return updates;
  }

  /**
   * Update regions array with new regional data
   */
  _updateRegionsArray(currentRegions, updatedRegions) {
    if (!currentRegions) return [];

    return currentRegions.map(region => {
      if (updatedRegions[region.id]) {
        return updatedRegions[region.id];
      }
      return region;
    });
  }

  /**
   * Validate the updated state
   */
  _validateUpdatedState(stateUpdates) {
    // Check for invalid numerical values
    Object.entries(stateUpdates).forEach(([key, value]) => {
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        console.warn(`[TimeOrchestrator] Invalid numerical value detected for ${key}: ${value}`);
      }
    });

    // Validate specific update types
    if (stateUpdates.playerApprovalUpdate !== undefined) {
      const approval = stateUpdates.playerApprovalUpdate;
      if (approval < 0 || approval > 100) {
        console.warn(`[TimeOrchestrator] Approval rating out of bounds: ${approval}`);
      }
    }

    if (stateUpdates.playerPoliticalCapitalUpdate?.newPoliticalCapital !== undefined) {
      const pc = stateUpdates.playerPoliticalCapitalUpdate.newPoliticalCapital;
      if (pc < 0) {
        console.warn(`[TimeOrchestrator] Negative political capital: ${pc}`);
      }
    }
  }

  /**
   * Generate execution summary
   */
  _generateExecutionSummary(monthlyResults, executionLog) {
    const orchestratorSummary = this.monthlyOrchestrator.getExecutionSummary(monthlyResults);
    
    return {
      orchestrator: orchestratorSummary,
      execution: {
        duration: executionLog.duration,
        phases: executionLog.phase,
        errors: executionLog.errors.length,
        updatesApplied: executionLog.updates.length
      },
      results: {
        newsGenerated: monthlyResults.newsItems.length,
        eventsProcessed: monthlyResults.events.length,
        billsGenerated: monthlyResults.newBills.length,
        hasStateChanges: Object.keys(monthlyResults).some(key => 
          monthlyResults[key] !== null && 
          (Array.isArray(monthlyResults[key]) ? monthlyResults[key].length > 0 : true)
        )
      }
    };
  }

  /**
   * Get detailed execution report for debugging
   */
  getExecutionReport(results) {
    if (!results.success) {
      return {
        status: 'failed',
        error: results.error,
        executionLog: results.executionLog
      };
    }

    return {
      status: 'success',
      summary: results.summary,
      monthlyResults: results.monthlyResults,
      stateUpdates: Object.keys(results.stateUpdates),
      executionTime: results.executionLog.duration
    };
  }
}