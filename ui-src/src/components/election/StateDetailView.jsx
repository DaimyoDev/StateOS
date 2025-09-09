// src/components/election/StateDetailView.jsx
import React, { useState, useMemo, useRef } from "react";
import { ELECTORAL_VOTES_BY_STATE } from "../../General Scripts/ElectoralCollegeSystem";

// Import county maps for state detail view
import AlabamaMap from "../../maps/usaCounties/AlabamaMap";
import ArkansasMap from "../../maps/usaCounties/ArkansasMap";
import ArizonaMap from "../../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../../maps/usaCounties/CaliforniaMap";
import ColoradoMap from "../../maps/usaCounties/ColoradoMap";
import DelawareMap from "../../maps/usaCounties/DelawareMap";
import FloridaMap from "../../maps/usaCounties/FloridaMap";
import GeorgiaMap from "../../maps/usaCounties/GeorgiaMap";
import IdahoMap from "../../maps/usaCounties/IdahoMap";
import IllinoisMap from "../../maps/usaCounties/IllinoisMap";
import IndianaMap from "../../maps/usaCounties/IndianaMap";
import IowaMap from "../../maps/usaCounties/IowaMap";
import KansasMap from "../../maps/usaCounties/KansasMap";
import KentuckyMap from "../../maps/usaCounties/KentuckyMap";
import LousianaMap from "../../maps/usaCounties/LousianaMap";
import MaineMap from "../../maps/usaCounties/MaineMap";
import MarylandMap from "../../maps/usaCounties/MarylandMap";
import MassachusettsMap from "../../maps/usaCounties/MassachusettsMap";
import MichiganMap from "../../maps/usaCounties/MichiganMap";
import MinnesotaMap from "../../maps/usaCounties/MinnesotaMap";
import MississippiMap from "../../maps/usaCounties/MississippiMap";
import MissouriMap from "../../maps/usaCounties/MissouriMap";
import MontanaMap from "../../maps/usaCounties/MontanaMap";
import NebraskaMap from "../../maps/usaCounties/NebraskaMap";
import NevadaMap from "../../maps/usaCounties/NevadaMap";
import NewHampshireMap from "../../maps/usaCounties/NewHampshireMap";
import NewJerseyMap from "../../maps/usaCounties/NewJerseyMap";
import NewMexicoMap from "../../maps/usaCounties/NewMexicoMap";
import NewYorkMap from "../../maps/usaCounties/NewYorkMap";
import NorthCarolinaMap from "../../maps/usaCounties/NorthCarolinaMap";
import NorthDakotaMap from "../../maps/usaCounties/NorthDakotaMap";
import OhioMap from "../../maps/usaCounties/OhioMap";
import OklahomaMap from "../../maps/usaCounties/OklahomaMap";
import OregonMap from "../../maps/usaCounties/OregonMap";
import PennyslvaniaMap from "../../maps/usaCounties/PennsylvaniaMap";
import RhodeIslandMap from "../../maps/usaCounties/RhodeIslandMap";
import SouthCarolinaMap from "../../maps/usaCounties/SouthCarolinaMap";
import SouthDakotaMap from "../../maps/usaCounties/SouthDakotaMap";
import TennesseeMap from "../../maps/usaCounties/TennesseeMap";
import TexasMap from "../../maps/usaCounties/TexasMap";
import UtahMap from "../../maps/usaCounties/UtahMap";
import VermontMap from "../../maps/usaCounties/VermontMap";
import VirginiaMap from "../../maps/usaCounties/VirginiaMap";
import WashingtonMap from "../../maps/usaCounties/WashingtonMap";
import WestVirginiaMap from "../../maps/usaCounties/WestVirginiaMap";
import WisconsinMap from "../../maps/usaCounties/WisconsinMap";

import "./StateDetailView.css";

/**
 * State Detail View Component - shows county-level results for a selected state
 */
const StateDetailView = ({
  selectedState,
  candidates,
  onBackToMap,
  countryData,
  setSelectedState,
  election,
}) => {
  const [activeTab, setActiveTab] = useState("map");
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });

  // Find the state and its counties from the election's country data
  const { state, counties } = useMemo(() => {
    if (!selectedState?.stateId || !countryData)
      return { state: null, counties: [] };

    const foundState = countryData.regions?.find(
      (r) => r.id === selectedState.stateId
    );
    if (foundState) {
      const stateCounties = (countryData.secondAdminRegions || [])
        .filter((county) => county.stateId === selectedState.stateId)
        .sort((a, b) => (b.population || 0) - (a.population || 0));
      return { state: foundState, counties: stateCounties };
    }
    return { state: null, counties: [] };
  }, [selectedState?.stateId, countryData]);

  // Store the original state polling for county calculations (before aggregation)
  const originalStatePolling = useRef(null);
  const originalStateId = useRef(null);
  
  // Reset original polling when state changes
  if (selectedState?.stateId !== originalStateId.current) {
    originalStateId.current = selectedState?.stateId;
    originalStatePolling.current = selectedState?.stateResult?.candidatePolling 
      ? new Map(selectedState.stateResult.candidatePolling) 
      : null;
  }

  // Get county results from the electoral college system's state polling overrides
  const countyResults = useMemo(() => {
    if (!counties.length || !selectedState?.stateResult?.candidatePolling) {
      return [];
    }

    // Use the state's actual polling data for county calculations
    const statePolling = selectedState.stateResult.candidatePolling;
    const stateReportingPercent = selectedState.stateResult.reportingPercent || 0;
    const sortedCounties = [...counties].sort((a, b) => (b.population || 0) - (a.population || 0));

    // Simple hash function to generate consistent "random" numbers based on county ID
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return sortedCounties.map((county, index) => {
      const countyPolling = new Map();

      // Generate a consistent seed for this county
      const countySeed = county.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Calculate county reporting based on state reporting percentage
      const countySize = county.population || 10000;
      const sizeBonus = Math.min(15, Math.log10(countySize / 1000) * 5);
      const positionPenalty = index * 8;
      
      let reportingPercent;
      
      if (stateReportingPercent >= 100) {
        reportingPercent = 100;
      } else {
        const baseReporting = Math.max(0, stateReportingPercent * 0.8 - positionPenalty);
        const randomVariation = (seededRandom(countySeed * 123) - 0.5) * 20;
        
        reportingPercent = Math.min(
          Math.min(95, stateReportingPercent * 0.9),
          Math.max(0, baseReporting + sizeBonus + randomVariation)
        );
      }
      
      if (reportingPercent < 0.1) {
        return {
          county,
          reportingPercent: Math.max(0, reportingPercent),
          polling: new Map(),
          winner: null,
          margin: 0,
          winnerPercent: 0,
          totalVotes: 0,
          isReporting: false
        };
      }

      // Calculate the final results (what the county will end up with at 100% reporting)
      const finalCountyPolling = new Map();
      statePolling.forEach(
        (statePercent, candidateId) => {
          const candidateSeed =
            countySeed +
            candidateId
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          let variation = (seededRandom(candidateSeed) - 0.5) * 10;

          // Urban counties might favor different candidates
          const candidate = candidates.find((c) => c.id === candidateId);

          // Add realistic bias based on county demographics and candidate
          if (county.politicalLandscape) {
            const topParty = county.politicalLandscape.reduce(
              (max, p) => (p.popularity > max.popularity ? p : max),
              { popularity: 0 }
            );

            if (candidate?.partyName === topParty.name) {
              variation += 2;
            }
          }

          const countyPercent = Math.max(
            0,
            Math.min(100, statePercent + variation)
          );
          finalCountyPolling.set(candidateId, countyPercent);
        }
      );

      // Calculate current results based on reporting percentage
      const reportingProgress = reportingPercent / 100;
      finalCountyPolling.forEach((finalPercent, candidateId) => {
        const volatilityFactor = (1 - reportingProgress) * 0.3;
        const candidateSeed = countySeed + candidateId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const volatilitySeed = candidateSeed + countySeed + Math.floor(reportingPercent / 10);
        const volatility = (seededRandom(volatilitySeed) - 0.5) * volatilityFactor * 20;
        
        const currentPercent = Math.max(
          0.5,
          Math.min(
            99,
            finalPercent * reportingProgress + 
            finalPercent * (1 - reportingProgress) * (1 + volatility)
          )
        );
        
        countyPolling.set(candidateId, currentPercent);
      });

      // Normalize to 100%
      const total = Array.from(countyPolling.values()).reduce(
        (sum, val) => sum + val,
        0
      );
      if (total > 0) {
        countyPolling.forEach((val, candidateId) => {
          countyPolling.set(candidateId, Math.round((val / total) * 100));
        });
      }

      // Find winner
      let winner = null;
      let maxPercent = 0;
      countyPolling.forEach((percent, candidateId) => {
        if (percent > maxPercent) {
          maxPercent = percent;
          winner = candidates.find((c) => c.id === candidateId);
        }
      });

      // Calculate margin
      const sortedResults = Array.from(countyPolling.entries()).sort(
        ([, a], [, b]) => b - a
      );
      const margin =
        sortedResults.length >= 2
          ? sortedResults[0][1] - sortedResults[1][1]
          : sortedResults[0]?.[1] || 0;

      return {
        county,
        reportingPercent: Math.round(reportingPercent),
        polling: countyPolling,
        winner,
        margin,
        winnerPercent: maxPercent,
        totalVotes: Math.floor(
          Math.min(
            (county.population || 0) * 0.65 * 
            ((election?.voterTurnoutPercentage || 60) / 100),
            500000
          ) * (reportingPercent / 100)
        ),
        isReporting: true
      };
    });
  }, [counties, candidates, selectedState?.stateId, selectedState?.stateResult?.candidatePolling, selectedState?.stateResult?.hasStartedReporting, selectedState?.stateResult?.reportingPercent, election?.voterTurnoutPercentage]);

  // Create heatmap data for county map
  const countyHeatmapData = useMemo(() => {
    if (!countyResults.length) return [];

    return countyResults.map((result) => ({
      id: result.county.id,
      color: result.winner?.partyColor || "#cccccc",
      opacity: Math.max(0.4, Math.min(1.0, result.margin / 40)),
      value: result.winner?.name || "No winner",
    }));
  }, [countyResults]);

  // Tooltip handlers for county maps
  const handleCountyHover = (countyGameId, event) => {
    if (event) {
      setTooltip({
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        countyId: countyGameId,
      });
    }
  };

  const handleCountyLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, countyId: null });
  };

  // Get live tooltip content for counties
  const countyTooltipContent = useMemo(() => {
    if (!tooltip.show || !tooltip.countyId) return null;

    const countyResult = countyResults.find(result => result.county.id === tooltip.countyId);
    if (!countyResult) return null;

    const winnerName = countyResult.winner?.name || (countyResult.isReporting ? "Results pending" : "Not yet reported");

    return {
      countyName: countyResult.county.name,
      winner: winnerName,
      margin: `${countyResult.margin?.toFixed(1) || "0.0"}%`,
      polling: countyResult.polling,
      reportingPercent: countyResult.reportingPercent || 0,
      hasStartedReporting: countyResult.isReporting,
      totalVotes: countyResult.totalVotes,
    };
  }, [tooltip.show, tooltip.countyId, countyResults]);

  // Create candidate color mapping for tooltips
  const candidateColors = useMemo(() => {
    const colorMap = new Map();
    candidates.forEach((candidate) => {
      colorMap.set(candidate.id, candidate.partyColor || "#888888");
    });
    return colorMap;
  }, [candidates]);

  // Render appropriate state county map
  const renderStateMap = () => {
    const mapProps = {
      heatmapData: countyHeatmapData,
      viewType: "party_popularity",
      onCountyHover: handleCountyHover,
      onCountyLeave: handleCountyLeave,
    };

    // Map state IDs to their corresponding county map components
    switch (selectedState.stateId) {
      case "USA_AL":
        return <AlabamaMap {...mapProps} />;
      case "USA_AR":
        return <ArkansasMap {...mapProps} />;
      case "USA_AZ":
        return <ArizonaMap {...mapProps} />;
      case "USA_CA":
        return <CaliforniaMap {...mapProps} />;
      case "USA_CO":
        return <ColoradoMap {...mapProps} />;
      case "USA_CT":
        return <ConnecticutMap {...mapProps} />;
      case "USA_DE":
        return <DelawareMap {...mapProps} />;
      case "USA_FL":
        return <FloridaMap {...mapProps} />;
      case "USA_GA":
        return <GeorgiaMap {...mapProps} />;
      case "USA_ID":
        return <IdahoMap {...mapProps} />;
      case "USA_IL":
        return <IllinoisMap {...mapProps} />;
      case "USA_IN":
        return <IndianaMap {...mapProps} />;
      case "USA_IA":
        return <IowaMap {...mapProps} />;
      case "USA_KS":
        return <KansasMap {...mapProps} />;
      case "USA_KY":
        return <KentuckyMap {...mapProps} />;
      case "USA_LA":
        return <LousianaMap {...mapProps} />;
      case "USA_ME":
        return <MaineMap {...mapProps} />;
      case "USA_MD":
        return <MarylandMap {...mapProps} />;
      case "USA_MA":
        return <MassachusettsMap {...mapProps} />;
      case "USA_MI":
        return <MichiganMap {...mapProps} />;
      case "USA_MN":
        return <MinnesotaMap {...mapProps} />;
      case "USA_MS":
        return <MississippiMap {...mapProps} />;
      case "USA_MO":
        return <MissouriMap {...mapProps} />;
      case "USA_MT":
        return <MontanaMap {...mapProps} />;
      case "USA_NE":
        return <NebraskaMap {...mapProps} />;
      case "USA_NV":
        return <NevadaMap {...mapProps} />;
      case "USA_NH":
        return <NewHampshireMap {...mapProps} />;
      case "USA_NJ":
        return <NewJerseyMap {...mapProps} />;
      case "USA_NM":
        return <NewMexicoMap {...mapProps} />;
      case "USA_NY":
        return <NewYorkMap {...mapProps} />;
      case "USA_NC":
        return <NorthCarolinaMap {...mapProps} />;
      case "USA_ND":
        return <NorthDakotaMap {...mapProps} />;
      case "USA_OH":
        return <OhioMap {...mapProps} />;
      case "USA_OK":
        return <OklahomaMap {...mapProps} />;
      case "USA_OR":
        return <OregonMap {...mapProps} />;
      case "USA_PA":
        return <PennyslvaniaMap {...mapProps} />;
      case "USA_RI":
        return <RhodeIslandMap {...mapProps} />;
      case "USA_SC":
        return <SouthCarolinaMap {...mapProps} />;
      case "USA_SD":
        return <SouthDakotaMap {...mapProps} />;
      case "USA_TN":
        return <TennesseeMap {...mapProps} />;
      case "USA_TX":
        return <TexasMap {...mapProps} />;
      case "USA_UT":
        return <UtahMap {...mapProps} />;
      case "USA_VT":
        return <VermontMap {...mapProps} />;
      case "USA_VA":
        return <VirginiaMap {...mapProps} />;
      case "USA_WA":
        return <WashingtonMap {...mapProps} />;
      case "USA_WV":
        return <WestVirginiaMap {...mapProps} />;
      case "USA_WI":
        return <WisconsinMap {...mapProps} />;
      default:
        return (
          <div className="county-map-placeholder">
            County map not available for {selectedState.stateName}
          </div>
        );
    }
  };

  if (!selectedState) return null;

  const { stateId, stateName, stateResult } = selectedState;
  const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

  return (
    <div className="state-detail-view">
      {/* Minimal header with back button only */}
      <div className="state-detail-header">
        <button className="back-button menu-button" onClick={onBackToMap}>
          ← Back to Electoral Map
        </button>
        <div className="state-title">
          <h3>{stateName}</h3>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="state-detail-tabs">
        <button
          className={activeTab === "map" ? "active" : ""}
          onClick={() => setActiveTab("map")}
        >
          County Map
        </button>
        <button
          className={activeTab === "breakdown" ? "active" : ""}
          onClick={() => setActiveTab("breakdown")}
        >
          County Breakdown
        </button>
      </div>

      {/* Tab Content - Map fills available space */}
      <div className="state-tab-content">
        {activeTab === "map" && (
          <div className="county-map-section">{renderStateMap()}</div>
        )}

        {activeTab === "breakdown" && (
          <div className="county-breakdown-section">
            <h4>County Results</h4>
            {selectedState?.stateResult && counties.length > 0 && (
              <div className="county-reporting-status">
                {countyResults.filter(r => r.isReporting).length} of {counties.length} counties reporting results
              </div>
            )}
            <div className="county-results-list">
              {countyResults.length > 0 ? (
                <>
                  {countyResults.map((result) => (
                    <div key={result.county.id} className="county-result-item">
                    <div className="county-header">
                      <span className="county-name">{result.county.name}</span>
                      <span className="county-votes">
                        {result.isReporting 
                          ? `${result.totalVotes.toLocaleString()} votes (${result.reportingPercent}% reporting)`
                          : `${result.reportingPercent}% reporting`
                        }
                      </span>
                    </div>
                    <div className="county-candidates-grid">
                      {result.isReporting ? (
                        Array.from(result.polling.entries())
                          .sort(([, a], [, b]) => b - a)
                          .map(([candidateId, percentage]) => {
                            const candidate = candidates.find(
                              (c) => c.id === candidateId
                            );
                            if (!candidate) return null;
                            const isWinner = candidate.id === result.winner?.id;
                            
                            const candidateVotes = Math.floor((result.totalVotes * percentage) / 100);
                            
                            return (
                            <div 
                              key={candidateId} 
                              className={`county-candidate-row ${isWinner ? 'county-winner' : ''}`}
                            >
                              <div 
                                className="candidate-indicator-small"
                                style={{ backgroundColor: candidate.partyColor }}
                              />
                              <span className="candidate-name-small">
                                {candidate.name}
                                {isWinner && " ✓"}
                              </span>
                              <span className="candidate-votes-small">
                                {candidateVotes.toLocaleString()} ({percentage}%)
                              </span>
                            </div>
                            );
                          })
                      ) : (
                        <div className="county-pending">
                          <span className="pending-text">
                            Results pending...
                          </span>
                        </div>
                      )}
                    </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="no-results">
                  No county results available yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* State Results Summary - moved to bottom */}
      <div className="state-results-summary">
        <div className="state-meta-bottom">
          <span className="electoral-votes">
            {electoralVotes} Electoral Votes
          </span>
          <span className="reporting">
            Reporting: {stateResult.reportingPercent || 0}%
          </span>
        </div>

        {stateResult.hasStartedReporting && stateResult.candidatePolling && (
          <>
            <h4>Statewide Results</h4>
            <div className="candidate-results-grid">
              {Array.from(stateResult.candidatePolling.entries())
                .sort(([, a], [, b]) => b - a)
                .map(([candidateId, percentage]) => {
                  const candidate = candidates.find(
                    (c) => c.id === candidateId
                  );
                  if (!candidate) return null;

                  return (
                    <div key={candidateId} className="candidate-result-card">
                      <div
                        className="candidate-indicator"
                        style={{ backgroundColor: candidate.partyColor }}
                      />
                      <div className="candidate-info">
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-party">
                          ({candidate.partyName || "Independent"})
                        </div>
                      </div>
                      <div className="candidate-percentage">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>
            {stateResult.winner && stateResult.showResults && (
              <div className="state-winner-banner">
                <strong>🏆 Winner: {stateResult.winner.name}</strong>
                <span className="winner-margin">
                  {" "}
                  (Margin: {stateResult.margin?.toFixed(1)}%)
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* County Tooltip */}
      {tooltip.show && countyTooltipContent && (
        <div
          className="county-map-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div className="tooltip-header">
            <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "14px" }}>
              {countyTooltipContent.countyName}
            </div>
            <div style={{ fontSize: "12px", marginBottom: "8px", color: "var(--secondary-text, #666)" }}>
              {countyTooltipContent.totalVotes > 0 
                ? `${countyTooltipContent.totalVotes.toLocaleString()} votes (${countyTooltipContent.reportingPercent}% reporting)`
                : `${countyTooltipContent.reportingPercent}% reporting`
              }
            </div>
          </div>
          
          {countyTooltipContent.hasStartedReporting && countyTooltipContent.winner !== "Results pending" && (
            <div className="tooltip-margin" style={{ marginBottom: "6px", fontSize: "12px" }}>
              Winner: <strong>{countyTooltipContent.winner}</strong> (Margin: <strong>{countyTooltipContent.margin}</strong>)
            </div>
          )}
          
          {countyTooltipContent.polling && countyTooltipContent.hasStartedReporting && (
            <div className="tooltip-polling">
              {Array.from(countyTooltipContent.polling.entries())
                .sort(([, a], [, b]) => b - a)
                .map(([candidateId, percentage]) => {
                  const candidate = candidates.find(c => c.id === candidateId);
                  if (!candidate) return null;
                  
                  const candidateVotes = Math.floor((countyTooltipContent.totalVotes * percentage) / 100);
                  
                  return (
                    <div key={candidateId} className="polling-item" style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "3px",
                      fontSize: "12px"
                    }}>
                      <span style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px"
                      }}>
                        <div style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          backgroundColor: candidateColors.get(candidateId),
                          border: "1px solid rgba(0,0,0,0.2)",
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.8) inset"
                        }} />
                        <span>{candidate.name}</span>
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        {candidateVotes.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })
              }
            </div>
          )}
          
          {!countyTooltipContent.hasStartedReporting && (
            <div style={{ fontSize: "12px", color: "#ccc", textAlign: "center" }}>
              Results pending...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StateDetailView;