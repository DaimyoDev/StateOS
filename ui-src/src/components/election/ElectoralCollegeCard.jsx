import React, { useState, useEffect, useMemo } from "react";
import useGameStore from "../../store";
import { calculateElectoralCollegeResults } from "../../General Scripts/ElectoralCollegeSystem";
import { ELECTORAL_VOTES_BY_STATE } from "../../General Scripts/ElectoralCollegeSystem";
import ElectoralCollegeMap from "../ElectoralCollegeMap/ElectoralCollegeMap";
import StateDetailView from "./StateDetailView";
import WinnerAnnouncementModal from "../modals/WinnerAnnouncementModal";
import FeaturedElectionCard from "./FeaturedElectionCard";
import { generateRandomColor } from "../../utils/colorUtils";

let electoralCollegeSystem = null;

const isProgressiveReportingComplete = () => {
  if (!electoralCollegeSystem || !electoralCollegeSystem.startTime) return false;

  const timeSinceStart = Date.now() - electoralCollegeSystem.startTime;
  const TYPICAL_COMPLETE_TIME = 5 * 60 * 1000; // 5 minutes

  return timeSinceStart > TYPICAL_COMPLETE_TIME;
};

const ElectoralCollegeCard = ({
  election,
  simulationSpeed = 5000,
  skipToResults = false,
  isPaused = false,
}) => {
  const { activeCampaign, countryData } = useGameStore();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [selectedState, setSelectedState] = useState(null);
  const [projectedStates, setProjectedStates] = useState(new Set());
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [currentProjection, setCurrentProjection] = useState(null);
  const [mapView, setMapView] = useState("results");

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
      // Just trigger recalculation without reset - let useProgressiveReporting=false handle it
      setUpdateTrigger((prev) => prev + 1);
    }
  }, [skipToResults]);

  // Calculate county-to-state aggregated polling for all states
  const statePollingOverrides = useMemo(() => {
    if (!election?.isElectoralCollege || !countryData || !election.candidates) return null;

    const candidatesArray = Array.from(election.candidates.values());
    const stateOverrides = new Map();

    // Get country data (active campaign or election's embedded data)
    const currentCountryData = activeCampaign ? countryData?.[activeCampaign.countryId] : election.countryData || countryData?.['USA'];
    
    
    // Check for both campaign structure (states/counties) and election structure (regions/secondAdminRegions)
    const hasStates = currentCountryData?.states;
    const hasRegions = currentCountryData?.regions && currentCountryData?.secondAdminRegions;
    
    if (!hasStates && !hasRegions) {
      return null;
    }

    // Process each state to calculate county-based polling
    const statesToProcess = hasStates ? 
      Object.values(currentCountryData.states) : 
      currentCountryData.regions;
    
    statesToProcess.forEach(state => {
      const counties = hasStates ? 
        (state.counties ? Object.values(state.counties) : []) :
        currentCountryData.secondAdminRegions.filter(county => county.stateId === state.id);
      if (counties.length === 0) return;

      // Get current state result from electoral college system for reporting status
      const currentStateResult = electoralCollegeSystem?.stateResultsCache?.get(state.id) || 
                                  electoralCollegeSystem?.stateResults?.get(state.id);
      if (!currentStateResult?.hasStartedReporting || !currentStateResult?.candidatePolling) return;

      // Calculate county results for this state (exact same logic as StateDetailView)
      // Sort counties by population (larger counties report faster, like in real elections)
      const sortedCounties = [...counties].sort((a, b) => (b.population || 0) - (a.population || 0));
      
      const countyResults = sortedCounties.map((county, index) => {
        // Use exact same logic as StateDetailView for county calculations
        const countyPolling = new Map();
        const countySeed = county.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const stateReportingPercent = currentStateResult.reportingPercent || 0;
        const countySize = county.population || 10000;
        const sizeBonus = Math.min(15, Math.log10(countySize / 1000) * 5); // 0-15% bonus for larger counties
        const positionPenalty = index * 8; // Each position adds 8% delay (deterministic)
        
        let reportingPercent;
        if (stateReportingPercent >= 100) {
          reportingPercent = 100;
        } else {
          const seededRandom = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
          };
          
          const baseReporting = stateReportingPercent * (0.7 + seededRandom(countySeed) * 0.6);
          reportingPercent = Math.max(0, Math.min(100, baseReporting + sizeBonus - positionPenalty));
        }

        if (reportingPercent < 0.1) {
          return { county, reportingPercent: 0, polling: new Map(), isReporting: false, totalVotes: 0 };
        }

        // Get the state's current polling data
        const statePolling = currentStateResult.candidatePolling;
        if (!statePolling) return { county, reportingPercent: 0, polling: new Map(), isReporting: false, totalVotes: 0 };
        
        // Calculate the final results (what the county will end up with at 100% reporting)
        const finalCountyPolling = new Map();
        statePolling.forEach((statePercent, candidateId) => {
          // Add county-specific variation (-5% to +5%) based on county characteristics using seeded random
          const candidateSeed = countySeed + candidateId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          let variation = (seededRandom(candidateSeed) - 0.5) * 10; // Reduced from 30 to 10
          
          // Find candidate for party-based variations
          const candidate = candidatesArray.find((c) => c.id === candidateId);

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

          const countyPercent = Math.max(0, Math.min(100, statePercent + variation));
          finalCountyPolling.set(candidateId, countyPercent);
        });

        // Use progressive reporting to show partial results
        finalCountyPolling.forEach((finalPercent, candidateId) => {
          const progressivePercent = finalPercent * (reportingPercent / 100);
          countyPolling.set(candidateId, progressivePercent);
        });

        // Normalize and calculate votes
        const total = Array.from(countyPolling.values()).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          countyPolling.forEach((val, candidateId) => {
            countyPolling.set(candidateId, (val / total) * 100);
          });
        }

        const turnoutRate = currentStateResult.voterTurnoutPercentage || 60;
        
        const totalVotes = Math.floor(Math.min(
          (county.population || 0) * 0.65 * // ~65% of population as eligible voters
          (turnoutRate / 100), // Use state turnout or 60% default
          500000
        ) * (reportingPercent / 100));

        return {
          county,
          reportingPercent: Math.round(reportingPercent),
          polling: countyPolling,
          isReporting: reportingPercent >= 0.1,
          totalVotes
        };
      });

      // Aggregate county results to state level (similar to StateDetailView)
      const reportingCounties = countyResults.filter(c => c.isReporting);
      if (reportingCounties.length === 0) return;

      const totalVotes = reportingCounties.reduce((sum, county) => sum + county.totalVotes, 0);
      if (totalVotes === 0) return;

      const aggregatedPolling = new Map();
      candidatesArray.forEach(candidate => {
        aggregatedPolling.set(candidate.id, 0);
      });

      reportingCounties.forEach(countyResult => {
        const countyWeight = countyResult.totalVotes / totalVotes;
        countyResult.polling.forEach((percentage, candidateId) => {
          const current = aggregatedPolling.get(candidateId) || 0;
          aggregatedPolling.set(candidateId, current + (percentage * countyWeight));
        });
      });

      // Store the aggregated polling for this state
      stateOverrides.set(state.id, aggregatedPolling);
    });

    return stateOverrides;
  }, [election, countryData, activeCampaign, updateTrigger]); // updateTrigger ensures this recalculates

  const electoralResults = useMemo(() => {
    if (!election?.isElectoralCollege || !election.candidates) {
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


    const useProgressiveReporting = !skipToResults;

    // If skipping to results, reset the system right before calculation to ensure clean slate
    if (
      skipToResults &&
      electoralCollegeSystem &&
      electoralCollegeSystem.reset
    ) {
      electoralCollegeSystem.reset();
    }

    const results = calculateElectoralCollegeResults(
      candidatesArray,
      campaignToUse,
      currentCountryData,
      useProgressiveReporting,
      simulationSpeed,
      statePollingOverrides
    );


    return results;
  }, [
    election,
    activeCampaign,
    countryData,
    updateTrigger,
    simulationSpeed,
    skipToResults,
    statePollingOverrides,
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
      // Electoral college reporting complete
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
            election={election}
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

export default ElectoralCollegeCard;