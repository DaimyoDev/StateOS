import React, { useState, useMemo, useCallback } from "react";
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css"; // Using shared styles
import "./CommitteeStyles.css";
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import PoliticianCard from "../../PoliticianCard";
import StateSummaryTab from "../../StateSummaryTab"; // NEW: Import StateSummaryTab
import { BASE_COUNTRIES_DATA } from "../../../data/countriesData";
import { COMMITTEE_SYSTEMS, COMMITTEE_TYPES } from "../../../data/legislativeCommittees";
import useGameStore from "../../../store";

// Helper functions (same as before)
const getRatingDescriptor = (ratingString) => ratingString || "N/A";
const getUnemploymentDescriptor = (rate) => {
  if (rate == null) return "N/A";
  if (rate < 4) return "Very Low";
  if (rate < 6) return "Low";
  if (rate < 8) return "Moderate";
  if (rate < 10) return "High";
  return "Very High";
};
const getEconomicOutlookClass = (outlook) => {
  if (!outlook) return "mood-average";
  const ol = outlook.toLowerCase();
  if (ol.includes("booming") || ol.includes("strong growth"))
    return "mood-excellent";
  if (ol.includes("moderate growth") || ol.includes("slow growth"))
    return "mood-good";
  if (ol.includes("stagnant")) return "mood-average";
  if (ol.includes("recession") || ol.includes("declining")) return "mood-poor";
  return "mood-average";
};
const getMoodClass = (mood) => {
  if (!mood) return "mood-average";
  const m = mood.toLowerCase();
  if (m.includes("prospering") || m.includes("optimistic"))
    return "mood-excellent";
  if (m.includes("content")) return "mood-good";
  if (m.includes("concerned")) return "mood-average";
  if (m.includes("frustrated") || m.includes("very unhappy"))
    return "mood-poor";
  return "mood-average";
};
const formatPercentage = (value, precision = 1) => {
  if (value == null || isNaN(value)) return "N/A";
  return `${value.toFixed(precision)}%`;
};
const formatBudgetKey = (key) => {
  if (typeof key !== "string") return "Invalid Key";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};
const formatLawValue = (key, value) => {
  if (value === null || value === undefined) return "N/A";

  // MODIFIED: This check now works for both "minimumWage" and "stateMinimumWage"
  if (key.toLowerCase().includes("minimumwage")) {
    return `$${Number(value).toFixed(2)} / hour`;
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([dayType, hours]) =>
          `${formatBudgetKey(dayType)}: ${hours.start} - ${hours.end}`
      )
      .join(", ");
  }
  if (typeof value === "string") {
    return value.replace(/_/g, " ").replace(/^./, (str) => str.toUpperCase());
  }
  return String(value);
};

// --- CORRECTED: Helper function to find members of a given chamber ---
const getLegislativeChamberMembers = (
  allGovernmentOffices,
  activeState,
  chamberIdentifier // e.g., 'local_state_lower_house'
) => {
  if (!activeState || !allGovernmentOffices.length) return [];

  // This function can be simplified now
  return allGovernmentOffices.filter(
    (office) =>
      office.regionId === activeState.id && office.level === chamberIdentifier
  );
};

const StateOverviewTab = ({ campaignData, activeSubTab = "summary", governmentSubTab = "offices" }) => {
  const [governmentFilter, setGovernmentFilter] = useState("all");
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  
  // Subscribe to coalition system changes directly from the store
  const coalitionSystems = useGameStore((state) => state.activeCampaign?.coalitionSystems);

  const { openViewPoliticianModal, getCurrentStateGovernmentOffices, getCoalitionsForEntity, openSeatHistoryModal } = useGameStore((state) => state.actions);
  
  // Subscribe directly to government offices to force re-render when they change
  const governmentOfficesRaw = useGameStore((state) => state.activeCampaign?.governmentOffices);
  const governmentDepartments = useGameStore((state) => state.activeCampaign?.governmentDepartments);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const politiciansSoA = useGameStore((state) => state.activeCampaign?.politicians);

  // Helper to get current department if governmentSubTab matches a department ID
  const currentDepartment = useMemo(() => {
    if (!governmentDepartments?.state) return null;
    return governmentDepartments.state.find(dept => 
      (dept.id || dept.name.toLowerCase().replace(/\s+/g, '-')) === governmentSubTab
    );
  }, [governmentDepartments, governmentSubTab]);

  // Helper function to get updated politician data from SoA store or use existing data
  const getUpdatedPolitician = useCallback((politicianRef) => {
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
  }, [politiciansSoA]);

  const playerCountryId = campaignData.countryId;
  const stateGovernmentOffices = useMemo(() => {
    return getCurrentStateGovernmentOffices();
  }, [getCurrentStateGovernmentOffices, governmentOfficesRaw]);
  
  // Get country data and committee system information
  const countryData = useMemo(() => {
    return campaignData.availableCountries?.find(c => c.id === playerCountryId) || BASE_COUNTRIES_DATA.find(c => c.id === playerCountryId);
  }, [campaignData.availableCountries, playerCountryId]);

  const committeeSystem = useMemo(() => {
    if (!countryData?.politicalSystemId) return null;
    return COMMITTEE_SYSTEMS[countryData.politicalSystemId];
  }, [countryData]);
  
  // Get coalition data for the state
  const coalitionData = getCoalitionsForEntity('state', campaignData.regionId);
  
  // Debug logging
  console.log('[StateOverviewTab] Current region ID:', campaignData.regionId);
  console.log('[StateOverviewTab] Raw government offices structure:', governmentOfficesRaw);
  console.log('[StateOverviewTab] Filtered government offices data:', stateGovernmentOffices);

  const activeState = useMemo(() => {
    // First try to get the live region data from campaign.regions (updated by budget calculations)
    const liveRegion = campaignData.regions?.find((r) => r.id === campaignData.regionId);
    if (liveRegion) {
      return liveRegion;
    }
    
    // Fallback to static data from availableCountries if live data not available
    const countryData = campaignData.availableCountries.find(
      (c) => c.id === playerCountryId
    );
    if (!countryData) return null;

    const dynamicRegions = countryData.regions || countryData.provinces;
    if (!dynamicRegions) return null;

    return dynamicRegions.find((r) => r.id === campaignData.regionId);
  }, [campaignData, playerCountryId]); // Updated dependencies

  const SUBTABS = useMemo(() => [
    { id: "summary", label: "Summary" },
    { id: "demographics", label: "Demographics" },
    { id: "services", label: "Services" },
    { id: "budget", label: "Budget & Taxes" },
    { id: "government", label: "Government" },
    { id: "laws", label: `${activeState?.type || "State"} Laws` },
    { id: "coalitions", label: "Coalitions" }
  ], [activeState?.type]);

  // FIXED: Find executive offices from the new hierarchical structure
  const governorOffice = useMemo(() => {
    if (!activeState || !stateGovernmentOffices?.executive) return null;
    return stateGovernmentOffices.executive.find(
      (o) =>
        o.officeNameTemplateId === "governor" &&
        o.holder
    );
  }, [stateGovernmentOffices, activeState, governmentOfficesRaw]);

  const lieutenantGovernorOffice = useMemo(() => {
    if (!activeState || !stateGovernmentOffices?.executive) return null;
    return stateGovernmentOffices.executive.find(
      (o) =>
        o.officeNameTemplateId === "lieutenant_governor" &&
        o.holder
    );
  }, [stateGovernmentOffices, activeState, governmentOfficesRaw]);

  // Updated to use hierarchical structure
  const upperChamberOffices = useMemo(() => {
    if (!stateGovernmentOffices?.legislative?.upperHouse) return [];
    return stateGovernmentOffices.legislative.upperHouse;
  }, [stateGovernmentOffices, governmentOfficesRaw]);

  const lowerChamberOffices = useMemo(() => {
    if (!stateGovernmentOffices?.legislative?.lowerHouse) return [];
    return stateGovernmentOffices.legislative.lowerHouse;
  }, [stateGovernmentOffices, governmentOfficesRaw]);

  // --- Helper to create party composition data for a chamber ---
  const getCompositionForChamber = useCallback((offices) => {
    const partyData = {};
    offices.forEach((office) => {
      const holder = getUpdatedPolitician(office.holder);
      if (holder) {
        const partyName = holder.partyName || "Independent"; // Standardize to "Independent"
        let partyKey;

        // If the politician's partyName is Independent, use a static key to group them.
        if (partyName === "Independent") {
          partyKey = "independent_group";
        } else {
          // Use the original logic for actual parties
          partyKey = holder.partyId || partyName;
        }

        if (!partyData[partyKey]) {
          partyData[partyKey] = {
            count: 0,
            // Use a consistent color and name for the grouped independents
            color: partyName === "Independent" ? "#CCCCCC" : holder.partyColor,
            id: partyKey,
            name: partyName,
          };
        }
        partyData[partyKey].count++;
      }
    });
    return Object.values(partyData).map((data) => ({
      id: data.id,
      name: data.name,
      popularity: data.count,
      color: data.color,
    }));
  }, [getUpdatedPolitician]);

  // --- Separate compositions for each chamber ---
  const upperChamberComposition = useMemo(
    () => getCompositionForChamber(upperChamberOffices),
    [upperChamberOffices, getCompositionForChamber]
  );
  const lowerChamberComposition = useMemo(
    () => getCompositionForChamber(lowerChamberOffices),
    [lowerChamberOffices, getCompositionForChamber]
  );

  // Generate committee assignments from current legislature members
  const stateCommittees = useMemo(() => {
    if (!committeeSystem) return {};
    
    const allLegislators = [...lowerChamberOffices, ...upperChamberOffices];
    const committees = {};
    
    // Calculate committee sizes (roughly 15-20% of legislature for major committees)
    const legislatureSize = allLegislators.length;
    const majorCommitteeSize = Math.max(3, Math.floor(legislatureSize * 0.18));
    const minorCommitteeSize = Math.max(3, Math.floor(legislatureSize * 0.12));
    
    // Assign members to committees
    Object.entries(COMMITTEE_TYPES.STANDING).forEach(([key, committee], index) => {
      const committeeSize = ['JUDICIARY', 'FINANCE', 'FOREIGN_AFFAIRS'].includes(key) ? 
        majorCommitteeSize : minorCommitteeSize;
      
      // Randomly assign members (in a real system this would be more sophisticated)
      const shuffledLegislators = [...allLegislators].sort(() => Math.random() - 0.5);
      const members = shuffledLegislators.slice(0, committeeSize);
      
      // Select chair (usually from majority party)
      const majorityParty = lowerChamberComposition.length > 0 ? 
        lowerChamberComposition.reduce((a, b) => a.popularity > b.popularity ? a : b) : null;
      
      const majorityMembers = members.filter(m => {
        const politician = getUpdatedPolitician(m.holder);
        return politician?.partyName === majorityParty?.name;
      });
      
      const chair = majorityMembers.length > 0 ? majorityMembers[0] : members[0];
      
      committees[key] = {
        ...committee,
        id: key,
        members: members,
        chair: chair,
        size: members.length
      };
    });

    // Handle Select Committees
    Object.entries(COMMITTEE_TYPES.SELECT).forEach(([key, committee]) => {
      const committeeSize = Math.max(3, Math.floor(legislatureSize * 0.10));
      const shuffledLegislators = [...allLegislators].sort(() => Math.random() - 0.5);
      const members = shuffledLegislators.slice(0, committeeSize);
      
      const chair = members[0];
      
      committees[key] = {
        ...committee,
        id: key,
        members: members,
        chair: chair,
        size: members.length,
        isSelect: true
      };
    });
    
    return committees;
  }, [committeeSystem, lowerChamberOffices, upperChamberOffices, lowerChamberComposition, getUpdatedPolitician]);
  
  const filteredLowerChamberMembers = useMemo(() => {
    if (governmentFilter === "party") {
      // Group by party and sort
      return [...lowerChamberOffices].sort((a, b) => {
        const partyA = getUpdatedPolitician(a.holder)?.partyName || "ZZZ_Independent";
        const partyB = getUpdatedPolitician(b.holder)?.partyName || "ZZZ_Independent";
        
        // Sort by party name first
        if (partyA !== partyB) {
          return partyA.localeCompare(partyB);
        }
        
        // Then by office name/seat within the same party
        return (a.officeName || "").localeCompare(b.officeName || "");
      });
    }
    return lowerChamberOffices;
  }, [lowerChamberOffices, governmentFilter, getUpdatedPolitician]);
  
  const filteredUpperChamberMembers = useMemo(() => {
    if (governmentFilter === "party") {
      // Group by party and sort
      return [...upperChamberOffices].sort((a, b) => {
        const partyA = getUpdatedPolitician(a.holder)?.partyName || "ZZZ_Independent";
        const partyB = getUpdatedPolitician(b.holder)?.partyName || "ZZZ_Independent";
        
        // Sort by party name first
        if (partyA !== partyB) {
          return partyA.localeCompare(partyB);
        }
        
        // Then by office name/seat within the same party
        return (a.officeName || "").localeCompare(b.officeName || "");
      });
    }
    return upperChamberOffices;
  }, [upperChamberOffices, governmentFilter, getUpdatedPolitician]);

  const {
    name: stateName,
    population,
    capital,
    demographics,
    economicProfile,
    stats,
    stateLaws,
    type: regionType,
    legislature: legislatureNames,
  } = activeState || {};

  const {
    mainIssues = [],
    economicOutlook,
    unemploymentRate,
    overallCitizenMood,
    budget,
    crimeRatePer1000,
    povertyRate,
    publicSafetyRating,
    educationQuality,
    infrastructureState,
    healthcareCoverage,
    healthcareQuality,
    healthcareCostPerPerson,
    environmentRating,
    cultureArtsRating,
  } = stats || {};

  const { ageDistribution, educationLevels } = demographics || {};
  const {
    dominantIndustries,
    gdpPerCapita,
    keyIssues: economicKeyIssues,
  } = economicProfile || {};

  const taxRates = budget?.taxRates;
  const incomeSources = budget?.incomeSources;
  const expenseAllocations = budget?.expenseAllocations;

  // --- Build official list from new chamber-specific lists ---
  const allStateOfficials = useMemo(() => {
    const officials = [];
    if (governorOffice)
      officials.push({ ...governorOffice, type: "executive" });
    if (lieutenantGovernorOffice)
      officials.push({ ...lieutenantGovernorOffice, type: "executive" });
    upperChamberOffices.forEach((o) =>
      officials.push({ ...o, type: "legislature_upper" })
    );
    lowerChamberOffices.forEach((o) =>
      officials.push({ ...o, type: "legislature_lower" })
    );
    return officials;
  }, [
    governorOffice,
    lieutenantGovernorOffice,
    upperChamberOffices,
    lowerChamberOffices,
  ]);

  const filteredOfficials = useMemo(() => {
    if (governmentFilter === "all") return allStateOfficials;
    if (governmentFilter === "executive")
      return allStateOfficials.filter((o) => o.type === "executive");
    if (governmentFilter === "legislature")
      return allStateOfficials.filter((o) => o.type.startsWith("legislature"));
    return [];
  }, [allStateOfficials, governmentFilter]);

  const handlePoliticianClick = useCallback(
    (politician) => {
      if (politician) openViewPoliticianModal(politician);
    },
    [openViewPoliticianModal]
  );

  // Render individual department detail view
  const renderDepartmentDetail = (department) => {
    if (!department) return <p>Department not found.</p>;
    
    const departmentHead = getUpdatedPolitician(department.head);
    const budgetInMillions = (department.budget || 0) / 1000000;
    const employeeCount = department.employees || 0;
    
    return (
      <div className="department-detail-container">
        {/* Department Header */}
        <div className="department-detail-header">
          <div className="dept-title-section">
            <h3>{department.name} Department</h3>
            <span className="dept-status">
              {departmentHead ? 'Active Leadership' : 'Vacant Position'}
            </span>
          </div>
          <div className="dept-key-metrics">
            <div className="metric-card">
              <span className="metric-value">${budgetInMillions.toFixed(1)}M</span>
              <span className="metric-label">Annual Budget</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{employeeCount.toLocaleString()}</span>
              <span className="metric-label">Employees</span>
            </div>
          </div>
        </div>

        {/* Current Leadership */}
        <div className="department-leadership-section">
          <h4>Current Leadership</h4>
          {departmentHead ? (
            <div className="current-leader-card">
              <div className="leader-profile">
                <div className="leader-basic-info">
                  <h5 
                    className="leader-name clickable"
                    onClick={() => handlePoliticianClick(departmentHead)}
                  >
                    {departmentHead.firstName} {departmentHead.lastName}
                  </h5>
                  <p className="leader-title">{departmentHead.currentOffice?.title || 'Department Secretary'}</p>
                  <span className="leader-party" style={{ color: departmentHead.partyColor || "var(--secondary-text)" }}>
                    {departmentHead.partyName || "Independent"}
                  </span>
                </div>
                <div className="leader-stats">
                  <div className="stat-item">
                    <span className="stat-label">Approval Rating</span>
                    <span className="stat-value">{departmentHead.approvalRating || "N/A"}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Experience</span>
                    <span className="stat-value">{departmentHead.yearsOfExperience || "N/A"} years</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Appointed</span>
                    <span className="stat-value">{departmentHead.startDate || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="vacant-position-card">
              <p className="vacant-message">No department secretary currently appointed</p>
              <button className="appoint-button">Appoint New Secretary</button>
            </div>
          )}
        </div>

        {/* Department Functions */}
        {department.responsibilities && department.responsibilities.length > 0 && (
          <div className="department-functions-section">
            <h4>Core Functions & Responsibilities</h4>
            <div className="functions-grid">
              {department.responsibilities.map((responsibility, index) => (
                <div key={index} className="function-card">
                  <span className="function-text">{responsibility}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Special sections for state education department */}
        {department.name.toLowerCase().includes('education') && (
          <div className="state-education-section">
            <h4>State Education Oversight</h4>
            {budget?.expenseAllocations?.localEducationFunding && (
              <div className="education-funding-section">
                <h5>Local District Funding</h5>
                <div className="funding-summary">
                  <div className="funding-metric">
                    <span className="metric-value">${(budget.expenseAllocations.localEducationFunding / 1000000).toFixed(1)}M</span>
                    <span className="metric-label">Distributed to Districts</span>
                  </div>
                  <div className="funding-metric">
                    <span className="metric-value">${Math.round(budget.expenseAllocations.localEducationFunding / (activeState?.population * 0.18 || 100000))}</span>
                    <span className="metric-label">Per Student</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Leadership History */}
        <div className="leadership-history-section">
          <h4>Leadership History</h4>
          {department.leadershipHistory && department.leadershipHistory.length > 0 ? (
            <div className="history-timeline">
              {department.leadershipHistory.map((leader, index) => (
                <div key={index} className="history-entry">
                  <div className="history-date">{leader.startDate} - {leader.endDate || 'Present'}</div>
                  <div className="history-leader">
                    <span className="history-name">{leader.name}</span>
                    <span className="history-party">({leader.party || 'Independent'})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">No leadership history available.</p>
          )}
        </div>
      </div>
    );
  };
  const formatOfficeTitleForDisplay = useCallback(
    (office, currentRegionNameForDisplay) => {
      if (!office || !office.officeName) return "Office";

      let processedOfficeName = office.officeName;

      // Replace region-specific placeholders
      if (currentRegionNameForDisplay) {
        processedOfficeName = processedOfficeName.replace(
          /{stateName}|{prefectureName}|{provinceName}/g,
          currentRegionNameForDisplay
        );
        const stateShortName = currentRegionNameForDisplay
          .substring(0, 3)
          .toUpperCase();
        processedOfficeName = processedOfficeName.replace(
          /{stateShortName}/g,
          stateShortName
        );
      }

      if (office.officeNameTemplateId?.includes("governor")) {
        if (office.officeNameTemplateId.includes("lieutenant")) {
          return `Lieutenant Governor`;
        }
        return `Governor`;
      }

      if (
        office.level?.includes("_house") ||
        office.level?.includes("_senate")
      ) {
        // This new regex specifically looks for the "(Seat #)" pattern
        const seatMatch = processedOfficeName.match(/\((Seat\s\d+)\)/);

        let districtPart = "";
        if (seatMatch) {
          // If we find "(Seat #)", use it directly. result: "Seat 1"
          districtPart = seatMatch[1];
        } else {
          // As a fallback, look for other district formats if they exist
          const districtMatch = processedOfficeName.match(/(District\s\d+)/);
          if (districtMatch) {
            districtPart = districtMatch[1];
          }
        }

        let chamberName = "";
        if (office.level.includes("_upper_")) {
          chamberName = legislatureNames?.upper || "Upper House";
        } else if (office.level.includes("_lower_")) {
          chamberName = legislatureNames?.lower || "Lower House";
        }

        return districtPart ? `${chamberName}, ${districtPart}` : chamberName;
      }

      return processedOfficeName;
    },
    [legislatureNames]
  );

  if (!activeState) {
    return (
      <div className="city-overview-tab">
        <p>No state data available.</p>
      </div>
    );
  }

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      // ... all other cases (summary, demographics, etc.) remain the same
      case "summary":
        return <StateSummaryTab stateData={activeState} />;
      case "demographics":
        return (
          <section className="city-section">
            {" "}
            {/* Using city-section class */}
            <h4>Demographics</h4>
            {demographics ? (
              <div className="city-stats-grid two-col">
                {" "}
                {/* Using city-stats-grid */}
                {ageDistribution && (
                  <div className="stat-item sub-section">
                    <strong>Age Distribution:</strong>
                    <ul>
                      <li>
                        Youth (0-17):{" "}
                        {formatPercentage(ageDistribution.youth, 0)}
                      </li>
                      <li>
                        Young Adult (18-34):{" "}
                        {formatPercentage(ageDistribution.youngAdult, 0)}
                      </li>
                      <li>
                        Adult (35-59):{" "}
                        {formatPercentage(ageDistribution.adult, 0)}
                      </li>
                      <li>
                        Senior (60+):{" "}
                        {formatPercentage(ageDistribution.senior, 0)}
                      </li>
                    </ul>
                  </div>
                )}
                {educationLevels && (
                  <div className="stat-item sub-section">
                    <strong>Education Levels (Adults):</strong>
                    <ul>
                      <li>
                        High School or Less:{" "}
                        {formatPercentage(educationLevels.highSchoolOrLess, 0)}
                      </li>
                      <li>
                        Some College:{" "}
                        {formatPercentage(educationLevels.someCollege, 0)}
                      </li>
                      <li>
                        Bachelors or Higher:{" "}
                        {formatPercentage(educationLevels.bachelorsOrHigher, 0)}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>No demographic data available.</p>
            )}
          </section>
        );
      case "services":
        return (
          <section className="city-section">
            {" "}
            {/* Using city-section class */}
            <h4>Public Services & Infrastructure Ratings</h4>
            <div className="city-stats-grid three-col">
              {" "}
              {/* Using city-stats-grid */}
              {crimeRatePer1000 != null ? (
                <div className="stat-item">
                  <strong>Crime Rate:</strong>{" "}
                  <span className="stat-descriptor">
                    {parseFloat(crimeRatePer1000).toFixed(1)} per 1,000 residents
                  </span>
                </div>
              ) : (
                <div className="stat-item">
                  <strong>Public Safety:</strong>{" "}
                  <span
                    className={`stat-descriptor rating-${(
                      publicSafetyRating || "average"
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {getRatingDescriptor(publicSafetyRating)}
                  </span>
                </div>
              )}
              <div className="stat-item">
                <strong>Poverty Rate:</strong>{" "}
                <span className="stat-descriptor">
                  {formatPercentage(povertyRate, 1)}
                </span>
              </div>
              <div className="stat-item">
                <strong>Education Quality:</strong>{" "}
                <span
                  className={`stat-descriptor rating-${(
                    educationQuality || "average"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getRatingDescriptor(educationQuality)}
                </span>
              </div>
              <div className="stat-item">
                <strong>Infrastructure State:</strong>{" "}
                <span
                  className={`stat-descriptor rating-${(
                    infrastructureState || "average"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getRatingDescriptor(infrastructureState)}
                </span>
              </div>
              {healthcareCoverage != null || healthcareCostPerPerson != null ? (
                <>
                  <div className="stat-item">
                    <strong>Healthcare Coverage:</strong>{" "}
                    <span className="stat-descriptor">
                      {formatPercentage(healthcareCoverage, 1)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <strong>Cost Per Person (Healthcare):</strong>{" "}
                    <span className="stat-descriptor">
                      ${typeof healthcareCostPerPerson === "number"
                        ? healthcareCostPerPerson.toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="stat-item">
                  <strong>Healthcare Quality:</strong>{" "}
                  <span
                    className={`stat-descriptor rating-${(
                      healthcareQuality || "average"
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {getRatingDescriptor(healthcareQuality)}
                  </span>
                </div>
              )}
              <div className="stat-item">
                <strong>Environment Rating:</strong>{" "}
                <span
                  className={`stat-descriptor rating-${(
                    environmentRating || "average"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getRatingDescriptor(environmentRating)}
                </span>
              </div>
              <div className="stat-item">
                <strong>Culture & Arts Rating:</strong>{" "}
                <span
                  className={`stat-descriptor rating-${(
                    cultureArtsRating || "average"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getRatingDescriptor(cultureArtsRating)}
                </span>
              </div>
            </div>
          </section>
        );
      case "budget":
        return (
          <>
            {budget ? (
              <section className="city-section">
                {" "}
                {/* Using city-section class */}
                <h4>{regionType} Budget & Taxes (Annual Estimate)</h4>
                <div className="city-stats-grid two-col budget-summary-grid">
                  {" "}
                  {/* Using city-stats-grid */}
                  <div className="stat-item">
                    <strong>Total Income:</strong> $
                    {budget.totalAnnualIncome?.toLocaleString() || "N/A"}
                  </div>
                  <div className="stat-item">
                    <strong>Total Expenses:</strong> $
                    {budget.totalAnnualExpenses?.toLocaleString() || "N/A"}
                  </div>
                  <div className="stat-item">
                    <strong>Balance:</strong>{" "}
                    <span
                      className={
                        budget.balance >= 0 ? "text-success" : "text-error"
                      }
                    >
                      ${budget.balance?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <strong>Accumulated Debt/Surplus:</strong>
                    <span
                      className={
                        budget.accumulatedDebt > 0
                          ? "text-error"
                          : budget.accumulatedDebt < 0
                          ? "text-success"
                          : "text-neutral"
                      }
                    >
                      $
                      {Math.abs(budget.accumulatedDebt)?.toLocaleString() ||
                        "N/A"}
                      {budget.accumulatedDebt > 0
                        ? " (Debt)"
                        : budget.accumulatedDebt < 0
                        ? " (Surplus)"
                        : " (Balanced)"}
                    </span>
                  </div>
                </div>
                {taxRates && (
                  <div className="tax-rates-subsection">
                    <h5>Current Tax Rates:</h5>
                    <div className="city-stats-grid three-col">
                      {" "}
                      {/* Using city-stats-grid */}
                      <div className="stat-item">
                        Property Tax:{" "}
                        <span>
                          {formatPercentage(taxRates.property * 100, 2)}
                        </span>
                      </div>
                      <div className="stat-item">
                        Sales Tax:{" "}
                        <span>{formatPercentage(taxRates.sales * 100, 1)}</span>
                      </div>
                      <div className="stat-item">
                        Business Tax:{" "}
                        <span>
                          {formatPercentage(taxRates.business * 100, 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="budget-details-container">
                  <div className="budget-column income-sources">
                    <h5>Detailed Income Sources:</h5>
                    {incomeSources &&
                    typeof incomeSources === "object" &&
                    Object.keys(incomeSources).length > 0 ? (
                      <ul className="budget-breakdown-list">
                        {Object.entries(incomeSources).map(([key, value]) => (
                          <li key={`income-${key}`}>
                            <span>{formatBudgetKey(key)}:</span>
                            <span>
                              $
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : String(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No detailed income sources available.</p>
                    )}
                  </div>

                  <div className="budget-column expense-allocations">
                    <h5>Detailed Expense Allocations:</h5>
                    {expenseAllocations &&
                    typeof expenseAllocations === "object" &&
                    Object.keys(expenseAllocations).length > 0 ? (
                      <ul className="budget-breakdown-list">
                        {Object.entries(expenseAllocations).map(
                          ([key, value]) => {
                            return (
                              <li key={`expense-${key}`}>
                                <span>{formatBudgetKey(key)}:</span>
                                <span>
                                  $
                                  {typeof value === "number"
                                    ? value.toLocaleString()
                                    : String(value)}
                                </span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    ) : (
                      <p>No detailed expense allocations available.</p>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <p>No budget data available.</p>
            )}
          </>
        );
      case "government": {
        return (
          <section className="city-officials-section city-section">
            <h4>{regionType} Government Structure</h4>

            {governmentSubTab === "offices" && (
              <>
                {/* Executive Branch Section */}
            <div className="government-branch-section executive-branch">
              <div className="branch-header">
                <h5>Executive Branch</h5>
                <span className="branch-subtitle">{regionType} Leadership</span>
              </div>
              <div className="executive-officials-grid">
                {governorOffice && governorOffice.holder && (
                  <div className="mayor-card featured-official">
                    <div className="official-role-badge">Governor</div>
                    <div className="official-info">
                      <div className="official-name-row">
                        <h6 className="official-name" 
                            onClick={() => handlePoliticianClick(getUpdatedPolitician(governorOffice.holder))}>
                          {getUpdatedPolitician(governorOffice.holder)?.firstName} {getUpdatedPolitician(governorOffice.holder)?.lastName}
                        </h6>
                        <button 
                          className="seat-history-button"
                          onClick={() => openSeatHistoryModal(governorOffice)}
                          title="View seat history"
                        >
                          📅
                        </button>
                      </div>
                      <p className="official-party">
                        {getUpdatedPolitician(governorOffice.holder)?.partyName || "Independent"}
                      </p>
                      <div className="official-stats">
                        <div className="stat-mini">
                          <span className="stat-label">Approval</span>
                          <span className="stat-value">
                            {getUpdatedPolitician(governorOffice.holder)?.approvalRating || "N/A"}%
                          </span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-label">Term</span>
                          <span className="stat-value">
                            {governorOffice.termLength || "N/A"} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {lieutenantGovernorOffice && lieutenantGovernorOffice.holder && (
                  <div className="vice-mayor-card featured-official">
                    <div className="official-role-badge">Lt. Governor</div>
                    <div className="official-info">
                      <div className="official-name-row">
                        <h6 className="official-name"
                            onClick={() => handlePoliticianClick(getUpdatedPolitician(lieutenantGovernorOffice.holder))}>
                          {getUpdatedPolitician(lieutenantGovernorOffice.holder)?.firstName} {getUpdatedPolitician(lieutenantGovernorOffice.holder)?.lastName}
                        </h6>
                        <button 
                          className="seat-history-button"
                          onClick={() => openSeatHistoryModal(lieutenantGovernorOffice)}
                          title="View seat history"
                        >
                          📅
                        </button>
                      </div>
                      <p className="official-party">
                        {getUpdatedPolitician(lieutenantGovernorOffice.holder)?.partyName || "Independent"}
                      </p>
                    </div>
                  </div>
                )}
                {!governorOffice?.holder && !lieutenantGovernorOffice?.holder && (
                  <p className="no-officials-message">No executive officials currently in office</p>
                )}
              </div>
            </div>

            {/* Legislative Branch Section */}
            {(lowerChamberOffices.length > 0 || upperChamberOffices.length > 0) && (
              <div className="government-branch-section legislative-branch">
                <div className="branch-header">
                  <h5>Legislative Branch</h5>
                  <span className="branch-subtitle">
                    {regionType} Legislature • {lowerChamberOffices.length + upperChamberOffices.length} Members
                  </span>
                </div>

                {/* Lower Chamber Section */}
                {lowerChamberOffices.length > 0 && (
                  <div className="legislature-chamber-section">
                    <div className="chamber-header">
                      <h6>{legislatureNames?.lower || "Lower House"}</h6>
                      <span className="chamber-subtitle">{lowerChamberOffices.length} Members</span>
                    </div>
                    
                    {/* Chamber Composition Overview */}
                    {lowerChamberComposition.length > 0 && (
                      <div className="council-overview">
                        <div className="council-composition-stats">
                          <div className="composition-chart">
                            <CouncilCompositionPieChart
                              councilCompositionData={lowerChamberComposition}
                              themeColors={currentTheme?.colors}
                              themeFonts={currentTheme?.fonts}
                            />
                          </div>
                          <div className="composition-legend">
                            <h6>Party Distribution</h6>
                            {lowerChamberComposition.map((party) => (
                              <div key={party.id} className="legend-item">
                                <span className="party-color-dot" style={{ backgroundColor: party.color }}></span>
                                <span className="party-name">{party.name}</span>
                                <span className="party-count">{party.popularity} seats</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Members Section with Filter Toggle */}
                    <div className="council-members-section">
                      <div className="section-header">
                        <h6>Lower House Members</h6>
                        <div className="view-toggle">
                          <button 
                            className={governmentFilter === "all" ? "active" : ""}
                            onClick={() => setGovernmentFilter("all")}
                          >
                            All
                          </button>
                          <button 
                            className={governmentFilter === "party" ? "active" : ""}
                            onClick={() => setGovernmentFilter("party")}
                          >
                            By Party
                          </button>
                        </div>
                      </div>
                      
                      <div className={`council-members-grid ${governmentFilter === "party" ? "grouped-by-party" : ""}`}>
                        {filteredLowerChamberMembers.length > 0 ? (
                          filteredLowerChamberMembers.map((office, index) => {
                            const politician = getUpdatedPolitician(office.holder);
                            const currentParty = politician?.partyName || "Independent";
                            const prevPolitician = index > 0 ? getUpdatedPolitician(filteredLowerChamberMembers[index - 1].holder) : null;
                            const prevParty = prevPolitician?.partyName || "Independent";
                            const isNewPartyGroup = governmentFilter === "party" && (index === 0 || currentParty !== prevParty);
                            
                            return (
                              <React.Fragment key={office.officeId}>
                                {isNewPartyGroup && governmentFilter === "party" && (
                                  <div className="party-group-header" style={{ gridColumn: "1 / -1" }}>
                                    <span className="party-group-name" style={{ color: politician?.partyColor || "#888" }}>
                                      {currentParty}
                                    </span>
                                    <span className="party-group-count">
                                      ({filteredLowerChamberMembers.filter(o => {
                                        const p = getUpdatedPolitician(o.holder);
                                        return (p?.partyName || "Independent") === currentParty;
                                      }).length} members)
                                    </span>
                                  </div>
                                )}
                                <div className="council-member-card">
                                  <div className="member-header">
                                    <span className="seat-number">
                                      {formatOfficeTitleForDisplay(office, stateName)}
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
                                    {governmentFilter !== "party" && (
                                      <p className="member-party" style={{ color: politician?.partyColor || "#888" }}>
                                        {politician?.partyName || "Independent"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <p className="no-officials-message">No lower house members currently in office</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upper Chamber Section */}
                {upperChamberOffices.length > 0 && (
                  <div className="legislature-chamber-section">
                    <div className="chamber-header">
                      <h6>{legislatureNames?.upper || "Upper House"}</h6>
                      <span className="chamber-subtitle">{upperChamberOffices.length} Members</span>
                    </div>
                    
                    {/* Chamber Composition Overview */}
                    {upperChamberComposition.length > 0 && (
                      <div className="council-overview">
                        <div className="council-composition-stats">
                          <div className="composition-chart">
                            <CouncilCompositionPieChart
                              councilCompositionData={upperChamberComposition}
                              themeColors={currentTheme?.colors}
                              themeFonts={currentTheme?.fonts}
                            />
                          </div>
                          <div className="composition-legend">
                            <h6>Party Distribution</h6>
                            {upperChamberComposition.map((party) => (
                              <div key={party.id} className="legend-item">
                                <span className="party-color-dot" style={{ backgroundColor: party.color }}></span>
                                <span className="party-name">{party.name}</span>
                                <span className="party-count">{party.popularity} seats</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Members Section with Filter Toggle */}
                    <div className="council-members-section">
                      <div className="section-header">
                        <h6>Upper House Members</h6>
                        <div className="view-toggle">
                          <button 
                            className={governmentFilter === "all" ? "active" : ""}
                            onClick={() => setGovernmentFilter("all")}
                          >
                            All
                          </button>
                          <button 
                            className={governmentFilter === "party" ? "active" : ""}
                            onClick={() => setGovernmentFilter("party")}
                          >
                            By Party
                          </button>
                        </div>
                      </div>
                      
                      <div className={`council-members-grid ${governmentFilter === "party" ? "grouped-by-party" : ""}`}>
                        {filteredUpperChamberMembers.length > 0 ? (
                          filteredUpperChamberMembers.map((office, index) => {
                            const politician = getUpdatedPolitician(office.holder);
                            const currentParty = politician?.partyName || "Independent";
                            const prevPolitician = index > 0 ? getUpdatedPolitician(filteredUpperChamberMembers[index - 1].holder) : null;
                            const prevParty = prevPolitician?.partyName || "Independent";
                            const isNewPartyGroup = governmentFilter === "party" && (index === 0 || currentParty !== prevParty);
                            
                            return (
                              <React.Fragment key={office.officeId}>
                                {isNewPartyGroup && governmentFilter === "party" && (
                                  <div className="party-group-header" style={{ gridColumn: "1 / -1" }}>
                                    <span className="party-group-name" style={{ color: politician?.partyColor || "#888" }}>
                                      {currentParty}
                                    </span>
                                    <span className="party-group-count">
                                      ({filteredUpperChamberMembers.filter(o => {
                                        const p = getUpdatedPolitician(o.holder);
                                        return (p?.partyName || "Independent") === currentParty;
                                      }).length} members)
                                    </span>
                                  </div>
                                )}
                                <div className="council-member-card">
                                  <div className="member-header">
                                    <span className="seat-number">
                                      {formatOfficeTitleForDisplay(office, stateName)}
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
                                    {governmentFilter !== "party" && (
                                      <p className="member-party" style={{ color: politician?.partyColor || "#888" }}>
                                        {politician?.partyName || "Independent"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <p className="no-officials-message">No upper house members currently in office</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Committees Section */}
                {committeeSystem && Object.keys(stateCommittees).length > 0 && (
                  <div className="legislature-committees-section">
                    <div className="committees-header">
                      <h6>Legislative Committees</h6>
                      <span className="committees-subtitle">
                        {committeeSystem.systemName} • {Object.keys(stateCommittees).filter(k => !stateCommittees[k].isSelect).length} Standing, {Object.keys(stateCommittees).filter(k => stateCommittees[k].isSelect).length} Select
                      </span>
                    </div>

                    {/* Committee System Features */}
                    <div className="committee-system-info">
                      <div className="system-features">
                        <h6>System Features</h6>
                        <div className="features-tags">
                          {committeeSystem.features.map((feature) => (
                            <span key={feature} className="feature-tag">
                              {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Committees Overview or Detail */}
                    {!selectedCommittee ? (
                      <div className="committees-grid">
                        {/* Standing Committees */}
                        <div className="committees-category">
                          <h6>Standing Committees</h6>
                          <div className="committee-cards-grid">
                            {Object.entries(stateCommittees).filter(([key, committee]) => !committee.isSelect).map(([key, committee]) => {
                              const chairPolitician = committee.chair ? getUpdatedPolitician(committee.chair.holder) : null;
                              
                              return (
                                <div key={key} className="committee-card clickable" onClick={() => setSelectedCommittee(committee)}>
                                  <div className="committee-header">
                                    <h5 className="committee-name">{committee.name}</h5>
                                    <span className={`committee-status ${chairPolitician ? 'active' : 'vacant'}`}>
                                      {chairPolitician ? `Chair: ${chairPolitician.firstName} ${chairPolitician.lastName}` : 'Vacant Chair'}
                                    </span>
                                  </div>
                                  
                                  <div className="committee-summary">
                                    <div className="committee-stats">
                                      <div className="stat-item">
                                        <span className="stat-value">{committee.size}</span>
                                        <span className="stat-label">Members</span>
                                      </div>
                                      <div className="stat-item">
                                        <span className="stat-value">{committee.jurisdiction.length}</span>
                                        <span className="stat-label">Areas</span>
                                      </div>
                                    </div>
                                    
                                    <div className="committee-preview">
                                      <strong>Top Jurisdictions:</strong>
                                      <div className="preview-tags">
                                        {committee.jurisdiction.slice(0, 3).map((area) => (
                                          <span key={area} className="preview-tag">
                                            {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </span>
                                        ))}
                                        {committee.jurisdiction.length > 3 && (
                                          <span className="preview-tag more">+{committee.jurisdiction.length - 3} more</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Select Committees */}
                        {Object.entries(stateCommittees).some(([key, committee]) => committee.isSelect) && (
                          <div className="committees-category">
                            <h6>Select Committees</h6>
                            <div className="committee-cards-grid">
                              {Object.entries(stateCommittees).filter(([key, committee]) => committee.isSelect).map(([key, committee]) => {
                                const chairPolitician = committee.chair ? getUpdatedPolitician(committee.chair.holder) : null;
                                
                                return (
                                  <div key={key} className="committee-card select-committee clickable" onClick={() => setSelectedCommittee(committee)}>
                                    <div className="committee-header">
                                      <h5 className="committee-name">{committee.name}</h5>
                                      <span className={`committee-status ${chairPolitician ? 'active' : 'vacant'}`}>
                                        {chairPolitician ? `Chair: ${chairPolitician.firstName} ${chairPolitician.lastName}` : 'Vacant Chair'}
                                      </span>
                                    </div>
                                    
                                    <div className="committee-summary">
                                      <div className="committee-stats">
                                        <div className="stat-item">
                                          <span className="stat-value">{committee.size}</span>
                                          <span className="stat-label">Members</span>
                                        </div>
                                        <div className="stat-item">
                                          <span className="stat-value">Select</span>
                                          <span className="stat-label">Type</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Committee Detail View */
                      <div className="committee-detail-view">
                        <div className="committee-detail-header">
                          <div className="detail-title-section">
                            <button className="back-button" onClick={() => setSelectedCommittee(null)}>
                              ← Back to Committees
                            </button>
                            <h4>{selectedCommittee.name}</h4>
                            <span className={`committee-type-badge ${selectedCommittee.isSelect ? 'select' : 'standing'}`}>
                              {selectedCommittee.isSelect ? 'Select Committee' : 'Standing Committee'}
                            </span>
                          </div>
                        </div>

                        <div className="committee-detail-content">
                          {/* Committee Leadership */}
                          <div className="committee-leadership">
                            <h5>Committee Leadership</h5>
                            {selectedCommittee.chair ? (
                              <div className="committee-chair-card">
                                <div className="chair-info">
                                  <div className="chair-name-section">
                                    <h6 
                                      className="chair-name clickable"
                                      onClick={() => handlePoliticianClick(getUpdatedPolitician(selectedCommittee.chair.holder))}
                                    >
                                      {getUpdatedPolitician(selectedCommittee.chair.holder)?.firstName} {getUpdatedPolitician(selectedCommittee.chair.holder)?.lastName}
                                    </h6>
                                    <span className="chair-title">Committee Chair</span>
                                    <span className="chair-party" style={{ color: getUpdatedPolitician(selectedCommittee.chair.holder)?.partyColor || "#888" }}>
                                      {getUpdatedPolitician(selectedCommittee.chair.holder)?.partyName || "Independent"}
                                    </span>
                                  </div>
                                  <div className="chair-stats">
                                    <div className="stat-mini">
                                      <span className="stat-label">District</span>
                                      <span className="stat-value">
                                        {formatOfficeTitleForDisplay(selectedCommittee.chair, stateName)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p>No chair assigned</p>
                            )}
                          </div>

                          {/* Committee Members */}
                          <div className="committee-members">
                            <h5>Committee Members ({selectedCommittee.size})</h5>
                            <div className="committee-members-grid">
                              {selectedCommittee.members.map((member, index) => {
                                const politician = getUpdatedPolitician(member.holder);
                                const isChair = selectedCommittee.chair?.officeId === member.officeId;
                                
                                return (
                                  <div key={member.officeId} className={`committee-member-card ${isChair ? 'chair' : ''}`}>
                                    <div className="member-info">
                                      <div className="member-name-section">
                                        <p 
                                          className="member-name clickable"
                                          onClick={() => handlePoliticianClick(politician)}
                                        >
                                          {politician?.firstName} {politician?.lastName}
                                        </p>
                                        {isChair && <span className="chair-badge">Chair</span>}
                                        <span className="member-district">
                                          {formatOfficeTitleForDisplay(member, stateName)}
                                        </span>
                                      </div>
                                      <div className="member-party-info">
                                        <span 
                                          className="member-party" 
                                          style={{ color: politician?.partyColor || "#888" }}
                                        >
                                          {politician?.partyName || "Independent"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Committee Jurisdiction & Powers */}
                          <div className="committee-details-full">
                            <div className="jurisdiction-full">
                              <h5>Jurisdiction</h5>
                              <div className="jurisdiction-areas">
                                {selectedCommittee.jurisdiction.map((area) => (
                                  <span key={area} className="jurisdiction-area">
                                    {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="powers-full">
                              <h5>Key Powers</h5>
                              <ul className="powers-detailed-list">
                                {selectedCommittee.keyPowers.map((power) => (
                                  <li key={power}>
                                    {power.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {governmentSubTab === "departments" && (
              <div className="departments-modern-layout">
                {/* Executive Summary */}
                <div className="info-card exec-summary-card">
                  <div className="summary-header">
                    <div className="summary-title-group">
                      <h3>{regionType} Departments</h3>
                      <span className="summary-subtitle">Administrative Structure & Leadership</span>
                    </div>
                    <div className="summary-metrics">
                      <div className="summary-metric">
                        <span className="metric-number">{governmentDepartments?.state?.length || 0}</span>
                        <span className="metric-label">Departments</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          {(governmentDepartments?.state || []).filter(dept => dept.head).length}
                        </span>
                        <span className="metric-label">Filled</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          ${((governmentDepartments?.state || []).reduce((sum, dept) => sum + (dept.budget || 0), 0) / 1000000).toFixed(1)}M
                        </span>
                        <span className="metric-label">Budget</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          {(governmentDepartments?.state || []).reduce((sum, dept) => sum + (dept.employees || 0), 0).toLocaleString()}
                        </span>
                        <span className="metric-label">Staff</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departments Grid */}
                <div className="departments-grid-container">
                    {governmentDepartments?.state?.length > 0 ? (
                      governmentDepartments.state.map((department) => {
                        const departmentHead = getUpdatedPolitician(department.head);
                        const budgetInMillions = (department.budget || 0) / 1000000;
                        const employeeCount = department.employees || 0;
                        
                        return (
                          <div key={department.id} className={`dept-card ${departmentHead ? 'active' : 'vacant'}`}>
                            {/* Card Header */}
                            <div className="dept-card-header">
                              <div className="dept-info">
                                <h4 className="dept-title">{department.name}</h4>
                                <span className={`dept-status-badge ${departmentHead ? 'active' : 'vacant'}`}>
                                  {departmentHead ? 'Active' : 'Vacant Position'}
                                </span>
                              </div>
                              <div className="dept-metrics-compact">
                                <div className="compact-metric">
                                  <span className="value">${budgetInMillions.toFixed(1)}M</span>
                                  <span className="label">Budget</span>
                                </div>
                                <div className="compact-metric">
                                  <span className="value">{employeeCount.toLocaleString()}</span>
                                  <span className="label">Staff</span>
                                </div>
                              </div>
                            </div>

                            {/* Department Head Section */}
                            {departmentHead ? (
                              <div className="dept-leadership">
                                <div className="leader-profile">
                                  <div className="leader-info">
                                    <p className="leader-name" onClick={() => handlePoliticianClick(departmentHead)}>
                                      {departmentHead.firstName} {departmentHead.lastName}
                                    </p>
                                    <p className="leader-title">{departmentHead.currentOffice?.title || 'Secretary'}</p>
                                    <span className="leader-party" style={{ color: departmentHead.partyColor || "var(--secondary-text)" }}>
                                      {departmentHead.partyName || "Independent"}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="performance-indicators">
                                  <div className="performance-item">
                                    <span className="perf-value">{departmentHead.approvalRating || "N/A"}%</span>
                                    <span className="perf-label">Approval</span>
                                  </div>
                                  <div className="performance-item">
                                    <span className="perf-value">{departmentHead.yearsOfExperience || "N/A"}</span>
                                    <span className="perf-label">Yrs Exp</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="dept-vacancy">
                                <div className="vacancy-content">
                                  <p className="vacancy-title">Position Open</p>
                                  <p className="vacancy-description">Department secretary appointment required</p>
                                  <button className="vacancy-action">Appoint Secretary</button>
                                </div>
                              </div>
                            )}

                            {/* Department Functions */}
                            {department.responsibilities && department.responsibilities.length > 0 && (
                              <div className="dept-functions">
                                <h5>Core Functions</h5>
                                <div className="functions-list">
                                  {department.responsibilities.map((responsibility, index) => (
                                    <span key={index} className="function-tag">
                                      {responsibility}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="no-departments-state">
                      <div className="empty-state-icon">🏛️</div>
                      <h4>No Departments Available</h4>
                      <p>Department structure not configured for this {regionType?.toLowerCase() || 'region'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Individual Department Views */}
            {currentDepartment && (
              <div className="department-detail-view">
                {renderDepartmentDetail(currentDepartment)}
              </div>
            )}
          </section>
        );
      }
      case "laws":
        return (
          <section className="city-section city-laws-section">
            {" "}
            {/* Using city-section & city-laws-section */}
            <h4>Current {regionType}-Level Legislation</h4>
            {console.log("[StateOverviewTab] stateLaws:", stateLaws)}
            {stateLaws &&
            typeof stateLaws === "object" &&
            Object.keys(stateLaws).length > 0 ? (
              <ul className="city-laws-list">
                {" "}
                {/* Using city-laws-list */}
                {Object.entries(stateLaws).map(([key, value]) => (
                  <li key={`law-${key}`} className="law-item">
                    <span className="law-name">{formatBudgetKey(key)}:</span>{" "}
                    <span className="law-value">
                      {formatLawValue(key, value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No specific {regionType} laws data available or data is not an
                object.
                {stateLaws && <span> (Type: {typeof stateLaws}, Keys: {Object.keys(stateLaws || {}).length})</span>}
              </p>
            )}
          </section>
        );
      case "coalitions":
        return (
          <section className="city-section">
            <h4>{stateName} Political Coalitions</h4>
            {coalitionData && coalitionData.base ? (
              <>
                <p className="section-description">
                  Major voting blocs and demographic coalitions in {stateName}
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
              </>
            ) : (
              <p>No coalition data available for {stateName}.</p>
            )}
          </section>
        );
      default:
        return <p>Select a sub-tab to view details.</p>;
    }
  };

  return (
    <div className="tab-content-container">
      <div className="government-tab-content">
        <div className="sub-tab-content-area">{renderSubTabContent()}</div>
      </div>
    </div>
  );
};

export default StateOverviewTab;
