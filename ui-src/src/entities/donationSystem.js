// ui-src/src/entities/donationSystem.js
import { getRandomInt, getRandomElement, generateId } from "../utils/core.js";
import { getDonationLawById, canDonate, requiresDisclosure } from "../data/politicalDonationLaws.js";

/**
 * Donation frequency based on election level (days between donations)
 */
const DONATION_FREQUENCY = {
  federal: 1,      // Daily for presidential/congressional
  state: 3,        // Every 3 days for state elections
  local: 7,        // Weekly for local elections
  municipal: 14    // Bi-weekly for municipal
};

/**
 * Base donation amounts by election level
 */
const BASE_DONATION_RANGES = {
  federal: { min: 500, max: 50000 },
  state: { min: 100, max: 10000 },
  local: { min: 25, max: 2500 },
  municipal: { min: 10, max: 1000 }
};

/**
 * Donor pool sizes by election level
 */
const DONOR_POOL_SIZE = {
  federal: { min: 500, max: 5000 },
  state: { min: 100, max: 1000 },
  local: { min: 25, max: 250 },
  municipal: { min: 10, max: 100 }
};

/**
 * Party fundraising multipliers
 */
const PARTY_MULTIPLIERS = {
  democrat: 1.1,
  republican: 1.1,
  libertarian: 0.6,
  green: 0.5,
  independent: 0.4,
  default: 0.7
};

/**
 * Generate a realistic donor based on donation laws and type
 */
const generateDonor = (donorType, donationLaw, electionLevel) => {
  const firstNames = ["John", "Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Mary", 
                      "William", "Patricia", "James", "Linda", "Christopher", "Barbara", "Daniel", "Elizabeth"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
                     "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"];
  
  const corpPrefixes = ["American", "National", "United", "Global", "Metropolitan", "Regional", "Citizens"];
  const corpTypes = ["Industries", "Holdings", "Corporation", "Group", "Capital", "Partners", "Enterprises"];
  
  const unionNames = ["Teachers Union", "Police Association", "Firefighters Union", "Healthcare Workers", 
                      "Trade Workers Alliance", "Service Employees Union", "Public Workers Association"];

  let donor = {
    id: generateId(),
    type: donorType,
    createdDate: new Date(),
    totalDonated: 0,
    donationCount: 0,
    maxDonationCapacity: 0,
    isActive: true
  };

  switch (donorType) {
    case 'individual':
      donor.name = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
      donor.occupation = getRandomElement(["Business Owner", "Lawyer", "Doctor", "Engineer", "Teacher", 
                                          "Retired", "Consultant", "Executive", "Investor"]);
      donor.maxDonationCapacity = donationLaw.individualLimit || getRandomInt(5000, 50000);
      break;
      
    case 'corporate':
      donor.name = `${getRandomElement(corpPrefixes)} ${getRandomElement(corpTypes)}`;
      donor.industry = getRandomElement(['Technology', 'Healthcare', 'Finance', 'Energy', 
                                        'Manufacturing', 'Real Estate', 'Retail', 'Transportation']);
      donor.maxDonationCapacity = donationLaw.corporateLimit || getRandomInt(10000, 100000);
      break;
      
    case 'union':
      donor.name = getRandomElement(unionNames);
      donor.memberCount = getRandomInt(100, 10000);
      donor.maxDonationCapacity = donationLaw.unionLimit || getRandomInt(10000, 100000);
      break;
  }

  return donor;
};

/**
 * Determine what stage the campaign is in based on election date
 */
const determineCampaignStage = (election) => {
  // For now, assume we're always in early stage at game start
  // This should eventually use real game date vs election date
  return 'early'; // early, mid, late, final
};

/**
 * Get realistic donation data for different campaign stages and election levels
 */
const getRealisticStageData = (electionLevel, campaignStage) => {
  const stageMultipliers = {
    early: 0.05,   // Start with 5% of eventual funding
    mid: 0.25,     // Build to 25% 
    late: 0.70,    // Ramp up to 70%
    final: 1.0     // Full funding by election day
  };

  const baseData = {
    federal: {
      avgDonation: 2500,
      donorCount: 8,        // Start with very few donors
      maxDonation: 8000
    },
    state: {
      avgDonation: 1200,
      donorCount: 5,
      maxDonation: 4000
    },
    local: {
      avgDonation: 400,
      donorCount: 3,        // Local races start tiny
      maxDonation: 1200
    },
    municipal: {
      avgDonation: 200,
      donorCount: 2,        // Maybe just family/friends initially
      maxDonation: 600
    }
  };

  const levelData = baseData[electionLevel] || baseData.local;
  const stageMultiplier = stageMultipliers[campaignStage] || stageMultipliers.early;

  return {
    avgDonation: levelData.avgDonation,
    donorCount: Math.max(1, Math.round(levelData.donorCount * (campaignStage === 'early' ? 1 : stageMultiplier * 4))),
    maxDonation: levelData.maxDonation,
    fundingMultiplier: stageMultiplier
  };
};

/**
 * Calculate donations for a candidate based on LOD (Level of Detail)
 * Now includes realistic campaign timeline progression
 * LOD 0: Simple total (for background AI candidates)
 * LOD 1: Aggregated by type (for visible AI candidates) 
 * LOD 2: Full detail with individual donations (for player and important candidates)
 */
export const calculateCandidateDonations = (candidate, election, donationLaw, lodLevel = 0) => {
  const electionLevel = election?.level || 'local';
  const partyMultiplier = PARTY_MULTIPLIERS[candidate.partyId?.toLowerCase()] || PARTY_MULTIPLIERS.default;
  
  // Determine campaign stage - this should come from actual game time, but for now assume early stage
  const campaignStage = determineCampaignStage(election);
  
  // Get realistic funding for this stage
  const stageData = getRealisticStageData(electionLevel, campaignStage);
  
  // Factor in candidate attributes
  const fundraisingSkill = candidate.attributes?.fundraising || 5;
  const nameRecognition = candidate.nameRecognition || 20;
  const skillMultiplier = Math.max(0.3, (fundraisingSkill / 10) * Math.max(0.1, nameRecognition / 100));
  
  // Calculate realistic early-stage donations
  const expectedDonorCount = Math.round(stageData.donorCount * skillMultiplier);
  const avgDonation = stageData.avgDonation * partyMultiplier;
  const totalFunds = Math.round(expectedDonorCount * avgDonation * skillMultiplier);

  // LOD 0: Just return the total
  if (lodLevel === 0) {
    return {
      totalFunds,
      donorCount: expectedDonorCount,
      lastUpdated: new Date()
    };
  }

  // LOD 1: Aggregate by donor type
  if (lodLevel === 1) {
    const individualPct = donationLaw.individualLimit > 0 ? 0.6 : 0;
    const corporatePct = donationLaw.corporateLimit > 0 ? 0.25 : 0;
    const unionPct = donationLaw.unionLimit > 0 ? 0.15 : 0;
    
    // Redistribute if some types are banned
    const totalPct = individualPct + corporatePct + unionPct;
    const adjustedIndividual = totalPct > 0 ? individualPct / totalPct : 0;
    const adjustedCorporate = totalPct > 0 ? corporatePct / totalPct : 0;
    const adjustedUnion = totalPct > 0 ? unionPct / totalPct : 0;

    return {
      totalFunds,
      donorCount: expectedDonorCount,
      byType: {
        individual: {
          amount: Math.round(totalFunds * adjustedIndividual),
          count: Math.round(expectedDonorCount * adjustedIndividual)
        },
        corporate: {
          amount: Math.round(totalFunds * adjustedCorporate),
          count: Math.round(expectedDonorCount * adjustedCorporate)
        },
        union: {
          amount: Math.round(totalFunds * adjustedUnion),
          count: Math.round(expectedDonorCount * adjustedUnion)
        }
      },
      averageDonation: Math.round(totalFunds / expectedDonorCount),
      largestDonation: Math.min(
        Math.round(avgDonation * 5),
        donationLaw.individualLimit || Number.MAX_SAFE_INTEGER
      ),
      lastUpdated: new Date()
    };
  }

  // LOD 2: Full detail with individual donation records
  const donors = [];
  const donations = [];
  
  // For early stage, generate realistic seed donors
  if (campaignStage === 'early') {
    // Generate a few seed donors with larger amounts
    for (let i = 0; i < expectedDonorCount && i < 8; i++) {
      // Early donors are usually individuals (family, friends, close supporters)
      const donorType = Math.random() < 0.8 ? 'individual' : 
                       (donationLaw.corporateLimit > 0 && Math.random() < 0.7) ? 'corporate' : 'individual';
      
      const donor = generateDonor(donorType, donationLaw, electionLevel);
      
      // Seed donations are typically larger
      const isFirstDonor = i === 0;
      const seedMultiplier = isFirstDonor ? 2.0 : 1.2; // First donor gives more
      
      const maxForType = donorType === 'individual' ? donationLaw.individualLimit :
                        donorType === 'corporate' ? donationLaw.corporateLimit :
                        donationLaw.unionLimit;
      
      let donationAmount = Math.round(avgDonation * seedMultiplier);
      donationAmount = Math.min(donationAmount, maxForType || donationAmount);
      donationAmount = Math.min(donationAmount, stageData.maxDonation);

      // Early donors usually aren't anonymous
      const isAnonymous = false;

      // Check if this donation can be made
      if (!canDonate(donationLaw, donorType, donationAmount, isAnonymous, false)) {
        continue; // Skip this donation
      }

      const donation = {
        id: generateId(),
        donorId: donor.id,
        donorName: donor.name,
        donorType,
        amount: donationAmount,
        date: generateDonationDate(election),
        isAnonymous,
        requiresDisclosure: requiresDisclosure(donationLaw, donationAmount),
        industry: donor.industry,
        occupation: donor.occupation
      };

      donor.totalDonated = donation.amount;
      donor.donationCount = 1;
      
      donors.push(donor);
      donations.push(donation);
    }
  } else {
    // Later stage generation (keep existing logic for when we implement timeline)
    // ... (would implement fuller donor generation for later stages)
  }

  // Sort donations by amount descending
  donations.sort((a, b) => b.amount - a.amount);

  const actualTotalFunds = donations.reduce((sum, d) => sum + d.amount, 0);

  return {
    totalFunds: actualTotalFunds,
    donorCount: donors.length,
    donors,
    donations,
    byType: {
      individual: {
        amount: donations.filter(d => d.donorType === 'individual').reduce((sum, d) => sum + d.amount, 0),
        count: donations.filter(d => d.donorType === 'individual').length
      },
      corporate: {
        amount: donations.filter(d => d.donorType === 'corporate').reduce((sum, d) => sum + d.amount, 0),
        count: donations.filter(d => d.donorType === 'corporate').length
      },
      union: {
        amount: donations.filter(d => d.donorType === 'union').reduce((sum, d) => sum + d.amount, 0),
        count: donations.filter(d => d.donorType === 'union').length
      }
    },
    topDonors: donations.slice(0, 10).map(d => ({
      name: d.donorName,
      amount: d.amount,
      type: d.donorType
    })),
    averageDonation: donors.length > 0 ? Math.round(actualTotalFunds / donors.length) : 0,
    largestDonation: donations[0]?.amount || 0,
    lastUpdated: new Date()
  };
};

/**
 * Generate a realistic donation date based on election timeline
 */
const generateDonationDate = (election) => {
  if (!election?.electionDate) {
    // Random date in past 3 months if no election date
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
    return new Date(randomTime);
  }

  const electionDate = new Date(election.electionDate.year, election.electionDate.month - 1, election.electionDate.day);
  const campaignStart = new Date(electionDate.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year before election
  const now = new Date();
  
  // Donations happen between campaign start and now (or election if it's passed)
  const endDate = now < electionDate ? now : electionDate;
  const startTime = campaignStart.getTime();
  const endTime = endDate.getTime();
  
  return new Date(startTime + Math.random() * (endTime - startTime));
};

/**
 * Process daily donations for active campaigns
 */
export const processDailyDonations = (candidates, election, donationLaw, currentGameDate) => {
  const electionLevel = election?.level || 'local';
  const donationFrequency = DONATION_FREQUENCY[electionLevel];
  
  // Check if it's a donation day
  const daysSinceCampaignStart = 1; // This should be calculated from actual campaign start
  if (daysSinceCampaignStart % donationFrequency !== 0) {
    return candidates; // Not a donation day for this level
  }

  const updatedCandidates = [];
  
  for (const candidate of candidates) {
    // Skip if candidate has reached fundraising limit
    if (candidate.campaignFinances?.reachedLimit) {
      updatedCandidates.push(candidate);
      continue;
    }

    // Generate new donations for this period
    const lodLevel = candidate.isPlayer ? 2 : candidate.isImportant ? 1 : 0;
    const newDonations = calculateCandidateDonations(candidate, election, donationLaw, lodLevel);
    
    // Merge with existing campaign finances
    const existingFinances = candidate.campaignFinances || {
      totalFunds: 0,
      donorCount: 0,
      donations: [],
      donors: []
    };

    const updatedFinances = {
      ...existingFinances,
      totalFunds: existingFinances.totalFunds + newDonations.totalFunds,
      donorCount: existingFinances.donorCount + newDonations.donorCount,
      lastUpdated: newDonations.lastUpdated
    };

    // Add detailed data for high LOD
    if (lodLevel >= 1) {
      updatedFinances.byType = newDonations.byType;
      updatedFinances.averageDonation = newDonations.averageDonation;
      updatedFinances.largestDonation = Math.max(
        existingFinances.largestDonation || 0,
        newDonations.largestDonation
      );
    }

    if (lodLevel === 2) {
      updatedFinances.donations = [...(existingFinances.donations || []), ...newDonations.donations];
      updatedFinances.donors = [...(existingFinances.donors || []), ...newDonations.donors];
      updatedFinances.topDonors = newDonations.topDonors;
    }

    updatedCandidates.push({
      ...candidate,
      campaignFinances: updatedFinances,
      campaignFunds: updatedFinances.totalFunds // Keep backward compatibility
    });
  }

  return updatedCandidates;
};

/**
 * Get donation law summary for UI display
 */
export const getDonationLawSummary = (donationLawId) => {
  const law = getDonationLawById(donationLawId);
  
  return {
    name: law.name,
    description: law.description,
    limits: {
      individual: law.individualLimit === null ? "Unlimited" : `$${law.individualLimit.toLocaleString()}`,
      corporate: law.corporateLimit === null ? "Unlimited" : 
                 law.corporateLimit === 0 ? "Prohibited" : `$${law.corporateLimit.toLocaleString()}`,
      union: law.unionLimit === null ? "Unlimited" : 
             law.unionLimit === 0 ? "Prohibited" : `$${law.unionLimit.toLocaleString()}`
    },
    transparency: {
      threshold: law.transparencyThreshold === null ? "None" : `$${law.transparencyThreshold.toLocaleString()}`,
      anonymousAllowed: law.anonymousDonationsAllowed,
      maxAnonymous: law.maxAnonymousAmount === null ? "Unlimited" : `$${law.maxAnonymousAmount.toLocaleString()}`
    },
    restrictions: law.restrictions
  };
};