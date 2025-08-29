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
import sweCityParts from "../data/cityNames/swe_city_parts.json";
import braCityParts from "../data/cityNames/bra_city_parts.json";
import argCityParts from "../data/cityNames/arg_city_parts.json";
import indCityParts from "../data/cityNames/ind_city_parts.json";
import mexCityParts from "../data/cityNames/mex_city_parts.json";
import colCityParts from "../data/cityNames/col_city_parts.json";
import chlCityParts from "../data/cityNames/chl_city_parts.json";
import perCityParts from "../data/cityNames/per_city_parts.json";
import criCityParts from "../data/cityNames/cri_city_parts.json";
import uryCityParts from "../data/cityNames/ury_city_parts.json";
import prtCityParts from "../data/cityNames/prt_city_parts.json";
import idnCityParts from "../data/cityNames/idn_city_parts.json";
import nldCityParts from "../data/cityNames/nld_city_parts.json";
import cheCityParts from "../data/cityNames/che_city_parts.json";
import belCityParts from "../data/cityNames/bel_city_parts.json";
import dnkCityParts from "../data/cityNames/dnk_city_parts.json";
import finCityParts from "../data/cityNames/fin_city_parts.json";
import norCityParts from "../data/cityNames/nor_city_parts.json";
import irlCityParts from "../data/cityNames/irl_city_parts.json";
import grcCityParts from "../data/cityNames/grc_city_parts.json";
import nzlCityParts from "../data/cityNames/nzl_city_parts.json";
import mysCityParts from "../data/cityNames/mys_city_parts.json";
import sgpCityParts from "../data/cityNames/sgp_city_parts.json";
import thaCityParts from "../data/cityNames/tha_city_parts.json";
import czeCityParts from "../data/cityNames/cze_city_parts.json";
import rouCityParts from "../data/cityNames/rou_city_parts.json";
import bgrCityParts from "../data/cityNames/bgr_city_parts.json";
import hrvCityParts from "../data/cityNames/hrv_city_parts.json";
import svkCityParts from "../data/cityNames/svk_city_parts.json";
import ltuCityParts from "../data/cityNames/ltu_city_parts.json";
import lvaCityParts from "../data/cityNames/lva_city_parts.json";
import estCityParts from "../data/cityNames/est_city_parts.json";
import svnCityParts from "../data/cityNames/svn_city_parts.json";
import luxCityParts from "../data/cityNames/lux_city_parts.json";
import islCityParts from "../data/cityNames/isl_city_parts.json";
import mltCityParts from "../data/cityNames/mlt_city_parts.json";
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
  SWE: sweCityParts,
  BRA: braCityParts,
  ARG: argCityParts,
  IND: indCityParts,
  MEX: mexCityParts,
  COL: colCityParts,
  CHL: chlCityParts,
  PER: perCityParts,
  CRI: criCityParts,
  URY: uryCityParts,
  PRT: prtCityParts,
  IDN: idnCityParts,
  NLD: nldCityParts,
  CHE: cheCityParts,
  BEL: belCityParts,
  DNK: dnkCityParts,
  FIN: finCityParts,
  NOR: norCityParts,
  IRL: irlCityParts,
  GRC: grcCityParts,
  NZL: nzlCityParts,
  MYS: mysCityParts,
  SGP: sgpCityParts,
  THA: thaCityParts,
  CZE: czeCityParts,
  ROU: rouCityParts,
  BGR: bgrCityParts,
  HRV: hrvCityParts,
  SVK: svkCityParts,
  LTU: ltuCityParts,
  LVA: lvaCityParts,
  EST: estCityParts,
  SVN: svnCityParts,
  LUX: luxCityParts,
  ISL: islCityParts,
  MLT: mltCityParts,
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
  isCapital: params.isCapital || false,
});

// --- State Data Structure Definition ---
export const createStateObject = (params = {}) => ({
  id: params.id,
  name: params.name || "New State",
  countryId: params.countryId || null,
  capitalCityId: params.capitalCityId || null,
  capital: params.capital || null,
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
  instanceIdBase: params.instanceIdBase,
});

export const generateFullSecondAdminRegionData = (params = {}) => {
  const { baseRegionData, parentStateData, countryId } = params;

  // Convert populationWeight to actual population (e.g., from usaCounties.js)
  // PopulationWeight represents population in thousands
  let population;
  if (baseRegionData.populationWeight !== undefined) {
    population = baseRegionData.populationWeight * 1000;
  } else if (baseRegionData.population !== undefined) {
    population = baseRegionData.population;
  } else {
    population = getRandomInt(10000, 100000);
  }

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

  // Generate political landscape similar to cities, with variation from parent state
  let politicalLandscape = [];
  if (
    parentStateData?.politicalLandscape &&
    Array.isArray(parentStateData.politicalLandscape)
  ) {
    politicalLandscape = parentStateData.politicalLandscape.map((party) => {
      const newParty = deepCopy(party);
      const shift = getRandomInt(-8, 8); // Smaller variation than states (-8% to +8%)
      const basePopularity = newParty.popularity || 0;
      newParty.popularity = Math.max(0, Math.min(100, basePopularity + shift));
      return newParty;
    });

    // Normalize the political landscape to ensure percentages add up to 100%
    politicalLandscape = normalizePartyPopularities(politicalLandscape);
  }

  // Create the final object
  return {
    ...baseRegionData, // Includes id, name, stateId from the original file
    countryId: countryId,
    population,
    demographics,
    economicProfile,
    stats,
    politicalLandscape,
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
  dominantIndustries,
  cityLaws = {}
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

  // Calculate minimum wage impact on consumer spending
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
  cityType,
  cityLaws = {}
) => {
  // ... implementation from governmentUtils.js ...
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
    isCapital: params.isCapital || false,
  });
};

// --- State Generation Logic ---
export const generateInitialStateLaws = ({
  countryId,
  wealthLevel,
  gdpPerCapita,
}) => {
  const laws = {};

  // Example State-Level Laws
  laws.stateMinimumWage = parseFloat((gdpPerCapita / 3000 + 5).toFixed(2));
  laws.environmentalProtectionAct = getRandomElement([
    "basic",
    "comprehensive",
    "strict",
  ]);
  laws.stateEducationStandards = getRandomElement([
    "federally_aligned",
    "state_specific",
    "performance_based",
  ]);
  laws.healthcareSubsidies = wealthLevel === "high" ? "expanded" : "standard";

  if (countryId === "USA") {
    laws.firearmRegulations = getRandomElement([
      "minimal",
      "moderate",
      "strict",
    ]);
  }

  return laws;
};

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

  let determinedType = params.type; // Use the type from data if it exists
  if (!determinedType) {
    // If not, determine it from the ID
    if (id.startsWith("USA_")) determinedType = "State";
    else if (id.startsWith("JPN_")) determinedType = "Prefecture";
    else if (id.startsWith("PHL_")) determinedType = "Province";
    // Add other fallbacks as needed for other countries
    else determinedType = "Region"; // Generic fallback
  }

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

  // Find the designated capital city, or fallback to the largest city
  const capitalCity =
    cities.find((city) => city.isCapital) ||
    cities.sort((a, b) => b.population - a.population)[0];

  const stateLaws = generateInitialStateLaws({
    countryId: params.countryId,
    wealthLevel: "mid", // This could be aggregated from cities for more accuracy
    gdpPerCapita: aggregatedEconomicProfile.gdpPerCapita,
  });

  // Generate budget data for the state
  const stateBudget = generateStateBudget({
    population: finalTotalPopulation,
    gdpPerCapita: aggregatedEconomicProfile.gdpPerCapita,
    countryId: params.countryId,
  });

  // --- NEW: Aggregate state-level service stats from cities so UI has data ---
  const weightedAverage = (items) => {
    let sum = 0;
    let weightSum = 0;
    for (const it of items) {
      const v = it?.value;
      const w = it?.weight || 0;
      if (v !== undefined && v !== null && !Number.isNaN(Number(v)) && w > 0) {
        sum += Number(v) * w;
        weightSum += w;
      }
    }
    return weightSum > 0 ? sum / weightSum : null;
  };

  const ratingToIndex = (rating) => {
    const idx = RATING_LEVELS.indexOf(rating);
    return idx >= 0 ? idx : null; // exclude missing/unknown ratings
  };
  const indexToRating = (idx) =>
    RATING_LEVELS[
      Math.max(0, Math.min(RATING_LEVELS.length - 1, Math.round(idx)))
    ];

  // Population-weighted averages
  const educationQualityIdx = weightedAverage(
    cities.map((c) => ({
      value: ratingToIndex(c.stats?.educationQuality),
      weight: c.population,
    }))
  );
  const infrastructureStateIdx = weightedAverage(
    cities.map((c) => ({
      value: ratingToIndex(c.stats?.infrastructureState),
      weight: c.population,
    }))
  );
  const environmentRatingIdx = weightedAverage(
    cities.map((c) => ({
      value: ratingToIndex(c.stats?.environmentRating),
      weight: c.population,
    }))
  );
  const cultureArtsRatingIdx = weightedAverage(
    cities.map((c) => ({
      value: ratingToIndex(c.stats?.cultureArtsRating),
      weight: c.population,
    }))
  );

  const healthcareCoverage = weightedAverage(
    cities.map((c) => ({
      value: c.stats?.healthcareCoverage,
      weight: c.population,
    }))
  );
  const healthcareCostPerPerson = weightedAverage(
    cities.map((c) => ({
      value: c.stats?.healthcareCostPerPerson,
      weight: c.population,
    }))
  );
  const povertyRate = weightedAverage(
    cities.map((c) => ({ value: c.stats?.povertyRate, weight: c.population }))
  );
  const crimeRatePer1000 = weightedAverage(
    cities.map((c) => ({
      value: c.stats?.crimeRatePer1000,
      weight: c.population,
    }))
  );
  const unemploymentRateAvg = weightedAverage(
    cities.map((c) => ({
      value: isNaN(parseFloat(c.stats?.unemploymentRate))
        ? 6.0
        : parseFloat(c.stats?.unemploymentRate),
      weight: c.population,
    }))
  );

  const aggregatedServiceStats = {
    educationQuality:
      educationQualityIdx !== null
        ? indexToRating(educationQualityIdx)
        : getRandomElement(RATING_LEVELS),
    infrastructureState:
      infrastructureStateIdx !== null
        ? indexToRating(infrastructureStateIdx)
        : getRandomElement(RATING_LEVELS),
    environmentRating:
      environmentRatingIdx !== null
        ? indexToRating(environmentRatingIdx)
        : getRandomElement(RATING_LEVELS),
    cultureArtsRating:
      cultureArtsRatingIdx !== null
        ? indexToRating(cultureArtsRatingIdx)
        : getRandomElement(RATING_LEVELS),
    healthcareCoverage: healthcareCoverage,
    healthcareCostPerPerson: healthcareCostPerPerson,
    povertyRate: povertyRate,
    crimeRatePer1000: crimeRatePer1000,
    unemploymentRate:
      unemploymentRateAvg !== null && !Number.isNaN(unemploymentRateAvg)
        ? unemploymentRateAvg.toFixed(1)
        : undefined,
  };

  return createStateObject({
    ...params,
    population: finalTotalPopulation,
    cities: cities,
    stateLaws: stateLaws,
    capitalCityId: capitalCity ? capitalCity.id : null,
    capital: capitalCity ? capitalCity.name : null,
    demographics: aggregatedDemographics,
    economicProfile: aggregatedEconomicProfile,
    politicalLandscape: normalizePartyPopularities(finalPoliticalLandscape),
    stats: {
      mainIssues: aggregatedMainIssues,
      ...aggregatedServiceStats,
      budget: stateBudget,
    },
    type: determinedType,
  });
};

/**
 * Generates budget data for a state/region
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
    publicEducation: Math.floor(adjustedBudgetBase * 0.35), // 35% of budget
    publicHealthServices: Math.floor(adjustedBudgetBase * 0.2), // 20% of budget
    transportationInfrastructure: Math.floor(adjustedBudgetBase * 0.15), // 15% of budget
    socialWelfarePrograms: Math.floor(adjustedBudgetBase * 0.12), // 12% of budget
    publicSafety: Math.floor(adjustedBudgetBase * 0.08), // 8% of budget
    environmentalProtection: Math.floor(adjustedBudgetBase * 0.05), // 5% of budget
    generalAdministration: Math.floor(adjustedBudgetBase * 0.05), // 5% of budget
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

export const generateNationalDemographics = (countryId) => {
  // Simplified ethnicity data; this can be expanded with more detail
  const ethnicityData = {
    USA: {
      White: 40,
      European: 20,
      Hispanic: 18,
      Black: 13,
      Asian: 6,
      Other: 3,
    },
    JPN: { Japanese: 98, Other: 2 },
    CAN: { European: 38, White: 42, Asian: 18, Indigenous: 5, Other: 5 },
  };

  const demographics = generateCityDemographics(); // Reuse for age/education structure
  demographics.ethnicities = ethnicityData[countryId] || { Dominant: 100 };

  return demographics;
};

/**
 * Generates budget data for a country/nation
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

export const generateInitialNationalStats = (countryData) => {
  console.log(countryData.economicProfile);
  const stats = generateInitialCityStats(
    countryData.population,
    countryData.demographics,
    countryData.economicProfile
  );
  // Override city-specific stats with national-level logic
  stats.type = "Nation";
  stats.mainIssues = getRandomElement([
    ["Immigration", "National Debt", "Foreign Policy"],
    ["Economic Growth", "Healthcare", "Defense Spending"],
    ["Trade Deficit", "Climate Change", "Social Security"],
  ]);

  // Replace city budget with proper national budget
  stats.budget = generateNationalBudget({
    population: countryData.population,
    gdpPerCapita: countryData.gdpPerCapita,
    countryId: countryData.id,
  });

  return stats;
};

const generateInitialLocalOffices = (
  electionTypes,
  city,
  processedParties,
  countryData
) => {
  const localOffices = [];
  const localElectionTypes = electionTypes.filter(
    (e) => e.level.startsWith("local_") && !e.level.includes("local_state")
  );

  localElectionTypes.forEach((electionType) => {
    let officeName = electionType.officeNameTemplate.replace(
      /{cityNameOrMunicipalityName}|{cityName}/g,
      city.name.trim()
    );
    const termLength = electionType.frequencyYears || 4;

    if (electionType.generatesOneWinner) {
      const holder = generateFullAIPolitician(
        countryData.id,
        processedParties,
        city
      );
      holder.currentOffice = officeName;
      localOffices.push(
        createGovernmentOffice({
          officeName,
          cityId: city.id,
          holder,
          officeId: `initial_${electionType.id}_${generateId()}`,
          officeNameTemplateId: electionType.id,
          level: electionType.level,
          termEnds: {
            year: 2025 + termLength - 1,
            month: electionType.electionMonth || 11,
            day: 1,
          },
          numberOfSeatsToFill: 1,
        })
      );
    } else {
      const numberOfSeats = calculateNumberOfSeats(
        electionType,
        city.population
      );
      if (numberOfSeats <= 0) return;

      const members = Array.from({ length: numberOfSeats }, () => {
        const member = generateFullAIPolitician(
          countryData.id,
          processedParties,
          POLICY_QUESTIONS,
          IDEOLOGY_DEFINITIONS,
          countryData
        );
        member.currentOffice = officeName;
        return member;
      });

      localOffices.push(
        createGovernmentOffice({
          officeName,
          cityId: city.id,
          members,
          officeId: `initial_${electionType.id}_${generateId()}`,
          officeNameTemplateId: electionType.id,
          level: electionType.level,
          termEnds: {
            year: 2025 + termLength - 1,
            month: electionType.electionMonth || 11,
            day: 1,
          },
          numberOfSeatsToFill: numberOfSeats,
        })
      );
    }
  });
  return localOffices;
};

/**
 * Generates initial office holders for STATE/REGIONAL government.
 */
const generateInitialStateOffices = (
  electionTypes,
  regionId,
  processedParties,
  countryData
) => {
  const stateOffices = [];
  const stateElectionTypes = electionTypes.filter((e) =>
    e.level.includes("local_state")
  );
  const regionData = countryData?.regions?.find((r) => r.id === regionId);
  if (!regionData) return [];

  // 1. Generate Executive Offices (like Governor) - This logic remains the same.
  const executiveTypes = stateElectionTypes.filter((e) => e.generatesOneWinner);
  executiveTypes.forEach((electionType) => {
    let officeName = electionType.officeNameTemplate.replace(
      /{regionName}|{stateName}|{prefectureName}|{provinceName}/g,
      regionData.name
    );
    const termLength = electionType.frequencyYears || 4;

    const holder = generateFullAIPolitician(
      countryData.id,
      processedParties,
      regionData
    );
    holder.currentOffice = officeName;

    stateOffices.push(
      createGovernmentOffice({
        officeName,
        holder,
        regionId: regionId,
        officeId: `gov_${electionType.id}_${generateId()}`,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: 1,
        instanceIdBase: `${electionType.id}_${regionData.id}`,
      })
    );
  });

  // 2. Generate Legislative Offices (Upper & Lower Houses)
  const lowerHouseType = stateElectionTypes.find(
    (e) => e.level === "local_state_lower_house"
  );
  const upperHouseType = stateElectionTypes.find(
    (e) => e.level === "local_state_upper_house"
  );

  // --- Process Lower House ---
  if (lowerHouseType) {
    const termLength = lowerHouseType.frequencyYears || 4;

    // *** NEW: Conditional logic based on the electoral system ***
    if (
      lowerHouseType.electoralSystem === "FPTP" &&
      Array.isArray(regionData.legislativeDistricts?.state_hr)
    ) {
      // Logic for district-based systems (e.g., US State Legislatures)
      regionData.legislativeDistricts.state_hr.forEach((district) => {
        const officeName = district.name;
        const holder = generateFullAIPolitician(
          countryData.id,
          processedParties,
          regionData
        );
        holder.currentOffice = officeName;

        stateOffices.push(
          createGovernmentOffice({
            officeName,
            holder,
            regionId: regionId,
            officeId: `gov_${lowerHouseType.id}_${district.id}_${generateId()}`,
            officeNameTemplateId: lowerHouseType.id,
            level: lowerHouseType.level,
            termEnds: {
              year: 2025 + termLength - 1,
              month: lowerHouseType.electionMonth || 11,
              day: 1,
            },
            numberOfSeatsToFill: 1,
            instanceIdBase: `${lowerHouseType.id}_${district.id}`,
          })
        );
      });
    } else if (
      lowerHouseType.electoralSystem === "PartyListPR" ||
      lowerHouseType.electoralSystem === "MMP"
    ) {
      // Logic for multi-member systems (e.g., German Länder)
      const numberOfSeats = calculateNumberOfSeats(
        lowerHouseType,
        regionData.population
      );
      if (numberOfSeats > 0) {
        const officeName = lowerHouseType.officeNameTemplate.replace(
          /{regionName}|{stateName}|{prefectureName}|{provinceName}/g,
          regionData.name
        );
        const members = Array.from({ length: numberOfSeats }, () => {
          const member = generateFullAIPolitician(
            countryData.id,
            processedParties,
            regionData
          );
          member.currentOffice = officeName;
          return member;
        });

        stateOffices.push(
          createGovernmentOffice({
            officeName,
            regionId: regionId,
            members, // A single office with a 'members' array
            officeId: `gov_${lowerHouseType.id}_${generateId()}`,
            officeNameTemplateId: lowerHouseType.id,
            level: lowerHouseType.level,
            termEnds: {
              year: 2025 + termLength - 1,
              month: lowerHouseType.electionMonth || 11,
              day: 1,
            },
            numberOfSeatsToFill: numberOfSeats,
            instanceIdBase: `${lowerHouseType.id}_${regionData.id}`,
          })
        );
      }
    }
  }

  // MODIFIED: Loop over the array of district objects for the Upper House
  if (
    upperHouseType &&
    Array.isArray(regionData.legislativeDistricts?.state_senate)
  ) {
    const termLength = upperHouseType.frequencyYears || 4;
    regionData.legislativeDistricts.state_senate.forEach((district) => {
      const officeName = district.name;
      const holder = generateFullAIPolitician(
        countryData.id,
        processedParties,
        regionData
      );
      holder.currentOffice = officeName;

      stateOffices.push(
        createGovernmentOffice({
          officeName,
          holder,
          regionId: regionId,
          officeId: `gov_${upperHouseType.id}_${district.id}_${generateId()}`,
          officeNameTemplateId: upperHouseType.id,
          level: upperHouseType.level,
          termEnds: {
            year: 2025 + termLength - 1,
            month: upperHouseType.electionMonth || 11,
            day: 1,
          },
          numberOfSeatsToFill: 1,
          instanceIdBase: `${upperHouseType.id}_${district.id}`,
        })
      );
    });
  }

  return stateOffices;
};

/**
 * Generates initial office holders for NATIONAL government.
 */
const generateInitialNationalOffices = (
  electionTypes,
  processedParties,
  countryData
) => {
  const nationalOffices = [];
  const nationalElectionTypes = electionTypes.filter((e) =>
    e.level.startsWith("national_")
  );

  // 1. Generate Executive / Head of State Offices
  const executiveTypes = nationalElectionTypes.filter(
    (e) => e.generatesOneWinner
  );
  executiveTypes.forEach((electionType) => {
    let officeName = electionType.officeNameTemplate.replace(
      "{countryName}",
      countryData.name
    );
    const termLength = electionType.frequencyYears || 4;
    const holder = generateFullAIPolitician(
      countryData.id,
      processedParties,
      countryData
    );
    holder.currentOffice = officeName;

    nationalOffices.push(
      createGovernmentOffice({
        officeName,
        holder,
        countryId: countryData.id,
        officeId: `initial_${electionType.id}_${generateId()}`,
        officeNameTemplateId: electionType.id,
        level: electionType.level,
        termEnds: {
          year: 2025 + termLength - 1,
          month: electionType.electionMonth || 11,
          day: 1,
        },
        numberOfSeatsToFill: 1,
      })
    );
  });

  // 2. Generate National Legislative Seats from District Data
  const lowerHouseType = nationalElectionTypes.find(
    (e) =>
      e.level === "national_lower_house" ||
      e.level === "national_lower_house_constituency"
  );
  const upperHouseType = nationalElectionTypes.find(
    (e) =>
      e.level === "national_upper_house" ||
      e.level === "national_upper_house_state_rep"
  );

  if (
    lowerHouseType &&
    Array.isArray(countryData.nationalLowerHouseDistricts)
  ) {
    const termLength = lowerHouseType.frequencyYears || 4;
    countryData.nationalLowerHouseDistricts.forEach((district) => {
      const officeName = district.name;
      const holder = generateFullAIPolitician(
        countryData.id,
        processedParties,
        countryData
      );
      holder.currentOffice = officeName;
      nationalOffices.push(
        createGovernmentOffice({
          officeName,
          holder,
          countryId: countryData.id,
          officeId: `initial_${lowerHouseType.id}_${
            district.id
          }_${generateId()}`,
          officeNameTemplateId: lowerHouseType.id,
          level: lowerHouseType.level,
          termEnds: {
            year: 2025 + termLength - 1,
            month: lowerHouseType.electionMonth || 11,
            day: 1,
          },
          numberOfSeatsToFill: 1,
        })
      );
    });
  }

  // 3. Generate Upper House Seats (Senate) - typically 2 per state/region
  if (
    upperHouseType &&
    countryData.regions &&
    Array.isArray(countryData.regions)
  ) {
    const termLength = upperHouseType.frequencyYears || 6;
    countryData.regions.forEach((region) => {
      // Generate 2 senators per state/region (common pattern)
      for (let seatNum = 1; seatNum <= 2; seatNum++) {
        const officeName = upperHouseType.officeNameTemplate
          .replace("{stateName}", region.name)
          .replace("{regionName}", region.name);

        const holder = generateFullAIPolitician(
          countryData.id,
          processedParties,
          countryData
        );
        holder.currentOffice = officeName;

        nationalOffices.push(
          createGovernmentOffice({
            officeName,
            holder,
            countryId: countryData.id,
            officeId: `initial_${upperHouseType.id}_${
              region.id
            }_${seatNum}_${generateId()}`,
            officeNameTemplateId: upperHouseType.id,
            level: upperHouseType.level,
            termEnds: {
              year: 2025 + termLength - 1,
              month: upperHouseType.electionMonth || 11,
              day: 1,
            },
            numberOfSeatsToFill: 1,
          })
        );
      }
    });
  }

  return nationalOffices;
};

/**
 * Creates the initial hierarchical government office structure
 */
export const createGovernmentOfficeStructure = () => ({
  national: {
    executive: [],
    legislative: {
      lowerHouse: [],
      upperHouse: []
    },
    judicial: []
  },
  states: {},
  cities: {}
});

/**
 * Adds offices to the hierarchical structure based on their level and type
 */
const addOfficeToStructure = (structure, office) => {
  const level = office.level;
  
  if (level?.startsWith('national_')) {
    if (level.includes('head_of_state') || level.includes('executive')) {
      structure.national.executive.push(office);
    } else if (level.includes('lower_house')) {
      structure.national.legislative.lowerHouse.push(office);
    } else if (level.includes('upper_house')) {
      structure.national.legislative.upperHouse.push(office);
    } else if (level.includes('judicial')) {
      structure.national.judicial.push(office);
    }
  } else if (level?.includes('local_state')) {
    const stateId = office.regionId;
    if (!structure.states[stateId]) {
      structure.states[stateId] = {
        executive: [],
        legislative: {
          lowerHouse: [],
          upperHouse: []
        }
      };
    }
    
    if (level.includes('governor') || office.officeNameTemplateId?.includes('governor')) {
      structure.states[stateId].executive.push(office);
    } else if (level.includes('lower_house')) {
      structure.states[stateId].legislative.lowerHouse.push(office);
    } else if (level.includes('upper_house')) {
      structure.states[stateId].legislative.upperHouse.push(office);
    }
  } else if (level?.startsWith('local_') && (level.includes('city') || office.cityId)) {
    const cityId = office.cityId;
    if (!structure.cities[cityId]) {
      structure.cities[cityId] = {
        executive: [],
        legislative: []
      };
    }
    
    if (office.officeNameTemplateId?.includes('mayor')) {
      structure.cities[cityId].executive.push(office);
    } else if (office.officeNameTemplateId?.includes('council')) {
      structure.cities[cityId].legislative.push(office);
    }
  }
};

/**
 * OVERHAULED: Main dispatcher function for generating all initial government offices.
 * Now returns a hierarchical structure instead of a flat array.
 */
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

  const localOffices = generateInitialLocalOffices(
    countryElectionTypes,
    city,
    processedParties,
    countryData
  );
  const stateOffices = generateInitialStateOffices(
    countryElectionTypes,
    regionId,
    processedParties,
    countryData
  );
  const nationalOffices = generateInitialNationalOffices(
    countryElectionTypes,
    processedParties,
    countryData
  );

  // Create hierarchical structure
  const structure = createGovernmentOfficeStructure();
  
  // Add all offices to the structure
  [...localOffices, ...stateOffices, ...nationalOffices].forEach(office => {
    addOfficeToStructure(structure, office);
  });

  return structure;
};

/**
 * Helper function to get all offices from the hierarchical structure as a flat array
 * (for backwards compatibility)
 */
export const flattenGovernmentOffices = (structure) => {
  const offices = [];
  
  // National offices
  offices.push(...structure.national.executive);
  offices.push(...structure.national.legislative.lowerHouse);
  offices.push(...structure.national.legislative.upperHouse);
  offices.push(...structure.national.judicial);
  
  // State offices
  Object.values(structure.states).forEach(state => {
    offices.push(...state.executive);
    offices.push(...state.legislative.lowerHouse);
    offices.push(...state.legislative.upperHouse);
  });
  
  // City offices
  Object.values(structure.cities).forEach(city => {
    offices.push(...city.executive);
    offices.push(...city.legislative);
  });
  
  return offices;
};

export const updateGovernmentOffice = (existingOffice, updates) => {
  const updatedOffice = { ...existingOffice, ...updates };
  return updatedOffice;
};
