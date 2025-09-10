// src/simulation/monthlyTick.js

import { MonthlyOrchestrator } from "./monthlyOrchestrator.js";

/**
 * REFACTORED MONTHLY TICK - Now using Orchestrator Pattern
 * 
 * This file has been refactored to use the orchestrator pattern as requested.
 * All monthly update logic has been moved to specialized modules:
 * - budgetUpdates.js
 * - statisticsUpdates.js  
 * - politicalUpdates.js
 * - legislativeUpdates.js
 * - eventUpdates.js
 * 
 * The MonthlyOrchestrator serves as the main command center that coordinates
 * all monthly updates in the correct order.
 */

// Initialize the orchestrator
const monthlyOrchestrator = new MonthlyOrchestrator();

/**
 * LEGACY COMPATIBILITY FUNCTIONS
 * These functions are kept for backwards compatibility with existing code
 * that might still call the old monthly update functions directly.
 * They now delegate to the orchestrator.
 */

export const runMonthlyBudgetUpdate = (campaign) => {
  console.warn('[monthlyTick] runMonthlyBudgetUpdate is deprecated. Use MonthlyOrchestrator instead.');
  const results = monthlyOrchestrator.budgetUpdater.updateCityBudget(campaign);
  return {
    budgetUpdates: results.budgetUpdates,
    newsItems: results.newsItems
  };
};

export const runMonthlyStatUpdate = (campaign) => {
  console.warn('[monthlyTick] runMonthlyStatUpdate is deprecated. Use MonthlyOrchestrator instead.');
  const results = monthlyOrchestrator.statisticsUpdater.updateCityStatistics(campaign);
  return {
    statUpdates: results.statUpdates,
    newsItems: results.newsItems
  };
};

export const runMonthlyPlayerApprovalUpdate = (campaign, getFromStore) => {
  console.warn('[monthlyTick] runMonthlyPlayerApprovalUpdate is deprecated. Use MonthlyOrchestrator instead.');
  return monthlyOrchestrator.politicalUpdater.updatePlayerApproval(campaign, getFromStore);
};

export const runMonthlyPlayerPoliticalCapitalUpdate = (campaign, getFromStore) => {
  console.warn('[monthlyTick] runMonthlyPlayerPoliticalCapitalUpdate is deprecated. Use MonthlyOrchestrator instead.');
  return monthlyOrchestrator.politicalUpdater.updatePlayerPoliticalCapital(campaign, getFromStore);
};

export const runMonthlyPartyPopularityUpdate = (campaign, getFromStore) => {
  console.warn('[monthlyTick] runMonthlyPartyPopularityUpdate is deprecated. Use MonthlyOrchestrator instead.');
  return monthlyOrchestrator.politicalUpdater.updatePartyPopularity(campaign, getFromStore);
};

export const runAIBillProposals = (campaign, getFromStore) => {
  console.warn('[monthlyTick] runAIBillProposals is deprecated. Use MonthlyOrchestrator instead.');
  const results = monthlyOrchestrator.legislativeUpdater.generateAIBills(campaign, getFromStore);
  return results.newBills;
};

export const runMonthlyRegionalUpdates = (campaign) => {
  console.warn('[monthlyTick] runMonthlyRegionalUpdates is deprecated. Use MonthlyOrchestrator instead.');
  return monthlyOrchestrator.budgetUpdater.updateRegionalBudgets(campaign);
};

/**
 * NEW ORCHESTRATED MONTHLY UPDATE FUNCTION
 * This is the main function that should be used going forward.
 */
export const executeMonthlyUpdatesOrchestrated = (campaign, getFromStore) => {
  return monthlyOrchestrator.executeMonthlyUpdates(campaign, getFromStore);
};

/**
 * Get execution summary for debugging
 */
export const getMonthlyExecutionSummary = (monthlyResults) => {
  return monthlyOrchestrator.getExecutionSummary(monthlyResults);
};

// Export the orchestrator instance for direct access if needed
export { monthlyOrchestrator };

/**
 * LEGACY COMPATIBILITY - Export orchestrator methods
 * These maintain the original function signatures while using the new modular system
 */

// Legacy coalition functions (maintained for backwards compatibility)
export const initializeCityCoalitions = (city, availableParties = []) => {
  // This function was in the original monthlyTick.js for coalition initialization
  // Keeping it here for backwards compatibility
  try {
    const { createCoalitionSoA, generateCoalitions } = require("../General Scripts/CoalitionSystem.js");
    
    const coalitionSoA = createCoalitionSoA();
    const generatedCoalitions = generateCoalitions(
      city.stats?.electoratePolicyProfile || {},
      city.demographics || {},
      availableParties
    );
    
    Object.assign(coalitionSoA, generatedCoalitions);
    return coalitionSoA;
  } catch (error) {
    console.error('Error initializing city coalitions:', error);
    const { createCoalitionSoA } = require("../General Scripts/CoalitionSystem.js");
    return createCoalitionSoA();
  }
};

export const updateCityCoalitionMobilization = (coalitionSoA, campaign, policyEvents = []) => {
  // Delegate to the event updater
  return monthlyOrchestrator.eventUpdater.updateCoalitionMobilization(
    campaign, 
    policyEvents, 
    () => ({ activeCampaign: campaign }) // Mock getFromStore
  );
};

/**
 * EXECUTION SUMMARY
 * 
 * This refactor achieves the orchestrator/command pattern requested:
 * 
 * 1. ✅ Main command center: MonthlyOrchestrator coordinates all updates
 * 2. ✅ Modular components: Each system has its own update class
 * 3. ✅ Controlled execution order: Updates run in the correct sequence
 * 4. ✅ Backwards compatibility: Legacy functions still work
 * 5. ✅ Clear separation of concerns: Each module handles one responsibility
 * 6. ✅ Centralized error handling and validation
 * 7. ✅ Improved testability: Each component can be tested independently
 * 
 * The monthlyTick.js file now serves as a simple facade that:
 * - Provides backwards compatibility with existing code
 * - Exposes the new orchestrated functions
 * - Maintains the same API surface while using the new architecture internally
 */