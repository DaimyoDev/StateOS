// src/entities/organizationEntities.js
import { LOBBYING_NAME_COMPONENTS } from "../data/lobbyingNames";
import { NEWS_NAME_COMPONENTS } from "../data/newsOutletNames";
import { generateId, getRandomElement, getRandomInt } from "../utils/core";
import { generateAICandidateNameForElection } from "./personnel";

const LOBBYING_ARCHETYPES = [
  // Economic
  {
    focus: "Corporate Interests",
    keywords: ["corporate", "business", "deregulate"],
    financialPower: 90,
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
 * Creates a new News Outlet object with detailed properties.
 * @param {object} params - The parameters for the news outlet.
 * @param {string} [params.name] - The name of the publication (e.g., "The National Times").
 * @param {string} [params.type] - The type of outlet (e.g., "Newspaper", "TV/Radio", "Online").
 * @param {number} [params.reach] - The size of its audience (e.g., 1-100).
 * @param {number} [params.credibility] - Public trust in the outlet (e.g., 1-100).
 * @param {Array<object>} [params.staff] - An array of Journalist objects.
 * @param {object} [params.biases] - An object detailing the outlet's biases.
 * @param {object} [params.biases.partyBiases] - Key-value pairs of partyId and bias score (-10 to +10).
 * @param {object} [params.biases.ideologyBiases] - Key-value pairs of ideologyId and bias score.
 * @param {object} [params.biases.policyBiases] - Key-value pairs of policyQuestionId and preferred option value.
 * @returns {object} A new news outlet object.
 */
export const createNewsOutletObject = (params = {}) => ({
  id: `news_${generateId()}`,
  name: params.name || "Unnamed Outlet",
  type: params.type || "Online",
  reach: params.reach || getRandomInt(10, 80),
  credibility: params.credibility || getRandomInt(30, 90),
  staff: params.staff || [],
  biases: params.biases || {
    partyBiases: {}, // e.g., { 'party_123': 8, 'party_456': -5 }
    ideologyBiases: {}, // e.g., { 'conservative': 7, 'socialist': -8 }
    policyBiases: {}, // e.g., { 'healthcare_spending': 'increase_significantly' }
  },
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
  headline: params.headline || "News Occurs",
  summary: params.summary || "Something happened in the city today.",
  // DEPRECATED: body is replaced by fullBody
  body: params.summary || "Further details were not immediately available.",
  fullBody: params.fullBody || {
    paragraphs: [params.summary || "No further details available."],
    quotes: [],
  },
  tone: params.tone || "neutral",
  outletId: params.outletId,
  authorId: params.authorId || null,
  date: params.date,
  type: params.type,
  context: params.context || {},
});

// --- Organization Generation Logic ---

/**
 * Generates a set of news outlets for a specific political landscape (national or regional).
 * @param {object} options - The options for generation.
 * @param {string} options.level - The level of the outlets ('national' or 'regional').
 * @param {Array<object>} options.parties - The list of political parties to base biases on.
 * @param {string} options.locationName - The name of the country or region.
 * @param {string} options.countryId - The ID of the country for naming context.
 * @returns {Array<object>} An array of fully-formed news outlet objects.
 */
export const generateNewsOutlets = ({
  level,
  parties,
  locationName,
  countryId,
}) => {
  const outlets = [];
  const numOutlets = getRandomInt(3, 5); // Generate 3-5 outlets per level
  const mediaTypes = ["Newspaper", "TV/Radio", "Online", "Online"]; // Skew towards online

  const availableParties = [...parties];

  for (let i = 0; i < numOutlets; i++) {
    if (availableParties.length === 0) break;

    const primaryParty = getRandomElement(availableParties);
    // Remove party so it's not picked again as a primary
    const partyIndex = availableParties.findIndex(
      (p) => p.id === primaryParty.id
    );
    if (partyIndex > -1) availableParties.splice(partyIndex, 1);

    const biases = { partyBiases: {}, ideologyBiases: {}, policyBiases: {} };
    biases.partyBiases[primaryParty.id] = getRandomInt(5, 9);
    biases.ideologyBiases[primaryParty.ideology] = getRandomInt(6, 10);

    // Find an opposing party
    const opposingParty = getRandomElement(
      parties.filter((p) => p.ideology !== primaryParty.ideology)
    );
    if (opposingParty) {
      biases.partyBiases[opposingParty.id] = getRandomInt(-9, -5);
    }

    const newOutlet = createNewsOutletObject({
      name: generateNewsOutletName(locationName, primaryParty.ideology),
      type: getRandomElement(mediaTypes),
      level,
      reach: getRandomInt(20, 90),
      credibility: getRandomInt(30, 85),
      biases,
    });

    const staff = [];
    const numStaff = getRandomInt(2, 4);
    for (let j = 0; j < numStaff; j++) {
      staff.push(
        createJournalistObject({
          name: generateAICandidateNameForElection(countryId),
          employerId: newOutlet.id,
          ideologyScores: { ...primaryParty.ideologyScores },
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
 * @param {number} [options.numGroups=7] - The number of groups to generate.
 * @returns {Array<object>} An array of fully-formed lobbying group objects.
 */
export const generateInitialLobbyingGroups = ({
  policyQuestions,
  countryId,
  numGroups = 7,
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
      staff.push(
        createLobbyistObject({
          name: generateAICandidateNameForElection(countryId),
          employerId: newGroup.id,
        })
      );
    }
    newGroup.staff = staff;
    groups.push(newGroup);
  }
  return groups;
};
