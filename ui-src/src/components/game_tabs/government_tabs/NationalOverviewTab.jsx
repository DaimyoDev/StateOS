import React, { useState, useMemo, useCallback } from "react";
import useGameStore from "../../../store";
import PoliticianCard from "../../PoliticianCard";
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css"; // Reusing styles for consistency

// Helper functions can be shared from another util file
const formatPercentage = (value, precision = 1) =>
  value != null ? `${value.toFixed(precision)}%` : "N/A";
const formatBudgetKey = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

const NationalOverviewTab = ({ campaignData }) => {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const { openViewPoliticianModal } = useGameStore((state) => state.actions);

  const countryData = useMemo(() => {
    return campaignData.availableCountries.find(
      (c) => c.id === campaignData.countryId
    );
  }, [campaignData]);

  const nationalOffices = useMemo(() => {
    return campaignData.governmentOffices.filter((o) =>
      o.level.startsWith("national_")
    );
  }, [campaignData.governmentOffices]);

  const headOfState = useMemo(
    () => nationalOffices.find((o) => o.level.includes("head_of_state")),
    [nationalOffices]
  );
  const lowerHouse = useMemo(
    () => nationalOffices.filter((o) => o.level.includes("lower_house")),
    [nationalOffices]
  );

  const lowerHouseComposition = useMemo(() => {
    const partyData = {};
    lowerHouse.forEach((office) => {
      const partyName = office.holder?.partyName || "Independent";
      if (!partyData[partyName]) {
        partyData[partyName] = {
          count: 0,
          color: office.holder?.partyColor || "#CCCCCC",
        };
      }
      partyData[partyName].count++;
    });
    return Object.entries(partyData).map(([name, data]) => ({
      name,
      popularity: data.count,
      color: data.color,
    }));
  }, [lowerHouse]);

  const formatOfficeTitleForDisplay = useCallback(
    (office) => {
      if (!office || !office.officeName) return "Office";
      // For national level, the name is often straightforward.
      // This can be expanded if national offices have more complex names.
      if (office.level.includes("head_of_state")) {
        return office.officeName.replace(` of ${countryData.name}`, "");
      }
      // Extracts "District 1" from "House of Representatives, District 1"
      const districtMatch = office.officeName.match(/, (District \d+)/);
      if (districtMatch) {
        return `${countryData.nationalHrName || "Lower House"}, ${
          districtMatch[1]
        }`;
      }
      return office.officeName;
    },
    [countryData]
  );

  if (!countryData) return <p>Loading national data...</p>;

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "summary":
        return (
          <section className="city-section">
            <h4>National Vitals</h4>
            <div className="city-stats-grid three-col">
              <div className="stat-item">
                <strong>Population:</strong>{" "}
                <span>{countryData.population?.toLocaleString() || "N/A"}</span>
              </div>
              <div className="stat-item">
                <strong>GDP per Capita:</strong>{" "}
                <span>
                  ${countryData.gdpPerCapita?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="stat-item">
                <strong>Political System:</strong>{" "}
                <span>{countryData.politicalSystem || "N/A"}</span>
              </div>
              <div className="stat-item full-width">
                <strong>Key National Issues:</strong>{" "}
                <span>
                  {countryData.stats?.mainIssues?.join(", ") || "N/A"}
                </span>
              </div>
            </div>
          </section>
        );
      case "demographics":
        return (
          <section className="city-section">
            <h4>National Demographics</h4>
            <div className="city-stats-grid two-col">
              <div className="stat-item">
                <strong>Ethnicities:</strong>
                <ul>
                  {Object.entries(
                    countryData.demographics?.ethnicities || {}
                  ).map(([key, val]) => (
                    <li key={key}>
                      {key}: {formatPercentage(val, 1)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="stat-item">
                <strong>Age Distribution:</strong>
                <ul>
                  {Object.entries(
                    countryData.demographics?.ageDistribution || {}
                  ).map(([key, val]) => (
                    <li key={key}>
                      {formatBudgetKey(key)}: {formatPercentage(val, 1)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      case "government":
        return (
          <section className="city-officials-section city-section">
            <h4>National Government</h4>
            {headOfState && (
              <div className="chamber-section">
                <h5>Head of State / Government</h5>
                <div className="officials-cards-grid">
                  <PoliticianCard
                    politician={headOfState.holder}
                    office={headOfState}
                    onClick={openViewPoliticianModal}
                    formatOfficeTitle={formatOfficeTitleForDisplay}
                  />
                </div>
              </div>
            )}
            {lowerHouse.length > 0 && (
              <div className="chamber-section">
                <h5>
                  {countryData.nationalHrName || "Lower House"} (
                  {lowerHouse.length} Seats)
                </h5>
                <div className="council-pie-chart-container">
                  <CouncilCompositionPieChart
                    councilCompositionData={lowerHouseComposition}
                  />
                </div>
                <div className="officials-cards-grid">
                  {lowerHouse.slice(0, 18).map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      politician={office.holder}
                      office={office}
                      onClick={openViewPoliticianModal}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                    />
                  ))}
                  {lowerHouse.length > 18 && (
                    <p>...and {lowerHouse.length - 18} more members.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      default:
        return <p>Select a section.</p>;
    }
  };

  return (
    <div className="city-overview-tab ui-panel-body">
      <h2 className="city-main-title">
        {countryData.flag} {countryData.name} - National Overview
      </h2>
      <div className="sub-tab-navigation">
        <button
          onClick={() => setActiveSubTab("summary")}
          className={activeSubTab === "summary" ? "active" : ""}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveSubTab("demographics")}
          className={activeSubTab === "demographics" ? "active" : ""}
        >
          Demographics
        </button>
        <button
          onClick={() => setActiveSubTab("government")}
          className={activeSubTab === "government" ? "active" : ""}
        >
          Government
        </button>
      </div>
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default NationalOverviewTab;
