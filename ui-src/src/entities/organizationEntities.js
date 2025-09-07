// src/entities/organizationEntities.js
import { LOBBYING_NAME_COMPONENTS } from "../data/lobbyingNames";
import { NEWS_NAME_COMPONENTS } from "../data/newsOutletNames";
import useGameStore from "../store";
import { generateId, getRandomElement, getRandomInt } from "../utils/core";
import {
  POLLING_FIRM_ARCHETYPES,
  POLLING_FIRM_NAME_COMPONENTS,
} from "../data/pollingData";

const LOBBYING_ARCHETYPES = [
  // Economic
  {
    focus: "Corporate Interests",
    keywords: ["corporate", "business", "deregulate"],
    financialPower: 90,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Banking & Financial Services",
    keywords: ["banking", "financial", "credit", "investment"],
    financialPower: 95,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Real Estate Development",
    keywords: ["housing", "zoning", "development", "construction"],
    financialPower: 85,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Retail & Consumer Goods",
    keywords: ["retail", "consumer", "shopping", "sales"],
    financialPower: 75,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Small Business Advocacy",
    keywords: ["business", "small business", "startup"],
    financialPower: 65,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Free Market Principles",
    keywords: ["market", "trade", "tax"],
    financialPower: 80,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Labor Rights & Unions",
    keywords: ["union", "workers", "wage", "collective"],
    financialPower: 70,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Fair Trade Practices",
    keywords: ["trade", "tariff", "globalization"],
    financialPower: 55,
    policyDirection: "pro-regulation",
  },
  // Environmental
  {
    focus: "Environmental Protection",
    keywords: ["green", "carbon", "renewables", "eco", "conservation"],
    financialPower: 65,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Fossil Fuel Industry",
    keywords: ["oil", "gas", "fossil", "energy"],
    financialPower: 95,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Sustainable Agriculture",
    keywords: ["farm", "agriculture", "food"],
    financialPower: 60,
    policyDirection: "pro-regulation",
  },
  // Social & Civil Liberties
  {
    focus: "Firearm Ownership Rights",
    keywords: ["firearm", "gun", "2a"],
    financialPower: 85,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Gun Control Advocacy",
    keywords: ["firearm", "gun", "safety"],
    financialPower: 70,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Digital Privacy",
    keywords: ["privacy", "surveillance", "data", "encryption"],
    financialPower: 75,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Civil Liberties Union",
    keywords: ["speech", "privacy", "freedom", "rights"],
    financialPower: 80,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Religious Freedom",
    keywords: ["religious", "faith", "conscience"],
    financialPower: 70,
    policyDirection: "anti-regulation",
  },
  // Technology
  {
    focus: "Technology Innovation",
    keywords: ["tech", "ai", "innovation", "digital"],
    financialPower: 88,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Tech Regulation & Antitrust",
    keywords: ["tech", "antitrust", "monopoly", "regulate"],
    financialPower: 60,
    policyDirection: "pro-regulation",
  },
  // Healthcare & Social Welfare
  {
    focus: "Pharmaceutical Industry",
    keywords: ["pharma", "drug", "healthcare", "patent"],
    financialPower: 92,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Universal Healthcare",
    keywords: ["healthcare", "medicare", "public health"],
    financialPower: 75,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Insurance Lobby",
    keywords: ["insurance", "healthcare", "coverage"],
    financialPower: 85,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Social Welfare & Housing",
    keywords: ["housing", "poverty", "welfare", "childcare"],
    financialPower: 55,
    policyDirection: "pro-regulation",
  },
  // Other
  {
    focus: "Defense Contractors",
    keywords: ["defense", "military", "aerospace"],
    financialPower: 95,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Education Reform",
    keywords: ["education", "school", "teacher"],
    financialPower: 60,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Transportation & Logistics",
    keywords: ["transport", "logistics", "shipping", "trucking"],
    financialPower: 80,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Agriculture & Farming",
    keywords: ["agriculture", "farming", "crop", "livestock"],
    financialPower: 70,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Tourism & Hospitality",
    keywords: ["tourism", "hotel", "hospitality", "entertainment"],
    financialPower: 65,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Professional Services",
    keywords: ["professional", "consulting", "legal", "accounting"],
    financialPower: 75,
    policyDirection: "anti-regulation",
  },
  {
    focus: "Consumer Protection",
    keywords: ["consumer", "safety", "protection", "rights"],
    financialPower: 55,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Public Transportation",
    keywords: ["transit", "public transport", "metro", "bus"],
    financialPower: 60,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Affordable Housing",
    keywords: ["housing", "affordable", "rent", "homeless"],
    financialPower: 50,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Senior Citizens Advocacy",
    keywords: ["senior", "elderly", "medicare", "retirement"],
    financialPower: 65,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Youth & Student Organizations",
    keywords: ["youth", "student", "education", "college"],
    financialPower: 45,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Mental Health Advocacy",
    keywords: ["mental health", "healthcare", "therapy", "wellness"],
    financialPower: 50,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Veterans Affairs",
    keywords: ["veteran", "military", "service", "benefits"],
    financialPower: 70,
    policyDirection: "pro-regulation",
  },
  {
    focus: "Manufacturing Association",
    keywords: ["manufacturing", "industry", "production", "factory"],
    financialPower: 85,
    policyDirection: "anti-regulation",
  },
];

/**
 * Generates a plausible name for a news outlet.
 * @param {string} locationName - The name of the country or region.
 * @param {string} ideologyName - The primary ideology of the outlet.
 * @returns {string} A generated news outlet name.
 */
const generateNewsOutletName = (locationName, ideologyName) => {
  const { prefixes, adjectives, suffixes, media_types } = NEWS_NAME_COMPONENTS;

  const adjective = getRandomElement(
    adjectives[ideologyName] || adjectives.Default
  );
  const prefix = getRandomElement(prefixes);
  const suffix = getRandomElement(suffixes);
  const media = getRandomElement(media_types);

  // A collection of different name structures
  const templates = [
    () => `${prefix} ${locationName} ${suffix}`,
    () => `${locationName} ${adjective} ${suffix}`,
    () => `${locationName} ${media}`,
    () => `${adjective} ${media}`,
    () => `${prefix} ${adjective} ${suffix}`,
    () => `${locationName} ${suffix}`,
    () => `${adjective} Voice`,
    () => `${locationName} News Network`,
    () => `${prefix} ${locationName} Report`,
  ];

  // Select a random template function and execute it to build the name
  const chosenTemplate = getRandomElement(templates);
  return chosenTemplate();
};

const generateLobbyingGroupName = (focus) => {
  const { PREFIXES, NOUNS, CONNECTORS, FOCUS_ADJECTIVES } =
    LOBBYING_NAME_COMPONENTS;
  const templates = [
    () => `${getRandomElement(PREFIXES)} ${focus} ${getRandomElement(NOUNS)}`,
    () => `${getRandomElement(NOUNS)} ${getRandomElement(CONNECTORS)} ${focus}`,
    () =>
      `${getRandomElement(PREFIXES)} ${getRandomElement(
        FOCUS_ADJECTIVES
      )} ${focus}`,
    () => `${focus} ${getRandomElement(NOUNS)}`,
  ];
  return getRandomElement(templates)();
};

// --- Personnel Object Blueprints ---

/**
 * Creates a new Journalist object.
 * @param {object} params - The parameters for the journalist.
 * @param {string} [params.name] - The full name of the journalist.
 * @param {number} [params.age] - The age of the journalist.
 * @param {object} [params.attributes] - Skills like integrity, writing, investigation.
 * @param {object} [params.ideologyScores] - The journalist's personal political leaning.
 * @param {string} [params.employerId] - The ID of the news outlet they work for.
 * @returns {object} A new journalist object.
 */
export const createJournalistObject = (params = {}) => ({
  id: `journo_${generateId()}`,
  name: params.name || "Pat Smith",
  age: params.age || getRandomInt(25, 65),
  attributes: params.attributes || {
    integrity: getRandomInt(2, 9),
    writingSkill: getRandomInt(3, 9),
    investigation: getRandomInt(4, 9),
    onScreenPresence: getRandomInt(2, 8),
  },
  ideologyScores: params.ideologyScores || {},
  employerId: params.employerId || null,
});

/**
 * Creates a new Lobbyist object.
 * @param {object} params - The parameters for the lobbyist.
 * @param {string} [params.name] - The full name of the lobbyist.
 * @param {number} [params.age] - The age of the lobbyist.
 * @param {object} [params.attributes] - Skills like negotiation, connections, fundraising.
 * @param {string} [params.employerId] - The ID of the lobbying group they work for.
 * @returns {object} A new lobbyist object.
 */
export const createLobbyistObject = (params = {}) => ({
  id: `lob_${generateId()}`,
  name: params.name || "Alex Chen",
  age: params.age || getRandomInt(30, 60),
  attributes: params.attributes || {
    negotiation: getRandomInt(4, 10),
    connections: getRandomInt(5, 10), // Represents their network
    fundraising: getRandomInt(3, 9),
    publicSpeaking: getRandomInt(2, 8),
  },
  employerId: params.employerId || null,
});

// --- Organization Object Blueprints ---

/**
 * Creates a new News Outlet object with detailed properties including contextual credibility.
 * @param {object} params - The parameters for the news outlet.
 * @param {string} [params.name] - The name of the publication (e.g., "The National Times").
 * @param {string} [params.type] - The type of outlet (e.g., "Newspaper", "TV/Radio", "Online").
 * @param {string} [params.level] - The operational level ("national", "state", "local").
 * @param {object} [params.reach] - Level-specific audience reach.
 * @param {number} [params.reach.national] - National audience reach (0-100, only for national outlets).
 * @param {number} [params.reach.state] - State audience reach (0-100, for state/national outlets).
 * @param {number} [params.reach.local] - Local audience reach (0-100, for local outlets).
 * @param {object} [params.credibility] - Base credibility metrics.
 * @param {number} [params.credibility.base] - Base credibility score (0-100).
 * @param {string} [params.credibility.primaryIdeology] - Main ideological alignment for credibility calculation.
 * @param {number} [params.credibility.ideologicalIntensity] - How strongly ideological (0-10, 0=neutral, 10=very partisan).
 * @param {Array<object>} [params.staff] - An array of Journalist objects.
 * @param {object} [params.biases] - An object detailing the outlet's biases.
 * @param {object} [params.biases.partyBiases] - Key-value pairs of partyId and bias score (-10 to +10).
 * @param {object} [params.biases.ideologyBiases] - Key-value pairs of ideologyId and bias score.
 * @param {object} [params.biases.policyBiases] - Key-value pairs of policyQuestionId and preferred option value.
 * @param {Array<string>} [params.coalitionAffiliations] - Coalition IDs this outlet tends to favor.
 * @returns {object} A new news outlet object.
 */
export const createNewsOutletObject = (params = {}) => ({
  id: `news_${generateId()}`,
  name: params.name || "Unnamed Outlet",
  type: params.type || "Online",
  level: params.level || "local", // "national", "state", "local"
  
  // Level-specific reach system with geographic distribution
  reach: params.reach || {
    national: params.level === "national" ? getRandomInt(10, 80) : 0,
    state: params.level === "national" ? getRandomInt(15, 85) : 
           params.level === "state" ? getRandomInt(20, 90) : 0,
    local: params.level === "local" ? getRandomInt(30, 95) : 
           params.level === "state" ? getRandomInt(10, 60) : 
           params.level === "national" ? getRandomInt(5, 40) : 0,
  },
  
  // Geographic reach data - areas where this outlet has strong influence
  strongholdAreas: params.strongholdAreas || [],
  
  // Enhanced credibility system
  credibility: params.credibility || {
    base: getRandomInt(30, 90), // Base credibility rating
    primaryIdeology: params.primaryIdeology || "centrist", // Main ideological lean
    ideologicalIntensity: getRandomInt(2, 8), // How partisan (0=neutral, 10=very partisan)
  },
  
  staff: params.staff || [],
  coalitionAffiliations: params.coalitionAffiliations || [], // Coalition IDs they favor
  
  biases: params.biases || {
    partyBiases: {}, // e.g., { 'party_123': 8, 'party_456': -5 }
    ideologyBiases: {}, // e.g., { 'conservative': 7, 'socialist': -8 }
    policyBiases: {}, // e.g., { 'healthcare_spending': 'increase_significantly' }
  },
  
  // Method to calculate contextual credibility for a specific viewer
  getContextualCredibility: function(viewerContext = {}) {
    const { ideology, partyAffiliation, coalitionMemberships = [] } = viewerContext;
    let credibilityModifier = 0;
    
    // Ideological alignment bonus/penalty
    if (ideology && this.credibility.primaryIdeology) {
      const ideologyAlignment = this.calculateIdeologyAlignment(ideology, this.credibility.primaryIdeology);
      const intensityMultiplier = this.credibility.ideologicalIntensity / 10;
      credibilityModifier += ideologyAlignment * 20 * intensityMultiplier;
    }
    
    // Party bias effects
    if (partyAffiliation && this.biases.partyBiases[partyAffiliation]) {
      const partyBias = this.biases.partyBiases[partyAffiliation];
      credibilityModifier += partyBias * 3; // Scale party bias to credibility impact
    }
    
    // Coalition alignment bonus
    const coalitionBonus = coalitionMemberships.filter(c => 
      this.coalitionAffiliations.includes(c)
    ).length * 10;
    credibilityModifier += coalitionBonus;
    
    // Clamp final credibility between 0-100
    return Math.max(0, Math.min(100, this.credibility.base + credibilityModifier));
  },
  
  // Method to calculate reach for a specific level
  getReachForLevel: function(level) {
    return this.reach[level] || 0;
  },
  
  // Helper method to calculate ideological alignment (-1 to 1, where 1 is perfect alignment)
  calculateIdeologyAlignment: function(ideology1, ideology2) {
    if (ideology1 === ideology2) return 1;
    
    // Define ideological spectrum for alignment calculation
    const spectrum = {
      "far-left": -2, "socialist": -1.5, "progressive": -1, "liberal": -0.5,
      "centrist": 0, "moderate": 0,
      "conservative": 0.5, "libertarian": 0.7, "nationalist": 1, "far-right": 1.5
    };
    
    const pos1 = spectrum[ideology1?.toLowerCase()] ?? 0;
    const pos2 = spectrum[ideology2?.toLowerCase()] ?? 0;
    const distance = Math.abs(pos1 - pos2);
    
    // Convert distance to alignment score (closer = higher alignment)
    return Math.max(-1, 1 - (distance / 2));
  }
});

/**
 * Creates a new Lobbying Group object with detailed properties.
 * @param {object} params - The parameters for the lobbying group.
 * @param {string} [params.name] - The name of the group (e.g., "Digital Innovation Alliance").
 * @param {string} [params.focus] - A short description of their primary goals.
 * @param {number} [params.financialPower] - The financial resources of the group (1-100).
 * @param {Array<object>} [params.staff] - An array of Lobbyist objects.
 * @param {object} [params.biases] - An object detailing the group's political alignment.
 * @param {Array<string>} [params.alignedPolicies] - A list of policy question IDs they support.
 * @param {Array<string>} [params.opposedPolicies] - A list of policy question IDs they oppose.
 * @returns {object} A new lobbying group object.
 */
export const createLobbyingGroupObject = (params = {}) => ({
  id: `lobby_${generateId()}`,
  name: params.name || "Unnamed Lobby",
  focus: params.focus || "General Interests",
  financialPower: params.financialPower || getRandomInt(20, 90),
  staff: params.staff || [],
  biases: params.biases || {
    alignedPolicies: [], // e.g., ['tax_cuts_corporations', 'deregulation_env']
    opposedPolicies: [], // e.g., ['minimum_wage_increase']
  },
});

/**
 * Creates a new News Article object.
 * @param {object} params - The parameters for the article.
 * @param {string} params.headline - The title of the article or broadcast.
 * @param {string} params.summary - A short summary or teaser.
 * @param {object} [params.fullBody] - A structured object containing the article's full content.
 * @param {Array<string>} [params.fullBody.paragraphs] - The main paragraphs of the article text.
 * @param {Array<object>} [params.fullBody.quotes] - Featured quotes within the article.
 * @param {string} [params.tone] - The overall tone ('positive', 'negative', 'neutral', 'sensationalist').
 * @param {string} params.outletId - The ID of the NewsOutlet that published this.
 * @param {string} [params.authorId] - The ID of the Journalist who wrote it.
 * @param {object} params.date - The date of publication.
 * @param {string} params.type - The type of event that triggered the news (e.g., 'policy_vote', 'election_result').
 * @param {object} [params.context] - Any relevant data, like the policyId or candidateId.
 * @returns {object} A new news article object.
 */
export const createNewsArticleObject = (params = {}) => ({
  id: `news_article_${generateId()}`,
  headline: params.headline || "Local Development Announced",
  summary: params.summary || "A new development has been announced affecting the local community.",
  // DEPRECATED: body is replaced by fullBody
  body: params.summary || "City officials have announced a new initiative that will impact residents.",
  fullBody: params.fullBody || {
    paragraphs: [params.summary || "Details about this development will be released as they become available."],
    quotes: [],
  },
  tone: params.tone || "neutral",
  outletId: params.outletId,
  authorId: params.authorId || null,
  date: params.date,
  type: params.type,
  context: params.context || {},
});

export const createPollingFirmObject = (params = {}) => ({
  id: `pollster_${generateId()}`,
  name: params.name || "Survey Services",
  reach: params.reach || getRandomInt(20, 85),
  credibility: params.credibility || getRandomInt(40, 95),
  level: params.level || "national",
  biases: params.biases || {
    ideologicalSkew: 0,
    methodologyBias: "none",
  },
});

// --- Organization Generation Logic ---

/**
 * Generates stronghold areas based on coalition demographic data and ideological alignment.
 * Uses the existing coalition system to determine realistic stronghold areas.
 * @param {string} ideology - The primary ideology of the outlet
 * @param {string} level - The level of the outlet ('national', 'state', 'local')
 * @param {object} coalitionData - Optional coalition data for the region (if available)
 * @returns {Array<string>} Array of area names where the outlet has strong reach
 */
const generateStrongholdAreas = (ideology, level, coalitionData = null, locationContext = null) => {
  // If coalition data is available, use it to generate data-driven strongholds
  if (coalitionData && coalitionData.base && coalitionData.demographics) {
    const strongholds = [];
    const targetIdeology = ideology?.toLowerCase();
    
    // Find coalitions that align with the outlet's ideology
    for (const [coalitionId, base] of coalitionData.base) {
      const coalitionIdeology = coalitionData.ideology?.get(coalitionId);
      const demographics = coalitionData.demographics?.get(coalitionId);
      
      if (coalitionIdeology && demographics && isIdeologyAligned(targetIdeology, coalitionIdeology)) {
        // Generate area name based on coalition demographics and location
        const areaName = generateAreaNameFromDemographics(demographics, base.name, locationContext);
        if (areaName && strongholds.length < 4) {
          strongholds.push(areaName);
        }
      }
    }
    
    // If we found coalition-based strongholds, return them
    if (strongholds.length > 0) {
      return strongholds.slice(0, getRandomInt(2, Math.min(4, strongholds.length)));
    }
  }
  
  // Fallback to generic area types if no coalition data available
  const conservativeAreas = {
    national: ['Rural Regions', 'Agricultural States', 'Traditional Heartland', 'Industrial Centers', 'Religious Communities', 'Border Areas'],
    state: ['Rural Districts', 'Agricultural Counties', 'Traditional Towns', 'Industrial Areas', 'Conservative Suburbs', 'Mining Regions'],
    local: ['Old Town Districts', 'Industrial Neighborhoods', 'Suburban Areas', 'Rural Communities', 'Traditional Quarters', 'Working Class Areas']
  };
  
  const liberalAreas = {
    national: ['Urban Centers', 'Coastal Regions', 'University Cities', 'Metropolitan Areas', 'Cultural Hubs', 'Tech Centers'],
    state: ['Urban Counties', 'University Towns', 'Metropolitan Districts', 'Cultural Centers', 'Progressive Communities', 'Tech Corridors'],
    local: ['Downtown Core', 'University District', 'Arts Quarter', 'Creative Districts', 'Young Professional Areas', 'Cultural Centers']
  };
  
  const moderateAreas = {
    national: ['Swing Regions', 'Mixed Demographics', 'Suburban States', 'Moderate Centers', 'Balanced Districts', 'Centrist Areas'],
    state: ['Suburban Counties', 'Mixed Communities', 'Swing Districts', 'Moderate Suburbs', 'Balanced Regions', 'Centrist Towns'],
    local: ['Mixed Neighborhoods', 'Suburban Centers', 'Commercial Districts', 'Middle Class Areas', 'Residential Zones', 'Community Centers']
  };

  // Map ideologies to area types
  const ideologyMapping = {
    'conservative': conservativeAreas,
    'libertarian': conservativeAreas, 
    'nationalist': conservativeAreas,
    'far-right': conservativeAreas,
    'liberal': liberalAreas,
    'progressive': liberalAreas,
    'socialist': liberalAreas,
    'far-left': liberalAreas,
    'centrist': moderateAreas,
    'moderate': moderateAreas
  };

  const areaPool = ideologyMapping[ideology?.toLowerCase()] || moderateAreas;
  const availableAreas = areaPool[level] || areaPool.local;
  
  // Build location prefix for fallback areas
  const locationPrefix = locationContext && locationContext.locationName ? `${locationContext.locationName} ` : '';
  
  // Randomly select 2-4 stronghold areas
  const numStrongholds = getRandomInt(2, Math.min(4, availableAreas.length));
  const selectedAreas = [];
  const shuffledAreas = [...availableAreas].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numStrongholds; i++) {
    selectedAreas.push(`${locationPrefix}${shuffledAreas[i]}`);
  }
  
  return selectedAreas;
};

/**
 * Check if two ideologies are aligned for stronghold purposes
 */
const isIdeologyAligned = (targetIdeology, coalitionIdeology) => {
  const alignmentGroups = {
    conservative: ['conservative', 'libertarian', 'nationalist'],
    liberal: ['liberal', 'progressive', 'socialist'],
    moderate: ['centrist', 'moderate', 'pragmatist']
  };
  
  for (const [group, ideologies] of Object.entries(alignmentGroups)) {
    if (ideologies.includes(targetIdeology) && ideologies.includes(coalitionIdeology)) {
      return true;
    }
  }
  return false;
};

/**
 * Generate area name based on coalition demographics
 */
const generateAreaNameFromDemographics = (demographics, coalitionName, locationContext = null) => {
  if (!demographics) return null;
  
  const { location, education, occupation, age } = demographics;
  
  // Build location prefix based on context
  let locationPrefix = '';
  if (locationContext && locationContext.locationName) {
    locationPrefix = `${locationContext.locationName} `;
  }
  
  // Generate descriptive area names based on demographic composition
  if (location === 'urban' && education === 'graduate') {
    return `${locationPrefix}University Districts`;
  } else if (location === 'urban' && occupation === 'professional') {
    return `${locationPrefix}Professional Urban Areas`;
  } else if (location === 'rural' && occupation === 'working_class') {
    return `${locationPrefix}Rural Working Communities`;
  } else if (location === 'suburban' && education === 'college') {
    return `${locationPrefix}Educated Suburban Areas`;
  } else if (location === 'suburban' && age === 'senior') {
    return `${locationPrefix}Senior Suburban Communities`;
  } else if (occupation === 'business_owner') {
    return `${locationPrefix}Business Districts`;
  } else {
    // Use simplified coalition name as fallback
    return `${locationPrefix}${coalitionName.replace(/s$/, ' Areas')}`;
  }
};

/**
 * Generates a set of news outlets for a specific political landscape with enhanced credibility and reach systems.
 * @param {object} options - The options for generation.
 * @param {string} options.level - The level of the outlets ('national', 'state', or 'local').
 * @param {Array<object>} options.parties - The list of political parties to base biases on.
 * @param {string} options.locationName - The name of the country or region.
 * @param {string} options.countryId - The ID of the country for naming context.
 * @param {string} [options.regionId] - The ID of the region for regional outlets.
 * @param {Array<string>} [options.availableCoalitions] - Available coalition IDs for affiliation.
 * @param {object} [options.coalitionData] - Coalition data for generating realistic strongholds.
 * @returns {Array<object>} An array of fully-formed news outlet objects.
 */
export const generateNewsOutlets = ({
  level,
  parties,
  locationName,
  countryId,
  regionId,
  availableCoalitions = [],
}) => {
  const outlets = [];
  
  // Adjust outlet count based on level
  const outletCounts = {
    national: getRandomInt(6, 10), // More national outlets
    state: getRandomInt(4, 7), // Medium state outlets  
    local: getRandomInt(3, 6), // Fewer local outlets
  };
  const numOutlets = outletCounts[level] || getRandomInt(3, 5);
  
  const mediaTypes = ["Newspaper", "TV/Radio", "Online", "Online"]; // Skew towards online
  const availableParties = [...parties];
  
  // Create some neutral outlets too
  const neutralOutletChance = 0.3; // 30% chance for neutral outlets

  for (let i = 0; i < numOutlets; i++) {
    let primaryParty = null;
    let primaryIdeology = "centrist";
    let ideologicalIntensity = getRandomInt(1, 3); // Low intensity for neutral
    
    // Decide if this outlet will be partisan or neutral
    if (availableParties.length > 0 && Math.random() > neutralOutletChance) {
      primaryParty = getRandomElement(availableParties);
      primaryIdeology = primaryParty.ideology;
      ideologicalIntensity = getRandomInt(4, 9); // Higher intensity for partisan outlets
      
      // Remove party so it's not picked again as a primary
      const partyIndex = availableParties.findIndex(p => p.id === primaryParty.id);
      if (partyIndex > -1) availableParties.splice(partyIndex, 1);
    }

    // Build biases based on primary party (if any)
    const biases = { partyBiases: {}, ideologyBiases: {}, policyBiases: {} };
    
    if (primaryParty) {
      biases.partyBiases[primaryParty.id] = getRandomInt(5, 9);
      biases.ideologyBiases[primaryParty.ideology] = getRandomInt(6, 10);

      // Find an opposing party for negative bias
      const opposingParty = getRandomElement(
        parties.filter(p => p.ideology !== primaryParty.ideology)
      );
      if (opposingParty) {
        biases.partyBiases[opposingParty.id] = getRandomInt(-9, -5);
        biases.ideologyBiases[opposingParty.ideology] = getRandomInt(-10, -6);
      }
    }
    
    // Select coalition affiliations (0-2 coalitions)
    const numCoalitions = Math.random() < 0.4 ? getRandomInt(0, 2) : 0;
    const coalitionAffiliations = [];
    for (let c = 0; c < numCoalitions && availableCoalitions.length > 0; c++) {
      const coalition = getRandomElement(availableCoalitions);
      if (!coalitionAffiliations.includes(coalition)) {
        coalitionAffiliations.push(coalition);
      }
    }
    
    // Generate geographic stronghold areas based on ideological alignment
    // Try to use coalition data if available, plus location context
    const coalitionData = null; // Coalition data would need to be passed as a parameter
    const locationContext = {
      countryId: countryId,
      regionId: regionId,
      locationName: locationName,
      level: level
    };
    const strongholdAreas = generateStrongholdAreas(primaryIdeology, level, coalitionData, locationContext);

    const newOutlet = createNewsOutletObject({
      name: generateNewsOutletName(locationName, primaryIdeology),
      type: getRandomElement(mediaTypes),
      level: level === 'regional' ? 'state' : level, // Convert 'regional' to 'state'
      primaryIdeology,
      strongholdAreas,
      credibility: {
        base: getRandomInt(35, 90),
        primaryIdeology,
        ideologicalIntensity,
      },
      coalitionAffiliations,
      biases,
    });

    // Generate staff aligned with the outlet's ideology
    const staff = [];
    const numStaff = getRandomInt(2, 4);
    for (let j = 0; j < numStaff; j++) {
      const staffName = useGameStore.getState().actions.generateDynamicName({
        countryId,
        regionId: level === "state" || level === "regional" ? regionId : null,
      });

      staff.push(
        createJournalistObject({
          name: staffName,
          employerId: newOutlet.id,
          ideologyScores: primaryParty ? { ...primaryParty.ideologyScores } : {},
        })
      );
    }
    newOutlet.staff = staff;
    outlets.push(newOutlet);
  }
  
  return outlets;
};
/**
 * Generates a set of initial lobbying groups for a campaign using archetypes.
 * @param {object} options - Generation options.
 * @param {Array<object>} options.policyQuestions - The list of all policy questions.
 * @param {string} options.countryId - The ID of the country for naming context.
 * @param {number} [options.numGroups=12] - The number of groups to generate.
 * @returns {Array<object>} An array of fully-formed lobbying group objects.
 */
export const generateInitialLobbyingGroups = ({
  policyQuestions,
  countryId,
  numGroups = 12,
}) => {
  const groups = [];
  const availableArchetypes = [...LOBBYING_ARCHETYPES];

  for (let i = 0; i < numGroups; i++) {
    if (availableArchetypes.length === 0) break;

    // Select and remove an archetype to ensure variety
    const archetypeIndex = getRandomInt(0, availableArchetypes.length - 1);
    const archetype = availableArchetypes.splice(archetypeIndex, 1)[0];

    const biases = { alignedPolicies: [], opposedPolicies: [] };

    // Match policies based on keywords and policy direction
    policyQuestions.forEach((pq) => {
      const questionText = `${pq.id} ${pq.description}`.toLowerCase();
      const hasKeyword = archetype.keywords.some((kw) =>
        questionText.includes(kw)
      );

      if (hasKeyword && pq.options && pq.options.length > 1) {
        // 'anti-regulation' groups prefer the first option (e.g., less regulation, lower taxes)
        // 'pro-regulation' groups prefer the last option (e.g., more regulation, higher investment)
        const proOption = pq.options[pq.options.length - 1].value;
        const antiOption = pq.options[0].value;

        if (archetype.policyDirection === "anti-regulation") {
          biases.alignedPolicies.push(antiOption);
          biases.opposedPolicies.push(proOption);
        } else {
          // 'pro-regulation'
          biases.alignedPolicies.push(proOption);
          biases.opposedPolicies.push(antiOption);
        }
      }
    });

    // Skip creating the group if it has no policies to lobby for/against
    if (
      biases.alignedPolicies.length === 0 &&
      biases.opposedPolicies.length === 0
    ) {
      // Add the archetype back to the pool if it wasn't used
      availableArchetypes.push(archetype);
      continue;
    }

    const newGroup = createLobbyingGroupObject({
      name: generateLobbyingGroupName(archetype.focus),
      focus: archetype.focus,
      financialPower: archetype.financialPower + getRandomInt(-10, 10),
      biases,
    });

    const staff = [];
    const numStaff = getRandomInt(1, 4);
    for (let j = 0; j < numStaff; j++) {
      // CORRECTED: Use the store's name generation service
      const staffName = useGameStore
        .getState()
        .actions.generateDynamicName({ countryId });
      staff.push(
        createLobbyistObject({
          name: staffName,
          employerId: newGroup.id,
        })
      );
    }
    newGroup.staff = staff;
    groups.push(newGroup);
  }
  return groups;
};

/**
 * Generates a set of polling firms for a specific political landscape.
 * @param {object} options - Generation options.
 * @param {string} options.level - The level of the pollsters ('national', 'regional').
 * @param {string} options.locationName - Name of the country or region.
 * @returns {Array<object>} An array of fully-formed polling firm objects.
 */
export const generatePollingFirms = ({ level, locationName }) => {
  const firms = [];
  const numFirms = getRandomInt(3, 5);
  const { prefixes, cores, suffixes } = POLLING_FIRM_NAME_COMPONENTS;

  // Use archetypes for some of the firms to ensure variety
  const archetypesToUse = [...POLLING_FIRM_ARCHETYPES].sort(
    () => 0.5 - Math.random()
  );

  for (let i = 0; i < numFirms; i++) {
    let firm;
    if (i < archetypesToUse.length && Math.random() < 0.6) {
      // Create a firm from an archetype
      const archetype = archetypesToUse.pop();
      firm = createPollingFirmObject({
        name: `${locationName} ${archetype.name}`,
        reach: archetype.reach + getRandomInt(-5, 5),
        credibility: archetype.credibility + getRandomInt(-5, 5),
        level,
        biases: {
          ideologicalSkew: archetype.ideologicalSkew + getRandomInt(-1, 1),
          methodologyBias: archetype.methodologyBias,
        },
      });
    } else {
      // Create a procedurally generated firm
      const name = `${getRandomElement(prefixes)} ${getRandomElement(
        cores
      )} ${getRandomElement(suffixes)}`;
      firm = createPollingFirmObject({
        name,
        level,
        biases: { ideologicalSkew: getRandomInt(-4, 4) },
      });
    }
    firms.push(firm);
  }
  return firms;
};

// --- Organization News Response System ---

/**
 * Determines if a lobbying group should respond to a random event
 * @param {object} lobbyingGroup - The lobbying group
 * @param {object} event - The random event
 * @returns {boolean} Whether the group should respond
 */
export const shouldLobbyingGroupRespond = (lobbyingGroup, event) => {
  if (!event || !lobbyingGroup) return false;
  
  // Check if event category matches group's focus keywords
  const eventText = `${event.name} ${event.description} ${event.category}`.toLowerCase();
  const hasRelevantKeywords = lobbyingGroup.focus && 
    LOBBYING_ARCHETYPES.find(arch => arch.focus === lobbyingGroup.focus)?.keywords.some(keyword => 
      eventText.includes(keyword)
    );
  
  if (hasRelevantKeywords) {
    // High severity events get more responses
    const responseChance = {
      'critical': 0.9,
      'major': 0.7,
      'moderate': 0.4,
      'minor': 0.2
    };
    
    return Math.random() < (responseChance[event.severity] || 0.3);
  }
  
  return false;
};

/**
 * Generates a lobbying group's response to a random event
 * @param {object} lobbyingGroup - The lobbying group
 * @param {object} event - The random event
 * @param {object} outlet - The news outlet publishing the response
 * @returns {object} News article object with the group's response
 */
export const generateLobbyingGroupResponse = (lobbyingGroup, event, outlet) => {
  const archetype = LOBBYING_ARCHETYPES.find(arch => arch.focus === lobbyingGroup.focus);
  const isProRegulation = archetype?.policyDirection === "pro-regulation";
  
  // Generate stance based on group's policy direction and event
  let stance = "neutral";
  let statementTone = "measured";
  
  // Economic events
  if (event.category === "economic") {
    if (event.context.jobsLost && isProRegulation) {
      stance = "critical";
      statementTone = "concerned";
    } else if (event.context.jobsCreated && !isProRegulation) {
      stance = "supportive";
      statementTone = "optimistic";
    }
  }
  
  // Environmental events
  if (event.category === "environmental") {
    if (lobbyingGroup.focus.includes("Environmental") || lobbyingGroup.focus.includes("Green")) {
      stance = event.severity === "critical" ? "critical" : "supportive";
      statementTone = "urgent";
    } else if (lobbyingGroup.focus.includes("Fossil Fuel") || lobbyingGroup.focus.includes("Corporate")) {
      stance = "defensive";
      statementTone = "cautious";
    }
  }
  
  // Healthcare events
  if (event.category === "healthcare") {
    if (lobbyingGroup.focus.includes("Healthcare") || lobbyingGroup.focus.includes("Pharmaceutical")) {
      stance = archetype.policyDirection === "pro-regulation" ? "critical" : "defensive";
      statementTone = "professional";
    }
  }
  
  const statements = generateLobbyingStatement(lobbyingGroup, event, stance, statementTone);
  
  return createNewsArticleObject({
    headline: `${lobbyingGroup.name} ${getResponseAction(stance)} on ${event.name}`,
    summary: statements.summary,
    fullBody: {
      paragraphs: statements.paragraphs,
      quotes: statements.quotes
    },
    tone: statementTone,
    outletId: outlet.id,
    date: event.date,
    type: "organization_response",
    context: {
      organizationId: lobbyingGroup.id,
      organizationType: "lobbying_group",
      eventId: event.id,
      stance: stance
    }
  });
};

/**
 * Gets action verb based on stance
 */
const getResponseAction = (stance) => {
  const actions = {
    supportive: ["Endorses", "Supports", "Welcomes", "Applauds"][Math.floor(Math.random() * 4)],
    critical: ["Condemns", "Criticizes", "Opposes", "Denounces"][Math.floor(Math.random() * 4)],
    defensive: ["Responds to", "Addresses", "Comments on", "Clarifies"][Math.floor(Math.random() * 4)],
    neutral: ["Comments on", "Responds to", "Addresses", "Discusses"][Math.floor(Math.random() * 4)]
  };
  return actions[stance] || actions.neutral;
};

/**
 * Generates detailed statement content for lobbying groups
 */
const generateLobbyingStatement = (group, event, stance, tone) => {
  const groupName = group.name;
  const eventName = event.name;
  const context = event.context;
  
  const stanceTemplates = {
    supportive: {
      openings: [
        `${groupName} today applauded the announcement of ${eventName}.`,
        `${groupName} expressed strong support for ${eventName}.`,
        `${groupName} welcomed news of ${eventName} as a positive development.`
      ],
      concerns: [
        "This represents exactly the kind of progress our members have been advocating for.",
        "We believe this development will benefit both our industry and the broader community.",
        "This is a step in the right direction that aligns with our organization's goals."
      ]
    },
    critical: {
      openings: [
        `${groupName} today condemned ${eventName} as harmful to community interests.`,
        `${groupName} expressed serious concerns about ${eventName}.`,
        `${groupName} criticized the handling of ${eventName}.`
      ],
      concerns: [
        "This decision will have serious negative consequences for our members and the community.",
        "We believe this represents poor policy that will harm economic growth and opportunity.",
        "This development threatens the very foundations of what we've worked to build."
      ]
    },
    defensive: {
      openings: [
        `${groupName} responded to reports about ${eventName}.`,
        `${groupName} addressed concerns raised by ${eventName}.`,
        `${groupName} clarified its position regarding ${eventName}.`
      ],
      concerns: [
        "We want to ensure the public has accurate information about this situation.",
        "Our organization remains committed to responsible practices and community benefit.",
        "We will continue to work with all stakeholders to find balanced solutions."
      ]
    }
  };
  
  const template = stanceTemplates[stance] || stanceTemplates.neutral || {
    openings: [`${groupName} commented on ${eventName}.`],
    concerns: ["We are monitoring this situation closely."]
  };
  
  const opening = getRandomElement(template.openings);
  const concern = getRandomElement(template.concerns);
  
  // Add context-specific details
  let contextualInfo = "";
  if (context.jobsLost) {
    contextualInfo = ` With ${context.jobsLost} jobs at stake, this issue affects many of our members directly.`;
  } else if (context.jobsCreated) {
    contextualInfo = ` The creation of ${context.jobsCreated} new positions represents significant economic opportunity.`;
  } else if (context.peopleAffected) {
    contextualInfo = ` With ${context.peopleAffected} people affected, this is clearly a matter of public importance.`;
  }
  
  const quote = `"${concern}${contextualInfo}"`;
  const spokesperson = `${group.staff && group.staff.length > 0 ? group.staff[0].name : 'A spokesperson'}`;
  
  return {
    summary: opening,
    paragraphs: [
      opening,
      `${spokesperson}, speaking for ${groupName}, emphasized the organization's position. ${quote}`,
      `The group indicated it will continue to monitor the situation and engage with policymakers as needed.`
    ],
    quotes: [{
      text: concern + contextualInfo,
      speaker: spokesperson,
      title: `Representative, ${groupName}`
    }]
  };
};
