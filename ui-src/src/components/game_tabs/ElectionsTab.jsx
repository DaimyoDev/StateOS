import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./ElectionsTab.css";
import { isDateSameOrBefore, getTimeUntil } from "../../utils/generalUtils";
import { getRandomInt } from "../../utils/core";

// --- Utility Functions (kept outside component) ---
// Removed getDisplayedPolling function as polling values are no longer displayed in election tab

const PollResultCard = React.memo(({ poll }) => {
  if (!poll || !poll.results) return null;

  // Sort the results for this specific poll
  const sortedResults = Array.from(poll.results.values()).sort(
    (a, b) => (b.polling || 0) - (a.polling || 0)
  );

  return (
    <div className="poll-card">
      <div className="poll-header">
        <span className="pollster-name">{poll.pollsterName}</span>
        <span className="poll-date">
          {poll.date.month}/{poll.date.day}/{poll.date.year}
        </span>
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

const MemoizedElectionDetails = React.memo(function MemoizedElectionDetails({
  selectedElection,
  partiesMap,
  canDeclareForSelectedElection,
  handleCandidateClick,
  handleDeclareCandidacy,
  partyLists: electionPartyLists,
  mmpData: electionMmpData,
  recentPolls,
}) {
  // This hook now safely lives inside the component that uses its props.
  const renderElectionParticipantsAndResults = useCallback(() => {
    if (!selectedElection) return null;

    const {
      outcome: electionOutcome,
      electoralSystem,
      candidates: electionCandidates,
    } = selectedElection;

    const isConcluded = electionOutcome?.status === "concluded";

    const sortedPartyResultsVotes = [
      ...(electionOutcome?.partyVoteSummary || []),
    ].sort((a, b) => (b.votes || 0) - (a.votes || 0));

    const sortedResultsByCandidate = [
      ...(electionOutcome?.resultsByCandidate || []),
    ]
      .map((candidate) => {
        const partyDetails = partiesMap.get(candidate.partyId);
        return {
          ...candidate,
          partyName: partyDetails?.name || "Independent",
          partyColor: partyDetails?.color || "#888888",
        };
      })
      .sort((a, b) => (b.votes || 0) - (a.votes || 0));

    const sortedUpcomingCandidates = Array.from(
      (electionCandidates || new Map()).values()
    )
      .filter(
        (cand) => cand && cand.name !== undefined && cand.id !== undefined
      )
      .sort((a, b) => (b.polling || 0) - (a.polling || 0));

    if (isConcluded) {
      const rawWinners = electionOutcome?.winnerAssignment?.winners || [];
      const winners = rawWinners
        .map((winner) =>
          winner
            ? {
                ...winner,
                partyName:
                  partiesMap.get(winner.partyId)?.name || "Independent",
              }
            : null
        )
        .filter(Boolean);
      const resultsByPartySeats = electionOutcome?.partySeatSummary || {};

      return (
        <div className="election-results-summary">
          <h4>Election Results:</h4>
          {winners.length > 0 ? (
            <>
              {(electoralSystem === "PartyListPR" ||
                electoralSystem === "MMP") &&
                sortedPartyResultsVotes.length > 0 && (
                  <div className="party-performance-section">
                    <h4>Party Performance:</h4>
                    <ul className="party-results-list">
                      {sortedPartyResultsVotes.map((partyRes) => (
                        <ConcludedPartyResultItem
                          key={partyRes.id}
                          partyResult={partyRes}
                          turnoutActual={electionOutcome.totalVotesActuallyCast}
                          seats={resultsByPartySeats[partyRes.id]}
                          partiesMap={partiesMap}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              {winners.length === 1 ? (
                <p>
                  <strong>
                    Winner:{" "}
                    <WinnerListItem
                      winner={winners[0]}
                      onCandidateClick={handleCandidateClick}
                    />
                  </strong>
                </p>
              ) : (
                <div>
                  <strong>Winners ({winners.length}):</strong>
                  <ul className="winners-list">
                    {winners.map((winner, index) => (
                      <WinnerListItem
                        key={winner.id || `winner-${index}`}
                        winner={winner}
                        onCandidateClick={handleCandidateClick}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>
              <strong>
                Outcome: No winner(s) determined or results not available.
              </strong>
            </p>
          )}
          {sortedResultsByCandidate.length > 0 &&
            electoralSystem !== "PartyListPR" &&
            electoralSystem !== "MMP" && (
              <div className="candidate-performance-section">
                <h5>Candidate Performance:</h5>
                <ul className="candidate-list results-list">
                  {sortedResultsByCandidate.map((cand) => (
                    <ConcludedCandidateResultItem
                      key={cand.candidateId || cand.id}
                      candidate={cand}
                      onCandidateClick={handleCandidateClick}
                    />
                  ))}
                </ul>
              </div>
            )}
        </div>
      );
    }

    if (electoralSystem === "PartyListPR" && electionPartyLists) {
      return (
        <div className="party-lists-container">
          <h4>Party Lists:</h4>
          {Object.entries(electionPartyLists).map(([partyId, candidates]) => {
            const party = partiesMap.get(partyId);
            return (
              <div key={partyId} className="party-list-section">
                <h5 style={{ color: party?.color }}>
                  {party?.name || "Unknown Party"}
                </h5>
                {candidates.length > VIRTUALIZATION_THRESHOLD ? (
                  <VirtualizedList
                    items={candidates}
                    ItemComponent={UpcomingCandidateOnPartyListItem}
                    itemProps={{ onCandidateClick: handleCandidateClick }}
                  />
                ) : (
                  <ul className="candidate-list">
                    {candidates.map((candidate, index) => (
                      <UpcomingCandidateOnPartyListItem
                        key={candidate.id || index}
                        candidate={candidate}
                        index={index}
                        onCandidateClick={handleCandidateClick}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (electoralSystem === "MMP" && electionMmpData) {
      return (
        <div className="mmp-details-container">
          {electionMmpData.partyLists &&
            Object.keys(electionMmpData.partyLists).length > 0 && (
              <div className="party-lists-container">
                <h4>Party Lists (for Proportional Seats):</h4>
                {Object.entries(electionMmpData.partyLists).map(
                  ([partyId, candidates]) => {
                    const party = partiesMap.get(partyId);
                    return (
                      <div key={partyId} className="party-list-section">
                        <h5 style={{ color: party?.color }}>
                          {party?.name || "Unknown Party"}
                        </h5>
                        <VirtualizedList
                          items={candidates}
                          ItemComponent={UpcomingCandidateOnPartyListItem}
                          itemProps={{ onCandidateClick: handleCandidateClick }}
                        />
                      </div>
                    );
                  }
                )}
              </div>
            )}
          {electionMmpData.constituencyCandidatesByParty &&
            Object.keys(electionMmpData.constituencyCandidatesByParty).length >
              0 && (
              <div className="constituency-candidates-container">
                <h4>Constituency Candidates (for District Seat):</h4>
                {Object.entries(
                  electionMmpData.constituencyCandidatesByParty
                ).map(([partyId, candidates]) => {
                  const party = partiesMap.get(partyId);
                  return (
                    <div key={partyId} className="party-list-section">
                      <h5 style={{ color: party?.color }}>
                        {party?.name || "Unknown Party"}
                      </h5>
                      <ul className="candidate-list">
                        {candidates.map((candidate, index) => (
                          <UpcomingConstituencyCandidateItem
                            key={candidate.id || index}
                            candidate={candidate}
                            onCandidateClick={handleCandidateClick}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {electionMmpData.independentConstituencyCandidates &&
                  electionMmpData.independentConstituencyCandidates.length >
                    0 && (
                    <div className="party-list-section">
                      <h5>Independents</h5>
                      <ul className="candidate-list">
                        {electionMmpData.independentConstituencyCandidates.map(
                          (candidate, index) => (
                            <UpcomingConstituencyCandidateItem
                              key={candidate.id || index}
                              candidate={candidate}
                              onCandidateClick={handleCandidateClick}
                              isIndependent={true}
                            />
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
        </div>
      );
    }

    const hasAnyCandidates =
      (electionCandidates && electionCandidates.size > 0) ||
      (electionPartyLists && Object.keys(electionPartyLists).length > 0) ||
      (electionMmpData &&
        ((electionMmpData.partyLists &&
          Object.keys(electionMmpData.partyLists).length > 0) ||
          (electionMmpData.constituencyCandidatesByParty &&
            Object.keys(electionMmpData.constituencyCandidatesByParty).length >
              0)));

    if (hasAnyCandidates) {
      // This part now correctly handles simple (FPTP) candidate lists,
      // but only if the other more complex types haven't been rendered first.
      return (
        <>
          <h4>Declared Candidates:</h4>
          <ul className="candidate-list">
            {sortedUpcomingCandidates.map((candidate) => (
              <UpcomingDeclaredCandidateItem
                key={candidate.id}
                candidate={candidate}
                onCandidateClick={handleCandidateClick}
              />
            ))}
          </ul>
        </>
      );
    } else {
      // This message will now only show if there are truly no candidates in any of the possible data structures.
      return <p>No candidates declared for this election yet.</p>;
    }
  }, [
    selectedElection,
    partiesMap,
    handleCandidateClick,
    electionMmpData,
    electionPartyLists,
  ]);

  if (!selectedElection) {
    return (
      <p className="no-election-selected">
        Select an election from the list to see details.
      </p>
    );
  }

  return (
    // This component now returns a single fragment
    <>
      <h3>Details for: {selectedElection.officeName}</h3>
      <div className="election-detail-grid">
        <p>
          <strong>System:</strong> {selectedElection.electoralSystem}
        </p>
        <p>
          <strong>Election Date:</strong> {selectedElection.electionDate.month}/
          {selectedElection.electionDate.day}/
          {selectedElection.electionDate.year}
        </p>
        <p>
          <strong>Filing Deadline:</strong>{" "}
          {selectedElection.filingDeadline?.month}/
          {selectedElection.filingDeadline?.day}/
          {selectedElection.filingDeadline?.year || "N/A"}
        </p>
        {selectedElection.entityDataSnapshot?.population != null && (
          <p>
            <strong>Electorate Population:</strong>{" "}
            {selectedElection.entityDataSnapshot.population.toLocaleString()}
          </p>
        )}
        {selectedElection.numberOfSeatsToFill != null &&
          selectedElection.numberOfSeatsToFill > 1 && (
            <p>
              <strong>Seats to Fill:</strong>{" "}
              {selectedElection.numberOfSeatsToFill}
            </p>
          )}
        {selectedElection.voterTurnoutPercentage != null &&
          selectedElection.outcome?.status !== "concluded" && (
            <p>
              <strong>Expected Turnout:</strong>{" "}
              {selectedElection.voterTurnoutPercentage}%
            </p>
          )}
        {selectedElection.outcome?.status === "concluded" &&
          selectedElection.outcome?.voterTurnoutPercentageActual != null && (
            <p>
              <strong>Actual Turnout:</strong>{" "}
              {selectedElection.outcome.voterTurnoutPercentageActual.toFixed(1)}
              % (
              {selectedElection.outcome.totalVotesActuallyCast?.toLocaleString()}{" "}
              votes)
            </p>
          )}
        {selectedElection.incumbentInfo &&
          (Array.isArray(selectedElection.incumbentInfo)
            ? selectedElection.incumbentInfo.length > 0
            : selectedElection.incumbentInfo.name) && (
            <p>
              <strong>Incumbent(s):</strong>
              {Array.isArray(selectedElection.incumbentInfo)
                ? selectedElection.incumbentInfo
                    .map((inc) => inc.name)
                    .join(", ")
                : selectedElection.incumbentInfo.name}
            </p>
          )}
      </div>

      {renderElectionParticipantsAndResults()}

      {selectedElection.outcome?.status !== "concluded" && (
        <section className="detail-section">
          <h4>Recent Polls</h4>
          {recentPolls && recentPolls.length > 0 ? (
            <div className="polls-container">
              {recentPolls.map((poll) => (
                <PollResultCard
                  key={`${poll.pollsterId}-${poll.date.day}`}
                  poll={poll}
                />
              ))}
            </div>
          ) : (
            <p className="no-polls-message">
              No recent polls are available for this election.
            </p>
          )}
        </section>
      )}

      {!selectedElection.playerIsCandidate &&
        selectedElection.outcome?.status !== "concluded" &&
        canDeclareForSelectedElection && (
          <button
            className="action-button declare-candidacy-button"
            onClick={() => handleDeclareCandidacy(selectedElection.id)}
          >
            Declare Candidacy for {selectedElection.officeName}
          </button>
        )}
      {selectedElection.playerIsCandidate &&
        selectedElection.outcome?.status !== "concluded" && (
          <p className="already-declared-note">
            You are a candidate in this election.
          </p>
        )}
    </>
  );
});

const MemoizedElectionsList = React.memo(function MemoizedElectionsList({
  displayableElections,
  selectedElectionId,
  onSelect,
  getTimeUntilDisplay,
  rawCurrentDate,
}) {
  if (displayableElections.length === 0) {
    return <p>No upcoming elections match the current filter.</p>;
  }

  // Pass all necessary data and callbacks to the RowRenderer
  const itemData = {
    elections: displayableElections,
    selectedElectionId,
    onSelect,
    getTimeUntilDisplay,
    rawCurrentDate,
  };

  return (
    // We need a container with a defined height for AutoSizer to work
    <div className="elections-list-container">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={displayableElections.length}
            itemSize={150} // Adjust this based on the height of your ElectionListItem
            itemData={itemData}
            itemKey={(index) => displayableElections[index].id} // Use unique keys
          >
            {ElectionListRow}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

// --- Memoized List Item Components ---

const ElectionListRow = ({ index, style, data }) => {
  // Destructure ALL necessary props from the data object
  const {
    elections,
    selectedElectionId,
    onSelect,
    getTimeUntilDisplay,
    rawCurrentDate, // The name in the data object
  } = data;

  const election = elections[index];
  if (!election) return null;

  return (
    <div style={style} className="election-list-item-wrapper">
      {/* CRITICAL FIX: Pass all the necessary props down to ElectionListItem.
        The `currentDate` prop was renamed to `rawCurrentDate` to match what we passed in `itemData`.
      */}
      <ElectionListItem
        election={election}
        isSelected={selectedElectionId === election.id}
        onSelect={onSelect}
        getTimeUntilDisplay={getTimeUntilDisplay}
        currentDate={rawCurrentDate}
      />
    </div>
  );
};

// For election list on the left
const ElectionListItem = React.memo(
  ({ election, isSelected, onSelect, getTimeUntilDisplay, currentDate }) => {
    const isConcluded = election.outcome?.status === "concluded";
    // Check if currentDate exists before using it
    const isPastFiling =
      currentDate && election.filingDeadline
        ? !isDateSameOrBefore(currentDate, election.filingDeadline)
        : false;

    return (
      <li // This is now a semantic `li` as it should be, styling is on the wrapper
        className={`election-list-item ${isSelected ? "selected" : ""} ${
          isConcluded ? "past-election" : ""
        }`}
        onClick={() => onSelect(election.id)}
      >
        <span className="election-office">{election.officeName}</span>
        <div>
          <span className="election-date">
            Date: {election.electionDate.month}/{election.electionDate.day}/
            {election.electionDate.year}
          </span>
          <span className="election-countdown">
            {" "}
            (
            {getTimeUntilDisplay(
              election.electionDate,
              election.outcome?.status
            )}
            )
          </span>
          {isPastFiling && !isConcluded && !election.playerIsCandidate && (
            <span className="deadline-passed-note"> (Filing Closed)</span>
          )}
        </div>
      </li>
    );
  }
);

// For party performance in concluded elections
const ConcludedPartyResultItem = React.memo(
  ({ partyResult, turnoutActual, seats, partiesMap }) => {
    const partyDetails = partiesMap.get(partyResult.id) || {
      color: "#888",
      name: partyResult.name || partyResult.id,
    };
    return (
      <li className="party-item">
        <span
          className="party-name"
          style={{ color: partyDetails.color, fontWeight: "bold" }}
        >
          {partyDetails.name}
          {": "}
        </span>
        <span className="party-votes">
          {partyResult.votes?.toLocaleString()} votes (
          {((partyResult.votes / (turnoutActual || 1)) * 100).toFixed(1)}%)
        </span>
        {seats != null && <span className="party-seats"> Seats: {seats}</span>}
      </li>
    );
  }
);

// For winner lists
const WinnerListItem = React.memo(({ winner, onCandidateClick }) => (
  <li>
    <span
      className="politician-name-link"
      onClick={() => onCandidateClick(winner)}
      title={`View profile of ${winner.name}`}
    >
      {winner.name}
    </span>
    {/* Corrected: Added a span with the candidate-party class */}
    <span className="candidate-party">
      ({winner.partyName || "Independent"})
    </span>
  </li>
));

// For candidate performance in concluded non-PR/MMP elections
const ConcludedCandidateResultItem = React.memo(
  ({ candidate, onCandidateClick }) => (
    <li className="candidate-item">
      <span
        className="candidate-name politician-name-link"
        onClick={() => onCandidateClick(candidate)}
        title={`View profile of ${candidate.candidateName || candidate.name}`}
      >
        {candidate.candidateName || candidate.name}
      </span>
      <span className="candidate-party">
        {" "}
        ({candidate.partyName || "Independent"})
      </span>
      <span className="candidate-votes">
        {" "}
        {candidate.votes != null
          ? `${candidate.votes.toLocaleString()} votes`
          : `Polling: ${
              candidate.pollingPercentage || candidate.polling || 0
            }%`}
      </span>
    </li>
  )
);

// For candidates in party lists (upcoming PR/MMP)
const UpcomingCandidateOnPartyListItem = React.memo(
  ({ candidate, index, onCandidateClick }) => {
    if (!candidate || typeof candidate.name === "undefined") {
      // console.warn('[UpcomingCandidateOnPartyListItem] Received invalid candidate prop:', candidate);
      // You could return null or a placeholder item if this somehow still happens
      return (
        <li className="candidate-item candidate-item-error">
          Invalid candidate data (index: {index})
        </li>
      );
    }

    return (
      <li className="candidate-item">
        <span className="candidate-list-position">{index + 1}. </span>
        <span
          className="candidate-name politician-name-link"
          onClick={() => onCandidateClick(candidate)}
          title={`View profile of ${candidate.name}`} // Now safe
        >
          {candidate.name}
        </span>
      </li>
    );
  }
);

// For constituency candidates (upcoming MMP)
const UpcomingConstituencyCandidateItem = React.memo(
  ({ candidate, onCandidateClick, isIndependent = false }) => {
    // Safeguard for invalid candidate prop
    if (
      !candidate ||
      typeof candidate.name === "undefined" ||
      typeof candidate.id === "undefined"
    ) {
      // console.warn('[UpcomingConstituencyCandidateItem] Received invalid candidate prop:', candidate);
      // Return a placeholder or null to prevent crashing
      return (
        <li className="candidate-item candidate-item-error">
          Invalid constituency candidate data
        </li>
      );
    }

    return (
      <li className="candidate-item">
        <span
          className="candidate-name politician-name-link"
          onClick={() => onCandidateClick(candidate)}
          title={`View profile of ${candidate.name}`} // Safe now
        >
          {candidate.name} {isIndependent ? "(Independent)" : ""}{" "}
          {/* Safe now */}
        </span>
      </li>
    );
  }
);

// For declared candidates in upcoming non-PR/MMP elections
const UpcomingDeclaredCandidateItem = React.memo(
  ({ candidate, onCandidateClick }) => {
    return (
      <li className="candidate-item">
        <span
          className="candidate-name politician-name-link"
          onClick={() => onCandidateClick(candidate)}
          title={`View profile of ${candidate.name}`}
        >
          {candidate.name}
        </span>
        <span className="candidate-party">
          {" "}
          ({candidate.partyName || "Independent"})
        </span>
      </li>
    );
  }
);

// --- Virtualized List Wrapper ---
const VIRTUALIZATION_THRESHOLD = 50; // Render normally if items are less than or equal to this
const DEFAULT_ITEM_HEIGHT = 30; // Adjust based on your typical list item height
const DEFAULT_LIST_HEIGHT = "300px";

const RowRenderer = ({ index, style, data }) => {
  const { items, ItemComponent, itemProps } = data;
  const item = items[index];
  // Spread the specific item's properties and any additional shared itemProps
  return (
    <div style={style}>
      <ItemComponent
        candidate={item}
        {...itemProps}
        index={index} /* Pass index if ItemComponent needs it */
      />
    </div>
  );
};

const VirtualizedList = React.memo(
  ({
    items,
    ItemComponent,
    itemSize = DEFAULT_ITEM_HEIGHT,
    listHeight = DEFAULT_LIST_HEIGHT,
    itemProps = {},
    listClassName = "",
  }) => {
    if (!items || items.length === 0) {
      return <p>No items to display.</p>;
    }

    return (
      <div
        style={{ height: listHeight, width: "100%" }}
        className={`virtualized-list-container ${listClassName}`}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={items.length}
              itemSize={itemSize}
              width={width}
              itemData={{ items, ItemComponent, itemProps }} // Pass necessary data to RowRenderer
              itemKey={(index, data) =>
                data.items[index].id || data.items[index].key || index
              } // Ensure stable keys
            >
              {RowRenderer}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  }
);

// --- Helper Functions ---

/**
 * Checks if a player is eligible to declare candidacy for an election based on their location.
 * Players can only run for offices within their state or city.
 */
const checkCandidacyEligibility = (election, playerLocation) => {
  const { startingCity, regionId, countryId } = playerLocation;
  const entity = election.entityDataSnapshot;
  
  if (!entity) return false;
  
  // National elections - eligible if same country
  if (election.level && election.level.startsWith("national_")) {
    return entity.countryId === countryId || entity.id === countryId;
  }
  
  // Local city elections - eligible if same city
  if (election.level === "local_city" || election.level === "local_city_or_municipality") {
    return entity.id === startingCity?.id;
  }
  
  // State/regional elections - eligible if same state/region
  if (election.level && (election.level.startsWith("state_") || election.level.startsWith("regional_"))) {
    return (
      entity.id === regionId ||
      entity.stateId === regionId ||
      entity.parentId === regionId ||
      entity.id.startsWith(regionId + "_")
    );
  }
  
  // District elections within state - eligible if district is in player's state
  if (entity.stateId === regionId || entity.parentId === regionId || entity.id.startsWith(regionId + "_")) {
    return true;
  }
  
  // City council elections - eligible if same city
  if (election.level === "local_city_or_municipality_council") {
    return entity.id === startingCity?.id || entity.parentId === startingCity?.id;
  }
  
  return false;
};

// --- Main ElectionsTab Component ---
function ElectionsTab({ campaignData }) {
  const gameStore = useGameStore();
  const declareCandidacyAction = gameStore.actions.declareCandidacy;
  const openViewPoliticianModal = gameStore.actions.openViewPoliticianModal;

  const {
    elections = [],
    currentDate: rawCurrentDate,
    generatedPartiesSnapshot: allParties = [],
    availableCountries = [],
    countryId = null,
  } = campaignData || {};

  const playerPoliticianData = campaignData?.politicians?.campaign.get(
    campaignData?.playerPoliticianId
  );
  const playerStartingCity = campaignData?.startingCity;
  // Try multiple sources for regionId
  const playerRegionId = playerPoliticianData?.regionId || 
                        campaignData?.politician?.regionId || 
                        campaignData?.regionId;

  const countryData = useMemo(
    () => availableCountries.find((c) => c.id === countryId),
    [availableCountries, countryId]
  );

  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const recentPollsByElection = useGameStore(
    (state) => state.recentPollsByElection
  );

  // Find the polls specifically for the selected election
  const recentPollsForSelected = useMemo(() => {
    if (!selectedElectionId) return [];
    return recentPollsByElection.get(selectedElectionId) || [];
  }, [selectedElectionId, recentPollsByElection]);

  const regionTerm = countryData?.regionTerm || "Region";

  // Get the player's region name from the country data
  const playerRegionName = useMemo(() => {
    if (!playerRegionId || !countryData?.regions) return null;
    const region = countryData.regions.find(r => r.id === playerRegionId);
    return region?.name || null;
  }, [playerRegionId, countryData]);

  // Memoized values from previous optimizations
  const partiesMap = useMemo(() => {
    const map = new Map();
    allParties.forEach((party) => map.set(party.id, party));
    return map;
  }, [allParties]);

  const currentDateObj = useMemo(() => {
    if (!rawCurrentDate) return null;
    return new Date(
      rawCurrentDate.year,
      rawCurrentDate.month - 1,
      rawCurrentDate.day
    );
  }, [rawCurrentDate]);

  const displayableElections = useMemo(() => {
    if (!elections.length || !currentDateObj) return [];
    const currentTimestamp = currentDateObj.getTime();
    return (
      elections
        .filter((election) => {
          const electionDateObj = new Date(
            election.electionDate.year,
            election.electionDate.month - 1,
            election.electionDate.day
          );
          const diffTime = electionDateObj.getTime() - currentTimestamp;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= -7 && diffDays <= 365 * 2;
        })
        .filter((election) => {
          const entity = election.entityDataSnapshot;
          if (!entity) return false;

          // Location Filter (Player's City/Region)
          if (locationFilter !== "all") {
            if (locationFilter === "playerStartingCity") {
              if (
                playerStartingCity?.id !== entity.id &&
                playerStartingCity?.id !== entity.parentId
              )
                return false;
            }
            if (locationFilter === "playerCurrentRegion") {
              if (
                playerRegionId !== entity.id &&
                playerRegionId !== entity.stateId &&
                playerRegionId !== entity.parentId &&
                !entity.id.startsWith(playerRegionId + "_")
              )
                return false;
            }
          }

          // Geographic/Level Filter
          if (regionFilter === "all") return true;
          if (regionFilter === "national") {
            return election.level && election.level.startsWith("national_");
          }

          // This final check now covers all known cases for state/region filtering:
          return (
            entity.id === regionFilter ||
            entity.stateId === regionFilter ||
            entity.parentId === regionFilter ||
            entity.id.startsWith(regionFilter + "_")
          );
        })
        // MODIFICATION END
        .sort(
          (a, b) =>
            a.electionDate.year - b.electionDate.year ||
            a.electionDate.month - b.electionDate.month ||
            a.electionDate.day - b.electionDate.day
        )
    );
  }, [elections, currentDateObj, regionFilter, locationFilter, playerStartingCity, playerRegionId]);

  useEffect(() => {
    if (!currentDateObj) return;
    if (!selectedElectionId && displayableElections.length > 0) {
      const firstUpcomingOrCurrent = displayableElections.find((e) => {
        const electionDateObj = new Date(
          e.electionDate.year,
          e.electionDate.month - 1,
          e.electionDate.day
        );
        return (
          electionDateObj >= currentDateObj && e.outcome?.status !== "concluded"
        );
      });
      setSelectedElectionId(
        firstUpcomingOrCurrent?.id || displayableElections[0]?.id || null
      );
    } else if (
      selectedElectionId &&
      !displayableElections.find((e) => e.id === selectedElectionId)
    ) {
      setSelectedElectionId(
        displayableElections.length > 0 ? displayableElections[0].id : null
      );
    }
  }, [displayableElections, selectedElectionId, currentDateObj]);

  const getTimeUntilDisplay = useCallback(
    (electionDate, status) => {
      if (!currentDateObj || !electionDate) return "N/A";
      const electionDayObj = new Date(
        electionDate.year,
        electionDate.month - 1,
        electionDate.day
      );
      return getTimeUntil(currentDateObj, electionDayObj, status);
    },
    [currentDateObj]
  );

  const handleDeclareCandidacy = useCallback(
    (electionId) => {
      if (declareCandidacyAction && playerPoliticianData) {
        declareCandidacyAction(electionId);
      }
    },
    [declareCandidacyAction, playerPoliticianData]
  );

  const selectedElection = useMemo(() => {
    if (!selectedElectionId || !elections.length) return null;
    return elections.find((e) => e.id === selectedElectionId);
  }, [selectedElectionId, elections]);

  const canDeclareForSelectedElection = useMemo(() => {
    if (
      selectedElection &&
      rawCurrentDate &&
      selectedElection.filingDeadline &&
      selectedElection.outcome?.status !== "concluded" &&
      campaignData
    ) {
      const isEligible = checkCandidacyEligibility(selectedElection, {
        startingCity: campaignData.startingCity,
        regionId: campaignData.politicians.campaign.get(campaignData.playerPoliticianId).regionId,
        countryId: campaignData.countryId,
      });
      
      return (
        !selectedElection.playerIsCandidate &&
        isDateSameOrBefore(rawCurrentDate, selectedElection.filingDeadline) &&
        isDateSameOrBefore(rawCurrentDate, selectedElection.electionDate) &&
        isEligible
      );
    }
    return false;
  }, [selectedElection, rawCurrentDate, campaignData]);

  const handleCandidateClick = useCallback(
    (candidate) => {
      if (!candidate) return;
      if (candidate.isPlayer || candidate.id === playerPoliticianData?.id) {
        return;
      }
      if (openViewPoliticianModal) {
        openViewPoliticianModal(candidate);
      }
    },
    [playerPoliticianData?.id, openViewPoliticianModal]
  );

  if (!campaignData) {
    return (
      <div className="tab-content-container elections-tab ui-panel">
        <p>Loading campaign data...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-container elections-tab ui-panel">
      <h2 className="tab-title">Elections Dashboard</h2>
      <div className="elections-layout">
        <div className="upcoming-elections-panel">
          <h3>Upcoming & Recent Elections</h3>
          <div className="elections-filter-container">
            <div className="filters">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="region-filter-select"
              >
                <option value="all">All Locations</option>
                {playerStartingCity && (
                  <option value="playerStartingCity">
                    My City ({playerStartingCity.name})
                  </option>
                )}
                {playerRegionId && playerRegionName && (
                  <option value="playerCurrentRegion">My {regionTerm} ({playerRegionName})</option>
                )}
              </select>

              <select
                className="region-filter-select"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">All {regionTerm}s</option>
                <option value="national">National</option>
                {countryData?.regions?.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {displayableElections.length > 0 ? (
            <MemoizedElectionsList
              displayableElections={displayableElections}
              selectedElectionId={selectedElectionId}
              onSelect={setSelectedElectionId}
              getTimeUntilDisplay={getTimeUntilDisplay}
              rawCurrentDate={rawCurrentDate}
            />
          ) : (
            <p>No upcoming elections match the current filter.</p>
          )}
        </div>
        <div className="selected-election-details-panel">
          <MemoizedElectionDetails
            selectedElection={selectedElection}
            partiesMap={partiesMap}
            rawCurrentDate={rawCurrentDate}
            playerPoliticianData={playerPoliticianData}
            canDeclareForSelectedElection={canDeclareForSelectedElection}
            handleCandidateClick={handleCandidateClick}
            handleDeclareCandidacy={handleDeclareCandidacy}
            partyLists={selectedElection?.partyLists}
            mmpData={selectedElection?.mmpData}
            recentPolls={recentPollsForSelected}
          />
        </div>
      </div>
    </div>
  );
}
export default ElectionsTab;
