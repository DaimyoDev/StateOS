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
  // ### CORRECTED STATE CLONING ###
  // Start with a shallow copy of the campaign state.
  let newState = { ...currentState };
  // If elections exist, we must deep-copy them carefully to preserve the candidates Map.
  if (newState.elections) {
    newState.elections = newState.elections.map((election) => ({
      ...election,
      candidates: new Map(election.candidates), // This correctly clones the Map!
    }));
  }
  // This ensures the rest of the function works on a safe, mutable copy without corrupting the original state.

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
        conditionMet =
          newState.startingCity?.stats?.mainIssues?.includes("Pollution");
        break;
      case "current_drought_severe":
        conditionMet = false;
        break;
      case "wealth_inequality_high":
        conditionMet = false;
        break;
      case "population_young_families_high":
        conditionMet = false;
        break;
      case "demographics_seniors_high":
        conditionMet = false;
        break;
      default:
        conditionMet = true;
    }
  }
  if (!conditionMet) {
    return newState; // Condition not met, effect does not trigger
  }

  let pathString = effect.targetStat;
  if (pathString.startsWith("budget.")) {
    pathString = `startingCity.stats.${pathString}`;
  }
  const path = pathString.split(".");
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
    const pDetails = effect.parameterDetails;
    const chosenValue = policyChosenParameters[pDetails?.key || "amount"];

    if (chosenValue !== undefined) {
      if (effect.type.includes("conditional_level_change_by_param")) {
        actualChange =
          (chosenValue > 0 ? effect.change_direction : 0) *
          effect.base_change_for_default;
      } else if (effect.type.includes("conditional_mood_shift_by_tax_change")) {
        actualChange = chosenValue > 0 ? -1 : chosenValue < 0 ? 1 : 0;
      } else if (
        effect.type.includes("conditional_approval_shift_by_tax_change")
      ) {
        actualChange = chosenValue > 0 ? -5 : chosenValue < 0 ? 5 : 0;
      } else if (
        effect.type.includes("conditional_level_change_by_tax_change")
      ) {
        actualChange = chosenValue < 0 ? 1 : chosenValue > 0 ? -1 : 0;
      }
    } else {
      actualChange = effect.change || 0;
    }
  }

  // Handle special types for budget adjustments
  if (effect.type === "absolute_set_rate") {
    target[lastKey] = actualChange;
  } else if (effect.type === "formula_absolute_change") {
    const formula = effect.changeFormula;
    let calculatedValue = 0;
    try {
      const { population, gdpPerCapita } = newState.startingCity;
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
        target[lastKey] = (target[lastKey] || 0) + actualChange;
        break;
      case "absolute_change":
      case "absolute_change_recurring":
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
