import { createStateObject } from "../data/stateData";
import { getRandomElement } from "../utils/generalUtils";

/**
 * Generates a full state data object from a list of city data objects.
 * This function aggregates city data to create a state-level overview.
 *
 * @param {object} params - The parameters for generating the state data.
 * @param {string} params.name - The name of the state.
 * @param {string} params.countryId - The ID of the country the state belongs to.
 * @param {Array<object>} params.cities - An array of city objects within the state.
 * @returns {object} The complete state data object.
 */
export const generateFullStateData = (params = {}) => {
  const {
    name,
    countryId,
    cities = [],
    totalPopulation,
    id,
    legislativeDistricts,
  } = params;

  let type = null;

  if (countryId === "JPN") {
    type = "Prefecture";
  } else if (countryId === "PHL") {
    type = "Region";
  } else if (countryId === "CAN" || countryId === "KOR") {
    type = "Province";
  } else {
    type = "State";
  }

  // Weighted Averages for Demographics
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

  // GDP Per Capita (Weighted by Population)
  const totalGDP = cities.reduce(
    (sum, city) => sum + city.population * city.economicProfile.gdpPerCapita,
    0
  );
  const averageGdpPerCapita =
    totalPopulation > 0 ? totalGDP / totalPopulation : 0;

  // Aggregate Main Issues and Dominant Industries
  const allIssues = cities.flatMap((city) => city.stats.mainIssues);
  const mainIssues = [...new Set(allIssues)]; // Get unique issues

  const allIndustries = cities.flatMap(
    (city) => city.economicProfile.dominantIndustries
  );
  const dominantIndustries = [...new Set(allIndustries)];

  // Aggregate Budget Figures
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

  // For ratings, we can take a simple average for now
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
    const averageScore = Math.round(totalScore / cities.length);
    return reverseRatingMap[averageScore] || "Average";
  };

  const capitalCity = cities.length > 0 ? getRandomElement(cities) : null;

  // Create the final state object
  const stateData = {
    id: id,
    name: name || "Unnamed State",
    countryId: countryId,
    capitalCityId: capitalCity ? capitalCity.id : null,
    cities: cities.map((c) => c.id),
    population: totalPopulation,
    legislativeDistricts: legislativeDistricts,
    type: type,
    demographics: {
      ageDistribution: weightedDemographics.ageDistribution,
      educationLevels: weightedDemographics.educationLevels,
    },
    economicProfile: {
      dominantIndustries: dominantIndustries,
      gdpPerCapita: Math.round(averageGdpPerCapita),
      keyIssues: mainIssues, // Using mainIssues as key economic issues for simplicity
    },
    stats: {
      mainIssues: mainIssues,
      economicOutlook: averageRating("economicOutlook"),
      publicSafetyRating: averageRating("publicSafetyRating"),
      educationQuality: averageRating("educationQuality"),
      infrastructureState: averageRating("infrastructureState"),
      overallCitizenMood: averageRating("overallCitizenMood"),
      healthcareQuality: averageRating("healthcareQuality"),
      environmentRating: averageRating("environmentRating"),
      cultureArtsRating: averageRating("cultureArtsRating"),
      budget: aggregatedBudget,
    },
    stateLaws: {}, // State laws would be generated by a separate, more complex function
  };

  return createStateObject(stateData);
};
