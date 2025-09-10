// src/utils/statCalculationEngine.js
// Unified Statistics Calculation Engine
// Consolidates all stat calculation logic and integrates with education system

import { ECONOMIC_OUTLOOK_LEVELS, RATING_LEVELS } from "../data/governmentData.js";
import { POLICY_QUESTIONS } from "../data/policyData.js";
import { calculateStudentOutcomes } from "../education/educationSystem.js";

/**
 * HEALTHCARE METRICS
 * Calculates healthcare coverage and cost per person
 */
export const calculateHealthcareMetrics = ({
  population,
  currentBudgetAllocationForHealthcare,
  demographics,
  economicProfile,
  governmentEfficiency = 1,
}) => {
  if (population <= 0) {
    return { healthcareCoverage: 0, healthcareCostPerPerson: 0 };
  }

  const BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE = 200;
  let effectiveCostPerCapita = BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE;

  // Adjust for demographics (older populations cost more)
  const seniorRatio = demographics.ageDistribution?.senior / 100 || 0.15;
  effectiveCostPerCapita *= 1 + (seniorRatio - 0.1) * 0.5;

  // Adjust for economic factors
  const gdpPerCapitaNormalized = economicProfile.gdpPerCapita / 50000;
  effectiveCostPerCapita *= 1 + (gdpPerCapitaNormalized - 1) * 0.1;

  // Government efficiency factor
  effectiveCostPerCapita /= governmentEfficiency;

  // Calculate coverage
  let healthcareCoverage = 0;
  if (effectiveCostPerCapita > 0) {
    const requiredBudgetFor100Percent = population * effectiveCostPerCapita;
    healthcareCoverage = (currentBudgetAllocationForHealthcare / requiredBudgetFor100Percent) * 100;
  }

  healthcareCoverage = Math.max(0, Math.min(100, healthcareCoverage));
  const healthcareCostPerPerson = currentBudgetAllocationForHealthcare / population;

  return {
    healthcareCoverage: parseFloat(healthcareCoverage.toFixed(1)),
    healthcareCostPerPerson: parseFloat(healthcareCostPerPerson.toFixed(2)),
  };
};

/**
 * EDUCATION METRICS - OVERHAULED
 * Uses the sophisticated education system instead of simple budget ratios
 */
export const calculateEducationMetrics = ({
  population,
  educationBudget,
  schoolDistrict,
  studentCoalitions,
  demographics,
  economicProfile
}) => {
  // Fallback to simple calculation if no education system data
  if (!schoolDistrict || !studentCoalitions || studentCoalitions.size === 0) {
    const budgetPerStudent = educationBudget / (population * 0.2);
    return {
      // Return numerical metrics only, no ratings
      averageTestScore: 65,
      graduationRate: 85,
      dropoutRate: 8,
      collegeReadiness: 45,
      educationCompositeScore: getEducationScoreFromBudget(budgetPerStudent),
      details: { fallback: true, budgetPerStudent, usingEducationSystem: false }
    };
  }

  // Use sophisticated education system calculations
  let totalStudents = 0;
  let totalTestScore = 0;
  let totalGraduates = 0;
  let totalDropouts = 0;
  let totalCollegeBound = 0;
  let totalTradeBound = 0;
  let totalEngagement = 0;

  // Aggregate across all student coalitions
  Array.from(studentCoalitions.values()).forEach(coalition => {
    totalStudents += coalition.studentCount;
    totalTestScore += coalition.currentAcademicScore * coalition.studentCount;
    totalEngagement += coalition.engagement * coalition.studentCount;

    // Calculate outcomes for this coalition
    const outcomes = calculateStudentOutcomes(coalition, schoolDistrict.metrics, {
      unemployment: economicProfile?.unemploymentRate || 5
    });

    totalGraduates += outcomes.graduates;
    totalDropouts += outcomes.dropouts;
    totalCollegeBound += outcomes.collegeBound;
    totalTradeBound += outcomes.tradeBound;
  });

  const averageTestScore = totalStudents > 0 ? totalTestScore / totalStudents : 65;
  const averageEngagement = totalStudents > 0 ? totalEngagement / totalStudents : 50;
  const graduationRate = totalStudents > 0 ? ((totalStudents - totalDropouts) / totalStudents) * 100 : 85;
  const dropoutRate = totalStudents > 0 ? (totalDropouts / totalStudents) * 100 : 8;
  const collegeReadiness = totalGraduates > 0 ? (totalCollegeBound / totalGraduates) * 100 : 45;

  // Calculate overall education quality from multiple factors
  const educationQuality = calculateEducationCompositeScore({
    testScore: averageTestScore,
    graduationRate,
    dropoutRate,
    engagement: averageEngagement,
    teacherStudentRatio: schoolDistrict.metrics.teacherStudentRatio,
    technologyAccess: schoolDistrict.metrics.technologyAccess,
    infrastructureScore: schoolDistrict.metrics.infrastructureScore
  });

  return {
    // Remove educationQuality rating, return only numerical metrics
    averageTestScore: Math.round(averageTestScore),
    graduationRate: parseFloat(graduationRate.toFixed(1)),
    dropoutRate: parseFloat(dropoutRate.toFixed(1)),
    collegeReadiness: parseFloat(collegeReadiness.toFixed(1)),
    averageEngagement: Math.round(averageEngagement),
    // Calculate composite education score instead of rating
    educationCompositeScore: Math.round(calculateEducationCompositeScore({
      testScore: averageTestScore,
      graduationRate,
      dropoutRate,
      engagement: averageEngagement,
      teacherStudentRatio: schoolDistrict.metrics.teacherStudentRatio,
      technologyAccess: schoolDistrict.metrics.technologyAccess,
      infrastructureScore: schoolDistrict.metrics.infrastructureScore
    })),
    details: {
      totalStudents,
      totalGraduates,
      totalDropouts,
      coalitionCount: studentCoalitions.size,
      budgetPerStudent: schoolDistrict.funding.perStudent,
      teacherStudentRatio: schoolDistrict.metrics.teacherStudentRatio,
      usingEducationSystem: true // Flag to indicate we're using the full system
    }
  };
};

/**
 * Helper function to calculate education composite score (0-100) from multiple metrics
 */
const calculateEducationCompositeScore = ({
  testScore,
  graduationRate,
  dropoutRate,
  engagement,
  teacherStudentRatio,
  technologyAccess,
  infrastructureScore
}) => {
  // Weighted composite score (0-100)
  const compositeScore = 
    (testScore * 0.25) +                           // 25% test scores
    (graduationRate * 0.25) +                     // 25% graduation rate  
    ((100 - dropoutRate) * 0.15) +                // 15% inverse dropout rate
    (engagement * 0.15) +                         // 15% student engagement
    ((40 - Math.min(teacherStudentRatio, 40)) / 40 * 100 * 0.1) + // 10% class size
    (technologyAccess * 0.05) +                   // 5% technology
    (infrastructureScore * 0.05);                 // 5% infrastructure

  return Math.max(0, Math.min(100, compositeScore));
};

/**
 * Fallback education score calculation for when education system isn't available
 */
const getEducationScoreFromBudget = (budgetPerStudent) => {
  if (budgetPerStudent > 8000) return 85;
  if (budgetPerStudent > 6000) return 75;
  if (budgetPerStudent > 4000) return 60;
  if (budgetPerStudent > 2000) return 45;
  return 30;
};

/**
 * POVERTY RATE CALCULATION
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

  let povertyRate = 18.0; // Base poverty rate

  // Economic factors
  const gdpPerCapita = economicProfile?.gdpPerCapita || 40000;
  const unemploymentRate = economicProfile?.unemploymentRate || 6.0;
  const economicOutlook = economicProfile?.economicOutlook;

  // GDP per capita adjustment
  povertyRate += (40000 - gdpPerCapita) / 2000;

  // Unemployment adjustment
  povertyRate += (unemploymentRate - 6.0) * 2.5;

  // Economic outlook adjustment
  const econOutlookIndex = ECONOMIC_OUTLOOK_LEVELS.indexOf(economicOutlook);
  if (econOutlookIndex !== -1) {
    povertyRate += [-3.0, -1.5, 0.0, 1.5, 3.0][econOutlookIndex] * -1;
  }

  // Social welfare spending
  const effectiveSocialWelfarePerCapita = (budgetAllocationForSocialWelfare / population) * governmentEfficiency;
  const TARGET_SW_SPENDING_PER_CAPITA = 150;

  if (effectiveSocialWelfarePerCapita > TARGET_SW_SPENDING_PER_CAPITA) {
    povertyRate -= Math.min(5, (effectiveSocialWelfarePerCapita - TARGET_SW_SPENDING_PER_CAPITA) / 50);
  } else {
    povertyRate += Math.min(5, (TARGET_SW_SPENDING_PER_CAPITA - effectiveSocialWelfarePerCapita) / 30);
  }

  // Education quality impact
  const educationQualityIndex = RATING_LEVELS.indexOf(educationQuality);
  if (educationQualityIndex !== -1) {
    povertyRate += [-2.0, -1.0, 0.0, 1.0, 2.0][educationQualityIndex] * -1;
  }

  // Policy adjustments
  if (activePolicies["universal_basic_income_ubi"] === "universal_basic_income_ubi") {
    povertyRate -= 5.0;
  }
  if (activePolicies["reduce_govt_role_personal_responsibility_charity"] === "reduce_govt_role_personal_responsibility_charity") {
    povertyRate += 3.0;
  }

  // Demographic vulnerability
  const youthUnemploymentSensitivity = (demographics?.ageDistribution?.youth || 20) / 100;
  povertyRate += (youthUnemploymentSensitivity - 0.2) * 2;

  return Math.max(0.5, Math.min(50.0, parseFloat(povertyRate.toFixed(1))));
};

/**
 * CRIME RATE CALCULATION
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

  let crimeRate = 35.0; // Base crime rate per 1000

  // Public safety spending
  const effectivePublicSafetySpendingPerCapita = (budgetAllocationForPublicSafety / population) * governmentEfficiency;
  const TARGET_PS_SPENDING_PER_CAPITA = 100;

  if (effectivePublicSafetySpendingPerCapita > TARGET_PS_SPENDING_PER_CAPITA) {
    crimeRate -= Math.min(10, (effectivePublicSafetySpendingPerCapita - TARGET_PS_SPENDING_PER_CAPITA) / 20);
  } else {
    crimeRate += Math.min(10, (TARGET_PS_SPENDING_PER_CAPITA - effectivePublicSafetySpendingPerCapita) / 10);
  }

  // Socioeconomic factors
  const unemploymentRate = economicProfile?.unemploymentRate || 6.0;
  crimeRate += (unemploymentRate - 6.0) * 3.0;
  crimeRate += (povertyRate - 15.0) * 1.5;

  // Education quality impact
  const educationQualityIndex = RATING_LEVELS.indexOf(educationQuality);
  if (educationQualityIndex !== -1) {
    crimeRate += [-3.0, -1.5, 0.0, 1.5, 3.0][educationQualityIndex] * -1;
  }

  // City type influence
  if (cityType === "Metropolis") crimeRate += 5.0;
  else if (cityType === "Village/Town") crimeRate -= 5.0;

  // Policy influences
  const findPolicyOption = (policyId) => {
    const policy = POLICY_QUESTIONS.find((q) => q.id === policyId);
    if (policy && activePolicies[policyId]) {
      return policy.options.find((o) => o.value === activePolicies[policyId]);
    }
    return null;
  };

  // Criminal justice policy
  const criminalJusticePolicy = findPolicyOption("criminal_justice_system_reform");
  if (criminalJusticePolicy?.value === "tough_on_crime_stricter_penalties_police_funding") {
    crimeRate -= 5.0;
  } else if (criminalJusticePolicy?.value === "rehabilitation_decriminalization_reduce_incarceration") {
    crimeRate += 2.0;
  }

  // Drug policy
  const drugPolicy = findPolicyOption("drug_policy_criminalization_treatment");
  if (drugPolicy?.value === "strict_drug_enforcement_increased_penalties_border_control") {
    crimeRate -= 3.0;
  } else if (drugPolicy?.value === "decriminalize_legalize_drugs_public_health_treatment") {
    crimeRate += 1.0;
  }

  return Math.max(5.0, Math.min(150.0, parseFloat(crimeRate.toFixed(1))));
};

/**
 * UNEMPLOYMENT RATE CALCULATION
 */
export const calculateUnemploymentRate = (economicProfile, povertyRate, cityType, educationMetrics = null) => {
  let baseUnemploymentRate = 6.0;
  
  // GDP per capita adjustment
  const gdpPerCapita = economicProfile?.gdpPerCapita || 40000;
  if (gdpPerCapita > 60000) baseUnemploymentRate -= 1.5;
  else if (gdpPerCapita > 45000) baseUnemploymentRate -= 0.8;
  else if (gdpPerCapita < 30000) baseUnemploymentRate += 1.2;
  else if (gdpPerCapita < 35000) baseUnemploymentRate += 0.6;
  
  // Poverty correlation
  baseUnemploymentRate += (povertyRate - 15.0) * 0.15;
  
  // City type adjustments
  if (cityType === "Metropolis") baseUnemploymentRate += 0.3;
  else if (cityType === "Village/Town") baseUnemploymentRate += 0.8;
  
  // Education system impact (NEW!)
  if (educationMetrics) {
    // Better education = lower unemployment
    const educationEffect = (educationMetrics.collegeReadiness - 50) / 100; // -50% to +50%
    baseUnemploymentRate -= educationEffect * 2; // Up to ±2% unemployment change
    
    // Dropout rate increases unemployment
    const dropoutEffect = (educationMetrics.dropoutRate - 8) / 100; // Relative to 8% baseline
    baseUnemploymentRate += dropoutEffect * 3; // Dropouts increase unemployment
  }
  
  // Economic outlook influence
  const economicOutlook = economicProfile?.economicOutlook;
  if (economicOutlook === "Booming") baseUnemploymentRate -= 1.5;
  else if (economicOutlook === "Strong Growth") baseUnemploymentRate -= 0.8;
  else if (economicOutlook === "Stagnant") baseUnemploymentRate += 0.8;
  else if (economicOutlook === "Recession") baseUnemploymentRate += 2.0;
  
  return Math.max(1.0, Math.min(25.0, parseFloat(baseUnemploymentRate.toFixed(1))));
};

/**
 * INFRASTRUCTURE STATE CALCULATION
 */
export const calculateInfrastructureState = (population, infraBudget) => {
  const budgetPerCapita = infraBudget / population;
  if (budgetPerCapita > 500) return "Excellent";
  if (budgetPerCapita > 300) return "Good";
  if (budgetPerCapita > 150) return "Average";
  if (budgetPerCapita > 50) return "Poor";
  return "Very Poor";
};

/**
 * ENVIRONMENT RATING CALCULATION
 */
export const calculateEnvironmentRating = (population, envBudget) => {
  const budgetPerCapita = envBudget / population;
  if (budgetPerCapita > 100) return "Excellent";
  if (budgetPerCapita > 60) return "Good";
  if (budgetPerCapita > 30) return "Average";
  if (budgetPerCapita > 10) return "Poor";
  return "Very Poor";
};

/**
 * CULTURE & ARTS RATING CALCULATION
 */
export const calculateCultureArtsRating = (population, cultureBudget) => {
  const budgetPerCapita = cultureBudget / population;
  if (budgetPerCapita > 80) return "Excellent";
  if (budgetPerCapita > 50) return "Good";
  if (budgetPerCapita > 25) return "Average";
  if (budgetPerCapita > 10) return "Poor";
  return "Very Poor";
};

/**
 * COMPREHENSIVE CITY STATS CALCULATION
 * Master function that calculates all stats using the unified system
 */
export const calculateAllCityStats = (city) => {
  if (!city || !city.stats || !city.economicProfile || !city.demographics) {
    console.warn("[StatEngine] Missing core city data for calculation.");
    return {};
  }

  const { population, demographics, economicProfile, stats, schoolDistrict } = city;
  const { budget } = stats;

  // Calculate education metrics using sophisticated system
  const educationMetrics = calculateEducationMetrics({
    population,
    educationBudget: budget.expenseAllocations.education || 0,
    schoolDistrict,
    studentCoalitions: schoolDistrict?.studentCoalitions,
    demographics,
    economicProfile
  });

  // Healthcare metrics
  const { healthcareCoverage, healthcareCostPerPerson } = calculateHealthcareMetrics({
    population,
    currentBudgetAllocationForHealthcare: budget.expenseAllocations.publicHealthServices,
    demographics,
    economicProfile,
  });

  // Poverty rate
  const povertyRate = calculatePovertyRate({
    population,
    economicProfile,
    budgetAllocationForSocialWelfare: budget.expenseAllocations.socialWelfarePrograms,
    educationQuality: educationMetrics.educationQuality,
    demographics,
  });

  // Unemployment rate (now includes education factors)
  const unemploymentRate = calculateUnemploymentRate(
    economicProfile, 
    povertyRate, 
    stats.type,
    educationMetrics
  );

  // Crime rate
  const crimeRatePer1000 = calculateCrimeRate({
    population,
    economicProfile: { ...economicProfile, unemploymentRate },
    budgetAllocationForPublicSafety: budget.expenseAllocations.policeDepartment,
    povertyRate,
    educationQuality: educationMetrics.educationQuality,
    cityType: stats.type,
  });

  // Other ratings
  const infrastructureState = calculateInfrastructureState(population, budget.expenseAllocations.infrastructure || 0);
  const environmentRating = calculateEnvironmentRating(population, budget.expenseAllocations.wasteManagement || 0);
  const cultureArtsRating = calculateCultureArtsRating(population, budget.expenseAllocations.cultureArts || 0);

  return {
    // Core metrics
    healthcareCoverage,
    healthcareCostPerPerson,
    povertyRate,
    crimeRatePer1000,
    unemploymentRate,
    
    // Education metrics (overhauled)
    educationQuality: educationMetrics.educationQuality,
    averageTestScore: educationMetrics.averageTestScore,
    graduationRate: educationMetrics.graduationRate,
    dropoutRate: educationMetrics.dropoutRate,
    collegeReadiness: educationMetrics.collegeReadiness,
    
    // Infrastructure & environment
    infrastructureState,
    environmentRating,
    cultureArtsRating,
    
    // Detailed breakdowns for UI
    educationDetails: educationMetrics.details
  };
};

/**
 * REGIONAL BUDGET CALCULATIONS
 * Consolidated from regionalStatCalc.js
 */

export const calculateStateIncomeSources = (region, nationalFinances) => {
  const { population, economicProfile, stats } = region;
  const gdpPerCapita = economicProfile?.gdpPerCapita;
  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromPropertyTaxes = population * (taxRates.property || 0.01) * (gdpPerCapita * 0.1);
  const incomeFromSalesTaxes = population * (taxRates.sales || 0.05) * (gdpPerCapita * 0.2);
  const incomeFromBusinessTaxes = population * (taxRates.business || 0.03) * (gdpPerCapita * 0.3);

  return {
    propertyTaxes: Math.floor(incomeFromPropertyTaxes),
    salesTaxes: Math.floor(incomeFromSalesTaxes),
    businessTaxes: Math.floor(incomeFromBusinessTaxes),
    federalGrants: 0,
  };
};

export const calculateNationalIncomeSources = (country, allRegions) => {
  const { population, economicProfile, stats } = country;
  const gdpPerCapita = economicProfile?.gdpPerCapita || country.gdpPerCapita;
  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromCorporateTaxes = population * (taxRates.corporate || 0.1) * (gdpPerCapita * 0.4);
  const incomeFromIncomeTaxes = population * (taxRates.income || 0.15) * (gdpPerCapita * 0.5);

  return {
    corporateTaxes: Math.floor(incomeFromCorporateTaxes),
    incomeTaxes: Math.floor(incomeFromIncomeTaxes),
    tariffs: 0,
  };
};

export const runStateBudgetUpdate = (region, nationalFinances) => {
  if (!region?.stats?.budget) return region?.stats?.budget;

  const economicVariation = 1 + (Math.random() - 0.5) * 0.16;
  const seasonalFactor = 1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.03;

  const newIncomeSources = calculateStateIncomeSources(region, nationalFinances);
  const variableIncomeSources = {
    propertyTaxes: Math.floor(newIncomeSources.propertyTaxes * economicVariation),
    salesTaxes: Math.floor(newIncomeSources.salesTaxes * economicVariation * seasonalFactor),
    businessTaxes: Math.floor(newIncomeSources.businessTaxes * economicVariation),
    federalGrants: newIncomeSources.federalGrants,
  };

  const newTotalAnnualIncome = Object.values(variableIncomeSources).reduce((sum, val) => sum + val, 0);

  const expenseVariation = 1 + (Math.random() - 0.5) * 0.1;
  const baseExpenseAllocations = region.stats.budget.expenseAllocations || {};
  const variableExpenseAllocations = {};

  Object.keys(baseExpenseAllocations).forEach((key) => {
    variableExpenseAllocations[key] = Math.floor(baseExpenseAllocations[key] * expenseVariation);
  });

  const newTotalAnnualExpenses = Object.values(variableExpenseAllocations).reduce((sum, val) => sum + val, 0);
  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = region.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  return {
    ...region.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: variableIncomeSources,
    expenseAllocations: variableExpenseAllocations,
  };
};

export const runNationalBudgetUpdate = (country, allRegions) => {
  if (!country?.stats?.budget) return country?.stats?.budget;

  const economicVariation = 1 + (Math.random() - 0.5) * 0.12;
  const globalMarketFactor = 1 + (Math.random() - 0.5) * 0.08;

  const newIncomeSources = calculateNationalIncomeSources(country, allRegions);
  const variableIncomeSources = {
    corporateTaxes: Math.floor(newIncomeSources.corporateTaxes * economicVariation * globalMarketFactor),
    incomeTaxes: Math.floor(newIncomeSources.incomeTaxes * economicVariation),
    tariffs: Math.floor(newIncomeSources.tariffs * globalMarketFactor),
  };

  const newTotalAnnualIncome = Object.values(variableIncomeSources).reduce((sum, val) => sum + val, 0);

  const expenseVariation = 1 + (Math.random() - 0.5) * 0.08;
  const baseExpenseAllocations = country.stats.budget.expenseAllocations || {};
  const variableExpenseAllocations = {};

  Object.keys(baseExpenseAllocations).forEach((key) => {
    const variability = key === "defense" || key === "infrastructure" ? expenseVariation :
                        key === "interestOnDebt" ? 1 : 1 + (expenseVariation - 1) * 0.5;
    variableExpenseAllocations[key] = Math.floor(baseExpenseAllocations[key] * variability);
  });

  const newTotalAnnualExpenses = Object.values(variableExpenseAllocations).reduce((sum, val) => sum + val, 0);
  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = country.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  return {
    ...country.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: variableIncomeSources,
    expenseAllocations: variableExpenseAllocations,
  };
};