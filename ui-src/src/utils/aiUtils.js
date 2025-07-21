import { CITY_POLICIES } from "../data/policyDefinitions";
import { RATING_LEVELS } from "../data/governmentData";
import { calculateAdultPopulation, getRandomInt } from "./core";

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
  let ratingString = null;
  let statName = null;
  const budgetLineToStatMap = {
    policeDepartment: "publicSafetyRating",
    fireDepartment: "fireSafetyRating",
    roadInfrastructure: "infrastructureRating",
    socialWelfarePrograms: "socialServicesRating",
    cityPlanningAndDevelopment: "developmentRating",
    publicTransit: "publicTransitRating",
    publicEducation: "educationRating",
    wasteManagement: "wasteManagementRating",
    parksAndRecreation: "parksAndRecreationRating",
    librariesAndCulture: "cultureAndArtsRating",
    publicHealthServices: "healthRating",
    generalAdministration: "governanceRating",
  };
  statName = budgetLineToStatMap[targetBudgetLine];
  if (statName && cityStats[statName]) ratingString = cityStats[statName];
  else if (
    targetBudgetLine === "cityPlanningAndDevelopment" &&
    cityStats.economicOutlook
  ) {
    statName = "economicOutlook";
    ratingString = cityStats.economicOutlook;
  } else if (
    targetBudgetLine === "wasteManagement" &&
    cityStats.environmentRating
  ) {
    statName = "environmentRating";
    ratingString = cityStats.environmentRating;
  }
  const ratingIndex = ratingString
    ? RATING_LEVELS_ARR.indexOf(ratingString)
    : -1;
  return { ratingIndex, ratingString, statName, isValid: ratingIndex !== -1 };
};

// Refactored Helper: Calculate Fiscal Conservatism Factor
const calculateFiscalConservatismFactor = (aiPolitician, financialState) => {
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

// Refactored Helper: Get Target Point for Budget Adjustments
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
  contextualPendingBudgetAdjustments,
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
    const contextualIncreaseDetails = contextualPendingBudgetAdjustments.get(
      pDetails.targetBudgetLine
    );
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

// Refactored Helper: Calculate Policy Fiscal Score
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

export const decideAIPolicyProposal = (
  aiPolitician,
  availablePolicyIds,
  cityStats,
  activeLegislation,
  proposedLegislation
) => {
  if (
    !aiPolitician ||
    !availablePolicyIds ||
    availablePolicyIds.length === 0 ||
    !cityStats ||
    !cityStats.budget ||
    !RATING_LEVELS
  ) {
    console.warn("[AI Propose] Missing critical data.");
    return null;
  }

  // --- 1. Initial Policy ID Filtering ---
  const trulyBlockingActivePolicyIds = new Set(
    (activeLegislation || [])
      .filter((activeLeg) => {
        const policyDef = CITY_POLICIES.find(
          (def) => def.id === activeLeg.policyId
        );
        if (!policyDef) return false;
        if (
          policyDef.isParameterized &&
          (policyDef.parameterDetails?.targetBudgetLine ||
            policyDef.parameterDetails?.targetTaxRate)
        ) {
          return false;
        }
        return true;
      })
      .map((p) => p.policyId)
  );

  const policyIdsProposedByAnyoneThisCycle = new Set(
    (proposedLegislation || []).map((p) => p.policyId)
  );

  let localPotentialPolicies = CITY_POLICIES.filter(
    (policyDef) =>
      availablePolicyIds.includes(policyDef.id) &&
      !trulyBlockingActivePolicyIds.has(policyDef.id) &&
      !policyIdsProposedByAnyoneThisCycle.has(policyDef.id)
  );

  if (localPotentialPolicies.length === 0) {
    return null;
  }

  // --- 2. Identify Budget/Tax Targets Locked by OTHER AIs in THIS Cycle ---
  const proposalsByOtherAIsThisCycle = (proposedLegislation || []).filter(
    (p) => p.proposerId !== aiPolitician.id
  );

  const budgetLinesLockedByOthersThisCycle = new Set();
  const taxRatesLockedByOthersThisCycle = new Set();

  proposalsByOtherAIsThisCycle.forEach((legInstance) => {
    const policyDef = CITY_POLICIES.find((p) => p.id === legInstance.policyId);
    if (!policyDef) return;
    if (policyDef.isParameterized && policyDef.parameterDetails) {
      const pDetailsInstance = policyDef.parameterDetails;
      if (pDetailsInstance.targetBudgetLine) {
        budgetLinesLockedByOthersThisCycle.add(
          pDetailsInstance.targetBudgetLine
        );
      } else if (pDetailsInstance.targetTaxRate) {
        taxRatesLockedByOthersThisCycle.add(pDetailsInstance.targetTaxRate);
      }
    }
  });

  // --- 3. Apply Strict Target-Lock Filter ---
  localPotentialPolicies = localPotentialPolicies.filter((policy) => {
    if (policy.isParameterized && policy.parameterDetails) {
      const pDetails = policy.parameterDetails;
      if (
        pDetails.targetBudgetLine &&
        budgetLinesLockedByOthersThisCycle.has(pDetails.targetBudgetLine)
      ) {
        return false;
      }
      if (
        pDetails.targetTaxRate &&
        taxRatesLockedByOthersThisCycle.has(pDetails.targetTaxRate)
      ) {
        return false;
      }
    }
    return true;
  });

  if (localPotentialPolicies.length === 0) {
    return null;
  }

  // --- 4. Financial Status and Contextual Pending Adjustments ---
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

  const contextualPendingBudgetAdjustments = new Map();
  const contextualPendingTaxAdjustments = new Map();

  [...(activeLegislation || []), ...proposalsByOtherAIsThisCycle].forEach(
    (legInstance) => {
      const policyDef = CITY_POLICIES.find(
        (p) => p.id === legInstance.policyId
      );
      if (
        !policyDef ||
        !policyDef.isParameterized ||
        !policyDef.parameterDetails ||
        !legInstance.chosenParameters
      )
        return;
      const pDetailsInstance = policyDef.parameterDetails;
      const chosenParamsInstance = legInstance.chosenParameters;
      const paramKeyInstance = pDetailsInstance.key || "amount";
      const valueInstance = chosenParamsInstance[paramKeyInstance];

      if (typeof valueInstance !== "number") return;

      if (pDetailsInstance.targetBudgetLine) {
        const budgetLine = pDetailsInstance.targetBudgetLine;
        if (!contextualPendingBudgetAdjustments.has(budgetLine)) {
          contextualPendingBudgetAdjustments.set(budgetLine, {
            increaseCount: 0,
            decreaseCount: 0,
            totalIncreaseAmount: 0,
            totalDecreaseAmount: 0,
          });
        }
        const adj = contextualPendingBudgetAdjustments.get(budgetLine);
        if (valueInstance > 0) {
          adj.increaseCount++;
          adj.totalIncreaseAmount += valueInstance;
        } else if (valueInstance < 0) {
          adj.decreaseCount++;
          adj.totalDecreaseAmount += Math.abs(valueInstance);
        }
      } else if (pDetailsInstance.targetTaxRate) {
        const taxRate = pDetailsInstance.targetTaxRate;
        if (!contextualPendingTaxAdjustments.has(taxRate)) {
          contextualPendingTaxAdjustments.set(taxRate, {
            increaseCount: 0,
            decreaseCount: 0,
          });
        }
        const adj = contextualPendingTaxAdjustments.get(taxRate);
        if (valueInstance > 0) adj.increaseCount++;
        else if (valueInstance < 0) adj.decreaseCount++;
      }
    }
  );

  // --- 5. Scoring Policies ---
  const scoredPolicies = localPotentialPolicies
    .map((policy) => {
      let score = 1.0;
      const pDetails = policy.parameterDetails;

      // 1. Ideological Factor
      const ideologicalFactor =
        policy.baseSupport?.[aiPolitician.calculatedIdeology] || 0;
      score += ideologicalFactor * 1.1;

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

      // 4. Bonus for addressing services with low ratings
      if (policy.isParameterized && pDetails?.targetBudgetLine) {
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

      if (cityStats.healthcareCoverage != null) {
        // Check if the policy is related to healthcare (adjust tags/targetBudgetLine as per your policy definitions)
        const isHealthcarePolicy =
          policy.tags?.includes("healthcare") ||
          policy.tags?.includes("public_health") ||
          pDetails?.targetBudgetLine === "publicHealthServices";

        if (isHealthcarePolicy) {
          if (cityStats.healthcareCoverage < 40) {
            // Very low coverage
            score += 2.5; // Very high priority for AI to address
          } else if (cityStats.healthcareCoverage < 60) {
            // Low coverage
            score += 1.5; // High priority
          } else if (cityStats.healthcareCoverage < 75) {
            // Moderate coverage
            score += 0.8; // Medium priority
          }
          // If coverage is high (>= 75), AI might not prioritize increasing it further through new policy
        }
      }

      // 5.A. DETAILED FISCAL CONSIDERATION SCORING
      score += calculateDetailedFiscalScore(
        policy,
        pDetails,
        cityStats,
        RATING_LEVELS,
        financialState
      );

      // 5.B Softer Contextual Redundancy Penalty
      let contextualRedundancyPenalty = 0.0;
      if (policy.isParameterized && pDetails) {
        let policyProposesIncrease = false;
        let policyProposesDecrease = false;
        if (pDetails.targetBudgetLine || pDetails.targetTaxRate) {
          if (pDetails.adjustmentType === "increase")
            policyProposesIncrease = true;
          else if (pDetails.adjustmentType === "decrease")
            policyProposesDecrease = true;
          else {
            if ((pDetails.defaultValue || 0) > 0.0001)
              policyProposesIncrease = true;
            else if ((pDetails.defaultValue || 0) < -0.0001)
              policyProposesDecrease = true;
          }
        }
        if (pDetails.targetBudgetLine) {
          const context = contextualPendingBudgetAdjustments.get(
            pDetails.targetBudgetLine
          );
          if (context) {
            if (
              policyProposesIncrease &&
              context.totalIncreaseAmount > cityIncome * 0.03
            ) {
              contextualRedundancyPenalty += 0.5 + context.increaseCount * 0.25;
            }
            if (
              policyProposesDecrease &&
              context.totalDecreaseAmount > cityIncome * 0.03
            ) {
              contextualRedundancyPenalty += 0.5 + context.decreaseCount * 0.25;
            }
          }
        } else if (pDetails.targetTaxRate) {
          const context = contextualPendingTaxAdjustments.get(
            pDetails.targetTaxRate
          );
          if (context) {
            if (policyProposesIncrease && context.increaseCount > 0) {
              contextualRedundancyPenalty += 0.8 * context.increaseCount;
            }
            if (policyProposesDecrease && context.decreaseCount > 0) {
              contextualRedundancyPenalty += 0.8 * context.decreaseCount;
            }
          }
        }
      }
      score -= contextualRedundancyPenalty;

      score += Math.random() * 0.1 - 0.05;
      return { ...policy, proposalScore: score };
    })
    .sort((a, b) => b.proposalScore - a.proposalScore);

  if (
    scoredPolicies.length === 0 ||
    scoredPolicies[0].proposalScore <
      (financialState.hasDireFinances ? 0.1 : 0.8)
  ) {
    return null;
  }

  const bestPolicyToPropose = scoredPolicies[0];
  let chosenParametersObject = null;

  // --- 6. Parameter Selection ---
  if (
    bestPolicyToPropose.isParameterized &&
    bestPolicyToPropose.parameterDetails
  ) {
    const pDetails = bestPolicyToPropose.parameterDetails;
    let chosenValue;

    const fiscalConservatismFactor = calculateFiscalConservatismFactor(
      aiPolitician,
      financialState
    );
    const range = pDetails.max - pDetails.min;
    let targetPointInRange;

    if (pDetails.targetBudgetLine) {
      const serviceInfo = getServiceRatingDetails(
        pDetails.targetBudgetLine,
        cityStats,
        RATING_LEVELS
      );
      targetPointInRange = getBudgetAdjustmentTarget(
        pDetails,
        serviceInfo,
        fiscalConservatismFactor,
        financialState
      );
      chosenValue = pDetails.min + range * targetPointInRange;
      chosenValue = applyBudgetAdjustmentCaps(
        chosenValue,
        pDetails,
        cityStats,
        contextualPendingBudgetAdjustments,
        serviceInfo,
        financialState
      );
    } else if (pDetails.targetTaxRate) {
      targetPointInRange = getTaxAdjustmentTarget(
        pDetails,
        cityStats,
        fiscalConservatismFactor,
        financialState
      );
      chosenValue = pDetails.min + range * targetPointInRange;

      if (
        Math.abs(chosenValue) < pDetails.step / 1.9 &&
        Math.abs(0.5 - targetPointInRange) > 0.1
      ) {
        let intendedDirection =
          Math.sign(targetPointInRange - 0.5) ||
          Math.sign(pDetails.defaultValue || (Math.random() < 0.5 ? 1 : -1));
        chosenValue = pDetails.step * intendedDirection * getRandomInt(1, 2);
        if (chosenValue === 0)
          chosenValue = intendedDirection * (pDetails.step || 0.001);
      }
    } else {
      chosenValue =
        pDetails.defaultValue !== undefined
          ? pDetails.defaultValue
          : pDetails.min + range * (0.3 + Math.random() * 0.4);
    }

    if (pDetails.step)
      chosenValue = Math.round(chosenValue / pDetails.step) * pDetails.step;
    chosenValue = Math.max(pDetails.min, Math.min(pDetails.max, chosenValue));

    // Nudge zero tax
    if (
      pDetails.targetTaxRate &&
      chosenValue === 0 &&
      (pDetails.min !== 0 || pDetails.max !== 0) &&
      pDetails.defaultValue !== 0
    ) {
      if (fiscalConservatismFactor > 0.1) {
        chosenValue = Math.max(
          pDetails.min,
          pDetails.defaultValue * 0.5 || pDetails.step * getRandomInt(1, 2) * -1
        );
      } else if (fiscalConservatismFactor < -0.1) {
        chosenValue = Math.min(
          pDetails.max,
          pDetails.defaultValue * 1.5 || pDetails.step * getRandomInt(1, 2)
        );
      } else {
        chosenValue =
          Math.random() < 0.5
            ? pDetails.step || 0.001
            : -(pDetails.step || 0.001);
      }
      chosenValue = Math.max(pDetails.min, Math.min(pDetails.max, chosenValue));
    }

    // Nudge tiny positive to cut
    if (
      pDetails.targetBudgetLine &&
      (financialState.hasDireFinances || financialState.isStrainedFinances) &&
      chosenValue > 0 &&
      chosenValue < (pDetails.step || 1) * 5 &&
      pDetails.min < 0 &&
      (pDetails.adjustmentType === "decrease" ||
        pDetails.adjustmentType === "increase_or_decrease")
    ) {
      chosenValue = -((pDetails.step || 1) * getRandomInt(1, 3));
      chosenValue = Math.max(pDetails.min, chosenValue);
      const budgetLineName = pDetails.targetBudgetLine;
      const currentActualBudgetForLine =
        cityStats.budget.expenseAllocations?.[budgetLineName] || 0;
      if (currentActualBudgetForLine <= 0) {
        chosenValue = 0;
      } else if (Math.abs(chosenValue) > currentActualBudgetForLine) {
        chosenValue = -currentActualBudgetForLine;
      }
    }

    // Nudge tiny increase to be meaningful
    if (
      pDetails.targetBudgetLine &&
      financialState.hasLargeSurplus &&
      chosenValue > 0 &&
      chosenValue < pDetails.max * 0.05 &&
      targetPointInRange > 0.7
    ) {
      chosenValue = Math.min(
        pDetails.max,
        Math.max(
          chosenValue * getRandomInt(2, 4),
          pDetails.max * 0.05 + (pDetails.step || 1)
        )
      );
    }

    chosenParametersObject = { [pDetails.key || "amount"]: chosenValue };
  }

  return {
    policyId: bestPolicyToPropose.id,
    chosenParameters: chosenParametersObject,
    debug: {
      score: bestPolicyToPropose.proposalScore,
      financialState: {
        hasDireFinances: financialState.hasDireFinances,
        isStrainedFinances: financialState.isStrainedFinances,
        hasLargeSurplus: financialState.hasLargeSurplus,
        isComfortableFinancially: financialState.isComfortableFinancially,
      },
    },
  };
};

/**
 * Simulates a day of campaign activities for a single AI politician.
 * This function DECIDES actions and calls store actions to execute them.
 * Assumes AI politician's hours are already reset for the day before this is called.
 */
export const simulateAICampaignDayForPolitician = (
  aiPoliticianObject, // The AI politician object (ensure it's the latest from state or will be updated by ID)
  activeCampaign, // The current activeCampaign state
  storeActions // All Zustand store actions (e.g., get().actions)
) => {
  if (
    !aiPoliticianObject ||
    !activeCampaign ||
    !storeActions ||
    aiPoliticianObject.isPlayer
  ) {
    return;
  }

  // Find the specific election this AI is an active candidate in
  let currentElectionForAI = null;
  let aiCandidateDataInElection = null;

  for (const election of activeCampaign.elections || []) {
    if (
      election.electoralSystem === "PartyListPR" ||
      election.electoralSystem === "MMP"
    ) {
      return;
    }
    if (election.outcome?.status === "upcoming") {
      const candidateEntry = election.candidates?.find(
        (c) => c.id === aiPoliticianObject.id
      );
      if (candidateEntry) {
        currentElectionForAI = election;
        aiCandidateDataInElection = candidateEntry;
        break;
      }
    }
  }

  // Use hours from the politician object passed in. Actions will update the store version.
  let hoursLeftForThisAI = aiPoliticianObject.campaignHoursRemainingToday || 0;
  const city = activeCampaign.startingCity;
  const adultPopulation =
    calculateAdultPopulation(
      city?.population,
      city?.demographics?.ageDistribution
    ) || 1;

  const MAX_AI_ACTIONS_PER_DAY = getRandomInt(1, 3);
  let actionsPerformedThisDay = 0;

  while (
    hoursLeftForThisAI > 0 &&
    actionsPerformedThisDay < MAX_AI_ACTIONS_PER_DAY
  ) {
    const currentFunds = aiPoliticianObject.campaignFunds || 0;
    const currentNameRec = aiPoliticianObject.nameRecognition || 0;
    const currentVolunteers = aiPoliticianObject.volunteerCount || 0;
    const currentMediaBuzz = aiPoliticianObject.mediaBuzz || 0;
    const myPolling = aiCandidateDataInElection?.polling || 0;

    let availableActions = [];

    // 1. Fundraising (if funds are low and not too close to election)
    const fundraisingHoursChoice = getRandomInt(
      2,
      Math.min(4, hoursLeftForThisAI)
    );
    if (
      currentFunds <
        (currentElectionForAI.daysUntilElection < 30 ? 5000 : 10000) &&
      hoursLeftForThisAI >= fundraisingHoursChoice
    ) {
      let score = 3.0 + (10000 - currentFunds) / 2000;
      if (currentElectionForAI.daysUntilElection < 15) score -= 2.0;
      availableActions.push({
        name: "personalFundraisingActivity",
        score,
        hours: fundraisingHoursChoice,
      });
    }

    // 2. Name Recognition (if low) - Door Knocking or Public Appearance
    const nameRecFraction = currentNameRec / adultPopulation;
    const doorKnockingHoursChoice = getRandomInt(
      2,
      Math.min(6, hoursLeftForThisAI)
    );
    if (
      nameRecFraction < 0.3 &&
      hoursLeftForThisAI >= doorKnockingHoursChoice
    ) {
      let score = 2.5 + (0.3 - nameRecFraction) * 10;
      score += currentVolunteers / 25;
      availableActions.push({
        name: "goDoorKnocking",
        score,
        hours: doorKnockingHoursChoice,
      });
    }

    const appearanceHoursChoice = getRandomInt(
      2,
      Math.min(4, hoursLeftForThisAI)
    );
    const appearanceCost = 100;
    if (
      nameRecFraction < 0.5 &&
      (aiPoliticianObject.treasury || 0) >= appearanceCost &&
      hoursLeftForThisAI >= appearanceHoursChoice
    ) {
      let score = 1.5 + (0.5 - nameRecFraction) * 5;
      score += ((aiPoliticianObject.attributes?.charisma || 5) - 5) * 0.2;
      if (currentMediaBuzz < 40) score += 0.5;
      availableActions.push({
        name: "makePublicAppearanceActivity",
        score,
        hours: appearanceHoursChoice,
      });
    }

    // 3. Rally (if decent name rec, funds, volunteers, and mid-to-late campaign)
    const rallyHoursChoice = getRandomInt(3, Math.min(6, hoursLeftForThisAI));
    const rallyCost = 500 + rallyHoursChoice * 150;
    if (
      nameRecFraction > 0.2 &&
      currentFunds >= rallyCost &&
      currentVolunteers >= 5 * rallyHoursChoice &&
      hoursLeftForThisAI >= rallyHoursChoice
    ) {
      let score = 1.0 + nameRecFraction * 2 + currentVolunteers / 50;
      score += ((aiPoliticianObject.attributes?.oratory || 5) - 5) * 0.3;
      if (
        currentElectionForAI.daysUntilElection < 75 &&
        currentElectionForAI.daysUntilElection > 10
      )
        score += 1.5;
      availableActions.push({
        name: "holdRallyActivity",
        score,
        hours: rallyHoursChoice,
      });
    }

    const adBlitzHoursChoice = getRandomInt(2, Math.min(4, hoursLeftForThisAI));
    const adBlitzSpend = Math.min(currentFunds * 0.1, getRandomInt(1000, 5000));
    if (
      currentFunds > 1000 &&
      adBlitzSpend > 500 &&
      hoursLeftForThisAI >= adBlitzHoursChoice
    ) {
      let score = 0.5;
      const topOpponentPolling = Math.max(
        0,
        ...currentElectionForAI.candidates
          .filter((c) => c.id !== aiPoliticianObject.id)
          .map((c) => c.polling || 0)
      );
      if (myPolling < topOpponentPolling - 5) score += 1.0;
      if (currentElectionForAI.daysUntilElection < 30) score += 1.0;

      let adType = "positive";
      let targetId = null;
      if (
        myPolling < topOpponentPolling &&
        (aiPoliticianObject.attributes?.integrity || 5) >= 4 &&
        Math.random() < 0.4
      ) {
        adType = "attack";
        const opponents = currentElectionForAI.candidates
          .filter((c) => c.id !== aiPoliticianObject.id)
          .sort((a, b) => (b.polling || 0) - (a.polling || 0));
        if (opponents.length > 0) targetId = opponents[0].id;
        else adType = "positive";
      }
      availableActions.push({
        name: "launchManualAdBlitz",
        score,
        hours: adBlitzHoursChoice,
        params: { adType, targetId, spendAmount: adBlitzSpend },
      });
    }

    const recruitHoursChoice = getRandomInt(1, Math.min(3, hoursLeftForThisAI));
    if (
      currentVolunteers < adultPopulation * 0.002 &&
      hoursLeftForThisAI >= recruitHoursChoice &&
      currentElectionForAI.daysUntilElection > 15
    ) {
      let score = 1.0;
      if (currentVolunteers < 20) score += 1.5;
      availableActions.push({
        name: "recruitVolunteers",
        score,
        hours: recruitHoursChoice,
      });
    }

    if (availableActions.length === 0) {
      break;
    }

    availableActions.sort(
      (a, b) => b.score - a.score + (Math.random() * 0.1 - 0.05)
    );
    const chosenActionConfig = availableActions[0];

    if (chosenActionConfig.name === "launchManualAdBlitz") {
      storeActions.launchManualAdBlitz?.({
        ...chosenActionConfig.params,
        hoursSpent: chosenActionConfig.hours,
        politicianId: aiPoliticianObject.id,
      });
    } else {
      if (typeof storeActions[chosenActionConfig.name] === "function") {
        storeActions[chosenActionConfig.name](
          chosenActionConfig.hours,
          aiPoliticianObject.id
        );
      } else {
        console.warn(
          `[AI Campaign] Action ${chosenActionConfig.name} not found in storeActions.`
        );
      }
    }

    hoursLeftForThisAI -= chosenActionConfig.hours;
    actionsPerformedThisDay++;
  }
};
