import { CITY_POLICIES } from "../data/policyDefinitions";
import { RATING_LEVELS } from "../data/governmentData";
import { calculateAdultPopulation, getRandomInt } from "./core";

export const getServiceRatingDetails = (
  targetBudgetLine,
  cityStats,
  RATING_LEVELS_ARR
) => {
  if (!targetBudgetLine || !cityStats || !RATING_LEVELS_ARR)
    return {
      ratingIndex: -1,
      ratingString: null,
      statName: null,
      isValid: false,
    };
  let ratingString = null;
  let statName = null;
  const budgetLineToStatMap = {
    policeDepartment: "publicSafetyRating",
    fireDepartment: "fireSafetyRating",
    roadInfrastructure: "infrastructureRating",
    socialWelfarePrograms: "socialServicesRating",
    cityPlanningAndDevelopment: "developmentRating",
    publicTransit: "publicTransitRating",
    publicEducation: "educationRating",
    wasteManagement: "wasteManagementRating",
    parksAndRecreation: "parksAndRecreationRating",
    librariesAndCulture: "cultureAndArtsRating",
    publicHealthServices: "healthRating",
    generalAdministration: "governanceRating",
  };
  statName = budgetLineToStatMap[targetBudgetLine];
  if (statName && cityStats[statName]) ratingString = cityStats[statName];
  else if (
    targetBudgetLine === "cityPlanningAndDevelopment" &&
    cityStats.economicOutlook
  ) {
    statName = "economicOutlook";
    ratingString = cityStats.economicOutlook;
  } else if (
    targetBudgetLine === "wasteManagement" &&
    cityStats.environmentRating
  ) {
    statName = "environmentRating";
    ratingString = cityStats.environmentRating;
  }
  const ratingIndex = ratingString
    ? RATING_LEVELS_ARR.indexOf(ratingString)
    : -1;
  return { ratingIndex, ratingString, statName, isValid: ratingIndex !== -1 };
};

/**
 * Simulates a day of campaign activities for a single AI politician.
 * This function DECIDES actions and calls store actions to execute them.
 * Assumes AI politician's hours are already reset for the day before this is called.
 */
export const simulateAICampaignDayForPolitician = (
  initialAIPoliticianObject, // Accepts the pre-found object
  electionContext, // Accepts the pre-found election
  activeCampaign // The current campaign state for context
) => {
  // This function no longer calls store actions directly
  if (
    !initialAIPoliticianObject ||
    !electionContext ||
    initialAIPoliticianObject.isPlayer
  ) {
    return null;
  }

  const aiPoliticianId = initialAIPoliticianObject.id;

  // --- Initialize local variables for the simulation ---
  let hoursLeft = initialAIPoliticianObject.campaignHoursPerDay || 8;
  let fundsLeft = initialAIPoliticianObject.campaignFunds || 0;
  const actionsToCommit = []; // This will store the results of the simulation

  const city = activeCampaign.startingCity;
  const adultPopulation =
    calculateAdultPopulation(
      city?.population,
      city?.demographics?.ageDistribution
    ) || 1;

  // --- Loop up to a max number of actions per day ---
  const MAX_AI_ACTIONS_PER_DAY = getRandomInt(1, 3);
  for (let i = 0; i < MAX_AI_ACTIONS_PER_DAY; i++) {
    if (hoursLeft <= 0) {
      break; // Stop if the AI runs out of time
    }

    const currentNameRec = initialAIPoliticianObject.nameRecognition || 0;
    const currentVolunteers = initialAIPoliticianObject.volunteerCount || 0;
    const currentMediaBuzz = initialAIPoliticianObject.mediaBuzz || 0;
    const myPolling = initialAIPoliticianObject.polling || 0;

    // This array will hold all actions the AI could possibly take this turn
    let availableActions = [];

    // 1. Fundraising (if funds are low)
    const fundraisingHoursChoice = getRandomInt(2, Math.min(4, hoursLeft));
    if (fundsLeft < 10000 && hoursLeft >= fundraisingHoursChoice) {
      let score = 3.0 + (10000 - fundsLeft) / 2000;
      availableActions.push({
        name: "personalFundraisingActivity",
        score,
        hours: fundraisingHoursChoice,
      });
    }

    // 2. Name Recognition (Door Knocking or Public Appearance)
    const nameRecFraction = currentNameRec / adultPopulation;
    const doorKnockingHoursChoice = getRandomInt(2, Math.min(6, hoursLeft));
    if (nameRecFraction < 0.3 && hoursLeft >= doorKnockingHoursChoice) {
      let score = 2.5 + (0.3 - nameRecFraction) * 10 + currentVolunteers / 25;
      availableActions.push({
        name: "goDoorKnocking",
        score,
        hours: doorKnockingHoursChoice,
      });
    }

    const appearanceHoursChoice = getRandomInt(2, Math.min(4, hoursLeft));
    if (
      nameRecFraction < 0.5 &&
      fundsLeft >= 100 &&
      hoursLeft >= appearanceHoursChoice
    ) {
      let score = 1.5 + (0.5 - nameRecFraction) * 5;
      score +=
        ((initialAIPoliticianObject.attributes?.charisma || 5) - 5) * 0.2;
      if (currentMediaBuzz < 40) score += 0.5;
      availableActions.push({
        name: "makePublicAppearanceActivity",
        score,
        hours: appearanceHoursChoice,
      });
    }

    // 3. Rally
    const rallyHoursChoice = getRandomInt(3, Math.min(6, hoursLeft));
    const rallyCost = 500 + rallyHoursChoice * 150;
    if (
      nameRecFraction > 0.2 &&
      fundsLeft >= rallyCost &&
      currentVolunteers >= 5 * rallyHoursChoice &&
      hoursLeft >= rallyHoursChoice
    ) {
      let score = 1.0 + nameRecFraction * 2 + currentVolunteers / 50;
      score += ((initialAIPoliticianObject.attributes?.oratory || 5) - 5) * 0.3;
      availableActions.push({
        name: "holdRallyActivity",
        score,
        hours: rallyHoursChoice,
      });
    }

    // 4. Ad Blitz
    const adBlitzHoursChoice = getRandomInt(2, Math.min(4, hoursLeft));
    const adBlitzSpend = Math.min(fundsLeft * 0.1, getRandomInt(1000, 5000));
    if (
      fundsLeft > 1000 &&
      adBlitzSpend > 500 &&
      hoursLeft >= adBlitzHoursChoice
    ) {
      const opponents = Array.from(electionContext.candidates.values()).filter(
        (c) => c.id !== aiPoliticianId
      );

      const topOpponentPolling = Math.max(
        0,
        ...opponents.map((c) => c.polling || 0)
      );
      let score = 0.5;
      if (myPolling < topOpponentPolling - 5) score += 1.0;

      let adType = "positive";
      let targetId = null;
      if (
        myPolling < topOpponentPolling &&
        (initialAIPoliticianObject.attributes?.integrity || 5) >= 4 &&
        Math.random() < 0.4
      ) {
        adType = "attack";
        targetId = opponents.sort(
          (a, b) => (b.polling || 0) - (a.polling || 0)
        )[0]?.id;
      }
      availableActions.push({
        name: "launchManualAdBlitz",
        score,
        hours: adBlitzHoursChoice,
        params: { adType, targetId, spendAmount: adBlitzSpend },
      });
    }

    // 5. Recruit Volunteers
    const recruitHoursChoice = getRandomInt(1, Math.min(3, hoursLeft));
    if (
      currentVolunteers < adultPopulation * 0.002 &&
      hoursLeft >= recruitHoursChoice
    ) {
      let score = currentVolunteers < 20 ? 2.5 : 1.0;
      availableActions.push({
        name: "recruitVolunteers",
        score,
        hours: recruitHoursChoice,
      });
    }

    if (availableActions.length === 0) {
      break; // No possible actions, end the day for this AI
    }

    // --- Decide on the best action and record it ---
    availableActions.sort((a, b) => b.score - a.score);
    const chosenAction = availableActions[0];

    actionsToCommit.push({
      actionName: chosenAction.name,
      hoursSpent: chosenAction.hours,
      params: chosenAction.params || {},
    });

    // Update local variables for the *next potential action in the same day*
    hoursLeft -= chosenAction.hours;
    if (chosenAction.name === "launchManualAdBlitz") {
      fundsLeft -= chosenAction.params.spendAmount;
    }
  }

  // --- Return the collected results for batch processing ---
  if (actionsToCommit.length > 0) {
    return {
      politicianId: aiPoliticianId,
      dailyResults: actionsToCommit,
    };
  }

  return null; // Return null if no actions were taken
};
