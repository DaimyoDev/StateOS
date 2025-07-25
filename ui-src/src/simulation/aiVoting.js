// ui-src/src/utils/aiVoting.js
import { CITY_POLICIES } from "../data/policyDefinitions"; //
import { RATING_LEVELS } from "../data/governmentData"; //
import {
  calculateFiscalConservatismFactor,
  getServiceRatingDetails,
} from "../utils/aiUtils";

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
  // Boost for healthcare if coverage is low and policy is healthcare related
  if (cityStats.healthcareCoverage != null) {
    const isHealthcarePolicy =
      policyDef.tags?.includes("healthcare") || //
      policyDef.tags?.includes("public_health") || //
      policyDef.parameterDetails?.targetBudgetLine === "publicHealthServices"; //

    if (isHealthcarePolicy) {
      if (cityStats.healthcareCoverage < 40) score += 1.0; // Very low coverage
      else if (cityStats.healthcareCoverage < 60) score += 0.6; // Low coverage
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
  governmentOffices
) => {
  let score = 0;
  const playerPolitician = governmentOffices.find((o) => o.isPlayer);
  const playerPoliticianId = playerPolitician ? playerPolitician.id : null;

  if (proposal.proposerId === playerPoliticianId) {
    score += 0.05; // Slightly favor player's proposals for now
  }
  // TODO: Add more complex logic here involving AI's relationship with other politicians (allies/rivals)

  return score;
};

export const decideAIVote = (
  aiPolitician,
  proposal,
  cityStats,
  governmentOffices
) => {
  // Find the full policy definition
  const policyDef = CITY_POLICIES.find((p) => p.id === proposal.policyId); //
  if (!policyDef) {
    console.warn(
      `[AI Voting] Policy definition not found for ID: ${proposal.policyId}`
    );
    return "abstain";
  }

  let voteScore = 0;

  // 1. Ideological Alignment
  voteScore += voteScore +=
    calculateIdeologicalAlignmentScore(aiPolitician, policyDef, proposal) * 2.0; // High weight // High weight

  // 2. Policy Focus Alignment
  voteScore +=
    calculatePolicyFocusAlignmentScore(aiPolitician, policyDef) * 1.0; // Medium weight

  // 3. Addressing City Issues
  voteScore += calculateCityIssueAddressingScore(cityStats, policyDef) * 1.8; // High weight

  // 4. Financial Impact
  const financialState = getFinancialState(cityStats);
  voteScore +=
    calculateFinancialImpactScore(
      aiPolitician,
      policyDef,
      proposal.chosenParameters,
      cityStats,
      financialState
    ) * 1.5; // High weight

  // 5. Proposer Relationship (optional, currently minimal)
  voteScore +=
    calculateProposerRelationshipScore(
      aiPolitician,
      proposal,
      governmentOffices
    ) * 0.2; // Low weight

  // Add a small random factor to introduce variability
  voteScore += (Math.random() - 0.5) * 0.1; // -0.05 to +0.05

  // Decision thresholds
  const YEA_THRESHOLD = 0.8; // Policies with score above this will be voted 'yea'
  const NAY_THRESHOLD = -0.3; // Policies with score below this will be voted 'nay'

  if (voteScore >= YEA_THRESHOLD) {
    return "yea";
  } else if (voteScore <= NAY_THRESHOLD) {
    return "nay";
  } else {
    return "abstain";
  }
};
