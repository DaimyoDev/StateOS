export const ENVIRONMENT_POLICY_QUESTIONS = [
  {
    id: "environmental_regulation",
    category: "Environment",
    questionText:
      "What is your stance on environmental regulations for businesses?",
    options: [
      {
        text: "Implement Strict Environmental Regulations & Enforce Rapid Green Transition",
        value: "strict_green_transition_regulations",
        ideologyEffect: {
          // Original: econ: -2.0, eco: 3.5, scope: 3.0
          economic: -3.0, // Increased impact
          social_traditionalism: -1.0,
          sovereignty: -0.5,
          ecology: 3.8, // Increased impact
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -2.0, // Stricter regs limit business liberty more
          authority_structure: 1.5,
          state_intervention_scope: 3.5, // Increased impact
          societal_focus: -2.0, // Stronger societal good focus
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Balanced Approach: Regulation with Consideration for Economic Impact",
        value: "balanced_regulation_economic_consideration",
        ideologyEffect: {
          // Original: eco: 0.5, scope: 0.5
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.5, // Remains moderate
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5, // Remains moderate
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Reduce Regulations to Promote Business Growth and Encourage Innovation",
        value: "reduce_regulation_business_growth",
        ideologyEffect: {
          // Original: econ: 3.0, eco: -3.5, scope: -3.0
          economic: 3.5, // Increased impact
          social_traditionalism: 0.5,
          sovereignty: 0.5,
          ecology: -3.8, // Increased impact
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 2.0, // Stronger business liberty focus
          authority_structure: -1.0,
          state_intervention_scope: -3.5, // Increased impact
          societal_focus: 2.5, // Stronger individual/market focus
          rural_priority: -0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Invest in Carbon Capture Technologies and Market-Based Environmental Solutions",
        value: "carbon_capture_market_solutions",
        ideologyEffect: {
          // Original: econ: 1.0, eco: -1.0, digital: 2.0
          economic: 1.5, // Clearer market preference
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: -0.5, // Tech solution, less directly regulatory, might be slightly less effective than strict regs or reflect development focus
          theocratic: 0.0,
          digitalization: 2.5, // Stronger tech focus
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: -0.5, // Less intervention than direct regulation
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "climate_change_agreements",
    category: "Environment",
    questionText:
      "Should the country participate actively in major international climate agreements?",
    options: [
      {
        text: "Yes, and Vigorously Pursue Agreement Goals with National Policies",
        value: "yes_pursue_climate_goals_vigorously",
        ideologyEffect: {
          // Original: econ: -2.5, sovereignty: -3.5, eco: 4.0, scope: 2.5
          economic: -3.0, // Strong commitment means economic shifts
          social_traditionalism: -1.0, // Progressive stance
          sovereignty: -3.8, // Stronger internationalism
          ecology: 4.0, // Max ecological focus
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: -2.0, // National policies might restrict choices
          authority_structure: 1.0,
          state_intervention_scope: 3.0, // Strong national policies
          societal_focus: -2.5, // Global collective good
          rural_priority: 0.0,
          governance_approach: -1.5, // International institutionalism
        },
      },
      {
        text: "Yes, but with Flexibility, Prioritizing National Economic Interests",
        value: "yes_climate_flexibility_national_interests",
        ideologyEffect: {
          // Original: econ: 0.5, sovereignty: 1.0, eco: 0.5
          economic: 1.0, // Clearer prioritization of economy
          social_traditionalism: 0.0,
          sovereignty: 1.5, // Clearer national interest
          ecology: 0.0, // Flexibility means less commitment to pure ecology
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "No, International Agreements Can Harm National Sovereignty or Economy",
        value: "no_climate_harm_sovereignty_economy",
        ideologyEffect: {
          // Original: econ: 2.0, sovereignty: 4.0, eco: -3.5
          economic: 2.5, // Stronger emphasis on national economy
          social_traditionalism: 0.5, // Can be a traditionalist/skeptic stance
          sovereignty: 4.0, // Max nationalism
          ecology: -3.8, // Strong development focus
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: -1.5, // Less state interference due to intl. agreements
          societal_focus: 2.0, // National interest/individual businesses
          rural_priority: 0.0,
          governance_approach: 1.5, // Can be populist
        },
      },
      {
        text: "Focus on National Solutions to Climate Change, Independent of International Pacts",
        value: "national_solutions_climate_independent",
        ideologyEffect: {
          // Original: sovereignty: 2.5, eco: -1.0, scope: 1.0
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 3.0, // Stronger national focus
          ecology: -0.5, // National solutions might be less ambitious or different priorities
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: 0.5,
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
    ],
  },
  {
    id: "wilderness_conservation_public_lands_use",
    category: "Environment",
    questionText:
      "How should wilderness areas and public lands be managed and protected?",
    options: [
      {
        text: "Designate More Public Lands as Protected Wilderness Areas, Restricting Commercial Development and Motorized Access",
        value:
          "designate_more_protected_wilderness_restrict_commercial_development_motorized_access",
        ideologyEffect: {
          // Original: econ: -2, eco: 3, scope: 2, liberty: -1
          economic: -2.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 3.8, // Max protection
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.5, // Stronger restriction on access/use
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state restriction
          societal_focus: -2.0,
          rural_priority: -0.5, // Can restrict rural economic activity
          governance_approach: 0,
        },
      },
      {
        text: "Balance Conservation with Multiple Uses of Public Lands, Including Sustainable Resource Extraction, Recreation, and Grazing",
        value:
          "balance_conservation_multiple_uses_public_lands_extraction_recreation_grazing",
        ideologyEffect: {
          // Remains moderate
          economic: 1.0,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: 0,
          state_intervention_scope: 0.0,
          societal_focus: 0.5,
          rural_priority: 0.5, // Multiple uses can benefit rural
          governance_approach: 0,
        },
      },
      {
        text: "Increase Funding for National Parks and Public Land Management to Improve Maintenance, Access, and Conservation Efforts",
        value:
          "increase_funding_national_parks_public_land_management_maintenance_conservation",
        ideologyEffect: {
          // Original: econ: -1, eco: 1.5, scope: 1, societal: -1
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 2.0, // Clearer conservation funding
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Transfer Some Public Lands to Regional or Private Ownership to Allow for More Efficient Management or Economic Development",
        value:
          "transfer_public_lands_regional_private_ownership_efficient_management_development",
        ideologyEffect: {
          // Original: econ: 2, eco: -2, scope: -3, authority: -2, societal: 2
          economic: 2.8, // Stronger L-F for land
          social_traditionalism: 1.0, // Pro-private property
          sovereignty: -0.5, // If to regional, less central; if to private, different impact
          ecology: -2.8, // Stronger potential for development over conservation
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -2.5, // Stronger decentralization/privatization
          state_intervention_scope: -3.5, // Max reduction in national state ownership
          societal_focus: 2.5,
          rural_priority: 0.0, // Could be positive or negative for specific rural areas
          governance_approach: 0.5,
        },
      },
    ],
  },
  {
    id: "ocean_health_fisheries_management",
    category: "Environment",
    questionText:
      "How should ocean health, marine biodiversity, and sustainable fisheries be managed?",
    options: [
      {
        text: "Expand Marine Protected Areas, Implement Strict Catch Limits based on Science, and Combat Illegal Fishing Vigorously",
        value:
          "expand_marine_protected_areas_strict_catch_limits_combat_illegal_fishing",
        ideologyEffect: {
          // Original: econ: -1, eco: 3, authority: 1, scope: 2, governance: -1
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0.5, // National enforcement
          ecology: 3.8, // Max eco protection
          theocratic: 0,
          digitalization: 0.5, // Science-based limits, tech for enforcement
          personal_liberty: -1.0, // Restrictions on fishing
          authority_structure: 1.5,
          state_intervention_scope: 2.8, // Stronger state action
          societal_focus: -1.5,
          rural_priority: -0.5, // Can impact coastal communities
          governance_approach: -1.0,
        },
      },
      {
        text: "Invest in Aquaculture and Sustainable Fishing Technologies to Reduce Pressure on Wild Fish Stocks",
        value:
          "invest_aquaculture_sustainable_fishing_technologies_reduce_pressure_wild_stocks",
        ideologyEffect: {
          // Original: eco: 1.5, digital: 1
          economic: -0.5, // Investment can be public
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 2.0, // Clearer positive eco impact
          theocratic: 0,
          digitalization: 1.8, // Stronger tech focus
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.8, // State R&D or incentives
          societal_focus: -0.5,
          rural_priority: 0.5, // Aquaculture can be rural
          governance_approach: -0.5,
        },
      },
      {
        text: "Prioritize the Economic Viability of Fishing Industries and Coastal Communities, Balancing with Conservation Goals",
        value:
          "prioritize_economic_viability_fishing_industries_coastal_communities_balance_conservation",
        ideologyEffect: {
          // Original: econ: 2, eco: -1, societal: 1, rural: 1
          economic: 2.5, // Stronger pro-industry
          social_traditionalism: 0.5,
          sovereignty: 0.5,
          ecology: -1.5, // Clearer de-prioritization of conservation
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: 0,
          state_intervention_scope: -0.5, // Less state intervention for conservation
          societal_focus: 1.5,
          rural_priority: 1.5, // Stronger coastal/rural community economic focus
          governance_approach: 0,
        },
      },
      {
        text: "Strengthen International Cooperation and Agreements for Managing Shared Fish Stocks and Protecting High Seas Biodiversity",
        value:
          "strengthen_international_cooperation_managing_shared_fish_stocks_high_seas_biodiversity",
        ideologyEffect: {
          // Original: sovereignty: -3, eco: 2, governance: -2
          economic: 0,
          social_traditionalism: 0,
          sovereignty: -3.5, // Max internationalism
          ecology: 2.5, // Strong eco via intl. means
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -1.0, // Ceding to intl. bodies
          state_intervention_scope: 0.5, // State participating in intl. agreements
          societal_focus: -1.0, // Global collective good
          rural_priority: 0,
          governance_approach: -2.5, // Strong institutionalism
        },
      },
    ],
  },
  {
    id: "water_resource_management_global", // From Amplification Batch 3
    category: "Environment",
    questionText:
      "How should national water resources be managed amidst growing scarcity?",
    options: [
      {
        text: "Prioritize Conservation, Water Recycling, and Sustainable Use Technologies",
        value: "prioritize_water_conservation_recycling_sustainable_use",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -1.0,
          sovereignty: -0.5,
          ecology: 4.0, // Max ecological focus
          theocratic: 0.0,
          digitalization: 2.5,
          personal_liberty: -1.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.8,
          societal_focus: -1.8,
          rural_priority: 0.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "Invest in Large-Scale Water Infrastructure (e.g., Desalination, Reservoirs) to Increase Supply",
        value: "invest_large_scale_water_infrastructure_supply",
        ideologyEffect: {
          economic: -0.5, // Shifted from positive as these are often public or heavily state-backed
          social_traditionalism: 0.5,
          sovereignty: 0.8,
          ecology: -2.8, // Stronger negative eco footprint
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: 0.0,
          authority_structure: 1.8,
          state_intervention_scope: 2.5, // Major state project
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Implement Market-Based Solutions for Water Allocation (e.g., Water Trading, Pricing)",
        value: "market_based_water_allocation_trading_pricing",
        ideologyEffect: {
          economic: 3.5, // Stronger L-F for water
          social_traditionalism: 1.0,
          sovereignty: 0.0,
          ecology: -2.5, // Stronger negative eco if market ignores conservation
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 1.8,
          authority_structure: -1.8,
          state_intervention_scope: -2.8, // Max minimal state role
          societal_focus: 2.8,
          rural_priority: -1.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Strengthen National Regulations to Protect Water Quality and Aquatic Ecosystems",
        value: "strengthen_national_water_quality_regulations_ecosystems",
        ideologyEffect: {
          economic: -1.5,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 2.8, // Stronger eco regulation
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5,
          authority_structure: 1.5,
          state_intervention_scope: 2.5, // Stronger state regulatory role
          societal_focus: -1.8,
          rural_priority: 0.5,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "sustainable_agriculture_food_systems",
    category: "Environment", // Or Agriculture & Rural Development
    questionText:
      "How should the transition to more sustainable agriculture and food systems be promoted?",
    options: [
      {
        text: "Provide Substantial Financial Incentives, Technical Assistance, and Research Funding for Farmers Adopting Sustainable and Regenerative Practices",
        value:
          "incentives_assistance_research_sustainable_regenerative_farming",
        ideologyEffect: {
          economic: -2.8,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 3.0,
          theocratic: 0,
          digitalization: 0.5,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 2.8,
          societal_focus: -1.5,
          rural_priority: 1.5,
          governance_approach: 0,
        },
      },
      {
        text: "Implement Stricter Regulations on Pesticide Use, Fertilizer Runoff, Water Usage, and Monoculture Farming",
        value:
          "regulate_pesticides_fertilizers_water_use_monoculture_stringently",
        ideologyEffect: {
          economic: -2.8,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 3.8,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.8,
          authority_structure: 2.5,
          state_intervention_scope: 3.8,
          societal_focus: -2.0,
          rural_priority: -0.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "Promote Consumer Demand for Sustainably Produced Food through Labeling, Education, and Support for Organic/Eco-Friendly Products",
        value:
          "promote_consumer_demand_sustainable_food_labeling_education_organic",
        ideologyEffect: {
          economic: 0.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 2.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -1.0,
          state_intervention_scope: -0.5,
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: 1.8,
        },
      },
      {
        text: "Focus on Technological Innovation in Agriculture (e.g., Precision Farming, GMOs for Resilience) to Increase Efficiency and Reduce Environmental Impact",
        value: "tech_innovation_agriculture_precision_farming_gmos_efficiency",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.0,
          theocratic: 0,
          digitalization: 2.8,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.0,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
    ],
  },
];
