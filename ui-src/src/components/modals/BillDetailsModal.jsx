import React from "react";
import Modal from "./Modal";
import "./BillDetailsModal.css";
import {
  CITY_POLICIES,
  STATE_POLICIES,
} from "../../data/policyDefinitions";
import { NATIONAL_POLICIES } from "../../data/nationalPolicyDefinitions";

const allPolicies = {
  city: CITY_POLICIES,
  state: STATE_POLICIES,
  national: NATIONAL_POLICIES,
};

const STANCE_CLASSES = {
  leaning_yea: { text: "Leaning Yea", className: "stance-yea" },
  leaning_nay: { text: "Leaning Nay", className: "stance-nay" },
  undecided: { text: "Undecided", className: "stance-undecided" },
};

// Helper function to create readable descriptions
const getPolicyDetailsText = (policyInBill, billLevel) => {
  const policySet = allPolicies[billLevel] || [];
  const fullPolicyData = policySet.find((p) => p.id === policyInBill.policyId);
  if (!fullPolicyData) return "Policy data not found.";

  if (!fullPolicyData.isParameterized || !policyInBill.chosenParameters) {
    return fullPolicyData.description;
  }

  const details = fullPolicyData.parameterDetails;
  const value = policyInBill.chosenParameters[details.key];
  const formattedValue = Math.abs(value).toLocaleString();
  const unit = details.unit === "$" ? "$" : "";
  const unitSuffix = details.unit !== "$" ? ` ${details.unit}` : "";

  if (details.adjustmentType === "increase_or_decrease") {
    if (value > 0) {
      return `Increases the ${
        details.targetBudgetLine || "budget"
      } by ${unit}${formattedValue}${unitSuffix}.`;
    } else if (value < 0) {
      return `Decreases the ${
        details.targetBudgetLine || "budget"
      } by ${unit}${formattedValue}${unitSuffix}.`;
    } else {
      return `Proposes no change to the ${
        details.targetBudgetLine || "budget"
      }.`;
    }
  } else {
    return `Funds this initiative with ${unit}${formattedValue}${unitSuffix}.`;
  }
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
              <li key={p.policyId}>
                <strong>{p.policyName}</strong>
                <p className="policy-detail-text">{getPolicyDetailsText(p, bill.level)}</p>
              </li>
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
                      {s.politicianName || s.name}
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
