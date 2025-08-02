import React from "react";
import Modal from "./Modal";
import "./BillDetailsModal.css"; // Import the new CSS file

const STANCE_CLASSES = {
  leaning_yea: { text: "Leaning Yea", className: "stance-yea" },
  leaning_nay: { text: "Leaning Nay", className: "stance-nay" },
  undecided: { text: "Undecided", className: "stance-undecided" },
};

const BillDetailsModal = ({ isOpen, onClose, bill }) => {
  if (!isOpen || !bill) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Legislative Briefing"
      isLarge={true}
    >
      <div className="bill-details-content">
        <h3>{bill.name}</h3>
        <p className="proposer-info">Proposed by: {bill.proposerName}</p>

        <div className="details-section">
          <h4>Contents</h4>
          <ul className="policy-list-briefing">
            {bill.policies.map((p) => (
              <li key={p.policyId}>{p.policyName}</li>
            ))}
          </ul>
        </div>

        <div className="details-section">
          <h4>Council Opinions</h4>
          {bill.publicStances && bill.publicStances.length > 0 ? (
            <ul className="opinion-list">
              {bill.publicStances.map((s) => {
                const stanceInfo = STANCE_CLASSES[s.stance] || {
                  text: "Unknown",
                  className: "",
                };
                return (
                  <li key={s.politicianId}>
                    <span className="opinion-politician">
                      {s.politicianName}
                    </span>
                    <span className={`opinion-stance ${stanceInfo.className}`}>
                      {stanceInfo.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No public statements have been made by council members yet.</p>
          )}
        </div>
        <button onClick={onClose} className="action-button">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default BillDetailsModal;
