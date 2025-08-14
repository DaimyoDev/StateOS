// ui-src/src/components/modals/DonationModal.jsx
import React, { useState, useEffect } from "react";
import useStore from "../../store";
import Modal from "./Modal";
import "./DonationModal.css";

function DonationModal() {
  const isOpen = useStore((state) => state.isDonationModalOpen);
  const entity = useStore((state) => state.donationEntity);
  const campaignFunds = useStore(
    (state) => state.activeCampaign?.politician?.treasury
  );

  const actions = useStore((state) => state.actions);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const cashOnHand = campaignFunds || 0;

  // Reset local state when the modal opens to ensure it's fresh.
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Basic validation to allow only numeric input.
    if (/^\d*$/.test(value)) {
      setAmount(value);
      setError(""); // Clear error on new input
    }
  };

  const handleConfirm = () => {
    const donationAmount = parseInt(amount, 10);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }
    if (donationAmount > cashOnHand) {
      setError("You do not have enough funds for this donation.");
      return;
    }
    actions.confirmDonation(entity.id, donationAmount);
  };

  const handleClose = () => {
    actions.closeDonationModal();
  };

  const quickAmounts = [1000, 5000, 10000, 25000];
  const donationAmountInt = parseInt(amount, 10) || 0;
  const isConfirmDisabled =
    donationAmountInt <= 0 || donationAmountInt > cashOnHand;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Donate to ${entity?.name || "Organization"}`}
      primaryActionText="Confirm Donation"
      onPrimaryAction={handleConfirm}
      secondaryActionText="Cancel"
      onSecondaryAction={handleClose}
      contentClassName="donation-modal-content"
      primaryActionDisabled={isConfirmDisabled} // Pass disabled state to Modal
    >
      <div className="donation-modal-body">
        <div className="donation-current-funds">
          Your Personal Funds: <strong>${cashOnHand.toLocaleString()}</strong>
        </div>
        <div className="donation-input-group">
          <span>$</span>
          <input
            type="text"
            className="donation-amount-input"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            autoFocus
          />
        </div>
        <p className="donation-error-message">{error}</p>
        <div className="donation-quick-amounts">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              className="quick-amount-button menu-button"
              onClick={() => setAmount(String(qa))}
            >
              ${qa.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default DonationModal;
