// src/components/modals/WinnerAnnouncementModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal"; // Assuming your base Modal component
import Confetti from "react-confetti";
import "./WinnerAnnouncementModal.css"; // Make sure you have styles for this

const WinnerAnnouncementModal = ({ isOpen, onClose, winnerData }) => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  // Dynamically get window size for confetti
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize(); // Set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  if (!isOpen || !winnerData) {
    return null;
  }

  const { officeName, winners, electoralSystem, noCandidates, noVotes } =
    winnerData;

  let modalTitle = `Results: ${officeName}`;
  let mainContent;

  if (noCandidates) {
    modalTitle = `No Candidates: ${officeName}`;
    mainContent = <p>No candidates ran in this election.</p>;
  } else if (noVotes && (!winners || winners.length === 0)) {
    modalTitle = `No Votes Recorded: ${officeName}`;
    mainContent = <p>No votes were cast or expected in this election.</p>;
  } else if (winners && winners.length > 0) {
    if (
      winners.length === 1 &&
      winners[0].name !== "Results Certified" &&
      winners[0].name !== "Race Concluded" &&
      winners[0].name !== "Results to be determined by party allocation"
    ) {
      modalTitle = `Projected Winner: ${officeName}`;
      mainContent = (
        <>
          <h3
            className="winner-modal-name"
            style={{ color: winners[0].partyColor || "var(--primary-text)" }}
          >
            {winners[0].name}
          </h3>
          <p className="wins-for-text">is projected to win the election for</p>
          <h4 className="winner-modal-office">{officeName}</h4>
          {winners[0].partyName && winners[0].partyName !== "Independent" && (
            <p className="winner-modal-party">
              Representing:{" "}
              <span
                style={{
                  color: winners[0].partyColor || "var(--primary-text)",
                }}
              >
                {winners[0].partyName}
              </span>
            </p>
          )}
          <p className="congratulations-text">Congratulations!</p>
        </>
      );
    } else {
      // Handles multiple winners or generic "Results Certified"
      modalTitle = `Projected Results: ${officeName}`;
      mainContent = (
        <>
          {winners[0].name === "Results Certified" ||
          winners[0].name === "Race Concluded" ||
          winners[0].name === "Results to be determined by party allocation" ? (
            <p>{winners[0].name}</p>
          ) : (
            <>
              <p className="multi-win-text">
                The following {winners.length > 1 ? "are" : "is"} projected to
                win seat{winners.length > 1 ? "s" : ""} for {officeName}:
              </p>
              <ul className="winner-modal-list">
                {winners.map((winner, index) => (
                  <li key={winner.id || winner.name || `winner-${index}`}>
                    <span
                      style={{
                        color: winner.partyColor || "var(--primary-text)",
                        fontWeight: "bold",
                        textShadow: "1px 1px 1px rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {winner.name}
                    </span>
                    {winner.partyName &&
                      winner.partyName !== "Independent" &&
                      ` (${winner.partyName})`}
                  </li>
                ))}
              </ul>
            </>
          )}
          {(electoralSystem === "PartyListPR" || electoralSystem === "MMP") &&
            !(
              winners[0].name === "Results Certified" ||
              winners[0].name === "Race Concluded" ||
              winners[0].name === "Results to be determined by party allocation"
            ) && (
              <p className="modal-system-note">
                (Note: For {electoralSystem} systems, these are projected
                individual winners from the simulation. Final seat allocation
                based on party performance will be determined after full
                processing.)
              </p>
            )}
        </>
      );
    }
  } else {
    // Fallback if winners array is empty but not due to noCandidates/noVotes
    modalTitle = `Results: ${officeName}`;
    mainContent = <p>Vote counting complete. Results are being finalized.</p>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      isLarge={true}
      contentClassName="winner-announcement-modal-dialog-bg"
      modalBodyClassName="winner-announcement-modal-content-inner"
    >
      {isOpen && windowSize.width && windowSize.height && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={
            winners &&
            winners.length > 0 &&
            !(
              winners[0].name === "Results Certified" ||
              winners[0].name === "Race Concluded"
            ) &&
            !noCandidates &&
            !noVotes
              ? 300
              : 50
          }
          gravity={0.25}
          initialVelocityY={10}
          initialVelocityX={7}
          wind={0.01}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1050,
          }} // Ensure confetti is high, but modal content can be higher if Modal base has z-index for content
        />
      )}
      {mainContent}
      <button
        onClick={onClose}
        className="action-button close-winner-modal-button"
      >
        Continue
      </button>
    </Modal>
  );
};

export default WinnerAnnouncementModal;
