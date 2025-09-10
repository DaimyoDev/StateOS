import React from "react";
import "./CitySummaryTab.css";

const CitySummaryTab = ({ cityData }) => {
  const {
    name: cityName,
    population,
    demographics,
    economicProfile,
    stats,
  } = cityData || {};

  const {
    type,
    wealth,
    mainIssues = [],
    economicOutlook,
    educationQuality,
    infrastructureState,
    overallCitizenMood,
    unemploymentRate,
    povertyRate,
    crimeRatePer1000,
    budget,
    environmentRating,
    cultureArtsRating,
    healthcareCoverage,
    healthcareCostPerPerson,
  } = stats || {};

  const { dominantIndustries, gdpPerCapita } = economicProfile || {};

  // Helper functions for status indicators
  const getStatusColor = (value, thresholds) => {
    if (!value) return "neutral";
    const { excellent, good, poor } = thresholds;
    if (value <= excellent) return "excellent";
    if (value <= good) return "good";
    if (value <= poor) return "warning";
    return "danger";
  };

  const getMoodStatus = (mood) => {
    if (!mood) return "neutral";
    const m = mood.toLowerCase();
    if (m.includes("prospering") || m.includes("optimistic")) return "excellent";
    if (m.includes("content")) return "good";
    if (m.includes("concerned")) return "average";
    if (m.includes("frustrated") || m.includes("very unhappy")) return "poor";
    return "neutral";
  };

  const getEconomicStatus = (outlook) => {
    if (!outlook) return "neutral";
    const ol = outlook.toLowerCase();
    if (ol.includes("booming") || ol.includes("strong growth")) return "excellent";
    if (ol.includes("moderate growth") || ol.includes("slow growth")) return "good";
    if (ol.includes("stagnant")) return "average";
    if (ol.includes("recession") || ol.includes("declining")) return "poor";
    return "neutral";
  };

  const formatNumber = (num) => {
    if (!num || typeof num !== 'number') return "N/A";
    
    // Handle billions more precisely
    if (num >= 1000000000000) { // Trillions
      return `${(num / 1000000000000).toFixed(1)}T`;
    }
    if (num >= 10000000000) { // 10+ billion - no decimal
      return `${(num / 1000000000).toFixed(0)}B`;
    }
    if (num >= 1000000000) { // 1-9.9 billion - one decimal
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 10000000) { // 10+ million - no decimal
      return `${(num / 1000000).toFixed(0)}M`;
    }
    if (num >= 1000000) { // 1-9.9 million - one decimal
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 10000) { // 10K+ - no decimal
      return `${(num / 1000).toFixed(0)}K`;
    }
    if (num >= 1000) { // 1-9.9K - one decimal
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatPercentage = (value, precision = 1) => {
    if (value == null) return "N/A";
    
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || typeof numValue !== 'number') return "N/A";
    
    return `${numValue.toFixed(precision)}%`;
  };

  // Education quality helpers for numerical metrics
  const getEducationQualityLevel = (stats) => {
    const score = getEducationCompositeScore(stats);
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 45) return 'average';
    return 'poor';
  };

  const getEducationQualityPercentage = (stats) => {
    return getEducationCompositeScore(stats);
  };

  const getEducationCompositeScore = (stats) => {
    // Use educationCompositeScore if available from the unified system
    if (stats?.educationCompositeScore != null) {
      return stats.educationCompositeScore;
    }
    
    // Fallback to legacy educationQuality if available
    if (stats?.educationQuality) {
      const qual = stats.educationQuality.toLowerCase();
      if (qual === 'excellent') return 90;
      if (qual === 'good') return 75;
      if (qual === 'average') return 50;
      if (qual === 'poor') return 25;
      if (qual === 'very poor') return 10;
    }
    
    return 50; // Default neutral score
  };

  const getEducationDisplayValue = (stats) => {
    const score = getEducationCompositeScore(stats);
    return `${score}/100`;
  };

  return (
    <div className="city-summary-container">
      {/* Hero Section with City Overview */}
      <div className="info-card city-hero-section">
        <div className="city-hero-content">
          <div className="city-title-block">
            <div className="city-tags">
              <span className="city-tag type-tag">{type || "Unknown Type"}</span>
              <span className="city-tag wealth-tag">{wealth || "Unknown"} Wealth</span>
              <span className="city-tag population-tag">{formatNumber(population)} citizens</span>
            </div>
          </div>
          
          <div className="city-mood-indicator">
            <div className={`mood-status-dot ${getMoodStatus(overallCitizenMood)}`}></div>
            <div className="mood-text">
              <span className="mood-label">Citizen Mood</span>
              <span className="mood-value">{overallCitizenMood || "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="metrics-dashboard">
        <div className="metrics-grid">
          {/* Economic Health Card */}
          <div className="info-card metric-card economic-card">
            <div className="metric-header">
              <h3>Economic Health</h3>
            </div>
            <div className="metric-content">
              <div className="metric-row primary">
                <span className="metric-label">Outlook: </span>
                <span className="metric-value highlight">{economicOutlook || "N/A"}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">GDP per Capita: </span>
                <span className="metric-value">${formatNumber(gdpPerCapita)}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Unemployment: </span>
                <span className={`metric-value ${(typeof unemploymentRate === 'number' && unemploymentRate > 8) || (typeof unemploymentRate === 'string' && parseFloat(unemploymentRate) > 8) ? 'warning' : (typeof unemploymentRate === 'number' && unemploymentRate > 5) || (typeof unemploymentRate === 'string' && parseFloat(unemploymentRate) > 5) ? 'caution' : 'good'}`}>
                  {formatPercentage(unemploymentRate)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Poverty Rate: </span>
                <span className={`metric-value ${(typeof povertyRate === 'number' && povertyRate > 20) || (typeof povertyRate === 'string' && parseFloat(povertyRate) > 20) ? 'warning' : (typeof povertyRate === 'number' && povertyRate > 12) || (typeof povertyRate === 'string' && parseFloat(povertyRate) > 12) ? 'caution' : 'good'}`}>
                  {formatPercentage(povertyRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Quality of Life Card */}
          <div className="info-card metric-card quality-card">
            <div className="metric-header">
              <h3>Quality of Life</h3>
            </div>
            <div className="metric-content">
              <div className="quality-indicators">
                <div className="quality-item">
                  <div className="quality-bar-container">
                    <span className="quality-label">Education</span>
                    <div className="quality-bar">
                      <div className={`quality-fill ${getEducationQualityLevel(stats)}`} 
                           style={{width: `${getEducationQualityPercentage(stats)}%`}}>
                      </div>
                    </div>
                    <span className="quality-value">{getEducationDisplayValue(stats)}</span>
                  </div>
                </div>
                <div className="quality-item">
                  <div className="quality-bar-container">
                    <span className="quality-label">Infrastructure</span>
                    <div className="quality-bar">
                      <div className={`quality-fill ${infrastructureState?.toLowerCase()}`}
                           style={{width: infrastructureState === 'excellent' ? '100%' : 
                                         infrastructureState === 'good' ? '75%' : 
                                         infrastructureState === 'average' ? '50%' : 
                                         infrastructureState === 'poor' ? '25%' : '10%'}}>
                      </div>
                    </div>
                    <span className="quality-value">{infrastructureState || "N/A"}</span>
                  </div>
                </div>
                <div className="quality-item">
                  <div className="quality-bar-container">
                    <span className="quality-label">Environment</span>
                    <div className="quality-bar">
                      <div className={`quality-fill ${environmentRating?.toLowerCase()}`}
                           style={{width: environmentRating === 'excellent' ? '100%' : 
                                         environmentRating === 'good' ? '75%' : 
                                         environmentRating === 'average' ? '50%' : 
                                         environmentRating === 'poor' ? '25%' : '10%'}}>
                      </div>
                    </div>
                    <span className="quality-value">{environmentRating || "N/A"}</span>
                  </div>
                </div>
                <div className="quality-item">
                  <div className="quality-bar-container">
                    <span className="quality-label">Culture & Arts</span>
                    <div className="quality-bar">
                      <div className={`quality-fill ${cultureArtsRating?.toLowerCase()}`}
                           style={{width: cultureArtsRating === 'excellent' ? '100%' : 
                                         cultureArtsRating === 'good' ? '75%' : 
                                         cultureArtsRating === 'average' ? '50%' : 
                                         cultureArtsRating === 'poor' ? '25%' : '10%'}}>
                      </div>
                    </div>
                    <span className="quality-value">{cultureArtsRating || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Public Safety & Health Card */}
          <div className="info-card metric-card safety-card">
            <div className="metric-header">
              <h3>Safety & Health</h3>
            </div>
            <div className="metric-content">
              <div className="metric-row">
                <span className="metric-label">Crime Rate: </span>
                <span className={`metric-value ${(typeof crimeRatePer1000 === 'number' && crimeRatePer1000 > 10) || (typeof crimeRatePer1000 === 'string' && parseFloat(crimeRatePer1000) > 10) ? 'warning' : (typeof crimeRatePer1000 === 'number' && crimeRatePer1000 > 5) || (typeof crimeRatePer1000 === 'string' && parseFloat(crimeRatePer1000) > 5) ? 'caution' : 'good'}`}>
                  {typeof crimeRatePer1000 === 'number' ? crimeRatePer1000.toFixed(1) : typeof crimeRatePer1000 === 'string' && !isNaN(parseFloat(crimeRatePer1000)) ? parseFloat(crimeRatePer1000).toFixed(1) : "N/A"}/1000
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Healthcare Coverage: </span>
                <span className={`metric-value ${(typeof healthcareCoverage === 'number' && healthcareCoverage < 70) || (typeof healthcareCoverage === 'string' && parseFloat(healthcareCoverage) < 70) ? 'warning' : (typeof healthcareCoverage === 'number' && healthcareCoverage < 85) || (typeof healthcareCoverage === 'string' && parseFloat(healthcareCoverage) < 85) ? 'caution' : 'good'}`}>
                  {formatPercentage(healthcareCoverage)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Healthcare Cost/Person: </span>
                <span className="metric-value">${typeof healthcareCostPerPerson === 'number' ? healthcareCostPerPerson.toFixed(0) : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Industries & Economy Card */}
          <div className="info-card metric-card industries-card">
            <div className="metric-header">
              <h3>Key Industries</h3>
            </div>
            <div className="metric-content">
              <div className="industries-list">
                {dominantIndustries && dominantIndustries.length > 0 ? (
                  dominantIndustries.map((industry, index) => (
                    <div key={index} className="industry-item">
                      <span className="industry-name">{industry}</span>
                    </div>
                  ))
                ) : (
                  <span className="no-data">No dominant industries identified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Issues Section */}
      {mainIssues && mainIssues.length > 0 && (
        <div className="info-card key-issues-section">
          <h3 className="section-title">Key Local Issues</h3>
          <div className="issues-container">
            {mainIssues.map((issue, index) => (
              <div key={index} className="issue-card">
                <span className="issue-number">{index + 1}</span>
                <span className="issue-text">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview Mini Section */}
      {budget && (
        <div className="info-card budget-overview-section">
          <h3 className="section-title">Budget Snapshot</h3>
          <div className="budget-summary-grid">
            <div className="budget-item income">
              <span className="budget-label">Annual Income</span>
              <span className="budget-value">${formatNumber(budget.totalAnnualIncome)}</span>
            </div>
            <div className="budget-item expenses">
              <span className="budget-label">Annual Expenses</span>
              <span className="budget-value">${formatNumber(budget.totalAnnualExpenses)}</span>
            </div>
            <div className={`budget-item balance ${budget.balance >= 0 ? 'positive' : 'negative'}`}>
              <span className="budget-label">Balance</span>
              <span className="budget-value">
                {budget.balance >= 0 ? '+' : '-'}${formatNumber(Math.abs(budget.balance))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySummaryTab;