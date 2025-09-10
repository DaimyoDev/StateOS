import React, { useState, useMemo, useCallback } from "react";
import useGameStore from "../../../store";
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import StudentCoalitionPieChart from "../../charts/StudentCoalitionPieChart";
import AcademicPerformanceChart from "../../charts/AcademicPerformanceChart";
import CareerPathwaysChart from "../../charts/CareerPathwaysChart";
import PoliticianCard from "../../PoliticianCard"; // NEW: Import PoliticianCard
import CitySummaryTab from "../../CitySummaryTab"; // NEW: Import CitySummaryTab
import CityServicesTab from "./CityServicesTab"; // NEW: Import CityServicesTab
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css";

// Helper functions (keeping these as they are)
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
  if (key === "minimumWage") {
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

// Education quality helpers for numerical metrics (same as CitySummaryTab)
const getEducationQualityLevel = (stats) => {
  const score = getEducationCompositeScore(stats);
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'average';
  return 'poor';
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

const CityOverviewTab = ({ campaignData, activeSubTab = "summary", governmentSubTab = "offices" }) => {
  const [governmentFilter, setGovernmentFilter] = useState("all");
  // Remove the separate state - use the prop directly

  const SUBTABS = [
    { id: "summary", label: "Summary" },
    { id: "demographics", label: "Demographics" },
    { id: "services", label: "Services" },
    { id: "budget", label: "Budget & Taxes" },
    { id: "government", label: "Government" },
    { id: "laws", label: "City Laws" },
    { id: "coalitions", label: "Coalitions" }
  ];

  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const { openViewPoliticianModal, getCoalitionsForCity, openSeatHistoryModal } = useGameStore((state) => state.actions);
  const governmentOffices = useGameStore((state) => state.activeCampaign?.governmentOffices);
  const governmentDepartments = useGameStore((state) => state.activeCampaign?.governmentDepartments);
  
  // Helper to get current department if governmentSubTab matches a department ID
  const currentDepartment = useMemo(() => {
    if (!governmentDepartments?.city) return null;
    return governmentDepartments.city.find(dept => 
      (dept.id || dept.name.toLowerCase().replace(/\s+/g, '-')) === governmentSubTab
    );
  }, [governmentDepartments, governmentSubTab]);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const politiciansSoA = useGameStore((state) => state.activeCampaign?.politicians);
  
  // Subscribe to government offices changes for reactivity
  
  // Debug logging for starting city
  console.log('[CityOverviewTab] Starting city:', activeCampaign?.startingCity);
  console.log('[CityOverviewTab] Starting city ID:', activeCampaign?.startingCity?.id);

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

  const { startingCity } = activeCampaign || {};
  const cityId = startingCity?.id;
  
  // Get coalition data for the city if available
  const coalitionData = getCoalitionsForCity(cityId);
  const cityGovernmentOffices = useMemo(() => {
    if (!governmentOffices || !cityId) return { executive: [], legislative: [] };
    return governmentOffices.cities?.[cityId] || { executive: [], legislative: [] };
  }, [governmentOffices, cityId]);
  
  // Debug logging for city government offices
  console.log('[CityOverviewTab] City government offices:', cityGovernmentOffices);
  console.log('[CityOverviewTab] Executive offices:', cityGovernmentOffices?.executive);
  console.log('[CityOverviewTab] Legislative offices:', cityGovernmentOffices?.legislative);
  
  const {
    name: cityName,
    population,
    demographics,
    economicProfile,
    stats,
    cityLaws,
  } = startingCity || {};


  const {
    type,
    wealth,
    mainIssues = [],
    economicOutlook,
    educationQuality,
    infrastructureState,
    overallCitizenMood,
    unemploymentRate,
    povertyRate, // <-- ADD
    crimeRatePer1000,
    budget,
    environmentRating,
    cultureArtsRating,
    healthcareCoverage,
    healthcareCostPerPerson,
  } = stats || {};

  const taxRates = budget?.taxRates;
  const incomeSources = budget?.incomeSources;
  const expenseAllocations = budget?.expenseAllocations;

  const { ageDistribution, educationLevels } = demographics || {};

  const { dominantIndustries, gdpPerCapita } = economicProfile || {};

  // Construct cityData object for CitySummaryTab
  const cityData = {
    name: cityName,
    population,
    demographics,
    economicProfile,
    stats
  };

  const mayorOffice = useMemo(() => {
    if (!cityGovernmentOffices?.executive || !cityId) return null;
    
    const mayorCandidate = cityGovernmentOffices.executive.find(
      (office) =>
        office.officeNameTemplateId &&
        office.officeNameTemplateId.includes("mayor") &&
        !office.officeNameTemplateId.includes("vice_mayor") &&
        office.holder
    );
    
    return mayorCandidate;
  }, [cityGovernmentOffices, cityId, governmentOffices]);

  const viceMayorOffice = useMemo(() => {
    if (!cityGovernmentOffices?.executive || !cityId) return null;
    return cityGovernmentOffices.executive.find(
      (office) =>
        office.officeNameTemplateId &&
        office.officeNameTemplateId.includes("vice_mayor") &&
        office.holder
    );
  }, [cityGovernmentOffices, cityId, governmentOffices]);

  const councilOffices = useMemo(() => {
    if (!cityGovernmentOffices?.legislative || cityGovernmentOffices.legislative.length === 0) return [];

    let allCouncilMembersForDisplay = [];

    cityGovernmentOffices.legislative.forEach((office) => {
      if (office.members && office.members.length > 0) {
        office.members.forEach((member, index) => {
          allCouncilMembersForDisplay.push({
            ...office,
            officeId: `${office.officeId}_member_${member.id}`,
            officeName: member.role || `${office.officeName} Member`,
            holder: member,
            _conceptualSeatNumber: index + 1,
            // Use individual member's seat history if available, otherwise fall back to office history
            seatHistory: member.seatHistory || office.seatHistory,
          });
        });
      } else if (office.holder && office.numberOfSeatsToFill === 1) {
        allCouncilMembersForDisplay.push({
          ...office,
          holder: office.holder,
          _conceptualSeatNumber: office.officeName.match(
            /\(Seat (\d+)\)/
          )?.[1]
            ? parseInt(office.officeName.match(/\(Seat (\d+)\)/)[1])
            : undefined,
        });
      }
    });

    return allCouncilMembersForDisplay.sort((a, b) => {
      const officeNameA = a.officeName || "";
      const officeNameB = b.officeName || "";

      const seatNumA =
        a._conceptualSeatNumber ||
        (officeNameA.match(/\(Seat (\d+)\)/)?.[1]
          ? parseInt(officeNameA.match(/\(Seat (\d+)\)/)[1])
          : NaN);
      const seatNumB =
        b._conceptualSeatNumber ||
        (officeNameB.match(/\(Seat (\d+)\)/)?.[1]
          ? parseInt(officeNameB.match(/\(Seat (\d+)\)/)[1])
          : NaN);

      const aHasNum = !isNaN(seatNumA);
      const bHasNum = !isNaN(seatNumB);

      if (aHasNum && bHasNum) {
        return seatNumA - seatNumB;
      } else if (aHasNum && !bHasNum) {
        return -1;
      } else if (!aHasNum && bHasNum) {
        return 1;
      } else {
        return officeNameA.localeCompare(officeNameB);
      }
    });
  }, [cityGovernmentOffices, cityId, governmentOffices]);

  const councilPartyComposition = useMemo(() => {
    if (!councilOffices || councilOffices.length === 0) return [];
    const partyData = {};
    councilOffices.forEach((office) => {
      // The 'office' variable here is already a single conceptual seat with a member in the 'holder' property.
      const holder = getUpdatedPolitician(office.holder);
      if (holder) {
        const partyName = holder.partyName || "Independent";
        let partyKey;

        // Use a static key to group all independents
        if (partyName === "Independent") {
          partyKey = "independent_group";
        } else {
          partyKey = holder.partyId || partyName;
        }

        if (!partyData[partyKey]) {
          partyData[partyKey] = {
            count: 0,
            color: partyName === "Independent" ? "#CCCCCC" : holder.partyColor,
            id: partyKey,
            name: partyName,
          };
        }
        // Increment the count once per member
        partyData[partyKey].count++;
      }
    });
    return Object.values(partyData).map((data) => ({
      id: data.id,
      name: data.name,
      popularity: data.count,
      color: data.color,
    }));
  }, [councilOffices, getUpdatedPolitician]);

  const handlePoliticianClick = (politician) => {
    if (politician && openViewPoliticianModal)
      openViewPoliticianModal(politician);
    else
      console.warn(
        "Politician data missing or action not available for modal.",
        politician
      );
  };

  const formatOfficeTitleForDisplay = useCallback(
    (office, currentCityNameForDisplay) => {
      // Renamed param to currentLocationName for generic PoliticianCard
      if (!office || !office.officeName) return "Office";

      let processedOfficeName = office.officeName;

      if (currentCityNameForDisplay) {
        if (processedOfficeName.includes("{cityNameOrMunicipalityName}")) {
          processedOfficeName = processedOfficeName.replace(
            /{cityNameOrMunicipalityName}/g,
            currentCityNameForDisplay
          );
        }
        if (processedOfficeName.includes("{cityName}")) {
          processedOfficeName = processedOfficeName.replace(
            /{cityName}/g,
            currentCityNameForDisplay
          );
        }
      }

      const officeNameLower = processedOfficeName.toLowerCase();

      if (office.officeNameTemplateId === "mayor") {
        return `Mayor`;
      }
      if (office.officeNameTemplateId === "vice_mayor") {
        return `Vice Mayor`;
      }

      if (
        office.officeNameTemplateId &&
        office.officeNameTemplateId.includes("city_council")
      ) {
        const seatMatchNumeric = processedOfficeName.match(/\(Seat (\d+)\)/i);
        if (seatMatchNumeric && seatMatchNumeric[1]) {
          return `Council Seat ${seatMatchNumeric[1]}`;
        }

        if (
          officeNameLower.includes("at-large") ||
          officeNameLower.includes("at large")
        ) {
          if (
            officeNameLower.match(/district\s+at-large/i) ||
            officeNameLower.match(/at-large\s+district/i)
          ) {
            return "Council District At-Large";
          }
          const atLargePositionMatch =
            processedOfficeName.match(
              /(?:Position\s*|Post\s*)?([A-Z0-9]+)\s*(At-Large|At Large)/i
            ) ||
            processedOfficeName.match(
              /(At-Large|At Large)\s*(?:Position\s*|Post\s*)?([A-Z0-9]+)/i
            );
          if (
            atLargePositionMatch &&
            atLargePositionMatch[1] &&
            !atLargePositionMatch[1].toLowerCase().includes("large")
          ) {
            return `Council At-Large, Position ${atLargePositionMatch[1]}`;
          } else if (
            atLargePositionMatch &&
            atLargePositionMatch[2] &&
            !atLargePositionMatch[2].toLowerCase().includes("large")
          ) {
            return `Council At-Large, Position ${atLargePositionMatch[2]}`;
          }
          return "Council Member At-Large";
        }

        const districtWordMatch = processedOfficeName.match(
          /(District|Distrito|Ward|Precinct|Area|Zone)\s+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)/i
        );
        if (districtWordMatch && districtWordMatch[1] && districtWordMatch[2]) {
          if (
            officeNameLower.includes("council") ||
            officeNameLower.includes("sangguniang") ||
            officeNameLower.includes("konsehal")
          ) {
            return `Council ${districtWordMatch[1]} ${districtWordMatch[2]}`;
          }
          return `Council ${districtWordMatch[1]} ${districtWordMatch[2]}`;
        }

        const simpleSeatMatch = processedOfficeName.match(
          /(?:Council\s*Seat|Seat|Councilmember|Konsehal)\s*(\d+)/i
        );
        if (simpleSeatMatch && simpleSeatMatch[1]) {
          return `Council Seat ${simpleSeatMatch[1]}`;
        }

        if (officeNameLower.includes("sangguniang panlungsod member")) {
          return "Sangguniang Panlungsod Member";
        }
        if (officeNameLower.includes("sangguniang bayan member")) {
          return "Sangguniang Bayan Member";
        }
        if (
          officeNameLower.startsWith("konsehal") &&
          officeNameLower.length <= 10
        ) {
          return "Councilor";
        }

        let cleanedName = processedOfficeName;
        if (currentCityNameForDisplay) {
          const patternsToRemoveCity = [
            new RegExp(
              `^${currentCityNameForDisplay.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}\\s*(City\\s*Council|Sangguniang\\s*Panlungsod|Sangguniang\\s*Bayan)?\\s*Member\\s*(-)?\\s*`,
              "i"
            ),
            new RegExp(
              `^${currentCityNameForDisplay.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}\\s*(City\\s*Council|Sangguniang\\s*Panlungsod|Sangguniang\\s*Bayan)?\\s*(-)?\\s*`,
              "i"
            ),
            new RegExp(
              `^(City\\s*Council|Sangguniang\\s*Panlungsod|Sangguniang\\s*Bayan)\\s*(Member)?\\s*of\\s*${currentCityNameForDisplay.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}\\s*(-)?\\s*`,
              "i"
            ),
          ];
          for (const pattern of patternsToRemoveCity) {
            if (pattern.test(cleanedName)) {
              cleanedName = cleanedName.replace(pattern, "").trim();
              break;
            }
          }
        }

        cleanedName = cleanedName
          .replace(/^(City\s*Council|Council)\s*(Member|Seat)?\s*(-)?\s*/i, "")
          .trim();
        cleanedName = cleanedName
          .replace(
            /^(Sangguniang\s*(Panlungsod|Bayan))\s*(Member)?\s*(-)?\s*/i,
            ""
          )
          .trim();
        cleanedName = cleanedName.replace(/^Konsehal\s*(-)?\s*/i, "").trim();
        cleanedName = cleanedName.replace(/^-\s*/, "").trim();

        if (cleanedName.length > 0 && !cleanedName.match(/^\(Seat \d+\)$/i)) {
          const finalCleanedName =
            cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
          if (
            !finalCleanedName.toLowerCase().startsWith("council") &&
            !finalCleanedName.toLowerCase().startsWith("district") &&
            !finalCleanedName.toLowerCase().startsWith("ward") &&
            !finalCleanedName.toLowerCase().startsWith("seat") &&
            !finalCleanedName.toLowerCase().includes("at-large") &&
            !finalCleanedName.toLowerCase().includes("sangguniang") &&
            !finalCleanedName.toLowerCase().includes("konsehal")
          ) {
            return `Council ${finalCleanedName}`;
          }
          return finalCleanedName;
        }

        if (office.countryContext === "PH") {
          return officeNameLower.includes("bayan")
            ? "Municipal Councilor"
            : "City Councilor";
        }
        return "City Council Member";
      }

      return processedOfficeName;
    },
    []
  );

  const allCityOfficials = useMemo(() => {
    const officials = [];
    if (mayorOffice && mayorOffice.holder) {
      officials.push({
        ...mayorOffice,
        holder: mayorOffice.holder,
        type: "mayor",
      });
    }
    if (viceMayorOffice && viceMayorOffice.holder) {
      officials.push({
        ...viceMayorOffice,
        holder: viceMayorOffice.holder,
        type: "vice_mayor",
      });
    }
    councilOffices.forEach((office) => {
      if (office.holder) {
        officials.push({
          ...office,
          holder: office.holder,
          type: "council",
        });
      }
    });
    return officials;
  }, [mayorOffice, viceMayorOffice, councilOffices, governmentOffices]);

  const filteredCouncilMembers = useMemo(() => {
    if (governmentFilter === "all") {
      return councilOffices;
    } else if (governmentFilter === "party") {
      // Group by party and sort
      const grouped = [...councilOffices].sort((a, b) => {
        const partyA = getUpdatedPolitician(a.holder)?.partyName || "ZZZ_Independent";
        const partyB = getUpdatedPolitician(b.holder)?.partyName || "ZZZ_Independent";
        
        // Sort by party name first
        if (partyA !== partyB) {
          return partyA.localeCompare(partyB);
        }
        
        // Then by seat number within the same party
        const seatA = a._conceptualSeatNumber || 999;
        const seatB = b._conceptualSeatNumber || 999;
        return seatA - seatB;
      });
      return grouped;
    } else if (governmentFilter === "district") {
      // For future district implementation
      return councilOffices;
    }
    return councilOffices;
  }, [councilOffices, governmentFilter, getUpdatedPolitician]);

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
                  <p className="leader-title">{departmentHead.currentOffice?.title || 'Department Director'}</p>
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
              <p className="vacant-message">No department head currently appointed</p>
              <button className="appoint-button">Appoint New Director</button>
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
        
        {/* Special sections for specific departments */}
        {department.name.toLowerCase().includes('education') && (
          <div className="education-districts-section">
            <h4>School Districts</h4>
            {renderEducationDistricts()}
            
            {/* Education Charts */}
            {startingCity?.schoolDistrict?.studentCoalitions && (
              <div className="education-charts-section">
                <h4>Education Analytics</h4>
                <div className="charts-grid">
                  <StudentCoalitionPieChart 
                    studentCoalitions={startingCity.schoolDistrict.studentCoalitions}
                    themeColors={currentTheme?.colors}
                    themeFonts={currentTheme?.fonts}
                  />
                  <AcademicPerformanceChart 
                    studentCoalitions={startingCity.schoolDistrict.studentCoalitions}
                    themeColors={currentTheme?.colors}
                    themeFonts={currentTheme?.fonts}
                  />
                  <CareerPathwaysChart 
                    studentCoalitions={startingCity.schoolDistrict.studentCoalitions}
                    themeColors={currentTheme?.colors}
                    themeFonts={currentTheme?.fonts}
                  />
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

  // Render education districts for the current city
  const renderEducationDistricts = () => {
    if (!startingCity?.schoolDistrict) {
      return (
        <div className="no-education-data">
          <p>No school district data available for this city.</p>
          <small>School districts are generated automatically for new campaigns.</small>
        </div>
      );
    }

    const district = startingCity.schoolDistrict;
    const coalitions = district.studentCoalitions;

    return (
      <div className="education-district-container">
        {/* District Overview */}
        <div className="district-overview-card">
          <div className="district-header">
            <h5>{district.name}</h5>
            <div className="district-basic-stats">
              <div className="basic-stat">
                <span className="stat-number">{district.totalStudents?.toLocaleString() || 'N/A'}</span>
                <span className="stat-label">Total Students</span>
              </div>
              <div className="basic-stat">
                <span className="stat-number">{district.schools || 'N/A'}</span>
                <span className="stat-label">Schools</span>
              </div>
              <div className="basic-stat">
                <span className="stat-number">${district.funding?.perStudent?.toLocaleString() || 'N/A'}</span>
                <span className="stat-label">Per Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Coalitions */}
        <div className="student-coalitions-section">
          <h6>Student Population by Demographics</h6>
          {coalitions && coalitions.size > 0 ? (
            <div className="coalitions-grid">
              {Array.from(coalitions.values()).map(coalition => {
                const percentage = district.totalStudents > 0 ? 
                  (coalition.studentCount / district.totalStudents * 100).toFixed(1) : 0;
                
                return (
                  <div key={coalition.id} className="coalition-card">
                    <div className="coalition-header">
                      <h6 className="coalition-name">{coalition.name}</h6>
                      <span className="coalition-percentage">{percentage}%</span>
                    </div>
                    <div className="coalition-stats">
                      <div className="coalition-stat">
                        <span className="stat-label">Students</span>
                        <span className="stat-value">{coalition.studentCount?.toLocaleString()}</span>
                      </div>
                      <div className="coalition-stat">
                        <span className="stat-label">Academic Score</span>
                        <span className="stat-value">{coalition.currentAcademicScore || 'N/A'}/100</span>
                      </div>
                      <div className="coalition-stat">
                        <span className="stat-label">College Aspiration</span>
                        <span className="stat-value">{((coalition.collegeAspiration || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="coalition-stat">
                        <span className="stat-label">Trade Interest</span>
                        <span className="stat-value">{((coalition.tradeInterest || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="coalition-stat">
                        <span className="stat-label">Dropout Risk</span>
                        <span className="stat-value risk-indicator">{((coalition.dropoutRisk || 0) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="coalition-details">
                      <div className="detail-row">
                        <span className="detail-label">Socioeconomic Status:</span>
                        <span className="detail-value ses-{coalition.ses}">{coalition.ses?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Cultural Background:</span>
                        <span className="detail-value">{coalition.culture?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-coalitions">No student coalition data available.</p>
          )}
        </div>

        {/* District Quality Metrics */}
        <div className="district-metrics-section">
          <h6>District Quality Metrics</h6>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Student-Teacher Ratio</span>
              <span className="metric-value">{district.metrics?.teacherStudentRatio || 'N/A'}:1</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Teacher Quality Index</span>
              <span className="metric-value">{district.metrics?.teacherQualityIndex || 'N/A'}/100</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Technology Access</span>
              <span className="metric-value">{district.metrics?.technologyAccess || 'N/A'}/100</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Infrastructure Score</span>
              <span className="metric-value">{district.metrics?.infrastructureScore || 'N/A'}/100</span>
            </div>
          </div>
        </div>

        {/* Funding Breakdown */}
        {district.funding && (
          <div className="funding-breakdown-section">
            <h6>Funding Sources</h6>
            <div className="funding-grid">
              <div className="funding-item">
                <span className="funding-label">Federal</span>
                <span className="funding-value">{(district.funding.federal * 100).toFixed(0)}%</span>
              </div>
              <div className="funding-item">
                <span className="funding-label">State</span>
                <span className="funding-value">{(district.funding.state * 100).toFixed(0)}%</span>
              </div>
              <div className="funding-item">
                <span className="funding-label">Local</span>
                <span className="funding-value">{(district.funding.local * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "summary":
        return <CitySummaryTab cityData={cityData} />;
      case "demographics":
        return (
          <section className="city-section">
            <h4>Demographics</h4>
            {demographics ? (
              <div className="city-stats-grid two-col">
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
        return <CityServicesTab cityData={cityData} themeColors={currentTheme?.colors} themeFonts={currentTheme?.fonts} />;
      case "budget":
        return (
          <>
            {budget ? (
              <section className="city-section">
                <h4>City Budget & Taxes (Annual Estimate)</h4>
                <div className="city-stats-grid two-col budget-summary-grid">
                  <div className="stat-item">
                    <strong>Total Income:</strong> ${" "}
                    {budget.totalAnnualIncome?.toLocaleString() || "N/A"}
                  </div>
                  <div className="stat-item">
                    <strong>Total Expenses:</strong> ${" "}
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
      case "government":
        return (
          <section className="city-officials-section city-section">
            <h4>City Government Structure</h4>

            {governmentSubTab === "offices" && (
              <>
                {/* Executive Branch Section */}
            <div className="government-branch-section executive-branch">
              <div className="branch-header">
                <h5>Executive Branch</h5>
                <span className="branch-subtitle">City Leadership</span>
              </div>
              <div className="executive-officials-grid">
                {mayorOffice && mayorOffice.holder && (
                  <div className="mayor-card featured-official">
                    <div className="official-role-badge">Mayor</div>
                    <div className="official-info">
                      <div className="official-name-row">
                        <h6 className="official-name" 
                            onClick={() => handlePoliticianClick(getUpdatedPolitician(mayorOffice.holder))}>
                          {getUpdatedPolitician(mayorOffice.holder)?.firstName} {getUpdatedPolitician(mayorOffice.holder)?.lastName}
                        </h6>
                        <button 
                          className="seat-history-button"
                          onClick={() => openSeatHistoryModal(mayorOffice)}
                          title="View seat history"
                        >
                          📅
                        </button>
                      </div>
                      <p className="official-party">
                        {getUpdatedPolitician(mayorOffice.holder)?.partyName || "Independent"}
                      </p>
                      <div className="official-stats">
                        <div className="stat-mini">
                          <span className="stat-label">Approval</span>
                          <span className="stat-value">
                            {getUpdatedPolitician(mayorOffice.holder)?.approvalRating || "N/A"}%
                          </span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-label">Term</span>
                          <span className="stat-value">
                            {mayorOffice.termLength || "N/A"} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {viceMayorOffice && viceMayorOffice.holder && (
                  <div className="vice-mayor-card featured-official">
                    <div className="official-role-badge">Vice Mayor</div>
                    <div className="official-info">
                      <div className="official-name-row">
                        <h6 className="official-name"
                            onClick={() => handlePoliticianClick(getUpdatedPolitician(viceMayorOffice.holder))}>
                          {getUpdatedPolitician(viceMayorOffice.holder)?.firstName} {getUpdatedPolitician(viceMayorOffice.holder)?.lastName}
                        </h6>
                        <button 
                          className="seat-history-button"
                          onClick={() => openSeatHistoryModal(viceMayorOffice)}
                          title="View seat history"
                        >
                          📅
                        </button>
                      </div>
                      <p className="official-party">
                        {getUpdatedPolitician(viceMayorOffice.holder)?.partyName || "Independent"}
                      </p>
                    </div>
                  </div>
                )}
                {!mayorOffice?.holder && !viceMayorOffice?.holder && (
                  <p className="no-officials-message">No executive officials currently in office</p>
                )}
              </div>
            </div>

            {/* Legislative Branch Section */}
            <div className="government-branch-section legislative-branch">
              <div className="branch-header">
                <h5>Legislative Branch</h5>
                <span className="branch-subtitle">City Council • {councilOffices.length} Members</span>
              </div>
              
              {/* Council Composition Overview */}
              {councilPartyComposition.length > 0 && (
                <div className="council-overview">
                  <div className="council-composition-stats">
                    <div className="composition-chart">
                      <CouncilCompositionPieChart
                        councilCompositionData={councilPartyComposition}
                        themeColors={currentTheme?.colors}
                        themeFonts={currentTheme?.fonts}
                      />
                    </div>
                    <div className="composition-legend">
                      <h6>Party Distribution</h6>
                      {councilPartyComposition.map((party) => (
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

              {/* Council Members Grid */}
              <div className="council-members-section">
                <div className="section-header">
                  <h6>Council Members</h6>
                  <div className="view-toggle">
                    <button 
                      className={governmentFilter === "all" ? "active" : ""}
                      onClick={() => setGovernmentFilter("all")}
                    >
                      All
                    </button>
                    <button 
                      className={governmentFilter === "district" ? "active" : ""}
                      onClick={() => setGovernmentFilter("district")}
                    >
                      By District
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
                  {filteredCouncilMembers.length > 0 ? (
                    filteredCouncilMembers.map((office, index) => {
                      const politician = getUpdatedPolitician(office.holder);
                      const currentParty = politician?.partyName || "Independent";
                      const prevPolitician = index > 0 ? getUpdatedPolitician(filteredCouncilMembers[index - 1].holder) : null;
                      const prevParty = prevPolitician?.partyName || "Independent";
                      const isNewPartyGroup = governmentFilter === "party" && index === 0 || (governmentFilter === "party" && currentParty !== prevParty);
                      
                      return (
                        <React.Fragment key={office.officeId}>
                          {isNewPartyGroup && governmentFilter === "party" && (
                            <div className="party-group-header" style={{ gridColumn: "1 / -1" }}>
                              <span className="party-group-name" style={{ color: politician?.partyColor || "#888" }}>
                                {currentParty}
                              </span>
                              <span className="party-group-count">
                                ({filteredCouncilMembers.filter(o => {
                                  const p = getUpdatedPolitician(o.holder);
                                  return (p?.partyName || "Independent") === currentParty;
                                }).length} members)
                              </span>
                            </div>
                          )}
                          <div className="council-member-card">
                            <div className="member-header">
                              <span className="seat-number">
                                {formatOfficeTitleForDisplay(office, cityName)}
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
                    <p className="no-officials-message">No council members currently in office</p>
                  )}
                </div>
              </div>
            </div>

                {/* Government Summary Stats */}
                <div className="government-summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Total Positions</span>
                    <span className="stat-value">
                      {(mayorOffice ? 1 : 0) + (viceMayorOffice ? 1 : 0) + councilOffices.length}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Filled Positions</span>
                    <span className="stat-value">
                      {(mayorOffice?.holder ? 1 : 0) + (viceMayorOffice?.holder ? 1 : 0) + councilOffices.filter(o => o.holder).length}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Majority Party</span>
                    <span className="stat-value">
                      {councilPartyComposition.sort((a, b) => b.popularity - a.popularity)[0]?.name || "None"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {governmentSubTab === "departments" && (
              <div className="departments-modern-layout">
                {/* Executive Summary */}
                <div className="info-card exec-summary-card">
                  <div className="summary-header">
                    <div className="summary-title-group">
                      <h3>City Departments</h3>
                      <span className="summary-subtitle">Administrative Structure & Leadership</span>
                    </div>
                    <div className="summary-metrics">
                      <div className="summary-metric">
                        <span className="metric-number">{governmentDepartments?.city?.length || 0}</span>
                        <span className="metric-label">Departments</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          {(governmentDepartments?.city || []).filter(dept => dept.head).length}
                        </span>
                        <span className="metric-label">Filled</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          ${((governmentDepartments?.city || []).reduce((sum, dept) => sum + (dept.budget || 0), 0) / 1000000).toFixed(1)}M
                        </span>
                        <span className="metric-label">Budget</span>
                      </div>
                      <div className="summary-metric">
                        <span className="metric-number">
                          {(governmentDepartments?.city || []).reduce((sum, dept) => sum + (dept.employees || 0), 0).toLocaleString()}
                        </span>
                        <span className="metric-label">Staff</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departments Grid */}
                <div className="departments-grid-container">
                    {governmentDepartments?.city?.length > 0 ? (
                      governmentDepartments.city.map((department) => {
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
                                    <p className="leader-title">{departmentHead.currentOffice?.title || 'Director'}</p>
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
                                  <p className="vacancy-description">Department head appointment required</p>
                                  <button className="vacancy-action">Appoint Director</button>
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
                      <p>Department structure not configured for this city</p>
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
      case "laws":
        return (
          <section className="city-section city-laws-section">
            <h4>Current City Ordinances & Laws</h4>
            {cityLaws &&
            typeof cityLaws === "object" &&
            Object.keys(cityLaws).length > 0 ? (
              <ul className="city-laws-list">
                {Object.entries(cityLaws).map(([key, value]) => (
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
                No specific city laws data available or data is not an object.
                {cityLaws && <span> (Type: {typeof cityLaws}, Keys: {Object.keys(cityLaws || {}).length})</span>}
              </p>
            )}
          </section>
        );
      case "coalitions":
        return (
          <section className="city-section">
            <h4>City Political Coalitions</h4>
            {coalitionData && coalitionData.base ? (
              <>
                <p className="section-description">
                  Major voting blocs and demographic coalitions in {cityName}
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
              <p>No coalition data available for the city.</p>
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

export default CityOverviewTab;
