export const BASE_IDEOLOGIES = [
  { id: "conservative", name: "Conservative", color: "#3182CE" }, // Blue
  { id: "liberal", name: "Liberal", color: "#E53E3E" }, // Red
  { id: "socialist", name: "Socialist", color: "#D69E2E" }, // Amber/Yellow
  { id: "green", name: "Green", color: "#38A169" }, // Green
  { id: "nationalist", name: "Nationalist", color: "#6B46C1" }, // Purple
  { id: "centrist", name: "Centrist", color: "#718096" }, // Grey
  { id: "libertarian", name: "Libertarian", color: "#FACC15" }, // Gold/Yellow
  { id: "social_democrat", name: "Social Democrat", color: "#E53E3E" }, // Often Red or Rose
  { id: "progressive", name: "Progressive", color: "#9F7AEA" }, // Light Purple / Lavender
  { id: "communist", name: "Communist", color: "#CC0000" }, // Deep Red (classic Communist red)
  { id: "agrarian", name: "Agrarian", color: "#68D391" }, // Light/Earthy Green
  { id: "populist", name: "Populist", color: "#ED8936" }, // Orange
  {
    id: "religious_conservative",
    name: "Religious Conservative",
    color: "#003366",
  },
  { id: "technocratic", name: "Technocratic", color: "#4A5568" }, // Steel Grey or a Cool Blue
  { id: "monarchist", name: "Monarchist", color: "#FFD700" },
];

export const GENERIC_NOUNS = [
  "Party",
  "Union",
  "Alliance",
  "Front",
  "Movement",
  "Coalition",
  "League",
  "Congress",
  "Forum",
  "Assembly",
  "Group",
  "Initiative",
  "Order",
  "Platform",
  "Circle",
  "Network",
  "Association",
  "Federation",
  "Democrats",
  "Republicans",
  "Greens",
];

export const GENERIC_ADJECTIVES = [
  "New",
  "United",
  "Democratic",
  "People's",
  "Free",
  "National",
  "Federal",
  "Progressive",
  "Common",
  "Popular",
  "Modern",
  "Reform",
  "Civic",
  "Citizen's",
  "Radical",
  "Traditional",
  "Independent",
  "Sovereign",
  "United Front of",
  "Authentic",
  "Social",
  "Patriotic",
  "Constitutional",
  "Republican",
  "Labour",
  "Working",
  "True",
];

export const ABSTRACT_NOUNS = [
  "Dawn",
  "Renewal",
  "Future",
  "Path",
  "Voice",
  "Hope",
  "Spring",
  "Pillar",
  "Shield",
  "Beacon",
  "Horizons",
  "Unity",
  "Progress",
  "Action",
  "Heritage",
  "Justice",
  "Liberty",
  "Prosperity",
  "Solidarity",
  "Accord",
  "Generation",
  "Courage",
  "Dignity",
  "Homeland",
  "Sovereignty",
  "Republic",
  "Democracy",
  "Choice",
];

export const IDEOLOGY_KEYWORDS = {
  Default: ["Focus", "Values", "Principles"],
  Conservative: [
    "Conservative",
    "Traditionalist",
    "National",
    "Order",
    "Heritage",
    "Right",
    "Constitutional",
    "Patriots'",
    "Homeland",
    "Family",
  ],
  Liberal: [
    "Liberal",
    "Progressive",
    "Forward",
    "Reform",
    "New",
    "Social Liberal",
    "Democratic Renewal",
    "Open",
    "Liberty",
  ],
  Socialist: [
    "Socialist",
    "Workers'",
    "People's",
    "Labour",
    "Equality",
    "Left",
    "United Left",
    "Social Justice",
  ],
  "Social Democrat": [
    "Social Democratic",
    "Labour",
    "Progressive",
    "People's",
    "Welfare",
    "Solidarity",
  ],
  Libertarian: [
    "Libertarian",
    "Freedom",
    "Liberty",
    "Free Choice",
    "Individualist",
    "Voluntaryist",
    "Minimal State",
  ],
  Green: [
    "Green",
    "Ecological",
    "Planet",
    "Sustainable Future",
    "Earth",
    "Environmental",
  ],
  Nationalist: [
    "National",
    "Patriotic",
    "Own",
    "Sovereign",
    "Homeland First",
    "Identity",
  ],
  Populist: [
    "People's Voice",
    "Citizen's Action",
    "Direct",
    "Common Sense",
    "Anti-Establishment",
    "For the Many",
  ],
  Centrist: [
    "Centre",
    "Moderate",
    "Civic Union",
    "Unity",
    "Balance",
    "Common Ground",
    "Third Way",
  ],
  Progressive: [
    "Forward",
    "Modern",
    "Equality Now",
    "New Society",
    "Liberation",
    "Equity",
  ],
  Communist: [
    "Communist",
    "Workers'",
    "Revolutionary",
    "Vanguard",
    "Proletariat",
    "Red Front",
  ],
  Agrarian: ["Agrarian", "Farmers'", "Rural", "Land", "Heartland", "Grange"],
  "Religious Conservative": [
    "Christian",
    "Faith",
    "Family",
    "Values",
    "Moral",
    "Traditional",
    "Heritage",
  ],
  Technocratic: [
    "Technocratic",
    "Future",
    "Progress",
    "Merit",
    "Reason",
    "Expert",
  ],
  Monarchist: [
    "Monarchist",
    "Royalist",
    "Crown",
    "Loyalist",
    "Throne",
    "Kingdom",
  ],
};

export const IDEOLOGY_DEFINITIONS = {
  conservative: {
    id: "conservative",
    name: "Conservative",
    idealPoint: {
      economic: 2,
      social_traditionalism: 2.5,
      sovereignty: 1.5,
      ecology: -1,
      theocratic: 1,
      digitalization: 0,
      personal_liberty: -0.5,
      authority_structure: 1.5,
      state_intervention_scope: 0.5,
      societal_focus: 1,
      rural_priority: 1,
      governance_approach: -1.5,
    },
  },
  liberal: {
    id: "liberal",
    name: "Liberal",
    idealPoint: {
      economic: -1.5,
      social_traditionalism: -1.5,
      sovereignty: -1.5,
      ecology: 2,
      theocratic: -2,
      digitalization: 1,
      personal_liberty: 2.5,
      authority_structure: -1,
      state_intervention_scope: 1.5,
      societal_focus: -2,
      rural_priority: -0.5,
      governance_approach: 0,
    },
  },
  socialist: {
    id: "socialist",
    name: "Socialist",
    idealPoint: {
      economic: -3.5,
      social_traditionalism: -2,
      sovereignty: -1,
      ecology: 1.5,
      theocratic: -2.5,
      digitalization: 0,
      personal_liberty: -1,
      authority_structure: 1.5,
      state_intervention_scope: 3.5,
      societal_focus: -3.5,
      rural_priority: 0,
      governance_approach: 0,
    },
  },
  green: {
    id: "green",
    name: "Green",
    idealPoint: {
      economic: -1.5,
      social_traditionalism: -2.5,
      sovereignty: -2,
      ecology: 2.5,
      theocratic: -2,
      digitalization: 0,
      personal_liberty: 1.0,
      authority_structure: -1.5,
      state_intervention_scope: 2.0,
      societal_focus: -2.5,
      rural_priority: 1,
      governance_approach: 1.5,
    },
  },
  nationalist: {
    id: "nationalist",
    name: "Nationalist",
    idealPoint: {
      economic: 0.5, // Can vary, often protectionist/national interest
      social_traditionalism: 1.5, // Often, but not always, traditional values
      sovereignty: 4, // Highly Nationalist
      ecology: -1, // National interest may override ecological concerns
      theocratic: 0, // Varies greatly
      digitalization: 0, // Focus on national control of tech if any
      personal_liberty: -1, // National unity/security may trump some liberties
      authority_structure: 2, // Strong state to protect national interests
      state_intervention_scope: 1.5, // State intervention for national goals
      societal_focus: 0, // National Collectivism ("the nation")
      rural_priority: 0.5, // Can have rural appeal
      governance_approach: 1, // Can be populist or elitist, often emphasizes national will
    },
  },
  centrist: {
    id: "centrist",
    name: "Centrist",
    idealPoint: {
      economic: 0,
      social_traditionalism: 0,
      sovereignty: 0,
      ecology: 0,
      theocratic: 0,
      digitalization: 0,
      personal_liberty: 0,
      authority_structure: 0,
      state_intervention_scope: 0,
      societal_focus: 0,
      rural_priority: 0,
      governance_approach: 0,
    },
  },
  libertarian: {
    id: "libertarian",
    name: "Libertarian",
    idealPoint: {
      economic: 3.5, // Strongly Laissez-Faire
      social_traditionalism: 0, // Socially tolerant, focus on liberty
      sovereignty: -1, // Skeptical of national entanglements
      ecology: -2, // Property rights often trump env. regulation
      theocratic: -3, // Strongly Secular
      digitalization: 1.5, // Generally pro-innovation, anti-regulation
      personal_liberty: 4, // Maximal Freedom
      authority_structure: -3.5, // Strongly Decentralized/Anarchic leaning
      state_intervention_scope: -4, // Minimal State
      societal_focus: 3.5, // Strongly Individualist
      rural_priority: 0, // No specific rural/urban bias
      governance_approach: 1, // Suspicious of elites, "leave us alone" populism
    },
  },
  social_democrat: {
    id: "social_democrat",
    name: "Social Democrat",
    idealPoint: {
      economic: -2.5, // Regulated capitalism, strong welfare state
      social_traditionalism: -2.5, // Progressive
      sovereignty: -1.5, // International cooperation
      ecology: 2, // Strong environmental protection
      theocratic: -2, // Secular
      digitalization: 1, // Tech for social good
      personal_liberty: 1.5, // Balances individual rights with social good
      authority_structure: -0.5, // Democratic state, accountable institutions
      state_intervention_scope: 2.5, // Significant state intervention for welfare/regulation
      societal_focus: -2.5, // Strong Collectivist values (social solidarity)
      rural_priority: 0, // Generally no strong bias
      governance_approach: -1, // Generally Institutional, democratic processes
    },
  },
  progressive: {
    id: "progressive",
    name: "Progressive",
    idealPoint: {
      economic: -2.5,
      social_traditionalism: -2,
      sovereignty: -1.5,
      ecology: 2.3,
      theocratic: -3,
      digitalization: 1,
      personal_liberty: 2.5,
      authority_structure: -2,
      state_intervention_scope: 2.5,
      societal_focus: -3,
      rural_priority: 0,
      governance_approach: 2,
    },
  },
  communist: {
    // Based on 20th-century state communism model
    id: "communist",
    name: "Communist",
    idealPoint: {
      economic: -4, // Highly Collectivist, state ownership
      social_traditionalism: 0, // Historically complex, often socially conservative in practice
      sovereignty: 0.5, // Internationalist rhetoric, often nationalist practice
      ecology: -3, // Historically very Development-Focused, poor env. record
      theocratic: -4, // Strongly Secular/Atheist state
      digitalization: -1, // State control of tech, often lagging
      personal_liberty: -3.5, // Severe restrictions on individual freedoms
      authority_structure: 4, // Highly Centralized/Autocratic (Party control)
      state_intervention_scope: 4, // Omnipresent State
      societal_focus: -4, // Forced Collectivism
      rural_priority: 0, // Variable, often forced collectivization/industrialization
      governance_approach: -3.5, // Highly Elitist/Institutional (Party vanguard)
    },
  },
  agrarian: {
    id: "agrarian",
    name: "Agrarian",
    idealPoint: {
      economic: -1, // Support for farmers, co-ops, some protectionism
      social_traditionalism: 2.5, // Often culturally Traditional
      sovereignty: 1.5, // Focus on national food security, localism
      ecology: 2.5, // Connection to land, sustainable practices
      theocratic: 0.5, // Can have religious undertones in traditional communities
      digitalization: -1.5, // Often skeptical of large-scale industrial tech
      personal_liberty: 0, // Community focus can moderate extreme individualism
      authority_structure: -1.5, // Can favor decentralized, local communities
      state_intervention_scope: 1, // Support for agricultural sector
      societal_focus: -1.5, // Community-focused, collectivist within rural context
      rural_priority: 4, // Highly Rural-Centric
      governance_approach: 1.5, // Often Populist, "will of the rural people"
    },
  },
  populist: {
    // Generic, emphasizes style over fixed positions
    id: "populist",
    name: "Populist",
    idealPoint: {
      economic: 0, // Can be left or right
      social_traditionalism: 0, // Can be progressive or traditional
      sovereignty: 2.5, // Often strongly Nationalist ("the people" vs. outsiders)
      ecology: -1, // Often Development-Focused, skeptical of "elite" env. concerns
      theocratic: 0, // Varies
      digitalization: 0, // Can use it extensively or be skeptical of tech elites
      personal_liberty: 0, // Focus on "the people's will", not necessarily individual liberty
      authority_structure: 1.5, // Often favors a strong leader representing "the people"
      state_intervention_scope: 0, // Varies based on left/right populism
      societal_focus: 0, // "Us vs. Them" collectivism
      rural_priority: 0, // Can be rural or urban focused
      governance_approach: 3.5, // Highly Populist/Direct Will
    },
  },
  religious_conservative: {
    id: "religious_conservative",
    name: "Religious Conservative",
    idealPoint: {
      economic: 1.5, // Generally Laissez-Faire leaning
      social_traditionalism: 3.5, // Highly Traditional, based on religious doctrine
      sovereignty: 1, // Nationalist leaning
      ecology: 0, // Neutral or secondary to religious/social concerns
      theocratic: 3.5, // Strongly Theocratic, religious principles in law
      digitalization: -1, // May be skeptical of modern tech's social impact
      personal_liberty: -3, // Religious morality prioritized over individual choice
      authority_structure: 2.5, // Prefers strong moral/religious authority
      state_intervention_scope: 2, // State intervention to uphold religious/moral values
      societal_focus: -1.5, // Collectivist based on religious community values
      rural_priority: 0.5, // Often strong in rural/traditional areas
      governance_approach: -1, // Can be institutional (via religious bodies) or populist
    },
  },
  technocratic: {
    id: "technocratic",
    name: "Technocratic",
    idealPoint: {
      economic: 0, // Efficiency-driven, could be collectivist or market if "efficient"
      social_traditionalism: 0, // Decisions based on data, not tradition/progressivism
      sovereignty: -1, // May favor international standards for efficiency
      ecology: 1.5, // Data might show need for ecological measures/efficient resource use
      theocratic: -3, // Strongly Secular, expert-driven
      digitalization: 4, // Highly Pro-Digital, data-driven governance
      personal_liberty: -1.5, // Individual choices may be overridden by "expert" decisions
      authority_structure: 3, // Centralized expert bodies making decisions
      state_intervention_scope: 2, // State implements expert-driven plans
      societal_focus: 0, // Focus on system efficiency
      rural_priority: 0, // Decisions based on data, not urban/rural preference
      governance_approach: -3.5, // Highly Elitist/Institutional, rule by experts
    },
  },
  monarchist: {
    id: "monarchist",
    name: "Monarchist",
    idealPoint: {
      economic: 0.5, // Historically varied
      social_traditionalism: 3.5, // Highly Traditional, hierarchical society
      sovereignty: 2.5, // Strongly Nationalist (monarch embodies nation)
      ecology: -1, // Historically, crown/state resource use prioritized
      theocratic: 2, // Often divine right or strong link to established religion
      digitalization: -1.5, // Skeptical of tech disrupting hierarchy
      personal_liberty: -3, // Order > Choice, subject's duty
      authority_structure: 4, // Highly Centralized/Autocratic (Monarch as sovereign)
      state_intervention_scope: 2.5, // Monarch directs state
      societal_focus: 0.5, // Hierarchical societal good, not modern collectivism/individualism
      rural_priority: 1, // Landed aristocracy, traditional rural power base
      governance_approach: -4, // Highly Elitist/Institutional (Hereditary rule)
    },
  },
};
