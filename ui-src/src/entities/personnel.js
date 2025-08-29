// src/entities/personnel.js
import {
  NAMES_BY_COUNTRY,
  GENERIC_FIRST_NAMES_MALE,
  GENERIC_FIRST_NAMES_FEMALE,
  GENERIC_LAST_NAMES,
} from "../data/namesData.js";
import {
  IDEOLOGY_KEYWORDS,
  GENERIC_ADJECTIVES,
  GENERIC_NOUNS,
  ABSTRACT_NOUNS,
  IDEOLOGY_DEFINITIONS,
  BASE_IDEOLOGIES,
} from "../data/ideologiesData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import {
  distributeValueProportionally,
  generateId,
  getRandomElement,
  getRandomInt,
} from "../utils/core.js";
import { calculateInitialPollingOptimized } from "../General Scripts/OptimizedPollingFunctions.js";
import { generateNuancedColor } from "../utils/generalUtils.js";
import { generatePartyLogo } from "../utils/logoGenerator.js";
import { useGameStore } from "../store.js";

/**
 * Creates a new non-elected staff member object.
 * @param {object} params - The parameters for the staff member.
 * @returns {object} A new staff member object.
 */
export const createPartyStaffObject = (params = {}) => ({
  id: `staff_${generateId()}`,
  name: params.name || "Staff Member",
  role: params.role || "Analyst",
  attributes: params.attributes || {
    loyalty: getRandomInt(30, 90),
    strategy: getRandomInt(40, 90),
    communication: getRandomInt(40, 90),
  },
  partyId: params.partyId || null,
});

export const politicians = {
  base: new Map(),
  attributes: new Map(),
  policyStances: new Map(),
  ideologyScores: new Map(),
  state: new Map(),
  finances: new Map(),
  background: new Map(),
  campaign: new Map(),
  staff: new Map(),
};

export const addPolitician = (politicianData) => {
  const { id } = politicianData;
  if (!id) {
    console.error("Cannot add politician without an ID.");
    return;
  }

  politicians.base.set(id, {
    id: politicianData.id,
    firstName: politicianData.firstName,
    lastName: politicianData.lastName,
    name: politicianData.name,
    age: politicianData.age,
    sex: politicianData.sex,
    isPlayer: politicianData.isPlayer,
    partyId: politicianData.partyId,
    factionId: politicianData.factionId,
    currentOffice: politicianData.currentOffice,
    partyName: politicianData.partyName,
    partyColor: politicianData.partyColor,
    calculatedIdeology: politicianData.calculatedIdeology,
  });

  politicians.attributes.set(id, politicianData.attributes);

  const stancesMap = new Map(
    Object.entries(politicianData.policyStances || {})
  );
  politicians.policyStances.set(id, stancesMap);

  politicians.ideologyScores.set(id, politicianData.ideologyScores);

  politicians.state.set(id, {
    politicalCapital: politicianData.politicalCapital,
    nameRecognition: politicianData.nameRecognition,
    approvalRating: politicianData.approvalRating,
    mediaBuzz: politicianData.mediaBuzz,
    partySupport: politicianData.partySupport,
    polling: politicianData.polling,
  });

  politicians.finances.set(id, {
    treasury: politicianData.treasury,
    campaignFunds: politicianData.campaignFunds,
    advertisingBudgetMonthly: politicianData.advertisingBudgetMonthly,
  });

  politicians.background.set(id, politicianData.background);

  politicians.campaign.set(id, {
    isInCampaign: politicianData.isInCampaign,
    campaignHoursPerDay: politicianData.campaignHoursPerDay,
    volunteerCount: politicianData.volunteerCount,
    currentAdStrategy: politicianData.currentAdStrategy,
  });

  politicians.staff.set(
    id,
    politicianData.hiredStaff.map((staff) => staff.id)
  );
};

/**
 * Re-hydrates a full politician object from the SoA data stores.
 * @param {string} politicianId - The ID of the politician to re-hydrate.
 * @param {object} soaStore - The Structure of Arrays store for politicians (e.g., activeCampaign.politicians).
 * @returns {object|null} The re-hydrated politician object or null if not found.
 */
export const rehydratePolitician = (politicianId, soaStore) => {
  if (!politicianId || !soaStore?.base?.has(politicianId)) {
    return null;
  }

  const base = soaStore.base.get(politicianId);
  const attributes = soaStore.attributes.get(politicianId) || {};
  const policyStances = soaStore.policyStances.get(politicianId) || new Map();
  const ideologyScores = soaStore.ideologyScores.get(politicianId) || {};
  const state = soaStore.state.get(politicianId) || {};
  const finances = soaStore.finances.get(politicianId) || {};
  const background = soaStore.background.get(politicianId) || {};
  const campaign = soaStore.campaign.get(politicianId) || {};
  const staff = soaStore.staff.get(politicianId) || [];

  return {
    ...base,
    attributes,
    policyStances: policyStances instanceof Map ? Object.fromEntries(policyStances) : (policyStances || {}),
    ideologyScores,
    ...state,
    ...finances,
    background,
    ...campaign,
    hiredStaff: staff,
  };
};

/**
 * Creates a lean, focused campaign object for a politician,
 * containing only the data needed for the daily AI simulation.
 * @param {string} politicianId - The ID of the politician.
 * @param {object} soaStore - The main politician SoA store.
 * @returns {object|null} A lean object for campaign simulation.
 */
export const rehydrateLeanCampaigner = (politicianId, soaStore) => {
  if (!politicianId || !soaStore?.base?.has(politicianId)) {
    return null;
  }

  // Get only the necessary data slices from the SoA store
  const base = soaStore.base.get(politicianId);
  const attributes = soaStore.attributes.get(politicianId) || {};
  const state = soaStore.state.get(politicianId) || {};
  const finances = soaStore.finances.get(politicianId) || {};
  const campaign = soaStore.campaign.get(politicianId) || {};

  // Combine them into a single, flat object
  return {
    id: base.id,
    isPlayer: base.isPlayer,
    attributes,
    campaignHoursPerDay: campaign.campaignHoursPerDay,
    campaignFunds: finances.campaignFunds,
    nameRecognition: state.nameRecognition,
    volunteerCount: campaign.volunteerCount,
    mediaBuzz: state.mediaBuzz,
    polling: state.polling,
  };
};

export const createPartyObject = (params = {}) => ({
  id: params.id || `party_${generateId()}`,
  name: params.name || "New Party",
  shortName: params.shortName || "",
  countryId: params.countryId || null,
  ideology: params.ideology || "Centrist",
  ideologyId: params.ideologyId || "centrist",
  ideologyScores: params.ideologyScores || {},
  policyStances: params.policyStances || {},
  color: params.color || "#CCCCCC",
  logoDataUrl: params.logoDataUrl || null,
  foundingYear: params.foundingYear || new Date().getFullYear(),
  nationalPopularity: params.nationalPopularity || 0,
  regionalPopularity: params.regionalPopularity || {},
  leadership: params.leadership || {
    chairperson: null,
    commsDirector: null,
  },
  memberIds: new Set(),
  financialStanding: params.financialStanding || 0,
  mediaBias: params.mediaBias || 0,
  platform: params.platform || [],
  factions: params.factions,
});

export const createFactionObject = (params = {}) => ({
  id: `faction_${generateId()}`,
  name: params.name || "Unnamed Faction",
  ideology: params.ideology || "Centrism",
  influence: params.influence || getRandomInt(10, 40),
  leader: params.leader || null,
  memberIds: new Set(),
  policyStances: params.policyStances || {},
});

/**
 * Calculates the squared Euclidean distance between two ideology score objects.
 * @param {object} scoresA - The first set of ideology scores.
 * @param {object} scoresB - The second set of ideology scores.
 * @returns {number} The squared distance, or Infinity if inputs are invalid.
 */
export function calculateIdeologyDistance(scoresA, scoresB) {
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

export const calculateAggregateStances = (politicians) => {
  const aggregate = {};
  if (!politicians || politicians.length === 0) return aggregate;

  POLICY_QUESTIONS.forEach((pq) => {
    const stanceCounts = {};
    politicians.forEach((p) => {
      const stance = p.policyStances[pq.id];
      if (stance) {
        stanceCounts[stance] = (stanceCounts[stance] || 0) + 1;
      }
    });

    if (Object.keys(stanceCounts).length > 0) {
      const mostCommonStance = Object.keys(stanceCounts).reduce((a, b) =>
        stanceCounts[a] > stanceCounts[b] ? a : b
      );
      aggregate[pq.id] = mostCommonStance;
    }
  });
  return aggregate;
};

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
    // If scores already exist, do nothing.
    if (party.ideologyScores && Object.keys(party.ideologyScores).length > 0) {
      return party;
    }

    // Prioritize using the explicit party.ideologyId if it exists. This is more robust
    // than converting the name and avoids "name mismatch" errors.
    const partyIdeologyId = party.ideologyId;
    if (partyIdeologyId && ideologyData[partyIdeologyId]) {
      return {
        ...party,
        ideologyScores: ideologyData[partyIdeologyId].idealPoint,
      };
    }

    // Fallback for older party objects that might only have the name.
    if (party.ideology && typeof party.ideology === "string") {
      const ideologyIdFromName = party.ideology
        .toLowerCase()
        .replace(/ /g, "_");
      if (ideologyData[ideologyIdFromName]) {
        return {
          ...party,
          ideologyId: ideologyIdFromName, // Add the ID for consistency
          ideologyScores: ideologyData[ideologyIdFromName].idealPoint,
        };
      }
    }

    return {
      ...party,
      ideologyScores: ideologyData["centrist"]?.idealPoint || {},
    };
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

const ETHNICITY_TO_NAME_MAPPING = {
  Hispanic: ["ESP", "MEX"],
  Asian: ["JPN", "KOR", "PHL"],
  European: ["FRA", "ENG", "GER", "ITA"],
};

/**
 * OVERHAULED: Generates a random AI candidate name based on country context and demographics.
 * This version is fully dynamic and does not hardcode any country IDs.
 * @param {string} countryId - The ID of the country (e.g., "JPN", "USA").
 * @param {object} [demographics] - Optional demographic data for the region/country, including an 'ethnicities' object.
 * @returns {string} A randomly generated name.
 */
export const generateAICandidateNameForElection = (countryId, demographics) => {
  const primaryNameData = NAMES_BY_COUNTRY[countryId];

  // Fallback if no specific name data exists for the country
  if (!primaryNameData) {
    const firstName =
      Math.random() < 0.5
        ? getRandomElement(GENERIC_FIRST_NAMES_MALE)
        : getRandomElement(GENERIC_FIRST_NAMES_FEMALE);
    const lastName = getRandomElement(GENERIC_LAST_NAMES);
    return `${firstName} ${lastName}`;
  }

  let firstNamePool, lastNamePool;
  let namePoolCountryId = countryId; // Start with the primary country

  // If demographic data is provided, use it to select a name pool
  if (demographics?.ethnicities) {
    const ethnicities = Object.entries(demographics.ethnicities);
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const [ethnicity, percentage] of ethnicities) {
      if (roll < (cumulative += percentage)) {
        const mappedNameKeys = ETHNICITY_TO_NAME_MAPPING[ethnicity];
        if (mappedNameKeys) {
          namePoolCountryId = getRandomElement(mappedNameKeys);
        }
        // If not mapped, it will default to the primary country ID.
        break;
      }
    }
  }

  const selectedNameData =
    NAMES_BY_COUNTRY[namePoolCountryId] || primaryNameData;
  firstNamePool =
    Math.random() < 0.5 ? selectedNameData.male : selectedNameData.female;

  // Dynamic logic for last names to create mixed-heritage names
  // If we selected a name pool from a different culture (e.g., a Japanese first name in the USA),
  // there's a high chance of using a last name from the primary country.
  if (namePoolCountryId !== countryId && Math.random() < 0.85) {
    lastNamePool = primaryNameData.last;
  } else {
    lastNamePool = selectedNameData.last;
  }

  // Final check to ensure pools are valid
  if (!firstNamePool || firstNamePool.length === 0) {
    firstNamePool =
      Math.random() < 0.5
        ? GENERIC_FIRST_NAMES_MALE
        : GENERIC_FIRST_NAMES_FEMALE;
  }
  if (!lastNamePool || lastNamePool.length === 0) {
    lastNamePool = GENERIC_LAST_NAMES;
  }

  const firstName = getRandomElement(firstNamePool);
  const lastName = getRandomElement(lastNamePool);

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
  options = {}
) {
  const {
    regionId = null,
    cityId = null,
    forcePartyId = null,
    isIncumbent = false,
    electorateIdeologyCenter = null,
    electorateIdeologySpread = null,
    electorateIssueStances = null,
  } = options;

  // --- STEP 1: Determine a Target Ideology ---
  let targetIdeology;
  if (forcePartyId) {
    const forcedParty = allPartiesInScope.find((p) => p.id === forcePartyId);
    targetIdeology =
      IDEOLOGY_DEFINITIONS[forcedParty?.ideologyId] ||
      getRandomElement(Object.values(IDEOLOGY_DEFINITIONS));
  } else {
    const ideologyWeights = allPartiesInScope
      .map((p) => p.ideologyId)
      .filter(Boolean);
    const randomIdeologyId = getRandomElement(
      ideologyWeights.length > 0
        ? ideologyWeights
        : Object.keys(IDEOLOGY_DEFINITIONS)
    );
    targetIdeology = IDEOLOGY_DEFINITIONS[randomIdeologyId];
  }
  const targetIdealPoint = targetIdeology.idealPoint;

  // --- STEP 2: Generate Coherent Policy Stances with "Smarter" Deviation ---
  const policyStances = {};
  POLICY_QUESTIONS.forEach((question) => {
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
      POLICY_QUESTIONS,
      IDEOLOGY_DEFINITIONS
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

  let chosenFactionId = null;
  if (chosenParty && chosenParty.factions && chosenParty.factions.length > 0) {
    let bestFactionFit = { id: null, distance: Infinity };
    chosenParty.factions.forEach((faction) => {
      // Use the faction leader's ideology as a proxy for the faction's center
      if (faction.leader?.ideologyScores) {
        const distance = calculateIdeologyDistance(
          ideologyScores,
          faction.leader.ideologyScores
        );
        if (distance < bestFactionFit.distance) {
          bestFactionFit = { id: faction.id, distance };
        }
      }
    });
    chosenFactionId = bestFactionFit.id;
  }

  const fullName = useGameStore.getState().actions.generateDynamicName({
    countryId,
    regionId,
    cityId,
  });

  const nameParts = fullName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const attributes = {
    charisma: getRandomInt(30, 80),
    integrity: getRandomInt(20, 70),
    intelligence: getRandomInt(40, 90),
    negotiation: getRandomInt(30, 80),
    oratory: getRandomInt(30, 80),
    fundraising: getRandomInt(20, 70),
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
    campaignHoursRemainingToday: 8,
    hiredStaff: [],
    volunteerCount: isIncumbent ? getRandomInt(10, 50) : getRandomInt(0, 15),
    advertisingBudgetMonthly: 0,
    currentAdStrategy: { focus: "none", targetId: null, intensity: 0 },
    isInCampaign: false,
    factionId: chosenFactionId,
  };

  const calculatedPolling = calculateInitialPollingOptimized(
    newPolitician,
    countryId,
    allPartiesInScope,
    POLICY_QUESTIONS,
    IDEOLOGY_DEFINITIONS,
    electorateIdeologyCenter,
    electorateIdeologySpread,
    electorateIssueStances
  );
  newPolitician.polling = calculatedPolling.totalScore;

  return newPolitician;
}

/**
 * Generates a set of internal factions for a political party based on its main ideology.
 * @param {string} partyIdeology - The main ideology of the parent party.
 * @returns {Array<object>} An array of generated faction objects.
 */
export const generateFactionsForParty = (
  partyIdeology,
  partyId,
  countryId,
  allPartiesInScope,
  countryData
) => {
  const factions = [];
  const numFactions = getRandomInt(2, 4);

  const ideologyKey = Object.keys(IDEOLOGY_DEFINITIONS).find(
    (key) => IDEOLOGY_DEFINITIONS[key].name === partyIdeology
  );
  const mainIdeologyDetails = ideologyKey
    ? IDEOLOGY_DEFINITIONS[ideologyKey]
    : {};
  const relatedIdeologies = mainIdeologyDetails.related || [];

  const factionNameTemplates = {
    moderate: ["Moderates", "Centrist Wing", "Pragmatists"],
    radical: ["Hardliners", "Radical Wing", "True Believers"],
    specific: [
      "{ideology} Democrats",
      "{ideology} Action Group",
      "Friends of {ideology}",
    ],
  };

  let availableIdeologies = [...relatedIdeologies];

  // UPDATED: Generate a leader for each faction
  const moderateFaction = createFactionObject({
    name: getRandomElement(factionNameTemplates.moderate),
    ideology: partyIdeology, // Represents the core, moderate view of the party ideology
    influence: getRandomInt(25, 50),
    leader: generateFullAIPolitician(countryId, allPartiesInScope, {
      ...countryData,
      forcePartyId: partyId,
    }),
  });
  factions.push(moderateFaction);

  for (let i = 1; i < numFactions; i++) {
    if (availableIdeologies.length > 0) {
      const ideology = getRandomElement(availableIdeologies);
      // Prevent duplicates
      availableIdeologies = availableIdeologies.filter(
        (item) => item !== ideology
      );

      const name = getRandomElement(factionNameTemplates.specific).replace(
        "{ideology}",
        ideology
      );
      factions.push(
        createFactionObject({
          name,
          ideology,
          leader: generateFullAIPolitician(countryId, allPartiesInScope, {
            ...countryData,
            forcePartyId: partyId,
          }),
        })
      );
    } else {
      // If no related ideologies are left, create a radical faction
      factions.push(
        createFactionObject({
          name: getRandomElement(factionNameTemplates.radical),
          ideology: partyIdeology, // Radicals often see themselves as the purest form
          leader: generateFullAIPolitician(countryId, allPartiesInScope, {
            ...countryData,
            forcePartyId: partyId,
          }),
        })
      );
      break; // Stop after adding a radical faction if we're out of specifics
    }
  }

  // Normalize influence so it sums to 100
  const influences = distributeValueProportionally(100, factions.length);
  return factions.map((faction, index) => {
    faction.influence = influences[index];
    return faction;
  });
};

/**
 * Generates a list of national political parties for a given country.
 * @param {object} params - The parameters for party generation.
 * @param {string} params.countryId - The ID of the country.
 * @param {Array<string>} params.dominantIdeologies - A list of dominant ideology names.
 * @param {string} params.countryName - The name of the country.
 * @returns {Array<object>} A list of fully-formed party objects.
 */
/**
 * Generates a list of national political parties for a given country.
 * @param {object} params - The parameters for party generation.
 * @param {string} params.countryId - The ID of the country.
 * @param {Array<string>} params.dominantIdeologies - A list of dominant ideology names.
 * @param {string} params.countryName - The name of the country.
 * @returns {Array<object>} A list of fully-formed party objects.
 */
export const generateNationalParties = ({
  countryId,
  dominantIdeologies,
  countryName,
  countryData,
}) => {
  let parties = [];
  const numDominantIdeologies = dominantIdeologies?.length || 0;
  const numMinorityParties = getRandomInt(1, 3);
  const numParties = numDominantIdeologies + numMinorityParties;

  const minorityIdeologies = BASE_IDEOLOGIES.filter(
    (ideo) => !dominantIdeologies.includes(ideo.name)
  );
  const availableIdeologies = BASE_IDEOLOGIES.filter((ideo) =>
    dominantIdeologies.includes(ideo.name)
  );

  for (let i = 0; i < numMinorityParties; i++) {
    if (minorityIdeologies.length > 0) {
      const randomIndex = Math.floor(Math.random() * minorityIdeologies.length);
      const fringeIdeology = minorityIdeologies.splice(randomIndex, 1)[0];
      availableIdeologies.push(fringeIdeology);
    }
  }

  // Pre-initialize scores for all potential parties for context in generation
  const potentialPartiesForContext = availableIdeologies.map((ideo) => ({
    ...ideo,
    id: `${ideo.id}`,
  }));
  const partiesWithScoresForContext = initializePartyIdeologyScores(
    potentialPartiesForContext,
    IDEOLOGY_DEFINITIONS
  );

  for (let i = 0; i < numParties; i++) {
    if (availableIdeologies.length === 0) break;

    const ideologyIndex = Math.floor(
      Math.random() * availableIdeologies.length
    );
    const selectedIdeologyObject = availableIdeologies.splice(
      ideologyIndex,
      1
    )[0];
    const partyIdeologyName = selectedIdeologyObject.name;
    const partyIdeologyId = selectedIdeologyObject.id;
    const baseColor = selectedIdeologyObject.color || "#808080";
    const partyColor = generateNuancedColor(
      baseColor,
      getRandomInt(0, 100),
      getRandomInt(0, 100),
      getRandomInt(0, 100)
    );
    const partyName = generateNewPartyName(partyIdeologyName, countryName);
    const partyId = `gen_party_${countryId}_${i}_${generateId()}`;

    const logoDataUrl = generatePartyLogo({
      primaryColor: baseColor,
      ideologyId: partyIdeologyId,
      level: "national",
      partyName: partyName,
    });

    // UPDATED: Generate leadership and factions
    const factions = generateFactionsForParty(
      partyIdeologyName,
      partyId,
      countryId,
      partiesWithScoresForContext,
      countryData
    );

    const commsDirectorName = useGameStore
      .getState()
      .actions.generateDynamicName({ countryId });

    const leadership = {
      chairperson: generateFullAIPolitician(
        countryId,
        partiesWithScoresForContext,
        { ...countryData, forcePartyId: partyId }
      ),
      commsDirector: createPartyStaffObject({
        name: commsDirectorName,
        role: "Communications Director",
        partyId: partyId,
      }),
    };

    const newParty = createPartyObject({
      id: partyId,
      name: partyName,
      ideology: partyIdeologyName,
      ideologyId: partyIdeologyId,
      color: partyColor,
      logoDataUrl: logoDataUrl,
      countryId: countryId,
      factions: factions,
      leadership: leadership,
    });

    const allPartyMembers = [
      leadership.chairperson,
      ...factions.map((f) => f.leader),
    ].filter(Boolean);

    newParty.policyStances = calculateAggregateStances(allPartyMembers);

    newParty.factions.forEach((faction) => {
      // Faction stance is initially based on its leader
      faction.policyStances = calculateAggregateStances(
        [faction.leader].filter(Boolean)
      );
    });

    parties.push(newParty);
  }

  return initializePartyIdeologyScores(parties, IDEOLOGY_DEFINITIONS);
};
