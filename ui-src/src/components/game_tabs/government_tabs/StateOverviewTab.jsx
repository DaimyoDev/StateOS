import React, { useState, useMemo, useCallback } from "react";
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css"; // Using shared styles
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import PoliticianCard from "../../PoliticianCard";
import { BASE_COUNTRIES_DATA } from "../../../data/countriesData";
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

const StateOverviewTab = ({ campaignData }) => {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [governmentFilter, setGovernmentFilter] = useState("all");

  const { openViewPoliticianModal, getCurrentStateGovernmentOffices, getCoalitionsForEntity } = useGameStore((state) => state.actions);
  
  // Subscribe directly to government offices to force re-render when they change
  const governmentOfficesRaw = useGameStore((state) => state.activeCampaign?.governmentOffices);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const politiciansSoA = useGameStore((state) => state.activeCampaign?.politicians);

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
        return (
          <>
            <section className="city-section">
              {" "}
              {/* Using city-section class */}
              <h4>Core Vitals & Profile</h4>
              <div className="city-stats-grid three-col">
                {" "}
                {/* Using city-stats-grid */}
                <div className="stat-item">
                  <strong>Type:</strong>{" "}
                  <span>
                    {regionType?.toLowerCase() === "state"
                      ? "State"
                      : regionType?.toLowerCase() === "prefecture"
                      ? "Prefecture"
                      : regionType?.toLowerCase() === "province"
                      ? "Province"
                      : "N/A"}
                  </span>
                </div>
                <div className="stat-item">
                  <strong>Population:</strong>{" "}
                  <span>{population?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="stat-item">
                  <strong>Capital:</strong> <span>{capital || "N/A"}</span>
                </div>
                <div className="stat-item">
                  <strong>Economic Outlook:</strong>
                  <span
                    className={`stat-descriptor ${getEconomicOutlookClass(
                      economicOutlook
                    )}`}
                  >
                    {economicOutlook || "N/A"}
                  </span>
                </div>
                <div className="stat-item">
                  <strong>Unemployment:</strong>
                  <span>
                    {unemploymentRate != null
                      ? `${parseFloat(unemploymentRate).toFixed(1)}% `
                      : "N/A"}
                  </span>
                  <span
                    className={`stat-descriptor mood-${getUnemploymentDescriptor(
                      parseFloat(unemploymentRate)
                    )
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    ({getUnemploymentDescriptor(parseFloat(unemploymentRate))})
                  </span>
                </div>
                <div className="stat-item">
                  <strong>GDP per Capita:</strong>{" "}
                  <span>${gdpPerCapita?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="stat-item">
                  <strong>Dominant Industries:</strong>{" "}
                  <span>{dominantIndustries?.join(", ") || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className="city-section">
              {" "}
              {/* Using city-section class */}
              <h4>Citizen Wellbeing & Concerns</h4>
              <div className="city-stats-grid one-col">
                {" "}
                {/* Using city-stats-grid */}
                <div className="stat-item">
                  <strong>Overall Citizen Mood:</strong>
                  <span
                    className={`stat-descriptor ${getMoodClass(
                      overallCitizenMood
                    )}`}
                  >
                    {overallCitizenMood || "N/A"}
                  </span>
                </div>
                <div className="stat-item">
                  <strong>Key Regional Issues:</strong>
                  {mainIssues.length > 0 ? (
                    <ul className="key-issues-list">
                      {mainIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>None Specified</span>
                  )}
                </div>
                <div className="stat-item">
                  <strong>Economic Key Issues:</strong>
                  {economicKeyIssues?.length > 0 ? (
                    <ul className="key-issues-list">
                      {economicKeyIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>None Specified</span>
                  )}
                </div>
              </div>
            </section>
          </>
        );
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
        // --- Render logic for split chambers ---
        const executiveOfficials = allStateOfficials.filter(
          (o) => o.type === "executive"
        );
        const shouldShowLegislature =
          governmentFilter === "all" || governmentFilter === "legislature";
        const shouldShowExecutive =
          governmentFilter === "all" || governmentFilter === "executive";

        return (
          <section className="city-officials-section city-section">
            <h4>{regionType} Government Officials</h4>
            <div className="government-filter-buttons">
              <button
                onClick={() => setGovernmentFilter("all")}
                className={governmentFilter === "all" ? "active" : ""}
              >
                All Officials
              </button>
              <button
                onClick={() => setGovernmentFilter("executive")}
                className={governmentFilter === "executive" ? "active" : ""}
              >
                Executive Branch
              </button>
              <button
                onClick={() => setGovernmentFilter("legislature")}
                className={governmentFilter === "legislature" ? "active" : ""}
              >
                Legislature
              </button>
            </div>

            {shouldShowExecutive && executiveOfficials.length > 0 && (
              <div className="chamber-section">
                <h5>Executive Branch</h5>
                <div className="officials-cards-grid">
                  {executiveOfficials.map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      office={office}
                      politician={getUpdatedPolitician(office.holder)}
                      currentLocationName={stateName}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                      onClick={handlePoliticianClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {shouldShowLegislature && lowerChamberOffices.length > 0 && (
              <div className="chamber-section">
                <h5>{legislatureNames?.lower || "Lower House"}</h5>
                <div className="officials-cards-grid">
                  {lowerChamberOffices.map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      office={office}
                      politician={getUpdatedPolitician(office.holder)}
                      currentLocationName={stateName}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                      onClick={handlePoliticianClick}
                    />
                  ))}
                </div>
                {lowerChamberComposition.length > 0 && (
                  <div className="council-pie-chart-container">
                    <h5>Party Breakdown</h5>
                    <div className="pie-chart-wrapper-council">
                      <CouncilCompositionPieChart
                        councilCompositionData={lowerChamberComposition}
                        themeColors={currentTheme?.colors}
                        themeFonts={currentTheme?.fonts}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {shouldShowLegislature && upperChamberOffices.length > 0 && (
              <div className="chamber-section">
                <h5>{legislatureNames?.upper || "Upper House"}</h5>
                <div className="officials-cards-grid">
                  {upperChamberOffices.map((office) => (
                    <PoliticianCard
                      key={office.officeId}
                      office={office}
                      politician={getUpdatedPolitician(office.holder)}
                      currentLocationName={stateName}
                      formatOfficeTitle={formatOfficeTitleForDisplay}
                      onClick={handlePoliticianClick}
                    />
                  ))}
                </div>
                {upperChamberComposition.length > 0 && (
                  <div className="council-pie-chart-container">
                    <h5>Party Breakdown</h5>
                    <div className="pie-chart-wrapper-council">
                      <CouncilCompositionPieChart
                        councilCompositionData={upperChamberComposition}
                        themeColors={currentTheme?.colors}
                        themeFonts={currentTheme?.fonts}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {filteredOfficials.length === 0 && (
              <p className="no-officials-message">
                No officials to display for this filter.
              </p>
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
              <p>No coalition data available for {stateName}.</p>
            )}
          </section>
        );
      default:
        return <p>Select a sub-tab to view details.</p>;
    }
  };

  return (
    <div className="city-overview-tab ui-panel-body">
      {" "}
      {/* Using city-overview-tab */}
      <h2 className="city-main-title">
        {" "}
        {/* Using city-main-title */}
        {stateName || `${regionType}`} - {regionType} Management
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
          onClick={() => setActiveSubTab("services")}
          className={activeSubTab === "services" ? "active" : ""}
        >
          Services
        </button>
        <button
          onClick={() => setActiveSubTab("budget")}
          className={activeSubTab === "budget" ? "active" : ""}
        >
          Budget & Taxes
        </button>
        <button
          onClick={() => setActiveSubTab("government")}
          className={activeSubTab === "government" ? "active" : ""}
        >
          Government
        </button>
        <button
          onClick={() => setActiveSubTab("laws")}
          className={activeSubTab === "laws" ? "active" : ""}
        >
          {regionType} Laws
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

export default StateOverviewTab;
