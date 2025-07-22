// src/entities/personnel.js
// This file consolidates the creation and generation logic for personnel entities like politicians and parties.

// NOTE: Import paths will need to be updated once the refactoring is complete.
import {
  NAMES_BY_COUNTRY,
  GENERIC_FIRST_NAMES_MALE,
  GENERIC_FIRST_NAMES_FEMALE,
  GENERIC_LAST_NAMES,
} from "../data/namesData.js";
import {
  BASE_IDEOLOGIES,
  IDEOLOGY_KEYWORDS,
  GENERIC_ADJECTIVES,
  GENERIC_NOUNS,
  ABSTRACT_NOUNS,
  IDEOLOGY_DEFINITIONS,
} from "../data/ideologiesData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { generateId, getRandomElement, getRandomInt } from "../utils/core.js";
import { calculateInitialPolling } from "../General Scripts/PollingFunctions.js";

// --- Ideology Calculation ---

/**
 * Calculates the squared Euclidean distance between two ideology score objects.
 * @param {object} scoresA - The first set of ideology scores.
 * @param {object} scoresB - The second set of ideology scores.
 * @returns {number} The squared distance, or Infinity if inputs are invalid.
 */
function calculateIdeologyDistance(scoresA, scoresB) {
  if (
    !scoresA ||
    !scoresB ||
    typeof scoresA !== "object" ||
    typeof scoresB !== "object"
  ) {
    console.error("Invalid scores provided to calculateIdeologyDistance", {
      scoresA,
      scoresB,
    });
    return Infinity;
  }
  let distanceSquared = 0;
  const allAxes = new Set([...Object.keys(scoresA), ...Object.keys(scoresB)]);

  for (const axis of allAxes) {
    const scoreA = scoresA[axis] || 0;
    const scoreB = scoresB[axis] || 0;
    const diff = scoreA - scoreB;
    distanceSquared += diff * diff;
  }

  if (!isFinite(distanceSquared)) {
    console.error("Distance calculation resulted in a non-finite number.", {
      scoresA,
      scoresB,
    });
    return Infinity;
  }
  return distanceSquared;
}

/**
 * Ensures all party objects in an array have their ideologyScores populated
 * based on their ideology string. This is a crucial pre-processing step.
 * @param {Array} parties - The array of party objects.
 * @param {object} ideologyData - The full IDEOLOGY_DEFINITIONS object from ideologiesData.js.
 * @returns {Array} The updated array of parties with scores attached.
 */
export function initializePartyIdeologyScores(parties, ideologyData) {
  if (!Array.isArray(parties)) {
    console.error(
      "initializePartyIdeologyScores expected an array, but received:",
      parties
    );
    return [];
  }

  return parties.map((party) => {
    if (party.ideologyScores) return party; // Already has scores, do nothing.

    if (party.ideology && typeof party.ideology === "string") {
      const ideologyId = party.ideology.toLowerCase().replace(/ /g, "_");

      if (ideologyData[ideologyId]) {
        return {
          ...party,
          ideologyId: ideologyId, // Add the ID for consistency
          ideologyScores: ideologyData[ideologyId].idealPoint, // <-- The critical step
        };
      }
    }
    console.warn(
      `Could not find ideology definition for party: "${party.name}"`
    );
    return party;
  });
}

/**
 * Calculates a politician's ideology based on their policy stances.
 * This is a pure function, moved here from politicianSlice.js for centralized logic.
 * @param {object} stances - A map of policy question IDs to answer values.
 * @param {Array} policyQuestionsData - The full POLICY_QUESTIONS data.
 * @param {object} ideologyData - The full IDEOLOGY_DEFINITIONS data.
 * @param {object|null} initialScores - Optional pre-calculated scores to use instead of calculating from stances.
 * @returns {{ideologyName: string, scores: object}} The calculated ideology and detailed axis scores.
 */
export function calculateIdeologyFromStances(
  stances,
  policyQuestionsData,
  ideologyData,
  initialScores = null
) {
  const AXES = [
    "economic",
    "social_traditionalism",
    "sovereignty",
    "ecology",
    "theocratic",
    "digitalization",
    "personal_liberty",
    "authority_structure",
    "state_intervention_scope",
    "societal_focus",
    "rural_priority",
    "governance_approach",
  ];
  let normalizedScores = {};

  if (initialScores) {
    normalizedScores = { ...initialScores };
  } else {
    stances = stances || {};
    const currentScores = {};
    const questionsWithNonZeroEffectOnAxis = {};
    AXES.forEach((axis) => {
      currentScores[axis] = 0;
      questionsWithNonZeroEffectOnAxis[axis] = 0;
    });
    let totalQuestionsWithAnyEffectAnswered = 0;

    policyQuestionsData.forEach((pq) => {
      const selectedOptionValue = stances[pq.id];
      if (selectedOptionValue) {
        const selectedOptionData = (pq.options || []).find(
          (opt) => opt && opt.value === selectedOptionValue
        );
        const effects =
          selectedOptionData?.axis_effects ||
          selectedOptionData?.ideologyEffect;
        if (effects && typeof effects === "object") {
          let questionContributed = false;
          AXES.forEach((axis) => {
            const effectValue = effects[axis];
            if (typeof effectValue === "number") {
              currentScores[axis] += effectValue;
              if (effectValue !== 0) {
                questionsWithNonZeroEffectOnAxis[axis]++;
                questionContributed = true;
              }
            }
          });
          if (questionContributed) {
            totalQuestionsWithAnyEffectAnswered++;
          }
        }
      }
    });

    if (totalQuestionsWithAnyEffectAnswered === 0) {
      AXES.forEach((axis) => (normalizedScores[axis] = 0));
    } else {
      AXES.forEach((axis) => {
        normalizedScores[axis] =
          questionsWithNonZeroEffectOnAxis[axis] > 0
            ? currentScores[axis] / questionsWithNonZeroEffectOnAxis[axis]
            : 0;
      });
    }
  }

  let determinedIdeologyName = "Centrist";
  let minDistanceSquared = Infinity;
  for (const ideologyDef of Object.values(ideologyData)) {
    if (!ideologyDef.idealPoint) continue;
    let distanceSquared = 0;
    AXES.forEach((axis) => {
      const idealAxisScore = ideologyDef.idealPoint[axis] || 0;
      const diff = (normalizedScores[axis] || 0) - idealAxisScore;
      distanceSquared += diff * diff;
    });
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      determinedIdeologyName = ideologyDef.name;
    }
  }

  const averageAbsoluteScore =
    AXES.reduce((sum, axis) => sum + Math.abs(normalizedScores[axis] || 0), 0) /
    AXES.length;
  if (averageAbsoluteScore < 0.25) {
    determinedIdeologyName = "Centrist";
  }

  return { ideologyName: determinedIdeologyName, scores: normalizedScores };
}

// --- Name Generation ---

/**
 * Generates a random AI candidate name based on country context.
 * @param {string} countryId - The ID of the country (e.g., "JPN", "USA").
 * @returns {string} A randomly generated name.
 */
export const generateAICandidateNameForElection = (countryId) => {
  const countryNameData = NAMES_BY_COUNTRY[countryId];
  let firstNamesMale = GENERIC_FIRST_NAMES_MALE;
  let firstNamesFemale = GENERIC_FIRST_NAMES_FEMALE;
  let lastNames = GENERIC_LAST_NAMES;
  let selectedFirstNamePool;

  if (countryNameData) {
    firstNamesMale =
      countryNameData.male?.length > 0
        ? countryNameData.male
        : GENERIC_FIRST_NAMES_MALE;
    firstNamesFemale =
      countryNameData.female?.length > 0
        ? countryNameData.female
        : GENERIC_FIRST_NAMES_FEMALE;
    lastNames =
      countryNameData.last?.length > 0
        ? countryNameData.last
        : GENERIC_LAST_NAMES;
  }

  if (Math.random() < 0.5 && firstNamesMale.length > 0) {
    selectedFirstNamePool = firstNamesMale;
  } else {
    selectedFirstNamePool =
      firstNamesFemale.length > 0 ? firstNamesFemale : firstNamesMale;
  }

  if (
    !selectedFirstNamePool ||
    selectedFirstNamePool.length === 0 ||
    lastNames.length === 0
  ) {
    return "AI Candidate";
  }

  const firstName = getRandomElement(selectedFirstNamePool);
  const lastName = getRandomElement(lastNames);
  return `${firstName} ${lastName}`;
};

/**
 * Generates a plausible and varied political party name.
 * @param {string} baseIdeologyName - The base ideology (e.g., "Conservative").
 * @param {string} countryName - The name of the country (e.g., "Japan").
 * @returns {string} A generated party name.
 */
export function generateNewPartyName(baseIdeologyName, countryName) {
  const roll = Math.random();
  const ideologySpecificWords =
    IDEOLOGY_KEYWORDS[baseIdeologyName] ||
    IDEOLOGY_KEYWORDS["Default"].concat(baseIdeologyName);
  const nameTemplates = [
    () => [getRandomElement(ideologySpecificWords), "Party"],
    () => [
      getRandomElement(GENERIC_ADJECTIVES),
      getRandomElement(ideologySpecificWords),
      getRandomElement(GENERIC_NOUNS),
    ],
    () => [
      getRandomElement(ideologySpecificWords),
      getRandomElement(GENERIC_NOUNS),
    ],
    () => [
      countryName,
      getRandomElement(ideologySpecificWords),
      getRandomElement(["Party", "Union", "Alliance"]),
    ],
    () => [
      getRandomElement(GENERIC_ADJECTIVES),
      getRandomElement(ABSTRACT_NOUNS),
      getRandomElement(GENERIC_NOUNS),
    ],
    () => [getRandomElement(ABSTRACT_NOUNS), "of", countryName],
    () => [
      "The",
      getRandomElement(ideologySpecificWords),
      getRandomElement(ABSTRACT_NOUNS),
    ],
    () => [getRandomElement(GENERIC_ADJECTIVES), baseIdeologyName, "Party"],
  ];

  const nameParts = nameTemplates[Math.floor(roll * nameTemplates.length)]();
  const finalName = nameParts.filter(Boolean).join(" ");
  const words = finalName.split(" ");
  const uniqueConsecutiveWords = words.filter(
    (word, i) => i === 0 || word.toLowerCase() !== words[i - 1].toLowerCase()
  );

  return (
    uniqueConsecutiveWords.join(" ").trim() ||
    `${getRandomElement(GENERIC_ADJECTIVES)} ${baseIdeologyName} Party`
  );
}

// --- Politician Generation ---

/**
 * Generates a complete, new AI politician object with all nested data.
 * This is the main factory function for creating an AI character.
 */
export function generateFullAIPolitician(
  countryId,
  allPartiesInScope, // IMPORTANT: This should be the array AFTER running initializePartyIdeologyScores
  policyQuestionsData = POLICY_QUESTIONS,
  ideologyData = IDEOLOGY_DEFINITIONS,
  forcePartyId = null,
  forceFirstName = null,
  forceLastName = null,
  isIncumbent = false,
  electorateIdeologyCenter = null,
  electorateIdeologySpread = null,
  electorateIssueStances = null
) {
  // --- STEP 1: Determine a Target Ideology ---
  let targetIdeology;
  if (forcePartyId) {
    const forcedParty = allPartiesInScope.find((p) => p.id === forcePartyId);
    targetIdeology =
      ideologyData[forcedParty?.ideologyId] ||
      getRandomElement(Object.values(ideologyData));
  } else {
    const ideologyWeights = allPartiesInScope
      .map((p) => p.ideologyId)
      .filter(Boolean);
    const randomIdeologyId = getRandomElement(
      ideologyWeights.length > 0 ? ideologyWeights : Object.keys(ideologyData)
    );
    targetIdeology = ideologyData[randomIdeologyId];
  }
  const targetIdealPoint = targetIdeology.idealPoint;

  // --- STEP 2: Generate Coherent Policy Stances with "Smarter" Deviation ---
  const policyStances = {};
  policyQuestionsData.forEach((question) => {
    if (question.options && question.options.length > 0) {
      const sortedOptions = question.options
        .map((option) => {
          const effects = option.axis_effects || option.ideologyEffect;
          if (!effects) return { option, distance: Infinity };
          const distance = calculateIdeologyDistance(targetIdealPoint, effects);
          return { option, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      const bestOption = sortedOptions[0]?.option;
      const secondBestOption = sortedOptions[1]?.option;
      const thirdBestOption = sortedOptions[2]?.option;

      const roll = Math.random();
      if (bestOption && roll < 0.9) {
        // 90% chance of picking the best option
        policyStances[question.id] = bestOption.value;
      } else if (secondBestOption && roll < 0.98) {
        // 8% chance of picking the second best
        policyStances[question.id] = secondBestOption.value;
      } else if (thirdBestOption) {
        // 2% chance of picking the third best
        policyStances[question.id] = thirdBestOption.value;
      } else {
        policyStances[question.id] = bestOption
          ? bestOption.value
          : getRandomElement(question.options).value;
      }
    }
  });

  // Calculate the politician's actual ideology from their generated stances
  const { ideologyName: calculatedIdeology, scores: ideologyScores } =
    calculateIdeologyFromStances(
      policyStances,
      policyQuestionsData,
      ideologyData
    );

  // --- STEP 3: Assign Party Based on Ideological Fit ---
  let chosenParty = null;

  if (forcePartyId) {
    chosenParty = allPartiesInScope.find((p) => p.id === forcePartyId);
  } else {
    // If no party is forced, find the best ideological match.
    let bestPartyFitDistance = Infinity;
    const INDEPENDENT_THRESHOLD = 25.0;

    allPartiesInScope.forEach((party) => {
      if (party.ideologyScores) {
        const distance = calculateIdeologyDistance(
          ideologyScores,
          party.ideologyScores
        );
        if (distance < bestPartyFitDistance) {
          bestPartyFitDistance = distance;
          chosenParty = party;
        }
      }
    });

    // Only run the distance check here, inside the else block.
    if (chosenParty && bestPartyFitDistance > INDEPENDENT_THRESHOLD) {
      chosenParty = null;
    }
  }

  const partyId = chosenParty?.id || "independent";
  const partyName = chosenParty?.name || "Independent";
  const partyColor = chosenParty?.color || "#888888";

  const fullName = generateAICandidateNameForElection(countryId);
  const nameParts = fullName.split(" ");
  const firstName = forceFirstName || nameParts[0];
  const lastName = forceLastName || nameParts.slice(1).join(" ");

  const attributes = {
    charisma: getRandomInt(3, 8),
    integrity: getRandomInt(2, 7),
    intelligence: getRandomInt(4, 9),
    negotiation: getRandomInt(3, 8),
    oratory: getRandomInt(3, 8),
    fundraising: getRandomInt(2, 7),
  };

  const career = getRandomElement([
    "Lawyer",
    "Business Owner",
    "Community Organizer",
    "Teacher",
    "Local Bureaucrat",
    "Academic",
  ]);
  const education = getRandomElement([
    "High School Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
  ]);
  const background = {
    education,
    career,
    narrative: `A dedicated public servant with a focus on community values. Hopes to bring positive change through collaboration after a career as a ${career.toLowerCase()}.`,
  };

  const newPolitician = {
    id: `ai_pol_${generateId()}`,
    firstName,
    lastName,
    name: fullName,
    age: getRandomInt(35, 70),
    attributes,
    policyStances,
    background,
    calculatedIdeology,
    ideologyScores,
    partyId,
    partyName,
    partyColor,
    isIncumbent,
    isPlayer: false,
    politicalCapital: getRandomInt(5, 30),
    nameRecognition: isIncumbent
      ? getRandomInt(15000, 75000)
      : getRandomInt(500, 15000),
    treasury: getRandomInt(5000, 50000),
    campaignFunds: isIncumbent
      ? getRandomInt(10000, 75000)
      : getRandomInt(500, 10000),
    approvalRating: getRandomInt(35, 60),
    mediaBuzz: getRandomInt(0, 20),
    partySupport: partyName !== "Independent" ? getRandomInt(30, 75) : 0,
    currentOffice: null,
    campaignHoursPerDay: getRandomInt(6, 10),
    campaignHoursRemainingToday: 0,
    hiredStaff: [],
    volunteerCount: isIncumbent ? getRandomInt(10, 50) : getRandomInt(0, 15),
    advertisingBudgetMonthly: 0,
    currentAdStrategy: { focus: "none", targetId: null, intensity: 0 },
    isInCampaign: false,
  };

  const calculatedPolling = calculateInitialPolling(
    newPolitician,
    countryId,
    allPartiesInScope,
    policyQuestionsData,
    ideologyData,
    electorateIdeologyCenter,
    electorateIdeologySpread,
    electorateIssueStances
  );
  newPolitician.polling = calculatedPolling.totalScore;

  return newPolitician;
}
