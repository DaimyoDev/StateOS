import { areDatesEqual, isDateBefore, getRandomInt, generateId } from "./core";

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
