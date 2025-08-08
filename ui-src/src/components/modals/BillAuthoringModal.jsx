import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./BillAuthoringModal.css";
import { CITY_POLICIES } from "../../data/policyDefinitions";

const BillAuthoringModal = ({ isOpen, onClose }) => {
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

  // State for the new "Save Template" modal
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");

  const filteredAvailablePolicies = useMemo(() => {
    return CITY_POLICIES.filter(
      (p) =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !policiesInBill.some((b) => b.policyId === p.id)
    );
  }, [searchTerm, policiesInBill]);

  const addPolicyToBill = (policy) => {
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

  const handleParameterChange = (policyId, parameterKey, value) => {
    const numericValue = Number(value);
    setPoliciesInBill((currentPolicies) =>
      currentPolicies.map((p) => {
        if (p.policyId === policyId) {
          return {
            ...p,
            chosenParameters: {
              ...p.chosenParameters,
              [parameterKey]: numericValue,
            },
          };
        }
        return p;
      })
    );
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
    onClose();
  };

  const handleSaveTemplate = () => {
    if (policiesInBill.length === 0) {
      addToast({
        message: "Cannot save an empty bill template.",
        type: "error",
      });
      return;
    }
    // Set up and open the new modal instead of using prompt()
    setTemplateNameInput(billName);
    setIsSaveTemplateModalOpen(true);
  };

  const performSaveTemplate = () => {
    if (!templateNameInput.trim()) {
      addToast({ message: "Template name cannot be empty.", type: "error" });
      return;
    }
    saveBillTemplate(templateNameInput, policiesInBill);
    setIsSaveTemplateModalOpen(false); // Close the save modal
  };

  const loadTemplate = (event) => {
    const templateId = event.target.value;
    if (!templateId) {
      setPoliciesInBill([]);
      setBillName("New Legislative Initiative");
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Bill Authoring"
        isLarge={true}
      >
        <div className="bill-authoring-content">
          {/* ... existing bill authoring content ... */}
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

            <div className="current-bill-column">
              <h4>Policies in "{billName}"</h4>
              <ul className="policy-list">
                {policiesInBill.map((p) => {
                  const fullPolicy = CITY_POLICIES.find(
                    (cp) => cp.id === p.policyId
                  );
                  return (
                    <li key={p.policyId} className="policy-item-in-bill">
                      <div className="policy-item-header">
                        <strong>{p.policyName}</strong>
                        <button
                          onClick={() => removePolicyFromBill(p.policyId)}
                          className="button-delete small-button"
                        >
                          &times;
                        </button>
                      </div>
                      {fullPolicy?.isParameterized && (
                        <div className="policy-parameter-config">
                          <label htmlFor={p.policyId}>
                            {fullPolicy.parameterDetails.prompt}
                          </label>
                          <input
                            type="number"
                            id={p.policyId}
                            value={
                              p.chosenParameters[
                                fullPolicy.parameterDetails.key
                              ] || 0
                            }
                            onChange={(e) =>
                              handleParameterChange(
                                p.policyId,
                                fullPolicy.parameterDetails.key,
                                e.target.value
                              )
                            }
                            min={fullPolicy.parameterDetails.min}
                            max={fullPolicy.parameterDetails.max}
                            step={fullPolicy.parameterDetails.step}
                            className="parameter-input"
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
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

      {/* The new modal for saving templates */}
      {isSaveTemplateModalOpen && (
        <Modal
          isOpen={isSaveTemplateModalOpen}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          title="Save Bill Template"
        >
          <div className="save-template-content">
            <label htmlFor="templateName">Template Name:</label>
            <input
              type="text"
              id="templateName"
              className="bill-name-input"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              placeholder="Enter a name for the template"
            />
            <div className="modal-actions">
              <button
                className="menu-button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
              >
                Cancel
              </button>
              <button className="action-button" onClick={performSaveTemplate}>
                Save Template
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default BillAuthoringModal;
