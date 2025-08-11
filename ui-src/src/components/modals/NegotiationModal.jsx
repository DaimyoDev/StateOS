import React, { useState } from "react";
import useGameStore from "../../store";
import Modal from "./Modal";
import "./StaffModals.css";

const NegotiationModal = ({ staffId, onClose }) => {
  //const talentPool = useGameStore((state) => state.talentPool || EMPTY_ARRAY);
  const staffMember = useGameStore((state) =>
    state.talentPool.find((s) => s.id === staffId)
  );
  const makeHiringOffer = useGameStore(
    (state) => state.actions.makeHiringOffer
  );

  const [offer, setOffer] = useState(staffMember?.expectedSalary || 0);

  if (!staffMember) return null;

  const handleOffer = () => {
    makeHiringOffer(staffId, offer);
    onClose(); // Close the modal after the offer is made
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Negotiate with ${staffMember.name}`}
    >
      <div className="staff-modal-content negotiation-content">
        <p>
          <strong>Role:</strong> {staffMember.role}
        </p>
        <p>
          <strong>Their asking salary:</strong> $
          {staffMember.expectedSalary.toLocaleString()}/month
        </p>
        <div className="negotiation-form">
          <label htmlFor="salaryOffer">Your Offer:</label>
          <input
            type="number"
            id="salaryOffer"
            value={offer}
            onChange={(e) => setOffer(parseInt(e.target.value, 10))}
            step="100"
          />
          <button className="action-button" onClick={handleOffer}>
            Make Offer
          </button>
        </div>
        <p className="negotiation-tip">
          Tip: A low offer might be rejected or countered. Offering above their
          asking price ensures they join immediately.
        </p>
      </div>
    </Modal>
  );
};

export default NegotiationModal;
