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
const formatCurrency = (value) => value != null ? `$${value.toLocaleString()}` : "N/A";

const NationalOverviewTab = ({ campaignData }) => {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const { openViewPoliticianModal, getNationalGovernmentOffices, getCoalitionsForEntity } = useGameStore((state) => state.actions);
  const politiciansSoA = useGameStore((state) => state.activeCampaign?.politicians);
  const governmentOfficesRaw = useGameStore((state) => state.activeCampaign?.governmentOffices);
  
  // Get coalition data for the country
  const coalitionData = getCoalitionsForEntity('country', campaignData.countryId);
  const nationalGovernmentOffices = useMemo(() => {
    return getNationalGovernmentOffices();
  }, [getNationalGovernmentOffices, governmentOfficesRaw]);

  const getUpdatedPolitician = useCallback(
    (politicianRef) => {
      if (!politicianRef || !politiciansSoA) return null;
      
      // Handle case where politicianRef is just an ID string
      const politicianId = typeof politicianRef === 'string' ? politicianRef : politicianRef.id;
      
      if (!politicianId) return politicianRef; // Return original if no ID available
      
      const base = politiciansSoA.base.get(politicianId);
      const state = politiciansSoA.state.get(politicianId);
      const finances = politiciansSoA.finances.get(politicianId);
      const attributes = politiciansSoA.attributes.get(politicianId);
      const background = politiciansSoA.background.get(politicianId);
      
      // If politician not found in SoA store, return original reference
      if (!base) return politicianRef;
      
      // Merge SoA data with any existing reference data (like partyName, role from government offices)
      return {
        ...base,
        ...(state || {}),
        ...(finances || {}),
        ...(attributes || {}),
        ...(background || {}),
        // Preserve any existing data from the government office reference
        ...(typeof politicianRef === 'object' ? {
          partyName: politicianRef.partyName || base.partyName,
          partyColor: politicianRef.partyColor || base.partyColor,
          role: politicianRef.role,
        } : {}),
      };
    },
    [politiciansSoA]
  );

  const countryData = useMemo(() => {
    // First try to get the live country data (updated by budget calculations)
    if (campaignData.country) {
      return campaignData.country;
    }
    
    // Fallback to static data from availableCountries if live data not available
    return campaignData.availableCountries.find(
      (c) => c.id === campaignData.countryId
    );
  }, [campaignData]);

  const headOfState = useMemo(() => {
    if (!nationalGovernmentOffices?.executive) return null;
    return nationalGovernmentOffices.executive.find((o) => 
      o.level?.includes("head_of_state") || 
      o.level === "national_head_of_state_and_government"
    );
  }, [nationalGovernmentOffices]);

  const lowerHouse = useMemo(() => {
    if (!nationalGovernmentOffices?.legislative?.lowerHouse) return [];
    return nationalGovernmentOffices.legislative.lowerHouse;
  }, [nationalGovernmentOffices]);

  const upperHouse = useMemo(() => {
    if (!nationalGovernmentOffices?.legislative?.upperHouse) return [];
    return nationalGovernmentOffices.legislative.upperHouse;
  }, [nationalGovernmentOffices]);

  const lowerHouseComposition = useMemo(() => {
    const partyData = {};
    lowerHouse.forEach((office) => {
      const updatedHolder = getUpdatedPolitician(office.holder);
      const partyName = updatedHolder?.partyName || "Independent";
      if (!partyData[partyName]) {
        partyData[partyName] = {
          count: 0,
          color: updatedHolder?.partyColor || "#CCCCCC",
        };
      }
      partyData[partyName].count++;
    });
    return Object.entries(partyData).map(([name, data]) => ({
      name,
      popularity: data.count,
      color: data.color,
    }));
  }, [lowerHouse, getUpdatedPolitician]);

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
            case "budget":
        const budget = countryData.stats?.budget;
        return (
          <section className="city-section">
            <h4>National Budget</h4>
            {budget ? (
              <>
                <div className="city-stats-grid two-col budget-summary-grid">
                  <div className="stat-item">
                    <strong>Total Income:</strong> {formatCurrency(budget.totalAnnualIncome)}
                  </div>
                  <div className="stat-item">
                    <strong>Total Expenses:</strong> {formatCurrency(budget.totalAnnualExpenses)}
                  </div>
                  <div className="stat-item">
                    <strong>Balance:</strong>
                    <span className={budget.balance >= 0 ? "text-success" : "text-error"}>
                      {formatCurrency(budget.balance)}
                    </span>
                  </div>
                </div>
                <div className="budget-details-container">
                  <div className="budget-column income-sources">
                    <h5>Income Sources:</h5>
                    <ul className="budget-breakdown-list">
                      {Object.entries(budget.incomeSources || {}).map(([key, value]) => (
                        <li key={key}>
                          <span>{formatBudgetKey(key)}:</span>
                          <span>{formatCurrency(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="budget-column expense-allocations">
                    <h5>Expense Allocations:</h5>
                    <ul className="budget-breakdown-list">
                      {Object.entries(budget.expenseAllocations || {}).map(([key, value]) => (
                        <li key={key}>
                          <span>{formatBudgetKey(key)}:</span>
                          <span>{formatCurrency(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p>No budget data available for the nation.</p>
            )}
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
                    politician={getUpdatedPolitician(headOfState.holder)}
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
                  {lowerHouse.map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      politician={getUpdatedPolitician(office.holder)}
                      office={office}
                      onClick={openViewPoliticianModal}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                    />
                  ))}
                </div>
              </div>
            )}
            {upperHouse.length > 0 && (
              <div className="chamber-section">
                <h5>
                  {countryData.nationalSenateName || "Upper House"} (
                  {upperHouse.length} Seats)
                </h5>
                <div className="officials-cards-grid">
                  {upperHouse.map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      politician={getUpdatedPolitician(office.holder)}
                      office={office}
                      onClick={openViewPoliticianModal}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      case "coalitions":
        return (
          <section className="city-section">
            <h4>National Political Coalitions</h4>
            {coalitionData && coalitionData.base ? (
              <>
                <p className="section-description">
                  Major voting blocs and demographic coalitions across the nation
                </p>
                <div className="coalitions-grid">
                  {Array.from(coalitionData.base).map(([coalitionId, coalition]) => {
                    const demographics = coalitionData.demographics?.get(coalitionId);
                    const ideology = coalitionData.ideology?.get(coalitionId);
                    const state = coalitionData.state?.get(coalitionId);
                    
                    return (
                      <div key={coalitionId} className="coalition-card">
                        <div className="coalition-header">
                          <h5>{coalition.name}</h5>
                          <span className="coalition-size">
                            {formatPercentage(coalition.size * 100, 1)} of electorate
                          </span>
                        </div>
                        <div className="coalition-details">
                          <p><strong>Ideology:</strong> <span>{ideology || 'N/A'}</span></p>
                          {demographics && (
                            <>
                              <p><strong>Location:</strong> <span>{demographics.location}</span></p>
                              <p><strong>Age Group:</strong> <span>{demographics.age}</span></p>
                              <p><strong>Education:</strong> <span>{demographics.education}</span></p>
                              <p><strong>Occupation:</strong> <span>{demographics.occupation}</span></p>
                            </>
                          )}
                          {state && (
                            <p><strong>Current Mood:</strong> 
                              <span className={state.currentMood >= 0 ? 'text-success' : 'text-error'}>
                                {state.currentMood >= 0 ? 'Positive' : 'Negative'}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p>No coalition data available for the nation.</p>
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
        <button
          onClick={() => setActiveSubTab("budget")}
          className={activeSubTab === "budget" ? "active" : ""}
        >
          Budget
        </button>
        <button
          onClick={() => setActiveSubTab("coalitions")}
          className={activeSubTab === "coalitions" ? "active" : ""}
        >
          Coalitions
        </button>
      </div>
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default NationalOverviewTab;
