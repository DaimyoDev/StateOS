import React from "react";
import useGameStore from "../../store";
import "./VoteAlert.css"; // Create this CSS file

const VoteAlert = () => {
  const voteQueue = useGameStore((state) => state.voteQueue);
  const { startVotingSession, skipAndProcessVote, addToast, startVotingQueue } = useGameStore(
    (state) => state.actions
  );

  // Debug logging
  console.log(`[VoteAlert] Vote queue length: ${voteQueue?.length || 0}`);

  // Get all bills for the votes in the queue
  const voteBills = useGameStore((state) => {
    if (!voteQueue || voteQueue.length === 0) return [];
    
    return voteQueue.map(vote => {
      const { billId, level } = vote;
      console.log(`[VoteAlert] Looking for bill ${billId} at ${level} level`);
      
      if (!state[level] || !state[level].proposedBills) {
        console.log(`[VoteAlert] No proposed bills at ${level} level`);
        return null;
      }
      
      const foundBill = state[level].proposedBills.find((b) => b.id === billId);
      console.log(`[VoteAlert] Found bill:`, foundBill ? foundBill.name : 'NOT FOUND');
      
      return foundBill ? { ...foundBill, voteLevel: level } : null;
    }).filter(Boolean);
  });

  if (!voteQueue || voteQueue.length === 0) {
    return null;
  }

  if (voteBills.length === 0) return null;

  const handleViewVote = (bill) => {
    // We need to temporarily reorder the queue to put this bill first, then start the session
    const currentQueue = [...voteQueue];
    const targetVoteIndex = currentQueue.findIndex(vote => vote.billId === bill.id);
    
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
    const isCommitteeVote = bill.currentStage && (
      bill.currentStage.includes('committee') || 
      bill.currentStage === 'committee_assignment' ||
      bill.currentStage === 'committee_markup' ||
      bill.currentStage === 'committee_review'
    );

    const voteStageText = isCommitteeVote ? 
      `Committee ${bill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Stage` :
      `${bill.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Stage`;

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
                  <span className={`stage-badge ${isCommitteeVote ? 'committee' : 'floor'}`}>
                    {voteStageText}
                  </span>
                  <span className="level-badge">{bill.voteLevel.toUpperCase()}</span>
                </p>
              </div>
              <div className="vote-alert-actions">
                <button
                  className="action-button small-button"
                  onClick={() => handleViewVote(bill)}
                >
                  {isCommitteeVote ? 'View Committee Vote' : 'View Floor Vote'}
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
