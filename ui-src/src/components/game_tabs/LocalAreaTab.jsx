import React from "react";
import useGameStore from "../../store"; // For theme access and potentially direct data access
import RegionPieChart from "../charts/RegionPieChart";
import "./TabStyles.css";
import "./LocalAreaTab.css";

// Helper to format demographic percentages and tax rates
const formatPercentage = (value, precision = 1) => {
  if (value == null || isNaN(value)) return "N/A";
  return `${value.toFixed(precision)}%`;
};

function LocalAreaTab({ campaignData }) {
  // campaignData should be the activeCampaign object
  // It's often more robust to pull activeCampaign directly from the store
  // const activeCampaign = useGameStore((state) => state.activeCampaign);
  // const campaignDataToUse = activeCampaign || campaignData; // Use store data if available

  // For now, we'll assume campaignData is the correct activeCampaign object
  const { startingCity, countryId, regionId, currentOffice, playerApproval } =
    campaignData || {};

  const {
    name: cityName,
    population,
    demographics,
    economicProfile,
    stats: cityStats,
    politicalLandscape,
  } = startingCity || {};

  const { ageDistribution, educationLevels } = demographics || {};

  const { dominantIndustries, gdpPerCapita } = economicProfile || {};

  // Destructure budget and its components carefully
  const budget = cityStats?.budget;
  const {
    type: cityType,
    wealth: wealthLevel,
    mainIssues = [],
    economicOutlook,
    publicSafetyRating,
    educationQuality,
    infrastructureState,
    overallCitizenMood,
    unemploymentRate,
    // budget object itself is destructured above
    healthcareQuality,
    environmentRating,
    cultureArtsRating,
  } = cityStats || {};

  const taxRates = budget?.taxRates; // Accessing nested taxRates from the budget object

  const availableCountries = useGameStore.getState().availableCountries || [];
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );

  const countryName =
    startingCity?.countryName ||
    availableCountries.find((c) => c.id === countryId)?.name;
  const regionName =
    startingCity?.regionName ||
    availableCountries
      .find((c) => c.id === countryId)
      ?.regions?.find((r) => r.id === regionId)?.name;

  if (!startingCity || !cityStats || !budget) {
    // Added check for budget object
    return (
      <div className="tab-content-container local-area-tab ui-panel">
        <h2 className="tab-title">Local Area Information</h2>
        <p>
          No local area data available. Campaign may not have fully started or
          essential data (like budget) is missing.
        </p>
        {/* For debugging: <pre>{JSON.stringify(campaignData, null, 2)}</pre> */}
      </div>
    );
  }

  return (
    <div className="tab-content-container local-area-tab ui-panel">
      <h2 className="tab-title">
        {cityName || "Your Starting Area"} - Overview
      </h2>

      <div className="local-info-grid">
        {/* Card 1: City Profile */}
        <div className="info-card city-profile-card">
          <h3>City Profile</h3>
          <p>
            <strong>Region:</strong> {regionName || "N/A"}
          </p>
          <p>
            <strong>Country:</strong> {countryName || "N/A"}
          </p>
          <p>
            <strong>Population:</strong> {population?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Type:</strong> {cityType || "N/A"}
          </p>
          <p>
            <strong>Wealth Level:</strong> {wealthLevel || "N/A"}
          </p>
        </div>

        {/* Card 2: Player Standing */}
        <div className="info-card player-standing-card">
          <h3>Your Standing</h3>
          <p>
            <strong>Current Role:</strong>{" "}
            {currentOffice || "Citizen Politician"}
          </p>
          <p>
            <strong>Local Approval:</strong>{" "}
            {playerApproval != null ? `${playerApproval}%` : "N/A"}
          </p>
        </div>

        {/* Card 3: City Vitals & Issues */}
        <div className="info-card city-vitals-card">
          <h3>City Vitals</h3>
          <p>
            <strong>Economic Outlook:</strong> {economicOutlook || "N/A"}
          </p>
          <p>
            <strong>Unemployment Rate:</strong>{" "}
            {unemploymentRate != null
              ? `${parseFloat(unemploymentRate).toFixed(1)}%`
              : "N/A"}
          </p>
          <p>
            <strong>Overall Citizen Mood:</strong> {overallCitizenMood || "N/A"}
          </p>
          <p>
            <strong>GDP per Capita:</strong> $
            {gdpPerCapita?.toLocaleString() || "N/A"}
          </p>
          <p>
            <strong>Dominant Industries:</strong>{" "}
            {dominantIndustries?.join(", ") || "N/A"}
          </p>
          <h4>Key Local Issues:</h4>
          {mainIssues.length > 0 ? (
            <ul className="issues-list">
              {mainIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p>No specific issues highlighted.</p>
          )}
        </div>

        {/* Card 4: Public Services & Infrastructure */}
        <div className="info-card public-services-card">
          <h3>Public Services & Infrastructure</h3>
          <p>
            <strong>Public Safety:</strong> {publicSafetyRating || "N/A"}
          </p>
          <p>
            <strong>Education Quality:</strong> {educationQuality || "N/A"}
          </p>
          <p>
            <strong>Infrastructure State:</strong>{" "}
            {infrastructureState || "N/A"}
          </p>
          <p>
            <strong>Healthcare Quality:</strong> {healthcareQuality || "N/A"}
          </p>
          <p>
            <strong>Environment Rating:</strong> {environmentRating || "N/A"}
          </p>
          <p>
            <strong>Culture & Arts Rating:</strong> {cultureArtsRating || "N/A"}
          </p>
        </div>

        {/* Card 5: City Finances (UPDATED to use totalAnnualIncome/Expenses) */}
        {budget && (
          <div className="info-card city-finances-card">
            <h3>City Finances (Annual)</h3>
            <p>
              <strong>Income:</strong> $
              {budget.totalAnnualIncome?.toLocaleString() ||
                budget.annualIncome?.toLocaleString() ||
                "N/A"}
            </p>
            <p>
              <strong>Expenses:</strong> $
              {budget.totalAnnualExpenses?.toLocaleString() ||
                budget.annualExpenses?.toLocaleString() ||
                "N/A"}
            </p>
            <p>
              <strong>Balance:</strong>
              <span
                style={{
                  color:
                    budget.balance >= 0
                      ? "var(--success-text, green)"
                      : "var(--error-text, red)",
                }}
              >
                ${budget.balance?.toLocaleString() || "N/A"}
              </span>
            </p>
            <p>
              <strong>Total Debt/Surplus:</strong>
              <span
                style={{
                  color:
                    budget.accumulatedDebt > 0
                      ? "var(--error-text, red)"
                      : budget.accumulatedDebt < 0
                      ? "var(--success-text, green)"
                      : "var(--neutral-text, inherit)",
                }}
              >
                ${Math.abs(budget.accumulatedDebt)?.toLocaleString() || "N/A"}
                {budget.accumulatedDebt > 0
                  ? " (Debt)"
                  : budget.accumulatedDebt < 0
                  ? " (Surplus)"
                  : " (Balanced)"}
              </span>
            </p>
            {taxRates && (
              <div className="tax-rates-section">
                <h4>Current Tax Rates:</h4>
                <p>Property: {formatPercentage(taxRates.property * 100, 2)}</p>
                <p>Sales: {formatPercentage(taxRates.sales * 100, 1)}</p>
                <p>Business: {formatPercentage(taxRates.business * 100, 1)}</p>
              </div>
            )}
          </div>
        )}

        {/* Card 6: Political Climate (Pie Chart) */}
        {politicalLandscape && politicalLandscape.length > 0 && (
          <div className="info-card landscape-card">
            <h3>Local Political Climate</h3>
            <div className="pie-chart-wrapper-local-tab">
              <RegionPieChart
                politicalLandscape={politicalLandscape}
                themeColors={currentTheme?.colors}
              />
            </div>
          </div>
        )}

        {/* Card 7: Demographics */}
        {demographics && (
          <div className="info-card demographics-card">
            <h3>Demographics</h3>
            {ageDistribution && (
              <>
                <h4>Age Distribution:</h4>
                <p>
                  Youth (0-17): {formatPercentage(ageDistribution.youth, 0)}
                </p>
                <p>
                  Young Adult (18-34):{" "}
                  {formatPercentage(ageDistribution.youngAdult, 0)}
                </p>
                <p>
                  Adult (35-59): {formatPercentage(ageDistribution.adult, 0)}
                </p>
                <p>
                  Senior (60+): {formatPercentage(ageDistribution.senior, 0)}
                </p>
              </>
            )}
            {educationLevels && (
              <>
                <h4>Education Levels (Adults):</h4>
                <p>
                  High School or Less:{" "}
                  {formatPercentage(educationLevels.highSchoolOrLess, 0)}
                </p>
                <p>
                  Some College:{" "}
                  {formatPercentage(educationLevels.someCollege, 0)}
                </p>
                <p>
                  Bachelors or Higher:{" "}
                  {formatPercentage(educationLevels.bachelorsOrHigher, 0)}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Local Actions Section */}
      <section className="local-actions-panel ui-panel">
        <h3 className="section-title">Local Actions</h3>
        <div className="action-button-group">
          <button
            className="action-button"
            disabled
            title="Feature coming soon!"
          >
            Hold Town Hall
          </button>
          <button
            className="action-button"
            disabled
            title="Feature coming soon!"
          >
            Address Local Issue
          </button>
          <button
            className="action-button"
            disabled
            title="Feature coming soon!"
          >
            Propose City Ordinance
          </button>
          <button
            className="action-button"
            disabled
            title="Feature coming soon!"
          >
            Meet with Community Leaders
          </button>
        </div>
      </section>
    </div>
  );
}

export default LocalAreaTab;
