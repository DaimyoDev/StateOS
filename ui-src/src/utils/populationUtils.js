import { getRandomInt } from "./generalUtils";
import {
  JPN_HOC_SEAT_ALLOCATION_TIERS,
  JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
  USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
  USA_STATE_UPPER_HOUSE_DISTRICT_TIERS,
  USA_CONGRESSIONAL_DISTRICT_TIERS,
  PHL_PROVINCIAL_BOARD_DISTRICT_TIERS,
  PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE,
  PHL_HR_DISTRICTS_PER_PROVINCE_TIERS,
} from "../data/countriesData";

const initializeUsaStructures = (usaCountryData, usaTierData) => {
  // Generate State Legislative Districts for each state
  if (usaCountryData.regions && usaCountryData.regions.length > 0) {
    usaCountryData.regions.forEach((state) => {
      // 'region' here is a US State
      if (state.population > 0) {
        // Only generate if state has population
        generateStateLegislativeDistricts(
          state,
          "state_lower_house_member_usa", // electionType.id for lower house
          usaTierData.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
          "state_upper_house_member_usa", // electionType.id for upper house
          usaTierData.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS
        );
      }
    });
  }

  // Generate US Congressional Districts (Nationwide, based on state populations)
  generateUSCongressionalDistricts(
    usaCountryData,
    usaTierData.USA_CONGRESSIONAL_DISTRICT_TIERS
  );
  // Note: The generic population assignment for nationalLowerHouseDistricts
  // in the main loop might still be useful if generateUSCongressionalDistricts
  // only creates the structure but not individual populations (though your current one does).
};

/**
 * Initializes Japan-specific structures like HoC seat allocations and HR districts per prefecture.
 * Assumes prefectures (regions) in jpnCountryData already have their populations assigned.
 */
const initializeJapanStructures = (jpnCountryData, jpnTierData) => {
  if (!jpnCountryData.nationalLowerHouseDistricts) {
    jpnCountryData.nationalLowerHouseDistricts = [];
  }

  if (jpnCountryData.regions && jpnCountryData.regions.length > 0) {
    jpnCountryData.regions.forEach((prefecture) => {
      // 'region' here is a JPN Prefecture
      if (prefecture.population > 0) {
        // Assign seatsForHoCPerCycle (House of Councillors)
        let hocSeats = 1;
        for (const tier of jpnTierData.JPN_HOC_SEAT_ALLOCATION_TIERS) {
          if (prefecture.population >= tier.popThreshold) {
            hocSeats = getRandomInt(tier.seatsRange[0], tier.seatsRange[1]);
            break;
          }
        }
        prefecture.seatsForHoCPerCycle = Math.max(1, hocSeats);

        // Generate HR Constituency Districts for this Prefecture
        let numHrDistrictsForPrefecture = 1;
        for (const tier of jpnTierData.JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS) {
          if (prefecture.population >= tier.popThreshold) {
            numHrDistrictsForPrefecture = getRandomInt(
              tier.numDistrictsRange[0],
              tier.numDistrictsRange[1]
            );
            break;
          }
        }
        numHrDistrictsForPrefecture = Math.max(1, numHrDistrictsForPrefecture);

        const hrDistrictPopulations = distributeValueProportionally(
          prefecture.population,
          numHrDistrictsForPrefecture
        );

        for (let i = 0; i < numHrDistrictsForPrefecture; i++) {
          const districtNumber = i + 1;
          jpnCountryData.nationalLowerHouseDistricts.push({
            id: `${prefecture.id}_HRD${districtNumber}`,
            name: `${prefecture.name} HR District ${districtNumber}`,
            prefectureId: prefecture.id,
            prefectureName: prefecture.name,
            population: hrDistrictPopulations[i] || 0,
            stats: {},
            politicalLandscape: [],
            issues: [],
            politicalLeaning: "Moderate",
          });
        }
      }
    });
  }
};

/**
 * Initializes Philippines-specific structures:
 * - Distributes admin region populations to their provinces.
 * - Generates provincial board districts for each province.
 * - Generates national HR districts based on province populations.
 */
const initializePhilippinesStructures = (phlCountryData, phlTierData) => {
  if (!phlCountryData.provinces || phlCountryData.provinces.length === 0) {
    console.warn("PHL: No provinces found to initialize structures.");
    return;
  }
  if (!phlCountryData.regions || phlCountryData.regions.length === 0) {
    console.warn(
      "PHL: No administrative regions found for province population distribution."
    );
    // Fallback: Distribute country population directly among provinces if admin regions are missing (less accurate)
    const provincePopulations = distributeValueProportionally(
      phlCountryData.population,
      phlCountryData.provinces.length
    );
    phlCountryData.provinces.forEach((province, index) => {
      province.population = provincePopulations[index] || 0;
    });
  } else {
    // Distribute Admin Region population to its Provinces
    phlCountryData.regions.forEach((adminRegion) => {
      const provincesInRegion = phlCountryData.provinces.filter(
        (p) => p.adminRegionId === adminRegion.id
      );
      if (provincesInRegion.length > 0 && adminRegion.population > 0) {
        const provincialPopulations = distributeValueProportionally(
          adminRegion.population,
          provincesInRegion.length
        );
        provincesInRegion.forEach((province, index) => {
          province.population = provincialPopulations[index] || 0;
        });
      } else if (provincesInRegion.length > 0) {
        // If admin region has 0 pop but provinces, distribute small nominal pop or 0
        provincesInRegion.forEach((province) => (province.population = 0));
      }
    });
  }

  // Now that provinces have populations, generate their board districts
  phlCountryData.provinces.forEach((province) => {
    if (province.population > 0) {
      generatePhilippineProvincialBoardDistricts(
        province,
        phlTierData.PHL_PROVINCIAL_BOARD_DISTRICT_TIERS,
        phlTierData.PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE
      );
    } else {
      province.boardDistricts = []; // Ensure property exists even if no pop
    }
  });

  // After all provinces have populations, generate national HR districts based on them
  generatePhilippineHrDistricts(
    phlCountryData, // This function expects the main country object
    phlTierData.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS
  );
};

/**
 * Assigns random populations to countries and their regions.
 * Modifies the input countriesData array directly.
 * @param {Array<object>} countriesData - The COUNTRIES_DATA array.
 * @param {object} countryPopulationRanges - Object with countryId as key and {min, max} population as value.
 */
export const assignNestedPopulations = (
  countriesData, // This array will be modified directly
  countryPopulationRanges
) => {
  // Bundling tier data for easier passing
  const tierData = {
    JPN_HOC_SEAT_ALLOCATION_TIERS,
    JPN_HR_DISTRICTS_PER_PREFECTURE_TIERS,
    USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
    USA_STATE_UPPER_HOUSE_DISTRICT_TIERS,
    USA_CONGRESSIONAL_DISTRICT_TIERS,
    PHL_PROVINCIAL_BOARD_DISTRICT_TIERS,
    PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE,
    PHL_HR_DISTRICTS_PER_PROVINCE_TIERS,
  };

  countriesData.forEach((country) => {
    // 1. Assign Country Population
    const range = countryPopulationRanges[country.id];
    if (range) {
      country.population = getRandomInt(range.min, range.max);
    } else {
      console.warn(
        `No population range defined for country: ${country.id}. Assigning a default.`
      );
      country.population = getRandomInt(1000000, 50000000); // Default population
    }

    // Initialize arrays if they don't exist to prevent errors in helper functions
    if (!country.nationalLowerHouseDistricts)
      country.nationalLowerHouseDistricts = [];
    if (!country.nationalPrBlocs) country.nationalPrBlocs = [];

    // 2. Assign Populations to Primary Regions (States/Prefectures/AdminRegions for PHL)
    if (country.regions && country.regions.length > 0) {
      const regionPopulations = distributeValueProportionally(
        country.population,
        country.regions.length
      );
      country.regions.forEach((region, index) => {
        region.population = regionPopulations[index] || 0;
      });
    }

    // 3. Country-Specific Structure Initializations
    // These functions will handle further population distribution (e.g., PHL provinces)
    // and generation of districts/seats based on these populations.
    if (country.id === "USA") {
      initializeUsaStructures(country, tierData);
    } else if (country.id === "JPN") {
      initializeJapanStructures(country, tierData);
    } else if (country.id === "PHL") {
      initializePhilippinesStructures(country, tierData);
    }
    // Add other `else if (country.id === "GER")` etc., as needed

    // 4. Generic Post-Processing for National Districts/Blocs (if populations not set by specific initializers)
    // This might be redundant if country-specific initializers fully populate these.
    // For nationalLowerHouseDistricts (e.g., if a country has them defined but no specific generator like USA/JPN/PHL yet)
    if (
      country.nationalLowerHouseDistricts.length > 0 &&
      country.nationalLowerHouseDistricts.some(
        (d) => d.population === undefined || d.population === 0
      ) &&
      // Avoid re-populating if already done by specific initializers for these countries
      !["USA", "JPN", "PHL"].includes(country.id) // Example condition
    ) {
      const unpopulatedDistricts = country.nationalLowerHouseDistricts.filter(
        (d) => d.population === undefined || d.population === 0
      );
      if (unpopulatedDistricts.length > 0) {
        // Distribute remaining portion of country population or a fixed fraction to these generic districts
        const approxPopForGenericDistricts = country.population * 0.1; // Example: 10% for generic districts
        const districtPopulations = distributeValueProportionally(
          approxPopForGenericDistricts,
          unpopulatedDistricts.length
        );
        unpopulatedDistricts.forEach((district, index) => {
          district.population = districtPopulations[index] || 0;
        });
      }
    }

    // For nationalPrBlocs (if they exist and need population)
    if (
      country.nationalPrBlocs.length > 0 &&
      country.nationalPrBlocs.some(
        (b) => b.population === undefined || b.population === 0
      )
    ) {
      const unpopulatedBlocs = country.nationalPrBlocs.filter(
        (b) => b.population === undefined || b.population === 0
      );
      if (unpopulatedBlocs.length > 0) {
        // Distribute a portion of country population to PR blocs
        const approxPopForPrBlocs = country.population * 0.2; // Example: 20% of pop is base for PR blocs
        const blocPopulations = distributeValueProportionally(
          approxPopForPrBlocs,
          unpopulatedBlocs.length
        );
        unpopulatedBlocs.forEach((bloc, index) => {
          bloc.population = blocPopulations[index] || 0;
          // Ensure numberOfSeats is present on PR bloc data if needed by elections
          // bloc.numberOfSeats = bloc.numberOfSeats || getRandomInt(5,20); // Example, better if defined in initial data
        });
      }
    }
  });

  return countriesData; // Return the modified countriesData array
};

/**
 * Distributes a total value among a number of parts, ensuring the sum matches.
 * Each part gets a random weight, and distribution is proportional to these weights.
 * @param {number} totalValue - The total value to distribute (e.g., country population).
 * @param {number} numberOfParts - The number of parts to distribute among (e.g., number of regions).
 * @param {number} [minSharePercentage=0.5] - Minimum percentage of totalValue a single part should ideally get (to avoid tiny regions).
 * @param {number} [maxSharePercentage=50] - Maximum percentage of totalValue a single part should ideally get (to avoid one massive region).
 * @returns {number[]} An array of values for each part, summing up to totalValue.
 */
export const distributeValueProportionally = (totalValue, numberOfParts) => {
  if (numberOfParts <= 0) return [];
  if (totalValue <= 0) return new Array(numberOfParts).fill(0);

  let values = new Array(numberOfParts).fill(0);
  let assignedValue = 0;

  // Assign random weights
  let weights = [];
  let totalWeight = 0;
  for (let i = 0; i < numberOfParts; i++) {
    const weight = getRandomInt(10, 100); // Assign a base random weight
    weights.push(weight);
    totalWeight += weight;
  }

  if (totalWeight === 0 && numberOfParts > 0) {
    // Fallback if all weights are 0 (unlikely)
    const equalShare = Math.floor(totalValue / numberOfParts);
    values.fill(equalShare);
    assignedValue = equalShare * numberOfParts;
  } else if (totalWeight > 0) {
    // Distribute based on weights
    for (let i = 0; i < numberOfParts; i++) {
      const proportion = weights[i] / totalWeight;
      values[i] = Math.floor(proportion * totalValue);
      assignedValue += values[i];
    }
  }

  // Distribute remainder due to flooring
  let remainder = totalValue - assignedValue;
  // Distribute remainder somewhat proportionally to weights or just cycle
  if (remainder > 0 && totalWeight > 0) {
    const sortedByWeightIndices = weights
      .map((w, index) => ({ weight: w, index }))
      .sort((a, b) => b.weight - a.weight) // Sort by weight descending
      .map((item) => item.index);

    for (let i = 0; i < remainder; i++) {
      values[sortedByWeightIndices[i % numberOfParts]]++;
    }
  } else if (remainder < 0 && totalWeight > 0) {
    // Took too much due to some edge case (should be rare with floor)
    const sortedByWeightIndices = weights
      .map((w, index) => ({ weight: w, index }))
      .sort((a, b) => a.weight - b.weight) // Sort by weight ascending
      .map((item) => item.index);
    for (let i = 0; i < Math.abs(remainder); i++) {
      if (values[sortedByWeightIndices[i % numberOfParts]] > 0) {
        // Don't go below zero
        values[sortedByWeightIndices[i % numberOfParts]]--;
      }
    }
  }

  // Optional: Enforce min/max share if desired (can make distribution tricky)
  // This step is complex to do perfectly while maintaining the sum, so for randomness,
  // the weighted distribution is often sufficient for game purposes.
  // If strict min/max needed, would require iterative adjustments.
  // For now, we rely on the randomness of weights to provide variety.

  // Final sum check (more for debugging, should be correct now)
  const finalSum = values.reduce((acc, v) => acc + v, 0);
  if (finalSum !== totalValue && numberOfParts > 0) {
    // If still off by a tiny bit due to complex floating point issues or edge cases
    let diff = totalValue - finalSum;
    values[getRandomInt(0, numberOfParts - 1)] += diff; // Add/remove from a random part
    // console.warn(`Population distribution sum adjusted by ${diff}. Target: ${totalValue}, Got: ${finalSum}`);
  }

  return values;
};

/**
 * Generates random state legislative districts for a given US state object.
 * Modifies the stateObject by adding a 'legislativeDistricts' property.
 * @param {object} stateObject - The state object (must have .id, .name, .population).
 * @param {string} lowerHouseElectionTypeId - The electionType.id for lower house district seats.
 * @param {Array<object>} lowerHouseTiers - Tiers for determining number of lower house districts.
 * @param {string} upperHouseElectionTypeId - The electionType.id for upper house district seats.
 * @param {Array<object>} upperHouseTiers - Tiers for determining number of upper house districts.
 */
export const generateStateLegislativeDistricts = (
  stateObject,
  lowerHouseElectionTypeId, // e.g., "state_lower_house_member_usa"
  lowerHouseTiers, // Should be USA_STATE_LOWER_HOUSE_DISTRICT_TIERS
  upperHouseElectionTypeId, // e.g., "state_upper_house_member_usa"
  upperHouseTiers // Should be USA_STATE_UPPER_HOUSE_DISTRICT_TIERS
) => {
  if (
    !stateObject ||
    stateObject.population == null ||
    stateObject.population <= 0
  ) {
    console.warn(
      `  State ${stateObject?.name} population is ${stateObject?.population}. Aborting district generation.`
    );
    stateObject.legislativeDistricts = stateObject.legislativeDistricts || {};
    stateObject.legislativeDistricts[lowerHouseElectionTypeId] = []; // Ensure key exists
    stateObject.legislativeDistricts[upperHouseElectionTypeId] = []; // Ensure key exists
    return;
  }

  stateObject.legislativeDistricts = {}; // Initialize/reset

  // --- Generate for Lower House ---
  let numLowerDistricts = 0;
  if (
    lowerHouseTiers &&
    Array.isArray(lowerHouseTiers) &&
    lowerHouseTiers.length > 0
  ) {
    for (const tier of lowerHouseTiers) {
      if (stateObject.population >= tier.popThreshold) {
        numLowerDistricts = getRandomInt(
          tier.numDistrictsRange[0],
          tier.numDistrictsRange[1]
        );
        break;
      }
    }
  } else {
    console.warn(
      `  Lower House Tiers are missing or invalid for ${stateObject.name}. Defaulting numLowerDistricts.`
    );
  }
  numLowerDistricts = Math.max(1, numLowerDistricts); // Ensures at least 1 district if population > 0
  stateObject.legislativeDistricts[lowerHouseElectionTypeId] = []; // Initialize array
  if (numLowerDistricts > 0) {
    const lowerDistrictPopulations = distributeValueProportionally(
      stateObject.population,
      numLowerDistricts
    );
    for (let i = 0; i < numLowerDistricts; i++) {
      const districtNumber = i + 1;
      const districtData = {
        id: `${stateObject.id}_LHD${districtNumber}`, // e.g., USA_AL_LHD1
        name: `House District ${districtNumber}`, // Generic name
        population: lowerDistrictPopulations[i] || 0,
        // Add any other default district properties here
        stats: {},
        politicalLandscape: [],
        issues: [],
        politicalLeaning: "Moderate",
      };
      stateObject.legislativeDistricts[lowerHouseElectionTypeId].push(
        districtData
      );
    }
  }

  // --- Generate for Upper House ---
  let numUpperDistricts = 0;
  if (
    upperHouseTiers &&
    Array.isArray(upperHouseTiers) &&
    upperHouseTiers.length > 0
  ) {
    for (const tier of upperHouseTiers) {
      if (stateObject.population >= tier.popThreshold) {
        numUpperDistricts = getRandomInt(
          tier.numDistrictsRange[0],
          tier.numDistrictsRange[1]
        );
        break;
      }
    }
  } else {
    console.warn(
      `  Upper House Tiers are missing or invalid for ${stateObject.name}. Defaulting numUpperDistricts.`
    );
  }
  numUpperDistricts = Math.max(1, numUpperDistricts);

  stateObject.legislativeDistricts[upperHouseElectionTypeId] = [];
  if (numUpperDistricts > 0) {
    const upperDistrictPopulations = distributeValueProportionally(
      stateObject.population,
      numUpperDistricts
    );
    for (let i = 0; i < numUpperDistricts; i++) {
      const districtNumber = i + 1;
      const districtData = {
        id: `${stateObject.id}_UHD${districtNumber}`, // e.g., USA_AL_UHD1
        name: `Senate District ${districtNumber}`, // Generic name
        population: upperDistrictPopulations[i] || 0,
      };
      stateObject.legislativeDistricts[upperHouseElectionTypeId].push(
        districtData
      );
    }
  }
};

/**
 * Generates random U.S. Congressional (House of Representatives) districts for all states.
 * Adds them to usaCountryData.nationalLowerHouseDistricts.
 * Assumes states in usaCountryData.regions already have 'population'.
 * @param {object} usaCountryData - The country object for USA.
 * @param {Array<object>} congressionalDistrictTiers - Tiers for determining # of districts per state.
 */
export const generateUSCongressionalDistricts = (
  usaCountryData,
  congressionalDistrictTiers
) => {
  if (
    !usaCountryData ||
    usaCountryData.id !== "USA" ||
    !usaCountryData.regions
  ) {
    console.error(
      "Invalid or non-USA country data for generating congressional districts."
    );
    return;
  }
  usaCountryData.nationalLowerHouseDistricts = [];

  usaCountryData.regions.forEach((state) => {
    // state here is a US State object
    if (state.population == null) {
      console.warn(
        `State ${state.name} missing population. Skipping US Rep district generation for it.`
      );
      return;
    }
    let numDistricts = 1; // Min 1 per state
    for (const tier of congressionalDistrictTiers) {
      if (state.population >= tier.popThreshold) {
        numDistricts = getRandomInt(
          tier.numDistrictsRange[0],
          tier.numDistrictsRange[1]
        );
        break;
      }
    }
    numDistricts = Math.max(1, numDistricts);

    const districtPopulations = distributeValueProportionally(
      state.population,
      numDistricts
    );
    for (let i = 0; i < numDistricts; i++) {
      const districtNumber = i + 1;
      usaCountryData.nationalLowerHouseDistricts.push({
        id: `${state.id}_CD${districtNumber}`, // e.g., USA_CA_CD1
        name: `Congressional District ${districtNumber}`, // Generic, real names are just numbers mostly
        stateId: state.id,
        stateName: state.name, // Store for easy access by officeNameTemplate
        population: districtPopulations[i] || 0,
      });
    }
  });
  // Note: This random generation won't sum to exactly 435 national districts.
  // For game purposes, this per-state randomization is usually fine.
};

export const generatePhilippineProvincialBoardDistricts = (
  provinceObject,
  boardDistrictTiers, // PHL_PROVINCIAL_BOARD_DISTRICT_TIERS
  seatsPerDistrictRange // PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE
) => {
  if (
    !provinceObject ||
    provinceObject.population == null ||
    provinceObject.population <= 0
  ) {
    console.warn(
      `[PHL Districts] Province ${provinceObject?.name} missing population. Skipping board district gen.`
    );
    provinceObject.boardDistricts = []; // Ensure it's an empty array
    return;
  }

  let numBoardDistricts = 1;
  for (const tier of boardDistrictTiers) {
    if (provinceObject.population >= tier.popThreshold) {
      numBoardDistricts = getRandomInt(
        tier.numDistrictsRange[0],
        tier.numDistrictsRange[1]
      );
      break;
    }
  }
  numBoardDistricts = Math.max(1, numBoardDistricts);

  const boardDistrictPopulations = distributeValueProportionally(
    provinceObject.population,
    numBoardDistricts
  );
  provinceObject.boardDistricts = [];

  for (let i = 0; i < numBoardDistricts; i++) {
    const districtNumber = i + 1;
    const seatsToElectThisDistrict = getRandomInt(
      seatsPerDistrictRange[0],
      seatsPerDistrictRange[1]
    );
    provinceObject.boardDistricts.push({
      id: `${provinceObject.id}_BD${districtNumber}`, // e.g., PHL_PROV_LAG_BD1
      name: `${districtNumber}${getOrdinalSuffix(
        districtNumber
      )} Board District`, // "1st Board District", "2nd Board District"
      population: boardDistrictPopulations[i] || 0,
      seatsToElect: seatsToElectThisDistrict, // How many members this district elects
      // Add other default district properties if needed
    });
  }
  // console.log(`Generated ${numBoardDistricts} board districts for ${provinceObject.name}`);
};

/**
 * Generates National House of Representative (HR) districts for the Philippines,
 * assigning them per province based on population.
 * Modifies phlCountryObject by adding to 'nationalLowerHouseDistricts'.
 */
export const generatePhilippineHrDistricts = (
  phlCountryObject,
  hrDistrictTiers
) => {
  if (
    !phlCountryObject ||
    phlCountryObject.id !== "PHL" ||
    !phlCountryObject.regions
  ) {
    console.error(
      "[PHL Districts] Invalid PHL country data or missing provinces for HR district gen."
    );
    phlCountryObject.nationalLowerHouseDistricts = [];
    return;
  }

  phlCountryObject.nationalLowerHouseDistricts = []; // Initialize/clear

  // Note: Real PHL HR districts can be complex (lone districts of cities, etc.)
  // This is a simplified model distributing based on provincial populations.
  phlCountryObject.provinces.forEach((province) => {
    if (province.population == null || province.population <= 0) {
      console.warn(
        `[PHL Districts] Province ${province.name} missing population. Skipping HR district gen for it.`
      );
      return;
    }

    let numHrDistrictsForProvince = 1;
    for (const tier of hrDistrictTiers) {
      if (province.population >= tier.popThreshold) {
        numHrDistrictsForProvince = getRandomInt(
          tier.numDistrictsRange[0],
          tier.numDistrictsRange[1]
        );
        break;
      }
    }
    numHrDistrictsForProvince = Math.max(1, numHrDistrictsForProvince);

    const hrDistrictPopulations = distributeValueProportionally(
      province.population,
      numHrDistrictsForProvince
    );

    for (let i = 0; i < numHrDistrictsForProvince; i++) {
      const districtNumber = i + 1;
      // Name could be "{Province Name} {Number} District" or just "{Number} District of {Province}"
      // Some are "Lone District of {City}" if a city is an HR district.
      // This simplified naming uses province name.
      phlCountryObject.nationalLowerHouseDistricts.push({
        id: `${province.id}_HRD${districtNumber}`, // e.g., PHL_PROV_LAG_HRD1
        name: `${province.name} ${districtNumber}${getOrdinalSuffix(
          districtNumber
        )} Legislative District`,
        provinceId: province.id,
        provinceName: province.name, // For context
        population: hrDistrictPopulations[i] || 0,
        // Add other defaults
      });
    }
  });
  // console.log(`Generated ${phlCountryObject.nationalLowerHouseDistricts.length} total HR districts for PHL.`);
};

// Helper for names like "1st", "2nd", "3rd", "4th"
const getOrdinalSuffix = (i) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};
