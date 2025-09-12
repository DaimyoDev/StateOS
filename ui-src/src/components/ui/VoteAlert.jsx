import React, { useMemo } from "react";
import useGameStore from "../../store";
import "./VoteAlert.css";

const EMPTY_ARRAY = [];

const VoteAlert = () => {
  const voteQueue = useGameStore((state) => state.voteQueue);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const cityBills = useGameStore(
    (state) => state.city?.proposedBills || EMPTY_ARRAY
  );
  const stateBills = useGameStore(
    (state) => state.state?.proposedBills || EMPTY_ARRAY
  );
  const nationalBills = useGameStore(
    (state) => state.national?.proposedBills || EMPTY_ARRAY
  );
  const { startVotingSession, skipAndProcessVote, addToast, startVotingQueue } =
    useGameStore((state) => state.actions);

  if (voteQueue?.length > 0)
    console.log(`[VOTE ALERT] ${voteQueue.length} pending vote(s)`);

  const isVotingToday = (bill, currentDate) => {
    if (!currentDate) return false;

    // Check for city council votes
    if (bill.level === "city" && bill.councilVoteInfo?.councilVoteScheduled) {
      const voteDate = bill.councilVoteInfo.councilVoteScheduled;
      return (
        voteDate.year === currentDate.year &&
        voteDate.month === currentDate.month &&
        voteDate.day === currentDate.day
      );
    }

    // Check for committee votes
    if (bill.level !== "city" && bill.committeeInfo?.committeeVoteScheduled) {
      const voteDate = bill.committeeInfo.committeeVoteScheduled;
      return (
        voteDate.year === currentDate.year &&
        voteDate.month === currentDate.month &&
        voteDate.day === currentDate.day
      );
    }

    // Check for floor votes
    if (bill.level !== "city" && bill.floorVoteInfo?.floorVoteScheduled) {
      const voteDate = bill.floorVoteInfo.floorVoteScheduled;
      return (
        voteDate.year === currentDate.year &&
        voteDate.month === currentDate.month &&
        voteDate.day === currentDate.day
      );
    }

    return false;
  };

  // Helper function to check if a stage is actually a voting stage
  const isActualVotingStage = (bill) => {
    if (!bill.currentStage) return false;

    // Only show for actual voting stages, not comment periods or other stages
    const votingStages = [
      "council_vote", // City council vote stage
      "committee_vote",
      "committee_markup", // Committee markup stage involves voting
      "floor_vote",
      "floor_consideration",
      "second_chamber",
      "third_reading",
    ];

    // Exclude non-voting stages explicitly
    const nonVotingStages = [
      "committee_assignment", // Committee assignment is administrative, not voting
      "public_comment_period", // Public comment is not a voting stage
      "proposal_submitted", // Proposal submission is not a voting stage
      "public_review", // Old stage name for public comment
    ];

    if (nonVotingStages.includes(bill.currentStage)) {
      return false;
    }

    return (
      votingStages.includes(bill.currentStage) ||
      (bill.currentStage.includes("vote") &&
        !bill.currentStage.includes("review") &&
        !bill.currentStage.includes("comment"))
    );
  };

  // Get all bills for the votes in the queue using useMemo to prevent infinite loops
  const voteBills = useMemo(() => {
    if (!voteQueue || voteQueue.length === 0) return [];

    const billsByLevel = {
      city: cityBills,
      state: stateBills,
      national: nationalBills,
    };

    return voteQueue
      .map((vote) => {
        const { billId, level } = vote;
        const billsAtLevel = billsByLevel[level];
        if (!billsAtLevel) {
          return null;
        }

        const foundBill = billsAtLevel.find((b) => b.id === billId);

        return foundBill ? { ...foundBill, voteLevel: level } : null;
      })
      .filter(Boolean)
      .filter(
        (bill) =>
          isActualVotingStage(bill) ||
          isVotingToday(bill, activeCampaign?.currentDate)
      ); // Show voting stages or bills with votes today
  }, [
    voteQueue,
    cityBills,
    stateBills,
    nationalBills,
    activeCampaign?.currentDate,
  ]);

  if (!voteQueue || voteQueue.length === 0) {
    return null;
  }

  if (voteBills.length === 0) return null;

  const handleViewVote = (bill) => {
    // We need to temporarily reorder the queue to put this bill first, then start the session
    const currentQueue = [...voteQueue];
    const targetVoteIndex = currentQueue.findIndex(
      (vote) => vote.billId === bill.id
    );

    if (targetVoteIndex > 0) {
      // Move the target vote to the front
      const targetVote = currentQueue.splice(targetVoteIndex, 1)[0];
      currentQueue.unshift(targetVote);

      // Update the queue
      startVotingQueue(currentQueue);
    }

    // Start the voting session (will now use the reordered queue)
    startVotingSession();
  };

  const handleSkip = (bill) => {
    skipAndProcessVote(bill.id, bill.voteLevel);
    addToast({
      message: `Vote for "${bill.name}" has been processed.`,
      type: "info",
    });
  };

  // Helper function to get vote stage info for a bill
  const getVoteStageInfo = (bill) => {
    const isCommitteeVote =
      bill.currentStage &&
      (bill.currentStage.includes("committee") ||
        bill.currentStage === "committee_markup" ||
        bill.currentStage === "committee_review") &&
      bill.currentStage !== "committee_assignment"; // Exclude non-voting assignment stage

    const isFloorVote = bill.currentStage === "floor_consideration";

    let voteStageText;
    if (isCommitteeVote) {
      voteStageText = `Committee ${bill.currentStage
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Stage`;
    } else if (isFloorVote) {
      voteStageText = "Floor Vote";
    } else {
      voteStageText = `${bill.currentStage
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Stage`;
    }

    return { isCommitteeVote, voteStageText };
  };

  return (
    <div className="vote-alert">
      <div className="vote-alert-content">
        <h4>Pending Votes Today ({voteBills.length})</h4>
        {voteBills.map((bill) => {
          const { isCommitteeVote, voteStageText } = getVoteStageInfo(bill);

          return (
            <div key={bill.id} className="vote-alert-item">
              <div className="vote-bill-info">
                <p className="bill-name">
                  <strong>{bill.name}</strong>
                </p>
                <p className="vote-stage-info">
                  <span
                    className={`stage-badge ${
                      isCommitteeVote ? "committee" : "floor"
                    }`}
                  >
                    {voteStageText}
                  </span>
                  <span className="level-badge">
                    {bill.voteLevel.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="vote-alert-actions">
                <button
                  className="action-button small-button"
                  onClick={() => handleViewVote(bill)}
                >
                  {isCommitteeVote ? "View Committee Vote" : "View Floor Vote"}
                </button>
                <button
                  className="menu-button small-button"
                  onClick={() => handleSkip(bill)}
                >
                  Skip to Results
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default VoteAlert;
