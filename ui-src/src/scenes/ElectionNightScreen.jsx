// ui-src/src/scenes/ElectionNightScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import useGameStore from "../store"; //
import "./ElectionNightScreen.css"; //
import WinnerAnnouncementModal from "../components/modals/WinnerAnnouncementModal"; //
import { getRandomInt, calculateAdultPopulation } from "../utils/core"; //

const SIMULATION_SPEEDS = {
  realistic: 300000,
  superSlow: 20000,
  slow: 10000,
  normal: 5000,
  fast: 1500,
};

const distributeVoteChunkProportionally = (candidates, voteChunk) => {
  let processedCandidates = candidates.map((c) => ({
    ...c,
    currentVotes: c.currentVotes || 0,
    basePolling: c.polling || c.baseScore || 1,
  }));

  if (voteChunk <= 0 || processedCandidates.length === 0) {
    return candidates.map((c) => ({ ...c, currentVotes: c.currentVotes || 0 }));
  }

  const candidatesWithChunkWeight = processedCandidates.map((candidate) => {
    const randomPerformanceFactor = 0.7 + Math.random() * 0.6; // Small random swing
    return {
      ...candidate,
      // Ensure basePolling is a positive number for weight calculation
      chunkWeight:
        Math.max(0.1, candidate.basePolling) * randomPerformanceFactor,
    };
  });

  const totalChunkWeight = candidatesWithChunkWeight.reduce(
    (sum, c) => sum + c.chunkWeight,
    0
  );

  let distributedInChunk = 0;

  if (totalChunkWeight > 0) {
    for (let i = 0; i < candidatesWithChunkWeight.length; i++) {
      const candidate = candidatesWithChunkWeight[i];
      const proportionOfChunk = candidate.chunkWeight / totalChunkWeight;
      const votesForCandidateThisChunk = Math.floor(
        proportionOfChunk * voteChunk
      );
      const originalCandidate = processedCandidates.find(
        (pc) => pc.id === candidate.id
      );
      if (originalCandidate) {
        originalCandidate.currentVotes += votesForCandidateThisChunk;
        distributedInChunk += votesForCandidateThisChunk;
      }
    }
  } else if (processedCandidates.length > 0) {
    const equalShare = Math.floor(voteChunk / processedCandidates.length);
    processedCandidates.forEach((candidate) => {
      candidate.currentVotes += equalShare;
      distributedInChunk += equalShare;
    });
  }

  let remainder = voteChunk - distributedInChunk;
  if (remainder > 0 && processedCandidates.length > 0) {
    const sortedForRemainder = candidatesWithChunkWeight.sort(
      (a, b) => b.chunkWeight - a.chunkWeight
    );
    for (let i = 0; i < remainder; i++) {
      const candidateToReceiveRemainder = processedCandidates.find(
        (pc) => pc.id === sortedForRemainder[i % sortedForRemainder.length].id
      );
      if (candidateToReceiveRemainder) {
        candidateToReceiveRemainder.currentVotes++;
      }
    }
  }
  return processedCandidates.map(({ ...rest }) => rest);
};

const FeaturedElectionCard = ({ election }) => {
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
    election.candidates?.reduce((sum, c) => sum + (c.currentVotes || 0), 0) ||
    0;

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
                    backgroundColor:
                      candidate.partyColor || "var(--disabled-bg, #ccc)",
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

const ElectionListItem = ({ election, onSelect, isSelected }) => {
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

const ElectionNightScreen = () => {
  const store = useGameStore(); //
  const activeCampaign = store.activeCampaign;
  const {
    navigateTo,
    openWinnerAnnouncementModal,
    closeWinnerAnnouncementModal,
    openViewPoliticianModal,
    processElectionResults,
    setIsSimulationMode,
    clearSimulatedElections,
  } = store.actions;

  const isWinnerAnnouncementModalOpenGlobal =
    store.isWinnerAnnouncementModalOpen;
  const winnerAnnouncementDataGlobal = store.winnerAnnouncementData;
  const isSimulationMode = store.isSimulationMode;
  const simulatedElections = store.simulatedElections;

  const [liveElections, setLiveElections] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(
    SIMULATION_SPEEDS.normal
  );
  const [isPaused, setIsPaused] = useState(false);
  const [allSimulationsComplete, setAllSimulationsComplete] = useState(false);
  const allSimulationsCompleteRef = React.useRef(allSimulationsComplete);
  const [featuredElectionId, setFeaturedElectionId] = useState(null);
  const [winnerAnnouncementQueue, setWinnerAnnouncementQueue] = useState([]);

  useEffect(() => {
    allSimulationsCompleteRef.current = allSimulationsComplete;
  }, [allSimulationsComplete]);

  const electionDateForThisScreen = useMemo(() => {
    if (isSimulationMode && simulatedElections.length > 0) {
      return simulatedElections[0].electionDate;
    }
    return activeCampaign?.viewingElectionNightForDate;
  }, [
    isSimulationMode,
    simulatedElections,
    activeCampaign?.viewingElectionNightForDate,
  ]);

  useEffect(() => {
    // Determine which set of elections to use: simulated or campaign
    const currentElectionsToLoad = isSimulationMode
      ? simulatedElections
      : activeCampaign?.elections;

    if (currentElectionsToLoad && electionDateForThisScreen) {
      const electionsToday = currentElectionsToLoad.filter(
        (e) =>
          e.electionDate.year === electionDateForThisScreen.year &&
          e.electionDate.month === electionDateForThisScreen.month &&
          e.electionDate.day === electionDateForThisScreen.day &&
          e.outcome?.status === "upcoming"
      );

      const initialSimData = electionsToday.map((election) => {
        let turnoutForSim = election.voterTurnoutPercentage;
        // If turnout is not explicitly set or is out of a reasonable range, generate a random one
        if (turnoutForSim == null || turnoutForSim < 5 || turnoutForSim > 95) {
          turnoutForSim = getRandomInt(30, 70); //
        }
        const eligibleVotersForSim =
          election.totalEligibleVoters ||
          Math.floor(
            ((election.entityDataSnapshot?.population || 1000) *
              calculateAdultPopulation(
                //
                1, // This parameter (adult population percentage) seems incorrectly used or is a placeholder in calculateAdultPopulation
                election.entityDataSnapshot?.demographics
              )) /
              (election.entityDataSnapshot?.demographics ? 100 : 1) || 0.7
          );
        const totalExpectedVotes = Math.max(
          0,
          Math.round(eligibleVotersForSim * (turnoutForSim / 100))
        );

        let simEntities = [];

        if (isSimulationMode && election.candidates) {
          simEntities = Array.from(election.candidates.values()).map(
            (entity) => ({
              ...entity,
              currentVotes: 0,
              basePolling: entity.baseScore || entity.polling || 1,
            })
          );

          if (
            election.electoralSystem === "PartyListPR" &&
            simEntities.some((e) => e.isPartyEntity)
          ) {
            election.livePartyResults = simEntities.map((p) => ({
              partyId: p.id,
              partyName: p.name,
              partyColor: p.partyColor,
              currentVotes: 0,
            }));
          }
        } else {
          // Existing logic for campaign elections (PartyListPR, MMP, other systems)
          console.log(
            `--- [SimSetup] Processing: ${election.officeName} (ID: ${election.id}, System: ${election.electoralSystem}) ---`
          );
          if (election.electoralSystem === "PartyListPR") {
            console.log(`   PartyListPR: Populating parties for simulation.`);
            if (
              election.partyLists &&
              Object.keys(election.partyLists).length > 0
            ) {
              Object.entries(election.partyLists).forEach(
                ([partyId, individualCandidateListOnParty]) => {
                  const partyInfoFromSnapshots =
                    activeCampaign?.generatedPartiesSnapshot?.find(
                      (p) => p.id === partyId
                    ) ||
                    activeCampaign?.customPartiesSnapshot?.find(
                      (p) => p.id === partyId
                    );

                  const partyName =
                    partyInfoFromSnapshots?.name ||
                    election.partyListDetails?.[partyId]?.name ||
                    `Party ${partyId.slice(-4)}`;
                  const partyColor =
                    partyInfoFromSnapshots?.color ||
                    election.partyListDetails?.[partyId]?.color ||
                    "#888";

                  let partyBasePolling =
                    election.partyListDetails?.[partyId]?.basePopularity ||
                    election.partyListDetails?.[partyId]?.polling ||
                    partyInfoFromSnapshots?.popularity ||
                    10;

                  if (
                    partyBasePolling === 10 &&
                    individualCandidateListOnParty &&
                    individualCandidateListOnParty.length > 0
                  ) {
                    let sumListCandidatePolling = 0;
                    let countListCandidatePolling = 0;
                    individualCandidateListOnParty.forEach((c) => {
                      const candPolling = c.polling || c.baseScore;
                      if (typeof candPolling === "number") {
                        sumListCandidatePolling += candPolling;
                        countListCandidatePolling++;
                      }
                    });
                    if (countListCandidatePolling > 0) {
                      partyBasePolling =
                        sumListCandidatePolling / countListCandidatePolling;
                    }
                  }

                  simEntities.push({
                    id: partyId,
                    name: partyName,
                    partyName: partyName,
                    partyColor: partyColor,
                    currentVotes: 0,
                    basePolling: Math.max(1, partyBasePolling),
                    isPartyEntity: true,
                  });
                }
              );
            }
          } else if (election.electoralSystem === "MMP") {
            if (election.mmpData?.constituencyCandidatesByParty) {
              Object.values(
                election.mmpData.constituencyCandidatesByParty
              ).forEach((list) => {
                if (list && Array.isArray(list))
                  simEntities.push(
                    ...list.map((c) => ({ ...c, isPartyEntity: false }))
                  );
              });
            }
            if (election.mmpData?.independentConstituencyCandidates) {
              simEntities.push(
                ...election.mmpData.independentConstituencyCandidates.map(
                  (c) => ({ ...c, isPartyEntity: false })
                )
              );
            }
            if (simEntities.length === 0 && election.partyLists) {
              Object.values(election.partyLists).forEach((list) => {
                if (list && Array.isArray(list))
                  simEntities.push(
                    ...list.map((c) => ({
                      ...c,
                      isListCandidate: true,
                      isMMPListFallback: true,
                      isPartyEntity: false,
                    }))
                  );
              });
            }
          } else {
            // FIX: Convert the Map from the store to an Array for local state
            simEntities = Array.from(
              (election.candidates || new Map()).values()
            ).map((c) => ({
              ...c,
              isPartyEntity: false,
            }));
          }

          // FIX: The fallback check must now use .size and .values() for the Map
          if (simEntities.length === 0 && election.candidates?.size > 0) {
            simEntities = [...election.candidates.values()].map((c) => ({
              ...c,
              isPartyEntity: false,
            }));
          }
        }

        if (simEntities.length === 0) {
          console.error(
            `---> [SimSetup] FINAL: NO ENTITIES (candidates/parties) for simulation for ${election.officeName}`
          );
        }

        return {
          ...election, // Original election data
          candidates: simEntities.map((entity) => ({
            ...entity,
            currentVotes: 0,
            basePolling:
              entity.basePolling ||
              (simEntities.length > 0
                ? Math.max(1, 100 / simEntities.length)
                : 1),
          })),
          livePartyResults:
            election.electoralSystem === "PartyListPR" &&
            simEntities.some((e) => e.isPartyEntity)
              ? simEntities.map((p) => ({ ...p, currentVotes: 0 }))
              : [],
          totalExpectedVotes,
          percentReported: 0,
          voterTurnoutPercentage: turnoutForSim,
          totalEligibleVoters: eligibleVotersForSim,
          isComplete:
            (totalExpectedVotes === 0 && simEntities.length > 0) ||
            simEntities.length === 0,
          winnerAnnounced: false,
        };
      });

      setLiveElections(initialSimData);
      const allInitiallyComplete = initialSimData.every((e) => e.isComplete);
      setAllSimulationsComplete(allInitiallyComplete);
      allSimulationsCompleteRef.current = allInitiallyComplete;

      const currentFeaturedIdInComponentState = featuredElectionId;
      if (initialSimData.length > 0) {
        const featuredStillValid = initialSimData.some(
          (e) => e.id === currentFeaturedIdInComponentState
        );
        if (!featuredStillValid) {
          setFeaturedElectionId(initialSimData[0].id);
        }
      } else {
        setFeaturedElectionId(null);
      }
    } else if (
      isSimulationMode &&
      (!currentElectionsToLoad || currentElectionsToLoad.length === 0)
    ) {
      // If in simulation mode but no elections are loaded, navigate back or show a message.
      console.warn(
        "No simulated elections found in simulation mode. Returning to Election Simulator."
      );
      navigateTo("ElectionSimulatorScreen");
      setIsSimulationMode(false); // Reset simulation mode
      clearSimulatedElections(); // Clear from store
    } else {
      // No campaign or date, so clear everything related to live simulation
      setLiveElections([]);
      setAllSimulationsComplete(true);
      allSimulationsCompleteRef.current = true;
      setFeaturedElectionId(null);
    }
    // Corrected dependencies for useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSimulationMode,
    simulatedElections,
    activeCampaign?.elections,
    electionDateForThisScreen,
    navigateTo,
    setIsSimulationMode,
    clearSimulatedElections,
  ]);

  const createAnnouncementData = useCallback(
    (election, sortedCandidatesFromSim) => {
      const officeName = election.officeName;
      const electionId = election.id;
      const electoralSystem = election.electoralSystem;
      const seatsToFill = election.numberOfSeatsToFill || 1;
      let projectedWinners = [];
      let noCand = false,
        noVote = false;

      if (!sortedCandidatesFromSim || sortedCandidatesFromSim.length === 0) {
        if (
          election.totalExpectedVotes > 0 &&
          election.candidates?.length === 0
        )
          noCand = true;
        else if (
          election.totalExpectedVotes === 0 &&
          election.candidates?.length > 0
        )
          noVote = true;
        else if (
          election.candidates?.length === 0 &&
          election.totalExpectedVotes === 0
        ) {
          noCand = true;
          noVote = true;
        }
      } else {
        projectedWinners = sortedCandidatesFromSim.slice(0, seatsToFill);
      }

      const modalWinners = projectedWinners.map((w) => ({
        id: w.id,
        name: w.name,
        partyName: w.partyName || "Independent",
        partyColor: w.partyColor || "#808080",
      }));

      if (noCand);
      else if (noVote && modalWinners.length === 0);
      else if (modalWinners.length > 0);

      return {
        officeName,
        winners: modalWinners,
        isMultiWinner: seatsToFill > 1,
        electionId,
        electoralSystem,
        noCandidates: noCand,
        noVotes: noVote,
      };
    },
    []
  );

  const runSimulationTick = useCallback(() => {
    setLiveElections((prevElections) => {
      let newLiveElectionsData = prevElections.map((e) => ({
        ...e,
        candidates: e.candidates.map((c) => ({ ...c })),
        livePartyResults: e.livePartyResults
          ? e.livePartyResults.map((pr) => ({ ...pr }))
          : [],
      }));
      let newlyCompletedForQueue = [];

      for (let i = 0; i < newLiveElectionsData.length; i++) {
        const election = newLiveElectionsData[i];

        if (election.isComplete) {
          if (!election.winnerAnnounced) {
            const entitiesForAnnouncement =
              election.electoralSystem === "PartyListPR"
                ? [...(election.livePartyResults || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  )
                : [...(election.candidates || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  );

            const annData = createAnnouncementData(
              election,
              entitiesForAnnouncement
            );
            if (annData) newlyCompletedForQueue.push(annData);
            newLiveElectionsData[i].winnerAnnounced = true;
          }
          continue;
        }

        const currentTotalSimulatedVotes = election.candidates.reduce(
          (s, entity) => s + (entity.currentVotes || 0),
          0
        );

        const remainingVotes = Math.max(
          0,
          election.totalExpectedVotes - currentTotalSimulatedVotes
        );

        let votesThisTick = 0;
        if (
          election.totalExpectedVotes === 0 ||
          election.candidates.length === 0
        ) {
          votesThisTick = 0;
        } else if (remainingVotes > 0) {
          votesThisTick = Math.min(
            remainingVotes,
            Math.max(
              1,
              Math.round(
                election.totalExpectedVotes * ((Math.random() * 1 + 0.5) / 100)
              )
            )
          );
        }

        if (votesThisTick > 0 && election.candidates.length > 0) {
          newLiveElectionsData[i].candidates =
            distributeVoteChunkProportionally(
              election.candidates,
              votesThisTick
            );
        }

        if (election.electoralSystem === "PartyListPR") {
          newLiveElectionsData[i].livePartyResults = newLiveElectionsData[
            i
          ].candidates.map((partyEntity) => ({
            partyId: partyEntity.id,
            partyName: partyEntity.name,
            partyColor: partyEntity.partyColor,
            currentVotes: partyEntity.currentVotes || 0,
          }));
        }

        const finalSumOfVotes = (
          election.electoralSystem === "PartyListPR" &&
          newLiveElectionsData[i].livePartyResults.length > 0
            ? newLiveElectionsData[i].livePartyResults
            : newLiveElectionsData[i].candidates
        ).reduce((s, entity) => s + (entity.currentVotes || 0), 0);

        const nowComplete =
          (election.electoralSystem === "PartyListPR"
            ? newLiveElectionsData[i].livePartyResults.length === 0
            : newLiveElectionsData[i].candidates.length === 0) ||
          election.totalExpectedVotes === 0 ||
          finalSumOfVotes >= election.totalExpectedVotes;

        if (nowComplete) {
          newLiveElectionsData[i].percentReported = 100;
          newLiveElectionsData[i].isComplete = true;
          if (!election.winnerAnnounced) {
            const entitiesForFinalAnnouncement =
              election.electoralSystem === "PartyListPR"
                ? [...(newLiveElectionsData[i].livePartyResults || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  )
                : [...(newLiveElectionsData[i].candidates || [])].sort(
                    (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
                  );

            const annData = createAnnouncementData(
              newLiveElectionsData[i],
              entitiesForFinalAnnouncement
            );
            if (annData) newlyCompletedForQueue.push(annData);
            newLiveElectionsData[i].winnerAnnounced = true;
          }
        } else if (election.totalExpectedVotes > 0) {
          newLiveElectionsData[i].percentReported = Math.min(
            (finalSumOfVotes / election.totalExpectedVotes) * 100,
            99.9
          );
        } else {
          newLiveElectionsData[i].percentReported = 100;
        }
      }

      if (newlyCompletedForQueue.length > 0) {
        const uniqueItems = newlyCompletedForQueue.filter(
          (item, idx, self) =>
            idx === self.findIndex((t) => t.electionId === item.electionId)
        );
        setWinnerAnnouncementQueue((queue) => {
          const currentIds = new Set(queue.map((item) => item.electionId));
          const toAdd = uniqueItems.filter(
            (item) => !currentIds.has(item.electionId)
          );
          return toAdd.length > 0 ? [...queue, ...toAdd] : queue;
        });
      }

      const allDone = newLiveElectionsData.every((e) => e.isComplete);
      if (allDone !== allSimulationsCompleteRef.current) {
        allSimulationsCompleteRef.current = allDone;
        setAllSimulationsComplete(allDone);
      }

      return newLiveElectionsData;
    });
  }, [createAnnouncementData]);

  useEffect(() => {
    if (
      isPaused ||
      allSimulationsCompleteRef.current ||
      liveElections.length === 0 ||
      isWinnerAnnouncementModalOpenGlobal
    )
      return;
    const timer = setTimeout(runSimulationTick, simulationSpeed);
    return () => clearTimeout(timer);
  }, [
    runSimulationTick,
    isPaused,
    simulationSpeed,
    liveElections,
    isWinnerAnnouncementModalOpenGlobal,
    allSimulationsCompleteRef,
  ]);

  useEffect(() => {
    if (
      winnerAnnouncementQueue.length > 0 &&
      !isWinnerAnnouncementModalOpenGlobal &&
      openWinnerAnnouncementModal
    ) {
      const nextAnnouncement = winnerAnnouncementQueue[0];
      openWinnerAnnouncementModal(nextAnnouncement);
      setWinnerAnnouncementQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [
    winnerAnnouncementQueue,
    isWinnerAnnouncementModalOpenGlobal,
    openWinnerAnnouncementModal,
  ]);

  const handleSkipToResults = useCallback(() => {
    setIsPaused(true);
    let announcements = [];
    setLiveElections((prev) =>
      prev.map((election) => {
        if (election.isComplete && election.winnerAnnounced) return election;
        const finalCands = distributeVoteChunkProportionally(
          election.candidates.map((c) => ({ ...c, currentVotes: 0 })),
          election.totalExpectedVotes
        );
        const sortedCands = [...finalCands].sort(
          (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0)
        );
        let annData = null;
        if (!election.winnerAnnounced)
          annData = createAnnouncementData(election, sortedCands);
        if (annData) announcements.push(annData);
        return {
          ...election,
          candidates: finalCands,
          percentReported: 100,
          isComplete: true,
          winnerAnnounced: election.winnerAnnounced || !!annData,
        };
      })
    );
    if (announcements.length > 0) {
      const uniqueAnns = announcements.filter(
        (item, idx, self) =>
          idx === self.findIndex((t) => t.electionId === item.electionId)
      );
      setWinnerAnnouncementQueue((queue) => {
        const currentIds = new Set(queue.map((item) => item.electionId));
        const toAdd = uniqueAnns.filter(
          (item) => !currentIds.has(item.electionId)
        );
        return toAdd.length > 0 ? [...queue, ...toAdd] : queue;
      });
    }
    setAllSimulationsComplete(true);
    allSimulationsCompleteRef.current = true;
  }, [createAnnouncementData]);

  const handleFinalizeAndContinue = () => {
    if (
      winnerAnnouncementQueue.length > 0 ||
      isWinnerAnnouncementModalOpenGlobal
    )
      return;
    liveElections.forEach((election) => {
      if (election.isComplete) {
        if (isSimulationMode) {
          clearSimulatedElections();
        } else {
          processElectionResults(election.id, election);
        }
      }
    });

    navigateTo(
      isSimulationMode ? "ElectionSimulatorScreen" : "CampaignGameScreen"
    );
  };

  const featuredElection = useMemo(
    () => liveElections.find((e) => e.id === featuredElectionId),
    [liveElections, featuredElectionId]
  );

  // Adjusted initial return condition for simulation mode
  // It should now wait if in simulation mode but no simulated elections are loaded yet
  if (!electionDateForThisScreen && !isSimulationMode) {
    return (
      <div className="election-night-screen-container">
        Loading election data...
      </div>
    );
  }
  // If in simulation mode, but simulatedElections array is empty, it also implies no data yet
  if (
    isSimulationMode &&
    (!simulatedElections || simulatedElections.length === 0)
  ) {
    return (
      <div className="election-night-screen-container">
        Preparing simulation...
      </div>
    );
  }

  return (
    <>
      <div className="election-night-screen-container new-layout">
        <div className="election-night-main-header">
          <div className="header-title-date">
            <h1 className="important-heading">Election Night Live</h1>
            <p className="header-date">
              Date: {electionDateForThisScreen?.month}/
              {electionDateForThisScreen?.day}/{electionDateForThisScreen?.year}
            </p>
          </div>
          <div className="header-controls">
            <div className="simulation-controls">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="action-button small-button"
                disabled={
                  allSimulationsCompleteRef.current &&
                  winnerAnnouncementQueue.length === 0 &&
                  !isWinnerAnnouncementModalOpenGlobal
                }
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              {Object.entries(SIMULATION_SPEEDS).map(
                ([speedKey, speedValue]) => (
                  <button
                    key={speedKey}
                    onClick={() => setSimulationSpeed(speedValue)}
                    className={`action-button small-button speed-button ${
                      simulationSpeed === speedValue ? "active" : ""
                    }`}
                  >
                    {speedKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </button>
                )
              )}
            </div>
            <WinnerAnnouncementModal
              isOpen={isWinnerAnnouncementModalOpenGlobal} // Use store state
              onClose={() => {
                if (closeWinnerAnnouncementModal)
                  closeWinnerAnnouncementModal();
              }}
              winnerData={winnerAnnouncementDataGlobal} // Use store state
            />
            <div className="finalize-controls">
              {!allSimulationsCompleteRef.current && (
                <button
                  onClick={handleSkipToResults}
                  className="action-button small-button button-delete"
                >
                  Skip to Results
                </button>
              )}
              {allSimulationsCompleteRef.current && (
                <button
                  onClick={handleFinalizeAndContinue}
                  className="action-button small-button continue-button"
                  disabled={
                    winnerAnnouncementQueue.length > 0 ||
                    isWinnerAnnouncementModalOpenGlobal
                  }
                >
                  Finalize & Continue
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="election-night-body-layout">
          <div className="main-election-panel">
            {featuredElection ? (
              <FeaturedElectionCard
                election={featuredElection}
                openViewPoliticianModal={openViewPoliticianModal}
              />
            ) : liveElections.length > 0 ? (
              <div className="featured-election-placeholder">
                Select an election from the list to view details.
              </div>
            ) : (
              <p className="no-results">
                No elections being simulated for this date.
              </p>
            )}
          </div>
          <aside className="elections-sidebar-list">
            <h4>All Races</h4>
            {liveElections.length > 0 ? (
              <ul>
                {liveElections.map((election) => (
                  <ElectionListItem
                    key={election.id}
                    election={election}
                    onSelect={setFeaturedElectionId}
                    isSelected={featuredElectionId === election.id}
                  />
                ))}
              </ul>
            ) : (
              <p>No election races.</p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default ElectionNightScreen;
