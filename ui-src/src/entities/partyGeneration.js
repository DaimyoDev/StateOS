// src/entities/partyGeneration.js
import { generateNuancedColor } from "../utils/generalUtils";
import { BASE_IDEOLOGIES, IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import {
  generateNewPartyName,
  initializePartyIdeologyScores,
} from "./personnel";
import { getRandomInt } from "../utils/core";

export const generateNationalParties = ({
  countryId,
  dominantIdeologies,
  countryName,
}) => {
  let parties = [];
  const numParties = 5 + Math.floor(Math.random() * 4); // 5-8 parties for more variety

  // --- START OF NEW LOGIC ---

  // 1. Start the pool with the dominant ideologies to ensure they are represented.
  let ideologyPool =
    dominantIdeologies?.length > 0
      ? BASE_IDEOLOGIES.filter((ideo) => dominantIdeologies.includes(ideo.name))
      : [];

  // 2. Create a pool of "minority" ideologies (all ideologies minus the dominant ones).
  const minorityIdeologies = BASE_IDEOLOGIES.filter(
    (ideo) => !dominantIdeologies.includes(ideo.name)
  );

  // 3. Add a few random minority ideologies to the main pool for variety.
  const numberOfMinorityParties = getRandomInt(1, 3); // Add 1 to 3 extra parties
  for (let i = 0; i < numberOfMinorityParties; i++) {
    if (minorityIdeologies.length > 0) {
      const randomIndex = Math.floor(Math.random() * minorityIdeologies.length);
      const fringeIdeology = minorityIdeologies.splice(randomIndex, 1)[0];
      ideologyPool.push(fringeIdeology);
    }
  }

  // --- END OF NEW LOGIC ---

  const availableIdeologies = [...ideologyPool];

  for (let i = 0; i < numParties; i++) {
    if (availableIdeologies.length === 0) {
      break;
    }

    const ideologyIndex = Math.floor(
      Math.random() * availableIdeologies.length
    );
    const selectedIdeologyObject = availableIdeologies[ideologyIndex];
    availableIdeologies.splice(ideologyIndex, 1);

    const baseColor = selectedIdeologyObject.color || "#808080";
    const partyColor = generateNuancedColor(baseColor, 20, 20, 10);
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
      color: partyColor,
    });
  }

  return initializePartyIdeologyScores(parties, IDEOLOGY_DEFINITIONS);
};
