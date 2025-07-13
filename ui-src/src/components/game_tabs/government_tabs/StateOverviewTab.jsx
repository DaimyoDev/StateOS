// ui-src/src/components/game_tabs/government_tabs/StateOverviewTab.jsx
import React from "react";
import "./GovernmentSubTabStyles.css"; // Or a dedicated style for this tab
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import { COUNTRIES_DATA } from "../../../data/countriesData";

const StateOverviewTab = ({ campaignData }) => {
  // Assuming campaignData contains the active state/prefecture data under a specific key
  // You'll need to adjust this path based on your Redux store structure or prop drilling
  const playerCountryId = campaignData.countryId;

  let activeState = null;

  if (playerCountryId) {
    const country = COUNTRIES_DATA.find((c) => c.id === playerCountryId);
    if (country) {
      // First, check in regions (for USA, Japan, Germany)
      activeState = country.regions?.find(
        (r) => r.id === campaignData.regionId
      );
      // If not found in regions, check in provinces (for Philippines)
      if (!activeState && country.provinces) {
        activeState = country.provinces.find(
          (p) => p.id === campaignData.regionId
        );
      }
    }
  }

  console.log(activeState);

  if (!activeState) {
    return (
      <div className="state-overview-tab">
        <p>
          No state or prefecture data available. Please start a campaign to view
          this information.
        </p>
      </div>
    );
  }

  // Find the governor/premier from currentGovernmentOffices
  const governorOffice = activeState.currentGovernmentOffices?.find(
    (office) =>
      office.officeNameTemplateId &&
      office.officeNameTemplateId.includes("governor")
  );

  // Find a legislative body if it exists
  const legislativeBody = activeState.currentGovernmentOffices?.find(
    (office) => office.members && office.members.length > 0
  );

  return (
    <div className="state-overview-tab ui-panel-body">
      <h3 className="sub-tab-title">{activeState.name} Overview</h3>

      {/* Basic State Info */}
      <div className="overview-section">
        <h4>General Information</h4>
        <p>
          <strong>Type:</strong>{" "}
          {activeState.type === "state" ? "State" : "Prefecture"}
        </p>
        <p>
          <strong>Population:</strong>{" "}
          {activeState.population?.toLocaleString()}
        </p>
        <p>
          <strong>Capital:</strong> {activeState.capital}
        </p>
      </div>

      {/* Current Stats */}
      <div className="overview-section">
        <h4>Current Economic & Social Conditions</h4>
        {activeState.stats ? (
          <>
            <p>
              <strong>Economy:</strong> {activeState.stats.economicOutlook}
            </p>
            <p>
              <strong>Unemployment Rate:</strong>{" "}
              {activeState.stats.unemploymentRate}%
            </p>
            <p>
              <strong>Approval Rating:</strong>{" "}
              {activeState.stats.overallCitizenMood}
            </p>
            {/* Add more stats as needed */}
          </>
        ) : (
          <p>Loading current statistics...</p>
        )}
      </div>

      {/* Executive Office */}
      <div className="overview-section">
        <h4>Executive Branch</h4>
        {governorOffice && governorOffice.holder ? (
          <>
            <p>
              <strong>{governorOffice.holder.role}:</strong>{" "}
              {governorOffice.holder.name} ({governorOffice.holder.partyName})
            </p>
            <p>
              <strong>Term Ends:</strong> {governorOffice.holder.termEnds?.year}
            </p>
            {/* Add more executive details */}
          </>
        ) : (
          <p>No executive leader information available.</p>
        )}
      </div>

      {/* Legislative Body */}
      {legislativeBody && (
        <div className="overview-section">
          <h4>{legislativeBody.officeName}</h4>
          <p>
            <strong>Total Members:</strong> {legislativeBody.members.length}
          </p>
          {legislativeBody.currentCompositionByParty && (
            <>
              <p>
                <strong>Current Composition:</strong>
              </p>
              <div className="chart-container">
                <CouncilCompositionPieChart
                  councilComposition={Object.entries(
                    legislativeBody.currentCompositionByParty
                  ).map(([partyId, count]) => ({
                    partyId,
                    members: count,
                    partyName:
                      campaignData?.allPartiesInGame?.find(
                        (p) => p.id === partyId
                      )?.name || "Unknown",
                    partyColor:
                      campaignData?.allPartiesInGame?.find(
                        (p) => p.id === partyId
                      )?.color || "#CCCCCC",
                  }))}
                />
              </div>
            </>
          )}
          {/* You might want to list members here or provide a link to a separate view */}
        </div>
      )}

      {/* State-Specific Laws */}
      <div className="overview-section">
        <h4>State-Level Legislation</h4>
        {activeState.currentLaws && activeState.currentLaws.length > 0 ? (
          <ul>
            {activeState.currentLaws.map((law) => (
              <li key={law.id}>
                <strong>{law.name}</strong>: {law.description} (Status:{" "}
                {law.status})
              </li>
            ))}
          </ul>
        ) : (
          <p>No state-level laws currently in effect.</p>
        )}
      </div>
    </div>
  );
};

export default StateOverviewTab;
