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

const NationalOverviewTab = ({ campaignData, activeSubTab = "summary", governmentSubTab = "offices" }) => {
  const { openViewPoliticianModal, getNationalGovernmentOffices, getCoalitionsForEntity, openSeatHistoryModal } = useGameStore((state) => state.actions);
  const politiciansSoA = useGameStore((state) => state.activeCampaign?.politicians);
  const governmentOfficesRaw = useGameStore((state) => state.activeCampaign?.governmentOffices);
  const governmentDepartments = useGameStore((state) => state.activeCampaign?.governmentDepartments);
  
  // Get coalition data for the country
  const coalitionData = getCoalitionsForEntity('national', campaignData.countryId);
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

  const handlePoliticianClick = useCallback(
    (politician) => {
      if (politician) openViewPoliticianModal(politician);
    },
    [openViewPoliticianModal]
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
            <h4>National Government Structure</h4>

            {governmentSubTab === "offices" && (
              <>
                {/* Executive Branch Section */}
            {headOfState && (
              <div className="government-branch-section executive-branch">
                <div className="branch-header">
                  <h5>Executive Branch</h5>
                  <span className="branch-subtitle">National Leadership</span>
                </div>
                <div className="executive-officials-grid">
                  <div className="mayor-card featured-official">
                    <div className="official-role-badge">
                      {headOfState.level?.includes("president") ? "President" : "Head of State"}
                    </div>
                    <div className="official-info">
                      <div className="official-name-row">
                        <h6 className="official-name" 
                            onClick={() => handlePoliticianClick(getUpdatedPolitician(headOfState.holder))}>
                          {getUpdatedPolitician(headOfState.holder)?.firstName} {getUpdatedPolitician(headOfState.holder)?.lastName}
                        </h6>
                        <button 
                          className="seat-history-button"
                          onClick={() => openSeatHistoryModal(headOfState)}
                          title="View seat history"
                        >
                          📅
                        </button>
                      </div>
                      <p className="official-party">
                        {getUpdatedPolitician(headOfState.holder)?.partyName || "Independent"}
                      </p>
                      <div className="official-stats">
                        <div className="stat-mini">
                          <span className="stat-label">Approval</span>
                          <span className="stat-value">
                            {getUpdatedPolitician(headOfState.holder)?.approvalRating || "N/A"}%
                          </span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-label">Term</span>
                          <span className="stat-value">
                            {headOfState.termLength || "N/A"} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legislative Branch Section */}
            {(lowerHouse.length > 0 || upperHouse.length > 0) && (
              <div className="government-branch-section legislative-branch">
                <div className="branch-header">
                  <h5>Legislative Branch</h5>
                  <span className="branch-subtitle">
                    National Legislature • {lowerHouse.length + upperHouse.length} Members
                  </span>
                </div>

                {/* Lower House Section */}
                {lowerHouse.length > 0 && (
                  <div className="legislature-chamber-section">
                    <div className="chamber-header">
                      <h6>{countryData.nationalHrName || "Lower House"}</h6>
                      <span className="chamber-subtitle">{lowerHouse.length} Members</span>
                    </div>
                    
                    {/* Chamber Composition Overview */}
                    {lowerHouseComposition.length > 0 && (
                      <div className="council-overview">
                        <div className="council-composition-stats">
                          <div className="composition-chart">
                            <CouncilCompositionPieChart
                              councilCompositionData={lowerHouseComposition}
                            />
                          </div>
                          <div className="composition-legend">
                            <h6>Party Distribution</h6>
                            {lowerHouseComposition.map((party) => (
                              <div key={party.id || party.name} className="legend-item">
                                <span className="party-color-dot" style={{ backgroundColor: party.color }}></span>
                                <span className="party-name">{party.name}</span>
                                <span className="party-count">{party.popularity} seats</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Members Section */}
                    <div className="council-members-section">
                      <div className="section-header">
                        <h6>Lower House Members</h6>
                      </div>
                      
                      <div className="council-members-grid">
                        {lowerHouse.length > 0 ? (
                          lowerHouse.map((office) => {
                            const politician = getUpdatedPolitician(office.holder);
                            
                            return (
                              <div key={office.officeId} className="council-member-card">
                                <div className="member-header">
                                  <span className="seat-number">
                                    {formatOfficeTitleForDisplay(office)}
                                  </span>
                                </div>
                                <div className="member-info">
                                  <div className="member-name-row">
                                    <p className="member-name"
                                       onClick={() => handlePoliticianClick(politician)}>
                                      {politician?.firstName} {politician?.lastName}
                                    </p>
                                    <button 
                                      className="seat-history-button small"
                                      onClick={() => openSeatHistoryModal(office)}
                                      title="View seat history"
                                    >
                                      📅
                                    </button>
                                  </div>
                                  <p className="member-party" style={{ color: politician?.partyColor || "#888" }}>
                                    {politician?.partyName || "Independent"}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="no-officials-message">No lower house members currently in office</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upper House Section */}
                {upperHouse.length > 0 && (
                  <div className="legislature-chamber-section">
                    <div className="chamber-header">
                      <h6>{countryData.nationalSenateName || "Upper House"}</h6>
                      <span className="chamber-subtitle">{upperHouse.length} Members</span>
                    </div>
                    
                    {/* Members Section */}
                    <div className="council-members-section">
                      <div className="section-header">
                        <h6>Upper House Members</h6>
                      </div>
                      
                      <div className="council-members-grid">
                        {upperHouse.length > 0 ? (
                          upperHouse.map((office) => {
                            const politician = getUpdatedPolitician(office.holder);
                            
                            return (
                              <div key={office.officeId} className="council-member-card">
                                <div className="member-header">
                                  <span className="seat-number">
                                    {formatOfficeTitleForDisplay(office)}
                                  </span>
                                </div>
                                <div className="member-info">
                                  <div className="member-name-row">
                                    <p className="member-name"
                                       onClick={() => handlePoliticianClick(politician)}>
                                      {politician?.firstName} {politician?.lastName}
                                    </p>
                                    <button 
                                      className="seat-history-button small"
                                      onClick={() => openSeatHistoryModal(office)}
                                      title="View seat history"
                                    >
                                      📅
                                    </button>
                                  </div>
                                  <p className="member-party" style={{ color: politician?.partyColor || "#888" }}>
                                    {politician?.partyName || "Independent"}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="no-officials-message">No upper house members currently in office</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {governmentSubTab === "departments" && (
              <>
                {/* Departments Section */}
            <div className="government-branch-section departments-branch">
              <div className="branch-header">
                <h5>Government Departments</h5>
                <span className="branch-subtitle">National Department Heads • {governmentDepartments?.national?.length || 0} Departments</span>
              </div>
              
              <div className="departments-grid">
                {governmentDepartments?.national?.length > 0 ? (
                  governmentDepartments.national.map((department) => {
                    const departmentHead = getUpdatedPolitician(department.head);
                    return (
                      <div key={department.id} className="department-card">
                        <div className="department-header">
                          <h6 className="department-name">{department.name}</h6>
                          <span className="department-budget">
                            ${(department.budget / 1000000000).toFixed(1)}B budget
                          </span>
                        </div>
                        <div className="department-info">
                          {departmentHead ? (
                            <>
                              <div className="department-head-info">
                                <span className="head-title">{departmentHead.currentOffice?.title || 'Secretary'}</span>
                                <p className="head-name"
                                   onClick={() => handlePoliticianClick(departmentHead)}>
                                  {departmentHead.firstName} {departmentHead.lastName}
                                </p>
                                <p className="head-party" style={{ color: departmentHead.partyColor || "#888" }}>
                                  {departmentHead.partyName || "Independent"}
                                </p>
                              </div>
                              <div className="department-stats">
                                <div className="stat-mini">
                                  <span className="stat-label">Employees</span>
                                  <span className="stat-value">{department.employees?.toLocaleString() || "N/A"}</span>
                                </div>
                                <div className="stat-mini">
                                  <span className="stat-label">Est.</span>
                                  <span className="stat-value">{department.createdYear || "N/A"}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="no-head-message">No department head assigned</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-departments-message">No national departments available</p>
                )}
              </div>
            </div>
              </>
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
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default NationalOverviewTab;
