import React, { useState, useMemo } from "react";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./PollingTab.css"; // We will create this file next

// A reusable component to display a single poll's results
const PollDetailsCard = React.memo(({ poll, election }) => {
  if (!poll || !poll.results) return null;

  const sortedResults = Array.from(poll.results.values()).sort(
    (a, b) => (b.polling || 0) - (a.polling || 0)
  );

  return (
    <div className="poll-details-card">
      <div className="poll-details-header">
        <h4>{election?.officeName || "Unknown Election"}</h4>
        <span>{`${poll.date.month}/${poll.date.day}/${poll.date.year}`}</span>
      </div>
      <ul className="poll-results-list">
        {sortedResults.map((candidate) => (
          <li key={candidate.id} className="poll-result-item">
            <span className="candidate-info">
              {candidate.name} ({candidate.partyName || "Independent"})
            </span>
            <span className="candidate-polling">{candidate.polling}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// The main component for the new tab
function PollingTab({ campaignData }) {
  const [selectedPollsterId, setSelectedPollsterId] = useState(null);

  const pollingFirms = campaignData?.pollingFirms || [];
  const elections = campaignData?.elections || [];
  const recentPollsByElection = useGameStore((state) => state.recentPollsByElection || new Map());

  const selectedPollster = useMemo(() => {
    if (!selectedPollsterId) return null;
    return pollingFirms.find((p) => p.id === selectedPollsterId);
  }, [selectedPollsterId, pollingFirms]);

  const pollsBySelectedPollster = useMemo(() => {
    if (!selectedPollster) return [];
    const polls = [];
    for (const [electionId, pollList] of recentPollsByElection.entries()) {
      const election = elections.find(e => e.id === electionId);
      for (const poll of pollList) {
        if (poll.pollsterId === selectedPollster.id) {
          polls.push({ ...poll, election });
        }
      }
    }
    return polls.sort((a, b) => new Date(b.date.year, b.date.month - 1, b.date.day) - new Date(a.date.year, a.date.month - 1, a.date.day));
  }, [selectedPollster, recentPollsByElection, elections]);

  // Render detail view if a pollster is selected
  if (selectedPollster) {
    return (
      <div className="tab-content-container polling-tab ui-panel">
        <button onClick={() => setSelectedPollsterId(null)} className="back-button menu-button">
          ← Back to All Pollsters
        </button>
        <div className="pollster-detail-view">
            <header className="pollster-header">
                <h2>{selectedPollster.name}</h2>
                <div className="pollster-stats">
                    <span><strong>Reach:</strong> {selectedPollster.reach}</span>
                    <span><strong>Credibility:</strong> {selectedPollster.credibility}</span>
                    <span><strong>Level:</strong> {selectedPollster.level}</span>
                </div>
            </header>
            <section className="detail-section">
                <h3>Recent Polls Conducted</h3>
                <div className="polls-conducted-container">
                    {pollsBySelectedPollster.length > 0 ? (
                        pollsBySelectedPollster.map(poll => (
                            <PollDetailsCard key={`${poll.election.id}-${poll.date.day}`} poll={poll} election={poll.election} />
                        ))
                    ) : (
                        <p>This firm has not conducted any recent polls.</p>
                    )}
                </div>
            </section>
        </div>
      </div>
    );
  }

  // Render the overview list of all pollsters
  return (
    <div className="tab-content-container polling-tab ui-panel">
      <h2 className="tab-title">Polling Firms</h2>
      <p className="tab-description">
        Review independent polling firms and their recent election surveys. Analyze their reach, credibility, and potential biases.
      </p>
      <div className="entity-list">
        {pollingFirms.map((firm) => (
          <div
            key={firm.id}
            className="entity-card pollster-card clickable"
            onClick={() => setSelectedPollsterId(firm.id)}
            title={`View details for ${firm.name}`}
          >
            <h4>{firm.name}</h4>
            <p><strong>Credibility:</strong> {firm.credibility}</p>
            <p><strong>Reach:</strong> {firm.reach}</p>
            <p><strong>Level:</strong> {firm.level}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollingTab;