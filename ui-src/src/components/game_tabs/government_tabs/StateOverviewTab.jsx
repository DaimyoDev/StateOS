import React, { useState, useMemo, useCallback } from "react";
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css"; // Changed from CityOverviewTab.css
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import PoliticianCard from "../../PoliticianCard"; // NEW: Import PoliticianCard
import { COUNTRIES_DATA } from "../../../data/countriesData";
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

const StateOverviewTab = ({ campaignData }) => {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  // NEW: State for filtering government officials within the 'government' tab
  const [governmentFilter, setGovernmentFilter] = useState("all"); // 'all', 'executive', 'legislature'

  const { openViewPoliticianModal } = useGameStore((state) => state.actions);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );

  const playerCountryId = campaignData.countryId;

  const activeState = useMemo(() => {
    let state = null;
    if (playerCountryId) {
      const country = COUNTRIES_DATA.find((c) => c.id === playerCountryId);
      if (country) {
        state = country.regions?.find((r) => r.id === campaignData.regionId);
        if (!state && country.provinces) {
          state = country.provinces.find((p) => p.id === campaignData.regionId);
        }
      }
    }
    return state;
  }, [playerCountryId, campaignData.regionId]);

  const {
    name: stateName,
    population,
    capital,
    demographics,
    economicProfile,
    stats,
    stateLaws,
    type: regionType,
  } = activeState || {};

  const {
    mainIssues = [],
    economicOutlook,
    unemploymentRate,
    overallCitizenMood,
    budget,
    publicSafetyRating,
    educationQuality,
    infrastructureState,
    healthcareQuality,
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

  // Fetch all government offices from campaignData
  const allGovernmentOffices = campaignData.governmentOffices;

  // Memoized Governor/Executive Office
  const governorOffice = useMemo(() => {
    if (!allGovernmentOffices.length) return null;
    return allGovernmentOffices.find(
      (office) =>
        (office.stateId?.includes(activeState?.id) ||
          office.prefectureId?.includes(activeState?.id) ||
          office.provinceId?.includes(activeState?.id)) &&
        office.officeNameTemplateId &&
        (office.officeNameTemplateId.includes("governor") ||
          office.officeNameTemplateId.includes("premier") ||
          office.officeNameTemplateId.includes("chief_minister")) &&
        !office.officeNameTemplateId.includes("lieutenant") &&
        !office.officeNameTemplateId.includes("vice") &&
        office.holder
    );
  }, [activeState, allGovernmentOffices]);

  // NEW: Memoized Lieutenant Governor/Vice Executive Office
  const lieutenantGovernorOffice = useMemo(() => {
    if (!allGovernmentOffices.length) return null;
    return allGovernmentOffices.find(
      (office) =>
        (office.stateId?.includes(activeState?.id) ||
          office.prefectureId?.includes(activeState?.id) ||
          office.provinceId?.includes(activeState?.id)) &&
        office.officeNameTemplateId &&
        (office.officeNameTemplateId.includes("lieutenant") ||
          office.officeNameTemplateId.includes("vice") ||
          office.officeNameTemplateId.includes("deputy")) &&
        office.holder
    );
  }, [activeState, allGovernmentOffices]);

  // NEW: Flattened list of all relevant state-level legislative offices into individual seats/members
  const flattenedLegislativeOffices = useMemo(() => {
    if (!activeState || !allGovernmentOffices.length) return [];

    let allLegislativeMembersForDisplay = [];

    allGovernmentOffices.forEach((office) => {
      const isStateLegislativeOffice =
        (office.stateId?.includes(activeState?.id) ||
          office.prefectureId?.includes(activeState?.id) ||
          office.provinceId?.includes(activeState?.id)) &&
        (office.officeId.includes("state_hr") ||
          office.officeId.includes("state_senate"));

      console.log(office);

      if (isStateLegislativeOffice) {
        console.log(isStateLegislativeOffice);
        if (office.members && office.members.length > 0) {
          // This is a legislative body with a 'members' array
          office.members.forEach((member, index) => {
            allLegislativeMembersForDisplay.push({
              ...office,
              officeId: `${office.officeId}_member_${member.id}`, // Unique ID for this member's 'seat'
              officeName: member.role || `${office.officeName} Member`, // Use member's role or a default
              holder: member, // The member is the 'holder' for this conceptual seat
              _conceptualSeatNumber: index + 1, // Add a conceptual seat number
            });
          });
        } else if (office.holder && office.numberOfSeatsToFill === 1) {
          // This is an individual conceptual seat (single-winner election)
          allLegislativeMembersForDisplay.push({
            ...office, // Use the office as is
            holder: office.holder,
            _conceptualSeatNumber: office.officeName.match(
              /\(Seat (\d+)\)/
            )?.[1]
              ? parseInt(office.officeName.match(/\(Seat (\d+)\)/)[1])
              : undefined,
          });
        }
      }
    });

    // Sort these conceptual legislative offices/members for consistent display
    return allLegislativeMembersForDisplay.sort((a, b) => {
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
  }, [activeState, allGovernmentOffices]);

  // Memoized legislative composition for charts
  const legislativeCompositionByParty = useMemo(() => {
    const partyData = {};
    flattenedLegislativeOffices.forEach((office) => {
      const holder = office.holder;
      if (holder) {
        const partyName = holder.partyName || "Independent/Other";
        const partyKey = holder.partyId || partyName;
        if (!partyData[partyKey]) {
          partyData[partyKey] = {
            count: 0,
            color: holder.partyColor || "#CCCCCC",
            id: holder.partyId || partyKey,
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
  }, [flattenedLegislativeOffices]);

  // NEW: Memoized list of all relevant officials for filtering and display (including executive)
  const allStateOfficials = useMemo(() => {
    const officials = [];
    console.log(governorOffice);
    if (governorOffice && governorOffice.holder) {
      officials.push({
        ...governorOffice,
        holder: governorOffice.holder,
        type: "executive", // Custom type for filtering
      });
    }
    if (lieutenantGovernorOffice && lieutenantGovernorOffice.holder) {
      officials.push({
        ...lieutenantGovernorOffice,
        holder: lieutenantGovernorOffice.holder,
        type: "executive", // Group with governor for filtering
      });
    }
    flattenedLegislativeOffices.forEach((office) => {
      if (office.holder) {
        officials.push({
          ...office,
          holder: office.holder,
          type: "legislature", // Custom type for filtering
        });
      }
    });
    return officials;
  }, [governorOffice, lieutenantGovernorOffice, flattenedLegislativeOffices]);

  // NEW: Filtered list of officials based on governmentFilter state
  const filteredOfficials = useMemo(() => {
    if (governmentFilter === "all") {
      return allStateOfficials;
    } else if (governmentFilter === "executive") {
      return allStateOfficials.filter((o) => o.type === "executive");
    } else if (governmentFilter === "legislature") {
      return allStateOfficials.filter((o) => o.type === "legislature");
    }
    return [];
  }, [allStateOfficials, governmentFilter]);

  const handlePoliticianClick = useCallback(
    (politician) => {
      if (politician && openViewPoliticianModal)
        openViewPoliticianModal(politician);
      else
        console.warn(
          "Politician data missing or action not available for modal.",
          politician
        );
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
          /{stateName}/g,
          currentRegionNameForDisplay
        );
        processedOfficeName = processedOfficeName.replace(
          /{prefectureName}/g,
          currentRegionNameForDisplay
        );
        processedOfficeName = processedOfficeName.replace(
          /{provinceName}/g,
          currentRegionNameForDisplay
        );
        // Attempt to get a short name for display, e.g., TX for Texas
        const stateShortName = currentRegionNameForDisplay
          .substring(0, 3)
          .toUpperCase();
        processedOfficeName = processedOfficeName.replace(
          /{stateShortName}/g,
          stateShortName
        );
      }

      const officeNameLower = processedOfficeName.toLowerCase();

      // Handle Governor/Premier/Chief Minister
      if (
        office.officeNameTemplateId &&
        (office.officeNameTemplateId.includes("governor") ||
          office.officeNameTemplateId.includes("premier") ||
          office.officeNameTemplateId.includes("chief_minister"))
      ) {
        if (
          office.officeNameTemplateId.includes("lieutenant") ||
          office.officeNameTemplateId.includes("vice")
        ) {
          return `Lieutenant ${office.officeName
            .replace(currentRegionNameForDisplay, "")
            .replace(/of\s*/i, "")
            .trim()}`;
        }
        return office.officeName
          .replace(currentRegionNameForDisplay, "")
          .replace(/of\s*/i, "")
          .trim(); // Trim "of StateName"
      }

      // Handle Legislative Bodies/Seats
      // These are already flattened in `flattenedLegislativeOffices` for display as individual cards
      if (
        office.level?.includes("state") ||
        office.level?.includes("prefecture") ||
        office.level?.includes("province")
      ) {
        // Try to extract district/constituency information
        const districtMatch = processedOfficeName.match(
          /(District|Const\.|Constituency|Distrito|Ward)\s*([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)/i
        );
        let districtPart = districtMatch
          ? `${districtMatch[1]} ${districtMatch[2]}`
          : "";

        // Determine general role
        if (officeNameLower.includes("senator")) {
          return `Senator ${districtPart}`.trim();
        } else if (
          officeNameLower.includes("representative") ||
          officeNameLower.includes("rep")
        ) {
          return `Representative ${districtPart}`.trim();
        } else if (
          officeNameLower.includes("member") ||
          officeNameLower.includes("assembly")
        ) {
          return `Assembly Member ${districtPart}`.trim();
        } else if (officeNameLower.includes("provincial board member")) {
          return `Provincial Board Member ${districtPart}`.trim();
        }

        // Fallback for general legislative members if no specific naming convention is matched
        let cleanedName = processedOfficeName;
        // Remove common state-related words or prefixes/suffixes that might be redundant
        if (currentRegionNameForDisplay) {
          const regionRegex = new RegExp(
            `\\b${currentRegionNameForDisplay.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}\\b`,
            "gi"
          );
          cleanedName = cleanedName.replace(regionRegex, "").trim();
        }
        cleanedName = cleanedName
          .replace(/^(State|Provincial|Prefectural|Regional)\s*/i, "")
          .trim();
        cleanedName = cleanedName
          .replace(/\s*(Member|Legislator|Representative|Senator)\s*$/i, "")
          .trim();

        if (cleanedName.length > 0) return cleanedName;
        return "Legislative Member"; // More generic fallback
      }

      return processedOfficeName; // Fallback for other office types
    },
    []
  );

  if (!activeState) {
    return (
      <div className="city-overview-tab">
        <p>
          No state or prefecture data available. Please start a campaign to view
          this information.
        </p>
      </div>
    );
  }

  const renderSubTabContent = () => {
    switch (activeSubTab) {
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
            {" "}
            {/* Using city-officials-section & city-section */}
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
                State Legislature
              </button>
            </div>
            <div className="officials-cards-grid">
              {filteredOfficials.length > 0 ? (
                filteredOfficials.map((office) => (
                  <PoliticianCard
                    key={office.officeId}
                    office={office}
                    politician={office.holder}
                    currentLocationName={stateName} // Pass stateName here
                    formatOfficeTitle={formatOfficeTitleForDisplay}
                    onClick={handlePoliticianClick}
                  />
                ))
              ) : (
                <p className="no-officials-message">
                  No officials to display for this filter.
                </p>
              )}
            </div>
            {governmentFilter !== "executive" && ( // Only show legislative composition if not specifically filtering for executive
              <>
                {legislativeCompositionByParty.length > 0 && (
                  <div className="council-pie-chart-container">
                    {" "}
                    {/* Using council-pie-chart-container */}
                    <h5>Overall Legislature Party Breakdown</h5>
                    <div className="pie-chart-wrapper-council">
                      {" "}
                      {/* Using pie-chart-wrapper-council */}
                      <CouncilCompositionPieChart
                        councilCompositionData={legislativeCompositionByParty}
                        themeColors={currentTheme?.colors}
                        themeFonts={currentTheme?.fonts}
                      />
                    </div>
                  </div>
                )}
              </>
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
              </p>
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
      </div>
      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default StateOverviewTab;
