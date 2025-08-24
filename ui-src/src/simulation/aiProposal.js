// src/simulation/aiProposal.js
/**
 * This module contains the core logic for an AI politician's decision-making process
 * when proposing new legislation. It refactors the original monolithic function into
 * a cleaner pipeline of filtering, scoring, and parameter selection.
 */

import { RATING_LEVELS } from "../data/governmentData";

// --- CORE HELPER FUNCTIONS (Extracted for Clarity) ---

/**
 * Determines the current financial health of the city.
 * Sourced from the logic in aiVoting.js
 * @param {object} cityStats - The city's current statistics object.
 * @returns {object} An object describing the city's financial state.
 */
const getFinancialState = (cityStats) => {
  const cityIncome =
    cityStats.budget.totalAnnualIncome || cityStats.budget.annualIncome || 1;
  const cityBalance = cityStats.budget.balance || 0;
  const cityDebt = cityStats.budget.accumulatedDebt || 0;
  const balanceToIncomeRatio = cityBalance / cityIncome;
  const debtToIncomeRatio = cityDebt / cityIncome;

  return {
    hasLargeSurplus: balanceToIncomeRatio > 0.15 && debtToIncomeRatio < 0.2,
    isComfortableFinancially:
      balanceToIncomeRatio > 0.05 && debtToIncomeRatio < 0.4,
    hasSignificantDeficit: balanceToIncomeRatio < -0.075,
    hasHighDebt: debtToIncomeRatio > 0.85,
    hasDireFinances: balanceToIncomeRatio < -0.12 || debtToIncomeRatio > 1.2,
    isStrainedFinances:
      (balanceToIncomeRatio < -0.075 || debtToIncomeRatio > 0.85) &&
      !(balanceToIncomeRatio < -0.12 || debtToIncomeRatio > 1.2),
  };
};

/**
 * Gets details about a specific service rating from city stats.
 * Sourced from aiUtils.js
 */
const getServiceRatingDetails = (
  targetBudgetLine,
  cityStats,
  RATING_LEVELS_ARR
) => {
  if (!targetBudgetLine || !cityStats || !RATING_LEVELS_ARR)
    return {
      ratingIndex: -1,
      ratingString: null,
      statName: null,
      isValid: false,
    };
  // ... (Full implementation from aiUtils.js)
  let ratingString = null;
  let statName = null;
  const budgetLineToStatMap = {
    /* ... */
  };
  statName = budgetLineToStatMap[targetBudgetLine];
  if (statName && cityStats[statName]) ratingString = cityStats[statName];
  // ... (rest of the detailed logic from aiUtils.js)
  const ratingIndex = ratingString
    ? RATING_LEVELS_ARR.indexOf(ratingString)
    : -1;
  return { ratingIndex, ratingString, statName, isValid: ratingIndex !== -1 };
};

/**
 * Calculates the fiscal conservatism factor for an AI politician.
 * Sourced from aiUtils.js
 */
export const calculateFiscalConservatismFactor = (
  aiPolitician,
  financialState
) => {
  let factor = 0;
  switch (aiPolitician.calculatedIdeology) {
    case "Libertarian":
      factor = 0.9;
      break;
    case "Conservative":
      factor = 0.7;
      break;
    case "Nationalist":
      factor = 0.3;
      break;
    case "Centrist":
      factor = 0.0;
      break;
    case "Liberal":
      factor = -0.4;
      break;
    case "Progressive":
      factor = -0.6;
      break;
    case "Social Democrat":
      factor = -0.7;
      break;
    case "Socialist":
      factor = -0.8;
      break;
    case "Communist":
      factor = -1.0;
      break;
    default:
      factor = 0;
  }

  const {
    hasDireFinances,
    isStrainedFinances,
    hasLargeSurplus,
    isComfortableFinancially,
  } = financialState;

  if (hasDireFinances) {
    factor = Math.min(1.0, (factor > 0 ? factor * 1.1 : 0) + 0.98);
  } else if (isStrainedFinances) {
    factor = Math.min(1.0, (factor > 0 ? factor * 1.05 : 0) + 0.65);
  } else if (hasLargeSurplus) {
    factor = Math.max(-1.0, factor - 0.95);
  } else if (isComfortableFinancially) {
    factor = Math.max(-1.0, factor - 0.3);
  }
  return Math.max(-1.0, Math.min(1.0, factor));
};

/**
 * Calculates a fiscal score for a given policy.
 * Sourced from aiUtils.js
 */
const calculateDetailedFiscalScore = (
  policy,
  pDetails,
  cityStats,
  RATING_LEVELS_ARR,
  financialState
) => {
  let score = 0;
  const {
    hasDireFinances,
    isStrainedFinances,
    hasLargeSurplus,
    isComfortableFinancially,
  } = financialState;
  const { cityIncome, cityBalance, balanceToIncomeRatio } = cityStats.budget;

  const canIncrease =
    pDetails &&
    (pDetails.adjustmentType === "increase" ||
      (pDetails.adjustmentType === "increase_or_decrease" &&
        pDetails.max > (pDetails.defaultValue || 0)));
  const canDecrease =
    pDetails &&
    (pDetails.adjustmentType === "decrease" ||
      (pDetails.adjustmentType === "increase_or_decrease" &&
        pDetails.min < (pDetails.defaultValue || 0)));

  if (policy.isParameterized && pDetails) {
    const serviceInfo = pDetails.targetBudgetLine
      ? getServiceRatingDetails(
          pDetails.targetBudgetLine,
          cityStats,
          RATING_LEVELS_ARR
        )
      : null;
    const isServiceVeryPoor =
      serviceInfo?.isValid && serviceInfo.ratingIndex === 0;
    const isServicePoor = serviceInfo?.isValid && serviceInfo.ratingIndex === 1;
    const isServiceGood =
      serviceInfo?.isValid &&
      serviceInfo.ratingIndex === RATING_LEVELS_ARR.length - 2;
    const isServiceExcellent =
      serviceInfo?.isValid &&
      serviceInfo.ratingIndex === RATING_LEVELS_ARR.length - 1;
    const isEssentialService =
      pDetails.targetBudgetLine &&
      [
        "policeDepartment",
        "fireDepartment",
        "publicHealthServices",
        "publicEducation",
      ].includes(pDetails.targetBudgetLine);

    if (pDetails.targetBudgetLine) {
      if (hasDireFinances) {
        if (canIncrease) score -= isServiceVeryPoor ? 2.8 : 3.5;
        if (canDecrease) {
          let cutScore = 10.0;
          if (isServiceExcellent) cutScore += 5.0;
          else if (isServiceGood) cutScore += 3.0;
          else if (isServicePoor || isServiceVeryPoor)
            cutScore -= isEssentialService ? 4.0 : 2.0;
          else if (isEssentialService) cutScore -= 1.0;
          score += Math.max(0, cutScore);
        }
      } else if (isStrainedFinances) {
        if (canIncrease)
          score -= isServiceVeryPoor || isServicePoor ? 1.0 : 2.0;
        if (canDecrease) {
          let cutScore = 1.5;
          if (isServiceExcellent) cutScore += 1.0;
          else if (isServiceGood) cutScore += 0.5;
          else if (isServicePoor || isServiceVeryPoor)
            cutScore -= isEssentialService ? 2.0 : 1.0;
          else if (isEssentialService) cutScore -= 0.5;
          score += Math.max(0, cutScore);
        }
      } else if (hasLargeSurplus) {
        if (canIncrease) {
          score += 3.0;
          if (isServiceVeryPoor) score += 2.0;
          else if (isServicePoor) score += 0.7;
        }
        if (canDecrease) {
          score -= 1.0;
          if (isServiceExcellent) score += 0.3;
        }
      } else if (isComfortableFinancially) {
        if (canIncrease) {
          score += 0.5;
          if (isServiceVeryPoor) score += 0.8;
          else if (isServicePoor) score += 0.4;
        }
        if (canDecrease) {
          score += 0.3;
          if (isServiceGood || isServiceExcellent) score += 0.3;
        }
      } else {
        if (canIncrease && (isServiceVeryPoor || isServicePoor)) score += 0.5;
        if (canDecrease && (isServiceGood || isServiceExcellent)) score += 0.4;
      }
    } else if (pDetails.targetTaxRate) {
      if (hasDireFinances) {
        if (canIncrease) score += 100.0;
        if (canDecrease) score -= 30.0;
      } else if (isStrainedFinances) {
        if (canIncrease) score += 4.5;
        if (canDecrease) score -= 2.0;
      } else if (hasLargeSurplus) {
        if (canIncrease) score -= 1.0;
        if (canDecrease) score += 2.0;
      } else if (isComfortableFinancially) {
        if (canIncrease) {
          score += 0.75;
          if (balanceToIncomeRatio < 0.02 && cityBalance > 0) score += 1.0;
        }
        if (canDecrease) score += 0.7;
      } else {
        if (canIncrease) {
          score += 0.5;
          if (cityBalance <= 0) score += 0.75;
        }
      }
    }
  } else if (policy.cost?.budget > 0) {
    const costRatio = policy.cost.budget / cityIncome;
    if (hasDireFinances) score -= costRatio > 0.02 ? 3.0 : 2.0;
    else if (isStrainedFinances) score -= costRatio > 0.02 ? 2.0 : 1.0;
    else if (hasLargeSurplus) score += costRatio < 0.015 ? 1.0 : 0.5;
  } else if (
    policy.cost?.budget_impact_estimate < 0 ||
    (policy.tags?.includes("tax_cut") && !policy.isParameterized)
  ) {
    if (hasDireFinances) score -= 2.5;
    else if (isStrainedFinances) score -= 1.5;
    else if (hasLargeSurplus) score += 1.5;
  } else if (
    policy.effects?.some(
      (e) => e.targetStat?.includes("budget.annualIncome") && e.change > 0
    ) ||
    policy.effects?.some(
      (e) =>
        e.targetStat?.includes("budget.taxRates") &&
        e.type === "absolute_set_rate" &&
        e.change > 0
    )
  ) {
    if (hasDireFinances) score += 5.0;
    else if (isStrainedFinances) score += 3.0;
    else if (
      isComfortableFinancially &&
      balanceToIncomeRatio < 0.02 &&
      cityBalance > 0
    )
      score += 2.0;
    else if (cityBalance <= 0 && !isStrainedFinances && !hasDireFinances)
      score += 1.5;
  }
  return score;
};

/**
 * Gathers a set of budget/tax targets that are already being addressed by other proposals this turn.
 * @param {Array} proposedLegislationThisCycle - All proposals this turn.
 * @param {string} currentAiId - The ID of the AI we are checking for, to exclude their own proposals.
 * @returns {object} { budgetLines: Set, taxRates: Set }
 */
const getLockedTargets = (proposedLegislationThisCycle, currentAiId, allPolicyDefs) => {
  const budgetLines = new Set();
  const taxRates = new Set();

  // Filter out bills proposed by the current AI
  const billsByOthers = (proposedLegislationThisCycle || []).filter(
    (b) => b.proposerId !== currentAiId
  );

  // Flatten the list of all policies from all other bills
  const policiesByOthers = billsByOthers.flatMap((b) => b.policies);

  policiesByOthers.forEach((policyInBill) => {
    // We need the full policy definition to check its details
    const policyDef = allPolicyDefs?.find((p) => p.id === policyInBill.policyId);
    if (policyDef?.isParameterized && policyDef.parameterDetails) {
      const pDetails = policyDef.parameterDetails;
      if (pDetails.targetBudgetLine) budgetLines.add(pDetails.targetBudgetLine);
      if (pDetails.targetTaxRate) taxRates.add(pDetails.targetTaxRate);
    }
  });

  return { budgetLines, taxRates };
};

// --- REFACTORED PIPELINE FUNCTIONS ---

/**
 * **PIPELINE STEP 1:** Filters the master list of policies to what an AI can legally propose.
 * @returns {Array} A filtered list of valid policy definition objects.
 */
function getValidPolicyCandidates(
  aiPolitician,
  allPolicyDefs,
  activeLegislation,
  proposedLegislationThisCycle // This is now an array of BILLS
) {
  const trulyBlockingActivePolicyIds = new Set(
    activeLegislation
      .filter((law) => {
        const policyDef = allPolicyDefs.find((p) => p.id === law.policyId);
        return (
          policyDef &&
          (policyDef.parameterDetails?.targetBudgetLine ||
            policyDef.parameterDetails?.targetTaxRate ||
            law.status === 'enacted' || // Include enacted but not yet implemented
            law.status === 'active')    // Include currently active policies
        );
      })
      .map((p) => p.policyId)
  );

  const lockedTargets = getLockedTargets(
    proposedLegislationThisCycle,
    aiPolitician.id,
    allPolicyDefs
  );

  // Expanded to include ALL pending legislation, not just this cycle's
  const proposedPolicyIdsInBills = new Set(
    (proposedLegislationThisCycle || []).flatMap((bill) =>
      (bill.policies || []).map((p) => p.policyId)
    )
  );

  const validPolicies = allPolicyDefs.filter((policy) => {
    if (trulyBlockingActivePolicyIds.has(policy.id)) return false;

    // Check if this policy ID is already in a proposed bill
    if (proposedPolicyIdsInBills.has(policy.id)) return false;

    // ... (the rest of the function for checking locked targets remains the same)
    if (policy.isParameterized && policy.parameterDetails) {
      const pDetails = policy.parameterDetails;
      if (
        pDetails.targetBudgetLine &&
        lockedTargets.budgetLines.has(pDetails.targetBudgetLine)
      )
        return false;
      if (
        pDetails.targetTaxRate &&
        lockedTargets.taxRates.has(pDetails.targetTaxRate)
      )
        return false;
    }
    return true;
  });

  return validPolicies;
}

const getBudgetAdjustmentTarget = (
  pDetails,
  serviceInfo,
  fiscalConservatismFactor,
  financialState
) => {
  const { hasDireFinances, isStrainedFinances, hasLargeSurplus } =
    financialState;
  let budgetUrgencyMultiplier = 1.0;
  let serviceQualityFactor = 0;

  if (serviceInfo?.isValid) {
    if (serviceInfo.ratingIndex === 0) {
      budgetUrgencyMultiplier = hasDireFinances
        ? 1.2
        : hasLargeSurplus
        ? 2.0
        : 1.7;
      serviceQualityFactor = -1.0;
    } else if (serviceInfo.ratingIndex === 1) {
      budgetUrgencyMultiplier = hasDireFinances
        ? 1.1
        : hasLargeSurplus
        ? 1.7
        : 1.4;
      serviceQualityFactor = -0.5;
    } else if (serviceInfo.ratingIndex === RATING_LEVELS.length - 1) {
      serviceQualityFactor = 1.0;
    } else if (serviceInfo.ratingIndex === RATING_LEVELS.length - 2) {
      serviceQualityFactor = 0.5;
    }
  }

  let targetPointInRange;
  if (hasDireFinances) {
    if (
      pDetails.min < 0 &&
      (pDetails.adjustmentType === "decrease" ||
        pDetails.adjustmentType === "increase_or_decrease")
    ) {
      targetPointInRange =
        0.01 + 0.3 * Math.random() * (serviceInfo?.ratingIndex === 0 ? 0.5 : 1);
    } else {
      targetPointInRange =
        serviceInfo?.ratingIndex === 0 && budgetUrgencyMultiplier > 1.1
          ? 0.03 + 0.03 * Math.random()
          : 0.01;
    }
  } else if (isStrainedFinances) {
    if (
      pDetails.adjustmentType === "decrease" ||
      (pDetails.adjustmentType === "increase_or_decrease" &&
        fiscalConservatismFactor > 0.2)
    ) {
      targetPointInRange =
        0.3 - serviceQualityFactor * 0.2 - fiscalConservatismFactor * 0.15;
    } else {
      targetPointInRange =
        0.5 +
        (budgetUrgencyMultiplier - 1.0) * 0.2 -
        fiscalConservatismFactor * 0.2;
      targetPointInRange = Math.max(0.5, targetPointInRange);
    }
  } else if (hasLargeSurplus) {
    targetPointInRange =
      0.75 +
      (budgetUrgencyMultiplier - 1.0) * 0.3 -
      fiscalConservatismFactor * 0.25;
    targetPointInRange -= serviceQualityFactor * 0.1;
  } else {
    // Neutral or Comfortable finances
    let base = 0.5;
    if (pDetails.adjustmentType === "increase") base = 0.6;
    else if (pDetails.adjustmentType === "decrease") base = 0.4;
    const FCF_WEIGHT = 0.3,
      BUM_WEIGHT = 0.25,
      SQF_WEIGHT = 0.15;
    targetPointInRange =
      base -
      fiscalConservatismFactor * FCF_WEIGHT +
      (budgetUrgencyMultiplier - 1.0) * BUM_WEIGHT -
      serviceQualityFactor * SQF_WEIGHT;
  }
  return Math.max(0.01, Math.min(0.99, targetPointInRange));
};

// Refactored Helper: Get Target Point for Tax Adjustments
const getTaxAdjustmentTarget = (
  pDetails,
  cityStats,
  fiscalConservatismFactor,
  financialState
) => {
  const {
    hasDireFinances,
    isStrainedFinances,
    hasLargeSurplus,
    isComfortableFinancially,
  } = financialState;
  const { balanceToIncomeRatio, cityBalance } = cityStats.budget;

  let targetPointInRange;
  if (hasDireFinances) {
    targetPointInRange = 0.9 + 0.09 * Math.random();
  } else if (hasLargeSurplus) {
    targetPointInRange = 0.01 + 0.09 * Math.random();
  } else {
    let current_FCF_Impact_Multiplier = 0.5;
    if (isStrainedFinances) current_FCF_Impact_Multiplier = 0.3;
    else if (
      isComfortableFinancially &&
      balanceToIncomeRatio < 0.02 &&
      cityBalance > 0
    )
      current_FCF_Impact_Multiplier = 0.4;
    targetPointInRange =
      0.5 - fiscalConservatismFactor * current_FCF_Impact_Multiplier;

    if (isStrainedFinances)
      targetPointInRange = Math.min(0.98, targetPointInRange + 0.6);
    else if (
      isComfortableFinancially &&
      balanceToIncomeRatio < 0.02 &&
      cityBalance > 0
    )
      targetPointInRange = Math.min(0.8, targetPointInRange + 0.25);
    else if (cityBalance <= 0 && !isStrainedFinances && !hasDireFinances)
      targetPointInRange = Math.min(0.7, targetPointInRange + 0.15);

    if (!hasDireFinances && !isStrainedFinances) {
      const currentTaxRateVal =
        cityStats.budget.taxRates[pDetails.targetTaxRate] || 0;
      const taxRateKeyVal = pDetails.targetTaxRate;
      const highTaxThresh =
        taxRateKeyVal === "property"
          ? 0.025
          : taxRateKeyVal === "sales"
          ? 0.08
          : 0.06;
      const lowTaxThresh =
        taxRateKeyVal === "property"
          ? 0.007
          : taxRateKeyVal === "sales"
          ? 0.03
          : 0.02;
      if (currentTaxRateVal > highTaxThresh && targetPointInRange > 0.7)
        targetPointInRange = Math.max(
          0.55,
          targetPointInRange - (currentTaxRateVal - highTaxThresh) * 10
        );
      if (currentTaxRateVal < lowTaxThresh && targetPointInRange < 0.3)
        targetPointInRange = Math.min(
          0.45,
          targetPointInRange + (lowTaxThresh - currentTaxRateVal) * 10
        );
    }
  }
  return Math.max(0.01, Math.min(0.99, targetPointInRange));
};

// Refactored Helper: Apply Budget Adjustment Caps and Cuts
const applyBudgetAdjustmentCaps = (
  chosenValue,
  pDetails,
  cityStats,
  contextualData,
  serviceInfo,
  financialState
) => {
  const {
    hasDireFinances,
    isStrainedFinances,
    hasLargeSurplus,
    isComfortableFinancially,
  } = financialState;
  const { cityBalance, cityIncome } = cityStats.budget;

  if (chosenValue > 0) {
    let maxAffordableSpend = 0;
        // TODO: Enhance contextualData to include a map of pending budget adjustments for more precise capping.
    const contextualIncreaseDetails = null; // Placeholder
    const totalAlreadyAllocatedOrProposedIncrease =
      contextualIncreaseDetails?.totalIncreaseAmount || 0;
    const isServiceVeryPoorForCap =
      serviceInfo?.isValid && serviceInfo.ratingIndex === 0;

    if (hasLargeSurplus) maxAffordableSpend = cityBalance * 0.6;
    else if (isComfortableFinancially)
      maxAffordableSpend = Math.max(0, cityBalance * 0.3);
    else if (
      !financialState.hasSignificantDeficit &&
      !financialState.hasHighDebt
    )
      maxAffordableSpend = cityIncome * 0.025;
    else if (isStrainedFinances && isServiceVeryPoorForCap)
      maxAffordableSpend = cityIncome * 0.01;
    else if (hasDireFinances && isServiceVeryPoorForCap)
      maxAffordableSpend = cityIncome * 0.005;
    else maxAffordableSpend = 0;

    maxAffordableSpend = Math.max(0, maxAffordableSpend);
    const remainingAffordableCap = Math.max(
      0,
      maxAffordableSpend - totalAlreadyAllocatedOrProposedIncrease
    );

    if (chosenValue > remainingAffordableCap) {
      chosenValue = remainingAffordableCap;
    }
    if (chosenValue <= 0 && pDetails.adjustmentType === "increase") {
      let minPossibleIncrease =
        pDetails.min > 0 ? pDetails.min : pDetails.step || 1;
      chosenValue =
        minPossibleIncrease <= remainingAffordableCap ? minPossibleIncrease : 0;
    }
  } else if (chosenValue < 0) {
    const budgetLineName = pDetails.targetBudgetLine;
    const currentActualBudgetForLine =
      cityStats.budget.expenseAllocations?.[budgetLineName] || 0;
    if (currentActualBudgetForLine <= 0) {
      chosenValue = 0;
    } else if (Math.abs(chosenValue) > currentActualBudgetForLine) {
      chosenValue = -currentActualBudgetForLine;
    }
  }
  return chosenValue;
};

/**
 * **PIPELINE STEP 2:** Calculates a proposal score for a single policy.
 * @returns {number} The calculated proposal score.
 */
function scorePolicyForAI(policy, aiPolitician, cityStats, financialState, contextualData) {
  let score = 1.0;
  const pDetails = policy.parameterDetails;

  // 1. Ideological Factor
  score += (policy.baseSupport?.[aiPolitician.calculatedIdeology] || 0) * 1.1;

  // 2. Addressing Key City Issues
  if (cityStats.mainIssues && policy.tags) {
    cityStats.mainIssues.forEach((issue) => {
      if (
        policy.tags.some(
          (tag) =>
            issue.toLowerCase().includes(tag) ||
            tag.toLowerCase().includes(issue.toLowerCase())
        )
      ) {
        score += 0.8;
      }
    });
  }

  // 3. AI Politician's Policy Focus
  if (aiPolitician.policyFocus && policy.tags) {
    if (
      policy.tags.some(
        (tag) =>
          aiPolitician.policyFocus.toLowerCase().includes(tag) ||
          tag.toLowerCase().includes(aiPolitician.policyFocus.toLowerCase())
      )
    ) {
      score += 0.6;
    }
  }

  // 4. Bonus for addressing poor service ratings/low healthcare
  if (pDetails?.targetBudgetLine) {
    const serviceInfo = getServiceRatingDetails(
      pDetails.targetBudgetLine,
      cityStats,
      RATING_LEVELS
    );
    if (serviceInfo.isValid) {
      if (serviceInfo.ratingIndex === 0)
        score += financialState.hasDireFinances ? 0.7 : 1.8;
      else if (serviceInfo.ratingIndex === 1)
        score += financialState.hasDireFinances ? 0.3 : 1.2;
    }
  }
  if (cityStats.crimeRatePer1000 > 60) {
    if (
      policy.tags?.includes("public_safety") ||
      pDetails?.targetBudgetLine === "policeDepartment"
    ) {
      score += financialState.hasDireFinances ? 1.2 : 2.2;
    }
  }
  if (cityStats.povertyRate > 25) {
    if (
      policy.tags?.includes("social_welfare") ||
      pDetails?.targetBudgetLine === "socialWelfarePrograms"
    ) {
      score += financialState.hasDireFinances ? 1.2 : 2.2;
    }
  }
  if (
    cityStats.healthcareCoverage != null &&
    (policy.tags?.includes("healthcare") ||
      pDetails?.targetBudgetLine === "publicHealthServices")
  ) {
    if (cityStats.healthcareCoverage < 40) score += 2.5;
    else if (cityStats.healthcareCoverage < 60) score += 1.5;
    else if (cityStats.healthcareCoverage < 75) score += 0.8;
  }

  // 5. Detailed Fiscal Scoring
  score += calculateDetailedFiscalScore(
    policy,
    pDetails,
    cityStats,
    RATING_LEVELS,
    financialState
  );

  // 6. Contextual Redundancy Penalty (Softer check)
  // 6. Contextual Redundancy Penalty (Softer check)
  if (pDetails?.targetBudgetLine || pDetails?.targetTaxRate) {
    const lockedTargets = getLockedTargets(contextualData.proposedLegislation, aiPolitician.id, contextualData.allPolicyDefs);
    if (pDetails.targetBudgetLine && lockedTargets.budgetLines.has(pDetails.targetBudgetLine)) {
      score -= 3.0; // Strong penalty for targeting an already-addressed budget line
    }
    if (pDetails.targetTaxRate && lockedTargets.taxRates.has(pDetails.targetTaxRate)) {
      score -= 3.0; // Strong penalty for targeting an already-addressed tax rate
    }
  }

  score += Math.random() * 0.1 - 0.05;
  return score;
}

/**
 * **PIPELINE STEP 3:** Selects the optimal parameter value for a given parameterized policy.
 * @returns {object} The chosenParameters object, e.g., { amount: 500000 }.
 */
function selectOptimalParameter(
  policy,
  aiPolitician,
  cityStats,
  financialState,
  contextualData
) {
  const pDetails = policy.parameterDetails;
  let chosenValue;

  const fiscalConservatismFactor = calculateFiscalConservatismFactor(
    aiPolitician,
    financialState
  );
  const range = pDetails.max - pDetails.min;

  // Logic for budget vs. tax adjustments
  if (pDetails.targetBudgetLine) {
    const serviceInfo = getServiceRatingDetails(
      pDetails.targetBudgetLine,
      cityStats,
      RATING_LEVELS
    );
    const targetPointInRange = getBudgetAdjustmentTarget(
      pDetails,
      serviceInfo,
      fiscalConservatismFactor,
      financialState
    ); // Sourced from aiUtils.js
    chosenValue = pDetails.min + range * targetPointInRange;
    chosenValue = applyBudgetAdjustmentCaps(
      chosenValue,
      pDetails,
      cityStats,
      contextualData, // Corrected from contextualPendingBudgetAdjustments
      serviceInfo,
      financialState
    ); // Sourced from aiUtils.js
  } else if (pDetails.targetTaxRate) {
    const targetPointInRange = getTaxAdjustmentTarget(
      pDetails,
      cityStats,
      fiscalConservatismFactor,
      financialState
    ); // Sourced from aiUtils.js
    chosenValue = pDetails.min + range * targetPointInRange;
  } else {
    chosenValue =
      pDetails.defaultValue !== undefined
        ? pDetails.defaultValue
        : pDetails.min + range * (0.3 + Math.random() * 0.4);
  }

  // Apply step and clamp to min/max
  if (pDetails.step)
    chosenValue = Math.round(chosenValue / pDetails.step) * pDetails.step;
  chosenValue = Math.max(pDetails.min, Math.min(pDetails.max, chosenValue));

  // ... (All other detailed nudges and adjustments from the end of the original function) ...

  return { [pDetails.key || "amount"]: chosenValue };
}

// --- MAIN EXPORTED FUNCTION ---

/**
 * The primary decision-making function for an AI politician deciding which policy to propose.
 * This is the refactored, high-level orchestrator.
 */
export const decideAndAuthorAIBill = (
  aiPolitician,
  availablePolicyIds,
  cityStats,
  activeLegislation,
  proposedLegislation,
  allPolicyDefsForLevel
) => {
  if (!aiPolitician || !availablePolicyIds?.length || !cityStats?.budget) {
    return null; // Not enough data to make a decision
  }

  // --- PHASE 1: FILTERING & SCORING (Re-uses existing logic) ---
  const candidatePolicies = getValidPolicyCandidates(
    aiPolitician,
    (allPolicyDefsForLevel || []).filter((p) => availablePolicyIds.includes(p.id)),
    activeLegislation,
    proposedLegislation
  );
  if (candidatePolicies.length === 0) return null; // No valid policies to choose from

  const financialState = getFinancialState(cityStats);
  // This object is now used to pass more context down into the scoring functions
  const contextualData = {
    proposedLegislation: proposedLegislation,
    allPolicyDefs: allPolicyDefsForLevel,
  };

  const scoredPolicies = candidatePolicies
    .map((policy) => ({
      ...policy,
      proposalScore: scorePolicyForAI(
        policy,
        aiPolitician,
        cityStats,
        financialState,
        contextualData
      ),
    }))
    .sort((a, b) => b.proposalScore - a.proposalScore);

  const bestPolicy = scoredPolicies[0];
  // Stricter threshold if finances are good, to avoid spam.
  const proposalThreshold = financialState.hasDireFinances ? 0.1 : (financialState.isStrainedFinances ? 1.0 : 1.5);
  if (!bestPolicy || bestPolicy.proposalScore < proposalThreshold) {
    return null; // No single policy is good enough to even start a bill
  }

  // --- PHASE 2: BILL AUTHORING ---
  const billPolicies = [bestPolicy]; // The best policy is always the cornerstone of the bill
  const billTheme = bestPolicy.area; // The policy area of the best policy sets the bill's theme

  // Determine how many additional policies to try and add (e.g., 0 to 2)
  const additionalPoliciesCount = Math.floor(Math.random() * 3);

  // Find other high-scoring policies that match the bill's theme
  if (additionalPoliciesCount > 0) {
    const compatiblePolicies = scoredPolicies
      .filter(
        (p) =>
          p.id !== bestPolicy.id && // Not the one we already have
          p.area === billTheme && // Must match the theme
          p.proposalScore > proposalThreshold * 0.75 // Must still be a decent policy
      )
      .slice(0, additionalPoliciesCount); // Take the best compatible ones

    billPolicies.push(...compatiblePolicies);
  }

  // --- PHASE 3: PARAMETER SELECTION FOR THE WHOLE BILL ---
  const finalBillPolicies = billPolicies.map((policy) => {
    let chosenParameters = null;
    if (policy.isParameterized) {
      chosenParameters = selectOptimalParameter(
        policy,
        aiPolitician,
        cityStats,
        financialState,
        contextualData
      );
    }
    return {
      policyId: policy.id,
      chosenParameters: chosenParameters,
    };
  });

  if (finalBillPolicies.length === 0) return null;

  // Return the array of policies ready to be put into a bill
  return {
    policies: finalBillPolicies,
    theme: billTheme,
  };
};

/**
 * Checks if an AI should avoid proposing a policy based on recent failed attempts.
 * Returns true if the AI should avoid this policy due to recent failures.
 */
const shouldAvoidPolicyDueToFailures = (
  aiPolitician,
  policyId,
  failedBillsHistory,
  currentDate
) => {
  if (!failedBillsHistory?.length) return false;

  // Find recent failed bills by this AI that contained this policy
  const relevantFailures = failedBillsHistory.filter(failedBill => 
    failedBill.proposerId === aiPolitician.id &&
    failedBill.policies?.some(p => p.policyId === policyId)
  );

  if (relevantFailures.length === 0) return false;

  // Get the most recent failure for this policy
  const mostRecentFailure = relevantFailures
    .sort((a, b) => {
      const dateA = new Date(a.dateFailed.year, a.dateFailed.month - 1, a.dateFailed.day);
      const dateB = new Date(b.dateFailed.year, b.dateFailed.month - 1, b.dateFailed.day);
      return dateB - dateA;
    })[0];

  // Calculate months since the failure
  const failureDate = new Date(
    mostRecentFailure.dateFailed.year, 
    mostRecentFailure.dateFailed.month - 1, 
    mostRecentFailure.dateFailed.day
  );
  const currentDateObj = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
  const monthsSinceFailure = (currentDateObj - failureDate) / (1000 * 60 * 60 * 24 * 30.44); // Approximate months

  // Determine cooldown period based on margin of defeat
  const marginOfDefeat = mostRecentFailure.marginOfDefeat || 0;
  let cooldownMonths = 3; // Base cooldown

  if (marginOfDefeat >= 10) {
    cooldownMonths = 12; // 1 year for crushing defeats
  } else if (marginOfDefeat >= 5) {
    cooldownMonths = 8; // 8 months for significant defeats
  } else if (marginOfDefeat >= 2) {
    cooldownMonths = 6; // 6 months for moderate defeats
  }

  // Multiple failures increase cooldown
  if (relevantFailures.length >= 3) {
    cooldownMonths += 6; // Additional 6 months for persistent failures
  } else if (relevantFailures.length >= 2) {
    cooldownMonths += 3; // Additional 3 months for repeated failures
  }

  return monthsSinceFailure < cooldownMonths;
};

/**
 * Determines if an AI politician should propose a bill based on current conditions
 * rather than random chance. Returns true if the AI believes legislation is needed.
 */
export const shouldAIProposeBasedOnNeeds = (
  aiPolitician,
  availablePolicyIds,
  cityStats,
  activeLegislation,
  proposedLegislation,
  allPolicyDefsForLevel,
  failedBillsHistory,
  currentDate
) => {
  if (!aiPolitician || !availablePolicyIds?.length || !cityStats?.budget) {
    return false;
  }

  const financialState = getFinancialState(cityStats);
  const contextualData = {
    proposedLegislation: proposedLegislation,
    allPolicyDefs: allPolicyDefsForLevel,
  };

  // Get valid policy candidates
  const candidatePolicies = getValidPolicyCandidates(
    aiPolitician,
    (allPolicyDefsForLevel || []).filter((p) => availablePolicyIds.includes(p.id)),
    activeLegislation,
    proposedLegislation
  );

  if (candidatePolicies.length === 0) return false;

  // Filter out policies that the AI should avoid due to recent failures
  const viablePolicies = candidatePolicies.filter(policy => 
    !shouldAvoidPolicyDueToFailures(aiPolitician, policy.id, failedBillsHistory, currentDate)
  );

  if (viablePolicies.length === 0) return false;

  // Score all viable policies to find the most urgent needs
  const scoredPolicies = viablePolicies.map((policy) => ({
    ...policy,
    urgencyScore: scorePolicyForAI(
      policy,
      aiPolitician,
      cityStats,
      financialState,
      contextualData
    ),
  }));

  const bestPolicy = scoredPolicies.sort((a, b) => b.urgencyScore - a.urgencyScore)[0];
  
  // Determine urgency thresholds based on conditions
  let urgencyThreshold = 2.0; // Base threshold
  
  // Lower threshold (more likely to propose) in crisis situations
  if (financialState.hasDireFinances) {
    urgencyThreshold = 1.0;
  } else if (financialState.isStrainedFinances) {
    urgencyThreshold = 1.5;
  }
  
  // Check for service quality issues that demand attention
  const hasServiceCrisis = Object.values(cityStats.services || {}).some(service => 
    service.rating === 'F' || service.rating === 'D-'
  );
  
  if (hasServiceCrisis) {
    urgencyThreshold *= 0.7; // Make more likely to propose
  }
  
  // Check for economic indicators that suggest action is needed
  const economicConcerns = 
    cityStats.budget?.cityBalance < 0 || 
    (cityStats.budget?.cityIncome < cityStats.budget?.expenses * 0.9);
    
  if (economicConcerns) {
    urgencyThreshold *= 0.8;
  }
  
  // AI ideology affects willingness to propose
  const ideologyFactor = aiPolitician.ideology === 'progressive' ? 0.9 : 
                        aiPolitician.ideology === 'conservative' ? 1.1 : 1.0;
  urgencyThreshold *= ideologyFactor;
  
  // Return true if the best policy exceeds the urgency threshold
  return bestPolicy && bestPolicy.urgencyScore >= urgencyThreshold;
};

// NOTE: The smaller helper functions used by selectOptimalParameter like getBudgetAdjustmentTarget,
// getTaxAdjustmentTarget, and applyBudgetAdjustmentCaps would also need to be included in this file for it to be complete.
// They have been omitted here for brevity but are sourced from the original aiUtils.js.
