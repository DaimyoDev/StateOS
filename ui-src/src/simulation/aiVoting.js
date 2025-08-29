// ui-src/src/utils/aiVoting.js
import { RATING_LEVELS } from "../data/governmentData"; //
import { calculateFiscalConservatismFactor } from "./aiProposal";
import { getServiceRatingDetails } from "../utils/aiUtils";

// Helper function to determine the financial state, reused from aiUtils logic
const getFinancialState = (cityStats) => {
  const cityIncome =
    cityStats.budget.totalAnnualIncome || cityStats.budget.annualIncome || 1; //
  const cityBalance = cityStats.budget.balance || 0; //
  const cityDebt = cityStats.budget.accumulatedDebt || 0; //
  const balanceToIncomeRatio = cityBalance / cityIncome; //
  const debtToIncomeRatio = cityDebt / cityIncome; //

  return {
    hasLargeSurplus: balanceToIncomeRatio > 0.15 && debtToIncomeRatio < 0.2, //
    isComfortableFinancially:
      balanceToIncomeRatio > 0.05 && debtToIncomeRatio < 0.4, //
    hasSignificantDeficit: balanceToIncomeRatio < -0.075, //
    hasHighDebt: debtToIncomeRatio > 0.85, //
    hasDireFinances: balanceToIncomeRatio < -0.12 || debtToIncomeRatio > 1.2, //
    isStrainedFinances:
      (balanceToIncomeRatio < -0.075 || debtToIncomeRatio > 0.85) &&
      !(balanceToIncomeRatio < -0.12 || debtToIncomeRatio > 1.2), //
  };
};

const calculateIdeologicalAlignmentScore = (
  aiPolitician,
  policyDef,
  proposal
) => {
  let totalScore = 0;
  const { stances } = aiPolitician;
  const { isParameterized, parameterDetails, relevantPolicyQuestions } =
    policyDef;

  // Exit if there's nothing to check against
  if (!stances || !relevantPolicyQuestions) {
    return 0;
  }

  // --- LOGIC FOR PARAMETERIZED POLICIES ---
  if (isParameterized && parameterDetails && proposal.chosenParameters) {
    const chosenValue = proposal.chosenParameters[parameterDetails.key];
    const isIncrease = chosenValue > 0;
    const isDecrease = chosenValue < 0;

    // If there's no change, there's no ideological impact from the parameter
    if (chosenValue === 0) return 0;

    // Iterate through each relevant question for this policy
    relevantPolicyQuestions.forEach((question) => {
      const { questionId, alignsWithOptionValues, opposesOptionValues } =
        question;
      const aiStance = stances[questionId];

      if (!aiStance) return; // AI doesn't have a stance on this specific question

      // --- If the player/AI chose to INCREASE the budget ---
      if (isIncrease) {
        // AI's stance aligns with the policy's pro-funding values
        if (
          alignsWithOptionValues &&
          alignsWithOptionValues.includes(aiStance)
        ) {
          totalScore += 2.0; // Strong support
        }
        // AI's stance aligns with the policy's anti-funding values
        if (opposesOptionValues && opposesOptionValues.includes(aiStance)) {
          totalScore -= 2.5; // Strong opposition
        }
      }
      // --- If the player/AI chose to DECREASE the budget ---
      else if (isDecrease) {
        // The logic is INVERTED
        // AI's pro-funding stance means it OPPOSES this cut
        if (
          alignsWithOptionValues &&
          alignsWithOptionValues.includes(aiStance)
        ) {
          totalScore -= 2.5; // Strong opposition to the cut
        }
        // AI's anti-funding stance means it SUPPORTS this cut
        if (opposesOptionValues && opposesOptionValues.includes(aiStance)) {
          totalScore += 2.0; // Strong support for the cut
        }
      }
    });
  }
  // --- LOGIC FOR NON-PARAMETERIZED POLICIES ---
  else if (!isParameterized) {
    relevantPolicyQuestions.forEach((question) => {
      const { questionId, alignsWithOptionValues, opposesOptionValues } =
        question;
      const aiStance = stances[questionId];

      if (!aiStance) return;

      if (alignsWithOptionValues && alignsWithOptionValues.includes(aiStance)) {
        totalScore += 2.0; // Support
      }
      if (opposesOptionValues && opposesOptionValues.includes(aiStance)) {
        totalScore -= 2.5; // Opposition
      }
    });
  }

  return totalScore;
};

const calculatePolicyFocusAlignmentScore = (aiPolitician, policyDef) => {
  let score = 0;
  if (aiPolitician.policyFocus && policyDef.tags) {
    //
    if (
      policyDef.tags.some(
        (tag) =>
          aiPolitician.policyFocus.toLowerCase().includes(tag) ||
          tag.toLowerCase().includes(aiPolitician.policyFocus.toLowerCase())
      )
    ) {
      score += 0.3; // Moderate boost for focus area policies
    }
  }
  return score;
};

const calculateCityIssueAddressingScore = (cityStats, policyDef) => {
  let score = 0;
  if (cityStats.mainIssues && policyDef.tags) {
    //
    cityStats.mainIssues.forEach((issue) => {
      if (
        policyDef.tags.some(
          (tag) =>
            issue.toLowerCase().includes(tag) ||
            tag.toLowerCase().includes(issue.toLowerCase())
        )
      ) {
        score += 0.5; // Significant boost for addressing main issues
      }
    });
  }

  // Specific boosts for critical service levels for budget policies
  if (
    policyDef.isParameterized &&
    policyDef.parameterDetails?.targetBudgetLine
  ) {
    //
    const serviceInfo = getServiceRatingDetails(
      //
      policyDef.parameterDetails.targetBudgetLine, //
      cityStats,
      RATING_LEVELS //
    );
    if (serviceInfo.isValid) {
      //
      if (serviceInfo.ratingIndex === 0) score += 0.7; // "Very Poor" service
      else if (serviceInfo.ratingIndex === 1) score += 0.4; // "Poor" service
    }
  }
  const { crimeRatePer1000, povertyRate } = cityStats;
  const pDetails = policyDef.parameterDetails;

  const isPolicePolicy =
    policyDef.tags?.includes("public_safety") ||
    pDetails?.targetBudgetLine === "policeDepartment";
  if (isPolicePolicy && crimeRatePer1000 > 55) {
    score += 0.8;
  } else if (isPolicePolicy && crimeRatePer1000 > 40) {
    score += 0.5;
  }

  const isWelfarePolicy =
    policyDef.tags?.includes("social_welfare") ||
    pDetails?.targetBudgetLine === "socialWelfarePrograms";
  if (isWelfarePolicy && povertyRate > 25) {
    score += 0.8;
  } else if (isWelfarePolicy && povertyRate > 18) {
    score += 0.5;
  }
  // Boost for healthcare if coverage is low and policy is healthcare related
  if (cityStats.healthcareCoverage != null) {
    const isHealthcarePolicy =
      policyDef.tags?.includes("healthcare") || //
      policyDef.tags?.includes("public_health") || //
      policyDef.parameterDetails?.targetBudgetLine === "publicHealthServices"; //

    if (isHealthcarePolicy) {
      if (cityStats.healthcareCoverage >= 100) {
        score -= 1.5; // Oppose more healthcare spending at 100% coverage
      } else if (cityStats.healthcareCoverage >= 90) {
        score -= 0.5; // Slight opposition at very high coverage
      } else if (cityStats.healthcareCoverage < 40) {
        score += 1.0; // Very low coverage
      } else if (cityStats.healthcareCoverage < 60) {
        score += 0.6; // Low coverage
      }
    }
  }

  return score;
};

const calculateFinancialImpactScore = (
  aiPolitician,
  policyDef,
  chosenParameters,
  cityStats,
  financialState
) => {
  let score = 0;
  const { hasDireFinances, isStrainedFinances, hasLargeSurplus } =
    financialState; //
  const cityIncome = cityStats.budget.totalAnnualIncome || 1; //

  const fiscalConservatismFactor = calculateFiscalConservatismFactor(
    aiPolitician,
    financialState
  ); //

  // Score based on direct cost/revenue from the policy definition
  if (policyDef.cost?.budget > 0) {
    // Policy has a direct cost
    const costRatio = policyDef.cost.budget / cityIncome;
    if (hasDireFinances || isStrainedFinances) {
      //
      score -= costRatio * 10; // Penalize heavy spending in bad times
    } else if (hasLargeSurplus) {
      //
      score += costRatio * 5; // Encourage spending in good times
    }
  } else if (policyDef.cost?.budget < 0) {
    // Policy generates revenue (negative cost)
    const revenueRatio = Math.abs(policyDef.cost.budget) / cityIncome;
    if (hasDireFinances || isStrainedFinances) {
      //
      score += revenueRatio * 10; // Strongly favor revenue generation
    } else if (hasLargeSurplus) {
      //
      score -= revenueRatio * 5; // Less favorable to cuts if surplus
    }
  }

  // Score based on parameterized adjustments (budget and tax)
  if (
    policyDef.isParameterized &&
    policyDef.parameterDetails &&
    chosenParameters
  ) {
    //
    const pDetails = policyDef.parameterDetails; //
    const chosenValue = chosenParameters[pDetails.key || "amount"];

    if (pDetails.targetBudgetLine) {
      //
      const isIncrease = chosenValue > 0;
      const isDecrease = chosenValue < 0;

      if (isIncrease) {
        if (hasDireFinances || isStrainedFinances)
          score -= 1.0; // // Generally oppose increases
        else if (hasLargeSurplus) score += 1.0; // // Favor increases
      } else if (isDecrease) {
        if (hasDireFinances || isStrainedFinances)
          score += 1.0; // // Favor cuts
        else if (hasLargeSurplus) score -= 1.0; // // Oppose cuts
      }

      // Influence by fiscal conservatism
      score += (isDecrease ? 1 : -1) * fiscalConservatismFactor * 0.5;
    } else if (pDetails.targetTaxRate) {
      //
      const isIncrease = chosenValue > 0;
      const isDecrease = chosenValue < 0;

      if (isIncrease) {
        if (hasDireFinances || isStrainedFinances)
          score += 1.5; // // Favor tax increases in bad times
        else if (hasLargeSurplus) score -= 1.0; // // Oppose tax increases in good times
      } else if (isDecrease) {
        if (hasDireFinances || isStrainedFinances)
          score -= 1.5; // // Oppose tax cuts in bad times
        else if (hasLargeSurplus) score += 1.0; // // Favor tax cuts in good times
      }
      // Influence by fiscal conservatism
      score += (isDecrease ? 1 : -1) * fiscalConservatismFactor * 0.7;
    }
  }

  // Check for positive income effects from policy.effects array directly
  const hasPositiveIncomeEffect = policyDef.effects?.some(
    (e) =>
      e.targetStat?.includes("budget.annualIncome") &&
      (e.change > 0 || e.changeFormula) //
  );
  if (hasPositiveIncomeEffect) {
    if (hasDireFinances || isStrainedFinances) score += 0.8; //
    else if (hasLargeSurplus) score -= 0.2; // // Less critical if already in surplus
  }

  return score;
};

// As requested, this remains a simple placeholder for now.
const calculateProposerRelationshipScore = (
  aiPolitician,
  proposal,
  governmentOfficesStructure
) => {
  let score = 0;
  
  // Helper function to flatten hierarchical government offices structure
  const flattenGovernmentOffices = (hierarchicalStructure) => {
    if (!hierarchicalStructure) return [];
    const flattened = [];
    
    // Add national offices
    if (hierarchicalStructure.national) {
      if (hierarchicalStructure.national.executive) flattened.push(...hierarchicalStructure.national.executive);
      if (hierarchicalStructure.national.legislative?.lowerHouse) flattened.push(...hierarchicalStructure.national.legislative.lowerHouse);
      if (hierarchicalStructure.national.legislative?.upperHouse) flattened.push(...hierarchicalStructure.national.legislative.upperHouse);
      if (hierarchicalStructure.national.judicial) flattened.push(...hierarchicalStructure.national.judicial);
    }
    
    // Add state offices
    if (hierarchicalStructure.states) {
      Object.values(hierarchicalStructure.states).forEach(state => {
        if (state.executive) flattened.push(...state.executive);
        if (state.legislative?.lowerHouse) flattened.push(...state.legislative.lowerHouse);
        if (state.legislative?.upperHouse) flattened.push(...state.legislative.upperHouse);
        if (state.judicial) flattened.push(...state.judicial);
      });
    }
    
    // Add city offices
    if (hierarchicalStructure.cities) {
      Object.values(hierarchicalStructure.cities).forEach(city => {
        if (city.executive) flattened.push(...city.executive);
        if (city.legislative) flattened.push(...city.legislative);
        if (city.judicial) flattened.push(...city.judicial);
      });
    }
    
    return flattened.filter(Boolean);
  };

  // Handle both hierarchical structure and flat array
  let allGovernmentOffices;
  if (Array.isArray(governmentOfficesStructure)) {
    allGovernmentOffices = governmentOfficesStructure;
  } else {
    allGovernmentOffices = flattenGovernmentOffices(governmentOfficesStructure);
  }
  
  const playerOffice = allGovernmentOffices.find((o) => o.holder?.isPlayer);
  const playerPoliticianId = playerOffice?.holder?.id || null;

  if (proposal.proposerId === playerPoliticianId) {
    score += 0.05; // Slightly favor player's proposals for now
  }
  // TODO: Add more complex logic here involving AI's relationship with other politicians (allies/rivals)

  return score;
};

export function decideAIVote(
  aiPolitician,
  bill,
  cityStats,
  activeLegislation,
  proposedBills,
  governmentOfficesStructure,
  allPolicyDefsForLevel
) {
  
  // Handle null governmentOfficesStructure parameter
  if (governmentOfficesStructure === null || governmentOfficesStructure === undefined) {
    console.log(`[decideAIVote Debug] Government offices is null, using empty structure`);
    governmentOfficesStructure = {};
  }
  
  if (!bill || !bill.policies || bill.policies.length === 0) {
    console.warn(`[AI Voting] Bill object is invalid or has no policies.`);
    return "abstain";
  }

  let totalVoteScore = 0;
  const financialState = getFinancialState(cityStats);

  // Iterate over each policy within the bill and aggregate the scores
  for (const policyInBill of bill.policies) {
    let policyDef;
    
    // For parameterized policies (ending with '_parameterized'), the policy object itself contains the definition
    if (policyInBill.policyId && policyInBill.policyId.endsWith('_parameterized')) {
      policyDef = policyInBill; // The policy object IS the definition for parameterized policies
    } else {
      // For standard policies, look them up in the global list
      policyDef = allPolicyDefsForLevel[policyInBill.policyId];
    }

    if (!policyDef) {
      console.warn(
        `[AI Voting] Policy definition not found for ID: ${policyInBill.policyId} within bill "${bill.name}"`
      );
      continue; // Skip this policy and move to the next one
    }

    let policyScore = 0;
    // 1. Ideological Alignment
    policyScore +=
      calculateIdeologicalAlignmentScore(
        aiPolitician,
        policyDef,
        policyInBill
      ) * 2.0;
    // 2. Policy Focus
    policyScore +=
      calculatePolicyFocusAlignmentScore(aiPolitician, policyDef) * 1.0;
    // 3. City Issues
    policyScore +=
      calculateCityIssueAddressingScore(cityStats, policyDef) * 1.8;
    // 4. Financial Impact
    policyScore +=
      calculateFinancialImpactScore(
        aiPolitician,
        policyDef,
        policyInBill.chosenParameters,
        cityStats,
        financialState
      ) * 1.5;

    totalVoteScore += policyScore;
  }

  // 5. Proposer Relationship (calculated once for the whole bill)
  totalVoteScore +=
    calculateProposerRelationshipScore(aiPolitician, bill, governmentOfficesStructure) *
    0.2;

  // Add individual variability to each politician's decision-making
  const personalVariability = (Math.random() - 0.5) * 0.8; // Larger random factor
  const ideologicalConsistency = Math.random() * 0.3; // Some politicians are more consistent
  totalVoteScore += personalVariability + ideologicalConsistency;

  // More realistic thresholds that create divisions
  const BASE_YEA_THRESHOLD = 0.3; // Lower threshold for more yea votes
  const BASE_NAY_THRESHOLD = -0.3; // Higher threshold for more nay votes
  
  // Add some politician-specific bias
  const politicianBias = (Math.random() - 0.5) * 0.4;
  const YEA_THRESHOLD = BASE_YEA_THRESHOLD + politicianBias;
  const NAY_THRESHOLD = BASE_NAY_THRESHOLD + politicianBias;

  if (totalVoteScore >= YEA_THRESHOLD) {
    return "yea";
  } else if (totalVoteScore <= NAY_THRESHOLD) {
    return "nay";
  } else {
    // Reduce abstentions by making some borderline cases lean toward a decision
    if (Math.random() < 0.6) { // 60% chance to pick a side instead of abstaining
      return totalVoteScore > 0 ? "yea" : "nay";
    }
    return "abstain";
  }
};
