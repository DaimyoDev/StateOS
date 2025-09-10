// src/simulation/monthlyOrchestrator.js

import { BudgetUpdater } from "./monthlyUpdates/budgetUpdates.js";
import { StatisticsUpdater } from "./monthlyUpdates/statisticsUpdates.js";
import { PoliticalUpdater } from "./monthlyUpdates/politicalUpdates.js";
import { LegislativeUpdater } from "./monthlyUpdates/legislativeUpdates.js";
import { EventUpdater } from "./monthlyUpdates/eventUpdates.js";

/**
 * Monthly Orchestrator - Main command center for coordinating all monthly updates
 * 
 * This class implements the orchestrator/command pattern to manage the execution
 * order and coordination of all monthly simulation updates. It serves as the 
 * central coordination point that the user requested.
 */
export class MonthlyOrchestrator {
  constructor() {
    // Initialize all update modules
    this.budgetUpdater = new BudgetUpdater();
    this.statisticsUpdater = new StatisticsUpdater();
    this.politicalUpdater = new PoliticalUpdater();
    this.legislativeUpdater = new LegislativeUpdater();
    this.eventUpdater = new EventUpdater();
  }

  /**
   * Execute all monthly updates in the correct order
   * @param {Object} campaign - The current campaign state
   * @param {Function} getFromStore - Store accessor function
   * @returns {Object} - Consolidated results from all updates
   */
  executeMonthlyUpdates(campaign, getFromStore) {
    const results = {
      // Core system updates
      budgetUpdates: null,
      statUpdates: null,
      politicalUpdates: {
        approvalRating: null,
        politicalCapital: null,
        partyPopularity: null
      },
      
      // Legislative and event updates
      newBills: [],
      billUpdates: [],
      events: [],
      coalitionUpdates: null,
      performanceMetrics: null,
      campaignUpdates: null,
      
      // Regional updates
      updatedRegions: {},
      updatedCountry: null,
      
      // News and communication
      newsItems: [],
      
      // Execution metadata
      executionOrder: [],
      errors: []
    };

    try {
      // Phase 1: Core Statistics Updates
      // These need to run first as other systems depend on updated stats
      results.executionOrder.push("statistics_update");
      try {
        const statsResults = this.statisticsUpdater.updateCityStatistics(campaign);
        results.statUpdates = statsResults.statUpdates;
        results.newsItems.push(...statsResults.newsItems);
      } catch (statsError) {
        console.error('Error in statistics update:', statsError);
        results.errors.push({
          phase: 'statistics_update',
          error: statsError.message,
          timestamp: new Date().toISOString()
        });
        // Continue with default/empty stats to prevent complete failure
        results.statUpdates = {};
      }

      // Phase 2: Budget Updates  
      // Run after stats are updated since budget calculations may depend on current stats
      results.executionOrder.push("budget_update");
      const budgetResults = this.budgetUpdater.updateCityBudget(campaign);
      results.budgetUpdates = budgetResults.budgetUpdates;
      results.newsItems.push(...budgetResults.newsItems);

      // Regional budget updates
      results.executionOrder.push("regional_budget_update");
      const regionalBudgetResults = this.budgetUpdater.updateRegionalBudgets(campaign);
      results.updatedRegions = regionalBudgetResults.updatedRegions;
      results.updatedCountry = regionalBudgetResults.updatedCountry;
      results.newsItems.push(...regionalBudgetResults.newsItems);

      // Phase 3: Political Updates
      // Run after stats and budget updates since political calculations depend on current state
      results.executionOrder.push("political_update");
      const politicalResults = this.politicalUpdater.updatePlayerApproval(campaign, getFromStore);
      if (politicalResults !== null) {
        results.politicalUpdates.approvalRating = politicalResults;
      }

      const politicalCapitalResults = this.politicalUpdater.updatePlayerPoliticalCapital(campaign, getFromStore);
      if (politicalCapitalResults !== null) {
        results.politicalUpdates.politicalCapital = politicalCapitalResults;
      }

      const partyPopularityResults = this.politicalUpdater.updatePartyPopularity(campaign, getFromStore);
      results.politicalUpdates.partyPopularity = {
        cityPoliticalLandscape: partyPopularityResults.cityPoliticalLandscape,
        statePoliticalLandscape: partyPopularityResults.statePoliticalLandscape
      };
      results.newsItems.push(...partyPopularityResults.newsItems);

      // Phase 4: Legislative Updates
      // Generate new bills and process existing ones
      results.executionOrder.push("legislative_update");
      const billGenerationResults = this.legislativeUpdater.generateAIBills(campaign, getFromStore);
      results.newBills = billGenerationResults.newBills;
      results.newsItems.push(...billGenerationResults.newsItems);

      const billLifecycleResults = this.legislativeUpdater.processBillLifecycle(campaign, getFromStore);
      results.billUpdates = billLifecycleResults.billUpdates;
      results.newsItems.push(...billLifecycleResults.newsItems);

      // Phase 5: Event Processing
      // Process random events and their cascading effects
      results.executionOrder.push("event_update");
      const eventResults = this.eventUpdater.processRandomEvents(campaign, getFromStore);
      results.events = eventResults.events;
      results.newsItems.push(...eventResults.newsItems);
      
      if (eventResults.coalitionUpdates) {
        results.coalitionUpdates = eventResults.coalitionUpdates;
      }
      if (eventResults.performanceMetrics) {
        results.performanceMetrics = eventResults.performanceMetrics;
      }
      if (eventResults.campaignUpdates) {
        results.campaignUpdates = eventResults.campaignUpdates;
      }

      // Phase 6: Coalition Mobilization Updates
      // Process coalition effects from policy changes
      results.executionOrder.push("coalition_update");
      const coalitionResults = this.eventUpdater.updateCoalitionMobilization(
        campaign, 
        [], // TODO: Collect policy events from previous phases
        getFromStore
      );
      
      if (coalitionResults.coalitionUpdates && !results.coalitionUpdates) {
        results.coalitionUpdates = coalitionResults.coalitionUpdates;
      }
      if (coalitionResults.performanceMetrics && !results.performanceMetrics) {
        results.performanceMetrics = coalitionResults.performanceMetrics;
      }

      // Phase 7: Scheduled Events
      // Process scheduled events like elections, budget deadlines
      results.executionOrder.push("scheduled_events");
      const scheduledResults = this.eventUpdater.processScheduledEvents(campaign, getFromStore);
      results.newsItems.push(...scheduledResults.newsItems);

    } catch (error) {
      console.error('Error in monthly orchestrator:', error);
      results.errors.push({
        phase: results.executionOrder[results.executionOrder.length - 1] || 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Final cleanup and validation
    this._validateResults(results);
    this._deduplicateNews(results);

    return results;
  }

  /**
   * Validate the consolidated results
   */
  _validateResults(results) {
    // Ensure news items have required fields
    results.newsItems = results.newsItems.filter(item => 
      item && item.headline && item.summary
    );

    // Ensure all numeric values are valid
    if (results.politicalUpdates.approvalRating !== null) {
      const approval = results.politicalUpdates.approvalRating;
      if (isNaN(approval) || !isFinite(approval)) {
        console.warn('[MonthlyOrchestrator] Invalid approval rating detected, removing');
        results.politicalUpdates.approvalRating = null;
      }
    }

    if (results.politicalUpdates.politicalCapital?.newPoliticalCapital !== undefined) {
      const pc = results.politicalUpdates.politicalCapital.newPoliticalCapital;
      if (isNaN(pc) || !isFinite(pc)) {
        console.warn('[MonthlyOrchestrator] Invalid political capital detected, removing');
        results.politicalUpdates.politicalCapital = null;
      }
    }
  }

  /**
   * Remove duplicate news items
   */
  _deduplicateNews(results) {
    const seen = new Set();
    results.newsItems = results.newsItems.filter(item => {
      const key = `${item.headline}-${item.type}-${item.scope}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get execution summary for debugging
   */
  getExecutionSummary(results) {
    return {
      phasesExecuted: results.executionOrder.length,
      totalNewsItems: results.newsItems.length,
      hasErrors: results.errors.length > 0,
      errorCount: results.errors.length,
      updatesApplied: {
        stats: results.statUpdates !== null,
        budget: results.budgetUpdates !== null,
        approval: results.politicalUpdates.approvalRating !== null,
        politicalCapital: results.politicalUpdates.politicalCapital !== null,
        partyPopularity: results.politicalUpdates.partyPopularity.cityPoliticalLandscape !== null,
        newBills: results.newBills.length,
        events: results.events.length,
        coalitions: results.coalitionUpdates !== null
      }
    };
  }
}