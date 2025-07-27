// ui-src/src/data/newsOutletNames.js

/**
 * Provides components for procedurally generating names for entities like news outlets.
 */
export const NEWS_NAME_COMPONENTS = {
  // Prefixes that can start a name
  prefixes: ["The", "Daily", "Evening", "Morning", "Digital", "Online", "City"],

  // Adjectives, often tied to an ideology
  adjectives: {
    Conservative: [
      "Patriot",
      "Liberty",
      "Freedom",
      "Constitutional",
      "Heritage",
      "National",
    ],
    Liberal: ["Progressive", "Forward", "New", "Modern", "Open", "Guardian"],
    Socialist: ["People's", "Worker's", "Equality", "United", "Social"],
    Green: ["Green", "Ecological", "Sustainable", "Earth"],
    Nationalist: ["National", "Sovereign", "Homeland", "Patriot"],
    Libertarian: ["Freedom", "Liberty", "Free Choice", "Independent"],
    Populist: ["People's", "Common Sense", "Citizen's", "Action"],
    // A default set for centrist or non-ideological outlets
    Default: ["News", "Civic", "Public", "Community", "Independent"],
  },

  // The main noun of the publication's name
  suffixes: [
    "Chronicle",
    "Herald",
    "Gazette",
    "Times",
    "Post",
    "Inquirer",
    "Standard",
    "Voice",
    "Report",
    "Journal",
    "Tribune",
    "Sentinel",
    "Observer",
    "Review",
    "Press",
    "Dispatch",
    "Ledger",
  ],

  // The type of media organization
  media_types: ["Broadcasting", "News", "Media", "Digital", "Wire", "Network"],
};
