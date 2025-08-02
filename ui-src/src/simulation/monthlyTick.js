// src/simulation/monthlyTick.js
import { getRandomInt, adjustStatLevel } from "../utils/core.js";
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../data/governmentData";
import { calculateDetailedIncomeSources } from "../entities/politicalEntities.js";
import { CITY_POLICIES } from "../data/policyDefinitions";
import { calculateAllCityStats } from "../utils/statCalculationCore.js";
import { normalizePartyPopularities } from "../utils/electionUtils.js";
import { decideAndAuthorAIBill } from "./aiProposal.js";

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
  // ... (initial setup remains the same) ...
  const statUpdates = {};
  const newsItems = [];
  const city = campaign.startingCity;

  if (!city?.stats) {
    return { statUpdates, newsItems };
  }

  // --- STEP 1: Calculate all core, numerical stats ---
  const calculatedStats = calculateAllCityStats(city);
  Object.assign(statUpdates, calculatedStats);

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

  const councilMembers = campaign.governmentOffices
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
    if (Math.random() < 0.15) {
      // CHANGED: Expect an object with { policies, theme }
      const authoredBillObject = decideAndAuthorAIBill(
        aiPolitician,
        availablePolicyIds,
        campaign.startingCity.stats,
        getFromStore().activeLegislation || [],
        proposedBillsThisTick
      );

      // Check if the AI successfully created a bill
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
    }
  });

  return billsToDispatch;
};

/**
 * Updates party popularity monthly based on city performance and incumbent actions.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {object} { newPoliticalLandscape: Array | null, newsItems: Array }
 */
export const runMonthlyPartyPopularityUpdate = (campaign) => {
  if (!campaign?.startingCity?.politicalLandscape?.length) {
    return { newPoliticalLandscape: null, newsItems: [] };
  }

  const politicalLandscape = campaign.startingCity.politicalLandscape;
  const cityStats = campaign.startingCity.stats; // These are the newly updated stats for the month
  const mayorOffice = campaign.governmentOffices?.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const mayorPartyId = mayorOffice?.holder?.partyId;

  const newLandscape = politicalLandscape.map((party) => {
    let totalShift = getRandomInt(-25, 25) / 100; // Base random shift
    const isIncumbentParty =
      party.id === mayorPartyId &&
      mayorPartyId &&
      !mayorPartyId.includes("independent");

    if (isIncumbentParty) {
      // Performance on key metrics directly impacts incumbent popularity
      if (cityStats.povertyRate > 20) totalShift -= 0.5;
      if (cityStats.povertyRate < 12) totalShift += 0.3;
      if (cityStats.crimeRatePer1000 > 55) totalShift -= 0.6;
      if (cityStats.crimeRatePer1000 < 25) totalShift += 0.4;
      if (cityStats.unemploymentRate > 7.5) totalShift -= 0.4;
      if (cityStats.unemploymentRate < 4.0) totalShift += 0.3;
    } else {
      // Opposition parties gain when the city is doing poorly
      if (cityStats.povertyRate > 20) totalShift += 0.3;
      if (cityStats.crimeRatePer1000 > 55) totalShift += 0.4;
      if (cityStats.unemploymentRate > 7.5) totalShift += 0.25;
    }

    const newPopularity = Math.max(
      0.5,
      Math.min(95, (party.popularity || 0) + totalShift)
    );
    return { ...party, popularity: newPopularity };
  });

  const normalizedLandscape = normalizePartyPopularities(newLandscape);
  return { newPoliticalLandscape: normalizedLandscape, newsItems: [] }; // News generation can be added here
};

export const runMonthlyPlayerApprovalUpdate = (campaign) => {
  const cityStats = campaign.startingCity?.stats;
  if (!cityStats) return null;

  const mayorOffice = campaign.governmentOffices.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const mayor = mayorOffice?.holder;
  const currentOverallCitizenMood = cityStats.overallCitizenMood;

  let approvalChangeFromMood = 0;
  const moodIndex = MOOD_LEVELS.indexOf(currentOverallCitizenMood);
  if (moodIndex !== -1) {
    approvalChangeFromMood = [-2, -1, 0, 1, 2, 3][moodIndex] || 0;
  }

  const currentApproval = campaign.politician.approvalRating;
  let newPlayerApproval = currentApproval;

  if (mayor && mayor.isPlayer) {
    newPlayerApproval = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          (currentApproval || 50) + approvalChangeFromMood + getRandomInt(-1, 1)
        )
      )
    );
  } else {
    // If player is not the mayor, their approval is less tied to city mood
    newPlayerApproval = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          (currentApproval || 50) +
            getRandomInt(-1, 1) +
            Math.floor(approvalChangeFromMood / 2)
        )
      )
    );
  }

  return newPlayerApproval !== currentApproval ? newPlayerApproval : null;
};
