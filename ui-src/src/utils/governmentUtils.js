import {
  getRandomInt,
  getRandomElement,
  generateId,
  normalizeArrayBySum,
} from "./generalUtils"; // You'll need normalizeArrayBySum
import { POLICY_QUESTIONS } from "../data/policyData"; // For electorate profile
import {
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
  MOOD_LEVELS,
} from "../data/governmentData";
import { createCityObject } from "../data/cityData";
import { calculateHealthcareMetrics } from "./statCalculationCore";

const generateCityName = () => {
  // Simple example, you'd have lists of prefixes/suffixes per country
  const prefixes = ["Spring", "North", "West", "New", "Port", "Mount", "Fort"];
  const suffixes = [
    "field",
    "wood",
    "town",
    "ville",
    "burg",
    " City",
    " Crest",
    " Valley",
  ];
  return `${getRandomElement(prefixes)}${getRandomElement(suffixes)}`;
};

// --- Demographics Generation ---
export const generateCityDemographics = () => {
  // TODO: Archetype hint could influence distributions
  let ageDist = { youth: 20, youngAdult: 25, adult: 35, senior: 20 }; // Base
  // Simple randomization - can be more sophisticated
  ageDist.youth = getRandomInt(15, 25);
  ageDist.youngAdult = getRandomInt(20, 30);
  ageDist.adult = getRandomInt(30, 40);
  ageDist.senior = 100 - ageDist.youth - ageDist.youngAdult - ageDist.adult;
  if (ageDist.senior < 10) {
    // Ensure seniors are at least 10% if other numbers are high
    let deficit = 10 - ageDist.senior;
    ageDist.adult -= deficit; // Take from largest group
    ageDist.senior = 10;
  }

  let eduLevels = {
    highSchoolOrLess: 30,
    someCollege: 40,
    bachelorsOrHigher: 30,
  };
  eduLevels.bachelorsOrHigher = getRandomInt(15, 40);
  eduLevels.someCollege = getRandomInt(25, 45);
  eduLevels.highSchoolOrLess =
    100 - eduLevels.bachelorsOrHigher - eduLevels.someCollege;
  if (eduLevels.highSchoolOrLess < 15) {
    let deficit = 15 - eduLevels.highSchoolOrLess;
    eduLevels.someCollege -= deficit;
    eduLevels.highSchoolOrLess = 15;
  }

  return {
    ageDistribution: normalizeArrayBySum(ageDist, 100, false), // Ensure percentages sum to 100
    educationLevels: normalizeArrayBySum(eduLevels, 100, false),
  };
};

// --- Economic Profile Generation ---
export const generateEconomicProfile = (population, demographics) => {
  // TODO: Archetype hint influences dominant industries
  const industries = [
    "manufacturing",
    "services",
    "tech",
    "tourism",
    "agriculture",
    "education",
    "healthcare",
    "government",
  ];
  let dominantIndustries = [];
  const numIndustries = getRandomInt(1, 3);
  let availableIndustries = [...industries];
  for (let i = 0; i < numIndustries; i++) {
    if (availableIndustries.length === 0) break;
    const industry = getRandomElement(availableIndustries);
    dominantIndustries.push(industry);
    availableIndustries = availableIndustries.filter(
      (item) => item !== industry
    );
  }

  // GDP per capita can be influenced by education, industries
  let gdpPerCapita = getRandomInt(20000, 50000);
  if (demographics.educationLevels.bachelorsOrHigher > 30)
    gdpPerCapita += getRandomInt(5000, 15000);
  if (dominantIndustries.includes("tech"))
    gdpPerCapita += getRandomInt(5000, 20000);
  if (
    dominantIndustries.includes("manufacturing") &&
    !dominantIndustries.includes("tech")
  )
    gdpPerCapita -= getRandomInt(0, 5000);

  return {
    dominantIndustries,
    gdpPerCapita,
    keyLocalIssuesFromProfile: [], // Can be populated based on mismatches, e.g., high tech industry but low skilled workers
  };
};

// --- Electorate Policy Profile Generation ---
export const generateInitialElectoratePolicyProfile = () => {
  const profile = {};
  POLICY_QUESTIONS.forEach((q) => {
    if (q.options?.length > 0) {
      // TODO: Make this more sophisticated based on demographics, economy, country leanings
      // For now, random, but slightly weighted if possible
      // Example: if high senior population, lean towards policies good for seniors on relevant questions.
      profile[q.id] = getRandomElement(q.options).value;
    }
  });
  return profile;
};

// --- Initial Budget Generation ---
export const calculateDetailedIncomeSources = (
  population,
  gdpPerCapita,
  taxRates,
  cityType,
  dominantIndustries
) => {
  const incomeSources = {
    propertyTaxRevenue: 0,
    salesTaxRevenue: 0,
    businessTaxRevenue: 0,
    feesAndPermits: 0,
    utilityRevenue: 0,
    grantsAndSubsidies: 0,
    investmentIncome: 0,
    otherRevenue: 0,
  };

  // 1. Tax Revenues
  const avgPropertyValueFactor =
    gdpPerCapita *
    (cityType === "Metropolis" ? 3.0 : cityType === "City" ? 2.5 : 2.0);
  const propertyValueBase =
    population * avgPropertyValueFactor * (getRandomInt(35, 45) / 100);
  incomeSources.propertyTaxRevenue = Math.floor(
    propertyValueBase * (taxRates.property || 0)
  );

  const consumerSpendingPerCapita = gdpPerCapita * (getRandomInt(25, 35) / 100);
  const totalSalesVolume = population * consumerSpendingPerCapita;
  incomeSources.salesTaxRevenue = Math.floor(
    totalSalesVolume * (taxRates.sales || 0)
  );

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

  // 2. Fees and Permits
  incomeSources.feesAndPermits = Math.floor(
    population * getRandomInt(15, 35) +
      dominantIndustries.length * gdpPerCapita * 0.0015
  ); // Slightly increased factor

  // 3. Utility Revenue
  if (cityType !== "Village/Town" && Math.random() < 0.6) {
    // Increased chance
    incomeSources.utilityRevenue = Math.floor(
      population * getRandomInt(25, 60)
    );
  }

  // 4. Grants and Subsidies
  incomeSources.grantsAndSubsidies = Math.floor(
    population * getRandomInt(10, 30) +
      (gdpPerCapita < 35000 ? population * 15 : 0)
  ); // Adjusted threshold

  // 5. Investment & Other
  incomeSources.investmentIncome = Math.floor(
    (incomeSources.propertyTaxRevenue +
      incomeSources.salesTaxRevenue +
      incomeSources.businessTaxRevenue) *
      (getRandomInt(1, 15) / 1000)
  ); // 0.1% to 1.5%
  incomeSources.otherRevenue = Math.floor(population * getRandomInt(5, 15));

  return incomeSources;
};

export const generateInitialBudget = (
  population,
  gdpPerCapita,
  initialTaxRates, // This is the taxRates object {property, sales, business}
  wealthLevel, // "low", "mid", "high"
  dominantIndustries, // Array of strings
  mainIssues, // Array of strings
  cityType
) => {
  // 1. Calculate Detailed Income Sources
  const incomeSources = calculateDetailedIncomeSources(
    population,
    gdpPerCapita,
    initialTaxRates,
    cityType,
    dominantIndustries
  );
  const totalAnnualIncome = Math.floor(
    Object.values(incomeSources).reduce((sum, val) => sum + val, 0)
  );

  // 2. Determine Target for Total Annual Expenses
  let baseTotalExpensesPerCapita = getRandomInt(550, 950); // Adjusted range
  if (wealthLevel === "high")
    baseTotalExpensesPerCapita *= getRandomInt(120, 140) / 100; // 1.2 to 1.4
  else if (wealthLevel === "low")
    baseTotalExpensesPerCapita *= getRandomInt(70, 85) / 100; // 0.7 to 0.85
  if (cityType === "Metropolis")
    baseTotalExpensesPerCapita *= getRandomInt(105, 115) / 100; // 1.05 to 1.15

  let targetTotalAnnualExpenses = Math.floor(
    population * baseTotalExpensesPerCapita
  );

  // Adjust target expenses to be within a plausible range of income, allowing for deficit/surplus
  const minExpenseRatio = 0.85; // Expenses at least 85% of income
  const maxExpenseRatio = 1.15; // Expenses at most 115% of income

  if (targetTotalAnnualExpenses < totalAnnualIncome * minExpenseRatio) {
    targetTotalAnnualExpenses = Math.floor(
      totalAnnualIncome * (getRandomInt(85, 95) / 100)
    );
  } else if (targetTotalAnnualExpenses > totalAnnualIncome * maxExpenseRatio) {
    targetTotalAnnualExpenses = Math.floor(
      totalAnnualIncome * (getRandomInt(105, 115) / 100)
    );
  }
  // If still outside after adjustment (e.g. income is very low), cap it more directly
  targetTotalAnnualExpenses = Math.max(
    Math.floor(totalAnnualIncome * 0.8), // Absolute minimum
    Math.min(targetTotalAnnualExpenses, Math.floor(totalAnnualIncome * 1.2)) // Absolute maximum
  );

  // 3. Allocate Expenses to Departments
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
    debtServicing: 0, // Will be calculated
    miscellaneousExpenses: 0, // Will be used as a buffer
  };

  // Define base percentage ranges for categories (target sum around 90-95% to leave room for debt and misc)
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
    // miscellaneousExpenses will be a small fixed base + buffer
  };

  // Adjust allocations based on mainIssues (add percentage points)
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

  // Normalize these allocation points to sum to a target, e.g., 90% of the budget initially,
  // leaving room for debt servicing and a small miscellaneous buffer.
  const normalizedAllocations = normalizeArrayBySum(allocations, 90, 1); // Target 90%

  let sumOfAllocatedExpenses = 0;
  for (const key in normalizedAllocations) {
    if (Object.prototype.hasOwnProperty.call(expenseAllocations, key)) {
      // Ensure key exists in expenseAllocations
      expenseAllocations[key] = Math.floor(
        targetTotalAnnualExpenses * (normalizedAllocations[key] / 100)
      );
      sumOfAllocatedExpenses += expenseAllocations[key];
    }
  }

  // 4. Calculate Initial Debt and Debt Servicing
  let accumulatedDebt = 0;
  // More likely to have debt if income doesn't cover even 90% of target expenses, or by chance
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
    ); // 4-8% of debt as annual servicing
    sumOfAllocatedExpenses += expenseAllocations.debtServicing;
  }

  // 5. Use Miscellaneous Expenses as a buffer to meet targetTotalAnnualExpenses
  expenseAllocations.miscellaneousExpenses = Math.max(
    0,
    targetTotalAnnualExpenses - sumOfAllocatedExpenses
  );

  // 6. Calculate Final Summary Figures
  const finalTotalAnnualIncome = totalAnnualIncome;
  // Recalculate total expenses based on all actual allocations
  const finalTotalAnnualExpenses = Math.floor(
    Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0)
  );
  const finalBalance = finalTotalAnnualIncome - finalTotalAnnualExpenses;

  return {
    totalAnnualIncome: finalTotalAnnualIncome,
    totalAnnualExpenses: finalTotalAnnualExpenses,
    balance: finalBalance,
    accumulatedDebt: accumulatedDebt,
    taxRates: { ...initialTaxRates },
    incomeSources: incomeSources, // The detailed breakdown
    expenseAllocations: expenseAllocations, // The detailed breakdown
  };
};

// --- Initial City Stats Generation ---
export const generateInitialCityStats = (
  population,
  demographics,
  economicProfile
) => {
  let cityType = "City";
  if (population < 50000) cityType = "Village/Town";
  else if (population >= 250000) cityType = "Metropolis";

  let wealth = "mid";
  if (
    economicProfile.gdpPerCapita > 50000 &&
    demographics.educationLevels.bachelorsOrHigher > 30
  )
    wealth = "high";
  else if (
    economicProfile.gdpPerCapita < 30000 ||
    demographics.educationLevels.highSchoolOrLess > 35
  )
    wealth = "low";

  // Determine main issues (can be more sophisticated based on stats)
  const allPossibleIssues = [
    "Infrastructure",
    "Employment",
    "Housing",
    "Crime",
    "Education",
    "Healthcare",
    "Pollution",
    "Local Services",
  ];
  let mainIssues = [];
  const numIssues = getRandomInt(2, 3);
  let tempIssues = [...allPossibleIssues];
  for (let i = 0; i < numIssues; i++) {
    if (tempIssues.length === 0) break;
    mainIssues.push(getRandomElement(tempIssues));
    tempIssues = tempIssues.filter((issue) => !mainIssues.includes(issue));
  }
  // Add issues based on profile
  if (economicProfile.keyLocalIssuesFromProfile.length > 0) {
    mainIssues.push(...economicProfile.keyLocalIssuesFromProfile);
    mainIssues = [...new Set(mainIssues)]; // Unique
  }
  mainIssues = mainIssues.slice(0, 3); // Max 3 issues

  const initialTaxRates = {
    property: parseFloat((getRandomInt(80, 150) / 10000).toFixed(4)), // 0.8% to 1.5%
    sales: parseFloat((getRandomInt(300, 800) / 10000).toFixed(4)), // 3% to 8%
    business: parseFloat((getRandomInt(200, 600) / 10000).toFixed(4)), // 2% to 6%
  };

  const budget = generateInitialBudget(
    population,
    economicProfile.gdpPerCapita,
    initialTaxRates,
    wealth,
    economicProfile.dominantIndustries,
    mainIssues,
    cityType
  );

  const { healthcareCoverage, healthcareCostPerPerson } =
    calculateHealthcareMetrics({
      population,
      currentBudgetAllocationForHealthcare:
        budget.expenseAllocations.publicHealthServices,
      demographics,
      economicProfile,
      // You can add 'governmentEfficiency' here if you introduce it later
    });

  return {
    type: cityType,
    wealth: wealth,
    mainIssues: mainIssues,
    economicOutlook: getRandomElement(ECONOMIC_OUTLOOK_LEVELS),
    publicSafetyRating: getRandomElement(RATING_LEVELS),
    educationQuality: getRandomElement(RATING_LEVELS),
    infrastructureState: getRandomElement(RATING_LEVELS),
    overallCitizenMood: getRandomElement(MOOD_LEVELS),
    healthcareCoverage: healthcareCoverage,
    healthcareCostPerPerson: healthcareCostPerPerson,
    unemploymentRate: parseFloat(getRandomInt(30, 120) / 10).toFixed(1), // 3.0 to 12.0 %
    environmentRating: getRandomElement(RATING_LEVELS),
    cultureArtsRating: getRandomElement(RATING_LEVELS),
    electoratePolicyProfile: generateInitialElectoratePolicyProfile(
      demographics,
      economicProfile
    ),
    budget: budget,
  };
};

export const generateFullCityData = (params = {}) => {
  const id = `city_${generateId()}`;
  const name =
    params.playerDefinedCityName || generateCityName(params.countryId);
  const countryId = params.countryId;
  const regionId = params.regionId;

  // Population: Allow a hint or generate within a typical range
  const population = params.populationHint || getRandomInt(20000, 1000000);

  const demographics = generateCityDemographics(
    population,
    params.archetypeHint
  );
  const economicProfile = generateEconomicProfile(
    population,
    demographics,
    params.archetypeHint
  );

  // Generate stats, which includes the initial budget and electorate profile
  const stats = generateInitialCityStats(
    population,
    demographics,
    economicProfile
  );

  const politicalLandscape = params.basePoliticalLandscape || [];

  const cityLaws = generateInitialCityLaws({
    countryId,
    wealthLevel: stats.wealth,
    cityType: stats.type,
    gdpPerCapita: economicProfile.gdpPerCapita,
    mainIssues: stats.mainIssues,
  });

  return createCityObject({
    id,
    name,
    countryId,
    regionId,
    population,
    demographics,
    economicProfile,
    stats,
    politicalLandscape,
    cityLaws,
  });
};

// Helper to normalize an object of percentages to sum to a target (e.g., 100)
// Example: normalizeArrayBySum({ youth: 20, adult: 30, senior: 60}, 100) -> if sum is 110, scales down.
// For use in demographics.
// Note: This is a simplified normalization.
export function normalizeDemographics(obj, targetSum) {
  const newObj = { ...obj };
  const currentSum = Object.values(newObj).reduce((s, v) => s + v, 0);
  if (currentSum === 0 || currentSum === targetSum) return newObj;

  const factor = targetSum / currentSum;
  let runningTotal = 0;
  const keys = Object.keys(newObj);

  keys.forEach((key, index) => {
    if (index < keys.length - 1) {
      newObj[key] = Math.round(newObj[key] * factor);
      runningTotal += newObj[key];
    } else {
      // Assign the remainder to the last category to ensure exact sum
      newObj[key] = targetSum - runningTotal;
    }
  });
  // Final check for any rounding issues leading to negative, adjust if necessary
  if (newObj[keys[keys.length - 1]] < 0) {
    // this indicates an issue, might need a more robust normalization for small numbers
    // for now, just set to 0 and adjust another category
    let deficit = newObj[keys[keys.length - 1]];
    newObj[keys[keys.length - 1]] = 0;
    newObj[keys[0]] += deficit; // Add deficit to first category as a simple fix
  }
  return newObj;
}

/**
 * Generates the initial set of city laws based on various factors.
 * @param {object} generationParams - Contains relevant data for generation.
 * @param {string} generationParams.countryId
 * @param {string} generationParams.regionId
 * @param {string} generationParams.wealthLevel
 * @param {string} generationParams.cityType
 * @param {object} generationParams.initialElectorateProfile - The generated electorate policy profile.
 * @param {number} generationParams.gdpPerCapita
 * @returns {object} The cityLaws object.
 */
export const generateInitialCityLaws = ({
  countryId,
  wealthLevel,
  cityType,
  gdpPerCapita,
  mainIssues,
}) => {
  const laws = {};

  // Minimum Wage: Higher in wealthier cities, or if electorate leans left
  let defaultMinWage = 7.25;
  if (wealthLevel === "high" || gdpPerCapita > 45000) {
    defaultMinWage =
      getRandomInt(10, 15) + getRandomElement([0.0, 0.25, 0.5, 0.75]);
  } else if (wealthLevel === "mid" || gdpPerCapita > 30000) {
    defaultMinWage =
      getRandomInt(8, 12) + getRandomElement([0.0, 0.25, 0.5, 0.75]);
  }
  // Example: If electorate profile shows strong support for worker rights (hypothetical check)
  // if (initialElectorateProfile?.['worker_rights_support'] > 0.6) defaultMinWage *= 1.1;
  laws.minimumWage = parseFloat(defaultMinWage.toFixed(2));

  // Plastic Bag Policy: More likely to be stricter in 'Green' leaning areas or wealthier cities
  if (Math.random() < 0.2) {
    // Base chance for some policy
    if (wealthLevel === "high" || Math.random() < 0.3) {
      // Higher chance in wealthy cities
      laws.plasticBagPolicy = getRandomElement(["fee", "banned"]);
    } else {
      laws.plasticBagPolicy = "fee";
    }
  } else {
    laws.plasticBagPolicy = "none";
  }

  // Smoking in Public Places
  if (cityType === "Metropolis" || wealthLevel === "high") {
    laws.smokingInPublicPlaces = getRandomElement([
      "restricted_zones",
      "banned",
    ]);
  } else if (Math.random() < 0.4) {
    laws.smokingInPublicPlaces = "restricted_zones";
  } else {
    laws.smokingInPublicPlaces = "allowed";
  }

  // Alcohol Sales Hours (Simplified for now, could be country-specific)
  laws.alcoholSalesHours = {
    weekday: {
      start: "09:00",
      end: getRandomElement(["23:00", "00:00", "01:00", "02:00"]),
    },
    weekend: {
      start: "09:00",
      end: getRandomElement(["00:00", "01:00", "02:00"]),
    },
  };
  if (countryId === "USA" && Math.random() < 0.3) {
    // Example: Some US cities have stricter Sunday sales
    laws.alcoholSalesHours.weekend.start = "12:00";
  }

  // Rent Control Status
  if (
    cityType === "Metropolis" &&
    (mainIssues.includes("Housing") || Math.random() < 0.3)
  ) {
    laws.rentControlStatus = getRandomElement(["limited", "strict"]);
  } else if (mainIssues.includes("Housing") && Math.random() < 0.2) {
    laws.rentControlStatus = "limited";
  } else {
    laws.rentControlStatus = "none";
  }

  // Noise Ordinance Level
  if (cityType === "Metropolis") {
    laws.noiseOrdinanceLevel = getRandomElement(["moderate", "strict"]);
  } else if (cityType === "City") {
    laws.noiseOrdinanceLevel = "moderate";
  } else {
    laws.noiseOrdinanceLevel = getRandomElement(["lax", "moderate"]);
  }

  // Recycling Mandate
  if (
    wealthLevel === "high" ||
    cityType === "Metropolis" ||
    Math.random() < 0.4
  ) {
    laws.recyclingMandate = getRandomElement([
      "mandatory_residential",
      "mandatory_all",
    ]);
  } else if (Math.random() < 0.5) {
    laws.recyclingMandate = "voluntary";
  } else {
    laws.recyclingMandate = "none";
  }

  return laws;
};
