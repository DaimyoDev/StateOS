import { getRandomInt } from "../generalUtils";
import {
  distributeValueProportionally,
  getOrdinalSuffix,
} from "../populationUtils";

export const initializePhilippinesStructures = (
  phlCountryData,
  phlTierData
) => {
  if (!phlCountryData.provinces || phlCountryData.provinces.length === 0) {
    console.warn("PHL: No provinces found to initialize structures.");
    return;
  }
  if (!phlCountryData.regions || phlCountryData.regions.length === 0) {
    console.warn(
      "PHL: No administrative regions found for province population distribution."
    );
    const provincePopulations = distributeValueProportionally(
      phlCountryData.population,
      phlCountryData.provinces.length
    );
    phlCountryData.provinces.forEach((province, index) => {
      province.population = provincePopulations[index] || 0;
    });
  } else {
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
        provincesInRegion.forEach((province) => (province.population = 0));
      }
    });
  }

  phlCountryData.provinces.forEach((province) => {
    if (province.population > 0) {
      generatePhilippineProvincialBoardDistricts(
        province,
        phlTierData.PHL_PROVINCIAL_BOARD_DISTRICT_TIERS,
        phlTierData.PHL_SEATS_PER_PROVINCIAL_BOARD_DISTRICT_RANGE
      );
    } else {
      province.boardDistricts = [];
    }
  });

  generatePhilippineHrDistricts(
    phlCountryData,
    phlTierData.PHL_HR_DISTRICTS_PER_PROVINCE_TIERS
  );
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
