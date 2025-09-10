// src/simulation/monthlyUpdates/budgetUpdates.js

import { calculateDetailedIncomeSources } from "../../entities/economics/budgetCalculations.js";
import { runStateBudgetUpdate, runNationalBudgetUpdate } from "../../utils/statCalculationEngine.js";

/**
 * Handles all budget-related monthly updates for city, state, and national levels
 */
export class BudgetUpdater {
  /**
   * Update city budget calculations
   * @param {Object} campaign - The current campaign state
   * @returns {Object} - { budgetUpdates: Object|null, newsItems: Array }
   */
  updateCityBudget(campaign) {
    if (!campaign?.startingCity?.stats?.budget) {
      return { budgetUpdates: null, newsItems: [] };
    }

    const city = campaign.startingCity;
    const { stats, population, economicProfile } = city;
    const { budget } = stats;
    const { gdpPerCapita, dominantIndustries } = economicProfile;
    const cityType = stats.type;

    const newIncomeSources = calculateDetailedIncomeSources(
      population,
      gdpPerCapita,
      budget.taxRates,
      cityType,
      dominantIndustries,
      city.cityLaws
    );

    const newTotalAnnualIncome = Math.floor(
      Object.values(newIncomeSources).reduce((sum, val) => sum + val, 0)
    );

    const newTotalAnnualExpenses = Math.floor(
      Object.values(budget.expenseAllocations).reduce((sum, val) => sum + val, 0)
    );

    const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;

    let newAccumulatedDebt = budget.accumulatedDebt || 0;
    if (newBalance < 0) {
      newAccumulatedDebt += Math.abs(newBalance);
    } else if (newBalance > 0 && newAccumulatedDebt > 0) {
      newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
    } else if (newBalance > 0) {
      newAccumulatedDebt -= newBalance;
    }

    const budgetUpdates = {
      totalAnnualIncome: newTotalAnnualIncome,
      totalAnnualExpenses: newTotalAnnualExpenses,
      balance: newBalance,
      accumulatedDebt: newAccumulatedDebt,
      incomeSources: newIncomeSources,
    };

    // Check if there are actual changes
    if (
      newTotalAnnualIncome === budget.totalAnnualIncome &&
      newTotalAnnualExpenses === budget.totalAnnualExpenses &&
      newBalance === budget.balance &&
      newAccumulatedDebt === budget.accumulatedDebt
    ) {
      return { budgetUpdates: null, newsItems: [] };
    }

    return { budgetUpdates, newsItems: [] };
  }

  /**
   * Update regional (state) and national budgets
   * @param {Object} campaign - The current campaign state
   * @returns {Object} - { updatedRegions: Object, updatedCountry: Object|null, newsItems: Array }
   */
  updateRegionalBudgets(campaign) {
    const results = {
      updatedRegions: {},
      updatedCountry: null,
      newsItems: [],
    };

    // Update state/region budget
    if (campaign?.regions && campaign?.startingCity?.regionId) {
      const currentRegion = campaign.regions.find(
        (r) => r.id === campaign.startingCity.regionId
      );
      
      if (currentRegion?.stats?.budget) {
        const oldStateBudget = { ...currentRegion.stats.budget };
        const newStateBudget = runStateBudgetUpdate(
          currentRegion,
          campaign.country?.stats?.budget
        );

        // Check for significant changes (0.5% threshold)
        if (this._hasSignificantBudgetChange(newStateBudget, oldStateBudget)) {
          results.updatedRegions[currentRegion.id] = {
            ...currentRegion,
            stats: {
              ...currentRegion.stats,
              budget: newStateBudget,
            },
          };

          // Generate news for significant budget changes
          results.newsItems.push(...this._generateStateBudgetNews(newStateBudget, oldStateBudget));
        }
      }
    }

    // Update national budget
    if (campaign?.country?.stats?.budget && campaign?.regions) {
      const oldNationalBudget = { ...campaign.country.stats.budget };
      const newNationalBudget = runNationalBudgetUpdate(
        campaign.country,
        campaign.regions
      );

      // Check for significant changes (0.3% threshold for national)
      if (this._hasSignificantNationalBudgetChange(newNationalBudget, oldNationalBudget)) {
        results.updatedCountry = {
          ...campaign.country,
          stats: {
            ...campaign.country.stats,
            budget: newNationalBudget,
          },
        };

        // Generate news for significant national budget changes
        results.newsItems.push(...this._generateNationalBudgetNews(newNationalBudget, oldNationalBudget));
      }
    }

    return results;
  }

  /**
   * Check if budget changes are significant enough to warrant updates
   */
  _hasSignificantBudgetChange(newBudget, oldBudget) {
    if (!newBudget) return false;
    
    return (
      Math.abs(newBudget.totalAnnualIncome - oldBudget.totalAnnualIncome) >
        oldBudget.totalAnnualIncome * 0.005 ||
      Math.abs(newBudget.totalAnnualExpenses - oldBudget.totalAnnualExpenses) >
        oldBudget.totalAnnualExpenses * 0.005 ||
      Math.abs(newBudget.balance - oldBudget.balance) >
        Math.abs(oldBudget.balance) * 0.05
    );
  }

  _hasSignificantNationalBudgetChange(newBudget, oldBudget) {
    if (!newBudget) return false;
    
    return (
      Math.abs(newBudget.totalAnnualIncome - oldBudget.totalAnnualIncome) >
        oldBudget.totalAnnualIncome * 0.003 ||
      Math.abs(newBudget.totalAnnualExpenses - oldBudget.totalAnnualExpenses) >
        oldBudget.totalAnnualExpenses * 0.003 ||
      Math.abs(newBudget.balance - oldBudget.balance) >
        Math.abs(oldBudget.balance) * 0.02
    );
  }

  _generateStateBudgetNews(newBudget, oldBudget) {
    const newsItems = [];

    if (newBudget.balance < 0 && oldBudget.balance >= 0) {
      newsItems.push({
        headline: `State Budget Shows Deficit`,
        summary: `The state budget has moved into deficit territory with expenses exceeding income.`,
        type: "budget_deficit",
        scope: "regional",
        impact: "negative",
      });
    } else if (newBudget.balance >= 0 && oldBudget.balance < 0) {
      newsItems.push({
        headline: `State Budget Returns to Surplus`,
        summary: `The state has successfully balanced its budget, moving from deficit to surplus.`,
        type: "budget_surplus",
        scope: "regional",
        impact: "positive",
      });
    }

    return newsItems;
  }

  _generateNationalBudgetNews(newBudget, oldBudget) {
    const newsItems = [];

    if (newBudget.balance < 0 && oldBudget.balance >= 0) {
      newsItems.push({
        headline: `National Budget Enters Deficit`,
        summary: `Federal spending has exceeded revenue, creating a national budget deficit.`,
        type: "budget_deficit",
        scope: "national",
        impact: "negative",
      });
    } else if (newBudget.balance >= 0 && oldBudget.balance < 0) {
      newsItems.push({
        headline: `National Budget Achieves Surplus`,
        summary: `The federal government has balanced its budget, achieving a rare budget surplus.`,
        type: "budget_surplus",
        scope: "national",
        impact: "positive",
      });
    }

    // News for significant debt changes
    const debtChange = newBudget.accumulatedDebt - oldBudget.accumulatedDebt;
    if (Math.abs(debtChange) > oldBudget.totalAnnualIncome * 0.1) {
      if (debtChange > 0) {
        newsItems.push({
          headline: `National Debt Continues to Rise`,
          summary: `The national debt has increased significantly this month due to budget shortfalls.`,
          type: "debt_increase",
          scope: "national",
          impact: "negative",
        });
      } else {
        newsItems.push({
          headline: `National Debt Reduction Efforts Show Progress`,
          summary: `The government has made progress in reducing the national debt this month.`,
          type: "debt_reduction",
          scope: "national",
          impact: "positive",
        });
      }
    }

    return newsItems;
  }
}