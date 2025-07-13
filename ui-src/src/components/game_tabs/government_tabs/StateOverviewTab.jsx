// ui-src/src/components/game_tabs/government_tabs/StateOverviewTab.jsx
import React, { useState, useMemo, useCallback } from "react";
import "./GovernmentSubTabStyles.css";
import "./CityOverviewTab.css"; // Ensure this is imported for consistent styling
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
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
        (office.stateId === activeState?.id ||
          office.prefectureId === activeState?.id ||
          office.provinceId === activeState?.id) &&
        office.officeNameTemplateId &&
        (office.officeNameTemplateId.includes("governor") ||
          office.officeNameTemplateId.includes("premier") ||
          office.officeNameTemplateId.includes("chief_minister")) &&
        office.holder
    );
  }, [activeState, allGovernmentOffices]);

  // New: Memoized list of all relevant state-level legislative offices (bodies or individual seats)
  const allStateLegislativeOffices = useMemo(() => {
    if (!activeState || !allGovernmentOffices.length) return [];

    console.log(allGovernmentOffices);

    return allGovernmentOffices.filter(
      (office) =>
        (office.stateId?.includes(activeState.id) ||
          office.prefectureId === activeState.id ||
          office.provinceId === activeState.id) &&
        !office.officeNameTemplateId?.includes("mayor") && // Exclude city mayors
        !(
          office.level?.includes("local_city") ||
          office.level?.includes("city_district")
        ) && // Exclude other city-level
        (office.level?.includes("state") ||
          office.level?.includes("prefecture") ||
          office.level?.includes("province") || // It's state/pref/prov level
          office.level?.includes("house") ||
          office.level?.includes("senate") ||
          office.level?.includes("assembly") ||
          office.level?.includes("parliament") ||
          office.level?.includes("board")) && // Include specific legislative keywords
        (office.holder || (office.members && office.members.length > 0)) // Must have a holder (for a seat) or members (for a body)
    );
  }, [activeState, allGovernmentOffices]);

  // Separate memo for legislative bodies (e.g., "House of Representatives")
  const legislativeBodies = useMemo(() => {
    return allStateLegislativeOffices
      .filter(
        (office) => office.members && office.members.length > 0 // Only offices with a 'members' array
      )
      .sort((a, b) => a.officeName.localeCompare(b.officeName)); // Sort for consistent order
  }, [allStateLegislativeOffices]);

  // Separate memo for individual legislative seats (e.g., "State Representative - District X")
  const individualLegislativeSeats = useMemo(() => {
    return allStateLegislativeOffices
      .filter(
        (office) => !office.members && office.holder // Only offices with a 'holder' but no 'members' array
      )
      .sort((a, b) => {
        // Sort by office name, potentially numerical part if present
        const nameA = a.officeName || "";
        const nameB = b.officeName || "";
        const numA = parseInt(nameA.match(/\d+/)?.[0]);
        const numB = parseInt(nameB.match(/\d+/)?.[0]);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return nameA.localeCompare(nameB);
      });
  }, [allStateLegislativeOffices]);

  // Memoized legislative composition for charts (now combining members from all relevant offices)
  const legislativeCompositionByParty = useMemo(() => {
    const partyData = {};

    // Aggregate from legislative bodies
    legislativeBodies.forEach((chamber) => {
      chamber.members.forEach((member) => {
        const partyName = member.partyName || "Independent/Other";
        const partyKey = member.partyId || partyName;
        if (!partyData[partyKey]) {
          partyData[partyKey] = {
            count: 0,
            color: member.partyColor || "#CCCCCC",
            id: member.partyId || partyKey,
            name: partyName,
          };
        }
        partyData[partyKey].count++;
      });
    });

    // Aggregate from individual legislative seats
    individualLegislativeSeats.forEach((seat) => {
      const holder = seat.holder;
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
  }, [legislativeBodies, individualLegislativeSeats]);

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
      }

      const officeNameLower = processedOfficeName.toLowerCase();

      // Handle Governor/Premier/Chief Minister
      if (
        office.officeNameTemplateId &&
        (office.officeNameTemplateId.includes("governor") ||
          office.officeNameTemplateId.includes("premier") ||
          office.officeNameTemplateId.includes("chief_minister"))
      ) {
        return office.officeName; // Use full office name like "Governor of X" or "Premier of Y"
      }

      // Handle Legislative Bodies/Seats
      if (
        office.level?.includes("state") ||
        office.level?.includes("prefecture") ||
        office.level?.includes("province")
      ) {
        if (office.members && office.members.length > 0) {
          // It's a body
          return office.officeName; // Use the full name like "House of Representatives"
        } else {
          // It's an individual seat
          const seatMatch = processedOfficeName.match(
            /(?:District|Const\.|Constituency|Distrito|Ward)\s*([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)/i
          );
          if (seatMatch && seatMatch[1]) {
            // Return something like "State Representative - District X"
            if (
              officeNameLower.includes("representative") ||
              officeNameLower.includes("rep")
            ) {
              return `Representative - ${seatMatch[0]}`;
            } else if (officeNameLower.includes("senator")) {
              return `Senator - ${seatMatch[0]}`;
            } else if (
              officeNameLower.includes("member") ||
              officeNameLower.includes("assembly")
            ) {
              return `Member - ${seatMatch[0]}`;
            } else if (officeNameLower.includes("provincial board member")) {
              return `Provincial Board Member - ${seatMatch[0]}`;
            }
            return `${office.officeName}`; // Fallback if no specific role found
          }
          // Fallback for individual seats if no district info found
          if (
            officeNameLower.includes("representative") ||
            officeNameLower.includes("rep")
          )
            return "State Representative";
          if (officeNameLower.includes("senator")) return "State Senator";
          if (
            officeNameLower.includes("member") ||
            officeNameLower.includes("assembly")
          )
            return "Assembly Member";
          if (officeNameLower.includes("provincial board member"))
            return "Provincial Board Member";
          return office.officeName; // Generic name for a seat
        }
      }

      return processedOfficeName;
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
              <h4>Core Vitals & Profile</h4>
              <div className="city-stats-grid three-col">
                <div className="stat-item">
                  <strong>Type:</strong>{" "}
                  <span>{regionType === "state" ? "State" : "Prefecture"}</span>
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
              <h4>Citizen Wellbeing & Concerns</h4>
              <div className="city-stats-grid one-col">
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
        return (
          <section className="city-section">
            <h4>Public Services & Infrastructure Ratings</h4>
            <div className="city-stats-grid three-col">
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
                <h4>{regionType} Budget & Taxes (Annual Estimate)</h4>
                <div className="city-stats-grid two-col budget-summary-grid">
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
            <h4>{regionType} Government & Legislature</h4>
            <div className="officials-layout">
              <div className="officials-list-container">
                {governorOffice && governorOffice.holder ? (
                  <div className="official-entry executive-entry">
                    <strong>
                      {formatOfficeTitleForDisplay(governorOffice, stateName)}:{" "}
                    </strong>
                    <span
                      className="politician-name-link"
                      onClick={() =>
                        handlePoliticianClick(governorOffice.holder)
                      }
                      title={`View profile of ${governorOffice.holder.name}`}
                    >
                      {governorOffice.holder.name}
                    </span>
                    {governorOffice.holder.partyName &&
                      ` (${governorOffice.holder.partyName})`}
                  </div>
                ) : (
                  <p>Executive leader information not available or vacant.</p>
                )}

                {/* Display aggregated legislative bodies */}
                {legislativeBodies.length > 0 && (
                  <>
                    <h5>Legislative Chambers:</h5>
                    {legislativeBodies.map((chamber) => (
                      <div
                        key={chamber.officeId}
                        className="legislative-chamber-block"
                      >
                        <h6>
                          {formatOfficeTitleForDisplay(chamber, stateName)} (
                          {chamber.members.length} Members)
                        </h6>
                        <ul className="officials-list">
                          {chamber.members.map((member) => (
                            <li key={member.id} className="official-entry">
                              <strong>{member.role || "Member"}: </strong>
                              <span
                                className="politician-name-link"
                                onClick={() => handlePoliticianClick(member)}
                                title={`View profile of ${member.name}`}
                              >
                                {member.name}
                              </span>
                              {member.partyName && ` (${member.partyName})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}

                {/* Display individual legislative seats */}
                {individualLegislativeSeats.length > 0 && (
                  <div className="individual-legislative-seats-block">
                    <h5>Individual Legislative Seats:</h5>
                    <ul className="officials-list">
                      {individualLegislativeSeats.map((seat) => (
                        <li key={seat.officeId} className="official-entry">
                          <strong>
                            {formatOfficeTitleForDisplay(seat, stateName)}:{" "}
                          </strong>
                          <span
                            className="politician-name-link"
                            onClick={() => handlePoliticianClick(seat.holder)}
                            title={`View profile of ${seat.holder.name}`}
                          >
                            {seat.holder.name}
                          </span>
                          {seat.holder.partyName &&
                            ` (${seat.holder.partyName})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Message if no legislative info at all */}
                {legislativeBodies.length === 0 &&
                  individualLegislativeSeats.length === 0 && (
                    <p>
                      No legislative body information available or no seats
                      filled/defined.
                    </p>
                  )}
              </div>

              {/* Party Breakdown Chart (now combines all legislative members) */}
              {legislativeCompositionByParty.length > 0 && (
                <div className="council-pie-chart-container">
                  <h5>Legislature Party Breakdown</h5>
                  <div className="pie-chart-wrapper-council">
                    <CouncilCompositionPieChart
                      councilCompositionData={legislativeCompositionByParty}
                      themeColors={currentTheme?.colors}
                      themeFonts={currentTheme?.fonts}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      case "laws":
        return (
          <section className="city-section city-laws-section">
            <h4>Current {regionType}-Level Legislation</h4>
            {stateLaws &&
            typeof stateLaws === "object" &&
            Object.keys(stateLaws).length > 0 ? (
              <ul className="city-laws-list">
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
      <h2 className="city-main-title">
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
