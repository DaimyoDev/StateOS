import React from "react";

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

export default ElectionListItem;