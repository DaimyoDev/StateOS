// ui-src/src/data/lobbyingArchetypes.js

/**
 * Provides archetypes for procedurally generating lobbying groups with realistic
 * focuses, financial power, and policy directions.
 */
export const LOBBYING_ARCHETYPES = [
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