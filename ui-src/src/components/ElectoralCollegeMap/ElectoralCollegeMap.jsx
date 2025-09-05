import React, { useState, useMemo } from "react";
import useGameStore from "../../store";
import { ELECTORAL_VOTES_BY_STATE } from "../../General Scripts/ElectoralCollegeSystem";
import UnitedStatesMap from "../../maps/UnitedStatesMap";
import { adjustColorForMargin } from "../../utils/generalUtils";
import "./ElectoralCollegeMap.css";

// We'll use the existing UnitedStatesMap component which already has all the state data

function ElectoralCollegeMap({
  electoralResults,
  onStateClick,
  selectedStateId,
  candidates = [],
  viewMode = "results", // "results", "margin", "projection"
}) {
  // Get current theme for default state colors
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });

  // Create heatmap data for the US map based on electoral results and view mode
  const electoralHeatmapData = useMemo(() => {
    if (!electoralResults?.stateResults || !candidates.length) return [];

    const candidateColors = new Map();
    candidates.forEach((candidate) => {
      candidateColors.set(candidate.id, candidate.partyColor || "#888888");
    });

    const heatmapData = [];
    electoralResults.stateResults.forEach((stateResult, stateId) => {
      let stateColor = currentTheme?.colors?.["--border-color"] || currentTheme?.colors?.["--disabled-bg"] || "#cccccc";
      let opacity = 1.0;
      let value = "Not yet reported";

      // Different logic based on view mode
      if (viewMode === "results") {
        // Original results view logic
        if (stateResult.hasStartedReporting && stateResult.winner) {
          const winnerColor = candidateColors.get(stateResult.winner.id) || "#888888";
          stateColor = winnerColor;
          value = stateResult.winner.name;
        } else if (stateResult.hasStartedReporting) {
          stateColor = "#ffcc00"; // Yellow for reporting but no winner yet
          value = "Results pending";
        }
      } else if (viewMode === "margin") {
        // Margin view - show victory margins with color lightness variations
        if (stateResult.hasStartedReporting && stateResult.winner && stateResult.margin !== undefined) {
          const baseWinnerColor = candidateColors.get(stateResult.winner.id) || "#888888";
          
          // Adjust color lightness based on margin (closer races are lighter)
          const margin = stateResult.margin;
          stateColor = adjustColorForMargin(baseWinnerColor, margin);
          
          // Keep full opacity since we're adjusting color lightness instead
          opacity = 1.0;
          value = `${stateResult.winner.name} +${margin.toFixed(1)}%`;
        } else if (stateResult.hasStartedReporting && stateResult.winner) {
          // Fallback for states with winner but no margin data
          const winnerColor = candidateColors.get(stateResult.winner.id) || "#888888";
          stateColor = winnerColor;
          opacity = 1.0; // Full opacity, no margin adjustment
          value = `${stateResult.winner.name} (Margin unknown)`;
        }
      } else if (viewMode === "projection") {
        // Projection view - show projected winners using candidatePolling data
        if (stateResult.candidatePolling && stateResult.candidatePolling.size > 0) {
          // Find the leading candidate from polling data
          let leadingCandidateId = null;
          let highestPolling = 0;
          
          stateResult.candidatePolling.forEach((polling, candidateId) => {
            if (polling > highestPolling) {
              highestPolling = polling;
              leadingCandidateId = candidateId;
            }
          });
          
          if (leadingCandidateId) {
            const leadingCandidate = candidates.find(c => c.id === leadingCandidateId);
            const projectedColor = candidateColors.get(leadingCandidateId) || "#888888";
            stateColor = projectedColor;
            
            if (stateResult.hasStartedReporting) {
              // Full opacity for reported states
              opacity = 1.0;
              value = `${leadingCandidate?.name || 'Unknown'} (Reported)`;
            } else {
              // Semi-transparent for projections
              opacity = 0.5;
              value = `${leadingCandidate?.name || 'Unknown'} (Projected)`;
            }
          }
        } else if (stateResult.winner) {
          // Fallback to winner data if polling not available
          const projectedColor = candidateColors.get(stateResult.winner.id) || "#888888";
          stateColor = projectedColor;
          
          if (stateResult.hasStartedReporting) {
            opacity = 1.0;
            value = `${stateResult.winner.name} (Reported)`;
          } else {
            opacity = 0.5;
            value = `${stateResult.winner.name} (Projected)`;
          }
        }
      }

      heatmapData.push({
        id: stateId,
        color: stateColor,
        opacity: opacity,
        value: value,
        margin: stateResult.margin || 0,
        electoralVotes: ELECTORAL_VOTES_BY_STATE[stateId] || 0,
        polling: stateResult.candidatePolling,
        reportingPercent: stateResult.reportingPercent || 0,
        hasStartedReporting: stateResult.hasStartedReporting || false,
        reportingComplete: stateResult.reportingComplete || false,
      });
    });

    return heatmapData;
  }, [electoralResults, candidates, viewMode, currentTheme]);

  const handleStateHover = (stateId, stateName, event) => {
    if (!electoralResults?.stateResults) return;

    const stateResult = electoralResults.stateResults.get(stateId);
    const electoralVotes = ELECTORAL_VOTES_BY_STATE[stateId] || 0;

    if (stateResult && event) {
      const winnerName =
        stateResult.winner?.name ||
        (stateResult.hasStartedReporting
          ? "Results pending"
          : "Not yet reported");
      const margin = stateResult.margin?.toFixed(1) || "0.0";

      setTooltip({
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        content: {
          stateName: stateName,
          electoralVotes,
          winner: winnerName,
          margin: `${margin}%`,
          polling: stateResult.candidatePolling,
          reportingPercent: stateResult.reportingPercent || 0,
          hasStartedReporting: stateResult.hasStartedReporting || false,
          reportingComplete: stateResult.reportingComplete || false,
        },
      });
    }
  };

  const handleStateLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  // Create candidate color mapping for legend
  const candidateColors = useMemo(() => {
    const colorMap = new Map();
    candidates.forEach((candidate) => {
      colorMap.set(candidate.id, candidate.partyColor || "#888888");
    });
    return colorMap;
  }, [candidates]);

  return (
    <div className="electoral-college-map-container">
      <UnitedStatesMap
        heatmapData={electoralHeatmapData}
        viewType="electoral_college"
        onSelectState={onStateClick}
        selectedStateGameId={selectedStateId}
        onStateHover={handleStateHover}
        onStateLeave={handleStateLeave}
      />

      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div
          className="electoral-map-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
          }}
        >
          <div className="tooltip-header">
            <strong>{tooltip.content.stateName}</strong>
            <span className="electoral-votes">
              {tooltip.content.electoralVotes} EV
            </span>
          </div>
          <div className="tooltip-reporting">
            <strong>Reporting: {tooltip.content.reportingPercent}%</strong>
            {!tooltip.content.hasStartedReporting && (
              <span> (Polls not yet closed)</span>
            )}
            {tooltip.content.hasStartedReporting &&
              !tooltip.content.reportingComplete && <span> (In progress)</span>}
            {tooltip.content.reportingComplete && <span> ✓</span>}
          </div>
          <div className="tooltip-winner">
            {tooltip.content.hasStartedReporting
              ? `Winner: ${tooltip.content.winner}`
              : "Results not yet available"}
          </div>
          {tooltip.content.hasStartedReporting &&
            tooltip.content.winner !== "Results pending" && (
              <div className="tooltip-margin">
                Margin: <strong>{tooltip.content.margin}</strong>
              </div>
            )}
          {tooltip.content.polling && (
            <div className="tooltip-polling">
              {Array.from(tooltip.content.polling.entries()).map(
                ([candidateId, percentage]) => {
                  const candidate = candidates.find(
                    (c) => c.id === candidateId
                  );
                  return (
                    <div key={candidateId} className="polling-item">
                      <span style={{ color: candidateColors.get(candidateId) }}>
                        {candidate?.name || candidateId}: {percentage}%
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default ElectoralCollegeMap;
