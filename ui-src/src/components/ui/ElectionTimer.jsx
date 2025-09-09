import React, { useState, useEffect } from "react";
import { SIMULATION_SPEEDS } from "../../utils/electionSimulationUtils";

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

export default ElectionTimer;