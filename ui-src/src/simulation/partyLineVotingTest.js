// partyLineVotingTest.js
// Simple test for the party-line voting system

import { calculatePartyLineVote, calculateCityPartyLineVotes } from './partyLineVoting.js';

// Test data
const testParty = {
  id: 'test_party',
  name: 'Test Party',
  ideologyScores: {
    economic: 0.7,  // Conservative (positive = more conservative)
    personal_liberty: -0.3,  // More authoritarian
    state_intervention_scope: 0.5,  // Moderate interventionist
    societal_focus: -0.2  // Individual focus
  }
};

const testBill = {
  id: 'test_bill',
  name: 'Infrastructure Investment Act',
  category: 'infrastructure',
  budgetaryImpact: 50000000,  // $50M spending
  policyImpacts: {
    'infrastructure_spending': 0.8,
    'fiscal_responsibility': -0.3
  }
};

const testCityStats = {
  population: 250000,
  unemploymentRate: 6.5,
  economicOutlook: 'moderate growth'
};

// Test council members with different parties
const testCouncilMembers = [
  { id: 'member1', partyId: 'conservative', isPlayer: false },
  { id: 'member2', partyId: 'liberal', isPlayer: false },
  { id: 'member3', partyId: 'conservative', isPlayer: false },
  { id: 'member4', partyId: 'independent', isPlayer: false },
  { id: 'player', partyId: 'liberal', isPlayer: true }  // Player - should be skipped
];

const testParties = [
  {
    id: 'conservative',
    name: 'Conservative Party',
    ideologyScores: {
      economic: 0.8,
      personal_liberty: -0.2,
      state_intervention_scope: -0.4,
      societal_focus: -0.1
    }
  },
  {
    id: 'liberal',
    name: 'Liberal Party', 
    ideologyScores: {
      economic: -0.6,
      personal_liberty: 0.7,
      state_intervention_scope: 0.8,
      societal_focus: 0.5
    }
  }
];

export function testPartyLineVoting() {
  console.log('=== Testing City Metric-Driven Party-Line Voting ===');
  
  // Test 1: Normal city conditions
  console.log('\n1. Testing normal city conditions:');
  const normalVote = calculatePartyLineVote(testParty, testBill, testCityStats);
  console.log(`${testParty.name} votes: ${normalVote} (normal conditions)`);
  
  // Test 2: Financial crisis city
  console.log('\n2. Testing financial crisis conditions:');
  const crisisCityStats = {
    ...testCityStats,
    budget: {
      ...testCityStats.budget,
      balance: -8000000, // Severe debt crisis
    },
    unemploymentRate: 12.5,
    economicOutlook: 'recession'
  };
  
  const crisisVote = calculatePartyLineVote(testParty, testBill, crisisCityStats);
  console.log(`${testParty.name} votes: ${crisisVote} (financial crisis)`);
  
  // Test 3: Surplus city conditions
  console.log('\n3. Testing surplus conditions:');
  const surplusCityStats = {
    ...testCityStats,
    budget: {
      ...testCityStats.budget,
      balance: 12000000, // Large surplus
    },
    unemploymentRate: 3.2,
    crimeRatePer1000: 25,
    economicOutlook: 'booming'
  };
  
  const surplusVote = calculatePartyLineVote(testParty, testBill, surplusCityStats);
  console.log(`${testParty.name} votes: ${surplusVote} (surplus conditions)`);
  
  // Test 4: High crime city
  console.log('\n4. Testing high crime conditions:');
  const highCrimeCityStats = {
    ...testCityStats,
    crimeRatePer1000: 85,
    publicSafetyRating: 'Very Poor'
  };
  
  const policeBill = {
    ...testBill,
    category: 'public_safety',
    tags: ['police', 'public_safety'],
    budgetaryImpact: 2000000
  };
  
  const crimeVote = calculatePartyLineVote(testParty, policeBill, highCrimeCityStats);
  console.log(`${testParty.name} votes: ${crimeVote} on police bill (high crime)`);
  
  // Test 5: Compare different parties on same bill
  console.log('\n5. Testing different party responses to same crisis:');
  
  const conservativeParty = {
    id: 'conservative',
    name: 'Conservative Party',
    ideologyScores: { economic: 0.7, personal_liberty: -0.2, state_intervention_scope: -0.3 }
  };
  
  const liberalParty = {
    id: 'liberal', 
    name: 'Liberal Party',
    ideologyScores: { economic: -0.6, personal_liberty: 0.5, state_intervention_scope: 0.7 }
  };
  
  const spendingBill = {
    ...testBill,
    category: 'social',
    budgetaryImpact: 5000000
  };
  
  const conservativeVote = calculatePartyLineVote(conservativeParty, spendingBill, crisisCityStats);
  const liberalVote = calculatePartyLineVote(liberalParty, spendingBill, crisisCityStats);
  
  console.log(`Crisis Response to Social Spending Bill:`);
  console.log(`  Conservative Party: ${conservativeVote}`);
  console.log(`  Liberal Party: ${liberalVote}`);
  
  // Test 6: Batch city voting with different conditions
  console.log('\n6. Testing batch voting with metric variations:');
  const votes = calculateCityPartyLineVotes(testCouncilMembers, testBill, testCityStats, testParties);
  console.log('Standard conditions votes:', votes);
  
  const crisisVotes = calculateCityPartyLineVotes(testCouncilMembers, testBill, crisisCityStats, testParties);
  console.log('Crisis conditions votes:', crisisVotes);
  
  // Analyze how city conditions changed voting patterns
  console.log('\n7. Vote pattern analysis:');
  const yeaVotesNormal = Object.values(votes).filter(v => v === 'yea').length;
  const yeaVotesCrisis = Object.values(crisisVotes).filter(v => v === 'yea').length;
  
  console.log(`Normal conditions: ${yeaVotesNormal}/${Object.keys(votes).length} yea votes`);
  console.log(`Crisis conditions: ${yeaVotesCrisis}/${Object.keys(crisisVotes).length} yea votes`);
  console.log(`City metrics changed ${Math.abs(yeaVotesNormal - yeaVotesCrisis)} votes`);
  
  console.log('\n=== City-Metric Voting Test Complete ===');
  
  return { 
    normalVotes: votes, 
    crisisVotes, 
    individualTests: { normalVote, crisisVote, surplusVote, crimeVote }
  };
}