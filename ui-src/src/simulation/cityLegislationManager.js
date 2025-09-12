// cityLegislationManager.js
// Manages legislation proposals and processing for multiple cities efficiently

import { generatePartyBillProposal } from './partyBillProposal.js';
import { calculateCityPartyLineVotes } from './partyLineVoting.js';

/**
 * Batch process legislation proposals for all non-player cities
 * @param {Array} allCities - All cities in the campaign
 * @param {Object} playerCityId - The player's current city ID
 * @param {Array} allParties - All parties in the campaign
 * @param {Array} allPolicyDefs - All available policy definitions
 * @param {Object} currentDate - Current game date
 * @returns {Object} New proposals by city ID
 */
export function batchProcessCityProposals(allCities, playerCityId, allParties, allPolicyDefs, currentDate) {
  const newProposals = {};
  const startTime = performance.now();
  
  console.log(`[CityLegislationManager] Processing legislation for ${allCities.length} cities...`);
  
  // Process each non-player city
  allCities.forEach(city => {
    if (city.id === playerCityId) {
      // Skip player city - handled by individual AI system
      return;
    }
    
    try {
      const cityProposals = processCityProposals(city, allParties, allPolicyDefs, currentDate);
      if (cityProposals.length > 0) {
        newProposals[city.id] = cityProposals;
      }
    } catch (error) {
      console.warn(`[CityLegislationManager] Error processing city ${city.name}:`, error);
    }
  });
  
  const endTime = performance.now();
  const totalProposals = Object.values(newProposals).reduce((sum, proposals) => sum + proposals.length, 0);
  
  console.log(`[CityLegislationManager] Generated ${totalProposals} proposals across ${Object.keys(newProposals).length} cities in ${(endTime - startTime).toFixed(2)}ms`);
  
  return newProposals;
}

/**
 * Process proposals for a single city
 */
function processCityProposals(city, allParties, allPolicyDefs, currentDate) {
  const proposals = [];
  
  // Get city's current legislation state (simplified - would need real data in production)
  const activeLegislation = city.activeLegislation || [];
  const proposedLegislation = city.proposedBills || [];
  
  // Get parties represented in this city
  const cityParties = getCityParties(city, allParties);
  
  // Each party has a chance to propose legislation
  cityParties.forEach(party => {
    // Limit to 1 proposal per party per month to avoid spam
    if (hasPartyProposedRecently(party, city, currentDate)) {
      return;
    }
    
    const proposal = generatePartyBillProposal(
      party,
      city.stats,
      allPolicyDefs,
      activeLegislation,
      proposedLegislation,
      currentDate
    );
    
    if (proposal) {
      // Add additional metadata for city-level bill
      const cityBill = {
        ...proposal,
        id: generateBillId(city.id, party.id, currentDate),
        name: generateBillName(proposal.theme, party.name, city.name),
        cityId: city.id,
        cityName: city.name,
        status: 'proposed',
        level: 'city'
      };
      
      proposals.push(cityBill);
    }
  });
  
  return proposals;
}

/**
 * Get parties that have representation in a city
 */
function getCityParties(city, allParties) {
  // Get parties from city council members
  const representedPartyIds = new Set();
  
  // Extract party IDs from city government
  const cityGovernment = city.governmentOffices || {};
  if (cityGovernment.executive) {
    cityGovernment.executive.forEach(office => {
      if (office.holder?.partyId) {
        representedPartyIds.add(office.holder.partyId);
      }
    });
  }
  
  if (cityGovernment.legislative) {
    cityGovernment.legislative.forEach(office => {
      if (office.members) {
        office.members.forEach(member => {
          if (member.partyId) {
            representedPartyIds.add(member.partyId);
          }
        });
      } else if (office.holder?.partyId) {
        representedPartyIds.add(office.holder.partyId);
      }
    });
  }
  
  // Return party objects for represented parties
  return allParties.filter(party => representedPartyIds.has(party.id));
}

/**
 * Check if party has proposed legislation recently (to prevent spam)
 */
function hasPartyProposedRecently(party, city, currentDate) {
  // Simplified check - in production, you'd check actual proposal history
  // For now, use a random factor to simulate realistic proposal frequency
  
  const proposalCooldown = party.proposalCooldown || {};
  const lastProposal = proposalCooldown[city.id];
  
  if (!lastProposal) return false;
  
  const daysSinceLastProposal = calculateDaysBetween(lastProposal, currentDate);
  
  // Minimum 30 days between proposals per party per city
  return daysSinceLastProposal < 30;
}

/**
 * Batch process voting for all pending city bills
 * @param {Object} cityBillsMap - Map of city ID to pending bills
 * @param {Object} cityGovernmentMap - Map of city ID to government structure
 * @param {Array} allParties - All parties in campaign
 * @returns {Object} Vote results by city and bill
 */
export function batchProcessCityVoting(cityBillsMap, cityGovernmentMap, allParties) {
  const voteResults = {};
  const startTime = performance.now();
  
  Object.entries(cityBillsMap).forEach(([cityId, bills]) => {
    const cityGov = cityGovernmentMap[cityId];
    if (!cityGov || !bills.length) return;
    
    // Get council members for this city
    const councilMembers = getCityCouncilMembers(cityGov);
    if (councilMembers.length === 0) return;
    
    const cityResults = {};
    
    bills.forEach(bill => {
      if (bill.status === 'pending_vote') {
        const cityStats = getCityStatsFromBill(bill) || {}; // Would need real city stats
        const votes = calculateCityPartyLineVotes(councilMembers, bill, cityStats, allParties);
        cityResults[bill.id] = votes;
      }
    });
    
    if (Object.keys(cityResults).length > 0) {
      voteResults[cityId] = cityResults;
    }
  });
  
  const endTime = performance.now();
  console.log(`[CityLegislationManager] Processed voting for ${Object.keys(voteResults).length} cities in ${(endTime - startTime).toFixed(2)}ms`);
  
  return voteResults;
}

/**
 * Extract council members from city government structure
 */
function getCityCouncilMembers(cityGovernment) {
  const members = [];
  
  if (cityGovernment.legislative) {
    cityGovernment.legislative.forEach(office => {
      if (office.members && Array.isArray(office.members)) {
        members.push(...office.members);
      } else if (office.holder) {
        members.push(office.holder);
      }
    });
  }
  
  return members;
}

/**
 * Create efficient summary of city legislation activity
 * @param {Object} cityProposals - New proposals by city
 * @param {Object} cityVotes - Vote results by city
 * @returns {Object} Summary statistics
 */
export function createLegislationActivitySummary(cityProposals, cityVotes) {
  const summary = {
    totalCitiesWithActivity: 0,
    totalProposals: 0,
    totalVotes: 0,
    proposalsByTheme: {},
    votesByOutcome: { passed: 0, failed: 0, tied: 0 },
    partiesActive: new Set(),
    timestamp: new Date().toISOString()
  };
  
  // Count proposals
  Object.values(cityProposals).forEach(proposals => {
    if (proposals.length > 0) {
      summary.totalCitiesWithActivity++;
      summary.totalProposals += proposals.length;
      
      proposals.forEach(proposal => {
        // Track themes
        const theme = proposal.theme || 'other';
        summary.proposalsByTheme[theme] = (summary.proposalsByTheme[theme] || 0) + 1;
        
        // Track active parties
        if (proposal.proposingPartyId) {
          summary.partiesActive.add(proposal.proposingPartyId);
        }
      });
    }
  });
  
  // Count votes and outcomes
  Object.values(cityVotes).forEach(cityResults => {
    Object.values(cityResults).forEach(votes => {
      const voteCount = Object.keys(votes).length;
      summary.totalVotes += voteCount;
      
      // Determine outcome (simplified)
      const yeaVotes = Object.values(votes).filter(v => v === 'yea').length;
      const nayVotes = Object.values(votes).filter(v => v === 'nay').length;
      
      if (yeaVotes > nayVotes) {
        summary.votesByOutcome.passed++;
      } else if (nayVotes > yeaVotes) {
        summary.votesByOutcome.failed++;
      } else {
        summary.votesByOutcome.tied++;
      }
    });
  });
  
  // Convert Set to Array for serialization
  summary.partiesActive = Array.from(summary.partiesActive);
  
  return summary;
}

// Helper functions

function generateBillId(cityId, partyId, currentDate) {
  const timestamp = `${currentDate.year}${currentDate.month.toString().padStart(2, '0')}${currentDate.day.toString().padStart(2, '0')}`;
  return `bill_${cityId}_${partyId}_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
}

function generateBillName(theme, partyName, cityName) {
  const themeNames = {
    economic: 'Economic Development',
    social: 'Social Welfare',
    infrastructure: 'Infrastructure Investment',
    public_safety: 'Public Safety Enhancement',
    environment: 'Environmental Protection',
    education: 'Education Improvement',
    healthcare: 'Healthcare Access'
  };
  
  const themeName = themeNames[theme] || 'Municipal Reform';
  return `${themeName} Act (${cityName})`;
}

function calculateDaysBetween(date1, date2) {
  // Simplified date calculation
  const d1 = new Date(date1.year, date1.month - 1, date1.day);
  const d2 = new Date(date2.year, date2.month - 1, date2.day);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getCityStatsFromBill(bill) {
  // Placeholder - in real implementation, would fetch city stats
  // For now, return minimal stats to prevent errors
  return {
    population: 100000,
    budget: { 
      balance: 1000000,
      totalAnnualIncome: 50000000,
      expenseAllocations: {}
    },
    unemploymentRate: 6.5,
    crimeRatePer1000: 45,
    economicOutlook: 'stable'
  };
}

// Expose for testing in development
if (process.env.NODE_ENV === 'development') {
  window.testCityLegislationManager = { 
    batchProcessCityProposals, 
    batchProcessCityVoting,
    createLegislationActivitySummary 
  };
}