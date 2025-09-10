// ui-src/src/components/game_tabs/GovernmentTab.jsx
import React, { useState, useMemo } from "react";
import "./TabStyles.css"; // Or your common tab styles
import SubtabDropdown from "../ui/SubtabDropdown";
import CityOverviewTab from "./government_tabs/CityOverviewTab"; // NEW component
import LegislationSubTab from "./government_tabs/LegislationSubTab";
import StateOverviewTab from "./government_tabs/StateOverviewTab";
import NationalOverviewTab from "./government_tabs/NationalOverviewTab";
import useGameStore from "../../store";
// import FederalOverviewTab from './government_tabs/FederalOverviewTab'; // Future

const GovernmentTab = ({ campaignData }) => {
  const [activeGovSubTab, setActiveGovSubTab] = useState("city"); // Default to city
  const [activeSubSection, setActiveSubSection] = useState("summary");
  const [activeGovernmentSubTab, setActiveGovernmentSubTab] = useState("offices"); // For government offices vs departments
  
  // Get government departments for dynamic dropdown options
  const governmentDepartments = useGameStore((state) => state.activeCampaign?.governmentDepartments);
  
  // Legislation-specific states
  const [legislationLevel, setLegislationLevel] = useState("city");
  const [legislationView, setLegislationView] = useState("proposed");

  const mainSubtabs = [
    { id: "city", label: "City / Local" },
    { id: "legislation", label: "Legislation" },
    { id: "state", label: "State / Prefecture" },
    { id: "federal", label: "Federal / National" },
  ];

  const sectionSubtabs = [
    { id: "summary", label: "Summary" },
    { id: "demographics", label: "Demographics" },
    { id: "services", label: "Services" },
    { id: "budget", label: "Budget & Taxes" },
    { id: "government", label: "Government" },
    { id: "laws", label: "Laws" },
    { id: "coalitions", label: "Coalitions" }
  ];

  // Generate government subtabs dynamically based on available departments
  const governmentSubtabs = useMemo(() => {
    const baseTabs = [
      { id: "offices", label: "Government Offices" },
      { id: "departments", label: "Department Heads" }
    ];
    
    // Add department-specific tabs based on current government level
    let departmentsToAdd = [];
    
    if (activeGovSubTab === "city" && governmentDepartments?.city?.length > 0) {
      departmentsToAdd = governmentDepartments.city;
    } else if (activeGovSubTab === "state" && governmentDepartments?.state?.length > 0) {
      departmentsToAdd = governmentDepartments.state;
    } else if (activeGovSubTab === "federal" && governmentDepartments?.national?.length > 0) {
      departmentsToAdd = governmentDepartments.national;
    }
    
    if (departmentsToAdd.length > 0) {
      const departmentTabs = departmentsToAdd.map(dept => ({
        id: dept.id || dept.name.toLowerCase().replace(/\s+/g, '-'),
        label: dept.name.toLowerCase().includes('department') ? dept.name : `${dept.name} Department`
      }));
      return [...baseTabs, ...departmentTabs];
    }
    
    return baseTabs;
  }, [governmentDepartments, activeGovSubTab]);

  const legislationLevelTabs = [
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "national", label: "National" }
  ];

  const legislationViewTabs = [
    { id: "proposed", label: "Proposed & Voting" },
    { id: "active", label: "Active Legislation" },
    { id: "archive", label: "Passed Bills" },
    { id: "failed", label: "Failed Bills" }
  ];

  const renderSubTabContent = () => {
    switch (activeGovSubTab) {
      case "city":
        return <CityOverviewTab campaignData={campaignData} activeSubTab={activeSubSection} governmentSubTab={activeGovernmentSubTab} />;
      case "legislation":
        return <LegislationSubTab 
          campaignData={campaignData} 
          currentLevel={legislationLevel}
          activeTab={legislationView}
        />;
      case "state":
        return <StateOverviewTab campaignData={campaignData} activeSubTab={activeSubSection} governmentSubTab={activeGovernmentSubTab} />;
      case "federal":
        return <NationalOverviewTab campaignData={campaignData} activeSubTab={activeSubSection} governmentSubTab={activeGovernmentSubTab} />;
      default:
        return <CityOverviewTab campaignData={campaignData} activeSubTab={activeSubSection} governmentSubTab={activeGovernmentSubTab} />;
    }
  };

  // Function to get current display name based on active tab
  const getCurrentDisplayName = () => {
    switch (activeGovSubTab) {
      case "city":
        return campaignData?.startingCity?.name || "City";
      case "state":
        const activeState = campaignData?.regions?.find(r => r.id === campaignData?.regionId) ||
                           campaignData?.availableCountries
                             ?.find(c => c.id === campaignData?.countryId)
                             ?.regions?.find(r => r.id === campaignData?.regionId);
        return activeState?.name || "State";
      case "federal":
        const activeCountry = campaignData?.country || 
                             campaignData?.availableCountries?.find(c => c.id === campaignData?.countryId);
        return activeCountry?.name || "Country";
      case "legislation":
        return "Legislation";
      default:
        return "";
    }
  };

  const displayName = getCurrentDisplayName();

  return (
    <div className="tab-content-container government-tab-content">
      <h2 className="tab-title">Government Overview: {displayName}</h2>
      <div className="dropdown-container">
        <SubtabDropdown 
          tabs={mainSubtabs}
          activeTab={activeGovSubTab}
          onTabChange={setActiveGovSubTab}
          label="Select Government View"
        />
        {activeGovSubTab !== "legislation" && (
          <SubtabDropdown 
            tabs={sectionSubtabs}
            activeTab={activeSubSection}
            onTabChange={setActiveSubSection}
            label="Select Section"
          />
        )}
        {activeGovSubTab !== "legislation" && activeSubSection === "government" && (
          <SubtabDropdown 
            tabs={governmentSubtabs}
            activeTab={activeGovernmentSubTab}
            onTabChange={setActiveGovernmentSubTab}
            label="Select Government Type"
          />
        )}
        {activeGovSubTab === "legislation" && (
          <>
            <SubtabDropdown 
              tabs={legislationLevelTabs}
              activeTab={legislationLevel}
              onTabChange={setLegislationLevel}
              label="Select Level"
            />
            <SubtabDropdown 
              tabs={legislationViewTabs}
              activeTab={legislationView}
              onTabChange={setLegislationView}
              label="Select View"
            />
          </>
        )}
      </div>
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default GovernmentTab;
