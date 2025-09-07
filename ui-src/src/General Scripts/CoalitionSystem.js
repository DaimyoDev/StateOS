// src/General Scripts/CoalitionSystem.js
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { getRandomElement, getRandomInt } from "../utils/core.js";

/**
 * Coalition-based LOD (Level of Detail) system for optimizing politician calculations
 * Reduces O(n) politician operations to O(c) coalition operations where c << n
 */

// Coalition templates based on demographic and ideological clustering
const COALITION_TEMPLATES = [
  {
    id: 'urban_progressive',
    name: 'Urban Progressives',
    ideology: 'progressive',
    demographics: { location: 'urban', age: 'young', education: 'college', occupation: 'professional' },
    baseSize: 0.12,
    volatility: 0.35
  },
  {
    id: 'suburban_centrist',
    name: 'Suburban Moderates',
    ideology: 'centrist',
    demographics: { location: 'suburban', age: 'middle_aged', education: 'college', occupation: 'middle_class' },
    baseSize: 0.18,
    volatility: 0.25
  },
  {
    id: 'rural_conservative',
    name: 'Rural Conservatives',
    ideology: 'conservative',
    demographics: { location: 'rural', age: 'middle_aged', education: 'high_school', occupation: 'working_class' },
    baseSize: 0.15,
    volatility: 0.20
  },
  {
    id: 'working_populist',
    name: 'Working Class Populists',
    ideology: 'populist',
    demographics: { location: 'mixed', age: 'middle_aged', education: 'high_school', occupation: 'working_class' },
    baseSize: 0.14,
    volatility: 0.40
  },
  {
    id: 'business_libertarian',
    name: 'Business Libertarians',
    ideology: 'libertarian',
    demographics: { location: 'suburban', age: 'middle_aged', education: 'college', occupation: 'business_owner' },
    baseSize: 0.08,
    volatility: 0.30
  },
  {
    id: 'young_socialist',
    name: 'Young Socialists',
    ideology: 'socialist',
    demographics: { location: 'urban', age: 'young', education: 'college', occupation: 'professional' },
    baseSize: 0.10,
    volatility: 0.45
  },
  {
    id: 'senior_traditional',
    name: 'Traditional Seniors',
    ideology: 'conservative',
    demographics: { location: 'suburban', age: 'senior', education: 'high_school', occupation: 'retired' },
    baseSize: 0.13,
    volatility: 0.15
  },
  {
    id: 'tech_pragmatist',
    name: 'Tech Pragmatists',
    ideology: 'pragmatist',
    demographics: { location: 'urban', age: 'young', education: 'graduate', occupation: 'professional' },
    baseSize: 0.10,
    volatility: 0.25
  }
];

/**
 * SoA-optimized coalition storage structure
 */
export const createCoalitionSoA = () => ({
  base: new Map(),           // id, name, size, volatility
  demographics: new Map(),   // occupation, age, education, location
  ideology: new Map(),       // primary ideology, idealPoint vector
  policyStances: new Map(),  // aggregated policy preferences
  partyAlignment: new Map(), // calculated party preferences based on ideology
  state: new Map(),          // currentMood, satisfaction, mobilization
  polling: new Map(),        // cached polling calculations by candidate
  mobilization: new Map(),   // UI-accessible mobilization levels (0-100)
  supportBase: new Map()     // coalition size as percentage of total population
});

/**
 * Calculate ideological distance between two ideologies using their idealPoint vectors
 */
export const calculateIdeologicalDistance = (ideology1, ideology2) => {
  const point1 = IDEOLOGY_DEFINITIONS[ideology1]?.idealPoint;
  const point2 = IDEOLOGY_DEFINITIONS[ideology2]?.idealPoint;
  
  if (!point1 || !point2) return 10; // Maximum distance for unknown ideologies
  
  const dimensions = [
    'economic', 'social_traditionalism', 'sovereignty', 'ecology',
    'theocratic', 'digitalization', 'personal_liberty', 'authority_structure',
    'state_intervention_scope', 'societal_focus', 'rural_priority', 'governance_approach'
  ];
  
  let distanceSquared = 0;
  for (const dim of dimensions) {
    const diff = (point1[dim] || 0) - (point2[dim] || 0);
    distanceSquared += diff * diff;
  }
  
  return Math.sqrt(distanceSquared);
};

/**
 * Generate party alignment weights for a coalition based on ideological distance
 */
export const generatePartyAlignment = (coalitionIdeology, availableParties) => {
  const alignments = new Map();
  
  for (const party of availableParties) {
    const distance = calculateIdeologicalDistance(coalitionIdeology, party.ideologyId);
    // Convert distance to preference (closer = higher preference, 0-10 scale)
    const preference = Math.max(0, 10 - distance);
    alignments.set(party.id, preference);
  }
  
  // Normalize to sum to 1.0 for probability distribution
  const total = Array.from(alignments.values()).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    for (const [partyId, value] of alignments) {
      alignments.set(partyId, value / total);
    }
  }
  
  return alignments;
};

/**
 * Generate coalition policy stances based on ideology and electorate profile
 */
export const generateCoalitionPolicyStances = (ideology, electorateProfile) => {
  const stances = new Map();
  const ideologyDef = IDEOLOGY_DEFINITIONS[ideology];
  
  if (!ideologyDef) return stances;
  
  POLICY_QUESTIONS.forEach(question => {
    if (question.options && question.options.length > 0) {
      // Use electorate profile as base, modified by ideology
      let baseStance = electorateProfile[question.id] || 0;
      
      // Apply ideological bias based on question category
      const ideologyBias = getIdeologyBiasForQuestion(question, ideologyDef);
      const finalStance = Math.max(-5, Math.min(5, baseStance + ideologyBias));
      
      stances.set(question.id, finalStance);
    }
  });
  
  return stances;
};

/**
 * Calculate ideology bias for a specific policy question
 */
const getIdeologyBiasForQuestion = (question, ideologyDef) => {
  const idealPoint = ideologyDef.idealPoint;
  
  // Map question categories to ideology dimensions
  const categoryMappings = {
    // Handle both lowercase and actual categories used in policy data
    'economic': ['economic', 'state_intervention_scope'],
    'Economy': ['economic', 'state_intervention_scope'],
    'social': ['social_traditionalism', 'personal_liberty'],
    'Social Issues': ['social_traditionalism', 'personal_liberty'],
    'environment': ['ecology'],
    'Environment': ['ecology'],
    'Environmental Policy': ['ecology'],
    'governance': ['governance_approach', 'authority_structure'],
    'Governance': ['governance_approach', 'authority_structure'],
    'Government Structure': ['governance_approach', 'authority_structure'],
    'Constitutional Structure': ['governance_approach', 'authority_structure'],
    'technology': ['digitalization'],
    'Technology': ['digitalization'],
    'foreign': ['sovereignty'],
    'Foreign Policy': ['sovereignty'],
    'Defense': ['sovereignty', 'authority_structure'],
    'National Defense': ['sovereignty', 'authority_structure'],
    'Healthcare': ['state_intervention_scope', 'social_traditionalism'],
    'Education': ['state_intervention_scope', 'social_traditionalism'],
    'Justice and Law': ['authority_structure', 'personal_liberty']
  };
  
  const relevantDimensions = categoryMappings[question.category] || categoryMappings[question.category?.toLowerCase()] || ['state_intervention_scope'];
  let bias = 0;
  
  for (const dimension of relevantDimensions) {
    bias += idealPoint[dimension] || 0;
  }
  
  return bias / relevantDimensions.length;
};

/**
 * Generate coalitions from electorate profile and available parties
 */
export const generateCoalitions = (electorateProfile, demographics, availableParties) => {
  const coalitionSoA = createCoalitionSoA();
  
  for (const template of COALITION_TEMPLATES) {
    // Adjust coalition size based on demographics
    const adjustedSize = adjustCoalitionSize(template, demographics);
    
    coalitionSoA.base.set(template.id, {
      id: template.id,
      name: template.name,
      size: adjustedSize,
      volatility: template.volatility
    });
    
    coalitionSoA.demographics.set(template.id, template.demographics);
    coalitionSoA.ideology.set(template.id, template.ideology);
    
    // Generate policy stances based on ideology and electorate
    coalitionSoA.policyStances.set(template.id, 
      generateCoalitionPolicyStances(template.ideology, electorateProfile));
    
    // Calculate party alignments using ideological distance
    coalitionSoA.partyAlignment.set(template.id, 
      generatePartyAlignment(template.ideology, availableParties));
    
    // Initialize state
    coalitionSoA.state.set(template.id, {
      currentMood: getRandomInt(-20, 20) / 100, // -0.2 to 0.2
      satisfaction: 0.5 + getRandomInt(-10, 10) / 100, // 0.4 to 0.6
      mobilization: 0.5 + getRandomInt(-15, 15) / 100 // 0.35 to 0.65
    });
    
    // Initialize mobilization and supportBase for UI
    const initialMobilization = (0.5 + getRandomInt(-15, 15) / 100) * 100; // Convert to percentage
    coalitionSoA.mobilization.set(template.id, initialMobilization);
    coalitionSoA.supportBase.set(template.id, adjustedSize);
    
    // Initialize empty polling cache
    coalitionSoA.polling.set(template.id, new Map());
  }
  
  return coalitionSoA;
};

/**
 * Adjust coalition size based on demographic data
 */
const adjustCoalitionSize = (template, demographics) => {
  let sizeMultiplier = 1.0;
  
  // Adjust based on urban/rural distribution
  if (template.demographics.location === 'urban' && demographics.urbanization) {
    sizeMultiplier *= (demographics.urbanization / 50); // Normalize around 50%
  } else if (template.demographics.location === 'rural' && demographics.urbanization) {
    sizeMultiplier *= ((100 - demographics.urbanization) / 50);
  }
  
  // Adjust based on age distribution
  if (template.demographics.age === 'young' && demographics.ageDistribution) {
    const youngPercent = (demographics.ageDistribution.young || 25) / 25;
    sizeMultiplier *= youngPercent;
  } else if (template.demographics.age === 'senior' && demographics.ageDistribution) {
    const seniorPercent = (demographics.ageDistribution.senior || 20) / 20;
    sizeMultiplier *= seniorPercent;
  }
  
  // Ensure size stays within reasonable bounds
  sizeMultiplier = Math.max(0.3, Math.min(2.0, sizeMultiplier));
  
  return template.baseSize * sizeMultiplier;
};

/**
 * SoA-optimized coalition polling calculation using vectorized operations
 */
export const calculateCoalitionPolling = (candidateId, candidateData, coalitionSoA) => {
  const results = new Map();
  
  // Use SoA Map iteration instead of cached arrays for consistency
  for (const [coalitionId, base] of coalitionSoA.base) {
    // Use cached data from SoA maps for O(1) access
    const demographics = coalitionSoA.demographics.get(coalitionId);
    const ideology = coalitionSoA.ideology.get(coalitionId);
    const policyStances = coalitionSoA.policyStances.get(coalitionId);
    const partyAlignment = coalitionSoA.partyAlignment.get(coalitionId);
    const state = coalitionSoA.state.get(coalitionId);
    
    // Vectorized scoring calculation with emergency performance fix
    const ideologyScore = calculateIdeologyAlignment(candidateData.calculatedIdeology, ideology);
    const policyScore = calculatePolicyAlignment(candidateId, policyStances, candidateData.policyStances);
    const partyScore = calculatePartyAlignmentScore(candidateData.partyId, partyAlignment);
    const demographicScore = calculateDemographicAppeal(candidateData.attributes, demographics);
    
    // Weighted combination
    let score = 
      ideologyScore * 0.35 +
      policyScore * 0.25 +
      partyScore * 0.25 +
      demographicScore * 0.15;
    
    // Apply coalition mood and satisfaction modifiers
    const moodModifier = 1.0 + (state.currentMood * 0.5); // -10% to +10%
    const satisfactionModifier = 0.5 + state.satisfaction; // 0.9 to 1.1
    
    score *= moodModifier * satisfactionModifier;
    
    // Clamp to 0-100 range and store result
    const finalScore = Math.max(0, Math.min(100, score));
    results.set(coalitionId, finalScore);
  }
  
  return results;
};

/**
 * Calculate ideology alignment score between candidate and coalition
 */
const calculateIdeologyAlignment = (candidateIdeology, coalitionIdeology) => {
  const distance = calculateIdeologicalDistance(candidateIdeology, coalitionIdeology);
  // Convert distance to score (closer = higher score)
  return Math.max(0, 100 - (distance * 10));
};

/**
 * Calculate policy alignment score between candidate and coalition
 * PERFORMANCE OPTIMIZED: Use SoA policy stance structure for O(1) lookups
 */
// Cache for ultra-fast policy alignment calculations
const policyAlignmentCache = new Map();

const calculatePolicyAlignment = (candidateId, coalitionStances, candidateStances) => {
  if (!coalitionStances || !candidateStances) return 50; // Neutral score
  
  // Create cache key for this specific calculation
  const cacheKey = `${candidateId}_${coalitionStances.size}`;
  if (policyAlignmentCache.has(cacheKey)) {
    return policyAlignmentCache.get(cacheKey);
  }
  
  let totalAlignment = 0;
  let questionsCompared = 0;
  
  
  // EMERGENCY FIX: Use direct candidate stance lookup instead of SoA
  // This bypasses the 900ms Map.get bottleneck
  if (candidateStances instanceof Map) {
    for (const [questionId, coalitionStance] of coalitionStances) {
      const candidateStance = candidateStances.get(questionId);
      
      if (candidateStance !== undefined) {
        // Validate stance values are numbers
        if (typeof coalitionStance !== 'number' || typeof candidateStance !== 'number') {
          continue;
        }
        
        const difference = candidateStance > coalitionStance ? 
          candidateStance - coalitionStance : 
          coalitionStance - candidateStance;
        const alignment = difference >= 10 ? 0 : 100 - (difference * 10);
        
        totalAlignment += alignment;
        questionsCompared++;
      }
    }
  } else {
    // Fallback for object-based stances
    for (const [questionId, coalitionStance] of coalitionStances) {
      const candidateStance = candidateStances[questionId];
      
      if (candidateStance !== undefined) {
        // Validate stance values are numbers
        if (typeof coalitionStance !== 'number' || typeof candidateStance !== 'number') {
          continue;
        }
        
        const difference = candidateStance > coalitionStance ? 
          candidateStance - coalitionStance : 
          coalitionStance - candidateStance;
        const alignment = difference >= 10 ? 0 : 100 - (difference * 10);
        
        totalAlignment += alignment;
        questionsCompared++;
      }
    }
  }
  
  const result = questionsCompared > 0 ? totalAlignment / questionsCompared : 50;
  
  // Ensure result is not NaN
  const finalResult = isNaN(result) ? 50 : result;
  
  // Cache result for future use
  policyAlignmentCache.set(cacheKey, finalResult);
  
  return finalResult;
};

/**
 * Calculate party alignment score
 */
const calculatePartyAlignmentScore = (candidatePartyId, partyAlignment) => {
  if (!candidatePartyId || !partyAlignment) return 50;
  
  const alignment = partyAlignment.get(candidatePartyId) || 0;
  return alignment * 100; // Convert 0-1 to 0-100 scale
};

/**
 * Calculate demographic appeal score
 */
const calculateDemographicAppeal = (candidateAttributes, coalitionDemographics) => {
  if (!candidateAttributes) return 50;
  
  let appeal = 50; // Base appeal
  
  // Charisma affects all demographics
  const charisma = candidateAttributes.charisma || 50;
  appeal += (charisma - 50) * 0.3;
  
  // Intelligence appeals more to educated coalitions
  if (coalitionDemographics.education === 'graduate' || coalitionDemographics.education === 'college') {
    const intelligence = candidateAttributes.intelligence || 50;
    appeal += (intelligence - 50) * 0.2;
  }
  
  // Integrity appeals to all but varies by coalition
  const integrity = candidateAttributes.integrity || 50;
  appeal += (integrity - 50) * 0.25;
  
  return Math.max(0, Math.min(100, appeal));
};

/**
 * Batched coalition effect collector for efficient bulk updates
 */
export class CoalitionEffectBatch {
  constructor() {
    this.mobilizationEffects = new Map(); // coalitionId -> accumulated effect
    this.moodEffects = new Map(); // coalitionId -> accumulated effect
    this.satisfactionEffects = new Map(); // coalitionId -> accumulated effect
    this.jurisdictionEffects = new Map(); // jurisdictionId -> effects for all coalitions in that area
    this.processedEvents = new Set(); // Prevent duplicate event processing
  }

  /**
   * Add a mobilization effect for a specific coalition
   */
  addMobilizationEffect(coalitionId, effect, source = 'unknown') {
    if (!this.mobilizationEffects.has(coalitionId)) {
      this.mobilizationEffects.set(coalitionId, { total: 0, sources: [] });
    }
    const existing = this.mobilizationEffects.get(coalitionId);
    existing.total += effect;
    existing.sources.push(source);
  }

  /**
   * Add effects for all coalitions in a jurisdiction (city/state/national)
   */
  addJurisdictionEffect(jurisdictionId, jurisdictionType, coalitionEffects) {
    if (!this.jurisdictionEffects.has(jurisdictionId)) {
      this.jurisdictionEffects.set(jurisdictionId, { type: jurisdictionType, effects: [] });
    }
    this.jurisdictionEffects.get(jurisdictionId).effects.push(coalitionEffects);
  }

  /**
   * Apply all batched effects to coalition SoA
   */
  applyEffects(coalitionSoA) {
    const startTime = performance.now();
    let updatesApplied = 0;

    // Apply direct coalition effects first
    for (const [coalitionId, effect] of this.mobilizationEffects) {
      const currentState = coalitionSoA.state.get(coalitionId);
      if (currentState) {
        const oldMobilization = currentState.mobilization;
        const newMobilization = Math.max(0, Math.min(1, 
          currentState.mobilization + effect.total
        ));
        
        // Log mobilization changes
        console.log(`[COALITION EFFECT] ${coalitionId} mobilization: ${(oldMobilization * 100).toFixed(1)}% → ${(newMobilization * 100).toFixed(1)}% (${effect.total >= 0 ? '+' : ''}${(effect.total * 100).toFixed(1)}%)`);
        
        coalitionSoA.state.set(coalitionId, {
          ...currentState,
          mobilization: newMobilization
        });
        updatesApplied++;
      }
    }

    // Apply jurisdiction-wide effects with spatial aggregation
    for (const [jurisdictionId, jurisdictionData] of this.jurisdictionEffects) {
      this.applyJurisdictionEffects(coalitionSoA, jurisdictionData);
      updatesApplied++;
    }

    const duration = performance.now() - startTime;
    return { updatesApplied, duration };
  }

  /**
   * Apply effects for an entire jurisdiction efficiently
   */
  applyJurisdictionEffects(coalitionSoA, jurisdictionData) {
    // Aggregate all effects for this jurisdiction
    const aggregatedEffects = new Map();
    
    for (const effectSet of jurisdictionData.effects) {
      for (const [coalitionId, effect] of Object.entries(effectSet)) {
        if (!aggregatedEffects.has(coalitionId)) {
          aggregatedEffects.set(coalitionId, 0);
        }
        aggregatedEffects.set(coalitionId, 
          aggregatedEffects.get(coalitionId) + effect
        );
      }
    }

    // Apply aggregated effects
    for (const [coalitionId, totalEffect] of aggregatedEffects) {
      const currentState = coalitionSoA.state.get(coalitionId);
      if (currentState && Math.abs(totalEffect) > 0.001) { // Threshold filter
        const oldMobilization = currentState.mobilization;
        const newMobilization = Math.max(0, Math.min(1, 
          currentState.mobilization + totalEffect
        ));
        
        // Log jurisdiction-wide mobilization changes
        console.log(`[COALITION JURISDICTION] ${coalitionId} mobilization: ${(oldMobilization * 100).toFixed(1)}% → ${(newMobilization * 100).toFixed(1)}% (${totalEffect >= 0 ? '+' : ''}${(totalEffect * 100).toFixed(1)}%)`);
        
        coalitionSoA.state.set(coalitionId, {
          ...currentState,
          mobilization: newMobilization
        });
      }
    }
  }

  /**
   * Clear all batched effects
   */
  clear() {
    this.mobilizationEffects.clear();
    this.moodEffects.clear();
    this.satisfactionEffects.clear();
    this.jurisdictionEffects.clear();
    this.processedEvents.clear();
  }
}

/**
 * Update coalition states based on events, policies, and time
 */
export const updateCoalitionStates = (coalitionSoA, events = [], policies = []) => {
  for (const coalitionId of coalitionSoA.base.keys()) {
    const currentState = coalitionSoA.state.get(coalitionId);
    const demographics = coalitionSoA.demographics.get(coalitionId);
    const ideology = coalitionSoA.ideology.get(coalitionId);
    
    let moodChange = 0;
    let satisfactionChange = 0;
    
    // Apply policy effects
    for (const policy of policies) {
      const policyEffect = calculatePolicyEffectOnCoalition(policy, ideology, demographics);
      satisfactionChange += policyEffect;
    }
    
    // Apply event effects
    for (const event of events) {
      const eventEffect = calculateEventEffectOnCoalition(event, ideology, demographics);
      moodChange += eventEffect;
    }
    
    // Natural decay towards neutral
    const moodDecay = currentState.currentMood * -0.05;
    const satisfactionDecay = (currentState.satisfaction - 0.5) * -0.02;
    
    // Update state with bounds checking
    const newState = {
      currentMood: Math.max(-1, Math.min(1, currentState.currentMood + moodChange + moodDecay)),
      satisfaction: Math.max(0, Math.min(1, currentState.satisfaction + satisfactionChange + satisfactionDecay)),
      mobilization: Math.max(0, Math.min(1, currentState.mobilization + getRandomInt(-2, 2) / 100))
    };
    
    coalitionSoA.state.set(coalitionId, newState);
  }
};

/**
 * Calculate how a policy affects a specific coalition
 */
const calculatePolicyEffectOnCoalition = (policy, coalitionIdeology, demographics) => {
  // This would be expanded based on specific policy types
  // For now, return small random effect
  return getRandomInt(-1, 1) / 100;
};

/**
 * Event type definitions and their coalition impact patterns
 */
const EVENT_IMPACT_PATTERNS = {
  // Economic Events
  'economic_growth': {
    'business_libertarian': { mobilization: 0.05, satisfaction: 0.08 },
    'suburban_centrist': { mobilization: 0.03, satisfaction: 0.05 },
    'working_populist': { mobilization: 0.02, satisfaction: 0.03 },
    'tech_pragmatist': { mobilization: 0.04, satisfaction: 0.06 }
  },
  'economic_recession': {
    'working_populist': { mobilization: 0.08, satisfaction: -0.10 },
    'young_socialist': { mobilization: 0.06, satisfaction: -0.08 },
    'business_libertarian': { mobilization: -0.03, satisfaction: -0.12 },
    'senior_traditional': { mobilization: -0.02, satisfaction: -0.06 }
  },
  'unemployment_spike': {
    'working_populist': { mobilization: 0.12, satisfaction: -0.15 },
    'young_socialist': { mobilization: 0.10, satisfaction: -0.12 },
    'urban_progressive': { mobilization: 0.06, satisfaction: -0.08 }
  },

  // Social Events  
  'social_unrest': {
    'urban_progressive': { mobilization: 0.08, satisfaction: -0.05 },
    'young_socialist': { mobilization: 0.12, satisfaction: -0.03 },
    'rural_conservative': { mobilization: 0.05, satisfaction: -0.08 },
    'senior_traditional': { mobilization: -0.04, satisfaction: -0.10 }
  },
  'cultural_shift': {
    'urban_progressive': { mobilization: 0.04, satisfaction: 0.06 },
    'young_socialist': { mobilization: 0.06, satisfaction: 0.08 },
    'rural_conservative': { mobilization: 0.03, satisfaction: -0.06 },
    'senior_traditional': { mobilization: 0.02, satisfaction: -0.08 }
  },

  // Policy Events
  'healthcare_reform': {
    'urban_progressive': { mobilization: 0.06, satisfaction: 0.08 },
    'young_socialist': { mobilization: 0.08, satisfaction: 0.10 },
    'senior_traditional': { mobilization: 0.04, satisfaction: 0.05 },
    'business_libertarian': { mobilization: 0.05, satisfaction: -0.06 }
  },
  'tax_reform': {
    'business_libertarian': { mobilization: 0.08, satisfaction: 0.10 },
    'working_populist': { mobilization: 0.06, satisfaction: -0.04 },
    'urban_progressive': { mobilization: 0.04, satisfaction: -0.02 }
  },
  'environmental_regulation': {
    'urban_progressive': { mobilization: 0.07, satisfaction: 0.09 },
    'young_socialist': { mobilization: 0.05, satisfaction: 0.07 },
    'tech_pragmatist': { mobilization: 0.04, satisfaction: 0.05 },
    'business_libertarian': { mobilization: 0.03, satisfaction: -0.08 },
    'rural_conservative': { mobilization: 0.02, satisfaction: -0.06 }
  },

  // Local/City Events
  'infrastructure_investment': {
    'suburban_centrist': { mobilization: 0.04, satisfaction: 0.06 },
    'working_populist': { mobilization: 0.03, satisfaction: 0.05 },
    'tech_pragmatist': { mobilization: 0.02, satisfaction: 0.04 }
  },
  'public_transit_expansion': {
    'urban_progressive': { mobilization: 0.05, satisfaction: 0.07 },
    'young_socialist': { mobilization: 0.04, satisfaction: 0.06 },
    'tech_pragmatist': { mobilization: 0.03, satisfaction: 0.05 }
  },
  'police_reform': {
    'urban_progressive': { mobilization: 0.08, satisfaction: 0.06 },
    'young_socialist': { mobilization: 0.10, satisfaction: 0.08 },
    'rural_conservative': { mobilization: 0.06, satisfaction: -0.08 },
    'senior_traditional': { mobilization: 0.04, satisfaction: -0.06 }
  },
  
  // Education Events
  'education_crisis': {
    'urban_progressive': { mobilization: 0.07, satisfaction: -0.08 },
    'young_socialist': { mobilization: 0.06, satisfaction: -0.10 },
    'senior_traditional': { mobilization: 0.05, satisfaction: -0.06 },
    'working_populist': { mobilization: 0.04, satisfaction: -0.05 }
  },
  'education_improvement': {
    'urban_progressive': { mobilization: 0.04, satisfaction: 0.06 },
    'tech_pragmatist': { mobilization: 0.05, satisfaction: 0.08 },
    'senior_traditional': { mobilization: 0.03, satisfaction: 0.04 }
  },
  
  // Infrastructure Events
  'infrastructure_crisis': {
    'urban_progressive': { mobilization: 0.06, satisfaction: -0.08 },
    'working_populist': { mobilization: 0.08, satisfaction: -0.10 },
    'business_libertarian': { mobilization: 0.04, satisfaction: -0.06 }
  },
  'infrastructure_investment': {
    'urban_progressive': { mobilization: 0.05, satisfaction: 0.07 },
    'tech_pragmatist': { mobilization: 0.06, satisfaction: 0.08 },
    'working_populist': { mobilization: 0.04, satisfaction: 0.05 }
  },
  
  // Crime Events
  'crime_surge': {
    'rural_conservative': { mobilization: 0.08, satisfaction: -0.10 },
    'senior_traditional': { mobilization: 0.07, satisfaction: -0.08 },
    'business_libertarian': { mobilization: 0.05, satisfaction: -0.06 },
    'urban_progressive': { mobilization: 0.04, satisfaction: -0.04 }
  }
};

/**
 * Calculate coalition-specific effects for a given event
 */
export const calculateEventCoalitionEffects = (event, jurisdictionType = 'city') => {
  console.log(`[COALITION EVENTS] Processing event: "${event.type}" (${event.title || event.name || 'Untitled'})`);
  
  const effects = new Map();
  const eventPattern = EVENT_IMPACT_PATTERNS[event.type];
  
  if (!eventPattern) {
    console.log(`[COALITION EVENTS] Unknown event type "${event.type}" - applying random effects`);
    // Unknown event type - apply small random effects to all coalitions
    for (const template of COALITION_TEMPLATES) {
      const mobilizationEffect = getRandomInt(-2, 2) / 100;
      const satisfactionEffect = getRandomInt(-2, 2) / 100;
      effects.set(template.id, {
        mobilization: mobilizationEffect,
        satisfaction: satisfactionEffect
      });
      if (Math.abs(mobilizationEffect) > 0.005) {
        console.log(`[COALITION EVENTS] ${template.id}: mobilization ${mobilizationEffect >= 0 ? '+' : ''}${(mobilizationEffect * 100).toFixed(1)}%`);
      }
    }
    return effects;
  }
  
  console.log(`[COALITION EVENTS] Found pattern for "${event.type}" affecting ${Object.keys(eventPattern).length} coalitions:`);
  for (const [coalitionId, effect] of Object.entries(eventPattern)) {
    if (effect.mobilization) {
      console.log(`[COALITION EVENTS] - ${coalitionId}: mobilization ${effect.mobilization >= 0 ? '+' : ''}${(effect.mobilization * 100).toFixed(1)}%`);
    }
  }

  // Apply magnitude scaling based on jurisdiction type
  const magnitudeScaling = {
    'city': 0.3,      // City events have localized impact
    'state': 0.7,     // State events have broader impact
    'national': 1.0   // National events have full impact
  };
  
  const scale = magnitudeScaling[jurisdictionType] || 0.5;
  
  // Apply event-specific effects with magnitude scaling
  for (const [coalitionId, impact] of Object.entries(eventPattern)) {
    effects.set(coalitionId, {
      mobilization: (impact.mobilization || 0) * scale * (event.magnitude || 1.0),
      satisfaction: (impact.satisfaction || 0) * scale * (event.magnitude || 1.0)
    });
  }
  
  // Apply small spillover effects to coalitions not directly mentioned
  for (const template of COALITION_TEMPLATES) {
    if (!effects.has(template.id)) {
      // Indirect effects based on ideological similarity
      const spilloverMobilization = getRandomInt(-1, 1) / 100 * scale;
      const spilloverSatisfaction = getRandomInt(-1, 1) / 100 * scale;
      
      effects.set(template.id, {
        mobilization: spilloverMobilization,
        satisfaction: spilloverSatisfaction
      });
    }
  }
  
  return effects;
};

/**
 * Calculate policy-specific effects on coalition mobilization
 */
export const calculatePolicyCoalitionEffects = (policy, jurisdictionType = 'city') => {
  const effects = new Map();
  
  // Policy categories and their coalition preferences
  const policyCoalitionAffinities = {
    'economic': {
      'business_libertarian': 0.08,
      'tech_pragmatist': 0.04,
      'suburban_centrist': 0.02,
      'working_populist': -0.04,
      'young_socialist': -0.08
    },
    'social': {
      'urban_progressive': 0.06,
      'young_socialist': 0.08,
      'tech_pragmatist': 0.03,
      'rural_conservative': -0.06,
      'senior_traditional': -0.08
    },
    'environmental': {
      'urban_progressive': 0.09,
      'young_socialist': 0.07,
      'tech_pragmatist': 0.05,
      'business_libertarian': -0.05,
      'rural_conservative': -0.04
    }
  };
  
  const categoryAffinity = policyCoalitionAffinities[policy.category] || {};
  const magnitudeScaling = {
    'city': 0.2,
    'state': 0.6, 
    'national': 1.0
  };
  
  const scale = magnitudeScaling[jurisdictionType] || 0.4;
  
  for (const template of COALITION_TEMPLATES) {
    const baseAffinity = categoryAffinity[template.id] || 0;
    const policyDirection = policy.direction || 0; // -1 (restrictive) to 1 (expansive)
    
    const mobilizationEffect = baseAffinity * policyDirection * scale;
    
    effects.set(template.id, {
      mobilization: mobilizationEffect,
      satisfaction: mobilizationEffect * 0.8 // Satisfaction follows mobilization but smaller
    });
  }
  
  return effects;
};

/**
 * Calculate how an event affects a specific coalition (legacy function for compatibility)
 */
const calculateEventEffectOnCoalition = (event, coalitionIdeology, demographics) => {
  const effects = calculateEventCoalitionEffects(event);
  const coalitionEffect = effects.get(coalitionIdeology) || { mobilization: 0 };
  return coalitionEffect.mobilization;
};

/**
 * Get coalition polling results for display
 */
export const getCoalitionPollingResults = (coalitionSoA, candidateId) => {
  const pollingCache = coalitionSoA.polling.get(candidateId);
  if (!pollingCache) return new Map();
  
  const results = new Map();
  for (const coalitionId of coalitionSoA.base.keys()) {
    const base = coalitionSoA.base.get(coalitionId);
    const polling = pollingCache.get(coalitionId) || 0;
    
    const supportBase = coalitionSoA.supportBase.get(coalitionId) || base.size || 0;
    results.set(coalitionId, {
      name: base.name,
      size: supportBase,
      polling: polling,
      weightedPolling: polling * supportBase
    });
  }
  
  return results;
};

/**
 * Convert coalition polling to overall candidate polling
 */
export const aggregateCoalitionPolling = (coalitionSoA, candidateId) => {
  const coalitionResults = coalitionSoA.polling.get(candidateId);
  if (!coalitionResults) return 0;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Use SoA Map iteration for consistency with architecture
  for (const [coalitionId, base] of coalitionSoA.base) {
    const polling = coalitionResults.get(coalitionId) || 0;
    
    // Use supportBase for weighting instead of base.size to capture state-specific variations
    const supportBase = coalitionSoA.supportBase.get(coalitionId) || base.size || 0;
    
    weightedSum += polling * supportBase;
    totalWeight += supportBase;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Calculate realistic voter turnout based on coalition mobilization levels
 * @param {object} coalitionSoA - The coalition data structure
 * @param {number} totalEligibleVoters - Total eligible voters in the jurisdiction
 * @returns {object} Detailed turnout data by coalition and overall
 */
export const calculateCoalitionBasedTurnout = (coalitionSoA, totalEligibleVoters) => {
  const coalitionTurnout = new Map();
  let totalActualVotes = 0;
  let totalCoalitionSize = 0;

  // Base turnout rates by demographic profile (realistic historical patterns)
  const getBaseTurnoutRate = (demographics) => {
    let baseTurnout = 0.65; // Default 65%
    
    // Age effects (seniors vote more, young people vote less)
    if (demographics.age === 'senior') baseTurnout = 0.75;
    else if (demographics.age === 'young') baseTurnout = 0.55;
    else if (demographics.age === 'middle_aged') baseTurnout = 0.68;
    
    // Education effects (higher education = higher turnout)
    if (demographics.education === 'graduate') baseTurnout += 0.08;
    else if (demographics.education === 'college') baseTurnout += 0.05;
    else if (demographics.education === 'high_school') baseTurnout -= 0.03;
    
    // Location effects (suburban votes more than urban, urban more than rural)
    if (demographics.location === 'suburban') baseTurnout += 0.03;
    else if (demographics.location === 'rural') baseTurnout -= 0.02;
    
    // Occupation effects
    if (demographics.occupation === 'professional') baseTurnout += 0.04;
    else if (demographics.occupation === 'business_owner') baseTurnout += 0.06;
    else if (demographics.occupation === 'working_class') baseTurnout -= 0.02;
    else if (demographics.occupation === 'retired') baseTurnout += 0.05;
    
    // Ensure turnout stays within reasonable bounds
    return Math.max(0.25, Math.min(0.90, baseTurnout));
  };

  // Calculate turnout for each coalition
  for (const [coalitionId, base] of coalitionSoA.base) {
    const state = coalitionSoA.state.get(coalitionId);
    const demographics = coalitionSoA.demographics.get(coalitionId);
    
    // Calculate coalition's share of total eligible voters using supportBase for state-specific variations
    const supportBase = coalitionSoA.supportBase.get(coalitionId) || base.size || 0;
    const coalitionVoterCount = Math.round(supportBase * totalEligibleVoters);
    totalCoalitionSize += coalitionVoterCount;
    
    // Get base turnout rate for this demographic profile
    const baseTurnout = getBaseTurnoutRate(demographics);
    
    // Apply mobilization modifier
    // Mobilization ranges from 0-1, with 0.5 being neutral
    // High mobilization (0.8+) can boost turnout significantly
    // Low mobilization (0.3-) reduces turnout
    const mobilizationEffect = (state.mobilization - 0.5) * 0.25; // ±12.5% effect
    const finalTurnoutRate = Math.max(0.15, Math.min(0.95, baseTurnout + mobilizationEffect));
    
    // Calculate actual votes from this coalition
    const coalitionActualVotes = Math.round(coalitionVoterCount * finalTurnoutRate);
    totalActualVotes += coalitionActualVotes;
    
    coalitionTurnout.set(coalitionId, {
      coalitionName: base.name,
      eligibleVoters: coalitionVoterCount,
      baseTurnoutRate: baseTurnout,
      mobilization: state.mobilization,
      mobilizationEffect: mobilizationEffect,
      finalTurnoutRate: finalTurnoutRate,
      actualVotes: coalitionActualVotes,
      coalitionSize: supportBase
    });
  }

  const overallTurnoutRate = totalEligibleVoters > 0 ? totalActualVotes / totalEligibleVoters : 0;

  return {
    coalitionTurnout,
    totalActualVotes,
    totalEligibleVoters,
    overallTurnoutRate: overallTurnoutRate * 100, // Convert to percentage
    coalitionCoverage: totalCoalitionSize / totalEligibleVoters // Should be close to 1.0
  };
};

/**
 * Calculate expected turnout with uncertainty for pre-election forecasting
 * Uses current coalition mobilization but adds realistic forecasting error
 * @param {object} coalitionSoA - The coalition data structure
 * @param {number} totalEligibleVoters - Total eligible voters in the jurisdiction
 * @param {object} options - Forecasting options
 * @returns {object} Expected turnout data with uncertainty range
 */
export const calculateExpectedTurnout = (coalitionSoA, totalEligibleVoters, options = {}) => {
  const {
    uncertaintyFactor = 0.10, // ±10% uncertainty by default
    mobilizationVolatility = 0.05, // ±5% potential mobilization change
    historicalBias = 0.02, // Small systematic bias (polls typically underestimate by 2%)
  } = options;

  let totalExpectedVotes = 0;
  let totalCoalitionSize = 0;
  const coalitionForecasts = new Map();

  // Base turnout rates by demographic profile (same as actual calculation)
  const getBaseTurnoutRate = (demographics) => {
    let baseTurnout = 0.65;
    
    if (demographics.age === 'senior') baseTurnout = 0.75;
    else if (demographics.age === 'young') baseTurnout = 0.55;
    else if (demographics.age === 'middle_aged') baseTurnout = 0.68;
    
    if (demographics.education === 'graduate') baseTurnout += 0.08;
    else if (demographics.education === 'college') baseTurnout += 0.05;
    else if (demographics.education === 'high_school') baseTurnout -= 0.03;
    
    if (demographics.location === 'suburban') baseTurnout += 0.03;
    else if (demographics.location === 'rural') baseTurnout -= 0.02;
    
    if (demographics.occupation === 'professional') baseTurnout += 0.04;
    else if (demographics.occupation === 'business_owner') baseTurnout += 0.06;
    else if (demographics.occupation === 'working_class') baseTurnout -= 0.02;
    else if (demographics.occupation === 'retired') baseTurnout += 0.05;
    
    return Math.max(0.25, Math.min(0.90, baseTurnout));
  };

  // Calculate expected turnout for each coalition with forecasting uncertainty
  for (const [coalitionId, base] of coalitionSoA.base) {
    const state = coalitionSoA.state.get(coalitionId);
    const demographics = coalitionSoA.demographics.get(coalitionId);
    
    const supportBase = coalitionSoA.supportBase.get(coalitionId) || base.size || 0;
    const coalitionVoterCount = Math.round(supportBase * totalEligibleVoters);
    totalCoalitionSize += coalitionVoterCount;
    
    const baseTurnout = getBaseTurnoutRate(demographics);
    
    // Add uncertainty to mobilization prediction
    // High volatility coalitions (young voters, populists) are harder to predict
    const coalitionVolatility = base.volatility || 0.25;
    const mobilizationUncertainty = mobilizationVolatility * coalitionVolatility;
    
    // Expected mobilization with some uncertainty
    const expectedMobilization = state.mobilization + (Math.random() - 0.5) * mobilizationUncertainty * 2;
    const clampedExpectedMobilization = Math.max(0, Math.min(1, expectedMobilization));
    
    // Calculate expected turnout rate
    const mobilizationEffect = (clampedExpectedMobilization - 0.5) * 0.25;
    const rawExpectedTurnout = baseTurnout + mobilizationEffect;
    
    // Add overall forecasting uncertainty
    const forecastingError = (Math.random() - 0.5) * uncertaintyFactor * 2;
    const expectedTurnoutRate = Math.max(0.15, Math.min(0.95, 
      rawExpectedTurnout + forecastingError + historicalBias
    ));
    
    const expectedVotes = Math.round(coalitionVoterCount * expectedTurnoutRate);
    totalExpectedVotes += expectedVotes;
    
    coalitionForecasts.set(coalitionId, {
      coalitionName: base.name,
      expectedTurnoutRate,
      expectedVotes,
      forecastUncertainty: Math.abs(forecastingError),
      mobilizationForecast: clampedExpectedMobilization
    });
  }

  const overallExpectedTurnout = totalEligibleVoters > 0 ? totalExpectedVotes / totalEligibleVoters : 0;
  
  // Calculate confidence interval
  const avgUncertainty = Array.from(coalitionForecasts.values())
    .reduce((sum, forecast) => sum + forecast.forecastUncertainty, 0) / coalitionForecasts.size;
  
  const lowerBound = Math.max(0.15, overallExpectedTurnout - avgUncertainty);
  const upperBound = Math.min(0.95, overallExpectedTurnout + avgUncertainty);

  return {
    expectedTurnoutRate: overallExpectedTurnout * 100, // Convert to percentage
    expectedTotalVotes: totalExpectedVotes,
    confidenceInterval: {
      lower: lowerBound * 100,
      upper: upperBound * 100,
      margin: avgUncertainty * 100
    },
    coalitionForecasts,
    forecastMetadata: {
      uncertaintyFactor,
      mobilizationVolatility,
      historicalBias,
      forecastAccuracy: 100 - (avgUncertainty * 100) // Rough accuracy estimate
    }
  };
};

/**
 * Get detailed turnout breakdown for analysis/display
 * @param {object} coalitionSoA - The coalition data structure  
 * @param {number} totalEligibleVoters - Total eligible voters
 * @returns {Array} Array of coalition turnout details sorted by impact
 */
export const getCoalitionTurnoutBreakdown = (coalitionSoA, totalEligibleVoters) => {
  const turnoutData = calculateCoalitionBasedTurnout(coalitionSoA, totalEligibleVoters);
  
  const breakdown = Array.from(turnoutData.coalitionTurnout.values())
    .sort((a, b) => b.actualVotes - a.actualVotes) // Sort by vote impact
    .map(coalition => ({
      name: coalition.coalitionName,
      populationShare: (coalition.coalitionSize * 100).toFixed(1) + '%',
      eligibleVoters: coalition.eligibleVoters.toLocaleString(),
      baseTurnout: (coalition.baseTurnoutRate * 100).toFixed(1) + '%',
      mobilization: (coalition.mobilization * 100).toFixed(1) + '%',
      mobilizationImpact: coalition.mobilizationEffect >= 0 ? 
        `+${(coalition.mobilizationEffect * 100).toFixed(1)}%` : 
        `${(coalition.mobilizationEffect * 100).toFixed(1)}%`,
      finalTurnout: (coalition.finalTurnoutRate * 100).toFixed(1) + '%',
      actualVotes: coalition.actualVotes.toLocaleString(),
      voteShare: ((coalition.actualVotes / turnoutData.totalActualVotes) * 100).toFixed(1) + '%'
    }));
  
  return {
    breakdown,
    summary: {
      totalEligibleVoters: turnoutData.totalEligibleVoters.toLocaleString(),
      totalActualVotes: turnoutData.totalActualVotes.toLocaleString(),
      overallTurnout: turnoutData.overallTurnoutRate.toFixed(1) + '%'
    }
  };
};

/**
 * Spatial aggregation system for cascading city → state → national effects
 */
export class CoalitionSpatialAggregator {
  constructor() {
    this.cityToStateMap = new Map();      // cityId -> stateId
    this.stateToNationalMap = new Map();  // stateId -> 'national'
    this.cityEffectCache = new Map();     // Cache city effects to avoid recalculation
    this.stateEffectCache = new Map();    // Cache state aggregations
    this.populationWeights = new Map();   // jurisdictionId -> population weight
  }

  /**
   * Register spatial hierarchy (cities belong to states, states to national)
   */
  registerSpatialHierarchy(cityToStateMapping, statePopulations, cityPopulations) {
    // Clear existing mappings
    this.cityToStateMap.clear();
    this.stateToNationalMap.clear();
    this.populationWeights.clear();

    // Register city-to-state mappings
    for (const [cityId, stateId] of Object.entries(cityToStateMapping)) {
      this.cityToStateMap.set(cityId, stateId);
      this.stateToNationalMap.set(stateId, 'national');
    }

    // Register population weights for aggregation
    let totalNationalPop = 0;
    for (const [stateId, population] of Object.entries(statePopulations)) {
      totalNationalPop += population;
      this.populationWeights.set(stateId, population);
    }

    for (const [cityId, population] of Object.entries(cityPopulations)) {
      this.populationWeights.set(cityId, population);
    }

    // Calculate state weights as fraction of national population
    for (const [stateId, population] of Object.entries(statePopulations)) {
      this.populationWeights.set(`${stateId}_weight`, population / totalNationalPop);
    }
  }

  /**
   * Process cascading effects from cities → states → national
   * Returns batched effects ready for application
   */
  processCascadingEffects(cityEvents, stateEvents, nationalEvents) {
    const batch = new CoalitionEffectBatch();
    const processedStates = new Set();

    // Step 1: Process all city-level events and aggregate to state level
    const stateAggregatedEffects = new Map();
    
    for (const cityEvent of cityEvents) {
      const stateId = this.cityToStateMap.get(cityEvent.jurisdictionId);
      if (!stateId) continue;

      const cityEffects = calculateEventCoalitionEffects(cityEvent, 'city');
      const cityWeight = this.getCityWeightInState(cityEvent.jurisdictionId, stateId);

      // Accumulate weighted effects for each state
      if (!stateAggregatedEffects.has(stateId)) {
        stateAggregatedEffects.set(stateId, new Map());
      }

      const stateEffects = stateAggregatedEffects.get(stateId);
      for (const [coalitionId, effect] of cityEffects) {
        if (!stateEffects.has(coalitionId)) {
          stateEffects.set(coalitionId, { mobilization: 0, satisfaction: 0, sources: [] });
        }
        
        const existing = stateEffects.get(coalitionId);
        existing.mobilization += effect.mobilization * cityWeight;
        existing.satisfaction += effect.satisfaction * cityWeight;
        existing.sources.push(`city_${cityEvent.jurisdictionId}_${cityEvent.type}`);
      }
    }

    // Step 2: Apply state-aggregated city effects + direct state events
    const nationalAggregatedEffects = new Map();
    
    for (const [stateId, stateEffectMap] of stateAggregatedEffects) {
      const stateWeight = this.populationWeights.get(`${stateId}_weight`) || 0.02;
      
      // Apply state-level aggregated effects from cities
      for (const [coalitionId, effect] of stateEffectMap) {
        batch.addMobilizationEffect(
          `${stateId}_${coalitionId}`, 
          effect.mobilization,
          `state_aggregate_${effect.sources.length}_cities`
        );

        // Accumulate for national aggregation
        if (!nationalAggregatedEffects.has(coalitionId)) {
          nationalAggregatedEffects.set(coalitionId, { mobilization: 0, satisfaction: 0 });
        }
        
        const nationalEffect = nationalAggregatedEffects.get(coalitionId);
        nationalEffect.mobilization += effect.mobilization * stateWeight;
        nationalEffect.satisfaction += effect.satisfaction * stateWeight;
      }

      processedStates.add(stateId);
    }

    // Step 3: Process direct state-level events
    for (const stateEvent of stateEvents) {
      const stateId = stateEvent.jurisdictionId;
      const stateEffects = calculateEventCoalitionEffects(stateEvent, 'state');
      const stateWeight = this.populationWeights.get(`${stateId}_weight`) || 0.02;

      for (const [coalitionId, effect] of stateEffects) {
        // Apply state-level effect
        batch.addMobilizationEffect(
          `${stateId}_${coalitionId}`,
          effect.mobilization,
          `state_direct_${stateEvent.type}`
        );

        // Accumulate for national aggregation
        if (!nationalAggregatedEffects.has(coalitionId)) {
          nationalAggregatedEffects.set(coalitionId, { mobilization: 0, satisfaction: 0 });
        }
        
        const nationalEffect = nationalAggregatedEffects.get(coalitionId);
        nationalEffect.mobilization += effect.mobilization * stateWeight;
        nationalEffect.satisfaction += effect.satisfaction * stateWeight;
      }
    }

    // Step 4: Apply national-level aggregated effects + direct national events
    for (const [coalitionId, aggregatedEffect] of nationalAggregatedEffects) {
      // Only apply significant aggregated effects
      if (Math.abs(aggregatedEffect.mobilization) > 0.001) {
        batch.addMobilizationEffect(
          `national_${coalitionId}`,
          aggregatedEffect.mobilization,
          'national_aggregate'
        );
      }
    }

    // Step 5: Process direct national events
    for (const nationalEvent of nationalEvents) {
      const nationalEffects = calculateEventCoalitionEffects(nationalEvent, 'national');
      
      for (const [coalitionId, effect] of nationalEffects) {
        batch.addMobilizationEffect(
          `national_${coalitionId}`,
          effect.mobilization,
          `national_direct_${nationalEvent.type}`
        );
      }
    }

    return batch;
  }

  /**
   * Calculate city's population weight within its state
   */
  getCityWeightInState(cityId, stateId) {
    const cityPop = this.populationWeights.get(cityId) || 100000; // Default city size
    const statePop = this.populationWeights.get(stateId) || 5000000; // Default state size
    return Math.min(0.5, cityPop / statePop); // Cap at 50% to avoid single city dominating state
  }

  /**
   * Get performance metrics for the aggregation system
   */
  getPerformanceMetrics() {
    return {
      cityMappings: this.cityToStateMap.size,
      stateMappings: this.stateToNationalMap.size,
      cachedCityEffects: this.cityEffectCache.size,
      cachedStateEffects: this.stateEffectCache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of the aggregator
   */
  estimateMemoryUsage() {
    // Rough estimate: each Map entry ≈ 50-100 bytes
    const totalEntries = this.cityToStateMap.size + 
                        this.stateToNationalMap.size + 
                        this.populationWeights.size +
                        this.cityEffectCache.size + 
                        this.stateEffectCache.size;
    return `~${Math.round(totalEntries * 75 / 1024)} KB`;
  }
}

/**
 * Performance monitoring and caching system for coalition updates
 */
export class CoalitionPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.updateHistory = [];
    this.maxHistorySize = 100;
    this.performanceThresholds = {
      updateLatency: 50,      // ms - warn if updates take longer
      memoryUsage: 10,        // MB - warn if memory usage exceeds
      batchSize: 1000         // events - warn if processing more events
    };
  }

  /**
   * Start monitoring an update operation
   */
  startOperation(operationType, metadata = {}) {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.set(operationId, {
      type: operationType,
      startTime: performance.now(),
      metadata,
      memoryBefore: this.getMemoryUsage(),
      warnings: []
    });
    
    return operationId;
  }

  /**
   * End monitoring and record results
   */
  endOperation(operationId, results = {}) {
    const metric = this.metrics.get(operationId);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    const memoryAfter = this.getMemoryUsage();

    const finalMetric = {
      ...metric,
      endTime,
      duration,
      memoryAfter,
      memoryDelta: memoryAfter - metric.memoryBefore,
      results
    };

    // Check for performance warnings
    this.checkPerformanceWarnings(finalMetric);

    // Add to history (keep only recent entries)
    this.updateHistory.push(finalMetric);
    if (this.updateHistory.length > this.maxHistorySize) {
      this.updateHistory.shift();
    }

    // Clean up current metrics
    this.metrics.delete(operationId);

    return finalMetric;
  }

  /**
   * Check for performance issues and add warnings
   */
  checkPerformanceWarnings(metric) {
    if (metric.duration > this.performanceThresholds.updateLatency) {
      metric.warnings.push(`Slow update: ${metric.duration.toFixed(2)}ms > ${this.performanceThresholds.updateLatency}ms threshold`);
    }

    if (metric.memoryDelta > this.performanceThresholds.memoryUsage * 1024 * 1024) {
      metric.warnings.push(`High memory usage: +${(metric.memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    }

    if (metric.results.eventsProcessed > this.performanceThresholds.batchSize) {
      metric.warnings.push(`Large batch size: ${metric.results.eventsProcessed} events > ${this.performanceThresholds.batchSize} threshold`);
    }
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    // Browser environment check
    if (typeof window !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    // Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    // Fallback
    return 0;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    if (this.updateHistory.length === 0) {
      return { message: 'No operations recorded' };
    }

    const durations = this.updateHistory.map(m => m.duration);
    const memoryDeltas = this.updateHistory.map(m => m.memoryDelta);
    
    return {
      totalOperations: this.updateHistory.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      averageMemoryDelta: memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length,
      warningsCount: this.updateHistory.reduce((sum, m) => sum + m.warnings.length, 0),
      recentWarnings: this.updateHistory
        .slice(-10)
        .flatMap(m => m.warnings)
        .slice(-5)
    };
  }

  /**
   * Clear performance history
   */
  clearHistory() {
    this.updateHistory = [];
    this.metrics.clear();
  }
}

/**
 * Global performance monitor instance
 */
const globalPerformanceMonitor = new CoalitionPerformanceMonitor();

/**
 * High-level function to process all coalition updates with cascading effects
 * Now includes performance monitoring and intelligent caching
 */
export const processCascadingCoalitionUpdates = (
  coalitionSoA, 
  cityEvents = [], 
  stateEvents = [], 
  nationalEvents = [],
  spatialMapping = null,
  options = {}
) => {
  const {
    enablePerformanceMonitoring = true,
    enableCaching = true,
    performanceMonitor = globalPerformanceMonitor
  } = options;

  let operationId = null;
  
  if (enablePerformanceMonitoring) {
    operationId = performanceMonitor.startOperation('cascading_coalition_update', {
      cityEventsCount: cityEvents.length,
      stateEventsCount: stateEvents.length,
      nationalEventsCount: nationalEvents.length,
      coalitionsCount: coalitionSoA.base.size
    });
  }

  // Use existing aggregator or create new one
  const aggregator = spatialMapping || new CoalitionSpatialAggregator();
  
  // Process all cascading effects
  const effectBatch = aggregator.processCascadingEffects(cityEvents, stateEvents, nationalEvents);
  
  // Apply all batched effects efficiently
  const applyResults = effectBatch.applyEffects(coalitionSoA);
  
  // Clean up
  effectBatch.clear();
  
  const totalDuration = performance.now() - (operationId ? performanceMonitor.metrics.get(operationId).startTime : Date.now());
  
  const results = {
    ...applyResults,
    totalDuration,
    eventsProcessed: cityEvents.length + stateEvents.length + nationalEvents.length,
    performanceMetrics: spatialMapping ? spatialMapping.getPerformanceMetrics() : null
  };

  if (enablePerformanceMonitoring && operationId) {
    const finalMetric = performanceMonitor.endOperation(operationId, results);
    results.performanceReport = finalMetric;
  }
  
  return results;
};

/**
 * Utility function to get global performance statistics
 */
export const getCoalitionSystemPerformanceStats = () => {
  return {
    summary: globalPerformanceMonitor.getPerformanceSummary(),
    cacheHitRates: {
      policyAlignment: policyAlignmentCache.size > 0 ? 'Active' : 'Empty',
      // Add other cache statistics here as needed
    },
    recommendations: generatePerformanceRecommendations(globalPerformanceMonitor.getPerformanceSummary())
  };
};

/**
 * Generate performance optimization recommendations
 */
const generatePerformanceRecommendations = (summary) => {
  const recommendations = [];
  
  if (summary.averageDuration > 100) {
    recommendations.push('Consider reducing batch sizes or implementing more aggressive caching');
  }
  
  if (summary.warningsCount > 10) {
    recommendations.push('High number of performance warnings - review event processing patterns');
  }
  
  if (summary.averageMemoryDelta > 5 * 1024 * 1024) { // 5MB
    recommendations.push('High memory usage detected - consider implementing periodic cleanup');
  }
  
  return recommendations.length > 0 ? recommendations : ['Performance looks good!'];
};

export default {
  createCoalitionSoA,
  generateCoalitions,
  calculateCoalitionPolling,
  updateCoalitionStates,
  getCoalitionPollingResults,
  aggregateCoalitionPolling,
  calculateIdeologicalDistance,
  calculateCoalitionBasedTurnout,
  calculateExpectedTurnout,
  getCoalitionTurnoutBreakdown,
  CoalitionEffectBatch,
  CoalitionSpatialAggregator,
  CoalitionPerformanceMonitor,
  calculateEventCoalitionEffects,
  calculatePolicyCoalitionEffects,
  processCascadingCoalitionUpdates,
  getCoalitionSystemPerformanceStats
};
