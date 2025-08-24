import React, { useState, useMemo, useEffect } from "react";
import Modal from "./Modal";
import useGameStore from "../../store";
import "./BillAuthoringModal.css";

const BillAuthoringModal = ({ onClose }) => {
  const { proposeBill, saveBillTemplate, addToast } = useGameStore((state) => state.actions);
  const availablePolicies = useGameStore((state) => state.availablePolicies);
  const savedBillTemplates = useGameStore((state) => state.savedBillTemplates || []);
  const playerPolitician = useGameStore((state) => state.activeCampaign.politician);
  const isOpen = useGameStore((state) => state.isBillAuthoringModalOpen);
  const mode = useGameStore((state) => state.billAuthoringMode);
  const targetLaw = useGameStore((state) => state.billAuthoringTargetLaw);

  const [billName, setBillName] = useState("New Legislative Initiative");
  const [policiesInBill, setPoliciesInBill] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLevel, setCurrentLevel] = useState("city");

  useEffect(() => {
    if (isOpen) {
      if (mode === 'amend' && targetLaw) {
        setBillName(`Amendment to: ${targetLaw.name}`);
        setCurrentLevel(targetLaw.level);
        setPoliciesInBill(targetLaw.policies.map(p => ({...p, policyId: p.id, chosenParameters: p.parameters || {}})));
      } else if (mode === 'repeal' && targetLaw) {
        setBillName(`Repeal of: ${targetLaw.name}`);
        setCurrentLevel(targetLaw.level);
        setPoliciesInBill(targetLaw.policies.map(p => ({...p, policyId: p.id, chosenParameters: {}})));
      } else {
        setBillName("New Legislative Initiative");
        setPoliciesInBill([]);
        setCurrentLevel("city");
      }
    } else {
      // Reset form when modal is not open
      setBillName("New Legislative Initiative");
      setPoliciesInBill([]);
      setCurrentLevel("city");
      setSearchTerm("");
    }
  }, [isOpen, mode, targetLaw]);

  // State for the new "Save Template" modal
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");

  const filteredAvailablePolicies = useMemo(() => {
    const policiesForLevel = availablePolicies[currentLevel] || [];
    return policiesForLevel.filter(
      (p) =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !policiesInBill.some((b) => b.policyId === p.id)
    );
  }, [searchTerm, policiesInBill, currentLevel, availablePolicies]);

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

    const policiesForAction = policiesInBill.map((p) => ({
      policyId: p.policyId,
    }));
    const parameterizedPolicy = policiesInBill.find((p) => p.chosenParameters);
    const parametersForAction = parameterizedPolicy
      ? parameterizedPolicy.chosenParameters
      : null;

    proposeBill(
      currentLevel,
      billName,
      policiesForAction,
      playerPolitician.id,
      `${playerPolitician.firstName} ${playerPolitician.lastName}`,
      parametersForAction,
      mode, // 'new', 'amend', 'repeal'
      targetLaw ? targetLaw.id : null
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
        title={mode === 'amend' ? 'Amend Existing Law' : mode === 'repeal' ? 'Repeal Existing Law' : 'Author New Bill'}
        isLarge={true}
      >
        <div className="bill-authoring-content">
          <div className="level-selector-container" style={{ marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '1rem' }}>
            <button onClick={() => setCurrentLevel('city')} className={`level-button ${currentLevel === 'city' ? 'active' : ''}`} disabled={mode !== 'new'}>City</button>
            <button onClick={() => setCurrentLevel('state')} className={`level-button ${currentLevel === 'state' ? 'active' : ''}`} disabled={mode !== 'new'}>State</button>
            <button onClick={() => setCurrentLevel('national')} className={`level-button ${currentLevel === 'national' ? 'active' : ''}`} disabled={mode !== 'new'}>National</button>
          </div>
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
                disabled={mode !== 'new'}
              />
              <ul className="policy-list">
                {filteredAvailablePolicies.map((policy) => (
                  <li key={policy.id} onClick={() => mode === 'new' && addPolicyToBill(policy)} className={mode !== 'new' ? 'disabled' : ''}>
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
                  const policiesForLevel = availablePolicies[currentLevel] || [];
                  const fullPolicy = policiesForLevel.find(
                    (cp) => cp.id === p.policyId
                  );
                  return (
                    <li key={p.policyId} className="policy-item-in-bill">
                      <div className="policy-item-header">
                        <strong>{p.policyName}</strong>
                        <button
                          onClick={() => removePolicyFromBill(p.policyId)}
                          className="button-delete small-button"
                          disabled={mode !== 'new'}
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
                            disabled={mode === 'repeal'}
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
              {mode === 'amend' ? 'Propose Amendment' : mode === 'repeal' ? 'Propose Repeal' : 'Propose Bill'}
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
