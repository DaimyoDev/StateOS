import React, { useState, useMemo, useRef, useEffect } from "react";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./PollingTab.css"; // We will create this file next

// Helper function to create party abbreviations
const abbreviatePartyName = (partyName) => {
  if (!partyName || partyName === "Independent") return partyName;
  
  // Handle some common cases first
  const commonAbbreviations = {
    "Democratic Party": "Dem",
    "Republican Party": "Rep", 
    "Green Party": "Green",
    "Libertarian Party": "Lib",
    "Independent": "Ind"
  };
  
  if (commonAbbreviations[partyName]) {
    return commonAbbreviations[partyName];
  }
  
  // For long party names (>25 chars), create abbreviation from first letters
  if (partyName.length > 25) {
    const words = partyName.split(' ').filter(word => word.length > 2); // Skip short words like "of", "the"
    if (words.length > 1) {
      return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
  }
  
  return partyName;
};

// A reusable component to display a single poll's results
const PollDetailsCard = React.memo(({ poll, election }) => {
  if (!poll || !poll.results) return null;

  const sortedResults = Array.from(poll.results.values()).sort(
    (a, b) => (b.polling || 0) - (a.polling || 0)
  );

  const isPlayerElection = election?.playerIsCandidate;
  const playerCandidate = sortedResults.find(c => c.isPlayer);

  return (
    <div className="poll-details-card">
      <div className="poll-details-header">
        <h4>
          {election?.officeName || "Unknown Election"}
          {isPlayerElection && <span className="player-election-indicator"> (Player Election)</span>}
        </h4>
        <span>{`${poll.date.month}/${poll.date.day}/${poll.date.year}`}</span>
      </div>
      <ul className="poll-results-list">
        {sortedResults.map((candidate) => {
          const fullPartyName = candidate.partyName || "Independent";
          const shortPartyName = abbreviatePartyName(fullPartyName);
          const showTooltip = fullPartyName !== shortPartyName;
          
          return (
            <li key={candidate.id} className={`poll-result-item ${candidate.isPlayer ? 'player-candidate' : ''}`}>
              <span className="candidate-info">
                {candidate.name} (
                {showTooltip ? (
                  <span 
                    className="party-name-with-tooltip"
                    onMouseEnter={(e) => {
                      const tooltip = e.target.querySelector('.custom-tooltip');
                      if (tooltip) {
                        const rect = e.target.getBoundingClientRect();
                        tooltip.style.left = `${rect.left + rect.width / 2}px`;
                        tooltip.style.top = `${rect.top - 10}px`;
                        tooltip.style.transform = 'translate(-50%, -100%)';
                      }
                    }}
                  >
                    {shortPartyName}
                    <span className="custom-tooltip">{fullPartyName}</span>
                  </span>
                ) : (
                  <span className="party-name-full">{shortPartyName}</span>
                )}
                )
                {candidate.isPlayer && <span className="player-badge"> YOU</span>}
              </span>
            <div className="candidate-metrics">
              <span className="candidate-polling">{candidate.polling}%</span>
              {candidate.nameRecognition > 0 && (
                <span 
                  className="name-recognition metric-with-tooltip"
                  onMouseEnter={(e) => {
                    const tooltip = e.target.querySelector('.custom-tooltip');
                    if (tooltip) {
                      const rect = e.target.getBoundingClientRect();
                      tooltip.style.left = `${rect.left + rect.width / 2}px`;
                      tooltip.style.top = `${rect.top - 10}px`;
                      tooltip.style.transform = 'translate(-50%, -100%)';
                    }
                  }}
                >
                  👁️ {candidate.nameRecognition}%
                  <span className="custom-tooltip">Name Recognition - How well-known this candidate is to voters</span>
                </span>
              )}
              {candidate.approvalRating !== 50 && (
                <span 
                  className={`approval-rating ${candidate.approvalRating > 50 ? 'positive' : 'negative'} metric-with-tooltip`}
                  onMouseEnter={(e) => {
                    const tooltip = e.target.querySelector('.custom-tooltip');
                    if (tooltip) {
                      const rect = e.target.getBoundingClientRect();
                      tooltip.style.left = `${rect.left + rect.width / 2}px`;
                      tooltip.style.top = `${rect.top - 10}px`;
                      tooltip.style.transform = 'translate(-50%, -100%)';
                    }
                  }}
                >
                  {candidate.approvalRating > 50 ? '👍' : '👎'} {candidate.approvalRating}%
                  <span className="custom-tooltip">Approval Rating - Public opinion of this candidate's performance</span>
                </span>
              )}
            </div>
          </li>
          );
        })}
      </ul>
      
      {/* Show coalition breakdown for player candidate if available */}
      {playerCandidate?.coalitionBreakdown && (
        <div className="coalition-breakdown">
          <h5>Coalition Support Breakdown (Player)</h5>
          <div className="coalition-scores">
            {Array.from(playerCandidate.coalitionBreakdown.entries()).map(([coalitionId, score]) => (
              <div key={coalitionId} className="coalition-score-item">
                <span className="coalition-name">{coalitionId.replace('_', ' ')}</span>
                <span className="coalition-score">{Math.round(score)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
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