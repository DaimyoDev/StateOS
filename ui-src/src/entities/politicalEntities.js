// src/entities/politicalEntities.js
import {
  generateId,
  getRandomInt,
  getRandomElement,
  normalizeArrayBySum,
} from "../utils/core";
import {
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
} from "../data/governmentData";
import { POLICY_QUESTIONS } from "../data/policyData";
import {
  calculateHealthcareMetrics,
  calculateCrimeRate,
  calculatePovertyRate,
} from "../utils/statCalculationCore";
import { calculateNumberOfSeats } from "../utils/electionUtils";
import {
  initializePartyIdeologyScores,
  generateFullAIPolitician,
} from "./personnel";
import { IDEOLOGY_DEFINITIONS } from "../data/ideologiesData";
import { deepCopy } from "../utils/objectUtils";
import { normalizePartyPopularities } from "../utils/electionUtils";
import usaCityParts from "../data/cityNames/usa_city_parts.json";
import jpnCityParts from "../data/cityNames/jpn_city_parts.json";
import canCityParts from "../data/cityNames/can_city_parts.json";
import gerCityParts from "../data/cityNames/ger_city_parts.json";
import ausCityParts from "../data/cityNames/aus_city_parts.json";
import phlCityParts from "../data/cityNames/phl_city_parts.json";
import korCityParts from "../data/cityNames/kor_city_parts.json";
import polCityParts from "../data/cityNames/pol_city_parts.json";
import itaCityParts from "../data/cityNames/ita_city_parts.json";
import gbrCityParts from "../data/cityNames/gbr_city_parts.json";
import espCityParts from "../data/cityNames/esp_city_parts.json";
import fraCityParts from "../data/cityNames/fra_city_parts.json";
import { NAMES_BY_COUNTRY } from "../data/namesData";

const cityNamesByCountry = {
  USA: usaCityParts,
  JPN: jpnCityParts,
  CAN: canCityParts,
  GER: gerCityParts,
  AUS: ausCityParts,
  PHL: phlCityParts,
  KOR: korCityParts,
  AUT: gerCityParts,
  POL: polCityParts,
  ITA: itaCityParts,
  GBR: gbrCityParts,
  ESP: espCityParts,
  FRA: fraCityParts,
};

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
  secondAdminRegions: params.secondAdminRegions || [],
  population: params.population || 0,
  type: params.type,
  demographics: params.demographics || {},
  economicProfile: params.economicProfile || {},
  stats: params.stats || {},
  stateLaws: params.stateLaws || {},
  politicalLandscape: params.politicalLandscape || [],
  populationWeight: params.populationWeight || 1,
});

export const createGovernmentOffice = (params = {}) => ({
  officeId: params.officeId || `office_${generateId()}`,
  officeName: params.officeName || "Unnamed Office",
  officeNameTemplateId: params.officeNameTemplateId || null,
  level: params.level || "national",
  countryId: params.countryId || null,
  regionId: params.regionId || null,
  cityId: params.cityId || null,
  holder: params.holder || null,
  members: params.members || [],
  termEnds: params.termEnds || { year: 2025, month: 11, day: 1 },
  numberOfSeatsToFill: params.numberOfSeatsToFill || 1,
});

export const generateFullSecondAdminRegionData = (params = {}) => {
  const { baseRegionData, parentStateData, countryId } = params;

  // Use the population from the static file (e.g., usaCounties.js)
  const population = baseRegionData.population || getRandomInt(10000, 100000);

  // Generate demographics and economic profile, potentially influenced by the parent state
  const demographics = generateCityDemographics(); // Can reuse city logic for this
  const economicProfile = generateEconomicProfile(population, demographics);

  // Adjust GDP per capita to be relative to the parent state's average
  if (parentStateData?.economicProfile?.gdpPerCapita) {
    const stateGdpPerCapita = parentStateData.economicProfile.gdpPerCapita;
    economicProfile.gdpPerCapita = Math.round(
      stateGdpPerCapita * (getRandomInt(80, 115) / 100)
    );
  }

  const stats = generateInitialCityStats(
    population,
    demographics,
    economicProfile
  );

  // Create the final object
  return {
    ...baseRegionData, // Includes id, name, stateId from the original file
    countryId: countryId,
    population,
    demographics,
    economicProfile,
    stats,
    // Note: Laws would likely be inherited from the state or country level
    // and are not generated here for simplicity.
  };
};

// --- City Generation Logic ---

const generateCityName = (countryId, usedNames) => {
  const nameParts = cityNamesByCountry[countryId];
  let generatedName = "";

  const personNames = [];
  personNames.push(...(NAMES_BY_COUNTRY[countryId].last || []));
  personNames.push(...(NAMES_BY_COUNTRY[countryId].male || []).slice(0, 20));

  if (nameParts) {
    let attempts = 0;
    while (attempts < 50) {
      const roll = Math.random();

      // Pattern 1: Person Name based (e.g., Austin, Carson City, Brownville)
      if (personNames.length > 0 && roll < 0.4) {
        const personCore = getRandomElement(personNames);
        const subRoll = Math.random();
        if (subRoll < 0.5) {
          generatedName = personCore; // e.g., Austin
        } else if (subRoll < 0.8) {
          generatedName = `${personCore}${getRandomElement(
            nameParts.suffixes
          )}`; // e.g., Brownville
        } else {
          generatedName = `${personCore} City`; // e.g., Carson City
        }
      }
      // Pattern 2: Geographic Name based (e.g., Springfield, Northwood)
      else {
        const core = getRandomElement(nameParts.cores);
        const suffix = getRandomElement(nameParts.suffixes);
        generatedName =
          Math.random() < 0.2
            ? `${getRandomElement(nameParts.prefixes)} ${core}`
            : `${core}${suffix}`;
      }

      const finalName =
        generatedName.charAt(0).toUpperCase() + generatedName.slice(1);
      if (!usedNames.has(finalName)) {
        return finalName;
      }
      attempts++;
    }
  }

  // Fallback
  return `New Town ${getRandomInt(100, 999)}`;
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
  // ... (initial setup code for cityType, wealth, mainIssues, etc. remains the same) ...
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

  const educationQuality = getRandomElement(RATING_LEVELS);

  const povertyRate = calculatePovertyRate({
    population,
    economicProfile,
    budgetAllocationForSocialWelfare:
      budget.expenseAllocations.socialWelfarePrograms,
    educationQuality: educationQuality,
    demographics,
  });

  const crimeRatePer1000 = calculateCrimeRate({
    population,
    economicProfile,
    budgetAllocationForPublicSafety: budget.expenseAllocations.policeDepartment,
    povertyRate,
    educationQuality: educationQuality,
    cityType: cityType,
  });

  return {
    type: cityType,
    wealth,
    mainIssues,
    economicOutlook: getRandomElement(ECONOMIC_OUTLOOK_LEVELS),
    educationQuality: educationQuality,
    infrastructureState: getRandomElement(RATING_LEVELS),
    overallCitizenMood: getRandomElement(MOOD_LEVELS),
    healthcareCoverage,
    healthcareCostPerPerson,
    povertyRate,
    crimeRatePer1000,
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

export const generateCitiesForState = ({
  totalPopulation,
  countryId,
  regionId,
  basePoliticalLandscape,
}) => {
  const cities = [];
  let remainingPopulation = totalPopulation;
  const usedNames = new Set();
  const MIN_CITY_POP = 400;

  if (totalPopulation < 1000) {
    if (totalPopulation > 0) {
      const onlyCity = generateFullCityData({
        populationHint: totalPopulation,
        countryId,
        regionId,
        basePoliticalLandscape,
        usedNames,
      });
      cities.push(onlyCity);
    }
    return cities;
  }

  // 1. Create the Metropolis (Capital)
  const capitalPopPercent = getRandomInt(5, 20) / 100;
  let capitalPopulation = Math.floor(remainingPopulation * capitalPopPercent);
  if (remainingPopulation - capitalPopulation < MIN_CITY_POP) {
    capitalPopulation = remainingPopulation - MIN_CITY_POP;
  }
  const capitalCity = generateFullCityData({
    populationHint: capitalPopulation,
    countryId,
    regionId,
    basePoliticalLandscape,
    usedNames,
    isCapital: true,
  });
  cities.push(capitalCity);
  usedNames.add(capitalCity.name);
  remainingPopulation -= capitalPopulation;

  // 2. Create 1-3 Major Cities
  const numMajorCities = getRandomInt(20, 25);
  for (
    let i = 0;
    i < numMajorCities && remainingPopulation > totalPopulation * 0.1;
    i++
  ) {
    const majorCityPopPercent = getRandomInt(5, 15) / 100;
    let majorCityPopulation = Math.floor(
      remainingPopulation * majorCityPopPercent
    );
    if (remainingPopulation - majorCityPopulation < MIN_CITY_POP) break;

    const majorCity = generateFullCityData({
      populationHint: majorCityPopulation,
      countryId,
      regionId,
      basePoliticalLandscape,
      usedNames,
    });
    cities.push(majorCity);
    usedNames.add(majorCity.name);
    remainingPopulation -= majorCityPopulation;
  }

  // 3. Create a "long tail" of smaller towns and villages
  while (remainingPopulation > MIN_CITY_POP) {
    // Smaller towns have a max population (e.g., 100k) to prevent them from being too large
    const maxPopForSmallTown = Math.min(remainingPopulation, 200000);
    if (maxPopForSmallTown <= MIN_CITY_POP) break;

    let nextCityPopulation = getRandomInt(MIN_CITY_POP, maxPopForSmallTown);

    if (remainingPopulation - nextCityPopulation < MIN_CITY_POP) {
      nextCityPopulation = remainingPopulation; // Assign the remainder to the last town
    }

    const nextCity = generateFullCityData({
      populationHint: nextCityPopulation,
      countryId,
      regionId,
      basePoliticalLandscape,
      usedNames,
    });
    cities.push(nextCity);
    usedNames.add(nextCity.name);
    remainingPopulation -= nextCityPopulation;
  }

  return cities;
};

/**
 * Generates a complete, new city object with all nested data.
 * This is the main factory function for creating a city.
 */
export const generateFullCityData = (params = {}) => {
  const id = `city_${generateId()}`;
  const name =
    params.playerDefinedCityName ||
    generateCityName(params.countryId, params.usedNames || new Set());
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
    mainIssues: stats.mainIssues, // This was the missing piece
  });

  // Each city gets a slight variation of the base regional political landscape
  const politicalLandscape = (params.basePoliticalLandscape || []).map(
    (party) => {
      const newParty = deepCopy(party);
      const shift = getRandomInt(-5, 5);
      const basePopularity = newParty.popularity || 0;
      newParty.popularity = Math.max(0, Math.min(100, basePopularity + shift));
      return newParty;
    }
  );

  const normalizedLandscape = normalizePartyPopularities(politicalLandscape);

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
    politicalLandscape: normalizedLandscape,
  });
};

// --- State Generation Logic ---

/**
 * Generates a full state data object, often by aggregating data from its cities.
 */
export const generateFullStateData = (params = {}) => {
  const { countryId, totalPopulation, id, nationalParties } = params;

  const baseRegionalLandscape = (nationalParties || []).map((party) => {
    const newParty = deepCopy(party);
    const shift = getRandomInt(-10, 10);
    newParty.popularity = Math.max(5, Math.min(95, 50 + shift));
    return newParty;
  });
  const normalizedBaseLandscape = normalizePartyPopularities(
    baseRegionalLandscape
  );

  const cities = generateCitiesForState({
    totalPopulation,
    countryId,
    regionId: id,
    basePoliticalLandscape: normalizedBaseLandscape,
  });

  if (cities.length === 0) {
    return createStateObject({ ...params, cities: [], population: 0 });
  }

  const finalTotalPopulation = cities.reduce(
    (sum, city) => sum + city.population,
    0
  );

  const { aggregatedDemographics, aggregatedEconomicProfile, issueCounts } =
    cities.reduce(
      (acc, city) => {
        const weight = city.population / finalTotalPopulation;
        for (const key in acc.aggregatedDemographics.ageDistribution) {
          acc.aggregatedDemographics.ageDistribution[key] +=
            city.demographics.ageDistribution[key] * weight;
        }
        for (const key in acc.aggregatedDemographics.educationLevels) {
          acc.aggregatedDemographics.educationLevels[key] +=
            city.demographics.educationLevels[key] * weight;
        }
        acc.aggregatedEconomicProfile.totalGDP +=
          city.population * city.economicProfile.gdpPerCapita;

        // --- NEW: Aggregate main issues ---
        if (city.stats && city.stats.mainIssues) {
          city.stats.mainIssues.forEach((issue) => {
            acc.issueCounts[issue] = (acc.issueCounts[issue] || 0) + 1;
          });
        }
        // --- END NEW ---

        return acc;
      },
      {
        aggregatedDemographics: {
          ageDistribution: { youth: 0, youngAdult: 0, adult: 0, senior: 0 },
          educationLevels: {
            highSchoolOrLess: 0,
            someCollege: 0,
            bachelorsOrHigher: 0,
          },
        },
        aggregatedEconomicProfile: { totalGDP: 0 },
        issueCounts: {}, // Initialize issue counter
      }
    );

  aggregatedEconomicProfile.gdpPerCapita = Math.round(
    aggregatedEconomicProfile.totalGDP / finalTotalPopulation
  );

  // --- NEW: Determine the top issues for the state ---
  const aggregatedMainIssues = Object.entries(issueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // Take the top 3 most common issues
    .map(([issue]) => issue);
  // --- END NEW ---

  const aggregatedLandscape = {};
  cities.forEach((city) => {
    city.politicalLandscape.forEach((party) => {
      if (!aggregatedLandscape[party.id]) {
        aggregatedLandscape[party.id] = { ...party, popularity: 0 };
      }
      const weightedPopularity =
        party.popularity * (city.population / finalTotalPopulation);
      aggregatedLandscape[party.id].popularity += weightedPopularity;
    });
  });
  const finalPoliticalLandscape = Object.values(aggregatedLandscape);

  const capitalCity = cities.sort((a, b) => b.population - a.population)[0];

  return createStateObject({
    ...params,
    population: finalTotalPopulation,
    cities: cities,
    capitalCityId: capitalCity ? capitalCity.id : null,
    demographics: aggregatedDemographics,
    economicProfile: aggregatedEconomicProfile,
    politicalLandscape: normalizePartyPopularities(finalPoliticalLandscape),
    // --- NEW: Add the aggregated stats to the state object ---
    stats: {
      mainIssues: aggregatedMainIssues,
      // We can aggregate other stats like wealth, mood, etc. here in the future
    },
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
      // --- MODIFIED LOGIC for single-winner offices ---
      const holder = generateFullAIPolitician(
        countryData.id,
        processedParties,
        POLICY_QUESTIONS,
        IDEOLOGY_DEFINITIONS
      );

      // Set the currentOffice property on the politician object itself
      holder.currentOffice = officeName;

      const office = createGovernmentOffice({
        officeId: `initial_${electionType.id}_${generateId()}`,
        officeName: officeName,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        cityId: city.id,
        holder: holder, // Place the updated holder object in the office
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: 1,
      });
      initialGovernmentOffices.push(office);
    } else {
      const numberOfSeats = calculateNumberOfSeats(
        electionType,
        city.population
      );
      if (numberOfSeats <= 0) return;

      const initialMembers = [];
      for (let i = 0; i < numberOfSeats; i++) {
        // --- MODIFIED LOGIC for multi-member offices ---
        const member = generateFullAIPolitician(
          countryData.id,
          processedParties,
          POLICY_QUESTIONS,
          IDEOLOGY_DEFINITIONS
        );

        // Set the currentOffice property on the politician object
        member.currentOffice = officeName;

        initialMembers.push(member);
      }

      const office = createGovernmentOffice({
        officeId: `initial_${electionType.id}_${generateId()}`,
        officeName: officeName,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        cityId: city.id,
        members: initialMembers,
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: numberOfSeats,
      });
      initialGovernmentOffices.push(office);
    }
  });
  return initialGovernmentOffices;
};

export const updateGovernmentOffice = (existingOffice, updates) => {
  const updatedOffice = { ...existingOffice, ...updates };
  return updatedOffice;
};
