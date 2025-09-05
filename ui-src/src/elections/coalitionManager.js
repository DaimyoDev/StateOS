/**
 * Coalition management utilities for election simulation
 */

/**
 * Updates mobilization level for a specific coalition
 */
export const updateCoalitionMobilization = (coalitionSoA, coalitionId, newMobilization) => {
  // Initialize mobilization map if it doesn't exist
  if (!coalitionSoA.mobilization) {
    coalitionSoA.mobilization = new Map();
  }
  
  const updatedCoalitionSoA = {
    ...coalitionSoA,
    mobilization: new Map(coalitionSoA.mobilization)
  };
  updatedCoalitionSoA.mobilization.set(coalitionId, parseFloat(newMobilization));
  return updatedCoalitionSoA;
};

/**
 * Converts coalition SoA structure to array format for UI display
 */
export const convertCoalitionSoAToArray = (coalitionSoA) => {
  if (!coalitionSoA || !coalitionSoA.base) {
    return [];
  }

  const coalitionData = [];
  for (const [coalitionId, coalition] of coalitionSoA.base) {
    coalitionData.push({
      id: coalitionId,
      ...coalition,
      demographics: coalitionSoA.demographics?.get(coalitionId) || {},
      ideology: coalitionSoA.ideology?.get(coalitionId) || '',
      partyAlignment: coalitionSoA.partyAlignment?.get(coalitionId) || new Map(),
      policyStances: coalitionSoA.policyStances?.get(coalitionId) || new Map(),
      mobilization: coalitionSoA.mobilization?.get(coalitionId) || 50,
      supportBase: coalitionSoA.supportBase?.get(coalitionId) || 0
    });
  }
  return coalitionData;
};

/**
 * Gets party alignment data for display
 */
export const getPartyAlignmentForCoalition = (coalition, parties) => {
  if (!coalition.partyAlignment) return [];
  
  return Array.from(coalition.partyAlignment.entries())
    .map(([partyId, alignment]) => {
      const party = parties.find(p => p.id === partyId);
      return party ? {
        partyId,
        partyName: party.name,
        partyColor: party.color,
        alignment: alignment * 100
      } : null;
    })
    .filter(Boolean);
};

/**
 * Calculates coalition summary statistics
 */
export const calculateCoalitionSummary = (coalitionSoA) => {
  if (!coalitionSoA) {
    return {
      totalCoalitions: 0,
      averageMobilization: 0,
      totalSupportBase: 0
    };
  }

  const coalitions = Array.from(coalitionSoA.coalitions.values());
  const mobilizationValues = Array.from(coalitionSoA.mobilization?.values() || []);
  const supportBaseValues = Array.from(coalitionSoA.supportBase?.values() || []);

  return {
    totalCoalitions: coalitions.length,
    averageMobilization: mobilizationValues.length > 0 
      ? mobilizationValues.reduce((sum, val) => sum + val, 0) / mobilizationValues.length 
      : 0,
    totalSupportBase: supportBaseValues.reduce((sum, val) => sum + val, 0)
  };
};