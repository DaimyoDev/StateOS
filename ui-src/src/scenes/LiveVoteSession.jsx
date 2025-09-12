import React, { useState, useEffect, useMemo } from "react";
import useGameStore from "../store";
import { decideAIVote } from "../simulation/aiVoting";
import { getLegislatureDetails, getStatsForLevel } from "../utils/legislationUtils";
import { CITY_POLICIES } from "../data/cityPolicyDefinitions";
import { STATE_POLICIES } from "../data/statePolicyDefinitions";
import { FEDERAL_POLICIES } from "../data/nationalPolicyDefinitions";
import { GENERAL_POLICIES } from "../data/generalPolicyDefinitions";
import { COMMITTEE_TYPES } from "../data/legislativeCommittees";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./LiveVoteSession.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const LiveVoteSession = () => {
  // --- 1. Select state from the store ---
  const session = useGameStore((state) => state.activeVotingSessionDetails); // { billId, level }
  const playerId = useGameStore((state) => state.activeCampaign?.playerPoliticianId);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const governmentOffices = useMemo(() => {
    const state = useGameStore.getState();
    if (!state.activeVotingSessionDetails) return [];
    const level = state.activeVotingSessionDetails.level;
    const cityId = level === 'city' ? state.activeCampaign?.startingCity?.id : null;
    const stateId = (level === 'state' || level === 'city') ? state.activeCampaign?.regionId : null;
    return state.actions.getGovernmentOfficesForContext(level, cityId, stateId);
  }, [session, activeCampaign]);
  const { endVotingSession, recordCouncilVote } = useGameStore((state) => state.actions);

  // --- 2. Derive complex data from the raw state using useMemo. ---
  // This logic will only re-run when its dependencies (the raw state above) change.
  const bill = useGameStore((state) => {
    if (!session) return null;
    const { billId, level } = session;
    const levelSlice = state[level];
    if (!levelSlice?.proposedBills) return null;
    return levelSlice.proposedBills.find((b) => b.id === billId) || null;
  });

  // Determine if this is a committee vote or full legislature vote
  const isCommitteeVote = useMemo(() => {
    return bill?.currentStage && (
      bill.currentStage.includes('committee') || 
      bill.currentStage === 'committee_assignment' ||
      bill.currentStage === 'committee_markup' ||
      bill.currentStage === 'committee_review'
    );
  }, [bill]);

  // Get committee members if this is a committee vote - using stored committees
  const committeeMembers = useMemo(() => {
    if (!isCommitteeVote || !bill) return [];
    
    console.log(`[Committee Vote] Bill: ${bill.name}, Level: ${bill.level}`);
    console.log(`[Committee Vote] Bill policies:`, bill.policies);
    
    // Determine which committee should handle this bill based on its policies
    const relevantCommitteeType = getRelevantCommitteeForBill(bill);
    console.log(`[Committee Vote] Determined relevant committee type: ${relevantCommitteeType}`);
    if (!relevantCommitteeType) return [];

    // Get the government offices structure from the store
    const governmentOfficesStructure = useGameStore.getState().activeCampaign?.governmentOffices;
    if (!governmentOfficesStructure) {
      console.log(`[Committee Vote] No government offices structure found`);
      return [];
    }

    // Find the appropriate committee based on bill level and committee type
    let targetCommittee = null;
    
    if (bill.level === 'national') {
      targetCommittee = governmentOfficesStructure.national?.legislative?.committees?.find(
        committee => committee.committeeType === relevantCommitteeType
      );
    } else if (bill.level === 'state') {
      // Get the current region/state ID from the campaign
      const currentRegionId = useGameStore.getState().activeCampaign?.regionId;
      if (currentRegionId && governmentOfficesStructure.states?.[currentRegionId]) {
        targetCommittee = governmentOfficesStructure.states[currentRegionId].legislative?.committees?.find(
          committee => committee.committeeType === relevantCommitteeType
        );
      }
    } else if (bill.level === 'city') {
      // Get the current city ID from the campaign
      const currentCityId = useGameStore.getState().activeCampaign?.startingCity?.id;
      if (currentCityId && governmentOfficesStructure.cities?.[currentCityId]) {
        targetCommittee = governmentOfficesStructure.cities[currentCityId].committees?.find(
          committee => committee.committeeType === relevantCommitteeType
        );
      }
    }

    if (!targetCommittee) {
      console.log(`[Committee Vote] No ${relevantCommitteeType} committee found for ${bill.level} level`);
      return [];
    }

    console.log(`[Committee Vote] Found stored committee: ${targetCommittee.name} with ${targetCommittee.members?.length || 0} members`);

    // Extract the actual politicians from the committee members
    const committeeMembers = (targetCommittee.members || []).map(office => {
      const politician = office.holder;
      if (!politician) return null;
      
      return {
        ...politician,
        partyName: politician.partyName || politician.party || politician.partyAffiliation || 'Independent'
      };
    }).filter(Boolean);

    console.log(`[Committee Vote] Using stored ${targetCommittee.name} with ${committeeMembers.length} members:`, 
      committeeMembers.map(m => ({id: m.id, name: `${m.firstName} ${m.lastName}`, party: m.partyName})));
    
    return committeeMembers;
  }, [isCommitteeVote, bill]);

  // Get voting members (either committee or full legislature)
  const votingMembers = useMemo(() => {
    if (isCommitteeVote) {
      return committeeMembers;
    }
    if (!activeCampaign || !session) return [];
    return getLegislatureDetails(activeCampaign, session.level)?.members || [];
  }, [isCommitteeVote, committeeMembers, activeCampaign, session]);

  const playerIsVoter = useMemo(() => {
    const playerId = useGameStore.getState().activeCampaign?.playerPoliticianId;
    return votingMembers.some((m) => m.id === playerId);
  }, [votingMembers]);

  // Helper function to determine relevant committee for a bill
  function getRelevantCommitteeForBill(bill) {
    if (!bill || !bill.policies || bill.policies.length === 0) return 'JUDICIARY';
    
    const policyId = bill.policies[0].policyId;
    
    // Map policy types to committees (simplified mapping)
    const policyCommitteeMap = {
      'budget': 'FINANCE',
      'tax': 'FINANCE', 
      'finance': 'FINANCE',
      'education': 'EDUCATION',
      'health': 'HEALTH',
      'environment': 'ENVIRONMENT',
      'agriculture': 'AGRICULTURE',
      'transportation': 'TRANSPORTATION',
      'commerce': 'COMMERCE',
      'defense': 'DEFENSE',
      'foreign': 'FOREIGN_AFFAIRS',
    };
    
    // Find matching committee based on policy ID keywords
    for (const [keyword, committee] of Object.entries(policyCommitteeMap)) {
      if (policyId.toLowerCase().includes(keyword)) {
        return committee;
      }
    }
    
    // Default to Judiciary for legal/general policies
    return 'JUDICIARY';
  }

  const activeLegislation = useGameStore((state) => (session ? state[session.level]?.activeLegislation : []));
  const proposedBillsForLevel = useGameStore((state) => (session ? state[session.level]?.proposedBills : []));
  const relevantStats = useMemo(() => (session ? getStatsForLevel(activeCampaign, session.level) : null), [activeCampaign, session]);

  // Get policy definitions for the current level
  const getPolicyDefinitionsForLevel = (level) => {
    const allPolicies = [...CITY_POLICIES, ...STATE_POLICIES, ...FEDERAL_POLICIES, ...GENERAL_POLICIES];
    const policyMap = {};
    allPolicies.forEach(policy => {
      policyMap[policy.id] = policy;
    });
    return policyMap;
  };

  const allPolicyDefsForLevel = useMemo(() => {
    return session ? getPolicyDefinitionsForLevel(session.level) : {};
  }, [session]);

  // --- Component State & Effects ---
  const [timeScale, setTimeScale] = useState(1);

  useEffect(() => {
    if (!bill || !session) return;

    // Only check for votes from current voting members, ignore old votes from different stages
    const currentVotesCast = bill.councilVotesCast || {};
    const votingMemberIds = new Set(votingMembers.map(m => m.id));
    
    const unvotedMembers = votingMembers.filter(
      (m) => m.id !== playerId && !currentVotesCast[m.id]
    );
    if (unvotedMembers.length === 0) return;

    const interval = setInterval(() => {
      const memberToVote = unvotedMembers.shift(); // Changed from pop() to shift()
      if (memberToVote) {
        const voteChoice = decideAIVote(
          memberToVote,
          bill,
          relevantStats,
          activeLegislation,
          proposedBillsForLevel,
          governmentOffices,
          allPolicyDefsForLevel
        );
        recordCouncilVote(bill.id, memberToVote.id, voteChoice);
      }
    }, 2000 / timeScale);

    return () => clearInterval(interval);
  }, [
    bill,
    votingMembers,
    timeScale,
    relevantStats,
    activeLegislation,
    proposedBillsForLevel,
    governmentOffices,
    allPolicyDefsForLevel,
    recordCouncilVote,
    playerId,
    session,
  ]);

  useEffect(() => {
    if (!bill || votingMembers.length === 0) return;

    // Only count votes from current voting members
    const currentVotesCast = bill.councilVotesCast || {};
    const votingMemberIds = new Set(votingMembers.map(m => m.id));
    
    const votesFromCurrentMembers = Object.entries(currentVotesCast)
      .filter(([memberId, vote]) => votingMemberIds.has(memberId)).length;
    const totalVoters = votingMembers.length;

    if (votesFromCurrentMembers >= totalVoters) {
      const timer = setTimeout(() => {
        endVotingSession();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [bill, votingMembers, endVotingSession]);

  const handlePlayerVote = (voteChoice) => {
    recordCouncilVote(bill.id, playerId, voteChoice);
  };

  const handleSkip = () => {
    const currentVotesCast = bill.councilVotesCast || {};
    
    votingMembers.forEach((m) => {
      if (m.id !== playerId && !currentVotesCast[m.id]) {
        const voteChoice = decideAIVote(
          m,
          bill,
          relevantStats,
          activeLegislation,
          proposedBillsForLevel,
          governmentOffices,
          allPolicyDefsForLevel
        );
        recordCouncilVote(bill.id, m.id, voteChoice);
      }
    });
    setTimeout(endVotingSession, 1000);
  };

  // Calculate vote tallies by party
  const votesByParty = useMemo(() => {
    const partyVotes = {};
    const currentVotesCast = bill.councilVotesCast || {};
    
    votingMembers.forEach((member) => {
      // Try multiple possible party field names
      const partyName = member.partyName || member.party || member.partyAffiliation || 'Independent';
      const vote = currentVotesCast[member.id] || 'pending';
      
      if (!partyVotes[partyName]) {
        partyVotes[partyName] = { yea: 0, nay: 0, abstain: 0, pending: 0 };
      }
      partyVotes[partyName][vote]++;
    });
    return partyVotes;
  }, [votingMembers, bill.councilVotesCast]);

  // Calculate vote counts from councilVotesCast, but only count votes from current voting members
  const currentVotesCast = bill.councilVotesCast || {};
  const votingMemberIds = new Set(votingMembers.map(m => m.id));
  
  // Only count votes from current voting members to avoid counting old votes from different stages
  const relevantVotes = Object.entries(currentVotesCast)
    .filter(([memberId, vote]) => votingMemberIds.has(memberId))
    .map(([memberId, vote]) => vote);
  
  const yeaCount = relevantVotes.filter(vote => vote === 'yea').length;
  const nayCount = relevantVotes.filter(vote => vote === 'nay').length;
  const abstainCount = relevantVotes.filter(vote => vote === 'abstain').length;

  // Chart data for overall vote distribution
  const pendingCount = Math.max(0, votingMembers.length - yeaCount - nayCount - abstainCount);

  // Resolve theme colors from CSS variables (with sensible fallbacks)
  const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const cssVar = (name, fallback) => {
    if (!rootStyles) return fallback;
    const v = rootStyles.getPropertyValue(name).trim();
    return v || fallback;
  };

  const colorSuccess = cssVar('--success-text', '#22c55e');
  const colorSuccessHover = cssVar('--success-text-hover', colorSuccess);
  const colorError = cssVar('--error-text', '#ef4444');
  const colorErrorHover = cssVar('--error-text-hover', colorError);
  const colorSecondary = cssVar('--secondary-text', '#6b7280');
  const colorDisabled = cssVar('--disabled-text', '#9ca3af');

  const voteChartData = {
    labels: ['Yea', 'Nay', 'Abstain', 'Pending'],
    datasets: [{
      data: [yeaCount, nayCount, abstainCount, pendingCount],
      backgroundColor: [colorSuccess, colorError, colorSecondary, colorDisabled],
      borderColor: [colorSuccessHover, colorErrorHover, colorSecondary, colorDisabled],
      borderWidth: 2
    }]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: cssVar('--secondary-text', '#e5e7eb'),
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: cssVar('--ui-panel-bg', 'rgba(0, 0, 0, 0.85)'),
        titleColor: cssVar('--primary-text', '#e5e7eb'),
        bodyColor: cssVar('--primary-text', '#e5e7eb'),
        borderColor: cssVar('--border-color', '#4b5563'),
        borderWidth: 1
      }
    }
  };

  if (!bill) return null;

  const playerVote = bill.councilVotesCast
    ? bill.councilVotesCast[playerId]
    : undefined;

  return (
    <div className="live-vote-session-overlay">
      <div className="live-vote-panel">
        <div className="vote-session-header">
          <h2>{isCommitteeVote ? 'COMMITTEE VOTE IN SESSION' : 'FLOOR VOTE IN SESSION'}</h2>
          <h3>{bill.name}</h3>
          <p>Proposed by: {bill.proposerName}</p>
          {isCommitteeVote && (
            <p className="committee-info">
              <span className="committee-stage">
                {bill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Stage
              </span>
              • {votingMembers.length} Committee Members
            </p>
          )}
        </div>
        
        <div className="vote-session-content">
          {/* Left Panel - Voters List */}
          <div className="voters-panel">
            <h4>{isCommitteeVote ? 'Committee Members' : 'Legislature Members'}</h4>
            <ul className="council-voter-list">
              {votingMembers.map((m) => {
                const currentVote = bill.councilVotesCast
                  ? bill.councilVotesCast[m.id]
                  : "pending";
                return (
                  <li
                    key={m.id}
                    className={`voter-status-${currentVote || "pending"}`}
                  >
                    <div className="voter-info">
                      <span className="voter-name">
                        {m.firstName || m.name} {m.lastName || ""}
                      </span>
                      <span className="voter-party">
                        {(m.partyName || m.party || m.partyAffiliation) ? `(${m.partyName || m.party || m.partyAffiliation})` : "(Independent)"}
                      </span>
                    </div>
                    <span className="vote-status">
                      {currentVote ? currentVote.toUpperCase() : "PENDING"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Panel - Vote Tallies and Charts */}
          <div className="tallies-panel">
            <div className="vote-summary">
              <h4>Vote Tally</h4>
              <div className="vote-tally">
                <div className="tally-item tally-yea">
                  <span className="tally-number">{yeaCount}</span>
                  <span className="tally-label">Yea</span>
                </div>
                <div className="tally-item tally-nay">
                  <span className="tally-number">{nayCount}</span>
                  <span className="tally-label">Nay</span>
                </div>
                <div className="tally-item tally-abstain">
                  <span className="tally-number">{abstainCount}</span>
                  <span className="tally-label">Abstain</span>
                </div>
                <div className="tally-item tally-pending">
                  <span className="tally-number">{votingMembers.length - yeaCount - nayCount - abstainCount}</span>
                  <span className="tally-label">Pending</span>
                </div>
              </div>
            </div>

            <div className="vote-chart">
              <h4>Vote Distribution</h4>
              <div className="chart-container">
                <Pie data={voteChartData} options={chartOptions} />
              </div>
            </div>

            <div className="party-breakdown">
              <h4>By Party</h4>
              <div className="party-votes">
                {Object.entries(votesByParty).map(([partyName, votes]) => (
                  <div key={partyName} className="party-vote-row">
                    <span className="party-name">{partyName}</span>
                    <div className="party-vote-counts">
                      <span className="party-yea">Y: {votes.yea}</span>
                      <span className="party-nay">N: {votes.nay}</span>
                      <span className="party-abstain">A: {votes.abstain}</span>
                      {votes.pending > 0 && <span className="party-pending">P: {votes.pending}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="vote-session-footer">
          {playerIsVoter && !playerVote && (
            <div className="player-vote-actions">
              <button
                className="action-button positive"
                onClick={() => handlePlayerVote("yea")}
              >
                Vote Yea
              </button>
              <button
                className="action-button critical"
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
          {playerIsVoter && playerVote && (
            <div className="player-voted-message">
              You voted: {playerVote.toUpperCase()}
            </div>
          )}
          <div className="session-controls">
            <span>Speed:</span>
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
    </div>
  );
};

export default LiveVoteSession;
