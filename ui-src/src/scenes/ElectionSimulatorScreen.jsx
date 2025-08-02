import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../store";

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
import { generateFullCityData } from "../entities/politicalEntities";

const getInitialSetupState = () => ({
  id: `setup-${generateId()}`,
  name: "New Election Scenario",
  selectedCountryId: "USA",
  selectedRegionId: "",
  selectedCityId: "",
  totalPopulation: 1000000,
  electionType: [],
  electionYear: 2024,
  parties: [],
  candidatesByElection: {}, // New structure for candidates
  customCity: null,
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
  const [activeElectionInCandidateTab, setActiveElectionInCandidateTab] =
    useState("");

  // Modals State
  const [isPartyEditorModalOpen, setIsPartyEditorModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [isDeleteSetupModalOpen, setIsDeleteSetupModalOpen] = useState(false);
  const [setupToDelete, setSetupToDelete] = useState(null);
  const [isAddPoliticianModalOpen, setIsAddPoliticianModalOpen] =
    useState(false);
  const [isCityCreatorModalOpen, setIsCityCreatorModalOpen] = useState(false);

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

  const selectedElectionTypesDetails = useMemo(() => {
    return currentSetup.electionType
      .map((id) => availableElectionTypes.find((t) => t.id === id))
      .filter(Boolean);
  }, [currentSetup.electionType, availableElectionTypes]);

  const updateCurrentSetup = useCallback((field, value) => {
    setCurrentSetup((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    const validSelectedTypes = currentSetup.electionType.filter((selectedId) =>
      availableElectionTypes.some(
        (availableType) => availableType.id === selectedId
      )
    );
    if (validSelectedTypes.length !== currentSetup.electionType.length) {
      updateCurrentSetup("electionType", validSelectedTypes);
    }

    if (!validSelectedTypes.includes(activeElectionInCandidateTab)) {
      setActiveElectionInCandidateTab(validSelectedTypes[0] || "");
    }
  }, [
    availableElectionTypes,
    currentSetup.electionType,
    updateCurrentSetup,
    activeElectionInCandidateTab,
  ]);

  const handleSetupFieldChange = (e) => {
    const { name, value, type, options } = e.target;

    if (name === "electionType" && e.target.multiple) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      updateCurrentSetup(name, selectedValues);
      return;
    }

    if (name === "selectedCityId" && value === "_CREATE_NEW_") {
      setIsCityCreatorModalOpen(true);
      updateCurrentSetup("selectedCityId", "");
      return;
    }

    const finalValue = type === "number" ? parseInt(value, 10) || 0 : value;
    updateCurrentSetup(name, finalValue);

    if (name === "selectedCountryId") {
      updateCurrentSetup("selectedRegionId", "");
      updateCurrentSetup("selectedCityId", "");
      updateCurrentSetup("customCity", null);
      updateCurrentSetup("electionType", []);
      updateCurrentSetup("candidatesByElection", {});
    }
    if (name === "selectedRegionId") {
      updateCurrentSetup("selectedCityId", "");
      updateCurrentSetup("customCity", null);
    }
    if (name === "selectedCityId" && value !== "") {
      updateCurrentSetup("customCity", null);
    }
  };

  const handleCreateCity = (cityName) => {
    if (!cityName) {
      actions.addToast({
        id: `city-name-req-${Date.now()}`,
        message: "City name cannot be empty.",
        type: "error",
      });
      return;
    }
    const newCity = generateFullCityData({
      playerDefinedCityName: cityName,
      countryId: currentSetup.selectedCountryId,
      regionId: currentSetup.selectedRegionId,
      populationHint: currentSetup.totalPopulation,
    });
    updateCurrentSetup("customCity", newCity);
    updateCurrentSetup("selectedCityId", "");
    setIsCityCreatorModalOpen(false);
  };

  const handleNewSetup = () => {
    setCurrentSetup(getInitialSetupState());
    setActiveElectionInCandidateTab("");
  };

  const handleSaveSetup = () => {
    const existingSetup = savedElectionSetups.find(
      (s) => s.id === currentSetup.id
    );
    if (existingSetup) actions.updateElectionSetup(currentSetup);
    else actions.saveElectionSetup(currentSetup);
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
        electionType: Array.isArray(setupToLoad.electionType)
          ? setupToLoad.electionType
          : [],
        candidatesByElection: setupToLoad.candidatesByElection || {},
      });
      setActiveElectionInCandidateTab(setupToLoad.electionType?.[0] || "");
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
        popularity: getRandomInt(5, 45),
      };
    }).filter(Boolean);
    updateCurrentSetup("parties", generated);
    updateCurrentSetup("candidatesByElection", {});
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
    const newCandidatesByElection = { ...currentSetup.candidatesByElection };
    Object.keys(newCandidatesByElection).forEach((electionId) => {
      newCandidatesByElection[electionId] = newCandidatesByElection[
        electionId
      ].filter((c) => c.partyId !== partyId);
    });
    updateCurrentSetup("candidatesByElection", newCandidatesByElection);
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

  const handleGenerateCandidatesForRace = useCallback(() => {
    if (!activeElectionInCandidateTab || currentSetup.parties.length === 0) {
      actions.addToast({
        id: `gen-cand-fail-${Date.now()}`,
        message: "Select a race and create parties first.",
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
          party.id
        );
        return pol
          ? {
              ...pol,
              name: `${pol.firstName} ${pol.lastName}`,
              baseScore: pol.polling,
            }
          : null;
      })
      .filter(Boolean);

    const normalizedCandidatesMap = normalizePolling(
      newCandidates,
      currentSetup.totalPopulation,
      true
    );
    const finalCandidates = Array.from(normalizedCandidatesMap.values());

    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: finalCandidates,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeElectionInCandidateTab,
    currentSetup.selectedCountryId,
    currentSetup.parties,
    currentSetup.totalPopulation,
    actions,
    updateCurrentSetup,
  ]);

  const handleAddPoliticiansToRace = (politiciansToAdd) => {
    if (!activeElectionInCandidateTab) {
      actions.addToast({
        id: `add-cand-fail-${Date.now()}`,
        message: "Select a race to add candidates to.",
        type: "error",
      });
      return;
    }
    const currentRaceCandidates =
      currentSetup.candidatesByElection[activeElectionInCandidateTab] || [];
    const newCandidatesForRace = [...currentRaceCandidates];
    politiciansToAdd.forEach((p) => {
      if (!newCandidatesForRace.some((c) => c.id === p.id)) {
        const party = currentSetup.parties.find(
          (party) => party.id === p.partyId
        );
        newCandidatesForRace.push({
          ...p,
          name: `${p.firstName} ${p.lastName}`,
          partyName: party?.name || "Independent",
          partyColor: party?.color || "#888888",
          baseScore: 5,
        });
      }
    });
    const normalized = normalizePolling(
      newCandidatesForRace,
      currentSetup.totalPopulation,
      true
    );
    const finalCandidates = Array.from(normalized.values());

    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: finalCandidates,
    });
    setIsAddPoliticianModalOpen(false);
  };

  const handleRemoveCandidateFromRace = (candidateId) => {
    if (!activeElectionInCandidateTab) return;
    const currentRaceCandidates =
      currentSetup.candidatesByElection[activeElectionInCandidateTab] || [];
    const updatedCandidates = currentRaceCandidates.filter(
      (c) => c.id !== candidateId
    );
    updateCurrentSetup("candidatesByElection", {
      ...currentSetup.candidatesByElection,
      [activeElectionInCandidateTab]: updatedCandidates,
    });
  };

  const runSimulation = useCallback(() => {
    if (
      !currentSetup.electionType ||
      currentSetup.electionType.length === 0 ||
      currentSetup.parties.length === 0
    ) {
      actions.addToast({
        id: `incomplete-setup-${Date.now()}`,
        message: "Please select election types and configure parties.",
        type: "error",
      });
      return;
    }

    let electionCity;
    if (currentSetup.customCity) {
      electionCity = currentSetup.customCity;
    } else if (currentSetup.selectedCityId) {
      const region = availableRegions.find(
        (r) => r.id === currentSetup.selectedRegionId
      );
      electionCity = region?.cities?.find(
        (c) => c.id === currentSetup.selectedCityId
      );
    }

    if (!electionCity) {
      const hasOnlyNonLocal = currentSetup.electionType.every((etId) => {
        const typeDetails = availableElectionTypes.find((t) => t.id === etId);
        return typeDetails && !typeDetails.level.startsWith("local_");
      });
      if (hasOnlyNonLocal) {
        electionCity = {
          name: "N/A",
          population: currentSetup.totalPopulation,
        };
      } else {
        actions.addToast({
          id: `city-error-${Date.now()}`,
          message: "Please select or create a city for local elections.",
          type: "error",
        });
        return;
      }
    }

    const populationForSim =
      electionCity.population || currentSetup.totalPopulation;
    const allSimulations = [];
    const electionRegionName =
      availableRegions.find((r) => r.id === currentSetup.selectedRegionId)
        ?.name || "Region";
    const electionCountryName = selectedCountry?.name || "Country";

    for (const electionTypeId of currentSetup.electionType) {
      const selectedElectionTypeDetails = availableElectionTypes.find(
        (type) => type.id === electionTypeId
      );
      if (!selectedElectionTypeDetails) continue;

      const raceCandidates =
        currentSetup.candidatesByElection[electionTypeId] || [];
      if (raceCandidates.length === 0) {
        actions.addToast({
          id: `no-cands-${electionTypeId}`,
          message: `Skipping "${selectedElectionTypeDetails.displayName}" race: No candidates assigned.`,
          type: "warning",
        });
        continue;
      }

      const normalizedRaceCandidates = normalizePolling(
        raceCandidates,
        populationForSim,
        true
      );
      const candidatesMap = new Map(
        Array.from(normalizedRaceCandidates.values()).map((c) => [c.id, c])
      );

      let officeName = selectedElectionTypeDetails.officeNameTemplate
        .replace(/{cityName}|{cityNameOrMunicipalityName}/g, electionCity.name)
        .replace(
          /{stateName}|{regionName}|{prefectureName}|{provinceName}/g,
          electionRegionName
        )
        .replace("{countryName}", electionCountryName)
        .replace(/{.*?}/g, "")
        .trim();

      const simulatedElection = {
        id: `sim_election_${generateId()}`,
        officeName,
        electoralSystem: selectedElectionTypeDetails.electoralSystem,
        electionDate: { year: currentSetup.electionYear, month: 11, day: 5 },
        candidates: candidatesMap,
        totalEligibleVoters: populationForSim,
        voterTurnoutPercentage: currentSetup.voterTurnout,
        numberOfSeatsToFill: selectedElectionTypeDetails.seatsToFill || 1,
        outcome: { status: "upcoming" },
      };
      allSimulations.push(simulatedElection);
    }

    if (allSimulations.length === 0) {
      actions.addToast({
        id: `no-valid-elections-${Date.now()}`,
        message:
          "No valid elections were created. Check your candidate assignments.",
        type: "error",
      });
      return;
    }

    actions.setIsSimulationMode(true);
    actions.setSimulatedElections(allSimulations);
    actions.navigateTo("ElectionNightScreen");
  }, [
    currentSetup,
    actions,
    availableElectionTypes,
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
                      disabled={!!currentSetup.customCity}
                    >
                      <option value="">Select City</option>
                      <option value="_CREATE_NEW_">
                        -- Create New City --
                      </option>
                      {availableCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {currentSetup.customCity && (
                      <span className="custom-city-display">
                        Using custom city:{" "}
                        <strong>{currentSetup.customCity.name}</strong>
                      </span>
                    )}
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
                    <label>Election Type(s) (Ctrl+Click for multiple):</label>
                    <select
                      name="electionType"
                      multiple={true}
                      value={currentSetup.electionType}
                      onChange={handleSetupFieldChange}
                      disabled={!availableElectionTypes.length}
                      className="multiselect-listbox"
                    >
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
                <h3>Party Configuration</h3>
                {currentSetup.parties.length > 0 ? (
                  <ul className="party-list">
                    {currentSetup.parties.map((p) => (
                      <li key={p.id} className="party-list-item">
                        <div className="party-bar-background">
                          <div
                            className="party-bar-foreground"
                            style={{
                              width: `${p.popularity || 10}%`,
                              backgroundColor: p.color,
                            }}
                          ></div>
                          <div className="party-bar-content">
                            <span className="party-bar-text">
                              {p.name} ({p.ideology})
                            </span>
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
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="help-text">
                    No parties configured. Generate or create parties to begin.
                  </p>
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
                <h3>Candidate Assignment</h3>
                <div className="candidate-race-selector">
                  <label>Manage Candidates For Race:</label>
                  <select
                    value={activeElectionInCandidateTab}
                    onChange={(e) =>
                      setActiveElectionInCandidateTab(e.target.value)
                    }
                    disabled={selectedElectionTypesDetails.length === 0}
                  >
                    <option value="" disabled>
                      -- Select a Race --
                    </option>
                    {selectedElectionTypesDetails.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName || t.id}
                      </option>
                    ))}
                  </select>
                </div>

                {activeElectionInCandidateTab ? (
                  <>
                    {(
                      currentSetup.candidatesByElection[
                        activeElectionInCandidateTab
                      ] || []
                    ).length > 0 ? (
                      <ul className="candidate-list">
                        {(
                          currentSetup.candidatesByElection[
                            activeElectionInCandidateTab
                          ] || []
                        ).map((c) => (
                          <li key={c.id} className="candidate-list-item">
                            <span
                              className="candidate-party-swatch"
                              style={{
                                backgroundColor: c.partyColor || "#888",
                              }}
                            ></span>
                            <span className="candidate-name">{c.name}</span>
                            <span className="candidate-party-name">
                              ({c.partyName})
                            </span>
                            <span className="candidate-poll-score">
                              Poll: {c.polling?.toFixed(1)}%
                            </span>
                            <button
                              className="button-delete small-button"
                              onClick={() =>
                                handleRemoveCandidateFromRace(c.id)
                              }
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="help-text">
                        No candidates assigned to this race yet.
                      </p>
                    )}
                    <div className="candidate-controls">
                      <button
                        className="action-button"
                        onClick={handleGenerateCandidatesForRace}
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
                    </div>
                  </>
                ) : (
                  <p className="help-text">
                    Select one or more election types in the "General" tab, then
                    select a race from the dropdown above to assign candidates.
                  </p>
                )}
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
        isOpen={isCityCreatorModalOpen}
        onClose={() => setIsCityCreatorModalOpen(false)}
        title="Create a New City"
      >
        <CityCreatorModalContent
          onSave={handleCreateCity}
          onCancel={() => setIsCityCreatorModalOpen(false)}
        />
      </Modal>
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
        title="Add Saved Politician to Race"
      >
        <AddPoliticianModalContent
          savedPoliticians={savedPoliticians}
          currentCandidates={
            currentSetup.candidatesByElection[activeElectionInCandidateTab] ||
            []
          }
          parties={currentSetup.parties}
          onAdd={handleAddPoliticiansToRace}
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

const CityCreatorModalContent = ({ onSave, onCancel }) => {
  const [cityName, setCityName] = useState("");

  const handleSave = () => {
    onSave(cityName);
  };

  return (
    <div className="city-creator-modal-content">
      <div className="form-group">
        <label>New City Name:</label>
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="e.g., Springfield"
        />
      </div>
      <div className="modal-actions-override">
        <button className="action-button" onClick={handleSave}>
          Create and Use City
        </button>
        <button className="menu-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

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
    const currentCandidateIds = new Set(
      (currentCandidates || []).map((c) => c.id)
    );
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
