import { getRandomInt } from "./generalUtils";
import { distributePopulationToSeats } from "./electionUtils";
import { chamberTiers } from "../data/chamberTiers";
import { stateElectionIds } from "../data/elections/electionData";

/**
 * Generates all legislative districts (national and sub-national) for all countries
 * based on their configured tiers and populations.
 * This replaces country-specific district generation logic.
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

    country.regions.forEach((state) => {
      // Iterate through states/regions
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
        const districtPopulations = distributePopulationToSeats(
          state.population,
          numDistricts
        );
        for (let i = 0; i < numDistricts; i++) {
          country.nationalLowerHouseDistricts.push({
            id: `${state.id}_HRD${i + 1}`,
            name: `${state.name} ${country.nationalHrName + " "} ${i + 1}`,
            population: districtPopulations[i],
            stateId: state.id,
          });
        }
      }
    });

    // --- 2. Generate Sub-National Legislative Districts (State/Provincial/Prefectural) ---
    // Iterate through all regions and provinces, as both can have legislative bodies
    const subnationalEntities = [
      ...(country.regions || []),
      ...(country.provinces || []),
    ];

    subnationalEntities.forEach((entity) => {
      // Initialize legislativeDistricts object on the entity
      entity.legislativeDistricts = entity.legislativeDistricts || {};

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
          const districtPopulations = distributePopulationToSeats(
            entity.population,
            numDistricts
          );
          entity.legislativeDistricts[stateElectionIds.state_hr] = Array.from({
            length: numDistricts,
          }).map((_, i) => ({
            id: `${entity.id}_SLHRD${i + 1}`, // State Lower House Rep District
            name: `${entity.name} ${country.lowerStateHrName + " "} ${i + 1}`,
            population: districtPopulations[i],
            stateId: entity.id,
          }));
        }
      }

      // USA State Upper House (Senate)
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
          const districtPopulations = distributePopulationToSeats(
            entity.population,
            numDistricts
          );
          entity.legislativeDistricts[stateElectionIds.state_senate] =
            Array.from({ length: numDistricts }).map((_, i) => ({
              id: `${entity.id}_SLSND${i + 1}`, // State Legislative Senate District
              name: `${entity.name} ${country.lowerStateHrName + " "} ${i + 1}`,
              population: districtPopulations[i],
              stateId: entity.id,
            }));
        }
      }

      // PHL Provincial Board Districts
      if (
        country.id === "PHL" &&
        chamberTiers.PHL.PHL_PROVINCIAL_BOARD_DISTRICT_TIERS
      ) {
        if (entity.id.startsWith("PHL_PROV_")) {
          // Ensure it's a province entity
          let numDistricts = 0;
          const tiers = chamberTiers.PHL.PHL_PROVINCIAL_BOARD_DISTRICT_TIERS;
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
            const districtPopulations = distributePopulationToSeats(
              entity.population,
              numDistricts
            );
            // PHL Provincial Boards might have a specific election ID, e.g., 'provincial_board'
            // Assuming stateElectionIds.state_hr or stateElectionIds.state_senate if one needs to map
            // For now, let's just push them into a dedicated 'boardDistricts' for PHL.
            entity.boardDistricts = Array.from({ length: numDistricts }).map(
              (_, i) => ({
                id: `${entity.id}_PBD${i + 1}`, // Provincial Board District
                name: `${entity.name} Board District ${i + 1}`,
                population: districtPopulations[i],
                provinceId: entity.id,
                // Note: PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE defines seats *per district*, not number of districts
                seatsToElect: getRandomInt(
                  chamberTiers.PHL
                    .PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE[0],
                  chamberTiers.PHL
                    .PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE[1]
                ),
              })
            );
          }
        }
      }
    });
  });

  console.log("Finished generating all legislative districts.");
};
