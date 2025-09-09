// ui-src/src/data/politicalDonationLaws.js

export const DONATION_LAWS = {
  UNRESTRICTED: {
    id: "UNRESTRICTED",
    name: "Unrestricted Donations",
    description: "No limits on political donations from any source",
    individualLimit: null, // null = unlimited
    corporateLimit: null,
    unionLimit: null,
    foreignDonationsAllowed: true,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: null,
    transparencyThreshold: null, // Amount above which donations must be disclosed
    restrictions: []
  },

  MODERATE_LIMITS: {
    id: "MODERATE_LIMITS",
    name: "Moderate Donation Limits",
    description: "Basic limits on individual and corporate donations",
    individualLimit: 50000, // per election cycle
    corporateLimit: 100000,
    unionLimit: 100000,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: 5000,
    transparencyThreshold: 10000,
    restrictions: ["no_foreign", "disclosure_required"]
  },

  STRICT_LIMITS: {
    id: "STRICT_LIMITS",
    name: "Strict Donation Limits",
    description: "Low limits with strong transparency requirements",
    individualLimit: 10000,
    corporateLimit: 25000,
    unionLimit: 25000,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: 1000,
    transparencyThreshold: 2500,
    restrictions: ["no_foreign", "disclosure_required", "limited_corporate"]
  },

  VERY_STRICT: {
    id: "VERY_STRICT",
    name: "Very Strict Limits",
    description: "Very low limits with comprehensive oversight",
    individualLimit: 5000,
    corporateLimit: 10000,
    unionLimit: 10000,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: false,
    maxAnonymousAmount: 0,
    transparencyThreshold: 1000,
    restrictions: ["no_foreign", "no_anonymous", "disclosure_required", "limited_corporate"]
  },

  INDIVIDUAL_ONLY: {
    id: "INDIVIDUAL_ONLY",
    name: "Individual Donations Only",
    description: "Only individual citizens can donate, no corporate or union money",
    individualLimit: 25000,
    corporateLimit: 0,
    unionLimit: 0,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: 2500,
    transparencyThreshold: 5000,
    restrictions: ["no_corporate", "no_union", "no_foreign", "disclosure_required"]
  },

  PUBLIC_FUNDING_ONLY: {
    id: "PUBLIC_FUNDING_ONLY",
    name: "Public Funding Only",
    description: "All campaign funding comes from public sources, private donations prohibited",
    individualLimit: 0,
    corporateLimit: 0,
    unionLimit: 0,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: false,
    maxAnonymousAmount: 0,
    transparencyThreshold: 0,
    restrictions: ["public_funding_only", "no_private_donations"]
  },

  SMALL_DONOR_FOCUS: {
    id: "SMALL_DONOR_FOCUS",
    name: "Small Donor Focused",
    description: "Low individual limits to encourage small donor participation",
    individualLimit: 2500,
    corporateLimit: 5000,
    unionLimit: 5000,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: 500,
    transparencyThreshold: 500,
    restrictions: ["no_foreign", "small_donations_encouraged", "disclosure_required"]
  },

  CORPORATE_FRIENDLY: {
    id: "CORPORATE_FRIENDLY",
    name: "Corporate-Friendly System",
    description: "Higher limits for corporate donations with basic oversight",
    individualLimit: 25000,
    corporateLimit: 500000,
    unionLimit: 250000,
    foreignDonationsAllowed: false,
    anonymousDonationsAllowed: true,
    maxAnonymousAmount: 10000,
    transparencyThreshold: 25000,
    restrictions: ["no_foreign", "disclosure_required"]
  }
};

export const getDonationLawById = (lawId) => {
  return DONATION_LAWS[lawId] || DONATION_LAWS.MODERATE_LIMITS;
};

export const getAllDonationLaws = () => {
  return Object.values(DONATION_LAWS);
};

// Helper functions for checking donation eligibility
export const canDonate = (donationLaw, donorType, amount, isAnonymous = false, isForeign = false) => {
  if (!donationLaw) return false;

  // Check if foreign donations are allowed
  if (isForeign && !donationLaw.foreignDonationsAllowed) {
    return false;
  }

  // Check anonymous donation rules
  if (isAnonymous && !donationLaw.anonymousDonationsAllowed) {
    return false;
  }

  if (isAnonymous && donationLaw.maxAnonymousAmount !== null && amount > donationLaw.maxAnonymousAmount) {
    return false;
  }

  // Check donation limits by type
  switch (donorType) {
    case 'individual':
      return donationLaw.individualLimit === null || amount <= donationLaw.individualLimit;
    case 'corporate':
      return donationLaw.corporateLimit === null || amount <= donationLaw.corporateLimit;
    case 'union':
      return donationLaw.unionLimit === null || amount <= donationLaw.unionLimit;
    default:
      return false;
  }
};

export const requiresDisclosure = (donationLaw, amount) => {
  return donationLaw.transparencyThreshold !== null && amount >= donationLaw.transparencyThreshold;
};