// src/simulation/aiStrategicProposal.js
/**
 * Strategic AI bill proposal system that calculates pass/fail probability
 * before proposing bills and includes bill modification capabilities.
 */

import { decideAIVote } from './aiVoting.js';
import { decideAndAuthorAIBill, shouldAIProposeBasedOnNeeds } from './aiProposal.js';

/**
 * Calculates the probability that a bill will pass based on AI member voting patterns
 * @param {object} bill - The bill object with policies
 * @param {Array} councilMembers - All council members
 * @param {object} cityStats - Current city statistics
 * @param {Array} allPolicyDefs - All available policy definitions
 * @param {object} governmentOffices - Government structure
 * @returns {object} { passProb, supportCount, totalCount, supportingMembers, opposingMembers }
 */
export const calculateBillPassProbability = (bill, councilMembers, cityStats, allPolicyDefs, governmentOffices) => {
  if (!bill?.policies?.length || !councilMembers?.length) {
    return { passProb: 0, supportCount: 0, totalCount: 0, supportingMembers: [], opposingMembers: [] };
  }

  let supportCount = 0;
  let totalCount = 0;
  const supportingMembers = [];
  const opposingMembers = [];

  // Simulate voting for each council member
  councilMembers.forEach(member => {
    if (member.isPlayer) {
      // Skip player - we can't predict their vote
      return;
    }

    totalCount++;
    
    try {
      // Use existing AI voting logic to predict vote
      const vote = decideAIVote(
        member,
        bill,
        cityStats,
        allPolicyDefs,
        governmentOffices,
        councilMembers
      );

      if (vote === 'yea' || vote === 'YEA') {
        supportCount++;
        supportingMembers.push(member);
      } else {
        opposingMembers.push(member);
      }
    } catch (error) {
      console.warn(`Error predicting vote for ${member.firstName} ${member.lastName}:`, error);
      // Assume neutral/abstain for error cases
    }
  });

  const passProb = totalCount > 0 ? supportCount / totalCount : 0;
  
  return {
    passProb,
    supportCount,
    totalCount,
    supportingMembers,
    opposingMembers
  };
};

/**
 * Attempts to modify a bill to improve its chances of passing
 * @param {object} originalBill - The original bill
 * @param {object} voteAnalysis - Results from calculateBillPassProbability
 * @param {object} aiPolitician - The AI proposing the bill
 * @param {object} cityStats - Current city statistics
 * @param {Array} allPolicyDefs - All available policy definitions
 * @returns {object|null} Modified bill or null if no improvements possible
 */
export const attemptBillModification = (originalBill, voteAnalysis, aiPolitician, cityStats, allPolicyDefs) => {
  const { opposingMembers, supportingMembers } = voteAnalysis;
  
  if (opposingMembers.length === 0) {
    return originalBill; // Already has full support
  }

  // Analyze why members are opposing
  const oppositionReasons = analyzeOppositionReasons(originalBill, opposingMembers, cityStats, allPolicyDefs);
  
  // Try different modification strategies
  const modificationStrategies = [
    () => moderateParameterValues(originalBill, oppositionReasons, aiPolitician, cityStats, allPolicyDefs),
    () => removeControversialPolicies(originalBill, oppositionReasons, supportingMembers.length),
    () => addSweetenerPolicies(originalBill, opposingMembers, aiPolitician, cityStats, allPolicyDefs)
  ];

  for (const strategy of modificationStrategies) {
    const modifiedBill = strategy();
    if (modifiedBill && modifiedBill !== originalBill) {
      return modifiedBill;
    }
  }

  return null; // No successful modifications
};

/**
 * Analyzes why council members might oppose a bill
 */
const analyzeOppositionReasons = (bill, opposingMembers, cityStats, allPolicyDefs) => {
  const reasons = {
    fiscalConcerns: 0,
    ideologicalMismatch: 0,
    parameterTooExtreme: 0,
    serviceQualityDisagreement: 0
  };

  opposingMembers.forEach(member => {
    // Analyze each policy in the bill
    bill.policies.forEach(policyInBill => {
      const policyDef = allPolicyDefs.find(p => p.id === policyInBill.policyId);
      if (!policyDef) return;

      // Check fiscal conservatism conflicts
      if (policyDef.cost?.budget > 0 && member.calculatedIdeology?.includes('Conservative')) {
        reasons.fiscalConcerns++;
      }

      // Check ideological alignment
      const baseSupport = policyDef.baseSupport?.[member.calculatedIdeology] || 0;
      if (baseSupport < -0.5) {
        reasons.ideologicalMismatch++;
      }

      // Check parameter extremity
      if (policyInBill.chosenParameters && policyDef.parameterDetails) {
        const chosenValue = policyInBill.chosenParameters[policyDef.parameterDetails.key];
        const range = policyDef.parameterDetails.max - policyDef.parameterDetails.min;
        const normalizedValue = (chosenValue - policyDef.parameterDetails.min) / range;
        
        if (normalizedValue > 0.8 || normalizedValue < 0.2) {
          reasons.parameterTooExtreme++;
        }
      }
    });
  });

  return reasons;
};

/**
 * Moderates parameter values to be less extreme
 */
const moderateParameterValues = (bill, oppositionReasons, aiPolitician, cityStats, allPolicyDefs) => {
  if (oppositionReasons.parameterTooExtreme === 0) return null;

  const modifiedBill = JSON.parse(JSON.stringify(bill)); // Deep copy
  let hasChanges = false;

  modifiedBill.policies.forEach(policyInBill => {
    const policyDef = allPolicyDefs.find(p => p.id === policyInBill.policyId);
    if (!policyDef?.parameterDetails || !policyInBill.chosenParameters) return;

    const paramKey = policyDef.parameterDetails.key;
    const currentValue = policyInBill.chosenParameters[paramKey];
    const range = policyDef.parameterDetails.max - policyDef.parameterDetails.min;
    const normalizedValue = (currentValue - policyDef.parameterDetails.min) / range;

    // Move extreme values toward center
    if (normalizedValue > 0.8) {
      const newNormalizedValue = 0.6 + Math.random() * 0.15; // 60-75%
      policyInBill.chosenParameters[paramKey] = policyDef.parameterDetails.min + range * newNormalizedValue;
      hasChanges = true;
    } else if (normalizedValue < 0.2) {
      const newNormalizedValue = 0.25 + Math.random() * 0.15; // 25-40%
      policyInBill.chosenParameters[paramKey] = policyDef.parameterDetails.min + range * newNormalizedValue;
      hasChanges = true;
    }
  });

  return hasChanges ? modifiedBill : null;
};

/**
 * Removes the most controversial policies from a bill
 */
const removeControversialPolicies = (bill, oppositionReasons, supporterCount) => {
  if (bill.policies.length <= 1 || oppositionReasons.ideologicalMismatch === 0) return null;

  // Only remove policies if we have multiple policies and strong support for the main one
  if (supporterCount < 2) return null;

  const modifiedBill = JSON.parse(JSON.stringify(bill));
  
  // Remove the last policy (usually the least important)
  modifiedBill.policies = modifiedBill.policies.slice(0, -1);
  
  return modifiedBill;
};

/**
 * Attempts to add small "sweetener" policies that might win over opponents
 */
const addSweetenerPolicies = (bill, opposingMembers, aiPolitician, cityStats, allPolicyDefs) => {
  // This is a simplified implementation - in practice, you'd want more sophisticated logic
  // to find policies that appeal to the opposition without undermining the main bill
  return null; // Not implemented in this version
};

/**
 * Determines if an AI should propose a bill based on strategic considerations
 * @param {object} aiPolitician - The AI politician
 * @param {Array} availablePolicyIds - Available policy IDs
 * @param {object} cityStats - Current city statistics
 * @param {Array} activeLegislation - Currently active legislation
 * @param {Array} proposedLegislation - Currently proposed legislation
 * @param {Array} allPolicyDefs - All policy definitions
 * @param {Array} failedBillsHistory - History of failed bills
 * @param {object} currentDate - Current game date
 * @param {Array} councilMembers - All council members
 * @param {object} governmentOffices - Government structure
 * @returns {object|null} Bill to propose or null
 */
export const strategicAIBillProposal = (
  aiPolitician,
  availablePolicyIds,
  cityStats,
  activeLegislation,
  proposedLegislation,
  allPolicyDefs,
  failedBillsHistory,
  currentDate,
  councilMembers,
  governmentOffices
) => {
  // First check if AI should propose based on needs
  
  const shouldPropose = shouldAIProposeBasedOnNeeds(
    aiPolitician,
    availablePolicyIds,
    cityStats,
    activeLegislation,
    proposedLegislation,
    allPolicyDefs,
    failedBillsHistory,
    currentDate
  );


  if (!shouldPropose) {
    return null; // No urgent need to propose
  }

  // Generate initial bill
  const initialBill = decideAndAuthorAIBill(
    aiPolitician,
    availablePolicyIds,
    cityStats,
    activeLegislation,
    proposedLegislation,
    allPolicyDefs
  );

  if (!initialBill?.policies?.length) {
    return null; // Couldn't create a bill
  }

  // Create a proper bill object for analysis
  const billForAnalysis = {
    id: `temp_${Date.now()}`,
    name: `Temp Bill`,
    proposerId: aiPolitician.id,
    proposerName: `${aiPolitician.firstName} ${aiPolitician.lastName}`,
    policies: initialBill.policies,
    dateProposed: currentDate,
    status: 'proposed'
  };

  // Calculate pass probability
  const voteAnalysis = calculateBillPassProbability(
    billForAnalysis,
    councilMembers,
    cityStats,
    allPolicyDefs,
    governmentOffices
  );

  const { passProb } = voteAnalysis;

  // Decision logic based on pass probability
  if (passProb >= 0.6) {
    // High chance of passing - propose it
    return initialBill;
  } else if (passProb >= 0.4) {
    // Moderate chance - try to modify the bill
    const modifiedBill = attemptBillModification(
      billForAnalysis,
      voteAnalysis,
      aiPolitician,
      cityStats,
      allPolicyDefs
    );

    if (modifiedBill) {
      // Recalculate probability for modified bill
      const newAnalysis = calculateBillPassProbability(
        modifiedBill,
        councilMembers,
        cityStats,
        allPolicyDefs,
        governmentOffices
      );

      if (newAnalysis.passProb > passProb) {
        // Modified bill is better - return it
        return {
          policies: modifiedBill.policies,
          theme: initialBill.theme
        };
      }
    }

    // 25% chance to propose anyway if close to passing
    if (Math.random() < 0.25) {
      return initialBill;
    }
  } else if (passProb >= 0.25) {
    // Low but not hopeless chance - 25% chance to propose if very urgent
    const isUrgent = cityStats.budget?.balance < 0 || 
                    Object.values(cityStats.services || {}).some(s => s.rating === 'F');
    
    if (isUrgent && Math.random() < 0.25) {
      return initialBill;
    }
  }

  // Too low chance of passing - don't propose
  return null;
};
