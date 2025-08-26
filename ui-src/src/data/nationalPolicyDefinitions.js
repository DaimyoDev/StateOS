// ui-src/src/data/nationalPolicyDefinitions.js
import { POLICY_AREAS } from "./policyAreas";

export const FEDERAL_POLICIES = [
  {
    id: "n_fp001",
    name: "Sign International Climate Accord",
    area: POLICY_AREAS.FOREIGN_POLICY,
    description: "Commit the nation to an international agreement aimed at reducing carbon emissions.",
    tags: ["foreign_policy", "environment", "climate_change", "treaty", "federal_only"],
    baseSupport: { Green: 0.9, Progressive: 0.7, Liberal: 0.5, Nationalist: -0.6, Conservative: -0.4 },
    cost: { politicalCapital: 8 },
    durationToImplement: 6,
    effects: [
      {
        targetStat: "environmentRating",
        change: 1,
        type: "level_change",
        chance: 0.5,
        delay: 12,
        scope: "national"
      },
      {
        targetStat: "economicOutlook",
        change: -1,
        type: "level_change",
        chance: 0.4,
        delay: 24,
        scope: "national"
      }
    ],
  },
  {
    id: "n_tax001_parameterized",
    name: "Adjust Federal Corporate Tax Rate",
    area: POLICY_AREAS.TAXATION,
    description: "Modify the federal tax rate for all corporations nationwide.",
    tags: ["taxation", "budget", "economy", "national_governance", "parameterized"],
    cost: { politicalCapital: 10 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "percentagePointChange",
      targetTaxRate: "corporate", // Assumes a national-level budget structure
      adjustmentType: "increase_or_decrease",
      valueType: "percentage_point",
      min: -0.05, 
      max: 0.05,
      step: 0.005,
      defaultValue: -0.01,
      unit: "pp",
      prompt: "Enter the change in the federal corporate tax rate (in percentage points):",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        type: "conditional_level_change_by_tax_change",
        chance: 0.8,
        scope: "national"
      }
    ],
  },
  {
    id: "n_health001",
    name: "Public Health Insurance Option",
    area: POLICY_AREAS.HEALTHCARE,
    description: "Establish a government-run health insurance plan to compete with private insurers.",
    tags: ["healthcare", "social_welfare", "national_governance"],
    baseSupport: { Progressive: 0.8, Liberal: 0.6, Technocratic: 0.3, Conservative: -0.7, Libertarian: -0.8 },
    cost: { politicalCapital: 12 },
    durationToImplement: 36,
    effects: [
      {
        targetStat: "publicHealth",
        change: 1,
        type: "level_change",
        chance: 0.6,
        delay: 48,
        scope: "national"
      },
      {
        targetStat: "economicFreedom",
        change: -1,
        type: "level_change",
        chance: 0.5,
        delay: 24,
        scope: "national"
      }
    ],
  },
  {
    id: "n_infra001",
    name: "National High-Speed Rail Initiative",
    area: POLICY_AREAS.INFRASTRUCTURE,
    description: "Fund a major infrastructure project to build high-speed rail lines connecting major cities.",
    tags: ["infrastructure", "transportation", "economy", "national_governance"],
    baseSupport: { Technocratic: 0.8, Progressive: 0.7, Liberal: 0.5, Conservative: -0.3, Green: 0.6 },
    cost: { politicalCapital: 15 },
    durationToImplement: 60,
    effects: [
      {
        targetStat: "infrastructureState",
        change: 1,
        type: "level_change",
        chance: 0.7,
        delay: 72,
        scope: "national"
      },
      {
        targetStat: "economicOutlook",
        change: 1,
        type: "level_change",
        chance: 0.5,
        delay: 48,
        scope: "national"
      }
    ],
  },
  {
    id: "n_defense001_parameterized",
    name: "Adjust National Defense Spending",
    area: POLICY_AREAS.DEFENSE,
    description: "Modify the annual budget for the national military and defense operations.",
    tags: ["defense", "budget", "spending", "national_governance", "parameterized"],
    cost: { politicalCapital: 8 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "defenseSpending",
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -10000000000,
      max: 50000000000,
      step: 100000000,
      defaultValue: 5000000000,
      unit: "$",
      prompt: "Enter amount to change National Defense budget by:",
    },
    effects: [
        {
            targetStat: "militaryStrength",
            type: "conditional_level_change_by_param",
            chance: 0.9,
            scope: "national"
        }
    ],
  },
  {
    id: "n_immigration001",
    name: "Comprehensive Immigration Reform",
    area: POLICY_AREAS.FOREIGN_POLICY,
    description: "Implement comprehensive immigration reform including pathway to citizenship and border security measures.",
    tags: ["immigration", "foreign_policy", "border_security", "federal_only"],
    baseSupport: { 
      Progressive: 0.8, 
      Liberal: 0.6, 
      Conservative: -0.4, 
      Nationalist: -0.8, 
      Populist: -0.3 
    },
    cost: { politicalCapital: 15 },
    durationToImplement: 24,
    effects: [
      {
        targetStat: "economicOutlook",
        change: 1,
        type: "level_change",
        chance: 0.6,
        delay: 18,
        scope: "national"
      },
      {
        targetStat: "socialCohesion",
        change: -1,
        type: "level_change",
        chance: 0.3,
        delay: 6,
        scope: "national"
      }
    ],
  },
  {
    id: "n_trade001_parameterized",
    name: "Adjust Federal Trade Tariffs",
    area: POLICY_AREAS.ECONOMY,
    description: "Modify tariff rates on imported goods to protect domestic industries or encourage free trade.",
    tags: ["trade", "economy", "tariffs", "federal_only", "parameterized"],
    cost: { politicalCapital: 12 },
    durationToImplement: 3,
    isParameterized: true,
    parameterDetails: {
      key: "tariffAdjustment",
      targetStat: "nationalLaws.averageTariffRate",
      adjustmentType: "increase_or_decrease",
      valueType: "percentage_point",
      min: -10.0,
      max: 25.0,
      step: 0.5,
      defaultValue: 2.0,
      unit: "pp",
      prompt: "Enter tariff rate change (percentage points):",
    },
    effects: [
      {
        targetStat: "economicOutlook",
        type: "conditional_level_change_by_param",
        chance: 0.7,
        delay: 6,
        scope: "national"
      },
      {
        targetStat: "internationalRelations",
        type: "conditional_level_change_by_param",
        change_direction: -1,
        chance: 0.5,
        delay: 3,
        scope: "national"
      }
    ],
  },
  {
    id: "n_social001",
    name: "Establish Universal Basic Income Pilot Program",
    area: POLICY_AREAS.SOCIAL_SERVICES,
    description: "Launch a nationwide pilot program providing basic income to select demographics to study economic effects.",
    tags: ["social_welfare", "pilot_program", "basic_income", "federal_only"],
    baseSupport: {
      Socialist: 0.9,
      Progressive: 0.8,
      Liberal: 0.4,
      Technocratic: 0.3,
      Centrist: -0.2,
      Conservative: -0.8,
      Libertarian: -0.9,
    },
    cost: { politicalCapital: 18 },
    durationToImplement: 12,
    effects: [
      {
        targetStat: "povertyRate",
        change: -2.0,
        type: "percentage_point_change",
        chance: 0.8,
        delay: 6,
        scope: "national"
      },
      {
        targetStat: "economicOutlook",
        change: -1,
        type: "level_change",
        chance: 0.4,
        delay: 12,
        scope: "national"
      },
      {
        targetStat: "budget.expenseAllocations.socialPrograms",
        changeFormula: "nationalPopulation * 200",
        type: "formula_absolute_change",
      }
    ],
  },
  {
    id: "n_space001_parameterized",
    name: "Adjust Federal Space Program Funding",
    area: POLICY_AREAS.SCIENCE_TECHNOLOGY,
    description: "Modify funding for the national space agency and space exploration programs.",
    tags: ["science", "space", "technology", "federal_only", "parameterized"],
    baseSupport: {
      Technocratic: 0.9,
      Progressive: 0.5,
      Liberal: 0.3,
      Conservative: 0.2,
      Centrist: 0.4,
    },
    cost: { politicalCapital: 6 },
    durationToImplement: 1,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "spaceProgramFunding",
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -5000000000,
      max: 20000000000,
      step: 100000000,
      defaultValue: 2000000000,
      unit: "$",
      prompt: "Enter amount to change Space Program budget by:",
    },
    effects: [
      {
        targetStat: "technologicalAdvancement",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.6,
        delay: 24,
        scope: "national"
      },
      {
        targetStat: "internationalPrestige",
        type: "conditional_level_change_by_param",
        change_direction: 1,
        base_change_for_default: 1,
        chance: 0.4,
        delay: 18,
        scope: "national"
      }
    ],
  },
  {
    id: "n_fed_minimum_wage",
    name: "Set Federal Minimum Wage",
    area: POLICY_AREAS.ECONOMY,
    description: "Establish or change the federal minimum wage. This sets the nationwide floor for minimum wages and affects all states.",
    tags: ["economy", "labor", "regulation", "minimum_wage", "federal_only", "parameterized"],
    baseSupport: {
      Socialist: 0.95,
      Progressive: 0.85,
      Liberal: 0.5,
      Centrist: 0.0,
      Conservative: -0.7,
      Libertarian: -0.9,
    },
    cost: { politicalCapital: 12 },
    durationToImplement: 6,
    isParameterized: true,
    setsSimulationVariable: true,
    parameterDetails: {
      key: "wageRate",
      targetStat: "nationalLaws.federalMinimumWage",
      adjustmentType: "set_value",
      valueType: "absolute_amount",
      min: 0,
      max: 50,
      step: 0.25,
      defaultValue: 15.0,
      unit: "$/hour",
      prompt: "Set the new federal minimum wage (per hour):",
    },
    effects: [
      {
        targetStat: "povertyRate",
        type: "percentage_point_change",
        change: -1.0,
        chance: 0.9,
        delay: 4,
        scope: "national"
      },
      {
        targetStat: "unemploymentRate",
        type: "percentage_point_change",
        change: 0.1,
        chance: 0.3,
        delay: 8,
        scope: "national"
      },
    ],
  },
  // Note: General policies are imported separately to avoid circular dependencies
  // They can be combined at the application level if needed
];
