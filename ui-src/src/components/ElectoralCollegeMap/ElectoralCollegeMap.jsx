import React, { useState, useMemo } from "react";
import useGameStore from "../../store";
import { ELECTORAL_VOTES_BY_STATE } from "../../General Scripts/ElectoralCollegeSystem";
import UnitedStatesMap from "../../maps/UnitedStatesMap";
import "./ElectoralCollegeMap.css";

// We'll use the existing UnitedStatesMap component which already has all the state data

function ElectoralCollegeMap({
  electoralResults,
  onStateClick,
  selectedStateId,
  candidates = [],
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

  // Create heatmap data for the US map based on electoral results
  const electoralHeatmapData = useMemo(() => {
    if (!electoralResults?.stateResults || !candidates.length) return [];

    const candidateColors = new Map();
    candidates.forEach((candidate) => {
      candidateColors.set(candidate.id, candidate.partyColor || "#888888");
    });

    const heatmapData = [];
    electoralResults.stateResults.forEach((stateResult, stateId) => {
      // Always show states with solid colors - use contrasting colors like CampaignSetupScreen borders
      let stateColor = currentTheme?.colors?.["--border-color"] || currentTheme?.colors?.["--disabled-bg"] || "#cccccc"; // Theme-based contrasting color for unreported states
      let opacity = 1.0; // Always full opacity
      let value = "Not yet reported";

      if (stateResult.hasStartedReporting && stateResult.winner) {
        const winnerColor =
          candidateColors.get(stateResult.winner.id) || "#888888";
        stateColor = winnerColor;
        value = stateResult.winner.name;
      } else if (stateResult.hasStartedReporting) {
        stateColor = "#ffcc00"; // Yellow for reporting but no winner yet
        value = "Results pending";
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
  }, [electoralResults, candidates]);

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

      {/* Legend */}
      <div className="electoral-map-legend">
        <div className="legend-title">Electoral College Results</div>
        {candidates.map((candidate) => {
          const electoralVotes =
            electoralResults?.candidateElectoralVotes?.get(candidate.id) || 0;
          return (
            <div key={candidate.id} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: candidateColors.get(candidate.id) }}
              />
              <span className="legend-text">
                {candidate.name}: {electoralVotes} EV
              </span>
            </div>
          );
        })}
        <div className="legend-note">*Color intensity shows reporting progress</div>
      </div>
    </div>
  );
}

export default ElectoralCollegeMap;
