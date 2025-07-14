import { getRandomInt } from "../generalUtils";
import { distributeValueProportionally } from "../populationUtils";

export const initializeUsaStructures = (usaCountryData, usaTierData) => {
  if (usaCountryData.regions && usaCountryData.regions.length > 0) {
    usaCountryData.regions.forEach((state) => {
      if (state.population > 0) {
        generateStateLegislativeDistricts(
          state,
          "state_hr",
          usaTierData.USA_STATE_LOWER_HOUSE_DISTRICT_TIERS,
          "state_senate",
          usaTierData.USA_STATE_UPPER_HOUSE_DISTRICT_TIERS
        );
      }
    });
  }

  generateUSCongressionalDistricts(
    usaCountryData,
    usaTierData.USA_CONGRESSIONAL_DISTRICT_TIERS
  );
};

const generateStateLegislativeDistricts = (
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

const generateUSCongressionalDistricts = (
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
