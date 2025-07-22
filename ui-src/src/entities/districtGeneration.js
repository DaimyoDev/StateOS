// src/entities/districtGeneration.js
import { getRandomInt, distributeValueProportionally } from "../utils/core.js";
import { stateElectionIds } from "../data/elections/electionData";

/**
 * Generates all legislative districts for a SINGLE country object.
 * This function modifies the country object it receives and returns it.
 *
 * @param {object} country - A single country object from countriesData.js.
 * @returns {object} The same country object, now populated with legislative districts.
 */
export const generateLegislativeDistrictsForCountry = (country) => {
  if (!country) {
    console.warn(
      "generateLegislativeDistrictsForCountry: received a null country. Skipping."
    );
    return null;
  }

  // Ensure the target arrays exist
  country.nationalLowerHouseDistricts =
    country.nationalLowerHouseDistricts || [];

  // --- 1. Generate National Lower House Districts (e.g., US House of Reps) ---
  if (country.regions && country.nationalHrTiers) {
    country.regions.forEach((state) => {
      let numDistricts = 0;
      const tiers = country.nationalHrTiers;
      for (const tier of tiers) {
        if (state.population >= tier.popThreshold) {
          numDistricts = getRandomInt(
            tier.numDistrictsRange[0],
            tier.numDistrictsRange[1]
          );
          break;
        }
      }
      if (numDistricts === 0 && tiers.length > 0) {
        numDistricts = getRandomInt(
          tiers[tiers.length - 1].numDistrictsRange[0],
          tiers[tiers.length - 1].numDistrictsRange[1]
        );
      }
      numDistricts = Math.max(1, numDistricts);

      if (numDistricts > 0) {
        const districtPopulations = distributeValueProportionally(
          state.population,
          numDistricts
        );
        for (let i = 0; i < numDistricts; i++) {
          country.nationalLowerHouseDistricts.push({
            id: `${state.id}_HRD${i + 1}`,
            name: `${state.name} ${country.nationalHrName || "District"} ${
              i + 1
            }`,
            population: districtPopulations[i],
            stateId: state.id,
          });
        }
      }
    });
  }

  // --- 2. Generate Sub-National Legislative Districts (State/Provincial/Prefectural) ---
  const subnationalEntities = [
    ...(country.regions || []),
    ...(country.provinces || []),
  ];

  subnationalEntities.forEach((entity) => {
    entity.legislativeDistricts = entity.legislativeDistricts || {};

    // Generate State Lower House Districts
    if (country.lowerStateHrTiers) {
      let numDistricts = 0;
      const tiers = country.lowerStateHrTiers;
      for (const tier of tiers) {
        if (entity.population >= tier.popThreshold) {
          numDistricts = getRandomInt(
            tier.numDistrictsRange[0],
            tier.numDistrictsRange[1]
          );
          break;
        }
      }
      if (numDistricts === 0 && tiers.length > 0) {
        numDistricts = getRandomInt(
          tiers[tiers.length - 1].numDistrictsRange[0],
          tiers[tiers.length - 1].numDistrictsRange[1]
        );
      }
      numDistricts = Math.max(1, numDistricts);

      if (numDistricts > 0) {
        const districtPopulations = distributeValueProportionally(
          entity.population,
          numDistricts
        );
        entity.legislativeDistricts[stateElectionIds.state_hr] = Array.from({
          length: numDistricts,
        }).map((_, i) => ({
          id: `${entity.id}_SLHRD${i + 1}`,
          name: `${entity.name} ${
            country.lowerStateHrName || "Assembly District"
          } ${i + 1}`,
          population: districtPopulations[i],
          stateId: entity.id,
        }));
      }
    }

    // Generate State Upper House Districts (e.g., US State Senates)
    if (country.upperStateHrTiers) {
      let numDistricts = 0;
      const tiers = country.upperStateHrTiers;
      for (const tier of tiers) {
        if (entity.population >= tier.popThreshold) {
          numDistricts = getRandomInt(
            tier.numDistrictsRange[0],
            tier.numDistrictsRange[1]
          );
          break;
        }
      }
      if (numDistricts === 0 && tiers.length > 0) {
        numDistricts = getRandomInt(
          tiers[tiers.length - 1].numDistrictsRange[0],
          tiers[tiers.length - 1].numDistrictsRange[1]
        );
      }
      numDistricts = Math.max(1, numDistricts);

      if (numDistricts > 0) {
        const districtPopulations = distributeValueProportionally(
          entity.population,
          numDistricts
        );
        entity.legislativeDistricts[stateElectionIds.state_senate] = Array.from(
          { length: numDistricts }
        ).map((_, i) => ({
          id: `${entity.id}_SLSND${i + 1}`,
          name: `${entity.name} ${
            country.upperStateHrName || "Senate District"
          } ${i + 1}`,
          population: districtPopulations[i],
          stateId: entity.id,
        }));
      }
    }
  });

  console.log(`Finished generating legislative districts for ${country.name}.`);
  return country; // Return the modified country object
};
