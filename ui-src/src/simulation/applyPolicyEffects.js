// ui-src/src/simulation/applyPolicyEffects.js
import { adjustStatLevel } from "../utils/core.js";
import { RATING_LEVELS, MOOD_LEVELS } from "../data/governmentData";

// Cache for expensive lookups
let _cachedStateRegion = null;
let _lastCampaignStateId = null;

const getTargetObjectAndKey = (campaignState, effect) => {
  const { level, targetStat, isBudgetItem, isTaxRate } = effect;

  let baseObject;
  switch (level) {
    case "city":
      baseObject = campaignState.startingCity?.stats;
      break;
    case "state":
      // Cache the expensive region lookup
      if (_lastCampaignStateId !== campaignState.id || !_cachedStateRegion) {
        _cachedStateRegion = campaignState.regions?.find(
          (r) => r.id === campaignState.startingCity?.regionId
        );
        _lastCampaignStateId = campaignState.id;
      }
      baseObject = _cachedStateRegion?.stats;
      break;
    case "national":
      baseObject = campaignState.country?.stats;
      break;
    default:
      baseObject = campaignState.startingCity?.stats;
  }

  if (!baseObject) {
    console.warn(
      `[getTargetObjectAndKey] Could not find baseObject for level: ${level}`
    );
    return { target: null, lastKey: null };
  }

  if (isBudgetItem) {
    if (!baseObject.budget) baseObject.budget = {};
    if (!baseObject.budget.expenseAllocations)
      baseObject.budget.expenseAllocations = {};
    return {
      target: baseObject.budget.expenseAllocations,
      lastKey: targetStat,
    };
  } else if (isTaxRate) {
    if (!baseObject.budget) baseObject.budget = {};
    if (!baseObject.budget.taxRates) baseObject.budget.taxRates = {};
    return { target: baseObject.budget.taxRates, lastKey: targetStat };
  }

  // Validate targetStat before splitting
  if (!targetStat || typeof targetStat !== "string") {
    console.warn(
      `[getTargetObjectAndKey] Invalid targetStat: ${targetStat}`,
      effect
    );
    return { target: null, lastKey: null };
  }

  const pathParts = targetStat.split(".");
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
  const keys = path.split(".");

  // Handle cityLaws paths directly - bypass generic traversal
  if (path.startsWith("cityLaws.")) {
    const cityLawsKey = keys[1]; // e.g., "minimumWage"

    if (obj.startingCity && obj.startingCity.cityLaws) {
      obj.startingCity.cityLaws[cityLawsKey] = value;
    }
    return obj;
  }

  let current = obj;

  // Handle stateLaws paths
  if (path.startsWith("stateLaws.")) {
    const stateKeys = keys.slice(1); // Remove 'stateLaws' prefix
    const currentRegion = obj.regions?.find(
      (r) => r.id === obj.startingCity?.regionId
    );
    if (currentRegion && currentRegion.stateLaws) {
      current = currentRegion.stateLaws;
      for (let i = 0; i < stateKeys.length - 1; i++) {
        const key = stateKeys[i];
        if (current[key] === undefined || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key];
      }
      current[stateKeys[stateKeys.length - 1]] = value;
      return obj;
    }
  }

  // Handle nationalLaws paths
  if (path.startsWith("nationalLaws.")) {
    const nationalKeys = keys.slice(1); // Remove 'nationalLaws' prefix
    if (obj.country && obj.country.nationalLaws) {
      current = obj.country.nationalLaws;
      for (let i = 0; i < nationalKeys.length - 1; i++) {
        const key = nationalKeys[i];
        if (current[key] === undefined || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key];
      }
      current[nationalKeys[nationalKeys.length - 1]] = value;
      return obj;
    }
  }

  // Standard nested value setting for other paths
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined) {
      current[key] = {};
    } else if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
};

export const applyPolicyEffect = (campaignState, effect, parameters = {}) => {
  if (!campaignState || !effect) {
    console.warn("[applyPolicyEffect] Missing campaignState or effect");
    return;
  }

  const currentState = campaignState;

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
      // Ensure cityLaws structure exists for minimum wage and other city laws
      if (targetStat.startsWith("cityLaws.") && !draft.startingCity?.cityLaws) {
        if (draft.startingCity) {
          // Initialize with empty object only if it doesn't exist at all
          draft.startingCity.cityLaws = {};
        }
      }
      
      // Ensure stateLaws structure exists for state-level laws
      if (targetStat.startsWith("stateLaws.")) {
        const currentRegion = draft.regions?.find(
          (r) => r.id === draft.startingCity?.regionId
        );
        if (currentRegion && !currentRegion.stateLaws) {
          currentRegion.stateLaws = {};
        }
      }
      
      // Ensure nationalLaws structure exists for federal-level laws
      if (targetStat.startsWith("nationalLaws.")) {
        if (draft.country && !draft.country.nationalLaws) {
          draft.country.nationalLaws = {};
        }
      }
      
      setNestedValue(draft, targetStat, value);
    }
  } else {
    const { target, lastKey } = getTargetObjectAndKey(draft, effect);

    if (!target || !lastKey) return draft; // Guard against invalid target

    let actualChange = effect.change || 0;

    // Handle parameterized effects
    if (effect.type.includes("by_param") && parameters) {
      const paramValue = Object.values(parameters)[0]; // Get first parameter value
      if (paramValue !== undefined && !isNaN(paramValue)) {
        // Scale the change based on parameter value vs default
        const defaultValue = effect.base_change_for_default || 1;
        
        // Prevent division by zero and ensure valid calculations
        if (Math.abs(defaultValue) > 0 && !isNaN(defaultValue)) {
          const scalingFactor = Math.abs(paramValue) / Math.abs(defaultValue);
          const changeDirection = effect.change_direction || 1;
          
          // Ensure all values are valid numbers before calculation
          if (!isNaN(scalingFactor) && !isNaN(changeDirection)) {
            actualChange = changeDirection * scalingFactor;
          }
        }
      }
    }

    // Handle tax-change-based effects
    if (effect.type.includes("by_tax_change") && parameters) {
      const taxChangeValue = Object.values(parameters)[0]; // Get tax change value
      if (taxChangeValue !== undefined) {
        // For tax increases, negative mood/approval; for decreases, positive
        if (effect.type.includes("mood") || effect.type.includes("approval")) {
          actualChange =
            taxChangeValue > 0
              ? -Math.abs(effect.change || 1)
              : Math.abs(effect.change || 1);
        } else {
          // For economic effects, tax cuts might boost economy
          actualChange =
            taxChangeValue < 0
              ? Math.abs(effect.change || 1)
              : -Math.abs(effect.change || 1);
        }
      }
    }

    switch (effect.type) {
      case "level_change":
      case "conditional_level_change_by_param":
      case "conditional_level_change_by_tax_change":
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
      case "conditional_approval_shift":
      case "conditional_approval_shift_by_tax_change":
        // Handle approval changes (typically stored as numeric values, not level-based)
        if (typeof target[lastKey] === "number") {
          target[lastKey] += actualChange;
        } else {
          target[lastKey] = actualChange;
        }
        break;
      case "percentage_point_change": {
        const currentValue = parseFloat(target[lastKey]) || 0;
        
        // Ensure actualChange is a valid number
        if (isNaN(actualChange) || !isFinite(actualChange)) {
          console.warn(`[applyPolicyEffect] Invalid actualChange for ${lastKey}: ${actualChange}`);
          break; // Skip this effect if actualChange is invalid
        }
        
        const newValue = currentValue + actualChange;
        
        // Double-check the result is valid before applying
        if (isNaN(newValue) || !isFinite(newValue)) {
          console.warn(`[applyPolicyEffect] Invalid newValue for ${lastKey}: ${newValue} (current: ${currentValue}, change: ${actualChange})`);
          target[lastKey] = currentValue; // Keep current value if calculation fails
        } else {
          target[lastKey] = newValue;
        }
        break;
      }
      case "absolute_change":
      case "absolute_change_recurring":
        if (typeof target[lastKey] === "number") {
          target[lastKey] += actualChange;
        } else {
          target[lastKey] = actualChange;
        }
        break;
      case "absolute_set_rate":
        target[lastKey] = actualChange;
        break;
      case "formula_absolute_change":
        // Evaluate the changeFormula using stats from the current state
        if (effect.changeFormula) {
          try {
            // Create context with available stats for formula evaluation
            const formulaContext = {
              population: currentState.population || 0,
              gdpPerCapita: currentState.gdpPerCapita || 0,
              ...(currentState.budget || {}),
              ...parameters,
            };

            // Simple formula evaluation - replace variables and evaluate
            let formulaStr = effect.changeFormula;
            Object.keys(formulaContext).forEach((key) => {
              const regex = new RegExp(`\\b${key}\\b`, "g");
              formulaStr = formulaStr.replace(regex, formulaContext[key] || 0);
            });

            const calculatedChange = eval(formulaStr);

            if (typeof target[lastKey] === "number") {
              target[lastKey] += calculatedChange;
            } else {
              target[lastKey] = calculatedChange;
            }
          } catch (error) {
            console.warn(
              `[applyPolicyEffect] Error evaluating formula: ${effect.changeFormula}`,
              error
            );
          }
        }
        break;
      default:
        console.warn(
          `[applyPolicyEffect] Unknown or unhandled effect type: ${effect.type}`
        );
        break;
    }
  }

  return currentState;
};
