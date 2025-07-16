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
 * Checks if dateA is strictly before dateB.
 * @param {{year: number, month: number, day: number}} dateA
 * @param {{year: number, month: number, day: number}} dateB
 * @returns {boolean}
 */
export const isDateBefore = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  if (dateA.year < dateB.year) return true;
  if (dateA.year > dateB.year) return false;
  // Same year, check month
  if (dateA.month < dateB.month) return true;
  if (dateA.month > dateB.month) return false;
  // Same month, check day
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

export const getTimeUntil = (
  currentDateObj,
  electionDateObj,
  electionStatus,
  playerIsCandidateInThisElection = false
) => {
  if (!currentDateObj || !electionDateObj) return "N/A";

  if (electionStatus === "concluded") return "Concluded";

  // Check if it's election day
  if (
    electionDateObj.getFullYear() === currentDateObj.getFullYear() &&
    electionDateObj.getMonth() === currentDateObj.getMonth() &&
    electionDateObj.getDate() === currentDateObj.getDate()
  ) {
    return playerIsCandidateInThisElection
      ? "Election Day! (Your Race)"
      : "Election Day!";
  }

  if (currentDateObj > electionDateObj && electionStatus !== "concluded") {
    return "Results Pending"; // Or "Processing"
  }

  const diffTime = electionDateObj.getTime() - currentDateObj.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Results Pending"; // Should be caught by concluded or election day check
  // Removed "Election Day!" from here as it's handled above more precisely
  if (diffDays === 1) return "Tomorrow!";
  if (diffDays <= 30) return `In ${diffDays} days`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths > 0 && diffMonths <= 12)
    return `In ~${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  if (diffDays > 360 && diffDays < 370 && diffMonths >= 11 && diffMonths <= 12)
    return `In ~1 year`; // More natural year display
  if (diffDays > 30) return `In ${diffDays} days`; // Fallback for >30 days but < ~11 months

  return "Date Error"; // Should not happen
};

export const isDateSameOrBefore = (dateA, dateB) => {
  if (!dateA || !dateB) return false; // Or handle error appropriately
  return areDatesEqual(dateA, dateB) || isDateBefore(dateA, dateB);
};

/**
 * Converts a HEX color string to an HSL object.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB").
 * @returns {{h: number, s: number, l: number} | null} HSL object or null if invalid hex.
 */
export function hexToHSL(hex) {
  if (!hex) return null;
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return null; // Invalid hex
  }

  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0; // Should not happen
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts an HSL color object to a HEX string.
 * @param {{h: number, s: number, l: number}} hsl - HSL object.
 * @returns {string} HEX color string.
 */
export function hslToHex({ h, s, l }) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Generates a random shade or tint of a base HEX color by adjusting lightness, saturation, and optionally hue.
 * @param {string} baseHexColor - The base color in HEX format.
 * @param {number} lightnessVariationPercentage - Max % to vary lightness (0-100). E.g., 20 means +/- 20%.
 * @param {number} saturationVariationPercentage - Max % to vary saturation (0-100). Optional.
 * @param {number} [hueVariationDegrees=0] - Max degrees to vary hue (+/-). Default 0 for no hue shift.
 * @returns {string} A new HEX color string, or the original if conversion fails.
 */
export function generateNuancedColor(
  baseHexColor,
  lightnessVariationPercentage = 15,
  saturationVariationPercentage = 10,
  hueVariationDegrees = 0 // New parameter for hue variation
) {
  const hsl = hexToHSL(baseHexColor); //
  if (!hsl) return baseHexColor; // Fallback to original if conversion fails

  // Adjust Lightness
  const lightVar = (lightnessVariationPercentage / 100) * hsl.l; //
  hsl.l += Math.random() * (lightVar * 2) - lightVar; //
  hsl.l = Math.max(0, Math.min(100, hsl.l)); // Clamp lightness between 0 and 100

  // Adjust Saturation (optional, makes it more varied)
  if (saturationVariationPercentage > 0) {
    //
    const satVar = (saturationVariationPercentage / 100) * hsl.s; //
    hsl.s += Math.random() * (satVar * 2) - satVar; //
    hsl.s = Math.max(0, Math.min(100, hsl.s)); // Clamp saturation
  }

  // Adjust Hue (new)
  if (hueVariationDegrees > 0) {
    const hueShift =
      Math.random() * (hueVariationDegrees * 2) - hueVariationDegrees;
    hsl.h += hueShift;
    // Ensure hue wraps around correctly (0-360 degrees)
    hsl.h = ((hsl.h % 360) + 360) % 360;
  }

  return hslToHex(hsl); //
}

/**
 * Generates a slightly "off" polling number for display to simulate margin of error.
 * @param {number} actualPolling - The true polling percentage (0-100).
 * @param {number} [maxMargin=3] - The maximum points to deviate (e.g., 3 means +/- 0-3 points).
 * @returns {number} The adjusted polling percentage for display.
 */
export const getDisplayedPolling = (actualPolling, maxMargin = 3) => {
  if (actualPolling == null) return 0; // Handle null or undefined
  const adjustment = getRandomInt(-maxMargin, maxMargin);
  let displayed = Math.round(actualPolling + adjustment); // Apply adjustment and round
  displayed = Math.max(0, Math.min(100, displayed)); // Clamp between 0 and 100
  return displayed;
};

export const adjustStatLevel = (currentLevel, levelsArray, change) => {
  let currentIndex = levelsArray.indexOf(currentLevel);
  if (currentIndex === -1) {
    console.warn(
      `adjustStatLevel: currentLevel "${currentLevel}" not found in levelsArray. Defaulting to middle.`
    );
    currentIndex = Math.floor(levelsArray.length / 2);
  }
  let newIndex = currentIndex + change;
  newIndex = Math.max(0, Math.min(levelsArray.length - 1, newIndex));
  return levelsArray[newIndex];
};

export const createNewsEventObject = (currentDate, eventDetails) => {
  return {
    id: generateId(),
    date: { ...(currentDate || { year: 0, month: 0, day: 0 }) },
    type: "general",
    scope: "local",
    impact: "neutral",
    ...eventDetails,
  };
};

/**
 * Normalizes an array of numbers or the values of an object so that their sum equals a target sum.
 * It attempts to distribute rounding errors to maintain the target sum as accurately as possible.
 *
 * @param {number[] | Record<string, number>} data - An array of numbers or an object with numeric values.
 * @param {number} targetSum - The desired sum for the normalized values (e.g., 100 for percentages).
 * @param {number} [precision=2] - The number of decimal places to round the normalized values to.
 * Use 0 for integers. Defaults to 2.
 * @returns {number[] | Record<string, number>} - The normalized data in the same format as input (array or object).
 * Returns the original data if input is invalid or sum is already correct/zero.
 */
export const normalizeArrayBySum = (data, targetSum, precision = 2) => {
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === "object" && Object.keys(data).length === 0)
  ) {
    console.warn("normalizeArrayBySum: Input data is empty or invalid.");
    return data; // Return original if empty or invalid
  }

  const isArray = Array.isArray(data);
  const values = isArray ? [...data] : Object.values(data);
  const keys = isArray ? null : Object.keys(data);

  if (values.some((val) => typeof val !== "number" || isNaN(val))) {
    console.warn(
      "normalizeArrayBySum: Input data contains non-numeric values."
    );
    return data; // Return original if non-numeric values are present
  }

  const currentSum = values.reduce((sum, val) => sum + val, 0);

  if (currentSum === 0) {
    // If all values are 0, cannot normalize to a non-zero targetSum meaningfully.
    // Distribute targetSum equally if you want, or return as is.
    // For now, returning as is, or you could assign targetSum / length to each if currentSum is 0 and targetSum is not.
    // If targetSum is also 0, then it's already correct.
    if (targetSum === 0) {
      return isArray
        ? values.map((v) => parseFloat(v.toFixed(precision)))
        : keys.reduce((obj, key, i) => {
            obj[key] = parseFloat(values[i].toFixed(precision));
            return obj;
          }, {});
    }
    // If currentSum is 0 but targetSum is not, this basic normalization won't work well without a rule for distribution.
    // For example, distribute equally:
    // const equalShare = parseFloat((targetSum / values.length).toFixed(precision));
    // const normalizedValues = values.map(() => equalShare);
    // // Adjust last element for sum if needed due to rounding of equalShare
    // const sumOfEqualShares = normalizedValues.reduce((s, v) => s + v, 0);
    // if (sumOfEqualShares !== targetSum) {
    //     normalizedValues[normalizedValues.length - 1] += (targetSum - sumOfEqualShares);
    //     normalizedValues[normalizedValues.length - 1] = parseFloat(normalizedValues[normalizedValues.length - 1].toFixed(precision));
    // }
    // // ... then reconstruct object if needed. For now, returning original if currentSum is 0 and targetSum is not.
    console.warn(
      "normalizeArrayBySum: Current sum is 0, cannot normalize to a non-zero target sum without specific distribution rules for zero-sum inputs."
    );
    return data;
  }

  if (currentSum === targetSum) {
    // Already normalized, just ensure precision
    return isArray
      ? values.map((v) => parseFloat(v.toFixed(precision)))
      : keys.reduce((obj, key, i) => {
          obj[key] = parseFloat(values[i].toFixed(precision));
          return obj;
        }, {});
  }

  const factor = targetSum / currentSum;
  let scaledValues = values.map((val) => val * factor);

  // Handle rounding and ensure the sum is exactly targetSum
  // This is a common problem with floating point arithmetic and rounding.
  // One strategy: round all but one, then adjust the last one.
  // A more robust strategy: round all, then distribute the difference.

  let normalizedValues = scaledValues.map((val) =>
    parseFloat(val.toFixed(precision))
  );
  let sumOfNormalized = normalizedValues.reduce((sum, val) => sum + val, 0);
  sumOfNormalized = parseFloat(sumOfNormalized.toFixed(precision + 2)); // Sum with higher precision to catch small diffs

  let difference = parseFloat(
    (targetSum - sumOfNormalized).toFixed(precision + 2)
  ); // Calculate difference with higher precision

  // Distribute the rounding difference.
  // A simple way is to add it to the element that was largest before scaling,
  // or iterate and adjust. We'll use an iterative approach to distribute small differences.
  // The unit of adjustment depends on the precision.
  const adjustmentUnit = parseFloat(
    Math.pow(10, -precision).toFixed(precision)
  );

  if (difference !== 0) {
    // Create an array of indices sorted by the original values (descending)
    // or by the fractional parts lost/gained during rounding.
    // For simplicity, we'll iterate and adjust. This might not be perfectly "fair" for all distributions
    // but works for small differences.
    const Diffs = scaledValues.map((sv, i) => sv - normalizedValues[i]);
    const order = Diffs.map((d, i) => i).sort((a, b) => Diffs[b] - Diffs[a]); // indices sorted by who lost most from rounding down

    if (difference > 0) {
      // We need to add
      for (
        let i = 0;
        i < order.length && difference > adjustmentUnit / 2;
        ++i
      ) {
        normalizedValues[order[i]] = parseFloat(
          (normalizedValues[order[i]] + adjustmentUnit).toFixed(precision)
        );
        difference = parseFloat(
          (difference - adjustmentUnit).toFixed(precision + 2)
        );
      }
    } else if (difference < 0) {
      // We need to subtract
      const orderNeg = Diffs.map((d, i) => i).sort(
        (a, b) => Diffs[a] - Diffs[b]
      ); // indices sorted by who gained most from rounding up
      for (
        let i = 0;
        i < orderNeg.length && difference < -adjustmentUnit / 2;
        ++i
      ) {
        normalizedValues[orderNeg[i]] = parseFloat(
          (normalizedValues[orderNeg[i]] - adjustmentUnit).toFixed(precision)
        );
        difference = parseFloat(
          (difference + adjustmentUnit).toFixed(precision + 2)
        );
      }
    }

    // If there's still a tiny difference after iterative adjustment (due to multiple adjustments summing up)
    // add it to the first element (or largest, or one with largest original value).
    // This ensures the sum is exact.
    sumOfNormalized = normalizedValues.reduce((sum, val) => sum + val, 0);
    sumOfNormalized = parseFloat(sumOfNormalized.toFixed(precision + 2));
    difference = parseFloat(
      (targetSum - sumOfNormalized).toFixed(precision + 2)
    );

    if (difference !== 0 && normalizedValues.length > 0) {
      // Find element with largest original value to absorb final difference
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

/**
 * Calculates the adult population based on total population and age distribution percentages.
 * Assumes youngAdult, adult, and senior categories are considered adults.
 * @param {number} totalPopulation - The total population of the city.
 * @param {object} ageDistribution - Object with age categories as percentages (e.g., { youth: 25, youngAdult: 30, adult: 30, senior: 15 }).
 * @returns {number} The calculated adult population, or 0 if inputs are invalid.
 */
export const calculateAdultPopulation = (totalPopulation, ageDistribution) => {
  if (
    typeof totalPopulation !== "number" ||
    totalPopulation <= 0 ||
    !ageDistribution
  ) {
    return 0;
  }

  const youngAdultPct = ageDistribution.youngAdult || 0; // Percentage, e.g., 20 for 20%
  const adultPct = ageDistribution.adult || 0;
  const seniorPct = ageDistribution.senior || 0;

  const totalAdultDecimal = (youngAdultPct + adultPct + seniorPct) / 100;

  if (totalAdultDecimal < 0 || totalAdultDecimal > 1) {
    console.warn(
      "calculateAdultPopulation: Invalid adult percentage sum:",
      totalAdultDecimal * 100
    );
    return Math.floor(
      totalPopulation * Math.max(0, Math.min(1, totalAdultDecimal))
    ); // Clamp decimal if erroneous
  }

  return Math.floor(totalPopulation * totalAdultDecimal);
};

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
