import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import './CityBudgetTab.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CityBudgetTab = ({ cityData, themeColors, themeFonts }) => {
  const { stats } = cityData || {};
  const { budget } = stats || {};

  const formatCurrency = (value, compact = false) => {
    if (value == null || isNaN(value)) return "N/A";
    if (compact && Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (compact && Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${Math.abs(value).toLocaleString()}`;
  };

  const formatPercentage = (value, precision = 2) => {
    if (value == null || isNaN(value)) return "N/A";
    return `${(value * 100).toFixed(precision)}%`;
  };

  const formatBudgetKey = (key) => {
    if (typeof key !== "string") return "Invalid Key";
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Income Sources Chart Data
  const incomeSourcesData = useMemo(() => {
    if (!budget?.incomeSources || typeof budget.incomeSources !== "object") return null;

    const entries = Object.entries(budget.incomeSources);
    const colors = [
      themeColors?.['--accent-color'] || '#4F46E5',
      themeColors?.['--button-action-bg'] || '#10B981',
      themeColors?.['--button-bg'] || '#3B82F6',
      themeColors?.['--secondary-text'] || '#6B7280',
      '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'
    ];

    return {
      labels: entries.map(([key]) => formatBudgetKey(key)),
      datasets: [{
        data: entries.map(([, value]) => typeof value === 'number' ? value : 0),
        backgroundColor: colors.slice(0, entries.length),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--ui-panel-bg').trim() || '#ffffff',
        borderWidth: 2,
      }]
    };
  }, [budget?.incomeSources, themeColors]);

  // Expense Allocations Chart Data
  const expenseAllocationsData = useMemo(() => {
    if (!budget?.expenseAllocations || typeof budget.expenseAllocations !== "object") return null;

    const entries = Object.entries(budget.expenseAllocations);
    const colors = [
      themeColors?.['--error-text'] || '#EF4444',
      themeColors?.['--accent-color'] || '#F59E0B',
      themeColors?.['--button-bg'] || '#3B82F6',
      themeColors?.['--success-text'] || '#10B981',
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];

    return {
      labels: entries.map(([key]) => formatBudgetKey(key)),
      datasets: [{
        data: entries.map(([, value]) => typeof value === 'number' ? value : 0),
        backgroundColor: colors.slice(0, entries.length),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--ui-panel-bg').trim() || '#ffffff',
        borderWidth: 2,
      }]
    };
  }, [budget?.expenseAllocations, themeColors]);

  // Tax Rates Comparison Chart
  const taxRatesData = useMemo(() => {
    if (!budget?.taxRates || typeof budget.taxRates !== "object") return null;

    const entries = Object.entries(budget.taxRates);
    const colors = [
      themeColors?.['--accent-color'] || '#4F46E5',
      themeColors?.['--button-action-bg'] || '#10B981',
      themeColors?.['--accent-color'] || '#4F46E5'
    ];

    return {
      labels: entries.map(([key]) => formatBudgetKey(key)),
      datasets: [{
        label: 'Tax Rate (%)',
        data: entries.map(([, value]) => typeof value === 'number' ? value * 100 : 0),
        backgroundColor: colors.slice(0, entries.length),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e0e0e0',
        borderWidth: 1,
      }]
    };
  }, [budget?.taxRates, themeColors]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--primary-text').trim() || '#333333',
          font: {
            family: getComputedStyle(document.documentElement).getPropertyValue('--font-main').trim().replace(/['"]/g, '') || 'Inter',
            size: 12,
          },
          boxWidth: 15,
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--ui-panel-bg').trim() || '#ffffff',
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-text').trim() || '#333333',
        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-text').trim() || '#333333',
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e0e0e0',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y || context.parsed;
            // Check if this is the tax rates chart by looking at the dataset label
            if (context.dataset.label && context.dataset.label.includes('Tax Rate')) {
              return `${context.label}: ${value.toFixed(2)}%`;
            }
            return `${context.label}: ${formatCurrency(value, true)}`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#f3f4f6',
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--secondary-text').trim() || '#666666',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--secondary-text').trim() || '#666666',
        }
      }
    }
  };

  const getBudgetHealthStatus = () => {
    if (!budget?.balance) return 'neutral';
    if (budget.balance > 0) return 'positive';
    return 'negative';
  };

  const getDebtStatus = () => {
    if (!budget?.accumulatedDebt) return 'neutral';
    if (budget.accumulatedDebt > 0) return 'debt';
    if (budget.accumulatedDebt < 0) return 'surplus';
    return 'balanced';
  };

  if (!budget) {
    return (
      <div className="budget-container">
        <div className="no-data-message">
          <p>No budget data available for this city.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-container">
      {/* Budget Header */}
      <div className="budget-header">
        <h3>City Budget & Finances</h3>
        <p className="budget-subtitle">Annual fiscal overview and tax structure</p>
      </div>

      {/* Budget Summary Cards */}
      <div className="budget-summary-cards">
        <div className="summary-card income-card">
          <div className="card-header">
            <h4>Total Income</h4>
            <span className="card-subtitle">Annual Revenue</span>
          </div>
          <div className="card-value">
            <span className="primary-value">{formatCurrency(budget.totalAnnualIncome, true)}</span>
          </div>
        </div>

        <div className="summary-card expenses-card">
          <div className="card-header">
            <h4>Total Expenses</h4>
            <span className="card-subtitle">Annual Spending</span>
          </div>
          <div className="card-value">
            <span className="primary-value">{formatCurrency(budget.totalAnnualExpenses, true)}</span>
          </div>
        </div>

        <div className={`summary-card balance-card ${getBudgetHealthStatus()}`}>
          <div className="card-header">
            <h4>Budget Balance</h4>
            <span className="card-subtitle">Surplus/Deficit</span>
          </div>
          <div className="card-value">
            <span className="primary-value">{formatCurrency(budget.balance, true)}</span>
          </div>
        </div>

        <div className={`summary-card debt-card ${getDebtStatus()}`}>
          <div className="card-header">
            <h4>Accumulated Debt</h4>
            <span className="card-subtitle">Long-term Financial Position</span>
          </div>
          <div className="card-value">
            <span className="primary-value">{formatCurrency(Math.abs(budget.accumulatedDebt || 0), true)}</span>
          </div>
        </div>
      </div>

      {/* Tax Rates Section */}
      {budget.taxRates && (
        <div className="tax-rates-section">
          <div className="section-header">
            <h4>Current Tax Rates</h4>
          </div>
          <div className="tax-rates-grid">
            {Object.entries(budget.taxRates).map(([key, value]) => (
              <div key={key} className="tax-rate-item">
                <span className="tax-type">{formatBudgetKey(key)}:</span>
                <span className="tax-value">{formatPercentage(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="budget-charts-section">
        {/* Income vs Expenses Overview */}
        {taxRatesData && (
          <div className="chart-container tax-rates-chart">
            <div className="chart-header">
              <h4>Tax Rates Comparison</h4>
            </div>
            <div className="chart-wrapper">
              <Bar data={taxRatesData} options={barChartOptions} />
            </div>
          </div>
        )}

        {incomeSourcesData && (
          <div className="chart-container income-sources-chart">
            <div className="chart-header">
              <h4>Income Sources Breakdown</h4>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={incomeSourcesData} options={chartOptions} />
            </div>
          </div>
        )}

        {expenseAllocationsData && (
          <div className="chart-container expense-allocations-chart">
            <div className="chart-header">
              <h4>Expense Allocations</h4>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={expenseAllocationsData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdowns */}
      <div className="detailed-breakdowns">
        {/* Income Sources Detail */}
        {budget.incomeSources && typeof budget.incomeSources === "object" && (
          <div className="breakdown-section income-breakdown">
            <h4>Detailed Income Sources</h4>
            <div className="breakdown-list">
              {Object.entries(budget.incomeSources).map(([key, value]) => (
                <div key={key} className="breakdown-item">
                  <span className="breakdown-label">{formatBudgetKey(key)}</span>
                  <span className="breakdown-value">{formatCurrency(value)}</span>
                  <span className="breakdown-percentage">
                    {budget.totalAnnualIncome ? 
                      `(${((value / budget.totalAnnualIncome) * 100).toFixed(1)}%)` : 
                      ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Allocations Detail */}
        {budget.expenseAllocations && typeof budget.expenseAllocations === "object" && (
          <div className="breakdown-section expense-breakdown">
            <h4>Detailed Expense Allocations</h4>
            <div className="breakdown-list">
              {Object.entries(budget.expenseAllocations).map(([key, value]) => (
                <div key={key} className="breakdown-item">
                  <span className="breakdown-label">{formatBudgetKey(key)}</span>
                  <span className="breakdown-value">{formatCurrency(value)}</span>
                  <span className="breakdown-percentage">
                    {budget.totalAnnualExpenses ? 
                      `(${((value / budget.totalAnnualExpenses) * 100).toFixed(1)}%)` : 
                      ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityBudgetTab;