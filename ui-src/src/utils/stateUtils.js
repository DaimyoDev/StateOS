// src/utils/statesUtils.js
import { STATES_DATA } from "../data/statesData.js"; // Import the static state data you just created
import { getRandomElement, getRandomInt, generateId } from "./generalUtils.js"; // Assuming these utilities exist
import { generateFullAIPolitician } from "./electionUtils.js"; // For generating initial state leaders
import { BASE_IDEOLOGIES } from "../data/ideologiesData.js"; // For generating party info if needed
// You might also need to import COUNTRIES_DATA if generateFullAIPolitician uses country-specific naming rules
// import { COUNTRIES_DATA } from "../data/countriesData.js";

/**
 * Retrieves the static data for a specific state/prefecture.
 * @param {string} stateId - The ID of the state/prefecture.
 * @returns {object|undefined} The state object, or undefined if not found.
 */
export const getStateData = (stateId) => {
  return STATES_DATA.find((state) => state.id === stateId);
};

/**
 * Generates an AI politician suitable for a state-level executive office.
 * @param {string} officeTitle - e.g., "Governor"
 * @param {string} stateId - The ID of the state for context.
 * @param {string} countryId - The ID of the country for politician name generation.
 * @param {Array<object>} allPartiesInGame - Snapshot of all parties in the game for leader generation.
 * @returns {object} A full AI politician object.
 */
export const generateStateLeader = (
  officeTitle,
  stateId,
  countryId,
  allPartiesInGame = []
) => {
  // Find parties relevant to this state's political landscape
  const staticState = getStateData(stateId);
  const relevantParties = allPartiesInGame.filter((p) =>
    staticState?.politicalLandscape.some((lp) => lp.id === p.id)
  );

  let partyInfo = null;
  if (relevantParties.length > 0) {
    partyInfo = getRandomElement(relevantParties);
  } else {
    // Fallback to independent if no specific state parties are available or found
    partyInfo = {
      id: `independent_state_leader_party_${generateId()}`,
      name: "Independent",
      ideology: getRandomElement(BASE_IDEOLOGIES)?.name || "Centrist",
      color: "#888888",
    };
  }

  // Pass countryId to generateFullAIPolitician for name generation
  const leader = generateFullAIPolitician(partyInfo, false, countryId);

  // Set initial office and a placeholder term end date.
  // Term length for governors is often 4 years, but this should ideally come from electionsData.js
  const termEndDate = { year: 2004, month: 1, day: 1 }; // Placeholder based on campaign starting year 2000 + 4 years

  return {
    ...leader,
    role: officeTitle,
    currentOffice: `${staticState?.name} ${officeTitle}`, // Explicitly set their current office for display
    termEnds: termEndDate,
  };
};

/**
 * Generates the full dynamic state object, including initial government and stats.
 * This is meant to be called once at campaign setup for a specific region.
 * @param {string} stateId - The ID of the state/prefecture to initialize.
 * @param {string} countryId - The ID of the country the state belongs to.
 * @param {Array<object>} allPartiesInGame - Snapshot of all parties in the game.
 * @returns {{dynamicState: object, initialStatePoliticians: Array<object>}|null} An initialized dynamic state object and an array of politicians generated for state offices, or null if state not found.
 */
export const generateFullStateData = (stateId, countryId, allPartiesInGame) => {
  const staticState = getStateData(stateId);
  if (!staticState) {
    console.warn(
      `generateFullStateData: State with ID ${stateId} not found in STATES_DATA.`
    );
    return null;
  }

  // Generate initial government offices/holders for this state
  const governmentOffices = [];
  const initialStatePoliticians = []; // To hold all initial office holders for saving

  // Example: Generate a Governor/Prefectural Governor/Premier
  const governorOfficeNameTemplate =
    staticState.type === "state"
      ? "Governor"
      : staticState.type === "prefecture"
      ? "Prefectural Governor"
      : "Premier";
  const initialGovernor = generateStateLeader(
    governorOfficeNameTemplate,
    stateId,
    countryId,
    allPartiesInGame
  );

  if (initialGovernor) {
    governmentOffices.push({
      officeId: `gov_office_${stateId}_governor`, // Use a consistent ID generation
      officeName: `${staticState.name} ${initialGovernor.role}`,
      officeNameTemplateId: `${staticState.type}_governor`, // A template ID for this type of office
      level: `local_${staticState.type}`,
      holder: {
        id: initialGovernor.id,
        name: initialGovernor.name,
        partyId: initialGovernor.partyId,
        partyName: initialGovernor.partyName,
        partyColor: initialGovernor.partyColor,
        role: initialGovernor.role,
        termEnds: initialGovernor.termEnds,
      },
      members: null, // This is an executive office, not a legislative body
      currentCompositionByParty: null,
    });
    initialStatePoliticians.push(initialGovernor);
  }

  // You would expand this to include initial legislative bodies (e.g., State Assembly/Council)
  // This would involve generating multiple "members" and their parties for composition.
  // Example for a legislative body (simplified)
  // if (staticState.legislativeBody) {
  //     const assemblyMembers = [];
  //     const numSeats = getRandomInt(staticState.legislativeBody.minSeats, staticState.legislativeBody.maxSeats);
  //     const composition = {}; // Track party composition

  //     for (let i = 0; i < numSeats; i++) {
  //         const memberPolitician = generateFullAIPolitician(getRandomElement(allPartiesInGame), false, countryId);
  //         assemblyMembers.push({
  //             id: memberPolitician.id,
  //             name: memberPolitician.name,
  //             partyId: memberPolitician.partyId,
  //             partyName: memberPolitician.partyName,
  //             partyColor: memberPolitician.partyColor,
  //             role: `Member, ${staticState.legislativeBody.name}`,
  //             termEnds: { year: 2004, month: 1, day: 1 } // Placeholder
  //         });
  //         composition[memberPolitician.partyId] = (composition[memberPolitician.partyId] || 0) + 1;
  //         initialStatePoliticians.push(memberPolitician);
  //     }

  //     governmentOffices.push({
  //         officeId: `gov_office_${stateId}_legislature`,
  //         officeName: `${staticState.name} ${staticState.legislativeBody.name}`,
  //         officeNameTemplateId: staticState.legislativeBody.id,
  //         level: `local_${staticState.type}`,
  //         holder: null,
  //         members: assemblyMembers,
  //         currentCompositionByParty: composition,
  //     });
  // }

  return {
    dynamicState: {
      ...staticState, // Copy all static data
      // Dynamic properties go here:
      currentStats: { ...staticState.initialStats }, // Will be updated monthly
      currentGovernmentOffices: governmentOffices, // State-level executive/legislative
      currentLaws: [], // Laws specific to this state
      // Add other dynamic state-level attributes as needed
    },
    initialStatePoliticians: initialStatePoliticians, // Politicians generated for state offices
  };
};

/**
 * Calculates and updates the dynamic stats for a given state.
 * This function would be called monthly as part of your monthlyCalcUtils.
 * @param {object} stateObject - The dynamic state object from activeCampaign.
 * @param {Array<object>} activePolicies - Policies active at this state level.
 * @param {object} globalContext - Other global game state needed for calculations (e.g., current date, national economy).
 * @returns {object} The updated state object.
 */
export const calculateStateMonthlyStats = (stateObject) => {
  const updatedStats = { ...stateObject.currentStats };
  // Implement complex calculations based on policies, events, and other factors.
  // Example: Influence state economy based on state policies.
  // Example: Adjust unemployment based on national economic trends.
  // Example: Update citizen mood based on policy effects and budget balance.

  // For demonstration: simple random fluctuations
  updatedStats.economy = getRandomElement(["Booming", "Stable", "Stagnant"]);
  updatedStats.unemploymentRate = parseFloat(
    (updatedStats.unemploymentRate + getRandomInt(-10, 10) / 10).toFixed(1)
  );
  updatedStats.unemploymentRate = Math.max(
    1.0,
    Math.min(15.0, updatedStats.unemploymentRate)
  ); // Clamp

  return {
    ...stateObject,
    currentStats: updatedStats,
  };
};
