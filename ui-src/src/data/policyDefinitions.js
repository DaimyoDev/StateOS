// ui-src/src/data/policyDefinitions.js

import { POLICY_AREAS } from "./policyAreas";

const MINIMUM_WAGE_POLICY = {
  id: "econ004_parameterized",
  name: "Set Minimum Wage",
  area: POLICY_AREAS.ECONOMY,
  description: "Establish or change the legal minimum wage. This can affect unemployment, business costs, and worker income.",
  tags: ["economy", "labor", "regulation", "minimum_wage", "parameterized"],
  baseSupport: {
    Socialist: 0.9,
    Progressive: 0.8,
    Liberal: 0.4,
    Centrist: -0.1,
    Conservative: -0.6,
    Libertarian: -0.8,
  },
  cost: { politicalCapital: 6 },
  durationToImplement: 2,
  isParameterized: true,
  // This flag indicates that the law itself sets a persistent value rather than just triggering one-off effects.
  setsSimulationVariable: true, 
  parameterDetails: {
    key: "wageRate",
    // This will target the city laws section where it's displayed
    targetStat: "cityLaws.minimumWage", 
    adjustmentType: "set_value",
    valueType: "absolute_amount",
    min: 0,
    max: 50,
    step: 0.25,
    defaultValue: 15.00,
    unit: "$/hour",
    prompt: "Set the new minimum wage (per hour):",
  },
  effects: [
    {
      targetStat: "povertyRate",
      type: "percentage_point_change",
      // Higher minimum wage reduces poverty by improving worker income
      change: -0.5, 
      chance: 0.8,
      delay: 3,
    },
    {
      targetStat: "overallCitizenMood",
      type: "mood_shift",
      // Workers appreciate higher wages
      change: 1,
      chance: 0.6,
      delay: 2,
    },
    {
      targetStat: "unemploymentRate",
      type: "percentage_point_change",
      // Minimal unemployment effect based on modern economic research
      change: 0.05, 
      chance: 0.2,
      delay: 6,
    },
  ],
};

export const CITY_POLICIES = [
  {
    id: "ps001_parameterized",
    name: "Adjust Police Department Funding",
    area: POLICY_AREAS.PUBLIC_SAFETY,
    description:
      "Modify the annual budget allocation for the Police Department.",
    tags: ["public_safety", "budget", "spending", "parameterized"],
    baseSupport: {
      Conservative: 0.6,
      Nationalist: 0.5,
      Liberal: -0.1,
      Socialist: -0.3,
      Centrist: 0.1,
      Libertarian: -0.2,
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "policeDepartment",
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -50000000,
      max: 50000000,
      step: 1,
      defaultValue: 100000,
      unit: "$",
      prompt:
        "Enter amount to change Police Dept. budget by (e.g., 100000 or -50000):",
    },
    effects: [
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.4,
        description_template:
          "Citizen mood may shift based on changes to police funding.",
      },
      {
        targetStat: "playerApproval",
        type: "conditional_approval_shift",
        chance: 0.5,
        ifPlayerProposer: true,
        description_template:
          "Your approval may change based on your proposed police budget adjustment.",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "criminal_justice_reform",
        alignsWithOptionValues: ["tough_on_crime_police_funding"],
        opposesOptionValues: ["rehabilitation_decriminalization"],
      },
      {
        questionId: "police_reform_accountability",
        alignsWithOptionValues: ["support_law_enforcement_oppose_hindrance"],
        opposesOptionValues: ["end_qualified_immunity_misconduct_registry"],
      },
    ],
  },
  {
    id: "ps002_parameterized", // Parameterized version
    name: "Fund Community Policing Initiative",
    area: POLICY_AREAS.PUBLIC_SAFETY,
    description:
      "Invest a chosen amount in programs to build better relationships between police and community members, focusing on de-escalation and local engagement.",
    tags: [
      "public_safety",
      "policing",
      "social_program",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Liberal: 0.7,
      Progressive: 0.8,
      Socialist: 0.5,
      Green: 0.4,
      Conservative: 0.1,
      Centrist: 0.5,
      Libertarian: 0.2,
    },
    cost: { politicalCapital: 3 }, // Political capital cost remains
    durationToImplement: 3,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "policeDepartment", // Or a new sub-category like "communityPolicingPrograms"
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 50000,
      max: 10000000,
      step: 1000,
      defaultValue: 250000,
      unit: "$",
      prompt: "Enter funding amount for Community Policing Initiative:",
    },
    effects: [
      {
        targetStat: "publicSafetyRating",
        change: 1,
        type: "level_change",
        chance: 0.5,
        delay: 3,
      }, // Kept as a direct small boost, main effect via funding
      {
        targetStat: "overallCitizenMood",
        change: 1,
        type: "mood_shift",
        chance: 0.6,
      },
      // The budget.annualExpenses effect is now handled by the parameter
    ],
    relevantPolicyQuestions: [
      {
        questionId: "criminal_justice_reform",
        alignsWithOptionValues: [
          "community_policing_root_causes",
          "reform_sentencing_reentry",
        ],
        opposesOptionValues: ["tough_on_crime_police_funding"],
      },
      {
        questionId: "police_reform_accountability",
        alignsWithOptionValues: [
          "community_oversight_review_boards",
          "funding_deescalation_body_cameras",
        ],
      },
    ],
  },
  {
    id: "ps003_parameterized", // Parameterized version
    name: "Invest in Street Lighting Upgrades",
    area: POLICY_AREAS.PUBLIC_SAFETY,
    description:
      "Improve visibility and perceived safety by investing in new or upgraded street lighting. Recurring maintenance costs will also apply.",
    tags: ["public_safety", "infrastructure", "spending", "parameterized"],
    baseSupport: { Centrist: 0.6, Conservative: 0.4, Liberal: 0.3 },
    cost: { politicalCapital: 2 },
    durationToImplement: 2,
    isParameterized: true,
    parameterDetails: {
      key: "initialInvestment",
      targetBudgetLine: "roadInfrastructure", // Or a specific "streetLighting" budget line
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 50000,
      max: 10000000,
      step: 1000,
      defaultValue: 150000,
      unit: "$",
      prompt: "Enter initial investment for street lighting upgrades:",
    },
    effects: [
      {
        targetStat: "publicSafetyRating",
        change: 1,
        type: "level_change",
        chance: 0.4,
      },
      // Initial cost handled by parameter. Recurring cost remains.
      {
        targetStat: "budget.expenseAllocations.roadInfrastructure", // Assuming maintenance is part of this
        change: 20000, // This is the fixed recurring part
        type: "absolute_change_recurring", // Your policySlice needs to handle this type
        description_note: "Represents annual maintenance for new lights.",
      },
    ],
    relevantPolicyQuestions: [
      {
        // Loosely related to general infrastructure investment
        questionId: "infrastructure_investment",
        alignsWithOptionValues: [
          "large_federal_investment_taxes",
          "prioritize_maintenance_repair",
        ],
      },
    ],
  },
  {
    id: "econ001",
    name: "Tax Incentives for New Businesses",
    area: POLICY_AREAS.ECONOMY,
    description:
      "Offer tax breaks to attract new businesses to the city, aiming to create jobs and stimulate growth.",
    baseSupport: {
      Conservative: 0.7,
      Libertarian: 0.9,
      Liberal: 0.3,
      Nationalist: 0.2,
      Socialist: -0.5,
      Green: -0.2,
      Technocratic: 0.6,
    },
    cost: { budget: -300000, politicalCapital: 4 }, // Negative budget impact (lost revenue)
    durationToImplement: 3,
    effects: [
      {
        targetStat: "economicOutlook",
        change: 1,
        type: "level_change",
        chance: 0.6,
      },
      {
        targetStat: "unemploymentRate",
        change: -0.5,
        type: "percentage_point_change",
        chance: 0.5,
      },
      {
        targetStat: "budget.annualIncome",
        change: -300000,
        type: "absolute_change",
      }, // Represents the tax break cost
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth", // Related to business taxation philosophy
        alignsWithOptionValues: ["cut_taxes_corps", "status_quo_growth"],
        opposesOptionValues: ["increase_wealth_tax", "moderate_increase_top"],
      },
    ],
  },
  {
    id: "econ002_parameterized",
    name: "Fund Job Training Programs",
    area: POLICY_AREAS.ECONOMY,
    description:
      "Invest a chosen amount in programs to help unemployed or underemployed citizens gain new skills for in-demand jobs.",
    tags: [
      "economic_development",
      "education",
      "social_services",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Socialist: 0.8,
      SocialDemocrat: 0.7,
      Progressive: 0.6,
      Liberal: 0.4,
      Centrist: 0.3,
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 3,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "socialWelfarePrograms", // Or a new "jobTraining" line
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 100000,
      max: 10000000,
      step: 1000,
      defaultValue: 400000,
      unit: "$",
      prompt: "Enter funding amount for Job Training Programs:",
    },
    effects: [
      {
        targetStat: "unemploymentRate",
        change: -0.3,
        type: "percentage_point_change",
        chance: 0.65,
        delay: 6,
      },
      {
        targetStat: "educationQuality",
        change: 1,
        type: "level_change",
        chance: 0.2,
        delay: 6,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "education_funding", // Related as it's a form of skill development
        alignsWithOptionValues: [
          "massive_increase_public",
          "teacher_salaries_resources",
        ],
      },
      {
        questionId: "social_security", // Broader social safety net question
        alignsWithOptionValues: ["raise_cap_increase_payroll"], // If seen as government support
      },
    ],
  },
  {
    id: "econ003_parameterized",
    name: "Fund Small Business Startup Support",
    area: POLICY_AREAS.ECONOMY,
    description:
      "Provide a chosen amount in grants and mentorship programs for local entrepreneurs starting small businesses.",
    tags: [
      "economic_development",
      "small_business",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Liberal: 0.6,
      Centrist: 0.5,
      Libertarian: 0.4,
      Conservative: 0.3,
    },
    cost: { politicalCapital: 3 },
    durationToImplement: 3,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "cityPlanningAndDevelopment", // Or a specific "smallBusinessSupport" line
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 50000,
      max: 10000000,
      step: 1000,
      defaultValue: 300000,
      unit: "$",
      prompt: "Enter funding for Small Business Startup Support:",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        change: 1,
        type: "level_change",
        chance: 0.4,
        delay: 6,
      },
      {
        targetStat: "unemploymentRate",
        change: -0.2,
        type: "percentage_point_change",
        chance: 0.3,
        delay: 9,
      },
    ],
    relevantPolicyQuestions: [
      {
        // No direct question, but general economic approach
        questionId: "trade_policy", // Loosely, if it implies domestic focus
        alignsWithOptionValues: ["reduce_reliance_self_sufficiency"],
      },
    ],
  },

  // --- HOUSING & DEVELOPMENT (New Area + Policies) ---
  {
    id: "house001_parameterized",
    name: "Fund Affordable Housing Development",
    area: POLICY_AREAS.HOUSING,
    description:
      "Invest a chosen amount of city funds into the construction or subsidization of new affordable housing units.",
    tags: [
      "housing",
      "social_welfare",
      "spending",
      "urban_development",
      "parameterized",
    ],
    baseSupport: {
      Socialist: 0.9,
      SocialDemocrat: 0.8,
      Progressive: 0.7,
      Green: 0.4,
      Liberal: 0.2,
      Centrist: 0.1,
    },
    cost: { politicalCapital: 6 },
    durationToImplement: 18, // Housing projects take time
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "socialWelfarePrograms", // Or a dedicated "housingDevelopment" line
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 250000,
      max: 10000000,
      step: 1000,
      defaultValue: 1000000,
      unit: "$",
      prompt: "Enter funding amount for Affordable Housing:",
    },
    effects: [
      {
        targetStat: "overallCitizenMood",
        change: 1,
        type: "mood_shift",
        condition: "mainIssue_is_Housing",
        chance: 0.6,
        delay: 12,
      },
      // Consider adding a new stat like "housingAffordabilityIndex" or "homelessnessRate"
    ],
    relevantPolicyQuestions: [
      {
        questionId: "affordable_housing",
        alignsWithOptionValues: [
          "public_investment_social_housing_rent_control",
          "expand_vouchers_homebuyer_support",
        ],
      },
    ],
  },
  {
    id: "house002",
    name: "Streamline Zoning for Denser Housing",
    area: POLICY_AREAS.HOUSING,
    description:
      "Reform zoning laws to allow for more multi-family homes and denser development in designated areas.",
    baseSupport: {
      Libertarian: 0.8,
      Liberal: 0.5,
      Technocratic: 0.7,
      Conservative: -0.4,
      Green: -0.3,
    }, // Greens might oppose if not eco-friendly
    cost: { politicalCapital: 5 }, // No direct budget cost, but politically contentious
    durationToImplement: 6, // Time for new constructions to start appearing
    effects: [
      // { targetStat: "housingAffordability", change: 1, type: "level_change", chance: 0.55 },
      {
        targetStat: "economicOutlook",
        change: 1,
        type: "level_change",
        chance: 0.3,
      }, // Construction jobs
    ],
    relevantPolicyQuestions: [
      {
        questionId: "affordable_housing",
        alignsWithOptionValues: [
          "local_zoning_reform_density",
          "incentivize_private_development_deregulation",
        ],
        opposesOptionValues: ["public_investment_social_housing_rent_control"], // If seen as purely market-driven vs public
      },
    ],
  },

  // --- INFRASTRUCTURE & TRANSPORT ---
  {
    id: "infra001_parameterized",
    name: "Fund Major Road Repair Initiative",
    area: POLICY_AREAS.INFRASTRUCTURE,
    description:
      "Launch a city-wide program with a chosen budget to repair and repave major roads and thoroughfares.",
    tags: ["infrastructure", "transportation", "spending", "parameterized"],
    baseSupport: {
      Centrist: 0.7,
      Conservative: 0.5,
      Liberal: 0.4,
      Technocratic: 0.6,
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 9,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "roadInfrastructure",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 200000,
      max: 10000000,
      step: 1000,
      defaultValue: 750000,
      unit: "$",
      prompt: "Enter funding for Road Repair Initiative:",
    },
    effects: [
      {
        targetStat: "infrastructureState",
        change: 1,
        type: "level_change",
        chance: 0.7,
        delay: 6,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "infrastructure_investment",
        alignsWithOptionValues: [
          "large_federal_investment_taxes",
          "prioritize_maintenance_repair",
        ],
      },
    ],
  },
  {
    id: "infra002_parameterized",
    name: "Invest in Public Transit Expansion",
    area: POLICY_AREAS.INFRASTRUCTURE,
    description:
      "Invest a chosen amount in new bus routes, light rail, or subway extensions to improve public transportation.",
    tags: [
      "infrastructure",
      "transportation",
      "environment",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Progressive: 0.8,
      Green: 0.7,
      Socialist: 0.6,
      Liberal: 0.5,
      Technocratic: 0.4,
    },
    cost: { politicalCapital: 7 },
    durationToImplement: 24, // Major projects
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "publicTransit",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 500000,
      max: 10000000,
      step: 1000,
      defaultValue: 1200000,
      unit: "$",
      prompt: "Enter investment amount for Public Transit Expansion:",
    },
    effects: [
      {
        targetStat: "infrastructureState",
        change: 1,
        type: "level_change",
        chance: 0.6,
        delay: 12,
      },
      {
        targetStat: "overallCitizenMood",
        change: 1,
        type: "mood_shift",
        chance: 0.4,
        delay: 18,
      },
      {
        targetStat: "environmentRating",
        change: 1,
        type: "level_change",
        chance: 0.3,
        delay: 24,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "infrastructure_investment",
        alignsWithOptionValues: ["large_federal_investment_taxes"],
      },
      {
        // Also relates to environmental goals
        questionId: "environmental_regulation",
        alignsWithOptionValues: ["strict_green_transition"],
      },
    ],
  },

  // --- EDUCATION ---
  {
    id: "edu001_parameterized",
    name: "Adjust School Funding",
    area: POLICY_AREAS.EDUCATION,
    description:
      "Modify the annual budget for public schools, affecting resources, teacher salaries, and program enhancements.",
    tags: ["education", "budget", "spending", "parameterized"],
    baseSupport: {
      Progressive: 0.9,
      SocialDemocrat: 0.8,
      Liberal: 0.6,
      Socialist: 0.7,
      Centrist: 0.3,
    },
    cost: { politicalCapital: 5 },
    durationToImplement: 1, // Budget changes affect next school year/term
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "publicEducation",
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -5000000,
      max: 10000000,
      step: 1000,
      defaultValue: 600000,
      unit: "$",
      prompt: "Enter amount to change School Funding by:",
    },
    effects: [
      // Direct effect on educationQuality will be simulated monthly based on new funding level
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.5,
        description_template:
          "Public mood may change with school funding adjustments.",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "education_funding",
        // AI voting logic will need to check if parameter is increase or decrease
        alignsWithOptionValues: [
          "massive_increase_public",
          "teacher_salaries_resources",
          "local_control_performance",
        ], // Some overlap
        opposesOptionValues: ["school_choice_vouchers"], // If seen as undermining public system
      },
      {
        questionId: "student_loan_debt", // Broader education philosophy
        alignsWithOptionValues: [
          "tuition_free_debt_free",
          "increase_pell_grants_work_study",
        ],
      },
    ],
  },

  // --- ENVIRONMENT & SUSTAINABILITY ---
  {
    id: "env001_parameterized",
    name: "Fund Recycling Program Expansion",
    area: POLICY_AREAS.ENVIRONMENT,
    description:
      "Invest a chosen amount to expand curbside recycling services and public awareness campaigns.",
    tags: [
      "environment",
      "sustainability",
      "local_services",
      "spending",
      "parameterized",
    ],
    baseSupport: { Green: 0.9, Progressive: 0.6, Liberal: 0.4, Centrist: 0.2 },
    cost: { politicalCapital: 3 },
    durationToImplement: 4,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "wasteManagement", // Or new 'recyclingProgram' line
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 50000,
      max: 10000000,
      step: 1000,
      defaultValue: 200000,
      unit: "$",
      prompt: "Enter funding for Recycling Program Expansion:",
    },
    effects: [
      {
        targetStat: "environmentRating",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.5,
        condition: "Green_party_strong_or_Pollution_is_issue",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "environmental_regulation",
        alignsWithOptionValues: [
          "strict_green_transition",
          "balanced_regulation",
        ],
      },
    ],
  },
  {
    id: "env002_parameterized",
    name: "Invest in Green Spaces & Parks Development",
    area: POLICY_AREAS.ENVIRONMENT,
    description:
      "Allocate a chosen amount for the development and maintenance of city parks and green recreational areas.",
    tags: ["environment", "parks_recreation", "spending", "parameterized"],
    baseSupport: { Green: 0.8, Liberal: 0.5, Progressive: 0.4, Centrist: 0.3 },
    cost: { politicalCapital: 4 },
    durationToImplement: 12,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "parksAndRecreation",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 100000,
      max: 10000000,
      step: 1000,
      defaultValue: 450000,
      unit: "$",
      prompt: "Enter funding for Green Spaces & Parks:",
    },
    effects: [
      {
        targetStat: "environmentRating",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.6,
      },
      {
        targetStat: "cultureArtsRating",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.3,
        delay: 6,
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.5,
        delay: 6,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "environmental_regulation", // General pro-environment
        alignsWithOptionValues: [
          "strict_green_transition",
          "balanced_regulation",
        ],
      },
    ],
  },
  {
    id: "env003",
    name: "Implement Water Conservation Measures",
    area: POLICY_AREAS.ENVIRONMENT,
    description:
      "Introduce city-wide water usage restrictions during dry seasons and promote water-saving technologies for residents and businesses.",
    tags: ["environment", "sustainability", "water_management", "regulation"],
    baseSupport: {
      Green: 0.9,
      Technocratic: 0.5, // If data-driven and efficient
      Progressive: 0.4,
      Libertarian: -0.3, // Can be seen as overreach
    },
    cost: { budget: 80000, politicalCapital: 3 }, // For awareness campaigns and monitoring
    durationToImplement: 2,
    effects: [
      {
        targetStat: "budget.annualExpenses",
        change: 80000,
        type: "absolute_change",
      },
      // Could affect a 'waterSecurity' stat or 'utilityCosts'
      {
        targetStat: "overallCitizenMood", // Might be slightly negative if restrictions are strict
        change: -1,
        type: "mood_shift",
        chance: 0.2,
        condition: "current_drought_severe", // Fictional condition
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "environmental_regulation",
        alignsWithOptionValues: [
          "strict_green_transition",
          "balanced_regulation",
        ],
      },
      {
        questionId: "climate_change_paris", // Broader climate action
        alignsWithOptionValues: ["yes_pursue_goals", "yes_flexibility"],
      },
    ],
  },
  MINIMUM_WAGE_POLICY,
  {
    id: "tax001_parameterized", // New ID for clarity
    name: "Adjust Property Tax Rate",
    area: POLICY_AREAS.TAXATION,
    description:
      "Modify the city's property tax rate. Changes will affect revenue and can impact citizen mood and housing affordability.",
    tags: [
      "taxation",
      "budget",
      "revenue",
      "property_tax",
      "controversial",
      "parameterized",
    ],
    baseSupport: {
      // General support for the *idea* of adjusting it
      Conservative: 0.1,
      Liberal: -0.1,
      Libertarian: 0.0,
      Socialist: 0.0,
      Centrist: 0.0,
    },
    cost: { politicalCapital: 7 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "percentagePointChange", // How the chosen value will be stored
      targetTaxRate: "property", // Which rate in budget.taxRates
      adjustmentType: "increase_or_decrease",
      valueType: "percentage_point", // The input is in percentage points (e.g., 0.2 for 0.2pp)
      min: -0.03, // Min change: -0.5pp (e.g., from 1.0% to 0.5%)
      max: 0.03, // Max change: +0.5pp (e.g., from 1.0% to 1.5%)
      step: 0.001, // Increments of 0.05pp
      defaultValue: 0.005, // Default suggestion: +0.1pp
      unit: "pp", // Percentage Points
      prompt:
        "Enter property tax rate change in percentage points (e.g., 0.2 for +0.2pp, or -0.1 for -0.1pp):",
    },
    effects: [
      // The primary effect on the tax rate is handled by the parameter via policySlice.
      // Secondary effects:
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift_by_tax_change", // New conceptual type for policySlice
        chance: 0.8,
        description_template:
          "Citizen mood may shift significantly based on property tax changes.",
      },
      {
        targetStat: "playerApproval",
        type: "conditional_approval_shift_by_tax_change", // New conceptual type
        chance: 0.7,
        ifPlayerProposer: true,
        description_template:
          "Your approval will change based on the property tax adjustment.",
      },
      // Potential effect on housing affordability or economic outlook can be added
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth",
        // If parameter > 0 (increase):
        alignsWithOptionValues: [
          "increase_wealth_tax",
          "moderate_increase_top",
        ],
        // If parameter < 0 (decrease):
        opposesOptionValues: ["cut_taxes_corps", "status_quo_growth"], // Or aligns with cut_taxes_corps
      },
    ],
  },
  {
    id: "tax002_parameterized",
    name: "Adjust Sales Tax Rate",
    area: POLICY_AREAS.TAXATION,
    description:
      "Modify the city's sales tax rate. This can stimulate or dampen consumer spending and affect city revenue.",
    tags: [
      "taxation",
      "budget",
      "stimulus",
      "sales_tax",
      "tax_cut",
      "tax_hike",
      "parameterized",
    ],
    baseSupport: {
      Libertarian: 0.2,
      Conservative: 0.1,
      Liberal: 0.0,
      Populist: 0.1,
      Socialist: -0.1,
    },
    cost: { politicalCapital: 5 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "percentagePointChange",
      targetTaxRate: "sales",
      adjustmentType: "increase_or_decrease",
      valueType: "percentage_point",
      min: -0.03, // Min change: -1.0pp
      max: 0.03, // Max change: +1.0pp
      step: 0.001,
      defaultValue: -0.02, // Default suggestion: -0.2pp cut
      unit: "pp",
      prompt:
        "Enter sales tax rate change in percentage points (e.g., -0.5 for -0.5pp cut):",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        type: "conditional_level_change_by_tax_change", // New conceptual type
        chance: 0.5,
        delay: 3,
        description_template:
          "Economic outlook may shift depending on sales tax adjustments.",
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift_by_tax_change",
        chance: 0.6,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth",
        // If parameter > 0 (increase):
        alignsWithOptionValues: [
          "increase_wealth_tax",
          "moderate_increase_top",
        ],
        // If parameter < 0 (decrease):
        opposesOptionValues: ["cut_taxes_corps", "status_quo_growth"], // Or aligns with cut_taxes_corps
      },
    ],
  },
  {
    id: "tax003_parameterized", // Was "Set Business Tax Rate", now "Adjust Business Tax Rate"
    name: "Adjust Business Tax Rate",
    area: POLICY_AREAS.TAXATION,
    description:
      "Modify the corporate/business tax rate. Changes can affect business investment and city revenue.",
    tags: [
      "taxation",
      "budget",
      "business_tax",
      "economic_development",
      "parameterized",
    ],
    baseSupport: {
      Conservative: 0.1,
      Libertarian: 0.2,
      Technocratic: 0.1,
      Liberal: -0.1,
      Socialist: -0.2,
    },
    cost: { politicalCapital: 6 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "percentagePointChange",
      targetTaxRate: "business",
      adjustmentType: "increase_or_decrease",
      valueType: "percentage_point",
      min: -0.03, // Min change: -2.0pp
      max: 0.03, // Max change: +2.0pp
      step: 0.001,
      defaultValue: -0.002, // Default suggestion: -0.5pp cut
      unit: "pp",
      prompt:
        "Enter business tax rate change in percentage points (e.g., -0.5 for -0.5pp cut):",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        type: "conditional_level_change_by_tax_change",
        chance: 0.4,
        delay: 6,
        description_template:
          "Economic outlook may shift based on new business tax rate.",
      },
      {
        targetStat: "overallCitizenMood", // Less direct impact than sales/property tax for general mood
        type: "conditional_mood_shift_by_tax_change",
        chance: 0.2,
        description_template:
          "Public mood may react mildly to business tax changes.",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth",
        // If parameter > 0 (increase):
        alignsWithOptionValues: [
          "increase_wealth_tax",
          "moderate_increase_top",
        ],
        // If parameter < 0 (decrease):
        opposesOptionValues: ["cut_taxes_corps", "status_quo_growth"], // Or aligns with cut_taxes_corps
      },
    ],
  },
  {
    id: "tax004",
    name: "Introduce Local Income Tax (1%)",
    area: POLICY_AREAS.TAXATION,
    description:
      "Implement a flat 1% local income tax on all residents to significantly boost city revenue for essential services and development projects.",
    tags: [
      "taxation",
      "budget",
      "revenue",
      "income_tax",
      "controversial",
      "major_policy",
    ],
    baseSupport: {
      Socialist: 0.6,
      SocialDemocrat: 0.5,
      Progressive: 0.4, // If funds are well-spent
      Centrist: -0.2,
      Liberal: -0.6,
      Conservative: -0.8,
      Libertarian: -1.0,
      Nationalist: -0.3,
      Populist: -0.7,
    },
    cost: { politicalCapital: 10 }, // Very politically costly
    durationToImplement: 3, // Requires setup
    effects: [
      {
        targetStat: "budget.taxRates.income", // Assuming you add 'income' to your taxRates object
        change: 0.01, // Set rate to 1%
        type: "absolute_set_rate", // Assumes this sets if not present, or overwrites
      },
      {
        targetStat: "overallCitizenMood",
        change: -2,
        type: "mood_shift",
        chance: 0.9,
      }, // Highly unpopular initially
      {
        targetStat: "playerApproval",
        change: -10,
        type: "absolute_change",
        chance: 0.8,
        ifPlayerProposer: true,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth",
        alignsWithOptionValues: [
          "increase_wealth_tax",
          "moderate_increase_top",
        ],
      },
    ],
  },
  {
    id: "tax005",
    name: "Implement Luxury Goods Surcharge (5%)",
    area: POLICY_AREAS.TAXATION,
    description:
      "Apply an additional 5% sales tax surcharge on designated luxury goods and services to generate revenue from high-end consumption.",
    tags: [
      "taxation",
      "budget",
      "revenue",
      "luxury_tax",
      "progressive_taxation_idea",
    ],
    baseSupport: {
      Socialist: 0.7,
      Progressive: 0.6,
      SocialDemocrat: 0.5,
      Populist: 0.4, // Tax the rich
      Liberal: -0.2,
      Conservative: -0.4,
      Libertarian: -0.6, // Market distortion
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 2,
    effects: [
      // This is harder to model directly on total sales tax revenue without knowing luxury good proportion.
      // Could add a new incomeSource: 'luxuryTaxRevenue'
      // Or, simpler: a small boost to 'otherRevenue' or a direct boost to 'totalAnnualIncome'
      {
        targetStat: "budget.incomeSources.otherRevenue", // Or a new 'luxuryTaxRevenue' line
        changeFormula: "population * gdpPerCapita * 0.0005", // Very rough estimate: 0.05% of total GDP
        type: "formula_absolute_change",
      },
      {
        targetStat: "overallCitizenMood",
        change: 1,
        type: "mood_shift",
        chance: 0.3,
        condition: "wealth_inequality_high",
      }, // Popular if inequality is an issue
      {
        targetStat: "economicOutlook",
        change: -1,
        type: "level_change",
        chance: 0.1,
        delay: 6,
        description_note: "Slight chance of impacting high-end retail.",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "taxation_wealth",
        alignsWithOptionValues: ["increase_wealth_tax"],
      },
    ],
  },
  // --- CULTURE & RECREATION (New Area) ---
  {
    id: "cult001_parameterized",
    name: "Fund Public Arts Initiatives",
    area: POLICY_AREAS.CULTURE_RECREATION,
    description:
      "Provide a chosen amount in grants and funding for local artists, public murals, and community art events.",
    tags: ["culture", "arts", "spending", "parameterized"],
    baseSupport: { Liberal: 0.6, Progressive: 0.7, Green: 0.4, Centrist: 0.2 },
    cost: { politicalCapital: 3 },
    durationToImplement: 6,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "librariesAndCulture", // Assuming arts fall under this
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 30000,
      max: 10000000,
      step: 1000,
      defaultValue: 150000,
      unit: "$",
      prompt: "Enter funding for Public Arts Program:",
    },
    effects: [
      {
        targetStat: "cultureArtsRating",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.5,
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.4,
      },
    ],
    relevantPolicyQuestions: [
      // No direct policy question, but general support for public spending might apply
    ],
  },
  {
    id: "cult002_parameterized",
    name: "Upgrade Public Library Facilities",
    area: POLICY_AREAS.CULTURE_RECREATION,
    description:
      "Invest a chosen amount in modernizing public libraries with better technology, expanded collections, and community program spaces.",
    tags: [
      "culture",
      "education",
      "community",
      "spending",
      "literacy",
      "parameterized",
    ],
    baseSupport: {
      Progressive: 0.7,
      Liberal: 0.6,
      SocialDemocrat: 0.5,
      Centrist: 0.4,
      Green: 0.3,
    },
    cost: { politicalCapital: 3 },
    durationToImplement: 9,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "librariesAndCulture",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 100000,
      max: 10000000,
      step: 1000,
      defaultValue: 300000,
      unit: "$",
      prompt: "Enter investment for Library Upgrades:",
    },
    effects: [
      {
        targetStat: "cultureArtsRating",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.6,
      },
      {
        targetStat: "educationQuality",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.3,
        delay: 3,
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.3,
      },
    ],
    relevantPolicyQuestions: [
      {
        // Loosely related to education funding
        questionId: "education_funding",
        alignsWithOptionValues: [
          "massive_increase_public",
          "teacher_salaries_resources",
        ],
      },
    ],
  },
  {
    id: "health001_parameterized",
    name: "Fund Public Health Awareness Campaigns",
    area: POLICY_AREAS.HEALTHCARE,
    description:
      "Invest a chosen amount in city-wide campaigns promoting healthy lifestyles, disease prevention, and vaccination drives.",
    tags: [
      "public_health",
      "preventative_care",
      "education",
      "awareness",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Progressive: 0.7,
      Liberal: 0.6,
      SocialDemocrat: 0.6,
      Centrist: 0.4,
      Green: 0.5,
      Technocratic: 0.3,
    },
    cost: { politicalCapital: 2 },
    durationToImplement: 3,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "publicHealthServices",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 40000,
      max: 10000000,
      step: 1000,
      defaultValue: 180000,
      unit: "$",
      prompt: "Enter funding for Health Campaigns:",
    },
    effects: [
      {
        targetStat: "healthcareQuality",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.4,
        delay: 6,
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "healthcare_coverage", // General pro-active health stance
        alignsWithOptionValues: [
          "universal_single_payer",
          "public_option_private",
        ],
      },
    ],
  },
  {
    id: "health002_parameterized",
    name: "Fund Mobile Health Clinics Initiative",
    area: POLICY_AREAS.HEALTHCARE,
    description:
      "Invest a chosen amount to establish/expand mobile clinics for underserved areas. Recurring operational costs will also apply.",
    tags: [
      "public_health",
      "equity",
      "accessibility",
      "social_services",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Socialist: 0.9,
      Progressive: 0.8,
      SocialDemocrat: 0.8,
      Liberal: 0.5,
      Green: 0.3,
    },
    cost: { politicalCapital: 5 },
    durationToImplement: 9,
    isParameterized: true,
    parameterDetails: {
      key: "initialInvestment",
      targetBudgetLine: "publicHealthServices",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 150000,
      max: 10000000,
      step: 1000,
      defaultValue: 450000,
      unit: "$",
      prompt: "Enter initial investment for Mobile Health Clinics:",
    },
    effects: [
      {
        targetStat: "healthcareQuality",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.6,
        condition: "mainIssue_is_Healthcare_or_Poverty",
        delay: 6,
      },
      {
        targetStat: "budget.expenseAllocations.publicHealthServices",
        change: 120000,
        type: "absolute_change_recurring",
        description_note: "Annual operational cost for mobile clinics.",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "healthcare_coverage",
        alignsWithOptionValues: [
          "universal_single_payer",
          "public_option_private",
        ],
      },
    ],
  },
  {
    id: "socserv001_parameterized",
    name: "Adjust Subsidized Childcare Funding",
    area: POLICY_AREAS.SOCIAL_SERVICES,
    description:
      "Modify funding for subsidized childcare programs to support working parents.",
    tags: [
      "social_welfare",
      "families",
      "children",
      "employment_support",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      Progressive: 0.9,
      Socialist: 0.8,
      SocialDemocrat: 0.8,
      Liberal: 0.6,
      Centrist: 0.2,
    },
    cost: { politicalCapital: 5 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "socialWelfarePrograms",
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -10000000,
      max: 10000000,
      step: 1000,
      defaultValue: 550000,
      unit: "$",
      prompt: "Enter amount to change Childcare Subsidies by:",
    },
    effects: [
      {
        targetStat: "unemploymentRate",
        type: "conditional_level_change_by_param",
        change_direction: -1,
        base_change_for_default: 0.2,
        chance: 0.4,
        description_note: "Positive funding helps parents work.",
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.5,
        condition: "population_young_families_high",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "parental_leave", // Related to family support
        alignsWithOptionValues: ["federal_paid_family_leave"],
      },
    ],
  },
  {
    id: "socserv002_parameterized",
    name: "Adjust Senior Citizen Support Services Funding",
    area: POLICY_AREAS.SOCIAL_SERVICES,
    description:
      "Modify funding for services for senior citizens, including community centers and assistance programs.",
    tags: [
      "social_welfare",
      "seniors",
      "aging_population",
      "spending",
      "parameterized",
    ],
    baseSupport: {
      SocialDemocrat: 0.7,
      Progressive: 0.6,
      Liberal: 0.4,
      Centrist: 0.5,
      Conservative: 0.3,
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 6,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "socialWelfarePrograms", // Or a specific "seniorServices" line
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -10000000,
      max: 10000000,
      step: 1000,
      defaultValue: 350000,
      unit: "$",
      prompt: "Enter amount to change Senior Support Services funding by:",
    },
    effects: [
      {
        targetStat: "healthcareQuality",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.3,
        condition: "demographics_seniors_high",
        description_note:
          "Positive funding improves senior well-being, impacting perceived healthcare quality.",
      },
      {
        targetStat: "overallCitizenMood",
        type: "conditional_mood_shift",
        chance: 0.6,
        condition: "demographics_seniors_high",
      },
    ],
    relevantPolicyQuestions: [
      {
        questionId: "social_security", // Related to senior welfare
        alignsWithOptionValues: ["raise_cap_increase_payroll"],
      },
    ],
  },

  // --- CITY ADMIN & GOVERNANCE ---
  {
    // admin001: Implement Open Data Portal - Fixed cost, might be okay as is or parameterize the "scale" of the portal
    id: "admin001_parameterized",
    name: "Fund Open Data Portal Initiative",
    area: POLICY_AREAS.CITY_ADMIN,
    description:
      "Invest a chosen amount to create or enhance a public online portal for city data, budgets, and performance metrics.",
    tags: [
      "governance",
      "transparency",
      "technology",
      "accountability",
      "parameterized",
    ],
    baseSupport: {
      Technocratic: 0.8,
      Progressive: 0.7,
      Libertarian: 0.6,
      Liberal: 0.5,
      Centrist: 0.3,
    },
    cost: { politicalCapital: 3 },
    durationToImplement: 9,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "generalAdministration",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 30000,
      max: 10000000,
      step: 1000,
      defaultValue: 120000,
      unit: "$",
      prompt: "Enter funding for Open Data Portal:",
    },
    effects: [
      {
        targetStat: "budget.expenseAllocations.generalAdministration",
        change: 30000,
        type: "absolute_change_recurring",
        description_note: "Annual maintenance for the portal.",
      },
      {
        targetStat: "playerApproval",
        type: "conditional_approval_shift",
        chance: 0.4,
        ifPlayerProposer: true,
      },
    ],
    relevantPolicyQuestions: [
      {
        // General transparency
        questionId: "campaign_finance",
        alignsWithOptionValues: ["increase_transparency_disclosure"],
      },
    ],
  },
  {
    // admin002: Streamline Permitting Processes - Fixed cost, could be okay.
    id: "admin002_parameterized",
    name: "Fund Permitting Process Overhaul",
    area: POLICY_AREAS.CITY_ADMIN,
    description:
      "Invest a chosen amount to simplify and expedite application processes for business licenses and construction permits.",
    tags: ["governance", "business_friendly", "efficiency", "parameterized"],
    baseSupport: {
      Libertarian: 0.7,
      Conservative: 0.6,
      Technocratic: 0.5,
      Liberal: 0.3,
    },
    cost: { politicalCapital: 4 },
    durationToImplement: 6,
    isParameterized: true,
    parameterDetails: {
      key: "fundingAmount",
      targetBudgetLine: "generalAdministration",
      adjustmentType: "increase",
      valueType: "absolute_amount",
      min: 25000,
      max: 10000000,
      step: 1000,
      defaultValue: 50000,
      unit: "$",
      prompt: "Enter funding for Permitting Process Overhaul:",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.4,
        delay: 6,
      },
    ],
    relevantPolicyQuestions: [
      {
        // Pro-business, deregulation-lite
        questionId: "environmental_regulation",
        alignsWithOptionValues: ["reduce_regulation_growth"],
      },
      {
        questionId: "tech_regulation",
        alignsWithOptionValues: [
          "promote_competition_user_data",
          "transparency_self_regulation",
        ],
      },
    ],
  },
];

export const STATE_POLICIES = [
  // For now, state can have the same policies. This can be customized later.
  ...CITY_POLICIES,
];

