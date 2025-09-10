// src/entities/politicalCapitalSystem.js

/**
 * Political Capital System - Handles regeneration and penalties for political capital
 * Based on approval ratings, election results, bill performance, and party standing
 */

/**
 * Calculate monthly political capital adjustment for a politician
 * @param {Object} politician - The politician object
 * @param {Object} context - Additional context (party performance, recent bills, etc.)
 * @returns {Object} - { adjustment: number, breakdown: Array<string> }
 */
export const calculateMonthlyPoliticalCapitalAdjustment = (politician, context = {}) => {
  let adjustment = 0;
  const breakdown = [];
  
  const approvalRating = politician.approvalRating || 50;
  const isIncumbent = context.isIncumbent || false;
  const isMajorityParty = context.isMajorityParty || false;
  const partyPerformance = context.partyPerformance || 'neutral'; // 'good', 'bad', 'neutral'
  const recentBills = context.recentBills || [];
  const wonElectionThisMonth = context.wonElectionThisMonth || false;
  
  // Base approval rating effects
  if (approvalRating >= 70) {
    adjustment += 3;
    breakdown.push(`High approval (${approvalRating}%): +3 PC`);
  } else if (approvalRating >= 60) {
    adjustment += 2;
    breakdown.push(`Good approval (${approvalRating}%): +2 PC`);
  } else if (approvalRating >= 50) {
    adjustment += 1;
    breakdown.push(`Moderate approval (${approvalRating}%): +1 PC`);
  } else if (approvalRating >= 40) {
    adjustment -= 1;
    breakdown.push(`Poor approval (${approvalRating}%): -1 PC`);
  } else {
    adjustment -= 2;
    breakdown.push(`Very poor approval (${approvalRating}%): -2 PC`);
  }
  
  // Incumbent bonuses/penalties
  if (isIncumbent) {
    if (isMajorityParty) {
      if (partyPerformance === 'good') {
        adjustment += 2;
        breakdown.push("Majority party performing well: +2 PC");
      } else if (partyPerformance === 'bad') {
        adjustment -= 2;
        breakdown.push("Majority party performing poorly: -2 PC");
      }
    } else {
      // Opposition party benefits from majority party doing poorly
      if (partyPerformance === 'bad') {
        adjustment += 1;
        breakdown.push("Opposition gains from majority struggles: +1 PC");
      }
    }
  }
  
  // Election victory bonus
  if (wonElectionThisMonth) {
    const victoryBonus = isIncumbent ? 3 : 5; // New winners get more
    adjustment += victoryBonus;
    breakdown.push(`Election victory: +${victoryBonus} PC`);
  }
  
  // Bill performance effects
  const billEffects = calculateBillPerformanceEffects(recentBills, politician);
  adjustment += billEffects.adjustment;
  breakdown.push(...billEffects.breakdown);
  
  // Ensure political capital doesn't go below 0 or above 100
  const currentPC = politician.politicalCapital || 0;
  const newPC = Math.max(0, Math.min(100, currentPC + adjustment));
  const actualAdjustment = newPC - currentPC;
  
  return {
    adjustment: actualAdjustment,
    breakdown,
    newTotal: newPC
  };
};

/**
 * Calculate political capital effects from recent bill performance
 * @param {Array} recentBills - Bills passed in recent months
 * @param {Object} politician - The politician object
 * @returns {Object} - { adjustment: number, breakdown: Array<string> }
 */
const calculateBillPerformanceEffects = (recentBills, politician) => {
  let adjustment = 0;
  const breakdown = [];
  
  // Only consider bills where this politician was involved
  const playerBills = recentBills.filter(bill => 
    bill.sponsorId === politician.id || 
    (bill.cosponsors && bill.cosponsors.includes(politician.id))
  );
  
  if (playerBills.length === 0) {
    return { adjustment: 0, breakdown: [] };
  }
  
  const passedBills = playerBills.filter(bill => bill.status === 'passed');
  const failedBills = playerBills.filter(bill => bill.status === 'failed');
  
  // Successful bills
  passedBills.forEach(bill => {
    const publicSupport = bill.publicSupport || 0.5;
    
    if (publicSupport >= 0.7) {
      // Very popular bill - gain more than initial cost
      adjustment += 2;
      breakdown.push(`Popular bill "${bill.name}": +2 PC`);
    } else if (publicSupport >= 0.6) {
      // Moderately popular - gain some back
      adjustment += 1;
      breakdown.push(`Successful bill "${bill.name}": +1 PC`);
    } else if (publicSupport <= 0.3) {
      // Unpopular bill - lose additional PC beyond initial cost
      adjustment -= 1;
      breakdown.push(`Unpopular bill "${bill.name}": -1 PC`);
    }
  });
  
  // Failed bills - small penalty for unsuccessful legislation
  failedBills.forEach(bill => {
    adjustment -= 1;
    breakdown.push(`Failed bill "${bill.name}": -1 PC`);
  });
  
  return { adjustment, breakdown };
};

/**
 * Calculate political capital requirements for media access
 * @param {number} currentPC - Current political capital
 * @param {string} mediaType - Type of media appearance
 * @returns {Object} - { allowed: boolean, requirement: number, message: string }
 */
export const calculateMediaAccessRequirements = (currentPC, mediaType = 'local') => {
  const requirements = {
    local: { min: 5, name: "Local News Interview" },
    regional: { min: 15, name: "Regional Media Appearance" },
    national: { min: 25, name: "National TV Interview" },
    major: { min: 40, name: "Major Network Interview" }
  };
  
  const requirement = requirements[mediaType] || requirements.local;
  const allowed = currentPC >= requirement.min;
  
  return {
    allowed,
    requirement: requirement.min,
    message: allowed 
      ? `Access granted to ${requirement.name}`
      : `Need ${requirement.min} PC for ${requirement.name} (have ${currentPC})`
  };
};

/**
 * Enhanced media appearance function that considers political capital for success
 * @param {Object} politician - The politician object
 * @param {number} hoursSpent - Hours spent on appearance
 * @param {string} mediaType - Type of media appearance
 * @returns {Object} - Results of the media appearance including PC gain
 */
export const calculateEnhancedMediaAppearance = (politician, hoursSpent = 2, mediaType = 'local') => {
  const baseResults = {
    approvalBoost: 0,
    nameRecGain: 0,
    mediaBuzzGain: 0,
    politicalCapitalGain: 0
  };
  
  const currentPC = politician.politicalCapital || 0;
  const mediaAccess = calculateMediaAccessRequirements(currentPC, mediaType);
  
  if (!mediaAccess.allowed) {
    return {
      ...baseResults,
      success: false,
      message: mediaAccess.message
    };
  }
  
  // Base calculations from existing system
  const charismaFactor = Math.max(0.5, (politician.attributes?.charisma || 3) / 5);
  const oratoryFactor = Math.max(0.5, (politician.attributes?.oratory || 3) / 5);
  
  // Political capital improves performance
  const pcFactor = Math.min(2.0, 1 + (currentPC / 100));
  
  const approvalBoost = Math.round(
    Math.random() * hoursSpent * charismaFactor * pcFactor
  );
  
  const nameRecGain = Math.round(
    (10 + Math.random() * 20) * hoursSpent * charismaFactor * pcFactor
  );
  
  const mediaBuzzGain = Math.round(
    (1 + Math.random() * 2) * hoursSpent + 
    Math.floor((politician.attributes?.charisma || 5) / 2) * pcFactor
  );
  
  // Successful media appearances grant political capital
  let politicalCapitalGain = 0;
  if (approvalBoost > 0) {
    politicalCapitalGain = Math.floor(approvalBoost / 2) + 1; // Roughly half the approval boost + 1
  }
  
  return {
    approvalBoost,
    nameRecGain,
    mediaBuzzGain,
    politicalCapitalGain,
    success: true,
    message: `Successful ${mediaAccess.requirement.name} appearance!`
  };
};

/**
 * Determine party performance based on city/state metrics
 * @param {Object} context - Game context with city stats, party composition, etc.
 * @returns {string} - 'good', 'bad', or 'neutral'
 */
export const assessPartyPerformance = (context) => {
  const { cityStats, partyControl } = context;
  
  if (!cityStats || !partyControl) {
    return 'neutral';
  }
  
  let score = 0;
  
  // Economic indicators
  if (cityStats.unemploymentRate < 5) score += 2;
  else if (cityStats.unemploymentRate > 8) score -= 2;
  
  if (cityStats.budget?.balance > 0) score += 1;
  else if (cityStats.budget?.balance < -cityStats.budget?.totalAnnualIncome * 0.1) score -= 2;
  
  // Social indicators
  if (cityStats.crimeRatePer1000 < 30) score += 1;
  else if (cityStats.crimeRatePer1000 > 60) score -= 1;
  
  if (cityStats.povertyRate < 15) score += 1;
  else if (cityStats.povertyRate > 25) score -= 1;
  
  // Citizen mood
  const moodLevels = ["Angry", "Upset", "Dissatisfied", "Neutral", "Content", "Happy", "Thrilled"];
  const moodIndex = moodLevels.indexOf(cityStats.overallCitizenMood);
  if (moodIndex >= 5) score += 2;
  else if (moodIndex <= 1) score -= 2;
  else if (moodIndex >= 4) score += 1;
  else if (moodIndex <= 2) score -= 1;
  
  if (score >= 3) return 'good';
  else if (score <= -3) return 'bad';
  else return 'neutral';
};