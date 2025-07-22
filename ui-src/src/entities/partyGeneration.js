// src/entities/partyGeneration.js

// Make sure to import the function we're going to use
import { generateNuancedColor, getRandomInt } from "../utils/generalUtils";
import { BASE_IDEOLOGIES, IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import {
  generateNewPartyName,
  initializePartyIdeologyScores,
} from "./personnel";

export const generateNationalParties = ({
  countryId,
  dominantIdeologies,
  countryName,
}) => {
  let parties = [];
  const numParties = 4 + Math.floor(Math.random() * 4);

  // --- START OF REVISED LOGIC ---

  // Create a pool of the FULL ideology objects to access their base colors.
  const ideologyPool =
    dominantIdeologies?.length > 0
      ? BASE_IDEOLOGIES.filter((ideo) => dominantIdeologies.includes(ideo.name))
      : [...BASE_IDEOLOGIES];

  const availableIdeologies = [...ideologyPool];

  for (let i = 0; i < numParties; i++) {
    if (availableIdeologies.length === 0) {
      console.warn("Ran out of unique ideologies to assign to parties.");
      break;
    }

    const ideologyIndex = Math.floor(
      Math.random() * availableIdeologies.length
    );
    const selectedIdeologyObject = availableIdeologies[ideologyIndex];
    availableIdeologies.splice(ideologyIndex, 1);

    // 1. Get the base color from the chosen ideology.
    const baseColor = selectedIdeologyObject.color || "#808080"; // Fallback to grey

    // 2. Use generateNuancedColor to create a unique shade.
    const partyColor = generateNuancedColor(
      baseColor,
      getRandomInt(0, 100),
      getRandomInt(0, 100),
      getRandomInt(0, 100)
    );

    const partyName = generateNewPartyName(
      selectedIdeologyObject.name,
      countryName
    );

    parties.push({
      id: `gen_party_${countryId}_${i}_${Math.random()
        .toString(36)
        .substr(2, 5)}`,
      name: partyName,
      ideology: selectedIdeologyObject.name,
      color: partyColor, // 3. Use the new, nuanced color.
    });
  }
  // --- END OF REVISED LOGIC ---

  return initializePartyIdeologyScores(parties, IDEOLOGY_DEFINITIONS);
};
