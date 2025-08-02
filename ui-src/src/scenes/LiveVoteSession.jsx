import React, { useState, useEffect, useMemo } from "react";
import useGameStore from "../store";
import { decideAIVote } from "../simulation/aiVoting";
import "./LiveVoteSession.css";

const LiveVoteSession = () => {
  // --- 1. Select individual, raw state properties from the store. ---
  // This is the most stable and performant way to get data from Zustand.
  const billId = useGameStore((state) => state.activeVotingSessionBillId);
  const proposedBills = useGameStore((state) => state.proposedBills);
  const governmentOffices = useGameStore(
    (state) => state.activeCampaign.governmentOffices
  );
  const cityStats = useGameStore(
    (state) => state.activeCampaign.startingCity.stats
  );
  const activeLegislation = useGameStore((state) => state.activeLegislation);
  const playerId = useGameStore((state) => state.activeCampaign.politician.id);
  const { endVotingSession, recordCouncilVote } = useGameStore(
    (state) => state.actions
  );

  // --- 2. Derive complex data from the raw state using useMemo. ---
  // This logic will only re-run when its dependencies (the raw state above) change.
  const bill = useMemo(
    () => proposedBills.find((b) => b.id === billId),
    [proposedBills, billId]
  );

  const councilMembers = useMemo(
    () =>
      governmentOffices?.find((o) => o.officeNameTemplateId.includes("council"))
        ?.members || [],
    [governmentOffices]
  );

  const playerIsVoter = useMemo(
    () => councilMembers.some((m) => m.id === playerId),
    [councilMembers, playerId]
  );

  // --- Component State & Effects ---
  const [timeScale, setTimeScale] = useState(1);

  useEffect(() => {
    if (!bill) return;

    const unvotedMembers = councilMembers.filter(
      (m) =>
        !m.isPlayer && !(bill.councilVotesCast && bill.councilVotesCast[m.id])
    );
    if (unvotedMembers.length === 0) return;

    const interval = setInterval(() => {
      const memberToVote = unvotedMembers.pop();
      if (memberToVote) {
        const voteChoice = decideAIVote(
          memberToVote,
          bill,
          cityStats,
          activeLegislation,
          proposedBills,
          governmentOffices
        );
        recordCouncilVote(bill.id, memberToVote.id, voteChoice);
      }
    }, 2000 / timeScale);

    return () => clearInterval(interval);
  }, [
    bill,
    councilMembers,
    timeScale,
    cityStats,
    activeLegislation,
    proposedBills,
    governmentOffices,
    recordCouncilVote,
  ]);

  useEffect(() => {
    if (!bill || councilMembers.length === 0) return;

    const totalVotesCast = Object.keys(bill.councilVotesCast || {}).length;
    const totalVoters = councilMembers.length;

    if (totalVotesCast >= totalVoters) {
      // Everyone has voted, end the session after a short delay
      const timer = setTimeout(() => {
        endVotingSession();
      }, 2000); // Wait 2 seconds to show the final tally

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [bill, councilMembers, endVotingSession]);

  const handlePlayerVote = (voteChoice) => {
    recordCouncilVote(bill.id, playerId, voteChoice);
  };

  const handleSkip = () => {
    councilMembers.forEach((m) => {
      if (
        !m.isPlayer &&
        !(bill.councilVotesCast && bill.councilVotesCast[m.id])
      ) {
        const voteChoice = decideAIVote(
          m,
          bill,
          cityStats,
          activeLegislation,
          proposedBills,
          governmentOffices
        );
        recordCouncilVote(bill.id, m.id, voteChoice);
      }
    });
    setTimeout(endVotingSession, 1000);
  };

  if (!bill) return null;

  const playerVote = bill.councilVotesCast
    ? bill.councilVotesCast[playerId]
    : undefined;
  const yeaCount = bill.votes?.yea?.length || 0;
  const nayCount = bill.votes?.nay?.length || 0;
  const abstainCount = bill.votes?.abstain?.length || 0;

  return (
    <div className="live-vote-session-overlay">
      <div className="live-vote-panel">
        <h2>VOTING IN SESSION</h2>
        <h3>{bill.name}</h3>
        <p>Proposed by: {bill.proposerName}</p>
        <div className="vote-tally">
          <span className="tally-yea">Yea: {yeaCount}</span>
          <span className="tally-nay">Nay: {nayCount}</span>
          <span className="tally-abstain">Abstain: {abstainCount}</span>
        </div>
        <ul className="council-voter-list">
          {councilMembers.map((m) => {
            const currentVote = bill.councilVotesCast
              ? bill.councilVotesCast[m.id]
              : "pending";
            return (
              <li
                key={m.id}
                className={`voter-status-${currentVote || "pending"}`}
              >
                {m.firstName} {m.lastName} ({m.partyName})
                <span>
                  {currentVote ? currentVote.toUpperCase() : "PENDING"}
                </span>
              </li>
            );
          })}
        </ul>
        {playerIsVoter && !playerVote && (
          <div className="player-vote-actions">
            <button
              className="action-button"
              onClick={() => handlePlayerVote("yea")}
            >
              Vote Yea
            </button>
            <button
              className="action-button"
              onClick={() => handlePlayerVote("nay")}
            >
              Vote Nay
            </button>
            <button
              className="menu-button"
              onClick={() => handlePlayerVote("abstain")}
            >
              Abstain
            </button>
          </div>
        )}
        <div className="session-controls">
          <button className="menu-button" onClick={() => setTimeScale(1)}>
            1x
          </button>
          <button className="menu-button" onClick={() => setTimeScale(2)}>
            2x
          </button>
          <button className="menu-button" onClick={() => setTimeScale(4)}>
            4x
          </button>
          <button className="action-button" onClick={handleSkip}>
            Skip to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveVoteSession;
