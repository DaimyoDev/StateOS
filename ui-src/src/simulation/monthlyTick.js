// src/simulation/monthlyTick.js
import {
  getRandomInt,
  adjustStatLevel,
  getRandomElement,
} from "../utils/core.js";
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../data/governmentData";
import { calculateDetailedIncomeSources } from "../entities/politicalEntities.js";
import { calculateAllCityStats } from "../utils/statCalculationCore.js";
import {
  runStateBudgetUpdate,
  runNationalBudgetUpdate,
} from "../utils/regionalStatCalc.js";
import { normalizePartyPopularities } from "../utils/electionUtils.js";
import { strategicAIBillProposal } from "./aiStrategicProposal.js";
import { generateNewsForEvent } from "./newsGenerator.js";
import { 
  generateAndProcessCityEvent, 
  shouldGenerateRandomEvent 
} from "./randomEventsSystem.js";
import { 
  generateCoalitions,
  createCoalitionSoA,
  processCascadingCoalitionUpdates
} from "../General Scripts/CoalitionSystem.js";

/**
 * Derives a qualitative rating (e.g., "Good", "Poor") from a numerical stat.
 * @param {number} value - The numerical value of the stat.
 * @param {Array<number>} thresholds - An array of thresholds, from best to worst.
 * @param {Array<string>} labels - The RATING_LEVELS labels.
 * @returns {string} The qualitative rating.
 */
const deriveRatingFromValue = (value, thresholds, labels) => {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return labels[labels.length - 1 - i];
    }
  }
  return labels[0]; // Return the worst rating if value exceeds all thresholds
};

/**
 * Recalculates budget figures for state/region and national levels.
 * @param {object} campaign - The current activeCampaign object.
 * @returns {object} { updatedRegions: object, updatedCountry: object | null, newsItems: Array }
 */
export const runMonthlyRegionalUpdates = (campaign) => {
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

      // Check if there were significant changes
      if (
        newStateBudget &&
        (Math.abs(
          newStateBudget.totalAnnualIncome - oldStateBudget.totalAnnualIncome
        ) >
          oldStateBudget.totalAnnualIncome * 0.005 ||
          Math.abs(
            newStateBudget.totalAnnualExpenses -
              oldStateBudget.totalAnnualExpenses
          ) >
            oldStateBudget.totalAnnualExpenses * 0.005 ||
          Math.abs(newStateBudget.balance - oldStateBudget.balance) >
            Math.abs(oldStateBudget.balance) * 0.05)
      ) {
        // Update the region with new budget
        results.updatedRegions[currentRegion.id] = {
          ...currentRegion,
          stats: {
            ...currentRegion.stats,
            budget: newStateBudget,
          },
        };

        // Generate news for significant budget changes
        if (newStateBudget.balance < 0 && oldStateBudget.balance >= 0) {
          results.newsItems.push({
            headline: `State Budget Shows Deficit`,
            summary: `The state budget has moved into deficit territory with expenses exceeding income.`,
            type: "budget_deficit",
            scope: "regional",
            impact: "negative",
          });
        } else if (newStateBudget.balance >= 0 && oldStateBudget.balance < 0) {
          results.newsItems.push({
            headline: `State Budget Returns to Surplus`,
            summary: `The state has successfully balanced its budget, moving from deficit to surplus.`,
            type: "budget_surplus",
            scope: "regional",
            impact: "positive",
          });
        }
      }
    }
  }

  if (campaign?.country?.stats?.budget && campaign?.regions) {
    const oldNationalBudget = { ...campaign.country.stats.budget };
    const newNationalBudget = runNationalBudgetUpdate(
      campaign.country,
      campaign.regions
    );

    // Check if there were significant changes
    if (
      newNationalBudget &&
      (Math.abs(
        newNationalBudget.totalAnnualIncome -
          oldNationalBudget.totalAnnualIncome
      ) >
        oldNationalBudget.totalAnnualIncome * 0.003 ||
        Math.abs(
          newNationalBudget.totalAnnualExpenses -
            oldNationalBudget.totalAnnualExpenses
        ) >
          oldNationalBudget.totalAnnualExpenses * 0.003 ||
        Math.abs(newNationalBudget.balance - oldNationalBudget.balance) >
          Math.abs(oldNationalBudget.balance) * 0.02)
    ) {
      // Update the country with new budget
      results.updatedCountry = {
        ...campaign.country,
        stats: {
          ...campaign.country.stats,
          budget: newNationalBudget,
        },
      };

      // Generate news for significant national budget changes
      if (newNationalBudget.balance < 0 && oldNationalBudget.balance >= 0) {
        results.newsItems.push({
          headline: `National Budget Enters Deficit`,
          summary: `Federal spending has exceeded revenue, creating a national budget deficit.`,
          type: "budget_deficit",
          scope: "national",
          impact: "negative",
        });
      } else if (
        newNationalBudget.balance >= 0 &&
        oldNationalBudget.balance < 0
      ) {
        results.newsItems.push({
          headline: `National Budget Achieves Surplus`,
          summary: `The federal government has balanced its budget, achieving a rare budget surplus.`,
          type: "budget_surplus",
          scope: "national",
          impact: "positive",
        });
      }

      // News for significant debt changes
      const debtChange =
        newNationalBudget.accumulatedDebt - oldNationalBudget.accumulatedDebt;
      if (Math.abs(debtChange) > oldNationalBudget.totalAnnualIncome * 0.1) {
        if (debtChange > 0) {
          results.newsItems.push({
            headline: `National Debt Continues to Rise`,
            summary: `The national debt has increased significantly this month due to budget shortfalls.`,
            type: "debt_increase",
            scope: "national",
            impact: "negative",
          });
        } else {
          results.newsItems.push({
            headline: `National Debt Reduction Efforts Show Progress`,
            summary: `The government has made progress in reducing the national debt this month.`,
            type: "debt_reduction",
            scope: "national",
            impact: "positive",
          });
        }
      }
    }
  }

  return results;
};

export const runMonthlyBudgetUpdate = (campaign) => {
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

  // --- FIX: Recalculate total expenses from the sum of individual allocations ---
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
    totalAnnualExpenses: newTotalAnnualExpenses, // Now includes the updated total
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: newIncomeSources,
  };

  if (
    newTotalAnnualIncome === budget.totalAnnualIncome &&
    newTotalAnnualExpenses === budget.totalAnnualExpenses &&
    newBalance === budget.balance &&
    newAccumulatedDebt === budget.accumulatedDebt
  ) {
    return { budgetUpdates: null, newsItems: [] };
  }
  return { budgetUpdates, newsItems: [] };
};

/**
 * Simulates dynamic city stat changes for the month.
 * @param {object} campaign - The current activeCampaign object.
 * @returns {object} { statUpdates: object, newsItems: Array }
 */
export const runMonthlyStatUpdate = (campaign) => {
  const statUpdates = {};
  let newsItems = []; // Changed to let
  const city = campaign.startingCity;
  const allOutlets = campaign.newsOutlets || [];

  if (!city?.stats) {
    return { statUpdates, newsItems };
  }

  const oldStats = { ...city.stats };
  const calculatedStats = calculateAllCityStats(city);
  Object.assign(statUpdates, calculatedStats);
  const newStats = { ...oldStats, ...statUpdates };

  // Check for significant unemployment change
  // Ensure unemployment rates are valid numbers before comparison
  const oldUnemployment = parseFloat(oldStats.unemploymentRate) || 6.0;
  const newUnemployment = parseFloat(newStats.unemploymentRate) || 6.0;
  
  // Fix any NaN unemployment values
  if (isNaN(newStats.unemploymentRate) || !isFinite(newStats.unemploymentRate)) {
    console.warn(`[monthlyTick] Fixed NaN unemployment rate, resetting to ${oldUnemployment}`);
    newStats.unemploymentRate = oldUnemployment;
    statUpdates.unemploymentRate = oldUnemployment;
  }
  
  if (Math.abs(newUnemployment - oldUnemployment) > 0.5) {
    const event = {
      type: "economic_update",
      context: {
        stat: "unemployment rate",
        oldValue: oldUnemployment.toFixed(1),
        newValue: newUnemployment.toFixed(1),
        direction:
          newUnemployment < oldUnemployment
            ? "positive"
            : "negative",
      },
    };
    // Generate a story from a random outlet
    if (allOutlets.length > 0) {
      const reportingOutlet = getRandomElement(allOutlets);
      const cityName = campaign.startingCity?.name || null;
      newsItems.push(
        generateNewsForEvent(event, reportingOutlet, campaign.currentDate, [], cityName)
      );
    }
  }

  // --- STEP 2: Use new stats to influence qualitative ratings and mood ---
  // ... (economic outlook and citizen mood logic remains the same) ...
  const cityStatsWithUpdates = { ...city.stats, ...statUpdates };

  // Economic Outlook is influenced by unemployment.
  let econChange = 0;
  if (cityStatsWithUpdates.unemploymentRate < 4.0) econChange++;
  if (cityStatsWithUpdates.unemploymentRate > 8.0) econChange--;
  if (econChange !== 0) {
    const newEconOutlook = adjustStatLevel(
      city.stats.economicOutlook,
      ECONOMIC_OUTLOOK_LEVELS,
      econChange
    );
    if (newEconOutlook !== city.stats.economicOutlook) {
      statUpdates.economicOutlook = newEconOutlook;
    }
  }

  // Citizen Mood is a reflection of the city's health.
  let moodChange = 0;
  const currentEconOutlook =
    statUpdates.economicOutlook || city.stats.economicOutlook;
  if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) >= 3) moodChange++; // Moderate Growth or Booming
  if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) <= 1) moodChange--; // Stagnant or Recession
  if (cityStatsWithUpdates.crimeRatePer1000 < 25) moodChange++;
  if (cityStatsWithUpdates.crimeRatePer1000 > 60) moodChange--;
  if (cityStatsWithUpdates.povertyRate < 10) moodChange++;
  if (cityStatsWithUpdates.povertyRate > 25) moodChange--;
  if (cityStatsWithUpdates.healthcareCoverage > 90) moodChange++;

  if (moodChange !== 0) {
    const oldMood = city.stats.overallCitizenMood;
    const newMood = adjustStatLevel(oldMood, MOOD_LEVELS, moodChange);
    if (newMood !== oldMood) {
      statUpdates.overallCitizenMood = newMood;
    }
  }

  // --- STEP 3: Derive qualitative ratings from the new numerical stats for UI display ---
  // publicSafetyRating is now removed. educationQuality remains placeholder logic.
  statUpdates.educationQuality = deriveRatingFromValue(
    cityStatsWithUpdates.povertyRate,
    [10, 15, 22, 30],
    RATING_LEVELS.slice().reverse()
  ); // Placeholder logic

  return { statUpdates, newsItems };
};

const generateAIBillName = (theme, currentYear) => {
  const prefixes = [
    "The",
    "A Bill Regarding",
    "An Act for",
    "The Comprehensive",
  ];
  const suffixes = ["Act", "Initiative", "Bill", "Ordinance", "Reform Package"];
  // Use the passed-in theme directly instead of a random topic
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${theme} ${
    suffixes[Math.floor(Math.random() * suffixes.length)]
  } of ${currentYear}`;
};

export const runAIBillProposals = (campaign, getFromStore) => {
  const billsToDispatch = [];
  if (
    !campaign?.governmentOffices ||
    !campaign.startingCity?.stats ||
    !campaign.currentDate
  ) {
    return billsToDispatch;
  }

  // PERFORMANCE OPTIMIZATION: Only get government offices relevant to the current city context
  // This avoids flattening thousands of irrelevant city offices
  const cityId = campaign.startingCity?.id;
  const stateId = campaign.regionId;
  const contextualOffices = getFromStore().actions?.getGovernmentOfficesForContext?.('city', cityId, stateId) || [];
  const councilMembers = contextualOffices
    .flatMap(
      (office) => office.members || (office.holder ? [office.holder] : [])
    )
    .filter((m) => !m.isPlayer);

  const availablePolicyIds = (
    getFromStore().availablePoliciesForProposal || []
  ).map((p) => p.id);

  // This now tracks full bill objects for the current tick
  let proposedBillsThisTick = [...(getFromStore().proposedBills || [])];

  councilMembers.forEach((aiPolitician) => {
    // Use strategic proposal system instead of random chance
    try {
      const authoredBillObject = strategicAIBillProposal(
        aiPolitician,
        availablePolicyIds,
        campaign.startingCity.stats,
        getFromStore().activeLegislation || [],
        proposedBillsThisTick,
        getFromStore().availablePoliciesForProposal || [],
        getFromStore().failedBillsHistory || [],
        campaign.currentDate,
        councilMembers,
        contextualOffices
      );

      // Check if the AI strategically decided to propose a bill
      if (authoredBillObject && authoredBillObject.policies.length > 0) {
        const { policies, theme } = authoredBillObject; // Destructure the object

        const newBill = {
          id: `bill_${Date.now()}_${Math.random()}`,
          // CHANGED: Pass the specific theme to the naming function
          name: generateAIBillName(theme, campaign.currentDate.year),
          proposerId: aiPolitician.id,
          proposerName: `${aiPolitician.firstName} ${aiPolitician.lastName}`,
          policies: policies, // Use the policies array from the authored object
          status: "pending_vote",
          dateProposed: { ...campaign.currentDate },
          votes: { yea: [], nay: [], abstain: [] },
          councilVotesCast: {},
        };
        billsToDispatch.push(newBill);
        proposedBillsThisTick.push(newBill);
      }
    } catch (error) {
      console.error(
        `Error in strategic AI bill proposal for ${aiPolitician.firstName} ${aiPolitician.lastName}:`,
        error
      );
      // Fall back to no proposal on error
    }
  });

  return billsToDispatch;
};

/**
 * Updates party popularity monthly based on multi-level performance and incumbent actions.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {object} { cityPoliticalLandscape: Array | null, statePoliticalLandscape: Array | null, newsItems: Array }
 */
export const runMonthlyPartyPopularityUpdate = (campaign, getFromStore) => {
  const results = {
    cityPoliticalLandscape: null,
    statePoliticalLandscape: null,
    newsItems: [],
  };

  // Update city-level party popularity
  if (campaign?.startingCity?.politicalLandscape?.length) {
    results.cityPoliticalLandscape = updateCityPartyPopularity(
      campaign,
      getFromStore
    );
  }

  // Update state-level party popularity (if state data exists)
  if (campaign?.parentState?.politicalLandscape?.length) {
    results.statePoliticalLandscape = updateStatePartyPopularity(
      campaign,
      getFromStore
    );
  }

  return results;
};

/**
 * Updates city-level party popularity based on local performance and governance.
 */
const updateCityPartyPopularity = (campaign, getFromStore) => {
  const politicalLandscape = campaign.startingCity.politicalLandscape;
  const cityStats = campaign.startingCity.stats;
  const electorateProfile = cityStats.electoratePolicyProfile || {};

  // Get incumbent information using store helper functions
  const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { executive: [], legislative: [] };
  const mayorOffice = cityOffices.executive?.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const councilOffices = cityOffices.legislative || [];

  const mayorPartyId = mayorOffice?.holder?.partyId;
  const councilPartyComposition = getPartyComposition(councilOffices);

  // Get recent legislative performance
  const recentBills = getFromStore?.()?.passedBillsArchive?.slice(-6) || []; // Last 6 months
  const billPerformance = analyzeBillPerformance(
    recentBills,
    electorateProfile
  );

  const newLandscape = politicalLandscape.map((party) => {
    let totalShift = getRandomInt(-15, 15) / 100; // Reduced base randomness

    // Executive performance (Mayor)
    const isMayorParty =
      party.id === mayorPartyId &&
      mayorPartyId &&
      !mayorPartyId.includes("independent");
    if (isMayorParty) {
      totalShift += calculateExecutivePerformance(cityStats, "city");
    }

    // Legislative performance (Council)
    const councilInfluence = councilPartyComposition[party.id] || 0;
    if (councilInfluence > 0) {
      totalShift += calculateLegislativePerformance(
        billPerformance,
        councilInfluence
      );
    }

    // Policy alignment with electorate
    totalShift += calculatePolicyAlignment(party, electorateProfile) * 0.3;

    // Opposition benefit from poor governance
    if (!isMayorParty && councilInfluence < 0.3) {
      totalShift += calculateOppositionBonus(cityStats, "city");
    }

    const newPopularity = Math.max(
      0.5,
      Math.min(95, (party.popularity || 0) + totalShift)
    );
    return { ...party, popularity: newPopularity };
  });

  return normalizePartyPopularities(newLandscape);
};

/**
 * Updates state-level party popularity based on state performance and governance.
 */
const updateStatePartyPopularity = (campaign, getFromStore) => {
  const stateLandscape = campaign.parentState.politicalLandscape;
  const stateStats = campaign.parentState.stats || {};
  const electorateProfile = stateStats.electoratePolicyProfile || {};

  // Get state-level incumbent information using store helper functions
  const stateOffices = getFromStore().actions?.getCurrentStateGovernmentOffices?.() || { executive: [], legislative: { lowerHouse: [], upperHouse: [] } };
  const governorOffice = stateOffices.executive?.find(
    (off) => off.officeNameTemplateId === "governor"
  );
  const legislatureOffices = [
    ...(stateOffices.legislative?.lowerHouse || []),
    ...(stateOffices.legislative?.upperHouse || [])
  ];

  const governorPartyId = governorOffice?.holder?.partyId;
  const legislatureComposition = getPartyComposition(legislatureOffices);

  const newLandscape = stateLandscape.map((party) => {
    let totalShift = getRandomInt(-10, 10) / 100; // Even less randomness at state level

    // Executive performance (Governor)
    const isGovernorParty =
      party.id === governorPartyId &&
      governorPartyId &&
      !governorPartyId.includes("independent");
    if (isGovernorParty) {
      totalShift += calculateExecutivePerformance(stateStats, "state");
    }

    // Legislative performance (State Legislature)
    const legislativeInfluence = legislatureComposition[party.id] || 0;
    if (legislativeInfluence > 0) {
      // State legislative performance would be based on state-level bills
      totalShift += legislativeInfluence * 0.2; // Placeholder
    }

    // Policy alignment with state electorate
    totalShift += calculatePolicyAlignment(party, electorateProfile) * 0.25;

    // Opposition benefit
    if (!isGovernorParty && legislativeInfluence < 0.3) {
      totalShift += calculateOppositionBonus(stateStats, "state");
    }

    const newPopularity = Math.max(
      1.0,
      Math.min(90, (party.popularity || 0) + totalShift)
    );
    return { ...party, popularity: newPopularity };
  });

  return normalizePartyPopularities(newLandscape);
};

/**
 * Helper functions for party popularity calculations
 */
const getPartyComposition = (offices) => {
  const composition = {};
  let totalMembers = 0;

  offices.forEach((office) => {
    const members = office.members || (office.holder ? [office.holder] : []);
    members.forEach((member) => {
      if (member.partyId && !member.partyId.includes("independent")) {
        composition[member.partyId] = (composition[member.partyId] || 0) + 1;
        totalMembers++;
      }
    });
  });

  // Convert to percentages
  Object.keys(composition).forEach((partyId) => {
    composition[partyId] =
      totalMembers > 0 ? composition[partyId] / totalMembers : 0;
  });

  return composition;
};

const analyzeBillPerformance = (recentBills, electorateProfile) => {
  if (!recentBills.length) return { successRate: 0.5, publicSupport: 0 };

  const passedBills = recentBills.filter((bill) => bill.status === "passed");
  const successRate = passedBills.length / recentBills.length;

  // Calculate public support based on policy alignment
  let totalSupport = 0;
  passedBills.forEach((bill) => {
    if (bill.policies) {
      bill.policies.forEach((policy) => {
        // Simple alignment check - in practice this would be more sophisticated
        if (electorateProfile[policy.categoryId]) {
          totalSupport += 0.1; // Each aligned policy adds support
        }
      });
    }
  });

  return {
    successRate,
    publicSupport: Math.min(1, totalSupport / Math.max(1, passedBills.length)),
  };
};

const calculateExecutivePerformance = (stats, level) => {
  let performanceShift = 0;

  if (level === "city") {
    // City-level executive performance
    if (stats.povertyRate > 20) performanceShift -= 0.6;
    else if (stats.povertyRate < 12) performanceShift += 0.4;

    if (stats.crimeRatePer1000 > 55) performanceShift -= 0.7;
    else if (stats.crimeRatePer1000 < 25) performanceShift += 0.5;

    if (stats.unemploymentRate > 7.5) performanceShift -= 0.5;
    else if (stats.unemploymentRate < 4.0) performanceShift += 0.4;

    // Budget performance
    if (stats.budget?.balance < -stats.budget?.totalAnnualIncome * 0.1) {
      performanceShift -= 0.3; // Large deficit hurts
    } else if (stats.budget?.balance > 0) {
      performanceShift += 0.2; // Surplus helps
    }

    // Citizen mood
    const moodLevels = [
      "Angry",
      "Frustrated",
      "Neutral",
      "Content",
      "Happy",
      "Euphoric",
    ];
    const moodIndex = moodLevels.indexOf(stats.overallCitizenMood);
    if (moodIndex >= 0) {
      performanceShift += (moodIndex - 2.5) * 0.15; // -0.375 to +0.525
    }
  } else if (level === "state") {
    // State-level executive performance (similar but different thresholds)
    if (stats.unemploymentRate > 8) performanceShift -= 0.4;
    else if (stats.unemploymentRate < 5) performanceShift += 0.3;

    if (stats.economicGrowth < -1) performanceShift -= 0.5;
    else if (stats.economicGrowth > 3) performanceShift += 0.4;
  }

  return performanceShift;
};

const calculateLegislativePerformance = (billPerformance, partyInfluence) => {
  let performanceShift = 0;

  // Reward successful legislation
  if (billPerformance.successRate > 0.7) {
    performanceShift += 0.3 * partyInfluence;
  } else if (billPerformance.successRate < 0.3) {
    performanceShift -= 0.4 * partyInfluence;
  }

  // Reward popular legislation
  if (billPerformance.publicSupport > 0.6) {
    performanceShift += 0.2 * partyInfluence;
  } else if (billPerformance.publicSupport < 0.3) {
    performanceShift -= 0.3 * partyInfluence;
  }

  return performanceShift;
};

const calculatePolicyAlignment = () => {
  const cachedValues = [-0.1, -0.08, -0.05, -0.03, 0, 0.02, 0.05, 0.07, 0.1];
  return cachedValues[Math.floor(Math.random() * cachedValues.length)];
};

const calculateOppositionBonus = (stats, level) => {
  let bonus = 0;

  if (level === "city") {
    // Opposition benefits when things are going poorly
    if (stats.povertyRate > 20) bonus += 0.3;
    if (stats.crimeRatePer1000 > 55) bonus += 0.4;
    if (stats.unemploymentRate > 7.5) bonus += 0.25;
    if (
      stats.overallCitizenMood === "Angry" ||
      stats.overallCitizenMood === "Frustrated"
    ) {
      bonus += 0.3;
    }
  } else if (level === "state") {
    if (stats.unemploymentRate > 8) bonus += 0.2;
    if (stats.economicGrowth < -1) bonus += 0.3;
  }

  return Math.min(0.5, bonus); // Cap opposition bonus
};

/**
 * Process random events and their coalition effects for the current city
 * @param {object} campaign - The current campaign state
 * @param {object} coalitionSoA - Coalition data structure (optional)
 * @returns {object} { events: Array, coalitionUpdates: object | null, newsItems: Array }
 */
export const runMonthlyEventProcessing = (campaign, coalitionSoA = null) => {
  const results = {
    events: [],
    coalitionUpdates: null,
    newsItems: [],
    performanceMetrics: null
  };

  // Check if we should generate a random event this month
  if (!shouldGenerateRandomEvent(campaign)) {
    return results;
  }

  try {
    // Set up game context for event generation
    const gameContext = {
      currentDate: campaign.currentDate,
      locationName: campaign.startingCity?.name,
      cityName: campaign.startingCity?.name,
      countryId: campaign.country?.id,
      regionId: campaign.startingCity?.regionId,
      recentEvents: campaign.recentEvents || [],
      currentPolicies: campaign.activeLegislation || []
    };

    // Set up game state for news processing
    const gameState = {
      newsOutlets: campaign.newsOutlets || [],
      allPoliticians: campaign.politicians ? 
        Array.from(campaign.politicians.base.values()) : [],
      cityName: campaign.startingCity?.name,
      lobbyingGroups: campaign.lobbyingGroups || []
    };

    // Generate and process the event with coalition effects
    const processedEvent = generateAndProcessCityEvent(
      gameContext,
      coalitionSoA,
      gameState
    );

    if (processedEvent) {
      results.events.push(processedEvent);
      
      // Extract news articles for the main news feed
      if (processedEvent.newsArticles && processedEvent.newsArticles.length > 0) {
        results.newsItems.push(...processedEvent.newsArticles);
      }
      
      // Extract coalition effects if they exist
      if (processedEvent.coalitionEffects) {
        results.coalitionUpdates = processedEvent.coalitionEffects;
        results.performanceMetrics = processedEvent.coalitionEffects.performanceReport;
      }

      // Update campaign with this event (for future reference)
      const updatedRecentEvents = [...(campaign.recentEvents || []), processedEvent]
        .slice(-10); // Keep only last 10 events
      
      results.campaignUpdates = {
        recentEvents: updatedRecentEvents,
        lastEventDate: campaign.currentDate
      };
    }
  } catch (error) {
    console.error('Error processing monthly events:', error);
    // Continue without failing the entire monthly tick
  }

  return results;
};

/**
 * Initialize coalition system for a city if not already present
 * @param {object} city - City data
 * @param {Array} availableParties - Available political parties
 * @returns {object} Coalition SoA structure
 */
export const initializeCityCoalitions = (city, availableParties = []) => {
  try {
    // Create coalition structure
    const coalitionSoA = createCoalitionSoA();
    
    // Generate coalitions based on city demographics and electorate
    const generatedCoalitions = generateCoalitions(
      city.stats?.electoratePolicyProfile || {},
      city.demographics || {},
      availableParties
    );
    
    // Merge generated data into SoA structure
    Object.assign(coalitionSoA, generatedCoalitions);
    
    return coalitionSoA;
  } catch (error) {
    console.error('Error initializing city coalitions:', error);
    return createCoalitionSoA(); // Return empty structure
  }
};

/**
 * Update city coalition mobilization based on policy changes, stats, and events
 * @param {object} coalitionSoA - Coalition data structure
 * @param {object} campaign - Campaign state
 * @param {Array} policyEvents - Policy changes that occurred this month
 * @returns {object} Coalition update results
 */
export const updateCityCoalitionMobilization = (coalitionSoA, campaign, policyEvents = []) => {
  if (!coalitionSoA || !campaign.startingCity) {
    return { coalitionUpdates: null, performanceMetrics: null };
  }

  try {
    // Convert policy events to coalition events
    const coalitionPolicyEvents = policyEvents.map(policyEvent => ({
      id: `policy_${policyEvent.id}_${Date.now()}`,
      type: `${policyEvent.category}_policy_change`,
      jurisdictionId: campaign.startingCity.id,
      jurisdictionType: 'city',
      magnitude: policyEvent.impact || 1.0,
      date: campaign.currentDate,
      context: {
        policyId: policyEvent.id,
        policyName: policyEvent.name,
        direction: policyEvent.direction || 0
      }
    }));

    // Process coalition effects from policy changes
    const results = processCascadingCoalitionUpdates(
      coalitionSoA,
      coalitionPolicyEvents, // City events
      [], // No state events for now
      [], // No national events for now
      null, // Default spatial aggregator
      {
        enablePerformanceMonitoring: true,
        enableCaching: true
      }
    );

    return {
      coalitionUpdates: results,
      performanceMetrics: results.performanceReport
    };
  } catch (error) {
    console.error('Error updating coalition mobilization:', error);
    return { coalitionUpdates: null, performanceMetrics: null };
  }
};

export const runMonthlyPlayerApprovalUpdate = (campaign, getFromStore) => {
  const cityStats = campaign.startingCity?.stats;
  const playerPoliticianId = campaign.playerPoliticianId;
  const politiciansStore = campaign.politicians;

  if (!cityStats || !playerPoliticianId || !politiciansStore) return null;

  // Use store helper to get city offices
  const cityOffices = getFromStore().actions?.getCurrentCityGovernmentOffices?.() || { executive: [], legislative: [] };
  const mayorOffice = cityOffices.executive?.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const mayorId = mayorOffice?.holder?.id;

  const playerState = politiciansStore.state.get(playerPoliticianId);
  if (!playerState) return null; // Player data not found

  const currentApproval = parseFloat(playerState.approvalRating) || 50; // Default to 50 if undefined/NaN
  const currentOverallCitizenMood = cityStats.overallCitizenMood;

  let approvalChangeFromMood = 0;
  const moodIndex = MOOD_LEVELS.indexOf(currentOverallCitizenMood);
  if (moodIndex !== -1) {
    approvalChangeFromMood = [-2, -1, 0, 1, 2, 3][moodIndex] || 0;
  }

  let newPlayerApproval = currentApproval;

  // Check if the player is the mayor by comparing IDs
  if (mayorId && mayorId === playerPoliticianId) {
    newPlayerApproval = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          currentApproval + approvalChangeFromMood + getRandomInt(-1, 1)
        )
      )
    );
  } else {
    // Player is not the mayor, less affected by city mood
    newPlayerApproval = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          currentApproval +
            getRandomInt(-1, 1) +
            Math.floor(approvalChangeFromMood / 2)
        )
      )
    );
  }

  // Final safety check to prevent NaN
  if (isNaN(newPlayerApproval) || !isFinite(newPlayerApproval)) {
    console.warn(`[monthlyTick] Invalid newPlayerApproval calculated: ${newPlayerApproval}, using currentApproval: ${currentApproval}`);
    return null;
  }

  return newPlayerApproval !== currentApproval ? newPlayerApproval : null;
};
