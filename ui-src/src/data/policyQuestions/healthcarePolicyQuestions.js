export const HEALTHCARE_QUALITY_QUESTIONS = [
  {
    id: "healthcare_coverage",
    category: "Healthcare",
    questionText: "What is your stance on healthcare coverage for citizens?",
    options: [
      {
        text: "Support Universal Healthcare (e.g., Single-Payer System)",
        value: "universal_single_payer",
        ideologyEffect: {
          // Original: econ: -3.5, scope: 3.5, societal: -2.5
          economic: -3.8, // Stronger push
          social_traditionalism: 0,
          sovereignty: 0.0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.5, // Mandates can reduce some liberty
          authority_structure: 1.0, // Central system
          state_intervention_scope: 3.8, // Stronger push
          societal_focus: -3.0, // Stronger push
          rural_priority: 0.5,
          governance_approach: -0.5,
        },
      },
      {
        text: "Support a Mixed System: Public Option alongside Private Insurance",
        value: "public_option_private",
        ideologyEffect: {
          // Original: econ: -1.5, scope: 1.5, societal: 0.0
          economic: -1.8, // Slightly stronger
          social_traditionalism: 0,
          sovereignty: -0.5,
          ecology: 0.0,
          theocratic: 0,
          digitalization: 0.0,
          personal_liberty: 1,
          authority_structure: -0.5,
          state_intervention_scope: 1.8, // Slightly stronger
          societal_focus: -0.5, // Slightly more collectivist than pure neutral
          rural_priority: 0.0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Prioritize Market-Based Solutions and Private Insurance",
        value: "free_market_private",
        ideologyEffect: {
          // Original: econ: 3.5, scope: -3.5, societal: 3.0
          economic: 3.8, // Stronger push
          social_traditionalism: 0,
          sovereignty: -0.5, // Market solutions often international
          ecology: 0,
          theocratic: 0.0,
          digitalization: 0.5,
          personal_liberty: 3.0,
          authority_structure: -1.0,
          state_intervention_scope: -3.8, // Stronger push
          societal_focus: 3.0,
          rural_priority: -1.0,
          governance_approach: -0.5,
        },
      },
      {
        text: "Overhaul Current System with Market-Oriented Reforms, Emphasizing Choice",
        value: "overhaul_market_reforms",
        ideologyEffect: {
          // Original: econ: 2.5, scope: -2.5, societal: 2.0
          economic: 2.8, // Stronger push
          social_traditionalism: 0,
          sovereignty: -0.5,
          ecology: 0.0,
          theocratic: 0.0,
          digitalization: 0.0,
          personal_liberty: 2.5, // Stronger emphasis on choice
          authority_structure: -0.5,
          state_intervention_scope: -2.8, // Stronger push
          societal_focus: 2.5, // Stronger push
          rural_priority: -0.5,
          governance_approach: -0.5,
        },
      },
    ],
  },
  {
    id: "rural_healthcare_access_improvement_strategies",
    category: "Healthcare",
    questionText:
      "How can access to healthcare services be improved in rural and remote areas?",
    options: [
      {
        text: "Increase Public Funding for Rural Hospitals, Clinics, and Recruitment of Healthcare Professionals to Underserved Areas",
        value:
          "increase_public_funding_rural_hospitals_clinics_recruitment_professionals",
        ideologyEffect: {
          // Original: econ: -2, scope: 2, societal: -2, rural: 3
          economic: -2.5,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state funding role
          societal_focus: -2.0,
          rural_priority: 3.8, // Max rural focus for healthcare
          governance_approach: 0,
        },
      },
      {
        text: "Expand Telemedicine Services and Digital Health Infrastructure to Connect Rural Patients with Specialists and Care",
        value:
          "expand_telemedicine_digital_health_infra_rural_patients_specialists_care",
        ideologyEffect: {
          // Original: digital: 3, scope: 1, rural: 2
          economic: -0.5, // Some public investment usually needed
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 3.5, // Max digital solution
          personal_liberty: 0.5, // Increased access
          authority_structure: 0,
          state_intervention_scope: 1.0,
          societal_focus: 0.0,
          rural_priority: 2.5, // Strong rural benefit via tech
          governance_approach: -0.5, // Tech-driven solution
        },
      },
      {
        text: "Offer Financial Incentives (e.g., Loan Forgiveness, Higher Pay) for Healthcare Workers Serving in Rural Areas",
        value:
          "financial_incentives_loan_forgiveness_higher_pay_rural_healthcare_workers",
        ideologyEffect: {
          // Original: econ: -1, scope: 1, societal: -1, rural: 2
          economic: -1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 0,
          authority_structure: 0,
          state_intervention_scope: 1.5, // State providing incentives
          societal_focus: -1.0,
          rural_priority: 2.5,
          governance_approach: 0,
        },
      },
      {
        text: "Deregulate Scope of Practice for Nurses and Physician Assistants to Allow Them to Provide More Services in Rural Settings",
        value: "deregulate_scope_of_practice_nurses_pas_rural_services",
        ideologyEffect: {
          // Original: econ: 1, liberty: 1, scope: -2, authority: -1, rural: 1
          economic: 1.5, // Market-oriented deregulation
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5, // Increased scope for professionals
          authority_structure: -1.5,
          state_intervention_scope: -2.5, // Strong deregulation
          societal_focus: 0.5,
          rural_priority: 1.5, // Stronger potential rural benefit
          governance_approach: 0,
        },
      },
    ],
  },
  {
    id: "pandemic_preparedness_global_health_security",
    category: "Healthcare",
    questionText:
      "How should the nation prepare for and respond to future pandemics and global health security threats?",
    options: [
      {
        text: "Significantly Increase Funding for Public Health Infrastructure, Disease Surveillance, and International Cooperation (e.g., WHO)",
        value:
          "increase_funding_public_health_infra_surveillance_international_coop_who",
        ideologyEffect: {
          // Original: econ: -2, sovereignty: -2, scope: 2, societal: -2, digital: 1
          economic: -2.5,
          social_traditionalism: -1.0,
          sovereignty: -2.8, // Stronger international cooperation
          ecology: 0, // Could be + if linking to zoonotic diseases
          theocratic: 0,
          digitalization: 1.5, // Surveillance tech
          personal_liberty: -0.5,
          authority_structure: 1.0,
          state_intervention_scope: 2.5, // Stronger state role
          societal_focus: -2.0,
          rural_priority: 0,
          governance_approach: -1.5, // Institutional cooperation
        },
      },
      {
        text: "Invest in National Research and Development for Rapid Vaccine and Treatment Production Capabilities",
        value:
          "invest_national_rd_rapid_vaccine_treatment_production_capabilities",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: 1, scope: 1, digital: 1
          economic: -1.0,
          social_traditionalism: 0,
          sovereignty: 1.8, // Stronger national capability focus
          ecology: 0,
          theocratic: 0,
          digitalization: 1.5,
          personal_liberty: 0,
          authority_structure: 0.5,
          state_intervention_scope: 1.5,
          societal_focus: 0.0,
          rural_priority: 0,
          governance_approach: -0.5, // National strategic R&D
        },
      },
      {
        text: "Prioritize National Interests and Border Security in a Pandemic, Potentially Restricting Travel and Exports of Medical Supplies",
        value:
          "prioritize_national_interests_border_security_pandemic_restrict_travel_exports",
        ideologyEffect: {
          // Original: econ: 0.5, sovereignty: 3, liberty: -1, authority: 2, scope: 2
          economic: 0.8,
          social_traditionalism: 0.5,
          sovereignty: 3.8, // Max nationalist response
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -1.8, // Stronger restrictions
          authority_structure: 2.5, // Stronger state power
          state_intervention_scope: 2.5,
          societal_focus: 1.5,
          rural_priority: 0,
          governance_approach: 0.5,
        },
      },
      {
        text: "Strengthen Global Health Regulations and Ensure Equitable Access to Vaccines and Treatments for All Countries",
        value:
          "strengthen_global_health_regulations_equitable_access_vaccines_treatments_all_countries",
        ideologyEffect: {
          // Original: econ: -1, sovereignty: -3, societal: -2, governance: -2
          economic: -1.5,
          social_traditionalism: -1.0,
          sovereignty: -3.5, // Max internationalism
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -0.5,
          authority_structure: -0.5,
          state_intervention_scope: 0.5, // Enforcing intl regulations
          societal_focus: -2.8, // Strong global equity focus
          rural_priority: 0,
          governance_approach: -2.0,
        },
      },
    ],
  },
  {
    id: "end_of_life_options_assisted_dying",
    category: "Healthcare",
    questionText:
      "What is your stance on physician-assisted dying and other end-of-life care options for terminally ill individuals?",
    options: [
      {
        text: "Legalize Physician-Assisted Dying for Mentally Competent, Terminally Ill Adults with Strict Safeguards and Ethical Oversight",
        value: "legalize_physician_assisted_dying_safeguards_terminally_ill",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -3.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: -2.8,
          digitalization: 0,
          personal_liberty: 3.8,
          authority_structure: -0.5,
          state_intervention_scope: 0.5,
          societal_focus: 1.8,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Oppose Physician-Assisted Dying on Moral, Ethical, or Religious Grounds; Focus on Sanctity of Life",
        value:
          "oppose_physician_assisted_dying_moral_ethical_religious_grounds",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 3.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 3.8,
          digitalization: 0,
          personal_liberty: -3.8,
          authority_structure: 1.5,
          state_intervention_scope: 1.8,
          societal_focus: -1.5,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Focus Exclusively on Expanding Access to High-Quality Palliative Care, Hospice Services, and Pain Management",
        value:
          "expand_access_palliative_care_hospice_pain_management_end_of_life",
        ideologyEffect: {
          economic: -1.8,
          social_traditionalism: 0.8,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0.5,
          digitalization: 0.5,
          personal_liberty: 0.0,
          authority_structure: 0.5,
          state_intervention_scope: 1.8,
          societal_focus: -1.8,
          rural_priority: 0.5,
          governance_approach: 0,
        },
      },
      {
        text: "Allow Regional Governments or Jurisdictions to Decide on the Legality and Regulation of Physician-Assisted Dying",
        value: "regional_decide_legality_physician_assisted_dying",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5,
          sovereignty: 1.0,
          ecology: 0,
          theocratic: 0.5,
          digitalization: 0,
          personal_liberty: 0.0,
          authority_structure: -3.8,
          state_intervention_scope: -2.0,
          societal_focus: 0,
          rural_priority: 0.5,
          governance_approach: 0.8,
        },
      },
    ],
  },
  {
    id: "vaccination_policy_public_health_mandates",
    category: "Healthcare",
    questionText:
      "What is your stance on vaccine mandates for preventable diseases to protect public health?",
    options: [
      {
        text: "Support Vaccine Mandates for School Entry, Healthcare Workers, and Potentially for Broader Public Sector Roles during Outbreaks",
        value:
          "support_vaccine_mandates_schools_healthcare_public_sector_outbreaks",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: -0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: -3.0,
          authority_structure: 2.8,
          state_intervention_scope: 2.8,
          societal_focus: -2.8,
          rural_priority: 0,
          governance_approach: -1.0,
        },
      },
      {
        text: "Oppose Government-Imposed Vaccine Mandates; Emphasize Individual Bodily Autonomy and Personal Choice",
        value:
          "oppose_government_vaccine_mandates_bodily_autonomy_personal_choice",
        ideologyEffect: {
          economic: 0,
          social_traditionalism: 0.5,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 4.0,
          authority_structure: -2.8,
          state_intervention_scope: -3.8,
          societal_focus: 3.8,
          rural_priority: 0,
          governance_approach: 1.8,
        },
      },
      {
        text: "Allow Private Businesses and Organizations to Set Their Own Vaccine Policies, but No Government Mandates",
        value: "allow_private_business_vaccine_policies_no_government_mandates",
        ideologyEffect: {
          economic: 1.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.5,
          authority_structure: -1.5,
          state_intervention_scope: -2.8,
          societal_focus: 1.0,
          rural_priority: 0,
          governance_approach: 0,
        },
      },
      {
        text: "Focus on Public Education, Voluntary Vaccination Programs, and Ensuring Easy Access to Vaccines for All",
        value:
          "focus_public_education_voluntary_vaccination_easy_access_vaccines",
        ideologyEffect: {
          economic: -0.5,
          social_traditionalism: 0,
          sovereignty: 0,
          ecology: 0,
          theocratic: 0,
          digitalization: 0,
          personal_liberty: 1.8,
          authority_structure: -0.5,
          state_intervention_scope: 0.8,
          societal_focus: -1.0,
          rural_priority: 0,
          governance_approach: 1.0,
        },
      },
    ],
  },
];
