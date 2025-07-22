// src/entities/politicalEntities.js
import {
  generateId,
  getRandomInt,
  getRandomElement,
  normalizeArrayBySum,
  distributeValueProportionally,
} from "../utils/core";
import {
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
} from "../data/governmentData";
import { POLICY_QUESTIONS } from "../data/policyData";
import { calculateHealthcareMetrics } from "../utils/statCalculationCore";
import {
  calculateNumberOfSeats,
  generateRandomOfficeHolder,
} from "../utils/electionUtils";
import { initializePartyIdeologyScores } from "./personnel";
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";

// --- City Data Structure Definition ---
export const createCityObject = (params = {}) => ({
  id: params.id || `city_${generateId()}`,
  name: params.name || "New City",
  countryId: params.countryId || null,
  regionId: params.regionId || null,
  population: params.population || getRandomInt(5000, 2000000),
  demographics: params.demographics || {},
  economicProfile: params.economicProfile || {},
  stats: params.stats || {},
  cityLaws: params.cityLaws || {},
  politicalLandscape: params.politicalLandscape || [],
});

// --- State Data Structure Definition ---
export const createStateObject = (params = {}) => ({
  id: params.id,
  name: params.name || "New State",
  countryId: params.countryId || null,
  capitalCityId: params.capitalCityId || null,
  legislativeDistricts: params.legislativeDistricts || null,
  cities: params.cities || [],
  population: params.population || 0,
  type: params.type,
  demographics: params.demographics || {},
  economicProfile: params.economicProfile || {},
  stats: params.stats || {},
  stateLaws: params.stateLaws || {},
  politicalLandscape: params.politicalLandscape || [],
});

// --- City Generation Logic ---

const generateCityName = () => {
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

export const generateCityDemographics = () => {
  let ageDist = { youth: 20, youngAdult: 25, adult: 35, senior: 20 };
  ageDist.youth = getRandomInt(15, 25);
  ageDist.youngAdult = getRandomInt(20, 30);
  ageDist.adult = getRandomInt(30, 40);
  ageDist.senior = 100 - ageDist.youth - ageDist.youngAdult - ageDist.adult;
  if (ageDist.senior < 10) {
    let deficit = 10 - ageDist.senior;
    ageDist.adult -= deficit;
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
    ageDistribution: normalizeArrayBySum(ageDist, 100, 0),
    educationLevels: normalizeArrayBySum(eduLevels, 100, 0),
  };
};

export const generateEconomicProfile = (population, demographics) => {
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
    keyLocalIssuesFromProfile: [],
  };
};

export const generateInitialElectoratePolicyProfile = () => {
  const profile = {};
  POLICY_QUESTIONS.forEach((q) => {
    if (q.options?.length > 0) {
      profile[q.id] = getRandomElement(q.options).value;
    }
  });
  return profile;
};

export const calculateDetailedIncomeSources = (
  population,
  gdpPerCapita,
  taxRates,
  cityType,
  dominantIndustries
) => {
  // ... implementation from governmentUtils.js ...
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
  incomeSources.feesAndPermits = Math.floor(
    population * getRandomInt(15, 35) +
      dominantIndustries.length * gdpPerCapita * 0.0015
  );
  if (cityType !== "Village/Town" && Math.random() < 0.6) {
    incomeSources.utilityRevenue = Math.floor(
      population * getRandomInt(25, 60)
    );
  }
  incomeSources.grantsAndSubsidies = Math.floor(
    population * getRandomInt(10, 30) +
      (gdpPerCapita < 35000 ? population * 15 : 0)
  );
  incomeSources.investmentIncome = Math.floor(
    (incomeSources.propertyTaxRevenue +
      incomeSources.salesTaxRevenue +
      incomeSources.businessTaxRevenue) *
      (getRandomInt(1, 15) / 1000)
  );
  incomeSources.otherRevenue = Math.floor(population * getRandomInt(5, 15));
  return incomeSources;
};

export const generateInitialBudget = (
  population,
  gdpPerCapita,
  initialTaxRates,
  wealthLevel,
  dominantIndustries,
  mainIssues,
  cityType
) => {
  // ... implementation from governmentUtils.js ...
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
  targetTotalAnnualExpenses = Math.max(
    Math.floor(totalAnnualIncome * 0.8),
    Math.min(targetTotalAnnualExpenses, Math.floor(totalAnnualIncome * 1.2))
  );
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
    debtServicing: 0,
    miscellaneousExpenses: 0,
  };
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
  const normalizedAllocations = normalizeArrayBySum(allocations, 90, 1);
  let sumOfAllocatedExpenses = 0;
  for (const key in normalizedAllocations) {
    if (Object.prototype.hasOwnProperty.call(expenseAllocations, key)) {
      expenseAllocations[key] = Math.floor(
        targetTotalAnnualExpenses * (normalizedAllocations[key] / 100)
      );
      sumOfAllocatedExpenses += expenseAllocations[key];
    }
  }
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

export const generateInitialCityStats = (
  population,
  demographics,
  economicProfile
) => {
  // ... implementation from governmentUtils.js ...
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
  if (economicProfile.keyLocalIssuesFromProfile.length > 0) {
    mainIssues.push(...economicProfile.keyLocalIssuesFromProfile);
    mainIssues = [...new Set(mainIssues)];
  }
  mainIssues = mainIssues.slice(0, 3);
  const initialTaxRates = {
    property: parseFloat((getRandomInt(80, 150) / 10000).toFixed(4)),
    sales: parseFloat((getRandomInt(300, 800) / 10000).toFixed(4)),
    business: parseFloat((getRandomInt(200, 600) / 10000).toFixed(4)),
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
    });
  return {
    type: cityType,
    wealth,
    mainIssues,
    economicOutlook: getRandomElement(ECONOMIC_OUTLOOK_LEVELS),
    publicSafetyRating: getRandomElement(RATING_LEVELS),
    educationQuality: getRandomElement(RATING_LEVELS),
    infrastructureState: getRandomElement(RATING_LEVELS),
    overallCitizenMood: getRandomElement(MOOD_LEVELS),
    healthcareCoverage,
    healthcareCostPerPerson,
    unemploymentRate: parseFloat(getRandomInt(30, 120) / 10).toFixed(1),
    environmentRating: getRandomElement(RATING_LEVELS),
    cultureArtsRating: getRandomElement(RATING_LEVELS),
    electoratePolicyProfile: generateInitialElectoratePolicyProfile(
      demographics,
      economicProfile
    ),
    budget,
  };
};

export const generateInitialCityLaws = ({
  countryId,
  wealthLevel,
  cityType,
  gdpPerCapita,
  mainIssues,
}) => {
  // ... implementation from governmentUtils.js ...
  const laws = {};
  let defaultMinWage = 7.25;
  if (wealthLevel === "high" || gdpPerCapita > 45000)
    defaultMinWage =
      getRandomInt(10, 15) + getRandomElement([0.0, 0.25, 0.5, 0.75]);
  else if (wealthLevel === "mid" || gdpPerCapita > 30000)
    defaultMinWage =
      getRandomInt(8, 12) + getRandomElement([0.0, 0.25, 0.5, 0.75]);
  laws.minimumWage = parseFloat(defaultMinWage.toFixed(2));
  if (Math.random() < 0.2) {
    if (wealthLevel === "high" || Math.random() < 0.3)
      laws.plasticBagPolicy = getRandomElement(["fee", "banned"]);
    else laws.plasticBagPolicy = "fee";
  } else {
    laws.plasticBagPolicy = "none";
  }
  if (cityType === "Metropolis" || wealthLevel === "high")
    laws.smokingInPublicPlaces = getRandomElement([
      "restricted_zones",
      "banned",
    ]);
  else if (Math.random() < 0.4) laws.smokingInPublicPlaces = "restricted_zones";
  else laws.smokingInPublicPlaces = "allowed";
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
  if (countryId === "USA" && Math.random() < 0.3)
    laws.alcoholSalesHours.weekend.start = "12:00";
  if (
    cityType === "Metropolis" &&
    (mainIssues.includes("Housing") || Math.random() < 0.3)
  )
    laws.rentControlStatus = getRandomElement(["limited", "strict"]);
  else if (mainIssues.includes("Housing") && Math.random() < 0.2)
    laws.rentControlStatus = "limited";
  else laws.rentControlStatus = "none";
  if (cityType === "Metropolis")
    laws.noiseOrdinanceLevel = getRandomElement(["moderate", "strict"]);
  else if (cityType === "City") laws.noiseOrdinanceLevel = "moderate";
  else laws.noiseOrdinanceLevel = getRandomElement(["lax", "moderate"]);
  if (
    wealthLevel === "high" ||
    cityType === "Metropolis" ||
    Math.random() < 0.4
  )
    laws.recyclingMandate = getRandomElement([
      "mandatory_residential",
      "mandatory_all",
    ]);
  else if (Math.random() < 0.5) laws.recyclingMandate = "voluntary";
  else laws.recyclingMandate = "none";
  return laws;
};

/**
 * Generates a complete, new city object with all nested data.
 * This is the main factory function for creating a city.
 */
export const generateFullCityData = (params = {}) => {
  const id = `city_${generateId()}`;
  const name =
    params.playerDefinedCityName || generateCityName(params.countryId);
  const population = params.populationHint || getRandomInt(20000, 1000000);

  const demographics = generateCityDemographics();
  const economicProfile = generateEconomicProfile(population, demographics);
  const stats = generateInitialCityStats(
    population,
    demographics,
    economicProfile
  );
  const cityLaws = generateInitialCityLaws({
    countryId: params.countryId,
    wealthLevel: stats.wealth,
    cityType: stats.type,
    gdpPerCapita: economicProfile.gdpPerCapita,
    mainIssues: stats.mainIssues,
  });

  return createCityObject({
    id,
    name,
    countryId: params.countryId,
    regionId: params.regionId,
    population,
    demographics,
    economicProfile,
    stats,
    cityLaws,
    politicalLandscape: params.basePoliticalLandscape || [],
  });
};

// --- State Generation Logic ---

/**
 * Generates a full state data object, often by aggregating data from its cities.
 */
export const generateFullStateData = (params = {}) => {
  const {
    name,
    countryId,
    cities = [],
    totalPopulation,
    id,
    legislativeDistricts,
    nationalParties,
  } = params;
  let type = "State";
  if (countryId === "JPN") type = "Prefecture";
  else if (countryId === "PHL") type = "Region";
  else if (countryId === "CAN" || countryId === "KOR") type = "Province";

  // If cities are provided, aggregate their data. Otherwise, use provided totals or generate placeholders.
  let aggregatedDemographics, aggregatedEconomicProfile, aggregatedStats;

  if (cities.length > 0 && totalPopulation > 0) {
    // --- Aggregation Logic ---
    const weightedDemographics = {
      ageDistribution: { youth: 0, youngAdult: 0, adult: 0, senior: 0 },
      educationLevels: {
        highSchoolOrLess: 0,
        someCollege: 0,
        bachelorsOrHigher: 0,
      },
    };
    cities.forEach((city) => {
      const weight = city.population / totalPopulation;
      for (const key in weightedDemographics.ageDistribution) {
        weightedDemographics.ageDistribution[key] +=
          city.demographics.ageDistribution[key] * weight;
      }
      for (const key in weightedDemographics.educationLevels) {
        weightedDemographics.educationLevels[key] +=
          city.demographics.educationLevels[key] * weight;
      }
    });
    aggregatedDemographics = {
      ageDistribution: normalizeArrayBySum(
        weightedDemographics.ageDistribution,
        100,
        1
      ),
      educationLevels: normalizeArrayBySum(
        weightedDemographics.educationLevels,
        100,
        1
      ),
    };

    const totalGDP = cities.reduce(
      (sum, city) => sum + city.population * city.economicProfile.gdpPerCapita,
      0
    );
    const averageGdpPerCapita =
      totalPopulation > 0 ? totalGDP / totalPopulation : 0;
    const allIssues = cities.flatMap((city) => city.stats.mainIssues);
    const mainIssues = [...new Set(allIssues)];
    const allIndustries = cities.flatMap(
      (city) => city.economicProfile.dominantIndustries
    );
    const dominantIndustries = [...new Set(allIndustries)];
    aggregatedEconomicProfile = {
      dominantIndustries,
      gdpPerCapita: Math.round(averageGdpPerCapita),
      keyIssues: mainIssues,
    };

    // ... Aggregation for stats ...
    const aggregatedBudget = cities.reduce(
      (totals, city) => {
        totals.totalAnnualIncome += city.stats.budget.totalAnnualIncome;
        totals.totalAnnualExpenses += city.stats.budget.totalAnnualExpenses;
        totals.balance += city.stats.budget.balance;
        totals.accumulatedDebt += city.stats.budget.accumulatedDebt;
        return totals;
      },
      {
        totalAnnualIncome: 0,
        totalAnnualExpenses: 0,
        balance: 0,
        accumulatedDebt: 0,
      }
    );

    const averageRating = (key) => {
      const ratingMap = {
        Excellent: 5,
        Good: 4,
        Average: 3,
        Poor: 2,
        "Very Poor": 1,
      };
      const reverseRatingMap = [
        "",
        "Very Poor",
        "Poor",
        "Average",
        "Good",
        "Excellent",
      ];
      const totalScore = cities.reduce(
        (sum, city) => sum + (ratingMap[city.stats[key]] || 3),
        0
      );
      const averageScore =
        cities.length > 0 ? Math.round(totalScore / cities.length) : 3;
      return reverseRatingMap[averageScore] || "Average";
    };

    aggregatedStats = {
      mainIssues,
      economicOutlook: averageRating(
        "economicOutlook",
        ECONOMIC_OUTLOOK_LEVELS
      ),
      publicSafetyRating: averageRating("publicSafetyRating", RATING_LEVELS),
      educationQuality: averageRating("educationQuality", RATING_LEVELS),
      infrastructureState: averageRating("infrastructureState", RATING_LEVELS),
      overallCitizenMood: averageRating("overallCitizenMood", MOOD_LEVELS),
      budget: aggregatedBudget,
    };
  } else {
    // --- Placeholder Generation for states without city data ---
    aggregatedDemographics = generateCityDemographics();

    // 1. Generate the economic profile, which contains gdpPerCapita
    aggregatedEconomicProfile = generateEconomicProfile(
      totalPopulation,
      aggregatedDemographics
    );

    // 2. Generate the rest of the stats, passing in the profile we just made
    const tempCityStats = generateInitialCityStats(
      totalPopulation,
      aggregatedDemographics,
      aggregatedEconomicProfile
    );

    // 3. Assemble the final stats object, ensuring the economic profile is included
    aggregatedStats = {
      mainIssues: tempCityStats.mainIssues,
      economicOutlook: tempCityStats.economicOutlook,
      publicSafetyRating: tempCityStats.publicSafetyRating,
      educationQuality: tempCityStats.educationQuality,
      infrastructureState: tempCityStats.infrastructureState,
      overallCitizenMood: tempCityStats.overallCitizenMood,
      budget: tempCityStats.budget,
    };
  }

  const capitalCity = cities.length > 0 ? getRandomElement(cities) : null;

  let regionalPoliticalLandscape = [];
  if (nationalParties && nationalParties.length > 0) {
    // Create a deep copy to avoid modifying the original array
    const partiesCopy = JSON.parse(JSON.stringify(nationalParties));

    // Assign random popularity values to each party for this specific region
    const popularities = distributeValueProportionally(100, partiesCopy.length);
    regionalPoliticalLandscape = partiesCopy.map((party, index) => {
      party.popularity = popularities[index];
      return party;
    });
  }

  return createStateObject({
    id,
    name,
    countryId,
    capitalCityId: capitalCity ? capitalCity.id : null,
    cities: cities.map((c) => c.id),
    population: totalPopulation,
    legislativeDistricts,
    type,
    demographics: aggregatedDemographics,
    economicProfile: aggregatedEconomicProfile,
    stats: aggregatedStats,
    stateLaws: {},
    politicalLandscape: regionalPoliticalLandscape,
  });
};

export const generateInitialGovernmentOffices = ({
  countryElectionTypes,
  city,
  countryData,
  regionId,
  availableParties,
}) => {
  const processedParties = initializePartyIdeologyScores(
    availableParties,
    IDEOLOGY_DEFINITIONS
  );

  const initialGovernmentOffices = [];

  countryElectionTypes.forEach((electionType) => {
    if (
      !electionType.level.startsWith("local_") &&
      !electionType.level.startsWith("regional_") &&
      !electionType.level.startsWith("national_")
    ) {
      return;
    }

    let officeName = electionType.officeNameTemplate;
    if (electionType.level.startsWith("local_")) {
      officeName = officeName.replace(
        /{cityNameOrMunicipalityName}|{cityName}/g,
        city.name.trim()
      );
    } else if (electionType.level.startsWith("regional_")) {
      const regionData = countryData?.regions?.find((r) => r.id === regionId);
      officeName = officeName.replace(
        /{regionName}|{stateName}|{prefectureName}|{provinceName}/g,
        regionData?.name || "Region"
      );
    } else if (electionType.level.startsWith("national_")) {
      officeName = officeName.replace(
        "{countryName}",
        countryData?.name || "Nation"
      );
    }

    const termLength = electionType.frequencyYears || 4;

    if (electionType.generatesOneWinner) {
      const holder = generateRandomOfficeHolder(
        processedParties, // <-- Use the corrected variable
        officeName,
        countryData.id
      );

      initialGovernmentOffices.push({
        officeId: `initial_${electionType.id}_${generateId()}`,
        officeName: officeName,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        cityId: city.id,
        holder: holder,
        members: [],
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: 1,
      });
    } else {
      const numberOfSeats = calculateNumberOfSeats(
        electionType,
        city.population
      );
      if (numberOfSeats <= 0) return;

      const initialMembers = [];
      for (let i = 0; i < numberOfSeats; i++) {
        let memberRoleTitle = `Member, ${officeName}`;
        if (
          [
            "BlockVote",
            "SNTV_MMD",
            "PluralityMMD",
            "PartyListPR",
            "MMP",
            "PartyListPR",
            "MMP",
          ].includes(electionType.electoralSystem)
        ) {
          memberRoleTitle = `Member, ${officeName} (Seat ${i + 1})`;
        }

        const member = generateRandomOfficeHolder(
          processedParties, // <-- Use the corrected variable
          memberRoleTitle,
          countryData.id
        );
        initialMembers.push(member);
      }

      initialGovernmentOffices.push({
        officeId: `initial_${electionType.id}_${generateId()}`,
        officeName: officeName,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        cityId: city.id,
        holder: null,
        members: initialMembers,
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: numberOfSeats,
      });
    }
  });
  return initialGovernmentOffices;
};
