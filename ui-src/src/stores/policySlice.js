import {
  RATING_LEVELS,
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
} from "../data/governmentData";
import { CITY_POLICIES } from "../data/policyDefinitions";
import {
  formatPercentage,
  formatBudgetKey,
  adjustStatLevel,
} from "../utils/core";

export const STAT_LEVEL_ARRAYS = {
  economicOutlook: ECONOMIC_OUTLOOK_LEVELS,
  publicSafetyRating: RATING_LEVELS,
  educationQuality: RATING_LEVELS,
  infrastructureState: RATING_LEVELS,
  overallCitizenMood: MOOD_LEVELS,
  healthcareQuality: RATING_LEVELS,
  environmentRating: RATING_LEVELS,
  cultureArtsRating: RATING_LEVELS,

  // Example for a potential new stat with a different scale (if you add one)
  // trafficCongestion: [
  //   "Gridlocked",
  //   "Very Heavy",
  //   "Heavy",
  //   "Moderate",
  //   "Light",
  //   "Clear"
  // ],
  // housingAffordability: [
  //   "Crisis",
  //   "Very Unaffordable",
  //   "Unaffordable",
  //   "Strained",
  //   "Affordable",
  //   "Very Affordable"
  // ],
};

export const createPolicySlice = (set, get) => {
  const _applyChangeToNestedValue = (
    campaignObject,
    path,
    value,
    operation = "set"
  ) => {
    if (!campaignObject) {
      console.error("_applyChangeToNestedValue: campaignObject is undefined");
      return campaignObject; // Or throw error
    }
    const keys = path.split(".");
    let current = campaignObject;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
        // Ensure path exists with objects, especially for nested budget structures
        if (
          (keys[i] === "budget" &&
            (keys[i + 1] === "expenseAllocations" ||
              keys[i + 1] === "incomeSources" ||
              keys[i + 1] === "taxRates")) ||
          (keys[i - 1] === "budget" &&
            (keys[i] === "expenseAllocations" ||
              keys[i] === "incomeSources" ||
              keys[i] === "taxRates"))
        ) {
          current[keys[i]] = {};
        } else if (keys[i] === "stats" && keys[i - 1] === "startingCity") {
          // Ensure stats object exists
          current[keys[i]] = {};
        } else {
          console.warn(
            `_applyChangeToNestedValue: Path segment ${keys[i]} in ${path} is not an object or undefined. Creating path.`
          );
          current[keys[i]] = {};
        }
      }
      current = current[keys[i]];
    }

    const finalKey = keys[keys.length - 1];

    if (
      operation === "add" &&
      (path.includes(".expenseAllocations.") ||
        path.includes(".incomeSources.") ||
        path.includes(".taxRates."))
    ) {
      const numericCurrentValue = parseFloat(current[finalKey]) || 0;
      const numericChangeValue = parseFloat(value) || 0;
      if (path.includes(".taxRates.")) {
        current[finalKey] = parseFloat(
          (numericCurrentValue + numericChangeValue).toFixed(5)
        );
      } else {
        current[finalKey] = numericCurrentValue + numericChangeValue;
      }
    } else {
      if (path.includes(".taxRates.") && typeof value === "number") {
        current[finalKey] = parseFloat(value.toFixed(5));
      } else {
        current[finalKey] = value;
      }
    }
    return campaignObject;
  };

  const _recalculateBudgetTotals = (campaignObject) => {
    if (!campaignObject?.startingCity?.stats?.budget) return campaignObject;
    const budget = campaignObject.startingCity.stats.budget;
    if (
      budget.incomeSources &&
      typeof budget.incomeSources === "object" &&
      budget.expenseAllocations &&
      typeof budget.expenseAllocations === "object"
    ) {
      budget.totalAnnualIncome = Object.values(budget.incomeSources).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      budget.totalAnnualExpenses = Object.values(
        budget.expenseAllocations
      ).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      budget.balance = budget.totalAnnualIncome - budget.totalAnnualExpenses;
    } else {
      console.warn(
        "[_recalculateBudgetTotals] incomeSources or expenseAllocations is not an object. Totals not recalculated."
      );
    }
    return campaignObject;
  };

  return {
    processPolicyOutcomesAndUpdateCampaign: (
      effectsPayload, // Array of activeLegislation objects (or similar structure with all policy details)
      genericPolicyNewsData = []
    ) => {
      const campaignInitialForEffects = get().activeCampaign;
      if (!campaignInitialForEffects?.currentDate) {
        console.warn(
          "[PolicySlice] processPolicyOutcomes: No campaign or current date."
        );
        return;
      }
      const currentDate = campaignInitialForEffects.currentDate;

      if (genericPolicyNewsData.length > 0) {
        const newsToAdd = genericPolicyNewsData.map((details) => ({
          ...details,
          date: { ...currentDate },
        }));
        get().actions.addNewsEvent?.(newsToAdd);
      }

      if (!effectsPayload || effectsPayload.length === 0) {
        return;
      }

      // Clone the campaign state ONCE at the beginning. All modifications will be to this clone.
      let campaignToUpdate;
      campaignToUpdate = structuredClone(campaignInitialForEffects);

      effectsPayload.forEach((activePolicyInstance) => {
        const {
          policyName,
          proposerId,
          effects: staticEffectsArray, // Renamed for clarity
          isParameterized,
          parameterDetails,
          chosenParameters,
        } = activePolicyInstance;

        let mainEffectNewsSummary = "";
        let mainEffectStatDidChange = false;
        const paramKeyForChosenValue = parameterDetails?.key || "amount"; // Key for chosen value

        // 1. Apply PRIMARY PARAMETERIZED effect (if any)
        if (
          isParameterized &&
          parameterDetails &&
          chosenParameters &&
          chosenParameters[paramKeyForChosenValue] != null
        ) {
          const chosenValue = chosenParameters[paramKeyForChosenValue];

          if (parameterDetails.targetBudgetLine) {
            // Parameterized Budget Line Adjustment
            const targetLine = parameterDetails.targetBudgetLine;
            const amount = parseFloat(chosenValue);
            const fullTargetPath = `startingCity.stats.budget.expenseAllocations.${targetLine}`;

            campaignToUpdate = _applyChangeToNestedValue(
              campaignToUpdate,
              fullTargetPath,
              amount,
              "add"
            );
            mainEffectStatDidChange = true;
            const changeTypeDesc = amount >= 0 ? "increased" : "decreased";
            const targetLineFormatted =
              formatBudgetKey(targetLine).toLowerCase(); // Use formatter
            mainEffectNewsSummary = `The budget for ${targetLineFormatted} was ${changeTypeDesc} by $${Math.abs(
              amount
            ).toLocaleString()} due to the policy "${policyName}".`;
          } else if (parameterDetails.targetTaxRate) {
            // Parameterized Tax Rate Adjustment
            const targetRateName = parameterDetails.targetTaxRate;
            const fullTaxRatePath = `startingCity.stats.budget.taxRates.${targetRateName}`;
            let newRate;
            const currentRate =
              campaignToUpdate.startingCity.stats.budget.taxRates[
                targetRateName
              ] || 0;

            if (parameterDetails.valueType === "percentage_point") {
              newRate = parseFloat(
                (currentRate + parseFloat(chosenValue)).toFixed(5)
              );
            } else if (parameterDetails.valueType === "absolute_rate_percent") {
              newRate = parseFloat((parseFloat(chosenValue) / 100).toFixed(5));
            } else {
              console.warn(
                `[PolicySlice] Unknown valueType "${parameterDetails.valueType}" for tax policy "${policyName}"`
              );
              return; // Skip this specific parameterized effect
            }
            newRate = Math.max(0, newRate);

            console.log(
              `[PolicySlice EXEC] Parameterized Tax Rate for "${policyName}": Target: ${targetRateName}, New Rate: ${newRate} (from chosen: ${chosenValue})`
            );
            campaignToUpdate = _applyChangeToNestedValue(
              campaignToUpdate,
              fullTaxRatePath,
              newRate,
              "set"
            );

            mainEffectStatDidChange = true;
            const rateChangeDesc =
              newRate > currentRate
                ? `increased to ${formatPercentage(newRate * 100, 2)}`
                : newRate < currentRate
                ? `decreased to ${formatPercentage(newRate * 100, 2)}`
                : `set to ${formatPercentage(newRate * 100, 2)}`;
            mainEffectNewsSummary = `${formatBudgetKey(
              targetRateName
            )} tax rate ${rateChangeDesc} due to the policy "${policyName}".`;
          }

          if (mainEffectStatDidChange && mainEffectNewsSummary) {
            get().actions.addNewsEvent?.({
              date: { ...currentDate },
              headline: `Policy Update: "${policyName}"`,
              summary: mainEffectNewsSummary,
              type: parameterDetails.targetBudgetLine
                ? "budget_change"
                : "tax_change",
              scope: "local",
              impact: "neutral",
            });
          }
        } else if (isParameterized) {
          console.warn(
            `[PolicySlice] Policy "${policyName}" is parameterized, but required details for primary effect were missing. chosenParameters:`,
            chosenParameters,
            "parameterDetails:",
            parameterDetails
          );
        }

        // 2. Process STATIC secondary effects from policy definition
        (staticEffectsArray || []).forEach((effect) => {
          const currentCityStats = campaignToUpdate.startingCity.stats;
          const currentPlayerId = campaignToUpdate.politician.id;

          if (
            effect.ifPlayerProposer === true &&
            proposerId !== currentPlayerId
          )
            return;

          let conditionMet = true; // Assume true unless a condition fails
          if (effect.condition) {
            conditionMet = false; // Reset for this specific effect
            if (effect.condition.startsWith("mainIssue_is_")) {
              const issue = effect.condition.split("mainIssue_is_")[1];
              conditionMet = currentCityStats.mainIssues?.includes(issue);
            } else if (
              effect.condition.startsWith(
                "current_business_tax_rate_higher_than_"
              )
            ) {
              const rate = parseFloat(
                effect.condition.split(
                  "current_business_tax_rate_higher_than_"
                )[1]
              );
              conditionMet = currentCityStats.budget?.taxRates?.business > rate;
            }
            // Add more condition evaluations here
          }
          if (!conditionMet) return; // Skip this static effect if its condition not met

          let statDidChangeForThisEffect = false;
          let newsSummaryForThisSecondaryEffect = "";
          let affectedStatForNewsDisplay =
            effect.targetStat?.replace(/([A-Z])/g, " $1").trim() ||
            "an aspect of the city";
          const targetPath = `startingCity.stats.${effect.targetStat}`; // For general stats
          const paramValueFromPrimaryEffect =
            chosenParameters?.[paramKeyForChosenValue];

          // --- Handle Conditional Static Effects ---
          if (
            effect.type === "conditional_mood_shift_by_tax_param" ||
            effect.type === "conditional_approval_shift_by_tax_param" ||
            effect.type === "conditional_level_change_by_tax_param" ||
            effect.type === "conditional_mood_shift" || // General conditional mood based on primary param
            effect.type === "conditional_approval_shift" // General conditional approval based on primary param
          ) {
            let actualChange = 0;
            if (
              isParameterized &&
              paramValueFromPrimaryEffect != null &&
              parameterDetails
            ) {
              // Determine effect based on primary parameter type (budget or tax)
              if (parameterDetails.targetBudgetLine) {
                // Primary was a budget adjustment
                actualChange =
                  Math.sign(paramValueFromPrimaryEffect) *
                  Math.min(
                    2,
                    Math.ceil(Math.abs(paramValueFromPrimaryEffect) / 250000)
                  );
                if (paramValueFromPrimaryEffect === 0) actualChange = 0;
              }
              if (parameterDetails.targetTaxRate) {
                // Primary was a tax rate adjustment
                if (parameterDetails.valueType === "percentage_point_decimal") {
                  if (paramValueFromPrimaryEffect > 0.0001)
                    actualChange =
                      effect.targetStat === "economicOutlook" &&
                      policyName.toLowerCase().includes("business")
                        ? 1
                        : -1;
                  else if (paramValueFromPrimaryEffect < -0.0001)
                    actualChange =
                      effect.targetStat === "economicOutlook" &&
                      policyName.toLowerCase().includes("business")
                        ? -1
                        : 1;
                } else if (
                  parameterDetails.valueType === "absolute_rate_percent"
                ) {
                  const oldRate =
                    currentCityStats.budget.taxRates[
                      parameterDetails.targetTaxRate
                    ] || 0;
                  const newRateDecimal = paramValueFromPrimaryEffect / 100;
                  if (newRateDecimal > oldRate + 0.0001)
                    actualChange =
                      effect.targetStat === "economicOutlook" &&
                      policyName.toLowerCase().includes("business")
                        ? 1
                        : -1;
                  else if (newRateDecimal < oldRate - 0.0001)
                    actualChange =
                      effect.targetStat === "economicOutlook" &&
                      policyName.toLowerCase().includes("business")
                        ? -1
                        : 1;
                }
              }
            } else {
              // Fallback for non-parameterized policies that might use these conditional types with a fixed 'change'
              actualChange = effect.change || 0;
            }

            if (actualChange !== 0) {
              if (effect.targetStat === "overallCitizenMood") {
                const oldMood = currentCityStats.overallCitizenMood;
                const newMood = adjustStatLevel(
                  oldMood,
                  MOOD_LEVELS,
                  actualChange
                );
                if (newMood !== oldMood) {
                  campaignToUpdate = _applyChangeToNestedValue(
                    campaignToUpdate,
                    "startingCity.stats.overallCitizenMood",
                    newMood
                  );
                  statDidChangeForThisEffect = true;
                  newsSummaryForThisSecondaryEffect = `Overall citizen mood shifted to ${newMood} in response to "${policyName}".`;
                }
              } else if (effect.targetStat === "playerApproval") {
                const oldApproval = campaignToUpdate.playerApproval; // Use the evolving clone
                const newApproval = Math.min(
                  100,
                  Math.max(0, (oldApproval || 50) + actualChange)
                );
                if (newApproval !== oldApproval) {
                  campaignToUpdate = _applyChangeToNestedValue(
                    campaignToUpdate,
                    "playerApproval",
                    newApproval
                  );
                }
              } else if (STAT_LEVEL_ARRAYS[effect.targetStat]) {
                const oldStat = currentCityStats[effect.targetStat];
                const levels =
                  STAT_LEVEL_ARRAYS[effect.targetStat] || RATING_LEVELS;
                const newStat = adjustStatLevel(oldStat, levels, actualChange);
                if (newStat !== oldStat) {
                  campaignToUpdate = _applyChangeToNestedValue(
                    campaignToUpdate,
                    `startingCity.stats.${effect.targetStat}`,
                    newStat
                  );
                  statDidChangeForThisEffect = true;
                  newsSummaryForThisSecondaryEffect = `${affectedStatForNewsDisplay} is now ${newStat} due to "${policyName}".`;
                }
              }
            }
          }
          // --- Standard Static Effects (Non-Conditional on Parameter) ---
          else if (
            (effect.type === "absolute_change" ||
              effect.type === "absolute_change_recurring") &&
            effect.targetStat?.startsWith("budget.expenseAllocations.")
          ) {
            const specificExpenseLine = effect.targetStat.substring(
              "budget.expenseAllocations.".length
            );
            campaignToUpdate = _applyChangeToNestedValue(
              campaignToUpdate,
              `startingCity.stats.budget.expenseAllocations.${specificExpenseLine}`,
              effect.change,
              "add"
            );
            statDidChangeForThisEffect = true;
            newsSummaryForThisSecondaryEffect = `${formatBudgetKey(
              specificExpenseLine
            )} budget adjusted by $${effect.change.toLocaleString()}.`;
          } else if (
            (effect.type === "absolute_change" ||
              effect.type === "absolute_change_recurring") &&
            effect.targetStat?.startsWith("budget.incomeSources.")
          ) {
            const specificIncomeLine = effect.targetStat.substring(
              "budget.incomeSources.".length
            );
            campaignToUpdate = _applyChangeToNestedValue(
              campaignToUpdate,
              `startingCity.stats.budget.incomeSources.${specificIncomeLine}`,
              effect.change,
              "add"
            );
            statDidChangeForThisEffect = true;
            newsSummaryForThisSecondaryEffect = `${formatBudgetKey(
              specificIncomeLine
            )} revenue adjusted by $${effect.change.toLocaleString()}.`;
          } else if (effect.type === "level_change") {
            const currentVal = currentCityStats[effect.targetStat];
            const levels =
              STAT_LEVEL_ARRAYS[effect.targetStat] || RATING_LEVELS;
            const newVal = adjustStatLevel(currentVal, levels, effect.change);
            if (newVal !== currentVal) {
              campaignToUpdate = _applyChangeToNestedValue(
                campaignToUpdate,
                targetPath,
                newVal
              );
              statDidChangeForThisEffect = true;
              newsSummaryForThisSecondaryEffect = `${affectedStatForNewsDisplay} is now ${newVal}.`;
            }
          } else if (effect.type === "percentage_point_change") {
            let currentRate = 0;
            if (effect.targetStat.startsWith("budget.taxRates.")) {
              // This handles FIXED pp changes to tax rates
              const taxType = effect.targetStat.split(".").pop();
              currentRate = currentCityStats.budget?.taxRates?.[taxType] || 0;
              campaignToUpdate = _applyChangeToNestedValue(
                campaignToUpdate,
                targetPath,
                effect.change,
                "add"
              );
            } else {
              // For other general percentage point stats
              currentRate =
                parseFloat(currentCityStats[effect.targetStat]) || 0;
              const newRate = parseFloat(
                (currentRate + effect.change).toFixed(5)
              );
              campaignToUpdate = _applyChangeToNestedValue(
                campaignToUpdate,
                targetPath,
                newRate
              );
            }
            statDidChangeForThisEffect = true; // Assume change if this effect type is present
            newsSummaryForThisSecondaryEffect = `${affectedStatForNewsDisplay} adjusted by ${(
              effect.change * 100
            ).toFixed(1)}pp.`;
          } else if (
            effect.type === "absolute_set_rate" &&
            effect.targetStat?.startsWith("budget.taxRates.")
          ) {
            const newRate = parseFloat(effect.change.toFixed(5));
            campaignToUpdate = _applyChangeToNestedValue(
              campaignToUpdate,
              targetPath,
              newRate,
              "set"
            );
            statDidChangeForThisEffect = true;
            newsSummaryForThisSecondaryEffect = `${affectedStatForNewsDisplay} set to ${formatPercentage(
              newRate * 100,
              2
            )}.`;
          }
          // ... other static effect types ...

          if (statDidChangeForThisEffect && newsSummaryForThisSecondaryEffect) {
            get().actions.addNewsEvent?.({
              date: { ...currentDate },
              headline: `Effect of "${policyName}"`,
              summary: newsSummaryForThisSecondaryEffect,
              type: "policy_effect_detail",
              scope: "local",
              impact: "neutral",
            });
          }
        });
      });

      campaignToUpdate = _recalculateBudgetTotals(campaignToUpdate);
      set({ activeCampaign: campaignToUpdate });
      console.log(
        "[PolicySlice] Finished processing all policy outcomes for this tick."
      );
    },
    updateCityStatsAndPlayerFromPolicy: (payload) => {
      set((currentStoreState) => {
        const campaign = currentStoreState.activeCampaign;
        if (!campaign) return {};

        const { newStats, newPlayerApproval } = payload;
        let campaignToUpdate = { ...campaign };

        if (newStats) {
          campaignToUpdate = {
            ...campaignToUpdate,
            startingCity: {
              ...campaignToUpdate.startingCity,
              stats: newStats, // Assume newStats is the complete, updated stats object
            },
          };
        }
        if (newPlayerApproval !== undefined) {
          campaignToUpdate.playerApproval = newPlayerApproval;
        }
        console.log(
          "[CampaignSlice] City stats/player approval updated due to policy effects."
        );
        return { activeCampaign: campaignToUpdate };
      });
    },
    preparePolicyEffectsAndNews: () => {
      const campaignForContext = get().activeCampaign;
      const currentActiveLegislationList = get().activeLegislation || [];
      if (
        !campaignForContext ||
        !currentActiveLegislationList ||
        currentActiveLegislationList.length === 0
      ) {
        return {
          legislationToUpdate: [],
          campaignUpdates: null,
          newsToGenerate: [],
        }; // Return empty if nothing
      }

      let campaignStatChanges = []; // Collects { targetStat, change, type, condition (optional) }
      //let playerApprovalChange = 0;
      let newsItemsData = []; // Collects { headline, summary, type, scope, impact }
      let updatedLegislationList = []; // For this slice's state
      let anyLegislationItemChanged = false;

      currentActiveLegislationList.forEach((leg) => {
        let currentLegItem = { ...leg }; // Work on a copy

        if (
          currentLegItem.effectsApplied &&
          currentLegItem.monthsUntilEffective <= 0
        ) {
          // One-time, already done, will be filtered if necessary by caller or next set
          updatedLegislationList.push(currentLegItem);
          return;
        }

        if (currentLegItem.monthsUntilEffective > 0) {
          currentLegItem.monthsUntilEffective = Math.max(
            0,
            currentLegItem.monthsUntilEffective - 1
          );
          anyLegislationItemChanged = true;
        }

        if (
          currentLegItem.monthsUntilEffective <= 0 &&
          !currentLegItem.effectsApplied
        ) {
          anyLegislationItemChanged = true;
          const policyDefinition = CITY_POLICIES.find(
            (p) => p.id === currentLegItem.policyId
          );
          console.log(
            `[Legislation Slice] Preparing effects for: ${currentLegItem.policyName}`
          );

          (policyDefinition?.effects || []).forEach((effect) => {
            if (effect.chance == null || Math.random() < effect.chance) {
              // Add effect to be applied by campaignSlice
              campaignStatChanges.push({
                targetStat: effect.targetStat,
                change: effect.change,
                type: effect.type,
                changeFormula: effect.changeFormula, // Include if exists
                proposerId: currentLegItem.proposerId, // For conditional approval shifts
                policyNameForNews: currentLegItem.policyName, // For context in news
              });
            }
          });
          currentLegItem.effectsApplied = true;
          newsItemsData.push({
            headline: `Policy Enacted: "${currentLegItem.policyName}"`,
            summary: `The policy "${currentLegItem.policyName}" has now taken full effect.`,
            type: "policy_effect",
            impact: "neutral",
            scope: "local",
          });
        }
        updatedLegislationList.push(currentLegItem);
      });

      // Filter out policies that are truly finished (one-time, applied, timer 0)
      const finalActiveLegislation = updatedLegislationList.filter((leg) => {
        return !leg.effectsApplied || leg.monthsUntilEffective > 0;
      });

      // Only mark for update if the list content or structure actually changed
      if (
        currentActiveLegislationList.length !== finalActiveLegislation.length ||
        anyLegislationItemChanged
      ) {
        // No set call here for activeLegislation directly. We return the data.
      }

      return {
        updatedActiveLegislationList: finalActiveLegislation, // The new list for this slice
        didLegislationListChange:
          currentActiveLegislationList.length !==
            finalActiveLegislation.length || anyLegislationItemChanged,
        campaignStatChanges: campaignStatChanges, // Data for campaignSlice to apply stats
        newsToGenerate: newsItemsData, // Data for campaignSlice to add news
      };
    },
  };
};
