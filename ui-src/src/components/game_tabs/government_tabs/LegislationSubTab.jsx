import React, { useMemo } from "react";
import useGameStore from "../../../store";
import "./GovernmentSubTabStyles.css";
import "./LegislationSubTab.css";
import { areDatesEqual } from "../../../utils/core";
import PassedBillsArchive from "../PassedBillsArchive";
import FailedBillsArchive from "../FailedBillsArchive";

const EMPTY_ARRAY = [];

// Map internal stage names to user-friendly display names
const getStageDisplayName = (stageName, level) => {
  const stageNameMap = {
    // City stages
    introduction: level === 'city' ? 'Under Review' : 'Introduction',
    public_review: 'Public Comment Period',
    council_vote: level === 'city' ? 'Council Vote' : 'Legislative Vote',
    
    // State/National stages
    committee_assignment: 'Committee Assignment',
    committee_markup: 'Committee Review',
    committee_vote: 'Committee Vote',
    floor_consideration: 'Floor Consideration',
    floor_debate: 'Floor Debate',
    floor_vote: 'Floor Vote',
    second_chamber: 'Second Chamber Review',
    conference_committee: 'Conference Committee',
    presidential_signature: 'Presidential Review',
    veto_override: 'Veto Override Attempt',
    royal_assent: 'Royal Assent',
    first_reading: 'First Reading',
    committee_review: 'Committee Review',
    report_stage: 'Report Stage',
    third_reading: 'Third Reading',
    automatic_assent: 'Automatic Approval',
    federal_consultation: 'Federal Consultation'
  };
  
  return stageNameMap[stageName] || stageName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const LegislationSubTab = ({ campaignData, currentLevel = 'city', activeTab = 'proposed' }) => {
  const proposedBills = useGameStore(
    (state) => state[currentLevel]?.proposedBills || EMPTY_ARRAY
  );
  const activeLegislation = useGameStore(
    (state) => state[currentLevel]?.activeLegislation || EMPTY_ARRAY
  );

  const { openPolicyVoteDetailsModal, openBillDetailsModal, openBillAuthoringModal, getGovernmentOfficesForContext } = useGameStore(
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
    // PERFORMANCE OPTIMIZATION: Only get government offices relevant to the current level
    const cityId = currentLevel === 'city' ? activeCampaign?.startingCity?.id : null;
    const stateId = (currentLevel === 'state' || currentLevel === 'city') ? activeCampaign?.regionId : null;
    const contextualOffices = getGovernmentOfficesForContext(currentLevel, cityId, stateId);
    if (contextualOffices) {
      for (const office of contextualOffices) {
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

  return (
    <div className="legislation-sub-tab">

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
                // Use stored vote data if available (for failed/passed bills), otherwise calculate from councilVotesCast
                const yeaVotes = bill.yeaVotes !== undefined ? bill.yeaVotes : 
                  (bill.councilVotesCast ? Object.values(bill.councilVotesCast).filter(v => v === "yea" || v === "YEA" || v === "YEA_PLAYER").length : 0);
                const nayVotes = bill.nayVotes !== undefined ? bill.nayVotes : 
                  (bill.councilVotesCast ? Object.values(bill.councilVotesCast).filter(v => v === "nay" || v === "NAY" || v === "NAY_PLAYER").length : 0);
                const abstainVotes = bill.abstainVotes !== undefined ? bill.abstainVotes : 
                  (bill.councilVotesCast ? Object.values(bill.councilVotesCast).filter(v => v === "abstain" || v === "ABSTAIN" || v === "ABSTAIN_PLAYER").length : 0);

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
                    {/* Display vote scheduling info based on bill level */}
                    {bill.status === "pending_vote" && (
                      <>
                        {bill.level === 'city' && bill.councilVoteInfo?.councilVoteScheduled && (
                          <p className="voting-info">
                            Council vote scheduled for {bill.councilVoteInfo.councilVoteScheduled.month}/
                            {bill.councilVoteInfo.councilVoteScheduled.day}/{bill.councilVoteInfo.councilVoteScheduled.year} (
                            {calculateDaysRemaining(bill.councilVoteInfo.councilVoteScheduled)})
                          </p>
                        )}
                        {bill.level !== 'city' && bill.committeeInfo?.committeeVoteScheduled && (
                          <p className="voting-info">
                            Committee vote scheduled for {bill.committeeInfo.committeeVoteScheduled.month}/
                            {bill.committeeInfo.committeeVoteScheduled.day}/{bill.committeeInfo.committeeVoteScheduled.year} (
                            {calculateDaysRemaining(bill.committeeInfo.committeeVoteScheduled)})
                          </p>
                        )}
                        {bill.level !== 'city' && bill.floorVoteInfo?.floorVoteScheduled && (
                          <p className="voting-info">
                            Floor vote scheduled for {bill.floorVoteInfo.floorVoteScheduled.month}/
                            {bill.floorVoteInfo.floorVoteScheduled.day}/{bill.floorVoteInfo.floorVoteScheduled.year} (
                            {calculateDaysRemaining(bill.floorVoteInfo.floorVoteScheduled)})
                          </p>
                        )}
                      </>
                    )}
                    
                    {/* Floor Vote Information for State/National Bills at floor consideration stage */}
                    {bill.floorVoteInfo && currentLevel !== 'city' && bill.status === 'floor_consideration' && (
                      <div className="floor-vote-info">
                        <h5>Floor Vote:</h5>
                        <div className="floor-vote-details">
                          {bill.floorVoteInfo.floorVoteScheduled && (
                            <div className="floor-vote-date">
                              Floor Vote: {bill.floorVoteInfo.floorVoteScheduled.month}/{bill.floorVoteInfo.floorVoteScheduled.day}/{bill.floorVoteInfo.floorVoteScheduled.year} (
                              {calculateDaysRemaining(bill.floorVoteInfo.floorVoteScheduled)})
                            </div>
                          )}
                          <div className="floor-vote-type">
                            Type: {bill.floorVoteInfo.floorVoteType === 'state_legislature' ? 'State Legislature Vote' : 'Congressional Vote'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Committee Information for State/National Bills - only show for active bills */}
                    {bill.committeeInfo && currentLevel !== 'city' && bill.status !== 'failed' && bill.status !== 'passed' && (
                      <div className="committee-info">
                        <h5>Committee Assignment:</h5>
                        <div className="committee-details">
                          <div className="committee-name">
                            <strong>{bill.committeeInfo.committeeName}</strong>
                          </div>
                          <div className="committee-status">
                            Status: {bill.committeeInfo.committeeStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          {bill.committeeInfo.committeeVoteScheduled && (
                            <div className="committee-vote-date">
                              Committee Vote: {bill.committeeInfo.committeeVoteScheduled.month}/{bill.committeeInfo.committeeVoteScheduled.day}/{bill.committeeInfo.committeeVoteScheduled.year} ({
                                bill.committeeInfo.committeeStatus === 'passed' || bill.committeeInfo.committeeStatus === 'completed' 
                                  ? 'Passed' 
                                  : calculateDaysRemaining(bill.committeeInfo.committeeVoteScheduled)
                              })
                            </div>
                          )}
                          <div className="committee-jurisdiction">
                            Jurisdiction: {bill.committeeInfo.committeeJurisdiction?.join(', ') || 'General oversight'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bill Stage Progression Timeline */}
                    {(bill.currentStage || bill.stageHistory) && (
                      <div className="bill-timeline">
                        <h5>Bill Progression:</h5>
                        <div className="timeline-container">
                          {bill.stageHistory && bill.stageHistory.length > 0 ? (
                            // Filter out duplicate stages and show only the most recent status for each stage
                            bill.stageHistory.reduce((uniqueStages, stage) => {
                              const existingStageIndex = uniqueStages.findIndex(s => s.stage === stage.stage);
                              if (existingStageIndex !== -1) {
                                // Replace with the most recent status (completed over in_progress)
                                if (stage.completedOn || (!uniqueStages[existingStageIndex].completedOn && stage.status !== 'in_progress')) {
                                  uniqueStages[existingStageIndex] = stage;
                                }
                              } else {
                                uniqueStages.push(stage);
                              }
                              return uniqueStages;
                            }, []).map((stage, index) => (
                              <div key={index} className={`timeline-item ${stage.status}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                  <span className="stage-name">
                                    {getStageDisplayName(stage.stage, currentLevel)}
                                  </span>
                                  <span className="stage-date">
                                    {stage.stage === 'committee_assignment' ? (
                                      // Committee assignment is a single event, not a start/complete process
                                      stage.completedOn ? 
                                        `Assigned: ${stage.completedOn.month}/${stage.completedOn.day}/${stage.completedOn.year}` :
                                        stage.enteredOn ? 
                                        `Assigned: ${stage.enteredOn.month}/${stage.enteredOn.day}/${stage.enteredOn.year}` :
                                        'Assigning'
                                    ) : (
                                      // Other stages show start/complete progression
                                      stage.completedOn ? 
                                        `Completed: ${stage.completedOn.month}/${stage.completedOn.day}/${stage.completedOn.year}` :
                                        stage.enteredOn ? 
                                        `Started: ${stage.enteredOn.month}/${stage.enteredOn.day}/${stage.enteredOn.year}` :
                                        'In Progress'
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : bill.currentStage ? (
                            <div className="timeline-item in_progress">
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <span className="stage-name">
                                  {getStageDisplayName(bill.currentStage, currentLevel)}
                                </span>
                                <span className="stage-date">
                                  {bill.stageScheduledFor ? 
                                    `Due: ${bill.stageScheduledFor.month}/${bill.stageScheduledFor.day}/${bill.stageScheduledFor.year} (${calculateDaysRemaining(bill.stageScheduledFor)})` :
                                    'In Progress'
                                  }
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
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
            <div className="passed-bills-archive-container active-legislation-container">
              {sortedActiveLegislation.map((bill) => {
                const enactingProposerName = getPoliticianNameById(bill.proposerId) || bill.proposerName;
                return (
                  <div key={bill.id} className="archive-card">
                    <div className="archive-card-header">
                      <h3>{bill.name}</h3>
                      <p className="archive-card-subheader">
                        Enacted on{" "}
                        <strong>
                          {bill.dateEnacted?.month}/{bill.dateEnacted?.day}/{bill.dateEnacted?.year}
                        </strong>
                        {' | '}Proposed by <strong>{enactingProposerName || 'N/A'}</strong>
                      </p>
                    </div>

                    <div className="bill-contents-section">
                      <h4>Policies in this Law</h4>
                      <ul className="policy-list-archive">
                        {(bill.policies || []).map((policy, index) => {
                          let activeParameterDisplay = null;
                          if (policy.isParameterized && policy.chosenParameters && policy.parameterDetails) {
                            const paramKey = policy.parameterDetails.key || "amount";
                            const amount = policy.chosenParameters[paramKey];
                            const unit = policy.parameterDetails.unit || "";
                            if (amount !== undefined) {
                              activeParameterDisplay = (
                                <p className="policy-detail-text parameter-info">
                                  <strong>Adjustment:</strong> {unit}{amount.toLocaleString()}
                                </p>
                              );
                            }
                          }

                          return (
                            <li key={`${bill.id}-${policy.policyId}-${index}`}>
                              <div className="active-policy-header">
                                <strong>{policy.policyName}</strong>
                                <span className={`policy-status-badge status-${policy.monthsUntilEffective > 0 ? 'enacting' : (policy.effectsApplied ? 'active' : 'pending')}`}>
                                  {policy.monthsUntilEffective > 0
                                    ? `Enacting (~${policy.monthsUntilEffective} mo)`
                                    : policy.effectsApplied
                                    ? "Effects Active"
                                    : "Effective Now"}
                                </span>
                              </div>
                              <p className="policy-detail-text">{policy.description}</p>
                              {activeParameterDisplay}
                              <div className="legislation-actions" style={{ marginTop: '8px' }}>
                                <button className="action-button small-button" onClick={(e) => { e.stopPropagation(); openBillAuthoringModal('amend', { ...policy, billId: bill.id }); }}>Amend</button>
                                <button className="action-button small-button danger" onClick={(e) => { e.stopPropagation(); openBillAuthoringModal('repeal', { ...policy, billId: bill.id }); }}>Repeal</button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
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

      {activeTab === 'failed' && (
        <section className="legislation-section failed-archive">
          <FailedBillsArchive level={currentLevel} />
        </section>
      )}
    </div>
  );
};

export default LegislationSubTab;
