export const FOREIGN_POLICY_AND_DEFENSE_QUESTIONS = [
  {
    id: "defense_spending_priorities",
    category: "Foreign Policy & Defense",
    questionText: "What is your view on national defense spending?",
    options: [
      {
        text: "Significantly Increase Defense Spending to Ensure Global Military Superiority",
        value: "significantly_increase_defense_spending_superiority",
        ideologyEffect: {
          // Original: econ: 1.5, social_trad: 2.0, sovereignty: 3.5, eco: -2.0, liberty: -1.5, authority: 2.5, scope: 3.0
          economic: 2.0, // Stronger economic impact
          social_traditionalism: 2.5,
          sovereignty: 3.8, // Stronger
          ecology: -2.5, // Stronger negative eco impact
          theocratic: 0.0,
          digitalization: 2.0,
          personal_liberty: -2.0, // Stronger impact on liberty
          authority_structure: 3.0, // Stronger centralization
          state_intervention_scope: 3.5, // Stronger state role
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Maintain Current Levels, Focus on Modernization, Readiness, and Technological Edge",
        value: "maintain_current_defense_modernization_readiness",
        ideologyEffect: {
          // Original: social_trad: 0.5, sovereignty: 0.5, digital: 1.0, scope: 1.0
          economic: 0.0,
          social_traditionalism: 0.8,
          sovereignty: 0.8,
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: 1.5, // Stronger tech edge
          personal_liberty: -0.5,
          authority_structure: 0.8,
          state_intervention_scope: 1.2,
          societal_focus: 0.0,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Reduce Defense Spending, Focus Resources on Diplomacy and Domestic Needs",
        value: "reduce_defense_spending_diplomacy_domestic",
        ideologyEffect: {
          // Original: econ: -1.5, social_trad: -2.5, sovereignty: -3.0, liberty: 2.0, authority: -2.5, scope: -2.0
          economic: -2.0, // Stronger reallocation effect
          social_traditionalism: -3.0, // Stronger anti-militarist
          sovereignty: -3.5, // Stronger internationalist/less military power
          ecology: 0.8, // Clearer eco benefit
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: 2.5, // Clearer increase in liberty (less state coercion)
          authority_structure: -3.0, // Stronger reduction in military influence
          state_intervention_scope: -2.5, // Stronger reduction in military state power
          societal_focus: -2.0, // Stronger domestic welfare focus
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Reallocate Defense Funds to Non-Military Security Threats (e.g., Cybersecurity, Climate Resilience, Pandemic Preparedness)",
        value: "reallocate_defense_non_military_security",
        ideologyEffect: {
          // Original: econ: -1.0, social_trad: -2.0, sovereignty: -1.5, eco: 2.5, digital: 1.5
          economic: -1.5,
          social_traditionalism: -2.5, // Stronger progressive redefinition
          sovereignty: -2.0,
          ecology: 3.0, // Stronger direct eco security focus
          theocratic: 0.0,
          digitalization: 2.0, // Stronger cybersecurity focus
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: 0.5,
          societal_focus: -2.0, // Stronger broad societal well-being focus
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "foreign_aid_international_development",
    category: "Foreign Policy & Defense",
    questionText:
      "What is your approach to foreign aid and international development?",
    options: [
      {
        text: "Significantly Increase Foreign Aid and Actively Participate in Global Development Initiatives",
        value: "increase_foreign_aid_global_development_initiatives",
        ideologyEffect: {
          // Original: econ: -2.0, social_trad: -2.5, sovereignty: -3.5, societal: -2.5
          economic: -2.5,
          social_traditionalism: -3.0, // Strong internationalist/humanitarian
          sovereignty: -3.8, // Max international cooperation
          ecology: 1.0, // Aid can be eco-focused
          theocratic: -0.5,
          digitalization: 0.5,
          personal_liberty: -1.0, // Taxpayer funds
          authority_structure: -1.0,
          state_intervention_scope: 2.0, // State administers aid
          societal_focus: -3.0, // Strong global collectivism
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Focus Foreign Aid on Strategic Interests and Countries Aligned with National Values",
        value: "foreign_aid_strategic_interests_aligned_values",
        ideologyEffect: {
          // Original: econ: 0.5, social_trad: 1.0, sovereignty: 2.0, societal: 1.0
          economic: 0.8,
          social_traditionalism: 1.5,
          sovereignty: 2.5, // Stronger national interest focus
          ecology: 0.0,
          theocratic: 0.5,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Reduce Foreign Aid; Prioritize Domestic Needs and Encourage Private International Charity",
        value: "reduce_foreign_aid_prioritize_domestic_private_charity",
        ideologyEffect: {
          // Original: econ: 1.5, social_trad: 0.5, sovereignty: 3.0, societal: 2.5
          economic: 2.0,
          social_traditionalism: 0.8,
          sovereignty: 3.5, // Strong "nation first"
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0, // Less tax for foreign aid
          authority_structure: -0.5,
          state_intervention_scope: -2.0, // Less state spending abroad
          societal_focus: 3.0, // Strong domestic/individual focus
          rural_priority: 0.0,
          governance_approach: 1.0, // Can be populist
        },
      },
      {
        text: "Condition Aid on Human Rights, Democracy, and Good Governance in Recipient Countries",
        value: "condition_aid_human_rights_democracy_governance",
        ideologyEffect: {
          // Original: social_trad: -1.5, sovereignty: -0.5, liberty: 1.0, authority: 0.5
          economic: -0.5,
          social_traditionalism: -2.0, // Promoting liberal values abroad
          sovereignty: -1.0, // Interventionist foreign policy
          ecology: 0.0,
          theocratic: -1.0, // Promoting secular democracy
          digitalization: 0.0,
          personal_liberty: 0.0, // Complex effects
          authority_structure: 0.8, // Using aid as leverage
          state_intervention_scope: 1.5,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "military_alliances_collective_security",
    category: "Foreign Policy & Defense",
    questionText:
      "What should be the nation's approach to major military alliances and collective security agreements?",
    options: [
      {
        text: "Strengthen and Potentially Expand Alliances to Counter Global Threats and Ensure Collective Security",
        value: "strengthen_expand_military_alliances_collective_security",
        ideologyEffect: {
          // Original: sovereignty: -3, governance: -2
          economic: 0,
          social_traditionalism: 0,
          sovereignty: -3.5, // Stronger internationalism
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.5, // Alliance commitments are state action
          societal_focus: -1.0, // Global collective security
          rural_priority: 0,
          governance_approach: -2.5, // Strong institutionalism
        },
      },
      {
        text: "Maintain Existing Alliances but Demand Greater Burden-Sharing and Contributions from Allies",
        value: "maintain_alliances_demand_greater_burden_sharing_contributions",
        ideologyEffect: {
          // Original: sovereignty: 0, governance: -1
          economic: 0.5, // Potential economic benefit from burden sharing
          social_traditionalism: 0,
          sovereignty: 0.5, // Nationalist tilt on burden sharing
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0,
          societal_focus: 0.5, // National interest focus
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Reduce Reliance on Formal Alliances, Focus on Flexible Coalitions and National Defense Capabilities",
        value: "reduce_reliance_alliances_flexible_coalitions_national_defense",
        ideologyEffect: {
          // Original: sovereignty: 3, governance: 1
          economic: 0,
          social_traditionalism: 0,
          sovereignty: 3.5, // Stronger nationalism/self-reliance
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.0, // Strong national defense
          state_intervention_scope: 1.0, // Investment in national defense
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 1.5, // Less institutional, more ad-hoc/national will
        },
      },
      {
        text: "Re-evaluate All Alliances Based on Current Geopolitical Realities and National Strategic Interests",
        value: "reevaluate_alliances_geopolitical_realities_national_interests",
        ideologyEffect: {
          // Original: sovereignty: 1, governance: 0
          economic: 0,
          social_traditionalism: 0,
          sovereignty: 1.5, // Clearer national interest focus
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: -0.5, // Pragmatic institutional
        },
      },
    ],
  },
  {
    id: "foreign_intervention_sovereignty_policy",
    category: "Foreign Policy & Defense",
    questionText:
      "What should guide the nation's policy on military intervention in other countries' affairs?",
    options: [
      {
        text: "Intervene Proactively to Promote Democracy, Human Rights, or Prevent Humanitarian Crises, Even Unilaterally if Necessary",
        value:
          "proactive_intervention_democracy_human_rights_humanitarian_crises",
        ideologyEffect: {
          // Original: social_trad: -2, sovereignty: -2, scope: 1, authority: 1, societal: -1
          economic: -1.0, // Cost of intervention
          social_traditionalism: -2.5, // Strong progressive ideal externally
          sovereignty: -2.5, // Strong interventionism
          ecology: -1.0, // Military action rarely eco-friendly
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // For own citizens if conscription/high taxes
          authority_structure: 1.5, // Requires strong executive for intervention
          state_intervention_scope: 2.0, // Major state action
          societal_focus: -1.5, // Promoting universal values (collectivist ideal)
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Selective Engagement: Intervene Militarily Only When Vital National Security Interests are Directly Threatened, Preferably with International Support",
        value:
          "selective_engagement_vital_national_security_interests_international_support",
        ideologyEffect: {
          // Original: sovereignty: 1
          economic: 0,
          social_traditionalism: 0.5, // Pragmatic/realist
          sovereignty: 1.5, // Clear national interest
          ecology: -0.5,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 0.5,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Principled Non-Interventionism: Focus on Domestic Priorities and National Defense, Avoid Foreign Military Entanglements",
        value:
          "non_interventionism_domestic_priorities_avoid_foreign_entanglements",
        ideologyEffect: {
          // Original: sovereignty: 3, scope: -2, governance: 2
          economic: 0.5, // Domestic focus implies some reallocation
          social_traditionalism: 0,
          sovereignty: 3.8, // Max non-interventionism/national focus
          ecology: 0.5, // Less foreign military eco impact
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: -2.5, // Strong reduction in foreign intervention scope
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 2.5, // Strong populist "nation first" appeal
        },
      },
      {
        text: "Prioritize Diplomacy, Economic Sanctions, and Soft Power; Use Military Force Only as a Last Resort under International Law",
        value: "prioritize_diplomacy_sanctions_soft_power_military_last_resort",
        ideologyEffect: {
          // Original: social_trad: -1, sovereignty: -2, authority: -1, governance: -2
          economic: -0.5, // Sanctions can have economic costs
          social_traditionalism: -1.5,
          sovereignty: -2.5, // Strong intl. law/diplomacy focus
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5,
          authority_structure: -1.5,
          state_intervention_scope: -0.5, // Less military intervention
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -2.5, // Strong institutional/diplomatic
        },
      },
    ],
  },
  {
    id: "public_funding_arts_culture_heritage",
    category: "Arts & Culture",
    questionText:
      "What is your stance on public (government) funding for the arts, culture, and national heritage?",
    options: [
      {
        text: "Significantly Increase Public Funding for Arts, Culture, and Heritage Preservation as Essential for Society",
        value:
          "significantly_increase_public_funding_arts_culture_heritage_essential",
        ideologyEffect: {
          // Original: econ: -2, social_trad: -1, scope: 2, societal: -2
          economic: -2.5, // Stronger public funding
          social_traditionalism: -1.5, // Arts often seen as progressive/diverse
          sovereignty: 0.5, // National heritage aspect
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 2.5, // Stronger state role
          societal_focus: -2.5, // Stronger collective good argument
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Maintain Modest Public Funding, Focusing on Supporting Community Arts, Cultural Diversity, and Access for Underserved Groups",
        value:
          "modest_public_funding_community_arts_cultural_diversity_access_underserved",
        ideologyEffect: {
          // Original: econ: -1, social_trad: -1, authority: -1, scope: 1, societal: -1
          economic: -1.0,
          social_traditionalism: -1.5, // Focus on diversity
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -1.0, // Community arts focus
          state_intervention_scope: 1.0,
          societal_focus: -1.5,
          rural_priority: 0.5, // Community arts can be rural
          governance_approach: 0.5,
        },
      },
      {
        text: "Reduce or Eliminate Public Funding for Arts and Culture; Rely on Private Donations, Philanthropy, and Market Support",
        value:
          "reduce_eliminate_public_funding_arts_culture_rely_private_donations_market",
        ideologyEffect: {
          // Original: econ: 3, scope: -3, societal: 2
          economic: 3.5, // Max L-F for arts
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0, // Freedom from taxation for arts
          authority_structure: 0,
          state_intervention_scope: -3.5, // Max anti-state funding
          societal_focus: 2.5, // Strong individual/private support
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Public Funding Should Prioritize Preservation of National Heritage and Historical Sites over Contemporary Arts",
        value:
          "public_funding_prioritize_national_heritage_historical_sites_over_contemporary_arts",
        ideologyEffect: {
          // Original: social_trad: 2, sovereignty: 1, econ: -0.5, scope: 1
          economic: -0.8,
          social_traditionalism: 2.5, // Strong traditional heritage focus
          sovereignty: 1.5, // Strong national heritage
          ecology: 0,
          theocratic: 0.5, // Heritage often has religious links
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: 0.0, // National > contemporary
          rural_priority: 0.5, // Historical sites often rural
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "international_arms_sales_export_policy",
    category: "Foreign Policy & Defense",
    questionText:
      "What principles should guide the nation's policy on international arms sales and exports?",
    options: [
      {
        text: "Strictly Limit Arms Sales to Countries with Poor Human Rights Records or Those Involved in Active Conflicts",
        value: "strictly_limit_arms_sales_human_rights_conflict_zones",
        ideologyEffect: {
          // Original: econ: -1, social_trad: -2, sovereignty: -2, scope: 1, societal: -1, governance: 1
          economic: -1.5,
          social_traditionalism: -2.5, // Stronger progressive/human rights stance
          sovereignty: -2.5, // Stronger internationalist/humanitarian limit
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // State actively limiting sales
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Use Arms Sales as a Tool of Foreign Policy to Support Allies, Deter Adversaries, and Maintain Regional Stability",
        value:
          "arms_sales_foreign_policy_tool_support_allies_deter_adversaries_stability",
        ideologyEffect: {
          // Original: econ: 1, social_trad: 1, sovereignty: 2, authority: 1, governance: -2
          economic: 1.0,
          social_traditionalism: 1.5, // More traditional power politics
          sovereignty: 2.8, // Stronger nationalist/strategic use
          ecology: -0.5, // Arms sales can fuel conflict with eco impact
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.5, // Stronger state control over FP tool
          state_intervention_scope: 0.5,
          societal_focus: 0.5,
          rural_priority: 0,
          governance_approach: -2.5, // Stronger elitist/institutional FP
        },
      },
      {
        text: "Prioritize Economic Benefits and Domestic Job Creation from Arms Exports, Within Legal International Frameworks",
        value:
          "prioritize_economic_benefits_job_creation_arms_exports_legal_frameworks",
        ideologyEffect: {
          // Original: econ: 2, sovereignty: 1, societal: 1
          economic: 2.8, // Stronger economic benefit focus
          social_traditionalism: 0.5,
          sovereignty: 1.0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0,
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Advocate for Stronger International Treaties and Transparency in Global Arms Trade to Reduce Illicit Trafficking",
        value:
          "stronger_international_treaties_transparency_global_arms_trade_reduce_trafficking",
        ideologyEffect: {
          // Original: social_trad: -1, sovereignty: -2, governance: -1
          economic: -0.5,
          social_traditionalism: -1.5,
          sovereignty: -2.8, // Stronger internationalist treaty focus
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: -0.5,
          state_intervention_scope: 0, // Focus on intl agreements
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -1.5,
        },
      },
    ],
  },
  {
    id: "international_aid_allocation", // From Amplification Batch 2
    category: "Foreign Policy & Defense",
    questionText:
      "How should national foreign aid be allocated and prioritized?",
    options: [
      {
        text: "Increase Foreign Aid Substantially, Focusing on Humanitarian Needs, Poverty Reduction, and Global Health",
        value: "increase_aid_humanitarian_poverty_global_health",
        ideologyEffect: {
          economic: -2.0, // Cost of aid
          social_traditionalism: -2.0,
          sovereignty: -2.5, // Strong internationalist/humanitarian focus
          ecology: 0.5,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // Taxpayer funding
          authority_structure: -0.5,
          state_intervention_scope: 1.5, // State administering aid
          societal_focus: -2.5, // Strong global collectivism
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Focus Foreign Aid Primarily on Promoting National Strategic Interests and Supporting Key Allies",
        value: "aid_strategic_national_interests",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.5,
          sovereignty: 2.5, // Strong national interest focus
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 0.5,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Reduce Overall Foreign Aid; Prioritize Domestic Needs and Encourage Private Charitable Giving Internationally",
        value: "reduce_foreign_aid_prioritize_domestic_private_charity",
        ideologyEffect: {
          economic: 1.5, // Less government spending
          social_traditionalism: 0.0,
          sovereignty: 2.0, // "Nation first"
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0, // Less tax for foreign aid
          authority_structure: -0.5,
          state_intervention_scope: -2.5, // Strong reduction in state foreign aid
          societal_focus: 2.0, // Focus on domestic/private
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Condition Foreign Aid on Recipient Countries' Adherence to Human Rights, Democracy, and Good Governance Standards",
        value: "condition_aid_human_rights_democracy_governance",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: -1.5, // Promoting liberal values
          sovereignty: -0.5, // Interventionist but with conditions
          ecology: 0,
          theocratic: -1.0, // Promoting secular democracy
          digitalization: 0,
          personal_liberty: 0.0, // Complex effects
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "nuclear_weapons_policy", // From Amplification Batch 2
    category: "Foreign Policy & Defense",
    questionText: "What should be the nation's policy on nuclear weapons?",
    options: [
      {
        text: "Maintain and Modernize Nuclear Deterrent; Consider Expanding Capabilities if Necessary",
        value: "modernize_expand_nuclear_capabilities",
        ideologyEffect: {
          economic: -1.5, // High cost
          social_traditionalism: 1.5, // Traditional power projection
          sovereignty: 2.8, // Strong national defense
          ecology: -2.0, // Significant environmental risk/impact
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: -1.0,
          authority_structure: 2.0,
          state_intervention_scope: 2.0,
          societal_focus: 1.0, // National security
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Pursue International Treaties for Gradual Global Nuclear Disarmament",
        value: "pursue_disarmament_strengthen_non_proliferation",
        ideologyEffect: {
          economic: 0.5, // Peace dividend
          social_traditionalism: -2.0, // Progressive anti-nuclear
          sovereignty: -3.0, // Strong internationalism
          ecology: 2.0, // Major ecological benefit
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.0,
          authority_structure: -1.0,
          state_intervention_scope: -1.0,
          societal_focus: -2.0, // Global peace
          rural_priority: 0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Maintain a Credible Minimum Deterrent; Oppose Further Proliferation",
        value: "maintain_minimum_deterrent_oppose_proliferation",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: 0.0,
          sovereignty: 1.0,
          ecology: 0.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 0.5,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Advocate for Unilateral National Nuclear Disarmament to Set a Global Example",
        value: "advocate_unilateral_national_nuclear_disarmament",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: -3.5, // Highly progressive/idealistic
          sovereignty: -2.5, // Could be seen as weakening national sovereignty by some, but internationalist ideal
          ecology: 3.0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -1.5,
          state_intervention_scope: -2.0, // Disarming is a state action reducing military scope
          societal_focus: -2.5,
          rural_priority: 0,
          governance_approach: 1.0, // Can be populist/idealist moral stance
        },
      },
    ],
  },
  {
    id: "foreign_policy_assertive_powers", // From Amplification Batch 1
    category: "Foreign Policy & Defense",
    questionText:
      "What should be the approach to relations with assertive global powers?",
    options: [
      {
        text: "Confrontational Stance: Counter Their Economic and Military Assertiveness Directly",
        value: "confrontational_assertive_powers",
        ideologyEffect: {
          economic: -0.5, // Confrontation can have economic costs
          social_traditionalism: 1.5,
          sovereignty: 3.8, // Max assertion of national dominance
          ecology: -0.8,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: -1.0,
          authority_structure: 2.5, // Stronger central leadership
          state_intervention_scope: 2.8,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Competitive Coexistence: Cooperate on Shared Global Issues, Compete Robustly Elsewhere",
        value: "competitive_coexistence_assertive_powers",
        ideologyEffect: {
          // Remains moderate
          economic: 0.5,
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
          governance_approach: -1.0,
        },
      },
      {
        text: "Engagement and Diplomacy: Seek Deeper Economic and Political Ties to Foster Cooperation",
        value: "engagement_diplomacy_assertive_powers",
        ideologyEffect: {
          economic: 1.0,
          social_traditionalism: -1.8, // Stronger progressive view of international relations
          sovereignty: -3.8, // Max international engagement
          ecology: 0.8,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: -1.8,
          state_intervention_scope: -1.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.8, // Stronger diplomatic/institutional
        },
      },
      {
        text: "Form Strong Alliances with Like-Minded Nations to Balance Their Influence",
        value: "alliances_balance_assertive_powers",
        ideologyEffect: {
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: -1.8, // Alliance implies clearer shared sovereignty
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.0,
          state_intervention_scope: 0.8, // Maintaining alliances needs state effort
          societal_focus: -0.5,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
];
