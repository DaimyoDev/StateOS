import { getRandomInt } from "../generalUtils";
import { distributeValueProportionally } from "../populationUtils";

export const initializeKoreanStructures = (korCountryData, korTierData) => {
  if (!korCountryData.nationalLowerHouseDistricts) {
    korCountryData.nationalLowerHouseDistricts = [];
  }

  if (korCountryData.regions && korCountryData.regions.length > 0) {
    korCountryData.regions.forEach((region) => {
      if (region.population > 0) {
        let numNaDistrictsForRegion = 1;
        for (const tier of korTierData.KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS) {
          if (region.population >= tier.popThreshold) {
            numNaDistrictsForRegion = getRandomInt(
              tier.numDistrictsRange[0],
              tier.numDistrictsRange[1]
            );
            break;
          }
        }
        numNaDistrictsForRegion = Math.max(1, numNaDistrictsForRegion);

        const naDistrictPopulations = distributeValueProportionally(
          region.population,
          numNaDistrictsForRegion
        );

        for (let i = 0; i < numNaDistrictsForRegion; i++) {
          const districtNumber = i + 1;
          korCountryData.nationalLowerHouseDistricts.push({
            id: `${region.id}_NAD${districtNumber}`,
            name: `${region.name} National Assembly District ${districtNumber}`,
            regionId: region.id,
            regionName: region.name,
            population: naDistrictPopulations[i] || 0,
            stats: {},
            politicalLandscape: [],
            issues: [],
            politicalLeaning: "Moderate",
          });
        }

        generateKoreanProvincialMetropolitanAssemblyDistricts(
          region,
          "provincial_metropolitan_assembly",
          korTierData.KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS
        );
      }
    });
  }
};

/**
 * Generates random legislative districts for a given Korean Provincial/Metropolitan administrative division.
 * Modifies the regionObject by adding a 'legislativeDistricts' property.
 * @param {object} regionObject
 * @param {string} electionTypeId
 * @param {Array<object>} assemblyTiers
 */
export const generateKoreanProvincialMetropolitanAssemblyDistricts = (
  regionObject,
  electionTypeId,
  assemblyTiers
) => {
  if (
    !regionObject ||
    regionObject.population == null ||
    regionObject.population <= 0
  ) {
    console.warn(
      `  Korean Region ${regionObject?.name} population is ${regionObject?.population}. Aborting assembly district generation.`
    );
    regionObject.legislativeDistricts = regionObject.legislativeDistricts || {};
    regionObject.legislativeDistricts[electionTypeId] = []; // Ensure key exists
    return;
  }

  regionObject.legislativeDistricts = regionObject.legislativeDistricts || {}; // Initialize if not exists

  let numDistricts = 0;
  if (
    assemblyTiers &&
    Array.isArray(assemblyTiers) &&
    assemblyTiers.length > 0
  ) {
    for (const tier of assemblyTiers) {
      if (regionObject.population >= tier.popThreshold) {
        numDistricts = getRandomInt(
          tier.numDistrictsRange[0],
          tier.numDistrictsRange[1]
        );
        break;
      }
    }
  } else {
    console.warn(
      `  Assembly Tiers are missing or invalid for ${regionObject.name}. Defaulting numDistricts.`
    );
  }
  numDistricts = Math.max(1, numDistricts); // Ensures at least 1 district if population > 0

  regionObject.legislativeDistricts[electionTypeId] = []; // Initialize array
  if (numDistricts > 0) {
    const districtPopulations = distributeValueProportionally(
      regionObject.population,
      numDistricts
    );
    for (let i = 0; i < numDistricts; i++) {
      const districtNumber = i + 1;
      const districtData = {
        id: `${regionObject.id}_PAD${districtNumber}`, // e.g., KOR_GG_PAD1 (Provincial Assembly District)
        name: `${regionObject.name} Assembly District ${districtNumber}`, // Generic name
        population: districtPopulations[i] || 0,
        stats: {},
        politicalLandscape: [],
        issues: [],
        politicalLeaning: "Moderate",
      };
      regionObject.legislativeDistricts[electionTypeId].push(districtData);
    }
  }
};
