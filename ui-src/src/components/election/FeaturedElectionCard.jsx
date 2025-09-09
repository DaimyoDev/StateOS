import React, { useMemo } from "react";
import { generateRandomColor } from "../../utils/colorUtils";

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
    sortedCandidates.reduce((sum, c) => sum + (c.currentVotes || 0), 0);

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

export default FeaturedElectionCard;