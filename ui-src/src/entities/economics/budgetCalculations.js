// Budget and financial calculation utilities
// Extracted from politicalEntities.js for better organization

import { getRandomInt, getRandomElement } from "../../utils/core";

/**
 * Calculates state education funding distribution to local districts
 * @param {number} totalStateEducationFunding - Total state budget for local education funding
 * @param {Array} cities - Array of city objects with population and student data
 * @param {string} fundingFormula - Type of funding formula ('per_student', 'needs_based', 'hybrid')
 * @returns {Object} Mapping of cityId to funding amount
 */
export const calculateStateEducationDistribution = (
  totalStateEducationFunding,
  cities = [],
  fundingFormula = 'hybrid'
) => {
  if (!cities || cities.length === 0) return {};
  
  const distribution = {};
  let totalStudents = 0;
  let totalWeightedNeed = 0;
  
  // First pass: calculate totals for distribution formulas
  cities.forEach(city => {
    const students = city.schoolDistrict?.totalStudents || Math.floor(city.population * 0.18);
    const needsMultiplier = calculateNeedsMultiplier(city);
    
    totalStudents += students;
    totalWeightedNeed += students * needsMultiplier;
  });
  
  // Second pass: distribute funding
  cities.forEach(city => {
    const students = city.schoolDistrict?.totalStudents || Math.floor(city.population * 0.18);
    const needsMultiplier = calculateNeedsMultiplier(city);
    
    let cityFunding = 0;
    
    switch (fundingFormula) {
      case 'per_student':
        // Simple per-student allocation
        cityFunding = (students / totalStudents) * totalStateEducationFunding;
        break;
        
      case 'needs_based':
        // Weighted by economic need
        const weightedStudents = students * needsMultiplier;
        cityFunding = (weightedStudents / totalWeightedNeed) * totalStateEducationFunding;
        break;
        
      case 'hybrid':
      default:
        // 60% per-student, 40% needs-based
        const perStudentPortion = ((students / totalStudents) * totalStateEducationFunding) * 0.6;
        const needsBasedPortion = ((students * needsMultiplier / totalWeightedNeed) * totalStateEducationFunding) * 0.4;
        cityFunding = perStudentPortion + needsBasedPortion;
        break;
    }
    
    distribution[city.id] = Math.floor(cityFunding);
  });
  
  return distribution;
};

/**
 * Calculates needs-based multiplier for education funding
 * @param {Object} city - City object with demographics and economic data
 * @returns {number} Multiplier based on economic need (1.0 = baseline, higher = more need)
 */
const calculateNeedsMultiplier = (city) => {
  let multiplier = 1.0;
  
  // GDP per capita adjustment
  const gdpPerCapita = city.economicProfile?.gdpPerCapita || 40000;
  if (gdpPerCapita < 30000) multiplier += 0.4;
  else if (gdpPerCapita < 40000) multiplier += 0.2;
  else if (gdpPerCapita > 60000) multiplier -= 0.1;
  
  // Poverty rate adjustment
  const povertyRate = city.stats?.povertyRate || 15;
  if (povertyRate > 20) multiplier += 0.3;
  else if (povertyRate > 15) multiplier += 0.15;
  else if (povertyRate < 10) multiplier -= 0.1;
  
  // Ensure multiplier stays within reasonable bounds
  return Math.max(0.7, Math.min(2.0, multiplier));
};

/**
 * Calculates detailed income sources for city budgets
 * @param {number} population - City population
 * @param {number} gdpPerCapita - GDP per capita
 * @param {Object} taxRates - Tax rate structure
 * @param {string} cityType - Type of city (Village/Town, City, Metropolis)
 * @param {Array} dominantIndustries - Main industries in the city
 * @param {Object} cityLaws - City laws affecting revenue (e.g., minimum wage)
 * @param {Object} stateEducationFunding - State funding for local education (optional)
 * @returns {Object} Detailed breakdown of income sources
 */
export const calculateDetailedIncomeSources = (
  population,
  gdpPerCapita,
  taxRates,
  cityType,
  dominantIndustries,
  cityLaws = {},
  stateEducationFunding = null
) => {
  const incomeSources = {
    propertyTaxRevenue: 0,
    salesTaxRevenue: 0,
    businessTaxRevenue: 0,
    feesAndPermits: 0,
    utilityRevenue: 0,
    grantsAndSubsidies: 0,
    stateEducationFunding: 0,
    investmentIncome: 0,
    otherRevenue: 0,
  };

  // Property tax calculation
  const avgPropertyValueFactor =
    gdpPerCapita *
    (cityType === "Metropolis" ? 3.0 : cityType === "City" ? 2.5 : 2.0);
  const propertyValueBase =
    population * avgPropertyValueFactor * (getRandomInt(35, 45) / 100);
  incomeSources.propertyTaxRevenue = Math.floor(
    propertyValueBase * (taxRates.property || 0)
  );

  // Sales tax calculation with minimum wage impact
  const consumerSpendingPerCapita = gdpPerCapita * (getRandomInt(25, 35) / 100);
  let minimumWageMultiplier = 1.0;
  if (cityLaws.minimumWage) {
    const federalMinimumWage = 7.25; // Base federal minimum wage
    const wageRatio = cityLaws.minimumWage / federalMinimumWage;
    // Higher minimum wage increases consumer spending (more disposable income)
    // Multiplier ranges from 1.0 (at federal minimum) to ~1.4 (at $15/hr)
    minimumWageMultiplier = Math.min(1.0 + (wageRatio - 1.0) * 0.4, 1.5);
  }

  const totalSalesVolume =
    population * consumerSpendingPerCapita * minimumWageMultiplier;
  incomeSources.salesTaxRevenue = Math.floor(
    totalSalesVolume * (taxRates.sales || 0)
  );

  // Business tax calculation
  const totalCityGDP = population * gdpPerCapita;
  let businessProfitPoolFactor = 0.1;
  if (
    dominantIndustries.includes("finance") ||
    dominantIndustries.includes("tech")
  )
    businessProfitPoolFactor += 0.05;
  if (dominantIndustries.includes("manufacturing"))
    businessProfitPoolFactor += 0.03;
  const totalBusinessProfitPool = totalCityGDP * businessProfitPoolFactor;
  incomeSources.businessTaxRevenue = Math.floor(
    totalBusinessProfitPool * (taxRates.business || 0)
  );

  // Fees and permits
  incomeSources.feesAndPermits = Math.floor(
    population * getRandomInt(15, 35) +
      dominantIndustries.length * gdpPerCapita * 0.0015
  );

  // Utility revenue (not available for small towns)
  if (cityType !== "Village/Town" && Math.random() < 0.6) {
    incomeSources.utilityRevenue = Math.floor(
      population * getRandomInt(25, 60)
    );
  }

  // Grants and subsidies (more for poorer areas)
  incomeSources.grantsAndSubsidies = Math.floor(
    population * getRandomInt(10, 30) +
      (gdpPerCapita < 35000 ? population * 15 : 0)
  );

  // State education funding (significant portion of local school budgets)
  if (stateEducationFunding && stateEducationFunding.perStudentAllocation) {
    // Calculate based on estimated student population (roughly 18% of total population)
    const estimatedStudents = Math.floor(population * 0.18);
    incomeSources.stateEducationFunding = Math.floor(
      estimatedStudents * stateEducationFunding.perStudentAllocation
    );
  } else {
    // Default state education funding formula if no specific allocation provided
    // States typically provide 40-50% of local education funding
    const estimatedEducationBudget = population * getRandomInt(800, 1200); // Rough per-capita education spending
    incomeSources.stateEducationFunding = Math.floor(estimatedEducationBudget * (getRandomInt(40, 50) / 100));
  }

  // Investment income (based on existing revenue)
  incomeSources.investmentIncome = Math.floor(
    (incomeSources.propertyTaxRevenue +
      incomeSources.salesTaxRevenue +
      incomeSources.businessTaxRevenue) *
      (getRandomInt(1, 15) / 1000)
  );

  // Other miscellaneous revenue
  incomeSources.otherRevenue = Math.floor(population * getRandomInt(5, 15));

  return incomeSources;
};

/**
 * Generates a complete city budget including income and expense allocations
 * @param {number} population - City population
 * @param {number} gdpPerCapita - GDP per capita
 * @param {Object} initialTaxRates - Starting tax rates
 * @param {string} wealthLevel - Wealth level (low, mid, high)
 * @param {Array} dominantIndustries - Primary industries
 * @param {Array} mainIssues - Main issues facing the city
 * @param {string} cityType - Type of city
 * @param {Object} cityLaws - City laws affecting budget
 * @returns {Object} Complete budget breakdown
 */
export const generateInitialBudget = (
  population,
  gdpPerCapita,
  initialTaxRates,
  wealthLevel,
  dominantIndustries,
  mainIssues,
  cityType,
  cityLaws = {}
) => {
  const incomeSources = calculateDetailedIncomeSources(
    population,
    gdpPerCapita,
    initialTaxRates,
    cityType,
    dominantIndustries,
    cityLaws
  );
  
  const totalAnnualIncome = Math.floor(
    Object.values(incomeSources).reduce((sum, val) => sum + val, 0)
  );

  // Calculate base expenses per capita with adjustments
  let baseTotalExpensesPerCapita = getRandomInt(550, 950);
  if (wealthLevel === "high")
    baseTotalExpensesPerCapita *= getRandomInt(120, 140) / 100;
  else if (wealthLevel === "low")
    baseTotalExpensesPerCapita *= getRandomInt(70, 85) / 100;
  if (cityType === "Metropolis")
    baseTotalExpensesPerCapita *= getRandomInt(105, 115) / 100;

  let targetTotalAnnualExpenses = Math.floor(
    population * baseTotalExpensesPerCapita
  );
  
  // Ensure expenses are within reasonable bounds of income
  targetTotalAnnualExpenses = Math.max(
    Math.floor(totalAnnualIncome * 0.8),
    Math.min(targetTotalAnnualExpenses, Math.floor(totalAnnualIncome * 1.2))
  );

  // Base expense allocation percentages
  let allocations = {
    policeDepartment: getRandomInt(10, 16),
    fireDepartment: getRandomInt(5, 9),
    emergencyServices: getRandomInt(2, 5),
    roadInfrastructure: getRandomInt(7, 11),
    publicTransit:
      cityType === "Village/Town" ? getRandomInt(1, 4) : getRandomInt(5, 9),
    waterAndSewer: getRandomInt(3, 6),
    wasteManagement: getRandomInt(2, 5),
    publicEducation:
      cityType === "Metropolis" || cityType === "City"
        ? getRandomInt(18, 25)
        : getRandomInt(12, 20),
    publicHealthServices: getRandomInt(4, 7),
    socialWelfarePrograms: getRandomInt(5, 9),
    parksAndRecreation: getRandomInt(2, 5),
    librariesAndCulture: getRandomInt(1, 4),
    cityPlanningAndDevelopment: getRandomInt(2, 5),
    generalAdministration: getRandomInt(6, 10),
  };

  // Adjust allocations based on main issues
  if (mainIssues.includes("Crime") || mainIssues.includes("Public Safety"))
    allocations.policeDepartment = Math.min(
      25,
      allocations.policeDepartment + getRandomInt(2, 4)
    );
  if (mainIssues.includes("Infrastructure"))
    allocations.roadInfrastructure = Math.min(
      20,
      allocations.roadInfrastructure + getRandomInt(2, 3)
    );
  if (mainIssues.includes("Education"))
    allocations.publicEducation = Math.min(
      30,
      allocations.publicEducation + getRandomInt(2, 4)
    );
  if (mainIssues.includes("Healthcare"))
    allocations.publicHealthServices = Math.min(
      15,
      allocations.publicHealthServices + getRandomInt(1, 2)
    );
  if (mainIssues.includes("Housing") || mainIssues.includes("Poverty"))
    allocations.socialWelfarePrograms = Math.min(
      15,
      allocations.socialWelfarePrograms + getRandomInt(1, 3)
    );

  // Normalize allocations to 90% (leaving 10% for debt servicing and misc)
  const normalizedAllocations = normalizeArrayBySum(allocations, 90, 1);
  
  const expenseAllocations = {
    policeDepartment: 0,
    fireDepartment: 0,
    emergencyServices: 0,
    roadInfrastructure: 0,
    publicTransit: 0,
    waterAndSewer: 0,
    wasteManagement: 0,
    publicEducation: 0,
    publicHealthServices: 0,
    socialWelfarePrograms: 0,
    parksAndRecreation: 0,
    librariesAndCulture: 0,
    cityPlanningAndDevelopment: 0,
    generalAdministration: 0,
    // New department-specific allocations
    housingDevelopment: 0,
    economicDevelopment: 0,
    codeEnforcement: 0,
    permitsLicensing: 0,
    environmentalServices: 0,
    informationTechnology: 0,
    humanResources: 0,
    legalAffairs: 0,
    // Existing
    debtServicing: 0,
    miscellaneousExpenses: 0,
  };

  let sumOfAllocatedExpenses = 0;
  for (const key in normalizedAllocations) {
    if (Object.prototype.hasOwnProperty.call(expenseAllocations, key)) {
      expenseAllocations[key] = Math.floor(
        targetTotalAnnualExpenses * (normalizedAllocations[key] / 100)
      );
      sumOfAllocatedExpenses += expenseAllocations[key];
    }
  }

  // Allocate budget to new department categories from general administration
  const adminBudget = expenseAllocations.generalAdministration;
  if (adminBudget > 0) {
    // Distribute portions of general administration to specific departments
    expenseAllocations.informationTechnology = Math.floor(adminBudget * 0.15);
    expenseAllocations.humanResources = Math.floor(adminBudget * 0.12);
    expenseAllocations.legalAffairs = Math.floor(adminBudget * 0.08);
    expenseAllocations.permitsLicensing = Math.floor(adminBudget * 0.10);
    expenseAllocations.codeEnforcement = Math.floor(adminBudget * 0.05);
    
    // Reduce general administration by the amount distributed
    const distributedAmount = expenseAllocations.informationTechnology + 
                             expenseAllocations.humanResources + 
                             expenseAllocations.legalAffairs + 
                             expenseAllocations.permitsLicensing + 
                             expenseAllocations.codeEnforcement;
    expenseAllocations.generalAdministration -= distributedAmount;
  }

  // Allocate budget to development departments from planning and social programs
  const planningBudget = expenseAllocations.cityPlanningAndDevelopment;
  const socialBudget = expenseAllocations.socialWelfarePrograms;
  
  if (planningBudget > 0) {
    expenseAllocations.economicDevelopment = Math.floor(planningBudget * 0.25);
    expenseAllocations.environmentalServices = Math.floor(planningBudget * 0.15);
    expenseAllocations.cityPlanningAndDevelopment -= (expenseAllocations.economicDevelopment + expenseAllocations.environmentalServices);
  }
  
  if (socialBudget > 0) {
    expenseAllocations.housingDevelopment = Math.floor(socialBudget * 0.20);
    expenseAllocations.socialWelfarePrograms -= expenseAllocations.housingDevelopment;
  }

  // Handle debt
  let accumulatedDebt = 0;
  if (
    totalAnnualIncome < targetTotalAnnualExpenses * 0.9 ||
    Math.random() < 0.35
  ) {
    accumulatedDebt = getRandomInt(
      0,
      Math.floor(totalAnnualIncome * (getRandomInt(15, 70) / 100))
    );
  }
  if (accumulatedDebt > 0) {
    expenseAllocations.debtServicing = Math.floor(
      accumulatedDebt * (getRandomInt(4, 8) / 100)
    );
    sumOfAllocatedExpenses += expenseAllocations.debtServicing;
  }

  expenseAllocations.miscellaneousExpenses = Math.max(
    0,
    targetTotalAnnualExpenses - sumOfAllocatedExpenses
  );

  const finalTotalAnnualExpenses = Math.floor(
    Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0)
  );
  const finalBalance = totalAnnualIncome - finalTotalAnnualExpenses;

  return {
    totalAnnualIncome,
    totalAnnualExpenses: finalTotalAnnualExpenses,
    balance: finalBalance,
    accumulatedDebt,
    taxRates: { ...initialTaxRates },
    incomeSources,
    expenseAllocations,
  };
};

/**
 * Generates budget data for a state/region
 * @param {number} population - State population
 * @param {number} gdpPerCapita - State GDP per capita
 * @param {string} countryId - Country identifier
 * @returns {Object} State budget breakdown
 */
export const generateStateBudget = ({
  population,
  gdpPerCapita,
  countryId,
}) => {
  // Base tax rates for states (different from cities)
  const taxRates = {
    property: 0.008, // 0.8% property tax
    sales: 0.06, // 6% sales tax
    business: 0.04, // 4% business tax
    income: 0.05, // 5% state income tax
  };

  // Calculate income sources based on population and economic factors
  const incomeSources = {
    propertyTaxes: Math.floor(
      population * gdpPerCapita * 0.1 * taxRates.property
    ),
    salesTaxes: Math.floor(population * gdpPerCapita * 0.2 * taxRates.sales),
    businessTaxes: Math.floor(
      population * gdpPerCapita * 0.3 * taxRates.business
    ),
    incomeTaxes: Math.floor(population * gdpPerCapita * 0.4 * taxRates.income),
    federalGrants: Math.floor(population * 150), // $150 per capita in federal grants
  };

  const totalAnnualIncome = Object.values(incomeSources).reduce(
    (sum, val) => sum + val,
    0
  );

  // State-level expense allocations with realistic budget imbalance
  // Add random variation (±10-20%) to create realistic surpluses/deficits
  const budgetImbalanceFactor = 1 + (Math.random() - 0.3) * 0.3; // -30% to +0% (tends toward deficit)
  const adjustedBudgetBase = totalAnnualIncome * budgetImbalanceFactor;

  const expenseAllocations = {
    publicEducation: Math.floor(adjustedBudgetBase * 0.25), // 25% of budget (reduced from 35%)
    localEducationFunding: Math.floor(adjustedBudgetBase * 0.15), // 15% - NEW: Funding for local school districts
    publicHealthServices: Math.floor(adjustedBudgetBase * 0.2), // 20% of budget
    transportationInfrastructure: Math.floor(adjustedBudgetBase * 0.15), // 15% of budget
    socialWelfarePrograms: Math.floor(adjustedBudgetBase * 0.12), // 12% of budget
    publicSafety: Math.floor(adjustedBudgetBase * 0.08), // 8% of budget
    environmentalProtection: Math.floor(adjustedBudgetBase * 0.05), // 5% of budget
    generalAdministration: Math.floor(adjustedBudgetBase * 0.05), // 5% of budget (totals 110% for flexibility)
  };

  const totalAnnualExpenses = Object.values(expenseAllocations).reduce(
    (sum, val) => sum + val,
    0
  );
  const balance = totalAnnualIncome - totalAnnualExpenses;

  return {
    totalAnnualIncome,
    totalAnnualExpenses,
    balance,
    accumulatedDebt: 0,
    taxRates,
    incomeSources,
    expenseAllocations,
  };
};

/**
 * Generates budget data for a country/nation
 * @param {number} population - National population
 * @param {number} gdpPerCapita - National GDP per capita
 * @param {string} countryId - Country identifier
 * @returns {Object} National budget breakdown
 */
export const generateNationalBudget = ({
  population,
  gdpPerCapita,
  countryId,
}) => {
  // National-level tax rates (different from state/city rates)
  const taxRates = {
    corporate: 0.21, // 21% corporate tax
    income: 0.25, // 25% federal income tax
    importTariffs: 0.03, // 3% average tariff rate
  };

  // Calculate income sources based on population and economic factors
  const incomeSources = {
    corporateTaxes: Math.floor(
      population * gdpPerCapita * 0.4 * taxRates.corporate
    ),
    incomeTaxes: Math.floor(population * gdpPerCapita * 0.5 * taxRates.income),
    tariffs: Math.floor(
      population * gdpPerCapita * 0.1 * taxRates.importTariffs
    ),
  };

  const totalAnnualIncome = Object.values(incomeSources).reduce(
    (sum, val) => sum + val,
    0
  );

  // National-level expense allocations with realistic budget imbalance
  // Add random variation (±15-25%) to create realistic surpluses/deficits
  const budgetImbalanceFactor = 1 + (Math.random() - 0.2) * 0.4; // -20% to +20% (balanced tendency)
  const adjustedBudgetBase = totalAnnualIncome * budgetImbalanceFactor;

  const expenseAllocations = {
    defense: Math.floor(adjustedBudgetBase * 0.25), // 25% of budget
    socialSecurity: Math.floor(adjustedBudgetBase * 0.2), // 20% of budget
    healthcare: Math.floor(adjustedBudgetBase * 0.15), // 15% of budget
    education: Math.floor(adjustedBudgetBase * 0.1), // 10% of budget
    infrastructure: Math.floor(adjustedBudgetBase * 0.08), // 8% of budget
    interestOnDebt: Math.floor(adjustedBudgetBase * 0.07), // 7% of budget
    veteransAffairs: Math.floor(adjustedBudgetBase * 0.05), // 5% of budget
    foreignAid: Math.floor(adjustedBudgetBase * 0.02), // 2% of budget
    generalGovernment: Math.floor(adjustedBudgetBase * 0.08), // 8% of budget
  };

  const totalAnnualExpenses = Object.values(expenseAllocations).reduce(
    (sum, val) => sum + val,
    0
  );
  const balance = totalAnnualIncome - totalAnnualExpenses;

  // National debt (typically substantial for developed countries)
  const accumulatedDebt = Math.floor(
    totalAnnualIncome * (getRandomInt(80, 120) / 100)
  ); // 80-120% of annual income

  return {
    totalAnnualIncome,
    totalAnnualExpenses,
    balance,
    accumulatedDebt,
    taxRates,
    incomeSources,
    expenseAllocations,
  };
};

// Helper function for normalizing allocations (imported from core utils)
const normalizeArrayBySum = (obj, targetSum, minValue) => {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const currentSum = values.reduce((sum, val) => sum + val, 0);
  
  if (currentSum === 0) return obj;
  
  const normalized = {};
  let adjustedSum = 0;
  
  // First pass: apply scaling factor
  keys.forEach(key => {
    const scaledValue = (obj[key] / currentSum) * targetSum;
    const finalValue = Math.max(minValue || 0, scaledValue);
    normalized[key] = finalValue;
    adjustedSum += finalValue;
  });
  
  // Second pass: adjust for rounding errors
  const difference = targetSum - adjustedSum;
  if (Math.abs(difference) > 0.01) {
    // Find the largest value to adjust
    const largestKey = keys.reduce((a, b) => 
      normalized[a] > normalized[b] ? a : b
    );
    normalized[largestKey] += difference;
  }
  
  return normalized;
};