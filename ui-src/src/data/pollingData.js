export const POLLING_FIRM_NAME_COMPONENTS = {
  prefixes: [
    "Strategic",
    "Public Opinion",
    "Electoral",
    "Apex",
    "Keystone",
    "Summit",
  ],
  cores: ["Analytics", "Polling", "Research", "Strategies", "Insights", "Data"],
  suffixes: ["Group", "LLC", "Consulting", "International", "Partners"],
};

export const POLLING_FIRM_ARCHETYPES = [
  {
    name: "University Polling Center",
    credibility: 90,
    reach: 70,
    ideologicalSkew: 0,
    methodologyBias: "none",
  },
  {
    name: "Major Media Poll",
    credibility: 80,
    reach: 95,
    ideologicalSkew: 1,
    methodologyBias: "likely_voters",
  },
  {
    name: "Partisan Strategy Group (Right)",
    credibility: 50,
    reach: 60,
    ideologicalSkew: 7,
    methodologyBias: "rural",
  },
  {
    name: "Partisan Strategy Group (Left)",
    credibility: 50,
    reach: 60,
    ideologicalSkew: -7,
    methodologyBias: "urban",
  },
  {
    name: "Digital Analytics Firm",
    credibility: 70,
    reach: 80,
    ideologicalSkew: -2,
    methodologyBias: "youth",
  },
];
