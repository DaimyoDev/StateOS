// partyBillProposal.js
// Implements efficient party-based bill proposals for non-player cities based on party ideologies

import { POLICY_QUESTIONS } from '../data/policyData.js';

/**
 * Generate bill proposals based on party ideology and city needs for non-player cities
 * @param {Object} party - Party object with ideologyScores
 * @param {Object} cityStats - City statistics for context
 * @param {Array} allPolicyDefs - Available policy definitions
 * @param {Array} activeLegislation - Currently active legislation
 * @param {Array} proposedLegislation - Currently proposed legislation
 * @param {Object} currentDate - Current game date
 * @returns {Object|null} Bill proposal or null if no proposal needed
 */
export function generatePartyBillProposal(party, cityStats, allPolicyDefs, activeLegislation, proposedLegislation, currentDate) {
  try {
    // Check if party should propose legislation based on ideology and city needs
    if (!shouldPartyPropose(party, cityStats, activeLegislation, proposedLegislation)) {
      return null;
    }
    
    // Get viable policies for this party
    const viablePolicies = getViablePoliciesForParty(party, allPolicyDefs, activeLegislation, proposedLegislation);
    if (viablePolicies.length === 0) return null;
    
    // Score policies based on party priorities and city needs
    const scoredPolicies = scorePoliciesForParty(viablePolicies, party, cityStats);
    
    // Select policies for the bill
    const selectedPolicies = selectPoliciesForBill(scoredPolicies, party, cityStats);
    if (selectedPolicies.length === 0) return null;
    
    // Generate bill structure
    const bill = createPartyBill(selectedPolicies, party, cityStats, currentDate);
    
    return bill;
    
  } catch (error) {
    console.warn(`[PartyBillProposal] Error generating bill for ${party.name}:`, error);
    return null;
  }
}

/**
 * Determine if a party should propose legislation based on their ideology and city conditions
 */
function shouldPartyPropose(party, cityStats, activeLegislation, proposedLegislation) {
  // Base proposal probability based on party activity level
  let proposalChance = getPartyActivityLevel(party);
  
  // Increase chance based on city problems that align with party ideology
  proposalChance += assessCityProblemsAlignment(party, cityStats);
  
  // Decrease chance if there's already a lot of active legislation
  const legislationOverload = (activeLegislation.length + proposedLegislation.length) > 10;
  if (legislationOverload) {
    proposalChance *= 0.5;
  }
  
  // Random factor for variation
  return Math.random() < Math.min(0.8, proposalChance);
}

/**
 * Get base activity level for different party ideologies
 */
function getPartyActivityLevel(party) {
  const ideology = party.ideologyScores || {};
  
  // More interventionist parties propose more legislation
  const interventionScore = ideology.state_intervention_scope || 0;
  const progressiveScore = Math.abs(ideology.personal_liberty || 0);
  
  // Base activity: 5-15% chance per month
  let activity = 0.10;
  
  // Interventionist parties are more active
  activity += interventionScore * 0.05;
  
  // Parties with strong ideological positions are more active
  activity += progressiveScore * 0.03;
  
  // Economic extremes (both left and right) are more active
  const economicExtremism = Math.abs(ideology.economic || 0);
  activity += economicExtremism * 0.04;
  
  return Math.max(0.05, Math.min(0.25, activity));
}

/**
 * Assess how much city problems align with party priorities
 */
function assessCityProblemsAlignment(party, cityStats) {
  let alignmentBonus = 0;
  const ideology = party.ideologyScores || {};
  
  // Financial crisis - all parties care but differently
  const financialHealth = assessFinancialHealth(cityStats);
  if (financialHealth.hasCrisis) {
    alignmentBonus += 0.1; // Everyone proposes solutions during crisis
    
    // Conservatives focus on fiscal responsibility
    if (ideology.economic > 0.3) {
      alignmentBonus += 0.15;
    }
    // Liberals focus on maintaining services
    if (ideology.economic < -0.3) {
      alignmentBonus += 0.12;
    }
  }
  
  // Service quality issues
  const serviceIssues = assessServiceQuality(cityStats);
  Object.keys(serviceIssues).forEach(service => {
    const rating = serviceIssues[service];
    if (rating === 'Poor' || rating === 'Very Poor') {
      // Interventionist parties care more about service quality
      if (ideology.state_intervention_scope > 0.2) {
        alignmentBonus += 0.08;
      }
    }
  });
  
  // Economic issues align with economic ideology
  if (cityStats.unemploymentRate > 8) {
    if (ideology.economic < 0) {
      alignmentBonus += 0.12; // Left-wing parties prioritize employment
    }
  }
  
  // Social issues align with social positions
  if (cityStats.crimeRatePer1000 > 60) {
    // Both authoritarian and libertarian parties care but differently
    const authoritarianScore = -(ideology.personal_liberty || 0);
    if (authoritarianScore > 0.3) {
      alignmentBonus += 0.10; // Law and order parties
    }
  }
  
  return Math.min(0.3, alignmentBonus);
}

/**
 * Get policies that are viable for this party to propose
 */
function getViablePoliciesForParty(party, allPolicyDefs, activeLegislation, proposedLegislation) {
  // Get policies already being addressed
  const blockedPolicyIds = new Set();
  
  // Block policies that are already active
  activeLegislation.forEach(law => {
    if (law.policyId) blockedPolicyIds.add(law.policyId);
  });
  
  // Block policies in pending bills
  proposedLegislation.forEach(bill => {
    bill.policies?.forEach(policy => {
      if (policy.policyId) blockedPolicyIds.add(policy.policyId);
    });
  });
  
  // Filter to policies this party would consider
  return allPolicyDefs.filter(policy => {
    // Skip blocked policies
    if (blockedPolicyIds.has(policy.id)) return false;
    
    // Check if policy aligns with party ideology
    const alignment = calculatePolicyAlignment(policy, party);
    return alignment > -0.5; // Don't propose policies strongly opposed to party ideology
  });
}

/**
 * Calculate how well a policy aligns with party ideology
 */
function calculatePolicyAlignment(policy, party) {
  const ideology = party.ideologyScores || {};
  let alignment = 0;
  let factors = 0;
  
  // Check base support if available
  const partyIdeologyName = determineIdeologyName(ideology);
  if (policy.baseSupport && policy.baseSupport[partyIdeologyName] !== undefined) {
    alignment += policy.baseSupport[partyIdeologyName];
    factors++;
  }
  
  // Check policy tags alignment
  if (policy.tags && policy.tags.length > 0) {
    const tagAlignment = calculateTagAlignment(policy.tags, ideology);
    alignment += tagAlignment;
    factors++;
  }
  
  // Check fiscal impact alignment
  if (policy.cost && policy.cost.budget !== undefined) {
    const fiscalAlignment = calculateFiscalAlignment(policy.cost.budget, ideology);
    alignment += fiscalAlignment;
    factors++;
  }
  
  return factors > 0 ? alignment / factors : 0;
}

/**
 * Calculate alignment between policy tags and party ideology
 */
function calculateTagAlignment(tags, ideology) {
  let alignment = 0;
  const tagCount = tags.length;
  
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    
    // Economic tags
    if (tagLower.includes('tax') || tagLower.includes('fiscal')) {
      // Conservative parties like tax cuts, liberal parties like tax-funded programs
      if (tagLower.includes('cut') || tagLower.includes('reduction')) {
        alignment += (ideology.economic || 0) * 0.8;
      } else {
        alignment += -(ideology.economic || 0) * 0.6;
      }
    }
    
    // Social programs
    if (tagLower.includes('welfare') || tagLower.includes('social')) {
      alignment += -(ideology.economic || 0) * 0.7;
      alignment += (ideology.societal_focus || 0) * 0.5;
    }
    
    // Public safety
    if (tagLower.includes('safety') || tagLower.includes('police') || tagLower.includes('crime')) {
      alignment += -(ideology.personal_liberty || 0) * 0.6; // Authoritarian parties support
    }
    
    // Infrastructure and services
    if (tagLower.includes('infrastructure') || tagLower.includes('public') || tagLower.includes('service')) {
      alignment += (ideology.state_intervention_scope || 0) * 0.7;
    }
    
    // Environmental
    if (tagLower.includes('environment') || tagLower.includes('green') || tagLower.includes('climate')) {
      alignment += (ideology.societal_focus || 0) * 0.8;
      alignment += -(ideology.economic || 0) * 0.4; // Liberal parties more supportive
    }
  });
  
  return tagCount > 0 ? alignment / tagCount : 0;
}

/**
 * Calculate alignment between fiscal impact and party ideology
 */
function calculateFiscalAlignment(budgetCost, ideology) {
  const economicIdeology = ideology.economic || 0;
  
  if (budgetCost > 0) {
    // Spending policies - conservatives oppose, liberals support
    return -economicIdeology * 0.8;
  } else if (budgetCost < 0) {
    // Revenue/savings policies - conservatives support, liberals oppose
    return economicIdeology * 0.6;
  }
  
  return 0; // Neutral fiscal impact
}

/**
 * Score policies for party based on ideology and city needs
 */
function scorePoliciesForParty(policies, party, cityStats) {
  return policies.map(policy => {
    let score = 0;
    
    // Base ideological alignment
    score += calculatePolicyAlignment(policy, party) * 2.0;
    
    // City needs bonus
    score += calculateCityNeedsBonus(policy, cityStats);
    
    // Party priority areas bonus
    score += calculatePartyPriorityBonus(policy, party);
    
    // Add small random factor for variety
    score += (Math.random() - 0.5) * 0.5;
    
    return {
      ...policy,
      score: score
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Calculate bonus score based on city needs
 */
function calculateCityNeedsBonus(policy, cityStats) {
  let bonus = 0;
  
  // Financial crisis needs
  const financialHealth = assessFinancialHealth(cityStats);
  if (financialHealth.hasCrisis) {
    if (policy.tags?.includes('fiscal_responsibility') || 
        policy.tags?.includes('tax_increase') ||
        (policy.cost?.budget < 0)) {
      bonus += 1.5;
    } else if (policy.cost?.budget > 0) {
      bonus -= 1.0; // Penalize spending during financial crisis
    }
  }
  
  // Service quality needs
  if (policy.parameterDetails?.targetBudgetLine) {
    const serviceRating = getServiceRating(policy.parameterDetails.targetBudgetLine, cityStats);
    if (serviceRating === 'Poor' || serviceRating === 'Very Poor') {
      bonus += 1.2;
    } else if (serviceRating === 'Excellent') {
      bonus -= 0.5; // Don't over-invest in excellent services
    }
  }
  
  // Specific city issues
  if (cityStats.unemploymentRate > 8 && policy.tags?.includes('employment')) {
    bonus += 1.0;
  }
  
  if (cityStats.crimeRatePer1000 > 60 && policy.tags?.includes('public_safety')) {
    bonus += 1.0;
  }
  
  return bonus;
}

/**
 * Calculate bonus based on party priority areas
 */
function calculatePartyPriorityBonus(policy, party) {
  const ideology = party.ideologyScores || {};
  let bonus = 0;
  
  // Economic focus parties prioritize economic policies
  if (Math.abs(ideology.economic || 0) > 0.5) {
    if (policy.area === 'economic' || policy.tags?.includes('economic')) {
      bonus += 0.8;
    }
  }
  
  // Interventionist parties prioritize public services
  if ((ideology.state_intervention_scope || 0) > 0.4) {
    if (policy.tags?.includes('public_service') || policy.tags?.includes('infrastructure')) {
      bonus += 0.6;
    }
  }
  
  // Socially focused parties prioritize social policies
  if ((ideology.societal_focus || 0) > 0.4) {
    if (policy.area === 'social' || policy.tags?.includes('social')) {
      bonus += 0.7;
    }
  }
  
  return bonus;
}

/**
 * Select policies to include in the bill
 */
function selectPoliciesForBill(scoredPolicies, party, cityStats) {
  if (scoredPolicies.length === 0) return [];
  
  const selectedPolicies = [];
  const threshold = 1.0; // Minimum score to consider
  
  // Always include the top policy if it meets threshold
  if (scoredPolicies[0].score >= threshold) {
    selectedPolicies.push(scoredPolicies[0]);
    
    // Potentially add 1-2 more policies if they're good and thematically related
    const mainTheme = scoredPolicies[0].area;
    
    for (let i = 1; i < Math.min(3, scoredPolicies.length); i++) {
      const policy = scoredPolicies[i];
      
      // Must meet minimum threshold and either match theme or be high-scoring
      if (policy.score >= threshold * 0.75 && 
          (policy.area === mainTheme || policy.score >= threshold * 1.2)) {
        selectedPolicies.push(policy);
      }
    }
  }
  
  return selectedPolicies.slice(0, 3); // Max 3 policies per bill
}

/**
 * Create the final bill structure with parameters
 */
function createPartyBill(policies, party, cityStats, currentDate) {
  const billPolicies = policies.map(policy => {
    let chosenParameters = null;
    
    if (policy.isParameterized && policy.parameterDetails) {
      chosenParameters = selectPartyParameters(policy, party, cityStats);
    }
    
    return {
      policyId: policy.id,
      chosenParameters: chosenParameters
    };
  });
  
  return {
    policies: billPolicies,
    theme: policies[0].area,
    proposingPartyId: party.id,
    proposingPartyName: party.name,
    dateProposed: currentDate
  };
}

/**
 * Select parameters for policies based on party ideology
 */
function selectPartyParameters(policy, party, cityStats) {
  const pDetails = policy.parameterDetails;
  const ideology = party.ideologyScores || {};
  
  let targetValue;
  
  if (pDetails.targetBudgetLine) {
    // Budget allocation parameter
    targetValue = selectBudgetParameter(pDetails, party, cityStats, ideology);
  } else if (pDetails.targetTaxRate) {
    // Tax rate parameter  
    targetValue = selectTaxParameter(pDetails, party, cityStats, ideology);
  } else {
    // Generic parameter
    const range = pDetails.max - pDetails.min;
    const economicFactor = ideology.economic || 0;
    
    // Conservative parties prefer lower values, liberal parties prefer higher values
    const position = 0.5 + (-economicFactor * 0.3);
    targetValue = pDetails.min + (range * Math.max(0.1, Math.min(0.9, position)));
  }
  
  // Apply step and clamp
  if (pDetails.step) {
    targetValue = Math.round(targetValue / pDetails.step) * pDetails.step;
  }
  targetValue = Math.max(pDetails.min, Math.min(pDetails.max, targetValue));
  
  return { [pDetails.key || 'amount']: targetValue };
}

/**
 * Select budget allocation parameter
 */
function selectBudgetParameter(pDetails, party, cityStats, ideology) {
  const currentAllocation = cityStats.budget?.expenseAllocations?.[pDetails.targetBudgetLine] || 0;
  const serviceRating = getServiceRating(pDetails.targetBudgetLine, cityStats);
  const financialHealth = assessFinancialHealth(cityStats);
  
  // Base adjustment based on service quality and party ideology
  let adjustmentFactor = 0.5; // 50% = no change
  
  // Service quality influence
  if (serviceRating === 'Very Poor') adjustmentFactor += 0.3;
  else if (serviceRating === 'Poor') adjustmentFactor += 0.2;
  else if (serviceRating === 'Good') adjustmentFactor -= 0.1;
  else if (serviceRating === 'Excellent') adjustmentFactor -= 0.2;
  
  // Party ideology influence
  const interventionScore = ideology.state_intervention_scope || 0;
  const economicScore = ideology.economic || 0;
  
  // Interventionist parties increase spending more
  adjustmentFactor += interventionScore * 0.2;
  
  // Conservative parties are more cautious with spending
  adjustmentFactor -= economicScore * 0.15;
  
  // Financial constraints
  if (financialHealth.hasCrisis) {
    adjustmentFactor -= 0.3; // Cut spending during crisis
  } else if (financialHealth.hasSurplus) {
    adjustmentFactor += 0.2; // Increase spending with surplus
  }
  
  // Calculate target value
  const range = pDetails.max - pDetails.min;
  const targetValue = pDetails.min + (range * Math.max(0.1, Math.min(0.9, adjustmentFactor)));
  
  return targetValue;
}

/**
 * Select tax rate parameter
 */
function selectTaxParameter(pDetails, party, cityStats, ideology) {
  const financialHealth = assessFinancialHealth(cityStats);
  const economicScore = ideology.economic || 0;
  
  let adjustmentFactor = 0.5; // 50% = middle of range
  
  // Financial needs influence
  if (financialHealth.hasCrisis) {
    adjustmentFactor += 0.3; // Increase taxes during crisis
  } else if (financialHealth.hasSurplus) {
    adjustmentFactor -= 0.2; // Consider tax cuts with surplus
  }
  
  // Conservative parties prefer lower taxes
  adjustmentFactor -= economicScore * 0.25;
  
  // Liberal parties more willing to raise taxes
  if (economicScore < -0.3) {
    adjustmentFactor += 0.15;
  }
  
  const range = pDetails.max - pDetails.min;
  return pDetails.min + (range * Math.max(0.1, Math.min(0.9, adjustmentFactor)));
}

// Helper functions

function determineIdeologyName(ideologyScores) {
  // Simplified ideology determination - you may want to use existing logic
  const economic = ideologyScores.economic || 0;
  const liberty = ideologyScores.personal_liberty || 0;
  
  if (economic > 0.4 && liberty < -0.2) return 'Conservative';
  if (economic > 0.4 && liberty > 0.2) return 'Libertarian';
  if (economic < -0.4 && liberty > 0.2) return 'Liberal';
  if (economic < -0.4 && liberty < -0.2) return 'Socialist';
  return 'Centrist';
}

function assessFinancialHealth(cityStats) {
  const budget = cityStats.budget || {};
  const income = budget.totalAnnualIncome || budget.annualIncome || 1;
  const balance = budget.balance || 0;
  const debt = budget.accumulatedDebt || 0;
  
  const balanceRatio = balance / income;
  const debtRatio = debt / income;
  
  return {
    hasCrisis: balanceRatio < -0.12 || debtRatio > 1.2,
    hasStrain: balanceRatio < -0.075 || debtRatio > 0.85,
    hasSurplus: balanceRatio > 0.15 && debtRatio < 0.2
  };
}

function getServiceRating(budgetLine, cityStats) {
  // Map budget lines to city stats ratings
  const ratingMap = {
    'publicEducation': cityStats.educationQuality,
    'infrastructure': cityStats.infrastructureState,
    'publicHealthServices': cityStats.healthcareQuality,
    'policeDepartment': cityStats.publicSafetyRating,
    'cultureArts': cityStats.cultureArtsRating,
    'wasteManagement': cityStats.environmentRating
  };
  
  return ratingMap[budgetLine] || 'Average';
}

function assessServiceQuality(cityStats) {
  return {
    education: cityStats.educationQuality,
    infrastructure: cityStats.infrastructureState,
    healthcare: cityStats.healthcareQuality,
    publicSafety: cityStats.publicSafetyRating,
    culture: cityStats.cultureArtsRating,
    environment: cityStats.environmentRating
  };
}

// Expose for testing in development
if (process.env.NODE_ENV === 'development') {
  window.testPartyBillProposal = { generatePartyBillProposal, shouldPartyPropose };
}