import { getRandomElement } from "../utils/generalUtils";
import {
  MOOD_LEVELS,
  ECONOMIC_OUTLOOK_LEVELS,
  RATING_LEVELS,
} from "./governmentData";

export const createStateObject = (params = {}) => ({
  id: params.id,
  name: params.name || "New State",
  countryId: params.countryId || null,
  capitalCityId: params.capitalCityId || null,
  legislativeDistricts: params.legislativeDistricts || null,
  cities: params.cities || [],
  population: params.population || 0,
  type: params.type,

  demographics: {
    ageDistribution: params.ageDistribution || {
      youth: 0,
      youngAdult: 0,
      adult: 0,
      senior: 0,
    },
    educationLevels: params.educationLevels || {
      highSchoolOrLess: 0,
      someCollege: 0,
      bachelorsOrHigher: 0,
    },
  },

  economicProfile: {
    dominantIndustries: params.dominantIndustries || [],
    gdpPerCapita: params.gdpPerCapita || 0,
    keyIssues: params.keyIssues || [],
  },

  stats: {
    type: "State",
    mainIssues: params.mainIssues || [],
    economicOutlook:
      params.economicOutlook || getRandomElement(ECONOMIC_OUTLOOK_LEVELS),
    publicSafetyRating:
      params.publicSafetyRating || getRandomElement(RATING_LEVELS),
    educationQuality:
      params.educationQuality || getRandomElement(RATING_LEVELS),
    infrastructureState:
      params.infrastructureState || getRandomElement(RATING_LEVELS),
    overallCitizenMood:
      params.overallCitizenMood || getRandomElement(MOOD_LEVELS),
    unemploymentRate: params.unemploymentRate || "0.0",
    healthcareQuality:
      params.healthcareQuality || getRandomElement(RATING_LEVELS),
    environmentRating:
      params.environmentRating || getRandomElement(RATING_LEVELS),
    cultureArtsRating:
      params.cultureArtsRating || getRandomElement(RATING_LEVELS),
    budget: {
      totalAnnualIncome: params.budget?.totalAnnualIncome || 0,
      totalAnnualExpenses: params.budget?.totalAnnualExpenses || 0,
      balance: params.budget?.balance || 0,
      accumulatedDebt: params.budget?.accumulatedDebt || 0,
    },
  },

  stateLaws: params.stateLaws || {},
});
