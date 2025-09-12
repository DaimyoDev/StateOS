// src/stores/cityManagementSlice.js
import { getRandomInt } from "../utils/core.js";
import { generateFullAIPolitician } from "../entities/personnel.js";
import { chamberTiers } from "../data/chamberTiers.js";

/**
 * Generates realistic legislation activity for a city based on its characteristics
 * @param {Object} cityData - The city data including stats and demographics
 * @param {Object} currentDate - Current game date
 * @param {number} monthsToSimulate - How many months of activity to generate
 * @returns {Object} Generated legislation data
 */
const generateCityLegislationActivity = (cityData, currentDate, monthsToSimulate = 12) => {
  const proposedBills = [];
  const activeLegislation = [];
  const passedBillsArchive = [];
  const failedBillsArchive = [];

  // Base activity level based on city size and political engagement
  const population = cityData.population || 50000;
  const politicalEngagement = cityData.stats?.politicalEngagement || 0.5;
  
  // Larger cities have more legislative activity
  const baseActivityLevel = Math.min(Math.floor(population / 25000) + 2, 8);
  const adjustedActivity = Math.floor(baseActivityLevel * (0.5 + politicalEngagement));

  // Generate bills for each month
  for (let month = 0; month < monthsToSimulate; month++) {
    const billsThisMonth = getRandomInt(0, adjustedActivity);
    
    for (let i = 0; i < billsThisMonth; i++) {
      const bill = generateRealisticBill(cityData, currentDate, month);
      
      // Determine bill outcome based on city's political landscape
      const passChance = calculateBillPassChance(bill, cityData);
      const outcome = Math.random() < passChance ? 'passed' : 'failed';
      
      if (outcome === 'passed') {
        passedBillsArchive.push({
          ...bill,
          status: 'passed',
          passedDate: addMonthsToDate(currentDate, month - getRandomInt(1, 6))
        });
        
        // Some passed bills become active legislation
        if (Math.random() < 0.7) {
          activeLegislation.push({
            ...bill,
            status: 'active',
            effectiveDate: addMonthsToDate(currentDate, month - getRandomInt(0, 3))
          });
        }
      } else {
        failedBillsArchive.push({
          ...bill,
          status: 'failed',
          failedDate: addMonthsToDate(currentDate, month - getRandomInt(1, 6))
        });
      }
    }
  }

  // Generate some current proposed bills
  const currentProposedCount = getRandomInt(1, Math.max(2, adjustedActivity / 2));
  for (let i = 0; i < currentProposedCount; i++) {
    proposedBills.push(generateRealisticBill(cityData, currentDate, 0, true));
  }

  return {
    proposedBills,
    activeLegislation,
    passedBillsArchive,
    failedBillsArchive
  };
};

/**
 * Generates a realistic bill based on city characteristics
 */
const generateRealisticBill = (cityData, currentDate, monthOffset = 0, isPending = false) => {
  const billTypes = [
    'Budget Allocation',
    'Tax Rate Adjustment',
    'Zoning Ordinance',
    'Public Safety Initiative',
    'Infrastructure Investment',
    'Environmental Regulation',
    'Business License Reform',
    'Housing Policy',
    'Transportation Planning',
    'Parks and Recreation'
  ];

  const billType = billTypes[getRandomInt(0, billTypes.length - 1)];
  const billId = `bill_${Date.now()}_${getRandomInt(1000, 9999)}`;
  
  const bill = {
    id: billId,
    title: generateBillTitle(billType, cityData),
    description: generateBillDescription(billType, cityData),
    type: billType,
    authorId: `ai_councilmember_${getRandomInt(1, 7)}`,
    proposedDate: addMonthsToDate(currentDate, -monthOffset),
    scheduledVoteDate: isPending ? 
      addDaysToDate(currentDate, getRandomInt(1, 14)) : 
      addMonthsToDate(currentDate, -monthOffset + getRandomInt(0, 2)),
    policies: generateBillPolicies(billType, cityData),
    politicalCost: getRandomInt(3, 8),
    status: isPending ? 'pending' : 'historical'
  };

  return bill;
};

/**
 * Get council size based on population and country using chamber tiers
 */
const getCityCouncilSize = (population, countryId) => {
  const countryTiers = chamberTiers[countryId];
  if (!countryTiers?.LOCAL) {
    // Fallback to simple calculation if no tiers defined
    return Math.min(Math.max(Math.floor(population / 15000) + 3, 3), 15);
  }

  // Use country-specific tiers
  let tierKey = null;
  if (countryId === 'USA' && countryTiers.LOCAL.USA_CITY_COUNCIL_TIERS) {
    tierKey = 'USA_CITY_COUNCIL_TIERS';
  } else if (countryId === 'KOR' && countryTiers.LOCAL.KOR_LOCAL_BASIC_COUNCIL_TIERS) {
    tierKey = 'KOR_LOCAL_BASIC_COUNCIL_TIERS';
  }

  if (tierKey) {
    const tiers = countryTiers.LOCAL[tierKey];
    for (const tier of tiers) {
      if (population >= tier.popThreshold) {
        const [min, max] = tier.numDistrictsRange;
        return getRandomInt(min, max);
      }
    }
  }

  // Fallback
  return Math.min(Math.max(Math.floor(population / 15000) + 3, 3), 15);
};

/**
 * Generates politicians and government office holders for a city
 */
const generateCityGovernment = (cityData, countryId = 'USA', allPartiesInScope = []) => {
  const politicians = new Map();
  const governmentOffices = [];

  // Use provided parties or create defaults
  const parties = allPartiesInScope.length > 0 ? allPartiesInScope : [
    { id: 'democrat', name: 'Democratic Party', color: '#0066CC' },
    { id: 'republican', name: 'Republican Party', color: '#CC0000' },
    { id: 'independent', name: 'Independent', color: '#666666' }
  ];

  // Generate mayor
  const mayor = generateFullAIPolitician(
    countryId,
    parties,
    {
      cityId: cityData.id,
      regionId: cityData.regionId || null
    }
  );
  politicians.set(mayor.id, mayor);
  
  governmentOffices.push({
    id: 'mayor',
    title: 'Mayor',
    officeNameTemplateId: 'mayor',
    holderId: mayor.id,
    level: 'city',
    electionCycle: 4,
    instanceIdBase: `${cityData.id}_mayor`, // Unique identifier for election matching
    officeName: `Mayor of ${cityData.name}`,
    holder: {
      id: mayor.id,
      name: `${mayor.firstName} ${mayor.lastName}`,
      partyId: mayor.partyId,
      partyName: mayor.partyName,
      partyColor: mayor.partyColor,
      role: `Mayor of ${cityData.name}`
    }
  });

  // Generate city council members using population-based sizing
  const councilSize = getCityCouncilSize(cityData.population, countryId);
  const councilMembers = [];
  
  for (let i = 0; i < councilSize; i++) {
    const councilMember = generateFullAIPolitician(
      countryId,
      parties,
      {
        cityId: cityData.id,
        regionId: cityData.regionId || null
      }
    );
    politicians.set(councilMember.id, councilMember);
    
    // Add member to the council array
    councilMembers.push({
      id: councilMember.id,
      name: `${councilMember.firstName} ${councilMember.lastName}`,
      partyId: councilMember.partyId,
      partyName: councilMember.partyName,
      partyColor: councilMember.partyColor,
      role: `City Council Member (District ${i + 1})`
    });
  }
  
  // Create a single multi-member city council office
  governmentOffices.push({
    id: 'city_council',
    title: 'City Council',
    officeNameTemplateId: 'city_council',
    level: 'city',
    electionCycle: 4,
    numberOfSeatsToFill: councilSize,
    officeName: `${cityData.name} City Council`,
    members: councilMembers,
    instanceIdBase: `${cityData.id}_city_council` // Unique identifier for election matching
  });

  return { politicians, governmentOffices };
};

/**
 * Get government offices for a specific city from campaign data
 */
const getCityGovernmentOffices = (activeCampaign, cityId) => {
  if (!activeCampaign?.governmentOffices || !cityId) return [];
  
  // Get city offices from hierarchical structure
  const cityOffices = activeCampaign.governmentOffices?.cities?.[cityId] || {};
  const flatOffices = [];
  
  // Flatten city offices structure
  if (cityOffices.executive) flatOffices.push(...cityOffices.executive);
  if (cityOffices.legislative) flatOffices.push(...cityOffices.legislative);
  if (cityOffices.judicial) flatOffices.push(...cityOffices.judicial);
  
  return flatOffices.filter(office => 
    office && (office.cityId === cityId || 
    office.level === 'city' || 
    office.level === 'local_city' || 
    office.level === 'city_district')
  );
};

/**
 * Calculates city data using pre-generated politicians (no lazy loading)
 */
const calculateCityData = (cityId, baseData, currentDate, monthsSinceLastUpdate = 0, countryId = 'USA', allParties = []) => {
  // If baseData already has complete stats (from campaign setup), use them
  const hasCompleteStats = baseData.stats && 
    typeof baseData.stats.unemploymentRate !== 'undefined' &&
    typeof baseData.stats.crimeRatePer1000 !== 'undefined';

  let updatedStats;
  if (hasCompleteStats) {
    // Use existing complete stats with minor updates for time passage
    updatedStats = {
      ...baseData.stats,
      // Apply small changes over time
      unemploymentRate: Math.max(0.5, Math.min(15.0, 
        parseFloat(baseData.stats.unemploymentRate) + (monthsSinceLastUpdate * (Math.random() - 0.5) * 0.1)
      )).toFixed(1),
      crimeRatePer1000: Math.max(1.0, Math.min(50.0,
        baseData.stats.crimeRatePer1000 + (monthsSinceLastUpdate * (Math.random() - 0.5) * 0.5)
      )),
      lastUpdated: currentDate
    };
  } else {
    // Generate basic stats for cities that only have population and name
    updatedStats = {
      unemploymentRate: (getRandomInt(30, 120) / 10).toFixed(1),
      crimeRatePer1000: getRandomInt(15, 45),
      povertyRate: getRandomInt(8, 25),
      overallCitizenMood: getRandomElement(['Very Happy', 'Happy', 'Content', 'Concerned', 'Unhappy']),
      economicOutlook: getRandomElement(['Excellent', 'Good', 'Fair', 'Poor']),
      mainIssues: getRandomSubset(['Economy', 'Crime', 'Education', 'Healthcare', 'Infrastructure'], 2, 3),
      lastUpdated: currentDate
    };
  }

  // Generate legislation activity
  const legislationData = generateCityLegislationActivity(
    { ...baseData, stats: updatedStats }, 
    currentDate, 
    Math.max(monthsSinceLastUpdate, 12)
  );

  // NO LONGER GENERATE POLITICIANS - they should already exist from campaign setup
  // Politicians and government offices are now pre-generated during campaign loading

  return {
    ...baseData,
    id: cityId,
    stats: updatedStats,
    ...legislationData,
    lastCalculated: currentDate
  };
};

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomSubset = (array, min, max) => {
  const count = getRandomInt(min, max);
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper functions
const addMonthsToDate = (date, months) => {
  const newDate = { ...date };
  newDate.month += months;
  while (newDate.month > 12) {
    newDate.month -= 12;
    newDate.year += 1;
  }
  while (newDate.month < 1) {
    newDate.month += 12;
    newDate.year -= 1;
  }
  return newDate;
};

const addDaysToDate = (date, days) => {
  // Simplified day addition - in real implementation would handle month boundaries
  return {
    ...date,
    day: Math.min(28, date.day + days)
  };
};

const generateBillTitle = (type, cityData) => {
  const titles = {
    'Budget Allocation': [`${cityData.name} FY Budget Amendment`, `Municipal Budget Reallocation Act`],
    'Tax Rate Adjustment': [`Property Tax Reform Initiative`, `Business Tax Adjustment Ordinance`],
    'Zoning Ordinance': [`Residential Zoning Update`, `Commercial District Expansion`],
    'Public Safety Initiative': [`Community Policing Enhancement`, `Emergency Services Funding`],
    'Infrastructure Investment': [`Road Improvement Project`, `Water System Modernization`]
  };
  
  const typeOptions = titles[type] || [`${type} Initiative`, `${type} Ordinance`];
  return typeOptions[getRandomInt(0, typeOptions.length - 1)];
};

const generateBillDescription = (type, cityData) => {
  return `A ${type.toLowerCase()} proposal for ${cityData.name} to address local municipal needs and improve city services.`;
};

const generateBillPolicies = (type, cityData) => {
  // Simplified policy generation - would be more sophisticated in real implementation
  return [{
    id: `policy_${type.toLowerCase().replace(' ', '_')}`,
    name: `${type} Policy`,
    effects: []
  }];
};

const calculateBillPassChance = (bill, cityData) => {
  // Base pass rate around 60%
  let passChance = 0.6;
  
  // Adjust based on political engagement and bill type
  const engagement = cityData.stats?.politicalEngagement || 0.5;
  passChance += (engagement - 0.5) * 0.2;
  
  // Budget and tax bills are harder to pass
  if (bill.type.includes('Budget') || bill.type.includes('Tax')) {
    passChance -= 0.15;
  }
  
  return Math.max(0.1, Math.min(0.9, passChance));
};

// Export the generateCityGovernment function for use during campaign setup
export { generateCityGovernment };

export const createCityManagementSlice = (set, get) => ({
  // State
  availableCities: new Map(), // cityId -> city data
  currentCityId: null,
  
  // Actions
  actions: {
    /**
     * Switch to a different city, calculating its data on-demand
     */
    switchToCity: (cityId, cityBaseData = null) => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign) return state;

        const currentDate = activeCampaign.currentDate;
        let cityData = state.availableCities.get(cityId);
        
        // Get campaign context for proper city generation
        const countryId = activeCampaign.countryId || 'USA';
        const allParties = activeCampaign.generatedPartiesSnapshot || 
                          activeCampaign.generatedPartiesInCountry || 
                          activeCampaign.currentCampaignSetup?.generatedPartiesInCountry || [];
        
        // Calculate city data if not exists or outdated
        if (!cityData || !cityData.lastCalculated) {
          const baseData = cityBaseData || {
            id: cityId,
            name: `City ${cityId}`,
            population: getRandomInt(25000, 500000),
            stats: {}
          };
          
          cityData = calculateCityData(cityId, baseData, currentDate, 0, countryId, allParties);
        } else {
          // Update if data is old
          const monthsSince = calculateMonthsDifference(cityData.lastCalculated, currentDate);
          if (monthsSince > 0) {
            cityData = calculateCityData(cityId, cityData, currentDate, monthsSince, countryId, allParties);
          }
        }

        // Update campaign with city data (politicians already exist from campaign setup)
        const updatedCampaign = {
          ...activeCampaign,
          startingCity: cityData,
          // Update city-level legislation
          city: {
            proposedBills: cityData.proposedBills || [],
            activeLegislation: cityData.activeLegislation || [],
            passedBillsArchive: cityData.passedBillsArchive || [],
            failedBillsArchive: cityData.failedBillsArchive || []
          }
          // Politicians and government offices are already in the campaign from setup
          // No need to merge or generate new ones
        };

        // Update available cities cache
        const updatedCities = new Map(state.availableCities);
        updatedCities.set(cityId, cityData);

        return {
          ...state,
          activeCampaign: updatedCampaign,
          availableCities: updatedCities,
          currentCityId: cityId
        };
      });
    },

    /**
     * Get government offices for the current city
     */
    getCurrentCityGovernmentOffices: () => {
      const state = get();
      const { activeCampaign, currentCityId } = state;
    
      
      if (!currentCityId) {
        // Fallback to starting city
        const cityId = activeCampaign?.startingCity?.id;
        return getCityGovernmentOffices(activeCampaign, cityId);
      }
      
      const result = getCityGovernmentOffices(activeCampaign, currentCityId);
      return result;
    },

    /**
     * Get government offices for any specific city
     */
    getCityGovernmentOffices: (cityId) => {
      const { activeCampaign } = get();
      return getCityGovernmentOffices(activeCampaign, cityId);
    },

    /**
     * Get or generate city data without switching to it
     */
    getCityData: (cityId, cityBaseData = null) => {
      const state = get();
      const { activeCampaign } = state;
      if (!activeCampaign) return null;

      let cityData = state.availableCities.get(cityId);
      
      if (!cityData) {
        const baseData = cityBaseData || {
          name: `City ${cityId}`,
          population: getRandomInt(25000, 500000),
          stats: {
            unemployment: 0.08,
            crimeRate: 0.05,
            politicalEngagement: Math.random()
          }
        };
        
        cityData = calculateCityData(cityId, baseData, activeCampaign.currentDate);
        
        // Cache the generated data
        set((state) => ({
          ...state,
          availableCities: new Map(state.availableCities).set(cityId, cityData)
        }));
      }
      
      return cityData;
    },

    /**
     * Initialize city management system
     */
    initializeCityManagement: () => {
      set((state) => {
        const { activeCampaign } = state;
        if (!activeCampaign?.startingCity) return state;

        return {
          ...state,
          currentCityId: activeCampaign.startingCity.id || 'starting_city',
          availableCities: new Map([[
            activeCampaign.startingCity.id || 'starting_city', 
            activeCampaign.startingCity
          ]])
        };
      });
    }
  }
});

// Helper function to calculate months difference
const calculateMonthsDifference = (date1, date2) => {
  return (date2.year - date1.year) * 12 + (date2.month - date1.month);
};
