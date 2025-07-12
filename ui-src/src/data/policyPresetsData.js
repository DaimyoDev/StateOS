export const POLICY_PRESETS = {
  Conservative: {
    // Existing Stances (with key changes discussed)
    healthcare_coverage: "free_market_private",
    taxation_wealth: "cut_taxes_corps",
    education_funding: "school_choice_mechanisms",
    environmental_regulation: "reduce_regulation_business_growth",
    minimum_wage: "keep_or_eliminate_national_minimum",
    climate_change_agreements: "yes_climate_flexibility_national_interests",
    firearm_control: "oppose_restrictions_firearm_ownership_rights",
    immigration_border_management:
      "increase_border_security_stricter_enforcement",
    student_loan_debt_higher_ed: "no_forgiveness_personal_responsibility_loans",
    trade_policy_global: "tariffs_trade_barriers_protect_domestic",
    criminal_justice_system_reform:
      "tough_on_crime_stricter_penalties_police_funding",
    public_pension_systems: "raise_retirement_age_pensions",
    abortion_access_legality: "national_ban_severe_restrictions_abortion",
    defense_spending_priorities:
      "significantly_increase_defense_spending_superiority",
    tech_company_regulation: "transparency_self_regulation_big_tech_oversight", // Moderate conservative choice
    energy_policy_national_focus:
      "prioritize_national_fossil_fuels_independence",
    infrastructure_investment_funding:
      "public_private_partnerships_user_fees_infra",
    lgbtq_plus_rights_protections:
      "marriage_one_man_one_woman_limit_lgbtq_protections",
    foreign_policy_assertive_powers: "confrontational_assertive_powers",
    campaign_finance_political_donations:
      "reduce_restrictions_donations_free_speech",
    // This was identified as missing and added
    drug_policy_recreational_substances:
      "maintain_national_prohibition_cannabis_drugs",
    voting_rights_election_integrity: "stricter_voter_id_accurate_rolls",
    affordable_housing_crisis:
      "incentivize_private_development_deregulation_housing",
    parental_leave_policy: "oppose_national_mandate_leave_regional_businesses",
    ai_development_regulation:
      "promote_ai_innovation_minimal_regulation_industry_standards",
    // This was identified as missing and added
    law_enforcement_accountability_reform:
      "support_law_enforcement_oppose_hindrance_policing",
    // This was identified as missing
    higher_education_cost_access:
      "universities_accountable_costs_student_outcomes_higher_ed",
    // This was identified as missing
    unionization_worker_rights:
      "support_right_to_work_style_laws_limit_union_power",
    // This was identified as missing
    international_aid_allocation: "aid_strategic_national_interests",
    // This was identified as missing
    nuclear_weapons_policy: "modernize_expand_nuclear_capabilities",
    // This was identified as missing
    cybersecurity_national_strategy:
      "invest_offensive_defensive_cyber_priority",
    // This was identified as missing
    national_debt_management: "significant_spending_cuts_debt_reduction",
    // This was identified as missing
    universal_basic_income_consideration: "oppose_ubi_cost_disincentive_work",
    // This was identified as missing
    antitrust_monopoly_policy:
      "current_antitrust_adequate_innovation_efficiency",
    // This was identified as missing and added
    religious_freedom_societal_laws: "broad_religious_exemptions_from_laws",
    // This was identified as missing
    gender_identity_legal_recognition:
      "legal_sex_at_birth_oppose_gender_marker_changes",
    // This was identified as missing
    capital_punishment_policy:
      "support_capital_punishment_heinous_crimes_due_process",
    // This was identified as missing
    water_resource_management_global:
      "invest_large_scale_water_infrastructure_supply",
    // This was identified as missing
    biodiversity_habitat_conservation:
      "balance_biodiversity_economic_development_resource_use",
    // This was identified as missing
    early_childhood_education_access:
      "early_childhood_education_regional_local_responsibility",
    // This was identified as missing and added
    sex_education_school_curriculum:
      "abstinence_focused_sex_ed_limited_contraception",
    // This was identified as missing
    prescription_drug_pricing_access:
      "encourage_pharma_innovation_strong_patents_market_incentives",
    // This was identified as missing
    mental_health_services_integration:
      "incentivize_private_innovation_tele_mental_health",
    // This was identified as missing
    highest_court_reform_judicial:
      "maintain_current_highest_court_structure_appointment",
    // This was identified as missing
    electoral_district_manipulation_reform:
      "elected_legislatures_control_redistricting_political_mandates",
    // This was identified as missing
    decentralization_regional_autonomy:
      "strengthen_central_government_authority",
    // This was identified as missing
    net_neutrality_internet_access:
      "no_net_neutrality_market_forces_fair_access",
    // This was identified as missing
    space_exploration_national_priorities:
      "prioritize_ppp_space_exploration_commercialization",
    // This was identified as missing
    private_prison_industry_role:
      "support_private_prisons_cost_savings_efficiency_expansion",
    // This was identified as missing
    juvenile_justice_system_reform_youth:
      "stricter_penalties_serious_juvenile_offenses_try_as_adults",
    // This was identified as missing
    high_speed_rail_national_network:
      "encourage_private_investment_hsr_minimal_subsidies",
    // This was identified as missing
    rural_digital_connectivity:
      "incentivize_private_companies_rural_broadband_expansion",
    // This was identified as missing
    carbon_pricing_mechanisms:
      "oppose_national_carbon_pricing_economic_impacts",
    fossil_fuel_industry_subsidies:
      "maintain_some_fossil_fuel_subsidies_security_affordability_transition",
    gig_economy_labor_protections:
      "maintain_independent_contractor_status_gig_workers_flexibility",
    // KEY CHANGE for state_intervention_scope
    workplace_safety_agency_role:
      "maintain_workplace_safety_agency_funding_collaborative_education",
    undocumented_immigrants_status_policy:
      "prioritize_deportation_all_undocumented",
    refugee_asylum_intake_policy:
      "reduce_refugee_quotas_stricter_asylum_standards",
    agricultural_subsidies_food_production:
      "phase_out_agricultural_subsidies_free_market_farming",
    food_security_supply_chain_resilience:
      "reduce_regulations_small_food_producers_processors_local_sourcing",
    rural_economic_diversification_development:
      "tax_incentives_grants_deregulation_attract_rural_businesses", // Changed from "invest_rural_infrastructure" to be less econ negative and less state scope
    military_alliances_collective_security:
      "maintain_alliances_demand_greater_burden_sharing_contributions",
    foreign_intervention_sovereignty_policy:
      "selective_engagement_vital_national_security_interests_international_support",
    financial_sector_stability_regulation:
      "reform_streamline_financial_regulations_reduce_compliance_burdens",
    digital_currency_cryptocurrency_policy:
      "minimal_crypto_regulation_innovation_aml_ctf",
    // KEY CHANGE for PL, Auth, Scope
    freedom_of_expression_online_content:
      "regulate_speech_inciting_violence_defamation_illegal_activities",
    // This was identified as missing and added
    sex_industry_decriminalization_regulation:
      "oppose_decriminalization_sex_work_inherently_exploitative_harmful",
    plastic_waste_pollution_management:
      "public_awareness_voluntary_initiatives_market_solutions_plastics",
    sustainable_agriculture_food_systems:
      "tech_innovation_agriculture_precision_farming_gmos_efficiency",
    standardized_testing_education_assessment:
      "standardized_tests_key_tool_accountability_achievement_gaps_standards",
    arts_humanities_stem_education_balance:
      "prioritize_stem_funding_education_economic_demands_innovation_competitiveness",
    end_of_life_options_assisted_dying:
      "oppose_physician_assisted_dying_moral_ethical_religious_grounds",
    vaccination_policy_public_health_mandates:
      "allow_private_business_vaccine_policies_no_government_mandates",
    lobbying_political_influence_reform:
      "lobbying_free_speech_petition_oppose_further_restrictions",
    head_of_state_election_system_reform:
      "maintain_current_electoral_system_head_of_state",
    data_sovereignty_cross_border_data_flows:
      "national_control_critical_data_infrastructure_digital_assets_limit_foreign",
    government_use_open_source_software:
      "prioritize_best_available_software_proprietary_or_open_source_merit",
    solitary_confinement_prison_practice:
      "solitary_confinement_necessary_tool_prison_safety_order_discipline",
    restorative_justice_criminal_system_role:
      "skeptical_restorative_justice_undermine_deterrence_retribution",
    public_transportation_investment_urban_rural:
      "prioritize_road_infra_individual_vehicles_public_transport_self_sustaining",
    water_infrastructure_safety_modernization:
      "encourage_private_investment_management_water_infra_concessions_reforms",
    offshore_resource_extraction_policy:
      "expand_offshore_drilling_resource_extraction_maximize_domestic_production",
    energy_grid_decentralization_resilience:
      "prioritize_hardening_existing_grid_infra_threats_baseload_stability",
    automation_impact_labor_force_policy:
      "promote_automation_ai_innovation_productivity_market_forces_labor_adjustments",
    work_life_balance_right_to_disconnect:
      "no_government_intervention_work_hours_communication_employer_employee_agreements",
    skilled_migration_economic_needs_policy:
      "points_based_system_skilled_migration_demand_sectors_permanent_residency",
    predatory_lending_consumer_finance_regulation:
      "market_determine_interest_rates_transparency_consumer_choice_credit_access",
    consumer_data_privacy_online_rights:
      "industry_self_regulation_privacy_enhancing_tech_minimal_government_mandates",
    international_arms_sales_export_policy:
      "arms_sales_foreign_policy_tool_support_allies_deter_adversaries_stability",
    intellectual_property_pharmaceutical_access:
      "strengthen_ip_protections_incentivize_innovation_higher_prices",
    animal_welfare_industrial_agriculture:
      "focus_food_safety_efficiency_animal_welfare_not_burden_producers",
    wilderness_conservation_public_lands_use:
      "balance_conservation_multiple_uses_public_lands_extraction_recreation_grazing",
    history_education_curriculum_national_narrative:
      "patriotic_narrative_national_achievements_unity_downplay_divisive_history",
    rural_healthcare_access_improvement_strategies:
      "deregulate_scope_of_practice_nurses_pas_rural_services",
    // KEY CHANGE
    judicial_appointment_selection_process:
      "prioritize_judicial_philosophy_ideological_alignment_appointments",
    government_surveillance_privacy_security_balance:
      "expand_surveillance_powers_advanced_tech_counter_terrorism_crime_judicial_oversight",
    forensic_science_criminal_justice_standards:
      "national_standards_forensic_accreditation_labs_certification_practitioners",
    public_funding_arts_culture_heritage:
      "reduce_eliminate_public_funding_arts_culture_rely_private_donations_market",
    national_disaster_preparedness_relief_funding:
      "individual_community_responsibility_preparedness_government_role_catastrophic_events",
    // First instance
    indigenous_peoples_rights_land_claims:
      "assimilationist_approach_integration_indigenous_peoples_mainstream_society",
    ocean_health_fisheries_management:
      "prioritize_economic_viability_fishing_industries_coastal_communities_balance_conservation",
    corporate_social_responsibility_mandates:
      "csr_corporate_responsibility_government_role_basic_legal_compliance",
    // KEY CHANGE
    genetic_engineering_bioethics_regulation:
      "strict_regulations_ethical_oversight_genetic_engineering_ban_certain_applications",
    news_media_objectivity_disinformation_policy:
      "no_government_interference_news_media_absolute_freedom_of_press",
    resource_nationalization_foreign_investment:
      "oppose_nationalization_private_property_rights_free_markets_foreign_investment",
    urban_planning_sustainable_cities_policy:
      "market_driven_urban_dev_reduce_zoning_restrictions_density_demand",
    cultural_heritage_repatriation_artifacts:
      "resist_repatriation_claims_artifacts_shared_global_heritage_wider_audience",
    pandemic_preparedness_global_health_security:
      "prioritize_national_interests_border_security_pandemic_restrict_travel_exports",

    // Stances for NEWLY ADDED QUESTIONS from Batch 1 & 2
    head_of_state_system: "direct_popular_election_hos", // Traditional conservatives often support existing democratic structures if they are stable. Monarchist would pick "hereditary_monarchy".
    land_reform_agricultural_structure: "market_agribusiness_efficiency", // Pro-private property and efficiency. Agrarian would differ.
    state_control_information_media: "free_press_absolutism_no_regulation", // Consistent with free market and less state control.
    role_of_religion_in_state: "broad_religious_exemptions_from_laws", // Aligns with Religious Conservative aspects.
    national_service_civic_duty: "no_mandatory_service_voluntary_incentives", // Prefers individual choice over state compulsion.
    legislative_judicial_structure:
      "independent_judiciary_elected_legislature_rights", // Supports established democratic structures. Monarchist/Authoritarian would differ.
    societal_change_philosophy: "preserve_tradition_resist_radical_change", // Core conservative stance.
    urban_vs_rural_land_priority:
      "balance_conservation_multiple_uses_public_lands_extraction_recreation_grazing", // Pragmatic, allows economic use. Agrarian would pick "protect_expand_agricultural_land_rural_livelihoods".
    global_economic_order:
      "national_sovereignty_protectionism_selective_engagement", // Aligns with the protectionist trade stance.
    role_of_elites_governance: "elite_rule_experienced_virtuous", // Traditional conservatism often values experience and established leadership.
    aristocracy_role_governance: "aristocracy_symbolic_ceremonial_only", // Most modern conservatives wouldn't advocate for political power for aristocracy, but might respect tradition. Monarchist would differ.
    industrialization_urbanization_approach:
      "rapid_industrialization_urban_growth_max_econ", // Pro-economic growth.
    international_revolutionary_action:
      "strict_non_interference_internal_conflicts", // Generally non-interventionist unless direct national interests are at stake.
    basis_of_law_justice: "natural_law_human_rights_secular_constitution", // While valuing tradition/religion, modern conservatives operate within this framework. Religious Conservative might lean more to "divine_law".
  },
  Liberal: {
    healthcare_coverage: "public_option_private",
    taxation_wealth: "moderate_increase_top",
    education_funding: "teacher_salaries_resources_existing_budgets", // CHANGED (less econ impact)
    environmental_regulation: "strict_green_transition_regulations", // KEEP (High eco, accept PL trade-off for now)
    minimum_wage: "moderate_increase_regional_higher", // CHANGED (better econ fit, helps Auth)
    climate_change_agreements: "yes_pursue_climate_goals_vigorously",
    firearm_control: "focus_mental_health_existing_firearm_laws", // CHANGED (better PL)
    immigration_border_management:
      "comprehensive_reform_legal_pathways_root_causes",
    student_loan_debt_higher_ed: "targeted_forgiveness_income_repayment_reform",
    trade_policy_global: "fair_trade_labor_environmental_standards",
    criminal_justice_system_reform:
      "reform_sentencing_abolish_mandatory_minimums_reentry", // (PL +2.5, Auth -1.5)
    public_pension_systems: "raise_cap_increase_contribution_pensions", // (Econ -3.0) - A bit strong, but other options are usually right-wing.
    abortion_access_legality: "protect_expand_abortion_access_legal_right", // (PL +4.0)
    defense_spending_priorities: "reduce_defense_spending_diplomacy_domestic", // (PL +2.5, Sov -3.5)
    tech_company_regulation: "targeted_tech_regulation_specific_harms", // CHANGED (PL -1.0) - Better than increase_regulation (PL -2.5)
    energy_policy_national_focus: "rapid_transition_renewable_energy", // (Eco +4.0, PL -1.5) - Eco priority
    infrastructure_investment_funding:
      "prioritize_maintenance_modernization_infra", // CHANGED (Econ +0.5, Scope +0.5) - More fiscally moderate.
    lgbtq_plus_rights_protections: "national_non_discrimination_lgbtq", // (PL +3.5, ST -3.8)
    foreign_policy_assertive_powers: "engagement_diplomacy_assertive_powers", // (Sov -3.8)
    campaign_finance_political_donations:
      "increase_transparency_disclosure_donations", // CHANGED (PL +0.8)
    drug_policy_recreational_substances: "legalize_regulate_most_drugs_tax", // CHANGED (PL +4.0)
    voting_rights_election_integrity:
      "expand_voting_access_automatic_registration_polling", // (PL +3.8, Auth -3.0)
    affordable_housing_crisis:
      "expand_housing_vouchers_homebuyer_support_affordable", // CHANGED (Econ -1.5, PL +0.8)
    parental_leave_policy: "national_mandate_paid_family_leave",
    ai_development_regulation:
      "ai_data_privacy_algorithmic_transparency_bias_mitigation", // CHANGED (PL +1.8, Auth 0.0)
    law_enforcement_accountability_reform:
      "reform_officer_protections_misconduct_registry_oversight", // (PL +3.5, Auth -3.0)
    higher_education_cost_access:
      "targeted_aid_income_based_repayment_higher_ed", // CHANGED (Econ -2.0)
    unionization_worker_rights:
      "maintain_current_labor_laws_balance_unions_employers", // More neutral than "strengthen" if econ is a concern.
    international_aid_allocation:
      "increase_foreign_aid_global_development_initiatives", // Assuming "aid_humanitarian..." maps to this.
    nuclear_weapons_policy: "pursue_disarmament_strengthen_non_proliferation",
    cybersecurity_national_strategy:
      "international_cooperation_global_cyber_norms",
    national_debt_management: "tax_increases_targeted_cuts_debt", // (Econ -3.0) - This is still quite strong for Liberal ideal of -1.5. If a more moderate option exists, it'd be better.
    universal_basic_income_consideration: "support_ubi_pilot_programs_study",
    antitrust_monopoly_policy:
      "strengthen_antitrust_consumer_harm_anticompetitive",
    religious_freedom_societal_laws:
      "strict_separation_religion_state_no_exemptions", // CHANGED (Theo -4.0)
    gender_identity_legal_recognition:
      "full_legal_gender_id_self_identification",
    capital_punishment_policy: "abolish_capital_punishment_nationally_globally",
    water_resource_management_global:
      "prioritize_water_conservation_recycling_sustainable_use",
    biodiversity_habitat_conservation:
      "strong_national_biodiversity_protection_expand_areas",
    early_childhood_education_access:
      "targeted_early_childhood_education_low_income_at_risk", // CHANGED (Econ -1.5)
    sex_education_school_curriculum:
      "comprehensive_medically_accurate_sex_ed_consent_lgbtq",
    prescription_drug_pricing_access: "government_negotiate_drug_prices_pharma", // (Econ -2.5) - Common liberal stance, slightly strong on econ.
    mental_health_services_integration:
      "increase_public_funding_community_school_mental_health", // CHANGED (Econ -1.5)
    highest_court_reform_judicial:
      "term_limits_retirement_age_highest_court_judges", // (Auth -2.0)
    electoral_district_manipulation_reform:
      "independent_non_partisan_redistricting_commissions", // (Auth -3.0)
    decentralization_regional_autonomy:
      "advocate_federal_system_regional_autonomy", // (Auth -2.5)
    net_neutrality_internet_access:
      "reinstate_strong_net_neutrality_rules_regulator", // (PL +2.0)
    space_exploration_national_priorities:
      "focus_space_funding_earth_observation_climate_disaster",
    private_prison_industry_role: "ban_private_prisons_national_regional", // (Auth +1.5) - This still conflicts with Auth -1.0 ideal.
    juvenile_justice_system_reform_youth:
      "rehabilitation_diversion_community_alternatives_juvenile_justice", // (Auth -2.5)
    high_speed_rail_national_network:
      "support_pilot_projects_regional_hsr_corridors", // CHANGED (Econ -2.0, RP +0.5)
    rural_digital_connectivity:
      "satellite_advanced_wireless_tech_remote_area_broadband", // CHANGED (RP +2.5) - Still pro-rural, but less extreme than public utility.
    carbon_pricing_mechanisms:
      "implement_national_carbon_tax_dividend_or_green_investment",
    fossil_fuel_industry_subsidies:
      "phase_out_fossil_fuel_subsidies_reinvest_renewables_efficiency", // CHANGED (Econ -0.5)
    gig_economy_labor_protections:
      "third_category_worker_gig_economy_portable_benefits_min_earnings", // CHANGED (PL 0.0)
    workplace_safety_agency_role:
      "maintain_workplace_safety_agency_funding_collaborative_education", // CHANGED (PL 0.0, Auth 0.0)
    undocumented_immigrants_status_policy:
      "pathway_citizenship_long_term_undocumented",
    refugee_asylum_intake_policy:
      "increase_refugee_quotas_expand_asylum_eligibility",
    agricultural_subsidies_food_production:
      "reform_subsidies_small_farms_sustainable_practices_food_security", // (RP +2.5)
    food_security_supply_chain_resilience:
      "invest_local_regional_food_systems_reduce_reliance_long_chains", // (Auth -2.5, RP +2.5, Sov +2.5) - Helps Auth.
    rural_economic_diversification_development:
      "support_rural_economic_diversification_tourism_renewables_remote_work", // (RP +2.5)
    military_alliances_collective_security:
      "strengthen_expand_military_alliances_collective_security",
    foreign_intervention_sovereignty_policy:
      "prioritize_diplomacy_sanctions_soft_power_military_last_resort",
    financial_sector_stability_regulation:
      "maintain_current_financial_regulations_robust_enforcement_monitoring", // CHANGED (Econ -1.0)
    digital_currency_cryptocurrency_policy:
      "cautious_approach_study_risks_benefits_cbdc_crypto_reg", // CHANGED (Auth 0.0, Digitalization -1.5)
    freedom_of_expression_online_content:
      "broad_free_expression_protections_oppose_censorship_hate_speech_laws", // CHANGED (PL +4.0)
    sex_industry_decriminalization_regulation:
      "fully_decriminalize_consensual_sex_work_safety_rights", // (PL +4.0)
    plastic_waste_pollution_management:
      "national_bans_single_use_plastics_invest_alternatives",
    sustainable_agriculture_food_systems:
      "incentives_assistance_research_sustainable_regenerative_farming", // CHANGED (PL 0.0)
    standardized_testing_education_assessment:
      "reduce_reliance_standardized_tests_diverse_assessment_methods",
    arts_humanities_stem_education_balance:
      "increase_arts_humanities_funding_emphasis_creativity_critical_thinking",
    end_of_life_options_assisted_dying:
      "legalize_physician_assisted_dying_safeguards_terminally_ill",
    vaccination_policy_public_health_mandates:
      "focus_public_education_voluntary_vaccination_easy_access_vaccines", // CHANGED (PL +1.8, Auth -0.5)
    lobbying_political_influence_reform:
      "increase_transparency_lobbying_real_time_detailed_disclosure", // CHANGED (PL +0.8)
    head_of_state_election_system_reform:
      "direct_national_popular_vote_head_of_state",
    data_sovereignty_cross_border_data_flows:
      "negotiate_international_agreements_data_sharing_privacy_cybersecurity", // CHANGED (Econ 0, Sov -1.8)
    government_use_open_source_software:
      "mandate_prefer_open_source_software_government_systems_transparency_security",
    solitary_confinement_prison_practice:
      "restrict_ban_solitary_confinement_vulnerable_populations_long_term",
    restorative_justice_criminal_system_role:
      "widely_implement_fund_restorative_justice_alternative_punitive",
    public_transportation_investment_urban_rural:
      "focus_public_transport_investment_urban_centers_high_density_corridors", // CHANGED (RP -2.5)
    water_infrastructure_safety_modernization:
      "grants_loans_regional_local_water_infra_upgrades_shared_responsibility", // CHANGED (Econ -1.0, Auth -1.5)
    offshore_resource_extraction_policy:
      "phase_out_ban_new_offshore_drilling_extraction_renewables_ocean_conservation",
    energy_grid_decentralization_resilience:
      "promote_decentralized_energy_microgrids_local_renewables_community_resilience", // CHANGED (Auth -3.5)
    automation_impact_labor_force_policy:
      "invest_worker_retraining_lifelong_learning_transition_support_automation",
    work_life_balance_right_to_disconnect:
      "legislate_right_to_disconnect_protect_workers_mental_health",
    skilled_migration_economic_needs_policy:
      "open_visas_fast_track_immigration_exceptional_talent_science_tech_arts",
    predatory_lending_consumer_finance_regulation:
      "strengthen_consumer_protection_agency_oversight_lending_practices", // CHANGED (Econ -1.5)
    consumer_data_privacy_online_rights:
      "strong_consumer_data_rights_access_delete_opt_out_gdpr_style",
    international_arms_sales_export_policy:
      "strictly_limit_arms_sales_human_rights_conflict_zones",
    intellectual_property_pharmaceutical_access:
      "tiered_pricing_patented_medicines_based_on_country_income_levels", // CHANGED (Econ -0.5)
    animal_welfare_industrial_agriculture:
      "strict_national_standards_animal_welfare_industrial_farming_phase_out_confinement",
    wilderness_conservation_public_lands_use:
      "designate_more_protected_wilderness_restrict_commercial_development_motorized_access",
    history_education_curriculum_national_narrative:
      "comprehensive_critical_history_multiple_perspectives_past_injustices_controversies",
    rural_healthcare_access_improvement_strategies:
      "expand_telemedicine_digital_health_infra_rural_patients_specialists_care", // (RP +2.5) - Still an issue for RP target.
    judicial_appointment_selection_process:
      "non_partisan_bipartisan_commission_nominating_vetting_judicial_candidates", // CHANGED (Auth -1.5)
    government_surveillance_privacy_security_balance:
      "strict_limits_surveillance_warrants_data_collection_ban_mass_surveillance", // CHANGED (PL +4.0)
    forensic_science_criminal_justice_standards:
      "ensure_defense_equal_access_forensic_expertise_testing_resources", // CHANGED (PL +1.8, Auth -0.5)
    public_funding_arts_culture_heritage:
      "modest_public_funding_community_arts_cultural_diversity_access_underserved", // CHANGED (Econ -1.0)
    national_disaster_preparedness_relief_funding:
      "increase_national_investment_climate_resilience_mitigation_rapid_response",
    indigenous_peoples_rights_land_claims:
      "recognize_treaty_obligations_settle_land_claims_support_indigenous_self_governance",
    ocean_health_fisheries_management:
      "expand_marine_protected_areas_strict_catch_limits_combat_illegal_fishing",
    corporate_social_responsibility_mandates:
      "mandate_minimum_csr_standards_large_corporations_penalties",
    genetic_engineering_bioethics_regulation:
      "encourage_research_development_genetic_engineering_medical_agricultural_risk_assessment", // CHANGED (PL +0.5)
    news_media_objectivity_disinformation_policy:
      "support_independent_fact_checking_media_literacy_programs_citizens",
    resource_nationalization_foreign_investment:
      "stronger_regulation_taxes_royalties_private_foreign_companies_key_sectors_not_nationalization",
    urban_planning_sustainable_cities_policy:
      "prioritize_mixed_use_dev_public_transport_green_spaces_affordable_housing_planning_regs",
    cultural_heritage_repatriation_artifacts:
      "proactively_review_repatriate_artifacts_colonial_rule_illicitly_international_norms",
    pandemic_preparedness_global_health_security:
      "increase_funding_public_health_infra_surveillance_international_coop_who",

    // Stances for the 10 NEWEST Policy Questions
    head_of_state_system: "direct_popular_election_hos", // (PL +2.0, Auth -2.0, Gov +3.0) Aligns with democratic, anti-authoritarian, participatory ideals.
    land_reform_agricultural_structure: "mixed_farms_strong_eco_labor_regs",
    state_control_information_media: "free_press_absolutism_no_regulation",
    role_of_religion_in_state: "strict_secularism_separation", // (Theo -4.0, ST -3.0, PL +2.0) Essential for secular liberal.
    national_service_civic_duty: "no_mandatory_service_voluntary_incentives", // (PL +3.0) Prioritizes individual choice.
    legislative_judicial_structure:
      "independent_judiciary_elected_legislature_rights", // (PL +2.5, Auth -2.5) Core liberal democratic principle.
    societal_change_philosophy: "gradual_evidence_based_reform", // (ST -0.5) Liberals typically favor reform over radical transformation or strict preservation.
    urban_vs_rural_land_priority:
      "prioritize_dense_urban_protect_rural_wilderness", // (Eco +2.5, RP -2.5) Helps achieve negative rural priority and good ecology.
    global_economic_order: "reform_replace_ifi_global_equity_debt_relief", // (Econ -2.5, Sov -2.5, SocFoc -3.5) Internationalist, pro-equity.
    role_of_elites_governance: "popular_will_ultimate_guide",

    // Batch 3 (4 questions from new_policy_questions_green_boost)
    aristocracy_role_governance: "abolish_aristocracy_all_citizens_equal",
    industrialization_urbanization_approach:
      "controlled_industrial_dev_social_environmental_planning", // Strong eco & rural focus
    international_revolutionary_action:
      "moral_diplomatic_aid_aligned_movements", // Support for green/social movements
    basis_of_law_justice: "natural_law_human_rights_secular_constitution",
    // Stances for the 4 NEWEST Green-Focused Questions (from new_policy_questions_green_boost)
    rights_of_nature_ecocide_law: "criminalize_ecocide_strengthen_laws",
    degrowth_steady_state_economy: "green_growth_decoupling_technology",
    transportation_system_overhaul: "electric_vehicles_road_networks",
    food_system_transformation_radical: "sustainable_intensification_agritech",
  },
  Green: {
    healthcare_coverage: "universal_single_payer",
    taxation_wealth: "increase_wealth_tax",
    education_funding: "massive_increase_public_funding",
    environmental_regulation: "strict_green_transition_regulations",
    minimum_wage: "raise_living_wage_inflation_indexed",
    climate_change_agreements: "yes_pursue_climate_goals_vigorously",
    firearm_control: "focus_mental_health_existing_firearm_laws", // (PL +0.5)
    immigration_border_management: "humanitarian_streamline_asylum_refugee",
    student_loan_debt_higher_ed: "tuition_free_debt_free_public_higher_ed",
    trade_policy_global: "fair_trade_labor_environmental_standards",
    criminal_justice_system_reform:
      "rehabilitation_decriminalization_reduce_incarceration",
    public_pension_systems: "raise_cap_increase_contribution_pensions",
    abortion_access_legality: "protect_expand_abortion_access_legal_right",
    defense_spending_priorities: "reduce_defense_spending_diplomacy_domestic",
    tech_company_regulation: "targeted_tech_regulation_specific_harms", // (PL -1.0)
    energy_policy_national_focus: "rapid_transition_renewable_energy",
    infrastructure_investment_funding:
      "large_national_investment_taxes_deficit_infra",
    lgbtq_plus_rights_protections: "national_non_discrimination_lgbtq",
    foreign_policy_assertive_powers: "engagement_diplomacy_assertive_powers",
    campaign_finance_political_donations:
      "increase_transparency_disclosure_donations", // (PL +0.8)
    drug_policy_recreational_substances: "legalize_regulate_most_drugs_tax", // (PL +4.0)
    voting_rights_election_integrity:
      "expand_voting_access_automatic_registration_polling",
    affordable_housing_crisis:
      "public_investment_social_housing_rent_control_affordable",
    parental_leave_policy: "national_mandate_paid_family_leave",
    ai_development_regulation:
      "ai_data_privacy_algorithmic_transparency_bias_mitigation", // (PL +1.8)
    law_enforcement_accountability_reform:
      "reform_officer_protections_misconduct_registry_oversight",
    higher_education_cost_access: "tuition_free_debt_free_public_higher_ed",
    unionization_worker_rights:
      "mandate_worker_representation_boards_codetermination",
    international_aid_allocation:
      "increase_foreign_aid_global_development_initiatives",
    nuclear_weapons_policy: "advocate_unilateral_national_nuclear_disarmament",
    cybersecurity_national_strategy:
      "international_cooperation_global_cyber_norms",
    national_debt_management: "strategic_investments_long_term_growth_debt",
    universal_basic_income_consideration: "implement_nationwide_ubi",
    antitrust_monopoly_policy: "aggressive_antitrust_breakup_monopolies",
    religious_freedom_societal_laws:
      "strict_separation_religion_state_no_exemptions",
    gender_identity_legal_recognition:
      "full_legal_gender_id_self_identification",
    capital_punishment_policy: "abolish_capital_punishment_nationally_globally",
    water_resource_management_global:
      "prioritize_water_conservation_recycling_sustainable_use",
    biodiversity_habitat_conservation:
      "strong_national_biodiversity_protection_expand_areas",
    early_childhood_education_access:
      "universal_national_early_childhood_education",
    sex_education_school_curriculum:
      "comprehensive_medically_accurate_sex_ed_consent_lgbtq",
    prescription_drug_pricing_access: "price_controls_caps_essential_medicines",
    mental_health_services_integration:
      "integrate_mental_physical_health_coverage_parity",
    highest_court_reform_judicial:
      "term_limits_retirement_age_highest_court_judges",
    electoral_district_manipulation_reform:
      "proportional_representation_systems_reduce_districting_impact",
    decentralization_regional_autonomy:
      "support_devolution_regional_local_governments",
    net_neutrality_internet_access:
      "reinstate_strong_net_neutrality_rules_regulator",
    space_exploration_national_priorities:
      "focus_space_funding_earth_observation_climate_disaster",
    private_prison_industry_role: "ban_private_prisons_national_regional",
    juvenile_justice_system_reform_youth:
      "rehabilitation_diversion_community_alternatives_juvenile_justice",
    high_speed_rail_national_network:
      "yes_significant_national_investment_hsr_network",
    rural_digital_connectivity:
      "support_community_municipal_coop_rural_broadband", // (RP +3.5, Auth -3.5)
    carbon_pricing_mechanisms:
      "implement_national_carbon_tax_dividend_or_green_investment",
    fossil_fuel_industry_subsidies:
      "eliminate_all_fossil_fuel_subsidies_immediately",
    gig_economy_labor_protections:
      "third_category_worker_gig_economy_portable_benefits_min_earnings",
    workplace_safety_agency_role:
      "maintain_workplace_safety_agency_funding_collaborative_education",
    undocumented_immigrants_status_policy:
      "pathway_citizenship_long_term_undocumented",
    refugee_asylum_intake_policy:
      "increase_refugee_quotas_expand_asylum_eligibility",
    agricultural_subsidies_food_production:
      "reform_subsidies_small_farms_sustainable_practices_food_security", // (RP +2.5)
    food_security_supply_chain_resilience:
      "invest_local_regional_food_systems_reduce_reliance_long_chains", // (RP +2.5)
    rural_economic_diversification_development:
      "support_rural_economic_diversification_tourism_renewables_remote_work", // (RP +2.5)
    military_alliances_collective_security:
      "strengthen_expand_military_alliances_collective_security",
    foreign_intervention_sovereignty_policy:
      "prioritize_diplomacy_sanctions_soft_power_military_last_resort",
    financial_sector_stability_regulation:
      "strengthen_expand_comprehensive_financial_regulations_stability",
    digital_currency_cryptocurrency_policy:
      "cautious_approach_study_risks_benefits_cbdc_crypto_reg",
    freedom_of_expression_online_content:
      "broad_free_expression_protections_oppose_censorship_hate_speech_laws",
    sex_industry_decriminalization_regulation:
      "fully_decriminalize_consensual_sex_work_safety_rights",
    plastic_waste_pollution_management:
      "national_bans_single_use_plastics_invest_alternatives",
    sustainable_agriculture_food_systems:
      "incentives_assistance_research_sustainable_regenerative_farming",
    standardized_testing_education_assessment:
      "reduce_reliance_standardized_tests_diverse_assessment_methods",
    arts_humanities_stem_education_balance:
      "increase_arts_humanities_funding_emphasis_creativity_critical_thinking",
    end_of_life_options_assisted_dying:
      "legalize_physician_assisted_dying_safeguards_terminally_ill",
    vaccination_policy_public_health_mandates:
      "focus_public_education_voluntary_vaccination_easy_access_vaccines",
    lobbying_political_influence_reform:
      "limit_ban_private_money_public_funding_elections", // (PL -1.5) For Greens, anti-corp influence is key.
    head_of_state_election_system_reform:
      "direct_national_popular_vote_head_of_state",
    data_sovereignty_cross_border_data_flows:
      "negotiate_international_agreements_data_sharing_privacy_cybersecurity",
    government_use_open_source_software:
      "mandate_prefer_open_source_software_government_systems_transparency_security",
    solitary_confinement_prison_practice:
      "restrict_ban_solitary_confinement_vulnerable_populations_long_term",
    restorative_justice_criminal_system_role:
      "widely_implement_fund_restorative_justice_alternative_punitive",
    public_transportation_investment_urban_rural:
      "massive_public_investment_expand_modernize_public_transport_affordable", // (RP +2.0)
    water_infrastructure_safety_modernization:
      "major_national_program_repair_modernize_water_infra_safe_drinking_water",
    offshore_resource_extraction_policy:
      "phase_out_ban_new_offshore_drilling_extraction_renewables_ocean_conservation",
    energy_grid_decentralization_resilience:
      "promote_decentralized_energy_microgrids_local_renewables_community_resilience",
    automation_impact_labor_force_policy:
      "invest_worker_retraining_lifelong_learning_transition_support_automation", // Or UBI for social safety
    work_life_balance_right_to_disconnect:
      "legislate_right_to_disconnect_protect_workers_mental_health",
    skilled_migration_economic_needs_policy:
      "open_visas_fast_track_immigration_exceptional_talent_science_tech_arts",
    predatory_lending_consumer_finance_regulation:
      "strict_caps_interest_rates_fees_consumer_loans_ban_predatory_products",
    consumer_data_privacy_online_rights:
      "strong_consumer_data_rights_access_delete_opt_out_gdpr_style",
    international_arms_sales_export_policy:
      "strictly_limit_arms_sales_human_rights_conflict_zones",
    intellectual_property_pharmaceutical_access:
      "open_source_research_public_funding_essential_medicines_reduce_patent_reliance",
    animal_welfare_industrial_agriculture:
      "strict_national_standards_animal_welfare_industrial_farming_phase_out_confinement",
    wilderness_conservation_public_lands_use:
      "maximize_wilderness_ecological_restoration", // CHANGED
    history_education_curriculum_national_narrative:
      "comprehensive_critical_history_multiple_perspectives_past_injustices_controversies",
    rural_healthcare_access_improvement_strategies:
      "increase_public_funding_rural_hospitals_clinics_recruitment_professionals", // (RP +3.8)
    judicial_appointment_selection_process:
      "increase_diversity_gender_ethnicity_background_bench_appointments",
    government_surveillance_privacy_security_balance:
      "strict_limits_surveillance_warrants_data_collection_ban_mass_surveillance",
    forensic_science_criminal_justice_standards:
      "ensure_defense_equal_access_forensic_expertise_testing_resources",
    public_funding_arts_culture_heritage:
      "significantly_increase_public_funding_arts_culture_heritage_essential",
    national_disaster_preparedness_relief_funding:
      "increase_national_investment_climate_resilience_mitigation_rapid_response",
    indigenous_peoples_rights_land_claims:
      "recognize_treaty_obligations_settle_land_claims_support_indigenous_self_governance",
    ocean_health_fisheries_management:
      "expand_marine_protected_areas_strict_catch_limits_combat_illegal_fishing",
    corporate_social_responsibility_mandates:
      "mandate_minimum_csr_standards_large_corporations_penalties",
    genetic_engineering_bioethics_regulation:
      "cautious_tech_ethics_equity_sustainability", // CHANGED (Eco +2.0, Digitalization -1.0)
    news_media_objectivity_disinformation_policy:
      "support_independent_fact_checking_media_literacy_programs_citizens",
    resource_nationalization_foreign_investment:
      "stronger_regulation_taxes_royalties_private_foreign_companies_key_sectors_not_nationalization",
    urban_planning_sustainable_cities_policy:
      "prioritize_mixed_use_dev_public_transport_green_spaces_affordable_housing_planning_regs",
    cultural_heritage_repatriation_artifacts:
      "proactively_review_repatriate_artifacts_colonial_rule_illicitly_international_norms",
    pandemic_preparedness_global_health_security:
      "strengthen_global_health_regulations_equitable_access_vaccines_treatments_all_countries",

    // Stances for the 14 NEWEST Policy Questions
    head_of_state_system: "direct_popular_election_hos",
    land_reform_agricultural_structure: "eco_social_land_use",
    state_control_information_media: "public_service_media_regulation",
    role_of_religion_in_state: "strict_secularism_separation",
    national_service_civic_duty: "mandatory_civilian_service_community", // Green lean towards collective eco/social service
    // Batch 2 (5 questions from new_policy_questions_batch_2)
    legislative_judicial_structure: "peoples_assemblies_community_courts",
    societal_change_philosophy: "rapid_transformative_social_change",
    urban_vs_rural_land_priority: "maximize_wilderness_ecological_restoration",
    global_economic_order: "reform_replace_ifi_global_equity_debt_relief",
    role_of_elites_governance: "popular_will_ultimate_guide",
    // Batch 3 (4 questions from new_policy_questions_green_boost)
    aristocracy_role_governance: "abolish_aristocracy_all_citizens_equal",
    industrialization_urbanization_approach:
      "decentralized_rural_industries_agrarian_communities", // Strong eco & rural focus
    international_revolutionary_action:
      "moral_diplomatic_aid_aligned_movements", // Support for green/social movements
    basis_of_law_justice: "natural_law_human_rights_secular_constitution",
    // Stances for the 4 NEWEST Green-Focused Questions (from new_policy_questions_green_boost)
    rights_of_nature_ecocide_law: "grant_nature_rights_criminalize_ecocide",
    degrowth_steady_state_economy:
      "degrowth_steady_state_economy_sustainability",
    transportation_system_overhaul: "free_public_transport_restrict_cars",
    food_system_transformation_radical: "localized_organic_plant_based_diets",
  },
  Socialist: {
    healthcare_coverage: "universal_single_payer",
    taxation_wealth: "increase_wealth_tax",
    education_funding: "massive_increase_public_funding",
    environmental_regulation: "strict_green_transition_regulations",
    minimum_wage: "raise_living_wage_inflation_indexed",
    climate_change_agreements: "yes_pursue_climate_goals_vigorously",
    firearm_control: "strict_firearm_controls_bans",
    immigration_border_management:
      "comprehensive_reform_legal_pathways_root_causes",
    student_loan_debt_higher_ed: "tuition_free_debt_free_public_higher_ed",
    trade_policy_global: "reduce_reliance_foreign_goods_self_sufficiency",
    criminal_justice_system_reform:
      "tough_on_crime_stricter_penalties_police_funding",
    public_pension_systems: "raise_cap_increase_contribution_pensions",
    abortion_access_legality: "protect_expand_abortion_access_legal_right",
    defense_spending_priorities:
      "maintain_current_defense_modernization_readiness",
    tech_company_regulation: "break_up_big_tech_companies",
    energy_policy_national_focus: "rapid_transition_renewable_energy",
    infrastructure_investment_funding:
      "large_national_investment_taxes_deficit_infra",
    lgbtq_plus_rights_protections: "national_non_discrimination_lgbtq",
    foreign_policy_assertive_powers: "confrontational_assertive_powers",
    campaign_finance_political_donations:
      "limit_ban_private_money_public_funding_elections",
    drug_policy_recreational_substances:
      "maintain_national_prohibition_cannabis_drugs",
    voting_rights_election_integrity:
      "balance_access_security_standardize_national_election_rules",
    affordable_housing_crisis:
      "public_investment_social_housing_rent_control_affordable",
    parental_leave_policy: "national_mandate_paid_family_leave",
    ai_development_regulation: "national_agency_ai_safety_ethics_oversight",
    law_enforcement_accountability_reform:
      "support_law_enforcement_oppose_hindrance_policing",
    higher_education_cost_access: "tuition_free_debt_free_public_higher_ed",
    unionization_worker_rights:
      "mandate_worker_representation_boards_codetermination",
    international_aid_allocation:
      "increase_foreign_aid_global_development_initiatives",
    nuclear_weapons_policy: "pursue_disarmament_strengthen_non_proliferation",
    cybersecurity_national_strategy:
      "invest_offensive_defensive_cyber_priority",
    national_debt_management: "strategic_investments_long_term_growth_debt",
    universal_basic_income_consideration: "implement_nationwide_ubi",
    antitrust_monopoly_policy: "aggressive_antitrust_breakup_monopolies",
    religious_freedom_societal_laws:
      "strict_separation_religion_state_no_exemptions",
    gender_identity_legal_recognition:
      "full_legal_gender_id_self_identification",
    capital_punishment_policy:
      "support_capital_punishment_heinous_crimes_due_process",
    water_resource_management_global:
      "invest_large_scale_water_infrastructure_supply",
    biodiversity_habitat_conservation:
      "balance_biodiversity_economic_development_resource_use",
    early_childhood_education_access:
      "universal_national_early_childhood_education",
    sex_education_school_curriculum:
      "comprehensive_medically_accurate_sex_ed_consent_lgbtq",
    prescription_drug_pricing_access: "price_controls_caps_essential_medicines",
    mental_health_services_integration:
      "integrate_mental_physical_health_coverage_parity",
    highest_court_reform_judicial: "expand_number_judges_highest_court_balance",
    electoral_district_manipulation_reform:
      "national_standards_redistricting_compactness_community",
    decentralization_regional_autonomy:
      "strengthen_central_government_authority",
    net_neutrality_internet_access:
      "reinstate_strong_net_neutrality_rules_regulator",
    space_exploration_national_priorities:
      "increase_space_agency_funding_exploration_research",
    private_prison_industry_role: "ban_private_prisons_national_regional",
    juvenile_justice_system_reform_youth:
      "stricter_penalties_serious_juvenile_offenses_try_as_adults",
    high_speed_rail_national_network:
      "yes_significant_national_investment_hsr_network",
    rural_digital_connectivity:
      "national_funding_public_utility_universal_rural_broadband",
    carbon_pricing_mechanisms:
      "prefer_direct_regulation_subsidies_voluntary_over_carbon_pricing",
    fossil_fuel_industry_subsidies:
      "eliminate_all_fossil_fuel_subsidies_immediately",
    gig_economy_labor_protections:
      "classify_gig_workers_employees_full_benefits_protections",
    workplace_safety_agency_role:
      "increase_workplace_safety_agency_funding_enforcement_standards",
    undocumented_immigrants_status_policy:
      "pathway_citizenship_long_term_undocumented",
    refugee_asylum_intake_policy:
      "maintain_current_refugee_intake_efficient_fair_asylum_processing",
    agricultural_subsidies_food_production:
      "maintain_current_subsidies_stable_food_supply_farmer_livelihoods",
    food_security_supply_chain_resilience:
      "strengthen_national_food_reserves_diversify_international_sources", // (Auth +2.5). Good.
    rural_economic_diversification_development:
      "invest_rural_infrastructure_broadband_healthcare_education_transport", // (RP +3.5). Very pro-rural for RP 0 ideal.
    military_alliances_collective_security:
      "reduce_reliance_alliances_flexible_coalitions_national_defense",
    foreign_intervention_sovereignty_policy:
      "non_interventionism_domestic_priorities_avoid_foreign_entanglements",
    financial_sector_stability_regulation:
      "strengthen_expand_comprehensive_financial_regulations_stability",
    digital_currency_cryptocurrency_policy:
      "develop_pilot_national_cbdc_modernize_payments",
    freedom_of_expression_online_content:
      "hold_online_platforms_accountable_harmful_content_disinformation_regulation",
    sex_industry_decriminalization_regulation:
      "support_nordic_model_sex_work_criminalize_buyers_decriminalize_sellers",
    plastic_waste_pollution_management:
      "national_bans_single_use_plastics_invest_alternatives",
    sustainable_agriculture_food_systems:
      "regulate_pesticides_fertilizers_water_use_monoculture_stringently",
    standardized_testing_education_assessment:
      "standardized_tests_key_tool_accountability_achievement_gaps_standards",
    arts_humanities_stem_education_balance:
      "increase_arts_humanities_funding_emphasis_creativity_critical_thinking",
    end_of_life_options_assisted_dying:
      "oppose_physician_assisted_dying_moral_ethical_religious_grounds", // CHANGED from "legalize". (PL -3.8). State control over life/death.
    vaccination_policy_public_health_mandates:
      "support_vaccine_mandates_schools_healthcare_public_sector_outbreaks", // (PL -3.0, Auth +2.8). Good.
    lobbying_political_influence_reform:
      "limit_ban_private_money_public_funding_elections",
    head_of_state_election_system_reform:
      "maintain_current_electoral_system_head_of_state", // (Auth +1.8). More stable/institutional.
    data_sovereignty_cross_border_data_flows:
      "implement_data_localization_requirements_citizen_data_national_borders", // CHANGED from "negotiate_intl_agreements". (Sov +3.8, Auth +1.8). State control.
    government_use_open_source_software:
      "mandate_prefer_open_source_software_government_systems_transparency_security",
    solitary_confinement_prison_practice:
      "solitary_confinement_necessary_tool_prison_safety_order_discipline", // CHANGED from "restrict_ban". (PL -3.5, Auth +3.5).
    restorative_justice_criminal_system_role:
      "skeptical_restorative_justice_undermine_deterrence_retribution", // (Auth +2.5).
    public_transportation_investment_urban_rural:
      "massive_public_investment_expand_modernize_public_transport_affordable",
    water_infrastructure_safety_modernization:
      "major_national_program_repair_modernize_water_infra_safe_drinking_water",
    offshore_resource_extraction_policy:
      "phase_out_ban_new_offshore_drilling_extraction_renewables_ocean_conservation",
    energy_grid_decentralization_resilience:
      "invest_national_smart_grid_transmission_storage_renewables_reliability", // (Auth +2.5).
    automation_impact_labor_force_policy:
      "ubi_stronger_social_safety_net_automation_job_displacement",
    work_life_balance_right_to_disconnect:
      "legislate_right_to_disconnect_protect_workers_mental_health",
    skilled_migration_economic_needs_policy:
      "points_based_system_skilled_migration_demand_sectors_permanent_residency",
    predatory_lending_consumer_finance_regulation:
      "strict_caps_interest_rates_fees_consumer_loans_ban_predatory_products",
    consumer_data_privacy_online_rights:
      "comprehensive_crypto_regulation_investor_protection_stability_illicit_use",
    international_arms_sales_export_policy:
      "strictly_limit_arms_sales_human_rights_conflict_zones",
    intellectual_property_pharmaceutical_access:
      "open_source_research_public_funding_essential_medicines_reduce_patent_reliance",
    animal_welfare_industrial_agriculture:
      "strict_national_standards_animal_welfare_industrial_farming_phase_out_confinement",
    wilderness_conservation_public_lands_use:
      "strong_national_biodiversity_protection_expand_areas",
    history_education_curriculum_national_narrative:
      "comprehensive_critical_history_multiple_perspectives_past_injustices_controversies",
    rural_healthcare_access_improvement_strategies:
      "increase_public_funding_rural_hospitals_clinics_recruitment_professionals", // (RP +3.8).
    judicial_appointment_selection_process:
      "prioritize_judicial_philosophy_ideological_alignment_appointments", // (Auth +2.5).
    government_surveillance_privacy_security_balance:
      "expand_surveillance_powers_advanced_tech_counter_terrorism_crime_judicial_oversight", // (PL -3.5, Auth +2.5).
    forensic_science_criminal_justice_standards:
      "national_standards_forensic_accreditation_labs_certification_practitioners", // (Auth +2.5).
    public_funding_arts_culture_heritage:
      "significantly_increase_public_funding_arts_culture_heritage_essential",
    national_disaster_preparedness_relief_funding:
      "increase_national_investment_climate_resilience_mitigation_rapid_response",
    indigenous_peoples_rights_land_claims:
      "recognize_treaty_obligations_settle_land_claims_support_indigenous_self_governance",
    ocean_health_fisheries_management:
      "expand_marine_protected_areas_strict_catch_limits_combat_illegal_fishing",
    corporate_social_responsibility_mandates:
      "mandate_minimum_csr_standards_large_corporations_penalties",
    genetic_engineering_bioethics_regulation:
      "strict_regulations_ethical_oversight_genetic_engineering_ban_certain_applications",
    // State media control would be more Auth+
    news_media_objectivity_disinformation_policy:
      "strengthen_public_service_broadcasting_impartial_news_counterweight_partisan_media",
    resource_nationalization_foreign_investment:
      "support_nationalization_key_resources_industries_public_benefit_national_control",
    urban_planning_sustainable_cities_policy:
      "prioritize_mixed_use_dev_public_transport_green_spaces_affordable_housing_planning_regs",
    cultural_heritage_repatriation_artifacts:
      "proactively_review_repatriate_artifacts_colonial_rule_illicitly_international_norms",
    pandemic_preparedness_global_health_security:
      "strengthen_global_health_regulations_equitable_access_vaccines_treatments_all_countries",

    // Stances for the 14 NEWEST Policy Questions
    head_of_state_system: "revolutionary_vanguard_party", // (Auth +4.0, PL -4.0)
    land_reform_agricultural_structure: "full_land_collectivization", // (Econ -4.0, Auth +3.0, PL -3.5)
    state_control_information_media: "full_state_media_control", // (PL -4.0, Auth +4.0)
    role_of_religion_in_state: "strict_secularism_separation", // (Theo -4.0)
    national_service_civic_duty: "mandatory_civilian_service_community", // (PL -2.5, Auth +1.5, SocFoc -2.5)
    legislative_judicial_structure: "legislature_judiciary_subordinate_to_hos", // (Auth +3.8, PL -3.0) - Assuming HOS is the party/state
    societal_change_philosophy: "rapid_transformative_social_change", // (ST -4.0)
    urban_vs_rural_land_priority:
      "prioritize_dense_urban_protect_rural_wilderness", // (RP -2.5) - Helps RP target 0
    global_economic_order: "reform_replace_ifi_global_equity_debt_relief", // (Sov -2.5)
    role_of_elites_governance: "revolutionary_vanguard_leads_masses", // (Auth +3.5, PL -3.5, Gov -3.0)
    aristocracy_role_governance: "abolish_aristocracy_all_citizens_equal", // (ST -3.0)
    industrialization_urbanization_approach:
      "controlled_industrial_dev_social_environmental_planning",
    international_revolutionary_action: "actively_support_global_revolution",
    basis_of_law_justice: "collective_will_proletariat_social_justice",
  },
};
