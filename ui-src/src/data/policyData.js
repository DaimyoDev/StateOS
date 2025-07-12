import { ECONOMIC_POLICY_QUESTIONS } from "./policyQuestions/economicPolicyQuestions";
import { HEALTHCARE_QUALITY_QUESTIONS } from "./policyQuestions/healthcarePolicyQuestions";
import { FOREIGN_POLICY_AND_DEFENSE_QUESTIONS } from "./policyQuestions/foreignAndDefensePQ";
import { EDUCATION_POLICY_QUESTIONS } from "./policyQuestions/educationPolicyQuestions";
import { ENVIRONMENT_POLICY_QUESTIONS } from "./policyQuestions/environmentPolicyQuestions";

export const POLICY_QUESTIONS = [
  ...ECONOMIC_POLICY_QUESTIONS,
  ...HEALTHCARE_QUALITY_QUESTIONS,
  ...FOREIGN_POLICY_AND_DEFENSE_QUESTIONS,
  ...EDUCATION_POLICY_QUESTIONS,
  ...ENVIRONMENT_POLICY_QUESTIONS,
  {
    id: "firearm_control",
    category: "Social Issues",
    questionText:
      "What is your stance on civilian firearm ownership and control?",
    options: [
      {
        text: "Implement Strict Controls: Ban Certain Weapon Types, Universal Background Checks",
        value: "strict_firearm_controls_bans",
        ideologyEffect: {
          // Original: liberty: -3.5, scope: 3.0, societal: -2.0
          economic: 0.0,
          social_traditionalism: -1.0, // Progressive view on public safety
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -3.8, // Very significant restriction
          authority_structure: 2.0, // Increased state power for enforcement
          state_intervention_scope: 3.5, // High state intervention
          societal_focus: -2.5, // Collective safety strongly prioritized
          rural_priority: -1.0, // Often greater impact on rural areas
          governance_approach: -0.5,
        },
      },
      {
        text: "Strengthen Background Checks, Close Loopholes, Allow Temporary Firearm Removal from At-Risk Individuals",
        value: "strengthen_checks_risk_removal_firearms",
        ideologyEffect: {
          // Original: liberty: -1.5, scope: 1.5, societal: -1.0
          economic: 0.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.0, // Clearer restriction
          authority_structure: 1.0,
          state_intervention_scope: 2.0, // More active state role
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Oppose New Restrictions, Uphold Rights to Private Firearm Ownership",
        value: "oppose_restrictions_firearm_ownership_rights",
        ideologyEffect: {
          // Original: liberty: 4.0, authority: -2.5, scope: -3.5, societal: 3.0
          economic: 0.0,
          social_traditionalism: 1.5, // Often a traditionalist stance
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 4.0, // Max liberty on this issue
          authority_structure: -3.0, // Strong anti-central state control
          state_intervention_scope: -3.8, // Strongest opposition to intervention
          societal_focus: 3.5, // Strongest individual right focus
          rural_priority: 1.0,
          governance_approach: 1.5,
        },
      },
      {
        text: "Focus on Mental Health, Responsible Ownership Education, and Enforcing Existing Laws",
        value: "focus_mental_health_existing_firearm_laws",
        ideologyEffect: {
          // This is a more moderate, less impactful option.
          economic: 0.0,
          social_traditionalism: 0.5, // Status quo / individual responsibility focus
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5, // Slight positive if it diverts from new restrictions
          authority_structure: 0.5, // Enforcing existing laws
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "immigration_border_management",
    category: "Immigration",
    questionText:
      "How should the nation approach border management and immigration?",
    options: [
      {
        text: "Increase Border Security (e.g., Physical Barriers, Technology, Personnel) and Stricter Enforcement",
        value: "increase_border_security_stricter_enforcement",
        ideologyEffect: {
          // Original: sovereignty: 4.0, authority: 2.0, scope: 3.0
          economic: 0.0,
          social_traditionalism: 1.5, // Often linked to preserving national culture/order
          sovereignty: 4.0, // Max national border control
          ecology: -0.8, // More significant ecological impact from barriers
          theocratic: 0.0,
          digitalization: 1.5, // Stronger tech for border security
          personal_liberty: -2.0, // Increased restrictions/surveillance
          authority_structure: 2.5, // Stronger state enforcement powers
          state_intervention_scope: 3.5, // Higher state intervention at borders
          societal_focus: 1.5, // Stronger national community focus
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Comprehensive Reform: Legal Pathways for Immigration, Border Security, Address Root Causes of Migration",
        value: "comprehensive_reform_legal_pathways_root_causes",
        ideologyEffect: {
          // Original: social_trad: -1.0, sovereignty: -1.5, scope: 1.0
          economic: -0.5,
          social_traditionalism: -1.5, // Clearer progressive approach
          sovereignty: -2.0, // Clearer international cooperation
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 1.0, // More rights for immigrants
          authority_structure: -0.5,
          state_intervention_scope: 1.0,
          societal_focus: -1.5, // More inclusive
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Prioritize Humanitarian Concerns and Streamline Asylum and Refugee Processes",
        value: "humanitarian_streamline_asylum_refugee",
        ideologyEffect: {
          // Original: social_trad: -3.0, sovereignty: -3.5, societal: -2.5
          economic: -1.0, // Costs associated with processing and aid
          social_traditionalism: -3.5, // Stronger progressive stance
          sovereignty: -3.8, // Stronger emphasis on intl. norms
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -2.0,
          state_intervention_scope: 0.8, // State provides support
          societal_focus: -3.0, // Stronger global empathy
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Guest Worker Programs and Merit-Based or Skills-Based Immigration Systems",
        value: "guest_worker_merit_skills_based_immigration",
        ideologyEffect: {
          // Original: econ: 1.5, sovereignty: 0.5, scope: 1.0
          economic: 2.0, // Clearer economic utilitarianism
          social_traditionalism: 0.5, // More neutral/pragmatic socially
          sovereignty: 0.8, // Clearer managed intake for national benefit
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: 0.8,
          state_intervention_scope: 1.5, // More active state role
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "criminal_justice_system_reform",
    category: "Criminal Justice",
    questionText:
      "What is your stance on reforming the criminal justice system?",
    options: [
      {
        text: "Focus on Rehabilitation, Decriminalization of Minor Offenses, and Reducing Incarceration Rates",
        value: "rehabilitation_decriminalization_reduce_incarceration",
        ideologyEffect: {
          // Original: social_trad: -3.5, liberty: 3.0, authority: -1.5, scope: -2.5
          economic: -1.0,
          social_traditionalism: -3.8, // Stronger progressive reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.0,
          personal_liberty: 3.5, // Stronger rights focus
          authority_structure: -2.5, // Stronger anti-coercive state
          state_intervention_scope: -3.0, // More significant reduction in punitive scope
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Invest in Community-Based Crime Prevention and Address Root Causes of Crime",
        value: "community_policing_crime_prevention_root_causes",
        ideologyEffect: {
          // Original: social_trad: -1.5, authority: -1.5, societal: -2.0
          economic: -1.5, // Greater investment
          social_traditionalism: -2.0, // Clearer progressive approach
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 1.0,
          authority_structure: -2.0, // More decentralized
          state_intervention_scope: 1.0, // State invests, but shifts focus
          societal_focus: -2.5, // Stronger communitarian
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Tough on Crime: Stricter Penalties, Increased Law Enforcement Funding, and Victim's Rights",
        value: "tough_on_crime_stricter_penalties_police_funding",
        ideologyEffect: {
          // Original: social_trad: 3.0, liberty: -3.5, authority: 2.5, scope: 3.8
          economic: 0.5,
          social_traditionalism: 3.5, // Stronger traditional justice
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -3.8, // Stronger order focus
          authority_structure: 3.0, // Stronger state enforcement
          state_intervention_scope: 3.5, // Re-evaluating from 3.8, as scope is more about breadth than intensity here.
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Reform Sentencing Guidelines, Abolish Mandatory Minimums, and Support Re-entry Programs",
        value: "reform_sentencing_abolish_mandatory_minimums_reentry",
        ideologyEffect: {
          // Original: social_trad: -2.0, liberty: 2.0, authority: -1.0, scope: -1.5
          economic: 0.0,
          social_traditionalism: -2.5, // Clearer reformist
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5, // Clearer liberty for accused/reformed
          authority_structure: -1.5, // Less rigid rules
          state_intervention_scope: -2.0, // Clearer reduction in punitive scope
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "abortion_access_legality",
    category: "Social Issues",
    questionText:
      "What is your stance on the legality and accessibility of abortion?",
    options: [
      {
        text: "Protect and Expand Access to Abortion as a Legal/Fundamental Right",
        value: "protect_expand_abortion_access_legal_right",
        ideologyEffect: {
          // Original: social_trad: -3.8, theocratic: -2.5, liberty: 4.0, scope: -2.5
          economic: 0.0,
          social_traditionalism: -4.0, // Max progressive
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -3.0, // Stronger secular stance
          digitalization: 0.0,
          personal_liberty: 4.0,
          authority_structure: -1.5,
          state_intervention_scope: -3.0, // Stronger "state should not interfere"
          societal_focus: 2.5, // Stronger individual right
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Allow Regional Governments or Local Jurisdictions to Determine Legality and Restrictions",
        value: "regional_local_determine_abortion_legality",
        ideologyEffect: {
          // Original: sovereignty: 1.0, authority: -3.0, scope: -1.5
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 1.5, // Stronger regional sovereignty
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: -3.5, // Highly decentralized
          state_intervention_scope: -2.0, // Stronger reduction of central state
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: 0.5,
        },
      },
      {
        text: "Support a National Ban or Severe Restrictions on Abortion with Limited Exceptions",
        value: "national_ban_severe_restrictions_abortion",
        ideologyEffect: {
          // Original: social_trad: 4.0, theocratic: 2.5, liberty: -4.0, scope: 3.0
          economic: 0.0,
          social_traditionalism: 4.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 3.0, // Stronger theocratic influence
          digitalization: 0.0,
          personal_liberty: -4.0,
          authority_structure: 2.5, // Stronger central enforcement
          state_intervention_scope: 3.5, // Stronger state intervention
          societal_focus: -2.5, // Stronger community morality
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Focus on Reducing Abortions Through Adoption, Contraception Access, and Support for Parents",
        value: "reduce_abortions_via_adoption_contraception_support",
        ideologyEffect: {
          // This is a more moderate, nuanced position
          economic: -0.8, // Stronger support implication
          social_traditionalism: 1.5, // Clearer traditional value support
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.8,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 0.0,
          state_intervention_scope: 1.5, // Clearer state role in support
          societal_focus: -1.5, // Clearer communitarian support
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "tech_company_regulation",
    category: "Economy & Technology",
    questionText:
      "What is your stance on regulating large technology companies (e.g., regarding antitrust, content moderation, data privacy)?",
    options: [
      {
        text: "Implement Stronger Regulations to Limit Power, Ensure Fair Competition, and Protect Users",
        value: "stronger_tech_regulation_limit_power",
        ideologyEffect: {
          // Original: econ: -2.0, liberty: -2.0, scope: 3.0, digital: -1.0
          economic: -2.5, // Stronger anti-monopoly
          social_traditionalism: -0.5,
          sovereignty: 0.5, // National oversight
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -1.5, // Regulations might slow some digital expansion or impose specific tech paths
          personal_liberty: -2.5, // Limits on corporate liberty, potential for user speech limits depending on content moderation
          authority_structure: 1.5,
          state_intervention_scope: 3.5, // Stronger state intervention
          societal_focus: -2.0, // Focus on collective user good
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Encourage Self-Regulation and Market-Based Solutions with Minimal Government Intervention",
        value: "self_regulation_market_solutions_tech",
        ideologyEffect: {
          // Original: econ: 3.0, liberty: 2.5, scope: -3.5, digital: 2.0
          economic: 3.5, // Stronger free market for tech
          social_traditionalism: 0.0,
          sovereignty: -1.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 2.5, // Promotes unhindered digital growth
          personal_liberty: 3.0, // Corporate liberty
          authority_structure: -2.0,
          state_intervention_scope: -3.8, // Stronger anti-intervention
          societal_focus: 2.5, // Individualistic/market focus
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Target Specific Harms (e.g., Disinformation, Anti-Competitive Practices) with Precise Regulations",
        value: "targeted_tech_regulation_specific_harms",
        ideologyEffect: {
          // Original: econ: -0.5, liberty: -0.5, scope: 1.0, digital: 0.5
          economic: -1.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.8,
          personal_liberty: -1.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // Moderate intervention
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Break Up Large Tech Companies to Foster Competition and Decentralize Power",
        value: "break_up_large_tech_companies",
        ideologyEffect: {
          // Original: econ: -3.5, liberty: -1.5, authority: 1.0, scope: 3.8, digital: -1.5
          economic: -3.8, // Max anti-monopoly through direct action
          social_traditionalism: -0.5,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -2.0, // Disruptive to current digital structures
          personal_liberty: -1.0, // State deciding market structure
          authority_structure: 2.0, // Strong state power assertion
          state_intervention_scope: 4.0, // Max state intervention
          societal_focus: -2.5, // Focus on broader market health/less concentration
          rural_priority: 0.0,
          governance_approach: 1.0, // Populist, anti-big tech
        },
      },
    ],
  },
  {
    id: "energy_policy_national_focus",
    category: "Energy Policy",
    questionText: "What should be the nation's primary focus in energy policy?",
    options: [
      {
        text: "Rapid Transition to Renewable Energy Sources (Solar, Wind, etc.) with Government Support",
        value: "rapid_transition_renewables_govt_support",
        ideologyEffect: {
          // Original: econ: -2.5, eco: 4.0, scope: 3.0, digital: 1.0
          economic: -3.0, // Stronger intervention for renewables
          social_traditionalism: -1.0,
          sovereignty: -0.5,
          ecology: 4.0, // Max eco focus
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: -1.5, // Mandates, subsidies affect choices/taxes
          authority_structure: 1.0,
          state_intervention_scope: 3.5, // Stronger state role
          societal_focus: -2.0,
          rural_priority: 1.0, // Renewable projects often in rural areas
          governance_approach: -0.5,
        },
      },
      {
        text: "Energy Independence Through an 'All-of-the-Above' Approach (Fossil Fuels, Nuclear, Renewables)",
        value: "energy_independence_all_of_the_above",
        ideologyEffect: {
          // Original: econ: 0.5, sovereignty: 2.5, eco: -1.0
          economic: 0.8,
          social_traditionalism: 0.5,
          sovereignty: 3.0, // Stronger national independence
          ecology: -1.5, // Continued fossil fuel use has higher eco cost
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 1.0,
          rural_priority: 0.5, // Fossil fuels/nuclear often rural
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize Fossil Fuel Production to Ensure Affordable and Reliable Energy",
        value: "prioritize_fossil_fuels_affordable_reliable",
        ideologyEffect: {
          // Original: econ: 2.5, sovereignty: 1.5, eco: -4.0
          economic: 3.0, // Stronger market/established industry focus
          social_traditionalism: 1.0,
          sovereignty: 2.0,
          ecology: -4.0, // Max anti-eco
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: -1.5, // Less intervention for transition
          societal_focus: 2.0,
          rural_priority: 1.5, // Stronger focus on traditional energy rural areas
          governance_approach: 0.5,
        },
      },
      {
        text: "Invest Heavily in Nuclear Energy as a Clean and Powerful Long-Term Solution",
        value: "invest_nuclear_energy_clean_long_term",
        ideologyEffect: {
          // Original: econ: -1.0, eco: 1.5, scope: 2.0, digital: 2.0
          economic: -1.5, // Large state/private investment
          social_traditionalism: 0.0,
          sovereignty: 1.0,
          ecology: 1.0, // Cleaner than fossil, but waste issues. Reduced from 1.5 as "clean" is relative.
          theocratic: 0.0,
          digitalization: 2.5, // High tech
          personal_liberty: -0.5,
          authority_structure: 1.5, // Centralized control for nuclear
          state_intervention_scope: 2.5, // Significant state role/oversight
          societal_focus: -0.5,
          rural_priority: 0.5,
          governance_approach: -1.5, // Technocratic approach
        },
      },
    ],
  },
  {
    id: "social_safety_net_scope",
    category: "Social Welfare",
    questionText:
      "What should be the scope and nature of the social safety net (e.g., unemployment benefits, food assistance, housing support)?",
    options: [
      {
        text: "Expand Eligibility and Increase Benefits for Social Safety Net Programs",
        value: "expand_increase_social_safety_net",
        ideologyEffect: {
          // Original: econ: -3.5, scope: 3.8, societal: -3.0
          economic: -3.8, // Max collectivist funding
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.0, // Tax burden, potential dependency
          authority_structure: 1.0,
          state_intervention_scope: 4.0, // Max state role in welfare
          societal_focus: -3.5, // Stronger collective responsibility
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Maintain Current Levels with Reforms to Improve Efficiency and Reduce Fraud",
        value: "maintain_social_safety_net_efficiency_reforms",
        ideologyEffect: {
          // Original: econ: 0.0, scope: 0.5, societal: -0.5
          economic: 0.5, // Slight shift to efficiency saving money
          social_traditionalism: 0.5, // Focus on order/proper use
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0, // Tech for efficiency
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 0.8,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0, // Managerial approach
        },
      },
      {
        text: "Reduce Government Role; Emphasize Personal Responsibility, Private Charity, and Community Support",
        value: "reduce_govt_role_personal_responsibility_charity",
        ideologyEffect: {
          // Original: econ: 3.0, social_trad: 2.0, scope: -3.5, societal: 3.8
          economic: 3.5, // Stronger individualist/market
          social_traditionalism: 2.5, // Stronger emphasis on tradition/community self-help
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.5, // Charity often faith-based
          digitalization: -0.5,
          personal_liberty: 3.0, // Freedom from state programs
          authority_structure: -2.0,
          state_intervention_scope: -3.8, // Stronger anti-state intervention
          societal_focus: 4.0, // Max individual/non-state community focus
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Implement a Universal Basic Income (UBI) to Replace or Supplement Existing Programs",
        value: "universal_basic_income_ubi",
        ideologyEffect: {
          // Original: econ: -3.0, scope: 3.5, societal: -2.0, digital: 0.5
          economic: -3.5, // Significant economic redistribution
          social_traditionalism: -2.5, // Highly progressive/experimental
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0, // UBI distribution can be tech-enabled
          personal_liberty: 1.5, // Freedom from job necessity, but also state dependence
          authority_structure: 0.5,
          state_intervention_scope: 3.8, // Different kind of major state intervention
          societal_focus: -2.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "housing_affordability_development",
    category: "Housing & Urban Development",
    questionText:
      "How should housing affordability and urban/rural development be addressed?",
    options: [
      {
        text: "Increase Public Investment in Affordable Housing and Stricter Rent Control Measures",
        value: "public_investment_affordable_housing_rent_control",
        ideologyEffect: {
          // Original: econ: -3.0, scope: 3.0, societal: -2.5
          economic: -3.5, // Stronger intervention in housing market
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.5, // Dense housing can be eco
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.5, // Rent control limits landlord liberty
          authority_structure: 1.0,
          state_intervention_scope: 3.5, // Stronger state role
          societal_focus: -3.0, // Stronger collective good
          rural_priority: -0.5, // Often urban focus
          governance_approach: 0.0,
        },
      },
      {
        text: "Deregulate Zoning Laws to Encourage More Private Housing Construction",
        value: "deregulate_zoning_more_private_construction",
        ideologyEffect: {
          // Original: econ: 2.8, scope: -2.5, societal: 1.5, rural: -0.5
          economic: 3.5, // Stronger market-based solution
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -1.0, // Deregulation can lead to sprawl
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 2.5, // More freedom for developers/landowners
          authority_structure: -2.0,
          state_intervention_scope: -3.0, // Stronger anti-intervention
          societal_focus: 2.0,
          rural_priority: -1.0, // Can lead to urban/suburban sprawl over rural
          governance_approach: -0.5,
        },
      },
      {
        text: "Invest in Rural Development and Incentivize Decentralized Living/Working",
        value: "invest_rural_development_decentralized_living",
        ideologyEffect: {
          // Original: econ: -1.0, social_trad: 1.0, scope: 1.5, rural: 4.0
          economic: -1.5,
          social_traditionalism: 1.5,
          sovereignty: 0.5,
          ecology: 0.5, // Decentralized can be good or bad for eco
          theocratic: 0.0,
          digitalization: 1.5, // Remote work
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: 2.0, // State investment
          societal_focus: 0.5,
          rural_priority: 4.0, // Max rural focus
          governance_approach: 0.0,
        },
      },
      {
        text: "Support Community Land Trusts and Cooperative Housing Models",
        value: "community_land_trusts_cooperative_housing",
        ideologyEffect: {
          // Original: econ: -1.5, social_trad: -0.5, authority: -1.0, societal: -1.8
          economic: -2.0,
          social_traditionalism: -1.0, // More communal/alternative
          sovereignty: 0.0,
          ecology: 0.8,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: -1.5, // Less hierarchical ownership
          state_intervention_scope: 1.0, // Requires some state support/legal framework
          societal_focus: -2.5, // Stronger communitarian
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "public_transport_investment",
    category: "Infrastructure",
    questionText:
      "What is your stance on investment in public transportation infrastructure?",
    options: [
      {
        text: "Massive Investment in Expanding and Modernizing Public Transport Networks (Rail, Bus, etc.)",
        value: "massive_investment_public_transport",
        ideologyEffect: {
          // Original: econ: -2.8, eco: 2.5, scope: 3.0, societal: -2.0
          economic: -3.5, // Significant public spending
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 3.0, // Stronger eco benefit
          theocratic: 0.0,
          digitalization: 1.5, // Modern networks are tech-heavy
          personal_liberty: -1.0, // Taxes, potential shift from cars
          authority_structure: 1.0,
          state_intervention_scope: 3.5, // Major state project
          societal_focus: -2.5, // Collective benefit
          rural_priority: -1.0, // Often urban-focused
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize Road Infrastructure and Personal Vehicle Transportation; Maintain Existing Public Transport",
        value: "prioritize_roads_personal_vehicles_maintain_public_transport",
        ideologyEffect: {
          // Original: econ: 1.0, eco: -2.0, liberty: 1.5, societal: 1.0, rural: 0.5
          economic: 1.5,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -2.5, // Stronger negative eco impact
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0, // Freedom of personal vehicles
          authority_structure: -0.5,
          state_intervention_scope: 0.5, // Road spending is still state scope
          societal_focus: 1.5, // Individual mobility
          rural_priority: 1.0, // Roads benefit rural more often
          governance_approach: 0.0,
        },
      },
      {
        text: "Invest Based on Regional Needs, Balancing Public Transport with Road Development",
        value: "regional_needs_balance_public_road_transport",
        ideologyEffect: {
          // Original: econ: 0.0, authority: -0.5, rural: 0.2
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: -1.0, // Regional decision making
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: -1.0, // Pragmatic, decentralized
        },
      },
      {
        text: "Encourage Private Sector Innovation in Transportation (e.g., Ride-Sharing, Autonomous Vehicles) with Light Regulation",
        value: "encourage_private_innovation_transport_light_regulation",
        ideologyEffect: {
          // Original: econ: 2.5, eco: -0.5, liberty: 2.0, scope: -2.0, digital: 3.0
          economic: 3.0, // Stronger market focus
          social_traditionalism: -0.5,
          sovereignty: -0.5,
          ecology: -1.0,
          theocratic: 0.0,
          digitalization: 3.5, // Max tech innovation focus
          personal_liberty: 2.5,
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Minimal regulation
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "research_development_funding_govt_role",
    category: "Science & Technology",
    questionText:
      "What role should the government play in funding scientific research and technological development?",
    options: [
      {
        text: "Significantly Increase Government Funding for a Wide Range of Basic and Applied Research",
        value: "increase_govt_funding_basic_applied_research",
        ideologyEffect: {
          // Original: econ: -2.0, scope: 3.0, digital: 2.5
          economic: -2.5, // Major public investment
          social_traditionalism: -1.0, // Associated with progress
          sovereignty: 1.0, // National competitiveness
          ecology: 1.0, // Research can be eco-focused
          theocratic: -0.5, // Secular, scientific focus
          digitalization: 3.0, // Strong push for R&D
          personal_liberty: -0.5, // Taxes
          authority_structure: 1.0,
          state_intervention_scope: 3.5, // Significant state role
          societal_focus: -1.5, // Collective benefit from research
          rural_priority: 0.0,
          governance_approach: -1.0, // Can be technocratic
        },
      },
      {
        text: "Focus Government Funding on Strategic Areas (e.g., Defense, Health, Energy) and Encourage Private Sector R&D",
        value: "govt_funding_strategic_areas_encourage_private_research",
        ideologyEffect: {
          // Original: econ: 0.5, sovereignty: 1.5, scope: 1.5, digital: 1.5
          economic: 1.0, // More market-oriented, but still state role
          social_traditionalism: 0.0,
          sovereignty: 2.0, // Strategic national interests
          ecology: 0.5,
          theocratic: 0.0,
          digitalization: 2.0,
          personal_liberty: 0.5,
          authority_structure: 0.5,
          state_intervention_scope: 2.0, // Targeted state role
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Reduce Government Funding for R&D; Rely Primarily on Private Sector and Market Incentives",
        value: "reduce_govt_funding_research_rely_private_sector",
        ideologyEffect: {
          // Original: econ: 3.0, scope: -3.0, digital: -0.5
          economic: 3.5, // Strong market reliance
          social_traditionalism: 0.5,
          sovereignty: -1.0, // Less national strategic push
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: -1.0, // Potentially less foundational research
          personal_liberty: 1.5,
          authority_structure: -1.5,
          state_intervention_scope: -3.5, // Minimal state role
          societal_focus: 2.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize Research with Clear Public Benefit and Ethical Oversight, Discourage Purely Commercial or Military Applications",
        value: "prioritize_public_benefit_ethical_research",
        ideologyEffect: {
          // Original: econ: -1.0, social_trad: -1.5, eco: 1.0, liberty: -0.5, societal: -1.0
          economic: -1.5,
          social_traditionalism: -2.0, // Strong ethical/humanist focus
          sovereignty: -0.5,
          ecology: 1.5,
          theocratic: -1.0, // Strong ethical, less theological
          digitalization: 0.5,
          personal_liberty: -1.0, // Restrictions on research areas
          authority_structure: 0.0,
          state_intervention_scope: 1.5, // Ethical oversight is state role
          societal_focus: -2.0, // Strong public good focus
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "data_privacy_surveillance_govt_corp",
    category: "Civil Liberties & Technology",
    questionText:
      "What is your stance on data privacy and surveillance by governments and corporations?",
    options: [
      {
        text: "Implement Strict Data Privacy Laws (e.g., GDPR-like) Limiting Both Government and Corporate Surveillance",
        value: "strict_data_privacy_laws_limit_surveillance",
        ideologyEffect: {
          // Original: liberty: 3.5, authority: -2.0, scope: 2.5, digital: -1.0
          economic: -1.0, // Compliance costs
          social_traditionalism: -0.5,
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -1.5, // Can restrict data use for innovation
          personal_liberty: 3.8, // Max privacy protection
          authority_structure: -2.5, // Limits on state/corporate power
          state_intervention_scope: 3.0, // State enforces privacy against others
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Allow Government Surveillance for National Security and Law Enforcement with Oversight; Regulate Corporate Data Use Moderately",
        value: "govt_surveillance_national_security_regulate_corporate_data",
        ideologyEffect: {
          // Original: liberty: -2.5, authority: 2.0, scope: 1.0, digital: 0.5
          economic: 0.0,
          social_traditionalism: 1.0, // Order/security focus
          sovereignty: 1.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.8,
          personal_liberty: -3.0, // Significant allowance for surveillance
          authority_structure: 2.5, // Stronger state power
          state_intervention_scope: 1.5,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Promote Data Portability and Individual Control over Personal Data; Light Touch Regulation on Corporations",
        value: "data_portability_individual_control_light_regulation_corporate",
        ideologyEffect: {
          // Original: econ: 1.0, liberty: 1.5, scope: -1.5, digital: 1.5
          economic: 1.5,
          social_traditionalism: 0.0,
          sovereignty: -0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 2.0,
          personal_liberty: 2.0, // Individual control, less corporate restriction
          authority_structure: -1.0,
          state_intervention_scope: -2.0, // Lighter touch
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Oppose Mass Surveillance; Require Warrants for Data Access; Emphasize Corporate Transparency and Accountability",
        value: "oppose_mass_surveillance_warrants_corporate_transparency",
        ideologyEffect: {
          // Original: liberty: 3.0, authority: -1.5, scope: 0.5
          economic: -0.5,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 3.5, // Strong civil libertarian stance
          authority_structure: -2.0, // Strong limits on state power
          state_intervention_scope: 1.0, // State enforces transparency/warrants
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "cultural_heritage_preservation_funding",
    category: "Culture & Society",
    questionText:
      "How should the preservation of national cultural heritage be funded and prioritized?",
    options: [
      {
        text: "Increase Public Funding for Museums, Historical Sites, and Arts Programs Reflecting National Heritage",
        value: "increase_public_funding_cultural_heritage",
        ideologyEffect: {
          // Original: social_trad: 2.5, sovereignty: 1.0, scope: 2.0, societal: -1.0
          economic: -1.5,
          social_traditionalism: 3.0, // Stronger traditional heritage focus
          sovereignty: 1.5, // National identity
          ecology: 0.5, // Preservation can be ecological
          theocratic: 0.5, // Heritage often has religious elements
          digitalization: 0.5, // Digital preservation
          personal_liberty: -0.5, // Taxes
          authority_structure: 0.5,
          state_intervention_scope: 2.5, // Stronger state role
          societal_focus: -1.5, // Collective cultural good
          rural_priority: 0.5, // Heritage sites often rural
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize Preservation of Diverse Cultural Expressions, Including Minority and Contemporary Cultures",
        value: "prioritize_diverse_minority_contemporary_cultures",
        ideologyEffect: {
          // Original: social_trad: -2.0, sovereignty: -0.5, societal: -1.5
          economic: -1.0,
          social_traditionalism: -2.5, // Stronger multicultural/progressive
          sovereignty: -0.8, // Less nationalistic focus
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: -0.5,
          state_intervention_scope: 1.5,
          societal_focus: -2.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Rely on Private Donations, Endowments, and Ticket Sales for Cultural Preservation; Reduce Public Funding",
        value: "rely_private_donations_reduce_public_funding_culture",
        ideologyEffect: {
          // Original: econ: 2.0, social_trad: -0.5, scope: -2.5, societal: 2.0
          economic: 2.5,
          social_traditionalism: -0.8, // Less state-defined culture
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -3.0, // Stronger anti-state funding
          societal_focus: 2.5, // Individual/private support
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Focus Funding on Cultural Education and Participation Rather Than Physical Preservation Alone",
        value: "focus_cultural_education_participation_not_just_preservation",
        ideologyEffect: {
          // Original: social_trad: 0.0, scope: 0.5, societal: -0.8
          economic: -0.5,
          social_traditionalism: 0.5, // Focus on living culture
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0, // Education can be digital
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 1.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "drug_policy_criminalization_treatment",
    category: "Criminal Justice & Health",
    questionText:
      "What approach should be taken towards drug use and addiction?",
    options: [
      {
        text: "Decriminalize or Legalize Certain Drugs; Focus on Public Health, Treatment, and Harm Reduction",
        value: "decriminalize_legalize_drugs_public_health_treatment",
        ideologyEffect: {
          // Original: social_trad: -3.8, theocratic: -1.5, liberty: 3.5, authority: -2.5, scope: -2.0
          economic: -1.0, // Costs of treatment, but savings from enforcement
          social_traditionalism: -4.0, // Max progressive drug policy
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -2.0, // Secular, health-based approach
          digitalization: 0.0,
          personal_liberty: 3.8, // Max personal freedom in this context
          authority_structure: -3.0, // Strong reduction in state punitive power
          state_intervention_scope: -2.5, // Shift from punitive to supportive state role
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Increase Funding for Addiction Treatment and Mental Health Services; Maintain Criminal Penalties for Drug Trafficking",
        value: "increase_funding_treatment_maintain_trafficking_penalties",
        ideologyEffect: {
          // Original: social_trad: -1.0, liberty: -0.5, scope: 1.5, societal: -1.0
          economic: -1.5,
          social_traditionalism: -1.5, // Moderate reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // Still criminal penalties
          authority_structure: 1.0, // For trafficking
          state_intervention_scope: 2.0, // State funds treatment
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Strict Enforcement of Drug Laws, Increased Penalties for All Drug Offenses, and Border Control to Stop Drug Flow",
        value: "strict_drug_enforcement_increased_penalties_border_control",
        ideologyEffect: {
          // Original: social_trad: 3.5, theocratic: 1.0, liberty: -3.8, authority: 3.0, scope: 3.5
          economic: 0.5, // Costs of enforcement
          social_traditionalism: 3.8, // Max traditional "war on drugs"
          sovereignty: 2.0, // Border control emphasis
          ecology: 0.0,
          theocratic: 1.5, // Moralistic stance
          digitalization: 0.5, // Surveillance tech
          personal_liberty: -4.0, // Max restriction
          authority_structure: 3.5, // Max state punitive power
          state_intervention_scope: 3.8, // Max state intervention in lives
          societal_focus: 1.5, // Focus on order
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Focus on Prevention Through Education and Community Programs; Offer Voluntary Treatment Options",
        value: "drug_prevention_education_community_voluntary_treatment",
        ideologyEffect: {
          // Original: social_trad: 0.5, scope: 0.5, societal: -0.5
          economic: -0.5,
          social_traditionalism: 1.0, // Softer traditional approach
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: 1.0,
          societal_focus: -0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "mental_health_services_access_funding",
    category: "Health",
    questionText:
      "How should access to and funding for mental health services be addressed?",
    options: [
      {
        text: "Integrate Mental Health into Primary Healthcare; Increase Public Funding and Ensure Parity with Physical Health",
        value: "integrate_mental_health_primary_increase_funding_parity",
        ideologyEffect: {
          // Original: econ: -2.5, social_trad: -2.0, scope: 3.0, societal: -2.0
          economic: -3.0, // Significant public health investment
          social_traditionalism: -2.5, // Progressive health approach
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5, // Health record integration
          personal_liberty: -1.0, // Taxes
          authority_structure: 0.5,
          state_intervention_scope: 3.5, // Strong state role in health
          societal_focus: -2.5, // Collective well-being
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Increase Awareness Campaigns and Support for Community-Based Mental Health Initiatives",
        value: "increase_awareness_support_community_mental_health",
        ideologyEffect: {
          // Original: social_trad: -1.0, authority: -0.5, societal: -1.0
          economic: -1.0,
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: -0.8, // Community based is less centralized
          state_intervention_scope: 1.0,
          societal_focus: -1.5,
          rural_priority: 0.5, // Community initiatives can reach rural
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Individual Responsibility for Mental Well-being; Encourage Private Insurance and Treatment Options",
        value: "individual_responsibility_mental_health_private_insurance",
        ideologyEffect: {
          // Original: econ: 2.0, social_trad: 1.5, scope: -2.0, societal: 2.5
          economic: 2.5,
          social_traditionalism: 2.0, // Emphasis on self-reliance
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Less state role
          societal_focus: 3.0, // Strong individual focus
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Invest in Research for Mental Health Conditions and Innovative Treatment Models",
        value: "invest_research_mental_health_innovative_treatments",
        ideologyEffect: {
          // Original: econ: -0.5, scope: 1.0, digital: 1.0
          economic: -1.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.5, // Research and innovative models
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 1.5,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -1.0, // Technocratic solution
        },
      },
    ],
  },
  {
    id: "highest_court_reform_judicial",
    category: "Governance & Electoral Reform",
    questionText:
      "What reforms, if any, should be considered for the nation's highest constitutional court?",
    options: [
      {
        text: "Impose Term Limits or a Mandatory Retirement Age for Judges on the Highest Court",
        value: "term_limits_retirement_age_highest_court_judges",
        ideologyEffect: {
          // Original: social_trad: -1.0, authority: -1.5, governance: 0.5
          economic: 0.0,
          social_traditionalism: -1.5, // Moderately reformist
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5, // Could increase responsiveness to public will over time
          authority_structure: -2.0, // Reduces entrenched power
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 1.0, // Populist appeal against lifetime appointments
        },
      },
      {
        text: "Consider Expanding the Number of Judges on the Highest Court to Ensure Balance",
        value: "expand_number_judges_highest_court_balance",
        ideologyEffect: {
          // Original: social_trad: -0.5, authority: 0.5, scope: 0.8, governance: 1.0
          economic: 0.0,
          social_traditionalism: -0.8, // Often seen as a way to shift ideological balance
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 1.0, // Executive/legislative asserting influence
          state_intervention_scope: 1.0, // Active change to court structure
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.5, // Can be partisan rather than purely populist or institutional
        },
      },
      {
        text: "Maintain the Current Structure and Appointment Process for the Highest Court",
        value: "maintain_current_highest_court_structure_appointment",
        ideologyEffect: {
          // Original: social_trad: 2.0, authority: 1.0, governance: -1.5
          economic: 0.0,
          social_traditionalism: 3.0, // Strongly traditional
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 1.5, // Upholding established structures
          state_intervention_scope: 0.0,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -2.5, // Strongly institutionalist
        },
      },
      {
        text: "Implement a Binding Code of Ethics and Stricter Financial Disclosure for Highest Court Judges",
        value: "binding_code_ethics_disclosure_highest_court_judges",
        ideologyEffect: {
          // Original: social_trad: -1.0, authority: -1.0, scope: 0.5, governance: -1.0
          economic: 0.0,
          social_traditionalism: -1.5, // Reform for accountability
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: -1.5, // Increased accountability of authority
          state_intervention_scope: 0.8,
          societal_focus: -0.5, // Good governance
          rural_priority: 0.0,
          governance_approach: -1.5, // Strong institutional reform for integrity
        },
      },
    ],
  },
  {
    id: "electoral_district_manipulation_reform",
    category: "Governance & Electoral Reform",
    questionText:
      "How should the issue of manipulating electoral district boundaries (e.g., gerrymandering) be addressed?",
    options: [
      {
        text: "Require Independent, Non-Partisan Commissions for All Electoral Redistricting",
        value: "independent_non_partisan_redistricting_commissions",
        ideologyEffect: {
          // Original: social_trad: -1.5, liberty: 1.0, authority: -2.5, governance: -2.0
          economic: 0.0,
          social_traditionalism: -2.5, // Strong progressive reform for fairness
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5, // Fairer representation
          authority_structure: -3.0, // Significant reduction of partisan state actor power
          state_intervention_scope: 0.5,
          societal_focus: -1.5, // Collective democratic fairness
          rural_priority: 0.0,
          governance_approach: -3.0, // Strong push for non-partisan institutionalism
        },
      },
      {
        text: "Establish Clear National Standards for Compactness, Contiguity, and Community Representation",
        value: "national_standards_redistricting_compactness_community",
        ideologyEffect: {
          // Original: social_trad: -0.5, authority: 1.0, scope: 1.0, governance: -1.0
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.8,
          authority_structure: 1.5, // Stronger central standards
          state_intervention_scope: 1.5, // Stronger state imposing standards
          societal_focus: -0.8,
          rural_priority: 0.0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Allow Elected Legislatures to Control Redistricting, Reflecting Political Mandates",
        value: "elected_legislatures_control_redistricting_political_mandates",
        ideologyEffect: {
          // Original: social_trad: 1.0, liberty: -1.0, authority: 1.5, governance: 1.0
          economic: 0.0,
          social_traditionalism: 1.5, // Maintaining existing power dynamics
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Can harm voter fairness
          authority_structure: 2.0, // Power with ruling parties
          state_intervention_scope: 0.5,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: 1.5, // Can be populist if framed as "elected will" but more often partisan institutional
        },
      },
      {
        text: "Explore Proportional Representation Systems to Reduce the Impact of District Boundaries",
        value: "proportional_representation_systems_reduce_districting_impact",
        ideologyEffect: {
          // Original: social_trad: -2.0, liberty: 1.5, authority: -2.0
          economic: -0.5,
          social_traditionalism: -2.5, // Significant progressive electoral reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0, // More accurate vote reflection
          authority_structure: -2.5, // Less concentrated power, more coalitions
          state_intervention_scope: 0.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "decentralization_regional_autonomy",
    category: "Governance & Electoral Reform",
    questionText:
      "What is your stance on decentralization and regional autonomy within the nation?",
    options: [
      {
        text: "Strengthen Central Government Authority to Ensure National Unity and Uniform Standards",
        value: "strengthen_central_government_authority",
        ideologyEffect: {
          // Original: social_trad: 1.0, sovereignty: 1.0, liberty: -1.5, authority: 3.0, scope: 2.0
          economic: 0.0,
          social_traditionalism: 1.5,
          sovereignty: 1.5, // National unity focus
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -2.0, // Stronger limits on regional deviation
          authority_structure: 3.5, // Stronger centralization
          state_intervention_scope: 2.5, // Stronger central state power
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -1.5, // Stronger top-down institutional
        },
      },
      {
        text: "Support Devolution of More Powers and Resources to Regional and Local Governments",
        value: "support_devolution_regional_local_governments",
        ideologyEffect: {
          // Original: sovereignty: -1.0, liberty: 1.0, authority: -3.0, scope: -2.0
          economic: 0.0,
          social_traditionalism: -0.5,
          sovereignty: -1.5, // Clearer shift from central
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -3.5, // Stronger decentralization
          state_intervention_scope: -2.5, // Stronger reduction in central scope
          societal_focus: 0.5,
          rural_priority: 1.5, // Stronger rural autonomy benefit
          governance_approach: 1.5, // Stronger "power to people/local"
        },
      },
      {
        text: "Advocate for a Federal System with Clearly Defined and Protected Regional Autonomies",
        value: "advocate_federal_system_regional_autonomy",
        ideologyEffect: {
          // Original: authority: -2.0, scope: -1.0
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.8,
          authority_structure: -2.5, // Clearer decentralization
          state_intervention_scope: -1.5, // Clearer limit on central scope
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Recognize Rights to Self-Determination for Distinct Cultural/Ethnic Regions, Potentially Including Secession Referendums",
        value: "recognize_self_determination_secession_rights",
        ideologyEffect: {
          // Original: social_trad: -1.0, sovereignty: -3.5, liberty: 2.0, authority: -4.0, scope: -3.0
          economic: 0.0,
          social_traditionalism: -1.5,
          sovereignty: -4.0, // Max challenge to existing national sovereignty
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -4.0, // Max decentralization (anarchic implications for central state)
          state_intervention_scope: -3.5, // Central state loses all scope
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: 2.5, // Strong populist/direct will for region
        },
      },
    ],
  },
  {
    id: "net_neutrality_internet_access",
    category: "Technology & Innovation",
    questionText:
      "Should Net Neutrality principles (equal access to internet content) be enforced by the government?",
    options: [
      {
        text: "Yes, Reinstate and Enforce Strong Net Neutrality Rules via a National Regulator or Legislation",
        value: "reinstate_strong_net_neutrality_rules_regulator",
        ideologyEffect: {
          // Original: econ: -1.5, liberty: 1.5, authority: 1.0, scope: 2.0
          economic: -2.0, // Stronger regulation of ISPs
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 2.0, // Stronger user access protection
          authority_structure: 1.5,
          state_intervention_scope: 2.5, // Stronger state regulation
          societal_focus: -1.5, // Stronger collective good of open internet
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "No, Current Regulatory Approach is Sufficient; Market Forces Promote Fair Access and Investment",
        value: "no_net_neutrality_market_forces_fair_access",
        ideologyEffect: {
          // Original: econ: 2.5, liberty: -1.0, scope: -2.0
          economic: 3.0, // Stronger market forces argument
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Stronger allowance for ISP control
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Stronger anti-regulation
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support a Lighter-Touch Approach to Net Neutrality, Focusing on Transparency from ISPs",
        value: "lighter_touch_net_neutrality_isp_transparency",
        ideologyEffect: {
          // Original: econ: 1.0, scope: -0.8
          economic: 1.5,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5, // Transparency offers some user power
          authority_structure: -0.5,
          state_intervention_scope: -1.0, // Clearer light touch
          societal_focus: 0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Promoting Competition Among Internet Service Providers (ISPs) to Ensure Fair Practices",
        value: "promote_isp_competition_ensure_fair_practices_net_neutrality",
        ideologyEffect: {
          // Original: econ: 1.8, scope: -1.5, societal: 1.5
          economic: 2.5, // Stronger pro-competition
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -2.0, // State promotes competition, less direct regulation of service
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "space_exploration_national_priorities",
    category: "Technology & Innovation",
    questionText:
      "What should be the priorities for national space exploration and research funding?",
    options: [
      {
        text: "Increase National Space Agency Funding for Scientific Research and Human Exploration (e.g., Moon, Mars missions)",
        value: "increase_space_agency_funding_exploration_research",
        ideologyEffect: {
          // Original: econ: -1.0, sovereignty: 1.5, eco: -0.8, digital: 3.0, scope: 1.5
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 2.0, // Stronger national prestige
          ecology: -1.0, // Clearer eco cost
          theocratic: -0.5,
          digitalization: 3.5, // Max tech
          personal_liberty: -0.5,
          authority_structure: 1.5,
          state_intervention_scope: 2.0, // Stronger state funding
          societal_focus: -1.0, // Stronger collective endeavor
          rural_priority: 0.0,
          governance_approach: -2.0,
        },
      },
      {
        text: "Prioritize Public-Private Partnerships for Space Exploration, Development, and Commercialization",
        value: "prioritize_ppp_space_exploration_commercialization",
        ideologyEffect: {
          // Original: econ: 1.5, digital: 2.0, scope: -0.5
          economic: 2.0, // Clearer market-driven
          social_traditionalism: 0.0,
          sovereignty: 0.5, // National involvement but also private
          ecology: -0.8,
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -1.0, // State facilitates
          societal_focus: 1.5, // Market driven
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Focus Space Funding on Earth Observation for Climate Monitoring, Resource Management, and Disaster Response",
        value: "focus_space_funding_earth_observation_climate_disaster",
        ideologyEffect: {
          // Original: econ: -1.0, sovereignty: -1.0, eco: 2.5, digital: 2.0, societal: -1.5
          economic: -1.5,
          social_traditionalism: -1.0,
          sovereignty: -1.5,
          ecology: 3.5, // Stronger eco application
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5,
          societal_focus: -2.0, // Stronger collective good
          rural_priority: 0.5,
          governance_approach: -1.5,
        },
      },
      {
        text: "Maintain Current Space Funding Levels, Balanced with Other Critical National Priorities",
        value: "maintain_current_space_funding_balance_national_priorities",
        ideologyEffect: {
          // Remains moderate/neutral
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "private_prison_industry_role",
    category: "Criminal Justice",
    questionText:
      "What is your stance on the use of private, for-profit prisons?",
    options: [
      {
        text: "Ban the Use of Private Prisons at National and Regional Levels",
        value: "ban_private_prisons_national_regional",
        ideologyEffect: {
          // Original: econ: -1.5, social_trad: -1.0, authority: 1.0, scope: 1.5
          economic: -2.5, // Stronger anti-profit motive in justice
          social_traditionalism: -1.5, // Stronger progressive justice stance
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0, // Aims to improve conditions
          authority_structure: 1.5, // Stronger state monopoly
          state_intervention_scope: 2.0,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Phase Out National Government Use of Private Prisons; Encourage Regional Governments to Follow",
        value: "phase_out_national_private_prisons_encourage_regional",
        ideologyEffect: {
          // Original: econ: -0.8, social_trad: -0.5, authority: 0.5, scope: 0.8
          economic: -1.5,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.8,
          state_intervention_scope: 1.2,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Allow Private Prisons with Strict Government Oversight, Accountability, and Performance Standards",
        value: "allow_private_prisons_strict_oversight_accountability",
        ideologyEffect: {
          // Original: econ: 0.8, social_trad: 0.5, scope: 0.8
          economic: 1.0,
          social_traditionalism: 0.8,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 0.5, // For oversight
          state_intervention_scope: 1.0, // Stronger oversight role
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Private Prisons Can Offer Cost Savings and Efficiency; Support Their Continued Use and Expansion",
        value: "support_private_prisons_cost_savings_efficiency_expansion",
        ideologyEffect: {
          // Original: econ: 2.5, social_trad: 1.0, liberty: -1.0, authority: -1.0, scope: -2.0
          economic: 3.0, // Stronger market-based
          social_traditionalism: 1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Stronger negative implication for rights
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Stronger reduction in direct state provision
          societal_focus: 2.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "juvenile_justice_system_reform_youth",
    category: "Criminal Justice",
    questionText:
      "What approach should be taken to reforming the juvenile justice system?",
    options: [
      {
        text: "Focus on Rehabilitation, Diversion Programs, and Community-Based Alternatives to Youth Incarceration",
        value:
          "rehabilitation_diversion_community_alternatives_juvenile_justice",
        ideologyEffect: {
          // Original: social_trad: -2.5, liberty: 2.0, authority: -2.0, scope: -1.0, societal: -2.0
          economic: -1.0,
          social_traditionalism: -3.0, // Stronger progressive/rehab focus
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -2.5, // More decentralized/community
          state_intervention_scope: -1.5, // Reducing punitive state
          societal_focus: -2.5, // Stronger collective care for youth
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Raise the Age of Criminal Responsibility and End Practices like Juvenile Life Without Parole",
        value: "raise_age_criminal_responsibility_end_juvenile_lwop",
        ideologyEffect: {
          // Original: social_trad: -2.0, liberty: 1.5, authority: -1.0, scope: -1.0
          economic: 0.0,
          social_traditionalism: -2.5, // Stronger progressive reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0, // Stronger rights for juveniles
          authority_structure: -1.5,
          state_intervention_scope: -1.5, // Stronger reduction in severe punishment
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Maintain Stricter Penalties for Serious Juvenile Offenses; Retain Option to Try Youth as Adults in Certain Cases",
        value: "stricter_penalties_serious_juvenile_offenses_try_as_adults",
        ideologyEffect: {
          // Original: social_trad: 2.0, liberty: -2.0, authority: 1.5, scope: 1.8
          economic: 0.0,
          social_traditionalism: 2.5, // Stronger traditional punitive
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.5, // Harsher impact
          authority_structure: 2.0, // Stronger state punitive power
          state_intervention_scope: 2.0,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Invest in Early Intervention, Education, and Support Services for At-Risk Youth and Their Families",
        value:
          "invest_early_intervention_education_support_at_risk_youth_families",
        ideologyEffect: {
          // Original: econ: -1.5, social_trad: -1.0, scope: 1.5, societal: -2.0
          economic: -2.0, // Stronger investment
          social_traditionalism: -1.5, // Clearer proactive support
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 2.0, // Stronger state social programs
          societal_focus: -2.5, // Stronger collective investment
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "high_speed_rail_national_network",
    category: "Infrastructure",
    questionText:
      "Should the national government invest in developing a national high-speed rail network?",
    options: [
      {
        text: "Yes, Commit Significant National Investment to Build a Comprehensive High-Speed Rail Network",
        value: "yes_significant_national_investment_hsr_network",
        ideologyEffect: {
          // Original: econ: -3, authority: 2, scope: 3
          economic: -3.5,
          social_traditionalism: 0,
          sovereignty: 0.5, // National project
          ecology: 1.5, // Stronger eco positive
          theocratic: 0,
          digitalization: 1.5, // Modern infra
          personal_liberty: -1.0, // Taxes/land use
          authority_structure: 2.5, // Stronger central planning
          state_intervention_scope: 3.5, // Major state project
          societal_focus: -1.5,
          rural_priority: 0.0, // Depends on routes
          governance_approach: -1.0, // Big institutional project
        },
      },
      {
        text: "Support Pilot Projects and Development of Key Regional High-Speed Rail Corridors",
        value: "support_pilot_projects_regional_hsr_corridors",
        ideologyEffect: {
          // Original: econ: -1.5, eco: 0.5, scope: 1.5
          economic: -2.0,
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: 1.0, // Clearer eco positive
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: -0.5,
          authority_structure: -0.5, // More regional
          state_intervention_scope: 2.0,
          societal_focus: -0.5,
          rural_priority: 0.5, // Regional corridors might hit some rural
          governance_approach: -0.5,
        },
      },
      {
        text: "No, High-Speed Rail is Too Costly and Impractical for Widespread Implementation; Focus on Existing Infrastructure",
        value: "no_hsr_too_costly_impractical_focus_existing_infra",
        ideologyEffect: {
          // Original: econ: 2, eco: -1, scope: -2, digital: -1
          economic: 2.5, // Stronger fiscal conservatism
          social_traditionalism: 0.5, // Focus on existing can be traditional
          sovereignty: 0,
          ecology: -1.5, // Stronger negative if existing is worse
          theocratic: 0,
          digitalization: -1.5, // Less tech investment
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: -2.5, // Less state spending
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Encourage Private Investment in High-Speed Rail with Minimal Government Subsidies or Loan Guarantees",
        value: "encourage_private_investment_hsr_minimal_subsidies",
        ideologyEffect: {
          // Original: econ: 3, authority: -1, scope: -3, digital: 1
          economic: 3.5, // Strong L-F
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.0, // Private might not prioritize eco
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 1.0,
          authority_structure: -1.5,
          state_intervention_scope: -3.5, // Max minimal state
          societal_focus: 2.5,
          rural_priority: -0.5, // Private likely focus urban
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "rural_digital_connectivity",
    category: "Infrastructure",
    questionText:
      "How should access to high-speed internet (broadband) in rural and underserved areas be expanded?",
    options: [
      {
        text: "Direct National Funding and Public Utility Programs to Ensure Universal Rural Broadband Access",
        value: "national_funding_public_utility_universal_rural_broadband",
        ideologyEffect: {
          // Original: econ: -3, authority: 2, scope: 3, societal: -3, rural: 3
          economic: -3.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.5,
          personal_liberty: -0.5,
          authority_structure: 2.5,
          state_intervention_scope: 3.5,
          societal_focus: -3.5, // Max collectivist access
          rural_priority: 3.8, // Max rural priority
          governance_approach: 0,
        },
      },
      {
        text: "Incentivize Private Companies to Expand Service to Rural Areas through Tax Breaks, Subsidies, and Deregulation",
        value: "incentivize_private_companies_rural_broadband_expansion",
        ideologyEffect: {
          // Original: econ: 2, scope: -1, rural: 2
          economic: 2.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.0,
          personal_liberty: 1.0,
          authority_structure: 0,
          state_intervention_scope: -1.5, // Clearer deregulation
          societal_focus: 1.5,
          rural_priority: 2.5, // Stronger rural focus via market
          governance_approach: 0,
        },
      },
      {
        text: "Support Community-Owned Networks, Municipal Broadband, and Co-operative Models for Rural Connectivity",
        value: "support_community_municipal_coop_rural_broadband",
        ideologyEffect: {
          // Original: econ: -1, authority: -3, societal: -2, rural: 3
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.0,
          personal_liberty: 0.5,
          authority_structure: -3.5, // Max decentralization
          state_intervention_scope: 0.5, // State enables/supports these models
          societal_focus: -2.5, // Stronger community focus
          rural_priority: 3.5, // Stronger rural focus
          governance_approach: 1.5, // Stronger populist/community
        },
      },
      {
        text: "Prioritize Development and Deployment of Satellite and Advanced Wireless Technologies for Remote Areas",
        value: "satellite_advanced_wireless_tech_remote_area_broadband",
        ideologyEffect: {
          // Original: digital: 3, rural: 2
          economic: 0.5, // Can involve private or public R&D
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 3.5, // Max tech focus
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.5, // State might prioritize R&D
          societal_focus: 0,
          rural_priority: 2.5, // Stronger rural tech focus
          governance_approach: -1.0, // Technocratic solution
        },
      },
    ],
  },
  {
    id: "carbon_pricing_mechanisms",
    category: "Energy Policy",
    questionText:
      "What is your stance on implementing carbon pricing mechanisms (e.g., carbon tax or cap-and-trade)?",
    options: [
      {
        text: "Implement a National Carbon Tax, with Revenue Returned to Households (Carbon Dividend) or Invested in Green Initiatives",
        value: "implement_national_carbon_tax_dividend_or_green_investment",
        ideologyEffect: {
          // Original: econ: -1, eco: 3, scope: 2, societal: -1
          economic: -1.5, // Tax is intervention
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 3.5, // Stronger eco
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5, // Tax affects individuals
          authority_structure: 1.5,
          state_intervention_scope: 2.5, // Stronger state action
          societal_focus: -1.5, // Dividend/green investment more collectivist
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Establish a National Cap-and-Trade System to Limit Emissions and Create a Market for Carbon Allowances",
        value: "establish_national_cap_and_trade_system_carbon",
        ideologyEffect: {
          // Original: eco: 2.5, scope: 1.5, governance: -1
          economic: 0.5, // Creates a market, but state sets cap
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 3.0, // Strong eco
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.0,
          state_intervention_scope: 2.0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: -1.5, // More institutional/market-design
        },
      },
      {
        text: "Oppose National Carbon Pricing; Concerned about Negative Economic Impacts on Consumers and Industries",
        value: "oppose_national_carbon_pricing_economic_impacts",
        ideologyEffect: {
          // Original: econ: 2, eco: -3, scope: -2
          economic: 2.5, // Stronger opposition to intervention
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: -3.5, // Stronger anti-eco pricing
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0, // Freedom from carbon tax
          authority_structure: 0,
          state_intervention_scope: -2.5, // Stronger anti-intervention
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0.5, // Can be populist
        },
      },
      {
        text: "Prefer Direct Regulation, Subsidies for Green Technology, and Voluntary Measures over Carbon Pricing",
        value:
          "prefer_direct_regulation_subsidies_voluntary_over_carbon_pricing",
        ideologyEffect: {
          // Original: econ: -1, eco: 1, scope: 1
          economic: -1.5, // Subsidies/regulation are interventionist
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 1.5, // Still some eco focus, but different tools
          theocratic: 0,
          digitalization: 0.5, // Green tech
          personal_liberty: -0.5, // Regulation
          authority_structure: 1.0,
          state_intervention_scope: 1.5,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "fossil_fuel_industry_subsidies",
    category: "Energy Policy",
    questionText:
      "Should government subsidies for the fossil fuel industry be eliminated or reformed?",
    options: [
      {
        text: "Yes, Eliminate All Direct and Indirect Fossil Fuel Subsidies Immediately",
        value: "eliminate_all_fossil_fuel_subsidies_immediately",
        ideologyEffect: {
          // Original: econ: 2, eco: 3, scope: -2
          economic: 2.5, // Stronger L-F for this
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 3.5, // Max eco benefit from this action
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: -2.5, // Removing intervention
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0.5, // Can be populist anti-corporate welfare
        },
      },
      {
        text: "Phase Out Fossil Fuel Subsidies Gradually and Reinvest Savings in Renewable Energy and Energy Efficiency",
        value: "phase_out_fossil_fuel_subsidies_reinvest_renewables_efficiency",
        ideologyEffect: {
          // Original: econ: 0, eco: 2.5, scope: 1
          economic: -0.5, // Reinvestment is state direction
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 3.0, // Strong eco
          theocratic: 0,
          digitalization: 0.5, // Renewable tech
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 1.5, // State managing transition
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Maintain Some Subsidies to Ensure Energy Security, Affordability, and Support for Workers during Transition",
        value:
          "maintain_some_fossil_fuel_subsidies_security_affordability_transition",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 1, eco: -2, scope: 1, societal: -1
          economic: -1.5, // Subsidies are interventionist
          social_traditionalism: 0.5, // Support for workers/trad industries
          sovereignty: 1.5, // Stronger security argument
          ecology: -2.5, // Clearer negative eco impact
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // Maintaining intervention
          societal_focus: -1.5,
          rural_priority: 0.5, // Support for traditional energy jobs in some areas
          governance_approach: 0,
        },
      },
      {
        text: "Fossil Fuel Subsidies are Necessary for Economic Competitiveness, Job Creation, and Affordable Energy",
        value: "fossil_fuel_subsidies_necessary_economy_jobs_affordable_energy",
        ideologyEffect: {
          // Original: econ: -2, sovereignty: 1, eco: -3, scope: 2
          economic: -2.5, // Strong intervention for specific industry
          social_traditionalism: 1.0,
          sovereignty: 1.5,
          ecology: -3.5, // Max anti-eco rationale here
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 2.5, // Strong state support for industry
          societal_focus: 0.5, // Framing as broad economic benefit
          rural_priority: 1.0, // Often benefits rural energy areas
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "gig_economy_labor_protections",
    category: "Labor & Employment",
    questionText:
      "How should workers in the gig economy (e.g., ride-share drivers, freelance platform workers) be classified and protected?",
    options: [
      {
        text: "Classify Most Gig Workers as Employees Entitled to Full Benefits and Labor Protections",
        value: "classify_gig_workers_employees_full_benefits_protections",
        ideologyEffect: {
          // Original: econ: -2, liberty: -2, scope: 2, societal: -3
          economic: -2.5, // Stronger collectivist labor approach
          social_traditionalism: -1.0, // Progressive worker rights
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0, // Addressing consequences of digital platforms
          personal_liberty: -2.5, // Stronger order > choice; mandates protections
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state intervention
          societal_focus: -3.5, // Stronger collectivist focus on worker rights
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Create a Third Category of Worker with Some Protections (e.g., Portable Benefits, Minimum Earnings Guarantee)",
        value:
          "third_category_worker_gig_economy_portable_benefits_min_earnings",
        ideologyEffect: {
          // Original: econ: -1, scope: 1, societal: -1
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 1.5, // Clearer moderate intervention
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Maintain Independent Contractor Status for Most Gig Workers to Preserve Flexibility and Innovation",
        value: "maintain_independent_contractor_status_gig_workers_flexibility",
        ideologyEffect: {
          // Original: econ: 3, liberty: 2, scope: -2, societal: 2, digital: 1
          economic: 3.5, // Stronger Laissez-Faire
          social_traditionalism: 0.5, // Focus on business/innovation over worker protection can be traditional market view
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5, // Stronger link to enabling innovation
          personal_liberty: 2.5, // Stronger emphasis on flexibility/business freedom
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Stronger anti-intervention
          societal_focus: 2.5, // Stronger individualist focus
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Strengthen Enforcement Against Misclassification of Employees as Contractors Across All Sectors",
        value: "strengthen_enforcement_misclassification_employees_contractors",
        ideologyEffect: {
          // Original: econ: -1, liberty: -1, scope: 1, societal: -1
          economic: -1.0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0,
          authority_structure: 1.0,
          state_intervention_scope: 1.5, // Clearer state enforcement
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "workplace_safety_agency_role",
    category: "Labor & Employment",
    questionText:
      "What is your stance on the role and funding of the national workplace safety agency/standards body?",
    options: [
      {
        text: "Significantly Increase Agency Funding, Enforcement Powers, and Standard-Setting Authority",
        value: "increase_workplace_safety_agency_funding_enforcement_standards",
        ideologyEffect: {
          // Original: econ: -2, liberty: -2, authority: 2, scope: 3, societal: -2
          economic: -2.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.5, // Stronger mandates
          authority_structure: 2.5, // Stronger agency power
          state_intervention_scope: 3.5, // Max state intervention in this domain
          societal_focus: -2.5, // Stronger collectivist focus on safety
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Maintain Current Agency Funding, Focus on Collaborative Approaches with Businesses and Worker Education",
        value:
          "maintain_workplace_safety_agency_funding_collaborative_education",
        ideologyEffect: {
          // Remains neutral/moderate
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
      {
        text: "Reduce Agency's Regulatory Burden on Businesses, Emphasize Voluntary Compliance and Industry Self-Regulation",
        value:
          "reduce_workplace_safety_agency_regulatory_burden_voluntary_compliance",
        ideologyEffect: {
          // Original: econ: 3, liberty: 2, scope: -3, societal: 2
          economic: 3.5, // Stronger L-F
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Stronger business freedom
          authority_structure: -1.5,
          state_intervention_scope: -3.5, // Max reduction in state role
          societal_focus: 2.5, // Stronger individualist/voluntary focus
          rural_priority: 0,
          governance_approach: 0.5, // Anti-regulatory can be populist
        },
      },
      {
        text: "Strengthen Whistleblower Protections for Workers Reporting Safety Violations and Unsafe Conditions",
        value:
          "strengthen_whistleblower_protections_workplace_safety_violations",
        ideologyEffect: {
          // Original: liberty: 1, scope: 1, societal: -1, governance: 1
          economic: -0.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5, // Clearer protection for individuals
          authority_structure: 0,
          state_intervention_scope: 1.0,
          societal_focus: -1.5, // Stronger collectivist interest via individual empowerment
          rural_priority: 0,
          governance_approach: 1.5, // Clearer populist empowerment
        },
      },
    ],
  },
  {
    id: "undocumented_immigrants_status_policy",
    category: "Immigration",
    questionText:
      "What approach should be taken regarding long-term undocumented immigrants residing in the country?",
    options: [
      {
        text: "Provide a Pathway to Citizenship for Most Long-Term Undocumented Immigrants",
        value: "pathway_citizenship_long_term_undocumented",
        ideologyEffect: {
          // Original: social_trad: -3, sovereignty: -2, liberty: 2, societal: -2
          economic: -0.5, // Potential economic integration effects
          social_traditionalism: -3.5, // Highly progressive
          sovereignty: -2.5, // More internationalist/inclusive
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Grants significant rights
          authority_structure: 0,
          state_intervention_scope: 1.0,
          societal_focus: -2.5, // Stronger collectivist/humanitarian
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Grant Permanent Legal Residency Status, but Not Necessarily Full Citizenship",
        value: "permanent_legal_residency_undocumented",
        ideologyEffect: {
          // Original: social_trad: -1.5, sovereignty: -1, liberty: 1, societal: -1
          economic: 0,
          social_traditionalism: -2.0,
          sovereignty: -1.5,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: 0,
          state_intervention_scope: 0.5,
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Offer Temporary Work Permits or Renewable Visas, Without a Path to Permanent Status",
        value: "temporary_work_permits_undocumented_no_permanent_path",
        ideologyEffect: {
          // Original: social_trad: 1, sovereignty: 1, societal: 1
          economic: 1.0, // Focus on labor utility
          social_traditionalism: 1.5, // More traditional/restrictive immigration
          sovereignty: 1.5, // Stronger national control
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5, // Limited rights for immigrants
          authority_structure: 0.5,
          state_intervention_scope: 0.5,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Prioritize Enforcement and Deportation for All Undocumented Immigrants",
        value: "prioritize_deportation_all_undocumented",
        ideologyEffect: {
          // Original: social_trad: 3, sovereignty: 3, liberty: -3, scope: 2, societal: 2
          economic: 0.5, // Costs of enforcement, potential labor market impacts
          social_traditionalism: 3.5, // Highly traditional/exclusionary
          sovereignty: 3.8, // Max national border enforcement
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -3.5, // Max order > choice for immigrants
          authority_structure: 2.0, // Strong state enforcement apparatus
          state_intervention_scope: 2.5, // Significant state action
          societal_focus: 2.5, // Strong emphasis on rule of law/existing citizenry
          rural_priority: 0,
          governance_approach: 1.0, // Can be populist
        },
      },
    ],
  },
  {
    id: "refugee_asylum_intake_policy",
    category: "Immigration",
    questionText:
      "What should be the nation's policy on refugee admissions and processing asylum claims?",
    options: [
      {
        text: "Significantly Increase Refugee Admission Quotas and Expand Asylum Eligibility Criteria",
        value: "increase_refugee_quotas_expand_asylum_eligibility",
        ideologyEffect: {
          // Original: social_trad: -3, sovereignty: -3, liberty: 2, societal: -2
          economic: -0.5, // Costs of support
          social_traditionalism: -3.5, // Highly progressive/humanitarian
          sovereignty: -3.8, // Strong internationalist
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5,
          authority_structure: -0.5,
          state_intervention_scope: 1.5, // Managing larger intake
          societal_focus: -2.5, // Strong global humanitarian concern
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Maintain Current Refugee Intake Levels, Focus on Efficient and Fair Asylum Processing",
        value: "maintain_refugee_intake_efficient_fair_asylum_processing",
        ideologyEffect: {
          // Remains neutral/moderate
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
      {
        text: "Reduce Refugee Admission Quotas and Implement Stricter Asylum Standards and Procedures",
        value: "reduce_refugee_quotas_stricter_asylum_standards",
        ideologyEffect: {
          // Original: social_trad: 3, sovereignty: 3, liberty: -2, authority: 1, scope: 1, societal: 2
          economic: 0,
          social_traditionalism: 3.5, // Highly traditional/restrictive
          sovereignty: 3.8, // Max nationalist control
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.5,
          authority_structure: 1.5,
          state_intervention_scope: 1.5,
          societal_focus: 2.5, // Strong national interest focus
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Prioritize Refugees from Specific Crisis Regions or Persecuted Groups based on National Assessment",
        value: "prioritize_specific_refugees_crisis_regions_persecution",
        ideologyEffect: {
          // Original: sovereignty: 1, scope: 0.5, governance: -1
          economic: 0,
          social_traditionalism: 0, // Can be progressive or traditional depending on criteria
          sovereignty: 1.5, // Stronger national control/assessment
          ecology: 0,
          theocratic: 0, // Could be + if prioritizing co-religionists, but neutral by default
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 0.8,
          societal_focus: 0.0, // Could be humanitarian for chosen groups, exclusionary for others
          rural_priority: 0,
          governance_approach: -1.5, // More elitist/institutional decision-making
        },
      },
    ],
  },
  {
    id: "agricultural_subsidies_food_production",
    category: "Agriculture & Rural Development",
    questionText:
      "What is your stance on agricultural subsidies and support programs for food producers?",
    options: [
      {
        text: "Phase Out Most Agricultural Subsidies to Promote Free Market Principles in Farming",
        value: "phase_out_agricultural_subsidies_free_market_farming",
        ideologyEffect: {
          // Original: econ: 3, sovereignty: -1, scope: -3, societal: 2, rural: -1
          economic: 3.5, // Strong L-F
          social_traditionalism: 0,
          sovereignty: -1.5, // Could reduce food sec if domestic prod drops
          ecology: 0.5, // Removing some harmful subsidies might be good
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -3.5, // Max reduction in state intervention
          societal_focus: 2.5,
          rural_priority: -1.5, // Potentially very negative for many farmers
          governance_approach: 0,
        },
      },
      {
        text: "Reform Subsidies to Support Small and Medium-Sized Farms, Sustainable Practices, and Food Security",
        value:
          "reform_subsidies_small_farms_sustainable_practices_food_security",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 1, eco: 2, scope: 1, societal: -1, rural: 2
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 1.5,
          ecology: 2.5, // Stronger eco focus
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 1.5,
          societal_focus: -1.5,
          rural_priority: 2.5, // Stronger rural/small farm support
          governance_approach: 0.5, // Can be populist appeal to small farmers
        },
      },
      {
        text: "Maintain Current Subsidy Levels to Ensure a Stable Food Supply, Protect Farmers' Livelihoods, and Rural Economies",
        value:
          "maintain_current_subsidies_stable_food_supply_farmer_livelihoods",
        ideologyEffect: {
          // Original: econ: -2, sovereignty: 1.5, scope: 2, societal: -1, rural: 1
          economic: -2.5, // Strong collectivist support for sector
          social_traditionalism: 1.0, // Protecting traditional livelihoods
          sovereignty: 2.0, // Stronger food supply focus
          ecology: -0.5, // Current subsidies may not be eco-friendly
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 2.5, // Strong ongoing state intervention
          societal_focus: -1.5,
          rural_priority: 1.5,
          governance_approach: 0,
        },
      },
      {
        text: "Shift Subsidies from Conventional Commodity Crops to Organic Farming, Specialty Crops, and Environmental Conservation",
        value: "shift_subsidies_organic_specialty_crops_conservation",
        ideologyEffect: {
          // Original: econ: -1.5, eco: 3, scope: 1.5, societal: -1, rural: 1
          economic: -2.0,
          social_traditionalism: -1.0, // Progressive shift
          sovereignty: 0,
          ecology: 3.5, // Stronger eco shift
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 2.0,
          societal_focus: -1.5,
          rural_priority: 1.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "food_security_supply_chain_resilience",
    category: "Agriculture & Rural Development",
    questionText:
      "How should national food security and supply chain resilience be promoted?",
    options: [
      {
        text: "Invest in Local and Regional Food Systems, Reducing Reliance on Long Supply Chains",
        value: "invest_local_regional_food_systems_reduce_reliance_long_chains",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 2, eco: 1, authority: -2, rural: 2, governance: 1
          economic: -1.5,
          social_traditionalism: 0.5, // Localism can be traditional
          sovereignty: 2.5, // Stronger national/local resilience
          ecology: 1.5, // Stronger eco benefit
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -2.5, // Stronger decentralization
          state_intervention_scope: 1.0,
          societal_focus: -1.0,
          rural_priority: 2.5, // Stronger rural focus
          governance_approach: 1.5, // Stronger populist/community
        },
      },
      {
        text: "Strengthen National Strategic Food Reserves and Diversify International Food Sources",
        value:
          "strengthen_national_food_reserves_diversify_international_sources",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 1, authority: 2, scope: 2
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 1.0, // Mix of national (reserves) and international (diversify sources)
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 2.5, // Stronger centralized reserves
          state_intervention_scope: 2.5, // Stronger state role
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Reduce Regulations on Small Food Producers and Processors to Encourage Local Sourcing and Innovation",
        value:
          "reduce_regulations_small_food_producers_processors_local_sourcing",
        ideologyEffect: {
          // Original: econ: 2, sovereignty: 1, liberty: 1, authority: -1, scope: -2, rural: 1
          economic: 2.5, // Stronger L-F for small producers
          social_traditionalism: 0,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Stronger deregulation
          societal_focus: 1.5,
          rural_priority: 1.5, // Stronger rural small producer benefit
          governance_approach: 0.5, // Pro-small business can be populist
        },
      },
      {
        text: "Promote Investment in Agricultural Technology (AgriTech) to Increase Domestic Production Efficiency",
        value: "promote_agritech_investment_domestic_production_efficiency",
        ideologyEffect: {
          // Original: econ: 1, sovereignty: 1, eco: -1, digital: 2
          economic: 1.5,
          social_traditionalism: 0,
          sovereignty: 1.0,
          ecology: -1.5, // AgriTech efficiency often has eco trade-offs
          theocratic: 0,
          digitalization: 2.5, // Stronger pro-tech in ag
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.5, // Promotion can involve state
          societal_focus: 0.5,
          rural_priority: 0.0, // Can be large scale, not specifically rural smallholder
          governance_approach: -0.5, // Technocratic efficiency
        },
      },
    ],
  },
  {
    id: "rural_economic_diversification_development",
    category: "Agriculture & Rural Development",
    questionText:
      "What strategies should be prioritized for rural economic development and diversification?",
    options: [
      {
        text: "Invest Heavily in Rural Infrastructure (Broadband, Healthcare, Education, Transportation)",
        value:
          "invest_rural_infrastructure_broadband_healthcare_education_transport",
        ideologyEffect: {
          // Original: econ: -2, digital: 2, scope: 2, societal: -2, rural: 3
          economic: -2.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.5,
          theocratic: 0,
          digitalization: 2.5, // Stronger broadband focus
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state investment
          societal_focus: -2.5,
          rural_priority: 3.5, // Stronger rural focus
          governance_approach: 0,
        },
      },
      {
        text: "Provide Tax Incentives, Grants, and Deregulation to Attract Diverse Businesses to Rural Areas",
        value: "tax_incentives_grants_deregulation_attract_rural_businesses",
        ideologyEffect: {
          // Original: econ: 3, eco: -1, liberty: 1, scope: -2, societal: 2, rural: 2
          economic: 3.5, // Stronger L-F for rural
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: -1.5,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Stronger deregulation
          societal_focus: 2.0,
          rural_priority: 2.5, // Stronger market-based rural push
          governance_approach: 0,
        },
      },
      {
        text: "Support Diversification into New Rural Economies (e.g., Eco-Tourism, Renewable Energy, Remote Work Hubs, Value-Added Agriculture)",
        value:
          "support_rural_economic_diversification_tourism_renewables_remote_work",
        ideologyEffect: {
          // Original: social_trad: -1, eco: 2, digital: 1, scope: 1, rural: 2
          economic: 0.0,
          social_traditionalism: -1.5, // More progressive diversification
          sovereignty: 0,
          ecology: 2.5, // Stronger eco focus
          theocratic: 0,
          digitalization: 1.5, // Stronger remote work/tech focus
          personal_liberty: 0,
          authority_structure: -1.0,
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 2.5,
          governance_approach: 0.5, // Support for new economies can be seen as proactive/populist
        },
      },
      {
        text: "Strengthen Support for Rural Small Businesses, Cooperatives, and Entrepreneurship Training Programs",
        value:
          "strengthen_support_rural_small_businesses_cooperatives_entrepreneurship",
        ideologyEffect: {
          // Original: econ: -1, authority: -2, scope: 1, societal: -1, rural: 3, governance: 1
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -2.5, // Stronger decentralization/small biz focus
          state_intervention_scope: 1.5,
          societal_focus: -1.5,
          rural_priority: 3.5, // Stronger rural small biz support
          governance_approach: 1.5,
        },
      },
    ],
  },
  {
    id: "government_use_open_source_software",
    category: "Technology & Innovation",
    questionText:
      "Should the government prioritize the use and development of open-source software in its systems and services?",
    options: [
      {
        text: "Yes, Mandate or Strongly Prefer Open-Source Software for Most Government Systems to Enhance Transparency, Security, and Reduce Costs",
        value:
          "mandate_prefer_open_source_software_government_systems_transparency_security",
        ideologyEffect: {
          // Original: econ: -1, digital: 2, authority: -1, scope: 1, societal: -1, governance: 2
          economic: -1.5, // Cost reduction, but mandate is intervention
          social_traditionalism: -1.0, // Transparency/openness often progressive
          sovereignty: 0.5, // Can reduce reliance on foreign proprietary vendors
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 2.5, // Strong pro-OSS digital stance
          personal_liberty: 0.5, // Transparency
          authority_structure: -1.5, // Less reliance on single vendors, more community/decentralized aspects
          state_intervention_scope: 1.5, // Mandate is state intervention
          societal_focus: -1.0, // Public good (transparency, cost)
          rural_priority: 0.0,
          governance_approach: 2.5, // Strong populist (transparency, anti-vendor lock-in)
        },
      },
      {
        text: "Encourage Open-Source Adoption Where It Is Cost-Effective, Secure, and Meets Performance Requirements, Alongside Proprietary Solutions",
        value:
          "encourage_open_source_adoption_cost_effective_secure_performance",
        ideologyEffect: {
          // Original: digital: 1, governance: 0.5
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0, // Moderate pro-OSS
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.0, // Encouragement, not mandate
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0, // Pragmatic
        },
      },
      {
        text: "Prioritize the Best-Available Software Solutions, Regardless of Whether They Are Proprietary or Open-Source, Based on Merit",
        value:
          "prioritize_best_available_software_proprietary_or_open_source_merit",
        ideologyEffect: {
          // Original: econ: 1, digital: 1, governance: -1
          economic: 1.0, // Market/merit driven
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: -0.5, // Less state preference
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -1.5, // More elitist/technocratic "best solution"
        },
      },
      {
        text: "Focus on Supporting the Domestic Software Industry, Including Both Proprietary and Open-Source Developers, through Procurement Policies",
        value:
          "support_domestic_software_industry_proprietary_open_source_procurement",
        ideologyEffect: {
          // Original: sovereignty: 2, econ: 0, digital: 1, scope: 1
          economic: 0.5, // Protectionist lean can be interventionist
          social_traditionalism: 0.0,
          sovereignty: 2.5, // Stronger national industry focus
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 1.5, // Procurement is state action
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "solitary_confinement_prison_practice",
    category: "Criminal Justice",
    questionText:
      "What is your stance on the use of solitary confinement (prolonged isolation) in prisons and detention centers?",
    options: [
      {
        text: "Severely Restrict or Ban Solitary Confinement, Especially for Youth, Mentally Ill, or as Long-Term Punishment",
        value:
          "restrict_ban_solitary_confinement_vulnerable_populations_long_term",
        ideologyEffect: {
          // Original: social_trad: -3, liberty: 3, authority: -2, scope: -1
          economic: 0,
          social_traditionalism: -3.5, // Strong progressive/humanitarian
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 3.5, // Max protection for prisoners from this
          authority_structure: -2.5, // Strong limits on prison authority
          state_intervention_scope: -1.5, // State restricting its own punitive tools
          societal_focus: -1.5, // Focus on humane treatment
          rural_priority: 0,
          governance_approach: 0.5, // Reformist
        },
      },
      {
        text: "Use Solitary Confinement Only as a Temporary, Last Resort Measure for Extreme Safety Risks, with Strict Oversight and Regular Reviews",
        value:
          "solitary_confinement_temporary_last_resort_safety_risks_oversight_reviews",
        ideologyEffect: {
          // Remains moderate
          economic: 0,
          social_traditionalism: -0.5, // Cautious reform
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.0, // Balanced approach
          authority_structure: 0.5, // Oversight maintains some authority
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: -0.5, // Institutional oversight
        },
      },
      {
        text: "Solitary Confinement is a Necessary Tool for Maintaining Prison Safety, Order, and Discipline When Used Appropriately",
        value:
          "solitary_confinement_necessary_tool_prison_safety_order_discipline",
        ideologyEffect: {
          // Original: social_trad: 2, liberty: -3, authority: 3, scope: 1, societal: 1
          economic: 0,
          social_traditionalism: 2.5, // Traditional punitive/order focus
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -3.5, // Strong order > choice
          authority_structure: 3.5, // Max prison authority on this
          state_intervention_scope: 1.0, // State sanctioning this tool
          societal_focus: 1.5, // Focus on order/safety
          rural_priority: 0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Invest in Developing and Implementing Safe and Effective Alternatives to Solitary Confinement for Managing Difficult Inmate Populations",
        value:
          "invest_alternatives_solitary_confinement_managing_difficult_inmates",
        ideologyEffect: {
          // Original: econ: -1, social_trad: -1, liberty: 1, authority: -1, societal: -1
          economic: -1.5,
          social_traditionalism: -1.5, // Progressive, reform-oriented
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Research/new methods
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: 0.5, // Investment is state action
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "restorative_justice_criminal_system_role",
    category: "Criminal Justice",
    questionText:
      "Should restorative justice programs (focusing on repairing harm and reconciling victims, offenders, and communities) be expanded within the criminal justice system?",
    options: [
      {
        text: "Yes, Widely Implement and Fund Restorative Justice Programs as an Alternative or Supplement to Punitive Measures for Many Offenses",
        value: "widely_implement_fund_restorative_justice_alternative_punitive",
        ideologyEffect: {
          // Original: social_trad: -2, authority: -2, societal: -2, econ: -1, governance: 1
          economic: -1.0,
          social_traditionalism: -2.5, // Strong progressive justice
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0, // Less punitive focus
          authority_structure: -2.5, // Decentralized, community involvement
          state_intervention_scope: -0.5, // Shift from punitive state
          societal_focus: -2.5, // Strong focus on community repair
          rural_priority: 0,
          governance_approach: 1.5, // Can be populist/community-driven
        },
      },
      {
        text: "Support Pilot Programs and Gradual Expansion of Restorative Justice for Specific Offenses and Offender Types, with Careful Evaluation",
        value:
          "support_pilot_programs_gradual_expansion_restorative_justice_evaluation",
        ideologyEffect: {
          // Original: social_trad: -1, authority: -1, societal: -1
          economic: -0.5,
          social_traditionalism: -1.5, // Cautiously progressive
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: -1.0,
          state_intervention_scope: 0.0,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5, // Cautious, evidence-based
        },
      },
      {
        text: "Restorative Justice May Be Appropriate in Minor Cases, but Traditional Punitive Justice Must Remain Primary for Most Crimes",
        value:
          "restorative_justice_minor_cases_punitive_justice_primary_most_crimes",
        ideologyEffect: {
          // Original: social_trad: 1, authority: 1, societal: 1
          economic: 0,
          social_traditionalism: 1.5, // Leans traditional punitive
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5,
          authority_structure: 1.5, // Upholds state punitive power
          state_intervention_scope: 0.5,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Skeptical of Broad Application; Restorative Justice May Undermine Deterrence and Retribution Aims of the Justice System",
        value: "skeptical_restorative_justice_undermine_deterrence_retribution",
        ideologyEffect: {
          // Original: social_trad: 2, authority: 2, societal: 2, governance: -1
          economic: 0.5,
          social_traditionalism: 2.5, // Strongly traditional view of justice
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0,
          authority_structure: 2.5, // Max emphasis on state's punitive role
          state_intervention_scope: 1.0,
          societal_focus: 2.5, // Strong focus on deterrence/retribution
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "public_transportation_investment_urban_rural",
    category: "Infrastructure",
    questionText:
      "How should public transportation systems (e.g., buses, trains, subways) be funded and expanded?",
    options: [
      {
        text: "Massively Increase Public Investment in Expanding and Modernizing Public Transportation in Urban and Rural Areas, Making it More Affordable and Accessible",
        value:
          "massive_public_investment_expand_modernize_public_transport_affordable",
        ideologyEffect: {
          // Original: econ: -3, eco: 2, scope: 3, societal: -2, rural: 2
          economic: -3.5, // Max public investment
          social_traditionalism: -1.0, // Public good emphasis
          sovereignty: 0,
          ecology: 2.5, // Stronger eco benefit
          theocratic: 0,
          digitalization: 1.5, // Modernizing
          personal_liberty: -1.0, // Taxes
          authority_structure: 1.5,
          state_intervention_scope: 3.8, // Max state role
          societal_focus: -2.5, // Strong collective benefit
          rural_priority: 2.0, // Explicitly mentions rural
          governance_approach: 0,
        },
      },
      {
        text: "Focus Public Transportation Investment on Major Urban Centers and High-Density Corridors where Demand is Highest",
        value:
          "focus_public_transport_investment_urban_centers_high_density_corridors",
        ideologyEffect: {
          // Original: econ: -1, eco: 1, scope: 1, rural: -2
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 1.0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5,
          societal_focus: 0.0, // Pragmatic
          rural_priority: -2.5, // Stronger urban-centric focus
          governance_approach: -0.5, // Efficiency/demand based planning
        },
      },
      {
        text: "Encourage Public-Private Partnerships and Market-Based Solutions for Public Transportation, with Government Subsidies for Essential Services",
        value:
          "ppp_market_solutions_public_transport_subsidies_essential_services",
        ideologyEffect: {
          // Original: econ: 2, authority: -1, scope: 0, societal: 1
          economic: 2.5, // Stronger market-based
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: -1.0,
          state_intervention_scope: -0.5, // State facilitates, not provides directly
          societal_focus: 1.0,
          rural_priority: -0.5, // Market solutions may neglect rural
          governance_approach: 0,
        },
      },
      {
        text: "Prioritize Road Infrastructure and Individual Vehicle Use; Public Transport Should be Self-Sustaining or Locally Funded",
        value:
          "prioritize_road_infra_individual_vehicles_public_transport_self_sustaining",
        ideologyEffect: {
          // Original: econ: 3, eco: -2, liberty: 1, scope: -2, societal: 2
          economic: 3.5, // Strong L-F for public transport
          social_traditionalism: 0.5, // Individual vehicle culture can be traditional
          sovereignty: 0,
          ecology: -2.5, // Stronger negative eco
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: 0,
          state_intervention_scope: -2.5, // Stronger anti-public transport funding
          societal_focus: 2.5, // Stronger individual vehicle focus
          rural_priority: 0.5, // Road infra benefits rural, but PT locally funded bad for rural
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "water_infrastructure_safety_modernization",
    category: "Infrastructure",
    questionText:
      "How should the safety and modernization of national water infrastructure (e.g., pipes, treatment plants, dams) be addressed?",
    options: [
      {
        text: "Launch a Major National Program to Repair, Replace, and Modernize Aging Water Infrastructure, Ensuring Safe Drinking Water for All",
        value:
          "major_national_program_repair_modernize_water_infra_safe_drinking_water",
        ideologyEffect: {
          // Original: econ: -2, eco: 1, digital: 1, authority: 2, scope: 3, societal: -2
          economic: -2.5,
          social_traditionalism: -0.5,
          sovereignty: 0.5, // National program
          ecology: 1.5,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: -1.0, // Taxes
          authority_structure: 2.0,
          state_intervention_scope: 3.5, // Max state role
          societal_focus: -2.5, // Stronger collective good
          rural_priority: 0.5, // Safe water for all includes rural
          governance_approach: -1.0,
        },
      },
      {
        text: "Implement Stricter Regulations and Enforcement for Water Quality Standards and Infrastructure Maintenance",
        value:
          "stricter_regulations_enforcement_water_quality_infra_maintenance",
        ideologyEffect: {
          // Original: eco: 2, liberty: -1, authority: 2, scope: 2, societal: -1
          economic: -1.0, // Cost of regulation
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 2.5, // Stronger eco via regulation
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.5, // Stricter regulations on users/providers
          authority_structure: 2.5, // Stronger enforcement power
          state_intervention_scope: 2.5, // Strong state regulation
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Provide Grants and Loans to Regional/Local Governments for Water Infrastructure Upgrades, with Shared Responsibility",
        value:
          "grants_loans_regional_local_water_infra_upgrades_shared_responsibility",
        ideologyEffect: {
          // Original: econ: -1, authority: -1, scope: 1
          economic: -1.0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.8,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0,
          authority_structure: -1.5, // Decentralized approach with national support
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 1.0, // Local govts include rural
          governance_approach: 0,
        },
      },
      {
        text: "Encourage Private Sector Investment and Management of Water Infrastructure through Concessions and Utility Reforms",
        value:
          "encourage_private_investment_management_water_infra_concessions_reforms",
        ideologyEffect: {
          // Original: econ: 3, eco: -1, liberty: 1, authority: -2, scope: -2, societal: 2
          economic: 3.5, // Strong L-F
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: -1.5, // Privatization might risk eco standards for profit
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 1.5,
          authority_structure: -2.5, // Strong shift to private
          state_intervention_scope: -2.5, // Strong anti-state provision
          societal_focus: 2.5,
          rural_priority: -1.0, // Private sector may neglect unprofitable rural
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "offshore_resource_extraction_policy",
    category: "Energy Policy",
    questionText:
      "What is your stance on offshore drilling and resource extraction (e.g., oil, gas, minerals) in national waters?",
    options: [
      {
        text: "Expand Offshore Drilling and Resource Extraction to Maximize Domestic Energy/Resource Production and Economic Benefits",
        value:
          "expand_offshore_drilling_resource_extraction_maximize_domestic_production",
        ideologyEffect: {
          // Original: econ: 2, sovereignty: 2, eco: -3, scope: 1
          economic: 2.5, // Stronger pro-extraction for economy
          social_traditionalism: 1.0, // Traditional industry support
          sovereignty: 2.5, // Stronger domestic production focus
          ecology: -3.8, // Max development focus
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.0,
          state_intervention_scope: 1.5, // State permitting/encouraging
          societal_focus: 1.5,
          rural_priority: 0.5, // Coastal/resource areas
          governance_approach: 0,
        },
      },
      {
        text: "Allow Offshore Extraction with Strict Environmental Regulations, Safety Standards, and Revenue Sharing for Coastal Communities",
        value:
          "allow_offshore_extraction_strict_environmental_regulations_safety_revenue_sharing",
        ideologyEffect: {
          // Original: econ: 1, sovereignty: 0.5, eco: -1, scope: 1, societal: -0.5
          economic: 1.0,
          social_traditionalism: 0,
          sovereignty: 0.5,
          ecology: -0.5, // "Strict" regs slightly better than pure expansion but still allows extraction
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // Regulation is intervention
          societal_focus: -0.8, // Revenue sharing more collectivist
          rural_priority: 0.8, // Coastal community benefit
          governance_approach: 0,
        },
      },
      {
        text: "Phase Out or Ban New Offshore Drilling and Extraction, Prioritizing Renewable Energy and Ocean Conservation",
        value:
          "phase_out_ban_new_offshore_drilling_extraction_renewables_ocean_conservation",
        ideologyEffect: {
          // Original: econ: -1, eco: 3, scope: 2, societal: -1
          economic: -1.5,
          social_traditionalism: -1.0, // Progressive environmentalism
          sovereignty: 0,
          ecology: 3.8, // Max eco protection
          theocratic: 0,
          digitalization: 0.5, // Renewables
          personal_liberty: -0.5, // Restrictions on industry
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Strong state ban/phase-out
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Focus Offshore Development on Renewable Energy Sources like Wind and Tidal Power, Not Fossil Fuels or Minerals",
        value:
          "focus_offshore_development_renewable_energy_wind_tidal_not_fossil_fuels",
        ideologyEffect: {
          // Original: eco: 2.5, digital: 1, scope: 1
          economic: -0.5, // Investment in renewables
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 3.0, // Strong eco focus
          theocratic: 0,
          digitalization: 1.5, // Renewable tech
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // State directing development
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "energy_grid_decentralization_resilience",
    category: "Energy Policy",
    questionText:
      "How should the national energy grid be modernized for resilience, reliability, and integration of renewables?",
    options: [
      {
        text: "Invest Heavily in a National Smart Grid, High-Voltage Transmission Lines, and Large-Scale Energy Storage to Support Renewables and Reliability",
        value:
          "invest_national_smart_grid_transmission_storage_renewables_reliability",
        ideologyEffect: {
          // Original: econ: -2, eco: 2, digital: 3, authority: 2, scope: 2
          economic: -2.5,
          social_traditionalism: -0.5,
          sovereignty: 0.5, // National grid
          ecology: 2.0,
          theocratic: 0,
          digitalization: 3.5, // Max smart grid tech
          personal_liberty: -0.5,
          authority_structure: 2.5, // Stronger central planning
          state_intervention_scope: 2.5, // Stronger state investment
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -1.5, // Technocratic/institutional project
        },
      },
      {
        text: "Promote Decentralized Energy Systems, Microgrids, and Local Renewable Generation to Enhance Community Resilience and Reduce Transmission Losses",
        value:
          "promote_decentralized_energy_microgrids_local_renewables_community_resilience",
        ideologyEffect: {
          // Original: econ: -1, eco: 3, authority: -3, societal: -1, rural: 1, governance: 1
          economic: -1.0,
          social_traditionalism: -1.0, // Progressive community models
          sovereignty: -0.5,
          ecology: 3.5, // Max local/renewable eco
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 1.0,
          authority_structure: -3.5, // Max decentralization
          state_intervention_scope: 0.5, // State promotes
          societal_focus: -1.5, // Stronger community focus
          rural_priority: 1.5,
          governance_approach: 1.5,
        },
      },
      {
        text: "Focus on Market-Based Reforms and Private Investment to Drive Grid Modernization, with Regulatory Oversight for Reliability Standards",
        value:
          "market_based_reforms_private_investment_grid_modernization_reliability_oversight",
        ideologyEffect: {
          // Original: econ: 3, liberty: 1, authority: -1, scope: -1, digital: 1
          economic: 3.5, // Strong L-F
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: -0.5, // Market might not prioritize greenest options
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -1.5, // Light oversight
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Prioritize Hardening Existing Grid Infrastructure Against Physical and Cyber Threats, Ensuring Baseload Power Stability",
        value:
          "prioritize_hardening_existing_grid_infra_threats_baseload_stability",
        ideologyEffect: {
          // Original: econ: 0.5, sovereignty: 1, eco: -1, digital: 1, authority: 1, scope: 1
          economic: 0.8,
          social_traditionalism: 1.0, // Focus on stability/security of existing
          sovereignty: 1.5, // National security
          ecology: -1.0, // Baseload often implies non-renewable continuation
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: -0.5,
          authority_structure: 1.5,
          state_intervention_scope: 1.5,
          societal_focus: 0.5, // Security focus
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "automation_impact_labor_force_policy",
    category: "Labor & Employment",
    questionText:
      "How should the government address the impact of automation and AI on the labor force and job displacement?",
    options: [
      {
        text: "Invest Heavily in Worker Retraining Programs, Lifelong Learning Initiatives, and Support for Transitioning to New Industries",
        value:
          "invest_worker_retraining_lifelong_learning_transition_support_automation",
        ideologyEffect: {
          // Original: econ: -1, digital: 1, scope: 1, societal: -2
          economic: -1.5,
          social_traditionalism: -1.0, // Progressive approach to labor changes
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5, // Skills for digital economy
          personal_liberty: 0.5, // Empowering workers
          authority_structure: 0,
          state_intervention_scope: 1.5, // State providing programs
          societal_focus: -2.5, // Stronger collective support for workers
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Implement Policies like Universal Basic Income (UBI) or a Stronger Social Safety Net to Cushion the Impact of Job Displacement",
        value: "ubi_stronger_social_safety_net_automation_job_displacement",
        ideologyEffect: {
          // Original: econ: -3, liberty: 1, authority: 1, scope: 3, societal: -3
          economic: -3.5, // Major redistribution
          social_traditionalism: -2.0, // Significant social reform
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5, // Freedom from job necessity
          authority_structure: 1.0,
          state_intervention_scope: 3.8, // Max state welfare program
          societal_focus: -3.8, // Max collectivist support
          rural_priority: 0,
          governance_approach: 0.5, // Can be populist
        },
      },
      {
        text: "Promote Innovation and Adoption of Automation/AI to Boost Productivity and Economic Growth, Allowing Market Forces to Manage Labor Adjustments",
        value:
          "promote_automation_ai_innovation_productivity_market_forces_labor_adjustments",
        ideologyEffect: {
          // Original: econ: 2, digital: 3, scope: -2, societal: 2
          economic: 2.5, // Strong L-F on labor adjustment
          social_traditionalism: 0.5, // Pro-growth, market efficiency
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 3.5, // Max pro-automation
          personal_liberty: 1.0, // Business freedom
          authority_structure: -0.5,
          state_intervention_scope: -2.5, // Strong minimal intervention in labor
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Consider Policies to Slow Automation in Certain Sectors or Tax Automation to Fund Worker Support Programs",
        value: "slow_automation_tax_automation_fund_worker_support_programs",
        ideologyEffect: {
          // Original: econ: -2, digital: -2, authority: 1, scope: 2, societal: -1
          economic: -2.5, // Strong intervention/taxation
          social_traditionalism: 0.0, // Luddite-ish or protective
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -2.5, // Strong anti-automation stance
          personal_liberty: -1.0, // Restrictions on business/tech adoption
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Strong state intervention
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "work_life_balance_right_to_disconnect",
    category: "Labor & Employment",
    questionText:
      "Should the government legislate a 'right to disconnect' or other measures to promote work-life balance in the digital age?",
    options: [
      {
        text: "Yes, Legislate a 'Right to Disconnect' to Protect Workers from 'Always-On' Culture and Promote Mental Health",
        value: "legislate_right_to_disconnect_protect_workers_mental_health",
        ideologyEffect: {
          // Original: liberty: 1, authority: 1, scope: 2, societal: -2
          economic: -1.0, // Regulation on business
          social_traditionalism: -1.5, // Progressive worker protection
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -0.5, // Addressing negative side of digital work
          personal_liberty: 1.5, // Worker liberty from employer demands
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Strong state mandate
          societal_focus: -2.5, // Strong collective worker well-being
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Encourage Employers to Adopt Flexible Work Arrangements and Promote Work-Life Balance through Guidelines and Incentives, Not Mandates",
        value:
          "encourage_flexible_work_guidelines_incentives_work_life_balance",
        ideologyEffect: {
          // Original: econ: 1, liberty: 1, authority: -1, scope: -1
          economic: 1.0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Flexible work often tech-enabled
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -1.0, // Non-mandate
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "No, Government Intervention in Work Hours and Communication is Overreach; Leave it to Employer-Employee Agreements",
        value:
          "no_government_intervention_work_hours_communication_employer_employee_agreements",
        ideologyEffect: {
          // Original: econ: 2, liberty: 2, authority: -1, scope: -3, societal: 2
          economic: 2.5, // Strong L-F for labor
          social_traditionalism: 1.0, // Traditional employer prerogative
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Employer/individual contract freedom
          authority_structure: -1.5,
          state_intervention_scope: -3.5, // Max anti-intervention
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Support Stronger Unionization to Allow Workers to Collectively Bargain for Better Work-Life Balance Protections",
        value:
          "support_unionization_collective_bargain_work_life_balance_protections",
        ideologyEffect: {
          // Original: econ: -1, authority: -1, societal: -1, governance: 1
          economic: -1.5, // Pro-union is collectivist
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5, // Worker power
          authority_structure: -1.0, // Union power as counter to state/corp
          state_intervention_scope: 0.5, // State enabling unions
          societal_focus: -1.5, // Collective bargaining
          rural_priority: 0,
          governance_approach: 1.5,
        },
      },
    ],
  },
  {
    id: "skilled_migration_economic_needs_policy",
    category: "Immigration",
    questionText:
      "What should be the national policy on attracting skilled migrants to meet economic needs?",
    options: [
      {
        text: "Implement a Points-Based System Prioritizing Highly Skilled Migrants in Demand Sectors, with Clear Pathways to Permanent Residency",
        value:
          "points_based_system_skilled_migration_demand_sectors_permanent_residency",
        ideologyEffect: {
          // Original: econ: 1, digital: 1, authority: 0.5, scope: 1, societal: 0.5, governance: -1
          economic: 1.5, // Utilitarian, benefits economy
          social_traditionalism: 0.0,
          sovereignty: 0.5, // Managed intake, national control
          ecology: 0,
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: 0.0,
          authority_structure: 1.0, // State managing system
          state_intervention_scope: 1.5,
          societal_focus: 0.8,
          rural_priority: 0,
          governance_approach: -1.5, // Technocratic/planned immigration
        },
      },
      {
        text: "Expand Employer-Sponsored Visa Programs for Skilled Workers, Streamlining Application Processes",
        value:
          "expand_employer_sponsored_visas_skilled_workers_streamline_processes",
        ideologyEffect: {
          // Original: econ: 2, sovereignty: -1, societal: 1
          economic: 2.5, // Market/employer driven
          social_traditionalism: 0,
          sovereignty: -1.0, // More open to employer needs
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: -0.5, // Streamlining can mean less red tape
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Offer Open Visas or Fast-Track Immigration for Individuals with Exceptional Talent in Science, Technology, Arts, etc.",
        value:
          "open_visas_fast_track_immigration_exceptional_talent_science_tech_arts",
        ideologyEffect: {
          // Original: econ: 1, social_trad: -1, sovereignty: -2, digital: 1
          economic: 1.0,
          social_traditionalism: -1.5, // Progressive, talent-focused
          sovereignty: -2.5, // More internationalist for talent
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -0.5,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: 0.5, // Can be seen as meritocratic but also less bureaucratic
        },
      },
      {
        text: "Prioritize Training and Upskilling Domestic Workforce; Restrict Skilled Migration to Protect Local Jobs and Wages",
        value:
          "prioritize_domestic_workforce_training_restrict_skilled_migration_protect_local_jobs",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 2, scope: 1, societal: -1
          economic: -1.5, // Protectionist labor policy
          social_traditionalism: 1.0, // "Our workers first" can be traditional
          sovereignty: 2.5, // Strong national preference
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5, // Limits employer choice, migrant opportunity
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // State restricting migration / funding training
          societal_focus: -1.0, // Focus on domestic collective
          rural_priority: 0,
          governance_approach: 1.0, // Can be populist
        },
      },
    ],
  },
  {
    id: "predatory_lending_consumer_finance_regulation",
    category: "Consumer Protection",
    questionText:
      "How should predatory lending practices (e.g., payday loans, high-interest credit) be regulated?",
    options: [
      {
        text: "Implement Strict Caps on Interest Rates and Fees for All Consumer Loans; Ban Predatory Products",
        value:
          "strict_caps_interest_rates_fees_consumer_loans_ban_predatory_products",
        ideologyEffect: {
          // Original: econ: -2, liberty: -1, authority: 1, scope: 3, societal: -2
          economic: -2.5, // Strong intervention in credit markets
          social_traditionalism: -1.0, // Progressive consumer protection
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.5, // Strong limits on lender freedom
          authority_structure: 1.5,
          state_intervention_scope: 3.5, // Max state regulation
          societal_focus: -2.5, // Strong collective protection of vulnerable
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Strengthen Consumer Protection Agency Oversight and Enforcement against Deceptive and Unfair Lending Practices",
        value:
          "strengthen_consumer_protection_agency_oversight_lending_practices",
        ideologyEffect: {
          // Original: econ: -1, scope: 2, societal: -1, authority: 1
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5,
          authority_structure: 1.5, // Stronger agency power
          state_intervention_scope: 2.0,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Financial Literacy Education and Promoting Access to Mainstream Banking Services for Underserved Populations",
        value:
          "financial_literacy_education_mainstream_banking_access_underserved",
        ideologyEffect: {
          // Original: societal: -1, governance: 1
          economic: -0.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Access to banking can be digital
          personal_liberty: 0.5, // Empowerment through education
          authority_structure: 0,
          state_intervention_scope: 0.5, // State promoting education/access
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Allow Market to Determine Interest Rates with Transparency Requirements, Ensuring Consumer Choice and Access to Credit",
        value:
          "market_determine_interest_rates_transparency_consumer_choice_credit_access",
        ideologyEffect: {
          // Original: econ: 3, liberty: 2, scope: -2, societal: 2
          economic: 3.5, // Strong L-F
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Strong consumer/lender freedom
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Minimal state role except transparency
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "consumer_data_privacy_online_rights",
    category: "Consumer Protection",
    questionText:
      "What rights should consumers have regarding their personal data collected by companies online?",
    options: [
      {
        text: "Grant Consumers Strong Rights: Right to Access, Correct, Delete Data, and Opt-Out of Sale/Sharing (GDPR-style)",
        value: "strong_consumer_data_rights_access_delete_opt_out_gdpr_style",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: -1, liberty: 3, scope: 2, societal: -1
          economic: -1.5, // Stronger impact on businesses
          social_traditionalism: -1.0, // Progressive consumer rights
          sovereignty: -1.0, // GDPR-style implies international standards
          ecology: 0,
          theocratic: 0,
          digitalization: 0, // Regulating digital data use
          personal_liberty: 3.8, // Max consumer data rights
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state enforcement
          societal_focus: -1.5, // Stronger collective protection for consumers
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Require Companies to Provide Clear, Concise Privacy Policies and Obtain Explicit Consent for Data Collection and Use",
        value:
          "companies_clear_privacy_policies_explicit_consent_data_collection",
        ideologyEffect: {
          // Original: liberty: 1, scope: 1
          economic: 0.0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5, // Clearer enhancement of consumer awareness
          authority_structure: 0.5,
          state_intervention_scope: 1.0, // State requiring policies
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Encourage Industry Self-Regulation and Development of Privacy-Enhancing Technologies, with Minimal Government Mandates",
        value:
          "industry_self_regulation_privacy_enhancing_tech_minimal_government_mandates",
        ideologyEffect: {
          // Original: econ: 1, digital: 1, scope: -2, societal: 1, authority: -1
          economic: 1.5, // Clearer pro-industry autonomy
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: 0.5, // Relies on industry goodwill
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Stronger anti-mandate stance
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Establish a National Data Protection Authority with Powers to Investigate and Fine Companies for Privacy Violations",
        value:
          "national_data_protection_authority_investigate_fine_privacy_violations",
        ideologyEffect: {
          // Original: econ: -1, liberty: 1, authority: 2, scope: 2, societal: -1
          economic: -1.0,
          social_traditionalism: -0.5,
          sovereignty: 0.5, // National authority
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5, // Enforcement protects rights
          authority_structure: 2.5, // Stronger central DPA
          state_intervention_scope: 2.5, // Stronger enforcement body
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -1.5, // Institutional enforcement
        },
      },
    ],
  },
  {
    id: "animal_welfare_industrial_agriculture",
    category: "Social Issues",
    questionText:
      "What is your stance on animal welfare regulations in industrial agriculture (factory farming)?",
    options: [
      {
        text: "Implement Strict National Standards for Animal Welfare in Industrial Farming, Phasing Out Practices like Extreme Confinement",
        value:
          "strict_national_standards_animal_welfare_industrial_farming_phase_out_confinement",
        ideologyEffect: {
          // Original: social_trad: -2, eco: 2, scope: 2, authority: 1
          economic: -1.5, // Costs to producers
          social_traditionalism: -2.5, // Strong progressive animal rights
          sovereignty: 0,
          ecology: 2.5, // Stronger eco/welfare link
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // Restrictions on farming practices
          authority_structure: 1.5,
          state_intervention_scope: 2.8, // Stronger state standards
          societal_focus: -1.5,
          rural_priority: -0.5, // Can impact rural ag
          governance_approach: 0,
        },
      },
      {
        text: "Encourage Voluntary Industry Codes of Conduct and Consumer-Driven Demand for Higher Welfare Products",
        value:
          "voluntary_industry_codes_consumer_demand_higher_animal_welfare_products",
        ideologyEffect: {
          // Original: econ: 1, eco: 0.5, scope: -2, societal: 1, governance: 1
          economic: 1.0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.8,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: -1.0,
          state_intervention_scope: -2.5, // Stronger anti-mandate
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 1.5,
        },
      },
      {
        text: "Focus on Food Safety and Efficiency in Agriculture; Animal Welfare Standards Should Not Unduly Burden Producers",
        value:
          "focus_food_safety_efficiency_animal_welfare_not_burden_producers",
        ideologyEffect: {
          // Original: econ: 2, social_trad: 1, eco: -2, scope: -1, societal: 1
          economic: 2.5, // Stronger pro-producer/efficiency
          social_traditionalism: 1.0,
          sovereignty: 0,
          ecology: -2.5, // Stronger de-prioritization of welfare for efficiency
          theocratic: 0,
          digitalization: 0.5, // Efficiency via tech
          personal_liberty: 1.0, // Producer freedom
          authority_structure: -0.5,
          state_intervention_scope: -1.5,
          societal_focus: 1.5,
          rural_priority: 0.5,
          governance_approach: 0,
        },
      },
      {
        text: "Provide Subsidies or Incentives for Farmers Transitioning to Higher Animal Welfare Farming Systems",
        value:
          "subsidies_incentives_farmers_transitioning_higher_animal_welfare_systems",
        ideologyEffect: {
          // Original: econ: -2, social_trad: -1, eco: 1.5, scope: 1
          economic: -2.5, // Stronger collectivist support
          social_traditionalism: -1.5,
          sovereignty: 0,
          ecology: 2.0, // Clearer eco/welfare positive
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 1.5,
          societal_focus: -1.0,
          rural_priority: 0.5,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "judicial_appointment_selection_process",
    category: "Governance & Electoral Reform",
    questionText:
      "What criteria should be prioritized in the appointment and selection process for judges, especially for higher courts?",
    options: [
      {
        text: "Prioritize Judicial Philosophy and Ideological Alignment with the Appointing Government/Party",
        value:
          "prioritize_judicial_philosophy_ideological_alignment_appointments",
        ideologyEffect: {
          // Original: social_trad: 1, authority: 2, governance: -2
          economic: 0,
          social_traditionalism: 1.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0.5, // Ideology can be theocratic
          digitalization: 0,
          personal_liberty: -1.0, // Judiciary reflecting party line reduces checks
          authority_structure: 2.5, // Strengthens appointing government's power
          state_intervention_scope: 0.5,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: -2.8, // Strong elitist/partisan institutionalism
        },
      },
      {
        text: "Focus on Merit, Experience, Temperament, and Demonstrated Commitment to Impartial Application of Law",
        value:
          "focus_merit_experience_temperament_impartial_law_application_appointments",
        ideologyEffect: {
          // Remains neutral/idealistic
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
          governance_approach: -1.0, // Institutional ideal
        },
      },
      {
        text: "Increase Diversity (Gender, Ethnicity, Background) on the Bench to Ensure Courts Reflect Society",
        value:
          "increase_diversity_gender_ethnicity_background_bench_appointments",
        ideologyEffect: {
          // Original: social_trad: -2, societal: -1, governance: 2
          economic: 0,
          social_traditionalism: -2.5, // Strong progressive focus on diversity
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -0.5,
          state_intervention_scope: 0,
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 2.5, // Strong populist "reflect society"
        },
      },
      {
        text: "Implement a Non-Partisan or Bipartisan Commission System for Nominating and Vetting Judicial Candidates",
        value:
          "non_partisan_bipartisan_commission_nominating_vetting_judicial_candidates",
        ideologyEffect: {
          // Original: authority: -1
          economic: 0,
          social_traditionalism: -0.5, // Reformist
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -1.5, // Reduces direct political appointment power
          state_intervention_scope: 0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: -1.5, // Institutional reform for neutrality
        },
      },
    ],
  },
  {
    id: "government_surveillance_privacy_security_balance",
    category: "Technology & Innovation",
    questionText:
      "How should the government balance national security needs with citizens' rights to privacy regarding surveillance technologies?",
    options: [
      {
        text: "Expand Government Surveillance Powers and Use of Advanced Technologies to Counter Terrorism and Serious Crime, with Judicial Oversight",
        value:
          "expand_surveillance_powers_advanced_tech_counter_terrorism_crime_judicial_oversight",
        ideologyEffect: {
          // Original: sovereignty: 1, digital: 2, liberty: -3, authority: 2, scope: 2
          economic: 0,
          social_traditionalism: 1.0, // Order focus
          sovereignty: 1.5,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.5,
          personal_liberty: -3.5, // Max pro-surveillance state power
          authority_structure: 2.5, // Stronger state power
          state_intervention_scope: 2.5,
          societal_focus: 1.5, // Security over liberty
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Implement Strict Limits on Government Surveillance, Require Warrants for All Data Collection, and Ban Mass Surveillance",
        value:
          "strict_limits_surveillance_warrants_data_collection_ban_mass_surveillance",
        ideologyEffect: {
          // Original: digital: -1, liberty: 4, authority: -2, scope: -2, societal: -1
          economic: 0,
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -1.0,
          personal_liberty: 4.0, // Max privacy protection
          authority_structure: -2.5, // Strong limits on state
          state_intervention_scope: -2.5,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Increase Transparency and Public Accountability for All Government Surveillance Programs and Data Use",
        value:
          "increase_transparency_public_accountability_government_surveillance_programs",
        ideologyEffect: {
          // Original: liberty: 1, authority: -1, governance: 2
          economic: 0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Tech for transparency
          personal_liberty: 1.5,
          authority_structure: -1.5, // Stronger accountability
          state_intervention_scope: 0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 2.5, // Strong populist transparency
        },
      },
      {
        text: "Focus on Targeted Surveillance of Suspected Individuals Based on Specific Evidence, Not Broad Data Sweeps",
        value:
          "targeted_surveillance_suspected_individuals_specific_evidence_not_broad_sweeps",
        ideologyEffect: {
          // Original: liberty: 1, authority: -1
          economic: 0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.8, // Clearer protection than mass sweeps
          authority_structure: -1.0,
          state_intervention_scope: 0.5, // State still conducts targeted surveillance
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "forensic_science_criminal_justice_standards",
    category: "Criminal Justice",
    questionText:
      "How can the reliability and ethical use of forensic science in the criminal justice system be ensured?",
    options: [
      {
        text: "Establish National Standards for Forensic Disciplines, Mandatory Accreditation for Labs, and Certification for Practitioners",
        value:
          "national_standards_forensic_accreditation_labs_certification_practitioners",
        ideologyEffect: {
          // Original: authority: 2, scope: 1, governance: -1
          economic: 0,
          social_traditionalism: 0.5, // Pro-standards, order
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Standards for digital forensics too
          personal_liberty: -0.5, // Can be bureaucratic
          authority_structure: 2.5, // Stronger national standards
          state_intervention_scope: 1.5,
          societal_focus: -0.5, // Justice system integrity
          rural_priority: 0,
          governance_approach: -1.5, // Strong institutional/expert driven
        },
      },
      {
        text: "Increase Funding for Forensic Science Research to Validate Techniques and Reduce Error Rates",
        value:
          "increase_funding_forensic_science_research_validate_techniques_reduce_errors",
        ideologyEffect: {
          // Original: econ: -1, digital: 1, scope: 1
          economic: -1.0,
          social_traditionalism: -0.5, // Pro-science, reform
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 0.5, // Better science protects rights
          authority_structure: 0,
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Ensure Defense Teams Have Equal Access to Quality Forensic Expertise and Testing Resources",
        value:
          "ensure_defense_equal_access_forensic_expertise_testing_resources",
        ideologyEffect: {
          // Original: econ: -1, liberty: 1, societal: -2, governance: 1
          economic: -1.5,
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.8, // Stronger fairness for defense
          authority_structure: -0.5,
          state_intervention_scope: 0.5, // State ensuring access
          societal_focus: -2.5, // Stronger focus on equality of arms
          rural_priority: 0,
          governance_approach: 1.5,
        },
      },
      {
        text: "Limit Admissibility of Forensic Evidence from Disciplines Lacking Strong Scientific Validation",
        value:
          "limit_admissibility_forensic_evidence_lacking_scientific_validation",
        ideologyEffect: {
          // Original: social_trad: -1, liberty: 1
          economic: 0,
          social_traditionalism: -1.5, // Skeptical of unproven methods
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -0.5, // Might impact some digital forensics if unvalidated
          personal_liberty: 1.5, // Protects against wrongful conviction
          authority_structure: -0.5, // Judicial gatekeeping
          state_intervention_scope: 0,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "national_disaster_preparedness_relief_funding",
    category: "Disaster Preparedness & Relief",
    questionText:
      "How should the national government approach disaster preparedness, relief, and long-term recovery funding?",
    options: [
      {
        text: "Increase National Investment in Climate Resilience, Pre-Disaster Mitigation, and Robust Rapid Response Capabilities",
        value:
          "increase_national_investment_climate_resilience_mitigation_rapid_response",
        ideologyEffect: {
          // Original: econ: -2, eco: 2, scope: 2, authority: 1
          economic: -2.5, // Stronger public investment
          social_traditionalism: -1.0, // Proactive, preventative
          sovereignty: 0.5, // National capability
          ecology: 2.8, // Stronger climate resilience focus
          theocratic: 0,
          digitalization: 1.0, // Tech for mitigation/response
          personal_liberty: -0.5, // Tax implications
          authority_structure: 1.5, // Stronger national program
          state_intervention_scope: 2.5, // Stronger state role
          societal_focus: -2.0, // Collective security
          rural_priority: 0.5, // Disasters affect rural too
          governance_approach: -1.0, // Institutional/expert-led
        },
      },
      {
        text: "Focus on Providing Timely and Adequate Financial Aid to Affected Individuals, Businesses, and Communities for Recovery",
        value:
          "timely_adequate_financial_aid_disaster_recovery_individuals_businesses_communities",
        ideologyEffect: {
          // Original: econ: -2, scope: 1, societal: -2
          economic: -2.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // Clearer state role in aid
          societal_focus: -2.8, // Stronger collectivist aid
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Emphasize Individual and Community Responsibility for Preparedness; Government Role Primarily for Catastrophic Events and Coordination",
        value:
          "individual_community_responsibility_preparedness_government_role_catastrophic_events",
        ideologyEffect: {
          // Original: econ: 1, liberty: 1, authority: -1, scope: -2, societal: 3
          economic: 1.5,
          social_traditionalism: 1.0, // Self-reliance
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -0.5, // Less state tech investment in this area
          personal_liberty: 1.5,
          authority_structure: -1.5,
          state_intervention_scope: -2.8, // Stronger minimal state role
          societal_focus: 3.5, // Max individual/community responsibility
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Reform Disaster Relief Funding to Reduce Bureaucracy, Ensure Equitable Distribution, and Discourage Risky Development in Hazard-Prone Areas",
        value:
          "reform_disaster_relief_funding_reduce_bureaucracy_equitable_distribution_discourage_risky_dev",
        ideologyEffect: {
          // Original: eco: 1, societal: -1, governance: 1
          economic: 0.5, // Bureaucracy reduction can be +econ
          social_traditionalism: -0.5, // Reformist
          sovereignty: 0,
          ecology: 1.5, // Stronger anti-risky dev stance
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.5, // Reforming, not necessarily expanding/shrinking overall scope much
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 1.5, // Stronger populist (anti-bureaucracy)
        },
      },
    ],
  },
  {
    id: "indigenous_peoples_rights_land_claims", // Processing the first instance
    category: "Social Issues",
    questionText:
      "What is the government's responsibility regarding the rights, land claims, and cultural preservation of Indigenous peoples?",
    options: [
      {
        text: "Fully Recognize and Implement Treaty Obligations, Settle Outstanding Land Claims Equitably, and Support Indigenous Self-Governance",
        value:
          "recognize_treaty_obligations_settle_land_claims_support_indigenous_self_governance",
        ideologyEffect: {
          // Original: econ: -1, social_trad: -3, sovereignty: -1, eco: 1, authority: -3, scope: 1, societal: -2, governance: 1
          economic: -1.5, // Land settlements/support costs
          social_traditionalism: -3.8, // Max progressive recognition
          sovereignty: -1.5, // Recognizing indigenous sovereignty aspects
          ecology: 1.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0, // For indigenous groups
          authority_structure: -3.8, // Max indigenous self-governance (decentralization from national)
          state_intervention_scope: 1.0, // State acts to implement
          societal_focus: -2.5, // Strong collectivist (group rights)
          rural_priority: 0.5, // Indigenous lands often rural
          governance_approach: 1.5,
        },
      },
      {
        text: "Invest in Programs to Improve Socioeconomic Outcomes for Indigenous Communities (e.g., Health, Education, Infrastructure)",
        value:
          "invest_programs_improve_socioeconomic_outcomes_indigenous_communities",
        ideologyEffect: {
          // Original: econ: -2, social_trad: -1, authority: 0.5, scope: 2, societal: -2
          economic: -2.5,
          social_traditionalism: -1.5, // Progressive support
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0,
          authority_structure: 0.8,
          state_intervention_scope: 2.5, // Stronger state programs
          societal_focus: -2.0,
          rural_priority: 0.0,
          governance_approach: 0,
        },
      },
      {
        text: "Promote Reconciliation and Cultural Preservation through Education and Dialogue, but Resist Calls for Significant Land Restitution or Special Rights",
        value:
          "reconciliation_cultural_preservation_education_dialogue_resist_land_restitution",
        ideologyEffect: {
          // Original: econ: 0.5, social_trad: 0, sovereignty: 1
          economic: 0.5,
          social_traditionalism: 1.0, // More traditional (resisting land claims)
          sovereignty: 1.5, // Stronger emphasis on existing national sovereignty
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.0, // Less material intervention
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: -0.5, // Can be seen as maintaining status quo
        },
      },
      {
        text: "Assimilationist Approach: Encourage Integration of Indigenous Peoples into Mainstream Society, Minimizing Separate Legal Status or Claims",
        value:
          "assimilationist_approach_integration_indigenous_peoples_mainstream_society",
        ideologyEffect: {
          // Original: social_trad: 3, sovereignty: 2, authority: 1, scope: 1, societal: 2
          economic: 0,
          social_traditionalism: 3.8, // Max traditional assimilationist
          sovereignty: 2.5, // Strong assertion of singular national identity
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // Against self-determination
          authority_structure: 1.5,
          state_intervention_scope: 1.5, // State encouraging integration
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "genetic_engineering_bioethics_regulation",
    category: "Technology & Innovation",
    questionText:
      "How should genetic engineering technologies (e.g., CRISPR) in humans, agriculture, and environment be regulated?",
    options: [
      {
        text: "Implement Strict Regulations and Ethical Oversight for All Genetic Engineering, Banning Certain Applications (e.g., Human Germline Editing for Enhancement)",
        value:
          "strict_regulations_ethical_oversight_genetic_engineering_ban_certain_applications",
        ideologyEffect: {
          // Original: social_trad: 1, digital: -1, liberty: -2, authority: 2, scope: 3
          economic: -1.0,
          social_traditionalism: 1.8, // Stronger ethical/traditional caution
          sovereignty: 0,
          ecology: 1.0, // Precautionary principle
          theocratic: 1.0, // Stronger alignment with religious/moral objections
          digitalization: -1.5, // Stronger restriction on tech
          personal_liberty: -2.8, // Stronger limits on scientific/personal freedom
          authority_structure: 2.5,
          state_intervention_scope: 3.5, // Max state regulation/bans
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Encourage Research and Development in Genetic Engineering for Medical Breakthroughs and Agricultural Improvement, with Case-by-Case Risk Assessment",
        value:
          "encourage_research_development_genetic_engineering_medical_agricultural_risk_assessment",
        ideologyEffect: {
          // Original: econ: 1, digital: 2, eco: -0.5
          economic: 1.0,
          social_traditionalism: -0.5, // Pro-progress with caution
          sovereignty: 0,
          ecology: -0.5,
          theocratic: 0,
          digitalization: 2.5, // Stronger pro-R&D
          personal_liberty: 0.5,
          authority_structure: 0.5, // For risk assessment
          state_intervention_scope: 0.8, // State manages risk assessment
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Promote Public Dialogue and International Cooperation to Establish Global Norms and Ethical Guidelines for Genetic Engineering",
        value:
          "public_dialogue_international_cooperation_global_norms_genetic_engineering",
        ideologyEffect: {
          // Original: sovereignty: -2, authority: -1, governance: -1
          economic: 0,
          social_traditionalism: -1.0, // Progressive, inclusive dialogue
          sovereignty: -2.5, // Stronger internationalism
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -1.0,
          state_intervention_scope: -0.5, // Less national control, more intl. norms
          societal_focus: -1.0, // Global ethical consensus
          rural_priority: 0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Adopt a Permissive Regulatory Approach to Foster Rapid Innovation in Genetic Engineering, Trusting Scientists and Market Forces",
        value:
          "permissive_regulatory_approach_genetic_engineering_rapid_innovation_scientists_market",
        ideologyEffect: {
          // Original: econ: 2, social_trad: -1, digital: 3, liberty: 2, authority: -1.5, scope: -3, eco: -1
          economic: 2.5, // Stronger L-F
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: -1.5,
          theocratic: -0.5, // Anti-religious obstruction of science
          digitalization: 3.8, // Max pro-innovation
          personal_liberty: 2.5, // Max freedom for scientists/market
          authority_structure: -2.0,
          state_intervention_scope: -3.8, // Max minimal state
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "news_media_objectivity_disinformation_policy",
    category: "Social Issues",
    questionText:
      "What role, if any, should the government play in ensuring media objectivity or combating disinformation in news media?",
    options: [
      {
        text: "Implement Regulations to Combat Disinformation and Promote Media Pluralism and Objectivity, Potentially through an Independent Regulator",
        value:
          "regulations_combat_disinformation_promote_media_pluralism_objectivity_regulator",
        ideologyEffect: {
          // Original: liberty: -2, authority: 2, scope: 2, societal: -1
          economic: -0.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.5, // Stronger restrictions on media
          authority_structure: 2.5, // Stronger regulatory power
          state_intervention_scope: 2.5, // Stronger state regulation
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Support Independent Fact-Checking Organizations and Media Literacy Programs to Empower Citizens to Identify Disinformation",
        value:
          "support_independent_fact_checking_media_literacy_programs_citizens",
        ideologyEffect: {
          // Original: liberty: 1, authority: -1, scope: -1, digital: 1, governance: 2
          economic: -0.5, // Funding for orgs/programs
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -0.5, // Indirect support
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 2.5, // Stronger citizen empowerment/populist
        },
      },
      {
        text: "Government Should Not Interfere with News Media Content; Uphold Absolute Freedom of the Press, Even if it Allows for Disinformation",
        value:
          "no_government_interference_news_media_absolute_freedom_of_press",
        ideologyEffect: {
          // Original: liberty: 4, authority: -2, scope: -3
          economic: 0,
          social_traditionalism: 0.5, // Can be traditional free press view
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 4.0, // Max press freedom
          authority_structure: -2.5,
          state_intervention_scope: -3.8, // Max anti-interference
          societal_focus: 1.0, // Individual right of press
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Strengthen Public Service Broadcasting with a Mandate for Impartial and High-Quality News as a Counterweight to Partisan Media",
        value:
          "strengthen_public_service_broadcasting_impartial_news_counterweight_partisan_media",
        ideologyEffect: {
          // Original: econ: -1, authority: 0.5, scope: 1, societal: -1
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.8,
          state_intervention_scope: 1.5, // Clearer state role in public broadcasting
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "urban_planning_sustainable_cities_policy",
    category: "Infrastructure",
    questionText:
      "How should urban planning be approached to create more sustainable, livable, and equitable cities?",
    options: [
      {
        text: "Prioritize Mixed-Use Development, Public Transportation, Green Spaces, and Affordable Housing through Strong National and Local Planning Regulations",
        value:
          "prioritize_mixed_use_dev_public_transport_green_spaces_affordable_housing_planning_regs",
        ideologyEffect: {
          // Original: econ: -1, eco: 2, scope: 2, authority: 1, societal: -2, rural: -1
          economic: -1.5,
          social_traditionalism: -1.0, // Progressive urban planning
          sovereignty: 0,
          ecology: 2.5, // Stronger eco urbanism
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: -0.5,
          authority_structure: 1.5, // Stronger planning regulations
          state_intervention_scope: 2.5,
          societal_focus: -2.8, // Stronger equity/livability
          rural_priority: -1.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Market-Driven Urban Development, Reducing Zoning Restrictions and Allowing Density to Increase Naturally with Demand",
        value:
          "market_driven_urban_dev_reduce_zoning_restrictions_density_demand",
        ideologyEffect: {
          // Original: econ: 3, eco: -1, liberty: 1, authority: -2, scope: -2, rural: -1
          economic: 3.5, // Max L-F urban dev
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: -1.5, // Stronger potential negative eco
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -2.5, // Stronger anti-planning control
          state_intervention_scope: -2.8, // Stronger deregulation
          societal_focus: 1.5,
          rural_priority: -1.0,
          governance_approach: 0,
        },
      },
      {
        text: "Invest in Smart City Technologies to Optimize Resource Use, Traffic Management, and Public Services in Urban Areas",
        value:
          "invest_smart_city_technologies_optimize_resource_use_traffic_public_services",
        ideologyEffect: {
          // Original: econ: 0.5, eco: 1, digital: 3, authority: 0.5, scope: 1, governance: -1
          economic: 0.8,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 1.5,
          theocratic: 0,
          digitalization: 3.8, // Max smart city tech
          personal_liberty: -0.5, // Surveillance potential
          authority_structure: 1.0, // Centralized tech systems
          state_intervention_scope: 1.5,
          societal_focus: 0.0,
          rural_priority: -1.0,
          governance_approach: -1.5, // Technocratic solution
        },
      },
      {
        text: "Empower Local Communities and Neighborhoods in Urban Planning Decisions to Ensure Development Reflects Their Needs and Character",
        value:
          "empower_local_communities_neighborhoods_urban_planning_decisions_reflect_needs",
        ideologyEffect: {
          // Original: authority: -3, scope: -1, societal: -1, eco: 0.5, governance: 3
          economic: 0,
          social_traditionalism: 0.5, // Local character can be traditional
          sovereignty: 0,
          ecology: 0.8,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -3.8, // Max decentralization to community
          state_intervention_scope: -1.5,
          societal_focus: -1.0,
          rural_priority: -1.0,
          governance_approach: 3.5, // Max populist/direct will
        },
      },
    ],
  },
  {
    id: "cultural_heritage_repatriation_artifacts",
    category: "Arts & Culture",
    questionText:
      "What is the nation's responsibility regarding the repatriation of cultural artifacts to their countries or communities of origin?",
    options: [
      {
        text: "Proactively Review Collections and Repatriate Artifacts Acquired Under Colonial Rule or Illicitly, Following International Norms",
        value:
          "proactively_review_repatriate_artifacts_colonial_rule_illicitly_international_norms",
        ideologyEffect: {
          // Original: social_trad: -2, sovereignty: -2, societal: -1, governance: -1
          economic: 0,
          social_traditionalism: -2.8, // Stronger progressive/decolonial stance
          sovereignty: -2.5, // Stronger internationalist approach
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -0.5,
          state_intervention_scope: 0.5, // State action to repatriate
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Consider Repatriation Requests on a Case-by-Case Basis, Balancing Historical Claims with the Role of National Museums as Global Heritage Stewards",
        value:
          "repatriation_case_by_case_balance_historical_claims_museums_global_stewards",
        ideologyEffect: {
          // Remains moderate/balanced
          economic: 0,
          social_traditionalism: 0,
          sovereignty: -0.5, // Slight internationalism (global stewards)
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
      {
        text: "Resist Most Repatriation Claims; Artifacts in National Museums are Part of a Shared Global Heritage and Accessible to a Wider Audience",
        value:
          "resist_repatriation_claims_artifacts_shared_global_heritage_wider_audience",
        ideologyEffect: {
          // Original: social_trad: 2, sovereignty: 2, societal: 1, authority: 0.5
          economic: 0,
          social_traditionalism: 2.5, // Strong traditional museum view
          sovereignty: 2.5, // Strong nationalist "keep our stuff"
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.8,
          state_intervention_scope: 0.0,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: -1.5, // Institutional defense of collections
        },
      },
      {
        text: "Focus on Digital Repatriation (e.g., 3D Scans) and Long-Term Loans or Cultural Exchange Programs Rather Than Physical Return of All Artifacts",
        value:
          "digital_repatriation_long_term_loans_cultural_exchange_not_physical_return_all_artifacts",
        ideologyEffect: {
          // Original: digital: 2
          economic: 0,
          social_traditionalism: 0.5, // Compromise, leans slightly traditional by keeping items
          sovereignty: 0.5,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.5, // Stronger digital solution focus
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "religious_freedom_societal_laws",
    category: "Social Issues", // Or Civil Liberties, as appropriate
    questionText:
      "How should religious freedom be balanced with societal laws and norms?",
    options: [
      {
        text: "Broad Protections for Religious Practice, Allowing Exemptions from Some General Laws",
        value: "broad_religious_exemptions_from_laws",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.0, // Strong alignment with traditional religious values
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 2.5, // Significantly boosts theocratic score
          digitalization: 0.0,
          personal_liberty: -1.0, // Exemptions can limit others' liberties
          authority_structure: 1.0, // Upholds religious institutional authority in some spheres
          state_intervention_scope: 0.5, // State actively creates/upholds exemptions
          societal_focus: -1.5, // Prioritizes religious community norms over universal application of law
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Religious Freedom Protects Belief, but Not Actions that Harm or Discriminate Against Others",
        value: "religious_freedom_no_harm_discrimination_others",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.5, // Limits traditional religious claims if they cause harm
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -2.0, // Significantly limits theocratic overreach
          digitalization: 0.0,
          personal_liberty: 2.0, // Protects individuals from religiously motivated harm
          authority_structure: -0.5,
          state_intervention_scope: 0.8, // State enforces non-discrimination
          societal_focus: 0.8, // Balances religious freedom with broader societal protection
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Balance Religious Freedom with Non-Discrimination Principles and Public Health/Safety",
        value: "balance_religious_freedom_non_discrimination_public_health",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -0.8, // Moderate progressive/secular
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: 0.8,
          authority_structure: 0.0,
          state_intervention_scope: 0.5, // State mediates the balance
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Maintain Strict Separation of Religious Institutions and State; No Special Exemptions",
        value: "strict_separation_religion_state_no_exemptions",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -3.5, // Strong secular progressive
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -4.0, // Max secularism
          digitalization: 0.0,
          personal_liberty: 2.8, // Freedom from religious imposition on individuals
          authority_structure: -1.5,
          state_intervention_scope: 0.0, // State doesn't create religious carve-outs
          societal_focus: 1.5, // Individual rights/universal laws over group religious claims
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "freedom_of_expression_online_content",
    category: "Social Issues", // Or Civil Liberties
    questionText:
      "What limits, if any, should be placed on freedom of expression, particularly concerning online hate speech or misinformation?",
    options: [
      {
        text: "Uphold Broad Protections for Free Expression, Even if Offensive; Oppose Government Censorship or Hate Speech Laws",
        value:
          "broad_free_expression_protections_oppose_censorship_hate_speech_laws",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5, // Platforms are digital
          personal_liberty: 4.0,
          authority_structure: -3.0,
          state_intervention_scope: -3.8,
          societal_focus: 2.5,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Allow Regulation of Speech that Directly Incites Violence, Defamation, or Illegal Activities",
        value:
          "regulate_speech_inciting_violence_defamation_illegal_activities",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5, // Order-focused
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.8, // Clearer limit on liberty
          authority_structure: 1.8, // Clearer state authority
          state_intervention_scope: 2.0, // Clearer state role
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Hold Online Platforms Accountable for Proliferation of Harmful Content, Disinformation, and Hate Speech through Regulation",
        value:
          "hold_online_platforms_accountable_harmful_content_disinformation_regulation",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.0, // Progressive aim to curb harm
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -1.0, // Regulation of digital platforms
          personal_liberty: -3.0, // Stronger impact on platform/user speech freedom
          authority_structure: 2.0,
          state_intervention_scope: 3.0, // Stronger state regulation
          societal_focus: -2.5,
          rural_priority: 0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Focus on Media Literacy Education, Fact-Checking Initiatives, and Counter-Speech to Combat Disinformation and Hate Speech",
        value:
          "media_literacy_fact_checking_counter_speech_disinformation_hate",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.8, // Stronger emphasis on digital literacy/tools
          personal_liberty: 1.5, // Empowering individuals, less coercive
          authority_structure: -1.0,
          state_intervention_scope: -1.0,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 1.8, // Stronger populist/direct will via education
        },
      },
    ],
  },
  {
    id: "drug_policy_recreational_substances", // Assuming this is the ID you use
    category: "Criminal Justice & Health",
    questionText:
      "What is the national policy regarding recreational drug use (e.g., cannabis, psychedelics)?",
    options: [
      {
        text: "Legalize and Regulate Most Recreational Drugs for Adult Use, Taxing Sales",
        value: "legalize_regulate_most_drugs_tax",
        ideologyEffect: {
          economic: 1.0, // Tax revenue, new market
          social_traditionalism: -3.8, // Highly progressive
          sovereignty: 0,
          ecology: 0,
          theocratic: -1.5, // Secular, anti-moralistic prohibition
          digitalization: 0,
          personal_liberty: 4.0, // Max personal autonomy
          authority_structure: -1.5, // Reduced state punitive power
          state_intervention_scope: -2.0, // Shift from prohibition to regulation
          societal_focus: 1.5, // Individual choice
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Decriminalize Possession of Small Amounts of All Drugs; Focus on Harm Reduction and Treatment",
        value: "decriminalize_all_drugs_harm_reduction_treatment",
        ideologyEffect: {
          economic: -1.0, // Cost of treatment
          social_traditionalism: -3.0, // Very progressive
          sovereignty: 0,
          ecology: 0,
          theocratic: -1.0,
          digitalization: 0,
          personal_liberty: 3.0,
          authority_structure: -2.5, // Significantly reduced state punitive power
          state_intervention_scope: -1.5, // Shift focus of state intervention
          societal_focus: -1.5, // Collective health approach
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Maintain National Prohibition of Cannabis and Other Recreational Drugs, with Strict Enforcement",
        value: "maintain_national_prohibition_cannabis_drugs",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 3.8, // Highly traditional moral stance
          sovereignty: 0,
          ecology: 0,
          theocratic: 2.0, // Often aligns with moral/religious objections
          digitalization: 0,
          personal_liberty: -3.8, // Max restriction on personal choice
          authority_structure: 2.5, // Strong state enforcement
          state_intervention_scope: 3.0, // Strong state prohibition
          societal_focus: 1.0, // Focus on perceived societal order
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Allow Regional Governments to Decide on Decriminalization or Legalization of Cannabis and Other Substances",
        value: "regional_decide_drug_decriminalization_legalization",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5, // Allows for regional traditionalism
          sovereignty: 1.0, // Regional autonomy
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5, // Liberty becomes regionally variable
          authority_structure: -3.0, // Highly decentralized on this issue
          state_intervention_scope: -2.0, // Less central state control
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "sex_industry_decriminalization_regulation",
    category: "Social Issues",
    questionText:
      "What is your stance on the decriminalization or regulation of the sex industry?",
    options: [
      {
        text: "Fully Decriminalize Consensual Sex Work to Improve Safety, Health, and Rights for Sex Workers",
        value: "fully_decriminalize_consensual_sex_work_safety_rights",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: -3.8, // Highly progressive
          sovereignty: 0,
          ecology: 0,
          theocratic: -2.8,
          digitalization: 0,
          personal_liberty: 4.0, // Max personal autonomy
          authority_structure: -3.0,
          state_intervention_scope: -3.0, // Removing criminalization is reduced intervention
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Maintain Criminalization of Most Aspects of Sex Work but Focus on Prosecuting Traffickers and Exploiters, Not Consenting Adult Workers",
        value:
          "maintain_criminalization_focus_traffickers_exploiters_not_workers",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 1.8, // Clearly traditional by maintaining criminalization
          sovereignty: 0,
          ecology: 0,
          theocratic: 1.0,
          digitalization: 0,
          personal_liberty: -1.8, // Still criminalized for many
          authority_structure: 1.5,
          state_intervention_scope: 1.5,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Oppose Decriminalization; View All Forms of Sex Work as Inherently Exploitative and Harmful",
        value:
          "oppose_decriminalization_sex_work_inherently_exploitative_harmful",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 3.8, // Max traditional moral stance
          sovereignty: 0,
          ecology: 0,
          theocratic: 2.8,
          digitalization: 0,
          personal_liberty: -3.8, // Max denial of autonomy in this area
          authority_structure: 2.5,
          state_intervention_scope: 2.8, // Strong state prohibition
          societal_focus: -2.5, // Paternalistic collectivism
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Support the 'Nordic Model' (Criminalize Buyers of Sex and Third-Party Profiteers, Decriminalize Sellers, Offer Exit Services)",
        value:
          "support_nordic_model_sex_work_criminalize_buyers_decriminalize_sellers",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: 0.8, // Aims to reduce sex work (traditional goal) with some progressive elements
          sovereignty: 0,
          ecology: 0,
          theocratic: 0.0,
          digitalization: 0,
          personal_liberty: -0.8, // Mixed: restricts buyers significantly
          authority_structure: 1.5,
          state_intervention_scope: 1.8, // Active state role
          societal_focus: -1.8, // Clearer collectivist aim
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "law_enforcement_accountability_reform",
    category: "Criminal Justice",
    questionText:
      "What is your approach to law enforcement reform and accountability?",
    options: [
      {
        text: "Reform Legal Protections for Officers, Establish National Misconduct Registry, Enhance Civilian Oversight",
        value: "reform_officer_protections_misconduct_registry_oversight",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -3.0, // Strong progressive reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.8, // Registry is a digital tool
          personal_liberty: 3.5, // Protecting citizens from state overreach
          authority_structure: -3.0, // Strong civilian oversight, checks on state actors
          state_intervention_scope: -1.0, // Aims to limit arbitrary state power, but sets up new oversight
          societal_focus: -1.0, // Fairness focus
          rural_priority: 0.0,
          governance_approach: 1.0, // Can be populist (people overseeing police)
        },
      },
      {
        text: "Increase Funding for De-escalation Training, Body Cameras, and Community Policing Initiatives",
        value: "funding_deescalation_body_cameras_community_policing",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.5, // Moderately reformist
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.5, // Body cameras and modern training tech
          personal_liberty: 0.8,
          authority_structure: -1.0, // Community policing implies some decentralization/softening of authority
          state_intervention_scope: 1.0, // State funding these initiatives
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support Law Enforcement Personnel and Institutions; Oppose Measures Perceived to Hinder Effective Policing",
        value: "support_law_enforcement_oppose_hindrance_policing",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: 3.8, // Strongly traditional law & order
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -3.0, // Prioritizes state power/order over individual challenges
          authority_structure: 3.5, // Max support for existing police structures
          state_intervention_scope: 0.5, // Supporting existing state function
          societal_focus: 1.5, // "Law and order" as a primary societal good
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Invest in Social Programs to Address Root Causes of Crime, Reducing Need for Police Intervention",
        value:
          "invest_social_programs_root_causes_crime_reduce_police_intervention",
        ideologyEffect: {
          economic: -3.5,
          social_traditionalism: -3.0, // Progressive, focus on societal solutions
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5, // Less punitive state focus
          authority_structure: -2.0, // Shift away from purely police-based authority
          state_intervention_scope: 2.0, // More state intervention in social programs
          societal_focus: -3.0, // Strong collectivist approach to crime
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "unionization_worker_rights", // From Amplification Batch 2
    category: "Labor & Employment",
    questionText:
      "What is your stance on labor unions and collective bargaining rights?",
    options: [
      {
        text: "Strengthen Legal Protections for Unions and Collective Bargaining Across All Sectors",
        value: "strengthen_protections_collective_bargaining_unions",
        ideologyEffect: {
          economic: -2.8, // Strong pro-union
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // Can limit individual contract freedom for non-union members/employers
          authority_structure: -1.0, // Union power as counter-balance
          state_intervention_scope: 2.0, // State enforces protections
          societal_focus: -2.8, // Strong collectivist worker power
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Maintain Current Labor Laws, Balancing Rights of Unions and Employers",
        value: "maintain_current_labor_laws_balance_unions_employers",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support 'Right-to-Work' Style Laws and Limit Compulsory Union Membership/Dues",
        value: "support_right_to_work_style_laws_limit_union_power",
        ideologyEffect: {
          economic: 2.5, // Strong anti-union/pro-market
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.0, // Individual worker freedom from unions
          authority_structure: -0.5,
          state_intervention_scope: -1.5, // State limiting union power
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Mandate Worker Representation on Corporate Boards (Co-determination)",
        value: "mandate_worker_representation_boards_codetermination",
        ideologyEffect: {
          economic: -3.0,
          social_traditionalism: -1.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0,
          authority_structure: 0.0, // Shifts power within corporations
          state_intervention_scope: 2.5, // Strong state mandate
          societal_focus: -3.0,
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "cybersecurity_national_strategy", // From Amplification Batch 2
    category: "Technology & Innovation",
    questionText:
      "How should the nation approach cybersecurity and cyber warfare?",
    options: [
      {
        text: "Invest Heavily in Offensive and Defensive Cyber Capabilities as a National Priority",
        value: "invest_offensive_defensive_cyber_priority",
        ideologyEffect: {
          economic: -1.0, // Significant state spending
          social_traditionalism: 1.0,
          sovereignty: 2.8, // Strong national capability
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 3.0, // Max cyber focus
          personal_liberty: -2.5, // Surveillance implications
          authority_structure: 2.5, // Strong central command
          state_intervention_scope: 2.8, // Strong state direction
          societal_focus: 1.0, // National security
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Prioritize International Cooperation and Establish Global Norms for Cyberspace",
        value: "international_cooperation_global_cyber_norms",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: -3.8, // Max international cooperation
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.8,
          authority_structure: -1.5,
          state_intervention_scope: -0.5,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.8, // Strong institutionalism
        },
      },
      {
        text: "Focus on Protecting Critical National Infrastructure from Cyber Attacks",
        value: "protect_critical_infra_cyber_attacks",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: 0.5,
          sovereignty: 1.8, // Stronger national protection focus
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: -1.0,
          authority_structure: 1.5,
          state_intervention_scope: 1.8,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Promote Public-Private Partnerships for Enhanced National Cybersecurity",
        value: "public_private_partnerships_cybersecurity",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: 0.0,
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.0,
          authority_structure: -1.0,
          state_intervention_scope: -0.5,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "gender_identity_legal_recognition", // From Amplification Batch 3
    category: "Social Issues",
    questionText:
      "What is your stance on legal recognition of gender identity?",
    options: [
      {
        text: "Full Legal Recognition of Gender Identity; Allow Self-Identification for Official Documents",
        value: "full_legal_gender_id_self_identification",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -4.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.5,
          digitalization: 0.0,
          personal_liberty: 4.0,
          authority_structure: -2.5,
          state_intervention_scope: -2.0,
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Recognize Gender Identity with Some Medical or Administrative Requirements",
        value: "gender_id_recognition_medical_administrative_reqs",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0, // More moderate, gatekeeping
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -0.8, // Hurdles to self-ID
          authority_structure: 1.5, // State/medical authority defining
          state_intervention_scope: 1.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Legal Sex Determined at Birth; Oppose Changes to Gender Markers on Official Documents",
        value: "legal_sex_at_birth_oppose_gender_marker_changes",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 4.0, // Max traditional
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 2.0,
          digitalization: 0.0,
          personal_liberty: -4.0, // Max denial of self-ID
          authority_structure: 2.5,
          state_intervention_scope: 2.8,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Focus on Protecting Transgender Individuals from Discrimination, Regardless of Legal Recognition",
        value: "protect_transgender_discrimination_regardless_legal_status",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -2.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.0,
          personal_liberty: 1.8,
          authority_structure: 0.0,
          state_intervention_scope: 1.8, // State enforces anti-discrimination
          societal_focus: -1.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "capital_punishment_policy", // From Amplification Batch 3
    category: "Criminal Justice",
    questionText:
      "What is your stance on capital punishment (the death penalty)?",
    options: [
      {
        text: "Abolish Capital Punishment Nationally and Advocate for its Global Abolition",
        value: "abolish_capital_punishment_nationally_globally",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -4.0, // Max progressive/humanist
          sovereignty: -1.5,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: 3.5,
          authority_structure: -3.0, // Max limit on state power
          state_intervention_scope: -3.8, // Max removal of punitive power
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support Capital Punishment for the Most Heinous Crimes, Ensuring Rigorous Due Process",
        value: "support_capital_punishment_heinous_crimes_due_process",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 2.8, // Strong retributive/traditional
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.8,
          digitalization: 0.0,
          personal_liberty: -3.5, // State has power of life/death
          authority_structure: 2.5, // Strong state authority
          state_intervention_scope: 2.0,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Implement a Moratorium on Executions to Study Fairness, Accuracy, and Effectiveness",
        value: "moratorium_capital_punishment_study_fairness",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0, // Cautious, evidence-based
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0, // Temporary upholding of right to life
          authority_structure: -0.5,
          state_intervention_scope: -0.5, // Suspending state power
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Allow Regional Governments or Jurisdictions to Decide on Capital Punishment",
        value: "regional_decide_capital_punishment",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.5, // Allows regional traditionalism
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: -2.8, // Highly decentralized for this power
          state_intervention_scope: -1.5, // Less central state power
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "lobbying_political_influence_reform",
    category: "Governance & Electoral Reform",
    questionText:
      "What reforms are needed to address lobbying by special interests and its influence on government officials?",
    options: [
      {
        text: "Implement Strict Limits on Lobbying Activities, Ban Gifts, and Enforce Longer 'Cooling-Off' Periods for Former Officials",
        value: "strict_lobbying_limits_ban_gifts_longer_cooling_off_periods",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.0,
          authority_structure: 1.5,
          state_intervention_scope: 2.8,
          societal_focus: -1.8,
          rural_priority: 0,
          governance_approach: 2.8,
        },
      },
      {
        text: "Dramatically Increase Transparency in Lobbying by Requiring Real-Time, Detailed Disclosure of All Lobbyist Contacts and Expenditures",
        value: "increase_transparency_lobbying_real_time_detailed_disclosure",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 0.8,
          authority_structure: 0.5,
          state_intervention_scope: 1.8,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 1.8,
        },
      },
      {
        text: "Lobbying is a Protected Form of Free Speech and Petition; Oppose Further Significant Restrictions",
        value: "lobbying_free_speech_petition_oppose_further_restrictions",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: 1.0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.8,
          authority_structure: -1.5,
          state_intervention_scope: -2.8,
          societal_focus: 2.5,
          rural_priority: 0,
          governance_approach: -2.8,
        },
      },
      {
        text: "Introduce Public Funding for Political Campaigns to Reduce Officials' Reliance on Donations from Lobbied Interests",
        value: "public_funding_campaigns_reduce_reliance_lobbied_interests",
        ideologyEffect: {
          economic: -2.8,
          social_traditionalism: -1.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.8,
          authority_structure: 0.5,
          state_intervention_scope: 2.8,
          societal_focus: -2.8,
          rural_priority: 0,
          governance_approach: 3.8,
        },
      },
    ],
  },
  {
    id: "head_of_state_election_system_reform",
    category: "Governance & Electoral Reform",
    questionText:
      "What is your stance on reforming or maintaining the current system for electing the Head of State/Government (e.g., direct popular vote vs. indirect systems)?",
    options: [
      {
        text: "Move to a System of Direct National Popular Vote for Electing the Head of State/Government",
        value: "direct_national_popular_vote_head_of_state",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -2.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -2.8,
          state_intervention_scope: 0,
          societal_focus: -1.5,
          rural_priority: -1.8,
          governance_approach: 3.8,
        },
      },
      {
        text: "Reform Indirect Election Systems to Make Them More Proportional or Responsive to Popular Vote (if applicable)",
        value: "reform_indirect_election_systems_more_proportional_responsive",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -1.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.8,
          authority_structure: -1.8,
          state_intervention_scope: 0,
          societal_focus: -0.8,
          rural_priority: -0.5,
          governance_approach: 1.8,
        },
      },
      {
        text: "Maintain the Current Established Electoral System for Head of State/Government",
        value: "maintain_current_electoral_system_head_of_state",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 2.8,
          sovereignty: 0.5,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.8,
          state_intervention_scope: 0,
          societal_focus: 0.5,
          rural_priority: 0.5,
          governance_approach: -2.8,
        },
      },
      {
        text: "Strengthen Protections for Regional Representation within the Existing Electoral System",
        value: "strengthen_regional_representation_existing_electoral_system",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 1.8,
          sovereignty: 0.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.8,
          state_intervention_scope: 0,
          societal_focus: 0,
          rural_priority: 1.8,
          governance_approach: -1.8,
        },
      },
    ],
  },
  {
    id: "data_sovereignty_cross_border_data_flows",
    category: "Technology & Innovation",
    questionText:
      "How should the nation approach data sovereignty and the regulation of cross-border data flows?",
    options: [
      {
        text: "Promote Free and Open Cross-Border Data Flows Globally, with Strong Baseline Privacy and Security Protections",
        value: "promote_free_open_cross_border_data_flows_privacy_security",
        ideologyEffect: {
          economic: 2.8,
          social_traditionalism: -0.5,
          sovereignty: -3.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 2.8,
          personal_liberty: 1.8,
          authority_structure: -0.5,
          state_intervention_scope: -1.0,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Implement Data Localization Requirements, Mandating That Citizen Data Be Stored and Processed Within National Borders",
        value:
          "implement_data_localization_requirements_citizen_data_national_borders",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: 0.5,
          sovereignty: 3.8,
          ecology: 0,
          theocratic: 0,
          digitalization: -0.8,
          personal_liberty: -1.8,
          authority_structure: 1.8,
          state_intervention_scope: 2.8,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Negotiate Bilateral and Multilateral Agreements on Data Sharing, Privacy Standards, and Cybersecurity Cooperation",
        value:
          "negotiate_international_agreements_data_sharing_privacy_cybersecurity",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0,
          sovereignty: -1.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: 0.5,
          authority_structure: 0,
          state_intervention_scope: 0.5,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: -2.8,
        },
      },
      {
        text: "Assert Strong National Control over Critical Data Infrastructure and Digital Assets, Limiting Foreign Access and Influence",
        value:
          "national_control_critical_data_infrastructure_digital_assets_limit_foreign",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5,
          sovereignty: 2.8,
          ecology: 0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: -1.8,
          authority_structure: 2.5,
          state_intervention_scope: 2.8,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "infrastructure_investment_funding", // From Amplification Batch 1
    category: "Infrastructure",
    questionText:
      "How should major infrastructure improvements (e.g., transportation, internet, utilities) be funded?",
    options: [
      {
        text: "Large-Scale National Government Investment, Potentially Through Higher Taxes or Deficit Spending",
        value: "large_national_investment_taxes_deficit_infra",
        ideologyEffect: {
          economic: -3.5,
          social_traditionalism: -1.5,
          sovereignty: 0.5,
          ecology: 0.8,
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: -1.5,
          authority_structure: 2.5,
          state_intervention_scope: 3.8,
          societal_focus: -2.8,
          rural_priority: 0.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "Utilize Public-Private Partnerships and User Fees (e.g., Tolls, Usage Charges)",
        value: "public_private_partnerships_user_fees_infra",
        ideologyEffect: {
          economic: 1.8,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: -1.0,
          state_intervention_scope: -0.5,
          societal_focus: 1.0,
          rural_priority: -0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Deregulation to Encourage Private Sector Investment in Infrastructure",
        value: "deregulation_private_investment_infra",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -0.8,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0,
          authority_structure: -2.0,
          state_intervention_scope: -3.5,
          societal_focus: 2.5,
          rural_priority: -1.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Prioritize Maintenance and Modernization of Existing Infrastructure over New Construction",
        value: "prioritize_maintenance_modernization_infra",
        ideologyEffect: {
          economic: 0.5, // Fiscal prudence can be slightly positive
          social_traditionalism: 1.0, // Conservative approach
          sovereignty: 0.0,
          ecology: 1.0, // Often less impactful than new construction
          theocratic: 0.0,
          digitalization: 0.5, // Modernization aspect
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5, // State still responsible for maintenance
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "lgbtq_plus_rights_protections", // From Amplification Batch 1
    category: "Social Issues",
    questionText: "What is your stance on LGBTQ+ rights and protections?",
    options: [
      {
        text: "Enact Comprehensive National Non-Discrimination Protections for LGBTQ+ Individuals",
        value: "national_non_discrimination_lgbtq",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -3.8, // Highly progressive
          sovereignty: -0.5,
          ecology: 0.0,
          theocratic: -2.5, // Opposes theocratic restrictions
          digitalization: 0.0,
          personal_liberty: 3.5, // Protects personal freedoms
          authority_structure: 0.8, // National law implies central authority
          state_intervention_scope: 2.0, // State actively enforces
          societal_focus: -2.0, // Collective responsibility for equality
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support Same-Sex Marriage/Civil Unions but Allow Religious Exemptions for Individuals/Organizations",
        value: "ssm_civil_unions_religious_exemptions_lgbtq",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0, // Compromise
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 1.5, // Allows stronger religious exemptions
          digitalization: 0.0,
          personal_liberty: 0.0, // Mixed effects
          authority_structure: -0.5,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Define Marriage as Between One Man and One Woman; Limit Expansion of LGBTQ+ Protections",
        value: "marriage_one_man_one_woman_limit_lgbtq_protections",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 4.0, // Highly traditional
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 2.5, // Strong religious tradition alignment
          digitalization: 0.0,
          personal_liberty: -3.8, // Max restriction on LGBTQ+ freedoms
          authority_structure: 1.8,
          state_intervention_scope: 2.8, // State actively limiting rights
          societal_focus: -1.0, // Enforcing specific community moral view
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Allow Regional Governments or Local Jurisdictions to Decide on LGBTQ+ Protections",
        value: "regional_local_decide_lgbtq_protections",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 1.0, // Decentralization allows traditional areas to maintain norms
          sovereignty: 1.8, // Stronger regional sovereignty
          ecology: 0.0,
          theocratic: 0.8,
          digitalization: 0.0,
          personal_liberty: 0.0, // Liberty becomes regionally variable
          authority_structure: -3.5, // Highly decentralized
          state_intervention_scope: -2.5, // Stronger reduction in central state intervention
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "campaign_finance_political_donations", // From Amplification Batch 1
    category: "Governance & Electoral Reform",
    questionText:
      "What reforms, if any, are needed for campaign finance and political donations?",
    options: [
      {
        text: "Strictly Limit or Ban Private Money in Elections; Move Towards Public Funding",
        value: "limit_ban_private_money_public_funding_elections",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -2.8, // Stronger progressive reform
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Stronger limits on donation as speech
          authority_structure: 0.8,
          state_intervention_scope: 2.8, // Stronger state role
          societal_focus: -2.5, // Stronger collective fairness
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Increase Transparency and Disclosure Requirements for All Political Donations",
        value: "increase_transparency_disclosure_donations",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.8,
          personal_liberty: 0.8,
          authority_structure: -0.5,
          state_intervention_scope: 1.0, // State mandates disclosure
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.8,
        },
      },
      {
        text: "Reduce Restrictions on Political Donations, Citing Freedom of Speech/Association",
        value: "reduce_restrictions_donations_free_speech",
        ideologyEffect: {
          economic: 1.8,
          social_traditionalism: 1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 3.8, // Max "money as speech"
          authority_structure: -2.0,
          state_intervention_scope: -3.8, // Max minimal state regulation
          societal_focus: 3.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Maintain Current Laws but Enforce Them More Strictly Against Violations",
        value: "maintain_current_campaign_finance_laws_strict_enforcement",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 1.0, // Stronger enforcement
          state_intervention_scope: 0.8,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "voting_rights_election_integrity", // From Amplification Batch 2
    category: "Governance & Electoral Reform",
    questionText:
      "What measures should be taken regarding voting rights and election integrity?",
    options: [
      {
        text: "Expand Voting Access: Automatic Voter Registration, Accessible Polling Options for All",
        value: "expand_voting_access_automatic_registration_polling",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -3.5, // Highly progressive enfranchisement
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.5, // AVR often tech-based
          personal_liberty: 3.8, // Max ease of voting
          authority_structure: -3.0,
          state_intervention_scope: -1.0,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: 1.8,
        },
      },
      {
        text: "Implement Stricter Voter ID Laws and Maintain Accurate Voter Rolls",
        value: "stricter_voter_id_accurate_rolls",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 2.8, // Strong traditional "integrity" focus
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -2.8, // Stronger restriction on access
          authority_structure: 2.5, // Stronger state control of voting
          state_intervention_scope: 2.8,
          societal_focus: 0.8,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Balance Access with Security: Standardize National Election Rules and Audit Procedures",
        value: "balance_access_security_standardize_national_election_rules",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: 1.5, // Stronger national standards
          state_intervention_scope: 1.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Make Election Day a National Public Holiday to Increase Turnout",
        value: "election_day_national_holiday_turnout",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.8, // Stronger progressive participation measure
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: 0.8, // State mandates holiday
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "affordable_housing_crisis", // From Amplification Batch 2
    category: "Social Issues",
    questionText: "How should the issue of affordable housing be addressed?",
    options: [
      {
        text: "Massive Public Investment in Social Housing and Implement Rent Control Measures",
        value: "public_investment_social_housing_rent_control_affordable",
        ideologyEffect: {
          economic: -4.0, // Max collectivist housing solution
          social_traditionalism: -2.0,
          sovereignty: 0.0,
          ecology: 0.5,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.0, // Stronger limits on landlord liberty
          authority_structure: 1.8,
          state_intervention_scope: 3.8, // Max state role
          societal_focus: -3.8, // Max collectivist approach
          rural_priority: -0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Incentivize Private Sector Development through Deregulation and Tax Breaks for Housing",
        value: "incentivize_private_development_deregulation_housing",
        ideologyEffect: {
          economic: 3.8, // Max L-F housing
          social_traditionalism: 1.0,
          sovereignty: 0.0,
          ecology: -1.8, // Stronger negative eco from deregulation
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -1.8,
          state_intervention_scope: -3.5, // Max minimal state/deregulation
          societal_focus: 3.0,
          rural_priority: -0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Expand Housing Subsidies/Vouchers and Support for First-Time Homebuyers",
        value: "expand_housing_vouchers_homebuyer_support_affordable",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.8,
          authority_structure: 0.0,
          state_intervention_scope: 1.8, // Stronger state subsidy role
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Reforming Local Zoning Laws to Increase Housing Density and Supply",
        value: "local_zoning_reform_increase_housing_density_supply",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: -0.8,
          sovereignty: 0.5,
          ecology: 0.8, // Density can be more eco
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -2.5, // Reducing local restrictive authority
          state_intervention_scope: -1.8, // Reducing zoning barriers
          societal_focus: 0.5,
          rural_priority: -1.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "parental_leave_policy", // From Amplification Batch 2
    category: "Labor & Employment",
    questionText:
      "What is your stance on nationally mandated paid parental leave?",
    options: [
      {
        text: "Support Nationally Mandated Comprehensive Paid Family and Medical Leave",
        value: "national_mandate_paid_family_leave",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -2.5, // Stronger progressive family support
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Mandate on businesses
          authority_structure: 1.5, // National mandate
          state_intervention_scope: 2.8, // Stronger state intervention
          societal_focus: -2.5, // Stronger collective family well-being
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Offer Tax Incentives for Businesses that Voluntarily Provide Paid Leave",
        value: "tax_incentives_voluntary_paid_leave",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.8,
          authority_structure: -0.5,
          state_intervention_scope: -1.0,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Oppose National Mandate; Leave it to Regional Governments or Individual Businesses",
        value: "oppose_national_mandate_leave_regional_businesses",
        ideologyEffect: {
          economic: 1.8,
          social_traditionalism: 2.5, // Strong traditional view (private matter/local control)
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0,
          authority_structure: -2.8, // Strong decentralization
          state_intervention_scope: -3.0,
          societal_focus: 2.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "No Government Role; This is a Private Matter Between Employer and Employee",
        value: "no_government_role_parental_leave_private_matter",
        ideologyEffect: {
          economic: 2.8,
          social_traditionalism: 3.5, // Max traditional view of private sphere
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 3.8, // Max freedom of contract
          authority_structure: -3.0,
          state_intervention_scope: -4.0, // Max no state role
          societal_focus: 3.8, // Max individualism
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "ai_development_regulation",
    category: "Technology & Innovation",
    questionText:
      "How should Artificial Intelligence (AI) development and deployment be regulated?",
    options: [
      {
        text: "Establish a National Agency for AI Safety, Ethics, and Regulatory Oversight",
        value: "national_agency_ai_safety_ethics_oversight",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -0.5, // Regulating AI development
          personal_liberty: -1.5,
          authority_structure: 1.8, // Stronger central agency
          state_intervention_scope: 2.8, // Stronger state oversight
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -2.0,
        },
      },
      {
        text: "Promote Innovation with Minimal Regulation, Focus on Industry-Led Standards and Best Practices",
        value: "promote_ai_innovation_minimal_regulation_industry_standards",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 3.8, // Max pro-innovation
          personal_liberty: 2.5,
          authority_structure: -2.0,
          state_intervention_scope: -3.8, // Max minimal state
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Pursue International Treaties and Agreements to Govern AI Development and Prevent Misuse",
        value: "international_treaties_govern_ai_development_misuse",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -0.5,
          sovereignty: -3.8, // Max international cooperation
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: -1.0, // Ceding to intl. norms
          state_intervention_scope: 1.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.8, // Stronger institutionalism
        },
      },
      {
        text: "Focus on Data Privacy, Algorithmic Transparency, and Bias Mitigation within Existing Legal Frameworks",
        value: "ai_data_privacy_algorithmic_transparency_bias_mitigation",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.5, // Stronger progressive focus on fairness
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.8,
          personal_liberty: 1.8, // Stronger data rights protection
          authority_structure: 0.0,
          state_intervention_scope: 1.0,
          societal_focus: -0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "head_of_state_system",
    category: "Governance & Sovereignty",
    questionText:
      "What is the ideal system for selecting and empowering the Head of State?",
    options: [
      {
        text: "Hereditary Monarchy: The Head of State should be determined by established lines of succession and tradition.",
        value: "hereditary_monarchy",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.5,
          sovereignty: 2.0, // National symbol
          ecology: 0.0,
          theocratic: 1.5, // Often linked historically
          digitalization: -1.0, // Less emphasis on modern systems of selection
          personal_liberty: -3.0, // No choice in head of state
          authority_structure: 4.0, // Highly centralized, traditional authority
          state_intervention_scope: 1.0, // Monarch can be interventionist
          societal_focus: -1.0, // Focus on hierarchy, tradition
          rural_priority: 0.5,
          governance_approach: -4.0, // Anti-populist, elitist by definition
        },
      },
      {
        text: "Technocratic Council: The Head of State (or a leading council) should be chosen from proven experts and scientists based on merit and expertise.",
        value: "technocratic_council",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0, // Rationalist, not traditional
          sovereignty: 0.5,
          ecology: 1.0, // Data-driven environmentalism
          theocratic: -2.0, // Secular, expert-driven
          digitalization: 3.0, // Data and tech are key
          personal_liberty: -1.5, // Individual political liberty reduced
          authority_structure: 2.5, // Centralized expert authority
          state_intervention_scope: 1.5,
          societal_focus: 0.0, // Focus on efficiency/outcomes
          rural_priority: 0.0,
          governance_approach: -3.5, // Highly elitist/expert-driven
        },
      },
      {
        text: "Direct Popular Election: The Head of State should be elected directly by a national popular vote, ensuring maximum democratic accountability.",
        value: "direct_popular_election_hos",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: 2.0,
          authority_structure: -2.0, // Diffuses power to electorate
          state_intervention_scope: 0.0,
          societal_focus: -0.5,
          rural_priority: -0.5, // Can disadvantage rural if purely popular
          governance_approach: 3.0, // Highly populist
        },
      },
      {
        text: "Revolutionary Vanguard Party: A single, ideologically committed party representing the working class should lead the state.",
        value: "revolutionary_vanguard_party",
        ideologyEffect: {
          economic: -3.0,
          social_traditionalism: -1.5, // Revolutionary, can be socially conservative or progressive
          sovereignty: 1.0, // Party sovereignty
          ecology: 0.0,
          theocratic: -2.0, // Usually atheist/secular
          digitalization: 0.0,
          personal_liberty: -4.0, // Severe restrictions
          authority_structure: 4.0, // Max party authority
          state_intervention_scope: 3.5,
          societal_focus: -3.0, // Collectivist, party-defined good
          rural_priority: 0.0,
          governance_approach: -3.0, // Elitist vanguard
        },
      },
    ],
  },
  {
    id: "land_reform_agricultural_structure",
    category: "Agriculture & Rural Development",
    questionText:
      "What fundamental principle should guide land ownership and agricultural production?",
    options: [
      {
        text: "Full Collectivization: All agricultural land should be state or communally owned and managed for collective benefit.",
        value: "full_land_collectivization",
        ideologyEffect: {
          economic: -4.0,
          social_traditionalism: -1.0,
          sovereignty: 0.5,
          ecology: 0.5, // Can be good or bad
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -3.5, // No private land ownership
          authority_structure: 3.0, // State/commune control
          state_intervention_scope: 4.0,
          societal_focus: -4.0,
          rural_priority: 1.0, // Focus on agricultural production
          governance_approach: -1.0,
        },
      },
      {
        text: "Agrarian Ideal: Promote widespread ownership of small, self-sufficient family farms and rural homesteads, protected by the state.",
        value: "agrarian_family_farms",
        ideologyEffect: {
          economic: -1.0, // Anti-large scale agribusiness, some protectionism
          social_traditionalism: 2.5, // Traditional lifestyle
          sovereignty: 1.0,
          ecology: 2.0, // Often associated with stewardship
          theocratic: 0.5,
          digitalization: -1.5, // Often skeptical of large-scale agritech
          personal_liberty: 1.5, // Liberty of smallholders
          authority_structure: -2.0, // Decentralized ownership
          state_intervention_scope: 1.0, // State protection for small farms
          societal_focus: -1.0, // Community focus
          rural_priority: 4.0, // Max rural focus
          governance_approach: 1.5, // Populist appeal to rural values
        },
      },
      {
        text: "Market-Based Agribusiness: Encourage large-scale, technologically advanced private farms driven by market efficiency and export potential.",
        value: "market_agribusiness_efficiency",
        ideologyEffect: {
          economic: 3.5,
          social_traditionalism: 0.0,
          sovereignty: -1.0, // Export-oriented
          ecology: -2.5, // Industrial farming impact
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: 2.0,
          authority_structure: 0.5, // Corporate power
          state_intervention_scope: -2.5, // Deregulation
          societal_focus: 2.0,
          rural_priority: -1.0, // Can displace small farms
          governance_approach: -1.0,
        },
      },
      {
        text: "Eco-Social Land Use: Prioritize ecological restoration, community-supported agriculture (CSAs), and food sovereignty with diverse, localized systems.",
        value: "eco_social_land_use",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -2.0,
          sovereignty: 0.5, // Food sovereignty can be localist
          ecology: 3.8,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: 1.0,
          authority_structure: -2.5, // Community-led
          state_intervention_scope: 1.5, // Support for transition
          societal_focus: -2.5,
          rural_priority: 1.5,
          governance_approach: 2.0,
        },
      },
    ],
  },
  {
    id: "state_control_information_media",
    category: "Civil Liberties & Media",
    questionText:
      "What should be the state's role in relation to information and mass media?",
    options: [
      {
        text: "Full State Control: All major media outlets should be state-owned and directed to promote national unity and official narratives.",
        value: "full_state_media_control",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 1.0, // Can be used for traditionalist narratives
          sovereignty: 2.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -4.0, // No free press
          authority_structure: 4.0, // Max state control
          state_intervention_scope: 3.0,
          societal_focus: -1.0, // State-defined collective good
          rural_priority: 0.0,
          governance_approach: -3.0, // Highly authoritarian
        },
      },
      {
        text: "Public Service Broadcasting & Regulation: Maintain strong, independent public media and regulate private media to ensure accuracy, pluralism, and combat harmful disinformation.",
        value: "public_service_media_regulation",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: -1.5, // Regulation limits some press freedom
          authority_structure: 1.0, // Regulatory bodies
          state_intervention_scope: 2.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Free Press Absolutism: No government regulation or ownership of media; rely on a free market of ideas and private fact-checking.",
        value: "free_press_absolutism_no_regulation",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 4.0, // Max press freedom
          authority_structure: -2.5,
          state_intervention_scope: -3.5,
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "role_of_religion_in_state",
    category: "Social Issues",
    questionText:
      "What should be the relationship between religious institutions and the state?",
    options: [
      {
        text: "Establish an Official State Religion: The state should formally endorse and promote a specific national religion, and its tenets should influence law and public life.",
        value: "establish_state_religion",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.5,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 4.0, // Max theocratic
          digitalization: -0.5,
          personal_liberty: -3.0, // For religious minorities and non-believers
          authority_structure: 2.5, // Religious authority intertwined with state
          state_intervention_scope: 2.0, // State enforcing religious norms
          societal_focus: -2.0, // Focus on religious community
          rural_priority: 0.0,
          governance_approach: -2.0, // Can be elitist (clergy)
        },
      },
      {
        text: "Strict Secularism: Enforce a complete separation of church and state, with no religious influence in lawmaking or public institutions, and no state funding for religious bodies.",
        value: "strict_secularism_separation",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -2.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -4.0, // Max anti-theocratic
          digitalization: 0.0,
          personal_liberty: 2.0, // Freedom from religious imposition
          authority_structure: -1.0,
          state_intervention_scope: -0.5, // State actively ensures separation
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Accommodative Secularism: The state is officially secular but allows for religious expression in public life and may provide equitable support to various religious community initiatives.",
        value: "accommodative_secularism_religious_expression",
        ideologyEffect: {
          economic: -0.5, // If state supports initiatives
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0, // Still secular but tolerant
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "national_service_civic_duty",
    category: "Social Issues",
    questionText:
      "Should a form of mandatory national service be implemented for young citizens?",
    options: [
      {
        text: "Yes, Mandatory Military Service for all eligible citizens to instill discipline and ensure national defense readiness.",
        value: "mandatory_military_service_all",
        ideologyEffect: {
          economic: -1.0, // Cost of large standing army/conscripts
          social_traditionalism: 2.0, // Discipline, tradition
          sovereignty: 2.5, // National defense
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -3.5, // Compulsory service
          authority_structure: 3.0, // Strong state control over citizens
          state_intervention_scope: 2.5,
          societal_focus: -1.0, // Collective duty
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Yes, Mandatory Civilian National Service focused on community needs, infrastructure, or environmental conservation.",
        value: "mandatory_civilian_service_community",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -1.0, // Progressive form of service
          sovereignty: 0.5,
          ecology: 1.5,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.5, // Still compulsory
          authority_structure: 1.5,
          state_intervention_scope: 2.0,
          societal_focus: -2.5, // Strong collectivist/community service
          rural_priority: 0.5,
          governance_approach: 0.5,
        },
      },
      {
        text: "No Mandatory Service: Emphasize individual choice and voluntary community engagement. Offer incentives for voluntary public service.",
        value: "no_mandatory_service_voluntary_incentives",
        ideologyEffect: {
          economic: -0.5, // Cost of incentives
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 3.0, // Individual choice
          authority_structure: -1.5,
          state_intervention_scope: -1.0, // Less state compulsion
          societal_focus: 1.5, // Individualism
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "legislative_judicial_structure",
    category: "Governance & Sovereignty",
    questionText:
      "What is the ideal structure and source of authority for the legislative and judicial branches of government?",
    options: [
      {
        text: "A system of checks and balances with an independent judiciary, elected legislature, and entrenched constitutional rights protecting individuals from state overreach.",
        value: "independent_judiciary_elected_legislature_rights",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -2.5,
          state_intervention_scope: -1.0,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Legislative and judicial power should be subordinate to the Head of State (e.g., Monarch or President-for-Life) who embodies national tradition and stability.",
        value: "legislature_judiciary_subordinate_to_hos",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 2.5,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 1.0,
          digitalization: -0.5,
          personal_liberty: -3.0,
          authority_structure: 3.8,
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -3.0,
        },
      },
      {
        text: "A streamlined system where legislative and judicial functions are guided by a council of scientific and technical experts to ensure optimal, evidence-based governance.",
        value: "expert_guided_legislative_judicial",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 1.0,
          theocratic: -2.0,
          digitalization: 2.5,
          personal_liberty: -2.0,
          authority_structure: 2.0,
          state_intervention_scope: 1.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -4.0,
        },
      },
      {
        text: "People's Assemblies and direct community courts should form the core of legislative and judicial power, minimizing hierarchical structures.",
        value: "peoples_assemblies_community_courts",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.5,
          sovereignty: -0.5,
          ecology: 0.5,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -3.8,
          state_intervention_scope: -0.5,
          societal_focus: -2.0,
          rural_priority: 0.5,
          governance_approach: 3.5,
        },
      },
    ],
  },
  {
    id: "societal_change_philosophy",
    category: "Culture & Society",
    questionText:
      "What is the desired pace and nature of societal change regarding traditions, values, and institutions?",
    options: [
      {
        text: "Rapid, transformative change to dismantle outdated hierarchies and create a radically equitable and just society.",
        value: "rapid_transformative_social_change",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -4.0,
          sovereignty: -1.0,
          ecology: 0.5,
          theocratic: -2.0,
          digitalization: 0.5,
          personal_liberty: 2.0,
          authority_structure: -2.0,
          state_intervention_scope: 1.5, // State as agent of change
          societal_focus: -2.5,
          rural_priority: 0.0,
          governance_approach: 1.5,
        },
      },
      {
        text: "Gradual, evidence-based reform that adapts institutions to modern needs while respecting core societal values and stability.",
        value: "gradual_evidence_based_reform",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Preservation of established traditions, institutions, and moral order; change should be resisted if it undermines these foundations.",
        value: "preserve_tradition_resist_radical_change",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.8,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 1.5,
          digitalization: -1.0,
          personal_liberty: -1.5,
          authority_structure: 2.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.5,
          rural_priority: 0.5,
          governance_approach: -1.5,
        },
      },
      {
        text: "Return to foundational, often idealized, historical principles and a simpler way of life, rejecting modern complexities and perceived corruption.",
        value: "return_to_foundational_principles_simpler_life",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: 3.0,
          sovereignty: 1.5,
          ecology: 1.0,
          theocratic: 1.0,
          digitalization: -2.5,
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 0.0,
          societal_focus: -1.0,
          rural_priority: 2.5,
          governance_approach: 0.5, // Can be populist
        },
      },
    ],
  },
  {
    id: "urban_vs_rural_land_priority",
    category: "Environment",
    questionText:
      "In land use planning, what should be the primary national priority?",
    options: [
      {
        text: "Prioritize dense, efficient urban development and public transport to minimize sprawl and protect wilderness and agricultural land.",
        value: "prioritize_dense_urban_protect_rural_wilderness",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 2.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: -0.5, // Zoning limits
          authority_structure: 1.0, // Central planning
          state_intervention_scope: 1.5,
          societal_focus: -1.0,
          rural_priority: -2.5, // De-prioritizes rural expansion
          governance_approach: -0.5,
        },
      },
      {
        text: "Protect and expand productive agricultural land to ensure national food sovereignty and support rural livelihoods above all else.",
        value: "protect_expand_agricultural_land_rural_livelihoods",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: 1.5,
          sovereignty: 2.0,
          ecology: 0.5, // Can be sustainable or not
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 3.8, // Max rural focus
          governance_approach: 0.5,
        },
      },
      {
        text: "Maximize wilderness preservation and ecological restoration, even if it limits some urban expansion or agricultural use.",
        value: "maximize_wilderness_ecological_restoration",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 4.0,
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: -1.0, // Limits on land use
          authority_structure: 1.0,
          state_intervention_scope: 2.0,
          societal_focus: -1.5,
          rural_priority: 0.0, // Wilderness can be rural but not for production
          governance_approach: 0.0,
        },
      },
      {
        text: "Allow market forces and private property rights to determine land use with minimal zoning or environmental restrictions.",
        value: "market_forces_determine_land_use",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: -3.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -2.0,
          state_intervention_scope: -3.5,
          societal_focus: 2.5,
          rural_priority: 0.0, // Market decides
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "global_economic_order",
    category: "Economy & Foreign Policy",
    questionText:
      "What is the ideal approach to the global economic order and international financial institutions?",
    options: [
      {
        text: "Champion global free trade, open markets, and the current international financial institutions (IMF, World Bank, WTO) to foster global prosperity.",
        value: "global_free_trade_current_institutions",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: -0.5,
          sovereignty: -3.0,
          ecology: -1.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -2.0, // Less national intervention
          societal_focus: 1.5,
          rural_priority: -1.0,
          governance_approach: -2.0, // Elitist global institutions
        },
      },
      {
        text: "Advocate for radical reform or replacement of international financial institutions to prioritize global equity, debt relief for developing nations, and workers' rights worldwide.",
        value: "reform_replace_ifi_global_equity_debt_relief",
        ideologyEffect: {
          economic: -2.5,
          social_traditionalism: -2.5,
          sovereignty: -2.5,
          ecology: 1.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -1.5,
          state_intervention_scope: 1.0, // For national implementation of new standards
          societal_focus: -3.5,
          rural_priority: 0.0,
          governance_approach: 1.5, // Populist global justice
        },
      },
      {
        text: "Prioritize national economic sovereignty, using protectionist measures where necessary and engaging with international institutions only when they directly serve clear national interests.",
        value: "national_sovereignty_protectionism_selective_engagement",
        ideologyEffect: {
          economic: -1.0, // Protectionism is anti-free market
          social_traditionalism: 1.0,
          sovereignty: 3.8,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 2.0,
          societal_focus: 0.5,
          rural_priority: 0.5,
          governance_approach: 1.0,
        },
      },
      {
        text: "Promote a system of international barter, mutual aid, and alternative currencies, bypassing traditional global financial systems and corporate power.",
        value: "alternative_global_economy_barter_mutual_aid",
        ideologyEffect: {
          economic: -3.0,
          social_traditionalism: -1.5,
          sovereignty: -0.5, // Can be decentralized internationalism
          ecology: 1.5,
          theocratic: 0.0,
          digitalization: -1.0,
          personal_liberty: 1.5,
          authority_structure: -3.0,
          state_intervention_scope: -1.0, // Less reliance on traditional state financial tools
          societal_focus: -3.0,
          rural_priority: 1.0,
          governance_approach: 2.5,
        },
      },
    ],
  },
  {
    id: "role_of_elites_governance",
    category: "Governance & Society",
    questionText:
      "What is the proper role of elites (e.g., intellectuals, wealthy, established leaders) versus the masses in governance?",
    options: [
      {
        text: "Governance should primarily be entrusted to experienced, educated, and virtuous elites who can make wise decisions for the common good.",
        value: "elite_rule_experienced_virtuous",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.5,
          digitalization: 0.5,
          personal_liberty: -2.0,
          authority_structure: 2.5,
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -3.8, // Max elitist
        },
      },
      {
        text: "The will of the common people, expressed directly or through responsive representatives, should be the ultimate guide for all government actions.",
        value: "popular_will_ultimate_guide",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -2.0,
          state_intervention_scope: 0.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: 3.8, // Max populist
        },
      },
      {
        text: "A revolutionary vanguard, possessing true ideological understanding, must lead the masses, even if initially against their perceived will, to achieve a higher societal state.",
        value: "revolutionary_vanguard_leads_masses",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 0.0,
          personal_liberty: -3.5,
          authority_structure: 3.5,
          state_intervention_scope: 2.5,
          societal_focus: -2.5,
          rural_priority: 0.0,
          governance_approach: -3.0, // Elitist vanguard
        },
      },
      {
        text: "No inherent role for 'elites' or 'masses'; individual rights and voluntary association should determine societal structure, free from coercive governance.",
        value: "no_elites_or_masses_individual_rights_voluntary_assoc",
        ideologyEffect: {
          economic: 2.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 3.8,
          authority_structure: -3.5,
          state_intervention_scope: -3.8,
          societal_focus: 3.0,
          rural_priority: 0.0,
          governance_approach: 2.0, // Can be seen as populist anti-state
        },
      },
    ],
  },
  {
    id: "rights_of_nature_ecocide_law",
    category: "Environment",
    questionText:
      "Should natural ecosystems (e.g., rivers, forests, mountains) be granted legal personhood, and should 'ecocide' (severe, widespread, or long-term environmental destruction) be criminalized as a major international and national crime?",
    options: [
      {
        text: "Yes, grant full legal personhood to key ecosystems and criminalize ecocide with severe penalties, recognizing nature's intrinsic rights.",
        value: "grant_nature_rights_criminalize_ecocide",
        ideologyEffect: {
          economic: -2.5, // Significant restrictions on resource extraction/development
          social_traditionalism: -2.0, // Radical departure from human-centric law
          sovereignty: -1.0, // International crime aspect
          ecology: 4.0, // Max ecological protection via legal status
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Potential limits on property use
          authority_structure: 1.5, // New legal frameworks, enforcement bodies
          state_intervention_scope: 2.5, // Strong state role in enforcement
          societal_focus: -2.0, // Collective responsibility for nature
          rural_priority: 0.5, // Could protect rural environments
          governance_approach: 1.0, // Can be a populist environmental demand
        },
      },
      {
        text: "Criminalize ecocide for exceptionally destructive acts, but avoid granting legal personhood to nature, focusing on stronger existing environmental laws.",
        value: "criminalize_ecocide_strengthen_laws",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 2.8,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 1.5,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Focus on robust financial penalties and restoration requirements for environmental damage, rather than criminalization or legal personhood for nature.",
        value: "financial_penalties_restoration_damage",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 1.5,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "No, such measures are an overreach and would unduly restrict economic development and private property rights.",
        value: "no_nature_rights_no_ecocide_law",
        ideologyEffect: {
          economic: 2.5,
          social_traditionalism: 1.0,
          sovereignty: 0.0,
          ecology: -3.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -2.0,
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "degrowth_steady_state_economy",
    category: "Economy & Environment",
    questionText:
      "What should be the national economic strategy regarding growth and resource consumption?",
    options: [
      {
        text: "Transition to a 'Degrowth' or 'Steady-State' economy, prioritizing ecological sustainability, well-being, and equity over GDP growth, with planned downscaling of harmful industries.",
        value: "degrowth_steady_state_economy_sustainability",
        ideologyEffect: {
          economic: -3.8, // Radical shift from capitalism
          social_traditionalism: -2.0, // Requires new social values
          sovereignty: 0.0,
          ecology: 4.0, // Core goal
          theocratic: 0.0,
          digitalization: -1.0, // May de-emphasize tech for growth's sake
          personal_liberty: -2.0, // Significant lifestyle changes, consumption limits
          authority_structure: 2.0, // Requires strong planning
          state_intervention_scope: 3.8, // Massive state intervention
          societal_focus: -3.5, // Strong collectivist focus on well-being/equity
          rural_priority: 1.0, // Often emphasizes localization
          governance_approach: 1.0,
        },
      },
      {
        text: "Pursue 'Green Growth': decouple economic growth from environmental impact through massive investment in green technology, renewable energy, and circular economy models.",
        value: "green_growth_decoupling_technology",
        ideologyEffect: {
          economic: -1.0,
          social_traditionalism: -1.0,
          sovereignty: -0.5,
          ecology: 2.5,
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 2.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on sustainable development goals within the current economic growth paradigm, using market incentives and moderate regulations.",
        value: "sustainable_development_current_paradigm",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 1.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize unrestricted economic growth; environmental concerns can be addressed later or through technological fixes as they arise.",
        value: "unrestricted_growth_address_env_later",
        ideologyEffect: {
          economic: 3.5,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -3.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -2.5,
          societal_focus: 2.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "transportation_system_overhaul",
    category: "Infrastructure & Environment",
    questionText:
      "What is the ideal future for the national transportation system?",
    options: [
      {
        text: "Massively expand free public transport, invest in high-speed rail, create extensive cycling/walking infrastructure, and heavily restrict/tax private car use in urban areas.",
        value: "free_public_transport_restrict_cars",
        ideologyEffect: {
          economic: -3.0, // Large public expenditure, reduced car industry
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 3.5, // Significant reduction in emissions
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -2.5, // Restrictions on car use
          authority_structure: 1.5, // State planning and enforcement
          state_intervention_scope: 3.5,
          societal_focus: -2.5, // Collective good of public transport/clean air
          rural_priority: -1.0, // Urban focus, potential rural impact from car restrictions
          governance_approach: 0.5,
        },
      },
      {
        text: "Invest in electric vehicle infrastructure and incentivize EV adoption, while maintaining and improving road networks for all vehicle types.",
        value: "electric_vehicles_road_networks",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 1.5,
          theocratic: 0.0,
          digitalization: 2.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 1.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Prioritize individual freedom of movement via private vehicles; focus on road expansion and new automotive technologies (e.g., autonomous cars).",
        value: "prioritize_private_vehicles_road_expansion",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -2.5,
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: 2.0,
          authority_structure: -0.5,
          state_intervention_scope: -1.0,
          societal_focus: 1.5,
          rural_priority: 0.5,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "food_system_transformation_radical",
    category: "Agriculture & Environment",
    questionText:
      "What is the most ecologically sound and socially just approach to the national food system?",
    options: [
      {
        text: "Massively shift support to localized, organic, agroecological farming systems and promote predominantly plant-based diets through public campaigns and incentives.",
        value: "localized_organic_plant_based_diets",
        ideologyEffect: {
          economic: -2.0, // Shift from industrial ag, potential costs
          social_traditionalism: -2.5, // Challenges traditional diets/farming
          sovereignty: 0.5, // Local food security
          ecology: 3.8, // Very high ecological benefit
          theocratic: 0.0,
          digitalization: -0.5, // Less emphasis on high-tech industrial ag
          personal_liberty: -1.0, // "Promote" can mean pressure on choice
          authority_structure: -1.0, // Decentralized food systems
          state_intervention_scope: 2.0, // State incentives/campaigns
          societal_focus: -2.5, // Collective health/eco good
          rural_priority: 2.0, // Supports local/rural farming models
          governance_approach: 1.5,
        },
      },
      {
        text: "Invest in sustainable intensification of current agriculture (e.g., precision farming, GMOs for efficiency) to meet food demand with reduced inputs.",
        value: "sustainable_intensification_agritech",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 1.0,
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: -0.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "Support current industrial agriculture models with incremental improvements in animal welfare and environmental standards.",
        value: "industrial_ag_incremental_improvements",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: -1.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.0,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Focus primarily on food affordability and abundance through any means necessary, including intensive industrial agriculture and global imports.",
        value: "food_affordability_abundance_any_means",
        ideologyEffect: {
          economic: 2.0,
          social_traditionalism: 0.0,
          sovereignty: -1.0,
          ecology: -3.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: -1.0,
          societal_focus: 1.0,
          rural_priority: -1.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "group_equity_mandates",
    category: "Social Justice & Equality",
    questionText:
      "What measures should be taken to address historical and systemic inequalities faced by marginalized groups (e.g., racial, ethnic, gender)?",
    options: [
      {
        text: "Implement legally binding quotas and preferential policies in employment, education, and representation for historically marginalized groups until full proportional equity is achieved.",
        value: "mandate_quotas_preferential_policies",
        ideologyEffect: {
          economic: -1.0, // Can have economic restructuring implications
          social_traditionalism: -4.0, // Radical social re-engineering for equity
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0, // Challenges traditional power structures often linked to religion
          digitalization: 0.0,
          personal_liberty: -2.0, // Limits individual/employer freedom of choice for equity goals
          authority_structure: 1.5, // Requires strong state enforcement/monitoring
          state_intervention_scope: 3.0, // High state intervention
          societal_focus: -3.8, // Max focus on group equity
          rural_priority: 0.0,
          governance_approach: 1.0, // Can be top-down imposition of equity
        },
      },
      {
        text: "Strengthen affirmative action programs, invest heavily in targeted support and anti-discrimination enforcement, but avoid strict quotas.",
        value: "strong_affirmative_action_no_quotas",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -2.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -0.5,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 0.5,
          state_intervention_scope: 1.5,
          societal_focus: -2.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Focus on universal programs that benefit all disadvantaged individuals and ensure strict equal opportunity laws, opposing group-based preferences.",
        value: "universal_programs_equal_opportunity_no_preferences",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Individual merit and effort should be the sole determinants of success; the state should not intervene based on group identity.",
        value: "individual_merit_no_group_intervention",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.0,
          authority_structure: -1.0,
          state_intervention_scope: -2.0,
          societal_focus: 2.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "law_enforcement_future_radical",
    category: "Criminal Justice & Civil Liberties",
    questionText:
      "What is the long-term vision for law enforcement and public safety?",
    options: [
      {
        text: "Systematically dismantle and abolish traditional police forces, redirecting all funds to community-led safety initiatives, non-violent crisis responders, and restorative justice programs.",
        value: "abolish_police_community_safety_initiatives",
        ideologyEffect: {
          economic: -1.0, // Redirecting funds implies spending priorities
          social_traditionalism: -3.8, // Radical restructuring of public safety
          sovereignty: 0.0,
          ecology: 0.5, // Potentially less resource-intensive than traditional policing
          theocratic: 0.0,
          digitalization: -0.5, // May de-emphasize surveillance tech associated with policing
          personal_liberty: 2.5, // Reduced state coercive power
          authority_structure: -4.0, // Max decentralization of safety, anti-state police
          state_intervention_scope: -2.0, // State divests from traditional policing
          societal_focus: -2.5, // Community-led solutions
          rural_priority: 0.0,
          governance_approach: 3.0, // Highly participatory, grassroots
        },
      },
      {
        text: "Significantly defund police departments, demilitarize remaining forces, and heavily reinvest in social services, mental health care, and housing.",
        value: "defund_demilitarize_police_reinvest_social_services",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -2.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.5,
          authority_structure: -2.5,
          state_intervention_scope: 1.0, // Reinvestment is state action
          societal_focus: -2.0,
          rural_priority: 0.0,
          governance_approach: 1.5,
        },
      },
      {
        text: "Implement comprehensive reforms: civilian oversight, mandatory body cameras, de-escalation training, and community policing models.",
        value: "comprehensive_police_reform_oversight_training",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: 0.5,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Increase funding for law enforcement, expand police presence, and ensure officers have the resources to maintain order and combat crime effectively.",
        value: "increase_police_funding_ensure_order",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: 2.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -2.0,
          authority_structure: 2.5,
          state_intervention_scope: 1.0,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "historical_reparations_policy_direct",
    category: "Social Justice & Economy",
    questionText:
      "How should the nation address the direct financial and material legacy of historical injustices like slavery or colonialism?",
    options: [
      {
        text: "Implement direct financial payments and land restitution programs to descendants of historically oppressed and dispossessed communities.",
        value: "direct_financial_land_reparations",
        ideologyEffect: {
          economic: -3.0, // Significant wealth redistribution
          social_traditionalism: -3.5, // Radical attempt to rectify past injustices
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // Taxation, potential property disputes
          authority_structure: 1.0, // State administering large-scale program
          state_intervention_scope: 3.0,
          societal_focus: -3.8, // Max focus on rectifying group injustice
          rural_priority: 0.5, // Land restitution may involve rural areas
          governance_approach: 1.0,
        },
      },
      {
        text: "Establish substantial, targeted community investment funds for education, healthcare, and economic development in historically marginalized communities.",
        value: "community_investment_funds_historical_injustice",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -2.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -0.5,
          authority_structure: 0.5,
          state_intervention_scope: 2.0,
          societal_focus: -2.5,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Focus on symbolic gestures like official apologies, memorials, and educational initiatives about past injustices.",
        value: "symbolic_apologies_memorials_education_injustice",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "No direct state action on reparations; past injustices are best addressed by individual reconciliation and current equal opportunity laws.",
        value: "no_reparations_focus_current_equality",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: 1.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: -1.0,
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "gender_identity_societal_framework",
    category: "Social Issues",
    questionText:
      "How should legal and societal frameworks adapt to diverse and evolving understandings of gender identity?",
    options: [
      {
        text: "Radically deconstruct traditional gender categories in law and public life; mandate universal gender-neutral language, facilities, and actively promote education on gender spectrums and non-binary identities.",
        value: "deconstruct_gender_categories_mandate_neutrality",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -4.0, // Max progressive/radical stance on gender
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -2.0, // Challenges traditional religious views on gender
          digitalization: 0.0,
          personal_liberty: 1.0, // Freedom for diverse identities, but mandates can feel restrictive to some
          authority_structure: 1.0, // State mandating changes
          state_intervention_scope: 2.5, // Significant state effort in re-education/restructuring
          societal_focus: -2.0, // Focus on inclusivity for marginalized genders
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Ensure full legal recognition and robust anti-discrimination protections for all gender identities, including non-binary and transgender individuals, based on self-identification.",
        value: "full_recognition_self_id_anti_discrimination",
        ideologyEffect: {
          // This is similar to an existing option for gender_identity_legal_recognition but more encompassing
          economic: 0.0,
          social_traditionalism: -3.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.5,
          digitalization: 0.0,
          personal_liberty: 2.5,
          authority_structure: -1.0,
          state_intervention_scope: 1.5,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Acknowledge transgender identities with medical transition pathways, but maintain sex-based distinctions in areas like sports or single-sex spaces.",
        value: "recognize_trans_medical_sex_based_distinctions",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.5,
          digitalization: 0.0,
          personal_liberty: -1.0,
          authority_structure: 0.5,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Uphold traditional, binary definitions of gender based on biological sex at birth in all legal and societal contexts.",
        value: "uphold_traditional_binary_gender_sex_at_birth",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 3.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 1.5,
          digitalization: 0.0,
          personal_liberty: -2.5,
          authority_structure: 1.0,
          state_intervention_scope: 1.0,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "knowledge_systems_policy_influence",
    category: "Education",
    questionText:
      "What role should different knowledge systems play in shaping public policy and scientific inquiry?",
    options: [
      {
        text: "Elevate lived experiences of marginalized communities and indigenous/traditional knowledge systems to co-equal status with, or critique of, empirical scientific methods in policy formation.",
        value: "elevate_lived_experience_indigenous_knowledge_critique_science",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -3.0, // Challenges established Western scientific tradition as sole authority
          sovereignty: 0.5, // Can support indigenous sovereignty
          ecology: 1.5, // Indigenous knowledge often ecological
          theocratic: 0.0, // Can be distinct from organized religion but values non-material ways of knowing
          digitalization: -1.0, // May be skeptical of tech-centric solutions if they marginalize other knowledge
          personal_liberty: 0.5,
          authority_structure: -1.5, // Challenges established scientific authority
          state_intervention_scope: 0.5,
          societal_focus: -2.0, // Focus on equity of knowledge systems
          rural_priority: 0.5,
          governance_approach: 2.0, // Participatory inclusion of diverse epistemologies
        },
      },
      {
        text: "Integrate insights from diverse knowledge systems and lived experiences to enrich and contextualize policy, while upholding rigorous scientific methodology as the primary basis for evidence.",
        value: "integrate_diverse_knowledge_uphold_science",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: -1.5,
          sovereignty: 0.0,
          ecology: 0.5,
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.0,
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Public policy should be primarily informed by peer-reviewed scientific research and data-driven analysis conducted by qualified experts.",
        value: "policy_by_peer_reviewed_science_experts",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: -1.0,
          digitalization: 1.5,
          personal_liberty: 0.0,
          authority_structure: 1.0,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -2.0, // Technocratic/Expert-led
        },
      },
      {
        text: "Policy should reflect common sense, traditional wisdom, and prevailing community values, with skepticism towards purely academic or scientific claims that contradict these.",
        value: "policy_common_sense_traditional_wisdom_skeptic_science",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 2.0,
          sovereignty: 0.0,
          ecology: -0.5,
          theocratic: 0.5,
          digitalization: -1.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 0.0,
          societal_focus: 0.0,
          rural_priority: 0.5,
          governance_approach: 1.5, // Populist
        },
      },
    ],
  },
];

export const ATTRIBUTES_LIST = [
  "Charisma",
  "Integrity",
  "Intelligence",
  "Negotiation",
  "Oratory",
  "Fundraising",
];

export const BACKGROUND_FIELDS = [
  {
    key: "education",
    label: "Education Level",
    options: [
      "High School",
      "Some College",
      "Bachelor's Degree",
      "Master's Degree",
      "Doctorate",
    ],
  },
  {
    key: "career",
    label: "Previous Career",
    options: [
      "Lawyer",
      "Business Owner",
      "Activist",
      "Academic",
      "Military Veteran",
      "Union Leader",
      "Journalist",
    ],
  },
  // { key: 'narrative', label: 'Brief Backstory', type: 'textarea' }
];

// Assuming POLICY_QUESTIONS is the array of 100 questions with 5-axis ideologyEffect
// Assuming IDEOLOGY_DEFINITIONS contains the 5-axis ideal points for each ideology

export const PROCESSED_POLICY_QUESTIONS = POLICY_QUESTIONS.map((question) => {
  const optionsMap = new Map();

  // Check if question.options exists and is an array before trying to iterate
  if (question && Array.isArray(question.options)) {
    question.options.forEach((option) => {
      // Ensure option itself and option.value are valid before setting
      if (option && typeof option.value !== "undefined") {
        // Use axis_effects as per our previous changes
        if (option.axis_effects && typeof option.axis_effects === "object") {
          optionsMap.set(option.value, option.axis_effects);
        } else {
          // Default to empty effect if axis_effects is missing/invalid
          optionsMap.set(option.value, {});
        }
      }
    });
  }

  return {
    id: question.id,
    optionsMap: optionsMap,
    options: question.options || [],
  };
});
