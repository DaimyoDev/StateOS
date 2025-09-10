import React, { useMemo } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import "./CityServicesTab.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CityServicesTab = ({ cityData, themeColors, themeFonts }) => {
  const { stats } = cityData || {};
  
  // Helper function for formatting percentages (matching CitySummaryTab logic)
  const formatPercentage = (value, precision = 1) => {
    if (value == null) return "N/A";
    
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || typeof numValue !== 'number') return "N/A";
    
    return `${numValue.toFixed(precision)}%`;
  };

  // Education quality helpers
  const getEducationCompositeScore = (stats) => {
    if (stats?.educationCompositeScore != null) {
      return stats.educationCompositeScore;
    }
    
    if (stats?.educationQuality) {
      const qual = stats.educationQuality.toLowerCase();
      if (qual === 'excellent') return 90;
      if (qual === 'good') return 75;
      if (qual === 'average') return 50;
      if (qual === 'poor') return 25;
      if (qual === 'very poor') return 10;
    }
    
    return 50;
  };

  const getQualityLevel = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 45) return 'average';
    return 'poor';
  };

  // Services overview data for charts
  const servicesOverviewData = useMemo(() => {
    if (!stats) return null;

    const educationScore = getEducationCompositeScore(stats);
    const healthcareScore = stats.healthcareCoverage || 50;
    const safetyScore = Math.max(0, 100 - (stats.crimeRatePer1000 || 30) * 2); // Inverse crime rate
    const povertyScore = Math.max(0, 100 - (stats.povertyRate || 15)); // Inverse poverty

    return {
      labels: ['Education', 'Healthcare', 'Public Safety', 'Economic Health'],
      datasets: [{
        label: 'Service Quality Score',
        data: [educationScore, healthcareScore, safetyScore, povertyScore],
        backgroundColor: [
          themeColors?.accent || '#4F46E5',
          themeColors?.success || '#10B981', 
          themeColors?.warning || '#F59E0B',
          themeColors?.primary || '#3B82F6'
        ],
        borderColor: themeColors?.border || '#E5E7EB',
        borderWidth: 2,
      }]
    };
  }, [stats, themeColors]);

  // Education breakdown chart
  const educationBreakdownData = useMemo(() => {
    if (!stats || (!stats.averageTestScore && !stats.graduationRate)) return null;

    return {
      labels: ['Test Scores', 'Graduation Rate', 'College Readiness', 'Overall Composite'],
      datasets: [{
        label: 'Education Metrics',
        data: [
          stats.averageTestScore || 65,
          stats.graduationRate || 85,
          stats.collegeReadiness || 45,
          getEducationCompositeScore(stats)
        ],
        backgroundColor: [
          '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'
        ],
        borderColor: themeColors?.border || '#E5E7EB',
        borderWidth: 1,
      }]
    };
  }, [stats, themeColors]);

  // Healthcare & Safety metrics
  const healthSafetyData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: ['Healthcare Coverage', 'Crime Safety Score', 'Economic Security'],
      datasets: [{
        label: 'Health & Safety Metrics (%)',
        data: [
          stats.healthcareCoverage || 70,
          Math.max(0, 100 - (stats.crimeRatePer1000 || 30) * 2),
          Math.max(0, 100 - (stats.povertyRate || 15))
        ],
        backgroundColor: [
          '#10B981', '#EF4444', '#3B82F6'
        ],
        borderColor: themeColors?.border || '#E5E7EB',
        borderWidth: 1,
      }]
    };
  }, [stats, themeColors]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: themeFonts?.main || 'system-ui'
          }
        }
      },
      tooltip: {
        backgroundColor: themeColors?.tooltipBg || 'rgba(0, 0, 0, 0.8)',
        titleColor: themeColors?.tooltipText || '#fff',
        bodyColor: themeColors?.tooltipText || '#fff',
        borderColor: themeColors?.border || '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: themeColors?.gridLines || '#F3F4F6'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (!stats) {
    return (
      <div className="services-container">
        <div className="no-data-state">
          <h3>No Services Data Available</h3>
          <p>City services information is not available for this location.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-container">
      {/* Header Section */}
      <div className="services-header">
        <h3>Public Services & Quality of Life</h3>
        <p className="services-subtitle">Comprehensive overview of city services and infrastructure</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="services-metrics-grid">
        {/* Education Card */}
        <div className="service-metric-card education-card">
          <div className="metric-header">
            <div className="metric-title">
              <h4>Education</h4>
              <span className="metric-subtitle">Composite Score</span>
            </div>
          </div>
          <div className="metric-value-section">
            <div className="primary-metric">
              <span className="metric-number">{getEducationCompositeScore(stats)}</span>
              <span className="metric-unit">/100</span>
            </div>
            <div className={`quality-indicator ${getQualityLevel(getEducationCompositeScore(stats))}`}>
              {getQualityLevel(getEducationCompositeScore(stats)).charAt(0).toUpperCase() + 
               getQualityLevel(getEducationCompositeScore(stats)).slice(1)}
            </div>
          </div>
          {stats.averageTestScore != null && (
            <div className="metric-breakdown">
              <div className="breakdown-item">
                <span>Test Scores:</span>
                <span>{stats.averageTestScore}/100</span>
              </div>
              {stats.graduationRate != null && (
                <div className="breakdown-item">
                  <span>Graduation:</span>
                  <span>{formatPercentage(stats.graduationRate)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Healthcare Card */}
        <div className="service-metric-card healthcare-card">
          <div className="metric-header">
            <div className="metric-title">
              <h4>Healthcare</h4>
              <span className="metric-subtitle">Coverage & Cost</span>
            </div>
          </div>
          <div className="metric-value-section">
            <div className="primary-metric">
              <span className="metric-number">{(stats.healthcareCoverage || 0).toFixed(1)}</span>
              <span className="metric-unit">%</span>
            </div>
            <div className={`quality-indicator ${stats.healthcareCoverage >= 85 ? 'excellent' : stats.healthcareCoverage >= 70 ? 'good' : 'average'}`}>
              Coverage
            </div>
          </div>
          <div className="metric-breakdown">
            <div className="breakdown-item">
              <span>Cost/Person:</span>
              <span>${(stats.healthcareCostPerPerson || 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Public Safety Card */}
        <div className="service-metric-card safety-card">
          <div className="metric-header">
            <div className="metric-title">
              <h4>Public Safety</h4>
              <span className="metric-subtitle">Crime & Security</span>
            </div>
          </div>
          <div className="metric-value-section">
            <div className="primary-metric">
              <span className="metric-number">{(stats.crimeRatePer1000 || 0).toFixed(1)}</span>
              <span className="metric-unit">/1000</span>
            </div>
            <div className={`quality-indicator ${stats.crimeRatePer1000 <= 15 ? 'excellent' : stats.crimeRatePer1000 <= 30 ? 'good' : 'poor'}`}>
              Crime Rate
            </div>
          </div>
        </div>

        {/* Economic Health Card */}
        <div className="service-metric-card economic-card">
          <div className="metric-header">
            <div className="metric-title">
              <h4>Economic Health</h4>
              <span className="metric-subtitle">Poverty & Employment</span>
            </div>
          </div>
          <div className="metric-value-section">
            <div className="primary-metric">
              <span className="metric-number">{(stats.povertyRate || 0).toFixed(1)}</span>
              <span className="metric-unit">%</span>
            </div>
            <div className={`quality-indicator ${stats.povertyRate <= 10 ? 'excellent' : stats.povertyRate <= 20 ? 'good' : 'poor'}`}>
              Poverty Rate
            </div>
          </div>
          <div className="metric-breakdown">
            <div className="breakdown-item">
              <span>Unemployment:</span>
              <span>{formatPercentage(stats.unemploymentRate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="services-charts-section">
        <div className="charts-grid">
          {/* Services Overview Chart */}
          {servicesOverviewData && (
            <div className="chart-container services-overview-chart">
              <h4>Services Quality Overview</h4>
              <div className="chart-wrapper">
                <Doughnut data={servicesOverviewData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Education Breakdown Chart */}
          {educationBreakdownData && (
            <div className="chart-container education-breakdown-chart">
              <h4>Education Metrics Breakdown</h4>
              <div className="chart-wrapper">
                <Bar data={educationBreakdownData} options={barChartOptions} />
              </div>
            </div>
          )}

          {/* Health & Safety Chart */}
          {healthSafetyData && (
            <div className="chart-container health-safety-chart">
              <h4>Health & Safety Indicators</h4>
              <div className="chart-wrapper">
                <Bar data={healthSafetyData} options={barChartOptions} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Services Grid */}
      <div className="additional-services-section">
        <h4>Infrastructure & Quality of Life</h4>
        <div className="additional-services-grid">
          <div className="service-item">
            <span className="service-label">Infrastructure:</span>
            <span className="service-value">{stats.infrastructureState || "N/A"}</span>
          </div>
          <div className="service-item">
            <span className="service-label">Environment:</span>
            <span className="service-value">{stats.environmentRating || "N/A"}</span>
          </div>
          <div className="service-item">
            <span className="service-label">Culture & Arts:</span>
            <span className="service-value">{stats.cultureArtsRating || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityServicesTab;