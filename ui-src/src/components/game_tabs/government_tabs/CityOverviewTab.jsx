import React, { useState, useMemo, useCallback } from "react";
import useGameStore from "../../../store";
import CouncilCompositionPieChart from "../../charts/CouncilCompositionPieChart";
import PoliticianCard from "../../PoliticianCard"; // NEW: Import PoliticianCard
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

const CityOverviewTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [governmentFilter, setGovernmentFilter] = useState("all");

  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const { openViewPoliticianModal } = useGameStore((state) => state.actions);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );

  const { startingCity, governmentOffices = [] } = activeCampaign || {};
  const {
    id: cityId,
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
    publicSafetyRating,
    educationQuality,
    infrastructureState,
    overallCitizenMood,
    unemploymentRate,
    budget,
    environmentRating,
    cultureArtsRating,
  } = stats || {};

  const taxRates = budget?.taxRates;
  const incomeSources = budget?.incomeSources;
  const expenseAllocations = budget?.expenseAllocations;

  const { ageDistribution, educationLevels } = demographics || {};

  const { dominantIndustries, gdpPerCapita } = economicProfile || {};

  const mayorOffice = useMemo(() => {
    if (!governmentOffices || !cityId) return null;
    return governmentOffices.find(
      (office) =>
        office.level.includes("local_city") &&
        office.officeNameTemplateId &&
        office.officeNameTemplateId.includes("mayor") &&
        !office.officeNameTemplateId.includes("vice_mayor") &&
        office.holder &&
        office.cityId === cityId
    );
  }, [governmentOffices, cityId]);

  const viceMayorOffice = useMemo(() => {
    if (!governmentOffices || !cityId) return null;
    return governmentOffices.find(
      (office) =>
        office.level.includes("local_city") &&
        office.officeNameTemplateId &&
        office.officeNameTemplateId.includes("vice_mayor") &&
        office.holder &&
        office.cityId === cityId
    );
  }, [governmentOffices, cityId]);

  const councilOffices = useMemo(() => {
    if (!governmentOffices || governmentOffices.length === 0) return [];

    let allCouncilMembersForDisplay = [];

    governmentOffices.forEach((office) => {
      const isLocalCouncilOffice =
        (office.level === "local_city" ||
          office.level === "city_district" ||
          office.level.includes("council")) &&
        (office.officeNameTemplateId?.includes("city_council") ||
          office.officeNameTemplateId?.includes("city_municipal_council")) &&
        office.cityId === cityId;

      if (isLocalCouncilOffice) {
        if (office.members && office.members.length > 0) {
          office.members.forEach((member, index) => {
            allCouncilMembersForDisplay.push({
              ...office,
              officeId: `${office.officeId}_member_${member.id}`,
              officeName: member.role || `${office.officeName} Member`,
              holder: member,
              _conceptualSeatNumber: index + 1,
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
  }, [governmentOffices, cityId]);

  const councilPartyComposition = useMemo(() => {
    if (!councilOffices || councilOffices.length === 0) return [];
    const partyData = {};
    councilOffices.forEach((office) => {
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
  }, [councilOffices]);

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
  }, [mayorOffice, viceMayorOffice, councilOffices]);

  const filteredOfficials = useMemo(() => {
    if (governmentFilter === "all") {
      return allCityOfficials;
    } else if (governmentFilter === "mayor") {
      return allCityOfficials.filter(
        (o) => o.type === "mayor" || o.type === "vice_mayor"
      );
    } else if (governmentFilter === "council") {
      return allCityOfficials.filter((o) => o.type === "council");
    }
    return [];
  }, [allCityOfficials, governmentFilter]);

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "summary":
        return (
          <>
            <section className="city-section">
              <h4>Core Vitals & Profile</h4>
              <div className="city-stats-grid three-col">
                <div className="stat-item">
                  <strong>Population:</strong>{" "}
                  <span>{population?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="stat-item">
                  <strong>City Type:</strong> <span>{type || "N/A"}</span>
                </div>
                <div className="stat-item">
                  <strong>Wealth Level:</strong> <span>{wealth || "N/A"}</span>
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
                  <strong>Key Local Issues:</strong>
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
                <strong>Healthcare Coverage:</strong>{" "}
                <span className="stat-descriptor">
                  {formatPercentage(stats.healthcareCoverage, 1)}
                </span>
              </div>
              <div className="stat-item">
                {" "}
                <strong>Cost Per Person (Healthcare):</strong>{" "}
                <span className="stat-descriptor">
                  ${stats.healthcareCostPerPerson?.toFixed(2) || "N/A"}
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
            <h4>City Government Officials</h4>
            <div className="government-filter-buttons">
              <button
                onClick={() => setGovernmentFilter("all")}
                className={governmentFilter === "all" ? "active" : ""}
              >
                All Officials
              </button>
              <button
                onClick={() => setGovernmentFilter("mayor")}
                className={governmentFilter === "mayor" ? "active" : ""}
              >
                Mayoral Offices
              </button>
              <button
                onClick={() => setGovernmentFilter("council")}
                className={governmentFilter === "council" ? "active" : ""}
              >
                City Council
              </button>
            </div>

            <div className="officials-cards-grid">
              {filteredOfficials.length > 0 ? (
                filteredOfficials.map((office) => (
                  <PoliticianCard
                    key={office.officeId}
                    office={office}
                    politician={office.holder}
                    currentLocationName={cityName} // Pass cityName here
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

            {governmentFilter !== "mayor" && (
              <>
                {councilPartyComposition.length > 0 && (
                  <div className="council-pie-chart-container">
                    <h5>Council Party Breakdown</h5>
                    <div className="pie-chart-wrapper-council">
                      <CouncilCompositionPieChart
                        councilCompositionData={councilPartyComposition}
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
              </p>
            )}
          </section>
        );
      default:
        return <p>Select a sub-tab to view details.</p>;
    }
  };

  return (
    <div className="city-overview-tab">
      <h2 className="city-main-title">
        {cityName || "City"} - City Management
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
          City Laws
        </button>{" "}
      </div>

      <div className="sub-tab-content-area">{renderSubTabContent()}</div>
    </div>
  );
};

export default CityOverviewTab;
