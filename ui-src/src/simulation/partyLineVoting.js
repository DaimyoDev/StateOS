// partyLineVoting.js
// Implements efficient party-line voting for non-player cities based on party stances

import { POLICY_QUESTIONS } from '../data/policyData.js';

/**
 * Calculate party-line vote based on party stances and bill content
 * @param {Object} party - Party object with ideologyScores
 * @param {Object} bill - Bill to vote on
 * @param {Object} cityStats - City statistics for context
 * @param {Object} options - Additional options
 * @returns {string} Vote choice: 'yea', 'nay', or 'abstain'
 */
export function calculatePartyLineVote(party, bill, cityStats = {}, options = {}) {
  try {
    // Get party's policy stances (cached if available)
    const partyStances = getPartyPolicyStances(party);
    
    // Calculate base support score for the bill
    let supportScore = calculateBillSupport(bill, partyStances, party.ideologyScores);
    
    // Apply contextual modifiers based on city characteristics
    supportScore = applyContextualModifiers(supportScore, bill, cityStats, party.ideologyScores);
    
    // Apply party discipline (parties vote more cohesively than individuals)
    supportScore = applyPartyDiscipline(supportScore, party);
    
    // Convert support score to vote decision
    return convertScoreToVote(supportScore, options);
    
  } catch (error) {
    console.warn(`[PartyLineVoting] Error calculating party vote for ${party.name}:`, error);
    return 'abstain'; // Default to abstain on error
  }
}

/**
 * Get or generate policy stances for a party based on ideology
 */
function getPartyPolicyStances(party) {
  // Check if party already has pre-calculated stances
  if (party.policyStances) {
    return party.policyStances;
  }
  
  // Generate stances from ideology scores
  const stances = {};
  const ideology = party.ideologyScores || {};
  
  POLICY_QUESTIONS.forEach(question => {
    if (!question.options || question.options.length === 0) {
      stances[question.id] = 50; // Neutral
      return;
    }
    
    // Find option that best aligns with party ideology
    let bestAlignment = -Infinity;
    let bestStance = 50;
    
    question.options.forEach(option => {
      const effects = option.ideologyEffect;
      if (!effects) return;
      
      let alignment = 0;
      let dimensions = 0;
      
      // Calculate ideological alignment
      Object.keys(ideology).forEach(dimension => {
        if (effects[dimension] !== undefined) {
          alignment += effects[dimension] * ideology[dimension];
          dimensions++;
        }
      });
      
      if (dimensions > 0) {
        alignment /= dimensions;
        if (alignment > bestAlignment) {
          bestAlignment = alignment;
          bestStance = 50 + (alignment * 25); // Scale to 0-100 range
        }
      }
    });
    
    stances[question.id] = Math.max(0, Math.min(100, bestStance));
  });
  
  return stances;
}

/**
 * Calculate how much the party supports the bill based on policy alignment
 */
function calculateBillSupport(bill, partyStances, partyIdeology) {
  let totalSupport = 0;
  let factors = 0;
  
  // Check if bill has specific policy impacts we can evaluate
  if (bill.policyImpacts) {
    Object.entries(bill.policyImpacts).forEach(([policyId, impact]) => {
      const partyStance = partyStances[policyId];
      if (partyStance !== undefined) {
        // Positive impact on policies party supports = more support
        // Negative impact on policies party opposes = more support  
        const alignment = (partyStance - 50) / 50; // Convert to -1 to 1 scale
        totalSupport += impact * alignment;
        factors++;
      }
    });
  }
  
  // Fallback: evaluate based on bill category and party ideology
  if (factors === 0) {
    totalSupport = evaluateBillByCategory(bill, partyIdeology);
    factors = 1;
  }
  
  return factors > 0 ? totalSupport / factors : 0;
}

/**
 * Evaluate bill support based on category and party ideology
 */
function evaluateBillByCategory(bill, ideology) {
  const category = bill.category || 'general';
  let support = 0;
  
  switch (category.toLowerCase()) {
    case 'economic':
    case 'budget':
    case 'taxation':
      // Economic conservatives oppose spending, liberals support it
      if (bill.budgetaryImpact) {
        const economicStance = ideology.economic || 0;
        if (bill.budgetaryImpact > 0) {
          // Spending bill - liberals support, conservatives oppose
          support = -economicStance * 0.8;
        } else {
          // Tax cut/reduction bill - conservatives support, liberals may oppose
          support = economicStance * 0.6;
        }
      }
      break;
      
    case 'social':
    case 'civil_rights':
      // Progressive parties support social reform, conservative parties oppose
      const socialStance = ideology.personal_liberty || 0;
      support = socialStance * 0.7;
      break;
      
    case 'environment':
    case 'climate':
      // Generally supported by liberal parties, mixed by conservatives
      const envSupport = (ideology.societal_focus || 0) * 0.6 + (ideology.state_intervention_scope || 0) * 0.3;
      support = envSupport;
      break;
      
    case 'public_safety':
    case 'law_enforcement':
      // Conservative parties generally support, liberal parties more cautious
      support = -(ideology.personal_liberty || 0) * 0.5 + (ideology.state_intervention_scope || 0) * 0.4;
      break;
      
    case 'infrastructure':
    case 'transportation':
      // Generally bipartisan but state intervention parties support more
      support = (ideology.state_intervention_scope || 0) * 0.5 + 0.2; // Base support
      break;
      
    default:
      // Neutral on unknown categories
      support = 0;
  }
  
  return support;
}

/**
 * Apply comprehensive city metric modifiers to party voting
 */
function applyContextualModifiers(baseSupport, bill, cityStats, partyIdeology) {
  let modifiedSupport = baseSupport;
  
  // === FINANCIAL CRISIS RESPONSE ===
  const financialHealth = assessCityFinancialHealth(cityStats);
  if (financialHealth.inCrisis) {
    // All parties respond to financial crisis, but differently
    if (bill.budgetaryImpact > 0) {
      // Spending bills - conservatives oppose more, liberals less
      const economicIdeology = partyIdeology.economic || 0;
      modifiedSupport -= 0.4 + (economicIdeology * 0.3); // -0.1 to -0.7 range
    } else if (bill.budgetaryImpact < 0) {
      // Revenue bills - all parties support during crisis
      modifiedSupport += 0.5;
    }
  } else if (financialHealth.hasLargeSurplus) {
    // Surplus conditions - liberal parties more willing to spend
    if (bill.budgetaryImpact > 0) {
      const economicIdeology = partyIdeology.economic || 0;
      modifiedSupport += 0.3 - (economicIdeology * 0.25); // +0.05 to +0.55 range
    }
  }
  
  // === UNEMPLOYMENT CRISIS ===
  if (cityStats.unemploymentRate > 8) {
    const severity = Math.min((cityStats.unemploymentRate - 8) / 4, 1); // 0-1 scale
    
    if (bill.category === 'economic' || bill.tags?.includes('employment')) {
      // All parties support job programs during unemployment crisis
      modifiedSupport += 0.2 + (severity * 0.3);
    } else if (bill.budgetaryImpact > 0 && bill.category === 'social') {
      // Social spending gets mixed support - depends on ideology
      const socialIdeology = -(partyIdeology.economic || 0); // Flip economic to social
      modifiedSupport += socialIdeology * 0.2 * severity;
    }
  }
  
  // === CRIME CRISIS ===
  if (cityStats.crimeRatePer1000 > 60) {
    const severity = Math.min((cityStats.crimeRatePer1000 - 60) / 40, 1);
    
    if (bill.category === 'public_safety' || bill.tags?.includes('police')) {
      // Authoritarian parties strongly support, libertarian parties less so
      const authoritarianScore = -(partyIdeology.personal_liberty || 0);
      modifiedSupport += 0.3 + (authoritarianScore * 0.4) + (severity * 0.2);
    }
  }
  
  // === SERVICE QUALITY DEGRADATION ===
  const serviceIssues = assessServiceQuality(cityStats);
  Object.entries(serviceIssues).forEach(([service, rating]) => {
    if (rating === 'Poor' || rating === 'Very Poor') {
      const severityBonus = rating === 'Very Poor' ? 0.4 : 0.2;
      
      // Check if bill addresses this service
      if (bill.parameterDetails?.targetBudgetLine === getServiceBudgetLine(service)) {
        // Interventionist parties more likely to support service improvements
        const interventionScore = partyIdeology.state_intervention_scope || 0;
        modifiedSupport += severityBonus + (interventionScore * 0.3);
      }
    }
  });
  
  // === POPULATION SIZE EFFECTS ===
  const populationFactor = getPopulationFactor(cityStats.population);
  
  // Large cities: more support for urban programs
  if (populationFactor.isLarge && (bill.category === 'infrastructure' || bill.category === 'social')) {
    modifiedSupport += 0.15;
  }
  
  // Small cities: more fiscal caution
  if (populationFactor.isSmall && bill.budgetaryImpact > 0) {
    modifiedSupport -= 0.1;
  }
  
  // === ECONOMIC GROWTH TRAJECTORY ===
  const economicTrend = parseEconomicOutlook(cityStats.economicOutlook);
  if (economicTrend < -0.3) { // Recession/decline
    // All parties become more conservative during economic decline
    if (bill.budgetaryImpact > 0) {
      modifiedSupport -= 0.25;
    }
  } else if (economicTrend > 0.3) { // Booming economy
    // Growing economy increases appetite for investment
    if (bill.category === 'infrastructure' || bill.category === 'education') {
      modifiedSupport += 0.2;
    }
  }
  
  // === IDEOLOGICAL PRESSURE UNDER STRESS ===
  // Extreme conditions make parties more ideologically rigid
  const cityStressLevel = calculateCityStressLevel(cityStats);
  if (cityStressLevel > 0.7) {
    // High stress amplifies ideological positions
    const ideologicalIntensity = Math.abs(partyIdeology.economic || 0) * 0.3;
    if (baseSupport > 0) {
      modifiedSupport += ideologicalIntensity; // Stronger support
    } else if (baseSupport < 0) {
      modifiedSupport -= ideologicalIntensity; // Stronger opposition
    }
  }
  
  return modifiedSupport;
}

/**
 * Assess city's financial health with more nuanced categories
 */
function assessCityFinancialHealth(cityStats) {
  const budget = cityStats.budget || {};
  const income = budget.totalAnnualIncome || budget.annualIncome || 1;
  const balance = budget.balance || 0;
  const debt = budget.accumulatedDebt || 0;
  
  const balanceRatio = balance / income;
  const debtRatio = debt / income;
  
  return {
    inCrisis: balanceRatio < -0.15 || debtRatio > 1.5,
    isStrained: balanceRatio < -0.08 || debtRatio > 0.9,
    hasLargeSurplus: balanceRatio > 0.2 && debtRatio < 0.3,
    isHealthy: balanceRatio > 0 && debtRatio < 0.6
  };
}

/**
 * Calculate overall city stress level from multiple metrics
 */
function calculateCityStressLevel(cityStats) {
  let stressFactors = 0;
  let totalFactors = 0;
  
  // Financial stress
  const financialHealth = assessCityFinancialHealth(cityStats);
  if (financialHealth.inCrisis) stressFactors += 0.3;
  else if (financialHealth.isStrained) stressFactors += 0.15;
  totalFactors += 0.3;
  
  // Unemployment stress
  const unemploymentRate = cityStats.unemploymentRate || 5;
  stressFactors += Math.min(unemploymentRate / 15, 0.25); // Max 0.25 for unemployment
  totalFactors += 0.25;
  
  // Crime stress
  const crimeRate = cityStats.crimeRatePer1000 || 30;
  stressFactors += Math.min(crimeRate / 100, 0.2); // Max 0.2 for crime
  totalFactors += 0.2;
  
  // Service quality stress
  const serviceQuality = assessServiceQuality(cityStats);
  const poorServices = Object.values(serviceQuality).filter(rating => 
    rating === 'Poor' || rating === 'Very Poor'
  ).length;
  stressFactors += Math.min(poorServices / 20, 0.15); // Max 0.15 for services
  totalFactors += 0.15;
  
  // Economic outlook stress
  const economicTrend = parseEconomicOutlook(cityStats.economicOutlook);
  if (economicTrend < 0) {
    stressFactors += Math.abs(economicTrend) * 0.1; // Max ~0.05 for economic outlook
  }
  totalFactors += 0.1;
  
  return Math.min(stressFactors / totalFactors, 1.0);
}

/**
 * Get population-based characteristics
 */
function getPopulationFactor(population) {
  return {
    isSmall: population < 100000,
    isMedium: population >= 100000 && population <= 500000,
    isLarge: population > 500000,
    isMajor: population > 1000000
  };
}

/**
 * Map service names to budget line items
 */
function getServiceBudgetLine(serviceName) {
  const mapping = {
    'education': 'publicEducation',
    'infrastructure': 'infrastructure',
    'healthcare': 'publicHealthServices',
    'publicSafety': 'policeDepartment',
    'culture': 'cultureArts',
    'environment': 'wasteManagement'
  };
  return mapping[serviceName];
}

/**
 * Parse economic outlook string to numeric value
 */
function parseEconomicOutlook(outlook) {
  if (!outlook || typeof outlook !== 'string') return 0;
  
  const lower = outlook.toLowerCase();
  if (lower.includes('booming') || lower.includes('strong growth')) return 0.8;
  if (lower.includes('moderate growth')) return 0.4;
  if (lower.includes('slow growth')) return 0.1;
  if (lower.includes('stagnant')) return -0.1;
  if (lower.includes('recession') || lower.includes('declining')) return -0.5;
  
  return 0;
}

/**
 * Apply party discipline - parties vote more cohesively than individuals
 */
function applyPartyDiscipline(supportScore, party) {
  // Party discipline amplifies the support/opposition
  const discipline = 0.3; // 30% amplification
  const amplified = supportScore * (1 + discipline);
  
  // Clamp to reasonable bounds
  return Math.max(-2, Math.min(2, amplified));
}

/**
 * Convert numeric support score to vote choice
 */
function convertScoreToVote(supportScore, options = {}) {
  const { abstainThreshold = 0.15, randomFactor = 0.1 } = options;
  
  // Add small random factor for variety (but much less than individual AI)
  const randomAdjustment = (Math.random() - 0.5) * randomFactor;
  const finalScore = supportScore + randomAdjustment;
  
  // Strong opposition/support (outside abstain threshold)
  if (finalScore > abstainThreshold) {
    return 'yea';
  } else if (finalScore < -abstainThreshold) {
    return 'nay';
  } else {
    // Close calls result in abstention more often for parties
    return Math.random() < 0.7 ? 'abstain' : (finalScore > 0 ? 'yea' : 'nay');
  }
}

/**
 * Batch calculate votes for all parties in a city
 * @param {Array} cityCouncilMembers - Array of council members with party info
 * @param {Object} bill - Bill to vote on
 * @param {Object} cityStats - City statistics
 * @param {Array} allParties - All parties in the campaign
 * @returns {Object} Votes keyed by member ID
 */
export function calculateCityPartyLineVotes(cityCouncilMembers, bill, cityStats, allParties) {
  const votes = {};
  const partyVoteCache = new Map(); // Cache party decisions to ensure consistency
  
  cityCouncilMembers.forEach(member => {
    if (member.isPlayer) {
      // Skip player - they vote manually
      return;
    }
    
    const partyId = member.partyId;
    let voteChoice;
    
    // Check if we've already calculated this party's vote
    if (partyVoteCache.has(partyId)) {
      voteChoice = partyVoteCache.get(partyId);
    } else {
      // Find party data
      const party = allParties.find(p => p.id === partyId);
      if (party) {
        voteChoice = calculatePartyLineVote(party, bill, cityStats);
        partyVoteCache.set(partyId, voteChoice);
      } else {
        // Independent or unknown party
        voteChoice = 'abstain';
      }
    }
    
    votes[member.id] = voteChoice;
  });
  
  return votes;
}

// Expose for testing in development
if (process.env.NODE_ENV === 'development') {
  window.testPartyLineVoting = { calculatePartyLineVote, calculateCityPartyLineVotes };
}