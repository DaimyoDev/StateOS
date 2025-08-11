// ui-src/src/components/game_tabs/GovernmentTab.jsx
import React, { useState } from "react";
import "./TabStyles.css"; // Or your common tab styles
import CityOverviewTab from "./government_tabs/CityOverviewTab"; // NEW component
import LegislationSubTab from "./government_tabs/LegislationSubTab";
import StateOverviewTab from "./government_tabs/StateOverviewTab";
import NationalOverviewTab from "./government_tabs/NationalOverviewTab";
// import FederalOverviewTab from './government_tabs/FederalOverviewTab'; // Future

const GovernmentTab = ({ campaignData }) => {
  const [activeGovSubTab, setActiveGovSubTab] = useState("city"); // Default to city

  const renderSubTabContent = () => {
    switch (activeGovSubTab) {
      case "city":
        return <CityOverviewTab campaignData={campaignData} />;
      case "legislation":
        return <LegislationSubTab campaignData={campaignData} />;
      case "state":
        return <StateOverviewTab campaignData={campaignData} />;
      case "federal":
        return <NationalOverviewTab campaignData={campaignData} />;
      default:
        return (
          <CityOverviewTab startingCityData={campaignData?.startingCity} />
        );
    }
  };

  return (
    <div className="government-tab-content ui-panel">
      <h2 className="tab-title">Government Overview</h2>
      <div className="sub-tab-navigation">
        <button
          onClick={() => setActiveGovSubTab("city")}
          className={`sub-tab-button ${
            activeGovSubTab === "city" ? "active" : ""
          }`}
        >
          City / Local
        </button>
        <button // <<<< NEW SUB-TAB BUTTON
          onClick={() => setActiveGovSubTab("legislation")}
          className={`sub-tab-button ${
            activeGovSubTab === "legislation" ? "active" : ""
          }`}
        >
          Legislation
        </button>
        <button
          onClick={() => setActiveGovSubTab("state")}
          className={`sub-tab-button ${
            activeGovSubTab === "state" ? "active" : ""
          }`}
        >
          State / Prefecture
        </button>
        <button
          onClick={() => setActiveGovSubTab("federal")}
          className={`sub-tab-button ${
            activeGovSubTab === "federal" ? "active" : ""
          }`}
        >
          Federal / National
        </button>
      </div>
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default GovernmentTab;
