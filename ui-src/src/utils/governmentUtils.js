import { getRandomElement } from "./generalUtils"; // You'll need normalizeArrayBySum
import { POLICY_QUESTIONS } from "../data/policyData"; // For electorate profile
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../data/governmentData";

// --- Electorate Policy Profile Generation ---
export const generateInitialElectoratePolicyProfile = () => {
  const profile = {};
  POLICY_QUESTIONS.forEach((q) => {
    if (q.options?.length > 0) {
      // TODO: Make this more sophisticated based on demographics, economy, country leanings
      // For now, random, but slightly weighted if possible
      // Example: if high senior population, lean towards policies good for seniors on relevant questions.
      profile[q.id] = getRandomElement(q.options).value;
    }
  });
  return profile;
};

// Helper to normalize an object of percentages to sum to a target (e.g., 100)
// Example: normalizeArrayBySum({ youth: 20, adult: 30, senior: 60}, 100) -> if sum is 110, scales down.
// For use in demographics.
// Note: This is a simplified normalization.
export function normalizeDemographics(obj, targetSum) {
  const newObj = { ...obj };
  const currentSum = Object.values(newObj).reduce((s, v) => s + v, 0);
  if (currentSum === 0 || currentSum === targetSum) return newObj;

  const factor = targetSum / currentSum;
  let runningTotal = 0;
  const keys = Object.keys(newObj);

  keys.forEach((key, index) => {
    if (index < keys.length - 1) {
      newObj[key] = Math.round(newObj[key] * factor);
      runningTotal += newObj[key];
    } else {
      // Assign the remainder to the last category to ensure exact sum
      newObj[key] = targetSum - runningTotal;
    }
  });
  // Final check for any rounding issues leading to negative, adjust if necessary
  if (newObj[keys[keys.length - 1]] < 0) {
    // this indicates an issue, might need a more robust normalization for small numbers
    // for now, just set to 0 and adjust another category
    let deficit = newObj[keys[keys.length - 1]];
    newObj[keys[keys.length - 1]] = 0;
    newObj[keys[0]] += deficit; // Add deficit to first category as a simple fix
  }
  return newObj;
}
