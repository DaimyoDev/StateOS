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
  allPartiesInScope,
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
  const chosenParty = forcePartyId
    ? allPartiesInScope.find((p) => p.id === forcePartyId)
    : getRandomElement(allPartiesInScope);

  const partyId = chosenParty?.id || "independent";
  const partyName = chosenParty?.name || "Independent";
  const partyColor = chosenParty?.color || "#888888";

  const fullName = generateAICandidateNameForElection(countryId);
  const nameParts = fullName.split(" ");
  const firstName = forceFirstName || nameParts[0];
  const lastName = forceLastName || nameParts.slice(1).join(" ");

  const policyStances = {};
  (policyQuestionsData || []).forEach((question) => {
    if (question.options && question.options.length > 0) {
      policyStances[question.id] = getRandomElement(question.options).value;
    }
  });

  const { ideologyName: calculatedIdeology, scores: ideologyScores } =
    calculateIdeologyFromStances(
      policyStances,
      policyQuestionsData,
      ideologyData,
      chosenParty?.ideologyScores
    );

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
