// src/simulation/monthlyTick.js
// This file contains the core logic for processing all game state changes that occur on a monthly basis.

// NOTE: Import paths will need to be updated as the refactoring progresses.
import { getRandomInt, adjustStatLevel } from "../utils/core.js";
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
  STAT_LEVEL_ARRAYS,
} from "../data/governmentData";
import { decideAIPolicyProposal } from "../utils/aiUtils.js"; // This will likely move to an AI-specific module
import { normalizeArrayBySum } from "../utils/core.js"; // Corrected path
import { calculateDetailedIncomeSources } from "../entities/politicalEntities.js";
import { CITY_POLICIES } from "../data/policyDefinitions";
import { calculateHealthcareMetrics } from "./statCalculator.js";

/**
 * Recalculates budget figures based on the current city state.
 * @param {object} campaign - The current activeCampaign object.
 * @returns {object} { budgetUpdates: object | null, newsItems: Array }
 */
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
    dominantIndustries
  );
  const newTotalAnnualIncome = Math.floor(
    Object.values(newIncomeSources).reduce((sum, val) => sum + val, 0)
  );
  const currentTotalAnnualExpenses = budget.totalAnnualExpenses;
  const newBalance = newTotalAnnualIncome - currentTotalAnnualExpenses;

  let newAccumulatedDebt = budget.accumulatedDebt || 0;
  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else if (newBalance > 0 && newAccumulatedDebt > 0) {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  const budgetUpdates = {
    totalAnnualIncome: newTotalAnnualIncome,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: newIncomeSources,
  };

  // Check if there's any meaningful change to avoid unnecessary state updates
  if (
    newTotalAnnualIncome === budget.totalAnnualIncome &&
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
  const newsItems = [];
  const cityStats = campaign.startingCity?.stats;

  if (!cityStats) {
    return { statUpdates, newsItems };
  }

  // This logic could be expanded, but for now, it's a simple random drift.
  // A more advanced simulation would tie this to policy effects, economic trends, etc.
  const statsToDrift = [
    "publicSafetyRating",
    "educationQuality",
    "infrastructureState",
    "environmentRating",
    "cultureArtsRating",
  ];
  statsToDrift.forEach((statKey) => {
    if (Math.random() < 0.1) {
      // 10% chance of a random drift each month
      const change = getRandomInt(-1, 1);
      if (change !== 0) {
        const oldStat = cityStats[statKey];
        const newStat = adjustStatLevel(oldStat, RATING_LEVELS, change);
        if (newStat !== oldStat) {
          statUpdates[statKey] = newStat;
        }
      }
    }
  });

  // Recalculate derived stats like healthcare
  const { healthcareCoverage, healthcareCostPerPerson } =
    calculateHealthcareMetrics({
      population: campaign.startingCity?.population,
      currentBudgetAllocationForHealthcare:
        cityStats.budget?.expenseAllocations?.publicHealthServices || 0,
      demographics: campaign.startingCity?.demographics,
      economicProfile: campaign.startingCity?.economicProfile,
    });

  if (healthcareCoverage !== cityStats.healthcareCoverage) {
    statUpdates.healthcareCoverage = healthcareCoverage;
  }
  if (healthcareCostPerPerson !== cityStats.healthcareCostPerPerson) {
    statUpdates.healthcareCostPerPerson = healthcareCostPerPerson;
  }

  return { statUpdates, newsItems };
};

/**
 * Simulates AI policy proposals for the month.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {Array<object>} Array of new proposal objects to be added to the store.
 */
export const runAIPolicyProposals = (campaign, getFromStore) => {
  const proposalsToDispatch = [];
  if (
    !campaign?.governmentOffices ||
    !campaign.startingCity?.stats ||
    !campaign.currentDate
  ) {
    return proposalsToDispatch;
  }

  const councilMembers = campaign.governmentOffices
    .flatMap(
      (office) => office.members || (office.holder ? [office.holder] : [])
    )
    .filter((m) => !m.isPlayer);
  const availablePolicyIds = (
    getFromStore().availablePoliciesForProposal || []
  ).map((p) => p.id);
  let proposedLegislationThisTick = [
    ...(getFromStore().proposedLegislation || []),
  ];

  councilMembers.forEach((aiPolitician) => {
    if (Math.random() < 0.15) {
      // Chance for an AI to propose something
      const proposalDetails = decideAIPolicyProposal(
        aiPolitician,
        availablePolicyIds,
        campaign.startingCity.stats,
        getFromStore().activeLegislation || [],
        proposedLegislationThisTick
      );

      if (proposalDetails?.policyId) {
        const policyDef = CITY_POLICIES.find(
          (p) => p.id === proposalDetails.policyId
        );
        if (policyDef) {
          const newProposal = {
            id: `prop_${Date.now()}_${Math.random()}`,
            policyId: proposalDetails.policyId,
            proposerId: aiPolitician.id,
            chosenParameters: proposalDetails.chosenParameters,
            policyName: policyDef.name,
            proposerName: aiPolitician.name,
            status: "proposed",
            dateProposed: { ...campaign.currentDate },
            councilVotesCast: {},
          };
          proposalsToDispatch.push(newProposal);
          proposedLegislationThisTick.push(newProposal); // Update for subsequent AIs in the same tick
        }
      }
    }
  });

  return proposalsToDispatch;
};

/**
 * Helper to determine which city stat is most important to a given ideology.
 * @param {string} ideologyName - The name of the ideology.
 * @returns {string} The key of the relevant city stat.
 */
const determineKeyStatForIdeology = (ideologyName) => {
  switch (ideologyName) {
    case "Conservative":
    case "Nationalist":
      return "publicSafetyRating";
    case "Libertarian":
      return "economicOutlook";
    case "Socialist":
    case "Communist":
    case "Social Democrat":
      return "healthcareCoverage"; // Changed to coverage for more direct impact
    case "Progressive":
      return "educationQuality";
    case "Green":
      return "environmentRating";
    default:
      return "overallCitizenMood";
  }
};

/**
 * Updates party popularity monthly based on city performance and incumbent actions.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {object} { newPoliticalLandscape: Array | null, newsItems: Array }
 */
export const runMonthlyPartyPopularityUpdate = (campaign, getFromStore) => {
  if (!campaign?.startingCity?.politicalLandscape?.length) {
    return { newPoliticalLandscape: null, newsItems: [] };
  }

  let politicalLandscapeCloned = JSON.parse(
    JSON.stringify(campaign.startingCity.politicalLandscape)
  );
  const cityStats = campaign.startingCity.stats;
  const mayorOffice = campaign.governmentOffices?.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const mayorPartyId = mayorOffice?.holder?.partyId;
  const allParties = getFromStore().allParties || [];
  const mayorPartyDetails = allParties.find((p) => p.id === mayorPartyId);
  const mayorPartyIdeology =
    mayorPartyDetails?.ideology || mayorOffice?.holder?.calculatedIdeology;

  const newsItems = [];
  let overallLandscapeChanged = false;

  politicalLandscapeCloned.forEach((party) => {
    let totalShift = getRandomInt(-25, 25) / 100; // Base random shift: +/- 0.25 pp
    const originalPopularity = party.popularity || 0;
    const isIncumbentParty =
      party.id === mayorPartyId &&
      mayorPartyId &&
      !mayorPartyId.includes("independent");

    // --- 1. Incumbent Party Effects ---
    if (isIncumbentParty) {
      const moodIndex = MOOD_LEVELS.indexOf(cityStats.overallCitizenMood);
      if (moodIndex !== -1)
        totalShift += [-0.6, -0.3, 0.0, 0.2, 0.4, 0.7][moodIndex] || 0;

      const econOutlookIdx = ECONOMIC_OUTLOOK_LEVELS.indexOf(
        cityStats.economicOutlook
      );
      if (econOutlookIdx !== -1)
        totalShift += [-0.5, -0.25, 0.0, 0.3, 0.6][econOutlookIdx] || 0;

      if (cityStats.unemploymentRate > 8.0) totalShift -= 0.35;
      else if (cityStats.unemploymentRate < 4.5) totalShift += 0.25;

      if (cityStats.healthcareCoverage < 50) totalShift -= 0.4;
      else if (cityStats.healthcareCoverage > 90) totalShift += 0.2;

      if (mayorPartyIdeology) {
        const keyStat = determineKeyStatForIdeology(mayorPartyIdeology);
        const statLevels = STAT_LEVEL_ARRAYS[keyStat] || RATING_LEVELS;
        const keyStatIndex = statLevels.indexOf(cityStats[keyStat]);
        if (keyStatIndex !== -1) {
          const midPoint = Math.floor(statLevels.length / 2);
          totalShift += (keyStatIndex - midPoint) * 0.3;
        }
      }
    }
    // --- 2. Opposition Party Effects ---
    else {
      const moodIndex = MOOD_LEVELS.indexOf(cityStats.overallCitizenMood);
      if (moodIndex <= 1) totalShift += getRandomInt(10, 30) / 100; // Unhappy citizens look for alternatives

      const econOutlookIdx = ECONOMIC_OUTLOOK_LEVELS.indexOf(
        cityStats.economicOutlook
      );
      if (econOutlookIdx <= 1) totalShift += getRandomInt(10, 25) / 100; // Bad economy helps opposition
    }

    if (totalShift !== 0) {
      party.popularity = Math.max(
        0.5,
        Math.min(95, originalPopularity + totalShift)
      );
      if (
        parseFloat(party.popularity.toFixed(4)) !==
        parseFloat(originalPopularity.toFixed(4))
      ) {
        overallLandscapeChanged = true;
      }
    }
  });

  if (!overallLandscapeChanged) {
    return { newPoliticalLandscape: null, newsItems: [] };
  }

  const normalizedLandscape = normalizeArrayBySum(
    politicalLandscapeCloned,
    100,
    2
  );

  // Generate news for significant shifts
  normalizedLandscape.forEach((newPartyData) => {
    const originalParty = campaign.startingCity.politicalLandscape.find(
      (p) => p.id === newPartyData.id
    );
    if (originalParty) {
      const shift = newPartyData.popularity - (originalParty.popularity || 0);
      if (Math.abs(shift) > 1.5) {
        newsItems.push({
          headline: `Shift in Support for ${newPartyData.name}`,
          summary: `${newPartyData.name} has seen a ${
            shift > 0 ? "notable increase" : "significant decrease"
          } in public support. Their popularity is now estimated at ${newPartyData.popularity.toFixed(
            1
          )}%.`,
          type: "political_shift",
          scope: "local",
          impact: shift > 0 ? "positive" : "negative",
          partyId: newPartyData.id,
        });
      }
    }
  });

  return { newPoliticalLandscape: normalizedLandscape, newsItems };
};
