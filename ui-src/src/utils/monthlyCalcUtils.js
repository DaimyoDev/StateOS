// ui-src/src/utils/monthlyUtils.js

import { getRandomInt, adjustStatLevel } from "./generalUtils"; // Adjust path as needed
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../data/governmentData"; // Adjust path
import { decideAIPolicyProposal } from "./aiUtils"; // Adjust path
import { normalizePartyPopularities } from "./electionUtils";
import { calculateDetailedIncomeSources } from "./governmentUtils";
import { STAT_LEVEL_ARRAYS } from "../stores/policySlice";
import { CITY_POLICIES } from "../data/policyDefinitions";

const determineKeyStatForIdeology = (ideologyName) => {
  switch (ideologyName) {
    case "Conservative":
    case "Religious Conservative":
    case "Nationalist": // Often prioritize order and security
      return "publicSafetyRating";
    case "Libertarian": // Focus on economic freedom, less government spending
      return "economicOutlook"; // And perhaps low tax burden (not a direct stat here)
    case "Technocratic": // Efficiency, progress, often economic or infrastructure
      return "economicOutlook"; // Or infrastructureState
    case "Socialist":
    case "Communist":
    case "Social Democrat": // Strong social safety nets, public services
      return "healthcareQuality"; // Or unemploymentRate (inverse)
    case "Progressive": // Social justice, environment, education
      return "educationQuality"; // Or environmentRating
    case "Green":
      return "environmentRating";
    case "Agrarian": // Rural economy, sometimes traditional values
      return "economicOutlook"; // Placeholder, could be a specific rural stat
    case "Populist": // Often driven by citizen mood or specific grievances
      return "overallCitizenMood";
    case "Monarchist": // Stability, tradition
      return "publicSafetyRating"; // As a proxy for order
    case "Liberal": // Can be broad, often education, civil liberties, balanced economy
      return "educationQuality"; // Or overallCitizenMood
    case "Centrist":
    case "True Centrist":
    default:
      return "overallCitizenMood"; // General well-being as a fallback
  }
};

/**
 * Recalculates budget figures based on current city state.
 * @param {object} campaign - The current activeCampaign object.
 * @returns {object} { budgetUpdates: { annualIncome, annualExpenses, balance, accumulatedDebt }, newsItems: [] }
 */
export const recalculateMonthlyBudget = (campaign) => {
  if (
    !campaign?.startingCity?.stats?.budget ||
    !campaign?.startingCity?.economicProfile ||
    !campaign?.startingCity?.population ||
    !campaign?.startingCity?.demographics // Needed if calculateDetailedIncomeSources uses cityType derived from pop
  ) {
    console.warn(
      "[MonthlyUtils] RecalculateBudget: Missing necessary campaign data for budget recalculation."
    );
    return { budgetUpdates: null, newsItems: [] };
  }

  const city = campaign.startingCity;
  const cityStats = city.stats;
  const budget = cityStats.budget;
  const population = city.population;
  const gdpPerCapita = city.economicProfile.gdpPerCapita;
  const dominantIndustries = city.economicProfile.dominantIndustries;

  // Determine cityType if needed by calculateDetailedIncomeSources
  let cityType = "City";
  if (population < 50000) cityType = "Village/Town";
  else if (population >= 250000) cityType = "Metropolis";

  // 1. Calculate Detailed Income Sources
  const newIncomeSources = calculateDetailedIncomeSources(
    population,
    gdpPerCapita,
    budget.taxRates, // Use current tax rates from the budget
    cityType,
    dominantIndustries
  );
  const newTotalAnnualIncome = Math.floor(
    Object.values(newIncomeSources).reduce((sum, val) => sum + val, 0)
  );

  // 2. Get Current Annual Expenses (these are primarily changed by policies directly affecting expenseAllocations)
  // For a more dynamic model, expenses could also have a base drift or inflation factor here.
  // For now, we assume they are the sum of current expenseAllocations.
  const currentTotalAnnualExpenses = budget.totalAnnualExpenses; // Or recalculate from expenseAllocations if they can drift independently

  // 3. Calculate New Balance
  const newBalance = newTotalAnnualIncome - currentTotalAnnualExpenses;

  // 4. Update Accumulated Debt/Surplus
  let newAccumulatedDebt = budget.accumulatedDebt;
  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance); // Deficit adds to debt
  } else if (newBalance > 0 && newAccumulatedDebt > 0) {
    // Surplus pays down debt
    const payment = Math.min(newBalance, newAccumulatedDebt);
    newAccumulatedDebt -= payment;
  } else if (newBalance > 0 && newAccumulatedDebt <= 0) {
    // Surplus adds to actual surplus (more negative debt)
    newAccumulatedDebt -= newBalance;
  }

  const budgetUpdates = {
    totalAnnualIncome: newTotalAnnualIncome,
    // totalAnnualExpenses: currentTotalAnnualExpenses, // No change unless explicitly modeled here
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: newIncomeSources, // Include the detailed breakdown
    // expenseAllocations are not recalculated here, only their sum via totalAnnualExpenses
  };

  // Check if any key summary value actually changed
  if (
    newTotalAnnualIncome === budget.totalAnnualIncome &&
    newBalance === budget.balance &&
    newAccumulatedDebt === budget.accumulatedDebt
  ) {
    // Also consider if incomeSources object itself has changed, even if total is same
    // For simplicity, focusing on summary figures for now.
    let sourcesChanged = false;
    if (budget.incomeSources) {
      for (const key in newIncomeSources) {
        if (newIncomeSources[key] !== budget.incomeSources[key]) {
          sourcesChanged = true;
          break;
        }
      }
    } else {
      sourcesChanged = true; // If old incomeSources didn't exist
    }
    if (
      !sourcesChanged &&
      !(
        newTotalAnnualIncome !== budget.totalAnnualIncome ||
        newBalance !== budget.balance ||
        newAccumulatedDebt !== budget.accumulatedDebt
      )
    ) {
      return { budgetUpdates: null, newsItems: [] }; // No effective change
    }
  }

  return { budgetUpdates, newsItems: [] }; // No news directly from budget recalc for now
};

/**
 * Simulates dynamic city stat changes for the month.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function (to fetch recently updated stats if needed).
 * @returns {object} { statUpdates: { statName: newValue, ... }, newsItems: [...] }
 */
export const simulateMonthlyCityStatChanges = (campaign) => {
  const statUpdates = {};
  const newsItems = [];

  const cityStats = campaign.startingCity?.stats;
  if (!cityStats) {
    console.warn(
      "[MonthlyUtils] simulateMonthlyCityStatChanges: No cityStats."
    );
    return { statUpdates, newsItems };
  }

  const mayorOffice = campaign.governmentOffices.find(
    (off) =>
      off.officeNameTemplateId === "mayor" &&
      off.officeName.includes(campaign.startingCity.name)
  );
  const mayor = mayorOffice?.holder;
  const mayorPolicyFocus = mayor?.policyFocus;
  const mayorIntelligence = mayor?.attributes?.intelligence || 5;
  const mayorIntegrity = mayor?.attributes?.integrity || 5;

  // Economic Outlook
  let econChange = 0;
  if (mayorPolicyFocus === "Economic Growth") {
    if (mayorIntelligence > 7) econChange += getRandomInt(1, 2);
    else if (mayorIntelligence < 4) econChange -= getRandomInt(1, 2);
  } else {
    if (mayorIntelligence > 7) econChange += getRandomInt(0, 1);
    else if (mayorIntelligence < 4) econChange -= getRandomInt(0, 1);
  }
  if (Math.random() < 0.05) econChange += getRandomInt(-1, 1);

  const oldEconOutlook = cityStats.economicOutlook;
  if (econChange !== 0) {
    const newEconOutlook = adjustStatLevel(
      oldEconOutlook,
      ECONOMIC_OUTLOOK_LEVELS,
      econChange
    );
    if (newEconOutlook !== oldEconOutlook) {
      statUpdates.economicOutlook = newEconOutlook;
      newsItems.push({
        headline: `Economic Outlook Shifts to "${newEconOutlook}" in ${campaign.startingCity.name}`,
        summary: `Recent economic activities have led to a noticeable shift. The current outlook is now considered ${newEconOutlook.toLowerCase()}.`,
        type: "city_stat_change",
        scope: "local",
        impact:
          econChange > 0 ? "positive" : econChange < 0 ? "negative" : "neutral",
      });
    }
  }
  const currentEconOutlook = statUpdates.economicOutlook || oldEconOutlook; // Use new value if changed this tick

  // Unemployment Rate
  let baseUnemployment = 5.0;
  const outlookIdx = ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook);
  if (outlookIdx !== -1)
    baseUnemployment = [8.0, 6.5, 5.0, 3.5, 2.0][outlookIdx] || 5.0;
  if (cityStats.wealth === "low") baseUnemployment += getRandomInt(1, 2);
  else if (cityStats.wealth === "high") baseUnemployment -= getRandomInt(0, 1);
  const newUnemploymentRate = parseFloat(
    Math.max(
      1.0,
      Math.min(20.0, baseUnemployment + (Math.random() * 1 - 0.5))
    ).toFixed(1)
  );
  if (newUnemploymentRate !== cityStats.unemploymentRate) {
    statUpdates.unemploymentRate = newUnemploymentRate;
  }

  // Public Safety Rating
  let safetyChange = 0;
  if (mayorPolicyFocus === "Public Safety") {
    if (mayorIntegrity > 7) safetyChange += getRandomInt(1, 2);
    else if (mayorIntegrity < 4) safetyChange -= getRandomInt(1, 2);
    if (mayorIntelligence > 6 && Math.random() < 0.3) safetyChange += 1;
  } else {
    if (mayorIntegrity > 7) safetyChange += getRandomInt(0, 1);
    else if (mayorIntegrity < 4) safetyChange -= getRandomInt(0, 1);
    if (mayorIntelligence > 6 && Math.random() < 0.15) safetyChange += 1;
  }
  if (Math.random() < 0.03) safetyChange += getRandomInt(-1, 1);
  if (safetyChange !== 0) {
    const newSafetyRating = adjustStatLevel(
      cityStats.publicSafetyRating,
      RATING_LEVELS,
      safetyChange
    );
    if (newSafetyRating !== cityStats.publicSafetyRating) {
      statUpdates.publicSafetyRating = newSafetyRating;
    }
  }
  const currentPublicSafetyRating =
    statUpdates.publicSafetyRating || cityStats.publicSafetyRating;

  // Overall Citizen Mood
  let moodChange = 0;
  if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) >= 2) moodChange++;
  if (ECONOMIC_OUTLOOK_LEVELS.indexOf(currentEconOutlook) <= 0) moodChange--;
  if (RATING_LEVELS.indexOf(currentPublicSafetyRating) >= 3) moodChange++;
  if (RATING_LEVELS.indexOf(currentPublicSafetyRating) <= 1) moodChange--;
  if (mayor?.attributes?.charisma > 7) moodChange += getRandomInt(0, 1);
  else if (mayor?.attributes?.charisma < 4) moodChange -= getRandomInt(0, 1);
  if (Math.random() < 0.1) moodChange += getRandomInt(-1, 1);

  if (moodChange !== 0) {
    const oldMood = cityStats.overallCitizenMood;
    const newMood = adjustStatLevel(oldMood, MOOD_LEVELS, moodChange);
    if (newMood !== oldMood) {
      statUpdates.overallCitizenMood = newMood;
      newsItems.push({
        headline: `Citizen Mood in ${campaign.startingCity.name} is now "${newMood}"`,
        summary: `Public sentiment has shifted. The current overall mood is described as ${newMood.toLowerCase()}.`,
        type: "city_stat_change",
        scope: "local",
        impact:
          MOOD_LEVELS.indexOf(newMood) > MOOD_LEVELS.indexOf(oldMood)
            ? "positive"
            : "negative",
      });
    }
  }

  // Education Quality, Infrastructure State, etc.
  const otherStatsToUpdate = [
    { key: "educationQuality", focus: "Education Quality" },
    { key: "infrastructureState", focus: "Infrastructure Development" },
    { key: "healthcareQuality", focus: "Healthcare Access" }, // Assuming focus string
    { key: "environmentRating", focus: "Environment & Sustainability" },
    { key: "cultureArtsRating", focus: "Culture & Recreation" },
  ];
  otherStatsToUpdate.forEach((statInfo) => {
    let change = 0;
    if (mayorPolicyFocus === statInfo.focus) {
      if (mayorIntelligence > 6) change += getRandomInt(1, 1);
      // Slightly less impact for non-primary focus
      else if (mayorIntelligence < 5) change -= getRandomInt(0, 1);
    } else if (Math.random() < 0.03) {
      // Reduced random chance
      change = getRandomInt(-1, 1);
    }
    if (change !== 0) {
      const oldStat = cityStats[statInfo.key];
      const newStat = adjustStatLevel(oldStat, RATING_LEVELS, change); // Assuming all use RATING_LEVELS
      if (newStat !== oldStat) statUpdates[statInfo.key] = newStat;
    }
  });
  return { statUpdates, newsItems };
};

/**
 * Simulates monthly player approval update.
 * @param {object} campaign - The current activeCampaign object (after city stat changes).
 * @returns {number | null} The new player approval value, or null if no change.
 */
export const simulateMonthlyPlayerApprovalUpdate = (campaign) => {
  const cityStats = campaign.startingCity?.stats;
  if (!cityStats) return null;

  const mayorOffice = campaign.governmentOffices.find(
    (off) =>
      off.officeNameTemplateId === "mayor" &&
      off.officeName.includes(campaign.startingCity.name)
  );
  const mayor = mayorOffice?.holder;
  const currentOverallCitizenMood = cityStats.overallCitizenMood;

  let approvalChangeFromMood = 0;
  const moodIndex = MOOD_LEVELS.indexOf(currentOverallCitizenMood);
  if (moodIndex !== -1)
    approvalChangeFromMood = [-2, -1, 0, 1, 2, 3][moodIndex] || 0;

  const currentApproval = campaign.playerApproval;
  let newPlayerApproval = currentApproval;

  if (mayor && mayor.isPlayer) {
    newPlayerApproval = Math.min(
      100,
      Math.max(
        0,
        (currentApproval || 50) + approvalChangeFromMood + getRandomInt(-1, 1)
      )
    );
  } else {
    newPlayerApproval = Math.min(
      100,
      Math.max(
        0,
        (currentApproval || 50) +
          getRandomInt(-1, 1) +
          Math.floor(approvalChangeFromMood / 2)
      )
    );
  }

  return newPlayerApproval !== currentApproval ? newPlayerApproval : null;
};

/**
 * Simulates AI policy proposals for the month.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {Array<object>} Array of { policyId, proposerId } for AI proposals.
 */
export const simulateAIPolicyProposals = (campaign, getFromStore) => {
  const proposalsToDispatch = []; // This will collect the final proposals to be sent to the game state

  if (
    !campaign?.governmentOffices ||
    !campaign.startingCity?.stats ||
    !campaign.currentDate
  ) {
    console.warn(
      "[SimulateAI] Campaign, government offices, city stats, or current date missing."
    );
    return proposalsToDispatch;
  }

  const availablePolicyDefinitionsFromStore =
    getFromStore().availablePoliciesForProposal || []; // Full policy definitions
  const activeLegislationFromStore = getFromStore().activeLegislation || [];

  let iterativelyUpdatedProposedLegislation = [
    ...(getFromStore().proposedLegislation || []),
  ];

  campaign.governmentOffices.forEach((office) => {
    if (office.members) {
      office.members.forEach((member) => {
        if (Math.random() < 0.15) {
          const aiPolitician = member.name;

          if (office.officeId != "city_council") return;
          const proposalDetailsFromAI = decideAIPolicyProposal(
            aiPolitician,
            availablePolicyDefinitionsFromStore.map((p) => p.id), // Pass only IDs
            campaign.startingCity.stats,
            activeLegislationFromStore, // Stable for this simulation pass
            iterativelyUpdatedProposedLegislation // THIS IS THE KEY CHANGE FOR INPUT
          );

          if (proposalDetailsFromAI && proposalDetailsFromAI.policyId) {
            // Find the full policy definition to get details like name, parameterDetails
            const policyDefinitionForProposal = CITY_POLICIES.find(
              (p) => p.id === proposalDetailsFromAI.policyId
            );

            if (!policyDefinitionForProposal) {
              console.warn(
                `[SimulateAI] Policy definition not found for ID: ${proposalDetailsFromAI.policyId} proposed by ${aiPolitician.name}`
              );
              return;
            }

            const newProposalObject = {
              id: `prop_${campaign.currentDate.year}_${
                campaign.currentDate.month
              }_${campaign.currentDate.day}_${
                proposalsToDispatch.length
              }_${Math.random().toString(16).slice(2)}`,
              policyId: proposalDetailsFromAI.policyId,
              proposerId: aiPolitician.id,
              chosenParameters: proposalDetailsFromAI.chosenParameters,

              // Details from the policy definition, crucial for other AIs to see what's being targeted:
              isParameterized: policyDefinitionForProposal.isParameterized,
              parameterDetails: policyDefinitionForProposal.parameterDetails,

              // Other useful info for game state:
              policyName: policyDefinitionForProposal.name,
              proposerName:
                aiPolitician.name || `Council Member ${aiPolitician.id}`,
              status: "proposed",
              dateProposed: { ...campaign.currentDate },
              councilVotesCast: {},
            };
            proposalsToDispatch.push(newProposalObject);
            iterativelyUpdatedProposedLegislation.push(newProposalObject);
          }
        }
      });
    } else if (
      office.holder &&
      !office.holder.isPlayer &&
      (office.officeId.includes("city_council") ||
        office.officeNameTemplateId === "mayor") &&
      Math.random() < 0.15 // AI decides to attempt a proposal
    ) {
      const aiPolitician = office.holder;

      // Pass the *iteratively updated* list of proposed legislation
      const proposalDetailsFromAI = decideAIPolicyProposal(
        aiPolitician,
        availablePolicyDefinitionsFromStore.map((p) => p.id), // Pass only IDs
        campaign.startingCity.stats,
        activeLegislationFromStore, // Stable for this simulation pass
        iterativelyUpdatedProposedLegislation // THIS IS THE KEY CHANGE FOR INPUT
      );

      if (proposalDetailsFromAI && proposalDetailsFromAI.policyId) {
        // Find the full policy definition to get details like name, parameterDetails
        const policyDefinitionForProposal = CITY_POLICIES.find(
          (p) => p.id === proposalDetailsFromAI.policyId
        );

        if (!policyDefinitionForProposal) {
          console.warn(
            `[SimulateAI] Policy definition not found for ID: ${proposalDetailsFromAI.policyId} proposed by ${aiPolitician.name}`
          );
          return;
        }

        const newProposalObject = {
          id: `prop_${campaign.currentDate.year}_${
            campaign.currentDate.month
          }_${campaign.currentDate.day}_${
            proposalsToDispatch.length
          }_${Math.random().toString(16).slice(2)}`,
          policyId: proposalDetailsFromAI.policyId,
          proposerId: aiPolitician.id,
          chosenParameters: proposalDetailsFromAI.chosenParameters,

          // Details from the policy definition, crucial for other AIs to see what's being targeted:
          isParameterized: policyDefinitionForProposal.isParameterized,
          parameterDetails: policyDefinitionForProposal.parameterDetails,

          // Other useful info for game state:
          policyName: policyDefinitionForProposal.name,
          proposerName:
            aiPolitician.name || `Council Member ${aiPolitician.id}`,
          status: "proposed",
          dateProposed: { ...campaign.currentDate },
          councilVotesCast: {},
        };
        proposalsToDispatch.push(newProposalObject);
        iterativelyUpdatedProposedLegislation.push(newProposalObject);
      }
    }
  });
  return proposalsToDispatch;
};

/**
 * Updates party popularity monthly.
 * @param {object} campaign - The current activeCampaign object.
 * @param {Function} getFromStore - The Zustand store's get function.
 * @returns {object} { newPoliticalLandscape: [...], newsItems: [...] }
 */
export const updateMonthlyPartyPopularity = (campaign, getFromStore) => {
  if (
    !campaign?.startingCity?.stats ||
    !campaign.startingCity?.politicalLandscape ||
    campaign.startingCity.politicalLandscape.length === 0
  ) {
    console.warn(
      "[MonthlyUtils] updateMonthlyPartyPopularity: Missing campaign data for popularity calculation."
    );
    return {
      newPoliticalLandscape: campaign?.startingCity?.politicalLandscape || [],
      newsItems: [],
    };
  }

  let politicalLandscapeCloned = JSON.parse(
    JSON.stringify(campaign.startingCity.politicalLandscape)
  );
  const cityStats = campaign.startingCity.stats;
  const mayorOffice = campaign.governmentOffices?.find(
    (off) =>
      off.officeNameTemplateId === "mayor" &&
      off.officeName.includes(campaign.startingCity.name)
  );
  const mayor = mayorOffice?.holder;
  const mayorPartyId = mayor?.partyId;

  // Attempt to get the mayor's party ideology from a central list of parties
  // This assumes `allParties` in your store contains both generated and custom parties with an 'ideology' field.
  const allParties = getFromStore().allParties || [
    ...(campaign.generatedPartiesSnapshot || []),
    ...(campaign.customPartiesSnapshot || []),
  ];
  const mayorPartyDetails = allParties.find((p) => p.id === mayorPartyId);
  const mayorPartyIdeology =
    mayorPartyDetails?.ideology || mayor?.calculatedIdeology; // Fallback to mayor's personal ideology

  const newsItems = [];
  let overallLandscapeChanged = false;

  politicalLandscapeCloned.forEach((party) => {
    let totalShift = getRandomInt(-25, 25) / 100; // Base random shift: +/- 0.25 pp
    const originalPopularity = party.popularity || 0;
    const isIncumbentParty =
      party.id === mayorPartyId &&
      mayorPartyId &&
      mayorPartyId.toLowerCase() !== "independent" &&
      !mayorPartyId.startsWith("independent_");

    // 1. Incumbent Party Effects
    if (isIncumbentParty) {
      const moodIndex = MOOD_LEVELS.indexOf(cityStats.overallCitizenMood);
      if (moodIndex !== -1)
        totalShift += [-0.6, -0.3, 0.0, 0.2, 0.4, 0.7][moodIndex] || 0; // Scaled mood impact

      const econOutlookIdx = ECONOMIC_OUTLOOK_LEVELS.indexOf(
        cityStats.economicOutlook
      );
      if (econOutlookIdx !== -1)
        totalShift += [-0.5, -0.25, 0.0, 0.3, 0.6][econOutlookIdx] || 0;

      if (cityStats.unemploymentRate > 8.0) totalShift -= 0.35;
      else if (cityStats.unemploymentRate < 4.5) totalShift += 0.25;

      if (mayorPartyIdeology) {
        const keyStatForIncumbent =
          determineKeyStatForIdeology(mayorPartyIdeology);
        const keyStatValue = cityStats[keyStatForIncumbent];
        if (keyStatValue && STAT_LEVEL_ARRAYS[keyStatForIncumbent]) {
          const statLevels = STAT_LEVEL_ARRAYS[keyStatForIncumbent];
          const keyStatIndex = statLevels.indexOf(keyStatValue);
          if (keyStatIndex !== -1) {
            const midPoint = Math.floor(statLevels.length / 2);
            const performanceShift = (keyStatIndex - midPoint) * 0.3; // Max +/-0.6 for 5 levels, +/-0.75 for 6
            totalShift += performanceShift;
            // console.log(`Incumbent ${party.name} (${mayorPartyIdeology}) key stat ${keyStatForIncumbent} is ${keyStatValue} (idx ${keyStatIndex}), perfShift: ${performanceShift.toFixed(2)}`);
          }
        }
      }
    }
    // 2. Opposition Party Effects
    else {
      totalShift += getRandomInt(-15, 15) / 100; // Smaller base random shift for opposition
      const moodIndex = MOOD_LEVELS.indexOf(cityStats.overallCitizenMood);
      const econOutlookIdx = ECONOMIC_OUTLOOK_LEVELS.indexOf(
        cityStats.economicOutlook
      );

      if (moodIndex <= 1) totalShift += getRandomInt(10, 30) / 100; // Frustrated or Very Unhappy
      if (econOutlookIdx <= 1) totalShift += getRandomInt(10, 25) / 100; // Stagnant or Recession
      if (cityStats.unemploymentRate > 7.0)
        totalShift += getRandomInt(5, 20) / 100;

      if (mayorPartyIdeology) {
        const incumbentKeyStat =
          determineKeyStatForIdeology(mayorPartyIdeology);
        const incumbentKeyStatValue = cityStats[incumbentKeyStat];
        if (incumbentKeyStatValue && STAT_LEVEL_ARRAYS[incumbentKeyStat]) {
          const statLevels = STAT_LEVEL_ARRAYS[incumbentKeyStat];
          const incumbentKeyStatIndex = statLevels.indexOf(
            incumbentKeyStatValue
          );

          if (incumbentKeyStatIndex <= 1) {
            // Incumbent is Poor or Very Poor on their key stat
            const oppositionPartyKeyStat = determineKeyStatForIdeology(
              party.ideology
            );
            if (oppositionPartyKeyStat === incumbentKeyStat) {
              totalShift += getRandomInt(30, 60) / 100; // Larger bonus if opposition focuses on incumbent's failure point
            } else {
              totalShift += getRandomInt(10, 25) / 100;
            }
          }
        }
      }
    }

    let cityIncome = cityStats.budget.totalAnnualIncome;
    // 3. Policy Alignment (Simplified)
    const recentMajorPolicies = getFromStore()
      .activeLegislation?.filter(
        (p) =>
          p.effectsApplied &&
          ((p.isParameterized &&
            p.chosenParameters &&
            Math.abs(p.chosenParameters[p.parameterDetails?.key || "amount"]) >
              cityIncome * 0.005) || // Impactful param policy
            (!p.isParameterized &&
              p.cost?.budget &&
              Math.abs(p.cost.budget) > cityIncome * 0.005) || // Impactful fixed cost
            p.tags?.includes("major_policy"))
      )
      .slice(-3); // Look at last 3 major policies whose effects were applied this month

    if (recentMajorPolicies) {
      recentMajorPolicies.forEach((policy) => {
        const policyDefinition = CITY_POLICIES.find(
          (pd) => pd.id === policy.policyId
        );
        if (policyDefinition) {
          const policyIdeologicalLeaning =
            policyDefinition.baseSupport?.[party.ideology] || 0;
          if (policyIdeologicalLeaning > 0.4)
            totalShift += 0.25 * policyIdeologicalLeaning;
          else if (policyIdeologicalLeaning < -0.4)
            totalShift -= 0.2 * Math.abs(policyIdeologicalLeaning);
        }
      });
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

  const normalizedLandscape = normalizePartyPopularities(
    politicalLandscapeCloned
  );

  normalizedLandscape.forEach((newPartyData) => {
    const originalParty = campaign.startingCity.politicalLandscape.find(
      (p) => p.id === newPartyData.id
    );
    if (originalParty) {
      const originalPop = originalParty.popularity || 0;
      const shift = newPartyData.popularity - originalPop;
      if (Math.abs(shift) > 1.5) {
        // Reduced threshold for news for more frequent updates
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
