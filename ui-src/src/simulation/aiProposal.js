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

  const financialState = {
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

  return financialState;
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
  financialState,
  cityStats
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

  const { hasDireFinances, isStrainedFinances, hasLargeSurplus } =
    financialState;

  if (hasDireFinances) factor += 0.6;
  else if (isStrainedFinances) factor += 0.4;
  else if (hasLargeSurplus) {
    // Calculate surplus magnitude to determine spending willingness
    const budget = cityStats?.budget || {};
    const monthlyIncome = budget.cityIncome || 0;
    const monthlyExpenses = budget.totalExpenses || 0;
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const surplusRatio = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;

    // Larger surpluses should make AI less fiscally conservative
    const surplusReduction = Math.min(0.5, surplusRatio * 1.2);
    factor -= 0.2 + surplusReduction;
  }

  // Add budget consciousness based on current debt levels
  if (financialState.hasHighDebt) factor += 0.3;
  else if (financialState.hasSignificantDeficit) factor += 0.2;

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
// Cache for locked targets to avoid repeated computation
let _lockedTargetsCache = null;
let _lastProposedLegislationHash = null;

const getLockedTargets = (
  proposedLegislationThisCycle,
  currentAiId,
  allPolicyDefs
) => {
  // Create a simple hash of the proposed legislation to detect changes
  const proposedHash = (proposedLegislationThisCycle || [])
    .map((b) => `${b.id}:${b.proposerId}`)
    .sort()
    .join("|");

  // Return cached result if nothing changed
  if (_lockedTargetsCache && _lastProposedLegislationHash === proposedHash) {
    return _lockedTargetsCache;
  }

  const budgetLines = new Set();
  const taxRates = new Set();

  // Early exit if no proposed legislation
  if (!proposedLegislationThisCycle?.length) {
    const result = { budgetLines, taxRates };
    _lockedTargetsCache = result;
    _lastProposedLegislationHash = proposedHash;
    return result;
  }

  // Create policy definition lookup map for O(1) access
  const policyDefMap = new Map();
  if (allPolicyDefs) {
    for (const policyDef of allPolicyDefs) {
      if (policyDef.isParameterized && policyDef.parameterDetails) {
        policyDefMap.set(policyDef.id, policyDef.parameterDetails);
      }
    }
  }

  // Process bills by others
  for (const bill of proposedLegislationThisCycle) {
    if (bill.proposerId === currentAiId) continue;

    for (const policyInBill of bill.policies) {
      const pDetails = policyDefMap.get(policyInBill.policyId);
      if (pDetails) {
        if (pDetails.targetBudgetLine)
          budgetLines.add(pDetails.targetBudgetLine);
        if (pDetails.targetTaxRate) taxRates.add(pDetails.targetTaxRate);
      }
    }
  }

  const result = { budgetLines, taxRates };
  _lockedTargetsCache = result;
  _lastProposedLegislationHash = proposedHash;
  return result;
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
            law.status === "enacted" || // Include enacted but not yet implemented
            law.status === "active") // Include currently active policies
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

/**
 * **PIPELINE STEP 2:** Calculates a proposal score for a single policy.
 * @returns {number} The calculated proposal score.
 */
// Cache for policy scores to avoid repeated computation
let _policyScoringCache = new Map();
let _lastCityStatsHash = null;

function scorePolicyForAI(
  policy,
  aiPolitician,
  cityStats,
  financialState,
  contextualData
) {
  // Create cache key
  const cacheKey = `${policy.id}:${aiPolitician.id}:${aiPolitician.calculatedIdeology}`;

  // Simple hash of city stats to detect changes
  const cityStatsHash = `${cityStats.budget?.balance || 0}:${
    cityStats.mainIssues?.join(",") || ""
  }`;

  // Return cached result if city stats haven't changed significantly
  if (
    _lastCityStatsHash === cityStatsHash &&
    _policyScoringCache.has(cacheKey)
  ) {
    return _policyScoringCache.get(cacheKey);
  }

  // Clear cache if city stats changed
  if (_lastCityStatsHash !== cityStatsHash) {
    _policyScoringCache.clear();
    _lastCityStatsHash = cityStatsHash;
  }

  let score = 1.0;
  const pDetails = policy.parameterDetails;

  // 1. Ideological Factor
  score += (policy.baseSupport?.[aiPolitician.calculatedIdeology] || 0) * 1.1;

  // 2. Addressing Key City Issues - optimized with early exit
  if (cityStats.mainIssues?.length && policy.tags?.length) {
    for (const issue of cityStats.mainIssues) {
      const issueLower = issue.toLowerCase();
      for (const tag of policy.tags) {
        const tagLower = tag.toLowerCase();
        if (issueLower.includes(tagLower) || tagLower.includes(issueLower)) {
          score += 0.8;
          break; // Found match, no need to check more tags for this issue
        }
      }
    }
  }


  // 3. AI Politician's Policy Focus - optimized
  if (aiPolitician.policyFocus && policy.tags?.length) {
    const focusLower = aiPolitician.policyFocus.toLowerCase();
    for (const tag of policy.tags) {
      const tagLower = tag.toLowerCase();
      if (focusLower.includes(tagLower) || tagLower.includes(focusLower)) {
        score += 0.6;
        break; // Found match, exit early
      }
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
    if (cityStats.healthcareCoverage >= 100) {
      score -= 3.0; // Strongly discourage more healthcare spending at 100% coverage
    } else if (cityStats.healthcareCoverage >= 90) {
      score -= 1.0; // Discourage at very high coverage
    } else if (cityStats.healthcareCoverage < 40) {
      score += 2.5;
    } else if (cityStats.healthcareCoverage < 60) {
      score += 1.5;
    } else if (cityStats.healthcareCoverage < 75) {
      score += 0.8;
    }
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
    const lockedTargets = getLockedTargets(
      contextualData.proposedLegislation,
      aiPolitician.id,
      contextualData.allPolicyDefs
    );
    if (
      pDetails.targetBudgetLine &&
      lockedTargets.budgetLines.has(pDetails.targetBudgetLine)
    ) {
      score -= 3.0; // Strong penalty for targeting an already-addressed budget line
    }
    if (
      pDetails.targetTaxRate &&
      lockedTargets.taxRates.has(pDetails.targetTaxRate)
    ) {
      score -= 3.0; // Strong penalty for targeting an already-addressed tax rate
    }
  }

  score += Math.random() * 0.1 - 0.05;

  // Cache the result
  _policyScoringCache.set(cacheKey, score);
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
    financialState,
    cityStats
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
      financialState,
      cityStats
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
    (allPolicyDefsForLevel || []).filter((p) =>
      availablePolicyIds.includes(p.id)
    ),
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
  const proposalThreshold = financialState.hasDireFinances
    ? 0.1
    : financialState.isStrainedFinances
    ? 1.0
    : 1.5;
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
  const relevantFailures = failedBillsHistory.filter(
    (failedBill) =>
      failedBill.proposerId === aiPolitician.id &&
      failedBill.policies?.some((p) => p.policyId === policyId)
  );

  if (relevantFailures.length === 0) return false;

  // Get the most recent failure for this policy
  const mostRecentFailure = relevantFailures.sort((a, b) => {
    const dateA = new Date(
      a.dateFailed.year,
      a.dateFailed.month - 1,
      a.dateFailed.day
    );
    const dateB = new Date(
      b.dateFailed.year,
      b.dateFailed.month - 1,
      b.dateFailed.day
    );
    return dateB - dateA;
  })[0];

  // Calculate months since the failure
  const failureDate = new Date(
    mostRecentFailure.dateFailed.year,
    mostRecentFailure.dateFailed.month - 1,
    mostRecentFailure.dateFailed.day
  );
  const currentDateObj = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day
  );
  const monthsSinceFailure =
    (currentDateObj - failureDate) / (1000 * 60 * 60 * 24 * 30.44); // Approximate months

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
    (allPolicyDefsForLevel || []).filter((p) =>
      availablePolicyIds.includes(p.id)
    ),
    activeLegislation,
    proposedLegislation
  );

  if (candidatePolicies.length === 0) return false;

  // Filter out policies that the AI should avoid due to recent failures
  const viablePolicies = candidatePolicies.filter(
    (policy) =>
      !shouldAvoidPolicyDueToFailures(
        aiPolitician,
        policy.id,
        failedBillsHistory,
        currentDate
      )
  );

  if (viablePolicies.length === 0) return false;

  // Score policies with early exit optimization - only score until we find a good enough policy
  let bestPolicy = null;
  let bestScore = -Infinity;

  // Determine urgency thresholds based on conditions first
  let urgencyThreshold = 3.0; // Moderate base threshold to reduce spam

  // Lower threshold (more likely to propose) in crisis situations
  if (financialState.hasDireFinances) {
    urgencyThreshold = 1.5; // Lower threshold for dire finances
  } else if (financialState.isStrainedFinances) {
    urgencyThreshold = 2.0; // Moderate threshold for strained finances
  } else if (financialState.hasLargeSurplus) {
    urgencyThreshold = 2.5; // Slightly lower threshold with surplus
  }

  // Score policies with early exit when we find a good enough candidate
  for (const policy of viablePolicies) {
    const urgencyScore = scorePolicyForAI(
      policy,
      aiPolitician,
      cityStats,
      financialState,
      contextualData
    );

    if (urgencyScore > bestScore) {
      bestScore = urgencyScore;
      bestPolicy = { ...policy, urgencyScore };
    }

    // Early exit if we found a policy that exceeds threshold by a good margin
    if (urgencyScore >= urgencyThreshold + 1.0) {
      bestPolicy = { ...policy, urgencyScore };
      break;
    }
  }

  if (!bestPolicy) return false;

  // Check for service quality issues that demand attention
  const hasServiceCrisis = Object.values(cityStats.services || {}).some(
    (service) => service.rating === "F" || service.rating === "D-"
  );

  if (hasServiceCrisis) {
    urgencyThreshold *= 0.7; // Make more likely to propose
  }

  // Check for economic indicators that suggest action is needed
  const economicConcerns =
    cityStats.budget?.cityBalance < 0 ||
    cityStats.budget?.cityIncome < cityStats.budget?.expenses * 0.9;

  if (economicConcerns) {
    urgencyThreshold *= 0.8;
  }

  // AI ideology affects willingness to propose
  const ideologyFactor =
    aiPolitician.ideology === "progressive"
      ? 0.9
      : aiPolitician.ideology === "conservative"
      ? 1.1
      : 1.0;
  urgencyThreshold *= ideologyFactor;

  // Return true if the best policy exceeds the urgency threshold
  return bestPolicy && bestPolicy.urgencyScore >= urgencyThreshold;
};

/**
 * Determines target point in parameter range for budget adjustments
 */
function getBudgetAdjustmentTarget(pDetails, serviceInfo, fiscalConservatismFactor, financialState, cityStats) {
  let targetPoint = 0.5; // Default to middle of range
  
  // If service rating is poor, be more aggressive with spending
  if (serviceInfo.ratingIndex >= 0) {
    const ratingLevels = Object.values(RATING_LEVELS);
    const normalizedRating = serviceInfo.ratingIndex / (ratingLevels.length - 1);
    
    // Poor ratings (0-0.3) -> aggressive spending (0.7-1.0)
    // Good ratings (0.7-1.0) -> conservative spending (0.1-0.4)
    targetPoint = Math.max(0.1, Math.min(0.9, 1.0 - normalizedRating + 0.2));
  }
  
  // Adjust based on financial state
  if (financialState.hasLargeSurplus) {
    targetPoint = Math.min(0.9, targetPoint + 0.3); // Spend more with surplus
  } else if (financialState.hasDireFinances) {
    // For dire finances, consider spending cuts (below 0.5 = cuts)
    targetPoint = Math.max(0.1, targetPoint - 0.4); // Aggressive spending cuts
  } else if (financialState.isStrainedFinances) {
    targetPoint = Math.max(0.2, targetPoint - 0.2); // Moderate spending cuts
  }
  
  // Apply conservatism factor
  targetPoint = targetPoint * (1 - fiscalConservatismFactor) + 0.5 * fiscalConservatismFactor;
  
  return Math.max(0.1, Math.min(0.9, targetPoint));
}

/**
 * Determines target point in parameter range for tax adjustments
 */
function getTaxAdjustmentTarget(pDetails, cityStats, fiscalConservatismFactor, financialState) {
  let targetPoint = 0.5; // Default to middle of range
  
  // Be more aggressive with tax increases when finances are bad
  if (financialState.hasDireFinances) {
    targetPoint = 0.8; // Aggressive tax increases
  } else if (financialState.isStrainedFinances) {
    targetPoint = 0.7; // Moderate tax increases
  } else if (financialState.hasLargeSurplus) {
    targetPoint = 0.3; // Consider tax cuts with surplus
  }
  
  // Apply conservatism factor - conservatives less likely to raise taxes
  if (fiscalConservatismFactor > 0.6) {
    targetPoint = Math.max(0.2, targetPoint - 0.3);
  }
  
  return Math.max(0.1, Math.min(0.9, targetPoint));
}

/**
 * Applies caps to budget adjustments to prevent extreme values
 */
function applyBudgetAdjustmentCaps(chosenValue, pDetails, cityStats, contextualData, serviceInfo, financialState) {
  const cityIncome = cityStats.budget.totalAnnualIncome || cityStats.budget.annualIncome || 1;
  
  // Set much more aggressive caps based on city income - scale with billions
  let maxSpending = cityIncome * 0.15; // Up to 15% of annual income for major programs
  let minSpending = Math.max(pDetails.min, cityIncome * 0.001); // At least 0.1% of income
  
  // Adjust caps based on service type with higher limits
  if (pDetails.targetBudgetLine === 'policeDepartment' || pDetails.targetBudgetLine === 'publicEducation') {
    maxSpending = cityIncome * 0.25; // Up to 25% for critical services
  } else if (pDetails.targetBudgetLine === 'parksAndRecreation' || pDetails.targetBudgetLine === 'librariesAndCulture') {
    maxSpending = cityIncome * 0.08; // 8% for non-essential services
  } else if (pDetails.targetBudgetLine === 'infrastructure') {
    maxSpending = cityIncome * 0.20; // 20% for infrastructure
  }
  
  // With large surplus, allow even more aggressive spending
  if (financialState.hasLargeSurplus) {
    maxSpending *= 2.0; // Double the spending cap with surplus
  }
  
  // With dire finances, allow deeper cuts but reduce maximum spending
  if (financialState.hasDireFinances) {
    maxSpending *= 0.4; // Reduce max spending significantly
    minSpending = Math.max(pDetails.min, cityIncome * 0.0005); // Allow deeper cuts
  } else if (financialState.isStrainedFinances) {
    maxSpending *= 0.7; // Moderate reduction in max spending
    minSpending = Math.max(pDetails.min, cityIncome * 0.0008); // Allow some cuts
  }
  
  return Math.max(minSpending, Math.min(maxSpending, chosenValue));
}


