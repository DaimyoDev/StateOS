// ui-src/src/simulation/applyPolicyEffects.js
import { adjustStatLevel } from "../utils/core.js";
import { RATING_LEVELS, MOOD_LEVELS } from "../data/governmentData";

const getTargetObjectAndKey = (campaignState, effect) => {
  const { level, targetStat, isBudgetItem, isTaxRate } = effect;

  let baseObject;
  switch (level) {
    case 'city':
      baseObject = campaignState.startingCity?.stats;
      break;
    case 'state':
      baseObject = campaignState.regions?.find(r => r.id === campaignState.startingCity?.regionId)?.stats;
      break;
    case 'national':
      baseObject = campaignState.country?.stats;
      break;
    default:
      baseObject = campaignState.startingCity?.stats;
  }

  if (!baseObject) {
    console.warn(`[getTargetObjectAndKey] Could not find baseObject for level: ${level}`);
    return { target: null, lastKey: null };
  }

  if (isBudgetItem) {
    if (!baseObject.budget) baseObject.budget = {};
    if (!baseObject.budget.expenseAllocations) baseObject.budget.expenseAllocations = {};
    return { target: baseObject.budget.expenseAllocations, lastKey: targetStat };
  } else if (isTaxRate) {
    if (!baseObject.budget) baseObject.budget = {};
    if (!baseObject.budget.taxRates) baseObject.budget.taxRates = {};
    return { target: baseObject.budget.taxRates, lastKey: targetStat };
  }

  const pathParts = targetStat.split('.');
  let currentTarget = baseObject;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (currentTarget[part] === undefined) {
      currentTarget[part] = {};
    }
    currentTarget = currentTarget[part];
  }

  return { target: currentTarget, lastKey: pathParts[pathParts.length - 1] };
};

const setNestedValue = (obj, path, value) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
};

export const applyPolicyEffect = (currentState, effect, policyChosenParameters = {}) => {
  if (!effect || !effect.targetStat) {
    return currentState;
  }


  if (effect.chance !== undefined && Math.random() > effect.chance) {
    return currentState; // Return original state if chance fails
  }

  const draft = currentState; // Work directly on the passed state object

  let conditionMet = true;
  if (effect.condition) {
    // Condition logic can be expanded here
  }
  if (!conditionMet) {
    return currentState; // Return original state if condition not met
  }

  // Handle effects that directly set a simulation variable (e.g., minimum wage)
  if (effect.setsSimulationVariable && effect.parameterDetails) {
    const { targetStat, key } = effect.parameterDetails;
    const value = effect.parameters?.[key];

    if (targetStat && value !== undefined) {
      setNestedValue(draft, targetStat, value);
    }
  } else {
    const { target, lastKey } = getTargetObjectAndKey(draft, effect);

    if (!target || !lastKey) return draft; // Guard against invalid target

    let actualChange = effect.change || 0;
    if (effect.type.includes("by_param") || effect.type.includes("by_tax_change")) {
      // Parameterized logic here...
    }

    switch (effect.type) {
      case "level_change":
      case "conditional_level_change_by_param":
        target[lastKey] = adjustStatLevel(target[lastKey], RATING_LEVELS, actualChange);
        break;
      case "mood_shift":
      case "conditional_mood_shift":
      case "conditional_mood_shift_by_tax_change":
        target[lastKey] = adjustStatLevel(target[lastKey], MOOD_LEVELS, actualChange);
        break;
      case "percentage_point_change":
        target[lastKey] = (target[lastKey] || 0) + actualChange;
        break;
      case "absolute_change":
      case "absolute_change_recurring":
        if (typeof target[lastKey] === "number") {
          target[lastKey] += actualChange;
        }
        break;
      case "absolute_set_rate":
        target[lastKey] = actualChange;
        break;
      default:
        console.warn(`[applyPolicyEffect] Unknown or unhandled effect type: ${effect.type}`);
        break;
    }
  }

  return currentState;
};
