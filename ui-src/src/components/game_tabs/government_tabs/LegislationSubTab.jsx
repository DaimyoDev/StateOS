import React, { useMemo } from "react";
import useGameStore from "../../../store"; // Assuming store is 3 levels up
import "./GovernmentSubTabStyles.css";
import "./LegislationSubTab.css"; // Ensure this is created and imported

// Corrected areDatesEqual to compare JavaScript Date objects
const areDatesEqualJS = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const LegislationSubTab = ({ campaignData }) => {
  const proposedLegislation = useGameStore(
    (state) => state.proposedLegislation || []
  );
  const activeLegislation = useGameStore(
    (state) => state.activeLegislation || []
  );
  const { openPolicyVoteDetailsModal, addToast } = useGameStore(
    (state) => state.actions
  );

  const currentDate = campaignData?.currentDate; // This is your game's {year, month, day} object
  const activeCampaign = campaignData;

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
      }
    }
    return `Politician ID ${politicianId}`;
  };

  const handlePolicyItemClick = (proposal) => {
    const isClickableForDetails =
      proposal.status === "voting_period_open" ||
      proposal.status === "voting_closed" ||
      proposal.status === "passed" ||
      proposal.status === "failed";

    if (isClickableForDetails) {
      if (openPolicyVoteDetailsModal) {
        openPolicyVoteDetailsModal(proposal);
      } else {
        console.warn("openPolicyVoteDetailsModal action is not available.");
      }
    } else if (proposal.status === "proposed") {
      if (addToast) {
        addToast({
          message:
            "Voting for this proposal has not started yet. Check back later.",
          type: "info",
          duration: 3000,
        });
      }
    }
  };

  const sortedProposedLegislation = useMemo(() => {
    return [...proposedLegislation].sort((a, b) => {
      if (
        a.status === "voting_period_open" &&
        b.status !== "voting_period_open"
      )
        return -1;
      if (
        b.status === "voting_period_open" &&
        a.status !== "voting_period_open"
      )
        return 1;
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
  }, [proposedLegislation]);

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

  const calculateDaysRemaining = (endDate) => {
    // endDate is your game's {year, month, day} object
    if (
      !currentDate ||
      !endDate ||
      !endDate.year ||
      !endDate.month ||
      !endDate.day
    )
      return "N/A";

    const todayObj = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day
    );
    const endObj = new Date(endDate.year, endDate.month - 1, endDate.day);

    // Use the corrected areDatesEqualJS for JS Date objects
    if (areDatesEqualJS(todayObj, endObj)) return "Ending Today";
    if (todayObj > endObj) return "Ended";

    const diffTime = endObj.getTime() - todayObj.getTime();
    // Ensure diffDays is at least 0 if not caught by earlier checks
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // If, after all checks, diffDays is 0, it means it's effectively ending today or already passed but wasn't caught.
    // The areDatesEqualJS should catch the "Ending Today" case.
    // The todayObj > endObj should catch "Ended".
    // So, if diffDays is 0 here, it implies they are the same day and should have been "Ending Today".
    // However, to be safe and handle potential floating point issues with ceil on very small diffTime:
    if (diffDays === 0 && !areDatesEqualJS(todayObj, endObj)) {
      // If they are not exactly equal but diff is 0 (e.g. few hours left)
      return "Ending Today";
    }

    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  return (
    <div className="legislation-sub-tab">
      <section className="legislation-section proposed-legislation">
        <h4>Proposed & Voting Legislation</h4>
        {sortedProposedLegislation.length > 0 ? (
          <ul className="legislation-list">
            {sortedProposedLegislation.map((proposal) => {
              const relevantCouncilOffices =
                campaignData?.governmentOffices?.filter(
                  (off) =>
                    off.officeNameTemplateId.includes("council") &&
                    off.level === "local_city" &&
                    campaignData.startingCity?.name &&
                    off.officeName.includes(campaignData.startingCity.name) &&
                    (off.holder || (off.members && off.members.length > 0))
                ) || [];

              // Flatten the list of members from all relevant council offices
              const councilMembers = relevantCouncilOffices.flatMap(
                (office) => {
                  if (office.holder) {
                    return [office.holder];
                  }
                  if (office.members) {
                    return office.members;
                  }
                  return [];
                }
              );

              console.log(proposal);

              const totalCouncilVotesPossible = councilMembers.length;
              const yeaVotes = proposal.votes?.yea?.length || 0;
              const nayVotes = proposal.votes?.nay?.length || 0;
              const abstainVotes = proposal.votes?.abstain?.length || 0;

              const isItemClickable =
                proposal.status === "voting_period_open" ||
                proposal.status === "voting_closed" ||
                proposal.status === "passed" ||
                proposal.status === "failed";

              const proposerName = getPoliticianNameById(proposal.proposerId);

              let parameterDisplay = null;
              if (
                proposal.isParameterized &&
                proposal.chosenParameters &&
                proposal.parameterDetails
              ) {
                const paramKey = proposal.parameterDetails.key || "amount";
                const amount = proposal.chosenParameters[paramKey];
                const unit = proposal.parameterDetails.unit || "";
                const targetLine =
                  proposal.parameterDetails.targetBudgetLine ||
                  proposal.parameterDetails.targetTaxRate ||
                  "funding";
                const targetLineFormatted = targetLine
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase();

                if (amount !== undefined) {
                  const changeDesc =
                    amount >= 0
                      ? `Increase ${targetLineFormatted} by ${unit}${Math.abs(
                          amount
                        ).toLocaleString()}`
                      : `Decrease ${targetLineFormatted} by ${unit}${Math.abs(
                          amount
                        ).toLocaleString()}`;
                  parameterDisplay = (
                    <p className="parameter-info">
                      <strong>Proposed Change:</strong> {changeDesc}
                    </p>
                  );
                }
              }

              return (
                <li
                  key={proposal.id}
                  className={`legislation-item status-${proposal.status
                    ?.replace(/\s+/g, "-")
                    .toLowerCase()} ${isItemClickable ? "clickable" : ""}`}
                  onClick={() => handlePolicyItemClick(proposal)}
                  title={
                    isItemClickable
                      ? "View vote details or enact policy"
                      : "Voting not yet open"
                  }
                >
                  <div className="legislation-header">
                    <strong className="policy-name">
                      {proposal.policyName || "Unknown Policy"}
                    </strong>
                    <span className="policy-status">
                      Status: {proposal.status?.replace(/_/g, " ") || "N/A"}
                    </span>
                  </div>
                  <p className="policy-description">
                    <em>
                      {proposal.description || "No description available."}
                    </em>
                  </p>
                  {parameterDisplay}
                  <p className="proposer-info">
                    Proposed by: <strong>{proposerName}</strong> on{" "}
                    {proposal.dateProposed?.month}/{proposal.dateProposed?.day}/
                    {proposal.dateProposed?.year}
                  </p>
                  {proposal.status === "voting_period_open" &&
                    proposal.votingClosesDate && (
                      <p className="voting-info">
                        Voting closes in:{" "}
                        {calculateDaysRemaining(proposal.votingClosesDate)} |
                        Current Tally: <strong>Yea:</strong> {yeaVotes},{" "}
                        <strong>Nay:</strong> {nayVotes}, <strong>Abs:</strong>{" "}
                        {abstainVotes} (of {totalCouncilVotesPossible})
                      </p>
                    )}
                  {(proposal.status === "passed" ||
                    proposal.status === "failed" ||
                    proposal.status === "voting_closed") && (
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
          <p>No policies currently proposed or under voting.</p>
        )}
      </section>

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
                  className="legislation-item status-passed clickable"
                  onClick={() => handlePolicyItemClick(policy)}
                  title="View enactment details"
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
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No policies currently active or being enacted.</p>
        )}
      </section>
    </div>
  );
};

export default LegislationSubTab;
