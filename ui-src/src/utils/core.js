// src/utils/core.js
// This file contains core, stateless utility functions used throughout the application.
// It is a consolidation of general, formatting, and population distribution utilities.

// --- General Utilities ---

/**
 * Generates a unique ID string.
 * @returns {string} A unique ID.
 */
export const generateId = () =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Gets a random element from an array.
 * @param {Array<any>} arr - The array to pick from.
 * @returns {any|null} A random element from the array, or null if the array is empty or undefined.
 */
export const getRandomElement = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Adjusts a stat level within a defined array of levels.
 * @param {string} currentLevel - The current string value of the level.
 * @param {string[]} levelsArray - The array of possible level strings.
 * @param {number} change - The integer amount to change the level by (+ or -).
 * @returns {string} The new level string.
 */
export const adjustStatLevel = (currentLevel, levelsArray, change) => {
  let currentIndex = levelsArray.indexOf(currentLevel);
  if (currentIndex === -1) {
    currentIndex = Math.floor(levelsArray.length / 2);
  }
  let newIndex = currentIndex + change;
  newIndex = Math.max(0, Math.min(levelsArray.length - 1, newIndex));
  return levelsArray[newIndex];
};

// --- Date Utilities ---

/**
 * Creates a Date object from a {year, month, day} structure.
 * @param {{year: number, month: number, day: number}} dateParts - The parts of the date.
 * @returns {Date | null} A Date object or null if input is invalid.
 */
export const createDateObj = (dateParts) => {
  if (
    !dateParts ||
    dateParts.year == null ||
    dateParts.month == null ||
    dateParts.day == null
  ) {
    return null;
  }
  return new Date(dateParts.year, dateParts.month - 1, dateParts.day);
};

/**
 * Checks if dateA is strictly before dateB.
 * @param {{year: number, month: number, day: number}} dateA
 * @param {{year: number, month: number, day: number}} dateB
 * @returns {boolean}
 */
export const isDateBefore = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  if (dateA.year < dateB.year) return true;
  if (dateA.year > dateB.year) return false;
  if (dateA.month < dateB.month) return true;
  if (dateA.month > dateB.month) return false;
  return dateA.day < dateB.day;
};

/**
 * Checks if dateA is the same as dateB.
 * @param {{year: number, month: number, day: number}} dateA
 * @param {{year: number, month: number, day: number}} dateB
 * @returns {boolean}
 */
export const areDatesEqual = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  return (
    dateA.year === dateB.year &&
    dateA.month === dateB.month &&
    dateA.day === dateB.day
  );
};

// --- Formatting Utilities ---

/**
 * Formats a camelCase budget key into a readable string.
 * e.g., "policeDepartment" -> "Police Department"
 * @param {string} key - The camelCase string.
 * @returns {string} The formatted string.
 */
export const formatBudgetKey = (key) => {
  if (typeof key !== "string") return "Invalid Key";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

/**
 * Formats a number as a percentage string.
 * @param {number} value - The number to format.
 * @param {number} [precision=1] - The number of decimal places.
 * @returns {string} The formatted percentage string.
 */
export const formatPercentage = (value, precision = 1) => {
  if (value == null || isNaN(value)) return "N/A";
  const numValue = Number(value);
  if (isNaN(numValue)) return "N/A";
  return `${numValue.toFixed(precision)}%`;
};

/**
 * Gets the ordinal suffix for a number (e.g., 1st, 2nd, 3rd, 4th).
 * @param {number} i - The number.
 * @returns {string} The ordinal suffix.
 */
export const getOrdinalSuffix = (i) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

// --- Population & Distribution Utilities ---

/**
 * Calculates the adult population based on total population and age distribution percentages.
 * @param {number} totalPopulation - The total population.
 * @param {object} ageDistribution - Object with age categories as percentages.
 * @returns {number} The calculated adult population.
 */
export const calculateAdultPopulation = (totalPopulation, ageDistribution) => {
  if (
    typeof totalPopulation !== "number" ||
    totalPopulation <= 0 ||
    !ageDistribution
  ) {
    return 0;
  }
  const youngAdultPct = ageDistribution.youngAdult || 0;
  const adultPct = ageDistribution.adult || 0;
  const seniorPct = ageDistribution.senior || 0;
  const totalAdultDecimal = (youngAdultPct + adultPct + seniorPct) / 100;

  if (totalAdultDecimal < 0 || totalAdultDecimal > 1) {
    return Math.floor(
      totalPopulation * Math.max(0, Math.min(1, totalAdultDecimal))
    );
  }
  return Math.floor(totalPopulation * totalAdultDecimal);
};

/**
 * Distributes a total value among a number of parts, ensuring the sum matches.
 * @param {number} totalValue - The total value to distribute.
 * @param {number} numberOfParts - The number of parts to distribute among.
 * @returns {number[]} An array of values for each part.
 */
export const distributeValueProportionally = (totalValue, numberOfParts) => {
  if (numberOfParts <= 0) return [];
  if (totalValue <= 0) return new Array(numberOfParts).fill(0);

  let values = new Array(numberOfParts).fill(0);
  let assignedValue = 0;
  let weights = [];
  let totalWeight = 0;

  for (let i = 0; i < numberOfParts; i++) {
    const weight = getRandomInt(10, 100);
    weights.push(weight);
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    for (let i = 0; i < numberOfParts; i++) {
      const proportion = weights[i] / totalWeight;
      values[i] = Math.floor(proportion * totalValue);
      assignedValue += values[i];
    }
  }

  let remainder = totalValue - assignedValue;
  if (remainder !== 0) {
    const sortedByWeightIndices = weights
      .map((w, index) => ({ weight: w, index }))
      .sort((a, b) => b.weight - a.weight)
      .map((item) => item.index);

    for (let i = 0; i < Math.abs(remainder); i++) {
      values[sortedByWeightIndices[i % numberOfParts]] += Math.sign(remainder);
    }
  }

  return values;
};

/**
 * Normalizes an array of numbers or the values of an object so that their sum equals a target sum.
 * @param {number[] | Record<string, number>} data - An array of numbers or an object with numeric values.
 * @param {number} targetSum - The desired sum for the normalized values (e.g., 100).
 * @param {number} [precision=2] - The number of decimal places for the result.
 * @returns {number[] | Record<string, number>} The normalized data in the same format as input.
 */
export const normalizeArrayBySum = (data, targetSum, precision = 2) => {
  const isArray = Array.isArray(data);
  const values = isArray ? [...data] : Object.values(data);
  const keys = isArray ? null : Object.keys(data);
  const currentSum = values.reduce((sum, val) => sum + val, 0);

  if (currentSum === 0) {
    // Cannot normalize a zero-sum array to a non-zero target without a rule.
    // Returning original data is a safe default.
    return data;
  }

  const factor = targetSum / currentSum;
  let scaledValues = values.map((val) => val * factor);

  let normalizedValues = scaledValues.map((val) =>
    parseFloat(val.toFixed(precision))
  );
  let sumOfNormalized = normalizedValues.reduce((sum, val) => sum + val, 0);
  let difference = targetSum - sumOfNormalized;

  if (Math.abs(difference) > 1e-9) {
    // Check for floating point inaccuracies
    // Distribute the rounding difference to the element with the largest original value
    let maxVal = -Infinity;
    let maxIdx = 0;
    values.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });
    normalizedValues[maxIdx] = parseFloat(
      (normalizedValues[maxIdx] + difference).toFixed(precision)
    );
  }

  if (isArray) {
    return normalizedValues;
  } else {
    const resultObject = {};
    keys.forEach((key, index) => {
      resultObject[key] = normalizedValues[index];
    });
    return resultObject;
  }
};
