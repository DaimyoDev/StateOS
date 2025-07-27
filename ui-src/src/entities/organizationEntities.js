// src/entities/organizationEntities.js
import { generateId, getRandomElement, getRandomInt } from "../utils/core";
import { generateAICandidateNameForElection } from "./personnel";

/**
 * Generates a plausible name for a news outlet.
 * @param {string} locationName - The name of the country or region.
 * @param {string} ideologyName - The primary ideology of the outlet.
 * @returns {string} A generated news outlet name.
 */
const generateNewsOutletName = (locationName, ideologyName) => {
  const templates = [
    `The ${locationName} Times`,
    `${locationName} Daily Chronicle`,
    `${locationName} Post`,
    `${locationName} Broadcasting Network`,
    `${ideologyName} Voice Media`,
    `The ${locationName} Inquirer`,
    `${locationName} Today`,
    `The ${ideologyName} Standard`,
  ];
  return getRandomElement(templates);
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
 * @param {string} [params.body] - The full text for newspapers/online, or a transcript for TV/Radio.
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
  body: params.body || "",
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
 * Generates a set of initial lobbying groups for a campaign.
 * @param {Array<object>} policyQuestions - The list of all policy questions.
 * @param {string} countryId - The ID of the country for naming context.
 * @returns {Array<object>} An array of fully-formed lobbying group objects.
 */
export const generateInitialLobbyingGroups = (policyQuestions, countryId) => {
  const groups = [];
  const archetypes = [
    {
      name: "National Corporate Association",
      focus: "Economic Deregulation, Tax Cuts",
      financialPower: 90,
      keywords: ["corporate", "business", "deregulate"],
    },
    {
      name: "Eco-Justice League",
      focus: "Environmental Protection",
      financialPower: 60,
      keywords: ["green", "carbon", "renewables", "eco"],
    },
    {
      name: "Federated Labor Unions",
      focus: "Worker Rights",
      financialPower: 70,
      keywords: ["union", "workers", "wage", "collective"],
    },
    {
      name: "Citizen Arms Advocates",
      focus: "Firearm Ownership Rights",
      financialPower: 80,
      keywords: ["firearm", "gun"],
    },
    {
      name: "Digital Innovation Alliance",
      focus: "Tech Industry Growth",
      financialPower: 85,
      keywords: ["tech", "ai", "innovation", "digital"],
    },
  ];

  for (const archetype of archetypes) {
    const biases = { alignedPolicies: [], opposedPolicies: [] };

    // Find policies that match the group's focus
    policyQuestions.forEach((pq) => {
      const questionText = `${pq.id} ${pq.question}`.toLowerCase();
      if (archetype.keywords.some((kw) => questionText.includes(kw))) {
        // Simple logic: assume the first option is pro-status quo/pro-business and the last is most radical change
        if (pq.options && pq.options.length > 1) {
          if (
            archetype.name.includes("Corporate") ||
            archetype.name.includes("Arms") ||
            archetype.name.includes("Digital")
          ) {
            biases.alignedPolicies.push(pq.options[0].value);
            biases.opposedPolicies.push(
              pq.options[pq.options.length - 1].value
            );
          } else {
            // Labor, Eco groups
            biases.alignedPolicies.push(
              pq.options[pq.options.length - 1].value
            );
            biases.opposedPolicies.push(pq.options[0].value);
          }
        }
      }
    });

    const newGroup = createLobbyingGroupObject({
      name: archetype.name,
      focus: archetype.focus,
      financialPower: archetype.financialPower + getRandomInt(-15, 15),
      biases,
    });

    // Generate staff for the group
    const staff = [];
    const numStaff = getRandomInt(1, 3);
    for (let i = 0; i < numStaff; i++) {
      const lobbyist = createLobbyistObject({
        name: generateAICandidateNameForElection(countryId), // Re-using for name generation
        employerId: newGroup.id,
      });
      staff.push(lobbyist);
    }
    newGroup.staff = staff;
    groups.push(newGroup);
  }
  return groups;
};
