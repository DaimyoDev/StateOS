import React from "react";
import useGameStore from "../../store";
import RegionPieChart from "../charts/RegionPieChart";
import "./TabStyles.css";
import "./LocalAreaTab.css";

const formatPercentage = (value, precision = 1) => {
  const num = parseFloat(value);
  if (value == null || isNaN(num)) return "N/A";
  return `${num.toFixed(precision)}%`;
};

function LocalAreaTab({ campaignData }) {
  const { startingCity } = campaignData || {};
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const { getCoalitionsForCity } = useGameStore((state) => state.actions);
  
  // Subscribe to coalition system changes directly from the store
  const coalitionSystems = useGameStore((state) => state.activeCampaign?.coalitionSystems);
  
  // Get coalition data for the city if available
  const coalitionData = getCoalitionsForCity(startingCity?.id);

  if (!startingCity?.stats?.budget) {
    return (
      <div className="tab-content-container local-area-tab ">
        <h2 className="tab-title">Local Area Information</h2>
        <p>No local area data available.</p>
      </div>
    );
  }

  const {
    name: cityName,
    population,
    demographics,
    economicProfile,
    stats: cityStats,
    politicalLandscape,
  } = startingCity;
  
  // Get state information if available
  const parentState = campaignData?.parentState;
  const { ageDistribution, educationLevels } = demographics || {};
  const { dominantIndustries, gdpPerCapita } = economicProfile || {};
  const budget = cityStats.budget;

  const getDebtSurplusDisplay = () => {
    const debt = budget.accumulatedDebt;
    if (debt > 0) {
      return {
        text: `($${debt.toLocaleString()})`,
        label: "Debt",
        color: "var(--error-text)",
      };
    }
    if (debt < 0) {
      return {
        text: `($${Math.abs(debt).toLocaleString()})`,
        label: "Surplus",
        color: "var(--success-text)",
      };
    }
    return { text: "", label: "Balanced", color: "var(--primary-text)" };
  };

  const debtSurplus = getDebtSurplusDisplay();

  return (
    <div className="tab-content-container local-area-tab ">
      <h2 className="tab-title">{cityName} - Detailed Overview</h2>

      <div className="local-info-grid">
        {/* Card 1: City Profile */}
        <div className="info-card city-profile-card">
          <h3>City Profile</h3>
          <p>
            <strong>Population:</strong> {population?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Type:</strong> {cityStats.type || "N/A"}
          </p>
          <p>
            <strong>Wealth Level:</strong> {cityStats.wealth || "N/A"}
          </p>
          <h4>Key Local Issues:</h4>
          {cityStats.mainIssues.length > 0 ? (
            <ul className="issues-list">
              {cityStats.mainIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p>No specific issues highlighted.</p>
          )}
        </div>

        {/* Card 2: Demographics */}
        <div className="info-card demographics-card">
          <h3>Demographics</h3>
          <h4>Age Distribution:</h4>
          <p>Youth (0-17): {formatPercentage(ageDistribution.youth, 0)}</p>
          <p>
            Young Adult (18-34):{" "}
            {formatPercentage(ageDistribution.youngAdult, 0)}
          </p>
          <p>Adult (35-59): {formatPercentage(ageDistribution.adult, 0)}</p>
          <p>Senior (60+): {formatPercentage(ageDistribution.senior, 0)}</p>
          <h4>Education Levels (Adults):</h4>
          <p>
            High School or Less:{" "}
            {formatPercentage(educationLevels.highSchoolOrLess, 0)}
          </p>
          <p>
            Some College: {formatPercentage(educationLevels.someCollege, 0)}
          </p>
          <p>
            Bachelors or Higher:{" "}
            {formatPercentage(educationLevels.bachelorsOrHigher, 0)}
          </p>
        </div>

        {/* Card 3: Economic Snapshot */}
        <div className="info-card economic-snapshot-card">
          <h3>Economic Snapshot</h3>
          <p>
            <strong>Economic Outlook:</strong>{" "}
            {cityStats.economicOutlook || "N/A"}
          </p>
          <p>
            <strong>Unemployment Rate:</strong>{" "}
            {formatPercentage(cityStats.unemploymentRate)}
          </p>
          <p>
            <strong>Poverty Rate:</strong>{" "}
            {formatPercentage(cityStats.povertyRate)}
          </p>
          <p>
            <strong>GDP per Capita:</strong> $
            {gdpPerCapita?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Dominant Industries:</strong>{" "}
            {dominantIndustries?.join(", ") || "N/A"}
          </p>
        </div>

        {/* Card 4: Public Services */}
        <div className="info-card public-services-card">
          <h3>Public Services</h3>
          <p>
            <strong>Public Safety Rating:</strong>{" "}
            {cityStats.publicSafetyRating || "N/A"}
          </p>
          <p>
            <strong>Crime Rate (per 1,000):</strong>{" "}
            {cityStats.crimeRatePer1000 || "N/A"}
          </p>
          <p>
            <strong>Education Quality:</strong>{" "}
            {cityStats.educationQuality || "N/A"}
          </p>
          <p>
            <strong>Healthcare Coverage:</strong>{" "}
            {formatPercentage(cityStats.healthcareCoverage)}
          </p>
          <p>
            <strong>Infrastructure State:</strong>{" "}
            {cityStats.infrastructureState || "N/A"}
          </p>
        </div>

        {/* Card 5: City Finances */}
        <div className="info-card city-finances-card">
          <h3>City Finances (Annual)</h3>
          <p>
            <strong>Income:</strong> $
            {budget.totalAnnualIncome?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Expenses:</strong> $
            {budget.totalAnnualExpenses?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Balance:</strong>
            <span
              style={{
                color:
                  budget.balance >= 0
                    ? "var(--success-text)"
                    : "var(--error-text)",
              }}
            >
              ${budget.balance?.toLocaleString() || "N/A"}
            </span>
          </p>
          <p>
            <strong>Accumulated:</strong>
            <span style={{ color: debtSurplus.color }}>
              {debtSurplus.label} {debtSurplus.text}
            </span>
          </p>
        </div>

        {/* Card 6: City Political Climate */}
        <div className="info-card landscape-card">
          <h3>City Political Climate - {cityName}</h3>
          <div className="pie-chart-wrapper-local-tab">
            <RegionPieChart
              politicalLandscape={politicalLandscape}
              themeColors={currentTheme?.colors}
            />
          </div>
        </div>

        {/* Card 7: State Political Climate */}
        {campaignData?.parentState?.politicalLandscape && (
          <div className="info-card landscape-card">
            <h3>State Political Climate - {campaignData.parentState.name}</h3>
            <div className="pie-chart-wrapper-local-tab">
              <RegionPieChart
                politicalLandscape={campaignData.parentState.politicalLandscape}
                themeColors={currentTheme?.colors}
              />
            </div>
          </div>
        )}

        {/* Card 8: Coalition Data */}
        {coalitionData && (
          <div className="info-card coalition-data-card">
            <h3>Political Coalitions - {cityName}</h3>
            <p className="section-description">
              Major voting blocs and demographic coalitions active in the city
            </p>
            <div className="coalitions-list">
              {Array.from(coalitionData.base).map(([coalitionId, coalition]) => {
                const demographics = coalitionData.demographics?.get(coalitionId);
                const ideology = coalitionData.ideology?.get(coalitionId);
                const state = coalitionData.state?.get(coalitionId);
                
                return (
                  <div key={coalitionId} className="coalition-item">
                    <div className="coalition-header">
                      <h4>{coalition.name}</h4>
                      <span className="coalition-size">
                        {formatPercentage(coalition.size * 100, 1)} of electorate
                      </span>
                    </div>
                    <div className="coalition-details">
                      <p><strong>Ideology:</strong> {ideology || 'N/A'}</p>
                      {demographics && (
                        <>
                          <p><strong>Location:</strong> {demographics.location}</p>
                          <p><strong>Age Group:</strong> {demographics.age}</p>
                          <p><strong>Education:</strong> {demographics.education}</p>
                          <p><strong>Occupation:</strong> {demographics.occupation}</p>
                        </>
                      )}
                      {state && (
                        <>
                          <p><strong>Current Mood:</strong> 
                            <span className={state.currentMood >= 0 ? 'text-success' : 'text-error'}>
                              {state.currentMood >= 0 ? 'Positive' : 'Negative'}
                            </span>
                          </p>
                          <p><strong>Mobilization:</strong> 
                            <span className="mobilization-value">
                              {state.mobilization != null ? 
                                formatPercentage(state.mobilization * 100, 1) : 
                                "50.0%"
                              }
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocalAreaTab;
