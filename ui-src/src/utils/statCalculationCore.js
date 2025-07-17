// ui-src/src/utils/statCalculationCore.js

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
