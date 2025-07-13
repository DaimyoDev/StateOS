export const STATES_DATA = [
  // --- Example for a U.S. State: Texas ---
  {
    id: "TX",
    name: "Texas",
    countryId: "USA", // Links to an ID in your countriesData.js
    type: "state", // 'state', 'prefecture', 'province', etc.
    population: 30000000, // Example initial total population (static)
    capitalCityId: "Austin", // Links to a city ID in your cityData.js
    majorCities: ["Houston", "San_Antonio", "Dallas", "Austin"], // IDs of major cities within this state
    politicalLeaning: "Conservative", // General political leanings (static baseline)
    regionalIssues: [
      "Border Security",
      "Energy Policy",
      "Public Education Funding",
    ], // Key static issues for the state
    initialStats: {
      // Baseline stats that will be copied to dynamic state object
      economy: "Stable",
      unemploymentRate: 5.2,
      gdpGrowth: 3.1,
      infrastructureQuality: "Average",
      educationQuality: "Average",
      healthcareAccess: "Moderate",
      crimeRate: "Moderate",
      environmentalHealth: "Moderate",
      overallCitizenMood: "Content",
      budgetBalance: "Balanced", // This is initial, will become dynamic
    },
    politicalLandscape: [
      // Baseline party popularities for the state
      {
        id: "democrat",
        name: "Democratic Party",
        popularity: 45,
        color: "#2B579A",
      },
      {
        id: "republican",
        name: "Republican Party",
        popularity: 53,
        color: "#E41B23",
      },
    ],
    // If you plan for legislative districts within states, you might define
    // properties here that influence their generation (e.g., numDistricts, gerrymandering tendencies)
  },

  // --- Example for a Japanese Prefecture: Tokyo ---
  {
    id: "Tokyo",
    name: "Tokyo Prefecture",
    countryId: "JPN",
    type: "prefecture",
    population: 14000000,
    capitalCityId: "Tokyo", // The capital city might share the prefecture's name
    majorCities: ["Shinjuku", "Shibuya", "Taito"], // Major sub-city areas or wards
    politicalLeaning: "Liberal",
    regionalIssues: [
      "Aging Population",
      "Urban Development",
      "Disaster Preparedness",
    ],
    initialStats: {
      economy: "Booming",
      unemploymentRate: 2.5,
      gdpGrowth: 1.8,
      infrastructureQuality: "Excellent",
      educationQuality: "Excellent",
      healthcareAccess: "Excellent",
      crimeRate: "Low",
      environmentalHealth: "Poor", // Due to high population density
      overallCitizenMood: "Optimistic",
      budgetBalance: "Surplus",
    },
    politicalLandscape: [
      {
        id: "ldp",
        name: "Liberal Democratic Party",
        popularity: 60,
        color: "#6A5ACD",
      },
      {
        id: "cdp",
        name: "Constitutional Democratic Party",
        popularity: 20,
        color: "#1E90FF",
      },
    ],
  },
  // Add more states/prefectures as your simulation expands to cover more regions.
  // Ensure their 'id' matches the 'regionId' used in countriesData.js if applicable.
];
