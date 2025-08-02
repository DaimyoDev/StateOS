import React from "react";
import useGameStore from "../../store";
import "./VoteAlert.css"; // Create this CSS file

const VoteAlert = () => {
  const voteQueue = useGameStore((state) => state.voteQueue);
  const { startVotingSession, skipAndProcessVote, addToast } = useGameStore(
    (state) => state.actions
  );

  const nextBillId = voteQueue[0];
  const bill = useGameStore((state) =>
    state.proposedBills.find((b) => b.id === nextBillId)
  );

  if (!voteQueue || voteQueue.length === 0) {
    return null;
  }

  if (!bill) return null;

  const handleSkip = () => {
    skipAndProcessVote(bill.id);
    addToast({
      message: `Vote for "${bill.name}" has been processed.`,
      type: "info",
    });
  };

  return (
    <div className="vote-alert">
      <div className="vote-alert-content">
        <p>
          <strong>Vote in Session:</strong> {bill.name}
        </p>
        <div className="vote-alert-actions">
          <button
            className="action-button small-button"
            onClick={startVotingSession}
          >
            View Live Vote
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
