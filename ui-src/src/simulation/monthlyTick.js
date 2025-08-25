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
import { runStateBudgetUpdate, runNationalBudgetUpdate } from "../utils/regionalStatCalc.js";
import { normalizePartyPopularities } from "../utils/electionUtils.js";
import { decideAndAuthorAIBill } from "./aiProposal.js";
import { generateNewsForEvent } from "./newsGenerator.js";

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
export const runMonthlyRegionalUpdates = (campaign) => {
  console.log('[Tick] Running monthly regional updates...');
  // For now, return empty object since the campaign structure doesn't have regions/country
  // The existing city budget update handles the main budget calculations
  // TODO: Implement proper regional budget structure when campaign data model is updated
  return {};
};

export const runMonthlyBudgetUpdate = (campaign) => {
  console.log('[Tick] Running monthly budget update...');
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
  console.log('[Tick] Running monthly stat update...');
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
  if (Math.abs(newStats.unemploymentRate - oldStats.unemploymentRate) > 0.5) {
    const event = {
      type: "economic_update",
      context: {
        stat: "unemployment rate",
        oldValue: oldStats.unemploymentRate.toFixed(1),
        newValue: newStats.unemploymentRate.toFixed(1),
        direction:
          newStats.unemploymentRate < oldStats.unemploymentRate
            ? "positive"
            : "negative",
      },
    };
    // Generate a story from a random outlet
    if (allOutlets.length > 0) {
      const reportingOutlet = getRandomElement(allOutlets);
      newsItems.push(
        generateNewsForEvent(event, reportingOutlet, campaign.currentDate)
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
  console.log('[Tick] Running AI bill proposals...');
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
        proposedBillsThisTick,
        getFromStore().availablePoliciesForProposal || []
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
 * Updates party popularity monthly based on multi-level performance and incumbent actions.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {object} { cityPoliticalLandscape: Array | null, statePoliticalLandscape: Array | null, newsItems: Array }
 */
export const runMonthlyPartyPopularityUpdate = (campaign, getFromStore) => {
  console.log('[Tick] Running comprehensive party popularity update...');
  
  const results = {
    cityPoliticalLandscape: null,
    statePoliticalLandscape: null,
    newsItems: []
  };

  // Update city-level party popularity
  if (campaign?.startingCity?.politicalLandscape?.length) {
    results.cityPoliticalLandscape = updateCityPartyPopularity(campaign, getFromStore);
  }

  // Update state-level party popularity (if state data exists)
  if (campaign?.parentState?.politicalLandscape?.length) {
    results.statePoliticalLandscape = updateStatePartyPopularity(campaign, getFromStore);
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
  
  // Get incumbent information
  const mayorOffice = campaign.governmentOffices?.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const councilOffices = campaign.governmentOffices?.filter(
    (off) => off.officeNameTemplateId === "city_council" || off.officeNameTemplateId === "council_member"
  ) || [];
  
  const mayorPartyId = mayorOffice?.holder?.partyId;
  const councilPartyComposition = getPartyComposition(councilOffices);
  
  // Get recent legislative performance
  const recentBills = getFromStore?.()?.passedBillsArchive?.slice(-6) || []; // Last 6 months
  const billPerformance = analyzeBillPerformance(recentBills, electorateProfile);

  const newLandscape = politicalLandscape.map((party) => {
    let totalShift = getRandomInt(-15, 15) / 100; // Reduced base randomness
    
    // Executive performance (Mayor)
    const isMayorParty = party.id === mayorPartyId && mayorPartyId && !mayorPartyId.includes("independent");
    if (isMayorParty) {
      totalShift += calculateExecutivePerformance(cityStats, 'city');
    }
    
    // Legislative performance (Council)
    const councilInfluence = councilPartyComposition[party.id] || 0;
    if (councilInfluence > 0) {
      totalShift += calculateLegislativePerformance(billPerformance, councilInfluence);
    }
    
    // Policy alignment with electorate
    totalShift += calculatePolicyAlignment(party, electorateProfile) * 0.3;
    
    // Opposition benefit from poor governance
    if (!isMayorParty && councilInfluence < 0.3) {
      totalShift += calculateOppositionBonus(cityStats, 'city');
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
  
  // Get state-level incumbent information (governor, state legislature)
  const governorOffice = campaign.stateGovernmentOffices?.find(
    (off) => off.officeNameTemplateId === "governor"
  );
  const legislatureOffices = campaign.stateGovernmentOffices?.filter(
    (off) => off.officeNameTemplateId?.includes("state_") && off.officeNameTemplateId?.includes("legislature")
  ) || [];
  
  const governorPartyId = governorOffice?.holder?.partyId;
  const legislatureComposition = getPartyComposition(legislatureOffices);
  
  const newLandscape = stateLandscape.map((party) => {
    let totalShift = getRandomInt(-10, 10) / 100; // Even less randomness at state level
    
    // Executive performance (Governor)
    const isGovernorParty = party.id === governorPartyId && governorPartyId && !governorPartyId.includes("independent");
    if (isGovernorParty) {
      totalShift += calculateExecutivePerformance(stateStats, 'state');
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
      totalShift += calculateOppositionBonus(stateStats, 'state');
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
  
  offices.forEach(office => {
    const members = office.members || (office.holder ? [office.holder] : []);
    members.forEach(member => {
      if (member.partyId && !member.partyId.includes('independent')) {
        composition[member.partyId] = (composition[member.partyId] || 0) + 1;
        totalMembers++;
      }
    });
  });
  
  // Convert to percentages
  Object.keys(composition).forEach(partyId => {
    composition[partyId] = totalMembers > 0 ? composition[partyId] / totalMembers : 0;
  });
  
  return composition;
};

const analyzeBillPerformance = (recentBills, electorateProfile) => {
  if (!recentBills.length) return { successRate: 0.5, publicSupport: 0 };
  
  const passedBills = recentBills.filter(bill => bill.status === 'passed');
  const successRate = passedBills.length / recentBills.length;
  
  // Calculate public support based on policy alignment
  let totalSupport = 0;
  passedBills.forEach(bill => {
    if (bill.policies) {
      bill.policies.forEach(policy => {
        // Simple alignment check - in practice this would be more sophisticated
        if (electorateProfile[policy.categoryId]) {
          totalSupport += 0.1; // Each aligned policy adds support
        }
      });
    }
  });
  
  return {
    successRate,
    publicSupport: Math.min(1, totalSupport / Math.max(1, passedBills.length))
  };
};

const calculateExecutivePerformance = (stats, level) => {
  let performanceShift = 0;
  
  if (level === 'city') {
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
    const moodLevels = ['Angry', 'Frustrated', 'Neutral', 'Content', 'Happy', 'Euphoric'];
    const moodIndex = moodLevels.indexOf(stats.overallCitizenMood);
    if (moodIndex >= 0) {
      performanceShift += (moodIndex - 2.5) * 0.15; // -0.375 to +0.525
    }
  } else if (level === 'state') {
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

const calculatePolicyAlignment = (party, electorateProfile) => {
  // This would compare party ideology/positions with electorate preferences
  // For now, return a small random alignment factor
  // In practice, this would use party ideology scores and electorate policy preferences
  return getRandomInt(-10, 10) / 100;
};

const calculateOppositionBonus = (stats, level) => {
  let bonus = 0;
  
  if (level === 'city') {
    // Opposition benefits when things are going poorly
    if (stats.povertyRate > 20) bonus += 0.3;
    if (stats.crimeRatePer1000 > 55) bonus += 0.4;
    if (stats.unemploymentRate > 7.5) bonus += 0.25;
    if (stats.overallCitizenMood === 'Angry' || stats.overallCitizenMood === 'Frustrated') {
      bonus += 0.3;
    }
  } else if (level === 'state') {
    if (stats.unemploymentRate > 8) bonus += 0.2;
    if (stats.economicGrowth < -1) bonus += 0.3;
  }
  
  return Math.min(0.5, bonus); // Cap opposition bonus
};

export const runMonthlyPlayerApprovalUpdate = (campaign) => {
  console.log('[Tick] Running monthly player approval update...');
  const cityStats = campaign.startingCity?.stats;
  const playerPoliticianId = campaign.playerPoliticianId;
  const politiciansStore = campaign.politicians;

  if (!cityStats || !playerPoliticianId || !politiciansStore) return null;

  const mayorOffice = campaign.governmentOffices.find(
    (off) => off.officeNameTemplateId === "mayor"
  );
  const mayorId = mayorOffice?.holder?.id;

  const playerState = politiciansStore.state.get(playerPoliticianId);
  if (!playerState) return null; // Player data not found

  const currentApproval = playerState.approvalRating;
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

  return newPlayerApproval !== currentApproval ? newPlayerApproval : null;
};
