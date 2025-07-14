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
    // Ensure the country has a container for national lower house districts
    country.nationalLowerHouseDistricts =
      country.nationalLowerHouseDistricts || [];

    // --- 1. Generate National Lower House (e.g., Congressional) Districts ---
    // This logic relies on the existence of specific tier keys for national level
    // and that 'regions' or 'provinces' correctly map to where these districts are.

    // USA National HR Districts (Congressional Districts)
    if (
      country.id === "USA" &&
      chamberTiers.USA.USA_CONGRESSIONAL_DISTRICT_TIERS
    ) {
      country.regions.forEach((state) => {
        // Iterate through states/regions
        let numDistricts = 0;
        const tiers = chamberTiers.USA.USA_CONGRESSIONAL_DISTRICT_TIERS;
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
          // Fallback if population is below all thresholds
          numDistricts = getRandomInt(
            tiers[tiers.length - 1].numDistrictsRange[0],
            tiers[tiers.length - 1].numDistrictsRange[1]
          );
        }
        numDistricts = Math.max(1, numDistricts); // Ensure at least 1 district per state for USA

        if (numDistricts > 0) {
          const districtPopulations = distributePopulationToSeats(
            state.population,
            numDistricts
          );
          for (let i = 0; i < numDistricts; i++) {
            country.nationalLowerHouseDistricts.push({
              id: `${state.id}_HRD${i + 1}`,
              name: `${state.name} Congressional District ${i + 1}`,
              population: districtPopulations[i],
              stateId: state.id, // Parent state reference
            });
          }
        }
      });
    }

    // JPN National HR Districts (Constituency)
    // The previous JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS was for Prefectural Assembly, not National HR.
    // If Japan's National HR constituency districts are tied to prefectures for generation, it goes here.
    if (
      country.id === "JPN" &&
      chamberTiers.JPN.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS
    ) {
      country.regions.forEach((prefecture) => {
        let numDistricts = 0;
        const tiers = chamberTiers.JPN.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS;
        for (const tier of tiers) {
          if (prefecture.population >= tier.popThreshold) {
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
        numDistricts = Math.max(1, numDistricts); // Ensure at least 1

        if (numDistricts > 0) {
          const districtPopulations = distributePopulationToSeats(
            prefecture.population,
            numDistricts
          );
          for (let i = 0; i < numDistricts; i++) {
            country.nationalLowerHouseDistricts.push({
              id: `${prefecture.id}_HRD${i + 1}`,
              name: `${prefecture.name} HR District ${i + 1}`,
              population: districtPopulations[i],
              prefectureId: prefecture.id,
            });
          }
        }
      });
    }

    // PHL National HR Districts (per Province)
    if (
      country.id === "PHL" &&
      chamberTiers.PHL.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS
    ) {
      country.provinces.forEach((province) => {
        let numDistricts = 0;
        const tiers = chamberTiers.PHL.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS;
        for (const tier of tiers) {
          if (province.population >= tier.popThreshold) {
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
        numDistricts = Math.max(1, numDistricts); // Ensure at least 1

        if (numDistricts > 0) {
          const districtPopulations = distributePopulationToSeats(
            province.population,
            numDistricts
          );
          for (let i = 0; i < numDistricts; i++) {
            country.nationalLowerHouseDistricts.push({
              id: `${province.id}_HRD${i + 1}`,
              name: `${province.name} HR District ${i + 1}`,
              population: districtPopulations[i],
              provinceId: province.id,
            });
          }
        }
      });
    }

    // KOR National Assembly Constituency Districts
    if (
      country.id === "KOR" &&
      chamberTiers.KOR.KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS
    ) {
      // Assuming Korea's national constituencies are directly tied to its 'regions' (provinces/metro cities)
      // or handled as a single national pool to be distributed by population.
      // Let's assume they are generated per region (province/metro city) for simplicity,
      // similar to US states. You need to verify how KOR's sub-entities are represented.
      // If it's `country.regions` that hold the relevant population for these tiers:
      const entitiesForNationalDistricts = [
        ...(country.regions || []),
        ...(country.provinces || []),
      ]; // Adjust based on your KOR country data structure

      entitiesForNationalDistricts.forEach((entity) => {
        let numDistricts = 0;
        const tiers = chamberTiers.KOR.KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS;
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
          for (let i = 0; i < numDistricts; i++) {
            country.nationalLowerHouseDistricts.push({
              id: `${entity.id}_KORHRD${i + 1}`, // Consistent ID pattern for KOR national HR
              name: `${entity.name} National Assembly District ${i + 1}`,
              population: districtPopulations[i],
              parentId: entity.id, // Reference to its parent entity
            });
          }
        }
      });
    }

    // --- 2. Generate Sub-National Legislative Districts (State/Provincial/Prefectural) ---
    // Iterate through all regions and provinces, as both can have legislative bodies
    const subnationalEntities = [
      ...(country.regions || []),
      ...(country.provinces || []),
    ];

    subnationalEntities.forEach((entity) => {
      // Initialize legislativeDistricts object on the entity
      entity.legislativeDistricts = entity.legislativeDistricts || {};

      // USA State Lower House
      if (
        country.id === "USA" &&
        chamberTiers.USA.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS
      ) {
        let numDistricts = 0;
        const tiers = chamberTiers.USA.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS;
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
            name: `${entity.name} State House District ${i + 1}`,
            population: districtPopulations[i],
            stateId: entity.id,
          }));
        }
      }

      // USA State Upper House (Senate)
      if (
        country.id === "USA" &&
        chamberTiers.USA.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS
      ) {
        let numDistricts = 0;
        const tiers = chamberTiers.USA.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS;
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
              name: `${entity.name} State Senate District ${i + 1}`,
              population: districtPopulations[i],
              stateId: entity.id,
            }));
        }
      }

      // JPN Prefectural Assembly (Lower House Equivalent, using state_hr ID)
      // Your `japanElections` had `stateElectionIds.state_hr` mapped to `local_prefecture` level,
      // and it was `generatesOneWinner: false`, `electoralSystem: "SNTV_MMD"`, with `councilSeatPopulationTiers`.
      // This means the 'districts' are often the prefecture itself or its sub-divisions.
      // If prefecture is treated as one large MMD (SNTV), no further sub-districts are explicitly needed,
      // but if SNTV is applied to smaller, named districts within the prefecture, you'd generate them.
      // Assuming for now, 'SNTV_MMD' means the entire Prefecture is the 'district' for this election:
      if (
        country.id === "JPN" &&
        chamberTiers.JPN.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS
      ) {
        // If JPN prefectures themselves act as multi-member districts for the Prefectural Assembly,
        // then we might not generate sub-districts *here*.
        // Instead, the election generation would treat the prefecture as the entity.
        // However, if the SNTV system *itself* implies sub-districts, you'd generate them.
        // Your tiers are named "DISTRICTS_PER_PREFECTURE", implying sub-districts.
        let numDistricts = 0;
        const tiers = chamberTiers.JPN.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS;
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
            id: `${entity.id}_JPA${i + 1}`, // Japan Prefectural Assembly District
            name: `${entity.name} Assembly District ${i + 1}`,
            population: districtPopulations[i],
            prefectureId: entity.id,
            // For SNTV, these districts are MMDs themselves, not single-winner
            // The actual number of seats elected per district would be part of electionType.councilSeatPopulationTiers
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

      // KOR Provincial/Metropolitan Assembly Districts
      if (
        country.id === "KOR" &&
        chamberTiers.KOR.KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS
      ) {
        // This applies to Korea's regions (provinces and metropolitan cities)
        let numDistricts = 0;
        const tiers =
          chamberTiers.KOR.KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS;
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
          // Assign to state_hr or a specific ID for Korea's provincial/metro assembly
          entity.legislativeDistricts[stateElectionIds.state_hr] = Array.from({
            length: numDistricts,
          }).map((_, i) => ({
            id: `${entity.id}_KPA${i + 1}`, // Korea Provincial Assembly District
            name: `${entity.name} Assembly District ${i + 1}`,
            population: districtPopulations[i],
            parentId: entity.id,
          }));
        }
      }
    });
  });

  console.log("Finished generating all legislative districts.");
};
