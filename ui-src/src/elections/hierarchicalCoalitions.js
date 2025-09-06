/**
 * Hierarchical Coalition System for Multi-Level Elections
 * Manages coalition generation and distribution across national, state, and county levels
 */

import { generateCoalitions } from "../General Scripts/CoalitionSystem.js";
import { distributeValueProportionally } from "../utils/core.js";
import { usaStates } from "../data/states/usaStates.js";
import { usaCounties } from "../data/states/adminRegions2/usaCounties.js";

/**
 * Generates hierarchical coalitions for different election types
 * @param {Object} electionSetup - Current election setup with parties, regions, etc.
 * @param {Array} electionInstances - Array of election instances to generate coalitions for
 * @returns {Object} Hierarchical coalition systems for each election
 */
export function generateHierarchicalCoalitions(electionSetup, electionInstances) {
  const hierarchicalCoalitions = {
    national: null,
    state: new Map(),
    county: new Map(),
    district: new Map(),
    electionSpecific: new Map() // Maps election ID to its coalition system
  };

  // Process each election instance
  electionInstances.forEach(instance => {
    const electionType = instance.electionTypeId;
    const electionId = instance.id;
    
    if (electionType.includes('president')) {
      // Presidential election - national level with state/county distribution
      hierarchicalCoalitions.national = generateNationalCoalitions(electionSetup);
      const stateDistributions = distributeCoalitionsToStates(
        hierarchicalCoalitions.national,
        electionSetup.selectedCountryId
      );
      
      // Generate county-level distributions for each state
      const countyDistributions = new Map();
      for (const [stateId, stateCoalitions] of stateDistributions) {
        const stateCountyDistributions = distributeCoalitionsToCounties(stateCoalitions, stateId);
        countyDistributions.set(stateId, stateCountyDistributions);
      }
      
      hierarchicalCoalitions.electionSpecific.set(electionId, {
        level: 'national',
        baseCoalitions: hierarchicalCoalitions.national,
        stateDistributions: stateDistributions,
        countyDistributions: countyDistributions // Add 3rd tier
      });
    } else if (electionType.includes('governor')) {
      // Governor election - state level with county distribution
      const stateId = electionSetup.selectedRegionId;
      if (!hierarchicalCoalitions.state.has(stateId)) {
        hierarchicalCoalitions.state.set(stateId, generateStateCoalitions(electionSetup, stateId));
      }
      
      const stateCoalitions = hierarchicalCoalitions.state.get(stateId);
      hierarchicalCoalitions.electionSpecific.set(electionId, {
        level: 'state',
        baseCoalitions: stateCoalitions,
        countyDistributions: distributeCoalitionsToCounties(
          stateCoalitions,
          stateId
        )
      });
    } else if (electionType.includes('house') || electionType.includes('senate')) {
      // Congressional elections - district level
      const districtId = instance.districtNumber ? 
        `${electionSetup.selectedRegionId}_district_${instance.districtNumber}` : 
        electionSetup.selectedRegionId;
      
      if (!hierarchicalCoalitions.district.has(districtId)) {
        hierarchicalCoalitions.district.set(districtId, generateDistrictCoalitions(
          electionSetup, 
          districtId,
          instance.districtNumber
        ));
      }
      
      hierarchicalCoalitions.electionSpecific.set(electionId, {
        level: 'district',
        baseCoalitions: hierarchicalCoalitions.district.get(districtId)
      });
    } else if (electionType.includes('mayor')) {
      // Mayor election - city/county level
      const cityId = electionSetup.selectedCityId || electionSetup.customCity?.id;
      if (cityId && !hierarchicalCoalitions.county.has(cityId)) {
        hierarchicalCoalitions.county.set(cityId, generateCityCoalitions(electionSetup, cityId));
      }
      
      hierarchicalCoalitions.electionSpecific.set(electionId, {
        level: 'city',
        baseCoalitions: hierarchicalCoalitions.county.get(cityId)
      });
    }
  });

  return hierarchicalCoalitions;
}

/**
 * Generate national-level coalitions
 */
function generateNationalCoalitions(electionSetup) {
  const nationalPopulation = electionSetup.totalPopulation;
  
  // Default demographics for national level
  const defaultDemographics = {
    ageDistribution: { young: 25, adult: 50, senior: 25 },
    urbanization: 60,
    educationLevel: { highSchool: 30, college: 45, graduate: 25 },
    incomeLevel: { low: 25, middle: 50, high: 25 },
    occupation: { whiteCollar: 40, blueCollar: 35, service: 25 }
  };

  const defaultElectorateProfile = {
    economic_policy: 0,
    social_policy: 0,
    foreign_policy: 0,
    environmental_policy: 0,
    civil_liberties: 0
  };
  
  // Generate base coalition system
  const coalitionSystem = generateCoalitions(
    defaultElectorateProfile,
    defaultDemographics,
    electionSetup.parties
  );
  
  return coalitionSystem;
}

/**
 * Generate state-level coalitions
 */
function generateStateCoalitions(electionSetup, stateId) {
  // Find state data
  const stateData = usaStates.find(s => s.id === stateId);
  if (!stateData) return null;
  
  // Calculate state population based on weight
  const totalUSWeight = usaStates.reduce((sum, s) => sum + s.populationWeight, 0);
  const statePopulation = Math.round(
    (stateData.populationWeight / totalUSWeight) * electionSetup.totalPopulation
  );
  
  // State-specific demographics (could be customized per state)
  const stateDemographics = {
    ageDistribution: { young: 25, adult: 50, senior: 25 },
    urbanization: stateData.urbanization || 60,
    educationLevel: { highSchool: 30, college: 45, graduate: 25 },
    incomeLevel: { low: 25, middle: 50, high: 25 },
    occupation: { whiteCollar: 40, blueCollar: 35, service: 25 }
  };

  const stateElectorateProfile = {
    economic_policy: stateData.economicLean || 0,
    social_policy: stateData.socialLean || 0,
    foreign_policy: 0,
    environmental_policy: 0,
    civil_liberties: 0
  };
  
  // Generate coalitions with state-specific characteristics
  const coalitionSystem = generateCoalitions(
    stateElectorateProfile,
    stateDemographics,
    electionSetup.parties
  );
  
  return coalitionSystem;
}

/**
 * Generate district-level coalitions
 */
function generateDistrictCoalitions(electionSetup, districtId, districtNumber) {
  // Estimate district population (congressional districts are roughly equal)
  const numDistricts = 435; // US House of Representatives
  const districtPopulation = Math.round(electionSetup.totalPopulation / numDistricts);
  
  // District demographics (simplified)
  const districtDemographics = {
    ageDistribution: { young: 25, adult: 50, senior: 25 },
    urbanization: 50, // Average district urbanization
    educationLevel: { highSchool: 30, college: 45, graduate: 25 },
    incomeLevel: { low: 25, middle: 50, high: 25 },
    occupation: { whiteCollar: 40, blueCollar: 35, service: 25 }
  };

  const districtElectorateProfile = {
    economic_policy: (Math.random() - 0.5) * 2, // Random district lean
    social_policy: (Math.random() - 0.5) * 2,
    foreign_policy: 0,
    environmental_policy: 0,
    civil_liberties: 0
  };
  
  const coalitionSystem = generateCoalitions(
    districtElectorateProfile,
    districtDemographics,
    electionSetup.parties
  );
  
  return coalitionSystem;
}

/**
 * Generate city/county-level coalitions
 */
function generateCityCoalitions(electionSetup, cityId) {
  const cityPopulation = electionSetup.customCity?.population || 
                         electionSetup.totalPopulation / 10; // Default to 10% if not specified
  
  // City demographics
  const cityDemographics = {
    ageDistribution: { young: 30, adult: 50, senior: 20 }, // Cities tend to be younger
    urbanization: 90, // Cities are highly urbanized
    educationLevel: { highSchool: 20, college: 50, graduate: 30 },
    incomeLevel: { low: 20, middle: 50, high: 30 },
    occupation: { whiteCollar: 60, blueCollar: 25, service: 15 }
  };

  const cityElectorateProfile = {
    economic_policy: 0,
    social_policy: 0.5, // Cities tend to be more socially liberal
    foreign_policy: 0,
    environmental_policy: 0.3,
    civil_liberties: 0.4
  };
  
  const coalitionSystem = generateCoalitions(
    cityElectorateProfile,
    cityDemographics,
    electionSetup.parties
  );
  
  return coalitionSystem;
}

/**
 * Distribute national coalitions to states with regional variations
 */
function distributeCoalitionsToStates(nationalCoalitions, countryId) {
  if (countryId !== 'USA') return new Map(); // Only USA implemented for now
  
  const stateDistributions = new Map();
  
  usaStates.forEach(state => {
    const stateCoalitions = applyRegionalVariation(
      nationalCoalitions,
      state,
      'state'
    );
    stateDistributions.set(state.id, stateCoalitions);
  });
  
  return stateDistributions;
}

/**
 * Distribute state coalitions to counties with local variations
 */
function distributeCoalitionsToCounties(stateCoalitions, stateId) {
  const countyDistributions = new Map();
  
  // Get all counties for this state
  const stateCounties = usaCounties.filter(county => county.stateId === stateId);
  
  stateCounties.forEach(county => {
    const countyCoalitions = applyRegionalVariation(
      stateCoalitions,
      county,
      'county'
    );
    countyDistributions.set(county.id, countyCoalitions);
  });
  
  return countyDistributions;
}

/**
 * Apply regional variations to coalition distributions
 */
function applyRegionalVariation(baseCoalitions, region, level) {
  if (!baseCoalitions || !baseCoalitions.base) return baseCoalitions;
  
  // Clone the base coalition structure
  const variedCoalitions = {
    base: new Map(baseCoalitions.base),
    demographics: new Map(baseCoalitions.demographics),
    ideology: new Map(baseCoalitions.ideology),
    partyAlignment: new Map(baseCoalitions.partyAlignment),
    policyStances: new Map(baseCoalitions.policyStances),
    state: new Map(baseCoalitions.state || new Map()), // Include the state Map for compatibility
    mobilization: new Map(baseCoalitions.mobilization),
    supportBase: new Map(baseCoalitions.supportBase),
    polling: new Map(baseCoalitions.polling)
  };
  
  // Apply variations based on region characteristics
  const populationWeight = region.populationWeight || 1;
  const urbanizationFactor = Math.min(1, populationWeight / 100); // Rough urbanization estimate
  
  // Adjust support bases and mobilization based on regional factors
  for (const [coalitionId, supportBase] of variedCoalitions.supportBase) {
    // Apply variation based on urbanization and random local factors
    const variation = (Math.random() - 0.5) * 0.2; // ±10% random variation
    const urbanAdjustment = (urbanizationFactor - 0.5) * 0.1; // Urban/rural adjustment
    
    const newSupportBase = Math.max(0, Math.min(1, 
      supportBase + variation + urbanAdjustment
    ));
    
    variedCoalitions.supportBase.set(coalitionId, newSupportBase);
    
    // Also vary mobilization slightly
    const currentMobilization = variedCoalitions.mobilization.get(coalitionId) || 50;
    const mobilizationVariation = (Math.random() - 0.5) * 20; // ±10% variation
    variedCoalitions.mobilization.set(coalitionId, 
      Math.max(0, Math.min(100, currentMobilization + mobilizationVariation))
    );
  }
  
  // Normalize support bases to sum to 1
  normalizeSupportBases(variedCoalitions.supportBase);
  
  return variedCoalitions;
}

/**
 * Normalize support bases to ensure they sum to 1
 */
function normalizeSupportBases(supportBaseMap) {
  const total = Array.from(supportBaseMap.values()).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    for (const [id, value] of supportBaseMap) {
      supportBaseMap.set(id, value / total);
    }
  }
}

/**
 * Update coalition at county level and cascade changes up to state
 */
export function updateCountyCoalition(
  hierarchicalCoalitions, 
  stateId, 
  countyId, 
  coalitionId, 
  changes
) {
  // Get the county-level coalitions
  const electionData = Array.from(hierarchicalCoalitions.electionSpecific.values())
    .find(data => data.level === 'state' && data.countyDistributions?.has(countyId));
  
  if (!electionData) return hierarchicalCoalitions;
  
  // Apply changes to county coalition
  const countyCoalitions = electionData.countyDistributions.get(countyId);
  if (!countyCoalitions) return hierarchicalCoalitions;
  
  // Update the specific coalition properties
  if (changes.mobilization !== undefined) {
    countyCoalitions.mobilization.set(coalitionId, changes.mobilization);
  }
  if (changes.supportBase !== undefined) {
    countyCoalitions.supportBase.set(coalitionId, changes.supportBase);
    // Normalize after changing support base
    normalizeSupportBases(countyCoalitions.supportBase);
  }
  
  // Cascade changes up to state level
  cascadeCoalitionChanges(electionData, stateId);
  
  return hierarchicalCoalitions;
}

/**
 * Cascade coalition changes from counties up to state level
 */
function cascadeCoalitionChanges(electionData, stateId) {
  if (!electionData.countyDistributions) return;
  
  // Get all counties for this state
  const stateCounties = usaCounties.filter(county => county.stateId === stateId);
  
  // Calculate weighted average of county coalitions based on population
  const aggregatedSupport = new Map();
  const aggregatedMobilization = new Map();
  let totalWeight = 0;
  
  stateCounties.forEach(county => {
    const countyCoalitions = electionData.countyDistributions.get(county.id);
    if (!countyCoalitions) return;
    
    const weight = county.populationWeight || 1;
    totalWeight += weight;
    
    // Aggregate support bases
    for (const [coalitionId, support] of countyCoalitions.supportBase) {
      const current = aggregatedSupport.get(coalitionId) || 0;
      aggregatedSupport.set(coalitionId, current + support * weight);
    }
    
    // Aggregate mobilization
    for (const [coalitionId, mobilization] of countyCoalitions.mobilization) {
      const current = aggregatedMobilization.get(coalitionId) || 0;
      aggregatedMobilization.set(coalitionId, current + mobilization * weight);
    }
  });
  
  // Update state-level coalitions with aggregated values
  if (totalWeight > 0 && electionData.baseCoalitions) {
    for (const [coalitionId, weightedSupport] of aggregatedSupport) {
      electionData.baseCoalitions.supportBase.set(coalitionId, weightedSupport / totalWeight);
    }
    for (const [coalitionId, weightedMobilization] of aggregatedMobilization) {
      electionData.baseCoalitions.mobilization.set(coalitionId, weightedMobilization / totalWeight);
    }
    
    // Normalize state-level support bases
    normalizeSupportBases(electionData.baseCoalitions.supportBase);
  }
}

/**
 * Get coalition system for a specific election
 */
export function getCoalitionsForElection(hierarchicalCoalitions, electionId) {
  const electionData = hierarchicalCoalitions.electionSpecific.get(electionId);
  if (!electionData) return null;
  
  // Return the appropriate coalition level for this election
  if (electionData.level === 'national' && electionData.stateDistributions) {
    // For national elections, aggregate state-level data
    return aggregateStateCoalitions(electionData.stateDistributions);
  } else if (electionData.level === 'state' && electionData.countyDistributions) {
    // For state elections, return the state-level base coalitions (already aggregated from counties)
    return electionData.baseCoalitions;
  } else {
    // For district/city elections, return base coalitions
    return electionData.baseCoalitions;
  }
}

/**
 * Aggregate state coalitions for national view
 */
function aggregateStateCoalitions(stateDistributions) {
  // Implementation would aggregate all state coalitions weighted by population
  // For now, return the first state's coalitions as a placeholder
  const firstState = stateDistributions.values().next().value;
  return firstState || null;
}

/**
 * Aggregate county coalitions for state view (unused - state coalitions are maintained separately)
 */