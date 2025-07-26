// ui-src/src/data/lobbyingData.js
export const LOBBYING_GROUPS = [
  {
    id: "nca",
    name: "National Corporate Association",
    focus: "Economic Deregulation, Tax Cuts",
    influence: "High",
    description:
      "Represents major corporations, advocating for policies favorable to business interests and reducing regulatory burdens.",
    financialPower: 80, // Example numerical value
    alignedPolicies: [
      "corporate_tax_rate_decrease",
      "deregulate_zoning_more_private_construction",
    ],
  },
  {
    id: "ejl",
    name: "Eco-Justice League",
    focus: "Environmental Protection, Climate Action",
    influence: "Medium",
    description:
      "Dedicated to protecting natural resources and promoting sustainable practices through legislative advocacy and public awareness.",
    financialPower: 40,
    alignedPolicies: [
      "rapid_transition_renewables_govt_support",
      "implement_national_carbon_tax_dividend_or_green_investment",
    ],
    opposedPolicies: ["prioritize_fossil_fuels_affordable_reliable"],
  },
  {
    id: "flu",
    name: "Federated Labor Unions",
    focus: "Worker Rights, Minimum Wage Increase",
    influence: "Medium",
    description:
      "Advocates for the rights and welfare of workers, pushing for better wages, benefits, and workplace safety.",
    financialPower: 55,
    alignedPolicies: [
      "classify_gig_workers_employees_full_benefits_protections",
      "strengthen_protections_collective_bargaining_unions",
    ],
  },
  {
    id: "nra_like",
    name: "Citizen Arms Advocates",
    focus: "Firearm Ownership Rights, Personal Liberty",
    influence: "High",
    description:
      "A powerful advocacy group dedicated to upholding and expanding the rights of citizens to own firearms, and opposing new restrictions.",
    financialPower: 75,
    alignedPolicies: ["oppose_restrictions_firearm_ownership_rights"],
    opposedPolicies: [
      "implement_strict_firearm_controls_bans",
      "strengthen_checks_risk_removal_firearms",
    ],
  },
  {
    id: "tech_alliance",
    name: "Digital Innovation Alliance",
    focus: "Tech Industry Growth, Minimal Regulation",
    influence: "Medium",
    description:
      "Represents leading technology companies, promoting policies that foster innovation, free data flow, and reduced government oversight in the tech sector.",
    financialPower: 60,
    alignedPolicies: [
      "self_regulation_market_solutions_tech",
      "promote_ai_innovation_minimal_regulation_industry_standards",
    ],
    opposedPolicies: [
      "stronger_tech_regulation_limit_power",
      "break_up_large_tech_companies",
    ],
  },
];
