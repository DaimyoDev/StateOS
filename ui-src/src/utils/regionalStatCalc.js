/**
 * Calculates the detailed income sources for a state or region.
 * @param {object} region - The state/region object, containing population, gdpPerCapita, etc.
 * @param {object} nationalFinances - National level financial data, like federal tax rates.
 * @returns {object} Detailed income sources for the region.
 */
export const calculateStateIncomeSources = (region, nationalFinances) => {
  const { population, economicProfile, stats } = region;
  const gdpPerCapita = economicProfile?.gdpPerCapita;

  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromPropertyTaxes =
    population * (taxRates.property || 0.01) * (gdpPerCapita * 0.1);
  const incomeFromSalesTaxes =
    population * (taxRates.sales || 0.05) * (gdpPerCapita * 0.2);
  const incomeFromBusinessTaxes =
    population * (taxRates.business || 0.03) * (gdpPerCapita * 0.3);

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
    return region?.stats?.budget;
  }

  // Add monthly economic variations (±3% to ±8%)
  const economicVariation = 1 + (Math.random() - 0.5) * 0.16; // -8% to +8%
  const seasonalFactor =
    1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.03; // ±3% seasonal

  const newIncomeSources = calculateStateIncomeSources(
    region,
    nationalFinances
  );

  // Apply economic variations to income
  const variableIncomeSources = {
    propertyTaxes: Math.floor(
      newIncomeSources.propertyTaxes * economicVariation
    ),
    salesTaxes: Math.floor(
      newIncomeSources.salesTaxes * economicVariation * seasonalFactor
    ),
    businessTaxes: Math.floor(
      newIncomeSources.businessTaxes * economicVariation
    ),
    federalGrants: newIncomeSources.federalGrants, // Federal grants are more stable
  };

  const newTotalAnnualIncome = Object.values(variableIncomeSources).reduce(
    (sum, val) => sum + val,
    0
  );

  // Expenses also vary but less dramatically (±2% to ±5%)
  const expenseVariation = 1 + (Math.random() - 0.5) * 0.1; // -5% to +5%
  const baseExpenseAllocations = region.stats.budget.expenseAllocations || {};

  const variableExpenseAllocations = {};
  Object.keys(baseExpenseAllocations).forEach((key) => {
    variableExpenseAllocations[key] = Math.floor(
      baseExpenseAllocations[key] * expenseVariation
    );
  });

  const newTotalAnnualExpenses = Object.values(
    variableExpenseAllocations
  ).reduce((sum, val) => sum + val, 0);

  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = region.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  const result = {
    ...region.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: variableIncomeSources,
    expenseAllocations: variableExpenseAllocations,
  };

  return result;
};

/**
 * Calculates the detailed income sources for the nation.
 * @param {object} country - The country object.
 * @param {Array<object>} allRegions - An array of all region objects within the country.
 * @returns {object} Detailed income sources for the nation.
 */
export const calculateNationalIncomeSources = (country, allRegions) => {
  const { population, economicProfile, stats } = country;
  const gdpPerCapita = economicProfile?.gdpPerCapita || country.gdpPerCapita;

  const taxRates = stats?.budget?.taxRates || {};

  const incomeFromCorporateTaxes =
    population * (taxRates.corporate || 0.1) * (gdpPerCapita * 0.4);
  const incomeFromIncomeTaxes =
    population * (taxRates.income || 0.15) * (gdpPerCapita * 0.5);

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
    return country?.stats?.budget;
  }

  // National economic variations are usually smaller but can be significant (±2% to ±6%)
  const economicVariation = 1 + (Math.random() - 0.5) * 0.12; // -6% to +6%
  const globalMarketFactor = 1 + (Math.random() - 0.5) * 0.08; // ±4% for global influences

  const newIncomeSources = calculateNationalIncomeSources(country, allRegions);

  // Apply economic variations to national income
  const variableIncomeSources = {
    corporateTaxes: Math.floor(
      newIncomeSources.corporateTaxes * economicVariation * globalMarketFactor
    ),
    incomeTaxes: Math.floor(newIncomeSources.incomeTaxes * economicVariation),
    tariffs: Math.floor(newIncomeSources.tariffs * globalMarketFactor), // More affected by global trade
  };

  const newTotalAnnualIncome = Object.values(variableIncomeSources).reduce(
    (sum, val) => sum + val,
    0
  );

  // National expenses vary but are more stable than income (±1% to ±4%)
  const expenseVariation = 1 + (Math.random() - 0.5) * 0.08; // -4% to +4%
  const baseExpenseAllocations = country.stats.budget.expenseAllocations || {};

  const variableExpenseAllocations = {};
  Object.keys(baseExpenseAllocations).forEach((key) => {
    // Some expenses are more variable than others
    const variability =
      key === "defense" || key === "infrastructure"
        ? expenseVariation
        : key === "interestOnDebt"
        ? 1 // Interest on debt is fixed
        : 1 + (expenseVariation - 1) * 0.5; // Other expenses vary less
    variableExpenseAllocations[key] = Math.floor(
      baseExpenseAllocations[key] * variability
    );
  });

  const newTotalAnnualExpenses = Object.values(
    variableExpenseAllocations
  ).reduce((sum, val) => sum + val, 0);

  const newBalance = newTotalAnnualIncome - newTotalAnnualExpenses;
  let newAccumulatedDebt = country.stats.budget.accumulatedDebt || 0;

  if (newBalance < 0) {
    newAccumulatedDebt += Math.abs(newBalance);
  } else {
    newAccumulatedDebt = Math.max(0, newAccumulatedDebt - newBalance);
  }

  const result = {
    ...country.stats.budget,
    totalAnnualIncome: newTotalAnnualIncome,
    totalAnnualExpenses: newTotalAnnualExpenses,
    balance: newBalance,
    accumulatedDebt: newAccumulatedDebt,
    incomeSources: variableIncomeSources,
    expenseAllocations: variableExpenseAllocations,
  };

  return result;
};
