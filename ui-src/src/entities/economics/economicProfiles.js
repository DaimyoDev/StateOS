// Economic profile generation utilities
// Extracted from politicalEntities.js for better organization

import { getRandomInt, getRandomElement } from "../../utils/core";

/**
 * Available industries for economic profile generation
 */
const AVAILABLE_INDUSTRIES = [
  "manufacturing",
  "services", 
  "tech",
  "tourism",
  "agriculture",
  "education",
  "healthcare",
  "government",
  "finance",
];

/**
 * Generates an economic profile for a city/region
 * @param {number} population - Population size
 * @param {Object} demographics - Demographics data including education levels
 * @returns {Object} Economic profile with industries and GDP data
 */
export const generateEconomicProfile = (population, demographics) => {
  const dominantIndustries = [];
  const numIndustries = getRandomInt(1, 3);
  let availableIndustries = [...AVAILABLE_INDUSTRIES];
  
  // Select random industries
  for (let i = 0; i < numIndustries; i++) {
    if (availableIndustries.length === 0) break;
    const industry = getRandomElement(availableIndustries);
    dominantIndustries.push(industry);
    availableIndustries = availableIndustries.filter(
      (item) => item !== industry
    );
  }

  // Calculate base GDP per capita
  let gdpPerCapita = getRandomInt(20000, 50000);
  
  // Adjust based on education levels
  if (demographics.educationLevels.bachelorsOrHigher > 30)
    gdpPerCapita += getRandomInt(5000, 15000);
  
  // Adjust based on dominant industries
  if (dominantIndustries.includes("tech"))
    gdpPerCapita += getRandomInt(5000, 20000);
  if (dominantIndustries.includes("finance"))
    gdpPerCapita += getRandomInt(3000, 12000);
  if (
    dominantIndustries.includes("manufacturing") &&
    !dominantIndustries.includes("tech")
  )
    gdpPerCapita -= getRandomInt(0, 5000);
  if (dominantIndustries.includes("agriculture"))
    gdpPerCapita -= getRandomInt(2000, 8000);

  return {
    dominantIndustries,
    gdpPerCapita,
    keyLocalIssuesFromProfile: generateEconomicIssues(dominantIndustries),
  };
};

/**
 * Generates economic issues based on dominant industries
 * @param {Array} dominantIndustries - List of dominant industries
 * @returns {Array} Array of potential economic issues
 */
const generateEconomicIssues = (dominantIndustries) => {
  const issues = [];
  
  if (dominantIndustries.includes("manufacturing")) {
    if (Math.random() < 0.3) issues.push("Environmental Pollution");
    if (Math.random() < 0.2) issues.push("Industrial Accidents");
  }
  
  if (dominantIndustries.includes("tourism")) {
    if (Math.random() < 0.25) issues.push("Seasonal Employment");
    if (Math.random() < 0.2) issues.push("Housing Affordability");
  }
  
  if (dominantIndustries.includes("agriculture")) {
    if (Math.random() < 0.3) issues.push("Water Rights");
    if (Math.random() < 0.2) issues.push("Rural Infrastructure");
  }
  
  if (dominantIndustries.includes("tech")) {
    if (Math.random() < 0.4) issues.push("Housing Affordability");
    if (Math.random() < 0.2) issues.push("Income Inequality");
  }
  
  return issues;
};

/**
 * Generates national-level demographics
 * @param {string} countryId - Country identifier
 * @returns {Object} Demographics with ethnicity data
 */
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

  // Generate basic demographics structure (age/education)
  const demographics = generateBasicDemographics();
  demographics.ethnicities = ethnicityData[countryId] || { Dominant: 100 };

  return demographics;
};

/**
 * Generates basic demographic structure (age and education distribution)
 * @returns {Object} Basic demographics data
 */
export const generateBasicDemographics = () => {
  // Age distribution
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

  // Education distribution
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
    ageDistribution: normalizeToSum(ageDist, 100),
    educationLevels: normalizeToSum(eduLevels, 100),
  };
};

/**
 * Helper function to normalize an object's values to sum to a target
 * @param {Object} obj - Object with numeric values
 * @param {number} targetSum - Target sum for all values
 * @returns {Object} Normalized object
 */
const normalizeToSum = (obj, targetSum) => {
  const currentSum = Object.values(obj).reduce((sum, val) => sum + val, 0);
  if (currentSum === 0) return obj;
  
  const normalized = {};
  Object.keys(obj).forEach(key => {
    normalized[key] = Math.round((obj[key] / currentSum) * targetSum);
  });
  
  // Fix any rounding errors
  const newSum = Object.values(normalized).reduce((sum, val) => sum + val, 0);
  const difference = targetSum - newSum;
  if (difference !== 0) {
    // Add/subtract the difference to/from the largest category
    const largestKey = Object.keys(normalized).reduce((a, b) => 
      normalized[a] > normalized[b] ? a : b
    );
    normalized[largestKey] += difference;
  }
  
  return normalized;
};