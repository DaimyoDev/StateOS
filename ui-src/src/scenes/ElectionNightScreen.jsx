// ui-src/src/scenes/ElectionNightScreen.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import useGameStore from "../store"; //
import "./ElectionNightScreen.css"; //
import WinnerAnnouncementModal from "../components/modals/WinnerAnnouncementModal"; //
import { getRandomInt, calculateAdultPopulation } from "../utils/core"; //
import {
  calculateElectoralCollegeResults,
  isProgressiveReportingComplete,
  ELECTORAL_VOTES_BY_STATE,
  electoralCollegeSystem,
} from "../General Scripts/ElectoralCollegeSystem";
import ElectoralCollegeMap from "../components/ElectoralCollegeMap/ElectoralCollegeMap";
import { calculateCoalitionBasedPolling } from "../elections/candidateManager.js";

// Import county maps for state detail view
import AlabamaMap from "../maps/usaCounties/AlabamaMap";
import ArkansasMap from "../maps/usaCounties/ArkansasMap";
import ArizonaMap from "../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../maps/usaCounties/CaliforniaMap";
import ColoradoMap from "../maps/usaCounties/ColoradoMap";
import DelawareMap from "../maps/usaCounties/DelawareMap";
import FloridaMap from "../maps/usaCounties/FloridaMap";
import GeorgiaMap from "../maps/usaCounties/GeorgiaMap";
import IdahoMap from "../maps/usaCounties/IdahoMap";
import IllinoisMap from "../maps/usaCounties/IllinoisMap";
import IndianaMap from "../maps/usaCounties/IndianaMap";
import IowaMap from "../maps/usaCounties/IowaMap";
import KansasMap from "../maps/usaCounties/KansasMap";
import KentuckyMap from "../maps/usaCounties/KentuckyMap";
import LousianaMap from "../maps/usaCounties/LousianaMap";
import MaineMap from "../maps/usaCounties/MaineMap";
import MarylandMap from "../maps/usaCounties/MarylandMap";
import MassachusettsMap from "../maps/usaCounties/MassachusettsMap";
import MichiganMap from "../maps/usaCounties/MichiganMap";
import MinnesotaMap from "../maps/usaCounties/MinnesotaMap";
import MississippiMap from "../maps/usaCounties/MississippiMap";
import MissouriMap from "../maps/usaCounties/MissouriMap";
import MontanaMap from "../maps/usaCounties/MontanaMap";
import NebraskaMap from "../maps/usaCounties/NebraskaMap";
import NevadaMap from "../maps/usaCounties/NevadaMap";
import NewHampshireMap from "../maps/usaCounties/NewHampshireMap";
import NewJerseyMap from "../maps/usaCounties/NewJerseyMap";
import NewMexicoMap from "../maps/usaCounties/NewMexicoMap";
import NewYorkMap from "../maps/usaCounties/NewYorkMap";
import NorthCarolinaMap from "../maps/usaCounties/NorthCarolinaMap";
import NorthDakotaMap from "../maps/usaCounties/NorthDakotaMap";
import OhioMap from "../maps/usaCounties/OhioMap";
import OklahomaMap from "../maps/usaCounties/OklahomaMap";
import OregonMap from "../maps/usaCounties/OregonMap";
import PennyslvaniaMap from "../maps/usaCounties/PennsylvaniaMap";
import RhodeIslandMap from "../maps/usaCounties/RhodeIslandMap";
import SouthCarolinaMap from "../maps/usaCounties/SouthCarolinaMap";
import SouthDakotaMap from "../maps/usaCounties/SouthDakotaMap";
import TennesseeMap from "../maps/usaCounties/TennesseeMap";
import TexasMap from "../maps/usaCounties/TexasMap";
import UtahMap from "../maps/usaCounties/UtahMap";
import VermontMap from "../maps/usaCounties/VermontMap";
import VirginiaMap from "../maps/usaCounties/VirginiaMap";
import WashingtonMap from "../maps/usaCounties/WashingtonMap";
import WestVirginiaMap from "../maps/usaCounties/WestVirginiaMap";
import WisconsinMap from "../maps/usaCounties/WisconsinMap";

const SIMULATION_SPEEDS = {
  realistic: 300000,
  superSlow: 20000,
  slow: 10000,
  normal: 5000,
  fast: 1500,
};

const generateRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#10AC84",
    "#EE5A24",
    "#0984E3",
    "#6C5CE7",
    "#A29BFE",
    "#FD79A8",
    "#FDCB6E",
    "#E17055",
    "#74B9FF",
    "#81ECEC",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const distributeVoteChunkProportionally = (candidates, voteChunk, coalitionSoA = null, totalPopulation = null) => {
  let processedCandidates;
  
  // Use coalition-based polling if available
  if (coalitionSoA && coalitionSoA.base && coalitionSoA.base.size > 0 && totalPopulation) {
    // Calculate coalition-based polling for realistic vote distribution
    const candidatesWithCoalitionPolling = calculateCoalitionBasedPolling(
      candidates.map(c => ({ ...c, currentVotes: c.currentVotes || 0 })), 
      coalitionSoA, 
      totalPopulation
    );
    processedCandidates = candidatesWithCoalitionPolling.map(c => ({
      ...c,
      basePolling: c.polling || c.baseScore || 1,
    }));
  } else {
    // Fallback to original polling
    processedCandidates = candidates.map((c) => ({
      ...c,
      currentVotes: c.currentVotes || 0,
      basePolling: c.polling || c.baseScore || 1,
    }));
  }

  if (voteChunk <= 0 || processedCandidates.length === 0) {
    return candidates.map((c) => ({ ...c, currentVotes: c.currentVotes || 0 }));
  }

  const candidatesWithChunkWeight = processedCandidates.map((candidate) => {
    const randomPerformanceFactor = 0.7 + Math.random() * 0.6; // Small random swing
    return {
      ...candidate,
      // Ensure basePolling is a positive number for weight calculation
      chunkWeight:
        Math.max(0.1, candidate.basePolling) * randomPerformanceFactor,
    };
  });

  const totalChunkWeight = candidatesWithChunkWeight.reduce(
    (sum, c) => sum + c.chunkWeight,
    0
  );

  let distributedInChunk = 0;

  if (totalChunkWeight > 0) {
    for (let i = 0; i < candidatesWithChunkWeight.length; i++) {
      const candidate = candidatesWithChunkWeight[i];
      const proportionOfChunk = candidate.chunkWeight / totalChunkWeight;
      const votesForCandidateThisChunk = Math.floor(
        proportionOfChunk * voteChunk
      );
      const originalCandidate = processedCandidates.find(
        (pc) => pc.id === candidate.id
      );
      if (originalCandidate) {
        originalCandidate.currentVotes += votesForCandidateThisChunk;
        distributedInChunk += votesForCandidateThisChunk;
      }
    }
  } else if (processedCandidates.length > 0) {
    const equalShare = Math.floor(voteChunk / processedCandidates.length);
    processedCandidates.forEach((candidate) => {
      candidate.currentVotes += equalShare;
      distributedInChunk += equalShare;
    });
  }

  let remainder = voteChunk - distributedInChunk;
  if (remainder > 0 && processedCandidates.length > 0) {
    const sortedForRemainder = candidatesWithChunkWeight.sort(
      (a, b) => b.chunkWeight - a.chunkWeight
    );
    for (let i = 0; i < remainder; i++) {
      const candidateToReceiveRemainder = processedCandidates.find(
        (pc) => pc.id === sortedForRemainder[i % sortedForRemainder.length].id
      );
      if (candidateToReceiveRemainder) {
        candidateToReceiveRemainder.currentVotes++;
      }
    }
  }
  return processedCandidates.map(({ ...rest }) => rest);
};

// State Detail View Component (replaces modal)
const StateDetailView = ({
  selectedState,
  candidates,
  onBackToMap,
  countryData,
  setSelectedState,
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
      console.log(
        `[DEBUG] Found state ${foundState.name} with ${stateCounties.length} counties`
      );
      return { state: foundState, counties: stateCounties };
    }
    console.log(`[DEBUG] State not found: ${selectedState.stateId}`);
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

  // Generate county-level election results based on state results
  const countyResults = useMemo(() => {
    if (
      !counties.length ||
      !candidates.length ||
      !originalStatePolling.current
    )
      return [];

    // Check if state has sufficient reporting to show county results
    const stateReportingPercent = selectedState.stateResult.reportingPercent || 0;
    const hasStartedReporting = selectedState.stateResult.hasStartedReporting || false;
    
    // Only show county results if state has started reporting
    if (!hasStartedReporting) {
      return [];
    }
    
    // All counties show once state starts reporting, but each has its own reporting percentage
    // Sort counties by population (larger counties report faster, like in real elections)
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
      // Larger counties report faster, but are constrained by state's official reporting
      const countySize = county.population || 10000;
      const sizeBonus = Math.min(15, Math.log10(countySize / 1000) * 5); // 0-15% bonus for larger counties
      
      // Position penalty - later counties in sorted order report slower
      const positionPenalty = index * 8; // Each position adds 8% delay
      
      // Counties derive from state reporting with realistic variation
      let reportingPercent;
      
      if (stateReportingPercent >= 100) {
        // When state is at 100%, all counties must also be at 100%
        reportingPercent = 100;
      } else {
        // During progressive reporting, counties lag behind with variation
        const baseReporting = Math.max(0, stateReportingPercent * 0.8 - positionPenalty); // Counties lag state by 20% + position
        const randomVariation = (seededRandom(countySeed * 123) - 0.5) * 20; // -10% to +10% variation
        
        reportingPercent = Math.min(
          Math.min(95, stateReportingPercent * 0.9), // Counties can't exceed 90% of state reporting during progressive phase
          Math.max(0, baseReporting + sizeBonus + randomVariation)
        );
      }
      
      // Counties show gradual reporting from any percentage > 0.1%
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
      originalStatePolling.current.forEach(
        (statePercent, candidateId) => {
          // Add county-specific variation (-5% to +5%) based on county characteristics using seeded random
          // Smaller variation to keep counties closer to state results
          const candidateSeed =
            countySeed +
            candidateId
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          let variation = (seededRandom(candidateSeed) - 0.5) * 10; // Reduced from 30 to 10

          // Urban counties might favor different candidates
          const isUrban = (county.population || 0) > 100000;
          const candidate = candidates.find((c) => c.id === candidateId);

          // Add realistic bias based on county demographics and candidate
          if (county.politicalLandscape) {
            const topParty = county.politicalLandscape.reduce(
              (max, p) => (p.popularity > max.popularity ? p : max),
              { popularity: 0 }
            );

            // If candidate's party matches county's top party, boost slightly
            if (candidate?.partyName === topParty.name) {
              variation += 2; // Reduced from 5 to 2 for more realistic results
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
      // Early results can be more volatile, gradually converging to final results
      const reportingProgress = reportingPercent / 100;
      finalCountyPolling.forEach((finalPercent, candidateId) => {
        // Add volatility for early returns (higher variation when less reporting)
        const volatilityFactor = (1 - reportingProgress) * 0.3; // 0-30% extra variation for early returns
        const candidateSeed = countySeed + candidateId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const volatilitySeed = candidateSeed + countySeed + Math.floor(reportingPercent / 10);
        const volatility = (seededRandom(volatilitySeed) - 0.5) * volatilityFactor * 20;
        
        // Current percentage gradually approaches final percentage as reporting increases
        const currentPercent = Math.max(
          0.5, // Minimum 0.5% to avoid zero percentages
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

      // Calculate margin (difference between 1st and 2nd place)
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
            (county.population || 0) * 0.3 * // 30% of population as eligible voters (more realistic)
            (0.5 + seededRandom(countySeed * 999) * 0.3), // 50-80% turnout 
            500000 // Cap at 500K votes for very large counties
          ) * (reportingPercent / 100) // Scale by reporting percentage
        ),
        isReporting: true
      };
    });
  }, [counties, candidates, selectedState?.stateId, selectedState?.stateResult?.hasStartedReporting, selectedState?.stateResult?.reportingPercent]);

  // Calculate aggregate state polling from county results
  const aggregatedStatePolling = useMemo(() => {
    if (!countyResults.length || !selectedState?.stateResult) return null;

    const reportingCounties = countyResults.filter(c => c.isReporting);
    if (reportingCounties.length === 0) return null;

    // Weight counties by their vote totals
    const totalVotes = reportingCounties.reduce((sum, county) => sum + county.totalVotes, 0);
    if (totalVotes === 0) return null;

    const aggregatedPolling = new Map();
    
    // Initialize all candidates
    candidates.forEach(candidate => {
      aggregatedPolling.set(candidate.id, 0);
    });

    // Aggregate weighted results from reporting counties
    reportingCounties.forEach(countyResult => {
      const countyWeight = countyResult.totalVotes / totalVotes;
      countyResult.polling.forEach((percentage, candidateId) => {
        const current = aggregatedPolling.get(candidateId) || 0;
        aggregatedPolling.set(candidateId, current + (percentage * countyWeight));
      });
    });

    return aggregatedPolling;
  }, [countyResults, candidates]);

  // Update state polling when county results change - done directly in the county calculation
  useEffect(() => {
    if (aggregatedStatePolling && selectedState?.stateResult && setSelectedState) {
      // Stop all recalculations if state is at 100% reporting - results are final
      if (selectedState.stateResult.reportingPercent >= 100) {
        return;
      }
      
      // Check if polling has actually changed to prevent infinite loops
      const currentPolling = selectedState.stateResult.candidatePolling;
      let hasChanged = false;
      
      if (!currentPolling || currentPolling.size !== aggregatedStatePolling.size) {
        hasChanged = true;
      } else {
        for (const [candidateId, newPolling] of aggregatedStatePolling.entries()) {
          const currentValue = currentPolling.get(candidateId) || 0;
          if (Math.abs(newPolling - currentValue) > 0.1) {
            hasChanged = true;
            break;
          }
        }
      }
      
      if (hasChanged) {
        // Calculate winner based on new polling
        let newWinner = null;
        let highestPolling = 0;
        aggregatedStatePolling.forEach((polling, candidateId) => {
          if (polling > highestPolling) {
            highestPolling = polling;
            newWinner = candidates.find(c => c.id === candidateId);
          }
        });
        
        const updatedStateResult = {
          ...selectedState.stateResult,
          candidatePolling: aggregatedStatePolling,
          winner: newWinner
        };
        
        setSelectedState(prev => ({
          ...prev,
          stateResult: updatedStateResult
        }));
      }
    }
  }, [aggregatedStatePolling, candidates, setSelectedState]);

  // Create heatmap data for county map
  const countyHeatmapData = useMemo(() => {
    if (!countyResults.length) return [];

    return countyResults.map((result) => ({
      id: result.county.id,
      color: result.winner?.partyColor || "#cccccc",
      opacity: Math.max(0.4, Math.min(1.0, result.margin / 40)), // Opacity based on margin
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
        countyId: countyGameId, // Store countyId to look up live data
      });
    }
  };

  const handleCountyLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, countyId: null });
  };

  // Get live tooltip content for counties based on current data
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

  // Render appropriate state county map (same pattern as StateDetailsScreen)
  const renderStateMap = () => {
    console.log(
      "[DEBUG] renderStateMap - state:",
      state,
      "stateId:",
      selectedState?.stateId,
      "counties:",
      counties.length
    );

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
                            
                            // Calculate actual vote count for this candidate
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
                  
                  // Calculate vote count for this candidate
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
                        gap: "6px",
                        color: candidateColors.get(candidateId) 
                      }}>
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: candidateColors.get(candidateId)
                        }} />
                        {candidate.name}
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

// Electoral College specific component
const ElectoralCollegeCard = ({
  election,
  simulationSpeed = 5000,
  skipToResults = false,
  isPaused = false,
}) => {
  const { activeCampaign, countryData } = useGameStore();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [selectedState, setSelectedState] = useState(null); // Now for main screen, not modal
  const [projectedStates, setProjectedStates] = useState(new Set());
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [currentProjection, setCurrentProjection] = useState(null);
  const [mapView, setMapView] = useState("results"); // "results", "margin", "projection"

  // Timer for progressive reporting updates - restored but more efficient
  useEffect(() => {
    if (!election?.isElectoralCollege || skipToResults) return;

    // Check if we need to continue updating (if progressive reporting is still in progress)
    let shouldContinueUpdating = true;

    const interval = setInterval(() => {
      // Only trigger updates if progressive reporting might still be happening and not paused
      if (shouldContinueUpdating && !isPaused) {
        // Check if progressive reporting is complete using time-based check
        const timeBasedComplete = isProgressiveReportingComplete();

        if (timeBasedComplete) {
          shouldContinueUpdating = false;
          console.log(
            "[DEBUG] Progressive reporting complete - stopping updates"
          );
          return;
        }

        setUpdateTrigger((prev) => prev + 1);
      }
    }, 3000); // Update every 3 seconds instead of 2 - more efficient but still responsive

    return () => clearInterval(interval);
  }, [election?.isElectoralCollege, skipToResults, isPaused]);

  // Force update when skipToResults changes to true
  useEffect(() => {
    if (skipToResults) {
      console.log(
        "[DEBUG] Skipping to results - forcing Electoral College recalculation"
      );
      // Just trigger recalculation without reset - let useProgressiveReporting=false handle it
      setUpdateTrigger((prev) => prev + 1);
    }
  }, [skipToResults]);

  const electoralResults = useMemo(() => {
    if (!election?.isElectoralCollege || !election.candidates) {
      console.log("[DEBUG] ElectoralCollegeCard: Early return", {
        isElectoralCollege: election?.isElectoralCollege,
        hasCandidates: !!election?.candidates,
        hasActiveCampaign: !!activeCampaign,
      });
      return null;
    }

    // Convert Map to array for calculation
    const candidatesArray = Array.from(election.candidates.values());

    // Use campaign data if available, otherwise use election's embedded data
    let currentCountryData, campaignToUse;

    if (activeCampaign) {
      // Campaign mode - use active campaign data
      currentCountryData = countryData?.[activeCampaign.countryId];
      campaignToUse = activeCampaign;
    } else {
      // Simulation mode - use election's embedded data
      currentCountryData = election.countryData;
      // For Electoral College elections, use hierarchical coalitions if available
      let coalitionSystems = null;
      if (election.hierarchicalCoalitions && election.electionInstanceId) {
        const electionData = election.hierarchicalCoalitions.electionSpecific.get(election.electionInstanceId);
        
        if (electionData && electionData.stateDistributions) {
          // Convert hierarchical state distributions to the format expected by Electoral College system
          coalitionSystems = {};
          for (const [stateId, stateCoalitions] of electionData.stateDistributions) {
            coalitionSystems[`state_${stateId}`] = stateCoalitions;
          }
        }
      }
      
      // Fallback to default coalition system if hierarchical not available
      if (!coalitionSystems && election.coalitionSoA) {
        coalitionSystems = { simulation_default: election.coalitionSoA };
      }
      
      campaignToUse = {
        countryId: election.regionId,
        coalitionSystems: coalitionSystems,
      };
    }

    console.log("[DEBUG] ElectoralCollegeCard: Calculating electoral results", {
      updateTrigger,
      timestamp: new Date().toLocaleTimeString(),
      mode: activeCampaign ? "campaign" : "simulation",
      candidatesCount: candidatesArray.length,
      candidates: candidatesArray.map((c) => ({
        id: c.id,
        name: c.name,
        currentVotes: c.currentVotes,
      })),
      countryId: campaignToUse.countryId,
      hasCountryData: !!currentCountryData,
      hasCoalitionSystems: !!campaignToUse?.coalitionSystems,
      coalitionSystemsKeys: campaignToUse?.coalitionSystems
        ? Object.keys(campaignToUse.coalitionSystems)
        : null,
    });

    const useProgressiveReporting = !skipToResults;
    console.log(
      "[DEBUG] ElectoralCollegeCard: About to calculate with useProgressiveReporting =",
      useProgressiveReporting,
      "skipToResults =",
      skipToResults
    );

    // If skipping to results, reset the system right before calculation to ensure clean slate
    if (
      skipToResults &&
      electoralCollegeSystem &&
      electoralCollegeSystem.reset
    ) {
      console.log(
        "[DEBUG] Resetting Electoral College system before non-progressive calculation"
      );
      electoralCollegeSystem.reset();
    }

    const results = calculateElectoralCollegeResults(
      candidatesArray,
      campaignToUse,
      currentCountryData,
      useProgressiveReporting,
      simulationSpeed
    );

    // Debug logging to see if state percentages are changing
    if (results?.stateResults) {
      const sampleStates = Array.from(results.stateResults.entries()).slice(0, 3);
      console.log("[DEBUG] Sample state results:", sampleStates.map(([stateId, state]) => ({
        state: state.stateName,
        reportingPercent: state.reportingPercent,
        hasStartedReporting: state.hasStartedReporting,
        candidatePolling: state.candidatePolling ? Array.from(state.candidatePolling.entries()) : null,
        winner: state.winner?.name,
        showResults: state.showResults
      })));
    }

    return results;
  }, [
    election,
    activeCampaign,
    countryData,
    updateTrigger,
    simulationSpeed,
    skipToResults,
  ]);

  // Check for completion based on actual results
  useEffect(() => {
    if (!electoralResults?.stateResults || skipToResults) return;

    const allStates = Array.from(electoralResults.stateResults.values());
    const allStatesComplete =
      allStates.length > 0 &&
      allStates.every(
        (state) =>
          state.reportingComplete === true || state.reportingPercent >= 100
      );

    if (allStatesComplete) {
      console.log(
        "[DEBUG] All states at 100% reporting - electoral college complete"
      );
    }
  }, [electoralResults, skipToResults]);

  const electoralSummary = useMemo(() => {
    if (!electoralResults) return { candidates: [], battleground: [] };

    const candidates = [];
    electoralResults.candidateElectoralVotes.forEach((votes, candidateId) => {
      const candidate = Array.from(election.candidates.values()).find(
        (c) => c.id === candidateId
      );
      if (candidate) {
        candidates.push({
          ...candidate,
          electoralVotes: votes,
          percentage: ((votes / 538) * 100).toFixed(1),
        });
      }
    });

    // Sort by electoral votes
    candidates.sort(
      (a, b) => (b.electoralVotes || 0) - (a.electoralVotes || 0)
    );

    // Find battleground states (margin < 5%) but only for states that are reporting
    const battleground = [];
    electoralResults.stateResults.forEach((stateResult, stateId) => {
      if (
        stateResult.hasStartedReporting &&
        stateResult.winner &&
        stateResult.margin < 5
      ) {
        battleground.push(stateResult);
      }
    });

    return { candidates, battleground };
  }, [electoralResults, election.candidates]);

  // Update selectedState when electoral results change
  useEffect(() => {
    if (selectedState && electoralResults?.stateResults) {
      const updatedStateResult = electoralResults.stateResults.get(
        selectedState.stateId
      );
      if (
        updatedStateResult &&
        updatedStateResult !== selectedState.stateResult
      ) {
        setSelectedState((prev) => ({
          ...prev,
          stateResult: updatedStateResult,
        }));
      }
    }
  }, [updateTrigger, electoralResults]);

  // Check for new state projections
  useEffect(() => {
    if (!electoralResults?.stateResults) return;

    electoralResults.stateResults.forEach((stateResult, stateId) => {
      // A state is "called" when it has started reporting, has a clear winner, and sufficient reporting/margin
      // Make projection criteria more strict to avoid early calls
      const canCall =
        stateResult.hasStartedReporting &&
        stateResult.winner &&
        stateResult.reportingPercent >= 60 && // At least 60% reporting (was 25%)
        (stateResult.margin > 20 || stateResult.reportingPercent >= 95); // Very high margin OR almost complete

      if (canCall && !projectedStates.has(stateId)) {
        const stateName = stateResult.stateName || `State ${stateId}`;

        // Add to projected states
        setProjectedStates((prev) => new Set([...prev, stateId]));

        // Show projection modal
        setCurrentProjection({
          stateName,
          stateId,
          winner: stateResult.winner,
          electoralVotes: ELECTORAL_VOTES_BY_STATE[stateId] || 0,
          margin: stateResult.margin,
          reportingPercent: stateResult.reportingPercent,
        });
        setShowProjectionModal(true);
      }
    });
  }, [electoralResults, projectedStates]);

  if (!election?.isElectoralCollege) {
    return <FeaturedElectionCard election={election} />;
  }

  return (
    <div
      className={`election-card electoral-college-card ${
        election.isComplete ? "complete" : "in-progress"
      }`}
    >
      <h2 className="important-heading">{election.officeName}</h2>

      {/* Map View Controls - moved to top */}
      <div className="electoral-map-controls">
        <h4>Map View</h4>
        <div className="view-buttons">
          <button
            onClick={() => setMapView("results")}
            className={`view-button ${mapView === "results" ? "active" : ""}`}
          >
            Results
          </button>
          <button
            onClick={() => setMapView("margin")}
            className={`view-button ${mapView === "margin" ? "active" : ""}`}
          >
            Margin
          </button>
          <button
            onClick={() => setMapView("projection")}
            className={`view-button ${
              mapView === "projection" ? "active" : ""
            }`}
          >
            Projection
          </button>
        </div>
      </div>

      {/* Interactive Electoral College Map or State Detail View - moved to top */}
      <div className="electoral-map-container">
        {!selectedState ? (
          // National Electoral College Map
          <ElectoralCollegeMap
            electoralResults={electoralResults}
            candidates={Array.from(election.candidates.values())}
            viewMode={mapView}
            onStateClick={(stateId, stateName) => {
              console.log(`Clicked state: ${stateName} (${stateId})`);
              const stateResult = electoralResults?.stateResults?.get(stateId);
              if (stateResult) {
                setSelectedState({ stateId, stateName, stateResult });
              }
            }}
          />
        ) : (
          // State Detail View
          <StateDetailView
            selectedState={selectedState}
            candidates={Array.from(election.candidates.values())}
            onBackToMap={() => setSelectedState(null)}
            countryData={countryData || election.countryData}
            setSelectedState={setSelectedState}
          />
        )}
      </div>

      {/* Electoral Vote Summary - moved below map */}
      <div className="electoral-summary">
        <div className="electoral-vote-bar">
          {electoralSummary.candidates.map((candidate, index) => {
            const width = (candidate.electoralVotes / 538) * 100;
            return (
              <div
                key={candidate.id}
                className="electoral-segment"
                style={{
                  width: `${width}%`,
                  backgroundColor:
                    candidate.partyColor || generateRandomColor(),
                }}
                title={`${candidate.name}: ${candidate.electoralVotes} electoral votes`}
              />
            );
          })}
        </div>

        <div className="electoral-candidates">
          {electoralSummary.candidates.map((candidate) => (
            <div key={candidate.id} className="electoral-candidate">
              <div
                className="candidate-indicator"
                style={{
                  backgroundColor:
                    candidate.partyColor || generateRandomColor(),
                }}
              />
              <span className="candidate-name">{candidate.name}</span>
              <span className="electoral-votes">
                {candidate.electoralVotes}
              </span>
              <span className="electoral-percentage">
                ({candidate.percentage}%)
              </span>
            </div>
          ))}
        </div>

        <div className="electoral-status">
          <span className="needed-to-win">270 to win</span>
          {electoralResults?.winner && (
            <span className="projected-winner">
              Winner:{" "}
              {Array.from(election.candidates.values()).find(
                (c) => c.id === electoralResults.winner.id
              )?.name || electoralResults.winner.id}
            </span>
          )}
        </div>
      </div>

      {/* Battleground States - now below electoral summary */}
      {electoralSummary.battleground.length > 0 && (
        <div className="battleground-states">
          <h4>Key Battleground States</h4>
          <div className="battleground-list">
            {electoralSummary.battleground.slice(0, 5).map((state) => (
              <div key={state.stateId} className="battleground-state">
                <span className="state-name">{state.stateName}</span>
                <span className="state-ev">{state.electoralVotes} EV</span>
                <span className="state-margin">{state.margin.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State Projection Modal */}
      {currentProjection && (
        <WinnerAnnouncementModal
          isOpen={showProjectionModal}
          onClose={() => {
            setShowProjectionModal(false);
            setCurrentProjection(null);
          }}
          winnerData={{
            officeName: `${currentProjection.stateName} (${currentProjection.electoralVotes} EV)`,
            winners: [
              {
                id: currentProjection.winner.id,
                name: currentProjection.winner.name,
                partyName: currentProjection.winner.partyName,
                partyColor: currentProjection.winner.partyColor,
              },
            ],
            electoralSystem: "ElectoralCollege",
            margin: currentProjection.margin,
            reportingPercent: currentProjection.reportingPercent,
            isStateProjection: true,
          }}
        />
      )}
    </div>
  );
};

const FeaturedElectionCard = ({ election }) => {
  const candidateColors = useMemo(() => {
    if (!election?.candidates) return {};
    const colorMap = {};
    election.candidates.forEach((candidate) => {
      if (
        candidate.partyName === "Independent" ||
        !candidate.partyName ||
        candidate.partyColor === "#888888" ||
        candidate.partyColor === "#CCCCCC"
      ) {
        const randomColor = generateRandomColor();
        colorMap[candidate.id] = randomColor;
      }
    });
    return colorMap;
  }, [election?.id]);

  const sortedCandidates = useMemo(() => {
    if (!election?.candidates || election.candidates.length === 0) return [];
    return [...election.candidates]
      .map((c) => ({ ...c, currentVotes: c.currentVotes || 0 }))
      .sort((a, b) => (b.currentVotes || 0) - (a.currentVotes || 0));
  }, [election?.candidates]);

  const projectedWinners = useMemo(() => {
    if (!election?.isComplete || !sortedCandidates.length) return [];
    const seats = election.numberOfSeatsToFill || 1;
    return sortedCandidates.slice(0, seats);
  }, [election?.isComplete, sortedCandidates, election?.numberOfSeatsToFill]);

  if (!election) {
    return (
      <div className="featured-election-placeholder">
        Select an election to view details.
      </div>
    );
  }

  const currentTotalVotesInCard =
    election.candidates?.reduce((sum, c) => sum + (c.currentVotes || 0), 0) ||
    0;

  return (
    <div
      className={`election-card featured-election-card ${
        election.isComplete ? "complete" : "in-progress"
      }`}
    >
      <h2 className="important-heading">{election.officeName}</h2>
      <div className="election-progress-details">
        <p>Reporting: {election.percentReported?.toFixed(0) ?? 0}%</p>
        <div className="reporting-bar-container">
          <div
            className="reporting-bar"
            style={{ width: `${election.percentReported ?? 0}%` }}
          ></div>
        </div>
        {election.totalEligibleVoters != null && (
          <p>
            Eligible Voters:{" "}
            {(election.totalEligibleVoters || 0).toLocaleString()}
          </p>
        )}
        {election.voterTurnoutPercentage != null && (
          <p>Expected Turnout: {election.voterTurnoutPercentage.toFixed(1)}%</p>
        )}
        <p>
          Total Expected Votes:{" "}
          {(election.totalExpectedVotes || 0).toLocaleString()}
        </p>
        {(election.numberOfSeatsToFill || 1) > 1 && (
          <p>Seats to Fill: {election.numberOfSeatsToFill}</p>
        )}
      </div>
      <h3 className="results-title">Current Results:</h3>
      {(election.electoralSystem === "PartyListPR" ||
        election.electoralSystem === "MMP") &&
        election.candidates?.every((c) => c.isListCandidate) && (
          <p className="system-note">
            <i>
              Live results show individual performance; party-based allocation
              determines final PR/List MPs.
            </i>
          </p>
        )}
      <ul className="results-list">
        {sortedCandidates.map((candidate) => {
          const percentage =
            currentTotalVotesInCard > 0
              ? ((candidate.currentVotes || 0) / currentTotalVotesInCard) * 100
              : 0;
          const isProjectedWinnerInCard = projectedWinners.some(
            (w) => w.id === candidate.id
          );
          return (
            <li
              key={candidate.id}
              className={`candidate-result ${
                isProjectedWinnerInCard && !election.isComplete
                  ? "winning-position-mmd"
                  : ""
              } ${
                isProjectedWinnerInCard && election.isComplete
                  ? "winner-final"
                  : ""
              }`}
            >
              <span
                className="candidate-name politician-name-link"
                title={`View profile of ${candidate.name}`}
              >
                {candidate.name}
                {isProjectedWinnerInCard &&
                  !election.isComplete &&
                  (election.numberOfSeatsToFill || 1) > 1 && (
                    <span className="winning-indicator-live"> (Leading)</span>
                  )}
                {isProjectedWinnerInCard && election.isComplete && (
                  <span className="winning-indicator-final"> (Elected)</span>
                )}
              </span>
              <span className="party-name">
                {" "}
                ({candidate.partyName || "Independent"})
              </span>
              <span className="vote-count">
                {" "}
                {(candidate.currentVotes || 0).toLocaleString()} votes (
                {percentage.toFixed(1)}%)
              </span>
              <div
                className="vote-bar-container"
                title={`${percentage.toFixed(1)}%`}
              >
                <div
                  className="vote-bar"
                  style={{
                    width: `${Math.min(100, percentage)}%`,
                    backgroundColor: (() => {
                      const finalColor =
                        candidateColors[candidate.id] ||
                        candidate.partyColor ||
                        "var(--disabled-bg, #ccc)";
                      return finalColor;
                    })(),
                  }}
                ></div>
              </div>
            </li>
          );
        })}
      </ul>
      {election.isComplete && (
        <div className="winner-announcement">
          {projectedWinners.length > 0 ? (
            <>
              <strong>
                Projected Winner{projectedWinners.length > 1 ? "s" : ""}:
              </strong>
              {projectedWinners.length === 1 ? (
                <span
                  className="politician-name-link"
                  title={`View profile of ${projectedWinners[0].name}`}
                >
                  {" "}
                  {projectedWinners[0].name} (
                  {projectedWinners[0].partyName || "Independent"})
                </span>
              ) : (
                <ul className="projected-winners-list">
                  {projectedWinners.map((winner) => (
                    <li key={winner.id}>
                      <span
                        className="politician-name-link"
                        title={`View profile of ${winner.name}`}
                      >
                        {winner.name}
                      </span>{" "}
                      ({winner.partyName || "Independent"})
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <strong>
              {election.candidates?.length > 0
                ? "Results Certified / No Clear Winner(s)"
                : "No Candidates Ran"}
            </strong>
          )}
        </div>
      )}
    </div>
  );
};

const ElectionListItem = ({ election, onSelect, isSelected }) => {
  // For Electoral College elections, don't show individual vote counts - show electoral progress
  if (election.isElectoralCollege) {
    return (
      <li
        className={`election-list-sidebar-item ${
          isSelected ? "selected" : ""
        } ${election.isComplete ? "complete" : "in-progress"}`}
        onClick={() => onSelect(election.id)}
      >
        <div className="election-list-item-header">
          <strong>{election.officeName}</strong>
          <span> (Electoral College)</span>
        </div>
        <div className="election-list-item-leader">
          States reporting results...
        </div>
      </li>
    );
  }

  // Regular elections - show vote counts as before
  const leadingCandidate =
    election.candidates?.length > 0
      ? [...election.candidates].sort(
          (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
        )[0]
      : null;
  return (
    <li
      className={`election-list-sidebar-item ${isSelected ? "selected" : ""} ${
        election.isComplete ? "complete" : "in-progress"
      }`}
      onClick={() => onSelect(election.id)}
    >
      <div className="election-list-item-header">
        <strong>{election.officeName}</strong>
        <span> ({election.percentReported?.toFixed(0) ?? 0}% Rep.)</span>
      </div>
      {leadingCandidate && (leadingCandidate.currentVotes || 0) > 0 && (
        <div className="election-list-item-leader">
          Leading: {leadingCandidate.name} (
          {(leadingCandidate.currentVotes || 0).toLocaleString()} votes)
        </div>
      )}
      {(!leadingCandidate || (leadingCandidate.currentVotes || 0) === 0) &&
        election.candidates?.length > 0 &&
        !election.isComplete && (
          <div className="election-list-item-leader">Vote counting...</div>
        )}
      {election.isComplete &&
        (!leadingCandidate || (leadingCandidate.currentVotes || 0) === 0) &&
        election.candidates?.length > 0 && (
          <div className="election-list-item-leader">Results complete.</div>
        )}
      {(election.candidates?.length || 0) === 0 && (
        <div className="election-list-item-leader">No candidates.</div>
      )}
    </li>
  );
};

const ElectionNightScreen = () => {
  const store = useGameStore(); //
  const activeCampaign = store.activeCampaign;
  const {
    navigateTo,
    openWinnerAnnouncementModal,
    closeWinnerAnnouncementModal,
    openViewPoliticianModal,
    processElectionResults,
    setIsSimulationMode,
    clearSimulatedElections,
  } = store.actions;

  const isWinnerAnnouncementModalOpenGlobal =
    store.isWinnerAnnouncementModalOpen;
  const winnerAnnouncementDataGlobal = store.winnerAnnouncementData;
  const isSimulationMode = store.isSimulationMode;
  const simulatedElections = store.simulatedElections;

  const [liveElections, setLiveElections] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(
    SIMULATION_SPEEDS.normal
  );
  const [isPaused, setIsPaused] = useState(false);
  const [allSimulationsComplete, setAllSimulationsComplete] = useState(false);
  const allSimulationsCompleteRef = React.useRef(allSimulationsComplete);
  const [featuredElectionId, setFeaturedElectionId] = useState(null);
  const [winnerAnnouncementQueue, setWinnerAnnouncementQueue] = useState([]);
  const [skipElectoralToResults, setSkipElectoralToResults] = useState(false);
  const [electionStartTime, setElectionStartTime] = useState(null);

  useEffect(() => {
    allSimulationsCompleteRef.current = allSimulationsComplete;
  }, [allSimulationsComplete]);

  const electionDateForThisScreen = useMemo(() => {
    if (isSimulationMode && simulatedElections.length > 0) {
      return simulatedElections[0].electionDate;
    }
    return activeCampaign?.viewingElectionNightForDate;
  }, [
    isSimulationMode,
    simulatedElections,
    activeCampaign?.viewingElectionNightForDate,
  ]);

  useEffect(() => {
    // Determine which set of elections to use: simulated or campaign
    const currentElectionsToLoad = isSimulationMode
      ? simulatedElections
      : activeCampaign?.elections;

    if (currentElectionsToLoad && electionDateForThisScreen) {
      const electionsToday = currentElectionsToLoad.filter(
        (e) =>
          e.electionDate.year === electionDateForThisScreen.year &&
          e.electionDate.month === electionDateForThisScreen.month &&
          e.electionDate.day === electionDateForThisScreen.day &&
          e.outcome?.status === "upcoming"
      );

      const initialSimData = electionsToday.map((election) => {
        let turnoutForSim = election.voterTurnoutPercentage;
        // If turnout is not explicitly set or is out of a reasonable range, generate a random one
        if (turnoutForSim == null || turnoutForSim < 5 || turnoutForSim > 95) {
          turnoutForSim = getRandomInt(30, 70); //
        }
        const eligibleVotersForSim =
          election.totalEligibleVoters ||
          Math.floor(
            ((election.entityDataSnapshot?.population || 1000) *
              calculateAdultPopulation(
                //
                1, // This parameter (adult population percentage) seems incorrectly used or is a placeholder in calculateAdultPopulation
                election.entityDataSnapshot?.demographics
              )) /
              (election.entityDataSnapshot?.demographics ? 100 : 1) || 0.7
          );
        const totalExpectedVotes = Math.max(
          0,
          Math.round(eligibleVotersForSim * (turnoutForSim / 100))
        );

        let simEntities = [];

        if (isSimulationMode && election.candidates) {
          simEntities = Array.from(election.candidates.values()).map(
            (entity) => ({
              ...entity,
              currentVotes: 0,
              basePolling: entity.baseScore || entity.polling || 1,
            })
          );

          if (
            election.electoralSystem === "PartyListPR" &&
            simEntities.some((e) => e.isPartyEntity)
          ) {
            election.livePartyResults = simEntities.map((p) => ({
              partyId: p.id,
              partyName: p.name,
              partyColor: p.partyColor,
              currentVotes: 0,
            }));
          }
        } else {
          // Existing logic for campaign elections (PartyListPR, MMP, other systems)
          if (election.electoralSystem === "PartyListPR") {
            console.log(`   PartyListPR: Populating parties for simulation.`);
            if (
              election.partyLists &&
              Object.keys(election.partyLists).length > 0
            ) {
              Object.entries(election.partyLists).forEach(
                ([partyId, individualCandidateListOnParty]) => {
                  const partyInfoFromSnapshots =
                    activeCampaign?.generatedPartiesSnapshot?.find(
                      (p) => p.id === partyId
                    ) ||
                    activeCampaign?.customPartiesSnapshot?.find(
                      (p) => p.id === partyId
                    );

                  const partyName =
                    partyInfoFromSnapshots?.name ||
                    election.partyListDetails?.[partyId]?.name ||
                    `Party ${partyId.slice(-4)}`;
                  const partyColor =
                    partyInfoFromSnapshots?.color ||
                    election.partyListDetails?.[partyId]?.color ||
                    "#888";

                  let partyBasePolling =
                    election.partyListDetails?.[partyId]?.basePopularity ||
                    election.partyListDetails?.[partyId]?.polling ||
                    partyInfoFromSnapshots?.popularity ||
                    10;

                  if (
                    partyBasePolling === 10 &&
                    individualCandidateListOnParty &&
                    individualCandidateListOnParty.length > 0
                  ) {
                    let sumListCandidatePolling = 0;
                    let countListCandidatePolling = 0;
                    individualCandidateListOnParty.forEach((c) => {
                      const candPolling = c.polling || c.baseScore;
                      if (typeof candPolling === "number") {
                        sumListCandidatePolling += candPolling;
                        countListCandidatePolling++;
                      }
                    });
                    if (countListCandidatePolling > 0) {
                      partyBasePolling =
                        sumListCandidatePolling / countListCandidatePolling;
                    }
                  }

                  simEntities.push({
                    id: partyId,
                    name: partyName,
                    partyName: partyName,
                    partyColor: partyColor,
                    currentVotes: 0,
                    basePolling: Math.max(1, partyBasePolling),
                    isPartyEntity: true,
                  });
                }
              );
            }
          } else if (election.electoralSystem === "MMP") {
            if (election.mmpData?.constituencyCandidatesByParty) {
              Object.values(
                election.mmpData.constituencyCandidatesByParty
              ).forEach((list) => {
                if (list && Array.isArray(list))
                  simEntities.push(
                    ...list.map((c) => ({ ...c, isPartyEntity: false }))
                  );
              });
            }
            if (election.mmpData?.independentConstituencyCandidates) {
              simEntities.push(
                ...election.mmpData.independentConstituencyCandidates.map(
                  (c) => ({ ...c, isPartyEntity: false })
                )
              );
            }
            if (simEntities.length === 0 && election.partyLists) {
              Object.values(election.partyLists).forEach((list) => {
                if (list && Array.isArray(list))
                  simEntities.push(
                    ...list.map((c) => ({
                      ...c,
                      isListCandidate: true,
                      isMMPListFallback: true,
                      isPartyEntity: false,
                    }))
                  );
              });
            }
          } else {
            // FIX: Convert the Map from the store to an Array for local state
            simEntities = Array.from(
              (election.candidates || new Map()).values()
            ).map((c) => ({
              ...c,
              isPartyEntity: false,
            }));
          }

          // FIX: The fallback check must now use .size and .values() for the Map
          if (simEntities.length === 0 && election.candidates?.size > 0) {
            simEntities = [...election.candidates.values()].map((c) => ({
              ...c,
              isPartyEntity: false,
            }));
          }
        }

        if (simEntities.length === 0) {
          console.error(
            `---> [SimSetup] FINAL: NO ENTITIES (candidates/parties) for simulation for ${election.officeName}`
          );
        }

        return {
          ...election, // Original election data
          candidates: simEntities.map((entity) => ({
            ...entity,
            currentVotes: 0,
            basePolling:
              entity.basePolling ||
              (simEntities.length > 0
                ? Math.max(1, 100 / simEntities.length)
                : 1),
          })),
          livePartyResults:
            election.electoralSystem === "PartyListPR" &&
            simEntities.some((e) => e.isPartyEntity)
              ? simEntities.map((p) => ({ ...p, currentVotes: 0 }))
              : [],
          totalExpectedVotes,
          percentReported: 0,
          voterTurnoutPercentage: turnoutForSim,
          totalEligibleVoters: eligibleVotersForSim,
          isComplete:
            (totalExpectedVotes === 0 && simEntities.length > 0) ||
            simEntities.length === 0,
          winnerAnnounced: false,
        };
      });

      setLiveElections(initialSimData);
      const allInitiallyComplete = initialSimData.every((e) => e.isComplete);
      setAllSimulationsComplete(allInitiallyComplete);
      allSimulationsCompleteRef.current = allInitiallyComplete;

      // Start the timer when elections are loaded and not complete
      if (!allInitiallyComplete && initialSimData.length > 0) {
        setElectionStartTime(Date.now());
      }

      const currentFeaturedIdInComponentState = featuredElectionId;
      if (initialSimData.length > 0) {
        const featuredStillValid = initialSimData.some(
          (e) => e.id === currentFeaturedIdInComponentState
        );
        if (!featuredStillValid) {
          setFeaturedElectionId(initialSimData[0].id);
        }
      } else {
        setFeaturedElectionId(null);
      }
    } else if (
      isSimulationMode &&
      (!currentElectionsToLoad || currentElectionsToLoad.length === 0)
    ) {
      // If in simulation mode but no elections are loaded, navigate back or show a message.
      console.warn(
        "No simulated elections found in simulation mode. Returning to Election Simulator."
      );
      navigateTo("ElectionSimulatorScreen");
      setIsSimulationMode(false); // Reset simulation mode
      clearSimulatedElections(); // Clear from store
    } else {
      // No campaign or date, so clear everything related to live simulation
      setLiveElections([]);
      setAllSimulationsComplete(true);
      allSimulationsCompleteRef.current = true;
      setFeaturedElectionId(null);
    }
    // Corrected dependencies for useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSimulationMode,
    simulatedElections,
    activeCampaign?.elections,
    electionDateForThisScreen,
    navigateTo,
    setIsSimulationMode,
    clearSimulatedElections,
  ]);

  const createAnnouncementData = useCallback(
    (election, sortedCandidatesFromSim) => {
      const officeName = election.officeName;
      const electionId = election.id;
      const electoralSystem = election.electoralSystem;
      const seatsToFill = election.numberOfSeatsToFill || 1;
      let projectedWinners = [];
      let noCand = false,
        noVote = false;

      if (!sortedCandidatesFromSim || sortedCandidatesFromSim.length === 0) {
        if (
          election.totalExpectedVotes > 0 &&
          election.candidates?.length === 0
        )
          noCand = true;
        else if (
          election.totalExpectedVotes === 0 &&
          election.candidates?.length > 0
        )
          noVote = true;
        else if (
          election.candidates?.length === 0 &&
          election.totalExpectedVotes === 0
        ) {
          noCand = true;
          noVote = true;
        }
      } else {
        projectedWinners = sortedCandidatesFromSim.slice(0, seatsToFill);
      }

      const modalWinners = projectedWinners.map((w) => ({
        id: w.id,
        name: w.name,
        partyName: w.partyName || "Independent",
        partyColor: w.partyColor || "#808080",
      }));

      if (noCand);
      else if (noVote && modalWinners.length === 0);
      else if (modalWinners.length > 0);

      return {
        officeName,
        winners: modalWinners,
        isMultiWinner: seatsToFill > 1,
        electionId,
        electoralSystem,
        noCandidates: noCand,
        noVotes: noVote,
      };
    },
    []
  );

  const runSimulationTick = useCallback(() => {
    setLiveElections((prevElections) => {
      let newLiveElectionsData = prevElections.map((e) => ({
        ...e,
        candidates: e.candidates.map((c) => ({ ...c })),
        livePartyResults: e.livePartyResults
          ? e.livePartyResults.map((pr) => ({ ...pr }))
          : [],
      }));
      let newlyCompletedForQueue = [];

      for (let i = 0; i < newLiveElectionsData.length; i++) {
        const election = newLiveElectionsData[i];

        if (election.isComplete) {
          if (!election.winnerAnnounced) {
            const entitiesForAnnouncement =
              election.electoralSystem === "PartyListPR"
                ? [...(election.livePartyResults || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  )
                : [...(election.candidates || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  );

            const annData = createAnnouncementData(
              election,
              entitiesForAnnouncement
            );
            if (annData) newlyCompletedForQueue.push(annData);
            newLiveElectionsData[i].winnerAnnounced = true;
          }
          continue;
        }

        const currentTotalSimulatedVotes = election.candidates.reduce(
          (s, entity) => s + (entity.currentVotes || 0),
          0
        );

        const remainingVotes = Math.max(
          0,
          election.totalExpectedVotes - currentTotalSimulatedVotes
        );

        let votesThisTick = 0;
        if (
          election.totalExpectedVotes === 0 ||
          election.candidates.length === 0
        ) {
          votesThisTick = 0;
        } else if (remainingVotes > 0) {
          votesThisTick = Math.min(
            remainingVotes,
            Math.max(
              1,
              Math.round(
                election.totalExpectedVotes * ((Math.random() * 1 + 0.5) / 100)
              )
            )
          );
        }

        if (votesThisTick > 0 && election.candidates.length > 0) {
          newLiveElectionsData[i].candidates =
            distributeVoteChunkProportionally(
              election.candidates,
              votesThisTick,
              election.coalitionSoA,
              election.totalEligibleVoters
            );
        }

        if (election.electoralSystem === "PartyListPR") {
          newLiveElectionsData[i].livePartyResults = newLiveElectionsData[
            i
          ].candidates.map((partyEntity) => ({
            partyId: partyEntity.id,
            partyName: partyEntity.name,
            partyColor: partyEntity.partyColor,
            currentVotes: partyEntity.currentVotes || 0,
          }));
        }

        const finalSumOfVotes = (
          election.electoralSystem === "PartyListPR" &&
          newLiveElectionsData[i].livePartyResults.length > 0
            ? newLiveElectionsData[i].livePartyResults
            : newLiveElectionsData[i].candidates
        ).reduce((s, entity) => s + (entity.currentVotes || 0), 0);

        const nowComplete = election.isElectoralCollege
          ? isProgressiveReportingComplete() // For electoral college, check if all states finished reporting
          : (election.electoralSystem === "PartyListPR"
              ? newLiveElectionsData[i].livePartyResults.length === 0
              : newLiveElectionsData[i].candidates.length === 0) ||
            election.totalExpectedVotes === 0 ||
            finalSumOfVotes >= election.totalExpectedVotes;

        if (nowComplete) {
          newLiveElectionsData[i].percentReported = 100;
          newLiveElectionsData[i].isComplete = true;
          if (!election.winnerAnnounced) {
            const entitiesForFinalAnnouncement =
              election.electoralSystem === "PartyListPR"
                ? [...(newLiveElectionsData[i].livePartyResults || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  )
                : [...(newLiveElectionsData[i].candidates || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  );

            const annData = createAnnouncementData(
              newLiveElectionsData[i],
              entitiesForFinalAnnouncement
            );
            if (annData) newlyCompletedForQueue.push(annData);
            newLiveElectionsData[i].winnerAnnounced = true;
          }
        } else if (election.totalExpectedVotes > 0) {
          newLiveElectionsData[i].percentReported = Math.min(
            (finalSumOfVotes / election.totalExpectedVotes) * 100,
            99.9
          );
        } else {
          newLiveElectionsData[i].percentReported = 100;
        }
      }

      if (newlyCompletedForQueue.length > 0) {
        const uniqueItems = newlyCompletedForQueue.filter(
          (item, idx, self) =>
            idx === self.findIndex((t) => t.electionId === item.electionId)
        );
        setWinnerAnnouncementQueue((queue) => {
          const currentIds = new Set(queue.map((item) => item.electionId));
          const toAdd = uniqueItems.filter(
            (item) => !currentIds.has(item.electionId)
          );
          return toAdd.length > 0 ? [...queue, ...toAdd] : queue;
        });
      }

      const allDone = newLiveElectionsData.every((e) => e.isComplete);
      if (allDone !== allSimulationsCompleteRef.current) {
        allSimulationsCompleteRef.current = allDone;
        setAllSimulationsComplete(allDone);
      }

      // Electoral college updates are now handled by the ElectoralCollegeCard component itself
      // via the county polling system - no separate trigger needed

      return newLiveElectionsData;
    });
  }, [createAnnouncementData]);

  useEffect(() => {
    if (
      isPaused ||
      allSimulationsCompleteRef.current ||
      liveElections.length === 0 ||
      isWinnerAnnouncementModalOpenGlobal
    )
      return;
    const timer = setTimeout(runSimulationTick, simulationSpeed);
    return () => clearTimeout(timer);
  }, [
    runSimulationTick,
    isPaused,
    simulationSpeed,
    liveElections,
    isWinnerAnnouncementModalOpenGlobal,
    allSimulationsCompleteRef,
  ]);

  useEffect(() => {
    if (
      winnerAnnouncementQueue.length > 0 &&
      !isWinnerAnnouncementModalOpenGlobal &&
      openWinnerAnnouncementModal
    ) {
      const nextAnnouncement = winnerAnnouncementQueue[0];
      openWinnerAnnouncementModal(nextAnnouncement);
      setWinnerAnnouncementQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [
    winnerAnnouncementQueue,
    isWinnerAnnouncementModalOpenGlobal,
    openWinnerAnnouncementModal,
  ]);

  const handleSkipToResults = useCallback(() => {
    setIsPaused(true);
    setSkipElectoralToResults(true);
    let announcements = [];
    setLiveElections((prev) =>
      prev.map((election) => {
        if (election.isComplete && election.winnerAnnounced) return election;
        const finalCands = distributeVoteChunkProportionally(
          election.candidates.map((c) => ({ ...c, currentVotes: 0 })),
          election.totalExpectedVotes,
          election.coalitionSoA,
          election.totalEligibleVoters
        );
        const sortedCands = [...finalCands].sort(
          (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
        );
        let annData = null;
        if (!election.winnerAnnounced)
          annData = createAnnouncementData(election, sortedCands);
        if (annData) announcements.push(annData);
        return {
          ...election,
          candidates: finalCands,
          percentReported: 100,
          isComplete: true,
          winnerAnnounced: election.winnerAnnounced || !!annData,
        };
      })
    );
    if (announcements.length > 0) {
      const uniqueAnns = announcements.filter(
        (item, idx, self) =>
          idx === self.findIndex((t) => t.electionId === item.electionId)
      );
      setWinnerAnnouncementQueue((queue) => {
        const currentIds = new Set(queue.map((item) => item.electionId));
        const toAdd = uniqueAnns.filter(
          (item) => !currentIds.has(item.electionId)
        );
        return toAdd.length > 0 ? [...queue, ...toAdd] : queue;
      });
    }
    setAllSimulationsComplete(true);
    allSimulationsCompleteRef.current = true;
  }, [createAnnouncementData]);

  const handleFinalizeAndContinue = () => {
    if (
      winnerAnnouncementQueue.length > 0 ||
      isWinnerAnnouncementModalOpenGlobal
    )
      return;
    liveElections.forEach((election) => {
      if (election.isComplete) {
        if (isSimulationMode) {
          clearSimulatedElections();
        } else {
          processElectionResults(election.id, election);
        }
      }
    });

    navigateTo(
      isSimulationMode ? "ElectionSimulatorScreen" : "CampaignGameScreen"
    );
  };

  const featuredElection = useMemo(
    () => liveElections.find((e) => e.id === featuredElectionId),
    [liveElections, featuredElectionId]
  );

  // Adjusted initial return condition for simulation mode
  // It should now wait if in simulation mode but no simulated elections are loaded yet
  if (!electionDateForThisScreen && !isSimulationMode) {
    return (
      <div className="election-night-screen-container">
        Loading election data...
      </div>
    );
  }
  // If in simulation mode, but simulatedElections array is empty, it also implies no data yet
  if (
    isSimulationMode &&
    (!simulatedElections || simulatedElections.length === 0)
  ) {
    return (
      <div className="election-night-screen-container">
        Preparing simulation...
      </div>
    );
  }

  return (
    <>
      <div className="election-night-screen-container new-layout">
        <div className="election-night-main-header">
          <div className="header-title-date">
            <h1 className="important-heading">Election Night Live</h1>
            <p className="header-date">
              Date: {electionDateForThisScreen?.month}/
              {electionDateForThisScreen?.day}/{electionDateForThisScreen?.year}
            </p>
          </div>
          <div className="header-controls">
            <ElectionTimer
              liveElections={liveElections}
              simulationSpeed={simulationSpeed}
              isPaused={isPaused}
              allComplete={allSimulationsCompleteRef.current}
              startTime={electionStartTime}
            />
            <div className="simulation-controls">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="action-button small-button"
                disabled={
                  allSimulationsCompleteRef.current &&
                  winnerAnnouncementQueue.length === 0 &&
                  !isWinnerAnnouncementModalOpenGlobal
                }
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              {Object.entries(SIMULATION_SPEEDS).map(
                ([speedKey, speedValue]) => (
                  <button
                    key={speedKey}
                    onClick={() => setSimulationSpeed(speedValue)}
                    className={`action-button small-button speed-button ${
                      simulationSpeed === speedValue ? "active" : ""
                    }`}
                  >
                    {speedKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </button>
                )
              )}
            </div>
            <WinnerAnnouncementModal
              isOpen={isWinnerAnnouncementModalOpenGlobal} // Use store state
              onClose={() => {
                if (closeWinnerAnnouncementModal)
                  closeWinnerAnnouncementModal();
              }}
              winnerData={winnerAnnouncementDataGlobal} // Use store state
            />
            <div className="finalize-controls">
              {!allSimulationsCompleteRef.current && (
                <button
                  onClick={handleSkipToResults}
                  className="action-button small-button button-delete"
                >
                  Skip to Results
                </button>
              )}
              {allSimulationsCompleteRef.current && (
                <button
                  onClick={handleFinalizeAndContinue}
                  className="action-button small-button continue-button"
                  disabled={
                    winnerAnnouncementQueue.length > 0 ||
                    isWinnerAnnouncementModalOpenGlobal
                  }
                >
                  Finalize & Continue
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="election-night-body-layout">
          <div className="main-election-panel">
            {featuredElection ? (
              featuredElection.isElectoralCollege ? (
                <ElectoralCollegeCard
                  election={featuredElection}
                  simulationSpeed={simulationSpeed}
                  skipToResults={skipElectoralToResults}
                  isPaused={isPaused}
                  openViewPoliticianModal={openViewPoliticianModal}
                />
              ) : (
                <FeaturedElectionCard
                  election={featuredElection}
                  openViewPoliticianModal={openViewPoliticianModal}
                />
              )
            ) : liveElections.length > 0 ? (
              <div className="featured-election-placeholder">
                Select an election from the list to view details.
              </div>
            ) : (
              <p className="no-results">
                No elections being simulated for this date.
              </p>
            )}
          </div>
          <aside className="elections-sidebar-list">
            <h4>All Races</h4>
            {liveElections.length > 0 ? (
              <ul>
                {liveElections.map((election) => (
                  <ElectionListItem
                    key={election.id}
                    election={election}
                    onSelect={setFeaturedElectionId}
                    isSelected={featuredElectionId === election.id}
                  />
                ))}
              </ul>
            ) : (
              <p>No election races.</p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

// Election Timer Component
const ElectionTimer = ({
  liveElections,
  simulationSpeed,
  isPaused,
  allComplete,
  startTime,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (isPaused || allComplete || !startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, allComplete, startTime]);

  const calculateEstimate = () => {
    if (!startTime || !liveElections.length || allComplete) return null;

    // Calculate overall progress across all elections
    let totalVotes = 0;
    let totalExpected = 0;
    let totalElections = 0;
    let completedElections = 0;

    liveElections.forEach((election) => {
      totalElections++;
      if (election.isComplete) {
        completedElections++;
      } else {
        const currentVotes = election.candidates.reduce(
          (sum, c) => sum + (c.currentVotes || 0),
          0
        );
        totalVotes += currentVotes;
        totalExpected += election.totalExpectedVotes || 0;
      }
    });

    // If all elections are complete, show elapsed time
    if (completedElections === totalElections) return null;

    // Calculate progress percentage
    const electionProgress = completedElections / totalElections;
    const voteProgress = totalExpected > 0 ? totalVotes / totalExpected : 0;
    const overallProgress = (electionProgress + voteProgress) / 2;

    if (overallProgress <= 0.01) {
      // If barely started, show speed-based estimate
      const speedName =
        Object.entries(SIMULATION_SPEEDS).find(
          ([, speed]) => speed === simulationSpeed
        )?.[0] || "normal";
      const baseEstimate =
        {
          realistic: 25 * 60 * 1000, // 25 minutes
          superSlow: 15 * 60 * 1000, // 15 minutes
          slow: 8 * 60 * 1000, // 8 minutes
          normal: 4 * 60 * 1000, // 4 minutes
          fast: 90 * 1000, // 1.5 minutes
        }[speedName] || 4 * 60 * 1000;

      return {
        elapsed: Math.floor((currentTime - startTime) / 1000),
        estimated: Math.floor(baseEstimate / 1000),
        isEstimate: true,
      };
    }

    // Calculate remaining time based on progress
    const elapsed = currentTime - startTime;
    const estimatedTotal = elapsed / overallProgress;
    const estimatedRemaining = estimatedTotal - elapsed;

    return {
      elapsed: Math.floor(elapsed / 1000),
      estimated: Math.floor(Math.max(0, estimatedRemaining) / 1000),
      isEstimate: false,
    };
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const timerData = calculateEstimate();

  if (!timerData) {
    if (allComplete) {
      return (
        <div className="election-timer complete">
          <div className="timer-label">Election Complete</div>
          {startTime && (
            <div className="timer-value">
              Total Time:{" "}
              {formatTime(Math.floor((currentTime - startTime) / 1000))}
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`election-timer ${isPaused ? "paused" : ""}`}>
      <div className="timer-label">Election Timer</div>
      <div className="timer-content">
        <div className="timer-elapsed">
          Elapsed: {formatTime(timerData.elapsed)}
        </div>
        <div className="timer-remaining">
          {timerData.isEstimate ? "Est. Duration: " : "Est. Remaining: "}
          {formatTime(timerData.estimated)}
        </div>
      </div>
      {isPaused && <div className="timer-status">⏸️ PAUSED</div>}
    </div>
  );
};

export default ElectionNightScreen;
