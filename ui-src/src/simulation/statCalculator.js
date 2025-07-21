// src/simulation/statCalculator.js
// This file contains pure functions for calculating complex, derived game statistics.

/**
 * Calculates the current healthcare coverage percentage and the actual cost per person.
 *
 * @param {object} params
 * @param {number} params.population - The total population of the entity.
 * @param {number} params.currentBudgetAllocationForHealthcare - The current annual budget for healthcare.
 * @param {object} params.demographics - The demographics object with age distribution.
 * @param {object} params.economicProfile - The economic profile with GDP per capita.
 * @param {number} [params.governmentEfficiency=1] - An efficiency multiplier (1 = 100% efficient).
 * @returns {{healthcareCoverage: number, healthcareCostPerPerson: number}}
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

  // A base cost assumption for providing 100% healthcare coverage to one person for a year.
  const BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE = 200;

  // Adjust the base cost based on various factors.
  let effectiveCostPerCapita =
    BASE_HEALTHCARE_COST_PER_CAPITA_100_PERCENT_COVERAGE;

  // Factor in demographics: older populations are more expensive to cover.
  const seniorRatio = (demographics?.ageDistribution?.senior || 15) / 100;
  effectiveCostPerCapita *= 1 + (seniorRatio - 0.15) * 0.5; // e.g., 20% seniors increases cost by 2.5%

  // Factor in economy: wealthier areas have higher healthcare costs.
  const gdpPerCapitaNormalized =
    (economicProfile?.gdpPerCapita || 40000) / 50000;
  effectiveCostPerCapita *= 1 + (gdpPerCapitaNormalized - 0.8) * 0.1; // e.g., GDP of 60k increases cost by 4%

  // Factor in government efficiency.
  effectiveCostPerCapita /= Math.max(0.1, governmentEfficiency); // Prevent division by zero.

  // Calculate coverage based on budget vs. required cost.
  let healthcareCoverage = 0;
  if (effectiveCostPerCapita > 0) {
    const requiredBudgetFor100Percent = population * effectiveCostPerCapita;
    healthcareCoverage =
      (currentBudgetAllocationForHealthcare / requiredBudgetFor100Percent) *
      100;
  }

  // Clamp coverage between 0% and 100%.
  healthcareCoverage = Math.max(0, Math.min(100, healthcareCoverage));

  // Calculate the simple cost per person based on the budget.
  const healthcareCostPerPerson =
    currentBudgetAllocationForHealthcare / population;

  return {
    healthcareCoverage: parseFloat(healthcareCoverage.toFixed(1)),
    healthcareCostPerPerson: parseFloat(healthcareCostPerPerson.toFixed(2)),
  };
};
