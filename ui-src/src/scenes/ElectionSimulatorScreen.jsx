import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../store";
// import { shallow } from 'zustand/shallow'; // No longer needed for this component

import "./ElectionSimulatorScreen.css";

// Data imports
import { BASE_COUNTRIES_DATA } from "../data/countriesData";
import { IDEOLOGY_DEFINITIONS, BASE_IDEOLOGIES } from "../data/ideologiesData";
import { POLICY_QUESTIONS } from "../data/policyData";
import { ELECTION_TYPES_BY_COUNTRY } from "../data/electionsData";

// Utility imports
import { generateNuancedColor } from "../utils/generalUtils";
import { normalizePolling } from "../General Scripts/PollingFunctions";
import { getRandomElement, getRandomInt, generateId } from "../utils/core";
import {
  calculateIdeologyFromStances,
  generateFullAIPolitician,
  generateNewPartyName,
} from "../entities/personnel";

// Reusable UI components
import Modal from "../components/modals/Modal";

const getInitialSetupState = () => ({
  id: `setup-${generateId()}`,
  name: "New Election Scenario",
  selectedCountryId: "USA",
  selectedRegionId: "",
  selectedCityId: "",
  totalPopulation: 1000000,
  electionType: "",
  electionYear: 2024,
  parties: [],
  candidates: [], // Add candidates to the core setup state
  voterTurnout: 60,
  electorateIdeologyCenter: Object.fromEntries(
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => [
      axis,
      0,
    ])
  ),
  electorateIdeologySpread: Object.fromEntries(
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => [
      axis,
      1,
    ])
  ),
  electorateIssueStances: Object.fromEntries(
    POLICY_QUESTIONS.filter((q) => q.options?.length > 0).map((q) => [q.id, 0])
  ),
});

const ElectionSimulatorScreen = () => {
  const actions = useGameStore((state) => state.actions);
  const savedElectionSetups = useGameStore(
    (state) => state.savedElectionSetups || []
  );
  const savedPoliticians = useGameStore(
    (state) => state.savedPoliticians || []
  );

  const [currentSetup, setCurrentSetup] = useState(getInitialSetupState());
  const [activeSetupTab, setActiveSetupTab] = useState("general");

  // Modals State
  const [isPartyEditorModalOpen, setIsPartyEditorModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [isDeleteSetupModalOpen, setIsDeleteSetupModalOpen] = useState(false);
  const [setupToDelete, setSetupToDelete] = useState(null);
  const [isAddPoliticianModalOpen, setIsAddPoliticianModalOpen] =
    useState(false);

  // Derived state for dynamic dropdowns
  const selectedCountry = useMemo(
    () =>
      BASE_COUNTRIES_DATA.find(
        (c) => c.id === currentSetup.selectedCountryId
      ) || null,
    [currentSetup.selectedCountryId]
  );
  const availableRegions = useMemo(
    () => selectedCountry?.regions || selectedCountry?.provinces || [],
    [selectedCountry]
  );
  const availableCities = useMemo(() => {
    if (!currentSetup.selectedRegionId || !selectedCountry) return [];
    const region = availableRegions.find(
      (r) => r.id === currentSetup.selectedRegionId
    );
    return (
      region?.cities?.map((city) => ({
        id: city.id,
        name: city.name || `City ${city.id}`,
      })) || []
    );
  }, [currentSetup.selectedRegionId, selectedCountry, availableRegions]);
  const availableElectionTypes = useMemo(
    () => ELECTION_TYPES_BY_COUNTRY[currentSetup.selectedCountryId] || [],
    [currentSetup.selectedCountryId]
  );

  const updateCurrentSetup = useCallback((field, value) => {
    setCurrentSetup((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (
      availableElectionTypes.length > 0 &&
      !availableElectionTypes.some(
        (type) => type.id === currentSetup.electionType
      )
    ) {
      updateCurrentSetup("electionType", availableElectionTypes[0].id);
    } else if (
      availableElectionTypes.length === 0 &&
      currentSetup.electionType !== ""
    ) {
      updateCurrentSetup("electionType", "");
    }
  }, [availableElectionTypes, currentSetup.electionType, updateCurrentSetup]);

  const handleSetupFieldChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "number" ? parseInt(value, 10) || 0 : value;
    updateCurrentSetup(name, finalValue);

    if (name === "selectedCountryId") {
      updateCurrentSetup("selectedRegionId", "");
      updateCurrentSetup("selectedCityId", "");
    }
    if (name === "selectedRegionId") {
      updateCurrentSetup("selectedCityId", "");
    }
  };

  // --- Setup Management ---
  const handleNewSetup = () => setCurrentSetup(getInitialSetupState());

  const handleSaveSetup = () => {
    const existingSetup = savedElectionSetups.find(
      (s) => s.id === currentSetup.id
    );
    if (existingSetup) {
      actions.updateElectionSetup(currentSetup);
    } else {
      actions.saveElectionSetup(currentSetup);
    }
    actions.addToast({
      id: `save-success-${Date.now()}`,
      message: `Scenario "${currentSetup.name}" saved!`,
      type: "success",
    });
  };

  const handleLoadSetup = (setupId) => {
    const setupToLoad = savedElectionSetups.find((s) => s.id === setupId);
    if (setupToLoad) {
      setCurrentSetup({
        ...getInitialSetupState(),
        ...setupToLoad,
        candidates: setupToLoad.candidates || [],
      });
    }
  };

  const openDeleteSetupModal = (setup) => {
    setSetupToDelete(setup);
    setIsDeleteSetupModalOpen(true);
  };

  const confirmDeleteSetup = () => {
    if (setupToDelete) {
      actions.deleteElectionSetup(setupToDelete.id);
      if (currentSetup.id === setupToDelete.id) handleNewSetup();
    }
    setIsDeleteSetupModalOpen(false);
    setSetupToDelete(null);
  };

  // --- Party Management ---
  const handleRandomlyGenerateParties = useCallback(() => {
    const numParties = getRandomInt(3, 7);
    const generated = Array.from({ length: numParties }, () => {
      const randomBaseIdeology = getRandomElement([...BASE_IDEOLOGIES]);
      if (!randomBaseIdeology) return null;

      const fullIdeologyDefinition =
        IDEOLOGY_DEFINITIONS[randomBaseIdeology.id];
      const newPartyName = generateNewPartyName(randomBaseIdeology.name);
      const partyColor = generateNuancedColor(randomBaseIdeology.color);
      const ideologyScores = { ...(fullIdeologyDefinition?.idealPoint || {}) };
      const { ideologyName } = calculateIdeologyFromStances(
        null,
        POLICY_QUESTIONS,
        IDEOLOGY_DEFINITIONS,
        ideologyScores
      );

      return {
        id: `party-${generateId()}`,
        name: newPartyName,
        color: partyColor,
        ideology: ideologyName,
        ideologyId: randomBaseIdeology.id,
        ideologyScores,
        popularity: getRandomInt(5, 25),
      };
    }).filter(Boolean);

    updateCurrentSetup("parties", generated);
    updateCurrentSetup("candidates", []);
  }, [updateCurrentSetup]);

  const handleCreateNewParty = () => {
    setEditingParty(null);
    setIsPartyEditorModalOpen(true);
  };

  const handleEditParty = (party) => {
    setEditingParty(party);
    setIsPartyEditorModalOpen(true);
  };

  const handleDeleteParty = (partyId) => {
    updateCurrentSetup(
      "parties",
      currentSetup.parties.filter((p) => p.id !== partyId)
    );
    updateCurrentSetup(
      "candidates",
      currentSetup.candidates.filter((c) => c.partyId !== partyId)
    );
  };

  const handleSaveParty = (partyData) => {
    const { ideologyName, scores } = calculateIdeologyFromStances(
      null,
      POLICY_QUESTIONS,
      IDEOLOGY_DEFINITIONS,
      partyData.ideologyScores
    );
    const [foundId] = Object.entries(IDEOLOGY_DEFINITIONS).find(
      ([, def]) => def.name === ideologyName
    ) || ["centrist"];
    const updatedParty = {
      ...partyData,
      ideology: ideologyName,
      ideologyId: foundId,
      ideologyScores: scores,
    };
    const newParties = partyData.id
      ? currentSetup.parties.map((p) =>
          p.id === partyData.id ? updatedParty : p
        )
      : [
          ...currentSetup.parties,
          { ...updatedParty, id: `party-${generateId()}` },
        ];
    updateCurrentSetup("parties", newParties);
    setIsPartyEditorModalOpen(false);
    setEditingParty(null);
  };

  // --- Candidate Management ---
  const handleGenerateCandidates = useCallback(() => {
    if (currentSetup.parties.length === 0) {
      actions.addToast({
        id: `no-parties-${Date.now()}`,
        message: "Please generate or create parties first.",
        type: "error",
      });
      return;
    }
    const newCandidates = currentSetup.parties
      .map((party) => {
        const pol = generateFullAIPolitician(
          currentSetup.selectedCountryId,
          currentSetup.parties,
          POLICY_QUESTIONS,
          IDEOLOGY_DEFINITIONS,
          party.id,
          null,
          null,
          false,
          currentSetup.electorateIdeologyCenter,
          currentSetup.electorateIdeologySpread,
          currentSetup.electorateIssueStances
        );
        if (!pol || !pol.firstName) return null;
        return {
          ...pol,
          name: `${pol.firstName} ${pol.lastName}`,
          baseScore: pol.polling,
        };
      })
      .filter(Boolean);

    if (newCandidates.length === 0) {
      actions.addToast({
        id: `gen-fail-${Date.now()}`,
        message: "Candidate generation failed. Please try again.",
        type: "error",
      });
      return;
    }

    const normalizedCandidatesMap = normalizePolling(
      newCandidates,
      currentSetup.totalPopulation,
      true
    );

    // --- FIX START ---
    // The previous code was checking `normalized.length`, but `normalizePolling` returns a Map.
    // The correct property to check is `.size`.
    // We also need to convert the Map back to an Array for the component's state.
    if (normalizedCandidatesMap && normalizedCandidatesMap.size > 0) {
      updateCurrentSetup(
        "candidates",
        Array.from(normalizedCandidatesMap.values())
      );
    } else {
      // Fallback in case normalization fails, ensuring candidates are still displayed.
      updateCurrentSetup(
        "candidates",
        newCandidates.map((c) => ({ ...c, polling: c.baseScore || 5 }))
      );
    }
    // --- FIX END ---
  }, [currentSetup, actions, updateCurrentSetup]);

  const handleAddPoliticians = (politiciansToAdd) => {
    const newCandidates = [...currentSetup.candidates];
    politiciansToAdd.forEach((p) => {
      if (!newCandidates.some((c) => c.id === p.id)) {
        const party = currentSetup.parties.find(
          (party) => party.id === p.partyId
        );
        newCandidates.push({
          ...p,
          name: `${p.firstName} ${p.lastName}`,
          partyName: party?.name || "Independent",
          partyColor: party?.color || "#888888",
          baseScore: 5,
        });
      }
    });
    const normalized = normalizePolling(
      newCandidates,
      currentSetup.totalPopulation,
      true
    );
    if (normalized && normalized.size > 0) {
      updateCurrentSetup("candidates", Array.from(normalized.values()));
    }
    setIsAddPoliticianModalOpen(false);
  };

  const handleRemoveCandidate = (candidateId) => {
    updateCurrentSetup(
      "candidates",
      currentSetup.candidates.filter((c) => c.id !== candidateId)
    );
  };

  // --- Electorate ---
  const handleRandomizeElectorateProfile = useCallback(() => {
    const newCenter = {};
    const newSpread = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      newCenter[axis] = parseFloat((getRandomInt(-40, 40) / 10).toFixed(1));
      newSpread[axis] = parseFloat((getRandomInt(1, 40) / 10).toFixed(1));
    });
    const newIssueStances = {};
    POLICY_QUESTIONS.forEach((question) => {
      if (question.options?.length > 0) {
        newIssueStances[question.id] = getRandomInt(-100, 100);
      }
    });
    updateCurrentSetup("electorateIdeologyCenter", newCenter);
    updateCurrentSetup("electorateIdeologySpread", newSpread);
    updateCurrentSetup("electorateIssueStances", newIssueStances);
  }, [updateCurrentSetup]);

  // --- Run Simulation ---
  const runSimulation = useCallback(() => {
    if (
      !currentSetup.electionType ||
      currentSetup.parties.length === 0 ||
      currentSetup.candidates.length === 0
    ) {
      actions.addToast({
        id: `incomplete-setup-${Date.now()}`,
        message: "Please configure an election type, parties, and candidates.",
        type: "error",
      });
      return;
    }

    const selectedElectionTypeDetails = availableElectionTypes.find(
      (type) => type.id === currentSetup.electionType
    );
    if (!selectedElectionTypeDetails) return;

    let officeName = selectedElectionTypeDetails.officeNameTemplate
      .replace(
        "{cityName}",
        availableCities.find((c) => c.id === currentSetup.selectedCityId)
          ?.name || "City"
      )
      .replace(
        "{stateName}",
        availableRegions.find((r) => r.id === currentSetup.selectedRegionId)
          ?.name || "Region"
      )
      .replace("{countryName}", selectedCountry?.name || "Country")
      .replace(/{.*?}/g, "")
      .trim();

    const candidatesMap = new Map(
      currentSetup.candidates.map((c) => [c.id, c])
    );

    const simulatedElection = {
      id: `sim_election_${generateId()}`,
      officeName,
      electoralSystem: selectedElectionTypeDetails.electoralSystem,
      electionDate: { year: currentSetup.electionYear, month: 11, day: 5 },
      candidates: candidatesMap,
      totalEligibleVoters: currentSetup.totalPopulation,
      voterTurnoutPercentage: currentSetup.voterTurnout,
      numberOfSeatsToFill: selectedElectionTypeDetails.seatsToFill || 1,
      outcome: { status: "upcoming" },
    };

    actions.setIsSimulationMode(true);
    actions.setSimulatedElections([simulatedElection]);
    actions.navigateTo("ElectionNightScreen");
  }, [
    currentSetup,
    actions,
    availableElectionTypes,
    availableCities,
    availableRegions,
    selectedCountry,
  ]);

  return (
    <div className="election-simulator-screen-container ui-panel">
      <div className="election-simulator-header">
        <h1 className="tab-title">Election Simulator</h1>
        <button
          className="menu-button"
          onClick={() => actions.navigateTo("MainMenu")}
        >
          Back to Main Menu
        </button>
      </div>

      <div className="simulator-layout">
        <div className="scenario-management-panel">
          <h3>Scenarios</h3>
          <div className="scenario-actions">
            <button className="action-button" onClick={handleNewSetup}>
              New
            </button>
            <button
              className="action-button"
              onClick={handleSaveSetup}
              disabled={!currentSetup.name}
            >
              Save
            </button>
          </div>
          <ul className="scenario-list">
            {savedElectionSetups.map((setup) => (
              <li
                key={setup.id}
                className={`scenario-list-item ${
                  currentSetup.id === setup.id ? "active" : ""
                }`}
              >
                <span
                  className="scenario-name"
                  onClick={() => handleLoadSetup(setup.id)}
                >
                  {setup.name}
                </span>
                <div className="scenario-item-actions">
                  <button
                    className="button-delete small-button"
                    onClick={() => openDeleteSetupModal(setup)}
                  >
                    Del
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="simulation-setup-panel">
          <div className="setup-tabs-header">
            <button
              className={`tab-button ${
                activeSetupTab === "general" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("general")}
            >
              General
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "parties" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("parties")}
            >
              Parties
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "candidates" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("candidates")}
            >
              Candidates
            </button>
            <button
              className={`tab-button ${
                activeSetupTab === "electorate" ? "active" : ""
              }`}
              onClick={() => setActiveSetupTab("electorate")}
            >
              Electorate
            </button>
          </div>

          <div className="setup-tabs-content">
            {activeSetupTab === "general" && (
              <div className="tab-pane general-setup-tab">
                <h3>Configuration for "{currentSetup.name}"</h3>
                <div className="config-grid">
                  <div className="config-group">
                    <label>Scenario Name:</label>
                    <input
                      name="name"
                      type="text"
                      value={currentSetup.name}
                      onChange={handleSetupFieldChange}
                    />
                  </div>
                  <div className="config-group">
                    <label>Country:</label>
                    <select
                      name="selectedCountryId"
                      value={currentSetup.selectedCountryId}
                      onChange={handleSetupFieldChange}
                    >
                      {BASE_COUNTRIES_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.flag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>Region/State:</label>
                    <select
                      name="selectedRegionId"
                      value={currentSetup.selectedRegionId}
                      onChange={handleSetupFieldChange}
                      disabled={!availableRegions.length}
                    >
                      <option value="">Select Region</option>
                      {availableRegions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>City:</label>
                    <select
                      name="selectedCityId"
                      value={currentSetup.selectedCityId}
                      onChange={handleSetupFieldChange}
                      disabled={!availableCities.length}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>Population:</label>
                    <input
                      name="totalPopulation"
                      type="number"
                      value={currentSetup.totalPopulation}
                      onChange={handleSetupFieldChange}
                      min="1"
                    />
                  </div>
                  <div className="config-group">
                    <label>Election Type:</label>
                    <select
                      name="electionType"
                      value={currentSetup.electionType}
                      onChange={handleSetupFieldChange}
                      disabled={!availableElectionTypes.length}
                    >
                      <option value="">Select Type</option>
                      {availableElectionTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.displayName || t.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="config-group">
                    <label>Year:</label>
                    <input
                      name="electionYear"
                      type="number"
                      value={currentSetup.electionYear}
                      onChange={handleSetupFieldChange}
                      min="1900"
                      max="3000"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSetupTab === "parties" && (
              <div className="tab-pane parties-tab">
                {currentSetup.parties.length > 0 && (
                  <ul className="party-list">
                    {currentSetup.parties.map((p) => (
                      <li key={p.id} className="party-list-item">
                        <span
                          className="party-color-swatch"
                          style={{ backgroundColor: p.color }}
                        ></span>
                        {p.name} ({p.ideology})
                        <div className="party-actions">
                          <button
                            className="action-button small-button"
                            onClick={() => handleEditParty(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="button-delete small-button"
                            onClick={() => handleDeleteParty(p.id)}
                          >
                            Del
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="party-controls">
                  <button
                    className="action-button"
                    onClick={handleRandomlyGenerateParties}
                  >
                    Generate Parties
                  </button>
                  <button
                    className="action-button"
                    onClick={handleCreateNewParty}
                  >
                    Create Party
                  </button>
                </div>
              </div>
            )}
            {activeSetupTab === "candidates" && (
              <div className="tab-pane candidates-tab">
                <h4>Simulated Candidates</h4>
                {currentSetup.candidates.length > 0 && (
                  <ul className="candidate-list">
                    {currentSetup.candidates.map((c) => (
                      <li key={c.id} className="candidate-list-item">
                        <span className="candidate-name">{c.name}</span> (
                        {c.partyName}) - Poll: {c.polling?.toFixed(1)}%{" "}
                        <button
                          className="button-delete small-button"
                          onClick={() => handleRemoveCandidate(c.id)}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="candidate-controls">
                  <button
                    className="action-button"
                    onClick={handleGenerateCandidates}
                    disabled={currentSetup.parties.length === 0}
                  >
                    Generate AI Candidates
                  </button>
                  <button
                    className="action-button"
                    onClick={() => setIsAddPoliticianModalOpen(true)}
                    disabled={currentSetup.parties.length === 0}
                  >
                    Add Saved Politician
                  </button>
                  <button
                    className="menu-button"
                    onClick={() => actions.navigateTo("PoliticianCreator")}
                  >
                    Create New Politician
                  </button>
                </div>
              </div>
            )}
            {activeSetupTab === "electorate" && (
              <div className="tab-pane electorate-tab">
                <h3>Electorate Composition</h3>
                <div className="config-group">
                  <label>Expected Voter Turnout (%):</label>
                  <input
                    type="range"
                    name="voterTurnout"
                    min="0"
                    max="100"
                    value={currentSetup.voterTurnout}
                    onChange={handleSetupFieldChange}
                  />
                  <span>{currentSetup.voterTurnout}%</span>
                </div>
                <h5>Ideological Stances:</h5>
                {Object.keys(currentSetup.electorateIdeologyCenter).map(
                  (axis) => (
                    <div
                      key={axis}
                      className="config-group ideology-slider-group"
                    >
                      <label>{axis.replace(/_/g, " ")}:</label>
                      <div className="slider-with-values">
                        <span>Center:</span>
                        <input
                          type="range"
                          min="-4"
                          max="4"
                          step="0.1"
                          value={currentSetup.electorateIdeologyCenter[axis]}
                          onChange={(e) =>
                            setCurrentSetup((p) => ({
                              ...p,
                              electorateIdeologyCenter: {
                                ...p.electorateIdeologyCenter,
                                [axis]: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span>
                          {currentSetup.electorateIdeologyCenter[axis]?.toFixed(
                            1
                          )}
                        </span>
                      </div>
                      <div className="slider-with-values">
                        <span>Spread:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="4"
                          step="0.1"
                          value={currentSetup.electorateIdeologySpread[axis]}
                          onChange={(e) =>
                            setCurrentSetup((p) => ({
                              ...p,
                              electorateIdeologySpread: {
                                ...p.electorateIdeologySpread,
                                [axis]: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span>
                          {currentSetup.electorateIdeologySpread[axis]?.toFixed(
                            1
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
                <div className="electorate-controls">
                  <button
                    className="action-button"
                    onClick={handleRandomizeElectorateProfile}
                  >
                    Randomize Profile
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="setup-action-buttons">
            <button
              className="action-button primary-action-button"
              onClick={runSimulation}
            >
              Run Simulation
            </button>
            <button className="menu-button" onClick={handleNewSetup}>
              Reset Form
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPartyEditorModalOpen}
        onClose={() => setIsPartyEditorModalOpen(false)}
        title={editingParty ? `Edit ${editingParty.name}` : "Create New Party"}
      >
        <PartyEditorModalContent
          party={editingParty}
          onSave={handleSaveParty}
          onCancel={() => setIsPartyEditorModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isAddPoliticianModalOpen}
        onClose={() => setIsAddPoliticianModalOpen(false)}
        title="Add Saved Politician"
      >
        <AddPoliticianModalContent
          savedPoliticians={savedPoliticians}
          currentCandidates={currentSetup.candidates}
          parties={currentSetup.parties}
          onAdd={handleAddPoliticians}
        />
      </Modal>
      <Modal
        isOpen={isDeleteSetupModalOpen}
        onClose={() => setIsDeleteSetupModalOpen(false)}
        title="Confirm Deletion"
        primaryActionText="Delete Scenario"
        onPrimaryAction={confirmDeleteSetup}
        secondaryActionText="Cancel"
        onSecondaryAction={() => setIsDeleteSetupModalOpen(false)}
        primaryActionType="delete"
      >
        <p>
          Are you sure you want to permanently delete the scenario:{" "}
          <strong>{setupToDelete?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
};

// --- MODAL COMPONENTS ---

const PartyEditorModalContent = ({ party, onSave, onCancel }) => {
  const [name, setName] = useState(party?.name || "");
  const [color, setColor] = useState(party?.color || "#000000");
  const [popularity, setPopularity] = useState(party?.popularity || 10);
  const [ideologyScores, setIdeologyScores] = useState(
    party?.ideologyScores || {}
  );

  useEffect(() => {
    const initialIdeology = {};
    Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).forEach((axis) => {
      initialIdeology[axis] =
        party?.ideologyScores?.[axis] !== undefined
          ? party.ideologyScores[axis]
          : 0;
    });
    setIdeologyScores(initialIdeology);
  }, [party]);

  const handleSubmit = () =>
    onSave({ id: party?.id, name, color, popularity, ideologyScores });

  return (
    <div className="party-editor-modal-content">
      <div className="form-group">
        <label>Party Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Party Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Base Popularity (%):</label>
        <input
          type="number"
          min="0"
          max="100"
          value={popularity}
          onChange={(e) => setPopularity(parseInt(e.target.value) || 0)}
        />
      </div>
      <h5>Ideological Stances:</h5>
      {Object.keys(IDEOLOGY_DEFINITIONS.centrist.idealPoint).map((axis) => (
        <div key={axis} className="config-group ideology-slider-group">
          <label>{axis.replace(/_/g, " ")}:</label>
          <input
            type="range"
            min="-4"
            max="4"
            step="0.1"
            value={ideologyScores[axis] || 0}
            onChange={(e) =>
              setIdeologyScores((prev) => ({
                ...prev,
                [axis]: parseFloat(e.target.value),
              }))
            }
          />
          <span>{ideologyScores[axis]?.toFixed(1)}</span>
        </div>
      ))}
      <div className="modal-actions-override">
        <button className="action-button" onClick={handleSubmit}>
          Save Party
        </button>
        <button className="menu-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const AddPoliticianModalContent = ({
  savedPoliticians,
  currentCandidates,
  parties,
  onAdd,
}) => {
  const [selectedPoliticians, setSelectedPoliticians] = useState({});

  const availablePoliticians = useMemo(() => {
    const currentCandidateIds = new Set(currentCandidates.map((c) => c.id));
    return savedPoliticians.filter((p) => !currentCandidateIds.has(p.id));
  }, [savedPoliticians, currentCandidates]);

  const handleSelectionChange = (politicianId, partyId) => {
    setSelectedPoliticians((prev) => ({ ...prev, [politicianId]: partyId }));
  };

  const handleAdd = () => {
    const toAdd = availablePoliticians
      .filter((p) => selectedPoliticians[p.id])
      .map((p) => ({ ...p, partyId: selectedPoliticians[p.id] }));
    onAdd(toAdd);
  };

  return (
    <div className="add-politician-modal">
      {availablePoliticians.length > 0 ? (
        <ul className="politician-selection-list">
          {availablePoliticians.map((p) => (
            <li key={p.id} className="politician-selection-item">
              <span>
                {p.firstName} {p.lastName} ({p.calculatedIdeology})
              </span>
              <select
                onChange={(e) => handleSelectionChange(p.id, e.target.value)}
                value={selectedPoliticians[p.id] || ""}
              >
                <option value="" disabled>
                  Assign to Party
                </option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      ) : (
        <p>No more saved politicians to add.</p>
      )}
      <div className="modal-actions-override">
        <button
          className="action-button"
          onClick={handleAdd}
          disabled={Object.keys(selectedPoliticians).length === 0}
        >
          Add Selected
        </button>
      </div>
    </div>
  );
};

export default ElectionSimulatorScreen;
