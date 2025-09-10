import React from "react";
import useGameStore from "../../store";
import "./VoteAlert.css"; // Create this CSS file

const VoteAlert = () => {
  const voteQueue = useGameStore((state) => state.voteQueue);
  const { startVotingSession, skipAndProcessVote, addToast } = useGameStore(
    (state) => state.actions
  );

  // Debug logging
  console.log(`[VoteAlert] Vote queue length: ${voteQueue?.length || 0}`);
  if (voteQueue?.length > 0) {
    console.log(`[VoteAlert] Next vote:`, voteQueue[0]);
  }

  const nextVote = voteQueue[0];
  const bill = useGameStore((state) => {
    if (!nextVote) return null;
    const { billId, level } = nextVote;
    console.log(`[VoteAlert] Looking for bill ${billId} at ${level} level`);
    if (!state[level] || !state[level].proposedBills) {
      console.log(`[VoteAlert] No proposed bills at ${level} level`);
      return null;
    }
    const foundBill = state[level].proposedBills.find((b) => b.id === billId);
    console.log(`[VoteAlert] Found bill:`, foundBill ? foundBill.name : 'NOT FOUND');
    return foundBill;
  });

  if (!voteQueue || voteQueue.length === 0) {
    return null;
  }

  if (!bill) return null;

  const handleSkip = () => {
    skipAndProcessVote(bill.id, bill.level);
    addToast({
      message: `Vote for "${bill.name}" has been processed.`,
      type: "info",
    });
  };

  // Determine if this is a committee vote or full legislature vote
  const isCommitteeVote = bill.currentStage && (
    bill.currentStage.includes('committee') || 
    bill.currentStage === 'committee_assignment' ||
    bill.currentStage === 'committee_markup' ||
    bill.currentStage === 'committee_review'
  );

  const voteStageText = isCommitteeVote ? 
    `Committee ${bill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Stage` :
    `${bill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Stage`;

  return (
    <div className="vote-alert">
      <div className="vote-alert-content">
        <p>
          <strong>Vote in Session:</strong> {bill.name}
        </p>
        <p className="vote-stage-info">
          <span className={`stage-badge ${isCommitteeVote ? 'committee' : 'floor'}`}>
            {voteStageText}
          </span>
        </p>
        <div className="vote-alert-actions">
          <button
            className="action-button small-button"
            onClick={startVotingSession}
          >
            {isCommitteeVote ? 'View Committee Vote' : 'View Floor Vote'}
          </button>
          <button className="menu-button small-button" onClick={handleSkip}>
            Skip to Results
          </button>
        </div>
      </div>
    </div>
  );
};
export default VoteAlert;
