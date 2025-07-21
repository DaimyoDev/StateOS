// ui-src/src/simulation/applyPolicyEffects.js
import { adjustStatLevel } from "../utils/core.js";
import { RATING_LEVELS, MOOD_LEVELS } from "../data/governmentData";

/**
 * Applies a single policy effect to the game state.
 * @param {object} currentState - The current campaign state (or a draft of it).
 * @param {object} effect - The effect object from policyDefinitions.
 * @param {object} policyChosenParameters - The parameters chosen for the policy, if it's parameterized.
 * @returns {object} The updated state after applying the effect.
 */
export const applyPolicyEffect = (
  currentState,
  effect,
  policyChosenParameters = {}
) => {
  let newState = JSON.parse(JSON.stringify(currentState)); // Deep copy to avoid direct mutation

  // Check chance first
  if (effect.chance !== undefined && Math.random() > effect.chance) {
    return newState; // Effect does not trigger
  }

  // Handle conditions (simple string checks for now, expand as needed)
  let conditionMet = true;
  if (effect.condition) {
    switch (effect.condition) {
      case "mainIssue_is_Housing":
        conditionMet =
          newState.startingCity?.stats?.mainIssues?.includes("Housing");
        break;
      case "Green_party_strong_or_Pollution_is_issue":
        // Simplified: check if environmental pollution is a main issue
        conditionMet =
          newState.startingCity?.stats?.mainIssues?.includes("Pollution");
        break;
      case "current_drought_severe":
        // Placeholder for a more complex weather/event system
        conditionMet = false; // Assume no severe drought for now
        break;
      case "wealth_inequality_high":
        // Placeholder, needs actual stat for wealth inequality
        conditionMet = false; // Assume not high for now
        break;
      case "population_young_families_high":
        // Placeholder, needs demographic data
        conditionMet = false; // Assume not high for now
        break;
      case "demographics_seniors_high":
        // Placeholder, needs demographic data
        conditionMet = false; // Assume not high for now
        break;
      default:
        conditionMet = true; // Unknown conditions are treated as always true
    }
  }
  if (!conditionMet) {
    return newState; // Condition not met, effect does not trigger
  }

  const path = effect.targetStat.split(".");
  let target = newState;
  let lastKey = null;

  for (let i = 0; i < path.length; i++) {
    lastKey = path[i];
    if (i < path.length - 1) {
      target = target[lastKey];
      if (target === undefined) {
        console.warn(
          `[applyPolicyEffect] Target path part "${lastKey}" not found.`
        );
        return currentState; // Return original state if path is invalid
      }
    }
  }

  let actualChange = effect.change || 0;

  // Handle parameterized policies
  if (
    effect.type.includes("by_param") ||
    effect.type.includes("by_tax_change")
  ) {
    const pDetails = effect.parameterDetails; // This should come from the policyDef if effect.isParameterized is true
    // For now, assume a simple amount from chosenParameters if present
    const chosenValue = policyChosenParameters[pDetails?.key || "amount"];

    if (chosenValue !== undefined) {
      if (effect.type.includes("conditional_level_change_by_param")) {
        // Example: If funding amount is positive, increase stat.
        // Base change adjusted by parameter magnitude, or a fixed amount.
        actualChange =
          (chosenValue > 0 ? effect.change_direction : 0) *
          effect.base_change_for_default;
        // Could also make change scale with chosenValue: actualChange = Math.sign(chosenValue) * (Math.abs(chosenValue) / SOME_UNIT);
      } else if (effect.type.includes("conditional_mood_shift_by_tax_change")) {
        // If tax increased, mood decreases, vice-versa.
        actualChange = chosenValue > 0 ? -1 : chosenValue < 0 ? 1 : 0;
      } else if (
        effect.type.includes("conditional_approval_shift_by_tax_change")
      ) {
        actualChange = chosenValue > 0 ? -5 : chosenValue < 0 ? 5 : 0;
        // Make player approval changes more pronounced
      } else if (
        effect.type.includes("conditional_level_change_by_tax_change")
      ) {
        actualChange = chosenValue < 0 ? 1 : chosenValue > 0 ? -1 : 0; // Tax cut -> good for economy, tax hike -> bad
      }
    } else {
      // If parameterized but no chosenValue or not handled, fall back to default behavior if any
      actualChange = effect.change || 0;
    }
  }

  // Handle special types for budget adjustments
  if (effect.type === "absolute_set_rate") {
    target[lastKey] = actualChange;
  } else if (effect.type === "formula_absolute_change") {
    // This is a simplified eval. In a real app, use a safe expression parser.
    const formula = effect.changeFormula;
    let calculatedValue = 0;
    try {
      // Provide variables from currentState that the formula might use
      const { population, gdpPerCapita } = newState.startingCity;
      // This is highly insecure and should be replaced with a proper math expression parser
      // For this specific use case from policyDefinitions (population * gdpPerCapita * 0.0005), it's relatively safe
      // but general eval() is dangerous.
      calculatedValue = eval(
        formula
          .replace(/population/g, population)
          .replace(/gdpPerCapita/g, gdpPerCapita)
      );
    } catch (e) {
      console.error("[applyPolicyEffect] Error evaluating formula:", e);
      calculatedValue = 0;
    }
    target[lastKey] = (target[lastKey] || 0) + calculatedValue;
  } else {
    // Apply changes based on effect type
    switch (effect.type) {
      case "level_change":
      case "conditional_level_change_by_param":
        target[lastKey] = adjustStatLevel(
          target[lastKey],
          RATING_LEVELS,
          actualChange
        );
        break;
      case "mood_shift":
      case "conditional_mood_shift":
      case "conditional_mood_shift_by_tax_change":
        target[lastKey] = adjustStatLevel(
          target[lastKey],
          MOOD_LEVELS,
          actualChange
        );
        break;
      case "percentage_point_change":
        target[lastKey] = (target[lastKey] || 0) + actualChange; // actualChange is already in decimal percentage points (e.g., 0.005)
        break;
      case "absolute_change":
      case "absolute_change_recurring": // Recurring handled externally by monthly tick, just apply initial change here
        target[lastKey] = (target[lastKey] || 0) + actualChange;
        break;
      case "conditional_approval_shift":
      case "conditional_approval_shift_by_tax_change":
        target[lastKey] = (target[lastKey] || 0) + actualChange;
        break;
      default:
        console.warn(
          `[applyPolicyEffect] Unknown or unhandled effect type: ${effect.type}`
        );
        break;
    }
  }

  return newState;
};
