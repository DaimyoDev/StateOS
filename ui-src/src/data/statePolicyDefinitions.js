// ui-src/src/data/statePolicyDefinitions.js
import { POLICY_AREAS } from "./policyAreas";

export const STATE_POLICIES = [
  {
    id: "s_edu001",
    name: "Establish Statewide Education Standards",
    area: POLICY_AREAS.EDUCATION,
    description: "Implement a unified curriculum and set of educational standards for all public schools in the state.",
    tags: ["education", "standards", "state_governance"],
    baseSupport: { Progressive: 0.6, Technocratic: 0.5, Liberal: 0.4, Conservative: -0.3, Libertarian: -0.5 },
    cost: { politicalCapital: 6 },
    durationToImplement: 12,
    effects: [
      {
        targetStat: "educationQuality",
        change: 1, // Placeholder for a more complex effect
        type: "level_change",
        chance: 0.6,
        delay: 24,
        scope: "state"
      },
    ],
  },
  {
    id: "s_infra001_parameterized",
    name: "Adjust State Highway Maintenance Funding",
    area: POLICY_AREAS.INFRASTRUCTURE,
    description: "Modify the annual budget for maintaining state-level highways and bridges.",
    tags: ["infrastructure", "transportation", "budget", "spending", "parameterized"],
    cost: { politicalCapital: 5 },
    durationToImplement: 2,
    isParameterized: true,
    parameterDetails: {
      key: "budgetAdjustmentAmount",
      targetBudgetLine: "highwayInfrastructure", // Assumes a state-level budget structure
      adjustmentType: "increase_or_decrease",
      valueType: "absolute_amount",
      min: -50000000, 
      max: 200000000,
      step: 100000,
      defaultValue: 10000000,
      unit: "$",
      prompt: "Enter amount to change State Highway Maintenance budget by:",
    },
    effects: [
        {
            targetStat: "infrastructureState",
            type: "conditional_level_change_by_param",
            chance: 0.7,
            scope: "state"
        }
    ],
  },
  {
    id: "s_health001",
    name: "Expand Medicaid Coverage",
    area: POLICY_AREAS.HEALTHCARE,
    description: "Expand Medicaid eligibility to cover more low-income residents in the state.",
    tags: ["healthcare", "social_welfare", "state_governance"],
    baseSupport: { Progressive: 0.8, Liberal: 0.6, Conservative: -0.5, Libertarian: -0.7 },
    cost: { politicalCapital: 7 },
    durationToImplement: 18,
    effects: [
      {
        targetStat: "publicHealth",
        change: 1,
        type: "level_change",
        chance: 0.7,
        delay: 24,
        scope: "state"
      },
      {
        targetStat: "stateBudgetDeficit",
        change: 1,
        type: "level_change",
        chance: 0.8,
        delay: 12,
        scope: "state"
      }
    ],
  },
  {
    id: "s_env001",
    name: "Implement State-Level Carbon Tax",
    area: POLICY_AREAS.ENVIRONMENT,
    description: "Introduce a tax on carbon emissions for industries within the state to combat climate change.",
    tags: ["environment", "taxation", "climate_change", "state_governance"],
    baseSupport: { Green: 0.9, Progressive: 0.7, Technocratic: 0.4, Conservative: -0.6, Libertarian: -0.5 },
    cost: { politicalCapital: 8 },
    durationToImplement: 24,
    effects: [
      {
        targetStat: "environmentRating",
        change: 1,
        type: "level_change",
        chance: 0.6,
        delay: 36,
        scope: "state"
      },
      {
        targetStat: "economicOutlook",
        change: -1,
        type: "level_change",
        chance: 0.5,
        delay: 18,
        scope: "state"
      }
    ],
  },
  {
    id: "s_justice001",
    name: "Decriminalize Small Amounts of Marijuana",
    area: POLICY_AREAS.CRIMINAL_JUSTICE,
    description: "Decriminalize the possession of small amounts of marijuana for personal use.",
    tags: ["criminal_justice", "reform", "social_issues"],
    baseSupport: { Libertarian: 0.8, Progressive: 0.7, Liberal: 0.5, Conservative: -0.6 },
    cost: { politicalCapital: 4 },
    durationToImplement: 6,
    effects: [
      {
        targetStat: "crimeRate",
        change: -1,
        type: "level_change",
        chance: 0.4,
        delay: 12,
        scope: "state"
      },
      {
        targetStat: "judicialSystemLoad",
        change: -1,
        type: "level_change",
        chance: 0.8,
        delay: 6,
        scope: "state"
      }
    ],
  }
];
