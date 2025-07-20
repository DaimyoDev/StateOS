import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useGameStore from "../../store";
import "./TabStyles.css";
import "./ElectionsTab.css";
import {
  isDateSameOrBefore,
  getTimeUntil,
  getRandomInt,
} from "../../utils/generalUtils";

// --- Utility Functions (kept outside component) ---
const getDisplayedPolling = (actualPolling) => {
  if (actualPolling == null) return 0;
  const margin = getRandomInt(2, 5);
  const adjustment = getRandomInt(-margin, margin);
  let displayed = actualPolling + adjustment;
  displayed = Math.max(0, Math.min(100, displayed));
  return Math.round(displayed);
};

// --- Memoized List Item Components ---

// For election list on the left
const ElectionListItem = React.memo(
  ({ election, isSelected, onSelect, getTimeUntilDisplay, currentDate }) => {
    const isConcluded = election.outcome?.status === "concluded";
    const isPastFiling =
      currentDate && election.filingDeadline
        ? !isDateSameOrBefore(currentDate, election.filingDeadline)
        : false;

    return (
      <li
        className={`election-list-item ${isSelected ? "selected" : ""} ${
          isConcluded ? "past-election" : ""
        }`}
        onClick={() => onSelect(election.id)}
      >
        <span className="election-office">{election.officeName}</span>
        <span className="election-date">
          Date: {election.electionDate.month}/{election.electionDate.day}/
          {election.electionDate.year}
        </span>
        <span className="election-countdown">
          {" "}
          (
          {getTimeUntilDisplay(election.electionDate, election.outcome?.status)}
          )
        </span>
        {isPastFiling && !isConcluded && !election.playerIsCandidate && (
          <span className="deadline-passed-note"> (Filing Closed)</span>
        )}
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
    </span>{" "}
    ({winner.partyName || "Independent"})
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
    const displayPollingValue = getDisplayedPolling(candidate.polling);
    return (
      <li className="candidate-item">
        <span
          className="candidate-name politician-name-link"
          onClick={() => onCandidateClick(candidate)}
          title={`View profile of ${candidate.name}`}
        >
          {candidate.name}
        </span>
        <span
          className="candidate-party"
          style={{ color: candidate.partyColor || "#333" }}
        >
          {" "}
          ({candidate.partyName || "Independent"})
        </span>
        <span className="candidate-polling">
          {" "}
          Polling: ~{displayPollingValue}%
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

// --- Main ElectionsTab Component ---
function ElectionsTab({ campaignData }) {
  const gameStore = useGameStore();
  const declareCandidacyAction = gameStore.actions.declareCandidacy;
  const openViewPoliticianModal = gameStore.actions.openViewPoliticianModal;

  const {
    elections = [],
    currentDate: rawCurrentDate, // Rename to avoid conflict with Date object
    politician: playerPoliticianData,
    generatedPartiesSnapshot: allParties = [],
  } = campaignData || {};

  const [selectedElectionId, setSelectedElectionId] = useState(null);

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
    return elections
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
      .sort(
        (a, b) =>
          a.electionDate.year - b.electionDate.year ||
          a.electionDate.month - b.electionDate.month ||
          a.electionDate.day - b.electionDate.day
      );
  }, [elections, currentDateObj]);

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

  const selectedElection = useMemo(() => {
    if (!selectedElectionId || !elections.length) return null;
    return elections.find((e) => e.id === selectedElectionId);
  }, [selectedElectionId, elections]);

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

  const canDeclareForSelectedElection = useMemo(() => {
    if (
      selectedElection &&
      rawCurrentDate &&
      selectedElection.filingDeadline &&
      selectedElection.outcome?.status !== "concluded"
    ) {
      return (
        !selectedElection.playerIsCandidate &&
        isDateSameOrBefore(rawCurrentDate, selectedElection.filingDeadline) &&
        isDateSameOrBefore(rawCurrentDate, selectedElection.electionDate)
      );
    }
    return false;
  }, [selectedElection, rawCurrentDate]); // playerIsCandidate might depend on playerPoliticianData

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

  // Memoized sorted lists derived from selectedElection
  const electionOutcome = selectedElection?.outcome;
  const electoralSystem = selectedElection?.electoralSystem;
  const electionCandidates = selectedElection?.candidates;
  const electionPartyLists = selectedElection?.partyLists;
  const electionMmpData = selectedElection?.mmpData;

  const sortedPartyResultsVotes = useMemo(() => {
    const votes = electionOutcome?.resultsByParty?.votes;
    if (!votes?.length) return [];
    return [...votes].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }, [electionOutcome]);

  const sortedResultsByCandidate = useMemo(() => {
    const results = electionOutcome?.resultsByCandidate;
    if (!results?.length) return [];
    return [...results].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }, [electionOutcome]);

  const sortedUpcomingCandidates = useMemo(() => {
    // Filter for valid candidate objects first
    const validCandidates = (electionCandidates || []).filter((cand) => {
      if (!cand) {
        // console.warn(`[ElectionsTab] sortedUpcomingCandidates: Filtered out a null/undefined candidate.`);
        return false;
      }
      if (typeof cand.name === "undefined" || typeof cand.id === "undefined") {
        // console.warn(`[ElectionsTab] sortedUpcomingCandidates: Filtered out candidate with missing name or id.`, cand);
        return false;
      }
      return true;
    });

    if (!validCandidates.length) return []; // Return empty if no valid candidates

    // Sort the valid candidates
    return [...validCandidates].sort(
      (a, b) => (b.polling || 0) - (a.polling || 0)
    );
  }, [electionCandidates]);

  const renderElectionParticipantsAndResults = useCallback(() => {
    if (!selectedElection)
      return (
        <p className="no-election-selected">
          Select an election to see details.
        </p>
      );

    const isConcluded = electionOutcome?.status === "concluded";

    if (isConcluded) {
      const { winners = [] } = electionOutcome || {};
      const resultsByPartySeats = electionOutcome?.resultsByParty?.seats || {};

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
                      {" "}
                      {/* Apply content-visibility here if needed */}
                      {sortedPartyResultsVotes.map((partyRes) => (
                        <ConcludedPartyResultItem
                          key={partyRes.id}
                          partyResult={partyRes}
                          turnoutActual={electionOutcome.turnoutActual}
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

          {sortedResultsByCandidate.length > VIRTUALIZATION_THRESHOLD &&
          electoralSystem !== "PartyListPR" &&
          electoralSystem !== "MMP" ? (
            <div className="candidate-performance-section">
              <h5>Candidate Performance:</h5>
              <VirtualizedList
                items={sortedResultsByCandidate}
                ItemComponent={ConcludedCandidateResultItem}
                itemProps={{ onCandidateClick: handleCandidateClick }}
                listClassName="results-list"
              />
            </div>
          ) : (
            sortedResultsByCandidate.length > 0 &&
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
            )
          )}
          {electoralSystem === "MMP" &&
            electionOutcome?.constituencyWinners?.length > 0 && (
              <div className="constituency-winners-section">
                <h5>Constituency Winners:</h5>
                <ul className="winners-list">
                  {electionOutcome.constituencyWinners.map((winner, index) => (
                    <WinnerListItem
                      key={`const-win-${winner.id || index}`}
                      winner={winner}
                      onCandidateClick={handleCandidateClick}
                    />
                  ))}
                </ul>
              </div>
            )}
        </div>
      );
    }

    // --- UPCOMING ELECTIONS ---
    if (
      electoralSystem === "PartyListPR" ||
      (electoralSystem === "MMP" && electionPartyLists)
    ) {
      const listsToDisplay =
        electionPartyLists ||
        (electionMmpData && electionMmpData.partyLists) ||
        {};
      const participatingPartyIds = Object.keys(listsToDisplay);

      if (
        participatingPartyIds.length === 0 &&
        (!electionMmpData ||
          (!electionMmpData.constituencyCandidatesByParty &&
            !electionMmpData.independentConstituencyCandidates))
      ) {
        return (
          <p>No parties or candidates have declared for this election yet.</p>
        );
      }
      return (
        <div>
          {participatingPartyIds.length > 0 && (
            <h4>Participating Parties & Lists:</h4>
          )}
          {participatingPartyIds.map((partyId) => {
            const partyDetails = partiesMap.get(partyId) ||
              listsToDisplay[partyId]?.[0]?.partyAffiliationReadOnly || {
                name: `Party ${partyId}`,
                color: "#CCCCCC",
              };

            const rawCandidatesOnList = listsToDisplay[partyId] || [];

            // --- Solution: Filter out invalid candidate entries ---
            const validCandidatesOnList = rawCandidatesOnList.filter(
              (candidate) => {
                if (!candidate) {
                  // Check if candidate is null or undefined
                  console.warn(
                    `[ElectionsTab] Filtered out a null/undefined candidate entry for partyId: ${partyId}.`
                  );
                  return false;
                }
                if (
                  typeof candidate.name === "undefined" ||
                  typeof candidate.id === "undefined"
                ) {
                  // Check for essential properties
                  console.warn(
                    `[ElectionsTab] Filtered out a candidate with missing name or id for partyId: ${partyId}`,
                    candidate
                  );
                  return false;
                }
                return true;
              }
            );

            return (
              <div key={partyId} className="party-list-section">
                <h5 style={{ color: partyDetails.color, fontWeight: "bold" }}>
                  {partyDetails.name}
                </h5>
                {validCandidatesOnList.length > VIRTUALIZATION_THRESHOLD ? (
                  <VirtualizedList
                    items={validCandidatesOnList} // Use the filtered list
                    ItemComponent={UpcomingCandidateOnPartyListItem}
                    itemProps={{ onCandidateClick: handleCandidateClick }}
                    listClassName="candidate-list"
                    itemSize={DEFAULT_ITEM_HEIGHT} // Make sure itemSize is defined
                  />
                ) : validCandidatesOnList.length > 0 ? (
                  <ul className="candidate-list">
                    {validCandidatesOnList.map(
                      (
                        candidate,
                        index // Map over the filtered list
                      ) => (
                        <UpcomingCandidateOnPartyListItem
                          key={candidate.id} // candidate.id is now guaranteed by the filter
                          candidate={candidate}
                          index={index}
                          onCandidateClick={handleCandidateClick}
                        />
                      )
                    )}
                  </ul>
                ) : (
                  <p>No candidates submitted for this party's list.</p>
                )}
              </div>
            );
          })}
          {electoralSystem === "MMP" && electionMmpData && (
            <>
              <h4 style={{ marginTop: "20px" }}>
                Constituency Candidate Pools:
              </h4>
              {Object.keys(electionMmpData.constituencyCandidatesByParty || {})
                .length === 0 &&
                (electionMmpData.independentConstituencyCandidates || [])
                  .length === 0 && (
                  <p>No specific constituency candidates listed yet.</p>
                )}

              {Object.keys(
                electionMmpData.constituencyCandidatesByParty || {}
              ).map((partyId) => {
                const partyDetails = partiesMap.get(partyId) || {
                  name: `Party ${partyId}`,
                  color: "#CCCCCC",
                };
                const rawConstituencyCands =
                  electionMmpData.constituencyCandidatesByParty[partyId] || [];

                // --- Solution: Filter constituency candidates for this party ---
                const validConstituencyCands = rawConstituencyCands.filter(
                  (cand) => {
                    if (!cand) {
                      console.warn(
                        `[ElectionsTab] Filtered out a null/undefined constituency candidate for partyId: ${partyId}.`
                      );
                      return false;
                    }
                    if (
                      typeof cand.name === "undefined" ||
                      typeof cand.id === "undefined"
                    ) {
                      console.warn(
                        `[ElectionsTab] Filtered out a constituency candidate with missing name or id for partyId: ${partyId}`,
                        cand
                      );
                      return false;
                    }
                    return true;
                  }
                );

                return (
                  <div
                    key={`const-pool-${partyId}`}
                    className="party-list-section"
                  >
                    <h5 style={{ color: partyDetails.color }}>
                      {partyDetails.name}
                    </h5>
                    {validConstituencyCands.length >
                    VIRTUALIZATION_THRESHOLD ? (
                      <VirtualizedList
                        items={validConstituencyCands} // Use filtered list
                        ItemComponent={UpcomingConstituencyCandidateItem}
                        itemProps={{ onCandidateClick: handleCandidateClick }}
                        listClassName="candidate-list"
                        itemSize={DEFAULT_ITEM_HEIGHT} // Ensure itemSize is defined
                      />
                    ) : validConstituencyCands.length > 0 ? (
                      <ul className="candidate-list">
                        {validConstituencyCands.map(
                          (
                            cand // Use filtered list
                          ) => (
                            <UpcomingConstituencyCandidateItem
                              key={cand.id} // cand.id is now guaranteed
                              candidate={cand}
                              onCandidateClick={handleCandidateClick}
                            />
                          )
                        )}
                      </ul>
                    ) : (
                      <p>
                        No constituency candidates currently pooled for this
                        party.
                      </p>
                    )}
                  </div>
                );
              })}

              {/* --- Refactored Independent Constituency Candidates (MMP) --- */}
              {(() => {
                // IIFE for local scoping
                const rawIndependentCands =
                  electionMmpData?.independentConstituencyCandidates || [];
                const validIndependentCands = rawIndependentCands.filter(
                  (cand) => {
                    if (!cand) {
                      // console.warn(`[ElectionsTab] Filtered out a null/undefined independent constituency candidate.`);
                      return false;
                    }
                    if (
                      typeof cand.name === "undefined" ||
                      typeof cand.id === "undefined"
                    ) {
                      // console.warn(`[ElectionsTab] Filtered out an independent constituency candidate with missing name or id.`, cand);
                      return false;
                    }
                    return true;
                  }
                );

                if (validIndependentCands.length > 0) {
                  return (
                    <div className="party-list-section">
                      <h5>Independent Constituency Candidates</h5>
                      {validIndependentCands.length >
                      VIRTUALIZATION_THRESHOLD ? (
                        <VirtualizedList
                          items={validIndependentCands}
                          ItemComponent={UpcomingConstituencyCandidateItem}
                          itemProps={{
                            onCandidateClick: handleCandidateClick,
                            isIndependent: true,
                          }}
                          listClassName="candidate-list"
                          itemSize={DEFAULT_ITEM_HEIGHT} // CRITICAL: Make sure DEFAULT_ITEM_HEIGHT is defined and correct
                        />
                      ) : (
                        <ul className="candidate-list">
                          {validIndependentCands.map((cand) => (
                            <UpcomingConstituencyCandidateItem
                              key={cand.id} // Safe due to filter
                              candidate={cand}
                              onCandidateClick={handleCandidateClick}
                              isIndependent={true}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }
                return null; // No valid independent candidates to show
              })()}
            </>
          )}
        </div>
      );
    } else if (electionCandidates && electionCandidates.length > 0) {
      return (
        <>
          <h4>Declared Candidates:</h4>
          {sortedUpcomingCandidates.length > VIRTUALIZATION_THRESHOLD ? (
            <VirtualizedList
              items={sortedUpcomingCandidates}
              ItemComponent={UpcomingDeclaredCandidateItem}
              itemProps={{ onCandidateClick: handleCandidateClick }} // getDisplayedPolling is inside item
              listClassName="candidate-list"
            />
          ) : (
            <ul className="candidate-list">
              {sortedUpcomingCandidates.map((candidate) => (
                <UpcomingDeclaredCandidateItem
                  key={candidate.id}
                  candidate={candidate}
                  onCandidateClick={handleCandidateClick}
                />
              ))}
            </ul>
          )}
        </>
      );
    } else {
      return <p>No candidates declared for this election yet.</p>;
    }
  }, [
    selectedElection,
    electionOutcome,
    electoralSystem,
    electionCandidates,
    electionPartyLists,
    electionMmpData,
    partiesMap,
    sortedPartyResultsVotes,
    sortedResultsByCandidate,
    sortedUpcomingCandidates,
    handleCandidateClick,
  ]); // Add all dependencies

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
          {displayableElections.length > 0 ? (
            // This list could also be virtualized if it becomes extremely long,
            // but usually, the number of distinct elections is manageable.
            <ul className="elections-list">
              {displayableElections.map((election) => (
                <ElectionListItem
                  key={election.id}
                  election={election}
                  isSelected={selectedElectionId === election.id}
                  onSelect={setSelectedElectionId}
                  getTimeUntilDisplay={getTimeUntilDisplay}
                  currentDate={rawCurrentDate}
                  playerPoliticianData={playerPoliticianData}
                />
              ))}
            </ul>
          ) : (
            <p>No upcoming or very recent elections scheduled.</p>
          )}
        </div>

        <div className="selected-election-details-panel">
          {selectedElection ? (
            <>
              <h3>Details for: {selectedElection.officeName}</h3>
              <div className="election-detail-grid">
                <p>
                  <strong>System:</strong> {selectedElection.electoralSystem}
                </p>
                <p>
                  <strong>Election Date:</strong>{" "}
                  {selectedElection.electionDate.month}/
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
                  selectedElection.outcome?.voterTurnoutPercentageActual !=
                    null && (
                    <p>
                      <strong>Actual Turnout:</strong>{" "}
                      {selectedElection.outcome.voterTurnoutPercentageActual.toFixed(
                        1
                      )}
                      % (
                      {selectedElection.outcome.turnoutActual?.toLocaleString()}{" "}
                      votes)
                    </p>
                  )}
                {selectedElection.incumbentInfo &&
                  (selectedElection.incumbentInfo.name ||
                    (Array.isArray(selectedElection.incumbentInfo) &&
                      selectedElection.incumbentInfo.length > 0)) && (
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
          ) : (
            <p className="no-election-selected">
              Select an election from the list to see details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default ElectionsTab;
