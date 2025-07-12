import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store"; // To get available policies
import {
  POLICY_AREAS, // Assuming POLICY_AREAS is exported from policyDefinitions
} from "../../data/policyDefinitions"; // Adjust path
import "./ProposePolicyModal.css"; // Create this CSS file

const ProposePolicyModal = ({ isOpen, onClose, onPropose }) => {
  const availablePolicies = useGameStore(
    (state) => state.availablePoliciesForProposal || []
  ); // From legislationSlice

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState("");

  const policiesByArea = useMemo(() => {
    if (!availablePolicies) return {};
    return availablePolicies.reduce((acc, policy) => {
      const area = policy.area || "General";
      if (!acc[area]) acc[area] = [];
      acc[area].push(policy);
      return acc;
    }, {});
  }, [availablePolicies]);

  const filteredPolicies = selectedArea
    ? policiesByArea[selectedArea] || []
    : [];

  const selectedPolicyDetails = availablePolicies.find(
    (p) => p.id === selectedPolicyId
  );

  const handleSubmit = () => {
    if (selectedPolicyId) {
      onPropose(selectedPolicyId);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Propose New Policy / Ordinance"
      isLarge={true}
    >
      <div className="propose-policy-modal-content">
        <div className="policy-selection-area">
          <div className="form-group">
            <label htmlFor="policyAreaSelect">Filter by Policy Area:</label>
            <select
              id="policyAreaSelect"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedPolicyId("");
              }}
            >
              <option value="">-- Select Area --</option>
              {Object.values(POLICY_AREAS).map(
                (
                  area // Use POLICY_AREAS constant
                ) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                )
              )}
              {/* You might want to add an "All" option or dynamically get categories from policiesByArea keys */}
            </select>
          </div>

          {selectedArea && (
            <div className="form-group">
              <label htmlFor="policySelect">Select Policy:</label>
              <select
                id="policySelect"
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                disabled={!selectedArea}
              >
                <option value="">-- Select Policy --</option>
                {filteredPolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedPolicyDetails && (
          <div className="policy-details-preview">
            <h4>{selectedPolicyDetails.name}</h4>
            <p className="policy-description">
              <em>{selectedPolicyDetails.description}</em>
            </p>
            {selectedPolicyDetails.cost && (
              <div className="policy-cost">
                <strong>Costs:</strong>
                {selectedPolicyDetails.cost.budget !== undefined && (
                  <span>
                    {" "}
                    Budget Impact: $
                    {selectedPolicyDetails.cost.budget.toLocaleString()} /yr
                  </span>
                )}
                {selectedPolicyDetails.cost.politicalCapital !== undefined && (
                  <span>
                    {" "}
                    Political Capital:{" "}
                    {selectedPolicyDetails.cost.politicalCapital}
                  </span>
                )}
              </div>
            )}
            {selectedPolicyDetails.effects &&
              selectedPolicyDetails.effects.length > 0 && (
                <div className="policy-effects-preview">
                  <strong>Potential Effects:</strong>
                  <ul>
                    {selectedPolicyDetails.effects.slice(0, 3).map(
                      (
                        effect,
                        index // Show a few effects
                      ) => (
                        <li key={index}>
                          {effect.type}: {effect.targetStat} by {effect.change}
                          {effect.chance &&
                            ` (${(effect.chance * 100).toFixed(0)}% chance)`}
                        </li>
                      )
                    )}
                    {selectedPolicyDetails.effects.length > 3 && (
                      <li>
                        <em>(And potentially more...)</em>
                      </li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        )}

        <div className="modal-actions">
          <button className="menu-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="action-button"
            onClick={handleSubmit}
            disabled={!selectedPolicyId}
          >
            Propose Policy
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposePolicyModal;
