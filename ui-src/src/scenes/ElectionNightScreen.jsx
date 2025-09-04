// ui-src/src/scenes/ElectionNightScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import useGameStore from "../store"; //
import "./ElectionNightScreen.css"; //
import WinnerAnnouncementModal from "../components/modals/WinnerAnnouncementModal"; //
import { getRandomInt, calculateAdultPopulation } from "../utils/core"; //
import { calculateElectoralCollegeResults, isProgressiveReportingComplete, ELECTORAL_VOTES_BY_STATE, electoralCollegeSystem } from "../General Scripts/ElectoralCollegeSystem";
import ElectoralCollegeMap from "../components/ElectoralCollegeMap/ElectoralCollegeMap";

// Import county maps for state detail view
import AlabamaMap from "../maps/usaCounties/AlabamaMap";
import ArkansasMap from "../maps/usaCounties/ArkansasMap";
import ArizonaMap from "../maps/usaCounties/ArizonaMap";
import ConnecticutMap from "../maps/usaCounties/ConnecticutMap";
import CaliforniaMap from "../maps/usaCounties/CaliforniaMap";
import ColoradoMap from "../maps/usaCounties/ColoradoMap";
import DelawareMap from "../maps/usaCounties/DelwareMap";
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

const distributeVoteChunkProportionally = (candidates, voteChunk) => {
  let processedCandidates = candidates.map((c) => ({
    ...c,
    currentVotes: c.currentVotes || 0,
    basePolling: c.polling || c.baseScore || 1,
  }));

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
const StateDetailView = ({ selectedState, candidates, onBackToMap, countryData }) => {
  const [activeTab, setActiveTab] = useState("map");

  // Find the state and its counties from the election's country data
  const { state, counties } = useMemo(() => {
    if (!selectedState?.stateId || !countryData) return { state: null, counties: [] };
    
    const foundState = countryData.regions?.find((r) => r.id === selectedState.stateId);
    if (foundState) {
      const stateCounties = (countryData.secondAdminRegions || [])
        .filter((county) => county.stateId === selectedState.stateId)
        .sort((a, b) => (b.population || 0) - (a.population || 0));
      console.log(`[DEBUG] Found state ${foundState.name} with ${stateCounties.length} counties`);
      return { state: foundState, counties: stateCounties };
    }
    console.log(`[DEBUG] State not found: ${selectedState.stateId}`);
    return { state: null, counties: [] };
  }, [selectedState?.stateId, countryData]);

  // Generate county-level election results based on state results
  const countyResults = useMemo(() => {
    if (!counties.length || !candidates.length || !selectedState?.stateResult?.candidatePolling) return [];

    return counties.map(county => {
      const countyPolling = new Map();
      
      // Simulate county variations from state polling
      selectedState.stateResult.candidatePolling.forEach((statePercent, candidateId) => {
        // Add county-specific variation (-15% to +15%) based on county characteristics
        let variation = (Math.random() - 0.5) * 30;
        
        // Urban counties might favor different candidates
        const isUrban = (county.population || 0) > 100000;
        const candidate = candidates.find(c => c.id === candidateId);
        
        // Add realistic bias based on county demographics and candidate
        if (county.politicalLandscape) {
          const topParty = county.politicalLandscape.reduce((max, p) => 
            p.popularity > max.popularity ? p : max, {popularity: 0});
          
          // If candidate's party matches county's top party, boost slightly
          if (candidate?.partyName === topParty.name) {
            variation += 5;
          }
        }
        
        const countyPercent = Math.max(0, Math.min(100, statePercent + variation));
        countyPolling.set(candidateId, countyPercent);
      });

      // Normalize to 100%
      const total = Array.from(countyPolling.values()).reduce((sum, val) => sum + val, 0);
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
          winner = candidates.find(c => c.id === candidateId);
        }
      });

      // Calculate margin (difference between 1st and 2nd place)
      const sortedResults = Array.from(countyPolling.entries())
        .sort(([,a], [,b]) => b - a);
      const margin = sortedResults.length >= 2 ? 
        sortedResults[0][1] - sortedResults[1][1] : sortedResults[0]?.[1] || 0;

      return {
        county,
        polling: countyPolling,
        winner,
        margin,
        winnerPercent: maxPercent,
        totalVotes: Math.floor((county.population || 0) * (0.5 + Math.random() * 0.3)) // 50-80% turnout
      };
    });
  }, [counties, candidates, selectedState?.stateResult]);

  // Create heatmap data for county map
  const countyHeatmapData = useMemo(() => {
    if (!countyResults.length) return [];

    return countyResults.map(result => ({
      id: result.county.id,
      color: result.winner?.partyColor || "#cccccc",
      opacity: Math.max(0.4, Math.min(1.0, result.margin / 40)), // Opacity based on margin
      value: result.winner?.name || "No winner"
    }));
  }, [countyResults]);

  // Render appropriate state county map (same pattern as StateDetailsScreen)
  const renderStateMap = () => {
    console.log('[DEBUG] renderStateMap - state:', state, 'stateId:', selectedState?.stateId, 'counties:', counties.length);
    
    const mapProps = {
      heatmapData: countyHeatmapData,
      viewType: "party_popularity"
    };

    // Map state IDs to their corresponding county map components
    switch (selectedState.stateId) {
      case "USA_AL": return <AlabamaMap {...mapProps} />;
      case "USA_AR": return <ArkansasMap {...mapProps} />;
      case "USA_AZ": return <ArizonaMap {...mapProps} />;
      case "USA_CA": return <CaliforniaMap {...mapProps} />;
      case "USA_CO": return <ColoradoMap {...mapProps} />;
      case "USA_CT": return <ConnecticutMap {...mapProps} />;
      case "USA_DE": return <DelawareMap {...mapProps} />;
      case "USA_FL": return <FloridaMap {...mapProps} />;
      case "USA_GA": return <GeorgiaMap {...mapProps} />;
      case "USA_ID": return <IdahoMap {...mapProps} />;
      case "USA_IL": return <IllinoisMap {...mapProps} />;
      case "USA_IN": return <IndianaMap {...mapProps} />;
      case "USA_IA": return <IowaMap {...mapProps} />;
      case "USA_KS": return <KansasMap {...mapProps} />;
      case "USA_KY": return <KentuckyMap {...mapProps} />;
      case "USA_LA": return <LousianaMap {...mapProps} />;
      case "USA_ME": return <MaineMap {...mapProps} />;
      case "USA_MD": return <MarylandMap {...mapProps} />;
      case "USA_MA": return <MassachusettsMap {...mapProps} />;
      case "USA_MI": return <MichiganMap {...mapProps} />;
      case "USA_MN": return <MinnesotaMap {...mapProps} />;
      case "USA_MS": return <MississippiMap {...mapProps} />;
      case "USA_MO": return <MissouriMap {...mapProps} />;
      case "USA_MT": return <MontanaMap {...mapProps} />;
      case "USA_NE": return <NebraskaMap {...mapProps} />;
      case "USA_NV": return <NevadaMap {...mapProps} />;
      case "USA_NH": return <NewHampshireMap {...mapProps} />;
      case "USA_NJ": return <NewJerseyMap {...mapProps} />;
      case "USA_NM": return <NewMexicoMap {...mapProps} />;
      case "USA_NY": return <NewYorkMap {...mapProps} />;
      case "USA_NC": return <NorthCarolinaMap {...mapProps} />;
      case "USA_ND": return <NorthDakotaMap {...mapProps} />;
      case "USA_OH": return <OhioMap {...mapProps} />;
      case "USA_OK": return <OklahomaMap {...mapProps} />;
      case "USA_OR": return <OregonMap {...mapProps} />;
      case "USA_PA": return <PennyslvaniaMap {...mapProps} />;
      case "USA_RI": return <RhodeIslandMap {...mapProps} />;
      case "USA_SC": return <SouthCarolinaMap {...mapProps} />;
      case "USA_SD": return <SouthDakotaMap {...mapProps} />;
      case "USA_TN": return <TennesseeMap {...mapProps} />;
      case "USA_TX": return <TexasMap {...mapProps} />;
      case "USA_UT": return <UtahMap {...mapProps} />;
      case "USA_VT": return <VermontMap {...mapProps} />;
      case "USA_VA": return <VirginiaMap {...mapProps} />;
      case "USA_WA": return <WashingtonMap {...mapProps} />;
      case "USA_WV": return <WestVirginiaMap {...mapProps} />;
      case "USA_WI": return <WisconsinMap {...mapProps} />;
      default:
        return <div className="county-map-placeholder">County map not available for {selectedState.stateName}</div>;
    }
  };

  if (!selectedState) return null;

  const { stateId, stateName, stateResult } = selectedState;
  const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

  return (
    <div className="state-detail-view">
      {/* Header with back button */}
      <div className="state-detail-header">
        <button className="back-button menu-button" onClick={onBackToMap}>
          ← Back to Electoral Map
        </button>
        <div className="state-title">
          <h3>{stateName}</h3>
          <div className="state-meta">
            <span className="electoral-votes">{electoralVotes} Electoral Votes</span>
            <span className="reporting">Reporting: {stateResult.reportingPercent || 0}%</span>
          </div>
        </div>
      </div>

      {/* State Results */}
      {stateResult.hasStartedReporting && stateResult.candidatePolling && (
        <div className="state-results-summary">
          <h4>Statewide Results</h4>
          <div className="candidate-results-grid">
            {Array.from(stateResult.candidatePolling.entries())
              .sort(([,a], [,b]) => b - a)
              .map(([candidateId, percentage]) => {
                const candidate = candidates.find(c => c.id === candidateId);
                if (!candidate) return null;

                return (
                  <div key={candidateId} className="candidate-result-card">
                    <div 
                      className="candidate-indicator"
                      style={{ backgroundColor: candidate.partyColor }}
                    />
                    <div className="candidate-info">
                      <div className="candidate-name">{candidate.name}</div>
                      <div className="candidate-party">({candidate.partyName || "Independent"})</div>
                    </div>
                    <div className="candidate-percentage">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
          </div>
          {stateResult.winner && (
            <div className="state-winner-banner">
              <strong>🏆 Winner: {stateResult.winner.name}</strong>
              <span className="winner-margin"> (Margin: {stateResult.margin?.toFixed(1)}%)</span>
            </div>
          )}
        </div>
      )}

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

      {/* Tab Content */}
      <div className="state-tab-content">
        {activeTab === "map" && (
          <div className="county-map-section">
            {renderStateMap()}
          </div>
        )}

        {activeTab === "breakdown" && (
          <div className="county-breakdown-section">
            <h4>County Results</h4>
            <div className="county-results-list">
              {countyResults.length > 0 ? (
                countyResults.slice(0, 20).map(result => (
                  <div key={result.county.id} className="county-result-row">
                    <div className="county-info">
                      <span className="county-name">{result.county.name}</span>
                      <span className="county-votes">{result.totalVotes.toLocaleString()} votes</span>
                    </div>
                    <div className="county-winner">
                      {result.winner && (
                        <>
                          <span 
                            className="winner-name"
                            style={{ color: result.winner.partyColor }}
                          >
                            {result.winner.name}
                          </span>
                          <span className="winner-percent">{result.winnerPercent}%</span>
                          <span className="winner-margin">(+{result.margin.toFixed(1)}%)</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No county results available yet</div>
              )}
              {countyResults.length > 20 && (
                <div className="more-counties">
                  ...and {countyResults.length - 20} more counties
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Electoral College specific component
const ElectoralCollegeCard = ({ election, simulationSpeed = 5000, skipToResults = false }) => {
  const { activeCampaign, countryData } = useGameStore();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [selectedState, setSelectedState] = useState(null); // Now for main screen, not modal
  const [projectedStates, setProjectedStates] = useState(new Set());
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [currentProjection, setCurrentProjection] = useState(null);

  // Timer for progressive reporting updates - only when progressive reporting is active
  useEffect(() => {
    if (!election?.isElectoralCollege || skipToResults) return;

    // Check if we need to continue updating (if progressive reporting is still in progress)
    let shouldContinueUpdating = true;
    
    const interval = setInterval(() => {
      // Only trigger updates if progressive reporting might still be happening
      if (shouldContinueUpdating) {
        // Check if progressive reporting is complete
        if (isProgressiveReportingComplete()) {
          shouldContinueUpdating = false;
          console.log("[DEBUG] Progressive reporting complete - stopping updates");
          return;
        }
        
        setUpdateTrigger(prev => prev + 1);
      }
    }, 5000); // Update every 5 seconds (slower for more suspense)

    return () => clearInterval(interval);
  }, [election?.isElectoralCollege, skipToResults]);

  // Force update when skipToResults changes to true
  useEffect(() => {
    if (skipToResults) {
      console.log("[DEBUG] Skipping to results - forcing Electoral College recalculation");
      // Just trigger recalculation without reset - let useProgressiveReporting=false handle it
      setUpdateTrigger(prev => prev + 1);
    }
  }, [skipToResults]);
  
  const electoralResults = useMemo(() => {
    if (!election?.isElectoralCollege || !election.candidates) {
      console.log("[DEBUG] ElectoralCollegeCard: Early return", {
        isElectoralCollege: election?.isElectoralCollege,
        hasCandidates: !!election?.candidates,
        hasActiveCampaign: !!activeCampaign
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
      campaignToUse = {
        countryId: election.regionId,
        coalitionSystems: null // Simulation mode doesn't use coalition systems
      };
    }
    
    console.log("[DEBUG] ElectoralCollegeCard: Calculating electoral results", {
      mode: activeCampaign ? 'campaign' : 'simulation',
      candidatesCount: candidatesArray.length,
      candidates: candidatesArray.map(c => ({id: c.id, name: c.name, currentVotes: c.currentVotes})),
      countryId: campaignToUse.countryId,
      hasCountryData: !!currentCountryData,
      hasCoalitionSystems: !!campaignToUse?.coalitionSystems,
      coalitionSystemsKeys: campaignToUse?.coalitionSystems ? Object.keys(campaignToUse.coalitionSystems) : null
    });
    
    const useProgressiveReporting = !skipToResults;
    console.log("[DEBUG] ElectoralCollegeCard: About to calculate with useProgressiveReporting =", useProgressiveReporting, "skipToResults =", skipToResults);
    
    // If skipping to results, reset the system right before calculation to ensure clean slate
    if (skipToResults && electoralCollegeSystem && electoralCollegeSystem.reset) {
      console.log("[DEBUG] Resetting Electoral College system before non-progressive calculation");
      electoralCollegeSystem.reset();
    }
    
    return calculateElectoralCollegeResults(candidatesArray, campaignToUse, currentCountryData, useProgressiveReporting, simulationSpeed);
  }, [election, activeCampaign, countryData, updateTrigger, simulationSpeed, skipToResults]);

  const electoralSummary = useMemo(() => {
    if (!electoralResults) return { candidates: [], battleground: [] };
    
    const candidates = [];
    electoralResults.candidateElectoralVotes.forEach((votes, candidateId) => {
      const candidate = Array.from(election.candidates.values()).find(c => c.id === candidateId);
      if (candidate) {
        candidates.push({
          ...candidate,
          electoralVotes: votes,
          percentage: ((votes / 538) * 100).toFixed(1)
        });
      }
    });
    
    // Sort by electoral votes
    candidates.sort((a, b) => (b.electoralVotes || 0) - (a.electoralVotes || 0));
    
    // Find battleground states (margin < 5%) but only for states that are reporting
    const battleground = [];
    electoralResults.stateResults.forEach((stateResult, stateId) => {
      if (stateResult.hasStartedReporting && stateResult.winner && stateResult.margin < 5) {
        battleground.push(stateResult);
      }
    });
    
    return { candidates, battleground };
  }, [electoralResults, election.candidates]);

  // Update selectedState when electoral results change
  useEffect(() => {
    if (selectedState && electoralResults?.stateResults) {
      const updatedStateResult = electoralResults.stateResults.get(selectedState.stateId);
      if (updatedStateResult && updatedStateResult !== selectedState.stateResult) {
        setSelectedState(prev => ({
          ...prev,
          stateResult: updatedStateResult
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
      const canCall = stateResult.hasStartedReporting && 
                     stateResult.winner && 
                     stateResult.reportingPercent >= 60 && // At least 60% reporting (was 25%)
                     (stateResult.margin > 20 || stateResult.reportingPercent >= 95); // Very high margin OR almost complete
      
      if (canCall && !projectedStates.has(stateId)) {
        const stateName = stateResult.stateName || `State ${stateId}`;
        
        // Add to projected states
        setProjectedStates(prev => new Set([...prev, stateId]));
        
        // Show projection modal
        setCurrentProjection({
          stateName,
          stateId,
          winner: stateResult.winner,
          electoralVotes: ELECTORAL_VOTES_BY_STATE[stateId] || 0,
          margin: stateResult.margin,
          reportingPercent: stateResult.reportingPercent
        });
        setShowProjectionModal(true);
      }
    });
  }, [electoralResults, projectedStates]);

  if (!election?.isElectoralCollege) {
    return <FeaturedElectionCard election={election} />;
  }

  return (
    <div className={`election-card electoral-college-card ${election.isComplete ? "complete" : "in-progress"}`}>
      <h2 className="important-heading">{election.officeName}</h2>
      
      {/* Electoral Vote Summary */}
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
                  backgroundColor: candidate.partyColor || generateRandomColor(),
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
                style={{ backgroundColor: candidate.partyColor || generateRandomColor() }}
              />
              <span className="candidate-name">{candidate.name}</span>
              <span className="electoral-votes">{candidate.electoralVotes}</span>
              <span className="electoral-percentage">({candidate.percentage}%)</span>
            </div>
          ))}
        </div>
        
        <div className="electoral-status">
          <span className="needed-to-win">270 to win</span>
          {electoralResults?.winner && (
            <span className="projected-winner">
              Winner: {Array.from(election.candidates.values()).find(c => c.id === electoralResults.winner.id)?.name || electoralResults.winner.id}
            </span>
          )}
        </div>
      </div>
      
      {/* Battleground States */}
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
      
      {/* Interactive Electoral College Map or State Detail View */}
      <div className="electoral-map-container">
        {!selectedState ? (
          // National Electoral College Map
          <ElectoralCollegeMap
            electoralResults={electoralResults}
            candidates={Array.from(election.candidates.values())}
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
          />
        )}
      </div>

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
            winners: [{
              id: currentProjection.winner.id,
              name: currentProjection.winner.name,
              partyName: currentProjection.winner.partyName,
              partyColor: currentProjection.winner.partyColor
            }],
            electoralSystem: "ElectoralCollege",
            margin: currentProjection.margin,
            reportingPercent: currentProjection.reportingPercent,
            isStateProjection: true
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
        className={`election-list-sidebar-item ${isSelected ? "selected" : ""} ${
          election.isComplete ? "complete" : "in-progress"
        }`}
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
              votesThisTick
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

        const nowComplete =
          (election.electoralSystem === "PartyListPR"
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
          election.totalExpectedVotes
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

export default ElectionNightScreen;
