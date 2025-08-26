import React from 'react';
import useGameStore from "../../store";
import { CITY_POLICIES, STATE_POLICIES, FEDERAL_POLICIES } from "../../data";
import "./PassedBillsArchive.css"; // Re-use the same CSS for consistency

const policySets = {
  city: CITY_POLICIES,
  state: STATE_POLICIES,
  national: FEDERAL_POLICIES,
};

const getPolicyDetailsText = (policyInBill, level) => {
  const policySet = policySets[level];
  if (!policySet) return "Invalid level provided.";

  const fullPolicyData = policySet.find(
    (p) => p.id === policyInBill.policyId
  );
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

const FailedBillsArchive = ({ level = 'city' }) => {
  const failedBills = useGameStore((state) => state[level]?.failedBillsHistory || []);

  if (failedBills.length === 0) {
    return (
      <div className="passed-bills-archive-container">
        <p>No failed bills in the archive yet.</p>
      </div>
    );
  }

  return (
    <div className="passed-bills-archive-container">
      {failedBills.map((bill) => (
        <div key={bill.id} className="archive-card failed-bill-card">
          <div className="archive-card-header">
            <h3>{bill.name}</h3>
            <p className="archive-card-subheader">
              Failed on{" "}
              <strong>
                {bill.dateFailed?.month}/{bill.dateFailed?.day}/
                {bill.dateFailed?.year}
              </strong>
              {' | '}Proposed by <strong>{bill.proposerName || 'N/A'}</strong>
            </p>
          </div>

          <div className="bill-contents-section">
            <h4>Bill Contents</h4>
            <ul className="policy-list-archive">
              {(bill.policies || []).map((p) => (
                <li key={p.policyId}>
                  <strong>{p.policyName}</strong>
                  <p className="policy-detail-text">{getPolicyDetailsText(p, level)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="final-vote-tally">
            <div className="vote-tally-item tally-yea">
              <strong>{bill.yeaVotes}</strong>
              <span>Yea</span>
            </div>
            <div className="vote-tally-item tally-nay">
              <strong>{bill.nayVotes}</strong>
              <span>Nay</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FailedBillsArchive;
