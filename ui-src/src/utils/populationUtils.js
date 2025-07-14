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
  KOR_LOCAL_BASIC_COUNCIL_TIERS,
  KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS,
  KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS,
} from "../data/countriesData";
import { initializeUsaStructures } from "./chamberStructures/usaStructures";
import { initializeJapanStructures } from "./chamberStructures/japanStructures";
import { initializePhilippinesStructures } from "./chamberStructures/philippinesStructures";
import { initializeKoreanStructures } from "./chamberStructures/koreanStructures";

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
    KOR_LOCAL_BASIC_COUNCIL_TIERS,
    KOR_NATIONAL_ASSEMBLY_CONSTITUENCY_TIERS,
    KOR_PROVINCIAL_METROPOLITAN_ASSEMBLY_TIERS,
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
    } else if (country.id === "KOR") {
      initializeKoreanStructures;
    }
    if (
      country.nationalLowerHouseDistricts.length > 0 &&
      country.nationalLowerHouseDistricts.some(
        (d) => d.population === undefined || d.population === 0
      ) &&
      // Avoid re-populating if already done by specific initializers for these countries
      !["USA", "JPN", "PHL", "KOR"].includes(country.id) // Example condition
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

// Helper for names like "1st", "2nd", "3rd", "4th"
export const getOrdinalSuffix = (i) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};
