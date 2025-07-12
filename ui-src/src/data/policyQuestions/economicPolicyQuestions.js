export const ECONOMIC_POLICY_QUESTIONS = [
  {
    id: "taxation_wealth",
    category: "Economy",
    questionText: "How should wealth and high incomes be taxed?",
    options: [
      {
        text: "Significantly Increase Taxes on Wealth and High Incomes",
        value: "increase_wealth_tax",
        ideologyEffect: {
          // Original: econ: -3.5, scope: 3.0, societal: -2.0
          economic: -3.8, // Stronger push
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: 0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -2.0, // Stronger impact on economic liberty
          authority_structure: 0.5, // State power to tax
          state_intervention_scope: 3.5, // Stronger push
          societal_focus: -2.5, // Stronger push for redistribution
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Moderate Tax Increases for Top Earners and Capital Gains",
        value: "moderate_increase_top",
        ideologyEffect: {
          // Original: econ: -1.5, scope: 1.0, societal: -1.0
          economic: -1.8, // Slightly stronger
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.8,
          authority_structure: 0.0,
          state_intervention_scope: 1.2,
          societal_focus: -1.2,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Keep Current Tax Levels, Focus on Economic Growth to Increase Revenue",
        value: "status_quo_growth",
        ideologyEffect: {
          // Original: econ: 1.0, scope: -0.5, societal: 0.5
          economic: 1.5, // Clearer pro-growth/less tax emphasis
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: -0.8,
          societal_focus: 0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Cut Taxes Across The Board, Especially for Businesses and Investors",
        value: "cut_taxes_corps",
        ideologyEffect: {
          economic: 3.8,
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 2.0,
          authority_structure: -0.5,
          state_intervention_scope: -3.5,
          societal_focus: 2.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "minimum_wage",
    category: "Economy",
    questionText: "What is your position on the national minimum wage?",
    options: [
      {
        text: "Raise to a Living Wage, Indexed to Inflation",
        value: "raise_living_wage_inflation_indexed",
        ideologyEffect: {
          // Original: econ: -3.0, scope: 2.0, societal: -1.5
          economic: -3.5, // Stronger impact
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // Impact on employer freedom
          authority_structure: 0.5,
          state_intervention_scope: 2.5, // Stronger state mandate
          societal_focus: -2.5, // Stronger collectivist push
          rural_priority: 0.0,
          governance_approach: 0.0,
        },
      },
      {
        text: "Moderate Increase and Allow Regional Governments to Set Higher Minimums",
        value: "moderate_increase_regional_higher",
        ideologyEffect: {
          // Original: econ: -1.0, authority: -1.0, scope: 0.5
          economic: -1.5, // Clearer moderate collectivist
          social_traditionalism: 0,
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -0.5,
          authority_structure: -1.5, // Stronger regional autonomy
          state_intervention_scope: 0.8, // Still some national role
          societal_focus: -0.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Keep at Current Level or Eliminate National Minimum Wage, Rely on Market Forces",
        value: "keep_or_eliminate_national_minimum",
        ideologyEffect: {
          // Original: econ: 3.5, scope: -3.0, societal: 2.5
          economic: 3.8, // Stronger impact
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5, // Stronger emphasis on market/employer freedom
          authority_structure: -1.0,
          state_intervention_scope: -3.5, // Stronger impact
          societal_focus: 3.0, // Stronger push
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Implement Regional Minimum Wages Based on Cost of Living",
        value: "regional_minimum_wages_cost_of_living",
        ideologyEffect: {
          // Original: authority: -1.0 (This is pragmatic, effects mostly on structure)
          economic: 0.0,
          social_traditionalism: 0.0,
          sovereignty: 0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: -2.5, // Significantly decentralized
          state_intervention_scope: -0.5, // Central govt sets framework for regional, not direct national wage
          societal_focus: 0.0,
          rural_priority: 0.5, // Regional variation could benefit some rural areas if wages are lower
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "trade_policy_global",
    category: "Economy",
    questionText:
      "What should be the nation's approach to international trade?",
    options: [
      {
        text: "Promote Free Trade Agreements with Minimal Tariffs and Barriers",
        value: "free_trade_minimal_tariffs_barriers",
        ideologyEffect: {
          // Original: econ: 4.0, sovereignty: -4.0, scope: -3.0
          economic: 4.0,
          social_traditionalism: -0.5,
          sovereignty: -4.0, // Max internationalism
          ecology: -2.0, // Stronger negative eco implication
          theocratic: 0.0,
          digitalization: 1.5,
          personal_liberty: 2.5,
          authority_structure: -2.0,
          state_intervention_scope: -3.5, // Minimal state interference
          societal_focus: 3.0, // Strong global market individualism
          rural_priority: -1.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "Use Tariffs and Trade Barriers Strategically to Protect Domestic Industries",
        value: "tariffs_trade_barriers_protect_domestic",
        ideologyEffect: {
          // Original: econ: -1.5, sovereignty: 3.8, scope: 2.5
          economic: -2.0, // Clearly anti-free market
          social_traditionalism: 1.0,
          sovereignty: 3.5, // Stronger national control
          ecology: 0.5,
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: -1.5,
          authority_structure: 1.0,
          state_intervention_scope: 3.0, // Stronger state role
          societal_focus: -1.5, // Stronger national collective interest
          rural_priority: 1.5,
          governance_approach: 1.5,
        },
      },
      {
        text: "Fair Trade: Prioritize Labor Rights and Environmental Standards in Trade Agreements",
        value: "fair_trade_labor_environmental_standards",
        ideologyEffect: {
          // Original: econ: -2.0, social_trad: -2.0, sovereignty: -2.5, eco: 2.5
          economic: -2.5,
          social_traditionalism: -2.5, // Stronger progressive
          sovereignty: -2.8, // Stronger intl. agreements
          ecology: 3.0, // Stronger eco priority
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0,
          authority_structure: -0.5,
          state_intervention_scope: 2.0, // State enforcing standards
          societal_focus: -2.5, // Stronger global collective good
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Reduce Reliance on Foreign Goods, Promote National Economic Self-Sufficiency",
        value: "reduce_reliance_foreign_goods_self_sufficiency",
        ideologyEffect: {
          // Original: econ: -2.0, sovereignty: 3.5, scope: 3.0
          economic: -2.5, // Autarky more interventionist
          social_traditionalism: 1.5,
          sovereignty: 3.8, // Stronger self-sufficiency
          ecology: 1.0,
          theocratic: 0.0,
          digitalization: -1.0,
          personal_liberty: -2.0, // Stronger limits on choice
          authority_structure: 2.0,
          state_intervention_scope: 3.5, // Stronger state control
          societal_focus: -2.0, // Stronger national collective
          rural_priority: 2.0, // Stronger rural focus for self-sufficiency
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "public_pension_systems",
    category: "Economy",
    questionText:
      "How should public pension systems (e.g., social security) be addressed for future solvency?",
    options: [
      {
        text: "Raise the Cap on Taxable Income and/or Increase Contribution Rates",
        value: "raise_cap_increase_contribution_pensions",
        ideologyEffect: {
          // Original: econ: -2.5, scope: 2.0, societal: -2.0
          economic: -3.0, // Stronger collectivist funding
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5, // Greater tax burden
          authority_structure: 0.5,
          state_intervention_scope: 2.5,
          societal_focus: -2.5, // Stronger collective responsibility
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Gradually Raise the Retirement Age for Full Pension Benefits",
        value: "raise_retirement_age_pensions",
        ideologyEffect: {
          // Original: econ: 1.0, social_trad: 1.5, societal: 1.0
          economic: 1.5, // Clearer reduction in state burden
          social_traditionalism: 2.0, // Stronger traditional work ethic emphasis
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // More impact on individual plans
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 1.5, // Stronger individual responsibility
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Adjust Cost-of-Living Increases (e.g., using alternative inflation measures)",
        value: "adjust_cola_pensions_alternative_inflation",
        ideologyEffect: {
          // Original: econ: 1.5, liberty: -0.8, societal: 1.0
          economic: 2.0, // Clearer reduction in payout
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: -1.0, // Clearer reduced benefit
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Consider Private Investment Accounts or Other Market-Based Reforms to Supplement Pensions",
        value: "private_accounts_market_reforms_pensions",
        ideologyEffect: {
          // Original: econ: 3.0, liberty: 2.5, scope: -3.0, societal: 3.5
          economic: 3.5, // Stronger L-F
          social_traditionalism: 2.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 3.0, // Stronger individual control
          authority_structure: -2.0, // Clearer shift from state
          state_intervention_scope: -3.5, // More significant reduction of state role
          societal_focus: 3.8, // Max individualism
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "financial_sector_stability_regulation",
    category: "Economy",
    questionText:
      "What is your stance on regulation of the financial sector to ensure stability and prevent crises?",
    options: [
      {
        text: "Strengthen and Expand Comprehensive Financial Regulations (e.g., higher capital requirements, stricter oversight of complex instruments)",
        value:
          "strengthen_expand_comprehensive_financial_regulations_stability",
        ideologyEffect: {
          // Original: econ: -2, scope: 3, authority: 2, societal: -1
          economic: -2.5, // Stronger intervention
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.5, // Limits on financial institutions
          authority_structure: 2.5, // Stronger regulatory bodies
          state_intervention_scope: 3.5, // Max state intervention
          societal_focus: -1.5, // Stronger collective protection
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Maintain Current Regulatory Frameworks, Ensuring Robust Enforcement and Monitoring of Systemic Risks",
        value:
          "maintain_current_financial_regulations_robust_enforcement_monitoring",
        ideologyEffect: {
          // Original: econ: -1, scope: 1, authority: 1
          economic: -1.0,
          social_traditionalism: 0.5, // Status quo stability
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 1.0,
          state_intervention_scope: 1.0,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Reform or Streamline Existing Regulations to Reduce Compliance Burdens on Financial Institutions and Promote Lending/Investment",
        value:
          "reform_streamline_financial_regulations_reduce_compliance_burdens",
        ideologyEffect: {
          // Original: econ: 3, scope: -2, authority: -1, societal: 2, liberty: 2
          economic: 3.5, // Stronger L-F
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Stronger freedom for institutions
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Stronger deregulation
          societal_focus: 2.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Strengthen Consumer Financial Protection Bodies and Mandate Greater Transparency in Financial Products",
        value:
          "strengthen_consumer_financial_protection_transparency_financial_products",
        ideologyEffect: {
          // Original: econ: -1.5, scope: 1.5, societal: -2, authority: 1, governance: 1
          economic: -2.0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5, // Consumer protection
          authority_structure: 1.5,
          state_intervention_scope: 2.0,
          societal_focus: -2.5, // Stronger consumer protection focus
          rural_priority: 0,
          governance_approach: 1.5, // Populist consumer protection
        },
      },
    ],
  },
  {
    id: "digital_currency_cryptocurrency_policy",
    category: "Economy",
    questionText:
      "How should cryptocurrencies, digital assets, and central bank digital currencies (CBDCs) be approached?",
    options: [
      {
        text: "Implement Comprehensive National Regulations for Cryptocurrencies to Protect Investors, Ensure Stability, and Combat Illicit Use",
        value:
          "comprehensive_crypto_regulation_investor_protection_stability_illicit_use",
        ideologyEffect: {
          // Original: digital: 1, econ: -1, scope: 2, authority: 2, liberty: -1
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0.5, // National regulations
          ecology: 0, // Could add small negative if thinking PoW
          theocratic: 0,
          digitalization: 0.5, // Regulating, not just promoting
          personal_liberty: -1.5, // Stronger restrictions
          authority_structure: 2.5,
          state_intervention_scope: 2.5, // Stronger state regulation
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Promote Innovation in Digital Assets with Minimal Regulation, Focusing Primarily on Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) Rules",
        value: "minimal_crypto_regulation_innovation_aml_ctf",
        ideologyEffect: {
          // Original: digital: 3, econ: 2, scope: -2, authority: -1, liberty: 2
          economic: 2.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 3.5, // Stronger pro-innovation
          personal_liberty: 2.5, // Stronger freedom for users/innovators
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Stronger minimal state
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Actively Develop and Pilot a National Central Bank Digital Currency (CBDC) to Modernize Payments",
        value: "develop_pilot_national_cbdc_modernize_payments",
        ideologyEffect: {
          // Original: digital: 2, econ: -1, scope: 2, authority: 3, liberty: -1, sovereignty: 1
          economic: -1.0,
          social_traditionalism: 0,
          sovereignty: 1.5, // Stronger national currency aspect
          ecology: 0,
          theocratic: 0,
          digitalization: 2.5, // State-led digital
          personal_liberty: -1.5, // Potential for surveillance
          authority_structure: 3.5, // Max state control over currency
          state_intervention_scope: 2.5,
          societal_focus: 0,
          rural_priority: 0,
          governance_approach: -1.5, // Technocratic/institutional
        },
      },
      {
        text: "Cautious Approach: Thoroughly Study Risks and Benefits Before Implementing CBDCs or Extensive Crypto Regulations",
        value: "cautious_approach_study_risks_benefits_cbdc_crypto_reg",
        ideologyEffect: {
          // Original: digital: -1
          economic: 0,
          social_traditionalism: 0.5, // Caution can be traditional
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: -1.5, // Stronger tech skepticism/caution
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
    id: "intellectual_property_pharmaceutical_access",
    category: "Economy",
    questionText:
      "How should intellectual property rights (e.g., patents for medicines) be balanced with access to essential goods like pharmaceuticals?",
    options: [
      {
        text: "Strengthen Intellectual Property Protections to Incentivize Innovation and Research, Even if it Means Higher Prices",
        value: "strengthen_ip_protections_incentivize_innovation_higher_prices",
        ideologyEffect: {
          // Original: econ: 2, digital: 1, scope: 1, societal: 2
          economic: 2.8, // Stronger L-F/pro-IP
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.0,
          personal_liberty: 0.5, // For innovators
          authority_structure: 0.5,
          state_intervention_scope: 1.5, // State enforces strong IP
          societal_focus: 2.5, // Stronger individual/corporate incentive
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Allow Compulsory Licensing or Government Use of Patents for Essential Medicines during Public Health Crises or for Affordability",
        value:
          "compulsory_licensing_government_use_patents_essential_medicines_health_crises",
        ideologyEffect: {
          // Original: econ: -2, authority: 1, scope: 2, societal: -2
          economic: -2.8, // Stronger collectivist intervention
          social_traditionalism: -1.0,
          sovereignty: 0.5, // National ability to override
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0, // Overrides patent holder liberty
          authority_structure: 1.5,
          state_intervention_scope: 2.5, // Stronger state power
          societal_focus: -2.8, // Stronger collective access focus
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Negotiate Tiered Pricing for Patented Medicines with Pharmaceutical Companies Based on Countries' Income Levels",
        value:
          "tiered_pricing_patented_medicines_based_on_country_income_levels",
        ideologyEffect: {
          // Original: econ: 0, sovereignty: -1, societal: -1, governance: -1
          economic: -0.5, // Managed market
          social_traditionalism: -0.5,
          sovereignty: -1.5, // International negotiation
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 0.5, // State role in negotiation
          societal_focus: -1.5, // Global equity focus
          rural_priority: 0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Promote Open-Source Research and Public Funding for Development of Essential Medicines to Reduce Reliance on Patents",
        value:
          "open_source_research_public_funding_essential_medicines_reduce_patent_reliance",
        ideologyEffect: {
          // Original: econ: -2, digital: 1, scope: 1, societal: -2, governance: 1
          economic: -2.5, // Strong collectivist funding/open-source
          social_traditionalism: -1.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: 1.8, // Stronger state role in R&D
          societal_focus: -2.5, // Strong focus on public good
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
    ],
  },
  {
    id: "corporate_social_responsibility_mandates",
    category: "Economy",
    questionText:
      "Should the government mandate or incentivize Corporate Social Responsibility (CSR) practices (e.g., environmental sustainability, ethical labor)?",
    options: [
      {
        text: "Mandate Minimum CSR Standards for All Large Corporations, with Penalties for Non-Compliance",
        value: "mandate_minimum_csr_standards_large_corporations_penalties",
        ideologyEffect: {
          // Original: econ: -2, eco: 1, liberty: -1, authority: 1, scope: 2, societal: -2
          economic: -2.5,
          social_traditionalism: -1.0, // Progressive stance on corporate behavior
          sovereignty: 0,
          ecology: 1.5, // Stronger CSR eco effect
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.8, // Stronger limits on corporate freedom
          authority_structure: 1.5,
          state_intervention_scope: 2.8, // Stronger state mandates
          societal_focus: -2.5, // Stronger societal benefit focus
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Offer Tax Incentives, Grants, and Public Recognition for Companies Adopting Strong CSR Practices Voluntarily",
        value:
          "tax_incentives_grants_public_recognition_voluntary_csr_practices",
        ideologyEffect: {
          // Original: econ: 0, eco: 0.5, authority: -0.5, societal: -1
          economic: 0.5, // Incentives are market-friendlier than mandates
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0.8,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0.5, // Corporate choice
          authority_structure: -0.5,
          state_intervention_scope: -0.5, // Indirect state role
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "CSR is Primarily the Responsibility of Corporations Themselves; Government Role is to Ensure Basic Legal Compliance",
        value:
          "csr_corporate_responsibility_government_role_basic_legal_compliance",
        ideologyEffect: {
          // Original: econ: 2, liberty: 2, scope: -3, societal: 2, eco: -0.5
          economic: 2.8, // Stronger L-F
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: -0.8,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Strong corporate freedom
          authority_structure: -1.0,
          state_intervention_scope: -3.5, // Max minimal state
          societal_focus: 2.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Promote CSR through Enhanced Transparency and Disclosure Requirements, Allowing Investor and Consumer Pressure to Drive Change",
        value: "promote_csr_transparency_disclosure_investor_consumer_pressure",
        ideologyEffect: {
          // Original: eco: 0.5, authority: -0.5, scope: -1, governance: 1
          economic: 0.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0.8,
          theocratic: 0,
          digitalization: 0.5, // Disclosure tech
          personal_liberty: 0.5,
          authority_structure: -0.8,
          state_intervention_scope: -0.8, // State mandates disclosure
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: 1.5, // Stronger populist/market pressure
        },
      },
    ],
  },
  {
    id: "resource_nationalization_foreign_investment",
    category: "Economy",
    questionText:
      "What is your stance on nationalization of key natural resources or strategic industries currently under private or foreign ownership?",
    options: [
      {
        text: "Support Nationalization of Key Resources/Industries to Ensure Public Benefit, National Control, and Fairer Distribution of Wealth",
        value:
          "support_nationalization_key_resources_industries_public_benefit_national_control",
        ideologyEffect: {
          // Original: econ: -3, sovereignty: 2, authority: 2, scope: 3, societal: -2
          economic: -3.8, // Max collectivist/nationalization
          social_traditionalism: -1.0,
          sovereignty: 2.5, // Stronger national control
          ecology: 0, // Could be better or worse under state control
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -2.0, // Limits private property rights
          authority_structure: 2.5, // Strong state control
          state_intervention_scope: 3.8, // Max state ownership
          societal_focus: -2.5, // Stronger public benefit focus
          rural_priority: 0,
          governance_approach: 0.5, // Can be populist
        },
      },
      {
        text: "Oppose Nationalization; Prioritize Private Property Rights, Free Markets, and Attracting Foreign Investment for Economic Growth",
        value:
          "oppose_nationalization_private_property_rights_free_markets_foreign_investment",
        ideologyEffect: {
          // Original: econ: 3, sovereignty: -1, authority: -1, scope: -3, societal: 2, liberty: 2
          economic: 3.8, // Max L-F
          social_traditionalism: 1.0, // Strong property rights traditional
          sovereignty: -1.5, // Pro-foreign investment is internationalist
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 2.5, // Max property rights
          authority_structure: -1.5,
          state_intervention_scope: -3.8, // Max anti-state ownership
          societal_focus: 2.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Consider Nationalization Only in Cases of Market Failure or Critical National Security, with Fair Compensation to Owners",
        value:
          "nationalization_only_market_failure_national_security_fair_compensation",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 1, authority: 1, scope: 1
          economic: -1.0,
          social_traditionalism: 0,
          sovereignty: 1.5, // Clearer national security trigger
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 1.5, // Conditional state takeover
          societal_focus: -0.5,
          rural_priority: 0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Implement Stronger Regulation, Higher Taxes/Royalties on Private/Foreign Companies in Key Sectors, Rather Than Full Nationalization",
        value:
          "stronger_regulation_taxes_royalties_private_foreign_companies_key_sectors_not_nationalization",
        ideologyEffect: {
          // Original: econ: -1, scope: 2, authority: 0.5
          economic: -1.5, // Stronger intervention via tax/reg
          social_traditionalism: 0,
          sovereignty: 0.5, // Asserting control over private/foreign
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.0,
          authority_structure: 0.8,
          state_intervention_scope: 2.5, // Stronger regulation/taxation
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "national_debt_management", // From Amplification Batch 2
    category: "Economy",
    questionText: "What is the best approach to managing the national debt?",
    options: [
      {
        text: "Implement Significant Spending Cuts Across Most Government Programs",
        value: "significant_spending_cuts_debt_reduction",
        ideologyEffect: {
          economic: 3.8,
          social_traditionalism: 1.5, // Fiscal discipline as traditional virtue
          sovereignty: 0.0,
          ecology: -1.0,
          theocratic: 0.0,
          digitalization: -0.5,
          personal_liberty: 0.8, // Lower future tax burden argument
          authority_structure: 0.5, // Strong will to cut
          state_intervention_scope: -3.5, // Max reduction in state scope
          societal_focus: 2.5,
          rural_priority: -0.5,
          governance_approach: -1.0,
        },
      },
      {
        text: "A Combination of Tax Increases (Mainly on Wealthy/Corps) and Targeted Spending Reforms",
        value: "tax_increases_targeted_cuts_debt",
        ideologyEffect: {
          economic: -3.0,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.5,
          authority_structure: 0.8,
          state_intervention_scope: 2.5, // Strong state management
          societal_focus: -2.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Focus on Robust Economic Growth to Naturally Reduce Debt-to-GDP Ratio",
        value: "economic_growth_reduce_debt_ratio",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: 0.0,
          sovereignty: 0.0,
          ecology: -0.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: -1.5, // Less direct intervention, focus on enabling growth
          societal_focus: 1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Strategic Public Investments to Boost Long-Term Growth, Even if Debt Rises Short-Term",
        value: "strategic_investments_long_term_growth_debt",
        ideologyEffect: {
          economic: -2.8,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.5,
          theocratic: 0.0,
          digitalization: 1.0,
          personal_liberty: -0.8,
          authority_structure: 1.0,
          state_intervention_scope: 2.8, // Strong state investment
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
  {
    id: "universal_basic_income_consideration", // From Amplification Batch 2
    category: "Economy",
    questionText: "What is your stance on Universal Basic Income (UBI)?",
    options: [
      {
        text: "Implement Nationwide UBI to Provide Economic Security for All",
        value: "implement_nationwide_ubi",
        ideologyEffect: {
          economic: -4.0,
          social_traditionalism: -3.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 2.0, // Increased freedom from want
          authority_structure: 1.5,
          state_intervention_scope: 4.0, // Max state program
          societal_focus: -3.8, // Max collectivist provision
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Support Pilot Programs to Study UBI's Economic and Social Effects",
        value: "support_ubi_pilot_programs_study",
        ideologyEffect: {
          economic: -1.8,
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.0,
          societal_focus: -1.0,
          rural_priority: 0.0,
          governance_approach: -1.5,
        },
      },
      {
        text: "Oppose UBI; Prefer Targeted Social Welfare and Job Creation Initiatives",
        value: "oppose_ubi_targeted_welfare_job_creation",
        ideologyEffect: {
          economic: 0.8,
          social_traditionalism: 2.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 0.0,
          state_intervention_scope: 0.5,
          societal_focus: 1.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "UBI is Too Costly and May Disincentivize Work; Explore Other Support Systems",
        value: "oppose_ubi_cost_disincentive_work",
        ideologyEffect: {
          economic: 2.8,
          social_traditionalism: 3.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 1.0,
          authority_structure: -0.5,
          state_intervention_scope: -1.8,
          societal_focus: 2.8,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "antitrust_monopoly_policy", // From Amplification Batch 2
    category: "Economy",
    questionText:
      "How vigorously should antitrust laws be enforced against monopolies and cartels?",
    options: [
      {
        text: "Aggressively Enforce Antitrust Laws, Including Breaking Up Large Monopolies",
        value: "aggressive_antitrust_breakup_monopolies",
        ideologyEffect: {
          economic: -3.5, // Max intervention against concentration
          social_traditionalism: -1.0,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: -0.5, // Could disrupt tech giants
          personal_liberty: 0.8,
          authority_structure: 1.5,
          state_intervention_scope: 3.5, // Strong state power
          societal_focus: -2.0,
          rural_priority: 0.0,
          governance_approach: 1.0,
        },
      },
      {
        text: "Strengthen Antitrust Enforcement, Focusing on Consumer Harm and Anti-Competitive Practices",
        value: "strengthen_antitrust_consumer_harm_anticompetitive",
        ideologyEffect: {
          economic: -2.0,
          social_traditionalism: -0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 0.5,
          authority_structure: 1.0,
          state_intervention_scope: 1.8,
          societal_focus: -1.5,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Current Enforcement Levels are Adequate; Prioritize Innovation and Efficiency",
        value: "current_antitrust_adequate_innovation_efficiency",
        ideologyEffect: {
          economic: 1.8,
          social_traditionalism: 0.5,
          sovereignty: 0.0,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 0.5,
          authority_structure: -0.5,
          state_intervention_scope: -1.0,
          societal_focus: 1.0,
          rural_priority: 0.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Reduce Antitrust Scrutiny to Allow National Champions to Compete Globally",
        value: "reduce_antitrust_national_champions_global_comp",
        ideologyEffect: {
          economic: 3.0,
          social_traditionalism: 1.5,
          sovereignty: 2.8, // Strong national champion focus
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: -1.0, // Less consumer protection
          authority_structure: 0.8,
          state_intervention_scope: -2.5, // Less intervention against specific companies
          societal_focus: 1.8,
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
    ],
  },
];
