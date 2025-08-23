// ui-src/src/data/nationalPolicyDefinitions.js
import { POLICY_AREAS } from "./policyAreas";

export const NATIONAL_POLICIES = [
  {
    id: "n_fp001",
    name: "Sign International Climate Accord",
    area: POLICY_AREAS.FOREIGN_POLICY,
    description: "Commit the nation to an international agreement aimed at reducing carbon emissions.",
    tags: ["foreign_policy", "environment", "climate_change", "treaty"],
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
  }
];
