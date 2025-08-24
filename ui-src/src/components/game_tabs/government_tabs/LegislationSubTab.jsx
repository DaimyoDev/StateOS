import React, { useMemo, useState } from "react";
import useGameStore from "../../../store";
import "./GovernmentSubTabStyles.css";
import "./LegislationSubTab.css";
import { areDatesEqual } from "../../../utils/core";
import PassedBillsArchive from "../PassedBillsArchive";

const EMPTY_ARRAY = [];

const LegislationSubTab = ({ campaignData }) => {
  const [currentLevel, setCurrentLevel] = useState('city');
  const proposedBills = useGameStore(
    (state) => state[currentLevel]?.proposedBills || EMPTY_ARRAY
  );
  const activeLegislation = useGameStore(
    (state) => state[currentLevel]?.activeLegislation || EMPTY_ARRAY
  );

  const { openPolicyVoteDetailsModal, openBillDetailsModal, openBillAuthoringModal } = useGameStore(
    (state) => state.actions
  );

  const currentDate = campaignData?.currentDate;
  const activeCampaign = campaignData;

  const calculateDaysRemaining = (endDate) => {
    if (!currentDate || !endDate) return "N/A";
    if (areDatesEqual(currentDate, endDate)) return "Today";
    const todayObj = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day
    );
    const endObj = new Date(endDate.year, endDate.month - 1, endDate.day);
    if (todayObj > endObj) return "Overdue";
    const diffTime = endObj.getTime() - todayObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const getPoliticianNameById = (politicianId) => {
    if (!activeCampaign || !politicianId)
      return `ID ${politicianId || "Unknown"}`;
    if (
      activeCampaign.politician &&
      activeCampaign.politician.id === politicianId
    ) {
      return `${activeCampaign.politician.firstName} ${activeCampaign.politician.lastName}`;
    }
    if (activeCampaign.governmentOffices) {
      for (const office of activeCampaign.governmentOffices) {
        if (office.holder && office.holder.id === politicianId) {
          return (
            office.holder.name ||
            `${office.holder.firstName || ""} ${
              office.holder.lastName || ""
            }`.trim()
          );
        }
        if (office.members) {
          for (const member of office.members) {
            if (member.id === politicianId) {
              return (
                member.name ||
                `${member.firstName || ""} ${member.lastName || ""}`.trim()
              );
            }
          }
        }
      }
    }
    return `Politician ID ${politicianId}`;
  };

  const handleBillItemClick = (bill) => {
    if (bill.status === "passed" || bill.status === "failed") {
      openPolicyVoteDetailsModal?.(bill);
    } else if (bill.status === "pending_vote") {
      openBillDetailsModal?.(bill);
    }
  };

  const sortedProposedBills = useMemo(() => {
    return [...proposedBills].sort((a, b) => {
      if (a.status === "pending_vote" && b.status !== "pending_vote") return -1;
      if (b.status === "pending_vote" && a.status !== "pending_vote") return 1;
      if (!a.dateProposed?.year || !b.dateProposed?.year) return 0;
      return (
        new Date(
          b.dateProposed.year,
          b.dateProposed.month - 1,
          b.dateProposed.day
        ) -
        new Date(
          a.dateProposed.year,
          a.dateProposed.month - 1,
          a.dateProposed.day
        )
      );
    });
  }, [proposedBills]);

  const sortedActiveLegislation = useMemo(() => {
    return [...activeLegislation].sort((a, b) => {
      if (!a.dateEnacted?.year || !b.dateEnacted?.year) return 0;
      return (
        new Date(
          b.dateEnacted.year,
          b.dateEnacted.month - 1,
          b.dateEnacted.day
        ) -
        new Date(a.dateEnacted.year, a.dateEnacted.month - 1, a.dateEnacted.day)
      );
    });
  }, [activeLegislation]);

  const [activeTab, setActiveTab] = React.useState('proposed');

  return (
    <div className="legislation-sub-tab">
      <div className="level-selector-container">
        <button onClick={() => setCurrentLevel('city')} className={`level-button ${currentLevel === 'city' ? 'active' : ''}`}>City</button>
        <button onClick={() => setCurrentLevel('state')} className={`level-button ${currentLevel === 'state' ? 'active' : ''}`}>State</button>
        <button onClick={() => setCurrentLevel('national')} className={`level-button ${currentLevel === 'national' ? 'active' : ''}`}>National</button>
      </div>
      <div className="sub-tab-navigation">
        <button
          className={`sub-tab-button ${activeTab === 'proposed' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposed')}
        >
          Proposed & Voting
        </button>
        <button
          className={`sub-tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Legislation
        </button>
        <button
          className={`sub-tab-button ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          Passed Bills Archive
        </button>
      </div>

      {activeTab === 'proposed' && (
        <section className="legislation-section proposed-legislation">
          <h4>Proposed & Voting Legislation</h4>
          {sortedProposedBills.length > 0 ? (
            <ul className="legislation-list">
              {sortedProposedBills.map((bill) => {
                const isItemClickable =
                  bill.status === "passed" ||
                  bill.status === "failed" ||
                  bill.status === "pending_vote";
                const proposerName =
                  bill.proposerName || getPoliticianNameById(bill.proposerId);
                const yeaVotes = bill.votes?.yea?.length || 0;
                const nayVotes = bill.votes?.nay?.length || 0;
                const abstainVotes = bill.votes?.abstain?.length || 0;

                return (
                  <li
                    key={bill.id}
                    className={`legislation-item status-${bill.status
                      ?.replace(/\s+/g, "-")
                      .toLowerCase()} ${isItemClickable ? "clickable" : ""}`}
                    onClick={() => isItemClickable && handleBillItemClick(bill)}
                    title={
                      isItemClickable
                        ? bill.status === "pending_vote"
                          ? "View details and council opinions"
                          : "View final vote results"
                        : "This item cannot be inspected further."
                    }
                  >
                    <div className="legislation-header">
                      <strong className="policy-name">{bill.name}</strong>
                      <span className="policy-status">
                        Status: {bill.status?.replace(/_/g, " ") || "N/A"}
                      </span>
                    </div>
                    <div className="bill-contents">
                      <strong>Policies in this bill:</strong>
                      <ul>
                        {bill.policies.map((policy, index) => (
                          <li key={`${policy.policyId}-${index}`}>
                            {policy.policyName}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="proposer-info">
                      Proposed by: <strong>{proposerName}</strong> on{" "}
                      {bill.dateProposed?.month}/{bill.dateProposed?.day}/
                      {bill.dateProposed?.year}
                    </p>
                    {bill.status === "pending_vote" && bill.voteScheduledFor && (
                      <p className="voting-info">
                        Vote scheduled for {bill.voteScheduledFor.month}/
                        {bill.voteScheduledFor.day}/{bill.voteScheduledFor.year} (
                        {calculateDaysRemaining(bill.voteScheduledFor)})
                      </p>
                    )}
                    {(bill.status === "passed" || bill.status === "failed") && (
                      <p className="voting-info final-tally">
                        Final Tally: <strong>Yea:</strong> {yeaVotes},{" "}
                        <strong>Nay:</strong> {nayVotes}, <strong>Abs:</strong>{" "}
                        {abstainVotes}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No bills currently proposed or under voting.</p>
          )}
        </section>
      )}

      {activeTab === 'active' && (
        <section className="legislation-section active-legislation">
          <h4>Active & Enacting Legislation</h4>
          {sortedActiveLegislation.length > 0 ? (
            <ul className="legislation-list">
              {sortedActiveLegislation.map((policy) => {
                const enactingProposerName = getPoliticianNameById(
                  policy.proposerId
                );
                let activeParameterDisplay = null;
                if (
                  policy.isParameterized &&
                  policy.chosenParameters &&
                  policy.parameterDetails
                ) {
                  const paramKey = policy.parameterDetails.key || "amount";
                  const amount = policy.chosenParameters[paramKey];
                  const unit = policy.parameterDetails.unit || "";
                  const targetLine =
                    policy.parameterDetails.targetBudgetLine ||
                    policy.parameterDetails.targetTaxRate ||
                    "funding";
                  const targetLineFormatted = targetLine
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase();
                  if (amount !== undefined) {
                    const changeDesc =
                      amount >= 0
                        ? `Budget for ${targetLineFormatted} was increased by ${unit}${Math.abs(
                            amount
                          ).toLocaleString()}`
                        : `Budget for ${targetLineFormatted} was decreased by ${unit}${Math.abs(
                            amount
                          ).toLocaleString()}`;
                    activeParameterDisplay = (
                      <p className="parameter-info">
                        <strong>Adjustment:</strong> {changeDesc}
                      </p>
                    );
                  }
                }

                return (
                  <li
                    key={policy.id}
                    className="legislation-item status-passed"
                    title="This is an active law. Its effects are being applied."
                  >
                    <div className="legislation-header">
                      <strong className="policy-name">{policy.policyName}</strong>
                      <span className="policy-status">
                        {policy.monthsUntilEffective > 0
                          ? `Enacting (Effective in ~${policy.monthsUntilEffective} mo.)`
                          : policy.effectsApplied
                          ? "Effects Active"
                          : "Effective Now"}
                      </span>
                    </div>
                    <p className="policy-description">
                      <em>{policy.description}</em>
                    </p>
                    {activeParameterDisplay}
                    <p className="proposer-info">
                      Enacted on: {policy.dateEnacted?.month}/
                      {policy.dateEnacted?.day}/{policy.dateEnacted?.year}
                      {policy.proposerId &&
                        ` (Originally proposed by: ${enactingProposerName})`}
                    </p>
                    <div className="legislation-actions">
                      <button className="action-button small-button" onClick={(e) => { e.stopPropagation(); openBillAuthoringModal('amend', policy); }}>Amend</button>
                      <button className="action-button small-button danger" onClick={(e) => { e.stopPropagation(); openBillAuthoringModal('repeal', policy); }}>Repeal</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No policies currently active or being enacted.</p>
          )}
        </section>
      )}

      {activeTab === 'archive' && (
        <section className="legislation-section archive">
          <PassedBillsArchive level={currentLevel} />
        </section>
      )}
    </div>
  );
};

export default LegislationSubTab;
