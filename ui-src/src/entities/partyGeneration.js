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

  // --- START OF FIX ---

  // 1. Determine the base number of parties from the dominant ideologies.
  const numDominantIdeologies = dominantIdeologies?.length || 0;

  // 2. Decide to add 1 to 3 "minority" or "fringe" parties for variety.
  const numMinorityParties = getRandomInt(1, 3);

  // 3. The total number of parties is now guaranteed to be diverse.
  const numParties = numDominantIdeologies + numMinorityParties;

  // Create a pool of "minority" ideologies (all ideologies minus the dominant ones).
  const minorityIdeologies = BASE_IDEOLOGIES.filter(
    (ideo) => !dominantIdeologies.includes(ideo.name)
  );

  // Create a mutable pool for selection, starting with all dominant ideologies.
  const availableIdeologies = BASE_IDEOLOGIES.filter((ideo) =>
    dominantIdeologies.includes(ideo.name)
  );

  // Add the chosen number of random minority ideologies to the pool.
  for (let i = 0; i < numMinorityParties; i++) {
    if (minorityIdeologies.length > 0) {
      const randomIndex = Math.floor(Math.random() * minorityIdeologies.length);
      const fringeIdeology = minorityIdeologies.splice(randomIndex, 1)[0];
      availableIdeologies.push(fringeIdeology);
    }
  }

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
      color: partyColor,
    });
  }

  return initializePartyIdeologyScores(parties, IDEOLOGY_DEFINITIONS);
};
