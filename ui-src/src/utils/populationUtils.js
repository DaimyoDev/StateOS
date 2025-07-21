import { distributeValueProportionally, getRandomInt } from "./core";
import { generateAllLegislativeDistricts } from "../entities/districtGeneration";

/**
 * Assigns random populations to countries and their regions.
 * Modifies the input countriesData array directly.
 * @param {Array<object>} countriesData - The COUNTRIES_DATA array.
 * @param {object} countryPopulationRanges - Object with countryId as key and {min, max} population as value.
 * @returns {Array<object>} The modified countriesData array.
 */
export const assignNestedPopulations = (
  countriesData, // This array will be modified directly
  countryPopulationRanges
) => {
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

    // Initialize arrays for future district population by generateAllLegislativeDistricts
    country.nationalLowerHouseDistricts = []; // Ensure it's an empty array to start
    country.nationalPrBlocs = country.nationalPrBlocs || []; // Keep existing if populated elsewhere, or ensure empty

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

    // 3. Assign Populations to Secondary Regions (e.g., PHL Provinces)
    // This is important before district generation for provinces.
    // Ensure `distributeValueProportionally` works correctly, perhaps
    // distribute from parent region's population if they are nested.
    if (country.provinces && country.provinces.length > 0) {
      // For simplicity, distributing from country population. For greater accuracy,
      // you might want to distribute from their parent 'region' population for PHL.
      const provincePopulations = distributeValueProportionally(
        country.population * 0.9, // Allocate a portion of country population to provinces, adjust as needed
        country.provinces.length
      );
      country.provinces.forEach((province, index) => {
        province.population = provincePopulations[index] || 0;
      });
    }
  });
  generateAllLegislativeDistricts(countriesData);

  return countriesData;
};
