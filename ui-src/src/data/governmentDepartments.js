// ui-src/src/data/governmentDepartments.js

/**
 * Provides standardized government department IDs for different levels of government.
 * These can be mapped to specific countries based on their political systems.
 */

export const CITY_DEPARTMENTS = [
  "parks_recreation",
  "public_works", 
  "police",
  "fire_emergency",
  "planning_zoning",
  "water_utilities",
  "sanitation_waste",
  "transportation",
  "housing_development",
  "economic_development",
  "code_enforcement",
  "libraries",
  "public_health",
  "social_services",
  "finance_budget",
  "human_resources",
  "legal_affairs",
  "information_technology",
  "permits_licensing",
  "environmental_services"
];

export const COUNTY_DEPARTMENTS = [
  "sheriffs_office",
  "public_health",
  "social_services",
  "emergency_management",
  "roads_highways",
  "parks_recreation",
  "planning_development",
  "environmental_health",
  "animal_control",
  "courts_administration",
  "elections",
  "tax_assessment",
  "public_works",
  "corrections",
  "mental_health",
  "veterans_affairs",
  "aging_services",
  "child_protective_services",
  "workforce_development",
  "economic_development",
  "fire_rescue",
  "medical_examiner",
  "library_system",
  "building_inspections"
];

export const STATE_DEPARTMENTS = [
  "education",
  "transportation",
  "health_human_services",
  "public_safety",
  "environmental_protection",
  "labor_workforce",
  "commerce_economic_development",
  "agriculture",
  "natural_resources",
  "corrections",
  "revenue_taxation",
  "motor_vehicles",
  "insurance",
  "banking_finance",
  "public_utilities",
  "veterans_affairs",
  "emergency_management",
  "mental_health",
  "children_families",
  "housing_community_development",
  "parks_wildlife",
  "energy",
  "technology_innovation",
  "cultural_affairs",
  "consumer_protection",
  "professional_licensing",
  "state_police",
  "fire_marshal",
  "public_health",
  "higher_education"
];

export const NATIONAL_DEPARTMENTS = [
  "defense",
  "state_foreign_affairs",
  "treasury_finance",
  "justice_attorney_general", 
  "interior_home_affairs",
  "agriculture",
  "commerce_trade",
  "labor_employment",
  "health_human_services",
  "housing_urban_development",
  "transportation",
  "energy",
  "education",
  "veterans_affairs",
  "homeland_security",
  "environmental_protection",
  "immigration",
  "social_security",
  "postal_services",
  "communications_media",
  "science_technology",
  "space_aerospace",
  "intelligence_services",
  "customs_border",
  "tax_revenue",
  "central_bank",
  "statistics_census",
  "foreign_aid_development",
  "cultural_heritage",
  "public_procurement",
  "civil_service",
  "audit_accountability",
  "emergency_management",
  "maritime_affairs",
  "aviation_transport",
  "railways",
  "mining_geology",
  "fisheries",
  "forestry",
  "tourism",
  "sports_youth"
];

/**
 * Common department groupings by government level for easy country mapping
 */
export const DEPARTMENT_LEVELS = {
  CITY: CITY_DEPARTMENTS,
  COUNTY: COUNTY_DEPARTMENTS, 
  STATE: STATE_DEPARTMENTS,
  NATIONAL: NATIONAL_DEPARTMENTS
};

/**
 * Regional variations - some countries may use different department structures
 */
export const REGIONAL_DEPARTMENT_VARIATIONS = {
  // Parliamentary systems might have these additional departments
  PARLIAMENTARY: {
    NATIONAL: [
      "cabinet_office",
      "parliamentary_affairs", 
      "constitutional_affairs",
      "devolution_regions"
    ]
  },
  
  // Federal systems might have coordination departments
  FEDERAL: {
    NATIONAL: [
      "federal_relations",
      "intergovernmental_affairs",
      "constitutional_law"
    ]
  },
  
  // Monarchies might have royal/ceremonial departments
  MONARCHY: {
    NATIONAL: [
      "royal_household",
      "ceremonial_affairs",
      "honors_awards"
    ]
  }
};