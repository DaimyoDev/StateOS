import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import './CityDemographicsTab.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CityDemographicsTab = ({ cityData, themeColors, themeFonts }) => {
  const { demographics, population } = cityData || {};
  const { ageDistribution, educationLevels } = demographics || {};

  const formatPercentage = (value, precision = 1) => {
    if (value == null || isNaN(value)) return "N/A";
    return `${value.toFixed(precision)}%`;
  };

  const ageChartData = useMemo(() => {
    if (!ageDistribution) return null;

    // Use theme-appropriate colors or fallback to defaults
    const ageGroups = [
      { label: 'Youth (0-17)', value: ageDistribution.youth, color: themeColors?.['--accent-color'] || '#FF6B6B' },
      { label: 'Young Adult (18-34)', value: ageDistribution.youngAdult, color: themeColors?.['--button-action-bg'] || '#4ECDC4' },
      { label: 'Adult (35-59)', value: ageDistribution.adult, color: themeColors?.['--button-bg'] || '#45B7D1' },
      { label: 'Senior (60+)', value: ageDistribution.senior, color: themeColors?.['--secondary-text'] || '#96CEB4' }
    ];

    return {
      labels: ageGroups.map(group => group.label),
      datasets: [{
        data: ageGroups.map(group => group.value || 0),
        backgroundColor: ageGroups.map(group => group.color),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--ui-panel-bg').trim() || '#ffffff',
        borderWidth: 2,
      }]
    };
  }, [ageDistribution, themeColors]);

  const educationChartData = useMemo(() => {
    if (!educationLevels) return null;

    // Use theme-appropriate colors or fallback to defaults
    const educationGroups = [
      { label: 'High School or Less', value: educationLevels.highSchoolOrLess, color: themeColors?.['--error-text'] || '#FFB347' },
      { label: 'Some College', value: educationLevels.someCollege, color: themeColors?.['--accent-color'] || '#87CEEB' },
      { label: 'Bachelor\'s or Higher', value: educationLevels.bachelorsOrHigher, color: themeColors?.['--success-text'] || '#98FB98' }
    ];

    return {
      labels: educationGroups.map(group => group.label),
      datasets: [{
        data: educationGroups.map(group => group.value || 0),
        backgroundColor: educationGroups.map(group => group.color),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--ui-panel-bg').trim() || '#ffffff',
        borderWidth: 2,
      }]
    };
  }, [educationLevels, themeColors]);

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
      title: {
        display: false, // Disable chart.js title since we have our own
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
            const value = context.parsed;
            return `${context.label}: ${formatPercentage(value)}`;
          },
        },
      },
    },
  };

  const calculatePopulationStats = () => {
    if (!population || !ageDistribution) return null;

    const youthCount = Math.round((population * ageDistribution.youth) / 100);
    const youngAdultCount = Math.round((population * ageDistribution.youngAdult) / 100);
    const adultCount = Math.round((population * ageDistribution.adult) / 100);
    const seniorCount = Math.round((population * ageDistribution.senior) / 100);

    return {
      youth: youthCount,
      youngAdult: youngAdultCount,
      adult: adultCount,
      senior: seniorCount,
      workingAge: youngAdultCount + adultCount,
      dependentAge: youthCount + seniorCount
    };
  };

  const populationStats = calculatePopulationStats();

  return (
    <div className="city-demographics-tab">
      {/* Demographics Overview */}
      <div className="demographics-header">
        <h3>City Demographics Overview</h3>
        {population && (
          <div className="population-summary">
            <div className="population-total">
              <span className="population-number">{population.toLocaleString()}</span>
              <span className="population-label">Total Population</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="demographics-charts-section">
        {ageChartData && (
          <div className="chart-container">
            <div className="chart-header">
              <h4>Age Distribution</h4>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={ageChartData} options={chartOptions} />
            </div>
            {/* Age breakdown with actual numbers */}
            {populationStats && (
              <div className="age-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Youth (0-17):</span>
                  <span className="breakdown-value">{populationStats.youth.toLocaleString()}</span>
                  <span className="breakdown-percentage">({formatPercentage(ageDistribution.youth, 0)})</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Young Adult (18-34):</span>
                  <span className="breakdown-value">{populationStats.youngAdult.toLocaleString()}</span>
                  <span className="breakdown-percentage">({formatPercentage(ageDistribution.youngAdult, 0)})</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Adult (35-59):</span>
                  <span className="breakdown-value">{populationStats.adult.toLocaleString()}</span>
                  <span className="breakdown-percentage">({formatPercentage(ageDistribution.adult, 0)})</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Senior (60+):</span>
                  <span className="breakdown-value">{populationStats.senior.toLocaleString()}</span>
                  <span className="breakdown-percentage">({formatPercentage(ageDistribution.senior, 0)})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {educationChartData && (
          <div className="chart-container">
            <div className="chart-header">
              <h4>Education Levels (Adults)</h4>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={educationChartData} options={chartOptions} />
            </div>
            <div className="education-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">High School or Less:</span>
                <span className="breakdown-percentage">{formatPercentage(educationLevels.highSchoolOrLess, 0)}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Some College:</span>
                <span className="breakdown-percentage">{formatPercentage(educationLevels.someCollege, 0)}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Bachelor's or Higher:</span>
                <span className="breakdown-percentage">{formatPercentage(educationLevels.bachelorsOrHigher, 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Insights Section */}
      {populationStats && (
        <div className="demographics-insights">
          <h4>Key Insights</h4>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-value">{populationStats.workingAge.toLocaleString()}</div>
              <div className="insight-label">Working Age Population</div>
              <div className="insight-description">Adults aged 18-59</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{populationStats.dependentAge.toLocaleString()}</div>
              <div className="insight-label">Dependent Population</div>
              <div className="insight-description">Youth and seniors</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">
                {populationStats.workingAge > 0 
                  ? (populationStats.dependentAge / populationStats.workingAge * 100).toFixed(0) 
                  : 'N/A'}
              </div>
              <div className="insight-label">Dependency Ratio</div>
              <div className="insight-description">Dependents per 100 working-age</div>
            </div>
            {educationLevels && (
              <div className="insight-card">
                <div className="insight-value">{formatPercentage(educationLevels.bachelorsOrHigher, 0)}</div>
                <div className="insight-label">Higher Education Rate</div>
                <div className="insight-description">College graduates & above</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No data fallback */}
      {!demographics && (
        <div className="no-data-message">
          <p>No demographic data available for this city.</p>
        </div>
      )}
    </div>
  );
};

export default CityDemographicsTab;