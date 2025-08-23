/**
 * Calculates the detailed income sources for a state or region.
 * @param {object} region - The state/region object, containing population, gdpPerCapita, etc.
 * @param {object} nationalFinances - National level financial data, like federal tax rates.
 * @returns {object} Detailed income sources for the region.
 */
export const calculateStateIncomeSources = (region, nationalFinances) => {
  const { population, gdpPerCapita, stats } = region;
  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromPropertyTaxes = population * (taxRates.property || 0.01) * (gdpPerCapita * 0.1);
  const incomeFromSalesTaxes = population * (taxRates.sales || 0.05) * (gdpPerCapita * 0.2);
  const incomeFromBusinessTaxes = population * (taxRates.business || 0.03) * (gdpPerCapita * 0.3);

  return {
    propertyTaxes: Math.floor(incomeFromPropertyTaxes),
    salesTaxes: Math.floor(incomeFromSalesTaxes),
    businessTaxes: Math.floor(incomeFromBusinessTaxes),
    federalGrants: 0, // Placeholder for future implementation
  };
};

/**
 * Recalculates the complete budget for a given state/region.
 * @param {object} region - The state/region object to update.
 * @param {object} nationalFinances - National financial data.
 * @returns {object} The updated budget object for the region.
 */
export const runStateBudgetUpdate = (region, nationalFinances) => {
  if (!region?.stats?.budget) {
    return region.stats.budget;
  }

  const newIncomeSources = calculateStateIncomeSources(region, nationalFinances);
  const newTotalAnnualIncome = Object.values(newIncomeSources).reduce((sum, val) => sum + val, 0);

  const expenseAllocations = region.stats.budget.expenseAllocations || {};
  const newTotalAnnualExpenses = Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0);

  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = region.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  return {
    ...region.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: newIncomeSources,
  };
};

/**
 * Calculates the detailed income sources for the nation.
 * @param {object} country - The country object.
 * @param {Array<object>} allRegions - An array of all region objects within the country.
 * @returns {object} Detailed income sources for the nation.
 */
export const calculateNationalIncomeSources = (country, allRegions) => {
  const { population, gdpPerCapita, stats } = country;
  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromCorporateTaxes = population * (taxRates.corporate || 0.1) * (gdpPerCapita * 0.4);
  const incomeFromIncomeTaxes = population * (taxRates.income || 0.15) * (gdpPerCapita * 0.5);

  return {
    corporateTaxes: Math.floor(incomeFromCorporateTaxes),
    incomeTaxes: Math.floor(incomeFromIncomeTaxes),
    tariffs: 0, // Placeholder
  };
};

/**
 * Recalculates the complete budget for the nation.
 * @param {object} country - The country object to update.
 * @param {Array<object>} allRegions - An array of all region objects.
 * @returns {object} The updated budget object for the nation.
 */
export const runNationalBudgetUpdate = (country, allRegions) => {
  if (!country?.stats?.budget) {
    return country.stats.budget;
  }

  const newIncomeSources = calculateNationalIncomeSources(country, allRegions);
  const newTotalAnnualIncome = Object.values(newIncomeSources).reduce((sum, val) => sum + val, 0);

  const expenseAllocations = country.stats.budget.expenseAllocations || {};
  const newTotalAnnualExpenses = Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0);

  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = country.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  return {
    ...country.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: newIncomeSources,
  };
};
