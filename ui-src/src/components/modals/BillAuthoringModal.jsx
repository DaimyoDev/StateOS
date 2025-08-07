import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./BillAuthoringModal.css";

const BillAuthoringModal = ({ isOpen, onClose }) => {
  const availablePoliciesForProposal = useGameStore(
    (state) => state.availablePoliciesForProposal
  );
  const savedBillTemplates = useGameStore(
    (state) => state.savedBillTemplates || []
  );
  const { proposeBill, saveBillTemplate, addToast } = useGameStore(
    (state) => state.actions
  );
  const playerPolitician = useGameStore(
    (state) => state.activeCampaign.politician
  );

  const [billName, setBillName] = useState("New Legislative Initiative");
  const [policiesInBill, setPoliciesInBill] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAvailablePolicies = useMemo(() => {
    return availablePoliciesForProposal.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !policiesInBill.some((b) => b.policyId === p.id) // Exclude policies already in the bill
    );
  }, [searchTerm, policiesInBill, availablePoliciesForProposal]);

  const addPolicyToBill = (policy) => {
    // Add policy with default parameters if applicable
    const newPolicyEntry = {
      policyId: policy.id,
      policyName: policy.name,
      chosenParameters: policy.isParameterized
        ? {
            [policy.parameterDetails.key]: policy.parameterDetails.defaultValue,
          }
        : null,
    };
    setPoliciesInBill([...policiesInBill, newPolicyEntry]);
  };

  const removePolicyFromBill = (policyId) => {
    setPoliciesInBill(policiesInBill.filter((p) => p.policyId !== policyId));
  };

  const handlePropose = () => {
    if (policiesInBill.length === 0) {
      addToast({
        message: "A bill must contain at least one policy.",
        type: "error",
      });
      return;
    }
    proposeBill(
      billName,
      policiesInBill,
      playerPolitician.id,
      `${playerPolitician.firstName} ${playerPolitician.lastName}`
    );
    onClose(); // Close modal after proposing
  };

  const handleSaveTemplate = () => {
    if (policiesInBill.length === 0) {
      addToast({
        message: "Cannot save an empty bill template.",
        type: "error",
      });
      return;
    }
    // Ideally, prompt user for template name
    const templateName = prompt(
      "Enter a name for this bill template:",
      billName
    );
    if (templateName) {
      saveBillTemplate(templateName, policiesInBill);
    }
  };

  const loadTemplate = (event) => {
    const templateId = event.target.value;
    if (!templateId) {
      setPoliciesInBill([]);
      return;
    }
    const template = savedBillTemplates.find(
      (t) => t.templateId === templateId
    );
    if (template) {
      setBillName(template.name);
      setPoliciesInBill(template.policies);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bill Authoring"
      isLarge={true}
    >
      <div className="bill-authoring-content">
        <div className="bill-setup-area">
          <input
            type="text"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
            placeholder="Enter Bill Name"
            className="bill-name-input"
          />
          <select onChange={loadTemplate} className="bill-template-select">
            <option value="">Load a Template...</option>
            {savedBillTemplates.map((template) => (
              <option key={template.templateId} value={template.templateId}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bill-columns">
          {/* Column 1: Available Policies */}
          <div className="policy-list-column">
            <h4>Available Policies</h4>
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="policy-list">
              {filteredAvailablePolicies.map((policy) => (
                <li key={policy.id} onClick={() => addPolicyToBill(policy)}>
                  <strong>{policy.name}</strong>
                  <span>{policy.area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Current Bill */}
          <div className="current-bill-column">
            <h4>Policies in "{billName}"</h4>
            <ul className="policy-list">
              {policiesInBill.map((p) => (
                <li key={p.policyId}>
                  <strong>{p.policyName}</strong>
                  {/* TODO: Add parameter configuration UI here */}
                  <button
                    onClick={() => removePolicyFromBill(p.policyId)}
                    className="button-delete small-button"
                  >
                    X
                  </button>
                </li>
              ))}
              {policiesInBill.length === 0 && (
                <p className="empty-bill-text">Add policies from the left.</p>
              )}
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="menu-button" onClick={handleSaveTemplate}>
            Save as Template
          </button>
          <button
            className="action-button"
            onClick={handlePropose}
            disabled={policiesInBill.length === 0}
          >
            Propose Bill
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BillAuthoringModal;
