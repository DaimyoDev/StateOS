import { generateAllLegislativeDistricts } from "./districtGenerationUtils";
import { getRandomInt } from "./generalUtils";

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
