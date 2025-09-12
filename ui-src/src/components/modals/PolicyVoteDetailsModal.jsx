import React, { useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./PolicyVoteDetailsModal.css";
import { CITY_POLICIES } from "../../data/cityPolicyDefinitions";
import { STATE_POLICIES } from "../../data/statePolicyDefinitions";
import { FEDERAL_POLICIES } from "../../data/nationalPolicyDefinitions";
import { GENERAL_POLICIES } from "../../data/generalPolicyDefinitions";

const allPolicies = {
  city: [...CITY_POLICIES, ...GENERAL_POLICIES],
  state: [...STATE_POLICIES, ...GENERAL_POLICIES],
  national: [...FEDERAL_POLICIES, ...GENERAL_POLICIES],
};

const getPolicyDetailsText = (policyInBill, billLevel = 'city') => {
  const policySet = allPolicies[billLevel] || allPolicies.city;
  const fullPolicyData = policySet.find(
    (p) => p.id === policyInBill.policyId
  );
  if (!fullPolicyData) return "Policy data not found.";

  if (!fullPolicyData.isParameterized || !policyInBill.chosenParameters) {
    return fullPolicyData.description;
  }

  const details = fullPolicyData.parameterDetails;
  const value = policyInBill.chosenParameters[details.key];
  const formattedValue = Math.abs(value).toLocaleString();
  const unit = details.unit === "$" ? "$" : "";
  const unitSuffix = details.unit !== "$" ? ` ${details.unit}` : "";

  if (details.adjustmentType === "increase_or_decrease") {
    if (value > 0) {
      return `Increases the ${
        details.targetBudgetLine || "budget"
      } by ${unit}${formattedValue}${unitSuffix}.`;
    } else if (value < 0) {
      return `Decreases the ${
        details.targetBudgetLine || "budget"
      } by ${unit}${formattedValue}${unitSuffix}.`;
    } else {
      return `Proposes no change to the ${
        details.targetBudgetLine || "budget"
      }.`;
    }
  } else {
    return `Funds this initiative with ${unit}${formattedValue}${unitSuffix}.`;
  }
};

const PolicyVoteDetailsModal = ({ isOpen, onClose, proposalData }) => {
  const governmentOffices = useGameStore(
    (state) => state.activeCampaign.governmentOffices
  );

  const voteBreakdown = useMemo(() => {
    if (!proposalData || !proposalData.councilVotesCast || !governmentOffices) {
      return { yea: [], nay: [], abstain: [], byParty: [] };
    }

    // 1. Create a quick-lookup map of all council members
    const councilMembersMap = new Map();
    const councilOffice = governmentOffices.find((o) =>
      o.officeNameTemplateId.includes("council")
    );
    if (councilOffice && councilOffice.members) {
      councilOffice.members.forEach((member) => {
        councilMembersMap.set(member.id, {
          name: `${member.firstName} ${member.lastName}`,
          partyName: member.partyName || "Independent",
          partyColor: member.partyColor || "#888",
        });
      });
    }

    // 2. Resolve voter names using the map
    const resolveVoter = (memberId) =>
      councilMembersMap.get(memberId) || {
        name: `ID: ${memberId}`,
        partyName: "Unknown",
      };

    // Extract voters from councilVotesCast
    const yeaVoters = [];
    const nayVoters = [];
    const abstainVoters = [];
    
    Object.entries(proposalData.councilVotesCast).forEach(([memberId, vote]) => {
      const voter = resolveVoter(memberId);
      if (vote === 'yea' || vote === 'YEA' || vote === 'YEA_PLAYER') {
        yeaVoters.push(voter);
      } else if (vote === 'nay' || vote === 'NAY' || vote === 'NAY_PLAYER') {
        nayVoters.push(voter);
      } else if (vote === 'abstain' || vote === 'ABSTAIN' || vote === 'ABSTAIN_PLAYER') {
        abstainVoters.push(voter);
      }
    });

    // 3. Aggregate votes by party
    const byParty = new Map();
    Object.entries(proposalData.councilVotesCast).forEach(
      ([memberId, vote]) => {
        const details = councilMembersMap.get(memberId);
        if (!details) return;

        if (!byParty.has(details.partyName)) {
          byParty.set(details.partyName, {
            name: details.partyName,
            color: details.partyColor,
            yea: 0,
            nay: 0,
            abstain: 0,
          });
        }

        const partyVote = byParty.get(details.partyName);
        if (vote === "yea" || vote === "YEA" || vote === "YEA_PLAYER") partyVote.yea++;
        else if (vote === "nay" || vote === "NAY" || vote === "NAY_PLAYER") partyVote.nay++;
        else if (vote === "abstain" || vote === "ABSTAIN" || vote === "ABSTAIN_PLAYER") partyVote.abstain++;
      }
    );

    return {
      yea: yeaVoters,
      nay: nayVoters,
      abstain: abstainVoters,
      byParty: Array.from(byParty.values()),
    };
  }, [proposalData, governmentOffices]);

  if (!isOpen || !proposalData) {
    return null;
  }

  const { name, policies } = proposalData;
  const totalYea = voteBreakdown.yea.length;
  const totalNay = voteBreakdown.nay.length;
  const totalAbstain = voteBreakdown.abstain.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vote Results: ${name}`}
      isLarge={true}
    >
      <div className="policy-vote-details-modal-content">
        <h3>{name}</h3>

        <div className="details-section">
          <h4>Bill Contents</h4>
          <ul className="policy-list-briefing">
            {policies.map((p) => (
              <li key={p.policyId}>
                <strong>{p.policyName}</strong>
                <p className="policy-detail-text">{getPolicyDetailsText(p, proposalData.level)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="vote-summary-tally">
          <h4>Overall Tally</h4>
          <div className="tally-counts">
            <span className="tally-yea">Yea: {totalYea}</span>
            <span className="tally-nay">Nay: {totalNay}</span>
            <span className="tally-abstain">Abstain: {totalAbstain}</span>
          </div>
        </div>

        <div className="vote-details-columns">
          <div className="vote-column">
            <h4>Voted Yea ({totalYea})</h4>
            <ul>
              {voteBreakdown.yea.map((v, i) => (
                <li key={i}>{v.name}</li>
              ))}
            </ul>
          </div>
          <div className="vote-column">
            <h4>Voted Nay ({totalNay})</h4>
            <ul>
              {voteBreakdown.nay.map((v, i) => (
                <li key={i}>{v.name}</li>
              ))}
            </ul>
          </div>
          <div className="vote-column">
            <h4>Abstained ({totalAbstain})</h4>
            <ul>
              {voteBreakdown.abstain.map((v, i) => (
                <li key={i}>{v.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="party-vote-breakdown-section">
          <h4>Vote Breakdown by Party</h4>
          {voteBreakdown.byParty.length > 0 ? (
            <div className="party-vote-chart-container">
              <ul className="party-vote-list">
                {voteBreakdown.byParty.map((party) => (
                  <li
                    key={party.name}
                    style={{ borderLeftColor: party.color || "#ccc" }}
                  >
                    <strong>{party.name}</strong>
                    <div>
                      <span className="party-vote-yea">Yea: {party.yea}</span>
                      <span className="party-vote-nay">Nay: {party.nay}</span>
                      <span className="party-vote-abstain">
                        Abs: {party.abstain}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No party voting data available.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="action-button close-vote-details-button"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default PolicyVoteDetailsModal;
