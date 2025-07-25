import React, { useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./PolicyVoteDetailsModal.css";

const PolicyVoteDetailsModal = ({ isOpen, onClose, proposalData }) => {
  const activeCampaign = useGameStore((state) => state.activeCampaign);

  const { governmentOffices = [], startingCity } = activeCampaign;
  const startingCityName = startingCity?.name || "";

  // Memoize processed vote data to avoid re-calculation on every render
  const voteBreakdown = useMemo(() => {
    if (
      !proposalData ||
      !proposalData.votes ||
      !proposalData.councilVotesCast
    ) {
      return { yea: [], nay: [], abstain: [], byParty: {} };
    }

    const getCouncilMemberDetails = (memberId) => {
      // Iterate through all government offices to find the specific memberId
      for (const office of governmentOffices) {
        // Check if it's a council office at the relevant level (local_city) and city
        if (
          office.officeNameTemplateId.includes("council") &&
          office.level === "local_city" &&
          office.officeName.includes(startingCityName)
        ) {
          // Case 1: The memberId is the single holder of this office (e.g., Mayor, but could apply to single-member council districts)
          if (office.holder?.id === memberId) {
            return {
              name:
                office.holder.name ||
                `${office.holder.firstName} ${office.holder.lastName}`,
              partyName: office.holder.partyName,
              partyColor: office.holder.partyColor,
            };
          }

          // Case 2: The office has a list of members (common for councils)
          if (office.members && office.members.length > 0) {
            const foundMember = office.members.find(
              (member) => member.id === memberId // CORRECTED: Directly check member.id
            );

            if (foundMember) {
              return {
                name:
                  foundMember.name ||
                  `${foundMember.firstName} ${foundMember.lastName}`,
                partyName: foundMember.partyName,
                partyColor: foundMember.partyColor,
              };
            }
          }
        }
      }

      // If no matching member/holder is found after checking all offices
      return {
        name: `ID: ${memberId}`,
        partyName: "Unknown Party",
        partyColor: "#888",
      };
    };

    const yeaVoters = (proposalData.votes.yea || []).map(
      getCouncilMemberDetails
    );
    const nayVoters = (proposalData.votes.nay || []).map(
      getCouncilMemberDetails
    );
    const abstainVoters = (proposalData.votes.abstain || []).map(
      getCouncilMemberDetails
    );

    // Aggregate votes by party
    const byParty = {};
    Object.entries(proposalData.councilVotesCast).forEach(
      ([memberId, vote]) => {
        const details = getCouncilMemberDetails(memberId);
        if (!details.partyName) return; // Skip if no party info

        if (!byParty[details.partyName]) {
          byParty[details.partyName] = {
            name: details.partyName,
            color: details.partyColor,
            yea: 0,
            nay: 0,
            abstain: 0,
          };
        }
        if (vote === "yea") byParty[details.partyName].yea++;
        else if (vote === "nay") byParty[details.partyName].nay++;
        else if (vote === "abstain") byParty[details.partyName].abstain++;
      }
    );

    return {
      yea: yeaVoters,
      nay: nayVoters,
      abstain: abstainVoters,
      byParty: Object.values(byParty),
    };
  }, [proposalData, governmentOffices, startingCityName]);

  if (!isOpen || !proposalData) {
    return null;
  }

  const { policyName, description, votes } = proposalData;
  const totalYea = votes?.yea?.length || 0;
  const totalNay = votes?.nay?.length || 0;
  const totalAbstain = votes?.abstain?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vote Details: ${policyName}`}
      isLarge={true}
    >
      <div className="policy-vote-details-modal-content">
        <h3>{policyName}</h3>
        <p className="policy-description-summary">
          <em>{description}</em>
        </p>

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
              {voteBreakdown.yea.map((v, index) => (
                <li key={`${v.name}-${index}`}>
                  {v.name} ({v.partyName})
                </li>
              ))}
            </ul>
          </div>
          <div className="vote-column">
            <h4>Voted Nay ({totalNay})</h4>
            <ul>
              {voteBreakdown.nay.map((v, index) => (
                <li key={`${v.name}-${index}`}>
                  {v.name} ({v.partyName})
                </li>
              ))}
            </ul>
          </div>
          <div className="vote-column">
            <h4>Abstained ({totalAbstain})</h4>
            <ul>
              {voteBreakdown.abstain.map((v, index) => (
                <li key={`${v.name}-${index}`}>
                  {v.name} ({v.partyName})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="party-vote-breakdown-section">
          <h4>Vote Breakdown by Party</h4>
          {voteBreakdown.byParty.length > 0 ? (
            <div className="party-vote-chart-container">
              {/* Placeholder for chart - a stacked bar chart per party would be ideal */}
              {/* <VoteBreakdownChart data={voteBreakdown.byParty} /> */}
              <ul className="party-vote-list">
                {voteBreakdown.byParty.map((party) => (
                  <li
                    key={party.name}
                    style={{ borderLeftColor: party.color || "#ccc" }}
                  >
                    <strong>{party.name}:</strong>
                    <span className="party-vote-yea">Yea: {party.yea}</span>
                    <span className="party-vote-nay">Nay: {party.nay}</span>
                    <span className="party-vote-abstain">
                      Abs: {party.abstain}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No party voting data available or all voters are independent.</p>
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
