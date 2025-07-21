// src/entities/districtGeneration.js
// This file contains the logic for generating legislative districts for all levels of government.

// NOTE: Import paths will need to be updated once the refactoring is complete.
import { getRandomInt, distributeValueProportionally } from "../utils/core.js";
import { stateElectionIds } from "../data/elections/electionData";

/**
 * Generates all legislative districts (national and sub-national) for all countries
 * based on their configured tiers and populations.
 *
 * @param {object} countriesData - The full COUNTRIES_DATA object (already populated with regions/provinces).
 */
export const generateAllLegislativeDistricts = (countriesData) => {
  if (!countriesData) {
    console.warn(
      "generateAllLegislativeDistricts: countriesData is null or undefined. Skipping district generation."
    );
    return;
  }

  Object.values(countriesData).forEach((country) => {
    country.nationalLowerHouseDistricts =
      country.nationalLowerHouseDistricts || [];

    // --- 1. Generate National Lower House Districts (e.g., US House of Reps) ---
    country.regions.forEach((state) => {
      let numDistricts = 0;
      if (!country.nationalHrTiers) return;
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
          entity.legislativeDistricts[stateElectionIds.state_senate] =
            Array.from({ length: numDistricts }).map((_, i) => ({
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
  });

  console.log("Finished generating all legislative districts.");
};
