// ui-src/src/utils/statCalculationCore.js
import { ECONOMIC_OUTLOOK_LEVELS, RATING_LEVELS } from "../data/governmentData";
import { POLICY_QUESTIONS } from "../data/policyData";

/**
 * Calculates the current healthcare coverage percentage and the actual cost per person.
 *
 * @param {object} params
 * @param {number} params.population
 * @param {number} params.currentBudgetAllocationForHealthcare
 * @param {object} params.demographics
 * @param {object} params.economicProfile
 * @param {number} [params.governmentEfficiency=1]
 * @returns {{healthcareCoverage: number, healthcareCostPerPerson: number}}
 */
export const calculateHealthcareMetrics = ({
  population,
  currentBudgetAllocationForHealthcare,
  demographics,
  economicProfile,
  governmentEfficiency = 1, // Default to 1 (no efficiency impact) for now
}) => {
  if (population <= 0) {
    return { healthcareCoverage: 0, healthcareCostPerPerson: 0 };
  }

  const BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE = 200;

  let effectiveCostPerCapita =
    BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE;

  const seniorRatio = demographics.ageDistribution?.senior / 100 || 0.15;
  effectiveCostPerCapita *= 1 + (seniorRatio - 0.1) * 0.5;

  const gdpPerCapitaNormalized = economicProfile.gdpPerCapita / 50000;
  effectiveCostPerCapita *= 1 + (gdpPerCapitaNormalized - 1) * 0.1;

  effectiveCostPerCapita /= governmentEfficiency;

  let healthcareCoverage = 0;
  if (effectiveCostPerCapita > 0) {
    const requiredBudgetFor100Percent = population * effectiveCostPerCapita;
    healthcareCoverage =
      (currentBudgetAllocationForHealthcare / requiredBudgetFor100Percent) *
      100;
  }

  healthcareCoverage = Math.max(0, Math.min(100, healthcareCoverage));

  const healthcareCostPerPerson =
    currentBudgetAllocationForHealthcare / population;

  return {
    healthcareCoverage: parseFloat(healthcareCoverage.toFixed(1)),
    healthcareCostPerPerson: parseFloat(healthcareCostPerPerson.toFixed(2)),
  };
};

/**
 * Calculates the current poverty rate as a percentage.
 *
 * @param {object} params
 * @param {number} params.population - The total population.
 * @param {object} params.economicProfile - Contains gdpPerCapita and unemploymentRate.
 * @param {number} params.budgetAllocationForSocialWelfare - Annual budget for social welfare services.
 * @param {string} params.educationQuality - Current education quality rating (e.g., "Average", "Good").
 * @param {object} params.demographics - Population demographics (e.g., age distribution, specific vulnerable groups).
 * @param {number} [params.governmentEfficiency=1] - Efficiency of government services.
 * @param {object} params.activePolicies - Object mapping policy IDs to their chosen values.
 * @returns {number} The poverty rate as a percentage.
 */
export const calculatePovertyRate = ({
  population,
  economicProfile,
  budgetAllocationForSocialWelfare,
  educationQuality,
  demographics,
  governmentEfficiency = 1,
  activePolicies = {},
}) => {
  if (population <= 0) return 0;

  // Base poverty rate for a generic city
  let povertyRate = 18.0; // Starting point, e.g., 18%

  // --- Economic Factors ---
  const gdpPerCapita = economicProfile?.gdpPerCapita || 40000;
  const unemploymentRate = economicProfile?.unemploymentRate || 6.0; // Assuming 6% if not explicitly tracked
  const economicOutlook = economicProfile?.economicOutlook; // From governmentData.js

  // Adjust based on GDP per capita
  // Example: GDP below 30k increases poverty, above 50k decreases it
  povertyRate += (40000 - gdpPerCapita) / 2000; // 2k GDP difference = 1% poverty change

  // Adjust based on unemployment rate
  povertyRate += (unemploymentRate - 6.0) * 2.5; // 1% unemployment change = 2.5% poverty change

  // Adjust based on economic outlook levels
  const econOutlookIndex = ECONOMIC_OUTLOOK_LEVELS.indexOf(economicOutlook);
  if (econOutlookIndex !== -1) {
    povertyRate += [-3.0, -1.5, 0.0, 1.5, 3.0][econOutlookIndex] * -1; // Booming = -3%, Recession = +3%
  }

  // --- Social Welfare Spending ---
  const effectiveSocialWelfarePerCapita =
    (budgetAllocationForSocialWelfare / population) * governmentEfficiency;
  // Assumed target spending for significant impact
  const TARGET_SW_SPENDING_PER_CAPITA = 150;

  if (effectiveSocialWelfarePerCapita > TARGET_SW_SPENDING_PER_CAPITA) {
    povertyRate -= Math.min(
      5,
      (effectiveSocialWelfarePerCapita - TARGET_SW_SPENDING_PER_CAPITA) / 50
    );
  } else {
    povertyRate += Math.min(
      5,
      (TARGET_SW_SPENDING_PER_CAPITA - effectiveSocialWelfarePerCapita) / 30
    );
  }

  // --- Education Quality ---
  const educationQualityIndex = RATING_LEVELS.indexOf(educationQuality);
  if (educationQualityIndex !== -1) {
    povertyRate += [-2.0, -1.0, 0.0, 1.0, 2.0][educationQualityIndex] * -1; // Excellent = -2%, Very Poor = +2%
  }

  // --- Policy Influence ---
  // Example: Check for UBI or similar social safety net policies
  if (
    activePolicies["universal_basic_income_ubi"] ===
    "universal_basic_income_ubi"
  ) {
    povertyRate -= 5.0; // Significant reduction from UBI
  }
  if (
    activePolicies["reduce_govt_role_personal_responsibility_charity"] ===
    "reduce_govt_role_personal_responsibility_charity"
  ) {
    povertyRate += 3.0; // Increase if government role is reduced
  }

  // --- Demographic Vulnerability (simple example) ---
  const youthUnemploymentSensitivity =
    (demographics?.ageDistribution?.youth || 20) / 100; // Example: youth population %
  // This could be linked to a separate unemployment calculation for youth or just a baseline effect
  povertyRate += (youthUnemploymentSensitivity - 0.2) * 2; // If youth are more than 20%, slight increase

  // Clamp poverty rate between a reasonable min/max
  povertyRate = Math.max(0.5, Math.min(50.0, povertyRate)); // Minimum 0.5% to avoid 0, max 50%

  return parseFloat(povertyRate.toFixed(1));
};

/**
 * Calculates the current crime rate (e.g., crimes per 1000 population).
 *
 * @param {object} params
 * @param {number} params.population - The total population.
 * @param {object} params.economicProfile - Contains unemploymentRate.
 * @param {number} params.budgetAllocationForPublicSafety - Annual budget for public safety services.
 * @param {number} params.povertyRate - The current poverty rate (calculated separately).
 * @param {string} params.educationQuality - Current education quality rating.
 * @param {object} params.activePolicies - Object mapping policy IDs to their chosen values.
 * @param {string} params.cityType - Type of city (e.g., "Metropolitan", "Rural").
 * @param {number} [params.governmentEfficiency=1] - Efficiency of government services.
 * @returns {number} The crime rate (e.g., per 1000 population).
 */
export const calculateCrimeRate = ({
  population,
  economicProfile,
  budgetAllocationForPublicSafety,
  povertyRate,
  educationQuality,
  activePolicies = {},
  cityType,
  governmentEfficiency = 1,
}) => {
  if (population <= 0) return 0;

  // Base crime rate per 1000 population
  let crimeRate = 35.0; // Starting point, e.g., 35 crimes per 1000

  // --- Public Safety Spending ---
  const effectivePublicSafetySpendingPerCapita =
    (budgetAllocationForPublicSafety / population) * governmentEfficiency;
  const TARGET_PS_SPENDING_PER_CAPITA = 100; // Assumed target for significant impact

  if (effectivePublicSafetySpendingPerCapita > TARGET_PS_SPENDING_PER_CAPITA) {
    crimeRate -= Math.min(
      10,
      (effectivePublicSafetySpendingPerCapita - TARGET_PS_SPENDING_PER_CAPITA) /
        20
    );
  } else {
    crimeRate += Math.min(
      10,
      (TARGET_PS_SPENDING_PER_CAPITA - effectivePublicSafetySpendingPerCapita) /
        10
    );
  }

  // --- Socioeconomic Factors ---
  const unemploymentRate = economicProfile?.unemploymentRate || 6.0;
  crimeRate += (unemploymentRate - 6.0) * 3.0; // 1% unemployment change = 3 crimes/1000 change

  crimeRate += (povertyRate - 15.0) * 1.5; // 1% poverty change = 1.5 crimes/1000 change

  const educationQualityIndex = RATING_LEVELS.indexOf(educationQuality);
  if (educationQualityIndex !== -1) {
    crimeRate += [-3.0, -1.5, 0.0, 1.5, 3.0][educationQualityIndex] * -1; // Excellent = -3, Very Poor = +3
  }

  // --- City Type Influence (simple example) ---
  if (cityType === "Metropolitan") {
    crimeRate += 5.0; // Higher base crime in large cities
  } else if (cityType === "Rural") {
    crimeRate -= 5.0; // Lower base crime in rural areas
  }

  // --- Policy Influence ---
  // ... (policy influence logic remains the same)
  const findPolicyOption = (policyId) => {
    const policy = POLICY_QUESTIONS.find((q) => q.id === policyId);
    if (policy && activePolicies[policyId]) {
      return policy.options.find((o) => o.value === activePolicies[policyId]);
    }
    return null;
  };

  const criminalJusticePolicy = findPolicyOption(
    "criminal_justice_system_reform"
  );
  if (criminalJusticePolicy) {
    if (
      criminalJusticePolicy.value ===
      "tough_on_crime_stricter_penalties_police_funding"
    ) {
      crimeRate -= 5.0; // Immediate perceived reduction, but could have long term negatives not modeled here
    } else if (
      criminalJusticePolicy.value ===
      "rehabilitation_decriminalization_reduce_incarceration"
    ) {
      crimeRate += 2.0; // Short term increase as minor offenses are decriminalized or reported differently
    }
  }

  const drugPolicy = findPolicyOption("drug_policy_criminalization_treatment");
  if (drugPolicy) {
    if (
      drugPolicy.value ===
      "strict_drug_enforcement_increased_penalties_border_control"
    ) {
      crimeRate -= 3.0;
    } else if (
      drugPolicy.value ===
      "decriminalize_legalize_drugs_public_health_treatment"
    ) {
      crimeRate += 1.0; // Might initially slightly increase reported minor drug crimes
    }
  }

  const firearmControlPolicy = findPolicyOption("firearm_control");
  if (firearmControlPolicy) {
    if (
      firearmControlPolicy.value === "implement_strict_firearm_controls_bans"
    ) {
      crimeRate -= 4.0;
    } else if (
      firearmControlPolicy.value ===
      "oppose_restrictions_firearm_ownership_rights"
    ) {
      crimeRate += 2.0;
    }
  }

  const lawEnforcementAccountabilityPolicy = findPolicyOption(
    "law_enforcement_accountability_reform"
  );
  if (lawEnforcementAccountabilityPolicy) {
    if (
      lawEnforcementAccountabilityPolicy.value ===
      "invest_social_programs_root_causes_crime_reduce_police_intervention"
    ) {
      crimeRate -= 3.0; // Long-term positive effect
    } else if (
      lawEnforcementAccountabilityPolicy.value ===
      "support_law_enforcement_oppose_hindrance_policing"
    ) {
      crimeRate -= 1.0; // Could show short-term stability
    }
  }

  // Clamp crime rate between a reasonable min/max
  crimeRate = Math.max(5.0, Math.min(150.0, crimeRate)); // Minimum 5 crimes/1000, max 150 crimes/1000

  return parseFloat(crimeRate.toFixed(1));
};

export const calculateAllCityStats = (city) => {
  if (!city || !city.stats || !city.economicProfile || !city.demographics) {
    console.warn("[StatCalc] Missing core city data for calculation.");
    return {};
  }

  const { population, demographics, economicProfile, stats } = city;
  const { budget } = stats;

  // --- Step 1: Calculate primary metrics ---
  const { healthcareCoverage, healthcareCostPerPerson } =
    calculateHealthcareMetrics({
      population,
      currentBudgetAllocationForHealthcare:
        budget.expenseAllocations.publicHealthServices,
      demographics,
      economicProfile,
    });

  const povertyRate = calculatePovertyRate({
    population,
    economicProfile,
    budgetAllocationForSocialWelfare:
      budget.expenseAllocations.socialWelfarePrograms,
    educationQuality: stats.educationQuality,
    demographics,
    // activePolicies: city.cityLaws, // Pass active policies/laws here
  });

  const crimeRatePer1000 = calculateCrimeRate({
    population,
    economicProfile,
    budgetAllocationForPublicSafety: budget.expenseAllocations.policeDepartment,
    publicSafetyRating: stats.publicSafetyRating,
    povertyRate, // Use the newly calculated poverty rate
    educationQuality: stats.educationQuality,
    cityType: stats.type,
    // activePolicies: city.cityLaws,
  });

  // Calculate unemployment rate based on economic factors
  const calculateUnemploymentRate = (economicProfile, povertyRate, cityType) => {
    let baseUnemploymentRate = 6.0; // National average baseline
    
    // Adjust based on GDP per capita
    const gdpPerCapita = economicProfile?.gdpPerCapita || 40000;
    if (gdpPerCapita > 60000) baseUnemploymentRate -= 1.5;
    else if (gdpPerCapita > 45000) baseUnemploymentRate -= 0.8;
    else if (gdpPerCapita < 30000) baseUnemploymentRate += 1.2;
    else if (gdpPerCapita < 35000) baseUnemploymentRate += 0.6;
    
    // Poverty rate correlation
    baseUnemploymentRate += (povertyRate - 15.0) * 0.15;
    
    // City type adjustments
    if (cityType === "Metropolitan") baseUnemploymentRate += 0.3;
    else if (cityType === "Rural") baseUnemploymentRate += 0.8;
    else if (cityType === "Suburban") baseUnemploymentRate -= 0.2;
    
    // Economic outlook influence
    const economicOutlook = economicProfile?.economicOutlook;
    if (economicOutlook === "Booming") baseUnemploymentRate -= 1.5;
    else if (economicOutlook === "Strong Growth") baseUnemploymentRate -= 0.8;
    else if (economicOutlook === "Stagnant") baseUnemploymentRate += 0.8;
    else if (economicOutlook === "Recession") baseUnemploymentRate += 2.0;
    
    // Clamp between reasonable bounds
    return Math.max(1.0, Math.min(25.0, baseUnemploymentRate));
  };

  const unemploymentRate = calculateUnemploymentRate(economicProfile, povertyRate, stats.type);

  // Calculate Education Quality based on education budget allocation
  const calculateEducationQuality = (population, educationBudget) => {
    const budgetPerStudent = educationBudget / (population * 0.2); // Assume ~20% are students
    if (budgetPerStudent > 8000) return "Excellent";
    else if (budgetPerStudent > 6000) return "Good"; 
    else if (budgetPerStudent > 4000) return "Average";
    else if (budgetPerStudent > 2000) return "Poor";
    else return "Very Poor";
  };

  // Calculate Infrastructure State based on infrastructure budget allocation
  const calculateInfrastructureState = (population, infraBudget) => {
    const budgetPerCapita = infraBudget / population;
    if (budgetPerCapita > 500) return "Excellent";
    else if (budgetPerCapita > 300) return "Good";
    else if (budgetPerCapita > 150) return "Average"; 
    else if (budgetPerCapita > 50) return "Poor";
    else return "Very Poor";
  };

  // Calculate Environment Rating based on environmental budget allocation
  const calculateEnvironmentRating = (population, envBudget) => {
    const budgetPerCapita = envBudget / population;
    if (budgetPerCapita > 100) return "Excellent";
    else if (budgetPerCapita > 60) return "Good";
    else if (budgetPerCapita > 30) return "Average";
    else if (budgetPerCapita > 10) return "Poor"; 
    else return "Very Poor";
  };

  // Calculate Culture & Arts Rating based on culture budget allocation
  const calculateCultureArtsRating = (population, cultureBudget) => {
    const budgetPerCapita = cultureBudget / population;
    if (budgetPerCapita > 80) return "Excellent";
    else if (budgetPerCapita > 50) return "Good";
    else if (budgetPerCapita > 25) return "Average";
    else if (budgetPerCapita > 10) return "Poor";
    else return "Very Poor";
  };

  const educationQuality = calculateEducationQuality(population, budget.expenseAllocations.education || 0);
  const infrastructureState = calculateInfrastructureState(population, budget.expenseAllocations.infrastructure || 0);
  const environmentRating = calculateEnvironmentRating(population, budget.expenseAllocations.wasteManagement || 0);
  const cultureArtsRating = calculateCultureArtsRating(population, budget.expenseAllocations.cultureArts || 0);

  // --- Step 2: Return an object with all the updated stats ---
  // This can be spread onto the existing stats object in the monthly tick.
  return {
    healthcareCoverage,
    healthcareCostPerPerson,
    povertyRate,
    crimeRatePer1000,
    unemploymentRate: parseFloat(unemploymentRate.toFixed(1)),
    educationQuality,
    infrastructureState,
    environmentRating,
    cultureArtsRating,
    // Add any other future calculated stats here
  };
};

//immigration rate,
