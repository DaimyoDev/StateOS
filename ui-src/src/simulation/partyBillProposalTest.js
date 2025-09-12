// partyBillProposalTest.js
// Test functions for the party-based bill proposal system

import { generatePartyBillProposal } from './partyBillProposal.js';
import { batchProcessCityProposals, createLegislationActivitySummary } from './cityLegislationManager.js';

// Test data
const testParty = {
  id: 'conservative_party',
  name: 'Conservative Party',
  ideologyScores: {
    economic: 0.7,  // Conservative economically
    personal_liberty: -0.2,  // Somewhat authoritarian
    state_intervention_scope: -0.3,  // Limited government
    societal_focus: -0.1  // Individual focus
  }
};

const testLiberalParty = {
  id: 'liberal_party',
  name: 'Liberal Party',
  ideologyScores: {
    economic: -0.6,  // Liberal economically
    personal_liberty: 0.5,  // Pro-liberty
    state_intervention_scope: 0.7,  // Pro-government programs
    societal_focus: 0.4  // Community focus
  }
};

const testCityStats = {
  population: 250000,
  budget: {
    balance: -500000, // In debt
    totalAnnualIncome: 50000000,
    expenseAllocations: {
      publicEducation: 8000000,
      infrastructure: 5000000,
      publicHealthServices: 6000000,
      policeDepartment: 7000000
    }
  },
  unemploymentRate: 8.2,
  crimeRatePer1000: 65,
  economicOutlook: 'declining',
  educationQuality: 'Poor',
  infrastructureState: 'Average',
  publicSafetyRating: 'Poor'
};

const testPolicyDefs = [
  {
    id: 'increase_education_funding',
    name: 'Increase Education Funding',
    area: 'education',
    isParameterized: true,
    parameterDetails: {
      key: 'amount',
      targetBudgetLine: 'publicEducation',
      min: 5000000,
      max: 15000000,
      step: 100000
    },
    tags: ['education', 'public_service'],
    baseSupport: {
      'Conservative': -0.2,
      'Liberal': 0.8,
      'Centrist': 0.3
    },
    cost: { budget: 2000000 }
  },
  {
    id: 'tax_cut_initiative',
    name: 'Tax Reduction Initiative',
    area: 'economic',
    isParameterized: true,
    parameterDetails: {
      key: 'percentage',
      targetTaxRate: 'propertyTax',
      min: 0.5,
      max: 2.0,
      step: 0.1
    },
    tags: ['tax_cut', 'economic'],
    baseSupport: {
      'Conservative': 0.9,
      'Liberal': -0.4,
      'Centrist': 0.1
    },
    cost: { budget: -1500000 }
  },
  {
    id: 'public_safety_enhancement',
    name: 'Public Safety Enhancement',
    area: 'public_safety',
    isParameterized: true,
    parameterDetails: {
      key: 'amount',
      targetBudgetLine: 'policeDepartment',
      min: 5000000,
      max: 12000000,
      step: 250000
    },
    tags: ['public_safety', 'law_enforcement'],
    baseSupport: {
      'Conservative': 0.7,
      'Liberal': 0.2,
      'Centrist': 0.5
    },
    cost: { budget: 1800000 }
  }
];

const testCity = {
  id: 'test_city',
  name: 'Test City',
  stats: testCityStats,
  activeLegislation: [],
  proposedBills: [],
  governmentOffices: {
    executive: [{
      holder: { partyId: 'conservative_party' }
    }],
    legislative: [{
      members: [
        { partyId: 'conservative_party' },
        { partyId: 'conservative_party' },
        { partyId: 'liberal_party' },
        { partyId: 'liberal_party' },
        { partyId: 'independent' }
      ]
    }]
  }
};

const testDate = {
  year: 2025,
  month: 6,
  day: 15
};

export function testPartyBillProposal() {
  console.log('=== Testing Party-Based Bill Proposal System ===');
  
  // Test 1: Individual party proposal generation
  console.log('\n1. Testing individual party proposal generation:');
  
  const conservativeProposal = generatePartyBillProposal(
    testParty,
    testCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  const liberalProposal = generatePartyBillProposal(
    testLiberalParty,
    testCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  console.log('Conservative Party Proposal:', conservativeProposal);
  console.log('Liberal Party Proposal:', liberalProposal);
  
  // Test 2: Batch city processing
  console.log('\n2. Testing batch city processing:');
  
  const allCities = [testCity];
  const allParties = [testParty, testLiberalParty];
  const playerCityId = null; // No player city, so all cities are processed
  
  const batchResults = batchProcessCityProposals(
    allCities,
    playerCityId,
    allParties,
    testPolicyDefs,
    testDate
  );
  
  console.log('Batch Processing Results:', batchResults);
  
  // Test 3: Activity summary
  console.log('\n3. Testing activity summary generation:');
  
  const activitySummary = createLegislationActivitySummary(batchResults, {});
  console.log('Activity Summary:', activitySummary);
  
  // Test 4: Policy alignment analysis
  console.log('\n4. Testing policy alignment for different parties:');
  
  testPolicyDefs.forEach(policy => {
    console.log(`\nPolicy: ${policy.name}`);
    console.log('Conservative alignment: Would likely', 
      (policy.baseSupport?.Conservative || 0) > 0 ? 'SUPPORT' : 'OPPOSE');
    console.log('Liberal alignment: Would likely', 
      (policy.baseSupport?.Liberal || 0) > 0 ? 'SUPPORT' : 'OPPOSE');
  });
  
  console.log('\n=== Test Complete ===');
  
  return {
    individualProposals: { conservative: conservativeProposal, liberal: liberalProposal },
    batchResults,
    activitySummary
  };
}

// Test specific scenarios
export function testCrisisScenario() {
  console.log('\n=== Testing Crisis Scenario ===');
  
  const crisisCityStats = {
    ...testCityStats,
    budget: {
      ...testCityStats.budget,
      balance: -5000000, // Severe debt
    },
    unemploymentRate: 12.5, // High unemployment
    crimeRatePer1000: 85, // High crime
    economicOutlook: 'recession'
  };
  
  const crisisProposal = generatePartyBillProposal(
    testParty,
    crisisCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  console.log('Crisis Scenario - Conservative Proposal:', crisisProposal);
  
  const liberalCrisisProposal = generatePartyBillProposal(
    testLiberalParty,
    crisisCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  console.log('Crisis Scenario - Liberal Proposal:', liberalCrisisProposal);
  
  return { conservative: crisisProposal, liberal: liberalCrisisProposal };
}

export function testSurplusScenario() {
  console.log('\n=== Testing Surplus Scenario ===');
  
  const surplusCityStats = {
    ...testCityStats,
    budget: {
      ...testCityStats.budget,
      balance: 8000000, // Large surplus
    },
    unemploymentRate: 4.2, // Low unemployment
    crimeRatePer1000: 25, // Low crime
    economicOutlook: 'booming'
  };
  
  const surplusProposal = generatePartyBillProposal(
    testParty,
    surplusCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  console.log('Surplus Scenario - Conservative Proposal:', surplusProposal);
  
  const liberalSurplusProposal = generatePartyBillProposal(
    testLiberalParty,
    surplusCityStats,
    testPolicyDefs,
    [],
    [],
    testDate
  );
  
  console.log('Surplus Scenario - Liberal Proposal:', liberalSurplusProposal);
  
  return { conservative: surplusProposal, liberal: liberalSurplusProposal };
}

// Expose for browser console testing
if (process.env.NODE_ENV === 'development') {
  window.testPartyBillSystem = { 
    testPartyBillProposal, 
    testCrisisScenario, 
    testSurplusScenario 
  };
}