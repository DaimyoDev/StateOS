// src/entities/partyGeneration.js
import { BASE_IDEOLOGIES } from "../data/ideologiesData";
import { generateNewPartyName } from "./personnel";
import { getRandomElement, generateId } from "../utils/core";
import { generatePartyLogo } from "../utils/logoGenerator";

/**
 * Generates a single, completely random party for use in the Creator Hub.
 * @returns {object} A single generated party object.
 */
export const generateCreatorHubParty = () => {
  // 1. Pick one random ideology from the entire base list
  const ideology = getRandomElement(BASE_IDEOLOGIES); // Assuming this function exists
  const partyId = `party_${generateId()}`;

  // 2. Decide whether to use an ideology symbol or a generic text symbol
  //    (80% chance for ideology symbol, 20% for text)
  const symbolId = Math.random() < 0.8 ? ideology.id : "text";

  // 3. Generate a name for it
  const partyName = generateNewPartyName(ideology.name, "Testland"); // Assuming this exists

  // 4. Generate its logo, passing in the chosen symbol ID
  const logoDataUrl = generatePartyLogo({
    primaryColor: ideology.color,
    ideologyId: symbolId, // Use the randomly chosen symbol set
    level: "national",
    partyName: partyName,
  });

  // 5. Build and return the complete party object
  return {
    id: partyId,
    name: partyName,
    ideology: ideology.id,
    color: ideology.color,
    countryId: "TEST",
    logoDataUrl: logoDataUrl,
  };
};
